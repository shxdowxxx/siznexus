  // SizNexus v2.1
  const firebaseConfig={
    apiKey:"AIzaSyBcfVGWx4PFU__CeYkpSlmac3SasqODBx4",
    authDomain:"thesiznexus.firebaseapp.com",
    projectId:"thesiznexus",
    storageBucket:"thesiznexus.firebasestorage.app",
    messagingSenderId:"654294052068",
    appId:"1:654294052068:web:0cc5a7d3fd79f533a710f1",
    measurementId:"G-R8EJ0QB1XT"
  };
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();
  /* ── DOMAIN LOCK & DEVELOPER KEY SYSTEM ── */
  const ALLOWED_DOMAIN_FALLBACK='siznexus.org';
  let allowedDomain=ALLOWED_DOMAIN_FALLBACK;
  let domainLockEnabled=true;
  let isDeveloperMode=sessionStorage.getItem('devMode')==='true';
  
  function getCurrentDomain(){
    const host=window.location.hostname;
    return host.replace('www.','');
  }
  
  function isAllowedDomain(){
    if(!domainLockEnabled) return true;
    const domain=getCurrentDomain();
    return domain===allowedDomain||domain==='localhost'||domain.startsWith('127.');
  }
  
  function showDomainLock(){
    const overlay=document.createElement('div');
    overlay.id='domain-lock-overlay';
    overlay.style.cssText=`
      position:fixed;top:0;left:0;width:100%;height:100%;
      background:linear-gradient(135deg,#060a12,#0a0e1a);
      display:flex;align-items:center;justify-content:center;
      z-index:10000;backdrop-filter:blur(5px);
      font-family:var(--font-mono);
    `;
    overlay.innerHTML=`
      <div style="text-align:center;max-width:500px;padding:30px;background:rgba(10,14,26,0.97);border:1px solid rgba(192,192,192,0.25);border-top:1px solid rgba(212,216,226,0.35);border-radius:8px;box-shadow:0 0 30px rgba(192,192,192,0.12);">
        <div style="font-size:2rem;margin-bottom:20px;"><i class="fas fa-lock" style="color:#C0C0C0;"></i></div>
        <h1 style="color:#D4D8E2;margin:0 0 10px 0;font-size:1.5rem;letter-spacing:0.1em;">Access Restricted</h1>
        <p style="color:#B0BAC9;margin:0 0 20px 0;font-size:0.9rem;line-height:1.6;">This application is restricted to <strong>siznexus.org</strong>. Access from this domain is blocked.</p>
        <p style="color:#7A8499;margin:0 0 15px 0;font-size:0.75rem;opacity:0.7;">Current domain: <code style="color:#C0C0C0;">${getCurrentDomain()}</code></p>
        <button id="dev-unlock-btn" style="margin-top:20px;padding:8px 16px;background:rgba(192,192,192,0.07);border:1px solid rgba(192,192,192,0.25);color:#C0C0C0;cursor:pointer;font-family:var(--font-mono);font-size:0.7rem;border-radius:4px;transition:all 0.3s;opacity:0.5;pointer-events:all;">Developer</button>
      </div>
    `;
    document.body.appendChild(overlay);
    document.getElementById('dev-unlock-btn').addEventListener('click',promptDeveloperKey);
  }
  
  async function sha256(str){
    const msgUint8=new TextEncoder().encode(str);
    const hashBuffer=await crypto.subtle.digest('SHA-256',msgUint8);
    const hashArray=Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b=>b.toString(16).padStart(2,'0')).join('');
  }
  async function promptDeveloperKey(){
    const key=prompt('Enter developer key:');
    if(!key)return;
    const btn=document.getElementById('dev-unlock-btn');
    btn.disabled=true;
    btn.innerHTML='Validating...';
    try{
      const storedDoc=await db.collection('_configKEY').doc('devKeyHash').get();
      if(!storedDoc.exists){
        alert('Developer key not configured. Contact owner.');
        btn.disabled=false;
        btn.innerHTML='👤 Developer';
        return;
      }
      const storedHash=storedDoc.data().hash;
      const inputHash=await sha256(key.trim());
      if(inputHash===storedHash){
        sessionStorage.setItem('devMode','true');
        isDeveloperMode=true;
        document.getElementById('domain-lock-overlay')?.remove();
        window.location.reload();
      } else {
        alert('Invalid key.');
        btn.disabled=false;
        btn.innerHTML='👤 Developer';
      }
    } catch(err){
      console.error('Key validation error:',err);
      alert('Error validating key. Check console.');
      btn.disabled=false;
      btn.innerHTML='👤 Developer';
    }
  }
  
  if(!isAllowedDomain()&&!isDeveloperMode){
    document.addEventListener('DOMContentLoaded',showDomainLock);
    window.addEventListener('load',()=>{
      const lock=document.getElementById('domain-lock-overlay');
      if(lock){
        document.body.style.overflow='hidden';
        document.querySelectorAll('*').forEach(el=>{
          if(el.id!=='domain-lock-overlay')el.style.pointerEvents='none';
        });
      }
    });
  }
/* ── SECURITY ── */
document.addEventListener('dragstart', e => { if (e.target && e.target.tagName === 'IMG') e.preventDefault(); });
/* ── SPLASH ── */
(function(){
  const bar=document.getElementById('splashBar'),txt=document.getElementById('splashText');
  const msgs=['INITIALIZING NEXUS...','LOADING CORPORATION DATA...','ESTABLISHING CONNECTION...','ACCESS GRANTED'];
  let pct=0,mi=0;
  const iv=setInterval(()=>{
    pct+=Math.random()*8+2;if(pct>100)pct=100;bar.style.width=pct+'%';
    const ni=Math.floor(pct/25);if(ni!==mi&&ni<msgs.length){mi=ni;txt.textContent=msgs[ni];}
    if(pct>=100){clearInterval(iv);txt.textContent='ACCESS GRANTED';setTimeout(()=>document.getElementById('splash').classList.add('hidden'),600);}
  },60);
})();
/* ── PARTICLES ── */
particlesJS('particles-js',{particles:{number:{value:window.innerWidth<768?30:60,density:{enable:true,value_area:window.innerWidth<768?400:800}},color:{value:'#A8B2C1'},shape:{type:'circle'},opacity:{value:.15,random:true},size:{value:window.innerWidth<768?.8:1.2,random:true},line_linked:{enable:true,distance:150,color:'#A8B2C1',opacity:.05,width:1},move:{enable:true,speed:window.innerWidth<768?.3:.5,direction:'none',random:true}},interactivity:{events:{onhover:{enable:window.innerWidth>=768,mode:'repulse'}}}});
/* ── STATS COUNTER ── */
function animateCounters(){document.querySelectorAll('.stat-number[data-target]').forEach(el=>{const t=+el.dataset.target;let c=0;const s=Math.max(1,Math.ceil(t/30));const iv=setInterval(()=>{c+=s;if(c>=t){c=t;clearInterval(iv);}el.textContent=c;},40);});}
const so=new IntersectionObserver(en=>{en.forEach(e=>{if(e.isIntersecting){animateCounters();so.disconnect();}});},{threshold:.5});
const sbe=document.querySelector('.stats-bar');if(sbe)so.observe(sbe);
/* ── FEATURED MEMBER ── */
let featuredRotationTimer=null,featuredMemberPool=[],featuredMemberIndex=0,currentFeaturedMember=null;
/* ── FIREBASE ── */
const auth=firebase.auth(),db=firebase.firestore();
const googleProvider=new firebase.auth.GoogleAuthProvider();
let currentUser=null,currentUserData=null;
let msgUnsubscribe=null,notifUnsubscribe=null,activeMembersUnsub=null,membersUnsubscribe=null;
// Ensure config documents exist (dev key kept hidden - only in Firestore, never in client code)
const appConfigRef=db.collection('_configKEY').doc('app');
appConfigRef.set({
  domainLock:{
    allowedDomain:'siznexus.org',
    enabled:true
  }
},{merge:true}).catch(()=>{});
async function loadAppConfig(){
  try{
    const configSnapshot=await appConfigRef.get();
    if(configSnapshot.exists){
      const config=configSnapshot.data();
      if(config?.domainLock?.allowedDomain) allowedDomain=config.domainLock.allowedDomain;
      if(typeof config?.domainLock?.enabled === 'boolean') domainLockEnabled=config.domainLock.enabled;
    }
  }catch(err){
    console.warn('Unable to load app config:',err);
  }
}
loadAppConfig();
// Note: Developer key is NOT stored in client code. Owner must set it manually in Firestore:
// 1. Go to Firebase Console → Firestore → _configKEY → devKeyHash
// 2. Create document with field "hash" containing the SHA-256 hash of the secret
// 3. The app validates entered keys by hashing and comparing to the stored hash
/* ── HELPERS ── */
function initials(n){if(!n)return'?';return n.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function avHtml(photo,name){if(photo)return`<img src="${esc(photo)}" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover;">`;return`<span>${initials(name)}</span>`;}
function chatId(a,b){return[a,b].sort().join('_');}
function fmtTime(ts){if(!ts)return'';const d=ts.toDate?ts.toDate():new Date(ts);return d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});}
function fmtDate(ts){if(!ts)return'';const d=ts.toDate?ts.toDate():new Date(ts);return d.toLocaleDateString([],{month:'short',day:'numeric',year:'numeric'});}
function safeExec(promise, successMsg){
  return (async ()=>{
    try{const res=await promise; if(successMsg)showToast(successMsg); return res;}catch(err){console.error(err); showToast(err&&err.code==='permission-denied'?'Permission denied — check Firestore rules or your role.':(err&&err.message||String(err))); throw err;}
  })();
}
function setNavAvatar(user,data){
  const av=document.getElementById('userAvatar'),ic=document.getElementById('defaultIcon');
  const url=data?.photoURL||user?.photoURL||'';
  if(user&&url){av.src=url;av.style.cssText='display:block;width:100%;height:100%;object-fit:cover;border-radius:50%;position:absolute;top:0;left:0;';ic.style.display='none';}
  else{av.style.display='none';ic.style.display='block';}
  // Ghost icon
  if(user?.isAnonymous){ic.className='fas fa-user-secret';ic.style.display='block';av.style.display='none';}
  else{ic.className='fas fa-user';}
}
async function createUserDoc(user){
  await db.collection('users').doc(user.uid).set({
    displayName:user.displayName||user.email.split('@')[0],email:user.email,photoURL:user.photoURL||'',
    rank:'Member',bio:'',status:'online',friends:[],createdAt:firebase.firestore.FieldValue.serverTimestamp()
  });
  return(await db.collection('users').doc(user.uid).get()).data();
}
/* ── TOAST ── */
let _tt=null;
function showToast(msg){const t=document.getElementById('nexusToast');t.textContent=msg;t.classList.add('show');clearTimeout(_tt);_tt=setTimeout(()=>t.classList.remove('show'),3200);}
/* ── MODAL UTILITIES ── */
function openModal(id){document.getElementById(id).classList.add('active');document.body.style.overflow='hidden';}
function closeModal(id){document.getElementById(id).classList.remove('active');if(!document.querySelector('.modal.active'))document.body.style.overflow='';}
const ALL_MODALS=['loginModal','userDirectory','profileModal','myProfileModal','notifModal','msgModal','resetModal','intelDevModal','adminModal','engagementModal','reportModal','searchModal','briefingModal'];
ALL_MODALS.forEach(id=>{
  document.getElementById(id).addEventListener('click',function(e){
    if(e.target===this){
      closeModal(id);
      if(id==='userDirectory'&&membersUnsubscribe){membersUnsubscribe();membersUnsubscribe=null;}
      if(id==='msgModal'){if(msgUnsubscribe){msgUnsubscribe();msgUnsubscribe=null;}currentChatUid=null;}
    }
  });
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape')ALL_MODALS.forEach(id=>{
    if(document.getElementById(id).classList.contains('active')){
      closeModal(id);
      if(id==='userDirectory'&&membersUnsubscribe){membersUnsubscribe();membersUnsubscribe=null;}
      if(id==='msgModal'){if(msgUnsubscribe){msgUnsubscribe();msgUnsubscribe=null;}currentChatUid=null;}
    }
  });
});
document.getElementById('closeModal').addEventListener('click',()=>closeModal('loginModal'));
document.getElementById('closeDirectory').addEventListener('click',()=>{closeModal('userDirectory');if(membersUnsubscribe){membersUnsubscribe();membersUnsubscribe=null;}});
document.getElementById('closeProfile').addEventListener('click',()=>closeModal('profileModal'));
document.getElementById('closeMyProfile').addEventListener('click',()=>closeModal('myProfileModal'));
document.getElementById('closeNotif').addEventListener('click',()=>closeModal('notifModal'));
function closeMsgChat(){closeModal('msgModal');if(msgUnsubscribe){msgUnsubscribe();msgUnsubscribe=null;}if(typingUnsub){typingUnsub();typingUnsub=null;}clearTypingPing();currentChatUid=null;}
document.getElementById('closeMsgModal').addEventListener('click',closeMsgChat);
document.getElementById('msgBackBtn').addEventListener('click',closeMsgChat);
/* ── ACTIVE MEMBERS PANEL ── */
function startActiveMembersListener(){
  if(activeMembersUnsub)activeMembersUnsub();
  activeMembersUnsub=db.collection('users').where('status','==','online').onSnapshot(snap=>{
    const list=document.getElementById('activeMembersList');
    const countLabel=document.getElementById('onlineCountLabel');
    const statCount=document.getElementById('activeMemberCount');
    const commandCount=document.getElementById('commandOnlineValue');
    list.innerHTML='';
    const blockedList=currentUserData?.blockedUsers||[];
    const members=[];snap.forEach(d=>{const u=d.data();u.id=d.id;if(!blockedList.includes(u.id))members.push(u);});
    countLabel.textContent=members.length;statCount.textContent=members.length;
    if(commandCount)commandCount.textContent=members.length;
    if(!members.length){list.innerHTML='<p style="font-family:var(--font-mono);font-size:.75rem;color:var(--color-text-muted);padding:8px 0;">No operatives online right now.</p>';return;}
    members.forEach(u=>{
      const row=document.createElement('div');row.className='active-member-row';
      row.innerHTML=`<div class="active-dot"></div><div class="active-member-av">${avHtml(u.photoURL,u.displayName)}</div><span class="active-member-name">${nameHtml(u)}</span><span class="active-member-rank ${rankClass(u.rank)}">${esc(u.rank||'Member')}</span>`;
      row.addEventListener('click',()=>{if(currentUser&&u.id===currentUser.uid)openMyProfile();else openViewProfile(u);});
      list.appendChild(row);
    });
  },()=>{
    document.getElementById('activeMembersList').innerHTML='<p style="font-family:var(--font-mono);font-size:.75rem;color:#f55;padding:8px 0;">Failed to load active members.</p>';
    const commandCount=document.getElementById('commandOnlineValue');
    if(commandCount)commandCount.textContent='—';
  });
}
startActiveMembersListener();
/* ── MEMBER CARDS / DIRECTORY ── */
function buildMemberCard(u,isSelf){
  const div=document.createElement('div');div.className='friend-card';div.dataset.uid=u.id;
  const photo=u.photoURL||'',name=u.displayName||'Unknown',bio=u.bio||'No bio set',status=u.status||'offline',rank=u.rank||'Member';
  const seen=relativeTime(u.lastActive);
  const seenHtml=seen?`<span class="friend-lastseen" title="Last active">${esc(seen)}</span>`:'';
  div.innerHTML=`<div class="friend-avatar-wrap">${photo?`<img class="friend-avatar" src="${esc(photo)}" alt="${esc(name)}" loading="lazy">`:`<div class="friend-avatar-placeholder">${initials(name)}</div>`}</div><div class="friend-info"><h3 class="friend-name">${nameHtml(u,'Unknown')}${isSelf?' <span style="font-size:.6rem;color:var(--color-text-muted);font-family:var(--font-mono);">[YOU]</span>':''}</h3>${titleHtml(u)}<p class="friend-bio">${esc(bio)}</p><div class="friend-footer"><span class="friend-status status-${status}">${status}</span><span class="friend-rank ${rankClass(rank)}">${esc(rank)}</span>${seenHtml}</div></div>`;
  div.addEventListener('click',()=>{if(isSelf)openMyProfile();else openViewProfile(u);});
  return div;
}
function displayMembers(users){
  const g=document.getElementById('usersGrid');g.innerHTML='';
  if(!users.length){g.innerHTML='<p style="font-family:var(--font-mono);font-size:.8rem;color:var(--color-text-muted);grid-column:1/-1;text-align:center;padding:20px 0;">No members found.</p>';return;}
  users.forEach(u=>g.appendChild(buildMemberCard(u,currentUser&&u.id===currentUser.uid)));
}
function loadAllUsers(){
  if(membersUnsubscribe){membersUnsubscribe();membersUnsubscribe=null;}
  document.getElementById('usersGrid').innerHTML='<div class="loading-spinner"></div>';
  membersUnsubscribe=db.collection('users').onSnapshot(snap=>{
    const blocked=currentUserData?.blockedUsers||[];
    const users=[];
    snap.forEach(d=>{const u=d.data();u.id=d.id;if(!u.isAnonymous&&!blocked.includes(u.id))users.push(u);});
    users.sort((a,b)=>{if(currentUser){if(a.id===currentUser.uid)return -1;if(b.id===currentUser.uid)return 1;}return(a.displayName||'').localeCompare(b.displayName||'');});
    displayMembers(users);
    updateDirStats(users);
  },err=>{console.error(err);document.getElementById('usersGrid').innerHTML='<p style="font-family:var(--font-mono);font-size:.8rem;color:#f55;grid-column:1/-1;text-align:center;padding:20px 0;">Failed to load members.</p>';});
}
function searchMembers(){
  const q=document.getElementById('searchUsers').value.trim().toLowerCase();
  if(!q){loadAllUsers();return;}
  db.collection('users').get().then(snap=>{const users=[];snap.forEach(d=>{const u=d.data();u.id=d.id;if((u.displayName||'').toLowerCase().includes(q)||(u.bio||'').toLowerCase().includes(q))users.push(u);});displayMembers(users);}).catch(console.error);
}
/* ── VIEW PROFILE ── */
async function openViewProfile(u){
  // Fetch user data
  if(!u.createdAt){
    try{const snap=await db.collection('users').doc(u.id).get();if(snap.exists)Object.assign(u,snap.data());}catch(_){}
  }
  const content=document.getElementById('profileContent');
  const isLoggedIn=!!currentUser;
  const photo=u.photoURL||'',name=u.displayName||'Unknown';
  // Block check
  if(isLoggedIn&&!currentUser.isAnonymous&&isBlocked(u.id)){
    content.innerHTML=`
      <div class="blocked-overlay">
        <div class="blocked-overlay-icon"><i class="fas fa-ban"></i></div>
        <div class="blocked-overlay-title">Operative Blocked</div>
        <div class="blocked-overlay-msg">You have blocked <strong>${esc(name)}</strong>.<br>Their profile and messages are hidden from you.</div>
        <button class="btn-unblock" id="vpUnblock" style="margin:14px auto 0;"><i class="fas fa-unlock"></i> Unblock ${esc(name)}</button>
      </div>`;
    openModal('profileModal');
    document.getElementById('vpUnblock').addEventListener('click',()=>unblockUser(u.id,name));
    return;
  }
  let isFriend=false,pendingSent=false,pendingReceived=false;
  if(isLoggedIn&&currentUser.uid!==u.id){
    try{
      const meSnap=await db.collection('users').doc(currentUser.uid).get();
      currentUserData=meSnap.data();
      isFriend=(currentUserData?.friends||[]).includes(u.id);
      const sentSnap=await db.collection('friendRequests').where('from','==',currentUser.uid).where('to','==',u.id).get();
      pendingSent=sentSnap.docs.some(d=>d.data().status==='pending');
      const recvSnap=await db.collection('friendRequests').where('from','==',u.id).where('to','==',currentUser.uid).get();
      pendingReceived=recvSnap.docs.some(d=>d.data().status==='pending');
    }catch(e){console.error('openViewProfile lookup:',e);}
  }
  const viewerIsGuest=currentUser?.isAnonymous||currentUserData?.isAnonymous;
  const statusLabel=STATUS_LABELS[u.status]||u.status||'offline';
  let actions='';
  if(isLoggedIn&&currentUser.uid!==u.id){
    if(viewerIsGuest) actions=`<button class="btn-sm secondary" id="vpGuestPrompt" style="font-size:.65rem;"><i class="fas fa-user-plus"></i> Connect — Free Account Required</button>`;
    else if(isFriend) actions=`<button class="btn-sm danger" id="vpUnfriend"><i class="fas fa-user-minus"></i> Remove</button><button class="btn-sm" id="vpMsg"><i class="fas fa-comment"></i> Message</button>`;
    else if(pendingSent) actions=`<button class="btn-sm secondary" disabled><i class="fas fa-clock"></i> Request Sent</button>`;
    else if(pendingReceived) actions=`<button class="btn-sm" id="vpAccept"><i class="fas fa-check"></i> Accept Request</button>`;
    else actions=`<button class="btn-sm" id="vpSendReq"><i class="fas fa-user-plus"></i> Send Request</button>`;
  }
  const joinDate=u.createdAt?.toDate?.();
  const joinStr=joinDate?joinDate.toLocaleDateString([],{month:'long',year:'numeric'}):'Unknown';
  const friendCount=(u.friends||[]).length;
  const badgeCount=(u.badges||[]).length;
  // Report/block row
  const showDangerRow=isLoggedIn&&!viewerIsGuest&&currentUser.uid!==u.id;
  const alreadyBlocked=isBlocked(u.id);
  content.innerHTML=`
    <div class="profile-modal-hero${u.bannerURL?' has-banner':''}" ${u.bannerURL?`style="--banner:url('${esc(u.bannerURL)}');"`:''}>
      ${u.bannerURL?'<div class="profile-banner-overlay"></div>':''}
      <div class="profile-hero-top">
        <div class="profile-hero-av">${photo?`<img src="${esc(photo)}" alt="${esc(name)}" loading="lazy">`:`${initials(name)}`}</div>
        <div class="profile-hero-info">
          <div class="profile-hero-name">${nameHtml(u,name)}</div>
          ${titleHtml(u)}
          <div class="profile-hero-rank"><span class="${rankClass(u.rank)}">${esc(u.rank||'Member')}</span></div>
          ${levelHtml(u)}
          <div class="profile-hero-status"><span class="status-dot ${u.status||'offline'}"></span><span>${statusLabel}</span></div>
          ${u.activityStatus?`<div class="profile-activity-pill"><i class="fas fa-circle-notch" style="font-size:.55rem;opacity:.5;"></i> ${esc(u.activityStatus)}</div>`:''}
        </div>
      </div>
      ${actions?`<div class="profile-action-row" style="margin-top:4px;">${actions}</div>`:''}
      <div class="profile-stats-row">
        <div class="profile-stat"><div class="profile-stat-num">${friendCount}</div><div class="profile-stat-lbl">Connections</div></div>
        <div class="profile-stat"><div class="profile-stat-num">${badgeCount}</div><div class="profile-stat-lbl">Badges</div></div>
        <div class="profile-stat"><div class="profile-stat-num" style="font-size:.75rem;">${joinStr}</div><div class="profile-stat-lbl">Joined</div></div>
      </div>
    </div>
    <div class="profile-bio-section">
      <div class="profile-section-label"><i class="fas fa-align-left" style="margin-right:4px;"></i>About</div>
      <div class="profile-bio-text">${esc(u.bio||'No bio set yet.')}</div>
    </div>
    ${(u.badges||[]).length?`<div class="profile-bio-section"><div class="profile-section-label"><i class="fas fa-medal" style="margin-right:4px;"></i>Badges</div>${renderBadges(u.badges)}</div>`:''}
    <div class="profile-bio-section">
      <div class="profile-section-label"><i class="fas fa-th" style="margin-right:4px;"></i>Activity (last 12 weeks)</div>
      <div id="vpHeatmap"><div class="loading-spinner" style="grid-column:unset;padding:10px 0;"></div></div>
    </div>
    <div class="profile-bio-section" id="vpOpHistorySection">
      <div class="profile-section-label"><i class="fas fa-crosshairs" style="margin-right:4px;"></i>Op History</div>
      <div id="vpOpHistory"><div class="loading-spinner" style="grid-column:unset;padding:10px 0;"></div></div>
    </div>
    ${showDangerRow?`<div class="profile-danger-row">
      <button class="btn-report" id="vpReport"><i class="fas fa-flag"></i> Report</button>
      ${alreadyBlocked
        ?`<button class="btn-unblock" id="vpUnblock"><i class="fas fa-unlock"></i> Unblock</button>`
        :`<button class="btn-block" id="vpBlock"><i class="fas fa-ban"></i> Block</button>`}
    </div>`:''}`;
  openModal('profileModal');
  loadOpHistory(u.id,'vpOpHistory');
  loadActivityHeatmap(u.id,'vpHeatmap');
  if(isLoggedIn&&currentUser.uid!==u.id){
    document.getElementById('vpGuestPrompt')?.addEventListener('click',()=>{closeModal('profileModal');promptGuestRegister('Create a free account to connect with operatives and send messages.');});
    document.getElementById('vpSendReq')?.addEventListener('click',()=>sendFriendRequest(u.id,name));
    document.getElementById('vpAccept')?.addEventListener('click',()=>acceptFriendRequest(u.id,name));
    document.getElementById('vpUnfriend')?.addEventListener('click',()=>removeFriend(u.id,name));
    document.getElementById('vpMsg')?.addEventListener('click',()=>{closeModal('profileModal');openChat(u);});
    document.getElementById('vpReport')?.addEventListener('click',()=>{closeModal('profileModal');openReportModal(u.id,name);});
    document.getElementById('vpBlock')?.addEventListener('click',()=>blockUser(u.id,name));
    document.getElementById('vpUnblock')?.addEventListener('click',()=>unblockUser(u.id,name));
  }
}
/* ── FRIEND REQUEST SYSTEM ── */
/* ── GUEST REGISTER PROMPT ── */
function promptGuestRegister(reason){
  // Reuse login modal
  clearError();
  const lf=document.getElementById('loginForm'),rf=document.getElementById('registerForm');
  lf.style.display='none';rf.style.display='flex';
  document.getElementById('modalTitle').textContent='Create Account';
  document.getElementById('toggleForm').textContent='Already have an account? Login here';
  document.getElementById('forgotLinkWrap').style.display='none';
  // Show reason
  const el=document.getElementById('errorMessage');
  el.textContent=reason||'Create a free account to access all features.';
  el.style.display='block';
  el.style.color='var(--color-primary)';
  el.style.borderColor='rgba(192,192,192,.25)';
  el.style.background='rgba(192,192,192,.05)';
  openModal('loginModal');
}
async function sendFriendRequest(toUid,toName){
  if(!currentUser)return;
  // Check guest
  if(currentUser.isAnonymous||currentUserData?.isAnonymous){
    closeModal('profileModal');
    promptGuestRegister('Create a free account to connect with other operatives and send friend requests.');
    return;
  }
  const btn=document.getElementById('vpSendReq');
  if(btn){btn.disabled=true;btn.innerHTML='<i class="fas fa-spinner fa-spin"></i>';}
  try{
    await db.collection('friendRequests').add({
      from:currentUser.uid,
      fromName:currentUserData?.displayName||'Unknown',
      fromPhoto:currentUserData?.photoURL||'',
      to:toUid,
      status:'pending',
      createdAt:firebase.firestore.FieldValue.serverTimestamp()
    });
    closeModal('profileModal');
    showToast(`Friend request sent to ${toName}!`);
  }catch(err){
    console.error('sendFriendRequest error:',err);
    showToast(`Error: ${err.code==='permission-denied'?'Permission denied — check Firestore rules.':err.message}`);
    if(btn){btn.disabled=false;btn.innerHTML='<i class="fas fa-user-plus"></i> Send Request';}
  }
}
async function acceptFriendRequest(fromUid,fromName){
  if(!currentUser)return;
  try{
    // Mark request accepted
    const reqSnap=await db.collection('friendRequests').where('from','==',fromUid).where('to','==',currentUser.uid).get();
    const pendingDocs=reqSnap.docs.filter(d=>d.data().status==='pending');
    for(const d of pendingDocs){
      await db.collection('friendRequests').doc(d.id).update({status:'accepted'});
    }
    // Add to current user's friends
    await db.collection('users').doc(currentUser.uid).update({
      friends:firebase.firestore.FieldValue.arrayUnion(fromUid)
    });
    // Add to other user's friends
    await db.collection('users').doc(fromUid).update({
      friends:firebase.firestore.FieldValue.arrayUnion(currentUser.uid)
    });
    currentUserData=(await db.collection('users').doc(currentUser.uid).get()).data();
    closeModal('profileModal');
    closeModal('notifModal');
    showToast(`You are now connected with ${fromName}!`);
    updateNotifBadge();
    writeCorpLog('connection',`connected with ${fromName}`);
    // Award points
    db.collection('users').doc(currentUser.uid).update({points:firebase.firestore.FieldValue.increment(10)}).catch(()=>{});
  }catch(err){
    console.error('acceptFriendRequest error:',err);
    showToast(err.code==='permission-denied'
      ?'Permission denied — make sure you published the updated Firestore rules.'
      :`Error: ${err.message}`);
  }
}
async function declineFriendRequest(reqId){
  try{
    await db.collection('friendRequests').doc(reqId).update({status:'declined'});
    showToast('Request declined.');
    updateNotifBadge();
    openNotifications();
  }catch(err){console.error('declineFriendRequest error:',err);}
}
async function removeFriend(uid,name){
  if(!currentUser)return;
  try{
    // Update friends field
    await db.collection('users').doc(currentUser.uid).update({
      friends:firebase.firestore.FieldValue.arrayRemove(uid)
    });
    await db.collection('users').doc(uid).update({
      friends:firebase.firestore.FieldValue.arrayRemove(currentUser.uid)
    }).catch(()=>{}); // non-critical
    currentUserData=(await db.collection('users').doc(currentUser.uid).get()).data();
    closeModal('profileModal');closeModal('myProfileModal');
    showToast(`Removed ${name} from connections.`);
  }catch(err){console.error('removeFriend error:',err);showToast('Failed to remove.');}
}
/* ── NOTIFICATIONS ── */
const ADMIN_RANKS=['Founder','Administrator','Co-Administrator'];
const OWNER_UID='QZ62mytbllhPt7wWkv6gKtmz31l1';
function isAdmin(data){return (currentUser&&currentUser.uid===OWNER_UID)||data&&ADMIN_RANKS.includes(data.rank);}
// Panel access
function canOpenPanel(data){return (currentUser&&currentUser.uid===OWNER_UID)||data&&[...ADMIN_RANKS,'Developer','Moderator'].includes(data.rank);}
function rankClass(rank){
  const r=(rank||'').toLowerCase();
  if(r==='founder')return'rank-badge-founder';
  if(r==='administrator')return'rank-badge-admin';
  if(r==='co-administrator')return'rank-badge-coadmin';
  if(r==='developer')return'rank-badge-dev';
  if(r==='moderator')return'rank-badge-mod';
  if(r==='beta tester')return'rank-badge-beta';
  if(r==='unaffiliated')return'rank-badge-unaffiliated';
  if(r==='guest')return'rank-badge-guest';
  return'rank-badge-member';
}
// Unread message tracking
let unreadMsgUnsub=null;
const readMsgTimestamps={}; // per-session tracking
async function updateNotifBadge(){
  if(!currentUser)return;
  try{
    const [reqSnap,msgSnap,annSnap]=await Promise.all([
      db.collection('friendRequests').where('to','==',currentUser.uid).get(),
      db.collection('notifications').where('to','==',currentUser.uid).where('type','==','message').where('read','==',false).get(),
      db.collection('notifications').where('to','==',currentUser.uid).where('type','==','announcement').where('read','==',false).get()
    ]);
    const reqCount=reqSnap.docs.filter(d=>d.data().status==='pending').length;
    const msgCount=msgSnap.size;
    const annCount=annSnap.size;
    const total=reqCount+msgCount+annCount;
    const badge=document.getElementById('notifBadge');
    if(total>0){badge.textContent=total>9?'9+':total;badge.classList.add('show');}
    else{badge.classList.remove('show');}
  }catch(e){console.error('Badge error:',e);}
}
let _lastNotifTab='requests';
async function openNotifications(){
  openModal('notifModal');
  // Sync tab UI with the tab we're about to load
  document.querySelectorAll('.notif-tab').forEach(b=>{
    b.classList.toggle('active',b.dataset.ntab===_lastNotifTab);
  });
  loadNotifTab(_lastNotifTab);
  // Setup tabs
  document.querySelectorAll('.notif-tab').forEach(btn=>{
    btn.onclick=()=>{
      document.querySelectorAll('.notif-tab').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      _lastNotifTab=btn.dataset.ntab;
      loadNotifTab(btn.dataset.ntab);
    };
  });
}
async function loadNotifTab(tab){
  if(tab==='requests') await loadRequestsTab();
  else if(tab==='messages') await loadMsgNotifTab();
  else if(tab==='announcements') await loadAnnNotifTab();
  // Update tab badges
  try{
    const [reqSnap,msgSnap]=await Promise.all([
      db.collection('friendRequests').where('to','==',currentUser.uid).get(),
      db.collection('notifications').where('to','==',currentUser.uid).where('type','==','message').where('read','==',false).get()
    ]);
    const reqCount=reqSnap.docs.filter(d=>d.data().status==='pending').length;
    const reqBadge=document.getElementById('reqBadge');
    if(reqBadge)reqBadge.textContent=reqCount>0?reqCount:'';
    const msgBadge=document.getElementById('msgNotifBadge');
    if(msgBadge)msgBadge.textContent=msgSnap.size>0?msgSnap.size:'';
  }catch(_){}
}
async function loadRequestsTab(){
  const list=document.getElementById('notifList');
  list.innerHTML='<div class="loading-spinner" style="grid-column:unset;padding:20px 0;"></div>';
  document.getElementById('notifTabRequests').style.display='';
  document.getElementById('notifTabMessages').style.display='none';
  document.getElementById('notifTabAnnouncements').style.display='none';
  try{
    const snap=await db.collection('friendRequests').where('to','==',currentUser.uid).get();
    const pending=snap.docs.filter(d=>d.data().status==='pending').sort((a,b)=>(b.data().createdAt?.toMillis?.()||0)-(a.data().createdAt?.toMillis?.()||0));
    list.innerHTML='';
    if(!pending.length){list.innerHTML='<div class="notif-empty">No pending requests.</div>';return;}
    pending.forEach(d=>{
      const req=d.data(),reqId=d.id;
      const item=document.createElement('div');item.className='notif-item';
      item.innerHTML=`<div class="notif-av">${avHtml(req.fromPhoto,req.fromName)}</div><div class="notif-info"><div class="notif-text"><strong>${esc(req.fromName||'Someone')}</strong> sent you a connection request.</div><div class="notif-actions"><button class="btn-sm" style="padding:5px 10px;font-size:.65rem;" data-uid="${req.from}" data-name="${esc(req.fromName||'them')}"><i class="fas fa-check"></i> Accept</button><button class="btn-sm danger" style="padding:5px 10px;font-size:.65rem;" data-rid="${reqId}"><i class="fas fa-times"></i> Decline</button></div></div>`;
      item.querySelector('[data-uid]').addEventListener('click',async function(){await acceptFriendRequest(this.dataset.uid,this.dataset.name);loadRequestsTab();});
      item.querySelector('[data-rid]').addEventListener('click',async function(){await declineFriendRequest(this.dataset.rid);loadRequestsTab();});
      list.appendChild(item);
    });
  }catch(err){console.error(err);document.getElementById('notifList').innerHTML=`<div class="notif-empty" style="color:#f55;">Error: ${err.code||err.message}</div>`;}
}
let _notifMsgFilter='all';
async function loadMsgNotifTab(){
  const list=document.getElementById('notifMsgList');
  list.innerHTML='<div class="loading-spinner" style="grid-column:unset;padding:20px 0;"></div>';
  document.getElementById('notifTabRequests').style.display='none';
  document.getElementById('notifTabMessages').style.display='';
  document.getElementById('notifTabAnnouncements').style.display='none';
  try{
    const snap=await db.collection('notifications').where('to','==',currentUser.uid).where('type','==','message').get();
    let items=snap.docs.sort((a,b)=>(b.data().createdAt?.toMillis?.()||0)-(a.data().createdAt?.toMillis?.()||0));
    if(_notifMsgFilter==='unread')items=items.filter(d=>!d.data().read);
    list.innerHTML='';
    if(!items.length){list.innerHTML=`<div class="notif-empty">${_notifMsgFilter==='unread'?'All caught up. No unread messages.':'No message notifications.'}</div>`;return;}
    for(const d of items){
      const n=d.data();
      const item=document.createElement('div');
      item.className='notif-item'+(n.read?'':' unread');
      item.style.cursor='pointer';
      item.innerHTML=`<div class="notif-av">${avHtml(n.fromPhoto,n.fromName)}</div><div class="notif-info"><div class="notif-text"><strong>${esc(n.fromName||'Someone')}</strong> sent you a message.</div><div class="notif-text" style="margin-top:3px;font-size:.7rem;color:var(--color-text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(n.preview||'')}</div><div class="notif-actions" style="margin-top:5px;"><span style="font-family:var(--font-mono);font-size:.62rem;color:rgba(192,192,192,.35);">${n.createdAt?fmtDate(n.createdAt):''}</span></div></div>${!n.read?'<div class="ann-unread-dot"></div>':''}<button class="notif-dismiss" data-id="${d.id}" title="Dismiss" style="background:none;border:none;color:var(--color-text-muted);font-size:.8rem;cursor:pointer;padding:2px 4px;flex-shrink:0;line-height:1;transition:var(--transition);" onmouseover="this.style.color='#f55'" onmouseout="this.style.color='var(--color-text-muted)'">&#x2715;</button>`;
      item.querySelector('.notif-dismiss').addEventListener('click',async e=>{
        e.stopPropagation();
        await db.collection('notifications').doc(e.currentTarget.dataset.id).delete().catch(()=>{});
        item.style.transition='opacity .2s';item.style.opacity='0';
        setTimeout(()=>item.remove(),200);
        updateNotifBadge();
      });
      item.addEventListener('click',async e=>{
        if(e.target.classList.contains('notif-dismiss'))return;
        await db.collection('notifications').doc(d.id).update({read:true}).catch(()=>{});
        const senderSnap=await db.collection('users').doc(n.fromUid).get();
        if(senderSnap.exists){closeModal('notifModal');openChat({...senderSnap.data(),id:n.fromUid});}
      });
      list.appendChild(item);
    }
    updateNotifBadge();
  }catch(err){console.error(err);list.innerHTML=`<div class="notif-empty" style="color:#f55;">Error: ${err.code||err.message}</div>`;}
}
async function loadAnnNotifTab(){
  const list=document.getElementById('notifAnnList');
  list.innerHTML='<div class="loading-spinner" style="grid-column:unset;padding:20px 0;"></div>';
  document.getElementById('notifTabRequests').style.display='none';
  document.getElementById('notifTabMessages').style.display='none';
  document.getElementById('notifTabAnnouncements').style.display='';
  try{
    const snap=await db.collection('announcements').orderBy('createdAt','desc').limit(20).get();
    // Mark announcement notifs as read
    db.collection('notifications').where('to','==',currentUser.uid).where('type','==','announcement').where('read','==',false).get()
      .then(s=>s.docs.forEach(d=>db.collection('notifications').doc(d.id).update({read:true}).catch(()=>{}))).catch(()=>{});
    list.innerHTML='';
    if(snap.empty){list.innerHTML='<div class="notif-empty">No announcements yet.</div>';return;}
    // Get user's dismissed list
    const dismissed=currentUserData?.dismissedAnnouncements||[];
    let shownCount=0;
    snap.forEach(d=>{
      if(dismissed.includes(d.id))return;
      shownCount++;
      const a=d.data();
      const item=document.createElement('div');item.className='ann-item';
      item.style.position='relative';
      item.innerHTML=`<button class="notif-dismiss" title="Dismiss" style="position:absolute;top:8px;right:8px;background:none;border:none;color:var(--color-text-muted);font-size:.8rem;cursor:pointer;padding:2px 4px;line-height:1;transition:var(--transition);" onmouseover="this.style.color='#f55'" onmouseout="this.style.color='var(--color-text-muted)'">&#x2715;</button><div class="ann-item-title">${esc(a.title||'Announcement')}</div><div class="ann-item-body">${esc(a.body||'')}</div><div class="ann-item-meta"><span>— ${esc(a.authorName||'Admin')}</span><span>${a.createdAt?fmtDate(a.createdAt):''}</span></div>`;
      item.querySelector('.notif-dismiss').addEventListener('click',async()=>{
        // Update dismissed
        await db.collection('users').doc(currentUser.uid).update({
          dismissedAnnouncements:firebase.firestore.FieldValue.arrayUnion(d.id)
        }).catch(()=>{});
        if(currentUserData)currentUserData.dismissedAnnouncements=[...(currentUserData.dismissedAnnouncements||[]),d.id];
        db.collection('notifications').where('to','==',currentUser.uid).where('type','==','announcement').get()
          .then(s=>s.docs.forEach(nd=>db.collection('notifications').doc(nd.id).update({read:true}).catch(()=>{}))).catch(()=>{});
        item.style.transition='opacity .2s';item.style.opacity='0';
        setTimeout(()=>item.remove(),200);
        updateNotifBadge();
      });
      list.appendChild(item);
    });
    if(!shownCount){list.innerHTML='<div class="notif-empty">No announcements. All caught up!</div>';}
    updateNotifBadge();
  }catch(err){
    // Unsorted fallback
    try{
      const snap2=await db.collection('announcements').get();
      list.innerHTML='';
      const docs=snap2.docs.sort((a,b)=>(b.data().createdAt?.toMillis?.()||0)-(a.data().createdAt?.toMillis?.()||0));
      if(!docs.length){list.innerHTML='<div class="notif-empty">No announcements yet.</div>';return;}
      docs.forEach(d=>{const a=d.data();const item=document.createElement('div');item.className='ann-item';item.style.position='relative';item.innerHTML=`<button class="notif-dismiss" title="Dismiss" style="position:absolute;top:8px;right:8px;background:none;border:none;color:var(--color-text-muted);font-size:.8rem;cursor:pointer;padding:2px 4px;line-height:1;">&#x2715;</button><div class="ann-item-title">${esc(a.title||'Announcement')}</div><div class="ann-item-body">${esc(a.body||'')}</div><div class="ann-item-meta"><span>— ${esc(a.authorName||'Admin')}</span><span>${a.createdAt?fmtDate(a.createdAt):''}</span></div>`;item.querySelector('.notif-dismiss').addEventListener('click',()=>{item.style.transition='opacity .2s';item.style.opacity='0';setTimeout(()=>item.remove(),200);updateNotifBadge();});list.appendChild(item);});
    }catch(e2){list.innerHTML=`<div class="notif-empty" style="color:#f55;">Error: ${e2.code||e2.message}</div>`;}
  }
}
/* ── GLOBAL SEARCH ── */
let _searchDebounce=null;
async function runGlobalSearch(q){
  const out=document.getElementById('globalSearchResults');
  if(!q||q.length<2){
    out.innerHTML='<p style="font-family:var(--font-mono);font-size:.7rem;color:var(--color-text-muted);padding:14px 0;text-align:center;">Type at least 2 characters to search.</p>';
    return;
  }
  out.innerHTML='<div class="loading-spinner" style="grid-column:unset;padding:20px 0;"></div>';
  const ql=q.toLowerCase();
  try{
    const [usersSnap,missionsSnap,intelSnap,annSnap]=await Promise.all([
      db.collection('users').get(),
      db.collection('missions').get().catch(()=>({docs:[]})),
      db.collection('intelPosts').get().catch(()=>({docs:[]})),
      db.collection('announcements').get().catch(()=>({docs:[]}))
    ]);
    const users=usersSnap.docs.map(d=>({...d.data(),id:d.id})).filter(u=>!u.isAnonymous&&((u.displayName||'').toLowerCase().includes(ql)||(u.bio||'').toLowerCase().includes(ql)||(u.operatorTitle||'').toLowerCase().includes(ql))).slice(0,8);
    const missions=missionsSnap.docs.map(d=>({...d.data(),id:d.id})).filter(m=>(m.title||'').toLowerCase().includes(ql)||(m.description||'').toLowerCase().includes(ql)).slice(0,6);
    const intel=intelSnap.docs.map(d=>({...d.data(),id:d.id})).filter(p=>(p.title||'').toLowerCase().includes(ql)||(p.body||'').toLowerCase().includes(ql)).slice(0,6);
    const anns=annSnap.docs.map(d=>({...d.data(),id:d.id})).filter(a=>(a.title||'').toLowerCase().includes(ql)||(a.body||'').toLowerCase().includes(ql)).slice(0,4);
    let html='';
    if(users.length){
      html+='<div class="search-section"><div class="search-section-label">Members</div>';
      users.forEach(u=>{
        html+=`<button type="button" class="search-result" data-type="user" data-id="${esc(u.id)}"><div class="active-member-av">${avHtml(u.photoURL,u.displayName)}</div><div class="search-result-body"><strong>${nameHtml(u)}</strong><span>${esc(u.rank||'Member')} · ${esc((u.bio||'').slice(0,60))}</span></div></button>`;
      });
      html+='</div>';
    }
    if(missions.length){
      html+='<div class="search-section"><div class="search-section-label">Missions</div>';
      missions.forEach(m=>{
        html+=`<button type="button" class="search-result" data-type="mission" data-id="${esc(m.id)}"><div class="search-result-icon"><i class="fas fa-crosshairs"></i></div><div class="search-result-body"><strong>${esc(m.title||'Mission')}</strong><span>${esc((m.description||'').slice(0,80))}</span></div></button>`;
      });
      html+='</div>';
    }
    if(intel.length){
      html+='<div class="search-section"><div class="search-section-label">Intel</div>';
      intel.forEach(p=>{
        html+=`<button type="button" class="search-result" data-type="intel" data-id="${esc(p.id)}"><div class="search-result-icon"><i class="fas fa-satellite-dish"></i></div><div class="search-result-body"><strong>${esc(p.title||'Intel')}</strong><span>${esc((p.body||'').slice(0,80))}</span></div></button>`;
      });
      html+='</div>';
    }
    if(anns.length){
      html+='<div class="search-section"><div class="search-section-label">Announcements</div>';
      anns.forEach(a=>{
        html+=`<div class="search-result" style="cursor:default;"><div class="search-result-icon"><i class="fas fa-bullhorn"></i></div><div class="search-result-body"><strong>${esc(a.title||'')}</strong><span>${esc((a.body||'').slice(0,80))}</span></div></div>`;
      });
      html+='</div>';
    }
    if(!html)html='<p style="font-family:var(--font-mono);font-size:.7rem;color:var(--color-text-muted);padding:14px 0;text-align:center;">No matches.</p>';
    out.innerHTML=html;
    out.querySelectorAll('.search-result[data-type]').forEach(el=>{
      el.addEventListener('click',()=>{
        const type=el.dataset.type,id=el.dataset.id;
        closeModal('searchModal');
        if(type==='user'){
          const u=users.find(x=>x.id===id);if(u){if(currentUser&&u.id===currentUser.uid)openMyProfile();else openViewProfile(u);}
        }else if(type==='mission'){openEngagementHub('missions',id);}
        else if(type==='intel'){openEngagementHub('intel',id);}
      });
    });
  }catch(err){
    out.innerHTML=`<p style="font-family:var(--font-mono);font-size:.7rem;color:#f55;padding:14px 0;text-align:center;">Search failed: ${esc(err.message)}</p>`;
  }
}
document.getElementById('searchBtn').addEventListener('click',()=>{
  openModal('searchModal');
  setTimeout(()=>document.getElementById('globalSearchInput')?.focus(),50);
});
document.getElementById('closeSearch').addEventListener('click',()=>closeModal('searchModal'));
document.getElementById('globalSearchInput').addEventListener('input',e=>{
  const q=e.target.value.trim();
  if(_searchDebounce)clearTimeout(_searchDebounce);
  _searchDebounce=setTimeout(()=>runGlobalSearch(q),200);
});
document.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key==='k'){
    e.preventDefault();
    document.getElementById('searchBtn').click();
  }
});
document.getElementById('notifBtn').addEventListener('click',e=>{
  e.stopPropagation();
  if(!currentUser){showToast('Log in to view notifications.');return;}
  if(currentUser.isAnonymous||currentUserData?.isAnonymous){
    promptGuestRegister('Create a free account to get notifications, add friends, and message people.');
    return;
  }
  openNotifications();
});
// Notif message filter buttons
document.querySelectorAll('.notif-filter-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.notif-filter-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    _notifMsgFilter=btn.dataset.nfilter;
    loadMsgNotifTab();
  });
});
// Mark all read button
document.getElementById('markAllReadBtn').addEventListener('click',async()=>{
  if(!currentUser)return;
  try{
    const snap=await db.collection('notifications').where('to','==',currentUser.uid).where('read','==',false).get();
    const batch=db.batch();
    snap.forEach(d=>batch.update(d.ref,{read:true}));
    await batch.commit();
    // Update badge
    updateNotifBadge();
    showToast('All notifications marked as read.');
    // Reload current tab
    const activeTab=document.querySelector('.notif-tab.active');
    if(activeTab)loadNotifTab(activeTab.dataset.ntab);
  }catch(err){console.error(err);}
});
/* ── MESSAGE POPUP TOAST ── */
let msgToastTimer=null;
function showMsgToast(senderName,senderPhoto,preview,senderUid){
  const toast=document.getElementById('msgNotifToast');
  document.getElementById('msgNotifAv').innerHTML=avHtml(senderPhoto,senderName);
  document.getElementById('msgNotifName').textContent=senderName||'New message';
  document.getElementById('msgNotifPreview').textContent=preview||'';
  toast.classList.add('show');
  clearTimeout(msgToastTimer);
  msgToastTimer=setTimeout(()=>toast.classList.remove('show'),5000);
  toast.onclick=async e=>{
    if(e.target.id==='msgToastDismiss'){toast.classList.remove('show');return;}
    toast.classList.remove('show');
    const snap=await db.collection('users').doc(senderUid).get();
    if(snap.exists)openChat({...snap.data(),id:senderUid});
  };
}
/* ── MESSAGING ── */
let currentChatUid=null;
async function openChat(otherUser){
  if(!currentUser)return;
  // Guests cannot message
  if(currentUser.isAnonymous||currentUserData?.isAnonymous){
    promptGuestRegister('Create a free account to message other operatives.');
    return;
  }
  // Verify friendship
  const friends=(currentUserData?.friends)||[];
  if(!friends.includes(otherUser.id)){
    // Re-fetch in case cache is stale
    const meSnap=await db.collection('users').doc(currentUser.uid).get();
    currentUserData=meSnap.data();
    if(!(currentUserData?.friends||[]).includes(otherUser.id)){
      showToast('You can only message connections.');return;
    }
  }
  currentChatUid=otherUser.id;
  if(msgUnsubscribe){msgUnsubscribe();msgUnsubscribe=null;}
  const hav=document.getElementById('msgHeaderAv');
  hav.innerHTML=avHtml(otherUser.photoURL,otherUser.displayName);
  document.getElementById('msgHeaderName').textContent=otherUser.displayName||'Unknown';
  const statusEl=document.getElementById('msgHeaderStatus');
  statusEl.textContent=(otherUser.status||'offline');
  statusEl.className='msg-header-status'+(otherUser.status==='online'?' online':'');
  document.getElementById('msgBody').innerHTML='<div class="loading-spinner" style="grid-column:unset;align-self:center;margin:auto;"></div>';
  document.getElementById('msgInput').value='';
  openModal('msgModal');
  const cid=chatId(currentUser.uid,otherUser.id);
  // Ensure chat doc exists so the participants check in message rules can resolve
  await db.collection('chats').doc(cid).set({
    participants:[currentUser.uid,otherUser.id]
  },{merge:true}).catch(()=>{});
  msgUnsubscribe=db.collection('chats').doc(cid).collection('messages').orderBy('createdAt','asc').onSnapshot(snap=>{
    renderMessages(snap.docs);
  },err=>{
    console.error('Chat listener error:',err);
    document.getElementById('msgBody').innerHTML=`<p style="font-family:var(--font-mono);font-size:.75rem;color:#f55;text-align:center;margin:auto;">Could not load messages (${err.code||err.message}). Make sure Firestore rules are published.</p>`;
  });
  // Typing indicator listener (other side)
  if(typingUnsub){typingUnsub();typingUnsub=null;}
  typingUnsub=db.collection('chats').doc(cid).onSnapshot(d=>{
    const data=d.data()||{};
    const t=data.typing?.[otherUser.id]?.toMillis?.()||0;
    const fresh=Date.now()-t<6000;
    const indicator=document.getElementById('msgTypingIndicator');
    if(indicator)indicator.style.display=fresh?'flex':'none';
  });
}
let typingUnsub=null,typingTimeout=null,_lastTypingPing=0;
function pingTyping(){
  if(!currentUser||!currentChatUid)return;
  const now=Date.now();
  if(now-_lastTypingPing<2000)return; // throttle to once per 2s
  _lastTypingPing=now;
  const cid=chatId(currentUser.uid,currentChatUid);
  db.collection('chats').doc(cid).update({
    [`typing.${currentUser.uid}`]:firebase.firestore.FieldValue.serverTimestamp()
  }).catch(()=>{});
}
function clearTypingPing(){
  if(!currentUser||!currentChatUid)return;
  const cid=chatId(currentUser.uid,currentChatUid);
  db.collection('chats').doc(cid).update({
    [`typing.${currentUser.uid}`]:firebase.firestore.FieldValue.delete()
  }).catch(()=>{});
}
function renderMessages(docs){
  const body=document.getElementById('msgBody');
  body.innerHTML='';
  if(!docs.length){
    const p=document.createElement('p');p.style.cssText='font-family:var(--font-mono);font-size:.75rem;color:var(--color-text-muted);text-align:center;margin:auto;';p.textContent='No messages yet. Say hello!';body.appendChild(p);return;
  }
  const canDelete=isCoAdmin(currentUserData);
  const cid=chatId(currentUser.uid,currentChatUid);
  let lastDate='';
  docs.forEach(d=>{
    const m=d.data(),isMine=m.sender===currentUser.uid;
    const ds=m.createdAt?fmtDate(m.createdAt):'';
    if(ds&&ds!==lastDate){lastDate=ds;const div=document.createElement('div');div.className='msg-date-div';div.textContent=ds;body.appendChild(div);}
    const wrap=document.createElement('div');wrap.style.cssText='position:relative;display:flex;align-items:flex-end;gap:4px;'+(isMine?'justify-content:flex-end;':'');
    const bub=document.createElement('div');bub.className='msg-bubble '+(isMine?'mine':'theirs');
    bub.innerHTML=`${esc(m.text||'')}<span class="msg-time">${fmtTime(m.createdAt)}</span>`;
    // Delete check
    if(canDelete||isMine){
      const delBtn=document.createElement('button');
      delBtn.style.cssText='background:none;border:none;color:rgba(244,67,54,.4);font-size:.6rem;cursor:pointer;padding:2px;opacity:0;transition:opacity .2s;flex-shrink:0;';
      delBtn.title='Delete message';delBtn.innerHTML='<i class="fas fa-trash"></i>';
      wrap.addEventListener('mouseenter',()=>{delBtn.style.opacity='1';});
      wrap.addEventListener('mouseleave',()=>{delBtn.style.opacity='0';});
      delBtn.addEventListener('click',async()=>{
        if(!confirm('Delete this message?'))return;
        await db.collection('chats').doc(cid).collection('messages').doc(d.id).delete().catch(e=>showToast(e.message));
      });
      if(isMine)wrap.appendChild(bub),wrap.appendChild(delBtn);
      else wrap.appendChild(delBtn),wrap.appendChild(bub);
    }else{
      wrap.appendChild(bub);
    }
    body.appendChild(wrap);
  });
  body.scrollTop=body.scrollHeight;
}
async function sendMessage(){
  if(!currentUser||!currentChatUid)return;
  const input=document.getElementById('msgInput');
  const text=input.value.trim();if(!text)return;
  input.value='';
  clearTypingPing();
  const cid=chatId(currentUser.uid,currentChatUid);
  try{
    // Ensure chat doc exists (participants needed by message create rule)
    await db.collection('chats').doc(cid).set({
      participants:[currentUser.uid,currentChatUid],
      lastMessage:text,
      lastAt:firebase.firestore.FieldValue.serverTimestamp()
    },{merge:true});
    await db.collection('chats').doc(cid).collection('messages').add({
      sender:currentUser.uid,
      senderName:currentUserData?.displayName||'Unknown',
      text,
      createdAt:firebase.firestore.FieldValue.serverTimestamp()
    });
    // Write notification
    db.collection('notifications').add({
      to:currentChatUid,
      type:'message',
      fromUid:currentUser.uid,
      fromName:currentUserData?.displayName||'Unknown',
      fromPhoto:currentUserData?.photoURL||'',
      preview:text.length>60?text.slice(0,60)+'…':text,
      read:false,
      createdAt:firebase.firestore.FieldValue.serverTimestamp()
    }).catch(()=>{});
  }catch(err){
    console.error('sendMessage error:',err);
    input.value=text;
    showToast(`Could not send message (${err.code==='permission-denied'?'Permission denied — check Firestore rules':err.message})`);
  }
}
document.getElementById('msgSendBtn').addEventListener('click',sendMessage);
document.getElementById('msgInput').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();}});
document.getElementById('msgInput').addEventListener('input',()=>{
  pingTyping();
  if(typingTimeout)clearTimeout(typingTimeout);
  typingTimeout=setTimeout(clearTypingPing,4000);
});
/* ── MY PROFILE ── */
async function openMyProfile(){
  if(!currentUser)return;
  try{
    currentUserData=(await db.collection('users').doc(currentUser.uid).get()).data()||{};
    const d=currentUserData;
    const isGuest=currentUser.isAnonymous||d.isAnonymous;
    document.getElementById('myProfileDisplayName').textContent=d.displayName||'Guest';
    const rankEl=document.getElementById('myProfileRank');
    rankEl.textContent=isGuest?(d.rank||'Unaffiliated'):d.rank||'Member';
    rankEl.className=rankClass(d.rank);
    document.getElementById('editDisplayName').value=d.displayName||'';
    document.getElementById('editBio').value=d.bio||'';
    document.getElementById('editPhotoURL').value=d.photoURL||'';
    const actEl=document.getElementById('editActivityStatus');
    if(actEl)actEl.value=d.activityStatus||'';
    const titleEl=document.getElementById('editTitle');
    if(titleEl)titleEl.value=d.operatorTitle||'';
    const picker=document.getElementById('accentPicker');
    if(picker){
      const cur=d.accentColor||'';
      picker.querySelectorAll('.accent-swatch').forEach(s=>{
        s.classList.toggle('selected',(s.dataset.accent||'')===cur);
      });
    }
    const bannerEl=document.getElementById('editBannerURL');
    if(bannerEl)bannerEl.value=d.bannerURL||'';
    document.getElementById('profileSaveSuccess').style.display='none';
    const imgEl=document.getElementById('editAvatarImg'),phEl=document.getElementById('editAvatarPlaceholder');
    if(d.photoURL){imgEl.src=d.photoURL;imgEl.style.display='block';phEl.style.display='none';}
    else{imgEl.style.display='none';phEl.style.display='flex';phEl.textContent=initials(d.displayName||'G');}
    document.getElementById('editPhotoURL').oninput=function(){if(this.value){imgEl.src=this.value;imgEl.style.display='block';phEl.style.display='none';}else{imgEl.style.display='none';phEl.style.display='flex';}};
    // Status buttons
    document.querySelectorAll('[data-pstatus]').forEach(btn=>{
      const isActive=btn.dataset.pstatus===(d.status||'online');
      btn.style.fontWeight=isActive?'700':'400';btn.style.opacity=isActive?'1':'.55';
      btn.onclick=()=>{setUserStatus(btn.dataset.pstatus);document.querySelectorAll('[data-pstatus]').forEach(b=>{b.style.fontWeight='400';b.style.opacity='.55';});btn.style.fontWeight='700';btn.style.opacity='1';};
    });
    // Guest lock
    const saveBtn=document.getElementById('saveProfileBtn');
    const editFields=['editDisplayName','editBio','editPhotoURL','editActivityStatus'];
    if(isGuest){
      saveBtn.disabled=true;saveBtn.title='Guest accounts cannot edit their profile.';
      editFields.forEach(id=>{const el=document.getElementById(id);if(el){el.disabled=true;el.classList.add('input-locked');}});
      document.getElementById('editAvatarBtn').classList.add('locked');
      let gn=document.getElementById('guestProfileNotice');
      if(!gn){gn=document.createElement('p');gn.id='guestProfileNotice';gn.style.cssText='font-family:var(--font-mono);font-size:.72rem;color:#ff6b35;background:rgba(255,107,53,.07);border:1px solid rgba(255,107,53,.2);border-radius:3px;padding:8px 10px;margin-top:8px;line-height:1.6;';gn.innerHTML='<i class="fas fa-lock" style="margin-right:5px;"></i>You\'re browsing as a <strong>Guest</strong>. <a href="#" id="guestRegisterLink" style="color:var(--color-primary);text-decoration:underline;">Create a free account</a> to customise your profile.';saveBtn.parentNode.insertBefore(gn,saveBtn.nextSibling);}
      document.getElementById('guestRegisterLink')?.addEventListener('click',e=>{e.preventDefault();closeModal('myProfileModal');promptGuestRegister('Create a free account to set up your profile and access all features.');});
    }else{
      saveBtn.disabled=false;saveBtn.title='';
      editFields.forEach(id=>{const el=document.getElementById(id);if(el){el.disabled=false;el.classList.remove('input-locked');}});
      document.getElementById('editAvatarBtn').classList.remove('locked');
      document.getElementById('guestProfileNotice')?.remove();
    }
    // Wire profile tabs
    document.querySelectorAll('.profile-edit-tab').forEach(tab=>{
      tab.onclick=async()=>{
        document.querySelectorAll('.profile-edit-tab').forEach(t=>t.classList.remove('active'));
        document.querySelectorAll('.profile-tab-section').forEach(s=>s.classList.remove('active'));
        tab.classList.add('active');
        const secId='profileTab'+tab.dataset.ptab.charAt(0).toUpperCase()+tab.dataset.ptab.slice(1);
        document.getElementById(secId)?.classList.add('active');
        if(tab.dataset.ptab==='preview')renderProfilePreview(d);
        if(tab.dataset.ptab==='connections'){
          await renderMyFriendsList(d.friends||[]);
          wireConnSubTabs(d);
        }
      };
    });
    // Reset to edit tab
    document.querySelectorAll('.profile-edit-tab').forEach(t=>t.classList.remove('active'));
    document.querySelectorAll('.profile-tab-section').forEach(s=>s.classList.remove('active'));
    document.querySelector('.profile-edit-tab[data-ptab="edit"]')?.classList.add('active');
    document.getElementById('profileTabEdit')?.classList.add('active');
    openModal('myProfileModal');
    renderMyFriendsList(d.friends||[]);
  }catch(err){console.error(err);}
}
function wireConnSubTabs(d){
  document.querySelectorAll('.conn-sub-tab').forEach(btn=>{
    // Set active style
    const isActive=btn.classList.contains('active');
    btn.style.color=isActive?'var(--color-primary)':'var(--color-text-muted)';
    btn.style.borderBottomColor=isActive?'var(--color-primary)':'transparent';
    btn.onclick=async()=>{
      document.querySelectorAll('.conn-sub-tab').forEach(b=>{
        b.classList.remove('active');b.style.color='var(--color-text-muted)';b.style.borderBottomColor='transparent';
      });
      btn.classList.add('active');btn.style.color='var(--color-primary)';btn.style.borderBottomColor='var(--color-primary)';
      const tab=btn.dataset.ctab;
      document.getElementById('connSubFriends').style.display=tab==='friends'?'':'none';
      document.getElementById('connSubBlocked').style.display=tab==='blocked'?'':'none';
      if(tab==='blocked')await renderBlockedList();
    };
  });
}
async function renderBlockedList(){
  const inner=document.getElementById('blockedListInner');
  if(!inner)return;
  const blocked=currentUserData?.blockedUsers||[];
  inner.innerHTML='';
  if(!blocked.length){
    inner.innerHTML='<p style="font-family:var(--font-mono);font-size:.75rem;color:var(--color-text-muted);text-align:center;padding:20px 0;">No blocked or hidden operatives.</p>';
    return;
  }
  for(const uid of blocked){
    try{
      const snap=await db.collection('users').doc(uid).get();
      const ud=snap.exists?snap.data():{displayName:'Unknown User',rank:'',photoURL:''};
      const card=document.createElement('div');card.className='connection-card';
      card.style.borderColor='rgba(244,67,54,.15)';
      card.innerHTML=`
        <div class="connection-av" style="border-color:rgba(244,67,54,.3);">
          ${ud.photoURL?`<img src="${esc(ud.photoURL)}" alt="" loading="lazy">`:`${initials(ud.displayName||'?')}`}
        </div>
        <div class="connection-info">
          <div class="connection-name" style="color:rgba(244,67,54,.7);">${esc(ud.displayName||'Unknown')}</div>
          <div class="connection-rank ${rankClass(ud.rank)}">${esc(ud.rank||'')}</div>
          <div class="connection-activity" style="color:rgba(244,67,54,.4);">Blocked</div>
        </div>
        <div class="connection-actions">
          <button class="btn-unblock" style="padding:4px 9px;font-size:.62rem;" data-uid="${uid}" data-name="${esc(ud.displayName||'?')}">
            <i class="fas fa-unlock"></i> Unblock
          </button>
        </div>`;
      card.querySelector('.btn-unblock').addEventListener('click',async function(){
        await unblockUser(this.dataset.uid,this.dataset.name);
        await renderBlockedList();
        // Refresh currentUserData
        currentUserData=(await db.collection('users').doc(currentUser.uid).get()).data();
      });
      inner.appendChild(card);
    }catch(_){}
  }
}
function renderProfilePreview(d){
  const el=document.getElementById('profilePreviewContent');if(!el)return;
  const statusLabel=STATUS_LABELS[d.status]||d.status||'offline';
  const joinDate=d.createdAt?.toDate?.();
  const joinStr=joinDate?joinDate.toLocaleDateString([],{month:'long',year:'numeric'}):'Unknown';
  el.innerHTML=`<p style="font-family:var(--font-mono);font-size:.65rem;color:rgba(192,192,192,.3);margin-bottom:10px;letter-spacing:.1em;">// HOW OTHERS SEE YOUR PROFILE</p>
    <div class="profile-modal-hero">
      <div class="profile-hero-top">
        <div class="profile-hero-av">${d.photoURL?`<img src="${esc(d.photoURL)}" alt="">`:`${initials(d.displayName||'?')}`}</div>
        <div class="profile-hero-info">
          <div class="profile-hero-name">${nameHtml(d)}</div>${titleHtml(d)}${levelHtml(d)}
          <div class="profile-hero-rank"><span class="${rankClass(d.rank)}">${esc(d.rank||'Member')}</span></div>
          <div class="profile-hero-status"><span class="status-dot ${d.status||'offline'}"></span><span>${statusLabel}</span></div>
          ${d.activityStatus?`<div class="profile-activity-pill"><i class="fas fa-circle-notch" style="font-size:.55rem;opacity:.5;"></i> ${esc(d.activityStatus)}</div>`:''}
        </div>
      </div>
      <div class="profile-stats-row">
        <div class="profile-stat"><div class="profile-stat-num">${(d.friends||[]).length}</div><div class="profile-stat-lbl">Connections</div></div>
        <div class="profile-stat"><div class="profile-stat-num">${(d.badges||[]).length}</div><div class="profile-stat-lbl">Badges</div></div>
        <div class="profile-stat"><div class="profile-stat-num" style="font-size:.75rem;">${joinStr}</div><div class="profile-stat-lbl">Joined</div></div>
      </div>
    </div>
    <div class="profile-bio-section"><div class="profile-section-label">About</div><div class="profile-bio-text">${esc(d.bio||'No bio set.')}</div></div>
    ${(d.badges||[]).length?`<div class="profile-bio-section"><div class="profile-section-label">Badges</div>${renderBadges(d.badges)}</div>`:''}`;
}
async function renderMyFriendsList(friendIds){
  const inner=document.getElementById('friendsListInner');
  document.getElementById('friendCount').textContent=friendIds.length;
  inner.innerHTML='';
  if(!friendIds.length){
    inner.innerHTML='<p style="font-family:var(--font-mono);font-size:.75rem;color:var(--color-text-muted);text-align:center;padding:20px 0;">No connections yet.<br>Find operatives in the member directory.</p>';
    return;
  }
  // Search filter
  const searchEl=document.getElementById('connectionsSearch');
  const q=searchEl?searchEl.value.trim().toLowerCase():'';
  if(searchEl&&!searchEl._wired){
    searchEl._wired=true;
    searchEl.addEventListener('input',()=>renderMyFriendsList(friendIds));
  }
  const snaps=await Promise.all(friendIds.map(fid=>db.collection('users').doc(fid).get().catch(()=>null)));
  for(let i=0;i<friendIds.length;i++){
    const fid=friendIds[i];
    const snap=snaps[i];
    if(!snap||!snap.exists)continue;
    const fd=snap.data();
    if(q&&!(fd.displayName||'').toLowerCase().includes(q))continue;
    const card=document.createElement('div');card.className='connection-card';
    const myNote=(currentUserData?.connectionNotes||{})[fid]||'';
    card.innerHTML=`
      <div class="connection-av">
        ${fd.photoURL?`<img src="${esc(fd.photoURL)}" alt="" loading="lazy">`:`${initials(fd.displayName)}`}
        <span class="connection-av-dot status-dot ${fd.status||'offline'}"></span>
      </div>
      <div class="connection-info">
        <div class="connection-name">${nameHtml(fd)}</div>
        <div class="connection-rank ${rankClass(fd.rank)}">${esc(fd.rank||'Member')}</div>
        ${fd.activityStatus?`<div class="connection-activity">"${esc(fd.activityStatus)}"</div>`:''}
        <div class="connection-note-row">
          <i class="fas fa-sticky-note" style="font-size:.6rem;opacity:.5;margin-right:4px;"></i>
          <input type="text" class="connection-note-input" data-uid="${fid}" maxlength="120" placeholder="Add a private note (only you see this)..." value="${esc(myNote)}">
        </div>
      </div>
      <div class="connection-actions">
        <button class="btn-sm" style="padding:5px 9px;font-size:.65rem;" title="Message"><i class="fas fa-comment"></i></button>
        <button class="btn-sm danger" style="padding:5px 9px;font-size:.65rem;" data-uid="${fid}" data-name="${esc(fd.displayName||'this user')}" title="Remove"><i class="fas fa-user-minus"></i></button>
      </div>`;
    card.querySelector('.connection-av').addEventListener('click',()=>{closeModal('myProfileModal');openViewProfile({...fd,id:fid});});
    card.querySelector('.connection-name').addEventListener('click',()=>{closeModal('myProfileModal');openViewProfile({...fd,id:fid});});
    card.querySelectorAll('.btn-sm:not(.danger)').forEach(btn=>btn.addEventListener('click',e=>{e.stopPropagation();closeModal('myProfileModal');openChat({...fd,id:fid});}));
    card.querySelector('.btn-sm.danger').addEventListener('click',async e=>{e.stopPropagation();const btn=e.currentTarget;await removeFriend(btn.dataset.uid,btn.dataset.name);await openMyProfile();});
    const noteInput=card.querySelector('.connection-note-input');
    if(noteInput){
      noteInput.addEventListener('click',e=>e.stopPropagation());
      noteInput.addEventListener('blur',async()=>{
        const newVal=noteInput.value.trim();
        const uid=noteInput.dataset.uid;
        const cur=(currentUserData?.connectionNotes||{})[uid]||'';
        if(newVal===cur)return;
        try{
          await db.collection('users').doc(currentUser.uid).update({[`connectionNotes.${uid}`]:newVal||firebase.firestore.FieldValue.delete()});
          if(!currentUserData.connectionNotes)currentUserData.connectionNotes={};
          if(newVal)currentUserData.connectionNotes[uid]=newVal;else delete currentUserData.connectionNotes[uid];
          noteInput.classList.add('saved');setTimeout(()=>noteInput.classList.remove('saved'),900);
        }catch(err){showToast('Note save failed: '+err.message);}
      });
    }
    inner.appendChild(card);
  }
}
/* ── SAVE PROFILE ── */
document.querySelectorAll('#accentPicker .accent-swatch').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('#accentPicker .accent-swatch').forEach(s=>s.classList.remove('selected'));
    btn.classList.add('selected');
  });
});
let _presenceHeartbeatId=null;
function startPresenceHeartbeat(){
  if(_presenceHeartbeatId)clearInterval(_presenceHeartbeatId);
  _presenceHeartbeatId=setInterval(()=>{
    if(!currentUser||document.hidden)return;
    db.collection('users').doc(currentUser.uid).update({lastActive:firebase.firestore.FieldValue.serverTimestamp()}).catch(()=>{});
  },60000);
}
function relativeTime(ts){
  if(!ts)return '';
  const d=ts.toDate?ts.toDate():(ts instanceof Date?ts:null);
  if(!d)return '';
  const sec=Math.floor((Date.now()-d.getTime())/1000);
  if(sec<60)return 'just now';
  if(sec<3600)return `${Math.floor(sec/60)}m ago`;
  if(sec<86400)return `${Math.floor(sec/3600)}h ago`;
  if(sec<604800)return `${Math.floor(sec/86400)}d ago`;
  return d.toLocaleDateString();
}
async function loadActivityHeatmap(uid,targetId){
  const el=document.getElementById(targetId);
  if(!el)return;
  el.innerHTML='<div class="loading-spinner" style="grid-column:unset;padding:10px 0;"></div>';
  try{
    // Pull last 12 weeks of corpLog for this user
    const cutoff=new Date();cutoff.setUTCDate(cutoff.getUTCDate()-83);
    const snap=await db.collection('corpLog').where('uid','==',uid).where('createdAt','>=',firebase.firestore.Timestamp.fromDate(cutoff)).get().catch(()=>null);
    const counts={};
    if(snap){
      snap.forEach(d=>{
        const t=d.data().createdAt?.toDate?.();
        if(!t)return;
        const k=ymdUTC(t);
        counts[k]=(counts[k]||0)+1;
      });
    }
    // Build 12 weeks x 7 days grid
    const cells=[];
    const today=new Date();
    for(let i=83;i>=0;i--){
      const d=new Date(today);d.setUTCDate(d.getUTCDate()-i);
      const k=ymdUTC(d);
      const c=counts[k]||0;
      let lvl=0;
      if(c>=1)lvl=1;
      if(c>=3)lvl=2;
      if(c>=6)lvl=3;
      if(c>=10)lvl=4;
      cells.push(`<div class="hm-cell hm-l${lvl}" title="${k}: ${c} action${c===1?'':'s'}"></div>`);
    }
    el.innerHTML=`<div class="heatmap-grid">${cells.join('')}</div><div class="heatmap-legend"><span>Less</span><div class="hm-cell hm-l0"></div><div class="hm-cell hm-l1"></div><div class="hm-cell hm-l2"></div><div class="hm-cell hm-l3"></div><div class="hm-cell hm-l4"></div><span>More</span></div>`;
  }catch(err){
    el.innerHTML=`<p style="font-family:var(--font-mono);font-size:.7rem;color:#f55;">${esc(err.message)}</p>`;
  }
}
async function loadOpHistory(uid,targetId){
  const el=document.getElementById(targetId);
  if(!el)return;
  try{
    const snap=await db.collection('missionSubmissions').where('uid','==',uid).where('status','==','approved').get();
    if(snap.empty){el.innerHTML='<p style="font-family:var(--font-mono);font-size:.7rem;color:var(--color-text-muted);padding:4px 0;">No completed operations yet.</p>';return;}
    const items=snap.docs.map(d=>({...d.data(),id:d.id}));
    items.sort((a,b)=>(b.reviewedAt?.toMillis?.()??b.submittedAt?.toMillis?.()??0)-(a.reviewedAt?.toMillis?.()??a.submittedAt?.toMillis?.()??0));
    el.innerHTML=`<div class="op-history-list">${items.slice(0,20).map(s=>{
      const t=s.reviewedAt||s.submittedAt;
      const when=t?fmtDate(t):'—';
      return `<div class="op-history-item"><div class="op-dot"></div><div class="op-body"><strong>${esc(s.missionTitle||'Mission')}</strong><span class="op-meta">+${s.points||0} pts • ${when}</span></div></div>`;
    }).join('')}</div>`;
  }catch(err){
    el.innerHTML=`<p style="font-family:var(--font-mono);font-size:.7rem;color:#f55;">${esc(err.message)}</p>`;
  }
}
/* ── XP / LEVEL SYSTEM ── */
const LEVEL_XP=100; // points per level
function computeLevel(points){
  const p=Math.max(0,points||0);
  const level=Math.floor(p/LEVEL_XP)+1;
  const intoLevel=p%LEVEL_XP;
  return {level,intoLevel,toNext:LEVEL_XP-intoLevel,total:LEVEL_XP};
}
function levelHtml(u,opts={}){
  const {level,intoLevel,total}=computeLevel(u?.points||0);
  const pct=Math.min(100,Math.round((intoLevel/total)*100));
  const compact=opts.compact;
  if(compact){
    return `<div class="level-pill" title="Level ${level} · ${intoLevel}/${total} XP"><span class="level-pill-num">L${level}</span><span class="level-pill-bar"><span class="level-pill-fill" style="width:${pct}%;"></span></span></div>`;
  }
  return `<div class="level-bar-wrap"><div class="level-bar-head"><span class="level-bar-name">LEVEL ${level}</span><span class="level-bar-xp">${intoLevel}/${total} XP</span></div><div class="level-bar-track"><div class="level-bar-fill" style="width:${pct}%;"></div></div></div>`;
}
function nameHtml(u,fallback='Unknown'){
  const name=esc(u?.displayName||fallback);
  const c=u?.accentColor;
  return c?`<span style="color:${esc(c)};">${name}</span>`:name;
}
function titleHtml(u){
  const t=u?.operatorTitle;
  return t?`<div class="operator-title">${esc(t)}</div>`:'';
}
document.getElementById('saveProfileBtn').addEventListener('click',async()=>{
  if(!currentUser)return;
  const btn=document.getElementById('saveProfileBtn');
  btn.disabled=true;btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> Saving...';
  try{
    const newName=document.getElementById('editDisplayName').value.trim();
    const newBio=document.getElementById('editBio').value.trim();
    const newPhoto=document.getElementById('editPhotoURL').value.trim();
    const newActivity=document.getElementById('editActivityStatus')?.value.trim()||'';
    const newAccent=document.querySelector('#accentPicker .accent-swatch.selected')?.dataset.accent||'';
    const newTitle=document.getElementById('editTitle')?.value.trim()||'';
    const newBanner=document.getElementById('editBannerURL')?.value.trim()||'';
    const updates={bio:newBio,photoURL:newPhoto,activityStatus:newActivity,accentColor:newAccent,operatorTitle:newTitle,bannerURL:newBanner};if(newName)updates.displayName=newName;
    await db.collection('users').doc(currentUser.uid).update(updates);
    currentUserData=(await db.collection('users').doc(currentUser.uid).get()).data();
    setNavAvatar(currentUser,currentUserData);
    document.getElementById('myProfileDisplayName').textContent=currentUserData.displayName||currentUser.email;
    const s=document.getElementById('profileSaveSuccess');s.style.display='block';setTimeout(()=>s.style.display='none',3000);
    writeCorpLog('profile','updated their profile',{changed:Object.keys(updates).filter(k=>k!=='photoURL').join(', ')});
  }catch(err){console.error(err);showToast('Failed to save profile.');}
  finally{btn.disabled=false;btn.innerHTML='<i class="fas fa-save"></i> Save Changes';}
});
document.getElementById('editAvatarBtn').addEventListener('click',()=>document.getElementById('avatarFileInput').click());
document.getElementById('editAvatarBtn').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();document.getElementById('avatarFileInput').click();}});
document.getElementById('avatarFileInput').addEventListener('change',function(){
  const file=this.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    document.getElementById('editPhotoURL').value='';
    document.getElementById('editAvatarImg').src=e.target.result;
    document.getElementById('editAvatarImg').style.display='block';
    document.getElementById('editAvatarPlaceholder').style.display='none';
    showToast('Preview set! Upload to Postimages.org then paste the Direct link above.');
  };
  reader.readAsDataURL(file);
});
/* ── AUTH STATE ── */
auth.onAuthStateChanged(async user=>{
  currentUser=user;
  const logoutBtn=document.getElementById('logoutBtn'),loginBtn=document.getElementById('loginBtn');
  const myProfileBtn=document.getElementById('myProfileBtn'),notifBtn=document.getElementById('notifBtn');
  if(user){
    try{
      const snap=await db.collection('users').doc(user.uid).get();
      currentUserData=snap.exists?snap.data():await createUserDoc(user);
      setNavAvatar(user,currentUserData);
      db.collection('users').doc(user.uid).update({lastActive:firebase.firestore.FieldValue.serverTimestamp(),status:'online'}).catch(()=>{});
      startPresenceHeartbeat();
      if(!user.isAnonymous)checkBanStatus();
      // Owner rank check
      if(user.uid===OWNER_UID&&currentUserData?.rank!=='Founder'){
        db.collection('users').doc(user.uid).update({rank:'Founder'}).catch(()=>{});
        currentUserData={...currentUserData,rank:'Founder'};
      }
      updateNotifBadge();
      if(notifUnsubscribe)notifUnsubscribe();
    }catch(e){console.error(e);}
    logoutBtn.style.display='flex';loginBtn.style.display='none';myProfileBtn.style.display='flex';
    // Dim bell for guests
    notifBtn.classList.add('show');
    if(currentUserData?.isAnonymous){
      notifBtn.style.opacity='.4';
      notifBtn.title='Create an account to get notifications';
    }else{
      notifBtn.style.opacity='';
      notifBtn.title='Notifications';
    }
    document.getElementById('adminPanelBtn').style.display=(user.uid===OWNER_UID||canOpenPanel(currentUserData))?'flex':'none';
    applyGuestRestrictions(currentUserData?.isAnonymous||user.isAnonymous);
    if(!user.isAnonymous){startIdleDetection();}
    checkAndAwardBadges(user.uid,currentUserData);
    const isRealUser=!user.isAnonymous;
    document.getElementById('corpHubBtn').style.display=isRealUser?'flex':'none';
    document.getElementById('corpChatBtn').classList.toggle('show',isRealUser);
    document.getElementById('navStatusWrap').style.display=isRealUser?'flex':'none';
    if(isRealUser){
      updateNavStatusDot(currentUserData?.status||'online');
      if(!corpChatUnsub)startCorpChatListener();
      if(!currentUserData?.hasLoggedBefore){
        writeCorpLog('join','joined the corporation');
        db.collection('users').doc(user.uid).update({hasLoggedBefore:true}).catch(()=>{});
        db.collection('users').get().then(s=>{
          if(s.size<=100)awardBadge(user.uid,'founding');
        }).catch(()=>{});
      }
      const today=new Date().toDateString();
      if(currentUserData?.lastLoginDate!==today){
        db.collection('users').doc(user.uid).update({
          lastLoginDate:today,
          points:firebase.firestore.FieldValue.increment(5)
        }).catch(()=>{});
      }
    }
    if(notifUnsubscribe)notifUnsubscribe();
    notifUnsubscribe=db.collection('notifications').where('to','==',user.uid).where('read','==',false).onSnapshot(snap=>{
      updateNotifBadge();
      snap.docChanges().forEach(change=>{
        if(change.type==='added'){
          const n=change.doc.data();
          if(n.type==='message'&&n.fromUid!==currentUser.uid&&currentChatUid!==n.fromUid){
            showMsgToast(n.fromName,n.fromPhoto,n.preview,n.fromUid);
          }
        }
      });
    });
    db.collection('friendRequests').where('to','==',user.uid).onSnapshot(()=>updateNotifBadge());
    refreshDashboardSurface();
  }else{
    currentUserData=null;
    document.getElementById('userAvatar').style.display='none';document.getElementById('defaultIcon').style.display='block';
    logoutBtn.style.display='none';loginBtn.style.display='flex';myProfileBtn.style.display='none';notifBtn.classList.remove('show');
    document.getElementById('adminPanelBtn').style.display='none';
    applyGuestRestrictions(true); // logged-out = guest
    if(notifUnsubscribe){notifUnsubscribe();notifUnsubscribe=null;}
    refreshDashboardSurface();
  }
});
window.addEventListener('beforeunload',()=>{
  if(!currentUser)return;
  if(currentUser.isAnonymous){
    // Best-effort guest cleanup so anonymous docs don't pile up.
    try{db.collection('users').doc(currentUser.uid).delete();}catch(_){}
    try{currentUser.delete();}catch(_){}
  }else{
    db.collection('users').doc(currentUser.uid).update({status:'offline'}).catch(()=>{});
  }
});
async function cleanupAnonBeforeUpgrade(){
  // Called before a guest upgrades to a real account (email/password or Google).
  // Removes the anonymous Auth account + Firestore user doc so we don't accumulate orphans.
  if(!currentUser?.isAnonymous)return;
  const oldUid=currentUser.uid;
  try{await db.collection('users').doc(oldUid).delete();}catch(_){}
  try{await currentUser.delete();}catch(_){}
}
/* ── AUTH FORMS ── */
function showError(msg){const el=document.getElementById('errorMessage');el.textContent=msg;el.style.display='block';}
function clearError(){
  const el=document.getElementById('errorMessage');
  el.style.display='none';
  el.style.color='#ff4444';
  el.style.borderColor='rgba(255,68,68,.2)';
  el.style.background='rgba(255,68,68,.05)';
}
document.getElementById('loginForm').addEventListener('submit',async e=>{
  e.preventDefault();clearError();const btn=e.target.querySelector('button[type=submit]');
  btn.disabled=true;btn.textContent='LOGGING IN...';
  try{await cleanupAnonBeforeUpgrade();await auth.signInWithEmailAndPassword(document.getElementById('loginEmail').value,document.getElementById('loginPassword').value);closeModal('loginModal');}
  catch(err){showError(err.message);}
  finally{btn.disabled=false;btn.innerHTML='<i class="fas fa-sign-in-alt"></i> LOGIN';}
});
document.getElementById('registerForm').addEventListener('submit',async e=>{
  e.preventDefault();clearError();
  const pw=document.getElementById('registerPassword').value,cpw=document.getElementById('confirmPassword').value;
  if(pw!==cpw){showError("Passwords don't match");return;}
  const btn=e.target.querySelector('button[type=submit]');btn.disabled=true;btn.textContent='CREATING ACCOUNT...';
  try{await cleanupAnonBeforeUpgrade();const uc=await auth.createUserWithEmailAndPassword(document.getElementById('registerEmail').value,pw);await createUserDoc(uc.user);closeModal('loginModal');}
  catch(err){showError(err.message);}
  finally{btn.disabled=false;btn.innerHTML='<i class="fas fa-user-plus"></i> REGISTER';}
});
document.getElementById('googleLogin').addEventListener('click',async()=>{
  clearError();
  try{await cleanupAnonBeforeUpgrade();const r=await auth.signInWithPopup(googleProvider);if(r.additionalUserInfo.isNewUser)await createUserDoc(r.user);closeModal('loginModal');}
  catch(err){showError(err.message);}
});
/* ── ANONYMOUS / GUEST LOGIN ── */
document.getElementById('anonLogin').addEventListener('click',async()=>{
  clearError();
  const btn=document.getElementById('anonLogin');
  btn.disabled=true;btn.innerHTML='<i class="fas fa-spinner fa-spin"></i>';
  try{
    const r=await auth.signInAnonymously();
    // Create guest doc
    const guestNum=Math.floor(Math.random()*9000)+1000;
    await db.collection('users').doc(r.user.uid).set({
      displayName:`Guest#${guestNum}`,email:'',photoURL:'',
      rank:'Unaffiliated',bio:'Browsing as guest.',status:'online',friends:[],isAnonymous:true,
      createdAt:firebase.firestore.FieldValue.serverTimestamp()
    },{merge:true});
    closeModal('loginModal');
  }catch(err){showError(err.message);}
  finally{btn.disabled=false;btn.innerHTML='<i class="fas fa-user-secret"></i> Guest';}
});
/* ── PASSWORD RESET ── */
document.getElementById('forgotLink').addEventListener('click',()=>{
  closeModal('loginModal');
  document.getElementById('resetError').style.display='none';
  document.getElementById('resetSuccess').style.display='none';
  document.getElementById('resetEmail').value='';
  openModal('resetModal');
});
document.getElementById('closeReset').addEventListener('click',()=>closeModal('resetModal'));
document.getElementById('resetModal').addEventListener('click',function(e){if(e.target===this)closeModal('resetModal');});
document.getElementById('sendResetBtn').addEventListener('click',()=>{
  const email=document.getElementById('resetEmail').value.trim();
  const errEl=document.getElementById('resetError');
  const successEl=document.getElementById('resetSuccess');
  const btn=document.getElementById('sendResetBtn');
  errEl.style.display='none';
  successEl.style.display='none';
  if(!email){errEl.textContent='Please enter your email.';errEl.style.display='block';return;}
  btn.disabled=true;btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> Sending...';
  const actionCodeSettings={url:window.location.origin,handleCodeInApp:false};
  auth.sendPasswordResetEmail(email,actionCodeSettings)
    .then(()=>{
      successEl.style.display='block';
      btn.disabled=false;btn.innerHTML='<i class="fas fa-paper-plane"></i> Send Reset Email';
    })
    .catch(err=>{
      const msgs={'auth/user-not-found':'No account found with that email.','auth/invalid-email':'Please enter a valid email address.','auth/too-many-requests':'Too many attempts. Please wait a moment and try again.'};
      errEl.textContent=msgs[err.code]||err.message;
      errEl.style.display='block';
      btn.disabled=false;btn.innerHTML='<i class="fas fa-paper-plane"></i> Send Reset Email';
    });
});
/* ── TOGGLE AUTH FORM ── */
document.getElementById('toggleForm').addEventListener('click',function(){
  const lf=document.getElementById('loginForm'),rf=document.getElementById('registerForm');
  const isLogin=lf.style.display!=='none';
  lf.style.display=isLogin?'none':'flex';rf.style.display=isLogin?'flex':'none';
  document.getElementById('modalTitle').textContent=isLogin?'Create Account':'Access Nexus';
  this.textContent=isLogin?'Already have an account? Login here':"Don't have an account? Register here";
  clearError();
});
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
  if(rBadge){rBadge.textContent=currentUserData?.rank||'';rBadge.className='';rBadge.style.cssText='font-family:var(--font-mono);font-size:.62rem;padding:3px 10px;border-radius:3px;background:rgba(192,192,192,.05);border:1px solid rgba(192,192,192,.15);';rBadge.classList.add(rankClass(currentUserData?.rank));}
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
    try{await safeExec(db.collection('missions').add({title,description:desc,secretKey:key,points:pts,category,active:true,createdAt:firebase.firestore.FieldValue.serverTimestamp()}),'Mission created');
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
      <div style="font-family:var(--font-mono);font-size:.68rem;color:var(--color-text-muted);">Submitted: <strong>${esc(sub.keySubmitted||'')}</strong> &nbsp;|&nbsp; Expected: <strong style="color:${keyMatch?'#4CAF50':'#f44336'};">${esc(correctKey)}</strong></div>
      <div style="display:flex;gap:6px;">
        <button class="admin-save-rank" style="border-color:rgba(76,175,80,.4);color:#4CAF50;" data-sid="${sid}" data-uid="${sub.uid}" data-pts="${sub.points||50}" data-action="approve"><i class="fas fa-check"></i> Approve +${sub.points||50}pts</button>
        <button class="admin-save-rank" style="border-color:rgba(255,68,68,.4);color:#f55;" data-sid="${sid}" data-action="reject"><i class="fas fa-times"></i> Reject</button>
      </div>`;
      row.querySelector('[data-action="approve"]').addEventListener('click',async function(){
        this.disabled=true;this.innerHTML='<i class="fas fa-spinner fa-spin"></i>';
        const batch=db.batch();
        batch.update(db.collection('missionSubmissions').doc(this.dataset.sid),{status:'approved'});
        batch.update(db.collection('users').doc(this.dataset.uid),{points:firebase.firestore.FieldValue.increment(parseInt(this.dataset.pts)||50)});
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
    }
    await auth.signOut();
    showToast('Signed out successfully.');
  }catch(err){showToast('Error signing out: '+err.message);}
});
/* ── GUEST CONTENT RESTRICTIONS ── */
function applyGuestRestrictions(isGuest){
  // Hide member-only
  document.querySelectorAll('[data-member-only="true"]').forEach(el=>{
    el.classList.toggle('guest-hidden', isGuest);
  });
  // Active members panel
  const countRow=document.getElementById('activeMembersCount');
  const membersList=document.getElementById('activeMembersList');
  const guestMsg=document.getElementById('activeMembersGuestMsg');
  if(countRow) countRow.style.display=isGuest?'none':'';
  if(membersList) membersList.style.display=isGuest?'none':'';
  if(guestMsg) guestMsg.style.display=isGuest?'block':'none';
  // Wire register link
  const regLink=document.getElementById('activeMembersRegisterLink');
  if(regLink&&isGuest){
    regLink.onclick=e=>{
      e.preventDefault();
      promptGuestRegister("Create a free account to see who's online and connect with other operatives.");
    };
  }
  // Hide members button for guests
  const viewMembersBtn=document.getElementById('viewMembersBtn');
  if(viewMembersBtn){
    viewMembersBtn.style.display=isGuest?'none':'flex';
  }
  // Hide corp hub for guests
  document.getElementById('corpHubBtn').style.display='none';
  document.getElementById('corpChatBtn').classList.remove('show');
  document.getElementById('navStatusWrap').style.display='none';
}
/* ═══════════════════════════════════════════════════════
   STATUS SYSTEM
═══════════════════════════════════════════════════════ */
const STATUS_LABELS={online:'Online',idle:'Idle',dnd:'Do Not Disturb',offline:'Offline'};
let idleTimer=null, currentPresenceStatus='online';
function updateNavStatusDot(status){
  const dot=document.getElementById('navStatusDot');
  if(!dot)return;
  dot.className='status-dot '+status;
}
async function setUserStatus(status,customText){
  if(!currentUser||currentUser.isAnonymous)return;
  currentPresenceStatus=status;
  updateNavStatusDot(status);
  const updates={status};
  if(customText!==undefined)updates.activityStatus=customText;
  await db.collection('users').doc(currentUser.uid).update(updates).catch(()=>{});
  if(currentUserData){currentUserData.status=updates.status;if(customText!==undefined)currentUserData.activityStatus=customText;}
}
function startIdleDetection(){
  let lastActivity=Date.now();
  const resetIdle=()=>{
    lastActivity=Date.now();
    if(currentPresenceStatus==='idle'&&document.visibilityState==='visible'){
      setUserStatus('online');
    }
  };
  ['mousemove','keydown','click','scroll','touchstart'].forEach(e=>document.addEventListener(e,resetIdle,{passive:true}));
  setInterval(()=>{
    if(!currentUser||currentUser.isAnonymous)return;
    const idle=Date.now()-lastActivity>180000; // 3 min
    if(idle&&(currentPresenceStatus==='online')){
      setUserStatus('idle');
      writeCorpLog('status','went idle');
    }
  },30000);
  document.addEventListener('visibilitychange',()=>{
    if(!currentUser||currentUser.isAnonymous)return;
    if(document.visibilityState==='hidden'&&currentPresenceStatus==='online'){
      setUserStatus('idle');
    }else if(document.visibilityState==='visible'&&currentPresenceStatus==='idle'){
      setUserStatus('online');
      writeCorpLog('status','is back online');
    }
  });
}
// Wire status picker
document.getElementById('statusDotBtn').addEventListener('click',e=>{
  e.stopPropagation();
  document.getElementById('statusPicker').classList.toggle('open');
});
document.addEventListener('click',()=>document.getElementById('statusPicker').classList.remove('open'));
document.querySelectorAll('.status-pick-item').forEach(item=>{
  item.addEventListener('click',e=>{
    e.stopPropagation();
    const s=item.dataset.status;
    setUserStatus(s);
    document.getElementById('statusPicker').classList.remove('open');
    writeCorpLog('status',`set their status to ${STATUS_LABELS[s]||s}`,{status:s});
  });
});
const customStatusInput=document.getElementById('customStatusInput');
customStatusInput.addEventListener('keydown',async e=>{
  if(e.key==='Enter'){
    const txt=e.target.value.trim();
    // Save activity
    await db.collection('users').doc(currentUser.uid).update({activityStatus:txt}).catch(()=>{});
    if(currentUserData)currentUserData.activityStatus=txt;
    document.getElementById('statusPicker').classList.remove('open');
    refreshDashboardSurface();
    showToast(txt?`Activity set: "${txt}"`:'Activity status cleared.');
  }
});
customStatusInput.addEventListener('click',e=>e.stopPropagation());
/* ═══════════════════════════════════════════════════════
   BADGES
═══════════════════════════════════════════════════════ */
const BADGE_DEFS={
  founding:{icon:'fa-star',label:'Founding Member',cls:'badge-founding',desc:'One of the first to join TheSizNexus'},
  beta:{icon:'fa-flask',label:'Beta Tester',cls:'badge-beta',desc:'Helped test the Nexus platform'},
  veteran:{icon:'fa-shield-alt',label:'Veteran',cls:'badge-veteran',desc:'Member for 30+ days'},
  social:{icon:'fa-user-friends',label:'Social',cls:'badge-social',desc:'10+ connections'},
  top:{icon:'fa-trophy',label:'Top Operative',cls:'badge-top',desc:'Ranked in the top 3'},
  firstlogin:{icon:'fa-door-open',label:'First Access',cls:'badge-firstlogin',desc:'Completed first login'},
  mission:{icon:'fa-check-circle',label:'Operative',cls:'badge-mission',desc:'Completed a mission'}
};
function renderBadges(badges){
  if(!badges||!badges.length)return'';
  return'<div class="badge-row">'+badges.map(b=>{
    const def=BADGE_DEFS[b];
    if(!def)return'';
    return`<span class="badge ${def.cls}" title="${def.desc}"><i class="fas ${def.icon}"></i> ${def.label}</span>`;
  }).join('')+'</div>';
}
function awardBadge(uid,badgeKey){
  return db.collection('users').doc(uid).update({badges:firebase.firestore.FieldValue.arrayUnion(badgeKey)});
}
function featuredScore(user){
  return (user.points||0)+((user.badges||[]).length*18)+((user.friends||[]).length*4)+(user.status==='online'?10:0)+(user.activityStatus?4:0);
}
function buildFeaturedDescription(user,position){
  if(!user)return'No operative has been featured yet.';
  if(position===0&&(user.points||0)>0){
    return `${user.displayName||'This operative'} is currently setting the pace with ${user.points||0} pts and ${user.rank||'Member'} clearance.`;
  }
  if(user.activityStatus){
    return `Current activity: "${user.activityStatus}". ${(user.bio&&user.bio.trim())?user.bio.trim():`${user.rank||'Member'} operative active in the Nexus network.`}`;
  }
  if(user.bio&&user.bio.trim())return truncateText(user.bio.trim(),150);
  if((user.points||0)>0){
    return `${user.displayName||'This operative'} has accumulated ${user.points||0} pts through missions, activity, and member engagement.`;
  }
  return `${user.rank||'Member'} operative active in the Nexus network.`;
}
function buildFeaturedTags(user,position){
  if(!user)return[];
  const tags=[];
  if(position===0&&(user.points||0)>0)tags.push('Top Operative');
  if(user.rank)tags.push(user.rank);
  if((user.points||0)>0)tags.push(`${user.points||0} pts`);
  if((user.friends||[]).length>0)tags.push(`${(user.friends||[]).length} connections`);
  (user.badges||[]).forEach(b=>{
    if(tags.length<5&&BADGE_DEFS[b]?.label)tags.push(BADGE_DEFS[b].label);
  });
  if(tags.length<3&&user.status)tags.push(STATUS_LABELS[user.status]||user.status);
  return tags.slice(0,5);
}
function setFeaturedMember(user,position=0){
  const card=document.querySelector('#featured-member .featured-card');
  const nameEl=document.getElementById('featured-name');
  const descEl=document.getElementById('featured-desc');
  const badgesEl=document.getElementById('member-achievements');
  currentFeaturedMember=user||null;
  if(!nameEl||!descEl||!badgesEl||!card)return;
  if(!user){
    nameEl.textContent='No Operative Selected';
    descEl.textContent='No operative has been featured yet.';
    badgesEl.innerHTML='<span class="achievement-badge">Spotlight Pending</span>';
    card.classList.remove('is-interactive');
    return;
  }
  nameEl.innerHTML=nameHtml(user,'Unknown Operative')+titleHtml(user)+levelHtml(user,{compact:true});
  descEl.textContent=user._curatedNote||buildFeaturedDescription(user,position);
  const tags=user._curatedNote?['Editorial Pick',user.rank||'Member']:buildFeaturedTags(user,position);
  badgesEl.innerHTML=tags.length
    ? tags.map(tag=>`<span class="achievement-badge">${esc(tag)}</span>`).join('')
    : '<span class="achievement-badge">Member Network</span>';
  card.classList.add('is-interactive');
}
function rotateFeaturedMember(){
  if(!featuredMemberPool.length){
    setFeaturedMember(null);
    return;
  }
  const displayIndex=featuredMemberIndex;
  setFeaturedMember(featuredMemberPool[displayIndex],displayIndex);
  featuredMemberIndex=(featuredMemberIndex+1)%featuredMemberPool.length;
}
function startFeaturedRotation(){
  if(featuredRotationTimer){
    clearInterval(featuredRotationTimer);
    featuredRotationTimer=null;
  }
  if(featuredMemberPool.length>1){
    featuredRotationTimer=setInterval(rotateFeaturedMember,10000);
  }
}
async function loadFeaturedMembers(){
  const card=document.querySelector('#featured-member .featured-card');
  if(!card)return;
  try{
    // 1) Curated override — if an admin has pinned a featured member, use that exclusively.
    const curatedDoc=await db.collection('_configKEY').doc('featured').get().catch(()=>null);
    if(curatedDoc&&curatedDoc.exists){
      const cur=curatedDoc.data()||{};
      if(cur.uid){
        const userDoc=await db.collection('users').doc(cur.uid).get().catch(()=>null);
        if(userDoc&&userDoc.exists){
          const user={...userDoc.data(),id:userDoc.id,_curatedNote:cur.note||''};
          featuredMemberPool=[user];
          featuredMemberIndex=0;
          if(featuredRotationTimer){clearInterval(featuredRotationTimer);featuredRotationTimer=null;}
          setFeaturedMember(user,0);
          return;
        }
      }
    }
    // 2) Heuristic fallback — score-based rotation.
    const snap=await db.collection('users').get();
    const users=[];
    snap.forEach(d=>{
      const user=d.data();
      if(user.isAnonymous)return;
      users.push({...user,id:d.id});
    });
    users.sort((a,b)=>{
      const scoreDiff=featuredScore(b)-featuredScore(a);
      if(scoreDiff!==0)return scoreDiff;
      return (a.displayName||'').localeCompare(b.displayName||'');
    });
    featuredMemberPool=users.slice(0,6);
    featuredMemberIndex=0;
    rotateFeaturedMember();
    startFeaturedRotation();
  }catch(err){
    console.error('Featured member load failed:',err);
    featuredMemberPool=[];
    startFeaturedRotation();
    setFeaturedMember(null);
  }
}
document.querySelector('#featured-member .featured-card')?.addEventListener('click',()=>{
  if(!currentFeaturedMember?.id)return;
  if(currentUser&&currentFeaturedMember.id===currentUser.uid){
    openMyProfile();
    return;
  }
  openViewProfile({...currentFeaturedMember});
});
async function checkAndAwardBadges(uid,userData){
  if(!uid||!userData||userData.isAnonymous)return;
  const badges=userData.badges||[];
  const toAward=[];
  if(!badges.includes('firstlogin'))toAward.push('firstlogin');
  const createdAt=userData.createdAt?.toDate?.();
  if(createdAt&&(Date.now()-createdAt.getTime())>30*24*60*60*1000&&!badges.includes('veteran'))toAward.push('veteran');
  if((userData.friends||[]).length>=10&&!badges.includes('social'))toAward.push('social');
  const missionsSnap=await db.collection('missionSubmissions').where('uid','==',uid).where('status','==','approved').get().catch(()=>({empty:true}));
  if(!missionsSnap.empty&&!badges.includes('mission'))toAward.push('mission');
  if(toAward.length){
    await db.collection('users').doc(uid).update({badges:firebase.firestore.FieldValue.arrayUnion(...toAward)}).catch(()=>{});
    if(currentUserData)currentUserData.badges=[...badges,...toAward];
  }
}
/* ═══════════════════════════════════════════════════════
   CORPORATION LOG
═══════════════════════════════════════════════════════ */
const PRIVATE_LOG_TYPES=['status','profile'];
const DEV_RANKS=['Founder','Administrator','Co-Administrator','Developer'];
function isDev(data){return data&&DEV_RANKS.includes(data.rank);}
const MOD_RANKS=['Founder','Administrator','Co-Administrator','Moderator'];
function isMod(data){return data&&MOD_RANKS.includes(data.rank);}
async function writeCorpLog(type,message,extra={}){
  if(!currentUser||currentUser.isAnonymous)return;
  await db.collection('corpLog').add({
    type,
    uid:currentUser.uid,
    displayName:currentUserData?.displayName||'Unknown',
    rank:currentUserData?.rank||'Member',
    message,
    extra,
    createdAt:firebase.firestore.FieldValue.serverTimestamp()
  }).catch(()=>{});
}
let corpLogUnsub=null;
async function loadCorpLog(filter='all'){
  const feed=document.getElementById('corpLogFeed');
  feed.innerHTML='<div class="loading-spinner" style="grid-column:unset;padding:20px 0;"></div>';
  updateHubSectionInfo({
    label:filter==='all'?'Activity Feed':`${filter.charAt(0).toUpperCase()+filter.slice(1)} Activity`,
    count:'—',
    note:filter==='all'
      ? 'Loading recent member actions, system updates, and internal signals.'
      : `Loading entries filtered to ${filter} activity.`
  });
  if(corpLogUnsub){corpLogUnsub();corpLogUnsub=null;}
  let q=db.collection('corpLog').orderBy('createdAt','desc').limit(50);
  corpLogUnsub=q.onSnapshot(snap=>{
    feed.innerHTML='';
    let docs=snap.docs;
    if(filter!=='all')docs=docs.filter(d=>d.data().type===filter);
    if(!docs.length){
      updateHubSectionInfo({
        label:filter==='all'?'Activity Feed':`${filter.charAt(0).toUpperCase()+filter.slice(1)} Activity`,
        count:0,
        note:filter==='all'?'No activity has been recorded yet.':`No ${filter} activity is available yet.`
      });
      feed.innerHTML='<div class="hub-empty">No activity yet.</div>';return;
    }
    // Filter log entries
    const isDevViewer=isDev(currentUserData);
    const isMViewer=isMod(currentUserData);
    const visibleDocs=docs.filter(d=>{
      const t=d.data().type;
      if(PRIVATE_LOG_TYPES.includes(t)&&!isDevViewer)return false;
      return true;
    });
    if(!visibleDocs.length){
      updateHubSectionInfo({
        label:filter==='all'?'Activity Feed':`${filter.charAt(0).toUpperCase()+filter.slice(1)} Activity`,
        count:0,
        note:'No visible activity is available for your current access level.'
      });
      feed.innerHTML='<div class="hub-empty">No activity to display.</div>';return;
    }
    updateHubSectionInfo({
      label:filter==='all'?'Activity Feed':`${filter.charAt(0).toUpperCase()+filter.slice(1)} Activity`,
      count:visibleDocs.length,
      note:filter==='all'
        ? 'Recent member actions, system updates, and internal signals.'
        : `Showing the latest ${filter} entries across the corporation.`
    });
    visibleDocs.forEach(d=>{
      const log=d.data();
      const item=document.createElement('div');item.className='log-item';
      item.dataset.cardId=d.id;
      const time=log.createdAt?fmtDate(log.createdAt)+' '+fmtTime(log.createdAt):'';
      // Icon per type
      const typeIcon={join:'fa-door-open',rank:'fa-id-badge',mission:'fa-crosshairs',connection:'fa-user-friends',status:'fa-circle',profile:'fa-user-edit',intel:'fa-satellite-dish',poll:'fa-poll',announcement:'fa-bullhorn',streak:'fa-fire',motw:'fa-trophy'};
      const icon=typeIcon[log.type]||'fa-circle';
      item.innerHTML=`<div class="log-item-main"><i class="fas ${icon}" style="margin-right:6px;font-size:.65rem;opacity:.6;"></i><strong>${esc(log.displayName||'Unknown')}</strong> ${esc(log.message)}</div>
        <div class="log-item-meta"><span class="${rankClass(log.rank)}">${esc(log.rank||'Member')}</span> &middot; ${time}</div>
        ${isMViewer&&log.extra&&Object.keys(log.extra).length?`<div class="log-item-detail"><i class="fas fa-info-circle" style="margin-right:4px;opacity:.5;font-size:.6rem;"></i>${esc(JSON.stringify(log.extra))}</div>`:''}`;
      feed.appendChild(item);
    });
  },err=>{feed.innerHTML=`<div class="hub-empty" style="color:#f55;">Error: ${err.message}</div>`;});
}
// Mission category filter buttons
document.querySelectorAll('.mission-cat-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.mission-cat-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    _missionCategoryFilter=btn.dataset.cat;
    loadMissions();
  });
});
// Filter buttons
document.querySelectorAll('.log-filter-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.log-filter-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    loadCorpLog(btn.dataset.filter);
  });
});
/* ═══════════════════════════════════════════════════════
   MISSIONS
═══════════════════════════════════════════════════════ */
let _missionCategoryFilter='all';
let _briefingMission=null;
function openMissionBriefing(mission,mySub){
  _briefingMission=mission;
  document.getElementById('briefingTitle').textContent=mission.title||'Mission';
  document.getElementById('briefingDesc').textContent=mission.description||'No additional details.';
  document.getElementById('briefingPts').textContent=`${mission.points||0} pts`;
  const cat=document.getElementById('briefingCat');
  if(mission.category){cat.textContent=mission.category.toUpperCase();cat.style.display='';cat.className='briefing-cat mission-cat-'+esc(mission.category);}
  else{cat.style.display='none';}
  const created=mission.createdAt?.toDate?.();
  document.getElementById('briefingDate').textContent=created?created.toLocaleDateString([],{month:'short',day:'numeric',year:'numeric'}):'—';
  const statusEl=document.getElementById('briefingStatus');
  const myStatus=document.getElementById('briefingMyStatus');
  const keySection=document.getElementById('briefingKeySection');
  const fb=document.getElementById('briefingFeedback');
  fb.textContent='';fb.className='briefing-feedback';
  document.getElementById('briefingKeyInput').value='';
  if(mySub?.status==='pending'){
    statusEl.textContent='PENDING';statusEl.className='briefing-status briefing-status-pending';
    myStatus.textContent='Awaiting Review';
    keySection.style.display='none';
  }else if(mySub?.status==='approved'){
    statusEl.textContent='COMPLETED';statusEl.className='briefing-status briefing-status-done';
    myStatus.textContent=`Completed +${mission.points||0} pts`;
    keySection.style.display='none';
  }else if(mySub?.status==='rejected'){
    statusEl.textContent='REJECTED';statusEl.className='briefing-status briefing-status-rejected';
    myStatus.textContent='KEY Rejected — try again';
    keySection.style.display='';
  }else{
    statusEl.textContent='OPEN';statusEl.className='briefing-status briefing-status-open';
    myStatus.textContent='Available';
    keySection.style.display='';
  }
  openModal('briefingModal');
  setTimeout(()=>document.getElementById('briefingKeyInput').focus(),60);
}
document.getElementById('closeBriefing')?.addEventListener('click',()=>closeModal('briefingModal'));
async function submitMissionBriefing(){
  if(!_briefingMission||!currentUser)return;
  const m=_briefingMission;
  const keyVal=document.getElementById('briefingKeyInput').value.trim().toUpperCase();
  const fb=document.getElementById('briefingFeedback');
  if(!keyVal){fb.textContent='Enter a KEY first.';fb.className='briefing-feedback err';return;}
  const btn=document.getElementById('briefingSubmitBtn');
  btn.disabled=true;btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> Transmitting...';
  try{
    await db.collection('missionSubmissions').add({
      uid:currentUser.uid,
      displayName:currentUserData?.displayName||'Unknown',
      missionId:m.id,
      missionTitle:m.title||'Mission',
      keySubmitted:keyVal,
      points:m.points||50,
      status:'pending',
      submittedAt:firebase.firestore.FieldValue.serverTimestamp(),
      createdAt:firebase.firestore.FieldValue.serverTimestamp()
    });
    writeCorpLog('mission',`submitted a KEY for mission: ${m.title}`);
    fb.textContent='KEY transmitted. Awaiting admin verification.';fb.className='briefing-feedback ok';
    setTimeout(()=>{closeModal('briefingModal');loadMissions();},1400);
  }catch(err){
    fb.textContent='Error: '+err.message;fb.className='briefing-feedback err';
    btn.disabled=false;btn.innerHTML='<i class="fas fa-key"></i> Submit';
  }
}
document.getElementById('briefingSubmitBtn')?.addEventListener('click',submitMissionBriefing);
document.getElementById('briefingKeyInput')?.addEventListener('keydown',e=>{if(e.key==='Enter')submitMissionBriefing();});
async function loadMissions(){
  const list=document.getElementById('missionsList');
  list.innerHTML='<div class="loading-spinner" style="grid-column:unset;padding:20px 0;"></div>';
  updateHubSectionInfo({label:'Active Missions',count:'—',note:'Loading active objectives and your current mission state.'});
  try{
    const [missionsSnap,mySubsSnap]=await Promise.all([
      db.collection('missions').where('active','==',true).get(),
      db.collection('missionSubmissions').where('uid','==',currentUser.uid).get()
    ]);
    const mySubsMap={};
    mySubsSnap.forEach(d=>{mySubsMap[d.data().missionId]=d.data();});
    list.innerHTML='';
    if(missionsSnap.empty){
      updateHubSectionInfo({label:'Active Missions',count:0,note:'No active missions are published right now.'});
      list.innerHTML='<div class="hub-empty">No active missions. Check back soon.</div>';return;
    }
    updateHubSectionInfo({
      label:'Active Missions',
      count:missionsSnap.size,
      note:'Mission cards show live status, point value, and any existing submission state.'
    });
    const sevenDaysAgo=Date.now()-7*86400000;
    let sortedMissions=[...missionsSnap.docs].sort((a,b)=>(b.data().createdAt?.toMillis?.()||0)-(a.data().createdAt?.toMillis?.()||0));
    if(_missionCategoryFilter!=='all'){
      sortedMissions=sortedMissions.filter(d=>{
        const c=d.data().category||'';
        return _missionCategoryFilter==='uncategorized'?!c:c===_missionCategoryFilter;
      });
    }
    if(!sortedMissions.length){
      list.innerHTML=`<div class="hub-empty">No missions in <strong>${esc(_missionCategoryFilter)}</strong>.</div>`;
      updateHubSectionInfo({label:'Active Missions',count:0,note:'No missions match the current filter.'});
      return;
    }
    sortedMissions.forEach(d=>{
      const m=d.data(),mid=d.id;
      const mySub=mySubsMap[mid];
      const isNewThisWeek=(m.createdAt?.toMillis?.()||0)>sevenDaysAgo;
      const card=document.createElement('div');card.className='mission-card';card.dataset.cardId=mid;
      if(isNewThisWeek)card.classList.add('mission-fresh');
      let statusHtml='<span class="mission-status open">Open</span>';
      let actionHtml='';
      if(mySub){
        if(mySub.status==='pending'){
          statusHtml='<span class="mission-status pending">Pending Review</span>';
          actionHtml='<p style="font-family:var(--font-mono);font-size:.7rem;color:var(--color-text-muted);margin-top:8px;"><i class="fas fa-clock"></i> Your KEY has been submitted and is awaiting admin review.</p>';
        }else if(mySub.status==='approved'){
          statusHtml='<span class="mission-status completed">Completed</span>';
          actionHtml='<p style="font-family:var(--font-mono);font-size:.7rem;color:#4CAF50;margin-top:8px;"><i class="fas fa-check-circle"></i> Mission complete! +${m.points||50} pts awarded.</p>';
        }else if(mySub.status==='rejected'){
          statusHtml='<span class="mission-status rejected">Rejected</span>';
          actionHtml=`<p style="font-family:var(--font-mono);font-size:.7rem;color:#f44336;margin-top:8px;"><i class="fas fa-times-circle"></i> Key rejected. ${esc(mySub.rejectReason||'Try again or contact an admin.')}</p>`;
        }
      }else{
        actionHtml=`<button class="btn-primary briefing-open" data-mid="${mid}" style="margin-top:10px;width:100%;justify-content:center;font-size:.72rem;padding:9px;"><i class="fas fa-file-invoice"></i> Open Briefing</button>`;
      }
      const catBadge=m.category?`<span class="mission-cat-badge mission-cat-${esc(m.category)}">${esc(m.category)}</span>`:'';
      card.innerHTML=`
        ${isNewThisWeek?'<span class="mission-new-ribbon"><i class="fas fa-bolt"></i> NEW THIS WEEK</span>':''}
        <div class="mission-header">
          <div class="mission-icon"><i class="fas fa-crosshairs"></i></div>
          <div class="mission-info">
            <div class="mission-title">${esc(m.title||'Mission')} ${catBadge}</div>
            <div class="mission-desc">${esc(m.description||'')}</div>
          </div>
        </div>
        <div class="mission-footer"><span class="mission-pts"><i class="fas fa-star"></i> ${m.points||50} pts</span>${statusHtml}</div>
        ${actionHtml}`;
      // Wire briefing open button
      const briefingBtn=card.querySelector('.briefing-open');
      if(briefingBtn){
        briefingBtn.addEventListener('click',e=>{e.stopPropagation();openMissionBriefing({...m,id:mid},mySub);});
      }
      // Click anywhere on a not-yet-attempted card opens briefing too
      if(!mySub){
        card.style.cursor='pointer';
        card.addEventListener('click',e=>{
          if(e.target.closest('.briefing-open'))return;
          openMissionBriefing({...m,id:mid},mySub);
        });
      }
      list.appendChild(card);
    });
  }catch(err){list.innerHTML=`<div class="hub-empty" style="color:#f55;">Error: ${err.message}</div>`;}
}
/* ═══════════════════════════════════════════════════════
   LEADERBOARD
═══════════════════════════════════════════════════════ */
async function loadLeaderboard(){
  const list=document.getElementById('leaderboardList');
  list.innerHTML='<div class="loading-spinner" style="grid-column:unset;padding:20px 0;"></div>';
  updateHubSectionInfo({label:'Ranked Operatives',count:'—',note:'Loading member standings and point totals.'});
  try{
    const snap=await db.collection('users').get();
    const users=[];
    snap.forEach(d=>{const u=d.data();u.id=d.id;if(!u.isAnonymous)users.push(u);});
    // Compute score
    users.sort((a,b)=>(b.points||0)-(a.points||0));
    list.innerHTML='';
    if(!users.length){
      updateHubSectionInfo({label:'Ranked Operatives',count:0,note:'No ranked operatives are available yet.'});
      list.innerHTML='<div class="hub-empty">No operatives ranked yet.</div>';return;
    }
    updateHubSectionInfo({
      label:'Ranked Operatives',
      count:users.length,
      note:'Leaderboard order is driven by current point totals across visible members.'
    });
    users.slice(0,20).forEach((u,i)=>{
      const rankNum=i+1;
      const rankCls=rankNum===1?'gold':rankNum===2?'silver':rankNum===3?'bronze':'other';
      const rankIcon=rankNum===1?'🥇':rankNum===2?'🥈':rankNum===3?'🥉':rankNum;
      const isMe=u.id===currentUser.uid;
      const row=document.createElement('div');row.className='lb-row'+(isMe?' ':"");
      row.dataset.cardId=u.id;
      if(isMe)row.style.borderColor='rgba(192,192,192,.3)';
      row.innerHTML=`<span class="lb-rank ${rankCls}">${rankIcon}</span>
        <div class="lb-av">${avHtml(u.photoURL,u.displayName)}</div>
        <span class="lb-name">${nameHtml(u)}${isMe?'<span class="lb-you">[YOU]</span>':''}</span>
        <span class="lb-pts"><i class="fas fa-star" style="font-size:.6rem;margin-right:3px;"></i>${u.points||0}</span>`;
      list.appendChild(row);
    });
  }catch(err){list.innerHTML=`<div class="hub-empty" style="color:#f55;">Error: ${err.message}</div>`;}
}
/* ═══════════════════════════════════════════════════════
   CALENDAR
═══════════════════════════════════════════════════════ */
async function loadCalendar(){
  const list=document.getElementById('calendarList');
  list.innerHTML='<div class="loading-spinner" style="grid-column:unset;padding:20px 0;"></div>';
  updateHubSectionInfo({label:'Upcoming Events',count:'—',note:'Loading scheduled operations and attendance signals.'});
  try{
    const snap=await db.collection('events').get();
    const events=snap.docs.sort((a,b)=>(a.data().eventDate?.toMillis?.()??0)-(b.data().eventDate?.toMillis?.()??0));
    list.innerHTML='';
    const upcomingEvents=events.filter(d=>{
      const eventDate=d.data().eventDate?.toDate?.();
      return !eventDate||eventDate>=new Date();
    });
    if(!events.length){
      updateHubSectionInfo({label:'Upcoming Events',count:0,note:'No events have been scheduled yet.'});
      list.innerHTML='<div class="hub-empty">No events scheduled yet.</div>';return;
    }
    updateHubSectionInfo({
      label:'Upcoming Events',
      count:upcomingEvents.length,
      note:upcomingEvents.length
        ? 'Upcoming operations are ordered by date and show current RSVP status.'
        : 'All current events have already passed.'
    });
    for(const d of events){
      const ev=d.data(),eid=d.id;
      const evDate=ev.eventDate?.toDate?.();
      const dateStr=evDate?evDate.toLocaleDateString([],{weekday:'short',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}):'TBD';
      const isPast=evDate&&evDate<new Date();
      const myRsvp=(ev.rsvpYes||[]).includes(currentUser.uid)?'yes':(ev.rsvpNo||[]).includes(currentUser.uid)?'no':null;
      const card=document.createElement('div');card.className='event-card';card.dataset.cardId=eid;
      if(isPast)card.style.opacity='.55';
      card.innerHTML=`<div class="event-title">${esc(ev.title||'Event')}</div>
        <div class="event-desc">${esc(ev.description||'')}</div>
        <div class="event-meta">
          <span class="event-date"><i class="fas fa-clock"></i> ${dateStr}</span>
          <span class="rsvp-count" id="rsvpCount_${eid}">✅ ${(ev.rsvpYes||[]).length} going</span>
        </div>
        ${!isPast?`<div class="event-rsvp-row">
          <button class="rsvp-btn yes${myRsvp==='yes'?' active':''}" data-eid="${eid}" data-action="yes">✅ Going</button>
          <button class="rsvp-btn no${myRsvp==='no'?' active':''}" data-eid="${eid}" data-action="no">❌ Can't go</button>
        </div>`:'<p style="font-family:var(--font-mono);font-size:.65rem;color:rgba(192,192,192,.3);margin-top:6px;">This event has passed.</p>'}`;
      // Wire RSVP buttons
      card.querySelectorAll('.rsvp-btn').forEach(btn=>{
        btn.addEventListener('click',async function(){
          const action=this.dataset.action,eid=this.dataset.eid;
          const ref=db.collection('events').doc(eid);
          const updateData={};
          if(action==='yes'){
            updateData.rsvpYes=firebase.firestore.FieldValue.arrayUnion(currentUser.uid);
            updateData.rsvpNo=firebase.firestore.FieldValue.arrayRemove(currentUser.uid);
          }else{
            updateData.rsvpNo=firebase.firestore.FieldValue.arrayUnion(currentUser.uid);
            updateData.rsvpYes=firebase.firestore.FieldValue.arrayRemove(currentUser.uid);
          }
          await ref.update(updateData).catch(e=>showToast(e.message));
          loadCalendar();
        });
      });
      list.appendChild(card);
    }
  }catch(err){list.innerHTML=`<div class="hub-empty" style="color:#f55;">Error: ${err.message}</div>`;}
}
/* ═══════════════════════════════════════════════════════
   INTEL BOARD
═══════════════════════════════════════════════════════ */
async function loadIntelBoard(){
  const list=document.getElementById('intelList');
  list.innerHTML='<div class="loading-spinner" style="grid-column:unset;padding:20px 0;"></div>';
  updateHubSectionInfo({label:'Intel Posts',count:'—',note:'Loading internal intel, updates, and published alerts.'});
  const canPost=isMod(currentUserData);
  try{
    const snap=await db.collection('intelPosts').get();
    const posts=snap.docs.sort((a,b)=>(b.data().createdAt?.toMillis?.()??0)-(a.data().createdAt?.toMillis?.()??0));
    list.innerHTML='';
    if(canPost){
      list.innerHTML=`<div style="margin-bottom:12px;display:flex;flex-direction:column;gap:6px;">
        <input type="text" id="intelTitle" class="input-field" placeholder="Intel title..." maxlength="80" style="font-size:.78rem;">
        <textarea id="intelBody" class="input-field" placeholder="Write intel post..." maxlength="600" style="min-height:60px;font-size:.75rem;resize:vertical;"></textarea>
        <input type="text" id="intelTag" class="input-field" placeholder="Tag (e.g. Recon, Alert, Update)" maxlength="20" style="font-size:.75rem;">
        <button class="btn-primary" id="postIntelBtn" style="justify-content:center;font-size:.75rem;padding:8px;"><i class="fas fa-satellite-dish"></i> Post Intel</button>
      </div>`;
      document.getElementById('postIntelBtn').addEventListener('click',async()=>{
        const title=document.getElementById('intelTitle').value.trim();
        const body=document.getElementById('intelBody').value.trim();
        const tag=document.getElementById('intelTag').value.trim();
        if(!title||!body){showToast('Title and body required.');return;}
        const btn=document.getElementById('postIntelBtn');
        btn.disabled=true;btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> Posting...';
        await db.collection('intelPosts').add({title,body,tag,authorName:currentUserData?.displayName||'Admin',authorRank:currentUserData?.rank||'Member',createdAt:firebase.firestore.FieldValue.serverTimestamp()}).catch(e=>showToast(e.message));
        writeCorpLog('intel',`posted new intel: "${title}"`);
        loadIntelBoard();
      });
    }
    if(!posts.length){
      updateHubSectionInfo({
        label:'Intel Posts',
        count:0,
        note:canPost?'No intel posts yet. Staff can publish the first post from this view.':'No intel posts have been published yet.'
      });
      list.innerHTML+='<div class="hub-empty">No intel posts yet.</div>';return;
    }
    updateHubSectionInfo({
      label:'Intel Posts',
      count:posts.length,
      note:canPost
        ? 'Recent intel and alerts. Staff can publish directly from this board.'
        : 'Recent intel, staff updates, and internal notices appear here first.'
    });
    posts.forEach(d=>{
      const p=d.data();
      const item=document.createElement('div');item.className='intel-post';item.dataset.cardId=d.id;
      item.innerHTML=`<div class="intel-post-title">${p.tag?`<span class="intel-tag">${esc(p.tag)}</span>`:''}${esc(p.title||'Intel')}</div>
        <div class="intel-post-body">${esc(p.body||'')}</div>
        <div class="intel-post-meta"><span>${esc(p.authorName||'Admin')} &middot; ${esc(p.authorRank||'')}</span><span>${p.createdAt?fmtDate(p.createdAt):''}</span></div>`;
      list.appendChild(item);
    });
  }catch(err){list.innerHTML=`<div class="hub-empty" style="color:#f55;">Error: ${err.message}</div>`;}
}
/* ═══════════════════════════════════════════════════════
   POLLS
═══════════════════════════════════════════════════════ */
async function loadPolls(){
  const list=document.getElementById('pollsList');
  list.innerHTML='<div class="loading-spinner" style="grid-column:unset;padding:20px 0;"></div>';
  updateHubSectionInfo({label:'Active Polls',count:'—',note:'Loading live polls and recent voting prompts.'});
  const canCreate=isAdmin(currentUserData);
  try{
    const snap=await db.collection('polls').get();
    const polls=snap.docs.sort((a,b)=>(b.data().createdAt?.toMillis?.()??0)-(a.data().createdAt?.toMillis?.()??0));
    list.innerHTML='';
    if(canCreate){
      list.innerHTML=`<div style="margin-bottom:14px;display:flex;flex-direction:column;gap:6px;">
        <input type="text" id="pollQuestion" class="input-field" placeholder="Poll question..." maxlength="120" style="font-size:.78rem;">
        <div id="pollOptionsWrap" style="display:flex;flex-direction:column;gap:4px;">
          <input type="text" class="poll-opt-inp input-field" placeholder="Option 1" maxlength="80" style="font-size:.75rem;">
          <input type="text" class="poll-opt-inp input-field" placeholder="Option 2" maxlength="80" style="font-size:.75rem;">
        </div>
        <button id="addPollOptBtn" style="background:none;border:1px solid rgba(192,192,192,.18);color:var(--color-text-muted);font-family:var(--font-mono);font-size:.65rem;padding:4px;border-radius:3px;cursor:pointer;">+ Add option</button>
        <button class="btn-primary" id="createPollBtn" style="justify-content:center;font-size:.75rem;padding:8px;"><i class="fas fa-poll"></i> Create Poll</button>
      </div>`;
      document.getElementById('addPollOptBtn').addEventListener('click',()=>{
        const inp=document.createElement('input');inp.type='text';inp.className='poll-opt-inp input-field';inp.placeholder='Option';inp.maxLength=80;inp.style.fontSize='.75rem';
        document.getElementById('pollOptionsWrap').appendChild(inp);
      });
      document.getElementById('createPollBtn').addEventListener('click',async()=>{
        const q=document.getElementById('pollQuestion').value.trim();
        const opts=[...document.querySelectorAll('.poll-opt-inp')].map(i=>i.value.trim()).filter(Boolean);
        if(!q||opts.length<2){showToast('Question and at least 2 options required.');return;}
        const btn=document.getElementById('createPollBtn');
        btn.disabled=true;btn.innerHTML='<i class="fas fa-spinner fa-spin"></i>';
        const votesObj={};opts.forEach(o=>{votesObj[o]=[];});
        await db.collection('polls').add({question:q,options:opts,votes:votesObj,createdAt:firebase.firestore.FieldValue.serverTimestamp()}).catch(e=>showToast(e.message));
        writeCorpLog('poll',`created a new poll: "${q}"`);
        loadPolls();
      });
    }
    if(!polls.length){
      updateHubSectionInfo({
        label:'Active Polls',
        count:0,
        note:canCreate?'No polls yet. Administrators can create the first poll here.':'No polls are currently active.'
      });
      list.innerHTML+='<div class="hub-empty">No polls yet.</div>';return;
    }
    updateHubSectionInfo({
      label:'Active Polls',
      count:polls.length,
      note:canCreate
        ? 'Live voting prompts with admin controls for new poll creation.'
        : 'Vote once per poll to help steer decisions and member direction.'
    });
    for(const d of polls){
      const p=d.data(),pid=d.id;
      const votes=p.votes||{};
      const totalVotes=Object.values(votes).reduce((s,arr)=>s+(arr.length||0),0);
      const myVote=Object.entries(votes).find(([opt,arr])=>arr.includes(currentUser.uid))?.[0];
      const card=document.createElement('div');card.className='poll-card';
      let optsHtml=(p.options||[]).map(opt=>{
        const count=(votes[opt]||[]).length;
        const pct=totalVotes?Math.round(count/totalVotes*100):0;
        const isVoted=myVote===opt;
        return`<div class="poll-option">
          <button class="poll-option-btn${isVoted?' voted':''}" data-pid="${pid}" data-opt="${esc(opt)}" ${myVote?'disabled':''}>
            ${myVote?`<div class="poll-bar" style="width:${pct}%"></div>`:''}
            <div class="poll-opt-text"><span>${esc(opt)}</span>${myVote?`<span>${pct}% (${count})</span>`:''}</div>
          </button></div>`;
      }).join('');
      card.innerHTML=`<div class="poll-question">${esc(p.question||'')}</div>${optsHtml}<div class="poll-meta">${totalVotes} vote${totalVotes!==1?'s':''} &middot; ${p.createdAt?fmtDate(p.createdAt):''}</div>`;
      card.querySelectorAll('.poll-option-btn:not([disabled])').forEach(btn=>{
        btn.addEventListener('click',async function(){
          const opt=this.dataset.opt,pid=this.dataset.pid;
          const ref=db.collection('polls').doc(pid);
          const snap2=await ref.get();if(!snap2.exists)return;
          const data=snap2.data();const vs=data.votes||{};
          // Remove from any existing choice first
          Object.keys(vs).forEach(k=>{vs[k]=(vs[k]||[]).filter(id=>id!==currentUser.uid);});
          if(!vs[opt])vs[opt]=[];
          vs[opt].push(currentUser.uid);
          await ref.update({votes:vs}).catch(e=>showToast(e.message));
          loadPolls();
        });
      });
      list.appendChild(card);
    }
  }catch(err){list.innerHTML=`<div class="hub-empty" style="color:#f55;">Error: ${err.message}</div>`;}
}
/* ═══════════════════════════════════════════════════════
   GROUP CHAT
═══════════════════════════════════════════════════════ */
let corpChatUnsub=null, corpChatOpen=false, corpChatLastSeen=0;
function openCorpChat(){
  corpChatOpen=true;
  corpChatLastSeen=Date.now();
  document.getElementById('corpChatPanel').classList.add('open');
  document.getElementById('chatUnreadBadge').classList.remove('show');
  if(!corpChatUnsub)startCorpChatListener();
}
function closeCorpChat(){
  corpChatOpen=false;
  document.getElementById('corpChatPanel').classList.remove('open');
}
function startCorpChatListener(){
  if(corpChatUnsub){corpChatUnsub();corpChatUnsub=null;}
  corpChatUnsub=db.collection('corpChat').orderBy('createdAt','asc').limitToLast(60).onSnapshot(snap=>{
    const body=document.getElementById('corpChatBody');
    body.innerHTML='';
    let lastDate='',lastUid='';
    snap.forEach(d=>{
      const m=d.data(),isMine=m.uid===currentUser.uid;
      const ds=m.createdAt?fmtDate(m.createdAt):'';
      if(ds&&ds!==lastDate){
        lastDate=ds;
        const sep=document.createElement('div');sep.className='corp-date-sep';sep.textContent=ds;body.appendChild(sep);
      }
      const wrap=document.createElement('div');wrap.className='corp-msg '+(isMine?'mine':'theirs');
      const showName=m.uid!==lastUid;
      lastUid=m.uid;
      const canDelCorpMsg=isCoAdmin(currentUserData)||isMine;
      let nameHtml=showName&&!isMine?`<div class="corp-msg-name">${esc(m.displayName||'?')}</div>`:'';
      let delHtml=canDelCorpMsg?`<button class="corp-del-btn" data-id="${d.id}" title="Delete" style="background:none;border:none;color:rgba(244,67,54,.35);font-size:.58rem;cursor:pointer;padding:1px 3px;opacity:0;transition:opacity .2s;align-self:center;flex-shrink:0;"><i class="fas fa-trash"></i></button>`:'';
      wrap.innerHTML=`${nameHtml}<div class="corp-msg-bubble">${esc(m.text||'')}</div>${delHtml}<div class="corp-msg-time" style="clear:both;">${fmtTime(m.createdAt)}</div>`;
      if(canDelCorpMsg){
        const db2=wrap.querySelector('.corp-del-btn');
        if(db2){
          wrap.addEventListener('mouseenter',()=>{db2.style.opacity='1';});
          wrap.addEventListener('mouseleave',()=>{db2.style.opacity='0';});
          db2.addEventListener('click',async e=>{
            e.stopPropagation();
            if(!confirm('Delete this message?'))return;
            await db.collection('corpChat').doc(db2.dataset.id).delete().catch(e2=>showToast(e2.message));
          });
        }
      }
      body.appendChild(wrap);
    });
    body.scrollTop=body.scrollHeight;
    // Show unread badge if panel is closed
    if(!corpChatOpen){
      const badge=document.getElementById('chatUnreadBadge');
      badge.classList.add('show');
    }
    // Update online count
    document.getElementById('corpChatOnline').textContent='';
  },err=>console.error('Corp chat error:',err));
}
async function sendCorpChatMsg(){
  const input=document.getElementById('corpChatInput');
  const text=input.value.trim();if(!text)return;
  input.value='';
  await db.collection('corpChat').add({
    uid:currentUser.uid,
    displayName:currentUserData?.displayName||'Unknown',
    rank:currentUserData?.rank||'Member',
    text,
    createdAt:firebase.firestore.FieldValue.serverTimestamp()
  }).catch(e=>{input.value=text;showToast('Failed to send: '+e.message);});
}
document.getElementById('corpChatBtn').addEventListener('click',()=>{
  corpChatOpen?closeCorpChat():openCorpChat();
});
document.getElementById('corpChatClose').addEventListener('click',closeCorpChat);
document.getElementById('corpChatSend').addEventListener('click',sendCorpChatMsg);
document.getElementById('corpChatInput').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendCorpChatMsg();}});
/* ═══════════════════════════════════════════════════════
   ENGAGEMENT HUB MODAL
═══════════════════════════════════════════════════════ */
const HUB_SUMMARY_CONFIG={
  log:{
    eyebrow:'Live Coordination',
    title:'Corporation Feed',
    meta:'Track joins, ranks, mission submissions, connections, and internal status changes in one stream.',
    label:'Activity Feed',
    note:'Recent member actions, system updates, and internal signals.'
  },
  missions:{
    eyebrow:'Objective Queue',
    title:'Mission Board',
    meta:'Review active objectives, submit mission keys, and track approval state from a single board.',
    label:'Active Missions',
    note:'Mission cards show live status, points, and your current submission state.'
  },
  leaderboard:{
    eyebrow:'Top Performers',
    title:'Leaderboard',
    meta:'See who is leading the network by points, activity, and overall operational momentum.',
    label:'Ranked Operatives',
    note:'The board reflects live point totals across visible members.'
  },
  calendar:{
    eyebrow:'Upcoming Operations',
    title:'Calendar',
    meta:'Review scheduled events, upcoming dates, and attendance signals across the corporation.',
    label:'Upcoming Events',
    note:'Use RSVP status to coordinate attendance around future operations.'
  },
  intel:{
    eyebrow:'Internal Updates',
    title:'Intel Board',
    meta:'Read internal intel posts, alerts, and operational notes published by staff.',
    label:'Intel Posts',
    note:'Recent intel, staff updates, and internal notices appear here first.'
  },
  polls:{
    eyebrow:'Group Decisions',
    title:'Polls',
    meta:'Surface member input quickly through live polls and lightweight decision prompts.',
    label:'Active Polls',
    note:'Vote once per poll to help steer decisions and member direction.'
  }
};
function updateHubChrome(tab){
  const cfg=HUB_SUMMARY_CONFIG[tab]||HUB_SUMMARY_CONFIG.log;
  document.getElementById('hubSummaryEyebrow').textContent=cfg.eyebrow;
  document.getElementById('hubSummaryTitle').textContent=cfg.title;
  document.getElementById('hubSummaryMeta').textContent=cfg.meta;
  document.getElementById('hubSectionLabel').textContent=cfg.label;
  document.getElementById('hubSectionNote').textContent=cfg.note;
  document.getElementById('hubSectionCount').textContent='—';
  document.getElementById('hubViewerRank').textContent=currentUserData?.rank?`${currentUserData.rank} Access`:'Member Access';
}
function updateHubSectionInfo({label,count,note}={}){
  if(label)document.getElementById('hubSectionLabel').textContent=label;
  if(note)document.getElementById('hubSectionNote').textContent=note;
  document.getElementById('hubSectionCount').textContent=count===undefined?'—':String(count);
}
async function loadHubQuickStats(){
  try{
    const [onlineSnap,missionsSnap,eventsSnap,intelSnap]=await Promise.all([
      db.collection('users').where('status','==','online').get(),
      db.collection('missions').where('active','==',true).get(),
      db.collection('events').get(),
      db.collection('intelPosts').get()
    ]);
    const now=Date.now();
    const upcomingEvents=eventsSnap.docs.filter(d=>{
      const eventDate=d.data().eventDate?.toDate?.();
      return !eventDate||eventDate.getTime()>=now;
    }).length;
    document.getElementById('hubQuickOnline').textContent=onlineSnap.size;
    document.getElementById('hubQuickMissions').textContent=missionsSnap.size;
    document.getElementById('hubQuickEvents').textContent=upcomingEvents;
    document.getElementById('hubQuickIntel').textContent=intelSnap.size;
  }catch(err){
    console.error('Hub quick stats failed:',err);
    ['hubQuickOnline','hubQuickMissions','hubQuickEvents','hubQuickIntel'].forEach(id=>{
      document.getElementById(id).textContent='—';
    });
  }
}
const HUB_TAB_COLLECTIONS={
  log:{collection:'corpLog',ts:'createdAt'},
  missions:{collection:'missions',ts:'createdAt'},
  calendar:{collection:'events',ts:'createdAt'},
  intel:{collection:'intelPosts',ts:'createdAt'},
  polls:{collection:'polls',ts:'createdAt'}
};
async function refreshHubTabBadges(){
  if(!currentUser||currentUser.isAnonymous)return;
  const seenMap=currentUserData?.hubTabLastSeen||{};
  for(const [tab,cfg] of Object.entries(HUB_TAB_COLLECTIONS)){
    const badge=document.getElementById(`hubBadge${tab.charAt(0).toUpperCase()+tab.slice(1)}`);
    if(!badge)continue;
    const seen=seenMap[tab]?.toMillis?.()||0;
    try{
      const snap=await db.collection(cfg.collection).orderBy(cfg.ts,'desc').limit(20).get();
      const fresh=snap.docs.filter(d=>(d.data()[cfg.ts]?.toMillis?.()||0)>seen).length;
      if(fresh>0){badge.textContent=fresh>9?'9+':String(fresh);badge.classList.add('show');}
      else{badge.textContent='';badge.classList.remove('show');}
    }catch(_){
      badge.textContent='';badge.classList.remove('show');
    }
  }
}
async function markHubTabSeen(tab){
  if(!currentUser||currentUser.isAnonymous||!HUB_TAB_COLLECTIONS[tab])return;
  try{
    await db.collection('users').doc(currentUser.uid).update({
      [`hubTabLastSeen.${tab}`]:firebase.firestore.FieldValue.serverTimestamp()
    });
    if(!currentUserData.hubTabLastSeen)currentUserData.hubTabLastSeen={};
    currentUserData.hubTabLastSeen[tab]={toMillis:()=>Date.now()};
    const badge=document.getElementById(`hubBadge${tab.charAt(0).toUpperCase()+tab.slice(1)}`);
    if(badge){badge.textContent='';badge.classList.remove('show');}
  }catch(_){}
}
async function openEngagementHub(tab='log',targetId=''){
  if(!currentUser||currentUser.isAnonymous){
    promptGuestRegister('Create a free account to access the Corp Hub.');
    return;
  }
  openModal('engagementModal');
  updateHubChrome(tab);
  loadHubQuickStats();
  refreshHubTabBadges();
  // Activate correct tab
  document.querySelectorAll('.hub-tab').forEach(b=>{b.classList.toggle('active',b.dataset.hub===tab);});
  document.querySelectorAll('.hub-section').forEach(s=>{s.classList.toggle('active',s.id==='hub'+tab.charAt(0).toUpperCase()+tab.slice(1));});
  await loadHubTab(tab);
  markHubTabSeen(tab);
  if(targetId)highlightHubCard(targetId);
  // Tab switching
  document.querySelectorAll('.hub-tab').forEach(btn=>{
    btn.onclick=async()=>{
      document.querySelectorAll('.hub-tab').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('.hub-section').forEach(s=>s.classList.remove('active'));
      btn.classList.add('active');
      const section=document.getElementById('hub'+btn.dataset.hub.charAt(0).toUpperCase()+btn.dataset.hub.slice(1));
      if(section)section.classList.add('active');
      updateHubChrome(btn.dataset.hub);
      await loadHubTab(btn.dataset.hub);
      markHubTabSeen(btn.dataset.hub);
    };
  });
}
function highlightHubCard(targetId){
  // Allow listeners/onSnapshot a moment to render before we look for the node.
  let attempts=0;
  const tryFind=()=>{
    const node=document.querySelector(`#engagementModal [data-card-id="${CSS.escape(targetId)}"]`);
    if(node){
      node.scrollIntoView({behavior:'smooth',block:'center'});
      node.classList.add('deep-link-flash');
      setTimeout(()=>node.classList.remove('deep-link-flash'),2400);
      return;
    }
    if(++attempts<8)setTimeout(tryFind,150);
  };
  tryFind();
}
async function loadHubTab(tab){
  if(tab==='log')loadCorpLog(document.querySelector('.log-filter-btn.active')?.dataset.filter||'all');
  else if(tab==='missions')loadMissions();
  else if(tab==='leaderboard')loadLeaderboard();
  else if(tab==='calendar')loadCalendar();
  else if(tab==='intel')loadIntelBoard();
  else if(tab==='polls')loadPolls();
  else if(tab==='squads')loadSquads();
}
/* ── SQUADS ── */
const SQUAD_MAX_MEMBERS=5;
async function loadSquads(){
  const list=document.getElementById('squadsList');
  const controls=document.getElementById('squadsControls');
  list.innerHTML='<div class="loading-spinner" style="grid-column:unset;padding:20px 0;"></div>';
  updateHubSectionInfo({label:'Squads',count:'—',note:'Loading squad rosters and combined point totals.'});
  try{
    const [squadsSnap,usersSnap]=await Promise.all([
      db.collection('squads').get(),
      db.collection('users').get()
    ]);
    const usersById={};
    usersSnap.forEach(d=>{usersById[d.id]={...d.data(),id:d.id};});
    const squads=squadsSnap.docs.map(d=>({...d.data(),id:d.id}));
    const mySquad=squads.find(s=>(s.members||[]).includes(currentUser.uid));
    // Controls
    if(mySquad){
      const isLeader=mySquad.leaderUid===currentUser.uid;
      controls.innerHTML=`<div class="squad-mine"><strong>You're in:</strong> <span class="squad-mine-name">${esc(mySquad.name||'Unnamed Squad')}</span> ${isLeader?'<span class="squad-leader-pill">LEADER</span>':''}</div>`;
    }else{
      controls.innerHTML=`<button class="btn-primary" id="createSquadBtn" style="font-size:.75rem;padding:8px 12px;"><i class="fas fa-plus"></i> Create Squad</button>`;
      document.getElementById('createSquadBtn').addEventListener('click',createSquadPrompt);
    }
    // Sort by total points desc
    const withTotals=squads.map(s=>{
      const total=(s.members||[]).reduce((sum,uid)=>sum+(usersById[uid]?.points||0),0);
      return {...s,_total:total};
    }).sort((a,b)=>b._total-a._total);
    if(!withTotals.length){
      list.innerHTML='<div class="hub-empty">No squads formed yet. Be the first to create one.</div>';
      updateHubSectionInfo({label:'Squads',count:0,note:'No squads exist yet.'});
      return;
    }
    updateHubSectionInfo({label:'Squads',count:withTotals.length,note:'Members combine their points into a shared squad total. Max 5 per squad.'});
    list.innerHTML='';
    withTotals.forEach(s=>{
      const isLeader=s.leaderUid===currentUser.uid;
      const isMember=(s.members||[]).includes(currentUser.uid);
      const card=document.createElement('div');card.className='squad-card';card.dataset.cardId=s.id;
      const memberAvs=(s.members||[]).map(uid=>{
        const u=usersById[uid]||{};
        return `<div class="squad-member-av" title="${esc(u.displayName||uid)}">${avHtml(u.photoURL,u.displayName)}</div>`;
      }).join('');
      const tag=s.tag?`<span class="squad-tag">[${esc(s.tag)}]</span>`:'';
      card.innerHTML=`
        <div class="squad-header">
          <div class="squad-info">
            <div class="squad-name">${tag} ${esc(s.name||'Unnamed')}</div>
            <div class="squad-leader">Led by ${esc(usersById[s.leaderUid]?.displayName||'—')}</div>
          </div>
          <div class="squad-total"><strong>${s._total}</strong><span>pts</span></div>
        </div>
        <div class="squad-members">${memberAvs}</div>
        <div class="squad-meta">${(s.members||[]).length} / ${SQUAD_MAX_MEMBERS} operatives</div>
        <div class="squad-actions">
          ${isLeader?`<button class="btn-sm" data-act="manage" data-sid="${s.id}"><i class="fas fa-users-cog"></i> Manage</button><button class="btn-sm danger" data-act="disband" data-sid="${s.id}"><i class="fas fa-trash"></i> Disband</button>`:''}
          ${isMember&&!isLeader?`<button class="btn-sm danger" data-act="leave" data-sid="${s.id}"><i class="fas fa-sign-out-alt"></i> Leave</button>`:''}
        </div>`;
      card.querySelectorAll('button[data-act]').forEach(btn=>{
        btn.addEventListener('click',()=>{
          const act=btn.dataset.act;
          if(act==='manage')manageSquad(s,usersById);
          else if(act==='disband')disbandSquad(s.id);
          else if(act==='leave')leaveSquad(s.id);
        });
      });
      list.appendChild(card);
    });
  }catch(err){
    list.innerHTML=`<div class="hub-empty" style="color:#f55;">Error: ${esc(err.message)}</div>`;
  }
}
async function createSquadPrompt(){
  const name=prompt('Squad name (max 30 chars):');
  if(!name)return;
  const tag=prompt('Optional tag (3-5 letters, leave blank for none):')||'';
  try{
    const ref=await db.collection('squads').add({
      name:name.slice(0,30),
      tag:tag.slice(0,5).toUpperCase(),
      leaderUid:currentUser.uid,
      members:[currentUser.uid],
      createdAt:firebase.firestore.FieldValue.serverTimestamp()
    });
    writeCorpLog('squad',`formed squad "${name}"`,{squadId:ref.id});
    showToast('Squad created.');
    loadSquads();
  }catch(err){showToast('Create failed: '+err.message);}
}
async function manageSquad(squad,usersById){
  const members=squad.members||[];
  const action=prompt(`Squad "${squad.name}"\nMembers: ${members.length}/${SQUAD_MAX_MEMBERS}\n\nType:\n  add <uid|name> — recruit a member\n  remove <uid|name> — remove a member\n  rename <new name> — rename squad\n\nCurrent members:\n${members.map(uid=>'  '+(usersById[uid]?.displayName||uid)).join('\n')}`);
  if(!action)return;
  const [cmd,...rest]=action.trim().split(/\s+/);
  const arg=rest.join(' ').trim();
  try{
    if(cmd==='add'){
      if(members.length>=SQUAD_MAX_MEMBERS){showToast('Squad is full.');return;}
      const target=Object.values(usersById).find(u=>u.id===arg||(u.displayName||'').toLowerCase()===arg.toLowerCase());
      if(!target){showToast('No matching user.');return;}
      if(members.includes(target.id)){showToast('Already in squad.');return;}
      // Make sure they're not in another squad
      const others=await db.collection('squads').where('members','array-contains',target.id).get();
      if(!others.empty){showToast(`${target.displayName} is already in a squad.`);return;}
      await db.collection('squads').doc(squad.id).update({members:firebase.firestore.FieldValue.arrayUnion(target.id)});
      writeCorpLog('squad',`recruited ${target.displayName||'an operative'} into ${squad.name}`,{squadId:squad.id});
      showToast(`Added ${target.displayName}.`);
    }else if(cmd==='remove'){
      const target=Object.values(usersById).find(u=>u.id===arg||(u.displayName||'').toLowerCase()===arg.toLowerCase());
      if(!target){showToast('No matching user.');return;}
      if(target.id===squad.leaderUid){showToast('Leader cannot be removed. Disband or transfer.');return;}
      await db.collection('squads').doc(squad.id).update({members:firebase.firestore.FieldValue.arrayRemove(target.id)});
      showToast(`Removed ${target.displayName}.`);
    }else if(cmd==='rename'){
      if(!arg){showToast('Provide a new name.');return;}
      await db.collection('squads').doc(squad.id).update({name:arg.slice(0,30)});
      showToast('Renamed.');
    }else{
      showToast('Unknown command.');return;
    }
    loadSquads();
  }catch(err){showToast('Failed: '+err.message);}
}
async function disbandSquad(sid){
  if(!confirm('Disband this squad? This cannot be undone.'))return;
  try{
    await db.collection('squads').doc(sid).delete();
    writeCorpLog('squad','disbanded their squad',{squadId:sid});
    showToast('Squad disbanded.');
    loadSquads();
  }catch(err){showToast('Failed: '+err.message);}
}
async function leaveSquad(sid){
  if(!confirm('Leave this squad?'))return;
  try{
    await db.collection('squads').doc(sid).update({members:firebase.firestore.FieldValue.arrayRemove(currentUser.uid)});
    showToast('Left squad.');
    loadSquads();
  }catch(err){showToast('Failed: '+err.message);}
}
document.getElementById('closeEngagement').addEventListener('click',()=>{
  closeModal('engagementModal');
  if(corpLogUnsub){corpLogUnsub();corpLogUnsub=null;}
});
document.getElementById('corpHubBtn').addEventListener('click',e=>{
  e.preventDefault();
  dropdownMenu.classList.remove('open');
  openEngagementHub();
});
/* ═══════════════════════════════════════════════════════
   HOME COMMAND BOARD
═══════════════════════════════════════════════════════ */
const HOME_PREVIEW_CONFIG={
  log:{
    eyebrow:'Live Activity',
    title:'Corporation Feed',
    meta:'Recent signals and ongoing work across the corporation.',
    openLabel:'Open Activity'
  },
  missions:{
    eyebrow:'Mission Queue',
    title:'Mission Board',
    meta:'Active objectives and current submission status.',
    openLabel:'Open Missions'
  },
  leaderboard:{
    eyebrow:'Top Operatives',
    title:'Leaderboard',
    meta:'Current point standings across active members.',
    openLabel:'Open Rankings'
  },
  intel:{
    eyebrow:'Intel Stream',
    title:'Intel Board',
    meta:'Latest internal posts, updates, and alerts.',
    openLabel:'Open Intel'
  }
};
let homePreviewTab='log';
let homePreviewRequestId=0;

function isGuestViewer(){
  return !currentUser||currentUser.isAnonymous||currentUserData?.isAnonymous;
}

function truncateText(text,maxLen=120){
  const clean=String(text||'').trim();
  if(clean.length<=maxLen)return clean;
  return clean.slice(0,maxLen-1)+'…';
}

function buildPreviewRow({icon,title,text,meta,badge='',targetId=''}){
  const targetAttr=targetId?` data-target-id="${esc(targetId)}"`:'';
  return `<button type="button" class="preview-row preview-row-button"${targetAttr}>
    <div class="preview-row-icon"><i class="fas ${icon}"></i></div>
    <div class="preview-row-body">
      <div class="preview-row-title">${title}${badge?`<span class="preview-state">${badge}</span>`:''}</div>
      <div class="preview-row-text">${text}</div>
      <div class="preview-row-meta">${meta}</div>
    </div>
    <div class="preview-row-arrow"><i class="fas fa-arrow-right"></i></div>
  </button>`;
}

function buildLockedPreview(reason){
  return `<div class="preview-locked"><strong>Access Required</strong><br>${esc(reason)}</div>`;
}

function updateCommandBoardIdentity(){
  const isGuest=isGuestViewer();
  const accessBadge=document.getElementById('commandAccessBadge');
  const boardCopy=document.getElementById('commandBoardCopy');
  const rankValue=document.getElementById('commandRankValue');
  const primaryLabel=document.getElementById('commandPrimaryLabel');
  const primaryAction=document.getElementById('commandPrimaryAction');
  if(isGuest){
    accessBadge.textContent=currentUser?.isAnonymous?'Guest Access':'Public Access';
    boardCopy.textContent='A cleaner operational view of corporation activity, missions, leaderboards, and internal signals.';
    rankValue.textContent=currentUser?.isAnonymous?'Guest':'Visitor';
    primaryLabel.textContent=currentUser?.isAnonymous?'Unlock Member Access':'Create Account';
    primaryAction.title='Create a free account to access the full corp hub.';
    return;
  }
  accessBadge.textContent=currentUserData?.rank||'Member';
  boardCopy.textContent=currentUserData?.activityStatus
    ? `Live overview for ${(currentUserData.displayName||'this operative')}. Current activity: "${currentUserData.activityStatus}".`
    : 'Live overview of corporation activity, missions, leaderboards, and internal signals.';
  rankValue.textContent=currentUserData?.rank||'Member';
  primaryLabel.textContent='Open Corp Hub';
  primaryAction.title='Open the full Corporation Hub.';
}

function updateHomePreviewHeader(tab){
  const cfg=HOME_PREVIEW_CONFIG[tab]||HOME_PREVIEW_CONFIG.log;
  document.getElementById('homePreviewEyebrow').textContent=cfg.eyebrow;
  document.getElementById('homePreviewTitle').textContent=cfg.title;
  document.getElementById('homePreviewMeta').textContent=cfg.meta;
  document.getElementById('homePreviewOpenBtn').textContent=cfg.openLabel;
  document.querySelectorAll('.command-tab').forEach(btn=>{
    btn.classList.toggle('active',btn.dataset.previewTab===tab);
  });
}

async function loadHomeLogPreview(){
  const guestItems=[
    {icon:'fa-satellite-dish',title:'Platform Restructure',text:'TheSizNexus is rebuilding its member platform and tightening the dashboard experience.',meta:'Public status',badge:'Live'},
    {icon:'fa-comments',title:'Discord Coordination',text:'Discord remains the active public coordination channel while internal tools continue to mature.',meta:'Primary channel',badge:'Active'},
    {icon:'fa-shield-alt',title:'Access Model',text:'Full corp activity, missions, and internal boards unlock through a free account and clearance rank.',meta:'Member access',badge:'Invite-led'}
  ];
  if(isGuestViewer())return guestItems.map(buildPreviewRow).join('');
  const snap=await db.collection('corpLog').orderBy('createdAt','desc').limit(5).get();
  const visibleDocs=snap.docs.filter(d=>{
    const t=d.data().type;
    if(PRIVATE_LOG_TYPES.includes(t)&&!isDev(currentUserData))return false;
    return true;
  });
  if(!visibleDocs.length)return '<div class="hub-empty">No activity yet.</div>';
  const typeIcon={join:'fa-door-open',rank:'fa-id-badge',mission:'fa-crosshairs',connection:'fa-user-friends',status:'fa-circle',profile:'fa-user-edit',intel:'fa-satellite-dish',poll:'fa-poll',announcement:'fa-bullhorn',streak:'fa-fire',motw:'fa-trophy'};
  return visibleDocs.map(d=>{
    const log=d.data();
    const time=log.createdAt?`${fmtDate(log.createdAt)} ${fmtTime(log.createdAt)}`:'Recent';
    return buildPreviewRow({
      icon:typeIcon[log.type]||'fa-circle',
      title:esc(log.displayName||'Unknown'),
      text:esc(log.message||'No details available.'),
      meta:`${esc(log.rank||'Member')} • ${time}`,
      badge:esc(log.type||'update'),
      targetId:d.id
    });
  }).join('');
}

async function loadHomeMissionPreview(){
  if(isGuestViewer())return buildLockedPreview('Create a free account to unlock missions, key submissions, and the full corp hub.');
  const [missionsSnap,mySubsSnap]=await Promise.all([
    db.collection('missions').where('active','==',true).get(),
    db.collection('missionSubmissions').where('uid','==',currentUser.uid).get()
  ]);
  const mySubsMap={};
  mySubsSnap.forEach(d=>{mySubsMap[d.data().missionId]=d.data();});
  if(missionsSnap.empty)return '<div class="hub-empty">No active missions right now.</div>';
  return missionsSnap.docs.slice(0,4).map(d=>{
    const m=d.data();
    const mySub=mySubsMap[d.id];
    let badge='Open';
    if(mySub?.status==='pending')badge='Pending';
    else if(mySub?.status==='approved')badge='Completed';
    else if(mySub?.status==='rejected')badge='Rejected';
    return buildPreviewRow({
      icon:'fa-crosshairs',
      title:esc(m.title||'Mission'),
      text:esc(truncateText(m.description||'Mission briefing unavailable.',110)),
      meta:`${m.points||50} pts`,
      badge,
      targetId:d.id
    });
  }).join('');
}

async function loadHomeLeaderboardPreview(){
  if(isGuestViewer())return buildLockedPreview('Create a free account to see ranking movement, your score, and the full leaderboard.');
  const snap=await db.collection('users').get();
  const users=[];
  snap.forEach(d=>{const u=d.data();u.id=d.id;if(!u.isAnonymous)users.push(u);});
  users.sort((a,b)=>(b.points||0)-(a.points||0));
  if(!users.length)return '<div class="hub-empty">No ranked operatives yet.</div>';
  return users.slice(0,5).map((u,index)=>buildPreviewRow({
    icon:index===0?'fa-trophy':'fa-chevron-up',
    title:`#${index+1} ${esc(u.displayName||'Unknown')}`,
    text:`Current rank: ${esc(u.rank||'Member')}${u.id===currentUser.uid?' • You are on the board.':''}`,
    meta:`${u.points||0} pts`,
    badge:u.id===currentUser.uid?'You':'Top',
    targetId:u.id
  })).join('');
}

async function loadHomeIntelPreview(){
  if(isGuestViewer())return buildLockedPreview('Create a free account to unlock internal intel posts and live updates.');
  const snap=await db.collection('intelPosts').orderBy('createdAt','desc').limit(4).get();
  if(snap.empty)return '<div class="hub-empty">No intel posts yet.</div>';
  return snap.docs.map(d=>{
    const post=d.data();
    return buildPreviewRow({
      icon:'fa-satellite-dish',
      title:esc(post.title||'Intel'),
      text:esc(truncateText(post.body||'No details available.',120)),
      meta:`${esc(post.authorName||'Admin')} • ${post.createdAt?fmtDate(post.createdAt):'Recent'}`,
      badge:esc(post.tag||'Intel'),
      targetId:d.id
    });
  }).join('');
}

async function loadHomePreview(tab=homePreviewTab){
  homePreviewTab=tab;
  updateHomePreviewHeader(tab);
  const list=document.getElementById('homePreviewList');
  const requestId=++homePreviewRequestId;
  list.innerHTML='<div class="hub-empty">Loading board...</div>';
  try{
    let html='';
    if(tab==='log')html=await loadHomeLogPreview();
    else if(tab==='missions')html=await loadHomeMissionPreview();
    else if(tab==='leaderboard')html=await loadHomeLeaderboardPreview();
    else if(tab==='intel')html=await loadHomeIntelPreview();
    if(requestId!==homePreviewRequestId)return;
    list.innerHTML=html;
  }catch(err){
    console.error('Home preview load failed:',err);
    if(requestId!==homePreviewRequestId)return;
    list.innerHTML='<div class="preview-locked"><strong>Board Offline</strong><br>Unable to load this view right now.</div>';
  }
}

async function loadNetworkSnapshot(){
  const missionEl=document.getElementById('snapshotMissionCount');
  const eventEl=document.getElementById('snapshotEventCount');
  const intelEl=document.getElementById('snapshotIntelCount');
  const missionLeadEl=document.getElementById('snapshotMissionLead');
  const eventLeadEl=document.getElementById('snapshotEventLead');
  const intelLeadEl=document.getElementById('snapshotIntelLead');
  const noticeEl=document.getElementById('snapshotNotice');
  try{
    const [missionsSnap,eventsSnap,intelSnap,annSnap]=await Promise.all([
      db.collection('missions').where('active','==',true).get(),
      db.collection('events').get(),
      db.collection('intelPosts').get(),
      db.collection('announcements').orderBy('createdAt','desc').limit(1).get()
    ]);
    const now=Date.now();
    const upcomingEvents=eventsSnap.docs.filter(d=>{
      const eventDate=d.data().eventDate?.toDate?.();
      return !eventDate||eventDate.getTime()>=now;
    }).length;
    const sortedMissions=missionsSnap.docs.sort((a,b)=>(b.data().createdAt?.toMillis?.()??0)-(a.data().createdAt?.toMillis?.()??0));
    const sortedEvents=eventsSnap.docs
      .filter(d=>{
        const eventDate=d.data().eventDate?.toDate?.();
        return !eventDate||eventDate.getTime()>=now;
      })
      .sort((a,b)=>(a.data().eventDate?.toMillis?.()??Number.MAX_SAFE_INTEGER)-(b.data().eventDate?.toMillis?.()??Number.MAX_SAFE_INTEGER));
    const sortedIntel=intelSnap.docs.sort((a,b)=>(b.data().createdAt?.toMillis?.()??0)-(a.data().createdAt?.toMillis?.()??0));
    missionEl.textContent=missionsSnap.size;
    eventEl.textContent=upcomingEvents;
    intelEl.textContent=intelSnap.size;
    missionLeadEl.textContent=sortedMissions.length
      ? `${sortedMissions[0].data().title||'Mission'} • ${sortedMissions[0].data().points||50} pts`
      : 'No active missions right now.';
    if(sortedEvents.length){
      const nextEvent=sortedEvents[0].data();
      const eventDate=nextEvent.eventDate?.toDate?.();
      const eventMeta=eventDate
        ? eventDate.toLocaleDateString([],{month:'short',day:'numeric'})
        : 'Date pending';
      eventLeadEl.textContent=`${nextEvent.title||'Upcoming event'} • ${eventMeta}`;
    }else{
      eventLeadEl.textContent='No upcoming events scheduled.';
    }
    intelLeadEl.textContent=sortedIntel.length
      ? `${sortedIntel[0].data().tag?`${sortedIntel[0].data().tag} • `:''}${sortedIntel[0].data().title||'Intel post'}`
      : 'No intel posts published yet.';
    if(!annSnap.empty){
      const ann=annSnap.docs[0].data();
      noticeEl.textContent=`${ann.title||'Notice'}: ${truncateText(ann.body||'No details available.',120)}`;
    }else{
      noticeEl.textContent='No live announcements. Discord remains the current coordination channel.';
    }
  }catch(err){
    console.error('Snapshot load failed:',err);
    missionEl.textContent='—';
    eventEl.textContent='—';
    intelEl.textContent='—';
    missionLeadEl.textContent='Mission data unavailable.';
    eventLeadEl.textContent='Event data unavailable.';
    intelLeadEl.textContent='Intel data unavailable.';
    noticeEl.textContent=isGuestViewer()
      ? 'Live counts unlock inside the member dashboard. Discord remains the active public channel.'
      : 'Snapshot unavailable right now. Try opening the full Corp Hub.';
  }
}

function refreshDashboardSurface(){
  updateCommandBoardIdentity();
  loadHomePreview(homePreviewTab);
  loadNetworkSnapshot();
  loadFeaturedMembers();
  refreshStreakPanel();
}

/* ── DAILY CHECK-IN STREAK ── */
function ymdUTC(d=new Date()){
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`;
}
function daysBetweenYMD(a,b){
  const da=new Date(a+'T00:00:00Z'),db=new Date(b+'T00:00:00Z');
  return Math.round((db-da)/86400000);
}
function refreshStreakPanel(){
  const panel=document.getElementById('streak-panel');
  if(!panel)return;
  if(isGuestViewer()){panel.classList.add('guest-hidden');return;}
  panel.classList.remove('guest-hidden');
  const cur=currentUserData?.currentStreak||0;
  const best=Math.max(currentUserData?.longestStreak||0,cur);
  const lastYmd=currentUserData?.lastCheckIn?.toDate?ymdUTC(currentUserData.lastCheckIn.toDate()):'';
  const today=ymdUTC();
  const checkedToday=lastYmd===today;
  document.getElementById('streakCurrent').textContent=cur;
  document.getElementById('streakBest').textContent=`Personal best: ${best} day${best===1?'':'s'}`;
  const sub=document.getElementById('streakSublabel');
  const btn=document.getElementById('streakCheckInBtn');
  const lbl=document.getElementById('streakCheckInLabel');
  const hint=document.getElementById('streakHint');
  if(checkedToday){
    sub.textContent='Checked in today. Come back tomorrow.';
    btn.disabled=true;
    btn.classList.add('streak-done');
    lbl.textContent='Locked In';
    hint.textContent=`Next check-in resets in ~${24-new Date().getUTCHours()}h (UTC).`;
  }else{
    btn.disabled=false;
    btn.classList.remove('streak-done');
    lbl.textContent=cur>0?`Continue Streak (Day ${cur+1})`:'Start Your Streak';
    sub.textContent=cur>0?`On day ${cur}. Don't break the chain.`:'Start tracking your activity today.';
    hint.textContent='A daily check-in keeps your streak alive. Miss a UTC day and it resets to 1.';
  }
}
async function doDailyCheckIn(){
  if(!currentUser||currentUser.isAnonymous){
    promptGuestRegister('Create a free account to start your daily streak.');
    return;
  }
  const today=ymdUTC();
  const lastYmd=currentUserData?.lastCheckIn?.toDate?ymdUTC(currentUserData.lastCheckIn.toDate()):'';
  if(lastYmd===today){showToast('Already checked in today.');return;}
  const prevStreak=currentUserData?.currentStreak||0;
  const prevBest=currentUserData?.longestStreak||0;
  let newStreak=1;
  if(lastYmd){
    const delta=daysBetweenYMD(lastYmd,today);
    if(delta===1)newStreak=prevStreak+1;
    // delta>=2 → reset to 1
  }
  const newBest=Math.max(prevBest,newStreak);
  const btn=document.getElementById('streakCheckInBtn');
  btn.disabled=true;
  try{
    await db.collection('users').doc(currentUser.uid).update({
      lastCheckIn:firebase.firestore.FieldValue.serverTimestamp(),
      currentStreak:newStreak,
      longestStreak:newBest
    });
    if(currentUserData){
      currentUserData.lastCheckIn={toDate:()=>new Date()};
      currentUserData.currentStreak=newStreak;
      currentUserData.longestStreak=newBest;
    }
    const milestone=[7,14,30,60,100,365].includes(newStreak)?` 🔥 ${newStreak}-day milestone!`:'';
    writeCorpLog('streak',`checked in (day ${newStreak})${milestone}`,{streak:newStreak});
    showToast(`Checked in. Streak: ${newStreak} day${newStreak===1?'':'s'}.${milestone}`);
    refreshStreakPanel();
  }catch(err){
    showToast('Check-in failed: '+err.message);
    btn.disabled=false;
  }
}
document.getElementById('streakCheckInBtn')?.addEventListener('click',doDailyCheckIn);

document.querySelectorAll('.command-tab').forEach(btn=>{
  btn.addEventListener('click',()=>loadHomePreview(btn.dataset.previewTab));
});
document.getElementById('homePreviewList').addEventListener('click',e=>{
  const btn=e.target.closest('.preview-row-button');
  if(!btn)return;
  if(isGuestViewer()){
    promptGuestRegister('Create a free account to access the Corp Hub and operational boards.');
    return;
  }
  openEngagementHub(homePreviewTab,btn.dataset.targetId||'');
});
document.getElementById('homePreviewOpenBtn').addEventListener('click',()=>{
  if(isGuestViewer()){
    promptGuestRegister('Create a free account to access the Corp Hub and operational boards.');
    return;
  }
  openEngagementHub(homePreviewTab);
});
document.getElementById('commandPrimaryAction').addEventListener('click',()=>{
  if(isGuestViewer()){
    promptGuestRegister('Create a free account to access the Corp Hub and live operations.');
    return;
  }
  openEngagementHub(homePreviewTab);
});
document.getElementById('commandMembersAction').addEventListener('click',()=>{
  if(isGuestViewer()){
    promptGuestRegister('Create a free account to view and connect with other operatives.');
    return;
  }
  openModal('userDirectory');
  loadAllUsers();
});
document.querySelectorAll('[data-snapshot-tab]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    if(isGuestViewer()){
      promptGuestRegister('Create a free account to access the Corp Hub and live operational data.');
      return;
    }
    openEngagementHub(btn.dataset.snapshotTab);
  });
});
refreshDashboardSurface();
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
      status.innerHTML=`Week <strong>${esc(week)}</strong> has not been posted yet. Auto-pin will select the top operative by points and announce them.`;
      btn.disabled=false;btn.style.opacity='1';
      btn.innerHTML='<i class="fas fa-magic"></i> Auto-Pin Top Operative as MOTW';
    }
  }catch(err){
    status.innerHTML=`<span style="color:#f55;">Failed to check status: ${esc(err.message)}</span>`;
  }
}
async function runMotwAutoPin(){
  if(!confirm('Pick the top operative by points and pin them as Member of the Week?'))return;
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
    const note=`Member of the Week ${week} — top operative with ${top.points||0} points.`;
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
    row.innerHTML=`<div class="active-member-av">${avHtml(u.photoURL,u.displayName)}</div><div style="flex:1;"><strong style="font-size:.78rem;">${esc(u.displayName||'Unknown')}</strong><br><span style="font-size:.65rem;color:var(--color-text-muted);font-family:var(--font-mono);">${esc(u.rank||'Member')} · ${u.points||0} pts</span></div>`;
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
            '  <span class="t-cmd">/leaderboard</span>     top 5 operatives by points',
            '  <span class="t-cmd">/rank</span>            your rank, points, streak',
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
          const lines=snap.docs.slice(0,8).map(d=>{const m=d.data();return `  • <strong>${esc(m.title||'Mission')}</strong> <span class="t-dim">(${m.points||0} pts)${m.category?` [${esc(m.category)}]`:''}</span>`;});
          termPrint(`<span class="t-info">${snap.size} active mission${snap.size===1?'':'s'}:</span><br>${lines.join('<br>')}`);
          break;
        }
        case 'leaderboard':{
          const snap=await db.collection('users').get();
          const users=snap.docs.map(d=>({...d.data(),id:d.id})).filter(u=>!u.isAnonymous).sort((a,b)=>(b.points||0)-(a.points||0)).slice(0,5);
          if(!users.length){termPrint('<span class="t-dim">No operatives ranked yet.</span>');break;}
          termPrint(`<span class="t-info">Top 5 operatives:</span><br>${users.map((u,i)=>`  <span class="t-key">${i+1}.</span> ${esc(u.displayName||'Unknown')} <span class="t-dim">— ${u.points||0} pts</span>`).join('<br>')}`);
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

/* ── LIVE NEWS TICKER ── */
(function initNewsTicker(){
  const track=document.getElementById('newsTickerTrack');
  if(!track)return;
  const TYPE_ICONS={join:'fa-door-open',rank:'fa-id-badge',mission:'fa-crosshairs',connection:'fa-user-friends',intel:'fa-satellite-dish',poll:'fa-poll',announcement:'fa-bullhorn',streak:'fa-fire',motw:'fa-trophy',squad:'fa-users-rectangle'};
  function render(docs){
    if(!docs.length){track.innerHTML='<span class="news-ticker-item">Standing by — no recent activity yet.</span>';return;}
    const items=docs.map(d=>{
      const log=d.data();
      const icon=TYPE_ICONS[log.type]||'fa-circle';
      return `<span class="news-ticker-item"><i class="fas ${icon}"></i> <strong>${esc(log.displayName||'Unknown')}</strong> ${esc(log.message||'')}</span>`;
    });
    // Duplicate items so the marquee loop is seamless.
    track.innerHTML=items.join('<span class="news-ticker-sep">◆</span>')+'<span class="news-ticker-sep">◆</span>'+items.join('<span class="news-ticker-sep">◆</span>');
  }
  db.collection('corpLog').orderBy('createdAt','desc').limit(12).onSnapshot(snap=>{
    const filtered=snap.docs.filter(d=>!['status','profile'].includes(d.data().type));
    render(filtered);
  },()=>{});
})();
