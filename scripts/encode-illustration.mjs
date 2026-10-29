/** Packaging only: encode an already-generated PNG at its original size for the offline budget. */
import {readFile,writeFile,mkdir} from 'node:fs/promises'
import {dirname} from 'node:path'
import {createHash} from 'node:crypto'
import {chromium} from '@playwright/test'
const [input,output]=process.argv.slice(2)
if(!input?.endsWith('.png')||!output?.endsWith('.webp'))throw new Error('Usage: node scripts/encode-illustration.mjs input.png output.webp')
const source=await readFile(input),browser=await chromium.launch({headless:true})
try{
 const page=await browser.newPage()
 const result=await page.evaluate(async data=>{const img=new Image();img.src=`data:image/png;base64,${data}`;await img.decode();const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;canvas.getContext('2d').drawImage(img,0,0);return {encoded:canvas.toDataURL('image/webp',.9),width:canvas.width,height:canvas.height}},source.toString('base64'))
 if(!result.encoded.startsWith('data:image/webp;base64,'))throw new Error('WebP encoder unavailable')
 const data=Buffer.from(result.encoded.split(',')[1],'base64')
 if(data.length>2*1024*1024)throw new Error('Still exceeds offline single-file budget; refine source asset')
 await mkdir(dirname(output),{recursive:true});await writeFile(output,data,{flag:'wx'})
 const sha=value=>createHash('sha256').update(value).digest('hex')
 console.log(JSON.stringify({width:result.width,height:result.height,bytes:data.length,sha256:sha(data),originalPngSha256:sha(source),encoding:'WebP quality 0.9, original dimensions, browser Canvas encoder; no composition changes'},null,2))
}finally{await browser.close()}
