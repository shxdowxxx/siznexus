/* ── ACTIVE MEMBERS PANEL ── */
const PRESENCE_STALE_MS = 3 * 60 * 1000; // 3 minutes — heartbeat is 60s, so 3 min = 3 missed beats
function startActiveMembersListener(){
  if(activeMembersUnsub)activeMembersUnsub();
  activeMembersUnsub=db.collection('users').where('status','==','online').onSnapshot(snap=>{
    const list=document.getElementById('activeMembersList');
    const countLabel=document.getElementById('onlineCountLabel');
    const statCount=document.getElementById('activeMemberCount');
    const commandCount=document.getElementById('commandOnlineValue');
    list.innerHTML='';
    const blockedList=currentUserData?.blockedUsers||[];
    const now=Date.now();
    const members=[];
    snap.forEach(d=>{
      const u=d.data();u.id=d.id;
      if(blockedList.includes(u.id))return;
      // Never filter the current user — they are present on this page right now
      if(currentUser&&u.id===currentUser.uid){members.push(u);return;}
      // Staleness check:
      //   - no lastActive → stale (login always sets it, so absence = ghost account)
      //   - lastActive older than 3 min → stale (heartbeat stopped = user is gone)
      const lastActive=u.lastActive?.toDate?.()?.getTime()||0;
      const isStale=!lastActive||(now-lastActive)>PRESENCE_STALE_MS;
      if(isStale){
        // Only write cleanup after auth has resolved — avoids racing the login write
        if(window.SNX._authResolved){
          db.collection('users').doc(u.id).update({status:'offline'}).catch(()=>{});
        }
        return;
      }
      members.push(u);
    });
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
    if(!currentUser||currentUser.isAnonymous)return;
    // Refresh both lastActive AND status so staleness detection works
    const status=document.hidden?'idle':(currentPresenceStatus||'online');
    db.collection('users').doc(currentUser.uid).update({
      lastActive:firebase.firestore.FieldValue.serverTimestamp(),
      status
    }).catch(()=>{});
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
    const newGithub=document.getElementById('editGithubUrl')?.value.trim()||'';
    const newPortfolio=document.getElementById('editPortfolioUrl')?.value.trim()||'';
    const updates={bio:newBio,skills:_currentSkills.slice(0,10),githubURL:newGithub,portfolioURL:newPortfolio};
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
    setTimeout(()=>refreshDashboardSurface(),0);
  }else{
    currentUserData=null;
    document.getElementById('userAvatar').style.display='none';document.getElementById('defaultIcon').style.display='block';
    logoutBtn.style.display='none';loginBtn.style.display='flex';myProfileBtn.style.display='none';notifBtn.classList.remove('show');
    document.getElementById('adminPanelBtn').style.display='none';
    applyGuestRestrictions(true); // logged-out = guest
    if(notifUnsubscribe){notifUnsubscribe();notifUnsubscribe=null;}
    setTimeout(()=>refreshDashboardSurface(),0);
  }
  // Resolve SNX auth callbacks so external js/ files can gate on auth state
  if(!window.SNX._authResolved){
    window.SNX._authResolved=true;
    window.SNX._authCallbacks.forEach(cb=>cb(currentUser,currentUserData));
    window.SNX._authCallbacks=[];
  }
});
// pagehide fires reliably on tab close, navigation, and mobile background — unlike beforeunload
function _handlePageHide(){
  if(!currentUser)return;
  if(currentUser.isAnonymous){
    db.collection('users').doc(currentUser.uid).delete().catch(()=>{});
    currentUser.delete().catch(()=>{});
    sessionStorage.removeItem('_anonUid');
  }else{
    db.collection('users').doc(currentUser.uid).update({status:'offline'}).catch(()=>{});
  }
}
window.addEventListener('pagehide',_handlePageHide);
window.addEventListener('beforeunload',_handlePageHide); // desktop fallback
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
