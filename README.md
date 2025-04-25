# AnemiaX: A Flask Web App for Anemia Prediction using Clinical and Image Data

AnemiaX is a dual-model web application designed to predict anemia disease using two types of inputs:
- Clinical test data (e.g. Hemoglobin levels, Hematocrit, RBC counts)
- Image data (based on Red, Green, and Blue pixel percentages)

This project uses machine learning and deep learning models for prediction, integrated into a seamless, responsive, and visually appealing Flask web application.

##  Features

-  Predict anemia from standard clinical test inputs
-  Predict anemia based on pixel color analysis of images
-  Flask backend with a clean HTML, CSS, and JavaScript frontend
-  Integrated data preprocessing, SMOTE, and hyperparameter tuning
-  Uses SVM, Random Forest, Logistic Regression, XGBoost, and deep learning models
-  Deep learning models built using TensorFlow/Keras
-  Modular structure for easy deployment and scalability
-  Access it here: https://mycodespaceio.pythonanywhere.com/

---

## ML and DL Models Used

- Logistic Regression, SVC, Decision Tree, Random Forest, XGBoost
- Deep Neural Networks using Keras with LSTM, GRU, and Conv1D layers
- SMOTE used for handling class imbalance
- StandardScaler and MinMaxScaler for feature scaling

---

## Dataset

- **Clinical Test Data**: Includes features like Hemoglobin, Hematocrit, MCV, MCH, etc.
- **Image Data**: Converted image pixel data to RGB percentages to use as input for prediction

> Note: Models are still under active development as we're still collecting data.

---

## How to Run Locally

1. **Clone the Repository**

```bash
  git clone https://github.com/yourusername_here/anemia-detection-using-machine-learning.git
  cd anemia-detection-using-machine-learning
```

2. **Create a Virtual Environment**

```bash
  python -m venv venv
  source venv/bin/activate  # On Windows use `venv\Scripts\activate`
```

3. **Install Dependencies**

```bash
  pip install -r requirements.txt
```

4. Run The App
```bash
  python app.py
```
> App will be live at: http://127.0.0.1:5000/
---

## Frontend Design

  - Fully responsive HTML/CSS layout
  - Vanilla JavaScript for smooth transitions and validation
  - Clean UI/UX design for better accessibility and flow
---

## Future Improvements

  - Integrate SHAP for model explainability
  - Add user authentication system
  - Deploy to cloud (Render, Heroku, or AWS)
  - Add PDF report download after prediction
---

#  License
This project is open-source and available under the [MIT License](LICENSE).

