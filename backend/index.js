const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.post('/predict', (req, res) => {
  const { ticker } = req.body;
  
  const python = spawn('python', ['elliot_predictor.py', ticker]);

  let output = '';
  let errorOutput = '';

  python.stdout.on('data', (data) => {
    output += data.toString();
  });

  python.stderr.on('data', (data) => {
    errorOutput += data.toString();
    console.error(`Python error: ${data}`);
  });

  python.on('close', (code) => {
    if (code !== 0) {
      console.error(`Python process exited with code ${code}`);
      return res.status(500).json({ error: 'Python script failed', details: errorOutput });
    }
    try {
      const parsed = JSON.parse(output);

      if (parsed.price_chart && parsed.rsi_chart && parsed.prediction) {
        res.json({
          price_chart: parsed.price_chart,
          rsi_chart: parsed.rsi_chart,
          prediction: parsed.prediction
        });
      } else {
        res.status(500).json({ error: 'Invalid Python script output format' });
      }
      
    } catch (error) {
      console.error('JSON parse error:', error);
      res.status(500).json({ error: 'Invalid JSON from Python' });
    }
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
