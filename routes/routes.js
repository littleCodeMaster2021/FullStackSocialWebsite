/* eslint-disable no-unused-vars, no-useless-escape */

const express = require('express');

const router = express();
const path = require('path');
const bodyParser = require('body-parser');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

const fileupload = require('express-fileupload');

router.use(fileupload());

const mongodb = require('mongodb');

const { MongoClient } = mongodb;
const uri = 'mongodb+srv://YuhanGu:cis557project@cis557-pf173.mongodb.net/test?retryWrites=true&w=majority';
// const MongoClient = new mongodb(process.env.MONGODB_URI || "mongodb://localhost:27017/photoShare", {useUnifiedTopology: true,
//       useNewUrlParser: true}, { useNewUrlParser: true });

const cookieParser = require('cookie-parser');

router.use(cookieParser());

const jwt = require('jsonwebtoken');
const WebSocket = require('ws');
const cors = require('cors');

/* GET home page. */
router.get('/index', (req, res) => {
  if (req.session !== undefined && req.session.user !== undefined) {
    req.session.cookie.expires = false;
    res.redirect(`/profile?${req.session.user}`);
  } else {
    res.sendFile(path.join(__dirname, '../', 'views', 'homepage.html'));
  }
});

router.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'views', 'registration.html'));
});


const checkToken = (req, res, next) => {
  const header = req.cookies.Authorization;
  // //console.log(header);

  if (typeof header !== 'undefined') {
    // const bearer = header.split(' ');
    // const token = bearer[1];
    //
    // //console.log(token === header);
    req.token = header.token;
    req.loginUser = header.username;
    next();
  } else if (typeof header === 'undefined') {
    // If header is undefined return Forbidden (403)
    res.sendStatus(403);
  }
};


// function getDuplicateEmail(email) {
//     return new Promise(function (resolve, reject) {
//         MongoClient.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/photoShare", {useUnifiedTopology: true,
//       useNewUrlParser: true},(err,db) => {
//             if(err){
//                 reject(err);
//             }else {
//                 resolve(db);
//             }
//         })
//     }).then(function (db) {
//         return new Promise(function (resolve, reject) {
//             db.db('photoShare').collection('userInfo').
// find({"email": email}).
//                 toArray((err, items) => {
//                     if (err) {
//                         reject(err);
//                     } else if (items.length > 0)
//                         // //console.log(emailArray);
//                         // return emailArray;
//                             {resolve(false);}
//                         else {resolve(true);}
//                 })
//         })
//     })
// }
/* eslint-disable callback-return */
/* eslint-disable require-jsdoc */
/* eslint-disable func-style */
/* eslint-disable consistent-return */
/* eslint-disable no-process-env */
/* eslint-disable no-use-before-define */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-shadow */
/* eslint-disable no-undef */

async function validEmail(email) {
  const client = await MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoShare', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });
  if (!client) { return; }

  try {
    const db = client.db('photoShare');
    const collection = db.collection('userInfo');
    const query = { email };
    const res = await collection.find(query).toArray();
    return res;
  } catch (e) {
    // //console.log(e);
  } finally {
    client.close();
  }
}

router.post('/register', async (req, res) => {
  /* Firstly, check the checkbox for privacy term. */
  if (req.body.agreeTerm !== true) {
    // alert('Please consent to the privacy term firstly!');
    // res.end(
    //   '<script type="text/javascript">\n'
    //         + 'alert("please consent to the privacy term firstly!");\n'
    //         + 'window.location.href = "/register"; \n'
    //         + '</script>',
    // );
    res.status(403).json('Please consent to the privacy term firstly!');
    return;
  }

  // console.log(req.body);
  /* GET information from the submitted form. */
  const { name } = req.body;
  const { email } = req.body;
  const password = req.body.pass;
  const { rePass } = req.body;
  // //console.log(`${name}  ${email}  ${password}`);

  if (name == null || email === null || password === null || rePass === null) {
    res.status(422).json('Please input all the information.');
    return;
  }

  if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
    res.status(409).json('Please input the email of correct format');
    return;
  }
  /**
     * Since we only allow 1 unique email to finish registration,
     * here we need to use do the validation operation firstly
     */
  const isValid = await validEmail(email);
  // console.log(isValid);
  if (isValid.length > 0) {
    // res.end(
    //   '<script type="text/javascript">\n'
    //         + 'alert("This email has registered yet, please sign in directly!");\n'
    //         + 'window.location.href = "/signIn"; \n'
    //         + '</script>',
    // );
    res.status(409).json('This email has already registered, please check!');
    /* Directly exit the current function. */
    return;
  }

  if (password !== rePass) {
    // res.end(
    //   '<script type="text/javascript">\n'
    //         + 'alert("please ensure the two passwords are the same!");\n'
    //         + 'window.location.href = "/register"; \n'
    //         + '</script>',
    // );
    res.status(401).json('Unauthorized user with wrong password!');
    return;
  }

  const data = {
    email,
    name,
    password,
    followed: [],
  };
  MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoShare', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  }, (err, db) => {
    if (err) {
      // //console.log('Unable to connect db');
      res.status(400).json({ error: err.message });
    } else {
      // //console.log('connection established');
      db.db('photoShare').collection('userInfo')
        . insertOne(data, (err, collection) => {
          if (err) {
            res.status(400).json({ error: err.message });
          } else {
            db.close();
          }
        });
    }
  });
  const imgData = {
    email,
    imageSrc: req.body.imageSrc,
    fullName: name,
  };
  MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoShare', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  }, (err, db) => {
    if (err) {
      // console.log('Unable to connect db');
      res.status(400).json({ error: err.message });
    } else {
      // console.log('connection established');
      db.db('photoShare').collection('userFile')
        . insertOne(imgData, (err, collection) => {
          if (err) { throw err; } else {
            // console.log('Record inserted Successfully');
          }
          db.close();
        });
    }
  });
  res.status(200).json('Succeed!');
});

async function validPassword(email, password) {
  const client = await MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoShare', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });
  if (!client) { return; }

  try {
    const db = client.db('photoShare');
    const collection = db.collection('userInfo');
    const query = { email };
    const res = await collection.find(query).toArray();
    return res;
  } catch (e) {
    // console.log(e);
  } finally {
    client.close();
  }
}

router.post('/signIn', async (req, res) => {
  const { userName } = req.body;
  const { password } = req.body;

  let isEmail = false;
  if (userName.includes('@')) {
    isEmail = true;
  }
  // console.log(`${userName}  ${password}`);
  /* Check whether the email is valid or not. */
  // if (isEmail) {
  //   if (!userName.includes('.')) {
  //     // res.end(
  //     //   '<script type="text/javascript">\n'
  //     //           + 'alert("please input the email of correct format!");\n'
  //     //           + 'window.location.href = "/signIn"; \n'
  //     //           + '</script>',
  //     // );
  //     res.status(403).json('Please input the correct format of email!');
  //     return;
  //   }
  // }
  if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userName))) {
    res.status(409).json('Please input the email of correct format');
    return;
  }
  // else {
  //   /* Check the phone number is valid or not. */
  //   for (let i = 0; i < userName.length; i += 1) {
  //     if (userName[i] > '9' || userName[i] < '0') {
  //       res.end(
  //         '<script type="text/javascript">\n'
  //                   + 'alert("please input the phone number of correct format!");\n'
  //                   + 'window.location.href = "/signIn"; \n'
  //                   + '</script>',
  //       );
  //     }
  //   }
  // }

  const isValid = await validPassword(userName, password);
  // console.log(isValid[0].password + "  " + password);

  if (isValid.length === 0 || isValid[0].password !== password) {
    res.status(403).json('Password not match!');
  } else if (isValid[0].locked !== undefined || isValid[0].locked != null) {
    const time = new Date();
    const originTime = new Date(isValid[0].locked);

    // if (time < originTime + 30) {
    //   res.status(422).json('Account has been locked, please try after 30 minutes!');
    // }
    res.status(422).json('Account has been locked, please try after 30 minutes!');
  }
  // else {
  //     }

  // }

  // validPassword(userName, password).then(
  //     function (item) {
  //         if (item != password) {
  //             res.end(
  //                 "<script type=\"text/javascript\">\n" +
  //                 "alert(\"Invalid passwrod!\");\n" +
  //                 "window.location.href = \"/signIn\"; \n" +
  //                 "</script>"
  //             );
  //         }
  //     }
  // )
  // var url = "/profile?" + userName;
  // res.end(
  //     "<script type=\"text/javascript\">\n" +
  //     "window.location.href =\"" + url + "\";\n" +
  //     "</script>"
  // );

  if (req.session !== undefined) req.session.user = userName;
  const token = jwt.sign({
    name: userName,
  }, 'this_is_a_secret', { expiresIn: '1h' });
  res.cookie('Authorization', {
    token,
    username: req.body.userName,
  });
  res.send(token);
});

router.get('/signIn', (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'views', 'homepage.html'));
});

router.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'views', 'userProfile.html'));
});

router.get('/updateProfile', (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'views', 'userUpdateInfo.html'));
});

router.get('/getActiveFeed', (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'views', 'activityFeed.html'));
});

router.get('/otherprofilePost', (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'views', 'userProfile_other.html'));
});

router.get('/updateProfile/:email', checkToken, (req, res) => {
  const user = req.params.email;
  jwt.verify(req.token, 'this_is_a_secret', (err, authorizedData) => {
    if (err) {
      // console.log(`Error: ${err}`);
      res.status(403).json('unauthorized');
    } else if (req.loginUser !== req.params.email) {
      // console.log('Incorrect User');
      res.status(403).json('Incorrect User');
    } else if (req.loginUser === req.params.email) {
      try {
        MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoShare', {
          useUnifiedTopology: true,
          useNewUrlParser: true,
        }, (err, db) => {
          if (err) {
            // console.log('Unable to connect db');
            res.status(404).json({ error: err.message });
          } else {
            // console.log('connection established');
            const data = db.db('photoShare').collection('userFile');
            data.find({ email: user }).toArray((err, items) => {
              if (err) {
                res.status(404).json({ error: err.message });
              } else {
                res.status(200).json(items);
                db.close();
              }
            });
          }
        });
      } catch (e) {
        // console.log(e);
      }
    }
  });
});

router.get('/getPostByTags/:tag', checkToken, (req, res) => {
  jwt.verify(req.token, 'this_is_a_secret', (err, authorizedData) => {
    if (err) {
      // console.log(`Error: ${err}`);
      res.status(403).json('unauthorized');
    } else {
      const { tag } = req.params;
      try {
        MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoShare', {
          useUnifiedTopology: true,
          useNewUrlParser: true,
        }, (err, db) => {
          if (err) {
            res.status(404).json({ error: err.message });
          } else {
            db.db('photoShare').collection('userPost')
              . find({ tag }, { _id: 0 })
              . toArray((err, item) => {
                if (err) {
                  res.status(404).json({ error: err.message });
                } else {
                  db.db('photoShare').collection('userFile')
                    .find()
                    .toArray((err, infos) => {
                      if (err) {
                        res.status(404).json({ error: err.message });
                      } else {
                        res.status(200).json({
                          post: item,
                          userinfo: infos,
                        });
                        // console.log(item);
                        db.close();
                      }
                    });
                }
              });
          }
        });
      } catch (e) {
        // console.log(e);
      }
    }
  });
});

router.post('/updateProfile/:email', checkToken, (req, res) => {
  jwt.verify(req.token, 'this_is_a_secret', (err, authorizedData) => {
    if (err) {
      // console.log(`Error: ${err}`);
      res.status(403).json('unauthorized');
    } else if (req.loginUser !== req.params.email) {
      // console.log('Incorrect User');
      res.status(403).json('unauthorized');
    } else if (req.loginUser === req.params.email) {
      /*
      Firstly, GET information from html page and temporarily store.
       */
      const fullName = req.body.userName;
      const birth = req.body.DateOfBirth;
      const gender = req.body.Gender;
      const marriage = req.body.marriageStatus;
      const country = req.body.selectedCountry;
      const { state } = req.body;
      const { area } = req.body;
      const { street } = req.body;
      const { phone } = req.body;
      const { email } = req.body;
      const { company } = req.body;
      const { college } = req.body;
      const { selfIntro } = req.body;
      const { imageSrc } = req.body;

      const data = {
        fullName,
        birth,
        gender,
        marriage,
        country,
        state,
        area,
        street,
        phone,
        email,
        company,
        college,
        selfIntro,
        imageSrc,
      };

      const user = req.params.email;
      // //console.log(data);
      /*
      If client update the phone number here, we need to update the
      log in information since we allow users to use
      either email or phone number to log in.
       */
      try {
        MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoShare', {
          useUnifiedTopology: true,
          useNewUrlParser: true,
        }, (err, db) => {
          if (err) {
            res.status(400).json({ error: err.message });
          } else {
            /**
               * The mongodb rule for this operation is as the follow:
               db.products.update(
               { _id: 100 },
               { $set:
                  {
                      quantity: 500,
                      details: { model: "14Q3", make: "xyz" },
                      tags: [ "coats", "outerwear", "clothing" ]
                     }
               }) */
            db.db('photoShare').collection('userInfo')
              . updateOne(
                { email },
                { $set: { phoneNumber: phone } },
              );
            res.status(200).json('success');
            db.close();
          }
        });
      } catch (e) {
        // console.log(e);
      }

      try {
        MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoShare', {
          useUnifiedTopology: true,
          useNewUrlParser: true,
        }, (err, db) => {
          if (err) {
            // console.log('Unable to connect db');
            res.status(400).json({ error: err.message });
          } else {
            // console.log('connection established');
            /* Delete the original record of the current users firstly. */
            db.db('photoShare').collection('userFile')
              . remove(
                { email: user },
              );
            /* Then insert into the updated information now! */
            db.db('photoShare').collection('userFile')
              . insertOne(data, (err, collection) => {
                if (err) { throw err; }
                // console.log('Record inserted Successfully');
                res.send();
                db.close();
                // //console.log(data);
              });
          }
        });
      } catch (e) {
        // console.log(e);
      }
      /* After submit the file, directly redirect into the post page. */
      // const url = "/profile?" + email;
      // res.redirect(url);
    }
  });
});

router.get('/profile/:user', checkToken, (req, res) => {
  jwt.verify(req.token, 'this_is_a_secret', (err, authorizedData) => {
    if (err) {
      // console.log(`Error: ${err}`);
      res.status(403).json('unauthorized');
    } else if (req.loginUser !== req.params.user) {
      // console.log('Incorrect User');
      res.status(403).json('unauthorized');
    } else if (req.loginUser === req.params.user) {
      MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoShare', {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      }, (err, db) => {
        if (err) {
          // console.log('Unable to connect db');
          res.status(404).json({ error: err.message });
        } else {
          // console.log('connection established');
          const data = db.db('photoShare').collection('userFile');
          data.find({ email: req.params.user }).toArray((err, items) => {
            if (err) {
              res.status(404).json({ error: err.message });
            } else {
              res.json(items);
              db.close();
            }
          });
        }
      });
    }
  });
});


router.post('/profile/:user/upload', checkToken, (req, res) => {
  jwt.verify(req.token, 'this_is_a_secret', (err, authorizedData) => {
    if (err) {
      // console.log(`Error: ${err}`);
      res.status(403).json('unauthorized');
    } else if (req.loginUser !== req.params.user) {
      // console.log('Incorrect User');
      res.status(403).json('unauthorized');
    } else if (req.loginUser === req.params.user) {
      try {
        MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoShare', {
          useUnifiedTopology: true,
          useNewUrlParser: true,
        }, (err, db) => {
          if (err) {
            // console.log('Unable to connect db');
            res.status(400).json({ error: err.message });
          } else {
            // console.log(`=====${req.body.tag}`);
            const data = db.db('photoShare').collection('userPost');
            const img = req.files.file.data;
            const encodeimage = img.toString('base64');
            const timestamp = Date.now();
            const finalImg = {
              userid: req.params.user,
              postid: req.params.user.concat(timestamp.toString()),
              date: timestamp,
              text: req.body.text,
              tag: req.body.tag,
              tagFriends: JSON.parse(req.body.tagFriends),
              image: encodeimage,
              likes: 0,
              likedBy: [],
              dislikes: 0,
              disLikedBy: [],
              comment: [],
            };
            data.insertOne(finalImg, (err, result) => {
              if (err) {
                return; // console.log(err);
              }
              // console.log('saved to database');
              res.send('success');
              db.close();
            });
          }
        });
      } catch (e) { // console.log(e);
      }
    }
  });
});

router.get('/profile/:user/post', checkToken, (req, res) => {
  jwt.verify(req.token, 'this_is_a_secret', (err, authorizedData) => {
    if (err) {
      // console.log(`Error: ${err}`);
      res.status(403).json('unauthorized');
    } else if (req.loginUser !== req.params.user) {
      // console.log('Incorrect User');
      res.status(403).json('unauthorized');
    } else if (req.loginUser === req.params.user) {
      const { user } = req.params;
      try {
        MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoShare', {
          useUnifiedTopology: true,
          useNewUrlParser: true,
        }, (err, db) => {
          if (err) {
            // console.log('Unable to connect db');
            res.status(404).json({ error: err.message });
          } else {
            // console.log('connection established');

            const post = db.db('photoShare').collection('userPost');
            const userInfo = db.db('photoShare').collection('userFile');

            post.find({ userid: user }).sort({ date: -1 })
              . toArray((err, post) => {
                const userlist = [];
                for (ele of post) {
                  if (ele.comment !== undefined) {
                    for (cmt of ele.comment) {
                      if (!userlist.includes(cmt.user)) {
                        userlist.push(cmt.user);
                      }
                    }
                  }
                  if (ele.likedBy !== undefined && ele.likedBy.length > 0) {
                    for (lkd of ele.likedBy) {
                      if (!userlist.includes(lkd)) {
                        userlist.push(lkd);
                      }
                    }
                  }
                }
                // console.log(userlist);
                userInfo.find({ email: { $in: userlist } }, {
                  fullName: 1,
                  email: 1,
                  imageSrc: 1,
                  _id: 0,
                }).toArray((err, info) => {
                  if (err) {
                    return; // console.log(err);
                  }
                  res.status(200).json({
                    post,
                    commentinfo: info,
                  });
                  db.close();
                });
              });
          }
        });
      } catch (e) { // console.log(e);
      }
    }
  });
});

router.get('/otherprofilePost/:self/:user', checkToken, (req, res) => {
  jwt.verify(req.token, 'this_is_a_secret', (err, authorizedData) => {
    if (err) {
      // console.log(`Error: ${err}`);
      res.status(403).json('unauthorized');
    } else if (req.loginUser !== req.params.self) {
      // console.log('Incorrect User');
      res.status(403).json('unauthorized');
    } else if (req.loginUser === req.params.self) {
      const { user } = req.params;
      try {
        MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoShare', {
          useUnifiedTopology: true,
          useNewUrlParser: true,
        }, (err, db) => {
          if (err) {
            // console.log('Unable to connect db');
            res.status(404).json({ error: err.message });
          } else {
            // console.log('connection established');

            const post = db.db('photoShare').collection('userPost');
            const userInfo = db.db('photoShare').collection('userFile');

            post.find({ userid: user }).sort({ date: -1 })
              . toArray((err, post) => {
                const userlist = [];
                userlist.push(user);
                for (ele of post) {
                  if (ele.comment !== undefined) {
                    for (cmt of ele.comment) {
                      if (!userlist.includes(cmt.user)) {
                        userlist.push(cmt.user);
                      }
                    }
                  }
                  if (ele.likedBy !== undefined && ele.likedBy.length > 0) {
                    for (lkd of ele.likedBy) {
                      if (!userlist.includes(lkd)) {
                        userlist.push(lkd);
                      }
                    }
                  }
                }
                // console.log(userlist);
                userInfo.find({ email: { $in: userlist } }, {
                  fullName: 1,
                  email: 1,
                  imageSrc: 1,
                  _id: 0,
                }).toArray((err, info) => {
                  if (err) {
                    return; // console.log(err);
                  }
                  res.status(200).json({
                    post,
                    commentinfo: info,
                  });
                  db.close();
                });
              });
          }
        });
      } catch (e) { // console.log(e);
      }
    }
  });
});


/*
db.userInfo.aggregate([{$match:{email:{$ne:'yuhangu.m@gmail.com'}}},{$sample:{size:3}}])
Modify this part to recommend some other users for the current use to follow
Recommend rule:
1. Select those uses who are followed by current user [a]
2. Return those users who are followed by [a]
 */
async function getFollowerRecViaSchool(email, list) {
  const client = await MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoShare', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });
  if (!client) { return; }

  try {
    const db = client.db('photoShare');
    const collection = db.collection('userFile');
    const subRes = await collection.find({ email }).toArray();
    const school = subRes[0].college;
    if (school === undefined) {
      return undefined;
    }
    const tempRes = await collection.aggregate([
      {
        $match: {
          email: { $nin: list },
          college: school,
        },
      },
      { $sort: { timestamp: -1 } },
      { $sample: { size: 3 } },
    ]).toArray();
    if (tempRes.length === 0) { return undefined; }
    const emails = [];
    for (let i = 0; i < tempRes.length; i += 1) {
      emails.push(tempRes[i].email);
    }
    const res = await db.collection('userInfo').aggregate([{ $match: { email: { $in: emails } } }])
      . toArray();
    // console.log(res);
    return res;
  } catch (e) {
    // console.log(e);
  } finally {
    client.close();
  }
}

async function getRandomFollowerRecommendation(list) {
  const client = await MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoShare', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });
  if (!client) { return; }

  try {
    const db = client.db('photoShare');
    const collection = db.collection('userInfo');
    const res = await collection.aggregate([
      { $match: { email: { $nin: list } } },
      { $sort: { timestamp: -1 } },
      { $sample: { size: 3 } },
    ]).toArray();
    return res;
  } catch (e) {
    // console.log(e);
  } finally {
    client.close();
  }
}

router.get('/allUsers/:email', checkToken, async (req, res) => {
  jwt.verify(req.token, 'this_is_a_secret', async (err, authorizedData) => {
    if (err) {
      // console.log(`Error: ${err}`);
      res.status(403).json('unauthorized');
    } else if (req.loginUser !== req.params.email) {
      // console.log('Incorrect User');
      res.status(403).json('unauthorized');
    } else if (req.loginUser === req.params.email) {
      const followed = await getFollowedLists(req.params.email);
      let exceptList = followed[0].followed;
      if (exceptList !== undefined) {
        exceptList.push(req.params.email);
      } else {
        exceptList = [];
        exceptList.push(req.params.email);
      }
      const toFollow = await getSuggestionList(req.params.email, exceptList);
      if (toFollow[0] === undefined || toFollow.length === 0) {
        const schoolRec = await getFollowerRecViaSchool(req.params.email, exceptList);
        if (schoolRec !== undefined && schoolRec.length > 0) {
          res.json(schoolRec);
        } else {
          const result = await getRandomFollowerRecommendation(exceptList);
          res.json(result);
        }
      } else {
        res.json(toFollow[0].follower);
        // console.log(toFollow[0].follower);
      }
    }
  });
});

router.get('/specificUsers/:name', (req, res) => {
  try {
    MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoShare', {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    }, (err, db) => {
      if (err) {
        // console.log('Unable to connect db');
        res.status(404).json({ error: err.message });
      } else {
        // console.log('connection established');
        const data = db.db('photoShare').collection('userInfo');
        const query = req.params.name;
        data.find({
          name: {
            $regex: `^${query}`,
            $options: 'i',
          },
        }).toArray((err, items) => {
          if (err) {
            res.status(404).json({ error: err.message });
          } else {
            // console.log(items);
            res.status(200).json(items);
            db.close();
          }
        });
      }
    });
  } catch (e) { // console.log(e);
  }
});

async function getFollowedLists(email) {
  const client = await MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoShare', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });
  if (!client) { return; }

  try {
    const db = client.db('photoShare');
    const collection = db.collection('userInfo');
    const query = { email };
    const res = await collection.find(query).toArray();
    return res;
  } catch (e) {
    // console.log(e);
  } finally {
    client.close();
  }
}

async function getSuggestionList(email, list) {
  const client = await MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoShare', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });
  if (!client) { return; }

  try {
    const db = client.db('photoShare');
    const collection = db.collection('followRelationship');
    const res = collection.find({
      $and: [
        { user: { $in: list } },
        { follower: { $nin: list } },
      ],
    }).toArray();
    return res;
  } catch (e) {
    // console.log(e);
  } finally {
    client.close();
  }
}


router.post('/addFollowers/:email', checkToken, (req, res) => {
  jwt.verify(req.token, 'this_is_a_secret', async (err, authorizedData) => {
    if (err) {
      // console.log(`Error: ${err}`);
      res.status(403).json('unauthorized');
    } else if (req.loginUser !== req.params.email) {
      // console.log('Incorrect User');
      res.status(403).json('unauthorized');
    } else {
      try {
        MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoShare', {
          useUnifiedTopology: true,
          useNewUrlParser: true,
        }, (err, db) => {
          if (err) {
            // console.log('Unable to connect db');
            res.status(400).json({ error: err.message });
          } else {
            // console.log('connection established');
            const data = db.db('photoShare').collection('followRelations');
            // console.log(`${req.body.follower} follows ${req.body.user}`);
            const insertData = {
              user: req.body.user,
              follower: req.body.follower,
            };
            data.insertOne(insertData, (err, collection) => {
              if (err) {
                throw err;
              }
              // console.log('Record inserted Successfully');
            });
            /* Add the followed users to userInfo. */
            db.db('photoShare').collection('userInfo')
              .update(
                { email: req.body.follower },
                { $addToSet: { followed: req.body.user } },
              );
            res.status(200).json(req.body.user);
            db.close();
          }
        });
      } catch (e) { // console.log(e);
      }
    }
  });
});

router.get('/getActiveFeed/:email', checkToken, (req, res) => {
  jwt.verify(req.token, 'this_is_a_secret', async (err, authorizedData) => {
    if (err) {
      // console.log(`Error: ${err}`);
      res.status(403).json('unauthorized');
    } else if (req.loginUser !== req.params.email) {
      // console.log('Incorrect User');
      res.status(403).json('unauthorized');
    } else if (req.loginUser === req.params.email) {
      const user = req.params.email;
      try {
        MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoShare', {
          useUnifiedTopology: true,
          useNewUrlParser: true,
        }, (err, db) => {
          if (err) {
            // console.log('Unable to connect db');
            res.status(404).json({ error: err.message });
          } else {
            // console.log('connection established');
            const follow = db.db('photoShare').collection('followRelations');
            const post = db.db('photoShare').collection('userPost');
            const userInfo = db.db('photoShare').collection('userFile');
            follow.distinct('user', { follower: user }, (err, userlist) => {
              userlist.push(user);
              // console.log(userlist);
              post.find({ userid: { $in: userlist } }).sort({ date: -1 })
                . toArray((err, post) => {
                  const cmtrlist = [];
                  for (ele of post) {
                    if (ele.comment !== undefined) {
                      for (cmt of ele.comment) {
                        if (!cmtrlist.includes(cmt.user)) {
                          cmtrlist.push(cmt.user);
                        }
                      }
                    }
                    if (ele.likedBy !== undefined && ele.likedBy.length > 0) {
                      for (lkd of ele.likedBy) {
                        if (!cmtrlist.includes(lkd)) {
                          cmtrlist.push(lkd);
                        }
                      }
                    }
                  }
                  userInfo.find({ email: { $in: userlist } }, {
                    fullName: 1,
                    email: 1,
                    imageSrc: 1,
                    _id: 0,
                  }).toArray((err, userinfo) => {
                    if (err) {
                      res.status(404).json({ error: err.message });
                    } else {
                      userInfo.find({ email: { $in: cmtrlist } }, {
                        fullName: 1,
                        email: 1,
                        imageSrc: 1,
                        _id: 0,
                      }).toArray((err, commentinfo) => {
                        if (err) {
                          res.status(404).json({ error: err.message });
                        } else {
                          res.status(200).json({
                            post,
                            userinfo,
                            commentinfo,
                          });
                          db.close();
                        }
                      });
                    }
                  });
                });
            });
          }
        });
      } catch (e) { // console.log(e);
      }
    }
  });
});

router.get('/getCurrentContacts/:email', checkToken, (req, res) => {
  jwt.verify(req.token, 'this_is_a_secret', async (err, authorizedData) => {
    if (err) {
      // console.log(`Error: ${err}`);
      res.status(403).json('unauthorized');
    } else if (req.loginUser !== req.params.email) {
      // console.log('Incorrect User');
      res.status(403).json('unauthorized');
    } else if (req.loginUser === req.params.email) {
      try {
        MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoShare', {
          useUnifiedTopology: true,
          useNewUrlParser: true,
        }, (err, db) => {
          if (err) {
            // console.log('Unable to connect db');
            res.status(404).json({ error: err.message });
          } else {
            // console.log('connection established');
            const data = db.db('photoShare').collection('userInfo');
            data.find({ email: req.params.email }).toArray((err, items) => {
              if (err) {
                res.status(404).json({ error: err.message });
              } else {
                res.status(200).json(items);
                db.close();
              }
            });
          }
        });
      } catch (e) { // console.log(e);
      }
    }
  });
});

router.get('/showCurrentContacts/:email', checkToken, (req, res) => {
  jwt.verify(req.token, 'this_is_a_secret', async (err, authorizedData) => {
    if (err) {
      // console.log(`Error: ${err}`);
      res.status(403).json('unauthorized');
    } else if (req.loginUser !== req.params.email) {
      // console.log('Incorrect User');
      res.status(403).json('unauthorized');
    } else if (req.loginUser === req.params.email) {
      try {
        MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoShare', {
          useUnifiedTopology: true,
          useNewUrlParser: true,
        }, async (err, db) => {
          if (err) {
            // console.log('Unable to connect db');
            res.status(404).json({ error: err.message });
          } else {
            // console.log('connection established');
            const followed = await getFollowedLists(req.params.email);
            // console.log(followed[0].followed);
            const data = db.db('photoShare').collection('userInfo');
            const userFile = db.db('photoShare').collection('userFile');
            data.find({ email: { $in: followed[0].followed } }).toArray((err, items) => {
              if (err) {
                res.status(404).json({ error: err.message });
              } else {
                userFile.find({ email: { $in: followed[0].followed } }).toArray((err, userfile) => {
                  res.status(200).json({ user: items, profile: userfile });
                });
                // db.close();
              }
            });
          }
        });
      } catch (e) { // console.log(e);
      }
    }
  });
});

router.post('/unfollowUsers/:email/:unfollow', checkToken, (req, res) => {
  jwt.verify(req.token, 'this_is_a_secret', async (err, authorizedData) => {
    if (err) {
      // console.log(`Error: ${err}`);
      res.status(403).json('unauthorized');
    } else if (req.loginUser !== req.params.email) {
      // console.log('Incorrect User');
      res.status(403).json('unauthorized');
    } else if (req.loginUser === req.params.email) {
      try {
        MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoShare', {
          useUnifiedTopology: true,
          useNewUrlParser: true,
        }, async (err, db) => {
          if (err) {
            // console.log('Unable to connect db');
            res.status(404).json({ error: err.message });
          } else {
            // console.log('Unfollow the followed user.');
            const followed = await getFollowedLists(req.params.email);
            const newList = followed[0].followed;
            const idx = newList.indexOf(req.params.unfollow);
            if (idx > -1) {
              newList.splice(idx, 1);
            }
            const data = db.db('photoShare').collection('userInfo');
            data.updateOne({ email: req.params.email },
              { $set: { followed: newList } });

            /* Update the followRelation collection. */
            db.db('photoShare').collection('followRelations')
              . deleteOne({
                user: req.params.unfollow,
                follower: req.params.email,
              });
            res.status(200).json('Done');
            db.close();
          }
        });
      } catch (e) { // console.log(e);
      }
    }
  });
});


// router.get("/post/:postid", checkToken, function (req, res) {
//   jwt.verify(req.token, 'this_is_a_secret', async function (err, authorizedData) {
//     if (err) {
//       //console.log(`Error: ${err}`);
//       res.status(403);
//     }
//     else{
//       try{
//       MongoClient.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/photoShare", {useUnifiedTopology: true,
//       useNewUrlParser: true},function(err,db){
//           if(err){
//               //console.log('Unable to connect db');
//               res.status(404).json({ error: err.message });
//           } else {
//               //console.log('connection established');
//               var data = db.db('photoShare').collection('userPost');
//               data.find({postid: parseFloat(req.params.postid)}, {_id:0,
//               userid:0, postid:0, text:0, image:0,likes: 1, likedBy: 1,
//               dislikes:1, disLikedBy:1}).toArray((err, items) => {
//                   if(err){
//                       res.status(404).json({error: err.message  }); // Return error message
//                   }else{
//                       res.status(200).json(items);
//                       db.close();
//                   }
//               });
//           }
//       });
//      } catch(e){ //console.log(e);}
//     }});
// });

/* ===============================================================
     LIKE BLOG POST
  =============================================================== */
//
router.post('/likePost/:user/:postid', checkToken, (req, res) => {
  jwt.verify(req.token, 'this_is_a_secret', async (err, authorizedData) => {
    if (err) {
      // console.log(`Error: ${err}`);
      res.status(403).json('unauthorized');
    } else if (req.loginUser !== req.params.user) {
      // console.log('Incorrect User');
      res.status(403).json('unauthorized');
    } else if (req.loginUser === req.params.user) {
      try {
        MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoShare', {
          useUnifiedTopology: true,
          useNewUrlParser: true,
        }, (err, db) => {
          if (err) {
            // console.log('Unable to connect db');
            res.status(400).json({ error: err.message });
          } else {
            // console.log(req.params.postid);
            const data = db.db('photoShare').collection('userPost');
            if (!req.params.postid) {
              res.status(401).json({
                success: false,
                message: 'No id was provided.',
              });
            } else if (req.params.postid) {
              // Search the database with id
              data.findOne({ postid: req.params.postid }, (err, post) => {
                if (err) {
                  res.status(403).json({
                    success: false,
                    message: 'Invalid blog id',
                  });
                } else {
                  // data.findOne({ userid: req.params.user }, (err, user) => {
                  //   // Check if error was found
                  //   if (err) {
                  //     res.status(404).json({ error: err.message });
                  //   } else if (!user) {
                  //     res.status(401).json({
                  //       success: false,
                  //       message: 'Could not authenticate user.',
                  //     });
                  //   } else {
                  //     if ((post.likes === undefined)) { post.likes = 0; }
                  //     if ((post.likedBy === undefined)) { post.likedBy = []; }
                  //     if (!post.likedBy.includes(req.params.user)) {
                  //       post.likes += 1;
                  //       post.likedBy.push(req.params.user);
                  //     } else if (post.likedBy.includes(req.params.user)) {
                  //       post.likes -= 1;
                  //       for (let i = 0; i < post.likedBy.length; i += 1) {
                  //         if (post.likedBy[i] === req.params.user) {
                  //           post.likedBy.splice(i, 1);
                  //         }
                  //       }
                  //     }
                  //     data.updateOne(
                  //       { postid: req.params.postid },
                  //       {
                  //         $set: {
                  //           likes: post.likes,
                  //           likedBy: post.likedBy,
                  //         },
                  //       },
                  //     );
                  //     res.status(200).json('Succeed');
                  //     db.close();
                  //   }
                  // });
                  console.log(post);
                  if ((post.likes === undefined)) { post.likes = 0; }
                      if ((post.likedBy === undefined)) { post.likedBy = []; }
                      if (!post.likedBy.includes(req.params.user)) {
                        post.likes += 1;
                        post.likedBy.push(req.params.user);
                      } else if (post.likedBy.includes(req.params.user)) {
                        post.likes -= 1;
                        for (let i = 0; i < post.likedBy.length; i += 1) {
                          if (post.likedBy[i] === req.params.user) {
                            post.likedBy.splice(i, 1);
                          }
                        }
                      }
                      data.updateOne(
                        { postid: req.params.postid },
                        {
                          $set: {
                            likes: post.likes,
                            likedBy: post.likedBy,
                          },
                        },
                      );
                      res.status(200).json('Succeed');
                      db.close();
                }
              });
            }
          }
        });
      } catch (e) { // console.log(e);
      }
    }
  });
});

/* ===============================================================
     Total Likes number count
  =============================================================== */

router.get('/totalLikes/:user', checkToken, (req, res) => {
  jwt.verify(req.token, 'this_is_a_secret', async (err, authorizedData) => {
    if (err) {
      // console.log(`Error: ${err}`);
      res.status(403).json('unauthorized');
    } else if (req.loginUser !== req.params.user) {
      // console.log('Incorrect User');
      res.status(403).json('unauthorized');
    } else if (req.loginUser === req.params.user) {
      try {
        MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoShare', {
          useUnifiedTopology: true,
          useNewUrlParser: true,
        }, (err, db) => {
          if (err) {
            // console.log('Unable to connect db');
            res.status(404).json({ error: err.message });
          } else {
            // console.log('connection established');
            const data = db.db('photoShare').collection('userPost');
            if (!req.params.user) {
              res.json({
                success: false,
                message: 'No id was provided.',
              });
            } else if (req.params.user) {
              data.aggregate([
                {
                  $group: {
                    _id: '$userid',
                    totalLikes: { $sum: '$likes' },
                  },
                },
                { $match: { _id: req.params.user } },
              ]).toArray((err, items) => {
                if (err) {
                  res.status(404).json({ error: err.message });
                } else {
                  res.status(200).json(items);
                  db.close();
                }
              });
            }
          }
        });
      } catch (e) { // console.log(e);
      }
    }
  });
});

/* ===============================================================
     Total disLikes number count
  =============================================================== */

// router.get('/totalDisLikes/:user', (req, res) => {
//   try {
//     MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoShare', {
//       useUnifiedTopology: true,
//       useNewUrlParser: true,
//     }, (err, db) => {
//       if (err) {
//         // console.log('Unable to connect db');
//         res.status(404).json({ error: err.message });
//       } else {
//         // console.log('connection established');
//         const data = db.db('photoShare').collection('userPost');
//         if (!req.params.user) {
//           res.status(404).json({
//             success: false,
//             message: 'No id was provided.',
//           });
//         } else if (req.params.user) {
//           data.aggregate([
//             {
//               $group: {
//                 _id: '$userid',
//                 totalDisLikes: { $sum: '$dislikes' },
//               },
//             },
//             { $match: { _id: req.params.user } },
//           ]).toArray((err, items) => {
//             if (err) {
//               res.status(404).json({ error: err.message });
//             } else {
//               res.status(200).json(items);
//               db.close();
//             }
//           });
//         }
//       }
//     });
//   } catch (e) { // console.log(e);
//   }
// });

/** =======================================================
 * Post comment
=========================================================== */
router.post('/postComment/:user/:postid', checkToken, (req, res) => {
  jwt.verify(req.token, 'this_is_a_secret', async (err, authorizedData) => {
    if (err) {
      // console.log(`Error: ${err}`);
      res.status(403).json('unauthorized');
    } else if (req.loginUser !== req.params.user) {
      // console.log('Incorrect User');
      res.status(403).json('unauthorized');
    } else if (req.loginUser === req.params.user) {
      try {
        MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoShare', {
          useUnifiedTopology: true,
          useNewUrlParser: true,
        }, (err, db) => {
          if (err) {
            // console.log('Unable to connect db');
            res.status(400).json({ error: err.message });
          } else {
            // console.log('connection established');
            const data = db.db('photoShare').collection('userPost');
            data.findOne({ postid: req.params.postid }, (err, post) => {
              if (err) {
                res.status(404).json({
                  success: false,
                  message: 'Invalid blog id',
                });
              } else {
                if (post.comment === undefined) {
                  post.comment = {};
                }
                if (req.body.Comment !== '') {
                  const timestamp = Date.now();
                  post.comment.push({
                    // eslint-disable-next-line max-len
                    commentID: req.params.postid.concat(req.params.user).concat(timestamp.toString()),
                    date: timestamp,
                    user: req.params.user,
                    comment: req.body.Comment,
                    tags: req.body.tags,
                  });
                }
                data.updateOne(
                  { postid: req.params.postid },
                  { $set: { comment: post.comment } },
                );
                res.status(200).json('Succeed');
                db.close();
              }
            });
          }
        });
      } catch (e) { // console.log(e);
      }
    }
  });
});


/** =======================================================
 * Publish the Comment from the backend to front
=========================================================== */

// router.get('/postComment/:user/:postid', function(req, res) {
//     try{
//     MongoClient.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/photoShare", {useUnifiedTopology: true,
//       useNewUrlParser: true},function(err,db){
//       if(err){
//           //console.log('Unable to connect db');
//           res.status(404).json({ error: err.message });
//       } else {
//           //console.log('connection established');
//           var data = db.db('photoShare').collection('userPost');
//
//           data.find({postid: parseFloat(req.params.postid)}).toArray((err, items) => {
//             if(err){
//                 res.status(404).json({  error: err.message }); // Return error message
//             }else{
//                 res.status(200).json(items);
//                 db.close();
//             }
//           });
//         }
//     });
//     } catch(e){ //console.log(e);}
// });

/** =======================================================
 * Edit Post Text
=========================================================== */

router.post('/editPostText/:postid', checkToken, (req, res) => {
  jwt.verify(req.token, 'this_is_a_secret', async (err, authorizedData) => {
    if (err) {
      // console.log(`Error: ${err}`);
      res.status(403).json('unauthorized');
    } else {
      try {
        MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoShare', {
          useUnifiedTopology: true,
          useNewUrlParser: true,
        }, (err, db) => {
          if (err) {
            // console.log('Unable to connect db');
            res.status(400).json({ error: err.message });
          } else {
            // console.log('connection established');
            const data = db.db('photoShare').collection('userPost');
            data.updateOne(
              { postid: req.params.postid },
              { $set: { text: req.body.newPostText } },
              (err, post) => {
                if (err) {
                  res.json({
                    success: false,
                    message: 'Invalid',
                  });
                } else {
                  res.status(200).json('Succeed');
                  db.close();
                }
              },
            );
          }
        });
      } catch (e) { // console.log(e);
      }
    }
  });
});


/** =======================================================
 * Edit Comment Text
=========================================================== */

router.post('/editComment/:postid', checkToken, (req, res) => {
  jwt.verify(req.token, 'this_is_a_secret', async (err, authorizedData) => {
    if (err) {
      // console.log(`Error: ${err}`);
      res.status(403).json('unauthorized');
    } else {
      try {
        MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoShare', {
          useUnifiedTopology: true,
          useNewUrlParser: true,
        }, (err, db) => {
          if (err) {
            // console.log('Unable to connect db');
            res.status(400).json({ error: err.message });
          } else {
            // console.log('connection established');
            const data = db.db('photoShare').collection('userPost');
            data.updateOne(
              {
                $and: [
                  { postid: req.params.postid },
                  { 'comment.commentID': req.body.commentID },
                ],
              },
              { $set: { 'comment.$.comment': req.body.newCommentText } },
              (err, post) => {
                if (err) {
                  res.status(404).json({ error: err.message });
                } else {
                  res.status(200).json('Succeed');
                  db.close();
                }
              },
            );
          }
        });
      } catch (e) { // console.log(e);
      }
    }
  });
});


/** =======================================================
 * delete Post Text
=========================================================== */

router.delete('/deletePost/:postid', checkToken, (req, res) => {
  jwt.verify(req.token, 'this_is_a_secret', async (err, authorizedData) => {
    if (err) {
      // console.log(`Error: ${err}`);
      res.status(403).json('unauthorized');
    } else {
      try {
        MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoShare', {
          useUnifiedTopology: true,
          useNewUrlParser: true,
        }, (err, db) => {
          if (err) {
            // console.log('Unable to connect db');
            res.status(400).json({ error: err.message });
          } else {
            // console.log('connection established');
            const data = db.db('photoShare').collection('userPost');
            data.deleteOne({ postid: req.params.postid }, (err, post) => {
              if (err) {
                res.status(404).json({ error: err.message });
              } else {
                res.status(200).json('success');
                db.close();
              }
            });
          }
        });
      } catch (e) { // console.log(e);
      }
    }
  });
});

/** =======================================================
 * delete picture
=========================================================== */

router.post('/deletePicture/:postid', checkToken, (req, res) => {
  jwt.verify(req.token, 'this_is_a_secret', async (err, authorizedData) => {
    if (err) {
      // console.log(`Error: ${err}`);
      res.status(403).json('unauthorized');
    } else {
      try {
        MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoShare', {
          useUnifiedTopology: true,
          useNewUrlParser: true,
        }, (err, db) => {
          if (err) {
            // console.log('Unable to connect db');
            res.status(400).json({ error: err.message });
          } else {
            // console.log('connection established');
            const data = db.db('photoShare').collection('userPost');

            data.updateOne({ postid: req.params.postid },
              { $set: { image: '' } },
              (err, post) => {
                if (err) {
                  res.status(404).json({ error: err.message });
                } else {
                  res.status(200).json('Delete Succeed');
                  db.close();
                }
              });
          }
        });
      } catch (e) { // console.log(e);
      }
    }
  });
});

/** =======================================================
 * Edit picture
=========================================================== */
router.post('/editImage/:postid', checkToken, (req, res) => {
  jwt.verify(req.token, 'this_is_a_secret', async (err, authorizedData) => {
    if (err) {
      // console.log(`Error: ${err}`);
      res.status(403).json('unauthorized');
    } else {
      // //console.log(req.params.postid);
      try {
        MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoShare', {
          useUnifiedTopology: true,
          useNewUrlParser: true,
        }, (err, db) => {
          if (err) {
            // console.log('Unable to connect db');
            res.status(400).json({ error: err.message });
          } else {
            // console.log('connection established');
            const data = db.db('photoShare').collection('userPost');
            // console.log('new picture');
            // //console.log(req.body.imageSrcNew);
            if (req.body.imageSrcNew !== undefined) {
              // //console.log(req.body.imageSrcNew);
              data.updateOne({ postid: req.params.postid },
                { $set: { image: req.body.imageSrcNew } },
                (err, post) => {
                  if (err) {
                    res.status(404).send({ error: err.message });
                  } else {
                    res.status(200).send('edit picture');
                    // console.log('success in changing');
                    db.close();
                  }
                });
            }
          }
        });
      } catch (e) {
        // console.log(e);
      }
    }
  });
});


/** =======================================================
 * Delete Comment Text
=========================================================== */

router.post('/deleteComment/:postid', checkToken, (req, res) => {
  jwt.verify(req.token, 'this_is_a_secret', async (err, authorizedData) => {
    if (err) {
      // console.log(`Error: ${err}`);
      res.status(403).json('unauthorized');
    } else {
      try {
        MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoShare', {
          useUnifiedTopology: true,
          useNewUrlParser: true,
        }, (err, db) => {
          if (err) {
            // console.log('Unable to connect db');
            res.status(400).json({ error: err.message });
          } else {
            // console.log('connection established');
            const data = db.db('photoShare').collection('userPost');
            // console.log(req.body.commentID);
            data.updateOne(
              {
                $and: [
                  { postid: req.params.postid },
                  { 'comment.commentID': req.body.commentID },
                ],
              },
              { $pull: { comment: { commentID: req.body.commentID } } },
              (err, post) => {
                if (err) {
                  res.status(404).json({ error: err.message });
                } else {
                  res.status(200).json('Succeed');
                  db.close();
                }
              },
            );
          }
        });
      } catch (e) { // console.log(e);
      }
    }
  });
});

/* ===============================================================
     Total post number count
  =============================================================== */

router.get('/totalPost/:user', checkToken, (req, res) => {
  jwt.verify(req.token, 'this_is_a_secret', async (err, authorizedData) => {
    if (err) {
      // console.log(`Error: ${err}`);
      res.status(403).json('unauthorized');
    } else if (req.loginUser !== req.params.user) {
      // console.log('Incorrect User');
      res.status(403).json('unauthorized');
    } else if (req.loginUser === req.params.user) {
      try {
        MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoShare', {
          useUnifiedTopology: true,
          useNewUrlParser: true,
        }, (err, db) => {
          if (err) {
            // console.log('Unable to connect db');
            res.status(400).json({ error: err.message });
          } else {
            // console.log('connection established');
            const data = db.db('photoShare').collection('userPost');
            if (!req.params.user) {
              res.status(404).json({
                success: false,
                message: 'No id was provided.',
              });
            } else if (req.params.user) {
              data.aggregate([
                {
                  $group: {
                    _id: '$userid',
                    totalPostCount: { $sum: 1 },
                  },
                },
                { $match: { _id: req.params.user } },
              ]).toArray((err, items) => {
                if (err) {
                  res.status(404).json({ error: res.message });
                } else {
                  res.status(200).json(items);
                  db.close();
                }
              });
            }
          }
        });
      } catch (e) { // console.log(e);
      }
    }
  });
});

/* ===============================================================
     Total Followers count
  =============================================================== */

router.get('/totalFollower/:user', checkToken, (req, res) => {
  jwt.verify(req.token, 'this_is_a_secret', async (err, authorizedData) => {
    if (err) {
      // console.log(`Error: ${err}`);
      res.status(403).json('unauthorized');
    } else if (req.loginUser !== req.params.user) {
      // console.log('Incorrect User');
      res.status(403).json('unauthorized');
    } else if (req.loginUser === req.params.user) {
      try {
        MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoShare', {
          useUnifiedTopology: true,
          useNewUrlParser: true,
        }, (err, db) => {
          if (err) {
            // console.log('Unable to connect db');
            res.status(404).json({ error: res.message });
          } else {
            // console.log('connection established');
            const data = db.db('photoShare').collection('followRelations');
            if (!req.params.user) {
              res.status(404).json({
                success: false,
                message: 'No id was provided.',
              });
            } else if (req.params.user) {
              data.distinct('follower', { user: req.params.user }, (err, items) => {
                if (err) {
                  res.status(404).json({ error: res.message });
                } else {
                  res.status(200).json(items);
                  db.close();
                }
              });
            }
          }
        });
      } catch (e) { // console.log(e);
      }
    }
  });
});

router.get('/signOut', checkToken, (req, res) => {
  // console.log(req.loginUser + "  " + req.query.user);
  jwt.verify(req.token, 'this_is_a_secret', async (err, authorizedData) => {
    if (err) {
      // console.log(`Error: ${err}`);
      res.status(403).json('unauthorized');
    } else if (req.loginUser !== req.query.user) {
      res.status(403).json('unauthorized');
    } else if (req.loginUser === req.query.user) {
      req.session.destroy((err) => {});
      res.clearCookie('Authorization');
      res.status(200).json('Log out successfully');
    }
  });
});

router.get('/signIn/:user/lock', checkToken, (req, res) => {
  jwt.verify(req.token, 'this_is_a_secret', async (err, authorizedData) => {
    if (err) {
      // console.log(`Error: ${err}`);
      res.status(403).json('unauthorized');
    } else if (req.loginUser !== req.params.user) {
      res.status(403).json('unauthorized');
    } else if (req.loginUser === req.params.user) {
      // console.log('here');
      MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/photoShare', {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      }, (err, db) => {
        if (err) {
          // console.log('Unable to connect db');
          res.status(404).json({ error: res.message });
        } else {
          // console.log('connection established');
          const data = db.db('photoShare').collection('userInfo');
          const time = new Date();
          // const timeStamp = 60 * 60 * time.getHours()
          //   + 60 * (time.getMinutes() + 30) + time.getSeconds();
          data.updateOne({ email: req.params.user }, { $set: { locked: time } });
        }
      });
    }
  });
});

router.get('/session/destroy', (req, res) => {
  if (req.session !== undefined) req.session.destroy();
  res.status(200).send('ok');
});

// Default response for any other request
router.use((_req, res) => {
  res.status(404);
});

module.exports = router;
