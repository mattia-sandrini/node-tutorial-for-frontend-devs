var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//var monk = require('monk');
//var db = monk('localhost:27017/nodetest1');

var indexRouter = require('./routes/index');
//var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Make our db accessible to our router
/*app.use(function(req,res,next){
    req.db = db;
    next();
});*/

app.use('/', indexRouter);
//app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


app.locals.device_list = [
  {
      id: "ENGIETEST",
      content: {
          id: "c1",
          type: "multiple-message",
          timestamp_creation: 1576160838,       
          timestamp_expiration: 1576954800, 
          timestamp_last_update: 1576160947,     
          bodies: [
              "<p  style=\"font-size: 40px; font-family: 'Courier New'\">Questo è il primo messaggio di una serie di 3 messaggi.</p>",
              "<p style=\"color: #E74C3C; font-size: 40px; font-family: 'Courier New'\">Questo è il secondo messaggio, che a differenza del primo possiede una <span style=\"color: #2980B9; font-family: sans-serif\"><b><i>formattazione</i></b></span> del testo.</p>",
              "<p style=\"font-size: 40px; font-family: 'Courier New'\">L'ultimo messaggio dimostra il funzionamento di **lampeggio** del testo.</p>"
          ],
          rolling_interval: 10 
      },
      last_heartbeat: null
  },
  {
      id: "ENGIEPMVTEST",
      content: {
          id: "c2",
          type: "single-message",
          timestamp_creation: 1576160838,       
          timestamp_expiration: 1576954800, 
          timestamp_last_update: 1576160947,     
          body: "<p style=\"color: #E74C3C; font-size: 25px; font-family: 'Courier New'\">Messaggio visualizzato su <span style=\"color: #2980B9; font-family: sans-serif\"><b><i>**PMV**</i></b></span>!</p><img src='https://www.engie.it/ENGIEit-theme/img/new-logo-blu.png' height='40px' width='auto' style='margin-right: 10px;' />",
      },
      last_heartbeat: null
  }
];

app.locals.logs = new Array();
app.locals.logs["ENGIETEST"] = [];
app.locals.logs["ENGIEPMVTEST"] = [];

// Ogni secondo controllo se c'è qualche dispositivo in stallo
setInterval(function() {
  app.locals.device_list.forEach(device => {
    current_timestamp = Math.round(Date.now()/1000);
    if (current_timestamp - device.last_heartbeat > 30) // Se non ricevo un heartbeat da più di 30 secondi
      device.status = "stale";                          // Imposto lo stato a "stale" 
  });
}, 1000);

// Svuoto parzialmente la pila di log ogni 10 secondi
setInterval(function() {
  for (var id in app.locals.logs) {
    while (app.locals.logs[id].length > 100)
      app.locals.logs[id].shift();              // Cancello il messaggio più vecchio (quello in testa all'array)
  }
}, 10000);

module.exports = app;
