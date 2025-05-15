const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config()

const app = express();
app.use(express.json());
app.use(cors());

app.post('/predict', async (req, res) => {
  const { ticker, date } = req.body;
  try {
    // Send POST request to Flask (or FastAPI) server
    const response = await axios.post(`${process.env.MODEL_URL}/predict`, { ticker, date })
    const data = response.data;
    if (data.price_chart && data.rsi_chart && data.prediction) {
      res.json({
        price_chart: data.price_chart,
        rsi_chart: data.rsi_chart,
        prediction: data.prediction
      });
    } else {
      res.status(500).json({ error: 'Invalid data received from backend service' });
    }
  } catch (error) {
    console.error('Backend communication error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch prediction from Python backend',
      details: error.response?.data || error.message
    });
  }
});

app.get('/news', async (req,res) => {
  try {
    const response = await axios.get(
      `${process.env.NEWS_API}`
    );
    return res.json({news:response.data.articles})
  }
  catch (err) {
    res.status(500).json(err)
  }
})

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
