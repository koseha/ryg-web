import { cn } from "@/lib/utils";

interface PositionTagsProps {
  positions: string[];
  className?: string;
  maxDisplay?: number;
}

export const PositionTags = ({
  positions,
  className,
  maxDisplay = 3,
}: PositionTagsProps) => {
  // positions가 null이거나 undefined인 경우 빈 배열로 처리
  const safePositions = positions || [];

  const getPositionConfig = (position: string) => {
    switch (position) {
      case "Top":
        return {
          className: "bg-red-500/20 text-red-500 border-red-500/30",
          label: "탑",
        };
      case "Jungle":
        return {
          className: "bg-green-500/20 text-green-500 border-green-500/30",
          label: "정글",
        };
      case "Mid":
        return {
          className: "bg-blue-500/20 text-blue-500 border-blue-500/30",
          label: "미드",
        };
      case "ADC":
        return {
          className: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
          label: "원딜",
        };
      case "Support":
        return {
          className: "bg-purple-500/20 text-purple-500 border-purple-500/30",
          label: "서포터",
        };
      default:
        return {
          className:
            "bg-secondary/20 text-secondary-foreground border-secondary/30",
          label: position,
        };
    }
  };

  const displayPositions = safePositions.slice(0, maxDisplay);
  const remainingCount = safePositions.length - maxDisplay;

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {displayPositions.map((position, index) => {
        const config = getPositionConfig(position);
        return (
          <span
            key={index}
            className={cn(
              "inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border",
              config.className
            )}
          >
            {config.label}
          </span>
        );
      })}
      {remainingCount > 0 && (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border bg-secondary/20 text-secondary-foreground border-secondary/30">
          +{remainingCount}
        </span>
      )}
    </div>
  );
};
