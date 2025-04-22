export async function fetchCategories() {
  const response = await fetch(`http://localhost:5678/api/categories`);
  if (!response.ok) {
    throw new Error(`Erreur HTTP pour les photos : ${response.status}`);
  }
  return response.json();
}