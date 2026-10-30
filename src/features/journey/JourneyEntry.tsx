import {useSearchParams} from 'react-router-dom'
import {StatePanel} from '../../components/ui/journey-ui'
import {packCatalog} from '../../content/packs/loader'
import {usePack} from './usePack'
import JourneyScreen from './JourneyScreen'

export default function JourneyEntry(){
  const [params,setParams]=useSearchParams()
  const id=params.get('unit') ?? 'U01'
  const {pack,error,retry}=usePack(id)
  if(!packCatalog.some(p=>p.id===id))return <main className="journey journey-shell"><StatePanel state="retryable-error" title="找不到這份教材 / きょうざいがありません" action="返回小鎮 / まちへ" onAction={()=>setParams({})}/></main>
  if(!pack)return <main className="journey journey-shell"><StatePanel state={error?'retryable-error':'loading'} title={error?'教材暫時無法載入 / よみこめません':'正在準備教材 / きょうざいをじゅんびしています'} action={error?'重新載入教材 / よみこみなおす':undefined} onAction={error?retry:undefined}/></main>
  return <JourneyScreen key={pack.id} pack={pack}/>
}
