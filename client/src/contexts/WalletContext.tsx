import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { ethers } from "ethers";

interface WalletContextType {
  walletAddress: string | null;
  uid: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  role: string | null;
  status: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshUserData: () => Promise<void>;
  signMessage: (message: string) => Promise<string>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const storedAddress = localStorage.getItem("walletAddress");
    const storedUid = localStorage.getItem("uid");
    const storedRole = localStorage.getItem("role");
    const storedStatus = localStorage.getItem("status");
    
    if (storedAddress) {
      setWalletAddress(storedAddress);
      setUid(storedUid);
      setRole(storedRole);
      setStatus(storedStatus);
    }
  }, []);

  const connect = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask or another Web3 wallet");
      return;
    }

    try {
      setIsConnecting(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0];
      
      const response = await fetch(`/api/auth/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address }),
      });

      if (response.ok) {
        const data = await response.json();
        setWalletAddress(address);
        setUid(data.uid);
        setRole(data.role);
        setStatus(data.status);
        
        localStorage.setItem("walletAddress", address);
        localStorage.setItem("uid", data.uid);
        localStorage.setItem("role", data.role);
        localStorage.setItem("status", data.status);
      }
    } catch (error) {
      console.error("Wallet connection failed:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setWalletAddress(null);
    setUid(null);
    setRole(null);
    setStatus(null);
    
    localStorage.removeItem("walletAddress");
    localStorage.removeItem("uid");
    localStorage.removeItem("role");
    localStorage.removeItem("status");
  };

  const refreshUserData = async () => {
    if (!walletAddress) return;

    try {
      const response = await fetch(`/api/auth/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
      });

      if (response.ok) {
        const data = await response.json();
        setUid(data.uid);
        setRole(data.role);
        setStatus(data.status);
        
        localStorage.setItem("uid", data.uid);
        localStorage.setItem("role", data.role);
        localStorage.setItem("status", data.status);
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }
  };

  const signMessage = async (message: string): Promise<string> => {
    if (!window.ethereum) throw new Error("No wallet connected");
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return await signer.signMessage(message);
  };

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        uid,
        role,
        status,
        isConnected: !!walletAddress,
        isConnecting,
        connect,
        disconnect,
        refreshUserData,
        signMessage,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return context;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}
