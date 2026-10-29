// @vitest-environment node
/// <reference types="node" />
import {afterEach,expect,it,vi} from 'vitest'
import {synthesize} from '../../scripts/audio-source'
afterEach(()=>{vi.unstubAllGlobals();vi.useRealTimers()})
it('honors bounded Retry-After then polls and downloads the trusted host',async()=>{
  vi.useFakeTimers()
  const fetch=vi.fn().mockResolvedValueOnce(new Response('',{status:429,headers:{'Retry-After':'3'}}))
    .mockResolvedValueOnce(Response.json({success:true,audioStatusUrl:'https://audio1.tts.quest/status',wavDownloadUrl:'https://audio1.tts.quest/audio'}))
    .mockResolvedValueOnce(Response.json({isAudioReady:true,isAudioError:false}))
    .mockResolvedValueOnce(new Response('audio-payload'))
  vi.stubGlobal('fetch',fetch)
  const result=synthesize('これはノートです。')
  await vi.advanceTimersByTimeAsync(2999);expect(fetch).toHaveBeenCalledTimes(1)
  await vi.advanceTimersByTimeAsync(2001);expect((await result).toString()).toBe('audio-payload')
  expect(fetch).toHaveBeenCalledTimes(4)
})
it('stops rather than ignoring long cooldowns or retrying indefinitely',async()=>{
  const fetch=vi.fn().mockResolvedValue(new Response('',{status:429,headers:{'Retry-After':'600'}}));vi.stubGlobal('fetch',fetch)
  await expect(synthesize('ノート')).rejects.toThrow('HTTP 429');expect(fetch).toHaveBeenCalledTimes(1)
})
