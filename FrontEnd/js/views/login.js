document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.querySelector('.login-form');
  const errorMessageElement = document.getElementById('error-message');
  
  if (!loginForm) {
    console.error('Formulaire de connexion non trouvé');
    return;
  }
  
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Réinitialiser le message d'erreur
    if (errorMessageElement) {
      errorMessageElement.textContent = '';
    }

    try {
      const response = await fetch('http://localhost:5678/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        let errorMessage = 'Identifiants incorrects.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // Si la réponse n'est pas du JSON valide, on garde le message par défaut
        }
        
        if (errorMessageElement) {
          errorMessageElement.textContent = errorMessage;
        }
        return;
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      
      // Optionnel: stocker d'autres informations utilisateur si nécessaire
      if (data.userId) {
        localStorage.setItem('userId', data.userId);
      }
      
      window.location.href = 'index.html'; // redirection vers la page des projets
      
    } catch (error) {
      console.error('Erreur lors de la connexion :', error);
      if (errorMessageElement) {
        errorMessageElement.textContent = 'Erreur lors de la connexion. Veuillez réessayer.';
      }
    }
  });
});

  
  