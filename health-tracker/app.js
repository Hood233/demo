(() => {
  "use strict";
  const KEY = "sehatDiary.v1";
  const $ = (s) => document.querySelector(s);
  const GLASS_ML = 250;
  const MEALS = { morning: "Subah / Nashta", lunch: "Dopahar", snack: "Shaam / Snacks", dinner: "Raat" };

  // ---------- Storage ----------
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      if (s && typeof s === "object") return { ...emptyState(), ...s };
    } catch (e) { /* ignore */ }
    return emptyState();
  }
  function emptyState() { return { profile: null, days: {}, addictions: {}, meds: [], customFoods: [] }; }
  let state = load();

  // Food list = built-in + apne jode hue
  let foodById = {};
  const allFoods = () => FOODS.concat(state.customFoods || []);
  function rebuildFoods() {
    foodById = Object.fromEntries(allFoods().map((f) => [f.id, f]));
    $("#foodList").innerHTML = allFoods().map((f) => `<option value="${esc(f.name)}">${esc(f.cat)}</option>`).join("");
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { toast("Save nahi ho paya (storage band hai?)"); }
  }

  // ---------- Date helpers ----------
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parse = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const todayIso = () => iso(new Date());
  const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); };
  const daysBetween = (a, b) => Math.round((parse(b) - parse(a)) / 86400000);
  const fmt = (s) => parse(s).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  const fmtLong = (s) => parse(s).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  let current = todayIso();

  const blankDay = () => ({ foods: [], water: 0, walk: false, walkMin: "", habits: {}, sleep: "", weight: "", mood: "", notes: "", used: {}, meds: {}, vitals: {} });
  function day(date = current) {
    if (!state.days[date]) state.days[date] = blankDay();
    return state.days[date];
  }
  const peekDay = (date) => state.days[date];

  // ---------- Calculations ----------
  const profile = () => state.profile || { age: 30, gender: "male", weight: 65, height: 165, activity: "light", goal: "maintain", diet: "veg" };

  function totals(d) {
    const t = Object.fromEntries(NUTRIENTS.map((n) => [n.key, 0]));
    t.c = 0; t.f = 0;
    (d?.foods || []).forEach((item) => {
      const f = foodById[item.id]; if (!f) return;
      for (const k of Object.keys(t)) t[k] += (f[k] || 0) * item.qty;
    });
    if (d?.habits?.sun) t.vd += 10; // dhoop se approx Vitamin D
    return t;
  }

  function score(d) {
    if (!d) return 0;
    const p = profile();
    const needs = dailyNeeds(p);
    const waterPct = Math.min(1, (d.water * GLASS_ML) / waterTargetMl(p));
    const walk = d.walk ? Math.min(1, (Number(d.walkMin) || 30) / 30) : 0;
    const t = totals(d);
    let nutri = 0;
    if (d.foods.length) {
      const keys = NUTRIENTS.filter((n) => n.key !== "kcal").map((n) => n.key);
      nutri = keys.reduce((s, k) => s + Math.min(1, t[k] / needs[k]), 0) / keys.length;
    }
    const sl = Number(d.sleep);
    const sleep = !sl ? 0 : sl >= 7 && sl <= 9 ? 1 : sl >= 6 ? 0.6 : 0.3;
    const tracked = ADDICTIONS.filter((a) => state.addictions[a.id]?.on);
    const clean = tracked.length ? tracked.filter((a) => !d.used?.[a.id]).length / tracked.length : 1;
    const junk = d.foods.some((i) => foodById[i.id]?.junk) ? 0 : 1;
    return Math.round(waterPct * 25 + walk * 20 + nutri * 30 + sleep * 10 + clean * 10 + junk * 5);
  }

  const levelClass = (pct) => (pct >= 0.8 ? "" : pct >= 0.5 ? "mid" : "low");
  const pillClass = (s) => (s >= 70 ? "good" : s >= 40 ? "mid" : "bad");
  const r1 = (n) => (n >= 100 ? Math.round(n) : Math.round(n * 10) / 10);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ---------- UI: Today ----------
  function renderToday() {
    const d = peekDay(current) || blankDay();
    const p = profile();
    const needs = dailyNeeds(p);
    const wTarget = waterTargetMl(p);
    const glassesTarget = Math.ceil(wTarget / GLASS_ML);

    $("#datePick").value = current;
    $("#nextDay").disabled = current >= todayIso();
    const hour = new Date().getHours();
    const hi = hour < 12 ? "Suprabhat" : hour < 17 ? "Namaste" : "Shubh sandhya";
    $("#greet").textContent = current === todayIso() ? `${hi}${state.profile ? ", " + state.profile.name : ""}!` : fmtLong(current);

    const sc = score(d);
    $("#scoreVal").textContent = sc;
    $("#scoreRing").style.setProperty("--v", sc);
    $("#scoreMsg").textContent = sc >= 80 ? "Shaandaar din! Aise hi chalte raho 💪" : sc >= 50 ? "Achha hai, thoda aur dhyan do." : "Aaj ki entries bharo aur score badhao.";

    // water
    $("#waterGlasses").textContent = d.water;
    $("#waterMl").textContent = `${d.water * GLASS_ML} / ${wTarget} ml`;
    const wp = Math.min(1, (d.water * GLASS_ML) / wTarget);
    const wb = $("#waterBar"); wb.style.width = wp * 100 + "%"; wb.className = levelClass(wp);
    const left = glassesTarget - d.water;
    $("#waterHint").textContent = left > 0 ? `Aaj ${glassesTarget} glass peena chahiye – abhi ${left} glass baaki.` : "Paani ka target poora! 🎉";

    // walk
    $("#walkDone").checked = !!d.walk;
    $("#walkMin").value = d.walkMin;
    $("#walkHint").textContent = d.walk ? (Number(d.walkMin) >= 30 ? "Badhiya! Roz 30-45 min walk karo." : "Kam se kam 30 minute ki koshish karo.") : "Roz subah 30-45 min tez chaal se chalna sabse achha hai.";

    // habits
    $("#hExercise").checked = !!d.habits.exercise;
    $("#hSun").checked = !!d.habits.sun;
    $("#hNoJunk").checked = !d.foods.some((i) => foodById[i.id]?.junk) && !!d.habits.nojunk;
    $("#hEarlyDinner").checked = !!d.habits.earlyDinner;
    $("#sleep").value = d.sleep; $("#weightToday").value = d.weight; $("#mood").value = d.mood; $("#notes").value = d.notes;

    // meals
    const box = $("#mealList");
    if (!d.foods.length) box.innerHTML = '<p class="muted small">Abhi kuch nahi joda. Upar se khana chuno aur "Jodo" dabao.</p>';
    else {
      box.innerHTML = Object.entries(MEALS).map(([m, label]) => {
        const items = d.foods.map((it, idx) => ({ ...it, idx })).filter((it) => it.meal === m && foodById[it.id]);
        if (!items.length) return "";
        const kcal = items.reduce((s, it) => s + (foodById[it.id]?.kcal || 0) * it.qty, 0);
        return `<div class="meal"><h4>${label} · ${Math.round(kcal)} kcal</h4>${items.map((it) => {
          const f = foodById[it.id];
          return `<div class="food-item ${f.junk ? "junk" : ""}"><span>${esc(f.name)} × ${it.qty}</span><span class="muted small">${Math.round(f.kcal * it.qty)} kcal <button data-del="${it.idx}" title="Hatao">✕</button></span></div>`;
        }).join("")}</div>`;
      }).join("");
    }

    // nutrients
    const t = totals(d);
    $("#nutriList").innerHTML = NUTRIENTS.map((n) => {
      const pct = t[n.key] / needs[n.key];
      return `<div class="nutri"><span>${n.label}</span><div class="bar"><i class="${levelClass(pct)}" style="width:${Math.min(100, pct * 100)}%"></i></div><span class="val">${r1(t[n.key])} / ${needs[n.key]} ${n.unit}</span></div>`;
    }).join("") + `<p class="muted small">Carbs: ${Math.round(t.c)} g · Fat: ${Math.round(t.f)} g${d.habits.sun ? " · Dhoop se Vitamin D (~10 mcg) joda gaya" : ""}</p>`;

    const missing = NUTRIENTS.filter((n) => n.key !== "kcal" && t[n.key] / needs[n.key] < 0.7);
    const mb = $("#missingBox");
    if (!d.foods.length) mb.innerHTML = "";
    else if (!missing.length) mb.innerHTML = '<div class="missing ok">✅ Aaj sab zaroori vitamin aur poshan kaafi had tak poore ho gaye!</div>';
    else mb.innerHTML = `<div class="missing"><b>⚠️ Aaj ye kam reh gaya:</b><ul>${missing.map((n) => `<li><b>${n.label}</b> (${Math.round((t[n.key] / needs[n.key]) * 100)}%) – ${SOURCES[n.key]}</li>`).join("")}</ul></div>`;
    const kcalPct = t.kcal / needs.kcal;
    if (d.foods.length && kcalPct > 1.15) mb.innerHTML += `<div class="missing" style="margin-top:8px">🔥 Calories target se ${Math.round((kcalPct - 1) * 100)}% zyada ho gayi.</div>`;

    // addiction today
    const tracked = ADDICTIONS.filter((a) => state.addictions[a.id]?.on);
    $("#addictTodayCard").style.display = tracked.length ? "" : "none";
    renderTodayExtras(d);
    $("#addictToday").innerHTML = tracked.map((a) => `<label class="addict-today"><input type="checkbox" data-used="${a.id}" ${d.used?.[a.id] ? "checked" : ""}> ${a.icon} Aaj ${a.name} liya</label>`).join("");
  }

  // ---------- UI: History ----------
  let range = 7;
  function renderHistory() {
    const end = todayIso();
    const dates = Array.from({ length: range }, (_, i) => addDays(end, i - range + 1));
    const p = profile(); const needs = dailyNeeds(p);
    const gTarget = Math.ceil(waterTargetMl(p) / GLASS_ML);
    const rows = dates.map((dt) => { const d = peekDay(dt); return { dt, d, sc: d ? score(d) : null, t: d ? totals(d) : null }; });
    const logged = rows.filter((r) => r.d);
    const walkDays = logged.filter((r) => r.d.walk).length;
    const avgWater = logged.length ? logged.reduce((s, r) => s + r.d.water, 0) / logged.length : 0;
    const avgScore = logged.length ? logged.reduce((s, r) => s + r.sc, 0) / logged.length : 0;
    const waterOk = logged.filter((r) => r.d.water >= gTarget).length;

    $("#stats").innerHTML = [
      [`${walkDays}/${range}`, "din walk ki"],
      [`${r1(avgWater)}`, `avg glass paani (target ${gTarget})`],
      [`${waterOk}`, "din paani poora"],
      [`${Math.round(avgScore)}`, "avg score"],
    ].map(([b, s]) => `<div class="stat"><b>${b}</b><span>${s}</span></div>`).join("");

    const showLabel = (i) => range <= 7 || i % 5 === 0 || i === range - 1;
    $("#scoreChart").innerHTML = rows.map((r, i) => `<div class="col" title="${fmt(r.dt)}: ${r.sc ?? "–"}"><em>${range <= 7 && r.sc != null ? r.sc : ""}</em><i style="height:${r.sc || 0}%;${r.sc != null && r.sc < 40 ? "background:var(--bad)" : r.sc != null && r.sc < 70 ? "background:var(--warn)" : ""}"></i><small>${showLabel(i) ? fmt(r.dt) : "&nbsp;"}</small></div>`).join("");
    const maxW = Math.max(gTarget, ...rows.map((r) => r.d?.water || 0));
    $("#waterChart").innerHTML = rows.map((r, i) => `<div class="col" title="${fmt(r.dt)}: ${r.d?.water ?? 0} glass"><em>${range <= 7 && r.d ? r.d.water : ""}</em><i style="height:${((r.d?.water || 0) / maxW) * 100}%;background:#3b8fd9"></i><small>${showLabel(i) ? fmt(r.dt) : "&nbsp;"}</small></div>`).join("");

    $("#histTable").innerHTML = `<tr><th>Tareekh</th><th>Score</th><th>Paani</th><th>Walk</th><th>Calories</th><th>Neend</th><th>Kami</th></tr>` +
      rows.slice().reverse().map((r) => {
        if (!r.d) return `<tr><td>${fmt(r.dt)}</td><td colspan="6" class="muted">Entry nahi</td></tr>`;
        const miss = NUTRIENTS.filter((n) => n.key !== "kcal" && r.t[n.key] / needs[n.key] < 0.7).map((n) => n.label.replace("Vitamin ", "Vit "));
        return `<tr data-go="${r.dt}" style="cursor:pointer"><td>${fmt(r.dt)}</td><td><span class="pill ${pillClass(r.sc)}">${r.sc}</span></td><td>${r.d.water}/${gTarget}</td><td>${r.d.walk ? "✅ " + (r.d.walkMin || "") : "❌"}</td><td>${Math.round(r.t.kcal)}</td><td>${r.d.sleep || "–"}</td><td class="small">${r.d.foods.length ? (miss.join(", ") || "–") : "khana nahi likha"}</td></tr>`;
      }).join("");

    renderInsights(rows, needs, gTarget);
    renderCalendar(rows);
    renderBadges();
  }

  // ---------- UI: Plan ----------
  const PLAN = {
    early: ["Gungune paani + nimbu, 5 bheege badam", "1 glass gungune paani + 4 akhrot/badam", "Methi dana ka paani + 5 badam", "Gungune paani, 2 khajoor"],
    breakfast: {
      veg: ["Poha + mungfali + 1 glass doodh", "2 besan chilla + hari chutney + dahi", "Oats doodh ke saath + kela", "2 idli + sambar + nariyal chutney", "2 moong dal chilla + paneer bhurji", "1 aloo/gobhi paratha (kam ghee) + dahi", "Vegetable upma + 1 glass doodh"],
      egg: ["2 ubla anda + 2 brown bread + doodh", "Poha + 1 ubla anda", "Vegetable omelette (2 anda) + 1 roti", "Oats + 1 ubla anda + kela", "2 besan chilla + dahi", "Egg bhurji + 2 roti", "2 idli + sambar + 1 anda"],
    },
    mid: ["1 amrood / santra", "1 seb + chaach", "Papita 1 bowl", "1 kela + 10 badam", "Ankurit moong chaat", "Mausambi + bhuna chana", "1 bowl fruit chaat"],
    lunch: {
      veg: ["2 roti + dal + palak sabzi + salad + dahi", "1 katori chawal + rajma + salad + chaach", "2 roti + chole + kheera raita", "2 roti + mix veg + dal + salad", "Chawal + sambar + bhindi + dahi", "2 roti + paneer sabzi + dal + salad", "Khichdi + dahi + papad + salad"],
      nonveg: ["2 roti + chicken curry + salad", "Chawal + fish curry + sabzi", "2 roti + dal + egg curry + salad", "2 roti + chicken + dahi + salad", "Chawal + rajma + salad + chaach", "2 roti + palak + dal + salad", "Chawal + machli + raita"],
    },
    snack: ["Green tea / chai (kam cheeni) + bhuna chana", "Makhana bhuna 1 katori", "Sprouts chaat", "Chaach + mungfali", "Roasted chana + 1 fruit", "Murmura bhel (kam namak)", "Sattu ka sharbat"],
    dinner: {
      veg: ["2 roti + lauki sabzi + dal", "Dalia khichdi + dahi", "2 roti + soya sabzi + salad", "Vegetable soup + paneer tikka + 1 roti", "2 roti + tinda/turai + moong dal", "Moong dal khichdi + kadhi", "2 roti + palak paneer + salad"],
      nonveg: ["2 roti + grilled chicken + salad", "2 roti + lauki + dal", "Fish tikka + soup + 1 roti", "2 roti + egg bhurji + sabzi", "Dalia khichdi + dahi", "2 roti + chicken stew + salad", "2 roti + palak paneer + salad"],
    },
    bed: "Sone se pehle 1 glass haldi wala doodh (optional)",
  };
  const WEEK = ["Somvar", "Mangalvar", "Budhvar", "Guruvar", "Shukravar", "Shanivar", "Ravivar"];
  let dietPref = null;

  function renderPlan() {
    const p = profile();
    const needs = dailyNeeds(p);
    const wml = waterTargetMl(p);
    const bmi = p.weight / Math.pow(p.height / 100, 2);
    const bmiTxt = bmi < 18.5 ? "Kam wazan" : bmi < 23 ? "Normal (sahi)" : bmi < 25 ? "Thoda zyada" : bmi < 30 ? "Overweight" : "Motapa (Obese)";
    const age = Number(p.age);
    const tips = [
      `Roz <b>${Math.ceil(wml / GLASS_ML)} glass (${(wml / 1000).toFixed(1)} litre)</b> paani piyo – subah uthte hi 1-2 glass.`,
      `Subah <b>30-45 minute</b> tez chaal se walk ya yoga. Hafte mein kam se kam 150 minute exercise.`,
      `Neend <b>${sleepTarget(age)}</b> – raat 10-11 baje tak so jao.`,
      `Har khane mein aadhi plate sabzi/salad, chauthai protein (dal/paneer/anda), chauthai roti/chawal.`,
      `15-20 minute subah ki dhoop – Vitamin D ke liye.`,
      `Cheeni, maida, cold drink aur tala hua khana kam karo. Namak roz 1 chammach (5 g) se kam.`,
      `Raat ka khana sone se 2-3 ghante pehle.`,
    ];
    if (age >= 30) tips.push("Saal mein ek baar BP, sugar (HbA1c), cholesterol aur Vitamin D/B12 ki jaanch karwao.");
    if (age >= 45) tips.push("45+ umar: haddiyon ke liye calcium + Vitamin D par khaas dhyan, aankh aur dil ki jaanch.");
    if (p.gender === "female") tips.push("Mahilaon mein iron ki kami aam hai – hari sabzi, gud-chana khao, Hb test karwate raho.");
    if (p.goal === "lose") tips.push("Wazan kam karne ke liye roti/chawal thoda kam, protein aur sabzi zyada, raat ko halka khana.");
    if (p.goal === "gain") tips.push("Wazan badhane ke liye din mein 5-6 baar khao – doodh, kela, mungfali, paneer badhao.");
    if (!state.profile) tips.unshift("<b>Pehle Profile bharo</b> taaki aapke hisaab se target ban sake.");

    $("#lifestyleCard").innerHTML = `<h3>🧭 Aapki Daily Lifestyle kaisi honi chahiye</h3>
      <div class="kv">
        <div class="stat"><b>${Math.round(bmi * 10) / 10}</b><span>BMI · ${bmiTxt}</span></div>
        <div class="stat"><b>${needs.kcal}</b><span>kcal roz</span></div>
        <div class="stat"><b>${needs.p} g</b><span>protein roz</span></div>
        <div class="stat"><b>${(wml / 1000).toFixed(1)} L</b><span>paani roz</span></div>
        <div class="stat"><b>30-45 min</b><span>walk / exercise</span></div>
        <div class="stat"><b>${sleepTarget(age)}</b><span>neend</span></div>
      </div>
      <ul class="tips">${tips.map((t) => `<li>${t}</li>`).join("")}</ul>`;

    const diet = dietPref || p.diet || "veg";
    document.querySelectorAll("#dietSeg button").forEach((b) => b.classList.toggle("on", b.dataset.d === diet));
    const portion = needs.kcal < 1700 ? "Portions chhote rakho (roti 1-2)." : needs.kcal > 2400 ? "Portions bade rakh sakte ho (roti 3-4, extra doodh/mungfali)." : "Normal portions (roti 2-3).";
    $("#planNote").textContent = `Aapka target ~${needs.kcal} kcal/din. ${portion}`;
    const bf = diet === "veg" ? PLAN.breakfast.veg : PLAN.breakfast.egg;
    const ln = diet === "nonveg" ? PLAN.lunch.nonveg : PLAN.lunch.veg;
    const dn = diet === "nonveg" ? PLAN.dinner.nonveg : PLAN.dinner.veg;
    const todayIdx = (new Date().getDay() + 6) % 7;
    $("#weekPlan").innerHTML = WEEK.map((w, i) => `<details class="plan-day" ${i === todayIdx ? "open" : ""}><summary>${w}${i === todayIdx ? " (aaj)" : ""}</summary><dl>
      <dt>🌅 Subah 6-7 baje</dt><dd>${PLAN.early[i % PLAN.early.length]}</dd>
      <dt>🍳 Nashta 8-9 baje</dt><dd>${bf[i]}</dd>
      <dt>🍎 11 baje</dt><dd>${PLAN.mid[i]}</dd>
      <dt>🍛 Dopahar 1-2 baje</dt><dd>${ln[i]}</dd>
      <dt>☕ Shaam 5 baje</dt><dd>${PLAN.snack[i]}</dd>
      <dt>🌙 Raat 7-8 baje</dt><dd>${dn[i]}</dd>
      <dt>😴 Sone se pehle</dt><dd>${PLAN.bed}</dd></dl></details>`).join("");
  }

  // ---------- UI: Addictions ----------
  function addictStats(a) {
    const s = state.addictions[a.id];
    const days = Math.max(0, daysBetween(s.since, todayIso()));
    const perDay = Number(s.perDay) || 0;
    const cost = Number(s.cost) || 0;
    return { s, days, saved: a.id === "alcohol" ? days * perDay : days * perDay * cost, avoided: a.id === "alcohol" ? null : days * perDay };
  }
  function renderAddict() {
    $("#addictCards").innerHTML = ADDICTIONS.map((a) => {
      const s = state.addictions[a.id];
      if (!s?.on) {
        return `<div class="card addict-card"><div class="head"><h3>${a.icon} ${a.name}</h3><button class="btn small" data-start="${a.id}">Tracking chalu karo</button></div>
          <p class="muted small">Chhod diya hai ya chhodna chahte ho? Chalu karo aur din gino.</p></div>`;
      }
      const st = addictStats(a);
      const best = Math.max(st.days, ...(s.relapses || []).map((r) => r.streak || 0));
      return `<div class="card addict-card"><div class="head"><h3>${a.icon} ${a.name}</h3><button class="btn small ghost" data-stop="${a.id}">Band karo</button></div>
        <div class="kv">
          <div class="stat"><span class="big">${st.days}</span><span>din se nahi liya</span></div>
          <div class="stat"><b>₹${Math.round(st.saved).toLocaleString("en-IN")}</b><span>paise bache</span></div>
          ${st.avoided != null ? `<div class="stat"><b>${Math.round(st.avoided)}</b><span>${a.id === "cigarette" ? "cigarette" : "packet"} nahi li</span></div>` : ""}
          <div class="stat"><b>${best}</b><span>sabse lamba streak (din)</span></div>
          <div class="stat"><b>${(s.relapses || []).length}</b><span>baar dobara liya</span></div>
        </div>
        <div class="grid3">
          <label class="field">Kab se chhoda<input type="date" data-f="since" data-a="${a.id}" value="${s.since}" max="${todayIso()}"></label>
          <label class="field">${a.unitLabel}<input type="number" min="0" data-f="perDay" data-a="${a.id}" value="${s.perDay ?? ""}"></label>
          ${a.id !== "alcohol" ? `<label class="field">Ek ka daam (₹)<input type="number" min="0" data-f="cost" data-a="${a.id}" value="${s.cost ?? ""}"></label>` : ""}
        </div>
        <ul class="milestones">${a.milestones.map(([dd, txt]) => `<li class="${st.days >= dd ? "done" : ""}"><b>${dd >= 365 ? Math.round(dd / 365) + " saal" : dd + " din"}:</b> ${txt}</li>`).join("")}</ul>
        <div class="row" style="margin-top:10px"><button class="btn small danger" data-relapse="${a.id}">Aaj fir se liya (reset)</button></div>
      </div>`;
    }).join("");
  }

  function relapse(id, date = todayIso()) {
    const s = state.addictions[id];
    if (!s?.on) return;
    s.relapses = s.relapses || [];
    s.relapses.push({ date, streak: Math.max(0, daysBetween(s.since, date)) });
    s.since = date;
  }

  // ---------- Profile ----------
  function renderProfile() {
    const f = $("#profileForm");
    const p = state.profile || {};
    for (const el of f.elements) if (el.name && p[el.name] != null) el.value = p[el.name];
    if (!state.profile) { $("#profileSummary").innerHTML = '<p class="muted small">Profile bharne se aapke liye paani, calories, protein aur vitamin ke target set honge.</p>'; return; }
    const n = dailyNeeds(p);
    $("#profileSummary").innerHTML = `<p class="small" style="margin-top:12px">Aapke roz ke target: <b>${n.kcal} kcal</b>, <b>${n.p} g protein</b>, <b>${(waterTargetMl(p) / 1000).toFixed(1)} L paani</b>, Iron ${n.fe} mg, Calcium ${n.ca} mg, Vitamin D ${n.vd} mcg, B12 ${n.b12} mcg.</p>`;
  }


  // =====================================================================
  //  ADVANCED: streaks, badges, insights, calendar, vitals, meds, custom food
  // =====================================================================
  const logged = (d) => !!d && (d.foods.length > 0 || d.water > 0 || d.walk || !!d.sleep || Object.values(d.vitals || {}).some(Boolean));
  const waterOk = (d) => !!d && d.water * GLASS_ML >= waterTargetMl(profile());
  const PRED = { log: logged, walk: (d) => !!d?.walk, water: waterOk };

  // Aaj abhi poora nahi hua to streak kal se gini jaati hai (aaj ki wajah se tootti nahi)
  function streak(pred) {
    let n = 0, dt = todayIso();
    if (!pred(peekDay(dt))) dt = addDays(dt, -1);
    while (pred(peekDay(dt))) { n++; dt = addDays(dt, -1); }
    return n;
  }
  function bestStreak(pred) {
    const dates = Object.keys(state.days).sort();
    if (!dates.length) return 0;
    let best = 0, cur = 0, dt = dates[0];
    const end = todayIso();
    while (dt <= end) { cur = pred(peekDay(dt)) ? cur + 1 : 0; best = Math.max(best, cur); dt = addDays(dt, 1); }
    return best;
  }

  function renderTodayExtras(d) {
    // streak chips
    const ws = streak(PRED.walk), wa = streak(PRED.water), lg = streak(PRED.log);
    $("#streakChips").innerHTML = [
      lg ? `<span class="chip warm">🔥 ${lg} din se record</span>` : "",
      ws ? `<span class="chip">🚶 ${ws} din walk</span>` : "",
      wa ? `<span class="chip">💧 ${wa} din paani poora</span>` : "",
    ].join("");

    // meds
    const meds = state.meds || [];
    $("#medsCard").style.display = meds.length ? "" : "none";
    $("#medsToday").innerHTML = `<div class="meds">${meds.map((m) => `<label><input type="checkbox" data-med="${m.id}" ${d.meds?.[m.id] ? "checked" : ""}> ${esc(m.name)} <span class="muted small">· ${esc(m.time)}</span></label>`).join("")}</div>`;

    // quick add: haal ke khane + kal ka khana copy
    const recent = [];
    const dates = Object.keys(state.days).sort().reverse();
    for (const dt of dates) {
      for (const it of state.days[dt].foods.slice().reverse()) if (foodById[it.id] && !recent.includes(it.id)) recent.push(it.id);
      if (recent.length >= 8) break;
    }
    const yest = peekDay(addDays(current, -1));
    $("#quickAdd").innerHTML = (recent.length ? `<span class="lbl">Jaldi jodo:</span>` + recent.slice(0, 8).map((id) => `<button class="chip" data-quick="${id}">+ ${esc(foodById[id].name.replace(/\s*\(.*\)/, ""))}</button>`).join("") : "") +
      (yest?.foods.length && !d.foods.length ? `<button class="chip warm" id="copyYest">📋 Kal jaisa khana copy karo (${yest.foods.length})</button>` : "");

    // custom foods list
    const cf = state.customFoods || [];
    $("#customList").innerHTML = cf.length ? `<p class="muted small" style="margin:10px 0 4px">Mere jode hue khane:</p>` + cf.map((f) => `<div class="list-row"><span>${esc(f.name)} <span class="muted small">· ${f.kcal} kcal, ${f.p} g protein</span></span><button data-delcf="${f.id}" title="Hatao">✕</button></div>`).join("") : "";
  }

  function renderBadges() {
    const p = profile(); const needs = dailyNeeds(p);
    const days = Object.values(state.days);
    const loggedCount = days.filter(logged).length;
    const bw = bestStreak(PRED.walk), bwa = bestStreak(PRED.water), bl = bestStreak(PRED.log);
    const topScore = Math.max(0, ...days.filter(logged).map(score));
    const fullNutri = days.some((d) => d.foods.length && NUTRIENTS.every((n) => n.key === "kcal" || totals(d)[n.key] / needs[n.key] >= 0.9));
    const clean = Math.max(0, ...ADDICTIONS.filter((a) => state.addictions[a.id]?.on).map((a) => addictStats(a).days));

    $("#streakStats").innerHTML = [
      [streak(PRED.log), "din se lagataar record"],
      [streak(PRED.walk), `din walk (best ${bw})`],
      [streak(PRED.water), `din paani poora (best ${bwa})`],
      [loggedCount, "kul din record kiye"],
    ].map(([b, t]) => `<div class="stat"><b>${b}</b><span>${t}</span></div>`).join("");

    const B = [
      ["📝", "Shuruaat", "Pehla din record kiya", loggedCount >= 1],
      ["📅", "Hafta poora", "7 din lagataar record", bl >= 7],
      ["🗓️", "Mahina poora", "30 din lagataar record", bl >= 30],
      ["🚶", "Walker", "7 din lagataar walk", bw >= 7],
      ["🏃", "Fit Champion", "30 din lagataar walk", bw >= 30],
      ["💧", "Paani Raja", "7 din paani ka target", bwa >= 7],
      ["🥗", "Poora Poshan", "Ek din sab vitamin 90%+", fullNutri],
      ["💯", "Top Score", "Ek din score 90+", topScore >= 90],
      ["🚭", "Nasha Mukt", "30 din bina nashe", clean >= 30],
      ["🏆", "Saal bhar Mukt", "365 din bina nashe", clean >= 365],
      ["⚖️", "Wazan Watcher", "10 din wazan likha", days.filter((d) => d.weight || d.vitals?.weight).length >= 10],
      ["🩺", "Jaanch Pakki", "10 baar BP/sugar likha", days.filter((d) => d.vitals?.sys || d.vitals?.sugarF || d.vitals?.sugarPP).length >= 10],
    ];
    $("#badges").innerHTML = B.map(([i, n, t, ok]) => `<div class="badge ${ok ? "" : "locked"}" title="${t}"><b>${i}</b>${n}<br><span class="muted">${t}</span></div>`).join("");
  }

  function renderInsights(rows, needs, gTarget) {
    const L = rows.filter((r) => logged(r.d));
    const out = [];
    const label = range === 7 ? "Is hafte" : "Is mahine";
    if (!L.length) { $("#insights").innerHTML = `<p class="empty">${label} abhi koi record nahi. "Aaj" page par entry karo.</p>`; return; }
    const withFood = L.filter((r) => r.d.foods.length);
    if (withFood.length) {
      const avg = NUTRIENTS.filter((n) => n.key !== "kcal").map((n) => ({ n, pct: withFood.reduce((s, r) => s + Math.min(1.5, r.t[n.key] / needs[n.key]), 0) / withFood.length }))
        .sort((a, b) => a.pct - b.pct);
      const low = avg.filter((x) => x.pct < 0.7).slice(0, 3);
      if (low.length) out.push(`⚠️ ${label} sabse kam: ${low.map((x) => `<b>${x.n.label}</b> (avg ${Math.round(x.pct * 100)}%)`).join(", ")}. ${SOURCES[low[0].n.key]}.`);
      else out.push(`✅ ${label} vitamin aur poshan achhe rahe – sab 70% se upar.`);
      const kcal = withFood.reduce((s, r) => s + r.t.kcal, 0) / withFood.length;
      const kp = kcal / needs.kcal;
      out.push(`🔥 Avg calories <b>${Math.round(kcal)}</b> / ${needs.kcal} kcal – ${kp > 1.1 ? "zyada kha rahe ho, portion kam karo." : kp < 0.75 ? "kam kha rahe ho (ya sab entry nahi ki)." : "theek hai."}`);
      const junk = withFood.filter((r) => r.d.foods.some((i) => foodById[i.id]?.junk)).length;
      if (junk) out.push(`🍟 <b>${junk}</b> din junk food khaya. Hafte mein 1 baar se zyada na ho.`);
    } else out.push("🍽️ Khane ki entry nahi hai – khana likhoge to vitamin ki kami pata chalegi.");

    const walkDays = L.filter((r) => r.d.walk).length;
    const walkTarget = range === 7 ? 5 : 20;
    out.push(walkDays >= walkTarget ? `🚶 ${walkDays} din walk – shaandaar!` : `🚶 Sirf <b>${walkDays}</b> din walk ki – target ${walkTarget} din. Subah ka alarm lagao.`);
    const avgW = L.reduce((s, r) => s + r.d.water, 0) / L.length;
    if (avgW < gTarget) out.push(`💧 Roz avg <b>${r1(avgW)}</b> glass paani – ${r1(gTarget - avgW)} glass aur badhao. Har khane se pehle 1 glass piyo.`);
    const sl = L.filter((r) => Number(r.d.sleep));
    if (sl.length) { const a = sl.reduce((s, r) => s + Number(r.d.sleep), 0) / sl.length; out.push(`😴 Avg neend <b>${r1(a)}</b> ghante${a < 7 ? " – kam hai, 7+ ghante so." : " – achhi hai."}`); }
    const ws = rows.map((r) => Number(r.d?.vitals?.weight || r.d?.weight)).filter(Boolean);
    if (ws.length >= 2) { const ch = ws[ws.length - 1] - ws[0]; out.push(`⚖️ Wazan ${ch > 0 ? "badha" : ch < 0 ? "ghata" : "same"}: <b>${ch > 0 ? "+" : ""}${r1(ch)} kg</b> (${ws[0]} → ${ws[ws.length - 1]}).`); }
    const highBp = rows.filter((r) => Number(r.d?.vitals?.sys) >= 140 || Number(r.d?.vitals?.dia) >= 90).length;
    if (highBp) out.push(`❤️ <b>${highBp}</b> baar BP zyada aaya – namak kam karo aur doctor ko dikhao.`);
    const highSugar = rows.filter((r) => Number(r.d?.vitals?.sugarF) >= 126 || Number(r.d?.vitals?.sugarPP) >= 200).length;
    if (highSugar) out.push(`🩸 <b>${highSugar}</b> baar sugar diabetes range mein – doctor se HbA1c test ki salah lo.`);
    const meds = state.meds || [];
    if (meds.length) {
      const possible = L.length * meds.length;
      const taken = L.reduce((s, r) => s + meds.filter((m) => r.d.meds?.[m.id]).length, 0);
      out.push(`💊 Dawai <b>${Math.round((taken / possible) * 100)}%</b> time par li (${taken}/${possible}).`);
    }
    $("#insights").innerHTML = `<ul class="insights">${out.map((x) => `<li>${x}</li>`).join("")}</ul>`;
  }

  function renderCalendar(rows) {
    $("#calCard").style.display = range === 30 ? "" : "none";
    if (range !== 30) return;
    const lead = (parse(rows[0].dt).getDay() + 6) % 7;
    const color = (sc) => (sc == null ? "" : sc >= 70 ? "var(--pri)" : sc >= 40 ? "var(--warn)" : "var(--bad)");
    $("#calendar").innerHTML = ["So", "Ma", "Bu", "Gu", "Sh", "Sa", "Ra"].map((h) => `<div class="h">${h}</div>`).join("") +
      '<div class="c blank"></div>'.repeat(lead) +
      rows.map((r) => {
        const has = logged(r.d);
        return `<div class="c ${has ? "" : "none"} ${r.dt === todayIso() ? "today" : ""}" data-go="${r.dt}" title="${fmt(r.dt)}${has ? " · score " + r.sc : ""}" style="${has ? "background:" + color(r.sc) : ""}">${parse(r.dt).getDate()}</div>`;
      }).join("");
  }

  // ---- Vitals ----
  function bpStatus(s, d) {
    if (!s || !d) return null;
    if (s >= 180 || d >= 120) return ["bad", "🚨 BP bahut zyada – turant doctor se milo!"];
    if (s >= 140 || d >= 90) return ["bad", "BP zyada (High BP stage 2). Doctor ko dikhao, namak kam karo."];
    if (s >= 130 || d >= 80) return ["mid", "BP thoda zyada (Stage 1). Walk, kam namak, tension kam karo."];
    if (s >= 120) return ["mid", "BP normal se thoda upar (Elevated). Dhyan rakho."];
    if (s < 90 || d < 60) return ["mid", "BP kam (Low). Paani aur namak theek se lo, chakkar aaye to doctor ko dikhao."];
    return ["good", "BP normal hai ✅"];
  }
  function sugarStatus(f, pp) {
    const res = [];
    if (f) {
      if (f < 70) res.push(["bad", "Khali pet sugar kam (Low) – turant kuch meetha lo."]);
      else if (f < 100) res.push(["good", "Khali pet sugar normal ✅"]);
      else if (f < 126) res.push(["mid", "Khali pet sugar 100-125 – Pre-diabetes range. Meetha/maida kam, walk badhao."]);
      else res.push(["bad", "Khali pet sugar 126+ – Diabetes range. Doctor se HbA1c test karwao."]);
    }
    if (pp) {
      if (pp < 140) res.push(["good", "Khane ke baad sugar normal ✅"]);
      else if (pp < 200) res.push(["mid", "Khane ke baad sugar 140-199 – Pre-diabetes range."]);
      else res.push(["bad", "Khane ke baad sugar 200+ – Diabetes range. Doctor se milo."]);
    }
    return res;
  }
  function renderVitals() {
    const d = peekDay(current) || blankDay();
    const v = d.vitals || {};
    $("#vSys").value = v.sys || ""; $("#vDia").value = v.dia || ""; $("#vPulse").value = v.pulse || "";
    $("#vSugarF").value = v.sugarF || ""; $("#vSugarPP").value = v.sugarPP || ""; $("#vWeight").value = v.weight || d.weight || "";
    const st = [];
    const bp = bpStatus(Number(v.sys), Number(v.dia)); if (bp) st.push(bp);
    st.push(...sugarStatus(Number(v.sugarF), Number(v.sugarPP)));
    const pu = Number(v.pulse);
    if (pu) st.push(pu < 60 ? ["mid", "Pulse 60 se kam – athletes mein normal, warna doctor se poochho."] : pu > 100 ? ["mid", "Pulse 100 se zyada – aaram karke dobara naapo."] : ["good", "Pulse normal ✅"]);
    const w = Number(v.weight || d.weight), p = profile();
    if (w && p.height) { const bmi = w / Math.pow(p.height / 100, 2); st.push([bmi < 18.5 || bmi >= 25 ? "mid" : "good", `BMI ${r1(bmi)} – ${bmi < 18.5 ? "kam wazan" : bmi < 23 ? "sahi wazan ✅" : bmi < 25 ? "thoda zyada" : bmi < 30 ? "overweight" : "motapa"}`]); }
    $("#vitalStatus").innerHTML = st.length ? `<div class="status">${st.map(([c, t]) => `<div class="${c}">${t}</div>`).join("")}</div>` : "";

    const dates = Array.from({ length: 30 }, (_, i) => addDays(todayIso(), i - 29));
    const get = (k) => dates.map((dt) => { const x = peekDay(dt); const val = k === "weight" ? Number(x?.vitals?.weight || x?.weight) : Number(x?.vitals?.[k]); return val || null; });
    $("#weightChart").innerHTML = lineChart(dates, [{ name: "Wazan kg", color: "var(--pri)", vals: get("weight") }]);
    $("#bpChart").innerHTML = lineChart(dates, [{ name: "Upar (Sys)", color: "#d9534f", vals: get("sys") }, { name: "Neeche (Dia)", color: "#3b8fd9", vals: get("dia") }], [140, 90]);
    $("#sugarChart").innerHTML = lineChart(dates, [{ name: "Khali pet", color: "#8e5bd6", vals: get("sugarF") }, { name: "Khane ke baad", color: "#e8a317", vals: get("sugarPP") }], [126, 200]);
  }

  // Simple SVG line chart
  function lineChart(dates, series, refs = []) {
    const all = series.flatMap((s) => s.vals.filter((v) => v != null));
    if (!all.length) return `<p class="empty">Abhi koi reading nahi. Upar likhoge to graph yahan dikhega.</p>`;
    const W = 320, H = 150, L = 30, R = 8, T = 10, B = 20;
    let min = Math.min(...all), max = Math.max(...all);
    const pad = Math.max(1, (max - min) * 0.15); min = Math.floor(min - pad); max = Math.ceil(max + pad);
    const x = (i) => L + (i / (dates.length - 1)) * (W - L - R);
    const y = (v) => T + (1 - (v - min) / (max - min)) * (H - T - B);
    let g = `<line class="axis" x1="${L}" y1="${H - B}" x2="${W - R}" y2="${H - B}"/>`;
    [min, Math.round((min + max) / 2), max].forEach((v) => (g += `<text x="${L - 4}" y="${y(v) + 3}" text-anchor="end">${v}</text><line class="axis" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" opacity=".4"/>`));
    refs.filter((r) => r >= min && r <= max).forEach((r) => (g += `<line class="ref" x1="${L}" x2="${W - R}" y1="${y(r)}" y2="${y(r)}"/>`));
    [0, 10, 20, 29].forEach((i) => (g += `<text x="${x(i)}" y="${H - 5}" text-anchor="${i === 0 ? "start" : i === 29 ? "end" : "middle"}">${fmt(dates[i])}</text>`));
    series.forEach((s) => {
      const pts = s.vals.map((v, i) => (v == null ? null : [x(i), y(v)])).filter(Boolean);
      if (pts.length > 1) g += `<polyline fill="none" stroke="${s.color}" stroke-width="2" stroke-linejoin="round" points="${pts.map((p) => p.join(",")).join(" ")}"/>`;
      s.vals.forEach((v, i) => { if (v != null) g += `<circle cx="${x(i)}" cy="${y(v)}" r="3" fill="${s.color}"><title>${fmt(dates[i])}: ${v}</title></circle>`; });
    });
    const last = series.map((s) => { const v = s.vals.filter((x) => x != null); return v.length ? `${s.name}: <b>${v[v.length - 1]}</b>` : ""; }).filter(Boolean).join(" · ");
    return `<div class="line-chart"><svg viewBox="0 0 ${W} ${H}" role="img">${g}</svg><div class="key">${series.map((s) => `<span><i style="background:${s.color}"></i>${s.name}</span>`).join("")}${refs.length ? '<span>--- khatre ki seema</span>' : ""}</div><p class="muted small">Aakhri reading – ${last}</p></div>`;
  }

  // ---- Meds (profile) ----
  function renderMedList() {
    const meds = state.meds || [];
    $("#medList").innerHTML = meds.length ? meds.map((m) => `<div class="list-row"><span>💊 ${esc(m.name)} <span class="muted small">· ${esc(m.time)}</span></span><button data-delmed="${m.id}" title="Hatao">✕</button></div>`).join("") : '<p class="muted small">Abhi koi dawai nahi joda.</p>';
  }
  const uid = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  // ---------- Render all ----------
  let activeTab = "today";
  function render() {
    $("#dateNav").style.visibility = activeTab === "today" || activeTab === "vitals" ? "visible" : "hidden";
    $("#datePick").value = current;
    $("#nextDay").disabled = current >= todayIso();
    if (activeTab === "today") renderToday();
    if (activeTab === "vitals") renderVitals();
    if (activeTab === "history") renderHistory();
    if (activeTab === "plan") renderPlan();
    if (activeTab === "addict") renderAddict();
    if (activeTab === "profile") { renderProfile(); renderMedList(); }
  }
  function showTab(name) {
    activeTab = name;
    document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.id === "tab-" + name));
    document.querySelectorAll(".tabs button").forEach((b) => b.classList.toggle("on", b.dataset.tab === name));
    window.scrollTo(0, 0);
    render();
  }
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("show"), 2000);
  }
  const commit = () => { save(); render(); };

  // ---------- Events ----------
  rebuildFoods();
  document.querySelectorAll(".tabs button").forEach((b) => b.addEventListener("click", () => showTab(b.dataset.tab)));
  $("#prevDay").onclick = () => { current = addDays(current, -1); render(); };
  $("#nextDay").onclick = () => { if (current < todayIso()) { current = addDays(current, 1); render(); } };
  $("#datePick").max = todayIso();
  $("#datePick").onchange = (e) => { if (e.target.value) { current = e.target.value > todayIso() ? todayIso() : e.target.value; render(); } };

  $("#waterPlus").onclick = () => { day().water++; commit(); };
  $("#waterMinus").onclick = () => { const d = day(); d.water = Math.max(0, d.water - 1); commit(); };
  $("#walkDone").onchange = (e) => { const d = day(); d.walk = e.target.checked; if (d.walk && !d.walkMin) d.walkMin = 30; commit(); };
  $("#walkMin").onchange = (e) => { const d = day(); d.walkMin = e.target.value; if (Number(e.target.value) > 0) d.walk = true; commit(); };
  [["#hExercise", "exercise"], ["#hSun", "sun"], ["#hNoJunk", "nojunk"], ["#hEarlyDinner", "earlyDinner"]].forEach(([sel, k]) => {
    $(sel).onchange = (e) => { day().habits[k] = e.target.checked; commit(); };
  });
  [["#sleep", "sleep"], ["#weightToday", "weight"], ["#mood", "mood"], ["#notes", "notes"]].forEach(([sel, k]) => {
    $(sel).onchange = (e) => {
      day()[k] = e.target.value;
      if (k === "weight") {
        const d = day(); d.vitals = d.vitals || {}; d.vitals.weight = e.target.value ? Number(e.target.value) : "";
        if (e.target.value && state.profile && current === todayIso()) state.profile.weight = Number(e.target.value);
      }
      commit();
    };
  });

  function addFood() {
    const q = $("#foodInput").value.trim().toLowerCase();
    if (!q) return toast("Khane ka naam likho");
    const n = (x) => x.name.toLowerCase();
    const list = allFoods();
    const f = list.find((x) => n(x) === q) || list.find((x) => n(x).startsWith(q)) || list.find((x) => n(x).includes(q));
    if (!f) return toast("Ye khana list mein nahi mila");
    const qty = Math.max(0.5, Number($("#foodQty").value) || 1);
    pushFood(f, qty);
    $("#foodInput").value = ""; $("#foodQty").value = 1;
  }
  function pushFood(f, qty = 1) {
    day().foods.push({ id: f.id, qty, meal: $("#mealSel").value });
    toast(`${f.name} joda gaya`);
    commit();
  }
  $("#addFood").onclick = addFood;
  $("#foodInput").addEventListener("keydown", (e) => { if (e.key === "Enter") addFood(); });
  $("#mealList").addEventListener("click", (e) => {
    const i = e.target.dataset.del; if (i == null) return;
    day().foods.splice(Number(i), 1); commit();
  });
  $("#addictToday").addEventListener("change", (e) => {
    const id = e.target.dataset.used; if (!id) return;
    const d = day(); d.used = d.used || {};
    d.used[id] = e.target.checked;
    if (e.target.checked) {
      const s = state.addictions[id];
      if (s?.on && current >= s.since) { relapse(id, current); toast("Koi baat nahi, kal se fir shuru! 💪"); }
    }
    commit();
  });

  document.querySelectorAll("#rangeSeg button").forEach((b) => b.addEventListener("click", () => {
    range = Number(b.dataset.r);
    document.querySelectorAll("#rangeSeg button").forEach((x) => x.classList.toggle("on", x === b));
    renderHistory();
  }));
  $("#histTable").addEventListener("click", (e) => {
    const tr = e.target.closest("tr[data-go]"); if (!tr) return;
    current = tr.dataset.go; showTab("today");
  });
  document.querySelectorAll("#dietSeg button").forEach((b) => b.addEventListener("click", () => { dietPref = b.dataset.d; renderPlan(); }));

  $("#addictCards").addEventListener("click", (e) => {
    const t = e.target.dataset;
    if (t.start) { state.addictions[t.start] = { ...(state.addictions[t.start] || {}), on: true, since: state.addictions[t.start]?.since || todayIso() }; commit(); }
    if (t.stop && confirm("Is tracker ko band karein? (Purana data rahega)")) { state.addictions[t.stop].on = false; commit(); }
    if (t.relapse && confirm("Counter aaj se reset karein?")) {
      relapse(t.relapse); const d = day(todayIso()); d.used = d.used || {}; d.used[t.relapse] = true;
      toast("Koi baat nahi, kal se fir shuru! 💪"); commit();
    }
  });
  $("#addictCards").addEventListener("change", (e) => {
    const { a, f } = e.target.dataset; if (!a) return;
    let v = e.target.value;
    if (f === "since" && (!v || v > todayIso())) v = todayIso();
    state.addictions[a][f] = v; commit();
  });

  $("#profileForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const p = Object.fromEntries(fd.entries());
    ["age", "height", "weight"].forEach((k) => (p[k] = Number(p[k])));
    state.profile = p; dietPref = null; save();
    toast("Profile save ho gayi ✅");
    showTab("today");
  });

  $("#exportBtn").onclick = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `sehat-diary-${todayIso()}.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  $("#importFile").onchange = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!data || typeof data.days !== "object") throw new Error("bad");
      state = { ...emptyState(), ...data }; rebuildFoods(); commit(); toast("Backup restore ho gaya ✅");
    } catch (err) { toast("Galat backup file"); }
    e.target.value = "";
  };
  $("#resetBtn").onclick = () => {
    if (confirm("Sach mein saara data delete karna hai? Ye wapas nahi aayega.")) { state = emptyState(); rebuildFoods(); save(); showTab("profile"); }
  };


  // ---- Advanced events ----
  $("#medsToday").addEventListener("change", (e) => {
    const id = e.target.dataset.med; if (!id) return;
    const d = day(); d.meds = d.meds || {}; d.meds[id] = e.target.checked; commit();
  });
  $("#quickAdd").addEventListener("click", (e) => {
    if (e.target.id === "copyYest") {
      const y = peekDay(addDays(current, -1)); if (!y) return;
      day().foods.push(...y.foods.filter((i) => foodById[i.id]).map((i) => ({ ...i })));
      toast("Kal ka khana copy ho gaya"); return commit();
    }
    const id = e.target.dataset.quick; if (id && foodById[id]) pushFood(foodById[id], 1);
  });
  $("#customFoodForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const f = { id: uid("c_"), name: fd.get("name").trim(), cat: "Mera khana" };
    ["kcal", "p", "c", "f", "fib", "va", "vc", "vd", "b12", "fe", "ca"].forEach((k) => (f[k] = Math.max(0, Number(fd.get(k)) || 0)));
    if (fd.get("junk")) f.junk = true;
    if (!f.name) return;
    state.customFoods = state.customFoods || []; state.customFoods.push(f);
    rebuildFoods(); e.target.reset();
    pushFood(f, 1);
  });
  $("#customList").addEventListener("click", (e) => {
    const id = e.target.dataset.delcf; if (!id) return;
    if (!confirm("Ye khana list se hatana hai? (Purane din ki entry mein bhi nahi dikhega)")) return;
    state.customFoods = state.customFoods.filter((f) => f.id !== id); rebuildFoods(); commit();
  });
  $("#medForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const name = fd.get("name").trim(); if (!name) return;
    state.meds = state.meds || []; state.meds.push({ id: uid("m_"), name, time: fd.get("time") });
    e.target.reset(); toast("Dawai jodi gayi"); commit();
  });
  $("#medList").addEventListener("click", (e) => {
    const id = e.target.dataset.delmed; if (!id) return;
    state.meds = state.meds.filter((m) => m.id !== id); commit();
  });
  [["#vSys", "sys"], ["#vDia", "dia"], ["#vPulse", "pulse"], ["#vSugarF", "sugarF"], ["#vSugarPP", "sugarPP"], ["#vWeight", "weight"]].forEach(([sel, k]) => {
    $(sel).addEventListener("change", (e) => {
      const d = day(); d.vitals = d.vitals || {};
      d.vitals[k] = e.target.value ? Number(e.target.value) : "";
      if (k === "weight") { d.weight = e.target.value; if (e.target.value && state.profile && current === todayIso()) state.profile.weight = Number(e.target.value); }
      commit();
    });
  });
  $("#calendar").addEventListener("click", (e) => {
    const c = e.target.closest("[data-go]"); if (!c) return;
    current = c.dataset.go; showTab("today");
  });

  // Offline / install (PWA) – sirf normal website par, iframe mein nahi
  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol) && window.self === window.top) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }

  // Start
  if (!state.profile) showTab("profile"); else render();
})();
