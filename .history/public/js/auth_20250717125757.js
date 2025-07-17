// Configuration API
const API_BASE_URL = window.location.origin;

// Gestion de l'authentification
class AuthManager {
    static getToken() {
        return localStorage.getItem('authToken');
    }

    static setToken(token) {
        localStorage.setItem('authToken', token);
    }

    static removeToken() {
        localStorage.removeItem('authToken');
    }

    static isAuthenticated() {
        return !!this.getToken();
    }

    static async getCurrentUser() {
        const token = this.getToken();
        if (!token) return null;

        try {
            const response = await fetch(`${API_BASE_URL}/auth/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                return await response.json();
            } else {
                this.removeToken();
                return null;
            }
        } catch (error) {
            console.error('Erreur lors de la récupération du profil:', error);
            this.removeToken();
            return null;
        }
    }

    static async login(email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();
                this.setToken(data.access_token);
                return { success: true, user: data.user };
            } else {
                const error = await response.json();
                return { success: false, message: error.message || 'Erreur de connexion' };
            }
        } catch (error) {
            console.error('Erreur de connexion:', error);
            return { success: false, message: 'Erreur réseau' };
        }
    }

    static logout() {
        this.removeToken();
        window.location.href = '/login.html';
    }
}

// Utilitaires UI
class UI {
    static showNotification(message, type = 'info') {
        const notifications = document.getElementById('notifications');
        if (!notifications) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;

        notifications.appendChild(notification);

        // Auto-remove après 5 secondes
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    static setButtonLoading(button, loading = true) {
        if (loading) {
            button.disabled = true;
            button.dataset.originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Chargement...';
        } else {
            button.disabled = false;
            button.innerHTML = button.dataset.originalText || button.innerHTML;
        }
    }

    static updateUserInfo(user) {
        const emailEl = document.getElementById('userEmail');
        const roleEl = document.getElementById('userRole');

        if (emailEl) emailEl.textContent = user.email;
        if (roleEl) {
            roleEl.textContent = user.role;
            roleEl.className = `role-badge ${user.role}`;
        }

        // Afficher/masquer les éléments admin
        const adminElements = document.querySelectorAll('.admin-only, #adminCard');
        adminElements.forEach(el => {
            if (user.role === 'admin' || user.role === 'moderator') {
                el.style.display = 'block';
            } else {
                el.style.display = 'none';
            }
        });
    }
}

// Protection des pages
function protectPage() {
    if (!AuthManager.isAuthenticated()) {
        window.location.href = '/login.html';
        return false;
    }
    return true;
}

// Initialisation de la page de connexion
function initLoginPage() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const loginBtn = document.getElementById('loginBtn');

        if (!email || !password) {
            UI.showNotification('Veuillez remplir tous les champs', 'error');
            return;
        }

        UI.setButtonLoading(loginBtn);

        const result = await AuthManager.login(email, password);

        if (result.success) {
            UI.showNotification('Connexion réussie ! Redirection...', 'success');
            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 1000);
        } else {
            UI.showNotification(result.message, 'error');
            UI.setButtonLoading(loginBtn, false);
        }
    });
}

// Remplir automatiquement les champs de connexion
function fillLogin(email, password) {
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');
    
    if (emailField && passwordField) {
        emailField.value = email;
        passwordField.value = password;
        
        // Optionnel: soumettre automatiquement après un court délai
        UI.showNotification(`Compte ${email.split('@')[0]} sélectionné`, 'info');
    }
}

// Initialisation de la page dashboard/protégée
async function initProtectedPage() {
    if (!protectPage()) return;

    const user = await AuthManager.getCurrentUser();
    if (!user) {
        AuthManager.logout();
        return;
    }

    UI.updateUserInfo(user);
    
    // Charger les statistiques de la wishlist
    await updateWishlistStats();
}

// Fonction de déconnexion
function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        AuthManager.logout();
    }
}

// Mettre à jour les statistiques de la wishlist
async function updateWishlistStats() {
    const token = AuthManager.getToken();
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE_URL}/films/wishlist/my`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            const countEl = document.getElementById('wishlistCount');
            const filmsEl = document.getElementById('wishlistFilms');
            
            if (countEl) countEl.textContent = data.count;
            if (filmsEl) filmsEl.textContent = data.count;
        }
    } catch (error) {
        console.error('Erreur lors de la récupération de la wishlist:', error);
    }
}

// Initialisation automatique selon la page
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('login.html')) {
        initLoginPage();
    } else if (currentPage.includes('dashboard.html') || 
               currentPage.includes('films.html')) {
        initProtectedPage();
    }
}); 