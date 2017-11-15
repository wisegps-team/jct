var express = require('express');
var router = express.Router();
var addr = require('./_areaData')

// home page
console.log(addr)
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Account Information' });
});

router.get('/get_depart', function (req, res, next) {
    // res.render('grid')
    var db = req.con;
    var query = req.query.data;

    var sql = 'SELECT * FROM ga_depart  WHERE  id > 0' ;
    db.query(sql, function (err, rows) {
        var data = rows;
        // var dd = {
        //     data: data,
        // }
        res.json(rows)
    });
    // res.json({dd:1})
})

router.get('/address',function(req,res,next){
    res.json(addr)
})


// router.get('/get_left',function(req,res,next){

// })

// router.get('./')
module.exports = router;
