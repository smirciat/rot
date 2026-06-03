'use strict';

(function(){

class PilotEvalsComponent {
  constructor($http) {
    this.http=$http;
    this.currentPilot="";//"Logan Bagley";
  }
  
  $onInit(){
    this.http.get('/api/evaluations').then(res=>{
      this.evals=res.data.filter(e=>{return !e.isArchived});
      this.evals.forEach(e=>{e.date=new Date(e.Date_af_date).toLocaleDateString()});
      console.log(this.evals)
      this.filterEvals();
      this.pilotNames=[];
      this.evals.forEach(e=>{
        if (this.pilotNames.indexOf(e.Pilot_Name)===-1) this.pilotNames.push(e.Pilot_Name);
      });
      console.log(this.pilotNames)
    });
  }
  
  loggedIn(){
    return window.user&&window.user.accessToken;
  }
  
  filterEvals(){
    this.filteredEvals=this.evals.filter(e=>{
      return e.Pilot_Name===this.currentPilot;
    }).sort((a,b)=>new Date(a.date)-new Date(b.date));
    let hrs=0;
    this.filteredEvals.forEach(e=>{
      hrs+=e.Hours*1;
      e.cumHours=hrs;
    });
  }
  
  deleteEval(e,index){
    let obj={isArchived:true};
    this.http.patch('/api/evaluations/'+e._id,obj).then(res=>{
      this.filteredEvals.splice(index,1);
    });
  }
  
  viewEval(e){
    this.http({ url: "/fileserver/attachments?filename=" + e.filename,
      method: "GET", 
      responseType: 'arraybuffer' })
    .then(response=> {
	    let blob = new Blob([response.data], { type: 'application/pdf' });
	    var fileURL = URL.createObjectURL(blob);
	    window.open(fileURL, '_blank');
      //saveAs(blob, e.filename);
    }).catch(err=>{
      alert("File Not Found");
      console.log(err);
      this.loading=false;
    });
  }
}

angular.module('rotApp')
  .component('pilotEvals', {
    templateUrl: 'app/pilotEvals/pilotEvals.html',
    controller: PilotEvalsComponent,
    controllerAs: 'pilotEvals'
  });

})();
