// server.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const { enrichIp } = require('./enricher');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());

// static UI (put your built UI in /public)
app.use(express.static(path.join(__dirname, 'public')));

// trust proxy if behind LB (important to get real IP)
app.set('trust proxy', true);

function getClientIp(req){
  // prefer X-Forwarded-For left-most value
  const xf = req.headers['x-forwarded-for'];
  if (xf) return xf.split(',')[0].trim();
  return req.ip || req.connection.remoteAddress;
}

app.get('/api/visit-report', async (req, res) => {
  try {
    const ip = getClientIp(req);
    if (!ip) return res.status(400).json({ error: 'Unable to determine IP' });

    // TODO: add caching (Redis) and rate limiting here
    const report = await enrichIp(ip);
    // For public display, consider masking: report.ip = maskIp(report.ip)
    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal error' });
  }
});

// fallback to index
app.get('*', (req,res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, ()=>console.log(`IP-Dibia listening on ${PORT}`));
