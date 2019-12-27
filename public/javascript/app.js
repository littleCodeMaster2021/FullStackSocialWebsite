/* global angular */
/* eslint-disable prefer-arrow-callback, no-restricted-syntax, prefer-destructuring */
/* eslint-disable no-unused-vars, func-names, no-alert */
/* eslint no-restricted-globals: ["error", "event"] */

const app = angular.module('CIS557', []);
const { localStorage } = window;
localStorage.clear();

app.controller('postController', function ($scope, $http, $window) {
  $scope.onExit = function () {
    $http.get('/session/destroy').then((res) => {
      window.location.href = '/index';
    });
  };
  // $window.onbeforeunload =  $scope.onExit;

  // Get user id from URL
  const url = window.location.search;
  // // console.log(url);
  $scope.email = url.substring(1).split('?')[0];
  // Set Some redirect functions
  $scope.getUploadURL = function () {
    return `/profile/${$scope.email}/upload`;
  };
  $scope.getUpdateInfoPage = function () {
    return `/updateProfile?${$scope.email}`;
  };
  $scope.getProfilePage = function () {
    return `/profile?${$scope.email}`;
  };
  $scope.getActiveFeed = function () {
    return `/getActiveFeed?${$scope.email}`;
  };

  $scope.visitUser = function (user, otheruser) {
    if (user === otheruser) {
      return `/profile?${user}`;
    }
    return `/otherprofilePost?${user}?${otheruser}`;
  };

  // Initial Load: Profile Info
  const requestProfile = $http.get(`/profile/${$scope.email}`);
  requestProfile.then((response) => {
    const data = response.data[0];
    $scope.userName = data.fullName;
    if (data.birth == null) {
      $scope.DateOfBirth = ' ';
    } else {
      $scope.DateOfBirth = data.birth.substring(0, 10);
    }
    $scope.gender = data.gender;
    $scope.marrageStatus = data.marriage;
    $scope.Country = data.country;
    $scope.state = data.state;
    $scope.area = data.area;
    $scope.street = data.street;
    $scope.phone = data.phone;
    $scope.company = data.company;
    $scope.college = data.college;
    $scope.selfIntro = data.selfIntro;
    $scope.image = data.imageSrc;

    // Inital Load: User's own posts
    if (window.location.pathname === '/profile') {
      const requestPosts = $http.get(`/profile/${$scope.email}/post`);
      requestPosts.then((response2) => {
        // console.log(response2);
        const arr = response2.data.post;
        const { commentinfo } = response2.data;
        // // console.log('commentinfo', commentinfo);
        for (const ele of arr) {
          ele.postidOld = ele.postid.toString();
          ele.postid1 = '1'.concat(ele.postidOld);
          ele.postid2 = '2'.concat(ele.postidOld);
          ele.postid3 = '3'.concat(ele.postidOld);
          ele.postid10 = '10'.concat(ele.postidOld);
          ele.postid20 = '20'.concat(ele.postidOld);
          // console.log(ele.likedBy);
          if (ele.likedBy.includes($scope.email)) {
            ele.checkLikes = 'You Liked';
          } else {
            ele.checkLikes = 'Like';
          }
          const d = new Date(ele.date);
          ele.date = d.toLocaleString();
          ele.fullName = $scope.userName;
          ele.profilePhoto = $scope.image;
          ele.display = 'inline-block';
          ele.likedByFullName = [];
          // ele.commentProfile = [];
          if (commentinfo.length > 0 && ele.comment !== undefined && ele.comment.length > 0) {
            // // console.log('heyhyehyey');
            for (let i = 0; i < ele.comment.length; i += 1) {
              if (ele.comment[i].user === $scope.email) {
                ele.comment[i].display = 'inline-block';
              } else {
                ele.comment[i].display = 'none';
              }
              for (const info of commentinfo) {
                if (ele.comment[i].user === info.email) {
                  ele.comment[i].fullName = info.fullName;
                  ele.comment[i].imageSrc = info.imageSrc;
                  break;
                }
              }
            }
          }
          if (ele.likedBy.length > 0) {
            for (const liker of ele.likedBy) {
              for (const cmter of commentinfo) {
                if (liker === cmter.email) {
                  ele.likedByFullName.push(cmter.fullName);
                  break;
                }
              }
            }
          }
        }

        // // console.log(arr);
        $scope.outArray = arr;
        // console.log($scope.outArray);
      });
    }
  });

  /* Follow new friends. */
  const reqUsers = $http({
    url: `/allUsers/${$scope.email}`,
    method: 'GET',
    data: {
      email: $scope.email,
    },
  });
  reqUsers.then((response) => {
    const { data } = response;
    for (let i = 0; i < data.length; i += 1) {
      // // console.log(data[i].email);
      data[i].action = '+Follow';
    }
    $scope.followUsers = data;
  });

  $scope.searchUser = async function () {
    // // console.log($scope.searchUsererName);
    const request = $http({
      url: `/specificUsers/${$scope.searchUserName}`,
      method: 'GET',
    });
    request.then((response) => {
      $scope.followUsers = response.data;
      // console.log(response.data);
    });
  };

  $scope.followFriends = async function (email) {
    const request = $http({
      url: `/addFollowers/${$scope.email}`,
      method: 'POST',
      data: {
        user: email,
        follower: $scope.email,
      },
    });
    // console.log(request);
    request.then((res) => {
      // console.log(`Followed successfully!${res}`);
      for (let i = 0; i < $scope.followUsers.length; i += 1) {
        if ($scope.followUsers[i].email === email) {
          // $scope.followUsers[i]
          // console.log('T');
          $scope.followUsers.splice(i, 1);
          const getContactRequest = $http.get(`/getCurrentContacts/${$scope.email}`);
          getContactRequest.then((res1) => {
            // // console.log(res.data[0].followed);
            const data = res1.data[0].followed.length;
            // // console.log(`Current contacts number is: ${data}`);
            $scope.contactNumbers = data;
          });
        }
      }
    });
  };

  /* Get current contact people's number. */
  const getContactRequest = $http.get(`/getCurrentContacts/${$scope.email}`);
  getContactRequest.then((res) => {
    // // console.log(res.data[0].followed);
    const data = res.data[0].followed.length;
    // // console.log(`Current contacts number is: ${data}`);
    $scope.contactNumbers = data;
  });

  $scope.showContacts = function () {
    const req = $http.get(`/showCurrentContacts/${$scope.email}`);
    req.then((res) => {
      const user = res.data.user;
      // console.log(user);
      const profile = res.data.profile;
      for (const ele of user) {
        for (const prof of profile) {
          if (ele.email === prof.email) {
            ele.fullName = prof.fullName;
            ele.profilePhoto = prof.imageSrc;
            break;
          }
        }
      }
      $scope.contacts = user;
    });
  };

  $scope.unfollowFriends = async function (email) {
    // // console.log('test test');
    const req = $http.post(`/unfollowUsers/${$scope.email}/${email}`);
    req.then((res) => {
      // // console.log(`test unfollow logics: ${res}`);
      for (let i = 0; i < $scope.contacts.length; i += 1) {
        // // console.log(`data  ${$scope.contacts[i]}`);
        if ($scope.contacts[i].email === email) {
          $scope.contacts.splice(i, 1);
        }
      }
    });
  };

  const req3 = $http.get(`/totalLikes/${$scope.email}`);
  req3.then(
    (res) => {
      const arr = res.data;
      // // console.log('get total likes',arr);
      if (arr.length > 0) {
        $scope.totalLikes = arr[0].totalLikes;
      }
    },
  );

  const req4 = $http.get(`/totalPost/${$scope.email}`);
  req4.then(
    (res) => {
      const arr = res.data;
      if (arr.length > 0) {
        $scope.totalPosts = arr[0].totalPostCount;
      }
    },
  );

  const req5 = $http.get(`/totalFollower/${$scope.email}`);
  req5.then(
    (res) => {
      const arr = res.data;
      $scope.totalFollowers = arr.length;
    },
  );

  $scope.addLikes = async function (user, postid, index) {
    // // console.log('test add likes');
    // console.log(postid);
    const req1 = $http.post(`/likePost/${user}/${postid}`);
    req1.then(() => {
      // console.log(index);

      if ($scope.outArray[index].likes === undefined) {
        $scope.outArray[index].likes = 0;
      }
      if ($scope.outArray[index].likedBy === undefined) {
        $scope.outArray[index].likedBy = [];
      }
      if (!$scope.outArray[index].likedBy.includes(user)) {
        // console.log('hihihihihi');
        $scope.outArray[index].likes += 1;
        // console.log($scope.outArray[index].likes);
        if ($scope.outArray[index].userid === $scope.email) {
          $scope.totalLikes += 1;
        }
        $scope.outArray[index].likedBy.push(user);
        $scope.outArray[index].likedByFullName.push($scope.userName);
        document.getElementById('20'.concat(postid)).getElementsByTagName('strong')[0].innerHTML = 'You Liked';
        document.getElementById('20'.concat(postid)).getElementsByTagName('span')[0].className = 'glyphicon glyphicon-thumbs-up';
      } else if ($scope.outArray[index].likedBy.includes(user)) {
        $scope.outArray[index].likes -= 1;
        $scope.outArray[index].likedByFullName
          .splice($scope.outArray[index].likedByFullName.indexOf($scope.userName), 1);
        if ($scope.outArray[index].userid === $scope.email) {
          $scope.totalLikes -= 1;
        }
        for (let i = 0; i < $scope.outArray[index].likedBy.length; i += 1) {
          if ($scope.outArray[index].likedBy[i] === user) {
            $scope.outArray[index].likedBy.splice(i, 1);
          }
        }
        document.getElementById('20'.concat(postid)).getElementsByTagName('strong')[0].innerHTML = 'Like';
        document.getElementById('20'.concat(postid)).getElementsByTagName('span')[0].className = 'glyphicon glyphicon-thumbs-up';
      }
    });
  };

  // $scope.addDisLikes = async function (user, postid) {
  //   // // console.log('test add disLikes');
  //   // "/likePost/:user/:postid"
  //   // // console.log('user', user);
  //   const req1 = $http.post(`/dislikePost/${user}/${postid}`);
  //   req1.then(() => {
  //     for (let i = 0; i < $scope.outArray.length; i += 1) {
  //       if ($scope.outArray[i].postidOld === postid) {
  //         if ($scope.outArray[i].likes === undefined) {
  //           $scope.outArray[i].likes = 0;
  //         }
  //         if ($scope.outArray[i].dislikes === undefined) {
  //           $scope.outArray[i].dislikes = 0;
  //         }
  //         // if ($scope.outArray[i].userid === user) {
  //         $scope.outArray[i].dislikes = 1;
  //         $scope.outArray[i].likes = 0;
  //         break;
  //         // } else {
  //         //   $scope.outArray[i].dislikes += 1;
  //         //   if ($scope.outArray[i].likes >= 1) {
  //         //     $scope.outArray[i].likes -= 1;
  //         //   }
  //         // }
  //       }
  //     }
  //   });
  //   if ($scope.totalLikes >= 1) { $scope.totalLikes -= 1; }
  //   document.getElementById(postid + 20).getElementsByTagName('strong')[0].innerHTML = 'Like';
  // };

  // $scope.addDisLikes = async function (user, postid) {
  //   // // console.log('test add disLikes');
  //   // "/likePost/:user/:postid"
  //   // // console.log('user', user);
  //   const req1 = $http.post(`/dislikePost/${user}/${postid}`);
  //   req1.then(() => {
  //     for (let i = 0; i < $scope.outArray.length; i += 1) {
  //       if ($scope.outArray[i].postidOld === postid) {
  //         if ($scope.outArray[i].likes === undefined) {
  //           $scope.outArray[i].likes = 0;
  //         }
  //         if ($scope.outArray[i].dislikes === undefined) {
  //           $scope.outArray[i].dislikes = 0;
  //         }
  //         // if ($scope.outArray[i].userid === user) {
  //         $scope.outArray[i].dislikes = 1;
  //         $scope.outArray[i].likes = 0;
  //         break;
  //         // } else {
  //         //   $scope.outArray[i].dislikes += 1;
  //         //   if ($scope.outArray[i].likes >= 1) {
  //         //     $scope.outArray[i].likes -= 1;
  //         //   }
  //         // }
  //       }
  //     }
  //   });
  //   if ($scope.totalLikes >= 1) { $scope.totalLikes -= 1; }
  //   document.getElementById(postid + 20).getElementsByTagName('strong')[0].innerHTML = 'Like';
  // };

  $scope.addComment = async function (user, postid) {
    // console.log("test add comments");
    $scope.Comment = document.getElementById('1'.concat(postid)).getElementsByTagName('input')[0].value;
    // console.log($scope.Comment);
    const request1 = $http({
      url: `/postComment/${user}/${postid}`,
      method: 'POST',
      data: {
        // "userName": $scope.userName,
        Comment: $scope.Comment,
        tags: $scope.showtagCmt,
      },
    });
    request1.then(() => {
      // console.log('kkkkkk');[]
      location.reload();
    });
  };

  $scope.editPostText = async function (postid) {
    // // console.log(text);
    const objTo = document.getElementById(postid);
    const div0 = document.createElement('div');
    div0.setAttribute('class', 'col-xs-4');

    const text = document.getElementById('2'.concat(postid));
    const oldText = text.innerHTML;
    text.innerHTML = '';

    const input = document.createElement('input');
    input.setAttribute('id', `editPostText${postid}`);
    input.setAttribute('class', 'form-control');
    input.setAttribute('type', 'text');
    input.setAttribute('value', oldText);

    div0.appendChild(input);
    const submit = document.createElement('button');
    submit.setAttribute('id', `submitChanges${postid}`);
    submit.setAttribute('class', 'btn btn-default btn-xs');
    submit.innerHTML = 'Submit Changes';
    objTo.prepend(div0);
    objTo.prepend(submit);
    // console.log('66666');
    submit.onclick = function () { $scope.submitFunction(postid); };
  };

  $scope.submitFunction = function clickFunction(postid) {
    const newText = document.getElementById(postid).getElementsByTagName('input')[0].value;
    $scope.newPostText = newText;
    // console.log('hihihihihihi');

    const request1 = $http({
      url: `/editPostText/${postid}`,
      method: 'POST',
      data: {
        newPostText: $scope.newPostText,
      },
    });
    request1.then(() => {
      location.reload();
    });
  };

  $scope.editComment = async function (commentID, postid) {
    const objTo = document.getElementById(commentID);
    const oldText = objTo.innerHTML.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    objTo.innerHTML = '';
    const div0 = document.createElement('div');
    div0.setAttribute('class', 'col-xs-4');
    div0.setAttribute('id', `div00${commentID}`);

    const input = document.createElement('input');
    input.setAttribute('id', `editPostText${commentID}`);
    input.setAttribute('class', 'form-control');
    input.setAttribute('type', 'text');
    input.setAttribute('value', oldText);

    div0.appendChild(input);
    const submit = document.createElement('button');
    submit.setAttribute('id', `submitChanges${commentID}`);
    submit.setAttribute('class', 'btn btn-default btn-xs');
    submit.innerHTML = 'Submit Changes';
    objTo.prepend(div0);
    objTo.prepend(submit);
    submit.onclick = function () {
      $scope.submitFunctionNew(commentID, postid);
    };
  };

  $scope.submitFunctionNew = function (commentID, postid) {
    const objTo = document.getElementById(commentID);
    const newText = document.getElementById(`editPostText${commentID}`).value;
    // // console.log(newText);
    $scope.newCommentText = newText;
    objTo.innerHTML = newText;
    const request1 = $http({
      url: `/editComment/${postid}`,
      method: 'POST',
      data: {
        newCommentText: $scope.newCommentText,
        commentID,
      },
    });
    request1.then(() => {
      // console.log('success in comment changes');
    });
  };

  $scope.deletePost = async function (postid) {
    document.getElementById('10'.concat(postid)).remove();
    const request1 = $http.delete(`/deletePost/${postid}`);
    request1.then(() => {
    });
    location.reload();
  };

  // deletePicture(x.postidOld)

  $scope.deletePicture = async function (postid) {
    document.getElementById('3'.concat(postid)).remove();
    // /deletePost/:postid
    const request1 = $http.post(`/deletePicture/${postid}`);
    request1.then(() => {
    });
    location.reload();
  };

  $scope.changeImgToURL = function (postid) {
    const filesSelected = document.getElementById(postid).files;
    if (filesSelected.length > 0) {
      const fileToLoad = filesSelected[0];
      const fileReader = new FileReader();
      fileReader.onload = function (fileLoadedEvent) {
        $scope.imageSrcNew = fileLoadedEvent.target.result;
        // console.log('1', $scope.imageSrcNew);
        if ($scope.imageSrcNew !== undefined) {
          const newpostid = postid.slice(1);
          document.getElementById('3'.concat(newpostid)).src = $scope.imageSrcNew;
          $scope.imageSrcNew = $scope.imageSrcNew.split(',')[1];
          // // console.log($scope.imageSrcNew);
          const corrPostID = newpostid;
          const request1 = $http({
            url: `/editImage/${corrPostID}`,
            method: 'POST',
            data: {
              imageSrcNew: $scope.imageSrcNew,
            },
          });
          request1.then(() => {
            // console.log('success in changing');
          },
          (err) => {
            throw new Error(`reject sending image data: ${err}`);
          });
        }
      };
      fileReader.readAsDataURL(fileToLoad);
    }
  };

  $scope.changePicture = async function (postid) {
    const imgRoot = document.getElementById(postid);
    const input = document.createElement('input');
    input.setAttribute('id', '6'.concat(postid));
    input.setAttribute('type', 'file');
    input.setAttribute('class', 'text-center center-block file-upload');
    input.setAttribute('onchange', 'angular.element(this).scope().changeImgToURL(this.id)');
    imgRoot.appendChild(input);
  };

  $scope.deleteComment = async function (commentID, postid) {
    const request1 = $http({
      url: `/deleteComment/${postid}`,
      method: 'POST',
      data: {
        commentID,
      },
    });
    request1.then(() => {
      location.reload();
    });
  };


  /**
   * Tag the photos
   */
  $scope.showPostByTags = function (tag) {
    const getPostByTags = $http.get(`/getPostByTags/${tag}`);
    getPostByTags.then(
      (response) => {
        // // console.log(response);
        const post = response.data.post;
        const userinfo = response.data.userinfo;
        for (const ele of post) {
          ele.postidOld = ele.postid;
          const d = new Date(ele.date);
          ele.date = d.toLocaleString();

          if (ele.userid === $scope.email) {
            ele.display = 'inline-block';
          } else {
            ele.display = 'none';
          }

          for (const usr of userinfo) {
            if (ele.userid === usr.email) {
              ele.profilePhoto = usr.imageSrc;
              ele.fullName = usr.fullName;
              break;
            }
          }

          if (userinfo.length > 0 && ele.comment !== undefined && ele.comment.length > 0) {
            for (let i = 0; i < ele.comment.length; i += 1) {
              // console.log('hihihiiihihihihi');
              if (ele.comment[i].user === $scope.email) {
                ele.comment[i].display = 'inline-block';
              } else {
                ele.comment[i].display = 'none';
              }
              for (const info of userinfo) {
                if (ele.comment[i].user === info.email) {
                  ele.comment[i].fullName = info.fullName;
                  ele.comment[i].imageSrc = info.imageSrc;
                  break;
                }
              }
            }
          }
        }
        $scope.outArray = post.reverse();
        // console.log($scope.outArray);
      },
      (error) => {
        // console.log(`response fail: ${error}`);
      },
    );
  };

  const req = $http.get(`/showCurrentContacts/${$scope.email}`);
  req.then((res) => {
    const user = res.data.user;
    // console.log(user);
    const profile = res.data.profile;
    for (const ele of user) {
      for (const prof of profile) {
        if (ele.email === prof.email) {
          ele.fullName = prof.fullName;
          ele.profilePhoto = prof.imageSrc;
          break;
        }
      }
    }
    $scope.tagFriends = user;
  });

  $scope.showtag = [];
  $scope.showTagFriend = function (email, fullName) {
    if (!$scope.showtag.includes({ email, fullName })) {
      $scope.showtag.push({ email, fullName });
    }
    // console.log(showtag);
  };

  $scope.showtagCmt = [];
  $scope.showTagFriendCmt = function (email, fullName) {
    if (!$scope.showtagCmt.includes({ email, fullName })) {
      $scope.showtagCmt.push({ email, fullName });
    }
  };

  /**
   * Sign out logic:
   * Clear all the cookies as well as the session.
   * */
  $scope.signOut = function () {
    const request = $http({
      url: '/signOut',
      method: 'GET',
      params: {
        user: $scope.email,
      },
    });
    request.then((res) => {
      if (res.status === 200) {
        window.location.href = '/index';
      }
    });
  };

  $scope.curPage = 1;
  $scope.itemsPerPage = 3;
  $scope.maxSize = 5;
});


app.controller('registerController', function ($scope, $http) {
  $scope.passwordStrength = {
    width: '40px',
    height: '20px',
    'margin-left': '5px',
    flex: 1,
  };

  const strongRegex = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#%&])(?=.{8,})');
  const mediumRegex = new RegExp('^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})');

  $scope.analyze = function (value) {
    if (strongRegex.test(value)) {
      $scope.passwordStrength['background-color'] = 'green';
    } else if (mediumRegex.test(value)) {
      $scope.passwordStrength['background-color'] = 'orange';
    } else {
      $scope.passwordStrength['background-color'] = 'red';
    }
  };

  $scope.register = async function () {
    // console.log(`Test ${$scope.email}`);
    const request = $http({
      url: '/register',
      method: 'POST',
      data: {
        name: $scope.name,
        email: $scope.email,
        pass: $scope.password,
        rePass: $scope.rePass,
        agreeTerm: $scope.agree,
        imageSrc: 'http://ssl.gstatic.com/accounts/ui/avatar_2x.png',
      },
    });
    await request.then(
      (response) => {
        // console.log(response);
        if (response.status === 200) {
          window.location.assign('/signIn');
          // console.log(response);
        } else {
          // console.log(`${response.status}: ${response.data}`);
          window.alert(response.data);
          window.location.assign('/register');
        }
      }, (error) => {
        window.alert(error.data);
        window.location.assign('/register');
      },
    );
  };
  // $http.location.href = "/signIn";
});

app.controller('updateUserInformation', function ($scope, $http) {
  $scope.onExit = function () {
    $http.get('/session/destroy').then((res) => {
      window.location.href = '/index';
    });
  };
  // $window.onbeforeunload =  $scope.onExit;
  // $scope.imageSrc = ""

  /* GET method resolved */
  const url = window.location.search;
  const email = url.substring(1).split('?')[0];
  // console.log(email);
  const getRequest = $http.get(`/updateProfile/${email}`);
  getRequest.then((response) => {
    const data = response.data[0];
    // console.log(data);
    $scope.userName = data.fullName;
    $scope.DateOfBirth = new Date(data.birth);
    $scope.date = data.birth;
    $scope.gender = data.gender;
    $scope.marrageStatus = data.marriage;
    $scope.Country = data.country;
    $scope.state = data.state;
    $scope.area = data.area;
    $scope.street = data.street;
    $scope.phone = data.phone;
    $scope.email = data.email;
    $scope.company = data.company;
    $scope.college = data.college;
    $scope.selfIntro = data.selfIntro;
    $scope.image = data.imageSrc;
    $scope.imageSrc_old = data.imageSrc;
  },
  (error) => {
    // console.log(`response fail: ${error}`);
  });


  /* Set up jump url */
  $scope.getUpdateInfoPage = function () {
    // console.log(`test: /updateProfile/${email}`);
    return `/updateProfile?${$scope.email}`;
  };

  $scope.getProfilePage = function () {
    return `/profile?${$scope.email}`;
  };

  $scope.getActiveFeed = function () {
    return `/getActiveFeed?${$scope.email}`;
  };

  $scope.convertImageAsURL = function () {
    const filesSelected = document.getElementById('inputFileToLoad').files;
    if (filesSelected.length > 0) {
      const fileToLoad = filesSelected[0];
      const fileReader = new FileReader();
      fileReader.onload = function (fileLoadedEvent) {
        $scope.imageSrc = fileLoadedEvent.target.result;
        // // console.log($scope.imageSrc);
        document.getElementById('userImage').src = $scope.imageSrc;
      };
      fileReader.readAsDataURL(fileToLoad);
    }
  };

  /* POST method resolved */
  $scope.submitSavedValues = function () {
    // // console.log($scope.imageSrc);
    if ($scope.imageSrc == null) {
      $scope.imageSrc = $scope.imageSrc_old;
    }
    const request = $http({
      url: `/updateProfile/${email}`,
      method: 'POST',
      data: {
        userName: $scope.userName,
        DateOfBirth: $scope.DateOfBirth,
        Gender: $scope.gender,
        marriageStatus: $scope.marrageStatus,
        selectedCountry: $scope.Country,
        state: $scope.state,
        area: $scope.area,
        street: $scope.street,
        phone: $scope.phone,
        email: $scope.email,
        company: $scope.company,
        college: $scope.college,
        selfIntro: $scope.selfIntro,
        imageSrc: $scope.imageSrc,
      },
    });
    request.then(
      (response) => {
        window.location.assign(`/profile?${email}`);
        // // console.log($scope.imageSrc);
        // console.log(`Success! ${response}`);
      },
      (error) => {
        // console.log(`Fail! ${error}`);
      },
    );
  };

  $scope.signOut = function () {
    const request = $http({
      url: '/signOut',
      method: 'GET',
      params: {
        user: $scope.email,
      },
    });
    request.then((res) => {
      if (res.status === 200) {
        window.location.href = '/index';
      }
    });
  };
});

app.controller('feedController', ['$scope', '$http', '$controller', function ($scope, $http, $controller) {
  $scope.onExit = function () {
    $http.get('/session/destroy').then((res) => {
      window.location.href = '/index';
    });
  };
  // $window.onbeforeunload =  $scope.onExit;
  // Initialize the super class and extend it.
  angular.extend(this, $controller('postController', { $http, $scope }));
  const requestPosts = $http.get(`/getActiveFeed/${$scope.email}`);
  requestPosts.then((response) => {
    const { post } = response.data;
    const { userinfo } = response.data;
    const { commentinfo } = response.data;

    for (const ele of post) {
      ele.postidOld = ele.postid;
      ele.postid1 = '1'.concat(ele.postidOld);
      ele.postid2 = '2'.concat(ele.postidOld);
      ele.postid3 = '3'.concat(ele.postidOld);
      ele.postid10 = '10'.concat(ele.postidOld);
      ele.postid20 = '20'.concat(ele.postidOld);
      const d = new Date(ele.date);
      ele.date = d.toLocaleString();
      ele.likedByFullName = [];

      if (ele.likedBy.includes($scope.email)) {
        ele.checkLikes = 'You Liked';
      } else {
        ele.checkLikes = 'Like';
      }

      if (ele.userid === $scope.email) {
        ele.display = 'inline-block';
      } else {
        ele.display = 'none';
      }

      if (ele.likedBy.length > 0) {
        for (const liker of ele.likedBy) {
          for (const cmter of commentinfo) {
            if (liker === cmter.email) {
              ele.likedByFullName.push(cmter.fullName);
              break;
            }
          }
        }
      }

      for (const usr of userinfo) {
        if (ele.userid === usr.email) {
          ele.profilePhoto = usr.imageSrc;
          ele.fullName = usr.fullName;
          break;
        }
      }

      if (commentinfo.length > 0 && ele.comment !== undefined && ele.comment.length > 0) {
        for (let i = 0; i < ele.comment.length; i += 1) {
          if (ele.comment[i].user === $scope.email) {
            ele.comment[i].display = 'inline-block';
          } else {
            ele.comment[i].display = 'none';
          }
          for (const info of commentinfo) {
            if (ele.comment[i].user === info.email) {
              ele.comment[i].fullName = info.fullName;
              ele.comment[i].imageSrc = info.imageSrc;
              break;
            }
          }
        }
      }
    }
    $scope.outArray = post;
  },
  (error) => {
    // console.log(`response fail: ${error}`);
  });
}]);

app.controller('signInController', function ($scope, $http) {
  $scope.signIn = function () {
    const { userName } = $scope;
    const { password } = $scope;

    if (localStorage.getItem(userName) !== null && localStorage.getItem(userName) > 10) {
      const storeTime = parseInt(localStorage.getItem(userName), 10);
      const now = new Date();
      const curTime = 3600 * now.getHours() + 60 * now.getMinutes() + now.getSeconds();
      // console.log(storeTime + "  " + curTime);
      if (curTime > storeTime) {
        localStorage.removeItem(userName);
      } else {
        window.alert('Your account has been locked.');
        window.location.assign('/signIn');
      }
    }

    const request = $http({
      url: '/signIn',
      method: 'POST',
      data: {
        userName,
        password,
      },
    });
    request.then(
      (response) => {
        window.location.assign(`/profile?${userName}`);
        // console.log(response.data);
        // window.location.assign(`/profile?${userName}`);
        // var url = 'profile?' + userName;
        // var req = new XMLHttpRequest();
        // req.open('GET', url, false);
        // req.setRequestHeader('authorization', response.data);
        // // console.log(url + "  " + req.header());
        // req.send();
      },
      (error) => {
        // console.log(`login fail: ${error}`);
        /* Logout according to the given policies:
          * 1. If the user tried logging in for 5 times, the account would be locked.
          * 2. The locked time would be 30 minutes. */
        if (error.status === 422) {
          window.alert(error.data);
          window.location.href = 'signIn';
        } else if (error.status === 409) {
          window.alert(error.data);
          window.location.href = 'signIn';
        } else {
          if (localStorage.getItem(userName) === null) {
            localStorage.setItem(userName, '1');
          } else if (parseInt(localStorage.getItem(userName), 10) < 5) {
            const current = parseInt(localStorage.getItem(userName), 10);
            localStorage.setItem(userName, current + 1);
            // window.location.href = '/signIn';
          }
          // else if (parseInt(localStorage.getItem(userName), 10) === 5) {
          //   const time = new Date();
          //   const timeStamp = 60 * 60 * time.getHours()
          //   + 60 * (time.getMinutes() + 30) + time.getSeconds();
          //   localStorage.setItem(userName, timeStamp);
          // }
          if (localStorage.getItem(userName) < 5) {
            window.alert(`Invalid password! Please try again! You have tried ${localStorage.getItem(userName)} times!`);
          } else {
            window.alert('Your account has been locked!');
            const url = `/signIn/${userName}/lock`;
            $http.get(url).then((res) => {
              window.location.href = '/signIn';
            });
          }
        }
      },
    );
  };
});

app.controller('otherProfileController', ['$scope', '$http', '$controller', function ($scope, $http, $controller) {
  $scope.onExit = function () {
    $http.get('/session/destroy').then((res) => {
      window.location.href = '/index';
    });
  };
  // Initialize the super class and extend it.
  angular.extend(this, $controller('postController', { $http, $scope }));
  const url = location.search;
  $scope.email = url.substring(1).split('?')[0];
  $scope.otheruser = url.substring(1).split('?')[1];
  const requestPosts = $http.get(`/otherprofilePost/${$scope.email}/${$scope.otheruser}`);
  requestPosts.then((response) => {
    // console.log(response);
    const { post } = response.data;
    const { commentinfo } = response.data;
    // console.log(commentinfo);
    for (const user of commentinfo) {
      if (user.email === $scope.otheruser) {
        const data = user;
        $scope.userName_other = data.fullName;
        if (data.birth == null) {
          $scope.DateOfBirth_other = ' ';
        } else {
          $scope.DateOfBirth_other = data.birth.substring(0, 10);
        }
        $scope.gender_other = data.gender;
        $scope.marrageStatus_other = data.marriage;
        $scope.Country_other = data.country;
        $scope.state_other = data.state;
        $scope.area_other = data.area;
        $scope.street_other = data.street;
        $scope.phone_other = data.phone;
        $scope.company_other = data.company;
        $scope.college_other = data.college;
        $scope.selfIntro_other = data.selfIntro;
        $scope.image_other = data.imageSrc;
        break;
      }
    }

    for (const ele of post) {
      ele.postidOld = ele.postid;
      ele.postid1 = '1'.concat(ele.postidOld);
      ele.postid2 = '2'.concat(ele.postidOld);
      ele.postid3 = '3'.concat(ele.postidOld);
      ele.postid10 = '10'.concat(ele.postidOld);
      ele.postid20 = '20'.concat(ele.postidOld);
      const d = new Date(ele.date);
      ele.date = d.toLocaleString();
      ele.likedByFullName = [];

      if (ele.likedBy.includes($scope.email)) {
        ele.checkLikes = 'You Liked';
      } else {
        ele.checkLikes = 'Like';
      }

      if (ele.userid === $scope.email) {
        ele.display = 'inline-block';
      } else {
        ele.display = 'none';
      }

      for (const usr of commentinfo) {
        if (ele.userid === usr.email) {
          ele.profilePhoto = usr.imageSrc;
          ele.fullName = usr.fullName;
          break;
        }
      }

      if (ele.likedBy.length > 0) {
        for (const liker of ele.likedBy) {
          for (const cmter of commentinfo) {
            if (liker === cmter.email) {
              ele.likedByFullName.push(cmter.fullName);
              break;
            }
          }
        }
      }

      if (commentinfo.length > 0 && ele.comment !== undefined && ele.comment.length > 0) {
        for (let i = 0; i < ele.comment.length; i += 1) {
          if (ele.comment[i].user === $scope.email) {
            ele.comment[i].display = 'inline-block';
          } else {
            ele.comment[i].display = 'none';
          }
          for (const info of commentinfo) {
            if (ele.comment[i].user === info.email) {
              ele.comment[i].fullName = info.fullName;
              ele.comment[i].imageSrc = info.imageSrc;
              break;
            }
          }
        }
      }
    }
    $scope.outArray = post;
  },
  (error) => {
    // console.log(`response fail: ${error}`);
  });

  // const getContactRequest = $http.get(`/getCurrentContacts/${$scope.email}`);
  // getContactRequest.then((res1) => {
  //   // // console.log(res.data[0].followed);
  //   const data = res1.data[0].followed;
  //   if (data.includes($scope.otheruser)) {
  //     $scope.showFollow = 'UnFollow';
  //     $scope.followOrUnfollowFriends = function() {}
  //   } else {
  //     $scope.showFollow = 'Follow';
  //   }
  //   $scope.followOrUnfollowFriends = function() {}
  // });
  // console.log($scope.email);
  // for (contact in $scope.contacts) {
  //   if (contact.email === $scope.otheruser) {
  //     $scope.showFollow = 'UnFollow';
  //     break
  //   }
  // }
  // $scope.addOtherFriends = function (user, friend) {
  //
  // };
  // console.log($scope.contacts);
}]);
