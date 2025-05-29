const WebSocket = require('ws');

const socket = new WebSocket('ws://localhost:3000');

socket.on('open', () => {
  console.log('✅ 연결됨');
  socket.send(JSON.stringify({ type: 'AUTH', userId: 'test-user' }));
  socket.send(JSON.stringify({ type: 'SUBSCRIBE', symbol: 'BTC' }));
});

socket.on('message', (data) => {
  console.log('📩 메시지 수신:', data.toString());
});

socket.on('close', () => {
  console.log('❌ 연결 종료');
});
