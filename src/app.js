const compression = require('compression');
const express = require('express');
const { default: helmet } = require('helmet');
const morgan = require('morgan');
// const { checkOverload } = require('./helpers/check.connect');

require('dotenv').config();

const app = express();

// init middlewares
app.use(morgan('common'));
app.use(helmet());
app.use(compression());

// init db
require('./databases/init.mongodb');

// checkOverload();

// init router
app.get('/', (req, res, next) => {
  return res.status(200).json({
    message: 'Hello World',
  });
});

// handle errors

module.exports = app;
