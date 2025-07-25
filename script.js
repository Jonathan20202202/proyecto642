// Variables globales
let isConnected = false;
let messageHistory = [];
let connectedUsers = new Set(); // Para rastrear usuarios únicos
let currentUserId = null; // ID del usuario actual
let settings = {
    username: 'Anónimo',
    interests: '',
    soundEnabled: true
};

// Elementos del DOM
const welcomeScreen = document.getElementById('welcomeScreen');
const chatInterface = document.getElementById('chatInterface');
const settingsModal = document.getElementById('settingsModal');
const startChatBtn = document.getElementById('startChatBtn');
const settingsBtn = document.getElementById('settingsBtn');
const nextBtn = document.getElementById('nextBtn');
const endChatBtn = document.getElementById('endChatBtn');
const closeSettings = document.getElementById('closeSettings');
const saveSettings = document.getElementById('saveSettings');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const chatMessages = document.getElementById('chatMessages');
const connectionStatus = document.getElementById('connectionStatus');
const onlineCount = document.getElementById('onlineCount');

// Sistema de usuarios reales en línea
function generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

function updateOnlineCount() {
    // Mostrar solo usuarios realmente conectados
    onlineCount.textContent = connectedUsers.size;
}

function addUserToOnline() {
    const userId = generateUserId();
    connectedUsers.add(userId);
    updateOnlineCount();
    return userId;
}

function removeUserFromOnline(userId) {
    connectedUsers.delete(userId);
    updateOnlineCount();
}

// Funciones de utilidad
function formatTime(date) {
    return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Funciones de animación
function showElement(element, animationClass = 'fadeIn') {
    element.classList.remove('hidden');
    element.style.animation = `${animationClass} 0.5s ease-out`;
}

function hideElement(element) {
    element.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => {
        element.classList.add('hidden');
    }, 300);
}

// Gestión de mensajes
function addMessage(content, type = 'other', timestamp = new Date()) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;

    if (type === 'system') {
        messageDiv.className = 'system-message';
        messageDiv.innerHTML = `<i class="fas fa-info-circle"></i> ${content}`;
    } else {
        messageDiv.textContent = content;
        messageDiv.title = formatTime(timestamp);
    }

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Efecto de aparición
    messageDiv.style.animation = 'messageSlide 0.3s ease-out';

    // Guardar en historial
    messageHistory.push({
        content,
        type,
        timestamp
    });
}

function clearMessages() {
    chatMessages.innerHTML = '';
    messageHistory = [];
}

// Gestión de conexiones
function connectToStranger() {
    isConnected = true;
    connectionStatus.textContent = 'Conectado';
    connectionStatus.style.color = '#4CAF50';

    // Limpiar chat anterior
    clearMessages();

    // Mensaje del sistema
    addMessage('Te has conectado con un extraño. ¡Sé respetuoso!', 'system');
}

function disconnectFromStranger() {
    isConnected = false;
    connectionStatus.textContent = 'Desconectado';
    connectionStatus.style.color = '#f44336';

    addMessage('Chat terminado', 'system');
}

// Envío de mensajes
function sendMessage() {
    const message = messageInput.value.trim();

    if (!message) return;

    // Agregar mensaje propio
    addMessage(message, 'own');
    messageInput.value = '';
}

// Event Listeners
startChatBtn.addEventListener('click', () => {
    // Agregar usuario al contador cuando entra al chat
    if (!currentUserId) {
        currentUserId = addUserToOnline();
    }
    
    hideElement(welcomeScreen);
    setTimeout(() => {
        showElement(chatInterface, 'scaleIn');
        connectToStranger();
        messageInput.focus();
    }, 300);
});

settingsBtn.addEventListener('click', () => {
    showElement(settingsModal);

    // Cargar configuración actual
    document.getElementById('usernameInput').value = settings.username;
    document.getElementById('interestsInput').value = settings.interests;
    document.getElementById('soundToggle').checked = settings.soundEnabled;
});

closeSettings.addEventListener('click', () => {
    hideElement(settingsModal);
});

saveSettings.addEventListener('click', () => {
    // Guardar configuración
    settings.username = document.getElementById('usernameInput').value || 'Anónimo';
    settings.interests = document.getElementById('interestsInput').value;
    settings.soundEnabled = document.getElementById('soundToggle').checked;

    hideElement(settingsModal);

    // Mostrar confirmación
    console.log('Configuración guardada:', settings);
});

nextBtn.addEventListener('click', () => {
    disconnectFromStranger();
    setTimeout(() => {
        connectToStranger();
    }, 1000);
});

endChatBtn.addEventListener('click', () => {
    disconnectFromStranger();
    hideElement(chatInterface);
    setTimeout(() => {
        showElement(welcomeScreen, 'fadeInUp');
    }, 300);
});

sendBtn.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Cerrar modal al hacer clic fuera
settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        hideElement(settingsModal);
    }
});

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    // Agregar usuario al contador cuando carga la página
    currentUserId = addUserToOnline();
    
    // Actualizar contador de usuarios en línea
    updateOnlineCount();

    // Cargar configuración guardada
    const savedSettings = localStorage.getItem('chatSettings');
    if (savedSettings) {
        settings = { ...settings, ...JSON.parse(savedSettings) };
    }
});

// Guardar configuración al cerrar
window.addEventListener('beforeunload', () => {
    // Remover usuario del contador cuando sale
    if (currentUserId) {
        removeUserFromOnline(currentUserId);
    }
    localStorage.setItem('chatSettings', JSON.stringify(settings));
});