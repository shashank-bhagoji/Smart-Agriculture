import sys
import pickle
import json
import os

def main():
    try:
        # Check command line arguments
        if len(sys.argv) < 8:
            print(json.dumps({
                "status": "error",
                "message": f"Required 7 arguments (N, P, K, temp, hum, ph, rain), but got {len(sys.argv) - 1}"
            }))
            sys.exit(1)
            
        # Parse inputs
        try:
            n = float(sys.argv[1])
            p = float(sys.argv[2])
            k = float(sys.argv[3])
            temp = float(sys.argv[4])
            hum = float(sys.argv[5])
            ph = float(sys.argv[6])
            rain = float(sys.argv[7])
        except ValueError:
            print(json.dumps({
                "status": "error",
                "message": "All parameters must be numerical values"
            }))
            sys.exit(1)

        # Get file paths relative to this script
        current_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(current_dir, "crop_recommendation_model.pkl")

        # Load the model
        if not os.path.exists(model_path):
            print(json.dumps({
                "status": "error",
                "message": f"Model file not found at {model_path}"
            }))
            sys.exit(1)
            
        with open(model_path, 'rb') as file:
            model = pickle.load(file)

        # Predict
        features = [[n, p, k, temp, hum, ph, rain]]
        prediction = model.predict(features)[0]

        # Return response as JSON
        print(json.dumps({
            "status": "success",
            "prediction": str(prediction)
        }))

    except Exception as e:
        print(json.dumps({
            "status": "error",
            "message": str(e)
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()
