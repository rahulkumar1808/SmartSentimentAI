import {useState} from "react";
import {Bell,Menu,Sun,Moon} from "lucide-react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Analyzer from "./pages/Analyzer";
import History from "./pages/History";
import Performance from "./pages/Performance";
import About from "./pages/About";
export default function App(){
 const [page,setPage]=useState("Dashboard");const [refresh,setRefresh]=useState(0);const [dark,setDark]=useState(true);
 const done=()=>setRefresh(x=>x+1);
 const content=page==="Dashboard"?<Dashboard refresh={refresh} pageTo={setPage}/>:page==="Sentiment Analyzer"?<Analyzer onDone={done}/>:page==="Analysis History"?<History refresh={refresh}/>:page==="Model Performance"?<Performance/>:<About/>;
 return <div className={dark?"app dark":"app light"}><Sidebar page={page} setPage={setPage}/><main className="main"><header className="topbar"><div className="crumb">Workspace <span>/</span> <b>{page}</b></div><div className="top-actions"><span className="online-dot"/> API workspace <button className="icon-btn" onClick={()=>setDark(!dark)} title="Toggle theme">{dark?<Sun size={18}/>:<Moon size={18}/>}</button><div className="avatar">SA</div></div></header>{content}</main></div>
}
