// utils/getCoinId.js
const Coin = require('../models/Coin');

const cache = {}; // symbol별 캐시
async function getCoinId(symbol = 'CASH_KRW') {
  if (cache[symbol]) return cache[symbol];

  const coin = await Coin.findOne({ symbol });
  if (!coin) throw new Error(`${symbol} 코인이 존재하지 않습니다`);

  cache[symbol] = coin._id;
  return coin._id;
}

module.exports = getCoinId;
