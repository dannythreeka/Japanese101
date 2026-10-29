/** Teaching only: assessment renderers never call this furigana helper. */
export default function JapaneseText({text}: {text:string}){
  const readings:Record<string,string>={'日本':'にほん','私':'わたし','人':'ひと','日':'ひ','本':'ほん','名':'な'}
  return <span lang="ja">{text.split(/(日本|私|人|日|本|名)/).map((part,index)=>readings[part] ? <ruby key={index}>{part}<rt>{readings[part]}</rt></ruby>:part)}</span>
}
