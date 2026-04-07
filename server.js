const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URL = 'mongodb+srv://hypervenom1107_db_user:obFCED7wNyyOh7kO@cluster0.gr9t2ze.mongodb.net/?appName=Cluster0';

let db;

async function connectDB() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  db = client.db('bloodnet');
  console.log('Connected to MongoDB');
}

app.use(cors({
  origin: ['https://bloodbank-app-6a91a.web.app', 'http://localhost:3000']
}));
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const activeTokens = new Map();

const bloodBanks = [
  { id: 1, name: 'Chennai Central Blood Bank', address: 'Anna Salai, Chennai', phone: '+91 44 2222 1111', hours: '24/7', lat: 13.0569, lng: 80.2425, inventory: [{ blood_type: 'O+', quantity: 24 }, { blood_type: 'A+', quantity: 18 }, { blood_type: 'B+', quantity: 16 }, { blood_type: 'AB+', quantity: 7 }] },
  { id: 2, name: 'Lifeline Blood Center', address: 'Nungambakkam, Chennai', phone: '+91 44 3333 4444', hours: '8:00 AM - 10:00 PM', lat: 13.0674, lng: 80.2376, inventory: [{ blood_type: 'O-', quantity: 6 }, { blood_type: 'A-', quantity: 5 }, { blood_type: 'B-', quantity: 4 }, { blood_type: 'AB-', quantity: 3 }] },
  { id: 3, name: 'Apollo Blood Services', address: 'Greams Road, Chennai', phone: '+91 44 2829 3333', hours: '24/7', lat: 13.0616, lng: 80.2496, inventory: [{ blood_type: 'O+', quantity: 11 }, { blood_type: 'A+', quantity: 9 }, { blood_type: 'B+', quantity: 8 }, { blood_type: 'AB+', quantity: 4 }] },
  { id: 4, name: 'Government Stanley Blood Bank', address: 'Old Jail Road, Chennai', phone: '+91 44 2528 1355', hours: '24/7', lat: 13.1039, lng: 80.2934, inventory: [{ blood_type: 'O+', quantity: 20 }, { blood_type: 'A+', quantity: 15 }, { blood_type: 'B+', quantity: 12 }, { blood_type: 'AB+', quantity: 6 }] },
  { id: 5, name: 'Adyar Red Cross Blood Center', address: 'LB Road, Adyar, Chennai', phone: '+91 44 2491 5885', hours: '7:00 AM - 9:00 PM', lat: 13.0067, lng: 80.2573, inventory: [{ blood_type: 'O-', quantity: 7 }, { blood_type: 'A-', quantity: 6 }, { blood_type: 'B-', quantity: 5 }, { blood_type: 'AB-', quantity: 2 }] },
  { id: 6, name: 'Kilpauk Medical Blood Bank', address: 'Poonamallee High Road, Kilpauk', phone: '+91 44 2641 1444', hours: '24/7', lat: 13.0826, lng: 80.2411, inventory: [{ blood_type: 'O+', quantity: 14 }, { blood_type: 'A+', quantity: 13 }, { blood_type: 'B+', quantity: 10 }, { blood_type: 'AB+', quantity: 5 }] },
  { id: 7, name: 'OMR Community Blood Hub', address: 'Sholinganallur, Chennai', phone: '+91 44 4210 7788', hours: '8:00 AM - 8:00 PM', lat: 12.9010, lng: 80.2279, inventory: [{ blood_type: 'O+', quantity: 9 }, { blood_type: 'A+', quantity: 8 }, { blood_type: 'B+', quantity: 7 }, { blood_type: 'AB+', quantity: 3 }] }
];

const hospitals = [
  { id: 1, name: 'Rajiv Gandhi Government General Hospital', address: 'Park Town, Chennai', phone: '+91 44 2530 5000', hours: '24/7 Emergency', lat: 13.0827, lng: 80.2752 },
  { id: 2, name: 'Apollo Hospitals', address: 'Greams Road, Chennai', phone: '+91 44 2829 3333', hours: '24/7', lat: 13.0618, lng: 80.2514 },
  { id: 3, name: 'MIOT International', address: 'Manapakkam, Chennai', phone: '+91 44 4200 2288', hours: '24/7', lat: 13.0164, lng: 80.1857 },
  { id: 4, name: 'Government Stanley Medical College Hospital', address: 'Old Jail Road, Chennai', phone: '+91 44 2528 1355', hours: '24/7 Emergency', lat: 13.1010, lng: 80.2921 }
];

function distanceKm(lat1, lng1, lat2, lng2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function withDistance(items, lat, lng) {
  return items.map(item => ({ ...item, distance: distanceKm(lat, lng, item.lat, item.lng) })).sort((a, b) => a.distance - b.distance);
}

function authMiddleware(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token || !activeTokens.has(token)) return res.status(401).json({ error: 'Unauthorized' });
  req.userId = activeTokens.get(token);
  next();
}

app.get('/api/health', (req, res) => res.json({ ok: true, message: 'BloodNet API is running' }));

app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body || {};
  if (!username || !email || !password) return res.status(400).json({ error: 'All fields required' });
  const exists = await db.collection('users').findOne({ email: email.toLowerCase() });
  if (exists) return res.status(409).json({ error: 'Email already registered' });
  const user = { username, email: email.toLowerCase(), password, createdAt: new Date() };
  const result = await db.collection('users').insertOne(user);
  const token = `token-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  activeTokens.set(token, result.insertedId.toString());
  res.json({ token, username });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};
  const user = await db.collection('users').findOne({ email: email.toLowerCase(), password });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const token = `token-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  activeTokens.set(token, user._id.toString());
  res.json({ token, username: user.username });
});

app.get('/api/me', authMiddleware, async (req, res) => {
  const { ObjectId } = require('mongodb');
  const user = await db.collection('users').findOne({ _id: new ObjectId(req.userId) });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ username: user.username, email: user.email });
});

app.get('/api/online-users', authMiddleware, (req, res) => {
  res.json({ users: [] });
});

app.get('/api/blood-banks', (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  res.json(Number.isFinite(lat) && Number.isFinite(lng) ? withDistance(bloodBanks, lat, lng) : bloodBanks);
});

app.get('/api/nearest-blood-bank', (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return res.status(400).json({ error: 'lat and lng required' });
  res.json(withDistance(bloodBanks, lat, lng)[0]);
});

app.get('/api/hospitals', (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  res.json(Number.isFinite(lat) && Number.isFinite(lng) ? withDistance(hospitals, lat, lng) : hospitals);
});

app.get('/api/donors', async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const donors = await db.collection('donors').find({}).toArray();
  res.json(Number.isFinite(lat) && Number.isFinite(lng) ? withDistance(donors, lat, lng) : donors);
});

app.get('/api/nearest-donor', async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const bloodType = req.query.blood_type;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return res.status(400).json({ error: 'lat and lng required' });
  const query = { available: true };
  if (bloodType) query.blood_type = bloodType;
  const donors = await db.collection('donors').find(query).toArray();
  if (!donors.length) return res.status(404).json({ error: 'No donors found' });
  res.json(withDistance(donors, lat, lng)[0]);
});

app.post('/api/donors', async (req, res) => {
  const { name, phone, email, blood_type, lat, lng, city } = req.body || {};
  if (!name || !phone || !blood_type || !city) return res.status(400).json({ error: 'Required fields missing' });
  const donor = { name, phone, email: email || null, blood_type, lat: Number(lat), lng: Number(lng), city, available: true, last_donation: null, createdAt: new Date() };
  const result = await db.collection('donors').insertOne(donor);
  res.status(201).json({ ...donor, id: result.insertedId });
});

app.post('/api/delivery-request', authMiddleware, async (req, res) => {
  const { user_lat, user_lng, dest_lat, dest_lng, destination_type, destination_id } = req.body || {};
  const request = {
    user_id: req.userId, destination_type, destination_id,
    status: 'pending', created_at: new Date(),
    distance_km: distanceKm(Number(user_lat), Number(user_lng), Number(dest_lat), Number(dest_lng))
  };
  const result = await db.collection('delivery_requests').insertOne(request);
  res.status(201).json({ ...request, request_id: result.insertedId });
});

app.get('/api/statistics', async (req, res) => {
  const total_donors = await db.collection('donors').countDocuments();
  const active_donors = await db.collection('donors').countDocuments({ available: true });
  const total_delivery_requests = await db.collection('delivery_requests').countDocuments();
  res.json({ total_blood_banks: bloodBanks.length, total_hospitals: hospitals.length, total_donors, active_donors, total_delivery_requests });
});

app.get('/api/delivery-requests', async (req, res) => {
  const requests = await db.collection('delivery_requests').find({}).sort({ created_at: -1 }).limit(20).toArray();
  res.json(requests);
});

app.get('/api/security-status', (req, res) => {
  res.json({ api_status: 'secure', auth_enabled: true, cors_enabled: true, rate_limit: 'not configured' });
});

connectDB().then(() => {
  app.listen(PORT, () => console.log(`BloodNet server running on http://localhost:${PORT}`));
});