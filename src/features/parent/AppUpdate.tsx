import {useSyncExternalStore} from 'react'
import {checkAppUpdate,subscribeUpdates,updateSnapshot} from '../../lib/appUpdates'
import {useAppStore} from '../../store/useAppStore'
import {Button} from '../../components/ui/journey-ui'
export default function AppUpdate(){
  const state=useSyncExternalStore(subscribeUpdates,updateSnapshot),ja=useAppStore(s=>s.uiLang)==='ja'
  const text=ja?{
    idle:'こうしんをかくにんできます。',checking:'こうしんをかくにんしています…',ready:'あたらしいバージョンのじゅんびができました。まなびをおえ、このアプリのすべてのタブとウィンドウをとじてから、ひらきなおしてください。',current:'いまは、つかえるあたらしいバージョンはありません。',error:'こうしんをかくにんできませんでした。つうしんをかくにんして、もういちどためしてください。きろくはのこっています。',unsupported:'このブラウザーではオフラインこうしんをつかえません。'
  }:{idle:'可檢查是否有新版本。',checking:'正在檢查新版本…',ready:'新版本已準備好。請結束本次學習，關閉這個應用程式的所有分頁與視窗，再重新開啟。',current:'目前沒有可用的新版本。',error:'暫時無法檢查更新。請確認連線後重試，學習紀錄仍保留。',unsupported:'這個瀏覽器不支援離線版本更新。'}
  return <section className="journey journey-card journey-stack full-backup" aria-labelledby="app-update-title"><h2 id="app-update-title">{ja?'アプリのこうしん':'應用程式更新'}</h2><p role="status">{text[state]}</p><p>{ja?'まなびのとちゅうでページをひらきなおしません。こうしんのためにきろくをけすひつようはありません。':'作答途中不會自動重新載入。版本更新不需要清除學習紀錄；更新前也可先匯出完整備份。'}</p><Button disabled={state==='checking'||state==='unsupported'} onClick={()=>{void checkAppUpdate()}}>{ja?'こうしんをかくにん':'檢查新版本'}</Button></section>
}
