import { useState } from "react"
import {
  Call,
  Clock,
  DirectRight,
  Edit,
  Location,
  Map1,
  SearchNormal1,
  Sms,
  Star1,
} from "iconsax-reactjs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import LayoutGymSetting from "./Layout"

type GymBranch = {
  id: string
  name: string
  address: string
  phone: string
  email: string
  coordinates: {
    lat: number
    lng: number
  }
  operatingHours: {
    weekdays: string
    weekend: string
  }
  facilities: string[]
  rating: number
  totalMembers: number
  isMainBranch: boolean
  image: string
  status: "active" | "maintenance" | "coming_soon"
}

const GYM_BRANCHES: GymBranch[] = [
  {
    id: "1",
    name: "FitZone Premium - Jakarta Pusat",
    address: "Jl. Sudirman No. 123, Jakarta Pusat 10220",
    phone: "+62 21 1234 5678",
    email: "jakpus@fitzone.com",
    coordinates: { lat: -6.2088, lng: 106.8456 },
    operatingHours: {
      weekdays: "05:00 - 23:00",
      weekend: "06:00 - 22:00",
    },
    facilities: [
      "Cardio Zone",
      "Weight Training",
      "Swimming Pool",
      "Sauna",
      "Personal Training",
      "Group Classes",
    ],
    rating: 4.8,
    totalMembers: 1200,
    isMainBranch: true,
    image: "/img/gym-branch-1.jpg",
    status: "active",
  },
  {
    id: "2",
    name: "FitZone Premium - Jakarta Selatan",
    address: "Jl. Senopati No. 45, Jakarta Selatan 12190",
    phone: "+62 21 2345 6789",
    email: "jaksel@fitzone.com",
    coordinates: { lat: -6.2297, lng: 106.8175 },
    operatingHours: {
      weekdays: "05:00 - 23:00",
      weekend: "06:00 - 22:00",
    },
    facilities: [
      "Cardio Zone",
      "Weight Training",
      "Yoga Studio",
      "Personal Training",
      "Group Classes",
      "Cafe",
    ],
    rating: 4.7,
    totalMembers: 950,
    isMainBranch: false,
    image: "/img/gym-branch-2.jpg",
    status: "active",
  },
  {
    id: "3",
    name: "FitZone Premium - Tangerang",
    address: "Jl. BSD Raya No. 88, Tangerang Selatan 15345",
    phone: "+62 21 3456 7890",
    email: "tangerang@fitzone.com",
    coordinates: { lat: -6.3018, lng: 106.6519 },
    operatingHours: {
      weekdays: "05:00 - 23:00",
      weekend: "06:00 - 22:00",
    },
    facilities: [
      "Cardio Zone",
      "Weight Training",
      "Swimming Pool",
      "Kids Zone",
      "Personal Training",
    ],
    rating: 4.6,
    totalMembers: 800,
    isMainBranch: false,
    image: "/img/gym-branch-3.jpg",
    status: "active",
  },
  {
    id: "4",
    name: "FitZone Premium - Bekasi",
    address: "Jl. Ahmad Yani No. 67, Bekasi 17141",
    phone: "+62 21 4567 8901",
    email: "bekasi@fitzone.com",
    coordinates: { lat: -6.2383, lng: 106.9756 },
    operatingHours: {
      weekdays: "05:00 - 23:00",
      weekend: "06:00 - 22:00",
    },
    facilities: ["Cardio Zone", "Weight Training", "Group Classes"],
    rating: 4.5,
    totalMembers: 650,
    isMainBranch: false,
    image: "/img/gym-branch-4.jpg",
    status: "maintenance",
  },
  {
    id: "5",
    name: "FitZone Premium - Depok",
    address: "Jl. Margonda Raya No. 234, Depok 16424",
    phone: "+62 21 5678 9012",
    email: "depok@fitzone.com",
    coordinates: { lat: -6.4025, lng: 106.7942 },
    operatingHours: {
      weekdays: "05:00 - 23:00",
      weekend: "06:00 - 22:00",
    },
    facilities: [
      "Cardio Zone",
      "Weight Training",
      "Swimming Pool",
      "Sauna",
      "Personal Training",
    ],
    rating: 0,
    totalMembers: 0,
    isMainBranch: false,
    image: "/img/gym-branch-5.jpg",
    status: "coming_soon",
  },
]

const GymLocation = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBranch, setSelectedBranch] = useState<GymBranch | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [branches, setBranches] = useState<GymBranch[]>(GYM_BRANCHES)

  const filteredBranches = branches.filter(
    (branch) =>
      branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: GymBranch["status"]) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Beroperasi</Badge>
      case "maintenance":
        return <Badge variant="secondary">Maintenance</Badge>
      case "coming_soon":
        return <Badge variant="outline">Segera Hadir</Badge>
      default:
        return null
    }
  }

  return (
    <LayoutGymSetting>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Lokasi Gym
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Kelola informasi lokasi dan cabang gym
            </p>
          </div>
          <div className="flex gap-3">
            <Button size="sm" onClick={() => setIsEditing(!isEditing)}>
              <Edit className="mr-2 size-4" />
              {isEditing ? "Selesai Edit" : "Edit Lokasi"}
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <SearchNormal1 className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                placeholder="Cari cabang berdasarkan nama atau alamat..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedBranch(null)}
              >
                <Map1 className="mr-2 size-4" />
                Lihat Peta
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Map View */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map1 size={20} className="text-primary" />
              Peta Lokasi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <Map1 size={48} className="mx-auto mb-2" />
                <p className="text-sm">
                  Peta interaktif akan ditampilkan di sini
                </p>
                <p className="mt-1 text-xs">
                  Integrasi dengan Google Maps atau Mapbox
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Branch Statistics */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="text-center">
              <div className="text-primary text-2xl font-bold">
                {branches.length}
              </div>
              <div className="text-muted-foreground text-sm">Total Cabang</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {branches.filter((b) => b.status === "active").length}
              </div>
              <div className="text-muted-foreground text-sm">Beroperasi</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {branches
                  .filter((b) => b.status === "active")
                  .reduce((sum, b) => sum + b.totalMembers, 0)
                  .toLocaleString()}
              </div>
              <div className="text-muted-foreground text-sm">Total Member</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {(
                  branches
                    .filter((b) => b.status === "active")
                    .reduce((sum, b) => sum + b.rating, 0) /
                  branches.filter((b) => b.status === "active").length
                ).toFixed(1)}
              </div>
              <div className="text-muted-foreground text-sm">
                Rata-rata Rating
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Branch List */}
        <Card>
          <CardHeader>
            <div className="flex w-full items-center justify-between">
              <CardTitle>Daftar Cabang</CardTitle>
              <Badge variant="secondary">
                {filteredBranches.length} cabang
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {filteredBranches.map((branch) => (
                <Card
                  key={branch.id}
                  className="transition-shadow hover:shadow-lg"
                >
                  <CardContent className="p-0">
                    {/* Branch Image */}
                    <div className="relative h-48 overflow-hidden rounded-t-lg bg-gray-200 dark:bg-gray-700">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute top-3 left-3 flex gap-2">
                        {branch.isMainBranch && (
                          <Badge variant="default">Pusat</Badge>
                        )}
                        {getStatusBadge(branch.status)}
                      </div>
                      <div className="absolute bottom-3 left-3 text-white">
                        <h4 className="text-lg font-bold">{branch.name}</h4>
                      </div>
                    </div>

                    {/* Branch Info */}
                    <div className="space-y-4 p-4">
                      {/* Address */}
                      <div className="flex items-start gap-2">
                        <Location size={16} className="mt-1 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {branch.address}
                          </p>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex items-center gap-2">
                          <Call size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {branch.phone}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Sms size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {branch.email}
                          </span>
                        </div>
                      </div>

                      {/* Operating Hours */}
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-gray-400" />
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <div>Sen-Jum: {branch.operatingHours.weekdays}</div>
                          <div>Sab-Min: {branch.operatingHours.weekend}</div>
                        </div>
                      </div>

                      {/* Stats */}
                      {branch.status === "active" && (
                        <div className="flex items-center justify-between border-t border-gray-200 pt-2 dark:border-gray-700">
                          <div className="flex items-center gap-1">
                            <Star1
                              size={14}
                              className="text-yellow-500"
                              variant="Bold"
                            />
                            <span className="text-sm font-medium">
                              {branch.rating}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {branch.totalMembers.toLocaleString()} member
                          </div>
                        </div>
                      )}

                      {/* Facilities */}
                      <div>
                        <p className="mb-2 text-xs text-gray-500">Fasilitas:</p>
                        <div className="flex flex-wrap gap-1">
                          {branch.facilities.slice(0, 3).map((facility) => (
                            <Badge
                              key={facility}
                              variant="secondary"
                              className="text-xs"
                            >
                              {facility}
                            </Badge>
                          ))}
                          {branch.facilities.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{branch.facilities.length - 3} lainnya
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <DirectRight className="mr-2 size-4" />
                          Petunjuk Arah
                        </Button>
                        {isEditing && (
                          <Button
                            size="sm"
                            onClick={() => setSelectedBranch(branch)}
                          >
                            <Edit className="mr-2 size-4" />
                            Edit
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredBranches.length === 0 && (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                <Location size={48} className="mx-auto mb-2" />
                <p>Tidak ada cabang yang ditemukan</p>
                <p className="mt-1 text-sm">
                  Coba ubah kata kunci pencarian Anda
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add New Branch (when editing) */}
        {isEditing && (
          <Card>
            <CardContent className="py-8 text-center">
              <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                <Location size={24} className="text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Tambah Cabang Baru</h3>
              <p className="text-muted-foreground mb-4">
                Buat cabang gym baru dengan informasi lengkap
              </p>
              <Button size="sm">Tambah Cabang</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </LayoutGymSetting>
  )
}

export default GymLocation
