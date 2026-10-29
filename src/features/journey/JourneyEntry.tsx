import {useSearchParams} from 'react-router-dom'
import {StatePanel} from '../../components/ui/journey-ui'
import {findPack} from '../../content/packs/registry'
import JourneyScreen from './JourneyScreen'

export default function JourneyEntry(){
  const [params,setParams]=useSearchParams()
  const id=params.get('unit') ?? 'U01'
  const pack=findPack(id)
  if(!pack)return <main className="journey journey-shell"><StatePanel state="retryable-error" title="找不到這份教材 / きょうざいがありません" action="返回小鎮 / まちへ" onAction={()=>setParams({})}/></main>
  return <JourneyScreen key={pack.id} pack={pack}/>
}
