const mongoose = require('mongoose'); // auth에서만 필요한가?
const bcrypt = require('bcrypt');
const slatRounds = 10; // ?
const jwt = require('jsonwebtoken');
const moment = require('moment');

const userSchema = mongoose.Schema({
    name: {
        type:String,
        maxlength:50
    },
    email: {
        type:String,
        trim:true, // 문자열 값에서 공백 지워주는 역할
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type:String,
        maxlength: 50
    },
    role : {
        type:Number,
        default: 0
    },
    image: String,
    token : {
        type: String,
    },
    tokenExp :{ // 토큰 유효기간
        type: Number
    }
});

const User = mongoose.model('User', userSchema);

module.exports = { User }