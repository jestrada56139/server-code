var express = require('express');
var app = express();
var express = require('express');
var port = process.env.PORT || 3000;
var app = express();
var bodyParser = require('body-parser');
var cors = require('cors');
var test = require('./routes/route');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var salt = 10;
var jwt = require('jsonwebtoken');
var xss = require('xss');
var user = { name: 'Jonathan Estrada' };
const accountSid = 'ACaf0ec871b3c59a3447b45830a4c16d6e';
const authToken = '20f9561685a7f3b67c16fa0fd5cc08fc';
const client = require('twilio')(accountSid, authToken);

 


mongoose.connect('mongodb://jonathanem:Evariste1@ds259768.mlab.com:59768/online-portfolio', function() {
  console.log('connected to Mlab.')
});

mongoose.connection.on('error', function(err) {
    if (err) throw err;
});

var Schema = mongoose.Schema;
var userSchema = new Schema({
    firstName : String,
    lastName : String,
    password: String,
    email : String,
    pic : {
        type : String,
        default : './assets/N/A.jpg'
    },
  
    created :{
        type: Date,
        default : Date.now()
    },

    modified : {
        type: Date,
        default : Date.now()
    }
});

var contactSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now()
    },
    modified: {
        type: Date,
        default: Date.now()
    }
});


var User = mongoose.model('user', userSchema);
var ContactForm = mongoose.model('contact', contactSchema);


// middle ware
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors({origin: true, credentials: true}));

var xssService = {
    sanitize: function (req, res, next) {
        var data = req.body
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                data[key] = xss(data[key]);
                console.log(data[key]);
            }

        }
        next();
    }
};

var bcryptService = {
    hash: function (req, res, next) {
        bcrypt.hash(req.body.password, salt, function (err, res) {
            if (err) throw err;
            req.body.password = res;
            console.log(res)
            next();
        })
    }

};

app.post('/contactFormSubmit', xssService.sanitize, function (req, res) {
    var contactSchema = new ContactForm(req.body);
    contactSchema.save(function (err, product) {
        if (err) throw err;
        console.log("Form Submitted!");
        client.messages
            .create({
                to: '+13233926989',
                from: '+18339883151',
                body: 'pls work',
            })
            .then(message => {
                console.log(message.sid)
                res.status(200).send({
                    type: true,
                    data: 'Form Information Submitted to Database!'
                })
            })
            .catch((err) => {
                if (err) throw err;
            })            
    });
});

app.post('/admin/register', xssService.sanitize, bcryptService.hash, function (req, res) {
    var newUser = new User(req.body);
    newUser.save(function (err, product) {
        if (err) throw err;
        console.log("user saved!");
        res.status(200).send({
            type: true,
            data: 'Succesfully Registered'
        })
    });
});

app.post('/admin/login', function (req, res) {
    User.findOne({ 'email': req.body.email }, 'password', function (err, product) {
        if (err) throw err;
        if (product === null) {
            res.status(200).send({
                type: false,
                data: 'Email does not exist'
            })

        } else {
            bcrypt.compare(req.body.password, product.password, function (err, resp) {
                console.log(product.password)
                if (err) throw err;
                console.log(resp)
                if (resp) {
                    const token = jwt.sign({ user }, 'secret_key', { expiresIn: '400s' });
                    console.log("user's token:", token);

                    res.status(200).send({
                        type: true,
                        data: 'Welcome to the page',
                        token: token
                    })
                } else {
                    res.status(200).send({
                        type: false,
                        data: 'Incorrect Password'
                    })

                }
            })
            if (err) throw err;
            console.log(product)

        }
    })
})


// listen on port 3000
app.listen(port,function (){
    console.log('listening on port: ',port);


})
