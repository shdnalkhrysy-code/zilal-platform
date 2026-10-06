// ظِلال — وظيفة سحابية تخفي مفتاح Gemini وتبني الطلب من سياق موثّق فقط
// المتغيرات: GEMINI_API_KEY (مطلوب) ، GEMINI_MODEL (اختياري؛ الافتراضي gemini-3.8-flash)
// المسار: /api/ask  —  GET للتحقق من الجاهزية، POST للسؤال أو التدقيق

const MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const MAX_TEXT = 4000;
const MAX_CTX = 8;

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

const TYPE_AR = { tahweel: 'تهويل', isqat: 'إسقاط', tamyee: 'تمييع' };
const json = (obj, status = 200) => new Response(JSON.stringify(obj), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
});
const str = (v, n) => String(v == null ? '' : v).slice(0, n);

function buildUserPrompt(task, text, context, hints) {
  const ctx = context.map((t) =>
    `[T:${t.i}] ${t.a}${t.e ? ' — ' + t.e : ''}\nالتعريف العربي (المصدر): ${t.d}${t.f ? '\nEnglish (source): ' + t.f : ''}\nالرابط: https://terminologyenc.com/ar/browse/term/${t.i}`).join('\n---\n');
  const h = hints.map((d) => `- «${d.match}» (${TYPE_AR[d.type] || d.type}) → ${d.suggest} [T:${d.term || '-'}]`).join('\n');
  return `المهمة: ${task === 'audit' ? 'تدقيق نص مترجم' : 'الإجابة عن سؤال'}\nالنص: """${text}"""\n\nالسياق الموثّق:\n${ctx || '(لا يوجد)'}\n${h ? '\nتنبيهات المحرك المحلي (للاستئناس):\n' + h : ''}`;
}

function parseJsonLoose(s) {
  const clean = String(s || '').trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  try { return JSON.parse(clean); } catch (e) {
    const a = clean.indexOf('{'), b = clean.lastIndexOf('}');
    if (a >= 0 && b > a) return JSON.parse(clean.slice(a, b + 1));
    throw e;
  }
}

export default async (req) => {
  const key = process.env.GEMINI_API_KEY;
  if (req.method === 'GET') return json({ ok: !!key, model: key ? MODEL : null });
  if (req.method !== 'POST') return json({ ok: false, error: 'method' }, 405);
  if (!key) return json({ ok: false, error: 'not-configured' }, 503);

  let body;
  try { body = await req.json(); } catch { return json({ ok: false, error: 'bad-json' }, 400); }
  const task = body.task === 'audit' ? 'audit' : 'ask';
  const text = str(body.text, MAX_TEXT).trim();
  if (!text) return json({ ok: false, error: 'empty' }, 400);
  // السياق يُقبل فقط كبيانات مصطلحات منظمة (لا تعليمات حرة) وبحد أقصى
  const context = (Array.isArray(body.context) ? body.context : []).slice(0, MAX_CTX)
    .filter((t) => Number.isInteger(t.i))
    .map((t) => ({ i: t.i, a: str(t.a, 120), e: t.e ? str(t.e, 160) : null, d: str(t.d, 900), f: t.f ? str(t.f, 900) : null }));
  const hints = (Array.isArray(body.hints) ? body.hints : []).slice(0, 12)
    .map((d) => ({ match: str(d.match, 80), type: str(d.type, 10), suggest: str(d.suggest, 80), term: Number.isInteger(d.term) ? d.term : null }));

  const payload = {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ role: 'user', parts: [{ text: buildUserPrompt(task, text, context, hints) }] }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 2048, responseMimeType: 'application/json' },
  };

  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify(payload),
    });
    const data = await r.json();
    if (!r.ok) return json({ ok: false, error: 'upstream', status: r.status, message: data?.error?.message || '' }, 502);
    const txt = (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('');
    const result = parseJsonLoose(txt);
    return json({ ok: true, model: MODEL, result });
  } catch (e) {
    return json({ ok: false, error: 'failed', message: String(e).slice(0, 200) }, 502);
  }
};

export const config = { path: '/api/ask' };
