const express = require('express');
const router = express.Router();
const {User} = require('../models/User');
const {Product} = require('../models/Product');
const {auth} = require('../models/auth');
const {Payment} = require('../models/Payment');

const async = require('async');

// auth 미들웨어 : login 토큰이 있어야 하는 경우
router.get('/auth', auth, (req, res) => {
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true,
        isAUth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image,
        cart: req.user.cart,
        history: req.user.history,
    })
});

router.post('/register', (req, res) => {
    const user = new User(req.body); // register이므로 새로 생성

    user.save((err, doc) => { // doc의 개념
        if (err) return res.json({success: false, err});
        return res.status(200).json({
            success: true
        })
    })
});

router.post('/login', (req, res) => {
    User.findOne({email: req.body.email}, (err, user) => {
        if (!user) {
            return res.json({
                loginSuccess: false,
                message: 'Auth failed, email not found'
            });
        }

        user.comparePassword(req.body.password, (err, isMatch) => {
            if (!isMatch)
                return res.json({loginSuccess: false, message: 'wrong password'});

            user.generateToken((err, user) => {
                if (err) return res.status(400).send(err);
                res.cookie('w_authExp', user.tokenExp);
                res
                    .cookie('w_auth', user.token)
                    .status(200)
                    .json({
                        loginSuccess: true, userId: user._id
                    })
            })
        })
    })
});

// auth 미들웨어
router.post('/logout', auth, (req, res) => {
    User.findOneAndUpdate({_id: req.user._id}, {token: "", tokenExp: ""}, (err, doc) => {
        if (err) return res.json({success: false, err});
        return res.status(200).send({
            success: true
        })
    })
})
module.exports = router;
