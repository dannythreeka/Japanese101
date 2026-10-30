"""Original daily-activity teaching sources; not a playable unit until real questions and media exist."""
import json
from pathlib import Path
from content_authoring import DraftUnit
from u09_localization import localize_teaching

def make_unit():
 u=DraftUnit('U09','一天的活動：居民的行程手帳');p=u.pack
 words=[('みる','看；本課用於看電影等動作'),('きく','聽；本課用於聽音樂'),('はなす','說話；交談'),('かく','寫'),('はたらく','工作'),('やすむ','休息；請假'),('あそぶ','玩'),('およぐ','游泳'),('さんぽする','散步'),('そうじする','打掃'),('せんたくする','洗衣服'),('りょうりする','做菜'),('れんしゅうする','練習'),('しゅくだい','作業'),('しごと','工作；名詞'),('かいしゃ','公司'),('プール','游泳池'),('えいが','電影'),('おんがく','音樂'),('てがみ','信'),('いつも','總是；通常如此的習慣'),('ときどき','有時候'),('よく','經常；本課作頻度副詞'),('あまり','不太；本課和否定動詞一起用'),('ぜんぜん','完全不；本課和否定動詞一起用')]
 p['vocabulary']=[dict(id=f'U09-V{i:02}',text=t,reading=t,meaning=m) for i,(t,m) in enumerate(words,1)]
 p['kanji']=[dict(id=f'U09-K{i:02}',text=t,reading=r,meaning=m) for i,(t,r,m) in enumerate([('見','み','看；見ます的見讀み'),('聞','き','聽；聞きます的聞讀き'),('読','よ','讀；読みます的読讀よ'),('書','か','寫；書きます的書讀か'),('話','はな','說；話します的話讀はな')],1)]
 p['grammar']=[dict(id=g,title=t,prerequisites=['K-HIRA',dep]) for g,t,dep in [('G25','場所でVます：動作發生的地方','G24'),('G26','時點から／まで：開始與結束','G25'),('G27','頻度副詞＋V：習慣與偶爾','G26')]]
 bodies=[
  '本課先認識完整詞形：みる→見ます、きく→聞きます、はなす→話します、かく→書きます、はたらく→はたらきます。不要求從這五詞自行推導所有動詞變化。聞きます在這課表示聽音樂，不先考詢問某人的另一種用法。',
  'やすみます是休息；あそびます是玩；およぎます是游泳；さんぽします是散步；そうじします是打掃。休息不等於懶惰，故事只描述居民，不要求孩子回報自己的家務或活動。',
  'せんたくします是洗衣服，りょうりします是做菜，れんしゅうします是練習。しゅくだい與しごと是名詞；しゅくだいをします是做作業的固定搭配。',
  'かいしゃ與プール是地方；えいが與おんがく是作品或內容；てがみ是信。公司工作只出現在虛構成人的故事，不暗示孩子需要工作。',
  'いつも是經常一向如此的習慣；ときどき是有時候；よく是經常。頻度詞不在本課換成固定百分比。あまりべんきょうしません＝不太讀書，ぜんぜんおよぎません＝完全不游泳；兩詞在本課搭配否定動詞。不因一個習慣詞推斷孩子是否勤奮。']
 titles=[('看、聽、說與寫','みる・きく・はなす・かく'),('休息與活動','やすむ・あそぶ・さんぽ'),('家務、練習與作業','せんたく・りょうり・れんしゅう'),('活動的地方與物品','かいしゃ・プール・えいが'),('多久做一次','いつも・ときどき')]
 for n,((title,jp),body) in enumerate(zip(titles,bodies),1):
  vs=p['vocabulary'][(n-1)*5:n*5]
  id=u.teach(f'words-{n}',title,jp,'\n'.join(f"{v['text']}：{v['meaning']}" for v in vs)+'\n'+body,'ことばのいみと、することをたしかめましょう。',vs[0]['text'],vs[0]['meaning'],['V-CONTEXT','V-PARA','K-HIRA','K-KATA'],'。'.join(v['reading'] for v in vs)+'。',vocabularyIds=[v['id'] for v in vs]);u.wordcards.append(id)
 u.teach('kanji','看懂活動的漢字','みます・ききます・よみます・かきます・はなします','見ます＝みます、聞きます＝ききます、読みます＝よみます、書きます＝かきます、話します＝はなします。\n見讀み、聞讀き、読讀よ、書讀か、話讀はな，都是這課指定詞形的讀法；後面的ます／きます／みます／します是完整詞的一部分，不能把整詞讀音全配給單個漢字。\n例：本を読みます。てがみを書きます。おんがくを聞きます。不要把読む與書く混在一起。','みます、ききます、よみます、かきます、はなします。ことばをわけてよみましょう。','本を 読みます。てがみを 書きます。','讀書，寫信。',['K-SCRIPT'],'みます。ききます。よみます。かきます。はなします。ほんをよみます。てがみをかきます。',kanjiIds=[k['id'] for k in p['kanji']],prerequisites=u.wordcards)
 u.teach('G25','動作在哪裡發生','どこでしますか','「場所でVます」表示動作發生的地方。学校でべんきょうします＝在學校學習；こうえんであそびます＝在こうえん玩。\n「学校にいます」表示人在學校；「学校でべんきょうします」表示學習發生在學校。不能用学校にべんきょうします表達同一個動作地方。\n先前「バスで行きます」的で是交通方法；這裡「こうえんであそびます」的で是動作場所，要連同名詞與動作一起理解。','がっこうでべんきょうします。こうえんであそびます。するばしょをつたえます。','としょかんで 本を 読みます。','在圖書館讀書。',['G25'],'がっこうでべんきょうします。こうえんであそびます。としょかんでほんをよみます。どこでべんきょうしますか。がっこうでべんきょうします。',grammarIds=['G25'],prerequisites=['U09-teach-kanji'])
 u.teach('G26','行程何時開始與結束','なんじから、なんじまで','「九時から十時まで」表示從九點到十點，から標起點、まで標終點。九時から十時までべんきょうします＝從九點讀到十點。\n單獨說九時から只給開始，十時まで只給結束，不能自行補另一端。反例：九時まで十時から不能表示九點開始十點結束。\n只談同一天、時間先後清楚的行程；不以某時段讀過書推論整天沒休息或每分鐘都在讀。','くじからじゅうじまで、べんきょうします。からははじまり、まではおわりです。','三時から 四時まで あそびます。','從三點玩到四點。',['G26'],'くじからじゅうじまでべんきょうします。さんじからよじまであそびます。なんじからですか。くじからです。なんじまでですか。じゅうじまでです。',grammarIds=['G26'],prerequisites=['U09-teach-G25'])
 u.teach('G27','習慣與偶爾分開說','いつも・ときどき','「いつも本を読みます」描述一向如此的習慣；「ときどき本を読みます」描述有時候讀。\n「よくおんがくを聞きます」表示經常聽；「あまりおよぎません」是不太游泳；「ぜんぜんおよぎません」是完全不游泳，後兩句在這課都用否定。\n反例：只聽到ときどき，不能改成每天一定做，也不能推論固定每週幾次。頻度詞不同於九時等單次時刻，不換算精確百分比。','いつもほんをよみます。ときどきえいがをみます。することの、かいすうのちがいをたしかめましょう。','ときどき こうえんで あそびます。','有時候在こうえん玩。',['G27'],'いつもほんをよみます。ときどきえいがをみます。よくおんがくをききます。あまりおよぎません。ぜんぜんおよぎません。',grammarIds=['G27'],prerequisites=['U09-teach-G26'])
 u.teach('context','讀居民的行程手帳','ばしょ・じかん・いつも','先核對人物，再讀動作、地方、開始與結束。行程卡可以同時有地點與時間，不把場所で當交通方法。\n「九時から十時まで」是一段時間；「いつも」是習慣頻度，不是幾點。今天安排的行程不能自動當成每天都做。\n故事只談虛構居民，不要求孩子提供住址、作息、學校名稱或家務紀錄。','ひと、すること、ばしょ、じかんをわけて、よていをよみましょう。','あねは としょかんで 九時から 十時まで 本を 読みます。','姊姊從九點到十點在圖書館讀書。',['R-SHORT','R-MID','R-INFO','L-TASK','L-KEY','L-EXPR','L-RESP'],'あねは、としょかんで、くじからじゅうじまで、ほんをよみます。ばしょと、はじまりと、おわりをたしかめましょう。',prerequisites=['U09-teach-G27'])
 p['readings']=[dict(id='U09-R01',text='きょうは としょかんで 本を 読みます。九時から 十時まで 読みます。',skillId='R-SHORT'),dict(id='U09-R02',text='わたしは いつも うちで おんがくを 聞きます。ときどき えいがを 見ます。',skillId='R-SHORT'),dict(id='U09-R03',text='きょう、あねは としょかんで 本を 読みます。九時から 十時までです。わたしは こうえんで あそびます。三時から 四時までです。あには プールで およぎます。あには よく およぎます。わたしは あまり およぎません。',skillId='R-MID'),dict(id='U09-R04',text='きょうの よてい\nあね：としょかん／本を 読みます／九時から 十時まで\nわたし：こうえん／あそびます／三時から 四時まで\nはは：うち／りょうりします／五時から 六時まで',skillId='R-INFO')]
 scripts=[('L-TASK','きょうは、としょかんで、ほんをよみます。くじからじゅうじまでです。じゅうじまで、ほんをよみます。'),('L-TASK','さんじからよじまで、こうえんであそびます。よじまでです。'),('L-KEY','あねは、いつも、うちでおんがくをききます。ときどき、えいがをみます。'),('L-KEY','あには、よく、ぷーるでおよぎます。わたしは、あまりおよぎません。ははは、ぜんぜんおよぎません。'),('L-EXPR','することです。いちばん。てがみをかきます。にばん。そうじします。さんばん。ほんをよみます。よんばん。こうえんであそびます。'),('L-RESP','なんじからですか。')]
 p['listening']=[dict(id=f'U09-L{i:02}',script=s,audioSrc=f'/assets/audio/u09/listening-{i:02}.wav',skillId=k,reviewStatus='DRAFT') for i,(k,s) in enumerate(scripts,1)]
 localize_teaching(p)
 return u

if __name__=='__main__':
 u=make_unit();p=u.pack;old=[json.loads(Path(f'src/content/packs/u{n:02}.json').read_text()) for n in range(1,9)]
 assert len(p['vocabulary'])==len({v['reading'] for v in p['vocabulary']})==25
 assert not {v['reading'] for v in p['vocabulary']} & {v['reading'] for pack in old for v in pack['vocabulary']}
 assert len(p['kanji'])==5 and not {v['text'] for v in p['kanji']} & {v['text'] for pack in old for v in pack['kanji']}
 blueprint=json.loads(Path('docs/content/n5-manifest.json').read_text());spec=next(x for x in blueprint['units'] if x['id']=='U09')
 assert [g['id'] for g in p['grammar']]==spec['grammarIds']
 for g in p['grammar']:assert g['prerequisites']==next(s['prerequisites'] for s in blueprint['skills'] if s['id']==g['id'])
 assert len(p['teaching'])==10 and len(p['readings'])==4 and len(p['listening'])==6
 directory=Path('docs/content/U09');directory.mkdir(exist_ok=True)
 target=directory/'source-draft.json'
 if target.exists():
  previous=json.loads(target.read_text())
  if previous.get('reviewStatus')=='APPROVED' or previous.get('questions'):raise ValueError('Refusing approved or full-question source overwrite')
 target.write_text(json.dumps(p,ensure_ascii=False,indent=2)+'\n')
 (directory/'production-plan.json').write_text(json.dumps(dict(unitId='U09',status='DRAFT',prerequisites=spec['prerequisites'],typeCounts=spec['typeCounts'],readingQuestions={f'U09-R{i:02}':[f'U09-Q{q:02}' for q in qs] for i,qs in enumerate([[29],[30],[31,32],[33,34]],1)},listeningQuestions={f'U09-L{i:02}':[f'U09-Q{q:02}' for q in qs] for i,qs in enumerate([[35,36],[37,38],[39,40],[41,42],[43,44,45,46],[47,48,49,50]],1)},plannedCheckFamilies={g['id']:5 for g in p['grammar']},questionsAuthored=0,audioProduced=0,artProduced=0,humanReview='NOT_RUN'),ensure_ascii=False,indent=2)+'\n')
 print('U09 sources PASS: 25 new words, 5 new kanji, 10 teaching, 4 reading, 6 listening scripts; no playable questions or media yet')
