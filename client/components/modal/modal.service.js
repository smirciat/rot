'use strict';

angular.module('rotApp')
  .factory('Modal', function($rootScope, $uibModal) {
    /**
     * Opens a modal
     * @param  {Object} scope      - an object to be merged with modal's scope
     * @param  {String} modalClass - (optional) class(es) to be applied to the modal
     * @return {Object}            - the instance $uibModal.open() returns
     */
    function openModal(scope = {}, modalClass = 'modal-default') {
      var modalScope = $rootScope.$new();
      angular.extend(modalScope, scope);

      return $uibModal.open({
        templateUrl: 'components/modal/modal.html',
        windowClass: modalClass,
        scope: modalScope
      });
    }

    // Public API here
    return {

      /* Confirmation modals */
      confirm: {
        check(del = angular.noop) {
          /**
           * Open a delete confirmation modal
           * @param  {String} name   - name or info to show on modal
           * @param  {All}           - any additional args are passed straight to del callback
           */
          return function() {
            var args = Array.prototype.slice.call(arguments);
            var name = args.shift();
            var reservation = args.shift();
            var theModal;

            theModal = openModal({
              modal: {
                dismissable: true,
                title: 'Confirm ' + name,
                html: '<p>Are you sure you want to <strong>' + name + '</strong> your reservation?</p><p>' + reservation + '</p>',
                buttons: [{
                  classes: 'btn-danger',
                  text: name,
                  click: function(e) {
                    theModal.close(e);
                  }
                }, {
                  classes: 'btn-default',
                  text: 'Cancel',
                  click: function(e) {
                    theModal.dismiss(e);
                  }
                }]
              }
            }, 'modal-danger');

            theModal.result.then(function(event) {
              del.apply(event, args);
            });
          };
        },
        enterData: function(cb) { //my new modal
          cb = cb || angular.noop;
          return function() {
            var args = Array.prototype.slice.call(arguments),
                name = args.shift(),
                formData = {},
                theModal;
            theModal = openModal({ //openModal is a function the modal service defines.  It is just a wrapper for $uibModal
              modal: {
                formData:formData,
                dismissable: true,
                title: 'Enter Required Information',
                html: '<p>' + name + '</p>', //set the modal message here, name is the parameter we passed in
                buttons: [ {//this is where you define you buttons and their appearances
                  classes: 'btn-primary',
                  text: 'Confirm',
                  click: function(event) {
                    theModal.close(event);
                  }
                },]
              }
            }, 'modal-success');
            theModal.result.then(function(event) {
              cb.apply(event, [formData]); //this is where all callback is actually called
            }).catch(err=>{
              console.log(err);
            });
          };
        },
        radio: function(cb) { //my new modal
          cb = cb || angular.noop;
          return function() {
            var args = Array.prototype.slice.call(arguments),
                formData = args.shift()||{},
                theModal;
            for (let key in formData) {
              if (formData[key]==="true"&&key!=="newBaseMonth"&&key!=="includes297G") formData[key]=true;
              if (formData[key]==="false"&&key!=="newBaseMonth"&&key!=="includes297G") formData[key]=false;
            }
            theModal = openModal({ //openModal is a function the modal service defines.  It is just a wrapper for $uibModal
              modal: {
                formData:formData,
                radio:true,
                trainingTypes:this.appConfig.trainingEvents,
                dismissable: true,
                title: 'Click Each Training Type Accomplished on this Training Record',
                //html: '<p>' + name + '</p>', //set the modal message here, name is the parameter we passed in
                buttons: [ {//this is where you define you buttons and their appearances
                  classes: 'btn-primary',
                  text: 'Confirm/Save',
                  click: function(event) {
                    theModal.close(event);
                  }
                }, {
                  classes: 'btn-danger',
                  text: 'Cancel',
                  click: function(event) {
                    theModal.dismiss(event);
                  }
                }]
              }
            }, 'modal-success');
            theModal.result.then(function(event) {
              cb.apply(event, [formData]); //this is where all callback is actually called
            }).catch(err=>{
              console.log(err);
            });
          };
        },
        pilotData: function(cb) { //my new modal
          cb = cb || angular.noop;
          return function() {
            var args = Array.prototype.slice.call(arguments),
                pilotData = args.shift()||{},
                pilotArr = args.shift()||[],
                theModal;
            var trainingEvents=this.appConfig.trainingEvents;
            let index = pilotArr.map(e => e.name).indexOf("new");
            if (index>-1) pilotArr.splice(index,1);
            index = pilotArr.map(e => e._id).indexOf(undefined);
            if (index>-1) pilotArr.splice(index,1);
            index = pilotArr.map(e => e._id).indexOf("");
            if (index>-1) pilotArr.splice(index,1);
            pilotArr.sort((a,b)=>{
              if (!a.name) a.name='';
              if (!b.name) b.name='';
              return a.name.localeCompare(b.name);
            });
            pilotArr.forEach(pilot=>{
              pilot.combo=pilot._id+': '+pilot.name;
            });
            pilotArr.unshift({name:'new',combo:'new',_id:''});
            theModal = openModal({ //openModal is a function the modal service defines.  It is just a wrapper for $uibModal
              modal: {
                formData:pilotData,
                pilotArr:pilotArr,
                trainingEvents:trainingEvents,
                pilot:true,
                dismissable: true,
                fixDate: function(key){
                  let dateString=this.formData[key];
                  if (typeof dateString==="string"){
                    let arr=dateString.split('/');
                    if (arr.length>=3) {
                      if (arr[2].length===2) this.formData[key] = arr[0]+'/'+arr[1]+'/20'+arr[2];
                    }
                  }
                },
                title: 'Check or Enter the Pilot`s Information',
                //html: '<p>Employee Number is: ' + empNum + '</p>', //set the modal message here, name is the parameter we passed in
                fill: function(){
                  if (this.formData.name==="new"||this.new) {
                    if (!this.new) this.formData.name="";
                    this.new=true;
                    return;
                  }
                  let index=-1;
                  if (pilotData._id) index = pilotArr.map(e => e._id).indexOf(pilotData._id);
                  if (this.formData._id) index = pilotArr.map(e => e._id).indexOf(this.formData._id);
                  if (pilotData.name) index = pilotArr.map(e => e.name).indexOf(pilotData.name);
                  if (this.formData.name) index = pilotArr.map(e => e.name).indexOf(this.formData.name);
                  if (index>-1) {
                    pilotData=pilotArr[index];
                    this.formData=pilotData;
                  }
                },
                buttons: [ {//this is where you define you buttons and their appearances
                  classes: 'btn-primary',
                  text: 'Confirm/Save',
                  click: function(event) {
                    theModal.close(event);
                  }
                }, {
                  classes: 'btn-danger',
                  text: 'Cancel',
                  click: function(event) {
                    theModal.dismiss(event);
                  }
                }]
              }
            }, 'modal-success');
            theModal.result.then(function(event) {
              cb.apply(event, [pilotData]); //this is where all callback is actually called
            }).catch(err=>{
              console.log(err);
            });
          };
        },
        quickMessage(del = angular.noop) {
          /**
           * Open a delete confirmation modal
           * @param  {String} name   - name or info to show on modal
           * @param  {All}           - any additional args are passed straight to del callback
           */
          return function() {
            var args = Array.prototype.slice.call(arguments),
                name = args.shift(),
                quickModal;

            quickModal = openModal({
              modal: {
                dismissable: true,
                title: 'Important Message',
                html: '<p> <strong>' + name + '</strong> </p>',
                buttons: [ {
                  classes: 'btn-success',
                  text: 'OK',
                  click: function(event) {
                    quickModal.close(event);
                  }
                }]
              }
            }, 'modal-success');

            quickModal.result.then(function(event) {
              del.apply(event, args);
            });
          };
        } ,
        /**
         * Create a function to open a delete confirmation modal (ex. ng-click='myModalFn(name, arg1, arg2...)')
         * @param  {Function} del - callback, ran when delete is confirmed
         * @return {Function}     - the function to open the modal (ex. myModalFn)
         */
        delete(del = angular.noop) {
          /**
           * Open a delete confirmation modal
           * @param  {String} name   - name or info to show on modal
           * @param  {All}           - any additional args are passed straight to del callback
           */
          return function() {
            var args = Array.prototype.slice.call(arguments),
              name = args.shift(),
              deleteModal;

            deleteModal = openModal({
              modal: {
                dismissable: true,
                title: 'Confirm Delete',
                html: '<p>Are you sure you want to delete <strong>' + name +
                  '</strong> ?</p>',
                buttons: [{
                  classes: 'btn-danger',
                  text: 'Delete',
                  click: function(e) {
                    deleteModal.close(e);
                  }
                }, {
                  classes: 'btn-default',
                  text: 'Cancel',
                  click: function(e) {
                    deleteModal.dismiss(e);
                  }
                }]
              }
            }, 'modal-danger');

            deleteModal.result.then(function(event) {
              del.apply(event, args);
            }).catch(err=>{
              console.log(err);
            });
          };
        }
      }
    };
  });
