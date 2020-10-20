const express = require('express');
const router = express.Router();
const {Product} = require('../models/Product');
const multer = require('multer');

const {auth} = require('../middleware/auth');

var storage = multer.diskStoarge({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname) // extend 확장자
        if (ext !== '.jpg' || ext !== '.png') {
            return cb(res.status(400).end('only jpg, png are allowed'), false);
        }
        cb(null, true)
    }
})

var upload = multer({storage: storage}).single('file');
module.exports = router;