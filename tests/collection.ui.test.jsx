import { beforeEach, it, expect, vi } from 'vitest'
import { renderHook, waitFor, cleanup, act } from '@testing-library/react'
import { useCollection } from '../src/hooks/useCollection'
const mocks = vi.hoisted(() => ({ range: vi.fn() }))
vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({ profile:{name:'Nam'},user:{} }) }))
vi.mock('@/lib/notify', () => ({ logNotification:vi.fn() }))
vi.mock('@/lib/supabase', () => ({ supabase: { from: () => { const query={select:()=>query,order:()=>query,eq:()=>query,range:mocks.range};return query } } }))
beforeEach(()=>{cleanup();vi.clearAllMocks()})
it('loads more than the API row cap so large payment totals are not truncated', async () => {
 mocks.range.mockImplementation(async (from,to)=>({data:Array.from({length:Math.max(0,Math.min(to+1,1001)-from)},(_,i)=>({id:from+i,amount:1})),error:null}))
 const {result,unmount}=renderHook(()=>useCollection('budget_transactions',{realtime:false}))
 await waitFor(()=>expect(result.current.loading).toBe(false))
 expect(result.current.rows.length).toBe(1001)
 expect(result.current.rows.reduce((sum,p)=>sum+p.amount,0)).toBe(1001)
 expect(mocks.range).toHaveBeenNthCalledWith(3,1000,1499)
 unmount()
})

it('manual reload retrieves fresh data and returns failures while preserving the last successful rows', async () => {
 mocks.range.mockResolvedValue({data:[{id:1,amount:10}],error:null})
 const {result,unmount}=renderHook(()=>useCollection('budget_transactions',{realtime:false}))
 await waitFor(()=>expect(result.current.loading).toBe(false))
 mocks.range.mockResolvedValueOnce({data:[{id:1,amount:20}],error:null})
 await act(async()=>{expect(await result.current.refetch()).toEqual({error:null})})
 expect(result.current.rows[0].amount).toBe(20)
 const failure={message:'Connection lost'}
 mocks.range.mockResolvedValueOnce({data:null,error:failure})
 await act(async()=>{expect(await result.current.refetch()).toEqual({error:failure})})
 expect(result.current.error).toEqual(failure)
 expect(result.current.rows[0].amount).toBe(20)
 mocks.range.mockResolvedValueOnce({data:[{id:1,amount:30}],error:null})
 await act(async()=>{await result.current.refetch()})
 expect(result.current.error).toBeNull()
 expect(result.current.rows[0].amount).toBe(30)
 unmount()
})
