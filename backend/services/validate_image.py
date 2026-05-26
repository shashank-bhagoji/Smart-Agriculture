import sys
import json
import os
import warnings
warnings.filterwarnings("ignore")
import numpy as np
from PIL import Image

def main():
    try:
        # Check command line arguments
        if len(sys.argv) < 2:
            print(json.dumps({
                "status": "error",
                "message": "Required 1 argument: absolute path to image file"
            }))
            sys.exit(1)
            
        img_path = sys.argv[1]
        
        # Verify image path
        if not os.path.exists(img_path):
            print(json.dumps({
                "status": "error",
                "message": f"Image file not found at: {img_path}"
            }))
            sys.exit(1)
            
        # Load the image
        img = Image.open(img_path).convert('RGB')
        width, height = img.size
        
        # 1. Unique color count & Flatness in resized image
        img_small = img.resize((100, 100))
        
        # Use a safe way to get pixel data that is compatible with all Pillow versions
        pixels = list(img_small.getdata())
        unique_colors = len(set(pixels))
        
        # Calculate horizontal and vertical color flatness
        arr = np.array(img_small, dtype=np.int32)
        diff_h = np.sum(np.abs(arr[:, 1:] - arr[:, :-1]), axis=2)
        diff_v = np.sum(np.abs(arr[1:, :] - arr[:-1, :]), axis=2)
        
        zero_diffs_h = np.sum(diff_h == 0)
        zero_diffs_v = np.sum(diff_v == 0)
        pct_flat = ((zero_diffs_h / diff_h.size) + (zero_diffs_v / diff_v.size)) / 2.0 * 100.0
        
        # 2. Plant Hue Analysis (Green, Yellow, Brown, Red, Orange)
        hsv_img = img_small.convert('HSV')
        hsv_data = list(hsv_img.getdata())
        
        plant_pixel_count = 0
        total_pixels = len(hsv_data)
        
        for h, s, v in hsv_data:
            # Hue in PIL HSV: H=0..255 (maps to 0..360 deg)
            # S=0..255, V=0..255
            # Ignore very desaturated (grayscale/white/black) or extremely dark colors
            if s > 25 and v > 25:
                # Green / Light Green / Yellow-Green: 38 deg to 160 deg -> H range 27 to 113
                # Yellow / Brown / Orange: 10 deg to 38 deg -> H range 7 to 27
                # Red: 0 to 10 deg -> H range 0 to 7, and 350 to 360 deg -> H range 248 to 255
                if (7 <= h <= 113) or (0 <= h < 7) or (248 <= h <= 255):
                    plant_pixel_count += 1
                    
        pct_plant_colors = (plant_pixel_count / total_pixels) * 100.0
        
        # Heuristics for rejecting screenshots and digital graphics
        is_valid = True
        reject_reason = ""
        
        # A real camera close-up of a leaf has at least 8.0% of plant colors.
        # Screenshots or IDE codes have very low plant hues (typically < 3.0%).
        if pct_plant_colors < 8.0:
            is_valid = False
            reject_reason = "Invalid Leaf Image: The uploaded image does not contain plant-like colors. Please upload a clear camera photo of a crop leaf."
        
        # Extremely flat images (large contiguous areas of exact identical color) are screenshots or graphics.
        elif pct_flat > 25.0 and unique_colors < 3500:
            is_valid = False
            reject_reason = "Invalid Leaf Image: The uploaded file appears to be a screenshot or digital graphic. Please upload a genuine camera photo of a crop leaf."
            
        print(json.dumps({
            "status": "success",
            "is_valid": is_valid,
            "reject_reason": reject_reason,
            "metrics": {
                "width": width,
                "height": height,
                "pct_plant_colors": round(pct_plant_colors, 2),
                "pct_flat": round(pct_flat, 2),
                "unique_colors": unique_colors
            }
        }))
        
    except Exception as e:
        print(json.dumps({
            "status": "error",
            "message": str(e)
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()
