// routes/coin.js
// 코인 정보 및 가격 기록 관련 라우트 설정
const express = require('express');
const router = express.Router();
const Coin = require('../models/Coin');
const PriceHistory = require('../models/PriceHistory');
const auth = require('../middleware/auth');
const coinController = require('../controllers/coins');

/**
 * @swagger
 * tags:
 *   name: Coins
 *   description: 코인 정보 및 가격 기록 API
 */

/**
 * @swagger
 * /api/coins:
 *   get:
 *     summary: 모든 활성 코인 목록 조회
 *     tags: [Coins]
 *     responses:
 *       200:
 *         description: 코인 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Coin'
 */
router.get('/', coinController.getAllCoins);

/**
 * @swagger
 * /api/coins/{id}:
 *   get:
 *     summary: 특정 코인 정보 조회
 *     tags: [Coins]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 코인 ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 코인 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Coin'
 */
router.get('/:id', coinController.getCoinById);

/**
 * @swagger
 * /api/coins/{id}/history:
 *   get:
 *     summary: 특정 코인의 가격 변동 기록 조회
 *     tags: [Coins]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 코인 ID
 *         schema:
 *           type: string
 *       - in: query
 *         name: duration
 *         required: false
 *         description: 기간 필터 (1h, 24h, 7d, 30d)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 가격 기록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PriceHistory'
 */
router.get('/:id/history', coinController.getCoinHistory);

/**
 * @swagger
 * /api/coins:
 *   post:
 *     summary: 새 코인 등록 (관리자 전용)
 *     tags: [Coins]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               symbol:
 *                 type: string
 *               name:
 *                 type: string
 *               currentPrice:
 *                 type: number
 *     responses:
 *       201:
 *         description: 코인 등록 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Coin'
 */
router.post('/', auth, coinController.createCoin);

module.exports = router; 