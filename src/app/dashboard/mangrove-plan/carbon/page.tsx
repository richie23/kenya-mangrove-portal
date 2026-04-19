// src/app/dashboard/mangrove-plan/carbon/page.tsx
// Blue carbon and ecosystem services dashboard
'use client';
import { useState } from 'react';
import { BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer } from 'recharts';
 
// Carbon data from the Plan
const CARBON_STOCKS = [
  {county:'Lamu',      area:37350, stock_min:500, stock_max:1000},
  {county:'Kilifi',    area:8536,  stock_min:500, stock_max:1000},
  {county:'Kwale',     area:8354,  stock_min:500, stock_max:1000},
  {county:'Mombasa',   area:3771,  stock_min:100, stock_max:400},
  {county:'Tana River',area:3260,  stock_min:500, stock_max:800},
].map(c=>({...c,
  total_min:c.area*c.stock_min,
  total_max:c.area*c.stock_max,
  mid:(c.area*(c.stock_min+c.stock_max)/2).toFixed(0)
}));
 
const ECOSYSTEM_VALUES = [
  {service:'Shoreline protection',value:134866},
  {service:'Education & Research',value:65470},
  {service:'Carbon sequestration',value:21896},
  {service:'Building poles',      value:30660},
  {service:'Onsite fisheries',    value:9613},
  {service:'Fuel wood',           value:4505},
  {service:'Beekeeping',          value:1250},
  {service:'Tourism',             value:782},
  {service:'Aquaculture',         value:408},
];
 
export default function CarbonPage() {
  const [price, setPrice] = useState(10);
  const totalMidC = CARBON_STOCKS.reduce((s,c)=>s+Number(c.mid),0);
  const gazi_rev = 1200000;
 
  return (
    <div>
      <h1 style={{fontSize:'22px',fontWeight:'700',color:'#0F6E56',margin:'0 0 4px'}}>
        Blue Carbon & Ecosystem Services
      </h1>
      <p style={{color:'#888',fontSize:'13px',margin:'0 0 20px'}}>
        Kenya mangroves store 500–1,000 tC/ha — 10x higher than terrestrial forests
      </p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'10px',marginBottom:'16px'}}>
        {[[`${(totalMidC/1000000).toFixed(1)}M tC`,'Estimated total carbon'],
          ['500–1,000 tC/ha','Carbon stock range'],
          ['KES 1.2M/yr','Gazi Bay Mikoko Pamoja'],
          ['3,000 tCO2/yr','Gazi annual offsets'],
        ].map(([v,l])=>(
          <div key={l} style={{background:'white',borderRadius:'10px',padding:'12px',
            textAlign:'center',border:'0.5px solid #ddd'}}>
            <p style={{fontSize:'18px',fontWeight:'700',color:'#0F6E56',margin:0}}>{v}</p>
            <p style={{fontSize:'11px',color:'#888',margin:0}}>{l}</p>
          </div>
        ))}
      </div>
      <div style={{background:'#E1F5EE',borderRadius:'10px',padding:'14px',
        marginBottom:'16px',border:'0.5px solid #1D9E75'}}>
        <p style={{fontSize:'13px',fontWeight:'600',color:'#0F6E56',margin:'0 0 8px'}}>
          Carbon credit revenue calculator
        </p>
        <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'8px'}}>
          <label style={{fontSize:'12px'}}>Carbon price: USD {price}/tCO2</label>
          <input type='range' min='5' max='50' step='1' value={price}
            onChange={e=>setPrice(Number(e.target.value))} style={{flex:1}}/>
        </div>
        <p style={{fontSize:'12px',color:'#085041',margin:0}}>
          If all 61,271 ha protected (avg 700 tC/ha × 3.67 CO2eq):  
          USD {(61271*700*3.67*price/1000000).toFixed(1)}M potential revenue
        </p>
      </div>
      <div style={{background:'white',borderRadius:'10px',padding:'16px',
        border:'0.5px solid #ddd',marginBottom:'16px'}}>
        <p style={{fontSize:'13px',fontWeight:'600',margin:'0 0 12px'}}>
          Ecosystem services valuation (KES ha⁻¹ yr⁻¹) — KMFRI
        </p>
        <p style={{fontSize:'11px',color:'#888',margin:'0 0 8px'}}>
          Total: KES 269,448 per hectare per year
        </p>
        <ResponsiveContainer width='100%' height={200}>
          <BarChart data={ECOSYSTEM_VALUES} layout='vertical' margin={{left:130,right:10}}>
            <XAxis type='number' tick={{fontSize:10}}
              tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}k`:v}/>
            <YAxis type='category' dataKey='service' tick={{fontSize:11}} width={130}/>
            <Tooltip formatter={v=>[`KES ${Number(v).toLocaleString()} ha⁻¹yr⁻¹`,'']}/>
            <Bar dataKey='value' fill='#1D9E75' radius={[0,4,4,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
 
