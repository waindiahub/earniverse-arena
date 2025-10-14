import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface GameCardProps {
  title: string;
  icon: LucideIcon;
  gradient?: "cyan" | "pink" | "green";
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export const GameCard = ({
  title,
  icon: Icon,
  gradient = "cyan",
  onClick,
  className,
  children,
}: GameCardProps) => {
  const gradientClasses = {
    cyan: "from-primary/20 to-transparent shadow-glow-cyan/20",
    pink: "from-secondary/20 to-transparent shadow-glow-pink/20",
    green: "from-accent/20 to-transparent shadow-glow-green/20",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-xl bg-gradient-to-br backdrop-blur-sm border border-border/50 p-4 transition-all duration-300 hover:scale-105 hover:shadow-elevation cursor-pointer group",
        gradientClasses[gradient],
        className
      )}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-primary opacity-10 blur-3xl rounded-full -z-10 group-hover:opacity-20 transition-opacity" />
      
      <div className="flex items-start gap-3">
        <div className={cn(
          "p-2 rounded-lg bg-gradient-primary/10 border border-primary/20",
          gradient === "pink" && "bg-gradient-secondary/10 border-secondary/20",
          gradient === "green" && "bg-accent/10 border-accent/20"
        )}>
          <Icon className="h-5 w-5 text-primary" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{title}</h3>
          {children}
        </div>
      </div>
    </div>
  );
};
