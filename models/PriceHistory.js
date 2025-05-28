const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema({
  coin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coin',
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// 인덱스 설정 (시간순으로 빠르게 조회)
priceHistorySchema.index({ coin: 1, timestamp: -1 });

// 특정 코인의 가격 내역 조회 (정적 메서드)
priceHistorySchema.statics.getHistory = function(coinId, duration) {
  const query = { coin: coinId };
  
  // 기간에 따른 필터링
  if (duration) {
    const now = new Date();
    const startDate = new Date();
    
    switch (duration) {
      case '1h':
        startDate.setHours(now.getHours() - 1);
        break;
      case '24h':
        startDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      default:
        break;
    }
    
    query.timestamp = { $gte: startDate };
  }
  
  return this.find(query).sort({ timestamp: 1 });
};

// 새 가격 포인트 저장 (정적 메서드)
priceHistorySchema.statics.recordPrice = async function(coinId, price) {
  return this.create({
    coin: coinId,
    price,
    timestamp: new Date()
  });
};

const PriceHistory = mongoose.model('PriceHistory', priceHistorySchema);

module.exports = PriceHistory; 