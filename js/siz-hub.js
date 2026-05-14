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
// Cache the full users collection for 2 minutes to avoid repeat fetches during rotation
let _usersCache=null,_usersCacheTime=0;
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
    // 2) Heuristic fallback — score-based rotation (cached for 2 min).
    const now=Date.now();
    let allUsers;
    if(_usersCache&&(now-_usersCacheTime)<120000){
      allUsers=_usersCache;
    }else{
      const snap=await db.collection('users').get();
      allUsers=snap.docs.map(d=>({...d.data(),id:d.id}));
      _usersCache=allUsers;
      _usersCacheTime=now;
    }
    const snap={forEach:(fn)=>allUsers.forEach(u=>{const fakeDoc={data:()=>u,id:u.id};fn(fakeDoc);})};
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
    // Configure deliverable section based on submissionType
    const subType=mission.submissionType||'key';
    const delivSection=document.getElementById('briefingDeliverableSection');
    const keyRow=document.getElementById('briefingKeyRow');
    const keyLabel=document.getElementById('briefingKeyLabel');
    const keyHint=document.getElementById('briefingKeyHint');
    const delivLabel=document.getElementById('briefingDeliverableLabel');
    const delivHint=document.getElementById('briefingDeliverableHint');
    const delivInput=document.getElementById('briefingDeliverableInput');
    const delivNote=document.getElementById('briefingDeliverableNote');
    if(delivInput)delivInput.value='';
    if(delivNote)delivNote.value='';
    if(subType==='key'||subType==='key_or_link'){
      if(keyRow)keyRow.style.display='';
      if(keyLabel)keyLabel.textContent='Submit Mission KEY';
      if(keyHint)keyHint.innerHTML='Use the <strong>/key</strong> command in Discord to retrieve the KEY for this mission.';
    }
    if(subType==='link'||subType==='text'){
      if(keyRow)keyRow.style.display='none';
    }
    if(subType==='link'||subType==='text'||subType==='key_or_link'){
      if(delivSection)delivSection.style.display='';
      if(delivLabel)delivLabel.textContent=mission.submissionPrompt||'Submit Your Work';
      if(delivHint)delivHint.textContent=subType==='text'?'Describe your submission below.':'Paste a link to your work (GitHub, live URL, file, etc.).';
      if(delivInput)delivInput.placeholder=subType==='text'?'Describe what you did...':'https://...';
    } else {
      if(delivSection)delivSection.style.display='none';
    }
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
      const delivInput=document.getElementById('briefingDeliverableInput');
      const delivNote=document.getElementById('briefingDeliverableNote');
      const subType=m.submissionType||'key';
      // Validate deliverable requirement
      if((subType==='link'||subType==='text')&&!delivInput?.value.trim()){
        fb.textContent='Please fill in your submission.';fb.className='briefing-feedback err';
        btn.disabled=false;btn.innerHTML='<i class="fas fa-key"></i> Submit';
        return;
      }
      await db.collection('missionSubmissions').add({
        uid:currentUser.uid,
        displayName:currentUserData?.displayName||'Unknown',
        missionId:m.id,
        missionTitle:m.title||'Mission',
        keySubmitted:keyVal,
        submissionLink:(delivInput?.value||'').trim(),
        submissionNote:(delivNote?.value||'').trim(),
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
