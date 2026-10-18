/* ===== teacher portal ===== */
const sess=requireAuth('admin');
if(sess){
  if(sess.role!=='teacher'){
    location.replace('admin.html');
  }else{
    mountLangSwitch('lang-switch');
    mountThemeToggle('.theme-toggle');
    document.getElementById('btn-logout').onclick=async()=>{await Auth.logout();location.replace('login.html');};

    const setText=(id,value)=>{const element=document.getElementById(id);if(element)element.textContent=value;};
    const assignedStudents=()=>Store.data.students.filter(student=>
      student.teacherId===sess.id||(student.sharedWith||[]).includes(sess.id));
    const attendanceStudents=()=>Store.data.students.filter(student=>student.teacherId===sess.id);
    const stageLabel=stage=>`${t('stage')} ${stage}`;

    function renderAttendanceRoster(){
      const stageSelect=document.getElementById('attendance-stage');
      const selectedStage=stageSelect.value||String(attendanceStudents()[0]?.stage||1);
      stageSelect.innerHTML=Array.from({length:5},(_,index)=>index+1)
        .map(stage=>`<option value="${stage}" ${Number(selectedStage)===stage?'selected':''}>${stageLabel(stage)}</option>`).join('');
      const students=attendanceStudents()
        .filter(student=>Number(student.stage)===Number(stageSelect.value))
        .sort((a,b)=>String(a.name_en||a.name_ku||'').localeCompare(String(b.name_en||b.name_ku||'')));
      document.getElementById('teacher-attendance-roster').innerHTML=students.map((student,index)=>{
        const name=pick({en:student.name_en,ku:student.name_ku})||student.name_en||student.name_ku||student.username;
        return `<tr data-attendance-student="${esc(student.id)}">
          <td>${index+1}</td><td>${esc(name)}</td>
          <td><select class="input attendance-status" aria-label="${esc(t('attendance_status'))}">
            <option value="present">${t('attendance_present')}</option><option value="absent">${t('attendance_absent')}</option>
          </select></td>
          <td><input class="input attendance-time-in" type="time" aria-label="${esc(t('time_in'))}"></td>
          <td><input class="input attendance-time-out" type="time" aria-label="${esc(t('time_out'))}"></td>
          <td><input class="input attendance-signature" maxlength="120" aria-label="${esc(t('signature'))}"></td>
        </tr>`;
      }).join('');
      document.getElementById('teacher-attendance-empty').hidden=students.length>0;
    }

    function render(){
      const teacher=Store.data.admins.find(item=>item.id===sess.id);
      if(!teacher){clearSession();location.replace('login.html');return;}
      const students=assignedStudents();
      const today=new Date().toISOString().slice(0,10);
      const upcoming=Store.data.schedule
        .filter(item=>item.teacherId===sess.id&&item.date>=today)
        .sort((a,b)=>String(a.date).localeCompare(String(b.date))||String(a.startTime||'').localeCompare(String(b.startTime||'')));
      const assignments=Store.data.assignments
        .filter(item=>item.teacherId===sess.id)
        .sort((a,b)=>String(a.dueDate).localeCompare(String(b.dueDate)));
      const materials=Store.data.materials.filter(item=>item.teacherId===sess.id);
      const resources=[...Store.data.resources].sort((a,b)=>
        String(a.title_en||a.title_ku||'').localeCompare(String(b.title_en||b.title_ku||'')));

      setText('teacher-name',teacher.name||teacher.username||teacher.email);
      setText('teacher-username',teacher.username||teacher.email||'');
      setText('teacher-profile-username',teacher.username||'—');
      setText('teacher-email',teacher.email||'—');
      setText('teacher-student-count',String(students.length));
      setText('teacher-assignment-count',String(assignments.length));
      setText('teacher-material-count',String(materials.length));
      setText('teacher-class-count',String(upcoming.length));

      document.getElementById('teacher-students-list').innerHTML=students.map(student=>{
        const department=(DEPTS[student.dept]&&DEPTS[student.dept][Vis.lang])||student.dept||'—';
        const shared=student.teacherId!==sess.id;
        return `<tr><td>${esc(pick({en:student.name_en,ku:student.name_ku})||student.name_en||student.name_ku||'')}</td>
          <td>${esc(student.username||'')}</td><td>${esc(department)}</td><td>${esc(String(student.stage||'—'))}</td><td>${esc(student.className||'—')}</td>
          <td><span class="tag">${t(shared?'teacher_shared_readonly':'teacher_assigned')}</span></td></tr>`;
      }).join('')||`<tr><td colspan="6" class="muted">${t('teacher_no_students')}</td></tr>`;

      const messageChannel=document.getElementById('teacher-message-channel').value;
      const consentField=messageChannel==='sms'?'smsOptIn':'whatsappOptIn';
      const messageTargets=Store.data.students.filter(student=>
        student.teacherId===sess.id&&student[consentField]===true&&/^\+[1-9]\d{7,14}$/.test(String(student.phone||'')));
      document.getElementById('teacher-message-recipients').innerHTML=messageTargets.map(student=>
        `<label class="check"><input type="checkbox" value="${esc(student.id)}"> ${esc(student.name_en||student.username)} · ${esc(student.phone)}</label>`
      ).join('')||`<p class="muted">${t('teacher_message_no_eligible')}</p>`;

      document.getElementById('teacher-schedule-list').innerHTML=upcoming.slice(0,5).map(item=>
        `<article class="announce"><small>${fmtDate(item.date)} · ${esc(item.startTime||'')}${item.endTime?`–${esc(item.endTime)}`:''}</small><br>
          <b>${esc(item.course||'')}</b> · ${t(item.kind==='exam'?'exam':'class_session')}
          ${item.room?` · ${esc(item.room)}`:''}${item.notes?`<p class="muted">${esc(item.notes)}</p>`:''}</article>`
      ).join('')||`<p class="muted">${t('no_schedule')}</p>`;

      document.getElementById('teacher-assignments-list').innerHTML=assignments.slice(0,5).map(item=>
        `<article class="announce"><small>${t('due_date')}: ${fmtDate(item.dueDate)}</small><br>
          <b>${esc(item.title||'')}</b> · ${esc(item.course||'')}
          <p class="muted">${esc(DEPTS[item.dept]?.[Vis.lang]||item.dept||'')} · ${t('stage')} ${esc(String(item.stage||''))}</p></article>`
      ).join('')||`<p class="muted">${t('no_assignments')}</p>`;

      document.getElementById('teacher-resources-list').innerHTML=resources.slice(0,5).map(resource=>
        `<article class="announce private-resource">
          <div><small>${esc(resource.category||'')}</small><br>
          <b>${esc(pick({en:resource.title_en,ku:resource.title_ku})||resource.title_en||resource.title_ku||'')}</b>
          <p class="muted">${esc(resource.fileName||'')}</p></div>
          <button class="btn btn-ghost btn-sm" data-teacher-resource="${esc(resource.id)}">${t('resource_open')}</button>
        </article>`
      ).join('')||`<p class="muted">${t('resource_empty')}</p>`;

      const posts=[...Store.data.posts].sort((a,b)=>(Number(b.pinned)-Number(a.pinned))||String(b.date).localeCompare(String(a.date))).slice(0,5);
      document.getElementById('teacher-announcements-list').innerHTML=posts.map(post=>{
        const title=pick({en:post.title_en,ku:post.title_ku})||post.title_en||post.title_ku||'';
        const body=pick({en:post.body_en,ku:post.body_ku})||post.body_en||post.body_ku||'';
        return `<article class="announce"><small>${fmtDate(post.date)}</small><br><b>${esc(title)}</b>
          ${body?`<p class="muted">${esc(body)}</p>`:''}</article>`;
      }).join('')||`<p class="muted">${t('no_announce')}</p>`;
      const dateInput=document.getElementById('attendance-date');
      if(!dateInput.value)dateInput.value=new Date().toISOString().slice(0,10);
      renderAttendanceRoster();
    }

    document.getElementById('teacher-resources-list').addEventListener('click',async event=>{
      const button=event.target.closest('[data-teacher-resource]');
      if(!button)return;
      const resource=Store.data.resources.find(item=>item.id===button.dataset.teacherResource);
      if(!resource)return;
      button.disabled=true;
      try{await Store.downloadResourceFile(resource);}
      catch(error){console.error('Could not download teacher resource:',error);toast(t('resource_download_error'),false);}
      finally{button.disabled=false;}
    });
    document.getElementById('teacher-ai-form').addEventListener('submit',async event=>{
      event.preventDefault();
      const button=event.currentTarget.querySelector('button');
      const answer=document.getElementById('teacher-ai-answer');
      button.disabled=true;answer.textContent='…';
      try{answer.textContent=await askAI(document.getElementById('teacher-ai-question').value);}
      catch(error){answer.textContent=error.message||t('ai_error');}
      finally{button.disabled=false;}
    });
    document.getElementById('teacher-message-channel').addEventListener('change',render);
    document.getElementById('teacher-message-form').addEventListener('submit',async event=>{
      event.preventDefault();
      const form=event.currentTarget;
      const button=form.querySelector('button[type="submit"]');
      const studentIds=[...document.querySelectorAll('#teacher-message-recipients input:checked')].map(input=>input.value);
      if(!studentIds.length){toast(t('err_fill'),false);return;}
      button.disabled=true;
      try{
        const {data,error}=await Store.supabase.functions.invoke('send-student-message',{body:{
          studentIds,channel:document.getElementById('teacher-message-channel').value,
          message:document.getElementById('teacher-message-body').value.trim()
        }});
        if(error)throw new Error(data?.error||error.message);
        const resultMessage=t(data.failed?'teacher_message_partial':'teacher_message_sent')
          .replace('{delivered}',String(data.delivered)).replace('{failed}',String(data.failed||0)).replace('{skipped}',String(data.skipped));
        toast(resultMessage,!data.failed);
        document.getElementById('teacher-message-body').value='';
      }catch(error){console.error('Could not send teacher message:',error);toast(error.message||t('signup_error'),false);}
      finally{button.disabled=false;}
    });
    document.getElementById('attendance-stage').addEventListener('change',renderAttendanceRoster);
    document.getElementById('teacher-attendance-form').addEventListener('submit',async event=>{
      event.preventDefault();
      const form=event.currentTarget;
      const submitButton=form.querySelector('button[type="submit"]');
      const className=document.getElementById('attendance-class').value.trim();
      const date=document.getElementById('attendance-date').value;
      const stage=Number(document.getElementById('attendance-stage').value);
      const rows=[...document.querySelectorAll('#teacher-attendance-roster tr[data-attendance-student]')];
      if(!className||!date||stage<1||stage>5||!rows.length){toast(t('attendance_save_error'),false);return;}
      const sheetId=form.dataset.sheetId||uid('attendance');
      form.dataset.sheetId=sheetId;
      const submittedAt=new Date().toISOString();
      const teacher=Store.data.admins.find(item=>item.id===sess.id);
      const records=rows.map(row=>({
        studentId:row.dataset.attendanceStudent,
        student:Store.data.students.find(item=>item.id===row.dataset.attendanceStudent),
        status:row.querySelector('.attendance-status').value,
        timeIn:row.querySelector('.attendance-time-in').value,
        timeOut:row.querySelector('.attendance-time-out').value,
        signature:row.querySelector('.attendance-signature').value.trim()
      }));
      if(records.some(record=>!record.student||record.student.teacherId!==sess.id)){
        toast(t('attendance_save_error'),false);return;
      }
      submitButton.disabled=true;
      try{
        for(const entry of records){
          const student=entry.student;
          const attendanceRecord={
            sheetId,date,className,stage,studentId:student.id,
            studentName:pick({en:student.name_en,ku:student.name_ku})||student.name_en||student.name_ku||student.username,
            status:entry.status,timeIn:entry.timeIn,timeOut:entry.timeOut,signature:entry.signature,
            teacherId:sess.id,teacherName:teacher?.name||teacher?.username||teacher?.email||'',submittedAt
          };
          student.attendanceRecords=(student.attendanceRecords||[]).filter(item=>item.sheetId!==sheetId);
          student.attendanceRecords.push(attendanceRecord);
          student.attMap=student.attMap||{};
          student.attMap[date]=entry.status;
          recalcAttendance(student);
          await Store.setDoc('students',student);
        }
        toast(t('attendance_saved'));
        location.assign('admin.html?tab=attendance');
      }catch(error){
        console.error('Could not save teacher attendance:',error);
        toast(t('attendance_save_error'),false);
        submitButton.disabled=false;
      }
    });
    boot(render);
  }
}
