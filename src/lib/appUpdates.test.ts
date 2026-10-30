import {afterEach,beforeEach,it,expect,vi} from 'vitest'
beforeEach(()=>{vi.resetModules()})
afterEach(()=>{vi.useRealTimers();vi.unstubAllGlobals();vi.unstubAllEnvs()})
it('keeps a valid installation pending beyond eight seconds and completes only when its real registration is ready',async()=>{
 vi.useFakeTimers()
 let ready!:(value:object)=>void
 vi.stubGlobal('navigator',{serviceWorker:{ready:new Promise(resolve=>{ready=resolve}),controller:null}})
 const {offlineAppReady}=await import('./appUpdates')
 let settled=false
 const waiting=offlineAppReady(new AbortController().signal).then(()=>{settled=true})
 await vi.advanceTimersByTimeAsync(9000);expect(settled).toBe(false)
 ready({active:{}});await waiting;expect(settled).toBe(true)
})
it('cancels an unfinished installation wait when its screen closes',async()=>{
 vi.stubGlobal('navigator',{serviceWorker:{ready:new Promise(()=>{}),controller:null}})
 const {offlineAppReady}=await import('./appUpdates'),controller=new AbortController()
 const waiting=offlineAppReady(controller.signal),rejected=expect(waiting).rejects.toMatchObject({name:'AbortError'})
 controller.abort();await rejected
})
it('reports an actual registration failure instead of waiting forever for ready',async()=>{
 vi.stubEnv('PROD',true)
 vi.stubGlobal('navigator',{serviceWorker:{ready:new Promise(()=>{}),controller:null,register:vi.fn().mockRejectedValue(new Error('offline script unavailable'))}})
 const {registerAppUpdates,offlineAppReady}=await import('./appUpdates')
 const waiting=offlineAppReady(new AbortController().signal),rejected=expect(waiting).rejects.toThrow('Offline app installation failed')
 registerAppUpdates();window.dispatchEvent(new Event('load'));await rejected
})
it('does not revoke a working offline registration just because its update fails',async()=>{
 vi.stubEnv('PROD',true)
 vi.stubGlobal('navigator',{serviceWorker:{ready:Promise.resolve({active:{}}),controller:{},register:vi.fn().mockRejectedValue(new Error('update network failure'))}})
 const {registerAppUpdates,offlineAppReady}=await import('./appUpdates')
 registerAppUpdates();window.dispatchEvent(new Event('load'));await Promise.resolve()
 await expect(offlineAppReady(new AbortController().signal)).resolves.toBeUndefined()
})
it('allows an explicit retry after the initial registration fails',async()=>{
 vi.stubEnv('PROD',true)
 let ready!:(value:object)=>void
 const registration={active:{},waiting:null,installing:null,addEventListener:vi.fn()}
 const register=vi.fn().mockRejectedValueOnce(new Error('first connection unavailable')).mockImplementationOnce(async()=>{ready(registration);return registration})
 vi.stubGlobal('navigator',{serviceWorker:{ready:new Promise(resolve=>{ready=resolve}),controller:null,register}})
 const {offlineAppReady}=await import('./appUpdates')
 const first=offlineAppReady(new AbortController().signal)
 window.dispatchEvent(new Event('load'))
 await expect(first).rejects.toThrow('Offline app installation failed')
 const second=offlineAppReady(new AbortController().signal)
 window.dispatchEvent(new Event('load'));await second
 expect(register).toHaveBeenCalledTimes(2)
})
