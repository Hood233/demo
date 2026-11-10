// Food database (approx values per serving). Nutrients:
// kcal, p=protein g, c=carbs g, f=fat g, fib=fiber g,
// va=Vitamin A mcg, vc=Vitamin C mg, vd=Vitamin D mcg, b12=Vitamin B12 mcg,
// fe=Iron mg, ca=Calcium mg
const FOODS = [
  // Anaj / Grains
  { id: "roti", name: "Roti / Chapati (1)", cat: "Anaaj", kcal: 120, p: 3, c: 18, f: 3, fib: 2, va: 0, vc: 0, vd: 0, b12: 0, fe: 1, ca: 10 },
  { id: "rice", name: "Chawal (1 katori)", cat: "Anaaj", kcal: 195, p: 4, c: 43, f: 0.4, fib: 0.6, va: 0, vc: 0, vd: 0, b12: 0, fe: 0.3, ca: 15 },
  { id: "paratha", name: "Aloo Paratha (1)", cat: "Anaaj", kcal: 290, p: 6, c: 40, f: 12, fib: 4, va: 5, vc: 8, vd: 0, b12: 0, fe: 1.8, ca: 30 },
  { id: "poha", name: "Poha (1 plate)", cat: "Nashta", kcal: 250, p: 5, c: 45, f: 6, fib: 2, va: 10, vc: 5, vd: 0, b12: 0, fe: 3, ca: 20 },
  { id: "upma", name: "Upma (1 plate)", cat: "Nashta", kcal: 250, p: 6, c: 38, f: 8, fib: 3, va: 15, vc: 4, vd: 0, b12: 0, fe: 1.5, ca: 25 },
  { id: "idli", name: "Idli (2) + Sambar", cat: "Nashta", kcal: 200, p: 7, c: 36, f: 2, fib: 4, va: 40, vc: 6, vd: 0, b12: 0, fe: 1.8, ca: 40 },
  { id: "dosa", name: "Dosa (1 plain)", cat: "Nashta", kcal: 170, p: 4, c: 28, f: 5, fib: 1.5, va: 0, vc: 0, vd: 0, b12: 0, fe: 1, ca: 15 },
  { id: "oats", name: "Oats doodh ke saath (1 bowl)", cat: "Nashta", kcal: 300, p: 12, c: 45, f: 8, fib: 5, va: 120, vc: 0, vd: 2, b12: 1, fe: 2.5, ca: 280 },
  { id: "bread", name: "Bread (2 slice)", cat: "Nashta", kcal: 150, p: 5, c: 28, f: 2, fib: 1.5, va: 0, vc: 0, vd: 0, b12: 0, fe: 1.6, ca: 60 },
  { id: "biryani", name: "Biryani (1 plate)", cat: "Anaaj", kcal: 450, p: 18, c: 55, f: 16, fib: 2, va: 30, vc: 3, vd: 0.2, b12: 0.5, fe: 2, ca: 50 },

  // Dal / Protein
  { id: "dal", name: "Dal (1 katori)", cat: "Dal / Protein", kcal: 150, p: 9, c: 20, f: 4, fib: 5, va: 20, vc: 2, vd: 0, b12: 0, fe: 2.5, ca: 40 },
  { id: "rajma", name: "Rajma (1 katori)", cat: "Dal / Protein", kcal: 210, p: 10, c: 30, f: 5, fib: 8, va: 5, vc: 2, vd: 0, b12: 0, fe: 3, ca: 60 },
  { id: "chole", name: "Chole (1 katori)", cat: "Dal / Protein", kcal: 230, p: 10, c: 32, f: 7, fib: 9, va: 5, vc: 3, vd: 0, b12: 0, fe: 3.5, ca: 70 },
  { id: "sprouts", name: "Sprouts / Ankurit (1 katori)", cat: "Dal / Protein", kcal: 100, p: 7, c: 18, f: 0.5, fib: 5, va: 10, vc: 15, vd: 0, b12: 0, fe: 1.8, ca: 30 },
  { id: "soya", name: "Soya chunks (1 katori)", cat: "Dal / Protein", kcal: 170, p: 16, c: 11, f: 1, fib: 4, va: 0, vc: 0, vd: 0, b12: 0, fe: 4, ca: 90 },
  { id: "paneer", name: "Paneer (100 g)", cat: "Dal / Protein", kcal: 265, p: 18, c: 3, f: 20, fib: 0, va: 200, vc: 0, vd: 0.2, b12: 0.8, fe: 0.2, ca: 480 },
  { id: "egg", name: "Anda ubla (1)", cat: "Non-Veg", kcal: 78, p: 6, c: 0.6, f: 5, fib: 0, va: 75, vc: 0, vd: 1.1, b12: 0.6, fe: 0.9, ca: 25 },
  { id: "chicken", name: "Chicken curry (1 katori)", cat: "Non-Veg", kcal: 250, p: 25, c: 6, f: 14, fib: 1, va: 30, vc: 2, vd: 0.2, b12: 0.4, fe: 1.3, ca: 20 },
  { id: "fish", name: "Machli / Fish curry (1 katori)", cat: "Non-Veg", kcal: 220, p: 22, c: 5, f: 12, fib: 0.5, va: 40, vc: 1, vd: 8, b12: 2.5, fe: 1, ca: 40 },
  { id: "mutton", name: "Mutton curry (1 katori)", cat: "Non-Veg", kcal: 300, p: 22, c: 5, f: 21, fib: 0.5, va: 10, vc: 1, vd: 0.1, b12: 2.2, fe: 2.5, ca: 20 },

  // Doodh
  { id: "milk", name: "Doodh (1 glass)", cat: "Doodh", kcal: 150, p: 8, c: 12, f: 8, fib: 0, va: 120, vc: 0, vd: 2.5, b12: 1.1, fe: 0.1, ca: 300 },
  { id: "curd", name: "Dahi (1 katori)", cat: "Doodh", kcal: 90, p: 5, c: 7, f: 5, fib: 0, va: 40, vc: 1, vd: 0.1, b12: 0.5, fe: 0.1, ca: 180 },
  { id: "chaach", name: "Chaach / Lassi namkeen (1 glass)", cat: "Doodh", kcal: 40, p: 2, c: 5, f: 1, fib: 0, va: 10, vc: 0, vd: 0, b12: 0.3, fe: 0, ca: 120 },

  // Sabzi
  { id: "palak", name: "Palak / Hari sabzi (1 katori)", cat: "Sabzi", kcal: 90, p: 4, c: 8, f: 5, fib: 4, va: 450, vc: 20, vd: 0, b12: 0, fe: 3, ca: 120 },
  { id: "mixveg", name: "Mix veg sabzi (1 katori)", cat: "Sabzi", kcal: 120, p: 3, c: 12, f: 7, fib: 4, va: 250, vc: 25, vd: 0, b12: 0, fe: 1.2, ca: 50 },
  { id: "aloo", name: "Aloo sabzi (1 katori)", cat: "Sabzi", kcal: 160, p: 3, c: 24, f: 6, fib: 3, va: 5, vc: 12, vd: 0, b12: 0, fe: 0.8, ca: 15 },
  { id: "salad", name: "Salad - kheera/tamatar/gajar (1 plate)", cat: "Sabzi", kcal: 40, p: 1.5, c: 8, f: 0.3, fib: 3, va: 300, vc: 20, vd: 0, b12: 0, fe: 0.5, ca: 30 },

  // Phal
  { id: "banana", name: "Kela (1)", cat: "Phal", kcal: 105, p: 1.3, c: 27, f: 0.4, fib: 3, va: 4, vc: 10, vd: 0, b12: 0, fe: 0.3, ca: 6 },
  { id: "apple", name: "Seb (1)", cat: "Phal", kcal: 95, p: 0.5, c: 25, f: 0.3, fib: 4.4, va: 5, vc: 8, vd: 0, b12: 0, fe: 0.2, ca: 11 },
  { id: "orange", name: "Santra / Mausambi (1)", cat: "Phal", kcal: 62, p: 1.2, c: 15, f: 0.2, fib: 3, va: 14, vc: 70, vd: 0, b12: 0, fe: 0.1, ca: 50 },
  { id: "guava", name: "Amrood (1)", cat: "Phal", kcal: 68, p: 2.5, c: 14, f: 1, fib: 5.4, va: 30, vc: 200, vd: 0, b12: 0, fe: 0.3, ca: 18 },
  { id: "papaya", name: "Papita (1 bowl)", cat: "Phal", kcal: 60, p: 0.7, c: 15, f: 0.4, fib: 2.5, va: 70, vc: 88, vd: 0, b12: 0, fe: 0.4, ca: 30 },
  { id: "mango", name: "Aam (1)", cat: "Phal", kcal: 150, p: 1.5, c: 37, f: 0.6, fib: 3, va: 110, vc: 60, vd: 0, b12: 0, fe: 0.3, ca: 20 },

  // Dry fruits / nuts
  { id: "almond", name: "Badam (10)", cat: "Dry Fruits", kcal: 70, p: 2.5, c: 2.5, f: 6, fib: 1.5, va: 0, vc: 0, vd: 0, b12: 0, fe: 0.5, ca: 32 },
  { id: "peanut", name: "Mungfali / Bhuna chana (1 mutthi)", cat: "Dry Fruits", kcal: 170, p: 7, c: 5, f: 14, fib: 2.5, va: 0, vc: 0, vd: 0, b12: 0, fe: 1.4, ca: 25 },
  { id: "dates", name: "Khajoor (3)", cat: "Dry Fruits", kcal: 70, p: 0.6, c: 18, f: 0, fib: 2, va: 0, vc: 0, vd: 0, b12: 0, fe: 0.3, ca: 15 },

  // Junk / Drinks
  { id: "chai", name: "Chai cheeni wali (1 cup)", cat: "Peene wali", kcal: 90, p: 2, c: 14, f: 3, fib: 0, va: 20, vc: 0, vd: 0.3, b12: 0.2, fe: 0, ca: 70 },
  { id: "coffee", name: "Coffee doodh wali (1 cup)", cat: "Peene wali", kcal: 80, p: 2, c: 12, f: 3, fib: 0, va: 20, vc: 0, vd: 0.3, b12: 0.2, fe: 0, ca: 70 },
  { id: "coldrink", name: "Cold drink (300 ml)", cat: "Junk", kcal: 130, p: 0, c: 33, f: 0, fib: 0, va: 0, vc: 0, vd: 0, b12: 0, fe: 0, ca: 0, junk: true },
  { id: "samosa", name: "Samosa (1)", cat: "Junk", kcal: 260, p: 4, c: 30, f: 14, fib: 2, va: 5, vc: 3, vd: 0, b12: 0, fe: 1, ca: 15, junk: true },
  { id: "pakode", name: "Pakode (1 plate)", cat: "Junk", kcal: 300, p: 6, c: 28, f: 18, fib: 3, va: 10, vc: 4, vd: 0, b12: 0, fe: 1.5, ca: 30, junk: true },
  { id: "burger", name: "Burger / Pizza slice", cat: "Junk", kcal: 350, p: 15, c: 40, f: 15, fib: 2, va: 50, vc: 2, vd: 0.2, b12: 0.5, fe: 2.5, ca: 100, junk: true },
  { id: "maggi", name: "Maggi / Noodles (1 packet)", cat: "Junk", kcal: 350, p: 8, c: 50, f: 14, fib: 2, va: 0, vc: 0, vd: 0, b12: 0, fe: 2, ca: 20, junk: true },
  { id: "sweet", name: "Mithai (1 piece)", cat: "Junk", kcal: 150, p: 2, c: 22, f: 6, fib: 0, va: 10, vc: 0, vd: 0, b12: 0, fe: 0.3, ca: 40, junk: true },
  { id: "chips", name: "Chips / Namkeen (1 packet)", cat: "Junk", kcal: 280, p: 3, c: 28, f: 18, fib: 2, va: 0, vc: 5, vd: 0, b12: 0, fe: 0.5, ca: 10, junk: true },
];

const NUTRIENTS = [
  { key: "kcal", label: "Calories", unit: "kcal" },
  { key: "p", label: "Protein", unit: "g" },
  { key: "fib", label: "Fiber", unit: "g" },
  { key: "va", label: "Vitamin A", unit: "mcg" },
  { key: "vc", label: "Vitamin C", unit: "mg" },
  { key: "vd", label: "Vitamin D", unit: "mcg" },
  { key: "b12", label: "Vitamin B12", unit: "mcg" },
  { key: "fe", label: "Iron", unit: "mg" },
  { key: "ca", label: "Calcium", unit: "mg" },
];

// Kis kami ke liye kya khayein
const SOURCES = {
  kcal: "Roti, chawal, dal, kela, mungfali",
  p: "Dal, paneer, anda, chicken, soya chunks, sprouts, dahi",
  fib: "Salad, hari sabzi, rajma/chole, amrood, seb, oats",
  va: "Gajar, palak, papita, aam, doodh, anda",
  vc: "Amrood, santra/mausambi, papita, nimbu, tamatar, aamla",
  vd: "Subah 15-20 min dhoop, machli, anda ki zardi, fortified doodh",
  b12: "Doodh, dahi, paneer, anda, machli, chicken (veg logon ko doctor se supplement poochhna chahiye)",
  fe: "Palak, gud-chana, soya, rajma, khajoor, anar (saath mein Vitamin C lein)",
  ca: "Doodh, dahi, paneer, ragi, til, hari sabzi",
};

// Roz ki zaroorat (approx, ICMR-NIN 2020 ke aas-paas). Calories aur protein profile se calculate hote hain.
function dailyNeeds(profile) {
  const male = profile.gender === "male";
  const age = Number(profile.age) || 30;
  const w = Number(profile.weight) || 65;
  const h = Number(profile.height) || 165;
  // Mifflin-St Jeor BMR
  const bmr = 10 * w + 6.25 * h - 5 * age + (male ? 5 : -161);
  const factor = { low: 1.2, light: 1.375, moderate: 1.55, high: 1.725 }[profile.activity || "light"];
  let kcal = bmr * factor;
  if (profile.goal === "lose") kcal -= 400;
  if (profile.goal === "gain") kcal += 300;
  return {
    kcal: Math.round(kcal / 10) * 10,
    p: Math.round(w * (age >= 60 ? 1.0 : 0.9)),
    fib: male ? 30 : 25,
    va: male ? 1000 : 840,
    vc: male ? 80 : 65,
    vd: 15,
    b12: 2.5,
    fe: male ? 19 : (age >= 50 ? 19 : 29),
    ca: age >= 50 ? 1200 : 1000,
  };
}

function waterTargetMl(profile) {
  const w = Number(profile.weight) || 65;
  let ml = w * 35;
  if (profile.activity === "high") ml += 500;
  return Math.round(ml / 250) * 250;
}

function sleepTarget(age) {
  age = Number(age) || 30;
  if (age < 18) return "8-10 ghante";
  if (age < 65) return "7-9 ghante";
  return "7-8 ghante";
}

const ADDICTIONS = [
  { id: "alcohol", name: "Daru / Sharab", icon: "🍺", unitLabel: "Roz ka kharcha (₹)",
    milestones: [
      [1, "Body se alcohol nikalna shuru, neend thodi kharab ho sakti hai"],
      [3, "Craving sabse zyada – paani, khana aur neend par dhyan do"],
      [7, "Neend behtar, skin aur hydration mein sudhaar"],
      [30, "Liver fat kam hona shuru, BP better, energy zyada"],
      [90, "Mood stable, liver kaafi recover, paise ki badi bachat"],
      [365, "Cancer, liver aur heart disease ka risk kaafi kam"],
    ] },
  { id: "cigarette", name: "Cigarette / Bidi", icon: "🚬", unitLabel: "Roz kitni cigarette",
    milestones: [
      [1, "Khoon mein carbon monoxide normal, oxygen level badha"],
      [2, "Swaad aur sungh behtar hone lagi"],
      [14, "Blood circulation aur lungs ka function behtar"],
      [30, "Khansi aur saans phoolna kam"],
      [365, "Heart attack ka risk aadha"],
      [1825, "Stroke ka risk non-smoker jaisa"],
    ] },
  { id: "tobacco", name: "Tambaku / Gutkha", icon: "🌿", unitLabel: "Roz ke packet",
    milestones: [
      [1, "Nicotine body se nikalne lagi"],
      [3, "Craving peak par – saunf, elaichi, chewing gum rakho"],
      [14, "Munh ke chhale aur masoode theek hone lage"],
      [30, "Swaad wapas, munh ki safai behtar"],
      [365, "Munh ke cancer ka risk kam hona shuru"],
    ] },
];
