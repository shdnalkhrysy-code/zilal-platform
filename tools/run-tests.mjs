// ظِلال — تشغيل مجموعة الاختبار من سطر الأوامر (نفس المحرك الذي يعمل في الصفحة)
// الاستخدام:  node tools/run-tests.mjs
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const ctx = { window: {}, console };
ctx.globalThis = ctx;
vm.createContext(ctx);
for (const f of ['data/terms.js', 'data/shadows.js', 'data/tests.js', 'assets/engine.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
}
const W = ctx.window;
const E = W.ZilalEngine;
E.init(W.ZILAL_DB, W.ZILAL_SHADOWS, W.ZILAL_ALIASES);

const res = E.runTests(W.ZILAL_TESTS, W.ZILAL_BASELINE_V0);
const m = res.metrics;
console.log(`\nقاعدة المصطلحات: ${W.ZILAL_DB.terms.length} مصطلحًا | قواعد الظلال: ${E.state.compiled.length}\n`);
for (const r of res.rows) {
  const mark = r.ok ? '✓' : '✗';
  console.log(`${mark} ${r.id.padEnd(4)} ${r.kind.padEnd(10)} got=${r.got}  want=${r.want}${r.baseGot !== undefined ? '  | v0=' + r.baseGot : ''}`);
}
console.log(`
النتائج (${m.n} حالة):
  كشف التشويه (أي تنبيه):      ظلال ${m.recallNew}%   | الإصدار السابق ${m.recallBase}%
  الرصد الدقيق (المفهوم+النوع): ظلال ${m.exactNew}%
  الإنذار الكاذب على السليم:    ظلال ${m.falseAlarmNew}%   | الإصدار السابق ${m.falseAlarmBase}%
  سلوك البوت (توجيه/امتناع):    ${m.botAcc}%
`);
// تحقق: كل مدخل ظل يشير إلى مصطلح موجود في القاعدة
const missing = W.ZILAL_SHADOWS.filter((s) => s.term && !E.term(s.term)).map((s) => s.key);
const aliasMissing = Object.entries(W.ZILAL_ALIASES).filter(([, id]) => !E.term(id)).map(([k]) => k);
console.log(missing.length ? `✗ مداخل ظل تشير لمصطلحات غير موجودة: ${missing}` : '✓ كل مداخل الظل مرتبطة بمصطلح موجود في القاعدة');
console.log(aliasMissing.length ? `✗ أسماء بديلة بلا مصطلح: ${aliasMissing}` : '✓ كل الأسماء البديلة مرتبطة بمصطلحات موجودة');
const noUrl = W.ZILAL_DB.terms.filter((t) => !t.i).length;
console.log(noUrl ? `✗ ${noUrl} مصطلح بلا معرّف/رابط` : '✓ كل مصطلح له معرّف ورابط في المصدر');
