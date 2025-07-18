const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');


// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/leave-requests', require('./routes/leaveRequests'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/company-location', require('./routes/companyLocation'));
app.listen(PORT, '0.0.0.0', () => {
  connectDB();
  console.log(`The server is running on port ${PORT} and address 0.0.0.0`);
});

