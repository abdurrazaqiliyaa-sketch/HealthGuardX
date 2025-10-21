# HealthID Nexus - Decentralized Health Identity System

## Overview

HealthID Nexus is a blockchain-integrated healthcare identity and insurance claim management system. It provides secure, patient-owned medical records with emergency QR access, role-based dashboards for healthcare stakeholders, and blockchain-verified insurance claims. The platform serves multiple user roles including patients, doctors, hospitals, emergency responders, insurance providers, and system administrators.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server with HMR support
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and caching

**UI Component System**
- Shadcn/ui component library built on Radix UI primitives
- Material Design principles with healthcare-specific UX patterns
- Tailwind CSS for utility-first styling with custom design tokens
- Theme system supporting light/dark modes via context provider
- Mobile-first responsive design optimized for field use

**Design System**
- Custom color palette with role-specific accent colors (Medical Blue for patients, Clinical Green for doctors, Professional Purple for hospitals, etc.)
- Semantic colors for status indicators (success, alert, warning, info)
- Inter font family for primary text, optimized for medical data legibility
- Consistent spacing, border radius, and elevation patterns

### Backend Architecture

**Server Framework**
- Express.js server with TypeScript
- RESTful API design pattern
- Session-based authentication via wallet address headers
- Middleware for request logging and error handling

**Authentication & Authorization**
- Web3 wallet-based authentication (MetaMask integration via ethers.js)
- Wallet signature verification for user authentication
- Role-based access control (RBAC) with 6 distinct roles
- Session management tied to wallet addresses
- Admin-only operations protected by wallet address whitelist

**Data Access Layer**
- Storage abstraction interface pattern for database operations
- Centralized data access through storage module
- Type-safe database queries using Drizzle ORM
- Transaction support for multi-step operations

### Data Storage

**Database Solution**
- PostgreSQL as primary relational database
- Neon serverless PostgreSQL for scalable cloud hosting
- WebSocket connection pooling with SSL certificate handling for Replit environment
- Connection pool management via @neondatabase/serverless

**Schema Design**
- Users table with wallet addresses as primary authentication mechanism
- Unique UID generation (HID prefix + 9+ digit random number) with collision detection
- KYC verification workflow with document storage references
- Health profiles with medical data (blood type, allergies, chronic conditions)
- Medical records with encrypted content and IPFS CID simulation
- Access control table for granular permission management (read/write/emergency)
- Treatment logs for doctor-patient interaction tracking
- Insurance policies and patient-policy associations
- Claims processing workflow with approval states
- Audit logs for compliance and activity tracking
- Emergency QR codes with encrypted critical medical information

**Data Security**
- Client-side encryption using CryptoJS for sensitive medical data
- Simulated IPFS content addressing for document immutability
- SHA-256 hashing for file integrity verification
- Encrypted emergency QR data for first responder access

### External Dependencies

**Blockchain & Web3**
- ethers.js (v6) for wallet connectivity and message signing
- MetaMask browser extension as primary wallet provider
- Simulated blockchain verification (ready for actual smart contract integration)

**Database & ORM**
- @neondatabase/serverless for PostgreSQL connection
- Drizzle ORM for type-safe query building and migrations
- drizzle-kit for schema management and migrations
- connect-pg-simple for PostgreSQL session storage

**UI Component Libraries**
- @radix-ui/* primitives for accessible UI components (dialogs, dropdowns, tooltips, etc.)
- react-day-picker via calendar component
- cmdk for command palette functionality
- QR code generation libraries for emergency access codes

**Utilities**
- crypto-js for encryption/decryption operations
- date-fns for date manipulation
- nanoid for generating unique identifiers
- class-variance-authority for component variant management
- clsx and tailwind-merge for conditional CSS classes

**Development Tools**
- tsx for TypeScript execution in development
- esbuild for production server bundling
- cross-env for environment variable management
- Replit-specific plugins for development banner and cartographer

### Key Architectural Decisions

**Wallet-Based Authentication**
- **Problem**: Healthcare systems require strong identity verification while maintaining user privacy
- **Solution**: Web3 wallet signatures provide cryptographic proof of identity without passwords
- **Rationale**: Eliminates password vulnerabilities, provides decentralized identity, enables future blockchain integration
- **Trade-off**: Requires users to have Web3 wallet (MetaMask), but aligns with decentralized health identity goals

**Role-Based Dashboard System**
- **Problem**: Different healthcare stakeholders need distinct interfaces and data access patterns
- **Solution**: Six separate dashboard hierarchies (patient, doctor, hospital, emergency, insurance, admin)
- **Rationale**: Improves UX by showing only relevant features, enforces principle of least privilege
- **Implementation**: React routing with role-based navigation guards and distinct visual themes per role

**Simulated Blockchain Layer**
- **Problem**: Need blockchain verification concept without immediate smart contract deployment
- **Solution**: Generate CIDs, hashes, and transaction-like IDs that mirror blockchain patterns
- **Rationale**: Allows full application development while blockchain infrastructure is prepared
- **Future Path**: Replace simulated functions with actual smart contract calls to Ethereum/Polygon

**Emergency QR Access**
- **Problem**: First responders need instant access to critical medical data in emergencies
- **Solution**: QR codes with encrypted payloads containing blood type, allergies, emergency contacts
- **Rationale**: Works offline, universally scannable, balances security with emergency access needs
- **Security**: Encryption ensures only authorized scanning apps can decrypt sensitive data

**Granular Access Control**
- **Problem**: Medical records require fine-grained permission management
- **Solution**: Access control table with read/write/emergency permission types and expiration dates
- **Rationale**: Enables temporary access grants (e.g., for specialists), supports audit requirements
- **Compliance**: Aligns with HIPAA-style privacy requirements for medical data sharing

**Centralized Storage Abstraction**
- **Problem**: Direct database queries scattered across routes create maintenance challenges
- **Solution**: Storage interface with typed methods for all database operations
- **Rationale**: Single source of truth for data access, easier to test, simplifies future database migrations
- **Benefits**: Type safety, transaction support, consistent error handling