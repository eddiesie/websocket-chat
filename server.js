const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3000 });

wss.on('connection', ws => {
  ws.on('message', data => {
    const msg = JSON.parse(data.toString());

    let broadcastText = '';
    if (msg.type === 'message') {
      broadcastText = `[${msg.name}]: ${msg.text}|||${msg.time}|||${msg.name}`;
    } else if (msg.type === 'join') {
      broadcastText = `🔵 ${msg.name} 加入聊天室。`;
    } else if (msg.type === 'leave') {
      broadcastText = `🔴 ${msg.name} 離開聊天室。`;
    }

    // 廣播訊息
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(broadcastText);
      }
    });
  });
});