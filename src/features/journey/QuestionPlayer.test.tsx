import {render,screen,fireEvent,waitFor} from '@testing-library/react'
import {expect,it,vi} from 'vitest'
import {u09} from '../../content/packs/u09'
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
