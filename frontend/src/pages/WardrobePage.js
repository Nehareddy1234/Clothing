import { useState, useEffect } from "react";
import axios from "axios";
import { Upload, Trash2, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const WardrobePage = () => {
  const [clothes, setClothes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  useEffect(() => {
    fetchClothes();
  }, []);
  
  const fetchClothes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/clothes`);
      setClothes(response.data);
    } catch (error) {
      console.error("Error fetching clothes:", error);
      toast.error("Failed to load wardrobe");
    } finally {
      setLoading(false);
    }
  };
  
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    
    setUploading(true);
    
    for (const file of files) {
      try {
        // Convert to base64
        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        await new Promise((resolve, reject) => {
          reader.onload = async () => {
            try {
              const base64 = reader.result.split(",")[1];
              await axios.post(`${API}/clothes`, { image_base64: base64 });
              resolve();
            } catch (error) {
              reject(error);
            }
          };
          reader.onerror = reject;
        });
        
        toast.success(`Uploaded ${file.name}`);
      } catch (error) {
        console.error("Error uploading file:", error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    
    setUploading(false);
    fetchClothes();
  };
  
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/clothes/${id}`);
      setClothes(clothes.filter(item => item.id !== id));
      toast.success("Item deleted");
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    }
  };
  
  return (
    <div className="min-h-screen pt-32 px-6 md:px-12 lg:px-24 pb-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <h1 className="font-serif text-4xl md:text-5xl font-normal tracking-tight mb-4" data-testid="wardrobe-heading">
            Your Wardrobe
          </h1>
          <p className="text-base font-light text-muted-foreground">
            {clothes.length} items in your collection
          </p>
        </div>
        
        {/* Upload Area */}
        <div className="mb-16" data-testid="upload-area">
          <label className="group relative block w-full aspect-[4/1] border-2 border-dashed border-border hover:border-black bg-[#FAFAFA] rounded-sm cursor-pointer transition-all duration-500 overflow-hidden">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              data-testid="file-input"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              {uploading ? (
                <>
                  <Loader2 className="w-12 h-12 animate-spin text-black" strokeWidth={1.5} />
                  <p className="text-sm uppercase tracking-widest font-medium">Processing & Cleaning Images...</p>
                </>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-black transition-transform duration-500 group-hover:scale-110" strokeWidth={1.5} />
                  <div className="text-center">
                    <p className="text-sm uppercase tracking-widest font-medium mb-1">Drop files here or click to upload</p>
                    <p className="text-xs text-muted-foreground">AI will remove backgrounds and categorize your clothing</p>
                  </div>
                </>
              )}
            </div>
          </label>
        </div>
        
        {/* Wardrobe Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-12 h-12 animate-spin" strokeWidth={1.5} />
          </div>
        ) : clothes.length === 0 ? (
          <div className="text-center py-32" data-testid="empty-state">
            <p className="text-lg text-muted-foreground">Your wardrobe is empty. Upload some clothes to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8" data-testid="wardrobe-grid">
            {clothes.map((item) => (
              <div
                key={item.id}
                className="group relative aspect-[3/4] bg-[#F5F5F5] overflow-hidden transition-all duration-500 hover:shadow-xl"
                data-testid={`clothing-item-${item.id}`}
              >
                <img
                  src={`data:image/jpeg;base64,${item.cleaned_image_base64 || item.image_base64}`}
                  alt={item.description}
                  className="w-full h-full object-cover"
                />
                
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-500 flex items-end p-4">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 w-full">
                    <p className="text-white text-sm font-medium mb-1">{item.category}</p>
                    <p className="text-white/70 text-xs mb-3">{item.color} • {item.style}</p>
                    <Button
                      onClick={() => handleDelete(item.id)}
                      data-testid={`delete-btn-${item.id}`}
                      variant="destructive"
                      size="sm"
                      className="w-full rounded-full"
                    >
                      <Trash2 className="w-3 h-3 mr-2" strokeWidth={1.5} />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WardrobePage;