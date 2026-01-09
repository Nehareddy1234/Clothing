import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import WardrobePage from "./pages/WardrobePage";
import OutfitGeneratorPage from "./pages/OutfitGeneratorPage";
import SavedOutfitsPage from "./pages/SavedOutfitsPage";
import Navigation from "./components/Navigation";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/wardrobe" element={<WardrobePage />} />
          <Route path="/generate" element={<OutfitGeneratorPage />} />
          <Route path="/saved" element={<SavedOutfitsPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;