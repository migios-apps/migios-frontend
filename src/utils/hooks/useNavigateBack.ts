import { useNavigate } from "react-router-dom"

export const useNavigateBack = () => {
  const navigate = useNavigate()

  const handleNavigateBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1) // Kembali jika ada riwayat
    } else {
      navigate("/") // Fallback ke halaman tertentu
    }
  }

  return handleNavigateBack
}
