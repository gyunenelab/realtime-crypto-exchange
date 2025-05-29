// scripts/seed-wallets.js
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
require('dotenv').config();

const Coin = require('../models/Coin');
const Wallet = require('../models/Wallet');
const User = require('../models/User');

async function seedWallets() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const testUserId = process.env.TEST_USER_ID;
    if (!testUserId) throw new Error('❌ TEST_USER_ID 환경변수가 설정되지 않았습니다');

    const user = await User.findById(testUserId);
    if (!user) throw new Error('❌ 해당 유저를 찾을 수 없습니다');

    const coins = await Coin.find({ symbol: { $in: ['BTC', 'ETH', 'CASH_KRW'] } });
    if (coins.length < 2) throw new Error('❌ BTC, ETH 코인이 모두 등록되지 않았습니다');
    const cashCoin = coins.find(c => c.symbol === 'CASH_KRW');
    if (!cashCoin) throw new Error('❌ 현금 코인(CASH_KRW)이 등록되지 않았습니다');

    // 기존 지갑 삭제
    await Wallet.deleteMany({ user: user._id });
    console.log(`✅ ${user.email || user._id} 유저의 기존 지갑 데이터 삭제 완료`);

    const wallets = [];

    for (const coin of coins) {
      if (!coin.active) continue;
      wallets.push({
        user: testUserId,
        coin: coin._id,
        balance: 100, // 코인 100개 지급
      });
    }

    // 현금 지갑 (coin: null)
    wallets.push({
      user: testUserId,
      coin: cashCoin._id, // 현금 코인 ID
      balance: 1000000000, // 10억 원 지급
    });

    await Wallet.insertMany(wallets);
    console.log(`✅ ${user.email || user._id} 유저에게 지갑 더미 데이터 삽입 완료`);

  } catch (err) {
    console.error('❌ 에러 발생:', err);
  } finally {
    mongoose.disconnect();
  }
}

seedWallets();
