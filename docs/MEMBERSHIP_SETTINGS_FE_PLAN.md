# MEMBERSHIP_SETTINGS_FE_PLAN.md — Frontend Pengaturan Keanggotaan

Rencana implementasi frontend untuk **Pengaturan → Lainnya → Keanggotaan** dan seluruh layar
yang harus mematuhi kebijakannya.

Pendamping dokumen ini: [../migios-be/docs/MEMBERSHIP_SETTINGS_PLAN.md](../../migios-be/docs/MEMBERSHIP_SETTINGS_PLAN.md).
Path tanpa awalan relatif terhadap `migios-shadcn/`.

---

## 1. Status saat ini

Prototype lama berisi 13 toggle fiktif (guest pass, locker, handuk, parkir, priority booking,
transfer membership) yang tidak punya model, kolom, maupun service di backend — **sudah
dihapus**. Selain itu halaman lama memakai `useState` murni: `handleSave` hanya `console.log`.

### Sudah selesai

| Item | Lokasi | Catatan |
|---|---|---|
| Halaman setting keanggotaan | [src/pages/master/setting/others/membership/index.tsx](../src/pages/master/setting/others/membership/index.tsx) | 20 field, yup + react-hook-form + `FormFieldItem`, pola sama dengan tab Voucher |
| Kontrak tipe | [src/services/api/@types/settings/settings.ts](../src/services/api/@types/settings/settings.ts) | 17 field baru + tipe `CrossClubAccess`, `ActivationMode` |
| Route | [src/routes/pages/settings/othersSettings.route.ts:48](../src/routes/pages/settings/othersSettings.route.ts) | sudah terdaftar sebelumnya |
| Tab nav | [src/pages/master/setting/others/Layout.tsx:42](../src/pages/master/setting/others/Layout.tsx) | sudah ada label "Keanggotaan" |

> **Status: backend Fase 0-7 dan frontend Fase A-F selesai**, seluruhnya terverifikasi di
> browser sungguhan. Tersisa **Fase G**, yang terkunci di DECISION GATE (Opsi A vs B).

### Isi halaman sekarang

| Card | Field |
|---|---|
| Akses Antar Cabang | `membership_cross_club_access`, `membership_cross_club_ids`, `membership_apply_to_all_branch` |
| Aktivasi & Masa Berlaku | `membership_activation_mode`, `membership_first_checkin_deadline_days`, `membership_grace_period_days` |
| Kebijakan Freeze | `freeze_enabled`, `freeze_require_approval`, `freeze_extend_end_date`, `freeze_min_days`, `freeze_max_days_per_request`, `freeze_max_days_per_year`, `freeze_max_request_per_year` |
| Check-in & Sesi | `checkin_max_per_day`, `checkin_auto_checkout_hours`, `checkin_block_when_expired`, `require_session_approval` |
| Penomoran Kode Member | `member_code_prefix`, `member_code_sequence_length`, `member_code_include_club_id` + preview live |

---

## 2. Prinsip

> **Halaman setting hanya setengah pekerjaan.** Setting yang tidak dibaca layar operasional
> adalah toggle fiktif — persis kesalahan prototype lama. Setiap fase di bawah memasangkan
> satu kelompok setting dengan layar yang mengonsumsinya.

Aturan yang mengikat (lihat [CLAUDE.md](../CLAUDE.md)):

- Nol komentar di kode.
- Semua network call lewat `ApiService.fetchDataWithAxios`. Jangan `try/catch` + `toast.error`
  untuk kegagalan API — interceptor sudah menanganinya.
- Query key selalu dari `@/constants/queryKeys.constant.ts`.
- `@tanstack/query/exhaustive-deps` adalah **error** — semua nilai di dalam `queryFn` harus
  muncul di `queryKey`.
- Token semantik (`bg-background`, `text-muted-foreground`), setiap warna baru wajib punya
  pasangan dark mode.
- Setiap penulisan yang di-scope backend per club mengirim `club_id: club?.id` dari store,
  bukan dari route param.

---

## 3. Urutan pengerjaan

```
Fase A  useSettings() hook ──┬─► Fase B Verifikasi halaman setting
                             ├─► Fase C Form freeze
                             ├─► Fase D Check-in
                             └─► Fase E Status & grace di layar member
                                        │
                                        └─► Fase F Akses cabang  ─► Fase G Override paket
```

Fase A wajib duluan. B, C, D, E boleh paralel. F menunggu Fase 6 backend.

---

## Fase A — Hook `useSettings()` bersama — **SELESAI**

- [x] [src/hooks/use-settings.ts](../src/hooks/use-settings.ts) — mengembalikan
      `{ settings, isLoading, isFetching, error, invalidateSettings }` dengan
      `staleTime` 5 menit
- [x] Kelima halaman setting dimigrasikan: `sales`, `taxes`, `loyaltyPoint`, `voucher`,
      `membership`
- [x] Import mati (`apiGetSettings`, `useQuery`) dibersihkan di semua file itu

Tiga halaman **Faktur** (`Order`, `Edit`, `Refund`) dan `loyalty-point` sengaja belum
dimigrasikan — semuanya memakai `settings` di dalam alur transaksi yang jauh lebih berisiko,
dan tidak ada keuntungan nyata selain keseragaman. Sisakan sampai ada alasan menyentuh file itu.

`staleTime` 5 menit dipilih karena setting hampir tidak pernah berubah di tengah sesi, dan
setiap halaman setting tetap memanggil `invalidateQueries` setelah menyimpan — jadi perubahan
tetap langsung terlihat.

**Status:** `typecheck` bersih untuk seluruh file yang disentuh, `eslint` bersih, `prettier`
sudah dijalankan.

---

## Fase B — Verifikasi halaman setting — **SELESAI**

Tidak ada kode baru; dijalankan lewat Chrome headless atas CDP (lihat skill `run-verify` di
`migios-be`).

- [x] Muat halaman → 21 input, 7 switch, 5 radio terisi **dari server**, bukan dari
      `INITIAL_SETTINGS` (dibuktikan dengan membandingkan nilai UI terhadap `GET /settings`)
- [x] Simpan → `Masa Tenggang 0 → 5` dan `Prefix MBR → TST` diubah di UI, ditekan Simpan, lalu
      dibaca ulang lewat API: **keduanya persisted**
- [x] Toggle "Terapkan ke Seluruh Cabang" muncul (club uji ber-`club_type = main`)
- [x] Preview kode member `MBR0000100001` cocok dengan format `generateMemberCode` hasil
      perbaikan `padStart`
- [x] Dark mode — tangkapan layar diambil pada tema gelap; seluruh card, radio bordered, dan
      blok preview terbaca

**Yang belum diuji di browser:** `membership_cross_club_access = "selected_clubs"` beserta
daftar cabangnya. Diverifikasi lewat API (`PATCH` menyimpan `[19, 20]`, `GET` mengembalikannya)
tapi belum dengan mengklik radio dan checkbox-nya.

**Kalau backend memilih enum Prisma** untuk `membership_cross_club_access` dan
`membership_activation_mode` (rekomendasi di plan backend), tipe di
[settings.ts](../src/services/api/@types/settings/settings.ts) sudah cocok — tidak perlu diubah.

---

## Fase C — Form freeze mematuhi kebijakan — **SELESAI**

Berpasangan dengan Fase 3 backend. Sebelumnya staff baru tahu kuota habis setelah transaksi
ditolak di kasir.

### Yang dikerjakan

- [x] `apiGetMemberFreezeQuota(code)` di [MembeService.ts](../src/services/api/MembeService.ts) +
      tipe `FreezeQuota` di [freeze.ts](../src/services/api/@types/freeze.ts) +
      `QUERY_KEY.freezeQuota`
- [x] Komponen bersama [FreezeQuotaInfo.tsx](../src/components/form/member/freeze/FreezeQuotaInfo.tsx)
      yang juga mengekspor hook `useFreezeQuota(memberCode)` — dipakai **kedua** form
- [x] Sisa kuota ditampilkan: hari terpakai + `Progress`, pengajuan terpakai, dan periode
      12 bulan yang dihitung, plus catatan bahwa freeze yang dibatalkan tidak dihitung
- [x] Validasi durasi **sebelum submit** terhadap `min_days` dan `max_days_per_request`
- [x] Tombol submit diblokir saat durasi salah, kuota pengajuan habis, atau sisa hari kurang
- [x] `extend_end_date = false` → peringatan bahwa masa berlaku paket **tidak** diperpanjang
- [x] `require_approval = false` → label tombol berubah jadi "Freeze Sekarang"
- [x] `freeze_enabled = 0` → tombol pemicu **disembunyikan** di
      [FreezProgram](../src/pages/members/detail/FreezProgram/index.tsx) dan
      [sales/Freeze](../src/pages/master/sales/Freeze/index.tsx), plus peringatan di dalam form
      bila form sempat terbuka

### Kenapa hook-nya diekspor dari komponen

`FreezeQuotaInfo` menampilkan kuota, tapi form juga butuh nilai kuota yang **sama** untuk
memblokir submit. Mengambilnya dua kali lewat `useQuery` dengan query key identik aman
(TanStack Query membaginya), dan itu menghindari prop drilling nilai kuota ke induk hanya
untuk dikirim balik ke anak.

### Perhitungan durasi disamakan dengan backend

`dayjs(end).diff(start, "day") + 1` — **inklusif**, sama seperti `freezeDurationInDays` dan
`calculateFreezeEndPackage` di backend. Kalau berbeda, angka yang divalidasi frontend tidak
akan cocok dengan yang menolak di backend, dan staff akan melihat pesan yang bertentangan.

### Kontrak diverifikasi

15 field response backend dibandingkan satu per satu dengan tipe `FreezeQuota` di frontend:
**cocok persis**, tidak ada field yang hanya ada di satu sisi.

**Status:** `typecheck` nol error di file yang disentuh, `eslint` bersih.

---

## Fase D — Check-in mematuhi kebijakan — **SELESAI**

Komponen baru
[src/pages/attendance/checkin/MemberCheckInStatus.tsx](../src/pages/attendance/checkin/MemberCheckInStatus.tsx),
disisipkan tepat di bawah pesan error scanner.

- [x] `checkin_today` / `checkin_max_per_day` — badge "Kunjungan hari ini", berubah
      `destructive` saat kuota tercapai, dan menampilkan "tanpa batas" saat `max = 0`
- [x] `warning: 'package_expired'` — peringatan bahwa paket sudah berakhir tapi check-in tetap
      dicatat sesuai pengaturan club, dengan ajakan menawarkan perpanjangan
- [x] Status `grace` — peringatan terpisah bahwa paket sedang dalam masa tenggang
- [x] `require_session_approval` — nol pekerjaan, sudah dipakai alur cutting session

### Type lie yang ikut diperbaiki

`CheckCode.membership_status` dideklarasikan `number`, padahal backend selalu mengirim
**string** (`'active' | 'grace' | 'freeze' | 'inactive'`). Selama tidak ada yang membacanya
kesalahan itu tidak terasa; begitu Fase 5 memperkenalkan status `grace`, tipe yang salah
membuat perbandingan `=== "grace"` mustahil ditulis. Sekarang bertipe `MembershipStatusLabel`.

Ditambahkan juga `checkin_today`, `checkin_max_per_day`, `warning`, dan
`membership_status_code` — semuanya opsional supaya response backend lama tetap terbaca.

### Kebersihan state

`member` kini di-`setMember(null)` saat submit baru **dan** saat check-code gagal. Tanpa itu
panel status akan menampilkan data member sebelumnya di layar kasir — persis jenis kesalahan
yang berbahaya di meja depan.

**Status:** `typecheck` nol error di file yang disentuh, `eslint` bersih.

### Badge check-out otomatis — **SELESAI**

Semula terhalang: tidak ada cara membedakan checkout buatan `closeHangingAttendance` dari
checkout manual. Backend kini punya kolom `attendances.source` (`manual | system`), jadi
[riwayat kehadiran](../src/pages/attendance/history/index.tsx) menampilkan badge **Otomatis**
di sebelah status.

Diverifikasi di browser dengan sesi menggantung sungguhan:

```
Joni · MBR2512120000001001 | 05 Januari 2026 03:24 | Dalam Gym | Check Out · Otomatis
Joni · MBR2512120000001001 | 04 Januari 2026 21:24 | Dalam Gym | Check In
```

Baris atas dibuat sistem 6 jam setelah check-in; tanpa badge, staff akan membacanya sebagai
"member keluar jam 03:24".

---

## Fase E — Status membership & grace period — **SELESAI**

- [x] `grace` dan `pending_activation` ditambahkan ke `statusColor` di
      [constants/utils.ts](../src/constants/utils.ts), **dengan varian dark mode** (peta lama
      belum punya — yang baru mengikuti pola `statusPaymentColor`)
- [x] Badge status member otomatis ikut karena ketiga pemakainya membaca peta yang sama:
      [members/index.tsx](../src/pages/members/index.tsx),
      [members/detail/index.tsx](../src/pages/members/detail/index.tsx),
      [dashboard/NewMember.tsx](../src/pages/dashboard/components/NewMember.tsx)
- [x] Helper bersama [formatPackageDate.ts](../src/utils/formatPackageDate.ts) —
      `formatPackageDate`, `isPendingActivation`, `PENDING_ACTIVATION_HINT`
- [x] [members/detail/Package.tsx](../src/pages/members/detail/Package.tsx) — kartu **dan**
      tabel: tanggal null tidak lagi "Invalid Date", badge jadi "Belum aktif" dengan
      keterangan *"Masa berlaku mulai saat check-in pertama"*
- [x] [DialogMultiSelectPackage.tsx](../src/pages/attendance/checkin/DialogMultiSelectPackage.tsx)
      ikut memakai helper

### Backend yang harus ikut ditutup

Warna `grace` semula **tidak bisa muncul di mana pun**: `member.service.ts` belum mengalirkan
`membership_grace_period_days`, gap yang dicatat di Fase 5 backend. Ditutup di pekerjaan ini:

- `findAll` membaca setting dan memakai `membershipStatusLabelWithGrace({ graceDays })`
- `findOne` kini menerima `@GetUser()` agar tahu club-nya; `graceDays` jatuh ke `0` bila
  pemanggil tidak punya club

Ini contoh langsung dari prinsip di bagian 2: warna tanpa jalur data adalah setengah fitur.

### Keputusan tampilan

Awalnya kolom tanggal ikut menampilkan "Belum aktif", sehingga satu baris tabel berbunyi
`Belum Aktif | Yearly | 1 Month | 0 | Belum Aktif | Belum Aktif`. Berisik. Sekarang tanggal
kosong tampil `—` dan **badge** yang membawa artinya.

Label dibiarkan berbahasa Inggris (`Active`, `Grace`, `Freeze`) agar konsisten dengan badge
yang sudah ada; menerjemahkan semuanya adalah perubahan copy tersendiri.

### Verifikasi di browser

| Cek | Hasil |
|---|---|
| Paket `start_date` NULL di tabel | `Belum Aktif ǀ Yearly ǀ 1 Month ǀ 0 ǀ — ǀ —` |
| "Invalid Date" | **hilang** |
| Daftar member dengan `grace = 3` hari | badge **`Grace`** muncul |
| Kelas badge | `bg-amber-100 dark:bg-amber-100/30 text-amber-700 dark:text-amber-300 border-amber-300` |

Data uji (2 paket) dihapus dan setting dipulihkan; tabel kembali ke 10 member, 33 paket,
32 attendance, 2 freeze.

---

## Fase F — Akses antar cabang — **SELESAI**

- [x] Kartu member di check-in menampilkan badge cabang asal saat `is_cross_club`, dengan
      keterangan *"kehadiran dicatat di cabang ini"* —
      [MemberCheckInStatus.tsx](../src/pages/attendance/checkin/MemberCheckInStatus.tsx)
- [x] [Riwayat kehadiran](../src/pages/attendance/history/index.tsx) menandai baris tamu antar
      cabang dengan badge cabang asal di bawah kode member
- [x] Tipe `CheckCode` dan `MemberAttendanceLogType` menerima `home_club_name`,
      `home_club_id`, `is_cross_club` — semuanya opsional

### Backend yang ikut dikerjakan

Kedua layar butuh data yang belum dikirim, jadi backend ditambah:

- `checkCode` — join ke `clubs` sebagai `home_club`, mengembalikan `home_club_name` dan
  `is_cross_club` (`member.club_id !== club_id`)
- `findAllMemberAttendenceLog` — join yang sama, mengembalikan `home_club_id`,
  `home_club_name`, `is_cross_club` sebagai `customQueryAttr` sehingga ketiganya juga bisa
  dipakai untuk **filter dan sort** lewat `customKyselyQuery`

Filter cabang tidak dibuatkan kontrol UI tersendiri: kolomnya sudah bisa difilter lewat
mekanisme pencarian tabel yang ada, dan menambah dropdown cabang hanya berguna untuk gym yang
benar-benar memakai `all_clubs`. Ditinggalkan sampai ada yang memintanya.

### Verifikasi di browser

Dengan `membership_cross_club_access = all_clubs` dan member "Ratna" milik **X Gym** (club 19)
check-in di **Gym Cab. Surabaya** (club 1):

| Layar | Hasil |
|---|---|
| Riwayat kehadiran | `Ratna ǀ MBR2512130000019001 ǀ **Member X Gym**` — Joni (cabang sama) tanpa badge |
| Kartu check-in | `Member X Gym · kehadiran dicatat di cabang ini · Kunjungan hari ini 1 · tanpa batas` |
| `attendances.club_id` | 1 (cabang dikunjungi), `home_club_id` 19 |

Data uji dihapus dan setting dikembalikan ke `own_club`; tabel kembali ke 10 member, 33 paket,
32 attendance, 2 freeze.

---

## Fase G — (Opsional) override akses per paket

Hanya bila DECISION GATE di plan backend memilih Opsi B.

- [ ] Tambahkan field `cross_club_access` di
      [src/components/form/package/FormMembership.tsx](../src/components/form/package/FormMembership.tsx)
      dengan opsi keempat "Ikuti pengaturan club" (`null`) sebagai default
- [ ] Perbarui `packageValidation` terkait
- [ ] Di halaman setting keanggotaan, ubah label card jadi
      **"Akses Antar Cabang (Default)"** dan tambahkan keterangan bahwa paket bisa menimpanya

---

## 4. Checklist per fase

Untuk **setiap** fase:

1. `npm run typecheck` bersih — `strict` + `noUnusedLocals` + `noUnusedParameters` aktif,
   variabel tak terpakai adalah error build
2. `npm run lint` bersih — pelanggaran Prettier muncul di sini
3. `npm run prettier:fix` dijalankan; **jangan** merapikan format atau urutan import manual
4. Halaman baru? Pastikan file route, spread di `protectedRoute.ts`, dan entri navigasi ketiganya ada
5. Warna atau spacing baru? Cek [DESIGN.md](../DESIGN.md) dan verifikasi dark mode
6. Diff dibaca ulang, seluruh komentar yang ditulis dihapus
7. Berhenti — jangan commit, push, atau bikin branch

---

## 5. Ringkasan

| Fase | Isi | Berat | Blocker | Status |
|---|---|---|---|---|
| A | `useSettings()` + migrasi 5 halaman | Ringan | — | **Selesai** |
| B | Verifikasi halaman setting | Ringan | BE Fase 1 | **Selesai** |
| C | Form freeze | Sedang | A, BE Fase 3 | **Selesai** |
| D | Check-in | Sedang | A, BE Fase 4 | **Selesai** |
| E | Status & grace | Sedang | A, BE Fase 5 | **Selesai** |
| F | Akses antar cabang | Sedang | BE Fase 6 | **Selesai** |
| G | Override paket | Ringan | F + keputusan | **Menunggu DECISION GATE** |

Seluruh backend (Fase 0-7) dan frontend **A sampai F** sudah selesai dan **terverifikasi di
browser sungguhan** — lihat skill `run-verify` di `migios-be` untuk caranya.

Tersisa hanya **Fase G**, yang hanya dikerjakan bila DECISION GATE berpindah ke Opsi B
(akses cabang di level paket). Sampai keputusan itu diambil, tidak ada yang perlu dikerjakan.

Fase yang paling berisiko luput adalah **E** — grace period dan aktivasi tertunda menyentuh
banyak tempat yang memformat tanggal paket, dan gejalanya (`Invalid Date`, badge salah warna)
baru terlihat di layar, bukan di typecheck.
