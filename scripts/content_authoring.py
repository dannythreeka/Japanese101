"""Serialization helpers only. Content, answers and distinct semantic families must be authored explicitly."""
import json
from pathlib import Path

class DraftUnit:
    def __init__(self, unit_id, title):
        self.id=unit_id
        self.pack=dict(id=unit_id,version=f'{unit_id.lower()}-1-draft',title=title,reviewStatus='DRAFT',reviewer=None,reviewedAt=None,vocabulary=[],kanji=[],grammar=[],readings=[],listening=[],teaching=[],questions=[])
        self.wordcards=[]
    def teach(self, suffix, title, titleja, body, bodyja, example, translation, skills, script, **extra):
        id=f'{self.id}-teach-{suffix}'
        self.pack['teaching'].append(dict(id=id,title=title,titleJa=titleja,body=body,bodyJa=bodyja,example=example,translation=translation,translationJa='れいをみて、こえにだしてみましょう。',skillIds=skills,audioScript=script,audioSrc=f'/assets/audio/{self.id.lower()}/{id}.wav',**extra))
        return id
    def question(self, type, skill, family, prompt, ja, answer, wrong, explain, explainja, *, reading=None, audio=None, order=None, image=None, check=False):
        mode='check' if check else 'practice'
        n=sum(q['partition']==mode for q in self.pack['questions'])+1
        id=f'{self.id}-{"C" if check else "Q"}{n:02}'
        texts=order or [answer]+[x[0] for x in wrong]
        choices=[dict(id=f'{id}-o{i}',text=t) for i,t in enumerate(texts)]
        correct=[c['id'] for c in choices] if order else [choices[0]['id']]
        reasons={f'{id}-o{i+1}':why for i,(_,why) in enumerate(wrong)}
        offset=n%len(choices)
        teachings=self.wordcards+([f'{self.id}-teach-kanji'] if type in ['T01','T02'] else []) if type in ['T01','T02','T03','T04'] else [c['id'] for c in self.pack['teaching']]
        obj=dict(id=id,version='1',unitId=self.id,itemId=id,itemFamilyId=f'{self.id}-'+('CHECK-' if check else 'F-')+(f'listening-{audio:02}' if audio else family),primarySkillId=skill,skillIds=[skill],teachingIds=teachings,partition=mode,kind='order' if order else 'audio' if audio else 'reading' if reading else 'choice',prompt=prompt,promptJa=ja,choices=choices[offset:]+choices[:offset],answer=correct,explanation=explain,explanationJa=explainja,distractorReasons=reasons,hint='先找出題目的人物、時間與動作，再比較每一個選項。',hintJa='ひと、じこく、することをたしかめよう。',hintPolicy='none' if check else 'practice-only',audioPolicy='required' if audio else 'optional',source=f'Original authored {self.id} draft by Codex, 2026-10-30; not official JLPT material',reviewStatus='DRAFT',difficulty=1 if type in ['T01','T02','T03'] else 2)
        if type: obj['typeId']=type
        if reading:
            material=self.pack['readings'][reading-1];obj.update(materialId=material['id'],material=material['text'])
        if audio:
            clip=self.pack['listening'][audio-1];obj.update(audioId=clip['id'],audioSrc=clip['audioSrc'])
        if image:obj['image']=image
        self.pack['questions'].append(obj)
    def write(self):
        assert sum(q['partition']=='practice' for q in self.pack['questions'])==50
        path=Path(f'src/content/packs/{self.id.lower()}.json')
        if path.exists():
            previous=json.loads(path.read_text())
            if previous.get('reviewStatus')=='APPROVED' or any(q.get('reviewStatus')=='APPROVED' for q in previous.get('questions',[])):
                raise ValueError('Refusing to overwrite approved content; create a reviewed version migration first')
        path.write_text(json.dumps(self.pack,ensure_ascii=False,indent=2)+'\n')
        print(self.id,len(self.pack['questions']),'authored questions; human review NOT_RUN')
