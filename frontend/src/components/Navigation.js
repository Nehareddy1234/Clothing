import { Link, useLocation } from "react-router-dom";
import { Sparkles, Shirt, Wand2, Heart } from "lucide-react";

export const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border">
      <div className="px-6 md:px-12 lg:px-24 py-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="group" data-testid="nav-logo">
            <h1 className="font-serif text-3xl font-medium tracking-tight transition-all duration-500 group-hover:tracking-wide">
              StyleMatch
              <span className="inline-block ml-2 text-[#D4FF00]">AI</span>
            </h1>
          </Link>
          
          <div className="flex items-center gap-2 md:gap-8">
            <Link
              to="/wardrobe"
              data-testid="nav-wardrobe"
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-500 ${
                isActive("/wardrobe")
                  ? "bg-black text-white"
                  : "hover:bg-secondary text-foreground"
              }`}
            >
              <Shirt className="w-4 h-4" strokeWidth={1.5} />
              <span className="hidden md:inline text-sm uppercase tracking-widest font-medium">Wardrobe</span>
            </Link>
            
            <Link
              to="/generate"
              data-testid="nav-generate"
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-500 ${
                isActive("/generate")
                  ? "bg-[#D4FF00] text-black shadow-[0_0_20px_rgba(212,255,0,0.4)]"
                  : "hover:bg-secondary text-foreground"
              }`}
            >
              <Wand2 className="w-4 h-4" strokeWidth={1.5} />
              <span className="hidden md:inline text-sm uppercase tracking-widest font-medium">Generate</span>
            </Link>
            
            <Link
              to="/saved"
              data-testid="nav-saved"
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-500 ${
                isActive("/saved")
                  ? "bg-black text-white"
                  : "hover:bg-secondary text-foreground"
              }`}
            >
              <Heart className="w-4 h-4" strokeWidth={1.5} />
              <span className="hidden md:inline text-sm uppercase tracking-widest font-medium">Saved</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;