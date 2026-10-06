// ظِلال — تحويل ملف السحب (zilal-terms.json) إلى data/terms.js مع التحقق من سلامته
// الاستخدام:  node tools/build-data.mjs path/to/zilal-terms.json
import fs from 'node:fs';
import path from 'node:path';

const src = process.argv[2] || 'zilal-terms.json';
const out = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../data/terms.js');
const raw = JSON.parse(fs.readFileSync(src, 'utf8'));

const problems = [];
const seen = new Set();
const terms = [];
for (const t of raw.terms) {
  if (!Number.isInteger(t.i) || t.i <= 0) { problems.push(`معرّف غير صالح: ${JSON.stringify(t).slice(0, 80)}`); continue; }
  if (seen.has(t.i)) continue;
  seen.add(t.i);
  if (!t.a || !t.d) { problems.push(`مصطلح بلا عنوان أو تعريف عربي: ${t.i}`); continue; }
  terms.push({ i: t.i, a: t.a.trim(), d: t.d.trim(), e: t.e ? t.e.trim() : null, f: t.f ? t.f.trim() : null, c: t.c, n: t.n || 0 });
}
terms.sort((a, b) => a.i - b.i);

const meta = {
  ...raw.meta,
  count: terms.length,
  with_english: terms.filter((t) => t.e).length,
  built_at: new Date().toISOString(),
  categories: [...new Set(terms.flatMap((t) => t.c))],
};

const body = `/* ظِلال — قاعدة المصطلحات الموثقة
 * المصدر: ${meta.source} (${meta.source_url})
 * تاريخ السحب: ${meta.fetched_at}
 * عدد المصطلحات: ${meta.count} — منها ${meta.with_english} بترجمة إنجليزية
 * النصوص منقولة حرفيًا دون تعديل، ولكل مصطلح رابطه في المصدر:
 *   ${meta.term_url}
 * أُنشئ الملف آليًا بواسطة tools/build-data.mjs — لا تعدّله يدويًا.
 */
window.ZILAL_DB = ${JSON.stringify({ meta, terms, details: raw.details || {} })};
`;
fs.writeFileSync(out, body);
console.log(`✓ ${terms.length} مصطلحًا → ${out} (${(Buffer.byteLength(body) / 1024).toFixed(0)} KB)`);
console.log(`  بترجمة إنجليزية: ${meta.with_english} | تفاصيل موسعة: ${Object.keys(raw.details || {}).length} | قيم مصدرية مستبعدة: ${meta.glitches_removed ?? 0}`);
if (problems.length) console.log(`  تنبيهات (${problems.length}):\n  - ` + problems.slice(0, 10).join('\n  - '));
