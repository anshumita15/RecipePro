// ingredients.js – Autocomplete ingredient database + tag management

const INGREDIENT_DB = [
  { name: 'Chicken breast', emoji: '🍗' },
  { name: 'Chicken thighs', emoji: '🍗' },
  { name: 'Ground beef', emoji: '🥩' },
  { name: 'Salmon', emoji: '🐟' },
  { name: 'Shrimp', emoji: '🦐' },
  { name: 'Tuna', emoji: '🐟' },
  { name: 'Eggs', emoji: '🥚' },
  { name: 'Bacon', emoji: '🥓' },
  { name: 'Tofu', emoji: '🧊' },
  { name: 'Pork chops', emoji: '🥩' },
  { name: 'Lamb', emoji: '🥩' },
  { name: 'Turkey', emoji: '🦃' },
  { name: 'Spinach', emoji: '🥬' },
  { name: 'Kale', emoji: '🥬' },
  { name: 'Broccoli', emoji: '🥦' },
  { name: 'Carrots', emoji: '🥕' },
  { name: 'Potatoes', emoji: '🥔' },
  { name: 'Sweet potatoes', emoji: '🍠' },
  { name: 'Tomatoes', emoji: '🍅' },
  { name: 'Bell peppers', emoji: '🫑' },
  { name: 'Onions', emoji: '🧅' },
  { name: 'Garlic', emoji: '🧄' },
  { name: 'Mushrooms', emoji: '🍄' },
  { name: 'Zucchini', emoji: '🥒' },
  { name: 'Cucumber', emoji: '🥒' },
  { name: 'Lettuce', emoji: '🥬' },
  { name: 'Avocado', emoji: '🥑' },
  { name: 'Corn', emoji: '🌽' },
  { name: 'Peas', emoji: '🫛' },
  { name: 'Green beans', emoji: '🫛' },
  { name: 'Asparagus', emoji: '🥦' },
  { name: 'Cauliflower', emoji: '🥦' },
  { name: 'Celery', emoji: '🥬' },
  { name: 'Lemons', emoji: '🍋' },
  { name: 'Limes', emoji: '🍋' },
  { name: 'Rice', emoji: '🍚' },
  { name: 'Brown rice', emoji: '🍚' },
  { name: 'Pasta', emoji: '🍝' },
  { name: 'Spaghetti', emoji: '🍝' },
  { name: 'Noodles', emoji: '🍜' },
  { name: 'Quinoa', emoji: '🌾' },
  { name: 'Bread', emoji: '🍞' },
  { name: 'Flour', emoji: '🌾' },
  { name: 'Oats', emoji: '🌾' },
  { name: 'Lentils', emoji: '🫘' },
  { name: 'Chickpeas', emoji: '🫘' },
  { name: 'Black beans', emoji: '🫘' },
  { name: 'Kidney beans', emoji: '🫘' },
  { name: 'Milk', emoji: '🥛' },
  { name: 'Butter', emoji: '🧈' },
  { name: 'Cheese', emoji: '🧀' },
  { name: 'Parmesan', emoji: '🧀' },
  { name: 'Mozzarella', emoji: '🧀' },
  { name: 'Cheddar', emoji: '🧀' },
  { name: 'Cream cheese', emoji: '🧀' },
  { name: 'Heavy cream', emoji: '🥛' },
  { name: 'Yogurt', emoji: '🍦' },
  { name: 'Soy sauce', emoji: '🍶' },
  { name: 'Olive oil', emoji: '🫙' },
  { name: 'Coconut milk', emoji: '🥥' },
  { name: 'Vegetable broth', emoji: '🍲' },
  { name: 'Chicken broth', emoji: '🍲' },
  { name: 'Tomato sauce', emoji: '🍅' },
  { name: 'Honey', emoji: '🍯' },
  { name: 'Ginger', emoji: '🫚' },
  { name: 'Cilantro', emoji: '🌿' },
  { name: 'Parsley', emoji: '🌿' },
  { name: 'Basil', emoji: '🌿' },
  { name: 'Apples', emoji: '🍎' },
  { name: 'Bananas', emoji: '🍌' },
  { name: 'Strawberries', emoji: '🍓' },
  { name: 'Blueberries', emoji: '🫐' },
  { name: 'Mango', emoji: '🥭' },
  { name: 'Pineapple', emoji: '🍍' },
];

let ingredients = [];
let selectedDiet = 'none';
let autocompleteIndex = -1;

function handleIngredientInput() {
  const input = document.getElementById('ingredient-input');
  const dropdown = document.getElementById('autocomplete-dropdown');
  const query = input.value.trim().toLowerCase();

  if (!query) {
    dropdown.classList.remove('show');
    return;
  }

  const matches = INGREDIENT_DB
    .filter(i => i.name.toLowerCase().includes(query))
    .slice(0, 8);

  if (matches.length === 0) {
    dropdown.classList.remove('show');
    return;
  }

  dropdown.innerHTML = matches.map((item, idx) => `
    <div class="autocomplete-item" 
         data-name="${item.name}"
         onmousedown="selectFromDropdown('${item.name}')"
         onmouseover="setAutocompleteIndex(${idx})">
      <span class="item-emoji">${item.emoji}</span>
      <span>${highlightMatch(item.name, query)}</span>
    </div>
  `).join('');

  autocompleteIndex = -1;
  dropdown.classList.add('show');
}

function highlightMatch(text, query) {
  const idx = text.toLowerCase().indexOf(query);
  if (idx === -1) return text;
  return text.substring(0, idx)
    + `<strong>${text.substring(idx, idx + query.length)}</strong>`
    + text.substring(idx + query.length);
}

function setAutocompleteIndex(idx) {
  autocompleteIndex = idx;
  document.querySelectorAll('.autocomplete-item').forEach((el, i) => {
    el.classList.toggle('selected', i === idx);
  });
}

function handleIngredientKey(e) {
  const dropdown = document.getElementById('autocomplete-dropdown');
  const items = dropdown.querySelectorAll('.autocomplete-item');

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    autocompleteIndex = Math.min(autocompleteIndex + 1, items.length - 1);
    items.forEach((el, i) => el.classList.toggle('selected', i === autocompleteIndex));
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    autocompleteIndex = Math.max(autocompleteIndex - 1, -1);
    items.forEach((el, i) => el.classList.toggle('selected', i === autocompleteIndex));
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (autocompleteIndex >= 0 && items[autocompleteIndex]) {
      selectFromDropdown(items[autocompleteIndex].dataset.name);
    } else {
      addIngredient();
    }
  } else if (e.key === 'Escape') {
    dropdown.classList.remove('show');
  }
}

function selectFromDropdown(name) {
  const input = document.getElementById('ingredient-input');
  input.value = name;
  document.getElementById('autocomplete-dropdown').classList.remove('show');
  addIngredient();
}

function addIngredient() {
  const input = document.getElementById('ingredient-input');
  const val = input.value.trim();
  if (!val) return;
  if (ingredients.some(i => i.toLowerCase() === val.toLowerCase())) {
    input.value = '';
    return;
  }
  ingredients.push(val);
  renderTags();
  input.value = '';
  document.getElementById('autocomplete-dropdown').classList.remove('show');
  input.focus();
}

function removeIngredient(name) {
  ingredients = ingredients.filter(i => i !== name);
  renderTags();
}

function renderTags() {
  const container = document.getElementById('ingredients-tags');
  if (!container) return;
  container.innerHTML = ingredients.map(name => {
    const item = INGREDIENT_DB.find(i => i.name.toLowerCase() === name.toLowerCase());
    const emoji = item ? item.emoji : '🥘';
    return `
      <div class="tag">
        <span>${emoji}</span>
        <span>${name}</span>
        <button class="tag-remove" onclick="removeIngredient('${name}')" title="Remove">×</button>
      </div>
    `;
  }).join('');
}

function selectDiet(btn) {
  document.querySelectorAll('.diet-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedDiet = btn.dataset.diet;
}

// Close dropdown when clicking outside
document.addEventListener('click', e => {
  if (!e.target.closest('.search-bar')) {
    const dd = document.getElementById('autocomplete-dropdown');
    if (dd) dd.classList.remove('show');
  }
});
