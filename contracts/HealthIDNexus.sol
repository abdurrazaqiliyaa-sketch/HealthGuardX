// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title HealthIDNexus
 * @dev Decentralized Health Identity and Medical Records Management System
 * @notice This contract manages health identities, access control, and claims verification
 */
contract HealthIDNexus {
    
    // Contract owner (admin)
    address public admin;
    
    // Structs
    struct HealthIdentity {
        string uid;
        address walletAddress;
        string username;
        UserRole role;
        UserStatus status;
        string profilePictureCID; // IPFS CID for profile picture
        uint256 registeredAt;
        bool exists;
    }
    
    struct MedicalRecord {
        string recordCID; // IPFS CID for encrypted medical record
        string fileHash; // SHA-256 hash for integrity verification
        RecordType recordType;
        address uploadedBy;
        uint256 uploadedAt;
        bool isEmergency;
    }
    
    struct AccessGrant {
        address patient;
        address requester;
        AccessType accessType;
        uint256 grantedAt;
        uint256 expiresAt;
        bool isActive;
    }
    
    struct InsuranceClaim {
        string claimNumber;
        address patient;
        address hospital;
        address provider;
        uint256 amount;
        string invoiceCID; // IPFS CID for claim invoice
        string invoiceSignature; // Hospital signature
        ClaimStatus status;
        uint256 submittedAt;
        uint256 approvedAt;
    }
    
    // Enums
    enum UserRole { Patient, Doctor, Hospital, EmergencyResponder, InsuranceProvider, Admin }
    enum UserStatus { Pending, Verified, Suspended }
    enum RecordType { LabReport, Prescription, Imaging, Diagnosis, TreatmentPlan }
    enum AccessType { Full, EmergencyOnly, SpecificRecord }
    enum ClaimStatus { Pending, UnderReview, Approved, Rejected, Paid }
    
    // State variables
    mapping(address => HealthIdentity) public healthIdentities;
    mapping(string => address) public uidToAddress; // UID to wallet address mapping
    mapping(address => string[]) public userRecords; // User to their record CIDs
    mapping(address => mapping(address => AccessGrant)) public accessGrants;
    mapping(string => InsuranceClaim) public claims; // Claim number to claim
    
    // Arrays to track entities
    address[] public allUsers;
    string[] public allClaimNumbers;
    
    // Events
    event IdentityRegistered(address indexed user, string uid, UserRole role);
    event IdentityVerified(address indexed user, address indexed verifier);
    event ProfilePictureUpdated(address indexed user, string profilePictureCID);
    event RecordUploaded(address indexed user, string recordCID, RecordType recordType);
    event AccessGranted(address indexed patient, address indexed requester, AccessType accessType);
    event AccessRevoked(address indexed patient, address indexed requester);
    event ClaimSubmitted(string claimNumber, address indexed patient, uint256 amount);
    event ClaimStatusUpdated(string claimNumber, ClaimStatus newStatus);
    event ClaimPaid(string claimNumber, uint256 amount);
    event EmergencyQRGenerated(address indexed user, uint256 timestamp);
    
    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    modifier onlyVerified() {
        require(healthIdentities[msg.sender].status == UserStatus.Verified, "User must be verified");
        _;
    }
    
    modifier onlyRole(UserRole _role) {
        require(healthIdentities[msg.sender].role == _role, "Unauthorized role");
        _;
    }
    
    modifier identityExists(address _user) {
        require(healthIdentities[_user].exists, "Identity does not exist");
        _;
    }
    
    // Constructor
    constructor() {
        admin = msg.sender;
        
        // Register admin identity with format matching backend (HID + 9 digits)
        healthIdentities[admin] = HealthIdentity({
            uid: "HID100000001",
            walletAddress: admin,
            username: "admin",
            role: UserRole.Admin,
            status: UserStatus.Verified,
            profilePictureCID: "",
            registeredAt: block.timestamp,
            exists: true
        });
        
        uidToAddress["HID100000001"] = admin;
        allUsers.push(admin);
        
        emit IdentityRegistered(admin, "HID100000001", UserRole.Admin);
    }
    
    // Core Functions
    
    /**
     * @dev Register a new health identity
     * @param _uid Unique health ID (e.g., HID123456789)
     * @param _username Username for the identity
     */
    function registerIdentity(string memory _uid, string memory _username) external {
        require(!healthIdentities[msg.sender].exists, "Identity already exists");
        require(uidToAddress[_uid] == address(0), "UID already registered");
        
        healthIdentities[msg.sender] = HealthIdentity({
            uid: _uid,
            walletAddress: msg.sender,
            username: _username,
            role: UserRole.Patient,
            status: UserStatus.Pending,
            profilePictureCID: "",
            registeredAt: block.timestamp,
            exists: true
        });
        
        uidToAddress[_uid] = msg.sender;
        allUsers.push(msg.sender);
        
        emit IdentityRegistered(msg.sender, _uid, UserRole.Patient);
    }
    
    /**
     * @dev Verify a user's identity (admin only)
     * @param _user Address of user to verify
     */
    function verifyIdentity(address _user) external onlyAdmin identityExists(_user) {
        healthIdentities[_user].status = UserStatus.Verified;
        emit IdentityVerified(_user, msg.sender);
    }
    
    /**
     * @dev Update user role (admin only)
     * @param _user Address of user
     * @param _role New role
     */
    function updateUserRole(address _user, UserRole _role) external onlyAdmin identityExists(_user) {
        healthIdentities[_user].role = _role;
    }
    
    /**
     * @dev Update profile picture
     * @param _profilePictureCID IPFS CID of profile picture
     */
    function updateProfilePicture(string memory _profilePictureCID) external identityExists(msg.sender) {
        healthIdentities[msg.sender].profilePictureCID = _profilePictureCID;
        emit ProfilePictureUpdated(msg.sender, _profilePictureCID);
    }
    
    /**
     * @dev Upload a medical record
     * @param _recordCID IPFS CID of encrypted medical record
     * @param _fileHash SHA-256 hash for integrity
     * @param _recordType Type of medical record
     * @param _isEmergency Whether this is emergency-accessible
     */
    function uploadRecord(
        string memory _recordCID,
        string memory _fileHash,
        RecordType _recordType,
        bool _isEmergency
    ) external onlyVerified {
        userRecords[msg.sender].push(_recordCID);
        emit RecordUploaded(msg.sender, _recordCID, _recordType);
    }
    
    /**
     * @dev Grant access to medical records
     * @param _requester Address requesting access
     * @param _accessType Type of access to grant
     * @param _duration Duration of access in seconds
     */
    function grantAccess(
        address _requester,
        AccessType _accessType,
        uint256 _duration
    ) external identityExists(msg.sender) identityExists(_requester) {
        accessGrants[msg.sender][_requester] = AccessGrant({
            patient: msg.sender,
            requester: _requester,
            accessType: _accessType,
            grantedAt: block.timestamp,
            expiresAt: block.timestamp + _duration,
            isActive: true
        });
        
        emit AccessGranted(msg.sender, _requester, _accessType);
    }
    
    /**
     * @dev Revoke access to medical records
     * @param _requester Address to revoke access from
     */
    function revokeAccess(address _requester) external {
        require(accessGrants[msg.sender][_requester].isActive, "No active access grant");
        accessGrants[msg.sender][_requester].isActive = false;
        emit AccessRevoked(msg.sender, _requester);
    }
    
    /**
     * @dev Check if requester has access to patient records
     * @param _patient Patient address
     * @param _requester Requester address
     * @return bool Whether access is granted
     */
    function hasAccess(address _patient, address _requester) public view returns (bool) {
        AccessGrant memory grant = accessGrants[_patient][_requester];
        return grant.isActive && grant.expiresAt > block.timestamp;
    }
    
    /**
     * @dev Submit an insurance claim
     * @param _claimNumber Unique claim number
     * @param _patient Patient address
     * @param _provider Insurance provider address
     * @param _amount Claim amount
     * @param _invoiceCID IPFS CID of invoice
     * @param _invoiceSignature Hospital signature
     */
    function submitClaim(
        string memory _claimNumber,
        address _patient,
        address _provider,
        uint256 _amount,
        string memory _invoiceCID,
        string memory _invoiceSignature
    ) external onlyVerified onlyRole(UserRole.Hospital) {
        require(claims[_claimNumber].submittedAt == 0, "Claim already exists");
        require(healthIdentities[_patient].exists, "Patient does not exist");
        require(healthIdentities[_provider].role == UserRole.InsuranceProvider, "Invalid provider");
        
        claims[_claimNumber] = InsuranceClaim({
            claimNumber: _claimNumber,
            patient: _patient,
            hospital: msg.sender,
            provider: _provider,
            amount: _amount,
            invoiceCID: _invoiceCID,
            invoiceSignature: _invoiceSignature,
            status: ClaimStatus.Pending,
            submittedAt: block.timestamp,
            approvedAt: 0
        });
        
        allClaimNumbers.push(_claimNumber);
        emit ClaimSubmitted(_claimNumber, _patient, _amount);
    }
    
    /**
     * @dev Update claim status (insurance provider only)
     * @param _claimNumber Claim number
     * @param _newStatus New claim status
     */
    function updateClaimStatus(
        string memory _claimNumber,
        ClaimStatus _newStatus
    ) external onlyVerified onlyRole(UserRole.InsuranceProvider) {
        InsuranceClaim storage claim = claims[_claimNumber];
        require(claim.submittedAt > 0, "Claim does not exist");
        require(claim.provider == msg.sender, "Only assigned provider can update");
        
        claim.status = _newStatus;
        
        if (_newStatus == ClaimStatus.Approved) {
            claim.approvedAt = block.timestamp;
        }
        
        emit ClaimStatusUpdated(_claimNumber, _newStatus);
    }
    
    /**
     * @dev Mark claim as paid
     * @param _claimNumber Claim number
     */
    function markClaimPaid(string memory _claimNumber) external onlyVerified onlyRole(UserRole.InsuranceProvider) {
        InsuranceClaim storage claim = claims[_claimNumber];
        require(claim.status == ClaimStatus.Approved, "Claim must be approved first");
        require(claim.provider == msg.sender, "Only assigned provider can mark paid");
        
        claim.status = ClaimStatus.Paid;
        emit ClaimPaid(_claimNumber, claim.amount);
    }
    
    /**
     * @dev Generate emergency QR code event
     */
    function generateEmergencyQR() external identityExists(msg.sender) {
        emit EmergencyQRGenerated(msg.sender, block.timestamp);
    }
    
    // View Functions
    
    /**
     * @dev Get user's health identity
     * @param _user User address
     * @return HealthIdentity struct
     */
    function getIdentity(address _user) external view returns (HealthIdentity memory) {
        return healthIdentities[_user];
    }
    
    /**
     * @dev Get user's record count
     * @param _user User address
     * @return uint256 Number of records
     */
    function getRecordCount(address _user) external view returns (uint256) {
        return userRecords[_user].length;
    }
    
    /**
     * @dev Get claim details
     * @param _claimNumber Claim number
     * @return InsuranceClaim struct
     */
    function getClaim(string memory _claimNumber) external view returns (InsuranceClaim memory) {
        return claims[_claimNumber];
    }
    
    /**
     * @dev Get total registered users
     * @return uint256 Total users
     */
    function getTotalUsers() external view returns (uint256) {
        return allUsers.length;
    }
    
    /**
     * @dev Get total claims
     * @return uint256 Total claims
     */
    function getTotalClaims() external view returns (uint256) {
        return allClaimNumbers.length;
    }
    
    /**
     * @dev Get address by UID
     * @param _uid User's health ID
     * @return address User's wallet address
     */
    function getAddressByUID(string memory _uid) external view returns (address) {
        return uidToAddress[_uid];
    }
}
