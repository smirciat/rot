'use strict';

(function() {

  class MainController {

    constructor($http,$interval) {
      this.http = $http;
      this.interval=$interval;
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
      this.http.get('/api/pilots').then((response)=>{
        this.pilots=response.data;
        this.tempBases = [];
        this.fillPilots();
        //var interval=this.interval(()=>{console.log(this.tempBases)},10000);
      });
      
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
      console.log(this.tempBases)
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
      var index = this.pilots.map(e => e._id).indexOf(id);
      var userResponse=confirm("Do you really want to delete " + this.pilots[index].name + " ?");
      if (userResponse) {  
        this.http.delete('/api/pilots/'+id).then(res=>{
          this.pilots.splice(index,1);
        });
      }
    }
    
    update(id) {
      var index = this.pilots.map(e => e._id).indexOf(id);
      console.log(index)
      this.tempBases[index].forEach((base,i)=>{
        if (i!==5) {
          this.pilots[index][base.suffix]=base.month;
        }
      });
      console.log(this.pilots)
      this.http.patch('/api/pilots/'+id,this.pilots[index]).then(res=>{
        //this.pilots.splice(index,1);
        //this.pilots.push(res.data);
      });
    }
    
    save(pilot) {
      //pilot.medicalDate=this.tweakDate(pilot.medicalDate);
      //pilot.dateOfBirth=this.tweakDate(pilot.dateOfBirth);
      pilot.medicalClass=pilot.medicalClass.toUpperCase();
      this.http.post('/api/pilots',pilot).then((res)=>{
        //res.data.medicalDate=new Date(res.data.medicalDate).toLocaleDateString();
        //res.data.dateOfBirth=new Date(res.data.dateOfBirth).toLocaleDateString();
        this.pilots.push(res.data);
        this.newPilot={};
        this.tempBases = [];
        this.fillPilots();
      });
    }
    
    //tweakDate(date) {
    //  var dateArray=new Date(date).toLocaleDateString().split('/');
    //  if (dateArray.length===3) {
    //    var day = dateArray[1];
    //    var month = dateArray[0];
    //    var year = dateArray[2];
    //    date=new Date(month + '/' + day + '/' + year);
    //    date.setTime(date.getTime()+12*60*60*1000);
    //  }
    //  return date;
    //}
    
    dobBlur(id) {
      var index = this.pilots.map(e => e._id).indexOf(id);
      //this.pilots[index].dateOfBirth=this.tweakDate(this.pilots[index].dateOfBirth);
    }
    
    medBlur(id) {
      var index = this.pilots.map(e => e._id).indexOf(id);
      //this.pilots[index].medicalDate=this.tweakDate(this.pilots[index].medicalDate);
    }
    
    pdf(id,PDFFileName) {
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
	    this.suffices.forEach(suffix=>{
	      m = this.months.indexOf(pilot[suffix]);
	      if (m===11) exps.push('January ' + (year+1));
	      else exps.push(pilot[suffix] + year);
	    });
      var fields={"Cert Type":[certType],
                  "Pilots Name":[pilot.name],
                  "Date of Birth":[pilot.dateOfBirth],
                  "Cert Number":[pilot.certNumber],
                  "Medical Class":[medClass],
                  "Medical EXP":[pilot.medicalDate],
                  "Date of Check":[dateObj],
                  "Dropdown2":[pilot.baseIndoc.toUpperCase()],
                  "BI Test Expiration":[exps[0]],
                  "Dropdown4":[pilot.base293.toUpperCase()],
                  "293 EXP":[exps[3]]
                  
      };
      this.http({ url: "/pdf?filename=" + PDFFileName + ".pdf", 
          method: "GET", 
          headers: { 'Accept': 'application/pdf' }, 
          responseType: 'arraybuffer' })
        .then(response=> {
          var filled_pdf; // Uint8Array
  		    filled_pdf = pdfform().transform(response.data, fields);
  		    console.log(pdfform().list_fields(response.data));
  		    var blob = new Blob([filled_pdf], {type: 'application/pdf'});
  		    
  		    var filename=PDFFileName + "_" + pilot.name + '_' + year + '_' + month + '_' + day + '.pdf';
  	      saveAs(blob, filename);
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
