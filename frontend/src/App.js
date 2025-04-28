import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink } from 'react-router-dom';
import Plot from 'react-plotly.js';
import axios from 'axios';
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
      <div className="nav-actions">
        <button className="contact-btn">Contact Us</button>
      </div>
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

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get(
          `https://newsapi.org/v2/top-headlines?category=business&language=en&apiKey=b0229a4f70084622acc940a120e73464`
        );
        setNews(response.data.articles.slice(0, 5));
      } catch (error) {
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
          
          {news.map((article, index) => (
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
  const [prediction, setPrediction] = useState('');
  const [priceChart, setPriceChart] = useState('');
  const [rsiChart, setRsiChart] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFetch = async () => {
    if (!ticker.trim()) {
      setError('Please enter a valid ticker symbol.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:3001/predict', { ticker: ticker.toUpperCase() });
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
    <div className="page-content">
      <header className="page-header">
        <h1 className="page-title">Stock Prediction</h1>
        <p className="page-subtitle">Live Financial Forecasting</p>
      </header>

      <div className="content-grid">
        <div className="card prediction-card">

          {/* Input */}
          <div className="input-group">
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              placeholder="Enter stock ticker (e.g., AAPL, MSFT)"
              className="ticker-input"
            />
            <button onClick={handleFetch} className="fetch-button" disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Fetch Prediction'}
            </button>
          </div>

          {/* Error Handling */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Loading Spinner */}
          {isLoading && (
            <div className="loading-message">Loading data...</div>
          )}

          {/* Chart and Prediction Display */}
          {!isLoading && !error && priceChart && rsiChart && prediction && (
            <>
              <div className="graph-container">
                <img src={priceChart} alt="Stock Chart" style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '20px' }} />
              </div>
              <div className="graph-container">
                <img src={rsiChart} alt="RSI Chart" style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '20px' }} />
              </div>
              <div className="prediction-text" style={{ marginTop: '20px', fontSize: '1.2rem', fontWeight: '600' }}>
                📈 Predicted Price Range: {prediction}
              </div>
            </>
          )}

        </div>
      </div>
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