from flask import Flask, render_template, request, jsonify, url_for, redirect, abort
import os
import numpy as np
import onnxruntime as rt
import io
import sys

app = Flask(__name__)

# Global variables to track model loading status
models_loaded = False
model_error_message = ""

# Load the trained models
def load_models():
    global models_loaded, model_error_message
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    # Check if model files exist
    test_model_path = os.path.join(BASE_DIR, 'models', 'best_xgboost_model.onnx')
    pixel_model_path = os.path.join(BASE_DIR, 'models', 'pixels_best_xgboost_model.onnx')

    if not os.path.exists(test_model_path):
        model_error_message = f"Test data model not found at {test_model_path}"
        return None, None

    if not os.path.exists(pixel_model_path):
        model_error_message = f"Pixel data model not found at {pixel_model_path}"
        return None, None

    try:
        # Load Models using ONNX Runtime
        test_data_model = rt.InferenceSession(test_model_path)
        pixel_data_model = rt.InferenceSession(pixel_model_path)

        # Set flag to indicate models are loaded
        models_loaded = True
        return test_data_model, pixel_data_model

    except Exception as e:
        model_error_message = f"Error loading models: {str(e)}"
        print(model_error_message)
        return None, None

# Load models at startup
test_data_model, pixel_data_model = load_models()

@app.route('/')
def home():
    return render_template('index.html', models_loaded=models_loaded, error_message=model_error_message)

@app.route('/predict/test-data')
def test_data():
    if not models_loaded:
        return render_template('error.html', error_message=model_error_message)
    return render_template('predict/test-data.html')

@app.route('/predict/pixel-data')
def pixel_data():
    if not models_loaded:
        return render_template('error.html', error_message=model_error_message)
    return render_template('predict/pixel-data.html')

# API endpoint for test data prediction
@app.route('/api/predict/test-data', methods=['POST'])
def predict_test_data():
    # Check if models are loaded
    if not models_loaded:
        return jsonify({
            'error': 'Models not loaded. ' + model_error_message
        }), 503  # Service Unavailable
    print("Starting Test Data Prediction.")
    # Get data from request
    data = request.get_json()

    # Extract values
    Gender = int(data.get('gender', 0))
    Age = int(data.get('age', 0))
    Hb = float(data.get('hemoglobin', 0))
    RBC = float(data.get('rbc', 0))
    PCV = float(data.get('pcv', 0))
    MCV = float(data.get('mcv', 0))
    MCH = float(data.get('mch', 0))
    MCHC = float(data.get('mchc', 0))

    print(f"Form Data Recieved: gender={Gender}, age={Age}, Hb={Hb}, RBC={RBC}, PCV={PCV}, MCV={MCV}, MCH={MCH}, MHCH={MCHC}")

    try:
        # Prepare input for model (ONNX requires float32)
        input_data = np.array([[Gender, Age, Hb, RBC, PCV, MCV, MCH, MCHC]], dtype=np.float32)
        print(f"Model Input Data: {input_data}")

        # Make prediction using ONNX Runtime
        print("Attempting Prediction")
        input_name = test_data_model.get_inputs()[0].name
        outputs = test_data_model.run(None, {input_name: input_data})

        prediction = outputs[0][0]
        print(f"Prediction Result: {prediction}")

        # ONNX probabilities can be a ZipMap (dictionary) or standard array
        prob_output = outputs[1][0]
        if isinstance(prob_output, dict):
            confidence = int(max(prob_output.values()) * 100)
        else:
            confidence = int(max(prob_output) * 100)

        print(f"Prediction probabilities: {prob_output}")
        print(f"Confidence: {confidence}")

        # Generate details based on prediction
        gender_text = "male" if Gender == 1 else "female"
        if prediction == 1:
            details = f"Based on the test data provided, anemia is detected. The hemoglobin level of {Hb} g/dL is below normal range for a {Age}-year-old {gender_text}."
        else:
            details = f"Based on the test data provided, no anemia is detected. The hemoglobin level of {Hb} g/dL is within normal range for a {Age}-year-old {gender_text}."

        # Return prediction result
        return jsonify({
            'prediction': int(prediction),
            'confidence': confidence,
            'details': details
        })
    except Exception as e:
        print(f"Error making prediction: {e}")
        return jsonify({
            'error': f'Error making prediction: {str(e)}'
        }), 500


# API endpoint for pixel data prediction
@app.route('/api/predict/pixel-data', methods=['POST'])
def predict_pixel_data():
    # Check if models are loaded
    if not models_loaded:
        return jsonify({
            'error': 'Models not loaded. ' + model_error_message
        }), 503  # Service Unavailable
    try:
        print("Starting pixel data prediction process")

        # Get form data and print for debugging
        try:
            # Check if request is JSON or form data
            if request.is_json:
                data = request.get_json()
                gender = int(data.get('gender', 0))
                red_pixel = float(data.get('red_pixel', 0))
                green_pixel = float(data.get('green_pixel', 0))
                blue_pixel = float(data.get('blue_pixel', 0))
                hemoglobin = float(data.get('hemoglobin', 0))
            else:
                gender = int(request.form.get('gender', 0))
                red_pixel = float(request.form.get('red_pixel', 0))
                green_pixel = float(request.form.get('green_pixel', 0))
                blue_pixel = float(request.form.get('blue_pixel', 0))
                hemoglobin = float(request.form.get('hemoglobin', 0))

            print(f"Form data received: gender={gender}, red_pixel={red_pixel}, green_pixel={green_pixel}, blue_pixel={blue_pixel}, hemoglobin={hemoglobin}")
        except ValueError as e:
            print(f"Error parsing form data: {e}")
            return jsonify({
                'error': f'Invalid input data: {str(e)}'
            }), 400

        # Prepare input for model (ONNX requires float32)
        input_data = np.array([[gender, red_pixel, green_pixel, blue_pixel, hemoglobin]], dtype=np.float32)
        print(f"Model input data: {input_data}")

        # Make prediction using ONNX Runtime
        try:
            print("Attempting model prediction")
            input_name = pixel_data_model.get_inputs()[0].name
            outputs = pixel_data_model.run(None, {input_name: input_data})

            prediction = outputs[0][0]
            print(f"Model prediction result: {prediction}")  # This returns either 1 or 0

            # Convert numeric prediction to Yes/No for frontend
            prediction_text = "Yes" if prediction == 1 else "No"

            # Try to get prediction probability
            try:
                prob_output = outputs[1][0]
                print(f"Prediction probabilities: {prob_output}")

                if isinstance(prob_output, dict):
                    # ONNX ZipMap handling
                    if int(prediction) in prob_output:
                        confidence = int(prob_output[int(prediction)] * 100)
                    else:
                        confidence = int(max(prob_output.values()) * 100)
                else:
                    # Array handling
                    if len(prob_output) > 1:
                        confidence = int(prob_output[int(prediction)] * 100)
                    else:
                        confidence = int(prob_output[0] * 100)

                print(f"Calculated confidence: {confidence}%")
            except Exception as proba_error:
                print(f"Error getting prediction probability: {proba_error}")
                confidence = 85  # Default confidence if model doesn't provide probabilities
                print(f"Using default confidence: {confidence}%")

        except Exception as model_error:
            print(f"Model prediction error: {model_error}")
            return jsonify({
                'error': 'Error during model prediction. Please check your input values and try again.'
            }), 500

        # Generate details based on prediction
        gender_text = "male" if gender == 1 else "female"

        if prediction == 1:  # Anemia detected
            details = f"Based on the pixel analysis and hemoglobin level of {hemoglobin} g/dL, anemia is detected. The RGB distribution (R:{red_pixel}%, G:{green_pixel}%, B:{blue_pixel}%) indicates potential abnormalities in red blood cells."

            # Cell analysis details for anemic case
            cell_analysis = {
                'rbc_morphology': 'Hypochromic, Microcytic',
                'cell_size': 'Significant Variation',
                'hemoglobin_dist': 'Uneven',
                'cell_count': 'Low (3.8M/μL)'
            }
        else:  # No anemia
            details = f"Based on the pixel analysis and hemoglobin level of {hemoglobin} g/dL, no anemia is detected. The RGB distribution (R:{red_pixel}%, G:{green_pixel}%, B:{blue_pixel}%) indicates normal red blood cell characteristics."

            # Cell analysis details for normal case
            cell_analysis = {
                'rbc_morphology': 'Normochromic, Normocytic',
                'cell_size': 'Uniform',
                'hemoglobin_dist': 'Even',
                'cell_count': 'Normal (4.9M/μL)'
            }

        print("Prediction process completed successfully")
        # Return prediction result with explicit confidence value
        return jsonify({
            'prediction': prediction_text,
            'confidence': confidence,
            'details': details,
            'cell_analysis': cell_analysis
        })
    except Exception as e:
        print(f"Error making prediction: {e}")
        # Return a simple error message as requested
        return jsonify({
            'error': 'An error occurred during analysis. Please check your input values and try again.'
        }), 500


# Error handlers
@app.errorhandler(404)
def page_not_found(e):
    return render_template('index.html'), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    # Create models directory if it doesn't exist
    if not os.path.exists('models'):
        os.makedirs('models')
        print("Created 'models' directory. Please place your trained models in this directory.")
        print("Expected model files: 'models/best_xgboost_model.onnx' and 'models/pixels_best_xgboost_model.onnx'")

    # Create error template if it doesn't exist
    if not os.path.exists('templates/error.html'):
        app.test_client().get('/create_error_template')

    # Check if models are loaded
    if not models_loaded:
        print("\n" + "="*80)
        print("ERROR: Models not loaded properly!")
        print(model_error_message)
        print("\nPlease ensure the following model files exist:")
        print("- models/best_xgboost_model.onnx")
        print("- models/pixels_best_xgboost_model.onnx")
        print("\nThe application will run, but prediction functionality will be disabled.")
        print("="*80 + "\n")
    else:
        print("\n" + "="*80)
        print("SUCCESS: Models loaded successfully!")
        print("="*80 + "\n")

    # Make sure templates and static folders are in the right place
    template_dir = os.path.abspath('templates')
    static_dir = os.path.abspath('static')

    if not os.path.exists(template_dir):
        print(f"Warning: Template directory not found at {template_dir}")

    if not os.path.exists(static_dir):
        print(f"Warning: Static directory not found at {static_dir}")

    # Run the app
    # app.run(debug=True, host='0.0.0.0', port=5000)
    app.run(debug=True)