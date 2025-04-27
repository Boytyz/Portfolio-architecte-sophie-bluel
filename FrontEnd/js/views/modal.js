// modal.js
import { deleteWork, addWork } from '../libs/work.js';
import { fetchCategories } from '../libs/categories.js';
import { renderGallery } from './index.js';

// Rendre renderGallery disponible globalement pour qu'elle puisse être appelée depuis work.js
window.renderGallery = renderGallery;

/**
 * Crée et retourne l'élément modal (overlay) contenant la fenêtre modale.
 * Utilise fetch pour récupérer les photos via l'API et les afficher dans la vue "Galerie photo".
 */
function renderModal({ modalTitleText, onClose, onSubmit }) {
  // Créer l'overlay qui recouvre toute la page
  const overlay = document.createElement('div');
  overlay.classList.add('modal-overlay');

  // Créer le conteneur principal de la modale
  const modalContainer = document.createElement('div');
  modalContainer.classList.add('modal-container');

  // ----- Header de la modale -----
  const header = document.createElement('header');
  header.classList.add('modal-header');
  // Modifier le style du header : fond blanc
  header.style.backgroundColor = 'white';
  // Assurer que le header n'impose pas de police particulière
  header.style.fontFamily = 'inherit';

  const titleElement = document.createElement('h2');
  titleElement.innerText = modalTitleText; // Par défaut "Galerie photo"
  // Centrer le titre
  titleElement.style.textAlign = 'center';
  header.appendChild(titleElement);

  const closeButton = document.createElement('button');
  closeButton.classList.add('modal-close');
  closeButton.innerHTML = '&times;'; // symbole de fermeture
  // Positionner la croix en haut à droite
  closeButton.style.position = 'absolute';
  closeButton.style.top = '10px';  // Valeur positive pour être visible
  closeButton.style.right = '10px';
  closeButton.addEventListener('click', onClose);
  header.appendChild(closeButton);

  const backarrow = document.createElement('button');
  backarrow.classList.add('modal-backarrow');
  backarrow.innerHTML = '<i class="fa-solid fa-arrow-left"></i>';
  backarrow.style.position = 'absolute';
  backarrow.style.top = '10px';  // Valeur positive pour être visible
  backarrow.style.left = '10px';
  backarrow.style.display = 'none'; // Cachée par défaut
  backarrow.addEventListener('click', () => {
    switchView(modalContainer, 'gallery');
    titleElement.innerText = 'Galerie photo';
  });
  header.appendChild(backarrow);

  modalContainer.appendChild(header);

  // ----- Vue "Galerie photo" -----
  const galleryView = document.createElement('div');
  galleryView.classList.add('modal-view', 'gallery-view');

  // Créer une div qui contiendra les photos, avec une organisation en grid
  const photoContainer = document.createElement('div');
  photoContainer.classList.add('photo-container');
  photoContainer.style.display = 'grid';
  photoContainer.style.gridTemplateColumns = 'repeat(5, 1fr)';
  photoContainer.style.gap = '10px';
  photoContainer.style.padding = '50px 0px';
  photoContainer.style.borderBottom = '1px solid #B3B3B3';

  // Afficher les travaux depuis document.allWorks
  const photos = document.allWorks.slice(0, 11);
  photos.forEach(photo => {
    const wrapper = document.createElement('div');
    // Chaque wrapper occupe environ 20% pour afficher 5 images max par ligne
    wrapper.style.flex = '0 0 calc(20% - 10px)';
    wrapper.style.display = 'flex';
    wrapper.style.justifyContent = 'center';
    wrapper.dataset.id = photo.id; // Stocker l'ID pour la suppression

    const img = document.createElement('img');
    img.src = photo.imageUrl;
    img.alt = photo.title;
    img.style.width = '80px';
    img.style.height = 'auto';
    img.style.justifySelf = 'center';

    // Créer le bouton "Supprimer"
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash" style="width: 11px; height: 9px;"></i>';
    deleteBtn.style.backgroundColor = '#000';
    deleteBtn.style.border = 'none';
    deleteBtn.style.borderRadius = '4px';
    deleteBtn.style.padding = '0px';
    deleteBtn.style.cursor = 'pointer';
    deleteBtn.style.color = '#fff';
    deleteBtn.style.width = '17px';
    deleteBtn.style.height = '17px';

    deleteBtn.addEventListener('click', () => {
      const workId = parseInt(wrapper.dataset.id);
      console.log('ID à supprimer:', workId);
      deleteWork(workId, wrapper);
    });

    // Ajouter l'image et le bouton au wrapper
    wrapper.appendChild(img);
    wrapper.appendChild(deleteBtn);

    photoContainer.appendChild(wrapper);
  });
  galleryView.appendChild(photoContainer);

  // Créer une nouvelle div pour contenir le bouton "Ajouter une photo"
  const buttonContainer = document.createElement('div');
  buttonContainer.classList.add('button-container');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.justifyContent = 'center';
  buttonContainer.style.marginTop = '10px';

  // Créer le bouton "Ajouter une photo" 
  const addPhotoToggleBtn = document.createElement('button');
  addPhotoToggleBtn.innerText = 'Ajouter une photo';
  addPhotoToggleBtn.classList.add('toggle-add-photo-btn');
  addPhotoToggleBtn.style.backgroundColor = '#1D6154';
  addPhotoToggleBtn.style.border = '1px solid #1D6154';
  addPhotoToggleBtn.style.borderRadius = '60px';
  addPhotoToggleBtn.style.padding = '10px 20px';
  addPhotoToggleBtn.style.color = '#fff';
  addPhotoToggleBtn.style.cursor = 'pointer';
  addPhotoToggleBtn.style.fontFamily = 'Syne';
  addPhotoToggleBtn.addEventListener('click', () => {
    switchView(modalContainer, 'addPhoto');
    titleElement.innerText = 'Ajout photo';
  });

  buttonContainer.appendChild(addPhotoToggleBtn);
  galleryView.appendChild(buttonContainer);
  modalContainer.appendChild(galleryView);

  // ----- Vue "Ajout photo" -----
const addPhotoView = document.createElement('div');
addPhotoView.classList.add('modal-view', 'add-photo-view');
addPhotoView.style.display = 'none'; // Cachée par défaut
addPhotoView.style.margin = '0px 50px';
addPhotoView.innerHTML = `
  <div class="ajout-photo-container" style="padding: 20px; font-family: inherit;">
    <form class="ajout-photo-form" style="display: flex; flex-direction: column; gap: 15px; margin-top: 20px;">
      <div class="ajout-photo-header" style="display: flex; flex-direction: column; align-items: center; background-color: #E8F1F6; padding: 10px; gap: 10px;">
        <i class="fa-solid fa-image" style="font-size: 24px; color: #1D6154;"></i>
        <label for="photo-file" class="custom-file-upload" style="display: inline-block; cursor: pointer; background: #fff; border: 1px solid #1D6154; border-radius: 60px; padding: 10px 20px; text-align: center; color: #1D6154; font-family: 'Syne', sans-serif;">
           + Ajouter photo
          <input type="file" id="photo-file" accept="image/*" required style="display: none;"/>
        </label>
        <div class="preview-container" style="width: 100%; display: flex; justify-content: center;"></div>
        <p class="file-info" style="font-size: 12px; color: #444; margin-top: 5px;">jpg, png : 4mo max</p>
      </div>
      <label for="photo-title" style="font-weight: bold;">Titre</label>
      <input type="text" id="photo-title" placeholder="" required style="padding: 10px; border: 1px solid #ccc; border-radius: 4px; box-shadow: 0px 4px 14px 0px #00000017;"/>
      <label for="photo-category" style="font-weight: bold;">Choisir une catégorie</label>
      <select id="photo-category" required style="padding: 10px; border: 1px solid #ccc; border-radius: 4px; box-shadow: 0px 4px 14px 0px #00000017;">
        <option value="">Choisir une catégorie</option>
      </select>
      <div class="form-error" style="color: red; min-height: 20px;"></div>
      <button type="submit" class="validate-btn" style="background-color: #1D6154; border: none; border-radius: 60px; padding: 10px 20px; color: #fff; font-family: 'Syne', sans-serif; cursor: pointer;">
        Valider
      </button>
    </form>
  </div>
`;

modalContainer.appendChild(addPhotoView);

// Sélectionner le formulaire et les éléments pertinents
const ajoutPhotoForm = addPhotoView.querySelector('.ajout-photo-form');
const fileInput = addPhotoView.querySelector('#photo-file');
const ajoutPhotoHeader = addPhotoView.querySelector('.ajout-photo-header');
const previewContainer = addPhotoView.querySelector('.preview-container');
const formError = addPhotoView.querySelector('.form-error');
const validateBtn = addPhotoView.querySelector('.validate-btn');

// Fonction pour vérifier si le formulaire est valide
function validateForm() {
  const file = fileInput.files[0];
  const title = addPhotoView.querySelector('#photo-title').value.trim();
  const category = addPhotoView.querySelector('#photo-category').value;
  
  if (file && title && category) {
    validateBtn.style.backgroundColor = '#1D6154';
    validateBtn.disabled = false;
    return true;
  } else {
    validateBtn.style.backgroundColor = '#A7A7A7';
    validateBtn.disabled = true;
    return false;
  }
}

// Écouteur d'événements pour la prévisualisation de l'image
fileInput.addEventListener('change', (e) => {
  // Effacer le contenu précédent
  previewContainer.innerHTML = '';
  formError.textContent = '';
  
  if (fileInput.files && fileInput.files[0]) {
    const file = fileInput.files[0];
    
    // Vérifier le type du fichier
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      formError.textContent = 'Format non supporté. Utilisez JPG ou PNG.';
      return;
    }
    
    // Vérifier la taille du fichier (max 4Mo)
    const maxSize = 4 * 1024 * 1024;
    if (file.size > maxSize) {
      formError.textContent = 'L\'image dépasse 4Mo.';
      return;
    }
    
    // Créer la prévisualisation
    const reader = new FileReader();
    reader.onload = (e) => {
      // Masquer l'icône et le texte d'information
      ajoutPhotoHeader.querySelector('.fa-image').style.display = 'none';
      ajoutPhotoHeader.querySelector('.custom-file-upload').style.display = 'none';
      ajoutPhotoHeader.querySelector('.file-info').style.display = 'none';
      
      // Créer et afficher la prévisualisation
      const preview = document.createElement('img');
      preview.src = e.target.result;
      preview.style.maxWidth = '100%';
      preview.style.maxHeight = '200px';
      preview.style.objectFit = 'contain';
      previewContainer.appendChild(preview);
    };
    reader.readAsDataURL(file);
  }
  
  validateForm();
});

// Écouteurs pour surveiller les changements dans les champs du formulaire
addPhotoView.querySelector('#photo-title').addEventListener('input', validateForm);
addPhotoView.querySelector('#photo-category').addEventListener('change', validateForm);

// Dans le gestionnaire d'événement submit du formulaire
ajoutPhotoForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  formError.textContent = '';
  
  // Sélectionner les champs du formulaire
  const fileInput = addPhotoView.querySelector('#photo-file');
  const titleInput = addPhotoView.querySelector('#photo-title');
  const categorySelect = addPhotoView.querySelector('#photo-category');
  
  // Vérifier que tous les champs sont remplis
  if (!fileInput.files.length) {
    formError.textContent = 'Veuillez sélectionner une image';
    return;
  }
  if (!titleInput.value.trim()) {
    formError.textContent = 'Veuillez saisir un titre';
    return;
  }
  if (!categorySelect.value) {
    formError.textContent = 'Veuillez sélectionner une catégorie';
    return;
  }
  
  // Vérifier le fichier
  const file = fileInput.files[0];
  if (!file.type.match('image.*')) {
    formError.textContent = 'Le fichier doit être une image';
    return;
  }
  
  // Afficher un état de chargement
  validateBtn.textContent = 'Envoi en cours...';
  validateBtn.disabled = true;

  
    // Créer un objet FormData et y ajouter les données du formulaire
    const formData = new FormData();
    formData.append('image', file);
    formData.append('title', titleInput.value.trim());
    formData.append('categoryId', parseInt(categorySelect.value)); // S'assurer que c'est un entier


  try {
    // Utiliser la fonction addWork pour ajouter le travail
    const newWork = await addWork(formData);
    console.log('Travail ajouté avec succès:', newWork);
    
    // Réinitialiser tous les champs du formulaire
    document.querySelector('.ajout-photo-form').reset();
    
    // Effacer aussi la prévisualisation de l'image si vous en avez une
    const imagePreview = document.querySelector('.image-preview-container img');
    if (imagePreview) {
      // Cacher la prévisualisation
      imagePreview.parentElement.style.display = 'none';
    }
    
    // Réafficher le sélecteur de fichier qui était caché pendant la prévisualisation
    const fileSelector = document.querySelector('.add-photo-container');
    if (fileSelector) {
      fileSelector.style.display = 'flex';
    }
    
    // Rafraîchir l'affichage de la galerie pour inclure le nouveau projet
    await refreshModalGallery(); 
    
  } catch (error) {
    console.error('Erreur lors de l\'ajout du travail:', error);
    formError.textContent = `Erreur: ${error.message || 'Une erreur est survenue'}`;
  } 
  
  finally {
    validateBtn.textContent = 'Valider';
    validateBtn.disabled = false;
  }
});


// Remplir dynamiquement le <select> des catégories
const populateCategories = async () => {
  const selectElement = addPhotoView.querySelector('#photo-category');
  try {
    const categories = await fetchCategories();
    selectElement.innerHTML = '<option value="">Choisir une catégorie</option>';
    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = cat.name;
      selectElement.appendChild(option);
    });
  } catch (error) {
    console.error('Erreur lors du fetch des catégories:', error);
    formError.textContent = 'Erreur de chargement des catégories';
    selectElement.innerHTML = '<option value="">Erreur de chargement</option>';
  }
};

// Appeler la fonction pour charger les catégories
populateCategories();


// ----- Fermeture de la modale en cliquant en dehors du conteneur -----
  overlay.addEventListener('click', function handler(e) {
    if (e.target === overlay) {
      onClose();
      overlay.removeEventListener('click', handler);
    }
  });

  overlay.appendChild(modalContainer);
  return overlay;
}

// Fonction pour fermer la modale
function closeModal() {
  const overlay = document.querySelector('.modal-overlay');
  if (overlay) {
    document.body.removeChild(overlay);
    // Actualiser la galerie principale après fermeture de la modale
    if (typeof window.renderGallery === 'function' && document.allWorks) {
      window.renderGallery(document.allWorks);
    }
  }
}

// Fonction pour basculer entre les vues "Galerie photo" et "Ajout photo"
function switchView(modalContainer, view) {
  const galleryView = modalContainer.querySelector('.gallery-view');
  const addPhotoView = modalContainer.querySelector('.add-photo-view');
  const backarrow = modalContainer.querySelector('.modal-backarrow');
  if (view === 'gallery') {
    galleryView.style.display = 'block';
    addPhotoView.style.display = 'none';
    // Masquer la flèche lorsque l'on est sur la vue "Galerie photo"
    if (backarrow) {
      backarrow.style.display = 'none';
    }
  } else if (view === 'addPhoto') {
    galleryView.style.display = 'none';
    addPhotoView.style.display = 'block';
    // Afficher la flèche dans la vue "Ajout photo"
    if (backarrow) {
      backarrow.style.display = 'block';
    }
  }
}

// Fonction pour actualiser la galerie de la modale
function refreshModalGallery() {
  const photoContainer = document.querySelector('.photo-container');
  if (!photoContainer) return;
  
  // Vider le conteneur
  photoContainer.innerHTML = '';
  
  // Remplir avec les travaux actualisés
  const photos = document.allWorks //.slice(0, 11);
  photos.forEach(photo => {
    const wrapper = document.createElement('div');
    wrapper.style.flex = '0 0 calc(20% - 10px)';
    wrapper.style.display = 'flex';
    wrapper.style.justifyContent = 'center';
    wrapper.dataset.id = photo.id;

    const img = document.createElement('img');
    img.src = photo.imageUrl;
    img.alt = photo.title;
    img.style.width = '80px';
    img.style.height = 'auto';
    img.style.justifySelf = 'center';

    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash" style="width: 11px; height: 9px;"></i>';
    deleteBtn.style.backgroundColor = '#000';
    deleteBtn.style.border = 'none';
    deleteBtn.style.borderRadius = '4px';
    deleteBtn.style.padding = '0px';
    deleteBtn.style.cursor = 'pointer';
    deleteBtn.style.color = '#fff';
    deleteBtn.style.width = '17px';
    deleteBtn.style.height = '17px';

    deleteBtn.addEventListener('click', async() => {
      const workId = parseInt(photo.id);
      let response = await deleteWork(workId);
     if (response) wrapper.remove();
    });

    wrapper.appendChild(img);
    wrapper.appendChild(deleteBtn);
    photoContainer.appendChild(wrapper);
  });
}

/**
 * Ouvre la modale en injectant l'overlay dans le DOM.
 */
export function openModal() {
  const modalOverlay = renderModal({
    modalTitleText: 'Galerie photo',
    onClose: closeModal
  });
  document.body.appendChild(modalOverlay);
}

// Export des fonctions
export { closeModal };

// Attache l'écouteur sur le bouton "modifier" pour ouvrir la modale
document.addEventListener('DOMContentLoaded', () => {
  const modifierBtn = document.querySelector('.modifier-btn');
  if (modifierBtn) {
    modifierBtn.addEventListener('click', openModal);
  }
  
  // Vérification si l'utilisateur est connecté pour afficher ou masquer les éléments d'édition
  const isLoggedIn = localStorage.getItem('token');
  const editionBar = document.querySelector('.edition-bar');
  
  if (editionBar) {
    editionBar.style.display = isLoggedIn ? "flex" : "none";
  }
  
  if (modifierBtn) {
    modifierBtn.style.display = isLoggedIn ? "flex" : "none";
  }
});