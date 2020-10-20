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


module.exports = router;
