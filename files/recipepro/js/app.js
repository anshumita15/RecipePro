// app.js – Main application logic

document.addEventListener('DOMContentLoaded', () => {
  // Auth guard
  const user = JSON.parse(
    sessionStorage.getItem('rp_current_user') ||
    localStorage.getItem('rp_session') ||
    'null'
  );
  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  // Show username
  const nameEl = document.getElementById('nav-username');
  if (nameEl) nameEl.textContent = `Hi, ${user.name.split(' ')[0]} 👋`;

  // Load saved API keys
  loadApiKeys();
});

function loadApiKeys() {
  const saved = JSON.parse(localStorage.getItem('rp_api_keys') || '{}');
  if (saved.gemini) document.getElementById('gemini-key').value = saved.gemini;
  if (saved.elevenlabs) document.getElementById('elevenlabs-key').value = saved.elevenlabs;
}

function saveApiKeys() {
  const gemini = document.getElementById('gemini-key').value.trim();
  const elevenlabs = document.getElementById('elevenlabs-key').value.trim();
  localStorage.setItem('rp_api_keys', JSON.stringify({ gemini, elevenlabs }));
  closeApiModal();
  showToastApp('API keys saved ✓');
}

function openApiModal() {
  document.getElementById('api-modal').classList.remove('hidden');
}

function closeApiModal() {
  document.getElementById('api-modal').classList.add('hidden');
}

function showToastApp(msg) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.style.cssText = `position:fixed;top:80px;left:50%;transform:translateX(-50%);
      background:rgba(26,26,26,0.9);color:white;padding:10px 22px;border-radius:100px;
      font-size:14px;font-weight:500;z-index:9999;animation:toastIn 0.25s ease;`;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 2500);
}

async function generateRecipes() {
  if (ingredients.length === 0) {
    showToastApp('Please add at least one ingredient first!');
    return;
  }

  const btn = document.getElementById('generate-btn');
  const label = document.getElementById('generate-label');
  const spinner = document.getElementById('generate-spinner');

  btn.disabled = true;
  label.classList.add('hidden');
  spinner.classList.remove('hidden');

  try {
    // Use saved keys if different from defaults
    const saved = JSON.parse(localStorage.getItem('rp_api_keys') || '{}');
    if (saved.gemini) window.GEMINI_API_KEY_OVERRIDE = saved.gemini;
    if (saved.elevenlabs) window.ELEVENLABS_API_KEY_OVERRIDE = saved.elevenlabs;

    const recipes = await generateRecipesFromGemini(ingredients, selectedDiet);
    displayRecipes(recipes);
  } catch (err) {
    console.error('Recipe generation error:', err);
    showToastApp('Error generating recipes. Check your API key and try again.');
  } finally {
    btn.disabled = false;
    label.classList.remove('hidden');
    spinner.classList.add('hidden');
  }
}

function displayRecipes(recipes) {
  const overlay = document.getElementById('recipes-overlay');
  const grid = document.getElementById('recipes-grid');
  const count = document.getElementById('recipe-count');

  count.textContent = `${recipes.length} recipes`;

  grid.innerHTML = recipes.map(recipe => `
    <div class="recipe-card" onclick="selectRecipe(${recipe.id})">
      <div class="recipe-card-img" id="img-${recipe.id}">
        <div class="hero-placeholder">${recipe.emoji || '🍽️'}</div>
      </div>
      <div class="recipe-card-body">
        <div class="recipe-card-title">${recipe.name}</div>
        <div class="recipe-card-desc">${recipe.description}</div>
        <div class="recipe-card-meta">
          <span class="card-meta-badge">👥 Serves ${recipe.servings}</span>
          <span class="card-meta-badge">🔥 ${recipe.calories} kcal</span>
          <span class="card-meta-badge">⏱ ${(recipe.prep_time || 0) + (recipe.cook_time || 0)} min</span>
        </div>
        <div class="macros-row">
          <span class="macro-chip">P: ${recipe.macros?.protein || 0}g</span>
          <span class="macro-chip">C: ${recipe.macros?.carbs || 0}g</span>
          <span class="macro-chip">F: ${recipe.macros?.fat || 0}g</span>
        </div>
        <button class="btn-cook" onclick="event.stopPropagation(); selectRecipe(${recipe.id})">
          Start Cooking →
        </button>
      </div>
    </div>
  `).join('');

  // Store recipes globally for cook page access
  window._generatedRecipes = recipes;
  sessionStorage.setItem('rp_recipes', JSON.stringify(recipes));

  overlay.classList.remove('hidden');

  // Async: load images for each recipe
  recipes.forEach(recipe => loadRecipeImage(recipe));
}

async function loadRecipeImage(recipe) {
  const imgContainer = document.getElementById(`img-${recipe.id}`);
  if (!imgContainer) return;

  try {
    const imagePrompt = recipe.image_prompt ||
      `${recipe.name}, professional food photography, beautifully plated, warm lighting, restaurant quality`;
    const imgSrc = await generateRecipeImage(imagePrompt, recipe.emoji);

    if (imgSrc && imgContainer) {
      imgContainer.innerHTML = `<img src="${imgSrc}" alt="${recipe.name}" />`;
    }
  } catch (e) {
    // Keep emoji placeholder
  }
}

function selectRecipe(recipeId) {
  const recipes = window._generatedRecipes ||
    JSON.parse(sessionStorage.getItem('rp_recipes') || '[]');
  const recipe = recipes.find(r => r.id === recipeId);
  if (!recipe) return;

  sessionStorage.setItem('rp_selected_recipe', JSON.stringify(recipe));
  window.location.href = 'cook.html';
}

function closeRecipes() {
  document.getElementById('recipes-overlay').classList.add('hidden');
}

function signOut() {
  sessionStorage.clear();
  localStorage.removeItem('rp_session');
  window.location.href = 'index.html';
}
