import {LayoutDashboard, ScanText, History, Activity, Info, Sparkles} from "lucide-react";
const items = [["Dashboard",LayoutDashboard],["Sentiment Analyzer",ScanText],["Analysis History",History],["Model Performance",Activity],["About Project",Info]];
export default function Sidebar({page,setPage}) {
 return <aside className="sidebar"><div className="brand"><span className="brand-icon"><Sparkles size={20}/></span><div><b>SmartSentiment</b><small>AI INSIGHTS</small></div></div><nav>{items.map(([name,Icon])=><button key={name} className={page===name?"nav-item active":"nav-item"} onClick={()=>setPage(name)}><Icon size={18}/>{name}</button>)}</nav><div className="side-note">Understand every review.<br/><b>One insight at a time.</b></div></aside>
}
