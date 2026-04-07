// ============================================================
// API Configuration
// Update NGROK_BASE_URL whenever you start a new ngrok session.
// Example command: ngrok http 3000
// ============================================================
// Leave empty for local development (uses http://localhost:3000/api)
const NGROK_BASE_URL = 'https://blood-bank-app-production-50fe.up.railway.app';
const LOCAL_BASE_URL = 'http://localhost:3000';
const API_BASE = `${NGROK_BASE_URL || LOCAL_BASE_URL}/api`;

const LOCAL_USERS_KEY = 'localAuthUsers';
const FALLBACK_BLOOD_BANKS = [
    {
        id: 'fb-1',
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
        id: 'fb-2',
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
        id: 'fb-3',
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
        id: 'fb-4',
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
        id: 'fb-5',
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
        id: 'fb-6',
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
        id: 'fb-7',
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
const FALLBACK_HOSPITALS = [
    {
        id: 'h-1',
        name: 'Rajiv Gandhi Government General Hospital',
        address: 'Park Town, Chennai',
        phone: '+91 44 2530 5000',
        hours: '24/7 Emergency',
        lat: 13.0827,
        lng: 80.2752
    },
    {
        id: 'h-2',
        name: 'Apollo Hospitals',
        address: 'Greams Road, Chennai',
        phone: '+91 44 2829 3333',
        hours: '24/7',
        lat: 13.0618,
        lng: 80.2514
    },
    {
        id: 'h-3',
        name: 'MIOT International',
        address: 'Manapakkam, Chennai',
        phone: '+91 44 4200 2288',
        hours: '24/7',
        lat: 13.0164,
        lng: 80.1857
    },
    {
        id: 'h-4',
        name: 'Government Stanley Medical College Hospital',
        address: 'Old Jail Road, Chennai',
        phone: '+91 44 2528 1355',
        hours: '24/7 Emergency',
        lat: 13.1010,
        lng: 80.2921
    }
];

function getLocalUsers() {
    try {
        return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
    } catch {
        return [];
    }
}

function saveLocalUsers(users) {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

function fallbackRegisterUser(username, email, password) {
    const users = getLocalUsers();
    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) throw new Error('Account already exists with this email');

    users.push({ username, email, password });
    saveLocalUsers(users);
    setAuthToken(`local-${Date.now()}`);
    showLoggedInState(username);
    loadOnlineUsers();
}

function fallbackLoginUser(email, password) {
    const users = getLocalUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) throw new Error('Invalid email or password');

    setAuthToken(`local-${Date.now()}`);
    showLoggedInState(user.username);
    loadOnlineUsers();
}

function calculateDistanceKm(lat1, lng1, lat2, lng2) {
    const dx = lat2 - lat1;
    const dy = lng2 - lng1;
    return Math.sqrt(dx * dx + dy * dy) * 111;
}

function getFallbackBloodBanks() {
    return FALLBACK_BLOOD_BANKS.map(bank => ({
        ...bank,
        distance: calculateDistanceKm(userLat, userLng, bank.lat, bank.lng)
    }));
}

function getFallbackHospitals() {
    return FALLBACK_HOSPITALS.map(hospital => ({
        ...hospital,
        distance: calculateDistanceKm(userLat, userLng, hospital.lat, hospital.lng)
    }));
}

function formatDuration(totalSeconds) {
    const mins = Math.round((totalSeconds || 0) / 60);
    if (mins < 60) return `${mins} min`;
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    return rem ? `${hrs}h ${rem}m` : `${hrs}h`;
}

function updateRouteSummary(distanceKm, durationSeconds, type) {
    const el = document.getElementById('route-summary');
    if (!el) return;
    const targetLabel = type === 'bank' ? 'Blood Bank' : 'Donor';
    el.innerHTML = `
        <h4>${targetLabel} Route</h4>
        <span class="location-info"><span class="label">📏</span><span class="value">${distanceKm.toFixed(2)} km</span></span>
        <span class="location-info"><span class="label">⏱️</span><span class="value">${formatDuration(durationSeconds)}</span></span>
    `;
}

function getEstimatedEtaSeconds(distanceKm, type) {
    // Simple fallback estimate shown in cards before full route calculation.
    const avgSpeedKmH = type === 'bank' ? 35 : 30;
    return (distanceKm / avgSpeedKmH) * 3600;
}
// Location data
const locations = {
    'USA': {
        cities: ['New York'],
        coordinates: { 'New York': { lat: 40.7128, lng: -74.0060 } }
    },
    'India': {
        cities: ['Chennai', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Kolkata'],
        coordinates: {
            'Chennai':   { lat: 13.0331, lng: 80.2793 },
            'Mumbai':    { lat: 19.0760, lng: 72.8777 },
            'Delhi':     { lat: 28.7041, lng: 77.1025 },
            'Bangalore': { lat: 12.9716, lng: 77.5946 },
            'Hyderabad': { lat: 17.3850, lng: 78.4867 },
            'Kolkata':   { lat: 22.5726, lng: 88.3639 }
        }
    }
};

// Global state
let map = null;
let userLat = 13.0331;
let userLng = 80.2793;
let selectedCountry = 'India';
let selectedCity = 'Chennai';
let routingControl = null;
let currentNearestDonor = null;
let currentNearestBank = null;
let allMarkers = [];
let mapInitialized = false;
let currentRouteTargetType = '';

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    // Hide loading overlay after short delay
    setTimeout(() => {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.classList.add('hidden');
    }, 1800);

    setupLocationSelectors();
    setupEventListeners();

    setTimeout(() => initializeLocationOnLoad(), 150);
    loadStatistics();

    // Restore auth state
    restoreAuthState();
});

// ============================================================
// AUTH HELPERS
// ============================================================
function getAuthToken() {
    return localStorage.getItem('authToken');
}
function setAuthToken(token) {
    if (token) localStorage.setItem('authToken', token);
    else localStorage.removeItem('authToken');
}
function getAuthHeaders() {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

function restoreAuthState() {
    const token = getAuthToken();
    if (token) {
        fetch(`${API_BASE}/me`, { headers: getAuthHeaders() })
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data && data.username) {
                    showLoggedInState(data.username);
                    loadOnlineUsers();
                } else {
                    // Token invalid — clear it
                    setAuthToken(null);
                    showLoggedOutState();
                }
            })
            .catch(() => showLoggedOutState());
    } else {
        showLoggedOutState();
    }
}

function showLoggedInState(username) {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'none';
    const loggedInPanel = document.getElementById('logged-in-panel');
    loggedInPanel.style.display = 'flex';
    const statusEl = document.getElementById('login-status');
    if (statusEl) statusEl.textContent = username;
}

function showLoggedOutState() {
    document.getElementById('login-form').style.display = 'flex';
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('logged-in-panel').style.display = 'none';
}

function logout() {
    setAuthToken(null);
    showLoggedOutState();
    document.getElementById('online-count').textContent = '0';
}

async function login(email, password) {
    const btn = document.getElementById('login-button');
    btn.textContent = 'Logging in...';
    btn.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();

        if (!response.ok) {
            const msg = data.details ? data.details.map(e => e.msg).join('\n') : (data.error || 'Login failed');
            throw new Error(msg);
        }

        setAuthToken(data.token);
        showLoggedInState(data.username);
        document.getElementById('login-email').value = '';
        document.getElementById('login-password').value = '';
        loadOnlineUsers();
    } catch (error) {
        try {
            fallbackLoginUser(email, password);
            document.getElementById('login-email').value = '';
            document.getElementById('login-password').value = '';
            showToast('Logged in (local mode - backend unavailable)', 'success');
        } catch (fallbackError) {
            showToast(`Login failed: ${fallbackError.message}`, 'error');
        }
    } finally {
        btn.textContent = 'Login';
        btn.disabled = false;
    }
}

async function register(username, email, password) {
    const btn = document.getElementById('register-submit');
    btn.textContent = 'Creating...';
    btn.disabled = true;

    try {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const data = await response.json();

        if (!response.ok) {
            const msg = data.details ? data.details.map(e => e.msg).join('\n') : (data.error || 'Registration failed');
            throw new Error(msg);
        }

        setAuthToken(data.token);
        showLoggedInState(data.username);
        document.getElementById('register-username').value = '';
        document.getElementById('register-email').value = '';
        document.getElementById('register-password').value = '';
        loadOnlineUsers();
        showToast('Account created! Welcome 🎉', 'success');
    } catch (error) {
        try {
            fallbackRegisterUser(username, email, password);
            document.getElementById('register-username').value = '';
            document.getElementById('register-email').value = '';
            document.getElementById('register-password').value = '';
            showToast('Account created (local mode - backend unavailable)', 'success');
        } catch (fallbackError) {
            showToast(`Registration failed: ${fallbackError.message}`, 'error');
        }
    } finally {
        btn.textContent = 'Create Account';
        btn.disabled = false;
    }
}

async function loadOnlineUsers() {
    try {
        const response = await fetch(`${API_BASE}/online-users`, { headers: getAuthHeaders() });
        const data = await response.json();
        const users = data.users || [];
        const countEl = document.getElementById('online-count');
        const listEl  = document.getElementById('online-users-list');
        if (countEl) countEl.textContent = users.length;
        if (listEl) {
            listEl.innerHTML = '';
            if (users.length === 0) {
                listEl.style.display = 'none';
            } else {
                users.forEach(u => {
                    const li = document.createElement('li');
                    li.textContent = u.username;
                    listEl.appendChild(li);
                });
                listEl.style.display = 'block';
            }
        }
    } catch (err) {
        console.warn('Could not load online users:', err);
    }
}

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================
function showToast(message, type = 'info') {
    // Remove existing toasts
    document.querySelectorAll('.toast').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed; bottom: 1.5rem; left: 50%; transform: translateX(-50%);
        background: ${type === 'error' ? '#c0392b' : type === 'success' ? '#27ae60' : '#2980b9'};
        color: white; padding: 0.75rem 1.5rem; border-radius: 99px;
        font-family: var(--font); font-size: 0.9rem; font-weight: 500;
        box-shadow: 0 4px 16px rgba(0,0,0,0.2); z-index: 9999;
        animation: toastIn 0.3s ease;
        white-space: pre-line; max-width: 90vw; text-align: center;
    `;

    const style = document.createElement('style');
    style.textContent = `@keyframes toastIn { from { opacity:0; transform: translateX(-50%) translateY(10px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }`;
    document.head.appendChild(style);
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 4000);
}

// ============================================================
// EVENT LISTENERS
// ============================================================
function setupEventListeners() {
    const useLocationBtn = document.getElementById('use-current-location');
    if (useLocationBtn) {
        useLocationBtn.addEventListener('click', async () => {
            useLocationBtn.disabled = true;
            const originalText = useLocationBtn.textContent;
            useLocationBtn.textContent = 'Locating...';
            try {
                await refreshLocationFromBrowser();
                showToast('Updated to your current location', 'success');
            } catch (err) {
                showToast('Could not access current location. Using selected city.', 'error');
            } finally {
                useLocationBtn.textContent = originalText;
                useLocationBtn.disabled = false;
            }
        });
    }

    document.getElementById('blood-type-filter').addEventListener('change', (e) => {
        loadNearestDonor(userLat, userLng, e.target.value);
    });

    document.getElementById('request-delivery-donor').addEventListener('click', () => {
        if (currentNearestDonor) {
            requestDelivery(currentNearestDonor.lat, currentNearestDonor.lng, 'donor', currentNearestDonor.id);
        }
    });

    document.getElementById('request-delivery-bank').addEventListener('click', () => {
        if (currentNearestBank) {
            requestDelivery(currentNearestBank.lat, currentNearestBank.lng, 'bank', currentNearestBank.id);
        }
    });

    document.getElementById('donor-registration-form').addEventListener('submit', registerDonor);

    document.getElementById('login-button').addEventListener('click', () => {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        if (!email || !password) { showToast('Please enter email and password', 'error'); return; }
        login(email, password);
    });

    // Allow Enter key on login fields
    ['login-email', 'login-password'].forEach(id => {
        document.getElementById(id).addEventListener('keydown', (e) => {
            if (e.key === 'Enter') document.getElementById('login-button').click();
        });
    });

    document.getElementById('register-button').addEventListener('click', () => {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'flex';
    });

    document.getElementById('register-submit').addEventListener('click', () => {
        const username = document.getElementById('register-username').value.trim();
        const email    = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;
        if (!username || !email || !password) { showToast('Please fill all fields', 'error'); return; }
        register(username, email, password);
    });

    document.getElementById('register-cancel').addEventListener('click', () => {
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('login-form').style.display = 'flex';
        document.getElementById('register-username').value = '';
        document.getElementById('register-email').value = '';
        document.getElementById('register-password').value = '';
    });
}

// ============================================================
// LOCATION SELECTORS
// ============================================================
function setupLocationSelectors() {
    const countrySelector = document.getElementById('country-selector');
    const citySelector    = document.getElementById('city-selector');

    if (!countrySelector || !citySelector) {
        console.error('Selectors not found');
        return;
    }

    countrySelector.addEventListener('change', (e) => {
        selectedCountry = e.target.value;
        if (!locations[selectedCountry]) return;

        const cities = locations[selectedCountry].cities;
        citySelector.innerHTML = '';
        cities.forEach(city => {
            const opt = document.createElement('option');
            opt.value = city;
            opt.textContent = city;
            citySelector.appendChild(opt);
        });

        citySelector.disabled = false;
        if (cities.length > 0) {
            citySelector.value = cities[0];
            selectedCity = cities[0];
            loadLocationData();
        }
    });

    citySelector.addEventListener('change', (e) => {
        selectedCity = e.target.value;
        if (selectedCity) loadLocationData();
    });

    // Set default
    countrySelector.value = 'India';
    countrySelector.dispatchEvent(new Event('change'));
}

function getCurrentPositionWithTimeout(timeoutMs = 10000) {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
        }

        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: timeoutMs,
            maximumAge: 0
        });
    });
}

async function initializeLocationOnLoad() {
    try {
        await refreshLocationFromBrowser();
    } catch (err) {
        // Fallback to selected city if geolocation is blocked/denied/unavailable.
        loadLocationData();
    }
}

async function refreshLocationFromBrowser() {
    const position = await getCurrentPositionWithTimeout(10000);
    userLat = position.coords.latitude;
    userLng = position.coords.longitude;

    const statusEl = document.getElementById('location-status');
    if (statusEl) statusEl.textContent = '📍 Using your current location';

    allMarkers.forEach(m => m.remove());
    allMarkers = [];

    if (!map) {
        initMap();
    } else {
        map.setView([userLat, userLng], 13);
        addUserMarker();
        loadAllBloodBanks();
        loadAllHospitals();
        loadAllDonors();
        loadNearestDonor(userLat, userLng);
        loadNearestBank(userLat, userLng);
    }
}

function loadLocationData() {
    if (!selectedCountry || !selectedCity) return;

    const coords = locations[selectedCountry].coordinates[selectedCity];
    userLat = coords.lat;
    userLng = coords.lng;

    const flag = selectedCountry === 'USA' ? '🇺🇸' : '🇮🇳';
    document.getElementById('location-status').textContent = `📍 ${flag} ${selectedCity}, ${selectedCountry}`;

    // Clear markers
    allMarkers.forEach(m => m.remove());
    allMarkers = [];

    if (!map) {
        initMap();
    } else {
        map.setView([userLat, userLng], 13);
        addUserMarker();
        loadAllBloodBanks();
        loadAllHospitals();
        loadAllDonors();
        loadNearestDonor(userLat, userLng);
        loadNearestBank(userLat, userLng);
    }
}

// ============================================================
// MAP
// ============================================================
function initMap() {
    if (mapInitialized) return;
    mapInitialized = true;

    // Hide the map loading indicator after leaflet loads
    const mapLoading = document.getElementById('map-loading');

    map = L.map('map', { zoomControl: true }).setView([userLat, userLng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
    }).addTo(map);

    map.whenReady(() => {
        if (mapLoading) mapLoading.style.display = 'none';
    });

    addUserMarker();
    loadAllBloodBanks();
    loadAllHospitals();
    loadAllDonors();
    loadNearestDonor(userLat, userLng);
    loadNearestBank(userLat, userLng);
}

function makeIcon(color) {
    return L.icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41],
        popupAnchor: [1, -34], shadowSize: [41, 41]
    });
}

function addUserMarker() {
    L.marker([userLat, userLng], { icon: makeIcon('blue') })
        .addTo(map)
        .bindPopup('<strong>📍 Your Location</strong>');
}

async function loadAllBloodBanks() {
    try {
        const res = await fetch(`${API_BASE}/blood-banks?lat=${userLat}&lng=${userLng}`);
        const banks = res.ok ? await res.json() : getFallbackBloodBanks();

        banks.forEach(bank => {
            const inventory = bank.inventory
                ? bank.inventory.map(i => `${i.blood_type}: ${i.quantity} units`).join('<br>')
                : 'No inventory data';

            const marker = L.marker([bank.lat, bank.lng], { icon: makeIcon('red') })
                .addTo(map)
                .bindPopup(`
                    <strong>🏥 ${bank.name}</strong><br>
                    📍 ${bank.address}<br>📞 ${bank.phone}<br>
                    ⏰ ${bank.hours || 'N/A'}<br>
                    <strong>Stock:</strong><br>${inventory}<br>
                    <strong>📏 ${bank.distance.toFixed(2)} km</strong>
                `);
            allMarkers.push(marker);
        });
    } catch (err) {
        console.warn('Blood banks load error:', err);
        getFallbackBloodBanks().forEach(bank => {
            const inventory = bank.inventory
                ? bank.inventory.map(i => `${i.blood_type}: ${i.quantity} units`).join('<br>')
                : 'No inventory data';

            const marker = L.marker([bank.lat, bank.lng], { icon: makeIcon('red') })
                .addTo(map)
                .bindPopup(`
                    <strong>🏥 ${bank.name}</strong><br>
                    📍 ${bank.address}<br>📞 ${bank.phone}<br>
                    ⏰ ${bank.hours || 'N/A'}<br>
                    <strong>Stock:</strong><br>${inventory}<br>
                    <strong>📏 ${bank.distance.toFixed(2)} km</strong>
                `);
            allMarkers.push(marker);
        });
    }
}

async function loadAllHospitals() {
    try {
        const res = await fetch(`${API_BASE}/hospitals?lat=${userLat}&lng=${userLng}`);
        const hospitals = res.ok ? await res.json() : getFallbackHospitals();

        hospitals.forEach(hospital => {
            const marker = L.marker([hospital.lat, hospital.lng], { icon: makeIcon('orange') })
                .addTo(map)
                .bindPopup(`
                    <strong>🏨 ${hospital.name}</strong><br>
                    📍 ${hospital.address}<br>
                    📞 ${hospital.phone}<br>
                    ⏰ ${hospital.hours || 'N/A'}<br>
                    <strong>📏 ${hospital.distance.toFixed(2)} km</strong>
                `);
            allMarkers.push(marker);
        });
    } catch (err) {
        console.warn('Hospitals load error:', err);
        getFallbackHospitals().forEach(hospital => {
            const marker = L.marker([hospital.lat, hospital.lng], { icon: makeIcon('orange') })
                .addTo(map)
                .bindPopup(`
                    <strong>🏨 ${hospital.name}</strong><br>
                    📍 ${hospital.address}<br>
                    📞 ${hospital.phone}<br>
                    ⏰ ${hospital.hours || 'N/A'}<br>
                    <strong>📏 ${hospital.distance.toFixed(2)} km</strong>
                `);
            allMarkers.push(marker);
        });
    }
}

async function loadAllDonors() {
    try {
        const res = await fetch(`${API_BASE}/donors?lat=${userLat}&lng=${userLng}`);
        if (!res.ok) return;
        const donors = await res.json();

        donors.forEach(donor => {
            const marker = L.marker([donor.lat, donor.lng], { icon: makeIcon('green') })
                .addTo(map)
                .bindPopup(`
                    <strong>👤 ${donor.name}</strong><br>
                    🩸 ${donor.blood_type} &nbsp; 📍 ${donor.city}<br>
                    📞 ${donor.phone}<br>
                    ${donor.available ? '✅ Available' : '❌ Not Available'}<br>
                    <strong>📏 ${donor.distance.toFixed(2)} km</strong>
                `);
            allMarkers.push(marker);
        });
    } catch (err) { console.warn('Donors load error:', err); }
}

async function loadNearestBank(lat, lng) {
    const el = document.getElementById('nearest-bank');
    el.innerHTML = '<div class="skeleton-loader"><div class="skeleton-line"></div><div class="skeleton-line short"></div><div class="skeleton-line"></div></div>';

    try {
        const res = await fetch(`${API_BASE}/nearest-blood-bank?lat=${lat}&lng=${lng}`);
        let bank;
        if (!res.ok) {
            const fallback = getFallbackBloodBanks().sort((a, b) => a.distance - b.distance);
            if (!fallback.length) throw new Error('Not found');
            bank = fallback[0];
        } else {
            bank = await res.json();
        }
        currentNearestBank = bank;

        const inventory = bank.inventory
            ? bank.inventory.map(i => `<span class="location-info"><span class="label">${i.blood_type}</span><span class="value">${i.quantity} units</span></span>`).join('')
            : '<span class="location-info"><span class="value">No inventory data</span></span>';
        const eta = formatDuration(getEstimatedEtaSeconds(bank.distance, 'bank'));

        el.innerHTML = `
            <h4>${bank.name}</h4>
            <span class="location-info"><span class="label">📍</span><span class="value">${bank.address}</span></span>
            <span class="location-info"><span class="label">📞</span><span class="value">${bank.phone}</span></span>
            <span class="location-info"><span class="label">⏰</span><span class="value">${bank.hours || 'N/A'}</span></span>
            <span class="location-info"><span class="label">🩸 Stock:</span></span>
            ${inventory}
            <span class="distance-badge">📏 ${bank.distance.toFixed(2)} km away</span>
            <span class="location-info"><span class="label">⏱️ ETA:</span><span class="value">${eta}</span></span>
        `;
        document.getElementById('request-delivery-bank').disabled = false;
    } catch (err) {
        const fallback = getFallbackBloodBanks().sort((a, b) => a.distance - b.distance);
        if (fallback.length) {
            const bank = fallback[0];
            const inventory = bank.inventory
                ? bank.inventory.map(i => `<span class="location-info"><span class="label">${i.blood_type}</span><span class="value">${i.quantity} units</span></span>`).join('')
                : '<span class="location-info"><span class="value">No inventory data</span></span>';
            const eta = formatDuration(getEstimatedEtaSeconds(bank.distance, 'bank'));
            currentNearestBank = bank;
            el.innerHTML = `
                <h4>${bank.name}</h4>
                <span class="location-info"><span class="label">📍</span><span class="value">${bank.address}</span></span>
                <span class="location-info"><span class="label">📞</span><span class="value">${bank.phone}</span></span>
                <span class="location-info"><span class="label">⏰</span><span class="value">${bank.hours || 'N/A'}</span></span>
                <span class="location-info"><span class="label">🩸 Stock:</span></span>
                ${inventory}
                <span class="distance-badge">📏 ${bank.distance.toFixed(2)} km away</span>
                <span class="location-info"><span class="label">⏱️ ETA:</span><span class="value">${eta}</span></span>
            `;
            document.getElementById('request-delivery-bank').disabled = false;
        } else {
            el.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;">Unable to load bank data</p>';
        }
    }
}

async function loadNearestDonor(lat, lng, bloodType = '') {
    const el = document.getElementById('nearest-donor');
    el.innerHTML = '<div class="skeleton-loader"><div class="skeleton-line"></div><div class="skeleton-line short"></div><div class="skeleton-line"></div></div>';

    try {
        let url = `${API_BASE}/nearest-donor?lat=${lat}&lng=${lng}`;
        if (bloodType) url += `&blood_type=${encodeURIComponent(bloodType)}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error('No donors found');
        const donor = await res.json();
        currentNearestDonor = donor;

        const lastDonation = donor.last_donation
            ? new Date(donor.last_donation).toLocaleDateString()
            : 'Not recorded';
        const eta = formatDuration(getEstimatedEtaSeconds(donor.distance, 'donor'));

        el.innerHTML = `
            <h4>${donor.name}</h4>
            <span class="location-info"><span class="label">🩸</span><span class="value">${donor.blood_type}</span></span>
            <span class="location-info"><span class="label">📞</span><span class="value">${donor.phone}</span></span>
            <span class="location-info"><span class="label">📍</span><span class="value">${donor.city}</span></span>
            <span class="location-info"><span class="label">📅</span><span class="value">${lastDonation}</span></span>
            <span class="location-info"><span class="label">Status:</span><span class="value">${donor.available ? '✅ Available' : '❌ Not Available'}</span></span>
            <span class="distance-badge">📏 ${donor.distance.toFixed(2)} km away</span>
            <span class="location-info"><span class="label">⏱️ ETA:</span><span class="value">${eta}</span></span>
        `;
        document.getElementById('request-delivery-donor').disabled = false;
    } catch (err) {
        el.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;">No available donors found</p>';
        document.getElementById('request-delivery-donor').disabled = true;
    }
}

// ============================================================
// DELIVERY
// ============================================================
async function requestDelivery(destLat, destLng, type, destinationId) {
    if (!getAuthToken()) {
        showToast('Please login to request a delivery', 'error');
        return;
    }

    try {
        if (routingControl) { map.removeControl(routingControl); }
        currentRouteTargetType = type;

        let requestId = null;
        try {
            const res = await fetch(`${API_BASE}/delivery-request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({
                    user_lat: userLat, user_lng: userLng,
                    dest_lat: destLat, dest_lng: destLng,
                    destination_type: type, destination_id: destinationId
                })
            });
            const result = await res.json();
            if (res.ok) requestId = result.request_id;
        } catch (apiErr) {
            console.warn('Delivery API unavailable, showing route only:', apiErr);
        }

        routingControl = L.Routing.control({
            waypoints: [L.latLng(userLat, userLng), L.latLng(destLat, destLng)],
            routeWhileDragging: false,
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true,
            lineOptions: { styles: [{ color: '#c0392b', weight: 4, opacity: 0.85 }] }
        }).addTo(map);

        routingControl.on('routesfound', (e) => {
            const route = e.routes && e.routes[0];
            if (!route || !route.summary) return;
            const distanceKm = (route.summary.totalDistance || 0) / 1000;
            const durationSeconds = route.summary.totalTime || 0;
            updateRouteSummary(distanceKm, durationSeconds, currentRouteTargetType);
        });

        routingControl.on('routingerror', () => {
            const summaryEl = document.getElementById('route-summary');
            if (summaryEl) {
                summaryEl.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;">Route unavailable right now. Please try again.</p>';
            }
        });

        if (requestId) showToast(`✅ Delivery requested! ID: ${requestId}`, 'success');
        else showToast('✅ Route loaded. Backend request skipped (offline mode).', 'success');

        // Switch to map tab to show route
        showTab('map');
    } catch (err) {
        showToast(`❌ ${err.message || 'Failed to request delivery'}`, 'error');
    }
}

// ============================================================
// DONOR REGISTRATION
// ============================================================
async function registerDonor(e) {
    e.preventDefault();
    const msgEl = document.getElementById('registration-message');
    msgEl.className = 'message';
    msgEl.style.display = 'none';

    const name      = document.getElementById('donor-name').value;
    const phone     = document.getElementById('donor-phone').value;
    const email     = document.getElementById('donor-email').value;
    const bloodType = document.getElementById('donor-blood-type').value;
    const city      = document.getElementById('donor-city').value;

    if (!navigator.geolocation) {
        msgEl.textContent = '❌ Geolocation not supported by your browser';
        msgEl.className = 'message error';
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Getting location...';
    submitBtn.disabled = true;

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            try {
                const res = await fetch(`${API_BASE}/donors`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name, phone,
                        email: email || null,
                        blood_type: bloodType,
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        city
                    })
                });
                const result = await res.json();
                if (!res.ok) throw new Error(result.error);

                msgEl.textContent = '✅ Successfully registered! Thank you for saving lives!';
                msgEl.className = 'message success';
                document.getElementById('donor-registration-form').reset();

                setTimeout(() => location.reload(), 2500);
            } catch (err) {
                msgEl.textContent = `❌ ${err.message}`;
                msgEl.className = 'message error';
            } finally {
                submitBtn.textContent = 'Register as Donor';
                submitBtn.disabled = false;
            }
        },
        () => {
            msgEl.textContent = '❌ Location access denied. Please allow location to register.';
            msgEl.className = 'message error';
            submitBtn.textContent = 'Register as Donor';
            submitBtn.disabled = false;
        }
    );
}

// ============================================================
// STATISTICS
// ============================================================
async function loadStatistics() {
    try {
        const res = await fetch(`${API_BASE}/statistics`);
        if (!res.ok) return;
        const stats = await res.json();

        animateNumber('stat-banks',    stats.total_blood_banks);
        animateNumber('stat-donors',   stats.total_donors);
        animateNumber('stat-active',   stats.active_donors);
        animateNumber('stat-requests', stats.total_delivery_requests);

        loadRecentRequests();
        loadSecurityStatus();
    } catch (err) {
        console.warn('Stats load error:', err);
    }
}

function animateNumber(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    let current = 0;
    const step = Math.ceil(target / 30);
    const interval = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = current;
        if (current >= target) clearInterval(interval);
    }, 40);
}

async function loadRecentRequests() {
    try {
        const res = await fetch(`${API_BASE}/delivery-requests`);
        if (!res.ok) return;
        const requests = await res.json();

        const html = requests.slice(0, 10).map(req => `
            <div class="request-item">
                <span class="status ${req.status}">${req.status.toUpperCase()}</span>
                <p><strong>Type:</strong> ${req.destination_type}</p>
                <p><strong>Date:</strong> ${new Date(req.created_at).toLocaleString()}</p>
            </div>
        `).join('');

        document.getElementById('recent-requests-list').innerHTML = html || '<p style="color:var(--text-muted);padding:1rem;font-size:0.85rem;">No requests yet</p>';
    } catch (err) {
        console.warn('Recent requests error:', err);
    }
}

async function loadSecurityStatus() {
    try {
        const res = await fetch(`${API_BASE}/security-status`);
        if (!res.ok) return;
        const sec = await res.json();
        const f = sec.security_features;

        document.getElementById('security-info').innerHTML = `
            <p><strong>🔐 Passwords:</strong> ${f.password_hashing}</p>
            <p><strong>🛡️ Rate Limiting:</strong> ${f.rate_limiting}</p>
            <p><strong>✅ Validation:</strong> ${f.input_validation}</p>
            <p><strong>🌐 CORS:</strong> ${f.cors_policy}</p>
            <p><strong>🛡️ Headers:</strong> ${f.security_headers}</p>
            <p><strong>⏰ Sessions:</strong> ${f.session_management}</p>
            <p><strong>💉 SQL Injection:</strong> ${f.sql_injection_protection}</p>
            <p><strong>🚫 XSS:</strong> ${f.xss_protection}</p>
            <p><strong>👥 Active Sessions:</strong> ${sec.active_sessions}</p>
            <p><strong>⏱️ Uptime:</strong> ${Math.floor(sec.server_uptime / 60)} minutes</p>
        `;
    } catch (err) {
        document.getElementById('security-info').innerHTML = '<p style="color:var(--text-muted);">Security info unavailable</p>';
    }
}

// ============================================================
// TAB SWITCHING
// ============================================================
function showTab(tabName) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

    document.getElementById(`${tabName}-tab`).classList.add('active');
    document.querySelectorAll(`.nav-link[data-tab="${tabName}"]`).forEach(l => l.classList.add('active'));

    if (tabName === 'map' && !map) {
        setTimeout(initMap, 100);
    }
}

// ============================================================
// MOBILE MENU
// ============================================================
function toggleMobileMenu() {
    const nav = document.getElementById('mobile-nav');
    nav.classList.toggle('open');
}
