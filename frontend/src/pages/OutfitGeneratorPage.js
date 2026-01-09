import { useState, useEffect } from "react";
import axios from "axios";
import { Wand2, Loader2, Check, Save, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const occasions = [
  "Casual Outing",
  "Work/Office",
  "Date Night",
  "Party/Event",
  "Formal Event",
  "Sports/Gym",
  "Beach/Vacation",
  "Brunch",
];

const OutfitGeneratorPage = () => {
  const navigate = useNavigate();
  const [clothes, setClothes] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedOccasion, setSelectedOccasion] = useState("");
  const [generating, setGenerating] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [saving, setSaving] = useState(false);
  const [outfitName, setOutfitName] = useState("");
  const [smartMatching, setSmartMatching] = useState(false);

  useEffect(() => {
    fetchClothes();
  }, []);
  
  const fetchClothes = async () => {
    try {
      const response = await axios.get(`${API}/clothes`);
      setClothes(response.data);
    } catch (error) {
      console.error("Error fetching clothes:", error);
      toast.error("Failed to load wardrobe");
    }
  };
  
  const toggleItemSelection = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };
  
  const generateOutfit = async () => {
    if (selectedItems.length === 0) {
      toast.error("Please select at least one clothing item");
      return;
    }
    
    if (!selectedOccasion) {
      toast.error("Please select an occasion");
      return;
    }
    
    try {
      setGenerating(true);
      const response = await axios.post(`${API}/outfits/generate`, {
        occasion: selectedOccasion,
        clothing_ids: selectedItems,
      });
      
      setSuggestion(response.data);
      toast.success("Outfit generated!");
    } catch (error) {
      console.error("Error generating outfit:", error);
      toast.error("Failed to generate outfit");
    } finally {
      setGenerating(false);
    }
  };
  
  const smartMatch = async () => {
    if (!selectedOccasion) {
      toast.error("Please select an occasion first");
      return;
    }

    try {
      setSmartMatching(true);
      const response = await axios.get(`${API}/outfits/smart-match/${encodeURIComponent(selectedOccasion)}`);

      setSuggestion({
        suggestion: response.data.suggestions,
        occasion: selectedOccasion,
        wardrobe_size: response.data.wardrobe_size
      });

      toast.success("Smart outfit suggestions generated!");
    } catch (error) {
      console.error("Error in smart match:", error);
      toast.error("Failed to generate smart suggestions");
    } finally {
      setSmartMatching(false);
    }
  };

  const saveOutfit = async () => {
    if (!outfitName.trim()) {
      toast.error("Please enter an outfit name");
      return;
    }

    try {
      setSaving(true);
      await axios.post(`${API}/outfits/save`, {
        name: outfitName,
        occasion: selectedOccasion,
        clothing_ids: selectedItems,
        ai_suggestion: suggestion.suggestion,
      });

      toast.success("Outfit saved!");
      setOutfitName("");
      setTimeout(() => navigate("/saved"), 1000);
    } catch (error) {
      console.error("Error saving outfit:", error);
      toast.error("Failed to save outfit");
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div className="min-h-screen pt-32 pb-24">
      <div className="px-6 md:px-12 lg:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Panel - Selection */}
          <div className="lg:col-span-7 space-y-12">
            <div>
              <h1 className="font-serif text-4xl md:text-5xl font-normal tracking-tight mb-4" data-testid="generator-heading">
                Generate Outfit
              </h1>
              <p className="text-base font-light text-muted-foreground">
                Select items and choose an occasion
              </p>
            </div>
            
            {/* Occasion Selection */}
            <div data-testid="occasion-selector">
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">Occasion</p>
              <div className="flex flex-wrap gap-3">
                {occasions.map((occasion) => (
                  <button
                    key={occasion}
                    onClick={() => setSelectedOccasion(occasion)}
                    data-testid={`occasion-${occasion.toLowerCase().replace(/\s+/g, '-')}`}
                    className={`px-6 py-3 rounded-full text-sm uppercase tracking-widest font-medium transition-all duration-500 ${
                      selectedOccasion === occasion
                        ? "bg-black text-white"
                        : "bg-secondary hover:bg-black hover:text-white"
                    }`}
                  >
                    {occasion}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Clothing Selection */}
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">
                Select Items ({selectedItems.length} selected)
              </p>
              
              {clothes.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-border rounded-sm">
                  <p className="text-base text-muted-foreground mb-4">Your wardrobe is empty</p>
                  <Button
                    onClick={() => navigate("/wardrobe")}
                    data-testid="goto-wardrobe-btn"
                    className="bg-black text-white hover:bg-zinc-800 rounded-full px-8 py-4 text-sm uppercase tracking-widest"
                  >
                    Add Clothes
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-4" data-testid="clothing-selector">
                  {clothes.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => toggleItemSelection(item.id)}
                      data-testid={`select-item-${item.id}`}
                      className={`relative aspect-[3/4] overflow-hidden transition-all duration-500 ${
                        selectedItems.includes(item.id)
                          ? "ring-4 ring-[#D4FF00] shadow-[0_0_20px_rgba(212,255,0,0.3)]"
                          : "hover:ring-2 hover:ring-black"
                      }`}
                    >
                      <img
                        src={`data:image/jpeg;base64,${item.cleaned_image_base64 || item.image_base64}`}
                        alt={item.description}
                        className="w-full h-full object-cover"
                      />
                      
                      {selectedItems.includes(item.id) && (
                        <div className="absolute top-2 right-2 w-8 h-8 bg-[#D4FF00] rounded-full flex items-center justify-center">
                          <Check className="w-5 h-5 text-black" strokeWidth={2.5} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Generate Buttons */}
            <div className="space-y-4">
              <Button
                onClick={smartMatch}
                disabled={smartMatching || !selectedOccasion}
                data-testid="smart-match-btn"
                className="w-full bg-black text-white hover:bg-zinc-800 rounded-full px-10 py-8 text-base uppercase tracking-widest font-bold transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {smartMatching ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" strokeWidth={1.5} />
                    Matching...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-3" strokeWidth={1.5} />
                    Smart Match from Wardrobe
                  </>
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">or</span>
                </div>
              </div>

              <Button
                onClick={generateOutfit}
                disabled={generating || selectedItems.length === 0 || !selectedOccasion}
                data-testid="generate-outfit-btn"
                className="w-full bg-[#D4FF00] text-black hover:bg-[#bce600] rounded-full px-10 py-8 text-base uppercase tracking-widest font-bold shadow-[0_0_20px_rgba(212,255,0,0.4)] hover:shadow-[0_0_30px_rgba(212,255,0,0.6)] transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" strokeWidth={1.5} />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-3" strokeWidth={1.5} />
                    Generate with Selected
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Right Panel - Suggestions */}
          <div className="lg:col-span-5">
            <div className="sticky top-32">
              {!suggestion ? (
                <div className="border-2 border-dashed border-border rounded-sm p-12 text-center" data-testid="no-suggestion-placeholder">
                  <Wand2 className="w-16 h-16 mx-auto mb-6 text-muted-foreground" strokeWidth={1.5} />
                  <p className="text-lg font-light text-muted-foreground">
                    Your AI suggestions will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700" data-testid="suggestion-panel">
                  <div className="bg-white border border-border p-8 rounded-sm">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-2 h-2 bg-[#D4FF00] rounded-full animate-pulse"></div>
                      <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                        AI Suggestion for {suggestion.occasion}
                      </p>
                    </div>
                    
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-base font-light leading-relaxed text-zinc-800">
                        {suggestion.suggestion}
                      </div>
                    </div>
                  </div>
                  
                  {/* Save Outfit */}
                  <div className="bg-[#FAFAFA] border border-border p-6 rounded-sm" data-testid="save-outfit-section">
                    <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">
                      Save This Outfit
                    </p>
                    <Input
                      placeholder="Enter outfit name..."
                      value={outfitName}
                      onChange={(e) => setOutfitName(e.target.value)}
                      data-testid="outfit-name-input"
                      className="mb-4 border-b border-input bg-transparent px-0 py-2 text-lg focus-visible:ring-0 focus-visible:border-black rounded-none"
                    />
                    <Button
                      onClick={saveOutfit}
                      disabled={saving || !outfitName.trim()}
                      data-testid="save-outfit-btn"
                      className="w-full bg-black text-white hover:bg-zinc-800 rounded-full px-8 py-4 text-sm uppercase tracking-widest transition-all"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" strokeWidth={1.5} />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" strokeWidth={1.5} />
                          Save Outfit
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutfitGeneratorPage;