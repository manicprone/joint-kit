import express from 'express';
import Responder from '../../engine/routes/response-handler';

const router = express.Router(); // eslint-disable-line new-cap

router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'HEAD, GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Credentials', true);
  next();
});

// ----------------------------------------------------------------------- /test

router.route('/test')
  .get((req, res) => {
    const data = { type: 'test-data', message: 'nice :)' };
    Responder.handleDataResponse('test-data', data, res, 200);
  });

module.exports = router;
