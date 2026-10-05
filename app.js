// ====================================================================
// TUGAS RUTIN 5 — WEATHER APP (OpenWeatherMap API)
// ====================================================================

// ---------- KONFIGURASI: ganti dengan API key OpenWeatherMap kamu ----------
// Daftar gratis di https://openweathermap.org/api lalu ambil API key-nya
// dari halaman "My API Keys". API key baru biasanya butuh 10 menit - 2 jam
// sampai aktif, jadi jangan panik kalau awalnya masih gagal.
const CONFIG = {
  apiKey: "3d9a6eafb5c0cd34b2e47522314967fa",
  units: "metric", // OpenWeatherMap selalu diminta dalam Celsius, konversi ke °F dilakukan di sisi client
  historyKey: "weatherAppHistory",
  maxHistory: 8,
};

// ---------- Referensi elemen DOM ----------
const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const unitToggle = document.getElementById("unitToggle");

const loadingState = document.getElementById("loadingState");
const errorState = document.getElementById("errorState");
const errorMessage = document.getElementById("errorMessage");
const emptyState = document.getElementById("emptyState");
const weatherCard = document.getElementById("weatherCard");
const forecastSection = document.getElementById("forecastSection");

const cityName = document.getElementById("cityName");
const weatherDesc = document.getElementById("weatherDesc");
const weatherIcon = document.getElementById("weatherIcon");
const tempValue = document.getElementById("tempValue");
const feelsLikeValue = document.getElementById("feelsLikeValue");
const humidityValue = document.getElementById("humidityValue");
const windValue = document.getElementById("windValue");
const pressureValue = document.getElementById("pressureValue");
const forecastList = document.getElementById("forecastList");

const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistory");

// ---------- State aplikasi (ES6+: const/let, tidak pakai var) ----------
let currentUnit = "C"; // "C" atau "F", untuk toggle bonus
let lastWeatherData = null; // dipakai ulang saat toggle satuan supaya tidak fetch lagi

// ====================================================================
// REQUIREMENT: async/await + Fetch API
// ====================================================================

/**
 * Ambil data cuaca saat ini untuk satu kota.
 * REQUIREMENT: error handling untuk 404 (kota tidak ditemukan) dan
 * network error (koneksi gagal / server tidak terjangkau).
 */
const fetchCurrentWeather = async (city) => {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city,
  )}&units=${CONFIG.units}&appid=${CONFIG.apiKey}`;

  const response = await fetch(url);

  if (response.status === 404) {
    throw new Error("NOT_FOUND");
  }
  if (!response.ok) {
    throw new Error("SERVER_ERROR");
  }

  return response.json();
};

/**
 * Ambil data forecast 5 hari (bonus). Endpoint ini mengembalikan
 * data tiap 3 jam selama 5 hari (~40 entri).
 */
const fetchForecast = async (city) => {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
    city,
  )}&units=${CONFIG.units}&appid=${CONFIG.apiKey}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("FORECAST_ERROR");
  }

  return response.json();
};

// ====================================================================
// REQUIREMENT: minimal 1 array method (map / filter / reduce)
// Di app ini dipakai beberapa kali: .filter() untuk mengambil satu
// entri per hari dari forecast, .map() untuk mengubahnya jadi kartu
// HTML, dan .filter() lagi untuk mengelola riwayat pencarian.
// ====================================================================

/**
 * Dari ~40 entri per-3-jam, ambil satu entri per hari (jam 12 siang)
 * lalu ubah jadi bentuk yang siap ditampilkan.
 */
const buildDailyForecast = (forecastData) => {
  const noonEntries = forecastData.list.filter((item) =>
    item.dt_txt.includes("12:00:00"),
  );

  return noonEntries.map((item) => ({
    date: new Date(item.dt * 1000),
    temp: item.main.temp,
    icon: item.weather[0].icon,
    description: item.weather[0].description,
  }));
};

// ====================================================================
// UI: loading / error / empty state
// ====================================================================

const setLoading = (isLoading) => {
  loadingState.hidden = !isLoading;
  if (isLoading) {
    errorState.hidden = true;
    emptyState.hidden = true;
  }
};

const showError = (message) => {
  errorMessage.textContent = message;
  errorState.hidden = false;
  weatherCard.hidden = true;
  forecastSection.hidden = true;
  emptyState.hidden = true;
};

const clearError = () => {
  errorState.hidden = true;
};

// ====================================================================
// Konversi & format suhu (mendukung toggle °C/°F)
// ====================================================================

const celsiusToFahrenheit = (celsius) => (celsius * 9) / 5 + 32;

const formatTemp = (celsius) => {
  const value = currentUnit === "C" ? celsius : celsiusToFahrenheit(celsius);
  return `${Math.round(value)}°${currentUnit}`;
};

// ====================================================================
// Render hasil ke DOM
// REQUIREMENT: tampilkan kota, suhu, deskripsi, ikon, kelembaban
// ====================================================================

const renderWeather = (data) => {
  const { name, sys, main, weather, wind } = data;
  const condition = weather[0];

  cityName.textContent = `${name}, ${sys.country}`;
  weatherDesc.textContent = condition.description;
  weatherIcon.src = `https://openweathermap.org/img/wn/${condition.icon}@2x.png`;
  weatherIcon.alt = condition.description;

  tempValue.textContent = formatTemp(main.temp);
  feelsLikeValue.textContent = formatTemp(main.feels_like);
  humidityValue.textContent = `${main.humidity}%`;
  windValue.textContent = `${wind.speed} m/s`;
  pressureValue.textContent = `${main.pressure} hPa`;

  weatherCard.hidden = false;
};

const renderForecast = (dailyForecast) => {
  const dayFormatter = new Intl.DateTimeFormat("id-ID", { weekday: "short" });

  // REQUIREMENT: .map() dipakai untuk mengubah data jadi template HTML
  forecastList.innerHTML = dailyForecast
    .map(
      (day) => `
        <div class="forecast-card">
          <p class="forecast-card__day">${dayFormatter.format(day.date)}</p>
          <img
            class="forecast-card__icon"
            src="https://openweathermap.org/img/wn/${day.icon}.png"
            alt="${day.description}"
          />
          <p class="forecast-card__temp"><strong>${formatTemp(day.temp)}</strong></p>
        </div>
      `,
    )
    .join("");

  forecastSection.hidden = dailyForecast.length === 0;
};

// ====================================================================
// Riwayat pencarian (bonus, pakai LocalStorage)
// ====================================================================

const getHistory = () => {
  const raw = localStorage.getItem(CONFIG.historyKey);
  return raw ? JSON.parse(raw) : [];
};

const saveHistory = (history) => {
  localStorage.setItem(CONFIG.historyKey, JSON.stringify(history));
};

const addToHistory = (city) => {
  const history = getHistory();

  // REQUIREMENT: .filter() untuk membuang duplikat sebelum kota baru
  // ditambahkan ke paling depan daftar riwayat.
  const withoutDuplicate = history.filter(
    (item) => item.toLowerCase() !== city.toLowerCase(),
  );

  const updated = [city, ...withoutDuplicate].slice(0, CONFIG.maxHistory);
  saveHistory(updated);
  renderHistory();
};

const renderHistory = () => {
  const history = getHistory();

  // REQUIREMENT: .map() lagi untuk mengubah daftar kota jadi tombol chip
  historyList.innerHTML = history
    .map(
      (city) =>
        `<button type="button" class="history-chip" data-city="${city}">${city}</button>`,
    )
    .join("");
};

clearHistoryBtn.addEventListener("click", () => {
  localStorage.removeItem(CONFIG.historyKey);
  renderHistory();
});

historyList.addEventListener("click", (event) => {
  const chip = event.target.closest(".history-chip");
  if (!chip) return;
  cityInput.value = chip.dataset.city;
  handleSearch(chip.dataset.city);
});

// ====================================================================
// Alur pencarian utama
// ====================================================================

const handleSearch = async (city) => {
  setLoading(true);

  try {
    const [weatherData, forecastData] = await Promise.all([
      fetchCurrentWeather(city),
      fetchForecast(city),
    ]);

    lastWeatherData = weatherData;
    clearError();
    renderWeather(weatherData);
    renderForecast(buildDailyForecast(forecastData));
    addToHistory(weatherData.name);
  } catch (error) {
    // REQUIREMENT: error handling — bedakan pesan untuk 404 vs network error
    if (error.message === "NOT_FOUND") {
      showError(`Kota "${city}" tidak ditemukan. Coba periksa ejaannya.`);
    } else if (error instanceof TypeError) {
      // fetch melempar TypeError saat benar-benar gagal terhubung ke jaringan
      showError("Gagal terhubung ke server. Periksa koneksi internetmu.");
    } else {
      showError("Terjadi kesalahan saat mengambil data cuaca. Coba lagi.");
    }
  } finally {
    setLoading(false);
  }
};

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const city = cityInput.value.trim();
  if (!city) return;
  handleSearch(city);
});

// ====================================================================
// Toggle satuan °C / °F (bonus) — pakai ulang data terakhir, tidak fetch lagi
// ====================================================================

unitToggle.addEventListener("click", () => {
  currentUnit = currentUnit === "C" ? "F" : "C";
  unitToggle.textContent = `°${currentUnit}`;
  unitToggle.setAttribute("aria-pressed", currentUnit === "F");

  if (lastWeatherData) {
    renderWeather(lastWeatherData);
  }
});

// ====================================================================
// Inisialisasi
// ====================================================================

renderHistory();
