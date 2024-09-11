'use strict';

(function(){

class PdfComponent {
  constructor($http,$state,$interval,$timeout) {
    this.state=$state;
    this.http=$http;
    this.interval=$interval;
    this.timeout=$timeout;
  }
  
  $onInit() {
    if (!window.user) this.state.go('main');
    this.refreshList();
    this.myInterval=this.interval(()=>{
      let fileWatch;
      let d=document.getElementById('file');
      if (d&&d.files) fileWatch=Array.from(d.files);
      if (fileWatch&&fileWatch.length>0) this.add();
    },1000);
    
  }
  
  refreshList(){
    this.http.post('/api/raws/list',{}).then(res=>{
      this.fileList=JSON.parse(res.data);
    });
  }
  
  click(filename){
    this.http({ url: "/fileserver?filename=" + filename,
          method: "GET", 
          responseType: 'arraybuffer' })
        .then(response=> {
  		    let blob = new Blob([response.data]);
  	      saveAs(blob, filename);
        }).catch(err=>{
          alert("File Not Found");
          console.log(err);
          this.loading=false;
        });
  }
  
  delete(filename){
    let answer=confirm("Are you sure you want to delete this file?");
    if (answer) {
      this.http.post('/api/raws/delete',{filename:filename}).then(res=>{
        console.log(res.data);
        this.refreshList();
      });
    }
  }
  
  add(){
    let files=Array.from(document.getElementById('file').files);
    console.log(files);
    if (files&&files.length>0) {
      files.forEach(f=>{
        let r = new FileReader();
        r.onloadend = e=>{
          this.http.post('/api/raws/upload',{data:btoa(e.target.result),filename:f.name}).then(res=>{
            this.timeout(()=>{
              this.refreshList();
            },500);
            let d=document.getElementById('file');
            if (d) d.value='';
          }).catch(err=>{
            console.log(err);
            alert(err.data.response);
          });
        };
        r.readAsBinaryString(f);
      });
    }
    
    
  }
  
}

angular.module('rotApp')
  .component('pdf', {
    templateUrl: 'app/pdf/pdf.html',
    controller: PdfComponent,
    controllerAs: 'pdf'
  });

})();
