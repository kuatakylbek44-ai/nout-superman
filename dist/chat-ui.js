import { createSuperman, SUPERMAN_MODEL } from './superman-engine.js?v=dashboard-20261127';
import { tr, localized, getLanguage, translateDOM } from './i18n.js?v=dashboard-20261127';

export function initChat({getCatalog,getFilters,onLaptop}) {
 const dialog=document.querySelector('#chat-dialog');
 const messages=document.querySelector('#chat-messages');
 const setup=document.querySelector('#chat-setup');
 const progress=document.querySelector('#chat-progress');
 const input=document.querySelector('#chat-input');
 const send=document.querySelector('#chat-send');
 const status=document.querySelector('#chat-status');
 const stop=document.querySelector('#chat-stop');
 const start=dialog.querySelector('[data-action="chat-start"]');
 let history=[],busy=false,ready=false,loading=false;
 input.maxLength=1200;
 const engine=createSuperman({getCatalog,getFilters,getLocale:getLanguage,onProgress:report=>{
   loading=report.status==='loading';ready=['ready','generating'].includes(report.status);busy=report.status==='generating';
   start.disabled=loading;start.hidden=ready;setup.hidden=ready;input.disabled=!ready||busy;send.disabled=!ready||busy;stop.hidden=!loading&&!busy;
   status.textContent=tr(busy?'Ойланып жатыр…':loading?'AI жүктелуде…':ready?'Дайын':'AI қосылмаған');
   if(loading){progress.textContent=`${Math.round(report.progress*100)}% · ${localized('Модель дайындалып жатыр','Подготовка модели','Preparing model')}`;progress.setAttribute('aria-busy','true');}
   else progress.removeAttribute('aria-busy');
 }});
 function suggestions(){document.querySelector('#chat-prompts').replaceChildren();for(const text of ['Оқуға жеңіл ноутбук керек','RTX видеокартасы не үшін керек?','16 ГБ пен 32 ГБ RAM айырмасы қандай?']){const button=document.createElement('button');button.type='button';button.textContent=tr(text);button.addEventListener('click',()=>{input.value=tr(text);if(ready)input.focus();else progress.textContent=localized('Алдымен «AI-ды іске қосу» батырмасын бас.','Сначала нажми «Включить AI».','Click “Start AI” first.');});document.querySelector('#chat-prompts').append(button);}}
 function welcome(){messages.replaceChildren();append('assistant',localized('Сәлем! Мен Superman-мын. Мақсатыңды, бюджетіңді және маңызды сипаттамаларды айт. Бірге лайықты нұсқаларды қараймыз.','Привет! Я Superman. Расскажи о задачах, бюджете и важных характеристиках — посмотрим подходящие варианты.','Hi, I’m Superman. Tell me your goals, budget and the specs that matter. Let’s explore suitable laptops together.'),[],true);}
 function append(role,text,recommendations=[],isIntro=false){
   const message=document.createElement('div');message.className=`chat-message ${role}${isIntro?' intro':''}`;
   const label=document.createElement('strong');label.className='chat-speaker';label.textContent=role==='assistant'?'Superman':localized('Сен','Ты','You');message.append(label);
   const body=document.createElement('p');body.textContent=text;message.append(body);
   if(recommendations.length){const list=document.createElement('div');list.className='chat-recommendations';const catalog=getCatalog()?.laptops||[];for(const item of recommendations){const laptop=catalog.find(l=>l.id===item.id);if(!laptop)continue;const card=document.createElement('button');card.type='button';card.className='chat-laptop';const image=document.createElement('img');image.src=laptop.image||'assets/photo-unavailable.svg';image.alt=laptop.name;const block=document.createElement('span');const title=document.createElement('strong');title.textContent=`${laptop.brand} ${laptop.name}`;const note=document.createElement('small');note.textContent=item.reason;block.append(title,note);card.append(image,block);card.addEventListener('click',()=>onLaptop(laptop.id));list.append(card);}message.append(list);}
   messages.append(message);message.scrollIntoView({block:'nearest',behavior:'smooth'});
 }
 async function load(){if(loading||ready)return;progress.textContent=tr('AI жүктелуде…');try{await engine.loadModel();input.focus();}catch(error){progress.textContent=error.message||tr('AI іске қосылмады. WebGPU бар Chrome немесе Edge браузерін қолданып көр.');start.disabled=false;start.hidden=false;setup.hidden=false;}}
 async function submit(event){event.preventDefault();if(!ready||busy)return;const text=input.value.trim();if(!text)return;append('user',text);input.value='';const previous=[...history];history.push({role:'user',content:text});try{const result=await engine.reply(text,previous);append('assistant',result.reply,result.recommendations);history.push({role:'assistant',content:result.reply});history=history.slice(-12);}catch(error){append('assistant',error.message||tr('AI іске қосылмады. WebGPU бар Chrome немесе Edge браузерін қолданып көр.'));}finally{if(ready)input.focus();}}
 document.addEventListener('click',async event=>{const action=event.target.closest('[data-action]')?.dataset.action;if(action==='chat'){translateDOM(dialog);if(!dialog.open)dialog.showModal();if(ready)input.focus();}if(action==='chat-start')await load();if(action==='chat-stop'){engine.interrupt();loading=false;busy=false;progress.textContent=localized('Тоқтатылды. Қайта іске қосуға болады.','Остановлено. Можно запустить снова.','Stopped. You can start again.');}if(action==='chat-reset'){await engine.reset();history=[];welcome();suggestions();}});
 document.querySelector('#chat-form').addEventListener('submit',submit);
 input.addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();document.querySelector('#chat-form').requestSubmit();}});
 document.addEventListener('nout:language',()=>{suggestions();if(!history.length)welcome();translateDOM(dialog);});
 const download=document.createElement('span');download.className='model-size';download.textContent=localized(`Алғашқы жүктеу ≈ ${SUPERMAN_MODEL.estimatedDownloadMB} МБ · GPU жады ≈ 1,4 ГБ`,`Первая загрузка ≈ ${SUPERMAN_MODEL.estimatedDownloadMB} МБ · GPU-память ≈ 1,4 ГБ`,`First download ≈ ${SUPERMAN_MODEL.estimatedDownloadMB} MB · GPU memory ≈ 1.4 GB`);setup.insertBefore(download,start);
 document.addEventListener('nout:language',()=>{download.textContent=localized(`Алғашқы жүктеу ≈ ${SUPERMAN_MODEL.estimatedDownloadMB} МБ · GPU жады ≈ 1,4 ГБ`,`Первая загрузка ≈ ${SUPERMAN_MODEL.estimatedDownloadMB} МБ · GPU-память ≈ 1,4 ГБ`,`First download ≈ ${SUPERMAN_MODEL.estimatedDownloadMB} MB · GPU memory ≈ 1.4 GB`);});
 suggestions();welcome();
}
