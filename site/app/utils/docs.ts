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

/** Every guide, in the order the docs menu lists them. */
export const guides = { accounts: docs, templates: templateDocs }
export type Guide = keyof typeof guides
