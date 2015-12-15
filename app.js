'use strict';

var app = require('koa')(),
		logger = require('koa-logger'),
		serve = require('koa-static'),
		router = require('koa-router')(),
		views = require('koa-views'),
		favicon = require('koa-favicon'),
		cors = require('koa-cors'),
		port = process.env.PORT || 3333;

require('dotenv').config({silent: true});

var cache_age = process.env.NODE_ENV == 'production' ? 86400000 : 0;
var index_file = process.env.NODE_ENV == 'production' ? 'cdn/index' : 'index';


app.use(cors());
app.use(serve('public', {defer: true, maxage: cache_age}));
app.use(logger());
app.use(views('public', {
	default: 'jade'
}));
app.use(favicon(__dirname + '/public/favicon.ico'));

// pass env vars to app
app.use(function *(next){
  this.state.env = {
  	node_env: process.env.NODE_ENV,
  	elasticsearch_url: process.env.ELASTICSEARCH_URL,
  	proxy_url: process.env.PROXY_URL,
  	cdn_url: process.env.CDN_URL
  };
  yield next;
});

app.use(router.routes());

router.get('/', function *(){
	yield this.render(index_file);
});

router.get('/:everything', function *(){
	yield this.render(index_file);
});

app.listen(port, function(){
	console.log('Node app is running on port', port);
});
