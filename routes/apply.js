var express = require('express');
var router = express.Router();

// home page
router.get('/', function(req, res, next) {
    res.render('apply', { title: 'Account Information' });
});


module.exports = router;
