// scripts/seed-coins.js
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
const Coin = require('../models/Coin');
const Wallet = require('../models/Wallet');
require('dotenv').config();

async function seedCoins() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    await Coin.deleteMany({});
    await Coin.insertMany([
      {
        symbol: 'BTC',
        name: '비트코인',
        currentPrice: 50000000,
        dailyVolume: 1000000000,
        marketCap: 1000000000000,
      },
      {
        symbol: 'ETH',
        name: '이더리움',
        currentPrice: 3500000,
        dailyVolume: 500000000,
        marketCap: 500000000000,
      },
      {
        symbol: 'CASH_KRW',
        name: '현금 (KRW)',
        currentPrice: 1,
        dailyVolume: 0,
        marketCap: 0,
        active: false, // 현금은 활성화되지 않음
      },
    ]);

    console.log('✅ 코인 더미 데이터 삽입 완료');
  } catch (err) {
    console.error('❌ 에러 발생:', err);
  } finally {
    mongoose.disconnect();
  }
}

seedCoins();
