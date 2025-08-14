const nickname = prompt("請輸入你的暱稱") || "匿名";
const socket = new WebSocket('wss://websocket-server-kj60.onrender.com');

const chatLog = document.getElementById('chatLog');
const input = document.getElementById('msgInput');
const sendBtn = document.getElementById('sendBtn');

// 發送訊息
function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  const message = {
    type: "message",
    name: nickname,
    text: text,
    time: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
  };
  socket.send(JSON.stringify(message));
  input.value = '';
}

// 接收訊息時
socket.addEventListener('message', event => {
  const data = JSON.parse(event.data);

  if (data.type !== 'message') return;

  const li = document.createElement('li');
  li.className = data.name === nickname ? 'self' : 'other';
  li.textContent = `${data.name}: ${data.text}`;

  const timeSpan = document.createElement('span');
  timeSpan.textContent = data.time;
  timeSpan.className = 'timestamp';
  li.appendChild(timeSpan);

  chatLog.appendChild(li);
  chatLog.scrollTop = chatLog.scrollHeight;
});

// 按下 Enter 送出
input.addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    sendMessage();
  }
});

// 按下按鈕送出
sendBtn.addEventListener('click', sendMessage);

// 連線成功 → 通知加入
socket.addEventListener('open', () => {
  const join = {
    type: "join",
    name: nickname
  };
  socket.send(JSON.stringify(join));
});

// 關閉頁面前通知離開
window.addEventListener('beforeunload', () => {
  const leave = {
    type: "leave",
    name: nickname
  };
  socket.send(JSON.stringify(leave));
});
