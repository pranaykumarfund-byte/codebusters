export function createCaregiverView(state,escapeHtml,categories,date){
  const profileName=state.profile?.name||'Samira Reddy';
  const profileInitials=profileName.trim().split(/\s+/).slice(0,2).map(part=>part[0]||'').join('').toUpperCase()||'SR';
  const c=state.caregivers.find(x=>x.id===state.caregiverSelection)||state.caregivers[0];
  const permissions=c?.permissions||[];
  const permissionMarkup=permissions.length?permissions.slice().reverse().map(g=>{
    const actions=escapeHtml(g.actions.map(x=>x.replaceAll('_',' ')).join(', '));
    const scope=g.categories.length?escapeHtml(g.categories.join(', ')):'No record category scope';
    const status=g.status==='active'?'<span class="badge badge-teal">active</span>':'<span class="badge badge-red">revoked</span>';
    const revoke=g.status==='active'?`<button class="btn btn-sm btn-danger" style="margin-top:8px" data-action="revoke-caregiver" data-grant="${g.id}">Revoke this permission</button>`:'';
    const edit=g.status==='active'?`<button class="btn btn-sm" style="margin-top:8px;margin-right:5px" data-action="edit-caregiver" data-grant="${g.id}">Modify scope</button>`:'';
    return `<div class="grant-card" style="padding:11px 0;border-bottom:1px solid var(--line)"><div class="grant-head"><div><h3>${actions}</h3><small>${scope} · until ${date(g.expiresAt)}</small></div>${status}</div>${edit}${revoke}</div>`;
  }).join(''):'<div class="empty-state"><strong>No caregiver permissions</strong>Choose specific actions in the grant form.</div>';
  const navStatus=c?.status||'No access yet';
  return `<div class="page-heading"><div><div class="eyebrow">SHARED WITH CARE</div><h1>Caregiver access</h1><p>Grant a fictional caregiver only the actions and categories you choose. Access does not include all records by default.</p></div><span class="badge badge-blue">${escapeHtml(navStatus)}</span></div>
  <div class="split-layout"><section class="card"><div class="card-header"><div><h2>Care team</h2><p>Fictional patient and caregiver accounts</p></div></div><div class="card-body">
    <div class="activity-item"><span class="avatar">${profileInitials}</span><span class="activity-copy"><strong>${escapeHtml(profileName)} · You</strong><small>Fictional patient · all control remains with the patient</small></span><span class="badge badge-teal">Owner</span></div>
    <div class="activity-item"><span class="avatar" style="background:linear-gradient(145deg,#cfb1ed,#8174ae)">AR</span><span class="activity-copy"><strong>Ananya Rao</strong><small>Daughter · fictional caregiver · ${escapeHtml(navStatus)}</small></span><span class="badge ${c?.status==='Scoped access'?'badge-teal':'badge-blue'}">${c?.status==='Scoped access'?'Scoped':'No access'}</span></div>
    <div class="section-title"><div><h2>Permission grants</h2><p>Each action is checked against its current scope.</p></div></div>${permissionMarkup}
  </div></section><section class="card"><div class="card-header"><div><h2>Grant scoped permissions</h2><p>Every permission can be changed or revoked.</p></div></div><div class="card-body">
    <form id="caregiverForm"><input type="hidden" name="caregiverId" value="${escapeHtml(c?.id||'CG-01')}">
      <div class="field"><label>Allow these actions</label>
        <label class="permission-row"><input type="checkbox" name="actions" value="view_selected_records"> <span class="subtle-note">View selected records</span></label>
        <label class="permission-row"><input type="checkbox" name="actions" value="review_appointments"> <span class="subtle-note">Review appointment information</span></label>
        <label class="permission-row"><input type="checkbox" name="actions" value="prepare_visit_summary"> <span class="subtle-note">Prepare a visit summary</span></label>
        <label class="permission-row"><input type="checkbox" name="actions" value="manage_admin_tasks"> <span class="subtle-note">Manage selected administrative tasks</span></label>
      </div>
      <div class="field" style="margin-top:13px"><label>Limit record categories</label><div class="checkbox-list" style="display:grid;grid-template-columns:1fr 1fr">${categories.map(category=>`<label class="checkbox-option"><input type="checkbox" name="categories" value="${escapeHtml(category)}">${escapeHtml(category)}</label>`).join('')}</div><small class="field-help">Record viewing and visit summaries require at least one selected category. Sensitive notes remain private unless explicitly selected.</small></div>
      <div class="field" style="margin-top:12px"><label for="caregiverDuration">Duration</label><select id="caregiverDuration" name="durationDays"><option value="1">1 day</option><option value="7" selected>7 days</option><option value="30">30 days</option><option value="90">90 days</option></select></div>
      <button class="btn btn-primary" style="margin-top:14px;width:100%" type="submit">Grant selected permissions</button>
    </form><div class="divider"></div><h3 class="tiny" style="color:#d6e5e5">Boundary check</h3><p class="subtle-note">Attempt to view a consultation note. If that category or action is not permitted, the request is blocked and added to the audit log.</p><button class="btn btn-sm" data-action="caregiver-attempt">Simulate out-of-scope request</button>
  </div></section></div>`;
}
