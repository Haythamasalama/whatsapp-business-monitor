// The guides, in both languages. The screenshots come from demo mode.

export interface DocSection {
  id: string
  title: string
  text: string
  points?: string[]
  image?: { file: string, alt: string }
}

const en = {
  path: '/docs/accounts-and-numbers/',
  cover: 'account-settings.png',
  nav: 'Accounts & numbers',
  title: 'Accounts & numbers: WhatsApp Business Monitor docs',
  description: 'What the "Account settings" tab shows and lets you change: sending health, verification, payment method, phone numbers, profile, display name, green badge, username, chat start, QR codes and blocked people.',
  keywords: 'WhatsApp Business account settings, WhatsApp health status, WhatsApp display name change, WhatsApp green badge, Official Business Account, WhatsApp username, WhatsApp ice breakers, WhatsApp QR code, block WhatsApp users, WhatsApp business profile API',
  heading: 'Accounts & numbers',
  intro: 'Open an account and pick "Account settings". It answers three questions: can this account send right now, what is set up, and who can reach it. Every change asks you to confirm first and shows Meta\'s limit.',
  onThisPage: 'On this page',
  back: 'Back to the home page',
  limitsTitle: 'Meta\'s limits at a glance',
  limits: [
    ['Display name', '10 requests in 30 days; register the number again within 14 days of approval'],
    ['Username', '2 changes in 14 days'],
    ['Green badge', 'a refused request waits 30 days'],
    ['Quick questions', 'up to 4, 80 characters each'],
    ['Commands', 'up to 30; name 32 characters, hint 256'],
    ['QR codes', 'up to 2,000 per number; message up to 140 characters'],
    ['Blocking', 'only people who wrote in the last 24 hours; 1,000 at a time'],
    ['Profile photo', 'JPEG or PNG, up to 5 MB'],
  ],
  sections: [
    {
      id: 'health',
      title: 'Can it send now?',
      text: 'Before a message goes out, Meta checks the app, the business, the account, the number and the template. This card shows the result in one word (Can send, Limited or Blocked) and, for each problem, Meta\'s reason and what to do about it.',
      image: { file: 'account-settings.png', alt: 'The Account settings tab of a fictional store: sending health with reasons, account details, phone numbers, people with access and the activity log.' },
    },
    {
      id: 'details',
      title: 'Account details',
      text: 'Account review, business verification, who owns the account, and whether a payment method is added.',
      points: [
        'No payment method means paid messages (marketing, utility, authentication) are not sent. Add one in Meta Business Suite → Billing.',
        'A verified business gets a higher messaging limit and can ask for the green badge.',
      ],
    },
    {
      id: 'numbers',
      title: 'Phone numbers',
      text: 'Each number with whether it can send, its quality, its daily limit (how many different customers you can start a conversation with in 24 hours), its display name, a new name waiting for review, and its badge. "Manage" opens the number\'s settings.',
    },
    {
      id: 'people',
      title: 'People with access and the activity log',
      text: 'Who can open the account and what each person or system user may do, and a list of what changed and when: templates, numbers, people, payment. Meta keeps the log; "Show older" loads more.',
    },
    {
      id: 'profile',
      title: 'Profile',
      text: 'What customers see when they open your business in WhatsApp: photo, about line, description, address, email, up to two websites and the business type. The photo is uploaded to Meta first and then set on the profile.',
      image: { file: 'number-profile.png', alt: 'A number\'s profile: photo, about, description, address, email, websites and business type.' },
    },
    {
      id: 'name',
      title: 'Display name, username and green badge',
      text: 'Ask Meta to review a new display name, pick a username customers can search for, and see or request the green badge (Official Business Account).',
      points: [
        'The badge needs a verified business, 30 days on the platform, two-step verification, an approved name and 5 to 10 links from known news sites.',
        'The page lists these before you send the request.',
      ],
      image: { file: 'number-name.png', alt: 'The name and badge tab: current name, a new name waiting for review, username and the badge requirements.' },
    },
    {
      id: 'chat-start',
      title: 'Chat start',
      text: 'Quick questions a customer can tap to start a chat, commands that appear when they type /, and the welcome message switch.',
      image: { file: 'number-chat-start.png', alt: 'The chat start tab: welcome message switch, quick questions and commands.' },
    },
    {
      id: 'qr',
      title: 'QR codes and short links',
      text: 'Create a QR code and a wa.me link that open a chat with a message already typed. Change the message later, copy the link, download the image as PNG or SVG, or delete it. Printed codes keep working after you change the message, and stop when you delete it.',
      image: { file: 'number-qr.png', alt: 'The QR codes tab: a field for the message and two codes with download, edit and delete.' },
    },
    {
      id: 'blocked',
      title: 'Blocked people',
      text: 'See who is blocked, block numbers, and unblock them. Meta only lets you block someone who wrote to this number in the last 24 hours; anyone else is listed with that reason.',
      image: { file: 'number-blocked.png', alt: 'The blocked tab: the 24-hour rule, a field for numbers and the blocked list.' },
    },
  ] as DocSection[],
}

const ar: typeof en = {
  path: '/ar/docs/accounts-and-numbers/',
  cover: 'account-settings-ar.png',
  nav: 'الحسابات والأرقام',
  title: 'الحسابات والأرقام: دليل مراقب واتساب الأعمال',
  description: 'ما يعرضه تبويب «إعدادات الحساب» وما يتيح تغييره: قدرة الإرسال، والتوثيق، ووسيلة الدفع، والأرقام، والملف، والاسم الظاهر، والشارة الخضراء، واسم المستخدم، وبداية المحادثة، ورموز QR، والمحظورون.',
  keywords: 'إعدادات حساب واتساب للأعمال, حالة إرسال واتساب, تغيير اسم واتساب للأعمال, الشارة الخضراء واتساب, حساب أعمال رسمي, اسم مستخدم واتساب, رمز QR واتساب, حظر رقم واتساب, ملف واتساب للأعمال',
  heading: 'الحسابات والأرقام',
  intro: 'افتح حساباً واختر «إعدادات الحساب». يجيب التبويب عن ثلاثة أسئلة: هل يستطيع الحساب الإرسال الآن، وما المضبوط فيه، ومن يصل إليه. كل تغيير يطلب تأكيدك أولاً ويعرض حدّ Meta.',
  onThisPage: 'في هذه الصفحة',
  back: 'العودة إلى الصفحة الرئيسية',
  limitsTitle: 'حدود Meta باختصار',
  limits: [
    ['الاسم الظاهر', '10 طلبات خلال 30 يوماً، وسجّل الرقم مجدداً خلال 14 يوماً من الموافقة'],
    ['اسم المستخدم', 'تغييران خلال 14 يوماً'],
    ['الشارة الخضراء', 'عند الرفض تنتظر 30 يوماً'],
    ['الأسئلة السريعة', 'حتى 4، كل منها حتى 80 حرفاً'],
    ['الأوامر', 'حتى 30، الاسم 32 حرفاً والشرح 256'],
    ['رموز QR', 'حتى 2000 لكل رقم، والرسالة حتى 140 حرفاً'],
    ['الحظر', 'لمن راسلك خلال آخر 24 ساعة فقط، وحتى 1000 في المرة'],
    ['صورة الملف', 'JPEG أو PNG حتى 5 ميغابايت'],
  ],
  sections: [
    {
      id: 'health',
      title: 'هل يستطيع الإرسال الآن؟',
      text: 'قبل خروج أي رسالة تفحص Meta التطبيق والنشاط التجاري والحساب والرقم والقالب. تعرض هذه البطاقة النتيجة بكلمة واحدة (يرسل، محدود، موقوف)، ولكل مشكلة سببها عند Meta وما العمل.',
      image: { file: 'account-settings-ar.png', alt: 'تبويب إعدادات الحساب لمتجر خيالي: قدرة الإرسال وأسبابها، وبيانات الحساب، والأرقام، ومن يصل إلى الحساب، وسجل النشاط.' },
    },
    {
      id: 'details',
      title: 'بيانات الحساب',
      text: 'مراجعة الحساب، وتوثيق النشاط التجاري، ومالك الحساب، وهل أُضيفت وسيلة دفع.',
      points: [
        'دون وسيلة دفع لا تُرسل الرسائل المدفوعة (التسويق والخدمات والمصادقة). أضفها من Meta Business Suite ← الفوترة.',
        'النشاط الموثّق يحصل على حد رسائل أعلى ويستطيع طلب الشارة الخضراء.',
      ],
    },
    {
      id: 'numbers',
      title: 'أرقام الهاتف',
      text: 'كل رقم مع قدرته على الإرسال، وجودته، وحدّه اليومي (عدد العملاء المختلفين الذين تبدأ محادثة معهم خلال 24 ساعة)، واسمه الظاهر، واسم جديد ينتظر المراجعة، وشارته. زر «إدارة» يفتح إعدادات الرقم.',
    },
    {
      id: 'people',
      title: 'من يصل إلى الحساب وسجل النشاط',
      text: 'من يستطيع فتح الحساب وما يحق لكل شخص أو مستخدم نظام فعله، وقائمة بما تغيّر ومتى: القوالب والأرقام والأشخاص والدفع. تحفظ Meta السجل، و«عرض الأقدم» يحمّل المزيد.',
    },
    {
      id: 'profile',
      title: 'الملف',
      text: 'ما يراه العملاء حين يفتحون نشاطك في واتساب: الصورة والنبذة والوصف والعنوان والبريد وحتى موقعين ونوع النشاط. تُرفع الصورة إلى Meta أولاً ثم تُعيَّن على الملف.',
      image: { file: 'number-profile-ar.png', alt: 'ملف الرقم: الصورة والنبذة والوصف والعنوان والبريد والمواقع ونوع النشاط.' },
    },
    {
      id: 'name',
      title: 'الاسم الظاهر واسم المستخدم والشارة الخضراء',
      text: 'اطلب من Meta مراجعة اسم ظاهر جديد، واختر اسم مستخدم يبحث عنه العملاء، واعرض الشارة الخضراء (حساب أعمال رسمي) أو اطلبها.',
      points: [
        'تشترط الشارة نشاطاً موثّقاً، و30 يوماً في المنصة، والتحقق بخطوتين، واسماً مقبولاً، ومن 5 إلى 10 روابط من مواقع أخبار معروفة.',
        'تعرض الصفحة هذه الشروط قبل إرسال الطلب.',
      ],
      image: { file: 'number-name-ar.png', alt: 'تبويب الاسم والشارة: الاسم الحالي، واسم جديد ينتظر المراجعة، واسم المستخدم، وشروط الشارة.' },
    },
    {
      id: 'chat-start',
      title: 'بداية المحادثة',
      text: 'أسئلة سريعة يضغطها العميل ليبدأ المحادثة، وأوامر تظهر حين يكتب /، ومفتاح رسالة الترحيب.',
      image: { file: 'number-chat-start-ar.png', alt: 'تبويب بداية المحادثة: مفتاح رسالة الترحيب والأسئلة السريعة والأوامر.' },
    },
    {
      id: 'qr',
      title: 'رموز QR والروابط القصيرة',
      text: 'أنشئ رمز QR ورابط wa.me يفتحان محادثة ومعها رسالة مكتوبة مسبقاً. غيّر الرسالة لاحقاً، وانسخ الرابط، ونزّل الصورة PNG أو SVG، أو احذفه. الرموز المطبوعة تبقى تعمل بعد تغيير الرسالة، وتتوقف عند الحذف.',
      image: { file: 'number-qr-ar.png', alt: 'تبويب رموز QR: حقل الرسالة ورمزان مع التنزيل والتعديل والحذف.' },
    },
    {
      id: 'blocked',
      title: 'المحظورون',
      text: 'اعرض المحظورين، واحظر أرقاماً، وألغِ حظرها. لا تسمح Meta بحظر أحد إلا إذا راسل الرقم خلال آخر 24 ساعة، ومن سواه يظهر مع هذا السبب.',
      image: { file: 'number-blocked-ar.png', alt: 'تبويب المحظورين: قاعدة 24 ساعة وحقل الأرقام وقائمة المحظورين.' },
    },
  ],
}

export const docs = { en, ar }

const templatesEn: typeof en = {
  path: '/docs/templates/',
  cover: 'templates-actions.png',
  nav: 'Templates',
  title: 'Templates: WhatsApp Business Monitor docs',
  description: 'Delete, archive, unarchive, unpause and copy WhatsApp message templates between accounts, and see how many of your 250 or 6,000 templates are used.',
  keywords: 'delete WhatsApp template, archive WhatsApp template, unpause WhatsApp template, paused template, migrate WhatsApp templates, copy templates between WABA, WhatsApp template limit, message_templates API',
  heading: 'Templates',
  intro: 'Open an account to see its templates. Besides creating and editing them, you can now delete, archive, unpause and copy them, alone or several at once. Every change asks you to confirm first and says what Meta does with it.',
  onThisPage: 'On this page',
  back: 'Back to the home page',
  limitsTitle: 'Meta\'s limits at a glance',
  limits: [
    ['Templates per account', '250 on an unverified business, 6,000 on a verified one; every language counts'],
    ['Delete', 'a deleted name can\'t be used again for 30 days; disabled templates can\'t be deleted; up to 100 at a time'],
    ['Archive', 'approved or rejected templates only; up to 100 at a time'],
    ['Auto-archive', 'after 12 months unused; deleted 28 days later unless unarchived'],
    ['Pause', '3 hours the first time, 6 hours the second; the third time the template is disabled'],
    ['Copy', 'same business only; approved templates with green or unknown quality; up to 500 at a time'],
  ],
  sections: [
    {
      id: 'quota',
      title: 'How many templates you have left',
      text: 'Under the title the page shows how many templates the account has and how many Meta allows: 250 when the business is not verified, 6,000 when it is. Each language of a template counts as one.',
      image: { file: 'templates-actions.png', alt: 'The templates of a fictional store: the count used out of 6,000, two templates selected, and the archive, unarchive, copy and delete buttons.' },
    },
    {
      id: 'select',
      title: 'Acting on several templates',
      text: 'Tick templates in the table to archive, unarchive, copy or delete them together. Ticking a name includes every language of it.',
      points: [
        'Meta takes up to 100 templates in one delete or archive, and up to 500 in one copy.',
        'When Meta refuses some of them, the page lists which ones and why.',
      ],
    },
    {
      id: 'delete',
      title: 'Deleting',
      text: 'From a template\'s "More actions" menu, delete the language you are looking at or every language of the name. This can\'t be undone.',
      points: [
        'The name can\'t be used for a new template for 30 days.',
        'Disabled templates can\'t be deleted. In a bulk delete, one disabled template makes Meta delete none, so the page stops before sending.',
        'A template with messages still being delivered shows "Being deleted" for up to 30 days.',
      ],
    },
    {
      id: 'archive',
      title: 'Archiving',
      text: 'An archived template stays in the list with the "Archived" status but can\'t be sent. Unarchive it to put it back in the status it had.',
      points: [
        'Only approved or rejected templates can be archived.',
        'Meta archives a template unused for 12 months on its own, and deletes it 28 days later unless you unarchive it.',
      ],
    },
    {
      id: 'unpause',
      title: 'Unpausing',
      text: 'Meta pauses a template when people report or block it. The template\'s window explains why and has an "Unpause" button.',
      points: [
        'A quality pause lasts 3 hours the first time and 6 hours the second; the third time the template is disabled.',
        'A template paused by pacing stays paused until someone unpauses it.',
      ],
      image: { file: 'template-paused.png', alt: 'A paused template: the reason and pause rules, an Unpause button, and the More actions menu with unpause, copy and delete.' },
    },
    {
      id: 'copy',
      title: 'Copying to another account',
      text: '"Copy to another account" asks Meta to copy templates to another saved account of the same business. Choose the account and the templates, then see which ones were copied and which were not, with Meta\'s reason.',
      points: [
        'Only approved templates with green or unknown quality can be copied.',
        'The copies are new templates in the other account and go through review there.',
      ],
      image: { file: 'templates-copy.png', alt: 'The copy window after a copy: two templates copied to the other account.' },
    },
  ],
}

const templatesAr: typeof ar = {
  path: '/ar/docs/templates/',
  cover: 'templates-actions-ar.png',
  nav: 'القوالب',
  title: 'القوالب: دليل مراقب واتساب الأعمال',
  description: 'احذف قوالب رسائل واتساب وأرشفها وألغِ أرشفتها وألغِ إيقافها وانسخها بين الحسابات، واعرف كم استخدمت من 250 أو 6,000 قالب.',
  keywords: 'حذف قالب واتساب, أرشفة قالب واتساب, قالب موقوف واتساب, إلغاء إيقاف القالب, نسخ القوالب بين الحسابات, حد قوالب واتساب, واجهة قوالب واتساب',
  heading: 'القوالب',
  intro: 'افتح حساباً لترى قوالبه. إلى جانب إنشائها وتعديلها، تستطيع الآن حذفها وأرشفتها وإلغاء إيقافها ونسخها، واحداً واحداً أو عدة قوالب معاً. كل تغيير يطلب تأكيدك أولاً ويذكر ما يفعله Meta به.',
  onThisPage: 'في هذه الصفحة',
  back: 'العودة إلى الصفحة الرئيسية',
  limitsTitle: 'حدود Meta باختصار',
  limits: [
    ['القوالب في الحساب', '250 للنشاط غير الموثّق، و6,000 للموثّق، وكل لغة تُحسب قالباً'],
    ['الحذف', 'لا يُستخدم الاسم المحذوف قبل 30 يوماً، والقالب المعطّل لا يُحذف، وحتى 100 في المرة'],
    ['الأرشفة', 'للقالب المعتمد أو المرفوض فقط، وحتى 100 في المرة'],
    ['الأرشفة التلقائية', 'بعد 12 شهراً دون استخدام، ويُحذف بعدها بـ 28 يوماً إن لم تُلغَ أرشفته'],
    ['الإيقاف', '3 ساعات في المرة الأولى، و6 في الثانية، وفي الثالثة يُعطَّل القالب'],
    ['النسخ', 'داخل النشاط التجاري نفسه فقط، للقالب المعتمد بجودة خضراء أو غير معروفة، وحتى 500 في المرة'],
  ],
  sections: [
    {
      id: 'quota',
      title: 'كم بقي لك من القوالب',
      text: 'تحت العنوان تعرض الصفحة عدد قوالب الحساب وما يسمح به Meta: 250 إن لم يكن النشاط موثّقاً، و6,000 إن كان موثّقاً. وكل لغة من القالب تُحسب قالباً.',
      image: { file: 'templates-actions-ar.png', alt: 'قوالب متجر خيالي: العدد المستخدم من 6,000، وقالبان محدّدان، وأزرار الأرشفة وإلغائها والنسخ والحذف.' },
    },
    {
      id: 'select',
      title: 'العمل على عدة قوالب',
      text: 'حدّد القوالب في الجدول لتؤرشفها أو تلغي أرشفتها أو تنسخها أو تحذفها معاً. تحديد الاسم يشمل كل لغاته.',
      points: [
        'يقبل Meta حتى 100 قالب في الحذف أو الأرشفة الواحدة، وحتى 500 في النسخ الواحد.',
        'حين يرفض Meta بعضها، تعرض الصفحة أيها وسبب الرفض.',
      ],
    },
    {
      id: 'delete',
      title: 'الحذف',
      text: 'من قائمة «إجراءات أخرى» في القالب، احذف اللغة المعروضة أو كل لغات الاسم. لا يمكن التراجع عن الحذف.',
      points: [
        'لا يُستخدم الاسم لقالب جديد قبل 30 يوماً.',
        'القالب المعطّل لا يُحذف. وفي الحذف الجماعي يكفي قالب معطّل واحد ليرفض Meta حذفها كلها، لذا تتوقف الصفحة قبل الإرسال.',
        'القالب الذي ما زالت رسائله تُسلَّم يظهر «قيد الحذف» حتى 30 يوماً.',
      ],
    },
    {
      id: 'archive',
      title: 'الأرشفة',
      text: 'القالب المؤرشف يبقى في القائمة بحالة «مؤرشف» لكنه لا يُرسل. ألغِ أرشفته ليعود إلى حالته السابقة.',
      points: [
        'لا يُؤرشف إلا القالب المعتمد أو المرفوض.',
        'يؤرشف Meta وحده كل قالب لم يُستخدم 12 شهراً، ثم يحذفه بعد 28 يوماً إن لم تلغِ أرشفته.',
      ],
    },
    {
      id: 'unpause',
      title: 'إلغاء الإيقاف',
      text: 'يوقف Meta القالب حين يبلّغ الناس عنه أو يحظرونه. تشرح نافذة القالب السبب وفيها زر «إلغاء الإيقاف».',
      points: [
        'إيقاف الجودة يدوم 3 ساعات في المرة الأولى و6 في الثانية، وفي الثالثة يُعطَّل القالب.',
        'القالب الموقوف بسبب التدرّج يبقى موقوفاً حتى يُلغى إيقافه.',
      ],
      image: { file: 'template-paused-ar.png', alt: 'قالب موقوف: السبب وقواعد الإيقاف، وزر إلغاء الإيقاف، وقائمة إجراءات أخرى فيها إلغاء الإيقاف والنسخ والحذف.' },
    },
    {
      id: 'copy',
      title: 'النسخ إلى حساب آخر',
      text: '«نسخ إلى حساب آخر» يطلب من Meta نسخ القوالب إلى حساب محفوظ آخر للنشاط التجاري نفسه. اختر الحساب والقوالب، ثم اعرف أيها نُسخ وأيها لم يُنسخ مع سبب Meta.',
      points: [
        'لا يُنسخ إلا القالب المعتمد بجودة خضراء أو غير معروفة.',
        'النسخ قوالب جديدة في الحساب الآخر، وتمر بالمراجعة هناك.',
      ],
      image: { file: 'templates-copy-ar.png', alt: 'نافذة النسخ بعد النسخ: قالبان نُسخا إلى الحساب الآخر.' },
    },
  ],
}

export const templateDocs = { en: templatesEn, ar: templatesAr }

const reportsEn: typeof en = {
  path: '/docs/reports-and-costs/',
  cover: 'reports-costs.png',
  nav: 'Reports & costs',
  title: 'Reports and costs: WhatsApp Business Monitor docs',
  description: 'See what WhatsApp messages cost by country, number and paid or free, all messages sent and received, the 1,000 free service messages per number, volume tiers, template block rates, template groups and calls.',
  keywords: 'WhatsApp pricing analytics, WhatsApp cost by country, WhatsApp free service messages 1000, WhatsApp service message charge October 2026, WhatsApp volume tier, WhatsApp template block rate, template comparison, WhatsApp call analytics, template group analytics',
  heading: 'Reports and costs',
  intro: 'Open an account and choose "Reports". The page reads Meta\'s analytics for the last 24 hours, 7, 30 or 90 days, or 12 months, and says in plain words what each number means. It has four short tabs: costs, all messages, templates and calls (only when the account has calls). It only reads; nothing is sent or changed.',
  onThisPage: 'On this page',
  back: 'Back to the home page',
  limitsTitle: 'Meta\'s limits at a glance',
  limits: [
    ['How far back', '1 year for costs, messages and calls; 90 days for template groups; 7, 30, 60 or 90 days for a comparison'],
    ['Free service messages', '1,000 per number per month since 1 October 2026; Meta charges from the 1,001st; they don\'t roll over'],
    ['Comparison', 'two templates of the same account, each sent at least 1,000 times in the chosen days'],
    ['Freshness', 'Meta\'s numbers are approximate and can be a few hours behind; the page keeps an answer for 5 minutes'],
    ['Costs', 'not shown when the account pays through a Solution Partner\'s credit line'],
  ],
  sections: [
    {
      id: 'costs',
      title: 'Costs',
      text: 'The amount Meta charged for messages delivered in the range, how many were paid and how many free, and the cost over time (by half hour for 24 hours, by month for 12 months, by day otherwise). Below it, the cost by category and by customer country; "More details" adds paid or free, each number and volume discounts.',
      points: [
        '"Paid" covers marketing and authentication templates, utility templates, and service replies after the free tier.',
        '"Free from an ad or page button" is a 72-hour window that starts when a customer messages you from an ad or a page button.',
        'Filter by one number or one country at the top.',
      ],
      image: { file: 'reports-costs.png', alt: 'The costs of a fictional store over 30 days: total charged, paid and free messages, free service messages left, and the cost by day.' },
    },
    {
      id: 'free-tier',
      title: 'The 1,000 free service messages',
      text: 'Since 1 October 2026 Meta charges for service messages, the replies you send inside a 24-hour customer window. Each number still gets 1,000 free ones a month; the card shows how many are left for this month. Utility templates sent inside a customer window are charged too.',
      points: [
        'The free tier resets on the 1st of each month and unused messages don\'t carry over.',
        'If it runs out early, answer in fewer, fuller messages, or move routine replies to a template customers ask for.',
      ],
    },
    {
      id: 'tiers',
      title: 'Volume discounts',
      text: 'Utility and authentication templates get cheaper as you send more to one country in a month. When Meta reports a tier, the page shows how far you are and how many messages are left to the next one. Marketing has no tiers.',
    },
    {
      id: 'messages',
      title: 'All messages',
      text: 'Every message, not only templates: templates you sent, free-form replies from your team or bot, and messages customers sent you, with how many were delivered. This shows how busy each number really is.',
      image: { file: 'reports-messages.png', alt: 'All messages of a fictional store: templates, replies and received messages, and a stacked chart by day.' },
    },
    {
      id: 'compare',
      title: 'Comparing two templates',
      text: 'Pick two approved templates and 7, 30, 60 or 90 days. Meta answers which one customers block less, how many times each was sent, and the main reason people blocked it.',
      points: [
        'Meta only compares templates that were each sent at least 1,000 times in the chosen days. With fewer, the page says so; pick a longer range or wait.',
        'Blocks lower the number\'s quality rating. Learn from the template with fewer blocks.',
      ],
      image: { file: 'reports-compare.png', alt: 'Two templates compared: the one with fewer blocks, how many times each was sent, and the main block reason.' },
    },
    {
      id: 'groups-calls',
      title: 'Template groups and calls',
      text: 'When the account has template groups made in WhatsApp Manager, the page lists them with their sends, read rate, clicks and cost for up to the last 90 days. When the account had WhatsApp calls, it shows how many, what they cost and how long they lasted. Accounts without either don\'t see these parts.',
    },
  ],
}

const reportsAr: typeof ar = {
  path: '/ar/docs/reports-and-costs/',
  cover: 'reports-costs-ar.png',
  nav: 'التقارير والتكاليف',
  title: 'التقارير والتكاليف: توثيق WhatsApp Business Monitor',
  description: 'اعرف تكلفة رسائل واتساب حسب الدولة والرقم والمدفوع والمجاني، وكل الرسائل المرسلة والواردة، والـ 1,000 رسالة خدمة المجانية لكل رقم، وشرائح الكمية، ونسبة حظر القوالب، ومجموعات القوالب والمكالمات.',
  keywords: 'تكلفة رسائل واتساب, تحليلات أسعار واتساب, رسائل الخدمة المجانية 1000, احتساب رسائل الخدمة أكتوبر 2026, شرائح الكمية واتساب, نسبة حظر القالب, مقارنة القوالب, تحليلات مكالمات واتساب',
  heading: 'التقارير والتكاليف',
  intro: 'افتح حسابًا واختر «التقارير». تقرأ الصفحة تحليلات Meta لآخر 24 ساعة أو 7 أو 30 أو 90 يومًا أو 12 شهرًا، وتشرح بكلمات بسيطة ماذا يعني كل رقم. فيها أربعة تبويبات قصيرة: التكاليف، وكل الرسائل، والقوالب، والمكالمات (إن وُجدت). الصفحة تقرأ فقط؛ لا ترسل شيئًا ولا تغيّر شيئًا.',
  onThisPage: 'في هذه الصفحة',
  back: 'العودة إلى الصفحة الرئيسية',
  limitsTitle: 'حدود Meta باختصار',
  limits: [
    ['إلى أي مدى', 'سنة للتكاليف والرسائل والمكالمات؛ 90 يومًا لمجموعات القوالب؛ 7 أو 30 أو 60 أو 90 يومًا للمقارنة'],
    ['رسائل الخدمة المجانية', '1,000 لكل رقم في الشهر منذ 1 أكتوبر 2026؛ تبدأ Meta الحساب من الرسالة 1,001؛ ولا يُرحَّل الباقي'],
    ['المقارنة', 'قالبان من الحساب نفسه، أُرسل كل منهما 1,000 مرة على الأقل في المدة المختارة'],
    ['حداثة الأرقام', 'أرقام Meta تقريبية وقد تتأخر بضع ساعات؛ وتحتفظ الصفحة بالإجابة 5 دقائق'],
    ['التكاليف', 'لا تظهر إذا كان الحساب يدفع عبر خط ائتمان شريك حلول'],
  ],
  sections: [
    {
      id: 'costs',
      title: 'التكاليف',
      text: 'المبلغ الذي حسبته Meta على الرسائل التي وصلت في المدة، وكم منها مدفوع وكم مجاني، والتكلفة عبر الوقت (بنصف الساعة لمدة 24 ساعة، وبالشهر لمدة 12 شهرًا، وباليوم فيما عدا ذلك). وتحتها التكلفة حسب الفئة ودولة العميل، وزر «تفاصيل أكثر» يضيف المدفوع والمجاني وكل رقم وخصومات الكمية.',
      points: [
        '«مدفوعة» تشمل قوالب التسويق والتحقق، وقوالب الخدمات، وردود الخدمة بعد انتهاء الحصة المجانية.',
        '«مجانية من إعلان أو زر صفحة» نافذة مدتها 72 ساعة تبدأ عندما يراسلك العميل من إعلان أو زر صفحة.',
        'صفِّ النتائج برقم واحد أو دولة واحدة من أعلى الصفحة.',
      ],
      image: { file: 'reports-costs-ar.png', alt: 'تكاليف متجر خيالي خلال 30 يومًا: المبلغ المحسوب، والرسائل المدفوعة والمجانية، والمتبقي من رسائل الخدمة المجانية، والتكلفة اليومية.' },
    },
    {
      id: 'free-tier',
      title: 'الـ 1,000 رسالة خدمة المجانية',
      text: 'منذ 1 أكتوبر 2026 تحسب Meta رسائل الخدمة، وهي الردود التي ترسلها خلال نافذة الـ 24 ساعة مع العميل. وما زال لكل رقم 1,000 رسالة مجانية في الشهر، وتعرض البطاقة كم بقي منها هذا الشهر. وقوالب الخدمات المرسلة داخل نافذة العميل صارت مدفوعة أيضًا.',
      points: [
        'تتجدد الحصة أول كل شهر، ولا يُرحَّل ما لم يُستخدم.',
        'إذا نفدت مبكرًا فاجمع ردك في رسائل أقل وأوضح، أو انقل الردود المتكررة إلى قالب يطلبه العميل.',
      ],
    },
    {
      id: 'tiers',
      title: 'خصومات الكمية',
      text: 'يقل سعر قوالب الخدمات والتحقق كلما زاد ما ترسله إلى دولة واحدة في الشهر. حين تذكر Meta الشريحة، تعرض الصفحة أين وصلت وكم رسالة بقيت للشريحة التالية. التسويق بلا شرائح.',
    },
    {
      id: 'messages',
      title: 'كل الرسائل',
      text: 'كل الرسائل وليس القوالب فقط: القوالب التي أرسلتها، والردود الحرة من فريقك أو الرد الآلي، والرسائل التي أرسلها العملاء، مع عدد ما وصل. هكذا ترى مدى انشغال كل رقم فعلًا.',
      image: { file: 'reports-messages-ar.png', alt: 'كل رسائل متجر خيالي: القوالب والردود والواردة، ومخطط يومي مكدّس.' },
    },
    {
      id: 'compare',
      title: 'المقارنة بين قالبين',
      text: 'اختر قالبين معتمدين و7 أو 30 أو 60 أو 90 يومًا. تجيب Meta أيهما يحظره العملاء أقل، وكم مرة أُرسل كل منهما، وأكثر سبب للحظر.',
      points: [
        'لا تقارن Meta إلا قوالب أُرسل كل منها 1,000 مرة على الأقل في المدة المختارة. وإذا قلّ العدد تقول الصفحة ذلك؛ اختر مدة أطول أو انتظر.',
        'الحظر يخفض تقييم جودة الرقم. تعلّم من القالب الأقل حظرًا.',
      ],
      image: { file: 'reports-compare-ar.png', alt: 'مقارنة قالبين: الأقل حظرًا، وعدد مرات إرسال كل منهما، وأكثر سبب للحظر.' },
    },
    {
      id: 'groups-calls',
      title: 'مجموعات القوالب والمكالمات',
      text: 'إذا كان للحساب مجموعات قوالب أُنشئت في WhatsApp Manager، تعرضها الصفحة مع عدد الإرسال ونسبة القراءة والنقرات والتكلفة لآخر 90 يومًا كحد أقصى. وإذا كانت للحساب مكالمات واتساب، تعرض عددها وتكلفتها ومتوسط مدتها. والحسابات التي ليس لها أي منهما لا ترى هذين الجزأين.',
    },
  ],
}

export const reportDocs = { en: reportsEn, ar: reportsAr }

/** Every guide, in the order the docs menu lists them. */
export const guides = { accounts: docs, templates: templateDocs, reports: reportDocs }
export type Guide = keyof typeof guides
