let chatHistory = [];

wss.on('connection', ws => {
  // 傳送歷史紀錄給新連線者
  chatHistory.forEach(msg => {
    ws.send(msg);
  });

  ws.on('message', message => {
    const data = JSON.parse(message);

    if (data.type === 'message') {
      const formatted = `${data.name}: ${data.text}|||${data.time}|||${data.name}`;
      chatHistory.push(formatted);

      // 限制紀錄數量（避免爆記憶體）
      if (chatHistory.length > 100) {
        chatHistory.shift(); // 移除最舊的訊息
      }

      // 廣播給所有人
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(formatted);
        }
      });
    }

    if (data.type === 'join') {
      console.log(`${data.name} 加入聊天室`);
    }

    if (data.type === 'leave') {
      console.log(`${data.name} 離開聊天室`);
    }
  });
});
