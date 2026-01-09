from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import base64
import io
from PIL import Image
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Models
class ClothingItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    image_base64: str
    category: Optional[str] = None
    color: Optional[str] = None
    style: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ClothingItemCreate(BaseModel):
    image_base64: str

class OutfitGenerateRequest(BaseModel):
    occasion: str
    clothing_ids: List[str]

class SavedOutfit(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    occasion: str
    clothing_ids: List[str]
    ai_suggestion: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SavedOutfitCreate(BaseModel):
    name: str
    occasion: str
    clothing_ids: List[str]
    ai_suggestion: str

class OutfitSuggestion(BaseModel):
    combinations: List[dict]
    styling_tips: str
    color_analysis: str

# Helper function to analyze clothing with AI
async def analyze_clothing_with_ai(image_base64: str) -> dict:
    try:
        api_key = os.environ.get('EMERGENT_LLM_KEY', '')
        if not api_key:
            raise ValueError("EMERGENT_LLM_KEY not found")
        
        chat = LlmChat(
            api_key=api_key,
            session_id=str(uuid.uuid4()),
            system_message="You are a professional fashion stylist analyzing clothing items."
        ).with_model("openai", "gpt-5.1")
        
        image_content = ImageContent(image_base64=image_base64)
        
        user_message = UserMessage(
            text="Analyze this clothing item and provide: 1) Category (e.g., shirt, pants, dress, shoes, jacket, accessory), 2) Primary color, 3) Style (e.g., casual, formal, sporty, elegant), 4) Brief description. Format your response as: Category: [category]\nColor: [color]\nStyle: [style]\nDescription: [description]",
            file_contents=[image_content]
        )
        
        response = await chat.send_message(user_message)
        
        # Parse the AI response
        lines = response.strip().split('\n')
        result = {"category": "", "color": "", "style": "", "description": ""}
        
        for line in lines:
            if ':' in line:
                key, value = line.split(':', 1)
                key = key.strip().lower()
                value = value.strip()
                if key in result:
                    result[key] = value
        
        return result
    except Exception as e:
        logging.error(f"Error analyzing clothing: {str(e)}")
        return {"category": "unknown", "color": "unknown", "style": "casual", "description": "Clothing item"}

# Routes
@api_router.get("/")
async def root():
    return {"message": "StyleMatch AI Backend"}

@api_router.post("/clothes", response_model=ClothingItem)
async def upload_clothing(input: ClothingItemCreate):
    try:
        # Analyze the clothing with AI
        analysis = await analyze_clothing_with_ai(input.image_base64)
        
        clothing_obj = ClothingItem(
            image_base64=input.image_base64,
            category=analysis.get("category", "unknown"),
            color=analysis.get("color", "unknown"),
            style=analysis.get("style", "casual"),
            description=analysis.get("description", "Clothing item")
        )
        
        # Save to database
        doc = clothing_obj.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        
        await db.clothing_items.insert_one(doc)
        
        return clothing_obj
    except Exception as e:
        logging.error(f"Error uploading clothing: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/clothes", response_model=List[ClothingItem])
async def get_all_clothes():
    try:
        clothes = await db.clothing_items.find({}, {"_id": 0}).to_list(1000)
        
        for item in clothes:
            if isinstance(item.get('created_at'), str):
                item['created_at'] = datetime.fromisoformat(item['created_at'])
        
        return clothes
    except Exception as e:
        logging.error(f"Error fetching clothes: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/clothes/{clothing_id}")
async def delete_clothing(clothing_id: str):
    try:
        result = await db.clothing_items.delete_one({"id": clothing_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Clothing item not found")
        
        return {"message": "Clothing item deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error deleting clothing: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/outfits/generate")
async def generate_outfit(request: OutfitGenerateRequest):
    try:
        # Fetch the selected clothing items
        clothes = await db.clothing_items.find(
            {"id": {"$in": request.clothing_ids}},
            {"_id": 0}
        ).to_list(1000)
        
        if not clothes:
            raise HTTPException(status_code=404, detail="No clothing items found")
        
        # Prepare description for AI
        clothes_description = "\n".join([
            f"- {item.get('category', 'item')}: {item.get('color', 'color')} {item.get('style', 'style')}, {item.get('description', '')}"
            for item in clothes
        ])
        
        api_key = os.environ.get('EMERGENT_LLM_KEY', '')
        chat = LlmChat(
            api_key=api_key,
            session_id=str(uuid.uuid4()),
            system_message="You are an expert fashion stylist providing outfit recommendations."
        ).with_model("openai", "gpt-5.1")
        
        prompt = f"""Given these clothing items from a wardrobe:
{clothes_description}

Occasion: {request.occasion}

Provide:
1. Best outfit combinations (suggest 2-3 complete outfits)
2. Styling tips for each combination
3. Color coordination analysis

Format your response clearly with sections for each outfit combination."""
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        return {
            "suggestion": response,
            "occasion": request.occasion,
            "clothing_items": clothes
        }
    except Exception as e:
        logging.error(f"Error generating outfit: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/outfits/save", response_model=SavedOutfit)
async def save_outfit(input: SavedOutfitCreate):
    try:
        outfit_obj = SavedOutfit(
            name=input.name,
            occasion=input.occasion,
            clothing_ids=input.clothing_ids,
            ai_suggestion=input.ai_suggestion
        )
        
        doc = outfit_obj.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        
        await db.saved_outfits.insert_one(doc)
        
        return outfit_obj
    except Exception as e:
        logging.error(f"Error saving outfit: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/outfits/saved", response_model=List[SavedOutfit])
async def get_saved_outfits():
    try:
        outfits = await db.saved_outfits.find({}, {"_id": 0}).to_list(1000)
        
        for outfit in outfits:
            if isinstance(outfit.get('created_at'), str):
                outfit['created_at'] = datetime.fromisoformat(outfit['created_at'])
        
        return outfits
    except Exception as e:
        logging.error(f"Error fetching saved outfits: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/outfits/{outfit_id}")
async def delete_outfit(outfit_id: str):
    try:
        result = await db.saved_outfits.delete_one({"id": outfit_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Outfit not found")
        
        return {"message": "Outfit deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error deleting outfit: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()