const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const logger = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');
const mysql2 = require('mysql2');

const app = express();

const enumList = require('./util/enum.const');

// * disable x-powered-by
app.disable('x-powered-by');

// * enable cors
app.use(cors());

// * env config
if (process.env.NODE_ENV === 'production') dotenv.config({ path: './config/env/.env.prod' });
if (process.env.NODE_ENV === 'development') dotenv.config({ path: './config/env/.env.dev' });
if (process.env.NODE_ENV === 'testing') dotenv.config({ path: './config/env/.env.test' });

// * mysql config
global.dbPool = mysql2.createPool(require('./config/db/mariadb')).promise();

// * view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// * logger setup
logger.token('ko-time', () => new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }));
app.use(
    logger([':method', ':url', ':status', ':remote-addr', ':ko-time'].join('\t| '), {
        skip: (req) => req.originalUrl.includes('/assets/'),
    }),
);

// * parser setup
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
    session({
        secret: 'MYSECRETSESSIONKEY',
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 50 * 60 * 1000,
        },
    }),
);

// * static setup
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// * user session setup
app.use((req, res, next) => {
    res.locals.session_account = req.session.session_account;
    next();
});

// * router setup
app.use('/', require('./routes/index.router'));
app.use('/health', require('./routes/health/health.router'));
app.use('/providers', require('./routes/provider/provider.router'));

// * catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// * error handler
app.use((error, req, res, next) => {
    console.error(error);

    if (error.type && error.type === enumList.ERROR_TYPE.API) {
        res.status(400);
        res.send({ ...error['info'], data: error['data'] });
    } else {
        res.locals.message = error.message;
        res.locals.error = error;
        res.status(error.status || 500);
        res.render('error');
    }
});

module.exports = app;
