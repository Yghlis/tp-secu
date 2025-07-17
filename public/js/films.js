// Gestion des films et wishlist
class FilmsManager {
    static films = [];
    static wishlist = [];

    static async loadFilms() {
        try {
            const response = await fetch(`${API_BASE_URL}/films`);
            if (response.ok) {
                this.films = await response.json();
                await this.loadWishlist();
                this.renderFilms();
            } else {
                UI.showNotification('Erreur lors du chargement des films', 'error');
            }
        } catch (error) {
            console.error('Erreur lors du chargement des films:', error);
            UI.showNotification('Erreur réseau', 'error');
        } finally {
            const loading = document.getElementById('loading');
            if (loading) loading.style.display = 'none';
        }
    }

    static async loadWishlist() {
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
                this.wishlist = data.films || [];
                this.updateWishlistCount();
            }
        } catch (error) {
            console.error('Erreur lors du chargement de la wishlist:', error);
        }
    }

    static updateWishlistCount() {
        const countEl = document.getElementById('wishlistCount');
        if (countEl) {
            countEl.textContent = this.wishlist.length;
        }
    }

    static renderFilms() {
        const filmsGrid = document.getElementById('filmsGrid');
        if (!filmsGrid) return;

        filmsGrid.innerHTML = '';

        this.films.forEach(film => {
            const isInWishlist = this.wishlist.some(w => w.id === film.id || w.id === film._id);
            const filmCard = this.createFilmCard(film, isInWishlist);
            filmsGrid.appendChild(filmCard);
        });
    }

    static createFilmCard(film, isInWishlist = false) {
        const card = document.createElement('div');
        card.className = 'film-card';
        card.innerHTML = `
            <div class="film-poster">
                <i class="fas fa-film fa-3x"></i>
            </div>
            <div class="film-info">
                <h3 class="film-title">${film.title}</h3>
                <p class="film-description">${film.description}</p>
                <div class="film-meta">
                    <span class="film-genre">
                        <i class="fas fa-tag"></i> ${film.genre}
                    </span>
                    <span class="film-year">
                        <i class="fas fa-calendar"></i> ${film.year}
                    </span>
                    <span class="film-rating">
                        <i class="fas fa-star"></i> ${film.rating}/10
                    </span>
                </div>
            </div>
            <div class="film-actions">
                <button 
                    class="btn ${isInWishlist ? 'btn-danger' : 'btn-primary'} wishlist-btn"
                    onclick="FilmsManager.toggleWishlist('${film.id || film._id}', this)"
                >
                    <i class="fas ${isInWishlist ? 'fa-heart-broken' : 'fa-heart'}"></i>
                    ${isInWishlist ? 'Retirer' : 'Ajouter'}
                </button>
            </div>
        `;
        return card;
    }

    static async toggleWishlist(filmId, button) {
        const token = AuthManager.getToken();
        if (!token) {
            UI.showNotification('Vous devez être connecté', 'error');
            return;
        }

        const isInWishlist = this.wishlist.some(w => w.id === filmId);
        const method = isInWishlist ? 'DELETE' : 'POST';
        const endpoint = `${API_BASE_URL}/films/wishlist/${filmId}`;

        UI.setButtonLoading(button);

        try {
            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                if (isInWishlist) {
                    this.wishlist = this.wishlist.filter(w => w.id !== filmId);
                    button.className = 'btn btn-primary wishlist-btn';
                    button.innerHTML = '<i class="fas fa-heart"></i> Ajouter';
                    UI.showNotification('Film retiré de la wishlist', 'success');
                } else {
                    await this.loadWishlist(); // Recharger pour avoir les détails complets
                    button.className = 'btn btn-danger wishlist-btn';
                    button.innerHTML = '<i class="fas fa-heart-broken"></i> Retirer';
                    UI.showNotification('Film ajouté à la wishlist', 'success');
                }
                this.updateWishlistCount();
            } else {
                const error = await response.json();
                UI.showNotification(error.message || 'Erreur', 'error');
            }
        } catch (error) {
            console.error('Erreur wishlist:', error);
            UI.showNotification('Erreur réseau', 'error');
        } finally {
            UI.setButtonLoading(button, false);
        }
    }

    static filterFilms() {
        const genre = document.getElementById('genreFilter')?.value || '';
        const rating = parseFloat(document.getElementById('ratingFilter')?.value || 0);
        const search = document.getElementById('searchFilter')?.value.toLowerCase() || '';

        // Mettre à jour l'affichage de la note
        const ratingValue = document.getElementById('ratingValue');
        if (ratingValue) ratingValue.textContent = rating;

        const filteredFilms = this.films.filter(film => {
            const matchGenre = !genre || film.genre === genre;
            const matchRating = film.rating >= rating;
            const matchSearch = !search || 
                film.title.toLowerCase().includes(search) ||
                film.description.toLowerCase().includes(search);

            return matchGenre && matchRating && matchSearch;
        });

        this.renderFilteredFilms(filteredFilms);
    }

    static renderFilteredFilms(filteredFilms) {
        const filmsGrid = document.getElementById('filmsGrid');
        if (!filmsGrid) return;

        filmsGrid.innerHTML = '';

        if (filteredFilms.length === 0) {
            filmsGrid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search fa-3x"></i>
                    <h3>Aucun film trouvé</h3>
                    <p>Essayez de modifier vos critères de recherche</p>
                </div>
            `;
            return;
        }

        filteredFilms.forEach(film => {
            const isInWishlist = this.wishlist.some(w => w.id === film.id || w.id === film._id);
            const filmCard = this.createFilmCard(film, isInWishlist);
            filmsGrid.appendChild(filmCard);
        });
    }
}

// Fonction pour afficher la wishlist
function showWishlist() {
    const modal = document.getElementById('wishlistModal');
    const content = document.getElementById('wishlistContent');
    
    if (!modal || !content) return;

    if (FilmsManager.wishlist.length === 0) {
        content.innerHTML = `
            <div class="empty-wishlist">
                <i class="fas fa-heart fa-3x"></i>
                <h3>Votre wishlist est vide</h3>
                <p>Ajoutez des films depuis le catalogue pour les retrouver ici</p>
                <a href="/films.html" class="btn btn-primary">
                    <i class="fas fa-film"></i> Découvrir les films
                </a>
            </div>
        `;
    } else {
        content.innerHTML = `
            <div class="wishlist-stats">
                <h4><i class="fas fa-heart"></i> ${FilmsManager.wishlist.length} film(s) dans votre wishlist</h4>
            </div>
            <div class="wishlist-films">
                ${FilmsManager.wishlist.map(film => `
                    <div class="wishlist-item">
                        <div class="film-info">
                            <h4>${film.title}</h4>
                            <p>${film.description}</p>
                            <div class="film-meta">
                                <span><i class="fas fa-tag"></i> ${film.genre}</span>
                                <span><i class="fas fa-calendar"></i> ${film.year}</span>
                                <span><i class="fas fa-star"></i> ${film.rating}/10</span>
                            </div>
                            <small class="added-date">
                                <i class="fas fa-clock"></i> 
                                Ajouté le ${new Date(film.addedAt).toLocaleDateString()}
                            </small>
                        </div>
                        <div class="film-actions">
                            <button 
                                class="btn btn-danger btn-sm"
                                onclick="FilmsManager.toggleWishlist('${film.id}', this); closeWishlistModal();"
                            >
                                <i class="fas fa-trash"></i> Retirer
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    modal.style.display = 'block';
}

// Fermer la modal wishlist
function closeWishlistModal() {
    const modal = document.getElementById('wishlistModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Fonction pour les filtres
function filterFilms() {
    FilmsManager.filterFilms();
}

// Fermer la modal en cliquant à l'extérieur
window.onclick = function(event) {
    const modal = document.getElementById('wishlistModal');
    if (event.target === modal) {
        closeWishlistModal();
    }
}

// Initialisation de la page films
function initFilmsPage() {
    // Initialiser le slider de note
    const ratingFilter = document.getElementById('ratingFilter');
    const ratingValue = document.getElementById('ratingValue');
    
    if (ratingFilter && ratingValue) {
        ratingFilter.addEventListener('input', () => {
            ratingValue.textContent = ratingFilter.value;
        });
    }

    // Charger les films
    FilmsManager.loadFilms();
}

// Auto-initialisation pour la page films
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('films.html')) {
        initFilmsPage();
    }
}); 