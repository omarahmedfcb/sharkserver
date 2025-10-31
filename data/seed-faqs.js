// Seed data for FAQ collection
// This file contains initial Q&A pairs about SharkStage platform

const seedFAQs = [
  // General Platform Questions
  {
    question: "What is SharkStage?",
    questionAr: "ما هو SharkStage؟",
    answer: "SharkStage is an investment marketplace platform that connects visionary projects with strategic investors. It's a marketplace where innovative projects meet investors seeking opportunities. The platform offers secure transactions, growth analytics, expert community networking, fast processing, and access to a global marketplace with multi-currency support.",
    answerAr: "SharkStage هي منصة سوق استثمارية تربط بين المشاريع الرؤيوية والمستثمرين الاستراتيجيين. إنها سوق حيث تلتقي المشاريع الابتكارية مع المستثمرين الباحثين عن الفرص. توفر المنصة معاملات آمنة، وتحليلات النمو، وشبكة مجتمع الخبراء، ومعالجة سريعة، وإمكانية الوصول إلى سوق عالمي بدعم متعدد العملات.",
    category: "general",
    keywords: ["what", "is", "sharkstage", "platform", "overview", "about", "this", "website", "site"],
    language: "both",
  },
  {
    question: "How does SharkStage work?",
    questionAr: "كيف يعمل SharkStage؟",
    answer: "SharkStage works as a marketplace where project owners can list their investment opportunities and investors can browse, filter, and invest in projects. The platform provides tools for project management, investment tracking, analytics, and secure payment processing. Users can sign up as investors or project owners.",
    answerAr: "يعمل SharkStage كسوق حيث يمكن لأصحاب المشاريع إدراج فرص الاستثمار الخاصة بهم ويمكن للمستثمرين تصفح المشاريع والاستثمار فيها. توفر المنصة أدوات لإدارة المشاريع، وتتبع الاستثمارات، والتحليلات، ومعالجة المدفوعات الآمنة. يمكن للمستخدمين التسجيل كمستثمرين أو أصحاب مشاريع.",
    category: "usage",
    keywords: ["how", "does", "work", "function", "process"],
    language: "both",
  },

  // Features Questions
  {
    question: "What features does SharkStage offer?",
    questionAr: "ما هي المميزات التي يوفرها SharkStage؟",
    answer: "SharkStage offers five main features: 1) Secure Transactions - Bank-level security with encrypted payments and verified escrow services. 2) Growth Analytics - Real-time data insights and performance metrics. 3) Expert Community - Connect with seasoned investors and entrepreneurs. 4) Fast Processing - Lightning-fast deal execution with automated workflows. 5) Global Marketplace - Access investment opportunities from around the world with multi-currency support.",
    answerAr: "يوفر SharkStage خمس ميزات رئيسية: 1) المعاملات الآمنة - أمان على مستوى البنوك مع مدفوعات مشفرة وخدمات ضمان مؤكدة. 2) تحليلات النمو - رؤى البيانات في الوقت الفعلي ومقاييس الأداء. 3) مجتمع الخبراء - التواصل مع المستثمرين ورجال الأعمال ذوي الخبرة. 4) المعالجة السريعة - تنفيذ صفقات سريعة جداً مع سير عمل آلي. 5) السوق العالمي - الوصول إلى فرص الاستثمار من جميع أنحاء العالم مع دعم متعدد العملات.",
    category: "features",
    keywords: ["features", "security", "analytics", "community", "processing", "marketplace"],
    language: "both",
  },
  {
    question: "Is SharkStage secure?",
    questionAr: "هل SharkStage آمن؟",
    answer: "Yes, SharkStage implements bank-level security with encrypted payments and verified escrow services. All transactions are protected with advanced encryption to ensure complete peace of mind for both investors and project owners.",
    answerAr: "نعم، يطبق SharkStage أماناً على مستوى البنوك مع مدفوعات مشفرة وخدمات ضمان مؤكدة. جميع المعاملات محمية بتشفير متقدم لضمان راحة البال التامة للمستثمرين وأصحاب المشاريع.",
    category: "security",
    keywords: ["security", "safe", "secure", "encryption", "protection"],
    language: "both",
  },

  // Account & Usage Questions
  {
    question: "How do I sign up for SharkStage?",
    questionAr: "كيف أسجل في SharkStage؟",
    answer: "You can sign up for SharkStage by clicking the 'Sign Up' or 'Create one' link on the sign-in page. You can create an account using your email and password, or use social login options like Google or LinkedIn. You'll need to choose an account type: investor, owner (for project owners), or admin.",
    answerAr: "يمكنك التسجيل في SharkStage بالنقر على رابط 'Sign Up' أو 'Create one' في صفحة تسجيل الدخول. يمكنك إنشاء حساب باستخدام بريدك الإلكتروني وكلمة المرور، أو استخدام خيارات تسجيل الدخول الاجتماعي مثل Google أو LinkedIn. ستحتاج إلى اختيار نوع الحساب: مستثمر، أو مالك (لأصحاب المشاريع)، أو مشرف.",
    category: "account",
    keywords: ["sign", "up", "register", "create", "account", "join"],
    language: "both",
  },
  {
    question: "How do I list my project on SharkStage?",
    questionAr: "كيف أدرج مشروعي على SharkStage؟",
    answer: "To list your project, you need to sign up as a project owner. Then click on the 'List your project' button which appears on the homepage. You'll need to provide project details including title, description, category, funding goal, expected ROI, and other relevant information.",
    answerAr: "لإدراج مشروعك، تحتاج إلى التسجيل كمالك مشروع. ثم انقر على زر 'List your project' الذي يظهر على الصفحة الرئيسية. ستحتاج إلى تقديم تفاصيل المشروع بما في ذلك العنوان والوصف والفئة وهدف التمويل والعائد المتوقع على الاستثمار ومعلومات أخرى ذات صلة.",
    category: "usage",
    keywords: ["list", "project", "submit", "add", "post", "create"],
    language: "both",
  },
  {
    question: "How do I invest in a project?",
    questionAr: "كيف أستثمر في مشروع؟",
    answer: "To invest in a project, browse the projects page at '/projects'. You can filter projects by category, status, ROI, and funding goals. Click on any project to view detailed information including timeline, milestones, team, and investment terms. Then follow the investment process to complete your investment.",
    answerAr: "للاستثمار في مشروع، تصفح صفحة المشاريع في '/projects'. يمكنك تصفية المشاريع حسب الفئة والحالة والعائد على الاستثمار وأهداف التمويل. انقر على أي مشروع لعرض المعلومات التفصيلية بما في ذلك الجدول الزمني والمعالم والفريق وشروط الاستثمار. ثم اتبع عملية الاستثمار لإكمال استثمارك.",
    category: "usage",
    keywords: ["invest", "investment", "buy", "fund", "contribute", "support", "how", "invest", "here", "platform"],
    language: "both",
  },

  // Categories Questions
  {
    question: "What investment categories are available?",
    questionAr: "ما هي فئات الاستثمار المتاحة؟",
    answer: "SharkStage offers six main investment categories: 1) Real Estate - Commercial and residential property investments (12-25% ROI). 2) Technology - SaaS, apps, and digital product ventures (12-25% ROI). 3) Green Energy - Sustainable and renewable energy projects (12-25% ROI). 4) AI & Automation - Machine learning and automation solutions (12-25% ROI). 5) E-commerce - Online retail and marketplace platforms (12-25% ROI). 6) Startups - Early-stage ventures and MVPs (12-25% ROI).",
    answerAr: "يوفر SharkStage ست فئات استثمارية رئيسية: 1) العقارات - استثمارات العقارات التجارية والسكنية (12-25% عائد). 2) التكنولوجيا - شركات SaaS والتطبيقات والمنتجات الرقمية (12-25% عائد). 3) الطاقة الخضراء - مشاريع الطاقة المستدامة والمتجددة (12-25% عائد). 4) الذكاء الاصطناعي والأتمتة - حلول التعلم الآلي والأتمتة (12-25% عائد). 5) التجارة الإلكترونية - منصات البيع بالتجزئة عبر الإنترنت والأسواق (12-25% عائد). 6) الشركات الناشئة - المشاريع في المراحل المبكرة وMVPs (12-25% عائد).",
    category: "categories",
    keywords: ["categories", "types", "sectors", "industries", "real", "estate", "technology", "energy", "ai", "commerce", "startups"],
    language: "both",
  },
  {
    question: "What is the average ROI on projects?",
    questionAr: "ما هو متوسط العائد على الاستثمار في المشاريع؟",
    answer: "The average expected ROI across all investment categories on SharkStage is typically between 12-25%. This varies depending on the project category, risk level, and specific project terms. Each project displays its expected ROI percentage.",
    answerAr: "متوسط العائد المتوقع على الاستثمار عبر جميع فئات الاستثمار في SharkStage عادة ما بين 12-25%. يختلف هذا حسب فئة المشروع ومستوى المخاطر وشروط المشروع المحددة. يعرض كل مشروع نسبة العائد المتوقع على الاستثمار الخاصة به.",
    category: "projects",
    keywords: ["roi", "return", "profit", "yield", "average", "percentage"],
    language: "both",
  },

  // Platform Stats
  {
    question: "How many projects has SharkStage funded?",
    questionAr: "كم مشروعاً مول SharkStage؟",
    answer: "SharkStage has successfully funded over 500 projects. The platform has a growing community of 1200+ active investors and has facilitated over $10 million in total investments across various sectors and categories.",
    answerAr: "مول SharkStage بنجاح أكثر من 500 مشروع. لدى المنصة مجتمع متزايد من أكثر من 1200 مستثمر نشط وسهلت أكثر من 10 ملايين دولار في إجمالي الاستثمارات عبر مختلف القطاعات والفئات.",
    category: "general",
    keywords: ["funded", "projects", "number", "count", "stats", "statistics"],
    language: "both",
  },
  {
    question: "How do I search for projects?",
    questionAr: "كيف أبحث عن المشاريع؟",
    answer: "You can search for projects on the '/projects' page. Use the search bar to find projects by name or description. You can also filter by category (Real Estate, Technology, Green Energy, AI & Automation, E-commerce, Startups), status (active/closed), ROI percentage, and sort by newest, highest ROI, funding goals, or most funded.",
    answerAr: "يمكنك البحث عن المشاريع في صفحة '/projects'. استخدم شريط البحث للعثور على المشاريع بالاسم أو الوصف. يمكنك أيضاً التصفية حسب الفئة (العقارات، التكنولوجيا، الطاقة الخضراء، الذكاء الاصطناعي والأتمتة، التجارة الإلكترونية، الشركات الناشئة)، والحالة (نشط/مغلق)، ونسبة العائد على الاستثمار، والترتيب حسب الأحدث، أو أعلى عائد، أو أهداف التمويل، أو الأكثر تمويلاً.",
    category: "usage",
    keywords: ["search", "find", "projects", "browse", "filter"],
    language: "both",
  },
  {
    question: "What information is shown on a project page?",
    questionAr: "ما هي المعلومات المعروضة في صفحة المشروع؟",
    answer: "Each project page shows detailed information including: project title and description, category, funding goal and current funding amount, expected ROI percentage, project status (active/closed), timeline and milestones, management team information, key benefits and potential risks, project images, and investment terms.",
    answerAr: "تعرض صفحة كل مشروع معلومات تفصيلية تشمل: عنوان المشروع والوصف، الفئة، هدف التمويل ومبلغ التمويل الحالي، نسبة العائد المتوقع على الاستثمار، حالة المشروع (نشط/مغلق)، الجدول الزمني والمعالم، معلومات فريق الإدارة، الفوائد الرئيسية والمخاطر المحتملة، صور المشروع، وشروط الاستثمار.",
    category: "projects",
    keywords: ["project", "details", "information", "page", "info"],
    language: "both",
  },
  {
    question: "Can I contact project owners?",
    questionAr: "هل يمكنني التواصل مع أصحاب المشاريع؟",
    answer: "Yes, SharkStage provides tools for communication between investors and project owners. You can contact project owners through the platform to discuss investment opportunities, ask questions about the project, or negotiate terms before making an investment decision.",
    answerAr: "نعم، يوفر SharkStage أدوات للتواصل بين المستثمرين وأصحاب المشاريع. يمكنك التواصل مع أصحاب المشاريع من خلال المنصة لمناقشة فرص الاستثمار، أو طرح أسئلة حول المشروع، أو التفاوض على الشروط قبل اتخاذ قرار الاستثمار.",
    category: "usage",
    keywords: ["contact", "owner", "communication", "message", "talk"],
    language: "both",
  },
  {
    question: "What payment methods are accepted?",
    questionAr: "ما هي طرق الدفع المقبولة؟",
    answer: "SharkStage supports multiple secure payment methods including bank transfers, credit/debit cards, and digital payment platforms. All transactions are processed securely with encryption and verified escrow services to ensure safe and secure investments.",
    answerAr: "يدعم SharkStage طرق دفع آمنة متعددة بما في ذلك التحويلات البنكية، وبطاقات الائتمان/الخصم، ومنصات الدفع الرقمية. تتم معالجة جميع المعاملات بأمان مع التشفير وخدمات الضمان المؤكدة لضمان استثمارات آمنة ومضمونة.",
    category: "security",
    keywords: ["payment", "methods", "pay", "money", "transaction", "credit", "card"],
    language: "both",
  },
  // Greeting responses
  {
    question: "hi",
    questionAr: "اهلا",
    answer: "Hello! I'm the SharkStage assistant. How can I help you today? You can ask me about the platform, features, investment categories, how to sign up, or how to invest in projects.",
    answerAr: "مرحباً! أنا مساعد SharkStage. كيف يمكنني مساعدتك اليوم؟ يمكنك أن تسألني عن المنصة، المميزات، فئات الاستثمار، كيفية التسجيل، أو كيفية الاستثمار في المشاريع.",
    category: "general",
    keywords: ["hi", "hello", "hey", "greeting", "start"],
    language: "both",
  },
  {
    question: "hello",
    questionAr: "مرحبا",
    answer: "Hello! I'm here to help you with questions about SharkStage platform. Feel free to ask me anything about our services, features, or how to get started.",
    answerAr: "مرحباً! أنا هنا لمساعدتك في الأسئلة المتعلقة بمنصة SharkStage. لا تتردد في سؤالي عن خدماتنا أو مميزاتنا أو كيفية البدء.",
    category: "general",
    keywords: ["hi", "hello", "hey", "greeting", "start"],
    language: "both",
  },
  {
    question: "what is this platform",
    questionAr: "ما هي هذه المنصة",
    answer: "SharkStage is an investment marketplace platform that connects visionary projects with strategic investors. It's a marketplace where innovative projects meet investors seeking opportunities. The platform offers secure transactions, growth analytics, expert community networking, fast processing, and access to a global marketplace with multi-currency support.",
    answerAr: "SharkStage هي منصة سوق استثمارية تربط بين المشاريع الرؤيوية والمستثمرين الاستراتيجيين. إنها سوق حيث تلتقي المشاريع الابتكارية مع المستثمرين الباحثين عن الفرص. توفر المنصة معاملات آمنة، وتحليلات النمو، وشبكة مجتمع الخبراء، ومعالجة سريعة، وإمكانية الوصول إلى سوق عالمي بدعم متعدد العملات.",
    category: "general",
    keywords: ["what", "is", "this", "platform", "website", "site", "about"],
    language: "both",
  },
  {
    question: "how to invest here",
    questionAr: "كيف أستثمر هنا",
    answer: "To invest in a project on SharkStage, follow these steps: 1) Browse the projects page at '/projects'. 2) Use filters to find projects by category, status, ROI, or funding goals. 3) Click on any project to view detailed information. 4) Review the project timeline, milestones, team, and investment terms. 5) Follow the investment process to complete your investment.",
    answerAr: "للاستثمار في مشروع على SharkStage، اتبع هذه الخطوات: 1) تصفح صفحة المشاريع في '/projects'. 2) استخدم الفلاتر للعثور على المشاريع حسب الفئة أو الحالة أو العائد على الاستثمار أو أهداف التمويل. 3) انقر على أي مشروع لعرض المعلومات التفصيلية. 4) راجع الجدول الزمني للمشروع والمعالم والفريق وشروط الاستثمار. 5) اتبع عملية الاستثمار لإكمال استثمارك.",
    category: "usage",
    keywords: ["how", "invest", "here", "investment", "buy", "fund"],
    language: "both",
  },
];

module.exports = seedFAQs;

