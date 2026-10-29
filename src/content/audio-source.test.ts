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
it('waits for a long teaching job without resubmitting synthesis',async()=>{
  vi.useFakeTimers()
  const fetch=vi.fn().mockResolvedValueOnce(Response.json({success:true,audioStatusUrl:'https://audio1.tts.quest/status',wavDownloadUrl:'https://audio1.tts.quest/audio'}))
  for(let n=0;n<22;n++)fetch.mockResolvedValueOnce(Response.json({isAudioReady:false,isAudioError:false}))
  fetch.mockResolvedValueOnce(Response.json({isAudioReady:true,isAudioError:false})).mockResolvedValueOnce(new Response('long-teaching'))
  vi.stubGlobal('fetch',fetch)
  const result=synthesize('時刻の長い教え方')
  await vi.advanceTimersByTimeAsync(46000)
  expect((await result).toString()).toBe('long-teaching')
  expect(fetch.mock.calls.filter(([url])=>String(url).includes('/synthesis?'))).toHaveLength(1)
})
it('terminates a permanently pending accepted job at the wall-clock deadline',async()=>{
  vi.useFakeTimers()
  const fetch=vi.fn().mockResolvedValueOnce(Response.json({success:true,audioStatusUrl:'https://audio1.tts.quest/status',wavDownloadUrl:'https://audio1.tts.quest/audio'})).mockImplementation(async()=>Response.json({isAudioReady:false,isAudioError:false}))
  vi.stubGlobal('fetch',fetch)
  const result=expect(synthesize('時間')).rejects.toThrow('Synthesis status timed out')
  await vi.advanceTimersByTimeAsync(120000);await result
  expect(fetch.mock.calls.filter(([url])=>String(url).includes('/synthesis?'))).toHaveLength(1)
  expect(fetch.mock.calls.filter(([url])=>String(url).includes('/status'))).toHaveLength(59)
})
