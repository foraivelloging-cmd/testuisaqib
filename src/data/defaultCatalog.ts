/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CategoryId =
  | 'all'
  | 'capcut_ai'
  | 'tiktok_fb'
  | 'franchise_sim'
  | 'nadra_records'
  | 'creative_crypto'
  | (string & {});

export type IconType =
  | 'capcut'
  | 'wand'
  | 'openai'
  | 'gemini'
  | 'claude'
  | 'elevenlabs'
  | 'lovable'
  | 'canva'
  | 'protonvpn'
  | 'hostinger'
  | 'adobe'
  | 'microsoft'
  | 'netflix'
  | 'amazon'
  | 'tiktok'
  | 'user-plus'
  | 'play'
  | 'facebook'
  | 'meta'
  | 'thumbs-up'
  | 'sim'
  | 'satellite'
  | 'instagram'
  | 'youtube'
  | 'whatsapp'
  | 'telegram'
  | 'code'
  | 'shield'
  | 'server'
  | 'id-card'
  | 'passport'
  | 'car'
  | 'palette'
  | 'bitcoin'
  | 'tether'
  | 'binance'
  | 'phone'
  | 'video'
  | 'cloud'
  | 'bullhorn'
  | 'layer-group'
  | 'gamepad'
  | 'crown'
  | 'rocket'
  | 'globe'
  | 'wrench'
  | 'bolt'
  | 'bag'
  | 'fire'
  | 'star'
  | 'lock';

export interface StoreService {
  id: string;
  category: Exclude<CategoryId, 'all'>;
  badge: string;
  title: string;
  desc: string;
  plush: string;
  orbGrad: string;
  iconType: IconType;
  customIconUrl?: string;
  directToolUrl?: string;
  inputLabel: string;
  placeholder: string;
  tiers: string[];
  hidden?: boolean;
}

export interface WebToolItem {
  id: string;
  title: string;
  desc: string;
  toolUrl: string;
  iconUrl?: string;
  iconType: IconType;
  badge: string;
  buttonLabel: string;
  plush: string;
  orbGrad: string;
  openMode: 'new_tab' | 'embed_modal' | 'sim_tab';
  hidden?: boolean;
}

export type FaqCategoryId = 'all' | 'smm' | 'tools' | 'sim' | 'payment';

export interface FaqItem {
  cat: Exclude<FaqCategoryId, 'all'>;
  q: string;
  a: string;
}

export interface StoreCategoryMeta {
  id: CategoryId;
  label: string;
  shortLabel: string;
  iconClass: string;
  iconColor: string;
  iconType?: IconType;
  customIconUrl?: string;
  hidden?: boolean;
}

export const CATEGORY_META: StoreCategoryMeta[] = [
  {
    id: 'all',
    label: 'All Services',
    shortLabel: 'All',
    iconClass: 'fa-solid fa-layer-group',
    iconColor: 'text-pink-500',
    iconType: 'layer-group'
  },
  {
    id: 'capcut_ai',
    label: 'AI, Pro Apps & Hosting',
    shortLabel: 'AI & Pro Apps',
    iconClass: 'fa-solid fa-wand-magic-sparkles',
    iconColor: 'text-purple-600',
    iconType: 'gemini'
  },
  {
    id: 'tiktok_fb',
    label: 'Social Media & Ad Agency',
    shortLabel: 'SMM & Ads',
    iconClass: 'fa-brands fa-tiktok',
    iconColor: 'text-rose-500',
    iconType: 'tiktok'
  },
  {
    id: 'franchise_sim',
    label: 'Franchise & SIM Services',
    shortLabel: 'Franchise & SIM',
    iconClass: 'fa-solid fa-satellite-dish',
    iconColor: 'text-emerald-600',
    iconType: 'satellite'
  },
  {
    id: 'nadra_records',
    label: 'NADRA & Official Records',
    shortLabel: 'NADRA & Records',
    iconClass: 'fa-solid fa-id-card',
    iconColor: 'text-blue-600',
    iconType: 'id-card'
  },
  {
    id: 'creative_crypto',
    label: 'Editing, Design & Crypto',
    shortLabel: 'Creative & Crypto',
    iconClass: 'fa-solid fa-palette',
    iconColor: 'text-amber-500',
    iconType: 'binance'
  }
];

export const DEFAULT_STORE_SERVICES: StoreService[] = [
  // ==================== 1. AI, PRO APPS & HOSTING (capcut_ai) ====================
  {
    id: 'capcut-pro',
    category: 'capcut_ai',
    badge: '🎬 #1 CREATOR APP',
    title: 'CapCut Pro Official (iOS / Android / PC)',
    desc: 'Unlock all Pro effects, auto-captions, 4K 60fps export, AI background remover & 100GB cloud storage.',
    plush: 'plush-capcut',
    orbGrad: 'from-slate-800 via-indigo-900 to-black',
    iconType: 'capcut',
    inputLabel: 'Enter Your WhatsApp Number or Email:',
    placeholder: '0300-1234567 or email@gmail.com',
    tiers: [
      'CapCut Pro 1 Month (Full Warranty) — Rs. 350',
      'CapCut Pro 1 Month Private Account — Rs. 650',
      'CapCut Pro 6 Months Premium — Rs. 1,500',
      'CapCut Pro 1 Year Full Warranty — Rs. 2,500'
    ]
  },
  {
    id: 'lovable-pro',
    category: 'capcut_ai',
    badge: '💜 AI WEB BUILDER',
    title: 'Lovable Pro Subscription (AI App Builder)',
    desc: 'Build full-stack web apps & UI with Lovable Pro AI. High message limits, private projects & custom domains.',
    plush: 'plush-snap',
    orbGrad: 'from-pink-500 via-purple-600 to-indigo-700',
    iconType: 'lovable',
    inputLabel: 'Enter Your Email or WhatsApp Number:',
    placeholder: 'developer@gmail.com',
    tiers: [
      'Lovable Pro 1 Month (Shared Workspace) — Rs. 1,200',
      'Lovable Pro 1 Month (Private Account) — Rs. 3,500',
      'Lovable Pro High-Credits Pack — Rs. 5,500'
    ]
  },
  {
    id: 'gemini-18m-pro',
    category: 'capcut_ai',
    badge: '✨ 18 MONTHS PRO',
    title: 'Google Gemini 18-Month Pro + 2TB One',
    desc: 'Official 18-Month Google Gemini Advanced Pro subscription on your own email with 2TB Google One Cloud.',
    plush: 'plush-website',
    orbGrad: 'from-blue-500 via-indigo-500 to-purple-600',
    iconType: 'gemini',
    inputLabel: 'Enter Your Gmail Address for Activation:',
    placeholder: 'yourname@gmail.com',
    tiers: [
      'Gemini Advanced Pro 18 Months (On Your Mail) — Rs. 1,800',
      'Gemini Advanced Pro 12 Months Private — Rs. 1,350',
      'Gemini Advanced Pro 1 Month Trial Pack — Rs. 350'
    ]
  },
  {
    id: 'muse-ai-1b',
    category: 'capcut_ai',
    badge: '🧠 1 BILLION TOKENS',
    title: 'Muse AI — 1 Billion Tokens Pro Plan',
    desc: 'Massive 1 Billion Tokens quota for AI generation, coding, writing, and unlimited creative workflows.',
    plush: 'plush-ai',
    orbGrad: 'from-emerald-500 via-teal-600 to-cyan-700',
    iconType: 'wand',
    inputLabel: 'Enter Your Email or WhatsApp Number:',
    placeholder: '0300-1234567 or email@gmail.com',
    tiers: [
      'Muse AI 1 Billion Tokens Account — Rs. 1,500',
      'Muse AI Unlimited Creator Access (3 Months) — Rs. 2,800',
      'Muse AI Reseller 5-Accounts Pack — Rs. 6,000'
    ]
  },
  {
    id: 'elevenlabs-300k',
    category: 'capcut_ai',
    badge: '🎙️ NO EXPIRY CREDITS',
    title: 'ElevenLabs 300k Credits (No Expiry)',
    desc: 'Ultra-realistic AI voice cloning & text-to-speech for YouTube automation & TikTok faceless channels.',
    plush: 'plush-srv-2',
    orbGrad: 'from-amber-500 via-orange-500 to-rose-600',
    iconType: 'elevenlabs',
    inputLabel: 'Enter Your Email or WhatsApp Number:',
    placeholder: 'creator@gmail.com',
    tiers: [
      'ElevenLabs 300,000 Credits (No Expiry) — Rs. 1,650',
      'ElevenLabs Creator 100k Credits (1 Month) — Rs. 750',
      'ElevenLabs 1 Million Credits Agency Pack — Rs. 4,500'
    ]
  },
  {
    id: 'chatgpt-plus',
    category: 'capcut_ai',
    badge: '🤖 GPT-4o & o3 PRO',
    title: 'ChatGPT Plus Official Subscription',
    desc: 'Full access to GPT-4o, DALL-E 3 image generation, voice mode, deep research & custom GPTs.',
    plush: 'plush-ai',
    orbGrad: 'from-teal-500 via-emerald-600 to-green-700',
    iconType: 'openai',
    inputLabel: 'Enter Your Email or WhatsApp Number:',
    placeholder: 'yourname@gmail.com',
    tiers: [
      'ChatGPT Plus 1 Month (Shared Pro) — Rs. 550',
      'ChatGPT Plus 1 Month (Private Account) — Rs. 2,200',
      'ChatGPT Plus 3 Months Private Warranty — Rs. 6,000'
    ]
  },
  {
    id: 'claude-ai-pro',
    category: 'capcut_ai',
    badge: '⚡ CLAUDE 3.7 SONNET',
    title: 'Claude AI Pro Official Subscription',
    desc: 'Best AI for coding, scriptwriting & long documents with 5x more usage and Claude 3.7 Sonnet.',
    plush: 'plush-srv-2',
    orbGrad: 'from-orange-500 via-amber-600 to-stone-800',
    iconType: 'claude',
    inputLabel: 'Enter Your Email or WhatsApp Number:',
    placeholder: 'yourname@gmail.com',
    tiers: [
      'Claude AI Pro 1 Month (Shared Workspace) — Rs. 750',
      'Claude AI Pro 1 Month (Private Mail) — Rs. 2,500',
      'Claude AI API Credits Pack — Rs. 3,200'
    ]
  },
  {
    id: 'canva-pro',
    category: 'capcut_ai',
    badge: '🎨 DESIGN SUITE',
    title: 'Canva Pro Official (On Your Email)',
    desc: 'Unlock 100M+ premium templates, Magic Studio AI, background remover & brand kits on your own email.',
    plush: 'plush-srv-4',
    orbGrad: 'from-cyan-500 via-blue-500 to-purple-600',
    iconType: 'canva',
    inputLabel: 'Enter Your Canva Email Address:',
    placeholder: 'design@gmail.com',
    tiers: [
      'Canva Pro 1 Year (On Your Personal Email) — Rs. 250',
      'Canva Pro Lifetime Edu Warranty — Rs. 450',
      'Canva Pro Admin Panel (500 Seats) — Rs. 2,500'
    ]
  },
  {
    id: 'proton-vpn-pro',
    category: 'capcut_ai',
    badge: '🛡️ HIGH-SPEED VPN',
    title: 'Proton VPN Plus (10 Devices / All Countries)',
    desc: 'Ultra-fast Swiss privacy VPN for UK/USA TikTok targeting, streaming & secure browsing with zero logs.',
    plush: 'plush-srv-6',
    orbGrad: 'from-indigo-500 via-purple-600 to-slate-900',
    iconType: 'protonvpn',
    inputLabel: 'Enter Your WhatsApp Number or Email:',
    placeholder: '0300-1234567',
    tiers: [
      'Proton VPN Plus 1 Month (1 Device) — Rs. 300',
      'Proton VPN Plus 1 Month (Private 10 Devices) — Rs. 850',
      'Proton VPN Plus 1 Year Full Warranty — Rs. 2,800'
    ]
  },
  {
    id: 'hostinger-12m',
    category: 'capcut_ai',
    badge: '🌐 12M WEB HOSTING',
    title: 'Hostinger Unlimited Plan (12 Months FW)',
    desc: 'Hostinger Business/Premium 12-Month Unlimited Hosting with Free SSL, NVMe SSD & AI Website Builder.',
    plush: 'plush-snap',
    orbGrad: 'from-purple-600 via-violet-600 to-indigo-800',
    iconType: 'hostinger',
    inputLabel: 'Enter Your Email or Domain Name:',
    placeholder: 'mywebsite.com or email@gmail.com',
    tiers: [
      'Hostinger Unlimited Hosting 12 Months (Full Warranty) — Rs. 3,500',
      'Hostinger Hosting 12M + .com Domain Bundle — Rs. 5,200',
      'Single Website Hosting Slot (1 Year) — Rs. 1,200'
    ]
  },
  {
    id: 'youtube-amazon-ott',
    category: 'capcut_ai',
    badge: '🍿 4K STREAMING',
    title: 'YouTube Premium & Amazon Prime 6M',
    desc: 'Ad-free YouTube Premium + YouTube Music on your email, plus Amazon Prime Video 6-Month & Netflix 4K.',
    plush: 'plush-srv-1',
    orbGrad: 'from-red-500 via-rose-600 to-pink-700',
    iconType: 'youtube',
    inputLabel: 'Enter Your Email or WhatsApp Number:',
    placeholder: 'yourmail@gmail.com',
    tiers: [
      'YouTube Premium 1 Month (On Your Mail) — Rs. 250',
      'YouTube Premium 6 Months (On Your Mail) — Rs. 1,100',
      'Amazon Prime Video 6 Months (Full Warranty) — Rs. 850',
      'Netflix 4K UHD 1 Screen (1 Month) — Rs. 420'
    ]
  },
  {
    id: 'adobe-ms365-suite',
    category: 'capcut_ai',
    badge: '💼 OFFICE & ADOBE',
    title: 'Adobe Express 12M & Microsoft 365 Pro',
    desc: 'Official 12-Month Adobe Express Premium & Microsoft 365 (Word, Excel, PowerPoint + 1TB OneDrive).',
    plush: 'plush-srv-4',
    orbGrad: 'from-blue-600 via-sky-600 to-indigo-700',
    iconType: 'adobe',
    inputLabel: 'Enter Your Email Address for Activation:',
    placeholder: 'office@gmail.com',
    tiers: [
      'Adobe Express Premium 12 Months (On Your Mail) — Rs. 1,200',
      'Microsoft 365 Official 1 Year + 1TB OneDrive — Rs. 950',
      'Adobe Creative Cloud All Apps (1 Month) — Rs. 2,200'
    ]
  },

  // ==================== 2. SOCIAL MEDIA & AD AGENCY (tiktok_fb) ====================
  {
    id: 'tiktok-uk-usa-acc',
    category: 'tiktok_fb',
    badge: '🇬🇧🇺🇸 MONETIZATION',
    title: 'TikTok UK / USA Monetizable Account',
    desc: 'Fresh UK or USA region TikTok account with Creator Rewards Program & TikTok Shop eligibility without VPN.',
    plush: 'plush-tiktok',
    orbGrad: 'from-slate-900 via-rose-600 to-pink-500',
    iconType: 'tiktok',
    inputLabel: 'Enter Your Email or Preferred @Username:',
    placeholder: 'yourname@gmail.com',
    tiers: [
      'Fresh TikTok UK / USA Account (On Your Email) — Rs. 600',
      'TikTok UK Account + 1,000 Followers (Live Ready) — Rs. 1,450',
      'Monetized TikTok UK Account (10K Followers + 100K Views) — Rs. 5,500'
    ]
  },
  {
    id: 'tiktok-ad-agency',
    category: 'tiktok_fb',
    badge: '📈 AD AGENCY VIP',
    title: 'TikTok Ad Agency Account (No Tax / Global)',
    desc: 'Verified TikTok Business Ad Agency Account with worldwide targeting, instant ad approval & low CPM.',
    plush: 'plush-srv-1',
    orbGrad: 'from-rose-600 via-pink-600 to-purple-700',
    iconType: 'bullhorn',
    inputLabel: 'Enter Your Business Name or WhatsApp Number:',
    placeholder: 'My Store / 0300-1234567',
    tiers: [
      'TikTok Ad Agency Account (Self Top-Up) — Rs. 2,500',
      'TikTok Ad Agency Account + $20 Ad Balance — Rs. 8,500',
      'Complete TikTok Shop / E-Commerce Ad Setup — Rs. 4,000'
    ]
  },
  {
    id: 'facebook-ads-service',
    category: 'tiktok_fb',
    badge: '🚀 META ADS PRO',
    title: 'Facebook & Instagram Ads Agency Service',
    desc: 'Run high-converting Facebook & Instagram sponsored ads for your business, page, or WhatsApp sales.',
    plush: 'plush-fb',
    orbGrad: 'from-blue-600 via-indigo-600 to-sky-500',
    iconType: 'meta',
    inputLabel: 'Paste Your FB Page Link or WhatsApp Number:',
    placeholder: 'https://facebook.com/yourpage',
    tiers: [
      '2-Day Trial Ad Campaign (With Budget) — Rs. 1,500',
      '7-Day Sponsored WhatsApp / Leads Campaign — Rs. 5,000',
      'Verified Meta Business Manager / Ad Account — Rs. 3,200'
    ]
  },
  {
    id: 'tt-likes-views-followers',
    category: 'tiktok_fb',
    badge: '🔥 VIRAL BOOST',
    title: 'TikTok Real Followers, Likes & ForYou Views',
    desc: 'Instant non-drop TikTok followers to unlock Live Studio, plus viral likes & millions of video views.',
    plush: 'plush-tiktok',
    orbGrad: 'from-rose-500 via-pink-500 to-purple-600',
    iconType: 'tiktok',
    inputLabel: 'Paste TikTok Video Link or @Username:',
    placeholder: 'https://www.tiktok.com/@username/video/...',
    tiers: [
      '1,000 TikTok Likes + 10K Free Views — Rs. 150',
      '1,000 TikTok Permanent Followers (Unlock Live) — Rs. 350',
      '10,000 TikTok Followers (Monetization Pack) — Rs. 2,800',
      '100,000 (1 Lakh) TikTok Viral Video Views — Rs. 450'
    ]
  },
  {
    id: 'fb-monetization-boost',
    category: 'tiktok_fb',
    badge: '👍 FB MONETIZATION',
    title: 'Facebook Page Likes, Followers & WatchTime',
    desc: 'Grow your Facebook page with organic-style followers, post reactions ❤️, and 60K watch time.',
    plush: 'plush-fb',
    orbGrad: 'from-blue-500 to-indigo-700',
    iconType: 'thumbs-up',
    inputLabel: 'Paste Facebook Page or Post Link:',
    placeholder: 'https://facebook.com/yourpage',
    tiers: [
      '1,000 FB Page Likes + Followers — Rs. 300',
      '5,000 FB Followers + 60K Watch Time Complete — Rs. 2,800',
      '1,000 FB Post Likes / Love ❤️ Reactions — Rs. 180'
    ]
  },
  {
    id: 'ig-yt-social-all',
    category: 'tiktok_fb',
    badge: '📢 ALL SMM SERVICES',
    title: 'Instagram, YouTube & Poll Votes Boost',
    desc: 'All social media services: IG followers/reels, YouTube 1K subs + 4K watch hours, & contest votes.',
    plush: 'plush-ig',
    orbGrad: 'from-amber-400 via-pink-500 to-purple-600',
    iconType: 'instagram',
    inputLabel: 'Paste Profile / Channel / Contest Link:',
    placeholder: 'https://instagram.com/... or youtube.com/...',
    tiers: [
      '1,000 Instagram Non-Drop Followers — Rs. 320',
      '1,000 YouTube Subscribers (Non-Drop) — Rs. 1,200',
      'YouTube 4,000 Hours Watch Time Complete — Rs. 3,500',
      '1,000 Contest / Poll Votes (Any Platform) — Rs. 450'
    ]
  },

  // ==================== 3. FRANCHISE & SIM SERVICES (franchise_sim) ====================
  {
    id: 'sim-owner-details',
    category: 'franchise_sim',
    badge: '📶 2026 FRESH SIM',
    title: 'Fresh SIM Owner Details & All Numbers on CNIC',
    desc: 'Instant franchise lookup for latest 2026 SIM owner name, CNIC, exact address & all active SIMs list.',
    plush: 'plush-srv-3',
    orbGrad: 'from-emerald-500 to-green-700',
    iconType: 'sim',
    inputLabel: 'Enter Target Mobile Number or 13-Digit CNIC:',
    placeholder: '03001234567 or 3520212345671',
    tiers: [
      'Single Fresh SIM Owner + Address Details — Rs. 250',
      'All Active Numbers on CNIC List (Fresh 2026) — Rs. 350',
      'PTCL Landline Number Owner & Address Details — Rs. 400'
    ]
  },
  {
    id: 'cdr-call-history',
    category: 'franchise_sim',
    badge: '📊 CALL HISTORY CDR',
    title: 'Call History Details (CDR) & SMS Record',
    desc: 'Complete incoming/outgoing call history (CDR), tower locations, and top-contacted numbers report.',
    plush: 'plush-sim-search',
    orbGrad: 'from-pink-500 via-rose-500 to-purple-700',
    iconType: 'satellite',
    inputLabel: 'Enter Target Mobile Number (Jazz/Zong/Telenor/Ufone):',
    placeholder: '03XX-XXXXXXX',
    tiers: [
      'Last 1 Month Call History (CDR PDF) — Rs. 2,200',
      'Last 3 Months Complete CDR + Tower Logs — Rs. 3,500',
      'Last 6 Months Full Franchise CDR Report — Rs. 5,000'
    ]
  },
  {
    id: 'live-location-imei',
    category: 'franchise_sim',
    badge: '📍 LIVE PINPOINT',
    title: 'Live Location Tracking & Mobile IMEI Trace',
    desc: 'Real-time active SIM tower pinpoint location on Google Maps and stolen mobile IMEI number tracking.',
    plush: 'plush-srv-1',
    orbGrad: 'from-rose-500 via-red-500 to-amber-600',
    iconType: 'satellite',
    inputLabel: 'Enter Mobile Number or 15-Digit IMEI Number:',
    placeholder: '03001234567 or 358901234567890',
    tiers: [
      'Current Live Location Pinpoint (Google Maps) — Rs. 1,500',
      'Mobile IMEI Tracking (Find Active SIM in Phone) — Rs. 2,000',
      'Live Location + 30-Day Movement History — Rs. 3,200'
    ]
  },
  {
    id: 'easypaisa-jazzcash-help',
    category: 'franchise_sim',
    badge: '💸 WALLET SERVICES',
    title: 'EasyPaisa & JazzCash Account / Limit Setup',
    desc: 'Assistance with new EasyPaisa / JazzCash account opening, biometric verification & limit upgrades.',
    plush: 'plush-whatsapp',
    orbGrad: 'from-emerald-500 via-teal-500 to-cyan-600',
    iconType: 'phone',
    inputLabel: 'Enter Your Mobile Number for Wallet Setup:',
    placeholder: '0347-8936242',
    tiers: [
      'Open New EasyPaisa Account Setup — Rs. 600',
      'Open New JazzCash Account Setup — Rs. 600',
      'Merchant / Level-2 Limit Upgrade Guidance — Rs. 1,200'
    ]
  },

  // ==================== 4. NADRA & OFFICIAL RECORDS (nadra_records) ====================
  {
    id: 'nadra-cnic-frc',
    category: 'nadra_records',
    badge: '🪪 NADRA RECORDS',
    title: 'CNIC Copy, Family Tree (FRC) & Pic Details',
    desc: 'Check NADRA CNIC front/back record, Family Registration Certificate (FRC) tree, and family members list.',
    plush: 'plush-srv-4',
    orbGrad: 'from-blue-600 via-indigo-600 to-slate-800',
    iconType: 'id-card',
    inputLabel: 'Enter 13-Digit CNIC Number:',
    placeholder: '35202-1234567-1',
    tiers: [
      'CNIC Record Verification & Details — Rs. 500',
      'CNIC Color Copy / Verification Print — Rs. 800',
      'Family Members Details (Full Family Tree) — Rs. 1,200',
      'Family Members Pic (FRC Record) — Rs. 1,800'
    ]
  },
  {
    id: 'certificates-nadra',
    category: 'nadra_records',
    badge: '📄 CERTIFICATES',
    title: 'Marriage, Birth & Vaccination Certificates',
    desc: 'Record check and documentation assistance for Marriage, Birth, Divorce, Polio & Corona vaccination.',
    plush: 'plush-srv-3',
    orbGrad: 'from-teal-500 to-emerald-700',
    iconType: 'id-card',
    inputLabel: 'Enter CNIC Number or Applicant Name:',
    placeholder: '35202-1234567-1',
    tiers: [
      'Marriage Status Check on CNIC — Rs. 600',
      'Birth / Marriage / Death Certificate Record Check — Rs. 1,200',
      'Polio / Corona Vaccination Record Check — Rs. 800'
    ]
  },
  {
    id: 'passport-travel-history',
    category: 'nadra_records',
    badge: '🛂 PASSPORT & TRAVEL',
    title: 'Passport Details, Copy & Travel History',
    desc: 'Check passport number, expiry details, international travel history (FIA entry/exit) & status.',
    plush: 'plush-website',
    orbGrad: 'from-sky-600 via-blue-700 to-indigo-900',
    iconType: 'passport',
    inputLabel: 'Enter CNIC Number or Passport Number:',
    placeholder: '35202-1234567-1 or AB1234567',
    tiers: [
      'Passport Details Check via CNIC — Rs. 1,200',
      'Passport Page Copy Record — Rs. 2,000',
      'International Travel History Details — Rs. 3,000',
      'ECL / Travel Status Check — Rs. 2,500'
    ]
  },
  {
    id: 'vehicle-land-fir-check',
    category: 'nadra_records',
    badge: '🚗 VEHICLE & RECORDS',
    title: 'Car Owner, Land Records & FIR Details Check',
    desc: 'Excise vehicle ownership verification (Punjab/Sindh/KPK/ISB), land record lookup & FIR copy check.',
    plush: 'plush-srv-6',
    orbGrad: 'from-slate-700 via-indigo-700 to-blue-900',
    iconType: 'car',
    inputLabel: 'Enter Vehicle Plate Number or CNIC Number:',
    placeholder: 'LEA-2024 or 35202-1234567-1',
    tiers: [
      'Car / Bike Owner & Excise Details — Rs. 450',
      'FIR Details / Copy Record Check — Rs. 1,200',
      'Land Record / Property Ownership Check — Rs. 1,500'
    ]
  },

  // ==================== 5. CREATIVE, GRAPHICS & CRYPTO (creative_crypto) ====================
  {
    id: 'btc-usdt-crypto',
    category: 'creative_crypto',
    badge: '💲 CRYPTO P2P DESK',
    title: 'BTC / USDT Available (Buy & Sell Instant)',
    desc: 'Buy or sell USDT (TRC20/BEP20/Binance) and BTC safely via EasyPaisa, JazzCash, SadaPay or Bank Transfer.',
    plush: 'plush-ig',
    orbGrad: 'from-amber-500 via-yellow-500 to-orange-600',
    iconType: 'binance',
    inputLabel: 'Enter USDT/BTC Amount You Want to Buy or Sell:',
    placeholder: 'e.g. Buy 50 USDT via EasyPaisa',
    tiers: [
      'Buy 10 USDT – 50 USDT (Instant Binance Transfer) — Market Rate',
      'Buy 50 USDT – 500 USDT (Wholesale VIP Rate) — Market Rate',
      'Sell Your USDT / BTC for EasyPaisa / JazzCash — Instant Cash'
    ]
  },
  {
    id: 'video-editing-service',
    category: 'creative_crypto',
    badge: '🎬 SAQIB VISUALS EDIT',
    title: 'Pro Video Editing Service (Reels, TikTok, YT)',
    desc: 'High-retention video editing with 3D captions, colour grading, sound FX & viral transitions.',
    plush: 'plush-srv-5',
    orbGrad: 'from-purple-600 via-pink-500 to-rose-500',
    iconType: 'video',
    inputLabel: 'Describe Your Video Project or Paste Sample Link:',
    placeholder: 'TikTok Reel / YouTube Documentary...',
    tiers: [
      '1 Viral TikTok / Instagram Reel Edit (Up to 60s) — Rs. 600',
      '5 Viral Reels / Shorts Bundle Pack — Rs. 2,500',
      'Full YouTube Video Edit (8–12 Mins Faceless/Vlog) — Rs. 2,200'
    ]
  },
  {
    id: 'graphics-design-docs',
    category: 'creative_crypto',
    badge: '🎨 GRAPHICS & DOCS',
    title: 'Graphics Designing & Document Editing',
    desc: 'Custom logos, social media posts, certificates, business cards, banners, thumbnails & PDF document edits.',
    plush: 'plush-srv-2',
    orbGrad: 'from-pink-500 via-fuchsia-500 to-indigo-600',
    iconType: 'palette',
    inputLabel: 'Describe What You Need Designed or Edited:',
    placeholder: 'Logo Design / Certificate / PDF Edit...',
    tiers: [
      'Custom Logo or 3 Social Media Posts — Rs. 800',
      'Document / Certificate / PDF Clean Editing — Rs. 500',
      'Complete Brand Identity + Banner Pack — Rs. 2,200'
    ]
  },
  {
    id: 'virtual-whatsapp-num',
    category: 'creative_crypto',
    badge: '⚡ VIRTUAL NUMBER',
    title: 'International WhatsApp Virtual Number (UK/US)',
    desc: 'Get a clean UK (+44), USA (+1), or Canada virtual number for WhatsApp Business & account verification.',
    plush: 'plush-whatsapp',
    orbGrad: 'from-green-500 to-emerald-700',
    iconType: 'whatsapp',
    inputLabel: 'Enter Your Contact Number to Receive OTP:',
    placeholder: '0300-1234567',
    tiers: [
      'USA / Canada (+1) WhatsApp Number — Rs. 450',
      'UK (+44) Permanent WhatsApp Number — Rs. 750',
      'Private Calling / Virtual Number App Setup — Rs. 1,200'
    ]
  },
  {
    id: 'custom-web-smm-panel',
    category: 'creative_crypto',
    badge: '💎 FULL-STACK DEV',
    title: 'Custom 3D Glass Website & SMM Panel Setup',
    desc: 'Get your own 3D Acrylic Glass website, SIM Tracker portal, or automated SMM store built by Muhammad Saqib.',
    plush: 'plush-srv-5',
    orbGrad: 'from-indigo-600 via-purple-600 to-pink-600',
    iconType: 'code',
    inputLabel: 'Enter Your Brand Name & WhatsApp Number:',
    placeholder: 'My Brand / 0300-1234567',
    tiers: [
      '3D Glass Portfolio + SIM Tracker Website — Rs. 2,500',
      'Full Services Store Website (Like Saqib Visuals) — Rs. 3,800',
      'Automated SMM Reseller Panel + Backend Setup — Rs. 8,500'
    ]
  }
];

export const DEFAULT_FAQS: FaqItem[] = [
  {
    cat: 'tools',
    q: 'CapCut Pro, Lovable Pro, Gemini 18M aur ElevenLabs kaise milte hain?',
    a: 'Aap Store se apna matlooba AI ya Pro package select kar ke "Buy Now" dabayein. Payment confirm hote hi 5–10 minutes mein aapko official login ya aapke apne Gmail par activation full warranty ke sath mil jati hai.'
  },
  {
    cat: 'smm',
    q: 'TikTok UK/USA Account aur TikTok Ad Agency Account ka kya faida hai?',
    a: 'TikTok UK/USA Account mein aapko بغیر VPN ke Creator Rewards monetization aur TikTok Shop ka option milta hai. Jabke TikTok Ad Agency Account se aap Pakistan samait puri duniya mein low-cost sponsored ads chala sakte hain.'
  },
  {
    cat: 'smm',
    q: 'TikTok Likes, Views aur Followers kitni der mein milte hain?',
    a: 'Payment confirm hone ke 5 se 15 minute ke andar aapka order start ho jata hai! Hamare tamam TikTok aur Facebook followers Non-Drop aur permanent hote hain jin se aap Live aur Monetization asani se on kar sakte hain.'
  },
  {
    cat: 'sim',
    q: 'Franchise SIM Owner Details, CDR aur NADRA FRC kaise hasil karein?',
    a: 'Free SIM Tool mein public records milte hain. Lekin agar aapko 2026 Fresh SIM Owner Details, Call History (CDR), Live Location Pinpoint, ya NADRA Family Tree (FRC) chahiye to Store ke "Franchise & SIM" ya "NADRA & Records" tab se order karein. Confidential report WhatsApp par 15–30 mins mein milti hai.'
  },
  {
    cat: 'payment',
    q: 'Payment karne ka tareeqa kya hai? Kya USDT/BTC bhi mil jayega?',
    a: 'Jee bilkul! Aap EasyPaisa, JazzCash, SadaPay, NayaPay ya Bank Transfer se payment kar sakte hain. Iske ilawa agar aapko Binance ke liye USDT ya BTC buy/sell karna ho to wo bhi instant market rate par dastyab hai.'
  },
  {
    cat: 'tools',
    q: 'Kya Admin Command Center se main naye Tools aur Services (Link, Icon Link, Name, Description) add kar sakta hoon?',
    a: 'Jee haan! Secret /saqibadmb Admin Command Center mein aap koi bhi naya Live Web Tool (Tool Name, Tool Link, Custom Icon Image Link, Description) ya Store Service foran add, edit ya delete kar sakte hain.'
  }
];

export const DEFAULT_WEB_TOOLS: WebToolItem[] = [
  {
    id: 'tool-chatgpt-web',
    title: 'ChatGPT Plus & o3 AI Workspace',
    desc: 'Launch OpenAI ChatGPT web studio for coding, viral scripts, DALL·E 3 images & deep research.',
    toolUrl: 'https://chatgpt.com/',
    iconUrl: '',
    iconType: 'openai',
    badge: '🤖 AI WORKSPACE',
    buttonLabel: 'Open ChatGPT Tool',
    plush: 'plush-ai',
    orbGrad: 'from-emerald-500 via-teal-600 to-green-700',
    openMode: 'new_tab'
  },
  {
    id: 'tool-canva-studio',
    title: 'Canva Pro Visual & Thumbnail Studio',
    desc: 'Create viral YouTube thumbnails, social media posts, logos, presentations & brand kits.',
    toolUrl: 'https://www.canva.com/',
    iconUrl: '',
    iconType: 'canva',
    badge: '🎨 DESIGN STUDIO',
    buttonLabel: 'Open Canva Studio',
    plush: 'plush-srv-2',
    orbGrad: 'from-pink-500 via-rose-500 to-purple-600',
    openMode: 'new_tab'
  },
  {
    id: 'tool-gemini-studio',
    title: 'Google Gemini Pro & Veo AI Studio',
    desc: 'Access Google Gemini Advanced 2.5 Pro workspace & AI Studio for prompts, docs & video.',
    toolUrl: 'https://gemini.google.com/',
    iconUrl: '',
    iconType: 'gemini',
    badge: '✨ GOOGLE AI',
    buttonLabel: 'Open Gemini Tool',
    plush: 'plush-website',
    orbGrad: 'from-blue-500 via-indigo-500 to-purple-600',
    openMode: 'new_tab'
  },
  {
    id: 'tool-capcut-cloud',
    title: 'CapCut Pro Web Editor & Templates',
    desc: 'Open CapCut online video editor, viral TikTok templates, auto-captions & 4K export studio.',
    toolUrl: 'https://www.capcut.com/',
    iconUrl: '',
    iconType: 'capcut',
    badge: '🎬 CREATOR TOOL',
    buttonLabel: 'Launch CapCut Web',
    plush: 'plush-capcut',
    orbGrad: 'from-slate-900 via-indigo-900 to-purple-700',
    openMode: 'new_tab'
  },
  {
    id: 'tool-lovable-builder',
    title: 'Lovable AI Full-Stack App Builder',
    desc: 'Build & deploy full-stack React, Supabase & Tailwind web apps from a single prompt.',
    toolUrl: 'https://lovable.dev/',
    iconUrl: '',
    iconType: 'lovable',
    badge: '💻 AI DEV TOOL',
    buttonLabel: 'Open Lovable Studio',
    plush: 'plush-snap',
    orbGrad: 'from-pink-500 via-fuchsia-600 to-indigo-600',
    openMode: 'new_tab'
  },
  {
    id: 'tool-elevenlabs-voice',
    title: 'ElevenLabs AI Voice & Dubbing Studio',
    desc: 'Generate ultra-realistic Urdu, Hindi & English AI voiceovers for TikTok & YouTube Automation.',
    toolUrl: 'https://elevenlabs.io/',
    iconUrl: '',
    iconType: 'elevenlabs',
    badge: '🎙️ VOICE AI TOOL',
    buttonLabel: 'Open Voice Studio',
    plush: 'plush-ig',
    orbGrad: 'from-amber-500 via-orange-500 to-pink-600',
    openMode: 'new_tab'
  }
];

