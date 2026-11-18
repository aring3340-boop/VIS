/* ===== Supabase authentication ===== */
const Auth={
  async clearRejectedLogin(error){
    const {error:signOutError}=await Store.auth.signOut();
    if(signOutError)throw signOutError;
    if(error?.code==='invalid_credentials')return null;
    throw error;
  },
  async loginStudent(username,password){
    try{
      const {data,error}=await Store.auth.signInWithPassword({email:synEmail(username.trim()),password});
      if(error)throw error;
      const doc=await Store.db.collection('students').doc(data.user.id).get();
      if(!doc.exists){await Store.auth.signOut();return null;}
      const stu={id:doc.id,...doc.data()};
      Store.data.students=[stu];
      return stu;
    }catch(error){return this.clearRejectedLogin(error);}
  },
  async loginStaff(usernameOrEmail,password){
    const login=usernameOrEmail.trim().toLowerCase().replace(/\s+/g,'');
    const email=login.includes('@')?login:synEmail(login);
    try{
      const {data,error}=await Store.auth.signInWithPassword({email,password});
      if(error)throw error;
      const doc=await Store.db.collection('admins').doc(data.user.id).get();
      if(!doc.exists){await Store.auth.signOut();return null;}
      const admin={id:doc.id,...doc.data()};
      if(admin.role==='teacher'&&admin.username!==login){await Store.auth.signOut();return null;}
      Store.data.admins=[admin];
      return admin;
    }catch(error){return this.clearRejectedLogin(error);}
  },
  async createAuthAccount(email,password,accountType='student'){
    const {data,error}=await Store.supabase.functions.invoke('create-account',{body:{email,password,accountType}});
    if(error)return {ok:false,error:error.message};
    return {ok:true,uid:data.uid};
  },
  async changePassword(email,current,newPw){
    const {error:signInError}=await Store.auth.signInWithPassword({email,password:current});
    if(signInError)throw signInError;
    const {error}=await Store.auth.updateUser({password:newPw});
    if(error)throw error;
  },
  async logout(){
    const {error}=await Store.auth.signOut();
    if(error)throw error;
    clearSession();
  }
};
