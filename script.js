// --- Utility Functions ---
    function getTodayKey() {
      return new Date().toISOString().slice(0, 10);
    }

    function loadData() {
      const data = JSON.parse(localStorage.getItem("cryData")) || {};
      const today = getTodayKey();

      if (!data[today]) {
        const yesterday = Object.keys(data).sort().pop();
        data[today] = 0;
        localStorage.setItem("cryData", JSON.stringify(data));
        return { data, today, yesterday };
      }

      const yesterday = Object.keys(data)
        .filter((d) => d !== today)
        .sort()
        .pop();

      return { data, today, yesterday };
    }

    function saveData(data) {
      localStorage.setItem("cryData", JSON.stringify(data));
    }

    function updateUI(data, today, yesterday) {
      cryCounter.textContent = data[today].toString().padStart(2, "0");
      yesterdayCount.textContent = `Yesterday he cried ${data[yesterday] || 0} times`;

      const allDays = Object.keys(data).sort().slice(-7);
      const weekTotal = allDays.reduce((sum, key) => sum + (data[key] || 0), 0);
      weekCount.textContent = `${weekTotal} times this week`;
    }

    // --- Chart Rendering Function ---
    function renderChart(weeksAgo = 0) {
      const ctx = document.getElementById("cryChart").getContext("2d");
      const rawData = JSON.parse(localStorage.getItem("cryData")) || {};

      // Calculate the start of the selected week (Monday)
      const today = new Date();
      today.setDate(today.getDate() - (weeksAgo * 7));
      const dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Monday
      const monday = new Date(today.setDate(diff));

      const last7Days = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        const dateKey = date.toISOString().slice(0, 10);
        last7Days.push(dateKey);
      }


      const labels = last7Days.map(date => {
        const d = new Date(date);
        return d.toLocaleDateString("en-US", { weekday: "short" });
      });

      const values = last7Days.map(date => rawData[date] || 0);

      const dayColors = {
        'Mon': '#FF6B6B',  // Coral Red
        'Tue': '#4ECDC4',  // Turquoise
        'Wed': '#FFD93D',  // Yellow
        'Thu': '#6C5CE7',  // Purple
        'Fri': '#A8E6CF',  // Mint
        'Sat': '#FF8B94',  // Pink
        'Sun': '#98DDCA'   // Seafoam
      };

      const backgroundColors = labels.map(label => dayColors[label.substring(0,3)]);


      if (window.cryChartInstance) {
        window.cryChartInstance.destroy();
      }

      window.cryChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [{
            label: "Cries per Day",
            data: values,
            backgroundColor: backgroundColors,
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: ctx => `${ctx.raw} cries`
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              stepSize: 1
            }
          }
        }
      });
    }

    // --- DOM Elements ---
    const cryCounter = document.getElementById("cryCount");
    const cryButton = document.getElementById("cryButton");
    const yesterdayCount = document.getElementById("yesterdayCount");
    const weekCount = document.getElementById("weekCount");
    const toggleViewBtn = document.getElementById("toggleView");
    const backButton = document.getElementById("backButton");
    const mainView = document.getElementById("mainView");
    const chartView = document.getElementById("chartView");

    // --- Setup UI on Page Load ---
    document.addEventListener("DOMContentLoaded", () => {
      let { data, today, yesterday } = loadData();
      updateUI(data, today, yesterday);

      cryButton.addEventListener("click", () => {
        data[today]++;
        saveData(data);
        updateUI(data, today, yesterday);
      });

      const weekSelector = document.getElementById("weekSelector");
      
      toggleViewBtn.addEventListener("click", () => {
        mainView.style.display = "none";
        chartView.style.display = "flex";
        backButton.style.display = "block";
        weekSelector.style.display = "inline-block";
        toggleViewBtn.style.display = "none";
        renderChart(parseInt(weekSelector.value));
      });

      weekSelector.addEventListener("change", () => {
        renderChart(parseInt(weekSelector.value));
      });

      backButton.addEventListener("click", () => {
        chartView.style.display = "none";
        mainView.style.display = "block";
        backButton.style.display = "none";
        toggleViewBtn.style.display = "block";
      });
    });
