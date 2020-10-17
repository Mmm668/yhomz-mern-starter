const { User } = require('../models/User');

let auth = (req, res, next) => {
    let token = req.cookies.w_auth;

    User.findByToken(token, (err, user) => {

    })
}