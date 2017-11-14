var express = require('express');
var router = express.Router();

// home page
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Account Information' });
});

router.get('/grid',function(req,res,next){
    res.render('grid')
})

module.exports = router;
