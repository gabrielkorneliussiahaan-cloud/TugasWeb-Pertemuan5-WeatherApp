# Tugas Rutin 5 — Weather App

Weather App pakai OpenWeatherMap API, vanilla JavaScript (ES6+), tanpa
framework dan tanpa perlu proses build — tinggal buka `index.html`.

## Cara dapat API key OpenWeatherMap (gratis)

1. Buka https://openweathermap.org/api
2. Klik **Sign Up**, buat akun gratis (isi email & password).
3. Setelah login, buka menu profil → **My API keys**.
4. Akan ada key default bernama "Default", copy value-nya.
5. **Penting:** API key baru biasanya butuh 10 menit sampai 2 jam untuk
   aktif. Kalau baru daftar dan langsung dicoba masih error, tunggu
   sebentar lalu coba lagi.

## Cara pakai

1. Buka `app.js`.
2. Cari baris ini di paling atas:
   ```js
   const CONFIG = {
     apiKey: "GANTI_DENGAN_API_KEY_KAMU",
     ...
   };
   ```
3. Ganti `"GANTI_DENGAN_API_KEY_KAMU"` dengan API key kamu, contoh:
   ```js
   apiKey: "a1b2c3d4e5f6...",
   ```
4. Simpan, lalu buka `index.html` langsung di browser (double-click
   saja, atau pakai extension **Live Server** di VS Code).

## Fitur yang sudah dikerjakan

**Wajib:**
- ES6+ (const/let, arrow function, template literals) — lihat `app.js`
- `async`/`await` + Fetch API untuk ambil data cuaca & forecast
- Array method: `.filter()` (ambil 1 entri per hari, buang duplikat
  riwayat) dan `.map()` (bangun kartu HTML forecast & riwayat)
- Menampilkan kota, suhu, deskripsi, ikon cuaca, kelembaban, angin,
  dan tekanan udara
- Loading state saat data sedang diambil
- Error handling: kota tidak ditemukan (404) dan network error
  (dibedakan pesannya)
- UI responsif / mobile-friendly (`style.css`, mobile-first)

**Bonus (semua 3 dikerjakan):**
- Riwayat pencarian tersimpan di LocalStorage, bisa diklik ulang
- Toggle satuan suhu °C / °F (tanpa fetch ulang ke API)
- Forecast 5 hari ke depan

## Cara push ke GitHub

Sesuai instruksi tugas, nama repository harus
`TugasWeb-Pertemuan5-WeatherApp`:

```bash
git init
git add .
git commit -m "Tugas Rutin 5: Weather App"
git branch -M main
git remote add origin https://github.com/username/TugasWeb-Pertemuan5-WeatherApp.git
git push -u origin main
```

**Catatan keamanan:** untuk tugas kuliah, API key ditulis langsung di
`app.js` sudah cukup. Untuk proyek publik/produksi sungguhan, API key
sebaiknya tidak di-push ke repo publik — tapi karena syarat tugas
minta push ke repo publik, cukup sadari saja bahwa siapa pun bisa
melihat key kamu di kode. Kalau khawatir, generate API key baru
khusus untuk tugas ini.
