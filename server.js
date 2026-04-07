const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: ['https://bloodbank-app-6a91a.web.app', 'http://localhost:3000']
}));
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const users = [
  { id: 1, username: 'demo', email: 'demo@bloodnet.app', password: 'demo123' }
];

let donors = [
  {
    id: 1,
    name: 'Arun Kumar',
    phone: '+91 98765 11111',
    email: 'arun@example.com',
    blood_type: 'O+',
    lat: 13.0412,
    lng: 80.2341,
    city: 'Chennai',
    available: true,
    last_donation: '2025-12-05'
  },
  {
    id: 2,
    name: 'Priya N',
    phone: '+91 98765 22222',
    email: 'priya@example.com',
    blood_type: 'A+',
    lat: 13.0618,
    lng: 80.2503,
    city: 'Chennai',
    available: true,
    last_donation: '2026-01-18'
  },
  {
    id: 3,
    name: 'Rahul S',
    phone: '+91 98765 33333',
    email: 'rahul@example.com',
    blood_type: 'B+',
    lat: 13.0852,
    lng: 80.2214,
    city: 'Chennai',
    available: false,
    last_donation: '2025-11-22'
  }
];

const bloodBanks = [
  {
    id: 1,
    name: 'Chennai Central Blood Bank',
    address: 'Anna Salai, Chennai',
    phone: '+91 44 2222 1111',
    hours: '24/7',
    lat: 13.0569,
    lng: 80.2425,
    inventory: [
      { blood_type: 'O+', quantity: 24 },
      { blood_type: 'A+', quantity: 18 },
      { blood_type: 'B+', quantity: 16 },
      { blood_type: 'AB+', quantity: 7 }
    ]
  },
  {
    id: 2,
    name: 'Lifeline Blood Center',
    address: 'Nungambakkam, Chennai',
    phone: '+91 44 3333 4444',
    hours: '8:00 AM - 10:00 PM',
    lat: 13.0674,
    lng: 80.2376,
    inventory: [
      { blood_type: 'O-', quantity: 6 },
      { blood_type: 'A-', quantity: 5 },
      { blood_type: 'B-', quantity: 4 },
      { blood_type: 'AB-', quantity: 3 }
    ]
  },
  {
    id: 3,
    name: 'Apollo Blood Services',
    address: 'Greams Road, Chennai',
    phone: '+91 44 2829 3333',
    hours: '24/7',
    lat: 13.0616,
    lng: 80.2496,
    inventory: [
      { blood_type: 'O+', quantity: 11 },
      { blood_type: 'A+', quantity: 9 },
      { blood_type: 'B+', quantity: 8 },
      { blood_type: 'AB+', quantity: 4 }
    ]
  },
  {
    id: 4,
    name: 'Government Stanley Blood Bank',
    address: 'Old Jail Road, Chennai',
    phone: '+91 44 2528 1355',
    hours: '24/7',
    lat: 13.1039,
    lng: 80.2934,
    inventory: [
      { blood_type: 'O+', quantity: 20 },
      { blood_type: 'A+', quantity: 15 },
      { blood_type: 'B+', quantity: 12 },
      { blood_type: 'AB+', quantity: 6 }
    ]
  },
  {
    id: 5,
    name: 'Adyar Red Cross Blood Center',
    address: 'LB Road, Adyar, Chennai',
    phone: '+91 44 2491 5885',
    hours: '7:00 AM - 9:00 PM',
    lat: 13.0067,
    lng: 80.2573,
    inventory: [
      { blood_type: 'O-', quantity: 7 },
      { blood_type: 'A-', quantity: 6 },
      { blood_type: 'B-', quantity: 5 },
      { blood_type: 'AB-', quantity: 2 }
    ]
  },
  {
    id: 6,
    name: 'Kilpauk Medical Blood Bank',
    address: 'Poonamallee High Road, Kilpauk',
    phone: '+91 44 2641 1444',
    hours: '24/7',
    lat: 13.0826,
    lng: 80.2411,
    inventory: [
      { blood_type: 'O+', quantity: 14 },
      { blood_type: 'A+', quantity: 13 },
      { blood_type: 'B+', quantity: 10 },
      { blood_type: 'AB+', quantity: 5 }
    ]
  },
  {
    id: 7,
    name: 'OMR Community Blood Hub',
    address: 'Sholinganallur, Chennai',
    phone: '+91 44 4210 7788',
    hours: '8:00 AM - 8:00 PM',
    lat: 12.9010,
    lng: 80.2279,
    inventory: [
      { blood_type: 'O+', quantity: 9 },
      { blood_type: 'A+', quantity: 8 },
      { blood_type: 'B+', quantity: 7 },
      { blood_type: 'AB+', quantity: 3 }
    ]
  }
];
const hospitals = [
  {
    id: 1,
    name: 'Rajiv Gandhi Government General Hospital',
    address: 'Park Town, Chennai',
    phone: '+91 44 2530 5000',
    hours: '24/7 Emergency',
    lat: 13.0827,
    lng: 80.2752
  },
  {
    id: 2,
    name: 'Apollo Hospitals',
    address: 'Greams Road, Chennai',
    phone: '+91 44 2829 3333',
    hours: '24/7',
    lat: 13.0618,
    lng: 80.2514
  },
  {
    id: 3,
    name: 'MIOT International',
    address: 'Manapakkam, Chennai',
    phone: '+91 44 4200 2288',
    hours: '24/7',
    lat: 13.0164,
    lng: 80.1857
  },
  {
    id: 4,
    name: 'Government Stanley Medical College Hospital',
    address: 'Old Jail Road, Chennai',
    phone: '+91 44 2528 1355',
    hours: '24/7 Emergency',
    lat: 13.1010,
    lng: 80.2921
  }
];

const deliveryRequests = [];
const activeTokens = new Map();

function distanceKm(lat1, lng1, lat2, lng2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function withDistance(items, lat, lng) {
  return items
    .map((item) => ({
      ...item,
      distance: distanceKm(lat, lng, item.lat, item.lng)
    }))
    .sort((a, b) => a.distance - b.distance);
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token || !activeTokens.has(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.userId = activeTokens.get(token);
  return next();
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'BloodNet API is running' });
});

app.post('/api/register', (req, res) => {
  const { username, email, password } = req.body || {};
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'username, email, and password are required' });
  }

  const exists = users.some((u) => u.email.toLowerCase() === String(email).toLowerCase());
  if (exists) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const newUser = { id: users.length + 1, username, email, password };
  users.push(newUser);
  const token = `token-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  activeTokens.set(token, newUser.id);
  return res.json({ token, username: newUser.username });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = users.find(
    (u) => u.email.toLowerCase() === String(email || '').toLowerCase() && u.password === password
  );
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = `token-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  activeTokens.set(token, user.id);
  return res.json({ token, username: user.username });
});

app.get('/api/me', authMiddleware, (req, res) => {
  const user = users.find((u) => u.id === req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json({ username: user.username, email: user.email });
});

app.get('/api/online-users', authMiddleware, (req, res) => {
  const online = [...new Set([...activeTokens.values()])]
    .map((id) => users.find((u) => u.id === id))
    .filter(Boolean)
    .map((u) => ({ id: u.id, username: u.username }));
  return res.json({ users: online });
});

app.get('/api/blood-banks', (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return res.json(withDistance(bloodBanks, lat, lng));
  }
  return res.json(bloodBanks);
});

app.get('/api/nearest-blood-bank', (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return res.status(400).json({ error: 'lat and lng are required' });
  }
  const nearest = withDistance(bloodBanks, lat, lng)[0];
  return res.json(nearest);
});

app.get('/api/hospitals', (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return res.json(withDistance(hospitals, lat, lng));
  }
  return res.json(hospitals);
});

app.get('/api/donors', (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return res.json(withDistance(donors, lat, lng));
  }
  return res.json(donors);
});

app.get('/api/nearest-donor', (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const bloodType = req.query.blood_type;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return res.status(400).json({ error: 'lat and lng are required' });
  }

  let filtered = donors.filter((d) => d.available);
  if (bloodType) {
    filtered = filtered.filter((d) => d.blood_type === bloodType);
  }
  if (!filtered.length) {
    return res.status(404).json({ error: 'No donors found' });
  }
  const nearest = withDistance(filtered, lat, lng)[0];
  return res.json(nearest);
});

app.post('/api/donors', (req, res) => {
  const { name, phone, email, blood_type, lat, lng, city } = req.body || {};
  if (!name || !phone || !blood_type || !city) {
    return res.status(400).json({ error: 'name, phone, blood_type, and city are required' });
  }
  if (!Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) {
    return res.status(400).json({ error: 'valid lat and lng are required' });
  }

  const newDonor = {
    id: donors.length + 1,
    name,
    phone,
    email: email || null,
    blood_type,
    lat: Number(lat),
    lng: Number(lng),
    city,
    available: true,
    last_donation: null
  };
  donors.push(newDonor);
  return res.status(201).json(newDonor);
});

app.post('/api/delivery-request', authMiddleware, (req, res) => {
  const { user_lat, user_lng, dest_lat, dest_lng, destination_type, destination_id } = req.body || {};
  if (
    !Number.isFinite(Number(user_lat)) ||
    !Number.isFinite(Number(user_lng)) ||
    !Number.isFinite(Number(dest_lat)) ||
    !Number.isFinite(Number(dest_lng))
  ) {
    return res.status(400).json({ error: 'valid coordinates are required' });
  }

  const request = {
    request_id: `REQ-${Date.now()}`,
    user_id: req.userId,
    destination_type: destination_type || 'unknown',
    destination_id: destination_id || null,
    status: 'pending',
    created_at: new Date().toISOString(),
    distance_km: distanceKm(Number(user_lat), Number(user_lng), Number(dest_lat), Number(dest_lng))
  };
  deliveryRequests.unshift(request);
  return res.status(201).json(request);
});

app.get('/api/statistics', (req, res) => {
  const activeDonors = donors.filter((d) => d.available).length;
  return res.json({
    total_blood_banks: bloodBanks.length,
    total_hospitals: hospitals.length,
    total_donors: donors.length,
    active_donors: activeDonors,
    total_delivery_requests: deliveryRequests.length
  });
});

app.get('/api/delivery-requests', (req, res) => {
  return res.json(deliveryRequests.slice(0, 20));
});

app.get('/api/security-status', (req, res) => {
  return res.json({
    api_status: 'secure',
    auth_enabled: true,
    cors_enabled: true,
    rate_limit: 'not configured'
  });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`BloodNet server running on http://localhost:${PORT}`);
});
