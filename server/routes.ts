import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import CryptoJS from "crypto-js";
import { randomBytes } from "crypto";

// Admin wallet address
const ADMIN_WALLET_ADDRESS = "0x3c17f3F514658fACa2D24DE1d29F542a836FD10A".toLowerCase();

// Helper function to generate UID (at least 9 digits after HID) with collision handling
async function generateUID(): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const randomNum = Math.floor(Math.random() * 900000000) + 100000000;
    const uid = `HID${randomNum}`;
    
    // Check if UID already exists
    const existing = await storage.getUserByUid(uid);
    if (!existing) {
      return uid;
    }
    
    attempts++;
  }
  
  // Fallback to timestamp-based UID if collision after retries
  return `HID${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

// Helper function to generate claim number
function generateClaimNumber(): string {
  return `CLM-${Date.now()}-${randomBytes(4).toString("hex").toUpperCase()}`;
}

// Helper function to simulate file hash
function generateFileHash(content: string): string {
  return CryptoJS.SHA256(content).toString();
}

// Helper function to simulate IPFS CID
function generateCID(): string {
  return `Qm${randomBytes(8).toString("hex")}`;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // ============================================
  // AUTH ROUTES
  // ============================================
  
  app.post("/api/auth/connect", async (req, res) => {
    try {
      const { walletAddress } = req.body;
      
      if (!walletAddress) {
        return res.status(400).json({ error: "Wallet address required" });
      }

      const normalizedWalletAddress = walletAddress.toLowerCase();
      let user = await storage.getUserByWalletAddress(normalizedWalletAddress);
      
      if (!user) {
        // Create new user with UID
        const uid = await generateUID();
        const username = `user_${normalizedWalletAddress.slice(2, 8)}`;
        const isAdmin = normalizedWalletAddress === ADMIN_WALLET_ADDRESS;
        
        user = await storage.createUser({
          walletAddress: normalizedWalletAddress,
          uid,
          username,
          role: isAdmin ? "admin" : "patient",
          status: isAdmin ? "verified" : "pending",
        });

        // Create audit log
        await storage.createAuditLog({
          userId: user.id,
          action: "user_registered",
          targetType: "user",
          targetId: user.id,
          metadata: { walletAddress, isAdmin },
        });
      }

      res.json({
        uid: user.uid,
        role: user.role,
        status: user.status,
      });
    } catch (error) {
      console.error("Auth error:", error);
      res.status(500).json({ error: "Authentication failed" });
    }
  });

  // ============================================
  // PATIENT ROUTES
  // ============================================

  // Get patient KYC
  app.get("/api/patient/kyc", async (req, res) => {
    try {
      const walletAddress = req.headers["x-wallet-address"] as string;
      const user = await storage.getUserByWalletAddress(walletAddress);
      
      if (!user) return res.status(404).json({ error: "User not found" });
      
      const kycData = await storage.getKYC(user.id);
      res.json(kycData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch KYC" });
    }
  });

  // Submit KYC
  app.post("/api/patient/kyc", async (req, res) => {
    try {
      const walletAddress = req.headers["x-wallet-address"] as string;
      const user = await storage.getUserByWalletAddress(walletAddress);
      
      if (!user) return res.status(404).json({ error: "User not found" });
      
      const documentCID = generateCID();
      
      const kycData = await storage.createKYC({
        userId: user.id,
        ...req.body,
        documentCID,
        status: "pending",
      });

      await storage.createAuditLog({
        userId: user.id,
        action: "kyc_submitted",
        targetType: "kyc",
        targetId: kycData.id,
      });

      res.json(kycData);
    } catch (error) {
      res.status(500).json({ error: "Failed to submit KYC" });
    }
  });

  // Get health profile (works for all user types)
  app.get("/api/user/health-profile", async (req, res) => {
    try {
      const walletAddress = req.headers["x-wallet-address"] as string;
      const user = await storage.getUserByWalletAddress(walletAddress);
      
      if (!user) return res.status(404).json({ error: "User not found" });
      
      const profile = await storage.getHealthProfile(user.id);
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  // Update health profile (works for all user types)
  app.put("/api/user/health-profile", async (req, res) => {
    try {
      const walletAddress = req.headers["x-wallet-address"] as string;
      const user = await storage.getUserByWalletAddress(walletAddress);
      
      if (!user) return res.status(404).json({ error: "User not found" });
      
      const existing = await storage.getHealthProfile(user.id);
      
      if (existing) {
        await storage.updateHealthProfile(user.id, req.body);
      } else {
        await storage.createHealthProfile({
          userId: user.id,
          ...req.body,
        });
      }

      await storage.createAuditLog({
        userId: user.id,
        action: "profile_updated",
        targetType: "profile",
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Legacy patient routes for backwards compatibility
  app.get("/api/patient/profile", async (req, res) => {
    try {
      const walletAddress = req.headers["x-wallet-address"] as string;
      const user = await storage.getUserByWalletAddress(walletAddress);
      
      if (!user) return res.status(404).json({ error: "User not found" });
      
      const profile = await storage.getHealthProfile(user.id);
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.put("/api/patient/profile", async (req, res) => {
    try {
      const walletAddress = req.headers["x-wallet-address"] as string;
      const user = await storage.getUserByWalletAddress(walletAddress);
      
      if (!user) return res.status(404).json({ error: "User not found" });
      
      const existing = await storage.getHealthProfile(user.id);
      
      if (existing) {
        await storage.updateHealthProfile(user.id, req.body);
      } else {
        await storage.createHealthProfile({
          userId: user.id,
          ...req.body,
        });
      }

      await storage.createAuditLog({
        userId: user.id,
        action: "profile_updated",
        targetType: "profile",
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Upload profile picture - works for all user types
  app.post("/api/user/profile-picture", async (req, res) => {
    try {
      const walletAddress = req.headers["x-wallet-address"] as string;
      const user = await storage.getUserByWalletAddress(walletAddress);
      
      if (!user) return res.status(404).json({ error: "User not found" });
      
      const { profilePicture } = req.body;
      
      // Validation
      if (!profilePicture || typeof profilePicture !== 'string') {
        return res.status(400).json({ error: "Profile picture is required and must be a string (base64 or URL)" });
      }
      
      // Check size limit (10MB for base64 data URLs)
      if (profilePicture.length > 10 * 1024 * 1024) {
        return res.status(400).json({ error: "Profile picture size exceeds 10MB limit" });
      }
      
      await storage.updateUserProfilePicture(user.id, profilePicture);

      await storage.createAuditLog({
        userId: user.id,
        action: "profile_picture_updated",
        targetType: "user",
        targetId: user.id,
      });

      res.json({ success: true, profilePicture });
    } catch (error) {
      res.status(500).json({ error: "Failed to upload profile picture" });
    }
  });

  // Legacy route for backwards compatibility
  app.post("/api/patient/profile-picture", async (req, res) => {
    try {
      const walletAddress = req.headers["x-wallet-address"] as string;
      const user = await storage.getUserByWalletAddress(walletAddress);
      
      if (!user) return res.status(404).json({ error: "User not found" });
      
      const { profilePicture } = req.body;
      
      if (!profilePicture || typeof profilePicture !== 'string') {
        return res.status(400).json({ error: "Profile picture is required and must be a string (base64 or URL)" });
      }
      
      if (profilePicture.length > 10 * 1024 * 1024) {
        return res.status(400).json({ error: "Profile picture size exceeds 10MB limit" });
      }
      
      await storage.updateUserProfilePicture(user.id, profilePicture);

      await storage.createAuditLog({
        userId: user.id,
        action: "profile_picture_updated",
        targetType: "user",
        targetId: user.id,
      });

      res.json({ success: true, profilePicture });
    } catch (error) {
      res.status(500).json({ error: "Failed to upload profile picture" });
    }
  });

  // Get medical records
  app.get("/api/patient/records", async (req, res) => {
    try {
      const walletAddress = req.headers["x-wallet-address"] as string;
      const user = await storage.getUserByWalletAddress(walletAddress);
      
      if (!user) return res.status(404).json({ error: "User not found" });
      
      const records = await storage.getMedicalRecords(user.id);
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch records" });
    }
  });

  // Upload medical record
  app.post("/api/patient/records", async (req, res) => {
    try {
      const walletAddress = req.headers["x-wallet-address"] as string;
      const user = await storage.getUserByWalletAddress(walletAddress);
      
      if (!user) return res.status(404).json({ error: "User not found" });
      
      const fileCID = generateCID();
      const fileHash = generateFileHash(JSON.stringify(req.body));
      const encryptionKey = CryptoJS.lib.WordArray.random(32).toString();
      
      const record = await storage.createMedicalRecord({
        userId: user.id,
        uploadedBy: user.id,
        fileCID,
        fileHash,
        encryptionKey,
        ...req.body,
      });

      await storage.createAuditLog({
        userId: user.id,
        action: "record_added",
        targetType: "record",
        targetId: record.id,
        metadata: { recordType: req.body.recordType },
      });

      res.json(record);
    } catch (error) {
      res.status(500).json({ error: "Failed to upload record" });
    }
  });

  // Get emergency QR
  app.get("/api/patient/qr", async (req, res) => {
    try {
      const walletAddress = req.headers["x-wallet-address"] as string;
      const user = await storage.getUserByWalletAddress(walletAddress);
      
      if (!user) return res.status(404).json({ error: "User not found" });
      
      const qr = await storage.getEmergencyQR(user.id);
      res.json(qr);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch QR" });
    }
  });

  // Generate emergency QR - works for all user types
  app.post("/api/user/qr", async (req, res) => {
    try {
      const walletAddress = req.headers["x-wallet-address"] as string;
      const user = await storage.getUserByWalletAddress(walletAddress);
      
      if (!user) return res.status(404).json({ error: "User not found" });
      
      // Get health profile for emergency details (if available)
      const healthProfile = await storage.getHealthProfile(user.id);
      
      // Get KYC info for hospital name
      const kycData = await storage.getKYC(user.id);
      
      const qrData = JSON.stringify({
        username: user.username,
        uid: user.uid,
        walletAddress: user.walletAddress,
        profilePicture: user.profilePicture,
        role: user.role,
        hospitalName: user.hospitalName || kycData?.institutionName || null,
        emergencyDetails: healthProfile ? {
          bloodType: healthProfile.bloodType,
          allergies: healthProfile.allergies,
          chronicConditions: healthProfile.chronicConditions,
          currentMedications: healthProfile.currentMedications,
          emergencyContact: healthProfile.emergencyContact,
          emergencyPhone: healthProfile.emergencyPhone,
        } : null,
        timestamp: Date.now(),
      });
      
      const qr = await storage.createEmergencyQR({
        userId: user.id,
        qrData,
        signedToken: req.body.signature || "simulated_signature",
      });

      await storage.createAuditLog({
        userId: user.id,
        action: "qr_generated",
        targetType: "qr",
        targetId: qr.id,
      });

      res.json(qr);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate QR" });
    }
  });

  // Legacy route for backwards compatibility
  app.post("/api/patient/qr", async (req, res) => {
    try {
      const walletAddress = req.headers["x-wallet-address"] as string;
      const user = await storage.getUserByWalletAddress(walletAddress);
      
      if (!user) return res.status(404).json({ error: "User not found" });
      
      const healthProfile = await storage.getHealthProfile(user.id);
      const kycData = await storage.getKYC(user.id);
      
      const qrData = JSON.stringify({
        username: user.username,
        uid: user.uid,
        walletAddress: user.walletAddress,
        profilePicture: user.profilePicture,
        role: user.role,
        hospitalName: user.hospitalName || kycData?.institutionName || null,
        emergencyDetails: healthProfile ? {
          bloodType: healthProfile.bloodType,
          allergies: healthProfile.allergies,
          chronicConditions: healthProfile.chronicConditions,
          currentMedications: healthProfile.currentMedications,
          emergencyContact: healthProfile.emergencyContact,
          emergencyPhone: healthProfile.emergencyPhone,
        } : null,
        timestamp: Date.now(),
      });
      
      const qr = await storage.createEmergencyQR({
        userId: user.id,
        qrData,
        signedToken: req.body.signature || "simulated_signature",
      });

      await storage.createAuditLog({
        userId: user.id,
        action: "qr_generated",
        targetType: "qr",
        targetId: qr.id,
      });

      res.json(qr);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate QR" });
    }
  });

  // Get access requests
  app.get("/api/patient/access-requests", async (req, res) => {
    try {
      const walletAddress = req.headers["x-wallet-address"] as string;
      const user = await storage.getUserByWalletAddress(walletAddress);
      
      if (!user) return res.status(404).json({ error: "User not found" });
      
      const requests = await storage.getAccessRequests(user.id);
      
      // Enrich with requester info
      const enriched = await Promise.all(requests.map(async (req) => {
        const requester = await storage.getUser(req.requesterId);
        return {
          ...req,
          requesterName: requester?.username,
          requesterRole: requester?.role,
        };
      }));
      
      res.json(enriched);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch access requests" });
    }
  });

  // Get granted access
  app.get("/api/patient/access-granted", async (req, res) => {
    try {
      const walletAddress = req.headers["x-wallet-address"] as string;
      const user = await storage.getUserByWalletAddress(walletAddress);
      
      if (!user) return res.status(404).json({ error: "User not found" });
      
      const granted = await storage.getGrantedAccess(user.id);
      
      const enriched = await Promise.all(granted.map(async (acc) => {
        const requester = await storage.getUser(acc.requesterId);
        return {
          ...acc,
          requesterName: requester?.username,
          requesterRole: requester?.role,
        };
      }));
      
      res.json(enriched);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch granted access" });
    }
  });

  // Approve access request
  app.post("/api/patient/access-requests/:id/approve", async (req, res) => {
    try {
      const { id } = req.params;
      
      await storage.updateAccessStatus(id, "granted");
      
      await storage.createAuditLog({
        action: "access_granted",
        targetType: "access",
        targetId: id,
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to approve access" });
    }
  });

  // Reject access request
  app.post("/api/patient/access-requests/:id/reject", async (req, res) => {
    try {
      const { id } = req.params;
      
      await storage.updateAccessStatus(id, "rejected");
      
      await storage.createAuditLog({
        action: "access_rejected",
        targetType: "access",
        targetId: id,
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to reject access" });
    }
  });

  // Revoke access
  app.post("/api/patient/access/:id/revoke", async (req, res) => {
    try {
      const { id } = req.params;
      
      await storage.updateAccessStatus(id, "revoked");
      
      await storage.createAuditLog({
        action: "access_revoked",
        targetType: "access",
        targetId: id,
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to revoke access" });
    }
  });

  // Get patient insurance
  app.get("/api/patient/insurance", async (req, res) => {
    try {
      const walletAddress = req.headers["x-wallet-address"] as string;
      const user = await storage.getUserByWalletAddress(walletAddress);
      
      if (!user) return res.status(404).json({ error: "User not found" });
      
      const insurance = await storage.getPatientInsurance(user.id);
      res.json(insurance);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch insurance" });
    }
  });

  // Get patient claims
  app.get("/api/patient/claims", async (req, res) => {
    try {
      const walletAddress = req.headers["x-wallet-address"] as string;
      const user = await storage.getUserByWalletAddress(walletAddress);
      
      if (!user) return res.status(404).json({ error: "User not found" });
      
      const claims = await storage.getClaims({ patientId: user.id });
      res.json(claims);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch claims" });
    }
  });

  // Get patient audit logs
  app.get("/api/patient/audit-logs", async (req, res) => {
    try {
      const walletAddress = req.headers["x-wallet-address"] as string;
      const user = await storage.getUserByWalletAddress(walletAddress);
      
      if (!user) return res.status(404).json({ error: "User not found" });
      
      const logs = await storage.getAuditLogs(user.id);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch audit logs" });
    }
  });

  // Apply for role
  app.post("/api/patient/apply-role", async (req, res) => {
    try {
      const walletAddress = req.headers["x-wallet-address"] as string;
      const user = await storage.getUserByWalletAddress(walletAddress);
      
      if (!user) return res.status(404).json({ error: "User not found" });

      // Create a role application KYC entry
      await storage.createKYC({
        userId: user.id,
        fullName: req.body.fullName || `${req.body.role} Application`,
        professionalLicense: req.body.professionalLicense || "",
        institutionName: req.body.institutionName || "",
        requestedRole: req.body.role,
        status: "pending",
      });

      await storage.createAuditLog({
        userId: user.id,
        action: "role_application_submitted",
        targetType: "user",
        targetId: user.id,
        metadata: { requestedRole: req.body.role },
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit application" });
    }
  });

  // Get current user data
  app.get("/api/user/me", async (req, res) => {
    try {
      const walletAddress = req.headers["x-wallet-address"] as string;
      const user = await storage.getUserByWalletAddress(walletAddress);
      
      if (!user) return res.status(404).json({ error: "User not found" });
      
      res.json({
        id: user.id,
        uid: user.uid,
        username: user.username,
        walletAddress: user.walletAddress,
        role: user.role,
        status: user.status,
        profilePicture: user.profilePicture,
        hospitalName: user.hospitalName,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user data" });
    }
  });

  // Update user info (hospital name, username, etc.)
  app.put("/api/user/info", async (req, res) => {
    try {
      const walletAddress = req.headers["x-wallet-address"] as string;
      const user = await storage.getUserByWalletAddress(walletAddress);
      
      if (!user) return res.status(404).json({ error: "User not found" });
      
      const { username, hospitalName } = req.body;
      const updateData: any = {};
      
      if (username) updateData.username = username;
      if (hospitalName !== undefined) updateData.hospitalName = hospitalName;
      
      await storage.updateUserInfo(user.id, updateData);

      await storage.createAuditLog({
        userId: user.id,
        action: "user_info_updated",
        targetType: "user",
        targetId: user.id,
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update user info" });
    }
  });

  // Get emergency QR for any user
  app.get("/api/user/qr", async (req, res) => {
    try {
      const walletAddress = req.headers["x-wallet-address"] as string;
      const user = await storage.getUserByWalletAddress(walletAddress);
      
      if (!user) return res.status(404).json({ error: "User not found" });
      
      const qr = await storage.getEmergencyQR(user.id);
      res.json(qr);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch QR" });
    }
  });

  // Create enhanced access request with proof (for doctors/emergency responders)
  app.post("/api/user/request-access", async (req, res) => {
    try {
      const { patientId, reason, isEmergency, proofImage, proofDetails } = req.body;
      const walletAddress = req.headers["x-wallet-address"] as string;
      const requester = await storage.getUserByWalletAddress(walletAddress);
      
      if (!requester) return res.status(404).json({ error: "Requester not found" });
      
      // Get patient to find their hospital if they have one
      const patient = await storage.getUser(patientId);
      if (!patient) return res.status(404).json({ error: "Patient not found" });
      
      // Determine if hospital should be notified
      const shouldNotifyHospital = isEmergency && patient.hospitalName;
      
      const accessRequest = await storage.createAccessRequest({
        patientId,
        requesterId: requester.id,
        accessType: isEmergency ? "emergency_only" : "full",
        reason,
        status: "pending",
        isEmergency: isEmergency || false,
        proofImage: proofImage || null,
        proofDetails: proofDetails || null,
        hospitalNotified: shouldNotifyHospital || false,
      });

      await storage.createAuditLog({
        userId: requester.id,
        action: isEmergency ? "emergency_access_requested" : "access_requested",
        targetType: "access",
        targetId: accessRequest.id,
        metadata: { patientId, reason, isEmergency, hospitalNotified: shouldNotifyHospital },
      });

      // If emergency and patient has a hospital, create notification (would be implemented later)
      if (shouldNotifyHospital) {
        await storage.createAuditLog({
          action: "hospital_notified_emergency",
          targetType: "access",
          targetId: accessRequest.id,
          metadata: { 
            patientId, 
            requesterId: requester.id, 
            hospitalName: patient.hospitalName 
          },
        });
      }

      res.json(accessRequest);
    } catch (error) {
      res.status(500).json({ error: "Failed to request access" });
    }
  });

  // ============================================
  // DOCTOR ROUTES
  // ============================================

  // Search for patient
  app.get("/api/doctor/search", async (req, res) => {
    try {
      const { query } = req.query as { query: string };
      const walletAddress = req.headers["x-wallet-address"] as string;
      const doctor = await storage.getUserByWalletAddress(walletAddress);
      
      if (!doctor) return res.status(404).json({ error: "Doctor not found" });
      
      let patient = await storage.getUserByUid(query);
      if (!patient) {
        patient = await storage.getUserByUsername(query);
      }
      
      if (!patient) {
        return res.status(404).json({ error: "Patient not found" });
      }

      const records = await storage.getMedicalRecords(patient.id);
      const hasAccess = await storage.checkAccess(patient.id, doctor.id);

      res.json({
        id: patient.id,
        username: patient.username,
        uid: patient.uid,
        status: patient.status,
        recordCount: records.length,
        hasAccess,
      });
    } catch (error) {
      res.status(500).json({ error: "Search failed" });
    }
  });

  // Request access to patient records
  app.post("/api/doctor/request-access", async (req, res) => {
    try {
      const { patientId, reason } = req.body;
      const walletAddress = req.headers["x-wallet-address"] as string;
      const doctor = await storage.getUserByWalletAddress(walletAddress);
      
      if (!doctor) return res.status(404).json({ error: "Doctor not found" });
      
      const accessRequest = await storage.createAccessRequest({
        patientId,
        requesterId: doctor.id,
        accessType: "full",
        reason,
        status: "pending",
      });

      await storage.createAuditLog({
        userId: doctor.id,
        action: "access_requested",
        targetType: "access",
        targetId: accessRequest.id,
        metadata: { patientId, reason },
      });

      res.json(accessRequest);
    } catch (error) {
      res.status(500).json({ error: "Failed to request access" });
    }
  });

  // Get doctor's access requests
  app.get("/api/doctor/access-requests", async (req, res) => {
    try {
      const walletAddress = req.headers["x-wallet-address"] as string;
      const doctor = await storage.getUserByWalletAddress(walletAddress);
      
      if (!doctor) return res.status(404).json({ error: "Doctor not found" });
      
      const requests = await storage.getAccessRequestsByRequester(doctor.id);
      
      const enriched = await Promise.all(requests.map(async (req) => {
        const patient = await storage.getUser(req.patientId);
        return {
          ...req,
          patientUid: patient?.uid,
          patientUsername: patient?.username,
        };
      }));
      
      res.json(enriched);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch access requests" });
    }
  });

  // Get doctor's treatment logs
  app.get("/api/doctor/treatments", async (req, res) => {
    try {
      const walletAddress = req.headers["x-wallet-address"] as string;
      const doctor = await storage.getUserByWalletAddress(walletAddress);
      
      if (!doctor) return res.status(404).json({ error: "Doctor not found" });
      
      const treatments = await storage.getTreatmentLogs(undefined, doctor.id);
      res.json(treatments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch treatments" });
    }
  });

  // ============================================
  // HOSPITAL ROUTES
  // ============================================

  // Get hospital claims
  app.get("/api/hospital/claims", async (req, res) => {
    try {
      const walletAddress = req.headers["x-wallet-address"] as string;
      const hospital = await storage.getUserByWalletAddress(walletAddress);
      
      if (!hospital) return res.status(404).json({ error: "Hospital not found" });
      
      const claims = await storage.getClaims({ hospitalId: hospital.id });
      res.json(claims);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch claims" });
    }
  });

  // Search hospital patients
  app.get("/api/hospital/search-patient", async (req, res) => {
    try {
      const { query } = req.query as { query: string };
      const walletAddress = req.headers["x-wallet-address"] as string;
      const hospital = await storage.getUserByWalletAddress(walletAddress);
      
      if (!hospital) return res.status(404).json({ error: "Hospital not found" });
      
      let patient = await storage.getUserByUid(query);
      if (!patient) {
        patient = await storage.getUserByUsername(query);
      }
      
      if (!patient) {
        return res.status(404).json({ error: "Patient not found" });
      }

      // Get patient's treatment logs with this hospital
      const treatments = await storage.getTreatmentLogs(patient.id);
      const hospitalTreatments = treatments.filter(t => t.hospitalId === hospital.id);
      
      // Get patient's claims with this hospital
      const patientClaims = await storage.getClaims({ patientId: patient.id, hospitalId: hospital.id });

      res.json({
        id: patient.id,
        uid: patient.uid,
        username: patient.username,
        status: patient.status,
        profilePicture: patient.profilePicture,
        treatmentCount: hospitalTreatments.length,
        claimCount: patientClaims.length,
        lastVisit: hospitalTreatments.length > 0 ? hospitalTreatments[0].treatmentDate : null,
      });
    } catch (error) {
      res.status(500).json({ error: "Search failed" });
    }
  });

  // Get hospital patients (all patients who have been treated at this hospital)
  app.get("/api/hospital/patients", async (req, res) => {
    try {
      const walletAddress = req.headers["x-wallet-address"] as string;
      const hospital = await storage.getUserByWalletAddress(walletAddress);
      
      if (!hospital) return res.status(404).json({ error: "Hospital not found" });
      
      // Get all treatment logs for this hospital
      const allTreatments = await storage.getTreatmentLogs();
      const hospitalTreatments = allTreatments.filter(t => t.hospitalId === hospital.id);
      
      // Get unique patient IDs
      const patientIds = Array.from(new Set(hospitalTreatments.map(t => t.patientId)));
      
      // Fetch patient details with their treatment info
      const patients = await Promise.all(patientIds.map(async (patientId) => {
        const patient = await storage.getUser(patientId);
        const patientTreatments = hospitalTreatments.filter(t => t.patientId === patientId);
        const latestTreatment = patientTreatments.sort((a, b) => 
          new Date(b.treatmentDate).getTime() - new Date(a.treatmentDate).getTime()
        )[0];
        
        return {
          id: patient?.id,
          uid: patient?.uid,
          username: patient?.username,
          profilePicture: patient?.profilePicture,
          lastVisit: latestTreatment?.treatmentDate,
          treatmentCount: patientTreatments.length,
          status: patient?.status,
        };
      }));
      
      res.json(patients.filter(p => p.id)); // Filter out any null patients
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch patients" });
    }
  });

  // ============================================
  // EMERGENCY ROUTES
  // ============================================

  // Get emergency scans
  app.get("/api/emergency/scans", async (req, res) => {
    try {
      const walletAddress = req.headers["x-wallet-address"] as string;
      const responder = await storage.getUserByWalletAddress(walletAddress);
      
      if (!responder) return res.status(404).json({ error: "Responder not found" });
      
      // Get audit logs for emergency scans
      const logs = await storage.getAuditLogs(responder.id);
      const scans = logs.filter(log => log.action === "qr_scanned");
      res.json(scans);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch scans" });
    }
  });

  // Verify and decode emergency QR
  app.post("/api/emergency/verify-qr", async (req, res) => {
    try {
      const { qrData } = req.body;
      const walletAddress = req.headers["x-wallet-address"] as string;
      const responder = await storage.getUserByWalletAddress(walletAddress);
      
      if (!responder) return res.status(404).json({ error: "Responder not found" });
      
      if (!qrData) return res.status(400).json({ error: "QR data required" });
      
      // Parse QR data
      let parsedData;
      try {
        parsedData = JSON.parse(qrData);
      } catch (e) {
        return res.status(400).json({ error: "Invalid QR data format" });
      }
      
      // Verify the patient exists
      const patient = await storage.getUserByUid(parsedData.uid);
      if (!patient) {
        return res.status(404).json({ error: "Patient not found" });
      }
      
      // Increment scan count
      await storage.incrementQRScanCount(patient.id);
      
      // Create audit log
      await storage.createAuditLog({
        userId: responder.id,
        action: "qr_scanned",
        targetType: "qr",
        targetId: patient.id,
        metadata: { patientUid: patient.uid, timestamp: Date.now() },
      });
      
      res.json({
        success: true,
        data: parsedData,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to verify QR" });
    }
  });

  // ============================================
  // INSURANCE ROUTES
  // ============================================

  // Get insurance claims
  app.get("/api/insurance/claims", async (req, res) => {
    try {
      const walletAddress = req.headers["x-wallet-address"] as string;
      const provider = await storage.getUserByWalletAddress(walletAddress);
      
      if (!provider) return res.status(404).json({ error: "Provider not found" });
      
      const claims = await storage.getClaims({ providerId: provider.id });
      res.json(claims);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch claims" });
    }
  });

  // Get insurance policies
  app.get("/api/insurance/policies", async (req, res) => {
    try {
      const walletAddress = req.headers["x-wallet-address"] as string;
      const provider = await storage.getUserByWalletAddress(walletAddress);
      
      if (!provider) return res.status(404).json({ error: "Provider not found" });
      
      const policies = await storage.getInsurancePolicies(provider.id);
      res.json(policies);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch policies" });
    }
  });

  // Create insurance policy
  app.post("/api/insurance/policies", async (req, res) => {
    try {
      const walletAddress = req.headers["x-wallet-address"] as string;
      const provider = await storage.getUserByWalletAddress(walletAddress);
      
      if (!provider) return res.status(404).json({ error: "Provider not found" });
      
      const policy = await storage.createInsurancePolicy({
        providerId: provider.id,
        ...req.body,
      });

      await storage.createAuditLog({
        userId: provider.id,
        action: "policy_created",
        targetType: "policy",
        targetId: policy.id,
        metadata: { policyNumber: policy.policyNumber },
      });

      res.json(policy);
    } catch (error) {
      res.status(500).json({ error: "Failed to create policy" });
    }
  });

  // ============================================
  // ADMIN ROUTES
  // ============================================

  // Get KYC queue
  app.get("/api/admin/kyc-queue", async (req, res) => {
    try {
      const kyc = await storage.getPendingKYC();
      res.json(kyc);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch KYC queue" });
    }
  });

  // Get role applications
  app.get("/api/admin/role-applications", async (req, res) => {
    try {
      const applications = await storage.getPendingKYC();
      res.json(applications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  });

  // Get all users
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Approve KYC
  app.post("/api/admin/kyc/:id/approve", async (req, res) => {
    try {
      const { id } = req.params;
      const walletAddress = req.headers["x-wallet-address"] as string;
      const admin = await storage.getUserByWalletAddress(walletAddress);
      
      if (!admin || admin.role !== "admin") {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const kycData = await storage.getKYCById(id);
      if (!kycData) {
        return res.status(404).json({ error: "KYC not found" });
      }

      await storage.updateKYCStatus(id, "approved", admin.id);
      await storage.updateUserStatus(kycData.userId, "verified");

      await storage.createAuditLog({
        userId: admin.id,
        action: "kyc_approved",
        targetType: "kyc",
        targetId: id,
        metadata: { kycUserId: kycData.userId },
      });

      res.json({ success: true });
    } catch (error) {
      console.error("KYC approval error:", error);
      res.status(500).json({ error: "Failed to approve KYC" });
    }
  });

  // Reject KYC
  app.post("/api/admin/kyc/:id/reject", async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const walletAddress = req.headers["x-wallet-address"] as string;
      const admin = await storage.getUserByWalletAddress(walletAddress);
      
      if (!admin || admin.role !== "admin") {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const kycData = await storage.getKYCById(id);
      if (!kycData) {
        return res.status(404).json({ error: "KYC not found" });
      }

      await storage.updateKYCStatus(id, "rejected", admin.id, reason || "Application denied");

      await storage.createAuditLog({
        userId: admin.id,
        action: "kyc_rejected",
        targetType: "kyc",
        targetId: id,
        metadata: { kycUserId: kycData.userId, reason },
      });

      res.json({ success: true });
    } catch (error) {
      console.error("KYC rejection error:", error);
      res.status(500).json({ error: "Failed to reject KYC" });
    }
  });

  // Update user role
  app.post("/api/admin/users/:userId/role", async (req, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      const walletAddress = req.headers["x-wallet-address"] as string;
      const admin = await storage.getUserByWalletAddress(walletAddress);
      
      if (!admin || admin.role !== "admin") {
        return res.status(403).json({ error: "Unauthorized" });
      }

      await storage.updateUserRole(userId, role);

      await storage.createAuditLog({
        userId: admin.id,
        action: "role_granted",
        targetType: "user",
        targetId: userId,
        metadata: { newRole: role },
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Role update error:", error);
      res.status(500).json({ error: "Failed to update user role" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
