import {u01} from '../../content/packs/u01'
import {MOCK_BLUEPRINT_VERSION,MOCK_SECTIONS,type MockPaperId} from '../blueprint'
import type {MockPaper} from '../contracts'
/** Synthetic structural fixtures only. Never registered as playable content or counted in authored inventory. */
export function fixture(id:MockPaperId):MockPaper{
  const paper:MockPaper={id,version:'test-fixture',blueprintVersion:MOCK_BLUEPRINT_VERSION,title:'TEST ONLY',reviewStatus:'DRAFT',reviewer:null,reviewedAt:null,questions:[],sections:[],audio:[]}
  for(const spec of MOCK_SECTIONS){
    const questionIds:string[]=[]
    for(const [type,count] of Object.entries(spec.types))for(let n=0;n<count;n++){
      const q=structuredClone(u01.questions[0]);q.id=`${id}-${type}-${n}`;q.itemId=q.id;q.unitId=id;q.itemFamilyId=`test:${q.id}`
      q.partition='mock';q.typeId=type;q.primarySkillId='G01';q.skillIds=['G01'];q.teachingIds=u01.teaching.filter(c=>c.skillIds.includes('G01')).map(c=>c.id)
      q.prompt=`Synthetic fixture ${q.id}`;q.promptJa=`テスト ${q.id}`;q.explanationJa='テスト';q.difficulty=1;q.hintPolicy='none';q.source='Unit test synthetic fixture, not authored curriculum';q.kind='choice';q.audioPolicy='optional'
      if(['T08','T09','T10'].includes(type)){q.kind='reading';q.material=`TEST MATERIAL ${q.id}`}
      if(spec.id==='listening'){
        q.kind='audio';q.audioPolicy='required';q.audioSrc=`/assets/audio/mock/${id.toLowerCase()}/${q.id}.wav`
        paper.audio.push({id:q.id,src:q.audioSrc,script:`TEST SCRIPT ${q.id}`,sha256:'a'.repeat(64),scriptSha256:'b'.repeat(64),bytes:100,durationSeconds:1,credit:'TEST ONLY NO REAL AUDIO',roles:['test'],reviewStatus:'DRAFT'})
      }
      questionIds.push(q.id);paper.questions.push(q)
    }
    paper.sections.push({id:spec.id,questionIds})
  }
  return paper
}
