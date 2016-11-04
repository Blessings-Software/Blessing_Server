var express = require('express')//express 모듈선언
var app = express();
var bodyParser = require('body-parser')//body-parser express미들웨어
var mongoose = require('mongoose')//MongoDB 연동을 쉽게해줄 mongoose 모듈
var passport  = require('passport')//토큰인증모듈
var FacebookStrategy = require('passport-facebook').Strategy;;//facebook login
var schema = mongoose.Schema;//스키마 선언

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static('public'));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost/diconyong", function(err) {//mongodb의 diconyong 데이터베이스를 접근
    if (err) {
        console.log("DB Error!");
        throw err;
    }
})

var UserSchema = new schema({ //db collection에 userdata를 저장할 형식
    username: {
        type: String
    },
    id: {
        type: String
    },
    password: {
        type: String
    }
})

var SettingSchema = new schema({ //db collection에 usersetting값을 저장할 형식
  id: {
    type: String
  },
  desktopstring1: {
    type: String
  },
  desktopstring2: {
    type: String
  },
  desktopimage: {
    type: String
  },
  Youtubelist: {
    type: String
  },
  YouTuberecent: {
    type: String
  },
  YoutubeSetting: {
    type: String
  }
})

var Setting = mongoose.model('setting',SettingSchema);  //SettingSchema를 이용해 Settings 테이블 선언

var User = mongoose.model('user', UserSchema);  //UserSchema를 이용해 users테이블 선언

app.listen(50000, function() { //서버 실행
    console.log("Server Running at 50000 Port")
})

/*REST ful방식*/
app.get('/', function(req, res) {
    res.send('Facebook 회원가입 완료.\n이메일로 로그인 하세요')
})

app.post('/login', function(req, res) { //로그인
    console.log("User Login : " + req.param('id'))
    User.findOne({
        id: req.param('id')
    }, function(err, result) {
        if (err) {
            console.log("/auth/login failed")
            throw err
        }
        console.log("DB Founded : " + result)
        if (result) {
            if (result.password == req.param('password')) {
                console.log("User " + result.username + " Logged In");
                res.json({
                  success: true,
                  message: "Login Success"
                })
            } else if (result.password != req.param('password')) {
                console.log("비밀번호 오류.")
                res.json({
                    success: false,
                    message: "Password Error"
                })
            }
            else if(req.param('password')==null){
              res.json({
                success: false,
                message: "비밀번호가 비어있습니다."
              })
            }
        } else {
          console.log('아이디 오류.')
            res.json({
                success: false,
                message: "ID Error(Account Not Founded)"
            })
        }
    })
})

app.post('/register', function(req, res) {  //회원가입
    var id = req.param('id');
    var password = req.param('password')

    user = new User({
        username: req.param('username'),
        id: req.param('id'),
        password: req.param('password')
    })

    User.findOne({
        id: req.param('id')
    }, function(err, result) {
        if (err) {
            console.log(err)
            throw err
        }
        if (result) {
            res.json({
                success: false,
                message: "이미 있는 아이디 입니다."
            })
        } else {
            user.save(function(err) {
                if (err) {
                    console.log("user save err")
                    throw err
                } else {
                    console.log("user save success")
                    res.json({
                      success: true,
                      message: "회원가입 성공"
                    })
                }
            })
        }
    })
})

app.post('/remove', function(req, res){ //계정삭제(setting값도 함께 사라짐)
  console.log("User Login for Delete: " + req.param('id'))
  User.findOne({
      id: req.param('id')
  }, function(err, result) {
      if (err) {
          console.log("/auth/login failed")
          throw err
      }
      console.log("DB Founded : " + result)
      if (result) {
          if (result.password == req.param('password')) {
              User.remove({id: result.id}, function(err){
                if(err){
                  console.log('User Delete ERR!')
                  throw err
                }
                else{
                  console.log('User '+ result.username + ' Delete Success!')
                }
              }
              )
              Setting.remove({id: result.id}, function(err){
                if(err){
                  console.log('/remove Setting Delete Err')
                  throw err
                }
                else{
                  console.log('Setting '+result.username + ' Delete Success!')
                  res.json({
                    success: true,
                    message: "Delete Success"
                  })
                }
              })
          } else if (result.password != req.param('password')) {
              console.log("Password Error")
              res.json({
                  success: false,
                  message: "Account Error(Password Not Match)"
              })
          }
      } else {
          res.json({
              success: false,
              message: "Account Not Founded"
          })
      }
  })
})

app.post('/get', function(req, res){ //user setting값을 받아가는 링크
  Setting.findOne({
    id: req.param('id')
  }, function(err, result){
    if(err){
      console.log('/get Error'+err)
      throw err
    }
    if(result){
      console.log(req.param('id') +" Setting Founded")
      res.json(result)
    }
    else{
      console.log('Setting Not Founded')
      res.json({
        success: false,
        message: "Setting Not Founded"
      })
    }
  })
})

app.post('/set', function(req, res){ //user setting값을 저장하는 함수

  setting = new Setting({
    id: req.param('id'),
    desktopstring1: req.param('desktopstring1'),
    desktopstring2: req.param('desktopstring2'),
    desktopimage: req.param('desktopimage'),
    Youtubelist: req.param('Youtubelist'),
    YouTuberecent: req.param('YouTuberecent'),
    YoutubeSetting: req.param('YoutubeSetting')
  })

  Setting.findOne({
    id: req.param('id')
  }, function(err, result){
    if(err){
      console.log(err)
      throw err
    }
    if(result){
      Setting.remove({id: result.id}, function(err){
        if(err){
          console.log(err)
          throw err
        }
        else{
          console.log('Setting Delete Success')
          setting.save(function(err){
            if(err){
              console.log("Setting Save Error")
              throw err
            }
            else{
              console.log("Setting Save Success")
              res.json({
                success: true,
                message: "Save Success"
              })
            }
          })
        }
      })
    }
    else{
      setting.save(function(err){
        if(err){
          console.log("Setting Save Error")
          throw err
        }
        else{
          console.log("Setting Save Success")
          res.json({
            success: true,
            message: "Save Success"
          })
        }
      })
    }
  })
})

passport.use(new FacebookStrategy({ //facebook 로그인을 위한 토큰 로그인
    clientID: '1008754382587528',
    clientSecret: '9a2de375f9350a74ec30e79f442fbec3',
    callbackURL: "/auth/facebook/callback",
    profileFields: ['id', 'email', 'gender', 'link', 'locale', 'name', 'timezone', 'verified'],
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(profile)
    console.log("email : "+profile.emails)
    user = new User({
      username: profile.familyName+profile.givenName,
      id: profile.emails
    })

    User.findOne({
      id: profile.emails
    }, function(err, result){
      if(err){
        console.log("findOne err")
        //throw err
      }
      if(result){
        console.log(profile.familyName+profile.givenName+" Facebook Login")
        done(null, true, { message: "Login Success!"})
      }
      else{
        user.save(function(err){
          if(err){
            console.log("save err")
            //throw err
          }
          else{
            console.log(profile.familyName+profile.givenName+" Facebook User Save")
            done(null, true, { message: 'Register Success!'})
          }
        })
      }
    })
  }
));

passport.serializeUser(function(user, done) {
  console.log("serialize")
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  console.log("deserialize")
  done(null, user);
});

app.get('/auth/facebook', //facebook 로그인을 위한 함수 , 로그인 링크 : http://soylatte.kr/auth/facebook
  passport.authenticate('facebook', { scope: ['email', 'public_profile', 'read_stream', 'publish_actions'] })//페이스북에서 받아올 정보 퍼미션 설정
);

app.get('/auth/facebook/callback', //로그인후에 성공, 실패 여부에 따른 리다이렉션(링크이동)
  passport.authenticate('facebook',
  {
    successRedirect: '/',
    failureRedirect: '/auth/facebook'
  }));
