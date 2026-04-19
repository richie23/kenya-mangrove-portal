'use client';
export default function PlanLayout({children}:{children:React.ReactNode}){
  return(
    <div style={{display:'flex',minHeight:'100vh',fontFamily:'Arial'}}>
      <aside style={{width:'220px',background:'#085041',padding:'0',flexShrink:0}}>
        <div style={{padding:'16px',borderBottom:'1px solid rgba(255,255,255,0.15)'}}>
          <p style={{color:'white',fontWeight:'700',fontSize:'13px',margin:'0 0 4px'}}>Kenya National</p>
          <p style={{color:'#9FE1CB',fontSize:'11px',margin:0}}>Mangrove Management Plan</p>
          <p style={{color:'rgba(255,255,255,0.5)',fontSize:'10px',margin:'4px 0 0'}}>2017 - 2027 | KFS</p>
        </div>
        <nav>
          {[
            ['/dashboard/mangrove-plan','Plan Overview'],
            ['/dashboard/mangrove-plan/county','County Analysis'],
            ['/dashboard/mangrove-plan/species','Species (9)'],
            ['/dashboard/mangrove-plan/programmes','6 Programmes'],
            ['/dashboard/mangrove-plan/threats','Threats and Trends'],
            ['/dashboard/mangrove-plan/carbon','Blue Carbon'],
            ['/dashboard/mangrove-plan/monitoring','M&E Framework'],
            ['/','Back to Map'],
          ].map(([href,label])=>(
            <a key={href} href={href} style={{display:'block',padding:'10px 16px',
              fontSize:'13px',color:'rgba(255,255,255,0.8)',textDecoration:'none',
              borderLeft:'3px solid transparent'}}>
              {label}
            </a>
          ))}
        </nav>
      </aside>
      <main style={{flex:1,overflowY:'auto',background:'#f5f5f0',padding:'24px'}}>
        {children}
      </main>
    </div>
  );
}
