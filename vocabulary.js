(() => {
  const data = window.VOCABULARY_DATA;
  const $ = (id) => document.getElementById(id);
  const state = { list: "extra", shown: 90, current: null };
  const key = "family-album-vocabulary-known-v1";
  let known;
  try { known = new Set(JSON.parse(localStorage.getItem(key) || "[]")); }
  catch { known = new Set(); }
  const idOf = (item) => `${state.list}:${item.word}`;
  const metaOf = (item) => state.list === "extra"
    ? `${item.section} · 出现 ${item.count} 次`
    : `${item.level} · 牛津3000未覆盖`;

  function saveKnown() {
    try { localStorage.setItem(key, JSON.stringify([...known])); } catch { /* Private mode may block storage. */ }
  }
  function speak(word) {
    if (!("speechSynthesis" in window)) { alert("当前浏览器不支持语音朗读。"); return; }
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    utterance.rate = 0.85;
    speechSynthesis.speak(utterance);
  }
  function filtered() {
    const query = $("wordSearch").value.trim().toLowerCase();
    const category = $("wordFilter").value;
    const hide = $("hideKnown").checked;
    return data[state.list].filter((item) =>
      item.word.toLowerCase().includes(query)
      && (category === "all" || (state.list === "extra" ? item.section : item.level) === category)
      && (!hide || !known.has(idOf(item)))
    );
  }
  function render() {
    const items = filtered();
    const list = $("wordList");
    list.replaceChildren();
    if (!items.length) {
      const empty = document.createElement("li");
      empty.className = "empty";
      empty.textContent = "没有符合条件的单词。";
      list.append(empty);
    }
    for (const item of items.slice(0, state.shown)) {
      const li = document.createElement("li");
      li.className = "word-item" + (known.has(idOf(item)) ? " is-known" : "");
      const label = document.createElement("span");
      label.className = "word-text";
      const word = document.createElement("strong");
      word.textContent = item.word;
      const meta = document.createElement("small");
      meta.textContent = metaOf(item);
      label.append(word, meta);
      const play = document.createElement("button");
      play.type = "button";
      play.textContent = "▶";
      play.title = `朗读 ${item.word}`;
      play.setAttribute("aria-label", `朗读 ${item.word}`);
      play.addEventListener("click", () => speak(item.word));
      const mark = document.createElement("button");
      mark.type = "button";
      mark.textContent = known.has(idOf(item)) ? "✓" : "○";
      mark.title = known.has(idOf(item)) ? "取消已掌握" : "标记已掌握";
      mark.setAttribute("aria-label", `${mark.title}：${item.word}`);
      mark.addEventListener("click", () => { toggleKnown(item); render(); });
      li.append(label, play, mark);
      list.append(li);
    }
    $("resultCount").textContent = `筛选结果 ${items.length} 词 · 已显示 ${Math.min(items.length, state.shown)}`;
    $("learnedCount").textContent = `本词表已掌握 ${data[state.list].filter((item) => known.has(idOf(item))).length} / ${data[state.list].length}`;
    $("loadMore").hidden = items.length <= state.shown;
  }
  function toggleKnown(item) {
    const id = idOf(item);
    if (known.has(id)) known.delete(id); else known.add(id);
    saveKnown();
    if (state.current === item) updateStudy();
  }
  function updateStudy() {
    const item = state.current;
    $("studyCard").hidden = !item;
    if (!item) return;
    $("studyWord").textContent = item.word;
    $("studyMeta").textContent = metaOf(item);
    $("studyKnown").textContent = known.has(idOf(item)) ? "取消已掌握" : "标记已掌握";
  }
  function randomWord() {
    const candidates = filtered();
    if (!candidates.length) { state.current = null; updateStudy(); return; }
    state.current = candidates[Math.floor(Math.random() * candidates.length)];
    updateStudy();
    $("studyCard").scrollIntoView({ behavior: "smooth", block: "center" });
  }
  function switchList(list) {
    state.list = list;
    state.shown = 90;
    state.current = null;
    $("wordSearch").value = "";
    $("hideKnown").checked = false;
    $("wordFilter").replaceChildren(new Option("全部类别", "all"));
    const categories = list === "extra" ? ["实词", "语气词"] : ["A1", "A2", "B1", "B2", "其他"];
    for (const category of categories) $("wordFilter").add(new Option(category, category));
    $("listIntro").textContent = list === "extra"
      ? "剧中出现，但不在牛津3000词表内：514 个实词词形、16 个口语语气词。数字表示剧中出现次数。"
      : "属于牛津3000、但《走遍美国》全26集未覆盖的 1572 个词；按 CEFR 等级分组。可作为看完全剧后的补学清单。";
    for (const tab of document.querySelectorAll('[role="tab"]')) tab.setAttribute("aria-selected", String(tab.dataset.list === list));
    $("panel-list").setAttribute("aria-labelledby", list === "extra" ? "tab-extra" : "tab-missing");
    updateStudy();
    render();
  }
  for (const tab of document.querySelectorAll('[role="tab"]')) tab.addEventListener("click", () => switchList(tab.dataset.list));
  for (const id of ["wordSearch", "wordFilter", "hideKnown"]) $(id).addEventListener(id === "wordSearch" ? "input" : "change", () => { state.shown = 90; state.current = null; updateStudy(); render(); });
  $("loadMore").addEventListener("click", () => { state.shown += 90; render(); });
  $("randomWord").addEventListener("click", randomWord);
  $("studyNext").addEventListener("click", randomWord);
  $("studySpeak").addEventListener("click", () => state.current && speak(state.current.word));
  $("studyKnown").addEventListener("click", () => { if (state.current) { toggleKnown(state.current); render(); } });
  let theme = "light";
  try { theme = localStorage.getItem("fau-theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"); } catch { /* Use light theme. */ }
  document.documentElement.dataset.theme = theme;
  $("themeToggle").addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("fau-theme", next); } catch { /* Keep current session theme. */ }
  });
  switchList("extra");
})();

