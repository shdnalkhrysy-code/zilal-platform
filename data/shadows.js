/* ظِلال — معجم الظلال (طبقة التحليل)
 *
 * كل مدخل هنا هو «تحليل ظلال»: يرصد صياغة إنجليزية تحمل ظلًّا ثقافيًا،
 * ثم يحيل إلى التعريف الحرفي في المصدر المعتمد (term = رقم المصطلح في موسوعة المصطلحات المترجمة).
 *
 * أنواع الانحراف (ميزان الأمانة):
 *   tahweel  تهويل   — تضخيم سلبي أو حكم قيمي يُلصق بالمفهوم
 *   isqat    إسقاط   — استعارة مفهوم من ثقافة/دين آخر لا يطابق المصطلح
 *   tamyee   تمييع   — تضييق المعنى الشرعي أو تخفيفه إرضاءً للقارئ
 *
 * sev: high | mid | low
 * re : تعبير نمطي يُطابَق دون حساسية لحالة الأحرف
 * ctx: (اختياري) يجب أن يظهر في الجملة نفسها حتى يُعتمد الرصد — يقلل الإنذار الكاذب
 * notCtx: (اختياري) إذا ظهر في الجملة يُلغى الرصد
 * specialist: true = تُحال للمختص الشرعي قبل الاعتماد
 * reviewed: يُحدَّث إلى true بعد مراجعة المختص الشرعي في الفريق (انظر REVIEW_CHECKLIST.md)
 *
 * قاعدة صارمة: لا يُعدّ لفظٌ تشويهًا إذا كان هو نفسه ترجمة المصدر
 * (مثل: Fear of Allah للتقوى، Disobedience للنشوز، Usury للربا، Guardianship للقوامة).
 */
window.ZILAL_SHADOWS = [
  {
    key: 'jihad', term: 6778, ar: 'جهاد', suggest: 'jihad', approved: ['jihad', 'jihād'], reviewed: false,
    rules: [
      { label: 'Holy War', re: '\\bholy\\s+wars?\\b', type: 'isqat', sev: 'high',
        why: '«الحرب المقدسة» مفهوم مستعار من سياق تاريخي أوروبي، بينما يُبقي المصدر المصطلح بلفظه (Jihad) ويعرّفه اصطلاحًا بأنه «قتال المسلم للكافر المحارب».' },
      { label: 'only an inner / spiritual struggle', re: '\\b(only|merely|purely|just)\\b[^.]{0,40}\\b(inner|spiritual|personal)\\s+struggle\\b|\\b(inner|spiritual)\\s+struggle\\s+(only|alone)\\b',
        ctx: 'jihad', type: 'tamyee', sev: 'mid', specialist: true,
        why: 'حصر الجهاد في المجاهدة الروحية يخالف تعريفه الاصطلاحي في المصدر («قتال المسلم للكافر المحارب»)، وإن كان للفظ معنى لغوي أعم هو بذل الجهد بالقول والفعل.' },
    ],
  },
  {
    key: 'qiwamah', term: 7032, ar: 'قوامة', suggest: 'qiwamah (guardianship)', approved: ['guardianship', 'qiwamah', 'qiwāmah'], reviewed: false,
    rules: [
      { label: '(male) dominance / supremacy', re: '\\b(male\\s+)?(dominance|domination|supremacy)\\b',
        ctx: 'qiwam|guardian|husband|wives|marriage|men are|over women|over females|family', type: 'tahweel', sev: 'high',
        why: 'يُسقط معنى السيطرة والاستعلاء، بينما يعرّف المصدر القوامة بأنها «ولاية توجب على الشخص القيام على الشيء بما يُصلح شأنه بالتدبير والحفظ والصيانة»، ويترجمها Guardianship.' },
    ],
  },
  {
    key: 'fatwa', term: 114, ar: 'فتوى', suggest: 'fatwa (non-binding religious opinion)', approved: ['religious opinion', 'fatwa'], reviewed: false,
    rules: [
      { label: 'death sentence', re: '\\bdeath\\s+(sentence|warrant)s?\\b', ctx: 'fatwa|cleric|mufti', type: 'tahweel', sev: 'high',
        why: 'الفتوى في المصدر «الإخبار بالحكم الشرعي دون الإلزام به»؛ ووصفها بحكم إعدام يخلط بين الإفتاء والقضاء ويضخّم الدلالة.' },
      { label: 'edict / decree / binding ruling', re: '\\b(religious\\s+)?(edicts?|decrees?)\\b|\\bbinding\\s+(religious\\s+)?rulings?\\b', ctx: 'fatwa|mufti', type: 'isqat', sev: 'mid',
        why: '«Edict/Decree» يوحي بأمر سلطوي ملزم، والمصدر ينص على أن الفتوى إخبار بالحكم «دون الإلزام به»، ويترجمها Religious opinion.' },
    ],
  },
  {
    key: 'sharia', term: 47755, ar: 'شريعة', suggest: 'Shariah (Islamic law)', approved: ['islamic law', 'shariah', 'sharia'], reviewed: false,
    rules: [
      { label: 'medieval / draconian law, penal code', re: '\\b(medieval|draconian|barbaric|barbarous|primitive)\\s+(law|laws|code|legal code|justice)\\b|\\b(harsh\\s+)?penal\\s+codes?\\b',
        ctx: 'sharia|shariah|shari|islamic law', type: 'tahweel', sev: 'high',
        why: 'اختزال الشريعة في عقوبات موصوفة بأحكام قيمية؛ والمصدر يعرّفها بأنها «الطريقة الظاهرة في الدين من العقائد والأحكام والآداب» ويترجمها Islamic law.' },
    ],
  },
  {
    key: 'kufr', term: 7349, ar: 'كفر', suggest: 'disbeliever(s)', approved: ['disbelief', 'disbeliever', 'disbelievers'], reviewed: false,
    rules: [
      { label: 'infidel', re: '\\binfidels?\\b', type: 'isqat', sev: 'mid',
        why: '«Infidel» ارتبط باستعمال تاريخي عدائي في السياق الأوروبي؛ والمصدر يترجم الكفر Disbelief ويعرّفه بأنه «ضد الإسلام...»، فالأدق: disbeliever.' },
    ],
  },
  {
    key: 'zakat', term: 5070, ar: 'زكاة', suggest: 'zakah (obligatory alms)', approved: ['obligatory alms', 'zakah', 'zakat'], reviewed: false,
    rules: [
      { label: 'charity / voluntary giving', re: '\\b(charity|charities|voluntary\\s+(donation|giving|charity)|optional\\s+(donation|giving))\\b',
        ctx: 'zakat|zakah|zakaat', notCtx: 'sadaqa', type: 'tamyee', sev: 'high',
        why: '«Charity» في الإنجليزية تبرّع اختياري، والمصدر يترجم الزكاة Obligatory alms ويعرّفها بأنها «إخراج جزء مقدّر من أموال مخصوصة على صفة مخصوصة لطائفة مخصوصة من الناس» — فريضة مقدّرة لا تطوّع.' },
      { label: '(religious) tax', re: '\\b(religious\\s+)?tax(es)?\\b', ctx: 'zakat|zakah', type: 'isqat', sev: 'low',
        why: '«Tax» يوحي بجباية مدنية تفرضها الحكومة، والزكاة في المصدر عبادة مالية مقدّرة شرعًا لطائفة مخصوصة من الناس (Obligatory alms).' },
    ],
  },
  {
    key: 'riba', term: 6512, ar: 'ربا', suggest: 'riba (usury)', approved: ['usury', 'riba'], reviewed: false,
    rules: [
      { label: 'only excessive interest', re: '\\b(only|merely|just)\\b[^.]{0,30}\\b(excessive|exorbitant|exploitative|predatory|high)\\b[^.]{0,20}\\b(interest|rates?)\\b|\\b(excessive|exorbitant|exploitative|predatory)\\s+(interest|lending)\\s+(only|alone)\\b',
        ctx: 'riba|usury|interest|islam', type: 'tamyee', sev: 'high',
        why: 'المصدر يعرّف الربا بأنه «الزيادة المشروطة دون عِوَض مقابل الأجل في دين...»؛ فتقييد التحريم بالفائدة الفاحشة أو المستغِلّة تضييق لمعناه.' },
      { label: 'simple interest is permissible', re: '\\b(simple|moderate|low|reasonable)\\s+interest\\s+(is|are)\\s+(allowed|permitted|permissible|halal|fine|acceptable)\\b',
        ctx: 'riba|islam|muslim|shariah|sharia', type: 'tamyee', sev: 'high', specialist: true,
        why: 'تعريف المصدر للربا يشمل كل «زيادة مشروطة دون عوض مقابل الأجل في دين» دون تفريق بين قليلها وكثيرها؛ والحكم التفصيلي يُحال للمختص.' },
    ],
  },
  {
    key: 'jizyah', term: 6769, ar: 'جزية', suggest: 'jizyah', approved: ['jizyah', 'jizya'], reviewed: false,
    rules: [
      { label: 'extortion / protection racket', re: '\\b(extortion|protection\\s+racket|blackmail|ransom)\\b', ctx: 'jizya|jizyah', type: 'tahweel', sev: 'mid', specialist: true,
        why: 'المصدر يعرّف الجزية بأنها «ما تفرضه الدولة المسلمة من مال سنويًا على أفراد أهل الكتاب مقابل حمايتهم»؛ ووصفها بالابتزاز حكم قيمي لا ترجمة.' },
    ],
  },
  {
    key: 'dhimmi', term: 6644, ar: 'ذمي', suggest: 'dhimmi (protected non-Muslim)', approved: ['protected non-muslim', 'dhimmi'], reviewed: false,
    rules: [
      { label: 'second-class citizens', re: '\\bsecond[-\\s]class\\s+(citizens?|subjects?|status)\\b', ctx: 'dhimm|non-muslim|minorit|islamic (state|rule|law)|under islam', type: 'isqat', sev: 'mid', specialist: true,
        why: 'حكم قيمي حديث لا ترجمة؛ والمصدر يترجم الذمي Protected non-Muslim ويعرّفه بأنه «الكافر الذي له عهد من الإمام أو نائبه بالأمن على نفسه وماله وعرضه...».' },
    ],
  },
  {
    key: 'hudud', term: 778, ar: 'حدود', suggest: 'hudud (prescribed legal punishments)', approved: ['prescribed legal punishments', 'hudud', 'hudood'], reviewed: false,
    rules: [
      { label: 'barbaric / cruel punishments', re: '\\b(barbaric|barbarous|cruel|savage|medieval)\\s+(punishments?|penalties)\\b|\\bmutilation\\s+laws?\\b', ctx: 'hudud|hudood|sharia|shariah|islamic', type: 'tahweel', sev: 'mid',
        why: 'المصدر يعرّف الحدود بأنها «العقوبات المقدّرة شرعًا» ويترجمها Prescribed legal punishments؛ والأوصاف المضافة أحكام قيمية تتجاوز الترجمة.' },
    ],
  },
  {
    key: 'allah', term: 16760, ar: 'الله', suggest: 'Allah', approved: ['allah'], reviewed: false,
    rules: [
      { label: 'moon god', re: '\\bmoon[-\\s]god\\b', type: 'tahweel', sev: 'high',
        why: 'ادعاء استشراقي يربط لفظ الجلالة بوثنية قمرية، ويناقض تعريف المصدر: «الاسم الدال على الذات الإلهية الجامعة لجميع صفات الكمال والجلال والجمال الذي لا يستحق العبادة أحد سواه».' },
      { label: 'the Muslim god', re: '\\b(the\\s+)?(muslim|arab|arabian)\\s+god\\b', type: 'isqat', sev: 'mid',
        why: 'يوحي بإله خاص بالمسلمين أو العرب؛ والمصدر يعرّف لفظ الجلالة بأنه الاسم الدال على الذات الإلهية «الذي لا يستحق العبادة أحد سواه».' },
    ],
  },
  {
    key: 'imam', term: 1189, ar: 'إمام', suggest: 'imam', approved: ['imam', 'imām', 'prayer imam'], reviewed: false,
    rules: [
      { label: 'priest / clergy', re: '\\b(priests?|clergy(man|men)?|priesthood)\\b', ctx: 'imam|mosque|masjid|muslim|islam', type: 'isqat', sev: 'mid',
        why: 'الكهنوت مفهوم كنسي لا نظير له في الإسلام؛ والإمام في المصدر «الذي يتقدم المصلين لأجل الاقتداء به ومتابعته في الصلاة» (Prayer imām).' },
    ],
  },
  {
    key: 'madhhab', term: 4069, ar: 'مذهب', suggest: 'madhhab (school of jurisprudence)', approved: ['school of jurisprudence', 'madhhab', 'madhab'], reviewed: false,
    rules: [
      { label: 'sect', re: '\\bsects?\\b', ctx: 'madhhab|madhab|hanafi|maliki|shafi|hanbali|school of (law|jurisprudence)', type: 'isqat', sev: 'mid',
        why: 'المذهب في المصدر «مجموع الآراء الاجتهادية التي اختارها إمام معيّن وتبعه عليها أصحابه» — مدرسة فقهية، لا فرقة عقدية (Sect).' },
    ],
  },
  {
    key: 'quran', term: 53650, ar: 'القرآن', suggest: 'the Qur’an', approved: ['quran', 'qur’an', "qur'an", 'koran'], reviewed: false,
    rules: [
      { label: 'the Muslim Bible', re: '\\b(the\\s+)?(muslim|islamic)\\s+bible\\b|\\bbible\\s+of\\s+(islam|the\\s+muslims)\\b', type: 'isqat', sev: 'mid',
        why: 'يُسقط تصوّر كتاب تتعدد أسفاره وكُتّابه؛ والقرآن في المصدر «كلام الله تعالى المنزل على رسوله محمد ﷺ المتعبد بتلاوته...».' },
    ],
  },
  {
    key: 'islam', term: 43613, ar: 'الإسلام', suggest: 'Islam / Muslims', approved: ['islam', 'muslim', 'muslims'], reviewed: false,
    rules: [
      { label: 'Mohammedan(s)', re: '\\bmo?hamm?edan(s|ism)?\\b|\\bmuhammadan(s|ism)?\\b', type: 'isqat', sev: 'high',
        why: 'تسمية استشراقية قديمة توحي بأن المسلمين يعبدون النبي ﷺ؛ والإسلام في المصدر «الاستسلام لله بالتوحيد، والانقياد له بالطاعة، والبراءة من الشرك وأهله».' },
      { label: 'religion of the sword', re: '\\breligion\\s+of\\s+the\\s+sword\\b', type: 'tahweel', sev: 'high',
        why: 'وصف دعائي يختزل الإسلام في القتال؛ والمصدر يعرّف الإسلام بأنه «الاستسلام لله بالتوحيد، والانقياد له بالطاعة...».' },
    ],
  },
  {
    key: 'ummah', term: 43629, ar: 'أمة', suggest: 'ummah (community)', approved: ['community', 'ummah', 'nation'], reviewed: false,
    rules: [
      { label: 'the Muslim race', re: '\\b(the\\s+)?(muslim|islamic)\\s+race\\b', type: 'isqat', sev: 'mid',
        why: 'الأمة في المصدر «الجماعة العظيمة من الناس التي قد جمعها معنى أو وصف شامل لها كالدين»؛ فهي ليست عِرقًا.' },
    ],
  },
  {
    key: 'ramadan', term: 5135, ar: 'رمضان', suggest: 'Ramadan', approved: ['ramadan'], reviewed: false,
    rules: [
      { label: 'Islamic Lent', re: '\\b(muslim|islamic)\\s+lent\\b', type: 'isqat', sev: 'low',
        why: 'إسقاط لموسم صوم كنسي له طقوسه الخاصة؛ ورمضان في المصدر «الشهر التاسع من شهور السنة الهجرية».' },
    ],
  },
  {
    key: 'eid', term: 47805, ar: 'عيد', suggest: 'Eid', approved: ['eid', 'feast day', 'festival'], reviewed: false,
    rules: [
      { label: 'Muslim Christmas', re: '\\b(muslim|islamic)\\s+christmas\\b', type: 'isqat', sev: 'low',
        why: 'تشبيه بعيد ديني آخر يُسقط دلالاته؛ والعيد في المصدر «اسم لما يعود ويتكرر من الزمان، أو الاجتماع العام في مكان ما».' },
    ],
  },
  {
    key: 'jinn', term: 6776, ar: 'جن', suggest: 'jinn', approved: ['jinn'], reviewed: false,
    rules: [
      { label: 'demons', re: '\\bdemons?\\b', ctx: 'jinn|djinn', type: 'isqat', sev: 'mid',
        why: 'الجن في المصدر «مخلوقات مستترة عاقلة مكلّفة بالشرع...»؛ و«Demon» يدل على الشرير وحده، والمكلّفون منهم المؤمن والكافر.' },
      { label: 'genie', re: '\\bgenies?\\b', type: 'isqat', sev: 'low',
        why: 'صورة خرافية شعبية (genie) لا تطابق تعريف المصدر للجن.' },
    ],
  },
  {
    key: 'qadar', term: 16556, ar: 'قدر', suggest: 'qadar (predestination)', approved: ['destiny', 'predestination', 'qadar'], reviewed: false,
    rules: [
      { label: 'fatalism', re: '\\bfatalis(m|tic)\\b', ctx: 'qadar|destiny|predestin|tawakkul|islam|muslim', type: 'isqat', sev: 'mid',
        why: '«Fatalism» مذهب يُسقط أثر الإرادة والسعي؛ والقدر في المصدر «تدبير الله لما يقع في الكون حسب ما سبق به علمه وكتابته وحسب إرادته».' },
    ],
  },
  {
    key: 'sunnah', term: 71807, ar: 'سنة', suggest: 'Sunnah', approved: ['sunnah', 'prophetic way'], reviewed: false,
    rules: [
      { label: 'folklore / myths', re: '\\b(folklore|myths?|legends?|folk\\s+traditions?)\\b', ctx: 'sunnah|sunna|hadith|prophet', type: 'tahweel', sev: 'mid',
        why: 'السنة في المصدر «ما نُقل عن النبي ﷺ من قول أو فعل أو تقرير أو صفة...»؛ ووصفها بالأساطير حكم قيمي لا ترجمة.' },
    ],
  },
  {
    key: 'bidah', term: 46046, ar: 'بدعة', suggest: 'bid‘ah (religious innovation)', approved: ['religious innovation', 'bidah', 'bid‘ah'], reviewed: false,
    rules: [
      { label: 'rejects innovation / science', re: '\\b(rejects?|opposes?|forbids?|prohibits?|bans?)\\s+(all\\s+)?(innovation|new\\s+technology|progress|science)\\b', ctx: 'islam|muslim|bid', type: 'tahweel', sev: 'mid',
        why: 'البدعة في المصدر «كل ما أُحدث في الدين ولا دليل له من الشرع من الاعتقادات والعبادات» — فهي خاصة بالدين لا بالمخترعات الدنيوية.' },
      { label: 'heresy', re: '\\bheres(y|ies)\\b', ctx: "bid'?ah|bidah|bid‘ah|innovation", type: 'isqat', sev: 'low',
        why: '«Heresy» مصطلح كنسي؛ والمصدر يترجم البدعة Religious innovation.' },
    ],
  },
  {
    key: 'hijab', term: null, ar: 'حجاب', suggest: 'hijab', approved: ['hijab'], reviewed: false,
    fallback: { source: 'jamhara', q: 'حجاب' },
    rules: [
      { label: 'symbol of oppression', re: '\\bsymbols?\\s+of\\s+(oppression|subjugation|submission)\\b', ctx: 'hijab|veil|headscarf|niqab|covering', type: 'tahweel', sev: 'mid',
        why: 'حكم قيمي يُلصق بالحجاب ولا يُعدّ ترجمة له. (لم يرد مصطلح «حجاب» في موسوعة المصطلحات المترجمة؛ راجع معجم الجمهرة.)' },
    ],
  },
  {
    key: 'halal', term: null, ar: 'حلال', suggest: 'halal', approved: ['halal', 'lawful'], reviewed: false,
    fallback: { source: 'jamhara', q: 'حلال' },
    rules: [
      { label: 'kosher', re: '\\bkosher\\b', ctx: 'halal|islam|muslim', type: 'isqat', sev: 'low',
        why: '«Kosher» مصطلح من الشريعة اليهودية له أحكامه الخاصة، فلا يُستعمل مرادفًا للحلال. (المصطلح غير وارد في الموسوعة المترجمة؛ راجع معجم الجمهرة.)' },
    ],
  },
];

/* أسماء صوتية شائعة → رقم المصطلح في المصدر (للبحث والبوت) */
window.ZILAL_ALIASES = {
  tawhid: 10482, tawheed: 10482, shirk: 4062, zakat: 5070, zakah: 5070, riba: 6512, usury: 6512,
  jihad: 6778, qiwamah: 7032, qiwama: 7032, fatwa: 114, fatwas: 114, sharia: 47755, shariah: 47755,
  sunnah: 71807, sunna: 71807, imam: 1189, madhhab: 4069, madhab: 4069, jinn: 6776, djinn: 6776,
  qadar: 16556, ummah: 43629, umma: 43629, hudud: 778, hudood: 778, jizya: 6769, jizyah: 6769,
  dhimmi: 6644, kufr: 7349, kafir: 7349, taqwa: 10399, bidah: 46046, nushuz: 6719, ibadah: 15008,
  iman: 46045, islam: 43613, quran: 53650, koran: 53650, salah: 5720, salat: 5720, sawm: 6945,
  siyam: 6945, ramadan: 5135, eid: 47805, dua: 14981, wudu: 6733, masjid: 8984, mosque: 8984,
  ijtihad: 75221, fiqh: 31690, takfir: 5897, riddah: 6520, ridda: 6520, qisas: 7016, rajm: 6519,
  talaq: 1164, mahr: 7082, jannah: 10674, shaytan: 5714, wilayah: 7142, allah: 16760, imamah: 43624,
  fitnah: 63, fitna: 63, haram: 779, ihsan: 16770, niyyah: 6880, niyya: 6880,
  // مرادفات عربية (تُطابق بعد التطبيع وحذف «ال»)
  'صيام': 6945, 'صوم': 6945,
};
