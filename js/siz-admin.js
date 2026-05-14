/* ── HAMBURGER ── */
const hamburger=document.getElementById('hamburger'),mobileMenu=document.getElementById('mobileMenu');
hamburger.addEventListener('click',function(){const o=this.classList.toggle('open');this.setAttribute('aria-expanded',o);mobileMenu.classList.toggle('open',o);});
mobileMenu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{hamburger.classList.remove('open');hamburger.setAttribute('aria-expanded','false');mobileMenu.classList.remove('open');}));
/* ── DROPDOWN ── */
const profileButton=document.getElementById('profileButton'),dropdownMenu=document.getElementById('dropdownMenu');
profileButton.addEventListener('click',function(e){e.stopPropagation();const o=dropdownMenu.classList.toggle('open');this.setAttribute('aria-expanded',o);});
document.addEventListener('click',()=>{dropdownMenu.classList.remove('open');profileButton.setAttribute('aria-expanded','false');});
document.getElementById('loginBtn').addEventListener('click',e=>{e.preventDefault();clearError();openModal('loginModal');});
document.getElementById('myProfileBtn').addEventListener('click',e=>{e.preventDefault();dropdownMenu.classList.remove('open');openMyProfile();});
document.getElementById('viewMembersBtn').addEventListener('click',e=>{
  e.preventDefault();
  dropdownMenu.classList.remove('open');
  // Members need account
  if(!currentUser||currentUser.isAnonymous||currentUserData?.isAnonymous){
    promptGuestRegister('Create a free account to view and connect with other operatives.');
    return;
  }
  openModal('userDirectory');
  loadAllUsers();
});
/* ── INTEL FEED — UNDER DEVELOPMENT ── */
document.getElementById('closeIntelDev').addEventListener('click',()=>closeModal('intelDevModal'));
document.getElementById('intelDevModal').addEventListener('click',function(e){if(e.target===this)closeModal('intelDevModal');});
document.getElementById('intelFeedNav').addEventListener('click',e=>{e.preventDefault();openModal('intelDevModal');});
document.getElementById('intelFeedMobile').addEventListener('click',e=>{
  e.preventDefault();
  hamburger.classList.remove('open');hamburger.setAttribute('aria-expanded','false');mobileMenu.classList.remove('open');
  openModal('intelDevModal');
});
/* ── ADMIN PANEL ── */
const RANKS_LIST=['Unaffiliated','Member','Beta Tester','Moderator','Developer','Co-Administrator','Administrator','Founder'];
// Rank power level
const RANK_POWER={};
RANKS_LIST.forEach((r,i)=>RANK_POWER[r]=i);
function myPower(){return currentUser?.uid===OWNER_UID?99:(RANK_POWER[currentUserData?.rank]??0);}
function rankPower(rank){return RANK_POWER[rank]??0;}
// Can manage check
function canManage(targetRank){
  if(currentUser?.uid===OWNER_UID)return true;
  return myPower()>rankPower(targetRank);
}
// Ranks user can assign
function assignableRanks(){
  const power=myPower();
  return RANKS_LIST.filter(r=>RANK_POWER[r]<power);
}
async function openAdminPanel(){
  if(!currentUser||!canOpenPanel(currentUserData)){showToast('Access denied.');return;}
  openModal('adminModal');
  // Show viewer's rank in header
  const rBadge=document.getElementById('adminViewerRank');
  if(rBadge){
    rBadge.textContent=currentUserData?.rank||'Member';
    rBadge.className='';
    rBadge.style.cssText='font-family:var(--font-mono);font-size:.62rem;padding:4px 10px;border-radius:3px;background:rgba(192,192,192,.08);border:1px solid rgba(192,192,192,.25);color:#D4D8E2 !important;display:inline-block;width:100%;text-align:center;font-weight:700;text-transform:uppercase;letter-spacing:.05em;';
  }
  // Tab access
  const rank=currentUserData?.rank||'';
  const isModerator=['Moderator'].includes(rank);
  const isDeveloper=['Developer'].includes(rank);
  const isCoAdminPlus=['Co-Administrator','Administrator','Founder'].includes(rank)||currentUser.uid===OWNER_UID;
  // Tab visibility
  // Moderator: reports, announce
  // Developer: roles, announce, history, keys
  // Co-Admin+: all tabs including badges, bans
  const tabAccess={
    roles: !isModerator,         // Dev+
    badges: isCoAdminPlus,       // Co-Admin+
    announce: true,              // All panel users
    history: !isModerator,       // Dev+
    missions: !isModerator,      // Dev+
    reports: isCoAdminPlus,      // Co-Admin+
    bans: isCoAdminPlus,         // Co-Admin+
    spotlight: isCoAdminPlus,    // Co-Admin+
  };
  // Show/hide tabs
  document.querySelectorAll('.admin-tab').forEach(btn=>{
    const tab=btn.dataset.tab;
    btn.style.display=(tabAccess[tab]===false)?'none':'';
  });
  // Default tab
  const firstVisible=document.querySelector('.admin-tab:not([style*="display: none"]):not([style*="display:none"])');
  const defaultTab=firstVisible?.dataset.tab||'announce';
  document.querySelectorAll('.admin-tab').forEach(b=>b.classList.remove('active'));
  firstVisible?.classList.add('active');
  loadAdminTab(defaultTab);
  document.querySelectorAll('.admin-tab').forEach(btn=>{
    btn.onclick=()=>{
      document.querySelectorAll('.admin-tab').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      loadAdminTab(btn.dataset.tab);
    };
  });
}
/* ── ADMIN: MISSION CREATOR + KEY REVIEW ── */
async function loadAdminKeys(){
  const list=document.getElementById('adminKeysList');
  list.innerHTML='<div class="loading-spinner" style="grid-column:unset;padding:20px 0;"></div>';
  // Show missions
  list.innerHTML=`<div style="margin-bottom:14px;border-bottom:var(--border);padding-bottom:12px;">
    <p class="admin-section-title">Create New Mission</p>
    <div style="display:flex;flex-direction:column;gap:6px;">
      <input type="text" id="missionTitleInput" class="input-field" placeholder="Mission title..." maxlength="80" style="font-size:.78rem;">
      <textarea id="missionDescInput" class="input-field" placeholder="Mission description..." maxlength="300" style="min-height:56px;font-size:.75rem;resize:vertical;"></textarea>
      <div style="display:flex;gap:6px;">
        <input type="text" id="missionKeyInput" class="input-field" placeholder="SECRET KEY (share in Discord)" maxlength="30" style="font-size:.75rem;text-transform:uppercase;letter-spacing:.1em;flex:1;">
        <input type="number" id="missionPtsInput" class="input-field" placeholder="Pts" min="5" max="500" value="50" style="font-size:.75rem;width:70px;">
      </div>
      <select id="missionCategoryInput" class="input-field" style="font-size:.75rem;">
        <option value="">Select category (optional)...</option>
        <option value="recon">Recon</option>
        <option value="combat">Combat</option>
        <option value="support">Support</option>
        <option value="intel">Intel</option>
        <option value="logistics">Logistics</option>
        <option value="other">Other</option>
      </select>
      <select id="missionSubTypeInput" class="input-field" style="font-size:.75rem;">
        <option value="key">KEY only — members submit a secret key</option>
        <option value="link">Link only — members paste a URL (no key required)</option>
        <option value="text">Text only — members describe their work (no key)</option>
        <option value="key_or_link">KEY + optional link — key required, link optional</option>
      </select>
      <input type="text" id="missionSubPromptInput" class="input-field" placeholder='Deliverable prompt (optional, e.g. "Paste your GitHub link")' maxlength="100" style="font-size:.75rem;">
      <button class="btn-primary" id="createMissionBtn" style="justify-content:center;font-size:.75rem;padding:8px;"><i class="fas fa-plus"></i> Create Mission</button>
      <div class="success-msg" id="missionCreateMsg">Mission created!</div>
    </div>
  </div>
  <p class="admin-section-title">Pending KEY Submissions</p>
  <div id="pendingKeysList"></div>`;
  document.getElementById('createMissionBtn').addEventListener('click',async()=>{
    const title=document.getElementById('missionTitleInput').value.trim();
    const desc=document.getElementById('missionDescInput').value.trim();
    const key=document.getElementById('missionKeyInput').value.trim().toUpperCase();
    const pts=parseInt(document.getElementById('missionPtsInput').value)||50;
    if(!title||!desc||!key){showToast('Fill in all fields.');return;}
    if(!currentUser||!(isDev(currentUserData)||currentUser.uid===OWNER_UID)){showToast('Developer+ required to create missions.');return;}
    const btn=document.getElementById('createMissionBtn');
    btn.disabled=true;btn.innerHTML='<i class="fas fa-spinner fa-spin"></i>';
    const category=document.getElementById('missionCategoryInput')?.value||'';
    const submissionType=document.getElementById('missionSubTypeInput')?.value||'key';
    const submissionPrompt=document.getElementById('missionSubPromptInput')?.value.trim()||'';
    try{await safeExec(db.collection('missions').add({title,description:desc,secretKey:key,points:pts,category,submissionType,submissionPrompt,active:true,createdAt:firebase.firestore.FieldValue.serverTimestamp()}),'Mission created');
      const s=document.getElementById('missionCreateMsg');s.style.display='block';setTimeout(()=>s.style.display='none',2500);
    }catch(e){}
    btn.disabled=false;btn.innerHTML='<i class="fas fa-plus"></i> Create Mission';
  });
  // Load pending submissions
  const pendingList=document.getElementById('pendingKeysList');
  try{
    const snap=await db.collection('missionSubmissions').where('status','==','pending').get();
    if(snap.empty){pendingList.innerHTML='<p style="font-family:var(--font-mono);font-size:.75rem;color:var(--color-text-muted);">No pending submissions.</p>';return;}
    for(const d of snap.docs){
      const sub=d.data(),sid=d.id;
      // Get correct key
      const missionDoc=await db.collection('missions').doc(sub.missionId).get();
      const correctKey=missionDoc.exists?missionDoc.data().secretKey:'???';
      const keyMatch=sub.keySubmitted===correctKey;
      const row=document.createElement('div');row.className='admin-user-row';row.style.flexDirection='column';row.style.alignItems='flex-start';row.style.gap='6px';
      row.innerHTML=`<div style="display:flex;align-items:center;gap:8px;width:100%;">
        <span class="admin-user-name" style="flex:1;">${esc(sub.displayName||'?')} — ${esc(sub.missionTitle||'?')}</span>
        <span class="mission-status ${keyMatch?'completed':'rejected'}">${keyMatch?'Key Correct':'Wrong Key'}</span>
      </div>
      <div style="font-family:var(--font-mono);font-size:.68rem;color:var(--color-text-muted);">Submitted: <strong>${esc(sub.keySubmitted||'(no key)')}</strong> &nbsp;|&nbsp; Expected: <strong style="color:${keyMatch?'#4CAF50':'#f44336'};">${esc(correctKey)}</strong></div>
      ${sub.submissionLink?`<div style="font-family:var(--font-mono);font-size:.67rem;margin-top:4px;">Deliverable: <a href="${esc(sub.submissionLink)}" target="_blank" rel="noopener noreferrer" style="color:var(--color-primary);word-break:break-all;">${esc(sub.submissionLink)}</a></div>`:''}
      ${sub.submissionNote?`<div style="font-family:var(--font-mono);font-size:.65rem;color:var(--color-text-muted);margin-top:2px;font-style:italic;">${esc(sub.submissionNote)}</div>`:''}

      <div style="display:flex;gap:6px;">
        <button class="admin-save-rank" style="border-color:rgba(76,175,80,.4);color:#4CAF50;" data-sid="${sid}" data-uid="${sub.uid}" data-pts="${sub.points||50}" data-action="approve"><i class="fas fa-check"></i> Approve +${sub.points||50}Net</button>
        <button class="admin-save-rank" style="border-color:rgba(255,68,68,.4);color:#f55;" data-sid="${sid}" data-action="reject"><i class="fas fa-times"></i> Reject</button>
      </div>`;
      row.querySelector('[data-action="approve"]').addEventListener('click',async function(){
        this.disabled=true;this.innerHTML='<i class="fas fa-spinner fa-spin"></i>';
        const batch=db.batch();
        batch.update(db.collection('missionSubmissions').doc(this.dataset.sid),{status:'approved'});
        batch.update(db.collection('users').doc(this.dataset.uid),{points:firebase.firestore.FieldValue.increment(parseInt(this.dataset.points)||50)});
        try{await safeExec(batch.commit()); await safeExec(awardBadge(this.dataset.uid,'mission'),'Approved! Points awarded.');}catch(_){ }
        loadAdminKeys();
      });
      row.querySelector('[data-action="reject"]').addEventListener('click',async function(){
        const reason=prompt('Rejection reason (optional):');
        try{await safeExec(db.collection('missionSubmissions').doc(this.dataset.sid).update({status:'rejected',rejectReason:reason||''}),'Submission rejected.');}catch(_){}
        loadAdminKeys();
      });
      pendingList.appendChild(row);
    }
  }catch(err){pendingList.innerHTML=`<p style="font-family:var(--font-mono);font-size:.75rem;color:#f55;">Error: ${err.message}</p>`;}
}
// Load admin tabs
async function loadAdminTab(tab){
  document.querySelectorAll('.admin-panel-section').forEach(s=>s.classList.remove('active'));
  const tabId='adminTab'+tab.charAt(0).toUpperCase()+tab.slice(1);
  const el=document.getElementById(tabId);if(el)el.classList.add('active');
  if(tab==='roles')await loadAdminRoles();
  else if(tab==='history')await loadAnnHistory();
  else if(tab==='missions')await loadAdminKeys();
  else if(tab==='badges')await loadAdminBadges();
  else if(tab==='reports')await loadAdminReports();
  else if(tab==='bans')await loadAdminBans();
  else if(tab==='spotlight')await loadAdminSpotlight();
  else if(tab==='threat')await loadAdminThreat();
  else if(tab==='tools')await loadAdminTools();
}
/* ── THREAT LEVEL PROTOCOL ── */
let _currentThreat = 'green';
function startThreatListener() {
  db.collection('_configKEY').doc('app').onSnapshot(doc => {
    if(!doc.exists) return;
    const data = doc.data();
    const threat = data.threatLevel || 'green';
    
    // Trigger glitch if escalating to red
    if(threat === 'red' && _currentThreat !== 'red' && typeof triggerGlitch === 'function') triggerGlitch();
    
    _currentThreat = threat;
    
    // Update Body Class
    document.body.classList.remove('threat-green', 'threat-yellow', 'threat-red');
    document.body.classList.add(`threat-${threat}`);
    
    // Update Banner
    const banner = document.getElementById('threatBanner');
    const msg = document.getElementById('threatMsg');
    if(threat === 'red') {
      banner.style.display = 'flex';
      banner.style.background = 'linear-gradient(90deg, rgba(180,50,50,.88), rgba(120,35,35,.88))';
      msg.textContent = '// CRITICAL NETWORK THREAT — CODE RED IN EFFECT';
    } else if(threat === 'yellow') {
      banner.style.display = 'flex';
      banner.style.background = 'linear-gradient(90deg, rgba(180,140,60,.88), rgba(140,100,40,.88))';
      msg.textContent = '// ELEVATED NETWORK RISK — CODE YELLOW ACTIVE';
    } else {
      banner.style.display = 'none';
    }
  });
}
startThreatListener();

async function loadAdminThreat() {
  const label = document.getElementById('currentThreatLabel');
  label.textContent = _currentThreat.toUpperCase();
  
  document.querySelectorAll('.threat-opt').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.threat === _currentThreat);
    btn.onclick = async () => {
      if(!confirm(`Confirm GLOBAL override to CODE ${btn.dataset.threat.toUpperCase()}?`)) return;
      try {
        await db.collection('_configKEY').doc('app').update({ threatLevel: btn.dataset.threat });
        showToast(`Threat level updated to ${btn.dataset.threat.toUpperCase()}`);
        loadAdminThreat();
      } catch(err) {
        showToast(`Override failed: ${err.message}`);
      }
    };
  });
}
async function loadAdminBadges(){
  const list=document.getElementById('adminBadgesList');
  list.innerHTML='<div class="loading-spinner" style="grid-column:unset;padding:20px 0;"></div>';
  const canAssignAll=currentUser.uid===OWNER_UID; // only Founder assigns any badge
  const canAssignDev=isDev(currentUserData); // Dev+ can assign premade badges
  try{
    const snap=await db.collection('users').get();
    const users=[];snap.forEach(d=>{const u=d.data();u.id=d.id;if(!u.isAnonymous)users.push(u);});
    users.sort((a,b)=>(a.displayName||'').localeCompare(b.displayName||''));
    list.innerHTML='';
    // Badge list
    const availableBadges=Object.entries(BADGE_DEFS).map(([k,v])=>({key:k,label:v.label}));
    users.forEach(u=>{
      const row=document.createElement('div');row.className='admin-user-row';row.style.flexWrap='wrap';row.style.gap='6px';
      const currentBadges=(u.badges||[]);
      row.innerHTML=`<div style="display:flex;align-items:center;gap:8px;width:100%;margin-bottom:4px;">
        <div class="admin-user-av">${avHtml(u.photoURL,u.displayName)}</div>
        <span class="admin-user-name ${rankClass(u.rank)}">${esc(u.displayName||'Unknown')}</span>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:4px;width:100%;margin-bottom:6px;">${currentBadges.length?renderBadges(currentBadges):'<span style="font-family:var(--font-mono);font-size:.65rem;color:var(--color-text-muted);">No badges</span>'}</div>
      <div style="display:flex;gap:4px;flex-wrap:wrap;width:100%;">
        <select class="admin-rank-select badge-select" id="badgeSel_${u.id}">
          ${availableBadges.map(b=>`<option value="${b.key}">${b.label}</option>`).join('')}
        </select>
        <button class="admin-save-rank" data-uid="${u.id}" data-action="add" style="font-size:.62rem;"><i class="fas fa-plus"></i> Add</button>
        <button class="admin-save-rank" data-uid="${u.id}" data-action="remove" style="border-color:rgba(255,68,68,.4);color:#f55;font-size:.62rem;"><i class="fas fa-minus"></i> Remove</button>
      </div>`;
      row.querySelectorAll('[data-action]').forEach(btn=>{
        btn.addEventListener('click',async function(){
          if(this.dataset.action==='add'&&!canAssignDev){showToast('Developer+ required to assign badges.');return;}
          if(this.dataset.action==='add'&&!canAssignAll&&!canAssignDev){showToast('Access denied.');return;}
          const badge=document.getElementById('badgeSel_'+this.dataset.uid).value;
          const uid=this.dataset.uid;
          this.disabled=true;
          if(this.dataset.action==='add'){
            try{await safeExec(awardBadge(uid,badge),'Badge awarded!');}catch(_){ }
          }else{
            try{await safeExec(db.collection('users').doc(uid).update({badges:firebase.firestore.FieldValue.arrayRemove(badge)}),'Badge removed!');}catch(_){ }
          }
          loadAdminBadges();
          loadAdminBadges();
        });
      });
      list.appendChild(row);
    });
  }catch(err){list.innerHTML=`<p style="font-family:var(--font-mono);font-size:.75rem;color:#f55;">Error: ${err.message}</p>`;}
}
// Extend admin modal
async function loadAdminRoles(){
  const list=document.getElementById('adminUserList');
  list.innerHTML='<div class="loading-spinner" style="grid-column:unset;padding:20px 0;"></div>';
  // Wire search
  const searchEl=document.getElementById('adminUserSearch');
  if(searchEl&&!searchEl._wired){
    searchEl._wired=true;
    searchEl.addEventListener('input',()=>{
      const q=searchEl.value.trim().toLowerCase();
      list.querySelectorAll('.admin-user-row').forEach(row=>{
        const name=row.querySelector('.admin-user-name')?.textContent.toLowerCase()||'';
        row.style.display=name.includes(q)?'':'none';
      });
    });
  }
  try{
    const snap=await db.collection('users').get();
    const users=[];
    snap.forEach(d=>{const u=d.data();u.id=d.id;if(!u.isAnonymous)users.push(u);});
    users.sort((a,b)=>(a.displayName||'').localeCompare(b.displayName||''));
    // Update stats
    const statsEl=document.getElementById('adminStats');
    if(statsEl){
      const onlineCount=users.filter(u=>u.status==='online').length;
      const rankCounts={};users.forEach(u=>{rankCounts[u.rank||'Member']=(rankCounts[u.rank||'Member']||0)+1;});
      statsEl.innerHTML=`<div class="admin-stat-chip">Total: <strong>${users.length}</strong></div><div class="admin-stat-chip" style="color:#4CAF50;">Online: <strong>${onlineCount}</strong></div>${Object.entries(rankCounts).slice(0,3).map(([r,n])=>`<div class="admin-stat-chip">${esc(r)}: <strong>${n}</strong></div>`).join('')}`;
    }
    list.innerHTML='';
    users.forEach(u=>{
      const row=document.createElement('div');row.className='admin-user-row';
      const selectId='rankSel_'+u.id;
      // Owner row
      const isOwnerRow=u.id===OWNER_UID;
      row.innerHTML=`
        <div class="admin-user-av">${avHtml(u.photoURL,u.displayName)}</div>
        <span class="admin-user-name ${rankClass(u.rank)}">${esc(u.displayName||'Unknown')}</span>
        ${isOwnerRow
          ? `<span style="font-family:var(--font-mono);font-size:.65rem;color:#ffd700;margin-left:auto;display:flex;align-items:center;gap:5px;"><i class="fas fa-crown"></i> Founder — Protected</span>`
          : `<select class="admin-rank-select" id="${selectId}">
              ${assignableRanks().map(r=>`<option value="${r}"${r===u.rank?' selected':''}>${r}</option>`).join('')}
            </select>
            <button class="admin-save-rank" data-uid="${u.id}" data-sel="${selectId}"${!canManage(u.rank)?'disabled title="Cannot manage this rank"':''} ><i class="fas fa-check"></i> Save</button>`
        }`;
      if(isOwnerRow)return; // no click handler needed
      const targetCurrentRank=u.rank||'Member';
      row.querySelector('.admin-save-rank').addEventListener('click',async function(){
        const newRank=document.getElementById(this.dataset.sel).value;
        // Check rank power
        if(rankPower(newRank)>=myPower()){
          showToast('You cannot assign a rank equal to or above your own.');
          return;
        }
        // Check promotion authority
        if(rankPower(newRank)>rankPower(targetCurrentRank)&&rankPower(newRank)>=myPower()){
          showToast('Cannot promote above your own rank.');
          return;
        }
        this.innerHTML='<i class="fas fa-spinner fa-spin"></i>';
        try{
          await safeExec(db.collection('users').doc(this.dataset.uid).update({rank:newRank}),'Rank updated');
          this.innerHTML='<i class="fas fa-check"></i> Saved!';
          row.querySelector('.admin-user-name').className='admin-user-name '+rankClass(newRank);
          setTimeout(()=>{this.innerHTML='<i class="fas fa-check"></i> Save';},1500);
        }catch(err){
          this.innerHTML='<i class="fas fa-times"></i> Error';
        }
      });
      list.appendChild(row);
    });
  }catch(err){list.innerHTML=`<p style="font-family:var(--font-mono);font-size:.75rem;color:#f55;">Error: ${err.message}</p>`;}
}
async function loadAnnHistory(){
  const list=document.getElementById('annHistoryList');
  list.innerHTML='<div class="loading-spinner" style="grid-column:unset;padding:20px 0;"></div>';
  try{
    const snap=await db.collection('announcements').get();
    const docs=snap.docs.sort((a,b)=>(b.data().createdAt?.toMillis?.()||0)-(a.data().createdAt?.toMillis?.()||0));
    list.innerHTML='';
    if(!docs.length){list.innerHTML='<p style="font-family:var(--font-mono);font-size:.75rem;color:var(--color-text-muted);text-align:center;padding:20px 0;">No announcements sent yet.</p>';return;}
    docs.forEach(d=>{
      const a=d.data();
      const item=document.createElement('div');item.className='ann-history-item';
      item.innerHTML=`<div class="ann-history-title">${esc(a.title||'Untitled')}</div><div class="ann-history-body">${esc(a.body||'')}</div><div class="ann-history-meta">Sent by ${esc(a.authorName||'Admin')} • ${a.createdAt?fmtDate(a.createdAt):''}</div>`;
      list.appendChild(item);
    });
  }catch(err){list.innerHTML=`<p style="font-family:var(--font-mono);font-size:.75rem;color:#f55;">Error: ${err.message}</p>`;}
}
document.getElementById('sendAnnBtn').addEventListener('click',async()=>{
  if(!currentUser||!isDev(currentUserData)){showToast('Developer+ required to send announcements.');return;}
  const title=document.getElementById('annTitle').value.trim();
  const body=document.getElementById('annBody').value.trim();
  if(!title||!body){showToast('Please fill in both title and message.');return;}
  const btn=document.getElementById('sendAnnBtn');
  btn.disabled=true;btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> Sending...';
  try{
    await db.collection('announcements').add({
      title,body,
      authorUid:currentUser.uid,
      authorName:currentUserData?.displayName||'Admin',
      createdAt:firebase.firestore.FieldValue.serverTimestamp()
    });
    const usersSnap=await db.collection('users').get();
    const batch=db.batch();
    let batchCount=0;
    usersSnap.docs.forEach(d=>{
      if(d.id!==currentUser.uid&&!d.data().isAnonymous){
        const ref=db.collection('notifications').doc();
        batch.set(ref,{
          to:d.id,type:'announcement',
          fromName:currentUserData?.displayName||'Admin',
          title,preview:body.length>60?body.slice(0,60)+'…':body,
          read:false,
          createdAt:firebase.firestore.FieldValue.serverTimestamp()
        });
        batchCount++;
      }
    });
    await batch.commit();
    document.getElementById('annTitle').value='';
    document.getElementById('annBody').value='';
    const s=document.getElementById('annSentMsg');s.style.display='block';
    setTimeout(()=>s.style.display='none',3000);
    showToast(`Announcement sent to ${batchCount} member(s)!`);
  }catch(err){
    console.error('Announcement error:',err);
    showToast('Error: '+err.message);
  }finally{
    btn.disabled=false;btn.innerHTML='<i class="fas fa-bullhorn"></i> Send Announcement';
  }
});
document.getElementById('closeAdmin').addEventListener('click',()=>closeModal('adminModal'));
document.getElementById('adminPanelBtn').addEventListener('click',e=>{e.preventDefault();dropdownMenu.classList.remove('open');openAdminPanel();});
document.getElementById('logoutBtn').addEventListener('click',async(e)=>{
  e.preventDefault();
  try{
    if(currentUser?.isAnonymous){
      try{await db.collection('users').doc(currentUser.uid).delete();}catch(_){}
      try{await currentUser.delete();}catch(_){}
    }else if(currentUser?.uid){
      // Mark offline before signing out so the status updates reliably
      await db.collection('users').doc(currentUser.uid).update({status:'offline'}).catch(()=>{});
    }
    sessionStorage.removeItem('_anonUid');
    await auth.signOut();
    showToast('Signed out successfully.');
  }catch(err){showToast('Error signing out: '+err.message);}
});

// Clean up any orphaned guest doc from a previous tab-close session
(async()=>{
  const staleUid=sessionStorage.getItem('_anonUid');
  if(!staleUid)return;
  sessionStorage.removeItem('_anonUid');
  try{await db.collection('users').doc(staleUid).delete();}catch(_){}
})();
