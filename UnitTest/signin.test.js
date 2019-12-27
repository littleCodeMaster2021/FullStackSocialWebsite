/* global angular, inject */
const sinon = require('sinon');
require('../node_modules/angular/angular.min.js');
require('../node_modules/angular-mocks/angular-mocks.js');
require('../public/javascript/app.js');
// global.fetch = require('jest-fetch-mock');


describe('Test Sign In', () => {
  let httpBackend = '';
  let $controller = '';
  let $rootScope = '';

  beforeEach(angular.mock.module('CIS557'));
  beforeEach(inject((_$controller_, _$rootScope_, $httpBackend) => {
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    // $scope = $rootScope.$new();
    httpBackend = $httpBackend;
    httpBackend.when('POST', '/signIn', {
      username: 'test@upenn.edu',
      password: '123456',
    }).respond(200, true);

    // httpBackend.when('GET', '/getUpdateInfoPage', {}).respond({
    //   name: 'Test@seas.upenn.edu',
    // });
  }));

  describe('register', () => {
    it('registration event', async () => {
      const $scope = $rootScope.$new();
      $controller('signInController', { $scope });
      $scope.username = 'test@upenn.edu';
      $scope.password = '123456';

      sinon.stub(window.location, 'assign');
      sinon.stub(window.location, 'replace');
      sinon.stub(window.location, 'search');

      httpBackend.expectPOST('/signIn').respond(200, true);
      $scope.signIn();
      // dispatch(action.reset());
      // expect(localStorage.setItem).toHaveBeenCalledTimes(1);
      httpBackend.flush();
    });
  });
});


// describe('Should fail to create a new user', () => {
//   let httpBackend = '';
//   let $controller = '';
//   let $rootScope = '';
//
//   beforeEach(angular.mock.module('CIS557'));
//   beforeEach(inject((_$controller_, _$rootScope_, $httpBackend) => {
//     // The injector unwraps the underscores (_) from around the parameter names when matching
//     $controller = _$controller_;
//     $rootScope = _$rootScope_;
//     // $scope = $rootScope.$new();
//     httpBackend = $httpBackend;

//   }));
// });
