/* global angular, inject */
/* eslint-disable no-unused-vars */

/*
Follow, we need to combine the Jest with AngularJs to do some necessary unit test to
guarantee those events are handled successfully.
 */
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.resolve(__dirname, '../views', 'registration.html'), 'utf8');


require('../node_modules/angular/angular.min.js');
require('../node_modules/angular-mocks/angular-mocks.js');
require('../public/javascript/app.js');
// global.fetch = require('jest-fetch-mock');

describe('Test the elements exist for static html files.', () => {
  beforeEach(() => {
    document.documentElement.innerHTML = html.toString();
  });

  it('Test input box exist.', () => {
    const element = document.getElementById('name');
    expect(element).not.toBeNull();
  });

  it('Test email input box exist.', () => {
    const element = document.getElementById('email');
    expect(element).not.toBeNull();
  });

  it('Test password input box exist.', () => {
    const element = document.getElementById('pass');
    expect(element).not.toBeNull();
  });

  it('Test reInput password input box exist.', () => {
    const element = document.getElementById('rePass');
    expect(element).not.toBeNull();
  });

  it('Test register button exists.', () => {
    const element = document.getElementById('register');
    expect(element).not.toBeNull();
  });
});

describe('Should register successfully to create a new user', () => {
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
    httpBackend.when('POST', '/register', {
      name: 'Test',
      email: 'Test@seas.upenn.edu',
      pass: '12345',
      rePass: '12345',
      agreeTerm: 'on',
      imageSrc: 'http://ssl.gstatic.com/accounts/ui/avatar_2x.png',
    }).respond(200, true);

    httpBackend.when('GET', '/getUpdateInfoPage', {}).respond({
      name: 'Test@seas.upenn.edu',
    });
  }));

  describe('register', () => {
    it('registration event', async () => {
      const $scope = $rootScope.$new();
      $controller('registerController', { $scope });
      $scope.register();
      expect(window.location.href).toBe('http://localhost/');

      $scope.analyze('12345');
      expect($scope.passwordStrength['background-color']).toBe('red');

      $scope.analyze('abcd12345');
      expect($scope.passwordStrength['background-color']).toBe('orange');

      $scope.analyze('Abcd12345@');
      expect($scope.passwordStrength['background-color']).toBe('green');
    });
  });
});


describe('Should fail to create a new user', () => {
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
  }));
});
