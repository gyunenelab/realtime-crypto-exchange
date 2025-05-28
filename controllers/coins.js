const Coin = require('../models/Coin');
const PriceHistory = require('../models/PriceHistory');

// 모든 코인 목록 조회
exports.getAllCoins = async (req, res) => {
  try {
    const coins = await Coin.find().sort({ symbol: 1 });
    res.status(200).json({ success: true, data: coins });
  } catch (error) {
    console.error('코인 목록 조회 실패:', error);
    res.status(500).json({ success: false, message: '서버 오류' });
  }
};

// 새 코인 등록 (관리자 전용) 
exports.createCoin = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: '접근 권한이 없습니다' });
    }

    const { symbol, name, currentPrice } = req.body;

    if (!symbol || !name || !currentPrice) {
      return res.status(400).json({ success: false, error: '모든 필드를 입력해주세요' });
    }

    const existing = await Coin.findOne({ symbol });
    if (existing) {
      return res.status(400).json({ success: false, error: '이미 존재하는 심볼입니다' });
    }

    const coin = await Coin.create({ symbol, name, currentPrice });
    await PriceHistory.recordPrice(coin._id, currentPrice);

    res.status(201).json({ success: true, data: coin });
  } catch (error) {
    console.error('코인 등록 오류:', error);
    res.status(500).json({ success: false, error: '서버 오류가 발생했습니다' });
  }
};

// 특정 코인의 가격 변동 기록 조회 
exports.getCoinHistory = async (req, res) => {
  try {
    const { duration } = req.query;
    const history = await PriceHistory.getHistory(req.params.id, duration);
    res.json({ success: true, count: history.length, data: history });
  } catch (error) {
    console.error('가격 기록 조회 오류:', error);
    res.status(500).json({ success: false, error: '서버 오류가 발생했습니다' });
  }
};


// 특정 코인 정보 조회
exports.getCoinById = async (req, res) => {
  try {
    const coin = await Coin.findById(req.params.id);
    if (!coin) {
      return res.status(404).json({ success: false, error: '코인을 찾을 수 없습니다' });
    }
    res.json({ success: true, data: coin });
  } catch (error) {
    console.error('코인 정보 조회 오류:', error);
    res.status(500).json({ success: false, error: '서버 오류가 발생했습니다' });
  }
};