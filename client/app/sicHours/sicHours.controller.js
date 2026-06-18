'use strict';

(function(){

class SicHoursComponent {
  constructor($http,$timeout,$scope) {
    this.http=$http;
    this.timeout=$timeout;
    this.scope=$scope;
    this.queryObj={collection:'flights',limit:3000,parameter:'coPilotEmployeeNumber',value:'1174',parameter2:'pilotEmployeeNumber',value2:'1174',queryOr:true};
    this.aircraft=["ALL","Caravan","Beech 1900","King Air","Courier","Casa"];
    this.aircraftSelected="Courier";
  }
  
  $onInit(){
    this.scope.$watch('$root.nav.chosenPilot',(newVal,oldVal)=>{
      if (newVal&&oldVal) {
        this.queryObj.value=newVal._id.toString();
        this.queryObj.value2=newVal._id.toString();
      }
      this.flights=[];
      this.init();
    }); 
    this.http.post('/api/things/firebase',{collection:'pilots'}).then(res=>{
      this.pilots=res.data;
      this.pilot=this.pilots.filter(p=>p._id===this.queryObj.value)[0];
      this.init();
    });
  }
  
  init(){
    if (this.pilots) this.pilot=this.pilots.filter(p=>p._id===this.queryObj.value)[0];
    else return;
    let today=new Date();
    if (this.pilot) this.startDate408=this.pilot.C408Initial;
    if (!this.startDate408) {
      this.startDate408=new Date();
      this.startDate408.setDate(today.getDate() + 1);
      this.startDate408=this.startDate408.toLocaleDateString();
    }
    console.log(this.queryObj)
    this.http.post('/api/things/firebaseQuery',this.queryObj).then(res=>{
      console.log(res.data)
      this.allFlights=res.data.filter(f=>f.acftNumber.substring(0,1)==="N"&&f.flightTime*1>0);
      this.filterFlights();
    }).catch(err=>{console.log(err)});
  }
  
  filterFlights(){
    this.allFlights=this.allFlights||[];
    //filter all aircraft or single aircraft
    if (this.aircraftSelected==="ALL") this.flights=JSON.parse(JSON.stringify(this.allFlights));
    else if (this.aircraftSelected==="Courier") {
      this.flights=this.allFlights.filter(f=>(f.acftType==="Courier"||f.acftType==="Sky Courier")
        &&(new Date(this.startDate408)<=new Date(f.dateString)||(f.flightNumber&&f.flightNumber.substring(0,1)==="9")));
    }
    else {
      this.flights=this.allFlights.filter(f=>(f.acftType===this.aircraftSelected));
    }
    this.flights.sort((a,b)=>new Date(a.dateString)-new Date(b.dateString));
    let cumMinutes=0;
    this.flights.forEach(f=>{
      cumMinutes+=f.flightTime*1;
      f.cumHours=(cumMinutes/60).toFixed(1);
      f.sicTO=0;
      f.sicLND=0;
      f.legArray.forEach(leg=>{
        f.sicLND+=(leg.sicDayLandings*1+leg.sicNightLandings*1);
        f.sicTO+=(leg.sicDayTO*1+leg.sicNightTO*1);
      });
    });
  }
  
  loggedIn(){
    return window.user&&window.user.accessToken;
  }
  
  onePage(flights,fields){
    for (let i=1;i<21;i++){
      if (flights[i-1]){
        fields['DATERow'+i] = [flights[i-1].dateString];
        fields['FLTRow'+i] = [flights[i-1].acftNumber];//flightNumber];
        fields['RouteRow'+i] = [flights[i-1].route.toString()];
        fields['TO  LDRow'+i] = [flights[i-1].sicTO + ' / ' + flights[i-1].sicLND];
        fields['PIC InitialsRow'+i] = [flights[i-1].pilot];
        fields['HoursRow'+i] = [(flights[i-1].flightTime/60).toFixed(1)];
        fields['Cumulative HoursRow'+i] = [flights[i-1].cumHours];
      }
    }
    return fields;
  }
  
  openPdf(){
    this.aircraftSelected="Courier";
    this.filterFlights();
    let fields={'Pilot Name':[this.pilot.name],'Certificate Number':[this.pilot.cert],'Page':['1'],'of':['1'],throughDate:[new Date().toLocaleDateString()]};
    let rows=JSON.parse(JSON.stringify(this.flights));
    
    this.http({ url: "/pdf?filename=SIC_LOG.pdf", 
        method: "GET", 
        headers: { 'Accept': 'application/pdf' }, //'text/plain'
        responseType: 'arraybuffer' })
      .then(response=> {
        let filled_pdf; // Uint8Array
        let page=1;
        let pageOf=Math.trunc(rows.length/20)+1;
        this.blobs=[];
        this.fileURLs=[];
        while (rows.length>0) {
          fields={'Pilot Name':[this.pilot.name],'Certificate Number':[this.pilot.cert],'Page':[page],'of':[''],throughDate:[new Date().toLocaleDateString()]};
          page++;
          let temp=rows.splice(0,20);
          fields=this.onePage(temp,fields);
          console.log(fields)
          filled_pdf = pdfform().transform(response.data, fields);
  		    //console.log(pdfform().list_fields(response.data));
  		    this.blobs[page-2] = new Blob([filled_pdf], {type: 'application/pdf'});
  		    //var filename=PDFFileName + "_" + pilot.name + '_' + year + '_' + month + '_' + day + '.pdf';
  	      //saveAs(blob, filename);
  	      this.fileURLs[page-2] = URL.createObjectURL(this.blobs[page-2]);
  	      //if (page===1) window.open(this.fileURLs[page-1], '_blank');
  	      //window.open(this.fileURLs[page-1], '_blank');
        }
	      //
      }).catch(err=>{
        alert(err);
        console.log(err);
        this.loading=false;
      });
  }
  
  viewPage(page){
    window.open(this.fileURLs[page], '_blank');
  }
}

angular.module('rotApp')
  .component('sicHours', {
    templateUrl: 'app/sicHours/sicHours.html',
    controller: SicHoursComponent,
    controllerAs: 'sicHours'
  });

})();
