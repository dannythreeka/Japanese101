import kana from '../data/kana.json'
const labels:Record<string,{zh:string;ja:string}>={
  'K-SCRIPT':{zh:'漢字的讀音與字形',ja:'かんじのよみとかたち'},'V-CONTEXT':{zh:'情境中的詞義',ja:'ぶんにあうことば'},'V-PARA':{zh:'相近意思的表達',ja:'にたいみのことば'},
  'R-SHORT':{zh:'短文理解',ja:'みじかいぶんしょう'},'R-MID':{zh:'跨句理解',ja:'ぶんをつなげてよむ'},'R-INFO':{zh:'從資料找資訊',ja:'じょうほうをさがす'},
  'L-TASK':{zh:'聽懂要做的事',ja:'きいてすることをえらぶ'},'L-KEY':{zh:'聽懂關鍵資訊',ja:'だいじなことばをきく'},'L-EXPR':{zh:'符合情境的表達',ja:'ばめんにあうこたえ'},'L-RESP':{zh:'回應聽到的話',ja:'かいわへのこたえ'},
  G04:{zh:'依距離指出物品',ja:'これ・それ・あれ'},G05:{zh:'指出哪一件物品',ja:'この・その・あの'},G06:{zh:'說明物品的主人',ja:'もののもちぬし'},
  G01:{zh:'介紹自己的身分',ja:'じぶんのみぶんをしょうかい'},G02:{zh:'詢問對方的身分',ja:'みぶんをたずねる'},G03:{zh:'表達相同的身分',ja:'おなじみぶんをつたえる'},
}
export const skillLabel=(skill:string,lang:'zh'|'ja')=>{
  const match=/^KANA-(HIRA|KATA):(.+)$/.exec(skill);const glyph=match&&kana.kana.find(k=>k.id===match[2]);
  if(match&&glyph)return `${match[1]==='HIRA' ? lang==='zh'?'平假名':'ひらがな':lang==='zh'?'片假名':'カタカナ'} ${match[1]==='HIRA'?glyph.hiragana:glyph.katakana}`
  return labels[skill]?.[lang] ?? skill
}
