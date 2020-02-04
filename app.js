
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var note = require('./routes/notes');
var http = require('http');
var path = require('path');
var compass = require('node-compass');

var favicon = require('serve-favicon');
var logger = require('morgan');
var methodOverride = require('method-override');
var session = require('express-session');
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler')

var app = express();
app.engine('html', require('hogan-express'));
// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
//app.use(favicon(path.join(__dirname, '/public/favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: 'enmlEditorSecret'
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(compass({mode: 'compact', comments: true}));

// development only
if ('development' == app.get('env')) {
  app.use(errorHandler());
}

app.get('/', routes.index);
app.get('/oauth', routes.oauth);
app.get('/oauth_callback', routes.oauth_callback);
app.get('/logout', routes.logout);

app.get('/notes', note.listNotes);
app.get('/notes/new', note.newNote);
app.post('/notes', note.createNote);
app.get('/notes/:id', note.showNote);
app.get('/notes/:id/edit', note.editNote);
//app.put('/notes/:id', note.updateNote);
app.post('/notes/:id', note.updateNote);
//app.delete('/notes/:id', note.deleteNote);
app.get('/notes/:id/delete', note.deleteNote);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
