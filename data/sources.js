/* ظِلال — سجل المصادر المعتمدة (القائمة التي حددها منظمو التحدي فقط)
 * لا تضف مصدرًا خارج هذه القائمة دون موافقة الفريق والتوثيق في SOURCES.md
 */
window.ZILAL_SOURCES = {
  terminologyenc: {
    name: 'موسوعة المصطلحات والقواميس الإسلامية المترجمة',
    short: 'موسوعة المصطلحات المترجمة',
    url: 'https://terminologyenc.com/ar',
    term: (id) => `https://terminologyenc.com/ar/browse/term/${id}`,
    termEn: (id) => `https://terminologyenc.com/en/browse/term/${id}`,
    role: 'المصدر الأساسي لقاعدة المصطلحات: التعريف العربي والترجمة الإنجليزية ورابط كل مصطلح',
    status: 'مدمج',
  },
  jamhara: {
    name: 'معجم المصطلحات الشرعية — الجمهرة (مركز أصول)',
    short: 'معجم الجمهرة',
    url: 'https://islamic-content.com/dictionary',
    search: (q) => `https://islamic-content.com/search?query=${encodeURIComponent(q)}`,
    role: 'تحقق ثانٍ بالتعريف العربي، ومرجع للمصطلحات غير الموجودة في الموسوعة المترجمة',
    status: 'روابط تحقق',
  },
  icadb: {
    name: 'القاعدة المركزية Central-DB — جمعية خدمة المحتوى الإسلامي باللغات',
    short: 'القاعدة المركزية',
    url: 'https://icadb.com/',
    role: 'مستودع الترجمات المعتمدة بواجهات برمجية؛ الربط المباشر يتطلب صلاحية من الجمعية',
    status: 'مخطط له (بانتظار الصلاحية)',
  },
  dorar: {
    name: 'الدرر السنية — الموسوعة الحديثية',
    short: 'الدرر السنية',
    url: 'https://dorar.net/',
    search: (q) => `https://dorar.net/hadith/search?q=${encodeURIComponent(q)}`,
    role: 'التحقق من درجة الأحاديث الواردة في النصوص المدققة',
    status: 'روابط تحقق',
  },
  qurancomplex: {
    name: 'مجمع الملك فهد لطباعة المصحف الشريف',
    short: 'مجمع الملك فهد',
    url: 'https://qurancomplex.gov.sa/',
    role: 'المرجع لترجمات معاني القرآن المعتمدة؛ ظلال لا يترجم الآيات بنفسه بل يحيل إليه',
    status: 'إحالة',
  },
  hadeethenc: {
    name: 'موسوعة الأحاديث النبوية المترجمة',
    short: 'موسوعة الأحاديث',
    url: 'https://hadeethenc.com/ar/home',
    role: 'ترجمات الأحاديث وشروحها (متاحة للتنزيل بشروط: عدم التعديل وذكر المصدر ورقم الإصدار)',
    status: 'إحالة',
  },
  siwar: {
    name: 'منصة سوار — مجمع الملك سلمان العالمي للغة العربية',
    short: 'سوار',
    url: 'https://siwar.ksaa.gov.sa/',
    role: 'المرجع اللغوي للمعنى المعجمي للكلمة العربية',
    status: 'إحالة',
  },
};
