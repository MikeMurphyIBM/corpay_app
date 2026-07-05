// server.js — Express entry point
// Serves static assets from /public and exposes /health for Code Engine probes.

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Health check — required by IBM Cloud Code Engine
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Serve all frontend assets from /public
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to index.html for any unmatched route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
