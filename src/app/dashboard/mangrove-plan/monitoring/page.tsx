'use client';

type StatusType = 'Active' | 'Pending' | 'Delayed';

const ME: {prog:string,obj:string,indicator:string,lead:string,status:StatusType}[] = [
  { prog:'Forest Conservation', obj:'Conserve and protect mangrove forests', indicator:'Stabilized shorelines | Protected areas undisturbed', lead:'KFS, KMFRI', status:'Active' },
  { prog:'Forest Conservation', obj:'Sustainable harvesting of wood products', indicator:'Felling plans available in 5 counties', lead:'KFS', status:'Pending' },
  { prog:'Forest Conservation', obj:'Rehabilitate degraded areas', indicator:'Hectares planted increased | Community nurseries operational', lead:'KFS, KWS, KMFRI', status:'Active' },
  { prog:'Fisheries', obj:'Map degraded fish habitats', indicator:'Fish habitat maps produced per county', lead:'KMFRI + County Fisheries', status:'Pending' },
  { prog:'Community', obj:'Strengthen local institutional capacity', indicator:'Number of functional CFAs registered', lead:'KFS, CFAs, CBOs', status:'Active' },
  { prog:'Community', obj:'Promote nature-based enterprises', indicator:'Improved poverty index | On-farm woodlots established', lead:'KFS, County Govt', status:'Active' },
  { prog:'Research', obj:'Promote mangrove ecosystem research', indicator:'Funded proposals | Publications | PSP networks', lead:'KMFRI + KEFRI + Universities', status:'Active' },
  { prog:'Tourism', obj:'Develop tourism infrastructure', indicator:'Tourist numbers | Boardwalks in 5 sites', lead:'KFS, KWS, KTB', status:'Pending' },
  { prog:'HR and Operations', obj:'Train and deploy adequate staff', indicator:'584 staff trained | 20 new outposts built', lead:'KFS + KWS', status:'Pending' },
];

const SC: Record<StatusType, string> = { Active:'#1D9E75', Pending:'#BA7517', Delayed:'#E24B4A' };

export default function MonitoringPage() {
  return (
    <div>
      <h1 style={{fontSize:'22px',fontWeight:'700',color:'#0F6E56',margin:'0 0 4px'}}>
        Monitoring and Evaluation Framework
      </h1>
      <p style={{color:'#888',fontSize:'13px',margin:'0 0 20px'}}>
        Quarterly and annual M&E across 6 programmes | 2017-2027 | Source: Chapter 8 of the Plan
      </p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px',marginBottom:'20px'}}>
        {[['9','Objectives tracked'],['KES 3.8B','Total 10-yr budget'],['5 Counties','Implementation scope']].map(([v,l])=>(
          <div key={l} style={{background:'white',borderRadius:'10px',padding:'16px',
            textAlign:'center',border:'0.5px solid #ddd'}}>
            <p style={{fontSize:'22px',fontWeight:'700',color:'#0F6E56',margin:0}}>{v}</p>
            <p style={{fontSize:'12px',color:'#888',margin:0}}>{l}</p>
          </div>
        ))}
      </div>
      <div style={{background:'white',borderRadius:'10px',padding:'16px',
        border:'0.5px solid #ddd',overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:'11px'}}>
          <thead>
            <tr style={{background:'#0F6E56',color:'white'}}>
              {['Programme','Objective','Indicator','Lead Agency','Status'].map(h=>(
                <th key={h} style={{padding:'8px 10px',textAlign:'left'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ME.map((m,i)=>(
              <tr key={i} style={{background:i%2===0?'white':'#f5faf8'}}>
                <td style={{padding:'7px 10px',fontWeight:'600',color:'#0F6E56'}}>{m.prog}</td>
                <td style={{padding:'7px 10px'}}>{m.obj}</td>
                <td style={{padding:'7px 10px',color:'#555'}}>{m.indicator}</td>
                <td style={{padding:'7px 10px'}}>{m.lead}</td>
                <td style={{padding:'7px 10px'}}>
                  <span style={{background:SC[m.status]+'22',color:SC[m.status],
                    padding:'2px 8px',borderRadius:'20px',fontWeight:'600',fontSize:'10px'}}>
                    {m.status}
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
