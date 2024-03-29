'use strict';

(function() {

  class MainController {

    constructor($http,$interval,$timeout) {
      this.http = $http;
      this.interval=$interval;
      this.timeout=$timeout;
      this.newPilot={};
      this.pilots=[];
      this.months=[];
      var formLabels = ["Basic Indoc", "HAZMAT", "293(b) & 299", "297", "-", "Caravan", "1900", "King Air", "Sky Courier", "CASA"];
      this.suffices = ['baseIndoc','baseHazmat','base293','base297','-','base208','base1900','baseKingAir','base408','baseCasa'];
      this.formTypes=[];
      for (var i=0;i<formLabels.length;i++) {
        this.formTypes.push({label:formLabels[i],suffix:this.suffices[i],radio:false,id:i});
      }
      for (var i=1;i<13;i++){
        this.months.push(new Date(i + '/15/2020').toLocaleString('default', { month: 'long' }));
      }
    }

    $onInit() {
      
      //this.http({ url: "/pdf?filename=2024_01_06_14_01_timber_Albany,_OR,_United_States.tcx", 
          //method: "GET", 
          //responseType: 'text' })
        //.then(response=> {
          //console.log(response.data);
        //}).catch(err=>{
          //console.log(err);
       // });
      
      
      this.loading=false;
      this.http.get('/api/pilots').then((response)=>{
        this.pilots=response.data;
        this.tempBases = [];
        this.fillPilots();
        //var interval=this.interval(()=>{console.log(this.tempBases)},10000);
      });
      // Call the function to set the zoom on page load
      this.setZoom();
      // Handle the window resize event
      window.addEventListener('resize', this.setZoom);
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
      this.pilots.sort((a,b)=>{
        return a.name.localeCompare(b.name);
      });
      this.pilots.forEach((p,pilotIndex)=>{
        p.dateOfBirth=new Date(p.dateOfBirth).toLocaleDateString();
        p.medicalDate=new Date(p.medicalDate).toLocaleDateString();
        this.tempBases.push([]);
        this.formTypes.forEach((label,labelIndex)=>{
          this.tempBases[pilotIndex].push({field:label.label, month: p[label.suffix], suffix:label.suffix});
        });
      }); 
      //console.log(this.tempBases)
    }
    
    onSelect(item,pilotIndex,formIndex){
      //console.log(item);
      //$("#listItem" + pilotIndex + formIndex).mouseover();//addClass("hover");//trigger.mouseenter();//.mouseleave();
      
     // document.getElementById('listItem' + pilotIndex + formIndex).addClass('hover'); 
      
    }

    cancel() {
      this.newPilot={};
    }
    
    delete(id) {
      this.loading=true;
      var index = this.pilots.map(e => e._id).indexOf(id);
      this.timeout(()=>{
        var userResponse=confirm("Do you really want to delete " + this.pilots[index].name + " ?");
        if (userResponse) {  
          this.http.delete('/api/pilots/'+id).then(res=>{
            this.loading=false;
            this.pilots.splice(index,1);
          }).catch(err=>{
            console.log(err);
            this.loading=false;
          });
        }
        else this.loading=false;
      },0);  
        
    }
    
    update(id) {
      this.loading=true;
      var index = this.pilots.map(e => e._id).indexOf(id);
      //console.log(index)
      this.tempBases[index].forEach((base,i)=>{
        if (i!==5) {
          this.pilots[index][base.suffix]=base.month;
        }
      });
      this.http.patch('/api/pilots/'+id,this.pilots[index]).then(res=>{
        //this.pilots.splice(index,1);
        //this.pilots.push(res.data);
        this.loading=false;
      }).catch(err=>{
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
        this.pilots.push(res.data);
        this.newPilot={};
        this.tempBases = [];
        this.fillPilots();
        this.loading=false;
      }).catch(err=>{
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
      var index = this.pilots.map(e => e._id).indexOf(id);
      this.pilots[index].dateOfBirth=this.tweakDate(this.pilots[index].dateOfBirth);
    }
    
    medBlur(id) {
      var index = this.pilots.map(e => e._id).indexOf(id);
      this.pilots[index].medicalDate=this.tweakDate(this.pilots[index].medicalDate);
    }
    
    isItDisabled(){
      if (this.loading) return "disabled";
      return;
    }
    
    isItLoading(){
      return this.loading;
    }
    
    pdf(id,PDFFileName) {
      //spin buttons
      this.loading=true;
      //
      var index = this.pilots.map(e => e._id).indexOf(id);
      var pilot = this.pilots[index];
      var certType = "ATP/";
      if (pilot.certType.toUpperCase()!="ATP") certType="COMM/";
      var medClass="FIRST";
      if (pilot.medicalClass.toUpperCase()!=="FIRST") medClass="SECOND";
  		var dateObj = new Date().toLocaleDateString();
  		var dateArray=dateObj.split('/');
	    var m, month, day, year;
	    var exps=[];
	    if (dateArray.length>=3) {
        month = dateArray[0];
        day = dateArray[1];
        year = dateArray[2];
	    }
	    this.suffices.forEach((suffix,suffixIndex)=>{
	      m = this.months.indexOf(pilot[suffix]);
	      var expM;
	      var nextYear=parseInt(year,10)+1;
	      var yearAfter=parseInt(year,10)+2;
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
      var fields={"Cert Type":[certType],
                  "Pilots Name":[pilot.name],
                  "Date of Birth":[pilot.dateOfBirth],
                  "Cert Number":[pilot.certNumber],
                  "Medical Class":[medClass],
                  "Medical EXP":[pilot.medicalDate],
                  "Date of Check":[dateObj],
                  "Check Airman":["Kyle LeFebvre"],
                  "Check Airman Cert #":["3120274"],
                  "Dropdown19":["RECURRENT"],
                  "Group4":["Choice4"],
                  "Choice4":"X"                 
      };
      this.formTypes.forEach(form=>{
        if (form.radio) {
          var fieldName;
          switch (form.label) {
            case "Basic Indoc": 
              fieldName = "Check Box1";
              fields[fieldName]="X";
              fieldName="BI TEST EXPIRATION";
              if (pilot.baseIndoc) fields.Dropdown2=[pilot.baseIndoc.toUpperCase()];
              if (exps[0]) fields[fieldName]=[exps[0].toUpperCase()];
              fieldName="BaseMonth";
              if (pilot.baseIndoc&&typeof pilot.baseIndoc === "string") fields[fieldName]=[pilot.baseIndoc.toUpperCase()];
              break;
            case "293(b) & 299": 
              fieldName = "Check Box3";
              fields[fieldName] ="X";
              fieldName = "Check Box6";
              fields[fieldName] ="X";
              if (pilot.base293) fields.Dropdown4=[pilot.base293.toUpperCase()];
              fieldName="293 EXP";
              if (exps[2]) fields[fieldName]=[exps[2].toUpperCase()];
              if (pilot.base293) fields.Dropdown7=[pilot.base293.toUpperCase()];
              fieldName="299 Enroute Check EXP";
              if (exps[2]) fields[fieldName]=[exps[2].toUpperCase()];
              fieldName="BaseMonth";
              if (pilot.base293&&typeof pilot.base293 === "string") fields[fieldName]=[pilot.base293.toUpperCase()];
              break;
            case "297": 
              fieldName = "Check Box4";
              fields[fieldName]="X";
              fieldName = "Check Box5";
              //fields[fieldName]="X";
              fieldName="297 EXP";
              if (exps[3]) fields[fieldName]=[exps[3].toUpperCase()];
              //if (pilot.base297) fields.Dropdown6=[pilot.base297.toUpperCase()];
              fieldName="297(G) Autopilot EXP";
              //if (exps[3]) fields[fieldName]=[exps[3].toUpperCase()];
              if (pilot.base297) fields.Dropdown5=[pilot.base297.toUpperCase()];
              fieldName="BaseMonth";
              if (pilot.base297&&typeof pilot.base297 === "string") fields[fieldName]=[pilot.base297.toUpperCase()];
              break;
            case "HAZMAT":
              fieldName="BaseMonth";
              if (pilot.baseHazmat&&typeof pilot.baseHazmat === "string") fields[fieldName]=[pilot.baseHazmat.toUpperCase()];
              break;
            default:
              break;
          }
        }
      });
      this.http({ url: "/pdf?filename=" + PDFFileName + ".pdf", 
          method: "GET", 
          headers: { 'Accept': 'application/pdf' }, //'text/plain'
          responseType: 'arraybuffer' })
        .then(response=> {
          var filled_pdf; // Uint8Array
  		    filled_pdf = pdfform().transform(response.data, fields);
  		    console.log(pdfform().list_fields(response.data));
  		    var blob = new Blob([filled_pdf], {type: 'application/pdf'});
  		    
  		    var filename=PDFFileName + "_" + pilot.name + '_' + year + '_' + month + '_' + day + '.pdf';
  	      saveAs(blob, filename);
  	      //unspin buttons
  	      this.loading=false;
  	      //
        }).catch(err=>{
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
