// Additional chart functionality

// Initialize all charts on page load
document.addEventListener("DOMContentLoaded", function () {
  // Additional chart setup if needed
});

// Utility function to create gauge charts
function createGaugeChart(canvasId, value, maxValue, label) {
  const ctx = document.getElementById(canvasId).getContext("2d");

  // Calculate angle
  const angle = (value / maxValue) * Math.PI;

  // Draw gauge
  new Chart(ctx, {
    type: "doughnut",
    data: {
      datasets: [
        {
          data: [value, maxValue - value],
          backgroundColor: [getColorForValue(value, maxValue), "#f0f0f0"],
          borderWidth: 0,
          circumference: 180,
          rotation: 270,
        },
      ],
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
    plugins: [
      {
        id: "gaugeLabel",
        afterDraw: (chart) => {
          const {
            ctx,
            chartArea: { width, height },
          } = chart;
          ctx.save();
          ctx.font = "bold 20px Arial";
          ctx.fillStyle = "#333";
          ctx.textAlign = "center";
          ctx.fillText(value.toFixed(1), width / 2, height / 2 + 10);

          ctx.font = "12px Arial";
          ctx.fillStyle = "#666";
          ctx.fillText(label, width / 2, height / 2 + 30);

          ctx.restore();
        },
      },
    ],
  });
}

function getColorForValue(value, maxValue) {
  const percentage = value / maxValue;
  if (percentage < 0.3) return "#4CAF50"; // Green
  if (percentage < 0.7) return "#FF9800"; // Orange
  return "#F44336"; // Red
}

// Export functionality
function exportData(format = "csv") {
  const data = [
    ["Timestamp", "pH", "Temperature", "Turbidity", "TDS", "DO"],
    ["2024-01-15 10:00", 7.2, 24.3, 4.2, 180, 6.8],
    ["2024-01-15 09:00", 7.1, 23.8, 3.8, 175, 6.5],
    ["2024-01-15 08:00", 7.3, 22.9, 4.5, 190, 7.1],
    // Add more data as needed
  ];

  let content;
  if (format === "csv") {
    content = data.map((row) => row.join(",")).join("\n");
  } else if (format === "json") {
    content = JSON.stringify(
      data.slice(1).map((row) => ({
        timestamp: row[0],
        ph: row[1],
        temperature: row[2],
        turbidity: row[3],
        tds: row[4],
        do: row[5],
      })),
      null,
      2
    );
  }

  const blob = new Blob([content], {
    type: format === "csv" ? "text/csv" : "application/json",
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `water-quality-data.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
