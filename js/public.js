
/* ===== public website renderer ===== */
function setText(id,v){const el=document.getElementById(id);if(el!=null)el.textContent=v;}

function departmentDetailHtml(p,index=-1){
  const title=pick({en:p.title_en,ku:p.title_ku})||p.title_en||'';
  const courses=String(p['courses_'+Vis.lang]||'').split(/\r?\n/).map(item=>item.trim()).filter(Boolean);
  const careers=String(p['careers_'+Vis.lang]||'').split(/\r?\n/).map(item=>item.trim()).filter(Boolean);
  const heading=index<0?`<h1>${esc(title)}</h1>`:`<h3>${esc(title)}</h3>`;
  const anchor=index<0?'':` id="department-${index+1}"`;
  const pageLink=index<0?'':`<a class="text-link" href="program.html?id=${esc(encodeURIComponent(String(p.id||'')))}">${t('open_department')} ↗</a>`;
  return `<article class="card department-card${index<0?' full-department-page':''}"${anchor}>
    <div class="department-heading"><span class="icon">${esc(p.icon||'🎓')}</span>${heading}</div>
    <p>${esc(pick({en:p.desc_en,ku:p.desc_ku})||p.desc_en||'')}</p>
    <div class="department-detail"><h4>${t('courses')}</h4>${courses.length?`<ul>${courses.map(item=>`<li>${esc(item)}</li>`).join('')}</ul>`:`<p class="muted">${t('empty')}</p>`}</div>
    <div class="department-facts"><div><h4>${t('program_duration')}</h4><p>${esc(p['duration_'+Vis.lang]||t('duration_to_confirm'))}</p></div>
      <div><h4>${t('certificate_outcome')}</h4><p>${esc(p['certificate_'+Vis.lang]||t('certificate_to_confirm'))}</p></div></div>
    <div class="department-detail"><h4>${t('career_paths')}</h4>${careers.length?`<ul>${careers.map(item=>`<li>${esc(item)}</li>`).join('')}</ul>`:`<p class="muted">${t('career_note')}</p>`}</div>
    <p class="career-note">${t('career_note')}</p>${pageLink}
  </article>`;
}

function renderPublic(){
  const d=Store.data,s=d.settings;
  const settingText=(field,key)=>s[field]||(Vis.lang==='ku'?I18N.ku[key]:I18N.en[key])||'';
  const sn=pick({en:s.siteName_en,ku:s.siteName_ku});
  document.title=sn;
  const description=document.querySelector('meta[name="description"]')?.content||'';
  const socialTitle=document.querySelector('meta[property="og:title"]');
  const socialDescription=document.querySelector('meta[property="og:description"]');
  if(socialTitle)socialTitle.content=sn;
  if(socialDescription)socialDescription.content=description;
  setText('site-name',sn);
  setText('why-title',settingText('whyTitle_'+Vis.lang,'why_title'));
  [1,2,3,4].forEach(number=>setText('why-'+number,settingText(`why${number}_`+Vis.lang,`why_${number}`)));
  setText('faq-title',settingText('faqTitle_'+Vis.lang,'faq_title'));
  [1,2,3,4].forEach(number=>{
    setText(`faq-q${number}`,settingText(`faqQ${number}_`+Vis.lang,`faq_q${number}`));
    setText(`faq-a${number}`,settingText(`faqA${number}_`+Vis.lang,`faq_a${number}`));
  });
  setText('hero-title',pick({en:s.heroTitle_en,ku:s.heroTitle_ku}));
  setText('hero-sub',pick({en:s.heroSub_en,ku:s.heroSub_ku}));
  setText('about-text',pick({en:s.about_en,ku:s.about_ku}));
  setText('c-address',pick({en:s.address_en,ku:s.address_ku}));
  setText('c-phone',s.phone);setText('c-email',s.email);
  const officeHours=pick({en:s.officeHours_en,ku:s.officeHours_ku})||'';
  setText('c-office-hours',officeHours);
  document.getElementById('office-hours-item').hidden=!officeHours;
  setText('footer-about',pick({en:s.about_en,ku:s.about_ku}));
  setText('stat-programs',d.programs.length);
  setText('stat-students',Store.mode==='supabase'?(s.studentCount??'—'):d.students.length);
  setText('stat-since',s.since);
  setText('footer-verify','· '+t('verify'));
  const y=document.getElementById('year');if(y)y.textContent=new Date().getFullYear();

  document.getElementById('programs-grid').innerHTML=d.programs.map(p=>
    `<article class="card"><div class="icon">${esc(p.icon||'🎓')}</div><h3>${esc(pick({en:p.title_en,ku:p.title_ku})||p.title_en)}</h3><p>${esc(pick({en:p.desc_en,ku:p.desc_ku})||p.desc_en)}</p><a class="text-link" href="program.html?id=${esc(encodeURIComponent(String(p.id||'')))}">${t('department_details')} ↗</a></article>`
  ).join('')||`<p class="muted">${t('empty')}</p>`;

  document.getElementById('department-grid').innerHTML=d.programs.map((p,i)=>departmentDetailHtml(p,i)).join('')||`<p class="muted">${t('empty')}</p>`;

  const posts=[...d.posts].sort((a,b)=>(b.pinned-a.pinned)||String(b.date).localeCompare(String(a.date)));
  document.getElementById('news-grid').innerHTML=posts.map(p=>{
    const body=pick({en:p.body_en,ku:p.body_ku})||p.body_en||'';
    return `<article class="card news-card"><div class="date">${fmtDate(p.date)}${p.pinned?`<span class="badge">${t('pinned')}</span>`:''}</div><h3>${esc(pick({en:p.title_en,ku:p.title_ku})||p.title_en)}</h3><p>${esc(body.slice(0,220))}${body.length>220?'…':''}</p></article>`;
  }).join('')||`<p class="muted">${t('news_empty')}</p>`;

  const today=new Date().toISOString().slice(0,10);
  const events=[...d.events].filter(e=>e.date>=today).sort((a,b)=>String(a.date).localeCompare(String(b.date))).slice(0,6);
  document.getElementById('events-list').innerHTML=events.map(e=>
    `<div class="tl-item"><div class="tl-date">${fmtDate(e.date)}</div><h3>${esc(pick({en:e.title_en,ku:e.title_ku})||e.title_en)}</h3>
     <div class="tl-meta">${e.time?`<span>🕒 ${esc(e.time)}</span>`:''}<span>📍 ${esc(pick({en:e.location_en,ku:e.location_ku})||e.location_en||'')}</span></div>
     <p class="muted" style="font-size:.92rem">${esc(pick({en:e.desc_en,ku:e.desc_ku})||e.desc_en||'')}</p></div>`
  ).join('')||`<p class="muted">${t('no_events')}</p>`;

  document.getElementById('gallery-grid').innerHTML=d.gallery.map(g=>
    `<figure class="gallery-item"><img src="${esc(g.url)}" alt="${esc(pick({en:g.caption_en,ku:g.caption_ku})||'')}" loading="lazy">
     <figcaption>${esc(pick({en:g.caption_en,ku:g.caption_ku})||'')}</figcaption></figure>`
  ).join('')||`<p class="muted">${t('no_gallery')}</p>`;

  const weekly=(d.publicTimetable.length?d.publicTimetable:d.schedule.filter(item=>item.weekly))
    .sort((a,b)=>Number(a.weekday)-Number(b.weekday)||String(a.startTime).localeCompare(String(b.startTime)));
  document.getElementById('public-timetable').innerHTML=weekly.map(item=>
    `<tr><td>${t('weekday_'+Number(item.weekday))}</td><td>${esc(item.dept==='all'?t('all_students'):(DEPTS[item.dept]?.[Vis.lang]||item.dept))}</td><td>${Number(item.stage)||t('all_students')}</td><td>${esc(item.course)}</td><td>${esc(item.startTime||'')}${item.endTime?'–'+esc(item.endTime):''}</td><td>${esc(item.room||'')}</td></tr>`
  ).join('')||`<tr><td colspan="6" class="muted">${t('weekly_timetable_empty')}</td></tr>`;
  const analyticsId=String(s.analyticsId||'').trim();
  const analyticsAccepted=localStorage.getItem('vis_analytics_consent');
  const analyticsBanner=document.getElementById('analytics-consent');
  if(/^G-[A-Z0-9]+$/i.test(analyticsId)&&analyticsAccepted===null&&analyticsBanner)analyticsBanner.hidden=false;
  if(/^G-[A-Z0-9]+$/i.test(analyticsId)&&analyticsAccepted==='accepted'&&!document.querySelector(`script[data-ga="${analyticsId}"]`)){
    const script=document.createElement('script');
    script.async=true;script.src=`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(analyticsId)}`;script.dataset.ga=analyticsId;
    script.onload=()=>{window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments);};window.gtag('js',new Date());window.gtag('config',analyticsId,{anonymize_ip:true});};
    document.head.appendChild(script);
  }

  const icons={facebook:'f',instagram:'◎',youtube:'▶',telegram:'✈',whatsapp:'✆'};
  const labels={facebook:'Facebook',instagram:'Instagram',youtube:'YouTube',telegram:'Telegram',whatsapp:'WhatsApp'};
  const links=Object.entries(s.socials||{}).filter(([,v])=>v&&v.trim());
  document.getElementById('socials-row').innerHTML=links.length
    ? links.map(([k,v])=>`<a class="social-pill" href="${esc(v)}" target="_blank" rel="noopener"><b>${icons[k]||'#'}</b> ${labels[k]||esc(k)} ↗</a>`).join('')
    : `<p class="muted" style="font-size:.85rem">${t('follow_us')}</p>`;

  const whatsapp=document.getElementById('whatsapp-contact');
  const configuredWhatsapp=s.socials?.whatsapp||'';
  const whatsappUrl=whatsappHref(configuredWhatsapp);
  if(configuredWhatsapp&&!whatsappUrl)console.warn('Ignoring invalid institute WhatsApp chat link in site settings.');
  if(whatsappUrl){whatsapp.href=whatsappUrl;whatsapp.hidden=false;}
  else{whatsapp.removeAttribute('href');whatsapp.hidden=true;}
}

/* contact form → messages */
const publicContactForm=document.getElementById('contact-form');
if(publicContactForm)publicContactForm.addEventListener('submit',async e=>{
  e.preventDefault();
  const name=document.getElementById('cf-name').value.trim();
  const email=document.getElementById('cf-email').value.trim();
  const phone=document.getElementById('cf-phone').value.trim();
  const message=document.getElementById('cf-msg').value.trim();
  if(!name||!email||!message){toast(t('msg_fill'),false);return;}
  await Store.setDoc('messages',{id:uid('m'),name,email,phone,message,date:new Date().toISOString().slice(0,10),read:false});
  e.target.reset();
  toast(t('msg_sent'));
});
