//importing modules
const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const cors = require('cors');
const path = require('path');
const route = require('./routes/route');
var db = mongoose.connection;

const app = express();
//port no 
const port = 3000;

//connect to mongodb
mongoose.connect('mongodb://localhost:27017/contactlist');

//on connection
db.once('open', function() {
    console.log('connected to mongo')
  });

//mongoose error
db.on('error', console.error.bind(console, 'connection error:'));



//adding middleware - cors
app.use(cors());

//body - parser
app.use(bodyparser.json());

//static files 
app.use(express.static(path.join(__dirname, 'public')));

//routes
app.use('/api', route);

//testing

app.get('/',(req, res)=>{
	res.send('a simple node server');
})

app.listen(port, ()=> {
	console.log('Server started at port:'+port);
})
