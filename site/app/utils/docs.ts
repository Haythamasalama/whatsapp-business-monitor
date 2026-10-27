// The "Accounts & numbers" guide, in both languages. The screenshots come from demo mode.

export interface DocSection {
  id: string
  title: string
  text: string
  points?: string[]
  image?: { file: string, alt: string }
}

const en = {
  path: '/docs/accounts-and-numbers/',
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
