const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const transactionController = require('../controllers/transactions');

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: 로그인한 사용자의 거래 내역 조회
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 거래 내역 조회 성공
 */
router.get('/', authMiddleware, transactionController.getMyTransactions);

module.exports = router;
