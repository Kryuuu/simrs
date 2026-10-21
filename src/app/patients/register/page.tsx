import { Metadata } from "next";
import { PatientRegistrationWizard } from "@/components/patients/patient-registration-wizard";

export const metadata: Metadata = {
  title: "Pendaftaran Pasien Baru | SIMRS Modern",
  description: "Formulir lengkap pendaftaran dan admisi pasien baru rumah sakit.",
};

export default function PatientRegistrationPage() {
  return (
    <div className="space-y-6">
      <PatientRegistrationWizard isPublicKiosk={false} />
    </div>
  );
}
