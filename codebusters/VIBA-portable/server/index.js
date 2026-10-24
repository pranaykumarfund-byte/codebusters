import http from 'node:http';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { HealthverseService } from './domain.js';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const publicRoot=path.join(root,'public');
export const service=new HealthverseService();
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml'};

async function bodyJson(req){let body='';for await(const chunk of req)body+=chunk;if(!body)return {};try{const parsed=JSON.parse(body);return parsed&&typeof parsed==='object'&&!Array.isArray(parsed)?parsed:{};}catch{return {};}}
function send(res,status,payload,headers={}){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers});res.end(JSON.stringify(payload));}
function statusFor(result){if(result.success)return 200;return ({VALIDATION:400,NOT_FOUND:404,ACCESS_DENIED:403,INVALID_STATE:409,CONFLICT:409,TIMEOUT:504})[result.error?.code]||500;}
async function api(req,res,url){
  const method=req.method||'GET',p=url.pathname,parts=p.split('/').filter(Boolean).map(decodeURIComponent);
  let result;
  if(method==='GET'&&p==='/api/bootstrap')result=await service.getBootstrap();
  else if(method==='PATCH'&&p==='/api/profile')result=await service.updateProfile(await bodyJson(req));
  else if(method==='GET'&&p==='/api/dashboard')result=await service.getDashboardData();
  else if(method==='GET'&&p==='/api/records')result=await service.getHealthRecords(Object.fromEntries(url.searchParams));
  else if(method==='POST'&&p==='/api/records')result=await service.createHealthRecord(await bodyJson(req));
  else if(parts[0]==='api'&&parts[1]==='records'&&parts.length===3&&method==='GET')result=await service.getRecordById(parts[2]);
  else if(parts[0]==='api'&&parts[1]==='records'&&parts.length===3&&method==='PATCH')result=await service.updateRecordMetadata(parts[2],await bodyJson(req));
  else if(parts[0]==='api'&&parts[1]==='records'&&parts[3]==='corrections'&&method==='POST')result=await service.createCorrection(parts[2],await bodyJson(req));
  else if(method==='GET'&&p==='/api/conflicts')result=await service.detectRecordConflicts();
  else if(method==='GET'&&p==='/api/timeline')result=await service.getHealthTimeline(Object.fromEntries(url.searchParams));
  else if(method==='GET'&&p==='/api/grants')result={success:true,data:service.getStateForTests().grants.map(g=>({...g,status:g.status==='active'&&new Date(g.expiresAt)<=new Date()?'expired':g.status})),timestamp:new Date().toISOString(),synthetic:true};
  else if(method==='POST'&&p==='/api/grants')result=await service.createConsentGrant(await bodyJson(req));
  else if(parts[0]==='api'&&parts[1]==='grants'&&parts.length===3&&method==='DELETE')result=await service.revokeConsentGrant(parts[2]);
  else if(parts[0]==='api'&&parts[1]==='recipient'&&parts[3]==='records'&&method==='GET')result=await service.getRecipientVisibleRecords(parts[2]);
  else if(method==='POST'&&p==='/api/caregivers/grants')result=await service.createCaregiverGrant(await bodyJson(req));
  else if(parts[0]==='api'&&parts[1]==='caregivers'&&parts[2]==='grants'&&method==='PATCH')result=await service.updateCaregiverGrant(parts[3],await bodyJson(req));
  else if(method==='POST'&&p==='/api/caregivers/attempt')result=await service.simulateCaregiverAction(await bodyJson(req));
  else if(method==='POST'&&p==='/api/emergency/access')result=await service.simulateEmergencyAccess(await bodyJson(req));
  else if(method==='DELETE'&&parts[0]==='api'&&parts[1]==='emergency'&&parts[2])result=await service.revokeEmergencyAccess(parts[2]);
  else if(method==='GET'&&p==='/api/audit')result=await service.getAuditEvents(Object.fromEntries(url.searchParams));
  else if(method==='GET'&&p==='/api/notifications')result=await service.getNotifications();
  else if(method==='POST'&&p==='/api/provider-correction'){const data=await bodyJson(req);result=await service.simulateProviderCorrection(data.recordId,data);}
  else if(method==='POST'&&p==='/api/scenarios/run'){const data=await bodyJson(req);result=await service.runDemoScenario(data.id);}
  else if(method==='POST'&&p==='/api/scenarios/refresh')result=await service.refreshDemoData();
  else if(method==='POST'&&p==='/api/scenarios/action'){const data=await bodyJson(req);result=await service.testScenarioAction(data.action,data.payload);}
  else if(method==='POST'&&p==='/api/demo-tests'){
    const {runAcceptanceTests}=await import('./demo-tests.js');
    result={success:true,data:await runAcceptanceTests(),timestamp:new Date().toISOString(),synthetic:true};
  }
  else {send(res,404,{success:false,data:null,error:{code:'NOT_FOUND',message:'API route not found.'},timestamp:new Date().toISOString(),synthetic:true});return;}
  send(res,statusFor(result),result);
}

const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`);
    if(url.pathname.startsWith('/api/'))return await api(req,res,url);
    const requested=url.pathname==='/'?'index.html':decodeURIComponent(url.pathname.slice(1));
    const file=path.resolve(publicRoot,requested);
    if(!file.startsWith(publicRoot+path.sep)&&file!==publicRoot){res.writeHead(403);res.end('Forbidden');return;}
    const data=await readFile(file);
    res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(data);
  }catch(error){if(error.code==='ENOENT'){res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Not found');return;}console.error('Healthverse request error:',error.message);if(!res.headersSent)send(res,500,{success:false,data:null,error:{code:'INTERNAL',message:'The local demo service encountered an error.'},timestamp:new Date().toISOString(),synthetic:true});}
});

const port=Number(process.env.PORT||process.argv[2]||4173);
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))server.listen(port,'127.0.0.1',()=>console.log(`VIBA demo ready at http://127.0.0.1:${port}`));

export {server};
