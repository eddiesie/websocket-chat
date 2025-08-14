let chatHistory = [];

wss.on('connection', ws => {
  // 🕘 傳送歷史訊息給新連線使用者
  chatHistory.forEach(data => {
    ws.send(JSON.stringify(data));
  });

  ws.on('message', message => {
    let data;
    try {
      data = JSON.parse(message); // ⛑️ 防呆處理，避免接收到非 JSON
    } catch (err) {
      console.warn('收到非 JSON 資料，略過：', message);
      return;
    }

    // 📨 處理一般訊息
    if (data.type === 'message') {
      saveAndBroadcast(data);
    }

    // ✅ 加入聊天室
    if (data.type === 'join') {
      console.log(`${data.name} 加入聊天室`);

      const joinMsg = {
        type: 'message',
        name: '系統',
        text: `🔵 ${data.name} 加入聊天室`,
        time: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
      };

      saveAndBroadcast(joinMsg);
    }

    // ❌ 離開聊天室
    if (data.type === 'leave') {
      console.log(`${data.name} 離開聊天室`);

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

// 🧠 儲存訊息並廣播的共用函式
function saveAndBroadcast(data) {
  chatHistory.push(data);
  if (chatHistory.length > 100) chatHistory.shift();

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}
