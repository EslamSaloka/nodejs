const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const socket = require('socket.io');
const http = require('http');


const app = express();

// Passport Config
require('./config/passport')(passport);

//DB Config
const db = require('./config/keys').MongoURL;
mongoose.connect(db,{useNewUrlParser:true})
.then( () => console.log('MongooDb Conneacted'))
.catch( err => console.log(err) );


//EJS
app.use(expressLayouts);
app.set('view engine', 'ejs')



// Express body parser
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});



//Routes
app.use('/',require('./routes/index'));
app.use('/users',require('./routes/user'));
//Port
const PORT = process.env.PORT || 3000;

//Listen
server = app.listen(PORT, console.log(`Server Started On Port ${PORT}`));



// chat Sokiet.io
const chat = require('./models/chat');
const io = socket(server);
io.on('connection',(socket)=>{
  // get all message from data base
  chat.find({}, function(err, users) {
    var userchat = {};
    users.forEach(function(user) {
      userchat[user._id] = user;
    });
    io.sockets.emit("output",users);
  });
  // show message
  socket.on("chat",function(data) {
    io.sockets.emit("chat",data);
  });
  // insert message in database
  socket.on("input",function(data) {
    let name    = data.name;
    let message = data.message;
    const newMessage = new chat({
      name,
      message
    });
    newMessage.save()
    io.sockets.emit("chat",data);
  });
});


/**
 * Client Server ( TCP SERVER ) 

const net = require('net');
const client = new net.Socket();

// client.connect(POSR,URL,FUNCTION_CALLBACK);
client.connect(1337, '127.0.0.1', function() {
	console.log('Connected');
	client.write('Welcome Client.');
});


client.on('data', function(data) {
	console.log('look: ' + data);
	client.destroy(); 
});

client.on('close', function() {
	console.log('Connection closed');
});

 */

