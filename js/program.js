function renderProgramPage(){
  const id=new URLSearchParams(location.search).get('id');
  const program=Store.data.programs.find(item=>item.id===id);
  const instituteName=pick({en:Store.data.settings.siteName_en,ku:Store.data.settings.siteName_ku});
  setText('site-name',instituteName);
  setText('site-name-footer',instituteName);
  setText('year',new Date().getFullYear());
  if(program){
    const title=pick({en:program.title_en,ku:program.title_ku})||program.title_en||'';
    document.title=`${title} · ${instituteName}`;
    document.getElementById('program-content').innerHTML=departmentDetailHtml(program);
    return;
  }
  document.title=`${t('department_details')} · ${instituteName}`;
  document.getElementById('program-content').innerHTML=`<div class="card program-not-found"><p>${t('program_not_found')}</p><a class="btn btn-navy" href="index.html#programs">${t('program_breadcrumb')}</a></div>`;
}

mountLangSwitch('lang-switch');
mountThemeToggle('.theme-toggle');
boot(renderProgramPage);
