const WebSocket = require('ws');
const Coin = require('../models/Coin');
const PriceHistory = require('../models/PriceHistory');

// 클라이언트 관리
const clients = new Map();

// 코인의 최근 가격 캐싱위한 맵
const coinMemory = new Map();


// 코인 가격 업데이트 관리
let updateInterval;
const PRICE_UPDATE_INTERVAL = process.env.PRICE_UPDATE_INTERVAL || 1000;

// WebSocket 서버 설정
function setupWebSocket(wss) {
  wss.on('connection', (ws) => {
    // 클라이언트 연결 시 고유 ID 생성
    const clientId = generateClientId();
    clients.set(clientId, { ws, userId: null, subscriptions: [] });
    console.log(`새 클라이언트 연결됨: ${clientId}`);
    //(추가) ws에 clientId 저장
    ws.clientId = clientId; 

    // 초기 코인 데이터 전송
    sendInitialCoinData(ws);
    
    // 클라이언트 메시지 처리
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        handleClientMessage(clientId, data);
      } catch (error) {
        console.error('메시지 처리 중 에러:', error);
        sendErrorMessage(ws, 'Invalid message format');
      }
    });
    
    // 연결 종료 처리
    ws.on('close', () => {
      console.log(`클라이언트 연결 종료: ${clientId}`);
      clients.delete(clientId);
      
      // 모든 클라이언트가 연결 종료되면 가격 업데이트 중지
      if (clients.size === 0 && updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
      }
    });
    
    // 에러 처리
    ws.on('error', (error) => {
      console.error(`클라이언트 에러 (${clientId}):`, error);
    });
    
    // 코인 가격 업데이트 시작 (첫 클라이언트 연결 시에만)
    if (!updateInterval) {
      startCoinPriceUpdates(wss);
    }
  });
}

// 고유 클라이언트 ID 생성
function generateClientId() {
  return Math.random().toString(36).substring(2, 15);
}

// 초기 코인 데이터 전송
async function sendInitialCoinData(ws) {
  try {
    const coins = await Coin.find({ active: true });
    
    ws.send(JSON.stringify({
      type: 'COIN_UPDATE',
      data: coins.map(coin => ({
        id: coin._id,
        symbol: coin.symbol,
        name: coin.name,
        price: coin.currentPrice,
        priceChange24h: coin.priceChangePercent24h,
        volume: coin.dailyVolume
      }))
    }));
  } catch (error) {
    console.error('초기 코인 데이터 전송 오류:', error);
  }
}

// 클라이언트 메시지 처리
async function handleClientMessage(clientId, data) {
  const client = clients.get(clientId);
  if (!client) return;
  
  const { ws } = client;
  
  console.log(`클라이언트(${clientId}) 메시지 수신:`, data);

  switch (data.type) {
    case 'AUTH':
      // 사용자 인증 처리
      client.userId = data.userId;
      break;
    
    case 'SUBSCRIBE':
      // 특정 코인 구독 처리
      if (data.coinId && !client.subscriptions.includes(data.coinId.toString())) {
        client.subscriptions.push(data.coinId.toString());
      }
      break;
    
    case 'UNSUBSCRIBE':
      // 구독 취소 처리
      if (data.coinId) {
        client.subscriptions = client.subscriptions.filter(id => id !== data.coinId.toString());
      }
      break;
    
    default:
      sendErrorMessage(ws, 'Unknown message type');
  }
}

// 코인 최근 가격 로드
function getRecentPrices(coinId) {
  if (!coinMemory.has(coinId)) coinMemory.set(coinId, []);
  return coinMemory.get(coinId);
}

// 코인 최근 가격 업데이트
function updateRecentPrices(coinId, newPrice, maxLength = 10) {
  const history = getRecentPrices(coinId);
  const updated = [...history.slice(-maxLength + 1), newPrice];
  coinMemory.set(coinId, updated);
  return updated;
}

// 가격 소수점 자리수 계산
function getDecimalPlaces(price) {
  if (price >= 1000) return 2;
  if (price >= 100) return 3;
  if (price >= 1) return 4;
  if (price >= 0.1) return 5;
  return 6; // 극저가 코인
}

// 코인 가격 업데이트 시작
function startCoinPriceUpdates(wss) {
  updateInterval = setInterval(async () => {
    try {
      // 모든 코인 조회
      const coins = await Coin.find({ active: true });
      
      // 각 코인 가격 업데이트
      for (const coin of coins) {
        // 가격 변동 생성 (-2% ~ +2%)
        //const priceChange = coin.currentPrice * (Math.random() * 0.04 - 0.02);
        //const newPrice = Math.max(0.01, coin.currentPrice + priceChange);
        //const roundedPrice = Math.round(newPrice * 100) / 100;
        
        //이동 평균 기준 변동 패턴으로 변경
        const coinId = coin._id.toString();
        const recentPrices = getRecentPrices(coinId);

        // 이평 계산
        const avg =
          recentPrices.length > 0
          ? recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length
          : coin.currentPrice;

        const reversion = (avg - coin.currentPrice) * 0.3;
        const noise = (Math.random() * 0.01 - 0.005) * coin.currentPrice;
        const priceChange = reversion + noise;

        const newPrice = Math.max(0.00000001, coin.currentPrice + priceChange);

        // 가격에 따라 반올림 자릿수 결정
        const decimalPlaces = getDecimalPlaces(coin.currentPrice);
        const roundedPrice = parseFloat(newPrice.toFixed(decimalPlaces));
        
        // 코인 가격 업데이트
        updateRecentPrices(coinId, roundedPrice);
        
        // 가격 이력 기록 (일정 간격으로만 기록하면 더 효율적)
        await coin.updatePrice(roundedPrice);
        await PriceHistory.recordPrice(coin._id, roundedPrice);
        
        // 업데이트된 코인 정보
        const updatedCoin = {
          id: coin._id,
          symbol: coin.symbol,
          price: roundedPrice,
          priceChange24h: coin.priceChangePercent24h
        };
        
        // 모든 클라이언트에게 업데이트 전송 -> (수정) 구독 여부 체크
        broadcastCoinUpdate(wss, updatedCoin);
      }
    } catch (error) {
      console.error('코인 가격 업데이트 오류:', error);
    }
  }, PRICE_UPDATE_INTERVAL);
}

// 코인 업데이트 브로드캐스트
function broadcastCoinUpdate(wss, coinData) {
  const message = JSON.stringify({
    type: 'COIN_UPDATE',
    data: coinData
  });
  wss.clients.forEach(c => {
    const client = clients.get(c.clientId);
    if (!client) return; // 클라이언트가 존재하지 않으면 무시
    if (client.ws.readyState === WebSocket.OPEN){
      // (수정) 구독 여부 체크
      if (client.subscriptions.includes(coinData.id.toString())) { 
        //console.log(`메시지 전송: ${client.userId} - ${coinData.symbol} - ${coinData.price}`);
        client.ws.send(message);
      }
    }
  });
}

// 에러 메시지 전송
function sendErrorMessage(ws, message) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'ERROR',
      message
    }));
  }
}

// 특정 사용자에게 주문 상태 업데이트 전송
function sendOrderUpdate(userId, orderData) {
  clients.forEach(client => {
    if (client.userId === userId && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify({
        type: 'ORDER_UPDATE',
        data: orderData
      }));
    }
  });
}

// 새 거래 알림 전송
function sendTransactionNotification(buyerId, sellerId, transactionData) {
  clients.forEach(client => {
    if ((client.userId === buyerId || client.userId === sellerId) && 
        client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify({
        type: 'TRANSACTION_CREATED',
        data: transactionData
      }));
    }
  });
}

module.exports = setupWebSocket;

// 추가 기능들을 외부로 내보내 다른 컨트롤러에서 사용할 수 있게 함
module.exports.sendOrderUpdate = sendOrderUpdate;
module.exports.sendTransactionNotification = sendTransactionNotification; 