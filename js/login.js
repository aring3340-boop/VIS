
/* ===== login page ===== */
function showErr(m){const e=document.getElementById('err');e.textContent=m;e.style.display='block';}
function hideErr(){document.getElementById('err').style.display='none';}
function switchTab(which){
  document.getElementById('tab-student').classList.toggle('active',which==='student');
  document.getElementById('tab-staff').classList.toggle('active',which==='staff');
  document.getElementById('form-student').style.display=which==='student'?'block':'none';
  document.getElementById('form-staff').style.display=which==='staff'?'block':'none';
  const os=document.getElementById('owner-setup');
  os.style.display=(which==='staff'&&!Store.data.settings.ownerInitialized)?'block':'none';
  hideErr();
}
document.getElementById('tab-student').onclick=()=>switchTab('student');
document.getElementById('tab-staff').onclick=()=>switchTab('staff');

document.getElementById('form-student').addEventListener('submit',async e=>{
  e.preventDefault();hideErr();
  const u=document.getElementById('stu-user').value.trim();
  const p=document.getElementById('stu-pass').value;
  let stu;
  try{stu=await Auth.loginStudent(u,p);}
  catch(error){showErr(error.message||t('err_creds'));return;}
  if(!stu){showErr(t('err_creds'));return;}
  setSession({type:'student',id:stu.id});
  location.href='student.html';
});

document.getElementById('form-staff').addEventListener('submit',async e=>{
  e.preventDefault();hideErr();
  const em=document.getElementById('staff-email').value.trim();
  const p=document.getElementById('staff-pass').value;
  let a;
  try{a=await Auth.loginStaff(em,p);}
  catch(error){showErr(error.message||t('err_creds'));return;}
  if(!a){showErr(t('err_creds'));return;}
  setSession({type:'admin',id:a.id,role:a.role});
  location.href=a.role==='teacher'?'teacher.html':'admin.html';
});

document.getElementById('owner-setup-form').addEventListener('submit',async e=>{
  e.preventDefault();hideErr();
  const name=document.getElementById('o-name').value.trim();
  const email=document.getElementById('o-email').value.trim().toLowerCase();
  const pass=document.getElementById('o-pass').value;
  if(!name||!email||pass.length<8){showErr(t('err_fill'));return;}
  try{await Store.functions.httpsCallable('setup-owner')({name,email,password:pass});}
  catch(err){showErr(err.message||t('owner_exists'));return;}
  const a=await Auth.loginStaff(email,pass);
  if(a){setSession({type:'admin',id:a.id,role:a.role});location.href='admin.html';}
});

mountLangSwitch('lang-switch');
mountThemeToggle('.theme-toggle');
boot(()=>{
  switchTab(location.hash==='#staff'?'staff':'student');
  if(new URLSearchParams(location.search).get('reset')==='1'){
    document.querySelector('.tabs').style.display='none';
    document.getElementById('form-student').style.display='none';
    document.getElementById('form-staff').style.display='none';
    document.getElementById('owner-setup').style.display='none';
    document.getElementById('recover-form').style.display='block';
  }
});

document.getElementById('recover-form').addEventListener('submit',async event=>{
  event.preventDefault();
  const {error}=await Store.auth.updateUser({password:document.getElementById('recover-password').value});
  if(error){showErr(error.message);return;}
  await Store.auth.signOut();
  history.replaceState(null,'','login.html#staff');
  document.getElementById('recover-form').style.display='none';
  document.querySelector('.tabs').style.display='';
  document.getElementById('form-student').style.display='none';
  document.getElementById('form-staff').style.display='block';
  toast(t('password_updated'));
});
