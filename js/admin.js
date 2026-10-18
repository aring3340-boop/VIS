
/* ===== admin / teacher panel ===== */
const sess=requireAuth('admin');
if(sess){
let tab='dash';
let stuQ='';
let showStuForm=false,stuEditId=null,stuAttId=null;
const nowD=new Date();let attView={y:nowD.getFullYear(),m:nowD.getMonth()};
let showPostForm=false,postEditId=null;
let showEvForm=false,evEditId=null;
let showProgForm=false,progEditId=null;
let showGalForm=false;
let showNotifForm=false;
let showScheduleForm=false,scheduleEditId=null;
let learningMode='assignments',showAssignmentForm=false,assignmentEditId=null,showMaterialForm=false,materialEditId=null;
let instructorEditId=null,resourceEditId=null,staffEditId=null;

const tabTitle={dash:'dash',students:'students',attendance:'attendance_admin',ai:'ai_helper',schedule:'schedule','exam-results':'exam_results',backup:'backup_restore',learning:'learning',
  resources:'resources_admin',msgs:'msgs',certs:'certs',website:'website_editor',staff:'staff_accounts',account:'account'};
const requestedTab=new URLSearchParams(location.search).get('tab');
if(Object.prototype.hasOwnProperty.call(tabTitle,requestedTab)
  &&(sess.role!=='teacher'||['students','attendance','schedule','learning','resources'].includes(requestedTab))
  &&(sess.role!=='content_editor'||['website','account'].includes(requestedTab))
  &&(requestedTab!=='staff'||isOwner(sess)))tab=requestedTab;
const val=id=>document.getElementById(id).value.trim();
const deptLabel=k=>(DEPTS[k]&&DEPTS[k][Vis.lang])||k;
const studentList=()=>sess.role==='teacher'?Store.data.students.filter(s=>s.teacherId===sess.id||(s.sharedWith||[]).includes(sess.id)):Store.data.students;
const canManageStudent=s=>sess.role!=='teacher'||s.teacherId===sess.id;
const canManagePublicContent=()=>['owner','admin','content_editor'].includes(sess.role);
const canManageResources=()=>canManagePublicContent()||sess.role==='teacher';
function initials(name){return (name||'?').trim().split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase();}

const sidebarToggle=document.getElementById('admin-menu-toggle');
const sidebarBackdrop=document.getElementById('sidebar-backdrop');
function setSidebarOpen(open){
  document.body.classList.toggle('admin-nav-open',open);
  sidebarToggle.setAttribute('aria-expanded',String(open));
  sidebarToggle.setAttribute('aria-label',t(open?'admin_close':'admin_menu'));
}
sidebarToggle.addEventListener('click',()=>setSidebarOpen(!document.body.classList.contains('admin-nav-open')));
sidebarBackdrop.addEventListener('click',()=>setSidebarOpen(false));
document.addEventListener('keydown',event=>{if(event.key==='Escape')setSidebarOpen(false);});
document.querySelectorAll('.side-link[data-tab]').forEach(b=>{
  b.addEventListener('click',()=>{setSidebarOpen(false);tab=b.dataset.tab;showStuForm=showPostForm=showEvForm=showProgForm=showGalForm=showNotifForm=false;
    showScheduleForm=showAssignmentForm=showMaterialForm=false;
    stuEditId=postEditId=evEditId=progEditId=stuAttId=scheduleEditId=assignmentEditId=materialEditId=resourceEditId=staffEditId=null;render();});
});
document.getElementById('btn-logout').onclick=async()=>{await Auth.logout();location.replace('login.html');};
if(!isOwner(sess))document.getElementById('staff-tab').style.display='none';
if(sess.role==='teacher')document.getElementById('teacher-portal-link').style.display='flex';
if(sess.role==='teacher')document.querySelectorAll('.side-link[data-tab]').forEach(b=>{
  if(!['dash','students','attendance','ai','schedule','learning','resources','account'].includes(b.dataset.tab))b.style.display='none';
});
if(sess.role==='content_editor')document.querySelectorAll('.side-link[data-tab]').forEach(b=>{
  if(!['website','account'].includes(b.dataset.tab))b.style.display='none';
});
if(!canManageResources())document.getElementById('resources-tab').style.display='none';
if(!canManagePublicContent())document.querySelectorAll('.side-link[data-tab="instructors"]').forEach(b=>b.style.display='none');
mountLangSwitch('lang-switch');
mountThemeToggle('.theme-toggle');

function render(){
  if(tab==='resources'&&!canManageResources()||tab==='staff'&&!isOwner(sess)||tab==='backup'&&!isOwner(sess)
    ||sess.role==='content_editor'&&!['website','account'].includes(tab))tab=sess.role==='content_editor'?'website':'dash';
  document.querySelectorAll('.side-link[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  document.getElementById('page-title').textContent=t(tabTitle[tab]);
  const c=document.getElementById('tab-content');
  if(tab==='dash'){c.innerHTML=vDash();wireDash();}
  else if(tab==='students'){c.innerHTML=vStudents();wireStudents();}
  else if(tab==='attendance'){c.innerHTML=vAttendance();}
  else if(tab==='ai'){c.innerHTML=vAI();}
  else if(tab==='schedule'){c.innerHTML=vSchedule();}
  else if(['exam-results','backup'].includes(tab)){c.innerHTML=VisExtended.renderAdmin(tab);}
  else if(tab==='learning'){c.innerHTML=vLearning();}
  else if(tab==='resources'){c.innerHTML=vResources();}
  else if(tab==='msgs'){c.innerHTML=vMsgs();}
  else if(tab==='certs'){c.innerHTML=vCerts();}
  else if(tab==='website'){c.innerHTML=vWebsiteEditor();wireGallery();}
  else if(tab==='staff'){c.innerHTML=vStaff();}
  else if(tab==='account'){c.innerHTML=vAccount();}
}
function vWebsiteEditor(){
  const sections=[
    ['content',vContent()],['socials',vSocials()],['programs_m',vPrograms()],['posts',vPosts()],
    ['ev_m',vEvents()],['schedule',vSchedule()],['gal_m',vGallery()],['notifs',vNotifs()]
  ];
  return `<p class="lead website-editor-hint">${t('website_editor_hint')}</p>`+
    sections.map(([title,content],index)=>`<details class="website-editor-section"${index===0?' open':''}><summary>${t(title)}</summary>${content}</details>`).join('');
}
function validHttpsUrl(value){
  try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password;}
  catch(error){return false;}
}
function vResources(){
  const entry=resourceEditId?Store.data.resources.find(item=>item.id===resourceEditId):null;
  const canEdit=item=>canManagePublicContent()||item.addedBy===sess.id;
  return `<div class="panel"><h3>${entry?t('edit'):t('resource_add')}</h3><p class="muted">${t('resources_hint')}</p>
    <div class="form-grid">
      <div class="field"><label>${t('resource_category')}</label><input id="resource-category" class="input" maxlength="60" value="${esc(entry?.category||'')}"></div>
      <div class="field"><label>${t('resource_title_en')}</label><input id="resource-title-en" class="input" maxlength="160" value="${esc(entry?.title_en||'')}"></div>
      <div class="field"><label>${t('resource_title_ku')}</label><input id="resource-title-ku" class="input" maxlength="160" dir="rtl" value="${esc(entry?.title_ku||'')}"></div>
    </div>
    <div class="field"><label>${t('resource_file')}</label><input id="resource-file" class="input" type="file" accept=".pdf,application/pdf"><small class="muted">${t(Store.mode==='supabase'?'resource_file_large':'resource_file_large_demo')}</small></div>
    <div class="row-actions"><button class="btn btn-gold" id="resource-save">${t('save')}</button>${entry?`<button class="btn btn-ghost" id="resource-cancel">${t('cancel')}</button>`:''}</div></div>
    <div class="panel"><h3>${t('resources_admin')}</h3><div class="table-wrap"><table><thead><tr><th>${t('resource_category')}</th><th>${t('resource_title_en')}</th><th>${t('resource_file')}</th><th>${t('actions')}</th></tr></thead><tbody>
      ${Store.data.resources.map(item=>`<tr><td>${esc(item.category)}</td><td>${esc(item.title_en||item.title_ku)}</td><td><button class="btn btn-ghost btn-sm" data-resource-download="${esc(item.id)}">${t('resource_open')}</button> ${esc(item.fileName)}</td><td>${canEdit(item)?`<div class="row-actions"><button class="btn btn-ghost btn-sm" data-resource-edit="${esc(item.id)}">${t('edit')}</button><button class="btn btn-danger btn-sm" data-resource-delete="${esc(item.id)}">${t('del')}</button></div>`:`<span class="muted">—</span>`}</td></tr>`).join('')||`<tr><td colspan="4" class="muted">${t('resource_empty')}</td></tr>`}
    </tbody></table></div></div>`;
}
async function saveResource(){
  const category=val('resource-category'),title_en=val('resource-title-en'),title_ku=val('resource-title-ku');
  const file=document.getElementById('resource-file').files[0],existing=resourceEditId?Store.data.resources.find(item=>item.id===resourceEditId):null;
  if(!category||(!title_en&&!title_ku)||(!file&&!existing)){toast(t('resource_invalid'),false);return;}
  const id=existing?.id||uid('resource');
  let uploaded=null;
  try{
    if(file)uploaded=await Store.uploadResourceFile(file,id);
    const record={...(existing||{}),id,category,title_en,title_ku,
      fileName:uploaded?.fileName||existing?.fileName,filePath:uploaded?.filePath??existing?.filePath??'',
      fileData:uploaded?.fileData??existing?.fileData??'',fileSize:uploaded?.fileSize??existing?.fileSize??0,
      addedBy:existing?.addedBy||sess.id,updatedAt:new Date().toISOString(),createdAt:existing?.createdAt||new Date().toISOString()};
    await Store.setDoc('resources',record);
  }catch(error){
    if(uploaded?.filePath)try{await Store.deleteResourceFile(uploaded.filePath);}catch(cleanupError){console.error('Could not remove an incomplete handbook upload:',cleanupError);}
    if(error?.message===t('resource_pdf_only')||error?.message===t('resource_file_large')||error?.message===t('resource_file_large_demo'))toast(error.message,false);
    else{console.error('Could not save private student resource:',error);toast(t('admin_save_error'),false);}
    return;
  }
  resourceEditId=null;toast(t('resource_saved'));render();
  if(uploaded&&existing?.filePath&&existing.filePath!==uploaded.filePath){
    try{await Store.deleteResourceFile(existing.filePath);}
    catch(error){console.error('Saved the new handbook, but could not remove its previous file:',error);toast(t('resource_cleanup_error'),false);}
  }
}
function vInstructors(){
  const entry=instructorEditId?Store.data.instructors.find(item=>item.id===instructorEditId):null;
  return `<div class="panel"><h3>${entry?t('edit'):t('instructors_admin')}</h3>
    <div class="form-grid">
      <div class="field"><label>${t('instructor_name_en')}</label><input id="inst-name-en" class="input" maxlength="120" value="${esc(entry?.name_en||'')}"></div>
      <div class="field"><label>${t('instructor_name_ku')}</label><input id="inst-name-ku" class="input" maxlength="120" dir="rtl" value="${esc(entry?.name_ku||'')}"></div>
      <div class="field"><label>${t('instructor_role_en')}</label><input id="inst-role-en" class="input" maxlength="120" value="${esc(entry?.role_en||'')}"></div>
      <div class="field"><label>${t('instructor_role_ku')}</label><input id="inst-role-ku" class="input" maxlength="120" dir="rtl" value="${esc(entry?.role_ku||'')}"></div>
      <div class="field"><label>${t('instructor_bio_en')}</label><textarea id="inst-bio-en" class="input" maxlength="1000">${esc(entry?.bio_en||'')}</textarea></div>
      <div class="field"><label>${t('instructor_bio_ku')}</label><textarea id="inst-bio-ku" class="input" maxlength="1000" dir="rtl">${esc(entry?.bio_ku||'')}</textarea></div>
      <div class="field"><label>${t('instructor_subjects')} (EN)</label><input id="inst-subjects-en" class="input" maxlength="250" value="${esc(entry?.subjects_en||'')}"></div>
      <div class="field"><label>${t('instructor_subjects')} (KU)</label><input id="inst-subjects-ku" class="input" maxlength="250" dir="rtl" value="${esc(entry?.subjects_ku||'')}"></div>
      <div class="field"><label>${t('instructor_qualifications')} (EN)</label><textarea id="inst-qualifications-en" class="input" maxlength="500">${esc(entry?.qualifications_en||'')}</textarea></div>
      <div class="field"><label>${t('instructor_qualifications')} (KU)</label><textarea id="inst-qualifications-ku" class="input" maxlength="500" dir="rtl">${esc(entry?.qualifications_ku||'')}</textarea></div>
    </div>
    <div class="field"><label>${t('instructor_photo')}</label><input id="inst-photo" class="input" type="url" dir="ltr" maxlength="1000" value="${esc(entry?.photoUrl||'')}"></div>
    <label class="check instructor-consent"><input id="inst-consent" type="checkbox"><span>${t('instructor_consent')}</span></label>
    <div class="row-actions"><button class="btn btn-gold" id="inst-save">${t('save')}</button>${entry?`<button class="btn btn-ghost" id="inst-cancel">${t('cancel')}</button>`:''}</div>
    <p class="muted">${t('instructor_consent')}</p></div>
    <div class="panel"><h3>${t('instructors_admin')}</h3><div class="table-wrap"><table><thead><tr><th>${t('instructor_name_en')}</th><th>${t('instructor_role_en')}</th><th>${t('actions')}</th></tr></thead><tbody>
      ${Store.data.instructors.map(item=>`<tr><td>${esc(item.name_en||item.name_ku)}</td><td>${esc(item.role_en||item.role_ku||'')}</td><td><div class="row-actions"><button class="btn btn-ghost btn-sm" data-instedit="${esc(item.id)}">${t('edit')}</button><button class="btn btn-danger btn-sm" data-instdel="${esc(item.id)}">${t('del')}</button></div></td></tr>`).join('')||`<tr><td colspan="3" class="muted">${t('no_instructors')}</td></tr>`}
    </tbody></table></div></div>`;
}
async function saveInstructor(){
  const name_en=val('inst-name-en'),name_ku=val('inst-name-ku'),photoUrl=val('inst-photo');
  if(!name_en&&!name_ku){toast(t('err_fill'),false);return;}
  if(!document.getElementById('inst-consent').checked){toast(t('instructor_consent_required'),false);return;}
  if(photoUrl&&!validHttpsUrl(photoUrl)){toast(t('photo_url_invalid'),false);return;}
  const entry=instructorEditId?Store.data.instructors.find(item=>item.id===instructorEditId):null;
  const record={...(entry||{}),id:entry?.id||uid('instructor'),name_en,name_ku,
    role_en:val('inst-role-en'),role_ku:val('inst-role-ku'),
    bio_en:document.getElementById('inst-bio-en').value.trim(),bio_ku:document.getElementById('inst-bio-ku').value.trim(),
    subjects_en:val('inst-subjects-en'),subjects_ku:val('inst-subjects-ku'),
    qualifications_en:document.getElementById('inst-qualifications-en').value.trim(),
    qualifications_ku:document.getElementById('inst-qualifications-ku').value.trim(),photoUrl};
  await Store.setDoc('instructors',record);instructorEditId=null;toast(t('instructor_saved'));render();
}
async function runManagerSave(action){
  try{await action();}
  catch(error){console.error('Could not save manager changes:',error);toast(t('admin_save_error'),false);}
}
function vAI(){
  return `<div class="panel"><h3>${t('ai_helper')}</h3><form id="ai-form">
    <div class="field"><textarea id="ai-question" class="input" maxlength="2000" required placeholder="${t('ai_placeholder')}"></textarea></div>
    <button class="btn btn-gold" data-i18n="ai_ask">${t('ai_ask')}</button></form>
    <div id="ai-answer" class="muted" style="white-space:pre-wrap;margin-top:16px"></div></div>`;
}
function vSchedule(){
  const entries=[...Store.data.schedule].sort((a,b)=>String(a.date).localeCompare(String(b.date))||String(a.startTime).localeCompare(String(b.startTime)));
  const entry=scheduleEditId?entries.find(x=>x.id===scheduleEditId):null;
  let form='';
  if(showScheduleForm)form=`<div class="panel"><h3>${entry?t('edit'):t('add_schedule')}</h3>
    <div class="form-grid">
      <div class="field"><label>${t('event_kind')}</label><select id="sc-kind" class="input"><option value="class" ${entry?.kind!=='exam'?'selected':''}>${t('class_session')}</option><option value="exam" ${entry?.kind==='exam'?'selected':''}>${t('exam')}</option></select></div>
      <div class="field"><label>${t('date')}</label><input id="sc-date" type="date" class="input" value="${esc(entry?.date||'')}"></div>
      <div class="field"><label>${t('weekday')}</label><select id="sc-weekday" class="input">${Array.from({length:7},(_,day)=>`<option value="${day}" ${Number(entry?.weekday)===day?'selected':''}>${t('weekday_'+day)}</option>`).join('')}</select></div>
      <div class="field"><label>${t('start_time')}</label><input id="sc-start" type="time" class="input" value="${esc(entry?.startTime||'')}"></div>
      <div class="field"><label>${t('end_time')}</label><input id="sc-end" type="time" class="input" value="${esc(entry?.endTime||'')}"></div>
      <div class="field"><label>${t('course')}</label><input id="sc-course" class="input" value="${esc(entry?.course||'')}"></div>
      <div class="field"><label>${t('room')}</label><input id="sc-room" class="input" value="${esc(entry?.room||'')}"></div>
      <div class="field"><label>${t('dept')}</label><select id="sc-dept" class="input"><option value="all">${t('all_students')}</option>${Object.keys(DEPTS).map(k=>`<option value="${k}" ${entry?.dept===k?'selected':''}>${esc(DEPTS[k][Vis.lang])}</option>`).join('')}</select></div>
      <div class="field"><label>${t('stage')}</label><select id="sc-stage" class="input"><option value="0">${t('all_students')}</option>${Array.from({length:10},(_,i)=>i+1).map(n=>`<option value="${n}" ${Number(entry?.stage)===n?'selected':''}>${n}</option>`).join('')}</select></div>
    </div>
    <label class="check"><input type="checkbox" id="sc-weekly" ${entry?.weekly?'checked':''}> ${t('weekly_recurring')}</label>
    <div class="field"><label>${t('instructions')}</label><textarea id="sc-notes" class="input">${esc(entry?.notes||'')}</textarea></div>
    <div class="row-actions"><button class="btn btn-gold" id="sc-save">${t('save')}</button><button class="btn btn-ghost" id="sc-cancel">${t('cancel')}</button></div></div>`;
  return form+`<div class="panel"><div class="search-row"><h3 style="margin:0">${t('schedule')}</h3><span style="flex:1"></span><button class="btn btn-navy" id="sc-add">＋ ${t('add_schedule')}</button></div>
    <div class="table-wrap"><table><thead><tr><th>${t('date')}</th><th>${t('event_kind')}</th><th>${t('course')}</th><th>${t('start_time')}</th><th>${t('room')}</th><th>${t('actions')}</th></tr></thead><tbody>
    ${entries.map(x=>`<tr><td>${x.weekly?t('weekday_'+Number(x.weekday)):fmtDate(x.date)}</td><td>${t(x.kind==='exam'?'exam':'class_session')}</td><td>${esc(x.course)}${x.dept&&x.dept!=='all'?`<br><small>${esc(deptLabel(x.dept))}${Number(x.stage)?` · ${Number(x.stage)}`:''}</small>`:''}</td><td>${esc(x.startTime||'')}${x.endTime?'–'+esc(x.endTime):''}</td><td>${esc(x.room||'')}</td><td>${x.teacherId===sess.id||sess.role!=='teacher'?`<div class="row-actions"><button class="btn btn-ghost btn-sm" data-schedit="${x.id}">${t('edit')}</button><button class="btn btn-danger btn-sm" data-schdel="${x.id}">${t('del')}</button></div>`:`<span class="muted">${esc(Store.data.admins.find(a=>a.id===x.teacherId)?.name||'')}</span>`}</td></tr>`).join('')||`<tr><td colspan="6" class="muted">${t('no_schedule')}</td></tr>`}
    </tbody></table></div></div>`;
}
async function saveSchedule(){
  const entry=scheduleEditId?Store.data.schedule.find(x=>x.id===scheduleEditId):null;
  const date=val('sc-date'),course=val('sc-course'),weekly=document.getElementById('sc-weekly').checked;
  if((!weekly&&!date)||!course){toast(t('err_fill'),false);return;}
  const fields={kind:val('sc-kind'),date:weekly?'':date,weekly,weekday:Number(val('sc-weekday')),startTime:val('sc-start'),endTime:val('sc-end'),course,room:val('sc-room'),dept:val('sc-dept'),stage:Number(val('sc-stage')),notes:document.getElementById('sc-notes').value.trim()};
  if(entry){Object.assign(entry,fields);await Store.setDoc('schedule',entry);}
  else await Store.setDoc('schedule',{id:uid('sch'),teacherId:sess.id,...fields});
  showScheduleForm=false;scheduleEditId=null;toast(t('learning_saved'));render();
}
function vLearning(){
  const assignments=Store.data.assignments;
  const materials=Store.data.materials;
  const assignment=assignmentEditId?assignments.find(x=>x.id===assignmentEditId):null;
  const material=materialEditId?materials.find(x=>x.id===materialEditId):null;
  const modes=`<div class="row-actions" style="margin-bottom:16px"><button class="btn ${learningMode==='assignments'?'btn-navy':'btn-ghost'}" data-learning-mode="assignments">${t('assignments')}</button><button class="btn ${learningMode==='materials'?'btn-navy':'btn-ghost'}" data-learning-mode="materials">${t('materials')}</button></div>`;
  if(learningMode==='materials'){
    const form=showMaterialForm?`<div class="panel"><h3>${material?t('edit'):t('add_material')}</h3><div class="form-grid">
      <div class="field"><label>${t('title_en')}</label><input id="mat-title" class="input" value="${esc(material?.title||'')}"></div>
      <div class="field"><label>${t('course')}</label><input id="mat-course" class="input" value="${esc(material?.course||'')}"></div>
      <div class="field"><label>${t('dept')}</label><select id="mat-dept" class="input"><option value="all">${t('all_students')}</option>${Object.keys(DEPTS).map(k=>`<option value="${k}" ${material?.dept===k?'selected':''}>${esc(DEPTS[k][Vis.lang])}</option>`).join('')}</select></div>
      <div class="field"><label>${t('stage')}</label><select id="mat-stage" class="input"><option value="0">${t('all_students')}</option>${Array.from({length:10},(_,i)=>i+1).map(n=>`<option value="${n}" ${Number(material?.stage)===n?'selected':''}>${n}</option>`).join('')}</select></div>
    </div><div class="field"><label>${t('instructions')}</label><textarea id="mat-body" class="input">${esc(material?.body||'')}</textarea></div>
    <div class="field"><label>${t('resource')}</label><input id="mat-url" type="url" class="input" value="${esc(material?.url||'')}"></div>
    <div class="row-actions"><button class="btn btn-gold" id="mat-save">${t('save')}</button><button class="btn btn-ghost" id="mat-cancel">${t('cancel')}</button></div></div>`:'';
    return modes+form+`<div class="panel"><div class="search-row"><h3 style="margin:0">${t('materials')}</h3><span style="flex:1"></span><button class="btn btn-navy" id="mat-add">＋ ${t('add_material')}</button></div>
      <div class="table-wrap"><table><thead><tr><th>${t('title_en')}</th><th>${t('course')}</th><th>${t('dept')}</th><th>${t('stage')}</th><th>${t('actions')}</th></tr></thead><tbody>
      ${materials.map(m=>`<tr><td>${esc(m.title)}</td><td>${esc(m.course||'')}</td><td>${esc(m.dept==='all'?t('all_students'):deptLabel(m.dept))}</td><td>${Number(m.stage)||t('all_students')}</td><td>${m.teacherId===sess.id||sess.role!=='teacher'?`<div class="row-actions"><button class="btn btn-ghost btn-sm" data-matedit="${m.id}">${t('edit')}</button><button class="btn btn-danger btn-sm" data-matdel="${m.id}">${t('del')}</button></div>`:''}</td></tr>`).join('')||`<tr><td colspan="5" class="muted">${t('no_materials')}</td></tr>`}
      </tbody></table></div></div>`;
  }
  const form=showAssignmentForm?`<div class="panel"><h3>${assignment?t('edit'):t('add_assignment')}</h3><div class="form-grid">
    <div class="field"><label>${t('title_en')}</label><input id="as-title" class="input" value="${esc(assignment?.title||'')}"></div>
    <div class="field"><label>${t('course')}</label><input id="as-course" class="input" value="${esc(assignment?.course||'')}"></div>
    <div class="field"><label>${t('due_date')}</label><input id="as-due" type="date" class="input" value="${esc(assignment?.dueDate||'')}"></div>
    <div class="field"><label>${t('dept')}</label><select id="as-dept" class="input">${Object.keys(DEPTS).map(k=>`<option value="${k}" ${assignment?.dept===k?'selected':''}>${esc(DEPTS[k][Vis.lang])}</option>`).join('')}</select></div>
    <div class="field"><label>${t('stage')}</label><select id="as-stage" class="input">${Array.from({length:10},(_,i)=>i+1).map(n=>`<option value="${n}" ${Number(assignment?.stage)===n?'selected':''}>${n}</option>`).join('')}</select></div>
  </div><div class="field"><label>${t('instructions')}</label><textarea id="as-instructions" class="input">${esc(assignment?.instructions||'')}</textarea></div>
  <div class="row-actions"><button class="btn btn-gold" id="as-save">${t('save')}</button><button class="btn btn-ghost" id="as-cancel">${t('cancel')}</button></div></div>`:'';
  const rows=assignments.map(a=>{
    const submissions=Store.data.submissions.filter(s=>s.assignmentId===a.id);
    const review=submissions.map(s=>{
      const student=Store.data.students.find(x=>x.id===s.studentId);
      return `<div class="announce"><b>${esc(student?.name_en||s.studentId)}</b> · ${fmtDate(s.submittedAt)}<p>${esc(s.answer||'')}</p>${s.filePath||s.fileData?`<button class="btn btn-ghost btn-sm" data-subdownload="${s.id}">${esc(s.fileName||t('attachment'))}</button>`:''}</div>`;
    }).join('')||`<p class="muted">${t('empty')}</p>`;
    return `<tr><td>${esc(a.title)}</td><td>${esc(a.course)}</td><td>${esc(deptLabel(a.dept))} · ${a.stage}</td><td>${fmtDate(a.dueDate)}</td><td><details><summary>${submissions.length} ${t('submission')}</summary>${review}</details></td><td>${a.teacherId===sess.id||sess.role!=='teacher'?`<div class="row-actions"><button class="btn btn-ghost btn-sm" data-asedit="${a.id}">${t('edit')}</button><button class="btn btn-danger btn-sm" data-asdel="${a.id}">${t('del')}</button></div>`:''}</td></tr>`;
  }).join('');
  return modes+form+`<div class="panel"><div class="search-row"><h3 style="margin:0">${t('assignments')}</h3><span style="flex:1"></span><button class="btn btn-navy" id="as-add">＋ ${t('add_assignment')}</button></div>
    <div class="table-wrap"><table><thead><tr><th>${t('title_en')}</th><th>${t('course')}</th><th>${t('audience')}</th><th>${t('due_date')}</th><th>${t('submission')}</th><th>${t('actions')}</th></tr></thead><tbody>${rows||`<tr><td colspan="6" class="muted">${t('no_assignments')}</td></tr>`}</tbody></table></div></div>`;
}
async function saveAssignment(){
  const assignment=assignmentEditId?Store.data.assignments.find(x=>x.id===assignmentEditId):null;
  const title=val('as-title'),course=val('as-course'),dueDate=val('as-due');
  if(!title||!course||!dueDate){toast(t('err_fill'),false);return;}
  const fields={title,course,dueDate,dueAt:Store.mode==='supabase'?new Date(`${dueDate}T23:59:59`).toISOString():null,
    dept:val('as-dept'),stage:Number(val('as-stage')),instructions:document.getElementById('as-instructions').value.trim()};
  if(assignment){Object.assign(assignment,fields);await Store.setDoc('assignments',assignment);}
  else await Store.setDoc('assignments',{id:uid('as'),teacherId:sess.id,createdAt:new Date().toISOString(),...fields});
  showAssignmentForm=false;assignmentEditId=null;toast(t('learning_saved'));render();
}
async function saveMaterial(){
  const material=materialEditId?Store.data.materials.find(x=>x.id===materialEditId):null;
  const title=val('mat-title'),course=val('mat-course'),body=document.getElementById('mat-body').value.trim(),url=val('mat-url');
  if(!title||!course||(!body&&!url)){toast(t('err_fill'),false);return;}
  if(url&&!/^https?:\/\//i.test(url)){toast(t('url_invalid'),false);return;}
  const fields={title,course,body,url,dept:val('mat-dept'),stage:Number(val('mat-stage'))};
  if(material){Object.assign(material,fields);await Store.setDoc('materials',material);}
  else await Store.setDoc('materials',{id:uid('mat'),teacherId:sess.id,...fields});
  showMaterialForm=false;materialEditId=null;toast(t('learning_saved'));render();
}

/* ---------- dashboard ---------- */
function vDash(){
  const d=Store.data;
  const visible=studentList();
  const recent=[...visible].slice(-5).reverse();
  return `<div class="stats-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:24px">
    <div class="stat"><b>${visible.length}</b><span>${t('total_students')}</span></div>
    <div class="stat"><b>${d.posts.length}</b><span>${t('published_posts')}</span></div>
    <div class="stat"><b>${d.programs.length}</b><span>${t('programs_offered')}</span></div>
  </div>
  <div class="panel"><h3>${t('export_csv')}</h3>
    <div class="row-actions">
      <button class="btn btn-ghost btn-sm" id="ex-stu">⬇ ${t('export_students')}</button>
      <button class="btn btn-ghost btn-sm" id="ex-gra">⬇ ${t('export_grades')}</button>
      <button class="btn btn-ghost btn-sm" id="ex-att">⬇ ${t('export_att')}</button>
      ${sess.role==='teacher'?'':`<button class="btn btn-ghost btn-sm" id="ex-msg">⬇ ${t('export_msgs')}</button>`}
    </div>
  </div>
  <div class="panel"><h3>${t('recent_students')}</h3>${stuTable(recent,true)}</div>
  <div class="panel"><button class="btn btn-gold" id="qadd">＋ ${t('add_student')}</button></div>`;
}
function wireDash(){document.getElementById('qadd').onclick=()=>{tab='students';showStuForm=true;stuEditId=null;render();};}
function stuTable(list,compact){
  if(!list.length)return `<p class="muted">${t('empty')}</p>`;
  return `<div class="table-wrap"><table><thead><tr>
    <th>${t('name_en')}</th><th>${t('username')}</th><th>${t('dept')}</th><th>${t('attendance')}</th><th>${t('stage')}</th><th>${t('class_name')}</th>${compact?'':`<th>${t('actions')}</th>`}
  </tr></thead><tbody>
  ${list.map(s=>`<tr>
    <td><span class="avatar">${esc(initials(s.name_en))}</span>${esc((Vis.lang==='ku'&&s.name_ku)?s.name_ku:s.name_en)}</td>
    <td>${esc(s.username)}</td>
    <td><span class="tag">${esc(deptLabel(s.dept))}</span></td>
    <td>${s.attendance??100}%</td>
    <td>${s.stage}</td>
    <td>${esc(s.className||'—')}</td>
    ${compact?'':`<td><div class="row-actions">
      ${canManageStudent(s)?`
      <button class="btn btn-ghost btn-sm" data-sedit="${s.id}">${t('edit')}</button>
      <button class="btn btn-ghost btn-sm" title="${t('att_m')}" data-satt="${s.id}">📅</button>
      <button class="btn btn-ghost btn-sm" title="${t('gen_cert')}" data-scert="${s.id}">🏅</button>
      <button class="btn btn-ghost btn-sm" title="${t('reset_pw')}" data-srpw="${s.id}">PW</button>
      `:`<span class="muted">${t('shared_read_only')}</span>`}
    </div></td>`}
  </tr>`).join('')}
  </tbody></table></div>`;
}

/* ---------- students ---------- */
function gradeRowsHtml(g){
  return (g||[]).map(x=>`<div class="grade-row" style="display:grid;grid-template-columns:1fr 130px 40px;gap:10px;align-items:center;margin-bottom:10px">
    <input class="input g-sub" value="${esc(x.subject)}" placeholder="${t('subject')}">
    <input class="input g-score" type="number" min="0" max="100" value="${esc(String(x.score))}" placeholder="${t('score')}">
    <button type="button" class="btn btn-danger btn-sm g-del">✕</button>
  </div>`).join('');
}
function vStudents(){
  const d=Store.data;
  const q=stuQ.toLowerCase();
  const visible=studentList();
  const list=visible.filter(s=>!q||((s.name_en||'')+' '+(s.name_ku||'')+' '+(s.username||'')+' '+(s.className||'')).toLowerCase().includes(q));
  const stu=stuEditId?visible.find(x=>x.id===stuEditId):null;
  let form='';
  if(showStuForm){
    form=`<div class="panel"><h3>${stu?t('edit'):t('add_student')}</h3>
    <div class="form-grid">
      <div class="field"><label>${t('name_en')} *</label><input id="f-name-en" class="input" value="${esc(stu?.name_en||'')}"></div>
      <div class="field"><label>${t('name_ku')}</label><input id="f-name-ku" class="input" dir="rtl" value="${esc(stu?.name_ku||'')}"></div>
      <div class="field"><label>${t('username')} *</label><input id="f-user" class="input" value="${esc(stu?.username||'')}" ${stu?'disabled':''}></div>
      <div class="field"><label>${stu?t('new_pw'):t('password')}${stu?'':' *'}</label><div class="password-input-wrap"><input id="f-pass" type="password" class="input" placeholder="${stu?'••••••':''}" autocomplete="new-password"><button class="password-toggle" type="button" data-password-target="f-pass" data-i18n="show_password" aria-label="${t('show_password')}">${t('show_password')}</button></div></div>
      <div class="field"><label>${t('dept')}</label><select id="f-dept" class="input">${Object.keys(DEPTS).map(k=>`<option value="${k}" ${stu&&stu.dept===k?'selected':''}>${esc(DEPTS[k][Vis.lang])}</option>`).join('')}</select></div>
      <div class="field"><label>${t('stage')}</label><select id="f-stage" class="input">${stu&&Number(stu.stage)>5?`<option value="${esc(String(stu.stage))}" selected disabled>${t('existing_stage')}: ${esc(String(stu.stage))}</option>`:''}${Array.from({length:5},(_,i)=>i+1).map(n=>`<option value="${n}" ${stu&&Number(stu.stage)===n?'selected':''}>${t('stage')} ${n}</option>`).join('')}</select></div>
      <div class="field"><label>${t('class_name')}</label><input id="f-class" class="input" maxlength="120" value="${esc(stu?.className||'')}"></div>
      ${sess.role==='teacher'?'':`<div class="field"><label>${t('assigned_teacher')}</label><select id="f-teacher" class="input">${Store.data.admins.filter(a=>['teacher','admin','owner'].includes(a.role)).map(a=>`<option value="${esc(a.id)}" ${(stu?.teacherId||sess.id)===a.id?'selected':''}>${esc(a.username||a.name)}</option>`).join('')}</select></div>`}
      <div class="field"><label>${t('phone_l')}${stu?'':' *'}</label><input id="f-phone" type="tel" class="input" value="${esc(stu?.phone||'')}" ${stu?'':'pattern="\\+[1-9][0-9]{7,14}" required'}></div>
      <div class="field"><label>${t('dob')}</label><input id="f-dob" type="date" class="input" value="${esc(stu?.dob||'')}"></div>
      <div class="field"><label>${t('email')}</label><input id="f-email" class="input" value="${esc(stu?.email||'')}"></div>
    </div>
    <div class="form-grid">
      <label class="check"><input type="checkbox" id="f-email-opt-in" ${stu?.emailOptIn?'checked':''}> ${t('email_alert_consent')}</label>
      <label class="check"><input type="checkbox" id="f-sms-opt-in" ${stu?.smsOptIn?'checked':''}> ${t('sms_alert_consent')}</label>
      <label class="check"><input type="checkbox" id="f-whatsapp-opt-in" ${stu?.whatsappOptIn?'checked':''}> ${t('whatsapp_alert_consent')}</label>
    </div>
    <label class="grade-label" style="font-weight:700;font-size:.86rem;display:block;margin-bottom:10px">${t('grades')}</label>
    <div id="grade-rows">${gradeRowsHtml(stu?.grades)}</div>
    <button type="button" class="btn btn-ghost btn-sm" id="add-grade" style="margin-bottom:18px">${t('add_grade')}</button>
    <div class="row-actions"><button class="btn btn-gold" id="stu-save">${t('save')}</button><button class="btn btn-ghost" id="stu-cancel">${t('cancel')}</button></div>
    </div>`;
  }
  let attPanel='';
  if(stuAttId){
    const sa=visible.find(x=>x.id===stuAttId);
    if(sa){
      const today=new Date().toISOString().slice(0,10);
      attPanel=`<div class="panel"><h3>📅 ${t('att_m')} — ${esc(sa.name_en)}</h3>
      <div class="row-actions" style="margin-bottom:16px">
        <button class="btn btn-ghost btn-sm" data-marktoday="${today}:present">✔ ${t('mark_present')}</button>
        <button class="btn btn-danger btn-sm" data-marktoday="${today}:absent">✘ ${t('mark_absent')}</button>
        <span style="flex:1"></span>
        <button class="btn btn-ghost btn-sm" id="att-close">${t('cancel')}</button>
      </div>
      <div id="att-cal" style="max-width:520px">${calendarHtml(sa.attMap||{},attView.y,attView.m,true)}</div>
      </div>`;
    }
  }
  return pendingSignupsPanel()+form+attPanel+accessRequestsPanel()+`<div class="panel">
    <div class="search-row">
      <input id="stu-search" class="input" placeholder="${t('search_ph')}" value="${esc(stuQ)}">
      <button class="btn btn-navy" id="stu-add">＋ ${t('add_student')}</button>
    </div>
    ${stuTable(list,false)}
  </div>`;
}
function pendingSignupsPanel(){
  if(!['owner','admin'].includes(sess.role)||Store.mode!=='supabase')return '';
  const signups=Store.data.pendingSignups||[];
  return `<div class="panel"><div class="search-row"><h3 style="margin:0">${t('signup_pending_list')}</h3><span style="flex:1"></span>
    <button class="btn btn-ghost btn-sm" id="signup-refresh">${t('signup_refresh')}</button></div>
    ${signups.length?`<div class="table-wrap"><table><thead><tr><th>${t('student_full_name')}</th><th>${t('username')}</th><th>${t('phone_required')}</th><th>${t('email_optional')}</th><th>${t('dept')}</th><th>${t('stage')}</th><th>${t('actions')}</th></tr></thead><tbody>
      ${signups.map(signup=>`<tr><td>${esc(signup.candidate.name||'')}</td><td>${esc(signup.username)}</td><td>${esc(signup.phone)}</td><td>${esc(signup.candidate.email||'—')}</td><td>${esc(deptLabel(signup.candidate.dept))}</td><td>${esc(String(signup.candidate.stage))}</td><td><div class="row-actions">
        <button class="btn btn-gold btn-sm" data-signup-action="approve" data-signup-phone="${esc(signup.phone)}">${t('signup_approve')}</button>
        <button class="btn btn-danger btn-sm" data-signup-action="reject" data-signup-phone="${esc(signup.phone)}">${t('signup_reject')}</button>
      </div></td></tr>`).join('')}
    </tbody></table></div>`:`<p class="muted">${t('signup_no_pending')}</p>`}
  </div>`;
}
function vAttendance(){
  const grouped=new Map();
  studentList().forEach(student=>(student.attendanceRecords||[]).forEach(record=>{
    if(sess.role==='teacher'&&record.teacherId!==sess.id)return;
    const rows=grouped.get(record.sheetId)||[];
    rows.push({...record,studentName:record.studentName||student.name_en||student.username});
    grouped.set(record.sheetId,rows);
  }));
  const sheets=[...grouped.values()].map(rows=>rows.sort((a,b)=>String(a.studentName).localeCompare(String(b.studentName))))
    .sort((a,b)=>String(b[0].submittedAt||b[0].date).localeCompare(String(a[0].submittedAt||a[0].date)));
  const teacherLink=sess.role==='teacher'?`<p><a class="btn btn-ghost btn-sm" href="teacher.html">${t('teacher_portal')}</a></p>`:'';
  if(!sheets.length)return `<div class="panel"><h3>${t('attendance_admin')}</h3>${teacherLink}<p class="muted">${t('attendance_none')}</p></div>`;
  return `${teacherLink}${sheets.map(rows=>{
    const sheet=rows[0];
    const present=rows.filter(record=>record.status==='present').length;
    return `<section class="panel attendance-admin-sheet">
      <div class="teacher-section-heading"><h3>${esc(sheet.className)} · ${fmtDate(sheet.date)}</h3><span class="tag">${t('stage')} ${esc(String(sheet.stage))}</span></div>
      <p class="muted">${t('attendance_teacher')}: ${esc(sheet.teacherName||'—')} · ${t('attendance_students')}: ${rows.length} · ${t('attendance_present')}: ${present} · ${t('attendance_absent')}: ${rows.length-present}<br>
        ${t('attendance_submitted')}: ${fmtDate(sheet.submittedAt)}</p>
      <div class="table-wrap"><table><thead><tr><th>${t('number')}</th><th>${t('student_name')}</th><th>${t('attendance_status')}</th><th>${t('time_in')}</th><th>${t('time_out')}</th><th>${t('signature')}</th></tr></thead>
      <tbody>${rows.map((record,index)=>`<tr><td>${index+1}</td><td>${esc(record.studentName)}</td>
        <td>${t(record.status==='present'?'attendance_present':'attendance_absent')}</td><td>${esc(record.timeIn||'—')}</td><td>${esc(record.timeOut||'—')}</td><td>${esc(record.signature||'—')}</td></tr>`).join('')}</tbody>
      </table></div>
    </section>`;
  }).join('')}`;
}
function wireStudents(){
  const si=document.getElementById('stu-search');
  si.addEventListener('input',()=>{
    stuQ=si.value;const pos=si.selectionStart;render();
    const n=document.getElementById('stu-search');n.focus();n.setSelectionRange(pos,pos);
  });
  const refresh=document.getElementById('signup-refresh');
  if(refresh)refresh.onclick=async()=>{try{await refreshPendingSignups();render();}catch(error){console.error('Could not load pending student applications:',error);toast(t('signup_admin_error'),false);}};
  document.querySelectorAll('[data-signup-action]').forEach(button=>{
    button.onclick=async()=>{
      button.disabled=true;
      try{
        const {data,error}=await Store.supabase.functions.invoke('manage-student-signup',{body:{action:button.dataset.signupAction,phone:button.dataset.signupPhone}});
        if(error)throw new Error(data?.error||error.message);
        await refreshPendingSignups();
        toast(t(button.dataset.signupAction==='approve'?'signup_approved':'signup_rejected'));
        render();
      }catch(error){console.error('Could not update pending student application:',error);toast(t('signup_admin_error'),false);button.disabled=false;}
    };
  });
}
async function refreshPendingSignups(){
  if(!['owner','admin'].includes(sess.role)||Store.mode!=='supabase')return;
  const {data,error}=await Store.supabase.functions.invoke('manage-student-signup',{body:{action:'list'}});
  if(error)throw new Error(data?.error||error.message);
  Store.data.pendingSignups=data.signups||[];
}
async function saveStudent(){
  const d=Store.data;
  const stu=stuEditId?d.students.find(x=>x.id===stuEditId):null;
  if(stu&&!canManageStudent(stu)){toast(t('shared_read_only'),false);return;}
  const name_en=val('f-name-en'),name_ku=val('f-name-ku'),user=val('f-user').toLowerCase().replace(/\s+/g,''),pass=document.getElementById('f-pass').value;
  if(!name_en||!user||(!stu&&!pass)){toast(t('err_fill'),false);return;}
  if(!stu&&(d.students.some(x=>x.username.toLowerCase()===user)||d.admins.some(a=>(a.username||'').toLowerCase()===user))){toast(t('username_taken'),false);return;}
  const grades=[...document.querySelectorAll('#grade-rows .grade-row')].map(r=>({
    subject:r.querySelector('.g-sub').value.trim(),
    score:Number(r.querySelector('.g-score').value)||0
  })).filter(g=>g.subject);
  const stage=Number(val('f-stage'));
  if((stage<1||stage>5)&&!(stu&&stage===Number(stu.stage))){toast(t('err_fill'),false);return;}
  const phone=val('f-phone').replace(/[ ()-]/g,'');
  if(!stu&&!/^\+[1-9]\d{7,14}$/.test(phone)){toast(t('err_fill'),false);return;}
  const data={name_en,name_ku,dept:val('f-dept'),stage,className:val('f-class'),phone,email:val('f-email'),
    emailOptIn:document.getElementById('f-email-opt-in').checked,smsOptIn:document.getElementById('f-sms-opt-in').checked,
    whatsappOptIn:document.getElementById('f-whatsapp-opt-in').checked,
    dob:val('f-dob'),grades,...(sess.role==='teacher'?{}:{teacherId:val('f-teacher')||sess.id})};
  if(stu){
    Object.assign(stu,data);
    if(pass){
      if(Store.mode==='supabase'){toast(t('reset_hint'),false);return;}
      stu.pass=await hashPass(pass);
    }
    await Store.setDoc('students',stu);
  }else{
    let id=uid('s'),authEmail='';
    if(Store.mode==='supabase'){
      const res=await Auth.createAuthAccount(synEmail(user),pass,'student');
      if(!res.ok){toast(t('username_taken'),false);return;}
      id=res.uid;authEmail=synEmail(user);
    }
    const ns={id,username:user,pass:Store.mode==='supabase'?'':await hashPass(pass),authEmail,teacherId:sess.id,sharedWith:[],attendance:100,attMap:{},...data};
    await Store.setDoc('students',ns);
  }
  showStuForm=false;stuEditId=null;toast(t('saved_ok'));render();
}
function accessRequestsPanel(){
  if(sess.role==='teacher'){
    const outgoing=Store.data.accessRequests.filter(r=>r.requesterId===sess.id);
    const incoming=Store.data.accessRequests.filter(r=>r.ownerId===sess.id&&r.status==='pending');
    return `<div class="panel"><h3>${t('access_requests')}</h3>
      <div class="search-row"><input id="share-username" class="input" placeholder="${t('student_username')}"><button class="btn btn-navy" id="share-request">${t('request_access')}</button></div>
      ${incoming.map(r=>`<div class="row-actions"><span style="flex:1">${esc(r.requesterName)} requests ${esc(r.studentName)}</span><button class="btn btn-gold btn-sm" data-share-approve="${r.id}">${t('approve')}</button><button class="btn btn-danger btn-sm" data-share-deny="${r.id}">${t('del')}</button></div>`).join('')}
      ${outgoing.map(r=>`<p class="muted">${esc(r.studentName)} · ${esc(r.status)}</p>`).join('')}
    </div>`;
  }
  const incoming=Store.data.accessRequests.filter(r=>r.status==='pending'&&(r.ownerId===sess.id||isOwner(sess)||sess.role==='admin'));
  if(!incoming.length)return '';
  return `<div class="panel"><h3>${t('access_requests')}</h3>${incoming.map(r=>`<div class="row-actions"><span style="flex:1">${esc(r.requesterName)} requests ${esc(r.studentName)}</span><button class="btn btn-gold btn-sm" data-share-approve="${r.id}">${t('approve')}</button><button class="btn btn-danger btn-sm" data-share-deny="${r.id}">${t('del')}</button></div>`).join('')}</div>`;
}
async function requestStudentAccess(){
  const username=document.getElementById('share-username').value.trim().toLowerCase();
  if(Store.mode==='supabase'){
    try{
      const result=await Store.functions.httpsCallable('request-student-access')({username});
      Store.data.accessRequests.push({id:result.data.id,...result.data.request});
      toast(t('request_sent'));render();
    }catch(err){toast(t('student_not_found'),false);}
    return;
  }
  const student=Store.data.students.find(s=>s.username.toLowerCase()===username);
  if(!student||!student.teacherId||student.teacherId===sess.id){toast(t('student_not_found'),false);return;}
  if(Store.data.accessRequests.some(r=>r.studentId===student.id&&r.requesterId===sess.id&&r.status==='pending')){toast(t('request_pending'),false);return;}
  const requester=Store.data.admins.find(a=>a.id===sess.id);
  await Store.setDoc('accessRequests',{id:uid('share'),studentId:student.id,studentName:student.name_en,ownerId:student.teacherId,
    requesterId:sess.id,requesterName:requester?.name||sess.id,status:'pending',date:new Date().toISOString()});
  toast(t('request_sent'));render();
}
async function decideStudentAccess(requestId,approved){
  const request=Store.data.accessRequests.find(r=>r.id===requestId);
  if(!request||(request.ownerId!==sess.id&&!isOwner(sess)&&sess.role!=='admin'))return;
  const student=Store.data.students.find(s=>s.id===request.studentId);
  if(approved&&student){student.sharedWith=[...new Set([...(student.sharedWith||[]),request.requesterId])];await Store.setDoc('students',student);}
  request.status=approved?'approved':'declined';await Store.setDoc('accessRequests',request);
  toast(approved?t('share_approved'):t('share_denied'));render();
}
async function issueCert(sid){
  const stu=Store.data.students.find(x=>x.id===sid);if(!stu)return;
  const code='VIS-'+Math.random().toString(36).slice(2,8).toUpperCase();
  await Store.setDoc('certificates',{id:uid('c'),code,studentId:stu.id,studentName_en:stu.name_en,program:stu.dept,date:new Date().toISOString().slice(0,10)});
  toast(t('cert_issued')+' · '+code);
}

/* ---------- posts ---------- */
function vPosts(){
  const d=Store.data;
  const posts=[...d.posts].sort((a,b)=>(b.pinned-a.pinned)||String(b.date).localeCompare(String(a.date)));
  const p=postEditId?d.posts.find(x=>x.id===postEditId):null;
  let form='';
  if(showPostForm){
    form=`<div class="panel"><h3>${p?t('edit'):t('add_post')}</h3>
    <div class="form-grid">
      <div class="field"><label>${t('title_en')}</label><input id="p-title-en" class="input" value="${esc(p?.title_en||'')}"></div>
      <div class="field"><label>${t('title_ku')}</label><input id="p-title-ku" class="input" dir="rtl" value="${esc(p?.title_ku||'')}"></div>
    </div>
    <div class="field"><label>${t('body_en')}</label><textarea id="p-body-en" class="input">${esc(p?.body_en||'')}</textarea></div>
    <div class="field"><label>${t('body_ku')}</label><textarea id="p-body-ku" class="input" dir="rtl">${esc(p?.body_ku||'')}</textarea></div>
    <label class="check" style="margin-bottom:16px"><input type="checkbox" id="p-pinned" ${p&&p.pinned?'checked':''}> ${t('pinned')}</label>
    <div class="row-actions"><button class="btn btn-gold" id="post-save">${t('save')}</button><button class="btn btn-ghost" id="post-cancel">${t('cancel')}</button></div>
    </div>`;
  }
  return form+`<div class="panel">
    <div class="search-row"><h3 style="margin:0">${t('posts')}</h3><span style="flex:1"></span><button class="btn btn-navy" id="post-add">＋ ${t('add_post')}</button></div>
    <div class="table-wrap"><table><thead><tr><th>${t('title_en')}</th><th>${t('date')}</th><th>${t('pinned')}</th><th>${t('actions')}</th></tr></thead><tbody>
    ${posts.map(x=>`<tr>
      <td>${esc(pick({en:x.title_en,ku:x.title_ku})||x.title_en)}</td>
      <td>${fmtDate(x.date)}</td><td>${x.pinned?'📌':''}</td>
      <td><div class="row-actions"><button class="btn btn-ghost btn-sm" data-pedit="${x.id}">${t('edit')}</button><button class="btn btn-danger btn-sm" data-pdel="${x.id}">${t('del')}</button></div></td>
    </tr>`).join('')||`<tr><td colspan="5" class="muted">${t('empty')}</td></tr>`}
    </tbody></table></div></div>`;
}
async function savePost(){
  const d=Store.data;
  const p=postEditId?d.posts.find(x=>x.id===postEditId):null;
  const title_en=val('p-title-en'),title_ku=val('p-title-ku');
  const body_en=document.getElementById('p-body-en').value.trim(),body_ku=document.getElementById('p-body-ku').value.trim();
  if(!title_en&&!title_ku){toast(t('err_fill'),false);return;}
  const pinned=document.getElementById('p-pinned').checked;
  if(p){Object.assign(p,{title_en,title_ku,body_en,body_ku,pinned,type:'announcement'});delete p.storyRole_en;delete p.storyRole_ku;await Store.setDoc('posts',p);}
  else await Store.setDoc('posts',{id:uid('p'),title_en,title_ku,body_en,body_ku,pinned,type:'announcement',date:new Date().toISOString().slice(0,10)});
  showPostForm=false;postEditId=null;toast(t('saved_ok'));render();
}

/* ---------- events ---------- */
function vEvents(){
  const d=Store.data;
  const evs=[...d.events].sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  const p=evEditId?d.events.find(x=>x.id===evEditId):null;
  let form='';
  if(showEvForm){
    form=`<div class="panel"><h3>${p?t('edit'):t('add_event')}</h3>
    <div class="form-grid">
      <div class="field"><label>${t('date')}</label><input id="ev-date" type="date" class="input" value="${esc(p?.date||'')}"></div>
      <div class="field"><label>${t('time')}</label><input id="ev-time" type="time" class="input" value="${esc(p?.time||'')}"></div>
      <div class="field"><label>${t('location')} (EN)</label><input id="ev-loc-en" class="input" value="${esc(p?.location_en||'')}"></div>
      <div class="field"><label>${t('location')} (KU)</label><input id="ev-loc-ku" class="input" dir="rtl" value="${esc(p?.location_ku||'')}"></div>
      <div class="field"><label>${t('title_en')}</label><input id="ev-title-en" class="input" value="${esc(p?.title_en||'')}"></div>
      <div class="field"><label>${t('title_ku')}</label><input id="ev-title-ku" class="input" dir="rtl" value="${esc(p?.title_ku||'')}"></div>
    </div>
    <div class="field"><label>${t('body_en')}</label><textarea id="ev-desc-en" class="input" style="min-height:80px">${esc(p?.desc_en||'')}</textarea></div>
    <div class="field"><label>${t('body_ku')}</label><textarea id="ev-desc-ku" class="input" dir="rtl" style="min-height:80px">${esc(p?.desc_ku||'')}</textarea></div>
    <div class="row-actions"><button class="btn btn-gold" id="ev-save">${t('save')}</button><button class="btn btn-ghost" id="ev-cancel">${t('cancel')}</button></div>
    </div>`;
  }
  return form+`<div class="panel">
    <div class="search-row"><h3 style="margin:0">${t('ev_m')}</h3><span style="flex:1"></span><button class="btn btn-navy" id="ev-add">＋ ${t('add_event')}</button></div>
    <div class="table-wrap"><table><thead><tr><th>${t('date')}</th><th>${t('title_en')}</th><th>${t('location')}</th><th>${t('actions')}</th></tr></thead><tbody>
    ${evs.map(x=>`<tr><td>${fmtDate(x.date)} ${x.time?esc(x.time):''}</td>
      <td>${esc(pick({en:x.title_en,ku:x.title_ku})||x.title_en)}</td>
      <td>${esc(pick({en:x.location_en,ku:x.location_ku})||x.location_en||'')}</td>
      <td><div class="row-actions"><button class="btn btn-ghost btn-sm" data-eedit="${x.id}">${t('edit')}</button><button class="btn btn-danger btn-sm" data-edel="${x.id}">${t('del')}</button></div></td></tr>`).join('')||`<tr><td colspan="4" class="muted">${t('empty')}</td></tr>`}
    </tbody></table></div></div>`;
}
async function saveEvent(){
  const d=Store.data;
  const p=evEditId?d.events.find(x=>x.id===evEditId):null;
  const date=val('ev-date');
  const title_en=val('ev-title-en'),title_ku=val('ev-title-ku');
  if(!date||(!title_en&&!title_ku)){toast(t('err_fill'),false);return;}
  const data={date,time:val('ev-time'),location_en:val('ev-loc-en'),location_ku:val('ev-loc-ku'),
    title_en,title_ku,desc_en:document.getElementById('ev-desc-en').value.trim(),desc_ku:document.getElementById('ev-desc-ku').value.trim()};
  if(p){Object.assign(p,data);await Store.setDoc('events',p);}
  else await Store.setDoc('events',{id:uid('e'),...data});
  showEvForm=false;evEditId=null;toast(t('saved_ok'));render();
}

/* ---------- programs ---------- */
function vPrograms(){
  const d=Store.data;
  const p=progEditId?d.programs.find(x=>x.id===progEditId):null;
  let form='';
  if(showProgForm){
    form=`<div class="panel"><h3>${p?t('edit'):t('add_program')}</h3>
    <div class="form-grid">
      <div class="field"><label>${t('title_en')}</label><input id="g-title-en" class="input" value="${esc(p?.title_en||'')}"></div>
      <div class="field"><label>${t('title_ku')}</label><input id="g-title-ku" class="input" dir="rtl" value="${esc(p?.title_ku||'')}"></div>
    </div>
    <div class="field"><label>${t('desc_en')}</label><textarea id="g-desc-en" class="input">${esc(p?.desc_en||'')}</textarea></div>
    <div class="field"><label>${t('desc_ku')}</label><textarea id="g-desc-ku" class="input" dir="rtl">${esc(p?.desc_ku||'')}</textarea></div>
    <p class="muted" style="margin-bottom:14px">${t('official_details_hint')}</p>
    <div class="form-grid">
      <div class="field"><label>${t('courses_en')}</label><textarea id="g-courses-en" class="input">${esc(p?.courses_en||'')}</textarea></div>
      <div class="field"><label>${t('courses_ku')}</label><textarea id="g-courses-ku" class="input" dir="rtl">${esc(p?.courses_ku||'')}</textarea></div>
      <div class="field"><label>${t('duration_en')}</label><input id="g-duration-en" class="input" value="${esc(p?.duration_en||'')}"></div>
      <div class="field"><label>${t('duration_ku')}</label><input id="g-duration-ku" class="input" dir="rtl" value="${esc(p?.duration_ku||'')}"></div>
      <div class="field"><label>${t('certificate_en')}</label><input id="g-certificate-en" class="input" value="${esc(p?.certificate_en||'')}"></div>
      <div class="field"><label>${t('certificate_ku')}</label><input id="g-certificate-ku" class="input" dir="rtl" value="${esc(p?.certificate_ku||'')}"></div>
      <div class="field"><label>${t('careers_en')}</label><textarea id="g-careers-en" class="input">${esc(p?.careers_en||'')}</textarea></div>
      <div class="field"><label>${t('careers_ku')}</label><textarea id="g-careers-ku" class="input" dir="rtl">${esc(p?.careers_ku||'')}</textarea></div>
    </div>
    <div class="field" style="max-width:160px"><label>${t('icon')}</label><input id="g-icon" class="input" value="${esc(p?.icon||'🎓')}"></div>
    <div class="row-actions"><button class="btn btn-gold" id="prog-save">${t('save')}</button><button class="btn btn-ghost" id="prog-cancel">${t('cancel')}</button></div>
    </div>`;
  }
  return form+`<div class="panel">
    <div class="search-row"><h3 style="margin:0">${t('programs_m')}</h3><span style="flex:1"></span><button class="btn btn-navy" id="prog-add">＋ ${t('add_program')}</button></div>
    <div class="table-wrap"><table><thead><tr><th>${t('icon')}</th><th>${t('title_en')}</th><th>${t('actions')}</th></tr></thead><tbody>
    ${d.programs.map(x=>`<tr><td style="font-size:1.3rem">${esc(x.icon||'🎓')}</td><td>${esc(pick({en:x.title_en,ku:x.title_ku})||x.title_en)}</td>
      <td><div class="row-actions"><button class="btn btn-ghost btn-sm" data-gedit="${x.id}">${t('edit')}</button><button class="btn btn-danger btn-sm" data-gdel="${x.id}">${t('del')}</button></div></td></tr>`).join('')}
    </tbody></table></div></div>`;
}
async function saveProgram(){
  const d=Store.data;
  const p=progEditId?d.programs.find(x=>x.id===progEditId):null;
  const title_en=val('g-title-en'),title_ku=val('g-title-ku');
  const desc_en=document.getElementById('g-desc-en').value.trim(),desc_ku=document.getElementById('g-desc-ku').value.trim();
  const icon=val('g-icon')||'🎓';
  if(!title_en&&!title_ku){toast(t('err_fill'),false);return;}
  const details={
    courses_en:document.getElementById('g-courses-en').value.trim(),courses_ku:document.getElementById('g-courses-ku').value.trim(),
    duration_en:val('g-duration-en'),duration_ku:val('g-duration-ku'),
    certificate_en:val('g-certificate-en'),certificate_ku:val('g-certificate-ku'),
    careers_en:document.getElementById('g-careers-en').value.trim(),careers_ku:document.getElementById('g-careers-ku').value.trim()
  };
  if(p){Object.assign(p,{title_en,title_ku,desc_en,desc_ku,icon,...details});await Store.setDoc('programs',p);}
  else await Store.setDoc('programs',{id:uid('pr'),title_en,title_ku,desc_en,desc_ku,icon,...details});
  showProgForm=false;progEditId=null;toast(t('saved_ok'));render();
}

/* ---------- gallery ---------- */
let galTmp=null;
function vGallery(){
  const d=Store.data;
  let form='';
  if(showGalForm){
    form=`<div class="panel"><h3>${t('upload_img')}</h3>
    <label class="drop" id="gal-drop">${t('drop_hint')}<input type="file" id="gal-file" accept="image/*"></label>
    <div id="gal-preview" style="margin-top:14px"></div>
    <div class="form-grid" style="margin-top:14px">
      <div class="field"><label>${t('caption_en')}</label><input id="gal-cap-en" class="input"></div>
      <div class="field"><label>${t('caption_ku')}</label><input id="gal-cap-ku" class="input" dir="rtl"></div>
    </div>
    <div class="row-actions"><button class="btn btn-gold" id="gal-save">${t('save')}</button><button class="btn btn-ghost" id="gal-cancel">${t('cancel')}</button></div>
    </div>`;
  }
  return form+`<div class="panel">
    <div class="search-row"><h3 style="margin:0">${t('gal_m')}</h3><span style="flex:1"></span><button class="btn btn-navy" id="gal-add">＋ ${t('upload_img')}</button></div>
    <p class="muted">${t('gallery_photo_note')}</p>
    <div class="gallery-grid" style="margin-top:10px">
    ${d.gallery.map(g=>`<figure class="gallery-item" style="box-shadow:none;border:1px solid var(--line)">
      <img src="${esc(g.url)}" alt="">
      <figcaption>${esc(pick({en:g.caption_en,ku:g.caption_ku})||'')}
        <button class="btn btn-danger btn-sm" data-gldel="${g.id}" style="position:absolute;top:10px;inset-inline-end:10px">✕</button>
      </figcaption></figure>`).join('')||`<p class="muted">${t('no_gallery')}</p>`}
    </div></div>`;
}
function wireGallery(){
  const fi=document.getElementById('gal-file');
  if(!fi)return;
  fi.addEventListener('change',()=>{
    const f=fi.files[0];if(!f)return;
    if(f.size>900*1024&&Store.mode==='local'){toast(t('drop_hint'),false);return;}
    const r=new FileReader();
    r.onload=()=>{galTmp=r.result;document.getElementById('gal-preview').innerHTML=`<img src="${galTmp}" style="max-width:260px;border-radius:12px">`;};
    r.readAsDataURL(f);
  });
}
async function saveGallery(){
  if(!galTmp){toast(t('err_fill'),false);return;}
  const id=uid('g');
  let url=galTmp;
  if(Store.mode==='supabase'){
    try{
      const ref=Store.storage.ref('gallery/'+id+'.jpg');
      await ref.putString(galTmp,'data_url');
      url=await ref.getDownloadURL();
    }catch(e){toast(t('pdf_fail'),false);return;}
  }
  await Store.setDoc('gallery',{id,url,caption_en:val('gal-cap-en'),caption_ku:val('gal-cap-ku'),date:new Date().toISOString().slice(0,10)});
  galTmp=null;showGalForm=false;toast(t('saved_ok'));render();
}

/* ---------- notifications ---------- */
function vNotifs(){
  const d=Store.data;
  const list=[...d.notifications].sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  let form='';
  if(showNotifForm){
    form=`<div class="panel"><h3>${t('send_notif')}</h3>
    <div class="form-grid">
      <div class="field"><label>${t('title_en')}</label><input id="n-title-en" class="input"></div>
      <div class="field"><label>${t('title_ku')}</label><input id="n-title-ku" class="input" dir="rtl"></div>
    </div>
    <div class="field"><label>${t('body_en')}</label><textarea id="n-body-en" class="input" style="min-height:80px"></textarea></div>
    <div class="field"><label>${t('body_ku')}</label><textarea id="n-body-ku" class="input" dir="rtl" style="min-height:80px"></textarea></div>
    <div class="row-actions"><button class="btn btn-gold" id="notif-send">${t('send_notif')}</button><button class="btn btn-ghost" id="notif-cancel">${t('cancel')}</button></div>
    </div>`;
  }
  return form+`<div class="panel">
    <div class="search-row"><h3 style="margin:0">${t('notifs')}</h3><span style="flex:1"></span><button class="btn btn-navy" id="notif-add">＋ ${t('send_notif')}</button></div>
    <div class="table-wrap"><table><thead><tr><th>${t('title_en')}</th><th>${t('date')}</th><th>${t('actions')}</th></tr></thead><tbody>
    ${list.map(x=>`<tr><td>${esc(pick({en:x.title_en,ku:x.title_ku})||x.title_en)}</td><td>${fmtDate(x.date)}</td>
      <td><button class="btn btn-danger btn-sm" data-ndel="${x.id}">${t('del')}</button></td></tr>`).join('')||`<tr><td colspan="3" class="muted">${t('empty')}</td></tr>`}
    </tbody></table></div></div>`;
}
async function sendNotif(){
  const title_en=val('n-title-en'),title_ku=val('n-title-ku');
  if(!title_en&&!title_ku){toast(t('err_fill'),false);return;}
  await Store.setDoc('notifications',{id:uid('n'),title_en,title_ku,
    body_en:document.getElementById('n-body-en').value.trim(),body_ku:document.getElementById('n-body-ku').value.trim(),
    date:new Date().toISOString().slice(0,10),audience:'students'});
  showNotifForm=false;toast(t('notif_sent'));render();
}

/* ---------- messages ---------- */
function vMsgs(){
  const d=Store.data;
  const list=[...d.messages].sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  if(!list.length)return `<div class="panel"><h3>${t('msgs')}</h3><p class="muted">${t('empty')}</p></div>`;
  return `<div class="panel">
    <div class="search-row"><h3 style="margin:0">${t('msgs')}</h3><span style="flex:1"></span><button class="btn btn-ghost btn-sm" id="ex-msg2">⬇ ${t('export_msgs')}</button></div>
    <div class="table-wrap"><table><thead><tr><th>${t('msg_from')}</th><th>${t('email')}</th><th>${t('your_message')}</th><th>${t('msg_date')}</th><th>${t('actions')}</th></tr></thead><tbody>
    ${list.map(m=>`<tr style="${m.read?'':'font-weight:700'}">
      <td>${esc(m.name)}${m.read?'':` <span class="tag gold">${t('unread')}</span>`}</td>
      <td>${esc(m.email)}${m.phone?`<br><small class="muted">${esc(m.phone)}</small>`:''}</td>
      <td style="max-width:280px;white-space:pre-wrap">${esc(m.message)}</td>
      <td>${fmtDate(m.date)}</td>
      <td><div class="row-actions">
        <button class="btn btn-ghost btn-sm" data-mread="${m.id}">${m.read?t('read'):t('mark_read')}</button>
        <button class="btn btn-danger btn-sm" data-mdel="${m.id}">${t('del')}</button>
      </div></td></tr>`).join('')}
    </tbody></table></div></div>`;
}

/* ---------- certificates ---------- */
function vCerts(){
  const d=Store.data;
  const list=[...d.certificates].sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  return `<div class="panel">
    <div class="search-row"><h3 style="margin:0">${t('certs')}</h3><span class="muted" style="font-size:.85rem">${t('gen_cert')} ← ${t('students')}</span></div>
    <div class="table-wrap"><table><thead><tr><th>${t('code')}</th><th>${t('holder')}</th><th>${t('program')}</th><th>${t('issued')}</th><th>${t('actions')}</th></tr></thead><tbody>
    ${list.map(c=>{
      const stu=d.students.find(s=>s.id===c.studentId);
      return `<tr><td><b>${esc(c.code)}</b></td>
      <td>${esc(stu?((Vis.lang==='ku'&&stu.name_ku)?stu.name_ku:stu.name_en):c.studentName_en||'')}</td>
      <td><span class="tag">${esc((DEPTS[c.program]&&DEPTS[c.program][Vis.lang])||c.program||'')}</span></td>
      <td>${fmtDate(c.date)}</td>
      <td><div class="row-actions">
        <button class="btn btn-ghost btn-sm" data-ccopy="${esc(c.code)}">${t('copy')}</button>
        <button class="btn btn-danger btn-sm" data-cdel="${c.id}">${t('del')}</button>
      </div></td></tr>`;
    }).join('')||`<tr><td colspan="5" class="muted">${t('empty')}</td></tr>`}
    </tbody></table></div></div>`;
}

/* ---------- site content & socials ---------- */
function vContent(){
  const s=Store.data.settings;
  const setting=(field,key,language=Vis.lang)=>esc(s[field]||(language==='ku'?I18N.ku[key]:I18N.en[key])||'');
  return `<div class="panel"><h3>${t('content')}</h3>
  <div class="form-grid">
    <div class="field"><label>${t('site_name')} (EN)</label><input id="c-site-name-en" class="input" value="${esc(s.siteName_en||'')}"></div>
    <div class="field"><label>${t('site_name')} (KU)</label><input id="c-site-name-ku" class="input" dir="rtl" value="${esc(s.siteName_ku||'')}"></div>
    <div class="field"><label>${t('stats_since')}</label><input id="c-since" class="input" maxlength="20" value="${esc(s.since||'')}"></div>
  </div>
  <div class="form-grid">
    <div class="field"><label>${t('hero_title_l')} (EN)</label><input id="c-hero-en" class="input" value="${esc(s.heroTitle_en)}"></div>
    <div class="field"><label>${t('hero_title_l')} (KU)</label><input id="c-hero-ku" class="input" dir="rtl" value="${esc(s.heroTitle_ku)}"></div>
    <div class="field"><label>${t('hero_sub_l')} (EN)</label><textarea id="c-sub-en" class="input" style="min-height:80px">${esc(s.heroSub_en)}</textarea></div>
    <div class="field"><label>${t('hero_sub_l')} (KU)</label><textarea id="c-sub-ku" class="input" dir="rtl" style="min-height:80px">${esc(s.heroSub_ku)}</textarea></div>
  </div>
  <div class="field"><label>${t('about_l')} (EN)</label><textarea id="c-about-en" class="input">${esc(s.about_en)}</textarea></div>
  <div class="field"><label>${t('about_l')} (KU)</label><textarea id="c-about-ku" class="input" dir="rtl">${esc(s.about_ku)}</textarea></div>
  <h4>${t('why_title')}</h4>
  <div class="form-grid">
    <div class="field"><label>${t('why_title')} (EN)</label><input id="c-why-title-en" class="input" value="${setting('whyTitle_en','why_title','en')}"></div>
    <div class="field"><label>${t('why_title')} (KU)</label><input id="c-why-title-ku" class="input" dir="rtl" value="${setting('whyTitle_ku','why_title','ku')}"></div>
    ${[1,2,3,4].map(number=>`<div class="field"><label>${t('why_'+number)} (EN)</label><input id="c-why-${number}-en" class="input" value="${setting(`why${number}_en`,`why_${number}`,'en')}"></div><div class="field"><label>${t('why_'+number)} (KU)</label><input id="c-why-${number}-ku" class="input" dir="rtl" value="${setting(`why${number}_ku`,`why_${number}`,'ku')}"></div>`).join('')}
  </div>
  <h4>${t('faq_title')}</h4>
  <div class="form-grid">
    <div class="field"><label>${t('faq_title')} (EN)</label><input id="c-faq-title-en" class="input" value="${setting('faqTitle_en','faq_title','en')}"></div>
    <div class="field"><label>${t('faq_title')} (KU)</label><input id="c-faq-title-ku" class="input" dir="rtl" value="${setting('faqTitle_ku','faq_title','ku')}"></div>
    ${[1,2,3,4].map(number=>`<div class="field"><label>${t('faq_q'+number)} (EN)</label><input id="c-faq-q${number}-en" class="input" value="${setting(`faqQ${number}_en`,`faq_q${number}`,'en')}"></div><div class="field"><label>${t('faq_q'+number)} (KU)</label><input id="c-faq-q${number}-ku" class="input" dir="rtl" value="${setting(`faqQ${number}_ku`,`faq_q${number}`,'ku')}"></div><div class="field"><label>${t('faq_a'+number)} (EN)</label><textarea id="c-faq-a${number}-en" class="input">${setting(`faqA${number}_en`,`faq_a${number}`,'en')}</textarea></div><div class="field"><label>${t('faq_a'+number)} (KU)</label><textarea id="c-faq-a${number}-ku" class="input" dir="rtl">${setting(`faqA${number}_ku`,`faq_a${number}`,'ku')}</textarea></div>`).join('')}
  </div>
  <div class="form-grid">
    <div class="field"><label>${t('address_l')} (EN)</label><input id="c-addr-en" class="input" value="${esc(s.address_en)}"></div>
    <div class="field"><label>${t('address_l')} (KU)</label><input id="c-addr-ku" class="input" dir="rtl" value="${esc(s.address_ku)}"></div>
    <div class="field"><label>${t('phone')}</label><input id="c-phone" class="input" value="${esc(s.phone)}"></div>
    <div class="field"><label>${t('email')}</label><input id="c-email" class="input" value="${esc(s.email)}"></div>
    <div class="field"><label>${t('office_hours_en')}</label><input id="c-hours-en" class="input" value="${esc(s.officeHours_en||'')}"></div>
    <div class="field"><label>${t('office_hours_ku')}</label><input id="c-hours-ku" class="input" dir="rtl" value="${esc(s.officeHours_ku||'')}"></div>
    <div class="field"><label>${t('analytics_id')}</label><input id="c-analytics-id" class="input" dir="ltr" maxlength="32" placeholder="G-XXXXXXXXXX" value="${esc(s.analyticsId||'')}"><small class="muted">${t('analytics_consent_note')}</small></div>
  </div>
  <button class="btn btn-gold" id="c-save">${t('save')}</button></div>`;
}
function vSocials(){
  const so=Store.data.settings.socials||{};
  const row=k=>`<div class="field"><label style="text-transform:capitalize">${k}</label><input id="s-${k}" class="input" dir="ltr" placeholder="https://…" value="${esc(so[k]||'')}"></div>`;
  return `<div class="panel"><h3>${t('socials')}</h3><p class="muted" style="margin-bottom:16px;font-size:.9rem">${t('soc_hint')}</p>
  <div class="form-grid">${['facebook','instagram','youtube','telegram','whatsapp'].map(row).join('')}</div>
  <button class="btn btn-gold" id="s-save">${t('save')}</button></div>`;
}

/* ---------- staff accounts (owner only) ---------- */
function vStaff(){
  const accounts=Store.data.admins.filter(account=>account.role!=='owner');
  const editing=staffEditId?accounts.find(account=>account.id===staffEditId):null;
  const roleName=role=>t(role==='content_editor'?'content_editor_role':role);
  return `<div class="panel"><div class="search-row"><div><h3 style="margin:0">${t('staff_accounts')}</h3><p class="muted">${t('staff_accounts_hint')}</p></div><span style="flex:1"></span><span class="tag">${accounts.length}</span></div>
    <div class="table-wrap"><table><thead><tr><th>${t('username')}</th><th>${t('admin_name')}</th><th>${t('email')}</th><th>${t('role')}</th><th>${t('actions')}</th></tr></thead><tbody>
    ${accounts.map(account=>`<tr><td>${esc(account.username||'')}</td><td>${esc(account.name||'')}</td><td>${esc(account.email||'')}</td><td><span class="tag">${roleName(account.role)}</span></td><td><button class="btn btn-ghost btn-sm" data-aedit="${esc(account.id)}">${t('edit')}</button></td></tr>`).join('')||`<tr><td colspan="5" class="muted">${t('teacher_accounts_empty')}</td></tr>`}
    </tbody></table></div></div>
    <div class="panel"><h3>${editing?t('edit'):t('add_staff')}</h3><p class="muted">${editing?t('staff_edit_hint'):t('staff_accounts_hint')}</p>
    <div class="form-grid">
      <div class="field"><label>${t('admin_name')}</label><input id="a-name" class="input" autocomplete="name" value="${esc(editing?.name||'')}" required></div>
      ${editing?`<div class="field"><label>${t('username')}</label><input class="input" value="${esc(editing.username||'')}" readonly></div>
      <div class="field"><label>${t('email')}</label><input class="input" value="${esc(editing.email||'')}" readonly></div>`:`<div class="field"><label>${t('username')}</label><input id="a-user" class="input" autocomplete="off" required></div>
      <div class="field"><label>${t('password')}</label><div class="password-input-wrap"><input id="a-pass" type="password" class="input" autocomplete="new-password" minlength="6" required><button class="password-toggle" type="button" data-password-target="a-pass" data-i18n="show_password" aria-label="${t('show_password')}">${t('show_password')}</button></div></div>`}
      <div class="field"><label>${t('role')}</label><select id="a-role" class="input"><option value="teacher" ${editing?.role==='teacher'?'selected':''}>${t('teacher')}</option><option value="admin" ${editing?.role==='admin'?'selected':''}>${t('admin')}</option><option value="content_editor" ${editing?.role==='content_editor'?'selected':''}>${t('content_editor_role')}</option></select></div>
    </div>
    <div class="row-actions"><button class="btn btn-gold" id="${editing?'a-save':'a-add'}">${editing?t('save'):t('add_staff')}</button>${editing?`<button class="btn btn-ghost" id="a-cancel">${t('cancel')}</button>`:''}</div></div>`;
}
async function saveStaff(){
  const d=Store.data;
  const name=val('a-name'),username=staffEditId?d.admins.find(account=>account.id===staffEditId)?.username:val('a-user').toLowerCase().replace(/\s+/g,''),pass=staffEditId?'':val('a-pass');
  const role=val('a-role');
  if(staffEditId){
    const account=d.admins.find(item=>item.id===staffEditId);
    if(!account||account.role==='owner'||!name||!['teacher','admin','content_editor'].includes(role)){toast(t('err_fill'),false);return;}
    await Store.setDoc('admins',{...account,name,role});
    staffEditId=null;toast(t('saved_ok'));render();return;
  }
  if(!name||!username||username.includes('@')||pass.length<6){toast(t('err_fill'),false);return;}
  if(!['teacher','admin','content_editor'].includes(role)){toast(t('err_fill'),false);return;}
  if(d.admins.some(a=>(a.username||'').toLowerCase()===username||(a.email||'').toLowerCase()===username)
    ||d.students.some(s=>(s.username||'').toLowerCase()===username)){toast(t('username_taken'),false);return;}
  const email=synEmail(username);
  let id=uid('a');
  if(Store.mode==='supabase'){
    const res=await Auth.createAuthAccount(email,pass,role);
    if(!res.ok){toast(res.error||t('username_taken'),false);return;}
    id=res.uid;
  }else{
    await Store.setDoc('admins',{id,email,username,pass:await hashPass(pass),name,role});toast(t('saved_ok'));render();return;
  }
  await Store.setDoc('admins',{id,email,username,pass:'',name,role});
  toast(t('saved_ok'));render();
}

/* ---------- account ---------- */
function vAccount(){
  const a=Store.data.admins.find(x=>x.id===sess.id);
  return `<div class="panel"><h3>${t('account')}</h3>
  <p class="muted" style="margin-bottom:16px">${esc(a.name)} · ${esc(a.email)} · <span class="tag ${a.role==='owner'?'gold':''}">${t(a.role==='content_editor'?'content_editor_role':a.role)}</span></p>
  <div class="form-grid">
    <div class="field"><label>${t('current_pw')}</label><div class="password-input-wrap"><input id="pw-cur" type="password" class="input"><button class="password-toggle" type="button" data-password-target="pw-cur" data-i18n="show_password" aria-label="${t('show_password')}">${t('show_password')}</button></div></div>
    <div class="field"><label>${t('new_pw')}</label><div class="password-input-wrap"><input id="pw-new" type="password" class="input"><button class="password-toggle" type="button" data-password-target="pw-new" data-i18n="show_password" aria-label="${t('show_password')}">${t('show_password')}</button></div></div>
  </div>
  <button class="btn btn-gold" id="acct-save">${t('update')}</button></div>`;
}
async function changePw(){
  const a=Store.data.admins.find(x=>x.id===sess.id);if(!a)return;
  const cur=val('pw-cur'),np=val('pw-new');
  if(np.length<6){toast(t('pw_short'),false);return;}
  if(Store.mode==='supabase'){
    try{await Auth.changePassword(a.email,cur,np);}catch(e){toast(t('wrong_current'),false);return;}
  }else{
    if(a.pass!==await hashPass(cur)){toast(t('wrong_current'),false);return;}
    a.pass=await hashPass(np);await Store.setDoc('admins',a);
  }
  toast(t('pw_changed'));render();
}

/* ---------- CSV exports ---------- */
function exportStudents(){
  const rows=[[t('username'),t('name_en'),t('name_ku'),t('dept'),t('stage'),t('class_name'),t('phone_l'),t('email'),t('dob'),t('attendance')+' %']];
  studentList().forEach(s=>rows.push([s.username,s.name_en,s.name_ku,(DEPTS[s.dept]&&DEPTS[s.dept].en)||s.dept,s.stage,s.className,s.phone,s.email,s.dob,s.attendance??100]));
  downloadCSV('vis_students.csv',rows);
}
function exportGrades(){
  const rows=[[t('username'),t('name_en'),t('subject'),t('score')]];
  studentList().forEach(s=>(s.grades||[]).forEach(g=>rows.push([s.username,s.name_en,g.subject,g.score])));
  downloadCSV('vis_grades.csv',rows);
}
function exportAtt(){
  const rows=[[t('username'),t('name_en'),t('class_name'),t('date'),t('attendance'),t('time_in'),t('time_out'),t('signature')]];
  studentList().forEach(s=>{
    const records=s.attendanceRecords||[];
    if(records.length)records.forEach(record=>rows.push([s.username,s.name_en,record.className,record.date,record.status,record.timeIn,record.timeOut,record.signature]));
    else Object.entries(s.attMap||{}).forEach(([date,status])=>rows.push([s.username,s.name_en,s.className,date,status,'','','']));
  });
  downloadCSV('vis_attendance.csv',rows);
}
function exportMsgs(){
  const rows=[[t('your_name'),t('email'),t('phone_l'),t('msg_date'),t('read'),t('your_message')]];
  Store.data.messages.forEach(m=>rows.push([m.name,m.email,m.phone,m.date,m.read?'1':'0',m.message]));
  downloadCSV('vis_messages.csv',rows);
}

/* ---------- global click delegation ---------- */
document.getElementById('tab-content').addEventListener('click',async e=>{
  if(await VisExtended.handleAdminClick(e,render))return;
  const q=s=>e.target.closest(s);let b;
  if(b=q('#sc-add')){showScheduleForm=true;scheduleEditId=null;render();return;}
  if(b=q('[data-instedit]')){instructorEditId=b.dataset.instedit;render();return;}
  if(b=q('[data-instdel]')){if(confirm(t('confirm_del'))){await Store.del('instructors',b.dataset.instdel);toast(t('deleted_ok'));render();}return;}
  if(b=q('#inst-save')){await runManagerSave(saveInstructor);return;}
  if(b=q('#inst-cancel')){instructorEditId=null;render();return;}
  if(b=q('[data-resource-download]')){
    const resource=Store.data.resources.find(item=>item.id===b.dataset.resourceDownload);
    if(resource)try{await Store.downloadResourceFile(resource);}
    catch(error){console.error('Could not download private handbook:',error);toast(t('resource_download_error'),false);}
    return;
  }
  if(b=q('[data-resource-edit]')){resourceEditId=b.dataset.resourceEdit;render();return;}
  if(b=q('[data-resource-delete]')){
    const resource=Store.data.resources.find(item=>item.id===b.dataset.resourceDelete);
    if(resource&&(canManagePublicContent()||resource.addedBy===sess.id)&&confirm(t('confirm_del'))){
      await runManagerSave(async()=>{
        await Store.deleteResourceFile(resource.filePath);
        await Store.del('resources',resource.id);
        toast(t('deleted_ok'));render();
      });
      document.getElementById('tab-content').addEventListener('change',VisExtended.handleAdminChange);
    }
    return;
  }
  if(b=q('#resource-save')){await saveResource();return;}
  if(b=q('#resource-cancel')){resourceEditId=null;render();return;}
  if(b=q('#sc-cancel')){showScheduleForm=false;scheduleEditId=null;render();return;}
  if(b=q('#sc-save')){await saveSchedule();return;}
  if(b=q('[data-schedit]')){scheduleEditId=b.dataset.schedit;showScheduleForm=true;render();return;}
  if(b=q('[data-schdel]')){if(confirm(t('confirm_del'))){await Store.del('schedule',b.dataset.schdel);toast(t('deleted_ok'));render();}return;}
  if(b=q('[data-learning-mode]')){learningMode=b.dataset.learningMode;showAssignmentForm=showMaterialForm=false;assignmentEditId=materialEditId=null;render();return;}
  if(b=q('#as-add')){showAssignmentForm=true;assignmentEditId=null;render();return;}
  if(b=q('#as-cancel')){showAssignmentForm=false;assignmentEditId=null;render();return;}
  if(b=q('#as-save')){await saveAssignment();return;}
  if(b=q('[data-asedit]')){assignmentEditId=b.dataset.asedit;showAssignmentForm=true;render();return;}
  if(b=q('[data-asdel]')){if(confirm(t('confirm_del'))){await Store.del('assignments',b.dataset.asdel);toast(t('deleted_ok'));render();}return;}
  if(b=q('#mat-add')){showMaterialForm=true;materialEditId=null;render();return;}
  if(b=q('#mat-cancel')){showMaterialForm=false;materialEditId=null;render();return;}
  if(b=q('#mat-save')){await saveMaterial();return;}
  if(b=q('[data-matedit]')){materialEditId=b.dataset.matedit;showMaterialForm=true;render();return;}
  if(b=q('[data-matdel]')){if(confirm(t('confirm_del'))){await Store.del('materials',b.dataset.matdel);toast(t('deleted_ok'));render();}return;}
  if(b=q('[data-subdownload]')){
    const submission=Store.data.submissions.find(x=>x.id===b.dataset.subdownload);
    if(submission)try{await Store.downloadSubmission(submission);}catch(err){toast(t('file_read_error'),false);}
    return;
  }
  if(b=q('#share-request')){await requestStudentAccess();return;}
  if(b=q('[data-share-approve]')){await decideStudentAccess(b.dataset.shareApprove,true);return;}
  if(b=q('[data-share-deny]')){await decideStudentAccess(b.dataset.shareDeny,false);return;}
  if(b=q('[data-sedit]')){stuEditId=b.dataset.sedit;showStuForm=true;render();window.scrollTo({top:0,behavior:'smooth'});return;}
  if(b=q('[data-srpw]')){
    const stu=Store.data.students.find(x=>x.id===b.dataset.srpw);if(!stu)return;
    if(Store.mode==='supabase'){
      if(stu.email&&/.+@.+\..+/.test(stu.email)){
        try{
          await Store.functions.httpsCallable('send-student-password-reset')({
            studentId:stu.id,redirectTo:new URL('login.html?reset=1',location.href).href
          });
          toast(t('msg_sent'));
        }catch(error){toast(error.message||t('reset_hint'),false);}
      }else toast(t('reset_hint'),false);
    }else{
      const p=prompt(t('new_pw'));
      if(p&&p.length>=6){stu.pass=await hashPass(p);await Store.setDoc('students',stu);toast(t('pw_changed'));}
    }
    return;
  }
  if(b=q('[data-satt]')){stuAttId=b.dataset.satt;showStuForm=false;const d2=new Date();attView={y:d2.getFullYear(),m:d2.getMonth()};render();return;}
  if(b=q('#att-close')){stuAttId=null;render();return;}
  if(b=q('[data-marktoday]')){
    const [day,st]=b.dataset.marktoday.split(':');
    const stu=Store.data.students.find(x=>x.id===stuAttId);if(!stu)return;
    stu.attMap=stu.attMap||{};stu.attMap[day]=stu.attMap[day]==='present'&&st==='present'?undefined:st;
    if(stu.attMap[day]===undefined)delete stu.attMap[day];
    recalcAttendance(stu);await Store.setDoc('students',stu);render();
    return;
  }
  if(b=q('.cal-nav')){
    attView.m+=Number(b.dataset.calnav);
    if(attView.m<0){attView.m=11;attView.y--;}if(attView.m>11){attView.m=0;attView.y++;}
    render();return;
  }
  if(b=q('.cal-cell[data-day]')&&!b.disabled){
    const day=b.dataset.day;
    const stu=Store.data.students.find(x=>x.id===stuAttId);if(!stu)return;
    stu.attMap=stu.attMap||{};
    stu.attMap[day]=stu.attMap[day]==='present'?'absent':(stu.attMap[day]==='absent'?undefined:'present');
    if(stu.attMap[day]===undefined)delete stu.attMap[day];
    recalcAttendance(stu);await Store.setDoc('students',stu);render();
    return;
  }
  if(b=q('[data-scert]')){await issueCert(b.dataset.scert);return;}
  if(b=q('[data-ccopy]')){try{await navigator.clipboard.writeText(b.dataset.ccopy);}catch(err){}toast(t('copied'));return;}
  if(b=q('[data-cdel]')){if(confirm(t('confirm_del'))){await Store.del('certificates',b.dataset.cdel);toast(t('deleted_ok'));render();}return;}
  if(b=q('[data-pedit]')){postEditId=b.dataset.pedit;showPostForm=true;render();return;}
  if(b=q('[data-pdel]')){if(confirm(t('confirm_del'))){await Store.del('posts',b.dataset.pdel);toast(t('deleted_ok'));render();}return;}
  if(b=q('[data-eedit]')){evEditId=b.dataset.eedit;showEvForm=true;render();return;}
  if(b=q('[data-edel]')){if(confirm(t('confirm_del'))){await Store.del('events',b.dataset.edel);toast(t('deleted_ok'));render();}return;}
  if(b=q('[data-gedit]')){progEditId=b.dataset.gedit;showProgForm=true;render();return;}
  if(b=q('[data-gdel]')){if(confirm(t('confirm_del'))){await Store.del('programs',b.dataset.gdel);toast(t('deleted_ok'));render();}return;}
  if(b=q('[data-gldel]')){if(confirm(t('confirm_del'))){await Store.del('gallery',b.dataset.gldel);toast(t('deleted_ok'));render();}return;}
  if(b=q('[data-ndel]')){if(confirm(t('confirm_del'))){await Store.del('notifications',b.dataset.ndel);toast(t('deleted_ok'));render();}return;}
  if(b=q('[data-mread]')){const m=Store.data.messages.find(x=>x.id===b.dataset.mread);if(m){m.read=!m.read;await Store.setDoc('messages',m);render();}return;}
  if(b=q('[data-mdel]')){if(confirm(t('confirm_del'))){await Store.del('messages',b.dataset.mdel);toast(t('deleted_ok'));render();}return;}
  if(b=q('[data-aedit]')){staffEditId=b.dataset.aedit;render();return;}
  if(b=q('#a-cancel')){staffEditId=null;render();return;}
  if(b=q('#a-save')){await runManagerSave(saveStaff);return;}
  if(b=q('.g-del')){b.closest('.grade-row').remove();return;}
  if(b=q('#add-grade')){document.getElementById('grade-rows').insertAdjacentHTML('beforeend',gradeRowsHtml([{subject:'',score:''}]));return;}
  if(b=q('#stu-cancel')){showStuForm=false;stuEditId=null;render();return;}
  if(b=q('#stu-add')){showStuForm=true;stuEditId=null;render();return;}
  if(b=q('#stu-save')){await saveStudent();return;}
  if(b=q('#post-cancel')){showPostForm=false;postEditId=null;render();return;}
  if(b=q('#post-add')){showPostForm=true;postEditId=null;render();return;}
  if(b=q('#post-save')){await savePost();return;}
  if(b=q('#ev-cancel')){showEvForm=false;evEditId=null;render();return;}
  if(b=q('#ev-add')){showEvForm=true;evEditId=null;render();return;}
  if(b=q('#ev-save')){await saveEvent();return;}
  if(b=q('#prog-cancel')){showProgForm=false;progEditId=null;render();return;}
  if(b=q('#prog-add')){showProgForm=true;progEditId=null;render();return;}
  if(b=q('#prog-save')){await saveProgram();return;}
  if(b=q('#gal-cancel')){showGalForm=false;galTmp=null;render();return;}
  if(b=q('#gal-add')){showGalForm=true;galTmp=null;render();return;}
  if(b=q('#gal-save')){await saveGallery();return;}
  if(b=q('#notif-cancel')){showNotifForm=false;render();return;}
  if(b=q('#notif-add')){showNotifForm=true;render();return;}
  if(b=q('#notif-send')){await sendNotif();return;}
  if(b=q('#ex-stu')){exportStudents();return;}
  if(b=q('#ex-gra')){exportGrades();return;}
  if(b=q('#ex-att')){exportAtt();return;}
  if(b=q('#ex-msg')||q('#ex-msg2')){exportMsgs();return;}
  if(b=q('#c-save')){
    if(val('c-analytics-id')&&!/^G-[A-Z0-9]+$/i.test(val('c-analytics-id'))){toast('Enter a valid Google Analytics measurement ID (G-XXXXXXXXXX).',false);return;}
    const siteText={siteName_en:val('c-site-name-en'),siteName_ku:val('c-site-name-ku'),since:val('c-since'),
      whyTitle_en:val('c-why-title-en'),whyTitle_ku:val('c-why-title-ku'),faqTitle_en:val('c-faq-title-en'),faqTitle_ku:val('c-faq-title-ku')};
    [1,2,3,4].forEach(number=>{
      siteText[`why${number}_en`]=val(`c-why-${number}-en`);siteText[`why${number}_ku`]=val(`c-why-${number}-ku`);
      siteText[`faqQ${number}_en`]=val(`c-faq-q${number}-en`);siteText[`faqQ${number}_ku`]=val(`c-faq-q${number}-ku`);
      siteText[`faqA${number}_en`]=document.getElementById(`c-faq-a${number}-en`).value.trim();
      siteText[`faqA${number}_ku`]=document.getElementById(`c-faq-a${number}-ku`).value.trim();
    });
    await Store.saveSettings({...siteText,heroTitle_en:val('c-hero-en'),heroTitle_ku:val('c-hero-ku'),
      heroSub_en:document.getElementById('c-sub-en').value.trim(),heroSub_ku:document.getElementById('c-sub-ku').value.trim(),
      about_en:document.getElementById('c-about-en').value.trim(),about_ku:document.getElementById('c-about-ku').value.trim(),
      address_en:val('c-addr-en'),address_ku:val('c-addr-ku'),phone:val('c-phone'),email:val('c-email'),
      officeHours_en:val('c-hours-en'),officeHours_ku:val('c-hours-ku'),
      analyticsId:val('c-analytics-id')});
    toast(t('saved_ok'));return;
  }
  if(b=q('#s-save')){
    const so={...(Store.data.settings.socials||{})};
    ['facebook','instagram','youtube','telegram','whatsapp'].forEach(k=>{so[k]=document.getElementById('s-'+k).value.trim();});
    if(so.whatsapp&&!whatsappHref(so.whatsapp)){toast(t('whatsapp_link_invalid'),false);return;}
    await Store.saveSettings({socials:so});
    toast(t('saved_ok'));return;
  }
  if(b=q('#a-add')){await runManagerSave(saveStaff);return;}
  if(b=q('#acct-save')){await changePw();return;}
});
document.getElementById('tab-content').addEventListener('submit',async e=>{
  if(e.target.id!=='ai-form')return;
  e.preventDefault();
  const button=e.target.querySelector('button[type="submit"],button:not([type])');
  const answer=document.getElementById('ai-answer');
  answer.textContent='…';if(button)button.disabled=true;
  try{answer.textContent=await askAI(document.getElementById('ai-question').value);}
  catch(err){answer.textContent=err.message||t('ai_error');}
  if(button)button.disabled=false;
});

boot(async()=>{
  document.getElementById('mode-badge').textContent=Store.mode==='supabase'?('☁️ '+t('mode_supabase')):('💻 '+t('mode_demo'));
  try{await refreshPendingSignups();}catch(error){console.error('Could not load pending student applications:',error);toast(t('signup_admin_error'),false);}
  render();
});
}
