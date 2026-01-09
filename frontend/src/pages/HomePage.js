import { useNavigate } from "react-router-dom";
import { Upload, Sparkles, Wand2, Heart } from "lucide-react";
import { Button } from "../components/ui/button";

const HomePage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen pt-32">
      {/* Hero Section */}
      <section className="px-6 md:px-12 lg:px-24 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-6">
              <h1 className="font-serif text-6xl md:text-8xl font-medium tracking-tight leading-[0.9]" data-testid="hero-heading">
                AI-Powered
                <br />
                <span className="italic">Outfit</span>
                <br />
                Matching
              </h1>
              <p className="text-lg md:text-xl font-light leading-relaxed text-zinc-800 max-w-xl">
                Upload your wardrobe. Let AI create stunning outfit combinations tailored for any occasion.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => navigate("/wardrobe")}
                data-testid="cta-upload-btn"
                className="bg-black text-white hover:bg-zinc-800 rounded-full px-10 py-6 text-sm uppercase tracking-widest font-medium transition-all duration-500 hover:scale-105"
              >
                <Upload className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Start Building
              </Button>
              
              <Button
                onClick={() => navigate("/generate")}
                data-testid="cta-generate-btn"
                className="bg-[#D4FF00] text-black hover:bg-[#bce600] rounded-full px-10 py-6 text-sm uppercase tracking-widest font-bold shadow-[0_0_20px_rgba(212,255,0,0.4)] hover:shadow-[0_0_30px_rgba(212,255,0,0.6)] transition-all duration-500"
              >
                <Wand2 className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Generate Outfits
              </Button>
            </div>
          </div>
          
          <div className="lg:col-span-6">
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
              <img
                src="https://images.unsplash.com/photo-1619678681136-669acf3b3477?crop=entropy&cs=srgb&fm=jpg&q=85"
                alt="Fashion model"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="px-6 md:px-12 lg:px-24 py-32 bg-[#FAFAFA]" data-testid="features-section">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl font-normal tracking-tight mb-16 text-center">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4 text-center" data-testid="feature-upload">
              <div className="w-16 h-16 mx-auto bg-black rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-white" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl md:text-3xl font-serif font-normal">Upload</h3>
              <p className="text-base font-light leading-relaxed text-zinc-800">
                Upload any clothing photo. AI automatically removes backgrounds, isolates the garment, and categorizes each piece perfectly.
              </p>
            </div>

            <div className="space-y-4 text-center" data-testid="feature-generate">
              <div className="w-16 h-16 mx-auto bg-[#D4FF00] rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-black" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl md:text-3xl font-serif font-normal">Smart Match</h3>
              <p className="text-base font-light leading-relaxed text-zinc-800">
                AI analyzes your entire wardrobe to suggest perfectly coordinated outfits. Get color analysis, styling tips, and recommendations for missing pieces.
              </p>
            </div>
            
            <div className="space-y-4 text-center" data-testid="feature-save">
              <div className="w-16 h-16 mx-auto bg-black rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-white" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl md:text-3xl font-serif font-normal">Save</h3>
              <p className="text-base font-light leading-relaxed text-zinc-800">
                Save your favorite outfits for quick access. Never struggle with "what to wear" again.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;