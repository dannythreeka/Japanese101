import { useState } from 'react'
import { getLegacySharedBackup } from '../db'
import {downloadJSON} from '../lib/downloadJSON'
export default function LegacyBackup() {
  const [message,setMessage]=useState('舊版共用紀錄保留備份，未自動分配給任何孩子，也不計入目前能力。')
  async function download() {
    try {
      const backup=await getLegacySharedBackup()
      if(!backup){setMessage('此瀏覽器沒有舊版資料遷移備份。');return}
      downloadJSON(backup,'Japanese101-legacy-shared-backup.json')
      setMessage('備份已匯出。內含舊版學習資料，請由家長妥善保存。')
    }catch{setMessage('暫時無法匯出，原始資料仍保留。請重試。')}
  }
  return <section className="rounded-2xl bg-white p-5"><h2 className="text-xl font-bold">舊版資料備份</h2><p role="status">{message}</p><button className="min-h-16 px-6" onClick={()=>{void download()}}>匯出舊版共用備份</button></section>
}
