(() => {
  "use strict";
  const KEY = "sehatDiary.v1";
  const $ = (s) => document.querySelector(s);
  const GLASS_ML = 250;
  const MEALS = { morning: "Subah / Nashta", lunch: "Dopahar", snack: "Shaam / Snacks", dinner: "Raat" };
  const foodById = Object.fromEntries(FOODS.map((f) => [f.id, f]));

  // ---------- Storage ----------
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      if (s && typeof s === "object") return { profile: null, days: {}, addictions: {}, ...s };
    } catch (e) { /* ignore */ }
    return { profile: null, days: {}, addictions: {} };
  }
  let state = load();
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

  const blankDay = () => ({ foods: [], water: 0, walk: false, walkMin: "", habits: {}, sleep: "", weight: "", mood: "", notes: "", used: {} });
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
        const items = d.foods.map((it, idx) => ({ ...it, idx })).filter((it) => it.meal === m);
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

  // ---------- Render all ----------
  let activeTab = "today";
  function render() {
    $("#dateNav").style.visibility = activeTab === "today" ? "visible" : "hidden";
    if (activeTab === "today") renderToday();
    if (activeTab === "history") renderHistory();
    if (activeTab === "plan") renderPlan();
    if (activeTab === "addict") renderAddict();
    if (activeTab === "profile") renderProfile();
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
  $("#foodList").innerHTML = FOODS.map((f) => `<option value="${esc(f.name)}">${f.cat}</option>`).join("");
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
      if (k === "weight" && e.target.value && state.profile && current === todayIso()) state.profile.weight = Number(e.target.value);
      commit();
    };
  });

  function addFood() {
    const q = $("#foodInput").value.trim().toLowerCase();
    if (!q) return toast("Khane ka naam likho");
    const n = (x) => x.name.toLowerCase();
    const f = FOODS.find((x) => n(x) === q) || FOODS.find((x) => n(x).startsWith(q)) || FOODS.find((x) => n(x).includes(q));
    if (!f) return toast("Ye khana list mein nahi mila");
    const qty = Math.max(0.5, Number($("#foodQty").value) || 1);
    day().foods.push({ id: f.id, qty, meal: $("#mealSel").value });
    $("#foodInput").value = ""; $("#foodQty").value = 1;
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
      state = { profile: null, days: {}, addictions: {}, ...data }; commit(); toast("Backup restore ho gaya ✅");
    } catch (err) { toast("Galat backup file"); }
    e.target.value = "";
  };
  $("#resetBtn").onclick = () => {
    if (confirm("Sach mein saara data delete karna hai? Ye wapas nahi aayega.")) { state = { profile: null, days: {}, addictions: {} }; save(); showTab("profile"); }
  };

  // Start
  if (!state.profile) showTab("profile"); else render();
})();
