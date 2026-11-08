(() => {
 'use strict';
 const key='bishin_trial_20261125_deadline_v1';
 const duration=24*60*60*1000;
 const now=Date.now();
 let deadline;
 try{
  const saved=localStorage.getItem(key);
  deadline=saved===null?NaN:Number(saved);
  if(!Number.isFinite(deadline)||deadline<=0){deadline=now+duration;localStorage.setItem(key,String(deadline));}
 }catch{deadline=now+duration;}
 const sections=[...document.querySelectorAll('[data-countdown]')];
 sections.forEach(el=>{el.dataset.deadline=String(deadline)});
 let interval;
 const update=()=>{
  const seconds=Math.max(0,Math.ceil((deadline-Date.now())/1000));
  const h=String(Math.floor(seconds/3600)).padStart(2,'0');
  const m=String(Math.floor(seconds/60)%60).padStart(2,'0');
  const s=String(seconds%60).padStart(2,'0');
  sections.forEach(el=>{
   el.querySelector('[data-hours]').textContent=h;
   el.querySelector('[data-minutes]').textContent=m;
   el.querySelector('[data-seconds]').textContent=s;
   el.querySelector('[role="timer"]').setAttribute('aria-label',`残り${h}時間${m}分${s}秒`);
   el.querySelector('.countdown-expired').hidden=seconds>0;
   el.querySelector('.countdown-note').hidden=seconds===0;
  });
  if(seconds===0){
   document.querySelectorAll('[data-apply]').forEach(a=>{a.removeAttribute('href');a.removeAttribute('target');a.setAttribute('aria-disabled','true');a.querySelector('span:first-child').textContent='お申し込み受付終了';});
   document.querySelectorAll('.cta-note').forEach(el=>{el.hidden=true;});
   if(interval)clearInterval(interval);
  }
 };
 update();
 if(deadline>Date.now())interval=setInterval(update,1000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)update()});
 window.addEventListener('storage',event=>{if(event.key===key&&Number(event.newValue)>0){deadline=Number(event.newValue);sections.forEach(el=>{el.dataset.deadline=String(deadline)});update();}});
})();
