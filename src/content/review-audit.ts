export interface ReviewTarget {id:string;kind:string;sha256:string;version?:string}
export interface ReviewRecord extends ReviewTarget {status?:string;result?:string;reviewer?:string|null;reviewedAt?:string|null}
/** Checks declared metadata. Only an actual qualified reviewer can supply the review itself. */
export function auditReviews(targets:readonly ReviewTarget[],records:readonly ReviewRecord[],options:{legacy?:boolean;author?:string}={}){
  return targets.map(target=>{
    const matches=records.filter(r=>r.id===target.id&&r.kind===target.kind),record=matches[0],problems:string[]=[]
    if(!record)problems.push('MISSING_RECORD')
    else{
      if(matches.length!==1)problems.push('DUPLICATE_RECORD')
      if(record.sha256!==target.sha256)problems.push('STALE_HASH')
      if(target.version&&record.version!==target.version)problems.push('STALE_VERSION')
      if((options.legacy?record.result:record.status)!==(options.legacy?'PASS':'APPROVED'))problems.push('NOT_APPROVED')
      const reviewer=typeof record.reviewer==='string'?record.reviewer.trim():''
      if(!reviewer)problems.push('MISSING_REVIEWER')
      if(reviewer&&options.author&&reviewer.toLowerCase()===options.author.toLowerCase())problems.push('AUTHOR_REVIEW')
      if(typeof record.reviewedAt!=='string'||!Number.isFinite(Date.parse(record.reviewedAt)))problems.push('INVALID_REVIEW_DATE')
    }
    return {...target,declaredResult:record?(options.legacy?record.result:record.status)??null:null,metadataValid:problems.length===0,problems}
  })
}
