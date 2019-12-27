/* eslint-disable no-process-env, no-unused-vars, no-undef, no-console */
const express = require('express');
const expressOasGenerator = require('express-oas-generator');
const path = require('path');

const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');


const app = express();

// expressOasGenerator.init(
//     app,
//     function(spec) { return spec; },
//     'swagger.json',
//     60 * 1000
// )
expressOasGenerator.handleResponses(app, {
  predefinedSpec(spec) {
    return spec;
  },
  specOutputPath: './test_spec.json',
});
const subpath = express();

const argv = require('minimist')(process.argv.slice(2));

app.use('/v1', subpath);

const swagger = require('swagger-node-express');
const routes = require('./routes/routes');

/* SwaggerUI configuration */
swagger.setAppHandler(subpath);

app.use(express.static('dist'));

swagger.setApiInfo({
  title: 'example API',
  description: 'API to do something, manage something...',
  termsOfServiceUrl: '',
  contact: 'yuhangu@seas.upenn.edu',
  license: '',
  licenseUrl: '',
});

swagger.configureSwaggerPaths('', 'api-docs', '');

// Configure the API domain
let domain = 'localhost';
if (argv.domain !== undefined) {
  domain = argv.domain;
} else {
  console.log('No --domain=xxx specified, taking default hostname "localhost".');
}

// Configure the API port
let port = 3000;
if (argv.port !== undefined) {
  port = argv.port;
} else {
  console.log(`No --port=xxx specified, taking default port ${port}.`);
}


// Set and display the application URL
const applicationUrl = `http://${domain}:${port}`;
console.log(`snapJob API running on ${applicationUrl}`);


swagger.configure(applicationUrl, '1.0.0');

// subpath.get('/', function (req, res) {
//   res.sendFile(__dirname + '/dist/index.html');
// });
/* End of swagger configuration */

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json({ limit: '10000kb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
}));

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  if (req.app.get('env') === 'development') {
    res.locals.error = err;
  } else {
    res.locals.error = {};
  }

  res.status(err.status || 500);
  res.render('error');
  // console.log(next);
});

// app.use(function(err, req, res, next) {
//     console.log(err.message);
// });

app.use('/', routes);

// app.use(function(req,res){
//     res.status(403).render('404.jade');
// });

expressOasGenerator.handleRequests();
app.listen(process.env.PORT || 3000, () => {
  console.log('Listening on port 3000!');
});

module.exports = app;
