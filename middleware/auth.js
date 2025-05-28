const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * 사용자 인증 미들웨어
 * JWT 토큰을 검증하고 인증된 사용자의 정보를 요청 객체에 추가
 */
module.exports = async function(req, res, next) {
  try {
    // 토큰 확인
    const token = req.header('x-auth-token');
    
    // 토큰이 없는 경우
    if (!token) {
      return res.status(401).json({
        success: false,
        error: '인증 토큰이 없습니다. 로그인이 필요합니다.'
      });
    }
    
    // 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 사용자 확인
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: '유효하지 않은 토큰입니다.'
      });
    }
    
    // 요청 객체에 사용자 정보 추가
    req.user = user;
    next();
  } catch (error) {
    // 토큰 검증 실패
    console.error('토큰 인증 오류:', error);
    res.status(401).json({
      success: false,
      error: '인증에 실패했습니다. 다시 로그인해주세요.'
    });
  }
}; 