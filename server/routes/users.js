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

// auth 미들웨어
router.get('/addToCart', auth, (req, res) => {
    User.findOne({_id: req.user._id}, (err, userInfo) => {
        let duplicate = false;
        console.log('@@ userInfo', userInfo);

        userInfo.cart.forEach((item) => {
            if (item.id === req.query.productId) {
                duplicate = true; // 같은 게 있으면 듀플리케잇으로 처리해서, 같은 걸로 인식하게 해서 수량 증가로 처리하려는 장치인가
            }
        })

        if (duplicate) {
            User.findOneAndUpdate(
                {_id: req.user._id, 'cart.id': req.query.productId},
                {$inc: {'cart.$.quantity': 1}},
                {new: true},
                (err, userInfo) => {
                    if (err) return res.json({success: false, err});
                    res.status(200).json(userInfo.cart)
                }
            )
        } else {
            User.findOneAndUpdate(
                {_id: req.user._id},
                {
                    $push: {
                        cart: {
                            id: req.query.productId,
                            quantity: 1,
                            date: Date.now()
                        }
                    }
                },
                {new: true},
                (err, userInfo) => {
                    if (err) return res.json({success: false, err});
                    res.status(200).json(userInfo.cart)
                }
            )
        }
    })
})

// auth 미들웨어
router.get('/removeFromCart', auth, (req, res) => {
    User.findOneAndUpdate(
        {_id: req.user._id},
        {
            '$pull': {'cart': {'id': req.query._id}} // $pull : 해당 row만 가져오는 건가 봄
        },
        {new: true},
        (err, userInfo) => {
            let cart = userInfo.cart;
            let array = cart.map(item => {
                return item.id
            });

            Product.find({ '_id' : { $in : array} })
                .populate('writer')
                .exec((err, cartDetail) => {
                    return res.status(200).json({
                        cartDetail,
                        cart
                    })
                })
        }
    )
})
module.exports = router;
