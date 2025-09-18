import { cn } from "@/lib/utils";
import { Crown, Star, Users } from "lucide-react";

interface RoleBadgeProps {
  role: "owner" | "admin" | "member";
  className?: string;
}

export const RoleBadge = ({ role, className }: RoleBadgeProps) => {
  const getRoleConfig = (role: string) => {
    switch (role) {
      case "owner":
        return {
          icon: Crown,
          className: "bg-primary/20 text-primary border-primary/30",
          label: "책임자"
        };
      case "admin":
        return {
          icon: Star,
          className: "bg-accent/20 text-accent border-accent/30",
          label: "운영진"
        };
      default:
        return {
          icon: Users,
          className: "bg-secondary/20 text-secondary-foreground border-secondary/30",
          label: "멤버"
        };
    }
  };

  const config = getRoleConfig(role);
  const Icon = config.icon;

  return (
    <span className={cn(
      "inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full border",
      config.className,
      className
    )}>
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </span>
  );
};
