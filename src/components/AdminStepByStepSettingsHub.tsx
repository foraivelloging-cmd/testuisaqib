import React, { useState, useEffect } from 'react';
import {
  CategoryId,
  IconType,
  StoreService,
  WebToolItem,
  StoreCategoryMeta,
  CATEGORY_META
} from '../data/defaultCatalog';
import {
  DepositMethodMeta,
  DEPOSIT_METHODS,
  PaymentProofRequest,
  AdminPaymentApprovalStudio
} from './WalletAndAdminPayments';
import {
  WebsiteUiThemeMode,
  WebsiteFontMode,
  STORE_FONT_PACKS,
  AdminUiThemeSwitcherStudio
} from './AstroNeumorphicDeck';
import {
  BRAND_ICON_OPTIONS as ICON_OPTIONS,
  renderOrbVisual,
  renderServiceIcon,
  renderCategoryIcon,
  renderPaymentMethodIcon,
  SiWhatsapp,
  SiTiktok,
  FaRocket,
  FaArrowUpRightFromSquare,
  FaTrashCan,
  FaPenToSquare,
  FaScrewdriverWrench
} from './BrandIcons';
import {
  FaChevronRight,
  FaArrowLeft,
  FaMagnifyingGlass,
  FaBagShopping,
  FaCreditCard,
  FaBuildingColumns,
  FaWandMagicSparkles,
  FaPanorama,
  FaGlobe,
  FaShareNodes,
  FaSliders,
  FaPlus,
  FaCheck,
  FaRotateLeft,
  FaCopy,
  FaEye,
  FaVolumeHigh,
  FaCircleCheck,
  FaLayerGroup,
  FaFont,
  FaShieldHalved,
  FaBolt,
  FaImages
} from 'react-icons/fa6';

export interface SiteBannerConfig {
  showHeroBanner: boolean;
  showTopStrip: boolean;
  rgbBorderEnabled: boolean;
  topStripTitle: string;
  badgeText: string;
  mainTitle: string;
  highlightTitle: string;
  description: string;
  portraitUrl: string;
}

export interface SiteContactConfig {
  whatsappNumberClean: string;
  whatsappNumberDisplay: string;
  whatsappDefaultMessage: string;
  supportEmail: string;
  officialWebsiteUrl: string;
  officialWebsiteLabel: string;
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

export interface SiteSettingsConfig {
  banner: SiteBannerConfig;
  contact: SiteContactConfig;
  socials: SiteSocialsConfig;
  footer: SiteFooterConfig;
  paymentMethods: DepositMethodMeta[];
  categories: StoreCategoryMeta[];
}

export const SITE_CONFIG_STORAGE_KEY = 'saqib_visuals_site_config_v1';

export const DEFAULT_SITE_CONFIG: SiteSettingsConfig = {
  banner: {
    showHeroBanner: true,
    showTopStrip: true,
    rgbBorderEnabled: true,
    topStripTitle: 'MUHAMMAD SAQIB • VISUALS HUB',
    badgeText: 'ALL DIGITAL, AI, SMM, FRANCHISE & NADRA SERVICES AVAILABLE',
    mainTitle: 'Muhammad Saqib',
    highlightTitle: '— Saqib Visuals',
    description:
      'Get Instant CapCut Pro, Lovable Pro, Gemini 18M, ChatGPT, Claude, Muse AI 1B & ElevenLabs, TikTok UK/USA & Ad Agency Accounts, Franchise SIM/CDR/IMEI Tracking, NADRA FRC/Passport Records & USDT/Video/Graphics!',
    portraitUrl: 'https://ik.imagekit.io/mrsaqib/mrsaqib242-img25_7oG52NZUY.png'
  },
  contact: {
    whatsappNumberClean: '923478936242',
    whatsappNumberDisplay: '+92 347 8936242',
    whatsappDefaultMessage: 'Assalam-o-Alaikum Muhammad Saqib! Mujhe apki services chahiye.',
    supportEmail: 'support@saqibvisuals.com',
    officialWebsiteUrl: 'https://mrsaqib242.vercel.app',
    officialWebsiteLabel: 'mrsaqib242.vercel.app'
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
  categories: CATEGORY_META
};

export type AdminSettingsScreenId =
  | 'home'
  | 'categories'
  | 'services'
  | 'tools'
  | 'banner'
  | 'payment_methods'
  | 'payments'
  | 'contact_footer'
  | 'ui';

interface PlushOption {
  value: string;
  label: string;
  orb: string;
}

interface PlanRowItem {
  name: string;
  price: string;
}

function parseTiersToPlanRows(tiersText: string): PlanRowItem[] {
  const lines = tiersText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) {
    return [{ name: '1 Month Package', price: '500' }];
  }
  return lines.map((line) => {
    const dashParts = line.split(/\s*[—–-]\s*Rs\.?\s*/i);
    if (dashParts.length >= 2) {
      return {
        name: dashParts[0].trim(),
        price: dashParts.slice(1).join(' ').replace(/[^0-9,]/g, '').trim() || '500'
      };
    }
    const rsMatch = line.match(/^(.*?)\s*Rs\.?\s*([\d,]+)(.*)$/i);
    if (rsMatch) {
      const cleanName = rsMatch[1].replace(/[—–-]\s*$/, '').trim() || 'Standard Plan';
      return {
        name: cleanName,
        price: rsMatch[2].trim()
      };
    }
    return { name: line, price: '' };
  });
}

function formatPlanRowsToTiersText(rows: PlanRowItem[]): string {
  return rows
    .filter((r) => r.name.trim() || r.price.trim())
    .map((r) => {
      const cleanName = r.name.trim() || 'Package';
      const cleanPrice = r.price.trim();
      if (!cleanPrice) return cleanName;
      const hasRs = /^rs\.?/i.test(cleanPrice);
      return `${cleanName} — ${hasRs ? cleanPrice : `Rs. ${cleanPrice}`}`;
    })
    .join('\n');
}

interface AdminStepByStepSettingsHubProps {
  siteConfig: SiteSettingsConfig;
  onUpdateSiteConfig: React.Dispatch<React.SetStateAction<SiteSettingsConfig>>;
  onResetSiteConfig: () => void;
  onReassignDeletedCategory?: (
    deletedCatId: CategoryId,
    fallbackCatId: Exclude<CategoryId, 'all'>
  ) => void;
  // Store Services Props
  servicesCatalog: StoreService[];
  editingServiceId: string | null;
  adminTitle: string;
  setAdminTitle: (v: string) => void;
  adminCategory: Exclude<CategoryId, 'all'>;
  setAdminCategory: (v: Exclude<CategoryId, 'all'>) => void;
  adminBadge: string;
  setAdminBadge: (v: string) => void;
  adminDesc: string;
  setAdminDesc: (v: string) => void;
  adminPlush: string;
  setAdminPlush: (v: string) => void;
  adminIconType: IconType;
  setAdminIconType: (v: IconType) => void;
  adminCustomIconUrl: string;
  setAdminCustomIconUrl: (v: string) => void;
  adminDirectToolUrl: string;
  setAdminDirectToolUrl: (v: string) => void;
  adminInputLabel: string;
  setAdminInputLabel: (v: string) => void;
  adminPlaceholder: string;
  setAdminPlaceholder: (v: string) => void;
  adminTiersText: string;
  setAdminTiersText: (v: string) => void;
  adminSearchFilter: string;
  setAdminSearchFilter: (v: string) => void;
  adminFilteredCatalog: StoreService[];
  handleSaveAdminService: (e: React.FormEvent) => void;
  startEditService: (srv: StoreService) => void;
  deleteService: (id: string, title: string) => void;
  resetAdminForm: () => void;
  resetCatalogToDefault: () => void;
  // Web Tools Props
  webToolsCatalog: WebToolItem[];
  editingToolId: string | null;
  toolTitle: string;
  setToolTitle: (v: string) => void;
  toolUrl: string;
  setToolUrl: (v: string) => void;
  toolIconUrl: string;
  setToolIconUrl: (v: string) => void;
  toolDesc: string;
  setToolDesc: (v: string) => void;
  toolBadge: string;
  setToolBadge: (v: string) => void;
  toolButtonLabel: string;
  setToolButtonLabel: (v: string) => void;
  toolPlush: string;
  setToolPlush: (v: string) => void;
  toolIconType: IconType;
  setToolIconType: (v: IconType) => void;
  toolOpenMode: 'new_tab' | 'embed_modal' | 'sim_tab';
  setToolOpenMode: (v: 'new_tab' | 'embed_modal' | 'sim_tab') => void;
  toolSearchFilter: string;
  setToolSearchFilter: (v: string) => void;
  adminFilteredTools: WebToolItem[];
  handleSaveAdminTool: (e: React.FormEvent) => void;
  startEditTool: (tool: WebToolItem) => void;
  deleteTool: (id: string, title: string) => void;
  resetToolForm: () => void;
  resetToolsToDefault: () => void;
  launchWebTool: (tool: WebToolItem) => void;
  // Payments & Wallet Props
  walletBalance: number;
  paymentProofs: PaymentProofRequest[];
  pendingProofsCount: number;
  handleApprovePaymentProof: (id: string) => void;
  handleRejectPaymentProof: (id: string) => void;
  handleDeletePaymentProof: (id: string) => void;
  handleSetCustomBalance: (newBal: number) => void;
  onPreviewScreenshot: (proof: PaymentProofRequest) => void;
  // Theme & Font Props
  websiteUiMode: WebsiteUiThemeMode;
  setWebsiteUiMode: (mode: WebsiteUiThemeMode) => void;
  websiteFontMode: WebsiteFontMode;
  setWebsiteFontMode: (font: WebsiteFontMode) => void;
  // Shared Utilities
  plushOptions: PlushOption[];
  soundEnabled: boolean;
  toggleSound: () => void;
  playPopSound: (freq?: number) => void;
  showToast: (msg: string) => void;
  copyText: (text: string, msg?: string) => void;
  exitSecretAdminPortal: () => void;
}

export const AdminStepByStepSettingsHub: React.FC<AdminStepByStepSettingsHubProps> = ({
  siteConfig,
  onUpdateSiteConfig,
  onResetSiteConfig,
  onReassignDeletedCategory,
  servicesCatalog,
  editingServiceId,
  adminTitle,
  setAdminTitle,
  adminCategory,
  setAdminCategory,
  adminBadge,
  setAdminBadge,
  adminDesc,
  setAdminDesc,
  adminPlush,
  setAdminPlush,
  adminIconType,
  setAdminIconType,
  adminCustomIconUrl,
  setAdminCustomIconUrl,
  adminDirectToolUrl,
  setAdminDirectToolUrl,
  adminInputLabel,
  setAdminInputLabel,
  adminPlaceholder,
  setAdminPlaceholder,
  adminTiersText,
  setAdminTiersText,
  adminSearchFilter,
  setAdminSearchFilter,
  adminFilteredCatalog,
  handleSaveAdminService,
  startEditService,
  deleteService,
  resetAdminForm,
  resetCatalogToDefault,
  webToolsCatalog,
  editingToolId,
  toolTitle,
  setToolTitle,
  toolUrl,
  setToolUrl,
  toolIconUrl,
  setToolIconUrl,
  toolDesc,
  setToolDesc,
  toolBadge,
  setToolBadge,
  toolButtonLabel,
  setToolButtonLabel,
  toolPlush,
  setToolPlush,
  toolIconType,
  setToolIconType,
  toolOpenMode,
  setToolOpenMode,
  toolSearchFilter,
  setToolSearchFilter,
  adminFilteredTools,
  handleSaveAdminTool,
  startEditTool,
  deleteTool,
  resetToolForm,
  resetToolsToDefault,
  launchWebTool,
  walletBalance,
  paymentProofs,
  pendingProofsCount,
  handleApprovePaymentProof,
  handleRejectPaymentProof,
  handleDeletePaymentProof,
  handleSetCustomBalance,
  onPreviewScreenshot,
  websiteUiMode,
  setWebsiteUiMode,
  websiteFontMode,
  setWebsiteFontMode,
  plushOptions,
  soundEnabled,
  toggleSound,
  playPopSound,
  showToast,
  copyText,
  exitSecretAdminPortal
}) => {
  // Active Settings Screen ('home' shows WhatsApp/TikTok style grouped menu)
  const [activeScreen, setActiveScreen] = useState<AdminSettingsScreenId>('home');
  const [settingsSearchQuery, setSettingsSearchQuery] = useState<string>('');

  // Dynamic Categories List (always falls back cleanly to CATEGORY_META)
  const activeCategories: StoreCategoryMeta[] =
    siteConfig.categories && siteConfig.categories.length > 0
      ? siteConfig.categories
      : CATEGORY_META;

  // Step-by-Step Category Wizard State
  const [catStep, setCatStep] = useState<1 | 2 | 3>(1);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catLabel, setCatLabel] = useState<string>('');
  const [catShortLabel, setCatShortLabel] = useState<string>('');
  const [catIconType, setCatIconType] = useState<IconType>('gamepad');
  const [catCustomIconUrl, setCatCustomIconUrl] = useState<string>('');
  const [catIconColor, setCatIconColor] = useState<string>('text-purple-600');
  const [iconPickerSearch, setIconPickerSearch] = useState<string>('');

  // Step-by-Step Wizard States
  const [productStep, setProductStep] = useState<1 | 2 | 3 | 4>(1);
  const [planBuilderMode, setPlanBuilderMode] = useState<'visual' | 'raw'>('visual');
  const [planRows, setPlanRows] = useState<PlanRowItem[]>(() =>
    parseTiersToPlanRows(adminTiersText)
  );

  const [toolStep, setToolStep] = useState<1 | 2 | 3 | 4>(1);
  const [bannerStep, setBannerStep] = useState<1 | 2 | 3>(1);
  const [contactStep, setContactStep] = useState<1 | 2 | 3>(1);
  const [activePayMethodIdx, setActivePayMethodIdx] = useState<number>(0);

  // Sync planRows whenever editingServiceId or adminTiersText changes externally
  useEffect(() => {
    setPlanRows(parseTiersToPlanRows(adminTiersText));
  }, [editingServiceId]);

  const syncPlanRowsToTiers = (nextRows: PlanRowItem[]) => {
    setPlanRows(nextRows);
    setAdminTiersText(formatPlanRowsToTiersText(nextRows));
  };

  const resetCategoryWizardForm = () => {
    setEditingCatId(null);
    setCatLabel('');
    setCatShortLabel('');
    setCatIconType('gamepad');
    setCatCustomIconUrl('');
    setCatIconColor('text-purple-600');
    setCatStep(1);
  };

  const startEditCategoryInWizard = (cat: StoreCategoryMeta) => {
    playPopSound(660);
    setEditingCatId(cat.id);
    setCatLabel(cat.label);
    setCatShortLabel(cat.shortLabel);
    setCatIconType(cat.iconType || 'layer-group');
    setCatCustomIconUrl(cat.customIconUrl || '');
    setCatIconColor(cat.iconColor || 'text-pink-500');
    setActiveScreen('categories');
    setCatStep(1);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanFull = catLabel.trim();
    const cleanShort = catShortLabel.trim() || cleanFull;
    if (!cleanFull) {
      showToast('Please enter a Category Name!');
      return;
    }

    if (editingCatId) {
      onUpdateSiteConfig((prev) => {
        const currentList =
          prev.categories && prev.categories.length > 0 ? prev.categories : CATEGORY_META;
        return {
          ...prev,
          categories: currentList.map((c) =>
            c.id === editingCatId
              ? {
                  ...c,
                  label: cleanFull,
                  shortLabel: cleanShort,
                  iconColor: catIconColor,
                  iconType: catIconType,
                  customIconUrl: catCustomIconUrl.trim() || undefined
                }
              : c
          )
        };
      });
      playPopSound(820);
      showToast(`✅ Category "${cleanShort}" Updated!`);
      resetCategoryWizardForm();
      return;
    }

    const baseSlug = cleanShort
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 24);
    const newId: CategoryId =
      !baseSlug || activeCategories.some((c) => c.id === baseSlug)
        ? `cat_${Date.now().toString(36)}`
        : baseSlug;

    const newCat: StoreCategoryMeta = {
      id: newId,
      label: cleanFull,
      shortLabel: cleanShort,
      iconClass: 'fa-solid fa-layer-group',
      iconColor: catIconColor,
      iconType: catIconType,
      customIconUrl: catCustomIconUrl.trim() || undefined
    };

    onUpdateSiteConfig((prev) => {
      const currentList =
        prev.categories && prev.categories.length > 0 ? prev.categories : CATEGORY_META;
      return {
        ...prev,
        categories: [...currentList, newCat]
      };
    });
    playPopSound(860);
    showToast(`🎉 New Category "${cleanShort}" Added to Storefront!`);
    resetCategoryWizardForm();
  };

  const handleDeleteCategory = (cat: StoreCategoryMeta) => {
    if (cat.id === 'all') {
      showToast('The "All Services" tab cannot be deleted, but you can edit its name & icon!');
      return;
    }
    const remainingNonAll = activeCategories.filter((c) => c.id !== 'all' && c.id !== cat.id);
    if (remainingNonAll.length === 0) {
      showToast('At least 1 store category must remain active!');
      return;
    }
    const fallbackCat = remainingNonAll[0].id as Exclude<CategoryId, 'all'>;
    onUpdateSiteConfig((prev) => {
      const currentList =
        prev.categories && prev.categories.length > 0 ? prev.categories : CATEGORY_META;
      return {
        ...prev,
        categories: currentList.filter((c) => c.id !== cat.id)
      };
    });
    if (onReassignDeletedCategory) {
      onReassignDeletedCategory(cat.id, fallbackCat);
    }
    if (adminCategory === cat.id) {
      setAdminCategory(fallbackCat);
    }
    if (editingCatId === cat.id) {
      resetCategoryWizardForm();
    }
    playPopSound(480);
    showToast(`🗑️ Category "${cat.shortLabel}" Deleted!`);
  };

  const handleMoveCategory = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= activeCategories.length) return;
    playPopSound(640);
    onUpdateSiteConfig((prev) => {
      const list = [
        ...(prev.categories && prev.categories.length > 0 ? prev.categories : CATEGORY_META)
      ];
      const temp = list[index];
      list[index] = list[targetIdx];
      list[targetIdx] = temp;
      return {
        ...prev,
        categories: list
      };
    });
  };

  // Reusable Visual Icon & Custom Image Upload Studio for Categories, Web Tools & Store Products
  const renderVisualIconStudio = (
    selectedIconType: IconType,
    onSelectIconType: (ic: IconType) => void,
    customIconUrlValue: string,
    onChangeCustomIconUrl: (url: string) => void,
    sourceLinkUrl?: string
  ) => {
    const filteredIcons = ICON_OPTIONS.filter((opt) => {
      const q = iconPickerSearch.trim().toLowerCase();
      if (!q) return true;
      return opt.label.toLowerCase().includes(q) || opt.value.toLowerCase().includes(q);
    });

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          playPopSound(780);
          onChangeCustomIconUrl(reader.result);
          showToast('🖼️ Custom Icon Image Uploaded!');
        }
      };
      reader.readAsDataURL(file);
    };

    const handleAutoFetchFavicon = () => {
      const rawUrl = (sourceLinkUrl || '').trim();
      if (!rawUrl || rawUrl === '#siminfo') {
        showToast('Enter a website URL first to auto-fetch its official logo!');
        return;
      }
      try {
        const normalized = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
        const parsed = new URL(normalized);
        const faviconUrl = `https://www.google.com/s2/favicons?sz=128&domain=${parsed.hostname}`;
        playPopSound(760);
        onChangeCustomIconUrl(faviconUrl);
        showToast(`✨ Official Logo Fetched from ${parsed.hostname}!`);
      } catch {
        showToast('Could not parse website domain for logo.');
      }
    };

    return (
      <div className="p-3.5 rounded-2xl bg-white/95 border-2 border-pink-200 space-y-3 shadow-xs">
        {/* Top Row: Live Selected Icon Orb + Upload & Auto-Logo Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-slate-200/80">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-700 text-white flex items-center justify-center shadow-md border-2 border-white overflow-hidden flex-shrink-0">
              {renderOrbVisual(selectedIconType, customIconUrlValue)}
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900">
                {customIconUrlValue.trim()
                  ? '🖼️ Custom Image / Logo Active'
                  : `✨ 3D Vector Icon: ${selectedIconType.toUpperCase()}`}
              </div>
              <div className="text-[10px] font-semibold text-slate-600">
                Tap any 3D icon below, upload a PNG/SVG logo, or paste an image link
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <label className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-[10px] sm:text-xs font-extrabold shadow-sm cursor-pointer flex items-center gap-1.5 transition">
              <FaImages className="w-3.5 h-3.5" />
              <span>Upload Icon</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {sourceLinkUrl !== undefined && (
              <button
                type="button"
                onClick={handleAutoFetchFavicon}
                className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[10px] sm:text-xs font-extrabold cursor-pointer flex items-center gap-1"
              >
                <FaWandMagicSparkles className="w-3 h-3" />
                <span>Auto Logo from URL</span>
              </button>
            )}

            {customIconUrlValue.trim() && (
              <button
                type="button"
                onClick={() => {
                  playPopSound(520);
                  onChangeCustomIconUrl('');
                  showToast('Switched back to 3D Vector Icon!');
                }}
                className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-extrabold cursor-pointer"
              >
                Use 3D Vector
              </button>
            )}
          </div>
        </div>

        {/* Search Bar for 50+ Vector Icons */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
          <FaMagnifyingGlass className="w-3.5 h-3.5 text-pink-500 flex-shrink-0" />
          <input
            type="text"
            value={iconPickerSearch}
            onChange={(e) => setIconPickerSearch(e.target.value)}
            placeholder="Search 50+ icons (e.g. TikTok, Gemini, ChatGPT, Canva, SIM, Gaming, Crown, Rocket)..."
            className="w-full bg-transparent border-none outline-none text-xs font-bold text-slate-900 placeholder:text-slate-400"
          />
          {iconPickerSearch && (
            <button
              type="button"
              onClick={() => setIconPickerSearch('')}
              className="text-[10px] font-extrabold text-rose-600 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Visual Clickable Grid of 50+ Real Brand & Utility Icons */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1.5 max-h-52 overflow-y-auto pr-1">
          {filteredIcons.map((ic) => {
            const isSelected = selectedIconType === ic.value && !customIconUrlValue.trim();
            const cleanName = ic.label.replace(/^[^\w\s]+\s*/, '');
            return (
              <button
                key={ic.value}
                type="button"
                onClick={() => {
                  playPopSound(660);
                  onSelectIconType(ic.value);
                  if (customIconUrlValue.trim()) {
                    onChangeCustomIconUrl('');
                  }
                }}
                className={`p-2 rounded-xl border text-center flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white border-pink-500 shadow-md scale-[1.02]'
                    : 'bg-slate-50/90 hover:bg-pink-50 text-slate-800 border-slate-200/80'
                }`}
              >
                <span
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-2xs ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-gradient-to-br from-slate-800 to-indigo-950 text-white'
                  }`}
                >
                  {renderServiceIcon(ic.value, undefined, 'w-4 h-4 text-white')}
                </span>
                <span className="text-[10px] font-extrabold leading-tight line-clamp-1 w-full">
                  {cleanName}
                </span>
              </button>
            );
          })}
        </div>

        {/* Direct Custom Image URL Input */}
        <div className="pt-1">
          <label className="block text-[10px] font-extrabold uppercase text-slate-600 mb-1">
            Or Paste Custom Icon Image URL (PNG / SVG / WebP):
          </label>
          <input
            type="text"
            value={customIconUrlValue}
            onChange={(e) => onChangeCustomIconUrl(e.target.value)}
            placeholder="https://.../custom-icon.png (or click Upload Icon above)"
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-mono-code text-xs text-slate-900 focus:outline-none focus:border-pink-500"
          />
        </div>
      </div>
    );
  };

  const openSettingsScreen = (screen: AdminSettingsScreenId, initialStep?: number) => {
    playPopSound(660);
    setActiveScreen(screen);
    if (screen === 'categories' && initialStep) {
      setCatStep(initialStep as 1 | 2 | 3);
    }
    if (screen === 'services' && initialStep) {
      setProductStep(initialStep as 1 | 2 | 3 | 4);
    }
    if (screen === 'tools' && initialStep) {
      setToolStep(initialStep as 1 | 2 | 3 | 4);
    }
    if (screen === 'banner' && initialStep) {
      setBannerStep(initialStep as 1 | 2 | 3);
    }
    if (screen === 'contact_footer' && initialStep) {
      setContactStep(initialStep as 1 | 2 | 3);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditServiceInWizard = (srv: StoreService) => {
    startEditService(srv);
    setPlanRows(parseTiersToPlanRows(srv.tiers.join('\n')));
    setActiveScreen('services');
    setProductStep(1);
    window.scrollTo({ top: 140, behavior: 'smooth' });
  };

  const handleEditToolInWizard = (tool: WebToolItem) => {
    startEditTool(tool);
    setActiveScreen('tools');
    setToolStep(1);
    window.scrollTo({ top: 140, behavior: 'smooth' });
  };

  // Toggle helper for iOS / TikTok style switch
  const renderToggleSwitch = (
    checked: boolean,
    onToggle: () => void,
    label?: string
  ) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label || 'Toggle setting'}
      onClick={(e) => {
        e.stopPropagation();
        playPopSound(checked ? 520 : 720);
        onToggle();
      }}
      className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none ${
        checked
          ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.45)]'
          : 'bg-slate-300 border-slate-300'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out mt-0.5 ${
          checked ? 'translate-x-5.5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );

  const activeFontObj =
    STORE_FONT_PACKS.find((f) => f.id === websiteFontMode) || STORE_FONT_PACKS[0];

  const themeDisplayName =
    websiteUiMode === 'astro-neu'
      ? 'Astro-OS Dark'
      : websiteUiMode === 'pink-acrylic'
      ? 'Pink Acrylic 3D'
      : websiteUiMode === 'liquid-champagne'
      ? 'Liquid Gold'
      : 'Pastel Jelly 3D';

  const matchesSearch = (keywords: string) => {
    const q = settingsSearchQuery.trim().toLowerCase();
    if (!q) return true;
    return keywords.toLowerCase().includes(q);
  };

  const updatePaymentMethodField = (
    index: number,
    field: keyof DepositMethodMeta,
    value: string | boolean
  ) => {
    onUpdateSiteConfig((prev) => {
      const nextMethods = prev.paymentMethods.map((m, idx) =>
        idx === index ? { ...m, [field]: value } : m
      );
      return {
        ...prev,
        paymentMethods: nextMethods
      };
    });
  };

  return (
    <div className="space-y-5 transition-all duration-300">
      {/* ==================== TOP WHATSAPP / TIKTOK ADMIN COMMAND HEADER ==================== */}
      <div className="acrylic-frame rounded-[32px] p-2.5 sm:p-3.5">
        <div className="rounded-[24px] bg-gradient-to-r from-slate-950 via-indigo-950 to-purple-950 text-white p-4 sm:p-6 border border-white/80 shadow-2xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-lg flex-shrink-0 bg-slate-900">
                <img
                  src={siteConfig.banner.portraitUrl}
                  alt="Muhammad Saqib Admin"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950"></span>
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-mono-code font-extrabold">
                  <FaShieldHalved className="w-3 h-3 text-emerald-400" />
                  <span>ADMIN SETTINGS STUDIO • /saqibadmb</span>
                </div>
                <h2 className="text-lg sm:text-2xl font-extrabold text-white mt-0.5 tracking-tight">
                  {siteConfig.banner.mainTitle} — Step-by-Step Settings
                </h2>
                <p className="text-[11px] sm:text-xs text-pink-200 font-semibold">
                  WhatsApp &amp; TikTok Style Control Center • Tap any setting to edit step by step
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {activeScreen !== 'home' && (
                <button
                  type="button"
                  onClick={() => openSettingsScreen('home')}
                  className="px-3.5 py-2 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-extrabold text-xs shadow-md flex items-center gap-1.5 cursor-pointer transition"
                >
                  <FaArrowLeft className="w-3.5 h-3.5" />
                  <span>All Settings Menu</span>
                </button>
              )}
              <button
                type="button"
                onClick={() =>
                  copyText(
                    JSON.stringify(
                      {
                        siteConfig,
                        services: servicesCatalog,
                        tools: webToolsCatalog
                      },
                      null,
                      2
                    ),
                    'Full Website Backup JSON Copied!'
                  )
                }
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-extrabold cursor-pointer flex items-center gap-1.5"
              >
                <FaCopy className="w-3 h-3 text-sky-300" />
                <span>Backup JSON</span>
              </button>
              <button
                type="button"
                onClick={exitSecretAdminPortal}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-extrabold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <FaEye className="w-3.5 h-3.5" />
                <span>View Live Store</span>
              </button>
            </div>
          </div>

          {/* Quick Pill Navigation Strip (Always accessible like TikTok top tabs) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-white/15 scrollbar-none">
            {[
              { id: 'home' as const, label: '⚙️ Settings Menu', badge: 'Home' },
              {
                id: 'categories' as const,
                label: '🗂️ Categories & Icons',
                badge: String(activeCategories.length)
              },
              {
                id: 'services' as const,
                label: '🛍️ Add / Edit Products',
                badge: String(servicesCatalog.length)
              },
              {
                id: 'tools' as const,
                label: '🛠️ Add / Edit Web Tools',
                badge: String(webToolsCatalog.length)
              },
              {
                id: 'banner' as const,
                label: '🖼️ Hero Banner',
                badge: siteConfig.banner.showHeroBanner ? 'ON' : 'OFF'
              },
              {
                id: 'payment_methods' as const,
                label: '🏦 Payment Numbers',
                badge: String(siteConfig.paymentMethods.filter((m) => m.enabled !== false).length)
              },
              {
                id: 'contact_footer' as const,
                label: '📱 WhatsApp & Footer',
                badge: 'Links'
              },
              {
                id: 'payments' as const,
                label: '💳 Payment Proofs',
                badge: `${pendingProofsCount} New`
              },
              {
                id: 'ui' as const,
                label: '🎨 Themes & Fonts',
                badge: '4+6'
              }
            ].map((item) => {
              const isAct = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openSettingsScreen(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                    isAct
                      ? 'bg-sky-400 text-slate-950 shadow-md scale-[1.02]'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                  }`}
                >
                  <span>{item.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold ${
                      isAct ? 'bg-slate-950 text-sky-300' : 'bg-black/30 text-sky-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ==================== SCREEN 0: WHATSAPP & TIKTOK STYLE SETTINGS HOME MENU ==================== */}
      {activeScreen === 'home' && (
        <div className="space-y-5">
          {/* Search Bar + 4 Quick Wizard Launch Tiles */}
          <div className="acrylic-frame rounded-[30px] p-3 sm:p-4 space-y-3.5">
            <div className="sim-input-box !py-2.5 !px-4 !rounded-2xl">
              <FaMagnifyingGlass className="text-pink-500 mr-2.5 w-4 h-4 flex-shrink-0" />
              <input
                type="text"
                value={settingsSearchQuery}
                onChange={(e) => setSettingsSearchQuery(e.target.value)}
                placeholder="Search settings (e.g. Add Product, Price, Banner, WhatsApp Number, JazzCash, Footer, Font)..."
                className="w-full bg-transparent border-none outline-none font-bold text-xs sm:text-sm text-slate-900 placeholder:text-slate-400"
              />
              {settingsSearchQuery && (
                <button
                  type="button"
                  onClick={() => setSettingsSearchQuery('')}
                  className="text-xs font-extrabold text-rose-600 px-2 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* 5 Step-by-Step Quick Action Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  resetCategoryWizardForm();
                  openSettingsScreen('categories', 1);
                }}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-600 via-fuchsia-600 to-pink-600 text-white text-left shadow-md hover:scale-[1.01] transition cursor-pointer flex flex-col justify-between gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                    <FaLayerGroup className="w-4 h-4 text-white" />
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white/25 text-[9px] font-extrabold uppercase">
                    {activeCategories.length} Tabs
                  </span>
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-extrabold">+ Add / Edit Category</div>
                  <div className="text-[10px] text-pink-100 font-semibold">
                    Create, Delete &amp; Custom Icons
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  resetAdminForm();
                  openSettingsScreen('services', 1);
                }}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 text-white text-left shadow-md hover:scale-[1.01] transition cursor-pointer flex flex-col justify-between gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                    <FaBagShopping className="w-4 h-4 text-white" />
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white/25 text-[9px] font-extrabold uppercase">
                    4 Steps
                  </span>
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-extrabold">+ Add New Product</div>
                  <div className="text-[10px] text-pink-100 font-semibold">
                    Title, Plans, Prices &amp; Icon
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  resetToolForm();
                  openSettingsScreen('tools', 1);
                }}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 text-white text-left shadow-md hover:scale-[1.01] transition cursor-pointer flex flex-col justify-between gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                    <FaScrewdriverWrench className="w-4 h-4 text-white" />
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white/25 text-[9px] font-extrabold uppercase">
                    4 Steps
                  </span>
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-extrabold">+ Add Web Tool</div>
                  <div className="text-[10px] text-sky-100 font-semibold">
                    Link, Icon, Badge &amp; Mode
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => openSettingsScreen('payment_methods')}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-green-600 text-white text-left shadow-md hover:scale-[1.01] transition cursor-pointer flex flex-col justify-between gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                    <FaBuildingColumns className="w-4 h-4 text-white" />
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white/25 text-[9px] font-extrabold uppercase">
                    Accounts
                  </span>
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-extrabold">Payment Methods</div>
                  <div className="text-[10px] text-emerald-100 font-semibold">
                    EasyPaisa, JazzCash &amp; Bank
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => openSettingsScreen('contact_footer', 1)}
                className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white text-left shadow-md hover:scale-[1.01] transition cursor-pointer flex flex-col justify-between gap-2 col-span-2 sm:col-span-1"
              >
                <div className="flex items-center justify-between">
                  <span className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                    <SiWhatsapp className="w-4 h-4 text-white" />
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white/25 text-[9px] font-extrabold uppercase">
                    3 Steps
                  </span>
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-extrabold">WhatsApp &amp; Footer</div>
                  <div className="text-[10px] text-amber-100 font-semibold">
                    Number, Socials &amp; Links
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* GROUPED WHATSAPP / TIKTOK SETTINGS MENU LISTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* GROUP 1: STORE CATALOG, CATEGORIES, PRODUCTS & WEB TOOLS */}
            {matchesSearch('store categories category icons products services plans prices packages web tools links utilities add edit delete') && (
              <div className="acrylic-frame rounded-[30px] p-3">
                <div className="plush-pillow plush-login rounded-[24px] p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-pink-700 flex items-center gap-1.5">
                      <FaLayerGroup className="w-3.5 h-3.5" />
                      <span>1. Categories, Products, Plans &amp; Web Tools</span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">Tap row to open</span>
                  </div>

                  <div className="rounded-2xl bg-white/90 border border-pink-100 divide-y divide-slate-200/70 overflow-hidden shadow-xs">
                    {/* Row: Store Categories & Custom Icons Manager */}
                    <div
                      onClick={() => openSettingsScreen('categories', 1)}
                      className="p-3.5 sm:p-4 hover:bg-pink-50/60 transition flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-fuchsia-600 to-purple-600 text-white flex items-center justify-center shadow-sm flex-shrink-0">
                          <FaLayerGroup className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                            Store Categories &amp; Tab Icons (Add / Edit / Delete)
                          </div>
                          <div className="text-[11px] font-semibold text-slate-600 truncate">
                            {activeCategories.length} Categories • Create new category tabs, rename, delete or attach 3D / custom icons
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="px-2.5 py-1 rounded-full bg-fuchsia-100 text-fuchsia-800 text-[10px] font-extrabold">
                          {activeCategories.length} Tabs
                        </span>
                        <FaChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>

                    {/* Row: Store Services / Products */}
                    <div
                      onClick={() => openSettingsScreen('services', 1)}
                      className="p-3.5 sm:p-4 hover:bg-pink-50/60 transition flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-white flex items-center justify-center shadow-sm flex-shrink-0">
                          <FaBagShopping className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                            Store Products, Descriptions &amp; Pricing Plans
                          </div>
                          <div className="text-[11px] font-semibold text-slate-600 truncate">
                            {servicesCatalog.length} Active Products • Add/Edit Title, Plans &amp; Prices Step-by-Step
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="px-2.5 py-1 rounded-full bg-pink-100 text-pink-800 text-[10px] font-extrabold">
                          {servicesCatalog.length} Items
                        </span>
                        <FaChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>

                    {/* Row: Jump directly to Pricing Plans Builder */}
                    <div
                      onClick={() => openSettingsScreen('services', 2)}
                      className="p-3.5 sm:p-4 hover:bg-pink-50/60 transition flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-sm flex-shrink-0">
                          <FaSliders className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                            Package Plans &amp; Price List Builder
                          </div>
                          <div className="text-[11px] font-semibold text-slate-600 truncate">
                            Add 1 Month, 6 Months, 1 Year plans &amp; custom Rs. prices easily
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-[10px] font-extrabold">
                          Step 2
                        </span>
                        <FaChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>

                    {/* Row: Live Web Tools */}
                    <div
                      onClick={() => openSettingsScreen('tools', 1)}
                      className="p-3.5 sm:p-4 hover:bg-pink-50/60 transition flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-600 text-white flex items-center justify-center shadow-sm flex-shrink-0">
                          <FaScrewdriverWrench className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                            Live Web Tools &amp; Custom Tool Icons
                          </div>
                          <div className="text-[11px] font-semibold text-slate-600 truncate">
                            {webToolsCatalog.length} Active Tools • Add Tool Link, Upload/Pick Icon, Description &amp; Mode
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-extrabold">
                          {webToolsCatalog.length} Tools
                        </span>
                        <FaChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* GROUP 2: HERO BANNER, THEME & FONT APPEARANCE */}
            {matchesSearch('hero banner show hide headline badge description portrait photo theme font style appearance') && (
              <div className="acrylic-frame rounded-[30px] p-3">
                <div className="plush-pillow plush-hero rounded-[24px] p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                      <FaPanorama className="w-3.5 h-3.5" />
                      <span>2. Banner, Visibility &amp; Appearance</span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">Live Toggles</span>
                  </div>

                  <div className="rounded-2xl bg-white/90 border border-pink-100 divide-y divide-slate-200/70 overflow-hidden shadow-xs">
                    {/* Row: Show / Hide Hero Banner + Drilldown */}
                    <div
                      onClick={() => openSettingsScreen('banner', 1)}
                      className="p-3.5 sm:p-4 hover:bg-pink-50/60 transition flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-sm flex-shrink-0">
                          <FaPanorama className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                            Show Hero Banner &amp; Edit Banner Text
                          </div>
                          <div className="text-[11px] font-semibold text-slate-600 truncate">
                            {siteConfig.banner.showHeroBanner ? 'Visible on Storefront' : 'Hidden on Storefront'} • Edit Title, Badge &amp; Bio
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 flex-shrink-0">
                        {renderToggleSwitch(
                          siteConfig.banner.showHeroBanner,
                          () => {
                            const next = !siteConfig.banner.showHeroBanner;
                            onUpdateSiteConfig((prev) => ({
                              ...prev,
                              banner: { ...prev.banner, showHeroBanner: next }
                            }));
                            showToast(
                              next
                                ? '🖼️ Hero Banner Enabled on Storefront!'
                                : '🙈 Hero Banner Hidden on Storefront!'
                            );
                          },
                          'Toggle Hero Banner'
                        )}
                        <FaChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>

                    {/* Row: Top Header Strip Toggle */}
                    <div
                      onClick={() => openSettingsScreen('banner', 1)}
                      className="p-3.5 sm:p-4 hover:bg-pink-50/60 transition flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-sm flex-shrink-0">
                          <FaBolt className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                            Top Header Strip &amp; WhatsApp Pill
                          </div>
                          <div className="text-[11px] font-semibold text-slate-600 truncate">
                            {siteConfig.banner.topStripTitle}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 flex-shrink-0">
                        {renderToggleSwitch(
                          siteConfig.banner.showTopStrip,
                          () => {
                            const next = !siteConfig.banner.showTopStrip;
                            onUpdateSiteConfig((prev) => ({
                              ...prev,
                              banner: { ...prev.banner, showTopStrip: next }
                            }));
                            showToast(
                              next ? 'Top Header Strip Shown!' : 'Top Header Strip Hidden!'
                            );
                          },
                          'Toggle Top Strip'
                        )}
                        <FaChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>

                    {/* Row: Soft Light RGB Border Around Portfolio & Cards Toggle */}
                    <div
                      onClick={() => {
                        const next = siteConfig.banner.rgbBorderEnabled === false;
                        onUpdateSiteConfig((prev) => ({
                          ...prev,
                          banner: { ...prev.banner, rgbBorderEnabled: next }
                        }));
                        showToast(
                          next
                            ? '🌈 Soft Light RGB Borders Turned ON!'
                            : '⚪ Soft Light RGB Borders Turned OFF!'
                        );
                      }}
                      className="p-3.5 sm:p-4 hover:bg-pink-50/60 transition flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-400 via-purple-500 to-pink-500 text-white flex items-center justify-center shadow-sm flex-shrink-0">
                          <FaWandMagicSparkles className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                            Soft Light RGB Border (Portfolio &amp; All Cards)
                          </div>
                          <div className="text-[11px] font-semibold text-slate-600 truncate">
                            {siteConfig.banner.rgbBorderEnabled !== false
                              ? '🌈 Active: Soft Pastel RGB Light Ring on Portfolio & Borders'
                              : '⚪ Off: Standard Clean Card Borders'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 flex-shrink-0">
                        {renderToggleSwitch(
                          siteConfig.banner.rgbBorderEnabled !== false,
                          () => {
                            const next = siteConfig.banner.rgbBorderEnabled === false;
                            onUpdateSiteConfig((prev) => ({
                              ...prev,
                              banner: { ...prev.banner, rgbBorderEnabled: next }
                            }));
                            showToast(
                              next
                                ? '🌈 Soft Light RGB Borders Turned ON!'
                                : '⚪ Soft Light RGB Borders Turned OFF!'
                            );
                          },
                          'Toggle Soft Light RGB Borders'
                        )}
                      </div>
                    </div>

                    {/* Row: Themes & Font Studio */}
                    <div
                      onClick={() => openSettingsScreen('ui')}
                      className="p-3.5 sm:p-4 hover:bg-pink-50/60 transition flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center shadow-sm flex-shrink-0">
                          <FaWandMagicSparkles className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                            UI Theme &amp; Font Typography Studio
                          </div>
                          <div className="text-[11px] font-semibold text-slate-600 truncate">
                            {themeDisplayName} • Font: {activeFontObj.displayFontName}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                          4 Themes • 6 Fonts
                        </span>
                        <FaChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* GROUP 3: PAYMENT METHODS, JAZZCASH/EASYPAISA NUMBERS & WALLET PROOFS */}
            {matchesSearch('payment methods easypaisa jazzcash sadapay bank binance usdt account number title wallet balance proofs') && (
              <div className="acrylic-frame rounded-[30px] p-3">
                <div className="plush-pillow plush-contact rounded-[24px] p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                      <FaBuildingColumns className="w-3.5 h-3.5" />
                      <span>3. Payment Methods &amp; User Wallet</span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">Accounts &amp; Proofs</span>
                  </div>

                  <div className="rounded-2xl bg-white/90 border border-emerald-100 divide-y divide-slate-200/70 overflow-hidden shadow-xs">
                    {/* Row: Edit Payment Methods */}
                    <div
                      onClick={() => openSettingsScreen('payment_methods')}
                      className="p-3.5 sm:p-4 hover:bg-emerald-50/60 transition flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center shadow-sm flex-shrink-0">
                          <FaBuildingColumns className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                            Payment Methods &amp; Account Numbers
                          </div>
                          <div className="text-[11px] font-semibold text-slate-600 truncate">
                            Edit EasyPaisa, JazzCash, SadaPay/Bank &amp; USDT Name &amp; Number
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                          {siteConfig.paymentMethods[0]?.accountNumber || '0347-8936242'}
                        </span>
                        <FaChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>

                    {/* Row: Verify Payment Proofs & User Balance */}
                    <div
                      onClick={() => openSettingsScreen('payments')}
                      className="p-3.5 sm:p-4 hover:bg-emerald-50/60 transition flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-sm flex-shrink-0">
                          <FaCreditCard className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                            User Payment Proofs &amp; Wallet Balance
                          </div>
                          <div className="text-[11px] font-semibold text-slate-600 truncate">
                            Live User Balance: Rs. {walletBalance.toLocaleString()} • Approve Screenshots
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            pendingProofsCount > 0
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {pendingProofsCount} Pending
                        </span>
                        <FaChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>

                    {/* Row: Sound Toggle */}
                    <div
                      onClick={toggleSound}
                      className="p-3.5 sm:p-4 hover:bg-emerald-50/60 transition flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center shadow-sm flex-shrink-0">
                          <FaVolumeHigh className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                            Tactile UI Sound Effects
                          </div>
                          <div className="text-[11px] font-semibold text-slate-600 truncate">
                            Play subtle pop sound on button taps &amp; order actions
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {renderToggleSwitch(soundEnabled, toggleSound, 'Toggle UI Sounds')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* GROUP 4: WHATSAPP NUMBER, SOCIAL MEDIA & FOOTER LINKS */}
            {matchesSearch('whatsapp number phone contact email website instagram tiktok facebook snapchat footer links brand') && (
              <div className="acrylic-frame rounded-[30px] p-3">
                <div className="plush-pillow plush-about rounded-[24px] p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-800 flex items-center gap-1.5">
                      <SiWhatsapp className="w-3.5 h-3.5 text-emerald-600" />
                      <span>4. WhatsApp, Socials &amp; Footer Links</span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">Global Sync</span>
                  </div>

                  <div className="rounded-2xl bg-white/90 border border-indigo-100 divide-y divide-slate-200/70 overflow-hidden shadow-xs">
                    {/* Row: Primary WhatsApp Number */}
                    <div
                      onClick={() => openSettingsScreen('contact_footer', 1)}
                      className="p-3.5 sm:p-4 hover:bg-indigo-50/60 transition flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-sm flex-shrink-0">
                          <SiWhatsapp className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                            Primary WhatsApp Number &amp; Contact Info
                          </div>
                          <div className="text-[11px] font-semibold text-slate-600 truncate">
                            {siteConfig.contact.whatsappNumberDisplay} • {siteConfig.contact.officialWebsiteLabel}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono-code font-extrabold">
                          Edit WA
                        </span>
                        <FaChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>

                    {/* Row: Social Media Links */}
                    <div
                      onClick={() => openSettingsScreen('contact_footer', 2)}
                      className="p-3.5 sm:p-4 hover:bg-indigo-50/60 transition flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-sm flex-shrink-0">
                          <FaShareNodes className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                            Social Media Links &amp; Handles
                          </div>
                          <div className="text-[11px] font-semibold text-slate-600 truncate">
                            IG: {siteConfig.socials.instagramHandle} • TikTok: {siteConfig.socials.tiktokHandle} • FB &amp; Snap
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="px-2.5 py-1 rounded-full bg-pink-100 text-pink-800 text-[10px] font-extrabold">
                          4 Socials
                        </span>
                        <FaChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>

                    {/* Row: Footer Links & Branding */}
                    <div
                      onClick={() => openSettingsScreen('contact_footer', 3)}
                      className="p-3.5 sm:p-4 hover:bg-indigo-50/60 transition flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-sm flex-shrink-0">
                          <FaGlobe className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                            Footer Brand Name &amp; Quick Links
                          </div>
                          <div className="text-[11px] font-semibold text-slate-600 truncate">
                            {siteConfig.footer.brandName} • {siteConfig.footer.copyrightTagline}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 flex-shrink-0">
                        {renderToggleSwitch(
                          siteConfig.footer.showQuickLinks,
                          () => {
                            const next = !siteConfig.footer.showQuickLinks;
                            onUpdateSiteConfig((prev) => ({
                              ...prev,
                              footer: { ...prev.footer, showQuickLinks: next }
                            }));
                            showToast(
                              next ? 'Footer Quick Links Enabled!' : 'Footer Quick Links Hidden!'
                            );
                          },
                          'Toggle Footer Quick Links'
                        )}
                        <FaChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Instant Font & Reset Footer Bar */}
          <div className="acrylic-frame rounded-[28px] p-3">
            <div className="rounded-[22px] bg-white/85 p-3.5 sm:p-4 border border-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 mr-1">
                  <FaFont className="text-pink-600" />
                  <span>Quick Font Switch:</span>
                </span>
                {STORE_FONT_PACKS.map((pack) => {
                  const isFontAct = websiteFontMode === pack.id;
                  return (
                    <button
                      key={pack.id}
                      type="button"
                      onClick={() => {
                        playPopSound(760);
                        setWebsiteFontMode(pack.id);
                        showToast(`🔤 Font Switched to ${pack.title}`);
                      }}
                      style={{ fontFamily: pack.displayCss }}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                        isFontAct
                          ? 'bg-slate-900 text-sky-300 shadow-sm'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      {pack.shortLabel}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={onResetSiteConfig}
                className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-extrabold cursor-pointer flex items-center justify-center gap-1.5 self-start sm:self-auto"
              >
                <FaRotateLeft className="w-3 h-3" />
                <span>Reset Site Settings to Default</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== SCREEN 0.5: 3-STEP STORE CATEGORIES & ICONS STUDIO ==================== */}
      {activeScreen === 'categories' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left (7 Cols): 3-Step Category Builder & Icon Studio */}
            <div className="lg:col-span-7 acrylic-frame rounded-[34px] p-3 sm:p-4">
              <div className="plush-pillow plush-login rounded-[26px] p-4 sm:p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-pink-200 pb-3.5">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-fuchsia-700">
                      {editingCatId
                        ? '✏️ STEP-BY-STEP CATEGORY & ICON EDITOR'
                        : '➕ STEP-BY-STEP NEW CATEGORY WIZARD'}
                    </span>
                    <h3 className="text-base sm:text-xl font-extrabold text-slate-900">
                      {editingCatId
                        ? `Editing Category: ${catShortLabel || catLabel}`
                        : 'Create New Store Category & Attach Icon'}
                    </h3>
                  </div>

                  {editingCatId && (
                    <button
                      type="button"
                      onClick={resetCategoryWizardForm}
                      className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-extrabold cursor-pointer"
                    >
                      Cancel Edit / + New
                    </button>
                  )}
                </div>

                {/* 3-Step Progress Bar */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { step: 1 as const, label: '1. Category Name' },
                    { step: 2 as const, label: '2. Category Icon & Color' },
                    { step: 3 as const, label: '3. Preview & Save' }
                  ].map((s) => {
                    const isCurr = catStep === s.step;
                    const isDone = catStep > s.step;
                    return (
                      <button
                        key={s.step}
                        type="button"
                        onClick={() => {
                          playPopSound(620);
                          setCatStep(s.step);
                        }}
                        className={`py-2.5 px-2.5 rounded-xl text-[11px] sm:text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-1 border ${
                          isCurr
                            ? 'bg-gradient-to-r from-fuchsia-600 to-pink-500 text-white border-white shadow-md scale-[1.02]'
                            : isDone
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-white/85 text-slate-700 border-pink-200 hover:bg-white'
                        }`}
                      >
                        {isDone && <FaCheck className="w-2.5 h-2.5 text-emerald-600" />}
                        <span className="truncate">{s.label}</span>
                      </button>
                    );
                  })}
                </div>

                <form onSubmit={handleSaveCategory} className="space-y-4">
                  {/* STEP 1: CATEGORY NAMES & QUICK PRESETS */}
                  {catStep === 1 && (
                    <div className="space-y-4">
                      {!editingCatId && (
                        <div className="p-3 rounded-2xl bg-white/85 border border-pink-200 space-y-2">
                          <span className="block text-[11px] font-extrabold text-slate-700">
                            ⚡ 1-Tap Category Templates:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              {
                                label: 'Gaming, PUBG UC & Steam Keys',
                                short: 'Gaming & UC',
                                icon: 'gamepad' as IconType,
                                color: 'text-purple-600'
                              },
                              {
                                label: 'Netflix, Prime & OTT Streaming',
                                short: 'OTT & Streaming',
                                icon: 'netflix' as IconType,
                                color: 'text-rose-600'
                              },
                              {
                                label: 'Web Hosting, Domains & VPS',
                                short: 'Domains & VPS',
                                icon: 'hostinger' as IconType,
                                color: 'text-indigo-600'
                              },
                              {
                                label: 'WhatsApp & Automation Bots',
                                short: 'WA & Bots',
                                icon: 'whatsapp' as IconType,
                                color: 'text-emerald-600'
                              },
                              {
                                label: 'VIP Royal Deals & Bundles',
                                short: 'VIP Bundles',
                                icon: 'crown' as IconType,
                                color: 'text-amber-500'
                              }
                            ].map((tpl) => (
                              <button
                                key={tpl.short}
                                type="button"
                                onClick={() => {
                                  playPopSound(680);
                                  setCatLabel(tpl.label);
                                  setCatShortLabel(tpl.short);
                                  setCatIconType(tpl.icon);
                                  setCatIconColor(tpl.color);
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-fuchsia-50 hover:bg-fuchsia-100 text-fuchsia-900 border border-fuchsia-200 text-[10px] font-extrabold cursor-pointer transition"
                              >
                                + {tpl.short}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-extrabold text-slate-900 mb-1">
                          1. Short Category Tab Name (Shown on Storefront Filter Button) *
                        </label>
                        <input
                          type="text"
                          value={catShortLabel}
                          onChange={(e) => {
                            setCatShortLabel(e.target.value);
                            if (!catLabel.trim()) {
                              setCatLabel(e.target.value);
                            }
                          }}
                          required
                          placeholder="e.g. Gaming & UC or OTT Streaming"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-pink-300 font-bold text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-pink-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-900 mb-1">
                          2. Full Category Title / Description *
                        </label>
                        <input
                          type="text"
                          value={catLabel}
                          onChange={(e) => setCatLabel(e.target.value)}
                          required
                          placeholder="e.g. Gaming, PUBG UC & Steam Keys"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-pink-300 font-bold text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-pink-500"
                        />
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (!catShortLabel.trim() && !catLabel.trim()) {
                              showToast('Please enter a Category Name first!');
                              return;
                            }
                            playPopSound(700);
                            setCatStep(2);
                          }}
                          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-pink-500 text-white font-extrabold text-xs sm:text-sm shadow-lg flex items-center gap-2 cursor-pointer"
                        >
                          <span>Next Step: Choose Category Icon</span>
                          <FaChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: VISUAL CATEGORY ICON PICKER, IMAGE UPLOAD & COLOR */}
                  {catStep === 2 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-extrabold text-slate-900 mb-1.5">
                          1. Select 3D Category Icon or Upload Custom Image *
                        </label>
                        {renderVisualIconStudio(
                          catIconType,
                          setCatIconType,
                          catCustomIconUrl,
                          setCatCustomIconUrl
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-900 mb-1.5">
                          2. Category Icon Accent Color
                        </label>
                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                          {[
                            { cls: 'text-pink-500', bg: 'bg-pink-500', name: 'Pink' },
                            { cls: 'text-purple-600', bg: 'bg-purple-600', name: 'Purple' },
                            { cls: 'text-rose-500', bg: 'bg-rose-500', name: 'Rose' },
                            { cls: 'text-emerald-600', bg: 'bg-emerald-600', name: 'Emerald' },
                            { cls: 'text-blue-600', bg: 'bg-blue-600', name: 'Blue' },
                            { cls: 'text-amber-500', bg: 'bg-amber-500', name: 'Gold' },
                            { cls: 'text-indigo-600', bg: 'bg-indigo-600', name: 'Indigo' },
                            { cls: 'text-cyan-600', bg: 'bg-cyan-600', name: 'Cyan' }
                          ].map((col) => {
                            const isColAct = catIconColor === col.cls;
                            return (
                              <button
                                key={col.cls}
                                type="button"
                                onClick={() => {
                                  playPopSound(600);
                                  setCatIconColor(col.cls);
                                }}
                                className={`p-2 rounded-xl border text-center flex flex-col items-center gap-1 cursor-pointer transition ${
                                  isColAct
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm scale-105'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                <span className={`w-4 h-4 rounded-full ${col.bg} border border-white shadow-2xs`} />
                                <span className="text-[9px] font-extrabold">{col.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <button
                          type="button"
                          onClick={() => setCatStep(1)}
                          className="px-4 py-2.5 rounded-xl bg-white text-slate-700 border border-slate-300 font-extrabold text-xs cursor-pointer"
                        >
                          ← Back
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            playPopSound(740);
                            setCatStep(3);
                          }}
                          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-xs sm:text-sm shadow-lg flex items-center gap-2 cursor-pointer"
                        >
                          <span>Final Step: Preview &amp; Save</span>
                          <FaChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: PREVIEW & SAVE CATEGORY */}
                  {catStep === 3 && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 space-y-2 text-xs">
                        <div className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                          <FaCircleCheck className="text-emerald-600 w-4 h-4" />
                          <span>Category Ready to Save to Live Storefront!</span>
                        </div>
                        <div>
                          <strong>Tab Button Name:</strong> {catShortLabel || catLabel || 'New Category'}
                        </div>
                        <div>
                          <strong>Full Category Title:</strong> {catLabel || catShortLabel || 'New Category'}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => setCatStep(2)}
                          className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-white text-slate-700 border border-slate-300 font-extrabold text-xs cursor-pointer"
                        >
                          ← Back
                        </button>
                        <button
                          type="submit"
                          className="sim-btn-glow w-full flex-1 py-3.5 px-5 font-display font-bold text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <FaRocket className="w-4 h-4 text-amber-300" />
                          <span>
                            {editingCatId
                              ? 'SAVE UPDATED CATEGORY & ICON'
                              : 'CREATE NEW STORE CATEGORY'}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Right (5 Cols): Live Storefront Category Tab Preview */}
            <div className="lg:col-span-5 space-y-4">
              <div className="acrylic-frame rounded-[32px] p-3">
                <div className="bg-white/90 rounded-[24px] p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-fuchsia-700 flex items-center gap-1">
                      <FaEye className="w-3 h-3" />
                      <span>LIVE CATEGORY TAB PREVIEW</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                      Step {catStep} of 3
                    </span>
                  </div>

                  {(() => {
                    const previewCatMeta: StoreCategoryMeta = {
                      id: editingCatId || 'preview_cat',
                      label: catLabel || 'Gaming, PUBG & Steam Keys',
                      shortLabel: catShortLabel || catLabel || 'Gaming & UC',
                      iconClass: 'fa-solid fa-layer-group',
                      iconColor: catIconColor,
                      iconType: catIconType,
                      customIconUrl: catCustomIconUrl.trim() || undefined
                    };
                    return (
                      <div className="space-y-3">
                        <div className="p-3.5 rounded-2xl bg-slate-100/90 border border-slate-200 space-y-2">
                          <div className="text-[10px] font-extrabold uppercase text-slate-500">
                            When Selected (Active Tab):
                          </div>
                          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl font-extrabold text-xs bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md">
                            {renderCategoryIcon(previewCatMeta.id, 'w-4 h-4 text-white', previewCatMeta)}
                            <span>{previewCatMeta.shortLabel}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-extrabold bg-black/25 text-white">
                              12
                            </span>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-100/90 border border-slate-200 space-y-2">
                          <div className="text-[10px] font-extrabold uppercase text-slate-500">
                            When Unselected (Storefront Bar):
                          </div>
                          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs bg-white text-slate-900 border border-slate-200 shadow-xs">
                            {renderCategoryIcon(
                              previewCatMeta.id,
                              `w-4 h-4 ${previewCatMeta.iconColor}`,
                              previewCatMeta
                            )}
                            <span>{previewCatMeta.shortLabel}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-extrabold bg-slate-200 text-slate-800">
                              12
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Manage All Store Categories List (Edit / Reorder / Delete) */}
          <div className="acrylic-frame rounded-[34px] p-3 sm:p-4">
            <div className="plush-pillow plush-about rounded-[26px] p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-base sm:text-lg font-extrabold text-slate-900">
                    All Storefront Categories ({activeCategories.length})
                  </h4>
                  <p className="text-xs font-semibold text-slate-600">
                    Edit any category name or icon, reorder tabs, or delete categories you don&apos;t need.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    playPopSound(540);
                    onUpdateSiteConfig((prev) => ({
                      ...prev,
                      categories: CATEGORY_META
                    }));
                    resetCategoryWizardForm();
                    showToast('Default Store Categories Restored!');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-extrabold cursor-pointer self-start sm:self-auto"
                >
                  Restore Default Categories
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {activeCategories.map((cat, idx) => {
                  const count =
                    cat.id === 'all'
                      ? servicesCatalog.length
                      : servicesCatalog.filter((s) => s.category === cat.id).length;
                  return (
                    <div
                      key={cat.id}
                      className="p-3.5 rounded-2xl bg-white/95 border border-pink-100 flex items-center justify-between gap-3 hover:border-pink-400 shadow-xs transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-2xs overflow-hidden">
                          {renderCategoryIcon(cat.id, `w-5 h-5 ${cat.iconColor}`, cat)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                              {cat.shortLabel}
                            </span>
                            <span className="px-2 py-0.2 rounded-full bg-pink-50 text-pink-700 border border-pink-200 text-[9px] font-extrabold">
                              {count} Products
                            </span>
                          </div>
                          <div className="text-[10px] font-semibold text-slate-500 truncate">
                            {cat.label} • ID: <span className="font-mono-code">{cat.id}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveCategory(idx, -1)}
                          disabled={idx === 0}
                          title="Move Category Left / Up"
                          className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 text-[10px] font-extrabold cursor-pointer"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveCategory(idx, 1)}
                          disabled={idx === activeCategories.length - 1}
                          title="Move Category Right / Down"
                          className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 text-[10px] font-extrabold cursor-pointer"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => startEditCategoryInWizard(cat)}
                          className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-extrabold cursor-pointer flex items-center gap-1"
                        >
                          <FaPenToSquare className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        {cat.id !== 'all' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            title="Delete Category"
                            className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-extrabold cursor-pointer"
                          >
                            <FaTrashCan className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== SCREEN 1: 4-STEP PRODUCT / SERVICE WIZARD & CATALOG MANAGER ==================== */}
      {activeScreen === 'services' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left (7 Cols): 4-Step Guided Product Wizard */}
            <div className="lg:col-span-7 acrylic-frame rounded-[34px] p-3 sm:p-4">
              <div className="plush-pillow plush-login rounded-[26px] p-4 sm:p-6 space-y-5">
                {/* Wizard Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-pink-200 pb-3.5">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-pink-600">
                      {editingServiceId
                        ? '✏️ STEP-BY-STEP PRODUCT EDITOR'
                        : '➕ STEP-BY-STEP NEW PRODUCT WIZARD'}
                    </span>
                    <h3 className="text-base sm:text-xl font-extrabold text-slate-900">
                      {editingServiceId
                        ? `Editing: ${adminTitle || 'Service'}`
                        : 'Add New Product / Service Step by Step'}
                    </h3>
                  </div>
                  {editingServiceId && (
                    <button
                      type="button"
                      onClick={() => {
                        resetAdminForm();
                        setPlanRows(
                          parseTiersToPlanRows(
                            '1 Month Package — Rs. 500\n6 Months Package — Rs. 2,200\n1 Year Full Warranty — Rs. 3,800'
                          )
                        );
                        setProductStep(1);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-extrabold cursor-pointer"
                    >
                      Cancel Edit / New
                    </button>
                  )}
                </div>

                {/* 4-Step Progress Bar */}
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { step: 1 as const, label: '1. Info & Desc' },
                    { step: 2 as const, label: '2. Plans & Price' },
                    { step: 3 as const, label: '3. Icon & Badge' },
                    { step: 4 as const, label: '4. Publish' }
                  ].map((s) => {
                    const isCurrent = productStep === s.step;
                    const isDone = productStep > s.step;
                    return (
                      <button
                        key={s.step}
                        type="button"
                        onClick={() => {
                          playPopSound(620);
                          setProductStep(s.step);
                        }}
                        className={`py-2 px-2 rounded-xl text-[10px] sm:text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-1 border ${
                          isCurrent
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white border-white shadow-md scale-[1.02]'
                            : isDone
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-white/80 text-slate-700 border-pink-200 hover:bg-white'
                        }`}
                      >
                        {isDone && <FaCheck className="w-2.5 h-2.5 text-emerald-600" />}
                        <span className="truncate">{s.label}</span>
                      </button>
                    );
                  })}
                </div>

                <form onSubmit={handleSaveAdminService} className="space-y-4">
                  {/* STEP 1: BASIC INFO, CATEGORY & DESCRIPTION */}
                  {productStep === 1 && (
                    <div className="space-y-4">
                      <div className="p-3 rounded-2xl bg-white/80 border border-pink-200 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] font-extrabold text-slate-700">
                          Quick Auto-Fill Template:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              playPopSound(680);
                              setAdminTitle('CapCut Pro Private 2026');
                              setAdminCategory('capcut_ai');
                              setAdminBadge('🔥 BESTSELLER');
                              setAdminDesc(
                                '100% Private Account • Works on Mobile, PC & Mac with Full Warranty.'
                              );
                              const rows = [
                                { name: '1 Month Private Pro', price: '500' },
                                { name: '6 Months Private Pro', price: '2,200' },
                                { name: '1 Year Full Warranty', price: '3,800' }
                              ];
                              syncPlanRowsToTiers(rows);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-800 text-[10px] font-extrabold cursor-pointer"
                          >
                            + AI / Pro App
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              playPopSound(680);
                              setAdminTitle('TikTok UK Monetizable Account');
                              setAdminCategory('tiktok_fb');
                              setAdminBadge('🇬🇧 UK OFFICIAL');
                              setAdminDesc(
                                'Creator Rewards Program Eligible • No VPN Needed • Instant Delivery.'
                              );
                              const rows = [
                                { name: 'Fresh TikTok UK Account', price: '1,200' },
                                { name: '10k Followers Monetized UK', price: '8,500' }
                              ];
                              syncPlanRowsToTiers(rows);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-pink-100 hover:bg-pink-200 text-pink-800 text-[10px] font-extrabold cursor-pointer"
                          >
                            + TikTok / SMM
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              playPopSound(680);
                              setAdminTitle('Fresh 2026 SIM Owner & CDR Report');
                              setAdminCategory('franchise_sim');
                              setAdminBadge('📡 LIVE DATABASE');
                              setAdminDesc(
                                'Verified Franchise SIM Ownership, CNIC, Active Numbers & Call History.'
                              );
                              const rows = [
                                { name: 'Fresh SIM Ownership Check', price: '350' },
                                { name: 'Complete 3-Month CDR Call History', price: '2,500' }
                              ];
                              syncPlanRowsToTiers(rows);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-extrabold cursor-pointer"
                          >
                            + SIM / NADRA
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-900 mb-1">
                          1. Product / Service Name *
                        </label>
                        <input
                          type="text"
                          value={adminTitle}
                          onChange={(e) => setAdminTitle(e.target.value)}
                          required
                          placeholder="e.g. ChatGPT Plus Shared / Private or TikTok Followers"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-pink-300 font-bold text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-pink-500"
                        />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                          <label className="block text-xs font-extrabold text-slate-900">
                            2. Choose Store Category *
                          </label>
                          <button
                            type="button"
                            onClick={() => openSettingsScreen('categories', 1)}
                            className="px-2.5 py-1 rounded-lg bg-fuchsia-100 hover:bg-fuchsia-200 text-fuchsia-800 text-[10px] font-extrabold cursor-pointer flex items-center gap-1"
                          >
                            <FaPlus className="w-2.5 h-2.5" />
                            <span>Add / Edit Categories &amp; Icons</span>
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {activeCategories
                            .filter((c) => c.id !== 'all')
                            .map((cat) => {
                              const isSelected = adminCategory === cat.id;
                              return (
                                <button
                                  key={cat.id}
                                  type="button"
                                  onClick={() => {
                                    playPopSound(600);
                                    setAdminCategory(cat.id as Exclude<CategoryId, 'all'>);
                                  }}
                                  className={`p-2.5 rounded-xl border-2 text-left flex items-center gap-2.5 transition cursor-pointer ${
                                    isSelected
                                      ? 'bg-pink-50 border-pink-500 text-slate-900 shadow-xs'
                                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                                  }`}
                                >
                                  <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    {renderCategoryIcon(cat.id, `w-4 h-4 ${cat.iconColor}`, cat)}
                                  </span>
                                  <div className="min-w-0">
                                    <div className="text-xs font-extrabold truncate">
                                      {cat.shortLabel}
                                    </div>
                                    <div className="text-[10px] text-slate-500 truncate">
                                      {cat.label}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-900 mb-1">
                          3. Short Service Description (Warranty, Speed, Features) *
                        </label>
                        <textarea
                          rows={3}
                          value={adminDesc}
                          onChange={(e) => setAdminDesc(e.target.value)}
                          required
                          placeholder="e.g. Instant activation on your email or WhatsApp with 100% replacement warranty..."
                          className="w-full p-3 rounded-xl bg-white border-2 border-pink-300 font-semibold text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-pink-500"
                        />
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (!adminTitle.trim()) {
                              showToast('Please enter a Product Name first!');
                              return;
                            }
                            playPopSound(700);
                            setProductStep(2);
                          }}
                          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-xs sm:text-sm shadow-lg flex items-center gap-2 cursor-pointer"
                        >
                          <span>Next Step: Plans &amp; Prices</span>
                          <FaChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: INTERACTIVE PRICING PLANS & CUSTOMER CHECKOUT INPUT */}
                  {productStep === 2 && (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <label className="block text-xs font-extrabold text-slate-900">
                            Add Pricing Plans &amp; Packages (Step-by-Step) *
                          </label>
                          <p className="text-[11px] font-semibold text-slate-600">
                            Add each plan name and its Rs. price below. Customers will choose from these in a dropdown!
                          </p>
                        </div>

                        <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-pink-200">
                          <button
                            type="button"
                            onClick={() => {
                              setPlanRows(parseTiersToPlanRows(adminTiersText));
                              setPlanBuilderMode('visual');
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold cursor-pointer ${
                              planBuilderMode === 'visual'
                                ? 'bg-pink-500 text-white'
                                : 'text-slate-700'
                            }`}
                          >
                            Step Builder
                          </button>
                          <button
                            type="button"
                            onClick={() => setPlanBuilderMode('raw')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold cursor-pointer ${
                              planBuilderMode === 'raw'
                                ? 'bg-pink-500 text-white'
                                : 'text-slate-700'
                            }`}
                          >
                            Text Lines
                          </button>
                        </div>
                      </div>

                      {planBuilderMode === 'visual' ? (
                        <div className="space-y-2.5">
                          {planRows.map((row, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-2xl bg-white/95 border border-pink-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shadow-2xs"
                            >
                              <div className="flex items-center gap-2 flex-1">
                                <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-700 text-[10px] font-extrabold flex items-center justify-center flex-shrink-0">
                                  #{idx + 1}
                                </span>
                                <input
                                  type="text"
                                  value={row.name}
                                  onChange={(e) => {
                                    const next = planRows.map((r, i) =>
                                      i === idx ? { ...r, name: e.target.value } : r
                                    );
                                    syncPlanRowsToTiers(next);
                                  }}
                                  placeholder="Plan Name (e.g. 1 Month Package)"
                                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-xs text-slate-900 focus:outline-none focus:border-pink-500"
                                />
                              </div>

                              <div className="flex items-center gap-2">
                                <div className="flex items-center bg-emerald-50 border border-emerald-300 rounded-xl px-2.5 py-1.5 sm:w-36">
                                  <span className="text-[11px] font-extrabold text-emerald-700 mr-1">
                                    Rs.
                                  </span>
                                  <input
                                    type="text"
                                    value={row.price}
                                    onChange={(e) => {
                                      const next = planRows.map((r, i) =>
                                        i === idx ? { ...r, price: e.target.value } : r
                                      );
                                      syncPlanRowsToTiers(next);
                                    }}
                                    placeholder="500"
                                    className="w-full bg-transparent border-none outline-none font-display font-bold text-xs sm:text-sm text-slate-900"
                                  />
                                </div>

                                {planRows.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      playPopSound(460);
                                      const next = planRows.filter((_, i) => i !== idx);
                                      syncPlanRowsToTiers(next);
                                    }}
                                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 cursor-pointer"
                                    title="Remove Plan"
                                  >
                                    <FaTrashCan className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() => {
                              playPopSound(680);
                              syncPlanRowsToTiers([
                                ...planRows,
                                { name: `${planRows.length + 1} Months Package`, price: '1,500' }
                              ]);
                            }}
                            className="w-full py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-2 border-dashed border-emerald-300 text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition"
                          >
                            <FaPlus className="w-3.5 h-3.5" />
                            <span>+ Add Another Plan / Price Tier</span>
                          </button>
                        </div>
                      ) : (
                        <div>
                          <textarea
                            rows={4}
                            value={adminTiersText}
                            onChange={(e) => {
                              setAdminTiersText(e.target.value);
                              setPlanRows(parseTiersToPlanRows(e.target.value));
                            }}
                            placeholder="1 Month Package — Rs. 500&#10;6 Months Package — Rs. 2,200"
                            className="w-full p-3 rounded-xl bg-white border-2 border-pink-300 font-mono-code font-bold text-xs text-slate-900 focus:outline-none"
                          />
                        </div>
                      )}

                      {/* Customer Checkout Input Label & Placeholder */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-pink-200/70">
                        <div>
                          <label className="block text-[11px] font-extrabold text-slate-800 mb-1">
                            Customer Checkout Question Label
                          </label>
                          <input
                            type="text"
                            value={adminInputLabel}
                            onChange={(e) => setAdminInputLabel(e.target.value)}
                            placeholder="Enter Your WhatsApp Number or Email:"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-pink-300 font-bold text-xs text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-extrabold text-slate-800 mb-1">
                            Input Box Placeholder
                          </label>
                          <input
                            type="text"
                            value={adminPlaceholder}
                            onChange={(e) => setAdminPlaceholder(e.target.value)}
                            placeholder="0300-1234567 or email@gmail.com"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-pink-300 font-bold text-xs text-slate-900"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <button
                          type="button"
                          onClick={() => setProductStep(1)}
                          className="px-4 py-2.5 rounded-xl bg-white text-slate-700 border border-slate-300 font-extrabold text-xs cursor-pointer"
                        >
                          ← Back to Info
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            playPopSound(700);
                            setProductStep(3);
                          }}
                          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-xs sm:text-sm shadow-lg flex items-center gap-2 cursor-pointer"
                        >
                          <span>Next Step: Icon &amp; Style</span>
                          <FaChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: ICON, BADGE & VISUAL CARD THEME */}
                  {productStep === 3 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-extrabold text-slate-900 mb-1">
                          1. Top Promo Badge Text
                        </label>
                        <input
                          type="text"
                          value={adminBadge}
                          onChange={(e) => setAdminBadge(e.target.value)}
                          placeholder="🔥 HOT SERVICE"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-pink-300 font-bold text-xs sm:text-sm text-slate-900"
                        />
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {[
                            '🔥 BESTSELLER',
                            '⚡ INSTANT DELIVERY',
                            '👑 100% WARRANTY',
                            '🇬🇧 UK OFFICIAL',
                            '📡 LIVE DATABASE',
                            '💎 VIP PRO'
                          ].map((b) => (
                            <button
                              key={b}
                              type="button"
                              onClick={() => {
                                playPopSound(600);
                                setAdminBadge(b);
                              }}
                              className="px-2.5 py-1 rounded-full bg-white hover:bg-pink-50 text-slate-800 border border-pink-200 text-[10px] font-extrabold cursor-pointer"
                            >
                              {b}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-900 mb-1.5">
                          2. Choose Product Icon (50+ 3D Icons, Upload Logo, or Paste Link)
                        </label>
                        {renderVisualIconStudio(
                          adminIconType,
                          setAdminIconType,
                          adminCustomIconUrl,
                          setAdminCustomIconUrl,
                          adminDirectToolUrl
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-extrabold text-slate-800 mb-1">
                            3. 3D Card Color Style
                          </label>
                          <select
                            value={adminPlush}
                            onChange={(e) => setAdminPlush(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl bg-white border-2 border-pink-300 font-bold text-xs text-slate-900"
                          >
                            {plushOptions.map((p) => (
                              <option key={p.value} value={p.value}>
                                {p.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-extrabold text-slate-800 mb-1">
                            4. Direct Tool / Website Link (Optional)
                          </label>
                          <input
                            type="text"
                            value={adminDirectToolUrl}
                            onChange={(e) => setAdminDirectToolUrl(e.target.value)}
                            placeholder="https://... (adds Launch button)"
                            className="w-full px-3 py-2.5 rounded-xl bg-white border border-pink-300 font-mono-code text-xs text-slate-900"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <button
                          type="button"
                          onClick={() => setProductStep(2)}
                          className="px-4 py-2.5 rounded-xl bg-white text-slate-700 border border-slate-300 font-extrabold text-xs cursor-pointer"
                        >
                          ← Back to Plans
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            playPopSound(740);
                            setProductStep(4);
                          }}
                          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-xs sm:text-sm shadow-lg flex items-center gap-2 cursor-pointer"
                        >
                          <span>Final Step: Review &amp; Publish</span>
                          <FaChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: FINAL REVIEW & 1-CLICK PUBLISH */}
                  {productStep === 4 && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 space-y-2">
                        <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-xs sm:text-sm">
                          <FaCircleCheck className="text-emerald-600 w-4 h-4" />
                          <span>Ready to Publish to Live Storefront!</span>
                        </div>
                        <div className="text-xs font-semibold text-slate-700 space-y-1">
                          <div>
                            <strong>Title:</strong> {adminTitle || 'Untitled Service'} (
                            {adminCategory})
                          </div>
                          <div>
                            <strong>Badge:</strong> {adminBadge}
                          </div>
                          <div>
                            <strong>Plans ({planRows.length}):</strong>{' '}
                            {adminTiersText.split('\n').filter(Boolean).join(' • ')}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => setProductStep(3)}
                          className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-white text-slate-700 border border-slate-300 font-extrabold text-xs cursor-pointer"
                        >
                          ← Back
                        </button>
                        <button
                          type="submit"
                          onClick={() => setTimeout(() => setProductStep(1), 250)}
                          className="sim-btn-glow w-full flex-1 py-3.5 px-5 font-display font-bold text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <FaRocket className="w-4 h-4 text-amber-300" />
                          <span>
                            {editingServiceId
                              ? 'SAVE UPDATED PRODUCT TO STORE'
                              : 'PUBLISH NEW PRODUCT TO STOREFRONT'}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Right (5 Cols): Always-Live 3D Service Card Preview */}
            <div className="lg:col-span-5 space-y-4">
              <div className="acrylic-frame rounded-[32px] p-3">
                <div className="bg-white/85 rounded-[24px] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 flex items-center gap-1">
                      <FaEye className="w-3 h-3" />
                      <span>LIVE 3D PRODUCT CARD PREVIEW</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                      Step {productStep} of 4
                    </span>
                  </div>

                  {(() => {
                    const previewPlushObj =
                      plushOptions.find((p) => p.value === adminPlush) || plushOptions[0];
                    const previewTiers = adminTiersText
                      .split('\n')
                      .map((l) => l.trim())
                      .filter(Boolean);
                    return (
                      <div className="acrylic-frame rounded-[28px] p-2">
                        <div
                          className={`plush-pillow ${previewPlushObj.value} rounded-[22px] p-4 flex flex-col justify-between space-y-4`}
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <div
                                className={`fluffy-orb w-12 h-12 bg-gradient-to-br ${previewPlushObj.orb} flex items-center justify-center border-2 border-white shadow-md overflow-hidden`}
                              >
                                {renderOrbVisual(adminIconType, adminCustomIconUrl, adminTitle)}
                              </div>
                              <span className="px-2.5 py-1 rounded-full bg-white/90 border border-white text-[10px] font-extrabold text-slate-900 shadow-xs">
                                {adminBadge || '🔥 HOT SERVICE'}
                              </span>
                            </div>
                            <div>
                              <h4 className="text-base font-extrabold text-slate-900">
                                {adminTitle || 'Your New Product Title'}
                              </h4>
                              <p className="text-xs font-medium text-slate-700 mt-1">
                                {adminDesc ||
                                  'Instant activation & 100% full replacement warranty via WhatsApp.'}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-slate-900/10">
                            <select className="w-full px-2.5 py-2 rounded-xl bg-white/90 border border-white text-xs font-extrabold text-slate-900">
                              {(previewTiers.length > 0
                                ? previewTiers
                                : ['1 Month Package — Rs. 500']
                              ).map((t, i) => (
                                <option key={i}>{t}</option>
                              ))}
                            </select>
                            <div className="py-2 px-3 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white font-extrabold text-xs text-center shadow flex items-center justify-center gap-1.5">
                              <SiWhatsapp className="w-3.5 h-3.5" /> Buy Now (Live Preview)
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Searchable Store Products Catalog List */}
          <div className="acrylic-frame rounded-[34px] p-3 sm:p-4">
            <div className="plush-pillow plush-about rounded-[26px] p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-base sm:text-lg font-extrabold text-slate-900">
                    Manage All Store Products ({adminFilteredCatalog.length})
                  </h4>
                  <p className="text-xs font-semibold text-slate-600">
                    Tap Edit on any product to change its description, plans, or prices in the Step-by-Step Wizard.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={adminSearchFilter}
                    onChange={(e) => setAdminSearchFilter(e.target.value)}
                    placeholder="Search products..."
                    className="px-3.5 py-2 rounded-2xl bg-white border-2 border-pink-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-pink-500 sm:w-64"
                  />
                  <button
                    type="button"
                    onClick={resetCatalogToDefault}
                    className="px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-extrabold cursor-pointer"
                  >
                    Restore Defaults
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[460px] overflow-y-auto pr-1">
                {adminFilteredCatalog.map((srv) => (
                  <div
                    key={srv.id}
                    className="p-3.5 rounded-2xl bg-white/90 border border-pink-100 flex items-center justify-between gap-3 hover:border-pink-400 shadow-xs transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${srv.orbGrad} text-white flex items-center justify-center flex-shrink-0 shadow overflow-hidden`}
                      >
                        {renderOrbVisual(srv.iconType, srv.customIconUrl, `${srv.id} ${srv.title}`)}
                      </div>
                      <div className="min-w-0">
                        <span className="px-2 py-0.5 rounded-md bg-pink-50 text-pink-700 text-[9px] font-extrabold border border-pink-200">
                          {srv.badge}
                        </span>
                        <div className="text-xs sm:text-sm font-extrabold text-slate-900 truncate mt-0.5">
                          {srv.title}
                        </div>
                        <div className="text-[10px] font-bold text-slate-500 truncate">
                          {srv.tiers.length} Plans • {srv.tiers[0]}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEditServiceInWizard(srv)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-extrabold cursor-pointer flex items-center gap-1"
                      >
                        <FaPenToSquare className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteService(srv.id, srv.title)}
                        className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-extrabold cursor-pointer"
                      >
                        <FaTrashCan className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== SCREEN 2: 4-STEP LIVE WEB TOOL WIZARD & MANAGER ==================== */}
      {activeScreen === 'tools' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left (7 Cols): 4-Step Web Tool Wizard */}
            <div className="lg:col-span-7 acrylic-frame rounded-[34px] p-3 sm:p-4">
              <div className="plush-pillow plush-capcut rounded-[26px] p-4 sm:p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-200 pb-3.5">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700">
                      {editingToolId
                        ? '✏️ STEP-BY-STEP WEB TOOL EDITOR'
                        : '➕ STEP-BY-STEP NEW WEB TOOL WIZARD'}
                    </span>
                    <h3 className="text-base sm:text-xl font-extrabold text-slate-900">
                      {editingToolId
                        ? `Editing Tool: ${toolTitle}`
                        : 'Add New Live Web Tool Step by Step'}
                    </h3>
                  </div>
                  {editingToolId && (
                    <button
                      type="button"
                      onClick={() => {
                        resetToolForm();
                        setToolStep(1);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-100 text-rose-800 text-xs font-extrabold cursor-pointer"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                {/* 4-Step Progress Pills */}
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { step: 1 as const, label: '1. Tool Info' },
                    { step: 2 as const, label: '2. URL & Mode' },
                    { step: 3 as const, label: '3. Icon & Style' },
                    { step: 4 as const, label: '4. Publish' }
                  ].map((s) => {
                    const isCurr = toolStep === s.step;
                    const isDone = toolStep > s.step;
                    return (
                      <button
                        key={s.step}
                        type="button"
                        onClick={() => {
                          playPopSound(620);
                          setToolStep(s.step);
                        }}
                        className={`py-2 px-2 rounded-xl text-[10px] sm:text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-1 border ${
                          isCurr
                            ? 'bg-gradient-to-r from-indigo-600 to-pink-500 text-white border-white shadow-md'
                            : isDone
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-white/80 text-slate-700 border-indigo-200'
                        }`}
                      >
                        {isDone && <FaCheck className="w-2.5 h-2.5 text-emerald-600" />}
                        <span className="truncate">{s.label}</span>
                      </button>
                    );
                  })}
                </div>

                <form onSubmit={handleSaveAdminTool} className="space-y-4">
                  {toolStep === 1 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-extrabold text-slate-900 mb-1">
                          1. Web Tool Name / Title *
                        </label>
                        <input
                          type="text"
                          value={toolTitle}
                          onChange={(e) => setToolTitle(e.target.value)}
                          required
                          placeholder="e.g. TikTok HD Downloader or Temp Mail Generator"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-indigo-300 font-bold text-xs sm:text-sm text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-900 mb-1">
                          2. Tool Description *
                        </label>
                        <textarea
                          rows={3}
                          value={toolDesc}
                          onChange={(e) => setToolDesc(e.target.value)}
                          required
                          placeholder="Describe what users can do with this live web tool..."
                          className="w-full p-3 rounded-xl bg-white border-2 border-indigo-300 font-semibold text-xs sm:text-sm text-slate-900"
                        />
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (!toolTitle.trim()) {
                              showToast('Please enter a Tool Name first!');
                              return;
                            }
                            playPopSound(700);
                            setToolStep(2);
                          }}
                          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-pink-500 text-white font-extrabold text-xs sm:text-sm shadow-lg flex items-center gap-2 cursor-pointer"
                        >
                          <span>Next Step: Link &amp; Launch Mode</span>
                          <FaChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {toolStep === 2 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-extrabold text-slate-900 mb-1">
                          1. Tool Website URL / Link *
                        </label>
                        <input
                          type="text"
                          value={toolUrl}
                          onChange={(e) => setToolUrl(e.target.value)}
                          required
                          placeholder="https://example.com"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-indigo-300 font-mono-code font-bold text-xs sm:text-sm text-slate-900"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-extrabold text-slate-900 mb-1">
                            2. Launch Button Label
                          </label>
                          <input
                            type="text"
                            value={toolButtonLabel}
                            onChange={(e) => setToolButtonLabel(e.target.value)}
                            placeholder="Open Live Tool"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-indigo-300 font-bold text-xs text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-extrabold text-slate-900 mb-1">
                            3. How Should This Tool Open?
                          </label>
                          <select
                            value={toolOpenMode}
                            onChange={(e) =>
                              setToolOpenMode(
                                e.target.value as 'new_tab' | 'embed_modal' | 'sim_tab'
                              )
                            }
                            className="w-full px-3 py-2.5 rounded-xl bg-white border border-indigo-300 font-bold text-xs text-slate-900"
                          >
                            <option value="new_tab">🌐 Open in New Browser Tab</option>
                            <option value="embed_modal">🖼️ Open Inside 3D Popup Viewer</option>
                            <option value="sim_tab">📡 Open SIM &amp; CNIC Tracker</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <button
                          type="button"
                          onClick={() => setToolStep(1)}
                          className="px-4 py-2.5 rounded-xl bg-white text-slate-700 border border-slate-300 font-extrabold text-xs cursor-pointer"
                        >
                          ← Back
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!toolUrl.trim()) {
                              showToast('Please enter the Tool URL first!');
                              return;
                            }
                            playPopSound(700);
                            setToolStep(3);
                          }}
                          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-pink-500 text-white font-extrabold text-xs sm:text-sm shadow-lg flex items-center gap-2 cursor-pointer"
                        >
                          <span>Next Step: Icon &amp; Badge</span>
                          <FaChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {toolStep === 3 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-extrabold text-slate-900 mb-1.5">
                          1. Choose Tool Icon (50+ 3D Icons, Auto-Grab Website Logo, or Upload PNG/SVG)
                        </label>
                        {renderVisualIconStudio(
                          toolIconType,
                          setToolIconType,
                          toolIconUrl,
                          setToolIconUrl,
                          toolUrl
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-extrabold text-slate-900 mb-1">
                            2. Top Badge Text
                          </label>
                          <input
                            type="text"
                            value={toolBadge}
                            onChange={(e) => setToolBadge(e.target.value)}
                            placeholder="⚡ LIVE WEB TOOL"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-indigo-300 font-bold text-xs text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-extrabold text-slate-900 mb-1">
                            3. 3D Card Theme
                          </label>
                          <select
                            value={toolPlush}
                            onChange={(e) => setToolPlush(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-indigo-300 font-bold text-xs text-slate-900"
                          >
                            {plushOptions.map((p) => (
                              <option key={p.value} value={p.value}>
                                {p.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <button
                          type="button"
                          onClick={() => setToolStep(2)}
                          className="px-4 py-2.5 rounded-xl bg-white text-slate-700 border border-slate-300 font-extrabold text-xs cursor-pointer"
                        >
                          ← Back
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            playPopSound(740);
                            setToolStep(4);
                          }}
                          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-xs sm:text-sm shadow-lg flex items-center gap-2 cursor-pointer"
                        >
                          <span>Final Step: Preview &amp; Publish</span>
                          <FaChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {toolStep === 4 && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 space-y-1.5 text-xs">
                        <div className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                          <FaCircleCheck className="text-emerald-600" />
                          <span>Web Tool Ready to Publish!</span>
                        </div>
                        <div>
                          <strong>Tool Name:</strong> {toolTitle || 'Untitled Tool'}
                        </div>
                        <div>
                          <strong>Target Link:</strong> {toolUrl || 'https://...'}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => setToolStep(3)}
                          className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-white text-slate-700 border border-slate-300 font-extrabold text-xs cursor-pointer"
                        >
                          ← Back
                        </button>
                        <button
                          type="submit"
                          onClick={() => setTimeout(() => setToolStep(1), 250)}
                          className="sim-btn-glow w-full flex-1 py-3.5 px-5 font-display font-bold text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <FaRocket className="w-4 h-4 text-amber-300" />
                          <span>
                            {editingToolId
                              ? 'SAVE UPDATED WEB TOOL'
                              : 'PUBLISH NEW WEB TOOL TO WEBSITE'}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Right (5 Cols): Live 3D Tool Card Preview */}
            <div className="lg:col-span-5 space-y-4">
              <div className="acrylic-frame rounded-[32px] p-3">
                <div className="bg-white/85 rounded-[24px] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700">
                      LIVE 3D WEB TOOL PREVIEW
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                      Step {toolStep} of 4
                    </span>
                  </div>

                  {(() => {
                    const previewPlushObj =
                      plushOptions.find((p) => p.value === toolPlush) || plushOptions[1];
                    return (
                      <div className="acrylic-frame rounded-[26px] p-2">
                        <div
                          className={`plush-pillow ${previewPlushObj.value} rounded-[20px] p-4 flex flex-col justify-between space-y-3.5`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div
                                className={`fluffy-orb w-12 h-12 bg-gradient-to-br ${previewPlushObj.orb} flex items-center justify-center border-2 border-white shadow-md overflow-hidden`}
                              >
                                {renderOrbVisual(toolIconType, toolIconUrl, toolTitle)}
                              </div>
                              <span className="px-2.5 py-1 rounded-full bg-white/90 border border-white text-[10px] font-extrabold text-slate-900 shadow-xs">
                                {toolBadge || '⚡ LIVE WEB TOOL'}
                              </span>
                            </div>
                            <h4 className="text-base font-extrabold text-slate-900">
                              {toolTitle || 'Your New Tool Name'}
                            </h4>
                            <p className="text-xs font-medium text-slate-700">
                              {toolDesc ||
                                'Instant online digital utility powered by Muhammad Saqib.'}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-900/10 space-y-2">
                            <div className="text-[10px] font-mono-code font-bold text-indigo-700 truncate bg-white/80 px-2.5 py-1 rounded-lg border border-white">
                              {toolUrl || 'https://your-tool-link.com'}
                            </div>
                            <div className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white font-extrabold text-xs text-center shadow">
                              {toolButtonLabel || 'Open Live Tool'}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Manage All Web Tools List */}
          <div className="acrylic-frame rounded-[34px] p-3 sm:p-4">
            <div className="plush-pillow plush-about rounded-[26px] p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-base sm:text-lg font-extrabold text-slate-900">
                    Manage All Live Web Tools ({adminFilteredTools.length})
                  </h4>
                  <p className="text-xs font-semibold text-slate-600">
                    Click Edit to load any tool into the 4-step wizard or Trash to remove it.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={toolSearchFilter}
                    onChange={(e) => setToolSearchFilter(e.target.value)}
                    placeholder="Filter tools..."
                    className="px-3.5 py-2 rounded-2xl bg-white border-2 border-indigo-200 text-xs font-bold text-slate-900 sm:w-64"
                  />
                  <button
                    type="button"
                    onClick={resetToolsToDefault}
                    className="px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-extrabold cursor-pointer"
                  >
                    Restore Defaults
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[460px] overflow-y-auto pr-1">
                {adminFilteredTools.map((tool) => (
                  <div
                    key={tool.id}
                    className="p-3.5 rounded-2xl bg-white/90 border border-indigo-100 flex items-center justify-between gap-3 hover:border-indigo-400 shadow-xs transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.orbGrad} text-white flex items-center justify-center flex-shrink-0 shadow overflow-hidden`}
                      >
                        {renderOrbVisual(tool.iconType, tool.iconUrl, `${tool.id} ${tool.title}`)}
                      </div>
                      <div className="min-w-0">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[9px] font-extrabold border border-indigo-200">
                          {tool.badge}
                        </span>
                        <div className="text-xs sm:text-sm font-extrabold text-slate-900 truncate mt-0.5">
                          {tool.title}
                        </div>
                        <div className="text-[10px] font-mono-code font-bold text-pink-600 truncate">
                          {tool.toolUrl}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => launchWebTool(tool)}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-extrabold cursor-pointer"
                      >
                        <FaArrowUpRightFromSquare className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEditToolInWizard(tool)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-extrabold cursor-pointer flex items-center gap-1"
                      >
                        <FaPenToSquare className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteTool(tool.id, tool.title)}
                        className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-extrabold cursor-pointer"
                      >
                        <FaTrashCan className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== SCREEN 3: HERO BANNER & VISIBILITY STUDIO (3 STEPS) ==================== */}
      {activeScreen === 'banner' && (
        <div className="acrylic-frame rounded-[34px] p-3 sm:p-4">
          <div className="plush-pillow plush-hero rounded-[26px] p-4 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-pink-200 pb-3.5">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-pink-600">
                  🖼️ STEP-BY-STEP HERO BANNER STUDIO
                </span>
                <h3 className="text-base sm:text-xl font-extrabold text-slate-900">
                  Show / Hide Hero Banner &amp; Customize Headline, Badge &amp; Photo
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  onUpdateSiteConfig((prev) => ({
                    ...prev,
                    banner: DEFAULT_SITE_CONFIG.banner
                  }));
                  showToast('Hero Banner restored to default!');
                }}
                className="px-3 py-1.5 rounded-xl bg-white text-rose-700 border border-rose-200 text-xs font-extrabold cursor-pointer"
              >
                Reset Banner
              </button>
            </div>

            {/* 3-Step Selector */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { step: 1 as const, label: '1. Show / Hide & Top Strip' },
                { step: 2 as const, label: '2. Headline, Badge & Bio' },
                { step: 3 as const, label: '3. Portrait Image & Preview' }
              ].map((s) => (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => {
                    playPopSound(620);
                    setBannerStep(s.step);
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                    bannerStep === s.step
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                      : 'bg-white/85 text-slate-700 border border-pink-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {bannerStep === 1 && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-white/90 border border-pink-200 divide-y divide-slate-200/70">
                  <div className="p-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-extrabold text-slate-900">
                        Show Main 3D Hero Banner on Website
                      </div>
                      <div className="text-xs font-semibold text-slate-600">
                        Turn OFF if you want visitors to see the Store Products immediately at the top
                      </div>
                    </div>
                    {renderToggleSwitch(
                      siteConfig.banner.showHeroBanner,
                      () =>
                        onUpdateSiteConfig((prev) => ({
                          ...prev,
                          banner: {
                            ...prev.banner,
                            showHeroBanner: !prev.banner.showHeroBanner
                          }
                        })),
                      'Show Hero Banner'
                    )}
                  </div>

                  <div className="p-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-extrabold text-slate-900">
                        Show Top Title Strip &amp; WhatsApp Pill
                      </div>
                      <div className="text-xs font-semibold text-slate-600">
                        Displays &ldquo;{siteConfig.banner.topStripTitle}&rdquo; and your live WhatsApp button
                      </div>
                    </div>
                    {renderToggleSwitch(
                      siteConfig.banner.showTopStrip,
                      () =>
                        onUpdateSiteConfig((prev) => ({
                          ...prev,
                          banner: {
                            ...prev.banner,
                            showTopStrip: !prev.banner.showTopStrip
                          }
                        })),
                      'Show Top Strip'
                    )}
                  </div>

                  <div className="p-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-extrabold text-slate-900">
                        🌈 Soft Light RGB Border Around Portfolio &amp; All Cards (ON / OFF)
                      </div>
                      <div className="text-xs font-semibold text-slate-600">
                        Illuminates your circular portfolio portrait &amp; card borders with a soft, airy light-mode RGB flow (never dark!)
                      </div>
                    </div>
                    {renderToggleSwitch(
                      siteConfig.banner.rgbBorderEnabled !== false,
                      () =>
                        onUpdateSiteConfig((prev) => ({
                          ...prev,
                          banner: {
                            ...prev.banner,
                            rgbBorderEnabled: prev.banner.rgbBorderEnabled === false
                          }
                        })),
                      'Show Soft Light RGB Borders'
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-900 mb-1">
                    Top Strip Heading Text
                  </label>
                  <input
                    type="text"
                    value={siteConfig.banner.topStripTitle}
                    onChange={(e) =>
                      onUpdateSiteConfig((prev) => ({
                        ...prev,
                        banner: { ...prev.banner, topStripTitle: e.target.value }
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-pink-300 font-bold text-xs sm:text-sm text-slate-900"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setBannerStep(2)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-xs cursor-pointer"
                  >
                    Next: Headline &amp; Description →
                  </button>
                </div>
              </div>
            )}

            {bannerStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-900 mb-1">
                    Top Promo Status Badge Text
                  </label>
                  <input
                    type="text"
                    value={siteConfig.banner.badgeText}
                    onChange={(e) =>
                      onUpdateSiteConfig((prev) => ({
                        ...prev,
                        banner: { ...prev.banner, badgeText: e.target.value }
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-pink-300 font-bold text-xs text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-900 mb-1">
                      Main Hero Name / Title
                    </label>
                    <input
                      type="text"
                      value={siteConfig.banner.mainTitle}
                      onChange={(e) =>
                        onUpdateSiteConfig((prev) => ({
                          ...prev,
                          banner: { ...prev.banner, mainTitle: e.target.value }
                        }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-pink-300 font-bold text-xs sm:text-sm text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-slate-900 mb-1">
                      Highlighted Brand Subtitle
                    </label>
                    <input
                      type="text"
                      value={siteConfig.banner.highlightTitle}
                      onChange={(e) =>
                        onUpdateSiteConfig((prev) => ({
                          ...prev,
                          banner: { ...prev.banner, highlightTitle: e.target.value }
                        }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-pink-300 font-bold text-xs sm:text-sm text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-900 mb-1">
                    Hero Bio / Services Description Paragraph
                  </label>
                  <textarea
                    rows={3}
                    value={siteConfig.banner.description}
                    onChange={(e) =>
                      onUpdateSiteConfig((prev) => ({
                        ...prev,
                        banner: { ...prev.banner, description: e.target.value }
                      }))
                    }
                    className="w-full p-3 rounded-xl bg-white border-2 border-pink-300 font-semibold text-xs sm:text-sm text-slate-900"
                  />
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setBannerStep(1)}
                    className="px-4 py-2.5 rounded-xl bg-white text-slate-700 border border-slate-300 font-extrabold text-xs cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setBannerStep(3)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-extrabold text-xs cursor-pointer"
                  >
                    Next: Portrait Photo &amp; Save →
                  </button>
                </div>
              </div>
            )}

            {bannerStep === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-900 mb-1">
                    Hero Circular Portrait Image URL
                  </label>
                  <input
                    type="text"
                    value={siteConfig.banner.portraitUrl}
                    onChange={(e) =>
                      onUpdateSiteConfig((prev) => ({
                        ...prev,
                        banner: { ...prev.banner, portraitUrl: e.target.value }
                      }))
                    }
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-pink-300 font-mono-code text-xs text-slate-900"
                  />
                </div>

                {/* Live Mini Preview of Hero Banner */}
                <div className="p-4 rounded-2xl bg-white/90 border-2 border-white shadow-sm flex flex-col sm:flex-row items-center gap-4">
                  <img
                    src={siteConfig.banner.portraitUrl}
                    alt="Portrait Preview"
                    className="w-20 h-20 rounded-full object-cover border-2 border-pink-400 shadow-md flex-shrink-0"
                  />
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 text-[9px] font-extrabold">
                      {siteConfig.banner.badgeText}
                    </span>
                    <div className="text-base font-extrabold text-slate-900">
                      {siteConfig.banner.mainTitle}{' '}
                      <span className="text-pink-600">{siteConfig.banner.highlightTitle}</span>
                    </div>
                    <p className="text-xs font-medium text-slate-600">
                      {siteConfig.banner.description}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setBannerStep(2)}
                    className="px-4 py-2.5 rounded-xl bg-white text-slate-700 border border-slate-300 font-extrabold text-xs cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playPopSound(840);
                      showToast('✅ Hero Banner Settings Saved & Live!');
                      setActiveScreen('home');
                    }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-xs sm:text-sm shadow-lg cursor-pointer"
                  >
                    ✓ Save &amp; Return to Settings Menu
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== SCREEN 4: PAYMENT METHODS & ACCOUNT NUMBERS EDITOR ==================== */}
      {activeScreen === 'payment_methods' && (
        <div className="acrylic-frame rounded-[34px] p-3 sm:p-4">
          <div className="plush-pillow plush-contact rounded-[26px] p-4 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-200 pb-3.5">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                  🏦 STEP-BY-STEP PAYMENT METHODS &amp; ACCOUNT NUMBERS
                </span>
                <h3 className="text-base sm:text-xl font-extrabold text-slate-900">
                  Edit EasyPaisa, JazzCash, SadaPay/Bank &amp; Binance Details
                </h3>
                <p className="text-xs font-semibold text-slate-600">
                  Changes sync immediately with the Customer Add Funds Wallet &amp; Order Checkout Modal.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onUpdateSiteConfig((prev) => ({
                    ...prev,
                    paymentMethods: DEPOSIT_METHODS
                  }));
                  showToast('Payment methods restored to default!');
                }}
                className="px-3 py-1.5 rounded-xl bg-white text-rose-700 border border-rose-200 text-xs font-extrabold cursor-pointer"
              >
                Reset Accounts
              </button>
            </div>

            {/* Method Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {siteConfig.paymentMethods.map((m, idx) => {
                const isSelected = activePayMethodIdx === idx;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      playPopSound(620);
                      setActivePayMethodIdx(idx);
                    }}
                    className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-white shadow-md scale-[1.02]'
                        : 'bg-white/90 text-slate-800 border-emerald-200 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-8 h-8 rounded-xl bg-gradient-to-br ${m.grad} text-white flex items-center justify-center flex-shrink-0`}
                      >
                        {renderPaymentMethodIcon(m.id, 'w-4 h-4 text-white')}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-extrabold truncate">{m.id}</div>
                        <div
                          className={`text-[10px] font-mono-code truncate ${
                            isSelected ? 'text-emerald-100' : 'text-slate-500'
                          }`}
                        >
                          {m.accountNumber}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Payment Method Step Form */}
            {(() => {
              const currentMethod =
                siteConfig.paymentMethods[activePayMethodIdx] || siteConfig.paymentMethods[0];
              if (!currentMethod) return null;

              return (
                <div className="p-4 sm:p-5 rounded-2xl bg-white/95 border-2 border-emerald-200 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${currentMethod.grad} text-white flex items-center justify-center shadow`}
                      >
                        {renderPaymentMethodIcon(currentMethod.id, 'w-5 h-5 text-white')}
                      </span>
                      <div>
                        <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                          Editing: {currentMethod.id}
                        </h4>
                        <p className="text-[11px] font-semibold text-slate-500">
                          Step {activePayMethodIdx + 1} of {siteConfig.paymentMethods.length} Payment Gateways
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-700">
                        {currentMethod.enabled !== false ? 'Enabled' : 'Hidden'}
                      </span>
                      {renderToggleSwitch(
                        currentMethod.enabled !== false,
                        () =>
                          updatePaymentMethodField(
                            activePayMethodIdx,
                            'enabled',
                            currentMethod.enabled === false
                          ),
                        `Toggle ${currentMethod.id}`
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-900 mb-1">
                        1. Account Holder Name (Title) *
                      </label>
                      <input
                        type="text"
                        value={currentMethod.accountTitle}
                        onChange={(e) =>
                          updatePaymentMethodField(
                            activePayMethodIdx,
                            'accountTitle',
                            e.target.value
                          )
                        }
                        placeholder="e.g. Muhammad Saqib"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border-2 border-emerald-300 font-bold text-xs sm:text-sm text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-900 mb-1">
                        2. Account Number / IBAN / Binance UID *
                      </label>
                      <input
                        type="text"
                        value={currentMethod.accountNumber}
                        onChange={(e) =>
                          updatePaymentMethodField(
                            activePayMethodIdx,
                            'accountNumber',
                            e.target.value
                          )
                        }
                        placeholder="e.g. 0347-8936242"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border-2 border-emerald-300 font-mono-code font-bold text-xs sm:text-sm text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-900 mb-1">
                        3. Full Method Display Title
                      </label>
                      <input
                        type="text"
                        value={currentMethod.label}
                        onChange={(e) =>
                          updatePaymentMethodField(activePayMethodIdx, 'label', e.target.value)
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 font-bold text-xs text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-900 mb-1">
                        4. Top Badge Tag
                      </label>
                      <input
                        type="text"
                        value={currentMethod.shortTag}
                        onChange={(e) =>
                          updatePaymentMethodField(activePayMethodIdx, 'shortTag', e.target.value)
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 font-bold text-xs text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-900 mb-1">
                      5. Customer Payment Instructions Note
                    </label>
                    <input
                      type="text"
                      value={currentMethod.extraInfo}
                      onChange={(e) =>
                        updatePaymentMethodField(activePayMethodIdx, 'extraInfo', e.target.value)
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold text-xs text-slate-900"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        setActivePayMethodIdx((prev) =>
                          prev > 0 ? prev - 1 : siteConfig.paymentMethods.length - 1
                        )
                      }
                      className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-extrabold text-xs cursor-pointer"
                    >
                      ← Previous Method
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        playPopSound(820);
                        showToast(`✅ ${currentMethod.id} Account Details Saved!`);
                        if (activePayMethodIdx < siteConfig.paymentMethods.length - 1) {
                          setActivePayMethodIdx(activePayMethodIdx + 1);
                        } else {
                          setActiveScreen('home');
                        }
                      }}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-xs shadow-md cursor-pointer"
                    >
                      {activePayMethodIdx < siteConfig.paymentMethods.length - 1
                        ? 'Save & Next Method →'
                        : '✓ Save All Payment Methods'}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ==================== SCREEN 5: WHATSAPP NUMBER, SOCIALS & FOOTER LINKS (3 STEPS) ==================== */}
      {activeScreen === 'contact_footer' && (
        <div className="acrylic-frame rounded-[34px] p-3 sm:p-4">
          <div className="plush-pillow plush-about rounded-[26px] p-4 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-200 pb-3.5">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700">
                  📱 STEP-BY-STEP WHATSAPP, SOCIALS &amp; FOOTER STUDIO
                </span>
                <h3 className="text-base sm:text-xl font-extrabold text-slate-900">
                  Update Primary WhatsApp Number, Social Links &amp; Footer Branding
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  onUpdateSiteConfig((prev) => ({
                    ...prev,
                    contact: DEFAULT_SITE_CONFIG.contact,
                    socials: DEFAULT_SITE_CONFIG.socials,
                    footer: DEFAULT_SITE_CONFIG.footer
                  }));
                  showToast('Contact & Footer settings restored to default!');
                }}
                className="px-3 py-1.5 rounded-xl bg-white text-rose-700 border border-rose-200 text-xs font-extrabold cursor-pointer"
              >
                Reset Contact &amp; Footer
              </button>
            </div>

            {/* 3-Step Selector */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { step: 1 as const, label: '1. WhatsApp & Website' },
                { step: 2 as const, label: '2. Social Media Links' },
                { step: 3 as const, label: '3. Footer & Tagline' }
              ].map((s) => (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => {
                    playPopSound(620);
                    setContactStep(s.step);
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                    contactStep === s.step
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                      : 'bg-white/85 text-slate-700 border border-indigo-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {contactStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-900 mb-1">
                      1. Primary WhatsApp Display Number (Shown on Buttons) *
                    </label>
                    <input
                      type="text"
                      value={siteConfig.contact.whatsappNumberDisplay}
                      onChange={(e) => {
                        const displayVal = e.target.value;
                        const digits = displayVal.replace(/[^0-9]/g, '');
                        const normalizedClean = digits.startsWith('03')
                          ? '92' + digits.slice(1)
                          : digits || siteConfig.contact.whatsappNumberClean;
                        onUpdateSiteConfig((prev) => ({
                          ...prev,
                          contact: {
                            ...prev.contact,
                            whatsappNumberDisplay: displayVal,
                            whatsappNumberClean: normalizedClean
                          }
                        }));
                      }}
                      placeholder="+92 347 8936242"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-emerald-400 font-mono-code font-bold text-xs sm:text-sm text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-900 mb-1">
                      2. WhatsApp Direct Link Number (Country Code, No + or Spaces) *
                    </label>
                    <input
                      type="text"
                      value={siteConfig.contact.whatsappNumberClean}
                      onChange={(e) =>
                        onUpdateSiteConfig((prev) => ({
                          ...prev,
                          contact: {
                            ...prev.contact,
                            whatsappNumberClean: e.target.value.replace(/[^0-9]/g, '')
                          }
                        }))
                      }
                      placeholder="923478936242"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-emerald-400 font-mono-code font-bold text-xs sm:text-sm text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-900 mb-1">
                      3. Official Website URL
                    </label>
                    <input
                      type="text"
                      value={siteConfig.contact.officialWebsiteUrl}
                      onChange={(e) =>
                        onUpdateSiteConfig((prev) => ({
                          ...prev,
                          contact: { ...prev.contact, officialWebsiteUrl: e.target.value }
                        }))
                      }
                      placeholder="https://mrsaqib242.vercel.app"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-indigo-300 font-mono-code text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-900 mb-1">
                      4. Website Display Label / Support Email
                    </label>
                    <input
                      type="text"
                      value={siteConfig.contact.officialWebsiteLabel}
                      onChange={(e) =>
                        onUpdateSiteConfig((prev) => ({
                          ...prev,
                          contact: { ...prev.contact, officialWebsiteLabel: e.target.value }
                        }))
                      }
                      placeholder="mrsaqib242.vercel.app"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-indigo-300 font-bold text-xs text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setContactStep(2)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-xs cursor-pointer"
                  >
                    Next: Social Media Links →
                  </button>
                </div>
              </div>
            )}

            {contactStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-3 rounded-2xl bg-white/90 border border-pink-200 space-y-2">
                    <div className="text-xs font-extrabold text-pink-700">Instagram Profile</div>
                    <input
                      type="text"
                      value={siteConfig.socials.instagramHandle}
                      onChange={(e) =>
                        onUpdateSiteConfig((prev) => ({
                          ...prev,
                          socials: { ...prev.socials, instagramHandle: e.target.value }
                        }))
                      }
                      placeholder="@mrsaqib242"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-bold text-xs text-slate-900"
                    />
                    <input
                      type="text"
                      value={siteConfig.socials.instagramUrl}
                      onChange={(e) =>
                        onUpdateSiteConfig((prev) => ({
                          ...prev,
                          socials: { ...prev.socials, instagramUrl: e.target.value }
                        }))
                      }
                      placeholder="https://instagram.com/..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-mono-code text-xs text-slate-900"
                    />
                  </div>

                  <div className="p-3 rounded-2xl bg-white/90 border border-rose-200 space-y-2">
                    <div className="text-xs font-extrabold text-rose-700">TikTok Profile</div>
                    <input
                      type="text"
                      value={siteConfig.socials.tiktokHandle}
                      onChange={(e) =>
                        onUpdateSiteConfig((prev) => ({
                          ...prev,
                          socials: { ...prev.socials, tiktokHandle: e.target.value }
                        }))
                      }
                      placeholder="@mrsaqib242"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-bold text-xs text-slate-900"
                    />
                    <input
                      type="text"
                      value={siteConfig.socials.tiktokUrl}
                      onChange={(e) =>
                        onUpdateSiteConfig((prev) => ({
                          ...prev,
                          socials: { ...prev.socials, tiktokUrl: e.target.value }
                        }))
                      }
                      placeholder="https://tiktok.com/@..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-mono-code text-xs text-slate-900"
                    />
                  </div>

                  <div className="p-3 rounded-2xl bg-white/90 border border-blue-200 space-y-2">
                    <div className="text-xs font-extrabold text-blue-700">Facebook Page / Profile</div>
                    <input
                      type="text"
                      value={siteConfig.socials.facebookName}
                      onChange={(e) =>
                        onUpdateSiteConfig((prev) => ({
                          ...prev,
                          socials: { ...prev.socials, facebookName: e.target.value }
                        }))
                      }
                      placeholder="Muhammad Saqib"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-bold text-xs text-slate-900"
                    />
                    <input
                      type="text"
                      value={siteConfig.socials.facebookUrl}
                      onChange={(e) =>
                        onUpdateSiteConfig((prev) => ({
                          ...prev,
                          socials: { ...prev.socials, facebookUrl: e.target.value }
                        }))
                      }
                      placeholder="https://facebook.com/..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-mono-code text-xs text-slate-900"
                    />
                  </div>

                  <div className="p-3 rounded-2xl bg-white/90 border border-amber-200 space-y-2">
                    <div className="text-xs font-extrabold text-amber-700">Snapchat Profile</div>
                    <input
                      type="text"
                      value={siteConfig.socials.snapchatHandle}
                      onChange={(e) =>
                        onUpdateSiteConfig((prev) => ({
                          ...prev,
                          socials: { ...prev.socials, snapchatHandle: e.target.value }
                        }))
                      }
                      placeholder="mrsaqib242"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-bold text-xs text-slate-900"
                    />
                    <input
                      type="text"
                      value={siteConfig.socials.snapchatUrl}
                      onChange={(e) =>
                        onUpdateSiteConfig((prev) => ({
                          ...prev,
                          socials: { ...prev.socials, snapchatUrl: e.target.value }
                        }))
                      }
                      placeholder="https://snapchat.com/add/..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-mono-code text-xs text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setContactStep(1)}
                    className="px-4 py-2.5 rounded-xl bg-white text-slate-700 border border-slate-300 font-extrabold text-xs cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setContactStep(3)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-xs cursor-pointer"
                  >
                    Next: Footer Branding →
                  </button>
                </div>
              </div>
            )}

            {contactStep === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-900 mb-1">
                      1. Footer Brand Name
                    </label>
                    <input
                      type="text"
                      value={siteConfig.footer.brandName}
                      onChange={(e) =>
                        onUpdateSiteConfig((prev) => ({
                          ...prev,
                          footer: { ...prev.footer, brandName: e.target.value }
                        }))
                      }
                      placeholder="🚀 Muhammad Saqib"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-indigo-300 font-bold text-xs sm:text-sm text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-900 mb-1">
                      2. Footer Warranty / Copyright Tagline
                    </label>
                    <input
                      type="text"
                      value={siteConfig.footer.copyrightTagline}
                      onChange={(e) =>
                        onUpdateSiteConfig((prev) => ({
                          ...prev,
                          footer: { ...prev.footer, copyrightTagline: e.target.value }
                        }))
                      }
                      placeholder="24/7 Instant Delivery • 100% Full Replacement Warranty"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-indigo-300 font-bold text-xs sm:text-sm text-slate-900"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/90 border border-indigo-200 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-extrabold text-slate-900">
                      Show Footer Quick Navigation Links
                    </div>
                    <div className="text-xs font-semibold text-slate-600">
                      Displays Store, Web Tools, About, FAQs, Contact, and VIP Login links in the footer bar
                    </div>
                  </div>
                  {renderToggleSwitch(
                    siteConfig.footer.showQuickLinks,
                    () =>
                      onUpdateSiteConfig((prev) => ({
                        ...prev,
                        footer: {
                          ...prev.footer,
                          showQuickLinks: !prev.footer.showQuickLinks
                        }
                      })),
                    'Show Footer Quick Links'
                  )}
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setContactStep(2)}
                    className="px-4 py-2.5 rounded-xl bg-white text-slate-700 border border-slate-300 font-extrabold text-xs cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playPopSound(840);
                      showToast('✅ WhatsApp, Socials & Footer Links Saved!');
                      setActiveScreen('home');
                    }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-xs sm:text-sm shadow-lg cursor-pointer"
                  >
                    ✓ Save &amp; Return to Settings Menu
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== SCREEN 6: PAYMENT PROOFS & USER BALANCE STUDIO ==================== */}
      {activeScreen === 'payments' && (
        <AdminPaymentApprovalStudio
          walletBalance={walletBalance}
          paymentProofs={paymentProofs}
          onApproveProof={handleApprovePaymentProof}
          onRejectProof={handleRejectPaymentProof}
          onDeleteProof={handleDeletePaymentProof}
          onSetCustomBalance={handleSetCustomBalance}
          onPreviewScreenshot={onPreviewScreenshot}
          onCopyText={copyText}
        />
      )}

      {/* ==================== SCREEN 7: WEBSITE UI THEME & FONT STUDIO ==================== */}
      {activeScreen === 'ui' && (
        <AdminUiThemeSwitcherStudio
          uiMode={websiteUiMode}
          onChangeUiMode={(mode) => setWebsiteUiMode(mode)}
          fontMode={websiteFontMode}
          onChangeFontMode={(font) => setWebsiteFontMode(font)}
          playClick={playPopSound}
          showToast={showToast}
        />
      )}
    </div>
  );
};
