let chatHistory = [];

wss.on('connection', ws => {
  // 傳送歷史訊息給新連線者
  chatHistory.forEach(data => {
    ws.send(JSON.stringify(data));
  });

  ws.on('message', message => {
    const data = JSON.parse(message);

    if (data.type === 'message') {
      chatHistory.push(data);
      if (chatHistory.length > 100) chatHistory.shift();

      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
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
