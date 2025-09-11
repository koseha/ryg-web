import Image from "next/image";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  src?: string;
  alt?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  fallback?: string;
}

export const UserAvatar = ({ 
  src, 
  alt = "User avatar", 
  className, 
  size = "md",
  fallback 
}: UserAvatarProps) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-16 w-16"
  };

  if (src) {
    const sizeValue = size === "sm" ? 32 : size === "md" ? 40 : 64;
    return (
      <Image
        src={src}
        alt={alt}
        width={sizeValue}
        height={sizeValue}
        className={cn(
          "rounded-full border-2 border-primary/30 object-cover",
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div className={cn(
      "rounded-full border-2 border-primary/30 bg-secondary flex items-center justify-center",
      sizeClasses[size],
      className
    )}>
      {fallback ? (
        <span className="text-sm font-medium text-secondary-foreground">
          {fallback.charAt(0).toUpperCase()}
        </span>
      ) : (
        <User className="h-1/2 w-1/2 text-muted-foreground" />
      )}
    </div>
  );
};