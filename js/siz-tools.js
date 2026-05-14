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
