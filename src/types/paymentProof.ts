export type DepositMethodId = 'EasyPaisa' | 'JazzCash' | 'SadaPay / Bank' | 'Binance / USDT' | string;

export interface PaymentProofRequest {
  id: string;
  amount: number;
  method: DepositMethodId;
  senderAccountName: string;
  senderAccountNumber: string;
  trxId: string;
  screenshotUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  userNote?: string;
}

export interface DepositMethodMeta {
  id: DepositMethodId;
  label: string;
  shortTag: string;
  accountTitle: string;
  accountNumber: string;
  extraInfo: string;
  icon: string;
  grad: string;
  badgeBg: string;
  enabled?: boolean;
}

export const DEPOSIT_METHODS: DepositMethodMeta[] = [
  {
    id: 'EasyPaisa',
    label: 'EasyPaisa Mobile Account',
    shortTag: '⚡ Instant Auto-Verify',
    accountTitle: 'Muhammad Saqib',
    accountNumber: '0347-8936242',
    extraInfo: 'Send via EasyPaisa App or *786# and take screenshot',
    icon: 'fa-solid fa-mobile-screen-button',
    grad: 'from-emerald-500 to-green-600',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    enabled: true
  },
  {
    id: 'JazzCash',
    label: 'JazzCash Mobile Account',
    shortTag: '🔥 Fast Approval',
    accountTitle: 'Muhammad Saqib',
    accountNumber: '0347-8936242',
    extraInfo: 'Send via JazzCash App or Raast ID (03478936242)',
    icon: 'fa-solid fa-wallet',
    grad: 'from-rose-500 to-red-600',
    badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
    enabled: true
  },
  {
    id: 'SadaPay / Bank',
    label: 'SadaPay / NayaPay / Raast IBFT',
    shortTag: '🏦 0% Fee Raast',
    accountTitle: 'Muhammad Saqib',
    accountNumber: '0347-8936242',
    extraInfo: 'Transfer from any Bank App via Raast / SadaPay / NayaPay',
    icon: 'fa-solid fa-building-columns',
    grad: 'from-teal-500 to-cyan-600',
    badgeBg: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    enabled: true
  },
  {
    id: 'Binance / USDT',
    label: 'Binance Pay / USDT (TRC20)',
    shortTag: '💲 Crypto Top-Up',
    accountTitle: 'Saqib Visuals Official',
    accountNumber: 'WhatsApp +92 347 8936242 (Ask UID)',
    extraInfo: 'Send USDT via Binance Pay UID or TRC20 & upload receipt SS',
    icon: 'fa-brands fa-bitcoin',
    grad: 'from-amber-500 to-orange-600',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
    enabled: true
  }
];

export function createSampleReceiptDataUrl(
  method: DepositMethodId,
  amount: number,
  senderName: string,
  senderNumber: string,
  trxId: string
): string {
  const cleanName = (senderName || 'Ali Raza').replace(/[<>&"']/g, '');
  const cleanNum = (senderNumber || '0301-2345678').replace(/[<>&"']/g, '');
  const cleanTrx = (trxId || 'TID-894205182').replace(/[<>&"']/g, '');
  const headerColor =
    method === 'EasyPaisa'
      ? '#059669'
      : method === 'JazzCash'
      ? '#e11d48'
      : method === 'SadaPay / Bank'
      ? '#0891b2'
      : '#f59e0b';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="520" height="680" viewBox="0 0 520 680">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${headerColor}"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
    </defs>
    <rect width="520" height="680" rx="28" fill="#ffffff"/>
    <rect x="0" y="0" width="520" height="150" rx="28" fill="url(#g)"/>
    <circle cx="260" cy="150" r="44" fill="#ffffff" stroke="#f1f5f9" stroke-width="8"/>
    <circle cx="260" cy="150" r="32" fill="${headerColor}"/>
    <path d="M250 150 l7 7 l15 -15" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <text x="260" y="60" font-family="sans-serif" font-size="20" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1">MUHAMMAD SAQIB VISUALS</text>
    <text x="260" y="88" font-family="sans-serif" font-size="13" font-weight="600" fill="#f8fafc" text-anchor="middle" opacity="0.9">TRANSACTION SUCCESSFUL RECEIPT</text>
    <text x="260" y="235" font-family="sans-serif" font-size="14" font-weight="700" fill="#64748b" text-anchor="middle">TOTAL AMOUNT PAID</text>
    <text x="260" y="275" font-family="sans-serif" font-size="36" font-weight="900" fill="#0f172a" text-anchor="middle">Rs. ${amount.toLocaleString()}</text>
    <rect x="40" y="320" width="440" height="280" rx="18" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5"/>
    <text x="60" y="366" font-family="sans-serif" font-size="14" font-weight="700" fill="#64748b">Payment Gateway:</text>
    <text x="460" y="366" font-family="sans-serif" font-size="15" font-weight="800" fill="#0f172a" text-anchor="end">${method}</text>
    <line x1="60" y1="384" x2="460" y2="384" stroke="#f1f5f9" stroke-width="2"/>
    <text x="60" y="416" font-family="sans-serif" font-size="14" font-weight="700" fill="#64748b">Receiver Account:</text>
    <text x="460" y="416" font-family="sans-serif" font-size="15" font-weight="800" fill="#059669" text-anchor="end">Muhammad Saqib (03478936242)</text>
    <line x1="60" y1="434" x2="460" y2="434" stroke="#f1f5f9" stroke-width="2"/>
    <text x="60" y="466" font-family="sans-serif" font-size="14" font-weight="700" fill="#64748b">Sender Name:</text>
    <text x="460" y="466" font-family="sans-serif" font-size="15" font-weight="800" fill="#0f172a" text-anchor="end">${cleanName}</text>
    <line x1="60" y1="484" x2="460" y2="484" stroke="#f1f5f9" stroke-width="2"/>
    <text x="60" y="516" font-family="sans-serif" font-size="14" font-weight="700" fill="#64748b">Sender Account:</text>
    <text x="460" y="516" font-family="monospace" font-size="15" font-weight="800" fill="#0f172a" text-anchor="end">${cleanNum}</text>
    <line x1="60" y1="534" x2="460" y2="534" stroke="#f1f5f9" stroke-width="2"/>
    <text x="60" y="566" font-family="sans-serif" font-size="14" font-weight="700" fill="#64748b">TRX / Reference ID:</text>
    <text x="460" y="566" font-family="monospace" font-size="15" font-weight="800" fill="#7c3aed" text-anchor="end">#${cleanTrx}</text>
    <text x="260" y="636" font-family="sans-serif" font-size="12" font-weight="700" fill="#64748b" text-anchor="middle">Verified Screenshot • Saqib Visuals Wallet Deposit</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const DEFAULT_PAYMENT_PROOFS: PaymentProofRequest[] = [];
