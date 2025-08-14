let chatHistory = [];

wss.on('connection', ws => {
  // 新使用者連線時，傳送歷史訊息
  chatHistory.forEach(data => {
    ws.send(JSON.stringify(data));
  });

  ws.on('message', message => {
    const data = JSON.parse(message);

    // 📨 處理使用者發送訊息
    if (data.type === 'message') {
      chatHistory.push(data);
      if (chatHistory.length > 100) chatHistory.shift();

      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    }

    // ✅ 處理加入聊天室
    if (data.type === 'join') {
      console.log(`${data.name} 加入聊天室`);

      const joinMsg = {
        type: 'message',
        name: '系統',
        text: `🔵 ${data.name} 加入聊天室`,
        time: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
      };

      chatHistory.push(joinMsg);
      if (chatHistory.length > 100) chatHistory.shift();

      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(joinMsg));
        }
      });
    }

    // ✅ 處理離開聊天室
    if (data.type === 'leave') {
      console.log(`${data.name} 離開聊天室`);

      const leaveMsg = {
        type: 'message',
        name: '系統',
        text: `🔴 ${data.name} 離開聊天室`,
        time: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
      };

      chatHistory.push(leaveMsg);
      if (chatHistory.length > 100) chatHistory.shift();

      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(leaveMsg));
        }
      });
    }
  });
});
