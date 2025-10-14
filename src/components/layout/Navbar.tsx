import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Zap, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAuthenticated = false; // Replace with actual auth check

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="relative">
              <Zap className="h-7 w-7 text-primary animate-glow-pulse" />
            </div>
            <span className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
              EarnArena
            </span>
          </Link>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-secondary border-0">
                    3
                  </Badge>
                </Button>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-glass backdrop-blur-md rounded-lg border border-primary/20">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">$125.50</span>
                </div>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="sm" variant="default">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-3 animate-slide-up">
            {isAuthenticated ? (
              <>
                <div className="flex items-center justify-between p-3 bg-gradient-glass backdrop-blur-md rounded-lg border border-primary/20">
                  <span className="text-sm text-muted-foreground">Balance</span>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="text-lg font-bold">$125.50</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications
                  <Badge className="ml-auto bg-secondary border-0">3</Badge>
                </Button>
              </>
            ) : (
              <div className="space-y-2 pt-2 border-t border-border/50">
                <Link to="/auth" onClick={toggleMenu}>
                  <Button variant="ghost" size="sm" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link to="/auth" onClick={toggleMenu}>
                  <Button size="sm" className="w-full">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
