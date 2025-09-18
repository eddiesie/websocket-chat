const nickname = prompt("首次開啟需要等候1-2分即可使用。請輸入你的暱稱") || "匿名";
const socket = new WebSocket('wss://websocket-server-kj60.onrender.com');

const chatLog = document.getElementById('chatLog');
const input = document.getElementById('msgInput');
const sendBtn = document.getElementById('sendBtn');

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

socket.addEventListener('message', event => {
  let data;
  try {
    data = JSON.parse(event.data);
  } catch (err) {
    console.warn("收到非 JSON 資料，略過：", event.data);
    return;
  }

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

input.addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    sendMessage();
  }
});

sendBtn.addEventListener('click', sendMessage);

socket.addEventListener('open', () => {
  const join = {
    type: "join",
    name: nickname
  };
  socket.send(JSON.stringify(join));
});

window.addEventListener('beforeunload', () => {
  const leave = {
    type: "leave",
    name: nickname
  };
  socket.send(JSON.stringify(leave));
});