import { cn } from "@/lib/utils";

interface TierBadgeProps {
  tier: "Unranked" | "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond" | "Master" | "Grandmaster" | "Challenger";
  className?: string;
}

export const TierBadge = ({ tier, className }: TierBadgeProps) => {
  const getTierConfig = (tier: string) => {
    switch (tier) {
      case "Unranked":
        return {
          className: "bg-gray-500/20 text-gray-500 border-gray-500/30",
          label: "언랭크"
        };
      case "Bronze":
        return {
          className: "bg-orange-500/20 text-orange-500 border-orange-500/30",
          label: "브론즈"
        };
      case "Silver":
        return {
          className: "bg-gray-400/20 text-gray-400 border-gray-400/30",
          label: "실버"
        };
      case "Gold":
        return {
          className: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
          label: "골드"
        };
      case "Platinum":
        return {
          className: "bg-blue-400/20 text-blue-400 border-blue-400/30",
          label: "플래티넘"
        };
      case "Diamond":
        return {
          className: "bg-cyan-400/20 text-cyan-400 border-cyan-400/30",
          label: "다이아몬드"
        };
      case "Master":
        return {
          className: "bg-purple-500/20 text-purple-500 border-purple-500/30",
          label: "마스터"
        };
      case "Grandmaster":
        return {
          className: "bg-red-500/20 text-red-500 border-red-500/30",
          label: "그랜드마스터"
        };
      case "Challenger":
        return {
          className: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-yellow-400/30",
          label: "챌린저"
        };
      default:
        return {
          className: "bg-secondary/20 text-secondary-foreground border-secondary/30",
          label: "언랭크"
        };
    }
  };

  const config = getTierConfig(tier);

  return (
    <span className={cn(
      "inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border",
      config.className,
      className
    )}>
      {config.label}
    </span>
  );
};
