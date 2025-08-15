import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3001;
const TARGET = process.env.TENDERLY_TARGET || 'https://virtual.binance.eu.rpc.tenderly.co/8aaba2bb-634b-464b-82ac-4527bc9fdf8e';

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.post('/rpc', async (req, res) => {
  try {
    const r = await fetch(TARGET, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(req.body) 
    });
    const text = await r.text();
    res.status(r.status).send(text);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'proxy_failed', message: e.message });
  }
});

app.listen(PORT, () => console.log('RPC proxy listening on', PORT));
