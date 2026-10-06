/* ظِلال — المحرك (يعمل في المتصفح وفي Node لتشغيل الاختبارات نفسها)
 * لا يعتمد على أي خدمة خارجية: البحث والرصد والتوجيه كلها محلية وقابلة للتحقق.
 */
(function (root) {
  'use strict';

  /* ===================== التطبيع ===================== */
  const AR_DIACRITICS = /[ً-ٰٟۖ-ۭـ]/g;

  function normAr(s) {
    return String(s || '')
      .replace(AR_DIACRITICS, '')
      .replace(/[إأآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه')
      .replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
      .replace(/[^؀-ۿa-zA-Z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }
  function stripAl(w) {
    if (w === 'الله' || w === 'لله') return w;
    let r = w;
    if (/^(و|ف|ب|ك)?ال/.test(r) && r.replace(/^(و|ف|ب|ك)?ال/, '').length >= 2) r = r.replace(/^(و|ف|ب|ك)?ال/, '');
    else if (/^لل/.test(r) && r.length >= 5) r = r.replace(/^لل/, '');
    return r;
  }
  function normEn(s) {
    return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase().replace(/[’‘'`ʿʾ"]/g, '')
      .replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  const isArabic = (s) => /[؀-ۿ]/.test(s);

  function lev(a, b) {
    if (Math.abs(a.length - b.length) > 1) return 9;
    const m = a.length, n = b.length;
    let prev = Array.from({ length: n + 1 }, (_, j) => j);
    for (let i = 1; i <= m; i++) {
      const cur = [i];
      for (let j = 1; j <= n; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      prev = cur;
    }
    return prev[n];
  }

  /* ===================== القاعدة والفهرسة ===================== */
  const Z = {
    db: null, byId: new Map(), shadows: [], shadowByTerm: new Map(), aliases: {}, compiled: [],
  };

  function init(db, shadows, aliases) {
    Z.db = db; Z.shadows = shadows || []; Z.aliases = aliases || {};
    Z.byId.clear(); Z.shadowByTerm.clear();
    for (const t of db.terms) {
      t._na = normAr(t.a);
      t._na2 = t._na.split(' ').map(stripAl).join(' ');
      t._ne = normEn(t.e);
      t._nd = normAr(t.d);
      t._nf = normEn(t.f);
      Z.byId.set(t.i, t);
    }
    Z.compiled = [];
    for (const s of Z.shadows) {
      if (s.term) Z.shadowByTerm.set(s.term, s);
      for (const r of s.rules) {
        Z.compiled.push({
          shadow: s, rule: r,
          re: new RegExp(r.re, 'gi'),
          ctx: r.ctx ? new RegExp(r.ctx, 'i') : null,
          notCtx: r.notCtx ? new RegExp(r.notCtx, 'i') : null,
        });
      }
    }
    return Z;
  }

  const term = (id) => Z.byId.get(+id) || null;
  const details = (id) => (Z.db && Z.db.details && Z.db.details[id]) || null;

  /* ===================== البحث ===================== */
  // كلمات الاستفهام والتوجيه تُحذف قبل البحث (على حدود الكلمات فقط)
  const AR_STOP = ['ما معنى', 'ما هو', 'ما هي', 'ما حكم', 'هل يجوز', 'لا يجوز', 'معنى', 'تعريف', 'عرف لي', 'عرف', 'اشرح', 'كلمة', 'كلمه', 'مصطلح', 'كيف اترجم', 'كيف نترجم', 'ترجمة', 'ترجمه', 'ترجم', 'الى الانجليزية', 'للانجليزية', 'بالانجليزي', 'بالانجليزية', 'الانجليزية', 'في الاسلام', 'شرعا', 'لو سمحت', 'ابي', 'ابغى', 'حكم', 'يجوز', 'يحل', 'يحرم', 'هل', 'ما', 'ماذا', 'كيف', 'لماذا', 'متى', 'اين', 'هو', 'هي', 'في', 'من', 'عن', 'على', 'الى', 'لي', 'لنا', 'ان', 'او', 'ثم', 'مع', 'هذا', 'هذه', 'ذلك', 'التي', 'الذي', 'اية', 'الاية', 'ايه', 'سورة', 'سوره', 'حديث', 'الحديث', 'شرح', 'اريد', 'بالعربي'];
  const EN_STOP = ['what is the meaning of', 'what is meant by', 'meaning of', 'what does', 'what is', 'what are', 'define', 'definition of', 'how to translate', 'how do i translate', 'translate', 'the term', 'the word', 'in islam', 'mean', 'means', 'please'];

  const AR_STOP_N = AR_STOP.map(normAr).sort((a, b) => b.length - a.length);
  function cleanQuery(q) {
    let s = ' ' + String(q || '').replace(/[؟?!.,،:«»"(){}﴿﴾]/g, ' ') + ' ';
    if (isArabic(s)) {
      s = ' ' + normAr(s) + ' ';
      for (const w of AR_STOP_N) { let prev; do { prev = s; s = s.split(' ' + w + ' ').join(' '); } while (s !== prev); }
    } else {
      s = ' ' + normEn(s) + ' ';
      for (const w of EN_STOP.sort((a, b) => b.length - a.length)) s = s.split(' ' + w + ' ').join(' ');
    }
    return s.replace(/\s+/g, ' ').trim();
  }

  function scoreTerm(t, qa, qa2, qe) {
    let s = 0;
    if (qa) {
      const words = t._na2.split(' ');
      if (t._na === qa || t._na2 === qa2 || t._na === qa2 || t._na2 === qa) s = 100;
      else if (words.length > 1 && (words[0] === qa2 || t._na2.startsWith(qa2 + ' '))) s = 82;
      else if (words.includes(qa2) && qa2.length >= 2) s = 66;
      else if (qa2.length >= 4 && words.some((w) => w.startsWith(qa2))) s = 70;
      else if (qa2.length >= 2 && words.some((w) => w.startsWith(qa2))) s = 42;
      else if (qa2.length >= 4 && t._na2.includes(qa2)) s = 55;
      else if (qa2.length >= 4 && words.length === 1 && lev(words[0], qa2) === 1) s = 40;
      else if (qa2.length >= 3 && t._nd.includes(qa2)) s = 22;
    }
    if (qe) {
      const words = t._ne.split(/[\s/-]+/);
      if (t._ne === qe || words.join(' ') === qe) s = Math.max(s, 95);
      else if (qe.length >= 3 && t._ne.startsWith(qe + ' ')) s = Math.max(s, 80);
      else if (qe.length >= 3 && words.includes(qe)) s = Math.max(s, 62);
      else if (qe.length >= 4 && words.some((w) => w.startsWith(qe))) s = Math.max(s, 58);
      else if (qe.length >= 5 && t._ne.includes(qe)) s = Math.max(s, 45);
      else if (qe.length >= 4 && (' ' + t._nf + ' ').includes(' ' + qe + ' ')) s = Math.max(s, 18);
    }
    if (s) {
      if (t.e) s += 3;
      if (Z.shadowByTerm.has(t.i)) s += 4;
    }
    return s;
  }

  function search(query, opts) {
    opts = opts || {};
    const limit = opts.limit || 20;
    const raw = String(query || '').trim();
    if (!raw || !Z.db) return [];
    const q = opts.raw ? raw : (cleanQuery(raw) || raw);
    const out = new Map();
    const add = (t, s, via) => { if (!t) return; const p = out.get(t.i); if (!p || p.score < s) out.set(t.i, { t, score: s, via }); };

    const qe = normEn(q);
    for (const tok of [qe, ...qe.split(' ')]) {
      const id = Z.aliases[tok.replace(/[^a-z]/g, '')];
      if (id) add(term(id), tok === qe ? 120 : 105, 'alias');
    }
    const qa = isArabic(q) ? normAr(q) : '';
    if (qa) {
      for (const tok of [qa, ...qa.split(' ')]) {
        const id = Z.aliases[stripAl(tok)] || Z.aliases[tok];
        if (id) add(term(id), tok === qa ? 115 : 100, 'alias');
      }
    }
    const qa2 = qa.split(' ').map(stripAl).join(' ');
    const qeOnly = isArabic(q) ? '' : qe;
    const cat = opts.category || '';
    for (const t of Z.db.terms) {
      if (cat && !t.c.includes(cat)) continue;
      const s = scoreTerm(t, qa, qa2, qeOnly);
      if (s) add(t, s, 'text');
    }
    // إن كان السؤال متعدد الكلمات ولم نجد تطابقًا قويًا، نجرب كل كلمة على حدة
    const best = Math.max(0, ...[...out.values()].map((r) => r.score));
    if (best < 80) {
      const toks = (qa ? qa2 : qe).split(' ').filter((w) => w.length >= 3);
      if (toks.length > 1) {
        for (const tok0 of toks) {
          // جذع بسيط لصيغ الجمع العربية: قوامون → قوام
          const variants = [tok0];
          if (qa) { const st = tok0.replace(/(ون|ين|ات)$/, ''); if (st !== tok0 && st.length >= 4) variants.push(st); }
          for (const tok of variants) {
            for (const t of Z.db.terms) {
              if (cat && !t.c.includes(cat)) continue;
              const s = qa ? scoreTerm(t, tok, tok, '') : scoreTerm(t, '', '', tok);
              if (s >= 60) add(t, s - 10, 'token');
            }
          }
        }
      }
    }
    return [...out.values()].sort((a, b) => b.score - a.score || a.t.a.length - b.t.a.length).slice(0, limit);
  }

  /* ===================== رصد الظلال ===================== */
  function sentenceAt(text, idx) {
    let s = idx, e = idx;
    while (s > 0 && !/[.!?\n؛]/.test(text[s - 1])) s--;
    while (e < text.length && !/[.!?\n؛]/.test(text[e])) e++;
    return text.slice(s, e);
  }
  const SEV_W = { high: 22, mid: 12, low: 5 };
  const SEV_RANK = { high: 3, mid: 2, low: 1 };

  function detect(text) {
    const found = [];
    const src = String(text || '');
    for (const c of Z.compiled) {
      c.re.lastIndex = 0;
      let m;
      while ((m = c.re.exec(src))) {
        if (!m[0]) { c.re.lastIndex++; continue; }
        const sent = sentenceAt(src, m.index);
        if (c.ctx && !c.ctx.test(sent)) continue;
        if (c.notCtx && c.notCtx.test(sent)) continue;
        found.push({
          key: c.shadow.key, term: c.shadow.term, ar: c.shadow.ar, suggest: c.shadow.suggest,
          fallback: c.shadow.fallback || null, reviewed: !!c.shadow.reviewed,
          type: c.rule.type, sev: c.rule.sev, why: c.rule.why, specialist: !!c.rule.specialist,
          match: m[0], index: m.index, end: m.index + m[0].length, sentence: sent.trim(),
        });
      }
    }
    // إزالة التداخل: نُبقي الأعلى خطورة ثم الأطول
    found.sort((a, b) => a.index - b.index || SEV_RANK[b.sev] - SEV_RANK[a.sev] || (b.end - b.index) - (a.end - a.index));
    const kept = [];
    for (const f of found) {
      const clash = kept.find((k) => f.index < k.end && k.index < f.end);
      if (!clash) kept.push(f);
      else if (SEV_RANK[f.sev] > SEV_RANK[clash.sev]) kept.splice(kept.indexOf(clash), 1, f);
    }
    return kept.sort((a, b) => a.index - b.index);
  }

  /* الصياغات المطابقة للمصدر: ما أحسنت فيه الترجمة */
  const GENERIC = new Set(['islam', 'muslim', 'muslims', 'community', 'nation', 'festival', 'lawful', 'destiny', 'eid', 'ramadan', 'allah']);
  function approvedHits(text, dets) {
    const t = ' ' + normEn(text) + ' ';
    const flagged = new Set((dets || detect(text)).map((d) => d.key));
    const hits = [];
    for (const s of Z.shadows) {
      if (flagged.has(s.key)) continue;
      for (const a of s.approved || []) {
        const n = normEn(a);
        if (GENERIC.has(n)) continue;
        if (n.length >= 4 && t.includes(' ' + n + ' ')) { hits.push({ key: s.key, term: s.term, ar: s.ar, phrase: a }); break; }
      }
    }
    return hits;
  }

  /* مؤشر السلامة + ميزان الأمانة */
  function assess(dets) {
    let score = 100, tah = 0, tam = 0;
    for (const d of dets) {
      score -= SEV_W[d.sev] || 5;
      if (d.type === 'tamyee') tam += SEV_W[d.sev]; else tah += SEV_W[d.sev];
    }
    score = Math.max(10, score);
    const total = tah + tam;
    const needle = total ? (tam - tah) / total : 0; // -1 تهويل/إسقاط … +1 تمييع
    const counts = { tahweel: 0, isqat: 0, tamyee: 0 };
    dets.forEach((d) => { counts[d.type] = (counts[d.type] || 0) + 1; });
    return { score, needle, tahweelWeight: tah, tamyeeWeight: tam, counts, specialist: dets.some((d) => d.specialist) };
  }

  /* ===================== توجيه أسئلة البوت ===================== */
  const RX_QURAN_TRANSLATE = /(ترجم|ترجمة|ترجمه|translate|translation|render)/i;
  const RX_QURAN_VERSE = /(آية|اية|آيه|الآية|سورة|سوره|verse|ayah|aya\b|surah|sura\b|﴿|\{)/i;
  const RX_FATWA = /(ما حكم|ماحكم|حكم\s|هل يجوز|يجوز\s|لا يجوز|حلال ام حرام|حلال أم حرام|هل يحل|هل يحرم|حرام\s?\?|is it (allowed|permissible|permitted|halal|haram|forbidden)|ruling on|what is the ruling|can a muslim)/i;

  function route(question) {
    const q = String(question || '').trim();
    const latinWords = (q.match(/[A-Za-z]+/g) || []).length;
    const sentences = q.split(/[.!?\n]+/).filter((x) => x.trim().length > 12).length;
    // في مساري الإحالة لا نعرض إلا مصطلحًا مطابقًا تمامًا أو مصطلحًا في معجم الظلال؛
    // لأن التطابق الجزئي قد يجلب لفظًا متشابه الرسم مختلف المعنى (مثل: النِّساء / النَّساء).
    const safeTerms = (rs) => rs.filter((r) => Z.shadowByTerm.has(r.t.i) || (r.score >= 95 && r.via !== 'token')).slice(0, 2);
    if (RX_QURAN_TRANSLATE.test(q) && RX_QURAN_VERSE.test(q)) return { route: 'quran_refer', terms: safeTerms(search(q, { limit: 6 })) };
    if (RX_FATWA.test(q)) return { route: 'fatwa_refer', terms: safeTerms(search(q, { limit: 6 })) };
    if (latinWords >= 14 || (sentences >= 2 && q.length > 120) || q.length > 280) return { route: 'audit', detections: detect(q) };
    const res = search(q, { limit: 5 });
    if (res.length && res[0].score >= 60) return { route: 'term', terms: res };
    return { route: 'refuse', terms: res.filter((r) => r.score >= 40) };
  }

  /* ===================== المختبر: الاختبار مقابل خط الأساس ===================== */
  function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function baselineDetect(text, baseline) {
    const out = [];
    for (const [key, pats] of Object.entries(baseline || {})) {
      for (const p of pats) if (new RegExp('\\b' + escRe(p) + '\\b', 'i').test(text)) out.push({ key, match: p });
    }
    return out;
  }

  function runTests(tests, baseline) {
    const rows = [];
    const m = { dist: 0, distHitNew: 0, distExactNew: 0, distHitBase: 0, ctrl: 0, faNew: 0, faBase: 0, bot: 0, botOk: 0 };
    for (const tc of tests) {
      if (tc.kind === 'bot') {
        const r = route(tc.text);
        const top = r.terms && r.terms[0] ? r.terms[0].t.i : null;
        const ok = r.route === tc.expect.route && (!tc.expect.term || top === tc.expect.term);
        m.bot++; if (ok) m.botOk++;
        rows.push({ id: tc.id, kind: tc.kind, text: tc.text, ok, got: r.route + (top ? ' → ' + top : ''), want: tc.expect.route + (tc.expect.term ? ' → ' + tc.expect.term : '') });
        continue;
      }
      const dn = detect(tc.text);
      const db = baselineDetect(tc.text, baseline);
      const gotKeys = dn.map((d) => d.key + ':' + d.type);
      if (tc.kind === 'distortion') {
        m.dist++;
        const hit = dn.length > 0;
        const exact = tc.expect.every((e) => gotKeys.includes(e));
        if (hit) m.distHitNew++;
        if (exact) m.distExactNew++;
        if (db.length) m.distHitBase++;
        rows.push({ id: tc.id, kind: tc.kind, text: tc.text, ok: exact, base: db.length > 0, got: gotKeys.join(', ') || '—', want: tc.expect.join(', '), baseGot: db.map((x) => x.match).join(', ') || '—', note: tc.note });
      } else {
        m.ctrl++;
        const fa = dn.length > 0, fab = db.length > 0;
        if (fa) m.faNew++;
        if (fab) m.faBase++;
        rows.push({ id: tc.id, kind: tc.kind, text: tc.text, ok: !fa, base: !fab, got: gotKeys.join(', ') || '—', want: 'لا تنبيه', baseGot: db.map((x) => x.match).join(', ') || '—', note: tc.note });
      }
    }
    const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
    return {
      rows, raw: m,
      metrics: {
        recallNew: pct(m.distHitNew, m.dist), exactNew: pct(m.distExactNew, m.dist), recallBase: pct(m.distHitBase, m.dist),
        falseAlarmNew: pct(m.faNew, m.ctrl), falseAlarmBase: pct(m.faBase, m.ctrl),
        botAcc: pct(m.botOk, m.bot), n: tests.length,
      },
    };
  }

  /* ألفاظ متشابهة الرسم بعد حذف التشكيل (للتنبيه على اختلاف المعنى) */
  function homographs(id) {
    const t = term(id);
    if (!t) return [];
    return Z.db.terms.filter((x) => x.i !== t.i && (x._na2 === t._na2 || x._na === t._na));
  }

  const api = { homographs, init, normAr, normEn, isArabic, cleanQuery, search, detect, approvedHits, assess, route, runTests, baselineDetect, term, details, state: Z };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.ZilalEngine = api;
})(typeof window !== 'undefined' ? window : globalThis);
