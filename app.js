var express = require('express');

var app = express();

var auth = require('./middleware'); // Custom Middleware to handle authentication

var mongoose = require('mongoose');
// Set default engine

app.set('view engine' , 'ejs');
var sessions= require('client-sessions');
//Middleware
var bodyParser = require('body-parser');
var csrf = require('csurf'); //protect about csrf


//bcrypt 
var bcrypt = require('bcryptjs');
// Use session
app.use(sessions({
	cookieName: 'session',
	secret: 'blargadeeblargblargfryryyryvdgd',
	duration: 24 * 60 * 60 * 1000,
	activeDuration: 1000 * 60 * 5 
}));

//app.use(csrf());

// Create custom middleware
app.use(function(req, res ,next){
	if(req.session && req.session.user){
		User.findOne({username:  req.session.user.username} , function(err , user){
			if(user){
				req.user = user;
				delete req.user.password; // Por seguridad para dejar la password en la sesion aunque este cifrado
				req.session.user = req.user;
				res.locals.user = req.user;
			}
			next();
		});
	}else{
		next();
	}
});

// Assets directory 
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Allows to access req.body
// Connect mongodb
mongoose.connect('mongodb://localhost/users');
//var ObjectId = Schema.ObjectId;
 // Create the Schema
var userSchema = new mongoose.Schema({
	username: {type: String , unique: true },
	firstname: String,
	lastname: String,
	email: {type: String , unique: true },
	password: String,
	createdAt:{ type: Date, default: Date.now }
}, {collection: 'users'});




// Create the model

var User = mongoose.model('User' , userSchema);


// login
app.get('/login', function(req, res){
	// User.find(function(err , users){
	// 	res.json(users)
	// })
	res.render('login' , {title: 'Login page'}); //, csrfToken: req.csrfToken()
});

//register
app.get('/register', function(req, res){
	res.render('register' , {title: 'Register a user' });//, csrfToken: req.csrfToken()
});
app.post('/register', function(req, res){
	var hash = bcrypt.hashSync(req.body.password , bcrypt.genSaltSync(10));
	var user = new User({
	username: req.body.username,
	firstname: req.body.firstname,
	lastname: req.body.lastname,
	email: req.body.email,
	password: hash
});
	user.save( function(err){
		if(err){
			var err = 'Failed to create the user';
			if(err.code === 11000){
				err = 'El email ya existe';
			}
			res.render('register' ,{err: err} );
		}else{
			//res.redirect('/profile' , {title: 'User profile'});
			res.redirect('profile');

		}
		console.log(err);
	});

	//res.render('register' , {title: 'Register a user'});
});


// login
app.post('/login', function(req, res){

	User.findOne({username:req.body.username} , function(err , user ){
		if(!user){
			res.render('login' , {error: 'The user does exist'});

		}else{
			if(bcrypt.compareSync(req.body.password,user.password)){
			// Store session info if the user login is valid
			req.session.user = user;
			res.redirect('/profile');
			}
			else{
				res.render('login' , {error: 'Invalid creadentials'});
			}

		}

		
	});
});
app.get('/profile', auth.requireLogin , function(req, res){
	res.render('profile')
	
});
app.get('/logout', function(req, res){
	req.session.reset();
	res.redirect('/');
});
// Entry point route
app.get('/', function(req, res){
	res.render('default' , {title: 'Auth app with passportJS'});
});

app.listen(3000, function(){
	console.log('Running on port 3000');
});