'use client';

import React from 'react';
import { CategoryId, IconType, StoreCategoryMeta } from '../data/defaultCatalog';
import {
  SiGooglegemini,
  SiClaude,
  SiElevenlabs,
  SiProtonvpn,
  SiHostinger,
  SiTiktok,
  SiFacebook,
  SiMeta,
  SiInstagram,
  SiYoutube,
  SiNetflix,
  SiBitcoin,
  SiTether,
  SiBinance,
  SiWhatsapp,
  SiTelegram,
  SiGoogle,
  SiReact
} from 'react-icons/si';
import {
  RiOpenaiFill,
  RiHeartPulseFill,
  RiFilmAiFill,
  RiPaletteFill,
  RiSparkling2Fill
} from 'react-icons/ri';
import { BiLogoAdobe } from 'react-icons/bi';
import {
  FaWandMagicSparkles,
  FaScissors,
  FaCode,
  FaBullhorn,
  FaSimCard,
  FaSatelliteDish,
  FaIdCard,
  FaPassport,
  FaCarSide,
  FaShieldHalved,
  FaServer,
  FaCloudArrowUp,
  FaPalette,
  FaClapperboard,
  FaMobileScreenButton,
  FaWallet,
  FaBuildingColumns,
  FaLayerGroup,
  FaBolt,
  FaCircleCheck,
  FaWhatsapp,
  FaCrown,
  FaRocket,
  FaBagShopping,
  FaMagnifyingGlass,
  FaVolumeHigh,
  FaVolumeXmark,
  FaPlus,
  FaTrashCan,
  FaPenToSquare,
  FaArrowUpRightFromSquare,
  FaCopy,
  FaHeadset,
  FaCircleQuestion,
  FaStore,
  FaTableCellsLarge,
  FaBars,
  FaUserPlus,
  FaPlay,
  FaThumbsUp,
  FaAmazon,
  FaMicrosoft,
  FaLocationDot,
  FaFire,
  FaStar,
  FaHeart,
  FaDroplet,
  FaShuttleSpace,
  FaLock,
  FaUserShield,
  FaCheck,
  FaXmark,
  FaSliders,
  FaRotateLeft,
  FaScrewdriverWrench,
  FaFileInvoiceDollar,
  FaReceipt,
  FaImages,
  FaEye,
  FaPaperPlane,
  FaFilter,
  FaCalculator,
  FaChartLine,
  FaAward,
  FaGlobe,
  FaHandshake,
  FaClock,
  FaKey,
  FaTowerCell,
  FaFingerprint,
  FaFilePdf,
  FaGamepad
} from 'react-icons/fa6';

export const BRAND_ICON_OPTIONS: { value: IconType; label: string }[] = [
  { value: 'openai', label: '🤖 ChatGPT / OpenAI' },
  { value: 'gemini', label: '✨ Google Gemini AI' },
  { value: 'claude', label: '⚡ Claude AI / Anthropic' },
  { value: 'elevenlabs', label: '🎙️ ElevenLabs Voice AI' },
  { value: 'capcut', label: '🎬 CapCut Pro Video' },
  { value: 'lovable', label: '💜 Lovable AI Builder' },
  { value: 'canva', label: '🎨 Canva Pro Studio' },
  { value: 'protonvpn', label: '🛡️ Proton VPN Plus' },
  { value: 'hostinger', label: '🌐 Hostinger Hosting' },
  { value: 'adobe', label: '🅰️ Adobe Creative Cloud' },
  { value: 'microsoft', label: '🪟 Microsoft 365 / Office' },
  { value: 'youtube', label: '▶️ YouTube Premium' },
  { value: 'netflix', label: '🍿 Netflix 4K UHD' },
  { value: 'amazon', label: '📦 Amazon Prime Video' },
  { value: 'tiktok', label: '🎵 TikTok Official' },
  { value: 'facebook', label: '👍 Facebook Official' },
  { value: 'meta', label: '♾️ Meta Ads Agency' },
  { value: 'instagram', label: '📸 Instagram Official' },
  { value: 'whatsapp', label: '💬 WhatsApp Official' },
  { value: 'telegram', label: '✈️ Telegram Official' },
  { value: 'binance', label: '🔶 Binance / USDT P2P' },
  { value: 'bitcoin', label: '₿ Bitcoin Crypto' },
  { value: 'tether', label: '💲 USDT Tether' },
  { value: 'sim', label: '🪪 Telecom SIM Card' },
  { value: 'satellite', label: '📡 Satellite / CDR / Location' },
  { value: 'id-card', label: '🆔 NADRA CNIC / FRC Card' },
  { value: 'passport', label: '🛂 Passport & FIA Travel' },
  { value: 'car', label: '🚗 Excise Vehicle & Records' },
  { value: 'wand', label: '✨ AI Magic Sparkles' },
  { value: 'code', label: '💻 Full-Stack Code / React' },
  { value: 'bullhorn', label: '📢 Ad Agency Megaphone' },
  { value: 'shield', label: '🛡️ Security Shield' },
  { value: 'server', label: '🖥️ Dedicated Server' },
  { value: 'cloud', label: '☁️ Cloud Storage' },
  { value: 'palette', label: '🎨 Graphics & Branding' },
  { value: 'video', label: '🎥 Video Editing Clapperboard' },
  { value: 'phone', label: '📱 Mobile Wallet / EasyPaisa' },
  { value: 'gamepad', label: '🎮 Gaming / PUBG / Steam' },
  { value: 'crown', label: '👑 VIP / Royal Crown' },
  { value: 'rocket', label: '🚀 Rocket / Fast Boost' },
  { value: 'globe', label: '🌍 Global / Web Domain' },
  { value: 'wrench', label: '🛠️ Web Tool / Utility Wrench' },
  { value: 'bolt', label: '⚡ Instant Flash / Bolt' },
  { value: 'bag', label: '🛍️ Store / Shopping Bag' },
  { value: 'fire', label: '🔥 Trending / Hot Fire' },
  { value: 'star', label: '⭐ Featured / Premium Star' },
  { value: 'lock', label: '🔒 Private / Security Lock' },
  { value: 'layer-group', label: '🗂️ All Categories / Layers' },
  { value: 'user-plus', label: '👥 Followers / User Growth' },
  { value: 'play', label: '▶️ Video Views / Play' },
  { value: 'thumbs-up', label: '👍 Likes & Engagement' }
];

export function resolveSmartIconType(iconType: IconType, contextText?: string): IconType {
  const ctx = (contextText || '').toLowerCase();
  if (ctx.includes('chatgpt') || ctx.includes('openai') || ctx.includes('gpt-4')) return 'openai';
  if (ctx.includes('gemini') || ctx.includes('google one') || ctx.includes('veo')) return 'gemini';
  if (ctx.includes('claude') || ctx.includes('anthropic') || ctx.includes('sonnet')) return 'claude';
  if (ctx.includes('elevenlabs') || ctx.includes('voice studio') || ctx.includes('voice ai')) return 'elevenlabs';
  if (ctx.includes('lovable')) return 'lovable';
  if (ctx.includes('canva')) return 'canva';
  if (ctx.includes('capcut')) return 'capcut';
  if (ctx.includes('proton') || ctx.includes('vpn')) return 'protonvpn';
  if (ctx.includes('hostinger') || ctx.includes('hosting')) return 'hostinger';
  if (ctx.includes('adobe') || ctx.includes('premiere') || ctx.includes('photoshop')) return 'adobe';
  if (ctx.includes('netflix')) return 'netflix';
  if (ctx.includes('prime video') || ctx.includes('amazon')) return 'amazon';
  if (ctx.includes('microsoft') || ctx.includes('office 365')) return 'microsoft';
  if (ctx.includes('tiktok')) return 'tiktok';
  if (ctx.includes('meta') || ctx.includes('ad agency')) return 'meta';
  if (ctx.includes('facebook') || ctx.includes('fb ')) return 'facebook';
  if (ctx.includes('instagram')) return 'instagram';
  if (ctx.includes('youtube')) return 'youtube';
  if (ctx.includes('whatsapp')) return 'whatsapp';
  if (ctx.includes('telegram')) return 'telegram';
  if (ctx.includes('binance') || ctx.includes('usdt') || ctx.includes('crypto')) return 'binance';
  if (ctx.includes('bitcoin') || ctx.includes('btc')) return 'bitcoin';
  if (ctx.includes('cdr') || ctx.includes('location') || ctx.includes('imei')) return 'satellite';
  if (ctx.includes('sim') || ctx.includes('telecom')) return 'sim';
  if (ctx.includes('nadra') || ctx.includes('frc') || ctx.includes('cnic') || ctx.includes('certificate')) return 'id-card';
  if (ctx.includes('passport') || ctx.includes('travel')) return 'passport';
  if (ctx.includes('vehicle') || ctx.includes('car ') || ctx.includes('excise')) return 'car';
  return iconType || 'wand';
}

export function renderServiceIcon(
  iconType: IconType,
  contextText?: string,
  sizeClass = 'w-4 h-4 sm:w-6 sm:h-6 text-white drop-shadow-xs'
) {
  const resolved = resolveSmartIconType(iconType, contextText);

  switch (resolved) {
    case 'openai':
      return <RiOpenaiFill className={sizeClass} />;
    case 'gemini':
      return <SiGooglegemini className={sizeClass} />;
    case 'claude':
      return <SiClaude className={sizeClass} />;
    case 'elevenlabs':
      return <SiElevenlabs className={sizeClass} />;
    case 'lovable':
      return <RiHeartPulseFill className={sizeClass} />;
    case 'canva':
      return <RiPaletteFill className={sizeClass} />;
    case 'protonvpn':
      return <SiProtonvpn className={sizeClass} />;
    case 'hostinger':
      return <SiHostinger className={sizeClass} />;
    case 'adobe':
      return <BiLogoAdobe className={sizeClass} />;
    case 'microsoft':
      return <FaMicrosoft className={sizeClass} />;
    case 'netflix':
      return <SiNetflix className={sizeClass} />;
    case 'amazon':
      return <FaAmazon className={sizeClass} />;
    case 'tiktok':
      return <SiTiktok className={sizeClass} />;
    case 'facebook':
      return <SiFacebook className={sizeClass} />;
    case 'meta':
      return <SiMeta className={sizeClass} />;
    case 'instagram':
      return <SiInstagram className={sizeClass} />;
    case 'youtube':
      return <SiYoutube className={sizeClass} />;
    case 'whatsapp':
      return <SiWhatsapp className={sizeClass} />;
    case 'telegram':
      return <SiTelegram className={sizeClass} />;
    case 'binance':
      return <SiBinance className={sizeClass} />;
    case 'bitcoin':
      return <SiBitcoin className={sizeClass} />;
    case 'tether':
      return <SiTether className={sizeClass} />;
    case 'capcut':
      return <FaScissors className={sizeClass} />;
    case 'user-plus':
      return <FaUserPlus className={sizeClass} />;
    case 'play':
      return <FaPlay className={sizeClass} />;
    case 'thumbs-up':
      return <FaThumbsUp className={sizeClass} />;
    case 'wand':
      return <FaWandMagicSparkles className={sizeClass} />;
    case 'sim':
      return <FaSimCard className={sizeClass} />;
    case 'satellite':
      return <FaSatelliteDish className={sizeClass} />;
    case 'code':
      return <SiReact className={sizeClass} />;
    case 'shield':
      return <FaShieldHalved className={sizeClass} />;
    case 'server':
      return <FaServer className={sizeClass} />;
    case 'id-card':
      return <FaIdCard className={sizeClass} />;
    case 'passport':
      return <FaPassport className={sizeClass} />;
    case 'car':
      return <FaCarSide className={sizeClass} />;
    case 'palette':
      return <FaPalette className={sizeClass} />;
    case 'phone':
      return <FaMobileScreenButton className={sizeClass} />;
    case 'video':
      return <FaClapperboard className={sizeClass} />;
    case 'cloud':
      return <FaCloudArrowUp className={sizeClass} />;
    case 'bullhorn':
      return <FaBullhorn className={sizeClass} />;
    case 'layer-group':
      return <FaLayerGroup className={sizeClass} />;
    case 'gamepad':
      return <FaGamepad className={sizeClass} />;
    case 'crown':
      return <FaCrown className={sizeClass} />;
    case 'rocket':
      return <FaRocket className={sizeClass} />;
    case 'globe':
      return <FaGlobe className={sizeClass} />;
    case 'wrench':
      return <FaScrewdriverWrench className={sizeClass} />;
    case 'bolt':
      return <FaBolt className={sizeClass} />;
    case 'bag':
      return <FaBagShopping className={sizeClass} />;
    case 'fire':
      return <FaFire className={sizeClass} />;
    case 'star':
      return <FaStar className={sizeClass} />;
    case 'lock':
      return <FaLock className={sizeClass} />;
    default:
      return <RiSparkling2Fill className={sizeClass} />;
  }
}

export function renderOrbVisual(
  iconType: IconType,
  customIconUrl?: string,
  contextText?: string
) {
  const trimmedUrl = (customIconUrl || '').trim();
  const isLegacyOrFaviconUrl =
    trimmedUrl.includes('google.com/s2/favicons') ||
    trimmedUrl.includes('wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg') ||
    trimmedUrl.includes('gstatic.com/lamda/images/gemini_sparkle');

  if (trimmedUrl && !isLegacyOrFaviconUrl) {
    return (
      <img
        src={trimmedUrl}
        alt=""
        loading="lazy"
        decoding="async"
        className="w-5 h-5 sm:w-7 sm:h-7 object-contain rounded-lg drop-shadow"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
      />
    );
  }
  return renderServiceIcon(iconType, contextText);
}

export function renderCategoryIcon(
  catId: CategoryId,
  className = 'w-3.5 h-3.5',
  categoryMeta?: StoreCategoryMeta
) {
  const trimmedCustomUrl = (categoryMeta?.customIconUrl || '').trim();
  if (trimmedCustomUrl) {
    return (
      <img
        src={trimmedCustomUrl}
        alt=""
        loading="lazy"
        decoding="async"
        className={`${className} object-contain rounded-xs inline-block`}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
      />
    );
  }

  if (categoryMeta?.iconType) {
    return renderServiceIcon(categoryMeta.iconType, undefined, className);
  }

  switch (catId) {
    case 'all':
      return <FaLayerGroup className={className} />;
    case 'capcut_ai':
      return <SiGooglegemini className={className} />;
    case 'tiktok_fb':
      return <SiTiktok className={className} />;
    case 'franchise_sim':
      return <FaSatelliteDish className={className} />;
    case 'nadra_records':
      return <FaIdCard className={className} />;
    case 'creative_crypto':
      return <SiBinance className={className} />;
    default:
      return <FaLayerGroup className={className} />;
  }
}

export function renderMarqueeIcon(itemId: string, className = 'w-4 h-4 text-white') {
  switch (itemId) {
    case 'm-chatgpt':
      return <RiOpenaiFill className={className} />;
    case 'm-gemini':
      return <SiGooglegemini className={className} />;
    case 'm-capcut':
      return <FaScissors className={className} />;
    case 'm-lovable':
      return <RiHeartPulseFill className={className} />;
    case 'm-elevenlabs':
      return <SiElevenlabs className={className} />;
    case 'm-muse':
      return <FaWandMagicSparkles className={className} />;
    case 'm-claude':
      return <SiClaude className={className} />;
    case 'm-tt-uk':
      return <SiTiktok className={className} />;
    case 'm-tt-agency':
      return <SiMeta className={className} />;
    case 'm-sim-cdr':
      return <FaSatelliteDish className={className} />;
    case 'm-nadra-frc':
      return <FaIdCard className={className} />;
    case 'm-canva-host':
      return <SiHostinger className={className} />;
    case 'm-usdt':
      return <SiBinance className={className} />;
    default:
      return <RiSparkling2Fill className={className} />;
  }
}

export function renderPaymentMethodIcon(methodId: string, className = 'w-4 h-4') {
  const m = methodId.toLowerCase();
  if (m.includes('easypaisa')) {
    return <FaMobileScreenButton className={className} />;
  }
  if (m.includes('jazzcash')) {
    return <FaWallet className={className} />;
  }
  if (m.includes('sadapay') || m.includes('bank') || m.includes('raast')) {
    return <FaBuildingColumns className={className} />;
  }
  if (m.includes('binance') || m.includes('usdt') || m.includes('btc')) {
    return <SiBinance className={className} />;
  }
  return <FaWallet className={className} />;
}

export function renderMappedFaIcon(iconClass: string, className = 'w-4 h-4') {
  const ic = (iconClass || '').toLowerCase();
  if (ic.includes('fa-tiktok')) return <SiTiktok className={className} />;
  if (ic.includes('fa-facebook')) return <SiFacebook className={className} />;
  if (ic.includes('fa-instagram')) return <SiInstagram className={className} />;
  if (ic.includes('fa-youtube')) return <SiYoutube className={className} />;
  if (ic.includes('fa-whatsapp')) return <SiWhatsapp className={className} />;
  if (ic.includes('fa-bitcoin')) return <SiBinance className={className} />;
  if (ic.includes('fa-google')) return <SiGoogle className={className} />;
  if (ic.includes('fa-robot')) return <RiOpenaiFill className={className} />;
  if (ic.includes('fa-wand-magic-sparkles')) return <SiGooglegemini className={className} />;
  if (ic.includes('fa-microphone')) return <SiElevenlabs className={className} />;
  if (ic.includes('fa-clapperboard') || ic.includes('fa-video')) return <RiFilmAiFill className={className} />;
  if (ic.includes('fa-code')) return <SiReact className={className} />;
  if (ic.includes('fa-satellite-dish') || ic.includes('fa-tower-cell')) return <FaSatelliteDish className={className} />;
  if (ic.includes('fa-sim-card')) return <FaSimCard className={className} />;
  if (ic.includes('fa-id-card')) return <FaIdCard className={className} />;
  if (ic.includes('fa-passport')) return <FaPassport className={className} />;
  if (ic.includes('fa-car')) return <FaCarSide className={className} />;
  if (ic.includes('fa-shield')) return <SiProtonvpn className={className} />;
  if (ic.includes('fa-server')) return <SiHostinger className={className} />;
  if (ic.includes('fa-palette')) return <FaPalette className={className} />;
  if (ic.includes('fa-bullhorn')) return <FaBullhorn className={className} />;
  if (ic.includes('fa-mobile')) return <FaMobileScreenButton className={className} />;
  if (ic.includes('fa-wallet')) return <FaWallet className={className} />;
  if (ic.includes('fa-building-columns')) return <FaBuildingColumns className={className} />;
  if (ic.includes('fa-layer-group')) return <FaLayerGroup className={className} />;
  if (ic.includes('fa-bolt')) return <FaBolt className={className} />;
  if (ic.includes('fa-check')) return <FaCircleCheck className={className} />;
  if (ic.includes('fa-crown')) return <FaCrown className={className} />;
  if (ic.includes('fa-rocket')) return <FaRocket className={className} />;
  if (ic.includes('fa-bag-shopping')) return <FaBagShopping className={className} />;
  if (ic.includes('fa-magnifying-glass')) return <FaMagnifyingGlass className={className} />;
  if (ic.includes('fa-volume-high')) return <FaVolumeHigh className={className} />;
  if (ic.includes('fa-volume-xmark')) return <FaVolumeXmark className={className} />;
  if (ic.includes('fa-plus')) return <FaPlus className={className} />;
  if (ic.includes('fa-trash')) return <FaTrashCan className={className} />;
  if (ic.includes('fa-pen')) return <FaPenToSquare className={className} />;
  if (ic.includes('fa-arrow-up-right-from-square')) return <FaArrowUpRightFromSquare className={className} />;
  if (ic.includes('fa-copy')) return <FaCopy className={className} />;
  if (ic.includes('fa-headset')) return <FaHeadset className={className} />;
  if (ic.includes('fa-circle-question')) return <FaCircleQuestion className={className} />;
  if (ic.includes('fa-store')) return <FaStore className={className} />;
  if (ic.includes('fa-table-cells')) return <FaTableCellsLarge className={className} />;
  if (ic.includes('fa-bars')) return <FaBars className={className} />;
  if (ic.includes('fa-location')) return <FaLocationDot className={className} />;
  if (ic.includes('fa-fire')) return <FaFire className={className} />;
  if (ic.includes('fa-star')) return <FaStar className={className} />;
  if (ic.includes('fa-heart')) return <FaHeart className={className} />;
  if (ic.includes('fa-droplet')) return <FaDroplet className={className} />;
  if (ic.includes('fa-shuttle-space')) return <FaShuttleSpace className={className} />;
  if (ic.includes('fa-lock')) return <FaLock className={className} />;
  if (ic.includes('fa-user-shield')) return <FaUserShield className={className} />;
  if (ic.includes('fa-xmark')) return <FaXmark className={className} />;
  if (ic.includes('fa-sliders')) return <FaSliders className={className} />;
  if (ic.includes('fa-rotate-left')) return <FaRotateLeft className={className} />;
  if (ic.includes('fa-screwdriver-wrench')) return <FaScrewdriverWrench className={className} />;
  if (ic.includes('fa-file-invoice')) return <FaFileInvoiceDollar className={className} />;
  if (ic.includes('fa-receipt')) return <FaReceipt className={className} />;
  if (ic.includes('fa-images')) return <FaImages className={className} />;
  if (ic.includes('fa-eye')) return <FaEye className={className} />;
  if (ic.includes('fa-paper-plane')) return <FaPaperPlane className={className} />;
  if (ic.includes('fa-filter')) return <FaFilter className={className} />;
  if (ic.includes('fa-calculator')) return <FaCalculator className={className} />;
  if (ic.includes('fa-chart-line')) return <FaChartLine className={className} />;
  if (ic.includes('fa-award')) return <FaAward className={className} />;
  if (ic.includes('fa-globe')) return <FaGlobe className={className} />;
  if (ic.includes('fa-handshake')) return <FaHandshake className={className} />;
  if (ic.includes('fa-clock')) return <FaClock className={className} />;
  if (ic.includes('fa-key')) return <FaKey className={className} />;
  if (ic.includes('fa-fingerprint')) return <FaFingerprint className={className} />;
  if (ic.includes('fa-file-pdf')) return <FaFilePdf className={className} />;
  return <RiSparkling2Fill className={className} />;
}

export {
  SiGooglegemini,
  SiClaude,
  SiElevenlabs,
  SiProtonvpn,
  SiHostinger,
  SiTiktok,
  SiFacebook,
  SiMeta,
  SiInstagram,
  SiYoutube,
  SiNetflix,
  SiBitcoin,
  SiTether,
  SiBinance,
  SiWhatsapp,
  SiTelegram,
  SiGoogle,
  SiReact,
  RiOpenaiFill,
  RiHeartPulseFill,
  RiFilmAiFill,
  RiPaletteFill,
  RiSparkling2Fill,
  BiLogoAdobe,
  FaWandMagicSparkles,
  FaScissors,
  FaCode,
  FaBullhorn,
  FaSimCard,
  FaSatelliteDish,
  FaIdCard,
  FaPassport,
  FaCarSide,
  FaShieldHalved,
  FaServer,
  FaCloudArrowUp,
  FaPalette,
  FaClapperboard,
  FaMobileScreenButton,
  FaWallet,
  FaBuildingColumns,
  FaLayerGroup,
  FaBolt,
  FaCircleCheck,
  FaWhatsapp,
  FaCrown,
  FaRocket,
  FaBagShopping,
  FaMagnifyingGlass,
  FaVolumeHigh,
  FaVolumeXmark,
  FaPlus,
  FaTrashCan,
  FaPenToSquare,
  FaArrowUpRightFromSquare,
  FaCopy,
  FaHeadset,
  FaCircleQuestion,
  FaStore,
  FaTableCellsLarge,
  FaBars,
  FaUserPlus,
  FaPlay,
  FaThumbsUp,
  FaAmazon,
  FaMicrosoft,
  FaLocationDot,
  FaFire,
  FaStar,
  FaHeart,
  FaDroplet,
  FaShuttleSpace,
  FaLock,
  FaUserShield,
  FaCheck,
  FaXmark,
  FaSliders,
  FaRotateLeft,
  FaScrewdriverWrench,
  FaFileInvoiceDollar,
  FaReceipt,
  FaImages,
  FaEye,
  FaPaperPlane,
  FaFilter,
  FaCalculator,
  FaChartLine,
  FaAward,
  FaGlobe,
  FaHandshake,
  FaClock,
  FaKey,
  FaTowerCell,
  FaFingerprint,
  FaFilePdf
};
