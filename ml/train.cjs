const fs = require('fs');
const tf = require('@tensorflow/tfjs'); // Pure JS tensorflow

async function train() {
  console.log("Loading dataset...");
  const csvData = fs.readFileSync('../keypoint.csv', 'utf8');
  const lines = csvData.trim().split('\n');
  
  const X = [];
  const y = [];
  
  for (const line of lines) {
    const row = line.trim().split(',');
    if (row.length >= 43 && row[1] !== '') { // Take first 42 features
      y.push(parseInt(row[0], 10));
      X.push(row.slice(1, 43).map(val => parseFloat(val)));
    }
  }

  console.log(`Loaded ${X.length} samples.`);

  // Create labels map
  const classes = Array.from({length: 26}, (_, i) => String.fromCharCode(65 + i));
  classes.push('space', 'del');
  
  const labelMap = {};
  classes.forEach((label, i) => { labelMap[i] = label; });
  
  if (!fs.existsSync('../public/model')) {
    fs.mkdirSync('../public/model', { recursive: true });
  }
  fs.writeFileSync('../public/model/labels.json', JSON.stringify(labelMap));

  console.log("Building model...");
  const model = tf.sequential();
  model.add(tf.layers.dense({inputShape: [42], units: 128, activation: 'relu'}));
  model.add(tf.layers.dropout({rate: 0.2}));
  model.add(tf.layers.dense({units: 64, activation: 'relu'}));
  model.add(tf.layers.dropout({rate: 0.2}));
  model.add(tf.layers.dense({units: 28, activation: 'softmax'}));

  model.compile({
    optimizer: 'adam',
    loss: 'sparseCategoricalCrossentropy',
    metrics: ['accuracy']
  });

  const xs = tf.tensor2d(X);
  const ys = tf.tensor1d(y, 'float32');

  console.log("Training model... (This might take a minute in JS)");
  await model.fit(xs, ys, {
    epochs: 15, // Reduced slightly for speed in pure JS
    batchSize: 128,
    validationSplit: 0.2,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(`Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}, accuracy = ${logs.acc.toFixed(4)}`);
      }
    }
  });

  console.log("Saving model...");
  await model.save(tf.io.withSaveHandler(async artifacts => {
    // Generate valid TFJS model.json structure
    const modelJson = {
      format: "layers-model",
      generatedBy: "TensorFlow.js tfjs-layers v4.10.0",
      convertedBy: null,
      modelTopology: artifacts.modelTopology,
      weightsManifest: [
        {
          paths: ["model.weights.bin"],
          weights: artifacts.weightSpecs
        }
      ]
    };
    fs.writeFileSync('../public/model/model.json', JSON.stringify(modelJson));
    fs.writeFileSync('../public/model/model.weights.bin', Buffer.from(artifacts.weightData));
    return {modelArtifactsInfo: {dateSaved: new Date(), modelTopologyType: 'JSON'}};
  }));
  console.log("Done! Model saved to public/model");
}

train().catch(console.error);
