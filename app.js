// PAGE SYSTEM
function showPage(p){
  document.querySelectorAll('.page').forEach(el=>el.classList.remove('active'))
  const pg=document.getElementById('page-'+p)
  if(pg){pg.classList.add('active');window.scrollTo(0,0)}
  renderSQL()
}
function scrollTo2(id){
  setTimeout(()=>{const el=document.getElementById(id);if(el)el.scrollIntoView({behavior:'smooth'})},150)
}

// ══════════════════════════════════════════════════════
// AUTH SYSTEM
// ══════════════════════════════════════════════════════

// ── Storage helpers ──
function dbUsers(){ try{return JSON.parse(localStorage.getItem('db_users')||'{}')}catch(e){return {}} }
function saveUsers(u){ localStorage.setItem('db_users',JSON.stringify(u)) }
function currentClient(){ try{return JSON.parse(localStorage.getItem('db_currentClient')||'null')}catch(e){return null} }
function setCurrentClient(u){ localStorage.setItem('db_currentClient',JSON.stringify(u)) }
function isAdminLoggedIn(){ return localStorage.getItem('db_adminSession')==='1' }
function setAdminSession(){ localStorage.setItem('db_adminSession','1') }
function clearAdminSession(){ localStorage.removeItem('db_adminSession') }

// Admin credentials (Henry G Michuku)
const ADMIN_CREDENTIALS = [
  { email: 'gitauhenry467@gmail.com', pass: 'DataBridge2025', name: 'Henry G Michuku' },
  { email: 'admin@databridge.co.ke',  pass: 'DataBridge2025', name: 'Henry G Michuku' }
]

// ── Nav state — show/hide nav items based on session ──
function updateNavState(){
  const client  = currentClient()
  const isAdmin = isAdminLoggedIn()
  const loggedIn = !!(client || isAdmin)

  // Desktop nav
  const loginLi  = document.getElementById('nav-login-li')
  const logoutLi = document.getElementById('nav-logout-li')
  const clientDash= document.getElementById('nav-client-dash')
  const adminDash = document.getElementById('nav-admin-dash')
  if(loginLi)   loginLi.style.display   = loggedIn ? 'none' : ''
  if(logoutLi)  logoutLi.style.display  = loggedIn ? '' : 'none'
  if(clientDash) clientDash.style.display= client   ? '' : 'none'
  if(adminDash)  adminDash.style.display = isAdmin  ? '' : 'none'

  // Mobile menu
  const mmLogin  = document.getElementById('mm-login')
  const mmLogout = document.getElementById('mm-logout')
  const mmClient = document.getElementById('mm-client-dash')
  const mmAdmin  = document.getElementById('mm-admin-dash')
  if(mmLogin)  mmLogin.style.display  = loggedIn ? 'none' : ''
  if(mmLogout) mmLogout.style.display = loggedIn ? '' : 'none'
  if(mmClient) mmClient.style.display = client   ? '' : 'none'
  if(mmAdmin)  mmAdmin.style.display  = isAdmin  ? '' : 'none'
}

// ── Login page — expand the right form card ──
function expandLogin(which){
  const clientForm = document.getElementById('lform-client')
  const adminForm  = document.getElementById('lform-admin')
  if(which==='client'){
    clientForm.classList.toggle('open')
    if(adminForm) adminForm.classList.remove('open')
  } else {
    adminForm.classList.toggle('open')
    if(clientForm) clientForm.classList.remove('open')
  }
}

// ── Client auth ──
function authSwitch(which){
  document.getElementById('atab-login').classList.toggle('on',which==='login')
  document.getElementById('atab-signup').classList.toggle('on',which==='signup')
  document.getElementById('authpane-login').style.display=which==='login'?'block':'none'
  document.getElementById('authpane-signup').style.display=which==='signup'?'block':'none'
}

function clientSignup(){
  const name  = document.getElementById('su_name').value.trim()
  const phone = document.getElementById('su_phone').value.trim()
  const email = document.getElementById('su_email').value.trim().toLowerCase()
  const pass  = document.getElementById('su_pass').value
  const err   = document.getElementById('authError2')
  if(!name||!email||!pass){ err.textContent='Please fill in your name, email, and password.'; err.style.display='block'; return }
  const users = dbUsers()
  if(users[email]){ err.textContent='An account with this email already exists. Try logging in.'; err.style.display='block'; return }
  users[email]={name,phone,email,pass}
  saveUsers(users)
  err.style.display='none'
  setCurrentClient({name,phone,email})
  updateNavState()
  showPage('client')
  applyClientSession({name,phone,email})
}

function clientLogin(){
  const email = document.getElementById('li_email').value.trim().toLowerCase()
  const pass  = document.getElementById('li_pass').value
  const err   = document.getElementById('authError')
  const users = dbUsers()
  const u     = users[email]
  if(!u||u.pass!==pass){ err.textContent='Incorrect email or password.'; err.style.display='block'; return }
  err.style.display='none'
  setCurrentClient({name:u.name,phone:u.phone,email:u.email})
  updateNavState()
  showPage('client')
  applyClientSession(u)
}

function clientLogout(){
  localStorage.removeItem('db_currentClient')
  updateNavState()
  showPage('home')
}

function applyClientSession(u){
  const initials=(u.name||'? ?').split(' ').filter(Boolean).slice(0,2).map(s=>s[0].toUpperCase()).join('')
  const av=document.getElementById('cUserAvatar'), nm=document.getElementById('cUserName')
  if(av)av.textContent=initials
  if(nm)nm.textContent=u.name
  const fn=document.getElementById('ord_name'), fe=document.getElementById('ord_email'), fp=document.getElementById('ord_phone')
  if(fn)fn.value=u.name||''
  if(fe)fe.value=u.email||''
  if(fp)fp.value=u.phone||''
  renderMyOrders(u.email)
}

// ── Admin / Analyst login ──
function adminLogin(){
  const email = (document.getElementById('adm_email').value||'').trim().toLowerCase()
  const pass  = document.getElementById('adm_pass').value
  const err   = document.getElementById('adminAuthError')
  const match = ADMIN_CREDENTIALS.find(c=>c.email===email && c.pass===pass)
  if(!match){
    err.textContent='Incorrect email or password. Contact gitauhenry467@gmail.com for access.'
    err.style.display='block'
    return
  }
  err.style.display='none'
  setAdminSession()
  updateNavState()
  showPage('admin')
  // Apply Henry's details to admin header
  setTimeout(()=>{
    const av = document.querySelector('#page-admin .dav')
    const nm = document.querySelector('#page-admin .duname')
    if(av){ av.textContent='HM'; av.style.background='#0D47A1' }
    if(nm) nm.textContent = match.name + ' — Admin'
  }, 50)
}

// ── Global logout (works for both client and admin) ──
function globalLogout(){
  localStorage.removeItem('db_currentClient')
  clearAdminSession()
  updateNavState()
  showPage('home')
}

// ── goClient: redirect to login if not authenticated ──
function goClient(){
  const u=currentClient()
  if(u){ showPage('client'); applyClientSession(u) }
  else { showPage('login') }
}

function renderMyOrders(email){
  const wrap=document.getElementById('myOrdersBody')
  if(!wrap)return
  const mine=sqlData.filter(r=>r.email && r.email.toLowerCase()===String(email).toLowerCase())
  if(mine.length===0){
    wrap.innerHTML=`<tr><td colspan="7" style="text-align:center;color:var(--sl);padding:1.4rem">No orders yet — click "+ New Order" to submit your first project.</td></tr>`
    return
  }
  wrap.innerHTML=mine.map(r=>`<tr><td><strong>${r.id}</strong></td><td>${r.project}</td><td>${r.tool}</td><td>${r.analyst}</td><td>${r.deadline}</td><td>KES ${r.total}</td><td><span class="badge ${scls[r.status]||'b-pn'}">${r.status}</span></td></tr>`).join('')
}

// Run nav state on load
document.addEventListener('DOMContentLoaded', updateNavState)

// NAV
window.addEventListener('scroll',()=>document.getElementById('mainNav').classList.toggle('scrolled',window.scrollY>30))
function toggleMM(){document.getElementById('mmenu').classList.toggle('open')}

// PARTICLES
;(function(){
  const c=document.getElementById('hparts');if(!c)return
  const cols=['rgba(66,165,245,.5)','rgba(245,166,35,.4)','rgba(255,255,255,.12)']
  for(let i=0;i<20;i++){
    const d=document.createElement('div'),s=Math.random()*4+2
    d.className='part'
    d.style.cssText=`width:${s}px;height:${s}px;left:${Math.random()*100}%;background:${cols[i%3]};animation-duration:${Math.random()*18+12}s;animation-delay:${Math.random()*10}s`
    c.appendChild(d)
  }
})()

// ===== POWER BI TILE GRID (hero) — live data =====
const PBI = {
  count: 487,
  pipeline: 2.0, // $bn
  revenue: 461, // $M
  trend: [30,34,32,38,42,40,46,48],
  mix: [38,26,20,16],
  byMonth: [20,28,35,48,55,62,70,78,82,88,92,95],
  avgRevA: [60,75,45,85,55],
  avgRevB: [40,55,30,65,42],
  win: [12,80,25,18,30,15],
  avgRev2: [55,70,40,80,60,45]
}
function pbiClamp(v,lo,hi){return Math.max(lo,Math.min(hi,v))}

function pbiDrawTrend(){
  const el=document.getElementById('pt2');if(!el)return
  const pts=PBI.trend.map((v,i)=>[6+i*14,46-(v/50)*40])
  const line=pts.map(p=>p.join(',')).join(' ')
  el.innerHTML=`<polyline points="${line}" fill="none" stroke="#1ABC9C" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`+
    pts.map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="1.6" fill="#1ABC9C"/>`).join('')
}
function pbiDrawMix(){
  const el=document.getElementById('pt3');if(!el)return
  const cols=['#1ABC9C','#34495E','#F0625A','#F2C94C']
  const total=PBI.mix.reduce((a,b)=>a+b,0)
  let x=4,h=''
  PBI.mix.forEach((v,i)=>{
    const w=(v/total)*102
    h+=`<rect x="${x}" y="20" width="${w}" height="12" fill="${cols[i]}" opacity=".9"/>`
    x+=w
  })
  el.innerHTML=h
}
function pbiDrawByMonth(){
  const el=document.getElementById('pt5');if(!el)return
  const cols=['#34495E','#1ABC9C','#F0625A','#F2C94C']
  const max=Math.max(...PBI.byMonth)
  let h=''
  PBI.byMonth.forEach((v,i)=>{
    const bw=15,x=6+i*18.5,bh=(v/max)*46
    h+=`<rect x="${x}" y="${50-bh}" width="${bw}" height="${bh}" fill="${cols[i%cols.length]}" opacity=".88" rx="1"/>`
  })
  el.innerHTML=h
}
function pbiDrawAvgRevenue(){
  const el=document.getElementById('pt6');if(!el)return
  let h=''
  PBI.avgRevA.forEach((v,i)=>{
    const y=4+i*10.6
    h+=`<rect x="60" y="${y}" width="${v*0.9}" height="7" fill="#34495E" rx="1"/>
        <rect x="${60-PBI.avgRevB[i]*0.9}" y="${y}" width="${PBI.avgRevB[i]*0.9}" height="7" fill="#F0625A" rx="1"/>`
  })
  el.innerHTML=h
}
function pbiDrawWin(){
  const el=document.getElementById('pt7');if(!el)return
  const max=Math.max(...PBI.win)
  let h=''
  PBI.win.forEach((v,i)=>{
    const bw=12,x=8+i*16,bh=(v/max)*42
    h+=`<rect x="${x}" y="${48-bh}" width="${bw}" height="${bh}" fill="#34495E" opacity=".85" rx="1"/>`
  })
  el.innerHTML=h
}
function pbiDrawAvgRevenue2(){
  const el=document.getElementById('pt8');if(!el)return
  const max=Math.max(...PBI.avgRev2)
  let h=''
  PBI.avgRev2.forEach((v,i)=>{
    const y=4+i*8,bw=(v/max)*95
    h+=`<rect x="6" y="${y}" width="${bw}" height="5.5" fill="#F0625A" opacity=".88" rx="1"/>`
  })
  el.innerHTML=h
}
function pbiUpdateNumbers(){
  const c1=document.getElementById('pt1'),c4=document.getElementById('pt4'),c9=document.getElementById('pt9')
  if(c1)c1.textContent=Math.round(PBI.count)
  if(c4)c4.textContent='$'+PBI.pipeline.toFixed(1)+'bn'
  if(c9)c9.textContent='$'+Math.round(PBI.revenue)+'M'
}
function pbiFlash(id){
  const el=document.getElementById(id);if(!el)return
  el.style.opacity=.25
  setTimeout(()=>{el.style.opacity=1},150)
}
function pbiRenderAll(){
  pbiDrawTrend();pbiDrawMix();pbiDrawByMonth();pbiDrawAvgRevenue();pbiDrawWin();pbiDrawAvgRevenue2();pbiUpdateNumbers()
}
function pbiPulse(){
  PBI.count=pbiClamp(PBI.count+(Math.random()-0.45)*6,420,560);pbiFlash('pt1')
  PBI.pipeline=pbiClamp(PBI.pipeline+(Math.random()-0.5)*0.08,1.6,2.4);pbiFlash('pt4')
  PBI.revenue=pbiClamp(PBI.revenue+(Math.random()-0.45)*10,380,520);pbiFlash('pt9')
  PBI.trend=PBI.trend.map(v=>pbiClamp(v+(Math.random()-0.45)*4,20,50))
  let mt=0;PBI.mix=PBI.mix.map(v=>{const nv=pbiClamp(v+(Math.random()-0.5)*3,8,45);mt+=nv;return nv})
  PBI.mix=PBI.mix.map(v=>v/mt*100)
  PBI.byMonth=PBI.byMonth.map(v=>pbiClamp(v+(Math.random()-0.4)*5,15,98))
  PBI.avgRevA=PBI.avgRevA.map(v=>pbiClamp(v+(Math.random()-0.5)*8,30,95))
  PBI.avgRevB=PBI.avgRevB.map(v=>pbiClamp(v+(Math.random()-0.5)*8,20,70))
  PBI.win=PBI.win.map(v=>pbiClamp(v+(Math.random()-0.5)*6,8,85))
  PBI.avgRev2=PBI.avgRev2.map(v=>pbiClamp(v+(Math.random()-0.5)*8,25,85))
  pbiRenderAll()
}
window.addEventListener('load',()=>{
  pbiRenderAll()
  setInterval(pbiPulse,1700)
})

// SERVICES TICKER (left to right)
const SVCS=[
  {ic:'📈',t:'Quantitative Analysis',d:'Regression, ANOVA, factor analysis',tags:['SPSS','Stata','R','Python']},
  {ic:'💬',t:'Qualitative Analysis',d:'Thematic coding, narrative, discourse',tags:['NVivo','Atlas.ti']},
  {ic:'🔀',t:'Mixed Methods',d:'Combined quant + qual research',tags:['All tools']},
  {ic:'🗂️',t:'Primary Data Collection',d:'Survey design, deployment, interviews',tags:['KoboToolbox']},
  {ic:'🧹',t:'Data Cleaning & Prep',d:'Deduplication, outliers, restructuring',tags:['Python','R','Excel']},
  {ic:'📞',t:'Statistical Consultation',d:'Research design, methodology advice',tags:['Advisory']},
  {ic:'📉',t:'Data Visualisation',d:'Charts, dashboards, infographics',tags:['ggplot2','matplotlib']},
  {ic:'📝',t:'Report Writing',d:'APA, Harvard, Chicago, custom format',tags:['APA','Harvard']},
]
;(function(){
  const row=document.getElementById('svrow');if(!row)return
  const double=[...SVCS,...SVCS]
  row.innerHTML=double.map(s=>`<div class="scard"><div class="scic">${s.ic}</div><h3>${s.t}</h3><p>${s.d}</p><div class="stags">${s.tags.map(t=>`<span class="stag">${t}</span>`).join('')}</div></div>`).join('')
  const tick=document.getElementById('topTicker');if(!tick)return
  const items=['📈 Quantitative Analysis','📊 SPSS Expert','🐍 Python Data Science','📉 R Visualisation','🔬 Mixed Methods Research','🗂️ Primary Data Collection','📝 APA & Harvard Reports','💬 Qualitative Coding','🧹 Data Cleaning','📞 Statistical Consultation','🎓 Dissertation Support','🏢 Business Intelligence','🌍 NGO Impact Evaluation','🏥 Health Research']
  const dbl=[...items,...items]
  tick.innerHTML=dbl.map(i=>`<span class="titem">${i}</span><span class="tsep">◆</span>`).join('')
})()

// SQL TABLE DATA
let sqlData=[
  {id:'DB-2025-001',client:'Amina Mwangi',email:'amina@email.com',phone:'+254 712 000 000',org:'University of Nairobi',project:'MSc Dissertation — Regression',service:'Quantitative',tool:'SPSS',format:'APA 7th',analyst:'Henry G. Michuku',deadline:'28 Jun 2025',total:'25,000',deposit:'12,500',balance:'12,500',status:'In Progress'},
  {id:'DB-2025-002',client:'Kevin Omondi',email:'kevin@ngo.org',phone:'+254 722 111 222',org:'Health NGO Kenya',project:'NGO Impact Evaluation',service:'Mixed Methods',tool:'R',format:'Harvard',analyst:'Simon Macharia',deadline:'15 Jul 2025',total:'32,000',deposit:'16,000',balance:'16,000',status:'Confirmed'},
  {id:'DB-2025-003',client:'Sarah Njoki',email:'sarah@brand.co',phone:'+254 733 222 333',org:'Retail Brand',project:'Consumer Cluster Analysis',service:'Quantitative',tool:'Python',format:'Custom',analyst:'Simon Macharia',deadline:'20 Jul 2025',total:'36,000',deposit:'18,000',balance:'18,000',status:'Draft Review'},
  {id:'DB-2025-004',client:'John Kamau',email:'john@email.com',phone:'+254 744 333 444',org:'Independent',project:'Policy Research — Logistic Reg.',service:'Quantitative',tool:'Stata',format:'APA 7th',analyst:'Henry G. Michuku',deadline:'25 Jul 2025',total:'28,000',deposit:'14,000',balance:'0',status:'Completed'},
  {id:'DB-2025-005',client:'Faith Achieng',email:'faith@uni.ac.ke',phone:'+254 755 444 555',org:'Moi University',project:'Econometrics Thesis',service:'Quantitative',tool:'Stata',format:'APA 7th',analyst:'Joseph Machuki',deadline:'30 Jul 2025',total:'22,000',deposit:'11,000',balance:'11,000',status:'Confirmed'},
]
const scls={'In Progress':'b-pr','Confirmed':'b-pn','Draft Review':'b-rv','Completed':'b-dn','Pending':'b-pn','Overdue':'b-ov'}
// Henry G Michuku is the principal analyst / admin — listed first
const ANALYSTS=['Henry G Michuku','Dr. James Kariuki','Mercy Otieno','Unassigned']

function analystSelect(id,current){
  return `<select onchange="assignAnalyst('${id}',this.value)" style="font-size:.78rem;padding:.25rem .4rem;border:1px solid var(--br);border-radius:6px;background:#fff;min-width:140px">`+
    ANALYSTS.map(a=>`<option ${a===current?'selected':''}>${a}</option>`).join('')+`</select>`
}

function assignAnalyst(id,name){
  const r=sqlData.find(x=>x.id===id)
  if(!r)return
  r.analyst=name
  if(r.status==='Pending'&&name!=='Unassigned') r.status='Confirmed'
  renderSQL()
  // Flash confirmation
  const toast=document.createElement('div')
  toast.style.cssText='position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);background:#107C10;color:#fff;padding:.65rem 1.4rem;border-radius:8px;font-family:var(--fd);font-weight:600;font-size:.85rem;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,.2)'
  toast.textContent = name==='Unassigned' ? `✓ Order ${id} unassigned` : `✓ ${id} assigned to ${name}`
  document.body.appendChild(toast)
  setTimeout(()=>toast.remove(),2800)
}

// Quick-assign this order to Henry G Michuku (admin)
function assignToHenry(orderId){
  assignAnalyst(orderId, ADMIN_USER.name)
}

function renderSQL(){
  const tb=document.getElementById('sqlBody')
  if(tb)tb.innerHTML=sqlData.map(r=>`<tr>
    <td><strong>${r.id}</strong></td><td>${r.client}</td><td>${r.email}</td><td>${r.phone}</td>
    <td>${r.org}</td><td>${r.project}</td><td>${r.service}</td><td>${r.tool}</td><td>${r.format}</td>
    <td>${analystSelect(r.id,r.analyst)}</td>
    <td>${r.deadline}</td><td>KES ${r.total}</td><td>KES ${r.deposit}</td><td>KES ${r.balance}</td>
    <td><span class="badge ${scls[r.status]||'b-pn'}">${r.status}</span></td>
  </tr>`).join('')

  const ao=document.getElementById('adminOrderBody')
  if(ao)ao.innerHTML=sqlData.map(r=>`<tr>
    <td><strong>${r.id}</strong></td>
    <td>${r.client}</td>
    <td>${r.project}</td>
    <td>${r.tool}</td>
    <td>${analystSelect(r.id,r.analyst)}</td>
    <td>${r.deadline}</td>
    <td>KES ${r.total}</td>
    <td>KES ${r.deposit}</td>
    <td><span class="badge ${scls[r.status]||'b-pn'}">${r.status}</span></td>
    <td style="display:flex;gap:.3rem;flex-wrap:wrap;align-items:center">
      ${r.analyst==='Unassigned'
        ? `<button class="db1 dba" style="background:#0D47A1;white-space:nowrap" onclick="assignToHenry('${r.id}')" title="Assign to ${ADMIN_USER.name} — ${ADMIN_USER.role}">👤 Henry</button>`
        : r.analyst===ADMIN_USER.name
          ? `<span style="font-size:.72rem;color:#107C10;font-weight:700">✓ Henry</span>`
          : ''
      }
      <button class="db1 dbb" onclick="alert('Order ${r.id}\\nClient: ${r.client}\\nProject: ${r.project}\\nAnalyst: ${r.analyst}\\nStatus: ${r.status}')">View</button>
    </td>
  </tr>`).join('')
  const rw=document.getElementById('reportTableWrap')
  if(rw)rw.innerHTML=`<table><thead><tr><th>Order ID</th><th>Client</th><th>Email</th><th>Phone</th><th>Organisation</th><th>Project</th><th>Service</th><th>Tool</th><th>Format</th><th>Analyst</th><th>Deadline</th><th>Total</th><th>Deposit</th><th>Balance</th><th>Status</th></tr></thead><tbody>`+sqlData.map(r=>`<tr><td>${r.id}</td><td>${r.client}</td><td>${r.email}</td><td>${r.phone}</td><td>${r.org}</td><td>${r.project}</td><td>${r.service}</td><td>${r.tool}</td><td>${r.format}</td><td>${r.analyst}</td><td>${r.deadline}</td><td>KES ${r.total}</td><td>KES ${r.deposit}</td><td>KES ${r.balance}</td><td><span class="badge ${scls[r.status]||'b-pn'}">${r.status}</span></td></tr>`).join('')+`</tbody></table>`
  const cu=currentClient();if(cu)renderMyOrders(cu.email)
}
function addRow(){
  const n=sqlData.length+1
  sqlData.push({id:`DB-2025-00${n+4}`,client:'New Client',email:'client@email.com',phone:'+254 7XX XXX XXX',org:'Organisation',project:'New Project',service:'Quantitative',tool:'SPSS',format:'APA 7th',analyst:'Unassigned',deadline:'TBD',total:'0',deposit:'0',balance:'0',status:'Pending'})
  renderSQL();alert('New order row added!')
}
function exportCSV(){
  const h=['Order ID','Client','Email','Phone','Organisation','Project','Service','Tool','Format','Analyst','Deadline','Total','Deposit','Balance','Status']
  const rows=sqlData.map(r=>[r.id,r.client,r.email,r.phone,r.org,r.project,r.service,r.tool,r.format,r.analyst,r.deadline,'KES '+r.total,'KES '+r.deposit,'KES '+r.balance,r.status].map(v=>`"${v}"`).join(','))
  const c=[h.join(','),...rows].join('\n')
  const a=document.createElement('a');a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(c);a.download='DataBridge_Orders.csv';a.click()
}
window.addEventListener('load',renderSQL)

// COUNT UP
function countUp(el,t,dur=1800){
  let s=0;const f=ts=>{if(!s)s=ts;const p=Math.min((ts-s)/dur,1),v=Math.floor(p*t),sp=el.querySelector('span');el.innerHTML=v+(sp?sp.outerHTML:'');if(p<1)requestAnimationFrame(f)}
  requestAnimationFrame(f)
}
const obs=new IntersectionObserver(entries=>entries.forEach(e=>{
  if(e.isIntersecting){e.target.classList.add('vis');const n=e.target.querySelector('.snum[data-t]');if(n&&!n.dataset.done){n.dataset.done=1;countUp(n,+n.dataset.t)}}
}),{threshold:.15})
document.querySelectorAll('.fu').forEach(el=>obs.observe(el))

// DASHBOARD TABS
function cTab(n,btn){
  document.querySelectorAll('#page-client .snav').forEach(b=>b.classList.remove('active'));if(btn)btn.classList.add('active')
  document.querySelectorAll('#page-client [id^=ctab-]').forEach(d=>d.style.display='none')
  const el=document.getElementById('ctab-'+n);if(el)el.style.display='block'
  const t={overview:'Client Overview',orders:'My Orders',messages:'Messages',docs:'Documents',invoices:'Invoices & Receipts',notifs:'Notifications',profile:'Profile & Settings'}
  document.getElementById('cTabTitle').textContent=t[n]||n
}
function anTab(n,btn){
  document.querySelectorAll('#page-analyst .snav').forEach(b=>b.classList.remove('active'));if(btn)btn.classList.add('active')
  document.querySelectorAll('#page-analyst [id^=antab-]').forEach(d=>d.style.display='none')
  const el=document.getElementById('antab-'+n);if(el)el.style.display='block'
  const t={overview:'Analyst Dashboard',assignments:'My Assignments',calendar:'Deadline Calendar',msgs:'Client Messages',upload:'Upload Deliverable',profile:'My Profile'}
  document.getElementById('anTabTitle').textContent=t[n]||n
}
function adTab(n,btn){
  document.querySelectorAll('#page-admin .snav').forEach(b=>b.classList.remove('active'));if(btn)btn.classList.add('active')
  document.querySelectorAll('#page-admin [id^=adtab-]').forEach(d=>d.style.display='none')
  const el=document.getElementById('adtab-'+n);if(el)el.style.display='block'
  const t={overview:'Admin Overview',orders:'All Orders',tracker:'Project Tracker',clients:'Client Management',analysts:'Analyst Accounts',finance:'Financial Management',reports:'Reports & Analytics',notifs:'Notification Centre',content:'Website Content'}
  document.getElementById('adTabTitle').textContent=t[n]||n
  renderSQL()
}
function filt(btn,f){btn.closest('.filt').querySelectorAll('.fb2').forEach(b=>b.classList.remove('on'));btn.classList.add('on')}
function toggleCreateAnalyst(){const f=document.getElementById('createAnalystForm');f.style.display=f.style.display==='none'?'block':'none'}

// MODAL
let mStep=1
function openModal(){document.getElementById('orderModal').classList.add('open');document.body.style.overflow='hidden'}
function closeModal(){document.getElementById('orderModal').classList.remove('open');document.body.style.overflow=''}
function mNext(){
  if(mStep<3){
    document.getElementById('ms'+mStep).style.display='none';mStep++
    document.getElementById('ms'+mStep).style.display='block'
    document.getElementById('sd'+(mStep-1)).classList.remove('on');document.getElementById('sd'+mStep).classList.add('on')
    document.getElementById('mprev').style.display='inline-flex'
    if(mStep===3)document.getElementById('mnext').textContent='Submit Project ✓'
  } else {
    submitOrder()
  }
}
// ── FORMSPREE ENDPOINT ───────────────────────────────────────────────────────
// Connected to gitauhenry467@gmail.com via https://formspree.io/f/xeeboeqy
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xeeboeqy'

// ── ADMIN CONFIG — Henry G Michuku ──────────────────────────────────────────
const ADMIN_USER = {
  name:     'Henry G Michuku',
  role:     'Principle Data Analyst',
  email:    'gitauhenry467@gmail.com',
  phone:    '+254796701659',
  initials: 'HM',
  color:    '#0D47A1'
}

// ── CLIENT CONFIRMATION EMAIL ─────────────────────────────────────────────────
// Formspree sends an auto-reply to _replyto when "Auto-response" is ON in the dashboard.
// This second fetch also sends a human-readable confirmation directly to the client.
function sendClientConfirmation(data) {
  const body = [
    `Dear ${data.name},`,
    '',
    'Thank you for submitting your project to DataBridge.',
    'We have successfully received your report and our team will review it shortly.',
    '',
    '─── YOUR SUBMISSION DETAILS ───────────────────────',
    `Service:          ${data.service}`,
    `Tool Preference:  ${data.tool}`,
    `Report Format:    ${data.format}`,
    `Final Deadline:   ${data.final_deadline || 'To be confirmed'}`,
    `Country:          ${data.country}`,
    '───────────────────────────────────────────────────',
    '',
    'WHAT HAPPENS NEXT',
    '1. Our principal analyst will review your submission within 4 hours.',
    '2. You will receive your Order ID and payment details by email.',
    '3. Once your deposit is received, analysis begins immediately.',
    '',
    'Need to reach us sooner?',
    '📞 Phone / WhatsApp: +254 748 216 918',
    '📧 Email: hello@databridge.co.ke',
    '📍 Nairobi, Kenya',
    '',
    'Warm regards,',
    ADMIN_USER.name,
    ADMIN_USER.role,
    'DataBridge — Professional Data Analysis & Research Services'
  ].join('\n')

  fetch(FORMSPREE_ENDPOINT, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      _replyto: data.email,
      _subject: `DataBridge — We Have Received Your Project Report ✓`,
      to_name:  data.name,
      message:  body,
      // keep admin cc'd
      admin_note: `AUTO-CONFIRMATION sent to client: ${data.name} <${data.email}>`
    })
  }).catch(() => { /* silent — primary submission already succeeded */ })
}

// ── ADMIN ALERT: new order notification in Admin → Notifications ─────────────
function showAdminAlert(orderId, clientName, clientEmail) {
  const container = document.querySelector('#adtab-notifs div[style*="padding:0"]')
  if (!container) return
  const item = document.createElement('div')
  item.style.cssText = 'padding:.88rem 1.4rem;border-bottom:1px solid var(--br);display:flex;align-items:center;gap:.85rem;background:#E8F5E9'
  item.innerHTML = `<span>📨</span>
    <div style="flex:1">
      <strong style="font-size:.84rem">New order received — ${orderId}</strong>
      <div style="font-size:.75rem;color:var(--sl)">Client: ${clientName} · ${clientEmail} · Just now · Confirmation sent to client ✓</div>
    </div>
    <button class="db1 dba" onclick="adTab('orders',null)">Assign →</button>`
  container.prepend(item)
}

function submitOrder() {
  const v = id => { const el = document.getElementById(id); return el ? el.value : '' }
  const data = {
    name: v('ord_name'), email: v('ord_email'), phone: v('ord_phone'), org: v('ord_org') || '—',
    country: v('ord_country'), service: v('ord_service'), datatype: v('ord_datatype'), tool: v('ord_tool'),
    format: v('ord_format'), deliverable: v('ord_deliverable'), description: v('ord_desc'),
    draft_deadline: v('ord_draftdue'), final_deadline: v('ord_finaldue'), notes: v('ord_notes') || '—'
  }
  if (!data.name || !data.email || !data.service) {
    document.getElementById('ordStatus').textContent = '⚠ Please fill in your name, email, and service type.'
    document.getElementById('ordStatus').style.color = '#D13438'
    return
  }
  const statusEl = document.getElementById('ordStatus')
  const btn = document.getElementById('mnext')
  statusEl.style.color = 'var(--sl)'; statusEl.textContent = 'Submitting your project...'
  btn.disabled = true

  fetch(FORMSPREE_ENDPOINT, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      _subject: `🆕 New DataBridge Order — ${data.name}`,
      _replyto: data.email,
      ...data
    })
  }).then(res => {
    if (!res.ok) throw new Error('Submission failed')
    return res.json()
  }).then(() => {
    // Send client confirmation
    sendClientConfirmation(data)

    // Add to live tracker
    const newId = `DB-2025-${String(sqlData.length + 5).padStart(3, '0')}`
    sqlData.push({
      id: newId, client: data.name, email: data.email, phone: data.phone,
      org: data.org, project: data.description ? data.description.slice(0, 45) + '…' : data.service,
      service: data.datatype || data.service, tool: data.tool || 'TBD', format: data.format || 'TBD',
      analyst: 'Unassigned', deadline: data.final_deadline || 'TBD',
      total: '0', deposit: '0', balance: '0', status: 'Pending'
    })
    renderSQL()

    // Notify admin panel
    showAdminAlert(newId, data.name, data.email)

    statusEl.style.color = '#107C10'
    statusEl.textContent = '✓ Submitted! A confirmation email has been sent to ' + data.email
    setTimeout(() => {
      closeModal(); mStep = 1; btn.disabled = false; statusEl.textContent = ''
      ;[1, 2, 3].forEach(i => { document.getElementById('ms' + i).style.display = i === 1 ? 'block' : 'none'; document.getElementById('sd' + i).className = 'sdt' + (i === 1 ? ' on' : '') })
      document.getElementById('mprev').style.display = 'none'; btn.textContent = 'Continue →'
    }, 2200)
  }).catch(() => {
    btn.disabled = false
    statusEl.style.color = '#D13438'
    statusEl.textContent = '⚠ Could not submit online. Please email hello@databridge.co.ke or call +254 748 216 918 directly.'
  })
}
function mPrev(){
  if(mStep>1){
    document.getElementById('ms'+mStep).style.display='none';mStep--
    document.getElementById('ms'+mStep).style.display='block'
    document.getElementById('sd'+(mStep+1)).classList.remove('on');document.getElementById('sd'+mStep).classList.add('on')
    if(mStep===1)document.getElementById('mprev').style.display='none'
    document.getElementById('mnext').textContent='Continue →'
  }
}

// CHAT
function openChat(){document.getElementById('chatPan').classList.toggle('open');document.querySelector('.cbdg').style.display='none'}
const reps=['Great! How many variables and respondents does your dataset have?','That sounds like a great project. I would recommend SPSS or R for this. Shall I help you set up an order?','We handle data collection too — we design the questionnaire, deploy it, then analyse the results.','Turnaround is 3–7 days depending on complexity. We agree on a deadline when you place your order.','Click "Start Your Project" to submit your details and I will be assigned to your case right away!']
let rIdx=0
function sendChat(){
  const i=document.getElementById('chatIn'),m=i.value.trim();if(!m)return
  const c=document.getElementById('chatMsgs')
  c.innerHTML+=`<div class="msg c">${m}</div>`;i.value='';c.scrollTop=c.scrollHeight
  setTimeout(()=>{c.innerHTML+=`<div class="msg a">${reps[rIdx%reps.length]}</div>`;c.scrollTop=c.scrollHeight;rIdx++},900)
}
// ===== POWER BI CLIENT DASHBOARD — LIVE DATA =====
let pbiPaused = false;
function pbiPause(){
  pbiPaused = !pbiPaused;
  document.getElementById('pbiPauseBtn').textContent = pbiPaused ? '▶ Resume' : '⏸ Pause';
}
function pbiRefresh(){ pbiUpdateKPIs(); pbiJitterBars(); pbiJitterDonut(); pbiAddOrder(); }

const pbiKpis = [
  {label:'Active Orders', value:3, fmt:v=>Math.round(v).toString(), delta:1},
  {label:'Completed', value:7, fmt:v=>Math.round(v).toString(), delta:0},
  {label:'Balance Due (KES)', value:12000, fmt:v=>'KES '+(v/1000).toFixed(1)+'k', delta:-2.4},
  {label:'Unread Messages', value:2, fmt:v=>Math.round(v).toString(), delta:0.5},
];
const pbiKpiRow = document.getElementById('pbiKpiRow');
if(pbiKpiRow){
  pbiKpis.forEach((k,i)=>{
    const el=document.createElement('div');
    el.className='pbi-card';
    el.innerHTML=`<div class="pl">${k.label}</div><div class="pv" id="pbiKpiVal${i}">${k.fmt(k.value)}</div>
    <div class="pd ${k.delta>=0?'up':'down'}" id="pbiKpiDelta${i}">${k.delta>=0?'▲':'▼'} ${Math.abs(k.delta).toFixed(1)}%</div>`;
    pbiKpiRow.appendChild(el);
  });
}
function pbiUpdateKPIs(){
  pbiKpis.forEach((k,i)=>{
    const change=(Math.random()-0.5)*0.06;
    k.value=Math.max(0,k.value*(1+change));
    k.delta=k.delta*0.7+(change*100)*3;
    const v=document.getElementById('pbiKpiVal'+i), d=document.getElementById('pbiKpiDelta'+i);
    if(!v)return;
    v.style.opacity=.25;
    setTimeout(()=>{v.textContent=k.fmt(k.value);v.style.opacity=1;},150);
    d.className='pd '+(k.delta>=0?'up':'down');
    d.textContent=(k.delta>=0?'▲ ':'▼ ')+Math.abs(k.delta).toFixed(1)+'%';
  });
}

const pbiWeeks=8;
let pbiBarData=Array.from({length:pbiWeeks},()=>({a:20+Math.random()*40,b:30+Math.random()*55}));
const pbiBarSvg=document.getElementById('pbiBarChart');
function pbiRenderBars(){
  if(!pbiBarSvg)return;
  const w=720,h=190,padB=20,gap=10;
  const barW=(w/pbiWeeks)-gap-14;
  const maxV=Math.max(...pbiBarData.map(d=>Math.max(d.a,d.b)));
  const scale=(h-padB)/maxV;
  let out='';
  pbiBarData.forEach((d,i)=>{
    const x=i*(w/pbiWeeks)+6;
    const ha=d.a*scale, hb=d.b*scale;
    out+=`<rect x="${x}" y="${h-padB-ha}" width="${barW/2}" height="${ha}" fill="#F2C811" rx="2"/>`;
    out+=`<rect x="${x+barW/2+2}" y="${h-padB-hb}" width="${barW/2}" height="${hb}" fill="#1565C0" rx="2"/>`;
  });
  out+=`<line x1="0" y1="${h-padB}" x2="${w}" y2="${h-padB}" stroke="#E1DFDD" stroke-width="1"/>`;
  pbiBarSvg.innerHTML=out;
}
function pbiJitterBars(){
  pbiBarData.shift();
  pbiBarData.push({a:20+Math.random()*40,b:30+Math.random()*55});
  pbiRenderBars();
}

let pbiDonut=[
  {label:'Total Paid',value:48,color:'#1565C0'},
  {label:'Deposits',value:24,color:'#F2C811'},
  {label:'Balance',value:12,color:'#D13438'},
];
const pbiDonutSvg=document.getElementById('pbiDonut');
function pbiRenderDonut(){
  if(!pbiDonutSvg)return;
  const total=pbiDonut.reduce((s,d)=>s+d.value,0);
  const r=46,cx=60,cy=60,thick=15;
  let angle=-90,segs='';
  pbiDonut.forEach(d=>{
    const frac=d.value/total, sweep=frac*360, large=sweep>180?1:0;
    const x1=cx+r*Math.cos(angle*Math.PI/180), y1=cy+r*Math.sin(angle*Math.PI/180);
    const end=angle+sweep;
    const x2=cx+r*Math.cos(end*Math.PI/180), y2=cy+r*Math.sin(end*Math.PI/180);
    segs+=`<path d="M${x1} ${y1} A${r} ${r} 0 ${large} 1 ${x2} ${y2}" fill="none" stroke="${d.color}" stroke-width="${thick}" stroke-linecap="round"/>`;
    angle=end+3;
  });
  pbiDonutSvg.innerHTML=segs;
  const c=document.getElementById('pbiDonutCenter');
  if(c)c.innerHTML=`<div class="v">KES ${total}k</div><div class="l">Total</div>`;
  const l=document.getElementById('pbiDonutList');
  if(l)l.innerHTML=pbiDonut.map(d=>`<div><span>${d.label}</span><b>KES ${d.value.toFixed(0)}k</b></div>`).join('');
}
function pbiJitterDonut(){
  pbiDonut.forEach(d=>d.value=Math.max(4,d.value+(Math.random()-0.5)*5));
  pbiRenderDonut();
}

const pbiProjects=['Survey Data Cleaning','Thematic Analysis — Qual','Logistic Regression Model','Panel Data Fixed Effects','Likert Scale Validation','Time Series Forecast'];
const pbiTools=['SPSS','R','Python','STATA','NVivo'];
const pbiStatuses=[['In Progress','prog'],['Confirmed','done'],['Draft Review','review']];
let pbiOrderSeq=4;
function pbiAddOrder(){
  const body=document.getElementById('pbiOrdersBody');
  if(!body)return;
  const proj=pbiProjects[Math.floor(Math.random()*pbiProjects.length)];
  const tool=pbiTools[Math.floor(Math.random()*pbiTools.length)];
  const [label,cls]=pbiStatuses[Math.floor(Math.random()*pbiStatuses.length)];
  const row=document.createElement('tr');
  row.className='pbi-new';
  row.innerHTML=`<td><strong>DB-2025-00${pbiOrderSeq++}</strong></td><td>${proj}</td><td>${tool}</td><td>—</td><td>—</td><td><span class="pbi-status ${cls}">${label}</span></td>`;
  body.prepend(row);
  while(body.children.length>6) body.removeChild(body.lastChild);
}

pbiRenderBars();
pbiRenderDonut();
setInterval(()=>{ if(!pbiPaused) pbiUpdateKPIs(); },2400);
setInterval(()=>{ if(!pbiPaused) pbiJitterBars(); },2000);
setInterval(()=>{ if(!pbiPaused) pbiJitterDonut(); },2800);
setInterval(()=>{ if(!pbiPaused) pbiAddOrder(); },5000);

function clientSend(){
  const i=document.getElementById('clientChatIn'),m=i.value.trim();if(!m)return
  const c=document.getElementById('clientMsgs')
  c.innerHTML+=`<div class="msg c">${m}</div>`;i.value='';c.scrollTop=c.scrollHeight
  setTimeout(()=>{c.innerHTML+=`<div class="msg a">Thank you for the note — I will incorporate that into the analysis and update you shortly.</div>`;c.scrollTop=c.scrollHeight},900)
}
function analystSend(){
  const i=document.getElementById('analystChatIn'),m=i.value.trim();if(!m)return
  const c=document.getElementById('analystMsgs')
  c.innerHTML+=`<div class="msg a">${m}</div>`;i.value='';c.scrollTop=c.scrollHeight
}