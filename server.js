const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Swagger 설정
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger/swaggerConfig');

// 라우트 파일
const authRoutes = require('./routes/auth');
const coinRoutes = require('./routes/coins');
const walletRoutes = require('./routes/wallets');
const orderRoutes = require('./routes/orders');
const transactionRoutes = require('./routes/transactions');
const adminRoutes = require('./routes/admin');

// WebSocket 핸들러
const setupWebSocket = require('./websocket/setup');

// 환경변수 설정
dotenv.config();

// Express 앱 초기화
const app = express();
const server = http.createServer(app);

// Swagger UI 설정
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// API 라우트 설정
app.use('/api/auth', authRoutes);
app.use('/api/coins', coinRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes);

// WebSocket 서버 설정
const wss = new WebSocket.Server({ server });
setupWebSocket(wss);

// 데이터베이스 연결
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// 서버 시작
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// 에러 핸들링
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

module.exports = server; 