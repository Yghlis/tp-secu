// Gestion du Dashboard
class DashboardManager {
    static async checkApiStatus() {
        const statusEl = document.getElementById('api-status');
        const button = event.target;
        
        if (!statusEl) return;

        UI.setButtonLoading(button);

        try {
            const response = await fetch(`${API_BASE_URL}/api/health`);
            const data = await response.text();

            if (response.ok) {
                statusEl.innerHTML = `
                    <span class="status-dot success"></span>
                    <span class="status-text">API opérationnelle</span>
                `;
                UI.showNotification('API opérationnelle', 'success');
            } else {
                throw new Error('API non disponible');
            }
        } catch (error) {
            statusEl.innerHTML = `
                <span class="status-dot error"></span>
                <span class="status-text">API indisponible</span>
            `;
            UI.showNotification('Erreur API', 'error');
        } finally {
            UI.setButtonLoading(button, false);
        }
    }

    static async createUser() {
        const button = event.target;
        const email = document.getElementById('email')?.value;
        const password = document.getElementById('password')?.value;
        const role = document.getElementById('role')?.value || 'user';

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
            const response = await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password, role })
            });

            if (response.ok) {
                const data = await response.json();
                this.showResults({
                    message: '✅ Utilisateur créé avec succès',
                    user: data
                });
                UI.showNotification('Utilisateur créé', 'success');
                
                // Clear form
                document.getElementById('email').value = '';
                document.getElementById('password').value = '';
                document.getElementById('role').value = 'user';
            } else {
                const error = await response.json();
                this.showResults(`❌ Erreur création: ${error.message}`);
                UI.showNotification('Erreur lors de la création', 'error');
            }
        } catch (error) {
            this.showResults(`❌ Erreur réseau: ${error.message}`);
            UI.showNotification('Erreur réseau', 'error');
        } finally {
            UI.setButtonLoading(button, false);
        }
    }

    static async getUsers() {
        const button = event.target;
        UI.setButtonLoading(button);

        try {
            const response = await fetch(`${API_BASE_URL}/users`);
            
            if (response.ok) {
                const users = await response.json();
                this.showResults({
                    message: `📋 ${users.length} utilisateur(s) trouvé(s)`,
                    users: users
                });
                UI.showNotification(`${users.length} utilisateurs trouvés`, 'success');
            } else {
                this.showResults('❌ Erreur lors de la récupération des utilisateurs');
                UI.showNotification('Erreur lors de la récupération', 'error');
            }
        } catch (error) {
            this.showResults(`❌ Erreur réseau: ${error.message}`);
            UI.showNotification('Erreur réseau', 'error');
        } finally {
            UI.setButtonLoading(button, false);
        }
    }

    static showResults(data) {
        const resultsEl = document.getElementById('results');
        const contentEl = document.getElementById('results-content');
        
        if (!resultsEl || !contentEl) return;

        if (typeof data === 'string') {
            contentEl.textContent = data;
        } else {
            contentEl.textContent = JSON.stringify(data, null, 2);
        }
        
        resultsEl.style.display = 'block';
        resultsEl.scrollIntoView({ behavior: 'smooth' });
    }

    static hideResults() {
        const resultsEl = document.getElementById('results');
        if (resultsEl) {
            resultsEl.style.display = 'none';
        }
    }

    static async loadDashboardStats() {
        try {
            // Charger les statistiques des films
            const filmsResponse = await fetch(`${API_BASE_URL}/films`);
            if (filmsResponse.ok) {
                const films = await filmsResponse.json();
                const totalFilmsEl = document.getElementById('totalFilms');
                if (totalFilmsEl) {
                    totalFilmsEl.textContent = films.length;
                }
            }

            // Charger les statistiques de la wishlist
            await updateWishlistStats();

        } catch (error) {
            console.error('Erreur lors du chargement des statistiques:', error);
        }
    }
}

// Exposition des fonctions globales pour les onclick
function checkApiStatus() {
    DashboardManager.checkApiStatus();
}

function createUser() {
    DashboardManager.createUser();
}

function getUsers() {
    DashboardManager.getUsers();
}

function hideResults() {
    DashboardManager.hideResults();
}

// Fonction pour afficher la wishlist depuis le dashboard
function showWishlist() {
    // Si on est sur la page films, utiliser la fonction locale
    if (typeof FilmsManager !== 'undefined') {
        window.showWishlist();
        return;
    }

    // Sinon, rediriger vers la page films avec un paramètre pour ouvrir la wishlist
    window.location.href = '/films.html?showWishlist=true';
}

// Initialisation du dashboard
function initDashboard() {
    // Charger les statistiques
    DashboardManager.loadDashboardStats();

    // Vérifier automatiquement l'API au chargement
    setTimeout(() => {
        const apiStatusBtn = document.querySelector('[onclick="checkApiStatus()"]');
        if (apiStatusBtn) {
            // Simuler un clic sur le bouton de vérification API
            checkApiStatus();
        }
    }, 1000);
}

// Auto-initialisation pour le dashboard
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('dashboard.html')) {
        initDashboard();
    }
}); 