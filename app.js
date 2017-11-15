var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ejs = require('ejs');

var _index = require('./routes/index');
var apply = require('./routes/apply');
// var oil_stat = require('./routes/oil_stat');
// var trip_stat = require('./routes/trip_stat');
// var trip_record = require('./routes/trip_record')
// // DataBase 
var mysql = require("mysql");

var con = mysql.createConnection({
    host: "582c1a40635ca.sh.cdb.myqcloud.com",
    port:'5079',
    user: "ruian",
    password: "ruian123",
    database: "ruian"
});

con.connect(function(err) {
    if (err) {
        console.log('connecting error');
        return;
    }
    console.log('connecting success');
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');
app.engine('html',ejs.__express);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
    req.con = con;
    next();
});

app.use('/',_index);
app.use('/apply',apply);
// app.use('/grid',_index)
// app.use('/trip_record',trip_record);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//     var err = new Error('Not Found');
//     err.status = 404;
//     next(err);
// });

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
