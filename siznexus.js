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
/* ── ANTI-DEVTOOLS ── */
(function(){
  function lockDown(){
    if(document.getElementById('devtools-overlay'))return;
    const overlay=document.createElement('div');
    overlay.id='devtools-overlay';
    overlay.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:linear-gradient(135deg,#060a12,#0a0e1a);display:flex;align-items:center;justify-content:center;z-index:99999;font-family:var(--font-mono);';
    overlay.innerHTML=`<div style="text-align:center;max-width:500px;padding:30px;background:rgba(10,14,26,0.97);border:1px solid rgba(192,192,192,0.25);border-top:1px solid rgba(212,216,226,0.35);border-radius:8px;box-shadow:0 0 30px rgba(192,192,192,0.12);"><div style="font-size:2rem;margin-bottom:20px;"><i class="fas fa-shield-alt" style="color:#C0C0C0;"></i></div><h1 style="color:#D4D8E2;margin:0 0 10px 0;font-size:1.5rem;letter-spacing:0.1em;">Access Blocked</h1><p style="color:#B0BAC9;margin:0;font-size:0.9rem;line-height:1.6;">Developer tools are not permitted on this site.</p></div>`;
    document.body.appendChild(overlay);
    document.body.style.overflow='hidden';
    clearInterval(sizeTimer);
    clearInterval(debugTimer);
  }
  // Window size check — catches docked DevTools
  const sizeTimer=setInterval(()=>{
    if(window.outerWidth-window.innerWidth>160||window.outerHeight-window.innerHeight>160) lockDown();
  },500);
  // Debugger timing — catches undocked/detached DevTools
  const debugTimer=setInterval(()=>{
    const t=performance.now();
    // eslint-disable-next-line no-debugger
    debugger;
    if(performance.now()-t>150) lockDown();
  },500);
  // Fire immediately on load too
  if(window.outerWidth-window.innerWidth>160||window.outerHeight-window.innerHeight>160) lockDown();
})();
/* ── SPLASH (Terminal Boot Sequence) ── */
(function(){
  const splash=document.getElementById('splash');
  if(!splash)return;
  // Overwrite splash HTML for the terminal boot sequence
  splash.innerHTML = '<div id="bootTerminal" style="font-family:var(--font-mono); font-size:0.75rem; color:var(--color-primary); padding:20px; text-align:left; width:100%; max-width:600px; margin:0 auto; white-space:pre-wrap;"></div>';
  const bootTerm = document.getElementById('bootTerminal');
  const lines = [
    'INITIATING KERNEL...',
    'ESTABLISHING NEURAL LINK...',
    'BYPASSING FIREWALL...',
    'DECRYPTING HANDSHAKE... OK',
    'ACCESSING SIZNEXUS MAINFRAME...',
    'SYSTEM ONLINE.'
  ];
  let lineIdx=0;
  
  function typeLine() {
    if(lineIdx >= lines.length) {
      setTimeout(()=>splash.classList.add('hidden'), 400);
      return;
    }
    const p = document.createElement('div');
    bootTerm.appendChild(p);
    
    let charIdx=0;
    const text = lines[lineIdx];
    const typeInt = setInterval(() => {
      p.textContent += text.charAt(charIdx);
      charIdx++;
      if(charIdx >= text.length) {
        clearInterval(typeInt);
        lineIdx++;
        setTimeout(typeLine, 100);
      }
    }, 15);
  }
  
  // Start boot
  setTimeout(typeLine, 200);
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
  // Resolve any pending referral
  let referredBy=null,referrerName=null;
  try{
    const refName=localStorage.getItem('siz_referrer');
    if(refName){
      const snap=await db.collection('users').get();
      const lc=refName.toLowerCase();
      const r=snap.docs.find(d=>(d.data().displayName||'').toLowerCase()===lc);
      if(r&&r.id!==user.uid){referredBy=r.id;referrerName=r.data().displayName||refName;}
      localStorage.removeItem('siz_referrer');
    }
  }catch(_){}
  // Email is intentionally NOT written to the user doc — the users collection is
  // publicly readable (needed for /u/<name> profiles) and we don't want to leak
  // every member's email. Firebase Auth keeps the email; client reads it via
  // auth.currentUser.email when needed.
  const docPayload={
    displayName:user.displayName||(user.email||'operator').split('@')[0],
    photoURL:user.photoURL||'',
    rank:'Member',bio:'',status:'online',friends:[],
    createdAt:firebase.firestore.FieldValue.serverTimestamp()
  };
  if(referredBy){docPayload.referredBy=referredBy;}
  await db.collection('users').doc(user.uid).set(docPayload);
  // Append a corp log entry for the recruit (informational; admin can award Net later)
  if(referredBy){
    await db.collection('corpLog').add({
      type:'recruit',
      uid:user.uid,
      displayName:docPayload.displayName,
      rank:'Member',
      message:`was recruited by ${referrerName}`,
      extra:{referredBy},
      createdAt:firebase.firestore.FieldValue.serverTimestamp()
    }).catch(()=>{});
  }
  return(await db.collection('users').doc(user.uid).get()).data();
}
/* Capture ?ref=<displayName> from the URL and persist for the next signup. */
(function captureReferral(){
  try{
    const params=new URLSearchParams(location.search);
    const ref=params.get('ref');
    if(ref){
      localStorage.setItem('siz_referrer',ref);
      // Clean the URL so it doesn't persist on bookmark
      const url=new URL(location.href);url.searchParams.delete('ref');
      history.replaceState({},'',url.toString());
    }
  }catch(_){}
})();
async function shareReferralLink(){
  if(!currentUser||!currentUserData?.displayName){showToast('Set a display name first.');return;}
  const url=`${location.origin}/?ref=${encodeURIComponent(currentUserData.displayName)}`;
  const text=`Enlist with TheSizNexus — use my referral link: ${url}`;
  try{
    if(navigator.share){await navigator.share({title:'TheSizNexus invite',text,url});}
    else{await navigator.clipboard.writeText(url);showToast('Referral link copied: '+url);}
  }catch(_){
    try{await navigator.clipboard.writeText(url);showToast('Referral link copied.');}catch(_){showToast('Could not copy link.');}
  }
}
/* ── TOAST ── */
let _tt=null;
const _toastIcons={success:'fa-check-circle',error:'fa-times-circle',warning:'fa-exclamation-triangle',info:'fa-info-circle'};
function showToast(msg,variant='info'){const t=document.getElementById('nexusToast');t.dataset.variant=variant;t.innerHTML=`<i class="fas ${_toastIcons[variant]||_toastIcons.info}" style="margin-right:7px;"></i>${msg}`;t.classList.add('show');clearTimeout(_tt);_tt=setTimeout(()=>t.classList.remove('show'),3200);}
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
          <div class="profile-hero-name cipher-text" style="color:${u.accentColor?esc(u.accentColor):'var(--color-text-light)'};" data-cipher="${esc(name)}">${esc(name)}</div>
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
      <div class="profile-bio-text cipher-text" data-cipher="${esc(u.bio||'No bio set yet.')}">${esc(u.bio||'No bio set yet.')}</div>
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
  runCipherEffect(document.getElementById('profileModal'));
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
    // Award Net
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
      item.innerHTML=`<button class="notif-dismiss" title="Dismiss" style="position:absolute;top:8px;right:8px;background:none;border:none;color:var(--color-text-muted);font-size:.8rem;cursor:pointer;padding:2px 4px;line-height:1;transition:var(--transition);" onmouseover="this.style.color='#f55'" onmouseout="this.style.color='var(--color-text-muted)'">&#x2715;</button><div class="ann-item-title">${esc(a.title||'Announcement')}</div><div class="ann-item-body">${mdLite(a.body||'')}</div><div class="ann-item-meta"><span>— ${esc(a.authorName||'Admin')}</span><span>${a.createdAt?fmtDate(a.createdAt):''}</span></div>`;
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
    const actEl=document.getElementById('editActivityStatus');
    if(actEl)actEl.value=d.activityStatus||'';
    const picker=document.getElementById('accentPicker');
    if(picker) picker.style.display = 'none';

    // Reset pending uploads
    _pendingAvatarDataURL=null;_pendingBannerDataURL=null;
    // Show existing banner if any
    const bImg=document.getElementById('bannerPreviewImg');
    const bCta=document.getElementById('bannerUploadCta');
    const bClear=document.getElementById('bannerClearBtn');
    if(bImg&&d.bannerURL){bImg.src=d.bannerURL;bImg.style.display='block';if(bCta)bCta.style.display='none';if(bClear)bClear.style.display='block';}
    else if(bImg){bImg.style.display='none';bImg.src='';if(bCta)bCta.style.display='';if(bClear)bClear.style.display='none';}
    document.getElementById('profileSaveSuccess').style.display='none';
    const imgEl=document.getElementById('editAvatarImg'),phEl=document.getElementById('editAvatarPlaceholder');
    if(d.photoURL){imgEl.src=d.photoURL;imgEl.style.display='block';phEl.style.display='none';}
    else{imgEl.style.display='none';phEl.style.display='flex';phEl.textContent=initials(d.displayName||'G');}
    // Status buttons
    document.querySelectorAll('[data-pstatus]').forEach(btn=>{
      const isActive=btn.dataset.pstatus===(d.status||'online');
      btn.style.fontWeight=isActive?'700':'400';btn.style.opacity=isActive?'1':'.55';
      btn.onclick=()=>{setUserStatus(btn.dataset.pstatus);document.querySelectorAll('[data-pstatus]').forEach(b=>{b.style.fontWeight='400';b.style.opacity='.55';});btn.style.fontWeight='700';btn.style.opacity='1';};
    });
    // Guest lock
    const saveBtn=document.getElementById('saveProfileBtn');
    const editFields=['editDisplayName','editBio','editActivityStatus'];
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
  
  // Use pending images if they exist
  const displayAvatar = _pendingAvatarDataURL || d.photoURL;
  const displayBanner = _pendingBannerDataURL === '__CLEAR__' ? '' : (_pendingBannerDataURL || d.bannerURL);

  el.innerHTML=`<p style="font-family:var(--font-mono);font-size:.65rem;color:rgba(192,192,192,.3);margin-bottom:10px;letter-spacing:.1em;">// HOW OTHERS SEE YOUR PROFILE</p>
    <div class="profile-modal-hero${displayBanner?' has-banner':''}" ${displayBanner?`style="--banner:url('${esc(displayBanner)}');"`:''}>
      ${displayBanner?'<div class="profile-banner-overlay"></div>':''}
      <div class="profile-hero-top">
        <div class="profile-hero-av">${displayAvatar?`<img src="${esc(displayAvatar)}" alt="">`:`${initials(d.displayName||'?')}`}</div>
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
    // Pull last 12 weeks of corpLog for this user (composite index: uid+createdAt desc)
    const snap=await db.collection('corpLog').where('uid','==',uid).orderBy('createdAt','desc').limit(300).get().catch(()=>null);
    const cutoff=new Date();cutoff.setUTCDate(cutoff.getUTCDate()-83);
    const counts={};
    if(snap){
      snap.forEach(d=>{
        const t=d.data().createdAt?.toDate?.();
        if(!t||t<cutoff)return;
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
    el.innerHTML=`<div class="heatmap-wrap"><div class="heatmap-grid">${cells.join('')}</div></div><div class="heatmap-legend"><span>Less</span><div class="hm-cell hm-l0"></div><div class="hm-cell hm-l1"></div><div class="hm-cell hm-l2"></div><div class="hm-cell hm-l3"></div><div class="hm-cell hm-l4"></div><span>More</span></div>`;
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
      return `<div class="op-history-item"><div class="op-dot"></div><div class="op-body"><strong>${esc(s.missionTitle||'Mission')}</strong><span class="op-meta">+${s.points||0} Net • ${when}</span></div></div>`;
    }).join('')}</div>`;
  }catch(err){
    el.innerHTML=`<p style="font-family:var(--font-mono);font-size:.7rem;color:#f55;">${esc(err.message)}</p>`;
  }
}
/* ── XP / LEVEL SYSTEM ── */
const LEVEL_XP=100; // Net per level
function computeLevel(Net){
  const p=Math.max(0,Net||0);
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
  return `<span style="color:var(--color-text-light);">${name}</span>`;
}
function titleHtml(){return '';}
document.getElementById('saveProfileBtn').addEventListener('click',async()=>{
  if(!currentUser)return;
  const btn=document.getElementById('saveProfileBtn');
  btn.disabled=true;btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> Saving...';
  try{
    const newName=document.getElementById('editDisplayName').value.trim();
    const newBio=document.getElementById('editBio').value.trim();
    const newActivity=document.getElementById('editActivityStatus')?.value.trim()||'';
    const newGithub=document.getElementById('editGithubUrl')?.value.trim()||'';
    const newPortfolio=document.getElementById('editPortfolioUrl')?.value.trim()||'';
    const updates={bio:newBio,activityStatus:newActivity,skills:_currentSkills.slice(0,10),githubURL:newGithub,portfolioURL:newPortfolio};
    if(newName)updates.displayName=newName;
    if(_pendingAvatarDataURL){updates.photoURL=_pendingAvatarDataURL;}
    if(_pendingBannerDataURL==='__CLEAR__'){updates.bannerURL='';}
    else if(_pendingBannerDataURL){updates.bannerURL=_pendingBannerDataURL;}
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
/* Resize an uploaded image via canvas and return a base64 JPEG data URL. */
function resizeImageToDataURL(file,maxW,maxH,quality=0.85){
  return new Promise((resolve,reject)=>{
    if(!file||!file.type.startsWith('image/'))return reject(new Error('Not an image file.'));
    const reader=new FileReader();
    reader.onerror=()=>reject(new Error('Could not read file.'));
    reader.onload=e=>{
      const img=new Image();
      img.onload=()=>{
        let w=img.width,h=img.height;
        const ratio=Math.min(maxW/w,maxH/h,1);
        w=Math.round(w*ratio);h=Math.round(h*ratio);
        const canvas=document.createElement('canvas');
        canvas.width=w;canvas.height=h;
        const ctx=canvas.getContext('2d');
        ctx.fillStyle='#0A0E1A';ctx.fillRect(0,0,w,h);
        ctx.drawImage(img,0,0,w,h);
        resolve(canvas.toDataURL('image/jpeg',quality));
      };
      img.onerror=()=>reject(new Error('Could not decode image.'));
      img.src=e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
let _pendingAvatarDataURL=null,_pendingBannerDataURL=null;
document.getElementById('avatarFileInput').addEventListener('change',async function(){
  const file=this.files[0];if(!file)return;
  this.value='';
  try{
    const dataURL=await resizeImageToDataURL(file,256,256,0.86);
    _pendingAvatarDataURL=dataURL;
    document.getElementById('editAvatarImg').src=dataURL;
    document.getElementById('editAvatarImg').style.display='block';
    document.getElementById('editAvatarPlaceholder').style.display='none';
    showToast('Avatar ready. Click Save Changes to apply.');
  }catch(err){showToast('Image error: '+err.message);}
});
document.getElementById('bannerUploadBox')?.addEventListener('click',e=>{
  if(e.target.closest('.banner-clear'))return;
  document.getElementById('bannerFileInput').click();
});
document.getElementById('bannerFileInput')?.addEventListener('change',async function(){
  const file=this.files[0];if(!file)return;
  this.value='';
  try{
    const dataURL=await resizeImageToDataURL(file,1200,400,0.8);
    _pendingBannerDataURL=dataURL;
    const img=document.getElementById('bannerPreviewImg');
    img.src=dataURL;img.style.display='block';
    document.getElementById('bannerUploadCta').style.display='none';
    document.getElementById('bannerClearBtn').style.display='block';
    showToast('Banner ready. Click Save Changes to apply.');
  }catch(err){showToast('Image error: '+err.message);}
});
document.getElementById('bannerClearBtn')?.addEventListener('click',e=>{
  e.stopPropagation();
  _pendingBannerDataURL='__CLEAR__';
  document.getElementById('bannerPreviewImg').style.display='none';
  document.getElementById('bannerPreviewImg').src='';
  document.getElementById('bannerUploadCta').style.display='';
  document.getElementById('bannerClearBtn').style.display='none';
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
        writeCorpLog('login','was active');
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
            maybeNativeNotify(`${n.fromName||'Operative'} sent a message`,n.preview||'',n.fromUid);
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
    db.collection('users').doc(currentUser.uid).delete().catch(()=>{});
    currentUser.delete().catch(()=>{});
    sessionStorage.removeItem('_anonUid');
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
    sessionStorage.setItem('_anonUid',r.user.uid);
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
/* ── GUEST CONTENT RESTRICTIONS ── */
document.getElementById('heroEnlistBtn')?.addEventListener('click',e=>{e.preventDefault();openModal('loginModal');});
document.getElementById('plEnlistBtn')?.addEventListener('click',()=>openModal('loginModal'));
document.getElementById('plDemoBtn')?.addEventListener('click',()=>document.getElementById('anonLogin')?.click());
function applyGuestRestrictions(isGuest){
  document.querySelectorAll('.guest-only').forEach(el=>el.style.display=isGuest?'':'none');
  document.querySelectorAll('.member-only').forEach(el=>el.style.display=isGuest?'none':'');
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
    return `${user.displayName||'This operative'} is currently setting the pace with ${user.points||0} Net and ${user.rank||'Member'} clearance.`;
  }
  if(user.activityStatus){
    return `Current activity: "${user.activityStatus}". ${(user.bio&&user.bio.trim())?user.bio.trim():`${user.rank||'Member'} operative active in the Nexus network.`}`;
  }
  if(user.bio&&user.bio.trim())return truncateText(user.bio.trim(),150);
  if((user.points||0)>0){
    return `${user.displayName||'This operative'} has accumulated ${user.points||0} Net through missions, activity, and member engagement.`;
  }
  return `${user.rank||'Member'} operative active in the Nexus network.`;
}
function buildFeaturedTags(user,position){
  if(!user)return[];
  const tags=[];
  if(position===0&&(user.points||0)>0)tags.push('Top Operative');
  if(user.rank)tags.push(user.rank);
  if((user.points||0)>0)tags.push(`${user.points||0} Net`);
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
  nameEl.innerHTML=nameHtml(user,'Unknown Operative')+titleHtml(user);
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
const PRIVATE_LOG_TYPES=['status','profile','login'];
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
      const typeIcon={join:'fa-door-open',rank:'fa-id-badge',mission:'fa-crosshairs',connection:'fa-user-friends',status:'fa-circle',profile:'fa-user-edit',intel:'fa-satellite-dish',poll:'fa-poll',announcement:'fa-bullhorn',streak:'fa-fire',motw:'fa-trophy',recruit:'fa-user-plus'};
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
  document.getElementById('briefingTitle').className='cipher-text';
  document.getElementById('briefingTitle').dataset.cipher=mission.title||'Mission';
  document.getElementById('briefingTitle').textContent=mission.title||'Mission';
  
  document.getElementById('briefingDesc').className='briefing-desc cipher-text';
  document.getElementById('briefingDesc').dataset.cipher=mission.description||'No additional details.';
  document.getElementById('briefingDesc').textContent=mission.description||'No additional details.';
  
  document.getElementById('briefingPts').textContent=`${mission.points||0} Net`;
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
    myStatus.textContent=`Completed +${mission.points||0} Net`;
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
  runCipherEffect(document.getElementById('briefingModal'));
  setTimeout(()=>document.getElementById('briefingKeyInput').focus(),60);
}
document.getElementById('closeBriefing')?.addEventListener('click',()=>closeModal('briefingModal'));
async function submitMissionBriefing(){
  if(!_briefingMission||!currentUser)return;
  const m=_briefingMission;
  const keyVal=document.getElementById('briefingKeyInput').value.trim().toUpperCase();
  const fb=document.getElementById('briefingFeedback');
  if(!keyVal){fb.textContent='Enter a KEY first.';fb.className='briefing-feedback err';return;}
  
  // Start the hacking minigame before submission
  initiateHackingMinigame(async () => {
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
      fb.textContent='SIGNAL DECRYPTED. KEY transmitted.';fb.className='briefing-feedback ok';
      setTimeout(()=>{closeModal('briefingModal');loadMissions();},1400);
    }catch(err){
      fb.textContent='Transmission failed: '+err.message;fb.className='briefing-feedback err';
      btn.disabled=false;btn.innerHTML='<i class="fas fa-key"></i> Submit';
    }
  });
}

function initiateHackingMinigame(onSuccess) {
  const container = document.querySelector('#briefingModal .modal-container');
  if(!container) return;

  const overlay = document.createElement('div');
  overlay.className = 'hacking-overlay';
  overlay.innerHTML = `
    <div class="hacking-terminal" id="hackingTerminal"></div>
    <div style="display:flex; flex-direction:column; align-items:center;">
      <h3 style="color:var(--color-primary); font-size:1.1rem; margin-bottom:4px; letter-spacing:0.1em;">FIREWALL BYPASS REQUIRED</h3>
      <p style="font-size:0.65rem; color:var(--color-text-muted); margin-bottom:12px; font-family:var(--font-mono);">MATCH THE SIGNAL PULSES TO DECRYPT THE NODE.</p>
      <div class="hacking-target-grid" id="hackingTargetGrid"></div>
      <div class="hacking-progress-bar"><div class="hacking-progress-fill" id="hackingProgress"></div></div>
    </div>
  `;
  container.appendChild(overlay);

  // Terminal scroll animation
  const term = document.getElementById('hackingTerminal');
  const codes = ['[SIGNAL: 0x99]', 'LINKING NEURAL UPLINK...', 'BYPASSING KERNEL...', 'ROOT_ACCESS: ATTEMPTING', 'ENCRYPTING PACKETS...', 'SIGNAL STRENGTH: 92%', 'NODE_ID: NEXUS_ALPHA', 'BUFFER_OVERFLOW: SUPPRESSED', 'SSL_HANDSHAKE: OK'];
  let codeInt = setInterval(() => {
    const line = document.createElement('div');
    line.className = 'hacking-code-line';
    line.textContent = codes[Math.floor(Math.random() * codes.length)] + ' ' + Math.random().toString(16).slice(2, 10).toUpperCase();
    term.appendChild(line);
    if(term.children.length > 10) term.removeChild(term.firstChild);
    term.scrollTop = term.scrollHeight;
  }, 150);

  // Game Logic
  const grid = document.getElementById('hackingTargetGrid');
  const progress = document.getElementById('hackingProgress');
  let currentStep = 0;
  const totalSteps = 4;
  
  function nextRound() {
    grid.innerHTML = '';
    const activeIdx = Math.floor(Math.random() * 16);
    
    for(let i=0; i<16; i++) {
      const btn = document.createElement('div');
      btn.className = 'hacking-target';
      btn.textContent = Math.random().toString(16).slice(2, 4).toUpperCase();
      if(i === activeIdx) {
        btn.classList.add('active');
        btn.onclick = () => {
          btn.classList.add('success');
          currentStep++;
          progress.style.width = (currentStep / totalSteps * 100) + '%';
          if(currentStep === totalSteps) {
            clearInterval(codeInt);
            setTimeout(() => {
              overlay.remove();
              onSuccess();
            }, 800);
          } else {
            setTimeout(nextRound, 200);
          }
        };
      } else {
        btn.onclick = () => {
          btn.classList.add('fail');
          currentStep = Math.max(0, currentStep - 1);
          progress.style.width = (currentStep / totalSteps * 100) + '%';
          setTimeout(() => btn.classList.remove('fail'), 300);
        };
      }
      grid.appendChild(btn);
    }
  }

  nextRound();
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
          actionHtml='<p style="font-family:var(--font-mono);font-size:.7rem;color:#4CAF50;margin-top:8px;"><i class="fas fa-check-circle"></i> Mission complete! +${m.points||50} Net awarded.</p>';
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
        <div class="mission-footer"><span class="mission-pts"><i class="fas fa-star"></i> ${m.points||50} Net</span>${statusHtml}</div>
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
let _calendarMonth=new Date(Date.UTC(new Date().getUTCFullYear(),new Date().getUTCMonth(),1));
let _calendarSelected=null;
async function loadCalendar(){
  const list=document.getElementById('calendarList');
  list.innerHTML='<div class="loading-spinner" style="grid-column:unset;padding:20px 0;"></div>';
  updateHubSectionInfo({label:'Calendar',count:'—',note:'Loading event grid.'});
  try{
    const snap=await db.collection('events').get();
    const events=snap.docs.map(d=>({...d.data(),id:d.id})).filter(e=>e.eventDate?.toDate);
    const upcoming=events.filter(e=>e.eventDate.toDate()>=new Date()).length;
    updateHubSectionInfo({label:'Calendar',count:upcoming,note:`${upcoming} upcoming event${upcoming===1?'':'s'}. Click any day to see what's scheduled.`});
    renderCalendarGrid(list,events);
  }catch(err){list.innerHTML=`<div class="hub-empty" style="color:#f55;">Error: ${err.message}</div>`;}
}
function renderCalendarGrid(container,events){
  const month=_calendarMonth;
  const monthName=month.toLocaleString([],{month:'long',year:'numeric'});
  const firstDow=new Date(Date.UTC(month.getUTCFullYear(),month.getUTCMonth(),1)).getUTCDay();
  const daysInMonth=new Date(Date.UTC(month.getUTCFullYear(),month.getUTCMonth()+1,0)).getUTCDate();
  // Group events by YMD
  const byDay={};
  events.forEach(e=>{
    const ed=e.eventDate.toDate();
    const k=ymdUTC(ed);
    (byDay[k]=byDay[k]||[]).push(e);
  });
  const todayKey=ymdUTC();
  let html=`<div class="cal-shell">
    <div class="cal-header">
      <button class="cal-nav" id="calPrev"><i class="fas fa-chevron-left"></i></button>
      <span class="cal-title">${esc(monthName)}</span>
      <button class="cal-nav" id="calNext"><i class="fas fa-chevron-right"></i></button>
    </div>
    <div class="cal-dow">${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=>`<span>${d}</span>`).join('')}</div>
    <div class="cal-grid">`;
  // Empty cells before day 1
  for(let i=0;i<firstDow;i++)html+='<div class="cal-cell empty"></div>';
  for(let d=1;d<=daysInMonth;d++){
    const dt=new Date(Date.UTC(month.getUTCFullYear(),month.getUTCMonth(),d));
    const k=ymdUTC(dt);
    const evs=byDay[k]||[];
    const isToday=k===todayKey;
    const isSelected=k===_calendarSelected;
    const dotsHtml=evs.slice(0,3).map(()=>'<span class="cal-dot"></span>').join('');
    html+=`<button class="cal-cell${isToday?' today':''}${isSelected?' selected':''}${evs.length?' has-events':''}" data-day="${k}"><span class="cal-day-num">${d}</span>${dotsHtml}${evs.length>3?`<span class="cal-more">+${evs.length-3}</span>`:''}</button>`;
  }
  html+='</div></div><div class="cal-detail" id="calDetail"></div>';
  container.innerHTML=html;
  container.querySelector('#calPrev').addEventListener('click',()=>{_calendarMonth=new Date(Date.UTC(month.getUTCFullYear(),month.getUTCMonth()-1,1));loadCalendar();});
  container.querySelector('#calNext').addEventListener('click',()=>{_calendarMonth=new Date(Date.UTC(month.getUTCFullYear(),month.getUTCMonth()+1,1));loadCalendar();});
  container.querySelectorAll('.cal-cell[data-day]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      _calendarSelected=btn.dataset.day;
      container.querySelectorAll('.cal-cell.selected').forEach(c=>c.classList.remove('selected'));
      btn.classList.add('selected');
      renderCalendarDayDetail(byDay[_calendarSelected]||[],_calendarSelected);
    });
  });
  // Auto-select today on first render
  if(!_calendarSelected){_calendarSelected=todayKey;renderCalendarDayDetail(byDay[todayKey]||[],todayKey);}
  else renderCalendarDayDetail(byDay[_calendarSelected]||[],_calendarSelected);
}
function renderCalendarDayDetail(events,dayKey){
  const detail=document.getElementById('calDetail');
  if(!detail)return;
  const dt=new Date(dayKey+'T00:00:00Z');
  const head=`<div class="cal-detail-head"><strong>${dt.toLocaleDateString([],{weekday:'long',month:'long',day:'numeric'})}</strong><span>${events.length} event${events.length===1?'':'s'}</span></div>`;
  if(!events.length){detail.innerHTML=head+'<p class="cal-empty">No events on this day.</p>';return;}
  let html=head;
  events.sort((a,b)=>a.eventDate.toMillis()-b.eventDate.toMillis()).forEach(ev=>{
    const evDate=ev.eventDate.toDate();
    const isPast=evDate<new Date();
    const myRsvp=(ev.rsvpYes||[]).includes(currentUser.uid)?'yes':(ev.rsvpNo||[]).includes(currentUser.uid)?'no':null;
    const time=evDate.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
    html+=`<div class="event-card${isPast?' past':''}" data-card-id="${esc(ev.id)}">
      <div class="event-title"><i class="fas fa-clock" style="font-size:.65rem;opacity:.6;margin-right:5px;"></i>${esc(time)} — ${esc(ev.title||'Event')}</div>
      <div class="event-desc">${esc(ev.description||'')}</div>
      <div class="event-meta"><span class="rsvp-count">✅ ${(ev.rsvpYes||[]).length} going</span></div>
      ${!isPast?`<div class="event-rsvp-row">
        <button class="rsvp-btn yes${myRsvp==='yes'?' active':''}" data-eid="${esc(ev.id)}" data-action="yes">✅ Going</button>
        <button class="rsvp-btn no${myRsvp==='no'?' active':''}" data-eid="${esc(ev.id)}" data-action="no">❌ Can't go</button>
      </div>`:'<p style="font-family:var(--font-mono);font-size:.65rem;color:rgba(192,192,192,.3);margin-top:6px;">This event has passed.</p>'}
    </div>`;
  });
  detail.innerHTML=html;
  detail.querySelectorAll('.rsvp-btn').forEach(btn=>{
    btn.addEventListener('click',async function(){
      const action=this.dataset.action,eid=this.dataset.eid;
      const ref=db.collection('events').doc(eid);
      const updateData={};
      if(action==='yes'){updateData.rsvpYes=firebase.firestore.FieldValue.arrayUnion(currentUser.uid);updateData.rsvpNo=firebase.firestore.FieldValue.arrayRemove(currentUser.uid);}
      else{updateData.rsvpNo=firebase.firestore.FieldValue.arrayUnion(currentUser.uid);updateData.rsvpYes=firebase.firestore.FieldValue.arrayRemove(currentUser.uid);}
      await ref.update(updateData).catch(e=>showToast(e.message));
      loadCalendar();
    });
  });
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
    const isStaff=isMod(currentUserData);
    posts.forEach(d=>{
      const p=d.data();
      // Hide pending posts from non-staff (except the author).
      if(p.status==='pending' && !isStaff && p.authorUid!==currentUser.uid)return;
      const item=document.createElement('div');item.className='intel-post';item.dataset.cardId=d.id;
      const pendingBadge=p.status==='pending'?'<span class="intel-pending-pill">PENDING REVIEW</span>':'';
      const staffActions=isStaff && p.status==='pending'?`<div style="margin-top:8px;display:flex;gap:6px;"><button class="btn-sm intel-approve-btn" data-id="${d.id}" style="font-size:.62rem;"><i class="fas fa-check"></i> Approve</button><button class="btn-sm danger intel-reject-btn" data-id="${d.id}" style="font-size:.62rem;"><i class="fas fa-times"></i> Reject</button></div>`:'';
      item.innerHTML=`<div class="intel-post-title">${p.tag?`<span class="intel-tag">${esc(p.tag)}</span>`:''}${esc(p.title||'Intel')} ${pendingBadge}</div>
        <div class="intel-post-body">${mdLite(p.body||'')}</div>
        <div class="intel-post-meta"><span>${esc(p.authorName||'Admin')} &middot; ${esc(p.authorRank||'')}</span><span>${p.createdAt?fmtDate(p.createdAt):''}</span></div>${staffActions}`;
      const ap=item.querySelector('.intel-approve-btn');
      const rj=item.querySelector('.intel-reject-btn');
      if(ap)ap.addEventListener('click',async()=>{
        await db.collection('intelPosts').doc(d.id).update({status:'approved'}).catch(e=>showToast(e.message));
        loadIntelBoard();
      });
      if(rj)rj.addEventListener('click',async()=>{
        if(!confirm('Reject this submission?'))return;
        await db.collection('intelPosts').doc(d.id).delete().catch(e=>showToast(e.message));
        loadIntelBoard();
      });
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
let corpChatUnsub=null, corpChatOpen=false, corpChatLastSeen=parseInt(localStorage.getItem('siz_corpChatLastSeen')||'0');
function openCorpChat(){
  corpChatOpen=true;
  document.getElementById('corpChatPanel').classList.add('open');
  const badge=document.getElementById('chatUnreadBadge');
  if(badge){badge.classList.remove('show');badge.textContent='0';}
  const body=document.getElementById('corpChatBody');
  if(body)body.scrollTop=body.scrollHeight;
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
    if(!body)return;
    body.innerHTML='';
    let lastDate='',lastUid='',latestTs=0,unreadCount=0;
    snap.forEach(d=>{
      const m=d.data(),isMine=m.uid===currentUser.uid;
      const ts=m.createdAt?.toMillis?.()||0;
      if(ts>latestTs)latestTs=ts;
      if(!isMine && ts>corpChatLastSeen) unreadCount++;
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
    // Initial load scroll fix
    setTimeout(()=>{body.scrollTop=body.scrollHeight;},50);
    // Unread logic
    if(corpChatOpen){
      corpChatLastSeen=latestTs;
      localStorage.setItem('siz_corpChatLastSeen',latestTs);
    }else if(unreadCount>0){
      const badge=document.getElementById('chatUnreadBadge');
      if(badge){
        badge.textContent=unreadCount>9?'9+':unreadCount;
        badge.classList.add('show');
      }
    }
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
    note:'Mission cards show live status, Net, and your current submission state.'
  },
  leaderboard:{
    eyebrow:'Top Performers',
    title:'Leaderboard',
    meta:'See who is leading the network by Net, activity, and overall operational momentum.',
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
  else if(tab==='opsmap')loadOpsMap();
  else if(tab==='tools')loadTools();
  else if(tab==='projects')loadProjects();
}

/* ── GLOBAL OPS MAP ── */
let opsMapAnimId=null;
function loadOpsMap() {
  updateHubSectionInfo({label: 'Global Operations Matrix', count: 'LIVE', note: 'Tracking active network signals across the corporate grid.'});
  const canvas = document.getElementById('opsMapCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    if(Math.round(canvas.width) !== Math.round(rect.width*dpr) || Math.round(canvas.height) !== Math.round(rect.height*dpr)) {
      canvas.width = rect.width*dpr;
      canvas.height = rect.height*dpr;
      ctx.setTransform(dpr,0,0,dpr,0,0);
    }
  }

  // Pseudo-continents: pre-baked normalized hotspots that look roughly like land masses.
  // Each is {cx, cy, radius, density} in 0-1 normalized space.
  const continents = [
    {cx:.18,cy:.32,rx:.12,ry:.10}, // N. America
    {cx:.28,cy:.62,rx:.07,ry:.12}, // S. America
    {cx:.48,cy:.30,rx:.08,ry:.08}, // Europe
    {cx:.55,cy:.58,rx:.09,ry:.13}, // Africa
    {cx:.70,cy:.34,rx:.16,ry:.12}, // Asia
    {cx:.82,cy:.68,rx:.06,ry:.05}, // Australia
  ];

  // Persistent nodes positioned within continents
  const nodes = [];
  const NODE_COUNT = 28;
  for(let i=0; i<NODE_COUNT; i++) {
    const c = continents[Math.floor(Math.random()*continents.length)];
    const a = Math.random()*Math.PI*2, r = Math.random();
    nodes.push({
      x: c.cx + Math.cos(a)*c.rx*r,
      y: c.cy + Math.sin(a)*c.ry*r,
      baseAlpha: Math.random()*0.4 + 0.3,
      pulseSpeed: Math.random()*0.03 + 0.012,
      t: Math.random()*Math.PI*2,
      isHub: Math.random() < 0.18
    });
  }

  // Random cross-continent signal arcs (re-rolled occasionally)
  let arcs = [];
  function rollArcs(){
    arcs = [];
    for(let i=0;i<5;i++){
      const a=nodes[Math.floor(Math.random()*nodes.length)];
      const b=nodes[Math.floor(Math.random()*nodes.length)];
      if(a===b)continue;
      arcs.push({a,b,t:0,dur:80+Math.random()*120});
    }
  }
  rollArcs();
  setInterval(rollArcs, 4500);

  // Update the badge in HUD
  const nodeBadge=document.getElementById('opsmapNodes');
  if(nodeBadge)nodeBadge.textContent=String(NODE_COUNT);

  function draw() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if(w <= 0 || h <= 0) { opsMapAnimId = requestAnimationFrame(draw); return; }

    // Background gradient
    const g = ctx.createLinearGradient(0,0,0,h);
    g.addColorStop(0,'#080c18'); g.addColorStop(1,'#03060e');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,w,h);

    // Latitude/longitude grid
    ctx.strokeStyle = 'rgba(192,192,192,0.06)';
    ctx.lineWidth = 1;
    for(let lat=0; lat<=10; lat++){const y=lat*h/10;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
    for(let lon=0; lon<=14; lon++){const x=lon*w/14;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}

    // Continent dot-matrix
    ctx.fillStyle = 'rgba(192,192,192,0.18)';
    const step = 6;
    for(let x=0; x<w; x+=step) {
      for(let y=0; y<h; y+=step) {
        const nx=x/w, ny=y/h;
        let inside=false;
        for(const c of continents){
          const dx=(nx-c.cx)/c.rx, dy=(ny-c.cy)/c.ry;
          if(dx*dx+dy*dy < 1){inside=true;break;}
        }
        if(inside){
          ctx.beginPath();
          ctx.arc(x,y,1,0,Math.PI*2);
          ctx.fill();
        }
      }
    }

    // Signal arcs (animated bezier with traveling dot)
    arcs.forEach(arc=>{
      arc.t += 1;
      const ax=arc.a.x*w, ay=arc.a.y*h, bx=arc.b.x*w, by=arc.b.y*h;
      const mx=(ax+bx)/2, my=Math.min(ay,by)-Math.abs(bx-ax)*0.25;
      ctx.strokeStyle='rgba(192,192,192,0.18)';
      ctx.lineWidth=1;
      ctx.beginPath();
      ctx.moveTo(ax,ay);
      ctx.quadraticCurveTo(mx,my,bx,by);
      ctx.stroke();
      // Traveling pulse
      const p = Math.min(1, arc.t/arc.dur);
      const px = (1-p)*(1-p)*ax + 2*(1-p)*p*mx + p*p*bx;
      const py = (1-p)*(1-p)*ay + 2*(1-p)*p*my + p*p*by;
      ctx.shadowBlur=8; ctx.shadowColor='#fff';
      ctx.fillStyle='rgba(255,255,255,0.85)';
      ctx.beginPath(); ctx.arc(px,py,1.8,0,Math.PI*2); ctx.fill();
      ctx.shadowBlur=0;
    });

    // Nodes
    nodes.forEach(n => {
      n.t += n.pulseSpeed;
      const px = n.x*w, py = n.y*h;
      const alpha = n.baseAlpha + Math.sin(n.t)*0.28;
      ctx.shadowBlur = n.isHub ? 14 : 6;
      ctx.shadowColor = '#FFFFFF';
      ctx.fillStyle = `rgba(220,224,232,${alpha})`;
      ctx.beginPath(); ctx.arc(px,py, n.isHub?2.6:1.7, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
      // Pulse rings on hub nodes
      if(n.isHub && Math.sin(n.t) > 0.7){
        const r = (Math.sin(n.t)-0.7)*60;
        ctx.strokeStyle = `rgba(192,192,192,${(1-Math.sin(n.t))*1.4})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.arc(px,py,r,0,Math.PI*2); ctx.stroke();
      }
    });

    opsMapAnimId = requestAnimationFrame(draw);
  }

  if(opsMapAnimId) cancelAnimationFrame(opsMapAnimId);
  resize();
  draw();
  if(!loadOpsMap._observer){
    loadOpsMap._observer = new ResizeObserver(resize);
    loadOpsMap._observer.observe(canvas.parentElement);
  }
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
    // Sort by total Net desc
    const withTotals=squads.map(s=>{
      const total=(s.members||[]).reduce((sum,uid)=>sum+(usersById[uid]?.points||0),0);
      return {...s,_total:total};
    }).sort((a,b)=>b._total-a._total);
    if(!withTotals.length){
      list.innerHTML='<div class="hub-empty">No squads formed yet. Be the first to create one.</div>';
      updateHubSectionInfo({label:'Squads',count:0,note:'No squads exist yet.'});
      return;
    }
    updateHubSectionInfo({label:'Squads',count:withTotals.length,note:'Members combine their Net into a shared squad total. Max 5 per squad.'});
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
      const emblemHtml = s.emblemURL ? `<img src="${esc(s.emblemURL)}" style="width:32px; height:32px; border-radius:4px; margin-right:8px; border:var(--border);">` : '';
      card.innerHTML=`
        <div class="squad-header" style="display:flex; align-items:center;">
          ${emblemHtml}
          <div class="squad-info" style="flex:1;">
            <div class="squad-name">${tag} ${esc(s.name||'Unnamed')}</div>
            <div class="squad-leader">Led by ${esc(usersById[s.leaderUid]?.displayName||'—')}</div>
          </div>
          <div class="squad-total"><strong style="color:var(--color-text-light);">${s._total}</strong><span style="font-size:.55rem; color:var(--color-text-muted); margin-left:3px;">Net</span></div>
        </div>
        <div class="squad-members" style="display:flex; gap:4px; margin-top:10px;">${memberAvs}</div>
        <div class="squad-meta" style="font-family:var(--font-mono); font-size:.6rem; color:var(--color-text-muted); margin-top:8px;">${(s.members||[]).length} / ${SQUAD_MAX_MEMBERS} operatives</div>
        <div class="squad-actions" style="margin-top:12px; display:flex; gap:8px;">
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
  const action=prompt(`Squad "${squad.name}"\nMembers: ${members.length}/${SQUAD_MAX_MEMBERS}\n\nType:\n  add <uid|name> — recruit\n  remove <uid|name> — kick\n  rename <new name> — rename\n  emblem — upload 64x64 logo`);
  if(!action)return;
  const [cmd,...rest]=action.trim().split(/\s+/);
  const arg=rest.join(' ').trim();
  try{
    if(cmd==='add'){
      if(members.length>=SQUAD_MAX_MEMBERS){showToast('Squad is full.');return;}
      const target=Object.values(usersById).find(u=>u.id===arg||(u.displayName||'').toLowerCase()===arg.toLowerCase());
      if(!target){showToast('No matching user.');return;}
      if(members.includes(target.id)){showToast('Already in squad.');return;}
      const others=await db.collection('squads').where('members','array-contains',target.id).get();
      if(!others.empty){showToast(`${target.displayName} is already in a squad.`);return;}
      await db.collection('squads').doc(squad.id).update({members:firebase.firestore.FieldValue.arrayUnion(target.id)});
      showToast(`Added ${target.displayName}.`);
    }else if(cmd==='remove'){
      const target=Object.values(usersById).find(u=>u.id===arg||(u.displayName||'').toLowerCase()===arg.toLowerCase());
      if(!target){showToast('No matching user.');return;}
      if(target.id===squad.leaderUid){showToast('Leader cannot be removed.');return;}
      await db.collection('squads').doc(squad.id).update({members:firebase.firestore.FieldValue.arrayRemove(target.id)});
      showToast(`Removed ${target.displayName}.`);
    }else if(cmd==='rename'){
      if(!arg){showToast('Provide a name.');return;}
      await db.collection('squads').doc(squad.id).update({name:arg.slice(0,30)});
      showToast('Renamed.');
    }else if(cmd==='emblem'){
      const input = document.createElement('input');
      input.type = 'file'; input.accept = 'image/*';
      input.onchange = async () => {
        const file = input.files[0]; if(!file) return;
        try {
          const dataURL = await resizeImageToDataURL(file, 64, 64, 0.8);
          await db.collection('squads').doc(squad.id).update({emblemURL: dataURL});
          showToast('Squad emblem updated.');
          loadSquads();
        } catch(e) { showToast('Upload failed: ' + e.message); }
      };
      input.click();
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
  const typeIcon={join:'fa-door-open',rank:'fa-id-badge',mission:'fa-crosshairs',connection:'fa-user-friends',status:'fa-circle',profile:'fa-user-edit',intel:'fa-satellite-dish',poll:'fa-poll',announcement:'fa-bullhorn',streak:'fa-fire',motw:'fa-trophy',recruit:'fa-user-plus'};
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
      meta:`${m.points||50} Net`,
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
    meta:`${u.points||0} Net`,
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
      ? `${sortedMissions[0].data().title||'Mission'} • ${sortedMissions[0].data().points||50} Net`
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
  loadProjectsPreview();
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

/* ── DAILY / WEEKLY LEADERBOARD ──
   Augments the static leaderboard with a "This Week" view scored by approved
   mission submissions in the last 7 days × the mission's points. */
let _lbScope='all';
function injectLeaderboardScopeBar(){
  const list=document.getElementById('leaderboardList');
  if(!list||list.dataset.scopeBar)return;
  list.dataset.scopeBar='1';
  const bar=document.createElement('div');
  bar.className='lb-scope-bar';
  bar.innerHTML=`<button type="button" class="lb-scope-btn active" data-scope="all">All-Time</button><button type="button" class="lb-scope-btn" data-scope="week">This Week</button><button type="button" class="lb-scope-btn" data-scope="day">Today</button>`;
  list.parentElement.insertBefore(bar,list);
  bar.querySelectorAll('.lb-scope-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      bar.querySelectorAll('.lb-scope-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      _lbScope=btn.dataset.scope;
      loadLeaderboard();
    });
  });
}
const _origLoadLeaderboard=loadLeaderboard;
loadLeaderboard=async function(){
  injectLeaderboardScopeBar();
  if(_lbScope==='all'){return _origLoadLeaderboard();}
  const list=document.getElementById('leaderboardList');
  list.innerHTML='<div class="loading-spinner" style="grid-column:unset;padding:20px 0;"></div>';
  const cutoff=Date.now()-(_lbScope==='day'?86400000:7*86400000);
  try{
    const subSnap=await db.collection('missionSubmissions').where('status','==','approved').get();
    const totals={};
    subSnap.forEach(d=>{
      const s=d.data();
      const t=(s.reviewedAt?.toMillis?.()||s.submittedAt?.toMillis?.()||s.createdAt?.toMillis?.()||0);
      if(t<cutoff)return;
      totals[s.uid]=(totals[s.uid]||0)+(s.points||0);
    });
    const ids=Object.keys(totals);
    if(!ids.length){
      list.innerHTML=`<div class="hub-empty">No ${_lbScope==='day'?'24h':'7-day'} activity yet.</div>`;
      updateHubSectionInfo({label:_lbScope==='day'?"Today's Operatives":'Weekly Operatives',count:0,note:'Nothing to rank in this window.'});
      return;
    }
    const userDocs=await Promise.all(ids.map(uid=>db.collection('users').doc(uid).get().catch(()=>null)));
    const ranked=userDocs.filter(s=>s&&s.exists).map(s=>({...s.data(),id:s.id,_score:totals[s.id]||0})).sort((a,b)=>b._score-a._score).slice(0,20);
    updateHubSectionInfo({label:_lbScope==='day'?"Today's Operatives":'Weekly Operatives',count:ranked.length,note:`Ranked by mission Net earned in the last ${_lbScope==='day'?'24 hours':'7 days'}.`});
    list.innerHTML='';
    ranked.forEach((u,i)=>{
      const rankNum=i+1;
      const rankCls=rankNum===1?'gold':rankNum===2?'silver':rankNum===3?'bronze':'other';
      const rankIcon=rankNum===1?'🥇':rankNum===2?'🥈':rankNum===3?'🥉':rankNum;
      const isMe=u.id===currentUser.uid;
      const row=document.createElement('div');row.className='lb-row';row.dataset.cardId=u.id;
      row.innerHTML=`<span class="lb-rank ${rankCls}">${rankIcon}</span>
        <div class="lb-av">${avHtml(u.photoURL,u.displayName)}</div>
        <span class="lb-name">${nameHtml(u)}${isMe?'<span class="lb-you">[YOU]</span>':''}</span>
        <span class="lb-pts"><i class="fas fa-star" style="font-size:.6rem;margin-right:3px;"></i>${u._score}</span>`;
      list.appendChild(row);
    });
  }catch(err){list.innerHTML=`<div class="hub-empty" style="color:#f55;">${esc(err.message)}</div>`;}
};

/* ── MEMBER-SUBMITTED INTEL ──
   Allows non-admin members to submit intel posts (status='pending'). Admin can
   review and approve via the intel tab. */
function injectMemberIntelForm(list){
  if(list.dataset.memberForm)return;
  list.dataset.memberForm='1';
  if(!currentUser||currentUser.isAnonymous)return;
  if(isMod(currentUserData))return; // mods already get the staff form
  const wrap=document.createElement('div');
  wrap.style.cssText='margin-bottom:14px;padding:12px;border:1px dashed rgba(192,192,192,.18);background:rgba(192,192,192,.02);border-radius:3px;';
  wrap.innerHTML=`<p style="font-family:var(--font-mono);font-size:.62rem;letter-spacing:.18em;color:var(--color-text-muted);margin-bottom:8px;">// SUBMIT INTEL — STAFF REVIEW REQUIRED</p>
    <div style="display:flex;flex-direction:column;gap:6px;">
      <input type="text" id="memberIntelTitle" class="input-field" placeholder="Intel headline..." maxlength="80" style="font-size:.78rem;">
      <textarea id="memberIntelBody" class="input-field" placeholder="Briefing body..." maxlength="800" style="min-height:60px;font-size:.75rem;"></textarea>
      <div style="display:flex;gap:6px;">
        <input type="text" id="memberIntelTag" class="input-field" placeholder="Tag (e.g. Recon)" maxlength="20" style="font-size:.72rem;flex:1;">
        <button class="btn-primary" id="submitMemberIntelBtn" style="font-size:.7rem;padding:7px 12px;"><i class="fas fa-paper-plane"></i> Submit</button>
      </div>
    </div>`;
  list.appendChild(wrap);
  document.getElementById('submitMemberIntelBtn').addEventListener('click',async()=>{
    const t=document.getElementById('memberIntelTitle').value.trim();
    const b=document.getElementById('memberIntelBody').value.trim();
    const tag=document.getElementById('memberIntelTag').value.trim();
    if(!t||!b){showToast('Title and body required.');return;}
    const btn=document.getElementById('submitMemberIntelBtn');
    btn.disabled=true;btn.innerHTML='<i class="fas fa-spinner fa-spin"></i>';
    try{
      await db.collection('intelPosts').add({
        title:t,body:b,tag,
        authorName:currentUserData?.displayName||'Member',
        authorRank:currentUserData?.rank||'Member',
        authorUid:currentUser.uid,
        status:'pending',
        createdAt:firebase.firestore.FieldValue.serverTimestamp()
      });
      showToast('Intel submitted for staff review.');
      writeCorpLog('intel',`submitted intel for review: "${t}"`);
      document.getElementById('memberIntelTitle').value='';
      document.getElementById('memberIntelBody').value='';
      document.getElementById('memberIntelTag').value='';
    }catch(err){showToast('Submit failed: '+err.message);}
    finally{btn.disabled=false;btn.innerHTML='<i class="fas fa-paper-plane"></i> Submit';}
  });
}
const _origLoadIntelBoard=loadIntelBoard;
loadIntelBoard=async function(){
  await _origLoadIntelBoard();
  const list=document.getElementById('intelList');
  if(list)injectMemberIntelForm(list);
};

/* ══════════════════════════════════════════════════════
   TOOLS LIBRARY
   ══════════════════════════════════════════════════════ */

const TOOL_CAT_LABELS={utility:'Utility',script:'Script',app:'App',resource:'Resource',other:'Other'};
let _toolsCurrentFilter='all';
let _pendingToolScreenshotURL=null;

async function loadTools(categoryFilter){
  if(categoryFilter!==undefined)_toolsCurrentFilter=categoryFilter;
  updateHubSectionInfo({label:'Tools Library',count:'',note:'Curated tools and utilities built by Corp members and staff.'});
  const list=document.getElementById('toolsList');
  const actionBar=document.getElementById('toolsActionBar');
  if(!list)return;
  // Show submit button only for registered non-guest members
  if(actionBar&&currentUser&&!currentUser.isAnonymous&&currentUserData?.rank&&currentUserData.rank!=='Unaffiliated'){
    actionBar.style.display='flex';
    actionBar.style.alignItems='center';
    actionBar.style.gap='8px';
    const vNote=document.getElementById('verifiedToolNote');
    if(vNote)vNote.style.display=currentUserData.verifiedMember?'inline':'none';
  }
  // Wire filter buttons
  document.querySelectorAll('.tools-filter-btn').forEach(btn=>{
    btn.classList.toggle('active',btn.dataset.tcat===_toolsCurrentFilter||(_toolsCurrentFilter==='all'&&btn.dataset.tcat==='all'));
    btn.onclick=()=>loadTools(btn.dataset.tcat);
  });
  // Skeleton loading state
  list.innerHTML=Array(4).fill('<div class="skeleton skeleton-card"></div>').join('');
  try{
    let query=db.collection('tools').where('status','==','published');
    const snap=await query.orderBy('publishedAt','desc').limit(50).get().catch(async()=>{
      return await db.collection('tools').where('status','==','published').get();
    });
    let docs=snap.docs;
    if(_toolsCurrentFilter!=='all')docs=docs.filter(d=>d.data().category===_toolsCurrentFilter);
    if(!docs.length){
      list.innerHTML='<p style="font-family:var(--font-mono);font-size:.72rem;color:var(--color-text-muted);padding:24px;text-align:center;">No tools published yet. Be the first to submit one!</p>';
      return;
    }
    list.innerHTML=docs.map(d=>renderToolCard(d.data(),d.id)).join('');
    // Wire launch + detail clicks
    list.querySelectorAll('.tool-launch-btn').forEach(btn=>{
      btn.addEventListener('click',e=>{
        e.stopPropagation();
        const id=btn.closest('[data-tool-id]')?.dataset.toolId;
        if(id)incrementToolView(id);
      });
    });
    list.querySelectorAll('.tool-card').forEach(card=>{
      card.addEventListener('click',e=>{
        if(e.target.closest('.tool-launch-btn'))return;
        openToolDetail(card.dataset.toolId);
      });
    });
  }catch(err){
    list.innerHTML=`<p style="font-family:var(--font-mono);font-size:.72rem;color:rgba(192,192,192,.4);padding:24px;text-align:center;">Failed to load tools.</p>`;
    console.error('loadTools:',err);
  }
}

function renderToolCard(tool,id){
  const cat=TOOL_CAT_LABELS[tool.category]||'Other';
  const tags=(tool.tags||[]).slice(0,5).map(t=>`<span class="tech-pill">${esc(t)}</span>`).join('');
  const screenshot=tool.screenshotURL?`<img class="tool-screenshot" src="${esc(tool.screenshotURL)}" loading="lazy" onerror="this.style.display='none'" alt="">`:'' ;
  return `<div class="tool-card" data-tool-id="${id}" style="cursor:pointer;">
    ${screenshot}
    <div class="tool-card-header">
      <div class="tool-card-icon"><i class="fas fa-wrench"></i></div>
      <div style="flex:1;min-width:0;">
        <div class="tool-card-title">${esc(tool.title||'Untitled Tool')}</div>
        <span class="tool-cat-badge">${cat}</span>
      </div>
    </div>
    <p class="tool-card-desc">${esc(tool.shortDesc||'')}</p>
    ${tags?`<div class="tech-pills-row">${tags}</div>`:''}
    <div class="tool-card-footer">
      <span>${esc(tool.authorName||'Unknown')}</span>
      <span>${tool.viewCount||0} views</span>
      <a class="tool-launch-btn btn-secondary" href="${esc(tool.url)}" target="_blank" rel="noopener noreferrer" style="font-size:.65rem;padding:5px 12px;" onclick="event.stopPropagation();">
        <i class="fas fa-external-link-alt" style="margin-right:4px;"></i>Launch
      </a>
    </div>
  </div>`;
}

function openToolDetail(toolId){
  db.collection('tools').doc(toolId).get().then(doc=>{
    if(!doc.exists)return;
    const t=doc.data();
    const modal=document.createElement('div');
    modal.className='modal';
    modal.style.zIndex='9005';
    modal.innerHTML=`<div class="modal-container" style="max-width:560px;">
      <button class="close-btn" onclick="this.closest('.modal').remove()">&#x2715;</button>
      ${t.screenshotURL?`<img src="${esc(t.screenshotURL)}" style="width:100%;max-height:200px;object-fit:cover;border-radius:4px;margin-bottom:14px;" loading="lazy" onerror="this.style.display='none'" alt="">` :''}
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
        <h2 style="margin:0;flex:1;">${esc(t.title||'')}</h2>
        <span class="tool-cat-badge">${TOOL_CAT_LABELS[t.category]||'Other'}</span>
      </div>
      <p style="font-family:var(--font-mono);font-size:.72rem;color:var(--color-text-muted);margin-bottom:10px;">By ${esc(t.authorName||'Unknown')} · ${t.authorRank||''}</p>
      <p style="font-family:var(--font-mono);font-size:.75rem;color:var(--color-text-light);line-height:1.7;margin-bottom:12px;">${esc(t.longDesc||t.shortDesc||'No description provided.')}</p>
      ${(t.tags||[]).length?`<div class="tech-pills-row" style="margin-bottom:14px;">${t.tags.map(tag=>`<span class="tech-pill">${esc(tag)}</span>`).join('')}</div>`:''}
      <a class="btn-primary" href="${esc(t.url)}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;text-decoration:none;justify-content:center;width:100%;" onclick="incrementToolView('${id}')">
        <i class="fas fa-external-link-alt" style="margin-right:6px;"></i>Open Tool
      </a>
    </div>`;
    modal.addEventListener('click',e=>{if(e.target===modal)modal.remove();});
    document.body.appendChild(modal);
    requestAnimationFrame(()=>modal.style.display='flex');
    incrementToolView(toolId);
  }).catch(err=>console.error('openToolDetail:',err));
}

function incrementToolView(toolId){
  if(!toolId)return;
  db.collection('tools').doc(toolId).update({viewCount:firebase.firestore.FieldValue.increment(1)}).catch(()=>{});
}

/* ── SUBMIT TOOL MODAL ── */
function openSubmitToolModal(){
  if(!currentUser||currentUser.isAnonymous){showToast('Log in to submit tools.','warning');return;}
  _pendingToolScreenshotURL=null;
  ['toolTitle','toolShortDesc','toolLongDesc','toolUrl','toolTags'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('toolCategory').value='utility';
  const preview=document.getElementById('toolScreenshotPreview');
  const cta=document.getElementById('toolScreenshotCta');
  const clearBtn=document.getElementById('toolScreenshotClearBtn');
  if(preview){preview.style.display='none';preview.src='';}
  if(cta)cta.style.display='flex';
  if(clearBtn)clearBtn.style.display='none';
  const successMsg=document.getElementById('toolSubmitSuccess');
  if(successMsg)successMsg.style.display='none';
  openModal('submitToolModal');
}

document.getElementById('closeSubmitTool')?.addEventListener('click',()=>closeModal('submitToolModal'));
document.getElementById('submitToolModal')?.addEventListener('click',e=>{if(e.target.id==='submitToolModal')closeModal('submitToolModal');});

document.getElementById('submitToolBtn')?.addEventListener('click',openSubmitToolModal);

// Screenshot upload for tool
document.getElementById('toolScreenshotBox')?.addEventListener('click',e=>{
  if(e.target.closest('.banner-clear'))return;
  document.getElementById('toolScreenshotInput')?.click();
});
document.getElementById('toolScreenshotInput')?.addEventListener('change',async e=>{
  const file=e.target.files?.[0];if(!file)return;
  try{
    const dataURL=await resizeImageToDataURL(file,800,450,0.75);
    if(dataURL.length>600*1024){showToast('Image too large. Try a smaller screenshot.','warning');return;}
    _pendingToolScreenshotURL=dataURL;
    const preview=document.getElementById('toolScreenshotPreview');
    const cta=document.getElementById('toolScreenshotCta');
    const clearBtn=document.getElementById('toolScreenshotClearBtn');
    if(preview){preview.src=dataURL;preview.style.display='block';}
    if(cta)cta.style.display='none';
    if(clearBtn)clearBtn.style.display='block';
  }catch(err){showToast('Image error: '+err.message,'error');}
  e.target.value='';
});
document.getElementById('toolScreenshotClearBtn')?.addEventListener('click',e=>{
  e.stopPropagation();
  _pendingToolScreenshotURL=null;
  const preview=document.getElementById('toolScreenshotPreview');
  const cta=document.getElementById('toolScreenshotCta');
  const clearBtn=document.getElementById('toolScreenshotClearBtn');
  if(preview){preview.style.display='none';preview.src='';}
  if(cta)cta.style.display='flex';
  if(clearBtn)clearBtn.style.display='none';
});

document.getElementById('submitToolConfirmBtn')?.addEventListener('click',async()=>{
  if(!currentUser||currentUser.isAnonymous){showToast('Log in to submit tools.','warning');return;}
  const title=(document.getElementById('toolTitle')?.value||'').trim();
  const shortDesc=(document.getElementById('toolShortDesc')?.value||'').trim();
  const url=(document.getElementById('toolUrl')?.value||'').trim();
  if(!title){showToast('Please enter a tool name.','warning');return;}
  if(!shortDesc){showToast('Please add a short description.','warning');return;}
  if(!url||(!url.startsWith('https://')&&!url.startsWith('http://'))){showToast('Please enter a valid URL starting with https://','warning');return;}
  const btn=document.getElementById('submitToolConfirmBtn');
  btn.disabled=true;btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> Submitting...';
  try{
    const longDesc=(document.getElementById('toolLongDesc')?.value||'').trim();
    const category=document.getElementById('toolCategory')?.value||'utility';
    const rawTags=(document.getElementById('toolTags')?.value||'');
    const tags=rawTags.split(',').map(t=>t.trim()).filter(Boolean).slice(0,5);
    const isVerified=!!currentUserData?.verifiedMember;
    const payload={
      title,shortDesc,longDesc,url,category,tags,
      authorUid:currentUser.uid,
      authorName:currentUserData?.displayName||currentUser.email||'Unknown',
      authorRank:currentUserData?.rank||'Member',
      status:isVerified?'published':'pending',
      featured:false,
      viewCount:0,
      createdAt:firebase.firestore.FieldValue.serverTimestamp(),
      publishedAt:isVerified?firebase.firestore.FieldValue.serverTimestamp():null,
      reviewedBy:isVerified?currentUser.uid:null,
      rejectReason:''
    };
    if(_pendingToolScreenshotURL)payload.screenshotURL=_pendingToolScreenshotURL;
    await db.collection('tools').add(payload);
    await db.collection('users').doc(currentUser.uid).update({toolsSubmitted:firebase.firestore.FieldValue.increment(1)}).catch(()=>{});
    writeCorpLog('tool',isVerified?`published a tool: "${title}"`:`submitted a tool for review: "${title}"`);
    const msg=document.getElementById('toolSubmitSuccess');
    if(msg){
      msg.textContent=isVerified?'Tool published!':'Tool submitted! Awaiting admin review.';
      msg.style.display='block';
    }
    showToast(isVerified?'Tool published!':'Tool submitted for review.','success');
    if(isVerified)setTimeout(()=>loadTools(_toolsCurrentFilter),1000);
  }catch(err){
    console.error('submitTool:',err);
    showToast('Submit failed: '+err.message,'error');
  }finally{
    btn.disabled=false;btn.innerHTML='<i class="fas fa-paper-plane"></i> Submit Tool';
  }
});

/* ── ADMIN TOOLS REVIEW ── */
async function loadAdminTools(){
  const list=document.getElementById('adminToolsList');
  if(!list)return;
  list.innerHTML='<p style="font-family:var(--font-mono);font-size:.72rem;color:var(--color-text-muted);padding:10px 0;">Loading pending submissions...</p>';
  try{
    const snap=await db.collection('tools').where('status','==','pending').orderBy('createdAt','desc').get().catch(async()=>{
      return await db.collection('tools').where('status','==','pending').get();
    });
    if(!snap.docs.length){
      list.innerHTML='<p style="font-family:var(--font-mono);font-size:.72rem;color:var(--color-text-muted);padding:10px 0;text-align:center;">No pending tool submissions. Queue is clear.</p>';
      return;
    }
    list.innerHTML=snap.docs.map(d=>{
      const t=d.data();
      return `<div class="admin-tool-row" data-tid="${d.id}" style="padding:12px;border:var(--border);border-radius:4px;margin-bottom:10px;background:rgba(10,15,26,.8);">
        <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:8px;">
          ${t.screenshotURL?`<img src="${esc(t.screenshotURL)}" style="width:64px;height:40px;object-fit:cover;border-radius:3px;border:var(--border);flex-shrink:0;" loading="lazy" onerror="this.style.display='none'" alt="">`:''}
          <div style="flex:1;min-width:0;">
            <strong style="font-family:var(--font-main);font-size:.82rem;color:var(--color-text-light);display:block;">${esc(t.title||'Untitled')}</strong>
            <span style="font-family:var(--font-mono);font-size:.65rem;color:var(--color-text-muted);">by ${esc(t.authorName||'Unknown')} · ${esc(t.authorRank||'Member')}</span>
          </div>
          <span class="tool-cat-badge">${TOOL_CAT_LABELS[t.category]||'Other'}</span>
        </div>
        <p style="font-family:var(--font-mono);font-size:.72rem;color:var(--color-text-muted);margin-bottom:6px;line-height:1.6;">${esc(t.shortDesc||'')}</p>
        ${t.longDesc?`<details style="margin-bottom:6px;"><summary style="font-family:var(--font-mono);font-size:.65rem;color:rgba(192,192,192,.5);cursor:pointer;">Full description</summary><p style="font-family:var(--font-mono);font-size:.7rem;color:var(--color-text-muted);margin-top:6px;line-height:1.6;">${esc(t.longDesc)}</p></details>`:''}
        <p style="font-family:var(--font-mono);font-size:.65rem;margin-bottom:8px;">
          URL: <a href="${esc(t.url)}" target="_blank" rel="noopener noreferrer" style="color:var(--color-primary);word-break:break-all;">${esc(t.url)}</a>
        </p>
        <div style="display:flex;gap:8px;">
          <button class="btn-primary admin-approve-tool" data-tid="${d.id}" data-tname="${esc(t.title||'')}" data-tauthor="${d.data().authorUid}" style="font-size:.7rem;padding:7px 12px;flex:1;justify-content:center;"><i class="fas fa-check"></i> Approve</button>
          <button class="btn-secondary admin-reject-tool" data-tid="${d.id}" data-tname="${esc(t.title||'')}" style="font-size:.7rem;padding:7px 12px;flex:1;justify-content:center;border-color:rgba(244,67,54,.3);color:#f55;"><i class="fas fa-times"></i> Reject</button>
        </div>
      </div>`;
    }).join('');

    list.querySelectorAll('.admin-approve-tool').forEach(btn=>{
      btn.addEventListener('click',async()=>{
        if(!currentUser)return;
        const tid=btn.dataset.tid;
        const tname=btn.dataset.tname;
        const authorUid=btn.dataset.tauthor;
        btn.disabled=true;btn.innerHTML='<i class="fas fa-spinner fa-spin"></i>';
        try{
          await db.collection('tools').doc(tid).update({
            status:'published',
            publishedAt:firebase.firestore.FieldValue.serverTimestamp(),
            reviewedBy:currentUser.uid
          });
          await db.collection('users').doc(authorUid).update({toolsPublished:firebase.firestore.FieldValue.increment(1)}).catch(()=>{});
          showToast(`Tool "${tname}" approved and published!`,'success');
          await loadAdminTools();
        }catch(err){showToast('Approve failed: '+err.message,'error');btn.disabled=false;}
      });
    });

    list.querySelectorAll('.admin-reject-tool').forEach(btn=>{
      btn.addEventListener('click',async()=>{
        if(!currentUser)return;
        const reason=prompt(`Reject reason for "${btn.dataset.tname}"? (optional)`);
        if(reason===null)return;
        btn.disabled=true;btn.innerHTML='<i class="fas fa-spinner fa-spin"></i>';
        try{
          await db.collection('tools').doc(btn.dataset.tid).update({
            status:'rejected',
            rejectReason:reason||'',
            reviewedBy:currentUser.uid
          });
          showToast('Tool rejected.','info');
          await loadAdminTools();
        }catch(err){showToast('Reject failed: '+err.message,'error');btn.disabled=false;}
      });
    });

  }catch(err){
    console.error('loadAdminTools:',err);
    list.innerHTML='<p style="font-family:var(--font-mono);font-size:.72rem;color:rgba(192,192,192,.4);padding:10px 0;">Failed to load submissions.</p>';
  }
}

/* ══════════════════════════════════════════════════════
   SKILLS SYSTEM
   ══════════════════════════════════════════════════════ */

let _currentSkills=[];

function renderSkillPills(skills,container,editable=false){
  if(!container)return;
  container.innerHTML=(skills||[]).map(s=>`
    <span class="skill-pill">
      ${esc(s)}
      ${editable?`<button type="button" class="skill-pill-remove" data-skill="${esc(s)}" aria-label="Remove ${esc(s)}">&times;</button>`:''}
    </span>`).join('');
  if(editable){
    container.querySelectorAll('.skill-pill-remove').forEach(btn=>{
      btn.addEventListener('click',()=>{
        _currentSkills=_currentSkills.filter(sk=>sk!==btn.dataset.skill);
        renderSkillPills(_currentSkills,container,true);
      });
    });
  }
}

function addSkill(skill){
  const s=skill.trim().slice(0,30);
  if(!s||_currentSkills.includes(s)||_currentSkills.length>=10)return;
  _currentSkills.push(s);
  renderSkillPills(_currentSkills,document.getElementById('skillPillsContainer'),true);
}

// Wire skill input keydown (enter / comma)
document.getElementById('skillTagInput')?.addEventListener('keydown',e=>{
  if(e.key==='Enter'||e.key===','){
    e.preventDefault();
    const val=e.target.value.replace(',','').trim();
    if(val)addSkill(val);
    e.target.value='';
  }
});

// Wire preset buttons
document.querySelectorAll('.skill-preset-btn').forEach(btn=>{
  btn.addEventListener('click',()=>addSkill(btn.dataset.skill||btn.textContent));
});

// Populate skills when profile modal opens — hooked into the existing openMyProfile()
const _origOpenMyProfile=typeof openMyProfile==='function'?openMyProfile:null;
if(_origOpenMyProfile){
  openMyProfile=async function(){
    await _origOpenMyProfile();
    if(!currentUserData)return;
    _currentSkills=(currentUserData.skills||[]).slice(0,10);
    renderSkillPills(_currentSkills,document.getElementById('skillPillsContainer'),true);
    const githubEl=document.getElementById('editGithubUrl');
    const portfolioEl=document.getElementById('editPortfolioUrl');
    if(githubEl)githubEl.value=currentUserData.githubURL||'';
    if(portfolioEl)portfolioEl.value=currentUserData.portfolioURL||'';
  };
}

/* ══════════════════════════════════════════════════════
   PROJECTS BOARD
   ══════════════════════════════════════════════════════ */

let _pendingProjectScreenshotURL=null;

async function loadProjects(){
  updateHubSectionInfo({label:'Projects Board',count:'',note:'Real projects built by Corp members — apps, tools, games, and more.'});
  const list=document.getElementById('projectsList');
  const actionBar=document.getElementById('projectsActionBar');
  if(!list)return;
  if(actionBar&&currentUser&&!currentUser.isAnonymous&&currentUserData?.rank&&currentUserData.rank!=='Unaffiliated'){
    actionBar.style.display='flex';
    actionBar.style.alignItems='center';
  }
  list.innerHTML=Array(3).fill('<div class="skeleton skeleton-card"></div>').join('');
  try{
    const snap=await db.collection('projects').where('status','==','published').orderBy('createdAt','desc').limit(30).get().catch(async()=>{
      return await db.collection('projects').where('status','==','published').get();
    });
    if(!snap.docs.length){
      list.innerHTML='<p style="font-family:var(--font-mono);font-size:.72rem;color:var(--color-text-muted);padding:24px;text-align:center;">No projects posted yet. Be the first to share what you\'re building!</p>';
      return;
    }
    list.innerHTML=`<div class="project-board-grid">${snap.docs.map(d=>renderProjectCard(d.data(),d.id)).join('')}</div>`;
    list.querySelectorAll('.project-like-btn').forEach(btn=>{
      btn.addEventListener('click',e=>{e.stopPropagation();toggleProjectLike(btn.dataset.pid,btn);});
    });
    list.querySelectorAll('.project-card-link').forEach(a=>{a.addEventListener('click',e=>e.stopPropagation());});
  }catch(err){
    list.innerHTML='<p style="font-family:var(--font-mono);font-size:.72rem;color:rgba(192,192,192,.4);padding:24px;text-align:center;">Failed to load projects.</p>';
    console.error('loadProjects:',err);
  }
}

function renderProjectCard(project,id){
  const isLiked=currentUser&&(project.likes||[]).includes(currentUser.uid);
  const likeCount=(project.likes||[]).length;
  const techPills=(project.techStack||[]).slice(0,8).map(t=>`<span class="tech-pill">${esc(t)}</span>`).join('');
  const screenshot=project.screenshotURL?`<img class="project-card-img" src="${esc(project.screenshotURL)}" loading="lazy" onerror="this.style.display='none'" alt=""></img>`:'' ;
  const repoLink=project.repoURL?`<a class="project-card-link btn-secondary" href="${esc(project.repoURL)}" target="_blank" rel="noopener noreferrer" style="font-size:.62rem;padding:5px 10px;text-decoration:none;display:inline-flex;align-items:center;gap:4px;"><i class="fas fa-code-branch"></i>Repo</a>`:'';
  const liveLink=project.liveURL?`<a class="project-card-link btn-primary" href="${esc(project.liveURL)}" target="_blank" rel="noopener noreferrer" style="font-size:.62rem;padding:5px 10px;text-decoration:none;display:inline-flex;align-items:center;gap:4px;"><i class="fas fa-external-link-alt"></i>Live</a>`:'';
  return `<div class="project-card" data-pid="${id}">
    ${screenshot}
    <div class="project-card-body">
      <div class="project-card-title">${esc(project.title||'Untitled Project')}</div>
      <p class="project-card-desc">${esc((project.description||'').slice(0,200))}${(project.description||'').length>200?'…':''}</p>
      ${techPills?`<div class="tech-pills-row">${techPills}</div>`:''}
    </div>
    <div class="project-card-footer">
      <span style="font-family:var(--font-mono);font-size:.6rem;color:rgba(192,192,192,.4);flex:1;">${esc(project.authorName||'Unknown')}</span>
      ${repoLink}${liveLink}
      <button class="project-like-btn${isLiked?' liked':''}" data-pid="${id}" aria-label="Like project">
        <i class="fas fa-heart" style="font-size:.65rem;"></i>${likeCount||''}
      </button>
    </div>
  </div>`;
}

async function toggleProjectLike(pid,btn){
  if(!currentUser||currentUser.isAnonymous){showToast('Log in to like projects.','warning');return;}
  const ref=db.collection('projects').doc(pid);
  const snap=await ref.get().catch(()=>null);
  if(!snap?.exists)return;
  const likes=snap.data().likes||[];
  const hasLiked=likes.includes(currentUser.uid);
  try{
    await ref.update({
      likes:hasLiked?firebase.firestore.FieldValue.arrayRemove(currentUser.uid):firebase.firestore.FieldValue.arrayUnion(currentUser.uid)
    });
    const newCount=hasLiked?likes.length-1:likes.length+1;
    btn.classList.toggle('liked',!hasLiked);
    btn.innerHTML=`<i class="fas fa-heart" style="font-size:.65rem;"></i>${newCount||''}`;
  }catch(err){showToast('Could not update like.','error');}
}

// Load a small preview of recent projects for the dashboard panel
async function loadProjectsPreview(){
  const list=document.getElementById('projectsPreviewList');
  if(!list)return;
  list.innerHTML='<div class="skeleton skeleton-card" style="height:60px;"></div><div class="skeleton skeleton-card" style="height:60px;"></div>';
  try{
    const snap=await db.collection('projects').where('status','==','published').orderBy('createdAt','desc').limit(3).get().catch(async()=>{
      return await db.collection('projects').where('status','==','published').get();
    });
    if(!snap.docs.length){
      list.innerHTML='<p style="font-family:var(--font-mono);font-size:.68rem;color:rgba(192,192,192,.35);text-align:center;padding:10px 0;">No projects yet.</p>';
      return;
    }
    list.innerHTML=snap.docs.map(d=>{
      const p=d.data();
      const pills=(p.techStack||[]).slice(0,3).map(t=>`<span class="tech-pill">${esc(t)}</span>`).join('');
      return `<div class="preview-row" style="cursor:pointer;" onclick="openEngagementHub('projects')">
        <span class="preview-row-main" style="font-family:var(--font-mono);font-size:.75rem;color:var(--color-text-light);">${esc(p.title||'Untitled')}</span>
        <div class="tech-pills-row" style="margin-top:3px;">${pills}</div>
        <span style="font-family:var(--font-mono);font-size:.6rem;color:rgba(192,192,192,.35);">${esc(p.authorName||'Unknown')}</span>
      </div>`;
    }).join('');
  }catch(err){
    list.innerHTML='';
    console.error('loadProjectsPreview:',err);
  }
}

/* ── SUBMIT PROJECT MODAL ── */
function openSubmitProjectModal(){
  if(!currentUser||currentUser.isAnonymous){showToast('Log in to post projects.','warning');return;}
  _pendingProjectScreenshotURL=null;
  ['projectTitle','projectDescription','projectRepoUrl','projectLiveUrl','projectTechStack'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  const preview=document.getElementById('projectScreenshotPreview');
  const cta=document.getElementById('projectScreenshotCta');
  const clearBtn=document.getElementById('projectScreenshotClearBtn');
  if(preview){preview.style.display='none';preview.src='';}
  if(cta)cta.style.display='flex';
  if(clearBtn)clearBtn.style.display='none';
  const successMsg=document.getElementById('projectSubmitSuccess');
  if(successMsg)successMsg.style.display='none';
  openModal('submitProjectModal');
}

document.getElementById('closeSubmitProject')?.addEventListener('click',()=>closeModal('submitProjectModal'));
document.getElementById('submitProjectModal')?.addEventListener('click',e=>{if(e.target.id==='submitProjectModal')closeModal('submitProjectModal');});
document.getElementById('submitProjectBtn')?.addEventListener('click',openSubmitProjectModal);
document.getElementById('viewAllProjectsBtn')?.addEventListener('click',()=>openEngagementHub('projects'));

// Screenshot upload for project
document.getElementById('projectScreenshotBox')?.addEventListener('click',e=>{
  if(e.target.closest('.banner-clear'))return;
  document.getElementById('projectScreenshotInput')?.click();
});
document.getElementById('projectScreenshotInput')?.addEventListener('change',async e=>{
  const file=e.target.files?.[0];if(!file)return;
  try{
    const dataURL=await resizeImageToDataURL(file,800,450,0.75);
    if(dataURL.length>600*1024){showToast('Image too large. Try a smaller screenshot.','warning');return;}
    _pendingProjectScreenshotURL=dataURL;
    const preview=document.getElementById('projectScreenshotPreview');
    const cta=document.getElementById('projectScreenshotCta');
    const clearBtn=document.getElementById('projectScreenshotClearBtn');
    if(preview){preview.src=dataURL;preview.style.display='block';}
    if(cta)cta.style.display='none';
    if(clearBtn)clearBtn.style.display='block';
  }catch(err){showToast('Image error: '+err.message,'error');}
  e.target.value='';
});
document.getElementById('projectScreenshotClearBtn')?.addEventListener('click',e=>{
  e.stopPropagation();
  _pendingProjectScreenshotURL=null;
  const preview=document.getElementById('projectScreenshotPreview');
  const cta=document.getElementById('projectScreenshotCta');
  const clearBtn=document.getElementById('projectScreenshotClearBtn');
  if(preview){preview.style.display='none';preview.src='';}
  if(cta)cta.style.display='flex';
  if(clearBtn)clearBtn.style.display='none';
});

document.getElementById('submitProjectConfirmBtn')?.addEventListener('click',async()=>{
  if(!currentUser||currentUser.isAnonymous){showToast('Log in to post projects.','warning');return;}
  const title=(document.getElementById('projectTitle')?.value||'').trim();
  const description=(document.getElementById('projectDescription')?.value||'').trim();
  if(!title){showToast('Please enter a project name.','warning');return;}
  const btn=document.getElementById('submitProjectConfirmBtn');
  btn.disabled=true;btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> Posting...';
  try{
    const repoURL=(document.getElementById('projectRepoUrl')?.value||'').trim();
    const liveURL=(document.getElementById('projectLiveUrl')?.value||'').trim();
    const rawStack=(document.getElementById('projectTechStack')?.value||'');
    const techStack=rawStack.split(',').map(t=>t.trim()).filter(Boolean).slice(0,8);
    const payload={
      title,description,repoURL,liveURL,techStack,
      authorUid:currentUser.uid,
      authorName:currentUserData?.displayName||currentUser.email||'Unknown',
      authorRank:currentUserData?.rank||'Member',
      status:'published',
      likes:[],
      createdAt:firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt:firebase.firestore.FieldValue.serverTimestamp()
    };
    if(_pendingProjectScreenshotURL)payload.screenshotURL=_pendingProjectScreenshotURL;
    await db.collection('projects').add(payload);
    await db.collection('users').doc(currentUser.uid).update({projectsPosted:firebase.firestore.FieldValue.increment(1)}).catch(()=>{});
    writeCorpLog('project',`posted a new project: "${title}"`);
    const msg=document.getElementById('projectSubmitSuccess');
    if(msg)msg.style.display='block';
    showToast('Project posted!','success');
    setTimeout(()=>{loadProjects();loadProjectsPreview();},800);
  }catch(err){
    console.error('submitProject:',err);
    showToast('Post failed: '+err.message,'error');
  }finally{
    btn.disabled=false;btn.innerHTML='<i class="fas fa-paper-plane"></i> Post Project';
  }
});

// Display skills on profile view modal
const _origOpenViewProfile=typeof openViewProfile==='function'?openViewProfile:null;
if(_origOpenViewProfile){
  openViewProfile=async function(u){
    await _origOpenViewProfile(u);
    if(!u||!(u.skills||[]).length)return;
    const content=document.getElementById('profileContent');
    if(!content)return;
    const bioEl=content.querySelector('.profile-bio');
    const skillsRow=document.createElement('div');
    skillsRow.className='profile-skills-row';
    skillsRow.innerHTML=(u.skills||[]).map(s=>`<span class="skill-pill">${esc(s)}</span>`).join('');
    if(bioEl)bioEl.insertAdjacentElement('afterend',skillsRow);
    else content.appendChild(skillsRow);
  };
}
