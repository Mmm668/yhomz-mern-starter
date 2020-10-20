const mongoose = require('mongoose'); // auth에서만 필요한가?
const bcrypt = require('bcrypt');
const saltRounds = 10; // guess hash algorithm rounds
const jwt = require('jsonwebtoken');
const moment = require('moment');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true, // 문자열 값에서 공백 지워주는 역할
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    cart: {
        type: Array,
        default: []
    },
    history: {
        type: Array,
        default: []
    },
    image: String,
    token: {
        type: String,
    },
    tokenExp: { // 토큰 유효기간 Exp expire
        type: Number
    }
});

// pre?
userSchema.pre('save', function (next) {
    const user = this;

    if (user.isModified('password')) {
        console.log('@@ password changed');
        bcrypt.genSalt(saltRounds, function (err, salt) { // 바꼈다면 재Hash화
            if (err) return next(err);

            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) return next(err); // next(err)
                user.password = hash;
                next();
            })
        })
    } else {
        next();
    }
});

// compoarePassword 후 .pre('save')인가?
// user.js(models)에서 사용함
userSchema.methods.comparePassword = function (plainPassword, cb) { // 기본 인자
    bcrypt.compare(plainPassword, this.password, function (err, isMatch) { // 기본으로 들어오는 인자
        if (err) return cb(err);
        cb(null, isMatch);
    })
}

userSchema.methods.generateToken = function (cb) {
    const user = this;
    const token = jwt.sign(user._id.toHexString(), 'secret') // sign용?(jwt문서참고) token값(Hex) 만들기
    const oneHour = moment().add(1, 'hour').valueOf(); // 유효시간은 1시간으로

    user.tokenExp = oneHour;
    user.token = token;
    user.save(function (err, user) { // save를 왜 여기서? => user.token, user.tokenExp 넣었으니까.
        if (err) return cb(err)
        cb(null, user);
    })
}

userSchema.statics.findByToken = function (token, cb) {
    const user = this;

    jwt.verify(token, 'secret', function (err, decode) { // verify되면 cb값으로 decode인자 보내줌
        user.findOne({"_id": decode, "token": token},
            function (err, user) {
                if (err) return cb(err);
                cb(null, user);
            })
    })
}


const User = mongoose.model('User', userSchema);

module.exports = {User}