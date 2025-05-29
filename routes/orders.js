// routes/orders.js
// 주문 및 거래 관련 라우트 설정
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const orders = require('../controllers/orders');


/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: 주문 및 거래 관련 API
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: 내 주문 목록 조회
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 주문 목록 반환
 */
router.get('/', auth, orders.getMyOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: 특정 주문 상세 조회
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 주문 상세 반환
 *       404:
 *         description: 주문 없음
 */
router.get('/:id', auth, orders.getOrderById);

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: 새로운 주문 생성
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               coinId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [buy, sell]
 *               price:
 *                 type: number
 *               amount:
 *                 type: number
 *     responses:
 *       201:
 *         description: 주문 생성됨
 *       400:
 *         description: 유효하지 않은 요청
 *       500:
 *         description: 서버 오류
 */
router.post('/', auth, orders.createOrder);


/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     summary: 주문 취소
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 주문 취소됨
 *       404:
 *         description: 주문 없음
 */
router.delete('/:id', auth, orders.cancelOrder);
 
module.exports = router;
