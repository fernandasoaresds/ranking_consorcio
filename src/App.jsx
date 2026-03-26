import React, { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";
import { supabase } from "./supabase";

const B = { dark:"#003641", teal:"#00ae9d", green:"#7db61c", lime:"#c9d200", purple:"#49479d" };
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "";

const mascotSrc = "Elefante mascote e consórcio potiguar.png"

function todayISO() { return new Date().toISOString().slice(0,10); }
function currencyBRL(v) { return new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL",maximumFractionDigits:0}).format(v||0); }
function fmtDate(d) { if(!d) return "-"; return new Date(`${d}T12:00:00`).toLocaleDateString("pt-BR"); }
function pct(a,b) { return b ? Math.min(Math.round((a/b)*100),999) : 0; }

const SAMPLE_SALES = [
  {id:1,nome:"Fernanda Lima",  pa:"PA 001",valor:185000,data:todayISO()},
  {id:2,nome:"Paulo Vitor",    pa:"PA 001",valor:162500,data:todayISO()},
  {id:3,nome:"Ana Beatriz",    pa:"PA 002",valor:149900,data:todayISO()},
  {id:4,nome:"Carlos Eduardo", pa:"PA 002",valor:121300,data:todayISO()},
  {id:5,nome:"Juliana Costa",  pa:"PA 003",valor:98500, data:todayISO()},
  {id:6,nome:"Marcos Silva",   pa:"PA 003",valor:86500, data:todayISO()},
];

async function fetchSales() {
  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .order("data", { ascending: false });

  if (error) throw error;

  return (data || []).map((item) => ({
    ...item,
    valor: Number(item.valor)
  }));
}

async function fetchGoals() {
  const { data, error } = await supabase
    .from("goals")
    .select("pa, valor");

  if (error) throw error;

  return Object.fromEntries(
    (data || []).map((item) => [item.pa, Number(item.valor)])
  );
}

const Ico = {
  Soccer:()=><svg width="36" height="36" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="18" stroke="rgba(255,255,255,0.55)" strokeWidth="2"/><polygon points="20,8 23,14 29,14 24,18 26,24 20,20 14,24 16,18 11,14 17,14" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.45)" strokeWidth="1"/></svg>,
  Trophy:({s=24,c="currentColor"})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>,
  Lock:({s=17})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Plus:({s=16})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Edit:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  Logout:({s=16})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Search:({s=14})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  X:({s=18})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Target:({s=20})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  BarChart:({s=20})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
};

function ChartTip({active,payload,label}) {
  if(!active||!payload?.length) return null;
  return (
    <div style={{background:"#002030",border:`1px solid ${B.teal}44`,borderRadius:12,padding:"10px 14px",fontSize:13}}>
      <p style={{color:"rgba(255,255,255,.55)",marginBottom:6,fontWeight:700}}>{label}</p>
      {payload.map((p,i)=>(
        <p key={i} style={{color:p.color||B.lime,fontWeight:800}}>{p.name}: {typeof p.value==="number"&&p.value>999?currencyBRL(p.value):p.value}</p>
      ))}
    </div>
  );
}

function App() {
  const [sales, setSales]   = useState([]);
  const [goals, setGoals]   = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [filterDate, setFilterDate] = useState(todayISO());
  const [filterPA, setFilterPA]     = useState("todas");
  const [tab, setTab]   = useState("ranking");
  const [adminOpen, setAdminOpen]   = useState(false);
  const [adminLogged, setAdminLogged] = useState(false);
  const [pwd, setPwd]   = useState(""); const [pwdErr, setPwdErr] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId]     = useState(null);
  const [form, setForm] = useState({nome:"",pa:"",valor:"",data:todayISO()});
  const [goalPA, setGoalPA] = useState(""); const [goalVal, setGoalVal] = useState("");

 async function reloadAll() {
  const [loadedSales, loadedGoals] = await Promise.all([
    fetchSales(),
    fetchGoals()
  ]);

  setSales(loadedSales);
  setGoals(loadedGoals);
}

useEffect(() => {
  let active = true;

  async function boot() {
    try {
      const [{ data: { session } }, loadedSales, loadedGoals] = await Promise.all([
        supabase.auth.getSession(),
        fetchSales(),
        fetchGoals()
      ]);

      if (!active) return;

      setAdminLogged(!!session);
      setSales(loadedSales);
      setGoals(loadedGoals);
    } catch (error) {
      console.error(error);
    } finally {
      if (active) setLoading(false);
    }
  }

  boot();

  const {
    data: { subscription }
  } = supabase.auth.onAuthStateChange((_event, session) => {
    setAdminLogged(!!session);
  });

  return () => {
    active = false;
    subscription.unsubscribe();
  };
}, []);

  const allPAs = useMemo(()=>[...new Set(sales.map(s=>s.pa).filter(Boolean))].sort(),[sales]);

  const filtered = useMemo(()=>{
    const q=search.trim().toLowerCase();
    return sales.filter(s=>{
      const dOk=!filterDate||s.data===filterDate;
      const nOk=!q||s.nome.toLowerCase().includes(q);
      const pOk=filterPA==="todas"||s.pa===filterPA;
      return dOk&&nOk&&pOk;
    });
  },[sales,filterDate,search,filterPA]);

  const ranking = useMemo(()=>{
    const map={};
    filtered.forEach(s=>{
      if(!map[s.nome]) map[s.nome]={nome:s.nome,pa:s.pa||"—",total:0,count:0,lastDate:s.data};
      map[s.nome].total+=Number(s.valor); map[s.nome].count+=1;
      if(s.data>map[s.nome].lastDate) map[s.nome].lastDate=s.data;
    });
    return Object.values(map).sort((a,b)=>b.total-a.total).map((r,i)=>({...r,pos:i+1}));
  },[filtered]);

  const paStats = useMemo(()=>{
    const map={};
    sales.forEach(s=>{ const pa=s.pa||"Sem PA"; if(!map[pa]) map[pa]={pa,total:0,count:0}; map[pa].total+=Number(s.valor); map[pa].count+=1; });
    return Object.values(map).sort((a,b)=>b.total-a.total);
  },[sales]);

  const topColabs = useMemo(()=>{
    const map={};
    sales.forEach(s=>{ if(!map[s.nome]) map[s.nome]={nome:s.nome,total:0}; map[s.nome].total+=Number(s.valor); });
    return Object.values(map).sort((a,b)=>b.total-a.total).slice(0,8);
  },[sales]);

  const salesByDate = useMemo(()=>{
    const map={};
    sales.forEach(s=>{ if(!map[s.data]) map[s.data]={data:s.data,total:0,count:0}; map[s.data].total+=Number(s.valor); map[s.data].count+=1; });
    return Object.values(map).sort((a,b)=>a.data<b.data?-1:1).map(d=>({...d,dataFmt:fmtDate(d.data)}));
  },[sales]);

  const paChartData = useMemo(()=>paStats.map(p=>({pa:p.pa,total:p.total,vendas:p.count,meta:goals[p.pa]||0})),[paStats,goals]);
  const pieData     = useMemo(()=>paStats.map((p,i)=>({name:p.pa,value:p.total,color:[B.teal,B.lime,B.purple,B.green,"#e07b39","#c9509d"][i%6]})),[paStats]);

  const totalVol = filtered.reduce((s,x)=>s+Number(x.valor),0);
  const leader   = ranking[0]; const topVal = leader?.total||1;

  async function loginAdmin() {
  if (!ADMIN_EMAIL) {
    setPwdErr("Defina VITE_ADMIN_EMAIL na Vercel.");
    return;
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: pwd
  });

  if (error) {
    setPwdErr("Senha incorreta.");
    return;
  }

  setPwd("");
  setPwdErr("");
  setAdminOpen(false);
}

async function logoutAdmin() {
  await supabase.auth.signOut();
  setAdminLogged(false);
  setAdminOpen(false);
}
  function openNew(){setEditId(null);setForm({nome:"",pa:"",valor:"",data:filterDate||todayISO()});setFormOpen(true);}
  function openEdit(s){setEditId(s.id);setForm({nome:s.nome,pa:s.pa||"",valor:String(s.valor),data:s.data});setFormOpen(true);}
  async function submitSale() {
  if (!form.nome.trim() || !form.valor || !form.data) return;

  const payload = {
    id: editId || Date.now(),
    nome: form.nome.trim(),
    pa: form.pa.trim() || null,
    valor: Number(form.valor),
    data: form.data
  };

  const { error } = await supabase
    .from("sales")
    .upsert(payload, { onConflict: "id" });

  if (error) {
    console.error(error);
    return;
  }

  await reloadAll();
  setFormOpen(false);
}

async function removeSale(id) {
  const { error } = await supabase
    .from("sales")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    return;
  }

  await reloadAll();
}

async function saveGoal() {
  if (!goalPA.trim() || !goalVal) return;

  const { error } = await supabase
    .from("goals")
    .upsert(
      {
        pa: goalPA.trim(),
        valor: Number(goalVal)
      },
      { onConflict: "pa" }
    );

  if (error) {
    console.error(error);
    return;
  }

  await reloadAll();
  setGoalPA("");
  setGoalVal("");
}

async function removeGoal(pa) {
  const { error } = await supabase
    .from("goals")
    .delete()
    .eq("pa", pa);

  if (error) {
    console.error(error);
    return;
  }

  await reloadAll();
}

  if(loading) return (
    <div style={{minHeight:"100vh",background:"#001820",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center"}}><div style={{fontSize:48,marginBottom:12}}>⚽</div><p style={{color:B.teal,fontSize:18,fontWeight:700}}>Carregando Copa Consórcio...</p></div>
    </div>
  );

  const PIE_COLORS=[B.teal,B.lime,B.purple,B.green,"#e07b39","#c9509d"];

  return (
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,#001f28 0%,#002d38 50%,#001820 100%)`,fontFamily:"'Trebuchet MS','Segoe UI',sans-serif",color:"#f0faf9",overflowX:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:5px;} ::-webkit-scrollbar-track{background:#001820;} ::-webkit-scrollbar-thumb{background:${B.teal}66;border-radius:3px;}
        .btn{cursor:pointer;border:none;font-family:inherit;transition:all .18s;display:inline-flex;align-items:center;gap:7px;}
        .btn:hover{filter:brightness(1.12);transform:translateY(-1px);}
        .btn:active{transform:translateY(0);}
        .inp{background:rgba(255,255,255,.07);border:1.5px solid rgba(255,255,255,.12);color:#fff;padding:10px 14px;border-radius:12px;font-family:inherit;font-size:14px;outline:none;transition:border-color .2s;width:100%;}
        .inp::placeholder{color:rgba(255,255,255,.32);}
        .inp:focus{border-color:${B.teal};box-shadow:0 0 0 3px ${B.teal}22;}
        .card{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:20px;backdrop-filter:blur(10px);}
        .overlay{position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:100;display:flex;align-items:center;justify-content:center;padding:16px;}
        .modal{background:#002831;border:1px solid rgba(0,174,157,.28);border-radius:24px;width:100%;padding:28px;position:relative;max-height:90vh;overflow-y:auto;}
        @keyframes slideUp{from{opacity:0;transform:translateY(22px);}to{opacity:1;transform:translateY(0);}}
        @keyframes pop{from{opacity:0;transform:scale(.93);}to{opacity:1;transform:scale(1);}}
        .asl{animation:slideUp .38s ease both;}
        .apop{animation:pop .32s cubic-bezier(.34,1.56,.64,1) both;}
        .rrow{transition:transform .18s,box-shadow .18s;}
        .rrow:hover{transform:translateX(4px);box-shadow:0 4px 20px rgba(0,174,157,.14);}
        .tabbtn{padding:9px 20px;border-radius:999px;border:none;font-family:inherit;font-size:12px;font-weight:800;cursor:pointer;transition:all .18s;letter-spacing:.7px;text-transform:uppercase;}
        table{width:100%;border-collapse:collapse;}
        th{padding:10px 14px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.9px;color:rgba(255,255,255,.4);font-weight:700;border-bottom:1px solid rgba(255,255,255,.07);}
        td{padding:11px 14px;border-bottom:1px solid rgba(255,255,255,.05);font-size:14px;}
        tr:last-child td{border-bottom:none;}
        tr:hover td{background:rgba(255,255,255,.025);}
        select.inp option{background:#002831;color:#fff;}
      `}</style>

      {/* HERO */}
      <div style={{position:"relative",overflow:"hidden",background:`linear-gradient(135deg,${B.dark} 0%,#005060 50%,${B.teal}99 100%)`}}>
        <div style={{position:"absolute",inset:0,opacity:.04,backgroundImage:`repeating-linear-gradient(0deg,transparent,transparent 60px,${B.lime} 60px,${B.lime} 62px),repeating-linear-gradient(90deg,transparent,transparent 60px,${B.lime} 60px,${B.lime} 62px)`,pointerEvents:"none"}}/>
        <div style={{position:"absolute",inset:0,background:`radial-gradient(circle at 72% 50%,${B.teal}28 0%,transparent 58%)`,pointerEvents:"none"}}/>
        <div style={{maxWidth:1200,margin:"0 auto",padding:"36px 24px 28px",position:"relative",zIndex:1}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:24,alignItems:"center"}}>
            <div className="asl">
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
                <span style={{background:B.lime,color:B.dark,padding:"5px 14px",borderRadius:999,fontSize:12,fontWeight:800,letterSpacing:1,textTransform:"uppercase"}}>⚽ Temporada 2026</span>
                <span style={{background:"rgba(255,255,255,.1)",color:"#fff",padding:"5px 14px",borderRadius:999,fontSize:12,fontWeight:600,border:"1px solid rgba(255,255,255,.15)"}}>Painel Diário</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                <Ico.Soccer/>
                <h1 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(42px,8vw,82px)",letterSpacing:2,color:"#fff",lineHeight:1,textShadow:`0 0 40px ${B.teal}55`}}>Copa Consórcio</h1>
              </div>
              <p style={{color:"rgba(255,255,255,.68)",fontSize:15,maxWidth:520,lineHeight:1.65}}>Ranking diário de performance comercial — pódio interativo, análises por PA e gestão completa de vendas.</p>
              <div style={{display:"flex",gap:12,marginTop:22,flexWrap:"wrap"}}>
                <button className="btn" onClick={()=>setAdminOpen(true)} style={{background:`linear-gradient(135deg,${B.lime},${B.green})`,color:B.dark,padding:"12px 22px",borderRadius:13,fontSize:14,fontWeight:800}}>
                  <Ico.Lock/> Área do Administrador
                </button>
                <button className="btn" onClick={()=>document.getElementById("main-sec")?.scrollIntoView({behavior:"smooth"})} style={{background:"rgba(255,255,255,.1)",color:"#fff",padding:"12px 22px",borderRadius:13,fontSize:14,fontWeight:700,border:"1px solid rgba(255,255,255,.2)"}}>
                  <Ico.Trophy s={16}/> Ver Ranking
                </button>
              </div>
            </div>
            <div style={{position:"relative",flexShrink:0}} className="apop">
              <div style={{position:"absolute",inset:-20,background:`radial-gradient(circle,${B.teal}2e,transparent 70%)`,borderRadius:"50%"}}/>
              <div style={{background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.14)",borderRadius:26,padding:10,backdropFilter:"blur(12px)"}}>
                <img src={mascotSrc} alt="Mascote" style={{height:210,width:"auto",objectFit:"contain",display:"block",filter:"drop-shadow(0 8px 24px rgba(0,0,0,.4))"}}/>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{maxWidth:1200,margin:"0 auto",padding:"0 24px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:14,marginTop:-24,position:"relative",zIndex:2}}>
          {[
            {label:"Volume do Dia",  value:currencyBRL(totalVol),       icon:"💰",c:B.teal},
            {label:"Lançamentos",    value:filtered.length,              icon:"📋",c:B.purple},
            {label:"Líder",          value:leader?.nome||"—",            icon:"👑",c:B.lime},
            {label:"Ticket Médio",   value:currencyBRL(filtered.length?totalVol/filtered.length:0),icon:"📈",c:B.green},
          ].map((c,i)=>(
            <div key={i} className="card asl" style={{animationDelay:`${i*.07}s`,padding:18}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div>
                  <p style={{fontSize:11,color:"rgba(255,255,255,.46)",fontWeight:700,textTransform:"uppercase",letterSpacing:.9,marginBottom:5}}>{c.label}</p>
                  <p style={{fontSize:c.label==="Líder"?16:23,fontWeight:900,fontFamily:"'Barlow Condensed',sans-serif",color:"#fff",lineHeight:1.1}}>{c.value}</p>
                </div>
                <div style={{background:c.c+"22",border:`1px solid ${c.c}44`,borderRadius:11,width:42,height:42,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{c.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* PODIUM */}
        <div style={{marginTop:34}}>
          <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,letterSpacing:2,color:B.lime,marginBottom:16,display:"flex",alignItems:"center",gap:9}}>
            <Ico.Trophy s={24} c={B.lime}/> Pódio da Rodada
          </h2>
          {ranking.length>=1?(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1.1fr 1fr",gap:12,alignItems:"flex-end"}}>
              {[
                {r:ranking[1],medal:"🥈",label:"2º Lugar",bg:`linear-gradient(160deg,${B.purple}cc,${B.dark})`,h:190,accent:B.purple},
                {r:ranking[0],medal:"🥇",label:"1º Lugar",bg:`linear-gradient(160deg,${B.lime}dd,${B.green}cc)`,h:252,accent:B.lime,dk:true},
                {r:ranking[2],medal:"🥉",label:"3º Lugar",bg:`linear-gradient(160deg,${B.teal}cc,${B.dark})`,h:172,accent:B.teal},
              ].map((p,i)=>p.r?(
                <div key={i} className="asl" style={{animationDelay:`${[.1,0,.2][i]}s`,background:p.bg,borderRadius:22,padding:"20px 16px",minHeight:p.h,border:`2px solid ${p.accent}55`,display:"flex",flexDirection:"column",justifyContent:"space-between",boxShadow:`0 8px 28px ${p.accent}33`}}>
                  <div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                      <span style={{background:"rgba(0,0,0,.28)",padding:"3px 10px",borderRadius:999,fontSize:11,fontWeight:800,color:p.dk?B.dark:"#fff"}}>{p.label}</span>
                      <span style={{fontSize:22}}>{p.medal}</span>
                    </div>
                    <p style={{fontSize:15,fontWeight:800,color:p.dk?B.dark:"#fff",lineHeight:1.2,marginBottom:3}}>{p.r.nome}</p>
                    <p style={{fontSize:11,color:p.dk?"rgba(0,54,65,.58)":"rgba(255,255,255,.52)",marginBottom:5}}>PA: {p.r.pa} · {p.r.count} venda(s)</p>
                    <p style={{fontSize:24,fontWeight:900,fontFamily:"'Barlow Condensed',sans-serif",color:p.dk?B.dark:"#fff"}}>{currencyBRL(p.r.total)}</p>
                  </div>
                  <div style={{marginTop:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:p.dk?"rgba(0,54,65,.55)":"rgba(255,255,255,.5)",marginBottom:5}}>
                      <span>Força na Copa</span><span>{pct(p.r.total,topVal)}%</span>
                    </div>
                    <div style={{background:"rgba(0,0,0,.22)",borderRadius:999,height:7,overflow:"hidden"}}>
                      <div style={{width:`${pct(p.r.total,topVal)}%`,height:"100%",background:p.dk?"rgba(0,0,0,.36)":"rgba(255,255,255,.62)",borderRadius:999,transition:"width .8s ease"}}/>
                    </div>
                  </div>
                </div>
              ):(
                <div key={i} style={{minHeight:p.h,borderRadius:22,border:"2px dashed rgba(255,255,255,.09)",display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(255,255,255,.2)",fontSize:13}}>Sem dados</div>
              ))}
            </div>
          ):(
            <div className="card" style={{padding:36,textAlign:"center",color:"rgba(255,255,255,.28)"}}>Nenhuma venda registrada para este filtro.</div>
          )}
        </div>

        {/* MAIN SECTION */}
        <div id="main-sec" style={{marginTop:34,marginBottom:48}}>
          <div className="card" style={{overflow:"hidden"}}>
            {/* Filters */}
            <div style={{padding:"20px 22px 0",display:"flex",flexWrap:"wrap",gap:10,alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(255,255,255,.07)",paddingBottom:14}}>
              <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:2,color:"#fff"}}>Central de Acompanhamento</h2>
              <div style={{display:"flex",gap:9,flexWrap:"wrap",alignItems:"center"}}>
                <div style={{position:"relative"}}>
                  <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",color:"rgba(255,255,255,.3)"}}><Ico.Search/></span>
                  <input className="inp" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar colaborador" style={{paddingLeft:33,width:180}}/>
                </div>
                <input type="date" className="inp" value={filterDate} onChange={e=>setFilterDate(e.target.value)} style={{width:150}}/>
                <select className="inp" value={filterPA} onChange={e=>setFilterPA(e.target.value)} style={{width:135}}>
                  <option value="todas">Todas as PAs</option>
                  {allPAs.map(pa=><option key={pa} value={pa}>{pa}</option>)}
                </select>
              </div>
            </div>

            {/* Tabs */}
            <div style={{padding:"12px 22px",display:"flex",gap:8,borderBottom:"1px solid rgba(255,255,255,.07)",flexWrap:"wrap"}}>
              {[{id:"ranking",l:"🏆 Ranking"},{id:"lancamentos",l:"📋 Lançamentos"},{id:"analises",l:"📊 Análises"}].map(t=>(
                <button key={t.id} className="tabbtn" onClick={()=>setTab(t.id)}
                  style={{background:tab===t.id?`linear-gradient(135deg,${B.teal},${B.green})`:"rgba(255,255,255,.07)",color:tab===t.id?"#fff":"rgba(255,255,255,.46)"}}>
                  {t.l}
                </button>
              ))}
            </div>

            {/* TAB: RANKING */}
            {tab==="ranking"&&(
              <div style={{padding:22,display:"flex",flexDirection:"column",gap:10}}>
                {ranking.length===0?(
                  <div style={{textAlign:"center",padding:40,color:"rgba(255,255,255,.26)",border:"2px dashed rgba(255,255,255,.08)",borderRadius:16}}>Nenhum resultado para os filtros aplicados</div>
                ):ranking.map((r,i)=>(
                  <div key={r.nome} className="card rrow asl" style={{padding:"14px 18px",animationDelay:`${i*.05}s`}}>
                    <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
                      <div style={{width:50,height:50,borderRadius:13,flexShrink:0,background:r.pos===1?`linear-gradient(135deg,${B.lime},${B.green})`:r.pos===2?`linear-gradient(135deg,${B.purple},#6a68b5)`:r.pos===3?`linear-gradient(135deg,${B.teal},${B.dark})`:`linear-gradient(135deg,#1a4a55,#2a6070)`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Bebas Neue',sans-serif",fontSize:20,color:r.pos===1?B.dark:"#fff",boxShadow:r.pos<=3?`0 4px 14px ${[B.lime,B.purple,B.teal][r.pos-1]}55`:"none"}}>
                        {r.pos<=3?["🥇","🥈","🥉"][r.pos-1]:r.pos}
                      </div>
                      <div style={{flex:1,minWidth:130}}>
                        <p style={{fontSize:15,fontWeight:800,color:"#fff",lineHeight:1.2}}>{r.nome}</p>
                        <p style={{fontSize:12,color:"rgba(255,255,255,.4)",marginTop:2}}>
                          <span style={{background:`${B.teal}22`,border:`1px solid ${B.teal}44`,borderRadius:6,padding:"1px 7px",marginRight:6,fontSize:11,fontWeight:700,color:B.teal}}>{r.pa}</span>
                          {r.count} venda(s) · {fmtDate(r.lastDate)}
                        </p>
                      </div>
                      <div style={{minWidth:185,flex:1}}>
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:5}}>
                          <span style={{color:"rgba(255,255,255,.42)"}}>Desempenho</span>
                          <span style={{fontWeight:900,color:B.lime,fontFamily:"'Barlow Condensed',sans-serif",fontSize:16}}>{currencyBRL(r.total)}</span>
                        </div>
                        <div style={{background:"rgba(255,255,255,.08)",borderRadius:999,height:7,overflow:"hidden"}}>
                          <div style={{width:`${pct(r.total,topVal)}%`,height:"100%",borderRadius:999,transition:"width .8s ease",background:r.pos===1?`linear-gradient(90deg,${B.lime},${B.green})`:r.pos===2?`linear-gradient(90deg,${B.purple},#7a78cc)`:`linear-gradient(90deg,${B.teal},${B.green})`}}/>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: LANÇAMENTOS */}
            {tab==="lancamentos"&&(
              <div style={{padding:22}}>
                <div style={{overflowX:"auto",borderRadius:12,border:"1px solid rgba(255,255,255,.07)"}}>
                  <table>
                    <thead><tr><th>Colaborador</th><th>PA</th><th>Data</th><th>Valor</th><th style={{textAlign:"right"}}>Status</th></tr></thead>
                    <tbody>
                      {filtered.length===0?(
                        <tr><td colSpan={5} style={{textAlign:"center",padding:32,color:"rgba(255,255,255,.26)"}}>Nenhum lançamento encontrado</td></tr>
                      ):filtered.map(s=>(
                        <tr key={s.id}>
                          <td style={{fontWeight:700,color:"#fff"}}>{s.nome}</td>
                          <td><span style={{background:`${B.teal}22`,border:`1px solid ${B.teal}44`,borderRadius:7,padding:"2px 9px",fontSize:12,fontWeight:700,color:B.teal}}>{s.pa||"—"}</span></td>
                          <td style={{color:"rgba(255,255,255,.5)"}}>{fmtDate(s.data)}</td>
                          <td style={{fontWeight:800,color:B.lime,fontFamily:"'Barlow Condensed',sans-serif",fontSize:16}}>{currencyBRL(s.valor)}</td>
                          <td style={{textAlign:"right"}}><span style={{background:B.green+"28",color:B.lime,border:`1px solid ${B.green}55`,padding:"3px 11px",borderRadius:999,fontSize:12,fontWeight:700}}>✓ Confirmado</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: ANÁLISES */}
            {tab==="analises"&&(
              <div style={{padding:22,display:"flex",flexDirection:"column",gap:36}}>

                {/* PA vs Meta — cards */}
                <div>
                  <h3 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:1.5,color:B.lime,marginBottom:4,display:"flex",alignItems:"center",gap:8}}>
                    <Ico.Target/> Performance por Agência (PA) vs Meta
                  </h3>
                  <p style={{fontSize:12,color:"rgba(255,255,255,.36)",marginBottom:18}}>Volume acumulado (todos os períodos) · metas definidas pelo administrador</p>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:12,marginBottom:22}}>
                    {paStats.map(p=>{
                      const meta=goals[p.pa]||0; const prog=meta?Math.min((p.total/meta)*100,100):0; const hit=meta&&p.total>=meta;
                      return(
                        <div key={p.pa} className="card" style={{padding:18,borderLeft:`3px solid ${hit?B.lime:B.teal}`}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                            <div>
                              <p style={{fontSize:16,fontWeight:800,color:"#fff"}}>{p.pa}</p>
                              <p style={{fontSize:12,color:"rgba(255,255,255,.4)",marginTop:2}}>{p.count} venda(s)</p>
                            </div>
                            {hit&&<span style={{background:B.lime+"33",color:B.lime,border:`1px solid ${B.lime}55`,padding:"3px 9px",borderRadius:999,fontSize:11,fontWeight:800,flexShrink:0}}>✓ Meta!</span>}
                          </div>
                          <p style={{fontSize:22,fontWeight:900,fontFamily:"'Barlow Condensed',sans-serif",color:"#fff",marginBottom:3}}>{currencyBRL(p.total)}</p>
                          {meta>0?(
                            <>
                              <p style={{fontSize:11,color:"rgba(255,255,255,.36)",marginBottom:7}}>Meta: {currencyBRL(meta)} · {pct(p.total,meta)}%</p>
                              <div style={{background:"rgba(255,255,255,.08)",borderRadius:999,height:8,overflow:"hidden"}}>
                                <div style={{width:`${prog}%`,height:"100%",borderRadius:999,background:hit?`linear-gradient(90deg,${B.lime},${B.green})`:`linear-gradient(90deg,${B.teal},${B.purple})`,transition:"width .8s ease"}}/>
                              </div>
                            </>
                          ):<p style={{fontSize:11,color:"rgba(255,255,255,.26)",marginTop:4}}>Sem meta definida</p>}
                        </div>
                      );
                    })}
                    {paStats.length===0&&<p style={{color:"rgba(255,255,255,.28)",fontSize:14}}>Nenhuma PA cadastrada ainda.</p>}
                  </div>

                  {/* Bar chart PA vs Meta */}
                  {paChartData.length>0&&(
                    <div style={{background:"rgba(0,0,0,.22)",borderRadius:16,padding:"18px 10px 12px"}}>
                      <p style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,.45)",marginBottom:12,paddingLeft:8,textTransform:"uppercase",letterSpacing:.8}}>Volume vs Meta por PA</p>
                      <ResponsiveContainer width="100%" height={210}>
                        <BarChart data={paChartData} margin={{top:0,right:16,left:0,bottom:0}}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)"/>
                          <XAxis dataKey="pa" tick={{fill:"rgba(255,255,255,.44)",fontSize:12}} axisLine={false} tickLine={false}/>
                          <YAxis tick={{fill:"rgba(255,255,255,.34)",fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}k`:v}/>
                          <Tooltip content={<ChartTip/>}/>
                          <Legend wrapperStyle={{fontSize:12,color:"rgba(255,255,255,.48)"}}/>
                          <Bar dataKey="total" name="Realizado" fill={B.teal} radius={[6,6,0,0]}/>
                          <Bar dataKey="meta"  name="Meta"      fill={B.lime} radius={[6,6,0,0]} opacity={0.7}/>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Top colaboradores */}
                <div>
                  <h3 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:1.5,color:B.teal,marginBottom:16,display:"flex",alignItems:"center",gap:8}}>
                    <Ico.BarChart/> Top Colaboradores — Volume Total
                  </h3>
                  {topColabs.length>0?(
                    <div style={{background:"rgba(0,0,0,.22)",borderRadius:16,padding:"18px 10px 12px"}}>
                      <ResponsiveContainer width="100%" height={Math.max(200,topColabs.length*32)}>
                        <BarChart data={topColabs} layout="vertical" margin={{top:0,right:70,left:0,bottom:0}}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" horizontal={false}/>
                          <XAxis type="number" tick={{fill:"rgba(255,255,255,.34)",fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
                          <YAxis type="category" dataKey="nome" tick={{fill:"rgba(255,255,255,.52)",fontSize:12}} axisLine={false} tickLine={false} width={115}/>
                          <Tooltip content={<ChartTip/>}/>
                          <Bar dataKey="total" name="Volume Total" radius={[0,6,6,0]}>
                            {topColabs.map((_,i)=><Cell key={i} fill={[B.lime,B.teal,B.green,B.purple,"#e07b39","#c9509d","#3eb8d4","#9ab61c"][i%8]}/>)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ):<p style={{color:"rgba(255,255,255,.28)",fontSize:14}}>Sem dados.</p>}
                </div>

                {/* Evolução diária */}
                <div>
                  <h3 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:1.5,color:B.green,marginBottom:16}}>
                    📈 Evolução Diária de Vendas
                  </h3>
                  {salesByDate.length>0?(
                    <div style={{background:"rgba(0,0,0,.22)",borderRadius:16,padding:"18px 10px 12px"}}>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={salesByDate} margin={{top:0,right:20,left:0,bottom:0}}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)"/>
                          <XAxis dataKey="dataFmt" tick={{fill:"rgba(255,255,255,.44)",fontSize:11}} axisLine={false} tickLine={false}/>
                          <YAxis tick={{fill:"rgba(255,255,255,.34)",fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
                          <Tooltip content={<ChartTip/>}/>
                          <Legend wrapperStyle={{fontSize:12,color:"rgba(255,255,255,.45)"}}/>
                          <Line type="monotone" dataKey="total" name="Volume" stroke={B.lime} strokeWidth={3} dot={{fill:B.lime,r:4,strokeWidth:0}} activeDot={{r:7}}/>
                          <Line type="monotone" dataKey="count" name="Qtd vendas" stroke={B.teal} strokeWidth={2} strokeDasharray="5 4" dot={false}/>
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ):<p style={{color:"rgba(255,255,255,.28)",fontSize:14}}>Sem dados cronológicos ainda.</p>}
                </div>

                {/* Pie */}
                {pieData.length>1&&(
                  <div>
                    <h3 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:1.5,color:B.purple,marginBottom:16}}>🥧 Participação por PA</h3>
                    <div style={{background:"rgba(0,0,0,.22)",borderRadius:16,padding:"18px 10px"}}>
                      <ResponsiveContainer width="100%" height={230}>
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" outerRadius={88} dataKey="value" nameKey="name"
                            label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`}
                            labelLine={{stroke:"rgba(255,255,255,.22)"}} fontSize={12}>
                            {pieData.map((d,i)=><Cell key={i} fill={d.color}/>)}
                          </Pie>
                          <Tooltip content={<ChartTip/>}/>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ADMIN MODAL */}
      {adminOpen&&(
        <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)setAdminOpen(false);}}>
          <div className="modal apop" style={{maxWidth:adminLogged?820:430}}>
            <button className="btn" onClick={()=>{if(adminLogged)logoutAdmin();else setAdminOpen(false);}} style={{position:"absolute",top:14,right:14,background:"rgba(255,255,255,.07)",color:"#fff",borderRadius:9,padding:"5px 9px"}}><Ico.X/></button>
            {!adminLogged?(
              <div>
                <div style={{marginBottom:22}}><div style={{fontSize:30,marginBottom:7}}>🔐</div>
                  <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,letterSpacing:2,color:"#fff",marginBottom:4}}>Área do Administrador</h2>
                  <p style={{color:"rgba(255,255,255,.42)",fontSize:14}}>Acesso restrito para registro e gestão de vendas</p>
                </div>
                <label style={{display:"block",fontSize:11,fontWeight:700,color:"rgba(255,255,255,.52)",marginBottom:7,textTransform:"uppercase",letterSpacing:.9}}>Senha</label>
                <input type="password" className="inp" value={pwd} onChange={e=>setPwd(e.target.value)} placeholder="Digite a senha" onKeyDown={e=>e.key==="Enter"&&loginAdmin()}/>
                {pwdErr&&<p style={{color:"#ff6b6b",fontSize:13,marginTop:7,fontWeight:600}}>{pwdErr}</p>}
                <button className="btn" onClick={loginAdmin} style={{width:"100%",background:`linear-gradient(135deg,${B.teal},${B.green})`,color:"#fff",padding:"12px",borderRadius:13,fontSize:14,fontWeight:800,justifyContent:"center",marginTop:14}}><Ico.Lock/> Entrar</button>
              </div>
            ):(
              <div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:10}}>
                  <div>
                    <p style={{fontSize:11,color:B.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:.9}}>Painel Administrativo</p>
                    <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,letterSpacing:2,color:"#fff"}}>Gestão de Vendas</h2>
                  </div>
                  <div style={{display:"flex",gap:9}}>
                    <button className="btn" onClick={openNew} style={{background:`linear-gradient(135deg,${B.green},${B.teal})`,color:"#fff",padding:"9px 16px",borderRadius:11,fontSize:13,fontWeight:800}}>
                      <Ico.Plus/> Nova Venda
                    </button>
                    <button className="btn" onClick={logoutAdmin} style={{background:"rgba(255,255,255,.07)",color:"rgba(255,255,255,.62)",padding:"9px 14px",borderRadius:11,fontSize:13}}>
                      <Ico.Logout/> Sair
                    </button>
                  </div>
                </div>

                {/* Stats bar */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
                  {[{l:"Total cadastradas",v:sales.length},{l:"Volume total",v:currencyBRL(sales.reduce((s,x)=>s+Number(x.valor),0))},{l:"PAs ativas",v:allPAs.length}].map((s,i)=>(
                    <div key={i} style={{background:"rgba(255,255,255,.05)",borderRadius:12,padding:"11px 13px"}}>
                      <p style={{fontSize:10,color:"rgba(255,255,255,.4)",marginBottom:3,textTransform:"uppercase",letterSpacing:.8}}>{s.l}</p>
                      <p style={{fontSize:19,fontWeight:900,color:"#fff",fontFamily:"'Barlow Condensed',sans-serif"}}>{s.v}</p>
                    </div>
                  ))}
                </div>

                {/* METAS */}
                <div style={{background:"rgba(0,0,0,.22)",borderRadius:14,padding:16,marginBottom:16}}>
                  <p style={{fontSize:12,fontWeight:800,color:B.lime,marginBottom:11,textTransform:"uppercase",letterSpacing:.8,display:"flex",alignItems:"center",gap:7}}><Ico.Target s={15}/> Metas por Agência (PA)</p>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:11}}>
                    <input className="inp" value={goalPA} onChange={e=>setGoalPA(e.target.value)} placeholder="PA (ex.: PA 001)" style={{flex:1,minWidth:110}}/>
                    <input type="number" className="inp" value={goalVal} onChange={e=>setGoalVal(e.target.value)} placeholder="Meta em R$" style={{flex:1,minWidth:120}}/>
                    <button className="btn" onClick={saveGoal} style={{background:`linear-gradient(135deg,${B.lime},${B.green})`,color:B.dark,padding:"10px 14px",borderRadius:11,fontSize:13,fontWeight:800,flexShrink:0}}>Salvar</button>
                  </div>
                  {Object.keys(goals).length>0?(
                    <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                      {Object.entries(goals).map(([pa,v])=>(
                        <div key={pa} style={{background:`${B.teal}18`,border:`1px solid ${B.teal}33`,borderRadius:10,padding:"5px 11px",display:"flex",alignItems:"center",gap:8,fontSize:13}}>
                          <span style={{fontWeight:700,color:B.lime}}>{pa}</span>
                          <span style={{color:"rgba(255,255,255,.55)"}}>{currencyBRL(v)}</span>
                          <button className="btn" onClick={()=>removeGoal(pa)} style={{background:"rgba(255,80,80,.14)",color:"#ff6b6b",borderRadius:6,padding:"2px 6px",fontSize:11}}>✕</button>
                        </div>
                      ))}
                    </div>
                  ):<p style={{fontSize:12,color:"rgba(255,255,255,.26)"}}>Nenhuma meta definida ainda.</p>}
                </div>

                {/* Tabela vendas */}
                <div style={{maxHeight:290,overflowY:"auto",borderRadius:13,border:"1px solid rgba(255,255,255,.08)"}}>
                  <table>
                    <thead style={{position:"sticky",top:0,background:"#002831"}}>
                      <tr><th>Colaborador</th><th>PA</th><th>Data</th><th>Valor</th><th style={{textAlign:"right"}}>Ações</th></tr>
                    </thead>
                    <tbody>
                      {sales.slice().sort((a,b)=>b.data<a.data?-1:1).map(s=>(
                        <tr key={s.id}>
                          <td style={{fontWeight:700,color:"#fff"}}>{s.nome}</td>
                          <td><span style={{background:`${B.teal}1a`,border:`1px solid ${B.teal}33`,borderRadius:6,padding:"1px 8px",fontSize:12,fontWeight:700,color:B.teal}}>{s.pa||"—"}</span></td>
                          <td style={{color:"rgba(255,255,255,.52)"}}>{fmtDate(s.data)}</td>
                          <td style={{fontWeight:700,color:B.lime}}>{currencyBRL(s.valor)}</td>
                          <td style={{textAlign:"right"}}>
                            <div style={{display:"flex",justifyContent:"flex-end",gap:7}}>
                              <button className="btn" onClick={()=>openEdit(s)} style={{background:"rgba(255,255,255,.07)",color:"rgba(255,255,255,.62)",padding:"6px 9px",borderRadius:9}}><Ico.Edit/></button>
                              <button className="btn" onClick={()=>removeSale(s.id)} style={{background:"rgba(255,80,80,.1)",color:"#ff6b6b",padding:"6px 9px",borderRadius:9}}><Ico.Trash/></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FORM MODAL */}
      {formOpen&&(
        <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)setFormOpen(false);}}>
          <div className="modal apop" style={{maxWidth:415}}>
            <button className="btn" onClick={()=>setFormOpen(false)} style={{position:"absolute",top:14,right:14,background:"rgba(255,255,255,.07)",color:"#fff",borderRadius:9,padding:"5px 9px"}}><Ico.X/></button>
            <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,letterSpacing:2,color:"#fff",marginBottom:4}}>{editId?"Editar Venda":"Registrar Venda"}</h2>
            <p style={{color:"rgba(255,255,255,.38)",fontSize:13,marginBottom:20}}>{editId?"Atualize os dados da venda":"Preencha os dados do novo lançamento"}</p>
            {[
              {label:"Nome do Colaborador",key:"nome",type:"text",placeholder:"Ex.: João Pedro"},
              {label:"PA (Agência)",        key:"pa",  type:"text",placeholder:"Ex.: PA 001"},
              {label:"Valor da Venda (R$)", key:"valor",type:"number",placeholder:"Ex.: 125000"},
              {label:"Data",               key:"data", type:"date"},
            ].map(f=>(
              <div key={f.key} style={{marginBottom:13}}>
                <label style={{display:"block",fontSize:11,fontWeight:700,color:"rgba(255,255,255,.52)",marginBottom:6,textTransform:"uppercase",letterSpacing:.8}}>{f.label}</label>
                <input type={f.type} className="inp" value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder||""}/>
              </div>
            ))}
            <button className="btn" onClick={submitSale} disabled={!form.nome.trim()||!form.valor||!form.data}
              style={{width:"100%",background:`linear-gradient(135deg,${B.lime},${B.green})`,color:B.dark,padding:"12px",borderRadius:13,fontSize:14,fontWeight:900,justifyContent:"center",marginTop:4,opacity:(!form.nome.trim()||!form.valor||!form.data)?.5:1}}>
              {editId?"💾 Salvar Alterações":"✅ Registrar Venda"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
