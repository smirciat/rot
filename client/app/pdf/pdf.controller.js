'use strict';

(function(){

class PdfComponent {
  constructor() {
    this.message = 'Hello';
  }
}

angular.module('rotApp')
  .component('pdf', {
    templateUrl: 'app/pdf/pdf.html',
    controller: PdfComponent,
    controllerAs: 'pdfCtrl'
  });

})();
