const express = require('express');
const router = express.Router();
const { setUserRole, setMarket, seedWallet } = require('../controllers/admin');

/**
 * @swagger
 * /api/admin/set-role/{userId}:
 *   put:
 *     summary: 사용자 권한 변경 (admin/user)
 *     description: 특정 사용자의 역할을 admin 또는 user로 설정합니다
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: 역할을 변경할 대상 사용자의 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isAdmin:
 *                 type: boolean
 *                 example: true
 *                 description: true면 admin으로, false면 user로 변경
 *     responses:
 *       200:
 *         description: 역할 변경 성공
 *       404:
 *         description: 사용자 없음
 *       500:
 *         description: 서버 오류
 */

router.put('/set-role/:userId', setUserRole);




/**
 * @swagger
 * /api/admin/set-market:
 *   post:
 *     summary: 관리자 - 거래소 코인 초기화 및 더미 데이터 삽입
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 코인 더미 데이터 삽입 완료
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: 서버 에러
 */
router.post('/set-market', setMarket);

/**
 * @swagger
 * /api/admin/seed-wallet:
 *   post:
 *     summary: 관리자 - 특정 userId에게 지갑 더미 데이터 삽입
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 663c7f6b1234567890abcdef
 *     responses:
 *       200:
 *         description: 지갑 초기화 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: userId 누락
 *       404:
 *         description: 유저를 찾을 수 없음
 *       500:
 *         description: 서버 에러
 */
router.post('/seed-wallet', seedWallet);

module.exports = router;
