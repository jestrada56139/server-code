// Dependencies
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
// Twilio
const accountSid = 'ACaf0ec871b3c59a3447b45830a4c16d6e';
const authToken = '20f9561685a7f3b67c16fa0fd5cc08fc';
const client = require('twilio')(accountSid, authToken);

 

// Connecting to Mlab
mongoose.connect('mongodb://jonathanem:Evariste1@ds259768.mlab.com:59768/online-portfolio', function(err, db) {
    if (err) {
        console.log('error connecting to mlab');
        process.exit(1);
        throw err
    } else {
        console.log('connected to mLab')
        commentCollection = db.collection("comments"),
        blogCollection = db.collection("blogs")
    }

});

// On Error Connecting
mongoose.connection.on('error', function(err) {
    if (err) throw err;
});

var Schema = mongoose.Schema;

// Creating a User
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

// Creating a Blog

var blogSchema = new Schema ({
    author: {
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
    }
});

// Getting into Contact
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

// Adding a comment
var commentSchema = new Schema({
    name: {
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
    },
    discussionId: {
        type: String,
        required: true
    }
});

// models
var User = mongoose.model('user', userSchema);
var ContactForm = mongoose.model('contact', contactSchema);
var CommentForm = mongoose.model('comment', commentSchema);
var Blog = mongoose.model('blog', blogSchema);


// middle ware
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors({origin: true, credentials: true}));

// Sanitization
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

// Hashing passwords
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

// Sending a Message through Contact Form
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

// Making a new user
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

//adding a comment
app.post('/comments', xssService.sanitize, function (req, res) {
    var newComment = new CommentForm(req.body);
    newComment.save(function (err, product) {
        if (err) throw err;
        console.log("added comment!");
        res.status(200).send({
            type: true,
            data: 'Succesfully Added Comment'
        })
    });
});

// adding a blog 
app.post('/blogs', xssService.sanitize, function (req, res) {
    var newBlog = new Blog(req.body);
    newBlog.save(function (err, product) {
        if (err) throw err;
        console.log('added new blog!');
        res.status(200).send({
            type: true,
            data: 'Succesfully Added New Blog'
        });
    });
});

// Getting comments
app.get('/pullComments', function(req,res){
    commentCollection.find({ discussionId : '5ab68e8f15cdcb74c13f47fc' }).toArray(function(err,docs){
      if (err){
        throw err;
        res.sendStatus(500);
      }else{
        var result = docs.map(function(data){
          return data;
        })
        res.status(200).send(result);
      }
    })
});

// Getting blogs
// app.get('/pullBlogs', function(req ,res) {
//     blogCollection.findOne().toArray(function(err, docs) {
//         if (err) {
//             throw err;
//             res.sendStatus(500);
//         } else {
//             var result = docs.map(function(data){
//                 return data;
//             })
//             res.status(200).send(result);
//         }
//     })
// })

// Getting Blogs
app.get('/pullBlog', function (req, res) {
    var id = req.headers.headerid
    id = mongoose.Types.ObjectId(id);
    Blog.findOne({
        _id: id
    }, function(err, data){
        if(err) throw err;
        console.log(data);
        res.status(200).send(data);
    });
});


  

// Logging in that user
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
