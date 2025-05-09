/**
 * Récupère une photo depuis l'API en utilisant son identifiant.
 * @param {number|string} photoId - L'ID de la photo à récupérer.
 * @returns {Promise<object>} La photo récupérée.
 */
export async function fetchPhotoById(photoId) {
  const response = await fetch(`http://localhost:5678/api/works/${photoId}`);
  if (!response.ok) {
    throw new Error(`Erreur HTTP pour la photo ${photoId}: ${response.status}`);
  }
  return response.json();
}

export async function fetchWorks() {
  const response = await fetch(`http://localhost:5678/api/works/`);
  if (!response.ok) {
    throw new Error(`Erreur HTTP pour les photos : ${response.status}`);
  }
  return response.json();
}

export async function deleteWork(workId) {
  try {
    const response = await fetch(`http://localhost:5678/api/works/${workId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la suppression : ${response.status}`);
    }
    
    // Pour les requêtes DELETE, nous ne tentons pas de traiter un JSON
    // car l'API peut retourner un corps vide (204 No Content)

    console.log(`Travail ${workId} supprimé avec succès.`);
    return true;
  } catch (error) {
    console.error('Erreur de suppression :', error);
    throw error;
  }
}

export async function addWork(formData) {
  try {
    // Debug pour vérifier le contenu du FormData
    console.log("Contenu du FormData avant envoi:");
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}: ${typeof pair[1] === 'object' ? 'File: ' + pair[1].name : pair[1]}`);
    }

    const response = await fetch('http://localhost:5678/api/works', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
        // IMPORTANT: NE PAS ajouter 'Content-Type' header avec FormData
      },
      body: formData
    });
    
    if (!response.ok) {
      // Tenter de récupérer le détail de l'erreur
      let errorDetail = '';
      try {
        const errorJson = await response.json();
        errorDetail = JSON.stringify(errorJson);
      } catch (e) {
        errorDetail = await response.text();
      }
      
      throw new Error(`Erreur lors de l'ajout : ${response.status} - ${errorDetail}`);
    }
    
    const result = await response.json();
    
    return result;
  } catch (error) {
    console.error('Erreur d\'ajout :', error);
    throw error;
  }
}
