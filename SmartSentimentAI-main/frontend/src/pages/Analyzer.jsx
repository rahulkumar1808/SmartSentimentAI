import {useState} from "react";
import {Sparkles, RotateCcw, Send, CheckCircle2, AlertCircle} from "lucide-react";
import {api} from "../services/api";
const samples = [
 "The story was captivating, the acting was brilliant, and I enjoyed every minute.",
 "The plot was confusing and slow. The acting felt dull and the ending disappointed me.",
 "A wonderful experience with friendly staff and excellent service."
];
export default function Analyzer({onDone}) {
 const [text,setText]=useState(""); const [result,setResult]=useState(null); const [loading,setLoading]=useState(false); const [error,setError]=useState("");
 async function run(){ if(text.trim().length<3){setError("Enter at least 3 characters.");return;} setLoading(true);setError("");setResult(null);try{const r=await api.analyze(text.trim());setResult(r);onDone();}catch(e){setError(e.message);}finally{setLoading(false);}}
 return <div className="page"><div className="page-heading"><div><div className="eyebrow">NLP WORKSPACE</div><h1>Sentiment Analyzer</h1><p>Discover the emotion behind any review or message.</p></div></div>
 <div className="analyzer-grid"><section className="panel input-panel"><div className="panel-title"><div><h2>Enter your text</h2><p>Paste a review, feedback, or message below.</p></div><span className="soft-tag">LSTM POWERED</span></div>
 <textarea value={text} maxLength={5000} onChange={e=>setText(e.target.value)} placeholder="Type or paste your review here..."/>
 <div className="textarea-footer"><span>{text.length}/5000 characters</span><button className="text-button" onClick={()=>{setText("");setResult(null);setError("");}}><RotateCcw size={14}/> Clear</button></div>
 <div className="sample-row"><span>Try an example:</span>{samples.map((s,i)=><button key={i} onClick={()=>setText(s)}>Example {i+1}</button>)}</div>
 {error&&<div className="error"><AlertCircle size={16}/>{error}</div>}
 <button className="primary-btn analyze-btn" disabled={loading||!text.trim()} onClick={run}>{loading?<><span className="spinner"/> Analyzing...</>:<><Sparkles size={17}/> Analyze sentiment <Send size={15}/></>}</button>
 </section>
 <section className="panel result-panel"><div className="panel-title"><div><h2>Analysis result</h2><p>Prediction and explanation appear here.</p></div></div>
 {!result?<div className="empty-result"><div className="empty-icon"><Sparkles size={25}/></div><b>Ready when you are</b><span>Your sentiment analysis will appear in this panel.</span></div>:
 <div className="result-content"><div className={`sentiment-banner ${result.sentiment.toLowerCase()}`}><div className="sentiment-symbol">{result.sentiment==="Positive"?"😊":"☹"}</div><div><small>LSTM MODEL PREDICTION</small><h2>{result.sentiment}</h2><span>{result.confidence}% confidence</span></div></div>
 <div className="confidence-head"><b>Prediction confidence</b><strong>{result.confidence}%</strong></div><div className="progress"><span style={{width:`${result.confidence}%`}}/></div>
 <div className="explanation-box"><div className="explain-heading"><Sparkles size={16}/> <b>Generative AI explanation</b><span className={result.explanation_source==="groq"?"available":"unavailable"}>{result.explanation_source==="groq"?"GROQ":"UNAVAILABLE"}</span></div><p>{result.explanation}</p></div>
 <div className="disclaimer"><CheckCircle2 size={15}/> Sentiment classification is performed by the trained LSTM. GenAI only explains its result.</div></div>}
 </section></div></div>
}
