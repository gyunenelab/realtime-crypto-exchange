const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coin',
    required: true
  },
  type: {
    type: String,
    enum: ['buy', 'sell'],
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
  filled: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'partially_filled', 'filled', 'cancelled'],
    default: 'pending'
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

// 주문 총액 계산을 위한 가상 필드
orderSchema.virtual('total').get(function() {
  return this.price * this.amount;
});

// 주문 업데이트 메서드
orderSchema.methods.updateOrder = function(filledAmount) {
  if (filledAmount <= 0) {
    throw new Error('거래량은 0보다 커야 합니다');
  }
  
  if (this.filled + filledAmount > this.amount) {
    throw new Error('거래량이 주문량을 초과할 수 없습니다');
  }
  
  this.filled += filledAmount;
  
  if (this.filled === this.amount) {
    this.status = 'filled';
  } else if (this.filled > 0) {
    this.status = 'partially_filled';
  }
  
  return this.save();
};

// 주문 취소 메서드
orderSchema.methods.cancel = function() {
  if (this.status === 'filled') {
    throw new Error('이미 완료된 주문은 취소할 수 없습니다');
  }
  
  this.status = 'cancelled';
  return this.save();
};

// 미체결 주문 조회 (정적 메서드)
orderSchema.statics.findPendingOrders = function(coinId) {
  return this.find({
    coin: coinId,
    status: { $in: ['pending', 'partially_filled'] }
  }).sort({ price: -1, createdAt: 1 });
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order; 