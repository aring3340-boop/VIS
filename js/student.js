
/* ===== student panel ===== */
const sess=requireAuth('student');
if(sess){
const nowD=new Date();let attView={y:nowD.getFullYear(),m:nowD.getMonth()};
mountLangSwitch('lang-switch');
mountThemeToggle('.theme-toggle');
document.getElementById('btn-logout').onclick=async()=>{await Auth.logout();location.replace('login.html');};

function setT(id,v){const el=document.getElementById(id);if(el!=null)el.textContent=v;}

function renderSchedule(stu){
  const today=new Date().toISOString().slice(0,10);
  const entries=Store.data.schedule.filter(x=>(x.weekly||x.date>=today)&&(x.dept==='all'||x.dept===stu.dept)&&(!Number(x.stage)||Number(x.stage)===Number(stu.stage)))
    .sort((a,b)=>String(a.date).localeCompare(String(b.date))||String(a.startTime).localeCompare(String(b.startTime)));
  document.getElementById('schedule-list').innerHTML=entries.map(x=>`<div class="announce"><small>${x.weekly?t('weekday_'+Number(x.weekday)):fmtDate(x.date)} · ${esc(x.startTime||'')}${x.endTime?'–'+esc(x.endTime):''}</small><br>
    <b>${esc(x.course)}</b> · ${t(x.kind==='exam'?'exam':'class_session')} ${x.room?`· ${esc(x.room)}`:''}
    ${x.notes?`<p class="muted">${esc(x.notes)}</p>`:''}</div>`).join('')||`<p class="muted">${t('no_schedule')}</p>`;
}
function renderAssignments(stu){
  const today=new Date().toISOString().slice(0,10);
  const assignments=Store.data.assignments.filter(a=>a.dept===stu.dept&&Number(a.stage)===Number(stu.stage)).sort((a,b)=>String(a.dueDate).localeCompare(String(b.dueDate)));
  document.getElementById('assignments-list').innerHTML=assignments.map(a=>{
    const submission=Store.data.submissions.find(s=>s.assignmentId===a.id&&s.studentId===stu.id);
    const closed=a.dueDate<today;
    return `<div class="announce"><small>${t('due_date')}: ${fmtDate(a.dueDate)}${closed?` · ${t('overdue')}`:''}</small><br>
      <b>${esc(a.title)}</b> · ${esc(a.course)}${a.instructions?`<p>${esc(a.instructions)}</p>`:''}
      ${submission?`<p class="muted">${t('submitted')}: ${fmtDate(submission.submittedAt)}</p>${submission.filePath||submission.fileData?`<button class="btn btn-ghost btn-sm" data-student-subdownload="${submission.id}">${esc(submission.fileName||t('attachment'))}</button>`:''}`:''}
      <form class="assignment-submit" data-assignment-submit="${esc(a.id)}">
        <div class="field"><textarea class="input" name="answer" maxlength="10000" placeholder="${t('answer')}">${esc(submission?.answer||'')}</textarea></div>
        <div class="field"><input type="file" name="attachment" class="input" accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"></div>
        <button class="btn btn-gold btn-sm" ${closed?'disabled':''}>${submission?t('update'):t('submit_work')}</button>
      </form></div>`;
  }).join('')||`<p class="muted">${t('no_assignments')}</p>`;
}
function renderMaterials(stu){
  const items=Store.data.materials.filter(m=>(m.dept==='all'||m.dept===stu.dept)&&(!Number(m.stage)||Number(m.stage)===Number(stu.stage)));
  document.getElementById('materials-list').innerHTML=items.map(m=>`<div class="announce"><b>${esc(m.title)}</b> · ${esc(m.course)}
    ${m.body?`<p class="muted" style="white-space:pre-wrap">${esc(m.body)}</p>`:''}
    ${m.url?`<a class="btn btn-ghost btn-sm" href="${esc(m.url)}" target="_blank" rel="noopener">${t('resource')}</a>`:''}</div>`).join('')||`<p class="muted">${t('no_materials')}</p>`;
}
function renderPrivateResources(){
  const resources=[...Store.data.resources].sort((a,b)=>String(a.title_en||'').localeCompare(String(b.title_en||'')));
  document.getElementById('student-resources-list').innerHTML=resources.map(resource=>
    `<article class="announce private-resource">
      <div><small>${esc(resource.category||'')}</small><br><b>${esc(pick({en:resource.title_en,ku:resource.title_ku})||resource.title_en||resource.title_ku||'')}</b>
      <p class="muted">${esc(resource.fileName||'')}</p></div>
      <button class="btn btn-ghost btn-sm" data-resource-download="${esc(resource.id)}">${t('resource_open')}</button>
    </article>`
  ).join('')||`<p class="muted">${t('resource_empty')}</p>`;
}

function render(){
  const d=Store.data,stu=d.students.find(x=>x.id===sess.id);
  if(!stu){clearSession();location.replace('login.html');return;}
  const name=(Vis.lang==='ku'&&stu.name_ku)?stu.name_ku:stu.name_en;
  setT('st-name',name);
  setT('st-user',stu.username);
  setT('st-dept',(DEPTS[stu.dept]&&DEPTS[stu.dept][Vis.lang])||stu.dept);
  setT('st-stage',String(stu.stage||'—'));
  setT('st-class',stu.className||'—');
  setT('st-phone',stu.phone||'—');
  setT('st-email',stu.email||'—');
  setT('st-dob',stu.dob?fmtDate(stu.dob):'—');
  const vals=Object.values(stu.attMap||{});
  const present=vals.filter(v=>v==='present').length;
  setT('st-att-num',`${present}/${vals.length||0} · ${stu.attendance??100}%`);
  document.getElementById('att-bar').style.width=(stu.attendance??100)+'%';
  document.getElementById('att-cal').innerHTML=calendarHtml(stu.attMap||{},attView.y,attView.m,true);
  const attendanceRecords=[...(stu.attendanceRecords||[])].sort((a,b)=>
    String(b.date).localeCompare(String(a.date))||String(b.submittedAt).localeCompare(String(a.submittedAt)));
  document.getElementById('student-attendance-history').innerHTML=attendanceRecords.map(record=>
    `<article class="announce"><small>${fmtDate(record.date)}</small><br>
      <b>${esc(record.className||'—')}</b> · ${t(record.status==='present'?'attendance_present':'attendance_absent')}
      ${record.timeIn?`<p class="muted">${t('time_in')}: ${esc(record.timeIn)}${record.timeOut?` · ${t('time_out')}: ${esc(record.timeOut)}`:''}</p>`:''}
    </article>`
  ).join('')||`<p class="muted">${t('attendance_none')}</p>`;
  const avg=(stu.grades&&stu.grades.length)?Math.round(stu.grades.reduce((a,g)=>a+Number(g.score||0),0)/stu.grades.length):0;
  setT('st-avg',avg+'%');
  document.getElementById('grades-list').innerHTML=(stu.grades||[]).map(g=>
    `<div class="grade-bar"><span>${esc(g.subject)}</span><b>${esc(String(g.score))}%</b></div>`
  ).join('')||`<p class="muted">${t('empty')}</p>`;
  // certificate
  const cert=d.certificates.find(c=>c.studentId===stu.id);
  const certBox=document.getElementById('cert-box');
  if(cert){
    certBox.innerHTML=`<div class="announce" style="border-color:var(--green)">
      <b>🏅 ${t('certs')}</b><br>
      <small>${t('code')}: ${esc(cert.code)}</small><br>
      <button class="btn btn-gold btn-sm" style="margin-top:8px" id="btn-cert">${t('download_cert')}</button></div>`;
    document.getElementById('btn-cert').onclick=()=>certificatePDF(stu,cert);
  }else{certBox.innerHTML='';}
  // notifications
  const notifs=[...d.notifications].sort((a,b)=>String(b.date).localeCompare(String(a.date))).slice(0,5);
  document.getElementById('notif-list').innerHTML=notifs.map(n=>
    `<div class="announce"><small>${fmtDate(n.date)}</small><br><b>${esc(pick({en:n.title_en,ku:n.title_ku})||n.title_en)}</b>
     <p class="muted" style="font-size:.9rem;margin-top:4px">${esc((pick({en:n.body_en,ku:n.body_ku})||n.body_en||'').slice(0,200))}</p></div>`
  ).join('')||`<p class="muted">${t('empty')}</p>`;
  // announcements (posts)
  const posts=[...d.posts].sort((a,b)=>(b.pinned-a.pinned)||String(b.date).localeCompare(String(a.date))).slice(0,6);
  document.getElementById('ann-list').innerHTML=posts.map(p=>{
    const body=pick({en:p.body_en,ku:p.body_ku})||p.body_en||'';
    return `<div class="announce"><small>${fmtDate(p.date)}${p.pinned?' · 📌':''}</small><br><b>${esc(pick({en:p.title_en,ku:p.title_ku})||p.title_en)}</b><p class="muted" style="font-size:.9rem;margin-top:4px">${esc(body.slice(0,200))}${body.length>200?'…':''}</p></div>`;
  }).join('')||`<p class="muted">${t('no_announce')}</p>`;
  renderSchedule(stu);
  renderAssignments(stu);
  renderMaterials(stu);
  renderPrivateResources();
  VisExtended.renderStudent(stu);
}

document.getElementById('btn-transcript').onclick=()=>{
  const stu=Store.data.students.find(x=>x.id===sess.id);
  if(stu)transcriptPDF(stu);
};
document.getElementById('student-exam-results-content').addEventListener('click',async event=>{
  const button=event.target.closest('[data-student-exam-download]');if(!button)return;
  const result=Store.data.examResults.find(item=>item.id===button.dataset.studentExamDownload);
  if(!result)return;
  button.disabled=true;
  try{await Store.downloadExamResultFile(result);}
  catch(error){console.error('Could not download exam result:',error);toast(t('exam_pdf_error'),false);}
  finally{button.disabled=false;}
});
document.getElementById('student-resources-list').addEventListener('click',async event=>{
  const button=event.target.closest('[data-resource-download]');if(!button)return;
  const resource=Store.data.resources.find(item=>item.id===button.dataset.resourceDownload);
  if(!resource)return;
  button.disabled=true;
  try{await Store.downloadResourceFile(resource);}
  catch(error){console.error('Could not download private student resource:',error);toast(t('resource_download_error'),false);}
  finally{button.disabled=false;}
});
document.getElementById('ai-form').addEventListener('submit',async e=>{
  e.preventDefault();
  const button=e.target.querySelector('button'),answer=document.getElementById('ai-answer');
  button.disabled=true;answer.textContent='…';
  try{answer.textContent=await askAI(document.getElementById('ai-question').value);}
  catch(err){answer.textContent=err.message||t('ai_error');}
  button.disabled=false;
});
document.getElementById('assignments-list').addEventListener('submit',async e=>{
  const form=e.target.closest('[data-assignment-submit]');if(!form)return;
  e.preventDefault();
  const button=form.querySelector('button'),assignment=Store.data.assignments.find(a=>a.id===form.dataset.assignmentSubmit);
  const student=Store.data.students.find(x=>x.id===sess.id),answer=form.querySelector('[name="answer"]').value.trim(),file=form.querySelector('[name="attachment"]').files[0];
  if(!assignment||!student||(!answer&&!file)){toast(t('err_fill'),false);return;}
  button.disabled=true;
  try{
    const previous=Store.data.submissions.find(s=>s.assignmentId===assignment.id&&s.studentId===student.id);
    const upload=await Store.uploadSubmission(file,assignment.id,student.id);
    const submission={id:assignment.id+'_'+student.id,assignmentId:assignment.id,studentId:student.id,teacherId:assignment.teacherId,
      answer,fileName:upload.fileName||previous?.fileName||'',filePath:upload.filePath||previous?.filePath||'',fileData:upload.fileData||previous?.fileData||'',submittedAt:new Date().toISOString()};
    await Store.setDoc('submissions',submission);
    if(previous?.filePath&&upload.filePath&&previous.filePath!==upload.filePath)await Store.deleteSubmissionFile(previous.filePath);
    toast(t('submitted_ok'));render();
  }catch(err){toast(err.message||t('file_read_error'),false);button.disabled=false;}
});
document.getElementById('assignments-list').addEventListener('click',async e=>{
  const button=e.target.closest('[data-student-subdownload]');if(!button)return;
  const submission=Store.data.submissions.find(s=>s.id===button.dataset.studentSubdownload);
  if(submission)try{await Store.downloadSubmission(submission);}catch(err){toast(t('file_read_error'),false);}
});
// month navigation for attendance calendar
document.getElementById('att-wrap').addEventListener('click',e=>{
  const b=e.target.closest('[data-calnav]');if(!b)return;
  attView.m+=Number(b.dataset.calnav);
  if(attView.m<0){attView.m=11;attView.y--;}if(attView.m>11){attView.m=0;attView.y++;}
  render();
});

boot(render);
}
