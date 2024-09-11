'use strict';

class NavbarController {
  //start-non-standard
  menu = [{
    'title': 'Home',
    'state': 'main'
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

  constructor(Auth) {
    this.isLoggedIn = Auth.isLoggedIn;
    this.isAdmin = Auth.isAdmin;
    this.getCurrentUser = Auth.getCurrentUser;
  }
  
  $onInit(){
    
  }

}

angular.module('rotApp')
  .controller('NavbarController', NavbarController);
