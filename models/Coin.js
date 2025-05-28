const mongoose = require('mongoose');

const coinSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  currentPrice: {
    type: Number,
    required: true,
    min: 0
  },
  dailyVolume: {
    type: Number,
    default: 0,
    min: 0
  },
  priceChangePercent24h: {
    type: Number,
    default: 0
  },
  marketCap: {
    type: Number,
    default: 0,
    min: 0
  },
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 가격 업데이트 메서드
coinSchema.methods.updatePrice = function(newPrice) {
  const oldPrice = this.currentPrice;
  this.currentPrice = newPrice;
  
  // 24시간 가격 변동률 계산 (실제 구현에서는 더 정교한 로직 필요)
  if (oldPrice > 0) {
    this.priceChangePercent24h = ((newPrice - oldPrice) / oldPrice) * 100;
  }
  
  return this.save();
};

const Coin = mongoose.model('Coin', coinSchema);

module.exports = Coin; 