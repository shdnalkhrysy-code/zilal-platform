/* ظِلال — سكربت سحب قاعدة المصطلحات من موسوعة المصطلحات والقواميس الإسلامية المترجمة
 *
 * طريقة التشغيل (مرة واحدة عند تحديث البيانات):
 *   1) افتح https://terminologyenc.com/ar في المتصفح.
 *   2) افتح أدوات المطور (F12) ← Console، والصق هذا الملف كاملًا ثم Enter.
 *   3) سيُنزَّل ملف zilal-terms.json، ثم شغّل:  node tools/build-data.mjs zilal-terms.json
 *
 * مبادئ السحب:
 *   - طلبان فقط لكل تصنيف (عربي + إنجليزي) مع فاصل زمني، وتفاصيل موسعة لمصطلحات معجم الظلال فقط.
 *   - النصوص تُنقل كما هي دون تعديل. يُستبعد فقط ما ثبت أنه قيمة غير مطابقة في المصدر
 *     (ظهرت كلمة «Tījāniyyah» مكان بعض التعريفات الإنجليزية) ويُسجَّل عددها في meta.
 */
(async () => {
  const CATS = [[1, 'القرآن الكريم وعلومه'], [2, 'الحديث وعلومه'], [3, 'العقيدة'], [4, 'الفقه وأصوله'], [5, 'الفضائل والآداب'], [6, 'الدعوة والحسبة'], [7, 'السيرة والتاريخ'], [755, 'أخرى'], [758, 'الأسماء الحسنى'], [760, 'الفرق والأديان']];
  // معرّفات مصطلحات معجم الظلال والأسماء البديلة (تُجلب لها التفاصيل الموسعة)
  const DETAIL_IDS = [6778, 7032, 114, 47755, 7349, 6644, 8656, 5070, 6512, 6769, 778, 43629, 779, 71807, 16760, 1189, 43624, 31690, 4069, 6776, 5720, 10399, 10482, 4062, 6945, 5135, 47805, 53650, 14982, 14907, 7142, 46046, 14981, 5714, 16556, 43613, 46045, 6719, 63, 7463, 10781, 6520, 5897, 75221, 6519, 7016, 1164, 7082, 8659, 15008, 6427, 7139, 6733, 10674, 8984];
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const isGlitch = (s) => !!s && /^\s*T[iī]j[aā]niyyah\s*$/i.test(s);

  const parse = (html) => {
    const d = new DOMParser().parseFromString(html, 'text/html');
    return [...d.querySelectorAll('.term_cont')].map((b) => {
      const a = b.querySelector('dt a[href*="/browse/term/"]');
      if (!a) return null;
      return { id: (a.getAttribute('href').match(/term\/(\d+)/) || [])[1], title: a.textContent.trim(), def: (b.querySelector('dd p')?.textContent || '').trim(), langs: [...b.querySelectorAll('.label')].length };
    }).filter(Boolean);
  };

  const all = {};
  for (const [cid, cname] of CATS) {
    const ar = parse(await fetch('/ar/browse/category/' + cid).then((r) => r.text())); await sleep(400);
    const en = parse(await fetch('/en/browse/category/' + cid).then((r) => r.text())); await sleep(400);
    const enMap = Object.fromEntries(en.map((x) => [x.id, x]));
    for (const x of ar) {
      const e = enMap[x.id];
      const enTitle = e ? e.title.replace(/\s+-\s+[^-]*[؀-ۿ][^-]*$/, '').trim() : null;
      if (!all[x.id]) all[x.id] = { i: +x.id, a: x.title, d: x.def || null, e: enTitle, f: e ? e.def : null, c: [cname], n: e ? e.langs : x.langs };
      else if (!all[x.id].c.includes(cname)) all[x.id].c.push(cname);
    }
    console.log('✓', cname, ar.length);
  }
  let glitches = 0;
  const terms = Object.values(all).map((t) => { if (isGlitch(t.f)) { t.f = null; glitches++; } return t; }).sort((a, b) => a.i - b.i);

  const details = {};
  for (const id of DETAIL_IDS) {
    const d = new DOMParser().parseFromString(await fetch('/ar/browse/term/' + id).then((r) => r.text()), 'text/html');
    const f = {};
    d.querySelectorAll('[data-det]').forEach((btn) => {
      const [tid, field, lang] = btn.getAttribute('data-det').split('/');
      if (tid !== String(id) || !['ar', 'en'].includes(lang)) return;
      const c = btn.parentElement.cloneNode(true); c.querySelectorAll('button,.label').forEach((x) => x.remove());
      (f[field] ||= {})[lang] = c.textContent.replace(/\s+/g, ' ').trim();
    });
    const clean = (o) => (o ? { ar: o.ar || null, en: isGlitch(o.en) ? null : (o.en || null) } : null);
    const path = [...new Set([...d.querySelectorAll('a[href*="/browse/category/"]')].map((a) => a.textContent.trim()).filter((t) => t && !/^(العربية|English|Français|Español|Türkçe|اردو|Indonesia|Bosanski|Русский|中文)$/.test(t)))].slice(0, 4);
    details[id] = { title: clean(f.title), idio: clean(f.idio_def), expl: clean(f.brief_expl), ling: clean(f.brief_ling_def), root: f.root?.ar || null, path };
    await sleep(300);
  }

  const payload = {
    meta: {
      source: 'موسوعة المصطلحات والقواميس الإسلامية المترجمة', source_url: 'https://terminologyenc.com',
      term_url: 'https://terminologyenc.com/ar/browse/term/{id}', term_url_en: 'https://terminologyenc.com/en/browse/term/{id}',
      fetched_at: new Date().toISOString(), count: terms.length, with_english: terms.filter((t) => t.e).length, glitches_removed: glitches,
      note: 'النصوص منقولة كما هي من المصدر دون تعديل؛ أُزيلت قيم إنجليزية غير مطابقة (Tījāniyyah) ظهرت في المصدر لبعض التعريفات.',
    },
    terms, details,
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload)], { type: 'application/json' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: 'zilal-terms.json' });
  document.body.appendChild(a); a.click(); a.remove();
  console.log(`✓ ${terms.length} مصطلحًا (${payload.meta.with_english} بالإنجليزية) — استُبعدت ${glitches} قيمة غير مطابقة`);
})();
