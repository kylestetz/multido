// junk
var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var nunjucks = require('nunjucks');

var MongoClient = require('mongodb').MongoClient;


// b-ify
var browserify = require('browserify');
var watchify = require('watchify');
var fs = require('fs');

// app & sockets
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// view engine setup
var env = new nunjucks.Environment(
  new nunjucks.FileSystemLoader(__dirname + '/views'),
  {
    dev: true,
    autoescape: true
  }
);
env.express(app);

env.addFilter('json', function(data) {
  return JSON.stringify(data);
});

// config
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(require('less-middleware')({ src: path.join(__dirname, 'public') }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.render('error.html', {
            message: err.message,
            error: err
        });
    });
}

// ===================================================================
//                          BROWSERIFY
// ===================================================================

var b = browserify({ cache: {}, packageCache: {}, fullPaths: true });
var w = watchify(b, { 'opts.basedir': './public/js/modules/' });
// add our master _site file
w.add('./public/js/modules/site.js');
// create the bundled file

function bundleAssets(cb) {
  w.bundle( function(err, output) {
    if(err) {
      console.error('There was an issue running browserify!');
      console.error(err);
      return cb && callback(err);
    }

    // write our new file to the public/js folder
    fs.writeFile('./public/js/_site.js', output, function (err) {
      if(err) {
        console.error('There was an error saving the freshly-bundled front end code.');
        console.error(err);
        return cb && callback(err);
      }
      console.log('Recompiled assets.');
      return cb && cb(null);
    });
  });
}

w.on('update', function(ids) {
  bundleAssets();
});

bundleAssets();


MongoClient.connect('mongodb://127.0.0.1:27017/multido', function(err, db) {
  if(err) throw err;

  require('./routes/index')(app, io, db);

  http.listen(process.env.PORT || 3000, function(){
    console.log('listening on *:3000');
  });

});



module.exports = app;
