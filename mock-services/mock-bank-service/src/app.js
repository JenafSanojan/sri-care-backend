const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const bankRoutes = require('./routes/bankRoutes');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'Mock Bank Service running' });
});

// Bank routes
app.use('/bank', bankRoutes);

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => console.log(`Mock Bank Service running on port ${PORT}`));
