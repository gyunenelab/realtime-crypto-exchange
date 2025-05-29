const Transaction = require('../models/Transaction');

exports.getMyTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
    const transactions = await Transaction.findByUser(userId);
    res.json({ success: true, count: transactions.length, data: transactions });
  } catch (error) {
    console.error('거래 내역 조회 오류:', error);
    res.status(500).json({ success: false, error: '서버 오류가 발생했습니다' });
  }
};
