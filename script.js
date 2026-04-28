let tabs = [];
let currentTabIndex = 0;

const frame = document.getElementById('mainFrame');
const tabsBar = document.getElementById('tabsBar');
const urlInput = document.getElementById('urlInput');

// Multiple proxy fallbacks (in order of preference)
const proxies = [
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url) => `https://proxy.cors.sh/${url}`   // sometimes more reliable
];

function getProxiedURL(url, proxyIndex = 0) {
  if (!url.startsWith('http')) {
    url = 'https://' + url;
  }
  
  return proxies[proxyIndex % proxies.length](url);
}

function loadWithProxy(url, proxyIndex = 0) {
  const proxiedUrl = getProxiedURL(url, proxyIndex);
  frame.src = proxiedUrl;
  
  // Set a timeout to try next proxy if loading takes too long
  const timeout = setTimeout(() => {
    if (proxyIndex < proxies.length - 1) {
      console.log(`Proxy ${proxyIndex} failed, trying next...`);
      loadWithProxy(url, proxyIndex + 1);
    } else {
      console.log('All proxies failed');
      // Could show an error message here
    }
  }, 10000); // 10 seconds timeout
  
  // Clear timeout on successful load
  frame.onload = () => {
    clearTimeout(timeout);
  };
  
  // Also clear on error, but iframe error event might not fire
  frame.onerror = () => {
    clearTimeout(timeout);
    if (proxyIndex < proxies.length - 1) {
      loadWithProxy(url, proxyIndex + 1);
    }
  };
}

function createTab(url = "") {
  const tab = {
    id: Date.now(),
    title: url ? getDomain(url) : "New Tab",
    url: url
  };
  
  tabs.push(tab);
  currentTabIndex = tabs.length - 1;
  renderTabs();
  
  if (url) {
    loadWithProxy(url);
    urlInput.value = url;
  } else {
    showNewTabScreen();
  }
}

function getDomain(url) {
  try {
    return new URL(url.startsWith('http') ? url : 'https://' + url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

function renderTabs() {
  tabsBar.innerHTML = '';
  tabs.forEach((tab, index) => {
    const tabEl = document.createElement('div');
    tabEl.className = `tab ${index === currentTabIndex ? 'active' : ''}`;
    tabEl.textContent = tab.title.length > 28 ? tab.title.substring(0, 25) + '...' : tab.title;
    tabEl.onclick = () => switchTab(index);
    tabsBar.appendChild(tabEl);
  });
}

function switchTab(index) {
  currentTabIndex = index;
  renderTabs();
  
  const tab = tabs[index];
  if (tab.url) {
    loadWithProxy(tab.url);
    urlInput.value = tab.url;
  } else {
    showNewTabScreen();
  }
}

function loadURL() {
  let input = urlInput.value.trim();
  if (!input) return;

  tabs[currentTabIndex].url = input;
  tabs[currentTabIndex].title = getDomain(input);

  loadWithProxy(input);
  renderTabs();
}

function reloadPage() {
  if (frame.contentWindow) frame.contentWindow.location.reload();
}

function goBack() {
  try { frame.contentWindow.history.back(); } catch(e) {}
}

function goForward() {
  try { frame.contentWindow.history.forward(); } catch(e) {}
}

function showNewTabScreen() {
  frame.srcdoc = `
    <div class="newtab">
      <h1>404</h1>
      <div class="glitch">BROWSER ONLINE</div>
      <p>Type a URL above and press Go.<br>Minimal • Fast • Hard to block.</p>
    </div>
  `;
  urlInput.value = '';
}

// Event Listeners
document.getElementById('goBtn').onclick = loadURL;
document.getElementById('newTabBtn').onclick = () => createTab("");
document.getElementById('reloadBtn').onclick = reloadPage;
document.getElementById('backBtn').onclick = goBack;
document.getElementById('forwardBtn').onclick = goForward;

urlInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') loadURL();
});

// Initialize
window.onload = () => {
  startTitleAnimation();
};

function startTitleAnimation() {
  const titleScreen = document.getElementById('titleScreen');
  const text = "404 A PROXY BROWSER";
  let index = 0;
  titleScreen.innerHTML = '<span class="cursor">|</span>';

  const interval = setInterval(() => {
    const typedText = text.substring(0, index + 1);
    titleScreen.innerHTML = typedText + '<span class="cursor">|</span>';
    index++;
    if (index >= text.length) {
      clearInterval(interval);
      setTimeout(() => {
        titleScreen.style.display = 'none';
        createTab("https://www.google.com");
      }, 2000); // Wait 2 seconds after typing completes
    }
  }, 150); // 150ms per letter
}