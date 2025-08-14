const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3000 });

let chatHistory = [];

wss.on('connection', ws => {
  chatHistory.forEach(data => {
    ws.send(JSON.stringify(data));
  });

  ws.on('message', message => {
    let data;
    try {
      data = JSON.parse(message);
    } catch (err) {
      console.warn("收到非 JSON，略過：", message);
      return;
    }

    if (data.type === 'message') {
      saveAndBroadcast(data);
    }

    if (data.type === 'join') {
      const joinMsg = {
        type: 'message',
        name: '系統',
        text: `🔵 ${data.name} 加入聊天室`,
        time: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
      };
      saveAndBroadcast(joinMsg);
    }

    if (data.type === 'leave') {
      const leaveMsg = {
        type: 'message',
        name: '系統',
        text: `🔴 ${data.name} 離開聊天室`,
        time: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
      };
      saveAndBroadcast(leaveMsg);
    }
  });
});

function saveAndBroadcast(data) {
  chatHistory.push(data);
  if (chatHistory.length > 100) chatHistory.shift();

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}