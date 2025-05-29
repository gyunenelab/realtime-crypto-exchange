const Coin = require('../models/Coin');
const Wallet = require('../models/Wallet');
const User = require('../models/User');

exports.setUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isAdmin } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다' });
    }

    user.role = isAdmin ? 'admin' : 'user';
    await user.save();

    res.json({
      message: `사용자 역할이 ${user.role}으로 변경되었습니다`,
      user,
    });
  } catch (err) {
    console.error('역할 설정 오류:', err);
    res.status(500).json({ message: '서버 오류' });
  }
};

exports.setMarket = async (req, res) => {
  try {
    await Coin.deleteMany({});
    await Coin.insertMany([
      {
        symbol: 'BTC',
        name: '비트코인',
        currentPrice: 50000000,
        dailyVolume: 1000000000,
        marketCap: 1000000000000,
      },
      {
        symbol: 'ETH',
        name: '이더리움',
        currentPrice: 3500000,
        dailyVolume: 500000000,
        marketCap: 500000000000,
      },
      {
        symbol: 'CASH_KRW',
        name: '현금 (KRW)',
        currentPrice: 1,
        dailyVolume: 0,
        marketCap: 0,
        active: false,
      },
    ]);

    res.json({ message: '코인 더미 데이터 삽입 완료' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '코인 삽입 실패', error: err.message });
  }
};

exports.seedWallet = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'userId가 필요합니다.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });
    }

    const coins = await Coin.find({ active: true });
    if (coins.length < 1) throw new Error('활성화된 코인이 없습니다.');

    const cashCoins = await Coin.find({ active: false });
    if (cashCoins.length < 1) throw new Error('현금 코인이 없습니다.');

    await Wallet.deleteMany({ user: user._id });

    const wallets = [];

    for (const coin of coins) {
      wallets.push({
        user: user._id,
        coin: coin._id,
        balance: 100,
      });
    }

    for (const coin of cashCoins) {
      wallets.push({
        user: user._id,
        coin: coin._id,
        balance: 1_000_000_000,
      });
    }

    await Wallet.insertMany(wallets);

    res.json({
      message: `${user.email || user._id} 유저에게 지갑 데이터 삽입 완료`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '지갑 삽입 실패', error: err.message });
  }
};