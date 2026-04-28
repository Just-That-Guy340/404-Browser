let tabs = [];
let currentTabIndex = 0;

const frame = document.getElementById('mainFrame');
const tabsBar = document.getElementById('tabsBar');
const urlInput = document.getElementById('urlInput');

// Multiple public proxies — try in order
const proxyList = [
  (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
  (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  (u) => `https://proxy.cors.sh/${u}`,
];

function getProxiedURL(url) {
  if (!url) return '';
  if (!url.startsWith('http')) url = 'https://' + url;
  
  // Rotate proxies to increase chance of working against Securly
  const proxyIndex = Math.floor(Math.random() * proxyList.length);
  return proxyList[proxyIndex](url);
}

function getDomain(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url.substring(0, 30);
  }
}

function createTab(url = "") {
  const tab = {
    id: Date.now(),
    title: url ? getDomain(url) : "New Tab",
    url: url,
    proxied: url ? getProxiedURL(url) : ""
  };
  tabs.push(tab);
  currentTabIndex = tabs.length - 1;
  renderTabs();
  if (url) {
    frame.src = tab.proxied;
    urlInput.value = url;
  } else {
    showNewTab();
  }
}

function renderTabs() {
  tabsBar.innerHTML = '';
  tabs.forEach((tab, i) => {
    const el = document.createElement('div');
    el.className = `tab ${i === currentTabIndex ? 'active' : ''}`;
    el.textContent = tab.title.length > 25 ? tab.title.slice(0, 22) + '...' : tab.title;
    el.onclick = () => switchTab(i);
    tabsBar.appendChild(el);
  });
}

function switchTab(i) {
  currentTabIndex = i;
  renderTabs();
  const tab = tabs[i];
  if (tab.proxied) {
    frame.src = tab.proxied;
    urlInput.value = tab.url || '';
  } else {
    showNewTab();
  }
}

function loadURL() {
  let input = urlInput.value.trim();
  if (!input) return;

  tabs[currentTabIndex].url = input;
  tabs[currentTabIndex].proxied = getProxiedURL(input);
  tabs[currentTabIndex].title = getDomain(input);

  frame.src = tabs[currentTabIndex].proxied;
  renderTabs();
}

function reloadPage() { if (frame.contentWindow) frame.contentWindow.location.reload(); }
function goBack() { try { frame.contentWindow.history.back(); } catch(e){} }
function goForward() { try { frame.contentWindow.history.forward(); } catch(e){} }

function showNewTab() {
  frame.srcdoc = `
    <body class="newtab">
      <h1>404</h1>
      <div class="glitch">BROWSER ONLINE</div>
      <p>Simple Helios-style proxy.<br>Enter URL above and press Go.<br>Against Securly — rotate proxies.</p>
    </body>`;
  urlInput.value = '';
}

// Event listeners
document.getElementById('goBtn').onclick = loadURL;
document.getElementById('newTabBtn').onclick = () => createTab("");
document.getElementById('reloadBtn').onclick = reloadPage;
document.getElementById('backBtn').onclick = goBack;
document.getElementById('forwardBtn').onclick = goForward;

urlInput.addEventListener('keypress', e => { if (e.key === 'Enter') loadURL(); });

// Start
window.onload = () => createTab("https://www.google.com");
