
/* ===== login page ===== */
function showErr(m){const e=document.getElementById('err');e.textContent=m;e.style.display='block';}
function hideErr(){document.getElementById('err').style.display='none';}
function switchTab(which){
  document.getElementById('tab-student').classList.toggle('active',which==='student');
  document.getElementById('tab-staff').classList.toggle('active',which==='staff');
  document.getElementById('form-student').style.display=which==='student'?'block':'none';
  document.getElementById('form-staff').style.display=which==='staff'?'block':'none';
  document.getElementById('signup-toggle').hidden=which!=='student';
  if(which==='staff')signupForm.hidden=true;
  const os=document.getElementById('owner-setup');
  os.style.display=(which==='staff'&&!Store.data.settings.ownerInitialized)?'block':'none';
  hideErr();
}
document.getElementById('tab-student').onclick=()=>switchTab('student');
document.getElementById('tab-staff').onclick=()=>switchTab('staff');
let signupCodeSent=false;
let signupComplete=false;
const signupForm=document.getElementById('signup-form');
function signupDeliveryMessage(data){
  const channels=Array.isArray(data?.sentChannels)?data.sentChannels:[];
  const failed=Array.isArray(data?.failedChannels)?data.failedChannels:[];
  let message=channels.includes('sms')&&channels.includes('whatsapp')
    ?t('signup_code_sent')
    :channels.includes('sms')
      ?t('signup_code_sent_sms')
      :channels.includes('whatsapp')
        ?t('signup_code_sent_whatsapp')
        :t('signup_code_sent');
  if(failed.includes('whatsapp'))message+=` ${t('signup_whatsapp_failed')}`;
  if(failed.includes('sms'))message+=` ${t('signup_sms_failed')}`;
  return message;
}
function showSignupCodeStep(message,isError=false){
  signupCodeSent=true;
  ['signup-name','signup-username','signup-phone','signup-email','signup-dept','signup-stage','signup-age','signup-consent'].forEach(id=>{
    document.getElementById(id).disabled=true;
  });
  document.getElementById('signup-code-field').hidden=false;
  document.getElementById('signup-code').required=true;
  const button=document.getElementById('signup-submit');
  button.textContent=t('signup_verify');
  const status=document.getElementById('signup-status');
  status.textContent=message;
  status.style.color=isError?'var(--red)':'var(--green)';
  status.hidden=false;
  document.getElementById('signup-resend').hidden=false;
}
async function sendSignupRequest(body){
  const {data,error}=await Store.supabase.functions.invoke('student-signup',{body});
  if(!error)return data;
  let message=data?.error||error.message;
  let codeCreated=false;
  if(error.context instanceof Response){
    try{
      const details=await error.context.clone().json();
      if(typeof details?.error==='string')message=details.error;
      codeCreated=details?.codeCreated===true;
    }catch(parseError){
      if(!(parseError instanceof SyntaxError))throw parseError;
    }
  }
  const requestError=new Error(message);
  requestError.codeCreated=codeCreated;
  throw requestError;
}
function resetSignupForm(){
  signupForm.reset();
  signupCodeSent=false;
  signupComplete=false;
  signupForm.querySelectorAll('input,select,button').forEach(input=>input.disabled=false);
  document.getElementById('signup-code').required=false;
  document.getElementById('signup-code-field').hidden=true;
  document.getElementById('signup-resend').hidden=true;
  document.getElementById('signup-status').hidden=true;
  const submit=document.getElementById('signup-submit');
  submit.disabled=false;submit.textContent=t('signup_send_code');
}
document.getElementById('signup-toggle').onclick=()=>{
  resetSignupForm();
  document.getElementById('form-student').hidden=true;
  document.getElementById('signup-toggle').hidden=true;
  signupForm.hidden=false;
  hideErr();
};
document.getElementById('signup-cancel').onclick=()=>{
  signupForm.hidden=true;
  resetSignupForm();
  document.getElementById('form-student').hidden=false;
  document.getElementById('signup-toggle').hidden=false;
  hideErr();
};
document.getElementById('signup-resend').onclick=async()=>{
  hideErr();
  const button=document.getElementById('signup-resend');
  button.disabled=true;
  try{
    const ageValue = Number(document.getElementById('signup-age').value);
    const data=await sendSignupRequest({
      action:'send-code',
      phone:document.getElementById('signup-phone').value.replace(/[ ()-]/g,''),
      password:document.getElementById('signup-password').value,
      name:document.getElementById('signup-name').value.trim(),
      username:document.getElementById('signup-username').value.trim().toLowerCase(),
      email:document.getElementById('signup-email').value.trim(),
      dept:document.getElementById('signup-dept').value,
      stage:Number(document.getElementById('signup-stage').value),
      age: Number.isFinite(ageValue) ? ageValue : null,
      consent:document.getElementById('signup-consent').checked
    });
    document.getElementById('signup-status').textContent=signupDeliveryMessage(data);
    document.getElementById('signup-status').hidden=false;
  }catch(error){showErr(error.message||t('signup_error'));}
  finally{button.disabled=false;}
};
signupForm.addEventListener('submit',async event=>{
  event.preventDefault();hideErr();
  const phone=document.getElementById('signup-phone').value.replace(/[ ()-]/g,'');
  const password=document.getElementById('signup-password').value;
  const ageValue = Number(document.getElementById('signup-age').value);
  const payload={
    phone,
    password,
    ...(signupCodeSent?{action:'verify-code',code:document.getElementById('signup-code').value}:{
      action:'send-code',
      name:document.getElementById('signup-name').value.trim(),
      username:document.getElementById('signup-username').value.trim().toLowerCase(),
      email:document.getElementById('signup-email').value.trim(),
      dept:document.getElementById('signup-dept').value,
      stage:Number(document.getElementById('signup-stage').value),
      age: Number.isFinite(ageValue) ? ageValue : null,
      consent:document.getElementById('signup-consent').checked
    })
  };
  const button=document.getElementById('signup-submit');
  button.disabled=true;
  try{
    const data=await sendSignupRequest(payload);
    if(!signupCodeSent){
      showSignupCodeStep(signupDeliveryMessage(data));
      return;
    }
    document.getElementById('signup-status').textContent=t('signup_pending');
    document.getElementById('signup-status').style.color='var(--green)';
    document.getElementById('signup-status').hidden=false;
    signupForm.querySelectorAll('input,select,button').forEach(input=>input.disabled=true);
    signupComplete=true;
  }catch(error){
    if(error.codeCreated)showSignupCodeStep(error.message||t('signup_error'),true);
    showErr(error.message||t('signup_error'));
  }
  finally{button.disabled=signupComplete;}
});

document.getElementById('form-student').addEventListener('submit',async e=>{
  e.preventDefault();hideErr();
  const u=document.getElementById('stu-user').value.trim();
  const p=document.getElementById('stu-pass').value;
  let stu;
  try{stu=await Auth.loginStudent(u,p);}
  catch(error){showErr(error.message||t('err_creds'));return;}
  if(stu?.pendingApproval){showErr(t('login_pending'));return;}
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
