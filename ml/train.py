import json
import numpy as np
import tensorflow as tf
import tensorflowjs as tfjs
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import os

print("TensorFlow Version:", tf.__version__)

import csv

# Define paths
DATA_PATH = "keypoint.csv"
MODEL_DIR = "../public/model"

if not os.path.exists(DATA_PATH):
    print(f"Error: {DATA_PATH} not found.")
    exit(1)

# Load data
X = []
y = []

with open(DATA_PATH, 'r') as f:
    reader = csv.reader(f)
    for row in reader:
        if len(row) == 43: # 1 label + 42 coordinates
            label = int(row[0])
            landmarks = [float(x) for x in row[1:]]
            X.append(landmarks)
            y.append(label)

X = np.array(X)
y = np.array(y)

print(f"Loaded {len(X)} samples.")

# Create label map (0=A, 1=B... 26=space, 27=del)
classes = [chr(i) for i in range(65, 91)] + ['space', 'del']
label_map = {i: label for i, label in enumerate(classes)}

os.makedirs(MODEL_DIR, exist_ok=True)
with open(os.path.join(MODEL_DIR, 'labels.json'), 'w') as f:
    json.dump(label_map, f)
print("Saved labels mapping to", os.path.join(MODEL_DIR, 'labels.json'))

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Build a robust MLP (Multi-Layer Perceptron) for 2D landmarks (42 inputs)
model = tf.keras.Sequential([
    tf.keras.layers.InputLayer(input_shape=(42,)),
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.Dropout(0.2),
    tf.keras.layers.Dense(64, activation='relu'),
    tf.keras.layers.Dropout(0.2),
    tf.keras.layers.Dense(28, activation='softmax')
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
