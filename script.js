let tabs = [];
let currentTabIndex = 0;
let currentProxyIndex = 0;   // 0 = first proxy

const frame = document.getElementById('mainFrame');
const tabsBar = document.getElementById('tabsBar');
const urlInput = document.getElementById('urlInput');
const proxyDisplay = document.getElementById('currentProxy');

// List of proxies (you can add more)
const proxies = [
  (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
  (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  (u) => `https://proxy.cors.sh/${u}`,
  (u) => `https://cors.bridged.cc/${u}`
];

function getProxiedURL(url) {
  if (!url.startsWith('http')) url = 'https://' + url;
  return proxies[currentProxyIndex](url);
}

function getDomain(url) {
  try {
    return new URL(url.startsWith('http') ? url : 'https://'+url).hostname.replace('www.', '');
  } catch {
    return url.substring(0, 25);
  }
}

// Switch Proxy Manually
function switchProxy() {
  currentProxyIndex = (currentProxyIndex + 1) % proxies.length;
  proxyDisplay.textContent = currentProxyIndex + 1;
  
  // Reload current tab with new proxy
  const currentTab = tabs[currentTabIndex];
  if (currentTab && currentTab.url) {
    currentTab.proxied = getProxiedURL(currentTab.url);
    frame.src = currentTab.proxied;
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
      <p>Helios-style proxy with manual switch.<br>Click "Proxy: X" to change proxy.<br>Good against Securly.</p>
    </body>`;
  urlInput.value = '';
}

// Event Listeners
document.getElementById('goBtn').onclick = loadURL;
document.getElementById('newTabBtn').onclick = () => createTab("");
document.getElementById('reloadBtn').onclick = reloadPage;
document.getElementById('backBtn').onclick = goBack;
document.getElementById('forwardBtn').onclick = goForward;
document.getElementById('proxyBtn').onclick = switchProxy;

urlInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') loadURL();
});

// Initialize
window.onload = () => {
  createTab("https://www.google.com");
};
