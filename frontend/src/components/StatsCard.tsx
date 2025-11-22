import { ReactNode } from "react";
import { Card, CardContent } from "./ui/card";
import { motion } from "framer-motion";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  index?: number;
}

export function StatsCard({ title, value, icon, trend, index = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="card-gradient border-border/50 hover:border-primary/50 transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
            {trend && (
              <span className="text-sm text-accent font-medium">{trend}</span>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold gradient-text">{value}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
