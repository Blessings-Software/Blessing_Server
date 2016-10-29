var express = require('express')
var app = express();
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var schema = mongoose.Schema;

app.use(bodyParser.urlencoded({
    extended: true
}));

mongoose.connect("mongodb://localhost/sibal", function(err) {
    if (err) {
        console.log("MongoDB Error!");
        throw err;
    }
});

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

var User = mongoose.model('user', UserSchema);

app.listen(3000, function() {
    console.log("Server Running")
})

app.get('/', function(req, res) {
    res.send("asdf");
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
                console.log("User " + result.name + "Logged In");
                res.json(result)
            } else if (result.password != req.param('password')) {
                console.log("Password Error")
                res.json({
                    success: false,
                    message: "password Error"
                })
            }
        } else {
            res.json({
                success: false,
                message: "ID Error"
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
                    res.json(user)
                }
            })
        }
    })
})
