import test from 'node:test';
import assert from 'node:assert/strict';
import { createSuperman, selectLocalCandidates, validateLocalAnswer, SUPERMAN_MODEL } from '../dist/superman-engine.js';

const rows=[
  {id:'study',brand:'Example',name:'Study 14',cpu:'Intel Core 5',gpu:'Intel Graphics',gpuType:'integrated',ram:16,storage:512,weight:1.4,price:400000,purposes:['student','developer','budget'],os:'Windows'},
  {id:'game',brand:'Example',name:'Game 16',cpu:'AMD Ryzen 9',gpu:'RTX 5070',gpuType:'discrete',ram:32,storage:1024,weight:2.3,price:900000,purposes:['gaming','developer'],os:'Windows'},
  {id:'unknown',brand:'Example',name:'Unknown',ram:16,storage:512,weight:null,price:null,purposes:['student']},
];
const gpu={requestAdapter:async()=>({features:new Set(['shader-f16'])})};
const config={mode:'browser'};
function runtimeFor(fn){return{gpu,makeWorker:()=>({terminate(){}}),loadRuntime:async()=>({CreateWebWorkerMLCEngine:async(_worker,model,options)=>{assert.equal(model,SUPERMAN_MODEL.id);options.initProgressCallback({progress:0.5,text:'Loading'});return{chat:{completions:{create:fn}},interruptGenerate(){},resetChat:async()=>{},unload:async()=>{}};}})};}

test('browser AI never downloads or pretends to answer before explicit model start',async()=>{
  let imported=false;
  const ai=createSuperman({getCatalog:()=>rows,config,getLocale:()=> 'en'}, {gpu,loadRuntime:async()=>{imported=true;}});
  await assert.rejects(()=>ai.reply('Help me choose'),e=>e.code==='MODEL_NOT_LOADED');
  assert.equal(imported,false);assert.equal(ai.getState().status,'idle');
});

test('local engine loads once, emits progress, sets language and validates real model IDs',async()=>{
  let calls=0;const progress=[];
  const ai=createSuperman({getCatalog:()=>rows,getFilters:()=>({purpose:'student',maxPrice:500000}),getLocale:()=> 'ru',onProgress:p=>progress.push(p),config},runtimeFor(async request=>{
    calls++;assert.match(request.messages[0].content,/only in Russian/);assert.match(request.response_format.schema,/study/);assert.ok(!request.response_format.schema.includes('game'));
    assert.equal(request.extra_body.enable_thinking,false);
    return{choices:[{finish_reason:'stop',message:{content:JSON.stringify({reply:'Уточни приложения для учёбы.',ids:['study']})}}]};
  }));
  await ai.loadModel();await ai.loadModel();
  const result=await ai.reply('Нужен ноутбук для учёбы');
  assert.equal(result.provider,'on-device');assert.equal(result.locale,'ru');assert.equal(result.recommendations[0].id,'study');assert.match(result.recommendations[0].reason,/16 ГБ памяти/);
  assert.equal(calls,1);assert.ok(progress.some(p=>p.status==='loading'&&p.progress===0.5));assert.equal(ai.getState().status,'ready');
  await ai.unload();assert.equal(ai.getState().status,'idle');
});

test('browser without WebGPU reports a localized capability error',async()=>{
  const ai=createSuperman({getCatalog:()=>rows,getLocale:()=> 'kk',config},{gpu:{requestAdapter:async()=>null}});
  await assert.rejects(()=>ai.loadModel(),e=>e.code==='WEBGPU_UNAVAILABLE'&&e.message.includes('браузер'));
});

test('shortlist extracts KZT budgets and combines existing filters without inventing models',()=>{
  assert.deepEqual(selectLocalCandidates(rows,{purpose:'student'},'500 мың теңгеге ноутбук').candidates.map(x=>x.id),['study']);
  assert.deepEqual(selectLocalCandidates(rows,{purpose:'student',maxPrice:300000},'до 500 тыс тенге').candidates,[]);
  assert.deepEqual(selectLocalCandidates(rows,{},'gaming laptop 1 million KZT').candidates.map(x=>x.id),['game']);
});

test('unrestricted slider keeps archive prices unknown while explicit budgets exclude them',()=>{
  const unrestricted=selectLocalCandidates(rows,{maxPrice:2000000},'Help me choose');
  assert.equal(unrestricted.filters.maxPrice,0);
  assert.ok(unrestricted.candidates.some(l=>l.id==='unknown'));
  const explicit=selectLocalCandidates(rows,{maxPrice:2000000},'Up to 2 million KZT');
  assert.equal(explicit.filters.maxPrice,2000000);
  assert.ok(!explicit.candidates.some(l=>l.id==='unknown'));
});

test('rejects fabricated or duplicate model references and generated HTML',()=>{
  for(const value of [
    {reply:'Try this.',ids:['fake']},
    {reply:'Try this.',ids:['study','study']},
    {reply:'<a href="https://example.com">Buy</a>',ids:[]},
    {reply:'Try this.',ids:['study','game','unknown','study']},
  ]) assert.throws(()=>validateLocalAnswer(value,rows,'en'),e=>e.code==='INVALID_MODEL_RESPONSE');
});

test('remote mode sends no secret, accepts validated IDs and does not import browser model',async()=>{
  let requestBody;
  const ai=createSuperman({getCatalog:()=>rows,getLocale:()=> 'en',config:{mode:'remote',endpoint:'https://api.example/api/chat'}},{fetchImpl:async(_url,options)=>{requestBody=JSON.parse(options.body);assert.equal(options.headers.Authorization,undefined);return Response.json({reply:'Which apps do you use?',recommendations:[],provider:'model',locale:'en'});},loadRuntime:async()=>{throw new Error('Should not load browser runtime');}});
  await ai.loadModel();const result=await ai.reply('Help me choose');
  assert.equal(result.provider,'model');assert.equal(requestBody.message,'Help me choose');
});
