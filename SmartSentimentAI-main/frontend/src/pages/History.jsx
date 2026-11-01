import {useEffect,useState} from "react";
import {Download,Trash2,Search} from "lucide-react";
import {api} from "../services/api";
export default function History({refresh}) {
 const [items,setItems]=useState([]);const [query,setQuery]=useState("");const [error,setError]=useState("");
 async function load(){try{setItems(await api.history());setError("");}catch(e){setError(e.message);}}
 useEffect(()=>{load();},[refresh]);
 async function clear(){if(!window.confirm("Delete all saved analysis history?"))return;try{await api.clear();load();}catch(e){setError(e.message);}}
 const filtered=items.filter(x=>x.text.toLowerCase().includes(query.toLowerCase())||x.sentiment.toLowerCase().includes(query.toLowerCase()));
 return <div className="page"><div className="page-heading"><div><div className="eyebrow">YOUR ACTIVITY</div><h1>Analysis History</h1><p>Review, search, and export previous predictions.</p></div><div className="heading-actions"><a className="outline-btn" href={api.exportUrl}><Download size={16}/> Export CSV</a><button className="danger-btn" onClick={clear}><Trash2 size={16}/> Clear history</button></div></div>
 {error&&<div className="error">{error}</div>}<section className="panel history-panel"><div className="search-box"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search reviews or sentiment..."/></div>
 <div className="table-wrap"><table><thead><tr><th>REVIEW TEXT</th><th>PREDICTION</th><th>CONFIDENCE</th><th>EXPLANATION SOURCE</th><th>DATE</th></tr></thead><tbody>{filtered.map(x=><tr key={x.id}><td className="review-cell">{x.text}</td><td><span className={`pill ${x.sentiment.toLowerCase()}`}>{x.sentiment}</span></td><td>{x.confidence}%</td><td>{x.explanation_source==="groq"?"Groq AI":"Unavailable"}</td><td>{new Date(x.created_at).toLocaleString()}</td></tr>)}</tbody></table>{filtered.length===0&&<div className="chart-empty">No matching analyses found.</div>}</div></section></div>
}
