'use strict';

(function() {

  class MainController {

    constructor($http,$interval,$timeout,Auth,$scope,Modal,appConfig) {
      this.http = $http;
      this.appConfig=appConfig;
      this.Modal=Modal;
      this.url="https://firestore.googleapis.com/v1/projects/brg-flight-report/databases/(default)/documents/";
      this.interval=$interval;
      this.token="token";
      this.timeout=$timeout;
      this.Auth=Auth;
      this.isAdmin = Auth.isAdmin;
      this.scope=$scope;
      this.newPilot={};
      this.pilotsOld=[];
      this.months=[];
      var formLabels = ["Basic Indoc", "HAZMAT", "293(b) & 299", "297", "-", "Caravan", "1900", "King Air", "Sky Courier", "CASA"];
      this.suffices = ['baseIndoc','baseHazmat','base293','base297','-','base208','base1900','baseKingAir','base408','baseCasa'];
      this.trainingTypes=['none','initial','recurrent', 'transition', 'upgrade', 'requalification'];
      //['none','initial flight','initial ground','recurrent flight','recurrent ground','transition flight','transition ground','upgrade flight','upgrade ground','requalification flight','requalification ground'];
      this.types=['none','BasicIndoc','Hazmat','far299','far297','far297g','C208','B190','BE20','C408','C212'];
      this.instructors=['new','Kyle Lefebvre','Fen Kinneen','Ryan Woehler','Nathaniel Olson','Mike R. Evans'];
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
        let recordIndex = 0;
        if (formData._id) recordIndex= this.records.map(e => e._id).indexOf(formData._id);
        this.records[recordIndex] = {...this.records[recordIndex],...formData};
        this.records[recordIndex].trainingTypeArray=[];
        for (let key in this.records[recordIndex]) {
          if (this.records[recordIndex][key]&&typeof this.records[recordIndex][key]=="boolean") {
            this.records[recordIndex][key]="true";
            this.records[recordIndex].trainingTypeArray.push(key);
          }
          if (!this.records[recordIndex][key]&&typeof this.records[recordIndex][key]=="boolean") {
            this.records[recordIndex][key]="false";
          }
        }
      });
      this.pilotModal = this.Modal.confirm.pilotData(formData =>{
        if (!formData||!formData.name) {
          console.log('got this far');
          this.quickModal("Try again to enter the pilot data");
          return;
        }
        //formData is this pilot data
        if (formData._id) {
          this.loading=true;
          this.updateRecord('pilots',formData).then(res=>{
            this.loading=false;
          });
          let pilotIndex = this.pilots.map(e => e._id).indexOf(formData._id);
          this.pilots[pilotIndex]=JSON.parse(JSON.stringify(formData));
        }
        let recordIndex = this.records.map(e => e._id).indexOf(this.recordId);
        this.records[recordIndex].pilotNumber=formData._id.toString();
        formData._id=this.recordId;
        this.records[recordIndex] = {...this.records[recordIndex],...formData};
      });
    }

    $onInit() {
      this.signInFirebase();
      this.scope.$watch('$root.nav.chosenPilot',(newVal,oldVal)=>{
        if (!newVal||!newVal.name) return;
        this.records=[];
        if (newVal.name==="All.................") {
          this.getData('records','?pageSize=300').then(response=>{
            this.refreshRecords();
          });
        }
        else {
          this.getFilteredData('records',{attribute:"pilotNumber",value:newVal._id}).then(response=>{
            this.refreshRecords();
          });
        }
      });
      this.scope.$watch('main.token',(newVal,oldVal)=>{
        this.timeout(()=>{
          if (this.token&&this.token!==""&&this.token!=="token") {
            this.pilots=[];
            this.records=[];
            this.getData('pilots','?pageSize=300').then(res=>{
              let localPilots=JSON.parse(JSON.stringify(res));
              localPilots=localPilots.filter(pilot=>{
                return pilot.name&&pilot.name!=="";
              });
              localPilots.sort((a,b)=>{
                return a.name.localeCompare(b.name);
              });
              this.pilots=JSON.parse(JSON.stringify(localPilots));
              //let pilotArr=[];
              //localPilots.forEach(pilot=>{
              //  pilotArr.push(pilot.name);
              //});
              //console.log(pilotArr.toString());
              localPilots.unshift({name:'All.................'});
              this.scope.$root.nav.pilots=localPilots;
              this.getData('records','?pageSize=300').then(response=>{
              //this.getFilteredData('records','?pageSize=300',{attribute:"name",value:"Scott Gordon"}).then(response=>{
                this.refreshRecords();
                //this.importCSV();
                //this.fixImport();
              });
            });
          }
        },0);
      },true);
      // Call the function to set the zoom on page load
      this.setZoom();
      // Handle the window resize event
      window.addEventListener('resize', this.setZoom);
    }
    
    fixImport(){
      this.pilots.forEach(pilot=>{
        for (let key in pilot) {
          if (typeof pilot[key]==="string"&&pilot[key].split('-').length===3){
            let arr=pilot[key].split('-');
            if (arr[0].length===3||arr[1].length===3) continue;
            pilot[key]=arr[1]+'/'+arr[2]+'/'+arr[0];
          }
        }
        if (pilot.FlightInstructorObsExp==='\r') delete pilot.FlightInstructorObsExp;
        if (pilot._id){
          this.updateRecord('pilots',pilot).then(res=>{
            this.loading=false;
          });
        }
      });
    }
    
    importCSV(){
      this.http({ url: "/pdf?filename=otz.csv", 
        method: "GET", 
        headers: { 'Accept': 'text/plain'},//'application/pdf' }, //'text/plain'
        responseType: 'text' })
      .then(response=> {
        let ome=this.csvToJSON(response.data);
        ome.forEach(pilot=>{
          pilot.C408PICExp=pilot['C408PICExp\r'];
          delete pilot['C408PICExp\r'];
          if (pilot.C408PICExp&&pilot.C408PICExp.length>=1) pilot.C408PICExp=pilot.C408PICExp.slice(0,-1); 
          let index = this.pilots.map(e => e._id).indexOf(pilot._id);
          for (let key in pilot){
            if (pilot[key]!=="") {//&&this.pilots[index]&&(!this.pilots[index][key]||this.pilots[index][key]==="")){
              let arr=pilot[key].split('-');
              if (arr.length===3&&arr[0].length>3&&arr[1].length<3) this.pilots[index][key]=arr[1]+'/'+arr[2]+'/'+arr[0];
              else this.pilots[index][key]=pilot[key];
            }
          }
          //this.pilots[index].far299Exp=pilot['299Exp'];
          if (this.pilots[index]) {
            this.updateRecord('pilots',this.pilots[index]).then(res=>{
              this.loading=false;
            });
          }
        });
        console.log(this.pilots);
      });
    }
    
    csvToJSON(csv, callback) {
            var lines = csv.split("\n");
            var result = [];
            var headers = lines[0].split(",");
            for (var i = 1; i < lines.length - 1; i++) {
                var obj = {};
                var currentline = lines[i].split(",");
                for (var j = 0; j < headers.length; j++) {
                    obj[headers[j]] = currentline[j];
                }
                result.push(obj);
            }
            if (callback && (typeof callback === 'function')) {
                return callback(result);
            }
            return result;
        }
    
    refreshRecords(){
      this.records.forEach(record=>{
        let index = this.pilots.map(e => e._id).indexOf(record.pilotNumber);
        if (index>-1){
          if (!record.dateOfBirth) record.dateOfBirth=this.pilots[index].dateOfBirth;
          if (!record.medicalDate) record.medicalDate=this.pilots[index].medicalDate;
          if (!record.medicalClass) record.medicalClass=this.pilots[index].medicalClass;
          if (!record.cert) record.cert=this.pilots[index].cert;
          if (!record.certType) record.certType=this.pilots[index].certType;
          if (!record.name) record.name=this.pilots[index].name;
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
      this.records.unshift({date:new Date().toLocaleDateString(),newBaseMonth:'false',trainingType:'recurrent',baseMonth:new Date().toLocaleString('default', { month: 'long' })});
      this.scope.$apply();
    }
    
    showPilotModal(empNum,record){
      this.recordId=record._id;
      let index = this.pilots.map(e => e._id).indexOf(empNum);
      this.pilotModal(this.pilots[index],this.pilots);
    }
    
    trainingType(record){
      if (record.trainingTypeCombo==="none") record.trainingTypeCombo="";
      else {
        let index = this.records.map(e => e._id).indexOf(record._id);
        let arr=record.trainingTypeCombo.split(" ");
        if (arr.length>=2&&index>-1) {
          this.records[index].flightOrGround=arr[1];
          this.records[index].trainingType=arr[0];
        }
      }
    }
    
    select(attribute,record){
      if (record[attribute]==='none'){
        record[attribute]="";
      }
    }
    
    fillCert(attribute,record){
      let recordIndex = this.records.map(e => e._id).indexOf(record._id);
      if (record[attribute]==="new") {
        let att="new"+attribute;
        this.records[recordIndex][att]=true;
        this.records[recordIndex][attribute]=undefined;
        return;
      }
      let pilotIndex=this.pilots.map(e => e.name).indexOf(record[attribute]);
      let certAttribute=attribute+'Cert';
      this.records[recordIndex][certAttribute]=this.pilots[pilotIndex].cert;
    }
    
    copy(){
      this.copyPilots.forEach(pilot=>{
        let index = this.pilots.map(e => e.name).indexOf(pilot.name);
        if (index&&index>-1){
          let p=this.pilots[index];
          p.dateOfBirth=pilot.dateOfBirth;
          p.medicalDate=pilot.medicalDate;
          p.medicalClass=pilot.medicalClass;
          p.cert=pilot.certNumber;
          p.certType=pilot.certType;
          //console.log(p);
          //this.updateRecord('pilots',p);
        }
      });
    }
    
    keypress(event){
      if(event.which === 13) this.signInFirebase();
    }
    
    async getFilteredData(collection,filter){
      let structuredQuery={
        structuredQuery:{
          "from":{
            "collectionId":collection
          },
          "where": {
            "fieldFilter": {
              "field": {
                  "fieldPath": filter.attribute
              },
              "op": "EQUAL",
              "value": {
                  "stringValue": filter.value
              }
            }
          }//,
          //"orderBy": [{
          //    "field": {
          //        "fieldPath": "createdAt"
          //    },
          //    "direction": "DESCENDING"
          //}]
        }
      };
      return this.http.post(this.url+':runQuery',structuredQuery,this.config).then(res=>{
        if (res.data.length===1&&!res.data[0].document) return [];
        this[collection].push(...this.filteredDocumentsToArray(res.data));
        return this[collection];
      });
    }
    
    async getData(collection,query){
      if (!query||query==='undefined') query="";
      return this.http.get(this.url+collection+query,this.config).then(res=>{
        let q='?pageSize=300';
        this[collection].push(...this.documentsToArray(res.data.documents));
        //console.log(this.documentsToArray(res.data.documents));
        if (res.data.nextPageToken) {
          q+='&pageToken='+res.data.nextPageToken;
          return this.getData(collection,q);
        }
        else {
          //console.log(this[collection]);
          return this[collection];
        }
      });  
    }
    
    async getRecord(collection,id){
      return this.http.get(this.url+collection+'/'+id,this.config).then(res=>{
        return this.fromBody(res.data);
      });
    }
    
    async updateRecord(collection,document){
      let append='/';
      if (document._id) append+=document._id;
      else append+=Date.now();
      let body=this.toBody(document);
      let maskQuery='?';//updateMask.fieldPaths=";
      for (let key in body.fields) {
        maskQuery+='updateMask.fieldPaths='+key+'&';
      }
      maskQuery=maskQuery.slice(0,-1);
      //maskQuery+=']';
      //body.updateMask=maskQuery;
      //body.merge=true;
      //if (collection==='pilots') body.fields.isActive={booleanValue:true};
      console.log(body);
      return this.http.patch(this.url+collection+append+maskQuery,body,this.config).then(response=>{//omit /id to create new document, http.delete to delete
        console.log(response.data);
        this.loading=false;
        if (!document._id) {
          document._id=this.getId(response.data);
          //this[collection].push(document);
        }
        return document;
      })
      .catch(err=>{
        alert(err);
        console.log(err);
      });
    }
    
    async deleteRecord(collection,id){
      return this.http.delete(this.url+collection+'/'+id,this.config).then(response=>{//omit /id to create new document, http.delete to delete
        this.loading=false;
        //console.log(response.data);
        //let index = this[collection].map(e => e._id).indexOf(id);
        //this[collection].splice(index,1);
        return response.data;
      })
      .catch(err=>{
        alert(err);
        console.log(err);
      });
    }
    
    refreshToken(){
      if (window.user) {
        this.interval.cancel(this.refreshInterval);
        this.clicked=undefined;
        this.token=window.user.accessToken;
        this.config={//merge:true,
                    headers: {
                      'Authorization': 'Bearer ' + this.token 
                    }
          
        };
      }
    }
    
    loggedIn() {
      if (this.token&&this.token!==""&&this.token!=="token") return true;
      else return false;
    }
    
    signInFirebase() {
      if (this.username&&this.username!=="") window.username=this.username;
      if (this.password&&this.password!=="") window.password=this.password;
      if (window.username&&window.password&&window.username!==""&&window.password!=="") {
        this.clicked=true;
        this.refreshInterval=this.interval(()=>{this.refreshToken()},50);
        window.signInFunction(window.username,window.password);
      }
      //else alert('Please enter a username and password');
    }
    
    sendPasswordReset() {
      if (this.username&&this.username!==""&&confirm("Are you sure you really want to reset the password for " + this.username + '?')) {
        window.passwordReset(this.username);
        alert('Check your email for password change instructions');
      }
      else alert('Enter a valid Firebase email in the username field first, please.');
      }
    
    fillPilotData(record,id){
      let pilotIndex=this.pilots.map(e => e._id).indexOf(record.pilotNumber);
      let pilot={};
      if (id===0&&pilotIndex>-1) {
        let pilot=JSON.parse(JSON.stringify(this.pilots[pilotIndex]));
        delete pilot._id;
        this.records[0] = {...this.records[0],...pilot};
      }
    }
    
    getId(response){
      return response.name.split('/').pop();
    }
    
    displayArray(record){
      let result="";
      if (record.trainingTypeArray&&record.trainingTypeArray.length>0) {
        record.trainingTypeArray.forEach((type,index)=>{
          if (index>0) result+=", ";
          result+=type;
        });
      }
      else result="Click to Edit";
      return result;
    }
    
    documentsToArray(documents){
      let array=[];
      if (!documents) return array;
      documents.forEach(doc=>{
        //console.log(doc.name.split('/')[-1]);
        //let id=doc.name.split('/').pop();
        array.push(this.fromBody(doc));
      });
      return array;
    }
    
    filteredDocumentsToArray(documents){
      let array=[];
      if (!documents) return array;
      documents.forEach(doc=>{
        //console.log(doc.name.split('/')[-1]);
        //let id=doc.name.split('/').pop();
        array.push(this.fromBody(doc.document));
      });
      return array;
    }
    
    newRecordClass(record){
      if (!record._id) {
        return "darkBackground";
      }
      return "";
    }
    
    toBody(json){
      let fields={};
      for (let key in json) {
        if (key==='_id') continue;
        if (key==='$$hashKey') continue;
        else {
          //if (typeof json[key]==="boolean") fields[key]={booleanValue:json[key]};
          if (typeof json[key]==="string") fields[key]={stringValue:json[key]||""};
          //if (key==="empDouble") fields[key]={doubleValue:json[key]};
          //test if string is actually a timestamp
          //if (typeof json[key]==="string"&&json[key].split('-').length===3&&json[key].split(':').length==3) fields[key]={timestampValue:json[key]};
          //if (key==='picC121'||key==='picC408') fields[key]={timestampValue:json[key]};
        }
      }
      console.log({fields});
      return {fields};
    }
    
    fromBody(data){//fields,id){
      let fields=data.fields;
      let id=this.getId(data);//data.name.split('/').pop();
      let json={_id:id};
      for (let key in fields) {
        //if (fields[key].timestampValue) json[key]=fields[key].timestampValue;
        //if (fields[key].booleanValue) json[key]=fields[key].booleanValue;
        //if (fields[key].integerValue) json[key]=fields[key].integerValue;
        //if (fields[key].doubleValue) json[key]=fields[key].doubleValue;
        if (fields[key].stringValue) json[key]=fields[key].stringValue;
      }
      if (id==="933") console.log(data);
      //console.log(json);
      return json;
    }
    
    setZoom() {
      if (window.matchMedia('(min-width: 480px) and (max-width: 1280px)').matches) {
        //alert('zoom is 75%');
        document.body.style.zoom = "75%";
      } else {
        //alert('zoom is 100%');
        document.body.style.zoom = "100%";
      }
    }
    
    radioChange(pilotIndex,formIndex,checkboxValue){
      if (checkboxValue){
        this.formTypes.forEach((form,index)=>{
          form.radio=false;
        });
        this.formTypes[formIndex].radio=true;
      }
    }
    
    fillPilots() {
      this.pilotsOld.sort((a,b)=>{
        return a.name.localeCompare(b.name);
      });
      this.pilotsOld.forEach((p,pilotIndex)=>{
        p.dateOfBirth=new Date(p.dateOfBirth).toLocaleDateString();
        p.medicalDate=new Date(p.medicalDate).toLocaleDateString();
        this.tempBases.push([]);
        this.formTypes.forEach((label,labelIndex)=>{
          this.tempBases[pilotIndex].push({field:label.label, month: p[label.suffix], suffix:label.suffix});
        });
      }); 
      //console.log(this.pilots);
    }
    
    onSelect(item,pilotIndex,formIndex){
      //console.log(item);
      //$("#listItem" + pilotIndex + formIndex).mouseover();//addClass("hover");//trigger.mouseenter();//.mouseleave();
      
     // document.getElementById('listItem' + pilotIndex + formIndex).addClass('hover'); 
      
    }

    cancel() {
      this.newPilot={};
    }
    
    delete(record) {
      this.loading=true;
      this.timeout(()=>{
        var userResponse=confirm("Do you really want to delete the training record for " + record.name + "?");
        if (userResponse) {  
          if (!record._id) {
            this.records[0]={date:new Date().toLocaleDateString(),newBaseMonth:'false',baseMonth:new Date().toLocaleString('default', { month: 'long' })};
            this.loading=false;
          }
          else {
            this.deleteRecord('records',record._id).then(res=>{
              let index=this.records.map(e => e._id).indexOf(record._id);
              this.loading=false;
              this.records.splice(index,1);
            }).catch(err=>{
              alert(err);
              console.log(err);
              this.loading=false;
            });
          }
        }
        else this.loading=false;
        this.scope.$apply();
      },0);  
    }
    
    checkDate(record){
      if (record.date&&record.date!==""){
        let arr=record.date.split('/');
        if (arr.length>=3){
          if (arr[2].length===2) {
            let index=this.records.map(e => e._id).indexOf(record._id);
            if (index>-1) this.records[index].date=arr[0]+'/'+arr[1]+'/20'+arr[2];
          }
        }
      }
    }
    
    update(record) {
      this.loading=true;
      if (!record._id) this.records.unshift({date:new Date().toLocaleDateString(),trainingType:'recurrent',newBaseMonth:'false',baseMonth:new Date().toLocaleString('default', { month: 'long' })});
      for (var key in record) {
        if (!record[key]||record[key]==="") delete record[key];
      }
      let pilotIndex=this.pilots.map(e => e.name).indexOf(record.name);
      if (pilotIndex>-1) {
        let pilot=this.pilots[pilotIndex];
        this.appConfig.trainingEvents.forEach(event=>{
          if (record[event.name]&&record[event.name]==="true") {
            let expKey=event.name+"Exp";
            pilot[expKey]=this.getExp(record.baseMonth,record.date,event.frequency,1);
          }
        });
        this.updateRecord('pilots',pilot).then(res=>{
          console.log(res);
        });
      }
      this.updateRecord('records',record).then(res=>{
        let index=this.records.map(e => e._id).indexOf(record._id);
        if (index>-1&&res&&res._id) {
          this.records[index]._id=res._id;
          this.records[index].trainingTypeArray=[];
          this.appConfig.trainingEventKeys.forEach(key=>{
            if (record[key]&&record[key]==="true") this.records[index].trainingTypeArray.push(key);
          });
        }
        this.loading=false;
        this.scope.$apply();
      }).catch(err=>{
        alert(err);
        console.log(err);
        this.loading=false;
      });
    }
    
    save(pilot) {
      this.loading=true;
      pilot.medicalDate=this.tweakDate(pilot.medicalDate);
      pilot.dateOfBirth=this.tweakDate(pilot.dateOfBirth);
      pilot.medicalClass=pilot.medicalClass.toUpperCase();
      this.http.post('/api/pilots',pilot).then((res)=>{
        //res.data.medicalDate=new Date(res.data.medicalDate).toLocaleDateString();
        //res.data.dateOfBirth=new Date(res.data.dateOfBirth).toLocaleDateString();
        this.pilotsOld.push(res.data);
        this.newPilot={};
        this.tempBases = [];
        this.fillPilots();
        this.loading=false;
      }).catch(err=>{
        alert(err);
        console.log(err);
        this.loading=false;
      });
    }
    
    tweakDate(date) {
    //  var dateArray=new Date(date).toLocaleDateString().split('/');
    //  if (dateArray.length===3) {
    //    var day = dateArray[1];
    //    var month = dateArray[0];
    //    var year = dateArray[2];
    //    date=new Date(month + '/' + day + '/' + year);
    //    date.setTime(date.getTime()+12*60*60*1000);
    //  }
      return new Date(date).toLocaleDateString();
    }
    
    dobBlur(id) {
      var index = this.pilotsOld.map(e => e._id).indexOf(id);
      this.pilotsOld[index].dateOfBirth=this.tweakDate(this.pilotsOld[index].dateOfBirth);
    }
    
    medBlur(id) {
      var index = this.pilotsOld.map(e => e._id).indexOf(id);
      this.pilotsOld[index].medicalDate=this.tweakDate(this.pilotsOld[index].medicalDate);
    }
    
    isItDisabled(){
      if (this.loading) return "disabled";
      return;
    }
    
    isItLoading(){
      return this.loading;
    }
    
    keysToString(o){
      return JSON.stringify(o);
    }
    
    getExp(baseMonthString,recordDateString,frequencyString,skew){
      let index=this.months.indexOf(baseMonthString);
      let baseMonthInt;
      if (index===-1) {
        return "";
      } else baseMonthInt=index+skew;
      if (baseMonthInt===13) baseMonthInt=1;
      let dateArray=recordDateString.split('/');
      let month=parseInt(dateArray[0],10);//it comes from string, so its 1-12, there is no zero
      let year=parseInt(dateArray[2],10);
      let nextYear=year+1;
      let yearAfter=year+2;
      let nextBaseMonth=baseMonthInt;
      let nextBaseYear=nextYear;
      if (frequencyString==='6'){
        if (baseMonthInt<7){
          nextBaseMonth+=6;
          nextBaseYear=year;
          //if ((baseMonthInt===1||baseMonthInt===2)&&(month=11||month===12)) nextBaseYear=nextYear;
        }
        else {
          nextBaseMonth-=6;
          nextBaseYear=nextYear;
        }
      }
      else {
        if ((baseMonthInt===1||baseMonthInt===2)&&(month===11||month===12)){
          nextBaseYear=yearAfter;
        }
      }
      if (frequencyString==='24') nextBaseYear++;
      //if (nextBaseMonth<10) nextBaseMonth='0'+nextBaseMonth;
      return new Date(nextBaseYear,nextBaseMonth,0).toLocaleDateString();
    }
    
    pdf(record,PDFFileName) {
      let id=record._id;
      this.update(record);
      //spin buttons
      this.loading=true;
      //
      let index = this.records.map(e => e._id).indexOf(id);
      let pilot = this.records[index];
      let certType = "ATP/";
      if (pilot.certType&&pilot.certType.toUpperCase()!="ATP"&&pilot.certType.toUpperCase()!="ATP/") certType="COMM/";
      let medClass="FIRST";
      if (pilot.medicalClass&&pilot.medicalClass.toUpperCase()!=="FIRST") medClass="SECOND";
      let trainingClass;
      if (pilot.trainingTypeCombo) trainingClass=pilot.trainingTypeCombo.split(' ')[0].toUpperCase();
  		let dateObj = pilot.date;//new Date(pilot.date).toLocaleDateString();
  		let dateArray=dateObj.split('/');
	    let m, month, day, year;
	    let exps=[];
	    if (dateArray.length>=3) {
        month = dateArray[0];
        day = dateArray[1];
        year = dateArray[2];
	    }
	    this.suffices.forEach((suffix,suffixIndex)=>{
	      
	      m = month;//this.months.indexOf(pilot[suffix]);
	      let expM;
	      let nextYear=parseInt(year,10)+1;
	      let yearAfter=parseInt(year,10)+2;
	      if (suffix==="base297"){
	        if (m>5) {
	          expM=m-6;
	          exps.push(expM + '/' + nextYear);//this.months[expM] + ' ' + nextYear);
	        }
	        else {
	          expM=m+8;
	          exps.push(expM + '/' + year);//this.months[expM] + ' ' + year);
	        }
	      }
	      else {
  	      if (m===11) {
  	        expM = 1;
  	        exps.push(expM + '/' + nextYear);//this.months[expM] + ' ' + nextYear);
  	      }
  	      else {
  	        expM = m+2;
	          exps.push(expM + '/' + nextYear);//this.months[expM] + ' ' + nextYear);
  	      }
	      }
	    });
	    let nbm="NO"
	    if (pilot.newBaseMonth==="true") nbm="YES";
	    let pilotIndex = this.pilots.map(e => e.name).indexOf(pilot.instructor);
	    if (pilotIndex>-1) pilot.instructorCert=this.pilots[pilotIndex].cert;
	    else pilot.instructorCert="";
      var fields={"Cert Type1":[certType],
                  "CertType":[certType],
                  "Pilots Name":[pilot.name],
                  "Date of Birth":[pilot.dateOfBirth],
                  "Cert Number":[pilot.cert],
                  "Medical Class":[medClass],
                  "Medical EXP":[pilot.medicalDate],
                  "Date of Check":[dateObj],
                  "Check Airman":[pilot.checkAirman],
                  "Check Airman Cert #":[pilot.checkAirmanCert],
                  "Group44":["44"],
                  "44":"X",
                  "BaseMonth":[pilot.baseMonth.toUpperCase()],
                  "NewBaseMonth":[nbm],
                  "Group24":["X"],
                  "Text1":[pilot.instructor+'/'+pilot.instructorCert]
      };
      if (PDFFileName!=="ROT") fields.Dropdown19=[trainingClass];
      //this.formTypes.forEach(form=>{
        //if (form.radio) {
          let fieldName,frequency,eventIndex;
          //switch (form.label) {
            if (pilot.BasicIndoc&&pilot.BasicIndoc==="true") {//"Basic Indoc": 
              eventIndex = this.appConfig.trainingEvents.map(e => e.name).indexOf('BasicIndoc');
              frequency=this.appConfig.trainingEvents[eventIndex].frequency;
              fieldName = "Check Box1";
              fields[fieldName]=["X"];
              fields.Dropdown2=[pilot.baseMonth.toUpperCase()];
              fieldName="BI TEST EXPIRATION";
              fields[fieldName]=[this.getExp(pilot.baseMonth,dateObj,frequency,1)];
              fieldName="Instructor 1";
              fields[fieldName]=[pilot.instructor];
              if (PDFFileName==="ROT") fields.Dropdown1=["S"];
              fieldName="Date1_af_date";
              fields[fieldName]=[dateObj];
              fieldName="Instructor 2";
              fields[fieldName]=[pilot.instructor];
              if (PDFFileName==="ROT") fields.Dropdown2=["S"];
              fieldName="Date2_af_date";
              fields[fieldName]=[dateObj];
            }
            if ((pilot.C208Ground&&pilot.C208Ground==="true")||
                    (pilot.C408Ground&&pilot.C408Ground==="true")||
                    (pilot.B190Ground&&pilot.B190Ground==="true")||
                    (pilot.BE20Ground&&pilot.BE20Ground==="true")||
                    (pilot.C212Ground&&pilot.C212Ground==="true")
                    ){
              frequency='12';
              fieldName="Instructor 8";
              fields[fieldName]=[pilot.instructor];
              if (PDFFileName==="ROT") fields.Dropdown8=["S"];
              fieldName="Date8_af_date";
              fields[fieldName]=[dateObj];
              fieldName="Instructor 9";
              fields[fieldName]=[pilot.instructor];
              if (PDFFileName==="ROT") fields.Dropdown9=["S"];
              fieldName="Date9_af_date";
              fields[fieldName]=[dateObj];
            }
            if ((pilot.C208PIC&&pilot.C208PIC==="true")||
                    (pilot.C408PIC&&pilot.C408PIC==="true")||
                    (pilot.C408SIC&&pilot.C408SIC==="true")||
                    (pilot.B190PIC&&pilot.B190PIC==="true")||
                    (pilot.B190SIC&&pilot.B190SIC==="true")||
                    (pilot.BE20PIC&&pilot.BE20PIC==="true")||
                    (pilot.C212PIC&&pilot.C212PIC==="true")||
                    (pilot.C212SIC&&pilot.C212SIC==="true")
                    ){
              frequency='12';
              fieldName="AC ORAL/WRITTEN EXP";
              fields[fieldName]=[this.getExp(pilot.baseMonth,dateObj,frequency,1)];
              fields.Dropdown3=[pilot.baseMonth.toUpperCase()];
              fieldName = "Check Box2";
              fields[fieldName] =["X"];
              fieldName="293 EXP";
              fields[fieldName]=[this.getExp(pilot.baseMonth,dateObj,frequency,1)];
              fields.Dropdown4=[pilot.baseMonth.toUpperCase()];
              fieldName = "Check Box3";
              fields[fieldName] =["X"];
              fieldName="Instructor 10";
              fields[fieldName]=[pilot.instructor];
              if (PDFFileName==="ROT") fields.Dropdown10=["S"];
              fieldName="Date10_af_date";
              fields[fieldName]=[dateObj];
            }
            if ((pilot.C208PIC&&pilot.C208PIC==="true")||
                  (pilot.C408PIC&&pilot.C408PIC==="true")||
                  (pilot.C212PIC&&pilot.C212PIC==="true")||
                  (pilot.B190PIC&&pilot.B190PIC==="true")||
                  (pilot.BE20PIC&&pilot.BE20PIC==="true")
                  ){
              fieldName="Check Box7";
              fields[fieldName]=["X"];
            }
            if ((pilot.C408SIC&&pilot.CS08PIC==="true")||
                  (pilot.C212SIC&&pilot.C212SIC==="true")||
                  (pilot.B190SIC&&pilot.B190SIC==="true")
                  ){
              fieldName="Check Box8";
              fields[fieldName]=["X"];
            }
            if ((pilot.C208PIC&&pilot.C208PIC==="true")||(pilot.C208Ground&&pilot.C208Ground==="true")){
              fieldName="AC Type";
              fields[fieldName]=["C208"];
              fields.Dropdown26=["C208"];
              //fields.Dropdown17=["C208"];
              fields.Dropdown25=["C208"];
            }
            if ((pilot.BE20PIC&&pilot.BE20PIC==="true")||(pilot.BE20Ground&&pilot.BE20Ground==="true")){
              fieldName="AC Type";
              fields[fieldName]=["BE20"];
              fields.Dropdown25=["BE20"];
              fields.Dropdown26=["BE20"];
              //fields.Dropdown17=["BE20"];
            }
            if ((pilot.B190PIC&&pilot.B190PIC==="true")||(pilot.B190SIC&&pilot.B190SIC==="true")||(pilot.B190Ground&&pilot.B190Ground==="true")){
              fieldName="AC Type";
              fields[fieldName]=["B190"];
              fields.Dropdown25=["B190"];
              fields.Dropdown26=["B190"];
              //fields.Dropdown17=["B190"];
            }
            if ((pilot.C408PIC&&pilot.C408PIC==="true")||(pilot.C408SIC&&pilot.C408SIC==="true")||(pilot.C408Ground&&pilot.C408Ground==="true")){
              fieldName="AC Type";
              fields[fieldName]=["C408"];
              fields.Dropdown25=["C408"];
              fields.Dropdown26=["C408"];
              //fields.Dropdown17=["C408"];
            }
            if ((pilot.C212PIC&&pilot.C212PIC==="true")||(pilot.C212SIC&&pilot.C212SIC==="true")||(pilot.C212Ground&&pilot.C212Ground==="true")){
              fieldName="AC Type";
              fields[fieldName]=["C212"];
              fields.Dropdown25=["C212"];
              fields.Dropdown26=["C212"];
              //fields.Dropdown17=["C212"];
            }
            if (pilot['far299']&&pilot['far299']==="true") {//case "293(b) & 299": 
              eventIndex = this.appConfig.trainingEvents.map(e => e.name).indexOf('far299');
              frequency=this.appConfig.trainingEvents[eventIndex].frequency;
              fieldName = "Check Box6";
              fields[fieldName] =["X"];
              fields.Dropdown4=[pilot.baseMonth.toUpperCase()];
              fields.Dropdown7=[pilot.baseMonth.toUpperCase()];
              fieldName="299 Enroute Check EXP";
              fields[fieldName]=[this.getExp(pilot.baseMonth,dateObj,frequency,1)];
            }
            if (pilot['far297g']&&pilot['far297g']==="true") {//case "297":
              eventIndex = this.appConfig.trainingEvents.map(e => e.name).indexOf('far297g');
              frequency=this.appConfig.trainingEvents[eventIndex].frequency; 
              fieldName="297(G) Autopilot EXP";
              fields[fieldName]=[this.getExp(pilot.baseMonth,dateObj,frequency,1)];
              fields.Dropdown6=[pilot.baseMonth.toUpperCase()];
              fieldName = "Check Box5";
              fields[fieldName]=["X"];
            }
            if (pilot['far297']&&pilot['far297']==="true") {//case "297":
              eventIndex = this.appConfig.trainingEvents.map(e => e.name).indexOf('far297');
              frequency=this.appConfig.trainingEvents[eventIndex].frequency; 
              fieldName = "Check Box4";
              let i=this.months.indexOf(pilot.baseMonth);
              if (i<6) i+=6;
              else i-=6;
              fields.Dropdown5=[this.months[i].toUpperCase()];
              fields[fieldName]=["X"];
              fieldName="297 EXP";
              fields[fieldName]=[this.getExp(pilot.baseMonth,dateObj,frequency,1)];
            }
            if (pilot.Hazmat&&pilot.Hazmat==="true") {//case "HAZMAT":
              fieldName="Instructor 3";
              fields[fieldName]=[pilot.instructor];
              if (PDFFileName==="ROT") fields.Dropdown3=["S"];
              fieldName="Date3_af_date";
              fields[fieldName]=[dateObj];
            }
            //default:
            //  break;
          //}
        
      console.log(fields);
      //return;
      this.http({ url: "/pdf?filename=" + PDFFileName + ".pdf", 
          method: "GET", 
          headers: { 'Accept': 'application/pdf' }, //'text/plain'
          responseType: 'arraybuffer' })
        .then(response=> {
          var filled_pdf; // Uint8Array
  		    filled_pdf = pdfform().transform(response.data, fields);
  		    //console.log(pdfform().list_fields(response.data));
  		    var blob = new Blob([filled_pdf], {type: 'application/pdf'});
  		    
  		    var filename=PDFFileName + "_" + pilot.name + '_' + year + '_' + month + '_' + day + '.pdf';
  	      saveAs(blob, filename);
  	      //unspin buttons
  	      this.loading=false;
  	      //
        }).catch(err=>{
          alert(err);
          console.log(err);
          this.loading=false;
        });
    }

  }

  angular.module('rotApp')
    .component('main', {
      templateUrl: 'app/main/main.html',
      controller: MainController,
      controllerAs: 'main'
    });
})();
