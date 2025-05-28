const mongoose = require('mongoose');
const Coin = require('../models/Coin');
const PriceHistory = require('../models/PriceHistory'); 
require('dotenv').config();

async function updatePrice(symbol, newPrice) {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const coin = await Coin.findOne({ symbol });

    if (!coin) {
      console.log(`❌ ${symbol} 코인을 찾을 수 없습니다.`);
      return;
    }

    await coin.updatePrice(parseFloat(newPrice));
    await PriceHistory.recordPrice(coin._id, parseFloat(newPrice)); // 여기가 문제였다면 PriceHistory가 함수 아래 있었을 수 있음

    console.log(`✅ ${symbol} 가격이 ${newPrice}으로 업데이트되고, 기록도 저장되었습니다.`);
  } catch (err) {
    console.error('❌ 오류 발생:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

const [symbol, price] = process.argv.slice(2);

if (!symbol || !price) {
  console.error('❌ 사용법: node scripts/update-coin-price.js <심볼> <가격>');
  process.exit(1);
}

updatePrice(symbol.toUpperCase(), price);
