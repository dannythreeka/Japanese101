import type {Question} from '../content/contracts'
import type {MockPaperId,MockSectionId} from './blueprint'
export interface MockAudio {
  id:string;src:string;script:string;sha256:string;scriptSha256:string;bytes:number;durationSeconds:number
  credit:string;roles:string[];reviewStatus:'DRAFT'|'APPROVED'
}
export interface MockPaper {
  id:MockPaperId;version:string;blueprintVersion:string;title:string
  reviewStatus:'DRAFT'|'APPROVED';reviewer:string|null;reviewedAt:string|null
  questions:Question[]
  sections:{id:MockSectionId;questionIds:string[]}[]
  audio:MockAudio[]
}
/** Metadata gate only: actual reviewer identity, hashes and source files must also pass the release audit. */
export function hasApprovedMockMetadata(paper:MockPaper):boolean{
  return paper.reviewStatus==='APPROVED'&&!!paper.reviewer?.trim()&&paper.reviewer.trim().toLowerCase()!=='codex'&&!!paper.reviewedAt&&Number.isFinite(Date.parse(paper.reviewedAt))&&paper.questions.length===80&&paper.questions.every(q=>q.reviewStatus==='APPROVED')&&paper.audio.length>0&&paper.audio.every(a=>a.reviewStatus==='APPROVED')
}
