const express = require('express');
const bodyParser = require('body-parser');
const serverConfig = require('./config/server-config');
const bookshelf = require('./services/bookshelf');
const modelConfig = require('./engine/config/model-config');
const actionConfig = require('./engine/config/action-config');
const jointEngineUtils = require('./engine/engine-utils');
const JointEngine = require('./engine/joint-engine');
const apiRoutes = require('./modules');

const app = express();

// -----------------------------------------
// Add support for parsing form post data...
// -----------------------------------------
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --------------------------
// Initialize Joint Engine...
// --------------------------
JointEngine.serviceKey = 'bookshelf';
JointEngine.service = bookshelf;
JointEngine.modelRegistry = jointEngineUtils.registerModels(bookshelf, modelConfig);
JointEngine.actionRegistry = jointEngineUtils.registerActions(actionConfig);
console.log('[SERVER] JointEngine =>', JointEngine);

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
const port = serverConfig.api.port;
app.listen(port, () => {
  console.info('======================================');
  console.info(`joint server started on localhost:${port}`);
  console.info('======================================');
  console.info('');
});
