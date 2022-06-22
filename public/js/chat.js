const socket = io();

// socket.on("countUpdated", (count) => {
//   console.log("The count has been updated", count);
// });

// document.querySelector("#increment").addEventListener("click", () => {
//   console.log("Clicked");
//   socket.emit("increment");
// });

// Elements
const messageForm = document.querySelector("#message-form");
const messageInput = document.querySelector("#message-input");
const messageButton = document.querySelector("#message-button");
const messages = document.querySelector("#messages");

// templates
const messagesTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

// autoscroll
const autoscroll = () => {
  // New message element
  const newMessage = messages.lastElementChild;

  // Height of the new message
  const newMessageStyles = getComputedStyle(newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

  // Visible height
  const visibleHeight = messages.offsetHeight;

  // Height of messages container
  const containerHeight = messages.scrollHeight;

  // How far have I scrolled?
  const scrollOffset = messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    messages.scrollTop = messages.scrollHeight;
  }
};

socket.on("message", (message) => {
  console.log(message);
  const html = Mustache.render(messagesTemplate, {
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  //disable button
  messageButton.setAttribute("disabled", "disabled");

  //   const message = document.querySelector("#message-input").value;
  const message = event.target.elements.messageInput.value;

  socket.emit("sendMessage", message, (error) => {
    // enabled button
    messageButton.removeAttribute("disabled");
    messageInput.value = "";
    messageInput.focus();

    if (error) {
      const html = Mustache.render(messagesTemplate, {
        message: error,
      });
      return messages.insertAdjacentHTML("beforeend", html);
    }
    console.log("message delivered");
  });
});

socket.on("locationMessage", (message) => {
  console.log(message);
  const html = Mustache.render(locationTemplate, {
    url: message.url,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  messages.insertAdjacentHTML("beforeend", html);
});

const locationSend = document.querySelector("#send-location");

locationSend.addEventListener("click", () => {
  locationSend.setAttribute("disabled", "disabled");

  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }
  navigator.geolocation.getCurrentPosition((position) => {
    // console.log(position);

    setTimeout(() => {
      locationSend.removeAttribute("disabled");
    }, 2000);
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        console.log("Location Shared");
      }
    );
  });
});
socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});
