async function init(e) {
  await restore();
}

async function restore() {
  const options = await chrome.storage.local.get()
  document.querySelector("#url").value = options.url;
}

async function save(e) {
  e.preventDefault();

  const urlElem = document.querySelector("#url");

  const url = new URL(urlElem.value.toLowerCase() || urlElem.placeholder);

  await chrome.storage.local.set({ url: url.origin });
  // TODO: show saved succeeded in some way

  if ((await chrome.scripting.getRegisteredContentScripts({ ids: ["join-lobby"] })).length > 0) {
    await chrome.scripting.unregisterContentScripts({ ids: ["join-lobby"] });
  }

  // For some reason keeping the port here made it so the script was not
  // injected at localhost, when the server was set to http://localhost:3000
  url.port = "";

  const scripts = [
    {
      id: "join-lobby",
      js: ["/content/join-lobby.js"],
      matches: [`${url.origin}/*`],
    }
  ]

  await chrome.scripting.registerContentScripts(scripts);
}

document.addEventListener("DOMContentLoaded", () => init(), false);
document.querySelector("form").addEventListener("submit", save);
