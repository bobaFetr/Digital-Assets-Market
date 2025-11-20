import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import SecondPage from './SecondPage.jsx';
import ThirdPage from './ThirdPage.jsx';
import reactLogo from './assets/Copilot_20251008_144326.png';
import BitcoinChart from './BitcoinChart.jsx';

function App() {
  return (
    <Router>
      <header className="app-header">
        <img src={reactLogo} alt="React Logo" className="app-logo" />
        <h1>Digital Assets Market</h1>
        <Link to="/"><button>Home</button></Link>
        <Link to="/second"><button>Crypto</button></Link>
        <Link to="/third"><button>More</button></Link>
      </header>

      <div className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <div className="app-container">
                <h1>Bitcoin Dashboard</h1>
                <div className="dashboard">
                  <div className="chart-section">
                    <BitcoinChart />
                  </div>
                  {/* <div className="orderbook-section">
                    <OrderBook />
                  </div> */}
                </div>
              </div>
            }
          />
          <Route path="/second" element={<SecondPage />} />
          <Route path="/third" element={<ThirdPage />} />
          <Route path="/chart/bitcoin" element={<BitcoinChart />} />      
          {/* <Route path="/chart/orderbook" element={<OrderBook />} />      */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;