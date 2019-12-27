/* global angular, inject */
require('../node_modules/angular/angular.min.js');
require('../node_modules/angular-mocks/angular-mocks.js');
require('../public/javascript/app.js');
// global.fetch = require('jest-fetch-mock');

describe('Test post event.', () => {
  // let $scope;
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
    httpBackend.when('GET', '/updateProfile/').respond([
      {
        fullName: 'Test update',
        birth: '2015-10-24',
        gender: 'Female',
        marriage: 'Unmarried',
        country: 'United States',
        state: 'Pennsylvania',
        area: 'Evo',
        street: '2930 Chestnut St',
        phone: '12345678',
        email: 'Test@seas.upenn.edu',
        company: null,
        college: 'Upenn',
        selfIntro: 'Test updating files.',
        imageSrc: null,
      },
    ]);
    // $controller('postController', { $scope: $scope, $http: $http });
  }));
  // beforeEach(() => {
  //     fetch.resetMocks();
  // });


  describe('post', () => {
    it('post event', async () => {
      const $scope = $rootScope.$new();
      $controller('updateUserInformation', { $scope });
      $scope.email = 'Test@seas.upenn.edu';

      httpBackend.flush();

      expect($scope.getUpdateInfoPage()).toBe('/updateProfile?Test@seas.upenn.edu');
      expect($scope.getProfilePage()).toBe('/profile?Test@seas.upenn.edu');

      // const text = app.fixture.debugElement.queryAll(By.css('.showText'));
      expect($scope.userName).toBe('Test update');
      expect($scope.DateOfBirth).not.toBeNull();
      expect($scope.gender).toBe('Female');
      expect($scope.marrageStatus).toBe('Unmarried');
      expect($scope.Country).toBe('United States');
      expect($scope.state).toBe('Pennsylvania');
      expect($scope.area).toBe('Evo');
      expect($scope.street).toBe('2930 Chestnut St');
      expect($scope.phone).toBe('12345678');
      expect($scope.company).toBe(null);
      expect($scope.college).toBe('Upenn');
      expect($scope.selfIntro).toBe('Test updating files.');
      expect($scope.image).toBe(null);
    });
  });
});
