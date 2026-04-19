// src/app/dashboard/mangrove-plan/threats/page.tsx
// Threats analysis, cover loss data, pole extraction trends
'use client';
import { BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer,LineChart,Line } from 'recharts';
 
// Pole extraction data from Table 4.1 in the Plan
const POLE_EXTRACTION = [
  {year:'2003',Kwale:560,Mombasa:120,Kilifi:110,Lamu:4250},
  {year:'2004',Kwale:660,Mombasa:150,Kilifi:120,Lamu:4200},
  {year:'2005',Kwale:363,Mombasa:184,Kilifi:250,Lamu:3400},
  {year:'2006',Kwale:960,Mombasa:98, Kilifi:379,Lamu:3660},
  {year:'2007',Kwale:1029,Mombasa:111,Kilifi:111,Lamu:3004},
  {year:'2008',Kwale:704,Mombasa:153,Kilifi:74, Lamu:2284},
  {year:'2009',Kwale:478,Mombasa:135,Kilifi:90, Lamu:3768},
  {year:'2010',Kwale:387,Mombasa:122,Kilifi:50, Lamu:21577},
  {year:'2011',Kwale:456,Mombasa:92, Kilifi:70, Lamu:72984},
  {year:'2012',Kwale:472,Mombasa:96, Kilifi:82, Lamu:23224},
  {year:'2013',Kwale:478,Mombasa:100,Kilifi:92, Lamu:96531},
  {year:'2014',Kwale:454,Mombasa:103,Kilifi:95, Lamu:96103},
];
 
const THREATS = [
  {threat:'Illegal logging/over-exploitation',severity:5,counties:'All counties'},
  {threat:'Land conversion (salt works, agriculture)',severity:4,counties:'Kilifi, Tana River'},
  {threat:'Oil spills and pollution',severity:4,counties:'Mombasa'},
  {threat:'Sedimentation',severity:3,counties:'Kilifi, Mombasa, Lamu'},
  {threat:'Urban encroachment',severity:4,counties:'Mombasa, Kilifi'},
  {threat:'Aquaculture conversion',severity:3,counties:'Kilifi (Ngomeni)'},
  {threat:'Climate change/sea level rise',severity:3,counties:'Tana River, Lamu'},
  {threat:'River damming and diversion',severity:3,counties:'Kwale (Gazi Bay)'},
  {threat:'El Nino sedimentation events',severity:2,counties:'Lamu, Mombasa, Gazi'},
];
 
export default function ThreatsPage() {
  return (
    <div>
      <h1 style={{fontSize:'22px',fontWeight:'700',color:'#0F6E56',margin:'0 0 4px'}}>
        Threats Analysis
      </h1>
      <p style={{color:'#888',fontSize:'13px',margin:'0 0 20px'}}>
        Between 1985-2009: 20% national cover loss — 450 ha/year
      </p>
      <div style={{background:'#FCEBEB',border:'0.5px solid #F09595',borderRadius:'10px',
        padding:'12px',marginBottom:'16px'}}>
        <p style={{fontSize:'13px',fontWeight:'600',color:'#A32D2D',margin:'0 0 4px'}}>
          Critical: Mombasa lost over 70% of mangrove cover (1985-2009)
        </p>
        <p style={{fontSize:'12px',color:'#791F1F',margin:0}}>
          Tudor Creek: 80% vegetation loss | Makupa Creek: destroyed by 1988 oil spill — not recovered
        </p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
        <div style={{background:'white',borderRadius:'10px',padding:'16px',border:'0.5px solid #ddd'}}>
          <p style={{fontSize:'13px',fontWeight:'600',margin:'0 0 12px'}}>
            Threat severity index
          </p>
          {THREATS.map(t=>(
            <div key={t.threat} style={{marginBottom:'8px'}}>
              <div style={{display:'flex',justifyContent:'space-between',
                fontSize:'11px',marginBottom:'3px'}}>
                <span>{t.threat}</span>
                <span style={{color:'#888'}}>{t.counties}</span>
              </div>
              <div style={{background:'#f0f0f0',borderRadius:'4px',height:'6px'}}>
                <div style={{width:`${t.severity*20}%`,
                  background:t.severity>=4?'#E24B4A':t.severity===3?'#BA7517':'#1D9E75',
                  borderRadius:'4px',height:'6px'}}/>
              </div>
            </div>
          ))}
        </div>
        <div style={{background:'white',borderRadius:'10px',padding:'16px',border:'0.5px solid #ddd'}}>
          <p style={{fontSize:'13px',fontWeight:'600',margin:'0 0 12px'}}>
            Pole extraction trends (scores of poles, 2003-2014)
          </p>
          <ResponsiveContainer width='100%' height={280}>
            <LineChart data={POLE_EXTRACTION}>
              <XAxis dataKey='year' tick={{fontSize:10}}/>
              <YAxis tick={{fontSize:10}}
                tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}k`:v}/>
              <Tooltip/>
              <Line type='monotone' dataKey='Lamu'    stroke='#1D9E75' strokeWidth={2} dot={{r:2}}/>
              <Line type='monotone' dataKey='Kwale'   stroke='#085041' strokeWidth={2} dot={{r:2}}/>
              <Line type='monotone' dataKey='Kilifi'  stroke='#5DCAA5' strokeWidth={2} dot={{r:2}}/>
              <Line type='monotone' dataKey='Mombasa' stroke='#E24B4A' strokeWidth={2} dot={{r:2}}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
 
