"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  UserProfile,
  HospitalSettings,
  Patient,
  QueueTicket,
  Registration,
  Bed,
  Room,
  InpatientAdmission,
  DoctorSchedule,
  MedicationItem,
  Prescription,
  LabOrder,
  RadiologyOrder,
  Invoice,
  ClinicalNote,
  EmergencyEncounter,
  AuditLog,
  NotificationItem,
  UserRole,
} from "@/types";
import {
  INITIAL_HOSPITAL_SETTINGS,
  INITIAL_USERS,
  INITIAL_PATIENTS,
  INITIAL_QUEUES,
  INITIAL_REGISTRATIONS,
  INITIAL_ROOMS,
  INITIAL_BEDS,
  INITIAL_ADMISSIONS,
  INITIAL_DOCTOR_SCHEDULES,
  INITIAL_MEDICATIONS,
  INITIAL_PRESCRIPTIONS,
  INITIAL_LAB_ORDERS,
  INITIAL_RADIOLOGY_ORDERS,
  INITIAL_INVOICES,
  INITIAL_CLINICAL_NOTES,
  INITIAL_EMERGENCY_ENCOUNTERS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
} from "./demo-data";
import { isSupabaseConfigured } from "./supabase/client";

interface DemoStoreContextType {
  isDemoMode: boolean;
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  switchRole: (role: UserRole) => void;
  hospitalSettings: HospitalSettings;
  updateHospitalSettings: (settings: Partial<HospitalSettings>) => void;
  patients: Patient[];
  addPatient: (patient: Omit<Patient, "id" | "mrn" | "created_at" | "updated_at">) => Patient;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  queues: QueueTicket[];
  addQueue: (queue: Omit<QueueTicket, "id" | "created_at">) => QueueTicket;
  updateQueueStatus: (id: string, status: QueueTicket["status"]) => void;
  registrations: Registration[];
  addRegistration: (reg: Omit<Registration, "id" | "registration_number" | "created_at">) => Registration;
  rooms: Room[];
  beds: Bed[];
  updateBedStatus: (bedId: string, status: Bed["status"], patient?: { id: string; name: string; mrn: string }) => void;
  admissions: InpatientAdmission[];
  admitPatient: (admission: Omit<InpatientAdmission, "id" | "admit_date">) => InpatientAdmission;
  dischargePatient: (admissionId: string) => void;
  transferBed: (admissionId: string, newBedId: string, newRoomId: string, newRoomName: string, newBedNumber: string) => void;
  doctorSchedules: DoctorSchedule[];
  addDoctorSchedule: (schedule: Omit<DoctorSchedule, "id" | "current_booked">) => void;
  medications: MedicationItem[];
  addMedicationStock: (medicationId: string, batchNumber: string, expiryDate: string, quantity: number, buyPrice: number, sellPrice: number) => void;
  prescriptions: Prescription[];
  addPrescription: (prescription: Omit<Prescription, "id" | "prescription_number" | "created_at">) => Prescription;
  verifyPrescription: (id: string, pharmacistNotes: string) => void;
  dispensePrescription: (id: string) => void;
  labOrders: LabOrder[];
  addLabOrder: (order: Omit<LabOrder, "id" | "order_number" | "created_at">) => LabOrder;
  updateLabResult: (orderId: string, itemId: string, value: string, interpretation: "NORMAL" | "RENDAH" | "TINGGI" | "KRITIS") => void;
  validateLabOrder: (orderId: string) => void;
  radiologyOrders: RadiologyOrder[];
  addRadiologyOrder: (order: Omit<RadiologyOrder, "id" | "order_number" | "created_at">) => RadiologyOrder;
  completeRadiologyReport: (orderId: string, report: string, conclusion: string) => void;
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, "id" | "invoice_number" | "created_at" | "remaining_amount">) => Invoice;
  payInvoice: (invoiceId: string, amount: number, method: Invoice["payments"][0]["payment_method"], ref?: string) => void;
  clinicalNotes: ClinicalNote[];
  saveClinicalNote: (note: Omit<ClinicalNote, "id" | "created_at" | "updated_at">) => ClinicalNote;
  emergencyEncounters: EmergencyEncounter[];
  addEmergencyEncounter: (encounter: Omit<EmergencyEncounter, "id" | "arrival_time">) => EmergencyEncounter;
  auditLogs: AuditLog[];
  recordAudit: (action: string, resource: string, resourceId: string, details: string) => void;
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  resetToInitialDemoData: () => void;
}

const DemoStoreContext = createContext<DemoStoreContextType | null>(null);

export function DemoStoreProvider({ children }: { children: React.ReactNode }) {
  const [isDemoMode] = useState(!isSupabaseConfigured);
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]); // default Super Admin
  const [hospitalSettings, setHospitalSettings] = useState<HospitalSettings>(INITIAL_HOSPITAL_SETTINGS);
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [queues, setQueues] = useState<QueueTicket[]>(INITIAL_QUEUES);
  const [registrations, setRegistrations] = useState<Registration[]>(INITIAL_REGISTRATIONS);
  const [rooms] = useState<Room[]>(INITIAL_ROOMS);
  const [beds, setBeds] = useState<Bed[]>(INITIAL_BEDS);
  const [admissions, setAdmissions] = useState<InpatientAdmission[]>(INITIAL_ADMISSIONS);
  const [doctorSchedules, setDoctorSchedules] = useState<DoctorSchedule[]>(INITIAL_DOCTOR_SCHEDULES);
  const [medications, setMedications] = useState<MedicationItem[]>(INITIAL_MEDICATIONS);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(INITIAL_PRESCRIPTIONS);
  const [labOrders, setLabOrders] = useState<LabOrder[]>(INITIAL_LAB_ORDERS);
  const [radiologyOrders, setRadiologyOrders] = useState<RadiologyOrder[]>(INITIAL_RADIOLOGY_ORDERS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [clinicalNotes, setClinicalNotes] = useState<ClinicalNote[]>(INITIAL_CLINICAL_NOTES);
  const [emergencyEncounters, setEmergencyEncounters] = useState<EmergencyEncounter[]>(INITIAL_EMERGENCY_ENCOUNTERS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Load from LocalStorage if available
  useEffect(() => {
    try {
      const savedPatients = localStorage.getItem("simrs_patients");
      if (savedPatients) setPatients(JSON.parse(savedPatients));

      const savedQueues = localStorage.getItem("simrs_queues");
      if (savedQueues) setQueues(JSON.parse(savedQueues));

      const savedBeds = localStorage.getItem("simrs_beds");
      if (savedBeds) setBeds(JSON.parse(savedBeds));

      const savedPrescriptions = localStorage.getItem("simrs_prescriptions");
      if (savedPrescriptions) setPrescriptions(JSON.parse(savedPrescriptions));

      const savedInvoices = localStorage.getItem("simrs_invoices");
      if (savedInvoices) setInvoices(JSON.parse(savedInvoices));

      const savedNotes = localStorage.getItem("simrs_notes");
      if (savedNotes) setClinicalNotes(JSON.parse(savedNotes));
    } catch {
      // ignore
    }
  }, []);

  const recordAudit = (action: string, resource: string, resourceId: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      user_id: currentUser.id,
      user_name: currentUser.full_name,
      user_role: currentUser.role,
      action,
      resource,
      resource_id: resourceId,
      details,
      created_at: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const switchRole = (role: UserRole) => {
    const matched = INITIAL_USERS.find((u) => u.role === role) || {
      id: `user-${role}`,
      email: `${role}@simrs.local`,
      full_name: `Pengguna ${role}`,
      role: role,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    setCurrentUser(matched);
    recordAudit("ROLE_SWITCH", "auth", matched.id, `Beralih peran menjadi: ${role}`);
  };

  const updateHospitalSettings = (settings: Partial<HospitalSettings>) => {
    setHospitalSettings((prev) => {
      const updated = { ...prev, ...settings };
      return updated;
    });
    recordAudit("UPDATE_SETTINGS", "hospital_settings", hospitalSettings.id, "Memperbarui profil rumah sakit");
  };

  const addPatient = (data: Omit<Patient, "id" | "mrn" | "created_at" | "updated_at">): Patient => {
    const nextNumber = patients.length + 1;
    const padded = String(nextNumber).padStart(6, "0");
    const mrn = `${padded.slice(0, 2)}-${padded.slice(2, 4)}-${padded.slice(4, 6)}`;
    const newPatient: Patient = {
      ...data,
      id: `pat-${Date.now()}`,
      mrn,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setPatients((prev) => {
      const updated = [newPatient, ...prev];
      localStorage.setItem("simrs_patients", JSON.stringify(updated));
      return updated;
    });
    recordAudit("CREATE_PATIENT", "patients", newPatient.id, `Mendaftarkan pasien baru ${newPatient.full_name} (${mrn})`);
    return newPatient;
  };

  const updatePatient = (id: string, updates: Partial<Patient>) => {
    setPatients((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p));
      localStorage.setItem("simrs_patients", JSON.stringify(updated));
      return updated;
    });
    recordAudit("UPDATE_PATIENT", "patients", id, `Memperbarui data identitas pasien ID: ${id}`);
  };

  const addQueue = (queue: Omit<QueueTicket, "id" | "created_at">): QueueTicket => {
    const newQueue: QueueTicket = {
      ...queue,
      id: `q-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setQueues((prev) => {
      const updated = [newQueue, ...prev];
      localStorage.setItem("simrs_queues", JSON.stringify(updated));
      return updated;
    });
    recordAudit("CREATE_QUEUE", "queue_tickets", newQueue.id, `Menerbitkan antrean ${newQueue.ticket_number} untuk ${newQueue.patient_name}`);
    return newQueue;
  };

  const updateQueueStatus = (id: string, status: QueueTicket["status"]) => {
    setQueues((prev) => {
      const updated = prev.map((q) => {
        if (q.id === id) {
          const now = new Date().toISOString();
          return {
            ...q,
            status,
            called_at: status === "dipanggil" ? now : q.called_at,
            served_at: status === "dilayani" ? now : q.served_at,
            completed_at: status === "selesai" ? now : q.completed_at,
          };
        }
        return q;
      });
      localStorage.setItem("simrs_queues", JSON.stringify(updated));
      return updated;
    });
    recordAudit("UPDATE_QUEUE_STATUS", "queue_tickets", id, `Mengubah status antrean ${id} menjadi: ${status}`);
  };

  const addRegistration = (reg: Omit<Registration, "id" | "registration_number" | "created_at">): Registration => {
    const regNumber = `REG-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(registrations.length + 1).padStart(3, "0")}`;
    const newReg: Registration = {
      ...reg,
      id: `reg-${Date.now()}`,
      registration_number: regNumber,
      created_at: new Date().toISOString(),
    };
    setRegistrations((prev) => [newReg, ...prev]);
    recordAudit("CREATE_REGISTRATION", "registrations", newReg.id, `Registrasi kunjungan ${regNumber} pasien ${newReg.patient_name}`);
    return newReg;
  };

  const updateBedStatus = (bedId: string, status: Bed["status"], patient?: { id: string; name: string; mrn: string }) => {
    setBeds((prev) => {
      const updated = prev.map((b) => {
        if (b.id === bedId) {
          return {
            ...b,
            status,
            patient_id: patient ? patient.id : status === "TERSEDIA" ? undefined : b.patient_id,
            patient_name: patient ? patient.name : status === "TERSEDIA" ? undefined : b.patient_name,
            patient_mrn: patient ? patient.mrn : status === "TERSEDIA" ? undefined : b.patient_mrn,
          };
        }
        return b;
      });
      localStorage.setItem("simrs_beds", JSON.stringify(updated));
      return updated;
    });
    recordAudit("UPDATE_BED", "beds", bedId, `Status tempat tidur diperbarui: ${status}`);
  };

  const admitPatient = (admission: Omit<InpatientAdmission, "id" | "admit_date">): InpatientAdmission => {
    const newAdmission: InpatientAdmission = {
      ...admission,
      id: `adm-${Date.now()}`,
      admit_date: new Date().toISOString(),
    };
    setAdmissions((prev) => [newAdmission, ...prev]);
    updateBedStatus(admission.bed_id, "TERISI", {
      id: admission.patient_id,
      name: admission.patient_name,
      mrn: admission.patient_mrn,
    });
    recordAudit("ADMIT_PATIENT", "inpatient_admissions", newAdmission.id, `Pasien ${newAdmission.patient_name} masuk ke ${newAdmission.room_name} (${newAdmission.bed_number})`);
    return newAdmission;
  };

  const dischargePatient = (admissionId: string) => {
    const adm = admissions.find((a) => a.id === admissionId);
    if (!adm) return;

    setAdmissions((prev) =>
      prev.map((a) =>
        a.id === admissionId ? { ...a, status: "pulang_sembuh", discharge_date: new Date().toISOString() } : a
      )
    );
    updateBedStatus(adm.bed_id, "DIBERSIHKAN");
    recordAudit("DISCHARGE_PATIENT", "inpatient_admissions", admissionId, `Pasien ${adm.patient_name} dipulangkan dari rawat inap.`);
  };

  const transferBed = (admissionId: string, newBedId: string, newRoomId: string, newRoomName: string, newBedNumber: string) => {
    const adm = admissions.find((a) => a.id === admissionId);
    if (!adm) return;

    // Release old bed
    updateBedStatus(adm.bed_id, "DIBERSIHKAN");

    // Occupy new bed
    updateBedStatus(newBedId, "TERISI", {
      id: adm.patient_id,
      name: adm.patient_name,
      mrn: adm.patient_mrn,
    });

    // Update admission record
    setAdmissions((prev) =>
      prev.map((a) =>
        a.id === admissionId
          ? { ...a, bed_id: newBedId, room_id: newRoomId, room_name: newRoomName, bed_number: newBedNumber }
          : a
      )
    );
    recordAudit("TRANSFER_BED", "inpatient_admissions", admissionId, `Mutasi tempat tidur pasien ${adm.patient_name} ke ${newRoomName} - ${newBedNumber}`);
  };

  const addDoctorSchedule = (schedule: Omit<DoctorSchedule, "id" | "current_booked">) => {
    const newSch: DoctorSchedule = {
      ...schedule,
      id: `sch-${Date.now()}`,
      current_booked: 0,
    };
    setDoctorSchedules((prev) => [...prev, newSch]);
    recordAudit("ADD_SCHEDULE", "doctor_schedules", newSch.id, `Jadwal baru dokter ${newSch.doctor_name} pada ${newSch.day_of_week}`);
  };

  const addMedicationStock = (medicationId: string, batchNumber: string, expiryDate: string, quantity: number, buyPrice: number, sellPrice: number) => {
    setMedications((prev) =>
      prev.map((med) => {
        if (med.id === medicationId) {
          const newBatch = {
            id: `batch-${Date.now()}`,
            medication_id: medicationId,
            batch_number: batchNumber,
            lot_number: `LOT-${Math.floor(Math.random() * 900 + 100)}`,
            expiry_date: expiryDate,
            stock_quantity: quantity,
            buy_price: buyPrice,
            sell_price: sellPrice,
            received_date: new Date().toISOString().slice(0, 10),
          };
          return {
            ...med,
            total_stock: med.total_stock + quantity,
            batches: [...med.batches, newBatch],
          };
        }
        return med;
      })
    );
    recordAudit("STOCK_MUTATION", "medication_batches", medicationId, `Penerimaan stok obat ${quantity} unit batch ${batchNumber}`);
  };

  const addPrescription = (prescription: Omit<Prescription, "id" | "prescription_number" | "created_at">): Prescription => {
    const num = `RX-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(prescriptions.length + 1).padStart(3, "0")}`;
    const newRx: Prescription = {
      ...prescription,
      id: `rx-${Date.now()}`,
      prescription_number: num,
      created_at: new Date().toISOString(),
    };
    setPrescriptions((prev) => {
      const updated = [newRx, ...prev];
      localStorage.setItem("simrs_prescriptions", JSON.stringify(updated));
      return updated;
    });
    recordAudit("CREATE_PRESCRIPTION", "prescriptions", newRx.id, `Dokter ${newRx.doctor_name} menerbitkan resep ${num} untuk ${newRx.patient_name}`);
    return newRx;
  };

  const verifyPrescription = (id: string, pharmacistNotes: string) => {
    setPrescriptions((prev) => {
      const updated = prev.map((rx) =>
        rx.id === id
          ? {
              ...rx,
              status: "terverifikasi" as const,
              pharmacist_notes: pharmacistNotes,
              verified_by: currentUser.full_name,
              verified_at: new Date().toISOString(),
            }
          : rx
      );
      localStorage.setItem("simrs_prescriptions", JSON.stringify(updated));
      return updated;
    });
    recordAudit("VERIFY_PRESCRIPTION", "prescriptions", id, `Apoteker memverifikasi resep ${id}`);
  };

  const dispensePrescription = (id: string) => {
    // Atomic FEFO batch deduction
    const rx = prescriptions.find((r) => r.id === id);
    if (!rx) return;

    // Deduct stock per item
    setMedications((prev) => {
      return prev.map((med) => {
        const itemInRx = rx.items.find((item) => item.medication_id === med.id);
        if (!itemInRx) return med;

        let needed = itemInRx.quantity;
        // Sort batches FEFO (earliest expiry first)
        const sortedBatches = [...med.batches].sort((a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime());

        const updatedBatches = sortedBatches.map((b) => {
          if (needed <= 0) return b;
          const take = Math.min(b.stock_quantity, needed);
          needed -= take;
          return { ...b, stock_quantity: b.stock_quantity - take };
        });

        const newTotal = updatedBatches.reduce((acc, b) => acc + b.stock_quantity, 0);
        return {
          ...med,
          total_stock: newTotal,
          batches: updatedBatches,
        };
      });
    });

    setPrescriptions((prev) => {
      const updated = prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "selesai" as const,
              dispensed_by: currentUser.full_name,
              dispensed_at: new Date().toISOString(),
              items: r.items.map((it) => ({ ...it, dispensed_status: "diserahkan" as const })),
            }
          : r
      );
      localStorage.setItem("simrs_prescriptions", JSON.stringify(updated));
      return updated;
    });

    recordAudit("DISPENSE_PRESCRIPTION", "prescriptions", id, `Penyerahan obat resep ${rx.prescription_number} kepada pasien`);
  };

  const addLabOrder = (order: Omit<LabOrder, "id" | "order_number" | "created_at">): LabOrder => {
    const num = `LAB-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(labOrders.length + 1).padStart(3, "0")}`;
    const newOrder: LabOrder = {
      ...order,
      id: `lab-${Date.now()}`,
      order_number: num,
      created_at: new Date().toISOString(),
    };
    setLabOrders((prev) => [newOrder, ...prev]);
    recordAudit("CREATE_LAB_ORDER", "lab_orders", newOrder.id, `Permintaan laboratorium ${num} untuk ${newOrder.patient_name}`);
    return newOrder;
  };

  const updateLabResult = (orderId: string, itemId: string, value: string, interpretation: "NORMAL" | "RENDAH" | "TINGGI" | "KRITIS") => {
    setLabOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            status: "menunggu_validasi",
            items: order.items.map((it) =>
              it.id === itemId
                ? { ...it, result_value: value, interpretation, verified_at: new Date().toISOString() }
                : it
            ),
          };
        }
        return order;
      })
    );
  };

  const validateLabOrder = (orderId: string) => {
    setLabOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: "selesai",
              validator_id: currentUser.id,
              validator_name: currentUser.full_name,
            }
          : order
      )
    );
    recordAudit("VALIDATE_LAB", "lab_orders", orderId, `Validasi hasil laboratorium ${orderId} oleh ${currentUser.full_name}`);
  };

  const addRadiologyOrder = (order: Omit<RadiologyOrder, "id" | "order_number" | "created_at">): RadiologyOrder => {
    const num = `RAD-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(radiologyOrders.length + 1).padStart(3, "0")}`;
    const newOrder: RadiologyOrder = {
      ...order,
      id: `rad-${Date.now()}`,
      order_number: num,
      created_at: new Date().toISOString(),
    };
    setRadiologyOrders((prev) => [newOrder, ...prev]);
    recordAudit("CREATE_RADIOLOGY_ORDER", "radiology_orders", newOrder.id, `Order radiologi ${num} (${newOrder.modality}) untuk ${newOrder.patient_name}`);
    return newOrder;
  };

  const completeRadiologyReport = (orderId: string, report: string, conclusion: string) => {
    setRadiologyOrders((prev) =>
      prev.map((r) =>
        r.id === orderId
          ? {
              ...r,
              status: "hasil_selesai",
              radiologist_id: currentUser.id,
              radiologist_name: currentUser.full_name,
              expertise_report: report,
              conclusion: conclusion,
            }
          : r
      )
    );
    recordAudit("RADIOLOGY_REPORT", "radiology_orders", orderId, `Pengisian ekspertise radiologi order ${orderId}`);
  };

  const addInvoice = (invoice: Omit<Invoice, "id" | "invoice_number" | "created_at" | "remaining_amount">): Invoice => {
    const num = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(invoices.length + 1).padStart(3, "0")}`;
    const newInv: Invoice = {
      ...invoice,
      id: `inv-${Date.now()}`,
      invoice_number: num,
      remaining_amount: invoice.grand_total - invoice.paid_amount,
      created_at: new Date().toISOString(),
    };
    setInvoices((prev) => {
      const updated = [newInv, ...prev];
      localStorage.setItem("simrs_invoices", JSON.stringify(updated));
      return updated;
    });
    recordAudit("CREATE_INVOICE", "invoices", newInv.id, `Menerbitkan tagihan ${num} sebesar Rp ${newInv.grand_total.toLocaleString("id-ID")}`);
    return newInv;
  };

  const payInvoice = (invoiceId: string, amount: number, method: Invoice["payments"][0]["payment_method"], ref?: string) => {
    const receiptNum = `KWT-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(Math.random() * 900 + 100)}`;
    setInvoices((prev) => {
      const updated = prev.map((inv) => {
        if (inv.id === invoiceId) {
          const newPaid = inv.paid_amount + amount;
          const remaining = Math.max(0, inv.grand_total - newPaid);
          const newPayment = {
            id: `pay-${Date.now()}`,
            invoice_id: invoiceId,
            payment_number: receiptNum,
            amount,
            payment_method: method,
            reference_number: ref,
            cashier_id: currentUser.id,
            cashier_name: currentUser.full_name,
            paid_at: new Date().toISOString(),
          };
          return {
            ...inv,
            paid_amount: newPaid,
            remaining_amount: remaining,
            status: (remaining <= 0 ? "lunas" : "sebagian") as Invoice["status"],
            payments: [...inv.payments, newPayment],
          };
        }
        return inv;
      });
      localStorage.setItem("simrs_invoices", JSON.stringify(updated));
      return updated;
    });
    recordAudit("PROCESS_PAYMENT", "invoices", invoiceId, `Pembayaran diterima ${receiptNum} sebesar Rp ${amount.toLocaleString("id-ID")} via ${method}`);
  };

  const saveClinicalNote = (note: Omit<ClinicalNote, "id" | "created_at" | "updated_at">): ClinicalNote => {
    const newNote: ClinicalNote = {
      ...note,
      id: `note-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setClinicalNotes((prev) => {
      const updated = [newNote, ...prev];
      localStorage.setItem("simrs_notes", JSON.stringify(updated));
      return updated;
    });
    recordAudit("SAVE_CLINICAL_NOTE", "clinical_notes", newNote.id, `Catatan SOAP ${note.status.toUpperCase()} disimpan oleh ${note.doctor_name}`);
    return newNote;
  };

  const addEmergencyEncounter = (encounter: Omit<EmergencyEncounter, "id" | "arrival_time">): EmergencyEncounter => {
    const newEncounter: EmergencyEncounter = {
      ...encounter,
      id: `er-${Date.now()}`,
      arrival_time: new Date().toISOString(),
    };
    setEmergencyEncounters((prev) => [newEncounter, ...prev]);
    recordAudit("CREATE_EMERGENCY", "emergency", newEncounter.id, `Kedatangan pasien IGD ${newEncounter.patient_name} (${newEncounter.triage_level})`);
    return newEncounter;
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const resetToInitialDemoData = () => {
    localStorage.removeItem("simrs_patients");
    localStorage.removeItem("simrs_queues");
    localStorage.removeItem("simrs_beds");
    localStorage.removeItem("simrs_prescriptions");
    localStorage.removeItem("simrs_invoices");
    localStorage.removeItem("simrs_notes");
    setPatients(INITIAL_PATIENTS);
    setQueues(INITIAL_QUEUES);
    setBeds(INITIAL_BEDS);
    setPrescriptions(INITIAL_PRESCRIPTIONS);
    setInvoices(INITIAL_INVOICES);
    setClinicalNotes(INITIAL_CLINICAL_NOTES);
    recordAudit("RESET_DATA", "system", "demo_store", "Mereset data demo ke kondisi awal");
  };

  return (
    <DemoStoreContext.Provider
      value={{
        isDemoMode,
        currentUser,
        setCurrentUser,
        switchRole,
        hospitalSettings,
        updateHospitalSettings,
        patients,
        addPatient,
        updatePatient,
        queues,
        addQueue,
        updateQueueStatus,
        registrations,
        addRegistration,
        rooms,
        beds,
        updateBedStatus,
        admissions,
        admitPatient,
        dischargePatient,
        transferBed,
        doctorSchedules,
        addDoctorSchedule,
        medications,
        addMedicationStock,
        prescriptions,
        addPrescription,
        verifyPrescription,
        dispensePrescription,
        labOrders,
        addLabOrder,
        updateLabResult,
        validateLabOrder,
        radiologyOrders,
        addRadiologyOrder,
        completeRadiologyReport,
        invoices,
        addInvoice,
        payInvoice,
        clinicalNotes,
        saveClinicalNote,
        emergencyEncounters,
        addEmergencyEncounter,
        auditLogs,
        recordAudit,
        notifications,
        markNotificationRead,
        resetToInitialDemoData,
      }}
    >
      {children}
    </DemoStoreContext.Provider>
  );
}

export function useSIMRS() {
  const context = useContext(DemoStoreContext);
  if (!context) {
    throw new Error("useSIMRS must be used within a DemoStoreProvider");
  }
  return context;
}
