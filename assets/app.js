/* ظِلال — واجهة المنصة: البحث، البوت، المدقق، المختبر */
(function () {
  'use strict';

  const E = window.ZilalEngine;
  const DB = window.ZILAL_DB;
  const SRC = window.ZILAL_SOURCES;
  const SHADOWS = window.ZILAL_SHADOWS;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  if (!DB || !E) {
    document.body.insertAdjacentHTML('afterbegin', '<div class="fixed top-24 inset-x-4 z-50 bg-rose-900 text-white p-4 rounded-xl text-sm">تعذر تحميل قاعدة المصطلحات (data/terms.js).</div>');
    return;
  }
  E.init(DB, SHADOWS, window.ZILAL_ALIASES);

  /* ===================== أدوات عامة ===================== */
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (n) => Number(n).toLocaleString('en-US');
  /* يعزل المقاطع اللاتينية داخل النص العربي حتى لا تضطرب الأقواس والترتيب */
  const escb = (s) => String(s == null ? '' : s).split(/([A-Za-z][A-Za-z0-9 ’'\/().,&-]*[A-Za-z0-9)])/g).map((seg, i) => (i % 2 ? `<bdi dir="ltr">${esc(seg)}</bdi>` : esc(seg))).join('');
  const termUrl = (id) => SRC.terminologyenc.term(id);
  const termUrlEn = (id) => SRC.terminologyenc.termEn(id);
  const TYPE = {
    tahweel: { ar: 'تهويل', badge: 'bg-rose-500/10 text-rose-300 border-rose-500/30', border: 'border-r-rose-500', hl: 'hl-tahweel' },
    isqat: { ar: 'إسقاط', badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30', border: 'border-r-amber-500', hl: 'hl-isqat' },
    tamyee: { ar: 'تمييع', badge: 'bg-sky-500/10 text-sky-300 border-sky-500/30', border: 'border-r-sky-400', hl: 'hl-tamyee' },
  };
  const SEV = { high: 'خطر مرتفع', mid: 'تنبيه متوسط', low: 'ملاحظة' };
  const typeBadge = (t) => `<span class="text-[10px] font-bold px-2 py-0.5 rounded-full border ${TYPE[t].badge}">${TYPE[t].ar}</span>`;

  function toast(msg) {
    const t = $('#toast');
    t.innerHTML = `<div class="toast bg-slate-900 border border-brand-emerald/40 text-white text-sm px-4 py-3 rounded-xl shadow-2xl">${esc(msg)}</div>`;
    t.classList.remove('hidden');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.add('hidden'), 2600);
  }
  async function copy(text, msg) {
    try { await navigator.clipboard.writeText(text); toast(msg || 'تم النسخ'); }
    catch (e) {
      const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); toast(msg || 'تم النسخ'); } catch (_) { toast('تعذر النسخ'); }
      ta.remove();
    }
  }
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  const shadowFor = (id) => SHADOWS.find((s) => s.term === +id) || null;
  const citation = (t) => `«${t.d}» — ${SRC.terminologyenc.name}، مصطلح «${t.a}» رقم ${t.i}. ${termUrl(t.i)}`;

  /* ===================== إحصاءات ===================== */
  const stats = { terms: DB.terms.length, english: DB.terms.filter((t) => t.e).length, rules: E.state.compiled.length };
  $$('[data-stat]').forEach((el) => { const k = el.getAttribute('data-stat'); if (stats[k] != null) el.textContent = fmt(stats[k]); });

  /* ===================== بطاقة المصطلح (الدرج) ===================== */
  const drawer = $('#drawer'), backdrop = $('#drawerBackdrop');
  let lastFocus = null;
  function openDrawer(id) {
    const t = E.term(id);
    if (!t) return;
    const d = E.details(t.i) || {};
    const sh = shadowFor(t.i);
    const layer = (title, body, lvl, ltr) => body ? `
      <div class="rounded-xl bg-brand-darker/70 border border-white/5 p-4">
        <div class="flex items-center justify-between mb-2"><h4 class="text-xs font-bold text-slate-300">${title}</h4>${lvl || ''}</div>
        <p class="text-sm leading-relaxed text-slate-100" ${ltr ? 'dir="ltr" style="text-align:left"' : ''}>${esc(body)}</p>
      </div>` : '';
    const shadowHtml = sh ? `
      <div class="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
        <div class="flex items-center justify-between mb-2"><h4 class="text-xs font-bold text-sky-200">ظلال معروفة عند ترجمته</h4><span class="lvl lvl-analysis">تحليل ظلال</span></div>
        <ul class="space-y-2">${sh.rules.map((r) => `<li class="text-xs leading-relaxed"><div class="flex items-center gap-2 mb-1">${typeBadge(r.type)}<span dir="ltr" class="font-mono text-slate-200">${esc(r.label)}</span>${r.specialist ? '<span class="lvl lvl-expert">يحتاج مختصًا</span>' : ''}</div><span class="text-brand-textMuted">${escb(r.why)}</span></li>`).join('')}</ul>
        <div class="mt-3 text-xs text-slate-300">الصياغة المقترحة: <span dir="ltr" class="font-mono text-brand-emerald">${esc(sh.suggest)}</span></div>
      </div>` : '';
    $('#drawerBody').innerHTML = `
      <div class="flex items-start justify-between gap-3 mb-5">
        <div>
          <div class="text-xs text-brand-textMuted mb-1">${esc(t.c.join(' · '))}${d.path && d.path.length ? ' › ' + esc(d.path.slice(-1)[0]) : ''}</div>
          <h3 id="drawerTitle" class="text-3xl font-bold text-white">${esc(t.a)}</h3>
          ${t.e ? `<div dir="ltr" class="text-left text-lg text-brand-emerald font-semibold mt-1">${esc(t.e)}</div>` : '<div class="text-xs text-amber-300 mt-1">لا توجد ترجمة إنجليزية لهذا المصطلح في المصدر حتى الآن</div>'}
          ${d.root ? `<div class="text-xs text-brand-textMuted mt-2">الجذر: <span class="text-slate-200">${esc(d.root)}</span></div>` : ''}
        </div>
        <button id="drawerClose" class="text-slate-400 hover:text-white p-2 -m-2" aria-label="إغلاق">✕</button>
      </div>
      <div class="space-y-3">
        ${layer('المعنى اللغوي', d.ling && d.ling.ar, '<span class="lvl lvl-source">نص المصدر</span>')}
        ${layer('المعنى الاصطلاحي', t.d, '<span class="lvl lvl-source">نص المصدر</span>')}
        ${layer('النص الإنجليزي في المصدر', t.f, '<span class="lvl lvl-source">نص المصدر</span>', true)}
        ${t.e && !t.f ? '<p class="text-[11px] text-amber-200/80 leading-relaxed">تعريف المصطلح بالإنجليزية غير متاح بصيغة سليمة في المصدر؛ لذلك لا نعرضه. والمرجع عند أي اختلاف هو النص العربي.</p>' : ''}
        ${layer('الشرح', d.expl && d.expl.ar, '<span class="lvl lvl-source">نص المصدر</span>')}
        ${shadowHtml}
      </div>
      <div class="grid grid-cols-2 gap-2 mt-5">
        <a href="${termUrl(t.i)}" target="_blank" rel="noopener" class="btn-primary py-2.5 text-sm">فتح في المصدر ↗</a>
        <a href="${termUrlEn(t.i)}" target="_blank" rel="noopener" class="btn-ghost py-2.5 text-sm">الصفحة الإنجليزية ↗</a>
        <a href="${SRC.jamhara.search(t.a.replace(/[ً-ٰٟ]/g, ''))}" target="_blank" rel="noopener" class="btn-ghost py-2.5 text-xs">تحقق في معجم الجمهرة ↗</a>
        <button data-copy-cite="${t.i}" class="btn-ghost py-2.5 text-xs">نسخ الاقتباس الموثّق</button>
      </div>
      <button data-ask-term="${t.i}" class="btn-ghost w-full mt-2 py-2.5 text-xs">اسأل ظلال عن هذا المصطلح</button>
      <p class="text-[11px] text-brand-textMuted mt-5 leading-relaxed">المصدر: ${esc(SRC.terminologyenc.name)} — مصطلح رقم ${t.i}. ${t.n ? `مترجم في المصدر إلى ${t.n} لغة.` : ''}</p>`;
    lastFocus = document.activeElement;
    backdrop.classList.remove('hidden');
    drawer.classList.remove('drawer-enter');
    $('#drawerClose').focus();
  }
  function closeDrawer() {
    drawer.classList.add('drawer-enter');
    backdrop.classList.add('hidden');
    if (lastFocus) lastFocus.focus();
  }
  backdrop.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !backdrop.classList.contains('hidden')) closeDrawer(); });
  drawer.addEventListener('click', (e) => {
    if (e.target.closest('#drawerClose')) return closeDrawer();
    const c = e.target.closest('[data-copy-cite]');
    if (c) return copy(citation(E.term(c.dataset.copyCite)), 'نُسخ الاقتباس مع رابط المصدر');
    const a = e.target.closest('[data-ask-term]');
    if (a) { const t = E.term(a.dataset.askTerm); closeDrawer(); location.hash = '#ask'; ask('ما معنى ' + t.a.replace(/[ً-ٰٟ]/g, '') + '؟'); }
  });
  document.addEventListener('click', (e) => {
    const o = e.target.closest('[data-open-term]');
    if (o) { e.preventDefault(); openDrawer(o.dataset.openTerm); }
  });

  /* ===================== المعجم الموثّق ===================== */
  function termCard(r) {
    const t = r.t || r;
    const sh = shadowFor(t.i);
    return `
      <button data-open-term="${t.i}" class="card-glow rounded-2xl p-5 text-right w-full transition-colors group">
        <div class="flex items-start justify-between gap-3 mb-2">
          <div>
            <div class="text-xl font-bold text-white group-hover:text-brand-emerald transition-colors">${esc(t.a)}</div>
            ${t.e ? `<div dir="ltr" class="text-left text-sm text-brand-emerald/90 font-semibold">${esc(t.e)}</div>` : '<div class="text-[11px] text-slate-500">بلا ترجمة إنجليزية في المصدر</div>'}
          </div>
          <div class="flex flex-col items-end gap-1 shrink-0">
            <span class="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-400">${esc(t.c[0])}</span>
            ${sh ? '<span class="lvl lvl-analysis">عليه ظل معروف</span>' : ''}
          </div>
        </div>
        <p class="text-xs text-brand-textMuted leading-relaxed line-clamp-3">${esc(t.d)}</p>
        <div class="mt-3 text-[10px] text-slate-500">المصدر: موسوعة المصطلحات المترجمة · رقم ${t.i}</div>
      </button>`;
  }
  const cats = DB.meta.categories || [...new Set(DB.terms.flatMap((t) => t.c))];
  $('#dictCategory').insertAdjacentHTML('beforeend', cats.map((c) => `<option value="${esc(c)}">${esc(c)} (${fmt(DB.terms.filter((t) => t.c.includes(c)).length)})</option>`).join(''));

  function renderDict() {
    const q = $('#dictSearch').value.trim();
    const cat = $('#dictCategory').value;
    let res;
    if (!q) {
      const featured = SHADOWS.filter((s) => s.term).map((s) => E.term(s.term)).filter(Boolean)
        .filter((t) => !cat || t.c.includes(cat));
      res = (featured.length ? featured : DB.terms.filter((t) => !cat || t.c.includes(cat)).slice(0, 24)).map((t) => ({ t }));
      $('#dictCount').textContent = cat ? `مصطلحات «${cat}»` : 'مصطلحات مختارة عليها ظلال شائعة — ابحث لعرض المزيد';
    } else {
      res = E.search(q, { limit: 60, category: cat, raw: true });
      $('#dictCount').textContent = res.length ? `${fmt(res.length)} نتيجة${res.length === 60 ? ' (أول 60)' : ''}` : '';
    }
    if (!res.length) {
      $('#dictResults').innerHTML = `
        <div class="md:col-span-2 xl:col-span-3 card-glow rounded-2xl p-8 text-center">
          <div class="text-3xl mb-2">🔎</div>
          <div class="text-white font-bold mb-1">لا يوجد «${esc(q)}» في القاعدة الموثّقة</div>
          <p class="text-xs text-brand-textMuted mb-4">لن نخمّن معنى غير موثّق. يمكنك التحقق في مصدر معتمد آخر:</p>
          <a href="${SRC.jamhara.search(q)}" target="_blank" rel="noopener" class="btn-ghost px-4 py-2 text-xs">ابحث في معجم الجمهرة ↗</a>
        </div>`;
      return;
    }
    $('#dictResults').innerHTML = res.slice(0, 60).map(termCard).join('');
  }
  $('#dictSearch').addEventListener('input', debounce(renderDict, 120));
  $('#dictCategory').addEventListener('change', renderDict);
  $('#dictQuick').addEventListener('click', (e) => { const b = e.target.closest('[data-q]'); if (b) { $('#dictSearch').value = b.dataset.q; renderDict(); } });
  renderDict();

  /* بحث الواجهة */
  const heroInput = $('#heroSearch'), heroBox = $('#heroResults');
  heroInput.addEventListener('input', debounce(() => {
    const q = heroInput.value.trim();
    if (!q) { heroBox.classList.add('hidden'); return; }
    const res = E.search(q, { limit: 7, raw: true });
    heroBox.innerHTML = res.length ? res.map((r) => `
      <button data-open-term="${r.t.i}" class="w-full text-right px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-0 flex items-center justify-between gap-3">
        <span><span class="text-white font-bold">${esc(r.t.a)}</span> <span class="text-xs text-brand-textMuted">${esc((r.t.d || '').slice(0, 70))}…</span></span>
        ${r.t.e ? `<span dir="ltr" class="text-xs text-brand-emerald shrink-0">${esc(r.t.e)}</span>` : ''}
      </button>`).join('') + `<button data-hero-ask class="w-full text-right px-4 py-3 text-xs text-brand-emerald hover:bg-white/5">اسأل ظلال: «${esc(q)}» ←</button>`
      : `<div class="px-4 py-4 text-sm text-brand-textMuted">لا يوجد في القاعدة الموثّقة. <button data-hero-ask class="text-brand-emerald underline">اسأل ظلال</button></div>`;
    heroBox.classList.remove('hidden');
  }, 100));
  document.addEventListener('click', (e) => { if (!e.target.closest('#heroSearchWrap')) heroBox.classList.add('hidden'); });
  const heroAsk = () => { const q = heroInput.value.trim(); if (!q) return heroInput.focus(); heroBox.classList.add('hidden'); location.hash = '#ask'; ask(q); };
  $('#heroAskBtn').addEventListener('click', heroAsk);
  heroInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') heroAsk(); });
  heroBox.addEventListener('click', (e) => { if (e.target.closest('[data-hero-ask]')) heroAsk(); });

  /* ===================== ميزان الأمانة (أمثلة) ===================== */
  const SCALE = [
    { id: 6778, left: { key: 'jihad', type: 'isqat', phrase: 'Holy War' }, right: { key: 'jihad', type: 'tamyee', phrase: 'only an inner spiritual struggle' } },
    { id: 5070, left: { key: 'zakat', type: 'isqat', phrase: 'religious tax' }, right: { key: 'zakat', type: 'tamyee', phrase: 'voluntary charity' } },
    { id: 114, left: { key: 'fatwa', type: 'tahweel', phrase: 'death sentence' }, right: null },
    { id: 7032, left: { key: 'qiwamah', type: 'tahweel', phrase: 'male dominance' }, right: null },
    { id: 6512, left: null, right: { key: 'riba', type: 'tamyee', phrase: 'only excessive interest is riba' } },
  ];
  function scaleSide(side, align) {
    if (!side) return `<div class="rounded-xl border border-dashed border-white/10 p-4 text-center text-xs text-slate-500 flex items-center justify-center">لا يُرصد انحراف شائع في هذا الاتجاه</div>`;
    const sh = SHADOWS.find((s) => s.key === side.key);
    const rule = sh && sh.rules.find((r) => r.type === side.type);
    const tone = side.type === 'tamyee' ? 'border-sky-500/30 bg-sky-500/5' : (side.type === 'isqat' ? 'border-amber-500/30 bg-amber-500/5' : 'border-rose-500/30 bg-rose-500/5');
    return `<div class="rounded-xl border ${tone} p-4 ${align}">
      <div class="flex items-center gap-2 mb-2">${typeBadge(side.type)}</div>
      <div dir="ltr" class="font-mono text-sm text-white mb-2 text-left">“${esc(side.phrase)}”</div>
      <p class="text-[11px] text-brand-textMuted leading-relaxed">${escb(rule ? rule.why.split('؛')[0] : '')}</p></div>`;
  }
  $('#scaleCards').innerHTML = SCALE.map((s) => {
    const t = E.term(s.id);
    if (!t) return '';
    return `<div class="card-glow rounded-2xl p-4 sm:p-5">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch">
        ${scaleSide(s.left, '')}
        <button data-open-term="${t.i}" class="rounded-xl border border-brand-emerald/40 bg-brand-emerald/5 p-4 text-right hover:bg-brand-emerald/10 transition-colors">
          <div class="flex items-center justify-between mb-1"><span class="text-2xl font-bold text-white">${esc(t.a)}</span><span class="lvl lvl-source">نص المصدر</span></div>
          ${t.e ? `<div dir="ltr" class="text-left text-sm font-semibold text-brand-emerald mb-2">${esc(t.e)}</div>` : ''}
          <p class="text-xs text-slate-200 leading-relaxed">«${esc(t.d)}»</p>
          <div class="text-[10px] text-brand-textMuted mt-2">موسوعة المصطلحات المترجمة · رقم ${t.i} ↗</div>
        </button>
        ${scaleSide(s.right, '')}
      </div></div>`;
  }).join('');

  /* ===================== المصادر ===================== */
  $('#sourcesGrid').innerHTML = Object.values(SRC).map((s) => `
    <a href="${s.url}" target="_blank" rel="noopener" class="card-glow rounded-2xl p-5 block">
      <div class="flex items-start justify-between gap-3 mb-2"><h3 class="text-sm font-bold text-white leading-relaxed">${esc(s.name)}</h3><span class="text-[10px] shrink-0 px-2 py-0.5 rounded-full ${s.status === 'مدمج' ? 'bg-brand-emerald/15 text-brand-emerald' : 'bg-white/5 text-slate-300'}">${esc(s.status)}</span></div>
      <p class="text-xs text-brand-textMuted leading-relaxed">${esc(s.role)}</p>
      <div dir="ltr" class="text-[11px] text-sky-300/80 mt-3 text-left">${esc(s.url.replace(/^https?:\/\//, ''))}</div>
    </a>`).join('');
  const m = DB.meta || {};
  $('#dataMeta').textContent = `قاعدة المصطلحات: ${m.source || ''} — ${fmt(DB.terms.length)} مصطلحًا، منها ${fmt(stats.english)} بترجمة إنجليزية. تاريخ السحب: ${(m.fetched_at || '').slice(0, 10)}. ${m.glitches_removed ? `استُبعدت ${fmt(m.glitches_removed)} قيمة إنجليزية غير مطابقة في المصدر.` : ''}`;

  /* ===================== الإحالة للمختص ===================== */
  const referrals = [];
  function addReferral(obj) {
    referrals.push({ ...obj, at: new Date().toLocaleString('ar-SA') });
    $('#referralCount').textContent = referrals.length;
    $('#referralList').innerHTML = referrals.map((r, i) => `<div class="rounded-lg bg-brand-darker/70 border border-white/5 p-2"><div class="text-slate-200 font-bold">${i + 1}. ${esc(r.title)}</div><div class="text-brand-textMuted mt-1 line-clamp-2">${esc(r.context || '')}</div></div>`).join('');
    $('#referralCopy').classList.remove('hidden');
    toast('أُضيف طلب الإحالة إلى قائمة المختص');
  }
  $('#referralCopy').addEventListener('click', () => {
    const txt = referrals.map((r, i) => `${i + 1}) ${r.title}\nالسياق: ${r.context || '-'}\nالسبب: ${r.reason || '-'}\nالوقت: ${r.at}`).join('\n\n');
    copy('طلبات إحالة من منصة ظِلال للمراجعة الشرعية:\n\n' + txt, 'نُسخت الطلبات — أرسلها للمختص الشرعي');
  });

  /* ===================== الذكاء التوليدي المقيّد ===================== */
  const AI = { server: false, model: null, userKey: '', enabled: false };
  const GEMINI_MODEL = 'gemini-3.8-flash';
  const SYSTEM_PROMPT = [
    'أنت «ظِلال»، مساعد تدقيق دلالي للمصطلحات الإسلامية في الترجمة. التزم بما يلي حرفيًا:',
    '1) اعتمد فقط على «السياق الموثّق» المرفق، وهو مقتطفات من موسوعة المصطلحات والقواميس الإسلامية المترجمة. لا تضف معلومة شرعية من خارجه.',
    '2) بعد كل معلومة مأخوذة من السياق ضع مرجعها بالصيغة [T:رقم]، والرقم هو معرّف المصطلح في السياق.',
    '3) إن لم يكفِ السياق فاكتب صراحة: «لا يتوفر لديّ مرجع معتمد يكفي للإجابة» واجعل refer=true. لا تخمّن.',
    '4) لا تُصدر فتوى ولا حكمًا شرعيًا. اعرض التعريف من السياق وأحِل الحكم إلى أهل العلم.',
    '5) لا تترجم آيات القرآن الكريم ولا الأحاديث بنفسك؛ أحِل إلى ترجمات مجمع الملك فهد لطباعة المصحف الشريف وموسوعة الأحاديث النبوية.',
    '6) عند تدقيق نص: حدّد كل عبارة فيها تهويل (تضخيم سلبي أو حكم قيمي) أو إسقاط (مفهوم مستعار من ثقافة أو دين آخر) أو تمييع (تضييق المعنى الشرعي أو تخفيفه)، واقترح بديلًا من الترجمة الإنجليزية الواردة في السياق.',
    '7) لا تجمّل المعنى ولا تشوّهه: انقل تعريف المصدر كما هو حتى لو لم يرضِ القارئ.',
    '8) أجب بلغة السؤال، بإيجاز لا يتجاوز 150 كلمة.',
    'أعد JSON فقط بهذا الشكل: {"answer":"...","citations":[أرقام],"issues":[{"quote":"...","type":"tahweel|isqat|tamyee","explanation":"...","suggestion":"...","citation":رقم}],"refer":false,"refer_reason":"","confidence":"high|medium|low"}',
  ].join('\n');

  function buildContext(ids) {
    return ids.map((id) => E.term(id)).filter(Boolean).slice(0, 8).map((t) =>
      `[T:${t.i}] ${t.a}${t.e ? ' — ' + t.e : ''}\nالتعريف العربي (المصدر): ${t.d}${t.f ? '\nEnglish (source): ' + t.f : ''}\nالرابط: ${termUrl(t.i)}`).join('\n---\n');
  }
  function buildUserPrompt(task, text, ids, dets) {
    const hints = (dets || []).map((d) => `- «${d.match}» (${TYPE[d.type].ar}) → ${d.suggest} [T:${d.term || '-'}]`).join('\n');
    return `المهمة: ${task === 'audit' ? 'تدقيق نص مترجم' : 'الإجابة عن سؤال'}\nالنص: """${text}"""\n\nالسياق الموثّق:\n${buildContext(ids) || '(لا يوجد)'}\n${hints ? '\nتنبيهات المحرك المحلي (للاستئناس):\n' + hints : ''}`;
  }
  function parseJsonLoose(s) {
    const clean = String(s || '').trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    try { return JSON.parse(clean); } catch (e) {
      const a = clean.indexOf('{'), b = clean.lastIndexOf('}');
      if (a >= 0 && b > a) return JSON.parse(clean.slice(a, b + 1));
      throw e;
    }
  }
  async function callAI(task, text, ids, dets) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 30000);
    try {
      if (AI.server) {
        const r = await fetch('/api/ask', { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: ctrl.signal,
          body: JSON.stringify({ task, text, context: ids.map((id) => E.term(id)).filter(Boolean).slice(0, 8).map((t) => ({ i: t.i, a: t.a, e: t.e, d: t.d, f: t.f })), hints: (dets || []).map((d) => ({ match: d.match, type: d.type, suggest: d.suggest, term: d.term })) }) });
        if (!r.ok) throw new Error('server ' + r.status);
        return await r.json();
      }
      if (AI.userKey) {
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`, {
          method: 'POST', signal: ctrl.signal, headers: { 'Content-Type': 'application/json', 'x-goog-api-key': AI.userKey },
          body: JSON.stringify({ systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] }, contents: [{ role: 'user', parts: [{ text: buildUserPrompt(task, text, ids, dets) }] }], generationConfig: { temperature: 0.2, maxOutputTokens: 2048, responseMimeType: 'application/json' } }),
        });
        const data = await r.json();
        if (!r.ok) throw new Error((data.error && data.error.message) || 'gemini ' + r.status);
        const txt = (data.candidates && data.candidates[0] && data.candidates[0].content.parts.map((p) => p.text || '').join('')) || '';
        return { ok: true, model: GEMINI_MODEL, result: parseJsonLoose(txt) };
      }
      throw new Error('no-ai');
    } finally { clearTimeout(timer); }
  }
  /* تحقق آلي: لا يُقبل مرجع غير موجود في السياق المرسل */
  function validateAI(result, ids) {
    const allowed = new Set(ids.map(Number));
    const removed = [];
    const answer = String(result.answer || '').replace(/\[T:(\d+)\]/g, (m0, id) => {
      if (allowed.has(+id)) return `⟦${id}⟧`;
      removed.push(+id); return '⟦x⟧';
    });
    const citations = (result.citations || []).map(Number).filter((id) => { if (allowed.has(id)) return true; removed.push(id); return false; });
    const issues = (result.issues || []).map((it) => ({ ...it, valid: it.citation == null || allowed.has(Number(it.citation)) }));
    return { answer, citations, issues, removed: [...new Set(removed)], refer: !!result.refer, refer_reason: result.refer_reason || '', confidence: result.confidence || 'medium' };
  }
  function renderAIText(answer, numMap) {
    let h = esc(answer).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
    h = h.replace(/⟦(\d+)⟧/g, (m0, id) => `<button data-open-term="${id}" class="cite" title="افتح المصدر">${numMap(id)}</button>`);
    return h.replace(/⟦x⟧/g, '<span class="cite-bad" title="حُذف لأنه غير موجود في القاعدة">مرجع محذوف</span>');
  }
  function setAIMode() {
    const can = AI.server || !!AI.userKey;
    const tg = $('#aiToggle');
    tg.disabled = !can;
    if (can && !tg.dataset.touched) tg.checked = true;
    AI.enabled = can && tg.checked;
    $('#aiModeLabel').textContent = AI.enabled ? `ذكاء توليدي مقيّد بالمصادر (${AI.server ? AI.model || 'Gemini' : GEMINI_MODEL}) + المعجم` : 'وضع المعجم — يعمل دائمًا دون اتصال بنموذج';
    $('#auditDeep').classList.toggle('hidden', !AI.enabled);
  }
  $('#aiToggle').addEventListener('change', (e) => { e.target.dataset.touched = '1'; setAIMode(); });
  $('#aiSettingsBtn').addEventListener('click', () => $('#aiSettings').classList.toggle('hidden'));
  $('#userKeySave').addEventListener('click', () => { AI.userKey = $('#userKey').value.trim(); $('#userKey').value = ''; setAIMode(); toast(AI.userKey ? 'فُعّل الذكاء التوليدي للتجربة (لن يُحفظ المفتاح)' : 'أُلغي المفتاح'); });
  (async () => {
    if (location.protocol === 'file:') return setAIMode();
    try {
      const ctrl = new AbortController(); setTimeout(() => ctrl.abort(), 4000);
      const r = await fetch('/api/ask', { signal: ctrl.signal });
      if (r.ok) { const j = await r.json(); AI.server = !!j.ok; AI.model = j.model; }
    } catch (_) { /* وضع المعجم */ }
    setAIMode();
  })();

  /* ===================== اسأل ظلال (البوت) ===================== */
  const log = $('#chatLog');
  function addMsg(role, html) {
    const wrap = document.createElement('div');
    wrap.className = role === 'user' ? 'flex justify-start' : 'flex justify-end';
    wrap.innerHTML = role === 'user'
      ? `<div class="max-w-[85%] bg-brand-emerald/15 border border-brand-emerald/25 text-slate-100 rounded-2xl rounded-tr-sm px-4 py-3 text-sm whitespace-pre-wrap">${html}</div>`
      : `<div class="max-w-[92%] w-full bg-brand-darker/80 border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3 text-sm prose-zilal leading-relaxed">${html}</div>`;
    log.appendChild(wrap);
    log.scrollTop = log.scrollHeight;
    return wrap;
  }
  function sourcesFooter(ids) {
    if (!ids.length) return '';
    return `<div class="mt-3 pt-3 border-t border-white/5 space-y-1 text-[11px]">${ids.map((id, i) => {
      const t = E.term(id);
      return t ? `<div><span class="text-brand-emerald font-bold">[${i + 1}]</span> <a class="text-sky-300 hover:underline" href="${termUrl(t.i)}" target="_blank" rel="noopener">${esc(SRC.terminologyenc.short)} — «${esc(t.a)}» (رقم ${t.i}) ↗</a></div>` : '';
    }).join('')}</div>`;
  }
  function termAnswer(t, idx) {
    const sh = shadowFor(t.i);
    return `
      <div class="flex flex-wrap gap-2 mb-2"><span class="lvl lvl-source">نص المصدر</span>${sh ? '<span class="lvl lvl-analysis">تحليل ظلال</span>' : ''}</div>
      <p><strong class="text-lg">${esc(t.a)}</strong>${t.e ? ` — <span dir="ltr" class="text-brand-emerald font-semibold">${esc(t.e)}</span>` : ''}</p>
      <p><span class="text-brand-textMuted">التعريف الاصطلاحي في المصدر:</span> «${esc(t.d)}» <button data-open-term="${t.i}" class="cite">${idx}</button></p>
      ${t.f ? `<p dir="ltr" class="text-left text-slate-300 text-[13px]">${esc(t.f)} <button data-open-term="${t.i}" class="cite">${idx}</button></p>` : (t.e ? '' : '<p class="text-amber-200/80 text-xs">لا توجد ترجمة إنجليزية لهذا المصطلح في المصدر بعد.</p>')}
      ${sh ? `<div class="mt-2 rounded-lg border border-sky-500/20 bg-sky-500/5 p-3 text-xs"><div class="font-bold text-sky-200 mb-1">انتبه عند الترجمة:</div>${sh.rules.map((r) => `<div class="mb-1">${typeBadge(r.type)} <span dir="ltr" class="font-mono">${esc(r.label)}</span></div>`).join('')}<div class="mt-1">الصياغة المقترحة: <span dir="ltr" class="font-mono text-brand-emerald">${esc(sh.suggest)}</span></div></div>` : ''}`;
  }
  function referBtn(title, context, reason) {
    const id = 'r' + Math.random().toString(36).slice(2, 8);
    referBtn.map = referBtn.map || {};
    referBtn.map[id] = { title, context, reason };
    return `<button data-refer="${id}" class="mt-3 text-xs px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20">إحالة إلى المختص الشرعي</button>`;
  }
  log.addEventListener('click', (e) => {
    const b = e.target.closest('[data-refer]');
    if (b && referBtn.map[b.dataset.refer]) { addReferral(referBtn.map[b.dataset.refer]); b.disabled = true; b.textContent = '✓ أُضيفت للإحالة'; }
    const o = e.target.closest('[data-to-audit]');
    if (o) { $('#auditInput').value = o.dataset.toAudit; location.hash = '#audit'; runAudit(); }
  });

  function dictionaryReply(q, r) {
    if (r.route === 'quran_refer') {
      const ids = (r.terms || []).map((x) => x.t.i);
      return `<div class="flex gap-2 mb-2"><span class="lvl lvl-expert">إحالة</span></div>
        <p>لا يترجم «ظلال» آيات القرآن الكريم من عنده؛ لأن ترجمة معاني القرآن عمل علمي مؤسسي. ترجمات المعاني المعتمدة يصدرها <a class="text-sky-300 underline" href="${SRC.qurancomplex.url}" target="_blank" rel="noopener">مجمع الملك فهد لطباعة المصحف الشريف ↗</a>.</p>
        ${ids.length ? `<p class="mt-2 text-brand-textMuted">لكن يمكنني تعريفك بالمصطلحات الواردة في سؤالك من المصدر:</p>${ids.slice(0, 2).map((id, i) => termAnswer(E.term(id), i + 1)).join('<hr class="my-3 border-white/5">')}${sourcesFooter(ids.slice(0, 2))}` : ''}
        ${referBtn('طلب ترجمة آية', q, 'ترجمة نص قرآني')}`;
    }
    if (r.route === 'fatwa_refer') {
      const ids = (r.terms || []).map((x) => x.t.i);
      return `<div class="flex gap-2 mb-2"><span class="lvl lvl-expert">يحتاج مختصًا</span></div>
        <p>سؤالك عن <strong>حكم شرعي</strong>، و«ظلال» لا يُصدر فتوى ولا يرجّح بين الأقوال. اسأل أهل العلم أو جهة الإفتاء الرسمية في بلدك.</p>
        ${ids.length ? `<p class="mt-2 text-brand-textMuted">ما أستطيع تقديمه هو تعريف المصطلح كما في المصدر:</p>${termAnswer(E.term(ids[0]), 1)}${sourcesFooter([ids[0]])}` : ''}
        ${referBtn('سؤال حكم شرعي', q, 'طلب فتوى')}`;
    }
    if (r.route === 'audit') {
      const dets = r.detections;
      const ids = [...new Set(dets.map((d) => d.term).filter(Boolean))];
      const num = (id) => ids.indexOf(+id) + 1;
      const ok = E.approvedHits(q);
      return `<div class="flex flex-wrap gap-2 mb-2"><span class="lvl lvl-analysis">تحليل ظلال</span><span class="lvl lvl-source">نص المصدر</span></div>
        <p>${dets.length ? `رصدت <strong>${dets.length}</strong> ${dets.length > 2 ? 'مواضع' : 'موضع'} تحتاج مراجعة:` : 'لم أرصد ظلًّا معروفًا في هذا النص ضمن قواعد الرصد الحالية.'}</p>
        ${dets.map((d) => `<div class="mt-2 rounded-lg bg-white/5 p-3 text-xs">
          <div class="flex flex-wrap items-center gap-2 mb-1">${typeBadge(d.type)}<span dir="ltr" class="font-mono text-white">“${esc(d.match)}”</span><span class="text-brand-textMuted">← ${esc(d.ar)}</span>${d.specialist ? '<span class="lvl lvl-expert">يحتاج مختصًا</span>' : ''}</div>
          <div class="text-brand-textMuted leading-relaxed">${escb(d.why)} ${d.term ? `<button data-open-term="${d.term}" class="cite">${num(d.term)}</button>` : `<a class="text-sky-300 underline" target="_blank" rel="noopener" href="${SRC.jamhara.search(d.fallback ? d.fallback.q : d.ar)}">الجمهرة ↗</a>`}</div>
          <div class="mt-1">البديل المقترح: <span dir="ltr" class="font-mono text-brand-emerald">${esc(d.suggest)}</span></div></div>`).join('')}
        ${ok.length ? `<p class="mt-3 text-xs text-emerald-300">✓ صياغات مطابقة للمصدر: ${ok.map((h) => `<span dir="ltr" class="font-mono">${esc(h.phrase)}</span>`).join('، ')}</p>` : ''}
        ${sourcesFooter(ids)}
        <button data-to-audit="${esc(q)}" class="mt-3 text-xs px-3 py-1.5 rounded-lg bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/30 hover:bg-brand-emerald/20">افتح في مدقق الترجمة ←</button>
        ${dets.some((d) => d.specialist) ? referBtn('تدقيق نص يتضمن حالات حساسة', q.slice(0, 300), 'رصد يحتاج مختصًا') : ''}`;
    }
    if (r.route === 'term') {
      const top = r.terms[0].t;
      const homo = E.homographs(top.i);
      const more = r.terms.slice(1, 4).filter((x) => x.score >= 60 && !homo.some((h) => h.i === x.t.i));
      const homoHtml = homo.length ? `<div class="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs"><div class="font-bold text-amber-200 mb-1">تنبيه: لهذا الرسم أكثر من معنى في المصدر</div>${homo.slice(0, 3).map((h) => `<div class="mt-1"><button data-open-term="${h.i}" class="text-white font-bold underline">${esc(h.a)}</button>${h.e ? ` <span dir="ltr" class="text-brand-emerald">${esc(h.e)}</span>` : ''}: <span class="text-brand-textMuted">${esc(h.d.slice(0, 90))}${h.d.length > 90 ? '…' : ''}</span></div>`).join('')}<div class="mt-1 text-brand-textMuted">التشكيل يغيّر المعنى؛ تأكد من المقصود قبل الترجمة.</div></div>` : '';
      return termAnswer(top, 1) + homoHtml + sourcesFooter([top.i]) +
        (more.length ? `<div class="mt-3 text-xs text-brand-textMuted">قد تقصد أيضًا: ${more.map((x) => `<button data-open-term="${x.t.i}" class="chip !py-1 !px-2">${esc(x.t.a)}</button>`).join(' ')}</div>` : '');
    }
    const cq = E.cleanQuery(q) || q;
    const near = (r.terms || []).slice(0, 3);
    return `<div class="flex gap-2 mb-2"><span class="lvl lvl-expert">امتناع</span></div>
      <p>لم أجد «${esc(cq)}» في المصادر المعتمدة لديّ، <strong>ولن أجيب من عندي</strong>.</p>
      ${near.length ? `<p class="mt-2 text-xs text-brand-textMuted">أقرب ما وجدته: ${near.map((x) => `<button data-open-term="${x.t.i}" class="chip !py-1 !px-2">${esc(x.t.a)}</button>`).join(' ')}</p>` : ''}
      <p class="mt-2 text-xs">تحقق في مصدر معتمد آخر: <a class="text-sky-300 underline" href="${SRC.jamhara.search(cq)}" target="_blank" rel="noopener">معجم الجمهرة ↗</a></p>
      ${referBtn('مصطلح غير موجود في القاعدة', q, 'لا يوجد مرجع')}`;
  }

  let busy = false;
  async function ask(q) {
    q = String(q || '').trim();
    if (!q || busy) return;
    busy = true; $('#chatSend').disabled = true;
    addMsg('user', esc(q));
    const r = E.route(q);
    const thinking = addMsg('bot', '<div class="typing" aria-label="جارٍ البحث في المصادر"><span></span><span></span><span></span></div><div class="text-[11px] text-brand-textMuted mt-1">أبحث في المصادر المعتمدة…</div>');
    await new Promise((res) => setTimeout(res, 350));
    let html = dictionaryReply(q, r);
    // الحواجز تسبق النموذج: الفتوى وترجمة الآيات والامتناع لا تُرسل للنموذج أصلًا
    if (AI.enabled && (r.route === 'term' || r.route === 'audit')) {
      const dets = r.route === 'audit' ? r.detections : [];
      let ids = r.route === 'term' ? r.terms.slice(0, 5).map((x) => x.t.i) : dets.map((d) => d.term).filter(Boolean);
      if (r.route === 'audit') {
        for (const w of E.normEn(q).split(' ')) { const id = window.ZILAL_ALIASES[w]; if (id) ids.push(id); }
      }
      ids = [...new Set(ids)].slice(0, 8);
      try {
        const out = await callAI(r.route === 'audit' ? 'audit' : 'ask', q, ids, dets);
        const v = validateAI(out.result || out, ids);
        const order = [];
        const num = (id) => { if (!order.includes(+id)) order.push(+id); return order.indexOf(+id) + 1; };
        const body = renderAIText(v.answer, num);
        const issues = v.issues.filter((it) => it.quote).map((it) => `<div class="mt-2 rounded-lg bg-white/5 p-3 text-xs ${it.valid ? '' : 'opacity-70'}">
            <div class="flex flex-wrap items-center gap-2 mb-1">${TYPE[it.type] ? typeBadge(it.type) : ''}<span dir="ltr" class="font-mono text-white">“${esc(it.quote)}”</span>${it.valid ? '' : '<span class="cite-bad">بلا مرجع موثّق</span>'}</div>
            <div class="text-brand-textMuted">${escb(it.explanation || '')} ${it.valid && it.citation ? `<button data-open-term="${it.citation}" class="cite">${num(it.citation)}</button>` : ''}</div>
            ${it.suggestion ? `<div class="mt-1">البديل: <span dir="ltr" class="font-mono text-brand-emerald">${esc(it.suggestion)}</span></div>` : ''}</div>`).join('');
        const aiHtml = `<div class="flex flex-wrap gap-2 mb-2"><span class="lvl lvl-ai">صياغة الذكاء الاصطناعي — مقيّدة بالمصادر</span><span class="text-[10px] text-brand-textMuted">ثقة النموذج: ${({ high: 'مرتفعة', medium: 'متوسطة', low: 'منخفضة' })[v.confidence] || esc(v.confidence)}</span></div>
          <div>${body}</div>${issues}
          <div class="mt-2 text-[11px] ${v.removed.length ? 'text-rose-300' : 'text-emerald-300'}">${v.removed.length ? `⚠ حُذف ${v.removed.length} مرجع لم يُعثر عليه في القاعدة (تحقق آلي)` : '✓ تحقق آلي: كل المراجع موجودة في القاعدة الموثّقة'}</div>
          ${sourcesFooter(order)}
          ${v.refer ? referBtn('إحالة من الذكاء التوليدي', q.slice(0, 300), v.refer_reason) : ''}
          <details class="mt-3"><summary class="cursor-pointer text-[11px] text-brand-textMuted">عرض نص المصدر الحرفي</summary><div class="mt-2">${html}</div></details>`;
        html = aiHtml;
      } catch (err) {
        html = `<div class="text-[11px] text-amber-300 mb-2">تعذر الاتصال بالنموذج التوليدي، فعرضت الإجابة من المعجم مباشرة.</div>` + html;
      }
    }
    thinking.firstElementChild.innerHTML = html;
    log.scrollTop = log.scrollHeight;
    busy = false; $('#chatSend').disabled = false;
  }
  window.zilalAsk = ask;
  $('#chatForm').addEventListener('submit', (e) => { e.preventDefault(); const v = $('#chatInput').value; $('#chatInput').value = ''; ask(v); });
  $('#chatInput').addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#chatForm').requestSubmit(); } });
  $('#chatQuick').addEventListener('click', (e) => { const b = e.target.closest('[data-ask]'); if (b) ask(b.dataset.ask); });
  addMsg('bot', `<p>أهلًا بك 👋 أنا <strong>ظِلال</strong>. أجيب من <strong>${fmt(DB.terms.length)}</strong> مصطلحًا موثّقًا، ومع كل جواب رابط مصدره.</p><p class="text-brand-textMuted text-xs mt-1">اسألني عن مصطلح، أو الصق نصًا مترجمًا لأدققه. لا أفتي، ولا أترجم الآيات، وأعتذر حين لا أجد مرجعًا.</p>`);

  /* ===================== مدقق الترجمة ===================== */
  const EXAMPLES = {
    1: 'The legal commentary argued that marriage is based on male dominance over women, since qiwamah gives men control. Furthermore, it defined Sharia as a harsh penal code that enforces medieval law.',
    2: 'Western media accounts described the movement as a holy war aimed at conquest, citing a fatwa issued by a cleric as a death sentence. Some writers still call Muslims Mohammedans.',
    3: 'The author claimed that the hijab remains a symbol of oppression across the Muslim race, and that under Islamic rule dhimmis were second-class citizens.',
    4: 'To make Islam more appealing, the brochure explained that jihad means only an inner spiritual struggle, that zakat is a voluntary charity, and that Islam only forbids excessive interest.',
    5: 'Zakah is obligatory alms given to specific categories of people. Muslims are taught to have fear of Allah, and a fatwa is a non-binding religious opinion given by a qualified scholar.',
  };
  const auditInput = $('#auditInput');
  let lastAudit = null;
  const countWords = () => { const t = auditInput.value.trim(); $('#auditWords').textContent = `${t ? t.split(/\s+/).length : 0} كلمة`; };
  auditInput.addEventListener('input', countWords);
  $$('[data-example]').forEach((b) => b.addEventListener('click', () => { auditInput.value = EXAMPLES[b.dataset.example]; countWords(); runAudit(); }));
  $('#auditClear').addEventListener('click', () => { auditInput.value = ''; countWords(); $('#auditMapBox').classList.add('hidden'); resetGauge(); });
  $('#auditRun').addEventListener('click', runAudit);

  function resetGauge() {
    $('#gaugeNeedle').style.transform = 'rotate(0deg)';
    $('#scoreNumber').textContent = '--'; $('#scoreBar').style.width = '0%';
    $('#scoreBadge').textContent = 'جاهز للفحص'; $('#scoreBadge').className = 'text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300';
    ['cntTahweel', 'cntIsqat', 'cntTamyee'].forEach((id) => { $('#' + id).textContent = '0'; });
    $('#alertsCount').textContent = '0 رصد';
    $('#alertsContainer').innerHTML = '<div class="bg-slate-900/40 rounded-xl p-8 text-center border border-dashed border-white/10 text-brand-textMuted text-xs">لا توجد نتائج بعد. اختر مثالًا أو الصق نصك.</div>';
  }

  function runAudit() {
    const text = auditInput.value;
    if (!text.trim()) { auditInput.focus(); toast('أدخل نصًا إنجليزيًا أو اختر مثالًا'); return; }
    const dets = E.detect(text);
    const a = E.assess(dets);
    lastAudit = { text, dets };
    // خريطة الظلال + النص المقترح
    let map = '', adapted = '', pos = 0;
    dets.forEach((d, i) => {
      map += esc(text.slice(pos, d.index)) + `<span class="hl ${TYPE[d.type].hl}" data-jump="${i}" title="${esc(TYPE[d.type].ar + ' — ' + d.ar)}">${esc(d.match)}</span>`;
      adapted += esc(text.slice(pos, d.index)) + `<span class="hl-sug">[${esc(d.suggest)}]</span>`;
      pos = d.end;
    });
    map += esc(text.slice(pos)); adapted += esc(text.slice(pos));
    $('#auditMap').innerHTML = map;
    $('#auditAdapted').innerHTML = adapted;
    const ok = E.approvedHits(text, dets);
    $('#auditApproved').innerHTML = ok.length ? `<span class="text-[11px] text-brand-textMuted">ما أحسنت فيه الترجمة:</span>` + ok.map((h) => `<button data-open-term="${h.term || ''}" class="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">✓ <span dir="ltr">${esc(h.phrase)}</span> مطابق للمصدر</button>`).join('') : '';
    $('#auditMapBox').classList.remove('hidden');
    $('#auditDeepBox').classList.add('hidden');

    // الميزان والمؤشر
    $('#gaugeNeedle').style.transform = `rotate(${(-a.needle * 80).toFixed(1)}deg)`;
    $('#cntTahweel').textContent = a.counts.tahweel; $('#cntIsqat').textContent = a.counts.isqat; $('#cntTamyee').textContent = a.counts.tamyee;
    $('#scoreNumber').textContent = a.score; $('#scoreBar').style.width = a.score + '%';
    $('#scoreNumber').className = 'text-4xl font-bold ' + (!dets.length ? 'text-brand-emerald' : (a.score >= 70 ? 'text-brand-warning' : 'text-brand-danger'));
    const badge = $('#scoreBadge'), bar = $('#scoreBar'), desc = $('#scoreDescription');
    if (!dets.length) {
      bar.className = 'h-full bg-brand-emerald transition-all duration-700';
      badge.textContent = 'أمين'; badge.className = 'text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-brand-emerald';
      desc.textContent = 'لم يُرصد ظل معروف ضمن قواعد الرصد الحالية. هذا لا يعني خلو النص من كل خطأ؛ للمراجعة الأعمق استخدم التحليل التوليدي أو المختص.';
    } else if (a.score >= 70) {
      bar.className = 'h-full bg-brand-warning transition-all duration-700';
      badge.textContent = 'يحتاج مراجعة'; badge.className = 'text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-brand-warning';
      desc.textContent = a.needle > 0.3 ? 'يميل النص إلى التمييع: يضيّق المعنى الشرعي ليرضي القارئ.' : 'رُصدت صياغات تحمل إسقاطًا أو حكمًا قيميًا تحتاج إعادة توطين.';
    } else {
      bar.className = 'h-full bg-brand-danger transition-all duration-700';
      badge.textContent = 'ظلال كثيفة'; badge.className = 'text-xs font-bold px-2 py-0.5 rounded bg-rose-500/20 text-brand-danger';
      desc.textContent = a.needle > 0.3 ? 'تمييع واضح للمعنى الشرعي في أكثر من موضع.' : (a.needle < -0.3 ? 'تهويل وإسقاط متكرر يقدّم صورة منفّرة غير دقيقة.' : 'انحراف في الاتجاهين: تهويل في مواضع وتمييع في أخرى.');
    }
    $('#alertsCount').textContent = `${dets.length} رصد`;
    $('#alertsContainer').innerHTML = dets.length ? dets.map((d, i) => alertCard(d, i)).join('') : `
      <div class="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-6 text-center">
        <span class="text-3xl block mb-2">✅</span>
        <div class="text-brand-emerald font-bold text-sm mb-1">لم يُرصد ظل معروف</div>
        <p class="text-xs text-brand-textMuted">${ok.length ? 'والنص يستخدم صياغات مطابقة للمصدر.' : 'ضمن قواعد الرصد الحالية.'}</p>
      </div>`;
  }
  function alertCard(d, i) {
    const t = d.term ? E.term(d.term) : null;
    return `<div id="alert-${i}" class="bg-brand-card rounded-xl p-5 border border-brand-cardBorder border-r-4 ${TYPE[d.type].border} transition-shadow">
      <div class="flex items-start justify-between gap-3 mb-3">
        <div class="flex flex-wrap items-center gap-2"><span class="text-lg font-bold text-white">${esc(d.ar)}</span><span dir="ltr" class="font-mono text-xs text-rose-200 bg-slate-900 px-2 py-0.5 rounded border border-white/5">“${esc(d.match)}”</span></div>
        <div class="flex flex-col items-end gap-1 shrink-0">${typeBadge(d.type)}<span class="text-[10px] text-brand-textMuted">${SEV[d.sev]}</span></div>
      </div>
      <div class="mb-3"><div class="flex items-center gap-2 mb-1"><span class="text-xs font-bold text-slate-300">لماذا هذا ظل؟</span><span class="lvl lvl-analysis">تحليل ظلال</span>${d.specialist ? '<span class="lvl lvl-expert">يحتاج مختصًا</span>' : ''}</div><p class="text-xs text-slate-300 leading-relaxed">${escb(d.why)}</p></div>
      ${t ? `<div class="mb-3 rounded-lg bg-brand-darker/70 border border-white/5 p-3"><div class="flex items-center gap-2 mb-1"><span class="text-xs font-bold text-slate-300">تعريف المصدر</span><span class="lvl lvl-source">نص المصدر</span></div><p class="text-xs text-slate-200 leading-relaxed">«${esc(t.d)}»</p>${t.e ? `<p dir="ltr" class="text-left text-xs text-brand-emerald mt-1">${esc(t.e)}</p>` : ''}</div>`
        : `<p class="mb-3 text-[11px] text-amber-200/80">المصطلح غير وارد في الموسوعة المترجمة. <a class="underline text-sky-300" target="_blank" rel="noopener" href="${SRC.jamhara.search(d.fallback ? d.fallback.q : d.ar)}">تحقق في معجم الجمهرة ↗</a></p>`}
      <div class="text-xs mb-3">البديل المقترح: <span dir="ltr" class="font-mono font-bold text-brand-emerald">${esc(d.suggest)}</span></div>
      <div class="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/5 text-[11px]">
        ${t ? `<a href="${termUrl(t.i)}" target="_blank" rel="noopener" class="text-sky-300 hover:underline">المصدر: ${esc(SRC.terminologyenc.short)} · رقم ${t.i} ↗</a>` : '<span></span>'}
        <div class="flex items-center gap-2">
          <button data-refer-det="${i}" class="${d.specialist ? 'text-rose-300 font-bold' : 'text-slate-400'} hover:text-rose-200 underline">إحالة للمختص</button>
          <button data-apply="${i}" class="bg-brand-emerald/15 hover:bg-brand-emerald text-brand-emerald hover:text-brand-darker px-2.5 py-1 rounded font-bold transition-colors">تطبيق البديل</button>
        </div>
      </div></div>`;
  }
  $('#alertsContainer').addEventListener('click', (e) => {
    const ap = e.target.closest('[data-apply]');
    if (ap && lastAudit) {
      const d = lastAudit.dets[+ap.dataset.apply];
      if (auditInput.value.slice(d.index, d.end) === d.match) {
        auditInput.value = auditInput.value.slice(0, d.index) + d.suggest + auditInput.value.slice(d.end);
        countWords(); runAudit(); toast('طُبّق البديل في النص — راجع الصياغة قبل النشر');
      }
      return;
    }
    const rf = e.target.closest('[data-refer-det]');
    if (rf && lastAudit) {
      const d = lastAudit.dets[+rf.dataset.referDet];
      addReferral({ title: `${d.ar} — “${d.match}”`, context: d.sentence, reason: TYPE[d.type].ar + (d.specialist ? ' (حالة حساسة)' : '') });
      rf.textContent = '✓ أُحيل';
    }
  });
  $('#auditMap').addEventListener('click', (e) => {
    const j = e.target.closest('[data-jump]');
    if (!j) return;
    const card = $('#alert-' + j.dataset.jump);
    if (card) { card.scrollIntoView({ behavior: 'smooth', block: 'center' }); card.classList.add('ring-2', 'ring-brand-emerald'); setTimeout(() => card.classList.remove('ring-2', 'ring-brand-emerald'), 1400); }
  });
  $('#auditCopy').addEventListener('click', () => copy($('#auditAdapted').textContent, 'نُسخ النص مع البدائل المقترحة (الأصل لم يتغير)'));
  $('#auditDeep').addEventListener('click', async () => {
    if (!lastAudit) runAudit();
    if (!lastAudit) return;
    const btn = $('#auditDeep'); btn.disabled = true; btn.textContent = 'جارٍ التحليل…';
    const box = $('#auditDeepBox'); box.classList.remove('hidden');
    box.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
    const ids = [...new Set([...lastAudit.dets.map((d) => d.term).filter(Boolean), ...E.normEn(lastAudit.text).split(' ').map((w) => window.ZILAL_ALIASES[w]).filter(Boolean)])].slice(0, 8);
    try {
      const out = await callAI('audit', lastAudit.text, ids, lastAudit.dets);
      const v = validateAI(out.result || out, ids);
      const order = []; const num = (id) => { if (!order.includes(+id)) order.push(+id); return order.indexOf(+id) + 1; };
      box.innerHTML = `<div class="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
        <div class="flex items-center gap-2 mb-2"><span class="lvl lvl-ai">صياغة الذكاء الاصطناعي — مقيّدة بالمصادر</span></div>
        <div class="prose-zilal">${renderAIText(v.answer, num)}</div>
        ${v.issues.filter((it) => it.quote).map((it) => `<div class="mt-2 text-xs rounded-lg bg-white/5 p-2">${TYPE[it.type] ? typeBadge(it.type) : ''} <span dir="ltr" class="font-mono">“${esc(it.quote)}”</span> — ${escb(it.explanation || '')} ${it.valid ? '' : '<span class="cite-bad">بلا مرجع</span>'}</div>`).join('')}
        <div class="mt-2 text-[11px] ${v.removed.length ? 'text-rose-300' : 'text-emerald-300'}">${v.removed.length ? `⚠ حُذف ${v.removed.length} مرجع غير موجود في القاعدة` : '✓ كل المراجع موجودة في القاعدة'}</div>
        ${sourcesFooter(order)}</div>`;
    } catch (err) {
      box.innerHTML = '<div class="text-xs text-amber-300">تعذر الاتصال بالنموذج التوليدي. نتائج المحرك المحلي أعلاه صالحة ومستقلة عنه.</div>';
    } finally { btn.disabled = false; btn.textContent = 'تحليل معمّق بالذكاء التوليدي'; }
  });

  /* ===================== مختبر القياس ===================== */
  function runLab() {
    const res = E.runTests(window.ZILAL_TESTS, window.ZILAL_BASELINE_V0);
    const mm = res.metrics, raw = res.raw;
    const tile = (val, label, sub, color) => `<div class="card-glow rounded-2xl p-5"><div class="text-3xl font-bold ${color}">${val}</div><div class="text-sm text-white font-semibold mt-1">${label}</div><div class="text-[11px] text-brand-textMuted mt-1">${sub}</div></div>`;
    $('#labTiles').innerHTML =
      tile(mm.recallNew + '%', 'كشف التشويه', `${raw.distHitNew} من ${raw.dist} حالة · الإصدار السابق ${mm.recallBase}%`, 'text-brand-emerald') +
      tile(mm.falseAlarmNew + '%', 'الإنذار الكاذب', `على ${raw.ctrl} ترجمة سليمة · الإصدار السابق ${mm.falseAlarmBase}%`, 'text-sky-300') +
      tile(mm.exactNew + '%', 'دقة المفهوم ونوع الانحراف', 'تهويل / إسقاط / تمييع', 'text-amber-300') +
      tile(mm.botAcc + '%', 'سلوك البوت', `إجابة أو امتناع أو إحالة صحيحة · ${raw.bot} أسئلة`, 'text-white');
    $('#labTable').innerHTML = `<thead><tr class="text-slate-400 border-b border-white/10"><th class="py-2 px-2 text-right">الحالة</th><th class="py-2 px-2 text-right">النوع</th><th class="py-2 px-2 text-right">النص</th><th class="py-2 px-2 text-right">النتيجة</th><th class="py-2 px-2 text-right">المتوقع</th><th class="py-2 px-2 text-right">الإصدار السابق</th></tr></thead><tbody class="divide-y divide-white/5">` +
      res.rows.map((r) => `<tr class="${r.ok ? '' : 'bg-rose-500/5'}"><td class="py-2 px-2 font-mono">${r.ok ? '✓' : '✗'} ${esc(r.id)}</td><td class="py-2 px-2">${{ distortion: 'تشويه', control: 'سليم', bot: 'بوت' }[r.kind]}</td><td class="py-2 px-2 ${r.kind === 'bot' ? '' : 'font-mono'}" dir="${r.kind === 'bot' ? 'rtl' : 'ltr'}" style="text-align:${r.kind === 'bot' ? 'right' : 'left'}">${esc(r.text)}${r.note ? `<div class="text-amber-300 text-[10px]" dir="rtl">${esc(r.note)}</div>` : ''}</td><td class="py-2 px-2 font-mono" dir="ltr">${esc(r.got)}</td><td class="py-2 px-2 font-mono" dir="ltr">${esc(r.want)}</td><td class="py-2 px-2 font-mono text-slate-400" dir="ltr">${r.baseGot != null ? esc(r.baseGot) : '—'}</td></tr>`).join('') + '</tbody>';
    const draw = () => {
      if (!window.Chart) return setTimeout(draw, 200);
      const ctx = $('#labChart');
      if (runLab.chart) runLab.chart.destroy();
      runLab.chart = new window.Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['كشف التشويه (الأعلى أفضل)', 'الإنذار الكاذب (الأقل أفضل)'],
          datasets: [
            { label: 'الإصدار السابق (قبل الإسناد)', data: [mm.recallBase, mm.falseAlarmBase], backgroundColor: '#475569', borderRadius: 6 },
            { label: 'ظلال الحالي', data: [mm.recallNew, mm.falseAlarmNew], backgroundColor: '#1cc99b', borderRadius: 6 },
          ],
        },
        options: {
          indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          scales: { x: { min: 0, max: 100, ticks: { color: '#94a3b8', callback: (v) => v + '%' }, grid: { color: 'rgba(255,255,255,.05)' } }, y: { ticks: { color: '#fff', font: { family: 'IBM Plex Sans Arabic', weight: '600' } }, grid: { display: false } } },
          plugins: { legend: { position: 'bottom', labels: { color: '#cbd5e1', font: { family: 'IBM Plex Sans Arabic' } } }, tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${c.parsed.x}%` } } },
        },
      });
    };
    draw();
  }
  runLab();
  $('#labTryBtn').addEventListener('click', () => {
    const t = $('#labTry').value.trim();
    if (!t) return;
    const d = E.detect(t), b = E.baselineDetect(t, window.ZILAL_BASELINE_V0);
    $('#labTryOut').innerHTML = `
      <div class="rounded-lg bg-white/5 p-3"><div class="font-bold text-brand-emerald mb-1">ظلال الحالي</div>${d.length ? d.map((x) => `<div>${typeBadge(x.type)} <span dir="ltr" class="font-mono">“${esc(x.match)}”</span> ← ${esc(x.ar)}</div>`).join('') : '<div class="text-brand-textMuted">لا تنبيه</div>'}</div>
      <div class="rounded-lg bg-white/5 p-3"><div class="font-bold text-slate-300 mb-1">الإصدار السابق</div>${b.length ? b.map((x) => `<div dir="ltr" class="font-mono text-left">${esc(x.key)}: “${esc(x.match)}”</div>`).join('') : '<div class="text-brand-textMuted">لا تنبيه</div>'}</div>`;
  });
})();
