
/* ===== certificate verification (public) ===== */
document.getElementById('verify-form').addEventListener('submit',async e=>{
  e.preventDefault();
  const code=document.getElementById('v-code').value.trim().toUpperCase();
  const res=document.getElementById('v-result');
  const cert=Store.data.certificates.find(c=>c.code.toUpperCase()===code);
  if(cert){
    const stu=Store.data.students.find(s=>s.id===cert.studentId);
    res.className='verify-result ok';
    res.innerHTML=`<div class="cert-display">
      <p style="color:var(--gold);font-weight:800;letter-spacing:.12em;font-size:.8rem;margin-bottom:8px">✓ ${t('verify_found')}</p>
      <h2>${esc(stu?((Vis.lang==='ku'&&stu.name_ku)?stu.name_ku:stu.name_en):cert.studentName_en||'')}</h2>
      <p class="muted">${t('program')}: <b>${esc((DEPTS[cert.program]&&DEPTS[cert.program][Vis.lang])||cert.program||'')}</b></p>
      <p class="muted">${t('issued_on')}: <b>${fmtDate(cert.date)}</b></p>
      <p class="muted" style="font-size:.85rem">${t('code')}: ${esc(cert.code)}</p>
    </div>`;
  }else{
    res.className='verify-result bad';
    res.innerHTML=`<p style="font-weight:700;color:var(--red)">✕ ${t('verify_invalid')}</p>`;
  }
});
mountLangSwitch('lang-switch');
mountThemeToggle('.theme-toggle');
boot(()=>{}).then(()=>{
  if(!document.querySelector('.public-preview-notice'))return;
  document.querySelectorAll('#verify-form input, #verify-form button').forEach(control=>{control.disabled=true;});
  const result=document.getElementById('v-result');
  result.className='verify-result bad';
  result.textContent=t('verify_unavailable');
});
