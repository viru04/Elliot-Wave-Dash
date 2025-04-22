const express = require('express');
const axios = require('axios');
const { RSI } = require('technicalindicators');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Using the provided Alpha Vantage API key
const API_KEY = 'XTW5ANMPWIM01T9Y';

const fetchHistoricalData = async (ticker) => {
  try {
    console.log(`Fetching data for ${ticker}...`);
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&apikey=${API_KEY}`
    );
    console.log('Full API Response:', JSON.stringify(response.data, null, 2));
    const timeSeries = response.data['Time Series (Daily)'];
    if (!timeSeries || Object.keys(timeSeries).length === 0) {
      throw new Error(`No time series data for ${ticker}`);
    }
    const dates = Object.keys(timeSeries).reverse(); // Latest first (strings like "2023-01-01")
    const priceData = dates.map(date => ({
      x: new Date(date),
      y: parseFloat(timeSeries[date]['4. close'])
    })).filter(d => d.y && !isNaN(d.y));
    console.log('Raw dates length:', dates.length, 'Valid price data length:', priceData.length, 'Sample:', priceData.slice(0, 2));
    if (priceData.length < 60) { // Increased to 60 for better analysis
      throw new Error(`Insufficient valid price data for ${ticker}: ${priceData.length}`);
    }
    return { dates, priceData };
  } catch (error) {
    console.error('Error fetching historical data for', ticker, ':', error.message, error.response?.data || '');
    throw error;
  }
};

const calculateRSI = (prices, period = 14) => {
  const validPrices = prices.filter(p => p !== null && !isNaN(p));
  console.log('Calculating RSI with valid prices:', validPrices.length, 'Full prices:', validPrices);
  return validPrices.length >= period ? RSI.calculate({ period, values: validPrices }) : [];
};

// Linear regression for trend with normalization
const calculateSlope = (x, y) => {
  const n = x.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumX2 += x[i] * x[i];
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const volatility = Math.std(y); // Approximate volatility as standard deviation
  return slope / (volatility || 1); // Normalize by volatility
};

Math.std = function(arr) {
  const n = arr.length;
  const mean = arr.reduce((a, b) => a + b) / n;
  return Math.sqrt(arr.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
};

const detectCurrentWave = (priceData, rsiData, ticker) => {
  if (priceData.length < 60 || rsiData.length < 60) return 'Unknown';

  const prices = priceData.map(d => d.y).slice(-60); // Last 60 days
  const rsiValues = rsiData.slice(-60); // Last 60 RSI values
  const dates = priceData.map(d => d.x.getTime()).slice(-60); // Use priceData for dates

  // Calculate normalized trend
  const slope = calculateSlope(dates, prices);
  const avgRSI = rsiValues.reduce((a, b) => a + b, 0) / rsiValues.length;
  const maxRSI = Math.max(...rsiValues);
  const minRSI = Math.min(...rsiValues);

  // Determine trend strength and RSI extremes
  const isStrongUptrend = slope > 0.002; // Further relaxed threshold
  const isStrongDowntrend = slope < -0.002; // Further relaxed threshold
  const isOverbought = avgRSI > 55; // Relaxed threshold
  const isOversold = avgRSI < 45; // Relaxed threshold

  console.log(`Ticker: ${ticker}, Slope: ${slope}, Avg RSI: ${avgRSI}, Max RSI: ${maxRSI}, Min RSI: ${minRSI}, Uptrend: ${isStrongUptrend}, Downtrend: ${isStrongDowntrend}, Overbought: ${isOverbought}, Oversold: ${isOversold}`);

  // Enhanced heuristic based on Elliott Wave rules
  if (isStrongUptrend && isOversold) return 'III'; // Impulsive wave after correction
  if (isStrongUptrend && !isOverbought) return 'V'; // Final impulsive wave
  if (isStrongDowntrend && isOverbought) return 'IV'; // Corrective wave
  if (isStrongDowntrend && !isOversold) return 'II'; // Another corrective wave
  return 'I'; // Default to start of cycle if unclear
};

const predictNextWave = (currentWave) => {
  const waveCycle = ['I', 'II', 'III', 'IV', 'V'];
  const currentIndex = waveCycle.indexOf(currentWave);
  if (currentIndex === -1) return 'I'; // Start cycle if unknown
  const nextIndex = (currentIndex + 1) % waveCycle.length;
  return waveCycle[nextIndex];
};

const predictWave = (priceData, dates, ticker) => {
  const prices = priceData.map(d => d.y);
  console.log('Predicting wave with prices length:', prices.length, 'Full prices:', prices);

  if (prices.length < 60) {
    console.log('Insufficient data points:', prices.length);
    return { prediction: {}, rsi: [], rsiData: [] };
  }

  const rsiValues = calculateRSI(prices);
  console.log('RSI values length:', rsiValues.length, 'Full RSI:', rsiValues);
  const lastPrice = prices[prices.length - 1];
  const priceRange = Math.max(...prices.slice(-60)) - Math.min(...prices.slice(-60)); // Last 60 days range
  const trendFactor = calculateSlope(priceData.map(d => d.x.getTime()).slice(-60), prices.slice(-60)) > 0 ? 0.618 : 0.382; // Uptrend: 61.8%, Downtrend: 38.2%
  const predictedIncrease = priceRange * trendFactor; // Dynamic Fibonacci based on trend
  const predictedEnd = lastPrice + (trendFactor > 0.5 ? predictedIncrease : -predictedIncrease); // Up or down
  const lastDate = dates[dates.length - 1];
  const predictedEndDate = new Date(new Date(lastDate).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const currentWave = detectCurrentWave(priceData, rsiValues, ticker);
  const predictedWave = predictNextWave(currentWave); // Return numerical wave directly

  const prediction = {
    start: lastPrice,
    end: predictedEnd,
    startDate: lastDate,
    endDate: predictedEndDate,
    wave: predictedWave // Return numerical wave (I, II, III, IV, V)
  };

  const rsiDataPoints = dates.map((date, i) => ({ x: new Date(date), y: rsiValues[i] || null }));
  return { prediction, rsi: rsiValues, priceData, rsiData: rsiDataPoints };
};

app.post('/predict', async (req, res) => {
  const { ticker } = req.body;

  try {
    const { dates, priceData } = await fetchHistoricalData(ticker);
    const { prediction, rsi, rsiData } = predictWave(priceData, dates, ticker);

    if (!prediction.start) {
      throw new Error(`No prediction generated for ${ticker}`);
    }

    res.json({ price_data: priceData, rsi_data: rsiData, prediction });
  } catch (error) {
    console.error('Error processing prediction for', ticker, ':', error.message, 'Stack:', error.stack);
    res.status(500).json({ error: 'Failed to process prediction', details: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});