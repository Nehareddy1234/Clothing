import requests
import sys
import base64
import io
from PIL import Image
from datetime import datetime
import json

class StyleMatchAPITester:
    def __init__(self, base_url="https://outfit-genius-135.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.uploaded_items = []
        self.saved_outfits = []

    def run_test(self, name, method, endpoint, expected_status, data=None, timeout=30):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=timeout)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=timeout)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                return False, {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timeout after {timeout}s")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def create_test_image_base64(self):
        """Create a simple test image and convert to base64"""
        # Create a simple colored image (not solid color as per requirements)
        img = Image.new('RGB', (200, 200), color='white')
        
        # Add some pattern to make it a real image with features
        pixels = img.load()
        for i in range(200):
            for j in range(200):
                # Create a simple pattern
                if (i + j) % 20 < 10:
                    pixels[i, j] = (100, 150, 200)  # Light blue
                else:
                    pixels[i, j] = (200, 100, 150)  # Light pink
        
        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format='JPEG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        return img_str

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        success, response = self.run_test(
            "Root Endpoint",
            "GET",
            "",
            200
        )
        return success

    def test_upload_clothing(self):
        """Test uploading a clothing item"""
        image_base64 = self.create_test_image_base64()
        
        success, response = self.run_test(
            "Upload Clothing Item",
            "POST",
            "clothes",
            200,
            data={"image_base64": image_base64},
            timeout=60  # AI analysis might take longer
        )
        
        if success and 'id' in response:
            self.uploaded_items.append(response['id'])
            print(f"   Uploaded item ID: {response['id']}")
            print(f"   Category: {response.get('category', 'N/A')}")
            print(f"   Color: {response.get('color', 'N/A')}")
            print(f"   Style: {response.get('style', 'N/A')}")
        
        return success

    def test_get_all_clothes(self):
        """Test getting all clothing items"""
        success, response = self.run_test(
            "Get All Clothes",
            "GET",
            "clothes",
            200
        )
        
        if success:
            print(f"   Found {len(response)} clothing items")
        
        return success

    def test_generate_outfit(self):
        """Test generating outfit suggestions"""
        if not self.uploaded_items:
            print("❌ No uploaded items to test outfit generation")
            return False
        
        success, response = self.run_test(
            "Generate Outfit",
            "POST",
            "outfits/generate",
            200,
            data={
                "occasion": "Casual Outing",
                "clothing_ids": self.uploaded_items[:2]  # Use first 2 items
            },
            timeout=60  # AI generation might take longer
        )
        
        if success:
            print(f"   Generated suggestion for: {response.get('occasion', 'N/A')}")
            print(f"   Suggestion length: {len(response.get('suggestion', ''))}")
        
        return success

    def test_save_outfit(self):
        """Test saving an outfit"""
        if not self.uploaded_items:
            print("❌ No uploaded items to test outfit saving")
            return False
        
        success, response = self.run_test(
            "Save Outfit",
            "POST",
            "outfits/save",
            200,
            data={
                "name": f"Test Outfit {datetime.now().strftime('%H%M%S')}",
                "occasion": "Work/Office",
                "clothing_ids": self.uploaded_items[:2],
                "ai_suggestion": "This is a test outfit suggestion from the API test."
            }
        )
        
        if success and 'id' in response:
            self.saved_outfits.append(response['id'])
            print(f"   Saved outfit ID: {response['id']}")
        
        return success

    def test_get_saved_outfits(self):
        """Test getting all saved outfits"""
        success, response = self.run_test(
            "Get Saved Outfits",
            "GET",
            "outfits/saved",
            200
        )
        
        if success:
            print(f"   Found {len(response)} saved outfits")
        
        return success

    def test_delete_clothing(self):
        """Test deleting a clothing item"""
        if not self.uploaded_items:
            print("❌ No uploaded items to test deletion")
            return False
        
        item_to_delete = self.uploaded_items[0]
        success, response = self.run_test(
            "Delete Clothing Item",
            "DELETE",
            f"clothes/{item_to_delete}",
            200
        )
        
        if success:
            self.uploaded_items.remove(item_to_delete)
            print(f"   Deleted item ID: {item_to_delete}")
        
        return success

    def test_delete_outfit(self):
        """Test deleting a saved outfit"""
        if not self.saved_outfits:
            print("❌ No saved outfits to test deletion")
            return False
        
        outfit_to_delete = self.saved_outfits[0]
        success, response = self.run_test(
            "Delete Saved Outfit",
            "DELETE",
            f"outfits/{outfit_to_delete}",
            200
        )
        
        if success:
            self.saved_outfits.remove(outfit_to_delete)
            print(f"   Deleted outfit ID: {outfit_to_delete}")
        
        return success

def main():
    print("🚀 Starting StyleMatch API Tests...")
    print("=" * 50)
    
    tester = StyleMatchAPITester()
    
    # Test sequence
    tests = [
        ("Root Endpoint", tester.test_root_endpoint),
        ("Upload Clothing #1", tester.test_upload_clothing),
        ("Upload Clothing #2", tester.test_upload_clothing),
        ("Get All Clothes", tester.test_get_all_clothes),
        ("Generate Outfit", tester.test_generate_outfit),
        ("Save Outfit", tester.test_save_outfit),
        ("Get Saved Outfits", tester.test_get_saved_outfits),
        ("Delete Clothing", tester.test_delete_clothing),
        ("Delete Outfit", tester.test_delete_outfit),
    ]
    
    for test_name, test_func in tests:
        try:
            test_func()
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {str(e)}")
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())