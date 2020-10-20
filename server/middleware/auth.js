const {User} = require('../models/User');

let auth = (req, res, next) => { // next도 기본 props 인가?
    let token = req.cookies.w_auth; // 1.cookie에 토큰 받아오는 구조?  2.w_auth?

    User.findByToken(token, (err, user)=>{
        if(err) throw err;
        if(!user)
            return res.json({
                isAuth: false,
                error: true
            });

        req.token = token;
        req.user = user;
        next();
    })
}

module.exports = { auth };