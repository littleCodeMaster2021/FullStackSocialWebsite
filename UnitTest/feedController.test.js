/* global angular, inject */
require('../node_modules/angular/angular.min.js');
require('../node_modules/angular-mocks/angular-mocks.js');
require('../public/javascript/app.js');
// global.fetch = require('jest-fetch-mock');

describe('Test activity feed.', () => {
  document.body.innerHTML = '<div id="1571670583491">'
  + '<input value="new comment">'
  + '</div>'
  + '<div id="c1">'
  + '<input id = "editPostTextc1" value="new comment new">'
  + '</div>';


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
    httpBackend.when('GET', '/profile//post').respond(
      {
        post: [
          {
            userid: 'Test@seas.upenn.edu',
            postid: 1571670583491,
            text: 'good day',
            image: '1234',
            tag: 'food',
            comment: [
              {
                commentID: '1111',
                user: 'robin@seas.upenn.edu',
                comment: 'comment1',
              },
            ],
            disLikedBy: ['shuaiz@seas.upenn.edu'],
            dislikes: 1,
            likedBy: [
              'user_new@gmail.com',
              '123@gmail.com',
            ],
            likedByFullName: [
              'Robin',
              'Mike',
            ],
            likes: 2,
          },
        ],
        commentinfo: [
          {
            email: 'robin@seas.upenn.edu',
            fullName: 'Robin',
            imageSrc: '1234567',
          },
        ],
      },
    );

    httpBackend.when('GET', '/getActiveFeed/').respond(
      {
        post: [
          {
            userid: 'Test@seas.upenn.edu',
            postid: 1571670583491,
            text: 'good day',
            image: '1234',
            comment: [
              {
                commentID: '1111',
                user: 'robin@seas.upenn.edu',
                comment: 'comment1',
              },
            ],
            disLikedBy: ['shuaiz@seas.upenn.edu'],
            dislikes: 1,
            likedBy: [
              'user_new@gmail.com',
              '123@gmail.com',
            ],
            likedByFullName: [
              'Robin',
              'Mike',
            ],
            likes: 2,
          },
        ],
        userinfo: [
          {
            email: 'Test@seas.upenn.edu',
            fullName: 'Test Test',
            imageSrc: '1234567',
          },
        ],
        commentinfo: [
          {
            email: 'robin@seas.upenn.edu',
            fullName: 'Robin',
            imageSrc: '123456789',
          },
        ],
      },
    );
    httpBackend.when('GET', '/profile/').respond([
      {
        fullName: 'Test Test',
        birth: '2019-10-02',
        gender: 'Male',
        marriage: 'Unmarried',
        country: 'United States',
        state: 'Pennsylvania',
        area: null,
        street: '3200 Chestnut St',
        phone: '2673669197',
        email: 'Test@seas.upenn.edu',
        company: null,
        college: 'Upenn',
        selfIntro: 'qweqweqwe',
        imageSrc: '1234567',
      },
    ]);

    httpBackend.when('GET', '/getCurrentContacts/').respond([
      {
        email: 'yuhangu.m@gmail.com',
        name: 'Yuhan Gu',
        password: '12345',
        phoneNumber: '2676709145',
        followed: ['test@seas.upenn.edu'],
      },
    ]);

    httpBackend.when('GET', '/showCurrentContacts/').respond({
      user: [
        {
          email: 'yuhangu.m@gmail.com',
          name: 'Yuhan Gu',
          password: '12345',
          phoneNumber: '2676709145',
          followed: ['test@seas.upenn.edu'],
        }],
      profile: [
        {
          fullName: 'Yuhan Gu',
          birth: '2019-10-02',
          gender: 'Male',
          marriage: 'Unmarried',
          country: 'United States',
          state: 'Pennsylvania',
          area: null,
          street: '3200 Chestnut St',
          phone: '2673669197',
          email: 'Test@seas.upenn.edu',
          company: null,
          college: 'Upenn',
          selfIntro: 'qweqweqwe',
          imageSrc: null,
        },
      ],
    });

    httpBackend.when('GET', '/allUsers/').respond([
      {
        action: '+Follow',
        email: 'imageTest@gmail.com',
        name: 'Test',
        password: '4321',
      },
    ]);

    httpBackend.when('GET', '/totalLikes/').respond(
      [
        {
          _id: 'yuhangu.m@gmail.com',
          totalLikes: 4,
        },
      ],
    );

    httpBackend.when('GET', '/totalPost/').respond(
      [
        {
          _id: 'yuhangu.m@gmail.com',
          totalPostCount: 3,
        },
      ],
    );

    httpBackend.when('GET', '/totalFollower/').respond(
      [
        {
          _id: 'yuhangu.m@gmail.com',
          totalFollowerCount: 2,
        },
      ],
    );

    httpBackend.when('POST', '/editPostText/1571670583491', (postData) => {
      const jsonData = JSON.parse(postData);
      expect(jsonData.newPostText).toBe('new comment');
      return true;
    }).respond(200, true);
  }));
  // beforeEach(() => {
  //   fetch.resetMocks();
  // });


  describe('get active feed', () => {
    it('get active feed', async () => {
      const $scope = $rootScope.$new();
      $controller('feedController', { $scope });
      $scope.email = 'Test@seas.upenn.edu';

      expect($scope.getUploadURL()).toBe('/profile/Test@seas.upenn.edu/upload');
      expect($scope.getUpdateInfoPage()).toBe('/updateProfile?Test@seas.upenn.edu');
      expect($scope.getProfilePage()).toBe('/profile?Test@seas.upenn.edu');
      expect($scope.getActiveFeed()).toBe('/getActiveFeed?Test@seas.upenn.edu');
      httpBackend.flush();

      // Check outArray
      expect($scope.outArray[0].image).toBe('1234');
      expect($scope.outArray[0].postid).not.toBeNull();
      expect($scope.outArray[0].text).toBe('good day');
      expect($scope.outArray[0].userid).toBe('Test@seas.upenn.edu');
      expect($scope.outArray[0].fullName).toBe('Test Test');
      expect($scope.outArray[0].postidOld).toBe(1571670583491);
      expect($scope.outArray[0].comment[0].commentID).toBe('1111');
      expect($scope.outArray[0].comment[0].user).toBe('robin@seas.upenn.edu');
      expect($scope.outArray[0].comment[0].comment).toBe('comment1');
      expect($scope.outArray[0].disLikedBy[0]).toBe('shuaiz@seas.upenn.edu');
      expect($scope.outArray[0].dislikes).toBe(1);
      expect($scope.outArray[0].likedBy[0]).toBe('user_new@gmail.com');
      expect($scope.outArray[0].likes).toBe(2);

      expect($scope.outArray[0].fullName).toBe('Test Test');
      expect($scope.outArray[0].profilePhoto).toBe('1234567');
      expect($scope.outArray[0].display).toBe('inline-block');
      expect($scope.outArray[0].comment[0].display).toBe('none');
      expect($scope.outArray[0].comment[0].fullName).toBe('Robin');
      expect($scope.outArray[0].comment[0].imageSrc).toBe('123456789');

      expect($scope.userName).toBe('Test Test');
      expect($scope.image).toBe('1234567');
      expect($scope.followUsers[0].action).toBe('+Follow');
      expect($scope.followUsers[0].email).toBe('imageTest@gmail.com');
      expect($scope.followUsers[0].name).toBe('Test');
      expect($scope.followUsers[0].password).toBe('4321');
      expect($scope.contactNumbers).toBe(1);

      $scope.submitFunction(1571670583491);
      expect($scope.newPostText).toBe('new comment');
      $scope.submitFunctionNew('c1', 1571670583491);
      expect($scope.newCommentText).toBe('new comment new');
    });
  });
});
