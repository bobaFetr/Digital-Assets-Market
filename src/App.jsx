import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import SecondPage from './SecondPage.jsx';
import ThirdPage from './ThirdPage.jsx';
import reactLogo from './assets/Copilot_20251008_144326.png';
import BitcoinChart from './BitcoinChart.jsx';
import Chat from './Chat.jsx';
import Login from './Login.jsx';
// import OrderBook from './OrderBook.jsx';

function App() {
  return (
    <Router>
      /*
      <header className="app-header">
        <img src={reactLogo} alt="React Logo" className="app-logo" />
        <h1>Digital Assets Market</h1>
        <Link to="/"><button>Home</button></Link>
        <Link to="/second"><button>Crypto</button></Link>
        <Link to="/second"><button>Pay</button></Link>
        <Link to="/Login"><button>Login</button></Link>
        <div className="dropdown-container">
          <button className="dropdown-button">More ▾</button>
          <ul className="dropdown-menu">
            <li><Link to="/third">Reports</Link></li>
            <li><Link to="/chat">Chat</Link></li>
            <li><a href="https://support.example.com" target="_blank" rel="noreferrer">Support</a></li>
          </ul>
        </div>

        <Link to="/Chat"><button>Chat</button></Link>
        <div>
          <search id='search bar'>
            <input type="text" placeholder="Search..." />
            <button type="submit">Go</button>
          </search>
        </div>
      </header>
      */
      <header className="app-header">
        <img src={reactLogo} alt="React Logo" className="app-logo" />
        <h1>Digital Assets Market</h1>
        <Link to="/"><button>Home</button></Link>
        <Link to="/second"><button>Crypto</button></Link>
        <Link to="/second"><button>Pay</button></Link>
        <div className="dropdown-container">
          <button className="dropdown-button">More ▾</button>
          <ul className="dropdown-menu">
            <li><Link to="/third">Reports</Link></li>
            <li><Link to="/chat">Chat</Link></li>
            <li><a href="https://support.example.com" target="_blank" rel="noreferrer">Support</a></li>
          </ul>
        </div>
        <div>
          <search id="search bar">
            <input type="text" placeholder="Search..." />
            <button type="submit">Go</button>
          </search>
        </div>
      </header>
      <div className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <div className="app-container">
                <h1>Profile</h1>
                <p>ID</p>
                <p>ACCOUNT BALANNCE</p>
                <p>Number of trades</p> 
                <button>Activity</button>
                <div className="dashboard">
                  <div className="chart-section">
                    <BitcoinChart />
                    
                  </div>  
                  {/* { s } */}
                </div>
              </div>
            }
          />
          <Route path="/second" element={<SecondPage />} />
          <Route path="/third" element={<ThirdPage />} />
          <Route path="/chart/bitcoin" element={<BitcoinChart />} />
          <Route path="/chat" element={<Chat />} />
          {/* <Route path="/chart/orderbook" element={<OrderBook />} />     */}
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>

      <footer>
        <div id='comunitty'>
            <p>© 2024 Digital Assets Market. All rights reserved.</p>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
        <p>Follow us on Instagram!</p>
          {/* <img src={require('./assets/instagram-logo.png')} alt="Instagram" className="social-logo" /> */}
        </a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
          <p>Follow us on Twitter!</p>
        </a>
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
          <p>Follow us on Facebook!</p>
        </a>
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
          <p>Follow us on LinkedIn!</p>
        </a>
        </div>
        
      </footer>
    </Router>
  );
}

export default App;