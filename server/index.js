const express = require('express');
const app = express();
const path = require('path');
const cors = requier('cors');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const config = require('./config/key');

const {User} = require('./models/User')
const port = 5000;

// req의 application/x-www-form-urlencoded 포멧의 코드를 분석(parse)해주는 역할
// 한마디로 아래 엔드포인트 함수에서 req.body 가능하게 해주
app.use(bodyParser.urlencoded({extended: true}))
// application/json 형태 분석(parse)해주는 역할
app.use(bodyParser.json());

const mongoose = require('mongoose');
mongoose.connect('',
    {
        useNewUrlParser: true, useUnifiedTopology: true,
        useCreateIndex: true, useFindAndModify: false
    })
    .then(() => console.log('@@ mongoDB connected..'))
    .catch(err => console.log('@@ err', err));

app.get('/', (req, res) => res.send('hello world!'));

app.post('/register', (req, res) => {
    // 회원 가입 필요한 정보들 client에서 가져오면
    // 그것들을 db에 넣어준다

    const user = new User(req.body);
    user.save((err, userInfo) => {
        if (err) return res.json({success: false, err})
        return res.status(200).json({success: true})
    });
})

app.listen(port, () => console.log(`running on ${port}`));