import React, { useState, useEffect } from "react";
import { 
  Search, 
  ChefHat, 
  Mic, 
  MicOff, 
  LogOut, 
  ArrowRight, 
  ArrowLeft, 
  Repeat, 
  CheckCircle2,
  Plus,
  X,
  Loader2,
  Play,
  Pause
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Recipe, User, DietaryGoal } from "./types";
import { 
  getRecipeOptions, 
  generateFullRecipe, 
  generateRecipeImage, 
  RecipeOption, 
  parseManualRecipe,
  generateRecipeFromNameAndIngredients
} from "./services/gemini";
import { VoiceService } from "./services/voice";
import { COMMON_INGREDIENTS } from "./constants";

// --- Components ---

const Auth = ({ onAuth }: { onAuth: (user: User) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (res.ok) onAuth(data);
        else setError(data.error || "Authentication failed");
      } else {
        if (res.ok) onAuth({ username } as any); // Fallback
        else setError("Server error. Please try again later.");
      }
    } catch (err) {
      setError("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f2ed] p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-black/5"
      >
        <div className="flex justify-center mb-6">
          <div className="bg-emerald-100 p-3 rounded-2xl">
            <ChefHat className="w-8 h-8 text-emerald-600" />
          </div>
        </div>
        <h1 className="text-3xl font-serif text-center mb-2">RecipePro</h1>
        <p className="text-center text-stone-500 mb-8">
          {isLogin ? "Welcome back, Chef!" : "Start your culinary journey"}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1 ml-1">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              placeholder="Enter your username"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1 ml-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button 
            type="submit"
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
          >
            {isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>
        
        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="w-full mt-6 text-stone-500 text-sm hover:text-emerald-600 transition-colors"
        >
          {isLogin ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
      </motion.div>
    </div>
  );
};

const RecipeSearch = ({ onGenerate }: { onGenerate: (ingredients: string[], goal: DietaryGoal) => void }) => {
  const [input, setInput] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [goal, setGoal] = useState<DietaryGoal>("none");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (input.trim().length > 1) {
      const filtered = COMMON_INGREDIENTS.filter(i => 
        i.toLowerCase().includes(input.toLowerCase()) && !ingredients.includes(i)
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [input, ingredients]);

  const addIngredient = (val: string = input) => {
    const trimmed = val.trim();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients([...ingredients, trimmed]);
      setInput("");
      setShowSuggestions(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-serif text-stone-900">What's in your kitchen?</h2>
        <p className="text-stone-500">Add your ingredients and we'll craft the perfect recipe.</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addIngredient()}
                onFocus={() => input.length > 1 && setShowSuggestions(true)}
                placeholder="Add ingredient (e.g. Chicken, Spinach, Garlic)"
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-stone-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
            <button 
              onClick={() => addIngredient()}
              className="bg-stone-900 text-white px-6 rounded-2xl hover:bg-stone-800 transition-colors"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>

          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden"
              >
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => addIngredient(s)}
                    className="w-full text-left px-6 py-3 hover:bg-emerald-50 transition-colors text-stone-700 font-medium flex items-center gap-3"
                  >
                    <Search className="w-4 h-4 text-stone-400" />
                    {s}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {ingredients.map((ing) => (
              <motion.span
                key={ing}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 text-sm font-medium"
              >
                {ing}
                <button onClick={() => setIngredients(ingredients.filter(i => i !== ing))}>
                  <X className="w-4 h-4" />
                </button>
              </motion.span>
            ))}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(["none", "high-protein", "vegan", "keto", "low-carb", "paleo"] as DietaryGoal[]).map((g) => (
            <button
              key={g}
              onClick={() => setGoal(g)}
              className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                goal === g 
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20" 
                  : "bg-white text-stone-600 border-stone-200 hover:border-emerald-200"
              }`}
            >
              {g.charAt(0).toUpperCase() + g.slice(1).replace("-", " ")}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => onGenerate(ingredients, goal)}
            disabled={ingredients.length === 0}
            className="w-full py-4 bg-stone-900 text-white rounded-2xl font-semibold text-lg hover:bg-stone-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-stone-900/10 flex items-center justify-center gap-2"
          >
            Generate Recipe <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const RecipeOptions = ({ options, onSelect, onBack }: { options: RecipeOption[], onSelect: (opt: RecipeOption) => void, onBack: () => void }) => {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-serif text-stone-900">Choose your dish</h2>
        <p className="text-stone-500">We found 3 great ways to use your ingredients.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {options.map((opt, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -8 }}
            className="bg-white p-8 rounded-3xl shadow-xl border border-stone-100 flex flex-col h-full cursor-pointer group"
            onClick={() => onSelect(opt)}
          >
            <div className="bg-emerald-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors">
              <ChefHat className="w-6 h-6 text-emerald-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-serif font-bold mb-3 group-hover:text-emerald-600 transition-colors">{opt.title}</h3>
            <p className="text-stone-500 text-sm leading-relaxed flex-1">{opt.description}</p>
            <div className="mt-8 flex items-center gap-2 text-emerald-600 font-semibold text-sm">
              Select Recipe <ArrowRight className="w-4 h-4" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center">
        <button onClick={onBack} className="text-stone-400 hover:text-stone-600 transition-colors flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to ingredients
        </button>
      </div>
    </div>
  );
};

const RecipeInstructor = ({ recipe, onFinish }: { recipe: Recipe, onFinish: () => void }) => {
  const [currentStep, setCurrentStep] = useState(-1); // -1 for overview/ingredients
  const [isListening, setIsListening] = useState(false);
  const [voiceService, setVoiceService] = useState<VoiceService | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastHeard, setLastHeard] = useState<string | null>(null);

  // Use refs to avoid stale closures in the VoiceService callback
  const voiceServiceRef = React.useRef<VoiceService | null>(null);
  const stateRef = React.useRef({ currentStep, isSpeaking, isListening });
  
  // Keep refs in sync
  stateRef.current = { currentStep, isSpeaking, isListening };
  voiceServiceRef.current = voiceService;

  const handleNext = () => {
    const vs = voiceServiceRef.current;
    vs?.stopSpeaking();
    setIsSpeaking(false);
    setCurrentStep(prev => Math.min(prev + 1, recipe.instructions.length - 1));
  };

  const handlePrevious = () => {
    const vs = voiceServiceRef.current;
    vs?.stopSpeaking();
    setIsSpeaking(false);
    setCurrentStep(prev => Math.max(prev - 1, -1));
  };

  const speakCurrent = async (forceStart = false, stepOverride?: number) => {
    const vs = voiceServiceRef.current;
    if (!vs) return;
    
    // Use the latest state from ref if not overridden
    const activeStep = stepOverride !== undefined ? stepOverride : stateRef.current.currentStep;
    const currentlyListening = stateRef.current.isListening;

    setIsSpeaking(true);
    
    // Stop listening while speaking to avoid feedback
    vs.stopListening();
    vs.stopSpeaking();
    
    const text = activeStep === -1 
      ? `The ingredients for ${recipe.title} are: ${recipe.ingredients.join(", ")}. Say next to start the first step.`
      : `Step ${activeStep + 1}: ${recipe.instructions[activeStep]}`;
    
    try {
      await vs.speak(text);
      // Auto-start listening after speaking if it was previously active
      if (currentlyListening) {
        vs.startListening();
      }
    } catch (err) {
      console.error("Speech failed:", err);
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleRepeat = () => {
    const vs = voiceServiceRef.current;
    vs?.stopSpeaking();
    setIsSpeaking(false);
    // Use a slightly longer timeout to ensure state settles and previous speech stops
    setTimeout(() => speakCurrent(true), 200);
  };

  useEffect(() => {
    const vs = new VoiceService((command) => {
      // Only execute if command is in word bank
      const validCommands = ["next", "previous", "repeat", "done", "play"];
      if (!validCommands.includes(command)) return;

      if (command === "next") {
        handleNext();
      }
      else if (command === "previous") {
        handlePrevious();
      }
      else if (command === "play" || command === "repeat") {
        handleRepeat();
      }
      else if (command === "done") {
        onFinish();
      }
      
      setLastHeard(command);
      setTimeout(() => setLastHeard(null), 3000);
    });
    
    setVoiceService(vs);
    voiceServiceRef.current = vs;

    return () => {
      vs.stopListening();
      vs.stopSpeaking();
    };
  }, []);

  // REMOVED: Auto-speak useEffect

  const toggleListening = () => {
    if (!voiceService) return;
    if (isListening) {
      voiceService.stopListening();
    } else {
      // Stop speaking when unmuting mic
      voiceService.stopSpeaking();
      setIsSpeaking(false);
      voiceService.startListening();
    }
    setIsListening(!isListening);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-100">
        <div className="relative h-64 sm:h-96">
          <img 
            src={recipe.image_url || "https://picsum.photos/seed/food/800/600"} 
            className="w-full h-full object-cover"
            alt={recipe.title}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
            <div className="text-white">
              <h2 className="text-3xl font-serif mb-2">{recipe.title}</h2>
              <div className="flex gap-4 text-sm font-medium opacity-90">
                <span>{recipe.macros.calories} kcal</span>
                <span>{recipe.macros.protein}g Protein</span>
                <span>{recipe.macros.carbs}g Carbs</span>
                <span>{recipe.macros.fat}g Fat</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleListening}
                className={`p-4 rounded-full transition-all ${
                  isListening 
                    ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30" 
                    : "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                }`}
                title={isListening ? "Stop Microphone" : "Start Microphone"}
              >
                {isListening ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
              </button>

              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-stone-400">Voice Assistant</p>
                <p className="text-stone-600">
                  {isListening ? (lastHeard ? `Heard: "${lastHeard}"` : "Listening for 'Next'...") : "Tap mic for voice control"}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button onClick={handlePrevious} className="p-3 rounded-xl bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button onClick={handleRepeat} className="p-3 rounded-xl bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors">
                <Repeat className="w-5 h-5" />
              </button>
              <button onClick={handleNext} className="p-3 rounded-xl bg-stone-900 text-white hover:bg-stone-800 transition-colors">
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {currentStep === -1 ? (
              <motion.div
                key="ingredients"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-serif font-semibold">Ingredients</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100 text-stone-700">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      {ing}
                    </li>
                  ))}
                </ul>
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-800 text-sm">
                  <strong>Tip:</strong> Say "Next" to start cooking instructions.
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={`step-${currentStep}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-serif font-semibold">Step {currentStep + 1} of {recipe.instructions.length}</h3>
                  <div className="flex gap-1">
                    {recipe.instructions.map((_, i) => (
                      <div key={i} className={`h-1.5 w-8 rounded-full transition-all ${i <= currentStep ? "bg-emerald-500" : "bg-stone-200"}`} />
                    ))}
                  </div>
                </div>
                <p className="text-2xl font-serif leading-relaxed text-stone-800">
                  {recipe.instructions[currentStep]}
                </p>
                {isSpeaking && (
                  <div className="flex items-center gap-2 text-emerald-600 font-medium">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Speaking...
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <div className="mt-8 flex justify-center">
        <button 
          onClick={onFinish}
          className="flex items-center gap-2 px-8 py-3 bg-white border border-stone-200 text-stone-600 rounded-full hover:bg-stone-50 transition-all font-medium"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          Finish Cooking
        </button>
      </div>

      <div className="mt-12 grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { cmd: "Next", desc: "Next step" },
          { cmd: "Previous", desc: "Previous step" },
          { cmd: "Play", desc: "Read aloud" },
          { cmd: "Repeat", desc: "Read again" },
          { cmd: "Done", desc: "Finish" }
        ].map(item => (
          <div key={item.cmd} className="p-4 bg-white/50 rounded-2xl border border-stone-200 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-1">"{item.cmd}"</p>
            <p className="text-sm text-stone-600">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<"search" | "options" | "instructor" | "loading">("search");
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [recipeOptions, setRecipeOptions] = useState<RecipeOption[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<DietaryGoal>("none");
  const [loadingText, setLoadingText] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then(res => {
        const contentType = res.headers.get("content-type");
        if (res.ok && contentType && contentType.includes("application/json")) {
          return res.json();
        }
        return null;
      })
      .then(data => data && setUser(data))
      .catch(err => console.error("Auth check failed:", err));
  }, []);

  const handleGenerateOptions = async (ingredients: string[], goal: DietaryGoal) => {
    setView("loading");
    setLoadingText("Thinking of delicious ideas...");
    setSelectedIngredients(ingredients);
    setSelectedGoal(goal);
    try {
      const options = await getRecipeOptions(ingredients, goal);
      setRecipeOptions(options);
      setView("options");
    } catch (err) {
      console.error(err);
      setView("search");
      alert("Failed to get recipe ideas. Please try again.");
    }
  };

  const handleSelectOption = async (option: RecipeOption) => {
    setView("loading");
    setLoadingText(`Crafting your ${option.title}...`);
    try {
      const recipe = await generateFullRecipe(option.title, selectedIngredients, selectedGoal);
      setLoadingText("Capturing the perfect shot of your dish...");
      const imageUrl = await generateRecipeImage(recipe.title);
      const fullRecipe = { ...recipe, image_url: imageUrl };
      setCurrentRecipe(fullRecipe);
      setView("instructor");
    } catch (err) {
      console.error(err);
      setView("options");
      alert("Failed to generate full recipe. Please try again.");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  if (!user) return <Auth onAuth={setUser} />;

  return (
    <div className="min-h-screen bg-[#f5f2ed] text-stone-900 font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-bottom border-stone-200">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView("search")}>
            <div className="bg-emerald-600 p-2 rounded-xl">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-serif font-bold tracking-tight">RecipePro</h1>
          </div>
          
          <nav className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Chef</p>
                <p className="text-sm font-semibold">{user.username}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {view === "loading" && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 space-y-6"
            >
              <div className="relative">
                <Loader2 className="w-16 h-16 text-emerald-600 animate-spin" />
                <ChefHat className="w-8 h-8 text-emerald-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-xl font-serif text-stone-600 animate-pulse">{loadingText}</p>
            </motion.div>
          )}

          {view === "search" && (
            <motion.div 
              key="search"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <RecipeSearch 
                onGenerate={handleGenerateOptions} 
              />
            </motion.div>
          )}

          {view === "options" && (
            <motion.div
              key="options"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <RecipeOptions 
                options={recipeOptions} 
                onSelect={handleSelectOption} 
                onBack={() => setView("search")} 
              />
            </motion.div>
          )}

          {view === "instructor" && currentRecipe && (
            <motion.div 
              key="instructor"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <RecipeInstructor recipe={currentRecipe} onFinish={() => setView("search")} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-stone-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center gap-2 mb-4">
            <ChefHat className="w-5 h-5 text-emerald-600" />
            <span className="font-serif font-bold">RecipePro</span>
          </div>
          <p className="text-stone-400 text-sm">© 2026 RecipePro AI. Crafted for the modern kitchen.</p>
        </div>
      </footer>
    </div>
  );
}
