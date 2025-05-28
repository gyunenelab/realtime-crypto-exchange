const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  buyOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  sellOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
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
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 거래 총액 계산을 위한 가상 필드
transactionSchema.virtual('total').get(function() {
  return this.price * this.amount;
});

// 사용자별 거래 내역 조회 (정적 메서드)
transactionSchema.statics.findByUser = function(userId) {
  return this.find({
    $or: [{ buyer: userId }, { seller: userId }]
  })
  .populate('coin')
  .populate('buyOrder')
  .populate('sellOrder')
  .sort({ createdAt: -1 });
};

// 코인별 거래 내역 조회 (정적 메서드)
transactionSchema.statics.findByCoin = function(coinId) {
  return this.find({ coin: coinId })
    .sort({ createdAt: -1 });
};

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction; 