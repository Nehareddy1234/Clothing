import { useState, useEffect } from "react";
import axios from "axios";
import { Loader2, Trash2, Calendar } from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SavedOutfitsPage = () => {
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  
  useEffect(() => {
    fetchOutfits();
  }, []);
  
  const fetchOutfits = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/outfits/saved`);
      setOutfits(response.data);
    } catch (error) {
      console.error("Error fetching outfits:", error);
      toast.error("Failed to load saved outfits");
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/outfits/${id}`);
      setOutfits(outfits.filter(outfit => outfit.id !== id));
      toast.success("Outfit deleted");
    } catch (error) {
      console.error("Error deleting outfit:", error);
      toast.error("Failed to delete outfit");
    }
  };
  
  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };
  
  return (
    <div className="min-h-screen pt-32 px-6 md:px-12 lg:px-24 pb-24">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <h1 className="font-serif text-4xl md:text-5xl font-normal tracking-tight mb-4" data-testid="saved-heading">
            Saved Outfits
          </h1>
          <p className="text-base font-light text-muted-foreground">
            {outfits.length} saved {outfits.length === 1 ? 'outfit' : 'outfits'}
          </p>
        </div>
        
        {/* Outfits List */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-12 h-12 animate-spin" strokeWidth={1.5} />
          </div>
        ) : outfits.length === 0 ? (
          <div className="text-center py-32" data-testid="empty-state">
            <p className="text-lg text-muted-foreground">No saved outfits yet. Generate and save your first outfit!</p>
          </div>
        ) : (
          <div className="space-y-6" data-testid="saved-outfits-list">
            {outfits.map((outfit) => (
              <div
                key={outfit.id}
                className="bg-white border border-border hover:border-black transition-all duration-500 overflow-hidden"
                data-testid={`outfit-${outfit.id}`}
              >
                <div
                  className="p-8 cursor-pointer"
                  onClick={() => toggleExpand(outfit.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-serif text-2xl md:text-3xl font-normal mb-2">{outfit.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" strokeWidth={1.5} />
                          {outfit.occasion}
                        </span>
                        <span>•</span>
                        <span>{outfit.clothing_ids.length} items</span>
                      </div>
                    </div>
                    
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(outfit.id);
                      }}
                      data-testid={`delete-outfit-${outfit.id}`}
                      variant="ghost"
                      size="sm"
                      className="rounded-full"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </Button>
                  </div>
                </div>
                
                {expandedId === outfit.id && (
                  <div
                    className="px-8 pb-8 border-t border-border pt-6 animate-in fade-in slide-in-from-top-2 duration-300"
                    data-testid={`outfit-details-${outfit.id}`}
                  >
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-base font-light leading-relaxed text-zinc-800">
                        {outfit.ai_suggestion}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedOutfitsPage;