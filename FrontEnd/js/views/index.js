import { fetchCategories } from "../libs/categories.js";
import { fetchPhotoById, fetchWorks } from "../libs/work.js";

console.log("tout est bon");

document.allWorks = []; // Stockera les travaux récupérés depuis l'API

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // 1. Récupérer les travaux via l'API
    const works = await fetchWorks();
    document.allWorks = works;

    // 2. Affichage initial de tous les travaux
    renderGallery(document.allWorks);

    // 3. Génération dynamique du menu de catégories
    generateCategoryMenu();

    // 4. Gestion du lien de connexion/déconnexion
    handleAuthLink();
  } catch (error) {
    console.error("Erreur lors du chargement des travaux :", error);
  }
});

/**
 * Récupère plusieurs photos en utilisant une boucle for.
 * @param {Array<number|string>} photoIds - Un tableau d'identifiants de photos.
 * @returns {Promise<Array>} Un tableau d'objets photos.
 */
export async function fetchPhotosForLoop(photoIds) {
  const photos = [];
  for (let i = 0; i < photoIds.length; i++) {
    console.log("Fetching photo with ID:", photoIds[i]);
    try {
      const photo = await fetchPhotoById(photoIds[i]);
      photos.push(photo);
    } catch (error) {
      console.error(`Erreur lors du fetch de la photo ${photoIds[i]}:`, error);
    }
  }
  return photos;
}

/**
 * Affiche la galerie en créant dynamiquement des <figure>.
 */
export function renderGallery(works) {
  const gallery = document.querySelector(".gallery");
  if (!gallery) {
    console.error("Aucun conteneur .gallery trouvé dans le HTML.");
    return;
  }
  gallery.innerHTML = ""; // Vider le contenu statique

  works.forEach((work) => {
    const figure = document.createElement("figure");
    figure.dataset.workId = work.id; // Ajouter l'ID comme attribut data pour faciliter les opérations
    
    const img = document.createElement("img");
    img.src = work.imageUrl; // Doit être une URL complète
    img.alt = work.title;

    const caption = document.createElement("figcaption");
    caption.textContent = work.title;

    figure.appendChild(img);
    figure.appendChild(caption);
    gallery.appendChild(figure);
  });
}

/**
 * Génère le menu de catégories en évitant les doublons (via Set).
 */
async function generateCategoryMenu() {
  try {
    const categories = await fetchCategories();
    const menuContainer = document.querySelector(".category-menu");
    if (!menuContainer) {
      console.error("Aucun conteneur .category-menu trouvé dans le HTML.");
      return;
    }
    // Vider le menu pour éviter tout doublon
    menuContainer.innerHTML = "";

    // Bouton "Tous"
    const btnTous = document.createElement("button");
    btnTous.textContent = "Tous";
    btnTous.classList.add("filter-button", "active"); // Actif par défaut
    btnTous.addEventListener("click", () => {
      setActiveButton(btnTous);
      renderGallery(document.allWorks);
    });
    menuContainer.appendChild(btnTous);

    // Créer un bouton pour chaque catégorie
    categories.forEach((category) => {
      const btn = document.createElement("button");
      btn.textContent = category.name;
      btn.classList.add("filter-button");
      btn.addEventListener("click", () => {
        setActiveButton(btn);
        const filtered = document.allWorks.filter(
          (w) => w.category && w.category.id === category.id
        );
        renderGallery(filtered);
      });
      menuContainer.appendChild(btn);
    });
  } catch (e) {
    console.error("Erreur lors du chargement des catégories:", e);
  }
}

/**
 * Gère l'état "active" sur le bouton cliqué.
 */
function setActiveButton(activeBtn) {
  const buttons = document.querySelectorAll(".filter-button");
  buttons.forEach((btn) => btn.classList.remove("active"));
  activeBtn.classList.add("active");
}

/**
 * Gère l'affichage du lien de connexion/déconnexion.
 */
function handleAuthLink() {
  // Sélectionner le lien de connexion dans le header
  const loginLink = document.querySelector('nav ul li a[href="login.html"]');
  if (!loginLink) return;

  // Si un token est présent, on considère que l'utilisateur est connecté
  if (localStorage.getItem("token")) {
    // Modifier le texte du lien en "Logout"
    loginLink.textContent = "Logout";
    // Optionnel : empêcher la navigation vers login.html
    loginLink.href = "#";

    // Afficher la barre d'édition et le bouton modifier
    const editionBar = document.querySelector('.edition-bar');
    const modifierBtn = document.querySelector('.modifier-btn');
    if (editionBar) editionBar.style.display = 'flex';
    if (modifierBtn) modifierBtn.style.display = 'flex';

    // Ajouter un écouteur pour gérer la déconnexion
    loginLink.addEventListener("click", (e) => {
      e.preventDefault();
      // Supprimer le token de localStorage pour déconnecter l'utilisateur
      localStorage.removeItem("token");
      // Rediriger vers la page de connexion ou rafraîchir la page des projets
      window.location.href = "login.html";
    });
  } else {
    // Cacher la barre d'édition et le bouton modifier si non connecté
    const editionBar = document.querySelector('.edition-bar');
    const modifierBtn = document.querySelector('.modifier-btn');
    if (editionBar) editionBar.style.display = 'none';
    if (modifierBtn) modifierBtn.style.display = 'none';
  }
}

// Fonction pour mettre à jour les travaux
export function updateWorks(newWork) {
  document.allWorks.push(newWork);
  renderGallery(document.allWorks);
}

// Fonction pour supprimer un travail de la liste globale
export function removeWorkFromList(workId) {
  document.allWorks = document.allWorks.filter(work => work.id !== workId);
  renderGallery(document.allWorks);
}