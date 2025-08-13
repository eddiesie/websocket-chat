const nickname = prompt("請輸入你的暱稱") || "匿名";
const socket = new WebSocket('wss://websocket-server-kj60.onrender.com');


const chatLog = document.getElementById('chatLog');
const input = document.getElementById('msgInput');
const sendBtn = document.getElementById('sendBtn');

function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  const message = JSON.stringify({
    type: "message",
    name: nickname,
    text: text,
    time: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
  });
  socket.send(message);
  input.value = '';
}

// 接收訊息時
socket.addEventListener('message', event => {
  const li = document.createElement('li');
  const content = event.data;

  const [msgLine, timeText, sender] = content.split('|||');
  const isSelf = sender === nickname;

  li.textContent = msgLine;
  li.className = isSelf ? 'self' : 'other';

  if (timeText) {
    const timeSpan = document.createElement('span');
    timeSpan.textContent = timeText;
    timeSpan.className = 'timestamp';
    li.appendChild(timeSpan);
  }

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

// 連線成功，送出加入訊息
socket.addEventListener('open', () => {
  const join = JSON.stringify({ type: "join", name: nickname });
  socket.send(join);
});

// 關閉頁面前通知離開
window.addEventListener('beforeunload', () => {
  const leave = JSON.stringify({ type: "leave", name: nickname });
  socket.send(leave);
});