import { createContext, useContext, ReactNode } from "react";
import { 
  WalletKitProvider,
  ConnectButton,
  useWalletKit
} from "@mysten/wallet-kit";

// Re-export wallet kit components and hooks
export { ConnectButton, useWalletKit };

// Wallet provider wrapper
export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <WalletKitProvider
      enableUnsafeBurner={true}
      features={["sui:signAndExecuteTransaction"]}
    >
      {children}
    </WalletKitProvider>
  );
}
