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
    clearInterval(debugTimer);
  }
  // Debugger timing — catches undocked/detached DevTools (slowed to 4s to eliminate micro-stutter)
  const debugTimer=setInterval(()=>{
    const t=performance.now();
    // eslint-disable-next-line no-debugger
    debugger;
    if(performance.now()-t>150) lockDown();
  },4000);
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
particlesJS('particles-js',{particles:{number:{value:window.innerWidth<768?20:40,density:{enable:true,value_area:window.innerWidth<768?400:800}},color:{value:'#A8B2C1'},shape:{type:'circle'},opacity:{value:.15,random:true},size:{value:window.innerWidth<768?.8:1.2,random:true},line_linked:{enable:true,distance:150,color:'#A8B2C1',opacity:.05,width:1},move:{enable:true,speed:window.innerWidth<768?.3:.5,direction:'none',random:true}},interactivity:{events:{onhover:{enable:false}}}});
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

/* ── SNX NAMESPACE ──
   Shared state object for cross-file access.
   Future module files read/write SNX.currentUser, SNX.currentUserData.
   Backward-compat: bare `currentUser` / `currentUserData` still work
   inside this file. External files must use SNX.* or window.* to access
   state set by this file. ── */
window.SNX={
  get currentUser(){return currentUser;},
  set currentUser(v){currentUser=v;},
  get currentUserData(){return currentUserData;},
  set currentUserData(v){currentUserData=v;},
  _authResolved:false,
  _authCallbacks:[],
  onAuthReady(cb){
    if(window.SNX._authResolved)cb(currentUser,currentUserData);
    else window.SNX._authCallbacks.push(cb);
  }
};
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
