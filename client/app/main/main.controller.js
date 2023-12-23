'use strict';

(function() {

  class MainController {

    constructor($http) {
      this.http = $http;
      this.newPilot={};
      this.pilots=[];
    }

    $onInit() {
      this.http.get('/api/pilots').then((response)=>{
        this.pilots=response.data;
        this.pilots.forEach((p)=>{
          p.dateOfBirth=new Date(p.dateOfBirth).toLocaleDateString();
          p.medicalDate=new Date(p.medicalDate).toLocaleDateString();
        });
      });
    }

    cancel() {
      this.newPilot={};
    }
    
    delete(id) {
      var index = this.pilots.map(e => e._id).indexOf(id);
      this.http.delete('/api/pilots/'+id).then(res=>{
        this.pilots.splice(index,1);
      });
    }
    
    update(id) {
      var index = this.pilots.map(e => e._id).indexOf(id);
      this.http.patch('/api/pilots/'+id,this.pilots[index]).then(res=>{
        //this.pilots.splice(index,1);
        //this.pilots.push(res.data);
      });
    }
    
    save(pilot) {
      pilot.medicalDate=this.tweakDate(pilot.medicalDate);
      pilot.dateOfBirth=this.tweakDate(pilot.dateOfBirth);
      this.http.post('/api/pilots',pilot).then((res)=>{
        this.pilots.push(res.data);
        this.newPilot={};
      });
    }
    
    tweakDate(date) {
      date=new Date(new Date(date).toJSON().substr(0, 10));
      date.setTime(date.getTime()+12*60*60*1000);
      return date;
    }
    
    dobBlur(id) {
      var index = this.pilots.map(e => e._id).indexOf(id);
      this.pilots[index].dateOfBirth=this.tweakDate(this.pilots[index].dateOfBirth);
    }
    
    medBlur(id) {
      var index = this.pilots.map(e => e._id).indexOf(id);
      this.pilots[index].medicalDate=this.tweakDate(this.pilots[index].medicalDate);
    }
    
    rot(id) {
      var index = this.pilots.map(e => e._id).indexOf(id);
      var pilot = this.pilots[index];
      var certType = "ATP/";
      if (pilot.certType=="commercial") certType="COMM/";
      var fields={"Cert Type":[certType],
                  "Pilots Name":[pilot.name],
                  //"dest1PaxNameRow1a":pilot.name//,
                  "Cert Number":[pilot.certNumber]
      };
      this.http({ url: "/pdf?filename=ROT.pdf", 
          method: "GET", 
          headers: { 'Accept': 'application/pdf' }, 
          responseType: 'arraybuffer' })
        .then(response=> {
          console.log(fields);
          var filled_pdf; // Uint8Array
  		    filled_pdf = pdfform().transform(response.data, fields);
  		    var blob = new Blob([filled_pdf], {type: 'application/pdf'});
  		    var dateObj = new Date();
          var month = dateObj.getUTCMonth() + 1; //months from 1-12
          var day = dateObj.getUTCDate();
          var year = dateObj.getUTCFullYear();
  		    var filename="ROT_" + pilot.name + '_' + year + '_' + month + '_' + day + '.pdf';
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
