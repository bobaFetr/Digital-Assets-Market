
import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());

app.get('/api/bitcoin', async (req, res) => {
  try {
    const response = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data from Binance' });
  }
});

app.get('/api/bitcoin/history', async (req, res) => {
  try {
    const response = await axios.get(
      'https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=60'
    );
    const formatted = response.data.map(item => ({
      time: item[0],
      price: parseFloat(item[4]),
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});
app.get('/api/bitcoin/orders', async (req, res) => {
  try {
    const response = await axios.get(
      'https://api.binance.com/api/v3/depth?symbol=BTCUSDT&limit=10'
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order book data' });
  }
});
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

/////////10.12.25
app.get('/api/bitcoincash', async (req, res) => {
  try {
    const response = await axios.get(
      'https://api.binance.com/api/v3/ticker/price?symbol=BCHUSDT'
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch BCH data' });
  }
});
