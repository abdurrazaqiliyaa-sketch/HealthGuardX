import { db } from "./db";
import { eq, and, desc, or } from "drizzle-orm";
import type {
  User, InsertUser,
  KYC, InsertKYC,
  HealthProfile, InsertHealthProfile,
  MedicalRecord, InsertMedicalRecord,
  AccessControl, InsertAccessControl,
  TreatmentLog, InsertTreatmentLog,
  InsurancePolicy, InsertInsurancePolicy,
  PatientInsurance, InsertPatientInsurance,
  Claim, InsertClaim,
  AuditLog, InsertAuditLog,
  EmergencyQR, InsertEmergencyQR,
} from "@shared/schema";
import {
  users,
  kyc,
  healthProfiles,
  medicalRecords,
  accessControl,
  treatmentLogs,
  insurancePolicies,
  patientInsurance,
  claims,
  auditLogs,
  emergencyQRCodes,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
  getUserByUid(uid: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStatus(id: string, status: string): Promise<void>;
  updateUserRole(id: string, role: string): Promise<void>;
  updateUserProfilePicture(id: string, profilePicture: string): Promise<void>;
  updateUserInfo(id: string, data: Partial<InsertUser>): Promise<void>;
  getAllUsers(): Promise<User[]>;

  // KYC
  getKYC(userId: string): Promise<KYC | undefined>;
  getKYCById(id: string): Promise<KYC | undefined>;
  createKYC(kycData: InsertKYC): Promise<KYC>;
  updateKYCStatus(id: string, status: string, reviewedBy: string, rejectionReason?: string): Promise<void>;
  getPendingKYC(): Promise<KYC[]>;

  // Health Profiles
  getHealthProfile(userId: string): Promise<HealthProfile | undefined>;
  createHealthProfile(profile: InsertHealthProfile): Promise<HealthProfile>;
  updateHealthProfile(userId: string, profile: Partial<InsertHealthProfile>): Promise<void>;

  // Medical Records
  getMedicalRecords(userId: string): Promise<MedicalRecord[]>;
  createMedicalRecord(record: InsertMedicalRecord): Promise<MedicalRecord>;

  // Access Control
  getAccessRequests(patientId: string): Promise<AccessControl[]>;
  getAccessRequestsByRequester(requesterId: string): Promise<AccessControl[]>;
  getGrantedAccess(patientId: string): Promise<AccessControl[]>;
  createAccessRequest(access: InsertAccessControl): Promise<AccessControl>;
  updateAccessStatus(id: string, status: string): Promise<void>;
  checkAccess(patientId: string, requesterId: string): Promise<boolean>;

  // Treatment Logs
  getTreatmentLogs(patientId?: string, doctorId?: string): Promise<TreatmentLog[]>;
  createTreatmentLog(log: InsertTreatmentLog): Promise<TreatmentLog>;

  // Insurance Policies
  getInsurancePolicies(providerId?: string): Promise<InsurancePolicy[]>;
  createInsurancePolicy(policy: InsertInsurancePolicy): Promise<InsurancePolicy>;

  // Patient Insurance
  getPatientInsurance(patientId: string): Promise<any[]>;
  createPatientInsurance(enrollment: InsertPatientInsurance): Promise<PatientInsurance>;

  // Claims
  getClaims(params: { patientId?: string; hospitalId?: string; providerId?: string }): Promise<Claim[]>;
  createClaim(claim: InsertClaim): Promise<Claim>;
  updateClaimStatus(id: string, status: string, data?: Partial<Claim>): Promise<void>;

  // Audit Logs
  getAuditLogs(userId?: string): Promise<AuditLog[]>;
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;

  // Emergency QR
  getEmergencyQR(userId: string): Promise<EmergencyQR | undefined>;
  createEmergencyQR(qr: InsertEmergencyQR): Promise<EmergencyQR>;
  incrementQRScanCount(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    const normalizedAddress = walletAddress.toLowerCase();
    const [user] = await db.select().from(users).where(eq(users.walletAddress, normalizedAddress));
    return user || undefined;
  }

  async getUserByUid(uid: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.uid, uid));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserStatus(id: string, status: string): Promise<void> {
    await db.update(users).set({ status }).where(eq(users.id, id));
  }

  async updateUserRole(id: string, role: string): Promise<void> {
    await db.update(users).set({ role, status: "verified" }).where(eq(users.id, id));
  }

  async updateUserProfilePicture(id: string, profilePicture: string): Promise<void> {
    await db.update(users).set({ profilePicture }).where(eq(users.id, id));
  }

  async updateUserInfo(id: string, data: Partial<InsertUser>): Promise<void> {
    await db.update(users).set(data).where(eq(users.id, id));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  // KYC
  async getKYC(userId: string): Promise<KYC | undefined> {
    const [kycData] = await db.select().from(kyc).where(eq(kyc.userId, userId));
    return kycData || undefined;
  }

  async getKYCById(id: string): Promise<KYC | undefined> {
    const [kycData] = await db.select().from(kyc).where(eq(kyc.id, id));
    return kycData || undefined;
  }

  async createKYC(kycData: InsertKYC): Promise<KYC> {
    const [created] = await db.insert(kyc).values(kycData).returning();
    return created;
  }

  async updateKYCStatus(id: string, status: string, reviewedBy: string, rejectionReason?: string): Promise<void> {
    await db.update(kyc).set({
      status,
      reviewedBy,
      reviewedAt: new Date(),
      rejectionReason: rejectionReason || null,
    }).where(eq(kyc.id, id));
  }

  async getPendingKYC(): Promise<KYC[]> {
    return await db.select().from(kyc).where(eq(kyc.status, "pending")).orderBy(desc(kyc.submittedAt));
  }

  // Health Profiles
  async getHealthProfile(userId: string): Promise<HealthProfile | undefined> {
    const [profile] = await db.select().from(healthProfiles).where(eq(healthProfiles.userId, userId));
    return profile || undefined;
  }

  async createHealthProfile(profile: InsertHealthProfile): Promise<HealthProfile> {
    const [created] = await db.insert(healthProfiles).values(profile).returning();
    return created;
  }

  async updateHealthProfile(userId: string, profileData: Partial<InsertHealthProfile>): Promise<void> {
    await db.update(healthProfiles).set({ ...profileData, updatedAt: new Date() }).where(eq(healthProfiles.userId, userId));
  }

  // Medical Records
  async getMedicalRecords(userId: string): Promise<MedicalRecord[]> {
    return await db.select().from(medicalRecords).where(eq(medicalRecords.userId, userId)).orderBy(desc(medicalRecords.uploadedAt));
  }

  async createMedicalRecord(record: InsertMedicalRecord): Promise<MedicalRecord> {
    const [created] = await db.insert(medicalRecords).values(record).returning();
    return created;
  }

  // Access Control
  async getAccessRequests(patientId: string): Promise<AccessControl[]> {
    return await db.select().from(accessControl).where(eq(accessControl.patientId, patientId)).orderBy(desc(accessControl.requestedAt));
  }

  async getAccessRequestsByRequester(requesterId: string): Promise<AccessControl[]> {
    return await db.select().from(accessControl).where(eq(accessControl.requesterId, requesterId)).orderBy(desc(accessControl.requestedAt));
  }

  async getGrantedAccess(patientId: string): Promise<AccessControl[]> {
    return await db.select().from(accessControl).where(
      and(
        eq(accessControl.patientId, patientId),
        eq(accessControl.status, "granted")
      )
    ).orderBy(desc(accessControl.respondedAt));
  }

  async createAccessRequest(access: InsertAccessControl): Promise<AccessControl> {
    const [created] = await db.insert(accessControl).values(access).returning();
    return created;
  }

  async updateAccessStatus(id: string, status: string): Promise<void> {
    await db.update(accessControl).set({ status, respondedAt: new Date() }).where(eq(accessControl.id, id));
  }

  async checkAccess(patientId: string, requesterId: string): Promise<boolean> {
    const [access] = await db.select().from(accessControl).where(
      and(
        eq(accessControl.patientId, patientId),
        eq(accessControl.requesterId, requesterId),
        eq(accessControl.status, "granted")
      )
    );
    return !!access;
  }

  // Treatment Logs
  async getTreatmentLogs(patientId?: string, doctorId?: string): Promise<TreatmentLog[]> {
    let query = db.select().from(treatmentLogs);
    
    if (patientId && doctorId) {
      return await query.where(and(eq(treatmentLogs.patientId, patientId), eq(treatmentLogs.doctorId, doctorId))).orderBy(desc(treatmentLogs.createdAt));
    } else if (patientId) {
      return await query.where(eq(treatmentLogs.patientId, patientId)).orderBy(desc(treatmentLogs.createdAt));
    } else if (doctorId) {
      return await query.where(eq(treatmentLogs.doctorId, doctorId)).orderBy(desc(treatmentLogs.createdAt));
    }
    
    return await query.orderBy(desc(treatmentLogs.createdAt));
  }

  async createTreatmentLog(log: InsertTreatmentLog): Promise<TreatmentLog> {
    const [created] = await db.insert(treatmentLogs).values(log).returning();
    return created;
  }

  // Insurance Policies
  async getInsurancePolicies(providerId?: string): Promise<InsurancePolicy[]> {
    if (providerId) {
      return await db.select().from(insurancePolicies).where(eq(insurancePolicies.providerId, providerId));
    }
    return await db.select().from(insurancePolicies);
  }

  async createInsurancePolicy(policy: InsertInsurancePolicy): Promise<InsurancePolicy> {
    const [created] = await db.insert(insurancePolicies).values(policy).returning();
    return created;
  }

  // Patient Insurance
  async getPatientInsurance(patientId: string): Promise<any[]> {
    const result = await db
      .select({
        id: patientInsurance.id,
        patientId: patientInsurance.patientId,
        policyId: patientInsurance.policyId,
        enrollmentDate: patientInsurance.enrollmentDate,
        status: patientInsurance.status,
        policyNumber: insurancePolicies.policyNumber,
        policyName: insurancePolicies.policyName,
        coverageLimit: insurancePolicies.coverageLimit,
        coverageTypes: insurancePolicies.coverageTypes,
      })
      .from(patientInsurance)
      .leftJoin(insurancePolicies, eq(patientInsurance.policyId, insurancePolicies.id))
      .where(eq(patientInsurance.patientId, patientId));
    return result;
  }

  async createPatientInsurance(enrollment: InsertPatientInsurance): Promise<PatientInsurance> {
    const [created] = await db.insert(patientInsurance).values(enrollment).returning();
    return created;
  }

  // Claims
  async getClaims(params: { patientId?: string; hospitalId?: string; providerId?: string }): Promise<Claim[]> {
    let query = db.select().from(claims);
    
    const conditions = [];
    if (params.patientId) conditions.push(eq(claims.patientId, params.patientId));
    if (params.hospitalId) conditions.push(eq(claims.hospitalId, params.hospitalId));
    if (params.providerId) conditions.push(eq(claims.providerId, params.providerId));
    
    if (conditions.length > 0) {
      return await query.where(and(...conditions)).orderBy(desc(claims.submittedAt));
    }
    
    return await query.orderBy(desc(claims.submittedAt));
  }

  async createClaim(claim: InsertClaim): Promise<Claim> {
    const [created] = await db.insert(claims).values(claim).returning();
    return created;
  }

  async updateClaimStatus(id: string, status: string, data?: Partial<Claim>): Promise<void> {
    await db.update(claims).set({
      status,
      reviewedAt: new Date(),
      ...data,
    }).where(eq(claims.id, id));
  }

  // Audit Logs
  async getAuditLogs(userId?: string): Promise<AuditLog[]> {
    if (userId) {
      return await db.select().from(auditLogs).where(eq(auditLogs.userId, userId)).orderBy(desc(auditLogs.timestamp));
    }
    return await db.select().from(auditLogs).orderBy(desc(auditLogs.timestamp)).limit(1000);
  }

  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const [created] = await db.insert(auditLogs).values(log).returning();
    return created;
  }

  // Emergency QR
  async getEmergencyQR(userId: string): Promise<EmergencyQR | undefined> {
    const [qr] = await db.select().from(emergencyQRCodes).where(eq(emergencyQRCodes.userId, userId));
    return qr || undefined;
  }

  async createEmergencyQR(qrData: InsertEmergencyQR): Promise<EmergencyQR> {
    const existing = await this.getEmergencyQR(qrData.userId);
    if (existing) {
      const [updated] = await db.update(emergencyQRCodes).set({
        qrData: qrData.qrData,
        signedToken: qrData.signedToken,
        generatedAt: new Date(),
        expiresAt: qrData.expiresAt,
      }).where(eq(emergencyQRCodes.userId, qrData.userId)).returning();
      return updated;
    }
    
    const [created] = await db.insert(emergencyQRCodes).values(qrData).returning();
    return created;
  }

  async incrementQRScanCount(userId: string): Promise<void> {
    const qr = await this.getEmergencyQR(userId);
    if (qr) {
      await db.update(emergencyQRCodes).set({
        scanCount: (qr.scanCount || 0) + 1,
      }).where(eq(emergencyQRCodes.userId, userId));
    }
  }
}

export const storage = new DatabaseStorage();
