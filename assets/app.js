(() => {
  'use strict';

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const uid = (p = 'id') => `${p}_${crypto?.randomUUID ? crypto.randomUUID().replaceAll('-', '').slice(0, 12) : Math.random().toString(36).slice(2)}`;
  const isoNow = () => new Date().toISOString();
  const ymd = (d = new Date()) => d.toISOString().slice(0, 10);
  const esc = (v = '') => String(v).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));
  const money = (n, currency = state.settings?.currency || 'GBP') => new Intl.NumberFormat('en-GB', { style:'currency', currency }).format(Number(n || 0));
  const dateFmt = v => v ? new Intl.DateTimeFormat('en-GB', { day:'2-digit', month:'short', year:'numeric' }).format(new Date(`${String(v).slice(0,10)}T12:00:00`)) : '—';
  const dtFmt = v => v ? new Intl.DateTimeFormat('en-GB', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }).format(new Date(v)) : '—';
  const firstName = name => String(name || '').trim().split(/\s+/)[0] || 'there';
  const customerDisplayName = c => { const person = [c?.title, c?.firstName, c?.surname].filter(Boolean).join(' ').trim(); return person || c?.name || c?.company || 'Unnamed customer'; };
  const customerPhone = c => c?.mobile || c?.telephone || c?.phone || '';

  const DEMO_SEED = {
    settings:{ businessName:'Your Event Business',businessEmail:'hello@example.com',businessPhone:'',businessAddress:'',vatNumber:'',currency:'GBP',accent:'#6d5dfc',logoUrl:'',invoicePrefix:'INV-',nextInvoiceNumber:1001,defaultDepositPercent:25,paymentTermsDays:14,enquiryThankYou:'Thanks — your enquiry has been received. We’ll be in touch shortly.',terms:'Bookings are confirmed once the contract is accepted and any required deposit is paid.',addressFinderApiKey:'ak_test' },
    enquiries:[{id:'enq_1',createdAt:isoNow(),status:'New',name:'Sophie Carter',email:'sophie@example.com',phone:'07700 900123',eventDate:'2026-10-17',eventType:'Wedding',venue:'Southdowns Manor',service:'Magic Mirror Wedding Package',budget:595,source:'Website',notes:'Evening reception, approx 120 guests'},{id:'enq_2',createdAt:isoNow(),status:'Contacted',name:'Marcus Green',email:'marcus@example.com',phone:'07700 900456',eventDate:'2026-11-07',eventType:'Birthday',venue:'Portsmouth Guildhall',service:'Selfie Pod + Printer',budget:345,source:'Instagram',notes:'21st birthday'}],
    customers:[{id:'cus_1',createdAt:'2026-03-11T09:00:00Z',name:'Emma Wilson',company:'',title:'Mrs',firstName:'Emma',surname:'Wilson',jobTitle:'',telephone:'',mobile:'07700 910101',email:'emma@example.com',website:'',notes:'Prefers email'},{id:'cus_2',createdAt:'2026-04-02T09:00:00Z',name:'Sarah Hughes',company:'Harbour Events Ltd',title:'Ms',firstName:'Sarah',surname:'Hughes',jobTitle:'Events Manager',telephone:'023 9000 1000',mobile:'',email:'events@harbour.example.com',website:'https://example.com',notes:'Corporate client'}],
    bookings:[{id:'book_1',createdAt:'2026-04-05T11:00:00Z',customerId:'cus_1',customerName:'Emma & Jack Wilson',title:'Wilson Wedding',eventType:'Wedding',eventDate:'2026-09-26',startTime:'18:00',endTime:'22:00',venue:'Upwaltham Barns',serviceId:'svc_1',serviceName:'Magic Mirror Wedding Package',status:'Confirmed',contractStatus:'Accepted',total:595,deposit:148.75,balance:446.25,notes:'Set up before guests enter room',assignedPerformerIds:[]},{id:'book_2',createdAt:'2026-05-09T11:00:00Z',customerId:'cus_2',customerName:'Harbour Events Ltd',title:'Autumn Awards Night',eventType:'Corporate',eventDate:'2026-10-09',startTime:'19:00',endTime:'23:00',venue:'The Queens Hotel, Portsmouth',serviceId:'svc_2',serviceName:'Selfie Pod + Printer',status:'Contract Issued',contractStatus:'Sent',total:445,deposit:111.25,balance:333.75,notes:'Includes early setup',assignedPerformerIds:['perf_1']}],
    invoices:[{id:'inv_1',createdAt:'2026-04-05T11:05:00Z',number:'INV-1000',bookingId:'book_1',customerId:'cus_1',customerName:'Emma & Jack Wilson',type:'Deposit',issueDate:'2026-04-05',dueDate:'2026-04-19',amount:148.75,status:'Paid',paidAt:'2026-04-06T10:30:00Z',description:'Deposit - Wilson Wedding'},{id:'inv_2',createdAt:'2026-08-10T11:05:00Z',number:'INV-1001',bookingId:'book_1',customerId:'cus_1',customerName:'Emma & Jack Wilson',type:'Balance',issueDate:'2026-08-10',dueDate:'2026-09-12',amount:446.25,status:'Sent',paidAt:null,description:'Final balance - Wilson Wedding'}],
    payments:[{id:'pay_1',createdAt:'2026-04-06T10:30:00Z',invoiceId:'inv_1',invoiceNumber:'INV-1000',customerName:'Emma & Jack Wilson',amount:148.75,method:'Card',reference:'demo-payment',date:'2026-04-06'}],
    services:[{id:'svc_1',createdAt:'2026-01-01T09:00:00Z',name:'Magic Mirror Wedding Package',category:'Photobooth',price:595,durationHours:4,depositPercent:25,active:true,description:'4 hours, attendant, backdrop and guest book'},{id:'svc_2',createdAt:'2026-01-01T09:00:00Z',name:'Selfie Pod + Printer',category:'Photobooth',price:345,durationHours:3,depositPercent:25,active:true,description:'3 hours with printer and backdrop'},{id:'svc_3',createdAt:'2026-01-01T09:00:00Z',name:'Selfie Pod - Digital',category:'Photobooth',price:295,durationHours:3,depositPercent:25,active:true,description:'3 hours, digital sharing, backdrop'}],
    performers:[{id:'perf_1',createdAt:'2026-03-01T09:00:00Z',name:'Alex Morgan',email:'alex@example.com',phone:'07700 911111',role:'Booth Attendant',defaultFee:85,active:true,notes:'Available most weekends'}],
    emailTemplates:[{id:'mail_1',createdAt:'2026-01-01T09:00:00Z',name:'New enquiry reply',subject:'Thanks for your enquiry, [[first]]',body:'Hi [[first]],\n\nThanks for getting in touch about [[eventTitle]] on [[eventDate]]. I’ve received your enquiry and will come back to you shortly.\n\nBest wishes,\n[[businessName]]'},{id:'mail_2',createdAt:'2026-01-01T09:00:00Z',name:'Balance reminder',subject:'Your balance is due for [[eventTitle]]',body:'Hi [[first]],\n\nJust a friendly reminder that the balance for [[eventTitle]] is now due.\n\nThanks,\n[[businessName]]'}],
    automations:[{id:'auto_1',createdAt:'2026-01-01T09:00:00Z',name:'Enquiry follow-up',trigger:'New enquiry',delayDays:2,templateId:'mail_1',active:true},{id:'auto_2',createdAt:'2026-01-01T09:00:00Z',name:'Review request',trigger:'Event completed',delayDays:3,templateId:'mail_1',active:true}],
    documents:[], activities:[{id:'act_1',createdAt:isoNow(),type:'enquiry',text:'Demo CRM loaded and ready to edit'}]
  };

  let state = structuredClone(DEMO_SEED);
  let mode = 'local';
  let serverAuthRequired = false;
  let route = 'dashboard';
  let calendarCursor = new Date();
  const LS_KEY = 'eventflow_crm_v1';

  const view = $('#view');
  const modal = $('#modal');
  const modalBody = $('#modalBody');
  const modalFooter = $('#modalFooter');

  async function api(path, options = {}) {
    const headers = { 'Content-Type':'application/json', ...(options.headers || {}) };
    const token = localStorage.getItem('eventflow_token');
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(path, { ...options, headers });
    const contentType = res.headers.get('content-type') || '';
    const payload = contentType.includes('application/json') ? await res.json() : await res.text();
    if (!res.ok) throw new Error(payload?.error || `Request failed (${res.status})`);
    return payload;
  }

  async function detectMode() {
    if (location.protocol === 'file:') return false;
    try {
      const health = await api('/api/health');
      if (health?.ok) { mode = 'api'; serverAuthRequired = !!health.authRequired; return true; }
    } catch {}
    return false;
  }

  async function loadState() {
    if (await detectMode()) {
      try {
        if (serverAuthRequired && !localStorage.getItem('eventflow_token')) await promptLogin();
        state = await api('/api/bootstrap');
      } catch (err) {
        if (serverAuthRequired && /auth|401|expired|token/i.test(String(err.message || err))) {
          try { await promptLogin(); state = await api('/api/bootstrap'); }
          catch (loginErr) { console.warn(loginErr); mode = 'local'; }
        } else {
          console.warn(err); mode = 'local';
        }
      }
    }
    if (mode === 'local') {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        try { state = JSON.parse(saved); return; } catch {}
      }
      if (location.protocol !== 'file:') {
        try {
          const res = await fetch('data/db.json', { cache:'no-store' });
          if (res.ok) state = await res.json();
        } catch {}
      }
      saveLocal();
    }
  }

  function promptLogin() {
    return new Promise((resolve, reject) => {
      openModal('Sign in', 'ADMIN ACCESS', `<div class="form-grid"><div class="field full"><label>EMAIL</label><input id="loginEmail" type="email" autocomplete="username"></div><div class="field full"><label>PASSWORD</label><input id="loginPassword" type="password" autocomplete="current-password"></div><div class="field full"><div class="notice">This server has admin authentication enabled.</div></div></div>`, 'Sign in', async () => {
        try {
          const out = await api('/api/auth/login', { method:'POST', body:JSON.stringify({ email:val('#loginEmail'), password:val('#loginPassword') }) });
          localStorage.setItem('eventflow_token', out.token);
          modal.close();
          resolve(out);
        } catch (err) { toast(err.message || 'Sign in failed'); }
      });
      const cancel = $('#cancelModal');
      if (cancel) cancel.onclick = () => { modal.close(); reject(new Error('Login cancelled')); };
      setTimeout(() => $('#loginEmail')?.focus(), 50);
    });
  }

  function saveLocal() { if (mode === 'local') localStorage.setItem(LS_KEY, JSON.stringify(state)); }
  function addActivity(type, text) {
    state.activities ||= [];
    state.activities.unshift({ id:uid('act'), createdAt:isoNow(), type, text });
    state.activities = state.activities.slice(0, 150);
  }

  async function createRecord(collection, data) {
    if (mode === 'api') { const item = await api(`/api/${collection}`, { method:'POST', body:JSON.stringify(data) }); await refresh(); return item; }
    const item = { id:uid(collection.slice(0,4)), createdAt:isoNow(), ...data };
    state[collection] ||= []; state[collection].unshift(item); addActivity(collection, `${human(collection)} record created`); saveLocal(); return item;
  }
  async function updateRecord(collection, id, data) {
    if (mode === 'api') { const item = await api(`/api/${collection}/${id}`, { method:'PUT', body:JSON.stringify(data) }); await refresh(); return item; }
    const item = state[collection].find(x => x.id === id); if (!item) throw new Error('Record not found'); Object.assign(item, data, {updatedAt:isoNow()}); addActivity(collection, `${human(collection)} record updated`); saveLocal(); return item;
  }
  async function deleteRecord(collection, id) {
    if (!confirm('Delete this record? This cannot be undone.')) return false;
    if (mode === 'api') { await api(`/api/${collection}/${id}`, { method:'DELETE' }); await refresh(); return true; }
    state[collection] = state[collection].filter(x => x.id !== id); addActivity(collection, `${human(collection)} record deleted`); saveLocal(); return true;
  }
  async function refresh() { if (mode === 'api') state = await api('/api/bootstrap'); applyBranding(); render(); }
  const human = s => s.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase());

  function toast(text) {
    const el = $('#toast'); el.textContent = text; el.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 2600);
  }

  function statusClass(s = '') {
    s = s.toLowerCase();
    if (['paid','confirmed','accepted','converted','active'].some(x => s.includes(x))) return 'success';
    if (['overdue','cancelled','declined'].some(x => s.includes(x))) return 'danger';
    if (['new','draft','held','sent','issued','contacted'].some(x => s.includes(x))) return 'warning';
    return 'accent';
  }
  const badge = s => `<span class="badge ${statusClass(s)}">${esc(s || '—')}</span>`;
  const empty = (title, copy = '') => `<div class="empty"><strong>${esc(title)}</strong>${esc(copy)}</div>`;
  const table = (headers, rows) => `<div class="table-wrap"><table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;

  function setHeader(title, eyebrow = '') { $('#pageTitle').textContent = title; $('#pageEyebrow').textContent = eyebrow || 'EVENTFLOW CRM'; document.title = `${title} · ${state.settings.businessName || 'EventFlow'}`; }

  function applyBranding() {
    const accent = state.settings?.accent || '#6d5dfc';
    document.documentElement.style.setProperty('--accent', accent);
    const rgb = hexToRgb(accent); if (rgb) document.documentElement.style.setProperty('--accent-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    $('#brandName').textContent = state.settings?.businessName || 'EventFlow';
    const mark = $('#brandMark');
    if (state.settings?.logoUrl) mark.innerHTML = `<img src="${esc(state.settings.logoUrl)}" alt="Logo">`;
    else mark.textContent = (state.settings?.businessName || 'EF').split(/\s+/).map(x=>x[0]).slice(0,2).join('').toUpperCase();
    $('#modeBadge').innerHTML = mode === 'api' ? '● Server mode · shared persistent data' : '● Static demo mode · saved in this browser';
    const newCount = (state.enquiries || []).filter(x => x.status === 'New').length;
    $('#navEnquiryCount').textContent = newCount || '';
    $('#navEnquiryCount').style.display = newCount ? 'grid' : 'none';
  }
  function hexToRgb(hex) { const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex); return m ? {r:parseInt(m[1],16),g:parseInt(m[2],16),b:parseInt(m[3],16)} : null; }

  function render() {
    applyBranding();
    $$('#nav button').forEach(b => b.classList.toggle('active', b.dataset.route === route));
    const fn = ({dashboard:renderDashboard,enquiries:renderEnquiries,bookings:renderBookings,calendar:renderCalendar,customers:renderCustomers,invoices:renderInvoices,payments:renderPayments,services:renderServices,performers:renderPerformers,emails:renderEmails,reports:renderReports,settings:renderSettings})[route] || renderDashboard;
    fn();
    window.scrollTo({ top:0, behavior:'instant' });
  }

  function renderDashboard() {
    setHeader('Dashboard', 'BUSINESS OVERVIEW');
    const month = ymd().slice(0,7);
    const nextBookings = (state.bookings || []).filter(x => x.eventDate >= ymd() && x.status !== 'Cancelled').sort((a,b)=>a.eventDate.localeCompare(b.eventDate));
    const monthRevenue = (state.payments || []).filter(x => String(x.date || '').startsWith(month)).reduce((s,x)=>s+Number(x.amount||0),0);
    const outstanding = (state.invoices || []).filter(x => x.status !== 'Paid' && x.status !== 'Cancelled').reduce((s,x)=>s+Number(x.amount||0),0);
    const confirmed = (state.bookings || []).filter(x => x.status === 'Confirmed').length;
    view.innerHTML = `
      <div class="grid cols-4">
        ${stat('Upcoming bookings', nextBookings.length, nextBookings[0] ? `Next: ${dateFmt(nextBookings[0].eventDate)}` : 'No future bookings')}
        ${stat('Revenue this month', money(monthRevenue), `${(state.payments||[]).filter(x=>String(x.date||'').startsWith(month)).length} payments received`)}
        ${stat('Outstanding', money(outstanding), `${(state.invoices||[]).filter(x=>x.status!=='Paid'&&x.status!=='Cancelled').length} open invoices`)}
        ${stat('Confirmed jobs', confirmed, `${(state.enquiries||[]).filter(x=>x.status==='New').length} new enquiries waiting`)}
      </div>
      <div class="grid cols-3 section">
        <div class="card panel" style="grid-column:span 2">
          <div class="section-head"><div><h2>Coming up</h2><p>Your next confirmed and held dates</p></div><button class="action-link" data-go="calendar">Open calendar →</button></div>
          ${nextBookings.length ? table(['Date','Event','Client','Venue','Status','Value'], nextBookings.slice(0,6).map(b=>`<tr><td>${dateFmt(b.eventDate)}</td><td><div class="cell-title">${esc(b.title)}</div><div class="cell-sub">${esc(b.serviceName||'')}</div></td><td>${esc(b.customerName)}</td><td>${esc(b.venue||'—')}</td><td>${badge(b.status)}</td><td class="money">${money(b.total)}</td></tr>`)) : empty('No upcoming bookings')}
        </div>
        <div class="card panel">
          <div class="section-head"><div><h2>Quick actions</h2><p>Common admin jobs</p></div></div>
          <div class="quick-grid">
            ${quick('＋','New enquiry','Capture a lead','enquiry')}
            ${quick('▣','New booking','Add an event','booking')}
            ${quick('♙','New customer','Add a contact','customer')}
            ${quick('£','Create invoice','Bill a booking','invoice')}
          </div>
        </div>
      </div>
      <div class="grid cols-2 section">
        <div class="card panel">
          <div class="section-head"><div><h2>Recent activity</h2><p>Latest changes in your CRM</p></div></div>
          <div class="activity-list">${(state.activities||[]).slice(0,8).map(a=>`<div class="activity"><div class="activity-icon">${iconFor(a.type)}</div><div><p>${esc(a.text)}</p><small>${dtFmt(a.createdAt)}</small></div></div>`).join('') || empty('No activity yet')}</div>
        </div>
        <div class="card panel">
          <div class="section-head"><div><h2>Admin attention</h2><p>Items worth dealing with next</p></div></div>
          ${attentionList()}
        </div>
      </div>`;
    bindCommon();
  }
  const stat = (label,num,sub) => `<div class="card stat-card"><div class="stat-head"><span>${esc(label)}</span><span>↗</span></div><div class="stat-number">${num}</div><div class="stat-sub">${esc(sub)}</div></div>`;
  const quick = (i,t,s,a) => `<button class="quick-card" data-action="${a}"><strong>${i} ${esc(t)}</strong><span>${esc(s)}</span></button>`;
  function iconFor(t='') { return ({enquiry:'✦',invoice:'£',payment:'✓',booking:'▣',settings:'⚙',customers:'♙'})[t] || '•'; }
  function attentionList() {
    const items = [];
    (state.enquiries||[]).filter(x=>x.status==='New').slice(0,3).forEach(x=>items.push({i:'✦',t:`Reply to ${x.name}`,s:`Enquiry for ${dateFmt(x.eventDate)}`}));
    (state.invoices||[]).filter(x=>x.status!=='Paid' && x.dueDate < ymd()).slice(0,3).forEach(x=>items.push({i:'£',t:`${x.number} is overdue`,s:`${money(x.amount)} · ${x.customerName}`}));
    (state.bookings||[]).filter(x=>x.status==='Contract Issued').slice(0,3).forEach(x=>items.push({i:'▣',t:`Contract awaiting acceptance`,s:x.title}));
    return items.length ? `<div class="activity-list">${items.map(x=>`<div class="activity"><div class="activity-icon">${x.i}</div><div><p>${esc(x.t)}</p><small>${esc(x.s)}</small></div></div>`).join('')}</div>` : `<div class="notice">Nothing urgent. Your new enquiries, overdue invoices and unsigned contracts will appear here.</div>`;
  }

  function renderEnquiries() {
    setHeader('Enquiries','LEADS & WEB ENQUIRIES');
    const rows = (state.enquiries||[]).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))).map(e=>`<tr data-search="${esc(JSON.stringify(e).toLowerCase())}"><td><div class="cell-title">${esc(e.name)}</div><div class="cell-sub">${esc(e.email)}</div></td><td>${dateFmt(e.eventDate)}<div class="cell-sub">${esc(e.eventType||'')}</div></td><td>${esc(e.service||'—')}</td><td>${esc(e.venue||'—')}</td><td>${money(e.budget)}</td><td>${badge(e.status)}</td><td><button class="action-link" data-edit-enquiry="${e.id}">Edit</button>${e.status!=='Converted'?`<button class="action-link" data-convert="${e.id}">Convert</button>`:''}</td></tr>`);
    view.innerHTML = listPage('Enquiries','Capture website, Instagram, phone and referral leads.','New enquiry','enquiry',['Customer','Event date','Service','Venue','Budget','Status',''],rows);
    bindListSearch(); bindCommon();
    $$('[data-edit-enquiry]').forEach(b=>b.onclick=()=>openEnquiry(b.dataset.editEnquiry));
    $$('[data-convert]').forEach(b=>b.onclick=()=>convertEnquiry(b.dataset.convert));
  }

  function renderBookings() {
    setHeader('Bookings','EVENTS & JOBS');
    const rows = (state.bookings||[]).slice().sort((a,b)=>String(a.eventDate).localeCompare(String(b.eventDate))).map(b=>`<tr data-search="${esc(JSON.stringify(b).toLowerCase())}"><td>${dateFmt(b.eventDate)}<div class="cell-sub">${esc([b.startTime,b.endTime].filter(Boolean).join('–'))}</div></td><td><div class="cell-title">${esc(b.title)}</div><div class="cell-sub">${esc(b.serviceName||b.eventType||'')}</div></td><td>${esc(b.customerName)}</td><td>${esc(b.venue||'—')}</td><td>${badge(b.status)}<div class="cell-sub">Contract: ${esc(b.contractStatus||'—')}</div></td><td class="money">${money(b.total)}</td><td><button class="action-link" data-view-booking="${b.id}">Manage</button></td></tr>`);
    view.innerHTML = listPage('Bookings','From date holds to confirmed events and completed jobs.','New booking','booking',['Date','Event','Customer','Venue','Status','Value',''],rows);
    bindListSearch(); bindCommon(); $$('[data-view-booking]').forEach(x=>x.onclick=()=>openBooking(x.dataset.viewBooking));
  }

  function renderCustomers() {
    setHeader('Customers','CLIENT DATABASE');
    const rows = (state.customers||[]).map(c=>{const count=(state.bookings||[]).filter(b=>b.customerId===c.id).length; const value=(state.bookings||[]).filter(b=>b.customerId===c.id).reduce((s,b)=>s+Number(b.total||0),0);return `<tr data-search="${esc(JSON.stringify(c).toLowerCase())}"><td><div class="cell-title">${esc(customerDisplayName(c))}</div><div class="cell-sub">${esc(c.jobTitle||'')}</div></td><td>${esc(c.company||'—')}</td><td>${esc(c.email||'—')}<div class="cell-sub">${esc(customerPhone(c))}</div></td><td>${esc(c.website||'—')}</td><td>${count}</td><td class="money">${money(value)}</td><td><button class="action-link" data-edit-customer="${c.id}">Edit</button></td></tr>`});
    view.innerHTML = listPage('Customers','Keep repeat clients, companies and contact details in one place.','New customer','customer',['Customer','Company','Contact','Website','Bookings','Lifetime value',''],rows);
    bindListSearch(); bindCommon(); $$('[data-edit-customer]').forEach(x=>x.onclick=()=>openCustomer(x.dataset.editCustomer));
  }

  function renderInvoices() {
    setHeader('Invoices','BILLING');
    const rows = (state.invoices||[]).map(i=>`<tr data-search="${esc(JSON.stringify(i).toLowerCase())}"><td><div class="cell-title">${esc(i.number)}</div><div class="cell-sub">${esc(i.type||'Invoice')}</div></td><td>${esc(i.customerName)}</td><td>${dateFmt(i.issueDate)}</td><td>${dateFmt(i.dueDate)}</td><td class="money">${money(i.amount)}</td><td>${badge(i.status)}</td><td><button class="action-link" data-invoice="${i.id}">View</button>${i.status!=='Paid'?`<button class="action-link" data-paid="${i.id}">Mark paid</button>`:''}</td></tr>`);
    view.innerHTML = listPage('Invoices','Generate deposits and final balances, then track what is still owed.','Create invoice','invoice',['Invoice','Customer','Issued','Due','Amount','Status',''],rows);
    bindListSearch(); bindCommon(); $$('[data-invoice]').forEach(x=>x.onclick=()=>openInvoice(x.dataset.invoice)); $$('[data-paid]').forEach(x=>x.onclick=()=>markPaid(x.dataset.paid));
  }

  function renderPayments() {
    setHeader('Payments','MONEY RECEIVED');
    const total=(state.payments||[]).reduce((s,p)=>s+Number(p.amount||0),0);
    const rows=(state.payments||[]).map(p=>`<tr data-search="${esc(JSON.stringify(p).toLowerCase())}"><td>${dateFmt(p.date)}</td><td><div class="cell-title">${esc(p.invoiceNumber||'Manual')}</div><div class="cell-sub">${esc(p.reference||'')}</div></td><td>${esc(p.customerName)}</td><td>${esc(p.method||'—')}</td><td class="money">${money(p.amount)}</td></tr>`);
    view.innerHTML=`<div class="grid cols-3">${stat('Payments recorded',(state.payments||[]).length,'All time')}${stat('Total received',money(total),'All recorded payments')}${stat('Card / online',(state.payments||[]).filter(x=>/card|stripe/i.test(x.method||'')).length,'Online payment records')}</div><div class="section">${listPage('Payment history','Every payment recorded against an invoice.','Record payment','payment',['Date','Invoice','Customer','Method','Amount'],rows,true)}</div>`;
    bindListSearch(); bindCommon();
  }

  function renderServices() {
    setHeader('Services & packages','CATALOGUE');
    const rows=(state.services||[]).map(s=>`<tr data-search="${esc(JSON.stringify(s).toLowerCase())}"><td><div class="cell-title">${esc(s.name)}</div><div class="cell-sub">${esc(s.description||'')}</div></td><td>${esc(s.category||'—')}</td><td class="money">${money(s.price)}</td><td>${esc(s.durationHours||0)} hrs</td><td>${esc(s.depositPercent)}%</td><td>${badge(s.active?'Active':'Inactive')}</td><td><button class="action-link" data-edit-service="${s.id}">Edit</button></td></tr>`);
    view.innerHTML=listPage('Services & packages','Reusable products, packages, pricing and deposit rules.','New service','service',['Service','Category','Price','Duration','Deposit','Status',''],rows);
    bindListSearch(); bindCommon(); $$('[data-edit-service]').forEach(x=>x.onclick=()=>openService(x.dataset.editService));
  }

  function renderPerformers() {
    setHeader('Team / suppliers','PEOPLE & FULFILMENT');
    const rows=(state.performers||[]).map(p=>`<tr data-search="${esc(JSON.stringify(p).toLowerCase())}"><td><div class="cell-title">${esc(p.name)}</div><div class="cell-sub">${esc(p.role||'')}</div></td><td>${esc(p.email||'—')}<div class="cell-sub">${esc(p.phone||'')}</div></td><td class="money">${money(p.defaultFee)}</td><td>${badge(p.active?'Active':'Inactive')}</td><td>${esc(p.notes||'—')}</td><td><button class="action-link" data-edit-performer="${p.id}">Edit</button></td></tr>`);
    view.innerHTML=listPage('Team / suppliers','Keep attendants, performers, subcontractors and supplier rates together.','Add person','performer',['Name','Contact','Default fee','Status','Notes',''],rows);
    bindListSearch(); bindCommon(); $$('[data-edit-performer]').forEach(x=>x.onclick=()=>openPerformer(x.dataset.editPerformer));
  }

  function renderEmails() {
    setHeader('Emails & automation','COMMUNICATIONS');
    const templates=(state.emailTemplates||[]).map(t=>`<tr><td><div class="cell-title">${esc(t.name)}</div><div class="cell-sub">${esc(t.subject)}</div></td><td>${esc(t.body).slice(0,120)}${String(t.body).length>120?'…':''}</td><td><button class="action-link" data-edit-template="${t.id}">Edit</button></td></tr>`);
    const autos=(state.automations||[]).map(a=>{const t=(state.emailTemplates||[]).find(x=>x.id===a.templateId);return `<tr><td><div class="cell-title">${esc(a.name)}</div></td><td>${esc(a.trigger)}</td><td>${a.delayDays} day${Number(a.delayDays)===1?'':'s'}</td><td>${esc(t?.name||'—')}</td><td>${badge(a.active?'Active':'Paused')}</td><td><button class="action-link" data-edit-auto="${a.id}">Edit</button></td></tr>`});
    view.innerHTML=`<div class="notice">Templates support merge fields such as <b>[[first]]</b>, <b>[[eventTitle]]</b>, <b>[[eventDate]]</b> and <b>[[businessName]]</b>. SMTP sending is enabled when you add mail server details to <code>.env</code>.</div><div class="section card table-card"><div class="table-toolbar"><div><b>Email templates</b><div class="cell-sub">Reusable replies and reminders</div></div><button class="primary-btn" data-action="template">＋ New template</button></div>${templates.length?table(['Template','Preview',''],templates):empty('No templates')}</div><div class="section card table-card"><div class="table-toolbar"><div><b>Automation rules</b><div class="cell-sub">Rules are stored now; a production scheduler/worker can execute them.</div></div><button class="primary-btn" data-action="automation">＋ New rule</button></div>${autos.length?table(['Rule','Trigger','Delay','Template','Status',''],autos):empty('No automation rules')}</div>`;
    bindCommon(); $$('[data-edit-template]').forEach(x=>x.onclick=()=>openTemplate(x.dataset.editTemplate)); $$('[data-edit-auto]').forEach(x=>x.onclick=()=>openAutomation(x.dataset.editAuto));
  }

  function renderReports() {
    setHeader('Reports','PERFORMANCE');
    const bookings=state.bookings||[]; const payments=state.payments||[]; const totalBooked=bookings.reduce((s,b)=>s+Number(b.total||0),0); const received=payments.reduce((s,p)=>s+Number(p.amount||0),0); const avg=bookings.length?totalBooked/bookings.length:0;
    const sources={}; (state.enquiries||[]).forEach(e=>sources[e.source||'Unknown']=(sources[e.source||'Unknown']||0)+1);
    const serviceTotals={}; bookings.forEach(b=>serviceTotals[b.serviceName||'Other']=(serviceTotals[b.serviceName||'Other']||0)+Number(b.total||0));
    view.innerHTML=`<div class="grid cols-4">${stat('Booked value',money(totalBooked),`${bookings.length} bookings`)}${stat('Cash received',money(received),`${payments.length} payments`)}${stat('Average booking',money(avg),'Average gross booking value')}${stat('Conversion',conversionRate()+'%',`${(state.enquiries||[]).filter(x=>x.status==='Converted').length} converted enquiries`)}</div><div class="grid cols-2 section"><div class="card panel"><div class="section-head"><div><h2>Revenue by service</h2><p>Based on current booking values</p></div></div>${barReport(serviceTotals,true)}</div><div class="card panel"><div class="section-head"><div><h2>Enquiry sources</h2><p>Where leads are coming from</p></div></div>${barReport(sources,false)}</div></div>`;
  }
  function conversionRate(){ const enq=state.enquiries||[]; return enq.length?Math.round(enq.filter(x=>x.status==='Converted').length/enq.length*100):0; }
  function barReport(obj,isMoney){ const entries=Object.entries(obj).sort((a,b)=>b[1]-a[1]); const max=Math.max(1,...entries.map(x=>x[1])); return entries.length?`<div class="report-bar-wrap">${entries.map(([k,v])=>`<div class="report-row"><span>${esc(k)}</span><div class="report-bar"><div style="width:${Math.max(3,v/max*100)}%"></div></div><b>${isMoney?money(v):v}</b></div>`).join('')}</div>`:empty('Not enough data yet'); }

  function renderCalendar() {
    setHeader('Calendar','AVAILABILITY');
    const y=calendarCursor.getFullYear(), m=calendarCursor.getMonth(); const first=new Date(y,m,1), last=new Date(y,m+1,0); const start=new Date(y,m,1-first.getDay()); const cells=[];
    for(let i=0;i<42;i++){const d=new Date(start);d.setDate(start.getDate()+i);const ds=[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-'); const ev=(state.bookings||[]).filter(b=>b.eventDate===ds&&b.status!=='Cancelled'); cells.push(`<div class="calendar-cell ${d.getMonth()!==m?'outside':''}"><div class="calendar-date">${d.getDate()}</div>${ev.slice(0,3).map(b=>`<div class="cal-event" title="${esc(b.title)}">${esc(b.startTime||'')} ${esc(b.title)}</div>`).join('')}${ev.length>3?`<div class="cell-sub">+${ev.length-3} more</div>`:''}</div>`)}
    view.innerHTML=`<div class="calendar-head"><div><div class="calendar-title">${new Intl.DateTimeFormat('en-GB',{month:'long',year:'numeric'}).format(first)}</div><div class="cell-sub">Booked and held dates from your booking records</div></div><div><button class="soft-btn" id="prevMonth">←</button> <button class="soft-btn" id="todayMonth">Today</button> <button class="soft-btn" id="nextMonth">→</button></div></div><div class="calendar-grid">${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(x=>`<div class="calendar-dayname">${x}</div>`).join('')}${cells.join('')}</div>`;
    $('#prevMonth').onclick=()=>{calendarCursor=new Date(y,m-1,1);renderCalendar()}; $('#nextMonth').onclick=()=>{calendarCursor=new Date(y,m+1,1);renderCalendar()}; $('#todayMonth').onclick=()=>{calendarCursor=new Date();renderCalendar()};
  }

  function renderSettings() {
    setHeader('Settings','WHITE-LABEL & BUSINESS'); const s=state.settings||{};
    view.innerHTML=`<div class="grid cols-2"><div class="card panel"><div class="section-head"><div><h2>Branding</h2><p>Make the CRM and public pages yours</p></div></div><div class="settings-brand-row"><div class="settings-logo" id="settingsLogo">${s.logoUrl?`<img src="${esc(s.logoUrl)}">`:'No logo'}</div><div><input type="file" id="logoFile" accept="image/png,image/jpeg,image/webp,image/svg+xml"><div class="helper">PNG, JPG, WebP or SVG. In static mode the logo is stored in this browser.</div></div></div><div class="form-grid"><div class="field full"><label>BUSINESS NAME</label><input id="setBusinessName" value="${esc(s.businessName||'')}"></div><div class="field"><label>ACCENT COLOUR</label><input class="color-input" id="setAccent" type="color" value="${esc(s.accent||'#6d5dfc')}"></div><div class="field"><label>CURRENCY</label><select id="setCurrency">${['GBP','EUR','USD','AUD'].map(x=>`<option ${s.currency===x?'selected':''}>${x}</option>`).join('')}</select></div></div></div><div class="card panel"><div class="section-head"><div><h2>Contact & invoice details</h2><p>Used on client-facing documents</p></div></div><div class="form-grid"><div class="field"><label>EMAIL</label><input id="setEmail" value="${esc(s.businessEmail||'')}"></div><div class="field"><label>PHONE</label><input id="setPhone" value="${esc(s.businessPhone||'')}"></div><div class="field full"><label>ADDRESS</label><textarea id="setAddress">${esc(s.businessAddress||'')}</textarea></div><div class="field"><label>VAT NUMBER</label><input id="setVat" value="${esc(s.vatNumber||'')}"></div><div class="field"><label>INVOICE PREFIX</label><input id="setPrefix" value="${esc(s.invoicePrefix||'INV-')}"></div><div class="field"><label>DEFAULT DEPOSIT %</label><input id="setDeposit" type="number" min="0" max="100" value="${esc(s.defaultDepositPercent||25)}"></div><div class="field"><label>PAYMENT TERMS (DAYS)</label><input id="setTermsDays" type="number" min="0" value="${esc(s.paymentTermsDays||14)}"></div></div></div></div><div class="card panel section"><div class="section-head"><div><h2>Address lookup</h2><p>As-you-type customer address search powered by Ideal Postcodes</p></div></div><div class="form-grid"><div class="field full"><label>IDEAL POSTCODES API KEY</label><input id="setAddressFinderApiKey" value="${esc(s.addressFinderApiKey||'ak_test')}" placeholder="ak_…"><div class="helper"><b>ak_test</b> works for a few test lookups. For live use, create your own key and restrict its Allowed URLs to your deployed domain. <a href="https://ideal-postcodes.co.uk/signup" target="_blank" rel="noopener">Get a free trial key ↗</a></div></div></div></div><div class="card panel section"><div class="section-head"><div><h2>Client-facing wording</h2><p>Defaults used by the public enquiry form and contracts</p></div></div><div class="form-grid"><div class="field full"><label>ENQUIRY THANK-YOU MESSAGE</label><textarea id="setThankYou">${esc(s.enquiryThankYou||'')}</textarea></div><div class="field full"><label>BOOKING TERMS</label><textarea id="setTerms">${esc(s.terms||'')}</textarea></div></div><div style="margin-top:14px;text-align:right"><button class="primary-btn" id="saveSettings">Save settings</button></div></div><div class="card panel section"><div class="section-head"><div><h2>Data & deployment</h2><p>Useful while testing the static GitHub version</p></div></div><div class="notice">${mode==='api'?'You are connected to the Node backend. Changes are written to <b>data/db.json</b> on the server.':'You are in static demo mode. Changes are stored in your browser using localStorage, so GitHub Pages works without a backend.'}</div><div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap"><button class="soft-btn" id="exportData">Export JSON backup</button><button class="soft-btn" id="resetDemo">Reset demo data</button></div></div>`;
    $('#saveSettings').onclick=saveSettings; $('#logoFile').onchange=uploadLogo; $('#exportData').onclick=exportData; $('#resetDemo').onclick=resetDemo;
  }

  function listPage(title,desc,buttonText,action,headers,rows,nested=false){return `${nested?'':'<div class="card table-card">'}<div class="table-toolbar"><div><b>${esc(title)}</b><div class="cell-sub">${esc(desc)}</div></div><div style="display:flex;gap:8px"><input class="search-input" data-table-search placeholder="Search…"><button class="primary-btn" data-action="${action}">＋ ${esc(buttonText)}</button></div></div>${rows.length?table(headers,rows):empty(`No ${title.toLowerCase()} yet`)}${nested?'':'</div>'}`}
  function bindListSearch(){ const input=$('[data-table-search]'); if(!input)return; input.oninput=()=>{const q=input.value.toLowerCase().trim(); $$('tbody tr').forEach(r=>r.style.display=(!q||(r.dataset.search||r.textContent.toLowerCase()).includes(q))?'':'none')}; }
  function bindCommon(){ $$('[data-go]').forEach(x=>x.onclick=()=>go(x.dataset.go)); $$('[data-action]').forEach(x=>x.onclick=()=>openAction(x.dataset.action)); }
  function go(r){ route=r; location.hash=r; render(); $('.sidebar').classList.remove('open'); }
  function openAction(a){ ({enquiry:()=>openEnquiry(),booking:()=>openBooking(),customer:()=>openCustomer(),invoice:()=>openInvoiceCreate(),payment:()=>openPayment(),service:()=>openService(),performer:()=>openPerformer(),template:()=>openTemplate(),automation:()=>openAutomation()})[a]?.(); }

  function openModal(title,eyebrow,body,saveText='Save',onSave=null,extraButtons=''){
    $('#modalTitle').textContent=title; $('#modalEyebrow').textContent=eyebrow; modalBody.innerHTML=body; modalFooter.innerHTML=`${extraButtons}<button type="button" class="soft-btn" id="cancelModal">Cancel</button>${onSave?`<button type="button" class="primary-btn" id="saveModal">${esc(saveText)}</button>`:''}`; $('#cancelModal').onclick=()=>modal.close(); if(onSave)$('#saveModal').onclick=onSave; modal.showModal();
  }
  const val=id=>$(id)?.value?.trim?.() ?? $(id)?.value;

  function openEnquiry(id=null){const e=id?(state.enquiries||[]).find(x=>x.id===id):{};openModal(id?'Edit enquiry':'New enquiry','LEAD',`<div class="form-grid"><div class="field"><label>NAME</label><input id="fName" value="${esc(e.name||'')}"></div><div class="field"><label>EMAIL</label><input id="fEmail" type="email" value="${esc(e.email||'')}"></div><div class="field"><label>PHONE</label><input id="fPhone" value="${esc(e.phone||'')}"></div><div class="field"><label>STATUS</label><select id="fStatus">${['New','Contacted','Quoted','Converted','Closed'].map(x=>`<option ${e.status===x?'selected':''}>${x}</option>`).join('')}</select></div><div class="field"><label>EVENT DATE</label><input id="fDate" type="date" value="${esc(e.eventDate||'')}"></div><div class="field"><label>EVENT TYPE</label><input id="fType" value="${esc(e.eventType||'')}"></div><div class="field"><label>VENUE</label><input id="fVenue" value="${esc(e.venue||'')}"></div><div class="field"><label>SERVICE</label><select id="fService"><option value="">Choose…</option>${(state.services||[]).map(s=>`<option ${e.service===s.name?'selected':''}>${esc(s.name)}</option>`).join('')}</select></div><div class="field"><label>BUDGET</label><input id="fBudget" type="number" step="0.01" value="${esc(e.budget||'')}"></div><div class="field"><label>SOURCE</label><input id="fSource" value="${esc(e.source||'Website')}"></div><div class="field full"><label>NOTES</label><textarea id="fNotes">${esc(e.notes||'')}</textarea></div></div>`,'Save',async()=>{const data={name:val('#fName'),email:val('#fEmail'),phone:val('#fPhone'),status:val('#fStatus'),eventDate:val('#fDate'),eventType:val('#fType'),venue:val('#fVenue'),service:val('#fService'),budget:Number(val('#fBudget')||0),source:val('#fSource'),notes:val('#fNotes')}; if(!data.name||!data.email)return toast('Name and email are required'); id?await updateRecord('enquiries',id,data):await createRecord('enquiries',data); modal.close(); toast('Enquiry saved'); render();},id?`<button type="button" class="danger-btn" id="deleteEnquiry">Delete</button>`:'');if(id)$('#deleteEnquiry').onclick=async()=>{if(await deleteRecord('enquiries',id)){modal.close();render()}}}

  async function convertEnquiry(id){const e=(state.enquiries||[]).find(x=>x.id===id);if(!e)return; if(mode==='api'){await api(`/api/enquiries/${id}/convert`,{method:'POST',body:JSON.stringify({})});await refresh();toast('Enquiry converted to booking');go('bookings');return;} let c=(state.customers||[]).find(x=>String(x.email).toLowerCase()===String(e.email).toLowerCase());if(!c){const parts=String(e.name||'').trim().split(/\s+/);c={id:uid('cus'),createdAt:isoNow(),name:e.name,company:'',title:'',firstName:parts.shift()||'',surname:parts.join(' '),jobTitle:'',telephone:'',mobile:e.phone||'',email:e.email,website:'',notes:e.notes};state.customers.unshift(c)}const svc=(state.services||[]).find(s=>s.name===e.service);const total=Number(e.budget||svc?.price||0), pct=Number(svc?.depositPercent||state.settings.defaultDepositPercent||25);const b={id:uid('book'),createdAt:isoNow(),customerId:c.id,customerName:c.name,title:`${e.eventType||'Event'} - ${e.name}`,eventType:e.eventType,eventDate:e.eventDate,startTime:'',endTime:'',venue:e.venue,serviceId:svc?.id||'',serviceName:e.service,status:'Date Held',contractStatus:'Draft',total,deposit:total*pct/100,balance:total*(100-pct)/100,notes:e.notes,assignedPerformerIds:[]};state.bookings.unshift(b);e.status='Converted';e.convertedBookingId=b.id;addActivity('booking',`Enquiry converted to booking: ${b.title}`);saveLocal();toast('Enquiry converted to booking');go('bookings')}

  function openCustomer(id=null){
    const c=id?(state.customers||[]).find(x=>x.id===id):{};
    const legacyName=String(c.name||'').trim().split(/\s+/);
    const first=c.firstName ?? (legacyName.shift()||'');
    const surname=c.surname ?? legacyName.join(' ');
    openModal(id?'Edit customer':'New customer','CLIENT',`<div class="form-grid">
      <div class="field full"><label>COMPANY</label><input id="cCompany" value="${esc(c.company||'')}"></div>
      <div class="field"><label>TITLE</label><input id="cTitle" value="${esc(c.title||'')}" placeholder="Mr, Mrs, Miss, Ms, Dr…"></div>
      <div class="field"><label>FIRST NAME</label><input id="cFirstName" value="${esc(first)}"></div>
      <div class="field"><label>SURNAME</label><input id="cSurname" value="${esc(surname)}"></div>
      <div class="field"><label>JOB TITLE</label><input id="cJobTitle" value="${esc(c.jobTitle||'')}"></div>
      <div class="field"><label>TELEPHONE</label><input id="cTelephone" type="tel" value="${esc(c.telephone||c.phone||'')}"></div>
      <div class="field"><label>MOBILE</label><input id="cMobile" type="tel" value="${esc(c.mobile||'')}"></div>
      <div class="field"><label>EMAIL</label><input id="cEmail" type="email" value="${esc(c.email||'')}"></div>
      <div class="field"><label>WEBSITE</label><input id="cWebsite" type="url" value="${esc(c.website||'')}" placeholder="https://"></div>
      <div class="field full"><label>NOTES</label><textarea id="cNotes">${esc(c.notes||'')}</textarea></div>

      <div class="form-section full">
        <div class="form-section-title"><strong>Main Address</strong></div>
      </div>
      <div class="field full"><label>QUICK SEARCH</label><input id="cAddressQuickSearch" value="${esc(c.addressQuickSearch||'')}" placeholder="Start typing a house number, street or postcode…" autocomplete="off"><div class="helper" id="addressLookupStatus">Start typing and choose an address from the suggestions. The fields below will fill automatically.</div></div>
      <div class="field full"><label>STREET 1</label><input id="cStreet1" value="${esc(c.street1||'')}"></div>
      <div class="field full"><label>STREET 2</label><input id="cStreet2" value="${esc(c.street2||'')}"></div>
      <div class="field"><label>TOWN</label><input id="cTown" value="${esc(c.town||'')}"></div>
      <div class="field"><label>COUNTY</label><input id="cCounty" value="${esc(c.county||'')}"></div>
      <div class="field"><label>POSTCODE</label><input id="cPostcode" value="${esc(c.postcode||'')}"></div>
      <div class="field"><label>COUNTRY</label><input id="cCountry" value="${esc(c.country||'United Kingdom')}"></div>
    </div>`,'Save',async()=>{
      const data={company:val('#cCompany'),title:val('#cTitle'),firstName:val('#cFirstName'),surname:val('#cSurname'),jobTitle:val('#cJobTitle'),telephone:val('#cTelephone'),mobile:val('#cMobile'),email:val('#cEmail'),website:val('#cWebsite'),notes:val('#cNotes'),addressQuickSearch:val('#cAddressQuickSearch'),street1:val('#cStreet1'),street2:val('#cStreet2'),town:val('#cTown'),county:val('#cCounty'),postcode:val('#cPostcode'),country:val('#cCountry')};
      data.name=[data.firstName,data.surname].filter(Boolean).join(' ').trim() || data.company;
      data.phone=data.mobile||data.telephone;
      if(!data.firstName && !data.surname && !data.company)return toast('Enter a customer name or company');
      id?await updateRecord('customers',id,data):await createRecord('customers',data);
      modal.close();toast('Customer saved');render();
    },id?`<button type="button" class="danger-btn" id="deleteCustomer">Delete</button>`:'');
    if(id)$('#deleteCustomer').onclick=async()=>{if(await deleteRecord('customers',id)){modal.close();render()}};
    initCustomerAddressFinder();
  }

  function initCustomerAddressFinder(){
    const input=$('#cAddressQuickSearch');
    if(!input)return;
    const status=$('#addressLookupStatus');
    const key=state.settings?.addressFinderApiKey||'ak_test';
    if(!window.IdealPostcodes?.AddressFinder){
      if(status)status.innerHTML='Address lookup could not load. You can still enter the address manually.';
      return;
    }
    try{
      window.IdealPostcodes.AddressFinder.setup({
        apiKey:key,
        inputField:'#cAddressQuickSearch',
        detectCountry:false,
        defaultCountry:'GBR',
        restrictCountries:['GBR'],
        hideToolbar:true,
        outputFields:{
          line_1:'#cStreet1',
          line_2:'#cStreet2',
          post_town:'#cTown',
          county:'#cCounty',
          postcode:'#cPostcode',
          country:'#cCountry'
        },
        onAddressRetrieved:(address)=>{
          $('#cStreet1').value=address.line_1||'';
          $('#cStreet2').value=[address.line_2,address.line_3].filter(Boolean).join(', ');
          $('#cTown').value=address.post_town||'';
          $('#cCounty').value=address.county||'';
          $('#cPostcode').value=address.postcode||'';
          $('#cCountry').value=address.country||'United Kingdom';
          input.value=[address.line_1,address.line_2,address.line_3,address.post_town,address.postcode].filter(Boolean).join(', ');
          if(status)status.innerHTML='<b>Address found.</b> Check the details below and edit them if needed.';
        },
        onLoaded:()=>{if(status)status.textContent='Start typing and choose an address from the suggestions. The fields below will fill automatically.';},
        onFailedCheck:()=>{if(status)status.innerHTML='Address lookup key is not valid or has no credits. Add your Ideal Postcodes API key in <b>Settings → Address lookup</b>, or enter the address manually.';},
        onSearchError:(err)=>{if(status)status.textContent=err?.message||'Address lookup failed. Please enter the address manually.';},
        onSuggestionError:(err)=>{if(status)status.textContent=err?.message||'Address suggestions are temporarily unavailable. You can enter the address manually.';}
      });
    }catch(err){
      if(status)status.textContent='Address lookup could not start. You can enter the address manually.';
      console.warn('Address Finder:',err);
    }
  }

  function openBooking(id=null){
    const b=id?(state.bookings||[]).find(x=>x.id===id):{};
    const entertainmentId=b.entertainmentId||b.serviceId||'';
    const entertainmentName=b.entertainment||b.serviceName||'';
    const fee=Number(b.fee ?? b.total ?? 0);
    const otherServicesTotal=Number(b.otherServicesTotal||0);
    const grandTotal=Number(b.grandTotal ?? b.total ?? (fee+otherServicesTotal));
    const finishTime=b.finishTime ?? b.endTime ?? '';
    const noFinishTime=Boolean(b.noFinishTime);
    const eventContact=b.eventContact||b.customerName||'';
    const venueName=b.venueName||b.venue||'';

    openModal(id?'Manage booking':'New booking','EVENT',`<div class="form-grid booking-form">
      <div class="field"><label>DATE</label><input id="bDate" type="date" value="${esc(b.eventDate||'')}"></div>
      <div class="field"><label>EVENT TITLE</label><input id="bTitle" value="${esc(b.title||'')}"></div>
      <div class="field full"><label>ENTERTAINMENT</label><select id="bEntertainment"><option value="">Choose…</option>${(state.services||[]).map(s=>`<option value="${s.id}" ${entertainmentId===s.id||(!entertainmentId&&entertainmentName===s.name)?'selected':''}>${esc(s.name)}</option>`).join('')}</select></div>

      <div class="form-section full"><div class="form-section-title"><strong>VENUE DETAILS</strong></div></div>
      <div class="field full"><label>ADDRESS QUICK SEARCH</label><input id="bVenueQuickSearch" value="${esc(b.venueQuickSearch||'')}" placeholder="Start typing a venue, address or postcode…" autocomplete="off"><div class="helper" id="bookingAddressLookupStatus">Start typing and choose an address from the suggestions.</div></div>
      <div class="field full"><label>VENUE NAME</label><input id="bVenueName" value="${esc(venueName)}"></div>
      <div class="field full"><label>VENUE ADDRESS</label><textarea id="bVenueAddress">${esc(b.venueAddress||'')}</textarea></div>
      <div class="field"><label>VENUE POSTCODE</label><input id="bVenuePostcode" value="${esc(b.venuePostcode||'')}"></div>
      <div class="field"><label>VENUE TELEPHONE</label><input id="bVenueTelephone" type="tel" value="${esc(b.venueTelephone||'')}"></div>
      <div class="field full"><label>VENUE NOTES</label><textarea id="bVenueNotes">${esc(b.venueNotes||b.notes||'')}</textarea></div>

      <div class="form-section full"><div class="form-section-title"><strong>TIMINGS</strong> <span class="helper">(enter in HH:mm format)</span></div></div>
      <div class="field"><label>ARRIVAL TIME</label><input id="bArrivalTime" type="time" value="${esc(b.arrivalTime||'')}"></div>
      <div class="field"><label>START TIME</label><input id="bStartTime" type="time" value="${esc(b.startTime||'')}"></div>
      <div class="field"><label>FINISH TIME</label><input id="bFinishTime" type="time" value="${esc(finishTime)}" ${noFinishTime?'disabled':''}></div>
      <div class="field"><label>&nbsp;</label><label class="toggle"><input id="bNoFinishTime" type="checkbox" ${noFinishTime?'checked':''}> No Finish Time</label></div>
      <div class="field full"><label class="toggle"><input id="bShiftTimeZone" type="checkbox" ${b.shiftTimeZone?'checked':''}> Shift Time Zone</label></div>

      <div class="form-section full"><div class="form-section-title"><strong>OTHER INFORMATION</strong></div></div>
      <div class="field"><label>EVENT CONTACT</label><input id="bEventContact" list="bookingCustomerNames" value="${esc(eventContact)}"><datalist id="bookingCustomerNames">${(state.customers||[]).map(c=>`<option value="${esc(customerDisplayName(c))}"></option>`).join('')}</datalist></div>
      <div class="field"><label>TELEPHONE</label><input id="bEventTelephone" type="tel" value="${esc(b.eventTelephone||'')}"></div>
      <div class="field"><label>DRESS CODE</label><input id="bDressCode" value="${esc(b.dressCode||'')}"></div>
      <div class="field"><label>NO. OF GUESTS</label><input id="bGuestCount" type="number" min="0" step="1" value="${esc(b.guestCount??'')}"></div>

      <div class="form-section full"><div class="form-section-title"><strong>FEES</strong></div></div>
      <div class="field"><label>FEE</label><input id="bFee" type="number" min="0" step="0.01" value="${esc(fee||'')}"></div>
      <div class="field"><label>OTHER SERVICES TOTAL</label><input id="bOtherServicesTotal" type="number" min="0" step="0.01" value="${esc(otherServicesTotal)}" readonly><div class="helper">Calculated from additional services when added.</div></div>
      <div class="field"><label>GRAND TOTAL</label><input id="bGrandTotal" type="number" step="0.01" value="${esc(grandTotal)}" readonly></div>
      <div class="field"><label>DEPOSIT</label><input id="bDeposit" type="number" min="0" step="0.01" value="${esc(b.deposit||'')}"></div>
      <div class="field full"><label>PAYMENT INSTRUCTIONS</label><textarea id="bPaymentInstructions" placeholder="e.g. Bank transfer details, payment schedule or client instructions…">${esc(b.paymentInstructions||'')}</textarea></div>
      ${id?`
        <div class="form-section full"><div class="form-section-title"><strong>BOOKING MANAGEMENT</strong></div></div>
        <div class="field"><label>STATUS</label><select id="bStatus">${['Enquiry','Date Held','Contract Issued','Confirmed','Completed','Cancelled'].map(x=>`<option ${b.status===x?'selected':''}>${x}</option>`).join('')}</select></div>
        <div class="field"><label>CONTRACT STATUS</label><select id="bContractStatus">${['Draft','Sent','Accepted','Declined'].map(x=>`<option ${b.contractStatus===x?'selected':''}>${x}</option>`).join('')}</select></div>
        <div class="field full"><label>LINKED CUSTOMER</label><select id="bCustomer"><option value="">None</option>${(state.customers||[]).map(c=>`<option value="${c.id}" ${b.customerId===c.id?'selected':''}>${esc(customerDisplayName(c))}</option>`).join('')}</select></div>
        <div class="field full"><div class="notice">Client portal link: <b>client.html?booking=${esc(b.id)}</b>.</div></div>`:''}
    </div>`,'Save booking',async()=>{
      const svc=(state.services||[]).find(s=>s.id===val('#bEntertainment'));
      const eventContact=val('#bEventContact');
      const selectedCustomer=id&&$('#bCustomer')?(state.customers||[]).find(c=>c.id===val('#bCustomer')):null;
      const matchedCustomer=selectedCustomer||(state.customers||[]).find(c=>customerDisplayName(c).toLowerCase()===eventContact.toLowerCase());
      const fee=Number(val('#bFee')||0);
      const other=Number(val('#bOtherServicesTotal')||0);
      const grand=fee+other;
      const dep=Number(val('#bDeposit')||0);
      const noFinish=$('#bNoFinishTime')?.checked||false;
      const data={
        eventDate:val('#bDate'),
        title:val('#bTitle'),
        entertainmentId:svc?.id||'',
        entertainment:svc?.name||'',
        serviceId:svc?.id||'',
        serviceName:svc?.name||'',
        venueQuickSearch:val('#bVenueQuickSearch'),
        venueName:val('#bVenueName'),
        venueAddress:val('#bVenueAddress'),
        venuePostcode:val('#bVenuePostcode'),
        venueTelephone:val('#bVenueTelephone'),
        venueNotes:val('#bVenueNotes'),
        venue:val('#bVenueName'),
        arrivalTime:val('#bArrivalTime'),
        startTime:val('#bStartTime'),
        finishTime:noFinish?'':val('#bFinishTime'),
        endTime:noFinish?'':val('#bFinishTime'),
        noFinishTime:noFinish,
        shiftTimeZone:$('#bShiftTimeZone')?.checked||false,
        eventContact,
        eventTelephone:val('#bEventTelephone'),
        dressCode:val('#bDressCode'),
        guestCount:Number(val('#bGuestCount')||0),
        fee,
        otherServicesTotal:other,
        grandTotal:grand,
        total:grand,
        deposit:dep,
        balance:Math.max(0,grand-dep),
        paymentInstructions:val('#bPaymentInstructions'),
        customerId:matchedCustomer?.id||b.customerId||'',
        customerName:matchedCustomer?customerDisplayName(matchedCustomer):(b.customerName||eventContact),
        status:id&&$('#bStatus')?val('#bStatus'):(b.status||'Date Held'),
        contractStatus:id&&$('#bContractStatus')?val('#bContractStatus'):(b.contractStatus||'Draft'),
        assignedPerformerIds:b.assignedPerformerIds||[],
        notes:val('#bVenueNotes')
      };
      if(!data.eventDate||!data.title)return toast('Date and Event Title are required');
      id?await updateRecord('bookings',id,data):await createRecord('bookings',data);
      modal.close();toast('Booking saved');render();
    },id?`<button type="button" class="danger-btn" id="deleteBooking">Delete</button><button type="button" class="outline-btn" id="createInvoiceFromBooking">Create invoice</button>`:'');

    const entertainment=$('#bEntertainment');
    const feeInput=$('#bFee');
    const otherInput=$('#bOtherServicesTotal');
    const grandInput=$('#bGrandTotal');
    const depositInput=$('#bDeposit');
    const recalc=()=>{const total=Number(feeInput?.value||0)+Number(otherInput?.value||0);if(grandInput)grandInput.value=total.toFixed(2)};
    if(entertainment)entertainment.onchange=()=>{const s=(state.services||[]).find(x=>x.id===entertainment.value);if(s){feeInput.value=Number(s.price||0).toFixed(2);const pct=Number(s.depositPercent??state.settings.defaultDepositPercent??25);depositInput.value=(Number(s.price||0)*pct/100).toFixed(2);recalc()}};
    if(feeInput)feeInput.oninput=recalc;
    const noFinish=$('#bNoFinishTime');
    if(noFinish)noFinish.onchange=()=>{const finish=$('#bFinishTime');finish.disabled=noFinish.checked;if(noFinish.checked)finish.value=''};
    if(id){
      $('#deleteBooking').onclick=async()=>{if(await deleteRecord('bookings',id)){modal.close();render()}};
      $('#createInvoiceFromBooking').onclick=()=>{modal.close();openInvoiceCreate(id)};
    }
    initBookingAddressFinder();
    recalc();
  }

  function initBookingAddressFinder(){
    const input=$('#bVenueQuickSearch');
    if(!input)return;
    const status=$('#bookingAddressLookupStatus');
    const key=state.settings?.addressFinderApiKey||'ak_test';
    if(!window.IdealPostcodes?.AddressFinder){
      if(status)status.textContent='Address lookup could not load. You can still enter the venue manually.';
      return;
    }
    try{
      window.IdealPostcodes.AddressFinder.setup({
        apiKey:key,
        inputField:'#bVenueQuickSearch',
        detectCountry:false,
        defaultCountry:'GBR',
        restrictCountries:['GBR'],
        hideToolbar:true,
        outputFields:{postcode:'#bVenuePostcode'},
        onAddressRetrieved:(address)=>{
          const venueName=address.organisation_name||address.building_name||'';
          const lines=[address.line_1,address.line_2,address.line_3,address.post_town,address.county,address.country].filter(Boolean);
          if(venueName&&!$('#bVenueName').value)$('#bVenueName').value=venueName;
          $('#bVenueAddress').value=lines.join('\n');
          $('#bVenuePostcode').value=address.postcode||'';
          input.value=[venueName,address.line_1,address.post_town,address.postcode].filter(Boolean).join(', ');
          if(status)status.innerHTML='<b>Venue address found.</b> Check the venue name and address before saving.';
        },
        onLoaded:()=>{if(status)status.textContent='Start typing a venue, address or postcode and choose a result.';},
        onFailedCheck:()=>{if(status)status.innerHTML='Address lookup key is not valid or has no credits. Add your Ideal Postcodes API key in <b>Settings → Address lookup</b>, or enter the venue manually.';},
        onSearchError:(err)=>{if(status)status.textContent=err?.message||'Venue address lookup failed. Please enter it manually.';},
        onSuggestionError:(err)=>{if(status)status.textContent=err?.message||'Address suggestions are temporarily unavailable.';}
      });
    }catch(err){
      if(status)status.textContent='Venue address lookup could not start. You can enter the venue manually.';
      console.warn('Booking Address Finder:',err);
    }
  }

  function openInvoiceCreate(bookingId=''){const b=(state.bookings||[]).find(x=>x.id===bookingId);openModal('Create invoice','BILLING',`<div class="form-grid"><div class="field full"><label>BOOKING</label><select id="iBooking"><option value="">Choose…</option>${(state.bookings||[]).map(x=>`<option value="${x.id}" ${bookingId===x.id?'selected':''}>${esc(x.title)} — ${esc(x.customerName)}</option>`).join('')}</select></div><div class="field"><label>TYPE</label><select id="iType"><option>Deposit</option><option ${b?'selected':''}>Balance</option><option>Custom</option></select></div><div class="field"><label>AMOUNT</label><input id="iAmount" type="number" step="0.01" value="${esc(b?.balance||'')}"></div><div class="field full"><label>DESCRIPTION</label><input id="iDescription" value="${esc(b?`Balance - ${b.title}`:'')}"></div></div>`,'Create invoice',async()=>{const bid=val('#iBooking'),booking=(state.bookings||[]).find(x=>x.id===bid);if(!booking)return toast('Choose a booking');const type=val('#iType'),amount=Number(val('#iAmount')||0);if(mode==='api'){await api(`/api/bookings/${bid}/invoice`,{method:'POST',body:JSON.stringify({type,amount,description:val('#iDescription')})});await refresh()}else{const n=`${state.settings.invoicePrefix||'INV-'}${state.settings.nextInvoiceNumber||1}`;state.settings.nextInvoiceNumber=Number(state.settings.nextInvoiceNumber||1)+1;const due=new Date();due.setDate(due.getDate()+Number(state.settings.paymentTermsDays||14));state.invoices.unshift({id:uid('inv'),createdAt:isoNow(),number:n,bookingId:bid,customerId:booking.customerId,customerName:booking.customerName,type,issueDate:ymd(),dueDate:ymd(due),amount,status:'Draft',paidAt:null,description:val('#iDescription')||`${type} - ${booking.title}`});addActivity('invoice',`Invoice ${n} created`);saveLocal()}modal.close();toast('Invoice created');go('invoices')});const select=$('#iBooking'),type=$('#iType');const autoAmount=()=>{const bb=(state.bookings||[]).find(x=>x.id===select.value);if(bb){$('#iAmount').value=type.value==='Deposit'?bb.deposit:bb.balance;$('#iDescription').value=`${type.value} - ${bb.title}`}};select.onchange=autoAmount;type.onchange=autoAmount}

  function openInvoice(id){const i=(state.invoices||[]).find(x=>x.id===id);if(!i)return;const b=(state.bookings||[]).find(x=>x.id===i.bookingId);const c=(state.customers||[]).find(x=>x.id===i.customerId);openModal(i.number,'INVOICE',`<div id="invoicePrint"><div style="display:flex;justify-content:space-between;gap:20px;align-items:flex-start"><div>${state.settings.logoUrl?`<img src="${esc(state.settings.logoUrl)}" style="max-width:120px;max-height:70px;object-fit:contain">`:`<h2 style="margin:0">${esc(state.settings.businessName)}</h2>`}<div class="cell-sub" style="white-space:pre-line;margin-top:6px">${esc(state.settings.businessAddress||'')}<br>${esc(state.settings.businessEmail||'')} ${esc(state.settings.businessPhone||'')}</div></div><div style="text-align:right"><div class="eyebrow">INVOICE</div><h2 style="margin:4px 0">${esc(i.number)}</h2>${badge(i.status)}</div></div><hr style="border:0;border-top:1px solid var(--line);margin:22px 0"><div class="grid cols-2"><div><div class="eyebrow">BILL TO</div><b>${esc(i.customerName)}</b><div class="cell-sub">${esc(c?.email||'')}</div></div><div style="text-align:right"><div>Issued: <b>${dateFmt(i.issueDate)}</b></div><div>Due: <b>${dateFmt(i.dueDate)}</b></div></div></div><div class="card" style="margin-top:22px;overflow:hidden">${table(['Description','Amount'],[`<tr><td><b>${esc(i.description||i.type)}</b><div class="cell-sub">${esc(b?.eventDate?`${dateFmt(b.eventDate)} · ${b.venue||''}`:'')}</div></td><td class="money">${money(i.amount)}</td></tr>`])}</div><div style="display:flex;justify-content:flex-end;margin-top:18px"><div style="width:260px"><div style="display:flex;justify-content:space-between;padding:8px 0"><span>Total</span><b>${money(i.amount)}</b></div><div style="display:flex;justify-content:space-between;padding:8px 0;border-top:2px solid var(--ink);font-size:18px"><span>Amount due</span><b>${i.status==='Paid'?money(0):money(i.amount)}</b></div></div></div>${state.settings.vatNumber?`<div class="cell-sub">VAT: ${esc(state.settings.vatNumber)}</div>`:''}</div>`,'',null,`<button type="button" class="outline-btn" id="printInvoice">Print / Save PDF</button>${i.status!=='Paid'?`<button type="button" class="primary-btn" id="payInvoice">Mark paid</button>`:''}`);$('#printInvoice').onclick=()=>{const html=$('#invoicePrint').innerHTML;const w=window.open('','_blank');w.document.write(`<html><head><title>${esc(i.number)}</title><link rel="stylesheet" href="assets/styles.css"></head><body style="padding:40px;max-width:900px;margin:auto">${html}<script>setTimeout(()=>print(),400)<\/script></body></html>`);w.document.close()};if(i.status!=='Paid')$('#payInvoice').onclick=()=>markPaid(id)}

  function markPaid(id){const i=(state.invoices||[]).find(x=>x.id===id);if(!i)return;openModal(`Record payment · ${i.number}`,'PAYMENT',`<div class="form-grid"><div class="field"><label>AMOUNT</label><input id="pAmount" type="number" step="0.01" value="${i.amount}"></div><div class="field"><label>DATE</label><input id="pDate" type="date" value="${ymd()}"></div><div class="field"><label>METHOD</label><select id="pMethod"><option>Bank transfer</option><option>Card</option><option>Cash</option><option>PayPal</option><option>Other</option></select></div><div class="field"><label>REFERENCE</label><input id="pRef"></div></div>`,'Mark paid',async()=>{const payload={amount:Number(val('#pAmount')||0),date:val('#pDate'),method:val('#pMethod'),reference:val('#pRef')};if(mode==='api'){await api(`/api/invoices/${id}/mark-paid`,{method:'POST',body:JSON.stringify(payload)});await refresh()}else{i.status='Paid';i.paidAt=isoNow();state.payments.unshift({id:uid('pay'),createdAt:isoNow(),invoiceId:i.id,invoiceNumber:i.number,customerName:i.customerName,...payload});addActivity('payment',`${i.number} marked paid`);saveLocal()}modal.close();toast('Payment recorded');render()})}

  function openPayment(){const open=(state.invoices||[]).filter(x=>x.status!=='Paid');openModal('Record payment','PAYMENT',`<div class="form-grid"><div class="field full"><label>INVOICE</label><select id="pmInvoice"><option value="">Choose…</option>${open.map(i=>`<option value="${i.id}">${esc(i.number)} — ${esc(i.customerName)} — ${money(i.amount)}</option>`).join('')}</select></div><div class="field"><label>AMOUNT</label><input id="pmAmount" type="number" step="0.01"></div><div class="field"><label>DATE</label><input id="pmDate" type="date" value="${ymd()}"></div><div class="field"><label>METHOD</label><select id="pmMethod"><option>Bank transfer</option><option>Card</option><option>Cash</option></select></div><div class="field"><label>REFERENCE</label><input id="pmRef"></div></div>`,'Record',()=>{const inv=val('#pmInvoice');if(!inv)return toast('Choose an invoice');modal.close();markPaid(inv)});$('#pmInvoice').onchange=e=>{const i=open.find(x=>x.id===e.target.value);if(i)$('#pmAmount').value=i.amount}}

  function openService(id=null){const s=id?(state.services||[]).find(x=>x.id===id):{};openModal(id?'Edit service':'New service','CATALOGUE',`<div class="form-grid"><div class="field full"><label>NAME</label><input id="sName" value="${esc(s.name||'')}"></div><div class="field"><label>CATEGORY</label><input id="sCategory" value="${esc(s.category||'')}"></div><div class="field"><label>PRICE</label><input id="sPrice" type="number" step="0.01" value="${esc(s.price||'')}"></div><div class="field"><label>DURATION HOURS</label><input id="sDuration" type="number" step="0.5" value="${esc(s.durationHours||'')}"></div><div class="field"><label>DEPOSIT %</label><input id="sDeposit" type="number" min="0" max="100" value="${esc(s.depositPercent??state.settings.defaultDepositPercent)}"></div><div class="field"><label>ACTIVE</label><select id="sActive"><option value="true" ${s.active!==false?'selected':''}>Active</option><option value="false" ${s.active===false?'selected':''}>Inactive</option></select></div><div class="field full"><label>DESCRIPTION</label><textarea id="sDescription">${esc(s.description||'')}</textarea></div></div>`,'Save',async()=>{const data={name:val('#sName'),category:val('#sCategory'),price:Number(val('#sPrice')||0),durationHours:Number(val('#sDuration')||0),depositPercent:Number(val('#sDeposit')||0),active:val('#sActive')==='true',description:val('#sDescription')};if(!data.name)return toast('Name required');id?await updateRecord('services',id,data):await createRecord('services',data);modal.close();toast('Service saved');render()},id?`<button type="button" class="danger-btn" id="deleteService">Delete</button>`:'');if(id)$('#deleteService').onclick=async()=>{if(await deleteRecord('services',id)){modal.close();render()}}}

  function openPerformer(id=null){const p=id?(state.performers||[]).find(x=>x.id===id):{};openModal(id?'Edit team member':'Add team member','TEAM / SUPPLIER',`<div class="form-grid"><div class="field"><label>NAME</label><input id="peName" value="${esc(p.name||'')}"></div><div class="field"><label>ROLE</label><input id="peRole" value="${esc(p.role||'')}"></div><div class="field"><label>EMAIL</label><input id="peEmail" value="${esc(p.email||'')}"></div><div class="field"><label>PHONE</label><input id="pePhone" value="${esc(p.phone||'')}"></div><div class="field"><label>DEFAULT FEE</label><input id="peFee" type="number" step="0.01" value="${esc(p.defaultFee||'')}"></div><div class="field"><label>STATUS</label><select id="peActive"><option value="true" ${p.active!==false?'selected':''}>Active</option><option value="false" ${p.active===false?'selected':''}>Inactive</option></select></div><div class="field full"><label>NOTES</label><textarea id="peNotes">${esc(p.notes||'')}</textarea></div></div>`,'Save',async()=>{const data={name:val('#peName'),role:val('#peRole'),email:val('#peEmail'),phone:val('#pePhone'),defaultFee:Number(val('#peFee')||0),active:val('#peActive')==='true',notes:val('#peNotes')};if(!data.name)return toast('Name required');id?await updateRecord('performers',id,data):await createRecord('performers',data);modal.close();toast('Saved');render()},id?`<button type="button" class="danger-btn" id="deletePerformer">Delete</button>`:'');if(id)$('#deletePerformer').onclick=async()=>{if(await deleteRecord('performers',id)){modal.close();render()}}}

  function openTemplate(id=null){const t=id?(state.emailTemplates||[]).find(x=>x.id===id):{};openModal(id?'Edit email template':'New email template','EMAIL',`<div class="form-grid"><div class="field full"><label>INTERNAL NAME</label><input id="tName" value="${esc(t.name||'')}"></div><div class="field full"><label>SUBJECT</label><input id="tSubject" value="${esc(t.subject||'')}"></div><div class="field full"><label>MESSAGE</label><textarea id="tBody" style="min-height:220px">${esc(t.body||'')}</textarea><div class="helper">Merge fields: [[first]], [[eventTitle]], [[eventDate]], [[businessName]]</div></div></div>`,'Save',async()=>{const data={name:val('#tName'),subject:val('#tSubject'),body:val('#tBody')};if(!data.name)return toast('Template name required');id?await updateRecord('emailTemplates',id,data):await createRecord('emailTemplates',data);modal.close();toast('Template saved');render()},id?`<button type="button" class="danger-btn" id="deleteTemplate">Delete</button>`:'');if(id)$('#deleteTemplate').onclick=async()=>{if(await deleteRecord('emailTemplates',id)){modal.close();render()}}}

  function openAutomation(id=null){const a=id?(state.automations||[]).find(x=>x.id===id):{};openModal(id?'Edit automation':'New automation','AUTOMATION',`<div class="form-grid"><div class="field full"><label>RULE NAME</label><input id="aName" value="${esc(a.name||'')}"></div><div class="field"><label>TRIGGER</label><select id="aTrigger">${['New enquiry','Contract accepted','Invoice due','Event approaching','Event completed'].map(x=>`<option ${a.trigger===x?'selected':''}>${x}</option>`).join('')}</select></div><div class="field"><label>DELAY (DAYS)</label><input id="aDelay" type="number" min="0" value="${esc(a.delayDays||0)}"></div><div class="field full"><label>EMAIL TEMPLATE</label><select id="aTemplate">${(state.emailTemplates||[]).map(t=>`<option value="${t.id}" ${a.templateId===t.id?'selected':''}>${esc(t.name)}</option>`).join('')}</select></div><div class="field"><label>STATUS</label><select id="aActive"><option value="true" ${a.active!==false?'selected':''}>Active</option><option value="false" ${a.active===false?'selected':''}>Paused</option></select></div></div>`,'Save',async()=>{const data={name:val('#aName'),trigger:val('#aTrigger'),delayDays:Number(val('#aDelay')||0),templateId:val('#aTemplate'),active:val('#aActive')==='true'};if(!data.name)return toast('Rule name required');id?await updateRecord('automations',id,data):await createRecord('automations',data);modal.close();toast('Automation saved');render()},id?`<button type="button" class="danger-btn" id="deleteAuto">Delete</button>`:'');if(id)$('#deleteAuto').onclick=async()=>{if(await deleteRecord('automations',id)){modal.close();render()}}}

  async function saveSettings(){const data={businessName:val('#setBusinessName'),businessEmail:val('#setEmail'),businessPhone:val('#setPhone'),businessAddress:val('#setAddress'),vatNumber:val('#setVat'),currency:val('#setCurrency'),accent:val('#setAccent'),invoicePrefix:val('#setPrefix'),defaultDepositPercent:Number(val('#setDeposit')||25),paymentTermsDays:Number(val('#setTermsDays')||14),addressFinderApiKey:val('#setAddressFinderApiKey')||'ak_test',enquiryThankYou:val('#setThankYou'),terms:val('#setTerms')};if(mode==='api'){state.settings=await api('/api/settings',{method:'PUT',body:JSON.stringify(data)});await refresh()}else{Object.assign(state.settings,data);addActivity('settings','Business settings updated');saveLocal();applyBranding();render()}toast('Settings saved')}

  async function uploadLogo(ev){const file=ev.target.files?.[0];if(!file)return;if(mode==='api'){const fd=new FormData();fd.append('logo',file);const token=localStorage.getItem('eventflow_token');const res=await fetch('/api/branding/logo',{method:'POST',headers:token?{Authorization:`Bearer ${token}`}:{},body:fd});const data=await res.json();if(!res.ok)return toast(data.error||'Upload failed');state.settings.logoUrl=data.logoUrl;await refresh();toast('Logo uploaded')}else{const r=new FileReader();r.onload=()=>{state.settings.logoUrl=r.result;saveLocal();applyBranding();renderSettings();toast('Logo saved in browser')};r.readAsDataURL(file)}}
  function exportData(){const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`eventflow-backup-${ymd()}.json`;a.click();URL.revokeObjectURL(url)}
  function resetDemo(){if(!confirm('Reset the browser demo back to sample data?'))return;if(mode==='api')return toast('Reset is only available in static demo mode.');state=structuredClone(DEMO_SEED);saveLocal();applyBranding();render();toast('Demo reset')}

  function globalSearch(){openModal('Search everything','GLOBAL SEARCH',`<div class="field"><label>SEARCH</label><input id="globalQ" autofocus placeholder="Customer, booking, invoice, venue…"></div><div id="globalResults" style="margin-top:14px"></div>`,'',null);const input=$('#globalQ'),out=$('#globalResults');input.oninput=()=>{const q=input.value.toLowerCase().trim();if(!q){out.innerHTML='';return}const groups=['enquiries','customers','bookings','invoices','services','performers'];const hits=[];groups.forEach(g=>(state[g]||[]).filter(x=>JSON.stringify(x).toLowerCase().includes(q)).slice(0,4).forEach(x=>hits.push({g,x})));out.innerHTML=hits.length?`<div class="activity-list">${hits.slice(0,18).map(({g,x})=>`<div class="activity"><div class="activity-icon">${iconFor(g)}</div><div><p>${esc(x.title||x.name||x.number||human(g))}</p><small>${esc(human(g))} · ${esc(x.email||x.customerName||x.venue||'')}</small></div></div>`).join('')}</div>`:empty('No matches')};setTimeout(()=>input.focus(),50)}

  $('#nav').onclick=e=>{const b=e.target.closest('button[data-route]');if(b)go(b.dataset.route)};
  $('#quickAddBtn').onclick=()=>openBooking(); $('#globalSearchBtn').onclick=globalSearch; $('#mobileMenu').onclick=()=>$('.sidebar').classList.toggle('open'); $('#modalClose').onclick=()=>modal.close();
  window.addEventListener('hashchange',()=>{const r=location.hash.replace('#','');if(r){route=r;render()}});

  loadState().then(()=>{route=location.hash.replace('#','')||'dashboard';applyBranding();render()}).catch(err=>{console.error(err);view.innerHTML=`<div class="notice">Could not load the CRM: ${esc(err.message)}</div>`});
})();
