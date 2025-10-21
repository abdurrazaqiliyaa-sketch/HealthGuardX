import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, decimal, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - stores wallet addresses and basic info
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletAddress: text("wallet_address").notNull().unique(),
  uid: text("uid").notNull().unique(), // Blockchain-style UID
  username: text("username").notNull().unique(),
  email: text("email"),
  role: text("role").notNull().default("patient"), // patient, doctor, hospital, emergency_responder, insurance_provider, admin
  status: text("status").notNull().default("pending"), // pending, verified, suspended
  profilePicture: text("profile_picture"),
  hospitalName: text("hospital_name"), // Hospital name for hospitals, or affiliated hospital for doctors/emergency responders
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  walletIdx: index("wallet_idx").on(table.walletAddress),
  uidIdx: index("uid_idx").on(table.uid),
}));

// KYC data - encrypted and stored per user
export const kyc = pgTable("kyc", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(),
  dateOfBirth: text("date_of_birth"),
  nationalId: text("national_id"),
  phoneNumber: text("phone_number"),
  address: text("address"),
  documentType: text("document_type"), // passport, national_id, drivers_license
  documentNumber: text("document_number"),
  documentCID: text("document_cid"), // IPFS CID (simulated)
  professionalLicense: text("professional_license"), // For doctors/hospitals
  institutionName: text("institution_name"), // For hospitals/insurance
  requestedRole: text("requested_role"), // For role applications: doctor, hospital, emergency_responder, insurance_provider
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  rejectionReason: text("rejection_reason"),
});

// Patient health profiles
export const healthProfiles = pgTable("health_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  bloodType: text("blood_type"), // A+, A-, B+, B-, AB+, AB-, O+, O-
  allergies: text("allergies").array(),
  chronicConditions: text("chronic_conditions").array(),
  currentMedications: text("current_medications").array(),
  emergencyContact: text("emergency_contact"),
  emergencyPhone: text("emergency_phone"),
  height: decimal("height"), // in cm
  weight: decimal("weight"), // in kg
  organDonor: boolean("organ_donor").default(false),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Medical records - encrypted files stored on IPFS
export const medicalRecords = pgTable("medical_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  recordType: text("record_type").notNull(), // lab_report, prescription, imaging, diagnosis, treatment_plan
  fileCID: text("file_cid").notNull(), // IPFS CID (simulated)
  fileHash: text("file_hash").notNull(), // SHA-256 hash for integrity
  fileName: text("file_name"), // Original file name
  fileType: text("file_type"), // MIME type (application/pdf, etc.)
  fileData: text("file_data"), // Base64 encoded file data
  isEmergency: boolean("is_emergency").default(false), // Flag for emergency access
  uploadedBy: varchar("uploaded_by").notNull().references(() => users.id),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  encryptionKey: text("encryption_key"), // Wrapped AES key (simulated)
}, (table) => ({
  userIdx: index("medical_records_user_idx").on(table.userId),
}));

// Access control - who can access which records
export const accessControl = pgTable("access_control", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  requesterId: varchar("requester_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  recordId: varchar("record_id").references(() => medicalRecords.id, { onDelete: "cascade" }),
  accessType: text("access_type").notNull(), // full, emergency_only, specific_record
  status: text("status").notNull().default("pending"), // pending, granted, revoked, expired
  reason: text("reason"),
  isEmergency: boolean("is_emergency").default(false), // Flag for emergency access requests
  proofImage: text("proof_image"), // Base64 encoded proof image for emergency requests
  proofDetails: text("proof_details"), // Additional details/context for the request
  hospitalNotified: boolean("hospital_notified").default(false), // Whether patient's hospital was notified
  requestedAt: timestamp("requested_at").notNull().defaultNow(),
  respondedAt: timestamp("responded_at"),
  expiresAt: timestamp("expires_at"),
  encryptedKey: text("encrypted_key"), // ECIES-wrapped key for this requester
}, (table) => ({
  patientIdx: index("access_patient_idx").on(table.patientId),
  requesterIdx: index("access_requester_idx").on(table.requesterId),
}));

// Treatment logs - signed by doctors
export const treatmentLogs = pgTable("treatment_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  doctorId: varchar("doctor_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  hospitalId: varchar("hospital_id").references(() => users.id),
  diagnosis: text("diagnosis").notNull(),
  treatment: text("treatment").notNull(),
  prescription: text("prescription"),
  notes: text("notes"),
  treatmentDate: timestamp("treatment_date").notNull(),
  recordCID: text("record_cid"), // IPFS CID for full record
  doctorSignature: text("doctor_signature").notNull(), // EIP-712 signature
  signatureHash: text("signature_hash").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  patientIdx: index("treatment_patient_idx").on(table.patientId),
}));

// Insurance policies
export const insurancePolicies = pgTable("insurance_policies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  policyNumber: text("policy_number").notNull().unique(),
  policyName: text("policy_name").notNull(),
  coverageLimit: decimal("coverage_limit", { precision: 12, scale: 2 }),
  coverageTypes: text("coverage_types").array(), // emergency, outpatient, inpatient, surgery
  termsCID: text("terms_cid"), // IPFS CID for policy terms
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Patient insurance enrollment
export const patientInsurance = pgTable("patient_insurance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  policyId: varchar("policy_id").notNull().references(() => insurancePolicies.id, { onDelete: "cascade" }),
  enrollmentDate: timestamp("enrollment_date").notNull().defaultNow(),
  status: text("status").notNull().default("active"), // active, expired, cancelled
});

// Insurance claims
export const claims = pgTable("claims", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  claimNumber: text("claim_number").notNull().unique(),
  patientId: varchar("patient_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  treatmentLogId: varchar("treatment_log_id").references(() => treatmentLogs.id),
  hospitalId: varchar("hospital_id").notNull().references(() => users.id),
  policyId: varchar("policy_id").notNull().references(() => insurancePolicies.id),
  providerId: varchar("provider_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  claimType: text("claim_type").notNull(), // emergency, outpatient, inpatient, surgery
  invoiceCID: text("invoice_cid").notNull(), // IPFS CID for invoice
  invoiceSignature: text("invoice_signature").notNull(), // Hospital signature
  status: text("status").notNull().default("pending"), // pending, under_review, approved, rejected, paid
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  approvalNote: text("approval_note"),
  rejectionReason: text("rejection_reason"),
  paidAt: timestamp("paid_at"),
  paidAmount: decimal("paid_amount", { precision: 12, scale: 2 }),
}, (table) => ({
  patientIdx: index("claims_patient_idx").on(table.patientId),
  statusIdx: index("claims_status_idx").on(table.status),
}));

// Audit log - immutable record of all actions
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  action: text("action").notNull(), // access_requested, access_granted, access_revoked, record_added, claim_submitted, claim_approved, etc.
  targetId: varchar("target_id"), // ID of affected resource
  targetType: text("target_type"), // user, record, claim, access
  metadata: jsonb("metadata"), // Additional context
  ipAddress: text("ip_address"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
}, (table) => ({
  userIdx: index("audit_user_idx").on(table.userId),
  timestampIdx: index("audit_timestamp_idx").on(table.timestamp),
}));

// Emergency QR codes
export const emergencyQRCodes = pgTable("emergency_qr_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  qrData: text("qr_data").notNull(), // JSON payload with emergency info
  signedToken: text("signed_token").notNull(), // EIP-712 signature
  generatedAt: timestamp("generated_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
  scanCount: integer("scan_count").default(0),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  kyc: one(kyc, {
    fields: [users.id],
    references: [kyc.userId],
  }),
  healthProfile: one(healthProfiles, {
    fields: [users.id],
    references: [healthProfiles.userId],
  }),
  medicalRecords: many(medicalRecords),
  accessGranted: many(accessControl, { relationName: "requester" }),
  accessReceived: many(accessControl, { relationName: "patient" }),
  treatmentsAsPatient: many(treatmentLogs, { relationName: "patient" }),
  treatmentsAsDoctor: many(treatmentLogs, { relationName: "doctor" }),
  claimsAsPatient: many(claims, { relationName: "claimPatient" }),
  insurancePolicies: many(patientInsurance),
  auditLogs: many(auditLogs),
  emergencyQR: one(emergencyQRCodes, {
    fields: [users.id],
    references: [emergencyQRCodes.userId],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertKYCSchema = createInsertSchema(kyc).omit({ id: true, submittedAt: true, reviewedAt: true, reviewedBy: true });
export const insertHealthProfileSchema = createInsertSchema(healthProfiles).omit({ id: true, updatedAt: true });
export const insertMedicalRecordSchema = createInsertSchema(medicalRecords).omit({ id: true, uploadedAt: true });
export const insertAccessControlSchema = createInsertSchema(accessControl).omit({ id: true, requestedAt: true, respondedAt: true });
export const insertTreatmentLogSchema = createInsertSchema(treatmentLogs).omit({ id: true, createdAt: true });
export const insertInsurancePolicySchema = createInsertSchema(insurancePolicies).omit({ id: true, createdAt: true });
export const insertPatientInsuranceSchema = createInsertSchema(patientInsurance).omit({ id: true, enrollmentDate: true });
export const insertClaimSchema = createInsertSchema(claims).omit({ id: true, submittedAt: true, reviewedAt: true, paidAt: true });
export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true, timestamp: true });
export const insertEmergencyQRSchema = createInsertSchema(emergencyQRCodes).omit({ id: true, generatedAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type KYC = typeof kyc.$inferSelect;
export type InsertKYC = z.infer<typeof insertKYCSchema>;
export type HealthProfile = typeof healthProfiles.$inferSelect;
export type InsertHealthProfile = z.infer<typeof insertHealthProfileSchema>;
export type MedicalRecord = typeof medicalRecords.$inferSelect;
export type InsertMedicalRecord = z.infer<typeof insertMedicalRecordSchema>;
export type AccessControl = typeof accessControl.$inferSelect;
export type InsertAccessControl = z.infer<typeof insertAccessControlSchema>;
export type TreatmentLog = typeof treatmentLogs.$inferSelect;
export type InsertTreatmentLog = z.infer<typeof insertTreatmentLogSchema>;
export type InsurancePolicy = typeof insurancePolicies.$inferSelect;
export type InsertInsurancePolicy = z.infer<typeof insertInsurancePolicySchema>;
export type PatientInsurance = typeof patientInsurance.$inferSelect;
export type InsertPatientInsurance = z.infer<typeof insertPatientInsuranceSchema>;
export type Claim = typeof claims.$inferSelect;
export type InsertClaim = z.infer<typeof insertClaimSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type EmergencyQR = typeof emergencyQRCodes.$inferSelect;
export type InsertEmergencyQR = z.infer<typeof insertEmergencyQRSchema>;
