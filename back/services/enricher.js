// enricher.js
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const {
  IPINFO_TOKEN,
  ABUSEIPDB_KEY,
  IPQS_KEY,
  IPGEO_API_KEY,
  HTTPBL_KEY,
  SPAM_KEY
} = process.env;

export async function enrichIp(ip) {
  const results = await Promise.allSettled([
    ipInfo(ip),
    abuseIPDB(ip),
    ipQualityScore(ip),
    ipGeolocation(ip),
    projectHoneyPot(ip),
    spamIntel(ip),
  ]);

  const data = Object.fromEntries(
    ['ipinfo', 'abuse', 'ipqs', 'ipgeo', 'httpbl', 'spam']
      .map((k, i) => [k, results[i].status === 'fulfilled' ? results[i].value : null])
  );

  const normalized = normalize(ip, data);
  return { ...normalized, raw: data };
}

// ─────────────── PROVIDERS ───────────────
async function ipInfo(ip) {
  const url = `https://ipinfo.io/${ip}?token=${IPINFO_TOKEN}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('ipinfo error');
  return await res.json();
}

async function abuseIPDB(ip) {
  const url = `https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}`;
  const res = await fetch(url, {
    headers: { Key: ABUSEIPDB_KEY, Accept: 'application/json' },
  });
  if (!res.ok) throw new Error('abuseipdb error');
  const data = await res.json();
  return data.data;
}

async function ipQualityScore(ip) {
  const url = `https://ipqualityscore.com/api/json/ip/${IPQS_KEY}/${ip}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('ipqs error');
  return await res.json();
}

async function ipGeolocation(ip) {
  const url = `https://api.ipgeolocation.io/ipgeo?apiKey=${IPGEO_API_KEY}&ip=${ip}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('ipgeo error');
  return await res.json();
}

async function projectHoneyPot(ip) {
  const reversed = ip.split('.').reverse().join('.');
  const url = `https://${HTTPBL_KEY}.${reversed}.dnsbl.httpbl.org`;
  // The Project Honeypot HTTP:BL normally works via DNS queries — here we’ll simulate
  return { simulated: true, query: url };
}

async function spamIntel(ip) {
  const url = `https://api.spamapi.net/check/${ip}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${SPAM_KEY}` },
  });
  if (!res.ok) throw new Error('spamapi error');
  return await res.json();
}

// ─────────────── NORMALIZER ───────────────
function normalize(ip, data) {
  const abuse = data.abuse || {};
  const ipqs = data.ipqs || {};
  const geo = data.ipgeo || {};
  const info = data.ipinfo || {};

  return {
    ip,
    country: geo.country_name || info.country || null,
    region: geo.state_prov || info.region || null,
    city: geo.city || info.city || null,
    org: info.org || geo.organization || null,
    abuseConfidence: abuse.abuseConfidenceScore || null,
    ipqs_fraud_score: ipqs.fraud_score || null,
    proxy: ipqs.proxy || false,
    tor: ipqs.tor || false,
    vpn: ipqs.vpn || false,
    riskScore: Math.max(abuse.abuseConfidenceScore || 0, ipqs.fraud_score || 0),
    summary: summarizeRisk(abuse.abuseConfidenceScore, ipqs.fraud_score)
  };
}

function summarizeRisk(abuse, fraud) {
  const score = Math.max(abuse || 0, fraud || 0);
  if (score > 80) return 'Critical';
  if (score > 50) return 'High';
  if (score > 20) return 'Medium';
  return 'Low';
}
