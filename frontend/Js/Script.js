// Função de Gif
const apiKey = "bN4Sepd2jEzO4MJ8XxSp7fGwhbn3QCvW";
const popup = document.getElementById("popup");
const openPopupBtn = document.getElementById("openPopupBtn");
const closePopupBtn = document.querySelector(".close-btn");
const searchInput = document.getElementById("searchInput");
const gifContainer = document.getElementById("gifContainer");
const selectGifBtn = document.getElementById("selectGifBtn");
let selectedGifUrl = "";

openPopupBtn.addEventListener("click", () => {
  popup.style.display = "flex";
});

closePopupBtn.addEventListener("click", () => {
  popup.style.display = "none";
});

searchInput.addEventListener("input", async () => {
  const query = searchInput.value.trim();
  if (query.length === 0) {
    gifContainer.innerHTML = "";
    return;
  }

  try {
    const response = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${query}&limit=12`
    );
    const data = await response.json();
    displayGifs(data.data);
  } catch (error) {
    console.error("Erro ao buscar GIFs:", error);
  }
});

function displayGifs(gifs) {
  gifContainer.innerHTML = "";
  gifs.forEach((gif) => {
    const img = document.createElement("img");
    img.src = gif.images.fixed_height.url;
    img.classList.add("gif-item");
    img.addEventListener("click", () => selectGif(gif.images.fixed_height.url));
    gifContainer.appendChild(img);
  });
}

function selectGif(gifUrl) {
  const gifItems = document.querySelectorAll(".gif-item");
  gifItems.forEach((item) => item.classList.remove("selected"));
  selectedGifUrl = gifUrl;
  gifItems.forEach((item) => {
    if (item.src === gifUrl) {
      item.classList.add("selected");
    }
  });
}

selectGifBtn.addEventListener("click", () => {
  if (selectedGifUrl) {
    sendGifMessage(selectedGifUrl);
    popup.style.display = "none";
  } else {
    alert("Selecione um GIF antes de enviar!");
  }
});

function sendGifMessage(gifUrl) {
  const message = {
    userId: user.id,
    userName: user.name,
    userColor: user.color,
    type: "gif",
    url: gifUrl,
  };

  websocket.send(JSON.stringify(message));

  const gifMessage = createMessageSelfElement(
    `<img src="${gifUrl}" alt="GIF" style="max-width: 250px; max-height: 250px;"/>`
  );
  chatMessages.appendChild(gifMessage);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

//Login
const login = document.querySelector(".login");
const loginForm = document.querySelector(".login__form");
const loginInput = document.querySelector(".login__input");

//Chat
const chat = document.querySelector(".chat");
const chatForm = document.querySelector(".chat__form");
const chatInput = document.querySelector(".chat__input");
const chatMessages = document.querySelector(".chat__messages");

const colors = [
  "cadetblue",
  "darkgoldenrod",
  "darkslateblue",
  "cornflowerblue",
  "darkkhaki",
  "hotpink",
  "gold",
];

const user = { id: "", name: "", color: "" };

let websocket;

const createMessageSelfElement = (content) => {
  const div = document.createElement("div");

  div.classList.add("message--self");
  div.innerHTML = content;

  return div;
};

const createMessageOtherElement = (content, sender, senderColor) => {
  const div = document.createElement("div");
  const span = document.createElement("span");

  div.classList.add("message--other");
  span.classList.add("message--sender");

  span.style.color = senderColor;
  span.textContent = sender;

  div.appendChild(span);
  div.innerHTML += content;

  return div;
};

const getRandomColor = () => {
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
};

const scrollScreen = () => [
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: "smooth",
  }),
];


const processMessage = ({ data }) => {
  try {
    const parsedData = JSON.parse(data);

    if (parsedData.type === "gif" && parsedData.url) {
      if (parsedData.userId !== user.id) {
        const gifMessage = createMessageOtherElement(
          `<img src="${parsedData.url}" alt="GIF" style="max-width: 250px; max-height: 250px;"/>`,
          parsedData.userName,
          parsedData.userColor
        );
        chatMessages.appendChild(gifMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        scrollScreen();
      }
    } else if (parsedData.content && parsedData.content.trim() !== "") {
      let element;
      if (parsedData.userId === user.id) {
        element = createMessageSelfElement(parsedData.content);
        scrollScreen();
      } else {
        element = createMessageOtherElement(
          parsedData.content,
          parsedData.userName,
          parsedData.userColor
        );
        scrollScreen();
      }

      chatMessages.appendChild(element);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      scrollScreen();
    } else {
      console.error("Erro: Elemento da mensagem está indefinido ou vazio.");
    }
  } catch (error) {
    console.error("Erro ao processar mensagem do WebSocket:", error);
  }
};

const handleLogin = (event) => {
  event.preventDefault();

  user.id = crypto.randomUUID();
  user.name = loginInput.value;
  user.color = getRandomColor();

  login.style.display = "none";
  chat.style.display = "flex";

  websocket = new WebSocket("wss://mhat-chat-de-mensagens-rei9.onrender.com");
  websocket.onmessage = processMessage;
};

const sendMessage = (event) => {
  event.preventDefault();

  const message = {
    userId: user.id,
    userName: user.name,
    userColor: user.color,
    content: chatInput.value,
  };

  websocket.send(JSON.stringify(message));

  chatInput.value = "";
};

loginForm.addEventListener("submit", handleLogin);
chatForm.addEventListener("submit", sendMessage);
