const express = require('express');
const path = require('path');
const compression = require('compression');
const zlib = require('node:zlib');
// App and preferences
const version = '1.0.0';
const port = 8040;
const app = express();
// Log
console.log(`${(new Date()).toISOString()} | guillaumebeaulieu.com v${version} | Starting server and proxy`);
// Ensure responses are compressed through this midleware
app.use(compression({
  level: zlib.constants.Z_BEST_COMPRESSION,
}));
// URL definitions
app.use('/assets', express.static(path.join(__dirname, '../../assets'), { // Serve static files
  maxAge: '864000000' // 10 days caching for app assets
}));
app.get('/tree', (req, res) => {
  console.log(`${(new Date()).toISOString()} | guillaumebeaulieu.com v${version} | tree.html page requested`);
  res.sendFile(path.join(__dirname, '../../assets/html/tree.html'));
});
app.get('/', (req, res) => {
  console.log(`${(new Date()).toISOString()} | guillaumebeaulieu.com v${version} | index.html page requested`);
  res.sendFile(path.join(__dirname, '../../assets/html/index.html'));
});
// Start server console
app.listen(port, () => {
  console.log(`${(new Date()).toISOString()} | guillaumebeaulieu.com v${version} | Server started and listening on port ${port}`);
});
