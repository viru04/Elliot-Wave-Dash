import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink } from 'react-router-dom';
import Plot from 'react-plotly.js';
import axios from 'axios';
import './App.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="logo">EW</span> Elliott Wave Solutions
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
          <h3>Elliott Wave Solutions</h3>
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
        <h1 className="hero-title">Welcome to Elliott Wave Solutions</h1>
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
  const [tickers, setTickers] = useState([]);

  useEffect(() => {
    const fetchTickers = async () => {
      const topTickers = [
        'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'NFLX', 'INTC', 'CSCO',
        'BRK.B', 'JPM', 'V', 'MA', 'WMT', 'PG', 'DIS', 'PEP', 'KO', 'XOM',
        'TATAMOTORS.NS', 'RELIANCE.BO', 'HDFCBANK.BO', 'INFY.BO', 'TCS.BO',
      ];
      const tickerData = [];
      for (const ticker of topTickers) {
        try {
          const response = await axios.get(`https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=price`);
          const info = response.data.quoteSummary.result[0].price;
          tickerData.push({
            Ticker: ticker,
            Company: info.longName || 'N/A',
            Sector: info.sector || 'N/A',
            'Market Cap': `$${info.marketCap?.fmt || 'N/A'}`,
            'Current Price': `$${info.regularMarketPrice?.fmt || 'N/A'}`,
          });
        } catch (error) {
          console.error(`Error fetching data for ${ticker}:`, error);
        }
      }
      setTickers(tickerData);
    };
    fetchTickers();
  }, []);

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
  const [priceData, setPriceData] = useState([]);
  const [rsiData, setRsiData] = useState([]);
  const [prediction, setPrediction] = useState({});
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!priceData.length && !rsiData.length && !Object.keys(prediction).length) {
      setError('No data loaded yet. Please fetch data.');
    }
  }, [priceData, rsiData, prediction]);

  const handleFetch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:3001/predict', { ticker: ticker.toUpperCase() });
      const data = response.data;
      if (data.error) throw new Error(data.details);
      if (!data.price_data || !data.price_data.length) throw new Error('No price data received');
      setPriceData(data.price_data);
      setRsiData(data.rsi_data);
      setPrediction(data.prediction || {});
    } catch (error) {
      console.error('Frontend error:', error.message);
      setError(error.message || 'Failed to fetch prediction data');
    } finally {
      setIsLoading(false);
    }
  };

  const priceFig = {
    data: priceData.length > 0 ? [
      {
        x: priceData.map(d => d.x),
        y: priceData.map(d => d.y),
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Historical Price',
        line: { color: '#00cc00', width: 2 },
        marker: { size: 6, color: '#00cc00' },
        hovertemplate: 'Date: %{x|%b %Y}<br>Price: $%{y:.2f}<extra></extra>'
      },
      {
        x: [priceData[priceData.length - 1].x, new Date(prediction.endDate || new Date().getTime() + 30 * 24 * 60 * 60 * 1000)],
        y: [prediction.start || 0, prediction.end || 0],
        type: 'scatter',
        mode: 'lines',
        name: `Predicted ${prediction.wave || 'Wave V'}`,
        line: { color: '#ff4500', width: 2, dash: 'dot' },
        hovertemplate: 'Date: %{x|%b %Y}<br>Predicted Price: $%{y:.2f}<extra></extra>'
      }
    ] : [],
    layout: {
      title: {
        text: `${ticker} Price Trend`,
        font: { size: 20, color: '#dc3545', family: 'Roboto, sans-serif' },
        x: 0.05,
        xanchor: 'left'
      },
      xaxis: {
        title: 'Date',
        tickformat: '%b %Y', // e.g., "May 2022", "Jun 2022"
        tickfont: { size: 12, color: '#333' },
        range: priceData.length > 0 ? [priceData[0].x, new Date(priceData[priceData.length - 1].x).getTime() + 60 * 24 * 60 * 60 * 1000] : [],
        tickmode: 'array',
        tickvals: priceData.length > 0 ? priceData.map(d => d.x).filter((d, i) => i % 30 === 0) : [], // Monthly ticks
        gridcolor: '#f0f0f0',
        zeroline: false,
        domain: [0, 0.95]
      },
      yaxis: {
        title: 'Price (USD)',
        tickfont: { size: 12, color: '#333' },
        autorange: true,
        tickmode: 'array',
        tickvals: priceData.length > 0 ? Array.from({ length: Math.ceil((Math.max(...priceData.map(d => d.y)) - Math.min(...priceData.map(d => d.y))) / 20) + 1 }, (_, i) => Math.min(...priceData.map(d => d.y)) + i * 20) : [],
        gridcolor: '#f0f0f0',
        zeroline: false,
        titlefont: { size: 14 },
        side: 'left'
      },
      shapes: priceData.length > 0 ? [
        {
          type: 'line',
          x0: priceData[0].x,
          x1: new Date(prediction.endDate || priceData[priceData.length - 1].x),
          y0: (prediction.start + prediction.end) / 2 || 0,
          y1: (prediction.start + prediction.end) / 2 || 0,
          line: { color: '#ff4500', width: 1, dash: 'dot' },
          name: 'Predicted Level'
        }
      ] : [],
      annotations: priceData.length > 0 ? [
        {
          x: new Date(prediction.startDate || priceData[priceData.length - 1].x),
          y: prediction.start || 0,
          xanchor: 'center',
          yanchor: 'bottom',
          text: `Predicted ${prediction.wave || 'Wave V'} Start`,
          showarrow: false,
          font: { size: 12, color: '#ff4500' },
          bgcolor: 'rgba(255, 255, 255, 0.8)',
          bordercolor: '#ccc',
          borderwidth: 1,
          borderpad: 4
        },
        {
          x: new Date(prediction.endDate || new Date().getTime() + 30 * 24 * 60 * 60 * 1000),
          y: prediction.end || 0,
          xanchor: 'center',
          yanchor: 'bottom',
          text: `Predicted ${prediction.wave || 'Wave V'} End`,
          showarrow: false,
          font: { size: 12, color: '#ff4500' },
          bgcolor: 'rgba(255, 255, 255, 0.8)',
          bordercolor: '#ccc',
          borderwidth: 1,
          borderpad: 4
        }
      ] : [],
      template: 'plotly_white',
      height: 400,
      width: 1200,
      margin: { l: 70, r: 50, t: 60, b: 40 },
      legend: { x: 1, y: 1, xanchor: 'right', yanchor: 'top', orientation: 'v', bgcolor: 'rgba(255, 255, 255, 0.9)', bordercolor: '#ccc', borderwidth: 1 },
      showlegend: true,
      hovermode: 'x unified'
    }
  };

  const rsiFig = {
    data: rsiData.length > 0 ? [
      {
        x: rsiData.map(d => d.x),
        y: rsiData.map(d => d.y),
        type: 'scatter',
        mode: 'lines+markers',
        name: 'RSI',
        line: { color: '#1e90ff', width: 2 },
        marker: { size: 6, color: '#1e90ff' },
        hovertemplate: 'Date: %{x|%b %Y}<br>RSI: %{y}<extra></extra>'
      }
    ] : [],
    layout: {
      title: {
        text: `${ticker} Relative Strength Index (RSI)`,
        font: { size: 18, color: '#dc3545', family: 'Roboto, sans-serif' },
        x: 0.05,
        xanchor: 'left'
      },
      xaxis: {
        title: 'Date',
        tickformat: '%b %Y',
        tickfont: { size: 10, color: '#333' },
        range: priceData.length > 0 ? [priceData[0].x, new Date(priceData[priceData.length - 1].x).getTime() + 60 * 24 * 60 * 60 * 1000] : [],
        tickmode: 'array',
        tickvals: priceData.length > 0 ? priceData.map(d => d.x).filter((d, i) => i % 30 === 0) : [], // Monthly ticks
        gridcolor: '#f0f0f0',
        zeroline: false,
        domain: [0, 0.95]
      },
      yaxis: {
        title: 'RSI Value',
        range: [0, 100],
        tickfont: { size: 10, color: '#1e90ff' },
        tickmode: 'array',
        tickvals: [0, 30, 70, 100],
        gridcolor: 'rgba(0, 0, 0, 0)', // No grid to avoid clutter
        zeroline: false,
        titlefont: { size: 12, color: '#1e90ff' },
        side: 'right'
      },
      shapes: [
        { type: 'line', x0: 0, x1: 1, y0: 30, y1: 30, line: { color: '#666', width: 1, dash: 'dash' }, name: 'Oversold (30)' },
        { type: 'line', x0: 0, x1: 1, y0: 70, y1: 70, line: { color: '#666', width: 1, dash: 'dash' }, name: 'Overbought (70)' }
      ],
      template: 'plotly_white',
      height: 200,
      width: 1200,
      margin: { l: 70, r: 50, t: 50, b: 40 },
      legend: { x: 1, y: 1, xanchor: 'right', yanchor: 'top', orientation: 'v', bgcolor: 'rgba(255, 255, 255, 0.9)', bordercolor: '#ccc', borderwidth: 1 },
      showlegend: true,
      hovermode: 'x unified'
    }
  };

  const priceRanges = `Predicted Price Range\n${prediction.start ? `Historical End: $${prediction.start.toFixed(2)}` : ''}\nPredicted ${prediction.wave || 'Wave V'}: $${prediction.start?.toFixed(2) || 0} to $${prediction.end?.toFixed(2) || 0}`;

  return (
    <div className="page-content">
      <header className="page-header">
        <h1 className="page-title">Predictions</h1>
        <p className="page-subtitle">Live Financial Forecasting</p>
      </header>
      <div className="content-grid">
        <div className="card prediction-card">
          <div className="input-group">
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              placeholder="Enter stock ticker (e.g., GBX, AAPL)"
              className="ticker-input"
            />
            <button onClick={handleFetch} className="fetch-button" disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Fetch Live Data'}
            </button>
          </div>
          {error ? (
            <div className="error-message">{error}</div>
          ) : isLoading ? (
            <div className="loading-message">Loading data...</div>
          ) : (
            <>
              <div className="graph-container">
                <Plot data={priceFig.data} layout={priceFig.layout} />
              </div>
              <div className="graph-container" style={{ marginTop: 0 }}>
                <Plot data={rsiFig.data} layout={rsiFig.layout} />
              </div>
              <div className="price-ranges">{priceRanges || 'No data available'}</div>
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