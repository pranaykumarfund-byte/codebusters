import { createHash, randomUUID } from 'node:crypto';

const now = () => new Date().toISOString();
const daysFromNow = (days) => new Date(Date.now() + days * 86400000).toISOString();
const sleep = (ms = 70) => new Promise((resolve) => setTimeout(resolve, ms));
const copy = (value) => structuredClone(value);
const hash = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex');

const initialRecords = () => [
  { id:'HV-LAB-1042', title:'Lipid panel', type:'Laboratory report', category:'Laboratory reports', provider:'Starlight Family Clinic', location:'Hyderabad, TS', eventDate:'2026-04-12', reportDate:'2026-04-13', uploadDate:'2026-04-14', source:'Original portal export', provenance:'Uploaded by patient · original PDF retained', verification:'Source verified', values:'Total cholesterol: 182 mg/dL · HDL: 54 mg/dL · LDL: 106 mg/dL', conflicts:['Date differs from a later re-upload'], sharing:'Included in specialist share', version:1, history:[] },
  { id:'HV-LAB-1098', title:'Lipid panel — scanned copy', type:'Laboratory report', category:'Laboratory reports', provider:'Starlight Family Clinic', location:'Hyderabad, TS', eventDate:'2026-04-21', reportDate:'2026-04-13', uploadDate:'2026-05-02', source:'Patient-uploaded scan', provenance:'Re-uploaded scan · date printed on scan needs human review', verification:'Needs review', values:'Total cholesterol: 182 mg/dL · HDL: 54 mg/dL · LDL: 106 mg/dL', conflicts:['Possible duplicate of HV-LAB-1042','Event date mismatch'], sharing:'Not shared', version:1, possibleDuplicateOf:'HV-LAB-1042', history:[] },
  { id:'HV-RX-2071', title:'Handwritten prescription', type:'Prescription', category:'Prescriptions', provider:'Dr. Meera Rao', location:'Lotus Care Centre · Hyderabad, TS', eventDate:'2026-05-09', reportDate:'2026-05-09', uploadDate:'2026-05-10', source:'Phone scan · OCR demo', provenance:'Synthetic handwritten sample · OCR output is not a medical instruction', verification:'Human verification required', values:'Dosage field: “5? mg” · confidence 42%', conflicts:['Dosage text is uncertain'], ocr:{ field:'dosage', text:'5? mg', confidence:0.42, verified:false }, sharing:'Not shared', version:1, history:[] },
  { id:'HV-CNS-3304', title:'Follow-up consultation note', type:'Consultation note', category:'Consultation notes', provider:'Dr. Meera Rao', location:'Lotus Care Centre · Hyderabad, TS', eventDate:'2026-05-09', reportDate:'2026-05-10', uploadDate:'2026-05-11', source:'Clinic portal export', provenance:'Patient-uploaded document', verification:'Source verified', values:'Follow-up visit recorded. Source note contains clinician-authored observations.', conflicts:[], sharing:'Not shared', version:1, history:[] },
  { id:'HV-IMG-4185', title:'Chest imaging report', type:'Imaging report', category:'Imaging reports', provider:'Harbor Diagnostics', providerSourceValue:'Harbor Medical Centre', location:'Secunderabad, TS', eventDate:'2026-02-18', reportDate:'2026-02-20', uploadDate:'2026-02-20', source:'Diagnostic center export', provenance:'Imported from synthetic demo folder', verification:'Needs review', values:'Report text is preserved as supplied by the fictional source.', conflicts:['Provider information differs between the report header and export metadata'], sharing:'Not shared', version:1, history:[] },
  { id:'HV-DS-5120', title:'Day-care discharge summary', type:'Discharge summary', category:'Discharge summaries', provider:'', location:'Hyderabad, TS', eventDate:'2025-12-03', reportDate:'2025-12-03', uploadDate:'2025-12-08', source:'Scanned document', provenance:'OCR-assisted extraction · original scan retained', verification:'Needs review', values:'Discharge date is present; attending provider field is blank.', conflicts:['Missing provider metadata'], sharing:'Not shared', version:1, history:[] },
  { id:'HV-VAX-6833', title:'Seasonal vaccination record', type:'Vaccination record', category:'Vaccination records', provider:'Starlight Family Clinic', location:'Hyderabad, TS', eventDate:'2025-10-11', reportDate:'2025-10-11', uploadDate:'2025-10-12', source:'Patient-held record', provenance:'Synthetic record · manually entered source label', verification:'Patient supplied', values:'Vaccination entry recorded by the fictional patient.', conflicts:[], sharing:'Not shared', version:1, history:[] },
  { id:'HV-LAB-7703', title:'Complete blood count', type:'Laboratory report', category:'Laboratory reports', provider:'Cedar Diagnostics', location:'Hyderabad, TS', eventDate:'2025-08-14', reportDate:'2025-08-15', uploadDate:'2025-08-22', source:'Portal export', provenance:'Original source file retained', verification:'Source verified', values:'Synthetic values shown for interface demonstration only.', conflicts:[], sharing:'Not shared', version:1, history:[] },
  { id:'HV-RX-8840', title:'Prescription summary', type:'Prescription', category:'Prescriptions', provider:'Dr. Kiran Iyer', location:'Greenline Clinic · Hyderabad, TS', eventDate:'2025-06-06', reportDate:'2025-06-06', uploadDate:'2025-06-07', source:'Clinic portal export', provenance:'Source text is synthetic', verification:'Source verified', values:'Source-reported prescription text; not a treatment recommendation.', conflicts:[], sharing:'Not shared', version:1, history:[] },
];

const edgeCases = [
  ['EC-01','Date mismatch','Two copies of one synthetic lab report contain different event dates.'],
  ['EC-02','Near duplicate','Same source values appear in a later scan; both records are preserved.'],
  ['EC-03','Uncertain OCR','Handwritten prescription dosage is “5? mg” at 42% confidence.'],
  ['EC-04','Missing provider','Discharge summary has no attending provider in the extracted metadata.'],
  ['EC-05','Provider mismatch','Imaging body and file provenance name different source locations.'],
  ['EC-06','Stale source','A demo source has not been refreshed during the displayed freshness window.'],
  ['EC-07','Revoked consent','A formerly active recipient grant must deny subsequent reads.'],
  ['EC-08','Expired consent','An expired grant cannot reveal selected records.'],
  ['EC-09','Caregiver scope','A caregiver cannot open a category outside the granted scope.'],
  ['EC-10','Emergency actor','Unlisted hospital identities cannot invoke break-glass access.'],
  ['EC-11','Short justification','Emergency requests without a meaningful reason are denied.'],
  ['EC-12','Correction lineage','Corrected report retains the original and links the new version.'],
  ['EC-13','Share propagation','Active shares are identified when a shared source receives a correction.'],
  ['EC-14','Conflicting edits','Outdated record versions require a human resolution.'],
  ['EC-15','Service timeout','A simulated timeout returns an error and leaves saved records intact.'],
  ['EC-16','Malformed payload','Missing required fields fail validation and create an audit event.'],
  ['EC-17','Audit integrity','Changing an old event breaks the hash-linked chain check.'],
  ['EC-18','Sensitive default','Consultation notes are private unless explicitly selected.'],
  ['EC-19','Download limitation','Revocation cannot recall a file already downloaded by a recipient.'],
  ['EC-20','Accessibility mode','Two-dimensional mode keeps record hotspots operable by keyboard.'],
];

function makeAuditEvent(state, actor, action, resource, outcome, reason = '') {
  const event = { id:`AUD-${String(state.audit.length + 1).padStart(5,'0')}`, actor, action, resource, timestamp:now(), outcome, reason, previousHash:state.audit.at(-1)?.hash ?? 'GENESIS' };
  event.hash = hash(event);
  state.audit.push(event);
  return event;
}

export function verifyAudit(events) {
  let previousHash = 'GENESIS';
  for (const event of events) {
    const { hash: recorded, ...body } = event;
    if (body.previousHash !== previousHash || hash(body) !== recorded) return { valid:false, failedEventId:event.id };
    previousHash = recorded;
  }
  return { valid:true, checked:events.length };
}

export function createState() {
  const records = initialRecords();
  const state = {
    profile:{name:'Samira Reddy',email:'',phone:'',dateOfBirth:'',label:'Fictional patient · demo account'},
    records,
    grants:[],
    caregivers:[{id:'CG-01',name:'Ananya Rao',relationship:'Daughter · fictional',status:'No access yet',permissions:[]}],
    providers:[{id:'P-01',name:'Starlight Family Clinic',connectedRecords:3},{id:'P-02',name:'Lotus Care Centre',connectedRecords:2},{id:'P-03',name:'Harbor Diagnostics',connectedRecords:1},{id:'P-04',name:'Cedar Diagnostics',connectedRecords:1}],
    notifications:[{id:'N-01',title:'Date review requested',body:'Two synthetic lipid reports show different event dates.',time:now(),kind:'review'},{id:'N-02',title:'OCR needs a human check',body:'A sample prescription contains uncertain text.',time:now(),kind:'review'}],
    audit:[], scenarios:{}, demoState:{stale:false,outage:false,conflictingUpdate:null,selectedProvider:null},
    edgeCases, freshness:{lastRefreshed:now(),source:'Synthetic local demo API',staleAfterMinutes:30},
  };
  makeAuditEvent(state,'VIBA demo','DEMO_INITIALIZED','synthetic workspace','success','Synthetic data only');
  const seedGrant = {
    id:'SH-7DAY-01', recipient:'Dr. Asha Menon · Endocrinology (fictional)', recipientType:'Specialist',
    recordIds:['HV-LAB-1042','HV-CNS-3304'], categories:[], purpose:'Specialist consultation preparation',
    createdAt:now(), expiresAt:daysFromNow(7), status:'active', simulated:true,
  };
  state.grants.push(seedGrant);
  makeAuditEvent(state,'Fictional patient','CONSENT_CREATED',seedGrant.id,'success','Two selected records · 7-day specialist share');
  return state;
}

function response(data, error = null) { return { success:!error, data:error ? null : data, error, timestamp:now(), synthetic:true }; }
function fail(code, message, details) { return response(null,{code,message,details}); }
function findRecord(state,id) { return state.records.find((record)=>record.id===id); }
function grantStatus(grant) { return grant.status === 'active' && new Date(grant.expiresAt) <= new Date() ? 'expired' : grant.status; }
function visibleThroughGrant(state, grant) {
  const status = grantStatus(grant);
  if (status !== 'active') return [];
  return state.records.filter((record) => grant.recordIds.includes(record.id) || grant.categories.includes(record.category));
}
function recordsFor(state, filters = {}) {
  const query = String(filters.search || '').trim().toLowerCase();
  const result = state.records.filter((r) => (!filters.category || r.category===filters.category) && (!filters.provider || r.provider===filters.provider) && (!query || `${r.id} ${r.title} ${r.provider} ${r.type} ${r.values}`.toLowerCase().includes(query)));
  const sort = filters.sort === 'oldest' ? 1 : -1;
  return result.sort((a,b)=>sort * a.eventDate.localeCompare(b.eventDate));
}
function conflictsFor(state) {
  const out=[];
  const labA=findRecord(state,'HV-LAB-1042'), labB=findRecord(state,'HV-LAB-1098');
  if (labA && labB && !state.scenarios['lab-reviewed']) out.push({id:'CF-DATE-01',type:'Inconsistent event dates',records:[labA.id,labB.id],values:[{recordId:labA.id,value:labA.eventDate,source:labA.source},{recordId:labB.id,value:labB.eventDate,source:labB.source}],why:'The uploaded scan reports a later event date while the report issue date and source values align with the first copy. The source does not establish which event date is correct.',confidence:'High confidence that values differ · correctness unresolved',origin:'Patient-uploaded scan and original portal export',freshness:'Current local demo records',actions:['Compare source','Retain both','Link as possible duplicate','Record correction']});
  const ocr=state.records.find((r)=>r.ocr && !r.ocr.verified);
  if(ocr) out.push({id:'CF-OCR-01',type:'Uncertain OCR field',records:[ocr.id],values:[{recordId:ocr.id,value:ocr.ocr.text,source:'OCR · 42% confidence'}],why:'The handwritten dosage cannot be transcribed with confidence. No dosage is inferred or confirmed.',confidence:'42% field confidence',origin:'Synthetic phone scan · OCR demo',freshness:'Extracted for this demo',actions:['Request human verification']});
  if(labA&&labB) out.push({id:'CF-DUP-01',type:'Possible duplicate records',records:[labA.id,labB.id],values:[{recordId:labA.id,value:`${labA.title} · ${labA.values}`,source:labA.source},{recordId:labB.id,value:`${labB.title} · ${labB.values}`,source:labB.source}],why:'The source values match closely, while the upload provenance and event date differ. They are linked for review but remain separate records.',confidence:'Possible match · not merged',origin:'Original portal export and patient-uploaded scan',freshness:'Current local demo records',actions:['Link as possible duplicate','Retain both']});
  const missing=state.records.find((r)=>!r.provider || r.conflicts?.includes('Missing provider metadata'));
  if(missing) out.push({id:'CF-META-01',type:'Missing provider metadata',records:[missing.id],values:[{recordId:missing.id,value:missing.provider || 'Provider not supplied',source:missing.source}],why:'The provider field is blank in the source metadata. Verify against the original document.',confidence:'Not scored',origin:missing.provenance,freshness:'Current local demo records',actions:['Review source','Add a correction assertion']});
  const providerDiff=state.records.find(r=>r.providerSourceValue&&r.providerSourceValue!==r.provider);
  if(providerDiff) out.push({id:'CF-PROVIDER-01',type:'Provider information differs',records:[providerDiff.id],values:[{recordId:providerDiff.id,value:providerDiff.provider,source:'Export metadata'},{recordId:providerDiff.id,value:providerDiff.providerSourceValue,source:'Report header'}],why:'The provider label in the report header differs from export metadata. Verify both values against the original source.',confidence:'Difference detected · correctness unresolved',origin:providerDiff.provenance,freshness:'Current local demo records',actions:['Review source']});
  for(const r of state.records.filter(item=>item.supersededBy))out.push({id:`CF-SUP-${r.id}`,type:'Superseded record',records:[r.id,r.supersededBy],values:[{recordId:r.id,value:r.verification,source:'Preserved original'},{recordId:r.supersededBy,value:'Linked correction assertion',source:'Correction history'}],why:'A correction assertion is linked to this original. The original remains preserved and is marked superseded.',confidence:'Lineage recorded',origin:r.source,freshness:'Current local demo records',actions:['Review correction history']});
  for(const r of state.records.filter(item=>item.conflicts?.includes('Patient requested human review')))out.push({id:`CF-USER-${r.id}`,type:'Patient-requested source review',records:[r.id],values:[{recordId:r.id,value:'Human review requested',source:r.source}],why:'The patient flagged this record for source review. The record values have not been changed.',confidence:'Patient flag · correctness unresolved',origin:r.provenance,freshness:'Current local demo records',actions:['Review source','Add correction assertion']});
  return out;
}

export class HealthverseService {
  constructor(state = createState()) { this.state = state; }
  async getBootstrap() {
    await sleep();
    return response({profile:copy(this.state.profile),records:copy(this.state.records),providers:copy(this.state.providers),grants:copy(this.state.grants).map(g=>({...g,status:grantStatus(g)})),caregivers:copy(this.state.caregivers),notifications:copy(this.state.notifications),conflicts:conflictsFor(this.state),edgeCases:copy(this.state.edgeCases),freshness:copy(this.state.freshness),demoState:copy(this.state.demoState)});
  }
  async updateProfile(payload={}) {
    await sleep();
    const name=String(payload.name??'').trim(),email=String(payload.email??'').trim(),phone=String(payload.phone??'').trim(),dateOfBirth=String(payload.dateOfBirth??'').trim();
    if(!name||name.length>80)return fail('VALIDATION','Enter a name between 1 and 80 characters.');
    if(email.length>120||(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)))return fail('VALIDATION','Enter a valid email address up to 120 characters, or leave it blank.');
    if(phone.length>24||(phone&&!/^\+?[0-9\s().-]{7,24}$/.test(phone)))return fail('VALIDATION','Enter a valid phone number, or leave it blank.');
    if(dateOfBirth){const date=new Date(`${dateOfBirth}T12:00:00Z`);if(!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)||Number.isNaN(date.getTime())||date.toISOString().slice(0,10)!==dateOfBirth||dateOfBirth<'1900-01-01'||dateOfBirth>now().slice(0,10))return fail('VALIDATION','Enter a valid date of birth between 1900 and today.');}
    const next={...this.state.profile,name,email,phone,dateOfBirth};
    const changed=['name','email','phone','dateOfBirth'].filter(field=>next[field]!==this.state.profile[field]);
    if(changed.length){this.state.profile=next;makeAuditEvent(this.state,'Fictional patient','PROFILE_UPDATED','demo profile','success',`Profile fields updated: ${changed.join(', ')}`);}
    return response(copy(this.state.profile));
  }
  async getDashboardData() {
    await sleep();
    const active=this.state.grants.filter(g=>grantStatus(g)==='active');
    return response({totalRecords:this.state.records.length,providers:this.state.providers.length,activeConsents:active.length,conflicts:conflictsFor(this.state).length,expiringShares:active.filter(g=>new Date(g.expiresAt)-Date.now()<48*3600000).length,recentEvents:copy(this.state.audit).slice(-6).reverse(),records:copy(this.state.records).sort((a,b)=>b.eventDate.localeCompare(a.eventDate)).slice(0,5),providersList:copy(this.state.providers),notices:copy(this.state.notifications),stale:this.state.demoState.stale});
  }
  async getHealthRecords(filters) { await sleep(); return response(recordsFor(this.state,filters).map(copy)); }
  async getRecordById(id) { await sleep(); const record=findRecord(this.state,id); return record ? response(copy(record)) : fail('NOT_FOUND','Synthetic record was not found.'); }
  async createHealthRecord(payload) {
    await sleep();
    if(!payload?.title || !payload?.category || !payload?.provider || !payload?.eventDate) { makeAuditEvent(this.state,'Fictional patient','RECORD_CREATE','new synthetic record','blocked','Required fields were missing'); return fail('VALIDATION','Title, category, provider, and event date are required.'); }
    const record={id:`HV-NEW-${randomUUID().slice(0,8).toUpperCase()}`,title:String(payload.title).trim(),type:payload.type||payload.category.replace(/s$/,''),category:payload.category,provider:String(payload.provider).trim(),location:payload.location||'Not supplied',eventDate:payload.eventDate,reportDate:payload.reportDate||payload.eventDate,uploadDate:now().slice(0,10),source:payload.source||'Patient-entered demo record',provenance:'Added in synthetic demo',verification:'Patient supplied',values:payload.values||'No source values supplied',conflicts:[],sharing:'Not shared',version:1,history:[]};
    this.state.records.unshift(record); makeAuditEvent(this.state,'Fictional patient','RECORD_CREATED',record.id,'success','Synthetic record added'); return response(copy(record));
  }
  async updateRecordMetadata(id,payload) {
    await sleep(); const record=findRecord(this.state,id); if(!record)return fail('NOT_FOUND','Synthetic record was not found.');
    if(payload.expectedVersion !== undefined && payload.expectedVersion !== record.version) { this.state.demoState.conflictingUpdate={recordId:id,expectedVersion:payload.expectedVersion,currentVersion:record.version,attempted:copy(payload)}; makeAuditEvent(this.state,'Fictional patient','RECORD_UPDATE',id,'conflict','Record changed since this edit began'); return fail('CONFLICT','This record changed while you were editing. Review both versions before saving.',this.state.demoState.conflictingUpdate); }
    const allowed=['title','provider','location','eventDate','reportDate','uploadDate','source'];
    const changes=Object.fromEntries(allowed.filter(k=>payload[k]!==undefined).map(k=>[k,{before:record[k],after:payload[k]}]));
    if(!Object.keys(changes).length)return fail('VALIDATION','No editable fields were supplied.');
    record.history.push({kind:'metadata assertion',author:'Fictional patient',timestamp:now(),reason:String(payload.reason||'Metadata reviewed'),changes});
    for(const key of allowed) if(payload[key]!==undefined) record[key]=String(payload[key]);
    record.version++; makeAuditEvent(this.state,'Fictional patient','METADATA_CORRECTED',id,'success',String(payload.reason||'Metadata assertion added')); return response(copy(record));
  }
  async createCorrection(id,payload) {
    await sleep(); const original=findRecord(this.state,id); if(!original)return fail('NOT_FOUND','Synthetic record was not found.');
    if(!payload?.reason || !payload?.field || payload.value===undefined)return fail('VALIDATION','Choose a field, provide the corrected value, and explain the source for review.');
    const correction={...copy(original),id:`HV-COR-${randomUUID().slice(0,8).toUpperCase()}`,title:`${original.title} · corrected assertion`,eventDate:original.eventDate,reportDate:original.reportDate,uploadDate:now().slice(0,10),version:1,history:[],supersedes:original.id,correction:{field:payload.field,value:String(payload.value),author:'Fictional patient',timestamp:now(),reason:String(payload.reason)},verification:'Correction assertion · human reviewed',sharing:'Not shared'};
    if(['eventDate','reportDate','provider','location','title','source'].includes(payload.field)) correction[payload.field]=String(payload.value);
    original.supersededBy=correction.id; original.verification='Superseded · original preserved'; original.version++;
    this.state.records.unshift(correction);
    const affected=this.state.grants.filter(g=>grantStatus(g)==='active'&&(g.recordIds.includes(id)||g.categories.includes(original.category))).map(g=>({grantId:g.id,recipient:g.recipient,status:'correction notice required'}));
    makeAuditEvent(this.state,'Fictional patient','CORRECTION_CREATED',correction.id,'success',`Assertion linked to ${id}; ${affected.length} active share(s) identified`);
    return response({original:copy(original),correction:copy(correction),affectedShares:affected,recipientNotice:'Simulated correction notice is available in the recipient view. No external provider was contacted.'});
  }
  async detectRecordConflicts(){await sleep();return response(conflictsFor(this.state));}
  async getHealthTimeline(filters={}){await sleep();let records=recordsFor(this.state,filters);return response(records.map(r=>({record:copy(r),dates:[{kind:'Event occurred',date:r.eventDate},{kind:'Report issued',date:r.reportDate},{kind:'Uploaded',date:r.uploadDate}]})).sort((a,b)=>b.record.eventDate.localeCompare(a.record.eventDate)));}
  async createConsentGrant(payload){
    await sleep(); const days=Number(payload?.expirationDays);
    if(!payload?.recipient||!payload?.purpose||!Array.isArray(payload.recordIds)||!Array.isArray(payload.categories)||(!payload.recordIds.length&&!payload.categories.length)||!Number.isFinite(days)||days<=0||days>365){makeAuditEvent(this.state,'Fictional patient','CONSENT_CREATE','new share','blocked','Invalid consent payload');return fail('VALIDATION','Select a recipient, scope, purpose, and an expiry from 1 to 365 days.');}
    const unknown=payload.recordIds.filter(id=>!findRecord(this.state,id)); if(unknown.length)return fail('VALIDATION','One or more selected records are not available.');
    const grant={id:`SH-${randomUUID().slice(0,8).toUpperCase()}`,recipient:String(payload.recipient),recipientType:payload.recipientType||'Specialist',recordIds:[...new Set(payload.recordIds)],categories:[...new Set(payload.categories)],purpose:String(payload.purpose),createdAt:now(),expiresAt:daysFromNow(days),status:'active',simulated:true};
    this.state.grants.push(grant); makeAuditEvent(this.state,'Fictional patient','CONSENT_CREATED',grant.id,'success',`${grant.recordIds.length} record(s), ${grant.categories.length} category scope(s), ${days}-day expiry`); return response(copy(grant));
  }
  async revokeConsentGrant(id){await sleep();const g=this.state.grants.find(x=>x.id===id);if(!g)return fail('NOT_FOUND','Share was not found.');if(grantStatus(g)!=='active')return fail('INVALID_STATE',`This share is ${grantStatus(g)}.`);g.status='revoked';g.revokedAt=now();makeAuditEvent(this.state,'Fictional patient','CONSENT_REVOKED',id,'success','Subsequent simulated access is blocked; downloaded copies cannot be recalled.');return response(copy(g));}
  async getRecipientVisibleRecords(id){await sleep();const g=this.state.grants.find(x=>x.id===id);if(!g)return fail('NOT_FOUND','Share was not found.');const status=grantStatus(g);if(status!=='active'){if(g.status==='active')g.status='expired';makeAuditEvent(this.state,g.recipient,'RECIPIENT_READ',id,'blocked',`Share ${status}`);return fail('ACCESS_DENIED',`Recipient access is ${status}. No records were returned.`);}const records=visibleThroughGrant(this.state,g);makeAuditEvent(this.state,g.recipient,'RECIPIENT_READ',id,'success',`${records.length} record(s) returned within selected scope`);const notices=records.flatMap(r=>this.state.records.filter(c=>c.supersedes===r.id).map(c=>({original:r.id,correction:c.id,notice:c.correction?.reason||'Correction assertion added'})));return response({grant:copy(g),records:records.map(copy),correctionNotices:notices,purpose:g.purpose});}
  async createCaregiverGrant(payload){await sleep();if(!payload?.caregiverId||!Array.isArray(payload.actions)||!payload.actions.length||!Number(payload.durationDays)||Number(payload.durationDays)>365)return fail('VALIDATION','Choose a caregiver, one or more actions, and a duration up to 365 days.');const caregiver=this.state.caregivers.find(c=>c.id===payload.caregiverId);if(!caregiver)return fail('NOT_FOUND','Caregiver was not found.');const grant={id:`CGG-${randomUUID().slice(0,8).toUpperCase()}`,caregiverId:caregiver.id,actions:[...new Set(payload.actions)],categories:[...new Set(payload.categories||[])],expiresAt:daysFromNow(Number(payload.durationDays)),status:'active'};caregiver.permissions.push(grant);caregiver.status='Scoped access';makeAuditEvent(this.state,'Fictional patient','CAREGIVER_GRANT_CREATED',grant.id,'success',grant.actions.join(', '));return response(copy(grant));}
  async updateCaregiverGrant(id,payload){await sleep();const c=this.state.caregivers.find(x=>x.permissions.some(p=>p.id===id));if(!c)return fail('NOT_FOUND','Caregiver grant was not found.');const g=c.permissions.find(p=>p.id===id);if(payload.revoke){g.status='revoked';g.revokedAt=now();}else {if(payload.actions)g.actions=[...new Set(payload.actions)];if(payload.categories)g.categories=[...new Set(payload.categories)];if(payload.durationDays)g.expiresAt=daysFromNow(Number(payload.durationDays));}c.status=c.permissions.some(p=>p.status==='active')?'Scoped access':'No access';makeAuditEvent(this.state,'Fictional patient',payload.revoke?'CAREGIVER_GRANT_REVOKED':'CAREGIVER_GRANT_UPDATED',id,'success',payload.revoke?'Access revoked':'Permission scope changed');return response(copy(g));}
  async simulateCaregiverAction(payload){await sleep();const c=this.state.caregivers.find(x=>x.id===payload.caregiverId);const grant=c?.permissions.find(p=>p.id===payload.grantId);const recordAction=['view_selected_records','prepare_visit_summary'].includes(payload.action);const categoryAllowed=!recordAction||(!!payload.category&&grant?.categories.includes(payload.category));const allowed=grant&&grant.status==='active'&&new Date(grant.expiresAt)>new Date()&&grant.actions.includes(payload.action)&&categoryAllowed;makeAuditEvent(this.state,c?.name||'Unknown caregiver',payload.action||'CAREGIVER_ACTION',payload.resource||'synthetic resource',allowed?'success':'blocked',allowed?'Within scoped action and category grant':'Action or record category is outside the active permission scope');return allowed?response({allowed:true,message:'Action allowed by the selected scoped permission.'}):fail('ACCESS_DENIED','This action is outside the caregiver’s active permission scope. It was blocked and logged.');}
  async simulateEmergencyAccess(payload){await sleep();const authorized=['Dr. Leela Nair · Cityline Hospital (fictional)','Dr. Arjun Das · Cityline Hospital (fictional)'].includes(payload?.actor);if(!authorized)return this.#emergencyDeny(payload?.actor||'Unknown identity','Actor is not on the fictional authorized-user list.');if(!payload?.justification||String(payload.justification).trim().length<18)return this.#emergencyDeny(payload.actor,'A specific emergency justification is required.');if(payload.confirmed!==true)return this.#emergencyDeny(payload.actor,'Explicit confirmation was not provided.');const grant={id:`BG-${randomUUID().slice(0,8).toUpperCase()}`,actor:payload.actor,justification:String(payload.justification),createdAt:now(),expiresAt:new Date(Date.now()+60*60000).toISOString(),status:'active',scope:['Emergency summary','Current allergies field (synthetic)','Selected recent records'],simulated:true};this.state.emergencyGrant=grant;makeAuditEvent(this.state,payload.actor,'BREAK_GLASS_GRANTED',grant.id,'success',`Simulated 60-minute emergency grant · ${grant.justification}`);this.state.notifications.unshift({id:`N-${randomUUID().slice(0,6)}`,title:'Simulated emergency access used',body:`${payload.actor} used a time-limited demo grant. This is not a real hospital event.`,time:now(),kind:'emergency'});return response(copy(grant));}
  #emergencyDeny(actor,reason){makeAuditEvent(this.state,actor,'BREAK_GLASS_ATTEMPT','emergency access','blocked',reason);return fail('ACCESS_DENIED',reason);}
  async revokeEmergencyAccess(id){await sleep();const g=this.state.emergencyGrant;if(!g||g.id!==id)return fail('NOT_FOUND','Emergency grant was not found.');g.status='revoked';g.revokedAt=now();makeAuditEvent(this.state,g.actor,'BREAK_GLASS_REVOKED',id,'success','Patient demo control revoked access');return response(copy(g));}
  async getAuditEvents(filters={}){await sleep();let list=this.state.audit;if(filters.search){let q=String(filters.search).toLowerCase();list=list.filter(e=>`${e.id} ${e.actor} ${e.action} ${e.resource} ${e.outcome} ${e.reason}`.toLowerCase().includes(q));}return response({events:copy([...list].reverse()),integrity:verifyAudit(this.state.audit)});}
  async simulateProviderCorrection(recordId,payload){return this.createCorrection(recordId,{field:payload.field||'eventDate',value:payload.value,reason:payload.reason||'Fictional provider correction source supplied for review'});}
  async getNotifications(){await sleep();return response(copy(this.state.notifications));}
  async runDemoScenario(id){
    await sleep(25);
    if(id==='reset') {this.state=createState();return response({id,result:'Demo reset to seeded synthetic data.',state:await this.#scenarioSnapshot()});}
    if(id==='patient-onboarding'){this.state.scenarios.onboarding=(this.state.scenarios.onboarding||0)+1;makeAuditEvent(this.state,'Fictional patient','SCENARIO_ONBOARDING','synthetic profile','success','Patient onboarding scenario opened');return response({id,result:'Onboarding opened the fictional profile and record library.'});}
    if(id==='conflicting-labs'){this.state.scenarios['lab-reviewed']=true;const a=findRecord(this.state,'HV-LAB-1042');if(a)a.history.push({kind:'human review',author:'Fictional patient',timestamp:now(),reason:'Compared the source dates; retained both records pending provider verification.'});makeAuditEvent(this.state,'Fictional patient','CONFLICT_REVIEWED','HV-LAB-1042 + HV-LAB-1098','success','Both records retained; date correctness remains unresolved');return response({id,result:'Both reports were reviewed and retained. The date remains unresolved until a source is verified.'});}
    if(id==='uncertain-ocr'){const r=this.state.records.find(x=>x.ocr);if(r){r.ocr.reviewRequested=true;r.history.push({kind:'review request',author:'Fictional patient',timestamp:now(),reason:'Asked a human to inspect the original scan. Text remains unverified.'});}makeAuditEvent(this.state,'Fictional patient','OCR_REVIEW_REQUESTED','HV-RX-2071','success','Uncertain field stays unconfirmed');return response({id,result:'Human verification was requested. “5? mg” remains uncertain and is not presented as an instruction.'});}
    if(id==='seven-day-share'){const res=await this.createConsentGrant({recipient:'Dr. Asha Menon · Endocrinology (fictional)',recipientType:'Specialist',recordIds:['HV-LAB-1042'],categories:[],purpose:'Specialist consultation preparation',expirationDays:7});return res.success?response({id,result:'A new seven-day scoped specialist share is active. Inspect recipient access, then revoke it from the share card.',grant:res.data}):res;}
    if(id==='caregiver-boundary'){const c=this.state.caregivers[0];const grant=c.permissions.find(p=>p.status==='active');const result=await this.simulateCaregiverAction({caregiverId:c.id,grantId:grant?.id,action:'view_selected_records',category:'Consultation notes',resource:'HV-CNS-3304'});return response({id,result:result.success?'The permitted sample action succeeded.':'The out-of-scope consultation note was blocked and added to the audit trail.',blocked:!result.success});}
    if(id==='emergency-break-glass'){const denied=await this.simulateEmergencyAccess({actor:'Unlisted clinician · fictional',justification:'Emergency scenario attempt by an unlisted user.',confirmed:true});const allowed=await this.simulateEmergencyAccess({actor:'Dr. Leela Nair · Cityline Hospital (fictional)',justification:'Patient is unable to respond; limited emergency summary requested for immediate triage.',confirmed:true});return response({id,result:'Unlisted user blocked; authorized fictional hospital user received a 60-minute scoped demo grant.',denied:!denied.success,grant:allowed.data});}
    if(id==='provider-correction'){const result=await this.simulateProviderCorrection('HV-LAB-1042',{field:'eventDate',value:'2026-04-12',reason:'Fictional provider confirmed the date on the retained original report.'});return result.success?response({id,result:`A separate correction assertion was created. Original ${result.data.original.id} is preserved; active affected shares: ${result.data.affectedShares.length}.`,correction:result.data.correction,affectedShares:result.data.affectedShares}):result;}
    if(id==='service-outage'){this.state.demoState.outage=true;makeAuditEvent(this.state,'Mock API','API_TIMEOUT','scenario service','failed','Simulated 2.5-second service timeout; stored demo data retained');return fail('TIMEOUT','Simulated service timeout. Your saved demo data is still available. Use Retry to restore the mock API.',{retryable:true});}
    if(id==='stale-data'){this.state.demoState.stale=true;this.state.freshness.lastRefreshed=new Date(Date.now()-3*3600000).toISOString();makeAuditEvent(this.state,'Mock API','STALE_DATA_DETECTED','synthetic source','warning','Source freshness is outside the demo window');return response({id,result:'Freshness warning shown for a three-hour-old synthetic snapshot.',freshness:this.state.freshness});}
    if(id==='conflicting-update'){const record=findRecord(this.state,'HV-IMG-4185');this.state.demoState.conflictingUpdate={recordId:record.id,expectedVersion:record.version-1,currentVersion:record.version,attempted:{title:'Conflicting user edit'}};makeAuditEvent(this.state,'Fictional patient','RECORD_UPDATE',record.id,'conflict','Two edits used different record versions; explicit review required');return response({id,result:'Two edits are pending review. The current source record has not been overwritten.',conflict:copy(this.state.demoState.conflictingUpdate)});}
    return fail('NOT_FOUND','Demo scenario was not found.');
  }
  async refreshDemoData(){await sleep(120);this.state.demoState.stale=false;this.state.demoState.outage=false;this.state.freshness.lastRefreshed=now();makeAuditEvent(this.state,'Fictional patient','DEMO_REFRESHED','synthetic local source','success','Demo snapshot refreshed');return response({freshness:copy(this.state.freshness),message:'Synthetic demo data refreshed.'});}
  async testScenarioAction(action,payload={}){
    if(action==='mark-date-reviewed'){this.state.scenarios['lab-reviewed']=true;makeAuditEvent(this.state,'Fictional patient','CONFLICT_REVIEWED','HV-LAB-1042 + HV-LAB-1098','success','Both retained pending human verification');return response({reviewed:true});}
    if(action==='link-records'){const [a,b]=payload.recordIds||[];const ra=findRecord(this.state,a),rb=findRecord(this.state,b);if(!ra||!rb)return fail('NOT_FOUND','Both records are required.');ra.possibleDuplicateOf=rb.id;rb.possibleDuplicateOf=ra.id;makeAuditEvent(this.state,'Fictional patient','POSSIBLE_DUPLICATE_LINKED',`${a} + ${b}`,'success','Records linked without merging');return response({linked:true,records:[a,b]});}
    if(action==='verify-ocr'){const r=this.state.records.find(x=>x.ocr);if(!r)return fail('NOT_FOUND','OCR sample not found.');r.ocr.reviewRequested=true;makeAuditEvent(this.state,'Fictional patient','OCR_HUMAN_REVIEW_REQUESTED',r.id,'success','Source still marked uncertain; no dosage confirmed');return response({message:'Human review requested. The uncertain text remains unconfirmed.'});}
    if(action==='flag-record-conflict'){const record=findRecord(this.state,payload.recordId);if(!record)return fail('NOT_FOUND','Synthetic record was not found.');const reason=String(payload.reason||'Patient requested a human source review');record.conflicts=[...new Set([...(record.conflicts||[]),'Patient requested human review'])];record.history.push({kind:'conflict flag',author:'Fictional patient',timestamp:now(),reason});makeAuditEvent(this.state,'Fictional patient','RECORD_FLAGGED_FOR_REVIEW',record.id,'success',reason);return response(copy(record));}
    if(action==='attempt-expired-share'){const g={id:'SH-EXPIRED-DEMO',recipient:'Fictional specialist',recordIds:['HV-LAB-1042'],categories:[],purpose:'Demo test',createdAt:now(),expiresAt:new Date(Date.now()-60000).toISOString(),status:'active',simulated:true};this.state.grants.push(g);return this.getRecipientVisibleRecords(g.id);}
    if(action==='tamper-audit-test'){const altered=copy(this.state.audit);if(altered.length)altered[0].reason+=' tampered';return response(verifyAudit(altered));}
    if(action==='force-timeout'){this.state.demoState.outage=true;makeAuditEvent(this.state,'Mock API','API_TIMEOUT','test runner','failed','Expected simulated timeout');return fail('TIMEOUT','Simulated service timeout.',{retryable:true});}
    if(action==='caregiver-block-test'){const res=await this.simulateCaregiverAction({caregiverId:'CG-01',action:'view_all_records',resource:'all synthetic records'});return res;}
    if(action==='emergency-deny-test'){return this.simulateEmergencyAccess({actor:'Unauthorized test actor',justification:'Attempted access without an approved fictional identity.',confirmed:true});}
    if(action==='reset'){this.state=createState();return response({reset:true});}
    return fail('NOT_FOUND','Test action not found.');
  }
  async #scenarioSnapshot(){return {records:this.state.records.length,grants:this.state.grants.length,audit:this.state.audit.length};}
  getStateForTests(){return this.state;}
}
