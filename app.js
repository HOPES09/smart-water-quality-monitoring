/**
 * Smart Water Quality Monitoring System
 * Professional JavaScript Implementation
 * Jimma University Institute of Technology - CBTP Project
 * Version: 1.1.0 (Language Support Added)
 */

class WaterMonitoringSystem {
  constructor() {
    this.sensorData = {};
    this.updateInterval = null;
    this.isAutoRefresh = true;
    // Load language from storage or default to English
    this.currentLang = localStorage.getItem("selectedLanguage") || "en";

    // Translation Dictionary
    this.translations = {
      en: {
        "nav-home": '<i class="fas fa-home"></i> Home',
        "nav-dash": '<i class="fas fa-gauge"></i> Live Dashboard',
        "nav-data": '<i class="fas fa-chart-line"></i> Data History',
        "nav-about": '<i class="fas fa-users"></i> About',
        "hero-title": "Smart Water Quality Monitoring System",
        "hero-subtitle":
          "Real-time monitoring of water parameters using IoT technology",
        "view-dash-btn": "View Live Dashboard",
        "features-title": "Key Features",
        "feat-rt-title": "Real-time Monitoring",
        "feat-rt-desc":
          "Continuous tracking of water quality parameters every 5 seconds",
        "feat-alert-title": "Instant Alerts",
        "feat-alert-desc":
          "Get notified when water quality exceeds safe limits",
        "feat-data-title": "Data Analytics",
        "feat-data-desc": "Historical data analysis with interactive charts",
        "feat-remote-title": "Remote Access",
        "feat-remote-desc":
          "Monitor water quality from anywhere using web interface",
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
      },
      om: {
        "nav-home": '<i class="fas fa-home"></i> Mana',
        "nav-dash": '<i class="fas fa-gauge"></i> Dashboard',
        "nav-data": '<i class="fas fa-chart-line"></i> Seenaa Daataa',
        "nav-about": '<i class="fas fa-users"></i> Waa’ee Keenya',
        "hero-title": "Sirna Hordoffii Qulqullina Bishaan Saayinsawaa",
        "hero-subtitle":
          "Teknooloojii IoT fayyadamuun qulqullina bishaanii hordofuu",
        "view-dash-btn": "Dashboard Ilaali",
        "features-title": "Dandeettiiwwan Ijoo",
        "feat-rt-title": "Hordoffii Yeroodhaa",
        "feat-rt-desc": "Sekondii 5 hundaatti jijjiirama bishaanii hordofuu",
        "feat-alert-title": "Akeekkachiisa Yeroodhaa",
        "feat-alert-desc":
          "Yoo qulqullinni bishaanii hir’ate akeekkachiisa ni kenna",
        "feat-data-title": "Xiinxala Daataa",
        "feat-data-desc": "Daataa darbe bifa fakkii fi chaartiitiin xiinxaluu",
        "feat-remote-title": "Bakka Jiruu To’achuu",
        "feat-remote-desc":
          "Interneetiin bakka jirtan hundatti hordofuu dandeessu",
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
    this.initEventListeners(); // Called last to ensure DOM is ready

    // Apply the saved language immediately on load
    this.updateUI();
  }

  // ==================== LANGUAGE ENGINE ====================
  initEventListeners() {
    const langBtn = document.getElementById("lang-toggle");
    if (langBtn) {
      // Use pointer events where available to handle touch and mouse uniformly
      let recentlyHandled = false;
      const langHandler = (e) => {
        if (e.type === "pointerdown") {
          e.preventDefault();
          recentlyHandled = true;
          this.toggleLanguage();
          setTimeout(() => (recentlyHandled = false), 700);
          return;
        }
        if (e.type === "click") {
          if (recentlyHandled) return; // ignore duplicate click after touch
          e.preventDefault();
          this.toggleLanguage();
        }
      };
      langBtn.addEventListener("pointerdown", langHandler);
      langBtn.addEventListener("click", langHandler);
    }

    const refreshBtn = document.getElementById("refreshBtn");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => this.handleRefresh());
    }

    const exportBtn = document.getElementById("exportBtn");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => this.exportData());
    }
  }

  toggleLanguage() {
    this.currentLang = this.currentLang === "en" ? "om" : "en";
    localStorage.setItem("selectedLanguage", this.currentLang);
    this.updateUI();

    // Close mobile nav if open (helps mobile UX)
    const navMenu = document.querySelector(".nav-menu");
    const mobileMenuBtn = document.querySelector(".mobile-menu");
    if (navMenu && navMenu.classList.contains("active")) {
      navMenu.classList.remove("active");
      if (mobileMenuBtn) mobileMenuBtn.classList.remove("active");
    }

    const msg =
      this.currentLang === "en" ? "Language: English" : "Afaan: Oromo";
    this.showNotification(msg, "success");
  }

  updateUI() {
    const langData = this.translations[this.currentLang];
    const langBtn = document.getElementById("lang-toggle");

    // Update Button Appearance
    if (langBtn) {
      langBtn.innerHTML =
        this.currentLang === "en"
          ? '<i class="fas fa-language"></i> Afaan Oromo'
          : '<i class="fas fa-language"></i> English';
    }

    // Update all elements with data-i18n
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (langData[key]) {
        el.innerHTML = langData[key];
      }
    });
  }

  // ==================== MOBILE MENU ====================
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

  // ==================== SENSOR LOGIC ====================
  initRealTimeUpdates() {
    this.sensorData = {
      ph: { value: 7.2, min: 6.5, max: 8.5, unit: "", precision: 1 },
      temperature: { value: 24.3, min: 20, max: 30, unit: "°C", precision: 1 },
      turbidity: { value: 4.2, min: 0, max: 10, unit: " NTU", precision: 1 },
      tds: { value: 180, min: 0, max: 500, unit: " ppm", precision: 0 },
    };

    if (this.isAutoRefresh) {
      this.startAutoRefresh();
    }
  }

  startAutoRefresh() {
    this.updateInterval = setInterval(() => {
      this.updateAllSensors();
    }, 5000);
  }

  updateAllSensors() {
    Object.keys(this.sensorData).forEach((sensor) => {
      const data = this.sensorData[sensor];
      const variation = (Math.random() - 0.5) * 0.2;
      data.value = Math.max(0, data.value + variation);

      // Update UI elements if they exist (dashboard/home)
      const el = document.getElementById(`${sensor}-value`);
      if (el) {
        el.textContent = data.value.toFixed(data.precision) + data.unit;
      }
    });
    this.updateLastUpdatedTime();
  }

  // ==================== NOTIFICATIONS ====================
  showNotification(message, type = "info") {
    const existing = document.querySelector(".notification");
    if (existing) existing.remove();

    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `<span>${message}</span>`;
    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) notification.remove();
    }, 3000);
  }

  // ==================== UTILS ====================
  updateCurrentTime() {
    const dateElement = document.getElementById("currentDate");
    if (dateElement) {
      dateElement.textContent = new Date().toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  }

  updateLastUpdatedTime() {
    const updateElement = document.getElementById("update-time");
    if (updateElement) {
      updateElement.textContent = new Date().toLocaleTimeString();
    }
  }

  setupAutoTimeUpdate() {
    setInterval(() => this.updateCurrentTime(), 60000);
  }

  // Empty stubs to prevent errors if specific sections are missing from certain pages
  initDataTable() {}
  initSystemStatus() {}
  initNotifications() {}

  injectDynamicStyles() {
    const styles = `
      .notification { position: fixed; top: 20px; right: 20px; padding: 15px 25px; border-radius: 8px; color: white; z-index: 10000; animation: slideIn 0.3s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
      .notification.success { background: #4CAF50; }
      .notification.info { background: #2196F3; }
      @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      #lang-toggle { background: rgba(255,255,255,0.2); border: 1px solid white; color: white; padding: 5px 12px; border-radius: 4px; cursor: pointer; transition: 0.3s; margin-left: 10px; }
      #lang-toggle:hover { background: white; color: #1a73e8; }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.waterMonitoringSystem = new WaterMonitoringSystem();
});
