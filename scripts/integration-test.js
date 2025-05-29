const axios = require('axios')
const WebSocket = require('ws')

const API_URL = 'http://localhost:3000/api'
const WS_URL = 'ws://localhost:3000'

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function register(username, email, password) {
  try {
    return await axios.post(API_URL + "/auth/register", { username, email, password });
  } catch (error) {
    console.error("register error:", error.response?.data || error.message);
  }
}

async function Login(email, password) {
  try {
    const res = await axios.post(API_URL + "/auth/login", { email, password });
    return res.data.token;;
  } catch (error) {
    console.error("login error:", error.response?.data || error.message);
  }
}

async function getUserInfo(token) {
  try {
    const res = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('getUserInfo response:', res.data);
    return res.data.user; // { _id, username, email, ... }
  } catch (err) {
    console.error('getUserInfo error:', err.response?.data || err.message);
    return null;
  }
}
async function setMarket(token) {
  try {
    const res = await axios.post(
      API_URL + "/admin/set-market",
      {},
      {
        headers: { Authorization: "Bearer " + token }
      }
    );
    console.log("setMarket success:", res.data);
  } catch (error) {
    console.error("set-market error:", error.response?.data || error.message);
  }
}

async function getSubjectCoinId(token) {
  try {
    const res = await axios.get(`${API_URL}/coins`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const activeCoin = res.data.data.find(c => c.active === true);
    if (!activeCoin) throw new Error('활성화된 코인을 찾을 수 없습니다.');
    return activeCoin._id;
  } catch (error) {
    console.error('getFirstActiveCoinId error:', error.message);
    return null;
  }
}
async function seedWallet(token, userId) {
  try {
    const res = await axios.post(
      API_URL + "/admin/seed-wallet",
      { userId: userId },
      {
        headers: { Authorization: "Bearer " + token }
      }
    );
    console.log("seedWallet success:", res.data);
  } catch (error) {
    console.error("seedWallet error:", error.response?.data || error.message);
  }
}

async function setUserAsAdmin(userId, isAdmin = true) {
  try {
    await axios.put(`${API_URL}/admin/set-role/${userId}`, { isAdmin });
    console.log(`사용자 ${userId} → ${isAdmin ? 'admin' : 'user'} 역할 설정됨`);
  } catch (err) {
    console.log(`관리자 설정 실패 (${userId}):`, err.response?.data || err.message);
  }
}

async function placeOrder(token, type, coinId, price, amount) {
  try {
    const res = await axios.post(
      API_URL + "/orders",
      { type, coinId, price, amount },
      {
        headers: { Authorization: "Bearer " + token }
      }
    );
    //console.log("placeOrder success:", res.data);
    return res.data;
  } catch (error) {
    console.error("placeOrder error:",  error.response?.data || error.message);
  }
}

async function cancelOrder(token, orderId) {
  try {
    await axios.delete(`${API_URL}/orders/${orderId}`, {
      headers: { Authorization: "Bearer " + token }
    });
  } catch (error) {
    console.error("cancelOrder error:", error.response?.data || error.message);
  }
}
async function getOrders(token) {
  try {
    const res = await axios.get(API_URL + "/orders", {
      headers: { Authorization: "Bearer " + token }
    });
    return res.data;
  } catch (error) {
    console.error("getOrders error:", error.response?.data || error.message);
  }
}

async function getTransactions(token) {
  try {
    const res = await axios.get(API_URL + "/transactions", {
      headers: { Authorization: "Bearer " + token }
    });
    return res.data;
  } catch (error) {
    console.error("getTransactions error:", error.response?.data || error.message);
  }
}

async function getWallets(token) {
  try {
    const res = await axios.get(API_URL + "/wallets", {
      headers: { Authorization: "Bearer " + token }
    });
    return res.data;
  } catch (error) {
    console.error("getTransactions error:", error.response?.data || error.message);
  }
}

async function connectWS(token, userId, subjectCoinId) {
  return new Promise((resolve, reject) => {
    try {
      const ws = new WebSocket(WS_URL, {
        headers: { Authorization: "Bearer " + token }
      });

      ws.on("open", () => {
        console.log(userId + " WebSocket connected");
        ws.send(JSON.stringify({ type: 'AUTH', userId: userId }));
        ws.send(JSON.stringify({ type: 'SUBSCRIBE', coinId: subjectCoinId }));
      });

      ws.on("message", (data) => {
        try {
          const message = JSON.parse(data);
          if (message.type === "COIN_UPDATE" && message.data.length > 0) {
              console.log(`Subject Coin [${message.data[0].symbol}] By ${userId}`);
          }
          console.log(userId + " WS:", message.type);
        } catch (parseErr) {
          console.error("WebSocket message parse error:", parseErr.message);
        }
      });

      ws.on("error", (err) => {
        console.error(label + " WebSocket error:", err.message);
        reject(err);
      });

      setTimeout(() => resolve(ws), 1000);
    } catch (error) {
      console.error("connectWS error:", error.response?.data || error.message);
      reject(error);
    }
  });
}

(async () => {
  console.log('--- 통합테스트 시작 ---')
  //await register('User1', 'user1@test.com', 'pass123')
  //await register('User2', 'user2@test.com', 'pass123')
  const token1 = await Login('user1@test.com', 'pass123')
  const token2 = await Login('user2@test.com', 'pass123')
  console.log('User1 Token:', token1)
  console.log('User2 Token:', token2)
  if (!token1 || !token2) {
    console.error('로그인 실패');
    return;
  }
  console.log('로그인 성공')


  const user1Info = await getUserInfo(token1)
  const user2Info = await getUserInfo(token2)
  await setUserAsAdmin(user1Info.id, true);
  await setUserAsAdmin(user2Info.id, true);

  await setMarket(token1);
  const subjectCoinId = await getSubjectCoinId(token1);
  
  await seedWallet(token1, user1Info.id);
  await seedWallet(token2, user2Info.id);
  console.log('지갑 세팅 완료')

  if(subjectCoinId) {
    const ws1 = await connectWS(token1, user1Info.id, subjectCoinId)
    const ws2 = await connectWS(token2, user2Info.id, subjectCoinId)
    await sleep(1000)

    const order1 = await placeOrder(token1, 'buy', subjectCoinId, 10000, 1)
    console.log('User1 매수 주문 생성:', order1._id)
    await cancelOrder(token1, order1._id)
    console.log('User1 주문 취소 완료')
    const od1 = await getOrders(token1)
    console.log('User1 주문 내역:', od1)
 
    await sleep(1000)
    const order2 = await placeOrder(token1, 'buy', subjectCoinId, 10000, 1)
    console.log('User1 매수 주문 생성:', order2._id)

    const order3 = await placeOrder(token2, 'sell', subjectCoinId, 20000, 1)
    console.log('User2 미체결 매도 주문 생성:', order3._id)
    await cancelOrder(token2, order3._id)
    console.log('User2 미체결 주문 취소 완료')

    const order4 = await placeOrder(token2, 'sell', subjectCoinId, 10000, 1)
    console.log('User2 매도 주문 생성:', order4._id)

    const tx1 = await getTransactions(token1)
    const tx2 = await getTransactions(token2)
    console.log('User1 거래 내역:', tx1)
    console.log('User2 거래 내역:', tx2)

    const wa1 = await getWallets(token1)
    const wa2 = await getWallets(token2)
    console.log('User1 잔고 상황:', wa1)
    console.log('User2 잔고 상황:', wa2)
    
    ws1.close()
    ws2.close()
  }

  console.log('--- 통합테스트 완료 ---')
})()
