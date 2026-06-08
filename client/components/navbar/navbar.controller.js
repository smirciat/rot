'use strict';

class NavbarController {
  //start-non-standard
  menu = [{
    'title': 'Home',
    'state': 'main'
  },{'title': 'Records',
    'state': 'records'
  },{'title': 'Evals',
    'state': 'pilotEvals'
  },{'title': 'Log',
    'state': 'sicHours'
  },{
    'title': 'Nome',
    'state': 'ome'
  },{
    'title': 'Kotz',
    'state': 'otz'
  },{
    'title': 'Fileserver',
    'state': 'pdftab'
  }];

  isCollapsed = true;
  //end-non-standard

  constructor(Auth,$http) {
    this.isLoggedIn = Auth.isLoggedIn;
    this.isAdmin = Auth.isAdmin;
    this.getCurrentUser = Auth.getCurrentUser;
    this.http=$http;
  }
  
  $onInit(){
    this.init();
  }
  
  init(){
    this.http.post('/api/things/firebase',{collection:'pilots'}).then(res=>{
      this.pilots=res.data.filter(pilot=>{
        return pilot.name&&pilot.name!==""&&(pilot.isActive===undefined||pilot.isActive)&&pilot.pilotBase;
      });
      this.pilots.sort((a,b)=>{
        return a.name.localeCompare(b.name);
      });
      this.pilots.unshift({name:'All.................'});
      let index=this.pilots.map(e=>e.displayName).indexOf('K. Janke');
      if (index>-1) this.chosenPilot=this.pilots[index];
    });
  }

}

angular.module('rotApp')
  .controller('NavbarController', NavbarController)
  ;
