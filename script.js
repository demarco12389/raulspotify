const songs = [
  { title: "SÓ LAMENTO", file: "msc/solamento.mp3", cover: "img/solamento.png" },
  { title: "GORDINHO SACANA", file: "msc/gordinho.mp3", cover: "img/gordinho.png" },
  { title: "NINFETA", file: "msc/ninfeta.mp3", cover: "img/ninfeta.png" },
  { title: "4AM", file: "msc/4am.mp3", cover: "img/4am.png" }
];

let currentSongIndex = 0;
let timer = null;
let currentUser = null;

const loginBox = document.getElementById("login-box");
const playerBox = document.getElementById("player");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginMsg = document.getElementById("login-msg");

const audio = document.getElementById("audio");
const cover = document.getElementById("cover");
const title = document.getElementById("title");
const author = document.getElementById("author");
const playBtn = document.getElementById("play");
const pauseBtn = document.getElementById("pause");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const progress = document.getElementById("progress");
const volume = document.getElementById("volume");
const currentTimeEl = document.getElementById("current-time");
const remainingTimeEl = document.getElementById("remaining-time");
const rankingEl = document.getElementById("ranking");

// -------- LOGIN --------
loginBtn.addEventListener("click", () => {
  const name = usernameInput.value.trim();
  const pass = passwordInput.value.trim();
  if (!name || !pass) {
    loginMsg.textContent = "Digite nome e senha!";
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || {};

  if (!users[name]) {
    // Cria nova conta
    users[name] = { password: pass, seconds: 0 };
    localStorage.setItem("users", JSON.stringify(users));
    currentUser = name;
    entrar();
  } else {
    // Valida login
    if (users[name].password === pass) {
      currentUser = name;
      entrar();
    } else {
      loginMsg.textContent = "Senha incorreta!";
    }
  }
});

function entrar() {
  loginBox.style.display = "none";
  playerBox.style.display = "block";
  loginMsg.textContent = "";
  updateRanking();
}

logoutBtn.addEventListener("click", () => {
  currentUser = null;
  playerBox.style.display = "none";
  loginBox.style.display = "block";
});

// -------- PLAYER --------
function loadSong(index) {
  audio.src = songs[index].file;
  cover.src = songs[index].cover;
  title.textContent = songs[index].title;
  author.textContent = "Raul Estelionato";
  audio.load();
}

function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec < 10 ? "0" + sec : sec}`;
}

// -------- RANKING --------
function updateRanking() {
  let users = JSON.parse(localStorage.getItem("users")) || {};
  rankingEl.innerHTML = "";

  const sorted = Object.entries(users).sort((a, b) => b[1].seconds - a[1].seconds);

  sorted.forEach(([user, data]) => {
    const li = document.createElement("li");
    const min = Math.floor(data.seconds / 60);
    const sec = data.seconds % 60;
    li.textContent = `${user} — ${min} min ${sec} seg`;
    if (user === currentUser) {
      li.style.fontWeight = "bold";
      li.style.color = "#1db954";
    }
    rankingEl.appendChild(li);
  });
}

function addListeningSecond() {
  let users = JSON.parse(localStorage.getItem("users")) || {};
  if (!users[currentUser]) return;
  users[currentUser].seconds++;
  localStorage.setItem("users", JSON.stringify(users));
  updateRanking();
}

// -------- EVENTOS --------
playBtn.addEventListener("click", () => {
  audio.play();
  if (!timer) {
    timer = setInterval(() => {
      if (!audio.paused && currentUser) {
        addListeningSecond();
      }
    }, 1000);
  }
});

pauseBtn.addEventListener("click", () => {
  audio.pause();
});

prevBtn.addEventListener("click", () => {
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  loadSong(currentSongIndex);
  audio.play();
});

nextBtn.addEventListener("click", () => {
  currentSongIndex = (currentSongIndex + 1) % songs.length;
  loadSong(currentSongIndex);
  audio.play();
});

audio.addEventListener("timeupdate", () => {
  progress.value = (audio.currentTime / audio.duration) * 100 || 0;
  currentTimeEl.textContent = formatTime(audio.currentTime);
  if (!isNaN(audio.duration)) {
    let timeLeft = audio.duration - audio.currentTime;
    remainingTimeEl.textContent = "-" + formatTime(timeLeft);
  }
});

progress.addEventListener("input", () => {
  audio.currentTime = (progress.value / 100) * audio.duration;
});

volume.addEventListener("input", () => {
  audio.volume = volume.value / 100;
});

audio.addEventListener("ended", () => {
  nextBtn.click();
});

audio.addEventListener("loadedmetadata", () => {
  remainingTimeEl.textContent = "-" + formatTime(audio.duration);
});

loadSong(currentSongIndex);
