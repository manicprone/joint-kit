import express from 'express';
import Responder from '../../handlers/response-handler';

const router = express.Router(); // eslint-disable-line new-cap

router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:333');
  res.header('Access-Control-Allow-Methods', 'HEAD, GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Credentials', true);
  next();
});

// --------------------------------------------- /app

router.route('/app')
  .get((req, res) => {
    const data = { message: 'yo!' };
    Responder.handleDataResponse('app', data, res, 200);
  });

module.exports = router;
