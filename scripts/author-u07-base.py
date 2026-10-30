"""Original shopping-number sources; the fictional shop does not use real money or purchases."""
import json
from pathlib import Path
from content_authoring import DraftUnit

def make_unit():
 u=DraftUnit('U07','購物數量：小鎮商店的訂單');p=u.pack
 words=[('かう','買'),('うる','賣'),('てんいん','店員'),('きゃく','客人'),('いくら','多少錢'),('いくつ','幾個'),('えん','日圓的單位；本課為故事標價'),('ひゃく','一百'),('せん','一千'),('おつり','找回的零錢'),('さいふ','錢包'),('ふくろ','袋子'),('レジ','收銀台／收銀機'),('おかね','錢'),('ひとつ','一個'),('ふたつ','兩個'),('みっつ','三個'),('よっつ','四個'),('いつつ','五個'),('むっつ','六個'),('ななつ','七個'),('やっつ','八個'),('ここのつ','九個'),('とお','十個'),('ぜんぶ','全部')]
 p['vocabulary']=[dict(id=f'U07-V{i:02}',text=t,reading=t,meaning=m) for i,(t,m) in enumerate(words,1)]
 p['kanji']=[dict(id=f'U07-K{i:02}',text=t,reading=r,meaning=m) for i,(t,r,m) in enumerate([('一','いち','一'),('二','に','二'),('三','さん','三'),('四','よん','四；本課單讀よん'),('五','ご','五')],1)]
 p['grammar']=[dict(id=g,title=t,prerequisites=['K-HIRA',dep]) for g,t,dep in [('G19','一般物品數量：ひとつ～とお','G18'),('G20','本／枚／冊：依物品選助數詞','G19'),('G21','いくら／いくつ：價格與數量','G20')]]
 for n,(title,jp) in enumerate([('商店裡的人與動作','みせのひととすること'),('價格與找錢','ねだんとおつり'),('買物用具與一個','かいものとひとつ'),('兩個到六個','ふたつからむっつ'),('七個到十個與全部','ななつからとお')],1):
  vs=p['vocabulary'][(n-1)*5:n*5];body='\n'.join(f"{v['text']}：{v['meaning']}" for v in vs)
  if n==1:body+='\n客人買かいます，店員賣うります。同一筆交易的動作要分清楚人物。いくら問價格，不是問人數。'
  if n==2:body+='\n百円＝ひゃくえん、千円＝せんえん。おつり是付款後找回的錢，與商品的售價不同。本課只讀虛構標價，不需要付款。'
  if n==3:body+='\nさいふ裝錢，ふくろ裝買的東西；レジ是結帳處。ひとつ的數量是一個。'
  if n==4:body+='\nふたつ・みっつ・よっつ・いつつ・むっつ。みっつ、よっつ、むっつ有小っ，發音要短暫停住；不是單獨數字さん／よん／ろく後直接加つ。'
  if n==5:body+='\nななつ・やっつ・ここのつ・とお。十個讀とお，後面不再加つ；ぜんぶ表示全部，不保證數量是十。'
  id=u.teach(f'words-{n}',title,jp,body,'ことばとかずをたしかめましょう。',vs[0]['text'],vs[0]['meaning'],['V-CONTEXT','V-PARA','K-HIRA','K-KATA'],'。'.join(v['reading'] for v in vs)+'。',vocabularyIds=[v['id'] for v in vs]);u.wordcards.append(id)
 u.teach('kanji','讀懂數量的一到五','いちからごのかんじ','一＝いち、二＝に、三＝さん、四＝よん、五＝ご。\n單獨數字與助數詞的讀法可能不同：一（いち），一つ（ひとつ），一本（いっぽん）。不是每個字在任何詞裡都用同一讀音。\n本課四單讀よん；四枚＝よんまい、四冊＝よんさつ。','一、二、三、四、五。かぞえかたで、よみかたがかわることがあります。','一、二、三、四、五','一、二、三、四、五。',['K-SCRIPT'],'いち。に。さん。よん。ご。ひとつ。いっぽん。よんまい。よんさつ。',kanjiIds=[k['id'] for k in p['kanji']],prerequisites=u.wordcards)
 u.teach('G19','數一般物品','ひとつからとお','一般物品可用ひとつ、ふたつ、みっつ、よっつ、いつつ、むっつ、ななつ、やっつ、ここのつ、とお。\nりんごを三つください＝請給我三個蘋果。數量三つ放在物品を之後、ください之前。\n不要把三つ讀成さんつ，也不要把十個說成じゅうつ。\n本課用つ數一般物品，不用它數人；一個人仍是ひとり。','りんごをみっつください。ひとつ、ふたつ、みっつ、よっつ、いつつ、むっつ、ななつ、やっつ、ここのつ、とお。','りんごを 三つ ください。','請給我三個蘋果。',['G19'],'りんごをみっつください。パンをふたつください。ひとつ、ふたつ、みっつ、よっつ、いつつ、むっつ、ななつ、やっつ、ここのつ、とお。',grammarIds=['G19'],prerequisites=['U07-teach-kanji'])
 u.teach('G20','依物品選數法','ほん・まい・さつ','長條物品用本（ほん），例如鉛筆；薄平物品用枚（まい），例如紙；裝訂的書本用冊（さつ）。這些是本課句型的助數詞。\n鉛筆：一本いっぽん、二本にほん、三本さんぼん、四本よんほん、五本ごほん、六本ろっぽん、七本ななほん、八本はっぽん、九本きゅうほん、十本じゅっぽん。\n紙：一枚いちまい、二枚にまい、三枚さんまい。\n書：一冊いっさつ、二冊にさつ、三冊さんさつ、八冊はっさつ、十冊じゅっさつ。\n本課以列出的讀法練習；其他讀法如未經真人審核確認，不作為判錯的干擾選項。\n同樣是三：三本さんぼん、三枚さんまい、三冊さんさつ，依物品形狀／用途選數法。','えんぴつはほん、かみはまい、ほんはさつでかぞえます。','えんぴつ 三本、かみ 三枚、ほん 三冊','三支鉛筆、三張紙、三本書。',['G20'],'えんぴつは、いっぽん、にほん、さんぼん、よんほん、ごほん、ろっぽん、ななほん、はっぽん、きゅうほん、じゅっぽん。かみは、いちまい、にまい、さんまい。ほんは、いっさつ、にさつ、さんさつ、はっさつ、じゅっさつ。',grammarIds=['G20'],prerequisites=['U07-teach-G19'])
 u.teach('G21','分清楚幾個與多少錢','いくら・いくつ','いくらですか問多少錢；いくつですか問一般物品幾個。\nこのパンは、いくらですか。百円です。價格是100圓。\nパンは、いくつですか。二つです。數量是兩個。\n「百円」不是一百個，「二つ」也不是兩圓。\n「ぜんぶで百円です」指全部的總價，不等於每一個各100圓；ぜんぶで作為本課資訊讀法說明。','いくらですか、はねだんです。いくつですか、はかずです。','パンは 二つ、ぜんぶで 百円です。','麵包兩個，全部共100圓。',['G21'],'いくらですか。ひゃくえんです。いくつですか。ふたつです。ぜんぶでひゃくえんです。',grammarIds=['G21'],prerequisites=['U07-teach-G20'])
 u.teach('context','核對訂單，不猜未寫的價格','ちゅうもんをたしかめる','ねだん＝價格。訂單先核對物品，再看數量和使用的助數詞；不同物品的數量要分開配對。若已收到一部分，再核對還少多少。題目另有最低／最高數量時，先讀清楚範圍。價目表與數量表的欄位不可混讀。\n價目表寫「パン二つ：百円」時，是兩個合計100圓；不能說每個100圓。\n聽到請求後，依原話準備物品，不自行加東西。\nえん只是故事裡的日圓單位，遊戲金幣與真實金錢不換算，課內不要求購買。','もの、かず、ねだんをわけて、ちゅうもんをたしかめましょう。','パン：二つ／ねだん：百円','物品是麵包，數量兩個，標價100圓。',['R-SHORT','R-MID','R-INFO','L-TASK','L-KEY','L-EXPR','L-RESP'],'パンはふたつ、ねだんはひゃくえんです。もの、かず、ねだんをたしかめましょう。',prerequisites=['U07-teach-G21'])
 p['readings']=[dict(id='U07-R01',text='パンを 二つ ください。りんごを 三つ ください。みずは かいません。',skillId='R-SHORT'),dict(id='U07-R02',text='この ノートは 百円です。わたしは ノートを かいます。ともだちは ペンを かいます。',skillId='R-SHORT'),dict(id='U07-R03',text='わたしと あねは みせに います。わたしは えんぴつを 三本 かいます。あねは かみを 三枚 かいます。ほんは かいません。えんぴつと かみは、ぜんぶで 百円です。わたし：「ふくろを ください。」',skillId='R-MID'),dict(id='U07-R04',text='きょうの セット\nパン 二つ：百円\nりんご 三つ：百円\nノート 一冊：百円\nえんぴつ 二本：百円',skillId='R-INFO')]
 scripts=[('L-TASK','えんぴつを、さんぼんください。かみを、にまいください。ほんは、かいません。'),('L-TASK','りんごは、みっつです。パンは、ふたつです。パンをふたつください。'),('L-KEY','このノートは、ひゃくえんです。ペンは、せんえんです。ノートをかいます。'),('L-KEY','わたしは、ほんをにさつかいます。あねは、ほんをいっさつかいます。'),('L-EXPR','かずをつたえます。いちばん。りんごをひとつください。にばん。りんごをふたつください。さんばん。りんごをみっつください。よんばん。りんごをよっつください。'),('L-RESP','いくらですか。')]
 p['listening']=[dict(id=f'U07-L{i:02}',script=s,audioSrc=f'/assets/audio/u07/listening-{i:02}.wav',skillId=k,reviewStatus='DRAFT') for i,(k,s) in enumerate(scripts,1)]
 return u

if __name__=='__main__':
 u=make_unit();p=u.pack;existing=[json.loads(Path(f'src/content/packs/u{n:02}.json').read_text()) for n in range(1,7)]
 assert len(p['vocabulary'])==len({v['reading'] for v in p['vocabulary']})==25
 assert not {v['reading'] for v in p['vocabulary']} & {v['reading'] for old in existing for v in old['vocabulary']}
 assert len(p['kanji'])==5 and not {v['text'] for v in p['kanji']} & {v['text'] for old in existing for v in old['kanji']}
 assert len(p['teaching'])==10 and len(p['readings'])==4 and len(p['listening'])==6
 target=Path('docs/content/U07/source-draft.json')
 if target.exists():
  old=json.loads(target.read_text())
  if old.get('reviewStatus')=='APPROVED' or old.get('questions'):raise ValueError('Refusing to overwrite approved or full-question source')
 target.write_text(json.dumps(p,ensure_ascii=False,indent=2)+'\n')
 print('U07 sources PASS: 25 new words, 5 new kanji, 10 teaching, 4 reading, 6 listening scripts; questions/audio/art not produced, human review NOT_RUN')
