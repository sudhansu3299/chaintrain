import { Badge } from "./ui/badge";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface StatusBadgeProps {
  verified: boolean;
  pending?: boolean;
}

export function StatusBadge({ verified, pending = false }: StatusBadgeProps) {
  if (pending) {
    return (
      <Badge variant="outline" className="border-muted-foreground/50 text-muted-foreground">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  }

  if (verified) {
    return (
      <Badge className="bg-accent/20 text-accent border-accent/50 hover:bg-accent/30">
        <CheckCircle className="h-3 w-3 mr-1" />
        Verified
      </Badge>
    );
  }

  return (
    <Badge variant="destructive" className="bg-destructive/20 text-destructive border-destructive/50">
      <XCircle className="h-3 w-3 mr-1" />
      Unverified
    </Badge>
  );
}
