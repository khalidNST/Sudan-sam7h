// تحدّي السودان — منطق اللعبة (لاعب واحد)
// كل المحتوى في data/questions.json — ما تحتاج تعدّل هذا الملف عشان تضيف أسئلة.

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = a => a[Math.floor(Math.random() * a.length)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- الإعدادات الثابتة ---------- */
const LEVELS = {
  easy: { opts: 3, label: 'سهل' },
  medium: { opts: 4, label: 'وسط' },
  hard: { opts: 4, label: 'صعب', hintChance: 0.4 },
};
const HEARTS = 2;
const POINTS = 10, STREAK_EVERY = 3, STREAK_BONUS = 15;
const QUICK_COUNT = 10;
const RIGHT = ['زط!', 'دي درعة!'];
const WRONG = ['سجم رمادك!', 'يحليلك والله'];
const AVATARS = [
  { icon: 'jebena', color: '#2F7FBF' }, { icon: 'zeer', color: '#C4553A' }, { icon: 'oud', color: '#2E8A57' },
  { icon: 'mabkhar', color: '#C98E1B' }, { icon: 'angareeb', color: '#7A4E9C' }, { icon: 'headphones', color: '#1E2B4A' },
];
const STORE = 'sudan-challenge:';

/* ---------- الأيقونات (رسم خطي بسيط) ---------- */
const ICONS = {
  oud: '<path d="M14 50c-6-6-6-18 4-26s22-6 26 2-2 22-14 28c-6 3-12 2-16-4z"/><path d="M40 24 54 10M50 6l8 8"/><circle cx="26" cy="38" r="4"/>',
  mic: '<rect x="24" y="6" width="16" height="26" rx="8"/><path d="M16 26c0 9 7 16 16 16s16-7 16-16M32 42v12M24 56h16"/>',
  headphones: '<path d="M12 40v-6a20 20 0 0 1 40 0v6"/><rect x="8" y="38" width="10" height="16" rx="4"/><rect x="46" y="38" width="10" height="16" rx="4"/>',
  phone: '<rect x="18" y="6" width="28" height="52" rx="6"/><path d="M28 50h8M28 21l11 7-11 7z"/>',
  jebena: '<path d="M26 8h12M29 8v13c-8 3-15 10-15 19 0 9 8 16 18 16s18-7 18-16c0-9-7-16-15-19V8"/><path d="M15 36c-5-2-8-6-9-11"/><path d="M45 24c8 0 10 12 3 16"/>',
  zeer: '<path d="M22 8h20M24 8c-8 6-12 14-12 22 0 10 9 18 20 18s20-8 20-18c0-8-4-16-12-22"/><path d="M20 47l-5 9M44 47l5 9M12 56h40"/>',
  angareeb: '<path d="M6 24h52v10H6zM10 34v18M54 34v18M6 24v-6M58 24v-6"/><path d="M12 26l6 6 6-6 6 6 6-6 6 6 6-6 6 6"/>',
  mabkhar: '<path d="M18 30h28l-5 14H23zM28 44v7h8v-7M21 52h22"/><path d="M30 25c-4-4 4-8 0-13M37 24c-3-3 3-6 0-10"/>',
  chat: '<path d="M10 12h44v30H30l-12 10V42h-8z"/><path d="M20 24h24M20 31h14"/>',
  book: '<path d="M8 14c8-3 16-2 24 3 8-5 16-6 24-3v38c-8-3-16-2-24 3-8-5-16-6-24-3z"/><path d="M32 17v38"/>',
  heart: '<path fill="currentColor" stroke="none" d="M32 56S6 41 6 23a13 13 0 0 1 26-5 13 13 0 0 1 26 5c0 18-26 33-26 33z"/>',
  sound: '<path d="M10 24h10l14-12v40L20 40H10z"/><path d="M42 22c4 5 4 15 0 20M48 16c8 9 8 23 0 32"/>',
  mute: '<path d="M10 24h10l14-12v40L20 40H10z"/><path d="M44 24l14 16M58 24 44 40"/>',
  pause: '<rect x="18" y="14" width="9" height="36" rx="2"/><rect x="37" y="14" width="9" height="36" rx="2"/>',
  home: '<path d="M8 30 32 10l24 20M14 26v28h36V26"/><path d="M26 54V40h12v14"/>',
  half: '<circle cx="32" cy="32" r="24"/><path fill="currentColor" d="M32 8a24 24 0 0 1 0 48z"/>',
  bolt: '<path d="M36 6 14 36h16l-4 22 24-32H34z"/>',
};
document.body.insertAdjacentHTML('afterbegin', `<svg width="0" height="0" style="position:absolute" aria-hidden="true">${Object.entries(ICONS).map(([k, v]) =>
  `<symbol id="i-${k}" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">${v}</symbol>`).join('')}</svg>`);
const icon = (name, cls = 'ic') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;

/* ---------- التخزين في المتصفح ---------- */
const store = {
  get(k, d) { try { const v = localStorage.getItem(STORE + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(STORE + k, JSON.stringify(v)); } catch { /* تخزين غير متاح */ } },
};

/* ---------- الصوت (مولّد بدون ملفات) ---------- */
const sound = {
  ctx: null,
  get on() { return settings.sound; },
  tone(f, d, v = .08, type = 'sine', delay = 0) {
    if (!this.on) return;
    try {
      this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)();
      const t = this.ctx.currentTime + delay, o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + d);
      o.connect(g).connect(this.ctx.destination); o.start(t); o.stop(t + d + .02);
    } catch { /* المتصفح ما يدعم الصوت */ }
  },
  // إيقاع خفيف شبه الدلوكة
  right() { this.tone(110, .22, .28); this.tone(220, .1, .14, 'triangle', .15); this.tone(110, .22, .28, 'sine', .3); this.tone(165, .12, .12, 'triangle', .42); },
  wrong() { this.tone(196, .25, .1, 'sawtooth'); this.tone(147, .35, .1, 'sawtooth', .18); },
  fanfare() { [523, 659, 784, 1046].forEach((f, i) => this.tone(f, .3, .1, 'triangle', i * .14)); },
};

/* ---------- الحالة ---------- */
const DEFAULTS = { name: '', avatar: 0, level: 'medium', sections: null, length: '10', sound: true };
let settings = { ...DEFAULTS, ...store.get('settings', {}) };
let data = null;
let game = null;

/* ---------- الشاشات ---------- */
function show(name) {
  $$('[data-screen]').forEach(s => { s.hidden = s.dataset.screen !== name; });
  window.scrollTo(0, 0);
  const s = $(`[data-screen="${name}"]`);
  const f = $('h1, h2', s);
  if (f) { f.setAttribute('tabindex', '-1'); f.focus({ preventScroll: true }); }
}
const sectionById = id => data.sections.find(s => s.id === id);
const countIn = id => data.questions.filter(q => q.section === id).length;

/* ---------- 1. البداية ---------- */
function renderHome() {
  $('[data-sec-strip]').innerHTML = data.sections.map((s, i) =>
    `<li>${icon(s.icon, `ic c${i % 4}`)}<span>${esc(s.title)}<small>${countIn(s.id)} سؤال</small></span></li>`).join('');
  const best = store.get('records', [])[0];
  const b = $('[data-best]');
  b.hidden = !best;
  if (best) b.innerHTML = `🏆 أفضل نتيجة: <b>${best.score}</b> نقطة · ${esc(best.name)}`;
}

/* ---------- 2. الإعداد ---------- */
function renderSetup() {
  const f = $('[data-setup]');
  f.name.value = settings.name;
  $('[data-avatars]').innerHTML = AVATARS.map((a, i) =>
    `<button type="button" role="radio" aria-checked="${i === settings.avatar}" aria-label="أيقونة ${i + 1}" data-av="${i}" style="background:${a.color}">${icon(a.icon)}</button>`).join('');
  f.querySelector(`[name="level"][value="${settings.level}"]`).checked = true;
  f.querySelector(`[name="length"][value="${settings.length}"]`).checked = true;
  const chosen = settings.sections || data.sections.map(s => s.id);
  $('[data-sec-pick]').innerHTML = data.sections.map((s, i) =>
    `<label><input type="checkbox" name="sec" value="${s.id}" ${chosen.includes(s.id) ? 'checked' : ''}><span>${icon(s.icon, `ic c${i % 4}`)}<span>${esc(s.title)}<small>${countIn(s.id)} سؤال</small></span></span></label>`).join('');
  f.sound.checked = settings.sound;
  $('[data-form-err]').hidden = true;
}
$('[data-avatars]').addEventListener('click', e => {
  const b = e.target.closest('[data-av]'); if (!b) return;
  settings.avatar = +b.dataset.av;
  $$('[data-av]').forEach(x => x.setAttribute('aria-checked', x === b));
});
$('[data-avatars]').addEventListener('keydown', e => {
  if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
  const n = AVATARS.length, d = e.key === 'ArrowLeft' ? 1 : -1; // RTL: اليسار = التالي
  settings.avatar = (settings.avatar + d + n) % n;
  $$('[data-av]').forEach((x, i) => x.setAttribute('aria-checked', i === settings.avatar));
  $(`[data-av="${settings.avatar}"]`).focus();
});
$('[data-setup]').addEventListener('submit', e => {
  e.preventDefault();
  const f = e.target;
  const sections = $$('[name="sec"]:checked', f).map(i => i.value);
  const err = $('[data-form-err]');
  if (!sections.length) { err.textContent = 'اختر قسم واحد على الأقل.'; err.hidden = false; return; }
  settings = { ...settings, name: f.name.value.trim() || 'لاعب', level: f.level.value, length: f.length.value, sections, sound: f.sound.checked };
  store.set('settings', settings);
  startGame(false);
});

/* ---------- بناء الجولة ---------- */
const RANK = { easy: 0, medium: 1, hard: 2 };
const ALLOWED = { easy: ['easy'], medium: ['easy', 'medium'], hard: ['easy', 'medium', 'hard'] };
// يختار أسئلة تناسب المستوى، ولو ما كفّت يكمّل من الأصعب منها
function poolFor(questions, level, target) {
  const allowed = ALLOWED[level];
  let pool = shuffle(questions.filter(q => allowed.includes(q.difficulty)));
  if (pool.length < target) {
    const rest = shuffle(questions.filter(q => !pool.includes(q))).sort((a, b) => RANK[a.difficulty] - RANK[b.difficulty]);
    pool = pool.concat(rest.slice(0, target - pool.length));
  }
  return shuffle(pool).slice(0, target);
}
function startGame(quick) {
  const level = settings.level;
  let stages;
  if (quick) {
    stages = [{ id: 'quick', title: 'جولة سريعة', subtitle: 'أسئلة عشوائية من كل الأقسام', icon: 'bolt', questions: poolFor(data.questions, level, QUICK_COUNT) }];
  } else {
    let ids = (settings.sections || data.sections.map(s => s.id)).filter(sectionById);
    if (!ids.length) ids = data.sections.map(s => s.id);
    if (level === 'hard') ids = shuffle(ids);
    stages = ids.map(id => {
      const s = sectionById(id), qs = data.questions.filter(q => q.section === id);
      // «كل الأسئلة» = كل أسئلة المستوى (وعلى الأقل 5)؛ غير كذا العدد المختار
      const target = settings.length === 'all'
        ? Math.max(Math.min(5, qs.length), qs.filter(q => ALLOWED[level].includes(q.difficulty)).length)
        : Math.min(+settings.length, qs.length);
      return { ...s, questions: poolFor(qs, level, target) };
    }).filter(s => s.questions.length);
  }
  game = { quick, level, stages, si: 0, qi: 0, hearts: HEARTS, score: 0, streak: 0, bestStreak: 0, fiftyUsed: false, right: 0, wrong: 0, out: false };
  renderMe();
  showIntro();
}

/* ---------- 3. عنوان القسم ---------- */
function showIntro() {
  const st = game.stages[game.si];
  st.stats = { right: 0, wrong: 0, pts: 0 };
  game.qi = 0;
  $('[data-intro-step]').textContent = game.quick ? `مستوى ${LEVELS[game.level].label}` : `المرحلة ${game.si + 1} من ${game.stages.length}`;
  $('[data-intro-icon]').setAttribute('href', `#i-${st.icon}`);
  $('[data-intro-title]').textContent = st.title;
  $('[data-intro-sub]').textContent = st.subtitle || '';
  $('[data-intro-count]').textContent = `${st.questions.length} ${st.questions.length > 10 ? 'سؤال' : 'أسئلة'}`;
  show('intro');
  $('[data-action="begin-section"]').focus({ preventScroll: true });
}

/* ---------- 4. السؤال ---------- */
function renderMe() {
  const a = AVATARS[settings.avatar] || AVATARS[0];
  const av = $('[data-me-av]');
  av.style.background = a.color; av.innerHTML = icon(a.icon);
  $('[data-me-name]').textContent = settings.name || 'لاعب';
  renderHearts(); renderScore();
  const t = $('[data-action="mute"]');
  t.setAttribute('aria-pressed', !settings.sound);
  t.setAttribute('aria-label', settings.sound ? 'كتم الصوت' : 'تشغيل الصوت');
  $('use', t).setAttribute('href', settings.sound ? '#i-sound' : '#i-mute');
}
function renderHearts(popIdx = -1) {
  const h = $('[data-hearts]');
  h.innerHTML = Array.from({ length: HEARTS }, (_, i) => `<svg class="ic${i >= game.hearts ? ' lost' : ''}${i === popIdx ? ' pop' : ''}" aria-hidden="true"><use href="#i-heart"/></svg>`).join('');
  h.setAttribute('aria-label', `القلوب: ${game.hearts} من ${HEARTS}`);
}
function renderScore(bump) {
  const s = $('[data-score]');
  s.textContent = game.score;
  if (bump) { s.classList.remove('bump'); void s.offsetWidth; s.classList.add('bump'); }
  const k = $('[data-streak]');
  k.hidden = game.streak < 2;
  k.textContent = `🔥 ${game.streak}`;
}

function showQuestion() {
  const st = game.stages[game.si], q = st.questions[game.qi], lv = LEVELS[game.level];
  game.current = q;
  game.answered = false;
  // الشريط والعدّاد
  $('[data-sec-name]').textContent = st.title;
  $('[data-q-count]').textContent = `${game.qi + 1} / ${st.questions.length}`;
  const bar = $('[data-bar]');
  bar.setAttribute('aria-valuenow', game.qi + 1); bar.setAttribute('aria-valuemax', st.questions.length);
  $('i', bar).style.width = `${(game.qi / st.questions.length) * 100}%`;
  // الوسيط: صورة، كلمة، أو تلميح
  const pic = $('[data-pic]'), img = $('[data-q-img]'), tile = $('[data-word]');
  const useHint = q.type === 'image' && q.hint && lv.hintChance && Math.random() < lv.hintChance;
  pic.classList.toggle('contain', q.section === 'home' && q.type === 'image' && !/^trend/.test(q.id));
  if (q.type === 'image' && !useHint) {
    img.hidden = false; tile.hidden = true;
    img.src = q.image; img.alt = 'صورة السؤال';
  } else {
    img.hidden = true; tile.hidden = false; img.removeAttribute('src');
    tile.classList.toggle('hint', !!useHint || q.type === 'text');
    if (q.type === 'word') tile.innerHTML = `<span class="lbl">${icon('chat')}</span><span class="w">${esc(q.word)}</span>`;
    else if (useHint) tile.innerHTML = `${icon('bolt')}<span class="lbl">تلميح</span><p class="hint-text">${esc(q.hint)}</p>`;
    else tile.innerHTML = `${icon(sectionById(q.section)?.icon || 'book')}<span class="lbl">${esc(q.group || '')}</span>`;
  }
  const secTitle = sectionById(q.section)?.title || '';
  $('[data-q-group]').textContent = game.quick
    ? [secTitle, q.group].filter((v, i, a) => v && a.indexOf(v) === i).join(' · ')
    : (q.group && q.group !== st.title ? q.group : '');
  let prompt = q.prompt;
  if (q.type === 'word') prompt = `وش معنى كلمة «${q.word}»؟`;
  else if (useHint && q.section === 'home') prompt = q.group === 'الترندات' ? 'وش اسم الترند؟' : 'وش اسم هذا الغرض؟';
  $('[data-q-text]').textContent = prompt;
  // الخيارات
  const opts = shuffle([q.answer, ...shuffle(q.distractors).slice(0, lv.opts - 1)]);
  $('[data-opts]').innerHTML = opts.map((o, i) =>
    `<button class="opt" data-opt="${esc(o)}"${o === q.answer ? ' data-correct' : ''}><span class="k">${i + 1}</span><span class="t">${esc(o)}</span><span class="mark" aria-hidden="true"></span></button>`).join('');
  const fb = $('[data-feedback]'); fb.textContent = ''; fb.className = 'feedback';
  $('[data-action="fifty"]').disabled = game.fiftyUsed;
  show('play');
  $('[data-q-text]').focus({ preventScroll: true });
}

/* ---------- الإجابة ---------- */
function answer(btn) {
  if (game.answered) return;
  game.answered = true;
  const q = game.current, st = game.stages[game.si];
  const ok = btn.hasAttribute('data-correct');
  $$('.opt').forEach(b => {
    b.disabled = true;
    if (b.hasAttribute('data-correct')) b.classList.add('is-correct');
    else if (b !== btn) b.classList.add('is-dim');
  });
  const fb = $('[data-feedback]');
  let gained = 0, streakBonus = 0;
  if (ok) {
    gained = POINTS;
    game.streak++; game.bestStreak = Math.max(game.bestStreak, game.streak);
    if (game.streak % STREAK_EVERY === 0) streakBonus = STREAK_BONUS;
    game.score += gained + streakBonus;
    game.right++; st.stats.right++; st.stats.pts += gained + streakBonus;
    fb.textContent = pick(RIGHT); fb.className = 'feedback right';
    sound.right();
  } else {
    btn.classList.add('is-wrong');
    game.streak = 0; game.hearts--; game.wrong++; st.stats.wrong++;
    fb.textContent = pick(WRONG); fb.className = 'feedback wrong';
    sound.wrong();
    renderHearts(game.hearts);
    if (navigator.vibrate) try { navigator.vibrate(120); } catch { /* */ }
  }
  renderScore(ok);
  setTimeout(() => openCard(q, ok, gained, streakBonus), 900);
}

/* ---------- بطاقة التعريف ---------- */
function openCard(q, ok, gained, streakBonus) {
  const res = $('[data-res]');
  res.className = `res ${ok ? '' : 'wrong'}`;
  res.dataset.mark = ok ? '✓' : '✗';
  res.textContent = ok ? `${$('[data-feedback]').textContent} جوابك صح` : `جوابك غلط، الصح: ${q.answer}`;
  const media = $('[data-card-media]');
  media.className = 'card-media' + (q.section === 'home' && q.type === 'image' && !/^trend/.test(q.id) ? ' contain' : '');
  media.innerHTML = q.type === 'image' ? `<img src="${esc(q.image)}" alt="">` : `<div class="mini">${icon(q.type === 'word' ? 'chat' : (sectionById(q.section)?.icon || 'book'))}</div>`;
  $('[data-card-title]').textContent = q.type === 'word' ? `«${q.word}»` : (q.title || q.answer);
  const nick = [q.nickname && esc(q.nickname), q.nicknameEn && `<bdi>${esc(q.nicknameEn)}</bdi>`].filter(Boolean).join(' · ');
  $('[data-card-nick]').innerHTML = q.type === 'word' ? 'من كلمات اللهجة السودانية' : nick;
  const bio = $('[data-card-bio]');
  bio.textContent = q.type === 'word' ? `معناها: ${q.answer}` : (q.bio || '');
  bio.classList.remove('open');
  const parts = [];
  if (gained) parts.push(`+${gained} نقطة`);
  if (streakBonus) parts.push(`🔥 سلسلة ${game.streak} صح: +${streakBonus}`);
  if (!ok) parts.push(game.hearts > 0 ? `باقي لك ${game.hearts === 1 ? 'قلب واحد ❤️' : `${game.hearts} قلوب`}` : 'خلصت قلوبك 💔');
  $('[data-card-bonus]').textContent = parts.join(' · ');
  const more = $('[data-action="more"]');
  const next = $('[data-action="next"]');
  next.textContent = game.hearts <= 0 ? 'شوف نتيجتك ←' : 'التالي ←';
  $('[data-card]').hidden = false;
  more.hidden = true;
  // على الجوال التعريف مختصر في 3 أسطر، وزر «اقرأ المزيد» يفتحه كامل
  if (!matchMedia('(min-width: 768px)').matches) requestAnimationFrame(() => { more.hidden = bio.scrollHeight <= bio.clientHeight + 2; });
  next.focus({ preventScroll: true });
}
function next() {
  $('[data-card]').hidden = true;
  if (game.hearts <= 0) { game.out = true; return finish(); }
  const st = game.stages[game.si];
  game.qi++;
  if (game.qi < st.questions.length) showQuestion();
  else showSummary();
}

/* ---------- 5. ملخص المرحلة ---------- */
function showSummary() {
  const st = game.stages[game.si], s = st.stats, last = game.si >= game.stages.length - 1;
  if (game.quick || (last && game.stages.length === 1)) return finish();
  $('[data-sum-icon]').setAttribute('href', `#i-${st.icon}`);
  $('[data-sum-title]').textContent = `خلّصت «${st.title}»`;
  $('[data-sum-right]').textContent = s.right;
  $('[data-sum-wrong]').textContent = s.wrong;
  $('[data-sum-pts]').textContent = s.pts;
  const ratio = s.right / Math.max(1, s.right + s.wrong);
  $('[data-sum-msg]').textContent = ratio >= .8 ? 'دي درعة! 🔥' : ratio >= .5 ? 'زط! كمّل كدا' : 'ما مشكلة، القسم الجاي أسهل 😄';
  const b = $('[data-action="after-summary"]');
  b.textContent = last ? 'شوف النتيجة النهائية ←' : `القسم التالي: ${game.stages[game.si + 1].title} ←`;
  show('summary');
  b.focus({ preventScroll: true });
}
function afterSummary() {
  if (game.si < game.stages.length - 1) { game.si++; showIntro(); }
  else finish();
}

/* ---------- 6. النهاية ---------- */
function finish() {
  const total = game.right + game.wrong, ratio = game.right / Math.max(1, total);
  $('[data-final-kicker]').textContent = game.out ? 'خلصت قلوبك 💔 بس لعبت سمح!' : (game.quick ? 'خلّصت الجولة السريعة' : 'خلّصت كل المراحل');
  $('[data-final-title]').textContent = game.out ? 'يحليلك… المرة الجاية تكسر الرقم!' : ratio >= .8 ? 'دي درعة! 🏆' : ratio >= .5 ? 'زط! أداء سمح' : 'سجم رمادك! جرّب تاني 😄';
  $('[data-final-score]').textContent = game.score;
  $('[data-final-right]').textContent = game.right;
  $('[data-final-wrong]').textContent = game.wrong;
  $('[data-final-streak]').textContent = game.bestStreak;
  // سجل أفضل النتائج
  const rec = { name: settings.name || 'لاعب', score: game.score, level: game.level, at: Date.now() };
  const records = [...store.get('records', []), rec].sort((a, b) => b.score - a.score || a.at - b.at).slice(0, 10);
  store.set('records', records);
  const isBest = records[0].at === rec.at && game.score > 0;
  $('[data-podium]').innerHTML = records.slice(0, 5).map(r =>
    `<li class="${r.at === rec.at ? 'me-row' : ''}"><span>${esc(r.name)} <small>· ${LEVELS[r.level]?.label || ''}</small></span><span class="pt">${r.score}</span></li>`).join('');
  show('final');
  if (isBest || ratio >= .5) { confetti(); sound.fanfare(); }
}

/* ---------- كونفيتي بألوان سودانية ---------- */
function confetti() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = $('[data-confetti]'), x = c.getContext('2d');
  const W = c.width = innerWidth * devicePixelRatio, H = c.height = innerHeight * devicePixelRatio;
  const colors = ['#D21034', '#FFFFFF', '#111111', '#007A3D', '#F2B33A', '#2F7FBF'];
  const dpr = devicePixelRatio;
  const P = Array.from({ length: 170 }, () => ({
    x: Math.random() * W, y: -Math.random() * H * .6, w: (6 + Math.random() * 8) * dpr, h: (10 + Math.random() * 10) * dpr,
    vy: 2 + Math.random() * 4, vx: -1.5 + Math.random() * 3, r: Math.random() * 6, vr: -.15 + Math.random() * .3, c: pick(colors),
  }));
  const end = performance.now() + 4200;
  (function frame(t) {
    x.clearRect(0, 0, W, H);
    P.forEach(p => { p.x += p.vx; p.y += p.vy * devicePixelRatio; p.r += p.vr; x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c; x.strokeStyle = '#0002'; x.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); x.strokeRect(-p.w / 2, -p.h / 2, p.w, p.h); x.restore(); });
    if (t < end) requestAnimationFrame(frame); else x.clearRect(0, 0, W, H);
  })(performance.now());
}

/* ---------- نافذة الإنهاء والأدوات ---------- */
function pause() {
  if (!game || game.answered || $('[data-screen="play"]').hidden) return;
  $('[data-pause]').hidden = false;
  $('[data-action="resume"]').focus();
}
function resume() {
  $('[data-pause]').hidden = true;
  $('[data-q-text]').focus({ preventScroll: true });
}
function fifty() {
  if (game.fiftyUsed || game.answered) return;
  game.fiftyUsed = true;
  const wrong = $$('.opt:not([data-correct])');
  // مع 3 خيارات نحذف خيار واحد عشان يبقى خياران
  shuffle(wrong).slice(0, wrong.length >= 3 ? 2 : 1).forEach(b => { b.classList.add('is-removed'); b.disabled = true; });
  $('[data-action="fifty"]').disabled = true;
  ($('.opt:not(:disabled)') || $('[data-q-text]')).focus();
}
function toggleMute() {
  settings.sound = !settings.sound;
  store.set('settings', settings);
  renderMe();
}

/* ---------- الأحداث ---------- */
document.addEventListener('click', e => {
  const go = e.target.closest('[data-go]');
  if (go) { const to = go.dataset.go; if (to === 'setup') renderSetup(); if (to === 'home') renderHome(); show(to); return; }
  const opt = e.target.closest('.opt');
  if (opt && !opt.disabled) return answer(opt);
  const a = e.target.closest('[data-action]');
  if (!a) return;
  switch (a.dataset.action) {
    case 'quick': if (!settings.name) settings.name = 'لاعب'; startGame(true); break;
    case 'howto': $('[data-howto]').hidden = false; $('[data-action="close-howto"]').focus(); break;
    case 'close-howto': $('[data-howto]').hidden = true; break;
    case 'begin-section': showQuestion(); break;
    case 'fifty': fifty(); break;
    case 'mute': toggleMute(); break;
    case 'pause': pause(); break;
    case 'resume': resume(); break;
    case 'quit': $('[data-pause]').hidden = true; finish(); break;
    case 'more': $('[data-card-bio]').classList.add('open'); a.hidden = true; break;
    case 'next': next(); break;
    case 'after-summary': afterSummary(); break;
    case 'again': startGame(game?.quick); break;
  }
});
document.addEventListener('keydown', e => {
  if (e.target.closest('input')) return;
  const playing = !$('[data-screen="play"]').hidden;
  const overlayOpen = $$('.overlay').some(o => !o.hidden);
  if (e.key === 'Escape') {
    if (!$('[data-howto]').hidden) { $('[data-howto]').hidden = true; return; }
    if (!$('[data-pause]').hidden) return resume();
    if (playing && !overlayOpen) return pause();
  }
  if (!playing) return;
  if ((e.key === 'm' || e.key === 'M' || e.key === 'ة') && !e.ctrlKey) return toggleMute();
  if (overlayOpen) return;
  const n = parseInt(e.key.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)), 10);
  if (n >= 1 && n <= 4) { const b = $$('.opt')[n - 1]; if (b && !b.disabled) answer(b); return; }
  if (e.key.startsWith('Arrow')) {
    const opts = $$('.opt:not(:disabled)'); if (!opts.length) return;
    e.preventDefault();
    const i = opts.indexOf(document.activeElement);
    if (i < 0) return opts[0].focus();
    const cols = getComputedStyle($('[data-opts]')).gridTemplateColumns.split(' ').length;
    const step = { ArrowDown: cols, ArrowUp: -cols, ArrowLeft: 1, ArrowRight: -1 }[e.key]; // RTL
    opts[(i + step + opts.length) % opts.length].focus();
  }
});

/* ---------- التشغيل ---------- */
(async function init() {
  try {
    const r = await fetch('data/questions.json', { cache: 'no-cache' });
    data = await r.json();
  } catch {
    document.body.insertAdjacentHTML('beforeend', '<p style="padding:2rem;text-align:center;font-weight:700">ما قدرنا نحمّل الأسئلة. شغّل اللعبة من سيرفر (شوف README).</p>');
    return;
  }
  renderHome();
  show('home');
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});
})();
