import { Component, type ReactNode } from 'react'
interface Props {children: ReactNode; recover?: ()=>void}
export default class RecoveryBoundary extends Component<Props,{failed:boolean}> {
  state={failed:false}
  static getDerivedStateFromError(){return {failed:true}}
  render(){
    if(!this.state.failed)return this.props.children
    return <div role="alert" className="min-h-screen flex flex-col items-center justify-center gap-4 p-6"><p>目前無法顯示這次練習，原有學習紀錄仍保留。</p>{this.props.recover&&<button className="min-h-16 px-6" onClick={this.props.recover}>保留紀錄並開始新練習</button>}<button className="min-h-16 px-6" onClick={()=>{window.location.hash='/';window.location.reload()}}>返回首頁</button></div>
  }
}
