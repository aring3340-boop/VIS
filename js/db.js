
/* ===== VIS Institute — Supabase data layer ===== */
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

function supabaseFetchWithTimeout(input,init={}){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),8000);
  if(init.signal){
    if(init.signal.aborted)controller.abort(init.signal.reason);
    else init.signal.addEventListener('abort',()=>controller.abort(init.signal.reason),{once:true});
  }
  return fetch(input,{...init,cache:'no-store',signal:controller.signal}).finally(()=>clearTimeout(timer));
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

async function defaultData(){
  return {
    settings:{
      siteName_en:'Vocational Institute of Sulaimanyah',siteName_ku:'پەیمانگەی پیشەیی سلێمانی',
      heroTitle_en:'Professional Skills for a Changing World',heroTitle_ku:'شارەزایی پیشەیی بۆ جیهانێکی گۆڕاو',
      heroSub_en:'Practical technical and vocational education in information technology, business, design and tourism, supported by experienced instructors.',
      heroSub_ku:'پەروەردەی کرداری و پیشەیی لە تەکنەلۆژیای زانیاری، بازرگانی، دیزاین و گەشتیاری، بە پشتگیری مامۆستایانی شارەزا.',
      about_en:'The Vocational Institute of Sulaimanyah is a leading institution dedicated to practical, career-focused education. We prepare students for the modern workforce through hands-on training, industry-aligned curricula, and experienced instructors across information technology, business, design and tourism trades.',
      about_ku:'پەیمانگەی پیشەیی سلێمانی دامەزراوەیەکی پێشەنگە تەرخانکراوە بۆ پەروەردەی پراکتیکی ئامادەی کار. ئێمە قوتابیان ئامادەی بازاڕی کار دەکەین بە ڕاهێنانی پراکتیکی، بەرنامەی پەیوەست بە پیشە و مامۆستایانی شارەزا لە بوارەکانی تەکنەلۆژیای زانیاری، بازرگانی، دیزاین و گەشتیاری.',
      address_en:'Salim Street, Sulaymaniyah, Kurdistan Region, Iraq',address_ku:'شەقامی سالم، سلێمانی، هەرێمی کوردستان، عێراق',
      phone:'+964 770 000 0000',email:'visinstitute@gmail.com',officeHours_en:'',officeHours_ku:'',since:'2024',studentCount:0,trainerCount:'50+',ownerInitialized:false,
      socials:{facebook:'',instagram:'',youtube:'',telegram:'',whatsapp:''}
    },
    programs:[
      {id:'pr1',icon:'💻',title_en:'Information Technology',title_ku:'تەکنەلۆژیای زانیاری',desc_en:'Software development, networking, databases and office productivity for the digital workplace.',desc_ku:'پەرەپێدانی نەرمەکالا، تۆڕ، بنکەدراو و ئەپڵیکەیشنی ئۆفیس بۆ شوێنی کارە دیجیتاڵییەکان.',courses_en:'Software development\nComputer networking\nDatabase fundamentals\nOffice productivity',courses_ku:'پەرەپێدانی نەرمەکالا\nتۆڕی کۆمپیوتەر\nبنەماکانی بنکەدراو\nبەرهەمهێنانی ئۆفیس',careers_en:'Junior software developer\nIT support technician\nNetwork support assistant',careers_ku:'پەرەپێدەری نەرمەکالای سەرەتایی\nتەکنیکی پشتیوانی تەکنەلۆژیای زانیاری\nیاریدەدەری پشتیوانی تۆڕ'},
      {id:'pr2',icon:'📊',title_en:'Business',title_ku:'بازرگانی',desc_en:'Accounting, marketing, and management skills for modern businesses and entrepreneurship.',desc_ku:'ژمێریاری، بازرگانی و شارەزایی بەرێوەبردن بۆ بازرگانییە نوێکان و خاوەنکارایەتی.',courses_en:'Accounting fundamentals\nMarketing\nBusiness management\nEntrepreneurship',courses_ku:'بنەماکانی ژمێریاری\nبازرگانی\nبەرێوەبردنی بازرگانی\nخاوەنکارایەتی',careers_en:'Bookkeeping assistant\nMarketing assistant\nOffice administrator',careers_ku:'یاریدەدەری تۆمارکردنی ژمێریاری\nیاریدەدەری بازرگانی\nبەرێوەبەری نووسینگە'},
      {id:'pr3',icon:'🎨',title_en:'Design',title_ku:'دیزاین',desc_en:'Creative and practical design skills for visual communication and digital media.',desc_ku:'شارەزایی داهێنەرانە و پراکتیکی دیزاین بۆ پەیوەندیی بینراو و میدیای دیجیتاڵی.',courses_en:'Graphic design\nVisual communication\nDigital media',courses_ku:'دیزاینی گرافیکی\nپەیوەندیی بینراو\nمیدیای دیجیتاڵی',careers_en:'Graphic design assistant\nVisual content creator\nDigital media assistant',careers_ku:'یاریدەدەری دیزاینی گرافیکی\nدروستکەری ناوەڕۆکی بینراو\nیاریدەدەری میدیای دیجیتاڵی'},
      {id:'pr4',icon:'🧳',title_en:'Tourism',title_ku:'گەشتیاری',desc_en:'Practical skills for tourism, hospitality, and visitor services.',desc_ku:'شارەزایی پراکتیکی بۆ گەشتیاری، میوانداری و خزمەتگوزاریی سەردانکەران.',courses_en:'Tourism fundamentals\nHospitality\nVisitor services',courses_ku:'بنەماکانی گەشتیاری\nمیوانداری\nخزمەتگوزاریی سەردانکەران',careers_en:'Tourism services assistant\nHospitality assistant\nVisitor information assistant',careers_ku:'یاریدەدەری خزمەتگوزاریی گەشتیاری\nیاریدەدەری میوانداری\nیاریدەدەری زانیاریی سەردانکەران'}
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
    students:[],
    messages:[],certificates:[],notifications:[],accessRequests:[],schedule:[],assignments:[],materials:[],submissions:[],
    examResults:[],publicTimetable:[],
    admins:[]
  };
}

function applySubjectCopyUpdates(settings){
  const updates={
    heroSub_en:['technology, business, design and tourism','information technology, business, design and tourism'],
    about_en:['technology, business, health, and engineering','information technology, business, design and tourism'],
    heroSub_ku:['تەکنەلۆژیا، بازرگانی، تەندروستی و ئەندازیاری','تەکنەلۆژیای زانیاری، بازرگانی، دیزاین و گەشتیاری'],
    about_ku:['تەکنەلۆژیا، بازرگانی، تەندروستی و ئەندازیاری','تەکنەلۆژیای زانیاری، بازرگانی، دیزاین و گەشتیاری']
  };
  Object.entries(updates).forEach(([field,[oldList,newList]])=>{
    const value=settings[field];
    if(typeof value==='string'&&!value.includes(newList))settings[field]=value.replace(oldList,newList);
  });
  if(typeof settings.heroSub_en==='string')settings.heroSub_en=settings.heroSub_en.replace('tourism ,','tourism,');
}

/* ---------- Store: Supabase backend ---------- */
const Store={
  mode:'supabase',data:null,db:null,auth:null,storage:null,functions:null,supabase:null,legacyPublicResources:false,
  async init(){
    if(typeof supabaseConfigured!=='function'||!supabaseConfigured()){
      throw new Error('Supabase configuration is required.');
    }
    await loadSupabaseSDK();
    if(!window.supabase?.createClient)throw new Error('Supabase SDK could not be loaded.');
    this.supabase=window.supabase.createClient(SUPABASE_CONFIG.url,SUPABASE_CONFIG.anonKey,{global:{fetch:supabaseFetchWithTimeout}});
    this.db=makeDatabaseAdapter(this.supabase);
    this.auth=this.supabase.auth;
    this.storage=makeStorageAdapter(this.supabase);
    this.functions={httpsCallable:name=>async data=>{
      const {data:result,error}=await this.supabase.functions.invoke(name,{body:data});
      if(error)throw supabaseError(error);
      return {data:result};
    }};
    await this.cloudLoad();
  },
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
      const merged=seed?{...seed,...program}:program;
      const legacyTitles={
        pr2:'Business Administration',
        pr3:'Health & Nursing',
        pr4:'Electrical & Electronics'
      };
      return legacyTitles[program.id]===program.title_en?{...merged,...seed}:merged;
    });
    const settings=await this.db.collection('settings').doc('main').get();
    if(settings.exists){
      const settingsData=settings.data();
      this.legacyPublicResources=Object.prototype.hasOwnProperty.call(settingsData,'publicResources');
      this.data.settings={...def.settings,...settingsData};
    }
    applySubjectCopyUpdates(this.data.settings);
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
    await this.db.collection(collName).doc(obj.id).set(obj);
    if(collName==='schedule')await this.publishSchedule(obj);
    const a=this.data[collName];const i=a.findIndex(x=>x.id===obj.id);
    if(i>=0)a[i]=obj;else a.push(obj);
  },
  async del(collName,id){
    if(collName==='schedule')await this.db.collection('publicTimetable').doc(id).delete();
    await this.db.collection(collName).doc(id).delete();
    this.data[collName]=this.data[collName].filter(x=>x.id!==id);
  },
  async publishSchedule(entry){
    const ref=this.db.collection('publicTimetable').doc(entry.id);
    if(!entry.weekly){await ref.delete();return;}
    const {id,kind,dept,stage,weekday,startTime,endTime,course,room}=entry;
    await ref.set({id,kind,dept,stage,weekday,startTime,endTime,course,room});
  },
  async saveSettings(patch){
    const settings={...this.data.settings,...patch};
    delete settings.publicResources;
    await this.db.collection('settings').doc('main').set(JSON.parse(JSON.stringify(settings)));
    this.data.settings=settings;
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
    if(file.size>2*1024*1024)throw new Error(t('file_too_large'));
    const safeName=file.name.replace(/[^a-zA-Z0-9._-]/g,'_');
    const path=`submissions/${assignmentId}/${studentId}/${Date.now()}_${safeName}`;
    await this.storage.ref(path).put(file);
    return {fileName:file.name,filePath:path,fileData:''};
  },
  async downloadSubmission(submission){
    const result=await this.functions.httpsCallable('get-submission-download')({submissionId:submission.id});
    const link=document.createElement('a');link.href=result.data.url;link.download=submission.fileName||'submission';
    link.target='_blank';
    document.body.appendChild(link);link.click();link.remove();
  },
  async deleteSubmissionFile(path){
    if(path)await this.storage.ref(path).delete();
  },
  async uploadResourceFile(file,resourceId){
    if(!file||file.type!=='application/pdf')throw new Error(t('resource_pdf_only'));
    if(file.size===0)throw new Error(t('resource_invalid'));
    const maxSize=10*1024*1024;
    if(file.size>maxSize)throw new Error(t('resource_file_large'));
    const safeName=file.name.replace(/[^a-zA-Z0-9._-]/g,'_').slice(-100)||'handbook.pdf';
    const path=`resources/${resourceId}/${Date.now()}_${safeName}`;
    await this.storage.ref(path).put(file,{contentType:'application/pdf'});
    return {fileName:file.name,filePath:path,fileData:'',fileSize:file.size};
  },
  async uploadExamResultFile(file,resultId,studentId){
    const maxSize=10*1024*1024;
    if(file.type!=='application/pdf'||!file.name.toLowerCase().endsWith('.pdf'))throw new Error(t('exam_pdf_only'));
    if(!file.size||file.size>maxSize)throw new Error(t('exam_pdf_too_large'));
    const path=`exam-results/${studentId}/${resultId}.pdf`;
    await this.storage.ref(path).put(file,{contentType:'application/pdf'});
    return {fileName:file.name.slice(0,180),filePath:path,fileData:'',fileSize:file.size};
  },
  async downloadExamResultFile(result){
    const bytes=await this.storage.ref(result.filePath).getBytes(10*1024*1024);
    const blob=new Blob([bytes],{type:'application/pdf'});
    const url=URL.createObjectURL(blob),link=document.createElement('a');
    link.href=url;link.download=result.fileName||'exam-result.pdf';document.body.appendChild(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  },
  async deleteExamResultFile(path){
    if(path)await this.storage.ref(path).delete();
  },
  async downloadResourceFile(resource){
    const bytes=await this.storage.ref(resource.filePath).getBytes(10*1024*1024);
    const blob=new Blob([bytes],{type:'application/pdf'});
    const url=URL.createObjectURL(blob),link=document.createElement('a');
    link.href=url;link.download=resource.fileName||'handbook.pdf';document.body.appendChild(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  },
  async deleteResourceFile(path){
    if(path)await this.storage.ref(path).delete();
  },
};

/* Synthetic email so students can sign in with a username through Supabase Auth. */
function synEmail(u){return u.toLowerCase().replace(/[^a-z0-9._-]/g,'')+'@vis-student.edu.krd';}
