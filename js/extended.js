var VisExtended = (() => {
  const collections = ['programs','posts','events','gallery','students','messages','certificates','notifications','admins','accessRequests','schedule','assignments','materials','submissions','instructors','resources','examResults','publicTimetable'];
  const labels = {
    exam_results:'Exam results',
    backup_restore:'Backup / restore',
    exam_term:'Term / session (optional)',
    exam_pdf:'Exam result PDF',
    exam_pdf_hint:'Upload a PDF up to 10 MB.',
    exam_pdf_only:'Exam results must be PDF files.',
    exam_pdf_saved:'Exam result PDF uploaded.',
    exam_pdf_error:'Could not upload the exam result PDF.',
    no_exam_results:'No exam results have been published.',
    result_download:'Download PDF',
    backup_download:'Download JSON backup',
    backup_upload:'Restore from JSON backup',
    backup_warning:'Backups contain student and institute data. Store them securely. Supabase Storage files and Authentication accounts are not included.',
    restore_confirm:'Replace the application records in this site with the selected backup? This cannot be undone.',
    invalid_backup:'The selected file is not a valid VIS backup.',
    backup_restored:'Backup restored. Reloading the application.',
  };
  const tr = key => {
    const language = typeof Vis !== 'undefined' ? Vis.lang : 'en';
    return (typeof I18N !== 'undefined' && I18N[language] && I18N[language][key]) || labels[key] || key;
  };
  const studentName = student => student ? (student.name_en || student.username || student.id) : '';
  const resultsFor = id => Store.data.examResults.filter(result => result.studentId === id)
    .sort((a, b) => String(b.uploadedAt || '').localeCompare(String(a.uploadedAt || '')));
  const escape = value => typeof esc === 'function' ? esc(String(value ?? '')) : String(value ?? '');

  function renderExams() {
    const students = Store.data.students;
    const rows = Store.data.examResults.map(result => {
      const student = students.find(item => item.id === result.studentId);
      return `<tr><td>${escape(studentName(student))}</td><td>${escape(result.term || '—')}</td><td>${escape(result.fileName || 'PDF')}</td><td>${escape(result.uploadedAt ? fmtDate(result.uploadedAt.slice(0,10)) : '—')}</td><td><button class="btn btn-danger btn-sm" data-exam-delete="${escape(result.id)}">${t('del')}</button></td></tr>`;
    }).join('');
    return `<div class="panel"><h3>${tr('exam_results')}</h3>
      <div class="form-grid"><div class="field"><label>${tr('student_label')}</label><select class="input" id="exam-student">${students.map(student => `<option value="${escape(student.id)}">${escape(studentName(student))} (@${escape(student.username)})</option>`).join('')}</select></div>
      <div class="field"><label>${tr('exam_term')}</label><input class="input" id="exam-term" maxlength="80"></div>
      <div class="field"><label>${tr('exam_pdf')}</label><input class="input" id="exam-file" type="file" accept=".pdf,application/pdf" required><small class="muted">${tr(Store.mode==='supabase'?'exam_pdf_hint':'exam_pdf_hint_demo')}</small></div></div>
      <button class="btn btn-gold" id="exam-save">${t('save')}</button></div>
      <div class="panel"><div class="table-wrap"><table><thead><tr><th>${tr('student_label')}</th><th>${tr('exam_term')}</th><th>${tr('exam_pdf')}</th><th>${t('date')}</th><th>${t('actions')}</th></tr></thead><tbody>${rows || `<tr><td colspan="5">${tr('no_exam_results')}</td></tr>`}</tbody></table></div></div>`;
  }

  function renderBackup() {
    return `<div class="panel"><h3>${tr('backup_restore')}</h3><p class="muted">${tr('backup_warning')}</p>
      <div class="row-actions"><button class="btn btn-gold" id="backup-download">${tr('backup_download')}</button>
      <label class="btn btn-ghost" for="backup-file">${tr('backup_upload')}</label><input id="backup-file" type="file" accept="application/json,.json" hidden></div></div>`;
  }

  function renderAdmin(tab) {
    if (tab === 'backup' && sess.role !== 'owner') return `<div class="panel"><p class="muted">Only the owner can export or restore application records.</p></div>`;
    if (!['owner','admin'].includes(sess.role)) return `<div class="panel"><p class="muted">This section is available to institute administrators only.</p></div>`;
    if (tab === 'exam-results') return renderExams();
    return renderBackup();
  }

  function downloadBackup() {
    const data=Object.fromEntries(collections.filter(name=>Array.isArray(Store.data[name])).map(name=>[name,Store.data[name]]));
    const payload = {
      format: 'VIS_APPLICATION_BACKUP',
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      data: {...data,settings:Store.data.settings},
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `vis-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  function validBackup(payload) {
    return payload && payload.format === 'VIS_APPLICATION_BACKUP' && payload.schemaVersion === 1
      && payload.data && typeof payload.data === 'object'
      && payload.data.settings && typeof payload.data.settings === 'object'
      && collections.every(name => Array.isArray(payload.data[name])
        && payload.data[name].every(item => item && typeof item.id === 'string' && item.id.length > 0 && !item.id.includes('/')));
  }

  async function restoreBackup(file) {
    const payload = JSON.parse(await file.text());
    if (!validBackup(payload)) throw new Error(tr('invalid_backup'));
    const imported = Object.fromEntries(collections.map(name => [name, payload.data[name]]));
    imported.students=imported.students.map(({feeTotal,branchId,...student})=>student);
    imported.schedule=imported.schedule.map(({branchId,...entry})=>entry);
    imported.publicTimetable=imported.publicTimetable.map(({branchId,...entry})=>entry);
    imported.posts=imported.posts.filter(post=>post.type!=='alumni').map(({storyRole_en,storyRole_ku,...post})=>post);
    imported.examResults=imported.examResults.filter(result=>Store.mode==='local'?(result.fileData||result.filePath):result.filePath);
    const settings={...payload.data.settings};
    delete settings.employerPartners;
    delete settings.publicResources;
    const normalized={...payload,data:{...imported,settings}};
    if (Store.mode === 'local') {
      Store.data = {...Store.data, ...normalized.data};
      Store.persist();
      location.reload();
      return;
    }
    await Store.functions.httpsCallable('restore-application-backup')({backup:normalized});
    location.reload();
  }

  async function handleAdminClick(event, render) {
    const button = event.target.closest('#exam-save,[data-exam-delete],#backup-download,#backup-file');
    if (!button) return false;
    if (button.id === 'exam-save') {
      const studentId=document.getElementById('exam-student').value;
      const term=document.getElementById('exam-term').value.trim();
      const file=document.getElementById('exam-file').files[0];
      if(!Store.data.students.some(student=>student.id===studentId)||!file){toast(t('err_fill'),false);return true;}
      if(file.type!=='application/pdf'||!file.name.toLowerCase().endsWith('.pdf')){toast(tr('exam_pdf_only'),false);return true;}
      const id=uid('exam');
      let upload;
      try{
        upload=await Store.uploadExamResultFile(file,id,studentId);
        await Store.setDoc('examResults',{id,studentId,term,fileName:upload.fileName,filePath:upload.filePath,fileData:upload.fileData,fileSize:upload.fileSize,uploadedAt:new Date().toISOString()});
        toast(tr('exam_pdf_saved'));render();
      }catch(error){
        if(upload?.filePath)try{await Store.deleteExamResultFile(upload.filePath);}catch(cleanupError){console.error('Could not remove incomplete exam-result upload:',cleanupError);}
        console.error('Could not upload exam result:',error);toast(error.message||tr('exam_pdf_error'),false);
      }
      return true;
    }
    if (button.matches('[data-exam-delete]')) {
      const result=Store.data.examResults.find(item=>item.id===button.dataset.examDelete);
      if(result&&confirm(t('confirm_del'))){
        try{
          await Store.deleteExamResultFile(result.filePath);
          await Store.del('examResults',result.id);
          render();
        }catch(error){console.error('Could not delete exam result:',error);toast(error.message||tr('exam_pdf_error'),false);}
      }
      return true;
    }
    if (button.id === 'backup-download') { downloadBackup(); return true; }
    return false;
  }

  async function handleAdminChange(event) {
    if (event.target.id !== 'backup-file') return;
    const file=event.target.files[0];
    if(!file)return;
    try {
      if(!confirm(tr('restore_confirm')))return;
      await restoreBackup(file);
      toast(tr('backup_restored'));
    } catch(error) {
      console.error('Could not restore VIS backup:',error);
      toast(error.message || tr('invalid_backup'),false);
    } finally {
      event.target.value='';
    }
  }

  function renderStudent(student) {
    const results=resultsFor(student.id);
    const content=document.getElementById('student-exam-results-content');
    if(content) content.innerHTML=results.length
      ? results.map(result=>`<div class="grade-bar"><span>${escape(result.term||tr('exam_results'))}</span><button class="btn btn-ghost btn-sm" data-student-exam-download="${escape(result.id)}">${tr('result_download')}</button></div>`).join('')
      : `<p class="muted">${tr('no_exam_results')}</p>`;
  }

  return {renderAdmin,handleAdminClick,handleAdminChange,renderStudent};
})();
