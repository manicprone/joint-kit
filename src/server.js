const express = require('express');
const bodyParser = require('body-parser');
const serverConfig = require('./config/server-config');
const apiRoutes = require('./modules');

const app = express();

// -----------------------------------------
// Add support for parsing form post data...
// -----------------------------------------
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// -------------------
// Load API modules...
// -------------------
const apiBaseUri = serverConfig.api.path.root +
                   serverConfig.api.path.version;
app.use(apiBaseUri, apiRoutes);
app.disable('view cache');

// -----------------
// Serve requests...
// -----------------
app.get('*', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send('Good data, all rolled-up.');
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
