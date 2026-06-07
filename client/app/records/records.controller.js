'use strict';

(function(){

class RecordsComponent {
  constructor($scope,$timeout,$interval,$http,toaster,appConfig,Modal,categoryFilterFilter) {
    this.categoryFilter=categoryFilterFilter;
    this.appConfig=appConfig;
    this.Modal=Modal;
    this.http=$http;
    this.timeout=$timeout;
    this.interval=$interval;
    this.scope=$scope;
    this.toaster=toaster;
    this.testString-'Test String';
    this.fileName='';
    this.file=null;
    this.files=null;
    this.fullFiles=[];
    this.queryObj={collection:'flights',limit:3000,parameter:'coPilot',value:'K. Janke'};
    this.assignmentSource=['B190','BE20','C208','C212','C408'];
    this.assignments=["Clear Selection"];
    this.tabs=['CERT','BI','HAZ','INTL','C208G','C408G','C212G','BE20G','B190G','RVSM','293A','C208','C408','C212','BE20','B190','297','297g','299','244','CFIT','FLT-INSTRUCTOR','CHECK-AIRMAN','OTHER-RECORDS'];
    this.subtabs=['Recurrent','Initial','Transition','Upgrade','Requalification'];
    this.categories=['Annual-Resume','Medical','Certificate','Drivers-License','Passport'];
    this.tab='CERT';
    this.dateString=new Date().toLocaleDateString();
    this.maxHeight=70;
    this.newPilot={};
    this.approvalEmails=['fen@beringair.com','nathaniel@beringair.com','nathanielwkolson@gmail.com','smirciat@gmail.com'];
      this.pilotsOld=[];
      this.months=[];
      var formLabels = ["Basic Indoc", "HAZMAT", "293(b) & 299", "297", "-", "Caravan", "1900", "King Air", "Sky Courier", "CASA"];
      this.suffices = ['baseIndoc','baseHazmat','base293','base297','-','base208','base1900','baseKingAir','base408','baseCasa'];
      this.trainingTypes=['none','initial','recurrent', 'transition', 'upgrade', 'requalification'];
      //['none','initial flight','initial ground','recurrent flight','recurrent ground','transition flight','transition ground','upgrade flight','upgrade ground','requalification flight','requalification ground'];
      this.types=['none','BasicIndoc','Hazmat','far299','far297','far297g','C208','B190','BE20','C408','C212'];
      this.instructors=['new','Kyle Lefebvre','Nick Hajdukovich','Fen Kinneen','Ryan Woehler','Nathaniel Olson','Mike R. Evans','Michael K. Evans','Andy Smircich','Neill Toelle','Josh Krebiehl','Tim Kunkel','Frank Parker','Tim Hopley','Scott Gordon'];
      this.formTypes=[];
      for (var i=0;i<formLabels.length;i++) {
        this.formTypes.push({label:formLabels[i],suffix:this.suffices[i],radio:false,id:i});
      }
      for (var i=1;i<13;i++){
        this.months.push(new Date(i + '/15/2020').toLocaleString('default', { month: 'long' }));
      }
      this.quickModal = this.Modal.confirm.quickMessage(response => {
      
      }); 
      this.radioModal = this.Modal.confirm.radio(formData => {
        //select training types
        let recordIndex = 0;
        if (formData._id) recordIndex= this.records.map(e => e._id).indexOf(formData._id);
        Object.assign(this.records[recordIndex],...formData);
        this.records[recordIndex].trainingTypeArray=[];
        for (let key in this.records[recordIndex]) {
          if (this.records[recordIndex][key]&&typeof this.records[recordIndex][key]=="boolean") {
            this.records[recordIndex][key]="true";
            this.records[recordIndex].trainingTypeArray.push(key);
            if (key!=='far297'){
              let expKey=key+'Exp';
              //find pilot record
              let pilotIndex = this.pilots.map(e => e.name).indexOf(this.records[recordIndex].name);
              if (pilotIndex>-1&&this.pilots[pilotIndex][expKey]) {
                let newMonth=new Date(this.pilots[pilotIndex][expKey]).toLocaleString('default', { month: 'long' });
                if (this.months.indexOf(newMonth)>-1) this.records[recordIndex].baseMonth=newMonth;
              }
            }
          }
          if (!this.records[recordIndex][key]&&typeof this.records[recordIndex][key]=="boolean") {
            this.records[recordIndex][key]="false";
          }
        }
      });
      this.pilotModal = this.Modal.confirm.pilotData(formData =>{
        console.log(formData);
        if (!formData||!formData.name) {
          console.log('got this far');
          this.quickModal("Try again to enter the pilot data");
          return;
        }
        //formData is this pilot data
        if (formData._id) {
          this.loading=false;
          //this.updateRecord('pilots',formData).then(res=>{
            //this.loading=false;
          //});
          //let pilotIndex = this.pilots.map(e => e._id).indexOf(formData._id);
          //this.pilots[pilotIndex]=JSON.parse(JSON.stringify(formData));
        }
        let recordIndex = this.records.map(e => e._id).indexOf(this.recordId);
        this.records[recordIndex].pilotNumber=formData._id.toString();
        //formData._id=this.recordId;
        //Object.assign(this.records[recordIndex],...formData);
      });
  }
  
  $onInit(){
    this.showSLEArray=[];
    this.tabs.forEach(tab=>{
      this.showSLEArray.push(false);
    });
    this.date=new Date();
    this.upDate();
    window.categories=this.categories;
    window.subtabs=this.subtabs;
    this.assignmentSource.forEach(a=>{
      this.assignments.push('PIC / ' + a);
      if (a==='B190'||a==='C408'||a==='C212') this.assignments.push('SIC / ' + a);
    });
    
    this.scope.$watch('$root.nav.chosenPilot',(newVal,oldVal)=>{
      if (newVal) this.queryObj.value=newVal.displayName;
      this.init();
    }); 
    this.scope.$watch('records.tab',(newVal,oldVal)=>{
      if (newVal) {
        if (newVal==='CERT') this.subs=this.categories;
        else this.subs=this.subtabs;
        this.subtab=undefined;
        this.seat=undefined;
      }
    });
    this.http.post('/api/things/firebase',{collection:'pilots'}).then(res=>{
      this.pilots=res.data;
      this.init();
    });
    
  }
  
  init(){
    this.flights=[];
    this.timeframe=0;
    this.expKey='';
    this.associated=undefined;
    let p={};
    if (this.pilots) p=this.pilots.filter(p=>p.displayName===this.queryObj.value)[0];
    else return;
    this.fullPilot=p;
    this.pilot=this.cleanObject(p);
    if (!this.pilot.quals||this.pilot.quals.length===0) this.pilot.quals=[{}];
    this.fullFiles.forEach(file=>{
      if (file.urlMain) URL.revokeObjectURL(file.urlMain);
    });
    this.fullFiles=[];
    //get file list from records that start with this.pilot employee number
    this.http.post('/api/raws/listRecords').then(res=>{
      if (!res.data) return;
      let list=JSON.parse(res.data);
      this.files=list.filter(file=>file.startsWith(this.pilot._id.toString()));
      this.getPilotsFiles();
    });
    //get records from api for this pilot
    this.http.post('/api/things/firebaseQuery',{collection:'records',parameter:'pilotNumber',value:this.pilot._id.toString()}).then(res=>{
      this.records=res.data;
      this.refreshRecords();
    });
  }
  
  loggedIn(){
    return window.user&&window.user.accessToken;
  }
  
  cleanObject(p){
    return {
      _id:p._id,name:p.name,quals:p.quals,ratings:p.ratings,other:p.other,otherDescription:p.otherDescription,
      cfi:p.cfi,commercial:p.commercial,atp:p.atp,cert:p.cert,medicalClass:p.medicalClass,medicalDate:p.medicalDate
    };
  }
  
  selectPda(row,index){
    if (row.pda==="Clear Selection") {
      if (index||index===0) this.pilot.quals[index]={};
    }
  }
  
  formatDate(dateString){
    let date=new Date(dateString);
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    
    return `${mm}${dd}${yyyy}`;
  }
  
  getDate(file){
    let arr=file.split('_');
    let str=arr[1];
    str=str.slice(0, 2) + '/' + str.slice(2);
    str=str.slice(0, 5) + '/' + str.slice(5);
    return new Date(str).toLocaleDateString();
  }
  
  upDate(key){
    //this.isCollapsed=true;
    if (key==='string') this.date=new Date(this.dateStringFormatted);
    this.dateString=this.date.toLocaleDateString();
    this.dateStringFormatted=this.date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'numeric',//''long', 
        day: 'numeric' 
    });
  }
  
  handle(event){
    if (event.keyCode === 13 && !event.shiftKey) {
      event.preventDefault(); 
      this.upDate('string');
    }
  }
  
  whichSubs(cat){
    if (cat==='CERT') return this.categories;
    return this.subtabs;
  }
  
  add(){
    if ((!this.tab||!this.subtab)&&!this.associated) return this.toaster.error('Error','Need to select a tab before uploading');
    if (this.tab==='C212'||this.tab==='B190'||this.tab==='C408') {
      if (!this.seat) return this.toaster.error('Error','Need to select PIC or SIC for this aircraft');
    }
    else this.seat=undefined;
    if (!this.pilot||!this.pilot._id) return this.toaster.error('Error','Need to select a pilot in the navbar before uploading');
    let files=Array.from(document.getElementById('file').files);
    if (files&&files.length>0) {
      let f=files[0];
      //for of loop if multiple uploads of this file
      let tabArray=[];
      if (this.associated) {
        this.associated.trainingTypeArray.forEach(type=>{
          const sub=this.associated.trainingType.charAt(0).toUpperCase() + this.associated.trainingType.slice(1).toLowerCase();
          const {tab,seat}=this.typeToTab(type);
          tabArray.push({tab:tab,sub:sub,seat:seat});
        });
      }
      else tabArray=[{tab:this.tab,sub:this.subtab,seat:this.seat}];
      for (const [index,obj] of tabArray.entries()) {
        let x=0;
        let filename=this.setFilename(f.name,obj);
        let r = new FileReader();
        r.onloadend = e=>{
          this.http.post('/api/raws/uploadRecord',{data:btoa(e.target.result),filename:filename}).then(res=>{
            //update training exp date in accordance with new upload, checking for errors and alerting of the changes
            if (this.subtab==='Medical') {
              let doc={_id:this.pilot._id};
              doc.medicalDate = this.dateString;
              this.http.post('/api/things/updateFirebase',{collection:'pilots',doc:doc}).then(res=>{
                this.fullPilot.medicalDate = this.dateString;
                let index=this.pilots.map(e=>e._id).indexOf(this.pilot._id);
                if (index>-1) Object.assign(this.pilots[index], ...doc );
                this.toaster.success('Success','medical updated to ' + this.dateString);
                this.init();
              }).catch(err=>{console.log(err)});
            }
            else {
              this.timeout(()=>{
                if (index>=tabArray.length-1) this.init();
              },1000);
            }
            let d=document.getElementById('file');
            //if this fires, it will clear the selected file to prevent repeated uploads, disabled for now
            //if (d) d.value='';
          }).catch(err=>{
            console.log(err);
            this.toaster.error('Error','File upload failed');
          });
        };
        r.readAsBinaryString(f);
        x++;
      }
    }
    else this.toaster.error('Error','Need to finish adding the file first');
  }
  
  updateExp(record){
    //this is now coming from a record
    if (!record.trainingTypeArray||record.trainingTypeArray.length===0) return;
    record.trainingTypeArray.forEach(type=>{
      //convert type to tab
      const {tab,seat}=this.typeToTab(type);
      if (!tab) return;
      //get exp timeframe and field name
      const {expKey,expKeyAlt,timeframe} = this.setExp(tab,seat);
      //timeframe and expKey are set
      //if this timeframe and its not zero, update the pilot record exp date
      if (timeframe&&expKey) {
        //find existing exp date, if rebasing
        let date=new Date(record.date);
        let existingDate;
        let dateexists=this.fullPilot[expKey];
        if (dateexists) existingDate=new Date(dateexists);
        //if early or late grace, and rebase is false
        if (this.isWithinOneMonth(date,existingDate)) {
          if (!record.newBaseMonth||record.newBaseMonth==='false') date=existingDate;
          if (!confirm('Are you sure you want to create a new base month?  It appears you are within the window.')) {
            this.toaster.error('Error','Expiration date not updated');
            //this.init();
            return;
          }
        }
        else {
          if ((!record.newBaseMonth||record.newBaseMonth==='false')&&dateexists) {
            this.toaster.error('Error','You are not within the window for this event, you will have to rebase to save a new Exp date. Expiration date not updated');
            //this.init();
            return;
          }
        }
        
        let newDate = new Date(new Date(date).setMonth(date.getMonth() + timeframe));
        if (newDate<existingDate) {
          console.log(existingDate);
          console.log(newDate);
          this.toaster.error('Error','New expiration date should not be earlier than the existing one! Expiration date not updated');
          //this.init();
          return;
        }
        if (confirm('Update expiration for ' + expKey + ' to ' + newDate.toLocaleDateString() + '?')){
          let doc={_id:this.pilot._id};
          doc[expKey] = newDate.toLocaleDateString();
          if (expKeyAlt) doc[expKeyAlt] = newDate.toLocaleDateString();
          this.http.post('/api/things/updateFirebase',{collection:'pilots',doc:doc}).then(res=>{
            this.fullPilot[expKey] = newDate.toLocaleDateString();
            let index=this.pilots.map(e=>e._id).indexOf(this.pilot._id);
            if (index>-1) Object.assign(this.pilots[index], ...doc );
            //this.init();
          }).catch(err=>{console.log(err)});
        }
        else {
          this.toaster.error('Error','expiration date not updated');
          //this.init();
          return;
        }
      }
    });
  }
  
  typeToTab(type){
    //['BasicIndoc','Hazmat','far299','far297','far297g','C208PIC','C208TKS','C208Ground','B190PIC','B190SIC','B190Ground','BE20PIC','BE20Ground','C408PIC','C408SIC','C408Ground','C212PIC','C212SIC','C212Ground','CheckAirmanObs','FlightInstructorObs']
    //['CERT','BI','HAZ','INTL','C208G','C408G','C212G','BE20G','B190G','RVSM','293A','C208','C408','C212','BE20','B190','297','297g','299','244','CFIT','FLT-INSTRUCTOR','CHECK-AIRMAN','OTHER-RECORDS'];
    let tab,seat;
    switch (type) {
      case 'FlightInstructorObs':
        tab="FLT-INSTRUCTOR";
        break;
      case 'CheckAirmanObs':
        tab="CHECK-AIRMAN";
        break;
      case 'C212Ground':
        tab="C212G";
        break;
      case 'C212PIC':
        tab="C212";
        seat="PIC";
        break;
      case 'C212SIC':
        tab="C212";
        seat="SIC";
        break;
      case 'C408Ground':
        tab="C408G";
        break;
      case 'C408SIC':
        tab="C408";
        seat="SIC";
        break;
      case 'C408PIC':
        tab="C408";
        seat="PIC";
        break;
      case 'BE20Ground':
        tab="BE20G";
        break;
      case 'BE20PIC':
        tab="BE20";
        break;
      case 'B190Ground':
        tab="B190G";
        break;
      case 'B190SIC':
        tab="B190";
        seat="SIC";
        break;
      case 'B190PIC':
        tab="B190";
        seat="PIC";
        break;
      case 'C208Ground':
        tab="C208G";
        break;
      case 'C208TKS':
        tab="OTHER-RECORDS";
        break;
      case 'BasicIndoc':
        tab="BI";
        break;
      case 'Hazmat':
        tab="HAZ";
        break;
      case 'far299':
        tab="299";
        break;
      case 'far297':
        tab="297";
        break;
      case 'far297g':
        tab="297g";
        break;
      case 'C208PIC':
        tab="C208";
        break;
      default:
        tab=type;
        break;
    }
    return {tab:tab,seat:seat};
  }
  
  isWithinOneMonth(testDate, refDate) {
    if (!refDate) return false;
    testDate=new Date(testDate);
    refDate=new Date(refDate);
    // Create new Date objects to avoid mutating original dates
    const lowerBound = new Date(refDate);
    const upperBound = new Date(refDate);

    // Set boundaries to one month before and after
    lowerBound.setMonth(refDate.getMonth() - 1);
    upperBound.setMonth(refDate.getMonth() + 1);

    // Return true if testDate is within the inclusive range
    return testDate >= lowerBound && testDate <= upperBound;
}
  
  setFilename(filename,obj){
    let fn='';
    let date=this.dateString;
    if (this.associated) date=this.associated.date;
    fn=this.pilot._id+'_'+this.formatDate(date)+'_'+obj.tab+'_';
    if (obj.sub) fn+=obj.sub+'_';
    if (obj.seat) fn+=obj.seat+'_';
    if (this.associated) fn+='associated_'+this.associated._id+'_';
    fn+=filename;
    return fn;
  }
  
  setExp(tab,seat){
    if (!seat) seat="PIC";
    if (!tab) return {};
    let timeframe,expKey,expKeyAlt;
    switch (tab) {
      case 'CERT':
        timeframe=0;
        break;
      case 'HAZMAT':
        timeframe=24;
        break;
      case 'INTL':
        timeframe=0;
        break;
      case '297':
        timeframe=6;
        break;
      case 'RVSM':
        timeframe=0;
        break;
      case '244':
        timeframe=0;
        break;
      case 'CFIT':
        timeframe=0;
        break;
      case 'FLT-INSTRUCTOR':
        timeframe=24;
        break;
      case 'CHECK-AIRMAN':
        timeframe=24;
        break;
      case 'OTHER-RECORDS':
        timeframe=12;
        break;
      default:
        timeframe=12;
        break;
    }
    expKey='';
    if (timeframe===0) {
      return;
    }
    switch (tab) {
      case 'BI':
        expKey='BasicIndocExp';
        expKeyAlt='far293a148';
        break;
      case 'HAZ':
        expKey='HazmatExp';
        break;
      case 'FLT-INSTRUCTOR':
        expKey='FlightInstructorObsExp';
        break;
      case 'CHECK-AIRMAN':
        expKey='CheckAirmanObsExp';
        break;
      case 'OTHER-RECORDS':
        expKey='C208TKSExp';
        break;
      default:  
        if (/^\d/.test(tab)) {
          //first character is an integer
          expKey='far' + tab + 'Exp';
          break;
        }
        if (tab.at(-1)==="G") {
          //All the ground currency tabs
          expKey=tab+'roundExp';
          expKeyAlt=tab+'OSExp';
          break;
        }
        if (tab.substring(0,1)==="C"||tab.substring(0,1)==="B") {
          expKey=tab + seat + 'Exp';
          break;
        }
    }
    return {timeframe:timeframe,expKey:expKey,expKeyAlt:expKeyAlt};
  }
  
  getPilotsFiles(){
    this.singleLineEntry=[];
    this.tabs.forEach(tab=>{
      this.singleLineEntry.push({tab:tab,lines:[]});
    });
    this.files.forEach(filename=>{
      //populate SLE
      let type,inst,associated,date;
      const arr=filename.split('_');
      const index=this.tabs.indexOf(arr[2]);
      if (index>-1){
        type=arr[3];
        if (arr[4]==='PIC'||arr[5]==='SIC') type+=' '+arr[4];
        arr.forEach((str,i)=>{
          if (str==="associated") associated=arr[i+1];
        });
        if (associated){
          console.log(associated)
          console.log(this.records)
          console.log(this.records.map(e=>e._id))
        }
        let recordsIndex=-1;
        if (this.records) recordsIndex=this.records.map(e=>e._id).indexOf(associated);
        if (recordsIndex>-1) {
          if (this.records[recordsIndex].checkAirman) inst=this.records[recordsIndex].checkAirman;
          if (this.records[recordsIndex].instructor) inst=this.records[recordsIndex].instructor;
        }
        if (arr[1]&&typeof arr[1]==='string'&&arr[1].length>4) date=arr[1].substring(0,2)+'/'+arr[1].substring(2,4)+'/'+arr[1].slice(4);
        this.singleLineEntry[index].lines.push({name:this.pilot.name,cert:this.pilot.cert,date:date,type:type,inst:inst});
      }
      
      //get the file
      this.http({ url: "/records?filename=" + filename,
          method: "GET", 
          responseType: 'arraybuffer' })
        .then(response=> {
          let obj={type:'application/pdf'};
          if (filename.split('.')[filename.split('.').length-1]!=='pdf') obj={type:'image/jpeg'};
  		    let blob = new Blob([response.data],obj);
  		    let arr=filename.split('.');
  		    let type='image';
  		    if (arr[arr.length-1]==='pdf') type='pdf';
  		    this.fullFiles.push({maxHeight:this.maxHeight,filename:filename,date:new Date(this.getDate(filename)),type:type,urlMain:URL.createObjectURL(blob)});
        });
    });  
  }
  
  downloadFile(filename){
    this.http({ url: "/records?filename=" + filename,
          method: "GET", 
          responseType: 'arraybuffer' })
        .then(response=> {
  		    let blob = new Blob([response.data]);
  	      saveAs(blob, filename);
        }).catch(err=>{
          this.toaster.error('Error',"File Not Found");
          console.log(err);
          this.loading=false;
        });
  }
  
  deleteFile(filename){
    let answer=confirm("Are you sure you want to delete this file?");
    if (answer) {
      this.http.post('/api/raws/deleteRecord',{filename:filename}).then(res=>{
        console.log(res.data);
        this.init();
      });
    }
  }
  
  savePilotAssignment(){
    let arr=JSON.parse(JSON.stringify(this.pilot.quals));
    let indexesToRemove=[];
    for (let [index,row] of arr.entries()){
      if (!row.pda) indexesToRemove.push(index);
    }
    let filtered = this.pilot.quals.filter((_, index) => !indexesToRemove.includes(index));
    this.pilot.quals = filtered;
    this.http.post('/api/things/updateFirebase',{collection:'pilots',doc:this.pilot}).then(res=>{
      let index=this.pilots.map(e=>e._id).indexOf(this.pilot._id);
      if (index>-1) Object.assign(this.pilots[index], ...this.pilot );
      this.toaster.success('Success','Pilot '+this.pilot.name+' is updated');
    }).catch(err=>{console.log(err)});
  }
  
  seatArray(cat){
    if (cat==="B190"||cat==="C212"||cat==="C408") return ['PIC','SIC'];
    return [null];
  }
  
  filterCheck(cat,sub,seat){
    let array=this.categoryFilter(this.fullFiles,cat,sub,seat);
    return array.length>0;
  }
  
  update(record,index){
    if (!record.trainingTypeArray||record.trainingTypeArray.length===0) return alert('You Need to Select at least one training type before saving');
    //create or update record in firebase, if it was a new record, unshift a new new one
    this.http.post('/api/things/updateFirebase',{collection:'records',doc:record}).then(res=>{
      this.records[index]=res.data;
      if (this.records[0]._id) this.records.unshift({name:this.fullPilot.name,pilotNumber:this.fullPilot._id.toString(),date:new Date().toLocaleDateString(),newBaseMonth:'false',trainingType:'recurrent',baseMonth:new Date().toLocaleString('default', { month: 'long' })});
    });
  }
  
  approve(record,index){
    if (!record._id) return alert('You Need to Save it Before Approving it');
    //update in firebase and update relevant exp date
    record.approved=true;
    this.http.post('/api/things/updateFirebase',{collection:'records',doc:record}).then(res=>{
      this.records[index]=res.data;
      this.updateExp(record);
    });
  }
  
  delete(record,index){
    if (!record._id) return alert('No ID associated with this record, nothing to delete in Firestore');
    //remove record from firebase and update local array
    this.http.post('/api/things/deleteFirebase',{id:record._id}).then(res=>{
      this.records.splice(index,1);
    })
    .catch(err=>{console.log(err)});
  }
  
  isItDisabled(button){
    if (button&&button==='approve'){
      if (window.user&&this.approvalEmails.indexOf(window.user.email)>-1) {
        return false;
      }
      else return true;
    }
  }
  
  newRecordClass(record){
    if (!record._id) return "darkBackground";
    if (!record.approved) return "blueBackground";
    return "approvedBackground";
  }
  
  displayArray(record){
    if (!record) return "No Type Selected";
    let result="";
    if (record.trainingTypeArray&&record.trainingTypeArray.length>0) {
      record.trainingTypeArray.forEach((type,index)=>{
        if (index>0) result+=", ";
        result+=type;
      });
    }
    else return "No Type Selected";
    return result;
  }
  
  refreshRecords(){
    this.records.forEach(record=>{
      if (this.fullPilot&&this.fullPilot._id){
        if (!record.dateOfBirth) record.dateOfBirth=this.fullPilot.dateOfBirth;
        if (!record.medicalDate) record.medicalDate=this.fullPilot.medicalDate;
        if (!record.medicalClass) record.medicalClass=this.fullPilot.medicalClass;
        if (!record.cert) record.cert=this.fullPilot.cert;
        if (!record.certType) record.certType=this.fullPilot.certType;
        if (!record.name) record.name=this.fullPilot.name;
        record.trainingTypeCombo=record.trainingType + ' ' + record.flightOrGround;
        record.trainingTypeArray=[];
        this.appConfig.trainingEventKeys.forEach(key=>{
          if (record[key]&&record[key]==="true") {
            if (key.slice(0,3)==="far") key=key.substring(3);
            record.trainingTypeArray.push(key);
          }
        });
      }
    });
    this.records.sort((a,b)=>{
      return new Date(b.date) - new Date(a.date);
    });
    this.records.unshift({name:this.fullPilot.name,pilotNumber:this.fullPilot._id.toString(),date:new Date().toLocaleDateString(),newBaseMonth:'false',trainingType:'recurrent',baseMonth:new Date().toLocaleString('default', { month: 'long' })});
    //this.scope.$apply();
  }
}

angular.module('rotApp')
  .filter('recordFilter',()=>{
    return function(input, showApproved) {
      if (!input||!Array.isArray(input)) return [];
      if (showApproved) return input;
      return input.filter(record=>{
        return !record.approved;
      });
    };
  })
  .filter('categoryFilter',()=>{
    return function(input, cat, sub, seat) {
      if (!input||!Array.isArray(input)) return [];
      
      if (seat) {
        return input.filter(item => {
          let arr=item.filename.split('_');
          if (arr[4]!=="PIC") arr[4]="SIC";
          return arr[2]===cat&&arr[3]===sub&&arr[4]===seat;
        });
      }
      
      if (sub) {
        return input.filter(item => {
          let arr=item.filename.split('_');
          return arr[2]===cat&&arr[3]===sub;
        });
      }
      
      return input.filter(item => {
          let arr=item.filename.split('_');
          return arr[2]===cat;
        });
    };
  })
  .component('records', {
    templateUrl: 'app/records/records.html',
    controller: RecordsComponent,
    controllerAs: 'records'
  });

})();
