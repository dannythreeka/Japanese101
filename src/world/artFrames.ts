import art from '../../public/assets/img/journey/manifest.json'
export function atlasFrame(id:string,index:number){
  const asset=art.assets.find(a=>a.id===id)
  const frame=asset?.frameWindows?.[index]
  if(!asset || !frame)throw new Error(`Artwork frame unavailable: ${id}:${index}`)
  return {...frame,width:asset.width,height:asset.height}
}
