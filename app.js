var express = require('express')
var app = express();
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var passport  = require('passport')
var FacebookStrategy = require('passport-facebook').Strategy;
var schema = mongoose.Schema;

app.use(bodyParser.urlencoded({
    extended: true
}));


app.use(express.static('public'));
app.use(passport.initialize());
app.use(passport.session());



mongoose.connect("mongodb://localhost/diconyong", function(err) {
    if (err) {
        console.log("DB Error!");
        throw err;
    }
})

var UserSchema = new schema({
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

var SettingSchema = new schema({
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

var Setting = mongoose.model('setting',SettingSchema);

var User = mongoose.model('user', UserSchema);

app.listen(50000, function() {
    console.log("Server Running at 50000 Port")
})

app.get('/auth/facebook',
  passport.authenticate('facebook', { scope: ['email', 'public_profile'] })
);

app.get('/', function(req, res) {
    res.send('Dicon Live Background')
})

app.post('/login', function(req, res) {
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
        } else {
          console.log('아이디 오류.')
            res.json({
                success: false,
                message: "ID Error(Account Not Founded)"
            })
        }
    })
})

app.post('/register', function(req, res) {
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

app.post('/remove', function(req, res){
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

app.post('/get', function(req, res){
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

app.post('/set', function(req, res){

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



passport.use(new FacebookStrategy({
    clientID: '1008754382587528',
    clientSecret: '9a2de375f9350a74ec30e79f442fbec3',
    callbackURL: "/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    console.log("email : "+profile.email)
    user = new User({
      username: profile.displayName,
      id: profile.email
    })

    User.findOne({
      id: profile.email
    }, function(err, result){
      if(err){
        console.log("findOne err")
        //throw err
      }
      if(result){
        console.log(profile.displayName+" Facebook Login")
        done(null, true, { message: "Login Success!"})
      }
      else{
        user.save(function(err){
          if(err){
            console.log("save err")
            //throw err
          }
          else{
            console.log(profile.displayName+" Facebook User Save")
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

app.get('/auth/facebook',
  passport.authenticate('facebook'));


app.get('/auth/facebook/callback',
  passport.authenticate('facebook',
  {
    successRedirect: '/',
    failureRedirect: '/auth/facebook'
  }));
