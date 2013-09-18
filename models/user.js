var Mongoose = require('Mongoose'),
	Schema = Mongoose.Schema;

var userSchema = new Schema({
	name: {type: String, default: ''},
	email: {type: String, default: ''},
	password: {type: String, default: ''},
	following: {type: Array, default: []},
	images: {type: Array, default: []}
});

var User = Mongoose.model('Users', userSchema);

module.exports = {
	// Registering a new user
	add: function(req, res, restify){
		var newUser = new User({
			name: req.params.name,
			email: req.params.email,
			password: req.params.password,
			following: [],
			images: []
		});

		// Check if this e-mail already exist
		User.findOne({email: req.params.email}, function(err, user){
			if (err) res.send(new restify.InvalidArgumentError(JSON.stringify(err.errors)));

			if(user){
				res.send(new restify.InvalidArgumentError('Este e-mail já está sendo utilizado!'));
			} else {
				newUser.save(function(err, newUser){
					if (err) res.send(new restify.InvalidArgumentError(JSON.stringify(err.errors)));

					res.send(newUser);
				});
			}
		});
	},

	// authorizing a user by email and password
	auth: function(req, res, restify){
		User.findOne({email: req.params.email, password: req.params.password}, function(err, user){
			if (err) res.send(new restify.InvalidArgumentError(JSON.stringify(err.errors)));

			if(user){
				res.send(user);
			} else {
				res.send(new restify.InvalidArgumentError('Usuário ou senha inválidos!'));
			}
		});
	},

	// listing all users
	list: function(req, res) {
		User.find(function(err, users) {
			res.send(users);
		});
	},

	// searching one user by your email
	listOne: function(req, res, restify){
		User.findOne({ email: req.params.email }, function (err, user) {
			if (err) res.send(new restify.InvalidArgumentError(JSON.stringify(err.errors)));

			if (user) {
				res.send(user);
			} else {
				res.send(404);
			}
		});
	},

	// removing user from database by email
	remove: function(req, res, restify){
		User.remove({ email: req.params.email }, function (err) {
			if (err) {
				res.send(new restify.InvalidArgumentError(JSON.stringify(err.errors)));
			} else {
				res.send(200);
			}
		});
	},

	// following a user by your email (just for users registered)
	follow: function(req, res, restify){
		var currentUser = req.params.email,
			userFollow = req.params.follow;

		// check if the current user is registered
		User.findOne({email: currentUser}, function(err, userA){
			if (err) res.send(new restify.InvalidArgumentError(JSON.stringify(err.errors)));

			if(userA){
				// check if the user to follow if registered
				User.findOne({email: userFollow}, function(err, userB){
					if (err) res.send(new restify.InvalidArgumentError(JSON.stringify(err.errors)));

					if(userB){
						// check if this user is already being followed
						if(userA.following.indexOf(userFollow) > -1){
							res.send(new restify.InvalidArgumentError('Usuário já está sendo seguido!'));
						} else{
							// Update in database the array of followings
							User.update({email: currentUser}, {$pushAll: {following: [userFollow]}}, function (err) {
								if (err) {
									res.send(new restify.InvalidArgumentError(JSON.stringify(err.errors)));
								} else {
									res.send(200);
								}
							});
						}
					} else{
						res.send(new restify.InvalidArgumentError('Usuário a ser seguido inexistente!'));
					}
				});
			} else{
				res.send(new restify.InvalidArgumentError('Usuário inexistente/não autenticado!'));
			}
		});
	},

	friendship: function(req, res, restify){
		var currentUser = req.params.email,
			friend = req.params.friend;

		// check if the current user is registered
		User.findOne({email: currentUser}, function(err, userA){
			if (err) res.send(new restify.InvalidArgumentError(JSON.stringify(err.errors)));

			if(userA){
				// check if friend is registered
				User.findOne({email: friend}, function(err, userB){
					if (err) res.send(new restify.InvalidArgumentError(JSON.stringify(err.errors)));

					if(userB){
						// return an array of emails of common friends
						var commonFriends = intersection(userA.following, userB.following);

						// full result: list of emails an number of common friend
						var result = { 'total': commonFriends.length,'commonFriends': commonFriends};

						res.send(result);
					} else{
						res.send(new restify.InvalidArgumentError('Usuário a ser seguido inexistente!'));
					}
				});
			} else{
				res.send(new restify.InvalidArgumentError('Usuário inexistente/não autenticado!'));
			}
		});
	},

	imageUpload: function(req, res, restify, fs){
		var tempPath = req.files.uploadfile.path;
		var savePath = './public/images/' + req.files.uploadfile.name;

		// check if the current user is registered
		User.findOne({email: req.params.email}, function(err, user){
			if (err) res.send(new restify.InvalidArgumentError(JSON.stringify(err.errors)));

			if(user){
				// if file exist and upload is ok
				if(tempPath){
					// send file to final folder
					fs.rename(tempPath, savePath, function(error){
						if(error) throw error;

						// remove the temporary file
						fs.unlink(tempPath, function(){
							if(error) throw error;

							// Update on database: insert the new file on user doc
							User.update({email: req.params.email}, {$pushAll: {images: [savePath]}}, function (err) {
								if (err) {
									res.send(new restify.InvalidArgumentError(JSON.stringify(err.errors)));
								} else {
									res.send("File uploaded to: " + savePath);
								}
							});
						});
					});
				} else{
					res.send(new restify.InvalidArgumentError('Arquivo não encontrado'));
				}
			} else{
				res.send(new restify.InvalidArgumentError('Usuário inexistente/não autenticado!'));
			}
		});
	}
};

/* ===================== Helpers ======================= */

/* funciton to get the intersection of two arrays,
	found in:
	http://stackoverflow.com/questions/1885557/simplest-code-for-array-intersection-in-javascript
*/
function intersection(a, b){
	var ai=0, bi=0;
	var result = [];

	while( ai < a.length && bi < b.length ) {
		if (a[ai] < b[bi]){
			ai++;
		} else if (a[ai] > b[bi] ){
			bi++;
		} else { /* they're equal */
			result.push(a[ai]);
			ai++;
			bi++;
		}
	}
	return result;
}