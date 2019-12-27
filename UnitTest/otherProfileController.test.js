/* global angular, inject */
/* eslint-disable no-unused-vars, arrow-body-style */
// const sinon = require('sinon');
require('../node_modules/angular/angular.min.js');
require('../node_modules/angular-mocks/angular-mocks.js');
require('../public/javascript/app.js');
// global.fetch = require('jest-fetch-mock');

describe('Test post event.', () => {
  document.body.innerHTML = '<div id="1571670583492">'
  + '  <input value="hi">'
  + '</div>'
  + '<div id="c2">'
  + '<input id = "editPostTextc2" value="new comment">'
  + '</div>'
  + '<div id="1571670583491">'
  + '<p id="21571670583491" class="showText">Welcome</p>'
  + '<button id ="201571670583491" class="btn btn-default btn-xs">'
  + '<strong>Like</strong> <span class="glyphicon glyphicon-thumbs-up"></span>3</button>'
  + '<input value="testtest">'
  + '<div id="11571670583491"><input value ="this is a comment"></div>'
  + '<input id="editPostText11571670583491" value="testComments">'
  + '</div>';

  // let $scope = "";
  let httpBackend = '';
  let $controller = '';
  let $rootScope = '';

  beforeEach(angular.mock.module('CIS557'));
  beforeEach(inject((_$controller_, _$rootScope_, $httpBackend) => {
    global.window = Object.create(window);
    Object.defineProperty(window, 'location', {
      value: {
        search: '?Test@seas.upenn.edu?Test@seas.upenn.edu',
        pathname: '/otherprofilePost',
        reload: () => 0,
      },
    });
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    // $scope = $rootScope.$new();
    httpBackend = $httpBackend;
    httpBackend.when('GET', '/otherprofilePost/Test@seas.upenn.edu/Test@seas.upenn.edu').respond(
      {
        post: [
          {
            userid: 'Test@seas.upenn.edu',
            postid: 1571670583491,
            text: 'good day',
            image: '1234',
            tag: 'food',
            tagFriends: ['Mike'],
            comment: [
              {
                commentID: '1111',
                user: 'robin@seas.upenn.edu',
                comment: 'comment1',
                tags: ['Mike'],
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
            imageSrc: '1234',
          },
          {
            email: 'robin@seas.upenn.edu',
            fullName: 'Robin',
            imageSrc: '1234567',
          },
        ],
      },
    );

    httpBackend.when('GET', '/profile/Test@seas.upenn.edu').respond([
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
        imageSrc: '1234',
      },
    ]);

    httpBackend.when('GET', '/getCurrentContacts/Test@seas.upenn.edu').respond([
      {
        email: 'yuhangu.m@gmail.com',
        name: 'Yuhan Gu',
        password: '12345',
        phoneNumber: '2676709145',
        followed: ['test@seas.upenn.edu'],
      },
    ]);

    // httpBackend.when('GET', '/getCurrentContacts/').respond([
    //   {
    //     email: 'yuhangu.m@gmail.com',
    //     name: 'Yuhan Gu',
    //     password: '12345',
    //     phoneNumber: '2676709145',
    //     followed: ['test@seas.upenn.edu'],
    //   },
    // ]);

    httpBackend.when('GET', '/showCurrentContacts/Test@seas.upenn.edu').respond({
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
          email: 'yuhangu.m@gmail.com',
          company: null,
          college: 'Upenn',
          selfIntro: 'qweqweqwe',
          imageSrc: '1234',
        },
      ],
    });

    httpBackend.when('GET', '/allUsers/Test@seas.upenn.edu').respond([
      {
        action: '+Follow',
        email: 'imageTest@gmail.com',
        name: 'Test',
        password: '4321',
      },
      {
        action: '+Follow',
        email: 'testFollow@gmail.com',
        name: 'follower1',
        password: '4321',
      },
    ]);

    httpBackend.when('GET', '/totalLikes/Test@seas.upenn.edu').respond([
      {
        _id: 'yuhangu.m@gmail.com',
        totalLikes: 4,
      },
    ]);

    httpBackend.when('GET', '/totalPost/Test@seas.upenn.edu').respond([
      {
        _id: 'yuhangu.m@gmail.com',
        totalPostCount: 3,
      },
    ]);

    httpBackend.when('GET', '/totalFollower/Test@seas.upenn.edu').respond([
      {
        _id: 'yuhangu.m@gmail.com',
      },
    ]);

    httpBackend.when('GET', '/specificUsers/undefined').respond([
      {
        email: 'yuhangu.m@gmail.com',
        name: 'Yuhan Gu',
        password: '12345',
        phoneNumber: '2676709145',
        followed: ['test@seas.upenn.edu'],
      },
    ]);

    httpBackend.when('GET', '/getPostByTags/food').respond(
      {
        post: [
          {
            userid: 'yuhangu.m@gmail.com',
            postid: 1571670583491,
            text: 'good day',
            image: '1234',
            tag: 'food',
            tagFriends: ['Mike'],
            comment: [
              {
                commentID: '1111',
                user: 'robin@seas.upenn.edu',
                comment: 'comment1',
                tags: ['Mike'],
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
            fullName: 'Yuhan Gu',
            birth: '2019-10-02',
            gender: 'Male',
            marriage: 'Unmarried',
            country: 'United States',
            state: 'Pennsylvania',
            area: null,
            street: '3200 Chestnut St',
            phone: '2673669197',
            email: 'yuhangu.m@gmail.com',
            company: null,
            college: 'Upenn',
            selfIntro: 'qweqweqwe',
            imageSrc: '1234',
          },
        ],
      },
    );

    httpBackend.when('POST', '/postComment/Test@seas.upenn.edu/1571670583491', (postData) => {
      const jsonData = JSON.parse(postData);
      expect(jsonData.Comment).toBe('hi');
      return true;
    }).respond(200, true);

    httpBackend.when('POST', '/addFollowers/Test@seas.upenn.edu', {
      user: 'yuhangu.m@gmail.com',
      follower: 'yuhangu.m@gmail.com',
    }).respond(200, true);
    // const jsonData = JSON.parse(postData);
    // httpBackend.expectPOST("/addFollowers/yuhangu.m@gmail.com").respond(200, true);

    httpBackend.when('POST', '/editPostText/1571670583491', (postData) => {
      // const jsonData = JSON.parse(postData);
      // expect(jsonData.Comment).toBe('hi');
      return true;
    }).respond(200, true);
  }));
  // beforeEach(() => {
  //   fetch.resetMocks();
  // });


  describe('post', () => {
    it('post event', async () => {
      const $scope = $rootScope.$new();
      $controller('otherProfileController', { $scope });

      // $scope.email = 'Test@seas.upenn.edu';
      // $scope.pathName = '/profile';
      // Test Redirect URLs
      expect($scope.getUploadURL()).toBe('/profile/Test@seas.upenn.edu/upload');
      expect($scope.getUpdateInfoPage()).toBe('/updateProfile?Test@seas.upenn.edu');
      expect($scope.getProfilePage()).toBe('/profile?Test@seas.upenn.edu');
      expect($scope.getActiveFeed()).toBe('/getActiveFeed?Test@seas.upenn.edu');

      // httpBackend.flush();
      // await $scope.followFriends('yuhangu.m@gmail.com');
      // , () => {
      //   console.log('hihihihihihhihi');
      //   expect($scope.contactNumbers).toBe(1);
      // });
      httpBackend.flush();

      //
      // httpBackend.expectPOST("/addFollowers/yuhangu.m@gmail.com").respond(200, true);

      // Test outArray
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
      expect($scope.outArray[0].tag).toBe('food');
      expect($scope.outArray[0].tagFriends[0]).toBe('Mike');

      expect($scope.outArray[0].fullName).toBe('Test Test');
      expect($scope.outArray[0].profilePhoto).toBe('1234');
      expect($scope.outArray[0].display).toBe('inline-block');
      expect($scope.outArray[0].comment[0].display).toBe('none');
      expect($scope.outArray[0].comment[0].fullName).toBe('Robin');
      expect($scope.outArray[0].comment[0].imageSrc).toBe('1234567');
      expect($scope.outArray[0].comment[0].tags[0]).toBe('Mike');

      // Test profile infos
      expect($scope.userName).toBe('Test Test');
      expect($scope.DateOfBirth).toBe('2019-10-02');
      expect($scope.gender).toBe('Male');
      expect($scope.marrageStatus).toBe('Unmarried');
      expect($scope.Country).toBe('United States');
      expect($scope.state).toBe('Pennsylvania');
      expect($scope.area).toBe(null);
      expect($scope.street).toBe('3200 Chestnut St');
      expect($scope.phone).toBe('2673669197');
      expect($scope.company).toBe(null);
      expect($scope.college).toBe('Upenn');
      expect($scope.selfIntro).toBe('qweqweqwe');
      expect($scope.image).toBe('1234');
      expect($scope.followUsers[0].action).toBe('+Follow');
      expect($scope.followUsers[0].email).toBe('imageTest@gmail.com');
      expect($scope.followUsers[0].name).toBe('Test');
      expect($scope.followUsers[0].password).toBe('4321');
      expect($scope.contactNumbers).toBe(1);

      $scope.showPostByTags('food');
      for (let i = 0; i < $scope.outArray.length; i += 1) {
        expect($scope.outArray[i].tag).toBe('food');
      }

      httpBackend.flush();

      // Test Tag Friends
      expect($scope.tagFriends[0].email).toBe('yuhangu.m@gmail.com');
      expect($scope.tagFriends[0].name).toBe('Yuhan Gu');
      expect($scope.tagFriends[0].password).toBe('12345');
      expect($scope.tagFriends[0].phoneNumber).toBe('2676709145');
      expect($scope.tagFriends[0].followed[0]).toBe('test@seas.upenn.edu');
      expect($scope.tagFriends[0].fullName).toBe('Yuhan Gu');
      expect($scope.tagFriends[0].profilePhoto).toBe('1234');

      // Test Like/Post statistics
      expect($scope.totalLikes).toEqual(4);
      expect($scope.totalPosts).toEqual(3);
      expect($scope.totalFollowers).toEqual(1);

      // Test Followers
      expect($scope.followUsers[0].name).toBe('Test');
      expect($scope.followUsers[0].email).toBe('imageTest@gmail.com');
      expect($scope.followUsers[0].action).toBe('+Follow');

      // Test Search users
      $scope.searchUser(() => {
        expect($scope.followUsers[0]).toMatchObject({
          email: 'yuhangu.m@gmail.com',
          name: 'Yuhan Gu',
          password: '12345',
          phoneNumber: '2676709145',
          followed: ['test@seas.upenn.edu'],
        });
      });

      httpBackend.flush();

      httpBackend.expectPOST('/addFollowers/Test@seas.upenn.edu').respond(200, true);
      $scope.followFriends('yuhangu.m@gmail.com', () => {
        expect($scope.contactNumbers).toBe(1);
      });
      httpBackend.flush();

      $scope.showContacts(() => {
        expect($scope.contacts[0].email).toBe('yuhangu.m@gmail.com');
        expect($scope.contacts[0].name).toBe('Yuhan Gu');
        expect($scope.contacts[0].password).toBe('12345');
        expect($scope.contacts[0].phoneNumber).toBe('2676709145');
        expect($scope.contacts[0].followed[0]).toBe('test@seas.upenn.edu');
        expect($scope.contacts[0].fullName).toBe('Yuhan Gu');
        expect($scope.contacts[0].profilePhoto).toBe('1234');
      });

      httpBackend.expectPOST('/unfollowUsers/Test@seas.upenn.edu/yuhangu.m@gmail.com').respond(200, true);
      $scope.unfollowFriends('yuhangu.m@gmail.com', () => {
        expect($scope.contactNumbers).toBe(1);
      });
      httpBackend.flush();

      httpBackend.expectPOST('/likePost/Test@seas.upenn.edu/1571670583491').respond(200, true);
      $scope.addLikes('Test@seas.upenn.edu', '1571670583491', 0);
      expect($scope.outArray[0].likes).toBe(2);
      httpBackend.flush();

      // sinon.stub(location, 'assign');
      // sinon.stub(location, 'replace');
      // sinon.stub(location, 'search');

      httpBackend.expectPOST('/postComment/yuhangu.m@gmail.com/1571670583491').respond(200, true);
      $scope.addComment('yuhangu.m@gmail.com', '1571670583491');
      expect($scope.Comment).toBe('this is a comment');
      httpBackend.flush();


      await $scope.editPostText('1571670583491');
      expect(document.getElementById('21571670583491').innerHTML).toBe('');
      expect(document.getElementById('1571670583491').getElementsByTagName('input')[0]).not.toBe(null);

      httpBackend.expectPOST('/editPostText/1571670583491').respond(200, true);
      $scope.submitFunction('1571670583491');
      expect($scope.newPostText).toBe('Welcome');
      httpBackend.flush();

      httpBackend.expectPOST('/editComment/1571670583491').respond(200, true);
      $scope.submitFunctionNew('11571670583491', 1571670583491);
      expect($scope.newCommentText).toBe('testComments');
      httpBackend.flush();

      await $scope.editComment('11571670583491', '1571670583491');
      expect(document.getElementById('submitChanges11571670583491').innerHTML).toBe('Submit Changes');

      httpBackend.expectDELETE('/deletePost/1571670583492').respond(200, true);
      $scope.deletePost('1571670583492');

      httpBackend.expectPOST('/deletePicture/1571670583492').respond(200, true);
      $scope.deletePicture('1571670583492');

      document.getElementById(1571670583491).files = new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: 'text/html' });
      $scope.changeImgToURL(1571670583491);

      // httpBackend.flush();

      // expect($scope.newPostText).toBe('testtest');

      // $scope.submitFunction(1571670583492);
      // expect($scope.newPostText).toBe('hi');
      //
      //
      // $scope.submitFunctionNew('c2', 1571670583492);
      // expect($scope.newCommentText).toBe('new comment');
      // await $scope.followFriends('yuhangu.m@gmail.com');
      // httpBackend.flush();
      // const post = {
      //   userid: 'Test@seas.upenn.edu',
      //   text: 'good day',
      //   image: '1234',
      //   tag: 'food',
      //   comment: [{
      //     commentID: '1111',
      //     display: 'none',
      //     fullName: 'Robin',
      //     imageSrc: '1234567',
      //     user: 'robin@seas.upenn.edu',
      //     comment: 'comment1',
      //   }],
      //   disLikedBy: ['shuaiz@seas.upenn.edu'],
      //   dislikes: 1,
      //   display: 'inline-block',
      //   fullName: 'Test Test',
      //   likedBy: ['user_new@gmail.com', '123@gmail.com'],
      //   likes: 2,
      //   postid: '10/21/2019, 11:09:43 AM',
      //   postidOld: 1571670583491,
      //   profilePhoto: '1234',
      // };
      // expect($scope.outArray[0]).toStrictEqual(post);
    });
  });
});
