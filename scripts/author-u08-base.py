"""Original transport sources; fictional destinations, no collection of a child's whereabouts."""
import json
from pathlib import Path
from content_authoring import DraftUnit

def make_unit():
 u=DraftUnit('U08','交通與目的地：小鎮出發的約定');p=u.pack
 words=[('いく','去'),('くる','來'),('かえる','回去；回家'),('あるいて','步行；以固定搭配あるいて行きます學習'),('のる','搭乘'),('おりる','下車；下交通工具'),('でんしゃ','電車'),('バス','公車'),('じてんしゃ','腳踏車'),('くるま','汽車'),('タクシー','計程車'),('ひこうき','飛機'),('ふね','船'),('ちかてつ','地下鐵'),('きっぷ','車票／船票等票券'),('びょういん','醫院'),('ぎんこう','銀行'),('ゆうびんきょく','郵局'),('としょかん','圖書館'),('くうこう','機場'),('バスてい','公車站'),('いりぐち','入口'),('でぐち','出口'),('いっしょに','一起'),('だれと','和誰；詢問同行者的固定問法')]
 p['vocabulary']=[dict(id=f'U08-V{i:02}',text=t,reading=t,meaning=m) for i,(t,m) in enumerate(words,1)]
 p['kanji']=[dict(id=f'U08-K{i:02}',text=t,reading=r,meaning=m) for i,(t,r,m) in enumerate([('行','い','去；行きます的行讀い'),('来','き','來；来ます的来讀き'),('車','くるま','汽車'),('入','いり','進入；入口的入讀いり'),('出','で','出去；出口的出讀で')],1)]
 p['grammar']=[dict(id=g,title=t,prerequisites=['K-HIRA',dep]) for g,t,dep in [('G22','場所へ／に行きます：目的地','G21'),('G23','交通工具で行きます：移動方法','G22'),('G24','人と行きます：同行的人','G23')]]
 for n,(title,jp) in enumerate([('來去與步行','いく・くる・あるいて'),('搭乘與常見交通','のりものとおりる'),('票券與其他交通','きっぷとほかののりもの'),('小鎮外的目的地','いくところ'),('集合與出入口','いっしょに・いりぐち・でぐち')],1):
  vs=p['vocabulary'][(n-1)*5:n*5];body='\n'.join(f"{v['text']}：{v['meaning']}" for v in vs)
  if n==1:body+='\n行きます＝いきます，来ます＝きます，帰ります＝かえります。以說話者目前位置區分「去」與「來」。あるいて行きます是本課固定搭配，不說あるいてで行きます。'
  if n==2:body+='\n電車、公車、腳踏車與汽車分開辨識。おりる表示離開搭乘的交通工具，與のる相反。'
  if n==3:body+='\nタクシー、ひこうき、ふね、ちかてつ是不同移動工具。きっぷ是票券，不是車輛名稱。'
  if n==4:body+='\nびょういん有小ょう，表示醫院。這課只談虛構居民去哪裡，不詢問孩子的住址、實際移動路線或定位。'
  if n==5:body+='\n入口＝いりぐち，出口＝でぐち；文字標示要分清楚，不從門在圖片的左右位置猜。だれと問和誰一起去，不是在問去哪裡。'
  id=u.teach(f'words-{n}',title,jp,body,'ことばのいみと、いくところをたしかめましょう。',vs[0]['text'],vs[0]['meaning'],['V-CONTEXT','V-PARA','K-HIRA','K-KATA'],'。'.join(v['reading'] for v in vs)+'。',vocabularyIds=[v['id'] for v in vs]);u.wordcards.append(id)
 u.teach('kanji','看懂來去與出入口','いく・くる・いりぐち・でぐち','行きます＝いきます、来ます＝きます、車＝くるま、入口＝いりぐち、出口＝でぐち。\n本課行讀い、来讀き，指的是這兩個完整詞形，不把所有複合詞都讀成一樣。入口的入讀いり，出口的出讀で，後面口在這些詞裡讀ぐち。\n這裡來去指故事人物的移動，不要求孩子真的出門。','いきます、きます、くるま、いりぐち、でぐち。よみかたをたしかめましょう。','入口と 出口','入口與出口。',['K-SCRIPT'],'いきます。きます。くるま。いりぐち。でぐち。いりぐちははいるところ、でぐちはでるところです。',kanjiIds=[k['id'] for k in p['kanji']],prerequisites=u.wordcards)
 u.teach('G22','說清楚目的地','どこへいきますか','「場所へ行きます」和「場所に行きます」都可表達去某個目的地。へ作助詞讀え。\nえきへ行きます／えきに行きます：兩者都可以，本課不把其中一個當錯誤選項。\n「どこへ行きますか」問去哪裡；「なんじに行きますか」問時間，不能混在一起。\n行きます與来ます以說話位置為準；這課的目的地問答先用行きます。','えきへいきます。えきにいきます。どちらも、いくところをつたえます。じょしのへは、えとよみます。','としょかんへ 行きます。','去圖書館。',['G22'],'えきへいきます。えきにいきます。どこへいきますか。としょかんへいきます。',grammarIds=['G22'],prerequisites=['U08-teach-kanji'])
 u.teach('G23','說明怎麼去','なにでいきますか','「交通工具で行きます」說明移動方法。バスで行きます＝搭公車去；でんしゃで行きます＝搭電車去。\n這裡で是方法，不是目的地；「バスへ行きます」不是同樣的意思。\n步行用固定搭配「あるいて行きます」，不加で。\n「学校へ バスで 行きます」同時說目的地與方法；題目只依文字／聲音，不猜孩子的真實交通習慣。','バスでいきます。でんしゃでいきます。あるいていきます。','学校へ バスで 行きます。','搭公車去學校。',['G23'],'がっこうへばすでいきます。としょかんへでんしゃでいきます。えきへあるいていきます。なにでいきますか。ばすでいきます。',grammarIds=['G23'],prerequisites=['U08-teach-G22'])
 u.teach('G24','介紹同行的人','だれといきますか','「人と行きます」說明和誰一起去。あねと行きます＝和姊姊一起去。\n「だれと行きますか」問同行者；「なにで行きますか」問方法；「どこへ行きますか」問目的地。\n「ともだちと バスで 学校へ 行きます」裡，ともだちは同行者、バス是方法、学校是目的地。\n「ともだちと」中的と不表示朋友變成交通工具；區分人と與工具で。ひとりで行きます表示獨自去，是本課一起認識的固定搭配。','あねといきます。だれといきますか。ともだちといきます。','ともだちと 学校へ 行きます。','和朋友一起去學校。',['G24'],'あねといきます。ともだちとがっこうへいきます。だれといきますか。ともだちといきます。ひとりでいきます。',grammarIds=['G24'],prerequisites=['U08-teach-G23'])
 u.teach('context','把誰、去哪裡、怎麼去分開','だれと・どこへ・なにで','讀行程卡時，先分同行者、目的地、方法三欄，不把交通工具當目的地或人物。\n表格同時有多個居民時，要先核對人物，再取正確那一列。\n「先去銀行，再去車站」只在題目明確說順序時按順序讀；沒有寫的目的地、時間或同伴不能自行加上。\n插畫只是教學場景，不表示地圖新增車站或多座城鎮。','だれと、どこへ、なにでいくか、わけてたしかめましょう。','あねと／としょかんへ／バスで','和姊姊／去圖書館／搭公車。',['R-SHORT','R-MID','R-INFO','L-TASK','L-KEY','L-EXPR','L-RESP'],'あねと、としょかんへ、ばすでいきます。だれと、どこへ、なにでいくかをたしかめましょう。',prerequisites=['U08-teach-G24'])
 p['readings']=[dict(id='U08-R01',text='わたしは としょかんへ 行きます。バスで 行きます。あねと 行きます。',skillId='R-SHORT'),dict(id='U08-R02',text='ともだちは ぎんこうへ 行きます。車で 行きます。わたしは えきへ あるいて 行きます。',skillId='R-SHORT'),dict(id='U08-R03',text='あさです。わたしと あには 学校へ 行きます。きょうは バスで 行きません。じてんしゃで 行きます。ははは びょういんへ 行きます。ははは タクシーで 行きます。わたしは ははと 行きません。',skillId='R-MID'),dict(id='U08-R04',text='きょうの よてい\nあに：学校／じてんしゃ\nあね：としょかん／バス\nはは：びょういん／タクシー\nわたし：えき／あるいて',skillId='R-INFO')]
 scripts=[('L-TASK','としょかんへいきます。あねと、ばすでいきます。ぎんこうへはいきません。'),('L-TASK','えきへいきます。きょうは、でんしゃでいきません。あるいていきます。'),('L-KEY','わたしは、ともだちと、がっこうへいきます。あには、ひとりで、としょかんへいきます。'),('L-KEY','ははは、びょういんへ、たくしーでいきます。あねは、ぎんこうへ、ばすでいきます。'),('L-EXPR','いどうのほうほうです。いちばん。ばすでいきます。にばん。くるまでいきます。さんばん。でんしゃでいきます。よんばん。じてんしゃでいきます。'),('L-RESP','だれといきますか。')]
 p['listening']=[dict(id=f'U08-L{i:02}',script=s,audioSrc=f'/assets/audio/u08/listening-{i:02}.wav',skillId=k,reviewStatus='DRAFT') for i,(k,s) in enumerate(scripts,1)]
 return u

if __name__=='__main__':
 u=make_unit();p=u.pack;previous=[json.loads(Path(f'src/content/packs/u{n:02}.json').read_text()) for n in range(1,8)]
 assert len(p['vocabulary'])==len({v['reading'] for v in p['vocabulary']})==25
 assert not {v['reading'] for v in p['vocabulary']} & {v['reading'] for pack in previous for v in pack['vocabulary']}
 assert len(p['kanji'])==5 and not {v['text'] for v in p['kanji']} & {v['text'] for pack in previous for v in pack['kanji']}
 assert len(p['teaching'])==10 and len(p['readings'])==4 and len(p['listening'])==6
 target=Path('docs/content/U08/source-draft.json')
 if target.exists():
  old=json.loads(target.read_text())
  if old.get('reviewStatus')=='APPROVED' or old.get('questions'):raise ValueError('Refusing approved or full-question source overwrite')
 target.write_text(json.dumps(p,ensure_ascii=False,indent=2)+'\n')
 print('U08 sources PASS: 25 unique new words, 5 new kanji, 10 teaching, 4 reading, 6 listening scripts; questions/audio/art not produced, human review NOT_RUN')
