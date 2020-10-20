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

//=================================
//             Product
//=================================

router.post('/uploadImage', auth, (req, res) => {
    upload(req, res, err => {
        if (err) {
            return res.json({success: false, err})
        }
        return res.json({success: true, image: res.req.file.path, fileName: res.req.file.filename})
    })
});

router.post('/uploadProduct', auth, (req, res) => {
    //save all the data we got from the client into the DB
    const product = new Product(req.body);

    product.save((err) => {
        if (err) return res.status(400).json({success: false, err})
        return res.status(200).json({success: true})
    })
})

// [model].find 와 [model].findOneAndUpdate 쓰임새, 차이점
// find안에의 $in, populate()
// result list 정렬 
router.post('/getProducts', (req, res) => {
    let order = req.body.order ? req.body.order : 'desc';
    let sortBy = req.body.sortBy ? req.body.sortBy : '_id';
    let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    let skip = parseInt(req.body.skip);

    let findArgs = {};
    let term = req.body.searchTerm; // true / false ?

    for (let key in req.body.filters) { // filters는 어떤 형태지, 무튼 findArgs 포매팅
        if (req.body.filters[key].length > 0) {
            if (key === 'price') {
                findArgs[key] = {
                    $gte: req.body.filters[key][0],
                    $lte: req.body.filters[key][1]
                }
            } else {
                findArgs[key] = req.body.filters[key];
            }
        }
    }

    console.log('@@ findArgs');

    if (term) {
        Product.find(findArgs)
            .find({$text: {$search: term}})
            .populate('writer')
            .sort([[sortBy, order]])
            .skip(skip)
            .limit(limit)
            .exec((err, products) => {
                if (err) return res.status(400).json({success: false, err})
                res.status(200).json({success: true, products, postSize: products.length})
            })
    } else {
        Product.find(findArgs)
            .populate('writer')
            .sort([[sortBy, order]])
            .skip(skip)
            .limit(limit)
            .exec((err, products) => {
                if (err) return res.status(400).json({success: false, err})
                res.status(200).json({success: true, products, postSize: products.length})
            })
    }
})

module.exports = router;