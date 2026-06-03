'use strict';

(function(){

class RecordsComponent {
  constructor($scope,$timeout,$interval,$http,toaster) {
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
  }
  
  $onInit(){
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
    //this.myInterval=this.interval(()=>{
      //let fileWatch;
      //let d=document.getElementById('file');
      //if (d&&d.files) fileWatch=Array.from(d.files);
      //if (fileWatch&&fileWatch.length>0) this.add();
    //},1000);
    this.http.post('/api/things/firebase',{collection:'pilots'}).then(res=>{
      this.pilots=res.data;
      this.init();
    });
  }
  
  init(){
    this.flights=[];
    this.timeframe=0;
    this.expKey='';
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
    if (!this.tab||!this.subtab) return this.toaster.error('Error','Need to select a tab before uploading');
    if (this.tab==='C212'||this.tab==='B190'||this.tab==='C408') {
      if (!this.seat) return this.toaster.error('Error','Need to select PIC or SIC for this aircraft');
    }
    else this.seat='PIC';
    if (!this.pilot||!this.pilot._id) return this.toaster.error('Error','Need to select a pilot in the navbar before uploading');
    let files=Array.from(document.getElementById('file').files);
    if (files&&files.length>0) {
      let f=files[0];
        this.timeframe=0;
        this.expKey=undefined;
        this.expKeyAlt=undefined;
        let filename=this.setFilename(f.name);
        //if (!confirm('Confirm uploading file ' + filename+ ' for ' + this.pilot.name)) return;
        let r = new FileReader();
        r.onloadend = e=>{
          this.http.post('/api/raws/uploadRecord',{data:btoa(e.target.result),filename:filename}).then(res=>{
            //update training exp date in accordance with new upload, checking for errors and alerting of the changes
            //get exp timeframe and field name
            this.setExp();
            //this.timeframe and this.expKey are set
            //if this timeframe and its not zero, update the pilot record exp date
            if (this.timeframe&&this.expKey) {
              //find existing exp date, if rebasing
              let date=new Date(this.date);
              let existingDate;
              let dateexists=this.fullPilot[this.expKey];
              if (dateexists) existingDate=new Date(dateexists);
              //if early or late grace, and rebase is false
              if (this.isWithinOneMonth(date,existingDate)) {
                if (!this.rebase) date=existingDate;
                if (!confirm('Are you sure you want to create a new base month?  It appears you are within the window.')) {
                  this.toaster.error('Error','File upload successful, but expiration date not updated');
                  this.init();
                  return;
                }
              }
              else {
                if (!this.rebase&&dateexists) {
                  this.toaster.error('Error','You are not within the window for this event, you will have to rebase to save a new Exp date. File upload successful, but expiration date not updated');
                  this.init();
                  return;
                }
              }
              
              let newDate = new Date(new Date(date).setMonth(date.getMonth() + this.timeframe));
              if (newDate<existingDate) {
                console.log(existingDate);
                console.log(newDate);
                this.toaster.error('Error','New expiration date should not be earlier than the existing one! File upload successful, but expiration date not updated');
                this.init();
                return;
              }
              if (confirm('Update expiration for ' + this.expKey + ' to ' + newDate.toLocaleDateString() + '?')){
                let doc={_id:this.pilot._id};
                doc[this.expKey] = newDate.toLocaleDateString();
                if (this.expKeyAlt) doc[this.expKeyAlt] = newDate.toLocaleDateString();
                this.http.post('/api/things/updateFirebase',{collection:'pilots',doc:doc}).then(res=>{
                  this.fullPilot[this.expKey] = newDate.toLocaleDateString();
                  let index=this.pilots.map(e=>e._id).indexOf(this.pilot._id);
                  if (index>-1) Object.assign(this.pilots[index], ...doc );
                  this.init();
                }).catch(err=>{console.log(err)});
              }
              else {
                this.toaster.error('Error','File upload successful, but expiration date not updated');
                this.init();
                return;
              }
            }
            else {
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
                  this.init();
                },500);
              }
            }
            let d=document.getElementById('file');
            //if (d) d.value='';
          }).catch(err=>{
            console.log(err);
            this.toaster.error('Error','File upload failed');
          });
        };
        r.readAsBinaryString(f);
      
    }
    else this.toaster.error('Error','Need to finish adding the file first');
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
  
  setFilename(filename){
    let fn='';
    fn=this.pilot._id+'_'+this.formatDate(this.dateString)+'_'+this.tab+'_';
    if (this.subtab) fn+=this.subtab+'_';
    fn+=filename;
    return fn;
  }
  
  setExp(){
    switch (this.tab) {
      case 'CERT':
        this.timeframe=0;
        break;
      case 'HAZMAT':
        this.timeframe=24;
        break;
      case 'INTL':
        this.timeframe=0;
        break;
      case '297':
        this.timeframe=6;
        break;
      case 'RVSM':
        this.timeframe=0;
        break;
      case '244':
        this.timeframe=0;
        break;
      case 'CFIT':
        this.timeframe=0;
        break;
      case 'FLT-INSTRUCTOR':
        this.timeframe=24;
        break;
      case 'CHECK-AIRMAN':
        this.timeframe=24;
        break;
      case 'OTHER-RECORDS':
        this.timeframe=12;
        break;
      default:
        this.timeframe=12;
        break;
    }
    this.expKey='';
    this.expExtraKeys=[];
    if (this.timeframe===0) {
      return;
    }
    switch (this.tab) {
      case 'BI':
        this.expKey='BasicIndocExp';
        break;
      case 'HAZ':
        this.expKey='HazmatExp';
        break;
      case 'FLT-INSTRUCTOR':
        this.expKey='FlightInstructorObsExp';
        break;
      case 'CHECK-AIRMAN':
        this.expKey='CheckAirmanObsExp';
        break;
      case 'OTHER-RECORDS':
        this.expKey='C208TKSExp';
        break;
      default:  
        if (/^\d/.test(this.tab)) {
          //first character is an integer
          this.expKey='far' + this.tab + 'Exp';
          break;
        }
        if (this.tab.at(-1)==="G") {
          //All the ground currency tabs
          this.expKey=this.tab+'roundExp';
          this.expKeyAlt=this.tab+'OSExp';
          break;
        }
        if (this.tab.substring(0,1)==="C"||this.tab.substring(0,1)==="B") {
          this.expKey=this.tab + this.seat + 'Exp';
          break;
        }
    }
  }
  
  getPilotsFiles(){
    this.files.forEach(filename=>{
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
  
  filterForSub(cat,sub){
    let files=this.fullFiles.filter(file=>{
      let arr=file.filename.split('_');
      return arr[2]===cat&&arr[3]===sub;
    });
    return files.length>0;
  }
  
  filterForCat(cat){
    let files=this.fullFiles.filter(file=>{
      let arr=file.filename.split('_');
      return arr[2]===cat;
    });
    return files.length>0;
  }
}

angular.module('rotApp')
  .filter('categoryFilter',()=>{
    return function(input, cat, subIndex) {
      if (!input) return input;
      let subs=window.subtabs;
      if (cat==="CERT") subs=window.categories;
      let sub=subs[subIndex];
      return input.filter(item => {
        let arr=item.filename.split('_');
        return arr[2]===cat&&arr[3]===sub;
      });
    };
  })
  .component('records', {
    templateUrl: 'app/records/records.html',
    controller: RecordsComponent,
    controllerAs: 'records'
  });

})();
