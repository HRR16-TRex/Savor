var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	userID: {
		type: String,
		default: '',
		unique: true,
	},
	userAvatar: {
		type: String,
		default: '',
	},
	username: {
		type: String,
		default: '',
		unique: true
	},
	meals: {
		type: Array
	},
	friends: {
		type: Array
	}
});

var User = mongoose.model('User', userSchema);

module.exports = User;
