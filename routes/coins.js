const express = require('express');
const router = express.Router();
const Coin = require('../models/Coin');
const PriceHistory = require('../models/PriceHistory');
const authMiddleware = require('../middleware/auth');

/**
 * @route   GET /api/coins
 * @desc    모든 활성화된 코인 목록 조회
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const coins = await Coin.find({ active: true });
    
    res.json({
      success: true,
      count: coins.length,
      data: coins
    });
  } catch (error) {
    console.error('코인 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 오류가 발생했습니다'
    });
  }
});

/**
 * @route   GET /api/coins/:id
 * @desc    특정 코인 정보 조회
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const coin = await Coin.findById(req.params.id);
    
    if (!coin) {
      return res.status(404).json({
        success: false,
        error: '코인을 찾을 수 없습니다'
      });
    }
    
    res.json({
      success: true,
      data: coin
    });
  } catch (error) {
    console.error('코인 정보 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 오류가 발생했습니다'
    });
  }
});

/**
 * @route   GET /api/coins/:id/history
 * @desc    특정 코인의 가격 변동 기록 조회
 * @access  Public
 * @query   duration - 기간 (1h, 24h, 7d, 30d)
 */
router.get('/:id/history', async (req, res) => {
  try {
    const { duration } = req.query;
    const priceHistory = await PriceHistory.getHistory(req.params.id, duration);
    
    res.json({
      success: true,
      count: priceHistory.length,
      data: priceHistory
    });
  } catch (error) {
    console.error('코인 가격 내역 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 오류가 발생했습니다'
    });
  }
});

/**
 * @route   POST /api/coins
 * @desc    새 코인 추가 (관리자 전용)
 * @access  Private/Admin
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    // 관리자 확인
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: '접근 권한이 없습니다'
      });
    }
    
    const { symbol, name, currentPrice } = req.body;
    
    // 필수 입력값 확인
    if (!symbol || !name || !currentPrice) {
      return res.status(400).json({
        success: false,
        error: '모든 필드를 입력해 주세요'
      });
    }
    
    // 코인 중복 확인
    const existingCoin = await Coin.findOne({ symbol });
    if (existingCoin) {
      return res.status(400).json({
        success: false,
        error: '이미 등록된 코인 심볼입니다'
      });
    }
    
    // 새 코인 생성
    const coin = await Coin.create({
      symbol,
      name,
      currentPrice,
      active: true
    });
    
    // 초기 가격 내역 생성
    await PriceHistory.recordPrice(coin._id, currentPrice);
    
    res.status(201).json({
      success: true,
      data: coin
    });
  } catch (error) {
    console.error('코인 생성 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 오류가 발생했습니다'
    });
  }
});

module.exports = router; 