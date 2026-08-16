import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Home as HomeIcon, CalendarDays, UtensilsCrossed, ShoppingCart, User,
  Flame, Droplet, Dumbbell, ChevronRight, ChevronLeft, X, Plus, Check,
  Lock, Unlock, RefreshCw, Search, Filter, Heart, ThumbsDown, Ban,
  Minus, Clock, MapPin, Sparkles, Moon, Sun, TrendingUp, AlertCircle,
  Edit3, ShoppingBag, Package, Snowflake, Refrigerator, ChefHat,
  Zap, Battery, BatteryLow, Coffee, Salad, Beef, Fish, Egg, Wheat,
  Info, ArrowLeft, Star, Utensils, Calendar, Settings2, BookOpen, Link as LinkIcon
} from "lucide-react";

/* =========================================================================
   TROPHÉ — household nutrition, meal-planning & gym-fueling app
   Named from the Greek "τροφή" (trophḗ) — food, nourishment. Root of
   "trophic," "atrophy," "hypertrophy." Everything here is really about
   keeping the two of you nourished and in sync.
   Built for Tyler + Elizabeth. Single-file React artifact.
   Data model:
     FOODS  -> atomic nutrition items (the pantry / nutrition-label layer)
     MEALS  -> composed of FOODS with per-serving multipliers (live macros)
     WEEK   -> 7 days, each day has slots; each slot resolves to a mealId
               per person (or one shared mealId for both)
   Persistence: window.storage (shared:true) — this is a two-person
   household tool, so data is intentionally shared between whoever opens it.
   ========================================================================= */

/* ---------------------------- design tokens ----------------------------
   Apple / iOS system aesthetic: the -apple-system font stack renders as
   actual San Francisco on Apple devices; palette follows iOS system
   colors (systemBlue, systemGreen, systemOrange, systemPurple, systemTeal,
   systemRed) and the standard grouped-table light background. */
const GLOBAL_CSS = `
:root{
  --paper:#F2F2F7; --paper-2:#FFFFFF; --paper-3:#E5E5EA;
  --ink:#1C1C1E; --ink-soft:#48484A; --ink-faint:#8E8E93;
  --line:#D1D1D6; --line-soft:#E5E5EA;
  --blue:#0A84FF; --blue-soft:#E3F0FF;
  --brick:#FF3B30; --brick-soft:#FDE7E5;
  --sage:#34C759; --sage-soft:#E4F8E9;
  --mustard:#FF9500; --mustard-soft:#FFF1DE;
  --plum:#AF52DE; --plum-soft:#F6E9FB;
  --liz-pink:#C08A93; --liz-pink-soft:#F5E6E8;
  --steel:#32ADE6; --steel-soft:#E3F5FC;
  --ink-panel:#FFFFFF;
  --shadow: 0 1px 1px rgba(0,0,0,.03), 0 2px 10px -4px rgba(0,0,0,.08);
}
.hearth{
  font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","SF Pro Display","Inter",Helvetica,Arial,sans-serif;
  color:var(--ink); background:var(--paper);
  -webkit-font-smoothing:antialiased; min-height:100%;
}
.hearth *{box-sizing:border-box;}
.font-display{font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","Inter",sans-serif; font-weight:750; letter-spacing:-0.021em;}
.font-mono{font-variant-numeric:tabular-nums; font-feature-settings:"tnum" 1; letter-spacing:-0.01em;}
.hearth ::-webkit-scrollbar{display:none;}
.hearth{scrollbar-width:none;}
.card{
  background:var(--paper-2); border:0.5px solid rgba(60,60,67,.1);
  border-radius:18px; box-shadow:var(--shadow);
}
.btn-primary{
  background:var(--blue); color:#fff; border-radius:980px;
  font-weight:600; letter-spacing:0; transition:transform .15s ease, opacity .15s ease;
}
.btn-primary:active{transform:scale(.97); opacity:.85;}
.btn-ghost{
  background:var(--blue-soft); border:none; color:var(--blue);
  border-radius:980px; font-weight:600;
}
.btn-ghost:active{transform:scale(.97); opacity:.8;}
.chip{
  border-radius:980px; font-size:12px; font-weight:600; padding:5px 11px;
  border:none; background:var(--paper-3); color:var(--ink-soft);
}
.chip-on{background:var(--ink); color:#fff; border-color:var(--ink);}
.divider{border-top:0.5px solid rgba(60,60,67,.18);}
.tap{cursor:pointer; -webkit-tap-highlight-color:transparent;}
.tap:active{opacity:.7;}
.scrollx{overflow-x:auto; -ms-overflow-style:none; scrollbar-width:none;}
.scrollx::-webkit-scrollbar{display:none;}
.pref-pill{font-size:10.5px; font-weight:700; padding:3px 8px; border-radius:980px; letter-spacing:.01em;}
.input{
  width:100%; border:none; border-radius:12px; padding:10px 12px;
  font-size:14px; font-family:inherit; background:var(--paper-3); color:var(--ink);
}
.input:focus{outline:none; box-shadow:0 0 0 2px var(--blue);}
.seg-wrap{background:var(--paper-3); border-radius:10px; padding:2px; display:inline-flex; gap:2px;}
.seg-btn{border-radius:8px; font-weight:590; font-size:13px; padding:6px 14px; transition:background .15s ease, color .15s ease;}
.seg-btn-on{background:var(--paper-2); color:var(--ink); box-shadow:0 1px 2.5px rgba(0,0,0,.13);}
.seg-btn-off{background:transparent; color:var(--ink-soft);}
/* Robustness: guarantee font sizes render correctly even if the arbitrary-value
   Tailwind classes below aren't compiled by the host environment's JIT. */
[class*="text-[10.5px]"]{font-size:10.5px;} [class*="text-[10px]"]{font-size:10px;}
[class*="text-[11.5px]"]{font-size:11.5px;} [class*="text-[11px]"]{font-size:11px;}
[class*="text-[12.5px]"]{font-size:12.5px;} [class*="text-[12px]"]{font-size:12px;}
[class*="text-[13.5px]"]{font-size:13.5px;} [class*="text-[13px]"]{font-size:13px;}
[class*="text-[14.5px]"]{font-size:14.5px;} [class*="text-[14px]"]{font-size:14px;}
[class*="text-[15.5px]"]{font-size:15.5px;} [class*="text-[15px]"]{font-size:15px;}
[class*="text-[16px]"]{font-size:16px;} [class*="text-[17px]"]{font-size:17px;}
[class*="text-[18px]"]{font-size:18px;} [class*="text-[19px]"]{font-size:19px;}
[class*="text-[20px]"]{font-size:20px;} [class*="text-[23px]"]{font-size:23px;}
`;

const uid = (() => { let n = 0; return (p) => `${p}-${++n}`; })();

/* ------------------------------- PEOPLE --------------------------------- */
const PEOPLE = {
  tyler: { id: "tyler", name: "Tyler", accent: "var(--blue)", accentSoft: "var(--blue-soft)", initial: "T" },
  elizabeth: { id: "elizabeth", name: "Elizabeth", accent: "var(--liz-pink)", accentSoft: "var(--liz-pink-soft)", initial: "E" },
};

const PREF_LEVELS = ["love", "like", "neutral", "dislike", "never"];
const PREF_META = {
  love:    { label: "Love",            color: "#FF3B30", bg: "var(--brick-soft)" },
  like:    { label: "Like",            color: "#34C759", bg: "var(--sage-soft)" },
  neutral: { label: "Neutral",         color: "#8E8E93", bg: "#F2F2F7" },
  dislike: { label: "Dislike",         color: "#FF9500", bg: "var(--mustard-soft)" },
  never:   { label: "Never Recommend", color: "#D70015", bg: "#FBE4E2" },
};

const CATEGORY_META = {
  breakfast:   { label: "Breakfast",   color: "#FF9500", bg: "var(--mustard-soft)", icon: Coffee },
  lunch:       { label: "Lunch",       color: "#34C759", bg: "var(--sage-soft)", icon: Salad },
  dinner:      { label: "Dinner",      color: "#0A84FF", bg: "var(--blue-soft)", icon: ChefHat },
  snack:       { label: "Snack",       color: "#AF52DE", bg: "var(--plum-soft)", icon: Package },
  preworkout:  { label: "Pre-Workout", color: "#FF3B30", bg: "var(--brick-soft)", icon: Zap },
  postworkout: { label: "Post-Workout",color: "#32ADE6", bg: "var(--steel-soft)", icon: Dumbbell },
};

/* -------------------------------- FOODS --------------------------------- */
/* Every macro is per ONE serving (see servingLabel). Estimates are
   reasonable household-kitchen figures, not lab-verified values. */
const FOODS = [
  { id:"egg", name:"Eggs", category:"Protein", servingLabel:"2 large eggs", cal:140, p:12, c:1, f:10, fiber:0, gf:true, ai:true, price:0.7, store:"Costco", location:"fridge", qty:24, pkgServings:24 },
  { id:"bacon", name:"Bacon", category:"Protein", servingLabel:"3 slices", cal:135, p:9, c:0, f:11, fiber:0, gf:true, ai:false, price:1.1, store:"Costco", location:"fridge", qty:9, pkgServings:12 },
  { id:"potatoes", name:"Roasted Potatoes", category:"Carbohydrate", servingLabel:"1 cup", cal:180, p:3, c:33, f:4, fiber:3, gf:true, ai:true, price:0.6, store:"Aldi", location:"pantry", qty:10, pkgServings:10 },
  { id:"berries", name:"Mixed Berries", category:"Fruit", servingLabel:"1/2 cup", cal:40, p:1, c:10, f:0, fiber:2, gf:true, ai:true, price:1.2, store:"Costco", location:"fridge", qty:6, pkgServings:14 },
  { id:"banana", name:"Banana", category:"Fruit", servingLabel:"1 medium", cal:105, p:1, c:27, f:0, fiber:3, gf:true, ai:true, price:0.25, store:"Aldi", location:"pantry", qty:5, pkgServings:6 },
  { id:"applesauce", name:"Applesauce", category:"Fruit", servingLabel:"1/2 cup, unsweetened", cal:50, p:0, c:14, f:0, fiber:1, gf:true, ai:true, price:0.5, store:"Aldi", location:"pantry", qty:8, pkgServings:12 },
  { id:"greekyogurt", name:"Greek Yogurt", category:"Dairy", servingLabel:"3/4 cup, plain", cal:130, p:20, c:8, f:0, fiber:0, gf:true, ai:true, price:0.9, store:"Costco", location:"fridge", qty:5, pkgServings:12 },
  { id:"premierprotein", name:"Premier Protein Shake", category:"Drinks", servingLabel:"1 bottle", cal:160, p:30, c:4, f:3, fiber:0, gf:true, ai:false, price:1.7, store:"Costco", location:"pantry", qty:10, pkgServings:12, variantOf:"Chocolate" },
  { id:"chipotlechicken", name:"Chipotle Seasoned Chicken", category:"Protein", brand:"Costco / prepared item", servingLabel:"3 oz", cal:100, p:16, c:2, f:3, fiber:0, gf:true, ai:true, price:1.9, store:"Costco", location:"fridge", qty:9, pkgServings:16 },
  { id:"jasminerice", name:"Jasmine Rice", category:"Carbohydrate", servingLabel:"1 cup cooked", cal:205, p:4, c:45, f:0.4, fiber:1, gf:true, ai:true, price:0.4, store:"Aldi", location:"pantry", qty:6, pkgServings:24 },
  { id:"broccoli", name:"Broccoli", category:"Vegetable", servingLabel:"1 cup", cal:30, p:2.5, c:6, f:0.3, fiber:2, gf:true, ai:true, price:0.8, store:"Aldi", location:"fridge", qty:5, pkgServings:8 },
  { id:"valentina", name:"Valentina Hot Sauce", category:"Sauces", servingLabel:"1 tbsp", cal:0, p:0, c:0, f:0, fiber:0, gf:true, ai:false, price:0.05, store:"Aldi", location:"pantry", qty:40, pkgServings:60 },
  { id:"cornTortilla", name:"Corn Tortillas", category:"Carbohydrate", servingLabel:"2 tortillas", cal:100, p:2, c:22, f:1, fiber:2, gf:true, ai:true, price:0.3, store:"Aldi", location:"pantry", qty:14, pkgServings:20 },
  { id:"lettuce", name:"Lettuce", category:"Vegetable", servingLabel:"1 cup, shredded", cal:5, p:0.5, c:1, f:0, fiber:1, gf:true, ai:true, price:0.4, store:"Aldi", location:"fridge", qty:6, pkgServings:10 },
  { id:"cheese", name:"Shredded Cheese", category:"Dairy", servingLabel:"1/4 cup", cal:110, p:7, c:1, f:9, fiber:0, gf:true, ai:false, price:0.6, store:"Costco", location:"fridge", qty:12, pkgServings:24 },
  { id:"groundbeef", name:"Ground Beef 90/10", category:"Protein", servingLabel:"3 oz cooked", cal:180, p:22, c:0, f:10, fiber:0, gf:true, ai:true, price:1.6, store:"Costco", location:"freezer", qty:6, pkgServings:12 },
  { id:"shrimp", name:"Shrimp", category:"Protein", servingLabel:"4 oz cooked", cal:120, p:26, c:0, f:1.5, fiber:0, gf:true, ai:true, price:2.4, store:"Costco", location:"freezer", qty:4, pkgServings:10 },
  { id:"pork", name:"Pork Tenderloin", category:"Protein", servingLabel:"4 oz cooked", cal:150, p:28, c:0, f:4, fiber:0, gf:true, ai:true, price:1.8, store:"Costco", location:"freezer", qty:3, pkgServings:6 },
  { id:"sirloin", name:"Sirloin Steak", category:"Protein", servingLabel:"6 oz cooked", cal:350, p:48, c:0, f:16, fiber:0, gf:true, ai:true, price:5.5, store:"Costco", location:"freezer", qty:2, pkgServings:6 },
  { id:"greenbeans", name:"Green Beans", category:"Vegetable", servingLabel:"1 cup", cal:35, p:2, c:8, f:0, fiber:3, gf:true, ai:true, price:0.7, store:"Aldi", location:"freezer", qty:5, pkgServings:8 },
  { id:"turkey", name:"Turkey (deli)", category:"Protein", servingLabel:"3 oz", cal:90, p:18, c:1, f:1.5, fiber:0, gf:true, ai:true, price:1.4, store:"Aldi", location:"fridge", qty:6, pkgServings:8 },
  { id:"stringcheese", name:"String Cheese", category:"Dairy", servingLabel:"1 stick", cal:80, p:7, c:1, f:6, fiber:0, gf:true, ai:false, price:0.35, store:"Costco", location:"fridge", qty:10, pkgServings:16 },
  { id:"cottagecheese", name:"Cottage Cheese", category:"Dairy", servingLabel:"1/2 cup", cal:90, p:12, c:4, f:2.5, fiber:0, gf:true, ai:true, price:0.7, store:"Aldi", location:"fridge", qty:3, pkgServings:8 },
  { id:"pineapple", name:"Pineapple", category:"Fruit", servingLabel:"1/2 cup", cal:40, p:0.5, c:10, f:0, fiber:1, gf:true, ai:true, price:0.9, store:"Costco", location:"fridge", qty:4, pkgServings:10 },
  { id:"ricecakes", name:"Rice Cakes", category:"Carbohydrate", servingLabel:"2 cakes", cal:70, p:1, c:15, f:0, fiber:0.5, gf:true, ai:true, price:0.3, store:"Aldi", location:"pantry", qty:10, pkgServings:16 },
  { id:"honey", name:"Honey", category:"Sauces", servingLabel:"1 tbsp", cal:60, p:0, c:17, f:0, fiber:0, gf:true, ai:true, price:0.2, store:"Aldi", location:"pantry", qty:24, pkgServings:36 },
  { id:"gfpretzels", name:"GF Pretzels", category:"Snacks", servingLabel:"1 oz", cal:110, p:2, c:22, f:1, fiber:1, gf:true, ai:false, price:0.6, store:"Aldi", location:"pantry", qty:8, pkgServings:12 },
  { id:"gfcereal", name:"GF Cereal", category:"Carbohydrate", servingLabel:"1 cup", cal:110, p:2, c:24, f:1, fiber:2, gf:true, ai:false, price:0.7, store:"Aldi", location:"pantry", qty:8, pkgServings:12 },
  { id:"milk", name:"2% Milk", category:"Dairy", servingLabel:"1 cup", cal:120, p:8, c:12, f:5, fiber:0, gf:true, ai:false, price:0.3, store:"Aldi", location:"fridge", qty:10, pkgServings:16 },
  { id:"burgerpatty", name:"Burger Patty", category:"Protein", servingLabel:"4 oz beef", cal:240, p:22, c:0, f:17, fiber:0, gf:true, ai:true, price:2.1, store:"Costco", location:"freezer", qty:4, pkgServings:8 },
  { id:"pickles", name:"Pickles", category:"Condiments", servingLabel:"a few slices", cal:5, p:0, c:1, f:0, fiber:0, gf:true, ai:true, price:0.1, store:"Aldi", location:"pantry", qty:20, pkgServings:24 },
  { id:"asparagus", name:"Asparagus", category:"Vegetable", servingLabel:"1 cup", cal:27, p:3, c:5, f:0, fiber:2, gf:true, ai:true, price:1.3, store:"Aldi", location:"fridge", qty:3, pkgServings:6 },
  { id:"tomato", name:"Tomato", category:"Vegetable", servingLabel:"1 medium", cal:22, p:1, c:5, f:0, fiber:1.5, gf:true, ai:true, price:0.6, store:"Aldi", location:"fridge", qty:4, pkgServings:6, contains:["tomato"] },
  { id:"cucumber", name:"Cucumber", category:"Vegetable", servingLabel:"1 cup", cal:16, p:0.7, c:4, f:0, fiber:0.5, gf:true, ai:true, price:0.7, store:"Aldi", location:"fridge", qty:3, pkgServings:4 },
  { id:"bellpepper", name:"Bell Pepper", category:"Vegetable", servingLabel:"1 cup", cal:30, p:1, c:7, f:0, fiber:2, gf:true, ai:true, price:0.9, store:"Aldi", location:"fridge", qty:3, pkgServings:5, contains:["peppers"] },
  { id:"onion", name:"Onion", category:"Vegetable", servingLabel:"1/2 cup", cal:32, p:1, c:8, f:0, fiber:1.5, gf:true, ai:true, price:0.3, store:"Aldi", location:"pantry", qty:6, pkgServings:10, contains:["onions"] },
  { id:"mushrooms", name:"Mushrooms", category:"Vegetable", servingLabel:"1 cup", cal:15, p:2, c:2, f:0, fiber:1, gf:true, ai:true, price:1.1, store:"Aldi", location:"fridge", qty:2, pkgServings:5, contains:["mushrooms"] },
  { id:"blackeyedpeas", name:"Black-Eyed Peas", category:"Protein", servingLabel:"1/2 cup cooked", cal:100, p:7, c:18, f:0.5, fiber:4, gf:true, ai:true, price:0.6, store:"Aldi", location:"pantry", qty:4, pkgServings:6 },
  { id:"blueberries", name:"Blueberries", category:"Fruit", servingLabel:"1/2 cup", cal:42, p:0.5, c:11, f:0, fiber:2, gf:true, ai:true, price:1.4, store:"Costco", location:"fridge", qty:5, pkgServings:12 },
  { id:"strawberries", name:"Strawberries", category:"Fruit", servingLabel:"1/2 cup", cal:27, p:0.6, c:6.5, f:0, fiber:1.5, gf:true, ai:true, price:1.1, store:"Costco", location:"fridge", qty:5, pkgServings:12 },
  { id:"grapes", name:"Grapes", category:"Fruit", servingLabel:"1/2 cup", cal:52, p:0.5, c:14, f:0, fiber:0.5, gf:true, ai:true, price:1.0, store:"Costco", location:"fridge", qty:4, pkgServings:10 },
  { id:"blackberries", name:"Blackberries", category:"Fruit", servingLabel:"1/2 cup", cal:31, p:1, c:7, f:0, fiber:4, gf:true, ai:true, price:1.3, store:"Costco", location:"fridge", qty:4, pkgServings:10 },
  { id:"vanillayogurt", name:"Vanilla Yogurt", category:"Dairy", servingLabel:"3/4 cup", cal:150, p:12, c:22, f:2, fiber:0, gf:true, ai:false, price:0.8, store:"Aldi", location:"fridge", qty:4, pkgServings:8, flavor:"vanilla" },
  { id:"apple", name:"Apple", category:"Fruit", servingLabel:"1 medium", cal:95, p:0.5, c:25, f:0, fiber:4, gf:true, ai:true, price:0.5, store:"Aldi", location:"pantry", qty:6, pkgServings:8 },
  { id:"butterchicken", name:"Sukhi's Butter Chicken", category:"Protein", brand:"Sukhi's / prepared item", servingLabel:"5 oz", cal:160, p:20, c:6, f:6, fiber:1, gf:true, ai:false, price:2.5, store:"Costco", location:"freezer", qty:4, pkgServings:8 },
];

/* Multi-store pricing: every food gets a `prices` array ([{store, price}])
   seeded from its single price/store, plus a `preferredStore` used for cost
   math and the grocery list. Editable per-store from the Foods tab. */
FOODS.forEach((f) => {
  f.prices = f.prices || [{ store: f.store, price: f.price }];
  f.preferredStore = f.preferredStore || f.store;
});
function effectivePrice(food) {
  if (!food.prices || !food.prices.length) return food.price || 0;
  const match = food.prices.find((p) => p.store === food.preferredStore);
  return (match || food.prices[0]).price || 0;
}

/* Staples: foods you always want stocked, independent of whether this week's
   recipes call for them. A staple resurfaces on the grocery list on its own
   once it runs low — it doesn't need to be "needed" by a meal to show up. */
const STAPLE_IDS = new Set(["egg","bacon","milk","cheese","jasminerice","cornTortilla","potatoes","banana","greekyogurt","chipotlechicken","groundbeef"]);
FOODS.forEach((f) => { f.isStaple = STAPLE_IDS.has(f.id); });
function isRunningLow(food) { return food.qty <= (food.pkgServings || 4) * 0.25; }

/* -------------------------------- MEALS ---------------------------------- */
/* items: [{food: FOOD_ID, qty: multiplier of that food's serving}]
   slot: breakfast | snack | lunch | preworkout | dinner
   people: "both" | "tyler" | "elizabeth"  (which profile(s) this exact meal belongs to)
   sharedInfo: optional { shared:[names], personal:[names] } for the
   "Shared Base + Personalized Add-ons" UI treatment */
const MEALS = [
  // ---- Breakfasts (mostly shared) ----
  { id:"b-eggs-bacon-potato-berries", name:"Eggs, Bacon, Potatoes & Berries", category:"breakfast", people:"both", prep:15,
    items:[{food:"egg",qty:1},{food:"bacon",qty:1},{food:"potatoes",qty:1},{food:"berries",qty:1}] },
  { id:"b-egg-bacon-tacos-fruit", name:"Egg & Bacon Corn-Tortilla Tacos + Fruit", category:"breakfast", people:"both", prep:15,
    items:[{food:"egg",qty:1},{food:"bacon",qty:0.7},{food:"cornTortilla",qty:0.5},{food:"berries",qty:1}] },
  { id:"b-eggs-potato-fruit", name:"Eggs, Potatoes & Fruit", category:"breakfast", people:"both", prep:12,
    items:[{food:"egg",qty:1},{food:"potatoes",qty:1},{food:"banana",qty:1}] },
  { id:"b-eggs-bacon-potato-banana", name:"Eggs, Bacon, Potatoes & Banana", category:"breakfast", people:"both", prep:15,
    items:[{food:"egg",qty:1},{food:"bacon",qty:1},{food:"potatoes",qty:1},{food:"banana",qty:1}] },
  { id:"b-egg-bacon-tacos-fruit2", name:"Egg & Bacon Breakfast Tacos + Fruit", category:"breakfast", people:"both", prep:15,
    items:[{food:"egg",qty:1},{food:"bacon",qty:0.7},{food:"cornTortilla",qty:0.5},{food:"grapes",qty:1}] },
  { id:"b-eggs-bacon-potato-fruit-sun", name:"Eggs, Bacon, Potatoes & Fruit", category:"breakfast", people:"both", prep:15,
    items:[{food:"egg",qty:1},{food:"bacon",qty:1},{food:"potatoes",qty:1},{food:"blueberries",qty:1}] },

  // ---- Snacks (mostly shared) ----
  { id:"s-yogurt-banana", name:"Greek Yogurt + Banana", category:"snack", people:"both", prep:2,
    items:[{food:"greekyogurt",qty:1},{food:"banana",qty:1}] },
  { id:"s-premier-berries", name:"Premier Protein + Berries", category:"snack", people:"both", prep:1,
    items:[{food:"premierprotein",qty:1},{food:"berries",qty:1}] },
  { id:"s-premier-choc-banana", name:"Chocolate Premier Protein + Banana", category:"snack", people:"both", prep:1,
    items:[{food:"premierprotein",qty:1},{food:"banana",qty:1}] },
  { id:"s-yogurt-berries", name:"Greek Yogurt + Berries", category:"snack", people:"both", prep:2,
    items:[{food:"greekyogurt",qty:1},{food:"berries",qty:1}] },
  { id:"s-cottage-pineapple", name:"Cottage Cheese + Pineapple", category:"snack", people:"both", prep:2,
    items:[{food:"cottagecheese",qty:1},{food:"pineapple",qty:1}] },
  { id:"s-premier-latte-banana", name:"Café Latte Premier Protein + Banana", category:"snack", people:"both", prep:1,
    items:[{food:"premierprotein",qty:1},{food:"banana",qty:1}] },
  { id:"s-apple-string", name:"Apple + String Cheese", category:"snack", people:"both", prep:1,
    items:[{food:"apple",qty:1},{food:"stringcheese",qty:1}] },
  { id:"s-fruit-string", name:"Fruit + String Cheese", category:"snack", people:"both", prep:1,
    items:[{food:"grapes",qty:1},{food:"stringcheese",qty:1}] },

  // ---- Pre-Workout (shared, 25-40g carb / low fat) ----
  { id:"pw-banana-applesauce", name:"Banana + Applesauce", category:"preworkout", people:"both", prep:1,
    items:[{food:"banana",qty:1},{food:"applesauce",qty:1}] },
  { id:"pw-ricecakes-honey-banana", name:"Rice Cakes + Honey + Banana", category:"preworkout", people:"both", prep:2,
    items:[{food:"ricecakes",qty:1},{food:"honey",qty:1},{food:"banana",qty:1}] },
  { id:"pw-halfpremier-banana", name:"½ Premier Protein + Banana", category:"preworkout", people:"both", prep:1,
    items:[{food:"premierprotein",qty:0.5},{food:"banana",qty:1}] },
  { id:"pw-applesauce-ricecakes-honey", name:"Applesauce + Rice Cakes + Honey", category:"preworkout", people:"both", prep:2,
    items:[{food:"applesauce",qty:1},{food:"ricecakes",qty:1},{food:"honey",qty:1}] },
  { id:"pw-gfpretzels-turkey", name:"GF Pretzels + Turkey", category:"preworkout", people:"both", prep:1,
    items:[{food:"gfpretzels",qty:1},{food:"turkey",qty:1}] },
  { id:"pw-cereal-milk", name:"Cereal + Milk", category:"preworkout", people:"both", prep:2,
    items:[{food:"gfcereal",qty:1},{food:"milk",qty:1}] },

  // ---- Lunches (Tyler vs Elizabeth differ) ----
  { id:"l-chipotle-bowl-tyler", name:"Chipotle Chicken Bowl", category:"lunch", people:"tyler", prep:8,
    items:[{food:"chipotlechicken",qty:3},{food:"jasminerice",qty:1},{food:"broccoli",qty:1},{food:"valentina",qty:1}] },
  { id:"l-butterchicken-liz", name:"Butter Chicken + Jasmine Rice + Broccoli", category:"lunch", people:"elizabeth", prep:8,
    items:[{food:"butterchicken",qty:1.6},{food:"jasminerice",qty:1},{food:"broccoli",qty:1}] },
  { id:"l-turkeywraps-liz", name:"Turkey & Cheese Corn-Tortilla Wraps + Fruit", category:"lunch", people:"elizabeth", prep:6,
    items:[{food:"turkey",qty:2},{food:"cheese",qty:1},{food:"cornTortilla",qty:1},{food:"grapes",qty:1}] },
  { id:"l-sirloin-rice-broccoli-liz", name:"Sirloin + Jasmine Rice + Broccoli", category:"lunch", people:"elizabeth", prep:10,
    items:[{food:"sirloin",qty:0.6},{food:"jasminerice",qty:1},{food:"broccoli",qty:1}] },
  { id:"l-chipotle-tacos-tyler", name:"Chipotle Chicken Tacos", category:"lunch", people:"tyler", prep:8,
    items:[{food:"chipotlechicken",qty:3},{food:"cornTortilla",qty:1},{food:"lettuce",qty:1},{food:"cheese",qty:1}] },
  { id:"l-beef-tacos-liz", name:"Chicken or Beef Tacos", category:"lunch", people:"elizabeth", prep:8,
    items:[{food:"groundbeef",qty:1.3},{food:"cornTortilla",qty:1},{food:"lettuce",qty:1},{food:"cheese",qty:1}] },
  { id:"l-leftover-steak-liz", name:"Leftover Steak or Chicken + Rice + Veg", category:"lunch", people:"elizabeth", prep:5,
    items:[{food:"sirloin",qty:0.5},{food:"jasminerice",qty:1},{food:"asparagus",qty:1}] },

  // ---- Dinners ----
  { id:"d-sirloin-potato-greenbeans", name:"Sirloin, Potatoes & Green Beans", category:"dinner", people:"both", prep:25,
    items:[{food:"sirloin",qty:1},{food:"potatoes",qty:1},{food:"greenbeans",qty:1}] },
  { id:"d-taco-night-tyler", name:"Taco Night", category:"dinner", people:"tyler", prep:20,
    items:[{food:"groundbeef",qty:1.3},{food:"cornTortilla",qty:1.5},{food:"cheese",qty:1},{food:"lettuce",qty:1}],
    sharedInfo:{ shared:["Ground beef","Corn tortillas","Cheese"], personal:["Lettuce"] } },
  { id:"d-taco-night-liz", name:"Taco Night", category:"dinner", people:"elizabeth", prep:20,
    items:[{food:"groundbeef",qty:1.3},{food:"cornTortilla",qty:1.5},{food:"cheese",qty:1},{food:"tomato",qty:1},{food:"onion",qty:0.5},{food:"bellpepper",qty:0.5},{food:"mushrooms",qty:0.5},{food:"lettuce",qty:0.5}],
    sharedInfo:{ shared:["Ground beef","Corn tortillas","Cheese"], personal:["Tomato","Onion","Bell pepper","Mushrooms","Lettuce"] } },
  { id:"d-pork-potato-greenbeans", name:"Pork Tenderloin, Potatoes & Green Beans", category:"dinner", people:"both", prep:25,
    items:[{food:"pork",qty:1},{food:"potatoes",qty:1},{food:"greenbeans",qty:1}] },
  { id:"d-shrimp-tacos", name:"Shrimp Tacos", category:"dinner", people:"both", prep:18,
    items:[{food:"shrimp",qty:1},{food:"cornTortilla",qty:1.5},{food:"lettuce",qty:1},{food:"cheese",qty:1}] },
  { id:"d-burgerbowl", name:"Burger Bowl", category:"dinner", people:"both", prep:20,
    items:[{food:"burgerpatty",qty:1},{food:"potatoes",qty:1},{food:"lettuce",qty:1},{food:"cheese",qty:1},{food:"pickles",qty:1}] },
  { id:"d-steak-dinner-tyler", name:"Steak Dinner", category:"dinner", people:"tyler", prep:25,
    items:[{food:"sirloin",qty:1},{food:"potatoes",qty:1},{food:"broccoli",qty:1}],
    sharedInfo:{ shared:["Steak","Potatoes"], personal:["Broccoli"] } },
  { id:"d-steak-dinner-liz", name:"Steak Dinner", category:"dinner", people:"elizabeth", prep:25,
    items:[{food:"sirloin",qty:0.8},{food:"potatoes",qty:1},{food:"asparagus",qty:1},{food:"mushrooms",qty:1}],
    sharedInfo:{ shared:["Steak","Potatoes"], personal:["Asparagus","Mushrooms"] } },
  { id:"d-chefs-choice", name:"Chef's Choice — Ground Beef, Rice & Broccoli", category:"dinner", people:"both", prep:20, flexible:true,
    items:[{food:"groundbeef",qty:1},{food:"jasminerice",qty:1},{food:"broccoli",qty:1}] },
];

/* Alternate options offered when "Swap" is tapped, grouped by category+slot */
const SWAP_POOL = {
  breakfast: ["b-eggs-bacon-potato-berries","b-egg-bacon-tacos-fruit","b-eggs-potato-fruit","b-eggs-bacon-potato-banana"],
  snack: ["s-yogurt-banana","s-premier-berries","s-yogurt-berries","s-cottage-pineapple","s-apple-string"],
  preworkout: ["pw-banana-applesauce","pw-ricecakes-honey-banana","pw-halfpremier-banana","pw-gfpretzels-turkey","pw-cereal-milk"],
  dinner: ["d-sirloin-potato-greenbeans","d-pork-potato-greenbeans","d-shrimp-tacos","d-burgerbowl","d-chefs-choice"],
};

/* ------------------------------ RECIPE STEPS ------------------------------ */
/* Real cooking instructions per meal, shown in the meal detail sheet. */
const RECIPE_STEPS = {
  "b-eggs-bacon-potato-berries": [
    "Cook bacon in a skillet over medium heat until crisp, about 6–7 minutes. Set on a paper towel.",
    "Scramble or fry the eggs in the bacon fat (or fresh butter) to your liking.",
    "Roast or air-fry cubed potatoes at 425°F until golden, about 15 minutes, or reheat leftovers.",
    "Plate the eggs and bacon with potatoes and a side of fresh berries.",
  ],
  "b-egg-bacon-tacos-fruit": [
    "Cook bacon until crisp, then scramble the eggs in the same pan.",
    "Warm corn tortillas in a dry skillet, about 20 seconds per side.",
    "Fill tortillas with scrambled eggs and crumbled bacon.",
    "Serve with a side of fresh fruit.",
  ],
  "b-eggs-potato-fruit": [
    "Fry or scramble the eggs in a lightly oiled pan.",
    "Reheat or roast the potatoes until hot and crisp at the edges.",
    "Plate together with a banana or fruit of choice.",
  ],
  "b-eggs-bacon-potato-banana": [
    "Cook bacon until crisp, about 6–7 minutes, then set aside.",
    "Scramble the eggs in the same skillet.",
    "Roast or reheat the potatoes until golden and hot.",
    "Plate with sliced banana on the side.",
  ],
  "b-egg-bacon-tacos-fruit2": [
    "Cook bacon until crisp, then scramble the eggs.",
    "Warm corn tortillas in a dry skillet, 20 seconds per side.",
    "Fill with egg and bacon, and serve grapes on the side.",
  ],
  "b-eggs-bacon-potato-fruit-sun": [
    "Cook bacon until crisp; scramble the eggs in the same pan.",
    "Roast or reheat potatoes until golden.",
    "Plate together with fresh blueberries.",
  ],
  "s-yogurt-banana": ["Spoon Greek yogurt into a bowl.", "Slice the banana on top and serve."],
  "s-premier-berries": ["Chill the Premier Protein shake and pour over ice if you like.", "Serve alongside a bowl of fresh berries."],
  "s-premier-choc-banana": ["Shake the chocolate Premier Protein well and pour over ice.", "Pair with a sliced banana."],
  "s-yogurt-berries": ["Layer Greek yogurt and berries in a bowl or to-go cup."],
  "s-cottage-pineapple": ["Spoon cottage cheese into a bowl.", "Top with pineapple chunks."],
  "s-premier-latte-banana": ["Shake the Café Latte Premier Protein well and pour over ice.", "Serve with a banana."],
  "s-apple-string": ["Slice the apple.", "Pair with a string cheese stick."],
  "s-fruit-string": ["Wash and portion the fruit.", "Pair with a string cheese stick."],
  "pw-banana-applesauce": ["Peel the banana.", "Pair with an applesauce pouch — eat 30–45 minutes before training."],
  "pw-ricecakes-honey-banana": ["Drizzle honey over the rice cakes.", "Top or pair with sliced banana.", "Eat 45–60 minutes pre-workout."],
  "pw-halfpremier-banana": ["Pour half a Premier Protein shake.", "Pair with a banana for a quick hit of carbs."],
  "pw-applesauce-ricecakes-honey": ["Drizzle the rice cakes with honey.", "Serve alongside an applesauce pouch."],
  "pw-gfpretzels-turkey": ["Roll turkey slices around a few GF pretzels, or serve them side-by-side."],
  "pw-cereal-milk": ["Pour cereal into a bowl and add cold milk.", "Eat about 60–90 minutes before training."],
  "l-chipotle-bowl-tyler": [
    "Warm the Chipotle-seasoned chicken in a skillet or microwave until hot.",
    "Fluff the jasmine rice and spoon into a bowl.",
    "Top with chicken and steamed broccoli, then finish with a splash of Valentina.",
  ],
  "l-butterchicken-liz": [
    "Heat the butter chicken according to package directions, stirring occasionally.",
    "Fluff the jasmine rice.",
    "Serve the butter chicken over rice with steamed broccoli on the side.",
  ],
  "l-turkeywraps-liz": [
    "Lay a corn tortilla flat and layer turkey slices and cheese down the center.",
    "Roll tightly and slice in half.",
    "Serve with a side of fruit.",
  ],
  "l-sirloin-rice-broccoli-liz": [
    "Slice leftover (or freshly seared) sirloin thin.",
    "Fluff the jasmine rice and steam the broccoli.",
    "Plate the steak over rice with broccoli on the side.",
  ],
  "l-chipotle-tacos-tyler": [
    "Warm corn tortillas in a dry skillet, about 20 seconds per side.",
    "Warm the Chipotle chicken.",
    "Fill tortillas with chicken, lettuce, and shredded cheese.",
  ],
  "l-beef-tacos-liz": [
    "Brown the ground beef (or reheat leftover chicken or beef) with a pinch of salt.",
    "Warm corn tortillas in a dry skillet.",
    "Fill with the meat, lettuce, and shredded cheese.",
  ],
  "l-leftover-steak-liz": [
    "Slice leftover steak or chicken thin.",
    "Reheat gently in a pan with the rice.",
    "Serve with a green vegetable on the side.",
  ],
  "d-sirloin-potato-greenbeans": [
    "Season the sirloin generously with salt and pepper.",
    "Sear in a hot skillet 3–4 minutes per side for medium-rare, then rest 5 minutes before slicing.",
    "Toss potatoes in oil and salt; roast at 425°F for 25–30 minutes until golden.",
    "Steam or sauté the green beans until bright green and tender-crisp.",
    "Slice the steak against the grain and plate with potatoes and green beans.",
  ],
  "d-taco-night-tyler": [
    "Brown the ground beef with a pinch of taco seasoning, salt, and a splash of water; simmer 5 minutes.",
    "Warm the corn tortillas in a dry skillet.",
    "Build Tyler's tacos: beef, shredded cheese, and lettuce.",
  ],
  "d-taco-night-liz": [
    "Brown the ground beef with a pinch of taco seasoning, salt, and a splash of water; simmer 5 minutes.",
    "Warm the corn tortillas in a dry skillet.",
    "Build Elizabeth's tacos: beef and cheese, then top with tomato, onion, bell pepper, mushrooms, and lettuce.",
  ],
  "d-pork-potato-greenbeans": [
    "Season the pork tenderloin and sear on all sides in a hot pan.",
    "Roast at 400°F until internal temperature reaches 145°F, about 20 minutes.",
    "Roast the potatoes alongside; steam the green beans.",
    "Rest the pork 5 minutes before slicing and plating.",
  ],
  "d-shrimp-tacos": [
    "Season the shrimp and sauté in a hot pan, 2–3 minutes per side until opaque.",
    "Warm corn tortillas in a dry skillet.",
    "Fill with shrimp, lettuce, and shredded cheese.",
  ],
  "d-burgerbowl": [
    "Form and grill or pan-sear the burger patty to your preferred doneness.",
    "Roast the potatoes until golden, about 25 minutes at 425°F.",
    "Build a bowl with potatoes, lettuce, and cheese; top with the sliced patty and pickles.",
  ],
  "d-steak-dinner-tyler": [
    "Season the steak and sear 3–4 minutes per side for medium-rare; rest 5 minutes.",
    "Roast the potatoes until golden.",
    "Steam the broccoli and plate alongside the sliced steak and potatoes.",
  ],
  "d-steak-dinner-liz": [
    "Season the steak and sear 3–4 minutes per side for medium-rare; rest 5 minutes.",
    "Roast the potatoes until golden.",
    "Sauté the asparagus and mushrooms in a little butter until tender, about 5 minutes.",
    "Plate the sliced steak with potatoes, asparagus, and mushrooms.",
  ],
  "d-chefs-choice": [
    "Brown the ground beef in a skillet.",
    "Fluff the jasmine rice and steam the broccoli.",
    "Combine in a bowl or plate separately — a flexible, use-what's-on-hand dinner.",
  ],
};
MEALS.forEach((m) => { m.steps = RECIPE_STEPS[m.id] || ["Combine the ingredients above and serve warm."]; });

/* --------------------------- DEFAULT PREFERENCES -------------------------- */
/* Per-food, per-person preference seed. Anything not listed here defaults
   to "neutral" for that person (see getPref()). Notes/prep carry the
   "context-specific preference" detail (raw vs cooked, etc). */
const DEFAULT_PREFS = {
  chipotlechicken: { tyler:{level:"love"}, elizabeth:{level:"like"} },
  sirloin:         { tyler:{level:"love"}, elizabeth:{level:"like"} },
  groundbeef:      { tyler:{level:"like"}, elizabeth:{level:"like"} },
  burgerpatty:     { tyler:{level:"like"}, elizabeth:{level:"neutral"} },
  shrimp:          { tyler:{level:"like"}, elizabeth:{level:"neutral"} },
  pork:            { tyler:{level:"like"}, elizabeth:{level:"neutral"} },
  potatoes:        { tyler:{level:"like"}, elizabeth:{level:"like"} },
  jasminerice:     { tyler:{level:"like"}, elizabeth:{level:"like"} },
  cornTortilla:    { tyler:{level:"like"}, elizabeth:{level:"like"} },
  egg:             { tyler:{level:"like"}, elizabeth:{level:"like"} },
  bacon:           { tyler:{level:"like"}, elizabeth:{level:"like"} },
  cheese:          { tyler:{level:"like"}, elizabeth:{level:"like"} },
  broccoli:        { tyler:{level:"like"}, elizabeth:{level:"like"} },
  lettuce:         { tyler:{level:"like"}, elizabeth:{level:"neutral"} },
  valentina:       { tyler:{level:"love"}, elizabeth:{level:"neutral"} },
  tomato:          { tyler:{level:"never", note:"Avoid — raw or cooked."}, elizabeth:{level:"like"} },
  mushrooms:       { tyler:{level:"never"}, elizabeth:{level:"like"} },
  onion:           { tyler:{level:"dislike", prep:"raw", note:"Dislikes raw onion — may be okay cooked."}, elizabeth:{level:"like"} },
  bellpepper:      { tyler:{level:"never"}, elizabeth:{level:"like"} },
  cucumber:        { tyler:{level:"neutral"}, elizabeth:{level:"like"} },
  asparagus:       { tyler:{level:"neutral"}, elizabeth:{level:"like"} },
  greenbeans:      { tyler:{level:"neutral"}, elizabeth:{level:"like"} },
  blackeyedpeas:   { tyler:{level:"neutral"}, elizabeth:{level:"like"} },
  banana:          { tyler:{level:"like"}, elizabeth:{level:"like"} },
  blueberries:     { tyler:{level:"neutral"}, elizabeth:{level:"like"} },
  strawberries:    { tyler:{level:"neutral"}, elizabeth:{level:"like"} },
  grapes:          { tyler:{level:"neutral"}, elizabeth:{level:"like"} },
  blackberries:    { tyler:{level:"neutral"}, elizabeth:{level:"like"} },
  vanillayogurt:   { tyler:{level:"neutral"}, elizabeth:{level:"like", note:"Only likes vanilla yogurt."} },
  greekyogurt:      { tyler:{level:"like"}, elizabeth:{level:"dislike", note:"Only likes vanilla yogurt — plain isn't her favorite."} },
  butterchicken:   { tyler:{level:"neutral"}, elizabeth:{level:"love"} },
};

const getPref = (prefs, foodId, personId) => {
  const entry = prefs?.[foodId]?.[personId];
  return entry ? { level: "neutral", ...entry } : { level: "neutral" };
};

/* ------------------------------- PROFILES --------------------------------- */
const DEFAULT_ROUTINE = {
  planDay: "sun", planTime: "4:00 PM",
  shopDay: "sun", shopTime: "5:30 PM",
  cookStyle: "prep", prepDay: "sun", prepTime: "6:30 PM",
  dailyCookTime: "6:00 PM",
};

const DEFAULT_PROFILES = {
  tyler: {
    calorieTarget: 1800, proteinTarget: 150, carbTarget: 190, fatTarget: 60, fiberTarget: 25, waterTarget: 100,
    workoutDays: ["mon","tue","thu","fri","sat"], workoutTime: "7:00 PM", goalWeight: 180,
    glutenPref: "Generally gluten-free", antiInflammatory: "Anti-inflammatory where practical",
    favoriteRestaurants: ["Chipotle"], neverRecommendNote: "Fajitas, tomatoes, mushrooms, raw onions, peppers",
  },
  elizabeth: {
    calorieTarget: 1600, proteinTarget: 130, carbTarget: 160, fatTarget: 55, fiberTarget: 25, waterTarget: 90,
    workoutDays: ["mon","tue","thu","fri","sat"], workoutTime: "7:00 PM", goalWeight: 150,
    glutenPref: "Flexible", antiInflammatory: "No strict preference",
    favoriteRestaurants: ["Sukhi's (frozen)"], neverRecommendNote: "—",
  },
};

/* -------------------------------- WEEK PLAN -------------------------------- */
const shared = (mealId) => ({ tyler: mealId, elizabeth: mealId });

const WEEK_DAYS = [
  { key:"mon", label:"Monday", short:"MON", isWorkout:true, gymTime:"7:00 PM", slots:[
    { key:"breakfast", time:"8:00 AM", category:"breakfast", meal: shared("b-eggs-bacon-potato-berries") },
    { key:"snack1", time:"10:30 AM", category:"snack", meal: shared("s-yogurt-banana") },
    { key:"lunch", time:"1:00 PM", category:"lunch", meal: { tyler:"l-chipotle-bowl-tyler", elizabeth:"l-butterchicken-liz" } },
    { key:"preworkout", time:"6:00 PM", category:"preworkout", meal: shared("pw-banana-applesauce") },
    { key:"dinner", time:"8:30 PM", category:"dinner", meal: shared("d-sirloin-potato-greenbeans") },
  ]},
  { key:"tue", label:"Tuesday", short:"TUE", isWorkout:true, gymTime:"7:00 PM", slots:[
    { key:"breakfast", time:"8:00 AM", category:"breakfast", meal: shared("b-egg-bacon-tacos-fruit") },
    { key:"snack1", time:"10:30 AM", category:"snack", meal: shared("s-premier-berries") },
    { key:"lunch", time:"1:00 PM", category:"lunch", meal: { tyler:"l-chipotle-bowl-tyler", elizabeth:"l-butterchicken-liz" } },
    { key:"preworkout", time:"6:00 PM", category:"preworkout", meal: shared("pw-ricecakes-honey-banana") },
    { key:"dinner", time:"8:30 PM", category:"dinner", meal: { tyler:"d-taco-night-tyler", elizabeth:"d-taco-night-liz" } },
  ]},
  { key:"wed", label:"Wednesday", short:"WED", isWorkout:false, slots:[
    { key:"breakfast", time:"8:00 AM", category:"breakfast", meal: shared("b-eggs-potato-fruit") },
    { key:"snack1", time:"10:30 AM", category:"snack", meal: shared("s-premier-choc-banana") },
    { key:"lunch", time:"1:00 PM", category:"lunch", meal: { tyler:"l-chipotle-bowl-tyler", elizabeth:"l-turkeywraps-liz" } },
    { key:"snack2", time:"4:00 PM", category:"snack", meal: shared("s-apple-string") },
    { key:"dinner", time:"7:00 PM", category:"dinner", meal: shared("d-pork-potato-greenbeans") },
  ]},
  { key:"thu", label:"Thursday", short:"THU", isWorkout:true, gymTime:"7:00 PM", slots:[
    { key:"breakfast", time:"8:00 AM", category:"breakfast", meal: shared("b-eggs-bacon-potato-banana") },
    { key:"snack1", time:"10:30 AM", category:"snack", meal: shared("s-yogurt-berries") },
    { key:"lunch", time:"1:00 PM", category:"lunch", meal: { tyler:"l-chipotle-bowl-tyler", elizabeth:"l-butterchicken-liz" } },
    { key:"preworkout", time:"6:00 PM", category:"preworkout", meal: shared("pw-halfpremier-banana") },
    { key:"dinner", time:"8:30 PM", category:"dinner", meal: shared("d-shrimp-tacos") },
  ]},
  { key:"fri", label:"Friday", short:"FRI", isWorkout:true, gymTime:"7:00 PM", slots:[
    { key:"breakfast", time:"8:00 AM", category:"breakfast", meal: shared("b-egg-bacon-tacos-fruit2") },
    { key:"snack1", time:"10:30 AM", category:"snack", meal: shared("s-cottage-pineapple") },
    { key:"lunch", time:"1:00 PM", category:"lunch", meal: { tyler:"l-chipotle-bowl-tyler", elizabeth:"l-sirloin-rice-broccoli-liz" } },
    { key:"preworkout", time:"6:00 PM", category:"preworkout", meal: shared("pw-applesauce-ricecakes-honey") },
    { key:"dinner", time:"8:30 PM", category:"dinner", meal: shared("d-burgerbowl") },
  ]},
  { key:"sat", label:"Saturday", short:"SAT", isWorkout:true, gymTime:"7:00 PM", slots:[
    { key:"breakfast", time:"8:00 AM", category:"breakfast", meal: shared("b-eggs-bacon-potato-berries") },
    { key:"snack1", time:"10:30 AM", category:"snack", meal: shared("s-premier-latte-banana") },
    { key:"lunch", time:"1:00 PM", category:"lunch", meal: { tyler:"l-chipotle-tacos-tyler", elizabeth:"l-beef-tacos-liz" } },
    { key:"preworkout", time:"6:00 PM", category:"preworkout", meal: shared("pw-banana-applesauce") },
    { key:"dinner", time:"8:30 PM", category:"dinner", meal: { tyler:"d-steak-dinner-tyler", elizabeth:"d-steak-dinner-liz" } },
  ]},
  { key:"sun", label:"Sunday", short:"SUN", isWorkout:false, slots:[
    { key:"breakfast", time:"8:00 AM", category:"breakfast", meal: shared("b-eggs-bacon-potato-fruit-sun") },
    { key:"snack1", time:"10:30 AM", category:"snack", meal: shared("s-yogurt-berries") },
    { key:"lunch", time:"1:00 PM", category:"lunch", meal: { tyler:"l-chipotle-bowl-tyler", elizabeth:"l-leftover-steak-liz" } },
    { key:"snack2", time:"4:00 PM", category:"snack", meal: shared("s-fruit-string") },
    { key:"dinner", time:"7:00 PM", category:"dinner", meal: shared("d-chefs-choice") },
  ]},
];

const WEEK_LABEL = "Aug 17 – Aug 23";

/* ------------------------------- helpers ---------------------------------- */
const round = (n, d = 0) => { const m = 10 ** d; return Math.round(n * m) / m; };

function foodIndex(foods) {
  const map = {};
  foods.forEach((f) => (map[f.id] = f));
  return map;
}

function computeItemsNutrition(items, foodsById) {
  return items.reduce((acc, it) => {
    const f = foodsById[it.food];
    if (!f) return acc;
    acc.cal += f.cal * it.qty;
    acc.p += f.p * it.qty;
    acc.c += f.c * it.qty;
    acc.f += f.f * it.qty;
    acc.fiber += (f.fiber || 0) * it.qty;
    acc.cost += effectivePrice(f) * it.qty;
    return acc;
  }, { cal: 0, p: 0, c: 0, f: 0, fiber: 0, cost: 0 });
}

function mealIndex(meals) {
  const map = {};
  meals.forEach((m) => (map[m.id] = m));
  return map;
}

function timeToMinutes(t) {
  if (!t) return null;
  const m = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return null;
  let h = parseInt(m[1], 10) % 12;
  if (/pm/i.test(m[3])) h += 12;
  return h * 60 + parseInt(m[2], 10);
}

function nowMinutes(d = new Date()) { return d.getHours() * 60 + d.getMinutes(); }

/** "8:00 AM" -> "08:00" (native <input type="time"> format). */
function to24(t12) {
  const m = (t12 || "").match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return "08:00";
  let h = parseInt(m[1], 10) % 12;
  if (/pm/i.test(m[3])) h += 12;
  return `${String(h).padStart(2, "0")}:${m[2]}`;
}
/** "08:00" -> "8:00 AM" */
function format12(t24) {
  const m = (t24 || "").match(/(\d+):(\d+)/);
  if (!m) return t24;
  let h = parseInt(m[1], 10);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12; if (h === 0) h = 12;
  return `${h}:${m[2]} ${ampm}`;
}
function minutesFrom24(t24) {
  const m = (t24 || "").match(/(\d+):(\d+)/);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}
function nowDisplayTime(d = new Date()) {
  let h = d.getHours(); const min = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12; if (h === 0) h = 12;
  return `${h}:${String(min).padStart(2, "0")} ${ampm}`;
}
/** Effective slot/gym time honoring per-day overrides, always returned as "H:MM AM/PM". */
function effectiveTime(dayKey, key, defaultT12, timeOverrides) {
  const o = timeOverrides?.[dayKey]?.[key];
  return o ? format12(o) : defaultT12;
}

const JS_DAY_TO_KEY = ["sun","mon","tue","wed","thu","fri","sat"];
function todayDayKey() { return JS_DAY_TO_KEY[new Date().getDay()]; }

/* ------------------------------ CALENDAR / DATES ---------------------------
   All *tracking* (what was actually eaten, water, gym check-ins, per-slot
   time edits) is keyed by real ISO date ("YYYY-MM-DD"), so history is
   genuine across days, months, and years. The *plan template* (which meal
   sits in which weekday slot) stays keyed by weekday, since it's a
   repeating recipe — "Monday's lunch" — rather than a single occurrence. */
function pad2(n) { return String(n).padStart(2, "0"); }
function isoDate(d = new Date()) { return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; }
function parseISO(iso) { const [y, m, d] = iso.split("-").map(Number); return new Date(y, m - 1, d); }
function addDays(iso, n) { const d = parseISO(iso); d.setDate(d.getDate() + n); return isoDate(d); }
function addMonths(iso, n) { const d = parseISO(iso); d.setMonth(d.getMonth() + n); return isoDate(d); }
function addYears(iso, n) { const d = parseISO(iso); d.setFullYear(d.getFullYear() + n); return isoDate(d); }
function todayISO() { return isoDate(new Date()); }
function weekdayKeyOf(iso) { return JS_DAY_TO_KEY[parseISO(iso).getDay()]; }
/** Monday-anchored start of the week containing `iso` (matches WEEK_DAYS order). */
function startOfWeek(iso) {
  const d = parseISO(iso); const dow = d.getDay(); const diff = dow === 0 ? -6 : 1 - dow;
  d.setDate(d.getDate() + diff); return isoDate(d);
}
function startOfMonth(iso) { const d = parseISO(iso); return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-01`; }
function daysInMonth(iso) { const d = parseISO(iso); return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(); }
function formatDateHeader(iso) { return parseISO(iso).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }); }
function formatDateShort(iso) { return parseISO(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" }); }
function formatMonthYear(iso) { return parseISO(iso).toLocaleDateString("en-US", { month: "long", year: "numeric" }); }

/** Resolve which mealId a slot yields for a given person, honoring swap overrides. */
function resolveMealId(dayKey, slotKey, personId, slot, overrides) {
  const o = overrides?.[dayKey]?.[slotKey]?.[personId];
  if (o) return o;
  return typeof slot.meal === "string" ? slot.meal : slot.meal[personId];
}

function isLocked(dayKey, slotKey, locks) { return !!locks?.[dayKey]?.[slotKey]; }

/* ------------------------- per-date workout day overrides -------------------------
   The weekday template (WEEK_DAYS) says whether a given weekday is normally a
   workout or recovery day. `workoutOverrides[isoDate]` lets a specific date
   override that just for itself — e.g. "not working out this Saturday,
   moving it to Sunday this week" — without touching every future Saturday. */
/** Whether a specific date is a workout day for a specific person: their
    per-date override wins, otherwise their own weekly workoutDays pattern
    (set in Profile) decides — the WEEK_DAYS template's isWorkout is only
    the original seed default, not the source of truth once a profile has
    its own schedule. */
function effectiveIsWorkout(iso, personId, profile, workoutOverrides) {
  const o = workoutOverrides?.[iso]?.[personId];
  if (o != null) return o;
  return profile.workoutDays.includes(weekdayKeyOf(iso));
}
/** Household version: true if *either* person is training that day, so the
    shared meal plan still surfaces pre-workout fueling when relevant. */
function householdIsWorkout(iso, profiles, workoutOverrides) {
  return effectiveIsWorkout(iso, "tyler", profiles.tyler, workoutOverrides) || effectiveIsWorkout(iso, "elizabeth", profiles.elizabeth, workoutOverrides);
}
/** The slot immediately before dinner — the "workout-adjacent" slot in every
    day template (Pre-Workout on workout days, the second snack on recovery days). */
function gymAnchorSlotKey(day) {
  const slots = day.slots;
  return slots.length > 1 ? slots[slots.length - 2].key : null;
}
function effectiveSlotMeta(day, slot, workoutOn) {
  if (slot.key === gymAnchorSlotKey(day)) return CATEGORY_META[workoutOn ? "preworkout" : "snack"];
  return CATEGORY_META[slot.category];
}
function effectiveSlotLabel(day, slot, workoutOn) {
  return effectiveSlotMeta(day, slot, workoutOn).label;
}

/** Build the grocery list for the current week plan. */
function buildGroceryList(overrides, foodsById, mealsMap) {
  const need = {}; // foodId -> { qty, people:Set, usedFor:Set(category) }
  WEEK_DAYS.forEach((day) => {
    day.slots.forEach((slot) => {
      ["tyler", "elizabeth"].forEach((person) => {
        const mealId = resolveMealId(day.key, slot.key, person, slot, overrides);
        const meal = mealsMap[mealId];
        if (!meal) return;
        meal.items.forEach((it) => {
          const rec = need[it.food] || { qty: 0, people: new Set(), usedFor: new Set() };
          rec.qty += it.qty;
          rec.people.add(person);
          rec.usedFor.add(CATEGORY_META[slot.category]?.label || slot.category);
          need[it.food] = rec;
        });
      });
    });
  });
  // Staples resurface on their own once low, even if this week's recipes don't call for them.
  Object.values(foodsById).forEach((food) => {
    if (!food.isStaple || need[food.id] || !isRunningLow(food)) return;
    need[food.id] = { qty: food.pkgServings || 4, people: new Set(), usedFor: new Set(["Staple — keep stocked"]) };
  });
  return Object.entries(need).map(([foodId, rec]) => {
    const food = foodsById[foodId];
    if (!food) return null;
    const have = food.qty || 0;
    const buyServings = Math.max(0, round(rec.qty - have, 1));
    const buyPackages = buyServings > 0 ? Math.ceil(buyServings / (food.pkgServings || 1)) : 0;
    return {
      foodId, food, needServings: round(rec.qty, 1), haveServings: have,
      buyServings, buyPackages, people: Array.from(rec.people), usedFor: Array.from(rec.usedFor),
      estCost: round(buyServings * effectivePrice(food), 2),
    };
  }).filter(Boolean).sort((a, b) => a.food.name.localeCompare(b.food.name));
}

const GROCERY_CATEGORY_ORDER = ["Produce","Protein","Dairy","Carbohydrates","Frozen","Snacks","Condiments","Drinks","Other"];
function groceryCategoryOf(food) {
  if (food.location === "freezer" && food.category === "Protein") return "Frozen";
  if (food.category === "Vegetable" || food.category === "Fruit") return "Produce";
  if (food.category === "Protein") return "Protein";
  if (food.category === "Dairy") return "Dairy";
  if (food.category === "Carbohydrate") return "Carbohydrates";
  if (food.category === "Snacks") return "Snacks";
  if (food.category === "Sauces" || food.category === "Condiments") return "Condiments";
  if (food.category === "Drinks") return "Drinks";
  return "Other";
}

/** Applies a Respect Preferences mode filter to a candidate list of meal ids for a slot/person. */
function filterByPreferenceMode(candidateMealIds, personId, prefs, mealsMap, foodsById, mode) {
  const scoreMeal = (mealId) => {
    const meal = mealsMap[mealId];
    if (!meal) return -999;
    let worst = "love", hasNever = false, hasDislike = false;
    meal.items.forEach((it) => {
      const lvl = getPref(prefs, it.food, personId).level;
      if (lvl === "never") hasNever = true;
      if (lvl === "dislike") hasDislike = true;
    });
    if (mode === "strict") return hasNever ? -999 : hasDislike ? -1 : 1;
    if (mode === "flexible") return hasNever ? -999 : hasDislike ? 0 : 1;
    return hasNever ? -999 : 1; // ignore: only block Never
  };
  const scored = candidateMealIds.map((id) => ({ id, score: scoreMeal(id) })).filter((x) => x.score > -999);
  scored.sort((a, b) => b.score - a.score);
  return scored.map((x) => x.id);
}

/* =============================== UI ATOMS ================================ */

function Ring({ value, max, size = 64, stroke = 7, color = "var(--ink)", track = "var(--paper-3)", children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, max > 0 ? value / max : 0));
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset .5s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {children}
      </div>
    </div>
  );
}

/** Apple-Activity-style concentric rings: Calories (outer) / Protein (mid) / Carbs (inner). */
/* --------------------------------- brand mark ---------------------------------
   The actual supplied artwork, embedded inline (cropped to content, resized,
   and re-encoded as WebP — a few KB each — so the file stays self-contained
   with no external asset host). TROPHE_ICON_IMG is the glyph alone;
   TROPHE_LOCKUP_IMG is the full icon + wordmark + tagline composition. */
const TROPHE_ICON_IMG = "data:image/webp;base64,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";
const TROPHE_LOCKUP_IMG = "data:image/webp;base64,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";

function TropheIcon({ size = 32 }) {
  return <img src={TROPHE_ICON_IMG} alt="Trophé" style={{ width: size, height: "auto", display: "block" }} />;
}

/** Icon (real artwork) + wordmark + tagline, for compact/inline placements where
    the full composed lockup image would be too big or the wrong proportions.
    The splash screen uses the actual TROPHE_LOCKUP_IMG directly instead. */
function TropheLockup({ iconSize = 44, wordmarkSize = 30, showTagline = true, align = "center" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", flexDirection: align === "center" ? "column" : "row", gap: align === "center" ? 8 : 12 }}>
      <TropheIcon size={iconSize} />
      <div style={{ textAlign: align === "center" ? "center" : "left" }}>
        <div className="font-display font-bold" style={{ fontSize: wordmarkSize, letterSpacing: "-0.02em", lineHeight: 1 }}>Trophé</div>
        {showTagline && (
          <div className="text-[11.5px] font-semibold" style={{ color: "var(--ink-faint)", letterSpacing: ".02em", marginTop: 4 }}>
            Nourish <span style={{ color: "var(--blue)" }}>·</span> Fuel <span style={{ color: "var(--blue)" }}>·</span> Thrive
          </div>
        )}
      </div>
    </div>
  );
}

function ActivityRings({ rings, size = 168, stroke = 15, gap = 4 }) {
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      {rings.map((ring, i) => {
        const r = size / 2 - stroke / 2 - i * (stroke + gap);
        const c = 2 * Math.PI * r;
        const pct = Math.max(0, Math.min(1, ring.max > 0 ? ring.value / ring.max : 0));
        return (
          <g key={ring.label}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={ring.track || "var(--paper-3)"} strokeWidth={stroke} />
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={ring.color} strokeWidth={stroke}
              strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="round"
              style={{ transition: "stroke-dashoffset .6s cubic-bezier(.4,0,.2,1)" }} />
          </g>
        );
      })}
    </svg>
  );
}

function Bar({ value, max, color = "var(--ink)", track = "var(--paper-3)", h = 8 }) {
  const pct = Math.max(0, Math.min(1, max > 0 ? value / max : 0)) * 100;
  return (
    <div style={{ height: h, borderRadius: 999, background: track, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 999, transition: "width .5s ease" }} />
    </div>
  );
}

function MacroRow({ label, value, target, unit, color }) {
  return (
    <div className="mb-2.5">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-[13px] font-semibold" style={{ color: "var(--ink-soft)" }}>{label}</span>
        <span className="font-mono text-[12.5px]" style={{ color: "var(--ink)" }}>
          <b>{round(value)}</b><span style={{ color: "var(--ink-faint)" }}> / {round(target)}{unit}</span>
        </span>
      </div>
      <Bar value={value} max={target} color={color} />
    </div>
  );
}

function RingLegend({ color, label, value, target, unit }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <span className="flex items-center gap-1.5 text-[12.5px] font-semibold" style={{ color: "var(--ink-soft)" }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: color, flexShrink: 0 }} />{label}
      </span>
      <span className="font-mono text-[12.5px]"><b>{round(value)}</b><span style={{ color: "var(--ink-faint)" }}>/{round(target)}{unit}</span></span>
    </div>
  );
}

function PrefBadge({ level, size = "sm", note }) {
  const meta = PREF_META[level] || PREF_META.neutral;
  return (
    <span className="pref-pill" title={note || meta.label}
      style={{ color: meta.color, background: meta.bg, fontSize: size === "sm" ? 10.5 : 11.5 }}>
      {meta.label}
    </span>
  );
}

function PrefSelector({ level, onChange, compact }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {PREF_LEVELS.map((lv) => {
        const meta = PREF_META[lv];
        const active = level === lv;
        return (
          <button key={lv} onClick={() => onChange(lv)} className="tap"
            style={{
              fontSize: compact ? 10 : 11, fontWeight: 700, padding: compact ? "3px 7px" : "5px 10px",
              borderRadius: 999, border: `1.3px solid ${active ? meta.color : "var(--line)"}`,
              background: active ? meta.bg : "transparent", color: active ? meta.color : "var(--ink-faint)",
            }}>
            {compact ? meta.label.split(" ")[0] : meta.label}
          </button>
        );
      })}
    </div>
  );
}

function CategoryTag({ category, metaOverride }) {
  const meta = metaOverride || CATEGORY_META[category];
  if (!meta) return null;
  const Icon = meta.icon;
  return (
    <span className="chip inline-flex items-center gap-1" style={{ background: meta.bg, borderColor: "transparent", color: meta.color }}>
      <Icon size={11} strokeWidth={2.5} /> {meta.label}
    </span>
  );
}

function PersonToggle({ value, onChange, includeHousehold, small }) {
  const opts = includeHousehold ? [PEOPLE.tyler, PEOPLE.elizabeth, { id: "household", name: "Household" }] : [PEOPLE.tyler, PEOPLE.elizabeth];
  const active = opts.find((o) => o.id === value);
  return (
    <div className="seg-wrap" style={{ width: "100%" }}>
      {opts.map((p) => {
        const on = value === p.id;
        return (
          <button key={p.id} onClick={() => onChange(p.id)} className={`tap seg-btn ${on ? "seg-btn-on" : "seg-btn-off"}`}
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: small ? "5px 8px" : "7px 8px" }}>
            {p.accent && <span style={{ width: 7, height: 7, borderRadius: 999, background: on ? p.accent : "transparent", flexShrink: 0 }} />}
            {p.name}
          </button>
        );
      })}
    </div>
  );
}

function BigButton({ icon: Icon, label, onClick, variant = "ghost", sub }) {
  return (
    <button onClick={onClick} className={`tap ${variant === "primary" ? "btn-primary" : "btn-ghost"}`}
      style={{ padding: "13px 14px", display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left" }}>
      {Icon && <Icon size={18} strokeWidth={2.2} style={{ flexShrink: 0 }} />}
      <span style={{ flex: 1 }}>
        <div className="font-semibold text-[14px] leading-tight">{label}</div>
        {sub && <div className="text-[11.5px] leading-tight" style={{ opacity: .7, marginTop: 2 }}>{sub}</div>}
      </span>
      <ChevronRight size={16} style={{ opacity: .5, flexShrink: 0 }} />
    </button>
  );
}

function Sheet({ title, onClose, children, footer }) {
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prevOverflow; };
  }, []);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "flex-end", overscrollBehavior: "contain" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.38)", touchAction: "none" }} />
      <div className="card" style={{
        position: "relative", width: "100%", maxHeight: "88vh", borderRadius: "22px 22px 0 0",
        display: "flex", flexDirection: "column", animation: "none", overscrollBehavior: "contain",
      }}>
        <div className="flex items-center justify-between px-5 pt-4 pb-3" style={{ borderBottom: "1px solid var(--line-soft)" }}>
          <h2 className="font-display font-bold text-[19px]">{title}</h2>
          <button onClick={onClose} className="tap" style={{ padding: 6, borderRadius: 999, background: "var(--paper)" }}>
            <X size={17} />
          </button>
        </div>
        <div style={{ overflowY: "auto", padding: "16px 20px 20px", overscrollBehavior: "contain" }}>{children}</div>
        {footer && <div style={{ borderTop: "1px solid var(--line-soft)", padding: "12px 20px 18px" }}>{footer}</div>}
      </div>
    </div>
  );
}

function EmptyNote({ children }) {
  return <div className="text-[13px] text-center py-6" style={{ color: "var(--ink-faint)" }}>{children}</div>;
}

/* =============================== NAV =============================== */

const NAV_ITEMS = [
  { key: "home", label: "Home", icon: HomeIcon },
  { key: "week", label: "Week", icon: CalendarDays },
  { key: "meals", label: "Meals", icon: UtensilsCrossed },
  { key: "groceries", label: "Groceries", icon: ShoppingCart },
  { key: "profile", label: "Profile", icon: User },
];

function BottomNav({ active, onChange }) {
  return (
    <div style={{
      position: "sticky", bottom: 0, left: 0, right: 0,
      background: "rgba(249,249,251,.92)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      display: "flex", padding: "6px 6px calc(6px + env(safe-area-inset-bottom))",
      borderTop: "0.5px solid rgba(60,60,67,.18)", zIndex: 40,
    }}>
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const on = active === item.key;
        return (
          <button key={item.key} onClick={() => onChange(item.key)} className="tap"
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "6px 2px" }}>
            <Icon size={22} strokeWidth={on ? 2.1 : 1.7} color={on ? "#0A84FF" : "#8E8E93"} />
            <span style={{ fontSize: 10, fontWeight: on ? 600 : 500, color: on ? "#0A84FF" : "#8E8E93" }}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function ScreenHeader({ eyebrow, title, right }) {
  return (
    <div className="flex items-start justify-between px-5 pt-6 pb-4">
      <div>
        {eyebrow && <div className="text-[12px] font-semibold tracking-wide" style={{ color: "var(--ink-faint)" }}>{eyebrow}</div>}
        <h1 className="font-display font-bold" style={{ fontSize: 26, lineHeight: 1.08, marginTop: 2 }}>{title}</h1>
      </div>
      {right}
    </div>
  );
}

/* ============================== HOME SCREEN =============================== */

function greetingWord() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function TimeEditor({ t12, onSave }) {
  const [editing, setEditing] = useState(false);
  if (editing) {
    return (
      <input type="time" autoFocus defaultValue={to24(t12)}
        onBlur={(e) => { if (e.target.value) onSave(e.target.value); setEditing(false); }}
        onChange={(e) => { if (e.target.value) onSave(e.target.value); }}
        onClick={(e) => e.stopPropagation()}
        style={{ width: 96, fontSize: 11, border: "1px solid var(--line)", borderRadius: 6, padding: "2px 4px", background: "var(--paper-2)", color: "var(--ink)" }} />
    );
  }
  return (
    <button onClick={(e) => { e.stopPropagation(); setEditing(true); }} className="tap font-mono text-[11px]"
      style={{ width: 54, flexShrink: 0, textAlign: "left", color: "var(--ink-faint)" }}>
      {t12}
    </button>
  );
}

function WorkoutDayBadge({ iso, day, personId, profile, workoutOverrides, setWorkoutOverride, showName, compact }) {
  const [open, setOpen] = useState(false);
  const workoutOn = effectiveIsWorkout(iso, personId, profile, workoutOverrides);
  const isOverridden = workoutOverrides?.[iso]?.[personId] != null;
  const usualDefault = profile.workoutDays.includes(weekdayKeyOf(iso));
  return (
    <>
      <button onClick={() => setOpen(true)} className="tap"
        style={{ color: workoutOn ? "var(--brick)" : "var(--sage)", fontWeight: 700, fontSize: compact ? 11 : "inherit" }}>
        {showName && <span style={{ color: PEOPLE[personId].accent }}>{PEOPLE[personId].name}: </span>}
        • {workoutOn ? "Workout Day" : "Recovery Day"}{isOverridden && " ✎"}
      </button>
      {open && (
        <Sheet title={`${PEOPLE[personId].name} — ${formatDateShort(iso)}`} onClose={() => setOpen(false)}>
          <div className="text-[12.5px] mb-4" style={{ color: "var(--ink-faint)" }}>
            This changes only {formatDateHeader(iso)} for {PEOPLE[personId].name} — every other {day.label} keeps following their usual weekly schedule (set in Profile).
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={() => { setWorkoutOverride(iso, personId, true); setOpen(false); }} className="tap text-left p-3.5 rounded-2xl flex items-center gap-2.5"
              style={{ border: `1.5px solid ${workoutOn ? "var(--brick)" : "var(--line)"}`, background: workoutOn ? "var(--brick-soft)" : "transparent" }}>
              <Dumbbell size={16} color="var(--brick)" /><span className="font-semibold text-[13.5px]">Workout Day</span>
            </button>
            <button onClick={() => { setWorkoutOverride(iso, personId, false); setOpen(false); }} className="tap text-left p-3.5 rounded-2xl flex items-center gap-2.5"
              style={{ border: `1.5px solid ${!workoutOn ? "var(--sage)" : "var(--line)"}`, background: !workoutOn ? "var(--sage-soft)" : "transparent" }}>
              <Moon size={16} color="var(--sage)" /><span className="font-semibold text-[13.5px]">Recovery Day</span>
            </button>
          </div>
          {isOverridden && (
            <button onClick={() => { setWorkoutOverride(iso, personId, null); setOpen(false); }} className="tap text-[12.5px] font-semibold mt-3.5" style={{ color: "var(--blue)" }}>
              Reset to {PEOPLE[personId].name}'s usual schedule ({usualDefault ? "Workout" : "Recovery"})
            </button>
          )}
        </Sheet>
      )}
    </>
  );
}

function DateNavigator({ viewDate, setViewDate }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const isToday = viewDate === todayISO();
  return (
    <div className="flex items-center justify-between mt-3">
      <button onClick={() => setViewDate(addDays(viewDate, -1))} className="tap" style={{ padding: 6, borderRadius: 999, background: "var(--paper-3)" }}>
        <ChevronLeft size={16} />
      </button>
      <button onClick={() => setPickerOpen(true)} className="tap flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "var(--paper-3)" }}>
        <Calendar size={13} style={{ color: "var(--ink-faint)" }} />
        <span className="text-[13px] font-semibold">{isToday ? "Today" : formatDateShort(viewDate)}</span>
      </button>
      <button onClick={() => setViewDate(addDays(viewDate, 1))} className="tap" style={{ padding: 6, borderRadius: 999, background: "var(--paper-3)" }}>
        <ChevronRight size={16} />
      </button>
      {!isToday && (
        <button onClick={() => setViewDate(todayISO())} className="tap text-[12px] font-semibold" style={{ color: "var(--blue)", marginLeft: 6 }}>Jump to Today</button>
      )}
      {pickerOpen && (
        <Sheet title="Jump to Date" onClose={() => setPickerOpen(false)}>
          <input type="date" autoFocus defaultValue={viewDate}
            onChange={(e) => { if (e.target.value) { setViewDate(e.target.value); setPickerOpen(false); } }}
            className="input" style={{ fontSize: 16, padding: 12 }} />
          <div className="flex gap-2 mt-4">
            <button onClick={() => { setViewDate(todayISO()); setPickerOpen(false); }} className="tap chip">Today</button>
            <button onClick={() => { setViewDate(addDays(todayISO(), -7)); setPickerOpen(false); }} className="tap chip">1 week ago</button>
            <button onClick={() => { setViewDate(addMonths(todayISO(), -1)); setPickerOpen(false); }} className="tap chip">1 month ago</button>
          </div>
        </Sheet>
      )}
    </div>
  );
}

function HomeScreen({ person, setPerson, viewDate, setViewDate, foodsById, mealsMap, prefs, profile, overrides, locks, foodLog, toggleEaten,
  removeLogEntry, water, addWater, setWaterTotal, timeOverrides, setTimeOverride, workoutOverrides, setWorkoutOverride, routine, onOpenModal, onNavigate, onOpenMeal }) {
  const weekday = weekdayKeyOf(viewDate);
  const day = WEEK_DAYS.find((d) => d.key === weekday) || WEEK_DAYS[0];
  const isToday = viewDate === todayISO();
  const workoutOn = effectiveIsWorkout(viewDate, person, profile, workoutOverrides);
  const gymAnchor = gymAnchorSlotKey(day);
  const nowM = nowMinutes();
  const entries = foodLog?.[viewDate]?.[person] || [];
  const entrySlotKeys = new Set(entries.map((e) => e.slotKey).filter(Boolean));

  const eatenTotals = useMemo(() => entries.reduce((t, e) => ({
    cal: t.cal + e.cal, p: t.p + e.p, c: t.c + e.c, f: t.f + e.f, fiber: t.fiber + (e.fiber || 0),
  }), { cal: 0, p: 0, c: 0, f: 0, fiber: 0 }), [entries]);

  const targetWater = profile.waterTarget;
  const gotWater = water?.[viewDate]?.[person] || 0;
  const [customWater, setCustomWater] = useState("");
  const [editingWater, setEditingWater] = useState(false);

  const remaining = {
    cal: Math.max(0, profile.calorieTarget - eatenTotals.cal),
    p: Math.max(0, profile.proteinTarget - eatenTotals.p),
    c: Math.max(0, profile.carbTarget - eatenTotals.c),
    f: Math.max(0, profile.fatTarget - eatenTotals.f),
  };

  const gymTimeToday = effectiveTime(viewDate, "gym", profile.workoutTime || day.gymTime || "7:00 PM", timeOverrides);
  const nextSlot = isToday ? day.slots.find((slot) => !entrySlotKeys.has(slot.key)) : null;
  let gymMinutesAway = null;
  if (isToday && workoutOn && gymTimeToday) gymMinutesAway = timeToMinutes(gymTimeToday) - nowM;

  const nextMeal = nextSlot ? mealsMap[resolveMealId(day.key, nextSlot.key, person, nextSlot, overrides)] : null;
  const nextNutrition = nextMeal ? computeItemsNutrition(nextMeal.items, foodsById) : null;
  const isPreworkoutNext = workoutOn && nextSlot?.key === gymAnchor;

  // digit-aware sizing so the ring's center label always fits within the innermost circle
  const calDigits = String(round(eatenTotals.cal)).length;
  const calFontSize = calDigits >= 4 ? 17 : calDigits === 3 ? 19 : 21;

  const timelineLabel = isToday ? "Today's Timeline" : `${formatDateShort(viewDate)} Timeline`;
  const logLabel = isToday ? "Eaten Today" : `Eaten on ${formatDateShort(viewDate)}`;

  return (
    <div>
      <div className="px-5 pt-5 pb-0"><TropheLockup iconSize={52} wordmarkSize={22} align="left" /></div>
      <div className="px-5 pt-3 pb-3">
        <div className="text-[13px] font-semibold" style={{ color: "var(--ink-faint)" }}>
          {isToday ? `${greetingWord()}, ${PEOPLE[person].name}` : `Viewing a past or future day, ${PEOPLE[person].name}`}
        </div>
        <h1 className="font-display font-bold" style={{ fontSize: 25, marginTop: 2 }}>
          {formatDateHeader(viewDate)} <WorkoutDayBadge iso={viewDate} day={day} personId={person} profile={profile} workoutOverrides={workoutOverrides} setWorkoutOverride={setWorkoutOverride} />
        </h1>
        <DateNavigator viewDate={viewDate} setViewDate={setViewDate} />
        <div className="mt-3"><PersonToggle value={person} onChange={setPerson} /></div>
        {isToday && routine && (() => {
          const tags = [];
          if (weekday === routine.planDay) tags.push({ label: "Plan Day", color: "var(--blue)", icon: Calendar, onClick: () => onNavigate("week") });
          if (weekday === routine.shopDay) tags.push({ label: "Shopping Day", color: "var(--mustard)", icon: ShoppingCart, onClick: () => onNavigate("groceries") });
          if (routine.cookStyle === "prep" && weekday === routine.prepDay) tags.push({ label: "Meal Prep Day", color: "var(--brick)", icon: ChefHat, onClick: () => onNavigate("meals") });
          if (!tags.length) return null;
          return (
            <div className="scrollx flex gap-1.5 mt-3">
              {tags.map((t) => (
                <button key={t.label} onClick={t.onClick} className="tap chip inline-flex items-center gap-1" style={{ whiteSpace: "nowrap", background: t.color + "22", borderColor: "transparent", color: t.color, fontWeight: 700 }}>
                  <t.icon size={11} /> Today's {t.label}
                </button>
              ))}
            </div>
          );
        })()}
      </div>

      {/* Main nutrition card — Apple-Activity-style concentric rings */}
      <div className="px-5 mt-2">
        <div className="card p-5">
          <div className="flex items-center gap-5 mb-4">
            <div style={{ position: "relative", width: 168, height: 168, flexShrink: 0 }}>
              <ActivityRings stroke={13} gap={3} rings={[
                { label: "Calories", value: eatenTotals.cal, max: profile.calorieTarget, color: "var(--brick)" },
                { label: "Protein", value: eatenTotals.p, max: profile.proteinTarget, color: "var(--sage)" },
                { label: "Carbs", value: eatenTotals.c, max: profile.carbTarget, color: "var(--blue)" },
              ]} />
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div className="text-center" style={{ width: 76, lineHeight: 1.15 }}>
                  <div className="font-mono font-bold" style={{ fontSize: calFontSize, whiteSpace: "nowrap" }}>{round(eatenTotals.cal)}</div>
                  <div className="text-[10px]" style={{ color: "var(--ink-faint)", whiteSpace: "nowrap" }}>of {profile.calorieTarget} cal</div>
                </div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <RingLegend color="var(--brick)" label="Calories" value={eatenTotals.cal} target={profile.calorieTarget} unit="" />
              <RingLegend color="var(--sage)" label="Protein" value={eatenTotals.p} target={profile.proteinTarget} unit="g" />
              <RingLegend color="var(--blue)" label="Carbs" value={eatenTotals.c} target={profile.carbTarget} unit="g" />
              <MacroRow label="Fat" value={eatenTotals.f} target={profile.fatTarget} unit="g" color="var(--plum)" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <MacroRow label="Fiber" value={eatenTotals.fiber} target={profile.fiberTarget} unit="g" color="var(--steel)" />
            </div>
            <div>
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-[13px] font-semibold flex items-center gap-1" style={{ color: "var(--ink-soft)" }}><Droplet size={12} /> Hydration</span>
                {editingWater ? (
                  <input type="number" autoFocus defaultValue={gotWater}
                    onBlur={(e) => { setWaterTotal(viewDate, person, Math.max(0, Number(e.target.value) || 0)); setEditingWater(false); }}
                    onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
                    className="font-mono text-[12.5px] text-right" style={{ width: 46, border: "1px solid var(--line)", borderRadius: 6, padding: "1px 4px" }} />
                ) : (
                  <button onClick={() => setEditingWater(true)} className="tap font-mono text-[12.5px]">
                    <b>{gotWater}</b><span style={{ color: "var(--ink-faint)" }}> / {targetWater} oz</span>
                  </button>
                )}
              </div>
              <Bar value={gotWater} max={targetWater} color="var(--steel)" />
              <div className="flex gap-1.5 mt-1.5 items-center">
                {[8,16].map((oz) => (
                  <button key={oz} onClick={() => addWater(viewDate, person, oz)} className="tap chip">+{oz}oz</button>
                ))}
                <input type="number" value={customWater} onChange={(e) => setCustomWater(e.target.value)} placeholder="oz"
                  className="font-mono text-[11px]" style={{ width: 42, border: "1px solid var(--line)", borderRadius: 8, padding: "3px 5px" }} />
                <button onClick={() => { const v = Number(customWater); if (v) { addWater(viewDate, person, v); setCustomWater(""); } }}
                  className="tap chip" style={{ padding: "5px 8px" }}><Plus size={11} /></button>
              </div>
            </div>
          </div>
          <div className="divider mt-4 pt-3 flex justify-between text-[12.5px]">
            <span style={{ color: "var(--ink-faint)" }}>Remaining {isToday ? "today" : "that day"}</span>
            <span className="font-mono font-semibold">{round(remaining.cal)} cal · {round(remaining.p)}g P · {round(remaining.c)}g C · {round(remaining.f)}g F</span>
          </div>
        </div>
      </div>

      {/* Next up card — only meaningful for today, since it's a live countdown */}
      {isToday && nextMeal && (
        <div className="px-5 mt-4">
          <div className="card p-5" style={{ borderColor: "var(--brick)", borderWidth: 1.5 }}>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={13} color="var(--brick)" />
              <span className="text-[11px] font-bold tracking-wide" style={{ color: "var(--brick)" }}>NEXT UP</span>
            </div>
            <h3 className="font-display font-bold text-[20px] leading-tight">
              {isPreworkoutNext ? "Pre-Workout Fuel" : nextMeal.name}
            </h3>
            <div className="text-[12.5px] mt-1" style={{ color: "var(--ink-soft)" }}>
              {isPreworkoutNext && gymMinutesAway != null
                ? gymMinutesAway > 0 ? `Workout in ${gymMinutesAway} minutes` : "Workout time"
                : `${effectiveSlotLabel(day, nextSlot, workoutOn)} · ${effectiveTime(viewDate, nextSlot.key, nextSlot.time, timeOverrides)}`}
            </div>
            {isPreworkoutNext && <div className="text-[12.5px] mt-2" style={{ color: "var(--ink-faint)" }}>Recommended: <b style={{ color: "var(--ink)" }}>{nextMeal.name}</b></div>}
            <div className="font-mono text-[12.5px] mt-2" style={{ color: "var(--ink)" }}>
              {round(nextNutrition.cal)} cal · {round(nextNutrition.c)}g carbs · {round(nextNutrition.p)}g protein
            </div>
            <div className="flex gap-2 mt-3.5">
              <button onClick={() => toggleEaten(viewDate, person, nextSlot.key, nextMeal)} className="tap btn-primary" style={{ flex: 1, padding: "10px 0", fontSize: 13.5 }}>Add to Today</button>
              <button onClick={() => onNavigate("week")} className="tap btn-ghost" style={{ padding: "10px 14px", fontSize: 13.5 }}>Show Other Options</button>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="px-5 mt-5">
        <h3 className="font-display font-bold text-[16px] mb-2.5">{timelineLabel}</h3>
        <div className="text-[11.5px] mb-2" style={{ color: "var(--ink-faint)" }}>Tap a time to edit it — edits only apply to {isToday ? "today" : formatDateShort(viewDate)}.</div>
        <div className="card p-3">
          {day.slots.map((slot, i) => {
            const mealId = resolveMealId(day.key, slot.key, person, slot, overrides);
            const meal = mealsMap[mealId];
            const done = entrySlotKeys.has(slot.key);
            const meta = effectiveSlotMeta(day, slot, workoutOn);
            const slotTime = effectiveTime(viewDate, slot.key, slot.time, timeOverrides);
            return (
              <React.Fragment key={slot.key}>
                <div className="tap flex items-center gap-3 py-2.5" onClick={() => onOpenMeal(meal, slot, day)}>
                  <TimeEditor t12={slotTime} onSave={(v24) => setTimeOverride(viewDate, slot.key, v24)} />
                  <button onClick={(e) => { e.stopPropagation(); toggleEaten(viewDate, person, slot.key, meal); }}
                    className="tap" style={{
                      width: 22, height: 22, borderRadius: 999, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                      border: `1.5px solid ${done ? meta.color : "var(--line)"}`, background: done ? meta.color : "transparent",
                    }}>
                    {done && <Check size={13} color="#fff" strokeWidth={3} />}
                  </button>
                  <div style={{ flex: 1, opacity: done ? .55 : 1 }}>
                    <div className="text-[13.5px] font-semibold leading-tight" style={{ textDecoration: done ? "line-through" : "none" }}>{meal?.name}</div>
                    <div className="text-[11px]" style={{ color: meta.color }}>{meta.label}</div>
                  </div>
                  <ChevronRight size={15} style={{ opacity: .35 }} />
                </div>
                {workoutOn && slot.key === gymAnchor && (
                  <div className="flex items-center gap-3 py-2.5" style={{ background: "var(--ink)", margin: "0 -12px", padding: "10px 12px", borderRadius: 10 }}>
                    <input type="time" defaultValue={to24(gymTimeToday)} onClick={(e) => e.stopPropagation()}
                      onChange={(e) => { if (e.target.value) setTimeOverride(viewDate, "gym", e.target.value); }}
                      style={{ width: 90, flexShrink: 0, fontSize: 11, background: "rgba(255,255,255,.12)", color: "#fff", border: "none", borderRadius: 6, padding: "2px 4px" }} className="font-mono" />
                    <Dumbbell size={16} color="#FF9F0A" />
                    <div className="text-[13.5px] font-semibold" style={{ color: "#fff" }}>Gym</div>
                  </div>
                )}
                {i < day.slots.length - 1 && <div className="divider" />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Eaten log — everything actually logged that day, plan or off-plan */}
      <div className="px-5 mt-5">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="font-display font-bold text-[16px]">{logLabel}</h3>
          <button onClick={() => onOpenModal("logFood")} className="tap text-[13px] font-semibold" style={{ color: "var(--blue)" }}>+ Log Food</button>
        </div>
        <div className="card p-3">
          {entries.length === 0 && <EmptyNote>Nothing logged for this day yet — tap a timeline item or "Log Food" to add something.</EmptyNote>}
          {entries.map((e, i) => (
            <React.Fragment key={e.id}>
              <div className="flex items-center gap-3 py-2.5">
                <div style={{ width: 54, flexShrink: 0, color: "var(--ink-faint)" }} className="font-mono text-[11px]">{e.time}</div>
                <div style={{ flex: 1 }}>
                  <div className="text-[13.5px] font-semibold leading-tight">{e.label}</div>
                  <div className="font-mono text-[11px] mt-0.5" style={{ color: "var(--ink-soft)" }}>{round(e.cal)} cal · {round(e.p)}g P · {round(e.c)}g C · {round(e.f)}g F</div>
                </div>
                <button onClick={() => removeLogEntry(viewDate, person, e.id)} className="tap" style={{ padding: 5 }}>
                  <X size={14} color="var(--ink-faint)" />
                </button>
              </div>
              {i < entries.length - 1 && <div className="divider" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-5 mt-5 mb-6">
        <h3 className="font-display font-bold text-[16px] mb-2.5">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2.5">
          <BigButton icon={RefreshCw} label="Generate My Week" onClick={() => onNavigate("week")} />
          <BigButton icon={ShoppingBag} label="Build Grocery Order" onClick={() => onNavigate("groceries")} />
          <BigButton icon={Plus} label="Log Food" onClick={() => onOpenModal("logFood")} />
          <BigButton icon={Package} label="Add Food to Pantry" onClick={() => onOpenModal("addFood")} />
          <BigButton icon={Zap} label="I Need a Snack" onClick={() => onOpenModal("snack")} />
          <BigButton icon={Utensils} label="Eating Out Tonight" onClick={() => onOpenModal("restaurant")} />
          <BigButton icon={Battery} label="Energy Check-In" onClick={() => onOpenModal("gym")} />
          <BigButton icon={TrendingUp} label="See Trends" onClick={() => onNavigate("progress")} />
        </div>
      </div>
    </div>
  );
}

/* ============================== WEEK SCREEN ================================ */

function DaySlotRow({ iso, day, slot, person, mealsMap, foodsById, locks, toggleLock, onView, onSwap, household, timeOverrides, workoutOn }) {
  const meta = effectiveSlotMeta(day, slot, workoutOn);
  const slotTime = effectiveTime(iso, slot.key, slot.time, timeOverrides);
  const renderFor = (personId) => {
    const mealId = typeof slot.meal === "string" ? slot.meal : slot.meal[personId];
    const meal = mealsMap[mealId];
    if (!meal) return null;
    const n = computeItemsNutrition(meal.items, foodsById);
    const locked = isLocked(day.key, slot.key, locks);
    return (
      <div key={personId} className="p-3 rounded-2xl mb-2" style={{ background: "var(--paper)", border: "1px solid var(--line-soft)" }}>
        <div className="flex items-center justify-between mb-1">
          <CategoryTag metaOverride={meta} />
          <div className="flex items-center gap-2">
            {household && <span className="text-[10.5px] font-bold" style={{ color: PEOPLE[personId].accent }}>{PEOPLE[personId].name}</span>}
            <span className="text-[10.5px] font-mono" style={{ color: "var(--ink-faint)" }}>{slotTime}</span>
          </div>
        </div>
        <div className="font-display font-semibold text-[15px] leading-tight">{meal.name}</div>
        <div className="font-mono text-[11.5px] mt-1" style={{ color: "var(--ink-soft)" }}>
          {round(n.cal)} cal · {round(n.p)}g P · {round(n.c)}g C · {round(n.f)}g F
        </div>
        <div className="flex gap-1.5 mt-2.5">
          <button onClick={() => onView(meal, slot, day, personId)} className="tap chip">View</button>
          <button onClick={() => onSwap(day, slot, personId)} className="tap chip">Swap</button>
          <button onClick={() => toggleLock(day.key, slot.key)} className="tap chip inline-flex items-center gap-1"
            style={locked ? { background: "var(--sage)", color: "#fff", borderColor: "var(--sage)" } : {}}>
            {locked ? <Lock size={10} /> : <Unlock size={10} />} {locked ? "Locked" : "Lock"}
          </button>
        </div>
      </div>
    );
  };
  const sameMeal = typeof slot.meal === "string" || slot.meal.tyler === slot.meal.elizabeth;
  if (!household) return renderFor(person);
  return sameMeal ? renderFor("tyler") : (<>{renderFor("tyler")}{renderFor("elizabeth")}</>);
}

function DayCard({ iso, day, person, profiles, mealsMap, foodsById, locks, toggleLock, onView, onSwap, household, defaultOpen, timeOverrides, workoutOverrides, setWorkoutOverride }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const activeProfile = household ? null : profiles[person];
  const workoutOn = household
    ? householdIsWorkout(iso, profiles, workoutOverrides)
    : effectiveIsWorkout(iso, person, activeProfile, workoutOverrides);
  const gymTime = effectiveTime(iso, "gym", (household ? profiles.tyler.workoutTime : activeProfile.workoutTime) || day.gymTime || "7:00 PM", timeOverrides);
  const isToday = iso === todayISO();
  return (
    <div className="card mb-3 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3.5" style={{ background: workoutOn ? "var(--brick-soft)" : "var(--sage-soft)" }}>
        <div className="tap flex items-center gap-2.5" onClick={() => setOpen(!open)} style={{ flex: 1 }}>
          <div>
            <div className="font-display font-bold text-[16px]">{day.label} {isToday && <span style={{ color: "var(--blue)" }}>· Today</span>}</div>
            <div className="font-mono text-[10.5px]" style={{ color: "var(--ink-faint)" }}>{formatDateShort(iso)}</div>
          </div>
          {!household && (workoutOn
            ? <span className="text-[11px] font-bold inline-flex items-center gap-1" style={{ color: "var(--brick)" }}><Dumbbell size={12} /> Workout · {gymTime}</span>
            : <span className="text-[11px] font-bold inline-flex items-center gap-1" style={{ color: "var(--sage)" }}><Moon size={12} /> Recovery</span>)}
        </div>
        {household ? (
          <div className="flex flex-col items-end gap-1" style={{ flexShrink: 0 }}>
            <WorkoutDayBadge iso={iso} day={day} personId="tyler" profile={profiles.tyler} workoutOverrides={workoutOverrides} setWorkoutOverride={setWorkoutOverride} showName compact />
            <WorkoutDayBadge iso={iso} day={day} personId="elizabeth" profile={profiles.elizabeth} workoutOverrides={workoutOverrides} setWorkoutOverride={setWorkoutOverride} showName compact />
          </div>
        ) : (
          <WorkoutDayBadge iso={iso} day={day} personId={person} profile={activeProfile} workoutOverrides={workoutOverrides} setWorkoutOverride={setWorkoutOverride} />
        )}
        <ChevronRight size={16} onClick={() => setOpen(!open)} className="tap" style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform .15s", marginLeft: 6 }} />
      </div>
      {open && (
        <div className="p-3">
          {day.slots.map((slot) => (
            <DaySlotRow key={slot.key} iso={iso} day={day} slot={slot} person={person} mealsMap={mealsMap} foodsById={foodsById}
              locks={locks} toggleLock={toggleLock} onView={onView} onSwap={onSwap} household={household} timeOverrides={timeOverrides} workoutOn={workoutOn} />
          ))}
        </div>
      )}
    </div>
  );
}

function WeekScreen({ person, setPerson, mealsMap, foodsById, prefs, overrides, locks, toggleLock, applySwap, onView, onGenerate, timeOverrides, workoutOverrides, setWorkoutOverride, profiles, favorites, toggleFavorite }) {
  const household = person === "household";
  const [weekStart, setWeekStart] = useState(startOfWeek(todayISO()));
  const [swapFor, setSwapFor] = useState(null); // {day, slot, personId}
  const [swapQuery, setSwapQuery] = useState("");
  const [confirmGen, setConfirmGen] = useState(false);
  const [genMode, setGenMode] = useState("strict");

  const weekLabel = `${formatDateShort(weekStart)} – ${formatDateShort(addDays(weekStart, 6))}`;
  const isCurrentWeek = weekStart === startOfWeek(todayISO());

  const openSwap = (day, slot, personId) => { setSwapFor({ day, slot, personId }); setSwapQuery(""); };
  const doSwap = (mealId) => {
    applySwap(swapFor.day.key, swapFor.slot.key, swapFor.personId, mealId);
    setSwapFor(null);
  };
  const swapCandidates = useMemo(() => {
    if (!swapFor) return [];
    let list = Object.values(mealsMap).filter((m) => m.category === swapFor.slot.category && (m.people === "both" || m.people === swapFor.personId));
    if (swapQuery.trim()) list = list.filter((m) => m.name.toLowerCase().includes(swapQuery.toLowerCase()));
    return list.sort((a, b) => {
      const fa = favorites.includes(a.id) ? 0 : 1, fb = favorites.includes(b.id) ? 0 : 1;
      return fa !== fb ? fa - fb : a.name.localeCompare(b.name);
    });
  }, [swapFor, swapQuery, mealsMap, favorites]);

  return (
    <div>
      <ScreenHeader eyebrow={weekLabel} title="Weekly Plan" />
      <div className="px-5 -mt-1 mb-3 flex items-center justify-between">
        <button onClick={() => setWeekStart(addDays(weekStart, -7))} className="tap" style={{ padding: 6, borderRadius: 999, background: "var(--paper-3)" }}><ChevronLeft size={16} /></button>
        <span className="text-[12.5px] font-semibold" style={{ color: "var(--ink-soft)" }}>{isCurrentWeek ? "This week" : weekLabel}</span>
        <button onClick={() => setWeekStart(addDays(weekStart, 7))} className="tap" style={{ padding: 6, borderRadius: 999, background: "var(--paper-3)" }}><ChevronRight size={16} /></button>
      </div>
      {!isCurrentWeek && (
        <div className="px-5 mb-3"><button onClick={() => setWeekStart(startOfWeek(todayISO()))} className="tap text-[12.5px] font-semibold" style={{ color: "var(--blue)" }}>Jump to this week</button></div>
      )}
      <div className="px-5 -mt-1 mb-4"><PersonToggle value={person} onChange={setPerson} includeHousehold /></div>

      <div className="px-5 mb-4">
        <button onClick={() => setConfirmGen(true)} className="tap btn-primary w-full flex items-center justify-center gap-2" style={{ padding: "14px 0" }}>
          <RefreshCw size={16} /> Generate My Week
        </button>
      </div>

      <div className="px-5 pb-6">
        {WEEK_DAYS.map((day, i) => {
          const iso = addDays(weekStart, i);
          return (
            <DayCard key={day.key} iso={iso} day={day} person={person} profiles={profiles} mealsMap={mealsMap} foodsById={foodsById}
              locks={locks} toggleLock={toggleLock} onView={(meal, slot, d, personId) => onView(meal, slot, d, iso, personId)} onSwap={openSwap} household={household}
              defaultOpen={iso === todayISO()} timeOverrides={timeOverrides} workoutOverrides={workoutOverrides} setWorkoutOverride={setWorkoutOverride} />
          );
        })}
      </div>

      {swapFor && (
        <Sheet title={`Swap ${CATEGORY_META[swapFor.slot.category].label}`} onClose={() => setSwapFor(null)}>
          <div className="text-[12.5px] mb-3" style={{ color: "var(--ink-faint)" }}>
            Choose a replacement for {PEOPLE[swapFor.personId].name} on {swapFor.day.label}. This updates every {swapFor.day.label}, not just this week.
            Every {CATEGORY_META[swapFor.slot.category].label.toLowerCase()} meal in your Meal Library is available here — <Heart size={10} style={{ display: "inline", verticalAlign: -1 }} fill="var(--brick)" color="var(--brick)" /> favorited ones float to the top.
            Want to add a brand-new option to this list? Favorite it from Meals → Recipes and it'll show up here automatically.
          </div>
          <div className="flex items-center gap-2 flex-1 px-3 rounded-2xl mb-3" style={{ background: "var(--paper-3)" }}>
            <Search size={14} style={{ color: "var(--ink-faint)" }} />
            <input value={swapQuery} onChange={(e) => setSwapQuery(e.target.value)} placeholder="Search…" className="input" style={{ border: "none", padding: "9px 0", background: "transparent" }} />
          </div>
          {swapCandidates.length === 0 && <EmptyNote>No meals match that search.</EmptyNote>}
          {swapCandidates.map((m) => {
            const n = computeItemsNutrition(m.items, foodsById);
            const lvl = getPref(prefs, m.items[0]?.food, swapFor.personId).level;
            const isFav = favorites.includes(m.id);
            return (
              <button key={m.id} onClick={() => doSwap(m.id)} className="tap w-full text-left p-3 rounded-2xl mb-2"
                style={{ background: "var(--paper)", border: "1px solid var(--line-soft)" }}>
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-[14px] inline-flex items-center gap-1.5">
                    {isFav && <Heart size={12} fill="var(--brick)" color="var(--brick)" />} {m.name}
                  </div>
                  <PrefBadge level={lvl} />
                </div>
                <div className="font-mono text-[11.5px] mt-1" style={{ color: "var(--ink-soft)" }}>
                  {round(n.cal)} cal · {round(n.p)}g P · {round(n.c)}g C · {round(n.f)}g F
                </div>
              </button>
            );
          })}
        </Sheet>
      )}

      {confirmGen && (
        <Sheet title="Generate My Week" onClose={() => setConfirmGen(false)}
          footer={
            <div className="flex gap-2">
              <button onClick={() => setConfirmGen(false)} className="tap btn-ghost" style={{ flex: 1, padding: "12px 0" }}>Cancel</button>
              <button onClick={() => { onGenerate(genMode); setConfirmGen(false); }} className="tap btn-primary" style={{ flex: 1, padding: "12px 0" }}>Replace Week</button>
            </div>
          }>
          <div className="text-[13px] mb-4" style={{ color: "var(--ink-soft)" }}>
            This rebuilds every <b>unlocked</b> meal in the weekly plan using your calorie target, workout schedule, foods at home,
            and the preference mode below. Locked meals are kept exactly as-is. Because the plan is a repeating template, this affects every week, not just {weekLabel}.
          </div>
          <div className="text-[12px] font-bold mb-2" style={{ color: "var(--ink-faint)" }}>RESPECT PREFERENCES</div>
          <div className="flex flex-col gap-2">
            {[
              { id: "strict", label: "Strict", sub: "Never Recommend blocked, dislikes avoided" },
              { id: "flexible", label: "Flexible", sub: "Dislikes may appear occasionally, clearly labeled" },
              { id: "ignore", label: "Ignore Likes/Dislikes", sub: "Only true Never Recommend items stay blocked" },
            ].map((opt) => (
              <button key={opt.id} onClick={() => setGenMode(opt.id)} className="tap text-left p-3 rounded-2xl"
                style={{ border: `1.5px solid ${genMode === opt.id ? "var(--ink)" : "var(--line)"}`, background: genMode === opt.id ? "var(--paper)" : "transparent" }}>
                <div className="font-semibold text-[13.5px]">{opt.label}</div>
                <div className="text-[11.5px]" style={{ color: "var(--ink-faint)" }}>{opt.sub}</div>
              </button>
            ))}
          </div>
        </Sheet>
      )}
    </div>
  );
}

/* ========================== MEAL DETAIL SHEET ============================== */

function explainMeal(meal, foodsById, prefs) {
  if (meal.sharedInfo) {
    return `Shared base (${meal.sharedInfo.shared.join(", ")}) keeps the household eating together, with ${meal.sharedInfo.personal.join(", ")} personalized to preference.`;
  }
  const loved = meal.items.map((it) => ({ it, f: foodsById[it.food] }))
    .filter(({ it }) => ["tyler","elizabeth"].some((p) => getPref(prefs, it.food, p).level === "love"));
  if (loved.length) {
    const names = loved.map(({ f }) => f?.name).filter(Boolean).join(" and ");
    return `Selected because ${names} ${loved.length > 1 ? "are" : "is"} a favorite, and the plate fits today's calorie and protein targets.`;
  }
  return "Selected to fit today's calorie, protein, and carbohydrate targets using foods already on hand where possible.";
}

function MealDetailSheet({ meal, slot, day, foodsById, prefs, favorites, toggleFavorite, onClose, onDeleteRecipe }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  if (!meal) return null;
  const n = computeItemsNutrition(meal.items, foodsById);
  const isFav = favorites?.includes(meal.id);
  return (
    <Sheet title={meal.name} onClose={onClose}>
      {slot && <div className="mb-3"><CategoryTag category={slot.category} /></div>}
      {meal.link && (
        <a href={meal.link} target="_blank" rel="noopener noreferrer" className="tap flex items-center gap-2 p-3 rounded-2xl mb-3" style={{ background: "var(--blue-soft)", textDecoration: "none" }}>
          <LinkIcon size={14} color="var(--blue)" />
          <span className="text-[12.5px] font-semibold" style={{ color: "var(--blue)", wordBreak: "break-all" }}>{meal.link}</span>
        </a>
      )}
      <div className="font-mono text-[13px] mb-4" style={{ color: "var(--ink-soft)" }}>
        <b className="text-[15px]" style={{ color: "var(--ink)" }}>{round(n.cal)} cal</b>
        &nbsp;·&nbsp;{round(n.p)}g protein · {round(n.c)}g carbs · {round(n.f)}g fat · {round(n.fiber)}g fiber
      </div>

      {meal.sharedInfo && (
        <div className="p-3 rounded-2xl mb-4" style={{ background: "var(--sage-soft)" }}>
          <div className="text-[11.5px] font-bold mb-1.5" style={{ color: "var(--sage)" }}>SHARED BASE + PERSONAL ADD-ONS</div>
          <div className="text-[12.5px]"><b>Shared:</b> {meal.sharedInfo.shared.join(", ")}</div>
          <div className="text-[12.5px]"><b>{PEOPLE[meal.people]?.name || "This version"}:</b> {meal.sharedInfo.personal.join(", ")}</div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-4 text-[12px]" style={{ color: "var(--ink-faint)" }}>
        <span className="inline-flex items-center gap-1"><Clock size={12} /> {meal.prep} min</span>
        <span className="inline-flex items-center gap-1"><ChefHat size={12} /> {meal.items.length} ingredients</span>
        <span className="inline-flex items-center gap-1"><Utensils size={12} /> {meal.steps.length} steps</span>
      </div>

      <div className="text-[12px] font-bold mb-2" style={{ color: "var(--ink-faint)" }}>INGREDIENTS</div>
      <div className="mb-5">
        {meal.items.map((it, i) => {
          const f = foodsById[it.food];
          if (!f) return null;
          return (
            <div key={i} className="flex items-center justify-between py-1.5" style={{ borderBottom: i < meal.items.length - 1 ? "0.5px solid rgba(60,60,67,.14)" : "none" }}>
              <span className="text-[13px]">{f.name}</span>
              <span className="font-mono text-[11.5px]" style={{ color: "var(--ink-faint)" }}>{it.label || (it.qty === 1 ? f.servingLabel : `${it.qty}× ${f.servingLabel}`)}</span>
            </div>
          );
        })}
      </div>

      <div className="text-[12px] font-bold mb-2" style={{ color: "var(--ink-faint)" }}>RECIPE</div>
      <div className="mb-5">
        {meal.steps.map((step, i) => (
          <div key={i} className="flex gap-3 mb-3">
            <div style={{
              width: 22, height: 22, borderRadius: 999, background: "var(--blue-soft)", color: "var(--blue)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1,
            }} className="font-mono font-bold text-[11px]">{i + 1}</div>
            <div className="text-[13.5px]" style={{ color: "var(--ink)", lineHeight: 1.45 }}>{step}</div>
          </div>
        ))}
      </div>

      <div className="p-3 rounded-2xl mb-4 flex gap-2" style={{ background: "var(--paper)", border: "1px solid var(--line-soft)" }}>
        <Info size={15} style={{ flexShrink: 0, marginTop: 1, color: "var(--ink-faint)" }} />
        <div className="text-[12px]" style={{ color: "var(--ink-soft)" }}>{explainMeal(meal, foodsById, prefs)}</div>
      </div>

      <div className="flex items-center gap-4">
        {["tyler","elizabeth"].map((p) => {
          const anyDisliked = meal.items.some((it) => ["dislike","never"].includes(getPref(prefs, it.food, p).level));
          return (
            <div key={p} className="flex items-center gap-1.5 text-[12px]">
              <span className="font-semibold" style={{ color: PEOPLE[p].accent }}>{PEOPLE[p].name}:</span>
              {anyDisliked ? <PrefBadge level="dislike" note="Contains an item they normally dislike" /> : <PrefBadge level="like" />}
            </div>
          );
        })}
      </div>

      <button onClick={() => toggleFavorite(meal.id)} className="tap btn-ghost w-full flex items-center justify-center gap-2 mt-4" style={{ padding: "11px 0" }}>
        <Heart size={15} fill={isFav ? "var(--brick)" : "none"} color={isFav ? "var(--brick)" : "var(--ink)"} />
        {isFav ? "Favorited" : "Favorite This Meal"}
      </button>

      {meal.notes && (
        <div className="p-3 rounded-2xl mt-3" style={{ background: "var(--paper)", border: "1px solid var(--line-soft)" }}>
          <div className="text-[11px] font-bold mb-1" style={{ color: "var(--ink-faint)" }}>NOTES</div>
          <div className="text-[12.5px]" style={{ color: "var(--ink-soft)" }}>{meal.notes}</div>
        </div>
      )}

      {meal.custom && onDeleteRecipe && (
        confirmDelete ? (
          <div className="flex gap-2 mt-3">
            <button onClick={() => setConfirmDelete(false)} className="tap btn-ghost" style={{ flex: 1, padding: "11px 0" }}>Cancel</button>
            <button onClick={() => { onDeleteRecipe(meal.id); onClose(); }} className="tap" style={{ flex: 1, padding: "11px 0", borderRadius: 980, background: "var(--brick)", color: "#fff", fontWeight: 600 }}>Delete</button>
          </div>
        ) : (
          <button onClick={() => setConfirmDelete(true)} className="tap text-[12.5px] font-semibold mt-4" style={{ color: "var(--brick)" }}>Delete This Recipe</button>
        )
      )}
    </Sheet>
  );
}

/* ============================== MEALS SCREEN ================================ */

const MEAL_TABS = ["All","Breakfast","Lunch","Dinner","Snack","Pre-Workout","Post-Workout","Favorites"];
const MEAL_TAB_TO_CAT = { "Breakfast":"breakfast","Lunch":"lunch","Dinner":"dinner","Snack":"snack","Pre-Workout":"preworkout","Post-Workout":"postworkout" };

function MealCard({ meal, foodsById, prefs, favorites, toggleFavorite, onView, onAddToWeek }) {
  const n = computeItemsNutrition(meal.items, foodsById);
  return (
    <div className="card p-4 mb-3">
      <div className="flex items-start justify-between">
        <div>
          <CategoryTag category={meal.category} />
          <h4 className="font-display font-bold text-[16px] mt-1.5 leading-tight">{meal.name}</h4>
        </div>
        <button onClick={() => toggleFavorite(meal.id)} className="tap" style={{ padding: 4 }}>
          <Heart size={18} fill={favorites?.includes(meal.id) ? "var(--brick)" : "none"} color={favorites?.includes(meal.id) ? "var(--brick)" : "var(--ink-faint)"} />
        </button>
      </div>
      <div className="font-mono text-[12px] mt-2" style={{ color: "var(--ink-soft)" }}>
        {round(n.cal)} cal · {round(n.p)}g P · {round(n.c)}g C · {round(n.f)}g F
      </div>
      <div className="text-[12.5px] mt-2" style={{ color: "var(--ink-faint)" }}>{meal.steps[0]}</div>
      <div className="flex items-center gap-3 mt-2 text-[11.5px]" style={{ color: "var(--ink-faint)" }}>
        <span className="inline-flex items-center gap-1"><Clock size={11} /> {meal.prep} min</span>
        <span className="inline-flex items-center gap-1"><Utensils size={11} /> {meal.steps.length}-step recipe</span>
        {["tyler","elizabeth"].map((p) => {
          const lvls = meal.items.map((it) => getPref(prefs, it.food, p).level);
          const best = lvls.includes("love") ? "love" : lvls.includes("like") ? "like" : lvls.includes("never") ? "never" : lvls.includes("dislike") ? "dislike" : "neutral";
          return <span key={p} style={{ color: PEOPLE[p].accent }} className="font-semibold">{PEOPLE[p].name} {best === "love" ? "❤️" : best === "like" ? "🙂" : best === "never" || best === "dislike" ? "⚠️" : ""}</span>;
        })}
      </div>
      <div className="flex gap-1.5 mt-3">
        <button onClick={() => onView(meal)} className="tap chip">View Recipe</button>
        <button onClick={() => onAddToWeek(meal)} className="tap chip">Add to Week</button>
      </div>
    </div>
  );
}

function AddToWeekSheet({ meal, onClose, onConfirm }) {
  const [day, setDay] = useState(null);
  const validDays = WEEK_DAYS.filter((d) => d.slots.some((s) => s.category === meal.category));
  const slotsForDay = day ? day.slots.filter((s) => s.category === meal.category) : [];
  return (
    <Sheet title={`Add "${meal.name}" to Week`} onClose={onClose}>
      <div className="text-[12px] font-bold mb-2" style={{ color: "var(--ink-faint)" }}>CHOOSE A DAY</div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {validDays.map((d) => (
          <button key={d.key} onClick={() => setDay(d)} className="tap chip" style={day?.key === d.key ? { background: "var(--ink)", color: "var(--paper-2)", borderColor: "var(--ink)" } : {}}>
            {d.short}
          </button>
        ))}
      </div>
      {day && (
        <>
          <div className="text-[12px] font-bold mb-2" style={{ color: "var(--ink-faint)" }}>CHOOSE A SLOT</div>
          <div className="flex flex-col gap-2">
            {slotsForDay.map((s) => (
              <button key={s.key} onClick={() => onConfirm(day, s)} className="tap text-left p-3 rounded-2xl" style={{ background: "var(--paper)", border: "1px solid var(--line-soft)" }}>
                <div className="font-semibold text-[13.5px]">{CATEGORY_META[s.category].label} · {s.time}</div>
                <div className="text-[11.5px]" style={{ color: "var(--ink-faint)" }}>Replaces both Tyler's and Elizabeth's plan for this slot</div>
              </button>
            ))}
          </div>
        </>
      )}
    </Sheet>
  );
}

function FoodCard({ food, meals, prefs, updatePref, updateFoodQty, updateFoodPrice, addStorePrice, removeStorePrice, setPreferredStore, renameStore, deleteFood, toggleStaple }) {
  const [section, setSection] = useState(null); // null | 'prefs' | 'prices'
  const [newStore, setNewStore] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const locIcon = { fridge: Refrigerator, freezer: Snowflake, pantry: Package }[food.location] || Package;
  const LocIcon = locIcon;
  const usedInMeals = useMemo(() => (meals || MEALS).filter((m) => m.items.some((it) => it.food === food.id)).map((m) => m.name), [food.id, meals]);
  return (
    <div className="card p-4 mb-3">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-display font-bold text-[15.5px] leading-tight flex items-center gap-1.5">
            {food.name}
            {food.isStaple && <Star size={12} fill="var(--mustard)" color="var(--mustard)" />}
          </div>
          {food.brand && <div className="text-[11px]" style={{ color: "var(--ink-faint)" }}>{food.brand}</div>}
        </div>
        <span className="chip inline-flex items-center gap-1"><LocIcon size={11} /> {food.location}</span>
      </div>
      {isRunningLow(food) && (
        <div className="text-[11px] font-semibold mt-1.5 inline-flex items-center gap-1" style={{ color: "var(--brick)" }}>
          <AlertCircle size={11} /> Running low{food.isStaple ? " — will resurface on your grocery list" : ""}
        </div>
      )}
      <div className="font-mono text-[12px] mt-2" style={{ color: "var(--ink-soft)" }}>
        {food.servingLabel} · {food.cal} cal · {food.p}g P · {food.c}g C · {food.f}g F
      </div>
      <div className="font-mono text-[12px] mt-1" style={{ color: "var(--ink-faint)" }}>
        ${round(effectivePrice(food), 2)} · {food.preferredStore} {food.prices.length > 1 && `(+${food.prices.length - 1} more)`}
      </div>
      <div className="flex items-center gap-2 mt-2.5">
        <span className="text-[11.5px] font-semibold" style={{ color: "var(--ink-faint)" }}>At home:</span>
        <button onClick={() => updateFoodQty(food.id, -1)} className="tap" style={{ width: 22, height: 22, borderRadius: 999, border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={11} /></button>
        <span className="font-mono text-[13px] w-6 text-center">{food.qty}</span>
        <button onClick={() => updateFoodQty(food.id, 1)} className="tap" style={{ width: 22, height: 22, borderRadius: 999, border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={11} /></button>
        <span className="text-[11px]" style={{ color: "var(--ink-faint)" }}>servings</span>
      </div>
      <div className="flex gap-3 mt-2.5 flex-wrap">
        <button onClick={() => toggleStaple(food.id)} className="tap text-[12px] font-semibold inline-flex items-center gap-1" style={{ color: food.isStaple ? "var(--mustard)" : "var(--blue)" }}>
          <Star size={12} fill={food.isStaple ? "var(--mustard)" : "none"} /> {food.isStaple ? "Staple" : "Mark as Staple"}
        </button>
        <button onClick={() => setSection(section === "prefs" ? null : "prefs")} className="tap text-[12px] font-semibold inline-flex items-center gap-1" style={{ color: "var(--blue)" }}>
          Preferences <ChevronRight size={12} style={{ transform: section === "prefs" ? "rotate(90deg)" : "none" }} />
        </button>
        <button onClick={() => setSection(section === "prices" ? null : "prices")} className="tap text-[12px] font-semibold inline-flex items-center gap-1" style={{ color: "var(--blue)" }}>
          Prices by Store <ChevronRight size={12} style={{ transform: section === "prices" ? "rotate(90deg)" : "none" }} />
        </button>
        {deleteFood && (
          <button onClick={() => setConfirmDelete(true)} className="tap text-[12px] font-semibold inline-flex items-center gap-1" style={{ color: "var(--brick)" }}>
            Delete Food
          </button>
        )}
      </div>
      {food.isStaple && (
        <div className="text-[11px] mt-1.5" style={{ color: "var(--ink-faint)" }}>
          Staples stay on your grocery radar even when this week's recipes don't call for them — once one runs low, it shows up on Groceries automatically.
        </div>
      )}
      {section === "prefs" && (
        <div className="mt-2.5 flex flex-col gap-2.5">
          {["tyler","elizabeth"].map((p) => {
            const pref = getPref(prefs, food.id, p);
            return (
              <div key={p}>
                <div className="text-[11.5px] font-bold mb-1" style={{ color: PEOPLE[p].accent }}>{PEOPLE[p].name}</div>
                <PrefSelector level={pref.level} compact onChange={(lvl) => updatePref(food.id, p, lvl)} />
                {pref.note && <div className="text-[11px] italic mt-1" style={{ color: "var(--ink-faint)" }}>{pref.note}</div>}
              </div>
            );
          })}
        </div>
      )}
      {section === "prices" && (
        <div className="mt-2.5">
          <div className="text-[11px] mb-2" style={{ color: "var(--ink-faint)" }}>The filled dot marks the store used for cost estimates and the grocery list. Tap a store's name or price to edit it.</div>
          {food.prices.map((sp) => (
            <div key={sp.store} className="flex items-center gap-2 mb-1.5">
              <button onClick={() => setPreferredStore(food.id, sp.store)} className="tap" style={{
                width: 16, height: 16, borderRadius: 999, flexShrink: 0,
                border: `1.5px solid ${food.preferredStore === sp.store ? "var(--blue)" : "var(--line)"}`,
                background: food.preferredStore === sp.store ? "var(--blue)" : "transparent",
              }} />
              <input value={sp.store} onChange={(e) => renameStore(food.id, sp.store, e.target.value)}
                className="text-[12.5px] flex-1" style={{ fontWeight: food.preferredStore === sp.store ? 700 : 500, border: "none", background: "transparent", padding: "3px 0" }} />
              <span className="text-[12px]" style={{ color: "var(--ink-faint)" }}>$</span>
              <input type="number" value={sp.price} onChange={(e) => updateFoodPrice(food.id, sp.store, Number(e.target.value) || 0)}
                className="font-mono text-[12.5px]" style={{ width: 56, border: "1px solid var(--line)", borderRadius: 8, padding: "3px 6px" }} />
              {food.prices.length > 1 && (
                <button onClick={() => removeStorePrice(food.id, sp.store)} className="tap" style={{ padding: 3 }}><X size={12} color="var(--ink-faint)" /></button>
              )}
            </div>
          ))}
          {food.prices.length === 1 && <div className="text-[10.5px] mb-1" style={{ color: "var(--ink-faint)" }}>Add another store below before you can delete this one.</div>}
          <div className="flex items-center gap-2 mt-2">
            <input value={newStore} onChange={(e) => setNewStore(e.target.value)} placeholder="Store name"
              className="input" style={{ flex: 1, fontSize: 12, padding: "6px 9px" }} />
            <input type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder="$"
              className="input" style={{ width: 56, fontSize: 12, padding: "6px 9px" }} />
            <button onClick={() => { if (newStore.trim()) { addStorePrice(food.id, newStore.trim(), Number(newPrice) || 0); setNewStore(""); setNewPrice(""); } }}
              className="tap chip">Add</button>
          </div>
        </div>
      )}
      {confirmDelete && (
        <Sheet title="Delete Food?" onClose={() => setConfirmDelete(false)}
          footer={
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(false)} className="tap btn-ghost" style={{ flex: 1, padding: "12px 0" }}>Cancel</button>
              <button onClick={() => { deleteFood(food.id); setConfirmDelete(false); }} className="tap" style={{ flex: 1, padding: "12px 0", borderRadius: 980, background: "var(--brick)", color: "#fff", fontWeight: 600 }}>Delete</button>
            </div>
          }>
          <div className="text-[13px]" style={{ color: "var(--ink-soft)" }}>
            This removes <b style={{ color: "var(--ink)" }}>{food.name}</b> from your pantry and preferences for good.
          </div>
          {usedInMeals.length > 0 && (
            <div className="p-3 rounded-2xl mt-3.5" style={{ background: "var(--mustard-soft)" }}>
              <div className="text-[12.5px] font-semibold mb-1.5" style={{ color: "var(--ink)" }}>Used in {usedInMeals.length} meal{usedInMeals.length === 1 ? "" : "s"}:</div>
              <div className="text-[12px]" style={{ color: "var(--ink-soft)" }}>{usedInMeals.join(", ")}</div>
              <div className="text-[11.5px] mt-1.5" style={{ color: "var(--ink-faint)" }}>Those meals will just be missing this ingredient's calories going forward — nothing will break.</div>
            </div>
          )}
        </Sheet>
      )}
    </div>
  );
}

/* ============================== LOG FOOD (off-plan diary entries) ================================ */

function LogFoodModal({ meals, foods, foodsById, onClose, onLog, targetDate }) {
  const [tab, setTab] = useState("meals"); // meals | foods | quick
  const [q, setQ] = useState("");
  const [qty, setQty] = useState(1);
  const [picked, setPicked] = useState(null); // meal or food
  const [quick, setQuick] = useState({ name: "", cal: "", p: "", c: "", f: "" });
  const isToday = !targetDate || targetDate === todayISO();

  const filteredMeals = useMemo(() => meals.filter((m) => m.name.toLowerCase().includes(q.toLowerCase())), [meals, q]);
  const filteredFoods = useMemo(() => foods.filter((f) => f.name.toLowerCase().includes(q.toLowerCase())), [foods, q]);

  const submitMeal = (meal) => {
    const n = computeItemsNutrition(meal.items, foodsById);
    onLog({ label: meal.name, time: nowDisplayTime(), cal: n.cal, p: n.p, c: n.c, f: n.f, fiber: n.fiber });
    onClose();
  };
  const submitFood = () => {
    if (!picked) return;
    onLog({
      label: qty === 1 ? picked.name : `${picked.name} ×${qty}`, time: nowDisplayTime(),
      cal: picked.cal * qty, p: picked.p * qty, c: picked.c * qty, f: picked.f * qty, fiber: (picked.fiber || 0) * qty,
    });
    onClose();
  };
  const submitQuick = () => {
    if (!quick.name.trim()) return;
    onLog({
      label: quick.name, time: nowDisplayTime(),
      cal: Number(quick.cal) || 0, p: Number(quick.p) || 0, c: Number(quick.c) || 0, f: Number(quick.f) || 0, fiber: 0,
    });
    onClose();
  };

  return (
    <Sheet title="Log Food" onClose={onClose}>
      <div className="text-[12.5px] mb-3" style={{ color: "var(--ink-faint)" }}>
        {isToday
          ? "Log anything you ate today — from the plan, the pantry, or something entirely off-plan."
          : <>Logging to <b style={{ color: "var(--ink)" }}>{formatDateHeader(targetDate)}</b> — the date you're currently viewing, not today.</>}
      </div>
      <div className="seg-wrap mb-4" style={{ width: "100%" }}>
        {[["meals","From Meals"],["foods","From Foods"],["quick","Quick Add"]].map(([id, label]) => (
          <button key={id} onClick={() => { setTab(id); setPicked(null); }} className={`tap seg-btn ${tab === id ? "seg-btn-on" : "seg-btn-off"}`} style={{ flex: 1 }}>{label}</button>
        ))}
      </div>

      {(tab === "meals" || tab === "foods") && (
        <div className="flex items-center gap-2 flex-1 px-3 rounded-2xl mb-3" style={{ background: "var(--paper-3)" }}>
          <Search size={14} style={{ color: "var(--ink-faint)" }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." className="input" style={{ border: "none", padding: "9px 0", background: "transparent" }} />
        </div>
      )}

      {tab === "meals" && filteredMeals.slice(0, 30).map((m) => {
        const n = computeItemsNutrition(m.items, foodsById);
        return (
          <button key={m.id} onClick={() => submitMeal(m)} className="tap w-full text-left p-3 rounded-2xl mb-2" style={{ background: "var(--paper)", border: "1px solid var(--line-soft)" }}>
            <div className="font-semibold text-[13.5px]">{m.name}</div>
            <div className="font-mono text-[11.5px] mt-1" style={{ color: "var(--ink-soft)" }}>{round(n.cal)} cal · {round(n.p)}g P · {round(n.c)}g C · {round(n.f)}g F</div>
          </button>
        );
      })}

      {tab === "foods" && !picked && filteredFoods.slice(0, 30).map((f) => (
        <button key={f.id} onClick={() => setPicked(f)} className="tap w-full text-left p-3 rounded-2xl mb-2" style={{ background: "var(--paper)", border: "1px solid var(--line-soft)" }}>
          <div className="font-semibold text-[13.5px]">{f.name}</div>
          <div className="font-mono text-[11.5px] mt-1" style={{ color: "var(--ink-soft)" }}>{f.servingLabel} · {f.cal} cal · {f.p}g P</div>
        </button>
      ))}
      {tab === "foods" && picked && (
        <div>
          <div className="p-3 rounded-2xl mb-3" style={{ background: "var(--paper)", border: "1px solid var(--line-soft)" }}>
            <div className="font-semibold text-[14px]">{picked.name}</div>
            <div className="text-[11.5px]" style={{ color: "var(--ink-faint)" }}>{picked.servingLabel} per serving</div>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[13px] font-semibold" style={{ color: "var(--ink-soft)" }}>Servings:</span>
            <button onClick={() => setQty((q) => Math.max(0.5, q - 0.5))} className="tap" style={{ width: 26, height: 26, borderRadius: 999, border: "1px solid var(--line)" }}>−</button>
            <span className="font-mono text-[14px] w-8 text-center">{qty}</span>
            <button onClick={() => setQty((q) => q + 0.5)} className="tap" style={{ width: 26, height: 26, borderRadius: 999, border: "1px solid var(--line)" }}>+</button>
          </div>
          <div className="font-mono text-[13px] mb-4">{round(picked.cal * qty)} cal · {round(picked.p * qty)}g P · {round(picked.c * qty)}g C · {round(picked.f * qty)}g F</div>
          <div className="flex gap-2">
            <button onClick={() => setPicked(null)} className="tap btn-ghost" style={{ flex: 1, padding: "11px 0" }}>Back</button>
            <button onClick={submitFood} className="tap btn-primary" style={{ flex: 1, padding: "11px 0" }}>Log It</button>
          </div>
        </div>
      )}

      {tab === "quick" && (
        <div className="flex flex-col gap-3">
          <Field label="What did you eat?"><input value={quick.name} onChange={(e) => setQuick((s) => ({ ...s, name: e.target.value }))} className="input" placeholder="e.g. Slice of pizza" /></Field>
          <div className="grid grid-cols-4 gap-2">
            <Field label="Cal"><input type="number" value={quick.cal} onChange={(e) => setQuick((s) => ({ ...s, cal: e.target.value }))} className="input" /></Field>
            <Field label="Protein"><input type="number" value={quick.p} onChange={(e) => setQuick((s) => ({ ...s, p: e.target.value }))} className="input" /></Field>
            <Field label="Carbs"><input type="number" value={quick.c} onChange={(e) => setQuick((s) => ({ ...s, c: e.target.value }))} className="input" /></Field>
            <Field label="Fat"><input type="number" value={quick.f} onChange={(e) => setQuick((s) => ({ ...s, f: e.target.value }))} className="input" /></Field>
          </div>
          <button onClick={submitQuick} className="tap btn-primary w-full" style={{ padding: "12px 0" }}>Log It</button>
        </div>
      )}
    </Sheet>
  );
}

/* ============================== CREATE / EDIT RECIPE ================================ */

const RECIPE_CATEGORIES = ["breakfast","lunch","dinner","snack","preworkout","postworkout"];

function IngredientPicker({ foods, ingredients, setIngredients }) {
  const [q, setQ] = useState("");
  const matches = q.trim() ? foods.filter((f) => f.name.toLowerCase().includes(q.toLowerCase())).slice(0, 6) : [];

  const addIngredient = (food) => {
    setIngredients((s) => [...s, { foodId: food.id, qty: 1, label: food.servingLabel }]);
    setQ("");
  };
  const updateIngredient = (i, patch) => setIngredients((s) => s.map((row, idx) => idx === i ? { ...row, ...patch } : row));
  const removeIngredient = (i) => setIngredients((s) => s.filter((_, idx) => idx !== i));

  return (
    <div>
      {ingredients.map((row, i) => {
        const food = foods.find((f) => f.id === row.foodId);
        if (!food) return null;
        return (
          <div key={i} className="p-3 rounded-2xl mb-2" style={{ background: "var(--paper)", border: "1px solid var(--line-soft)" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-[13.5px]">{food.name}</span>
              <button onClick={() => removeIngredient(i)} className="tap" style={{ padding: 3 }}><X size={13} color="var(--ink-faint)" /></button>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11.5px] font-semibold" style={{ color: "var(--ink-faint)" }}>Multiplier:</span>
              <button onClick={() => updateIngredient(i, { qty: Math.max(0.25, row.qty - 0.25) })} className="tap" style={{ width: 22, height: 22, borderRadius: 999, border: "1px solid var(--line)" }}>−</button>
              <span className="font-mono text-[13px] w-8 text-center">{row.qty}</span>
              <button onClick={() => updateIngredient(i, { qty: row.qty + 0.25 })} className="tap" style={{ width: 22, height: 22, borderRadius: 999, border: "1px solid var(--line)" }}>+</button>
              <span className="text-[11px]" style={{ color: "var(--ink-faint)" }}>× {food.servingLabel}</span>
            </div>
            <Field label="Exact measurement to display (optional)">
              <input value={row.label} onChange={(e) => updateIngredient(i, { label: e.target.value })} className="input" style={{ fontSize: 12.5, padding: "7px 10px" }} placeholder='e.g. "1½ cups, packed"' />
            </Field>
          </div>
        );
      })}
      <div className="flex items-center gap-2 px-3 rounded-2xl mb-1" style={{ background: "var(--paper-3)" }}>
        <Search size={13} style={{ color: "var(--ink-faint)" }} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search foods to add as an ingredient…" className="input" style={{ border: "none", padding: "8px 0", background: "transparent", fontSize: 13 }} />
      </div>
      {matches.map((f) => (
        <button key={f.id} onClick={() => addIngredient(f)} className="tap w-full text-left p-2.5 rounded-xl mb-1" style={{ background: "var(--paper)" }}>
          <span className="text-[13px] font-semibold">{f.name}</span> <span className="text-[11px]" style={{ color: "var(--ink-faint)" }}>{f.servingLabel}</span>
        </button>
      ))}
    </div>
  );
}

function CreateRecipeModal({ foods, onClose, onSave }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("dinner");
  const [prep, setPrep] = useState(20);
  const [link, setLink] = useState("");
  const [notes, setNotes] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [stepsText, setStepsText] = useState("");

  const canSave = name.trim() && ingredients.length > 0;

  return (
    <Sheet title="Create Recipe" onClose={onClose} footer={
      <button disabled={!canSave} onClick={() => {
        const steps = stepsText.split("\n").map((s) => s.trim()).filter(Boolean);
        onSave({
          name: name.trim(), category, prep: Number(prep) || 15, people: "both",
          link: link.trim() || null, notes: notes.trim() || null,
          items: ingredients.map((i) => ({ food: i.foodId, qty: i.qty, label: i.label })),
          steps: steps.length ? steps : ["No steps added yet — edit this recipe to add them."],
        });
      }} className="tap btn-primary w-full" style={{ padding: "13px 0", opacity: canSave ? 1 : .4 }}>
        Save Recipe
      </button>
    }>
      <Field label="Recipe name"><input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="e.g. Beth's Chicken Chili" /></Field>
      <div className="mt-3">
        <span className="text-[11.5px] font-bold block mb-1" style={{ color: "var(--ink-faint)" }}>Category</span>
        <div className="scrollx flex gap-1.5 pb-1">
          {RECIPE_CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCategory(c)} className="tap chip" style={{ whiteSpace: "nowrap", ...(category === c ? { background: CATEGORY_META[c].color, color: "#fff", borderColor: CATEGORY_META[c].color } : {}) }}>{CATEGORY_META[c].label}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <Field label="Prep time (min)"><input type="number" value={prep} onChange={(e) => setPrep(e.target.value)} className="input" /></Field>
        <Field label="Recipe link (optional)"><input value={link} onChange={(e) => setLink(e.target.value)} className="input" placeholder="https://…" /></Field>
      </div>

      <div className="mt-4">
        <span className="text-[11.5px] font-bold block mb-1.5" style={{ color: "var(--ink-faint)" }}>INGREDIENTS</span>
        <IngredientPicker foods={foods} ingredients={ingredients} setIngredients={setIngredients} />
      </div>

      <div className="mt-4">
        <span className="text-[11.5px] font-bold block mb-1.5" style={{ color: "var(--ink-faint)" }}>STEPS (one per line)</span>
        <textarea value={stepsText} onChange={(e) => setStepsText(e.target.value)} className="input" rows={5}
          placeholder={"Season the chicken and sear until browned.\nAdd broth and simmer 20 minutes.\nStir in beans and serve."} />
      </div>

      <div className="mt-3">
        <Field label="Notes (optional)"><input value={notes} onChange={(e) => setNotes(e.target.value)} className="input" placeholder="Any other details worth keeping" /></Field>
      </div>
    </Sheet>
  );
}

function AddFoodModal({ onClose, onSave }) {
  const [f, setF] = useState({ name:"", brand:"", category:"Protein", servingLabel:"", cal:"", p:"", c:"", fat:"", fiber:"", gf:false, ai:false, price:"", store:"", location:"pantry", qty:0, pkgServings:1 });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const canSave = f.name.trim() && f.servingLabel.trim() && f.cal !== "";
  return (
    <Sheet title="Add Food" onClose={onClose} footer={
      <button disabled={!canSave} onClick={() => onSave(f)} className="tap btn-primary w-full" style={{ padding: "13px 0", opacity: canSave ? 1 : .4 }}>Save Food</button>
    }>
      <div className="flex flex-col gap-3">
        <Field label="Food name"><input value={f.name} onChange={(e) => set("name", e.target.value)} className="input" placeholder="e.g. Rotisserie Chicken" /></Field>
        <Field label="Brand (optional)"><input value={f.brand} onChange={(e) => set("brand", e.target.value)} className="input" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Category">
            <select value={f.category} onChange={(e) => set("category", e.target.value)} className="input">
              {["Protein","Vegetable","Fruit","Carbohydrate","Dairy","Snacks","Sauces","Drinks","Condiments","Other"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Location">
            <select value={f.location} onChange={(e) => set("location", e.target.value)} className="input">
              <option value="fridge">Fridge</option><option value="freezer">Freezer</option><option value="pantry">Pantry</option>
            </select>
          </Field>
        </div>
        <Field label="Serving size"><input value={f.servingLabel} onChange={(e) => set("servingLabel", e.target.value)} className="input" placeholder="e.g. 1 cup" /></Field>
        <div className="grid grid-cols-4 gap-2">
          <Field label="Cal"><input type="number" value={f.cal} onChange={(e) => set("cal", e.target.value)} className="input" /></Field>
          <Field label="Protein g"><input type="number" value={f.p} onChange={(e) => set("p", e.target.value)} className="input" /></Field>
          <Field label="Carbs g"><input type="number" value={f.c} onChange={(e) => set("c", e.target.value)} className="input" /></Field>
          <Field label="Fat g"><input type="number" value={f.fat} onChange={(e) => set("fat", e.target.value)} className="input" /></Field>
        </div>
        <Field label="Fiber g"><input type="number" value={f.fiber} onChange={(e) => set("fiber", e.target.value)} className="input" /></Field>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-[13px]"><input type="checkbox" checked={f.gf} onChange={(e) => set("gf", e.target.checked)} /> Gluten-free</label>
          <label className="flex items-center gap-2 text-[13px]"><input type="checkbox" checked={f.ai} onChange={(e) => set("ai", e.target.checked)} /> Anti-inflammatory</label>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Field label="Price/serving"><input type="number" value={f.price} onChange={(e) => set("price", e.target.value)} className="input" /></Field>
          <Field label="Store"><input value={f.store} onChange={(e) => set("store", e.target.value)} className="input" /></Field>
          <Field label="Qty at home"><input type="number" value={f.qty} onChange={(e) => set("qty", e.target.value)} className="input" /></Field>
        </div>
      </div>
    </Sheet>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-[11.5px] font-bold block mb-1" style={{ color: "var(--ink-faint)" }}>{label}</span>
      {children}
    </label>
  );
}

/* ------------------------- Meals screen (Recipes + Foods) ------------------------- */

function MealsScreen({ meals, foods, foodsById, prefs, updatePref, updateFoodQty, updateFoodPrice, addStorePrice, removeStorePrice, setPreferredStore, renameStore, deleteFood, toggleStaple,
  favorites, toggleFavorite, onView, onAddMealToWeek, onAddFood, onAddRecipe, water, addFoodTrigger, inventoryTrigger }) {
  const [sub, setSub] = useState("recipes"); // recipes | foods
  const [tab, setTab] = useState("All");
  const [q, setQ] = useState("");
  const [creatingRecipe, setCreatingRecipe] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);
  const [addFoodOpen, setAddFoodOpen] = useState(false);
  const [foodQ, setFoodQ] = useState("");
  const [foodLoc, setFoodLoc] = useState("All");

  const toggleFilter = (f) => setActiveFilters((s) => s.includes(f) ? s.filter((x) => x !== f) : [...s, f]);

  const filteredMeals = useMemo(() => {
    let list = meals;
    if (tab === "Favorites") list = list.filter((m) => favorites.includes(m.id));
    else if (tab !== "All") list = list.filter((m) => m.category === MEAL_TAB_TO_CAT[tab]);
    if (q.trim()) list = list.filter((m) => m.name.toLowerCase().includes(q.toLowerCase()));
    activeFilters.forEach((f) => {
      if (f === "Tyler likes") list = list.filter((m) => m.items.some((it) => ["love","like"].includes(getPref(prefs, it.food, "tyler").level)));
      if (f === "Elizabeth likes") list = list.filter((m) => m.items.some((it) => ["love","like"].includes(getPref(prefs, it.food, "elizabeth").level)));
      if (f === "Both like") list = list.filter((m) => m.items.every((it) => !["dislike","never"].includes(getPref(prefs, it.food, "tyler").level) && !["dislike","never"].includes(getPref(prefs, it.food, "elizabeth").level)));
      if (f === "Gluten-free") list = list.filter((m) => m.items.every((it) => foodsById[it.food]?.gf));
      if (f === "Anti-inflammatory") list = list.filter((m) => m.items.every((it) => foodsById[it.food]?.ai));
      if (f === "Quick prep") list = list.filter((m) => m.prep <= 15);
      if (f === "High protein") list = list.filter((m) => computeItemsNutrition(m.items, foodsById).p >= 30);
      if (f === "Uses food at home") list = list.filter((m) => m.items.every((it) => (foodsById[it.food]?.qty || 0) >= it.qty));
    });
    return list;
  }, [meals, tab, q, activeFilters, prefs, foodsById, favorites]);

  const filteredFoods = useMemo(() => {
    let list = foods;
    if (foodLoc === "staples") list = list.filter((f) => f.isStaple);
    else if (foodLoc !== "All") list = list.filter((f) => f.location === foodLoc);
    if (foodQ.trim()) list = list.filter((f) => f.name.toLowerCase().includes(foodQ.toLowerCase()));
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [foods, foodLoc, foodQ]);

  const [addToWeekMeal, setAddToWeekMeal] = useState(null);

  useEffect(() => {
    if (addFoodTrigger > 0) { setSub("foods"); setAddFoodOpen(true); }
  }, [addFoodTrigger]);
  useEffect(() => {
    if (inventoryTrigger > 0) setSub("foods");
  }, [inventoryTrigger]);

  return (
    <div>
      <ScreenHeader title="Meal Library" />
      <div className="px-5 -mt-1 mb-4">
        <div className="flex gap-1.5 p-1 rounded-2xl" style={{ background: "var(--paper-3)" }}>
          {[["recipes","Recipes"],["foods","My Foods"]].map(([id, label]) => (
            <button key={id} onClick={() => setSub(id)} className="tap font-semibold text-[13.5px]"
              style={{ flex: 1, padding: "8px 0", borderRadius: 14, background: sub === id ? "var(--paper-2)" : "transparent", boxShadow: sub === id ? "var(--shadow)" : "none" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {sub === "recipes" ? (
        <div className="px-5 pb-6">
          <button onClick={() => setCreatingRecipe(true)} className="tap btn-primary w-full flex items-center justify-center gap-2 mb-3" style={{ padding: "12px 0" }}>
            <Plus size={16} /> Create Recipe
          </button>
          <div className="scrollx flex gap-1.5 mb-3 pb-1">
            {MEAL_TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)} className="tap chip"
                style={tab === t ? { whiteSpace: "nowrap", background: "var(--ink)", color: "var(--paper-2)", borderColor: "var(--ink)" } : { whiteSpace: "nowrap" }}>
                {t}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mb-3">
            <div className="flex items-center gap-2 flex-1 px-3 rounded-2xl" style={{ background: "var(--paper-2)", border: "1px solid var(--line-soft)" }}>
              <Search size={14} style={{ color: "var(--ink-faint)" }} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search meals..." className="input" style={{ border: "none", padding: "9px 0", background: "transparent" }} />
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className="tap" style={{ width: 40, borderRadius: 14, border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", background: activeFilters.length ? "var(--ink)" : "var(--paper-2)" }}>
              <Filter size={15} color={activeFilters.length ? "var(--paper-2)" : "var(--ink)"} />
            </button>
          </div>
          {showFilters && (
            <div className="scrollx flex gap-1.5 mb-3 pb-1">
              {["Tyler likes","Elizabeth likes","Both like","Gluten-free","Anti-inflammatory","High protein","Quick prep","Uses food at home"].map((f) => (
                <button key={f} onClick={() => toggleFilter(f)} className={`tap chip ${activeFilters.includes(f) ? "chip-on" : ""}`} style={{ whiteSpace: "nowrap" }}>{f}</button>
              ))}
            </div>
          )}
          {filteredMeals.length === 0 && <EmptyNote>No meals match yet — try a different filter.</EmptyNote>}
          {filteredMeals.map((m) => (
            <MealCard key={m.id} meal={m} foodsById={foodsById} prefs={prefs} favorites={favorites} toggleFavorite={toggleFavorite}
              onView={onView} onAddToWeek={setAddToWeekMeal} />
          ))}
        </div>
      ) : (
        <div className="px-5 pb-6">
          <div className="text-[12.5px] mb-3" style={{ color: "var(--ink-faint)" }}>
            Your persistent pantry inventory — this is what's actually on hand, independent of any single week's plan. Foods stay here forever until you delete them, whether or not this week's recipes use them.
          </div>
          <div className="scrollx flex gap-1.5 mb-3 pb-1">
            {["All","fridge","freezer","pantry","staples"].map((l) => (
              <button key={l} onClick={() => setFoodLoc(l)} className="tap chip capitalize" style={foodLoc === l ? { background: "var(--ink)", color: "var(--paper-2)", borderColor: "var(--ink)" } : {}}>{l === "All" ? "All Foods" : l}</button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-1 px-3 rounded-2xl mb-3" style={{ background: "var(--paper-2)", border: "1px solid var(--line-soft)" }}>
            <Search size={14} style={{ color: "var(--ink-faint)" }} />
            <input value={foodQ} onChange={(e) => setFoodQ(e.target.value)} placeholder="Search foods..." className="input" style={{ border: "none", padding: "9px 0", background: "transparent" }} />
          </div>
          <button onClick={() => setAddFoodOpen(true)} className="tap btn-primary w-full flex items-center justify-center gap-2 mb-4" style={{ padding: "12px 0" }}>
            <Plus size={16} /> Add Food
          </button>
          {filteredFoods.map((f) => (
            <FoodCard key={f.id} food={f} meals={meals} prefs={prefs} updatePref={updatePref} updateFoodQty={updateFoodQty}
              updateFoodPrice={updateFoodPrice} addStorePrice={addStorePrice} removeStorePrice={removeStorePrice} setPreferredStore={setPreferredStore}
              renameStore={renameStore} deleteFood={deleteFood} toggleStaple={toggleStaple} />
          ))}
        </div>
      )}

      {addToWeekMeal && (
        <AddToWeekSheet meal={addToWeekMeal} onClose={() => setAddToWeekMeal(null)}
          onConfirm={(day, s) => { onAddMealToWeek(day, s, addToWeekMeal.id); setAddToWeekMeal(null); }} />
      )}
      {addFoodOpen && <AddFoodModal onClose={() => setAddFoodOpen(false)} onSave={(f) => { onAddFood(f); setAddFoodOpen(false); }} />}
      {creatingRecipe && <CreateRecipeModal foods={foods} onClose={() => setCreatingRecipe(false)} onSave={(r) => { onAddRecipe(r); setCreatingRecipe(false); }} />}
    </div>
  );
}

/* ============================== GROCERIES SCREEN ================================ */

const GROCERY_PRIORITY = { Protein: 1, Frozen: 1, Produce: 2, Dairy: 3, Carbohydrates: 4, Drinks: 5, Snacks: 6, Condiments: 7, Other: 8 };

function GroceriesScreen({ overrides, foodsById, mealsMap, checked, toggleChecked, setCheckedMany, onClearPurchased, budget, setBudget, onNavigateInventory }) {
  const [sortBy, setSortBy] = useState("category"); // category | store | person
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showBudget, setShowBudget] = useState(false);
  const [budgetDraft, setBudgetDraft] = useState(budget || "");
  const [shareState, setShareState] = useState("idle");
  const [budgetNote, setBudgetNote] = useState(null);

  const list = useMemo(() => buildGroceryList(overrides, foodsById, mealsMap), [overrides, foodsById, mealsMap]);
  const toBuy = list.filter((r) => r.buyServings > 0);
  const totalCost = round(toBuy.reduce((s, r) => s + r.estCost, 0), 2);
  const myList = toBuy.filter((r) => checked?.[r.foodId]);
  const myListCost = round(myList.reduce((s, r) => s + r.estCost, 0), 2);
  const uncheckedCount = toBuy.length - myList.length;

  const groups = useMemo(() => {
    const g = {};
    toBuy.forEach((r) => {
      let key;
      if (sortBy === "category") key = groceryCategoryOf(r.food);
      else if (sortBy === "store") key = r.food.preferredStore || "Other";
      else key = r.people.length === 2 ? "Household (both)" : PEOPLE[r.people[0]]?.name || "Other";
      (g[key] = g[key] || []).push(r);
    });
    return g;
  }, [toBuy, sortBy]);

  const orderedKeys = sortBy === "category"
    ? GROCERY_CATEGORY_ORDER.filter((k) => groups[k])
    : Object.keys(groups).sort();

  const generateWithinBudget = () => {
    const b = Number(budgetDraft);
    if (!b) return;
    setBudget(b);
    const sorted = [...toBuy].sort((a, c) => {
      const pa = GROCERY_PRIORITY[groceryCategoryOf(a.food)] || 9, pc = GROCERY_PRIORITY[groceryCategoryOf(c.food)] || 9;
      if (pa !== pc) return pa - pc;
      return c.needServings - a.needServings;
    });
    let running = 0; const include = [];
    sorted.forEach((r) => { if (running + r.estCost <= b) { running += r.estCost; include.push(r.foodId); } });
    setCheckedMany(include);
    const cut = sorted.length - include.length;
    setBudgetNote(cut > 0
      ? `Kept ${include.length} items at $${round(running, 2)} — ${cut} lower-priority item${cut === 1 ? "" : "s"} held back to stay under budget.`
      : `All ${include.length} items fit within budget at $${round(running, 2)}.`);
    setShowBudget(false);
  };

  const shareList = async () => {
    const text = `Grocery list (${WEEK_LABEL})\n` + myList.map((r) => `• ${r.food.name} — ${r.buyServings} (${r.buyPackages} pkg) — $${r.estCost}`).join("\n")
      + `\nTotal: $${myListCost}`;
    try { await navigator.clipboard.writeText(text); setShareState("copied"); setTimeout(() => setShareState("idle"), 1800); }
    catch (e) { setShareState("idle"); }
  };

  return (
    <div>
      <ScreenHeader title="Weekly Grocery Order" eyebrow={WEEK_LABEL} />
      <div className="px-5 -mt-1">
        <div className="card p-4 mb-4">
          <div className="flex justify-between text-[13px]">
            <span style={{ color: "var(--ink-faint)" }}>People</span><span className="font-semibold">Tyler + Elizabeth</span>
          </div>
          <div className="flex justify-between text-[13px] mt-1.5">
            <span style={{ color: "var(--ink-faint)" }}>Items to buy</span><span className="font-mono font-semibold">{toBuy.length} ({uncheckedCount} not yet listed)</span>
          </div>
          <div className="flex justify-between text-[13px] mt-1.5">
            <span style={{ color: "var(--ink-faint)" }}>Estimated cost (all)</span><span className="font-mono font-semibold">${totalCost}</span>
          </div>
          <div className="flex justify-between text-[13px] mt-1.5">
            <button onClick={() => setShowBudget(true)} className="tap" style={{ color: "var(--blue)" }}>Budget</button>
            <span className="font-mono font-semibold">{budget ? `$${budget}` : "not set"}</span>
          </div>
        </div>

        {budgetNote && (
          <div className="p-3 rounded-2xl mb-4 flex gap-2" style={{ background: "var(--mustard-soft)" }}>
            <Info size={14} style={{ flexShrink: 0, marginTop: 1, color: "var(--mustard)" }} />
            <div className="text-[12px]" style={{ color: "var(--ink)" }}>{budgetNote}</div>
          </div>
        )}

        {/* My List — visible confirmation of what's been added */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display font-bold text-[16px]">My List</h3>
            <span className="font-mono text-[12.5px]" style={{ color: "var(--ink-faint)" }}>{myList.length} items · ${myListCost}</span>
          </div>
          <div className="card p-3">
            {myList.length === 0 && <EmptyNote>Tap items below to add them to your list.</EmptyNote>}
            {myList.map((r) => (
              <div key={r.foodId} className="flex items-center justify-between py-1.5">
                <span className="text-[13px] font-semibold">{r.food.name}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11.5px]" style={{ color: "var(--ink-faint)" }}>${r.estCost}</span>
                  <button onClick={() => toggleChecked(r.foodId)} className="tap"><X size={13} color="var(--ink-faint)" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <button onClick={shareList} className="tap btn-primary flex-1 flex items-center justify-center gap-1.5" style={{ padding: "11px 0", fontSize: 13.5 }}>
            <ShoppingBag size={14} /> {shareState === "copied" ? "Copied!" : "Share List"}
          </button>
          <button onClick={() => setShowClearConfirm(true)} className="tap btn-ghost flex-1 flex items-center justify-center gap-1.5" style={{ padding: "11px 0", fontSize: 13.5 }}>
            <RefreshCw size={14} /> Clear Purchased
          </button>
        </div>

        <div className="mb-4"><BigButton icon={Package} label="View Grocery Inventory" sub="Everything on hand, week after week" onClick={onNavigateInventory} /></div>

        <div className="scrollx flex gap-1.5 mb-4 pb-1">
          <span className="text-[11.5px] font-bold self-center mr-1" style={{ color: "var(--ink-faint)" }}>Sort:</span>
          {[["category","Category"],["store","Store"],["person","Person"]].map(([id, label]) => (
            <button key={id} onClick={() => setSortBy(id)} className="tap chip" style={sortBy === id ? { background: "var(--ink)", color: "var(--paper-2)", borderColor: "var(--ink)" } : {}}>{label}</button>
          ))}
        </div>
      </div>

      <div className="px-5 pb-6">
        {orderedKeys.map((key) => (
          <GrocerySection key={key} title={key} rows={groups[key]} checked={checked} toggleChecked={toggleChecked} />
        ))}
        {toBuy.length === 0 && <EmptyNote>Everything you need is already at home. Nice.</EmptyNote>}
      </div>

      {showBudget && (
        <Sheet title="Grocery Budget" onClose={() => setShowBudget(false)}>
          <div className="text-[13px] mb-4" style={{ color: "var(--ink-soft)" }}>
            Set a budget and we'll build your list to stay under it, prioritizing protein and produce first.
          </div>
          <Field label="Budget for this week">
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-semibold">$</span>
              <input type="number" autoFocus value={budgetDraft} onChange={(e) => setBudgetDraft(e.target.value)} className="input" />
            </div>
          </Field>
          <button onClick={generateWithinBudget} className="tap btn-primary w-full mt-4" style={{ padding: "12px 0" }}>Generate List Within Budget</button>
          <button onClick={() => { setBudget(Number(budgetDraft) || null); setShowBudget(false); }} className="tap btn-ghost w-full mt-2" style={{ padding: "12px 0" }}>Just Save Budget</button>
        </Sheet>
      )}

      {showClearConfirm && (
        <Sheet title="Clear Purchased Items?" onClose={() => setShowClearConfirm(false)}
          footer={
            <div className="flex gap-2">
              <button onClick={() => setShowClearConfirm(false)} className="tap btn-ghost" style={{ flex: 1, padding: "12px 0" }}>Cancel</button>
              <button onClick={() => { onClearPurchased(myList); setShowClearConfirm(false); }} className="tap btn-primary" style={{ flex: 1, padding: "12px 0" }}>Confirm</button>
            </div>
          }>
          <div className="text-[13px]" style={{ color: "var(--ink-soft)" }}>
            This adds the <b>{myList.length}</b> item{myList.length === 1 ? "" : "s"} in My List to your pantry inventory
            (Meals → My Foods) and clears your list. This can't be undone.
          </div>
        </Sheet>
      )}
    </div>
  );
}

function GrocerySection({ title, rows, checked, toggleChecked }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-3">
      <button onClick={() => setOpen(!open)} className="tap flex items-center justify-between w-full py-2">
        <span className="font-display font-bold text-[15px]">{title}</span>
        <span className="text-[11.5px] font-mono" style={{ color: "var(--ink-faint)" }}>{rows.length} <ChevronRight size={12} style={{ display: "inline", transform: open ? "rotate(90deg)" : "none" }} /></span>
      </button>
      {open && rows.map((r) => (
        <div key={r.foodId} className="card p-3.5 mb-2 flex gap-3 items-start">
          <button onClick={() => toggleChecked(r.foodId)} className="tap mt-0.5" style={{
            width: 22, height: 22, borderRadius: 7, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
            border: `1.5px solid ${checked?.[r.foodId] ? "var(--sage)" : "var(--line)"}`, background: checked?.[r.foodId] ? "var(--sage)" : "transparent",
          }}>
            {checked?.[r.foodId] && <Check size={13} color="#fff" strokeWidth={3} />}
          </button>
          <div style={{ flex: 1, opacity: checked?.[r.foodId] ? .5 : 1 }}>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[14px]" style={{ textDecoration: checked?.[r.foodId] ? "line-through" : "none" }}>{r.food.name}</span>
              <span className="font-mono text-[12.5px] font-semibold">${r.estCost}</span>
            </div>
            <div className="font-mono text-[11px] mt-1" style={{ color: "var(--ink-faint)" }}>
              Need {r.needServings} · Have {r.haveServings} · <b style={{ color: "var(--ink)" }}>Buy {r.buyServings} ({r.buyPackages} pkg)</b>
            </div>
            <div className="flex items-center gap-1 flex-wrap mt-1.5">
              {r.usedFor.map((u) => (
                <span key={u} className="chip" style={u.startsWith("Staple") ? { fontSize: 10, padding: "2px 7px", background: "var(--mustard-soft)", color: "var(--mustard)" } : { fontSize: 10, padding: "2px 7px" }}>{u}</span>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-[11px]" style={{ color: "var(--ink-faint)" }}>
              <MapPin size={10} /> {r.food.preferredStore}
              {r.people.map((p) => <span key={p} style={{ color: PEOPLE[p].accent }} className="font-semibold">{PEOPLE[p].name} ✓</span>)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================== PROFILE SCREEN ================================ */

const PREF_CATEGORIES = ["Protein","Vegetable","Fruit","Carbohydrate","Dairy","Snacks","Sauces","Drinks","Condiments","Other"];

function PreferencesScreen({ foods, prefs, updatePref, updateNote, allowNever, setAllowNever, onBack }) {
  const [tab, setTab] = useState("tyler"); // tyler | elizabeth | household | ignored
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");

  const filtered = useMemo(() => {
    let list = foods;
    if (cat !== "All") list = list.filter((f) => f.category === cat);
    if (q.trim()) list = list.filter((f) => f.name.toLowerCase().includes(q.toLowerCase()));
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [foods, cat, q]);

  const conflicts = useMemo(() => foods.filter((f) => {
    const t = getPref(prefs, f.id, "tyler").level, e = getPref(prefs, f.id, "elizabeth").level;
    const bad = ["dislike","never"]; const good = ["love","like"];
    return (bad.includes(t) && good.includes(e)) || (bad.includes(e) && good.includes(t));
  }), [foods, prefs]);

  const neverList = useMemo(() => foods.filter((f) => getPref(prefs, f.id, "tyler").level === "never" || getPref(prefs, f.id, "elizabeth").level === "never"), [foods, prefs]);

  return (
    <div>
      <div className="flex items-center gap-2 px-5 pt-6 pb-2">
        <button onClick={onBack} className="tap" style={{ padding: 4 }}><ArrowLeft size={19} /></button>
        <h1 className="font-display font-bold text-[23px]">Food Preferences</h1>
      </div>

      <div className="px-5 mb-4 mt-2">
        <div className="scrollx flex gap-1.5">
          {[["tyler","Tyler"],["elizabeth","Elizabeth"],["household","Household"],["ignored","Ignored Preferences"]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className="tap chip" style={{ whiteSpace: "nowrap", ...(tab === id ? { background: "var(--ink)", color: "var(--paper-2)", borderColor: "var(--ink)" } : {}) }}>{label}</button>
          ))}
        </div>
      </div>

      {(tab === "tyler" || tab === "elizabeth") && (
        <div className="px-5 pb-6">
          <div className="flex items-center gap-2 flex-1 px-3 rounded-2xl mb-3" style={{ background: "var(--paper-2)", border: "1px solid var(--line-soft)" }}>
            <Search size={14} style={{ color: "var(--ink-faint)" }} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search foods..." className="input" style={{ border: "none", padding: "9px 0", background: "transparent" }} />
          </div>
          <div className="scrollx flex gap-1.5 mb-4 pb-1">
            {["All", ...PREF_CATEGORIES].map((c) => (
              <button key={c} onClick={() => setCat(c)} className="tap chip" style={{ whiteSpace: "nowrap", ...(cat === c ? { background: "var(--ink)", color: "var(--paper-2)", borderColor: "var(--ink)" } : {}) }}>{c}</button>
            ))}
          </div>
          {filtered.map((f) => {
            const pr = getPref(prefs, f.id, tab);
            return (
              <div key={f.id} className="card p-3.5 mb-2.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-[14px]">{f.name}</span>
                  <span className="text-[10.5px]" style={{ color: "var(--ink-faint)" }}>{f.category}</span>
                </div>
                <PrefSelector level={pr.level} onChange={(lvl) => updatePref(f.id, tab, lvl)} />
                <input value={pr.note || ""} onChange={(e) => updateNote(f.id, tab, e.target.value)} placeholder="Add a note (e.g. only likes it cooked)…"
                  className="input mt-2" style={{ fontSize: 12, padding: "7px 10px" }} />
              </div>
            );
          })}
        </div>
      )}

      {tab === "household" && (
        <div className="px-5 pb-6">
          <div className="text-[12.5px] mb-4" style={{ color: "var(--ink-soft)" }}>
            Foods where Tyler and Elizabeth's preferences differ. Shared meals use these as a guide for personalized add-ons.
          </div>
          {conflicts.length === 0 && <EmptyNote>No conflicts — nicely aligned pantry.</EmptyNote>}
          {conflicts.map((f) => (
            <div key={f.id} className="card p-3.5 mb-2.5 flex items-center justify-between">
              <span className="font-semibold text-[14px]">{f.name}</span>
              <div className="flex items-center gap-2">
                <PrefBadge level={getPref(prefs, f.id, "tyler").level} note="Tyler" />
                <PrefBadge level={getPref(prefs, f.id, "elizabeth").level} note="Elizabeth" />
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "ignored" && (
        <div className="px-5 pb-6">
          <div className="card p-4 mb-4 flex items-center justify-between">
            <div style={{ maxWidth: "78%" }}>
              <div className="font-semibold text-[13.5px]">Allow Never Recommend Foods</div>
              <div className="text-[11.5px] mt-0.5" style={{ color: "var(--ink-faint)" }}>Off by default. Generators skip these even in Ignore Likes/Dislikes mode unless this is on.</div>
            </div>
            <button onClick={() => setAllowNever(!allowNever)} className="tap" style={{
              width: 44, height: 26, borderRadius: 999, background: allowNever ? "var(--sage)" : "var(--line)", position: "relative", flexShrink: 0,
            }}>
              <span style={{ position: "absolute", top: 2, left: allowNever ? 20 : 2, width: 22, height: 22, borderRadius: 999, background: "#fff", transition: "left .15s" }} />
            </button>
          </div>
          {neverList.map((f) => (
            <div key={f.id} className="card p-3.5 mb-2.5 flex items-center justify-between">
              <span className="font-semibold text-[14px]">{f.name}</span>
              <div className="flex items-center gap-2">
                <PrefBadge level={getPref(prefs, f.id, "tyler").level} note="Tyler" />
                <PrefBadge level={getPref(prefs, f.id, "elizabeth").level} note="Elizabeth" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================== PROGRESS SCREEN ================================ */

/* ------------------------------ progress aggregation ------------------------------ */
const PROGRESS_METRICS = [
  { id:"cal", label:"Calories", color:"var(--brick)", max:2000, group:"nutrition" },
  { id:"p", label:"Protein", color:"var(--sage)", max:170, group:"nutrition" },
  { id:"c", label:"Carbs", color:"var(--mustard)", max:210, group:"nutrition" },
  { id:"f", label:"Fat", color:"var(--plum)", max:70, group:"nutrition" },
  { id:"fiber", label:"Fiber", color:"var(--steel)", max:30, group:"nutrition" },
  { id:"water", label:"Water", color:"var(--steel)", max:100, group:"nutrition" },
  { id:"energy", label:"Energy", color:"var(--brick)", max:10, group:"gym" },
  { id:"strength", label:"Strength (workout days)", color:"var(--sage)", max:10, group:"gym" },
  { id:"endurance", label:"Endurance (workout days)", color:"var(--mustard)", max:10, group:"gym" },
];

function dailyTotals(foodLog, water, gymLog, iso, person) {
  const entries = foodLog?.[iso]?.[person] || [];
  const t = entries.reduce((a, e) => ({ cal: a.cal + e.cal, p: a.p + e.p, c: a.c + e.c, f: a.f + e.f, fiber: a.fiber + (e.fiber || 0) }),
    { cal: 0, p: 0, c: 0, f: 0, fiber: 0 });
  const gym = gymLog?.[iso]?.[person];
  const w = water?.[iso]?.[person] || 0;
  return {
    ...t, water: w, energy: gym?.energy ?? null, strength: gym?.strength ?? null, endurance: gym?.endurance ?? null,
    hasData: entries.length > 0 || w > 0 || !!gym,
  };
}
function avg(nums) { const v = nums.filter((n) => n != null); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; }

/* ============================== HELP / TUTORIAL ================================ */

function HelpSection({ title, icon: Icon, color, defaultOpen, children }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="card mb-3 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="tap w-full flex items-center gap-3 px-4 py-3.5" style={{ background: open ? "var(--paper-3)" : "transparent" }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: color + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={16} color={color} />
        </div>
        <span className="font-display font-bold text-[15.5px]" style={{ flex: 1, textAlign: "left" }}>{title}</span>
        <ChevronRight size={16} style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform .15s", opacity: .5 }} />
      </button>
      {open && <div className="px-4 pb-4 pt-1">{children}</div>}
    </div>
  );
}

function HelpP({ children }) {
  return <p className="text-[13px] mb-2.5" style={{ color: "var(--ink-soft)", lineHeight: 1.55 }}>{children}</p>;
}
function HelpH({ children }) {
  return <div className="text-[12px] font-bold mt-3.5 mb-1.5" style={{ color: "var(--ink-faint)" }}>{children}</div>;
}
function HelpB({ children }) {
  return <div className="text-[13px] mb-1.5 flex gap-2" style={{ color: "var(--ink-soft)", lineHeight: 1.5 }}><span style={{ color: "var(--ink-faint)" }}>—</span><span>{children}</span></div>;
}

/* ------------------------------ guided tour steps ------------------------------ */
const TOUR_STEPS = [
  { view: "home", title: "Welcome to the Home tab", body: "This is your daily dashboard. The date bar up top lets you step through any day — past, today, or future — and everything below belongs to whichever date you're on." },
  { view: "home", title: "The Activity Rings", body: "Three rings — Calories (outer), Protein (middle), Carbs (inner) — fill toward your Profile targets as you log food. They only count what's actually logged, never just what's planned, so they always reflect reality." },
  { view: "home", title: "Timeline & Eaten Log", body: "Tap a timeline row's checkbox to log it as eaten. Tap its time to edit it. The Eaten Log below shows everything you've actually had that day, including anything you Log Food off-plan — try tapping around!" },
  { view: "week", title: "Week — your recurring plan", body: "This is a repeating weekly template, not one specific week. Try Lock, Swap, or Generate My Week — swapping shows every meal in your library, with favorites floating to the top." },
  { view: "meals", title: "Meals — Recipes & Pantry", body: "Recipes is your meal library — search, filter, view full instructions, and favorite the ones you want surfaced as swap options. Tap \"My Foods\" above to see your permanent pantry inventory, prices, and staples." },
  { view: "groceries", title: "Groceries — shopping & inventory", body: "Your list is calculated automatically: Need (from this week's plan) minus Have (from My Foods) equals Buy. Staples you're running low on show up here too, even if this week's recipes don't call for them. Try tapping an item to add it to My List." },
  { view: "profile", profileSub: "overview", title: "Profile — your targets & schedule", body: "Edit your daily targets, your permanent weekly workout schedule, and log your weight here. This is what actually drives the rings and the Workout/Recovery badge on Home and Week." },
  { view: "profile", profileSub: "preferences", title: "Food Preferences", body: "Set Love/Like/Neutral/Dislike/Never Recommend per food, per person. The Household tab shows where you two disagree — handy for planning shared meals with personalized add-ons." },
  { view: "profile", profileSub: "progress", title: "Progress — your real trends", body: "Week, Month, and Year views built entirely from what you've logged. The more consistently you check things off, the more this screen can actually tell you about your own patterns over time." },
];

function TourCaption({ step, total, title, body, onNext, onBack, onExit }) {
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 45,
      background: "var(--ink)", color: "#fff", padding: "calc(14px + env(safe-area-inset-top)) 18px 14px",
      boxShadow: "0 6px 24px rgba(0,0,0,.25)", borderRadius: "0 0 18px 18px",
    }}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10.5px] font-bold tracking-wide" style={{ color: "#F2C572" }}>TOUR · STEP {step + 1} OF {total}</span>
        <button onClick={onExit} className="tap" style={{ padding: 2 }}><X size={15} color="rgba(255,255,255,.7)" /></button>
      </div>
      <div className="font-display font-bold text-[15px] mb-1">{title}</div>
      <div className="text-[12.5px] mb-3" style={{ color: "rgba(255,255,255,.8)", lineHeight: 1.45 }}>{body}</div>
      <div className="flex gap-2">
        {step > 0 && <button onClick={onBack} className="tap" style={{ flex: 1, padding: "9px 0", borderRadius: 980, background: "rgba(255,255,255,.14)", color: "#fff", fontWeight: 600, fontSize: 13 }}>Back</button>}
        <button onClick={onNext} className="tap" style={{ flex: 2, padding: "9px 0", borderRadius: 980, background: "#F2C572", color: "var(--ink)", fontWeight: 700, fontSize: 13 }}>
          {step === total - 1 ? "Finish Tour" : "Next"}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------ Nutrition Library ------------------------------
   A small browsable reference — "shelves" (categories) of terms, each opening
   into a full entry with cross-references to related terms, so it reads more
   like flipping through a reference library than one long wall of text. */
const LIBRARY_SHELVES = [
  { id: "energy", label: "Energy & Macros", icon: Flame, color: "var(--brick)" },
  { id: "fats", label: "Fats & Cholesterol", icon: Droplet, color: "var(--plum)" },
  { id: "digestion", label: "Digestion & Food Quality", icon: Salad, color: "var(--sage)" },
  { id: "vitamins", label: "Vitamins & Minerals", icon: Star, color: "var(--mustard)" },
  { id: "hydration", label: "Hydration", icon: Droplet, color: "var(--steel)" },
  { id: "training", label: "Training & Movement", icon: Dumbbell, color: "var(--brick)" },
  { id: "body", label: "Body Measurements", icon: User, color: "var(--blue)" },
];

/* Built-in reference entries. The first dozen or so carry this app's own
   in-context explanations; the rest are sourced from NIH MedlinePlus, NHLBI,
   NIDDK, ODS, and NCI — public-domain U.S. government health definitions,
   lightly trimmed for length. "Source" is shown on each entry. Anything the
   user adds themselves (via "+ Add Term") is stored separately and merges
   in alongside these. */
const NUTRITION_TERMS = [
  // ---- Energy & Macros ----
  { id: "calories", term: "Calories", shelf: "energy",
    teaser: "The basic unit of energy in food.",
    full: "A unit of energy. Your body burns calories just existing — breathing, digesting, thinking — plus whatever activity you do on top of that. Eating roughly your target keeps your energy balance steady; consistently eating far above or below it is what drives weight change over time.",
    related: ["macros", "glycogen"] },
  { id: "protein", term: "Protein", shelf: "energy",
    teaser: "Builds and repairs muscle tissue.",
    full: "Builds and repairs muscle tissue — especially important around training, since workouts create small amounts of muscle damage that protein helps rebuild, stronger than before. It's also the most filling macro, which is why high-protein meals tend to curb snacking later. Complete proteins (meat, dairy) supply all the amino acids your body can't make on its own; plant proteins are incomplete on their own, so combining different plant sources matters if you're eating meat-free.",
    related: ["macros", "aminoacids"], source: "NIH MedlinePlus" },
  { id: "carbs", term: "Carbohydrates", shelf: "energy",
    teaser: "Your body's preferred quick-access fuel.",
    full: "Your body and brain's preferred quick-access fuel. Your digestive system changes carbohydrates into glucose, which your cells use for energy — any extra is stored in the liver and muscles as glycogen for later. Around workouts specifically, carbs matter more than usual, which is exactly why pre-workout snacks in this app lean carb-heavy.",
    related: ["glycogen", "netcarbs", "macros", "bloodglucose"], source: "NIH MedlinePlus" },
  { id: "fat", term: "Fat", shelf: "energy",
    teaser: "Calorie-dense, needed for hormones.",
    full: "Needed for hormone production and absorbing certain vitamins (A, D, E, K). It's calorie-dense — more than double protein or carbs per gram — which is why pre-workout snacks are deliberately kept lower in fat: fat slows digestion, and you don't want a heavy stomach heading into training.",
    related: ["macros", "totalfat"] },
  { id: "macros", term: "Macros (Macronutrients)", shelf: "energy",
    teaser: "Protein, carbs, and fat — together.",
    full: "Shorthand for protein, carbs, and fat together — the three nutrients that provide calories. \"Hitting your macros\" means hitting your individual targets for each, not just your total calorie number, since two meals with the same calories can affect training and recovery very differently depending on the mix.",
    related: ["protein", "carbs", "fat"] },
  { id: "glycogen", term: "Glycogen", shelf: "energy",
    teaser: "Stored carbs, ready for training.",
    full: "The stored form of carbohydrate your muscles and liver keep on reserve for quick energy. Training burns through it steadily, which is why refilling it with carbs beforehand — and again afterward — keeps energy and recovery on track.",
    related: ["carbs", "netcarbs"] },
  { id: "bloodglucose", term: "Blood Glucose", shelf: "energy",
    teaser: "Blood sugar — your body's main fuel source.",
    full: "Glucose, also called blood sugar, is the main sugar found in the blood and the main source of energy for your body. Carbohydrates are broken down into glucose during digestion.",
    related: ["carbs", "sugar", "glycemicindex"], source: "NIH MedlinePlus" },
  { id: "metabolism", term: "Metabolism", shelf: "energy",
    teaser: "How your body turns food into energy.",
    full: "The process your body uses to get or make energy from the food you eat.",
    related: ["bmr", "energybalance"], source: "NIH MedlinePlus" },
  { id: "bmr", term: "Basal Metabolic Rate", shelf: "energy",
    teaser: "The energy cost of just being alive.",
    full: "The measure of the energy necessary for maintaining basic functions, such as breathing, heart rate, and digestion — the calories you'd burn doing nothing at all.",
    related: ["metabolism", "energybalance"], source: "NIH MedlinePlus" },
  { id: "energybalance", term: "Energy Balance", shelf: "energy",
    teaser: "Calories in vs. calories out.",
    full: "The balance between the calories you get from eating and drinking and the calories you use up through physical activity and body processes like breathing and digesting food.",
    related: ["calories", "energyconsumed"], source: "National Institute of Diabetes and Digestive and Kidney Diseases" },
  { id: "energyconsumed", term: "Energy Consumed", shelf: "energy",
    teaser: "\"Energy in\" vs. \"energy out.\"",
    full: "Energy is another word for calories. What you eat and drink is \"energy in.\" What you burn through physical activity is \"energy out.\"",
    related: ["energybalance", "calories"], source: "National Heart, Lung, and Blood Institute" },
  { id: "digestion", term: "Digestion", shelf: "energy",
    teaser: "Breaking food down into nutrients.",
    full: "The process the body uses to break down food into nutrients, which it then uses for energy, growth, and cell repair.",
    related: ["enzymes", "nutrient"], source: "National Institute of Diabetes and Digestive and Kidney Diseases" },
  { id: "enzymes", term: "Enzymes", shelf: "energy",
    teaser: "Speed up chemical reactions in the body.",
    full: "Substances that speed up chemical reactions in the body — including the reactions involved in digesting food.",
    related: ["digestion"], source: "National Institute of Diabetes and Digestive and Kidney Diseases" },
  { id: "aminoacids", term: "Amino Acids", shelf: "energy",
    teaser: "The building blocks of protein.",
    full: "The building blocks of proteins. The body produces many amino acids and gets others from food. Amino acids are absorbed through the small intestine into the blood, which carries them throughout the body.",
    related: ["protein"], source: "NIH MedlinePlus" },
  { id: "fattyacid", term: "Fatty Acid", shelf: "energy",
    teaser: "A major component of dietary fat.",
    full: "A major component of fats, used by the body for energy and tissue development.",
    related: ["fat", "totalfat"], source: "National Cancer Institute" },

  // ---- Fats & Cholesterol ----
  { id: "totalfat", term: "Total Fat", shelf: "fats",
    teaser: "You need some — just not too much.",
    full: "Fat gives you energy and helps your body absorb vitamins. It also plays a major role in your cholesterol levels. Not all fats are equal — saturated and trans fats are the ones worth limiting.",
    related: ["saturatedfat", "transfat", "cholesterol"], source: "NIH MedlinePlus" },
  { id: "saturatedfat", term: "Saturated Fat", shelf: "fats",
    teaser: "Solid at room temperature; limit it.",
    full: "Solid at room temperature — found in full-fat dairy, coconut oil, lard, palm oil, and the skin/fat of poultry, among other foods. Eating a diet high in saturated fat raises blood cholesterol and heart disease risk.",
    related: ["totalfat", "cholesterol", "ldl"], source: "National Institute of Diabetes and Digestive and Kidney Diseases" },
  { id: "transfat", term: "Trans Fat", shelf: "fats",
    teaser: "Created industrially; worth avoiding.",
    full: "Created when liquid oils are turned into solid fats, like shortening and some margarines, to extend shelf life. Trans fat raises LDL (\"bad\") cholesterol and lowers HDL (\"good\") cholesterol.",
    related: ["ldl", "hdl", "totalfat"], source: "NIH MedlinePlus" },
  { id: "monofat", term: "Monounsaturated Fat", shelf: "fats",
    teaser: "The \"healthy fat\" — in moderation.",
    full: "Found in avocados, canola oil, nuts, olives and olive oil, and seeds. Eating more monounsaturated fat instead of saturated fat may help lower cholesterol — but it has the same calories as any other fat, so portion still matters.",
    related: ["totalfat", "polyfat"], source: "National Institute of Diabetes and Digestive and Kidney Diseases" },
  { id: "polyfat", term: "Polyunsaturated Fat", shelf: "fats",
    teaser: "Liquid at room temp — omega-3 & -6.",
    full: "Liquid at room temperature. Omega-6 fatty acids come from vegetable oils like corn, safflower, and soybean oil. Omega-3s come from canola oil, flaxseed, walnuts, and fish and shellfish.",
    related: ["monofat", "fattyacid"], source: "National Institute of Diabetes and Digestive and Kidney Diseases" },
  { id: "cholesterol", term: "Cholesterol", shelf: "fats",
    teaser: "Waxy substance your body needs — in the right amount.",
    full: "A waxy, fat-like substance found in every cell. Your body needs some to make hormones, vitamin D, and digestive substances, and makes all it needs on its own — but it's also found in some foods, and high blood levels raise heart disease risk.",
    related: ["hdl", "ldl", "triglycerides"], source: "National Heart, Lung, and Blood Institute" },
  { id: "hdl", term: "HDL (\"Good\" Cholesterol)", shelf: "fats",
    teaser: "Carries cholesterol back to the liver.",
    full: "High-density lipoprotein — carries cholesterol from other parts of the body back to the liver, which removes it. Higher HDL is generally better.",
    related: ["cholesterol", "ldl"], source: "National Heart, Lung, and Blood Institute" },
  { id: "ldl", term: "LDL (\"Bad\" Cholesterol)", shelf: "fats",
    teaser: "Builds up in arteries when levels run high.",
    full: "Low-density lipoprotein — carries cholesterol throughout the body. A high LDL level leads to a buildup of cholesterol in your arteries.",
    related: ["cholesterol", "hdl", "saturatedfat"], source: "National Heart, Lung, and Blood Institute" },
  { id: "triglycerides", term: "Triglycerides", shelf: "fats",
    teaser: "A type of fat found in the blood.",
    full: "A type of fat found in your blood. Too much may raise the risk of coronary artery heart disease, especially in women.",
    related: ["cholesterol"], source: "National Heart, Lung, and Blood Institute" },

  // ---- Digestion & Food Quality ----
  { id: "fiber", term: "Fiber", shelf: "digestion",
    teaser: "The part of carbs you don't digest.",
    full: "A type of carbohydrate your body can't fully digest — labeled as soluble or insoluble fiber on food labels. It helps you feel full longer, aids digestion, helps prevent constipation, and helps regulate blood sugar. Found in vegetables, fruit, beans, and whole grains — notably low in most fast food, which is part of why the fast-food recommendations in this app call out fiber where it's genuinely present.",
    related: ["netcarbs", "quality"], source: "NIH MedlinePlus" },
  { id: "netcarbs", term: "Net Carbs", shelf: "digestion",
    teaser: "Total carbs minus fiber.",
    full: "Total carbohydrates minus fiber — the carbs your body actually absorbs and uses for energy. This app tracks total carbs rather than net carbs, since total carbs is what matters most for workout fueling purposes.",
    related: ["carbs", "fiber"] },
  { id: "addedsugar", term: "Added Sugar", shelf: "digestion",
    teaser: "Sugar put in, not naturally there.",
    full: "Sugar added during processing — separate from the natural sugar already in fruit or dairy. It's counted the same as any other carb calorie-wise, but adds little else nutritionally, which is why whole foods with naturally occurring sugar (like fruit) are generally the better pick over similarly-sweet processed snacks.",
    related: ["carbs", "quality", "sugar"] },
  { id: "sugar", term: "Sugar", shelf: "digestion",
    teaser: "A simple, sweet carbohydrate.",
    full: "A type of simple carbohydrate with a sweet taste. Found naturally in fruit, vegetables, milk, and dairy — and also added to many foods during processing. Your digestive system breaks all sugar down into glucose for your cells to use.",
    related: ["addedsugar", "bloodglucose", "carbs"], source: "NIH MedlinePlus" },
  { id: "glycemicindex", term: "Glycemic Index", shelf: "digestion",
    teaser: "How fast a carb raises blood sugar.",
    full: "Measures how a carbohydrate-containing food raises blood sugar. Higher-GI foods spike blood sugar faster — part of why quick, higher-GI carbs are recommended right before a workout, when fast energy is the goal.",
    related: ["bloodglucose", "carbs"], source: "NIH MedlinePlus" },
  { id: "gluten", term: "Gluten", shelf: "digestion",
    teaser: "A protein in wheat, rye, and barley.",
    full: "A protein found in wheat, rye, and barley — and sometimes in less obvious places like supplements or lip balm. This app's gluten-free tagging on foods and meals is built around avoiding these grains.",
    related: [], source: "National Institute of Diabetes and Digestive and Kidney Diseases" },
  { id: "nutrient", term: "Nutrient", shelf: "digestion",
    teaser: "What your body actually uses from food.",
    full: "Chemical compounds in food that the body uses to function properly and maintain health — protein, fat, carbohydrates, vitamins, and minerals are all nutrients.",
    related: ["nutrition", "macros"], source: "National Institutes of Health, Office of Dietary Supplements" },
  { id: "nutrition", term: "Nutrition", shelf: "digestion",
    teaser: "The study of food and how it fuels you.",
    full: "The field of study focused on foods and the substances in them that help the body grow and stay healthy. Eating well in the right amounts gives you energy for daily activity, helps maintain a healthy weight, and can lower risk for diseases like diabetes and heart disease.",
    related: ["nutrient", "diet"], source: "National Institutes of Health, Office of Dietary Supplements" },
  { id: "diet", term: "Diet", shelf: "digestion",
    teaser: "What you eat and drink, overall.",
    full: "Made up of everything you eat and drink. There are many kinds — vegetarian, weight-focused, or built around a specific health condition — but at its simplest, your diet is just your overall pattern of eating.",
    related: ["nutrition"], source: "NIH MedlinePlus" },
  { id: "quality", term: "Whole Foods vs. Processed", shelf: "digestion",
    teaser: "How much a food's been altered.",
    full: "Whole foods (a chicken breast, an apple, rice) are close to their natural state; processed foods have been altered — often with added sugar, sodium, or fat — for shelf life or flavor. Processing isn't automatically bad, but leaning toward whole foods for the bulk of your meals generally means more fiber and micronutrients for the same calories.",
    related: ["fiber", "addedsugar"] },
  { id: "dietarysupplements", term: "Dietary Supplements", shelf: "digestion",
    teaser: "Not the same testing bar as drugs.",
    full: "A product taken to supplement the diet — containing one or more ingredients like vitamins, minerals, herbs, or amino acids. Unlike drugs, supplements don't have to go through the same testing for effectiveness and safety before reaching shelves.",
    related: ["multivitamin", "rda"], source: "National Institutes of Health, Office of Dietary Supplements" },

  // ---- Vitamins & Minerals ----
  { id: "vitamins", term: "Vitamins", shelf: "vitamins",
    teaser: "Substances the body needs in small amounts.",
    full: "Substances the body needs to develop and function normally — vitamins A, C, D, E, K, choline, and the B vitamins (thiamin, riboflavin, niacin, pantothenic acid, biotin, B6, B12, folate).",
    related: ["fatsolublevitamins", "watersolublevitamins"], source: "National Institutes of Health, Office of Dietary Supplements" },
  { id: "fatsolublevitamins", term: "Fat-Soluble Vitamins", shelf: "vitamins",
    teaser: "A, D, E, K — stored in body fat.",
    full: "Vitamins A, D, E, and K. Unlike water-soluble vitamins, the body stores these in the liver and fatty tissue, which is part of why dietary fat helps your body absorb them.",
    related: ["watersolublevitamins", "vitamind"], source: "National Institute of Diabetes and Digestive and Kidney Diseases" },
  { id: "watersolublevitamins", term: "Water-Soluble Vitamins", shelf: "vitamins",
    teaser: "The B vitamins and vitamin C.",
    full: "All the B vitamins plus vitamin C. The body doesn't store these easily and flushes the extra out in urine — meaning a steady supply from food matters more than with fat-soluble vitamins.",
    related: ["fatsolublevitamins", "vitaminc"], source: "National Institute of Diabetes and Digestive and Kidney Diseases" },
  { id: "vitamina", term: "Vitamin A", shelf: "vitamins",
    teaser: "Vision, bone growth, immune function.",
    full: "Plays a role in vision, bone growth, reproduction, cell function, and the immune system. Plant sources include colorful fruits and vegetables; animal sources include liver and whole milk.",
    related: ["fatsolublevitamins"], source: "NIH MedlinePlus" },
  { id: "vitaminb6", term: "Vitamin B6", shelf: "vitamins",
    teaser: "Involved in metabolism and immune function.",
    full: "Needed for many chemical reactions involved in metabolism, plus brain development during pregnancy and infancy and general immune function.",
    related: ["watersolublevitamins"], source: "National Institutes of Health, Office of Dietary Supplements" },
  { id: "vitaminb12", term: "Vitamin B12", shelf: "vitamins",
    teaser: "Nerve health, DNA, and red blood cells.",
    full: "Keeps nerve and blood cells healthy and helps make DNA. Also helps prevent a type of anemia that causes tiredness and weakness. Found naturally in animal foods, and added to many fortified foods.",
    related: ["watersolublevitamins"], source: "National Institutes of Health, Office of Dietary Supplements" },
  { id: "vitaminc", term: "Vitamin C", shelf: "vitamins",
    teaser: "Antioxidant, skin and bone support.",
    full: "An antioxidant important for skin, bones, and connective tissue. Promotes healing and helps the body absorb iron. Good sources: citrus, peppers, tomatoes, broccoli, and leafy greens.",
    related: ["antioxidants", "watersolublevitamins"], source: "NIH MedlinePlus" },
  { id: "vitamind", term: "Vitamin D", shelf: "vitamins",
    teaser: "Helps you absorb calcium.",
    full: "Helps your body absorb calcium, a main building block of bone — a lack of it can contribute to bone diseases. You get it from sunlight, diet, and supplements; egg yolks, saltwater fish, and liver are good food sources.",
    related: ["calcium", "fatsolublevitamins"], source: "NIH MedlinePlus" },
  { id: "vitamine", term: "Vitamin E", shelf: "vitamins",
    teaser: "Antioxidant supporting immune function.",
    full: "An antioxidant that plays a role in immune function and metabolic processes. Good sources include vegetable oils, nuts and seeds, and leafy greens.",
    related: ["antioxidants", "fatsolublevitamins"], source: "NIH MedlinePlus" },
  { id: "vitamink", term: "Vitamin K", shelf: "vitamins",
    teaser: "Blood clotting and bone proteins.",
    full: "Helps make proteins for healthy bones and tissues, and for blood clotting. Mostly found in green vegetables and dark berries; your gut bacteria also produce a small amount.",
    related: ["fatsolublevitamins"], source: "NIH MedlinePlus" },
  { id: "folate", term: "Folate", shelf: "vitamins",
    teaser: "Needed for DNA and cell division.",
    full: "A B-vitamin the body needs to make DNA and for cells to divide. Especially important for women before and during pregnancy, where it can help prevent major birth defects.",
    related: ["watersolublevitamins"], source: "National Institutes of Health, Office of Dietary Supplements" },
  { id: "niacin", term: "Niacin", shelf: "vitamins",
    teaser: "A B-vitamin for enzymes, skin, nerves.",
    full: "A nutrient in the vitamin B complex, needed in small amounts. Helps enzymes work properly and keeps skin, nerves, and the digestive tract healthy.",
    related: ["watersolublevitamins"], source: "National Cancer Institute" },
  { id: "minerals", term: "Minerals", shelf: "vitamins",
    teaser: "Elements your body needs from food.",
    full: "Elements the body needs to develop and function normally, including calcium, phosphorus, potassium, sodium, chloride, magnesium, iron, zinc, iodine, and selenium.",
    related: ["calcium", "iron", "magnesium"], source: "National Institutes of Health, Office of Dietary Supplements" },
  { id: "calcium", term: "Calcium", shelf: "vitamins",
    teaser: "Builds bones, teeth, and more.",
    full: "Stored almost entirely in bones and teeth to keep them strong. Also needed for muscles and blood vessels to contract and expand, for nerve signaling, and for hormone release.",
    related: ["vitamind", "minerals"], source: "National Institutes of Health, Office of Dietary Supplements" },
  { id: "iron", term: "Iron", shelf: "vitamins",
    teaser: "Carries oxygen through the blood.",
    full: "Part of hemoglobin, the protein that carries oxygen from the lungs to the rest of the body, including muscles. Also important for cell growth and making certain hormones and connective tissue.",
    related: ["minerals"], source: "National Institutes of Health, Office of Dietary Supplements" },
  { id: "magnesium", term: "Magnesium", shelf: "vitamins",
    teaser: "Muscle, nerve, and blood sugar regulation.",
    full: "Helps regulate muscle and nerve function, blood sugar levels, and blood pressure. Also helps the body make protein, bone, and DNA.",
    related: ["electrolytes", "minerals"], source: "National Institutes of Health, Office of Dietary Supplements" },
  { id: "phosphorus", term: "Phosphorus", shelf: "vitamins",
    teaser: "Bone health and cell function.",
    full: "Helps keep bones healthy and supports blood vessel and muscle function. Found naturally in high-protein foods like meat, fish, nuts, and dairy.",
    related: ["calcium", "minerals"], source: "National Institute of Diabetes and Digestive and Kidney Diseases" },
  { id: "potassium", term: "Potassium", shelf: "vitamins",
    teaser: "Blood pressure and fluid balance.",
    full: "Needed by your cells, nerves, and muscles to function properly. Helps regulate blood pressure, heart rhythm, and the water content in cells.",
    related: ["electrolytes", "sodium"], source: "NIH MedlinePlus" },
  { id: "sodium", term: "Sodium", shelf: "vitamins",
    teaser: "Nerve and muscle function, fluid balance.",
    full: "The element in table salt (sodium chloride). Needed in the right amount for nerve and muscle function and to keep the right fluid balance in the body — which is why sodium matters specifically around longer or sweatier workouts.",
    related: ["electrolytes", "potassium"], source: "NIH MedlinePlus" },
  { id: "zinc", term: "Zinc", shelf: "vitamins",
    teaser: "Immune support and wound healing.",
    full: "Found in cells throughout the body. Helps the immune system fight bacteria and viruses, supports wound healing, and is important for taste and smell.",
    related: ["minerals"], source: "National Institutes of Health, Office of Dietary Supplements" },
  { id: "iodine", term: "Iodine", shelf: "vitamins",
    teaser: "Needed to make thyroid hormones.",
    full: "Needed to make thyroid hormones, which control the body's metabolism and other functions, and are important for bone and brain development during pregnancy and infancy.",
    related: ["minerals", "metabolism"], source: "National Institutes of Health, Office of Dietary Supplements" },
  { id: "selenium", term: "Selenium", shelf: "vitamins",
    teaser: "Reproduction, thyroid, DNA production.",
    full: "Important for reproduction, thyroid function, and DNA production. Also helps protect cells from damage caused by free radicals and infections.",
    related: ["minerals", "antioxidants"], source: "National Institutes of Health, Office of Dietary Supplements" },
  { id: "antioxidants", term: "Antioxidants", shelf: "vitamins",
    teaser: "May help prevent some cell damage.",
    full: "Substances that may prevent or delay some types of cell damage — beta-carotene, lutein, lycopene, selenium, and vitamins C and E are common examples, found in many fruits and vegetables.",
    related: ["vitaminc", "vitamine", "selenium"], source: "National Institutes of Health, Office of Dietary Supplements" },
  { id: "multivitamin", term: "Multivitamin/Mineral Supplements", shelf: "vitamins",
    teaser: "A combined vitamin + mineral supplement.",
    full: "Supplements that combine a range of vitamins and minerals, sometimes with other ingredients like herbs. Help fill gaps when it's hard to get enough of certain nutrients from food alone.",
    related: ["dietarysupplements", "rda"], source: "National Institutes of Health, Office of Dietary Supplements" },
  { id: "rda", term: "Recommended Dietary Allowance (RDA)", shelf: "vitamins",
    teaser: "The daily target for a nutrient.",
    full: "The amount of a given nutrient you should get each day. RDAs vary by age, gender, and whether a woman is pregnant or breastfeeding.",
    related: ["dailyvalue"], source: "National Institutes of Health, Office of Dietary Supplements" },
  { id: "dailyvalue", term: "Daily Value (DV)", shelf: "vitamins",
    teaser: "The % on a nutrition label.",
    full: "Tells you what percentage of a nutrient one serving of a food or supplement provides, compared to the recommended daily amount — the number you see as \"% DV\" on nutrition labels.",
    related: ["rda"], source: "National Institutes of Health, Office of Dietary Supplements" },

  // ---- Hydration ----
  { id: "hydration", term: "Hydration", shelf: "hydration",
    teaser: "Water, tracked separately from food.",
    full: "Water intake, tracked separately from food. How much you need depends on your size, activity level, and climate. Even mild dehydration measurably reduces workout performance and energy, which is part of why the Home hydration bar and the Energy Check-In both ask about it.",
    related: ["electrolytes", "dehydration"], source: "NIH MedlinePlus" },
  { id: "dehydration", term: "Dehydration", shelf: "hydration",
    teaser: "Not enough fluid to work properly.",
    full: "Happens when you don't take in enough liquid to replace what you lose through urinating, sweating, or illness. Without enough fluid and electrolytes, your body can't work properly — which shows up as low energy, headaches, and reduced workout performance.",
    related: ["hydration", "electrolytes"], source: "NIH MedlinePlus" },
  { id: "electrolytes", term: "Electrolytes", shelf: "hydration",
    teaser: "Minerals lost through sweat.",
    full: "Minerals in body fluids — mainly sodium, potassium, magnesium, and chloride. Plain water replaces fluid but not these; on longer or harder training days, a meal or snack with some sodium alongside water helps more than water alone.",
    related: ["hydration", "sodium", "potassium"], source: "NIH MedlinePlus" },

  // ---- Training & Movement ----
  { id: "aerobic", term: "Aerobic Exercise", shelf: "training",
    teaser: "Gets your heart and lungs working.",
    full: "Activity that moves your large muscles — arms and legs — making you breathe harder and your heart beat faster. Running, swimming, walking, and biking are all examples. Regular aerobic activity makes your heart and lungs stronger over time.",
    related: ["heartrate", "targetheartrate"], source: "National Heart, Lung, and Blood Institute" },
  { id: "strengthtraining", term: "Strength Training", shelf: "training",
    teaser: "Resistance work that builds muscle.",
    full: "Exercise that works your muscles by making you push or pull against resistance — weights, bands, or your own bodyweight. Strengthens muscle and can improve bone strength and balance.",
    related: ["aerobic", "flexibility"], source: "National Institute of Diabetes and Digestive and Kidney Diseases" },
  { id: "flexibility", term: "Flexibility (Training)", shelf: "training",
    teaser: "Stretching to improve range of motion.",
    full: "Exercise that stretches and lengthens muscles, improving joint flexibility and keeping muscles limber — which helps prevent injury. Yoga, tai chi, and pilates are common examples.",
    related: ["strengthtraining", "warmup", "cooldown"], source: "National Heart, Lung, and Blood Institute" },
  { id: "warmup", term: "Warm Up", shelf: "training",
    teaser: "Ease into activity, about 5–10 min.",
    full: "Starting a workout at a slow-to-medium pace to give your body time to prepare for more vigorous movement — typically 5 to 10 minutes.",
    related: ["cooldown"], source: "National Heart, Lung, and Blood Institute" },
  { id: "cooldown", term: "Cool Down", shelf: "training",
    teaser: "Ease out of activity, 5+ min.",
    full: "Ending a workout by gradually slowing down — moving from jogging to walking, for example — so your body can relax gradually. Usually 5 minutes or more.",
    related: ["warmup"], source: "National Heart, Lung, and Blood Institute" },
  { id: "heartrate", term: "Heart Rate", shelf: "training",
    teaser: "Your pulse, in beats per minute.",
    full: "How many times your heart beats per minute. A resting adult pulse is usually 60–100 beats per minute after at least 10 minutes of rest.",
    related: ["maxheartrate", "targetheartrate"], source: "National Heart, Lung, and Blood Institute" },
  { id: "maxheartrate", term: "Maximum Heart Rate", shelf: "training",
    teaser: "The fastest your heart can beat.",
    full: "The fastest your heart can beat — used as the basis for calculating training intensity zones like target heart rate.",
    related: ["heartrate", "targetheartrate"], source: "National Heart, Lung, and Blood Institute" },
  { id: "targetheartrate", term: "Target Heart Rate", shelf: "training",
    teaser: "Your ideal training-intensity zone.",
    full: "A percentage of your maximum heart rate, based on age. The activity level best for general health uses 50–75% of max heart rate — that range is your target heart rate zone.",
    related: ["maxheartrate", "heartrate"], source: "National Heart, Lung, and Blood Institute" },
  { id: "activitycount", term: "Activity Count", shelf: "training",
    teaser: "Any movement that takes more energy than resting.",
    full: "Physical activity is any body movement that works your muscles and takes more energy than resting — walking, dancing, gardening, and yoga all count, not just structured workouts.",
    related: ["aerobic"], source: "National Heart, Lung, and Blood Institute" },
  { id: "perspiration", term: "Perspiration", shelf: "training",
    teaser: "Sweat — your body's cooling system.",
    full: "A clear, salty liquid produced by skin glands as your body's way of cooling itself. Sweating heavily during exercise is normal and part of why electrolyte and fluid replacement matters on hard training days.",
    related: ["electrolytes", "dehydration"], source: "NIH MedlinePlus" },

  // ---- Body Measurements ----
  { id: "bmi", term: "Body Mass Index (BMI)", shelf: "body",
    teaser: "An estimate of body fat from height + weight.",
    full: "An estimate of body fat, calculated from height and weight. Categorizes you as underweight, normal, overweight, or obese, and can help gauge risk for weight-related conditions — though it doesn't account for muscle mass, so it's a rough estimate, not a full picture.",
    related: ["weight", "height"], source: "National Heart, Lung, and Blood Institute" },
  { id: "weight", term: "Weight (Body Mass)", shelf: "body",
    teaser: "Tracked in Profile over time.",
    full: "The mass or quantity of your heaviness, in pounds or kilograms. This app's Weight section under Profile lets you log it over time against a goal, separate from day-to-day nutrition tracking.",
    related: ["bmi"], source: "NIH MedlinePlus" },
  { id: "height", term: "Height", shelf: "body",
    teaser: "Used alongside weight for BMI.",
    full: "The distance from the bottom of your feet to the top of your head when standing up straight — used together with weight to estimate BMI.",
    related: ["bmi", "weight"], source: "NIH MedlinePlus" },
  { id: "bloodpressure", term: "Blood Pressure", shelf: "body",
    teaser: "The force of blood against artery walls.",
    full: "The force of blood pushing against artery walls as your heart pumps. Written as two numbers: systolic (pressure during a heartbeat) over diastolic (pressure at rest between beats) — for example, 120/80.",
    related: ["heartrate"], source: "National Heart, Lung, and Blood Institute" },
  { id: "bodytemperature", term: "Body Temperature", shelf: "body",
    teaser: "A measure of your body's heat level.",
    full: "A measure of your body's level of heat — a normal baseline that can shift with illness, activity, or environment.",
    related: [], source: "NIH MedlinePlus" },
];


const CUSTOM_SHELF = { id: "custom", label: "Your Own Entries", icon: Star, color: "var(--blue)" };

function AddTermForm({ onSave, onCancel }) {
  const [term, setTerm] = useState("");
  const [aka, setAka] = useState("");
  const [full, setFull] = useState("");
  const [shelf, setShelf] = useState("energy");
  const canSave = term.trim() && full.trim();
  return (
    <div>
      <Field label="Term or name"><input value={term} onChange={(e) => setTerm(e.target.value)} className="input" placeholder="e.g. Creatine" /></Field>
      <div className="mt-3"><Field label="Also known as (optional)"><input value={aka} onChange={(e) => setAka(e.target.value)} className="input" placeholder="e.g. Creatine monohydrate" /></Field></div>
      <div className="mt-3">
        <span className="text-[11.5px] font-bold block mb-1" style={{ color: "var(--ink-faint)" }}>Shelf</span>
        <div className="scrollx flex gap-1.5 pb-1">
          {LIBRARY_SHELVES.map((s) => (
            <button key={s.id} onClick={() => setShelf(s.id)} className="tap chip" style={{ whiteSpace: "nowrap", ...(shelf === s.id ? { background: s.color, color: "#fff", borderColor: s.color } : {}) }}>{s.label}</button>
          ))}
        </div>
      </div>
      <div className="mt-3">
        <span className="text-[11.5px] font-bold block mb-1" style={{ color: "var(--ink-faint)" }}>What it means</span>
        <textarea value={full} onChange={(e) => setFull(e.target.value)} className="input" rows={4} placeholder="Plain-English definition, why it matters, whatever's common knowledge about it…" />
      </div>
      <div className="flex gap-2 mt-4">
        <button onClick={onCancel} className="tap btn-ghost" style={{ flex: 1, padding: "12px 0" }}>Cancel</button>
        <button disabled={!canSave} onClick={() => onSave({ term: term.trim(), aka: aka.trim(), full: full.trim(), shelf })}
          className="tap btn-primary" style={{ flex: 1, padding: "12px 0", opacity: canSave ? 1 : .4 }}>Add to Library</button>
      </div>
    </div>
  );
}

function LibraryScreen({ onBack, customTerms, addCustomTerm, removeCustomTerm }) {
  const [shelf, setShelf] = useState("all");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState(null);
  const [adding, setAdding] = useState(false);

  const allTerms = useMemo(() => [
    ...NUTRITION_TERMS,
    ...customTerms.map((t) => ({ ...t, shelf: "custom", teaser: t.aka || t.full.slice(0, 46) + (t.full.length > 46 ? "…" : ""), related: [] })),
  ], [customTerms]);
  const allShelves = useMemo(() => customTerms.length ? [...LIBRARY_SHELVES, CUSTOM_SHELF] : LIBRARY_SHELVES, [customTerms]);
  const termsById = useMemo(() => { const m = {}; allTerms.forEach((t) => (m[t.id] = t)); return m; }, [allTerms]);
  const filtered = allTerms.filter((t) =>
    (shelf === "all" || t.shelf === shelf) && (t.term.toLowerCase().includes(q.toLowerCase()) || (t.aka || "").toLowerCase().includes(q.toLowerCase()))
  );
  const open = openId ? termsById[openId] : null;
  const openShelf = open ? allShelves.find((s) => s.id === open.shelf) : null;

  return (
    <div>
      <div className="flex items-center gap-2 px-5 pt-6 pb-2">
        <button onClick={onBack} className="tap" style={{ padding: 4 }}><ArrowLeft size={19} /></button>
        <h1 className="font-display font-bold text-[23px]">Nutrition Library</h1>
      </div>
      <div className="px-5 pt-2 pb-3">
        <p className="text-[13px] mb-3" style={{ color: "var(--ink-soft)", lineHeight: 1.55 }}>
          {NUTRITION_TERMS.length} reference entries — mostly sourced from NIH and other U.S. health agencies — plus anything you've added yourselves.
        </p>
        <button onClick={() => setAdding(true)} className="tap btn-primary w-full flex items-center justify-center gap-2 mb-3" style={{ padding: "13px 0" }}>
          <Plus size={16} /> Add Your Own Term
        </button>
        <div className="flex items-center gap-2 px-3 rounded-2xl mb-2.5" style={{ background: "var(--paper-3)" }}>
          <Search size={13} style={{ color: "var(--ink-faint)" }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the library…" className="input" style={{ border: "none", padding: "9px 0", background: "transparent", fontSize: 13 }} />
        </div>
        <div className="scrollx flex gap-1.5 pb-0.5">
          <button onClick={() => setShelf("all")} className="tap chip" style={{ whiteSpace: "nowrap", ...(shelf === "all" ? { background: "var(--ink)", color: "var(--paper-2)", borderColor: "var(--ink)" } : {}) }}>All Shelves</button>
          {allShelves.map((s) => (
            <button key={s.id} onClick={() => setShelf(s.id)} className="tap chip" style={{ whiteSpace: "nowrap", ...(shelf === s.id ? { background: s.color, color: "#fff", borderColor: s.color } : {}) }}>{s.label}</button>
          ))}
        </div>
      </div>

      <div className="px-5 pb-8">
        {filtered.length === 0 && <EmptyNote>No entries match that search.</EmptyNote>}
        <div className="grid grid-cols-2 gap-2">
          {filtered.map((t) => {
            const s = allShelves.find((sh) => sh.id === t.shelf) || CUSTOM_SHELF;
            const Icon = s.icon;
            return (
              <button key={t.id} onClick={() => setOpenId(t.id)} className="tap text-left p-3 rounded-2xl" style={{ background: "var(--paper-2)", border: `1px solid var(--line-soft)`, borderLeft: `3px solid ${s.color}` }}>
                <Icon size={13} color={s.color} style={{ marginBottom: 4 }} />
                <div className="font-display font-bold text-[12.5px] leading-tight">{t.term}</div>
                <div className="text-[10.5px] mt-0.5" style={{ color: "var(--ink-faint)", lineHeight: 1.3 }}>{t.teaser}</div>
              </button>
            );
          })}
        </div>
      </div>

      {open && (
        <Sheet title={open.term} onClose={() => setOpenId(null)}>
          <span className="chip inline-flex items-center gap-1 mb-3" style={{ background: openShelf.color + "22", borderColor: "transparent", color: openShelf.color }}>
            <openShelf.icon size={11} /> {openShelf.label}
          </span>
          {open.aka && <div className="text-[12px] mb-2" style={{ color: "var(--ink-faint)" }}>Also known as: {open.aka}</div>}
          <p className="text-[13.5px]" style={{ color: "var(--ink-soft)", lineHeight: 1.6 }}>{open.full}</p>
          {open.source && <div className="text-[11px] mt-3" style={{ color: "var(--ink-faint)" }}>Source: {open.source}</div>}
          {open.related && open.related.length > 0 && (
            <div className="mt-5">
              <div className="text-[12px] font-bold mb-2" style={{ color: "var(--ink-faint)" }}>SEE ALSO</div>
              <div className="flex gap-1.5 flex-wrap">
                {open.related.map((rid) => (
                  <button key={rid} onClick={() => setOpenId(rid)} className="tap chip">{termsById[rid]?.term}</button>
                ))}
              </div>
            </div>
          )}
          {open.custom && (
            <button onClick={() => { removeCustomTerm(open.id); setOpenId(null); }} className="tap text-[12.5px] font-semibold mt-5" style={{ color: "var(--brick)" }}>Remove This Entry</button>
          )}
        </Sheet>
      )}

      {adding && (
        <Sheet title="Add Your Own Term" onClose={() => setAdding(false)}>
          <AddTermForm onCancel={() => setAdding(false)} onSave={(draft) => { addCustomTerm(draft); setAdding(false); }} />
        </Sheet>
      )}
    </div>
  );
}

function HelpScreen({ onBack, onStartTour, onOpenLibrary }) {
  return (
    <div>
      <div className="flex items-center gap-2 px-5 pt-6 pb-2">
        <button onClick={onBack} className="tap" style={{ padding: 4 }}><ArrowLeft size={19} /></button>
        <h1 className="font-display font-bold text-[23px]">How to Use Trophé</h1>
      </div>
      <div className="px-5 pt-3 pb-2">
        <p className="text-[13px] mb-3" style={{ color: "var(--ink-soft)", lineHeight: 1.55 }}>
          A tab-by-tab walkthrough of everything Trophé does, plus a deep dive into what the statistics actually mean and why logging consistently pays off. Tap any section to expand it — or take the interactive tour, which walks you through the real screens.
        </p>
        <button onClick={onStartTour} className="tap btn-primary w-full flex items-center justify-center gap-2 mb-2" style={{ padding: "13px 0" }}>
          <Sparkles size={16} /> Start Interactive Tour
        </button>
      </div>

      <div className="px-5 pb-8">

        <HelpSection title="Home — Your Daily Dashboard" icon={HomeIcon} color="var(--blue)" defaultOpen>
          <HelpP>Home is where you land every day. It answers three questions at a glance: what should I eat next, how am I tracking today, and is today a workout day.</HelpP>

          <HelpH>THE DATE BAR</HelpH>
          <HelpP>The arrows step you one day at a time; tapping the date pill opens a full calendar picker with quick jumps to "Today," "1 week ago," and "1 month ago." Every stat on this screen — rings, water, timeline, eaten log — belongs to whichever date you're viewing, not always today. Go back a week to log something you forgot, or forward to preview a plan.</HelpP>

          <HelpH>THE ACTIVITY RINGS</HelpH>
          <HelpP>The three concentric rings work like a fitness tracker's rings: <b style={{ color: "var(--ink)" }}>Calories</b> (outer, red-orange), <b style={{ color: "var(--ink)" }}>Protein</b> (middle, green), and <b style={{ color: "var(--ink)" }}>Carbs</b> (inner, blue). Each ring fills toward your daily target from Profile. The number in the center is your total calories logged so far that day. To the right, the same three numbers appear as plain figures alongside Fat, so you get both the at-a-glance visual and the exact numbers.</HelpP>
          <HelpP><b style={{ color: "var(--ink)" }}>Important:</b> the rings only count food you've actually logged — either by checking off a timeline item or using Log Food. A fully planned day with nothing checked off shows empty rings. That's intentional: the rings track reality, not intention.</HelpP>

          <HelpH>WORKOUT / RECOVERY BADGE</HelpH>
          <HelpP>Tap the "• Workout Day" or "• Recovery Day" text next to the date to override just that one day — useful for "I'm skipping today, training tomorrow instead." A small ✎ appears when a day's been overridden. This is different from your permanent weekly pattern, which lives in Profile (see below) — think of the badge as a one-time exception, and Profile as the rule.</HelpP>

          <HelpH>HYDRATION</HelpH>
          <HelpP>Use +8oz/+16oz for quick logging, type any amount into the small box and hit the plus, or tap the running total itself to type an exact number directly.</HelpP>

          <HelpH>NEXT UP</HelpH>
          <HelpP>Only appears when you're viewing today, since it's a live countdown. It shows whatever's next on your timeline that isn't checked off yet. If it's a pre-workout slot on a workout day, it counts down the minutes to your gym time and recommends fast carbs; otherwise it just shows the next meal.</HelpP>

          <HelpH>TIMELINE</HelpH>
          <HelpP>Each row is a planned slot for that weekday. Tap the time to edit it (just for this date — it won't move every future occurrence of that weekday). Tap the circle checkbox to mark it eaten, which adds it to your rings and to the Eaten log below. Tap the row itself to see the full recipe.</HelpP>

          <HelpH>EATEN LOG</HelpH>
          <HelpP>This is your actual food diary for the day — every timeline item you checked off, plus anything logged through "Log Food" that wasn't on the plan at all (a quick add, something from your pantry, or a meal from the library eaten off-schedule). This is the one place that shows the complete, honest picture of what was eaten, planned or not.</HelpP>

          <HelpH>QUICK ACTIONS</HelpH>
          <HelpB><b>Generate My Week</b> jumps to the Week tab's generator.</HelpB>
          <HelpB><b>Build Grocery Order</b> jumps to Groceries.</HelpB>
          <HelpB><b>Log Food</b> opens the food diary entry sheet.</HelpB>
          <HelpB><b>Add Food to Pantry</b> creates a brand-new item in your food database.</HelpB>
          <HelpB><b>I Need a Snack</b> asks how hungry you are and how long until your workout, then recommends something.</HelpB>
          <HelpB><b>Eating Out Tonight</b> helps you fit a restaurant meal into today's remaining calories.</HelpB>
          <HelpB><b>Energy Check-In</b> works any time of day — how you feel, hunger, hydration, sleep, and how long since you last ate. Flip on "Connected to a workout?" to also get pre-workout fueling advice and log post-workout numbers; leave it off for a plain energy check-in. Either way, it's what powers the Energy charts in Progress.</HelpB>
          <HelpB><b>See Trends</b> jumps straight to the Progress screen.</HelpB>
        </HelpSection>

        <HelpSection title="Week — The Recurring Plan" icon={CalendarDays} color="var(--sage)">
          <HelpP>Week shows your 7-day meal plan as a repeating template — "Monday's lunch" rather than one specific Monday. Editing it here (locking, swapping, generating) changes every future occurrence of that weekday, not just the week you're looking at.</HelpP>

          <HelpH>WEEK NAVIGATION</HelpH>
          <HelpP>The arrows above the day cards move a full week at a time and show the real calendar dates for each day. Since the plan repeats, next week will look the same as this week unless you've locked/swapped something — the date navigation here is mainly so you can see which real dates each weekday lands on.</HelpP>

          <HelpH>TYLER / ELIZABETH / HOUSEHOLD</HelpH>
          <HelpP>Switch between seeing just your own plan or both of yours stacked together. In Household view, shared meals (like most breakfasts) show once; meals that differ by person (like most lunches) show separately, each labeled.</HelpP>

          <HelpH>GENERATE MY WEEK</HelpH>
          <HelpP>Rebuilds every <b style={{ color: "var(--ink)" }}>unlocked</b> slot using your calorie targets, workout schedule, and the preference mode you pick:</HelpP>
          <HelpB><b>Strict</b> — never suggests a Never Recommend item, avoids dislikes.</HelpB>
          <HelpB><b>Flexible</b> — dislikes can appear occasionally if they clearly help variety or nutrition, always labeled.</HelpB>
          <HelpB><b>Ignore Likes/Dislikes</b> — only true Never Recommend items stay blocked.</HelpB>
          <HelpP>Locked meals are never touched, no matter which mode you pick.</HelpP>

          <HelpH>VIEW / SWAP / LOCK</HelpH>
          <HelpB><b>View</b> opens the full recipe and ingredients.</HelpB>
          <HelpB><b>Swap</b> opens a picker of every meal in your library that fits that slot's category (breakfast, lunch, etc.) — meals you've favorited (♥ in Meals → Recipes) float to the top automatically. There's no separate "add a swap option" step: favoriting a recipe *is* how you add it to the swap list, and unfavoriting removes it from the top.</HelpB>
          <HelpB><b>Lock</b> protects that slot from being changed by Generate My Week.</HelpB>
        </HelpSection>

        <HelpSection title="Meals — Recipes & Pantry" icon={UtensilsCrossed} color="var(--plum)">
          <HelpP>Meals has two sub-tabs: Recipes, your meal library, and My Foods, your actual pantry inventory.</HelpP>

          <HelpH>RECIPES</HelpH>
          <HelpP>Browse or filter by meal type, search by name, or use the filter chips (Tyler likes, gluten-free, uses food already at home, etc). Each card shows a preview of step one and how many steps the full recipe has. "View Recipe" shows the complete ingredient list and numbered instructions. "Add to Week" assigns that meal to a specific day and slot directly, overriding the template for both people. The heart favorites a meal — favoriting is also what surfaces it at the top of the Week screen's Swap picker.</HelpP>

          <HelpH>MY FOODS</HelpH>
          <HelpP>This is your actual pantry — every ingredient, how much you have on hand, and where you buy it. It's persistent: it doesn't reset week to week, so it's a running record of what's really in your fridge, freezer, and pantry.</HelpP>
          <HelpB>Use the +/− stepper to adjust how many servings you have at home.</HelpB>
          <HelpB><b>Preferences</b> sets Love/Like/Neutral/Dislike/Never Recommend per person, with an optional note (like "only likes it cooked").</HelpB>
          <HelpB><b>Prices by Store</b> lets a single food have different prices at different stores — the filled dot marks which store's price is used for cost estimates and the grocery list. Tap a store's name to rename it, tap its price to edit it, add a new store, or delete one (you always need at least one left).</HelpB>
          <HelpB><b>Delete Food</b> removes the item entirely. If it's used in any recipes, you'll see which ones before confirming — deleting won't break those meals, they'll just be missing that ingredient's calories.</HelpB>
          <HelpB><b>Add Food</b> creates a brand-new pantry item from scratch with its own nutrition, price, and location.</HelpB>
        </HelpSection>

        <HelpSection title="Groceries — Shopping & Inventory" icon={ShoppingCart} color="var(--mustard)">
          <HelpH>NEED / HAVE / BUY</HelpH>
          <HelpP>The grocery list is calculated automatically from your Week plan: for every meal in the current 7-day template, for both people, it totals up how much of each ingredient is required (<b style={{ color: "var(--ink)" }}>Need</b>), compares that to what My Foods says you already have (<b style={{ color: "var(--ink)" }}>Have</b>), and shows the shortfall (<b style={{ color: "var(--ink)" }}>Buy</b>), rounded up to whole packages using each food's package size.</HelpP>

          <HelpH>MY LIST</HelpH>
          <HelpP>Tapping any item below adds it to the "My List" card at the top, so you always have a clear, visible summary of what you've actually decided to buy, separate from the full need-list you're still browsing.</HelpP>

          <HelpH>CLEAR PURCHASED</HelpH>
          <HelpP>When you've actually bought everything in My List, this button (after a confirmation) does two things at once: it adds the purchased quantities into your My Foods inventory automatically, and clears your list. That's the loop that keeps your pantry accurate — you never have to manually re-enter what you just bought.</HelpP>

          <HelpH>BUDGET</HelpH>
          <HelpP>Set a dollar amount and "Generate List Within Budget" builds My List for you, prioritizing protein and produce first, then dairy and carbs, then snacks and extras last — telling you exactly what got held back if you're over budget.</HelpP>

          <HelpH>SORT, SHARE, INVENTORY</HelpH>
          <HelpP>Sort the list by category, store, or who it's for. Share List copies a plain-text summary to your clipboard. "View Grocery Inventory" jumps straight to My Foods, since that's your permanent, always-on pantry record.</HelpP>
        </HelpSection>

        <HelpSection title="Profile — Targets & Preferences" icon={User} color="var(--brick)">
          <HelpH>DAILY TARGETS</HelpH>
          <HelpP>Calorie, protein, carb, fat, fiber, and water targets are what the Home rings and bars measure against. Editable any time — tap a number and type a new one.</HelpP>

          <HelpH>WORKOUT SCHEDULE (the permanent pattern)</HelpH>
          <HelpP>Tap a weekday chip to toggle it — this is your standing weekly pattern, per person, and it drives the Workout/Recovery badge, timeline layout, and gym time on Home and Week every week, going forward. It's different from the one-off badge override on Home: this is the rule, that badge is the occasional exception.</HelpP>

          <HelpH>WEIGHT</HelpH>
          <HelpP>Set a goal weight and log entries over time with "+ Log Weight." Your current weight is simply your most recent entry. This feeds into long-term trend awareness, not day-to-day tracking.</HelpP>

          <HelpH>FOOD PREFERENCES</HelpH>
          <HelpP>A full preference manager with tabs for Tyler, Elizabeth, Household (where you two disagree — useful for planning shared meals with personalized add-ons), and Ignored (foods marked Never Recommend, with a master toggle to allow them anyway in generators).</HelpP>

          <HelpH>FAVORITE RESTAURANTS</HelpH>
          <HelpP>Add or remove restaurants here — they show up as quick suggestions inside Eating Out Tonight.</HelpP>
        </HelpSection>

        <div className="mb-3"><BigButton icon={BookOpen} label="Nutrition Library" sub="A full searchable reference — now its own place, off the tour" onClick={onOpenLibrary} /></div>

        <HelpSection title="Healthy Grocery Shopping" icon={ShoppingBag} color="var(--mustard)">
          <HelpP>A few practical habits that make the Groceries tab actually pay off, beyond just following the Need/Have/Buy list.</HelpP>
          <HelpH>SHOP THE PERIMETER FIRST</HelpH>
          <HelpP>Produce, meat, and dairy tend to live along the outer edge of most grocery stores, while the center aisles are mostly shelf-stable, processed items. Building your cart from the perimeter inward naturally front-loads whole foods.</HelpP>
          <HelpH>CHECK THE SERVING SIZE BEFORE THE CALORIE COUNT</HelpH>
          <HelpP>A label showing "120 calories" is meaningless without knowing it's per serving — and a bag can quietly contain 3–4 servings. This is exactly why every food in My Foods stores a serving label alongside its macros, so the numbers you see in this app are always per-serving, not per-package.</HelpP>
          <HelpH>PROTEIN PER DOLLAR, NOT JUST PROTEIN PER PACKAGE</HelpH>
          <HelpP>Eggs, chicken thighs, canned tuna, Greek yogurt, and beans are consistently some of the cheapest sources of protein per gram — worth prioritizing as staples (see below) if budget is a factor, which is exactly what the Groceries budget generator does automatically.</HelpP>
          <HelpH>KEEP A SHORT LIST OF STAPLES</HelpH>
          <HelpP>Mark the handful of foods you always want on hand — eggs, rice, chicken, milk, whatever your household leans on — as Staples in My Foods (tap "Mark as Staple" on any food card). They'll resurface on your grocery list on their own once they run low, even in weeks where the meal plan itself doesn't happen to call for them.</HelpP>
          <HelpH>DON'T SHOP HUNGRY OR WITHOUT A LIST</HelpH>
          <HelpP>Both reliably increase impulse purchases of exactly the lower-nutrition, higher-cost items this app is trying to help you plan around. Build My List on Groceries before you go, and stick close to it.</HelpP>
        </HelpSection>

        <HelpSection title="Understanding Your Statistics" icon={TrendingUp} color="var(--steel)">
          <HelpP>Everything in Progress is built from what you actually log — nothing here is estimated or filled in. That's the whole point: the more consistently you check off meals and log workouts, the more honestly this screen can tell you about your own patterns.</HelpP>

          <HelpH>WHY THREE TIME SCALES</HelpH>
          <HelpB><b>Week</b> — day-to-day adherence. Did you actually hit protein most days, or did it slip on busy ones?</HelpB>
          <HelpB><b>Month</b> — slower drift you'd never notice day to day, like average protein quietly trending down over a few weeks, or hydration consistently lagging on certain weeks.</HelpB>
          <HelpB><b>Year</b> — the big picture: how your eating and training have actually evolved, useful right alongside the Weight section in Profile for real long-term goal tracking.</HelpB>

          <HelpH>WHY IT MATTERS FOR TRAINING TOGETHER</HelpH>
          <HelpP>Because you and Beth train together but eat somewhat differently, Progress lets you switch between the two of you — so you can each see your own targets against your own actual intake, side by side over time, instead of one blended number that doesn't really describe either of you.</HelpP>

          <HelpH>THE INSIGHTS CARD</HelpH>
          <HelpP>Once you've logged a few Energy Check-Ins, this card compares your workout energy on days you ate at least 25g of carbs against days you didn't, and tells you the real difference in your own numbers — not a generic tip, your actual pattern. Until there's enough data, it shows what kind of insight to expect so you know it's worth logging a check-in even on an "unremarkable" day.</HelpP>

          <HelpH>THE PRACTICAL PAYOFF</HelpH>
          <HelpP>Short term, the rings and timeline keep today honest. Long term, Progress is what turns weeks of logging into something you can actually act on — catching a slow protein decline before it becomes a plateau, seeing whether your fueling timing really does affect how workouts feel, and having a real weight and energy history to look back on instead of a gut feeling about "how it's been going."</HelpP>
        </HelpSection>

      </div>
    </div>
  );
}

function ProgressScreen({ onBack, person, setPerson, foodLog, water, gymLog }) {
  const [granularity, setGranularity] = useState("week"); // week | month | year
  const [anchor, setAnchor] = useState(todayISO());
  const [metric, setMetric] = useState("cal");
  const m = PROGRESS_METRICS.find((x) => x.id === metric);

  const buckets = useMemo(() => {
    if (granularity === "week") {
      const ws = startOfWeek(anchor);
      return WEEK_DAYS.map((d, i) => {
        const iso = addDays(ws, i);
        const t = dailyTotals(foodLog, water, gymLog, iso, person);
        return { label: d.short.slice(0, 3), value: t[metric], hasData: t.hasData };
      });
    }
    if (granularity === "month") {
      const ms = startOfMonth(anchor);
      const total = daysInMonth(anchor);
      const chunks = [[1,7],[8,14],[15,21],[22,28],[29,total]].filter(([s]) => s <= total);
      return chunks.map(([s, e]) => {
        const vals = [];
        for (let d = s; d <= e; d++) {
          const iso = `${ms.slice(0,7)}-${pad2(d)}`;
          const t = dailyTotals(foodLog, water, gymLog, iso, person);
          if (t.hasData) vals.push(t[metric]);
        }
        return { label: `${s}–${e}`, value: avg(vals), hasData: vals.length > 0 };
      });
    }
    // year
    const y = parseISO(anchor).getFullYear();
    return Array.from({ length: 12 }, (_, mi) => {
      const monthIso = `${y}-${pad2(mi + 1)}-01`;
      const dim = daysInMonth(monthIso);
      const vals = [];
      for (let d = 1; d <= dim; d++) {
        const iso = `${y}-${pad2(mi + 1)}-${pad2(d)}`;
        const t = dailyTotals(foodLog, water, gymLog, iso, person);
        if (t.hasData) vals.push(t[metric]);
      }
      return { label: monthIso ? parseISO(monthIso).toLocaleDateString("en-US", { month: "short" }) : "", value: avg(vals), hasData: vals.length > 0 };
    });
  }, [granularity, anchor, metric, foodLog, water, gymLog, person]);

  const periodLabel = granularity === "week"
    ? `${formatDateShort(startOfWeek(anchor))} – ${formatDateShort(addDays(startOfWeek(anchor), 6))}`
    : granularity === "month" ? formatMonthYear(anchor) : String(parseISO(anchor).getFullYear());

  const shiftPeriod = (dir) => setAnchor((a) => granularity === "week" ? addDays(a, dir * 7) : granularity === "month" ? addMonths(a, dir) : addYears(a, dir));

  // simple real insight: compare workout energy on days with >=25g pre-workout-adjacent carbs vs not — needs actual gym entries
  const gymDates = Object.keys(gymLog || {}).filter((iso) => gymLog[iso]?.[person]);
  let insight = null;
  if (gymDates.length >= 2) {
    const withCarb = [], withoutCarb = [];
    gymDates.forEach((iso) => {
      const entries = foodLog?.[iso]?.[person] || [];
      const carbHeavy = entries.some((e) => e.c >= 25);
      const e = gymLog[iso][person]?.energy;
      if (e == null) return;
      (carbHeavy ? withCarb : withoutCarb).push(e);
    });
    const a1 = avg(withCarb), a2 = avg(withoutCarb);
    if (a1 != null && a2 != null && Math.abs(a1 - a2) >= 0.5) {
      insight = a1 > a2
        ? `On days with at least 25g of logged carbs, average workout energy runs ${round(a1 - a2, 1)} points higher (${round(a1,1)} vs ${round(a2,1)} out of 10).`
        : `Energy has actually run a bit lower on higher-carb days so far (${round(a1,1)} vs ${round(a2,1)}) — worth watching as more data comes in.`;
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 px-5 pt-6 pb-2">
        <button onClick={onBack} className="tap" style={{ padding: 4 }}><ArrowLeft size={19} /></button>
        <h1 className="font-display font-bold text-[23px]">Progress</h1>
      </div>
      <div className="px-5 mt-2 mb-3"><PersonToggle value={person} onChange={setPerson} small /></div>
      <div className="px-5 pb-6">
        <div className="seg-wrap mb-3" style={{ width: "100%" }}>
          {[["week","Week"],["month","Month"],["year","Year"]].map(([id, label]) => (
            <button key={id} onClick={() => setGranularity(id)} className={`tap seg-btn ${granularity === id ? "seg-btn-on" : "seg-btn-off"}`} style={{ flex: 1 }}>{label}</button>
          ))}
        </div>
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => shiftPeriod(-1)} className="tap" style={{ padding: 6, borderRadius: 999, background: "var(--paper-3)" }}><ChevronLeft size={16} /></button>
          <span className="text-[12.5px] font-semibold" style={{ color: "var(--ink-soft)" }}>{periodLabel}</span>
          <button onClick={() => shiftPeriod(1)} className="tap" style={{ padding: 6, borderRadius: 999, background: "var(--paper-3)" }}><ChevronRight size={16} /></button>
        </div>
        <div className="scrollx flex gap-1.5 mb-4 pb-1">
          {PROGRESS_METRICS.map((pm) => (
            <button key={pm.id} onClick={() => setMetric(pm.id)} className="tap chip" style={{ whiteSpace: "nowrap", ...(metric === pm.id ? { background: "var(--ink)", color: "var(--paper-2)", borderColor: "var(--ink)" } : {}) }}>{pm.label}</button>
          ))}
        </div>
        <div className="card p-4 mb-5">
          <div className="flex items-end justify-between gap-2" style={{ height: 140 }}>
            {buckets.map((b, i) => {
              const v = b.value;
              const h = v != null ? Math.max(4, (v / m.max) * 116) : 4;
              return (
                <div key={i} className="flex flex-col items-center flex-1">
                  <div className="font-mono text-[10px] mb-1" style={{ color: "var(--ink-faint)" }}>{v != null ? round(v) : "—"}</div>
                  <div style={{ width: "60%", height: h, background: v != null ? m.color : "var(--paper-3)", borderRadius: 5 }} />
                  <div className="text-[10.5px] font-semibold mt-1.5" style={{ color: "var(--ink-faint)" }}>{b.label}</div>
                </div>
              );
            })}
          </div>
          {buckets.every((b) => !b.hasData) && (
            <div className="text-[11.5px] text-center mt-3" style={{ color: "var(--ink-faint)" }}>No logged data for this period yet.</div>
          )}
        </div>

        <h3 className="font-display font-bold text-[16px] mb-2.5">Insights</h3>
        {insight ? (
          <div className="card p-4 mb-2.5 flex gap-2.5">
            <TrendingUp size={17} style={{ color: "var(--sage)", flexShrink: 0, marginTop: 1 }} />
            <div className="text-[13px]" style={{ color: "var(--ink-soft)" }}>{insight}</div>
          </div>
        ) : (
          <div className="card p-4 mb-2.5 flex gap-2.5">
            <Info size={17} style={{ color: "var(--ink-faint)", flexShrink: 0, marginTop: 1 }} />
            <div className="text-[13px]" style={{ color: "var(--ink-soft)" }}>
              Log a few Energy Check-Ins alongside your meals and a real pattern will show up here — for example: "your highest-energy workouts happen on days with at least 30g of carbs within 90 minutes of training."
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------- Profile overview ------------------------------- */

function NumField({ label, value, onChange, unit }) {
  return (
    <div className="flex items-center justify-between py-2.5" style={{ borderBottom: "1px dashed var(--line-soft)" }}>
      <span className="text-[13px] font-semibold" style={{ color: "var(--ink-soft)" }}>{label}</span>
      <div className="flex items-center gap-1.5">
        <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))}
          className="font-mono text-[14px] text-right" style={{ width: 56, border: "none", background: "transparent", color: "var(--ink)" }} />
        <span className="text-[12px]" style={{ color: "var(--ink-faint)" }}>{unit}</span>
      </div>
    </div>
  );
}

const DAY_SHORT = { mon:"Mon", tue:"Tue", wed:"Wed", thu:"Thu", fri:"Fri", sat:"Sat", sun:"Sun" };

function WeightLogRow({ entry, onRemove }) {
  return (
    <div className="flex items-center justify-between py-1.5" style={{ borderBottom: "0.5px solid rgba(60,60,67,.12)" }}>
      <span className="text-[12.5px]" style={{ color: "var(--ink-soft)" }}>{entry.date}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-[13px] font-semibold">{entry.weight} lb</span>
        <button onClick={() => onRemove(entry.id)} className="tap" style={{ padding: 3 }}><X size={12} color="var(--ink-faint)" /></button>
      </div>
    </div>
  );
}

function ProfileOverview({ personId, profile, updateProfile, toggleWorkoutDay, weightEntries, logWeight, removeWeightEntry, onOpenPreferences, onOpenProgress, onOpenHelp, onOpenLibrary, onOpenRoutine, addRestaurant, removeRestaurant }) {
  const p = PEOPLE[personId];
  const [logging, setLogging] = useState(false);
  const [weightDraft, setWeightDraft] = useState("");
  const [newRestaurant, setNewRestaurant] = useState("");
  const sorted = [...weightEntries].sort((a, b) => b.date.localeCompare(a.date));
  const current = sorted[0]?.weight ?? null;
  const delta = current != null && profile.goalWeight ? round(current - profile.goalWeight, 1) : null;

  return (
    <div className="px-5 pb-6">
      <div className="card p-5 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div style={{ width: 46, height: 46, borderRadius: 999, background: p.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }} className="font-display font-bold text-[18px]">{p.initial}</div>
          <div>
            <div className="font-display font-bold text-[19px]">{p.name}</div>
            <div className="text-[12px]" style={{ color: "var(--ink-faint)" }}>{profile.glutenPref} · {profile.antiInflammatory}</div>
          </div>
        </div>
        <NumField label="Daily calorie target" value={profile.calorieTarget} onChange={(v) => updateProfile("calorieTarget", v)} unit="cal" />
        <NumField label="Protein target" value={profile.proteinTarget} onChange={(v) => updateProfile("proteinTarget", v)} unit="g" />
        <NumField label="Carbohydrate target" value={profile.carbTarget} onChange={(v) => updateProfile("carbTarget", v)} unit="g" />
        <NumField label="Fat target" value={profile.fatTarget} onChange={(v) => updateProfile("fatTarget", v)} unit="g" />
        <NumField label="Fiber target" value={profile.fiberTarget} onChange={(v) => updateProfile("fiberTarget", v)} unit="g" />
        <NumField label="Water target" value={profile.waterTarget} onChange={(v) => updateProfile("waterTarget", v)} unit="oz" />
      </div>

      <div className="card p-5 mb-4">
        <div className="font-display font-bold text-[16px] mb-3">Workout Schedule</div>
        <div className="text-[11.5px] mb-2" style={{ color: "var(--ink-faint)" }}>
          Tap a day to toggle it. This is {PEOPLE[personId].name}'s default weekly pattern — it drives the Workout/Recovery badge, timeline, and gym time on Home and Week every week going forward.
          Need a one-off exception for just this week? Tap the Workout/Recovery badge on that specific day instead — it won't touch this weekly pattern.
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {Object.keys(DAY_SHORT).map((d) => {
            const on = profile.workoutDays.includes(d);
            return (
              <button key={d} onClick={() => toggleWorkoutDay(d)} className="tap chip"
                style={on ? { background: "var(--brick-soft)", color: "var(--brick)", borderColor: "transparent" } : {}}>
                {DAY_SHORT[d]}
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-between mt-3.5">
          <span className="text-[12.5px] font-semibold" style={{ color: "var(--ink-soft)" }}>Preferred workout time</span>
          <input type="time" defaultValue={to24(profile.workoutTime)} onChange={(e) => e.target.value && updateProfile("workoutTime", format12(e.target.value))}
            className="font-mono text-[13px]" style={{ border: "1px solid var(--line)", borderRadius: 8, padding: "4px 8px" }} />
        </div>
      </div>

      <div className="card p-5 mb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="font-display font-bold text-[16px]">Weight</div>
          <button onClick={() => setLogging(!logging)} className="tap text-[13px] font-semibold" style={{ color: "var(--blue)" }}>+ Log Weight</button>
        </div>
        <div className="flex justify-between text-[13px] mt-2">
          <span style={{ color: "var(--ink-faint)" }}>Current</span>
          <span className="font-mono font-semibold">{current != null ? `${current} lb` : "—"}</span>
        </div>
        <NumField label="Goal weight" value={profile.goalWeight || 0} onChange={(v) => updateProfile("goalWeight", v)} unit="lb" />
        {delta != null && (
          <div className="text-[12px] mt-1" style={{ color: "var(--ink-faint)" }}>
            {delta === 0 ? "At goal weight." : delta > 0 ? `${delta} lb above goal.` : `${Math.abs(delta)} lb below goal.`}
          </div>
        )}
        {logging && (
          <div className="flex items-center gap-2 mt-3">
            <input type="number" autoFocus value={weightDraft} onChange={(e) => setWeightDraft(e.target.value)} placeholder="lb"
              className="input" style={{ flex: 1 }} />
            <button onClick={() => { if (weightDraft) { logWeight(Number(weightDraft)); setWeightDraft(""); setLogging(false); } }} className="tap btn-primary" style={{ padding: "9px 16px" }}>Save</button>
          </div>
        )}
        {sorted.length > 0 && (
          <div className="mt-3.5 pt-1">
            {sorted.slice(0, 6).map((e) => <WeightLogRow key={e.id} entry={e} onRemove={removeWeightEntry} />)}
          </div>
        )}
      </div>

      <div className="card p-5 mb-4">
        <div className="font-display font-bold text-[16px] mb-2">Favorite Restaurants</div>
        <div className="text-[11.5px] mb-2.5" style={{ color: "var(--ink-faint)" }}>These show up as quick suggestions in Eating Out Tonight.</div>
        <div className="flex gap-1.5 flex-wrap mb-3">
          {profile.favoriteRestaurants.map((r) => (
            <span key={r} className="chip inline-flex items-center gap-1.5">
              {r}
              <button onClick={() => removeRestaurant(r)} className="tap" style={{ display: "flex" }}><X size={11} /></button>
            </span>
          ))}
          {profile.favoriteRestaurants.length === 0 && <span className="text-[12px]" style={{ color: "var(--ink-faint)" }}>None added yet.</span>}
        </div>
        <div className="flex items-center gap-2">
          <input value={newRestaurant} onChange={(e) => setNewRestaurant(e.target.value)} placeholder="Add a restaurant…"
            className="input" style={{ flex: 1 }} onKeyDown={(e) => { if (e.key === "Enter" && newRestaurant.trim()) { addRestaurant(newRestaurant.trim()); setNewRestaurant(""); } }} />
          <button onClick={() => { if (newRestaurant.trim()) { addRestaurant(newRestaurant.trim()); setNewRestaurant(""); } }} className="tap chip">Add</button>
        </div>
      </div>

      <div className="mb-2.5"><BigButton icon={Heart} label="Food Preferences" sub="Likes, dislikes, and Never Recommend list" onClick={onOpenPreferences} /></div>
      <div className="mb-2.5"><BigButton icon={TrendingUp} label="Progress" sub="Weekly nutrition & gym-energy trends" onClick={onOpenProgress} /></div>
      <div className="mb-2.5"><BigButton icon={BookOpen} label="Nutrition Library" sub="A searchable reference of nutrition & fitness terms" onClick={onOpenLibrary} /></div>
      <div className="mb-2.5"><BigButton icon={Calendar} label="Plan · Purchase · Cook Schedule" sub="When you plan the week, shop, and cook" onClick={onOpenRoutine} /></div>
      <div><BigButton icon={Info} label="How to Use Trophé" sub="A full walkthrough of every tab, tab by tab" onClick={onOpenHelp} /></div>
    </div>
  );
}

/* ------------------------------ Plan · Purchase · Cook routine ------------------------------ */

function DayPicker({ value, onChange }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {Object.keys(DAY_SHORT).map((d) => (
        <button key={d} onClick={() => onChange(d)} className="tap chip" style={value === d ? { background: "var(--ink)", color: "var(--paper-2)", borderColor: "var(--ink)" } : {}}>{DAY_SHORT[d]}</button>
      ))}
    </div>
  );
}

function RoutineStep({ number, color, title, sub, children }) {
  return (
    <div className="card p-4 mb-3">
      <div className="flex items-center gap-2.5 mb-3">
        <div style={{ width: 26, height: 26, borderRadius: 999, background: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }} className="font-mono font-bold text-[13px]">{number}</div>
        <div>
          <div className="font-display font-bold text-[15px]">{title}</div>
          <div className="text-[11px]" style={{ color: "var(--ink-faint)" }}>{sub}</div>
        </div>
      </div>
      {children}
    </div>
  );
}

function RoutineScreen({ onBack, routine, updateRoutine }) {
  const summary = routine.cookStyle === "prep"
    ? `Plan ${DAY_SHORT[routine.planDay]} · Shop ${DAY_SHORT[routine.shopDay]} · Meal-prep ${DAY_SHORT[routine.prepDay]}`
    : `Plan ${DAY_SHORT[routine.planDay]} · Shop ${DAY_SHORT[routine.shopDay]} · Cook fresh most days`;

  return (
    <div>
      <div className="flex items-center gap-2 px-5 pt-6 pb-2">
        <button onClick={onBack} className="tap" style={{ padding: 4 }}><ArrowLeft size={19} /></button>
        <h1 className="font-display font-bold text-[23px]">Plan · Purchase · Cook</h1>
      </div>
      <div className="px-5 pt-2 pb-3">
        <p className="text-[13px] mb-3" style={{ color: "var(--ink-soft)", lineHeight: 1.55 }}>
          A simple weekly rhythm so planning, shopping, and cooking each have their own slot instead of all landing on you at once. This shows up as a reminder on Home when today matches one of these.
        </p>
        <div className="p-3 rounded-2xl mb-1" style={{ background: "var(--sage-soft)" }}>
          <div className="text-[12.5px] font-semibold" style={{ color: "var(--sage)" }}>{summary}</div>
        </div>
      </div>

      <div className="px-5 pb-8">
        <RoutineStep number="1" color="var(--blue)" title="Plan" sub="When you sit down and build/adjust the week">
          <DayPicker value={routine.planDay} onChange={(d) => updateRoutine("planDay", d)} />
          <div className="flex items-center justify-between mt-3">
            <span className="text-[12.5px] font-semibold" style={{ color: "var(--ink-soft)" }}>Time</span>
            <input type="time" defaultValue={to24(routine.planTime)} onChange={(e) => e.target.value && updateRoutine("planTime", format12(e.target.value))}
              className="font-mono text-[13px]" style={{ border: "1px solid var(--line)", borderRadius: 8, padding: "4px 8px" }} />
          </div>
        </RoutineStep>

        <RoutineStep number="2" color="var(--mustard)" title="Purchase" sub="When you actually go grocery shopping">
          <DayPicker value={routine.shopDay} onChange={(d) => updateRoutine("shopDay", d)} />
          <div className="flex items-center justify-between mt-3">
            <span className="text-[12.5px] font-semibold" style={{ color: "var(--ink-soft)" }}>Time</span>
            <input type="time" defaultValue={to24(routine.shopTime)} onChange={(e) => e.target.value && updateRoutine("shopTime", format12(e.target.value))}
              className="font-mono text-[13px]" style={{ border: "1px solid var(--line)", borderRadius: 8, padding: "4px 8px" }} />
          </div>
        </RoutineStep>

        <RoutineStep number="3" color="var(--brick)" title="Cook" sub="Batch meal-prep once, or cook fresh each day">
          <div className="seg-wrap mb-3" style={{ width: "100%" }}>
            {[["prep","Meal Prep"],["daily","Cook Daily"]].map(([id, label]) => (
              <button key={id} onClick={() => updateRoutine("cookStyle", id)} className={`tap seg-btn ${routine.cookStyle === id ? "seg-btn-on" : "seg-btn-off"}`} style={{ flex: 1 }}>{label}</button>
            ))}
          </div>
          {routine.cookStyle === "prep" ? (
            <>
              <div className="text-[11.5px] mb-2" style={{ color: "var(--ink-faint)" }}>Which day do you batch-cook for the week?</div>
              <DayPicker value={routine.prepDay} onChange={(d) => updateRoutine("prepDay", d)} />
              <div className="flex items-center justify-between mt-3">
                <span className="text-[12.5px] font-semibold" style={{ color: "var(--ink-soft)" }}>Time</span>
                <input type="time" defaultValue={to24(routine.prepTime)} onChange={(e) => e.target.value && updateRoutine("prepTime", format12(e.target.value))}
                  className="font-mono text-[13px]" style={{ border: "1px solid var(--line)", borderRadius: 8, padding: "4px 8px" }} />
              </div>
            </>
          ) : (
            <>
              <div className="text-[11.5px] mb-2" style={{ color: "var(--ink-faint)" }}>About what time do you usually cook dinner?</div>
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] font-semibold" style={{ color: "var(--ink-soft)" }}>Time</span>
                <input type="time" defaultValue={to24(routine.dailyCookTime)} onChange={(e) => e.target.value && updateRoutine("dailyCookTime", format12(e.target.value))}
                  className="font-mono text-[13px]" style={{ border: "1px solid var(--line)", borderRadius: 8, padding: "4px 8px" }} />
              </div>
            </>
          )}
        </RoutineStep>
      </div>
    </div>
  );
}

function ProfileScreen({ person, setPerson, profiles, updateProfile, toggleWorkoutDay, weightLog, logWeight, removeWeightEntry, onOpenPreferences, onOpenProgress, onOpenHelp, onOpenLibrary, onOpenRoutine, addRestaurant, removeRestaurant }) {
  return (
    <div>
      <div className="px-5 pt-5 pb-0"><TropheLockup iconSize={28} wordmarkSize={18} align="left" /></div>
      <ScreenHeader title="Profiles" />
      <div className="px-5 -mt-4 mb-3 text-[11.5px]" style={{ color: "var(--ink-faint)" }}>Your household's pantry, plan, and progress, all in one place.</div>
      <div className="px-5 -mt-1 mb-4"><PersonToggle value={person} onChange={setPerson} includeHousehold /></div>
      {person === "household" ? (
        <div className="px-5 pb-6">
          <div className="card p-5 mb-4">
            <div className="font-display font-bold text-[16px] mb-3">Household Snapshot</div>
            {["tyler","elizabeth"].map((pid) => (
              <div key={pid} className="flex items-center justify-between py-2" style={{ borderBottom: "1px dashed var(--line-soft)" }}>
                <span className="font-semibold text-[13.5px]" style={{ color: PEOPLE[pid].accent }}>{PEOPLE[pid].name}</span>
                <span className="font-mono text-[12.5px]" style={{ color: "var(--ink-soft)" }}>{profiles[pid].calorieTarget} cal · {profiles[pid].proteinTarget}g P</span>
              </div>
            ))}
          </div>
          <div className="mb-2.5"><BigButton icon={Calendar} label="Plan · Purchase · Cook Schedule" sub="When you plan the week, shop, and cook" onClick={onOpenRoutine} /></div>
          <div className="mb-2.5"><BigButton icon={Heart} label="Food Preferences" sub="Manage both profiles & shared-meal conflicts" onClick={onOpenPreferences} /></div>
          <div className="mb-2.5"><BigButton icon={TrendingUp} label="Progress" sub="Weekly nutrition & gym-energy trends" onClick={onOpenProgress} /></div>
          <div className="mb-2.5"><BigButton icon={BookOpen} label="Nutrition Library" sub="A searchable reference of nutrition & fitness terms" onClick={onOpenLibrary} /></div>
          <div><BigButton icon={Info} label="How to Use Trophé" sub="A full walkthrough of every tab, tab by tab" onClick={onOpenHelp} /></div>
        </div>
      ) : (
        <ProfileOverview personId={person} profile={profiles[person]} updateProfile={(k, v) => updateProfile(person, k, v)}
          toggleWorkoutDay={(d) => toggleWorkoutDay(person, d)} weightEntries={weightLog?.[person] || []}
          logWeight={(w) => logWeight(person, w)} removeWeightEntry={(id) => removeWeightEntry(person, id)}
          addRestaurant={(r) => addRestaurant(person, r)} removeRestaurant={(r) => removeRestaurant(person, r)}
          onOpenPreferences={onOpenPreferences} onOpenProgress={onOpenProgress} onOpenHelp={onOpenHelp} onOpenLibrary={onOpenLibrary} onOpenRoutine={onOpenRoutine} />
      )}
    </div>
  );
}

/* ============================== SNACK RECOMMENDER ================================ */

function FastFoodPicker({ onPick }) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="tap btn-ghost w-full flex items-center justify-center gap-2 mt-3" style={{ padding: "11px 0", fontSize: 13 }}>
        <MapPin size={14} /> I'm not at home — show fast food options
      </button>
    );
  }
  return (
    <div className="mt-3">
      <div className="p-3 rounded-2xl mb-3" style={{ background: "var(--paper)", border: "1px solid var(--line-soft)" }}>
        <div className="text-[12px] font-semibold mb-1" style={{ color: "var(--ink)" }}>Springfield-area picks</div>
        <div className="text-[11.5px]" style={{ color: "var(--ink-faint)" }}>Standard build, no extra sauce or cheese. Real menus change — treat these as solid estimates.</div>
      </div>
      {FAST_FOOD_OPTIONS.map((f) => (
        <button key={f.id} onClick={() => onPick(f)} className="tap w-full text-left p-3 rounded-2xl mb-2" style={{ background: "var(--paper)", border: "1px solid var(--line-soft)" }}>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[13.5px]">{f.item}</span>
            <span className="text-[11px] font-bold" style={{ color: "var(--blue)" }}>{f.restaurant}</span>
          </div>
          <div className="font-mono text-[11.5px] mt-1" style={{ color: "var(--ink-soft)" }}>{f.cal} cal · {f.p}g P · {f.c}g C · {f.f}g F</div>
          <div className="text-[11px] mt-1" style={{ color: "var(--ink-faint)" }}>{f.note}</div>
        </button>
      ))}
    </div>
  );
}

function SnackModal({ person, remaining, onClose, onAdd, onAddFastFood, mealsMap, foodsById }) {
  const [step, setStep] = useState(1);
  const [hunger, setHunger] = useState(null);
  const [workoutIn, setWorkoutIn] = useState(null);

  const recommend = () => {
    let pool = SWAP_POOL.snack;
    let why = "Balanced protein + carbs to hold you over.";
    if (workoutIn === "under30" || workoutIn === "30-60") { pool = SWAP_POOL.preworkout; why = "Quick carbohydrates before training."; }
    else if (workoutIn === "60-90") { pool = [...SWAP_POOL.preworkout, ...SWAP_POOL.snack]; why = "A mix of carbs and a little protein — you've got some runway before the gym."; }
    if (hunger === "veryhungry") pool = [...pool].reverse();
    const primary = mealsMap[pool[0]];
    const alts = pool.slice(1, 4).map((id) => mealsMap[id]).filter(Boolean);
    return { primary, alts, why };
  };

  const result = step === 3 ? recommend() : null;
  const n = result ? computeItemsNutrition(result.primary.items, foodsById) : null;

  return (
    <Sheet title="I Need a Snack" onClose={onClose}>
      {step === 1 && (
        <div>
          <div className="text-[13.5px] font-semibold mb-3">How hungry are you?</div>
          <div className="flex flex-col gap-2">
            {[["notvery","Not very"],["little","A little"],["hungry","Hungry"],["veryhungry","Very hungry"]].map(([id, label]) => (
              <button key={id} onClick={() => { setHunger(id); setStep(2); }} className="tap text-left p-3.5 rounded-2xl" style={{ background: "var(--paper)", border: "1px solid var(--line-soft)" }}>{label}</button>
            ))}
          </div>
        </div>
      )}
      {step === 2 && (
        <div>
          <div className="text-[13.5px] font-semibold mb-3">How long until your workout?</div>
          <div className="flex flex-col gap-2">
            {[["none","No workout today"],["under30","Under 30 minutes"],["30-60","30–60 minutes"],["60-90","60–90 minutes"],["2plus","2+ hours"]].map(([id, label]) => (
              <button key={id} onClick={() => { setWorkoutIn(id); setStep(3); }} className="tap text-left p-3.5 rounded-2xl" style={{ background: "var(--paper)", border: "1px solid var(--line-soft)" }}>{label}</button>
            ))}
          </div>
        </div>
      )}
      {step === 3 && result && (
        <div>
          <div className="text-[12px] font-bold mb-1" style={{ color: "var(--ink-faint)" }}>RECOMMENDATION</div>
          <h3 className="font-display font-bold text-[19px]">{result.primary.name}</h3>
          <div className="text-[12.5px] mt-1" style={{ color: "var(--ink-soft)" }}>Why: {result.why}</div>
          <div className="font-mono text-[13px] mt-2">{round(n.cal)} cal · {round(n.c)}g carbs · {round(n.p)}g protein</div>
          <button onClick={() => { onAdd(result.primary); onClose(); }} className="tap btn-primary w-full mt-4" style={{ padding: "12px 0" }}>Add to Today</button>
          <div className="text-[12px] font-bold mt-5 mb-2" style={{ color: "var(--ink-faint)" }}>ALTERNATIVE OPTIONS</div>
          {result.alts.map((m) => (
            <button key={m.id} onClick={() => { onAdd(m); onClose(); }} className="tap w-full text-left p-3 rounded-2xl mb-2" style={{ background: "var(--paper)", border: "1px solid var(--line-soft)" }}>
              <span className="font-semibold text-[13.5px]">{m.name}</span>
            </button>
          ))}
          <FastFoodPicker onPick={(f) => { onAddFastFood(f); onClose(); }} />
        </div>
      )}
    </Sheet>
  );
}

/* ============================== GYM ENERGY CHECK-IN ================================ */

function GymCheckinModal({ onClose, onSave, onShowSnackOptions }) {
  const [phase, setPhase] = useState("pre");
  const [energy, setEnergy] = useState(null);
  const [hunger, setHunger] = useState(5);
  const [hydration, setHydration] = useState(5);
  const [sleep, setSleep] = useState(7);
  const [lastCarb, setLastCarb] = useState(3);
  const [workoutLinked, setWorkoutLinked] = useState(false);
  const [post, setPost] = useState({ energy: 7, strength: 7, endurance: 7, recovery: 7 });

  const ENERGY_OPTS = [["full","Fully energized",Battery],["good","Good",Battery],["slight","Slightly tired",BatteryLow],["low","Low energy",BatteryLow],["exhausted","Exhausted",BatteryLow]];
  const lowEnergy = energy === "low" || energy === "exhausted";

  const save = (extra) => { onSave({ energy, hunger, hydration, sleep, lastCarb, workoutLinked, ...extra }); onClose(); };

  return (
    <Sheet title="Energy Check-In" onClose={onClose} footer={
      phase === "pre" ? (
        <button disabled={!energy} onClick={() => setPhase("result")} className="tap btn-primary w-full" style={{ padding: "12px 0", opacity: energy ? 1 : .4 }}>Get Read on My Energy</button>
      ) : phase === "result" ? (
        workoutLinked ? (
          <button onClick={() => setPhase("post")} className="tap btn-ghost w-full" style={{ padding: "12px 0" }}>Log Post-Workout →</button>
        ) : (
          <button onClick={() => save({})} className="tap btn-primary w-full" style={{ padding: "12px 0" }}>Save Check-In</button>
        )
      ) : (
        <button onClick={() => save(post)} className="tap btn-primary w-full" style={{ padding: "12px 0" }}>Save Check-In</button>
      )
    }>
      {phase === "pre" && (
        <div>
          <div className="text-[13.5px] font-semibold mb-3">How do you feel?</div>
          <div className="flex flex-col gap-2 mb-4">
            {ENERGY_OPTS.map(([id, label, Icon]) => (
              <button key={id} onClick={() => setEnergy(id)} className="tap text-left p-3 rounded-2xl flex items-center gap-2.5"
                style={{ border: `1.5px solid ${energy === id ? "var(--ink)" : "var(--line)"}`, background: energy === id ? "var(--paper)" : "transparent" }}>
                <Icon size={16} /><span className="font-semibold text-[13.5px]">{label}</span>
              </button>
            ))}
          </div>
          <SliderField label="Hunger" value={hunger} onChange={setHunger} />
          <SliderField label="Hydration" value={hydration} onChange={setHydration} />
          <SliderField label="Sleep last night (hrs)" value={sleep} max={12} onChange={setSleep} />
          <SliderField label="Hours since you last ate" value={lastCarb} max={8} onChange={setLastCarb} />
          <div className="flex items-center justify-between mt-4 p-3 rounded-2xl" style={{ background: "var(--paper)", border: "1px solid var(--line-soft)" }}>
            <div style={{ maxWidth: "78%" }}>
              <div className="text-[13px] font-semibold">Connected to a workout?</div>
              <div className="text-[11px] mt-0.5" style={{ color: "var(--ink-faint)" }}>Off by default — this works as a general energy check-in any time of day.</div>
            </div>
            <button onClick={() => setWorkoutLinked(!workoutLinked)} className="tap" style={{ width: 44, height: 26, borderRadius: 999, background: workoutLinked ? "var(--brick)" : "var(--line)", position: "relative", flexShrink: 0 }}>
              <span style={{ position: "absolute", top: 2, left: workoutLinked ? 20 : 2, width: 22, height: 22, borderRadius: 999, background: "#fff", transition: "left .15s" }} />
            </button>
          </div>
        </div>
      )}
      {phase === "result" && (
        <div>
          <div className="p-4 rounded-2xl mb-3" style={{ background: lowEnergy ? "var(--brick-soft)" : "var(--sage-soft)" }}>
            <div className="text-[13.5px]" style={{ color: "var(--ink)" }}>
              Your energy is <b>{ENERGY_OPTS.find((o) => o[0] === energy)[1].toLowerCase()}</b> and it's been about <b>{lastCarb}h</b> since you last ate.
            </div>
          </div>
          <div className="text-[12px] font-bold mb-1" style={{ color: "var(--ink-faint)" }}>{workoutLinked ? "RECOMMENDED" : "WORTH NOTING"}</div>
          <div className="text-[14.5px] font-semibold mb-1">
            {workoutLinked
              ? ((lowEnergy || lastCarb >= 4) ? "25–40g quick carbohydrates before training" : "You're fueled — a light top-off is optional")
              : ((lowEnergy && lastCarb >= 4) ? "Low energy and it's been a while since you ate — a snack would likely help" : lowEnergy ? "Low energy — worth checking hydration and sleep too, not just food" : "You're in a solid spot")}
          </div>
          {onShowSnackOptions && (
            <button onClick={onShowSnackOptions} className="tap btn-ghost w-full flex items-center justify-center gap-2 mt-4" style={{ padding: "11px 0" }}>
              <Zap size={14} /> Show Snack Options
            </button>
          )}
        </div>
      )}
      {phase === "post" && (
        <div>
          {[["energy","Workout energy"],["strength","Strength"],["endurance","Endurance"],["recovery","Recovery feeling"]].map(([id, label]) => (
            <SliderField key={id} label={label} value={post[id]} onChange={(v) => setPost((s) => ({ ...s, [id]: v }))} />
          ))}
        </div>
      )}
    </Sheet>
  );
}

function SliderField({ label, value, onChange, max = 10 }) {
  return (
    <div className="mb-3.5">
      <div className="flex justify-between text-[13px] mb-1"><span className="font-semibold" style={{ color: "var(--ink-soft)" }}>{label}</span><span className="font-mono">{value}</span></div>
      <input type="range" min={0} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ width: "100%", accentColor: "var(--ink)" }} />
    </div>
  );
}

/* ============================== RESTAURANT MODE ================================ */

const RESTAURANT_FOODS = [
  { id:"r1", name:"Chipotle Chicken Bowl (no rice, extra veg)", cal:480, p:46, c:32, f:16 },
  { id:"r2", name:"Chipotle Burrito", cal:920, p:48, c:96, f:34 },
  { id:"r3", name:"Sukhi's Butter Chicken + Rice (restaurant portion)", cal:620, p:32, c:58, f:26 },
  { id:"r4", name:"Grilled Chicken Salad, light dressing", cal:410, p:38, c:20, f:18 },
  { id:"r5", name:"Burger + Fries", cal:980, p:38, c:88, f:52 },
];

/* Real Springfield, MO chains with a genuinely healthier pick from each —
   standard/no-extra-sauce builds. Nutrition is sourced from each chain's
   published data; menus and formulations change, so treat these as solid
   estimates rather than gospel. Gated behind "I'm not at home" so it never
   shows up as a default suggestion over what's actually in the pantry. */
const FAST_FOOD_OPTIONS = [
  { id:"ff1", restaurant:"Chick-fil-A", item:"Grilled Chicken Sandwich", cal:380, p:28, c:44, f:11, note:"Multigrain bun adds real fiber — skip the butter on the bun to shave off some fat." },
  { id:"ff2", restaurant:"Chick-fil-A", item:"8-Count Grilled Nuggets", cal:130, p:25, c:1, f:3, note:"The best protein-per-calorie ratio on any Springfield fast-food menu, essentially." },
  { id:"ff3", restaurant:"Subway", item:"6\" Turkey Breast (wheat, no cheese/sauce)", cal:280, p:18, c:46, f:4, note:"Very low fat; ask for extra veggies for fiber and volume." },
  { id:"ff4", restaurant:"Wendy's", item:"Grilled Chicken Sandwich", cal:350, p:37, c:36, f:7, note:"Solid protein-to-calorie ratio for a drive-thru sandwich." },
  { id:"ff5", restaurant:"Chipotle", item:"Chicken Bowl (brown rice, fajita veggies, no cheese/sour cream)", cal:535, p:45, c:50, f:16, note:"Easy to dial the macros up or down by portion." },
  { id:"ff6", restaurant:"Culver's", item:"Grilled Chicken Sandwich", cal:340, p:32, c:33, f:10, note:"A lighter pick on a menu that's mostly ButterBurgers and custard." },
  { id:"ff7", restaurant:"Taco Bell", item:"Power Menu Bowl — Chicken", cal:470, p:26, c:44, f:21, note:"Beans add fiber; ask for no cheese/sauce to trim it down further." },
];

function fitLabel(cal, remaining) {
  if (cal <= remaining) return { text: "Fits easily", color: "var(--sage)" };
  if (cal <= remaining + 250) return { text: "Fits with adjustment", color: "var(--mustard)" };
  return { text: "Higher-calorie option", color: "var(--brick)" };
}

function RestaurantModal({ remaining, onClose, onLog }) {
  const [step, setStep] = useState(1);
  const [restaurant, setRestaurant] = useState("");
  const [hunger, setHunger] = useState(null);
  const [workoutToday, setWorkoutToday] = useState(null);
  const [chosen, setChosen] = useState(null);

  return (
    <Sheet title="Eating Out Tonight" onClose={onClose}>
      {step === 1 && (
        <div>
          <Field label="Restaurant"><input value={restaurant} onChange={(e) => setRestaurant(e.target.value)} className="input" placeholder="e.g. Chipotle" /></Field>
          <div className="text-[13.5px] font-semibold mt-4 mb-2">How hungry are you?</div>
          <div className="flex gap-1.5 flex-wrap mb-4">
            {["Not very","A little","Hungry","Very hungry"].map((h) => (
              <button key={h} onClick={() => setHunger(h)} className="tap chip" style={hunger === h ? { background: "var(--ink)", color: "var(--paper-2)", borderColor: "var(--ink)" } : {}}>{h}</button>
            ))}
          </div>
          <div className="text-[13.5px] font-semibold mb-2">Workout today?</div>
          <div className="flex gap-1.5 mb-5">
            {["Yes","No"].map((h) => (
              <button key={h} onClick={() => setWorkoutToday(h)} className="tap chip" style={workoutToday === h ? { background: "var(--ink)", color: "var(--paper-2)", borderColor: "var(--ink)" } : {}}>{h}</button>
            ))}
          </div>
          <button onClick={() => setStep(2)} className="tap btn-primary w-full" style={{ padding: "12px 0" }}>Find Something to Eat</button>
        </div>
      )}
      {step === 2 && (
        <div>
          <div className="text-[12.5px] mb-3" style={{ color: "var(--ink-faint)" }}>{round(remaining.cal)} calories remaining today</div>
          {RESTAURANT_FOODS.map((r) => {
            const fit = fitLabel(r.cal, remaining.cal);
            return (
              <button key={r.id} onClick={() => setChosen(r)} className="tap w-full text-left p-3.5 rounded-2xl mb-2.5"
                style={{ border: `1.5px solid ${chosen?.id === r.id ? "var(--ink)" : "var(--line-soft)"}`, background: "var(--paper)" }}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[13.5px]" style={{ maxWidth: "70%" }}>{r.name}</span>
                  <span className="pref-pill" style={{ color: fit.color, background: "transparent", border: `1px solid ${fit.color}` }}>{fit.text}</span>
                </div>
                <div className="font-mono text-[11.5px] mt-1" style={{ color: "var(--ink-soft)" }}>{r.cal} cal · {r.p}g P · {r.c}g C · {r.f}g F</div>
              </button>
            );
          })}
          <button disabled={!chosen} onClick={() => { onLog({ label: restaurant.trim() ? `${chosen.name} (${restaurant.trim()})` : chosen.name, time: nowDisplayTime(), cal: chosen.cal, p: chosen.p, c: chosen.c, f: chosen.f, fiber: 0 }); onClose(); }}
            className="tap btn-primary w-full mt-2" style={{ padding: "12px 0", opacity: chosen ? 1 : .4 }}>
            {chosen ? `Log "${chosen.name}"` : "Pick something above to log it"}
          </button>
        </div>
      )}
    </Sheet>
  );
}

/* ================================= APP ROOT ================================= */

const STORAGE_KEYS = {
  foods: "hearth:foods", prefs: "hearth:prefs", overrides: "hearth:week-overrides", locks: "hearth:week-locks",
  foodLog: "hearth:food-log", water: "hearth:water", favorites: "hearth:favorites",
  groceryChecked: "hearth:grocery-checked", profiles: "hearth:profiles", allowNever: "hearth:allow-never",
  timeOverrides: "hearth:time-overrides", budget: "hearth:grocery-budget", weightLog: "hearth:weight-log", gymLog: "hearth:gym-log",
  workoutOverrides: "hearth:workout-overrides",
  customTerms: "hearth:custom-terms", routine: "hearth:routine", customMeals: "hearth:custom-meals",
};

async function loadKey(key, fallback) {
  try {
    const res = await window.storage.get(key, true);
    return res ? JSON.parse(res.value) : fallback;
  } catch (e) { return fallback; }
}
async function saveKey(key, value) {
  try { await window.storage.set(key, JSON.stringify(value), true); } catch (e) { /* ignore */ }
}

export default function TropheApp() {
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState("home");
  const [person, setPerson] = useState("tyler");
  const [viewDate, setViewDate] = useState(todayISO());
  const [progressPerson, setProgressPerson] = useState("tyler");
  const [weekPerson, setWeekPerson] = useState("tyler");
  const [profilePerson, setProfilePerson] = useState("tyler");
  const [profileSub, setProfileSub] = useState("overview"); // overview | preferences | progress | help
  const [tourStep, setTourStep] = useState(null); // null = not touring, else index into TOUR_STEPS

  const [foods, setFoods] = useState(FOODS);
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [overrides, setOverrides] = useState({});
  const [locks, setLocks] = useState({});
  const [foodLog, setFoodLog] = useState({});
  const [water, setWater] = useState({});
  const [favorites, setFavorites] = useState([]);
  const [groceryChecked, setGroceryChecked] = useState({});
  const [profiles, setProfiles] = useState(DEFAULT_PROFILES);
  const [allowNever, setAllowNever] = useState(false);
  const [timeOverrides, setTimeOverrides] = useState({});
  const [budget, setBudget] = useState(null);
  const [weightLog, setWeightLog] = useState({ tyler: [], elizabeth: [] });
  const [gymLog, setGymLog] = useState({});
  const [workoutOverrides, setWorkoutOverridesState] = useState({});
  const [customTerms, setCustomTerms] = useState([]);
  const [routine, setRoutine] = useState(DEFAULT_ROUTINE);
  const [customMeals, setCustomMeals] = useState([]);

  const [modal, setModal] = useState(null); // 'snack' | 'gym' | 'restaurant' | 'logFood'
  const [mealDetail, setMealDetail] = useState(null); // { meal, slot, day }
  const [addFoodTrigger, setAddFoodTrigger] = useState(0);
  const [inventoryTrigger, setInventoryTrigger] = useState(0);

  // ---- web app icon / tab title (works when hosted standalone; Claude's
  //      artifact preview runs in an iframe, so browsers may not surface a
  //      favicon there, but this is here so it's correct wherever this file
  //      actually ends up running) ----
  useEffect(() => {
    document.title = "Trophé";
    let link = document.querySelector("link[rel~='icon']");
    if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
    link.href = TROPHE_ICON_IMG;
  }, []);

  // ---- load once ----
  useEffect(() => {
    (async () => {
      const [f, pr, ov, lk, fl, wt, fav, gc, pf, an, to, bg, wl, gl, wo, ct, rt, cm] = await Promise.all([
        loadKey(STORAGE_KEYS.foods, FOODS), loadKey(STORAGE_KEYS.prefs, DEFAULT_PREFS),
        loadKey(STORAGE_KEYS.overrides, {}), loadKey(STORAGE_KEYS.locks, {}),
        loadKey(STORAGE_KEYS.foodLog, {}), loadKey(STORAGE_KEYS.water, {}),
        loadKey(STORAGE_KEYS.favorites, []), loadKey(STORAGE_KEYS.groceryChecked, {}),
        loadKey(STORAGE_KEYS.profiles, DEFAULT_PROFILES), loadKey(STORAGE_KEYS.allowNever, false),
        loadKey(STORAGE_KEYS.timeOverrides, {}), loadKey(STORAGE_KEYS.budget, null),
        loadKey(STORAGE_KEYS.weightLog, { tyler: [], elizabeth: [] }), loadKey(STORAGE_KEYS.gymLog, {}),
        loadKey(STORAGE_KEYS.workoutOverrides, {}),
        loadKey(STORAGE_KEYS.customTerms, []), loadKey(STORAGE_KEYS.routine, DEFAULT_ROUTINE),
        loadKey(STORAGE_KEYS.customMeals, []),
      ]);
      setFoods(f.map((food) => ({ ...food, prices: food.prices || [{ store: food.store, price: food.price }], preferredStore: food.preferredStore || food.store })));
      setPrefs(pr); setOverrides(ov); setLocks(lk); setFoodLog(fl); setWater(wt);
      setFavorites(fav); setGroceryChecked(gc); setProfiles(pf); setAllowNever(an);
      const woMigrated = {};
      Object.entries(wo || {}).forEach(([iso, v]) => {
        woMigrated[iso] = typeof v === "boolean" ? { tyler: v, elizabeth: v } : v;
      });
      setTimeOverrides(to); setBudget(bg); setWeightLog(wl); setGymLog(gl); setWorkoutOverridesState(woMigrated);
      setCustomTerms(ct); setRoutine({ ...DEFAULT_ROUTINE, ...rt }); setCustomMeals(cm.map((m) => ({ ...m, custom: true })));
      setLoaded(true);
    })();
  }, []);

  // ---- persist on change (after initial load) ----
  useEffect(() => { if (loaded) saveKey(STORAGE_KEYS.foods, foods); }, [foods, loaded]);
  useEffect(() => { if (loaded) saveKey(STORAGE_KEYS.prefs, prefs); }, [prefs, loaded]);
  useEffect(() => { if (loaded) saveKey(STORAGE_KEYS.overrides, overrides); }, [overrides, loaded]);
  useEffect(() => { if (loaded) saveKey(STORAGE_KEYS.locks, locks); }, [locks, loaded]);
  useEffect(() => { if (loaded) saveKey(STORAGE_KEYS.foodLog, foodLog); }, [foodLog, loaded]);
  useEffect(() => { if (loaded) saveKey(STORAGE_KEYS.water, water); }, [water, loaded]);
  useEffect(() => { if (loaded) saveKey(STORAGE_KEYS.favorites, favorites); }, [favorites, loaded]);
  useEffect(() => { if (loaded) saveKey(STORAGE_KEYS.groceryChecked, groceryChecked); }, [groceryChecked, loaded]);
  useEffect(() => { if (loaded) saveKey(STORAGE_KEYS.profiles, profiles); }, [profiles, loaded]);
  useEffect(() => { if (loaded) saveKey(STORAGE_KEYS.allowNever, allowNever); }, [allowNever, loaded]);
  useEffect(() => { if (loaded) saveKey(STORAGE_KEYS.timeOverrides, timeOverrides); }, [timeOverrides, loaded]);
  useEffect(() => { if (loaded) saveKey(STORAGE_KEYS.budget, budget); }, [budget, loaded]);
  useEffect(() => { if (loaded) saveKey(STORAGE_KEYS.weightLog, weightLog); }, [weightLog, loaded]);
  useEffect(() => { if (loaded) saveKey(STORAGE_KEYS.gymLog, gymLog); }, [gymLog, loaded]);
  useEffect(() => { if (loaded) saveKey(STORAGE_KEYS.workoutOverrides, workoutOverrides); }, [workoutOverrides, loaded]);
  useEffect(() => { if (loaded) saveKey(STORAGE_KEYS.customTerms, customTerms); }, [customTerms, loaded]);
  useEffect(() => { if (loaded) saveKey(STORAGE_KEYS.routine, routine); }, [routine, loaded]);
  useEffect(() => { if (loaded) saveKey(STORAGE_KEYS.customMeals, customMeals); }, [customMeals, loaded]);

  const foodsById = useMemo(() => foodIndex(foods), [foods]);
  const allMeals = useMemo(() => [...MEALS, ...customMeals], [customMeals]);
  const mealsMap = useMemo(() => mealIndex(allMeals), [allMeals]);

  /* ---------------------------- handlers ---------------------------- */
  const toggleLock = (dayKey, slotKey) => setLocks((s) => {
    const next = { ...s, [dayKey]: { ...(s[dayKey] || {}) } };
    next[dayKey][slotKey] = !next[dayKey][slotKey];
    return next;
  });

  const applySwap = (dayKey, slotKey, personId, mealId) => setOverrides((s) => {
    const next = { ...s, [dayKey]: { ...(s[dayKey] || {}) } };
    next[dayKey][slotKey] = { ...(next[dayKey][slotKey] || {}), [personId]: mealId };
    return next;
  });

  const onAddMealToWeek = (day, slot, mealId) => {
    applySwap(day.key, slot.key, "tyler", mealId);
    applySwap(day.key, slot.key, "elizabeth", mealId);
    setView("week");
  };

  const setTimeOverride = (dayKey, key, t24) => setTimeOverrides((s) => ({
    ...s, [dayKey]: { ...(s[dayKey] || {}), [key]: t24 },
  }));

  const setWorkoutOverride = (iso, personId, value) => setWorkoutOverridesState((s) => {
    const dayEntry = { ...(s[iso] || {}) };
    if (value == null) delete dayEntry[personId]; else dayEntry[personId] = value;
    const next = { ...s };
    if (Object.keys(dayEntry).length === 0) delete next[iso]; else next[iso] = dayEntry;
    return next;
  });

  const addCustomTerm = (draft) => setCustomTerms((s) => [...s, { id: uid("term"), custom: true, related: [], ...draft }]);
  const removeCustomTerm = (id) => setCustomTerms((s) => s.filter((t) => t.id !== id));
  const updateRoutine = (key, value) => setRoutine((s) => ({ ...s, [key]: value }));

  const addRecipe = (draft) => setCustomMeals((s) => [...s, { id: uid("recipe"), custom: true, favorited: false, ...draft }]);
  const deleteRecipe = (mealId) => { setCustomMeals((s) => s.filter((m) => m.id !== mealId)); setFavorites((s) => s.filter((id) => id !== mealId)); };

  // ---- food log (diary): plan-linked entries (toggleEaten) + free-form ones (logFreeEntry) ----
  const toggleEaten = (dayKey, personId, slotKey, meal) => setFoodLog((s) => {
    const dayEntries = s[dayKey]?.[personId] || [];
    const existing = dayEntries.find((e) => e.slotKey === slotKey);
    let nextEntries;
    if (existing) {
      nextEntries = dayEntries.filter((e) => e.id !== existing.id);
    } else {
      const n = meal ? computeItemsNutrition(meal.items, foodsById) : { cal: 0, p: 0, c: 0, f: 0, fiber: 0 };
      nextEntries = [...dayEntries, { id: uid("log"), slotKey, label: meal?.name || "Logged item", time: nowDisplayTime(), ...n }];
    }
    return { ...s, [dayKey]: { ...(s[dayKey] || {}), [personId]: nextEntries } };
  });
  const logFreeEntry = (dayKey, personId, entry) => setFoodLog((s) => {
    const dayEntries = s[dayKey]?.[personId] || [];
    return { ...s, [dayKey]: { ...(s[dayKey] || {}), [personId]: [...dayEntries, { id: uid("log"), slotKey: null, ...entry }] } };
  });
  const removeLogEntry = (dayKey, personId, entryId) => setFoodLog((s) => {
    const dayEntries = (s[dayKey]?.[personId] || []).filter((e) => e.id !== entryId);
    return { ...s, [dayKey]: { ...(s[dayKey] || {}), [personId]: dayEntries } };
  });

  const addWater = (dayKey, personId, oz) => setWater((s) => {
    const next = { ...s, [dayKey]: { ...(s[dayKey] || {}) } };
    next[dayKey][personId] = Math.max(0, (next[dayKey][personId] || 0) + oz);
    return next;
  });
  const setWaterTotal = (dayKey, personId, value) => setWater((s) => ({
    ...s, [dayKey]: { ...(s[dayKey] || {}), [personId]: Math.max(0, value) },
  }));

  const updatePref = (foodId, personId, level) => setPrefs((s) => ({
    ...s, [foodId]: { ...(s[foodId] || {}), [personId]: { ...(s[foodId]?.[personId] || {}), level } },
  }));
  const updateNote = (foodId, personId, note) => setPrefs((s) => ({
    ...s, [foodId]: { ...(s[foodId] || {}), [personId]: { ...(s[foodId]?.[personId] || { level: "neutral" }), note } },
  }));

  const updateFoodQty = (foodId, delta) => setFoods((s) => s.map((f) => f.id === foodId ? { ...f, qty: Math.max(0, f.qty + delta) } : f));
  const restockFoods = (rows) => setFoods((s) => s.map((f) => {
    const row = rows.find((r) => r.foodId === f.id);
    return row ? { ...f, qty: round(f.qty + row.buyServings, 1) } : f;
  }));
  const addFood = (draft) => setFoods((s) => [...s, {
    id: uid("food"), name: draft.name, brand: draft.brand, category: draft.category, servingLabel: draft.servingLabel,
    cal: Number(draft.cal) || 0, p: Number(draft.p) || 0, c: Number(draft.c) || 0, f: Number(draft.fat) || 0,
    fiber: Number(draft.fiber) || 0, gf: draft.gf, ai: draft.ai, price: Number(draft.price) || 0, store: draft.store || "—",
    prices: [{ store: draft.store || "—", price: Number(draft.price) || 0 }], preferredStore: draft.store || "—",
    location: draft.location, qty: Number(draft.qty) || 0, pkgServings: Number(draft.qty) || 1,
  }]);
  const updateFoodPrice = (foodId, store, price) => setFoods((s) => s.map((f) => f.id !== foodId ? f : {
    ...f, prices: f.prices.map((p) => p.store === store ? { ...p, price } : p),
  }));
  const addStorePrice = (foodId, store, price) => setFoods((s) => s.map((f) => f.id !== foodId ? f : {
    ...f, prices: f.prices.some((p) => p.store === store) ? f.prices : [...f.prices, { store, price }],
  }));
  const removeStorePrice = (foodId, store) => setFoods((s) => s.map((f) => {
    if (f.id !== foodId || f.prices.length <= 1) return f;
    const prices = f.prices.filter((p) => p.store !== store);
    return { ...f, prices, preferredStore: f.preferredStore === store ? prices[0].store : f.preferredStore };
  }));
  const renameStore = (foodId, oldName, newName) => setFoods((s) => s.map((f) => {
    if (f.id !== foodId) return f;
    if (f.prices.some((p) => p.store === newName && newName !== oldName)) return f; // avoid duplicate store names
    return {
      ...f, prices: f.prices.map((p) => p.store === oldName ? { ...p, store: newName } : p),
      preferredStore: f.preferredStore === oldName ? newName : f.preferredStore,
    };
  }));
  const deleteFood = (foodId) => {
    setFoods((s) => s.filter((f) => f.id !== foodId));
    setPrefs((s) => { const next = { ...s }; delete next[foodId]; return next; });
  };
  const toggleStaple = (foodId) => setFoods((s) => s.map((f) => f.id === foodId ? { ...f, isStaple: !f.isStaple } : f));
  const setPreferredStore = (foodId, store) => setFoods((s) => s.map((f) => f.id === foodId ? { ...f, preferredStore: store } : f));

  const toggleFavorite = (mealId) => setFavorites((s) => s.includes(mealId) ? s.filter((x) => x !== mealId) : [...s, mealId]);
  const toggleGroceryChecked = (foodId) => setGroceryChecked((s) => ({ ...s, [foodId]: !s[foodId] }));
  const setCheckedMany = (foodIds) => setGroceryChecked(() => {
    const next = {}; foodIds.forEach((id) => { next[id] = true; }); return next;
  });
  const clearPurchased = (rows) => { restockFoods(rows); setGroceryChecked({}); };
  const updateProfile = (personId, key, value) => setProfiles((s) => ({ ...s, [personId]: { ...s[personId], [key]: value } }));
  const addRestaurant = (personId, name) => setProfiles((s) => s[personId].favoriteRestaurants.includes(name) ? s : {
    ...s, [personId]: { ...s[personId], favoriteRestaurants: [...s[personId].favoriteRestaurants, name] },
  });
  const removeRestaurant = (personId, name) => setProfiles((s) => ({
    ...s, [personId]: { ...s[personId], favoriteRestaurants: s[personId].favoriteRestaurants.filter((r) => r !== name) },
  }));
  const toggleWorkoutDay = (personId, day) => setProfiles((s) => {
    const cur = s[personId].workoutDays;
    const next = cur.includes(day) ? cur.filter((d) => d !== day) : [...cur, day];
    return { ...s, [personId]: { ...s[personId], workoutDays: next } };
  });
  const logWeight = (personId, weight) => setWeightLog((s) => ({
    ...s, [personId]: [...(s[personId] || []), { id: uid("wt"), date: todayISO(), weight }],
  }));
  const removeWeightEntry = (personId, id) => setWeightLog((s) => ({
    ...s, [personId]: (s[personId] || []).filter((e) => e.id !== id),
  }));
  const saveGymCheckin = (personId, entry) => setGymLog((s) => ({
    ...s, [todayISO()]: { ...(s[todayISO()] || {}), [personId]: entry },
  }));

  const generateWeek = (mode) => {
    setOverrides((prev) => {
      const next = JSON.parse(JSON.stringify(prev || {}));
      WEEK_DAYS.forEach((day) => {
        day.slots.forEach((slot) => {
          if (isLocked(day.key, slot.key, locks)) return;
          ["tyler", "elizabeth"].forEach((personId) => {
            let pool;
            if (slot.category === "lunch") {
              pool = MEALS.filter((m) => m.category === "lunch" && (m.people === personId || m.people === "both")).map((m) => m.id);
            } else if (slot.category === "dinner" && typeof slot.meal !== "string") {
              pool = MEALS.filter((m) => m.category === "dinner" && m.people === personId).map((m) => m.id);
              if (!pool.length) pool = SWAP_POOL.dinner;
            } else {
              pool = SWAP_POOL[slot.category] || [typeof slot.meal === "string" ? slot.meal : slot.meal[personId]];
            }
            let final = filterByPreferenceMode(pool, personId, prefs, mealsMap, foodsById, mode);
            if (!final.length) final = pool;
            const pick = final[Math.floor(Math.random() * final.length)];
            next[day.key] = next[day.key] || {};
            next[day.key][slot.key] = next[day.key][slot.key] || {};
            next[day.key][slot.key][personId] = pick;
          });
        });
      });
      return next;
    });
  };

  const openMealDetail = (meal, slot, day) => setMealDetail({ meal, slot, day });

  const goToTourStep = (i) => {
    const s = TOUR_STEPS[i];
    if (!s) return;
    setTourStep(i);
    setView(s.view);
    if (s.view === "profile") setProfileSub(s.profileSub || "overview");
  };
  const startTour = () => goToTourStep(0);
  const nextTourStep = () => { if (tourStep + 1 >= TOUR_STEPS.length) { setTourStep(null); setProfileSub("overview"); } else goToTourStep(tourStep + 1); };
  const prevTourStep = () => goToTourStep(Math.max(0, tourStep - 1));
  const exitTour = () => { setTourStep(null); setProfileSub("overview"); };

  const todaysDay = WEEK_DAYS.find((d) => d.key === todayDayKey()) || WEEK_DAYS[0];
  const todaysRemaining = useMemo(() => {
    const entries = foodLog?.[todayISO()]?.[person] || [];
    const cal = entries.reduce((s, e) => s + e.cal, 0);
    const prof = profiles[person] || DEFAULT_PROFILES.tyler;
    return { cal: Math.max(0, prof.calorieTarget - cal) };
  }, [foodLog, person, profiles]);

  if (!loaded) {
    return (
      <div className="hearth" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <style>{GLOBAL_CSS}</style>
        <img src={TROPHE_LOCKUP_IMG} alt="Trophé — Nourish · Fuel · Thrive" style={{ width: "min(78vw, 340px)", height: "auto" }} />
        <div className="font-display text-[13px] mt-4" style={{ color: "var(--ink-faint)" }}>Setting the table…</div>
      </div>
    );
  }

  return (
    <div className="hearth" style={{ minHeight: "100vh", maxWidth: 480, margin: "0 auto", display: "flex", flexDirection: "column" }}>
      <style>{GLOBAL_CSS}</style>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {tourStep != null && (
          <TourCaption step={tourStep} total={TOUR_STEPS.length} title={TOUR_STEPS[tourStep].title} body={TOUR_STEPS[tourStep].body}
            onNext={nextTourStep} onBack={prevTourStep} onExit={exitTour} />
        )}
        {view === "home" && (
          <HomeScreen person={person} setPerson={setPerson} viewDate={viewDate} setViewDate={setViewDate}
            foodsById={foodsById} mealsMap={mealsMap} prefs={prefs}
            profile={profiles[person]} overrides={overrides} locks={locks} foodLog={foodLog} toggleEaten={toggleEaten}
            removeLogEntry={removeLogEntry} water={water} addWater={addWater} setWaterTotal={setWaterTotal}
            timeOverrides={timeOverrides} setTimeOverride={setTimeOverride}
            workoutOverrides={workoutOverrides} setWorkoutOverride={setWorkoutOverride} routine={routine}
            onOpenModal={(m) => m === "addFood" ? (setView("meals"), setAddFoodTrigger((n) => n + 1)) : setModal(m)}
            onNavigate={(v) => v === "progress" ? (setView("profile"), setProfileSub("progress")) : setView(v)} onOpenMeal={openMealDetail} />
        )}
        {view === "week" && (
          <WeekScreen person={weekPerson} setPerson={setWeekPerson} mealsMap={mealsMap} foodsById={foodsById} prefs={prefs}
            overrides={overrides} locks={locks} toggleLock={toggleLock} applySwap={applySwap}
            onView={(meal, slot, day) => openMealDetail(meal, slot, day)} onGenerate={generateWeek} timeOverrides={timeOverrides}
            workoutOverrides={workoutOverrides} setWorkoutOverride={setWorkoutOverride} profiles={profiles}
            favorites={favorites} toggleFavorite={toggleFavorite} />
        )}
        {view === "meals" && (
          <MealsScreen meals={allMeals} foods={foods} foodsById={foodsById} prefs={prefs} updatePref={updatePref}
            updateFoodQty={updateFoodQty} updateFoodPrice={updateFoodPrice} addStorePrice={addStorePrice}
            removeStorePrice={removeStorePrice} setPreferredStore={setPreferredStore} renameStore={renameStore} deleteFood={deleteFood} toggleStaple={toggleStaple}
            favorites={favorites} toggleFavorite={toggleFavorite}
            onView={(meal) => openMealDetail(meal, null, null)} onAddMealToWeek={onAddMealToWeek} onAddFood={addFood} onAddRecipe={addRecipe}
            water={water} addFoodTrigger={addFoodTrigger} inventoryTrigger={inventoryTrigger} />
        )}
        {view === "groceries" && (
          <GroceriesScreen overrides={overrides} foodsById={foodsById} mealsMap={mealsMap}
            checked={groceryChecked} toggleChecked={toggleGroceryChecked} setCheckedMany={setCheckedMany}
            onClearPurchased={clearPurchased} budget={budget} setBudget={setBudget}
            onNavigateInventory={() => { setView("meals"); setInventoryTrigger((n) => n + 1); }} />
        )}
        {view === "profile" && profileSub === "overview" && (
          <ProfileScreen person={profilePerson} setPerson={setProfilePerson} profiles={profiles} updateProfile={updateProfile}
            toggleWorkoutDay={toggleWorkoutDay} weightLog={weightLog} logWeight={logWeight} removeWeightEntry={removeWeightEntry}
            addRestaurant={addRestaurant} removeRestaurant={removeRestaurant}
            onOpenPreferences={() => setProfileSub("preferences")} onOpenProgress={() => setProfileSub("progress")} onOpenHelp={() => setProfileSub("help")}
            onOpenLibrary={() => setProfileSub("library")} onOpenRoutine={() => setProfileSub("routine")} />
        )}
        {view === "profile" && profileSub === "preferences" && (
          <PreferencesScreen foods={foods} prefs={prefs} updatePref={updatePref} updateNote={updateNote}
            allowNever={allowNever} setAllowNever={setAllowNever} onBack={() => { setProfileSub("overview"); setTourStep(null); }} />
        )}
        {view === "profile" && profileSub === "progress" && (
          <ProgressScreen onBack={() => { setProfileSub("overview"); setTourStep(null); }} person={progressPerson} setPerson={setProgressPerson}
            foodLog={foodLog} water={water} gymLog={gymLog} />
        )}
        {view === "profile" && profileSub === "help" && (
          <HelpScreen onBack={() => { setProfileSub("overview"); setTourStep(null); }} onStartTour={startTour} onOpenLibrary={() => setProfileSub("library")} />
        )}
        {view === "profile" && profileSub === "library" && (
          <LibraryScreen onBack={() => setProfileSub("overview")} customTerms={customTerms} addCustomTerm={addCustomTerm} removeCustomTerm={removeCustomTerm} />
        )}
        {view === "profile" && profileSub === "routine" && (
          <RoutineScreen onBack={() => setProfileSub("overview")} routine={routine} updateRoutine={updateRoutine} />
        )}
      </div>

      <BottomNav active={view} onChange={(v) => { setView(v); if (v !== "profile") setProfileSub("overview"); if (tourStep != null) setTourStep(null); }} />

      {modal === "snack" && (
        <SnackModal person={person} remaining={todaysRemaining} mealsMap={mealsMap} foodsById={foodsById}
          onClose={() => setModal(null)} onAdd={(meal) => {
            const today = todayISO();
            const entries = foodLog?.[today]?.[person] || [];
            const takenSlots = new Set(entries.map((e) => e.slotKey).filter(Boolean));
            const targetSlot = todaysDay.slots.find((s) => s.category === meal.category && !takenSlots.has(s.key))
              || todaysDay.slots.find((s) => s.category === "snack" && !takenSlots.has(s.key));
            if (targetSlot) { applySwap(todaysDay.key, targetSlot.key, person, meal.id); toggleEaten(today, person, targetSlot.key, meal); }
            else { logFreeEntry(today, person, { label: meal.name, time: nowDisplayTime(), ...computeItemsNutrition(meal.items, foodsById) }); }
          }}
          onAddFastFood={(f) => logFreeEntry(todayISO(), person, { label: `${f.item} (${f.restaurant})`, time: nowDisplayTime(), cal: f.cal, p: f.p, c: f.c, f: f.f, fiber: 0 })}
        />
      )}
      {modal === "gym" && (
        <GymCheckinModal onClose={() => setModal(null)} onSave={(entry) => saveGymCheckin(person, entry)}
          onShowSnackOptions={() => setModal("snack")} />
      )}
      {modal === "restaurant" && (
        <RestaurantModal remaining={todaysRemaining} onClose={() => setModal(null)} onLog={(entry) => logFreeEntry(viewDate, person, entry)} />
      )}
      {modal === "logFood" && (
        <LogFoodModal meals={allMeals} foods={foods} foodsById={foodsById} onClose={() => setModal(null)}
          targetDate={viewDate} onLog={(entry) => logFreeEntry(viewDate, person, entry)} />
      )}

      {mealDetail && (
        <MealDetailSheet meal={mealDetail.meal} slot={mealDetail.slot} day={mealDetail.day} foodsById={foodsById}
          prefs={prefs} favorites={favorites} toggleFavorite={toggleFavorite} onClose={() => setMealDetail(null)} onDeleteRecipe={deleteRecipe} />
      )}
    </div>
  );
}
