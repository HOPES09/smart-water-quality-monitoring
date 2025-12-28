// --- CONFIGURATION & GLOBAL VARIABLES ---
let port;
let reader;
const encoder = new TextEncoder();
const decoder = new TextDecoder();

// --- SMART INITIALIZATION ---
// This prevents errors if you are on a page (like About) that doesn't have all elements
document.addEventListener('DOMContentLoaded', () => {
    const connectBtn = document.getElementById('connectBT');
    if (connectBtn) {
        connectBtn.addEventListener('click', connectToBluetooth);
    }

    // Only initialize charts if we are on the Dashboard page
    if (document.getElementById('phChart')) {
        initCharts();
    }
    
    // Setup Language Toggle for all pages
    const langBtn = document.getElementById('lang-toggle');
    if (langBtn) {
        langBtn.addEventListener('click', toggleLanguage);
    }
});

// --- BLUETOOTH CORE LOGIC ---
async function connectToBluetooth() {
    const statusText = document.getElementById('status');
    try {
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 9600 });
        
        if (statusText) statusText.innerText = "Connected";
        document.getElementById('connectBT').style.background = "#28a745";
        
        readData();
    } catch (error) {
        console.error("Bluetooth Connection Failed:", error);
        if (statusText) statusText.innerText = "Connect BT";
        alert("Connection Failed. Make sure you are using Chrome and HTTPS.");
    }
}

async function readData() {
    while (port.readable) {
        reader = port.readable.getReader();
        try {
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                const dataString = decoder.decode(value);
                processIncomingData(dataString);
            }
        } catch (error) {
            console.error("Read error:", error);
        } finally {
            reader.releaseLock();
        }
    }
}

// --- DATA PROCESSING ---
function processIncomingData(data) {
    // Expected format from Arduino: "PH:7.2,TEMP:25.4,TURB:10"
    const parts = data.split(',');
    parts.forEach(part => {
        const [key, val] = part.split(':');
        updateUI(key.trim(), val.trim());
    });
}

function updateUI(key, value) {
    // Check if elements exist before updating (Prevents errors on About page)
    const element = document.getElementById(key.toLowerCase() + '-val');
    if (element) {
        element.innerText = value;
    }
    
    // If we are on the dashboard, update the charts too
    if (typeof updateCharts === "function") {
        updateCharts(key, value);
    }
}

// --- LANGUAGE TOGGLE (Afaan Oromo / English) ---
let currentLang = 'en';
function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'om' : 'en';
    const btn = document.getElementById('lang-toggle');
    btn.innerHTML = currentLang === 'en' ? 
        '<i class="fas fa-language"></i> Afaan Oromo' : 
        '<i class="fas fa-language"></i> English';
    
    // Example of dynamic text change
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        // Add your translation dictionary logic here
    });
}
