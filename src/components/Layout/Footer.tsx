import { Crown, Heart } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-card/60 backdrop-blur-sm border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-2">
            <Crown className="h-6 w-6 text-primary animate-glow" />
            <span className="text-lg font-bold text-glow">Record Your Games</span>
          </div>

          {/* Copyright */}
          <div className="flex items-center space-x-2 text-muted-foreground text-sm">
            <span>© 2024 RYG</span>
            <span>•</span>
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500 fill-current" />
            <span>for gamers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
