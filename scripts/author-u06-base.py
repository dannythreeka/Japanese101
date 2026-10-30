"""Original U06 manifest and teaching sources; deliberately outside the playable registry until complete."""
import json
from pathlib import Path
from content_authoring import DraftUnit

def make_unit():
 u=DraftUnit('U06','飲食：小鎮食堂的午餐');p=u.pack;p['version']='u06-2-draft'
 words=[('ごはん','飯；餐點'),('パン','麵包'),('みず','水'),('おちゃ','茶'),('ぎゅうにゅう','牛奶'),('ジュース','果汁'),('にく','肉'),('さかな','魚'),('やさい','蔬菜'),('くだもの','水果'),('りんご','蘋果'),('バナナ','香蕉'),('たまご','蛋'),('スープ','湯'),('カレー','咖哩'),('うどん','烏龍麵'),('おにぎり','飯糰'),('サラダ','沙拉'),('おべんとう','便當'),('あさごはん','早餐'),('ひるごはん','午餐'),('ばんごはん','晚餐'),('すき','喜歡'),('きらい','不喜歡；討厭'),('ください','請給我（配合名詞使用）')]
 p['vocabulary']=[dict(id=f'U06-V{i:02}',text=t,reading=t,meaning=m) for i,(t,m) in enumerate(words,1)]
 p['kanji']=[dict(id=f'U06-K{i:02}',text=t,reading=r,meaning=m) for i,(t,r,m) in enumerate([('食','た','吃；食べます的食讀た'),('飲','の','喝；飲みます的飲讀の'),('水','みず','水'),('魚','さかな','魚'),('肉','にく','肉')],1)]
 p['grammar']=[dict(id=g,title=t,prerequisites=['K-HIRA',dep]) for g,t,dep in [('G16','NをVます：吃什麼、喝什麼','G15'),('G17','Nが好きです／嫌いです：表達喜好','G16'),('G18','Nをください：點餐與請求','G17')]]
 for n,(title,jp) in enumerate([('飯與飲料','ごはんとのみもの'),('魚肉與蔬果','さかな・にく・やさい'),('食堂的菜單','しょくどうのメニュー'),('便當與三餐','おべんとうとさんどのごはん'),('喜好與請求','すき・きらい・ください')],1):
  vs=p['vocabulary'][(n-1)*5:n*5];body='\n'.join(f"{v['text']}：{v['meaning']}" for v in vs)
  if n==1:body+='\nごはん可以指白飯，也能指一餐。みず是水，おちゃ是茶，不把所有飲料都叫みず。'
  if n==2:body+='\nさかな是魚，にく是肉；這課讀菜單，不要求孩子吃特定食物或公開飲食限制。'
  if n==3:body+='\nたまご是蛋，スープ是湯。カレー是咖哩，不把パン或スープ當成同義詞。'
  if n==4:body+='\nあさごはん是早餐，ひるごはん是午餐，ばんごはん是晚餐。おべんとう指便當，不限定一定中午吃。'
  if n==5:body+='\nすき／きらい表示個人喜好，沒有誰的喜好比較好。ください在本課搭配物品：みずをください。不能用它表達自己喜歡水。'
  id=u.teach(f'words-{n}',title,jp,body,'ことばをきいて、いみをたしかめましょう。',vs[0]['text'],vs[0]['meaning'],['V-CONTEXT','V-PARA','K-HIRA','K-KATA'],'。'.join(v['reading'] for v in vs)+'。',vocabularyIds=[v['id'] for v in vs]);u.wordcards.append(id)
 u.teach('kanji','讀懂食堂的漢字','しょくどうのかんじ','食べます＝たべます、飲みます＝のみます、水＝みず、魚＝さかな、肉＝にく。\n食べます裡的食讀た，不能把整個たべます都當成單一漢字的讀音。飲みます也是同樣道理。\n這課先讀五個已標示的詞形，不推論所有複合詞都用相同讀音。','食べますは、たべます。飲みますは、のみます。水、魚、肉。','魚を 食べます。水を 飲みます。','吃魚，喝水。',['K-SCRIPT'],'たべます。のみます。みず。さかな。にく。さかなをたべます。みずをのみます。',kanjiIds=[k['id'] for k in p['kanji']],prerequisites=u.wordcards)
 u.teach('G16','說清楚吃什麼、喝什麼','なにをたべますか','「食物を 食べます」「飲料を 飲みます」。を標出動作的對象；助詞を讀お。\nパンを食べます＝吃麵包。みずを飲みます＝喝水。\n反例：パンが食べます會把パン當作做動作的主體，不能用來表達我吃麵包。\n食べません／飲みません是否定。物品的位置用に，不用に代替這裡的を。','パンをたべます。みずをのみます。じょしのをは、おとよみます。','わたしは パンを 食べます。','我吃麵包。',['G16'],'パンをたべます。みずをのみます。さかなはたべません。なにをたべますか。おにぎりをたべます。',grammarIds=['G16'],prerequisites=['U06-teach-kanji'])
 u.teach('G17','尊重每個人的飲食喜好','すきなものをつたえる','「Nが 好きです」表示喜歡N；「Nが 嫌いです」表示不喜歡N。好き讀すき，嫌い讀きらい。\nりんごが好きです＝喜歡蘋果。りんごを好きです不是這課的句型。\n「魚は食べません」只說不吃魚，不能因此認定討厭魚；可能有其他原因。\n題目只依故事明說的喜好作答，不要求孩子透露自己的過敏、宗教或飲食情況。','りんごがすきです。すきなものは、ひとによってちがいます。','わたしは りんごが 好きです。','我喜歡蘋果。',['G17'],'りんごがすきです。バナナがきらいです。ひとによって、すきなものはちがいます。',grammarIds=['G17'],prerequisites=['U06-teach-G16'])
 u.teach('G18','向食堂提出請求','しょくどうでたのむ','「Nを ください」表示請給我N。みずをください＝請給我水。\n這是提出請求，不等於已經收到、已經喝完，也不表示一定喜歡。\n反例：みずがください不是本課的請求句型。\n本課只請求名詞物品；動詞てください會在後續單元另外學。','みずをください。パンをください。ものをたのみます。','おにぎりを ください。','請給我飯糰。',['G18'],'みずをください。パンをください。おにぎりをください。これは、ものをたのむいいかたです。',grammarIds=['G18'],prerequisites=['U06-teach-G17'])
 u.teach('context','讀懂點餐與喜好','メニューとちゅうもん','菜單先找物品，再分清楚句子在說喜好、動作或請求。\nパンが好きです：喜歡。パンを食べます：吃。パンをください：請給我。\n告示寫「みず：あります／ぎゅうにゅう：ありません」時，請求水符合現有供應，不能把沒有的牛奶當作已供應。\n故事未提到的事情標為不知道，不自行猜測喜好。','メニューをみて、すきなもの、たべるもの、たのむものをわけましょう。','みずは あります。みずを ください。','有供應水；請給我水。',['R-SHORT','R-MID','R-INFO','L-TASK','L-KEY','L-EXPR','L-RESP'],'パンがすきです。パンをたべます。パンをください。みずはあります。ぎゅうにゅうはありません。',prerequisites=['U06-teach-G18'])
 p['readings']=[
  dict(id='U06-R01',text='あさです。わたしは パンを 食べます。ぎゅうにゅうを 飲みます。ジュースは 飲みません。',skillId='R-SHORT'),
  dict(id='U06-R02',text='わたしは りんごが 好きです。バナナが 嫌いです。きょうは りんごを 食べます。',skillId='R-SHORT'),
  dict(id='U06-R03',text='ひるです。わたしと ともだちは みせに います。わたしは おにぎりを 食べます。ともだちは うどんを 食べます。わたしは みずを 飲みます。ともだちも みずを 飲みます。わたしは うどんも 好きです。でも、きょうは おにぎりです。',skillId='R-MID'),
  dict(id='U06-R04',text='きょうの メニュー\nパン：あります\nおにぎり：ありません\nスープ：あります\nみず：あります\nぎゅうにゅう：ありません',skillId='R-INFO')]
 scripts=[('L-TASK','パンとみずは、あります。おにぎりは、ありません。パンがすきです。ひるごはんは、パンにします。パンをください。'),('L-TASK','あさごはんは、パンです。のみものは、ぎゅうにゅうです。ぎゅうにゅうをください。'),('L-KEY','わたしは、さかながすきです。きょうは、さかなをたべません。にくをたべます。'),('L-KEY','あには、りんごがすきです。わたしは、バナナがすきです。あねは、りんごがきらいです。'),('L-EXPR','しょくどうにいます。みずをのみます。みずをください。'),('L-RESP','なにをたべますか。')]
 p['listening']=[dict(id=f'U06-L{i:02}',script=s,audioSrc=f'/assets/audio/u06/listening-{i:02}.wav',skillId=k,reviewStatus='DRAFT') for i,(k,s) in enumerate(scripts,1)]
 return u

if __name__=='__main__':
 u=make_unit();p=u.pack;manifest=json.loads(Path('docs/content/n5-manifest.json').read_text());blueprint=next(x for x in manifest['units'] if x['id']=='U06')
 existing=[json.loads(Path(f'src/content/packs/u{n:02}.json').read_text()) for n in range(1,6)]
 assert len(p['vocabulary'])==len({v['text'] for v in p['vocabulary']})==25
 assert not {v['text'] for v in p['vocabulary']} & {v['text'] for old in existing for v in old['vocabulary']}
 assert len(p['kanji'])==5 and not {v['text'] for v in p['kanji']} & {v['text'] for old in existing for v in old['kanji']}
 assert len(p['teaching'])==10 and len(p['readings'])==4 and len(p['listening'])==6
 assert [g['id'] for g in p['grammar']]==blueprint['grammarIds']
 target=Path('docs/content/U06/source-draft.json')
 if target.exists():
  previous=json.loads(target.read_text())
  if previous.get('reviewStatus')=='APPROVED':raise ValueError('Refusing to overwrite approved content')
  if previous.get('questions'):raise ValueError('Full question source exists; run scripts/author-u06.py instead')
 target.write_text(json.dumps(p,ensure_ascii=False,indent=2)+'\n')
 plan=dict(unitId='U06',status='DRAFT',prerequisites=blueprint['prerequisites'],typeCounts=blueprint['typeCounts'],readingQuestions={'U06-R01':['U06-Q29'],'U06-R02':['U06-Q30'],'U06-R03':['U06-Q31','U06-Q32'],'U06-R04':['U06-Q33','U06-Q34']},listeningQuestions={f'U06-L{i:02}':[f'U06-Q{n:02}' for n in ns] for i,ns in enumerate([[35,36],[37,38],[39,40],[41,42],[43,44,45,46],[47,48,49,50]],1)},plannedCheckFamilies={g['id']:5 for g in p['grammar']},questionsAuthored=0,audioProduced=0,humanReview='NOT_RUN')
 Path('docs/content/U06/production-plan.json').write_text(json.dumps(plan,ensure_ascii=False,indent=2)+'\n')
 print('U06: 25 unique new words, 5 unique new kanji, 3 grammar, 10 teaching, 4 reading, 6 listening scripts. Questions/audio NOT_PRODUCED; human review NOT_RUN.')
