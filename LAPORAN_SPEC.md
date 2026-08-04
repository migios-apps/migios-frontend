# LAPORAN_SPEC.md — Suite Laporan Migios

Spesifikasi dan rencana implementasi untuk 6 menu **Laporan**.
Ruang lingkup pengerjaan hanya dua folder: **`migios-be/`** dan **`migios-shadcn/`**.
Path yang diawali `../migios-be/` merujuk backend; sisanya relatif terhadap `migios-shadcn/`.

---

## 1. Latar belakang

Menu **Laporan** sudah ada di sidebar dengan 6 sub-menu, tetapi **belum ada satupun halaman,
route, atau endpoint** yang mendukungnya:

- Nav: [src/config/navigation.config/migios.navigation.tsx](src/config/navigation.config/migios.navigation.tsx) baris 176-224 — 6 item sudah terdaftar.
- Route: [src/routes/protectedRoute.ts](src/routes/protectedRoute.ts) baris 68-71 — masih dikomentari.
- Tidak ada folder `src/pages/master/reports/`, tidak ada `src/routes/pages/reports.route.ts`.

Yang sudah ada dan bisa dijadikan preseden:

| Aset | Lokasi |
|---|---|
| Rekap penjualan 12 baris | [../migios-be/src/module/sales/report-sales.service.ts](../migios-be/src/module/sales/report-sales.service.ts) → `GET /api/v1/sales/report` + `/sales/report/by-rekening` |
| Chart overview dashboard | [../migios-be/src/module/report/overview.service.ts](../migios-be/src/module/report/overview.service.ts) → `determineRangeType` + back-fill bucket |
| Halaman laporan terdekat | [src/pages/master/sales/PenjualanHarian/index.tsx](src/pages/master/sales/PenjualanHarian/index.tsx) — 1 tabel + 2 pie chart |
| Pola tab per menu | [src/pages/master/sales/Layout.tsx](src/pages/master/sales/Layout.tsx) |
| KPI card + area chart | [src/pages/dashboard/components/Overview.tsx](src/pages/dashboard/components/Overview.tsx) |

**Tujuan:** setiap menu laporan berisi **banyak sub-laporan dengan KPI, grafik, dan analitik** —
bukan satu tabel.

**Keputusan yang sudah diambil:**
1. Dokumen ini memuat katalog laporan **dan** rencana implementasi teknis.
2. Katalog hanya memuat yang **bisa dihitung dari tabel yang ada sekarang**. Hal yang butuh tabel
   baru dipisahkan ke [Bagian 6](#6-di-luar-cakupan).
3. Struktur tiap menu = **tab di dalam menu**, mengikuti pola `SalesLayout`.

---

## 2. Temuan mendesak — ✅ sudah diperbaiki

Tiga hal ditemukan saat menelusuri kode. Semuanya sudah diperbaiki sebelum pembangunan laporan
dimulai.

### 2.1 ✅ `/api/v1/report/sales` bocor lintas tenant

[../migios-be/src/module/report/report.controller.ts](../migios-be/src/module/report/report.controller.ts)
tidak punya `@UseGuards(JwtAuthGuard)` dan tidak memfilter `club_id` — pemanggil anonim mendapat
penjualan **seluruh club**. Sudah dicek: endpoint ini tidak dipakai satupun klien
(`src/services/api/analytic.ts` hanya memanggil `/report/overview` dan `/report/head`; Flutter
tidak memanggil sama sekali), jadi aman diperbaiki langsung.

**Perbaikan:** `@UseGuards(JwtAuthGuard)` + `@GetUser() user` di controller;
`ReportService.getSalesReport(filters, user)` kini menolak user tanpa club (`CustomException` +
`ErrorCode.NOT_FOUND`, pola sama dengan `getReportHead`) dan menambahkan
`.where('transactions.club_id', '=', user.club_id)`.

### 2.2 ✅ Kolom `transaction_items.total` tidak ada

Dipakai di `report.service.ts:27` dan `overview.service.ts:159`; nama sebenarnya `total_amount`.
Query gagal di database. Jalur `overview.service.ts` hanya jalan bila `sale_type` diisi —
dashboard tidak pernah mengisinya, itu sebabnya bug ini belum terlihat.

**Perbaikan:** kedua titik diganti ke `transaction_items.total_amount`.

### 2.3 ✅ Refund mengurangi stok dua kali

[../migios-be/src/module/sales/refund.service.ts](../migios-be/src/module/sales/refund.service.ts)
memanggil `handleVoidProduct(tx, item.product_id, item.quantity)` padahal `item.quantity`
**sudah negatif** (lihat komentar di baris 280), sementara
[../migios-be/src/module/sales/utils/void/processing.data.ts](../migios-be/src/module/sales/utils/void/processing.data.ts)
baris 59-67 melakukan `product.quantity + quantity`. Jadi refund **mengurangi** stok lagi
alih-alih mengembalikannya. Void benar (`void.service.ts:116` mengirim quantity positif dari item
transaksi asli).

**Perbaikan:** call site refund kini mengirim `Math.abs(item.quantity)`, jadi stok selalu
bertambah berapapun tanda quantity di payload.

> ⚠️ **Perbaikan kode tidak memulihkan data yang sudah rusak.** Produk yang pernah di-refund masih
> menyimpan stok yang salah di database dan **harus dihitung ulang secara fisik** sebelum laporan
> stok (`4.3` Tab 3) dipercaya.

### 2.4 ✅ Indeks laporan

12 indeks komposit ditambahkan ke skema, migrasi ada di
`prisma/migrations/20260804070000_add_report_indexes/`. Semuanya `CREATE INDEX` murni — tidak ada
perubahan kolom, tabel, atau relasi.

| Tabel | Indeks | Untuk |
|---|---|---|
| `transactions` | `(club_id, created_at)`, `(club_id, due_date)` | seluruh rentang tanggal penjualan, kedua basis tanggal `use_invoice_date` |
| `transaction_items` | `(transaction_id, item_type)` | breakdown per kategori item |
| `payments` | `(rekening_id, date)` | penerimaan per rekening |
| `attendances` | `(club_id, date)`, `(club_id, type, date)` | kehadiran member & karyawan |
| `employee_commissions` | `(employee_id, due_date)`, `(employee_id, type, due_date)` | komisi (tabel ini tidak punya `club_id`) |
| `member_packages` | `(club_id, status, end_date)`, `(club_id, package_type, end_date)` | keanggotaan aktif & akan berakhir |
| `financial_records` | `(club_id, date)`, `(club_id, type, date)` | arus kas, pemasukan, pengeluaran |

**Belum di-apply ke database remote.** `prisma migrate deploy` masih perlu dijalankan manual.
Catatan: `CREATE INDEX` biasa mengambil lock `ACCESS EXCLUSIVE` dan memblokir tulis selama
pembuatan; kalau tabel `transactions`/`transaction_items` sudah besar, jalankan di jam sepi atau
ubah ke `CREATE INDEX CONCURRENTLY` yang dieksekusi manual di luar Prisma (Prisma membungkus tiap
migrasi dalam transaksi, dan `CONCURRENTLY` tidak boleh di dalam transaksi).

> Catatan terpisah: `prisma migrate diff` terhadap database remote memperlihatkan **drift lain yang
> sudah ada sebelumnya** dan tidak berhubungan dengan pekerjaan ini (`packages.loyalty_point`,
> `event_deleted_event_id_idx`, beberapa rename constraint di `member_loyalty_point`). Drift itu
> sengaja **tidak** dimasukkan ke migrasi ini.

### 2.5 ✅ Modularisasi modul `report`

Isi `migios-be/src/module/report/` semuanya adalah laporan untuk **dashboard**, tapi diletakkan
datar di akar folder dengan nama generik (`report.controller.ts`, `report.service.ts`). Kalau 6
domain laporan baru ditambahkan ke sana, akar folder akan berisi belasan file tanpa pemilik yang
jelas.

**Perbaikan:** dipecah jadi sub-folder per area, mengikuti pola yang sudah ada di
`src/module/settings/` (`commission/`, `loyalty/`, `taxes/` — masing-masing punya `.module.ts`,
`.controller.ts`, `.service.ts`, dan `dto/` sendiri). Lihat [5.2](#52-struktur-backend-migios-be)
untuk struktur akhirnya.

**Perubahan kontrak API:**

| URL | Status |
|---|---|
| `GET /api/v1/report/dashboard/overview` | **baru** — kanonik |
| `GET /api/v1/report/dashboard/head` | **baru** — kanonik |
| `GET /api/v1/report/dashboard/chart-sales` | **baru** — kanonik |
| `GET /api/v1/report/dashboard/new-member` | **baru** — kanonik |
| `GET /api/v1/report/overview` | alias sementara, tetap hidup |
| `GET /api/v1/report/head` | alias sementara, tetap hidup |
| `GET /api/v1/report/chart-sales` | hilang — nol konsumen, tidak perlu alias |
| `GET /api/v1/report/new-member` | hilang — nol konsumen, tidak perlu alias |
| `GET /api/v1/report/sales` | **dihapus** — nol konsumen, digantikan `/report/sales/summary` |

Alias di `dashboard/legacy.controller.ts` hanya dibuat untuk 2 URL yang benar-benar dipanggil
[src/services/api/analytic.ts](src/services/api/analytic.ts), supaya SPA yang masih ter-cache di
browser user tidak error kalau backend deploy lebih dulu. `analytic.ts` sendiri sudah diarahkan ke
URL kanonik. **Hapus `legacy.controller.ts` dan barisnya di `dashboard.module.ts` setelah frontend
baru menyebar** — itu satu-satunya langkah yang tersisa.

`src/app.module.ts` tidak berubah: `ReportModule` tetap satu-satunya pintu masuk, dan sekarang
hanya berisi `imports: [ReportDashboardModule]`. Domain laporan berikutnya cukup ditambahkan ke
array itu.

> Karena `/report/sales` dihapus, perbaikan guard + scope `club_id` yang sempat dipasang di
> `ReportService.getSalesReport` ([2.1](#21--apiv1reportsales-bocor-lintas-tenant)) ikut terhapus
> bersama method-nya. Perbaikan `total` → `total_amount` di `overview.service.ts`
> ([2.2](#22--kolom-transaction_itemstotal-tidak-ada)) **tetap terpakai** karena melayani
> `/report/dashboard/chart-sales`.

---

## 3. Kontrak bersama semua laporan

### 3.1 Filter bar standar

Komponen `ReportFilterBar`.

| Filter | Sumber | Catatan |
|---|---|---|
| Rentang tanggal | `DatePickerAIO` + shortcut dari [src/hooks/use-date-picker.ts](src/hooks/use-date-picker.ts) | today / yesterday / thisWeek / 7d / 30d / thisMonth / lastMonth / thisYear / lastYear / custom |
| Basis tanggal | `Switch` `use_invoice_date` | `DATE(t.due_date)` vs `DATE(t.created_at)` — pola sudah ada di `report-sales.service.ts:41` |
| Granularitas | `Select` `granularity: day \| week \| month` | default otomatis |
| Bandingkan periode | `Switch` `compare` | periode sebelumnya dengan panjang hari sama → badge delta % di tiap KPI |
| Filter kontekstual | per menu | karyawan, kategori, tipe paket, rekening |

### 3.2 Aturan perhitungan

- Transaksi yang dihitung: `t.club_id = :club_id AND t.is_paid != 0 AND t.is_void = 0`.
- Retur/refund terdeteksi lewat `t.is_refunded = 1 AND ti.quantity < 0`.
- Nilai per item pakai `transaction_items.total_amount` (**bukan** `total` — kolom itu tidak ada).
- Pengeluaran di `financial_records.amount` disimpan **negatif** — sudah diverifikasi ke data produksi: 0 baris `income` bernilai negatif dan 0 baris `expense` bernilai positif, jadi `SUM(amount)` langsung memberi laba bersih. Untuk ditampilkan, pengeluaran selalu di-`ABS()`.
- Setiap angka uang berpasangan: `total_amount` (number) + `ftotal_amount` (string terformat) via `formatCurrency`.
- Semua query wajib scoped `club_id` dari `@GetUser()`.

### 3.3 Konvensi visual

Setiap tab: baris KPI card → 1-2 chart card → tabel detail (`DataTable` + `DataTableExport`).
Warna chart pakai token `var(--chart-1..5)` lewat `ChartContainer`.

---

## 4. Katalog laporan per menu

Format tiap tab: **KPI** / **Grafik** / **Tabel** / **Sumber data**.

---

### 4.1 Laporan Penjualan · `/reports/sales`

#### Tab 1 — Ringkasan Penjualan
- **KPI:** Gross Sales · Total Diskon · Total Pajak · Rounding · **Net Sales** · Total Terbayar · Outstanding · Jumlah Faktur · Rata-rata per Faktur (ATV) · Jumlah Item Terjual · Nilai Refund · Nilai Void
- **Grafik:**
  - Area tren Net Sales per bucket + garis pembanding periode sebelumnya
  - Donut komposisi revenue per kategori item (membership / pt_program / class / product / service / freeze)
  - Bar bertumpuk Gross → Diskon → Pajak → Net per bucket
- **Tabel:** rekap kategori mengikuti bentuk `report-sales.service.ts` — Membership, PT Program, Classes, Products, Freeze, Vouchers Redeem, **Gross Total Sales**, **Net Total Sales**, Total Discount, Total Rounding, Total Outstanding; kolom `total_sales`, `total_returns`, `gross_revenue`
- **Sumber:** `transactions`, `transaction_items`, `packages`, `products`

#### Tab 2 — Penjualan per Item
- **KPI:** SKU/paket terjual (unik) · Item terlaris · Kontribusi 5 item teratas (%)
- **Grafik:** Bar horizontal Top 10 by net revenue · Bar horizontal Top 10 by qty · Pareto (bar qty + line kumulatif %) untuk analisis 80/20
- **Tabel:** tipe item, nama, qty terjual, qty refund, qty net, harga rata-rata, subtotal, diskon, pajak, **net revenue**, kontribusi %
- **Filter tambahan:** `item_type`
- **Sumber:** `transaction_items` ⋈ `transactions` ⋈ `packages`/`products`

#### Tab 3 — Penjualan per Karyawan
- **KPI:** Karyawan penjualan tertinggi · Rata-rata net sales per karyawan · Jumlah karyawan bertransaksi
- **Grafik:** Bar ranking by net sales · Bar bertumpuk kontribusi kategori per karyawan · Line tren 5 karyawan teratas
- **Tabel:** karyawan, jumlah faktur, jumlah item, gross, diskon, net, ATV, member baru dibawa
- **Sumber:** `transactions.employee_id` ⋈ `employees`

#### Tab 4 — Pembayaran & Piutang
- **KPI:** Total penerimaan · Tunai vs non-tunai · **Total Outstanding** · Jumlah faktur belum lunas · Umur piutang rata-rata
- **Grafik:** Donut share penerimaan per rekening · Line tren penerimaan kas harian · Bar aging piutang (0-7 / 8-30 / 31-60 / 61-90 / >90 hari)
- **Tabel A:** per rekening — nama, jumlah pembayaran, total masuk, total refund (negatif), net
- **Tabel B:** faktur outstanding — kode, member, tanggal, jatuh tempo, total, terbayar, **sisa**, umur hari, bucket aging
- **Sumber:** `payments` ⋈ `financial_rekenings`, `refunds`, `transactions.ballance_amount` (`is_paid IN (0,2)`)

#### Tab 5 — Diskon, Voucher & Pajak
- **KPI:** Diskon item · Diskon transaksi · Nilai voucher terpakai · Nilai poin loyalty ditukar · Total pajak · Rasio diskon terhadap gross (%)
- **Grafik:** Bar komposisi diskon per sumber (item / transaksi / voucher / loyalty) · Line rasio diskon terhadap gross · Bar pajak per jenis
- **Tabel A:** per voucher — kode, jumlah redemption, member unik, total diskon, status
- **Tabel B:** per pajak — nama, rate, dasar pengenaan, total pajak
- **Sumber:** `transaction_discounts`, `voucher_redemptions` ⋈ `vouchers`, `transaction_tax_items` ⋈ `taxes`, `transaction_redeem_points`

#### Tab 6 — Refund & Void
- **KPI:** Nilai refund · Refund rate (%) · Jumlah faktur refund · Nilai void · Void rate · Jumlah faktur void
- **Grafik:** Line tren refund & void · Bar item paling sering di-refund · Donut refund per kategori item
- **Tabel A:** refund — tanggal, faktur, member, nominal, persentase, rekening, status, diproses oleh
- **Tabel B:** void — tanggal, faktur, member, nominal, status, diproses oleh, catatan
- **Sumber:** `refunds`, `voids`, `transactions`, `employees`

#### Tab 7 — Analitik Penjualan
- **KPI:** Jam tersibuk · Hari tersibuk · Revenue member baru vs berulang · Median nilai faktur
- **Grafik:** Heatmap hari-dalam-minggu × jam · Histogram distribusi nilai faktur · Bar grouped revenue member baru vs berulang
- **Tabel:** ringkasan per hari-dalam-minggu — jumlah faktur, net sales, ATV
- **Sumber:** `transactions` (`EXTRACT(dow/hour)`), `members.join_date`

> Dua catatan implementasi tab ini: **heatmap selalu memakai `created_at`**, tidak mengikuti
> toggle `use_invoice_date` — pola jam-transaksi tidak bermakna kalau diambil dari tanggal faktur.
> Dan **"member baru" didefinisikan sebagai `join_date` berada di dalam rentang laporan**, bukan
> "transaksi pertama member". Definisi kedua lebih akurat tapi butuh window function atas seluruh
> riwayat; ditunda sampai ada kebutuhan nyata.

---

### 4.2 Laporan Paket dan Plan · `/reports/packages`

#### Tab 1 — Ringkasan Paket
- **KPI:** Paket terjual (qty) · Revenue paket · Harga jual rata-rata · Paket aktif · Berakhir periode ini · Akan berakhir ≤30 hari · Freeze aktif
- **Grafik:** Donut revenue per `package_type` · Area tren penjualan paket · Bar Top 10 by revenue & by qty
- **Tabel:** ringkasan per tipe paket — qty, gross, diskon, net, kontribusi %
- **Sumber:** `transaction_items` (`item_type = package`) ⋈ `packages`, `member_packages`

#### Tab 2 — Penjualan per Paket
- **KPI:** Paket terlaris · Share revenue promo vs non-promo · Diskon rata-rata paket (%)
- **Grafik:** Bar horizontal Top/Bottom 10 by net revenue · Bar bertumpuk qty per tipe paket per bucket · Scatter harga jual rata-rata vs qty
- **Tabel:** nama, tipe, durasi, sesi, harga list (`price`), harga jual (`sell_price`), harga realisasi rata-rata, promo, qty terjual, qty refund, diskon, **net revenue**, kontribusi %
- **Sumber:** `packages`, `transaction_items`

#### Tab 3 — Keanggotaan Aktif & Status
- **KPI:** Paket aktif · Inaktif · Expired · Cancelled · Pending · Rata-rata durasi keanggotaan
- **Grafik:** Donut distribusi `member_packages.status` · Line tren paket aktif per bucket (aktif = `start_date <= d <= end_date`) · Bar distribusi sisa hari (<7 / 7-30 / 31-90 / >90)
- **Tabel A:** member, kode, paket, tipe, mulai, berakhir, **sisa hari**, status, trainer, kelas
- **Tabel B:** **akan berakhir** 7 / 14 / 30 hari — daftar follow-up perpanjangan
- **Sumber:** `member_packages` ⋈ `members` ⋈ `packages` ⋈ `employees` ⋈ `classes`

#### Tab 4 — Pemakaian Sesi (PT & Kelas)
- **KPI:** Sesi terpakai (approved) · Pending · Ditolak · Rata-rata sesi per member · Utilisasi rata-rata (%)
- **Grafik:** Line tren sesi terpakai · Bar sesi per trainer · Bar utilisasi rata-rata per paket (terpakai / `session_duration + extra_session`)
- **Tabel:** member, paket, trainer, total sesi, terpakai, **sisa**, utilisasi %, sesi terakhir
- **Sumber:** `history_sessions` (`status = 1`, `session_cut`) ⋈ `member_packages`

#### Tab 5 — Freeze
- **KPI:** Jumlah freeze · Freeze aktif · Durasi rata-rata (hari) · Revenue freeze
- **Grafik:** Line tren freeze baru · Donut distribusi status · Bar freeze per paket asal
- **Tabel:** member, mulai, selesai, durasi hari, status, faktur, nilai
- **Sumber:** `member_freezes`, `transaction_items` (`item_type = freeze`)

#### Tab 6 — Kelas
- **KPI:** Kelas aktif · Total pendaftar · Okupansi rata-rata (%) · Kelas terpopuler
- **Grafik:** Bar okupansi per kelas (pendaftar / `max_member`) · Bar kelas by revenue · Line tren sesi kelas terlaksana
- **Tabel:** kelas, kategori, instruktur, kapasitas, pendaftar aktif, okupansi %, paket terkait, sesi terlaksana, revenue
- **Sumber:** `classes`, `class_instructors`, `class_packages`, `member_packages` (`package_type = class`), `history_sessions`

---

### 4.3 Laporan Produk · `/reports/products`

> **Catatan wajib ditampilkan di halaman:** `products.quantity` adalah **counter stok saat ini**,
> bukan riwayat. `hpp` juga tidak di-snapshot ke `transaction_items`, sehingga margin dihitung dari
> `hpp` terkini → **estimasi**. Refund tidak mengembalikan stok (dan saat ini justru menguranginya
> dua kali — lihat [2.3](#23--refund-mengurangi-stok-dua-kali)).

#### Tab 1 — Ringkasan Produk
- **KPI:** Qty terjual · Revenue produk · HPP estimasi · **Laba kotor estimasi** · Margin % · SKU terjual · SKU tanpa penjualan
- **Grafik:** Area tren revenue produk · Donut kontribusi Top 5 + Lainnya · Bar Top 10 by revenue & by qty
- **Tabel:** ringkasan — gross, diskon, net, HPP est, laba kotor est, margin %
- **Sumber:** `transaction_items` (`item_type = product`) ⋈ `products`

#### Tab 2 — Penjualan per Produk
- **KPI:** Produk terlaris · Margin tertinggi · Margin terendah
- **Grafik:** Bar horizontal Top/Bottom 10 by net revenue · Bar margin % per produk (Top 15) · Pareto kontribusi kumulatif
- **Tabel:** SKU, kode, nama, qty terjual, qty refund, qty net, harga rata-rata, gross, diskon, **net revenue**, HPP est, laba kotor est, margin %, kontribusi %
- **Sumber:** `transaction_items`, `products.hpp` (lewat `COALESCE`, lihat [6.B](#6-di-luar-cakupan))

#### Tab 3 — Stok Saat Ini
- **KPI:** Total SKU · **Nilai stok (qty × hpp)** · Nilai jual stok (qty × price) · SKU habis · SKU menipis
- **Grafik:** Bar nilai stok Top 10 · Bar produk stok kritis · Donut komposisi nilai stok
- **Tabel:** SKU, nama, **stok saat ini**, harga, hpp, nilai stok, terjual periode ini, rata-rata jual harian, **estimasi hari habis**
- **Sumber:** `products`, `transaction_items`

#### Tab 4 — Kecepatan Jual & Pergerakan
- **KPI:** Fast mover · Slow mover · Dead stock (0 penjualan) · Perputaran rata-rata
- **Grafik:** Line multi-series tren produk terpilih · Bar delta % periode ini vs lalu · Bar klasifikasi ABC (80/15/5)
- **Tabel:** produk, qty periode ini, qty periode lalu, **delta %**, rata-rata harian, klasifikasi (fast / medium / slow / dead), kelas ABC
- **Sumber:** `transaction_items` dua rentang tanggal

#### Tab 5 — Refund Produk
- **KPI:** Qty refund · Nilai refund produk · Refund rate (%)
- **Grafik:** Bar produk paling banyak di-refund · Line tren refund produk
- **Tabel:** produk, qty terjual, qty refund, refund rate %, nilai refund, faktur terkait
- **Sumber:** `transaction_items.qty_refund`, `refunds`, `transactions`

---

### 4.4 Laporan Keuangan · `/reports/finance`

#### Tab 1 — Ringkasan Keuangan
- **KPI:** Total Pemasukan · Total Pengeluaran · **Laba/Rugi Bersih** · Margin bersih % · Saldo seluruh rekening · Kas masuk dari POS · Kas masuk manual
- **Grafik:** Bar grouped Pemasukan vs Pengeluaran · Area saldo kumulatif berjalan · Donut komposisi pemasukan per kategori + Donut pengeluaran per kategori
- **Tabel:** ringkasan per kategori — tipe, kategori, nominal, kontribusi %
- **Sumber:** `financial_records` ⋈ `financial_categories` ⋈ `financial_rekenings`

#### Tab 2 — Arus Kas
- **KPI:** Kas masuk · Kas keluar · **Arus kas bersih** · Jumlah bucket arus kas negatif
- **Grafik:** Bar waterfall arus kas bersih per bucket · Area saldo akhir kumulatif · Line perbandingan periode ini vs sebelumnya
- **Tabel:** periode, kas masuk, kas keluar, arus bersih, **saldo akhir kumulatif**
- **Sumber:** `financial_records` diagregasi per bucket

#### Tab 3 — Pemasukan
- **KPI:** Pemasukan dari penjualan · Pemasukan lain-lain · Kategori terbesar
- **Grafik:** Bar per kategori · Line tren pemasukan · Bar bertumpuk komposisi kategori per bucket
- **Tabel:** tanggal, kategori, rekening, deskripsi, faktur terkait, karyawan, **nominal**
- **Sumber:** `financial_records` (`type = income`)

#### Tab 4 — Pengeluaran
- **KPI:** Total pengeluaran · Kategori terbesar · Rata-rata harian · Delta vs periode sebelumnya
- **Grafik:** Bar Top 10 kategori · Line tren pengeluaran · Bar bertumpuk komposisi kategori per bucket
- **Tabel:** tanggal, kategori, rekening, deskripsi, karyawan, **nominal** (ditampilkan absolut, sumbernya negatif)
- **Sumber:** `financial_records` (`type = expense`)

#### Tab 5 — Rekening & Mutasi
- **KPI:** Rekening aktif · Total saldo · Rekening dengan mutasi terbesar
- **Grafik:** Bar saldo per rekening · Donut share penerimaan per rekening · Line tren mutasi per rekening
- **Tabel A:** rekening, nomor, total masuk, total keluar, **mutasi bersih**, saldo saat ini
- **Tabel B:** detail mutasi rekening terpilih — tanggal, tipe, kategori, deskripsi, nominal
- **Sumber:** `financial_rekenings`, `financial_records`, `payments`, `refunds`

#### Tab 6 — Piutang (Outstanding)
- **KPI:** **Total outstanding** · Jumlah faktur · Umur rata-rata (hari) · Faktur lewat jatuh tempo
- **Grafik:** Bar aging bucket (0-7 / 8-30 / 31-60 / 61-90 / >90) · Line tren outstanding · Donut outstanding per kategori item
- **Tabel:** faktur, member, tanggal, jatuh tempo, total, terbayar, **sisa**, umur hari, bucket, status
- **Sumber:** `transactions` (`ballance_amount > 0`, `is_paid IN (0,2)`, `is_void = 0`) ⋈ `payments`

#### Tab 7 — Pajak
- **KPI:** Total pajak terkumpul · Pajak per jenis · Rasio pajak terhadap gross (%)
- **Grafik:** Bar pajak per jenis · Line tren pajak per bucket
- **Tabel:** nama pajak, rate, dasar pengenaan, total pajak, jumlah transaksi terkena
- **Sumber:** `transaction_tax_items` ⋈ `taxes` ⋈ `transactions`

---

### 4.5 Laporan Member · `/reports/members`

#### Tab 1 — Ringkasan Member
- **KPI:** Total member · **Member baru** periode ini · Aktif · Inaktif · Freeze · Member dengan PT · Member dengan kelas
- **Grafik:** Area tren member baru (reuse logika `getNewMemberChart`) · Line pertumbuhan kumulatif · Donut komposisi status keanggotaan · Bar demografi gender & kelompok usia (dari `birth_date`)
- **Tabel:** ringkasan status — status, jumlah, kontribusi %
- **Sumber:** `members`, `member_packages`, `member_freezes`. Pakai ulang CASE `membeship_status` dari `member.service.ts:171` — **typo itu kontrak API, jangan diubah**

#### Tab 2 — Akuisisi & Retensi
- **KPI:** Member baru · Churn (paket berakhir & tidak perpanjang) · **Retention rate %** · Reaktivasi · Net growth
- **Grafik:** Bar grouped Member Baru vs Churn · Line retention rate · Tabel-heatmap cohort (bulan join × masih aktif bulan ke-N)
- **Tabel A:** member baru — nama, kode, tanggal join, paket pertama, nilai transaksi pertama, karyawan penjual
- **Tabel B:** churn — nama, paket terakhir, tanggal berakhir, lama jadi member, total belanja seumur hidup
- **Sumber:** `members.join_date`, `member_packages`, `transactions`

#### Tab 3 — Keanggotaan Member
- **KPI:** Rata-rata durasi keanggotaan · Member multi-paket · Rata-rata paket per member
- **Grafik:** Bar distribusi member per tipe paket · Bar distribusi sisa hari · Line tren member aktif
- **Tabel A:** member, paket aktif, tipe, mulai, berakhir, **sisa hari**, trainer, sisa sesi
- **Tabel B:** akan berakhir 7 / 14 / 30 hari (daftar follow-up)
- **Sumber:** `member_packages` ⋈ `members` ⋈ `packages`

#### Tab 4 — Kehadiran Member
- **KPI:** Total check-in · Member unik hadir · Rata-rata kunjungan per member · Tidak pernah hadir · Tidak aktif >30 hari
- **Grafik:** Line tren check-in harian · Heatmap kunjungan hari × jam · Bar distribusi frekuensi kunjungan (0 / 1-3 / 4-8 / 9+)
- **Tabel A:** Top member paling aktif — nama, jumlah kunjungan, kunjungan terakhir
- **Tabel B:** member berisiko — tidak hadir >30 hari padahal paket masih aktif
- **Sumber:** `attendances` (`type = member`), `attendance_packages`, `members`

#### Tab 5 — Nilai Member
- **KPI:** Total belanja member · **ARPU** · Member dengan outstanding · Transaksi terbesar · Median belanja
- **Grafik:** Bar Top 10 member by total belanja · Bar segmentasi RFM (Champion / Loyal / At Risk / Hibernating / New) · Histogram distribusi belanja
- **Tabel:** member, jumlah transaksi, **total belanja**, rata-rata per transaksi, transaksi terakhir, outstanding, segmen
- **Sumber:** `transactions` ⋈ `members`

#### Tab 6 — Loyalty Point
- **KPI:** Poin diperoleh · Ditukar · Kadaluarsa · **Saldo poin beredar** · Redemption rate %
- **Grafik:** Line tren earn vs redeem · Bar reward paling sering ditukar · Donut komposisi tipe transaksi poin
- **Tabel A:** member, earn, redeem, expired, **saldo**, redeem terakhir
- **Tabel B:** reward — nama, tipe, poin dibutuhkan, jumlah redemption, nilai diskon diberikan
- **Sumber:** `member_loyalty_point`, `member_loyalty_reward_redeems`, `loyalty_rewards`

---

### 4.6 Laporan Karyawan · `/reports/employee`

#### Tab 1 — Ringkasan Karyawan
- **KPI:** Karyawan aktif · **Total komisi periode** · Total gaji pokok · Estimasi payroll · Total sesi terlaksana · Total penjualan dibawa
- **Grafik:** Bar ranking by total komisi · Donut komposisi komisi per tipe (`sales` / `service` / `session` / `class`) · Line tren komisi
- **Tabel:** karyawan, jabatan, komisi sales, service, session, class, **total komisi**
- **Sumber:** `employee_commissions` ⋈ `employees` — **`employee_commissions` tidak punya `club_id`, wajib join lewat `employees.club_id`**

#### Tab 2 — Komisi Detail
- **KPI:** Jumlah baris komisi · Komisi rata-rata per transaksi · Komisi terbesar
- **Grafik:** Bar bertumpuk komisi per tipe per karyawan · Line tren komisi harian
- **Tabel:** tanggal (`due_date`), karyawan, tipe, item, faktur, `base_amount`, `commission_base_amount`, rate & tipe (`staff_com_sales` / `staff_com_sales_type`), diskon proporsional, **nominal komisi**
- **Filter tambahan:** karyawan, tipe komisi
- **Sumber:** reuse pola `employee.service.ts:719 getEmployeeCommission`

#### Tab 3 — Komisi per Paket & Produk
- **KPI:** Paket penghasil komisi terbesar · Produk penghasil komisi terbesar
- **Grafik:** Bar Top 10 paket by komisi · Bar Top 10 produk by komisi
- **Tabel A:** paket, tipe, qty terjual, dasar komisi, **total komisi**, karyawan terlibat
- **Tabel B:** produk, qty terjual, dasar komisi, **total komisi**, karyawan terlibat
- **Sumber:** reuse `employee.service.ts:1046 findAllCommissionByPackage` & `:1128 findAllCommissionByProduct`

#### Tab 4 — Kinerja Penjualan
- **KPI:** Net sales tim · Karyawan terbaik · Rata-rata per karyawan · Member baru dibawa
- **Grafik:** Bar ranking net sales · Line multi-series 5 karyawan teratas · Bar member baru per karyawan
- **Tabel:** karyawan, jumlah faktur, item terjual, gross, diskon, **net sales**, ATV, member baru, komisi, rasio komisi terhadap net sales %
- **Sumber:** `transactions.employee_id`, `transaction_items`, `members`, `employee_commissions`

#### Tab 5 — Trainer & Sesi
- **KPI:** Total sesi · Approved · Pending · Rejected · Rata-rata sesi per trainer · Member ditangani
- **Grafik:** Bar sesi per trainer (bertumpuk per status) · Line tren sesi · Bar tingkat penyelesaian sesi per trainer (%)
- **Tabel:** trainer, member aktif ditangani, sesi terjadwal, terpakai, pending, ditolak, **tingkat penyelesaian %**, sesi terakhir
- **Sumber:** `history_sessions` (`trainer_id`, `status`, `session_cut`), `member_packages.trainer_id`, `trainer_packages`

#### Tab 6 — Kehadiran Karyawan
- **KPI:** Total check-in · Hadir hari ini · Rata-rata kehadiran % · Kehadiran terendah
- **Grafik:** Bar persentase kehadiran per karyawan · Line tren kehadiran harian · Heatmap kehadiran karyawan × tanggal
- **Tabel:** karyawan, jumlah hadir, hari kerja dalam periode, **kehadiran %**, check-in pertama/terakhir
- **Sumber:** `attendances` (`type = employee`) ⋈ `employees`

#### Tab 7 — Estimasi Payroll
- **KPI:** Total gaji pokok · Total komisi · **Total estimasi payroll** · Rata-rata per karyawan
- **Grafik:** Bar bertumpuk komposisi payroll per karyawan (pokok + 4 tipe komisi) · Line tren payroll per bulan
- **Tabel:** karyawan, gaji pokok, komisi sales, service, session, class, **total estimasi**
- **Sumber:** `employee_earnings.base_salary` + `employee_commissions` diagregasi per `type`

---

### Ringkasan angka

| Menu | Tab | KPI | Grafik | Tabel |
|---|---:|---:|---:|---:|
| Laporan Penjualan | 7 | 34 | 18 | 10 |
| Laporan Paket dan Plan | 6 | 27 | 17 | 8 |
| Laporan Produk | 5 | 22 | 13 | 5 |
| Laporan Keuangan | 7 | 27 | 18 | 9 |
| Laporan Member | 6 | 30 | 17 | 10 |
| Laporan Karyawan | 7 | 28 | 16 | 9 |
| **Total** | **38** | **~168** | **~99** | **~51** |

---

## 5. Rencana implementasi

### 5.1 Struktur halaman frontend (`migios-shadcn/`)

**Keputusan: 6 route saja. Satu halaman per menu. Tab sub-laporan digerakkan URL (`?view=<slug>`)
dan di-`lazy()` di dalam halaman — tidak masuk route registry.**

Alasan: tiap sub-laporan butuh 3-8 query agregat. Ditumpuk dalam satu halaman → 30+ query sekali
mount ke Neon (remote), tidak layak. Dijadikan sub-route → 6 menu × ~6 laporan = ~40 entri route
dan ~40 baris di `protectedRoute.ts`. Tab berbasis search-param tetap bisa di-deep-link dan
di-bookmark, hanya me-mount satu sub-laporan, dan katalog bisa tumbuh tanpa menyentuh route
registry.

**Nav tidak perlu level ketiga** — 6 item yang sudah ada sudah benar.

```
src/pages/master/reports/                                       ✅ fondasi selesai
  index.tsx                    <Navigate to="/reports/sales" replace />
  Layout.tsx                   ReportsLayout — tab 6 domain, sticky, pola ../sales/Layout.tsx
  types.ts                     ReportFilterValue, ReportFilterParams, ReportSectionDef,
                               ReportKpi, ComparisonValue, ReportBucketPoint
  components/
    ReportPageShell.tsx        header + export + filter bar + tab + <Suspense> section aktif
    ReportFilterBar.tsx        DatePickerAIO + granularitas + 2 switch + slot `extra`
    ReportSectionTabs.tsx      tab section (pil), auto-scroll ke tab aktif
    ReportKpiRow.tsx  ReportKpiCard.tsx  ComparisonBadge.tsx
    ReportChartCard.tsx  ReportTableCard.tsx
    ReportEmptyState.tsx  ReportSectionSkeleton.tsx
    ReportSectionPlaceholder.tsx   sementara, dihapus saat section aslinya jadi
  hooks/
    useReportFilter.ts         state filter + sinkron URL + `params`
    useReportSection.ts        ?view= <-> section aktif
    useReportExport.ts         exportCsv(), print()
    report-filter-context.ts   ReportFilterContext + useReportFilterParams()
  utils/
    chartConfig.ts             buildChartConfig(), getSeriesColor(i) -> var(--chart-N)
    toCsv.ts                   toCsv(), downloadCsv(), downloadBlob()
  sales/     index.tsx + sections.ts    (7 section)
  packages/  index.tsx + sections.ts    (6 section)
  products/  index.tsx + sections.ts    (5 section)
  finance/   index.tsx + sections.ts    (7 section)
  members/   index.tsx + sections.ts    (6 section)
  employee/  index.tsx + sections.ts    (7 section)
```

Section aslinya masuk ke `<domain>/sections/*.tsx` dan menggantikan
`ReportSectionPlaceholder` di `sections.ts` domain terkait — satu baris per section,
tanpa menyentuh route, shell, maupun filter.

Setiap `<domain>/index.tsx` cukup ~20 baris:

```tsx
const SalesReport = () => {
  const filter = useReportFilter({ defaultRange: "thisMonth" })
  return <ReportPageShell title="Laporan Penjualan" filter={filter} sections={salesSections} />
}
export default SalesReport
```

`ReportPageShell` menyalurkan `filter.params` lewat `ReportFilterContext`, sehingga komponen
section **tidak menerima props sama sekali**.

**`useReportFilter` adalah bagian terpenting.** Ia memegang state filter, di-seed dari
`getMenuShortcutDatePickerByType("thisMonth")`, mencerminkannya ke URL (`?from&to&inv&g&cmp`) agar
laporan bisa dibagikan, dan mengembalikan `{ value, setValue, params }`. `params` adalah objek
serializable yang dipakai **sekaligus** sebagai `params` axios dan sebagai isi query key — itulah
yang memuaskan aturan ESLint `@tanstack/query/exhaustive-deps` yang aktif di proyek ini.

#### Dipakai apa adanya, jangan dibuat ulang

| Aset | Path |
|---|---|
| `DatePickerAIO`, `DatePickerAIOPropsValue` | [src/components/ui/date-picker/date-picker-aio.tsx](src/components/ui/date-picker/date-picker-aio.tsx) |
| `getMenuShortcutDatePickerByType`, `TypesActionDatePicker` | [src/hooks/use-date-picker.ts](src/hooks/use-date-picker.ts) |
| `DataTable`, `DataTableColumnDef`, `OnSortParam` | [src/components/ui/data-table/index.tsx](src/components/ui/data-table/index.tsx) — satu-satunya implementasi tabel (aturan `CLAUDE.md`); `ReportTableCard` hanya pembungkus tipis |
| `DataTableExport`, `ExportType`, `ExportOption` | [src/components/ui/data-table/data-table-export.tsx](src/components/ui/data-table/data-table-export.tsx) — dropdown export, tidak diubah |
| `ChartContainer`, `ChartConfig`, `ChartTooltip`, `ChartLegend` | [src/components/ui/chart.tsx](src/components/ui/chart.tsx) |
| `currencyFormat` | [src/components/ui/input-currency.tsx](src/components/ui/input-currency.tsx) |
| `dayjs` | [src/utils/dayjs.ts](src/utils/dayjs.ts) |
| `Tabs` / `TabsList` / `TabsTrigger` | `@/components/animate-ui/components/radix/tabs` |

#### Duplikasi yang diangkat

- ✅ `StatisticCard` yang tadinya privat di [src/pages/dashboard/components/Overview.tsx](src/pages/dashboard/components/Overview.tsx) sudah jadi `ReportKpiCard`, dan `Overview.tsx` **mengimpor balik** komponen itu. Prop `label` + `onClick(label)` diganti `onClick?: () => void`, `compareFrom` jadi `hint`, plus tambahan `comparison`/`loading`.
- ✅ Blok SVG "No Result" jadi `ReportEmptyState`.
- ✅ Pembentuk `ChartConfig` dan template `var(--chart-N)` jadi `utils/chartConfig.ts`.
- ⏳ `PenjualanHarian/index.tsx` **belum** dialihkan ke komponen bersama ini — masih memakai salinannya sendiri. Rapikan saat fase 1, jangan sekarang, supaya halaman yang sudah dipakai tidak ikut berubah di fase fondasi.

#### Registrasi route (4 langkah wajib per `CLAUDE.md`)

1. `src/pages/master/reports/<menu>/index.tsx` dengan **default export**.
2. `src/routes/pages/reports.route.ts` — 7 `RouteProps` (`/reports` redirect + 6 menu),
   `component: lazy(() => import("@/pages/master/reports/<menu>"))`,
   `meta.container.className: "p-0"` (sama seperti `sales.route.ts`, karena `Layout.tsx` sudah
   memberi padding sendiri).
3. Import + spread `reportsRoute` ke [src/routes/protectedRoute.ts](src/routes/protectedRoute.ts), hapus blok komentar `/reports` di baris 68-72.
4. Nav sudah ada — tidak perlu diubah.

#### Service & tipe

- `src/services/api/ReportService.ts` — `apiGetReport<Domain><Slug>`, semua lewat `ApiService.fetchDataWithAxios`.
- `src/services/api/@types/report.ts` — tipe request/response.
- Tambah key di [src/constants/queryKeys.constant.ts](src/constants/queryKeys.constant.ts): `reportSales`, `reportPackages`, `reportProducts`, `reportFinance`, `reportMembers`, `reportEmployee`. Bentuk key: `[QUERY_KEY.reportSales, "summary", params]`.

---

### 5.2 Struktur backend (`migios-be/`)

**Keputusan: satu modul `report` yang membungkus sub-modul per area.** Setiap area punya folder
sendiri berisi `.module.ts`, `.controller.ts`, service, dan `dto/`-nya — persis pola
`src/module/settings/` (`commission/`, `loyalty/`, `taxes/`). Namespace `/api/v1/report/...`
memisahkan pelaporan dari modul CRUD (`sales.controller.ts` sudah besar), dan tiap file tetap kecil.

```
src/module/report/
  report.module.ts              imports: [ReportDashboardModule, ReportSalesModule, ...]
  common/                       ✅ helper bersama
    report-filter.helper.ts     parseReportBoolean, resolveReportRange, requireClubId
    report-bucket.helper.ts     resolveGranularity, buildBucketKeys, bucketExpressions, backfillBuckets
    report-predicate.helper.ts  salesDateColumn, applyPaidSalesScope, excludeRefunded
    report-format.helper.ts     withMoneyTwins, moneyKpi
    report-compare.helper.ts    previousRange, buildComparison, withComparison
    report-club-scope.helper.ts resolveReportClubIds
    report.types.ts
  dto/
    report-filter.dto.ts        ✅ BASE bersama semua domain
  dashboard/                    ✅ selesai
    dashboard.module.ts         ReportDashboardModule
    dashboard.controller.ts     ReportDashboardController   path: 'report/dashboard'
    dashboard.service.ts        ReportDashboardService
    overview.service.ts         ReportOverviewService
    legacy.controller.ts        ReportLegacyController      path: 'report'  — alias, hapus nanti
    dto/dashboard.dto.ts
  sales/                        ✅ lengkap, 7 tab
    sales.module.ts             ReportSalesModule
    sales.controller.ts         ReportSalesController   path: 'report/sales'
    summary.service.ts          /summary
    breakdown.service.ts        /by-item, /by-employee
    payment.service.ts          /payment
    adjustment.service.ts       /discount-tax, /refund-void
    analytic.service.ts         /analytic
    sales.types.ts
  finance/                      ✅ lengkap, 7 tab
    finance.module.ts           ReportFinanceModule
    finance.controller.ts       ReportFinanceController  path: 'report/finance'
    finance-summary.service.ts     /summary, /cash-flow
    finance-ledger.service.ts      /income, /expense, /rekening
    finance-receivable.service.ts  /receivable, /tax
    finance.types.ts
  packages/                     ✅ 6 tab — packages-sales, packages-membership
  members/                      ✅ 6 tab — members-profile, members-activity
  employee/                     ✅ 7 tab — employee.service
  products/                     ✅ 5 tab — products.service

Helper yang sudah jadi: report-filter (parseReportBoolean, resolveReportRange,
requireClubId, buildSalesScope), report-club-scope (parseClubIds,
resolveReportClubIds), report-predicate (salesDateColumn, clubScope,
dateWithinRange, countedTransaction, paidSalesScope, excludeRefunded,
returnedItemsOnly, outstandingTransaction), report-bucket (resolveGranularity,
buildBucketKeys, bucketLabel, bucketKeyExpression, backfillBuckets),
report-compare (isComparisonRequested, previousRange, buildComparison,
comparePeriodLabel), report-format (withMoneyTwins, moneyKpi, countKpi,
percentKpi, safeDivide, sharePercent).
```

**Konvensi penamaan:** nama **file** pendek sesuai domain (`dashboard.controller.ts`, seperti
`commission.controller.ts` di `settings/`); nama **class** diberi prefiks `Report` supaya tidak
rancu dengan modul CRUD yang sudah ada — `ReportEmployeeService` vs `EmployeeService`,
`ReportMemberController` vs `MemberController`.

**Registrasi:** sub-modul didaftarkan di `imports` milik `report.module.ts`, bukan di
`app.module.ts`. Menambah domain laporan baru = 1 baris di `report.module.ts`; `app.module.ts`
tidak perlu disentuh lagi.

**Konvensi endpoint:** `GET /api/v1/report/<domain>/<slug>`, dengan `<slug>` **identik dengan slug
section di frontend** — `/report/sales/summary`, `/report/sales/by-item`,
`/report/finance/cash-flow`, `/report/members/retention`, `/report/employee/commission-breakdown`.
Satu section menembak 1-3 request. Tabel drill-down lewat `customKyselyQuery` → `{data, meta}`;
endpoint agregat mengembalikan `{ kpis, series, totals }` tanpa paging.

Controller domain **tidak boleh mendaftarkan `@Get('')`** — hanya slug bernama. Itu yang menjaga
`report/sales` (controller domain) tidak bertabrakan dengan route lain di namespace `report`.

#### `dto/report-filter.dto.ts` — dua jebakan yang sudah terverifikasi di kode

1. `main.ts:32` memasang `new ValidationPipe()` **tanpa opsi**, jadi `transform` mati. Nest tetap
   menjalankan `plainToInstance` untuk validasi lalu mengembalikan nilai **mentah**. Akibatnya
   `@Type(() => Date)` di `ReportSalesQueryDto` membuat `@IsDate()` lolos padahal controller
   menerima **string** yang bertipe `Date`. `report-sales.service.ts:38` lalu memanggil
   `format(start_date, 'yyyy-MM-dd')` pada string itu — kebetulan jalan karena date-fns menerima
   string dan Indonesia UTC+7 sehingga parse UTC-midnight tak pernah melewati batas hari.
   → DTO baru pakai `@IsDateString()` + tipe `string`, konversi eksplisit di `resolveReportRange()`.
   **Jangan menyalin pola `@IsDate() @Type(() => Date)` ke DTO laporan baru.**
2. Boolean tiba sebagai string `"true"`/`"false"` (lihat `report-sales.service.ts:41`) →
   `parseReportBoolean()` sekali saja.

```ts
export enum ReportGranularity { day = 'day', week = 'week', month = 'month' }
export enum ReportCompareMode { previous_period = 'previous_period', previous_year = 'previous_year' }

export class ReportFilterDto {
  @IsNotEmpty() @IsDateString() start_date: string;
  @IsNotEmpty() @IsDateString() end_date: string;
  @IsOptional() use_invoice_date?: string | boolean;
  @IsOptional() @IsEnum(ReportGranularity) granularity?: ReportGranularity;
  @IsOptional() compare?: string | boolean;
  @IsOptional() @IsEnum(ReportCompareMode) compare_mode?: ReportCompareMode;
  @IsOptional() @IsNumberString() employee_id?: string;
  @IsOptional() @IsNumberString() category_id?: string;
  @IsOptional() @IsNumberString() rekening_id?: string;
  @IsOptional() club_ids?: string;
}
```

**Perbandingan periode dihitung di server** (satu query tambahan pada rentang yang digeser), bukan
dua request dari klien. Round-trip separuh dan label periode pembanding otoritatif.

`/report/sales` lama sudah dihapus ([2.5](#25--modularisasi-modul-report)). Penggantinya
`/report/sales/summary` **wajib mendelegasi ke `ReportSalesService` yang sudah ada**
(`src/module/sales/report-sales.service.ts`), bukan menulis query kedua — supaya
`/api/v1/sales/report` dan `/api/v1/report/sales/summary` tidak bisa berbeda angkanya. Baris
"Transfer member" dan "Vouchers Redeem" yang di-hardcode `0` di `report-sales.service.ts` diisi
dari `voucher_redemptions` yang sebenarnya sudah ada datanya.

---

### 5.3 Utilitas backend yang di-extract

**`report-predicate.helper.ts`** — blok `t.club_id = ? AND t.is_paid != 0 AND t.is_void = 0 AND
dateCol BETWEEN ? AND ?` **berulang 9 kali** di `report-sales.service.ts` (baris 50-60, 106-116,
162-172, 218-227, 273-282, 327-335, 385-394, 405-414, 423-432).

```ts
export interface SalesScope { clubIds: number[]; startDate: string; endDate: string; useInvoiceDate: boolean }
export function salesDateColumn(alias: string, useInvoiceDate: boolean): RawBuilder<string>
export function applyPaidSalesScope<DB, TB, O>(qb, scope: SalesScope, alias?: string)
export function excludeRefunded<...>(qb)
```

Signature memakai **`clubIds: number[]` sejak hari pertama**, bukan `clubId: number` — lihat [6.C](#6-di-luar-cakupan).

**`report-bucket.helper.ts`** — di `overview.service.ts`, `determineRangeType` (baris 26-40) plus
blok format/categories 30 baris disalin **tiga kali** (96-127, 241-272, 332-363), dan back-fill
`.map(cat => rows.find(...))` juga tiga kali (179-215, 291-306, 387-398). Dua perilaku yang harus
**diperbaiki** saat di-extract:

- `determineRangeType` menyimpulkan granularitas dari **panjang** rentang: 7 hari → `week`, 28-31
  hari → `month`. Rentang custom 30 hari (mis. 15 Jul – 13 Agu) jadi runtuh ke dua bucket bulan dan
  kehilangan seluruh detail harian. Helper baru mengambil granularitas dari DTO dan hanya jatuh ke
  heuristik bila tidak diisi.
- Minggu dikelompokkan dengan `EXTRACT(DOW FROM ...)` dan bulan dengan `TO_CHAR(..., 'MM')` — ini
  **menggabungkan hari/bulan yang sama dari tahun berbeda**. Ganti ke `date_trunc(...)` dengan sort
  key kanonik `to_char(..., 'YYYY-MM-DD')`. Ini sekaligus menghapus hack `.trim()` atas output
  `TO_CHAR(...,'Day')` yang di-padding 9 karakter.

**`report-filter.helper.ts`** — `requireClubId(user)` menggantikan guard identik di
`report-sales.service.ts:31-33` dan `report.service.ts:60-62`.

**`report-format.helper.ts`** — memformalkan konvensi kembar `gross_revenue` / `fgross_revenue`
(`report-sales.service.ts:435-522`, dikonsumsi di `PenjualanHarian/index.tsx` baris 411, 458, 545)
lewat `withMoneyTwins(row, keys)` dan `moneyKpi(label, value, comparison)`, berbasis
`formatCurrency` dari `@/src/utils/currency.util`.

**Indeks** sudah ditambahkan — lihat [2.4](#24--indeks-laporan).

---

### 5.4 Export PDF/Excel

Tidak ada library export di `package.json` manapun (`xlsx`, `exceljs`, `jspdf`, `puppeteer`,
`papaparse`, `file-saver` — semuanya tidak ada). Menu "Export as PDF / Excel" di
`PenjualanHarian/index.tsx` baris 326-327 tidak punya `onClick` sama sekali.

**Tiga tingkat, dikerjakan berurutan:**

1. **CSV — client-side, tanpa dependensi, kirim di fase 0.** `utils/toCsv.ts` +
   `hooks/useReportExport.ts`, disambungkan ke `DataTableExport` yang sudah ada
   (`onExportClick={(t) => exportReport(t)}`). Langsung mencakup semua sub-laporan tabular.

2. **Excel — server-side dengan `exceljs`.** Sengaja **bukan** client-side: `vite.config.ts`
   menyetel `codeSplitting: false`, jadi seluruh app satu bundle dan library xlsx di browser
   memperlambat first paint untuk semua user termasuk yang tidak pernah export. (Paket npm `xlsx`
   juga sudah deprecated di registry publik dan harus diambil dari CDN SheetJS.)
   - Endpoint: `GET /api/v1/report/<domain>/<slug>/export?format=xlsx&<filter yang sama>`.
   - **Aturan arsitektur: controller export memanggil method service yang persis sama dengan
     endpoint JSON**, lalu menyerahkannya ke `common/report-workbook.builder.ts`. Angka di layar dan
     di file jadi tidak mungkin berbeda.
   - **Jebakan yang wajib ditangani:** `SuccessResponseInterceptor` membungkus **setiap** nilai yang
     di-`return` ke `{data, status, success}`, jadi mengembalikan `StreamableFile` menghasilkan JSON
     rusak. Handler export harus memakai `@Res() res: Response` **tanpa** `passthrough`, menyetel
     `Content-Type`/`Content-Disposition` sendiri, lalu `await workbook.xlsx.write(res)` — tidak
     me-`return` apapun, sehingga `map` interceptor tidak pernah jalan.

3. **PDF — print view, tanpa dependensi.** Route `/reports/:domain/print` dengan
   `meta.themeConfig.layout: "blank"`, stylesheet `@media print`, dan `window.print()`. Pola ini
   **sudah dipakai** di [src/pages/master/sales/Faktur/Detail/index.tsx](src/pages/master/sales/Faktur/Detail/index.tsx)
   baris 80, dengan `InvoiceA5.tsx` / `InvoiceReceipt.tsx` sebagai badan cetak. Recharts merender
   SVG jadi grafik ikut tercetak benar — sesuatu yang PDF sisi server hanya bisa capai lewat
   headless Chrome, tambahan yang tidak masuk akal untuk container API. Kalau nanti PDF server
   pixel-exact benar-benar diwajibkan, baru pertimbangkan puppeteer di belakang queue.

---

## 6. Di luar cakupan

Sesuai keputusan "hanya yang bisa dibuat sekarang", tidak ada migrasi tabel baru yang diusulkan.
Empat hal berikut diselesaikan dengan cara yang **tetap benar bila nanti skema berubah**.

**A. Tidak ada ledger stok.** `products.quantity` hanya counter live (dikurangi saat checkout,
dikembalikan hanya saat void); tidak ada tabel pergerakan stok. Laporan Produk v1 mengirim
penjualan / revenue / top seller / tanpa penjualan + tabel **posisi stok saat ini** yang diberi
label "posisi saat ini", bukan riwayat. Tidak ada laporan pergerakan stok dan tidak ada nilai stok
lintas waktu.

**B. `hpp` tidak di-snapshot ke `transaction_items`.** Tulis setiap query margin sebagai
`COALESCE(ti.hpp_snapshot, p.hpp, 0)`. Ekspresi ini benar sekarang **dan** tetap benar bila kolom
snapshot ditambahkan nanti, jadi margin bisa dikirim sekarang dengan label "Margin (estimasi)".

**C. Tidak ada rollup lintas cabang.** Seluruh query di codebase scoped satu `club_id` aktif.
`club_ids` sudah diterima & divalidasi di `ReportFilterDto` dan disalurkan lewat
`resolveReportClubIds()`, yang untuk v1 mengembalikan `[user.club_id!]` dan melempar
`ErrorCode.FORBIDDEN` bila diminta club lain. Karena **semua helper memakai `clubIds: number[]`**,
mengaktifkan multi-cabang nanti hanya mengubah `.where('t.club_id','=',id)` menjadi
`.where('t.club_id','in',ids)` di satu helper — bukan di 60 titik query. Keputusan ini
satu-satunya pembeda antara fase lintas-cabang yang mudah dan yang mustahil.

**D. Atribusi periode refund — perlu keputusan produk.** Refund tersimpan sebagai baris
`transaction_items` bernilai negatif pada transaksi terpisah, jadi `SUM(ti.total_amount)` atas suatu
rentang sudah netto terhadap refund yang **terjadi** di rentang itu: refund bulan Agustus atas
penjualan Juli mengurangi Agustus, bukan Juli. `report-sales.service.ts` sudah berperilaku begini.
Rekomendasi: bakukan konvensi "periode kejadian" ini di keenam menu, tulis di tooltip setiap KPI
revenue, dan jangan pernah mencampurnya dengan restatement akrual di laporan yang sama.

**E. Laba rugi akrual (P&L).** `financial_records` adalah kas basis; tidak ada COGS terjurnal,
penyusutan, atau accrual. Di luar cakupan.

---

## 7. Fase pengerjaan

Urutan ini dipilih supaya tiap fase menambah **paling banyak satu bentuk helper baru**, sehingga
infrastruktur menumpuk alih-alih bercabang.

| Fase | Isi | Alasan |
|---|---|---|
| **0a** ✅ | Fix `total` → `total_amount` (2 titik); `JwtAuthGuard` + scope `club_id` di `report.controller.ts`; fix refund-stok; 12 indeks laporan | **Selesai** — lihat [Bagian 2](#2-temuan-mendesak--%EF%B8%8F-sudah-diperbaiki). Sisa: apply migrasi indeks + hitung ulang stok fisik produk yang pernah di-refund |
| **0b** ✅ | Modularisasi `src/module/report/` jadi sub-folder per area; dashboard pindah ke `/report/dashboard/*` + alias; `/report/sales` legacy dihapus; `analytic.ts` diarahkan ke URL baru | **Selesai** — lihat [2.5](#25--modularisasi-modul-report). Sisa: hapus `legacy.controller.ts` setelah frontend baru menyebar |
| **0c** ✅ | Seluruh `common/*` + `ReportFilterDto` di backend; seluruh `components/*`, `hooks/*`, `utils/*` frontend; `reports.route.ts` + spread; keenam menu hidup dengan 38 tab section (isi masih placeholder); helper export CSV | **Selesai** — fondasi yang dipakai keenam menu. `StatisticCard` privat di `Overview.tsx` diangkat jadi `ReportKpiCard` dan dipakai balik oleh dashboard |
| **1a** ✅ | **Laporan Penjualan** tab 1-4: Ringkasan, Per Item, Per Karyawan, Pembayaran & Piutang — backend + frontend berpasangan | **Selesai.** 4 endpoint `/report/sales/*` hidup dan langsung dipakai section-nya. Melatih setiap primitive tepat sekali |
| **1b** ✅ | **Laporan Penjualan** tab 5-7: Diskon/Voucher/Pajak, Refund & Void, Analitik | **Selesai.** Laporan Penjualan lengkap 7 tab, 7 endpoint `/report/sales/*` |
| **2** ✅ | **Laporan Keuangan** (7 tab) | **Selesai.** 7 endpoint `/report/finance/*` + 7 section. Konvensi expense negatif sudah diverifikasi langsung ke data produksi |
| **3** ✅ | **Laporan Paket dan Plan** (6 tab) | **Selesai.** Time-series "aktif pada tanggal" dibangun lewat `bucketSeriesExpression()` (generate_series Postgres), bukan helper JS |
| **4** ✅ | **Laporan Member** (6 tab) | **Selesai.** Status aktif/inaktif/freeze dihitung ulang lewat LATERAL EXISTS, bukan CASE `membeship_status` lama — hasilnya sama tapi satu query untuk tujuh metrik sekaligus |
| **5** ✅ | **Laporan Karyawan** (7 tab) | **Selesai.** Tab Kinerja Penjualan memakai ulang `EmployeeSection` dari fase 1 lewat prop `domain` |
| **6** ✅ | **Laporan Produk** (5 tab) | **Selesai.** Margin memakai HPP produk saat ini (`hpp_snapshot` belum ada) dan diberi label estimasi. Tab Stok diberi peringatan eksplisit di halaman bahwa angkanya posisi saat ini, bukan riwayat |
| **7** | Export XLSX sisi server + print view, lalu `resolveReportClubIds` diaktifkan multi-club | Setelah bentuk data stabil |

---

## 8. Verifikasi

### Backend (`migios-be/`)
1. `npm run typecheck` dan `npm run typecheck:ts7` — harus bersih. (`nest build` sukses tidak membuktikan apapun.)
2. `npm run lint` — harus bersih.
3. Sub-modul terdaftar di `imports` milik `report.module.ts`; setiap route punya `@UseGuards(JwtAuthGuard)`.
4. `npm run dev`, lalu baca log `RouterExplorer`: pastikan route yang dimaksud benar-benar ter-mapping dan tidak ada yang bertabrakan.
5. Uji manual tiap endpoint baru dengan token **dua club berbeda** — angkanya harus berbeda (bukti scoping `club_id` bekerja) dan tidak ada error kolom.
6. Silang-cek: `Net Sales` dari `/api/v1/report/sales/summary` harus sama dengan `/api/v1/sales/report` yang lama pada rentang tanggal yang sama.
7. Selama alias masih ada: `/api/v1/report/head` dan `/api/v1/report/dashboard/head` harus mengembalikan respons identik dengan token yang sama.

### Frontend (`migios-shadcn/`)
1. `npm run lint` — harus bersih. `npm run typecheck` punya **56 error bawaan di 21 file** (`otp-form`, `club-setup`, `employee/detail`, `setting/gym`, `roles-permissions`, `use-sidebar-data`, `@types/measurement.ts`, dsb.) yang **tidak berhubungan dengan laporan**. Patokannya bukan "bersih", tapi: `npm run typecheck 2>&1 | grep -E "^src/pages/master/reports"` harus kosong, dan jumlah total tidak boleh naik dari 56.
2. `npx vite build --mode development` — harus sukses.
3. Buka halaman **dashboard** — kartu statistik dan grafik overview harus tampil sama seperti sebelumnya (kartunya sekarang `ReportKpiCard`), dan di tab Network request-nya menuju `/report/dashboard/overview` + `/report/dashboard/head`.
4. `npm run dev`, buka keenam menu dari sidebar — semua ter-render, tidak ada 404.
5. Ganti rentang tanggal, granularitas, dan toggle — URL ikut berubah (`?from&to&inv&g&cmp&cmpm`), dan `queryKey` menyertakan semua nilai filter (aturan `exhaustive-deps`).
6. Salin URL lengkap dengan `?view=` dan buka di tab baru — section **dan** filter yang sama terbuka.
7. Cek dark mode dan layar sempit (kedua tab bar harus bisa scroll horizontal).
8. Tidak ada satupun komentar di kode baru (aturan keras `CLAUDE.md`).
