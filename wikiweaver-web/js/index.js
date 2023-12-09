function init() {
  connect();
  CreateNicerExample();
}

async function HandleStartGameClicked() {
  let code = localStorage.getItem("code");

  if (code == undefined) {
    console.log("failed to start lobby: code is undefined");
    return;
  }

  let startPage = document.getElementById("start-page-input").value;
  let goalPage = document.getElementById("goal-page-input").value;

  if (!startPage) {
    console.log(`failed to start lobby: invalid start page '${startPage}'`);
    return;
  }

  if (!goalPage) {
    console.log(`failed to start lobby: invalid goal page '${goalPage}'`);
    return;
  }

  if (startPage == goalPage) {
    console.log(
      "failed to start lobby: start and goal pages cannot have the same value"
    );
    return;
  }

  let startMessage = JSON.stringify({
    type: "start",
    code: code,
    startpage: startPage,
    goalpage: goalPage,
  });

  sendMessage(startMessage);
}

function SetCode(code) {
  let codeElement = document.getElementById("code");
  codeElement.innerHTML = code;

  let color = "--red";
  let textTransform = "none";

  if (code.length === 4) {
    color = "--green";
    textTransform = "uppercase";
  }

  codeElement.style.background = getComputedStyle(
    document.documentElement
  ).getPropertyValue(color);
  codeElement.style.textTransform = textTransform;
}

function AddLeaderboardEntry(username, clicks, pages) {
  let color = UsernameToColor(username);
  if (color === undefined) return;

  leaderboard = document.getElementById("leaderboard");
  leaderboard.firstElementChild.insertAdjacentHTML(
    "beforeend",
    `<tr id="leaderboard-row-${username}">
  <td data-cell="color" style="color: ${color}">⬤</td>
  <td data-cell="username">${username}</td>
  <td data-cell="clicks">${clicks}</td>
  <td data-cell="pages">${pages}</td>
  <td data-cell="time">--:--</td>
</tr>`
  );
}

function UpdateLeaderboardEntry(username, clicks, pages) {
  children = document.getElementById(`leaderboard-row-${username}`).children;
  children[2].innerHTML = clicks;
  children[3].innerHTML = pages;
}

function ClearLeaderboard() {
  leaderboard = document.getElementById("leaderboard");

  // Dont not remove the leaderboard header
  const [_, ...rows] = leaderboard.firstElementChild.children;
  for (elem of rows) {
    elem.remove();
  }
}

document.addEventListener("DOMContentLoaded", () => init(), false);
