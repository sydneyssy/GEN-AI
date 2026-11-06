const routeButtons = document.querySelectorAll("[data-view]");
const navLinks = document.querySelectorAll(".nav-link");
const wardrobeGrid = document.getElementById("wardrobe-grid");
const outfitGrid = document.getElementById("outfit-grid");
const itemSearch = document.getElementById("item-search");
const colorFilter = document.getElementById("color-filter");
const categoryFilters = document.querySelectorAll(".filter-tab");
const fileInput = document.getElementById("file-input");
const uploadForm = document.getElementById("upload-form");
const fileList = document.getElementById("file-list");
const uploadMessage = document.getElementById("upload-message");
const chatWindow = document.getElementById("chat-window");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-btn");
const conversationHistory = [];
let wardrobeItems = [];
let outfitMatches = [];
let activeCategory = "all";

const colorValues = {
  beige: "#d6c2a1", black: "#282427", brown: "#795344", burgundy: "#762b42",
  camel: "#bd8d5b", cream: "#f0e6d3", "denim blue": "#6689a7", "emerald green": "#08775d",
  grey: "#9b9b9d", khaki: "#aca17b", lavender: "#b7a2cf", "light blue": "#a8cadf",
  navy: "#283c62", olive: "#777d45", pink: "#d998b0", red: "#bd3e4a",
  white: "#fff", yellow: "#dfc54d", orange: "#d97839", coral: "#ed8c7b",
  rust: "#a95036", tan: "#bd986c", teal: "#3c8986", ivory: "#f3eddd",
};

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function colorFor(name) {
  return colorValues[String(name || "").trim().toLowerCase()] || "#c9b8c0";
}

function makeGarment(item, extraClass = "") {
  const isBottom = String(item.category).toLowerCase() === "bottom";
  const design = String(item.design || "").trim().toLowerCase();
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 72 76");
  svg.setAttribute("aria-hidden", "true");
  svg.classList.add("garment-art", isBottom ? "bottom-art" : "top-art");
  if (extraClass) svg.classList.add(extraClass);

  const addPath = (pathData, options = {}) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathData);
    path.setAttribute("fill", options.fill || "none");
    path.setAttribute("stroke", options.stroke || "#49374055");
    path.setAttribute("stroke-width", options.width || "1.2");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    svg.append(path);
  };

  if (!isBottom) {
    let topShape;
    if (design.includes("off-shoulder")) {
      topShape = "M17 15h38l7 8-7 10-6-4v34H23V29l-6 4-7-10z";
    } else if (design.includes("bodysuit")) {
      topShape = "M24 9h6v9h12V9h6l8 10-6 7-5-4v24l-8 17h-6l-5-13-5 13h-6l-8-17V22l-5 4-6-7z";
    } else if (design.includes("tank")) {
      topShape = "M23 7h6v11h14V7h6l8 11-5 7-6-4v42H26V21l-6 4-5-7z";
    } else if (design.includes("jacket")) {
      topShape = "M24 7 35 4 48 7l8 7 8 19-9 4-5-10v33H22V27l-5 10-9-4 8-19z M27 11l8 12 9-12 M35 23v37";
    } else if (design.includes("long sleeve") || design === "sleeves") {
      topShape = "M24 8 35 4l12 4 7 4 15 26-9 6-11-16v37H23V28L12 44l-9-6 15-26z";
    } else {
      const wide = design.includes("oversized") || design.includes("loose") || design.includes("boxy");
      const narrow = design.includes("fitted") || design.includes("tight");
      const hemY = design.includes("cropped") ? 42 : design.includes("long (hip") ? 71 : 62;
      const left = wide ? 18 : narrow ? 25 : 22;
      const right = 72 - left;
      const sleeveLeft = wide ? 7 : 12;
      const sleeveRight = 72 - sleeveLeft;
      topShape = `M${left} 8L35 4L${right} 8L${sleeveRight} 16L${sleeveRight - 7} 29L${right - 2} 25L${right - 2} ${hemY}L${left + 2} ${hemY}L${left + 2} 25L${sleeveLeft + 7} 29L${sleeveLeft} 16Z`;
    }
    addPath(topShape, { fill: colorFor(item.color), stroke: "#49374066", width: "1.3" });
    if (design.includes("off-shoulder")) addPath("M17 15c5 5 11 7 19 7s14-2 19-7", { stroke: "#49374077", width: "1.3" });
    if (design.includes("jacket")) addPath("M35 24v35 M40 31h.1 M40 39h.1 M40 47h.1", { stroke: "#49374088", width: "1.7" });
    if (design.includes("v-neck")) addPath("M29 10l6 10 7-10", { stroke: "#49374077", width: "1.2" });
    if (design.includes("tucked")) addPath("M24 57h24", { stroke: "#49374066", width: "1" });
  } else {
    if (design.includes("skirt")) {
      const isFlowy = design.includes("flowy");
      addPath(isFlowy
        ? "M21 13h30l4 11 13 42H4l13-42z"
        : "M21 13h30l3 11 9 42H9l9-42z", { fill: colorFor(item.color), stroke: "#49374066", width: "1.3" });
      addPath(isFlowy ? "M28 26l-5 37 M36 26v38 M44 26l5 37" : "M29 27l-3 36 M43 27l3 36", { stroke: "#49374045", width: "1" });
    } else if (design.includes("shorts")) {
      addPath("M17 13h38l3 30H39l-3-12-3 12H14z", { fill: colorFor(item.color), stroke: "#49374066", width: "1.3" });
      addPath("M18 21h37 M36 31v11", { stroke: "#49374055", width: "1" });
    } else {
      const wide = design.includes("wide-leg") || design.includes("baggy") || design.includes("cargo");
      const skinny = design.includes("skinny") || design.includes("leggings") || design.includes("slim") || design.includes("fitted");
      const lowRise = design.includes("low rise");
      const left = wide ? 11 : skinny ? 20 : 16;
      const right = 72 - left;
      const highRise = design.includes("high rise") || design.includes("high-waist");
      const waistY = lowRise ? 19 : highRise ? 8 : 13;
      const legEndLeft = wide ? 7 : skinny ? 21 : 14;
      const legEndRight = 72 - legEndLeft;
      const shape = `M${left} ${waistY}H${right}L${right - 4} ${waistY + 12}L${legEndRight} 71H40L36 34L32 71H${legEndLeft}L${left + 4} ${waistY + 12}Z`;
      addPath(shape, { fill: colorFor(item.color), stroke: "#49374066", width: "1.3" });
      addPath(`M${left + 2} ${waistY + 5}h${right - left - 4} M36 ${waistY + 6}v27`, { stroke: "#49374055", width: "1" });
      if (design.includes("cargo")) {
        addPath("M14 37h10v12H14z M48 37h10v12H48z", { fill: colorFor(item.color), stroke: "#49374066", width: "1" });
      }
      if (design.includes("bootcut")) addPath("M14 61h13 M45 61h13", { stroke: "#49374055", width: "1" });
    }
  }
  return svg;
}

function renderItem(item) {
  const card = makeElement("article", "item-card");
  const visual = makeElement("div", "item-visual");
  visual.append(makeGarment(item));
  visual.append(makeElement("span", "item-id", item.id));
  visual.append(makeElement("span", "item-category-tag", item.category));
  card.append(visual);

  const info = makeElement("div", "item-info");
  info.append(makeElement("div", "item-type", item.category));
  info.append(makeElement("h3", "item-name", item.design || "Item"));
  const meta = makeElement("div", "item-meta");
  const color = makeElement("span", "color-name");
  const swatch = makeElement("span", "color-swatch");
  swatch.style.backgroundColor = colorFor(item.color);
  color.append(swatch, document.createTextNode(item.color || "Color not listed"));
  meta.append(color, makeElement("span", "design-tag", item.color_code || item.id));
  info.append(meta);
  card.append(info);
  return card;
}

function renderWardrobe() {
  const query = itemSearch.value.trim().toLowerCase();
  const selectedColor = colorFilter.value;
  const filtered = wardrobeItems.filter((item) => {
    const categoryMatches = activeCategory === "all" || item.category.toLowerCase() === activeCategory;
    const colorMatches = selectedColor === "all" || item.color.toLowerCase() === selectedColor;
    const searchMatches = !query || [item.id, item.category, item.color, item.design]
      .some((value) => String(value).toLowerCase().includes(query));
    return categoryMatches && colorMatches && searchMatches;
  });

  wardrobeGrid.replaceChildren();
  if (!filtered.length) {
    wardrobeGrid.append(makeElement("div", "empty-state", "No pieces match those filters. Try another search or color."));
    return;
  }
  filtered.forEach((item) => wardrobeGrid.append(renderItem(item)));
}

function renderOutfit(match) {
  const card = makeElement("article", "outfit-card");
  const header = makeElement("div", "outfit-card-head");
  header.append(makeElement("strong", "", `MATCH ${match.id}`), makeElement("span", "approved-pill", "Fully matching"));
  card.append(header);
  const pieces = makeElement("div", "outfit-pieces");
  [match.top, match.bottom].forEach((item) => {
    const piece = makeElement("div", "outfit-piece");
    const art = makeElement("div", "outfit-piece-art");
    art.append(makeGarment(item));
    piece.append(art);
    const info = makeElement("div", "outfit-piece-info");
    info.append(makeElement("small", "", `${item.category} · ${item.id}`));
    info.append(makeElement("strong", "", item.design));
    info.append(makeElement("span", "", `${item.color} · ${item.category}`));
    piece.append(info);
    pieces.append(piece);
  });
  card.append(pieces);
  const rationale = makeElement("p", "match-rationale");
  rationale.append(makeElement("span", "", "✳"), document.createTextNode("Color and shape approved in your workbook."));
  card.append(rationale);
  return card;
}

function updateWardrobeStats(data) {
  document.getElementById("stat-total").textContent = data.stats.total;
  document.getElementById("stat-tops").textContent = data.stats.tops;
  document.getElementById("stat-bottoms").textContent = data.stats.bottoms;
  document.getElementById("stat-matches").textContent = data.stats.matches;
  document.getElementById("nav-item-count").textContent = data.stats.total;
  document.getElementById("filter-count-all").textContent = data.stats.total;
  document.getElementById("filter-count-top").textContent = data.stats.tops;
  document.getElementById("filter-count-bottom").textContent = data.stats.bottoms;
  document.getElementById("workbook-source").textContent = data.source;
  document.getElementById("stylist-source").textContent = data.source;
  document.getElementById("match-result-count").textContent = `${data.stats.matches} pairs`;
}

async function loadWardrobe() {
  wardrobeGrid.innerHTML = "";
  wardrobeGrid.append(makeElement("div", "loading-state", "Preparing your wardrobe…"));
  try {
    const response = await fetch("/api/wardrobe");
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Unable to read the workbook.");
    wardrobeItems = data.items;
    outfitMatches = data.matches;
    updateWardrobeStats(data);

    const colors = [...new Set(wardrobeItems.map((item) => item.color).filter(Boolean))].sort();
    colorFilter.replaceChildren(new Option("All colors", "all"));
    colors.forEach((color) => colorFilter.add(new Option(color, color.toLowerCase())));
    renderWardrobe();
    outfitGrid.replaceChildren(...outfitMatches.map(renderOutfit));
  } catch (error) {
    wardrobeItems = [];
    outfitMatches = [];
    wardrobeGrid.replaceChildren(makeElement("div", "empty-state", error.message));
    outfitGrid.replaceChildren(makeElement("div", "empty-state", error.message));
    document.getElementById("workbook-source").textContent = "No workbook connected";
    document.getElementById("stylist-source").textContent = "No workbook connected";
  }
}

function showView(viewId) {
  document.querySelectorAll(".page-view").forEach((view) => {
    const active = view.id === viewId;
    view.hidden = !active;
    view.classList.toggle("active-view", active);
  });
  navLinks.forEach((link) => {
    const active = link.dataset.view === viewId;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  const activeNav = [...navLinks].find((link) => link.dataset.view === viewId);
  const routeTitle = activeNav?.querySelector("span:not(.nav-icon):not(.nav-count)")?.textContent
    || (viewId === "source-view" ? "Workbook & settings" : "My wardrobe");
  document.getElementById("breadcrumb-current").textContent = routeTitle;
  if (viewId === "source-view") loadFiles();
  if (viewId === "wardrobe-view" || viewId === "outfits-view") loadWardrobe();
}

routeButtons.forEach((button) => button.addEventListener("click", () => showView(button.dataset.view)));
categoryFilters.forEach((button) => {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.category;
    categoryFilters.forEach((filter) => filter.classList.toggle("active", filter === button));
    renderWardrobe();
  });
});
itemSearch.addEventListener("input", renderWardrobe);
colorFilter.addEventListener("change", renderWardrobe);
document.getElementById("refresh-wardrobe").addEventListener("click", loadWardrobe);
document.getElementById("refresh-outfits").addEventListener("click", loadWardrobe);

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function renderFiles(files) {
  fileList.replaceChildren();
  document.getElementById("file-count").textContent = `${files.length} ${files.length === 1 ? "file" : "files"}`;
  if (!files.length) {
    fileList.append(makeElement("p", "empty-files", "No workbooks yet. Upload your Excel file to get started."));
    return;
  }
  files.forEach((file) => {
    const row = makeElement("div", "file-row");
    row.append(makeElement("span", "file-name", file.name));
    row.append(makeElement("span", "file-size", formatSize(file.size)));
    const remove = makeElement("button", "delete-button", "Remove");
    remove.type = "button";
    remove.setAttribute("aria-label", `Remove ${file.name}`);
    remove.addEventListener("click", () => deleteFile(file.name));
    row.append(remove);
    fileList.append(row);
  });
}

async function loadFiles() {
  try {
    const response = await fetch("/api/files");
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Unable to load files.");
    renderFiles(data.files);
  } catch (error) {
    fileList.replaceChildren(makeElement("p", "empty-files", error.message));
  }
}

fileInput.addEventListener("change", () => {
  document.getElementById("file-name").textContent = fileInput.files[0]?.name || "Choose an Excel workbook";
  uploadMessage.textContent = "";
  uploadMessage.className = "upload-message";
});

uploadForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!fileInput.files.length) return;
  const button = document.getElementById("upload-btn");
  const body = new FormData();
  body.append("file", fileInput.files[0]);
  button.disabled = true;
  uploadMessage.textContent = "Uploading workbook…";
  try {
    const response = await fetch("/api/files", { method: "POST", body });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Upload failed.");
    uploadMessage.textContent = "Workbook uploaded and ready.";
    uploadMessage.classList.add("success");
    uploadForm.reset();
    document.getElementById("file-name").textContent = "Choose an Excel workbook";
    await Promise.all([loadFiles(), loadWardrobe()]);
  } catch (error) {
    uploadMessage.textContent = error.message;
    uploadMessage.classList.add("error-text");
  } finally {
    button.disabled = false;
  }
});

async function deleteFile(filename) {
  try {
    const response = await fetch(`/api/files/${encodeURIComponent(filename)}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not remove workbook.");
    uploadMessage.textContent = "Workbook removed.";
    uploadMessage.className = "upload-message success";
    await Promise.all([loadFiles(), loadWardrobe()]);
  } catch (error) {
    uploadMessage.textContent = error.message;
    uploadMessage.className = "upload-message error-text";
  }
}

function appendMessage(role, text, isError = false) {
  chatWindow.querySelector(".welcome")?.remove();
  const message = makeElement("div", `message ${isError ? "error" : role}`);
  const linkPattern = /https?:\/\/[^\s<>"']+/gi;
  let lastIndex = 0;
  for (const match of text.matchAll(linkPattern)) {
    const start = match.index;
    let url = match[0];
    const punctuation = url.match(/[),.!?;:]+$/)?.[0] || "";
    url = url.slice(0, url.length - punctuation.length);
    message.append(document.createTextNode(text.slice(lastIndex, start)));
    const link = makeElement("a", "", url);
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    message.append(link, document.createTextNode(punctuation));
    lastIndex = start + match[0].length;
  }
  message.append(document.createTextNode(text.slice(lastIndex)));
  chatWindow.append(message);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function restoreWelcome() {
  chatWindow.replaceChildren();
  const welcome = makeElement("div", "welcome");
  welcome.innerHTML = '<span class="welcome-icon" aria-hidden="true">✧</span><h2>What would you like to explore?</h2><p>I’ll use the inventory and approved match data in your workbook.</p><div class="prompt-chips"><button type="button" data-prompt="Show me some fully matching outfits from my workbook.">Show matching outfits</button><button type="button" data-prompt="What pieces are in my wardrobe?">Explore my pieces</button></div>';
  chatWindow.append(welcome);
  welcome.querySelectorAll("[data-prompt]").forEach((button) => button.addEventListener("click", () => {
    userInput.value = button.dataset.prompt;
    userInput.focus();
  }));
}

async function sendMessage(event) {
  event.preventDefault();
  const text = userInput.value.trim();
  if (!text || sendButton.disabled) return;
  userInput.value = "";
  appendMessage("user", text);
  conversationHistory.push({ role: "user", content: text });
  sendButton.disabled = true;
  sendButton.querySelector("span:first-child").textContent = "Thinking…";
  try {
    const response = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: conversationHistory }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "The chat request failed.");
    const answer = data.message.content;
    appendMessage("assistant", answer);
    conversationHistory.push({ role: "assistant", content: answer });
  } catch (error) {
    conversationHistory.pop();
    appendMessage("assistant", error.message || "Could not connect to the local AI.", true);
  } finally {
    sendButton.disabled = false;
    sendButton.querySelector("span:first-child").textContent = "Send";
    userInput.focus();
  }
}

chatForm.addEventListener("submit", sendMessage);
document.getElementById("clear-chat").addEventListener("click", () => {
  conversationHistory.length = 0;
  restoreWelcome();
});
document.querySelectorAll("[data-prompt]").forEach((button) => button.addEventListener("click", () => {
  userInput.value = button.dataset.prompt;
  userInput.focus();
}));

loadWardrobe();
