const en = {
  title: 'WhatsApp Business Monitor: free WhatsApp Business API dashboard',
  description: 'A free, open-source, self-hosted dashboard to monitor and manage WhatsApp Business accounts on the Cloud API: message templates, sends, reads, costs, number health, profile, QR codes and more.',
  keywords: 'WhatsApp Business monitoring, WhatsApp Business API dashboard, WhatsApp Cloud API, manage WhatsApp templates, WhatsApp template analytics, WhatsApp number quality, WhatsApp messaging limit, WhatsApp business profile, WhatsApp QR code, self-hosted, open source',
  brand: 'WhatsApp Business Monitor',
  nav: { features: 'Features', screenshots: 'Screenshots', install: 'Install', faq: 'FAQ', docs: 'Docs' },
  menu: 'Menu',
  language: 'العربية',
  hero: {
    badge: 'Free and open source',
    title: 'Your WhatsApp Business accounts on one screen',
    text: 'Templates, costs, numbers and settings for all your WhatsApp Business accounts, explained in plain words. It runs on your computer or your server, and your tokens never leave it.',
    install: 'Install',
    docs: 'Read the docs',
    notes: ['One command with Docker', 'Arabic and English', 'MIT license'],
    image: 'The overview of two accounts of a fictional store: this month\'s cost, messages sent, templates that need attention and a daily cost chart.',
  },
  features: {
    title: 'Everything about your accounts, in one place',
    text: 'Built on Meta\'s WhatsApp Business APIs. No spreadsheets, and no switching between accounts in WhatsApp Manager.',
    items: [
      { icon: 'i-lucide-layout-dashboard', title: 'Every account at a glance', text: 'This month\'s cost and messages, what needs your attention now, and the most-sent templates.' },
      { icon: 'i-lucide-file-text', title: 'Templates', text: 'Status and 30-day numbers for each one. Create and edit with a live preview, paste them as text, and delete, archive, unpause or copy several at once.' },
      { icon: 'i-lucide-chart-column', title: 'Reports and costs', text: 'What Meta charged by category, country and number, every message sent and received, and the 1,000 free replies left this month.' },
      { icon: 'i-lucide-settings', title: 'Account and numbers', text: 'Whether each number can send and why not, verification, payment, people with access, and each number\'s profile, name, badge, QR codes and blocked list.' },
      { icon: 'i-lucide-users', title: 'Several accounts', text: 'Found from one token, and moved to another computer in one encrypted file.' },
      { icon: 'i-lucide-languages', title: 'Arabic and English', text: 'Right to left or left to right, light or dark, and templates in any language.' },
    ],
  },
  screenshots: {
    title: 'A look inside',
    text: 'Every screenshot shows a fictional store.',
    tabs: [
      { label: 'An account', file: 'dashboard.png', alt: 'An account\'s home: cost, messages, balance, daily cost, cost by type, what needs attention and the most-sent templates.' },
      { label: 'Templates', file: 'templates-actions.png', alt: 'The templates tab with two selected and the archive, unarchive, copy and delete buttons.' },
      { label: 'Reports', file: 'reports.png', alt: 'Reports: what was charged, free messages, free replies left, cost over time, and cost by category and country.' },
      { label: 'Account settings', file: 'account-settings.png', alt: 'Account settings: sending health with reasons, account details, numbers, people with access and the activity log.' },
      { label: 'Dark mode', file: 'dashboard-dark.png', alt: 'The overview in dark mode.' },
    ],
  },
  install: {
    title: 'Install it in one command',
    text: 'You only need Docker.',
    tabs: { computer: 'Your computer', server: 'A server' },
    next: 'Then open the address it prints.',
    updates: 'New versions install themselves every 6 hours, with the same settings and data, or right away with the "Update now" button.',
    copy: 'Copy',
    copied: 'Copied',
  },
  privacy: {
    title: 'Yours, and only yours',
    items: [
      { icon: 'i-lucide-server', title: 'Runs where you choose', text: 'On your computer or your own server, behind your own sign-in.' },
      { icon: 'i-lucide-lock', title: 'Tokens stay on the server', text: 'No page and no response ever contains an access token, and exporting them asks for your password.' },
      { icon: 'i-lucide-eye-off', title: 'No tracking', text: 'No analytics. Besides Meta, it only asks GitHub once a day whether a new version is out.' },
    ],
  },
  faq: {
    title: 'Questions',
    items: [
      { question: 'What is WhatsApp Business Monitor?', answer: 'A free, open-source dashboard for the WhatsApp Business Platform. It shows every message template in your WhatsApp Business accounts with its status, sends, deliveries, reads and cost, and this month\'s spend per account.' },
      { question: 'Can it manage a WhatsApp Business account, not just templates?', answer: 'Yes. For each account it shows whether it can send right now and why not, its verification, payment method, people with access and activity log. For each number you can edit the business profile and photo, request a new display name or the green badge, set a username, ice breakers and commands, manage QR codes and short links, and block or unblock people.' },
      { question: 'Is it free?', answer: 'Yes. It is open source under the MIT license, with no paid plan. You keep paying Meta for the messages you send, as usual.' },
      { question: 'Is my access token safe?', answer: 'The app runs on your computer or your own server. The token stays in its database and is never sent to the browser or to anyone but Meta. There are no analytics.' },
      { question: 'What do I need to connect an account?', answer: 'A WhatsApp Business account on the Cloud API, and a Meta system user token with the whatsapp_business_management permission.' },
      { question: 'How is it different from WhatsApp Manager?', answer: 'Meta\'s WhatsApp Manager shows one account at a time. This puts all your accounts on one screen, with 30-day numbers for every template, reports on what you pay and why, what needs your attention now, and an alert when a template\'s status changes.' },
      { question: 'Does it send messages to my customers?', answer: 'No. It reads your templates, numbers and costs, and lets you create and edit templates. Sending messages stays in your own systems.' },
      { question: 'How do I install and update it?', answer: 'Run one command with Docker. New versions install themselves every 6 hours and keep your settings and data; to update right away, press "Update now" in the app.' },
    ],
  },
  footer: {
    madeBy: 'Made by',
    license: 'MIT license',
  },
}

const ar: typeof en = {
  title: 'مراقب واتساب الأعمال: لوحة مجانية لمراقبة وإدارة واتساب للأعمال',
  description: 'لوحة مجانية مفتوحة المصدر تعمل على خادمك لمراقبة وإدارة حسابات واتساب للأعمال عبر Cloud API: القوالب والإرسال والقراءة والتكلفة وصحة الأرقام والملف ورموز QR.',
  keywords: 'مراقبة واتساب الأعمال, إدارة واتساب للأعمال, لوحة تحكم واتساب, واتساب API, قوالب واتساب, إحصاءات قوالب واتساب, تكلفة رسائل واتساب, جودة رقم واتساب, حد رسائل واتساب, رمز QR واتساب, مفتوح المصدر',
  brand: 'مراقب واتساب الأعمال',
  nav: { features: 'المميزات', screenshots: 'الصور', install: 'التثبيت', faq: 'الأسئلة الشائعة', docs: 'دليل الاستخدام' },
  menu: 'القائمة',
  language: 'English',
  hero: {
    badge: 'مجاني ومفتوح المصدر',
    title: 'حسابات واتساب الأعمال في شاشة واحدة',
    text: 'القوالب والتكاليف والأرقام والإعدادات لكل حسابات واتساب الأعمال، مشروحة بكلمات بسيطة. يعمل على جهازك أو على خادمك، ولا يغادره رمز الوصول أبداً.',
    install: 'التثبيت',
    docs: 'اقرأ دليل الاستخدام',
    notes: ['أمر واحد مع Docker', 'عربي وإنجليزي', 'رخصة MIT'],
    image: 'نظرة عامة على حسابين لمتجر خيالي: تكلفة هذا الشهر والرسائل المرسلة والقوالب التي تحتاج إلى متابعة ورسم للتكلفة اليومية.',
  },
  features: {
    title: 'كل ما يخص حساباتك في مكان واحد',
    text: 'مبني على واجهات واتساب للأعمال من Meta. لا جداول، ولا تنقّل بين الحسابات في WhatsApp Manager.',
    items: [
      { icon: 'i-lucide-layout-dashboard', title: 'كل حساب بنظرة واحدة', text: 'تكلفة هذا الشهر والرسائل، وما يحتاج انتباهك الآن، والقوالب الأكثر إرسالاً.' },
      { icon: 'i-lucide-file-text', title: 'القوالب', text: 'الحالة وأرقام آخر 30 يوماً لكل قالب. أنشئ وعدّل مع معاينة حيّة، أو الصقها كنص، واحذف وأرشف وألغِ الإيقاف وانسخ عدة قوالب معاً.' },
      { icon: 'i-lucide-chart-column', title: 'التقارير والتكاليف', text: 'ما حسبته Meta حسب الفئة والدولة والرقم، وكل الرسائل المرسلة والواردة، والمتبقي من 1,000 رد مجاني هذا الشهر.' },
      { icon: 'i-lucide-settings', title: 'الحساب والأرقام', text: 'هل يستطيع كل رقم الإرسال ولماذا لا، والتوثيق والدفع ومن يصل إلى الحساب، ولكل رقم ملفه واسمه وشارته ورموز QR والمحظورون.' },
      { icon: 'i-lucide-users', title: 'عدة حسابات', text: 'تظهر من رمز وصول واحد، وتنتقل إلى جهاز آخر في ملف واحد مشفّر.' },
      { icon: 'i-lucide-languages', title: 'عربي وإنجليزي', text: 'من اليمين إلى اليسار أو العكس، فاتح أو داكن، وقوالب بأي لغة.' },
    ],
  },
  screenshots: {
    title: 'نظرة من الداخل',
    text: 'كل الصور لمتجر خيالي.',
    tabs: [
      { label: 'الحساب', file: 'dashboard-ar.png', alt: 'رئيسية الحساب: التكلفة والرسائل والرصيد والتكلفة اليومية وحسب النوع، وما يحتاج انتباهك، والقوالب الأكثر إرسالاً.' },
      { label: 'القوالب', file: 'templates-actions-ar.png', alt: 'تبويب القوالب مع قالبين محدّدين وأزرار الأرشفة وإلغائها والنسخ والحذف.' },
      { label: 'التقارير', file: 'reports-ar.png', alt: 'التقارير: المبلغ المحسوب والرسائل المجانية والردود المجانية المتبقية والتكلفة عبر الوقت وحسب الفئة والدولة.' },
      { label: 'إعدادات الحساب', file: 'account-settings-ar.png', alt: 'إعدادات الحساب: قدرة الإرسال وأسبابها وبيانات الحساب والأرقام ومن يصل إليه وسجل النشاط.' },
      { label: 'الوضع الداكن', file: 'dashboard-dark.png', alt: 'النظرة العامة في الوضع الداكن.' },
    ],
  },
  install: {
    title: 'التثبيت بأمر واحد',
    text: 'تحتاج إلى Docker فقط.',
    tabs: { computer: 'جهازك', server: 'خادم' },
    next: 'ثم افتح العنوان الذي يظهر.',
    updates: 'تُثبَّت الإصدارات الجديدة تلقائياً كل 6 ساعات، بالإعدادات والبيانات نفسها، أو فوراً بزر «حدّث الآن».',
    copy: 'نسخ',
    copied: 'تم النسخ',
  },
  privacy: {
    title: 'بياناتك لك وحدك',
    items: [
      { icon: 'i-lucide-server', title: 'يعمل حيث تختار', text: 'على جهازك أو خادمك الخاص، خلف تسجيل الدخول الخاص بك.' },
      { icon: 'i-lucide-lock', title: 'رمز الوصول يبقى على الخادم', text: 'لا تحتوي أي صفحة أو استجابة على رمز الوصول، وتصديره يطلب كلمة مرورك.' },
      { icon: 'i-lucide-eye-off', title: 'بلا تتبّع', text: 'لا تحليلات. وعدا Meta، يسأل GitHub مرة في اليوم فقط عن وجود إصدار جديد.' },
    ],
  },
  faq: {
    title: 'أسئلة شائعة',
    items: [
      { question: 'ما هو مراقب واتساب الأعمال؟', answer: 'لوحة مجانية ومفتوحة المصدر لمنصة واتساب الأعمال. تعرض كل قوالب الرسائل في حسابات واتساب الأعمال الخاصة بك مع حالتها وأرقام الإرسال والتسليم والقراءة وتكلفتها، وإنفاق هذا الشهر لكل حساب.' },
      { question: 'هل يدير حساب واتساب للأعمال أم القوالب فقط؟', answer: 'يدير الحساب أيضاً. لكل حساب يعرض هل يستطيع الإرسال الآن ولماذا لا، والتوثيق ووسيلة الدفع ومن يصل إليه وسجل النشاط. ولكل رقم تعدّل الملف والصورة، وتطلب اسماً ظاهراً جديداً أو الشارة الخضراء، وتعيّن اسم المستخدم والأسئلة السريعة والأوامر، وتدير رموز QR والروابط القصيرة، وتحظر الأرقام أو تلغي حظرها.' },
      { question: 'هل هو مجاني؟', answer: 'نعم. هو مفتوح المصدر برخصة MIT ولا توجد خطة مدفوعة. وتدفع لـ Meta ثمن الرسائل التي ترسلها كالمعتاد.' },
      { question: 'هل رمز الوصول آمن؟', answer: 'يعمل التطبيق على جهازك أو خادمك الخاص. يبقى رمز الوصول في قاعدة بياناته، ولا يُرسل إلى المتصفح ولا إلى أي جهة غير Meta. ولا توجد أي تحليلات.' },
      { question: 'ماذا أحتاج لربط حساب؟', answer: 'حساب واتساب أعمال على Cloud API، ورمز وصول لمستخدم نظام في Meta يملك صلاحية whatsapp_business_management.' },
      { question: 'ما الفرق بينه وبين WhatsApp Manager؟', answer: 'يعرض WhatsApp Manager من Meta حساباً واحداً في كل مرة. أما هذه اللوحة فتجمع كل حساباتك في شاشة واحدة، مع أرقام آخر 30 يوماً لكل قالب، وتقارير عمّا تدفعه ولماذا، وما يحتاج انتباهك الآن، وتنبيه عند تغيّر حالة أي قالب.' },
      { question: 'هل يرسل رسائل إلى عملائي؟', answer: 'لا. يقرأ القوالب والأرقام والتكاليف، ويتيح إنشاء القوالب وتعديلها. أما إرسال الرسائل فيبقى في أنظمتك.' },
      { question: 'كيف أثبّته وأحدّثه؟', answer: 'شغّل أمراً واحداً مع Docker. تُثبَّت الإصدارات الجديدة تلقائياً كل 6 ساعات مع الحفاظ على إعداداتك وبياناتك، ولتحديث فوري اضغط «حدّث الآن» في التطبيق.' },
    ],
  },
  footer: {
    madeBy: 'من تطوير',
    license: 'رخصة MIT',
  },
}

export const content = { en, ar }

export const installCommand = (repo: string) => `curl -fsSL ${repo.replace('https://github.com/', 'https://raw.githubusercontent.com/')}/main/install.sh | sh`

export type Lang = keyof typeof content
