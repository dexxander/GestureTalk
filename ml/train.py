import json
import numpy as np
import tensorflow as tf
import tensorflowjs as tfjs
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import os

print("TensorFlow Version:", tf.__version__)

# Define paths
DATA_PATH = "gesture_dataset.json" # Users should rename their downloaded file to this or run script with this name
MODEL_DIR = "../public/model"

if not os.path.exists(DATA_PATH):
    print(f"Error: {DATA_PATH} not found.")
    print("Please go to the Data Studio in the app, collect your dataset, and rename the downloaded file to 'gesture_dataset.json' and place it in the 'ml' folder.")
    exit(1)

# Load data
with open(DATA_PATH, 'r') as f:
    data = json.load(f)

# Extract features and labels
X = []
y = []

for item in data:
    if len(item['landmarks']) == 63: # Ensure valid frame
        X.append(item['landmarks'])
        y.append(item['label'])

X = np.array(X)
y = np.array(y)

print(f"Loaded {len(X)} samples.")

# Encode labels (A-Z)
encoder = LabelEncoder()
y_encoded = encoder.fit_transform(y)
num_classes = len(encoder.classes_)

# Save the label mapping so the JS side knows what output index 0, 1, etc. means
label_map = {i: label for i, label in enumerate(encoder.classes_)}
os.makedirs(MODEL_DIR, exist_ok=True)
with open(os.path.join(MODEL_DIR, 'labels.json'), 'w') as f:
    json.dump(label_map, f)
print("Saved labels mapping to", os.path.join(MODEL_DIR, 'labels.json'))

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)

# Build a robust MLP (Multi-Layer Perceptron) for 3D landmarks
model = tf.keras.Sequential([
    tf.keras.layers.InputLayer(input_shape=(63,)),
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.Dropout(0.2),
    tf.keras.layers.Dense(64, activation='relu'),
    tf.keras.layers.Dropout(0.2),
    tf.keras.layers.Dense(num_classes, activation='softmax')
])

model.compile(optimizer='adam',
              loss='sparse_categorical_crossentropy',
              metrics=['accuracy'])

print("Training Model...")
# Train model
history = model.fit(
    X_train, y_train,
    epochs=50,
    batch_size=32,
    validation_data=(X_test, y_test)
)

# Evaluate
test_loss, test_acc = model.evaluate(X_test, y_test)
print(f"Test Accuracy: {test_acc*100:.2f}%")

# Save the model to TFJS format so the web app can use it directly
print("Exporting model to TensorFlow.js format...")
tfjs.converters.save_keras_model(model, MODEL_DIR)

print(f"Success! Model files saved to {os.path.abspath(MODEL_DIR)}.")
print("You can now refresh your GestureTalk app to use the Machine Learning model.")
