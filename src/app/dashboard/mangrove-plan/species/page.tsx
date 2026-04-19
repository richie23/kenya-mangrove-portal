'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const SPECIES = [
  { name:'Rhizophora mucronata', local:'Mkoko',       area:31000, risk:'High risk', use:'Construction poles, fuel wood',    dominant:'Lamu, Kwale, Kilifi' },
  { name:'Ceriops tagal',        local:'Mkandaa',     area:20000, risk:'High risk', use:'Construction poles, fuel wood',    dominant:'Kwale, Lamu' },
  { name:'Avicennia marina',     local:'Mchu',        area:15000, risk:'Stable',    use:'Fuel wood, medicine',              dominant:'Tana River, Lamu' },
  { name:'Sonneratia alba',      local:'Msambarau',   area:2800,  risk:'Stable',    use:'Limited commercial use',           dominant:'Lamu, Kilifi' },
  { name:'Bruguiera gymnorhiza', local:'Muia',        area:1200,  risk:'Stable',    use:'Timber, traditional medicine',     dominant:'Kwale (Gazi)' },
  { name:'Xylocarpus granatum',  local:'Mkomafi',     area:400,   risk:'At risk',   use:'High quality timber',              dominant:'Kwale, Kilifi' },
  { name:'Heritiera littoralis', local:'Msanga',      area:300,   risk:'Unique',    use:'Boat masts, timber',               dominant:'Tana River only' },
  { name:'Lumnitzera racemosa',  local:'Mzingifungu', area:10,    risk:'Rare',      use:'Fuel wood',                        dominant:'Kwale (Vanga)' },
  { name:'Ceriops decandra',     local:'Mkandaa mdogo',area:50,   risk:'Rare',      use:'Limited',                          dominant:'South coast' },
];

const RISK_COLOR: Record<string,string> = {
  'High risk': '#E24B4A',
  'At risk':   '#BA7517',
  'Unique':    '#534AB7',
  'Stable':    '#1D9E75',
  'Rare':      '#888888',
};

export default function SpeciesPage() {
  const maxArea = Math.max(...SPECIES.map(s => s.area));
  return (
    <div>
      <h1 style={{fontSize:'22px',fontWeight:'700',color:'#0F6E56',margin:'0 0 4px'}}>
        9 Mangrove Species of Kenya
      </h1>
      <p style={{color:'#888',fontSize:'13px',margin:'0 0 20px'}}>
        Source: National Mangrove Ecosystem Management Plan 2017-2027
      </p>
      <div style={{background:'white',borderRadius:'10px',padding:'16px',
        border:'0.5px solid #ddd',marginBottom:'16px'}}>
        <p style={{fontWeight:'600',fontSize:'13px',marginBottom:'12px'}}>
          Estimated area by species (hectares)
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={SPECIES} layout="vertical" margin={{left:140,right:20}}>
            <XAxis type="number" tick={{fontSize:10}}
              tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}k`:String(v)}/>
            <YAxis type="category" dataKey="local" tick={{fontSize:11}} width={140}/>
            <Tooltip formatter={v=>[`~${Number(v).toLocaleString()} ha`,'']}/>
            <Bar dataKey="area" fill="#1D9E75" radius={[0,4,4,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{background:'white',borderRadius:'10px',padding:'16px',
        border:'0.5px solid #ddd',overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:'12px'}}>
          <thead>
            <tr style={{background:'#0F6E56',color:'white'}}>
              {['Scientific name','Local name','Where dominant','Main use','Status'].map(h=>(
                <th key={h} style={{padding:'8px 10px',textAlign:'left'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SPECIES.map((s,i)=>(
              <tr key={s.name} style={{background:i%2===0?'white':'#f5faf8'}}>
                <td style={{padding:'7px 10px',fontStyle:'italic'}}>{s.name}</td>
                <td style={{padding:'7px 10px',fontWeight:'600'}}>{s.local}</td>
                <td style={{padding:'7px 10px'}}>{s.dominant}</td>
                <td style={{padding:'7px 10px'}}>{s.use}</td>
                <td style={{padding:'7px 10px'}}>
                  <span style={{background:RISK_COLOR[s.risk]+'22',
                    color:RISK_COLOR[s.risk],padding:'2px 8px',
                    borderRadius:'20px',fontWeight:'600',fontSize:'10px'}}>
                    {s.risk}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
