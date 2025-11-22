import { useWalletKit } from "@/lib/wallet";
import { ConnectButton as WalletKitConnectButton } from "@mysten/wallet-kit";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Wallet, Copy, LogOut, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function WalletButton() {
  const { currentAccount, accounts, selectAccount, disconnect } = useWalletKit();
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyAddress = async () => {
    if (currentAccount?.address) {
      await navigator.clipboard.writeText(currentAccount.address);
      setCopied(true);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!currentAccount) {
    return <WalletKitConnectButton />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Wallet className="h-4 w-4" />
          {formatAddress(currentAccount.address)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Wallet</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
          {copied ? (
            <CheckCircle className="h-4 w-4 mr-2 text-accent" />
          ) : (
            <Copy className="h-4 w-4 mr-2" />
          )}
          Copy Address
        </DropdownMenuItem>
        {accounts.length > 1 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Switch Account</DropdownMenuLabel>
            {accounts.map((account) => (
              <DropdownMenuItem
                key={account.address}
                onClick={() => selectAccount(account)}
                className="cursor-pointer"
              >
                {formatAddress(account.address)}
                {account.address === currentAccount.address && (
                  <CheckCircle className="h-4 w-4 ml-auto text-accent" />
                )}
              </DropdownMenuItem>
            ))}
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => disconnect()} className="cursor-pointer text-destructive">
          <LogOut className="h-4 w-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
