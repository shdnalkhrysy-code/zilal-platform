/* ظِلال — مجموعة الاختبار الداخلية (بيانات اصطناعية بالكامل، لا تحتوي بيانات مستفيدين)
 *
 * kind:
 *   distortion — نص فيه ظل يجب رصده (expect = مفاتيح متوقعة بصيغة key:type)
 *   control    — ترجمة سليمة يجب ألا يُنبَّه عليها (يقيس الإنذار الكاذب)
 *   bot        — سؤال للبوت مع المسار المتوقع (term / fatwa_refer / quran_refer / refuse)
 *
 * تنبيه منهجي: صاغ الفريق هذه الحالات أثناء التطوير، فهي اختبار انحدار داخلي
 * وليست تقييمًا مستقلًا. الحالة H2 مدرجة عمدًا لأنها قيد معروف في المحرك.
 */
window.ZILAL_TESTS = [
  // ——— حالات تشويه (تهويل / إسقاط / تمييع) ———
  { id: 'D01', kind: 'distortion', text: 'The movement described its campaign as a holy war against the West.', expect: ['jihad:isqat'] },
  { id: 'D02', kind: 'distortion', text: 'The cleric issued a fatwa that was reported as a death sentence for the novelist.', expect: ['fatwa:tahweel'] },
  { id: 'D03', kind: 'distortion', text: 'A fatwa is a binding religious edict that every Muslim must obey.', expect: ['fatwa:isqat'] },
  { id: 'D04', kind: 'distortion', text: 'The commentary claimed that qiwamah establishes male dominance over women.', expect: ['qiwamah:tahweel'] },
  { id: 'D05', kind: 'distortion', text: 'Critics describe Sharia as a medieval law that knows only punishment.', expect: ['sharia:tahweel'] },
  { id: 'D06', kind: 'distortion', text: 'In Western media, Shariah is often reduced to a harsh penal code.', expect: ['sharia:tahweel'] },
  { id: 'D07', kind: 'distortion', text: 'The preacher warned the infidels about the Day of Judgment.', expect: ['kufr:isqat'] },
  { id: 'D08', kind: 'distortion', text: 'Muslims pay zakat as a voluntary charity whenever they wish.', expect: ['zakat:tamyee'] },
  { id: 'D09', kind: 'distortion', text: 'Zakat is basically a religious tax collected by the state.', expect: ['zakat:isqat'] },
  { id: 'D10', kind: 'distortion', text: 'Islam only forbids excessive interest, so riba does not include moderate rates.', expect: ['riba:tamyee'] },
  { id: 'D11', kind: 'distortion', text: 'Some argue that in Islam simple interest is permissible and is not riba.', expect: ['riba:tamyee'] },
  { id: 'D12', kind: 'distortion', text: 'Historians framed the jizya as an extortion imposed on minorities.', expect: ['jizyah:tahweel'] },
  { id: 'D13', kind: 'distortion', text: 'Under Islamic rule, dhimmis were second-class citizens.', expect: ['dhimmi:isqat'] },
  { id: 'D14', kind: 'distortion', text: 'Hudud are barbaric punishments from a medieval past.', expect: ['hudud:tahweel'] },
  { id: 'D15', kind: 'distortion', text: 'Some orientalists claimed that Allah was originally a moon god.', expect: ['allah:tahweel'] },
  { id: 'D16', kind: 'distortion', text: 'The Muslim god is different from the God worshipped by others.', expect: ['allah:isqat'] },
  { id: 'D17', kind: 'distortion', text: 'The local priest of the mosque led the Friday prayer.', expect: ['imam:isqat'] },
  { id: 'D18', kind: 'distortion', text: 'The Hanafi sect and the Maliki sect differ on this ruling.', expect: ['madhhab:isqat'] },
  { id: 'D19', kind: 'distortion', text: 'Muslims revere the Koran as their Muslim Bible.', expect: ['quran:isqat'] },
  { id: 'D20', kind: 'distortion', text: 'Early travel writers called the followers of the faith Mohammedans.', expect: ['islam:isqat'] },
  { id: 'D21', kind: 'distortion', text: 'Ramadan is often described as the Islamic Lent.', expect: ['ramadan:isqat'] },
  { id: 'D22', kind: 'distortion', text: 'Eid al-Fitr is basically the Muslim Christmas.', expect: ['eid:isqat'] },
  { id: 'D23', kind: 'distortion', text: 'Folk tales describe the jinn as demons that haunt ruins.', expect: ['jinn:isqat'] },
  { id: 'D24', kind: 'distortion', text: 'Belief in qadar makes Muslims fatalistic and passive.', expect: ['qadar:isqat'] },
  { id: 'D25', kind: 'distortion', text: 'The writer dismissed the Sunnah as mere folklore.', expect: ['sunnah:tahweel'] },
  { id: 'D26', kind: 'distortion', text: "Because of bid'ah, Islam rejects innovation and new technology.", expect: ['bidah:tahweel'] },
  { id: 'D27', kind: 'distortion', text: 'The hijab is a symbol of oppression imposed on women.', expect: ['hijab:tahweel'] },
  { id: 'D28', kind: 'distortion', text: 'Halal meat is simply the Muslim version of kosher food.', expect: ['halal:isqat'] },
  { id: 'D29', kind: 'distortion', text: 'Jihad means only an inner spiritual struggle and nothing else.', expect: ['jihad:tamyee'] },
  { id: 'D30', kind: 'distortion', text: 'The pamphlet called Islam a religion of the sword.', expect: ['islam:tahweel'] },
  { id: 'D31', kind: 'distortion', text: 'The Muslim race follows sharia, a draconian law, and pays zakat as charity.', expect: ['ummah:isqat', 'sharia:tahweel', 'zakat:tamyee'] },
  // ——— حالات صعبة: صياغات غير مباشرة يُتوقع أن يفوتها المحرك المحلي (مدرجة عمدًا لبيان حدوده) ———
  { id: 'H03', kind: 'distortion', note: 'صياغة غير مباشرة للتمييع — خارج قواعد الرصد الحالية', text: 'Zakat is a gift that Muslims may choose to give if they like.', expect: ['zakat:tamyee'] },
  { id: 'H04', kind: 'distortion', note: 'صياغة غير مباشرة للتهويل — خارج قواعد الرصد الحالية', text: 'Jihad is basically a war to force people into the faith.', expect: ['jihad:tahweel'] },
  { id: 'H05', kind: 'distortion', note: 'صياغة غير مباشرة للإسقاط — خارج قواعد الرصد الحالية', text: 'A fatwa is an order that all Muslims are legally bound to carry out.', expect: ['fatwa:isqat'] },

  // ——— ترجمات سليمة (يجب ألا يُنبَّه عليها) ———
  { id: 'C01', kind: 'control', text: 'The Qur’an commands believers to have fear of Allah (taqwa) by obeying His commands and avoiding His prohibitions.' },
  { id: 'C02', kind: 'control', text: 'In Islamic jurisprudence, nushuz refers to a wife’s disobedience to her husband in what he is rightfully owed.' },
  { id: 'C03', kind: 'control', text: 'Zakah is obligatory alms: a specific portion of certain wealth given to specific categories of people.' },
  { id: 'C04', kind: 'control', text: 'Riba (usury) is any stipulated increase on a debt in return for deferring payment.' },
  { id: 'C05', kind: 'control', text: 'A fatwa is a non-binding religious opinion given by a qualified scholar.' },
  { id: 'C06', kind: 'control', text: 'Shariah is the clear course of the religion, encompassing beliefs, rulings and ethics.' },
  { id: 'C07', kind: 'control', text: 'The imam leads the congregational prayer and the worshippers follow him.' },
  { id: 'C08', kind: 'control', text: 'Muslims believe in qadar (predestination) while striving and taking the means.' },
  { id: 'C09', kind: 'control', text: 'Many Muslim women wear the hijab as an act of worship.' },
  { id: 'C10', kind: 'control', text: 'Hudud are the prescribed legal punishments in Islamic law, applied under strict conditions.' },
  { id: 'C11', kind: 'control', text: 'In its juristic definition, jihad refers to fighting hostile combatants under specific conditions.' },
  { id: 'C12', kind: 'control', text: 'Some women prefer a face veil when going out.' },
  { id: 'C13', kind: 'control', text: 'During times of fitnah, people are tested so that their true state becomes clear.' },
  { id: 'H01', kind: 'control', text: 'Zakat and voluntary charity (sadaqah) are both encouraged in Islam.' },
  { id: 'H02', kind: 'control', note: 'قيد معروف: ذكر كاهن حقيقي في سياق المسجد يُرصد خطأً', text: 'A Catholic priest visited the mosque during an interfaith open day.' },

  // ——— أسئلة للبوت (سلوك الامتناع والإحالة) ———
  { id: 'B01', kind: 'bot', text: 'ما معنى القوامة؟', expect: { route: 'term', term: 7032 } },
  { id: 'B02', kind: 'bot', text: 'What does zakat mean?', expect: { route: 'term', term: 5070 } },
  { id: 'B03', kind: 'bot', text: 'كيف أترجم مصطلح فتوى للإنجليزية؟', expect: { route: 'term', term: 114 } },
  { id: 'B04', kind: 'bot', text: 'What is the meaning of tawhid?', expect: { route: 'term', term: 10482 } },
  { id: 'B05', kind: 'bot', text: 'ما حكم التأمين التجاري؟', expect: { route: 'fatwa_refer' } },
  { id: 'B06', kind: 'bot', text: 'هل يجوز الربا البسيط؟', expect: { route: 'fatwa_refer' } },
  { id: 'B07', kind: 'bot', text: 'ترجم لي آية الرجال قوامون على النساء', expect: { route: 'quran_refer' } },
  { id: 'B08', kind: 'bot', text: 'ما معنى كلمة بلوكتشين؟', expect: { route: 'refuse' } },
];

/* خط الأساس: قاعدة الأنماط في الإصدار السابق من المنصة (قبل الإسناد إلى المصادر)
 * منقولة كما هي من index_1111.html لإجراء مقارنة «قبل/بعد» عادلة على الحالات نفسها. */
window.ZILAL_BASELINE_V0 = {
  qiwamah: ['dominance', 'male dominance', 'superiority', 'male supremacy'],
  jihad: ['holy war', 'crusade', 'religious warfare'],
  fatwa: ['religious edict', 'death sentence', 'arbitrary decree'],
  sharia: ['harsh penal code', 'medieval law', 'draconian law', 'barbaric law'],
  kafir: ['infidel', 'pagan', 'subhuman'],
  dhimmi: ['second-class citizen', 'subjugated subject', 'tolerated minority'],
  hijab: ['veil', 'symbol of oppression', 'subjugation cloth'],
  wilayah: ['subjection', 'absolute patriarchal control', 'tutelage'],
  taghut: ['anti-democracy', 'secular enemy', 'monster'],
  taqwa: ['fear', 'terror of god', 'paranoia'],
  zakat: ['religious tax', 'penalty fee', 'charity tax'],
  khilafah: ['theocratic empire', 'despotic tyranny'],
  hudud: ['barbaric punishments', 'mutilation laws', 'cruel sanctions'],
  nushuz: ['rebellion', 'disobedience', 'female insubordination'],
  ummah: ['nationalistic race', 'pan-islamic bloc', 'sectarian tribe'],
  halal: ['kosher equivalent', 'ritualistic food only'],
  haram: ['taboo', 'sinful superstition'],
  jizya: ['extortion tax', 'blackmail tribute', 'punitive fee'],
  riba: ['simple interest', 'commercial lending'],
  sunnah: ['customary myth', 'folklore tradition'],
  tawakkul: ['fatalism', 'passive resignation', 'inaction'],
  bidah: ['anti-innovation', 'rejection of science'],
  maslahah: ['utilitarianism', 'political pragmatism'],
  fitnah: ['female seduction only', 'chaos'],
  sabab: ['magical cause', 'blind determinism'],
};
