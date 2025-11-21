import { MemberDetail } from "@/services/api/@types/member"

interface MesurementProps {
  member: MemberDetail | null
}
const Mesurement: React.FC<MesurementProps> = ({ member }) => {
  return <div>Mesurement</div>
}

export default Mesurement
