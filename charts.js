/**
 * Smart Water Quality Monitoring System - Charts Logic
 * Handles Gauge creation and Historical Line Charts
 */

document.addEventListener("DOMContentLoaded", function () {
  // Check if we are on the Data History page (has historicalChart canvas)
  const historyCtx = document.getElementById('historicalChart');
  if (historyCtx) {
    initHistoricalChart(historyCtx);
  }

  // Check if we are on the Dashboard (has gauge canvases)
  // Example: createGaugeChart('phGauge', 7.2, 14, 'pH Level');
});

// ==================== HISTORICAL LINE CHART ====================
function initHistoricalChart(ctx) {
  const labels = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'pH Level',
          data: [7.1, 7.2, 7.0, 7.4, 7.2, 7.1, 7.3],
          borderColor: '#1a73e8',
          backgroundColor: 'rgba(26, 115, 232, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Temperature (°C)',
          data: [22, 23, 24, 24.5, 24, 23.5, 23],
          borderColor: '#f44336',
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
      },
      scales: {
        y: { beginAtZero: false }
      }
    }
  });
}

// ==================== GAUGE CHART LOGIC ====================
function createGaugeChart(canvasId, value, maxValue, label) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  new Chart(ctx, {
    type: "doughnut",
    data: {
      datasets: [{
        data: [value, maxValue - value],
        backgroundColor: [getColorForValue(value, maxValue), "#e0e0e0"],
        borderWidth: 0,
        circumference: 180,
        rotation: 270,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "80%",
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
      },
    },
    plugins: [{
      id: "gaugeLabel",
      afterDraw: (chart) => {
        const { ctx, chartArea: { width, height } } = chart;
        ctx.save();
        
        // Value Text
        ctx.font = "bold 22px sans-serif";
        ctx.fillStyle = "#333";
        ctx.textAlign = "center";
        ctx.fillText(value.toFixed(1), width / 2, height / 2 + 10);

        // Label Text
        ctx.font = "14px sans-serif";
        ctx.fillStyle = "#666";
        ctx.fillText(label, width / 2, height / 2 + 35);
        ctx.restore();
      },
    }],
  });
}

function getColorForValue(value, maxValue) {
  const percentage = value / maxValue;
  if (percentage < 0.4) return "#4CAF50"; // Good
  if (percentage < 0.8) return "#FF9800"; // Warning
  return "#F44336"; // Danger
}

// ==================== EXPORT DATA ====================
function exportData(format = "csv") {
  const data = [
    ["Timestamp", "pH", "Temperature", "Turbidity", "TDS"],
    [new Date().toLocaleString(), 7.2, 24.3, 4.2, 180]
  ];

  let content = format === "csv" 
    ? data.map(e => e.join(",")).join("\n")
    : JSON.stringify(data);

  const blob = new Blob([content], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `water-data-${new Date().getTime()}.${format}`;
  a.click();
}
