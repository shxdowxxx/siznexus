/* ═══════════════════════════════════════════════════════
   REPORT & BLOCK SYSTEM
═══════════════════════════════════════════════════════ */
let _reportTargetUid=null, _reportTargetName='', _reportSelectedReason=null;
function openReportModal(uid, name){
  _reportTargetUid=uid;
  _reportTargetName=name;
  _reportSelectedReason=null;
  document.getElementById('reportTargetName').textContent=name;
  document.getElementById('reportDetails').value='';
  document.getElementById('submitReportBtn').disabled=true;
  document.getElementById('submitReportBtn').style.opacity='.5';
  document.getElementById('submitReportBtn').style.cursor='not-allowed';
  // Reset reason buttons
  document.querySelectorAll('.report-reason-btn').forEach(b=>b.classList.remove('selected'));
  openModal('reportModal');
}
// Wire reason buttons
document.querySelectorAll('.report-reason-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.report-reason-btn').forEach(b=>b.classList.remove('selected'));
    btn.classList.add('selected');
    _reportSelectedReason=btn.dataset.reason;
    const submitBtn=document.getElementById('submitReportBtn');
    submitBtn.disabled=false;
    submitBtn.style.opacity='1';
    submitBtn.style.cursor='pointer';
  });
});
document.getElementById('closeReport').addEventListener('click',()=>closeModal('reportModal'));
document.getElementById('reportModal').addEventListener('click',function(e){if(e.target===this)closeModal('reportModal');});
document.getElementById('submitReportBtn').addEventListener('click',async()=>{
  if(!currentUser||!_reportTargetUid||!_reportSelectedReason)return;
  const details=document.getElementById('reportDetails').value.trim();
  const btn=document.getElementById('submitReportBtn');
  btn.disabled=true;btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> Submitting...';
  try{
    await db.collection('reports').add({
      reportedUid:_reportTargetUid,
      reportedName:_reportTargetName,
      reporterUid:currentUser.uid,
      reporterName:currentUserData?.displayName||'Unknown',
      reason:_reportSelectedReason,
      details,
      status:'pending',
      createdAt:firebase.firestore.FieldValue.serverTimestamp()
    });
    closeModal('reportModal');
    showToast('Report submitted. Our staff will review it.');
  }catch(err){
    showToast('Failed to submit report: '+err.message);
    btn.disabled=false;
    btn.innerHTML='<i class="fas fa-flag"></i> Submit Report';
  }
});
// ── BLOCK SYSTEM ──────────────────────────────────────
async function blockUser(uid, name){
  if(!currentUser||!uid)return;
  const confirmed=confirm(`Block ${name}? Their profile will be hidden from you and you won't see their messages.`);
  if(!confirmed)return;
  await db.collection('users').doc(currentUser.uid).update({
    blockedUsers:firebase.firestore.FieldValue.arrayUnion(uid)
  }).catch(e=>showToast(e.message));
  if(currentUserData){
    currentUserData.blockedUsers=[...(currentUserData.blockedUsers||[]),uid];
  }
  // Remove friend if connected
  if((currentUserData?.friends||[]).includes(uid)){
    await removeFriend(uid,name);
  }else{
    closeModal('profileModal');
  }
  showToast(`${name} has been blocked.`);
}
async function unblockUser(uid, name){
  if(!currentUser)return;
  await db.collection('users').doc(currentUser.uid).update({
    blockedUsers:firebase.firestore.FieldValue.arrayRemove(uid)
  }).catch(e=>showToast(e.message));
  if(currentUserData){
    currentUserData.blockedUsers=(currentUserData.blockedUsers||[]).filter(id=>id!==uid);
  }
  closeModal('profileModal');
  showToast(`${name} has been unblocked.`);
}
function isBlocked(uid){
  return (currentUserData?.blockedUsers||[]).includes(uid);
}
// ── ADMIN: LOAD REPORTS ───────────────────────────────
const CO_ADMIN_RANKS=['Founder','Administrator','Co-Administrator'];
function isCoAdmin(data){return(currentUser&&currentUser.uid===OWNER_UID)||data&&CO_ADMIN_RANKS.includes(data.rank);}
async function loadAdminReports(){
  const list=document.getElementById('adminReportsList');
  if(!isCoAdmin(currentUserData)){
    list.innerHTML='<p style="font-family:var(--font-mono);font-size:.75rem;color:#f55;text-align:center;padding:20px 0;"><i class="fas fa-lock" style="margin-right:6px;"></i>Co-Administrator+ access required.</p>';
    return;
  }
  list.innerHTML='<div class="loading-spinner" style="grid-column:unset;padding:20px 0;"></div>';
  try{
    const snap=await db.collection('reports').orderBy('createdAt','desc').get().catch(async()=>{
      // fallback without orderBy
      return await db.collection('reports').get();
    });
    const docs=snap.docs.sort((a,b)=>(b.data().createdAt?.toMillis?.()??0)-(a.data().createdAt?.toMillis?.()??0));
    list.innerHTML='';
    if(!docs.length){list.innerHTML='<p style="font-family:var(--font-mono);font-size:.75rem;color:var(--color-text-muted);text-align:center;padding:20px 0;">No reports submitted yet.</p>';return;}
    docs.forEach(d=>{
      const r=d.data(),rid=d.id;
      const isPending=r.status==='pending';
      const card=document.createElement('div');card.className='report-card';
      if(!isPending)card.style.opacity='.5';
      const time=r.createdAt?fmtDate(r.createdAt)+' '+fmtTime(r.createdAt):'';
      card.innerHTML=`
        <div class="report-card-header">
          <span class="report-card-reason"><i class="fas fa-flag" style="margin-right:5px;"></i>${esc(r.reason||'Unknown')}</span>
          <span style="margin-left:auto;font-family:var(--font-mono);font-size:.62rem;padding:2px 8px;border-radius:2px;background:${isPending?'rgba(255,152,0,.1)':'rgba(76,175,80,.08)'};color:${isPending?'#ff9800':'#4CAF50'};border:1px solid ${isPending?'rgba(255,152,0,.2)':'rgba(76,175,80,.2)'};">${isPending?'Pending':'Resolved'}</span>
        </div>
        <div class="report-card-meta">
          Reported: <strong style="color:var(--color-text-light);">${esc(r.reportedName||'?')}</strong>
          &nbsp;·&nbsp; By: ${esc(r.reporterName||'?')}
          &nbsp;·&nbsp; ${time}
        </div>
        ${r.details?`<div class="report-card-detail">"${esc(r.details)}"</div>`:''}
        ${isPending?`<div class="report-card-actions">
          <button class="report-dismiss-btn" data-rid="${rid}" data-action="resolve" style="border-color:rgba(76,175,80,.3);color:#4CAF50;">
            <i class="fas fa-check"></i> Mark Resolved
          </button>
          <button class="report-dismiss-btn" data-rid="${rid}" data-action="dismiss">
            <i class="fas fa-times"></i> Dismiss
          </button>
        </div>`:''}`;
      card.querySelectorAll('[data-action]').forEach(btn=>{
        btn.addEventListener('click',async function(){
          this.disabled=true;this.innerHTML='<i class="fas fa-spinner fa-spin"></i>';
          await db.collection('reports').doc(this.dataset.rid).update({
            status:this.dataset.action==='resolve'?'resolved':'dismissed',
            resolvedAt:firebase.firestore.FieldValue.serverTimestamp(),
            resolvedBy:currentUserData?.displayName||'Admin'
          }).catch(e=>showToast(e.message));
          loadAdminReports();
        });
      });
      list.appendChild(card);
    });
  }catch(err){list.innerHTML=`<p style="font-family:var(--font-mono);font-size:.75rem;color:#f55;padding:10px 0;">Error: ${err.message}</p>`;}
}
/* ═══════════════════════════════════════════════════════
   BAN SYSTEM
═══════════════════════════════════════════════════════ */
async function checkBanStatus(){
  if(!currentUser||currentUser.isAnonymous)return;
  try{
    const snap=await db.collection('bans').doc(currentUser.uid).get();
    if(snap.exists&&snap.data().active){
      // Show ban screen — user is banned
      showBannedScreen(snap.data().reason||'You have been banned from TheSizNexus.');
    }
  }catch(_){}
}
function showBannedScreen(reason){
  // Remove existing if any
  document.getElementById('bannedScreen')?.remove();
  const screen=document.createElement('div');
  screen.id='bannedScreen';screen.className='banned-overlay';
  screen.innerHTML=`
    <div class="banned-overlay-icon"><i class="fas fa-gavel"></i></div>
    <div class="banned-overlay-title">ACCESS DENIED</div>
    <div class="banned-overlay-msg">Your account has been suspended from TheSizNexus by a staff member.</div>
    <div class="banned-reason-box"><i class="fas fa-comment-alt" style="margin-right:6px;"></i>${esc(reason)}</div>
    <p style="font-family:var(--font-mono);font-size:.65rem;color:rgba(255,255,255,.2);margin-top:8px;">If you believe this is a mistake, contact staff on Discord.</p>
    <a href="https://discord.gg/73Mb3syadB" target="_blank" style="font-family:var(--font-mono);font-size:.75rem;color:#C0C0C0;text-decoration:none;"><i class="fab fa-discord" style="margin-right:5px;"></i>Contact on Discord</a>`;
  document.body.appendChild(screen);
  // Sign them out after showing screen
  setTimeout(()=>auth.signOut().catch(()=>{}),2000);
}
async function banUser(uid, name){
  if(!isCoAdmin(currentUserData)){showToast('Co-Administrator+ required.');return;}
  const reason=prompt(`Ban reason for ${name}:`);
  if(reason===null)return; // cancelled
  try{
    await safeExec(db.collection('bans').doc(uid).set({uid,name,reason:reason||'Banned by staff.',bannedBy:currentUserData?.displayName||'Admin',bannedByUid:currentUser.uid,active:true,createdAt:firebase.firestore.FieldValue.serverTimestamp()}),'User banned');
    await safeExec(db.collection('users').doc(uid).update({isBanned:true}));
    loadAdminBans();
  }catch(err){showToast('Failed: '+err.message);}
}
async function unbanUser(uid, name){
  if(!isCoAdmin(currentUserData)){showToast('Co-Administrator+ required.');return;}
  try{
    await safeExec(db.collection('bans').doc(uid).update({active:false}),'User unbanned');
    await safeExec(db.collection('users').doc(uid).update({isBanned:false}));
    loadAdminBans();
  }catch(err){showToast('Failed: '+err.message);}
}
async function loadAdminBans(){
  const banList=document.getElementById('banUserList');
  const bannedList=document.getElementById('bannedUserList');
  if(!isCoAdmin(currentUserData)){
    banList.innerHTML='';
    bannedList.innerHTML='<p style="font-family:var(--font-mono);font-size:.75rem;color:#f55;text-align:center;padding:12px 0;"><i class="fas fa-lock" style="margin-right:5px;"></i>Co-Administrator+ access required.</p>';
    return;
  }
  // Wire search
  const searchEl=document.getElementById('banSearchInput');
  if(searchEl&&!searchEl._wired){
    searchEl._wired=true;
    searchEl.addEventListener('input',async()=>{
      const q=searchEl.value.trim().toLowerCase();
      if(!q){banList.innerHTML='';return;}
      const snap=await db.collection('users').get();
      banList.innerHTML='';
      snap.forEach(d=>{
        const u=d.data();u.id=d.id;
        if(u.isAnonymous||u.id===currentUser.uid||u.id===OWNER_UID)return;
        if(!(u.displayName||'').toLowerCase().includes(q))return;
        const row=document.createElement('div');row.className='ban-user-row';
        row.innerHTML=`<div class="admin-user-av">${avHtml(u.photoURL,u.displayName)}</div>
          <span class="ban-name">${esc(u.displayName||'?')}</span>
          <span class="ban-rank-label ${rankClass(u.rank)}">${esc(u.rank||'Member')}</span>
          ${u.isBanned?'<span style="font-family:var(--font-mono);font-size:.6rem;color:#f44336;">BANNED</span>':''}
          <button class="${u.isBanned?'btn-unban-admin':'btn-ban'}" data-uid="${u.id}" data-name="${esc(u.displayName||'?')}" data-banned="${u.isBanned?'1':'0'}">
            <i class="fas fa-${u.isBanned?'unlock':'gavel'}"></i> ${u.isBanned?'Unban':'Ban'}
          </button>`;
        row.querySelector('button').addEventListener('click',async function(){
          if(this.dataset.banned==='1')await unbanUser(this.dataset.uid,this.dataset.name);
          else await banUser(this.dataset.uid,this.dataset.name);
          searchEl.dispatchEvent(new Event('input'));
        });
        banList.appendChild(row);
      });
    });
  }
  // Load currently banned users
  bannedList.innerHTML='<div class="loading-spinner" style="grid-column:unset;padding:12px 0;"></div>';
  try{
    const snap=await db.collection('bans').where('active','==',true).get().catch(async()=>db.collection('bans').get());
    const bans=snap.docs.filter(d=>d.data().active);
    bannedList.innerHTML='';
    if(!bans.length){bannedList.innerHTML='<p style="font-family:var(--font-mono);font-size:.72rem;color:var(--color-text-muted);padding:8px 0;">No banned members.</p>';return;}
    bans.forEach(d=>{
      const b=d.data();
      const row=document.createElement('div');row.className='ban-user-row';
      row.innerHTML=`<div class="admin-user-av" style="background:rgba(244,67,54,.1);border-color:rgba(244,67,54,.3);"><i class="fas fa-ban" style="color:#f44336;font-size:.7rem;"></i></div>
        <div style="flex:1;">
          <div class="ban-name">${esc(b.name||'?')}</div>
          <div style="font-family:var(--font-mono);font-size:.6rem;color:rgba(192,192,192,.35);">Banned by ${esc(b.bannedBy||'?')} &middot; Reason: ${esc(b.reason||'—')}</div>
        </div>
        <button class="btn-unban-admin" data-uid="${d.id}" data-name="${esc(b.name||'?')}"><i class="fas fa-unlock"></i> Unban</button>`;
      row.querySelector('button').addEventListener('click',async function(){
        await unbanUser(this.dataset.uid,this.dataset.name);
      });
      bannedList.appendChild(row);
    });
  }catch(err){bannedList.innerHTML=`<p style="font-family:var(--font-mono);font-size:.72rem;color:#f55;">${err.message}</p>`;}
}
/* ── SPOTLIGHT (Featured Member) ── */
let _spotlightSelectedUid=null;
let _spotlightAllUsers=[];
async function loadAdminSpotlight(){
  const currentEl=document.getElementById('spotlightCurrent');
  const listEl=document.getElementById('spotlightUserList');
  const searchEl=document.getElementById('spotlightSearch');
  const noteEl=document.getElementById('spotlightNote');
  const saveBtn=document.getElementById('spotlightSaveBtn');
  const clearBtn=document.getElementById('spotlightClearBtn');
  const savedMsg=document.getElementById('spotlightSavedMsg');
  _spotlightSelectedUid=null;
  saveBtn.disabled=true;
  // Load current pinned spotlight
  try{
    const cur=await db.collection('_configKEY').doc('featured').get();
    if(cur.exists&&cur.data()?.uid){
      const d=cur.data();
      const u=await db.collection('users').doc(d.uid).get().catch(()=>null);
      const name=u?.exists?(u.data().displayName||'Unknown'):'Unknown member';
      const setBy=d.setByName?` · set by ${esc(d.setByName)}`:'';
      currentEl.innerHTML=`<strong style="color:var(--color-primary);">Currently Pinned:</strong> ${esc(name)}${d.note?`<br><span style="color:var(--color-text-muted);">"${esc(d.note)}"</span>`:''}<br><span style="font-size:.65rem;color:var(--color-text-muted);">${esc(d.uid)}${setBy}</span>`;
      noteEl.value=d.note||'';
    }else{
      currentEl.innerHTML='<span style="color:var(--color-text-muted);">No member pinned. Spotlight is on automatic rotation.</span>';
      noteEl.value='';
    }
  }catch(err){
    currentEl.innerHTML=`<span style="color:#f55;">Failed to load current spotlight: ${esc(err.message)}</span>`;
  }
  // Load member list
  listEl.innerHTML='<div class="loading-spinner" style="grid-column:unset;padding:16px 0;"></div>';
  try{
    const snap=await db.collection('users').get();
    _spotlightAllUsers=[];
    snap.forEach(d=>{const u=d.data();u.id=d.id;if(!u.isAnonymous)_spotlightAllUsers.push(u);});
    _spotlightAllUsers.sort((a,b)=>(a.displayName||'').localeCompare(b.displayName||''));
    renderSpotlightUserList(_spotlightAllUsers);
  }catch(err){
    listEl.innerHTML=`<p style="font-family:var(--font-mono);font-size:.72rem;color:#f55;">${esc(err.message)}</p>`;
  }
  // Search filter
  searchEl.oninput=()=>{
    const q=searchEl.value.trim().toLowerCase();
    const filtered=q?_spotlightAllUsers.filter(u=>(u.displayName||'').toLowerCase().includes(q)||(u.id||'').toLowerCase().includes(q)):_spotlightAllUsers;
    renderSpotlightUserList(filtered);
  };
  // MOTW auto-pin
  await updateMotwStatus();
  document.getElementById('motwAutoBtn').onclick=runMotwAutoPin;
  // Save
  saveBtn.onclick=async()=>{
    if(!_spotlightSelectedUid)return;
    saveBtn.disabled=true;
    try{
      await db.collection('_configKEY').doc('featured').set({
        uid:_spotlightSelectedUid,
        note:noteEl.value.trim(),
        setBy:currentUser.uid,
        setByName:currentUserData?.displayName||'',
        setAt:firebase.firestore.FieldValue.serverTimestamp()
      });
      savedMsg.textContent='Spotlight pinned!';savedMsg.style.display='block';
      setTimeout(()=>savedMsg.style.display='none',2500);
      loadAdminSpotlight(); // refresh
      loadFeaturedMembers(); // refresh homepage
    }catch(err){
      showToast('Failed: '+err.message);
      saveBtn.disabled=false;
    }
  };
  // Clear
  clearBtn.onclick=async()=>{
    if(!confirm('Clear the pinned spotlight and return to automatic rotation?'))return;
    try{
      await db.collection('_configKEY').doc('featured').delete();
      savedMsg.textContent='Pin cleared. Returning to auto-rotation.';savedMsg.style.display='block';
      setTimeout(()=>savedMsg.style.display='none',2500);
      loadAdminSpotlight();
      loadFeaturedMembers();
    }catch(err){
      showToast('Failed: '+err.message);
    }
  };
}
function isoWeekKey(d=new Date()){
  // ISO week per RFC: YYYY-Www
  const t=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()));
  const day=t.getUTCDay()||7;
  t.setUTCDate(t.getUTCDate()+4-day);
  const yearStart=new Date(Date.UTC(t.getUTCFullYear(),0,1));
  const week=Math.ceil(((t-yearStart)/86400000+1)/7);
  return `${t.getUTCFullYear()}-W${String(week).padStart(2,'0')}`;
}
async function updateMotwStatus(){
  const status=document.getElementById('motwStatus');
  const btn=document.getElementById('motwAutoBtn');
  if(!status||!btn)return;
  const week=isoWeekKey();
  try{
    const cur=await db.collection('_configKEY').doc('featured').get();
    const data=cur.exists?cur.data():null;
    if(data?.motwWeek===week){
      status.innerHTML=`<i class="fas fa-check-circle" style="color:#4CAF50;"></i> Already posted for week <strong>${esc(week)}</strong>. Member: <strong>${esc(data.setByName||data.uid||'')}</strong>.`;
      btn.disabled=true;btn.style.opacity='.5';
      btn.innerHTML='<i class="fas fa-check"></i> Posted This Week';
    }else{
      status.innerHTML=`Week <strong>${esc(week)}</strong> has not been posted yet. Auto-pin will select the top operative by Net and announce them.`;
      btn.disabled=false;btn.style.opacity='1';
      btn.innerHTML='<i class="fas fa-magic"></i> Auto-Pin Top Operative as MOTW';
    }
  }catch(err){
    status.innerHTML=`<span style="color:#f55;">Failed to check status: ${esc(err.message)}</span>`;
  }
}
async function runMotwAutoPin(){
  if(!confirm('Pick the top operative by Net and pin them as Member of the Week?'))return;
  const btn=document.getElementById('motwAutoBtn');
  btn.disabled=true;btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> Working...';
  try{
    const snap=await db.collection('users').get();
    const users=[];
    snap.forEach(d=>{const u=d.data();u.id=d.id;if(!u.isAnonymous&&!u.isBanned)users.push(u);});
    if(!users.length)throw new Error('No eligible operatives.');
    users.sort((a,b)=>(b.points||0)-(a.points||0));
    const top=users[0];
    const week=isoWeekKey();
    const note=`Member of the Week ${week} — top operative with ${top.points||0} Net.`;
    await db.collection('_configKEY').doc('featured').set({
      uid:top.id,
      note,
      motwWeek:week,
      setBy:currentUser.uid,
      setByName:top.displayName||'',
      setAt:firebase.firestore.FieldValue.serverTimestamp()
    });
    await writeCorpLog('motw',`pinned ${top.displayName||'top operative'} as Member of the Week (${week})`,{uid:top.id,points:top.points||0,week});
    showToast(`MOTW posted: ${top.displayName||'Unknown'}`);
    loadAdminSpotlight();
    loadFeaturedMembers();
  }catch(err){
    showToast('MOTW failed: '+err.message);
    btn.disabled=false;
    btn.innerHTML='<i class="fas fa-magic"></i> Auto-Pin Top Operative as MOTW';
  }
}
function renderSpotlightUserList(users){
  const listEl=document.getElementById('spotlightUserList');
  const saveBtn=document.getElementById('spotlightSaveBtn');
  if(!users.length){listEl.innerHTML='<p style="font-family:var(--font-mono);font-size:.72rem;color:var(--color-text-muted);padding:10px;">No matches.</p>';return;}
  listEl.innerHTML='';
  users.slice(0,50).forEach(u=>{
    const row=document.createElement('div');
    row.className='admin-user-row';
    row.style.cursor='pointer';
    row.innerHTML=`<div class="active-member-av">${avHtml(u.photoURL,u.displayName)}</div><div style="flex:1;"><strong style="font-size:.78rem;">${esc(u.displayName||'Unknown')}</strong><br><span style="font-size:.65rem;color:var(--color-text-muted);font-family:var(--font-mono);">${esc(u.rank||'Member')} · ${u.points||0} Net</span></div>`;
    row.onclick=()=>{
      _spotlightSelectedUid=u.id;
      saveBtn.disabled=false;
      saveBtn.innerHTML=`<i class="fas fa-star"></i> Pin: ${esc(u.displayName||'Unknown')}`;
      listEl.querySelectorAll('.admin-user-row').forEach(r=>r.style.background='');
      row.style.background='rgba(192,192,192,.08)';
    };
    listEl.appendChild(row);
  });
}
/* ── SEARCH & DIRECTORY ── */
let _st=null, _dirFilter='all';
document.getElementById('searchUsers').addEventListener('input',()=>{clearTimeout(_st);_st=setTimeout(searchMembers,300);});
document.getElementById('searchUsers').addEventListener('keydown',e=>{if(e.key==='Escape'){e.target.value='';loadAllUsers();}});
document.querySelectorAll('.dir-filter').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.dir-filter').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    _dirFilter=btn.dataset.dfilter;
    applyDirFilter();
  });
});
function applyDirFilter(){
  const cards=document.querySelectorAll('#usersGrid .friend-card');
  const myFriends=currentUserData?.friends||[];
  cards.forEach(card=>{
    const uid=card.dataset.uid;
    let show=true;
    if(_dirFilter==='online'){
      // Check online status
      const statusEl=card.querySelector('.friend-status');
      show=statusEl&&statusEl.classList.contains('status-online');
    }else if(_dirFilter==='friends'){
      show=myFriends.includes(uid);
    }
    card.style.display=show?'':'none';
  });
}
// Update directory stats
function updateDirStats(users){
  const totalEl=document.getElementById('dirTotalCount');
  const onlineEl=document.getElementById('dirOnlineCount');
  const friendsEl=document.getElementById('dirFriendCount');
  if(totalEl)totalEl.textContent=users.filter(u=>!u.isAnonymous).length;
  if(onlineEl)onlineEl.textContent=users.filter(u=>u.status==='online'&&!u.isAnonymous).length;
  if(friendsEl&&currentUserData)friendsEl.textContent=users.filter(u=>(currentUserData.friends||[]).includes(u.id)).length;
  setTimeout(applyDirFilter,50);
}

/* ═══════════════════════════════════════════════════════
   OPERATOR TERMINAL
═══════════════════════════════════════════════════════ */
(function initOperatorTerminal(){
  const term=document.getElementById('operatorTerminal');
  const launcher=document.getElementById('terminalLauncher');
  const out=document.getElementById('terminalOutput');
  const input=document.getElementById('terminalInput');
  const closeBtn=document.getElementById('terminalClose');
  if(!term||!input)return;
  let history=[],historyIdx=-1;
  function termPrint(html,cls=''){
    const line=document.createElement('div');
    line.className='terminal-line '+cls;
    line.innerHTML=html;
    out.appendChild(line);
    out.scrollTop=out.scrollHeight;
  }
  function termOpen(){
    term.classList.add('open');
    term.setAttribute('aria-hidden','false');
    setTimeout(()=>input.focus(),60);
    if(!out.children.length){
      termPrint('<span class="t-dim">SizNexus Operator Console v1.0 — type <strong>/help</strong> to see what you can do.</span>','t-info');
    }
  }
  function termClose(){
    term.classList.remove('open');
    term.setAttribute('aria-hidden','true');
  }
  function termToggle(){term.classList.contains('open')?termClose():termOpen();}
  launcher.addEventListener('click',termToggle);
  closeBtn.addEventListener('click',termClose);
  document.addEventListener('keydown',e=>{
    // Backtick toggles, but ignore when typing in any input/textarea
    const tag=document.activeElement?.tagName;
    if(e.key==='`'&&tag!=='INPUT'&&tag!=='TEXTAREA'){
      e.preventDefault();termToggle();return;
    }
    if(e.key==='Escape'&&term.classList.contains('open')){termClose();}
  });
  input.addEventListener('keydown',e=>{
    if(e.key==='Enter'){
      const raw=input.value.trim();if(!raw)return;
      input.value='';
      history.push(raw);historyIdx=history.length;
      termPrint(`<span class="t-prompt">&gt;</span> <span class="t-cmd">${esc(raw)}</span>`);
      runCommand(raw);
    }else if(e.key==='ArrowUp'){
      if(historyIdx>0){historyIdx--;input.value=history[historyIdx];}e.preventDefault();
    }else if(e.key==='ArrowDown'){
      if(historyIdx<history.length-1){historyIdx++;input.value=history[historyIdx];}else{historyIdx=history.length;input.value='';}
      e.preventDefault();
    }
  });
  async function runCommand(raw){
    const parts=raw.split(/\s+/);
    const cmd=parts[0].toLowerCase().replace(/^\//,'');
    const arg=parts.slice(1).join(' ');
    try{
      switch(cmd){
        case 'help':
          termPrint([
            '<span class="t-info">Available commands:</span>',
            '  <span class="t-cmd">/help</span>            this list',
            '  <span class="t-cmd">/whois &lt;name|uid&gt;</span> look up an operative',
            '  <span class="t-cmd">/missions</span>        list active missions',
            '  <span class="t-cmd">/leaderboard</span>     top 5 operatives by Net',
            '  <span class="t-cmd">/rank</span>            your rank, Net, streak',
            '  <span class="t-cmd">/squad</span>           your current squad',
            '  <span class="t-cmd">/online</span>          count of online operatives',
            '  <span class="t-cmd">/spotlight</span>       current featured member',
            '  <span class="t-cmd">/intel</span>           latest 3 intel posts',
            '  <span class="t-cmd">/clear</span>           clear console',
            '  <span class="t-cmd">/about</span>           about the corp'
          ].join('<br>'));
          break;
        case 'clear':out.innerHTML='';break;
        case 'about':
          termPrint('TheSizNexus — intelligence corporation operating across multiple platforms. Member tools, missions, intel, and operations live inside this console and the Corp Hub.');
          break;
        case 'rank':{
          if(!currentUser||currentUser.isAnonymous){termPrint('<span class="t-err">You must be signed in.</span>');break;}
          const me=currentUserData||{};
          termPrint(`<span class="t-key">name:</span> ${esc(me.displayName||'Unknown')}<br><span class="t-key">rank:</span> ${esc(me.rank||'Member')}<br><span class="t-key">points:</span> ${me.points||0}<br><span class="t-key">streak:</span> ${me.currentStreak||0} day${(me.currentStreak||0)===1?'':'s'} (best: ${me.longestStreak||0})<br><span class="t-key">badges:</span> ${(me.badges||[]).length}`);
          break;
        }
        case 'whois':{
          if(!arg){termPrint('<span class="t-err">Usage: /whois &lt;name|uid&gt;</span>');break;}
          const snap=await db.collection('users').get();
          const ql=arg.toLowerCase();
          const u=snap.docs.map(d=>({...d.data(),id:d.id})).find(u=>!u.isAnonymous&&((u.displayName||'').toLowerCase()===ql||(u.displayName||'').toLowerCase().includes(ql)||u.id===arg));
          if(!u){termPrint('<span class="t-err">No operative found.</span>');break;}
          termPrint(`<span class="t-key">name:</span> ${esc(u.displayName||'Unknown')}${u.operatorTitle?` — <span class="t-dim">${esc(u.operatorTitle)}</span>`:''}<br><span class="t-key">rank:</span> ${esc(u.rank||'Member')}<br><span class="t-key">points:</span> ${u.points||0}<br><span class="t-key">status:</span> ${esc(u.status||'offline')}${u.activityStatus?` "${esc(u.activityStatus)}"`:''}<br><span class="t-key">badges:</span> ${(u.badges||[]).length}<br><span class="t-key">bio:</span> ${esc(u.bio||'—')}`);
          break;
        }
        case 'missions':{
          const snap=await db.collection('missions').where('active','==',true).get();
          if(snap.empty){termPrint('<span class="t-dim">No active missions.</span>');break;}
          const lines=snap.docs.slice(0,8).map(d=>{const m=d.data();return `  • <strong>${esc(m.title||'Mission')}</strong> <span class="t-dim">(${m.points||0} Net)${m.category?` [${esc(m.category)}]`:''}</span>`;});
          termPrint(`<span class="t-info">${snap.size} active mission${snap.size===1?'':'s'}:</span><br>${lines.join('<br>')}`);
          break;
        }
        case 'leaderboard':{
          const snap=await db.collection('users').get();
          const users=snap.docs.map(d=>({...d.data(),id:d.id})).filter(u=>!u.isAnonymous).sort((a,b)=>(b.points||0)-(a.points||0)).slice(0,5);
          if(!users.length){termPrint('<span class="t-dim">No operatives ranked yet.</span>');break;}
          termPrint(`<span class="t-info">Top 5 operatives:</span><br>${users.map((u,i)=>`  <span class="t-key">${i+1}.</span> ${esc(u.displayName||'Unknown')} <span class="t-dim">— ${u.points||0} Net</span>`).join('<br>')}`);
          break;
        }
        case 'online':{
          const snap=await db.collection('users').where('status','==','online').get();
          const n=snap.docs.filter(d=>!d.data().isAnonymous).length;
          termPrint(`<span class="t-key">${n}</span> operative${n===1?'':'s'} online right now.`);
          break;
        }
        case 'spotlight':{
          const cur=await db.collection('_configKEY').doc('featured').get();
          if(!cur.exists||!cur.data()?.uid){termPrint('<span class="t-dim">No spotlight pinned. Auto-rotation active.</span>');break;}
          const d=cur.data();
          const us=await db.collection('users').doc(d.uid).get();
          const u=us.exists?us.data():{};
          termPrint(`<span class="t-key">spotlight:</span> ${esc(u.displayName||d.uid)}${d.note?`<br><span class="t-dim">"${esc(d.note)}"</span>`:''}`);
          break;
        }
        case 'squad':{
          if(!currentUser||currentUser.isAnonymous){termPrint('<span class="t-err">You must be signed in.</span>');break;}
          const snap=await db.collection('squads').where('members','array-contains',currentUser.uid).get();
          if(snap.empty){termPrint('<span class="t-dim">You are not in a squad. Form one from the Hub → Squads tab.</span>');break;}
          const s=snap.docs[0].data();
          termPrint(`<span class="t-key">squad:</span> ${esc(s.name||'')} ${s.tag?`[${esc(s.tag)}]`:''}<br><span class="t-key">members:</span> ${(s.members||[]).length} / 5<br><span class="t-key">leader:</span> ${s.leaderUid===currentUser.uid?'YOU':esc(s.leaderUid||'')}`);
          break;
        }
        case 'intel':{
          const snap=await db.collection('intelPosts').orderBy('createdAt','desc').limit(3).get().catch(()=>null);
          if(!snap||snap.empty){termPrint('<span class="t-dim">No intel posts available.</span>');break;}
          termPrint(`<span class="t-info">Latest intel:</span><br>${snap.docs.map(d=>{const p=d.data();return `  • <strong>${esc(p.title||'Intel')}</strong>${p.tag?` <span class="t-dim">[${esc(p.tag)}]</span>`:''}`;}).join('<br>')}`);
          break;
        }
        case 'secret':case 'lore':{
          termPrint('<span class="t-info">[CLASSIFIED] // </span><span class="t-dim">Pattern recognized. Some files only open with the right phrase. Keep watching the corpLog.</span>');
          break;
        }
        default:
          termPrint(`<span class="t-err">unknown command:</span> ${esc(cmd)}. Try <strong>/help</strong>.`);
      }
    }catch(err){
      termPrint(`<span class="t-err">error:</span> ${esc(err.message)}`);
    }
  }
})();

/* ── Mini Markdown (bold, italic, code, links, line breaks) ── */
function mdLite(text){
  let t=esc(text||'');
  // code spans
  t=t.replace(/`([^`]+)`/g,'<code class="md-code">$1</code>');
  // bold then italic
  t=t.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
  t=t.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g,'<em>$1</em>');
  // urls (very loose)
  t=t.replace(/(https?:\/\/[^\s<]+)/g,'<a href="$1" target="_blank" rel="noopener noreferrer" class="md-link">$1</a>');
  // line breaks
  t=t.replace(/\n/g,'<br>');
  return t;
}
/* ── KONAMI EASTER EGG ── */
(function initKonami(){
  const seq=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let idx=0;
  document.addEventListener('keydown',e=>{
    const k=e.key.length===1?e.key.toLowerCase():e.key;
    if(k===seq[idx]){idx++;if(idx===seq.length){revealLore();idx=0;}}
    else idx=k===seq[0]?1:0;
  });
  function revealLore(){
    const o=document.getElementById('loreOverlay');
    if(!o)return;
    o.classList.add('show');
    o.setAttribute('aria-hidden','false');
  }
  document.getElementById('closeLore')?.addEventListener('click',()=>{
    const o=document.getElementById('loreOverlay');
    o.classList.remove('show');o.setAttribute('aria-hidden','true');
  });
})();

/* ── ONBOARDING TOUR ── */
(function initOnboardingTour(){
  const overlay=document.getElementById('tourOverlay');
  const card=document.getElementById('tourCard');
  if(!overlay||!card)return;
  const steps=[
    {sel:'#command-board',title:'Welcome, Operative',body:'This is your Command Board — your live overview of corp activity, missions, leaderboard, and intel. Click the preview tabs above to switch.'},
    {sel:'#streak-panel',title:'Daily Check-In',body:'Sign in once per UTC day to keep your streak alive. Miss a day and it resets. Visit often, climb the leaderboard.'},
    {sel:'#searchBtn',title:'Search & Console',body:'Press Ctrl/⌘+K for global search across members, missions, and intel. Press the backtick (`) key to open the Operator Console for slash-commands like /whois, /missions, /rank.'},
    {sel:'.profile-button',title:'Your Profile',body:'Open your profile to set an accent color, operator title, and banner. Build your file. Welcome to the Nexus.'}
  ];
  let cur=0;
  function show(i){
    cur=i;
    const step=steps[i];
    document.getElementById('tourStepIdx').textContent=i+1;
    document.getElementById('tourTitle').textContent=step.title;
    document.getElementById('tourBody').textContent=step.body;
    document.getElementById('tourNextLbl').textContent=i===steps.length-1?'Got it':'Next';
    // Spotlight target element if visible
    document.querySelectorAll('.tour-spotlight').forEach(el=>el.classList.remove('tour-spotlight'));
    const target=document.querySelector(step.sel);
    if(target){target.classList.add('tour-spotlight');target.scrollIntoView({behavior:'smooth',block:'center'});}
  }
  function open(){
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden','false');
    show(0);
  }
  function close(){
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden','true');
    document.querySelectorAll('.tour-spotlight').forEach(el=>el.classList.remove('tour-spotlight'));
    try{localStorage.setItem('siz_onboarded','1');}catch(_){}
  }
  document.getElementById('tourSkip').addEventListener('click',close);
  document.getElementById('tourNext').addEventListener('click',()=>{
    if(cur<steps.length-1)show(cur+1);else close();
  });
  // Auto-fire after first sign-in for non-anonymous, non-onboarded users.
  auth.onAuthStateChanged(u=>{
    if(!u||u.isAnonymous)return;
    try{if(localStorage.getItem('siz_onboarded'))return;}catch(_){}
    setTimeout(open,1400);
  });
})();

/* ── CIPHER EFFECT (ENCRYPTED TEXT REVEAL) ── */
function runCipherEffect(container) {
  if(!container) return;
  const elements = container.querySelectorAll('.cipher-text');
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%^&*()';
  elements.forEach(el => {
    const finalStr = el.dataset.cipher || el.textContent.trim();
    if(!el.dataset.cipher) el.dataset.cipher = finalStr;
    const len = finalStr.length;
    let iteration = 0;
    const maxIter = 10;
    
    playSFX('cipher');

    const intId = setInterval(() => {
      let temp = '';
      for(let i=0; i<len; i++) {
        if(i < (iteration/maxIter)*len) {
          temp += finalStr[i];
        } else {
          temp += chars[Math.floor(Math.random() * chars.length)];
        }
      }
      el.textContent = temp;
      iteration++;
      if(iteration > maxIter) {
        clearInterval(intId);
        el.textContent = finalStr;
      }
    }, 40);
  });
}

/* ── TACTICAL UI SOUND EFFECTS ── (removed: replace with no-op stubs) */
function initSFX(){}
function playSFX(){}

/* ── HIGH-CLEARANCE GLITCH EFFECT ── */
function triggerGlitch() {
  document.body.classList.add('glitching');
  playSFX('cipher');
  setTimeout(() => document.body.classList.remove('glitching'), 400);
}

/* ── OPERATOR ID CARD GENERATOR ── */
/* Non-reversible deterministic display ID derived from a Firebase uid.
   Uses a cyrb128-style 64-bit mix with a salt so the printed badge cannot
   be inverted back to the actual uid (or guessed with a length-1 lookup).
   Same uid always yields the same badge — stable per operative. */
function operativeIdFromUid(uid){
  if(!uid)return '—';
  const SALT='siznexus-id-v1//ops';
  const str=uid+SALT;
  let h1=0xdeadbeef^str.length, h2=0x41c6ce57^(str.length<<2);
  for(let i=0;i<str.length;i++){
    const c=str.charCodeAt(i);
    h1=Math.imul(h1^c, 2654435761);
    h2=Math.imul(h2^c, 1597334677);
  }
  h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);
  h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);
  // Compose two unsigned 32-bit halves into an 11-char base36 string
  const a=(h1>>>0).toString(36).toUpperCase().padStart(7,'0').slice(-7);
  const b=(h2>>>0).toString(36).toUpperCase().padStart(7,'0').slice(-7);
  const combined=(a+b).replace(/[^A-Z0-9]/g,'X');
  return `${combined.slice(0,4)}-${combined.slice(4,8)}-${combined.slice(8,12)}`;
}
function generateOperatorID(user, mode='download') {
  if(!user){showToast('Sign in first.');return;}
  const W=720, H=440;
  const canvas = document.createElement('canvas');
  canvas.width=W; canvas.height=H;
  const ctx = canvas.getContext('2d');

  // Background gradient
  const bg=ctx.createLinearGradient(0,0,W,H);
  bg.addColorStop(0,'#0c1020'); bg.addColorStop(1,'#04060e');
  ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

  // Subtle dot matrix grid
  ctx.fillStyle='rgba(192,192,192,0.05)';
  for(let x=0;x<W;x+=14)for(let y=0;y<H;y+=14){ctx.fillRect(x,y,1,1);}

  // Outer frame
  ctx.strokeStyle='rgba(192,192,192,0.45)';
  ctx.lineWidth=1.5; ctx.strokeRect(12,12,W-24,H-24);
  // Corner brackets (silver L-marks)
  ctx.lineWidth=2; ctx.strokeStyle='#d4d8e2';
  const C=24;
  function corner(x,y,dx,dy){ctx.beginPath();ctx.moveTo(x,y+dy);ctx.lineTo(x,y);ctx.lineTo(x+dx,y);ctx.stroke();}
  corner(20,20,C,C);corner(W-20,20,-C,C);corner(20,H-20,C,-C);corner(W-20,H-20,-C,-C);

  // Top header strip
  const hg=ctx.createLinearGradient(0,30,0,75);
  hg.addColorStop(0,'rgba(192,192,192,0.12)');hg.addColorStop(1,'rgba(192,192,192,0.02)');
  ctx.fillStyle=hg; ctx.fillRect(28,32,W-56,46);
  ctx.strokeStyle='rgba(192,192,192,0.18)'; ctx.lineWidth=1; ctx.strokeRect(28,32,W-56,46);
  ctx.fillStyle='#d4d8e2';
  ctx.font='700 18px "Share Tech Mono", monospace';
  ctx.fillText('SIZNEXUS // IDENTIFICATION', 42, 62);
  ctx.fillStyle='rgba(192,192,192,0.6)';
  ctx.font='10px "Share Tech Mono", monospace';
  ctx.fillText('CLASSIFIED', W-110, 62);

  // Photo placeholder (drawn first; img replaces it)
  const PX=42, PY=98, PW=160, PH=160;
  function drawPlaceholder(){
    ctx.fillStyle='#0a0e1a'; ctx.fillRect(PX,PY,PW,PH);
    ctx.strokeStyle='rgba(192,192,192,0.4)'; ctx.lineWidth=1; ctx.strokeRect(PX,PY,PW,PH);
    ctx.fillStyle='#a8b2c1';
    ctx.font='700 64px "Share Tech Mono", monospace';
    ctx.textAlign='center';
    ctx.fillText((user.displayName||'?')[0].toUpperCase(), PX+PW/2, PY+PH/2+22);
    ctx.textAlign='left';
  }
  drawPlaceholder();

  // Right column: details
  const COL=PX+PW+30;
  ctx.font='10px "Share Tech Mono", monospace';
  ctx.fillStyle='rgba(192,192,192,0.55)';
  ctx.fillText('OPERATIVE NAME', COL, PY+8);
  ctx.fillStyle='#fff';
  ctx.font='700 22px "Share Tech Mono", monospace';
  ctx.fillText((user.displayName||'UNKNOWN').toUpperCase(), COL, PY+34);

  function row(label, val, y){
    ctx.fillStyle='rgba(192,192,192,0.55)';
    ctx.font='10px "Share Tech Mono", monospace';
    ctx.fillText(label, COL, y);
    ctx.fillStyle='#d4d8e2';
    ctx.font='700 14px "Share Tech Mono", monospace';
    ctx.fillText(String(val).toUpperCase(), COL, y+18);
  }
  row('CLEARANCE',user.rank||'MEMBER', PY+62);
  row('OPERATOR TITLE', user.operatorTitle||'—', PY+98);
  row('NET FUNDS', (user.points||0).toLocaleString(), PY+134);

  // Bottom band: status, ID, barcode (taller so the issued footer fits cleanly)
  const BY = H-110;
  ctx.fillStyle='rgba(192,192,192,0.04)';
  ctx.fillRect(28,BY-4,W-56,90);
  ctx.strokeStyle='rgba(192,192,192,0.16)'; ctx.lineWidth=1; ctx.strokeRect(28,BY-4,W-56,90);

  ctx.fillStyle='rgba(192,192,192,0.55)';
  ctx.font='10px "Share Tech Mono", monospace';
  ctx.fillText('STATUS', 42, BY+12);
  ctx.fillStyle = user.status==='online' ? '#9be39b' : '#999';
  ctx.font='700 13px "Share Tech Mono", monospace';
  ctx.fillText(user.status==='online'?'ACTIVE NETWORK':'OFFLINE', 42, BY+30);

  // Operative ID — derived from a non-reversible hash of the Firebase uid
  ctx.fillStyle='rgba(192,192,192,0.55)';
  ctx.font='10px "Share Tech Mono", monospace';
  ctx.fillText('OPERATIVE ID', 42, BY+52);
  ctx.fillStyle='#d4d8e2';
  ctx.font='12px "Share Tech Mono", monospace';
  ctx.fillText(operativeIdFromUid(currentUser?.uid||''), 42, BY+70);

  // Barcode on right of bottom band — right-anchored with safe padding
  const BAR_BARS=28, BAR_STEP=6, BAR_W=BAR_BARS*BAR_STEP, BAR_RIGHT_PAD=42;
  const BAR_X=W-BAR_RIGHT_PAD-BAR_W; // anchored to right with 42px padding from card edge
  const BAR_Y=BY+10, BAR_H=36;
  ctx.fillStyle='#d4d8e2';
  for(let i=0;i<BAR_BARS;i++){
    const w=Math.random()>0.5?2:5;
    ctx.fillRect(BAR_X+i*BAR_STEP, BAR_Y, w, BAR_H);
  }
  // SCAN AT GATE caption — centered under the barcode
  ctx.fillStyle='rgba(192,192,192,0.55)';
  ctx.font='9px "Share Tech Mono", monospace';
  ctx.textAlign='center';
  ctx.fillText('SCAN AT GATE', BAR_X+BAR_W/2, BAR_Y+BAR_H+14);
  ctx.textAlign='left';

  // Issued footer — tucked inside the bottom band so it never collides with the frame border
  ctx.fillStyle='rgba(192,192,192,0.4)';
  ctx.font='9px "Share Tech Mono", monospace';
  const issued=new Date().toISOString().slice(0,10);
  ctx.fillText(`ISSUED ${issued} · TheSizNexus`, 42, BY+82);

  // Now draw photo on top of placeholder if available
  const img=new Image();
  img.crossOrigin='Anonymous';
  img.onload=()=>{ctx.drawImage(img,PX,PY,PW,PH);ctx.strokeStyle='rgba(192,192,192,0.6)';ctx.strokeRect(PX,PY,PW,PH);finalize();};
  img.onerror=finalize;
  if(user.photoURL)img.src=user.photoURL; else finalize();

  function finalize(){
    const filename=`SizNexus_ID_${(user.displayName||'Operative').replace(/[^a-z0-9]/gi,'_')}.png`;
    if(mode==='share' && navigator.canShare){
      canvas.toBlob(async(blob)=>{
        if(!blob){fallbackDownload();return;}
        const file=new File([blob],filename,{type:'image/png'});
        const payload={files:[file],title:'TheSizNexus Operator ID',text:`I just enlisted with TheSizNexus. ${location.origin}/u/${encodeURIComponent(user.displayName||'')}`};
        if(navigator.canShare(payload)){
          try{await navigator.share(payload);showToast('Operator ID shared.');}
          catch(_){fallbackDownload();}
        }else fallbackDownload();
      },'image/png');
    }else{
      fallbackDownload();
    }
    function fallbackDownload(){
      const a=document.createElement('a');
      a.download=filename;
      a.href=canvas.toDataURL('image/png');
      a.click();
      showToast(mode==='share'?'Sharing not supported — downloaded instead.':'Operator ID downloaded.');
    }
  }
}
document.getElementById('downloadOperatorIdBtn')?.addEventListener('click',()=>generateOperatorID(currentUserData));


/* ── PUBLIC PROFILE ROUTING ── */
async function handleRoute(){
  const path=location.pathname;
  // /u/<displayName>
  const uMatch=path.match(/^\/u\/(.+?)\/?$/i);
  if(uMatch){
    const slug=decodeURIComponent(uMatch[1]).trim();
    try{
      const snap=await db.collection('users').where('displayName','==',slug).limit(1).get();
      if(snap.empty){
        const altSnap=await db.collection('users').get();
        const lc=slug.toLowerCase();
        const found=altSnap.docs.find(d=>(d.data().displayName||'').toLowerCase()===lc);
        if(found){openViewProfile({...found.data(),id:found.id});return;}
        showToast(`Operative "${esc(slug)}" not found.`);return;
      }
      const d=snap.docs[0];
      openViewProfile({...d.data(),id:d.id});
    }catch(err){console.error('Route error:',err);}
    return;
  }
  // /squad/<name>  (basic placeholder — opens the hub Squads tab)
  if(/^\/squad\//i.test(path)){
    if(currentUser&&!currentUser.isAnonymous)setTimeout(()=>openEngagementHub('squads'),700);
    else showToast('Sign in to view squad pages.');
  }
}
// Run after auth & DB are ready
auth.onAuthStateChanged(()=>setTimeout(handleRoute,400));

/* ── SHARE PROFILE ── */
function buildPublicProfileUrl(name){
  const base=location.origin;
  return `${base}/u/${encodeURIComponent(name||'')}`;
}
async function shareMyProfile(){
  if(!currentUser||!currentUserData?.displayName){showToast('Set a display name first.');return;}
  const url=buildPublicProfileUrl(currentUserData.displayName);
  try{
    if(navigator.share){
      await navigator.share({title:`${currentUserData.displayName} on TheSizNexus`,url});
    }else{
      await navigator.clipboard.writeText(url);
      showToast('Profile link copied: '+url);
    }
  }catch(_){
    try{await navigator.clipboard.writeText(url);showToast('Profile link copied.');}catch(_){showToast('Could not copy link.');}
  }
}
document.getElementById('shareMyProfileBtn')?.addEventListener('click',shareMyProfile);
document.getElementById('shareReferralBtn')?.addEventListener('click',shareReferralLink);
document.getElementById('shareOperatorIdBtn')?.addEventListener('click',()=>generateOperatorID(currentUserData,'share'));

/* ── ACHIEVEMENT CARDS ── */
function generateAchievementCard(title,subtitle,iconName){
  const W=720,H=380;
  const c=document.createElement('canvas');c.width=W;c.height=H;
  const ctx=c.getContext('2d');
  // BG gradient
  const bg=ctx.createLinearGradient(0,0,W,H);
  bg.addColorStop(0,'#0c1020');bg.addColorStop(1,'#04060e');
  ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  // Dot matrix
  ctx.fillStyle='rgba(192,192,192,0.05)';
  for(let x=0;x<W;x+=14)for(let y=0;y<H;y+=14){ctx.fillRect(x,y,1,1);}
  // Frame
  ctx.strokeStyle='rgba(192,192,192,0.45)';ctx.lineWidth=1.5;ctx.strokeRect(12,12,W-24,H-24);
  ctx.lineWidth=2;ctx.strokeStyle='#d4d8e2';
  const C=24;
  function corner(x,y,dx,dy){ctx.beginPath();ctx.moveTo(x,y+dy);ctx.lineTo(x,y);ctx.lineTo(x+dx,y);ctx.stroke();}
  corner(20,20,C,C);corner(W-20,20,-C,C);corner(20,H-20,C,-C);corner(W-20,H-20,-C,-C);
  // Header strip
  const hg=ctx.createLinearGradient(0,30,0,75);
  hg.addColorStop(0,'rgba(192,192,192,0.12)');hg.addColorStop(1,'rgba(192,192,192,0.02)');
  ctx.fillStyle=hg;ctx.fillRect(28,32,W-56,46);
  ctx.strokeStyle='rgba(192,192,192,0.18)';ctx.lineWidth=1;ctx.strokeRect(28,32,W-56,46);
  ctx.fillStyle='#d4d8e2';ctx.font='700 18px "Share Tech Mono", monospace';
  ctx.fillText('SIZNEXUS // ACHIEVEMENT UNLOCKED',42,62);
  // Trophy badge (silver disc with monogram)
  ctx.beginPath();ctx.arc(W/2,180,60,0,Math.PI*2);
  const rg=ctx.createRadialGradient(W/2,170,5,W/2,180,60);
  rg.addColorStop(0,'#fff');rg.addColorStop(1,'rgba(168,178,193,.6)');
  ctx.fillStyle=rg;ctx.fill();
  ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle='#0a0e1a';ctx.font='700 56px "Orbitron",monospace';ctx.textAlign='center';
  ctx.fillText((iconName||'★').slice(0,1).toUpperCase(),W/2,200);
  ctx.textAlign='left';
  // Title + subtitle
  ctx.fillStyle='#fff';ctx.font='700 28px "Orbitron", monospace';ctx.textAlign='center';
  ctx.fillText(String(title||'').slice(0,40),W/2,290);
  ctx.fillStyle='rgba(192,192,192,0.7)';ctx.font='13px "Share Tech Mono", monospace';
  ctx.fillText(String(subtitle||'').slice(0,80),W/2,320);
  ctx.textAlign='left';
  // Footer
  ctx.fillStyle='rgba(192,192,192,0.4)';ctx.font='10px "Share Tech Mono", monospace';
  ctx.fillText(`UNLOCKED ${new Date().toISOString().slice(0,10)} · TheSizNexus`,28,H-22);
  return c;
}
function offerAchievementShare(title,subtitle,iconName){
  const c=generateAchievementCard(title,subtitle,iconName);
  const filename=`SizNexus_${title.replace(/[^a-z0-9]/gi,'_')}.png`;
  if(navigator.canShare){
    c.toBlob(async(blob)=>{
      if(!blob){download();return;}
      const file=new File([blob],filename,{type:'image/png'});
      const payload={files:[file],title:'TheSizNexus achievement',text:`${title} — ${subtitle} | ${location.origin}`};
      if(navigator.canShare(payload)){
        try{await navigator.share(payload);return;}catch(_){download();}
      }else download();
    },'image/png');
  }else download();
  function download(){const a=document.createElement('a');a.href=c.toDataURL('image/png');a.download=filename;a.click();}
  showToast(`Achievement: ${title}`);
}
// Hook streak milestones
const _streakMilestones=new Set([7,14,30,60,100,365]);
const _origDoDailyCheckIn=doDailyCheckIn;
window.doDailyCheckIn=async function(){
  const before=currentUserData?.currentStreak||0;
  await _origDoDailyCheckIn();
  const after=currentUserData?.currentStreak||0;
  if(after>before && _streakMilestones.has(after)){
    setTimeout(()=>offerAchievementShare(`${after}-Day Streak`,'Operational consistency on TheSizNexus','S'),600);
  }
};

/* ── BROWSER TAB BADGE ── */
const _baseTitle=document.title;
function setTabBadge(n){
  document.title=(n>0?`(${n}) `:'')+_baseTitle;
}
function refreshTabBadge(){
  if(!currentUser||currentUser.isAnonymous){setTabBadge(0);return;}
  Promise.all([
    db.collection('notifications').where('to','==',currentUser.uid).where('read','==',false).get().catch(()=>null),
    db.collection('friendRequests').where('to','==',currentUser.uid).get().catch(()=>null)
  ]).then(([nSnap,rSnap])=>{
    const n=(nSnap?nSnap.size:0)+(rSnap?rSnap.docs.filter(d=>d.data().status==='pending').length:0);
    setTabBadge(n);
  });
}
auth.onAuthStateChanged(()=>setTimeout(refreshTabBadge,1200));
setInterval(()=>{if(!document.hidden)refreshTabBadge();},45000);

/* ── BROWSER NATIVE NOTIFICATIONS ──
   Polite permission ask: only the FIRST time a DM/notif arrives after sign-in.
   No persistent push (FCM needs Cloud Functions) — these fire only while the tab is open. */
let _nativeNotifAsked=false;
function maybeNativeNotify(title,body,uid){
  if(!('Notification' in window))return;
  if(!document.hidden)return; // tab visible — toast is enough
  if(Notification.permission==='granted'){
    try{const n=new Notification(title,{body,icon:'/favicon/favicon-32x32.png',tag:uid||'siz'});n.onclick=()=>{window.focus();n.close();};}catch(_){}
    return;
  }
  if(Notification.permission==='default' && !_nativeNotifAsked){
    _nativeNotifAsked=true;
    Notification.requestPermission();
  }
}

