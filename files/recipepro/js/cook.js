// cook.js – Cooking mode: step navigation, TTS, and voice commands

let recipe = null;
let currentStep = 0;
let micActive = false;
let voiceToastTimeout = null;

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

  // Load recipe
  recipe = JSON.parse(sessionStorage.getItem('rp_selected_recipe') || 'null');
  if (!recipe) {
    window.location.href = 'app.html';
    return;
  }

  populateRecipePage();

  // Init voice recognition with our command handler
  initSpeechRecognition(handleVoiceCommand);

  // Auto-read first step after short delay
  setTimeout(() => {
    highlightStep(0);
    speakText(`Starting recipe: ${recipe.name}. Step 1: ${recipe.steps[0]}`);
  }, 800);
});

function populateRecipePage() {
  // Title
  document.getElementById('recipe-title-cook').textContent = recipe.name;
  document.title = `RecipePro – ${recipe.name}`;

  // Hero image
  const heroImg = document.getElementById('recipe-hero-img');
  const heroWrap = document.querySelector('.recipe-hero-img-wrap');

  const storedImage = sessionStorage.getItem(`rp_img_${recipe.id}`);
  if (storedImage) {
    heroImg.src = storedImage;
  } else {
    // Use placeholder
    heroWrap.innerHTML = `
      <div class="hero-placeholder" style="width:100%;height:100%;background:linear-gradient(135deg,#c8e6d4,#8ac9a8);display:flex;align-items:center;justify-content:center;font-size:100px;">
        ${recipe.emoji || '🍽️'}
      </div>
      <div class="recipe-hero-gradient"></div>
    `;
    // Try loading image async
    loadHeroImage();
  }

  // Meta badges
  document.getElementById('serves-badge').textContent = `👥 Serves ${recipe.servings}`;
  document.getElementById('cal-badge').textContent = `🔥 ${recipe.calories} kcal`;
  document.getElementById('time-badge').textContent = `⏱ ${(recipe.prep_time || 0) + (recipe.cook_time || 0)} min`;

  // Macros
  document.getElementById('macro-carbs').textContent = recipe.macros?.carbs || 0;
  document.getElementById('macro-protein').textContent = recipe.macros?.protein || 0;
  document.getElementById('macro-fat').textContent = recipe.macros?.fat || 0;
  document.getElementById('macro-fiber').textContent = recipe.macros?.fiber || 0;

  // Ingredients
  const ingList = document.getElementById('ingredient-list-cook');
  ingList.innerHTML = (recipe.ingredients || []).map(ing =>
    `<li>${ing}</li>`
  ).join('');

  // Steps
  renderSteps();

  // Mic state
  updateMicUI();
}

async function loadHeroImage() {
  try {
    const prompt = recipe.image_prompt ||
      `${recipe.name}, professional food photography, beautifully plated, warm lighting`;
    const imgSrc = await generateRecipeImage(prompt, recipe.emoji);
    if (imgSrc) {
      const heroWrap = document.querySelector('.recipe-hero-img-wrap');
      heroWrap.innerHTML = `
        <img id="recipe-hero-img" src="${imgSrc}" alt="${recipe.name}" style="width:100%;height:100%;object-fit:cover;" />
        <div class="recipe-hero-gradient"></div>
      `;
    }
  } catch(e) { /* keep placeholder */ }
}

function renderSteps() {
  const container = document.getElementById('steps-container');
  container.innerHTML = (recipe.steps || []).map((step, idx) => `
    <div class="step-card" id="step-${idx}" onclick="goToStep(${idx})">
      <div class="step-num">${idx + 1}</div>
      <div class="step-text">${step}</div>
    </div>
  `).join('');
  highlightStep(currentStep);
}

function highlightStep(idx) {
  currentStep = idx;
  document.querySelectorAll('.step-card').forEach((el, i) => {
    el.classList.remove('active', 'completed');
    if (i < idx) el.classList.add('completed');
    if (i === idx) {
      el.classList.add('active');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  // Update button states
  document.getElementById('btn-prev').disabled = idx === 0;
  document.getElementById('btn-next').disabled = idx === (recipe.steps.length - 1);
}

function goToStep(idx) {
  if (idx < 0 || idx >= recipe.steps.length) return;
  highlightStep(idx);
}

function nextStep() {
  if (currentStep < recipe.steps.length - 1) {
    highlightStep(currentStep + 1);
    speakText(`Step ${currentStep + 1}: ${recipe.steps[currentStep]}`);
  } else {
    finishRecipe();
  }
}

function prevStep() {
  if (currentStep > 0) {
    highlightStep(currentStep - 1);
    speakText(`Step ${currentStep + 1}: ${recipe.steps[currentStep]}`);
  }
}

function readCurrentStep() {
  const stepText = recipe.steps[currentStep];
  speakText(`Step ${currentStep + 1}: ${stepText}`);
}

function finishRecipe() {
  stopSpeaking();
  stopListening();
  document.getElementById('done-recipe-name').textContent = recipe.name;
  document.getElementById('done-modal').classList.remove('hidden');
  speakText(`Congratulations! You've finished making ${recipe.name}. Bon appétit!`);
}

function exitCooking() {
  stopSpeaking();
  stopListening();
  document.getElementById('done-modal').classList.add('hidden');
  window.location.href = 'app.html';
}

// ── Mic & Voice ──────────────────────────────────────────────────────────────
function toggleMic() {
  micActive = !micActive;

  if (micActive) {
    const started = startListening();
    if (!started) {
      showVoiceToast('⚠️ Microphone not supported in this browser');
      micActive = false;
      return;
    }
    showVoiceToast('🎙️ Listening for voice commands...');
  } else {
    stopListening();
    showVoiceToast('🔇 Voice commands off');
  }

  updateMicUI();
}

function updateMicUI() {
  const btn = document.getElementById('mic-btn');
  const iconOn = document.getElementById('mic-icon-on');
  const iconOff = document.getElementById('mic-icon-off');
  const listenBar = document.getElementById('listen-bar');

  if (micActive) {
    btn.classList.add('active');
    btn.classList.remove('muted');
    iconOn.classList.remove('hidden');
    iconOff.classList.add('hidden');
    if (listenBar) listenBar.classList.remove('hidden');
  } else {
    btn.classList.remove('active');
    btn.classList.add('muted');
    iconOn.classList.add('hidden');
    iconOff.classList.remove('hidden');
    if (listenBar) listenBar.classList.add('hidden');
  }
}

function handleVoiceCommand(command, transcript) {
  const COMMAND_LABELS = {
    next: '▶ Next Step',
    previous: '◀ Previous Step',
    play: '🔊 Reading Step',
    repeat: '🔁 Repeating Step',
    done: '✅ Recipe Done',
    unknown: `❓ "${transcript || 'unknown'}"`
  };

  showVoiceToast(COMMAND_LABELS[command] || `Heard: ${transcript}`);

  switch (command) {
    case 'next':
      nextStep();
      break;
    case 'previous':
      prevStep();
      break;
    case 'play':
    case 'repeat':
      readCurrentStep();
      break;
    case 'done':
      finishRecipe();
      break;
    case 'unknown':
      // No action, just feedback shown
      break;
  }
}

function showVoiceToast(msg) {
  const toast = document.getElementById('voice-toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');

  if (voiceToastTimeout) clearTimeout(voiceToastTimeout);
  voiceToastTimeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, 2500);
}
