
/* ===== VIS Institute — dual-mode data layer (localStorage demo / Supabase) ===== */
const DB_KEY='vis_db_v1';
const Vis={lang:localStorage.getItem('vis_lang')||'en'};

const DEPTS={
  it:{en:'Information Technology',ku:'تەکنەلۆژیای زانیاری'},
  business:{en:'Business Administration',ku:'بەرێوەبردنی بازرگانی'},
  health:{en:'Health & Nursing',ku:'تەندروستی و پەرستاری'},
  electrical:{en:'Electrical & Electronics',ku:'کارەبا و ئەلیکترۆنیک'}
};

function loadScript(src){return new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>rej(new Error('failed '+src));document.head.appendChild(s);});}
async function loadSupabaseSDK(){
  if(window.supabase)return;
  await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
}

function supabaseError(error){return error instanceof Error?error:new Error(error?.message||'Supabase request failed.');}

function makeDocumentSnapshot(row){
  return {id:row.id,exists:true,data:()=>row.data};
}

function makeDatabaseAdapter(client){
  const collection=name=>({
    doc(id){
      const key=id||crypto.randomUUID();
      return {
        async get(){
          const {data,error}=await client.from('app_records').select('id,data').eq('collection',name).eq('id',key).maybeSingle();
          if(error)throw supabaseError(error);
          return data?makeDocumentSnapshot(data):{id:key,exists:false,data:()=>undefined};
        },
        async set(value,options={}){
          let record=value;
          if(options.merge){
            const current=await this.get();
            record=current.exists?{...current.data(),...value}:value;
          }
          const {error}=await client.from('app_records').upsert({collection:name,id:key,data:record},{onConflict:'collection,id'});
          if(error)throw supabaseError(error);
        },
        async delete(){
          const {error}=await client.from('app_records').delete().eq('collection',name).eq('id',key);
          if(error)throw supabaseError(error);
        }
      };
    },
    where(field,operator,value){
      return makeQuery(name,client).where(field,operator,value);
    },
    get(){return makeQuery(name,client).get();}
  });
  return {collection};
}

function makeQuery(name,client,filters=[],maxRows=null){
  const query={
    where(field,operator,value){return makeQuery(name,client,[...filters,{field,operator,value}],maxRows);},
    limit(count){return makeQuery(name,client,filters,count);},
    async get(){
      const {data,error}=await client.from('app_records').select('id,data').eq('collection',name);
      if(error)throw supabaseError(error);
      let rows=(data||[]).filter(row=>filters.every(filter=>{
        const actual=row.data?.[filter.field];
        if(filter.operator==='array-contains')return Array.isArray(actual)&&actual.includes(filter.value);
        if(filter.operator==='=='){
          if(actual===filter.value)return true;
          return actual!=null&&filter.value!=null&&String(actual)===String(filter.value);
        }
        throw new Error(`Unsupported query operator: ${filter.operator}`);
      }));
      if(maxRows!==null)rows=rows.slice(0,maxRows);
      const docs=rows.map(makeDocumentSnapshot);
      return {docs,empty:docs.length===0,size:docs.length};
    }
  };
  return query;
}

function makeStorageAdapter(client){
  return {ref(path){
    const separator=path.indexOf('/');
    if(separator<1)throw new Error('Invalid storage path.');
    const bucket=path.slice(0,separator)==='gallery'?'vis-gallery':'vis-private';
    const objectPath=path.slice(separator+1);
    const storage=client.storage.from(bucket);
    return {
      async put(file,options={}){
        const {error}=await storage.upload(objectPath,file,{
          contentType:options.contentType||file.type||'application/octet-stream',
          upsert:true
        });
        if(error)throw supabaseError(error);
      },
      async putString(value,format){
        const response=await fetch(value);
        if(!response.ok)throw new Error('Could not read the selected file.');
        const file=await response.blob();
        const {error}=await storage.upload(objectPath,file,{contentType:file.type||'image/jpeg',upsert:true});
        if(error)throw supabaseError(error);
      },
      async getDownloadURL(){
        if(bucket==='vis-gallery')return storage.getPublicUrl(objectPath).data.publicUrl;
        const {data,error}=await storage.createSignedUrl(objectPath,300);
        if(error)throw supabaseError(error);
        return data.signedUrl;
      },
      async getBytes(maxBytes){
        const {data,error}=await storage.download(objectPath);
        if(error)throw supabaseError(error);
        if(data.size>maxBytes)throw new Error('The requested file exceeds the download limit.');
        return new Uint8Array(await data.arrayBuffer());
      },
      async delete(){
        const {error}=await storage.remove([objectPath]);
        if(error)throw supabaseError(error);
      }
    };
  }};
}

async function hashPass(s){
  try{
    if(window.crypto&&crypto.subtle){
      const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('vis::'+s));
      return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
    }
  }catch(e){}
  let h=5381;for(let i=0;i<s.length;i++){h=((h<<5)+h+s.charCodeAt(i))>>>0;}
  return 'f'+h.toString(16);
}

async function defaultData(){
  const ownerHash=await hashPass('Visinstitutesuli1');
  const stuHash=await hashPass('student123');
  return {
    settings:{
      siteName_en:'Vocational Institute of Sulaimanyah',siteName_ku:'پەیمانگەی پیشەیی سلێمانی',
      heroTitle_en:'Professional Skills for a Changing World',heroTitle_ku:'شارەزایی پیشەیی بۆ جیهانێکی گۆڕاو',
      heroSub_en:'Practical technical and vocational education in technology, business, health and engineering, supported by experienced instructors.',
      heroSub_ku:'پەروەردەی کرداری و پیشەیی لە تەکنەلۆژیا، بازرگانی، تەندروستی و ئەندازیاری، بە پشتگیری مامۆستایانی شارەزا.',
      about_en:'The Vocational Institute of Sulaimanyah is a leading institution dedicated to practical, career-focused education. We prepare students for the modern workforce through hands-on training, industry-aligned curricula, and experienced instructors across technology, business, health, and engineering trades.',
      about_ku:'پەیمانگەی پیشەیی سلێمانی دامەزراوەیەکی پێشەنگە تەرخانکراوە بۆ پەروەردەی پراکتیکی ئامادەی کار. ئێمە قوتابیان ئامادەی بازاڕی کار دەکەین بە ڕاهێنانی پراکتیکی، بەرنامەی پەیوەست بە پیشە و مامۆستایانی شارەزا لە بوارەکانی تەکنەلۆژیا، بازرگانی، تەندروستی و ئەندازیاری.',
      address_en:'Salim Street, Sulaymaniyah, Kurdistan Region, Iraq',address_ku:'شەقامی سالم، سلێمانی، هەرێمی کوردستان، عێراق',
      phone:'+964 770 000 0000',email:'visinstitute@gmail.com',officeHours_en:'',officeHours_ku:'',since:'2009',studentCount:0,ownerInitialized:false,
      socials:{facebook:'',instagram:'',youtube:'',telegram:'',whatsapp:''}
    },
    programs:[
      {id:'pr1',icon:'💻',title_en:'Information Technology',title_ku:'تەکنەلۆژیای زانیاری',desc_en:'Software development, networking, databases and office productivity for the digital workplace.',desc_ku:'پەرەپێدانی نەرمەکالا، تۆڕ، بنکەدراو و ئەپڵیکەیشنی ئۆفیس بۆ شوێنی کارە دیجیتاڵییەکان.',courses_en:'Software development\nComputer networking\nDatabase fundamentals\nOffice productivity',courses_ku:'پەرەپێدانی نەرمەکالا\nتۆڕی کۆمپیوتەر\nبنەماکانی بنکەدراو\nبەرهەمهێنانی ئۆفیس',careers_en:'Junior software developer\nIT support technician\nNetwork support assistant',careers_ku:'پەرەپێدەری نەرمەکالای سەرەتایی\nتەکنیکی پشتیوانی تەکنەلۆژیای زانیاری\nیاریدەدەری پشتیوانی تۆڕ'},
      {id:'pr2',icon:'📊',title_en:'Business Administration',title_ku:'بەرێوەبردنی بازرگانی',desc_en:'Accounting, marketing, and management skills for modern businesses and entrepreneurship.',desc_ku:'ژمێریاری، بازرگانی و شارەزایی بەرێوەبردن بۆ بازرگانییە نوێکان و خاوەنکارایەتی.',courses_en:'Accounting fundamentals\nMarketing\nBusiness management\nEntrepreneurship',courses_ku:'بنەماکانی ژمێریاری\nبازرگانی\nبەرێوەبردنی بازرگانی\nخاوەنکارایەتی',careers_en:'Bookkeeping assistant\nMarketing assistant\nOffice administrator',careers_ku:'یاریدەدەری تۆمارکردنی ژمێریاری\nیاریدەدەری بازرگانی\nبەرێوەبەری نووسینگە'},
      {id:'pr3',icon:'🩺',title_en:'Health & Nursing',title_ku:'تەندروستی و پەرستاری',desc_en:'Patient care, first aid and clinical fundamentals taught in partnership with local clinics.',desc_ku:'چاودێری نەخۆش، یارمەتی یەکەم و بنەما کلینیکییەکان بە هاوبەشی لەگەڵ کلینیکی ناوچەکە.',courses_en:'Patient care\nFirst aid\nClinical fundamentals',courses_ku:'چاودێری نەخۆش\nیارمەتی یەکەم\nبنەما کلینیکییەکان',careers_en:'Patient-care assistant\nFirst-aid responder\nClinical support assistant',careers_ku:'یاریدەدەری چاودێری نەخۆش\nیاریدەدەری یارمەتی یەکەم\nیاریدەدەری پشتیوانی کلینیکی'},
      {id:'pr4',icon:'⚡',title_en:'Electrical & Electronics',title_ku:'کارەبا و ئەلیکترۆنیک',desc_en:'Wiring, industrial automation and electronic systems with hands-on workshop training.',desc_ku:'ڕاکێشانی سیم، ئۆتۆماسیۆنی پیشەگەری و سیستمی ئەلیکترۆنی لەگەڵ ڕاهێنانی پراکتیکی.',courses_en:'Electrical wiring\nIndustrial automation\nElectronic systems',courses_ku:'سیمکێشی کارەبا\nئۆتۆماسیۆنی پیشەگەری\nسیستمی ئەلیکترۆنی',careers_en:'Electrical installation assistant\nElectronics technician\nIndustrial automation assistant',careers_ku:'یاریدەدەری دامەزراندنی کارەبا\nتەکنیکی ئەلیکترۆنیک\nیاریدەدەری ئۆتۆماسیۆنی پیشەگەری'}
    ],
    posts:[
      {id:'p1',date:'2026-09-20',pinned:true,title_en:'Autumn Semester Registration Now Open',title_ku:'تۆمارکردنی وەرزی پایز کرایەوە',
       body_en:'Registration for the 2026–2027 autumn semester is now open across all departments. New students can apply at the registrar office Sunday–Thursday, 9:00–14:00.',
       body_ku:'تۆمارکردن بۆ وەرزی پایزی ٢٠٢٦–٢٠٢٧ کرایەوە لە هەموو بەشەکان. قوتابیانی نوێ دەتوانن لە نووسینگەی تۆمارکردن داوا بکەن لە یەکشەممە تا پێنجشەممە، کاتژمێر ٩:٠٠–١٤:٠٠.'},
      {id:'p2',date:'2026-09-05',pinned:false,title_en:'New Computer Labs Inaugurated',title_ku:'کردنەوەی تاقیگەی کۆمپیوتەری نوێ',
       body_en:'The institute has opened two new computer labs with 60 modern workstations to support the IT and business programs.',
       body_ku:'پەیمانگە دوو تاقیگەی کۆمپیوتەری نوێی کردایەوە لەگەڵ ٦٠ ئامێری نوێ بۆ پشتیوانی بەرنامەکانی ئایتی و بازرگانی.'}
    ],
    events:[
      {id:'e1',date:'2026-10-15',time:'10:00',location_en:'Main Hall',location_ku:'هۆڵی سەرەکی',title_en:'Open Day for New Applicants',title_ku:'ڕۆژی دەرگاکراو بۆ داواکارانی نوێ',desc_en:'Meet teachers, tour the labs and apply on the spot.',desc_ku:'بە مامۆستانان بکەوە، سەردانی تاقیگەکان بکە و لە شوێنەکەش تۆمار ببە.'},
      {id:'e2',date:'2026-11-02',time:'09:00',location_en:'Exam Center',location_ku:'سەنتەری تاقیکردنەوە',title_en:'Midterm Exams Begin',title_ku:'دەستپێکردنی تاقیکردنەوەی ناوەندی',desc_en:'All departments. Check the notice board for your schedule.',desc_ku:'هەموو بەشەکان. کاتی خۆت لە تابلۆی ڕاگەیاندنەکان ببینە.'}
    ],
    gallery:[],
    instructors:[],resources:[],
    students:[
      {id:'s1',username:'ali.kareem',pass:stuHash,name_en:'Ali Kareem',name_ku:'عەلی کریم',dept:'it',stage:2,phone:'0770 000 0000',email:'ali@example.com',dob:'2004-05-12',attendance:92,attMap:{},grades:[{subject:'Programming',score:88},{subject:'Networking',score:76},{subject:'English',score:81}]},
      {id:'s2',username:'sara.ahmed',pass:stuHash,name_en:'Sara Ahmed',name_ku:'سارا ئەحمەد',dept:'health',stage:1,phone:'0771 111 1111',email:'sara@example.com',dob:'2005-02-03',attendance:97,attMap:{},grades:[{subject:'Anatomy',score:90},{subject:'First Aid',score:85}]}
    ],
    messages:[],certificates:[],notifications:[],accessRequests:[],schedule:[],assignments:[],materials:[],submissions:[],
    examResults:[],publicTimetable:[],
    admins:[{id:'a1',email:'visinstitute@gmail.com',pass:ownerHash,name:'Institute Owner',role:'owner'}]
  };
}

/* ---------- Store: single interface, two backends ---------- */
const Store={
  mode:'local',data:null,db:null,auth:null,storage:null,functions:null,supabase:null,legacyPublicResources:false,
  async init(){
    if(supabaseConfigured()){
      await loadSupabaseSDK();
      this.supabase=window.supabase.createClient(SUPABASE_CONFIG.url,SUPABASE_CONFIG.anonKey);
      this.db=makeDatabaseAdapter(this.supabase);
      this.auth=this.supabase.auth;
      this.storage=makeStorageAdapter(this.supabase);
      this.functions={httpsCallable:name=>async data=>{
        const {data:result,error}=await this.supabase.functions.invoke(name,{body:data});
        if(error)throw supabaseError(error);
        return {data:result};
      }};
      this.mode='supabase';
      await this.cloudLoad();
      return;
    }
    this.mode='local';await this.localInit();
  },
  async localInit(){
    const def=await defaultData();
    const raw=localStorage.getItem(DB_KEY);
    if(raw){
      try{const d=JSON.parse(raw);this.data={...def,...d,settings:{...def.settings,...(d.settings||{})}};}
      catch(e){this.data=def;}
    }else{this.data=def;}
    ['programs','posts','events','gallery','students','messages','certificates','notifications','admins','accessRequests','schedule','assignments','materials','submissions','instructors','resources','examResults','publicTimetable'].forEach(c=>{
      if(!Array.isArray(this.data[c]))this.data[c]=(def[c]||[]);
    });
    this.data.students=this.data.students.map(({feeTotal,branchId,...student})=>student);
    this.data.schedule=this.data.schedule.map(({branchId,...entry})=>entry);
    this.data.publicTimetable=this.data.publicTimetable.map(({branchId,...entry})=>entry);
    this.data.examResults=this.data.examResults.filter(result=>result.filePath||result.fileData);
    this.data.posts=this.data.posts.filter(post=>post.type!=='alumni').map(({storyRole_en,storyRole_ku,...post})=>post);
    delete this.data.payments;
    delete this.data.branches;
    this.data.gallery=this.data.gallery.filter(item=>!(['g1','g2','g3'].includes(item.id)&&String(item.url||'').includes('images.unsplash.com')));
    this.data.programs=this.data.programs.map(program=>{
      const seed=def.programs.find(item=>item.id===program.id);
      return seed?{...seed,...program}:program;
    });
    this.data.settings={...def.settings,...(this.data.settings||{})};
    delete this.data.settings.publicResources;
    this.data.students.forEach(s=>{if(!s.attMap)s.attMap={};});
    this.persist();
  },
  persist(){if(this.mode==='local')localStorage.setItem(DB_KEY,JSON.stringify(this.data));},
  async cloudLoad(){
    const def=await defaultData();
    this.data={...def,students:[],messages:[],admins:[],accessRequests:[],certificates:[],notifications:[],schedule:[],assignments:[],materials:[],submissions:[],instructors:[],resources:[],examResults:[],publicTimetable:[]};
    for(const c of ['programs','posts','events','gallery','certificates','notifications','instructors','publicTimetable']){
      const snap=await this.db.collection(c).get();
      const records=snap.docs.map(d=>({id:d.id,...d.data()}));
      this.data[c]=records;
    }
    this.data.gallery=this.data.gallery.filter(item=>!(['g1','g2','g3'].includes(item.id)&&String(item.url||'').includes('images.unsplash.com')));
    this.data.publicTimetable=this.data.publicTimetable.map(({branchId,...entry})=>entry);
    this.data.posts=this.data.posts.filter(post=>post.type!=='alumni').map(({storyRole_en,storyRole_ku,...post})=>post);
    this.data.programs=this.data.programs.map(program=>{
      const seed=def.programs.find(item=>item.id===program.id);
      return seed?{...seed,...program}:program;
    });
    const settings=await this.db.collection('settings').doc('main').get();
    if(settings.exists){
      const settingsData=settings.data();
      this.legacyPublicResources=Object.prototype.hasOwnProperty.call(settingsData,'publicResources');
      this.data.settings={...def.settings,...settingsData};
    }
    delete this.data.settings.publicResources;
    const session=getSession();
    const {data:{session:authSession},error}=await this.auth.getSession();
    if(error)throw supabaseError(error);
    const user=authSession?.user;
    if(session&&user&&session.id===user.id)await this.cloudLoadPrivate(session,user);
  },
  async cloudLoadPrivate(session,user){
    if(!user||user.id!==session.id)return;
    if(session.type==='student'){
      const snap=await this.db.collection('students').doc(user.id).get();
      this.data.students=snap.exists?[{id:snap.id,...snap.data()}].map(({feeTotal,branchId,...student})=>student):[];
      if(snap.exists){
        const student=this.data.students[0];
        const [assignments,materials,submissions,schedule,resources,examResults]=await Promise.all([
          this.db.collection('assignments').where('dept','==',student.dept).where('stage','==',Number(student.stage)).get(),
          this.db.collection('materials').get(),
          this.db.collection('submissions').where('studentId','==',user.id).get(),
          this.db.collection('schedule').get(),
          this.db.collection('resources').get(),
          this.db.collection('examResults').where('studentId','==',user.id).get()
        ]);
        this.data.assignments=assignments.docs.map(d=>({id:d.id,...d.data()}));
        this.data.materials=materials.docs.map(d=>({id:d.id,...d.data()}));
        this.data.submissions=submissions.docs.map(d=>({id:d.id,...d.data()}));
        this.data.schedule=schedule.docs.map(d=>{const {branchId,...entry}=d.data();return {id:d.id,...entry};});
        this.data.resources=resources.docs.map(d=>({id:d.id,...d.data()}));
        this.data.examResults=examResults.docs.map(d=>({id:d.id,...d.data()})).filter(result=>result.filePath||result.fileData);
      }
      return;
    }
    if(session.type!=='admin')return;
    const account=await this.db.collection('admins').doc(user.id).get();
    if(!account.exists)return;
    const admin={id:account.id,...account.data()};
    this.data.admins=[admin];
    if(admin.role==='content_editor'){
      const schedule=await this.db.collection('schedule').get();
      this.data.schedule=schedule.docs.map(d=>({id:d.id,...d.data()}));
      return;
    }
    if(admin.role==='owner'||admin.role==='admin'){
      await this.removeLegacyPublicResources();
      const [students,admins,messages,requests,assignments,submissions,materials,schedule,resources,examResults]=await Promise.all([
        this.db.collection('students').get(),this.db.collection('admins').get(),
        this.db.collection('messages').get(),this.db.collection('accessRequests').get(),
        this.db.collection('assignments').get(),this.db.collection('submissions').get(),
        this.db.collection('materials').get(),this.db.collection('schedule').get(),this.db.collection('resources').get(),
        this.db.collection('examResults').get()
      ]);
      this.data.students=students.docs.map(d=>{const {feeTotal,branchId,...student}=d.data();return {id:d.id,...student};});
      this.data.admins=admins.docs.map(d=>({id:d.id,...d.data()}));
      this.data.messages=messages.docs.map(d=>({id:d.id,...d.data()}));
      this.data.accessRequests=requests.docs.map(d=>({id:d.id,...d.data()}));
      this.data.assignments=assignments.docs.map(d=>({id:d.id,...d.data()}));
      this.data.submissions=submissions.docs.map(d=>({id:d.id,...d.data()}));
      this.data.materials=materials.docs.map(d=>({id:d.id,...d.data()}));
      this.data.schedule=schedule.docs.map(d=>{const {branchId,...entry}=d.data();return {id:d.id,...entry};});
      await Promise.all(this.data.schedule.filter(entry=>entry.weekly).map(entry=>this.publishSchedule(entry)));
      this.data.resources=resources.docs.map(d=>({id:d.id,...d.data()}));
      this.data.examResults=examResults.docs.map(d=>({id:d.id,...d.data()})).filter(result=>result.filePath||result.fileData);
      return;
    }
    const [owned,shared,incoming,outgoing,assignments,submissions,materials,schedule,resources]=await Promise.all([
      this.db.collection('students').where('teacherId','==',user.id).get(),
      this.db.collection('students').where('sharedWith','array-contains',user.id).get(),
      this.db.collection('accessRequests').where('ownerId','==',user.id).get(),
      this.db.collection('accessRequests').where('requesterId','==',user.id).get(),
      this.db.collection('assignments').where('teacherId','==',user.id).get(),
      this.db.collection('submissions').where('teacherId','==',user.id).get(),
      this.db.collection('materials').get(),this.db.collection('schedule').get(),this.db.collection('resources').get()
    ]);
    const students=new Map();
    [...owned.docs,...shared.docs].forEach(d=>students.set(d.id,{id:d.id,...d.data()}));
    this.data.students=[...students.values()].map(({feeTotal,branchId,...student})=>student);
    const requests=new Map();
    [...incoming.docs,...outgoing.docs].forEach(d=>requests.set(d.id,{id:d.id,...d.data()}));
    this.data.accessRequests=[...requests.values()];
    this.data.assignments=assignments.docs.map(d=>({id:d.id,...d.data()}));
    this.data.submissions=submissions.docs.map(d=>({id:d.id,...d.data()}));
    this.data.materials=materials.docs.map(d=>({id:d.id,...d.data()}));
    this.data.schedule=schedule.docs.map(d=>{const {branchId,...entry}=d.data();return {id:d.id,...entry};});
    await Promise.all(this.data.schedule.filter(entry=>entry.weekly&&entry.teacherId===user.id).map(entry=>this.publishSchedule(entry)));
    this.data.resources=resources.docs.map(d=>({id:d.id,...d.data()}));
  },
  coll(name){return this.data[name];},
  async setDoc(collName,obj){
    if(this.mode==='supabase')await this.db.collection(collName).doc(obj.id).set(obj);
    if(collName==='schedule')await this.publishSchedule(obj);
    const a=this.data[collName];const i=a.findIndex(x=>x.id===obj.id);
    if(i>=0)a[i]=obj;else a.push(obj);
    this.persist();
  },
  async del(collName,id){
    if(collName==='schedule'&&this.mode==='supabase')await this.db.collection('publicTimetable').doc(id).delete();
    if(this.mode==='supabase')await this.db.collection(collName).doc(id).delete();
    else if(collName==='students')this.data.accessRequests=this.data.accessRequests.filter(r=>r.studentId!==id);
    else if(collName==='assignments')this.data.submissions=this.data.submissions.filter(s=>s.assignmentId!==id);
    this.data[collName]=this.data[collName].filter(x=>x.id!==id);
    this.persist();
  },
  async publishSchedule(entry){
    if(this.mode!=='supabase')return;
    const ref=this.db.collection('publicTimetable').doc(entry.id);
    if(!entry.weekly){await ref.delete();return;}
    const {id,kind,dept,stage,weekday,startTime,endTime,course,room}=entry;
    await ref.set({id,kind,dept,stage,weekday,startTime,endTime,course,room});
  },
  async saveSettings(patch){
    Object.assign(this.data.settings,patch);
    delete this.data.settings.publicResources;
    if(this.mode==='supabase')await this.db.collection('settings').doc('main').set(JSON.parse(JSON.stringify(this.data.settings)));
    this.persist();
  },
  async removeLegacyPublicResources(){
    if(!this.legacyPublicResources)return;
    const settings=this.data.settings;
    delete settings.publicResources;
    await this.db.collection('settings').doc('main').set(settings);
    this.legacyPublicResources=false;
  },
  async uploadSubmission(file,assignmentId,studentId){
    if(!file)return {fileName:'',filePath:'',fileData:''};
    if(this.mode==='supabase'){
      if(file.size>2*1024*1024)throw new Error(t('file_too_large'));
      const safeName=file.name.replace(/[^a-zA-Z0-9._-]/g,'_');
      const path=`submissions/${assignmentId}/${studentId}/${Date.now()}_${safeName}`;
      await this.storage.ref(path).put(file);
      return {fileName:file.name,filePath:path,fileData:''};
    }
    if(file.size>200*1024)throw new Error(t('file_too_large_demo'));
    const fileData=await new Promise((resolve,reject)=>{
      const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error(t('file_read_error')));reader.readAsDataURL(file);
    });
    return {fileName:file.name,filePath:'',fileData};
  },
  async downloadSubmission(submission){
    let url=submission.fileData;
    if(this.mode==='supabase'){
      const result=await this.functions.httpsCallable('get-submission-download')({submissionId:submission.id});
      url=result.data.url;
    }
    const link=document.createElement('a');link.href=url;link.download=submission.fileName||'submission';
    if(this.mode==='supabase')link.target='_blank';
    document.body.appendChild(link);link.click();link.remove();
  },
  async deleteSubmissionFile(path){
    if(this.mode==='supabase'&&path)await this.storage.ref(path).delete();
  },
  async uploadResourceFile(file,resourceId){
    if(!file||file.type!=='application/pdf')throw new Error(t('resource_pdf_only'));
    if(file.size===0)throw new Error(t('resource_invalid'));
    const maxSize=this.mode==='supabase'?10*1024*1024:200*1024;
    if(file.size>maxSize)throw new Error(this.mode==='supabase'?t('resource_file_large'):t('resource_file_large_demo'));
    const safeName=file.name.replace(/[^a-zA-Z0-9._-]/g,'_').slice(-100)||'handbook.pdf';
    if(this.mode==='supabase'){
      const path=`resources/${resourceId}/${Date.now()}_${safeName}`;
      await this.storage.ref(path).put(file,{contentType:'application/pdf'});
      return {fileName:file.name,filePath:path,fileData:'',fileSize:file.size};
    }
    const fileData=await new Promise((resolve,reject)=>{
      const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error(t('file_read_error')));reader.readAsDataURL(file);
    });
    return {fileName:file.name,filePath:'',fileData,fileSize:file.size};
  },
  async uploadExamResultFile(file,resultId,studentId){
    const maxSize=this.mode==='supabase'?10*1024*1024:200*1024;
    if(file.type!=='application/pdf'||!file.name.toLowerCase().endsWith('.pdf'))throw new Error(t('exam_pdf_only'));
    if(!file.size||file.size>maxSize)throw new Error(t(this.mode==='supabase'?'exam_pdf_too_large':'exam_pdf_too_large_demo'));
    if(this.mode==='supabase'){
      const path=`exam-results/${studentId}/${resultId}.pdf`;
      await this.storage.ref(path).put(file,{contentType:'application/pdf'});
      return {fileName:file.name.slice(0,180),filePath:path,fileData:'',fileSize:file.size};
    }
    const fileData=await new Promise((resolve,reject)=>{
      const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error(t('file_read_error')));reader.readAsDataURL(file);
    });
    return {fileName:file.name.slice(0,180),filePath:'',fileData,fileSize:file.size};
  },
  async downloadExamResultFile(result){
    let blob;
    if(this.mode==='supabase'){
      const bytes=await this.storage.ref(result.filePath).getBytes(10*1024*1024);
      blob=new Blob([bytes],{type:'application/pdf'});
    }else{
      const response=await fetch(result.fileData);
      if(!response.ok)throw new Error(t('file_read_error'));
      blob=await response.blob();
    }
    const url=URL.createObjectURL(blob),link=document.createElement('a');
    link.href=url;link.download=result.fileName||'exam-result.pdf';document.body.appendChild(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  },
  async deleteExamResultFile(path){
    if(this.mode==='supabase'&&path)await this.storage.ref(path).delete();
  },
  async downloadResourceFile(resource){
    let blob;
    if(this.mode==='supabase'){
      const bytes=await this.storage.ref(resource.filePath).getBytes(10*1024*1024);
      blob=new Blob([bytes],{type:'application/pdf'});
    }else{
      const response=await fetch(resource.fileData);
      if(!response.ok)throw new Error(t('file_read_error'));
      blob=await response.blob();
    }
    const url=URL.createObjectURL(blob),link=document.createElement('a');
    link.href=url;link.download=resource.fileName||'handbook.pdf';document.body.appendChild(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  },
  async deleteResourceFile(path){
    if(this.mode==='supabase'&&path)await this.storage.ref(path).delete();
  },
};

/* Synthetic email so students can sign in with a username through Supabase Auth. */
function synEmail(u){return u.toLowerCase().replace(/[^a-z0-9._-]/g,'')+'@vis-student.edu.krd';}
