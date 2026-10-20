import { StoreCategoryMeta, CATEGORY_META } from '../data/defaultCatalog';
import { DepositMethodMeta, DEPOSIT_METHODS } from './paymentProof';

export interface SiteBannerConfig {
  showHeroBanner: boolean;
  showTopStrip: boolean;
  showTopStripWhatsapp?: boolean;
  rgbBorderEnabled: boolean;
  topStripTitle: string;
  // Portrait Avatar & Orbit Badges
  showPortraitPhoto?: boolean;
  portraitUrl: string;
  showPortraitOrbitBadges?: boolean;
  orbitBadge1Enabled?: boolean;
  orbitBadge1Title?: string;
  orbitBadge1Sub?: string;
  orbitBadge2Enabled?: boolean;
  orbitBadge2Title?: string;
  orbitBadge2Sub?: string;
  orbitBadge3Enabled?: boolean;
  orbitBadge3Title?: string;
  orbitBadge3Sub?: string;
  orbitBadge4Enabled?: boolean;
  orbitBadge4Title?: string;
  orbitBadge4Sub?: string;
  // Content Texts & Granular Toggles
  showBadgeText?: boolean;
  badgeText: string;
  showMainTitle?: boolean;
  mainTitle: string;
  highlightTitle: string;
  showDescription?: boolean;
  description: string;
  showHeroFeaturePills?: boolean;
}

export interface SiteContactConfig {
  whatsappNumberClean: string;
  whatsappNumberDisplay: string;
  whatsappDefaultMessage: string;
  supportEmail: string;
  officialWebsiteUrl: string;
  officialWebsiteLabel: string;
  whatsappWidgetEnabled?: boolean;
  whatsappWidgetName?: string;
  whatsappWidgetAvatar?: string;
  whatsappWidgetGreeting?: string;
  whatsappWidgetGreetingUr?: string;
  whatsappWidgetStatus?: string;
}

export interface SiteSocialsConfig {
  instagramUrl: string;
  instagramHandle: string;
  tiktokUrl: string;
  tiktokHandle: string;
  facebookUrl: string;
  facebookName: string;
  snapchatUrl: string;
  snapchatHandle: string;
}

export interface SiteFooterConfig {
  brandName: string;
  copyrightTagline: string;
  showQuickLinks: boolean;
}

export interface SiteVisibilityConfig {
  showMarqueeBanner: boolean;
  showStoreWalletBar: boolean;
  showSearchAndCategoryBar: boolean;
  showPortraitOrbitBadges: boolean;
  showHeroFeaturePills: boolean;
  showWebToolsOnStore: boolean;
  showReviewsSection: boolean;
  showFloatingWhatsApp: boolean;
  showFloatingScrollTop: boolean;
  showHeaderRgbToggle: boolean;
  showHeaderWalletPill: boolean;
  showHeaderCartButton: boolean;
  showMobileBottomDock: boolean;
  showMobileQuickBar: boolean;
  showSimDatabaseTracker: boolean;
  showToolsTab: boolean;
  showAboutTab: boolean;
  showFaqsTab: boolean;
  showContactTab: boolean;
  showLoginTab: boolean;
  showPromoBanners?: boolean;
}

export const DEFAULT_SITE_VISIBILITY: SiteVisibilityConfig = {
  showMarqueeBanner: true,
  showStoreWalletBar: true,
  showSearchAndCategoryBar: true,
  showPortraitOrbitBadges: true,
  showHeroFeaturePills: true,
  showWebToolsOnStore: true,
  showReviewsSection: true,
  showFloatingWhatsApp: true,
  showFloatingScrollTop: true,
  showHeaderRgbToggle: true,
  showHeaderWalletPill: true,
  showHeaderCartButton: true,
  showMobileBottomDock: true,
  showMobileQuickBar: true,
  showSimDatabaseTracker: true,
  showToolsTab: true,
  showAboutTab: true,
  showFaqsTab: true,
  showContactTab: true,
  showLoginTab: true,
  showPromoBanners: true
};

export interface SiteSeoConfig {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  author: string;
  canonicalUrl: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  ogType: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
  twitterCard: string;
  twitterCreator: string;
  schemaType: string;
}

export const DEFAULT_SITE_SEO: SiteSeoConfig = {
  metaTitle: 'Muhammad Saqib — Saqib Visuals | AI Accounts, SMM & Digital Services',
  metaDescription: 'Instant CapCut Pro, Lovable Pro, Gemini 18M, ChatGPT Plus, TikTok UK/USA Agency Accounts, Franchise SIM Records & SMM Services by Muhammad Saqib.',
  keywords: 'Muhammad Saqib, Saqib Visuals, CapCut Pro Pakistan, SMM Panel Pakistan, Lovable Pro Account, Gemini 18M Pro, ChatGPT Plus & Claude, Pak SIM Database Live, SIM Tracker 2026, NADRA Verification FRC, TikTok Agency Accounts UK USA, Fast USDT EasyPaisa Delivery',
  author: 'Muhammad Saqib',
  canonicalUrl: 'https://mrsaqib242.vercel.app',
  robotsIndex: true,
  robotsFollow: true,
  ogType: 'website',
  ogTitle: 'Muhammad Saqib — Saqib Visuals | AI Accounts & SMM Services',
  ogDescription: 'Instant CapCut Pro, Lovable Pro, Gemini 18M, ChatGPT Plus, TikTok UK/USA Agency Accounts, Franchise SIM Records & SMM Services by Muhammad Saqib.',
  ogImageUrl: 'https://ik.imagekit.io/mrsaqib/mrsaqib242-img25_7oG52NZUY.png',
  twitterCard: 'summary_large_image',
  twitterCreator: '@mrsaqib242',
  schemaType: 'WebApplication'
};

export interface SiteStoreBarsConfig {
  showStatusPulseBar?: boolean;
  statusPanelTitle?: string;
  statusPanelBadge?: string;
  chip1Enabled?: boolean;
  chip1Label?: string;
  chip1Value?: string;
  chip2Enabled?: boolean;
  chip2Label?: string;
  chip2Value?: string;
  chip3Enabled?: boolean;
  chip3Label?: string;
  chip3Value?: string;

  showMarquee?: boolean;

  showWalletBar?: boolean;
  walletBalanceLabel?: string;
  walletInstructionText?: string;
  showWalletInstruction?: boolean;
  addPaymentBtnLabel?: string;
  showAddPaymentBtn?: boolean;
  historyBtnLabel?: string;
  showHistoryBtn?: boolean;
  showPendingProofBadge?: boolean;
  currencyPrefix?: string;
  headerPillAddLabel?: string;
  showHeaderWalletPill?: boolean;

  showAcceptedGatewaysCard?: boolean;
  acceptedGatewaysTitle?: string;
  acceptedGatewaysSubtitle?: string;
  showGatewaysWhatsappButton?: boolean;
  showAccountNumbersInCard?: boolean;

  minDepositAmount?: number;
  depositModalTitle?: string;
  depositModalSubtitle?: string;

  showSearchBox?: boolean;
  searchPlaceholder?: string;
  showServicesCountBadge?: boolean;
  showHotSearches?: boolean;
  hotSearchesList?: string;
  showCategoryTabs?: boolean;
}

export const DEFAULT_STORE_BARS_CONFIG: SiteStoreBarsConfig = {
  showStatusPulseBar: true,
  statusPanelTitle: 'SAQIB VISUALS LIVE PANEL STATUS:',
  statusPanelBadge: 'ALL 3 SERVERS 99.9% ONLINE',
  chip1Enabled: true,
  chip1Label: 'AI Pro Server:',
  chip1Value: '3 Min Avg',
  chip2Enabled: true,
  chip2Label: 'SMM Turbo API:',
  chip2Value: 'Instant Start',
  chip3Enabled: true,
  chip3Label: '2026 SIM/NADRA Desk:',
  chip3Value: '15 Min PDF',

  showMarquee: true,

  showWalletBar: true,
  walletBalanceLabel: '● LIVE ACCOUNT BALANCE:',
  walletInstructionText: 'Add balance via EasyPaisa / JazzCash / Bank (Enter Amount → Select Method → Upload SS → Instant Balance!)',
  showWalletInstruction: true,
  addPaymentBtnLabel: '+ Add Payment / Balance',
  showAddPaymentBtn: true,
  historyBtnLabel: 'History',
  showHistoryBtn: true,
  showPendingProofBadge: true,
  currencyPrefix: 'Rs.',
  headerPillAddLabel: '+Add',
  showHeaderWalletPill: true,

  showAcceptedGatewaysCard: true,
  acceptedGatewaysTitle: 'Accepted Payment Gateways',
  acceptedGatewaysSubtitle: '100% Secure Local & Crypto Verification',
  showGatewaysWhatsappButton: true,
  showAccountNumbersInCard: true,

  minDepositAmount: 50,
  depositModalTitle: 'Add Funds / Top-Up Wallet Balance',
  depositModalSubtitle: 'Enter Amount → Select EasyPaisa/JazzCash → Submit Account Name & Screenshot',

  showSearchBox: true,
  searchPlaceholder: 'Search any service (e.g. Lovable Pro, Gemini 18M, ElevenLabs, CDR, NADRA, Hostinger, USDT)...',
  showServicesCountBadge: true,
  showHotSearches: true,
  hotSearchesList: 'CapCut Pro, Lovable Pro, Gemini 18M, Muse AI 1B, ElevenLabs 300k, TikTok UK/USA, Ad Agency, Call CDR, NADRA FRC, Hostinger 12M, BTC / USDT',
  showCategoryTabs: true
};

export type PromoBannerStyle = 'rose' | 'dark' | 'emerald' | 'amber' | 'cyan' | 'purple';

export interface SitePromoBannerItem {
  id: string;
  enabled: boolean;
  badgeIcon?: string;
  badgeText: string;
  title: string;
  description: string;
  style: PromoBannerStyle;
  position?: 'below_services' | 'above_services' | 'both';
  
  primaryBtnEnabled: boolean;
  primaryBtnText: string;
  primaryBtnAction: 'whatsapp' | 'webtools' | 'addfunds' | 'custom_url';
  primaryBtnCustomUrl?: string;
  primaryBtnIcon?: string;
  
  secondaryBtnEnabled: boolean;
  secondaryBtnText: string;
  secondaryBtnAction: 'webtools' | 'whatsapp' | 'addfunds' | 'custom_url';
  secondaryBtnCustomUrl?: string;
  secondaryBtnIcon?: string;

  imageUrl?: string;
}

export const DEFAULT_PROMO_BANNERS: SitePromoBannerItem[] = [
  {
    id: 'promo-deal-1',
    enabled: true,
    badgeIcon: 'fa-solid fa-bolt',
    badgeText: 'ALL SERVICES AVAILABLE HERE',
    title: 'Need Custom AI Credits, Ad Agency Accounts, NADRA/CDR Info, or USDT?',
    description: 'Message Muhammad Saqib directly on WhatsApp (+92 347 8936242) for wholesale reseller rates, JazzCash / EasyPaisa payment, and instant delivery.',
    style: 'rose',
    position: 'below_services',
    primaryBtnEnabled: true,
    primaryBtnText: 'Deal on WhatsApp',
    primaryBtnAction: 'whatsapp',
    primaryBtnIcon: 'fa-brands fa-whatsapp',
    secondaryBtnEnabled: true,
    secondaryBtnText: 'Open Web Tools Hub',
    secondaryBtnAction: 'webtools',
    secondaryBtnIcon: 'fa-solid fa-screwdriver-wrench'
  }
];

export interface SiteSettingsConfig {
  banner: SiteBannerConfig;
  promoBanners?: SitePromoBannerItem[];
  storeBars?: SiteStoreBarsConfig;
  contact: SiteContactConfig;
  socials: SiteSocialsConfig;
  footer: SiteFooterConfig;
  paymentMethods: DepositMethodMeta[];
  categories: StoreCategoryMeta[];
  visibility?: SiteVisibilityConfig;
  seo?: SiteSeoConfig;
}

export const SITE_CONFIG_STORAGE_KEY = 'saqib_visuals_site_config_v1';

export const DEFAULT_SITE_CONFIG: SiteSettingsConfig = {
  banner: {
    showHeroBanner: true,
    showTopStrip: true,
    showTopStripWhatsapp: true,
    rgbBorderEnabled: true,
    topStripTitle: 'MUHAMMAD SAQIB • VISUALS HUB',
    showPortraitPhoto: true,
    portraitUrl: 'https://ik.imagekit.io/mrsaqib/mrsaqib242-img25_7oG52NZUY.png',
    showPortraitOrbitBadges: true,
    orbitBadge1Enabled: true,
    orbitBadge1Title: 'CapCut & Lovable',
    orbitBadge1Sub: 'PRO UNLOCKED',
    orbitBadge2Enabled: true,
    orbitBadge2Title: 'AI Suite',
    orbitBadge2Sub: 'GEMINI • CLAUDE',
    orbitBadge3Enabled: true,
    orbitBadge3Title: 'TikTok UK/USA',
    orbitBadge3Sub: 'ADS & BOOST',
    orbitBadge4Enabled: true,
    orbitBadge4Title: 'SIM & NADRA',
    orbitBadge4Sub: 'CDR • FRC • LIVE',
    showBadgeText: true,
    badgeText: 'ALL DIGITAL, AI, SMM, FRANCHISE & NADRA SERVICES AVAILABLE',
    showMainTitle: true,
    mainTitle: 'Muhammad Saqib',
    highlightTitle: '— Saqib Visuals',
    showDescription: true,
    description:
      'Get Instant CapCut Pro, Lovable Pro, Gemini 18M, ChatGPT, Claude, Muse AI 1B & ElevenLabs, TikTok UK/USA & Ad Agency Accounts, Franchise SIM/CDR/IMEI Tracking, NADRA FRC/Passport Records & USDT/Video/Graphics!',
    showHeroFeaturePills: true
  },
  promoBanners: DEFAULT_PROMO_BANNERS,
  storeBars: DEFAULT_STORE_BARS_CONFIG,
  contact: {
    whatsappNumberClean: '923478936242',
    whatsappNumberDisplay: '+92 347 8936242',
    whatsappDefaultMessage: 'Assalam-o-Alaikum Muhammad Saqib! Mujhe apki services chahiye.',
    supportEmail: 'support@saqibvisuals.com',
    officialWebsiteUrl: 'https://mrsaqib242.vercel.app',
    officialWebsiteLabel: 'mrsaqib242.vercel.app',
    whatsappWidgetEnabled: true,
    whatsappWidgetName: 'Muhammad Saqib',
    whatsappWidgetAvatar: 'https://mrsaqib242.vercel.app/saqib-pic.png',
    whatsappWidgetGreeting: 'Assalam-o-Alaikum! 👋 Welcome to Saqib Visuals Hub.<br/>How can I help you today with CapCut Pro, AI Tools, TikTok Ads or Nadra services?',
    whatsappWidgetGreetingUr: 'السلام علیکم! 👋 ثاقب ویژولز ہب میں خوش آمدید۔<br/>آج میں کیپ کٹ پرو، اے آئی ٹولز، ٹک ٹاک ایڈز یا نادرا سروسز میں آپ کی کیا مدد کر سکتا ہوں؟',
    whatsappWidgetStatus: 'Typically replies in ~2 minutes ⚡'
  },
  socials: {
    instagramUrl: 'https://instagram.com/',
    instagramHandle: '@mrsaqib242',
    tiktokUrl: 'https://tiktok.com/',
    tiktokHandle: '@mrsaqib242',
    facebookUrl: 'https://facebook.com/',
    facebookName: 'Muhammad Saqib',
    snapchatUrl: 'https://snapchat.com/',
    snapchatHandle: 'mrsaqib242'
  },
  footer: {
    brandName: '🚀 Muhammad Saqib',
    copyrightTagline: '24/7 Instant Delivery • 100% Full Replacement Warranty',
    showQuickLinks: true
  },
  paymentMethods: DEPOSIT_METHODS,
  categories: CATEGORY_META,
  visibility: DEFAULT_SITE_VISIBILITY,
  seo: DEFAULT_SITE_SEO
};
