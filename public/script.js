AOS.init();

function changeString() {
    document.getElementById('learn-to-code').innerHTML = "Learn To EARN";
    if (document.getElementById('learn-to-code').innerHTML === "Learn To EARN") {
        setTimeout(() => {
            document.getElementById('learn-to-code').innerHTML = "Learn to code";
        }, 1000);
    }
}

async function askGemini(prompt) {
  

  try {
    const response = await fetch('http://localhost:3000/ask-gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }), // Ensure this is correct
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    displayResponse(data.response);
  } catch (error) {
    console.error('Error fetching response:', error);
  }
}
  
  function displayResponse(response) {
    const container = document.getElementById('ans-sec');
    container.innerHTML = `<p> ${response}</p>`;
  }
  
  // Example usage
  document.getElementById('submit-button').addEventListener('click', () => {
    const prompt = document.getElementById('input').value;
    document.getElementById('ans-sec').innerHTML='';
    askGemini(prompt);
  });
//chat - implementation
const socket = io();

document.getElementById('chat-button').addEventListener('click', () => {
  const message = document.getElementById('chat-input').value;
  socket.emit('user-message', message);
  document.getElementById('chat-input').value = '';
});

socket.on('message', (message) => {
  const chatText = document.querySelector('.chat-text');
  if (chatText) {
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    messageElement.style.backgroundColor="black";
    messageElement.style.margin="5px";
    chatText.appendChild(messageElement);
  } else {
    console.error('Chat text container not found');
  }
});



