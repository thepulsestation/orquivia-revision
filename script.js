/* Progressive enhancement; no trackers or stored form data. */
(() => {
  'use strict';
  const english = document.documentElement.lang === 'en';
  const say = (es, en) => english ? en : es;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.querySelector('[data-header]');
  const menu = document.querySelector('#mobile-menu');
  const toggle = document.querySelector('.menu-toggle');
  const closeMenu = () => { if (menu?.open) menu.close(); };
  toggle?.addEventListener('click', () => {
    menu.showModal(); toggle.setAttribute('aria-expanded', 'true');
    menu.querySelector('.menu-close')?.focus();
  });
  menu?.querySelector('.menu-close')?.addEventListener('click', closeMenu);
  menu?.addEventListener('close', () => { toggle.setAttribute('aria-expanded', 'false'); toggle.focus({preventScroll:true}); });
  menu?.addEventListener('click', event => { if (event.target === menu) closeMenu(); });
  menu?.querySelectorAll('nav a').forEach(a => a.addEventListener('click', closeMenu));
  window.matchMedia('(min-width: 801px)').addEventListener('change', e => { if (e.matches) closeMenu(); });
  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    document.body.classList.add('motion-ready');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), {threshold:0.09, rootMargin:'0px 0px -20px 0px'});
    document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
  }
  const story = document.querySelector('.hero-story');
  const stage = document.querySelector('.hero-stage');
  const first = document.querySelector('.hero-first');
  const second = document.querySelector('.hero-second');
  const parallax = [...document.querySelectorAll('.image-statement')];
  // Keep words intact when wrapping, and reveal the hero letter by letter as
  // the reader scrolls. One accessible label avoids fragmented screen-reader text.
  const splitText = (element, letters=false) => {
    const label=element.innerHTML.replace(/<br\s*\/?\s*>/gi,' ').replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();
    const parts=element.innerHTML.split(/(<br\s*\/?\s*>)/gi);
    element.setAttribute('aria-label',label);
    element.replaceChildren();
    const units=[];
    parts.forEach(part=>{
      if (/^<br/i.test(part)) { element.append(document.createElement('br')); return; }
      part.split(/(\s+)/).filter(Boolean).forEach(word=>{
        if (/^\s+$/.test(word)) { element.append(document.createTextNode(' ')); return; }
        const span=document.createElement('span');span.className='motion-word';span.setAttribute('aria-hidden','true');
        if (letters) [...word].forEach(letter=>{const char=document.createElement('span');char.className='motion-letter';char.textContent=letter;span.append(char);units.push(char);});
        else {span.textContent=word;units.push(span);}
        element.append(span);
      });
    });
    return units;
  };
  const heroWords=document.querySelector('[data-hero-words]');
  const heroLetters=heroWords?splitText(heroWords,true):[];
  const textReveals=[...document.querySelectorAll('[data-scroll-words]')].map(element=>({element,units:splitText(element)}));
  const comparisonScene=document.querySelector('.comparison-scene');
  const comparison=document.querySelector('.comparison');
  const serviceCards=[...document.querySelectorAll('.service-card')];
  const methodSteps=[...document.querySelectorAll('.method-step')];
  const desktopMotion=window.matchMedia('(min-width: 801px)');
  const clamp = (n, min=0, max=1) => Math.max(min, Math.min(max, n));
  let requested = false;
  const paint = () => {
    requested = false;
    header?.classList.toggle('is-scrolled', window.scrollY > 35);
    if (reducedMotion.matches) return;
    if (story && stage) {
      const rect = story.getBoundingClientRect();
      const travel = Math.max(1, story.offsetHeight - stage.offsetHeight);
      const p = clamp(-rect.top / travel);
      const fade = clamp((p - .015) / .19);
      const arrival = clamp((p - .23) / .12);
      stage.style.setProperty('--first-opacity', (1-fade).toFixed(3));
      stage.style.setProperty('--first-y', `${-45*fade}px`);
      stage.style.setProperty('--second-opacity', arrival.toFixed(3));
      stage.style.setProperty('--second-y', '0px');
      stage.style.setProperty('--hero-scale', (1.02 + p*.075).toFixed(3));
      stage.style.setProperty('--hero-blur', `${clamp((p-.14)/.23)*10}px`);
      stage.style.setProperty('--shade', (.22+clamp(p/.36)*.23).toFixed(3));
      stage.style.setProperty('--hero-expand', clamp(p/.16).toFixed(3));
      stage.style.setProperty('--progress', `${p*100}%`);
      const reading=clamp((p-.26)/.39);
      heroLetters.forEach((letter,i)=>{
        const reveal=clamp(reading*(heroLetters.length+7)-i,0,7)/7;
        letter.style.opacity=(.07+.93*reveal).toFixed(3);
        letter.style.filter=`blur(${((1-reveal)*9).toFixed(2)}px)`;
      });
      first.inert = fade > .98;
      second.setAttribute('aria-hidden', String(arrival < .35));
    }
    textReveals.forEach(({element,units})=>{
      const rect=element.getBoundingClientRect();
      if(rect.top>innerHeight || rect.bottom<0)return;
      const p=clamp((innerHeight*.9-rect.top)/(innerHeight*.46));
      units.forEach((unit,i)=>{
        const reveal=clamp(p*(units.length+3)-i,0,3)/3;
        unit.style.opacity=(.22+.78*reveal).toFixed(3);
        unit.style.filter=`blur(${((1-reveal)*3).toFixed(2)}px)`;
      });
    });
    if(comparisonScene && comparison){
      const rect=comparisonScene.getBoundingClientRect();
      const p=desktopMotion.matches?clamp((110-rect.top)/(comparisonScene.offsetHeight-comparison.offsetHeight)*1.6):1;
      comparison.style.setProperty('--spread',p.toFixed(3));
    }
    serviceCards.forEach((card,i)=>{
      const next=serviceCards[i+1];
      const p=desktopMotion.matches && next?clamp((innerHeight*.75-next.getBoundingClientRect().top)/(innerHeight*.75-110)):0;
      card.style.setProperty('--stack-scale',(1-.035*p).toFixed(3));
      card.style.setProperty('--stack-brightness',(1-.12*p).toFixed(3));
    });
    methodSteps.forEach(step=>{
      const p=clamp((innerHeight*.85-step.getBoundingClientRect().top)/(innerHeight*.5));
      step.style.setProperty('--step-progress',p.toFixed(3));
    });
    parallax.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < innerHeight) section.style.setProperty('--parallax', `${clamp((innerHeight/2-rect.top-rect.height/2)*.09,-45,45)}px`);
    });
  };
  const schedule = () => { if (!requested) { requested=true; requestAnimationFrame(paint); } };
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', schedule, {passive:true});
  window.addEventListener('pageshow', schedule);
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) { document.body.classList.remove('motion-ready'); if (first) first.inert=false; second?.setAttribute('aria-hidden', 'true'); }
    else {
      document.querySelectorAll('.reveal').forEach(element => element.classList.add('is-visible'));
      document.body.classList.add('motion-ready');
    }
    schedule();
  });
  paint();
  const tabs = [...document.querySelectorAll('[data-faq-tab]')];
  const activateTab = (tab, focus=false) => {
    tabs.forEach(item => {
      const active=item===tab; item.setAttribute('aria-selected',String(active)); item.tabIndex=active?0:-1;
      document.getElementById(item.getAttribute('aria-controls')).hidden=!active;
    });
    if (focus) tab.focus();
  };
  tabs.forEach((tab,index) => {
    tab.addEventListener('click', () => activateTab(tab));
    tab.addEventListener('keydown', e => {
      let next;
      if (e.key==='ArrowRight') next=(index+1)%tabs.length;
      if (e.key==='ArrowLeft') next=(index-1+tabs.length)%tabs.length;
      if (e.key==='Home') next=0;
      if (e.key==='End') next=tabs.length-1;
      if (next !== undefined) { e.preventDefault(); activateTab(tabs[next],true); }
    });
  });
  document.querySelectorAll('[role="tabpanel"]').forEach(panel => {
    panel.querySelectorAll('details').forEach(detail => detail.addEventListener('toggle', () => {
      if (detail.open) panel.querySelectorAll('details').forEach(other => { if (other!==detail) other.open=false; });
    }));
  });
  const filters = [...document.querySelectorAll('[data-filter]')];
  const filterCards = [...document.querySelectorAll('[data-category]')];
  filters.forEach(button => button.addEventListener('click', () => {
    filters.forEach(other => other.setAttribute('aria-pressed',String(other===button)));
    filterCards.forEach(card => { card.hidden=button.dataset.filter!=='all' && card.dataset.category!==button.dataset.filter; });
  }));
  const form = document.querySelector('[data-contact-form]');
  if (form) {
    const review=document.querySelector('.form-review');
    const preview=document.querySelector('.message-preview');
    const status=document.querySelector('[data-form-status]');
    let message='';
    form.addEventListener('submit', event => {
      event.preventDefault(); if (!form.reportValidity()) return;
      const data=new FormData(form);
      const name=String(data.get('name')||'').trim();
      const email=String(data.get('email')||'').trim();
      const company=String(data.get('company')||'').trim();
      const question=String(data.get('message')||'').trim();
      if (!name || !company || question.length<10) {
        const invalid=!name?form.elements.name:!company?form.elements.company:form.elements.message;
        invalid.setCustomValidity(say('Escribe una respuesta para poder preparar el mensaje.','Please enter an answer so we can prepare the message.'));
        invalid.reportValidity(); invalid.addEventListener('input',()=>invalid.setCustomValidity(''),{once:true}); return;
      }
      message=`${say('Hola, Orquivia:','Hello, Orquivia:')}\n\n${say('Soy','I’m')} ${name}, ${company}.\n${say('Email de contacto','Contact email')}: ${email}\n\n${say('Me gustaría conversar sobre','I’d like to discuss')}: ${data.getAll('focus').join(', ') || say('mi proyecto','my project')}.\n\n${question}\n\n${say('Podemos concretar una primera conversación.','Let’s arrange an initial conversation.')}\n${name}`;
      preview.textContent=message;
      document.querySelector('[data-mail-link]').href=`mailto:info@orquivia.com?subject=${encodeURIComponent(say('Conversemos sobre ','Let’s discuss ')+company)}&body=${encodeURIComponent(message)}`;
      form.hidden=true;review.hidden=false;status.textContent='';
      review.querySelector('h2').focus({preventScroll:true});
      review.scrollIntoView({behavior:reducedMotion.matches?'instant':'smooth',block:'center'});
    });
    document.querySelector('[data-edit-message]').addEventListener('click',()=>{ review.hidden=true;form.hidden=false;form.elements.name.focus(); });
    document.querySelector('[data-copy-message]').addEventListener('click',async()=>{
      try { await navigator.clipboard.writeText(message); status.textContent=say('Mensaje copiado. Puedes pegarlo en tu correo y enviarlo a info@orquivia.com.','Message copied. Paste it into your email and send it to info@orquivia.com.'); }
      catch { const selection=window.getSelection();const range=document.createRange();range.selectNodeContents(preview);selection.removeAllRanges();selection.addRange(range);status.textContent=say('Seleccionamos el mensaje. Usa Copiar en tu dispositivo.','The message is selected. Use Copy on your device.'); }
    });
    document.querySelector('[data-mail-link]').addEventListener('click',()=>{ status.textContent=say('Se solicitará abrir tu aplicación de correo. El envío lo confirmas allí.','Your email app will be requested. Confirm sending there.'); });
  }
})();
