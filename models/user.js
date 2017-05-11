const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const config = require('../config/database');

// User Schema
const UserSchema = mongoose.Schema({
    name: {
        type: String
    },
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    readLevel: {
        type: Number,
        default: 0
    },
    writeLevel: {
        type: Number,
        default: 0
    },
    adminLevel: {
        type: Number,
        default: 0
    }
    
});

const User = module.exports = mongoose.model('User', UserSchema);

module.exports.getUserById = function(id, callback){
    User.findById(id, callback);
}

module.exports.getUserByUsername = function(username, callback){
    const query = {username: username};
    User.findOne(query, callback);
}

module.exports.addUser = function(newUser, callback){
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
            if(err) throw err;
            newUser.password = hash;
            newUser.save(callback);
        });
    });
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
        if(err) throw err;
        callback(null, isMatch);
    });
}

module.exports.getReadAccessible = function(accUser, page_id, callback){
    callback = !!(accUser.readLevel & 1 << page_id);
}

module.exports.setReadAccessible = function(accUser, page_id, accessible, callback){
    accUser.readLevel = accUser.readLevel.toString(2);  // base 2 number
    accUser.readLevel = accUser.readLevel.split('').reverse().join(''); // string reverse

    accUser.readLevel[page_id] = accessible;

    accUser.readLevel = accUser.readLevel.split('').reverse().join(''); // string reverse
    accUser.readLevel = accUser.readLevel.toString(10);  // base 10 number

    accUser.save(callback);
}
