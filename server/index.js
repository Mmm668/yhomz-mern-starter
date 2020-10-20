const express = require('express');
const app = express();
const path = require('path');
const cors = requier('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config/key');


const mongoose = require('mongoose');
mongoose
    .connect('',
    {
        useNewUrlParser: true, useUnifiedTopology: true,
        useCreateIndex: true, useFindAndModify: false
    })
    .then(() => console.log('@@ mongoDB connected..'))
    .catch(err => console.log('@@ err', err));

app.use(cors())

app.use(bodyParser.urlencoded({extended: true})) // req의 application/x-www-form-urlencoded 포멧의 코드를 분석(parse)해주는 역할 = 아래 엔드포인트 함수에서 req.body 가능하게 해줌
app.use(bodyParser.json()); // application/json 형태 분석(parse)해주는 역할
app.use(cookieParser());

app.use('./api/users', require('./routes/users'));
app.use('./api/product', require('./routes/product'));

//use this to show the image you have in node js server to client (react js)
//https://stackoverflow.com/questions/48914987/send-image-path-from-node-js-express-server-to-react-client
app.use('/uploads', express.static('uploads'));

// Serve static assets if in production
if(process.env.NODE_ENV === 'production'){
    // Set static folder
    app.use(express.static('client/build'));
    // index.html for all page routes
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, "../client", "build", "index.html"));
    });
}

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`running on ${port}`));