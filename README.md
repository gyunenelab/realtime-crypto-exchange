# Realtime Crypto Exchange - Backend

실시간 암호화폐 거래소 백엔드 과제 제출합니다.
인증, 주문 처리, 실시간 웹소켓 통신, 지갑 시스템 등 처리되어있으며
일부 테스트 스크립트 및 통합 테스트 스크립트 포함되어 있습니다.

# 환경 
- `.env` 파일은 `.env.example` 내용 그대로 사용
- Swagger API 문서 경로 안내 (/api-docs)
- 기존 과제 설명 docs/assignment.md 로 백업

# 코인 등록
node scripts/seed-coins.js

# 유저 지갑 등록
node scripts/seed-wallets.js

# 실시간 가격 갱신
node scripts/update-coin-price.js

# 소켓 테스트
node scripts/test-socket.js

# 통합 테스트
node scripts/integration-test.js