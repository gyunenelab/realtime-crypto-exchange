// controllers/wallets.js
const Wallet = require('../models/Wallet');
const Coin = require('../models/Coin');

// [GET] /api/wallets - 사용자 지갑 목록 조회
exports.getWallets = async (req, res) => {
  try {
    const userId = req.user._id;
    const wallets = await Wallet.findByUser(userId);
    res.status(200).json({ success: true, wallets });
  } catch (err) {
    console.error('지갑 조회 오류:', err);
    res.status(500).json({ success: false, message: '지갑 조회 실패' });
  }
};

// [POST] /api/wallets/deposit - 입금
exports.deposit = async (req, res) => {
  try {
    const { coinId, amount } = req.body;
    const userId = req.user._id;

    const coin = await Coin.findById(coinId);
    if (!coin) return res.status(404).json({ success: false, message: '코인 없음' });

    let wallet = await Wallet.findOne({ user: userId, coin: coinId });
    if (!wallet) {
      wallet = new Wallet({ user: userId, coin: coinId });
    }

    await wallet.deposit(amount);
    res.status(200).json({ success: true, wallet });
  } catch (err) {
    console.error('입금 오류:', err.message);
    res.status(400).json({ success: false, message: err.message });
  }
};

// [POST] /api/wallets/withdraw - 출금
exports.withdraw = async (req, res) => {
  try {
    const { coinId, amount } = req.body;
    const userId = req.user._id;

    const wallet = await Wallet.findOne({ user: userId, coin: coinId });
    if (!wallet) return res.status(404).json({ success: false, message: '지갑 없음' });

    await wallet.withdraw(amount);
    res.status(200).json({ success: true, wallet });
  } catch (err) {
    console.error('출금 오류:', err.message);
    res.status(400).json({ success: false, message: err.message });
  }
};
