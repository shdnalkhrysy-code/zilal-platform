// يولّد REVIEW_CHECKLIST.md من data/shadows.js — شغّله بعد أي تعديل على قواعد الظلال
import fs from 'node:fs';
import vm from 'node:vm';
const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync('data/shadows.js', 'utf8'), ctx);
const TYPE = { tahweel: 'تهويل', isqat: 'إسقاط', tamyee: 'تمييع' };
let md = `# قائمة المراجعة الشرعية لقواعد الظلال

> تُعرض هذه القائمة على المختص الشرعي في الفريق، أو على المرشد الشرعي خلال ساعات الإرشاد، قبل الاعتماد.
> بعد اعتماد أي مدخل، غيّر \`reviewed: false\` إلى \`reviewed: true\` في \`data/shadows.js\`، ثم أعد توليد هذه القائمة:
> \`node tools/make-checklist.mjs\`

**المطلوب من المراجع في كل قاعدة:**
1. هل الصياغة الإنجليزية المرصودة تحمل فعلًا الظل المذكور (تهويل / إسقاط / تمييع)؟
2. هل الشرح لا يتجاوز تعريف المصدر، ولا يجمّل المعنى ولا يشوّهه؟
3. هل البديل المقترح دقيق؟
4. هل تحتاج القاعدة إلى وسم «يحتاج مختصًا»؟

| # | المصطلح | الصياغة المرصودة | النوع | تعريف المصدر | البديل المقترح | يحتاج مختصًا | اعتُمد؟ | ملاحظات المراجع |
|---|---|---|---|---|---|---|---|---|
`;
let n = 0;
for (const s of ctx.window.ZILAL_SHADOWS) {
  for (const r of s.rules) {
    n++;
    const link = s.term ? `[رقم ${s.term}](https://terminologyenc.com/ar/browse/term/${s.term})` : 'غير وارد (الجمهرة)';
    md += `| ${n} | ${s.ar} | \`${r.label}\` | ${TYPE[r.type]} | ${link} | \`${s.suggest}\` | ${r.specialist ? 'نعم' : '—'} | ${s.reviewed ? '✅' : '☐'} | |\n`;
  }
}
md += `\n**المجموع:** ${n} قاعدة في ${ctx.window.ZILAL_SHADOWS.length} مصطلحًا.\n\n## نص الشرح لكل قاعدة\n\n`;
n = 0;
for (const s of ctx.window.ZILAL_SHADOWS) for (const r of s.rules) { n++; md += `**${n}. ${s.ar} — ${r.label} (${TYPE[r.type]})**\n${r.why}\n\n`; }
fs.writeFileSync('REVIEW_CHECKLIST.md', md);
console.log('✓ REVIEW_CHECKLIST.md —', n, 'قاعدة');
