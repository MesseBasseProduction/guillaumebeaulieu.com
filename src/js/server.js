const express = require('express');
const path = require('path');
const compression = require('compression');
const zlib = require('node:zlib');
// App and preferences
const version = '1.0.2';
const port = 8040;
const app = express();
// Log server start
console.log(`${(new Date()).toISOString()} | guillaumebeaulieu.com v${version} | Starting web server`);

// Ensure responses are compressed through this midleware
app.use(compression({
  level: zlib.constants.Z_BEST_COMPRESSION,
}));

// URL callbacks
const biography = (req, res) => {
  console.log(`${(new Date()).toISOString()} | guillaumebeaulieu.com v${version} | 200 ${req.originalUrl} page requested, return biography.html`);
  res.sendFile(path.join(__dirname, '../../assets/html/biography.html'));
};
const programs = (req, res) => {
  console.log(`${(new Date()).toISOString()} | guillaumebeaulieu.com v${version} | 200 ${req.originalUrl} page requested, return programs.html`);
  res.sendFile(path.join(__dirname, '../../assets/html/programs.html'));
};
const discography = (req, res) => {
  console.log(`${(new Date()).toISOString()} | guillaumebeaulieu.com v${version} | 200 ${req.originalUrl} page requested, return discography.html`);
  res.sendFile(path.join(__dirname, '../../assets/html/discography.html'));
};
const medias = (req, res) => {
  console.log(`${(new Date()).toISOString()} | guillaumebeaulieu.com v${version} | 200 ${req.originalUrl} page requested, return medias.html`);
  res.sendFile(path.join(__dirname, '../../assets/html/medias.html'));
};
const links = (req, res) => {
  console.log(`${(new Date()).toISOString()} | guillaumebeaulieu.com v${version} | 200 ${req.originalUrl} page requested, return links.html`);
  res.sendFile(path.join(__dirname, '../../assets/html/links.html'));
}

// URL definitions
app.use('/assets', express.static(path.join(__dirname, '../../assets'), { // Serve static files
  maxAge: '864000000' // 10 days caching for app assets
}));

// Page urls
const biographyPage = ['/', '/biography', '/biographie', '/biografia'];
for (let i = 0; i < biographyPage.length; ++i) {
  app.get(biographyPage[i], biography);
}

const programsPage = ['/programs', '/programmes', '/programas'];
for (let i = 0; i < programsPage.length; ++i) {
  app.get(programsPage[i], programs);
}

const discographyPage = ['/discography', '/discographie', '/diskographie', '/discografia'];
for (let i = 0; i < discographyPage.length; ++i) {
  app.get(discographyPage[i], discography);
}

const mediasPage = ['/medias', '/medien', '/medios', '/midia'];
for (let i = 0; i < mediasPage.length; ++i) {
  app.get(mediasPage[i], medias);
}

const linksPage = ['/links', '/liens', '/enlaces', '/ligacoes'];
for (let i = 0; i < linksPage.length; ++i) {
  app.get(linksPage[i], links);
}
// 404
app.use((req, res) => {
  console.log(`${(new Date()).toISOString()} | guillaumebeaulieu.com v${version} | 404 ${req.originalUrl} page requested`);
  res.status(404).sendFile(path.join(__dirname, '../../assets/html/404.html'));
});

// Start server console
app.listen(port, () => {
  console.log(`${(new Date()).toISOString()} | guillaumebeaulieu.com v${version} | Server started and listening on port ${port}`);
});
