import {useEffect,useState} from "react";
import {MessageSquareText,ThumbsUp,ThumbsDown,Activity,ArrowUpRight} from "lucide-react";
import {Doughnut} from "react-chartjs-2";
import {Chart as ChartJS,ArcElement,Tooltip,Legend} from "chart.js";
import StatCard from "../components/StatCard";
import {api} from "../services/api";
ChartJS.register(ArcElement,Tooltip,Legend);
export default function Dashboard({refresh,pageTo}) {
 const [stats,setStats]=useState({total:0,positive:0,negative:0});const [history,setHistory]=useState([]);
 useEffect(()=>{api.stats().then(setStats).catch(()=>{});api.history().then(setHistory).catch(()=>{});},[refresh]);
 const chart={labels:["Positive","Negative"],datasets:[{data:[stats.positive,stats.negative],backgroundColor:["#20b889","#f06b75"],borderWidth:0,hoverOffset:5}]};
 return <div className="page"><div className="page-heading"><div><div className="eyebrow">OVERVIEW</div><h1>Dashboard</h1><p>Welcome to your intelligent sentiment workspace.</p></div><button className="primary-btn" onClick={()=>pageTo("Sentiment Analyzer")}>New analysis <ArrowUpRight size={16}/></button></div>
 <div className="stats-grid"><StatCard label="Total analyses" value={stats.total} sub="Reviews processed" icon={MessageSquareText}/><StatCard label="Positive reviews" value={stats.positive} sub="Positive predictions" icon={ThumbsUp} tone="green"/><StatCard label="Negative reviews" value={stats.negative} sub="Negative predictions" icon={ThumbsDown} tone="red"/><StatCard label="Model type" value="LSTM" sub="Deep learning classifier" icon={Activity} tone="purple"/></div>
 <div className="dashboard-grid"><section className="panel chart-panel"><div className="panel-title"><div><h2>Sentiment distribution</h2><p>Breakdown of all saved analyses</p></div></div>{stats.total?<div className="chart-wrap"><Doughnut data={chart} options={{maintainAspectRatio:false,cutout:"72%",plugins:{legend:{position:"bottom",labels:{usePointStyle:true,padding:22}}}}}/></div>:<div className="chart-empty">No analyses yet. Run your first review to see the chart.</div>}</section>
 <section className="panel recent-panel"><div className="panel-title"><div><h2>Recent analyses</h2><p>Your latest sentiment predictions</p></div><button className="text-button" onClick={()=>pageTo("Analysis History")}>View all <ArrowUpRight size={14}/></button></div>{history.length===0?<div className="chart-empty">Your recent analyses will appear here.</div>:history.slice(0,5).map(item=><div className="recent-item" key={item.id}><div className={`mini-dot ${item.sentiment.toLowerCase()}`}/><div className="recent-copy"><b>{item.sentiment}</b><span>{item.text}</span></div><strong>{item.confidence}%</strong></div>)}</section></div></div>
}
