/** Keep the link and blob alive while the browser asynchronously starts its download. */
export function downloadJSON(value:unknown,fileName:string):void{
  const serialized=JSON.stringify(value,null,2)
  if(serialized===undefined)throw new Error('Nothing to export')
  const url=URL.createObjectURL(new Blob([serialized],{type:'application/json'}))
  const link=document.createElement('a');link.href=url;link.download=fileName;link.hidden=true
  const cleanup=()=>{link.remove();URL.revokeObjectURL(url)}
  try{document.body.append(link);link.click();setTimeout(cleanup,1000)}
  catch(error){cleanup();throw error}
}
