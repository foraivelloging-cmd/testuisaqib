// =====================================================================
// SAQIB VISUALS HUB: BILINGUAL TRANSLATIONS (ENGLISH & URDU)
// Supports Instant 1-Click Toggle between English (EN) and Urdu (اردو)
// =====================================================================

export type SupportedLang = 'en' | 'ur';

export interface TranslationDictionary {
  // Navigation & Header
  brandSub: string;
  navStore: string;
  navTools: string;
  navAbout: string;
  navFaqs: string;
  navContact: string;
  navWallet: string;
  navVipWallet: string;
  addFundsPill: string;
  exitAdmin: string;
  switchLangTooltip: string;

  // Search & Filter
  searchPlaceholder: string;
  allCategories: string;
  categoryDesign: string;
  categoryStreaming: string;
  categorySmm: string;
  categorySoftware: string;
  categoryEducation: string;
  categoryVpn: string;
  categoryDev: string;

  // Hero Section
  heroBadge: string;
  heroHeadline: string;
  heroSub: string;
  heroBtnExplore: string;
  heroBtnWhatsApp: string;
  statServices: string;
  statUptime: string;
  statDelivery: string;
  statCustomers: string;

  // Service Card Actions
  cardSelectTier: string;
  cardInstantDelivery: string;
  cardWarranty: string;
  cardOrderWhatsApp: string;
  cardAddToBag: string;
  cardInBag: string;
  cardRequirementLabel: string;

  // Shopping Bag Modal
  bagTitle: string;
  bagSubtitle: string;
  bagEmpty: string;
  bagTotal: string;
  bagCheckoutBtn: string;
  bagClearBtn: string;

  // Wallet & Add Funds
  walletLiveBalance: string;
  walletAvailable: string;
  walletPendingAdmin: string;
  walletStep1Title: string;
  walletStep2Title: string;
  walletEnterAmount: string;
  walletSelectMethod: string;
  walletUploadSS: string;
  walletPasteUrl: string;
  walletSampleSS: string;
  walletSubmitProofBtn: string;
  walletChangeAmountBtn: string;

  // Mobile Drawer Menu
  mobileMenuTitle: string;
  mobileMenuClose: string;
  langToggleLabel: string;

  // Footer & Badges
  footerTagline: string;
  footerRights: string;
  badgeInstant: string;
  badgeVerified: string;
}

export const TRANSLATIONS: Record<SupportedLang, TranslationDictionary> = {
  en: {
    brandSub: 'SAQIB VISUALS • PREMIUM SERVICES',
    navStore: 'Store',
    navTools: 'Web Tools',
    navAbout: 'About',
    navFaqs: 'FAQs',
    navContact: 'Contact',
    navWallet: 'Wallet / Login',
    navVipWallet: 'VIP Wallet',
    addFundsPill: '+Add',
    exitAdmin: 'Exit Admin',
    switchLangTooltip: 'اردو میں تبدیل کریں (Switch to Urdu)',

    searchPlaceholder: 'Search 36+ Premium Tools, Canva, Netflix, Prime, VPN...',
    allCategories: 'All Services',
    categoryDesign: 'Design & AI',
    categoryStreaming: 'Streaming & OTT',
    categorySmm: 'SMM & Growth',
    categorySoftware: 'Software & Dev',
    categoryEducation: 'Education & Office',
    categoryVpn: 'VPN & Security',
    categoryDev: 'Developer & Coding',

    heroBadge: '✨ PAKISTAN’S #1 PREMIUM DIGITAL & AI STORE',
    heroHeadline: 'Instant VIP Access to 36+ Premium Services',
    heroSub:
      'Get Canva Pro, Netflix, Prime, Adobe, VPNs & SMM with 100% full replacement warranty & 24/7 instant WhatsApp delivery.',
    heroBtnExplore: 'Explore 36+ Services',
    heroBtnWhatsApp: 'Direct WhatsApp Chat',
    statServices: 'Premium Services',
    statUptime: 'Instant Activation',
    statDelivery: 'Average Delivery',
    statCustomers: 'Happy Customers',

    cardSelectTier: 'Select Plan / Tier:',
    cardInstantDelivery: 'Instant WhatsApp Delivery',
    cardWarranty: '100% Full Replacement Warranty',
    cardOrderWhatsApp: 'Order via WhatsApp',
    cardAddToBag: 'Add to Bag',
    cardInBag: 'In Bag ✓',
    cardRequirementLabel: 'Your WhatsApp Number / Link:',

    bagTitle: 'Your Selected Services',
    bagSubtitle: 'Send all items together on WhatsApp for fast activation',
    bagEmpty: 'Your shopping bag is empty. Explore services below!',
    bagTotal: 'Total Order Amount:',
    bagCheckoutBtn: 'Send Order on WhatsApp',
    bagClearBtn: 'Clear Bag',

    walletLiveBalance: 'YOUR LIVE WALLET BALANCE',
    walletAvailable: 'Available to Spend',
    walletPendingAdmin: 'Pending Admin Verification',
    walletStep1Title: 'Step 1: Enter Amount & Select Method',
    walletStep2Title: 'Step 2: Send Payment, Enter Details & Upload SS',
    walletEnterAmount: 'Enter Amount to Add (PKR):',
    walletSelectMethod: 'Select Payment Method:',
    walletUploadSS: 'Upload Payment Screenshot (SS)',
    walletPasteUrl: 'Paste Image URL',
    walletSampleSS: 'Sample SS',
    walletSubmitProofBtn: 'Submit Payment Proof & SS',
    walletChangeAmountBtn: '← Change Amount',

    mobileMenuTitle: 'Navigation Menu',
    mobileMenuClose: 'Close',
    langToggleLabel: 'Language / زبان:',

    footerTagline: 'Muhammad Saqib — Saqib Visuals Hub • Pakistan’s Trusted Digital Store',
    footerRights: 'All Rights Reserved • Fast 24/7 WhatsApp Activation',
    badgeInstant: '⚡ Instant Delivery',
    badgeVerified: '✓ Verified Official',
  },

  ur: {
    brandSub: 'ثاقب ویژولز • پریمیم ڈیجیٹل سروسز',
    navStore: 'سٹور سروسز',
    navTools: 'آن لائن ٹولز',
    navAbout: 'ہمارے بارے میں',
    navFaqs: 'اکثر پوچھے گئے سوالات',
    navContact: 'رابطہ کریں',
    navWallet: 'والٹ / لاگ ان',
    navVipWallet: 'وی آئی پی والٹ',
    addFundsPill: '+جمع کریں',
    exitAdmin: 'ایڈمن موڈ بند کریں',
    switchLangTooltip: 'Switch to English (انگریزی میں دیکھیں)',

    searchPlaceholder: 'سرچ کریں: کینوا پرو، نیٹ فلکس، پرائم ویڈیو، وی پی این، سوشل میڈیا...',
    allCategories: 'تمام سروسز',
    categoryDesign: 'ڈیزائن اور اے آئی',
    categoryStreaming: 'سٹریمنگ اور او ٹی ٹی',
    categorySmm: 'سوشل میڈیا پروموشن',
    categorySoftware: 'سافٹ ویئر اور کوڈنگ',
    categoryEducation: 'تعلیم اور آفس',
    categoryVpn: 'وی پی این اور سیکیورٹی',
    categoryDev: 'ڈویلپر ٹولز',

    heroBadge: '✨ پاکستان کا نمبر 1 پریمیم ڈیجیٹل اور اے آئی سٹور',
    heroHeadline: '36+ پریمیم ڈیجیٹل سروسز تک فوری رسائی',
    heroSub:
      'کینوا پرو، نیٹ فلکس، پرائم ویڈیو، ایڈوب، وی پی این اور سوشل میڈیا سروسز فوری حاصل کریں، مکمل گارنٹی اور 24/7 واٹس ایپ سپورٹ کے ساتھ۔',
    heroBtnExplore: 'تمام 36+ سروسز دیکھیں',
    heroBtnWhatsApp: 'براہِ راست واٹس ایپ چیٹ',
    statServices: 'پریمیم سروسز',
    statUptime: 'فوری ایکٹیویشن',
    statDelivery: 'اوسط ڈیلیوری ٹائم',
    statCustomers: 'مطمئن گاہک',

    cardSelectTier: 'پلان / پیکج منتخب کریں:',
    cardInstantDelivery: 'واٹس ایپ پر فوری ڈیلیوری',
    cardWarranty: '100% مکمل ریپلیسمنٹ گارنٹی',
    cardOrderWhatsApp: 'واٹس ایپ پر آرڈر کریں',
    cardAddToBag: 'ٹوکری میں شامل کریں',
    cardInBag: 'ٹوکری میں موجود ہے ✓',
    cardRequirementLabel: 'اپنا واٹس ایپ نمبر یا تفصیل لکھیں:',

    bagTitle: 'آپ کی منتخب کردہ سروسز',
    bagSubtitle: 'تمام اشیاء کو ایک ساتھ واٹس ایپ پر آرڈر بھیجیں',
    bagEmpty: 'آپ کی شاپنگ بیگ خالی ہے، نیچے دی گئی سروسز دیکھیں!',
    bagTotal: 'کل آرڈر کی رقم:',
    bagCheckoutBtn: 'تمام آرڈرز واٹس ایپ پر بھیجیں',
    bagClearBtn: 'بیگ خالی کریں',

    walletLiveBalance: 'آپ کا لائیو والٹ بیلنس',
    walletAvailable: 'خرچ کرنے کے لیے دستیاب',
    walletPendingAdmin: 'ایڈمن تصدیق کے منتظر',
    walletStep1Title: 'مرحلہ 1: رقم درج کریں اور طریقہ منتخب کریں',
    walletStep2Title: 'مرحلہ 2: رقم بھیجیں، تفصیل اور اسکرین شاٹ لگائیں',
    walletEnterAmount: 'رقم درج کریں (پاکستانی روپے):',
    walletSelectMethod: 'پیمنٹ کا طریقہ منتخب کریں:',
    walletUploadSS: 'پیمنٹ کا اسکرین شاٹ لگائیں (SS)',
    walletPasteUrl: 'تصویر کا لنک لگائیں',
    walletSampleSS: 'ڈیمو اسکرین شاٹ',
    walletSubmitProofBtn: 'پیمنٹ کا ثبوت اور اسکرین شاٹ جمع کروائیں',
    walletChangeAmountBtn: '← رقم تبدیل کریں',

    mobileMenuTitle: 'نیویگیشن مینو',
    mobileMenuClose: 'بند کریں',
    langToggleLabel: 'زبان / Language:',

    footerTagline: 'محمد ثاقب — ثاقب ویژولز ہب • پاکستان کا بااعتماد ڈیجیٹل سٹور',
    footerRights: 'جملہ حقوق محفوظ ہیں • 24/7 فوری واٹس ایپ سروس',
    badgeInstant: '⚡ فوری ڈیلیوری',
    badgeVerified: '✓ تصدیق شدہ',
  },
};

export const LANG_STORAGE_KEY = 'saqib_site_language_pref';

export function getInitialLanguage(): SupportedLang {
  if (typeof window === 'undefined') return 'en';
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === 'ur' || saved === 'en') return saved;
  } catch {
    // Ignore storage errors
  }
  return 'en';
}

export function saveLanguage(lang: SupportedLang): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    // Ignore storage errors
  }
}
