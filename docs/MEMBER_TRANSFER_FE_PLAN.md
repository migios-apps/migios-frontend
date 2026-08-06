# MEMBER_TRANSFER_FE_PLAN.md — Frontend Transfer Kepemilikan Paket

Rencana implementasi frontend untuk **Penjualan → Transfer Member** dan seluruh layar yang
harus menampilkan asal-usul paket hasil transfer.

Pendamping dokumen ini: [../../migios-be/docs/MEMBER_TRANSFER_PLAN.md](../../migios-be/docs/MEMBER_TRANSFER_PLAN.md).

Dokumen ini ada di `migios-shadcn/docs/`. Path berawalan `../` merujuk `migios-shadcn/`,
`../../migios-be/` merujuk backend.

---

## 1. Status saat ini

| Item | Lokasi | Status |
|---|---|---|
| Halaman | [../src/pages/master/sales/TransferMember/index.tsx](../src/pages/master/sales/TransferMember/index.tsx) | **stub 21 baris** — hanya `<p>Halaman Transfer Member akan ditampilkan di sini.</p>` |
| Route | `/sales/transfer-member` | sudah terdaftar |
| Tab nav | [../src/pages/master/sales/Layout.tsx:36](../src/pages/master/sales/Layout.tsx) | label "Transfer Member" sudah ada |
| Service API | — | belum ada |
| Pengaturan | — | belum ada |

Jadi kerangkanya sudah ada, isinya belum sama sekali.

> ⚠️ Ada [TransferMemberDialog.tsx](../src/pages/trainer/components/TransferMemberDialog.tsx)
> di modul trainer. Itu **fitur lain** — memindahkan member antar trainer. Jangan dipakai ulang,
> jangan diubah.

---

## 2. Prinsip

> **Transfer memindahkan aset berbayar, dan hanya bisa dibatalkan selama penerima belum
> memakainya.** Layarnya harus membuat staff yakin sebelum menekan tombol, dan membuat siapa pun
> yang membaca data enam bulan kemudian paham apa yang terjadi.

Tiga konsekuensi yang mengikat seluruh fase:

1. **Wajib ada langkah ringkasan** sebelum eksekusi. Bukan dialog "Anda yakin?", tapi ringkasan
   berisi angka sungguhan: sisa hari, sisa sesi, biaya, tanggal potong.
2. **Asal-usul harus terlihat di kedua sisi.** Kalau hanya penerima yang diberi badge, halaman
   pemberi menampilkan paket 12 bulan yang mati di bulan ke-3 tanpa penjelasan.
3. **Validasi di sini adalah kenyamanan, bukan pengaman.** Lihat di bawah.

### 🔴 Frontend tidak pernah menjadi pengaman

Semua palang transfer — kepemilikan paket, sesi pending, transaksi lunas, batas rantai, kuota,
biaya — ditegakkan di **backend**, di dalam transaksi. Lihat
[MEMBER_TRANSFER_PLAN.md Fase 2](../../migios-be/docs/MEMBER_TRANSFER_PLAN.md).

Yang dikerjakan frontend adalah memberi tahu staff lebih awal supaya tidak menunggu penolakan
server. Itu berharga, tapi bukan pengaman: tombol yang non-aktif hanya menyembunyikan aksinya,
tidak menutup endpoint-nya.

- [x] **Jangan pernah mengirim angka hasil hitungan sendiri.** Payload hanya berisi
      `from_member_id`, `to_member_id`, `member_package_ids[]`, dan `reason` — **tidak ada**
      `fee_amount`, `end_date`, `session_remaining`, atau `transferred_at`. Backend menghitung
      semuanya sendiri, dan nilai yang tidak dikirim tidak bisa dipalsukan
- [x] **Angka yang ditampilkan selalu berasal dari `apiPreviewTransfer`**, bukan dihitung ulang
      di komponen. Perhitungan ganda pasti menyimpang, dan yang menyimpang di layar akan
      dipercaya staff
- [x] **Tangani penolakan backend dengan anggun**, meski UI mengira semuanya valid. Kondisi bisa
      berubah antara preview dan eksekusi — sesi disetujui, paket kedaluwarsa, freeze masuk
- [x] **Tombol non-aktif bukan satu-satunya perlindungan.** Perlakukan setiap penolakan server
      sebagai kejadian normal yang harus terbaca, bukan sebagai kesalahan tak terduga

Aturan yang sama berlaku untuk pengaturan: nilai seperti `transfer_fee_amount` dan
`transfer_max_chain_length` **dibaca** untuk ditampilkan, tidak pernah dikirim balik sebagai
bagian dari permintaan transfer.

Aturan yang mengikat (lihat [../CLAUDE.md](../CLAUDE.md)):

- Nol komentar di kode.
- Semua network call lewat `ApiService.fetchDataWithAxios`. Jangan `try/catch` + `toast.error`
  untuk kegagalan API — interceptor sudah menanganinya.
- Query key selalu dari `@/constants/queryKeys.constant.ts`.
- `@tanstack/query/exhaustive-deps` adalah **error** — semua nilai di dalam `queryFn` harus
  muncul di `queryKey`.
- Token semantik (`bg-background`, `text-muted-foreground`), setiap warna baru wajib punya
  pasangan dark mode.
- Penulisan yang di-scope per club mengirim `club_id: club?.id` dari store, bukan route param.

---

## 3. Urutan pengerjaan

```
Fase A Tipe & service ──► Fase B Kerangka + pemilih paket ──► Fase C Penerima ──► Fase D Ringkasan & eksekusi
                                                                                        │
                     Fase F Pengaturan ◄──────────────────────────────────────────┐     │
                                                                                  │     ▼
                                                   Fase E Tree asal-usul ──► Fase G Riwayat & pembatalan
```

Fase A blocking. Fase F boleh dikerjakan kapan saja setelah A.

---

## Fase A — Tipe & service API — **SELESAI**

- [x] Tipe di `../src/services/api/@types/transfer.ts`:
      `TransferEligiblePackage`, `TransferPreview`, `TransferChainNode`, `MemberPackageTransfer`
- [ ] ⬜ **SEBAGIAN** — `transferred` ditambahkan ke `statusColor`, tapi tidak ada tipe
      `PackageStatus` di `@types/member.ts` untuk ditambahi. Status paket bertipe `string`
- [x] `TransferFeeType = "none" | "flat"`, `TransferFeeBasis = "per_transfer" | "per_package"`
- [x] `apiPreviewTransfer` / `apiExecuteTransfer` mengirim **array** `member_package_ids`
- [x] Service `../src/services/api/MemberPackageTransferService.ts`:
      `apiGetEligiblePackages`, `apiPreviewTransfer`, `apiExecuteTransfer`,
      `apiGetTransferList`, `apiGetTransferChain`
- [x] `QUERY_KEY` baru: `transferEligible`, `transferPreview`, `transferList`, `transferChain`

Kontrak dibandingkan field per field dengan backend sebelum Fase D — cara yang sama dipakai
untuk `FreezeQuota` di plan keanggotaan dan menangkap ketidakcocokan sebelum sampai layar.

---

## Fase B — Kerangka halaman & pemilih paket — **SELESAI**

Mengganti stub. Alur 3 langkah, bukan satu form panjang — karena keputusan di langkah 1
membatasi pilihan di langkah 2.

```
1. Pemberi & paket   →   2. Penerima   →   3. Ringkasan & konfirmasi
   (bisa banyak paket)
```

- [x] Cari member pemberi — tiru pola `search_column: "member_name"` / `"member_code"` dari
      [Freeze](../src/pages/master/sales/Freeze/index.tsx)
- [x] Daftar **seluruh** paket pemberi dari `apiGetEligiblePackages`
- [x] Paket yang tidak layak tetap **ditampilkan tapi non-aktif, dengan alasannya**

Menyembunyikan paket yang tidak layak membuat staff mengira paketnya tidak ada, lalu menelepon
dukungan. Menampilkannya dengan alasan membuat staff bisa menindaklanjuti sendiri:

| Kode dari backend | Pesan di layar |
|---|---|
| `PENDING_SESSION_APPROVAL` | "Ada 2 sesi menunggu persetujuan — selesaikan dulu" |
| `TRANSACTION_UNPAID` | "Transaksi pembelian belum lunas" |
| `PACKAGE_FROZEN` | "Paket sedang dalam masa freeze" |
| `TRANSFER_LIMIT_REACHED` | "Paket ini sudah pernah ditransfer" |
| `PACKAGE_TYPE_NOT_ALLOWED` | "Jenis paket ini tidak diizinkan ditransfer" |
| `REMAINING_TOO_SHORT` | "Sisa masa berlaku kurang dari N hari" |

### Pilih beberapa paket, bukan satu

Pemberi menentukan sendiri apa yang diserahkan — membership saja, PT saja, atau semuanya
sekaligus. Jadi ini **checkbox**, bukan radio.

- [x] Checkbox per paket — **tidak dikelompokkan menurut jenis**; daftar rata dengan badge
      jenis di tiap baris. Cukup terbaca pada 18 paket, tapi bukan seperti rencana
- [x] Tombol **"Pilih Semua yang Bisa Ditransfer"**
- [x] Panel *"N paket dipilih · biaya Rp X"* muncul di atas daftar begitu ada yang dicentang,
      memakai `runningFee` yang dihitung dari `policy.feeBasis` — jadi `per_package` langsung
      terlihat mengalikan
- [x] Minimal satu paket harus dipilih sebelum lanjut

```
Paket milik Budi Santoso

  ☑  Gold 12 Bulan          membership   01 Jan — 31 Des 2026     291 hari
  ☑  PT Program 12 Sesi     pt_program   01 Jan — 31 Mar 2026     8 sesi tersisa
  ☐  Yoga Kelas             class        ada 2 sesi menunggu persetujuan     ← non-aktif
  ☐  Zumba 6 Bulan          class        sudah pernah ditransfer             ← non-aktif

  [ Pilih Semua yang Bisa Ditransfer ]        2 paket dipilih · Rp 100.000
```

- [x] Paket non-aktif **tidak** ikut terpilih oleh tombol "Pilih Semua"

Transfer bersifat **semua-atau-tidak sama sekali** di backend: bila satu paket terpilih ternyata
gagal validasi saat eksekusi, seluruh transfer ditolak. Karena itu daftar ini harus jujur sejak
awal — staff tidak boleh mencentang sesuatu yang akan menggagalkan semuanya di detik terakhir.

- [x] Status `eligible` **selalu** berasal dari backend, tidak pernah disimpulkan di komponen
      dari `status`, `end_date`, atau field lain. Menyimpulkannya sendiri berarti dua sumber
      kebenaran yang pasti menyimpang, dan yang di layar akan lebih dipercaya daripada yang benar

- [x] Panel penjelasan **dan** tab tersembunyi. `Layout.tsx` kini membaca `useSettings()`
      dan menyaring `tabItems` — polanya sama dengan `freeze_enabled`

---

## Fase C — Penerima: cari **atau** daftar cepat — **SELESAI**

Keputusan yang sudah diambil: **keduanya**. Mewajibkan member terdaftar lebih dulu membuat staff
harus keluar halaman, mendaftar, lalu mengulang dari awal — dan formulir transfer yang sudah
diisi hilang.

- [x] Combobox cari member: kode, nama, telepon
- [x] Pemberi sendiri **dikecualikan** dari hasil pencarian
- [x] Tombol **"Daftarkan Member Baru"** → dialog
- [x] Setelah pendaftaran sukses, member baru **langsung terpilih** sebagai penerima

### Dialog pendaftaran harus memakai ulang form yang ada

- [x] Pakai [FormMember.tsx](../src/components/form/member/FormMember.tsx) dan
      [memberValidation.ts](../src/components/form/member/memberValidation.ts)

**Jangan menulis form member kedua.** Validasi member mencakup NIK, email unik per club,
tanggal lahir, dan gender — menyalinnya ke dalam form transfer berarti dua tempat yang harus
diubah setiap kali aturan member berubah, dan yang kedua pasti tertinggal.

Kalau `FormMember` belum bisa dipakai di dalam dialog, **refactor komponennya**, jangan
digandakan.

---

## Fase D — Ringkasan & eksekusi — **SELESAI**

Langkah paling penting di seluruh fitur.

- [x] Panggil `apiPreviewTransfer` — **tanpa menulis apa pun** — dan tampilkan hasilnya

```
┌─ Ringkasan Transfer ──────────────────────────────────────┐
│                                                           │
│  Dari       Budi Santoso   · MBR2512120000001001          │
│  Ke         Adi Santoso    · MBR2601050000001042          │
│  Tanggal    15 Maret 2026                                 │
│                                                           │
│  ── Gold 12 Bulan · membership ──────────────────────     │
│     Budi    01 Jan — 15 Mar 2026    berakhir              │
│     Adi     15 Mar — 31 Des 2026    291 hari              │
│                                                           │
│  ── PT Program 12 Sesi · pt_program ─────────────────     │
│     Budi    01 Jan — 15 Mar 2026    berakhir              │
│     Adi     15 Mar — 31 Mar 2026    8 sesi                │
│             (4 sesi sudah dipakai Budi)                   │
│     Jadwal  Selasa 19:00 · Trainer Rian        [ Ubah ]   │
│                                                           │
│  ─────────────────────────────────────────────────────    │
│  2 paket                                   Rp 100.000     │
│                                                           │
│  ⚠ Dapat dibatalkan dalam 24 jam, selama Adi belum        │
│    check-in atau memakai sesi.                            │
└───────────────────────────────────────────────────────────┘
```

- [x] Satu blok per paket, dikelompokkan menurut jenis
- [ ] ⬜ **SEBAGIAN** — jadwal kini **ditampilkan**: hari + jam per weekday dan nama trainer,
      dari `pt_schedules` yang ditambahkan ke endpoint preview. Tapi **tidak bisa diedit di layar
      ini** — staff diarahkan menyunting di halaman Jadwal setelah transfer. Membuat editor event
      di dalam form transfer berarti menduplikasi halaman Jadwal
- [x] Untuk paket kelas: keterangan bahwa jadwal kelas tidak berubah
- [x] Total biaya di bawah, dengan jumlah paket — supaya basis `per_package` terlihat wajar
      dan tidak terbaca sebagai salah hitung
- [x] Muncul saat seluruh paket layak tercentang: pemberi jadi tidak aktif, tapi riwayat
      kehadiran, pengukuran, dan poin loyalti tetap miliknya
- [x] Tombol eksekusi terkunci sampai ringkasan selesai dimuat
- [x] Setelah sukses → arahkan ke detail member penerima

### Jadwal PT wajib dikonfirmasi, bukan disalin diam-diam

Backend menyalin slot lama sebagai default. Tapi orang yang datang berbeda: level kebugaran
lain, riwayat latihan lain, mungkin ada cedera. Trainer harus tahu.

- [x] Nama trainer dan slot (hari + jam) tampil per event yang ikut berpindah
- [x] Field **"Catatan untuk trainer"** terpisah dari alasan, dikirim sebagai `notes`

Memaksa jadwal dibuat ulang dari nol juga buruk — slot itu sudah dipesan di kalender trainer,
dan melepasnya berisiko direbut member lain. Karena itu: **salin sebagai default, tampilkan,
biarkan diedit.**

---

## Fase E — Tree asal-usul paket — **SELESAI**

Yang diminta secara eksplisit: kejelasan paket berasal dari siapa.

- [x] Komponen `../src/components/package/PackageTransferChain.tsx`
- [x] Dipakai di [Package.tsx](../src/pages/members/detail/Package.tsx) — kartu **dan** tabel

```
Paket Gold 12 Bulan
│
├─ Budi Santoso      01 Jan — 15 Mar 2026    Ditransfer     4/12 sesi
│                    ↓ Rp 100.000 · oleh Rina · 15 Mar 2026
└─ Adi Santoso       15 Mar — 31 Des 2026    Aktif          0/8 sesi   ← sekarang
```

Rantainya dijamin **linear** oleh `@@unique` di backend, jadi cukup ditelusuri — tidak perlu
komponen tree rekursif.

### Badge di kedua sisi

- [x] Sisi pemberi: **"Ditransfer ke Adi Santoso"**
- [x] Sisi penerima: **"Warisan dari Budi Santoso"**
- [x] Klik badge → dialog berisi rantai di atas
- [x] Transfer yang dibatalkan **tidak muncul** di tree — paket penerima sudah dihapus di
      backend, jadi rantainya bersih dengan sendirinya. Jejaknya hidup di riwayat (Fase G)

Simetri ini bukan kelengkapan kosmetik. Tanpa badge di sisi pemberi, staff melihat paket 12
bulan yang berakhir di bulan ketiga tanpa sebab, dan satu-satunya cara mengetahuinya adalah
membuka database.

- [x] Status `transferred` ditambahkan ke `statusColor` di
      [constants/utils.ts](../src/constants/utils.ts), **dengan varian dark mode**
- [x] Warnanya harus **berbeda dari `expired`** — keduanya berarti "sudah tidak berlaku", tapi
      hanya satu yang berarti member berhenti

---

## Fase F — Halaman pengaturan transfer — **SELESAI**

Card baru di **Pengaturan → Lainnya → Keanggotaan**, atau tab tersendiri bila halamannya sudah
terlalu panjang — halaman itu sekarang sudah memuat 20 field.

- [x] `transfer_enabled` — switch
- [x] `transfer_fee_type` + `transfer_fee_amount` — nominal disembunyikan saat `none`,
      polanya sama dengan biaya freeze yang sudah ada
- [x] Keterangan bahwa biaya transfer **masuk sebagai pendapatan** dan muncul di laporan
      penjualan sebagai kategori **"Transfer"** — supaya pemilik tahu angkanya bisa dilacak,
      bukan sekadar ongkos administrasi yang menguap
- [x] `transfer_fee_basis` — radio `per_transfer` / `per_package`, hanya tampil saat
      `transfer_fee_type = flat`, dengan contoh hitungan hidup:
      *"3 paket → Rp 100.000"* vs *"3 paket → Rp 300.000"*
- [x] `transfer_max_chain_length` — angka, keterangan "0 = tanpa batas"
- [x] `transfer_min_remaining_days` — angka
- [x] `transfer_allowed_package_types` — checkbox `membership`, `class`, `pt_program`
- [x] Pakai `useSettings()` dari [use-settings.ts](../src/hooks/use-settings.ts), **jangan**
      `useQuery` langsung
- [x] `invalidateSettings()` setelah simpan

### Keterangan yang wajib ada di layar

- [x] Di `transfer_allowed_package_types`, saat `pt_program` dicentang: peringatan bahwa jadwal
      PT ikut berpindah dan trainer perlu diberi tahu
- [x] Di `transfer_max_chain_length`: keterangan bahwa nilai `1` mencegah paket dioper
      berulang kali

Yang kedua bukan sekadar bantuan — itu satu-satunya palang terhadap paket promo yang dibeli
untuk dioper dengan untung. Pemilik gym harus paham apa yang dia matikan bila mengubahnya.

### Tiga pengerem, tampilkan sebagai satu kesatuan

Tujuan pemilik biasanya sama: member tidak seenaknya minta transfer. Tiga setting bekerja untuk
itu dengan cara berbeda, dan lebih mudah dipahami bila disandingkan dalam satu card:

| Setting | Sifat |
|---|---|
| `transfer_fee_amount` | ekonomis — menaikkan ongkos, tidak melarang |
| **`transfer_max_chain_length`** | **absolut** — satu paket hanya bisa dioper sekali |
| `transfer_min_remaining_days` | menutup transfer receh di ujung masa berlaku |

- [x] Ketiga field ada dalam satu card **"Pembatas"** dengan keterangan masing-masing yang
      menjelaskan sifatnya. Tabel perbandingan tidak dirender terpisah — keterangannya sudah
      menyampaikan hal yang sama tanpa menambah komponen

---

## Fase G — Riwayat & pembatalan — **SELESAI**

- [x] Tabel riwayat di halaman transfer, memakai `customKyselyQuery` lewat pola tabel yang ada
- [x] Kolom: tanggal, paket, dari, ke, biaya, staff, status
- [x] `InputDebounce` di header kartu riwayat, mencari 4 kolom sekaligus: nama & kode pemberi
      dan penerima
- [x] Badge, alasan, **dan nama pembatal** — `voided_by` kini di-join ke `users` sebagai
      `voided_by_name`

### Tombol Batalkan

Berpasangan dengan Fase 7 backend. Dua situasi, dua tombol berbeda — jangan disatukan:

| Situasi | Tombol | Hasil |
|---|---|---|
| Penerima belum memakai apa pun, masih dalam `transfer_void_window_hours` | **Batalkan** | dikembalikan seperti tidak pernah terjadi |
| Penerima sudah check-in / memakai sesi | **Transfer Balik** | mata rantai baru di tree |

- [x] Tombol **non-aktif dengan alasan di tooltip**, memakai `recipient_attendance_count`
      (baru dari backend) dan `transfer_void_window_hours`. Tiga alasan tertangani: pembatalan
      dimatikan, penerima sudah check-in, jendela waktu lewat

| Kode dari backend | Pesan di layar |
|---|---|
| `TRANSFER_ALREADY_VOIDED` | "Transfer ini sudah dibatalkan" |
| `RECIPIENT_HAS_ACTIVITY` | "Penerima sudah check-in — pakai Transfer Balik" |
| `VOID_WINDOW_EXPIRED` | "Batas waktu pembatalan (24 jam) sudah lewat" |
| `PACKAGE_ALREADY_TRANSFERRED` | "Paket sudah ditransfer lagi ke member lain" |

- [x] Dialog konfirmasi menampilkan **apa yang akan dikembalikan**: paket kembali ke pemberi
      dengan `end_date` asli, transaksi biaya di-void, jadwal PT dipulihkan
- [x] Wajib isi alasan pembatalan
- [x] Setelah sukses, invalidate query paket **kedua** member — pemberi dan penerima

### Tidak ada tombol "Ubah Penerima"

Terasa paling praktis, dan justru paling berbahaya. Menyunting penerima di baris yang sudah ada
membuat log **berbohong**: ia mengklaim transfernya sejak awal ke orang yang benar. Tree
asal-usul ikut berbohong — padahal itu satu-satunya alat staff memahami apa yang terjadi.

Batalkan lalu transfer ulang mencapai hasil akhir yang sama, dengan dua baris log yang jujur.
Bila ada permintaan menambahkan tombol ini, tolak dan rujuk ke bagian 7.4 plan backend.

---

## Fase H — Pindah ke jalur `sales/checkout`

Berpasangan dengan **Fase 10** di plan backend. Alasannya ada di sana: jalur transfer sendiri
membuat transaksi **tanpa baris `payments`**.

- [x] **Seluruh URL kini di bawah `/sales/`** — modul `member-package-transfer` dihapus total:

| Fungsi | URL |
|---|---|
| `apiExecuteMemberPackageTransfer` | `POST /sales/checkout` |
| `apiVoidMemberPackageTransfer` | `DELETE /sales/void/:transaction_id` |
| `apiGetMemberPackageTransferList` | `GET /sales/transfer` |
| `apiGetTransferEligiblePackages` | `GET /sales/transfer/eligible/:member_id` |
| `apiPreviewMemberPackageTransfer` | `POST /sales/transfer/preview` |
| `apiGetMemberPackageTransferChain` | `GET /sales/transfer/chain/:member_package_id` |
- [x] Pemilih **rekening penerimaan** muncul saat biaya > 0; tombol Proses terkunci sampai
      rekening dipilih. Transfer gratis mengirim `payments: []`
- [x] Dialog pembatalan tidak lagi meminta alasan — void transaksi penjualan yang menentukan
      alasannya, supaya seragam dengan penjualan lain
- [x] **`reason` kini wajib** di form transfer; tombol Proses terkunci sampai diisi, sejalan
      dengan `@IsNotEmpty()` di DTO backend
- [x] Payload selalu `is_paid: 1` — backend menolak `0`, `2`, dan `3` untuk item transfer.
      Tidak ada mode bayar sebagian di layar transfer, dan memang tidak boleh ada:
      kepemilikan berpindah atau tidak, tidak ada di antaranya
- [x] Rekening wajib dipilih saat biaya > 0; transfer gratis mengirim `payments: []` dengan
      `total_amount: 0` dan tetap dianggap lunas
- [x] Tombol Batalkan disembunyikan bila `transaction_id` kosong

### Harga tidak dikirim dari layar

Payload tetap mengirim `price`, tapi **backend mengabaikannya** dan menghitung ulang dari
`transfer_fee_amount` × `transfer_fee_basis`. Dibuktikan: dikirim `price: 1`, tersimpan
`150000`. Ini menegakkan aturan di bagian 2 tanpa bergantung pada disiplin frontend.

### Invoice

Detail transfer ikut di `GET /sales/detail/:id` sebagai objek `transfer` bersarang di dalam
`items[]` — pemberi, penerima, tanggal, alasan, dan daftar paket beserta sisa sesinya.
Terbukti di HTTP:

```
INVOICE 022 | total Rp 150000
─ item: Biaya Transfer — 1 paket | Rp 150000 | transfer
   dari  : Joni · MBR2512120000001001
   ke    : Bima · MBR2512070000001001
   paket : Monthly [membership] sisa sesi 10
pembayaran: [150000]
```

---

## 4. Checklist per fase

Untuk **setiap** fase:

1. `npm run typecheck` bersih — `strict` + `noUnusedLocals` + `noUnusedParameters` aktif,
   variabel tak terpakai adalah error build
2. `npm run lint` bersih — pelanggaran Prettier muncul di sini
3. `npm run prettier:fix` dijalankan; **jangan** merapikan format atau urutan import manual
4. Halaman baru? Pastikan file route, spread di `protectedRoute.ts`, dan entri navigasi ada
5. Warna atau spacing baru? Cek [../DESIGN.md](../DESIGN.md) dan verifikasi dark mode
6. 🔴 Setiap aturan yang ditegakkan di layar sudah punya pasangannya di backend — periksa
   plannya, jangan berasumsi. UI yang memblokir sesuatu yang backend izinkan adalah lubang,
   bukan fitur
7. Diff dibaca ulang, seluruh komentar yang ditulis dihapus
8. Berhenti — jangan commit, push, atau bikin branch

---

## 5. Verifikasi di browser

Ikuti skill `run-verify` di `migios-be`.

| Skenario | Harapan |
|---|---|
| `transfer_enabled = 0` | ✅ **diperbaiki** — `Layout.tsx` menyaring tab lewat `useSettings()` |
| Paket dengan sesi pending | ⬜ **belum diuji** — tidak ada data sesi pending di lokal |
| Daftar member baru dari dalam form | ⬜ **belum diuji di browser** — jalurnya ada (`onCreated`) tapi belum dijalankan |
| Transfer membership | ✅ **lolos** — tree & badge "Warisan dari Joni" terverifikasi |
| Transfer berbayar → **Laporan Penjualan** | ✅ **lolos lewat SQL** (kategori `transfer` Rp 250.000), **belum lewat layar laporan** |
| Batalkan → laporan lagi | ✅ **lolos lewat SQL** — kategori `transfer` hilang, **belum lewat layar** |
| **3 paket sekaligus** | ✅ **lolos di backend** — 1 header, 3 item, 1 biaya. Lewat layar belum |
| "Pilih Semua yang Bisa Ditransfer" | ⬜ **belum diuji** — tombolnya tampil, klik-nya belum dicoba |
| Seluruh paket dipindah | ⬜ **belum diuji** |
| Transfer paket kelas | ✅ **lolos di backend** — nol event berubah. Lewat layar belum |
| Transfer paket PT | ⬜ **SEBAGIAN** — jadwal kini ditampilkan (hari, jam, trainer); menyunting diarahkan ke halaman Jadwal |
| Dark mode | ✅ **lolos** — seluruh verifikasi dijalankan di tema gelap |
| 🔴 **`curl` dengan paket milik member lain** | ✅ **lolos** — `The package does not belong to this member: 113` |
| **Batalkan** transfer yang belum dipakai | ✅ **lolos** — lewat UI, paket & jadwal pulih, biaya keluar dari omzet |
| Batalkan setelah penerima check-in | ⬜ **belum diuji** — dan tombol non-aktifnya memang belum dibuat |

Data uji dihapus dan setting dipulihkan setelah verifikasi.

---

## 6. Ringkasan

| Fase | Isi | Berat | Blocker | Status |
|---|---|---|---|---|
| A | Tipe & service | Ringan | BE Fase 6 | **Selesai** |
| B | Kerangka + pemilih paket | Sedang | A | **Selesai** |
| C | Penerima + daftar cepat | Sedang | B | **Selesai** |
| D | Ringkasan & eksekusi | **Berat** | C | **Selesai** |
| E | Tree asal-usul | Sedang | A | **Selesai** |
| F | Pengaturan | Ringan | BE Fase 1 | **Selesai** |
| G | Riwayat & pembatalan | Sedang | D | **Selesai** |

Fase yang paling berisiko luput adalah **E** — badge di sisi **pemberi** gampang terlupakan
karena seluruh perhatian tertuju ke penerima, padahal justru halaman pemberi yang akan
membingungkan staff berbulan-bulan kemudian.

Fase yang paling berisiko **merugikan** adalah **D**: tanpa ringkasan berisi angka sungguhan,
staff menjalankan operasi yang hanya bisa dibatalkan dalam jendela sempit sambil menebak.

---

## 7. Sisa pekerjaan — jujur

Alur utama berfungsi dan terverifikasi di browser: pilih pemberi → pilih paket → pilih penerima
→ ringkasan → proses → tree → batalkan. Tapi **11 butir belum selesai**.

### Yang paling terasa oleh staff

| # | Sisa | Akibat |
|---|---|---|
| 1 | **Tab "Transfer Member" tidak disembunyikan** saat `transfer_enabled = 0` | Staff tetap bisa membuka menu yang isinya cuma panel "fitur dimatikan". `Layout.tsx` tidak membaca `useSettings()` sama sekali |
| 2 | **Jadwal PT tidak ditampilkan dan tidak bisa diedit** di ringkasan | Ini gagal memenuhi prinsip yang saya tulis sendiri: *"jadwal PT wajib dikonfirmasi, bukan disalin diam-diam"*. Yang ada baru **keterangan** bahwa jadwal ikut pindah — slot dan nama trainer tidak terlihat |
| 3 | **Tombol Batalkan tidak non-aktif dengan alasan** | Syarat seperti "penerima sudah check-in" baru ketahuan **setelah** diklik dan ditolak backend. Aman, tapi staff menabrak dinding tanpa peringatan. Tabel kode error di Fase G belum dipakai sama sekali |
| 4 | **Riwayat transfer tanpa input pencarian** | Backend sudah menyediakan 9 kolom yang bisa dicari/diurutkan lewat `customQueryAttr` — UI-nya yang belum ada |

### Kosmetik / informasi

| # | Sisa |
|---|---|
| 5 | Ringkasan berjalan *"N paket dipilih · biaya Rp X"* saat mencentang — kini hanya *"3 dari 18 paket bisa dipindahkan"* |
| 6 | Checkbox paket tidak dikelompokkan menurut jenis (daftar rata dengan badge jenis) |
| 7 | Keterangan saat **seluruh** paket dipilih: pemberi akan jadi tidak aktif tapi datanya tetap ada |
| 8 | Catatan khusus untuk trainer di form (kini hanya field alasan umum) |
| 9 | Nama pembatal tidak tampil di riwayat — `voided_by` belum di-join ke `users` |
| 10 | Tabel perbandingan "tiga pengerem" tidak ditampilkan di halaman pengaturan |
| 11 | Tidak ada tipe `PackageStatus` di FE untuk ditambahi `transferred` — status paket bertipe `string` |

### Skenario browser yang belum dijalankan

- **Transfer 3 paket sekaligus** — hanya 1 paket yang pernah dipindahkan lewat UI
- **Transfer paket kelas** dan **paket `pending`**
- **"Pilih Semua yang Bisa Ditransfer"** — tombolnya tampil, klik-nya belum dicoba
- **Daftar member baru dari dalam form** — jalur `onCreated` ada, belum dijalankan
- **Seluruh paket dipindah** — pemberi jadi tidak aktif
- **Laporan Penjualan lewat layar** — kategori "Transfer" baru dibuktikan lewat SQL

### Yang sudah terbukti di browser

Panel fitur-dimatikan · tab pengaturan + seluruh fieldnya muncul saat switch dinyalakan ·
pencarian pemberi · 18 paket dengan alasan tidak layak per baris · pemilihan penerima ·
ringkasan dengan biaya Rp 175.000 · eksekusi · badge "Warisan dari Joni" · tree dua tingkat ·
riwayat · dialog pembatalan · badge "Dibatalkan" dengan alasan. Semuanya di **dark mode**.
