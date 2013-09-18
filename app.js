var restify = require('restify'),
	server = restify.createServer({ name: 'vagner-api' }),
	fs = require('fs');

// Starting Server
server.listen(3000, function(){
	console.log('%s listening at %s', server.name, server.url);
});

// Plugins to fix some issues on restify
server
	// Allow the use of POST
	.use(restify.fullResponse())
	// Maps req.body to req.params
	.use(restify.bodyParser());

/* ===================== DataBase ======================= */
var Mongoose = require('Mongoose');
var Schema = Mongoose.Schema;
var db = Mongoose.connection;

db.on('error', console.error);
db.once('open', function() {
	console.log('Conectado ao MongoDB.');

});

Mongoose.connect('mongodb://localhost/test');

/* ===================== Application ======================= */
var user = require('./models/user.js');

// Auth
server.post('/auth', function(req, res, next){
	if(req.params.email === undefined || req.params.password === undefined){
		return next(new restify.InvalidArgumentError('Usuário ou senha em branco.'));
	}

	user.auth(req, res, restify);
});

// Get all users
server.get('/user', function(req, res, next){
	user.list(req, res);
});

// Get a user by email
server.get('/user/:email', function (req, res, next) {
	user.listOne(req, res, restify);
});

// Add new user
server.post('/user/add', function(req, res, next){
	if(req.params.name === undefined || req.params.email === undefined || req.params.password === undefined){
		return next(new restify.InvalidArgumentError('Dados insuficientes.'));
	}

	user.add(req, res, restify);
});

// Remove user by email
server.post('/user/del', function(req, res, next){
	if(req.params.email === undefined){
		return next(new restify.InvalidArgumentError('Nome precisa ser informado.'));
	}

	user.remove(req, res, restify);
});

// Follow a user
server.post('/follow', function(req, res, next){
	if(req.params.email === undefined || req.params.follow === undefined){
		return next(new restify.InvalidArgumentError('Dados insuficientes.'));
	}

	user.follow(req, res, restify);
});


// See common friend of two users
server.post('/friendship', function(req, res, next){
	if(req.params.email === undefined || req.params.friend === undefined){
		return next(new restify.InvalidArgumentError('Dados insuficientes.'));
	}

	user.friendship(req, res, restify);
});

// Simple view for test upload images
server.get('/img', function(req, res){
	var body =
		'<form method="post" enctype="multipart/form-data" action="/img">' +
		'<p><input type="file" multiple name="uploadfile" /></p>' +
		'<p><input type="text" name="email" placeholder="email" /></p>' +
		'<p><input type="submit" value="GO" /></p>' +
		'</form>';

	res.writeHead(200, {
		'Content-Length': Buffer.byteLength(body),
		'Content-Type': 'text/html'
	});
	res.write(body);
	res.end();
});

// Upload images (just for users registered)
server.post('/img', function(req, res, next){
	if(req.params.email === undefined){
		return next(new restify.InvalidArgumentError('Dados insuficientes.'));
	}

	user.imageUpload(req, res, restify, fs);
});