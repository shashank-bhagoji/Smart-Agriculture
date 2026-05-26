import sys
import json
import os
import numpy as np
from PIL import Image

# Set TensorFlow logging to minimum to avoid long logs during node execution
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import tensorflow as tf

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

        # Get file paths relative to this script
        current_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(current_dir, "crop_disease_model.h5")
        classes_path = os.path.join(current_dir, "disease_classes.json")

        # Verify model files exist
        if not os.path.exists(model_path):
            print(json.dumps({
                "status": "error",
                "message": f"Model file not found at: {model_path}"
            }))
            sys.exit(1)
            
        if not os.path.exists(classes_path):
            print(json.dumps({
                "status": "error",
                "message": f"Class names JSON file not found at: {classes_path}"
            }))
            sys.exit(1)

        # Load class names
        with open(classes_path, 'r') as f:
            class_names = json.load(f)

        # Load the model
        model = tf.keras.models.load_model(model_path, compile=False)

        # Load and preprocess the leaf image
        img = Image.open(img_path).convert('RGB')
        img = img.resize((224, 224))
        
        # Keep raw [0, 255] pixels since the model has a built-in Rescaling layer
        img_array = np.array(img, dtype=np.float32)
        img_array = np.expand_dims(img_array, axis=0) # Add batch dimension

        # Run prediction
        predictions = model.predict(img_array, verbose=0)
        pred_idx = np.argmax(predictions[0])
        confidence = float(predictions[0][pred_idx])
        predicted_class = class_names[pred_idx]

        # Return response as JSON
        print(json.dumps({
            "status": "success",
            "prediction": predicted_class,
            "confidence": confidence
        }))

    except Exception as e:
        print(json.dumps({
            "status": "error",
            "message": str(e)
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()
