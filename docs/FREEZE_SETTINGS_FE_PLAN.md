# Rencana — Pengaturan Freeze (Frontend Web)

Pasangan dokumen ini: [migios-be/docs/FREEZE_SETTINGS_PLAN.md](../../migios-be/docs/FREEZE_SETTINGS_PLAN.md).

Status per 6 Agustus 2026: **Fase A–E selesai, seluruh kartu tersambung ke backend.**
Badge `Rancangan` sudah tidak ada — kedelapan field benar-benar tersimpan.

Dibuktikan lewat browser sungguhan, bukan hanya `curl`: mengisi H-5, 20 hari/bulan, jenis biaya
Per hari Rp 7.500, lalu Simpan → kelima kolom berubah di database. Diuji di mode gelap dan terang,
dan nilainya dikembalikan ke `3 / 14 / 1 / none / 0` setelah verifikasi.

---

## 0. Keputusan yang diambil saat implementasi

Teks fase di bawah sudah diselaraskan dengan kode yang dikirim. Bagian ini mencatat **kenapa** tiga
hal berbeda dari rancangan awal.

- **`PERSISTED_FIELDS` dihapus, bukan ditambahi.** Konstanta itu lahir karena dulu sebagian field
  tidak ikut tersimpan, sehingga tombol Simpan tidak boleh menyala hanya karena field rancangan
  diubah. Sekarang kedelapan field tersimpan, jadi penjaganya cukup `formState.isDirty` bawaan
  react-hook-form. Menambahi konstanta yang sudah kehilangan alasan keberadaannya hanya menyisakan
  kode mati.

- **Dua form kasir diubah, bukan satu.** Rancangan awal hanya menyebut `FormGlobalFreeze.tsx`.
  Aturan yang sama ternyata disalin di `FormFreeze.tsx`; memperbaiki satu saja membuat detail member
  dan daftar freeze berbeda perilaku — persis kesalahan yang dilarang di §2.

- **Kartu "Kebijakan Freeze" dibuang seluruhnya dari halaman Keanggotaan**, termasuk tiga switch
  yang kolomnya masih ada. Dua form yang menulis kolom yang sama dari dua halaman akan saling
  menimpa, dan tab Freeze sekarang sudah memilikinya.

## 1. Yang sudah selesai

Halaman [src/pages/master/setting/others/freeze/index.tsx](../src/pages/master/setting/others/freeze/index.tsx)
di rute `/settings/others/freeze`, tab paling kanan di Pengaturan → Lainnya, sebelah Transfer Paket.

- [x] Rute didaftarkan di [othersSettings.route.ts:58](../src/routes/pages/settings/othersSettings.route.ts)
- [x] Tab ditambahkan di [others/Layout.tsx:18](../src/pages/master/setting/others/Layout.tsx)
- [x] Kartu **Freeze Membership** — tiga switch, tersambung ke backend dan benar-benar tersimpan
- [x] Kartu **Biaya Freeze** — tersambung dan tersimpan
- [x] Kartu **Batas Freeze** — tersambung dan tersimpan
- [x] Seluruh nilai lewat yup + react-hook-form + `FormFieldItem`; tidak ada `useState` untuk nilai form
- [x] Skema form hanya berisi field yang benar-benar ditampilkan — empat kolom lama sudah dibuang
      dari skema, `INITIAL_SETTINGS`, `reset()`, dan payload
- [x] Nama field disamakan dengan calon nama kolom backend, jadi penyambungan tidak perlu rename

### Inventaris field saat ini

| Field | Tipe | Batas yup | `INITIAL_SETTINGS` | Tersimpan? |
| --- | --- | --- | --- | --- |
| `freeze_enabled` | boolean | — | `true` | ✅ |
| `freeze_require_approval` | boolean | — | `true` | ✅ |
| `freeze_extend_end_date` | boolean | — | `true` | ✅ |
| `freeze_fee_type` | `none` / `flat` / `per_day` | — | `"none"` | ✅ |
| `freeze_fee_amount` | number | ≥ 0 | `0` | ✅ |
| `freeze_min_advance_days` | number | 0–365 | `3` | ✅ |
| `freeze_max_days_per_month` | number | 0–31 | `14` | ✅ |
| `freeze_max_request_per_month` | number | ≥ 0 | `1` | ✅ |

Batas yup di kolom ketiga sama persis dengan `@Min`/`@Max` di `UpdateSettingsDto`, dan ada tes
di backend yang menjaganya tetap sama. Kalau berbeda, pengguna lolos di browser lalu ditolak server.

Isian lama — Durasi Minimal, Durasi Maksimal per Pengajuan, Kuota Hari per Tahun, Kuota Pengajuan
per Tahun — sudah hilang dari layar **dan** kolomnya sudah dibuang dari database.

### `PERSISTED_FIELDS` sudah dihapus

Konstanta itu ada karena dua kartu dulu tidak ikut tersimpan, jadi tombol Simpan tidak boleh menyala
hanya karena field rancangan diubah. Sekarang seluruh field tersimpan, sehingga penjaganya cukup
`formState.isDirty` bawaan react-hook-form.

---

## Fase A — Sambungkan Biaya Freeze

- [x] Tambah `freeze_fee_type` dan `freeze_fee_amount` ke
      [@types/settings/settings.ts](../src/services/api/@types/settings/settings.ts)
- [x] Masukkan keduanya ke payload `apiUpdateSettings`
- [x] Baca nilainya dari `settingsData` di dalam `reset()`
- [x] Hapus badge `Rancangan` dan paragraf "belum tersimpan" dari kartu
- [x] Perbaiki ketidakcocokan yang sudah ada: `.default(50000)` di yup vs `0` di `INITIAL_SETTINGS`
      — samakan jadi `0`

## Fase B — Sambungkan Batas Freeze

- [x] Tambah `freeze_min_advance_days`, `freeze_max_days_per_month`,
      `freeze_max_request_per_month` ke tipe settings dan payload
- [x] Baca nilainya di `reset()`
- [x] Hapus badge `Rancangan`
- [x] Backend memilih **bulan kalender**, jadi teks "dalam satu bulan berjalan" tetap benar dan
      tidak perlu diubah
- [x] Ringkasan kalimat dipertahankan — itu yang membuat kombinasi mustahil ketahuan sebelum disimpan
- [x] `INITIAL_SETTINGS` **tidak perlu diubah** — default kolom backend justru disalin dari sini
      (§3 rencana backend). Bila salah satu angkanya diubah di sini, `@default` di Prisma harus
      ikut diubah, kalau tidak klub baru menyimpang dari prototipe.

## Fase C — Layar kasir: biaya berhenti bisa diketik

Ini alasan sebenarnya Fase A dikerjakan. Kolom pembayaran dulu `InputCurrency` bebas ketik yang
nilainya dipakai mentah oleh backend; sekarang tampilan terkunci berisi hasil hitungan.

**Dua layar, satu hook.** Aturannya disalin di dua tempat —
[FormFreeze.tsx](../src/components/form/member/freeze/FormFreeze.tsx) (detail member) dan
[FormGlobalFreeze.tsx](../src/components/form/member/freeze/FormGlobalFreeze.tsx) (daftar freeze).
Keduanya sekarang memakai
[useFreezeRequest.ts](../src/components/form/member/freeze/useFreezeRequest.ts) supaya tidak bisa
berbeda perilaku.

- [x] Baca `fee_type` + `fee_amount` dari `GET /member/freeze-quota/:code`, bukan menghitung ulang
      di komponen
- [x] Ganti input bebas menjadi tampilan terkunci berisi hasil hitungan
- [x] Angka ikut berubah saat rentang tanggal diubah (khusus `per_day`), dan `balance_amount`
      beserta `payments[0].amount` ikut disetel ulang supaya tidak basi
- [x] `Rp 0` untuk `none`, tetap terkunci
- [x] Jangan menyembunyikan kolomnya — kasir tetap perlu melihat berapa yang ditagih

## Fase D — Layar kasir: batas tanggal dan kuota bulanan

- [x] Dua date picker terpisah diganti **satu kolom rentang**
      ([FreezePeriodPicker.tsx](../src/components/form/member/freeze/FreezePeriodPicker.tsx)).
      Kolomnya menampilkan `15 Agt 2026 – 20 Agt 2026 · 6 hari`, jadi durasinya terbaca tanpa
      menghitung sendiri
- [x] **Sekali klik tanggal mulai, tanggal selesai terisi sampai batas jatah.** Itu durasi
      terpanjang yang sah, sehingga kasus tersering selesai dengan satu klik. Klik kedua
      memendekkannya
- [x] **Klik ulang tanggal mulai memberi freeze satu hari.** Perapian nilai awal hanya dijalankan
      sekali per pembukaan form — kalau dijalankan tiap kali tanggal berubah, ia membaca "selesai =
      mulai" sebagai kolom yang belum diisi lalu menimpanya kembali jadi rentang penuh
- [x] Urutan klik dikendalikan komponen, tidak diserahkan ke DayPicker. Perilaku bawaannya selalu
      memperpanjang dari tanggal mulai lama, sehingga tanggal mulai tidak pernah bisa dipindah
      tanpa menghapus dulu
- [x] Kalender memblokir tanggal sebelum `earliest_start_date`, dan saat menunggu klik kedua juga
      memblokir yang melewati jatah. Mulai 15 Agustus dengan jatah 14 hari → 29–31 mati
- [x] `earliest_start_date` **dihitung server** dan dikirim di endpoint kuota, jadi klien tidak
      menirukan aturan H- sendiri
- [x] `start_date` bawaan form adalah hari ini, dan `end_date` juga — melanggar aturan H- sekaligus
      membentuk rentang 1 hari yang justru ditolak backend. Begitu kuota termuat, periodenya
      dirapikan sekali jadi rentang penuh yang sah. Hanya nilai di luar aturan yang digeser
- [x] Endpoint kuota dipanggil dengan `start_date` yang sedang dipilih. Tanpa ini layar menampilkan
      sisa jatah **bulan berjalan** sementara checkout menegakkan jatah **bulan tanggal mulai** —
      dua angka berbeda untuk aturan yang sama
- [x] Sisa jatah **bulan berjalan** ditampilkan sebelum staf memilih tanggal, bukan setelah ditolak
- [x] Pesan penolakan dari backend ditampilkan apa adanya — jangan diterjemahkan ulang di klien,
      karena teksnya akan berbeda dari yang sebenarnya ditegakkan

## Fase E — Bersihkan sisa kolom lama

- [x] Hapus `freeze_min_days`, `freeze_max_days_per_request`, `freeze_max_days_per_year`,
      `freeze_max_request_per_year` dari [@types/settings/settings.ts](../src/services/api/@types/settings/settings.ts)
- [x] Halaman Keanggotaan
      ([others/membership/index.tsx](../src/pages/master/setting/others/membership/index.tsx))
      masih punya ketujuh setting freeze lama. Kartu **Kebijakan Freeze** dibuang seluruhnya dari
      halaman itu — bukan hanya empat isian yang kolomnya hilang, tapi juga tiga switch yang masih
      valid, karena tab Freeze sekarang sudah memilikinya. Dua form yang menulis kolom yang sama
      dari dua halaman adalah undangan untuk saling menimpa.
- [x] `FreezeQuota` di [@types/freeze.ts](../src/services/api/@types/freeze.ts) juga memuat nama
      field lama dan ikut disesuaikan:
      `min_days` / `max_days_per_request` / `max_days_per_year` / `max_request_per_year` diganti
      `min_advance_days` / `max_days_per_month` / `max_request_per_month` + `earliest_start_date`

---

## 2. Yang harus dihindari

- **Jangan menghitung ulang aturan di komponen.** Ambil angkanya dari endpoint kuota. Preseden buruk
  di repo ini: SQL "member aktif" pernah ditulis tangan 24 kali dan bercabang jadi empat perilaku.
- **Jangan menulis label yang tidak ditegakkan backend.** Ini sudah beres — jendelanya kini
  benar-benar bulanan di kedua sisi — tapi aturannya tetap berlaku untuk perubahan berikutnya.
- **Jangan pakai `useState` untuk nilai form.** Konvensi repo ini yup + react-hook-form +
  `FormFieldItem`.
- **Jangan bikin komponen baru sebelum memeriksa pola yang ada.** Halaman Transfer Paket adalah
  acuan terdekat: Card bertumpuk, `FormFieldItem` selebar penuh, radio bergaya kartu.

---

## 3. Gerbang sebelum selesai

- [x] `npm run typecheck` bersih untuk berkas yang disentuh. Sisa error di berkas lain sudah ada
      sebelum perubahan ini dan tidak disentuh
- [x] `npm run lint` bersih untuk seluruh `src`
- [x] Transform Vite 200 untuk keenam berkas yang disentuh
- [x] Muat halaman di browser dan **simpan sungguhan**, lalu baca ulang lewat API untuk memastikan
      nilainya benar-benar berubah — toast bukan bukti
- [x] Uji mode terang dan gelap
- [x] Data uji dipulihkan setelah verifikasi
