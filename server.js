const WebSocket = require('ws');
const PORT = process.env.PORT || 3000;
const wss = new WebSocket.Server({ port: PORT });
console.log(`✅ WebSocket Server listening on port ${PORT}`);

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
      console.log("收到非 JSON 格式，略過：", message);
      return;
    }

    if (data.type === 'message') {
      saveAndBroadcast(data);
    }

    if (data.type === 'join') {
      console.log(`${data.name} 加入聊天室`);
      const joinMsg = {
        type: 'message',
        name: '系統',
        text: `🔵 ${data.name} 加入聊天室。`,
        time: getTime()
      };
      saveAndBroadcast(joinMsg);
    }

    if (data.type === 'leave') {
      console.log(`${data.name} 離開聊天室`);
      const leaveMsg = {
        type: 'message',
        name: '系統',
        text: `🔴 ${data.name} 離開聊天室。`,
        time: getTime()
      };
      saveAndBroadcast(leaveMsg);
    }
  });
});

function saveAndBroadcast(data) {
  chatHistory.push(data);
  if (chatHistory.length > 100) chatHistory.shift();

  const json = JSON.stringify(data);

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(json);
    }
  });
}

function getTime() {
  return new Date().toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit'
  });
}