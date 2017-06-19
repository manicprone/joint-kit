const express = require('express');
const bodyParser = require('body-parser');
const serverConfig = require('./server-config');
const bookshelf = require('./services/bookshelf');
const modelConfig = require('./engine/models/model-config');
const methodConfig = require('./engine/methods/method-config');
const JointEngine = require('./engine');
const apiRoutes = require('./modules');

const app = express();

// -----------------------------------------
// Add support for parsing form post data...
// -----------------------------------------
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ---------------------
// Start Joint Engine...
// ---------------------
new JointEngine({
  serviceKey: 'bookshelf',
  service: bookshelf,
  modelConfig,
  methodConfig,
}).start();

// ----------------------
// Load engine modules...
// ----------------------
const apiBaseUri = serverConfig.api.path.root +
                   serverConfig.api.path.version;
app.use(apiBaseUri, apiRoutes);
app.disable('view cache');

// -----------------
// Serve requests...
// -----------------
app.get('*', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send('Spin up a data service with joints.');
});

// ---------------
// Start server...
// ---------------
const host = 'localhost';
const port = serverConfig.api.port;
app.listen(port, () => {
  console.info('====================================================');
  console.info(`Joint Engine Server started on ${host}:${port}`);
  console.info('====================================================');
  console.info('');
});
