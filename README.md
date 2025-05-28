# 실시간 코인 거래소 백엔드 구현 코딩 테스트

## 문제 개요

당신은 새로운 암호화폐 거래소의 백엔드 개발자로 채용되었습니다. 이 거래소는 사용자들이 실시간으로 코인 가격을 조회하고, 거래할 수 있는 플랫폼을 제공하고자 합니다. 당신의 임무는 기본적인 거래소 백엔드 API와 실시간 데이터 처리 기능을 구현하는 것입니다.

## 구현해야 할 기능(택 3)

1. **사용자 관리**
   - 사용자 등록 및 로그인 기능
   - JWT 기반 인증 시스템

2. **코인 정보 관리**
   - 지원하는 코인 목록 API
   - 코인 가격 실시간 업데이트
   - 가격 변동 기록 저장

3. **지갑 기능**
   - 사용자별 코인 보유량 관리
   - 입금/출금 기능

4. **거래 기능**
   - 코인 구매 및 판매 주문 생성
   - 주문 처리 및 체결
   - 거래 내역 저장 및 조회

5. **실시간 데이터 제공**
   - WebSocket을 통한 실시간 코인 가격 업데이트
   - 사용자 주문 상태 실시간 알림

## 기술적 요구사항

### 백엔드
- Node.js와 Express.js를 사용하여 RESTful API 구현
- WebSocket을 사용한 실시간 데이터 처리
- MongoDB를 사용한 데이터 저장
- JWT를 이용한 사용자 인증
- 적절한 에러 처리 및 로깅

### 데이터베이스 설계
다음 컬렉션들을 구현해야 합니다:
- Users: 사용자 정보
- Coins: 코인 정보
- Wallets: 사용자별 코인 보유량
- Orders: 거래 주문 정보
- Transactions: 체결된 거래 정보
- PriceHistory: 코인 가격 변동 기록

## API 엔드포인트

### 사용자 관리
- POST /api/auth/register: 새 사용자 등록
- POST /api/auth/login: 로그인 및 JWT 발급

### 코인 정보
- GET /api/coins: 지원하는 코인 목록 조회
- GET /api/coins/:id: 특정 코인 정보 조회
- GET /api/coins/:id/history: 특정 코인의 가격 변동 기록 조회

### 지갑 관리
- GET /api/wallets: 사용자의 모든 코인 보유량 조회
- POST /api/wallets/deposit: 코인 입금
- POST /api/wallets/withdraw: 코인 출금

### 거래 기능
- POST /api/orders: 새 주문 생성
- GET /api/orders: 사용자의 주문 내역 조회
- GET /api/orders/:id: 특정 주문 상세 조회
- DELETE /api/orders/:id: 미체결 주문 취소
- GET /api/transactions: 사용자의 거래 내역 조회

### WebSocket 이벤트
- `COIN_UPDATE`: 실시간 코인 가격 업데이트
- `ORDER_UPDATE`: 주문 상태 업데이트
- `TRANSACTION_CREATED`: 새 거래 체결 알림

## 추가 도전 과제 (선택 사항)
- 코인 가격 변동 패턴 알고리즘 구현 (랜덤 변동 대신)
- 거래 체결 매칭 엔진 구현
- 캐싱 레이어 추가 (Redis 등)
- 단위 테스트 및 통합 테스트 작성

## 평가 기준
- 코드 품질 및 구조
- API 설계 및 구현
- 실시간 데이터 처리 능력
- 데이터베이스 모델링
- 에러 처리 및 예외 상황 대응
- 코드 문서화

## 제출 방법
- GitHub 저장소에 코드 업로드
- README.md 파일에 설치 및 실행 방법 기술
- API 문서 제공 (Postman 컬렉션 또는 Swagger)

## 시작 코드

기본적인 서버 구조와 WebSocket 설정이 포함된 시작 코드가 제공됩니다. 이 코드를 기반으로 기능을 확장하세요.

제한 시간: 7일

행운을 빕니다! 