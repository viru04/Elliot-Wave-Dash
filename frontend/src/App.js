import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink } from 'react-router-dom';
import Plot from 'react-plotly.js';
import axios from 'axios';
import { ScaleLoader } from 'react-spinners'
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Stack,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import './App.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="logo">EW</span> Elliott Wave Dashboard
      </div>
      <ul className="nav-links">
        <li>
          <NavLink exact to="/" activeClassName="active">Home</NavLink>
        </li>
        <li>
          <NavLink to="/tickers" activeClassName="active">Market Data</NavLink>
        </li>
        <li>
          <NavLink to="/prediction" activeClassName="active">Predictions</NavLink>
        </li>
      </ul>
    </nav>
  );
};

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Elliott Wave Dashboard </h3>
          <p>Global Leader in Financial Predictions</p>
        </div>
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/tickers">Market Data</a></li>
            <li><a href="/prediction">Predictions</a></li>
            <li><a href="#">About Us</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Contact</h3>
          <p>Email: info@elliottwave.com</p>
          <p>Phone: +1-800-ELLWAVE</p>
          <div className="social-links">
            <a href="#">FB</a>
            <a href="#">TW</a>
            <a href="#">LI</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 Elliott Wave Solutions. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

const Home = () => {
  const [news, setNews] = useState([]);
  const [loading,setLoading]=useState(false)
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true)
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/news`
        );
        setNews(response.data.news);
        setLoading(false)
      } catch (error) {
        setLoading(false)
        console.error('Error fetching news:', error);
        setNews([{ title: 'Error', description: 'Failed to fetch news' }]);
      }
    };
    fetchNews();
  }, []);

  return (
    <div className="page-content">
      <header className="hero">
        <h1 className="hero-title">Welcome to Elliott Wave Dashboard</h1>
        <p className="hero-subtitle">Latest Market News</p>
      </header>
      <div className="content-grid">
        <div className="card news-card">
          {loading && <div style={{display:'flex',alignItems:'center',justifyContent:'center'}}><ScaleLoader
            color="red"
            loading={true}
            size={150}
            aria-label="Loading Spinner"
            data-testid="loader"
          /></div>}
          {!loading && news.map((article, index) => (
            <div key={index} className="news-item">
              <img src={article.urlToImage || 'https://via.placeholder.com/300x200'} alt={article.title} className="news-image" />
              <div>
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="news-title">
                  {article.title || 'No Title'}
                </a>
                <p className="news-description">{article.description || 'No Description'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Tickers = () => {
  const [tickers] = useState([
    // Foreign Stocks
    { Ticker: 'AAPL', Company: 'Apple Inc.', Sector: 'Technology', 'Market Cap': '$2.8T', 'Current Price': '$170' },
    { Ticker: 'MSFT', Company: 'Microsoft Corporation', Sector: 'Technology', 'Market Cap': '$2.6T', 'Current Price': '$310' },
    { Ticker: 'GOOGL', Company: 'Alphabet Inc.', Sector: 'Technology', 'Market Cap': '$1.7T', 'Current Price': '$140' },
    { Ticker: 'AMZN', Company: 'Amazon.com, Inc.', Sector: 'Consumer Discretionary', 'Market Cap': '$1.4T', 'Current Price': '$120' },
    { Ticker: 'META', Company: 'Meta Platforms, Inc.', Sector: 'Communication Services', 'Market Cap': '$900B', 'Current Price': '$330' },
    { Ticker: 'TSLA', Company: 'Tesla, Inc.', Sector: 'Consumer Discretionary', 'Market Cap': '$800B', 'Current Price': '$250' },

    // Indian Stocks
    { Ticker: 'TCS.NS', Company: 'Tata Consultancy Services', Sector: 'Technology', 'Market Cap': '₹14T', 'Current Price': '₹3700' },
    { Ticker: 'RELIANCE.NS', Company: 'Reliance Industries', Sector: 'Energy', 'Market Cap': '₹19T', 'Current Price': '₹2900' },
    { Ticker: 'HDFCBANK.NS', Company: 'HDFC Bank', Sector: 'Financial Services', 'Market Cap': '₹11T', 'Current Price': '₹1550' },
    { Ticker: 'INFY.NS', Company: 'Infosys Limited', Sector: 'Technology', 'Market Cap': '₹6T', 'Current Price': '₹1400' },
    { Ticker: 'ICICIBANK.NS', Company: 'ICICI Bank', Sector: 'Financial Services', 'Market Cap': '₹7T', 'Current Price': '₹1100' },
  ]);

  return (
    <div className="page-content">
      <header className="page-header">
        <h1 className="page-title">Market Data</h1>
        <p className="page-subtitle">Comprehensive Stock Insights</p>
      </header>

      <div className="content-grid">
        <div className="card data-card">
          <table className="ticker-table">
            <thead>
              <tr>
                <th>Ticker</th>
                <th>Company</th>
                <th>Sector</th>
                <th>Market Cap</th>
                <th>Current Price</th>
              </tr>
            </thead>
            <tbody>
              {tickers.map((ticker, index) => (
                <tr key={index}>
                  <td>{ticker.Ticker}</td>
                  <td>{ticker.Company}</td>
                  <td>{ticker.Sector}</td>
                  <td>{ticker['Market Cap']}</td>
                  <td>{ticker['Current Price']}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Prediction = () => {
  const [ticker, setTicker] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [prediction, setPrediction] = useState('');
  const [priceChart, setPriceChart] = useState('');
  const [rsiChart, setRsiChart] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFetch = async () => {
    if (!ticker.trim() || !selectedDate) {
      setError('Please enter a valid ticker symbol and choose a date.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formattedDate = dayjs(selectedDate).format('YYYY-MM-DD');

      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/predict`, {
        ticker: ticker.toUpperCase(),
        date: formattedDate,
      });

      const data = response.data;

      if (data.price_chart && data.rsi_chart && data.prediction) {
        setPriceChart(data.price_chart);
        setRsiChart(data.rsi_chart);
        setPrediction(data.prediction);
      } else {
        setError('Invalid data received from server.');
      }
    } catch (error) {
      console.error('Frontend error:', error.message);
      setError(error.response?.data?.error || error.message || 'Failed to fetch prediction data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      padding: '24px',
      height: '100%',
      minHeight: '500px',
      display: 'flex',
      width:'100%'
    }}>
      <Box p={4}>
      <Typography variant="h4" mb={2}>Stock Prediction</Typography>
      <Typography variant="subtitle1" color="text.secondary" mb={4}>
        Live Financial Forecasting
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" mb={4}>
        <TextField
          label="Ticker Symbol"
          variant="outlined"
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
        />
        <DatePicker
          label="Select Date"
          value={selectedDate}
          onChange={(newValue) => setSelectedDate(newValue)}
          maxDate={dayjs()}
          renderInput={(params) => <TextField {...params} />}
        />
        <Button
          variant="contained"
          sx={{
            background: 'linear-gradient(to right, #e53935, #ff5722)',
            color: '#fff',
            fontWeight: 'bold',
            px: 3,
            py: 1.5,
            borderRadius: 2,
            '&:hover': {
              background: 'linear-gradient(to right, #d32f2f, #f4511e)',
            },
          }}
          disabled={isLoading}
          onClick={handleFetch}
        >
          {isLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'FETCH PREDICTION'}
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!isLoading && !error && priceChart && rsiChart && prediction && (
        <Box>
          <Box my={2}>
            <img src={priceChart} alt="Price Chart" style={{ width: '100%', borderRadius: 8 }} />
          </Box>
          <Box my={2}>
            <img src={rsiChart} alt="RSI Chart" style={{ width: '100%', borderRadius: 8 }} />
          </Box>
          <Typography variant="h6" mt={2}>
            📈 Predicted Price Range: {prediction}
          </Typography>
        </Box>
      )}

      {isLoading && (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress color="error" />
        </Box>
        )}
        </Box>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main>
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route path="/tickers" element={<Tickers />} />
            <Route path="/prediction" element={<Prediction />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;