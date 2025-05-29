const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const Coin = require('../models/Coin');

const getCoinId = require('../utils/getCoinId');
const { sendOrderUpdate, sendTransactionNotification } = require('../websocket/setup');

// 주문 생성
exports.createOrder = async (req, res) => {
  try {
    const { coinId, type, price, amount } = req.body;
    const userId = req.user.id;

    if (!coinId || !type || !price || !amount) {
      return res.status(400).json({ message: '모든 필드를 입력해야 합니다.' });
    }

    const cashCoinId = await getCoinId('CASH_KRW');
    const coin = await Coin.findById(coinId);
    if (!coin) return res.status(404).json({ message: '존재하지 않는 코인입니다.' });

    const order = await Order.create({
      user: userId,
      coin: coinId,
      type,
      price,
      amount,
    });

    const matchType = type === 'buy' ? 'sell' : 'buy';
    const comparator = type === 'buy' ? '$lte' : '$gte';

    const candidates = await Order.find({
      coin: coinId,
      type: matchType,
      price: { [comparator]: price },
      status: { $in: ['pending', 'partially_filled'] },
    }).sort({
      price: type === 'buy' ? 1 : -1,
      createdAt: 1,
    });

    let remaining = amount;

    for (const target of candidates) {
      const available = target.amount - target.filled;
      const tradeAmount = Math.min(remaining, available);
      if (tradeAmount <= 0) continue;
 
      const tradePrice = target.price;
      const totalCost = tradeAmount * tradePrice;

      const buyerId = type === 'buy' ? userId : target.user;
      const sellerId = type === 'sell' ? userId : target.user;


      // 현금지갑/코인지갑 
      const buyerKRWWallet = await Wallet.findOne({ user: buyerId, coin: cashCoinId });
      const sellerCoinWallet = await Wallet.findOne({ user: sellerId, coin: coinId });

      console.log(`체결 시도: buyerId=${buyerId}, sellerId=${sellerId}, amount=${tradeAmount}, price=${tradePrice}, total=${totalCost}`);
      console.log(`구매자 현금 지갑: ${buyerKRWWallet ? buyerKRWWallet.balance : '없음'}, 판매자 코인 지갑: ${sellerCoinWallet ? sellerCoinWallet.balance : '없음'}`);

      // 잔액 체크
      if (!buyerKRWWallet || buyerKRWWallet.balance < totalCost) {
        console.log(`구매자 현금 부족: 보유=${buyerKRWWallet?.balance}, 필요=${totalCost}`);
        continue;
      }

      if (!sellerCoinWallet || sellerCoinWallet.balance < tradeAmount) {
        console.log(`판매자 코인 부족: 보유=${sellerCoinWallet?.balance}, 필요=${tradeAmount}`);
        continue;
      }

      // 체결 기록 생성
      const tx = await Transaction.create({
        buyOrder: type === 'buy' ? order._id : target._id,
        sellOrder: type === 'sell' ? order._id : target._id,
        buyer: buyerId,
        seller: sellerId,
        coin: coinId,
        price: tradePrice,
        amount: tradeAmount,
      });
      console.log(`체결 완료: TX=${tx._id}`);

      await target.updateOrder(tradeAmount);
      await order.updateOrder(tradeAmount);
      console.log(`주문 업데이트: target=${target._id}, order=${order._id}`);

      // buyer: 현금 차감, 코인 증가
      buyerKRWWallet.balance -= totalCost;
      await buyerKRWWallet.save();
      console.log(`구매자 현금 차감: ${totalCost}`);

      await Wallet.findOneAndUpdate(
        { user: buyerId, coin: coinId },
        { $inc: { balance: tradeAmount } },
        { upsert: true, new: true }
      );
      console.log(`구매자 코인 증가: ${tradeAmount}`);

      // seller: 코인 차감, 현금 증가
      sellerCoinWallet.balance -= tradeAmount;
      await sellerCoinWallet.save();
      console.log(`판매자 코인 차감: ${tradeAmount}`);

      await Wallet.findOneAndUpdate(
        { user: sellerId, coin: cashCoinId },
        { $inc: { balance: totalCost } },
        { upsert: true, new: true }
      );
      console.log(`판매자 현금 증가: ${totalCost}`);

      remaining -= tradeAmount;
      
      // 거래 알림
      sendTransactionNotification(buyerId, sellerId, tx);
      // 주문 업데이트 알림
      sendOrderUpdate(buyerId, type === 'buy' ? order : target); 
      sendOrderUpdate(sellerId, type === 'sell' ? order : target); 
      console.log(`남은 거래량: ${remaining}`);

      if (remaining <= 0) break;
    }

    res.status(201).json(order);
  } catch (err) {
    console.error('주문 생성 오류:', err);
    res.status(500).json({ message: '주문 처리 중 오류 발생' });
  }
};

// 주문 목록 조회
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('coin')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: '주문 목록 조회 실패' });
  }
};

// 주문 상세 조회
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('coin');
    if (!order || order.user.toString() !== req.user.id) {
      return res.status(404).json({ message: '주문을 찾을 수 없습니다.' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: '주문 상세 조회 실패' });
  }
};

// 주문 취소
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order || order.user.toString() !== req.user.id) {
      return res.status(404).json({ message: '주문을 찾을 수 없습니다.' });
    }
    if (order.status === 'filled') {
      return res.status(400).json({ message: '이미 체결된 주문은 취소할 수 없습니다.' });
    }
    if (order.status === 'cancelled') {
      return res.status(400).json({ message: '이미 취소된 주문입니다.' });
    }

    await order.cancel();
    res.json({ message: '주문이 취소되었습니다.', order });
  } catch (err) {
    res.status(500).json({ message: '주문 취소 실패' });
  }
};

