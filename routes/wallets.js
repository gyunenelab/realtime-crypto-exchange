// routes/wallets.js
// 사용자 지갑 관련 라우트 설정
const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallets');
const authMiddleware = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Wallets
 *   description: 사용자 지갑 관련 API
 */

/**
 * @swagger
 * /api/wallets:
 *   get:
 *     summary: 현재 로그인한 사용자의 지갑 목록 조회
 *     tags: [Wallets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 지갑 목록 반환
 *       401:
 *         description: 인증 실패
 */
router.get('/', authMiddleware, walletController.getWallets);

/**
 * @swagger
 * /api/wallets/deposit:
 *   post:
 *     summary: 코인 입금
 *     tags: [Wallets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [coinId, amount]
 *             properties:
 *               coinId:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: 입금 성공
 *       400:
 *         description: 잘못된 요청 또는 입금 실패
 *       401:
 *         description: 인증 실패
 */
router.post('/deposit', authMiddleware, walletController.deposit);

/**
 * @swagger
 * /api/wallets/withdraw:
 *   post:
 *     summary: 코인 출금
 *     tags: [Wallets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [coinId, amount]
 *             properties:
 *               coinId:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: 출금 성공
 *       400:
 *         description: 잔액 부족 또는 요청 오류
 *       401:
 *         description: 인증 실패
 */
router.post('/withdraw', authMiddleware, walletController.withdraw);

module.exports = router;
