/* ═══════════════════════════════════════════════════════
   HOME COMMAND BOARD
═══════════════════════════════════════════════════════ */
const HOME_PREVIEW_CONFIG={
  log:{
    eyebrow:'New Operatives',
    title:'Welcome Log',
    meta:'Operatives who have recently enlisted with TheSizNexus.',
    openLabel:'Open Welcome Log'
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
  // Fetch recent entries and filter join type client-side (no composite index needed)
  const snap=await db.collection('corpLog').orderBy('createdAt','desc').limit(100).get();
  const joinDocs=snap.docs.filter(d=>d.data().type==='join').slice(0,5);
  if(!joinDocs.length)return '<div class="hub-empty">No new operatives have enlisted yet.</div>';
  return joinDocs.map(d=>{
    const log=d.data();
    const time=log.createdAt?`${fmtDate(log.createdAt)} ${fmtTime(log.createdAt)}`:'Recent';
    return buildPreviewRow({
      icon:'fa-door-open',
      title:esc(log.displayName||'Unknown'),
      text:'Enlisted as a new operative.',
      meta:`${esc(log.rank||'Member')} • ${time}`,
      badge:'New',
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
  // Wave 1 (immediate): DOM-only updates, no Firestore
  updateCommandBoardIdentity();
  refreshStreakPanel();
  // Wave 2 (deferred): Firestore queries — yield to browser paint first
  setTimeout(()=>{
    loadHomePreview(homePreviewTab);
    loadNetworkSnapshot();
    loadFeaturedMembers();
    loadProjectsPreview();
  },200);
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
