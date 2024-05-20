'use strict';

(function(){

class OtzComponent {
  constructor($http,$state,uiGridConstants,moment) {
    this.state=$state;
    this.http=$http;
    this.moment=moment;
    window.moment=moment;
    this.url="https://firestore.googleapis.com/v1/projects/brg-flight-report/databases/(default)/documents/";
    this.data=[];
    this.today=new Date();
    this.shortMonths=[];
    for (let m=1;m<13;m++){
      this.shortMonths.push(new Date(m+'/1/2024').toLocaleString('default', { month: 'short' }));
    }
    let medicalTemplate='<div class="ui-grid-cell-contents" title="TOOLTIP">{{grid.appScope.otz.medicalShortDate(row)}}</div>';
    let cellTemplate='<div class="ui-grid-cell-contents" title="TOOLTIP">{{grid.appScope.otz.shortDate(COL_FIELD)}}</div>';
    this.gridOptions={rowHeight:22,
                      columnDefs: [
                      {name:'pilot',field:'name',minWidth:150},
                      {name:'d.O.H.',field:'dateOfHire',width:90,cellTemplate:cellTemplate},
                      {name:'emp',field:'_id',width:70},
                      {name:'cert',field:'cert',width:80},
                      {name:'med',field:'medicalExp',width:90,cellClass:this.medicalCellClass},
                      {name:'oAS Card',field:'oas',minWidth:90,cellTemplate:cellTemplate},
                      {name:'passport',field:'passport',width:90,cellTemplate:cellTemplate},
                      {name:'russianVisa',field:'rus',minWidth:90,cellTemplate:cellTemplate},
                      {name:'basicIndoc',field:'BasicIndocExp',minWidth:90,cellClass:this.cellClass,cellTemplate:cellTemplate},
                      {name:'293(a)1,4-8',field:'BasicIndocExp',minWidth:90,cellClass:this.cellClass,cellTemplate:cellTemplate},
                      {name:'hazmat',field:'HazmatExp',minWidth:90,cellClass:this.cellClass,cellTemplate:cellTemplate},
                      {name:'208Ground',field:'C208GroundExp',minWidth:90,cellClass:this.cellClass,cellTemplate:cellTemplate},
                      {name:'208TKS',field:'C208TKSExp',minWidth:90,cellClass:this.cellClass,cellTemplate:cellTemplate},
                      {name:'kingAirGround',field:'BE20GroundExp',minWidth:90,cellClass:this.cellClass,cellTemplate:cellTemplate},
                      {name:'b190Ground',field:'B190GroundExp',minWidth:90,cellClass:this.cellClass,cellTemplate:cellTemplate},
                      {name:'casaGround',field:'C212GroundExp',minWidth:90,cellClass:this.cellClass,cellTemplate:cellTemplate},
                      {name:'408Ground',field:'C408GroundExp',minWidth:90,cellClass:this.cellClass,cellTemplate:cellTemplate}
                    ],
                    data:this.data};
    this.gridOptions2={rowHeight:22,
                      columnDefs: [
                      {name:'pilot',field:'name',minWidth:150},
                      {name:'d.O.H.',field:'dateOfHire',width:90,cellTemplate:cellTemplate},
                      {name:'emp',field:'_id',width:70},
                      {name:'cert',field:'cert',width:80},
                      {name:'med',field:'medicalExp',width:90,cellClass:this.medicalCellClass},//cellTemplate:medicalTemplate},
                      {name:'297',field:'297Exp',minWidth:90,cellClass:this.cellClass,cellTemplate:cellTemplate},
                      {name:'Autopilot',field:'297gExp',minWidth:90,cellClass:this.cellClass,cellTemplate:cellTemplate},
                      {name:'299',field:'299Exp',minWidth:90,cellClass:this.cellClass,cellTemplate:cellTemplate},
                      {name:'208',field:'C208PICExp',minWidth:90,cellClass:this.cellClass,cellTemplate:cellTemplate},
                      {name:'kingAir',field:'BE20PICExp',minWidth:90,cellClass:this.cellClass,cellTemplate:cellTemplate},
                      {name:'b190Pic',field:'B190PICExp',minWidth:90,cellClass:this.cellClass,cellTemplate:cellTemplate},
                      {name:'b190Sic',field:'B190SICExp',minWidth:90,cellClass:this.cellClass,cellTemplate:cellTemplate},
                      {name:'casaPic',field:'C212PICExp',minWidth:90,cellClass:this.cellClass,cellTemplate:cellTemplate},
                      {name:'casaSic',field:'C212SICExp',minWidth:90,cellClass:this.cellClass,cellTemplate:cellTemplate},
                      {name:'408Pic',field:'C408PICExp',minWidth:90,cellClass:this.cellClass,cellTemplate:cellTemplate},
                      {name:'408Sic',field:'C408SICExp',minWidth:90,cellClass:this.cellClass,cellTemplate:cellTemplate},
                      {name:'chkAmn',field:'CheckAirmanObsExp',minWidth:90,cellClass:this.cellClass,cellTemplate:cellTemplate},
                      {name:'fltInst',field:'FlightInstructorObsExp',minWidth:90,cellClass:this.cellClass,cellTemplate:cellTemplate}
                    ],
                    data:this.data};
  
  }
  
  $onInit(){
    window.medicalShortDate=this.medicalShortDate;
    if (!window.user) this.state.go('main');
    else {
      this.token=window.user.accessToken;
      this.config={headers: {
        'Authorization': 'Bearer ' + this.token 
      }};
      this.getFilteredData('pilots',{attribute:'pilotBase',value:'OTZ'}).then(res=>{
        console.log(res);
        
      });
    }
  }
  
  cellClass(grid, row, col, rowRenderIndex, colRenderIndex) {
    if (grid) {
      if (!grid.getCellValue(row,col)||grid.getCellValue(row,col)==="") return;
      let base=window.moment(new Date(grid.getCellValue(row,col)));
      let baseMonth=base.month();
      let baseYear=base.year();
      let today=window.moment();
      let thisMonth=today.month();
      let thisYear=today.year();
      if (thisYear-baseYear===1) {
        baseMonth-=12;
      }
      if (thisYear-baseYear===-1) {
        baseMonth+=12;
      }
      if ((thisYear-baseYear>1)||(thisYear-baseYear<-1)) return;
      if ((thisMonth-baseMonth)>1) return "black";
      if ((thisMonth-baseMonth)===1) return "red";
      if ((thisMonth-baseMonth)===0) return "yellow";
      if ((thisMonth-baseMonth)===-1) return "green";
      
    }
  }
  
  medicalCellClass(grid, row, col, rowRenderIndex, colRenderIndex) {
    if (grid&&window.moment&&window.medicalShortDate&&row) {
      let expDate;
      let index = grid.options.data.map(e => e._id).indexOf(row.entity._id);
      if (index>-1) expDate=grid.options.data[index].medicalExp;
      if (!expDate||expDate==="") return;
      let base=window.moment(new Date(expDate)).endOf('month');
      let baseMonth=base.month();
      let baseYear=base.year();
      let today=window.moment();
      let thisMonth=today.month();
      let thisYear=today.year();
      if (thisYear-baseYear===1) {
        baseMonth-=12;
      }
      if (thisYear-baseYear===-1) {
        baseMonth+=12;
      }
      if ((thisYear-baseYear>1)||(thisYear-baseYear<-1)) return;
      if ((thisMonth-baseMonth)>=1) return "black";
      if ((thisMonth-baseMonth)===0) return "red";
      if ((thisMonth-baseMonth)===-1) return "yellow";
      if ((thisMonth-baseMonth)===-2) return "green";
      
    }
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
        console.log(res);
        if (res.data.length===1&&!res.data[0].document) return [];
        this[collection]=this.filteredDocumentsToArray(res.data);
        this[collection].sort((a,b)=>{
          if (a.dateOfHire===undefined) return -1;
          return new Date(a.dateOfHire) - new Date(b.dateOfHire);
        });
        this[collection];
        this[collection].forEach(pilot=>{
          pilot.medicalExp=this.medicalShortDate(pilot);
        });
        this.gridOptions.data=this[collection];
        this.gridOptions2.data=this[collection];
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
    
    toBody(json){
      let fields={};
      for (let key in json) {
        if (key==='_id') continue;
        if (key==='$$hashKey') continue;
        else {
          fields[key]={stringValue:json[key]||""};
        }
      }
      //console.log({fields});
      return {fields};
    }
    
    fromBody(data){//fields,id){
      let fields=data.fields;
      let id=this.getId(data);//data.name.split('/').pop();
      let json={_id:id};
      for (let key in fields) {
        json[key]=fields[key].stringValue;
      }
      //console.log(json);
      return json;
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
    
    getId(response){
      return response.name.split('/').pop();
    }
    
    shortDate(dateString){//grid,row,col){
      //if (grid) {
        //let dateString=grid.getCellValue(row,col);
        //console.log('short date');
        if (dateString){
          let arr=dateString.split('/');
          if (arr.length>=3) {
            return this.shortMonths[parseInt(arr[0],10)-1]+'-'+arr[2];//.slice(-2);
          }
        }
        return dateString;
      }
      
      medicalShortDate(row){
        let pilot=row;//.entity;
        let dateString=row.medicalDate;
        if (row.entity) {
          pilot=row.entity;
          dateString=row.entity.medicalDate;
        }
        let duration=6;
        let age=50;
        if (pilot.dateOfBirth&&pilot.dateOfBirth!=="") {
          age=this.moment().diff(new Date(pilot.dateOfBirth),'years',true);
        }
        if (age&&age<40&&age!==0) duration=12;
        let expDate=this.moment(new Date(dateString)).add(duration,'M').format('MM/DD/YYYY');
        if (expDate){
          let arr=expDate.split('/');
          if (arr.length>=3) {
            expDate=this.shortMonths[parseInt(arr[0],10)-1]+'-'+arr[2];//.slice(-2);
          }
        }
        if (row.entity) {
          let index = this.gridOptions.data.map(e => e._id).indexOf(pilot._id);
          if (index>-1) this.gridOptions.data[index].medicalExp=expDate;
        }
        return expDate;
      }
}

angular.module('rotApp')
  .component('otz', {
    templateUrl: 'app/otz/otz.html',
    controller: OtzComponent,
    controllerAs: 'otz'
  });

})();
