import {useEffect,useState} from "react";
import {Activity,Target,CheckCircle2} from "lucide-react";
import {api} from "../services/api";
export default function Performance(){
 const [m,setM]=useState(null);useEffect(()=>{api.metrics().then(setM).catch(e=>setM({message:e.message}));},[]);
 const names=[["Accuracy","accuracy"],["Precision","precision"],["Recall","recall"],["F1-score","f1_score"]];
 return <div className="page"><div className="page-heading"><div><div className="eyebrow">MODEL EVALUATION</div><h1>Model Performance</h1><p>Held-out evaluation metrics from the trained LSTM.</p></div></div>
 <section className="panel performance-panel"><div className="panel-title"><div><h2><Activity size={18}/> Evaluation results</h2><p>Metrics are populated from the actual training run.</p></div></div>
 {m?.status==="trained"?<><div className="metric-grid">{names.map(([label,key])=><div className="metric-card" key={key}><span>{label}</span><b>{(m[key]*100).toFixed(2)}%</b><div className="metric-track"><i style={{width:`${m[key]*100}%`}}/></div></div>)}</div><div className="dataset-note"><CheckCircle2 size={16}/> Dataset: {m.dataset} · Epochs: {m.epochs} · Test samples: {m.test_samples}</div></>:<div className="setup-callout"><Target size={25}/><h3>Model evaluation is not available yet</h3><p>{m?.message||"Train the model to generate real evaluation metrics."}</p><code>cd backend<br/>python train_model.py</code></div>}</section></div>
}
