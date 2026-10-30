import {render,screen,fireEvent,waitFor} from '@testing-library/react'
import {expect,it,vi} from 'vitest'
import {u09} from '../../content/packs/u09'
import {u08} from '../../content/packs/u08'
import type {Attempt} from '../../content/contracts'
const text=vi.hoisted(()=>({lang:'ja' as 'ja'|'zh'}))
vi.mock('./text',()=>({useJourneyText:()=>({lang:text.lang,t:(key:string)=>key})}))
import QuestionPlayer from './QuestionPlayer'
it('uses the visible translated question as the answer-group name and preserves a selected answer when language changes',async()=>{
 const question=u09.questions.find(q=>q.id==='U09-Q20')!,onSubmit=vi.fn().mockResolvedValue(undefined),onContinue=vi.fn()
 text.lang='ja'
 const view=render(<QuestionPlayer question={question} onSubmit={onSubmit} onContinue={onContinue}/>)
 expect(screen.getByRole('heading',{name:question.promptJa})).toBeVisible()
 expect(screen.getByRole('group',{name:question.promptJa})).toBeVisible()
 const answer=question.choices.find(c=>c.id===question.answer[0])!
 fireEvent.click(screen.getByRole('button',{name:answer.text}))
 text.lang='zh';view.rerender(<QuestionPlayer question={question} onSubmit={onSubmit} onContinue={onContinue}/>)
 expect(screen.getByRole('heading',{name:question.prompt})).toBeVisible()
 expect(screen.getByRole('group',{name:question.prompt})).toBeVisible()
 expect(screen.getByRole('button',{name:answer.text})).toHaveAttribute('aria-pressed','true')
 fireEvent.click(screen.getByRole('button',{name:'confirm'}))
 await waitFor(()=>expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({answerIds:question.answer,hintUsed:false})))
})
it('marks the Chinese choice and both saved-feedback copies as Chinese inside the Japanese interface',()=>{
 text.lang='ja'
 const question=u08.questions.find(q=>q.id==='U08-Q09')!,answer=question.choices.find(c=>c.id===question.answer[0])!
 const attempt:Attempt={id:'language-fixture',profileId:'isolated-unit-test',sessionId:'session',questionInstanceId:'question',itemId:question.itemId,itemVersion:question.version,itemFamilyId:question.itemFamilyId,skillIds:question.skillIds,primarySkillId:question.primarySkillId,mode:'practice',firstAnswerCorrect:true,outcome:'correct',hintUsed:false,retryCount:0,audioPlayCount:0,responseMs:1,submittedAt:'2026-10-30T00:00:00Z',answerIds:question.answer}
 render(<QuestionPlayer question={question} attempt={attempt} onSubmit={vi.fn()} onContinue={vi.fn()}/>)
 const copies=screen.getAllByText(answer.text)
 expect(copies).toHaveLength(3)
 for(const copy of copies)expect(copy).toHaveAttribute('lang','zh-Hant')
 expect(screen.getByRole('heading',{name:question.promptJa})).toHaveAttribute('lang','ja')
 expect(screen.getByText(question.explanationJa!)).toHaveAttribute('lang','ja')
})
