// Configuration API
const API_BASE_URL = window.location.origin;

// Utilitaires
class ApiClient {
    static async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const isJson = response.headers.get('content-type')?.includes('application/json');
            const data = isJson ? await response.json() : await response.text();

            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            return { data, status: response.status };
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    static async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    static async post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    }

    static async put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    }

    static async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

// Utilitaires UI
class UI {
    static showResults(content, type = 'info') {
        const resultsDiv = document.getElementById('results');
        const resultsContent = document.getElementById('results-content');
        
        resultsContent.textContent = typeof content === 'object' 
            ? JSON.stringify(content, null, 2) 
            : content;
        
        resultsDiv.style.display = 'block';
        resultsDiv.scrollIntoView({ behavior: 'smooth' });
    }

    static hideResults() {
        document.getElementById('results').style.display = 'none';
    }

    static setButtonLoading(button, loading = true) {
        if (loading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    static updateApiStatus(isOnline) {
        const statusElement = document.getElementById('api-status');
        const dot = statusElement.querySelector('.status-dot');
        const text = statusElement.querySelector('.status-text');

        if (isOnline) {
            dot.className = 'status-dot online';
            text.textContent = 'API en ligne';
        } else {
            dot.className = 'status-dot offline';
            text.textContent = 'API hors ligne';
        }
    }

    static showNotification(message, type = 'info') {
        // Créer une notification toast
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                background: ${type === 'error' ? 'var(--danger)' : type === 'success' ? 'var(--success)' : 'var(--info)'};
                color: white;
                border-radius: 0.5rem;
                box-shadow: var(--shadow);
                z-index: 1000;
                max-width: 300px;
                animation: slideIn 0.3s ease-out;
            ">
                ${message}
            </div>
        `;

        document.body.appendChild(notification);

        // Supprimer après 3 secondes
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Fonctions API
async function checkApiStatus() {
    const button = event.target;
    UI.setButtonLoading(button);

    try {
        const { data } = await ApiClient.get('/api/health');
        UI.updateApiStatus(true);
        UI.showResults(`✅ API Status: ${data}`);
        UI.showNotification('API accessible', 'success');
    } catch (error) {
        UI.updateApiStatus(false);
        UI.showResults(`❌ Erreur API: ${error.message}`);
        UI.showNotification('API inaccessible', 'error');
    } finally {
        UI.setButtonLoading(button, false);
    }
}

async function createUser() {
    const button = event.target;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
        UI.showNotification('Veuillez remplir tous les champs', 'error');
        return;
    }

    if (!email.includes('@')) {
        UI.showNotification('Email invalide', 'error');
        return;
    }

    if (password.length < 6) {
        UI.showNotification('Le mot de passe doit contenir au moins 6 caractères', 'error');
        return;
    }

    UI.setButtonLoading(button);

    try {
        const { data } = await ApiClient.post('/users', { email, password });
        UI.showResults({
            message: '✅ Utilisateur créé avec succès',
            user: data
        });
        UI.showNotification('Utilisateur créé', 'success');
        
        // Clear form
        document.getElementById('email').value = '';
        document.getElementById('password').value = '';
    } catch (error) {
        UI.showResults(`❌ Erreur création: ${error.message}`);
        UI.showNotification('Erreur lors de la création', 'error');
    } finally {
        UI.setButtonLoading(button, false);
    }
}

async function getUsers() {
    const button = event.target;
    UI.setButtonLoading(button);

    try {
        const { data } = await ApiClient.get('/users');
        UI.showResults({
            message: '📋 Liste des utilisateurs',
            count: Array.isArray(data) ? data.length : 'N/A',
            users: data
        });
        UI.showNotification('Utilisateurs récupérés', 'success');
    } catch (error) {
        UI.showResults(`❌ Erreur récupération: ${error.message}`);
        UI.showNotification('Erreur lors de la récupération', 'error');
    } finally {
        UI.setButtonLoading(button, false);
    }
}

function hideResults() {
    UI.hideResults();
}

// Fonctions d'initialisation
function checkHttpsStatus() {
    const httpsStatus = document.getElementById('https-status');
    if (window.location.protocol === 'https:') {
        httpsStatus.innerHTML = `
            <i class="fas fa-check-circle text-success"></i>
            <span>HTTPS activé</span>
        `;
    }
}

function initializeApp() {
    checkHttpsStatus();
    checkApiStatus();
    
    // Ajouter les styles d'animation pour les notifications
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Gestionnaires d'événements
document.addEventListener('DOMContentLoaded', initializeApp);

// Gestionnaire global d'erreurs
window.addEventListener('error', (event) => {
    console.error('Erreur JavaScript:', event.error);
});

// Gestionnaire de raccourcis clavier
document.addEventListener('keydown', (event) => {
    // Ctrl/Cmd + R pour rafraîchir le statut API
    if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault();
        checkApiStatus();
    }
    
    // Escape pour fermer les résultats
    if (event.key === 'Escape') {
        hideResults();
    }
});

// Validation en temps réel des champs
document.getElementById('email')?.addEventListener('input', function() {
    const email = this.value;
    if (email && !email.includes('@')) {
        this.style.borderColor = 'var(--danger)';
    } else {
        this.style.borderColor = 'var(--border)';
    }
});

document.getElementById('password')?.addEventListener('input', function() {
    const password = this.value;
    if (password && password.length < 6) {
        this.style.borderColor = 'var(--danger)';
    } else {
        this.style.borderColor = 'var(--border)';
    }
});

// Exposer les fonctions globalement pour les événements onclick
window.checkApiStatus = checkApiStatus;
window.createUser = createUser;
window.getUsers = getUsers;
window.hideResults = hideResults; 