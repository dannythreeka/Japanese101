import {useEffect,useRef,useState} from 'react'
import {BackupService,type RestorePreview} from '../../backup/service'
import {BackupError} from '../../backup/schema'
import {availablePacks} from '../../content/packs/registry'
import {getActiveProfileId,setActiveProfileId} from '../../db'
import {useAppStore} from '../../store/useAppStore'
import {Button,Dialog,StatePanel} from '../../components/ui/journey-ui'
import '../journey/journey.css'
import './full-backup.css'
import AppUpdate from './AppUpdate'

export default function FullBackup(){
  const lang=useAppStore(s=>s.uiLang),ja=lang==='ja',say=(zh:string,jp:string)=>ja?jp:zh
  const [service]=useState(()=>new BackupService()),[preview,setPreview]=useState<RestorePreview|null>(null)
  const [approved,setApproved]=useState<string[]>([]),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState(false)
  const [restored,setRestored]=useState<{activeProfileId:string|null}|null>(null),[fileName,setFileName]=useState('')
  const generation=useRef(0),pending=useRef(false)
  useEffect(()=>()=>{generation.current++},[])
  const errorText=(e:unknown)=>{
    const code=e instanceof BackupError?e.code:''
    if(code==='local-data-changed')return say('預覽後，本機紀錄有變動。請重新選檔並核對預覽；尚未還原。','プレビューのあとにきろくがかわりました。ファイルをえらびなおしてください。まだふくげんしていません。')
    if(['preview-file-changed','preview-expired'].includes(code))return say('預覽已失效，請重新選擇備份檔。','プレビューをつくりなおしてください。')
    if(code==='replacement-not-approved')return say('請先確認要取代哪些現有玩家。原紀錄尚未變更。','おきかえるプレイヤーをかくにんしてください。きろくはかわっていません。')
    if(code==='cross-player-id-collision')return say('這份檔案與其他玩家的紀錄衝突，不能還原。原紀錄已保留。','ほかのプレイヤーのきろくとぶつかるため、ふくげんできません。もとのきろくはのこっています。')
    if(code==='file-too-large')return say('備份檔超過25 MB，無法讀取。原紀錄尚未變更。','ファイルが25 MBをこえています。もとのきろくはかわっていません。')
    if(code)return say('這份檔案不是可還原的完整備份，或內容已損壞。請選擇由「匯出完整備份」下載的檔案；原紀錄尚未變更。','ふくげんできるファイルではないか、データがこわれています。「すべてのバックアップ」からほぞんしたファイルをえらんでください。もとのきろくはかわっていません。')
    return say('暫時無法完成，原有資料已保留。請確認瀏覽器有可用儲存空間後重試。','しょりできませんでした。もとのデータはのこっています。あきようりょうをかくにんして、もういちどためしてください。')
  }
  async function download(){
    if(pending.current)return;pending.current=true;setBusy(true);setError(false);setMessage('');const token=++generation.current
    try{
      const backup=await service.export(Object.fromEntries(availablePacks.map(p=>[p.id,p.version])),getActiveProfileId())
      if(token!==generation.current)return
      const url=URL.createObjectURL(new Blob([JSON.stringify(backup,null,2)],{type:'application/json'})),a=document.createElement('a')
      a.href=url;a.download=`Japanese101-full-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)
      setMessage(say('完整備份已下載。檔案包含玩家與學習紀錄，請由家長妥善保存。','すべてのバックアップをほぞんしました。ほごしゃがたいせつにほかんしてください。'))
    }catch(e){if(token===generation.current){setError(true);setMessage(errorText(e))}}finally{pending.current=false;if(token===generation.current)setBusy(false)}
  }
  async function choose(file:File|undefined){
    if(!file||pending.current)return;pending.current=true;setBusy(true);setError(false);setMessage('');setPreview(null);setApproved([]);setFileName(file.name);const token=++generation.current
    try{if(file.size>25*1024*1024)throw new BackupError('file-too-large');const next=await service.preview(await file.text());if(token===generation.current)setPreview(next)}
    catch(e){if(token===generation.current){setError(true);setMessage(errorText(e))}}finally{pending.current=false;if(token===generation.current)setBusy(false)}
  }
  async function restore(){
    if(!preview||pending.current)return;pending.current=true;setBusy(true);setError(false);setMessage('');const token=++generation.current
    try{const result=await service.restore(preview,approved);if(token===generation.current){setRestored(result);setPreview(null)}}
    catch(e){if(token===generation.current){setError(true);setMessage(errorText(e));if(e instanceof BackupError&&['local-data-changed','preview-file-changed','preview-expired'].includes(e.code)){setPreview(null);setApproved([])}}}
    finally{pending.current=false;if(token===generation.current)setBusy(false)}
  }
  function reopen(){
    try{if(restored?.activeProfileId)setActiveProfileId(restored.activeProfileId);window.location.reload()}
    catch{setMessage(say('還原已完成。請重新整理頁面，開啟已保存的紀錄。','ふくげんはかんりょうしました。ページをよみこみなおしてください。'))}
  }
  const replacements=preview?.players.filter(p=>p.replaces)??[]
  const canRestore=!!preview&&!preview.globalCollisions.length&&replacements.every(p=>approved.includes(p.id))&&!busy
  return <><section className="journey journey-card journey-stack full-backup" aria-labelledby="full-backup-title" aria-busy={busy}>
    <h2 id="full-backup-title">{say('完整備份與還原','すべてのバックアップとふくげん')}</h2>
    <p>{say('包含這個瀏覽器的所有玩家、學習紀錄、冒險進度、裝備與模擬紀錄。下載檔案後，可在另一台裝置的家長區還原。','このブラウザーのすべてのプレイヤー、まなび、ぼうけん、そうび、もぎテストをほぞんします。ほかのたんまつのほごしゃエリアでふくげんできます。')}</p>
    <Button disabled={busy||!!restored} onClick={()=>{void download()}}>{say('匯出完整備份','すべてのバックアップ')}</Button>
    <label className="journey-stack">{say('選擇完整備份檔','バックアップファイルをえらぶ')}
      <input type="file" accept="application/json,.json" disabled={busy||!!restored} style={{maxWidth:'100%',minHeight:64,padding:12,border:'1px solid #8ca0ad',borderRadius:12}} onChange={e=>{const file=e.target.files?.[0];e.target.value='';void choose(file)}}/>
    </label>
    <p>{say('選檔只會產生預覽，還不會修改資料。麥克風權限不會隨備份搬到新裝置。','ファイルをえらぶだけでは、データはかわりません。マイクのきょかは、べつのたんまつにうつりません。')}</p>
    {busy&&<p role="status">{say('正在處理，請稍候…','しょりしています…')}</p>}
    {message&&<p role={error?'alert':'status'}>{message}</p>}
    {preview&&<div className="journey-stack">
      <h3>{say('還原預覽','ふくげんのプレビュー')}</h3><p style={{overflowWrap:'anywhere'}}>{fileName}</p>
      <ul>{preview.players.map(p=><li key={p.id} style={{marginBottom:12,overflowWrap:'anywhere'}}>{p.name} · {p.records}{say('筆紀錄','けん')} · {p.replaces?say(`將取代本機「${p.currentName}」的紀錄`,`このたんまつの「${p.currentName}」のきろくをおきかえます`):say('新增玩家','あたらしいプレイヤー')}</li>)}</ul>
      <p>{say(`舊版未歸屬紀錄 ${preview.legacySharedRecords} 筆；歷史備份 ${preview.archiveRecords} 份。這些資料不會算到任何孩子的能力。`,`わりあてのないふるいきろく ${preview.legacySharedRecords} けん、りれき ${preview.archiveRecords} けん。こどものせいせきにはくわえません。`)}</p>
      {preview.globalCollisions.length>0&&<StatePanel state="storage-error" title={say('與其他玩家的紀錄衝突，無法還原','ほかのプレイヤーのきろくとぶつかっています')}/>}
      {replacements.length>0&&<p>{say('取代前會保留原紀錄的歷史備份；仍建議先匯出目前的完整備份。需確認所有列出的取代項目才能還原；其他玩家不受影響。','おきかえるまえのきろくはりれきにのこします。いまのバックアップもほぞんしてください。ひょうじされたすべてのおきかえをかくにんしてください。ほかのプレイヤーはかわりません。')}</p>}
      {replacements.map(p=><label key={p.id} style={{display:'flex',alignItems:'center',gap:12,minHeight:64,padding:12,border:'1px solid #8ca0ad',borderRadius:12}}><input type="checkbox" disabled={busy} checked={approved.includes(p.id)} onChange={e=>setApproved(old=>e.target.checked?[...old,p.id]:old.filter(id=>id!==p.id))} style={{width:24,height:24,flexShrink:0}}/>{say(`我確認以備份「${p.name}」取代本機「${p.currentName}」的紀錄`,`バックアップの「${p.name}」で、このたんまつの「${p.currentName}」をおきかえます`)}</label>)}
      <div className="journey-actions"><Button disabled={!canRestore} onClick={()=>{void restore()}}>{say('確認還原','かくにんしてふくげん')}</Button><Button variant="quiet" disabled={busy} onClick={()=>{setPreview(null);setApproved([]);setMessage('')}}>{say('取消，不修改資料','キャンセル')}</Button></div>
    </div>}
    <Dialog open={!!restored} title={say('資料已還原','ふくげんしました')} closeLabel={say('重新開啟','ひらきなおす')} onClose={reopen}>
      <p>{say('紀錄已保存。重新開啟後，請再次輸入家長PIN以查看報告。','きろくをほぞんしました。ひらきなおしてから、ほごしゃPINをいれてください。')}</p>
      <Button onClick={reopen}>{say('重新開啟學習紀錄','まなびのきろくをひらく')}</Button>
    </Dialog>
  </section><AppUpdate/></>
}
