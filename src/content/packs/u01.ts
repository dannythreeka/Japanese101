import raw from './u01.json'
import { parseUnitPack } from '../contracts'
export const u01 = parseUnitPack(raw)
export const u01Question=(id:string)=>{
  const question=u01.questions.find(q=>q.id===id)
  if(!question)throw new Error('Question not in this unit version')
  return question
}
