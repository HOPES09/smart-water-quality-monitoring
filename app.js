/**
 * Smart Water Quality Monitoring System
 * Professional JavaScript Implementation with Web Bluetooth Integration
 * Jimma University Institute of Technology - CBTP Project
 */

class WaterMonitoringSystem {
  constructor() {
    this.sensorData = {};
    this.updateInterval = null;
    this.isAutoRefresh = true;
    
    // --- NEW: Bluetooth Variables ---
    this.bluetoothDevice = null;
    this.terminalCharacteristic = null;
    this.isConnected = false;

    this.currentLang = localStorage.getItem("selectedLanguage") || "en";

    this.translations = {
      en: {
        "nav-home": '<i class="fas fa-home"></i> Home',
        "nav-dash": '<i class="fas fa-gauge"></i> Live Dashboard',
        "nav-data": '<i class="fas fa-chart-line"></i> Data History',
        "nav-about": '<i class="fas fa-users"></i> About',
        "hero-title": "Smart Water Quality Monitoring System",
        "hero-subtitle": "Real-time monitoring of water parameters using IoT technology",
        "view-dash-btn": "View Live Dashboard",
        "features-title": "Key Features",
        "feat-rt-title": "Real-time Monitoring",
        "feat-rt-desc": "Continuous tracking of water quality parameters every 5 seconds",
        "feat-alert-title": "Instant Alerts",
        "feat-alert-desc": "Get notified when water quality exceeds safe limits",
        "feat-data-title": "Data Analytics",
        "feat-data-desc": "Historical data analysis with interactive charts",
        "feat-remote-title": "Remote Access",
        "feat-remote-desc": "Monitor water quality from anywhere using web interface",
        "status-section-title": "Current Water Quality Status",
        "ph-label": "pH Level",
        "temp-label": "Temperature",
        "turb-label": "Turbidity",
        "tds-label": "TDS",
        "status-normal": "Normal",
        "status-good": "Good",
        "status-mod": "Moderate",
        "status-safe": "Safe",
        "tech-title": "Technology Used",
        "team-title": "Project Team",
        "contact-title": "Contact",
        "bt-connect": "Connect Bluetooth",
        "bt-connected": "Connected",
      },
      om: {
        "nav-home": '<i class="fas fa-home"></i> Mana',
        "nav-dash": '<i class="fas fa-gauge"></i> Dashboard',
        "nav-data": '<i class="fas fa-chart-line"></i> Seenaa Daataa',
        "nav-about": '<i class="fas fa-users"></i> Waa’ee Keenya',
        "hero-title": "Sirna Hordoffii Qulqullina Bishaan Saayinsawaa",
        "hero-subtitle": "Teknooloojii IoT fayyadamuun qulqullina bishaanii hordofuu",
        "view-dash-btn": "Dashboard Ilaali",
        "features-title": "Dandeettiiwwan Ijoo",
        "feat-rt-title": "Hordoffii Yeroodhaa",
        "feat-rt-desc": "Sekondii 5 hundaatti jijjiirama bishaanii hordofuu",
        "feat-alert-title": "Akeekkachiisa Yeroodhaa",
        "feat-alert-desc": "Yoo qulqullinni bishaanii hir’ate akeekkachiisa ni kenna",
        "feat-data-title": "Xiinxala Daataa",
        "feat-data-desc": "Daataa darbe bifa fakkii fi chaartiitiin xiinxaluu",
        "feat-remote-title": "Bakka Jiruu To’achuu",
        "feat-remote-desc": "Interneetiin bakka jirtan hundatti hordofuu dandeessu",
        "status-section-title": "Haala Qulqullina Bishaan Ammee",
        "ph-label": "Sadarkaa pH",
        "temp-label": "Ho'ina (Temp)",
        "turb-label": "Bishaan xuraawaa",
        "tds-label": "TDS",
        "status-normal": "Normal",
        "status-good": "Gaarii",
        "status-mod": "Giddu-galeessa",
        "status-safe": "Nageenya",
        "tech-title": "Teknooloojii Fayyadamne",
        "team-title": "Garee Hojii",
        "contact-title": "Nu Quunnamaa",
        "bt-connect": "Bluetooth Connect",
        "bt-connected": "Xuraawaa",
      },
    };

    this.init();
  }

  init() {
    console.log("🚀 Water Monitoring System Initialized");
    this.initMobileMenu();
    this.initRealTimeUpdates();
    this.initDataTable();
    this.initSystemStatus();
    this.initNotifications();
    this.updateCurrentTime();
    this.setupAutoTimeUpdate();
    this.injectDynamicStyles();
    this.initEventListeners(); 
    this.updateUI();
  }

  initEventListeners() {
    // Language Toggle
    const langBtn = document.getElementById("lang-toggle");
    if (langBtn) {
      langBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.toggleLanguage();
      });
    }

    // --- NEW: Bluetooth Connect Button Listener ---
    const connectBtn = document.getElementById("connectBT");
    if (connectBtn) {
      connectBtn.addEventListener("click", () => this.connectToBluetooth());
    }

    const refreshBtn = document.getElementById("refreshBtn");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => this.handleRefresh());
    }
  }

  // ==================== NEW: BLUETOOTH ENGINE ====================
  async connectToBluetooth() {
    const statusEl = document.getElementById("status");
    const connectBtn = document.getElementById("connectBT");

    try {
      console.log("Searching for Bluetooth devices...");
      this.bluetoothDevice = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'HC' }], 
        optionalServices: ['0000ffe0-0000-1000-8000-00805f9b34fb']
      });

      if (statusEl) statusEl.innerText = "Connecting...";
      const server = await this.bluetoothDevice.gatt.connect();
      const service = await server.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
      this.terminalCharacteristic = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');

      await this.terminalCharacteristic.startNotifications();
      this.terminalCharacteristic.addEventListener('characteristicvaluechanged', (e) => this.handleIncomingData(e));
      
      this.isConnected = true;
      if (statusEl) statusEl.innerText = "Connected to HC-05";
      if (connectBtn) connectBtn.style.background = "#4CAF50";
      this.showNotification("Bluetooth Connected Successfully!", "success");

      // Stop simulated random data if Bluetooth is connected
      clearInterval(this.updateInterval);

    } catch (error) {
      console.error("Bluetooth Error:", error);
      this.showNotification("Bluetooth Connection Failed", "error");
    }
  }

  handleIncomingData(event) {
    let value = new TextDecoder().decode(event.target.value);
    console.log("Raw Bluetooth Data:", value);
    
    // Expecting CSV format from Arduino: "ph,temp,turb"
    let parts = value.split(',');
    if(parts.length >= 3) {
      this.updateSensorUI('ph', parts[0]);
      this.updateSensorUI('temperature', parts[1]);
      this.updateSensorUI('turbidity', parts[2]);
      this.updateLastUpdatedTime();
    }
  }

  updateSensorUI(sensor, val) {
    const el = document.getElementById(`${sensor}-value`);
    if (el) {
        // Ensure formatting matches original precision
        const numVal = parseFloat(val);
        const precision = this.sensorData[sensor] ? this.sensorData[sensor].precision : 1;
        const unit = this.sensorData[sensor] ? this.sensorData[sensor].unit : "";
        el.textContent = numVal.toFixed(precision) + unit;
    }
  }

  // ==================== EXISTING LOGIC ====================
  toggleLanguage() {
    this.currentLang = this.currentLang === "en" ? "om" : "en";
    localStorage.setItem("selectedLanguage", this.currentLang);
    this.updateUI();
    const msg = this.currentLang === "en" ? "Language: English" : "Afaan: Oromo";
    this.showNotification(msg, "success");
  }

  updateUI() {
    const langData = this.translations[this.currentLang];
    const langBtn = document.getElementById("lang-toggle");
    if (langBtn) {
      langBtn.innerHTML = this.currentLang === "en" ? '<i class="fas fa-language"></i> Afaan Oromo' : '<i class="fas fa-language"></i> English';
    }
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (langData[key]) el.innerHTML = langData[key];
    });
  }

  initRealTimeUpdates() {
    this.sensorData = {
      ph: { value: 7.2, min: 6.5, max: 8.5, unit: "", precision: 1 },
      temperature: { value: 24.3, min: 20, max: 30, unit: "°C", precision: 1 },
      turbidity: { value: 4.2, min: 0, max: 10, unit: " NTU", precision: 1 },
      tds: { value: 180, min: 0, max: 500, unit: " ppm", precision: 0 },
    };

    if (this.isAutoRefresh && !this.isConnected) {
      this.startAutoRefresh();
    }
  }

  startAutoRefresh() {
    this.updateInterval = setInterval(() => {
      this.updateAllSensorsSimulated();
    }, 5000);
  }

  updateAllSensorsSimulated() {
    Object.keys(this.sensorData).forEach((sensor) => {
      const data = this.sensorData[sensor];
      const variation = (Math.random() - 0.5) * 0.2;
      data.value = Math.max(0, data.value + variation);
      this.updateSensorUI(sensor, data.value);
    });
    this.updateLastUpdatedTime();
  }

  showNotification(message, type = "info") {
    const existing = document.querySelector(".notification");
    if (existing) existing.remove();
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `<span>${message}</span>`;
    document.body.appendChild(notification);
    setTimeout(() => { if (notification.parentNode) notification.remove(); }, 3000);
  }

  updateCurrentTime() {
    const dateElement = document.getElementById("currentDate");
    if (dateElement) {
      dateElement.textContent = new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    }
  }

  updateLastUpdatedTime() {
    const updateElement = document.getElementById("update-time");
    if (updateElement) updateElement.textContent = new Date().toLocaleTimeString();
  }

  setupAutoTimeUpdate() { setInterval(() => this.updateCurrentTime(), 60000); }

  initMobileMenu() {
    const mobileMenuBtn = document.querySelector(".mobile-menu");
    const navMenu = document.querySelector(".nav-menu");
    if (mobileMenuBtn && navMenu) {
      mobileMenuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        navMenu.classList.toggle("active");
        mobileMenuBtn.classList.toggle("active");
      });
    }
  }

  injectDynamicStyles() {
    const styles = `
      .notification { position: fixed; top: 20px; right: 20px; padding: 15px 25px; border-radius: 8px; color: white; z-index: 10000; animation: slideIn 0.3s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
      .notification.success { background: #4CAF50; }
      .notification.error { background: #f44336; }
      .notification.info { background: #2196F3; }
      @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      #lang-toggle { background: rgba(255,255,255,0.2); border: 1px solid white; color: white; padding: 5px 12px; border-radius: 4px; cursor: pointer; transition: 0.3s; margin-left: 10px; }
      #connectBT { cursor: pointer; transition: 0.3s; }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  initDataTable() {}
  initSystemStatus() {}
  initNotifications() {}
}

document.addEventListener("DOMContentLoaded", () => {
  window.waterMonitoringSystem = new WaterMonitoringSystem();
});
