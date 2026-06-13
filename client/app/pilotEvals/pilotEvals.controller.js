'use strict';

(function(){

class PilotEvalsComponent {
  constructor($http) {
    this.http=$http;
    this.currentPilot="";//"Logan Bagley";
  }
  
  $onInit(){
    this.http.get('/api/evaluations').then(res=>{
      this.evals=res.data.filter(evaluation=>{return !evaluation.isArchived});
      this.evals.forEach(evaluation=>{evaluation.date=new Date(evaluation.Date_af_date).toLocaleDateString()});
      console.log(this.evals)
      this.filterEvals();
      this.pilotNames=[];
      this.evals.forEach(evaluation=>{
        if (this.pilotNames.indexOf(evaluation.Pilot_Name)===-1) this.pilotNames.push(evaluation.Pilot_Name);
      });
      console.log(this.pilotNames)
    });
  }
  
  loggedIn(){
    return window.user&&window.user.accessToken;
  }
  
  filterEvals(){
    this.filteredEvals=this.evals.filter(evaluation=>{
      return evaluation.Pilot_Name===this.currentPilot;
    }).sort((a,b)=>new Date(a.date)-new Date(b.date));
    let hrs=0;
    this.filteredEvals.forEach(evaluation=>{
      hrs+=evaluation.Hours*1;
      evaluation.cumHours=hrs;
    });
  }
  
  deleteEval(evaluation,index){
    let obj={isArchived:true};
    this.http.patch('/api/evaluations/'+evaluation._id,obj).then(res=>{
      this.filteredEvals.splice(index,1);
    });
  }
  
  viewEval(evaluation){
    this.http({ url: "/fileserver/attachments?filename=" + evaluation.filename,
      method: "GET", 
      responseType: 'arraybuffer' })
    .then(response=> {
	    let blob = new Blob([response.data], { type: 'application/pdf' });
	    var fileURL = URL.createObjectURL(blob);
	    window.open(fileURL, '_blank');
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
