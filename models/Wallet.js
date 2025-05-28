const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
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
  balance: {
    type: Number,
    default: 0,
    min: 0
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

// 복합 인덱스 설정 (한 사용자가 같은 코인에 대해 중복 지갑을 가질 수 없음)
walletSchema.index({ user: 1, coin: 1 }, { unique: true });

// 입금 메서드
walletSchema.methods.deposit = function(amount) {
  if (amount <= 0) {
    throw new Error('입금 금액은 0보다 커야 합니다');
  }
  
  this.balance += amount;
  return this.save();
};

// 출금 메서드
walletSchema.methods.withdraw = function(amount) {
  if (amount <= 0) {
    throw new Error('출금 금액은 0보다 커야 합니다');
  }
  
  if (this.balance < amount) {
    throw new Error('잔액이 부족합니다');
  }
  
  this.balance -= amount;
  return this.save();
};

// 사용자별 모든 지갑 조회 (정적 메서드)
walletSchema.statics.findByUser = function(userId) {
  return this.find({ user: userId }).populate('coin');
};

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet; 