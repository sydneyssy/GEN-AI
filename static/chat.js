const form = document.querySelector('#chat-form');
const input = document.querySelector('#message-input');
const conversation = document.querySelector('#conversation');
const errorMessage = document.querySelector('#error-message');
const sendButton = document.querySelector('#send-button');
const clearButton = document.querySelector('#clear-button');
const chatTab = document.querySelector('#chat-tab');
const documentsTab = document.querySelector('#documents-tab');
const chatPanel = document.querySelector('#chat-panel');
const documentsPanel = document.querySelector('#documents-panel');
const uploadForm = document.querySelector('#upload-form');
const fileInput = document.querySelector('#file-input');
const uploadButton = document.querySelector('#upload-button');
const uploadError = document.querySelector('#upload-error');
const fileList = document.querySelector('#file-list');
const emptyFiles = document.querySelector('#empty-files');
const fileCount = document.querySelector('#file-count');

let history = [];

function selectTab(tab) {
  const showChat = tab === chatTab;
  chatTab.classList.toggle('active', showChat);
  documentsTab.classList.toggle('active', !showChat);
  chatTab.setAttribute('aria-selected', String(showChat));
  documentsTab.setAttribute('aria-selected', String(!showChat));
  chatPanel.hidden = !showChat;
  documentsPanel.hidden = showChat;
  if (!showChat) loadFiles();
}

chatTab.addEventListener('click', () => selectTab(chatTab));
documentsTab.addEventListener('click', () => selectTab(documentsTab));

function addMessage(role, content) {
  document.querySelector('#welcome')?.remove();
  const row = document.createElement('div');
  row.className = `message ${role}`;
  if (role === 'assistant') {
    const avatar = document.createElement('span');
    avatar.className = 'assistant-mark';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = '✳';
    row.append(avatar);
  }
  const body = document.createElement('div');
  body.className = 'message-content';
  body.textContent = content;
  row.append(body);
  conversation.append(row);
  conversation.scrollTop = conversation.scrollHeight;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const content = input.value.trim();
  if (!content || sendButton.disabled) return;

  errorMessage.hidden = true;
  addMessage('user', content);
  input.value = '';
  input.style.height = 'auto';
  sendButton.disabled = true;

  try {
    const messages = [...history, { role: 'user', content }];
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'The request could not be completed.');
    history = [...messages, data.message];
    addMessage('assistant', data.message.content);
  } catch (error) {
    errorMessage.textContent = error.message || 'Could not reach the chat server. Please try again.';
    errorMessage.hidden = false;
  } finally {
    sendButton.disabled = false;
    input.focus();
  }
});

input.addEventListener('input', () => {
  input.style.height = 'auto';
  input.style.height = `${Math.min(input.scrollHeight, 150)}px`;
});

input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

clearButton.addEventListener('click', () => {
  history = [];
  conversation.replaceChildren();
  const welcome = document.createElement('p');
  welcome.className = 'empty-chat';
  welcome.id = 'welcome';
  welcome.textContent = 'Ask Gemma anything to get started.';
  conversation.append(welcome);
  errorMessage.hidden = true;
  input.focus();
});

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function renderFiles(files) {
  fileList.replaceChildren();
  fileCount.textContent = `${files.length} ${files.length === 1 ? 'file' : 'files'}`;
  emptyFiles.hidden = files.length > 0;

  files.forEach((file) => {
    const row = document.createElement('div');
    row.className = 'file-row';
    const name = document.createElement('span');
    name.className = 'file-name';
    name.textContent = file.name;
    name.title = file.name;
    const size = document.createElement('span');
    size.className = 'file-size';
    size.textContent = formatSize(file.size);
    const remove = document.createElement('button');
    remove.className = 'delete-button';
    remove.type = 'button';
    remove.textContent = 'Delete';
    remove.setAttribute('aria-label', `Delete ${file.name}`);
    remove.addEventListener('click', () => deleteFile(file, remove));
    row.append(name, size, remove);
    fileList.append(row);
  });
}

async function loadFiles() {
  try {
    const response = await fetch('/api/documents');
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Could not load files.');
    renderFiles(data.files);
  } catch (error) {
    fileCount.textContent = error.message || 'Could not load files.';
    emptyFiles.hidden = true;
  }
}

fileInput.addEventListener('change', () => {
  uploadButton.disabled = fileInput.files.length === 0;
  uploadError.hidden = true;
});

uploadForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const file = fileInput.files[0];
  if (!file || uploadButton.disabled) return;

  uploadButton.disabled = true;
  uploadButton.textContent = 'Uploading...';
  uploadError.hidden = true;
  try {
    const body = new FormData();
    body.append('file', file);
    const response = await fetch('/api/documents', { method: 'POST', body });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Could not upload this file.');
    fileInput.value = '';
    await loadFiles();
  } catch (error) {
    uploadError.textContent = error.message || 'Could not upload this file.';
    uploadError.hidden = false;
  } finally {
    uploadButton.textContent = 'Upload';
    uploadButton.disabled = fileInput.files.length === 0;
  }
});

async function deleteFile(file, button) {
  button.disabled = true;
  uploadError.hidden = true;
  try {
    const response = await fetch(`/api/documents/${encodeURIComponent(file.id)}`, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Could not delete this file.');
    await loadFiles();
  } catch (error) {
    button.disabled = false;
    uploadError.textContent = error.message || 'Could not delete this file.';
    uploadError.hidden = false;
  }
}
