'use client';
import { useState } from 'react';

const COUNTIES = {
  Lamu: { area:37350, degraded:14407, pct_degraded:38.6, density:2225,
    blocks:['Northern Swamps 3,160ha','North Central Swamps 12,850ha','Mongoni-Dodori Creek 6,400ha','Pate Island 9,740ha','Southern Swamps 5,200ha'],
    species:[{s:'Avicennia',a:6966},{s:'Ceriops',a:5155},{s:'Rhizophora mix',a:8649},{s:'Rhizophora',a:5558},{s:'Sonneratia',a:1165}],
    threats:['Illegal harvesting','Oil spills and pollution','Overexploitation'],
    benefits:['Construction poles','Fuel wood','Fish production'],
    note:'Largest county - 62% of all Kenya mangroves. Kiunga Marine Reserve holds 7,628ha.' },
  Kilifi: { area:8536, degraded:3422, pct_degraded:40.0, density:3227,
    blocks:['Mtwapa 716ha','Kilifi-Takaungu 1,834ha','Mida Creek 1,746ha','Ngomeni 4,240ha'],
    species:[{s:'Avicennia',a:2714},{s:'Ceriops mix',a:1038},{s:'Rhizophora mix',a:1920},{s:'Ceriops',a:439},{s:'Rhizophora',a:318}],
    threats:['Illegal harvesting','Climate change','Soil erosion'],
    benefits:['Fuel wood','Construction poles','Fish production'],
    note:'Longest coastline in Kenya. Ngomeni covers 50% of county total.' },
  Kwale: { area:8354, degraded:3725, pct_degraded:44.6, density:3327,
    blocks:['Vanga-Funzi 7,638ha','Gazi Bay 715ha','Ukunda 1ha'],
    species:[{s:'Ceriops mix',a:3344},{s:'Rhizophora mix',a:1481},{s:'Avicennia',a:1376},{s:'Ceriops',a:1197},{s:'Sonneratia',a:256}],
    threats:['Illegal harvesting','Conversion to rice farms','Climate change'],
    benefits:['Fish production','Construction poles','Firewood'],
    note:'Mikoko Pamoja carbon project at Gazi Bay generates KES 1.2M per year to community.' },
  Mombasa: { area:3771, degraded:1850, pct_degraded:49.1, density:1636,
    blocks:['Port Reitz Creek','Tudor Creek','Mwache Creek','Bonje','Tsunza'],
    species:[{s:'Ceriops-Rhizophora',a:1729},{s:'Rhizophora mix',a:580},{s:'Avicennia',a:465},{s:'Ceriops',a:318},{s:'Rhizophora',a:202}],
    threats:['Illegal harvesting','Oil pollution','Sedimentation'],
    benefits:['Construction poles','Fish production','Fuel wood'],
    note:'Most degraded county at 49.1%. Tudor Creek lost 80% cover. Makupa Creek destroyed by 1988 oil spill.' },
  'Tana River': { area:3260, degraded:1180, pct_degraded:36.2, density:2218,
    blocks:['Kipini 1,257ha','Mto Tana 2,003ha'],
    species:[{s:'Avicennia',a:2848},{s:'Avicennia mix',a:159},{s:'Bruguiera-Heritiera-Xylocarpus',a:253}],
    threats:['Illegal cutting','Sea level rise','Settlement encroachment'],
    benefits:['Construction poles','Fishing','Fuel wood'],
    note:'Only riverine mangrove in Kenya. Only Heritiera stand in Kenya. Ramsar site designated 2012.' },
};

export default function CountyPage() {
  const [selected, setSelected] = useState<keyof typeof COUNTIES>('Lamu');
  const c = COUNTIES[selected];
  const maxSp = Math.max(...c.species.map(s => s.a));

  return (
    <div>
      <h1 style={{fontSize:'22px',fontWeight:'700',color:'#0F6E56',margin:'0 0 16px'}}>
        County Situation Analysis
      </h1>
      <select value={selected} onChange={e=>setSelected(e.target.value as keyof typeof COUNTIES)}
        style={{marginBottom:'20px',padding:'8px 16px',borderRadius:'8px',
          border:'1px solid #ddd',fontSize:'14px',cursor:'pointer'}}>
        {Object.keys(COUNTIES).map(k=><option key={k}>{k}</option>)}
      </select>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px',marginBottom:'20px'}}>
        {[
          [`${c.area.toLocaleString()} ha`,'Total area'],
          [`${c.degraded.toLocaleString()} ha`,'Degraded area'],
          [`${c.pct_degraded}%`,'Percent degraded'],
          [`${c.density.toLocaleString()}`,'Stems per ha'],
        ].map(([v,l])=>(
          <div key={l} style={{background:'white',borderRadius:'10px',padding:'16px',
            textAlign:'center',border:'0.5px solid #ddd'}}>
            <p style={{fontSize:'20px',fontWeight:'700',color:'#0F6E56',margin:0}}>{v}</p>
            <p style={{fontSize:'11px',color:'#888',margin:0}}>{l}</p>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginBottom:'16px'}}>
        <div style={{background:'white',borderRadius:'10px',padding:'16px',border:'0.5px solid #ddd'}}>
          <p style={{fontWeight:'600',fontSize:'13px',marginBottom:'12px'}}>Management blocks</p>
          {c.blocks.map(b=>(
            <div key={b} style={{padding:'6px 0',borderBottom:'0.5px solid #eee',fontSize:'13px'}}>{b}</div>
          ))}
        </div>
        <div style={{background:'white',borderRadius:'10px',padding:'16px',border:'0.5px solid #ddd'}}>
          <p style={{fontWeight:'600',fontSize:'13px',marginBottom:'12px'}}>Species composition (ha)</p>
          {c.species.map(sp=>(
            <div key={sp.s} style={{marginBottom:'8px'}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:'12px',marginBottom:'2px'}}>
                <span style={{fontStyle:'italic'}}>{sp.s}</span>
                <span style={{color:'#0F6E56',fontWeight:'600'}}>{sp.a.toLocaleString()} ha</span>
              </div>
              <div style={{background:'#f0f0f0',borderRadius:'4px',height:'6px'}}>
                <div style={{width:`${(sp.a/maxSp)*100}%`,background:'#1D9E75',borderRadius:'4px',height:'6px'}}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginBottom:'16px'}}>
        <div style={{background:'white',borderRadius:'10px',padding:'16px',border:'0.5px solid #ddd'}}>
          <p style={{fontWeight:'600',fontSize:'13px',marginBottom:'10px'}}>Top benefits</p>
          {c.benefits.map((b,i)=>(
            <div key={b} style={{padding:'6px 0',borderBottom:'0.5px solid #eee',
              fontSize:'13px',color:'#0F6E56'}}>#{i+1} {b}</div>
          ))}
        </div>
        <div style={{background:'white',borderRadius:'10px',padding:'16px',border:'0.5px solid #ddd'}}>
          <p style={{fontWeight:'600',fontSize:'13px',marginBottom:'10px'}}>Top threats</p>
          {c.threats.map((t,i)=>(
            <div key={t} style={{padding:'6px 0',borderBottom:'0.5px solid #eee',
              fontSize:'13px',color:'#E24B4A'}}>#{i+1} {t}</div>
          ))}
        </div>
      </div>

      <div style={{background:'#E6F1FB',borderRadius:'10px',padding:'14px',
        fontSize:'13px',color:'#185FA5'}}>
        {c.note}
      </div>
    </div>
  );
}
