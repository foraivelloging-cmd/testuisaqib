'use client';

import React, { useState, useRef } from 'react';
import { renderPaymentMethodIcon } from './BrandIcons';
export {
  type DepositMethodId,
  type PaymentProofRequest,
  type DepositMethodMeta,
  DEPOSIT_METHODS,
  createSampleReceiptDataUrl,
  DEFAULT_PAYMENT_PROOFS
} from '../types/paymentProof';
import {
  DepositMethodId,
  PaymentProofRequest,
  DepositMethodMeta,
  DEPOSIT_METHODS,
  createSampleReceiptDataUrl,
  DEFAULT_PAYMENT_PROOFS
} from '../types/paymentProof';

interface UserDepositProps {
  walletBalance: number;
  paymentProofs: PaymentProofRequest[];
  onSubmitProof: (newProof: Omit<PaymentProofRequest, 'id' | 'status' | 'createdAt'>) => void;
  onCopyText: (text: string, label: string) => void;
  onPlayPop: (freq?: number) => void;
  onPreviewScreenshot: (proof: PaymentProofRequest) => void;
  compactMode?: boolean;
  depositMethods?: DepositMethodMeta[];
  currencyPrefix?: string;
  minDepositAmount?: number;
}

export const UserAddFundsExperience: React.FC<UserDepositProps> = ({
  walletBalance,
  paymentProofs,
  onSubmitProof,
  onCopyText,
  onPlayPop,
  onPreviewScreenshot,
  compactMode = false,
  depositMethods = DEPOSIT_METHODS,
  currencyPrefix = 'Rs.',
  minDepositAmount = 50
}) => {
  const activeDepositMethods =
    depositMethods.filter((m) => m.enabled !== false).length > 0
      ? depositMethods.filter((m) => m.enabled !== false)
      : DEPOSIT_METHODS;

  // Step 1: Enter Amount & Choose Method -> Step 2: Enter Account Name/Details & Upload SS
  const [step, setStep] = useState<1 | 2>(1);
  const [amountInput, setAmountInput] = useState<string>('1500');
  const [selectedMethod, setSelectedMethod] = useState<DepositMethodId>(
    activeDepositMethods[0]?.id || 'EasyPaisa'
  );

  // Step 2 Sender Fields
  const [senderName, setSenderName] = useState<string>('');
  const [senderNumber, setSenderNumber] = useState<string>('');
  const [trxId, setTrxId] = useState<string>('');
  const [userNote, setUserNote] = useState<string>('');
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string>('');
  const [uploadFileName, setUploadFileName] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [justSubmitted, setJustSubmitted] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeMethodMeta =
    activeDepositMethods.find((m) => m.id === selectedMethod) || activeDepositMethods[0];

  const numericAmount = Math.max(0, Number(amountInput.replace(/[^0-9]/g, '')) || 0);
  const pendingTotal = paymentProofs
    .filter((p) => p.status === 'pending')
    .reduce((acc, item) => acc + item.amount, 0);
  const pendingCount = paymentProofs.filter((p) => p.status === 'pending').length;

  const handleProceedToStep2 = () => {
    onPlayPop(640);
    const minVal = minDepositAmount > 0 ? minDepositAmount : 50;
    if (numericAmount < minVal) {
      setFormError(`Minimum deposit amount is ${currencyPrefix} ${minVal}`);
      return;
    }
    setFormError(null);
    setStep(2);
  };

  // Compress uploaded screenshot image to clean DataURL so localStorage never overflows
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onPlayPop(680);
    setUploadFileName(file.name);
    setFormError(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const rawDataUrl = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 700;
        const scale = img.width > maxW ? maxW / img.width : 1;
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressed = canvas.toDataURL('image/jpeg', 0.8);
          setScreenshotDataUrl(compressed);
        } else {
          setScreenshotDataUrl(rawDataUrl);
        }
      };
      img.onerror = () => {
        setScreenshotDataUrl(rawDataUrl);
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateSampleSS = () => {
    onPlayPop(720);
    const demoTrx = trxId.trim() || `${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    if (!trxId.trim()) setTrxId(demoTrx);
    if (!senderName.trim()) setSenderName('Ali Raza');
    if (!senderNumber.trim()) setSenderNumber('0301-2345678');

    const sampleUrl = createSampleReceiptDataUrl(
      selectedMethod,
      numericAmount || 1500,
      senderName.trim() || 'Ali Raza',
      senderNumber.trim() || '0301-2345678',
      demoTrx
    );
    setScreenshotDataUrl(sampleUrl);
    setUploadFileName(`${selectedMethod.toLowerCase()}-receipt-${numericAmount || 1500}.svg`);
    setFormError(null);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPlayPop(780);

    if (numericAmount < 100) {
      setFormError('Please enter a valid deposit amount (at least Rs. 100).');
      return;
    }
    if (!senderName.trim()) {
      setFormError('Please enter your Sender Account Holder Name.');
      return;
    }
    if (!senderNumber.trim()) {
      setFormError('Please enter your Sender Account Number.');
      return;
    }
    if (!screenshotDataUrl) {
      setFormError('Please upload your Payment Screenshot (SS) or click "Use Sample Receipt SS".');
      return;
    }

    onSubmitProof({
      amount: numericAmount,
      method: selectedMethod,
      senderAccountName: senderName.trim(),
      senderAccountNumber: senderNumber.trim(),
      trxId: trxId.trim() || `TID-${Math.floor(100000 + Math.random() * 900000)}`,
      screenshotUrl: screenshotDataUrl,
      userNote: userNote.trim() || `Wallet Top-Up via ${selectedMethod}`
    });

    setFormError(null);
    setJustSubmitted(true);
    setSenderName('');
    setSenderNumber('');
    setTrxId('');
    setUserNote('');
    setScreenshotDataUrl('');
    setUploadFileName('');
    setTimeout(() => {
      setJustSubmitted(false);
      setStep(1);
    }, 2400);
  };

  return (
    <div className="space-y-4">
      {/* ==================== TOP LIVE WALLET BALANCE & PENDING STATUS BANNER ==================== */}
      <div className="rounded-[26px] bg-gradient-to-r from-slate-950 via-indigo-950 to-purple-950 text-white p-4 sm:p-5 border-2 border-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-green-600 text-white flex items-center justify-center text-xl sm:text-2xl shadow-lg border-2 border-white flex-shrink-0">
              <i className="fa-solid fa-wallet"></i>
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-extrabold uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>YOUR LIVE WALLET BALANCE</span>
              </div>
              <div className="flex items-baseline gap-2.5 mt-0.5">
                <span className="font-display font-bold text-2xl sm:text-4xl text-white">
                  Rs. {walletBalance.toLocaleString()}
                </span>
                <span className="text-[11px] font-bold text-emerald-300">Available to Spend</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            {pendingCount > 0 && (
              <div className="px-3 py-2 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-left">
                <div className="text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <i className="fa-solid fa-hourglass-half animate-spin"></i> Pending Admin Proof
                </div>
                <div className="font-display font-bold text-xs sm:text-sm text-amber-300">
                  Rs. {pendingTotal.toLocaleString()} ({pendingCount} Request{pendingCount > 1 ? 's' : ''})
                </div>
              </div>
            )}
            <div className="px-3.5 py-2 rounded-2xl bg-white/10 border border-white/15 text-left">
              <div className="text-[9px] font-extrabold uppercase text-pink-200">Instant Top-Up</div>
              <div className="text-xs font-extrabold text-white">EasyPaisa • JazzCash • Bank</div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 2-STEP INTERACTIVE ADD FUNDS WIZARD ==================== */}
      <div className="bg-white/85 rounded-[26px] p-4 sm:p-6 border-2 border-white shadow-lg space-y-5">
        {/* Step Progress Indicator Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-pink-200 pb-3.5">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-pink-600">
              💳 ADD FUNDS TO YOUR ACCOUNT WALLET
            </span>
            <h3 className="text-base sm:text-xl font-extrabold text-slate-900">
              {step === 1
                ? 'Step 1: Enter Amount & Select Payment Method'
                : 'Step 2: Send Payment, Enter Your Account Details & Upload SS'}
            </h3>
          </div>

          {/* Step Pills */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                onPlayPop(560);
                setStep(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
                step === 1
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm'
                  : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white/25 text-[10px] flex items-center justify-center">
                1
              </span>
              <span>Amount &amp; Method</span>
            </button>
            <i className="fa-solid fa-chevron-right text-[10px] text-slate-400"></i>
            <button
              type="button"
              onClick={handleProceedToStep2}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
                step === 2
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white/25 text-[10px] flex items-center justify-center">
                2
              </span>
              <span>Pay &amp; Submit SS</span>
            </button>
          </div>
        </div>

        {formError && (
          <div className="p-3 rounded-2xl bg-rose-100 border border-rose-300 text-rose-800 text-xs font-extrabold flex items-center gap-2">
            <i className="fa-solid fa-circle-exclamation text-rose-600"></i>
            <span>{formError}</span>
          </div>
        )}

        {justSubmitted && (
          <div className="p-4 rounded-2xl bg-emerald-100 border-2 border-emerald-400 text-emerald-900 text-xs sm:text-sm font-extrabold flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-base flex-shrink-0">
                <i className="fa-solid fa-check"></i>
              </span>
              <div>
                <div className="text-sm font-extrabold">Payment Proof Submitted Successfully! 🎉</div>
                <div className="text-[11px] font-semibold text-emerald-800">
                  Jaise hi Admin aapka screenshot verify karega, aapka balance foran update ho jayega!
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 1 ? (
          /* ==================== STEP 1: AMOUNT INPUT + PAYMENT METHOD SELECTOR + PAY BUTTON ==================== */
          <div className="space-y-5">
            {/* 1. Enter Amount Box */}
            <div className="space-y-2.5">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800">
                1. Enter Amount to Add (PKR — پاکستانی روپے):
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 font-display font-bold text-lg sm:text-2xl text-pink-600">
                  Rs.
                </span>
                <input
                  type="number"
                  min={100}
                  step={50}
                  value={amountInput}
                  onChange={(e) => {
                    setAmountInput(e.target.value);
                    setFormError(null);
                  }}
                  placeholder="1500"
                  className="w-full pl-14 pr-28 py-3.5 rounded-2xl bg-pink-50/70 border-2 border-pink-300 focus:border-pink-500 focus:bg-white outline-none font-display font-bold text-xl sm:text-3xl text-slate-900 shadow-inner"
                />
                <span className="absolute right-3.5 px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-[10px] border border-emerald-300">
                  0% Extra Fee
                </span>
              </div>

              {/* Quick Preset Amount Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-500 mr-1">
                  Quick Select:
                </span>
                {[350, 500, 1000, 1800, 2500, 5000, 10000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      onPlayPop(600);
                      setAmountInput(String(amt));
                      setFormError(null);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                      numericAmount === amt
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm scale-105'
                        : 'bg-white hover:bg-pink-50 text-slate-700 border border-pink-200'
                    }`}
                  >
                    Rs. {amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Choose Payment Method Grid (2-Column on Mobile & Desktop) */}
            <div className="space-y-2.5">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800">
                2. Select Payment Method (کس اکاؤنٹ میں پیسے بھیجنے ہیں؟):
              </label>
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                {activeDepositMethods.map((m) => {
                  const isSelected = selectedMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        onPlayPop(620);
                        setSelectedMethod(m.id);
                      }}
                      className={`p-3 sm:p-4 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between gap-2 ${
                        isSelected
                          ? 'bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 border-pink-500 shadow-md scale-[1.01]'
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div
                          className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${m.grad} text-white flex items-center justify-center shadow-md flex-shrink-0`}
                        >
                          {renderPaymentMethodIcon(m.id, 'w-4 h-4 sm:w-5 sm:h-5 text-white')}
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                            isSelected
                              ? 'bg-pink-600 text-white border-pink-600'
                              : m.badgeBg
                          }`}
                        >
                          {isSelected ? '✓ Selected' : m.shortTag}
                        </span>
                      </div>

                      <div>
                        <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                          {m.id}
                        </div>
                        <div className="text-[10px] sm:text-[11px] font-bold text-slate-600 truncate">
                          Title: {m.accountTitle}
                        </div>
                        <div className="text-[10px] font-mono-code font-extrabold text-pink-600 mt-0.5 truncate">
                          {m.accountNumber}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Pay Now Button */}
            <button
              type="button"
              onClick={handleProceedToStep2}
              className="sim-btn-glow w-full py-3.5 sm:py-4 px-5 font-display font-bold text-sm sm:text-base tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xl"
            >
              <i className="fa-solid fa-circle-dollar-to-slot text-amber-300 text-base sm:text-lg"></i>
              <span>
                PAY RS. {numericAmount.toLocaleString()} VIA {selectedMethod.toUpperCase()} →
              </span>
            </button>
          </div>
        ) : (
          /* ==================== STEP 2: RECEIVER ACCOUNT DETAILS + SENDER NAME/NUMBER + SCREENSHOT UPLOAD ==================== */
          <form onSubmit={handleFinalSubmit} className="space-y-4">
            {/* Receiver Account Box to Copy */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white border-2 border-emerald-400/50 shadow-lg space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/15 pb-2.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-9 h-9 rounded-xl bg-gradient-to-br ${activeMethodMeta.grad} text-white flex items-center justify-center shadow`}
                  >
                    {renderPaymentMethodIcon(activeMethodMeta.id, 'w-4 h-4 text-white')}
                  </span>
                  <div>
                    <div className="text-[10px] font-extrabold uppercase text-emerald-300">
                      SEND EXACT AMOUNT TO THIS {activeMethodMeta.id.toUpperCase()} ACCOUNT
                    </div>
                    <div className="text-sm sm:text-base font-extrabold text-white">
                      {activeMethodMeta.label}
                    </div>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-xl bg-white/15 border border-white/25 text-right">
                  <div className="text-[9px] font-bold uppercase text-pink-200">Amount to Send</div>
                  <div className="font-display font-bold text-base sm:text-lg text-amber-300">
                    Rs. {numericAmount.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-300 font-bold">Account Title (Name):</div>
                    <div className="text-sm font-extrabold text-white mt-0.5">
                      {activeMethodMeta.accountTitle}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/25 text-emerald-300 text-[10px] font-extrabold">
                    Verified ✓
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[10px] text-slate-300 font-bold">Account Number:</div>
                    <div className="text-sm sm:text-base font-mono-code font-extrabold text-amber-300 truncate mt-0.5">
                      {activeMethodMeta.accountNumber}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onCopyText(
                        activeMethodMeta.accountNumber.replace(/[^0-9a-zA-Z@.-]/g, '') ||
                          activeMethodMeta.accountNumber,
                        `${activeMethodMeta.id} Account (${activeMethodMeta.accountNumber}) Copied!`
                      )
                    }
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[11px] shadow cursor-pointer flex-shrink-0"
                  >
                    <i className="fa-regular fa-copy mr-1"></i>Copy
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-emerald-200 font-semibold flex items-center gap-1.5">
                <i className="fa-solid fa-circle-info text-amber-300"></i>
                <span>
                  {activeMethodMeta.extraInfo} — Amount: <strong>Rs. {numericAmount.toLocaleString()}</strong>
                </span>
              </div>
            </div>

            {/* Sender Account Name, Number & TRX ID Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-800 mb-1">
                  Your Account Holder Name (آپ کا اکاؤنٹ نام) *
                </label>
                <div className="sim-input-box !py-2 !px-3.5 !rounded-2xl">
                  <i className="fa-solid fa-user-check text-pink-500 text-xs mr-2"></i>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    required
                    placeholder="e.g. Ali Raza (Jis account se paise bheje)"
                    className="w-full bg-transparent border-none outline-none text-xs sm:text-sm font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-800 mb-1">
                  Your Account Number (جس نمبر سے پیسے بھیجے) *
                </label>
                <div className="sim-input-box !py-2 !px-3.5 !rounded-2xl">
                  <i className="fa-solid fa-phone text-emerald-600 text-xs mr-2"></i>
                  <input
                    type="text"
                    value={senderNumber}
                    onChange={(e) => setSenderNumber(e.target.value)}
                    required
                    placeholder="e.g. 0301-2345678"
                    className="w-full bg-transparent border-none outline-none font-mono-code text-xs sm:text-sm font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-800 mb-1">
                  Transaction ID / TID (Optional)
                </label>
                <div className="sim-input-box !py-2 !px-3.5 !rounded-2xl">
                  <i className="fa-solid fa-hashtag text-purple-600 text-xs mr-2"></i>
                  <input
                    type="text"
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    placeholder="e.g. TID 8492019482"
                    className="w-full bg-transparent border-none outline-none font-mono-code text-xs sm:text-sm font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-800 mb-1">
                  Order Note / Purpose (Optional)
                </label>
                <div className="sim-input-box !py-2 !px-3.5 !rounded-2xl">
                  <i className="fa-solid fa-comment-dots text-indigo-500 text-xs mr-2"></i>
                  <input
                    type="text"
                    value={userNote}
                    onChange={(e) => setUserNote(e.target.value)}
                    placeholder="e.g. Add to my Wallet Balance"
                    className="w-full bg-transparent border-none outline-none text-xs sm:text-sm font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Payment Screenshot (SS) Upload Box */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="block text-[11px] font-extrabold text-slate-800">
                  Upload Payment Screenshot (SS) — پیمنٹ کا اسکرین شاٹ لگائیں *
                </label>
                <button
                  type="button"
                  onClick={handleGenerateSampleSS}
                  className="px-2.5 py-1 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-800 border border-purple-300 text-[10px] font-extrabold transition cursor-pointer"
                >
                  <i className="fa-solid fa-wand-magic-sparkles mr-1"></i>Use Sample Receipt SS (Demo Test)
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {!screenshotDataUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-pink-400 hover:border-purple-600 bg-pink-50/50 hover:bg-pink-50 rounded-2xl p-5 text-center cursor-pointer transition space-y-2"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 text-white flex items-center justify-center mx-auto text-xl shadow-md">
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                  </div>
                  <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                    Click to Upload Payment Screenshot (SS)
                  </div>
                  <div className="text-[10px] font-semibold text-slate-600">
                    Supports JPG, PNG, WEBP Screenshot from EasyPaisa, JazzCash or Bank App
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-emerald-50/90 border-2 border-emerald-400 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={screenshotDataUrl}
                      alt="Payment Screenshot Preview"
                      className="w-16 h-20 object-cover rounded-xl border-2 border-white shadow-md bg-white flex-shrink-0"
                    />
                    <div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-extrabold">
                        <i className="fa-solid fa-check"></i> SCREENSHOT ATTACHED
                      </span>
                      <div className="text-xs font-extrabold text-slate-900 mt-1 truncate max-w-[200px] sm:max-w-xs">
                        {uploadFileName || 'Payment-Receipt-Screenshot.jpg'}
                      </div>
                      <div className="text-[10px] font-semibold text-emerald-800">
                        Ready to send to Admin for Rs. {numericAmount.toLocaleString()} balance approval
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-white text-slate-800 border border-slate-300 text-[11px] font-extrabold cursor-pointer"
                    >
                      Change SS
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setScreenshotDataUrl('');
                        setUploadFileName('');
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-100 text-rose-700 text-[11px] font-extrabold cursor-pointer"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Proof Button + Back Button */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs cursor-pointer"
              >
                ← Change Amount
              </button>
              <button
                type="submit"
                className="w-full flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-display font-bold text-xs sm:text-sm tracking-wider shadow-xl flex items-center justify-center gap-2 transition hover:scale-[1.01] cursor-pointer"
              >
                <i className="fa-solid fa-paper-plane"></i>
                <span>
                  SUBMIT PAYMENT PROOF &amp; SCREENSHOT (RS. {numericAmount.toLocaleString()})
                </span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ==================== USER'S SUBMITTED PAYMENT PROOFS & APPROVAL STATUS HISTORY ==================== */}
      {!compactMode && (
        <div className="bg-white/85 rounded-[26px] p-4 sm:p-5 border-2 border-white shadow-md space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-pink-100 pb-2.5">
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-900">
                <i className="fa-solid fa-receipt text-pink-500 mr-1.5"></i>Your Payment Proofs &amp; Balance History ({paymentProofs.length})
              </h4>
              <p className="text-[10px] font-semibold text-slate-600">
                Admin (`/saqibadmb`) se approve hote hi status &ldquo;Approved&rdquo; ho jata hai aur रकम aapke Wallet Balance mein jama ho jati hai.
              </p>
            </div>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {paymentProofs.map((req) => (
              <div
                key={req.id}
                className="p-3 rounded-2xl bg-white border border-pink-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={req.screenshotUrl}
                    alt={req.senderAccountName}
                    onClick={() => onPreviewScreenshot(req)}
                    title="Click to view uploaded payment screenshot"
                    className="w-12 h-14 object-cover rounded-xl border border-pink-200 shadow-xs cursor-pointer hover:scale-105 transition flex-shrink-0 bg-slate-100"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-display font-bold text-sm sm:text-base text-slate-900">
                        Rs. {req.amount.toLocaleString()}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-extrabold border border-indigo-200">
                        {req.method}
                      </span>
                      <span className="text-[10px] font-mono-code font-bold text-slate-500">
                        #{req.id}
                      </span>
                    </div>
                    <div className="text-[11px] font-bold text-slate-800 truncate mt-0.5">
                      Account Name: <span className="text-pink-700">{req.senderAccountName}</span> •{' '}
                      <span className="font-mono-code">{req.senderAccountNumber}</span>
                    </div>
                    <div className="text-[10px] font-semibold text-slate-500">
                      TRX: {req.trxId} • Submitted: {req.createdAt}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => onPreviewScreenshot(req)}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-extrabold cursor-pointer"
                  >
                    <i className="fa-solid fa-image mr-1"></i>View SS
                  </button>

                  {req.status === 'pending' && (
                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-extrabold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                      <span>Pending Admin Approval</span>
                    </span>
                  )}
                  {req.status === 'approved' && (
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-extrabold flex items-center gap-1">
                      <i className="fa-solid fa-circle-check text-emerald-600"></i>
                      <span>Approved (+Rs. {req.amount.toLocaleString()})</span>
                    </span>
                  )}
                  {req.status === 'rejected' && (
                    <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-extrabold flex items-center gap-1">
                      <i className="fa-solid fa-circle-xmark text-rose-600"></i>
                      <span>Rejected</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface AdminPaymentStudioProps {
  walletBalance: number;
  paymentProofs: PaymentProofRequest[];
  onApproveProof: (id: string) => void;
  onRejectProof: (id: string) => void;
  onDeleteProof: (id: string) => void;
  onSetCustomBalance: (newBalance: number) => void;
  onPreviewScreenshot: (proof: PaymentProofRequest) => void;
  onCopyText: (text: string, label: string) => void;
}

export const AdminPaymentApprovalStudio: React.FC<AdminPaymentStudioProps> = ({
  walletBalance,
  paymentProofs,
  onApproveProof,
  onRejectProof,
  onDeleteProof,
  onSetCustomBalance,
  onPreviewScreenshot,
  onCopyText
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [manualBalanceInput, setManualBalanceInput] = useState<string>(String(walletBalance));

  const pendingProofs = paymentProofs.filter((p) => p.status === 'pending');
  const approvedProofs = paymentProofs.filter((p) => p.status === 'approved');

  const filteredList = paymentProofs.filter((item) =>
    statusFilter === 'all' ? true : item.status === statusFilter
  );

  return (
    <div className="space-y-6">
      {/* ==================== TOP ADMIN WALLET & MANUAL BALANCE CONTROLLER ==================== */}
      <div className="acrylic-frame rounded-[32px] p-3 sm:p-4">
        <div className="plush-pillow plush-sim-search rounded-[24px] p-4 sm:p-6 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-pink-200 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold border border-emerald-300">
                <i className="fa-solid fa-money-check-dollar"></i> ADMIN PAYMENT PROOF &amp; USER BALANCE CONTROL
              </div>
              <h3 className="text-lg sm:text-2xl font-extrabold text-slate-900 mt-1">
                Verify User Payment Screenshots &amp; Approve Wallet Balance 💰
              </h3>
              <p className="text-xs font-semibold text-slate-700">
                Jab user apna EasyPaisa / JazzCash Account Name, Number aur Screenshot submit kare, yahan se 1-Click mein <strong>Approve</strong> karein — रकम foran User ke Live Balance mein show ho jayegi!
              </p>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-3 gap-2 flex-shrink-0">
              <div className="p-3 rounded-2xl bg-white border border-emerald-200 text-center shadow-xs">
                <div className="text-[9px] font-extrabold uppercase text-slate-500">User Live Balance</div>
                <div className="font-display font-bold text-base sm:text-xl text-emerald-600 mt-0.5">
                  Rs. {walletBalance.toLocaleString()}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-center shadow-xs">
                <div className="text-[9px] font-extrabold uppercase text-amber-800">Pending Proofs</div>
                <div className="font-display font-bold text-base sm:text-xl text-amber-600 mt-0.5">
                  {pendingProofs.length}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-center shadow-xs">
                <div className="text-[9px] font-extrabold uppercase text-indigo-800">Approved</div>
                <div className="font-display font-bold text-base sm:text-xl text-indigo-600 mt-0.5">
                  {approvedProofs.length}
                </div>
              </div>
            </div>
          </div>

          {/* Direct Admin Balance Override Bar */}
          <div className="bg-white/90 rounded-2xl p-3.5 border border-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <i className="fa-solid fa-sliders text-pink-600"></i>
                <span>Direct User Balance Control (Manual Credit / Edit Balance)</span>
              </div>
              <div className="text-[11px] font-medium text-slate-600">
                Aap yahan se direct bhi user ka Wallet Balance set ya +Add kar sakte hain:
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-pink-50 border border-pink-300 rounded-xl px-3 py-1.5">
                <span className="text-xs font-extrabold text-pink-600 mr-1.5">Rs.</span>
                <input
                  type="number"
                  min={0}
                  value={manualBalanceInput}
                  onChange={(e) => setManualBalanceInput(e.target.value)}
                  className="w-24 bg-transparent border-none outline-none font-display font-bold text-sm text-slate-900"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  const val = Math.max(0, Number(manualBalanceInput) || 0);
                  onSetCustomBalance(val);
                }}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold text-xs shadow cursor-pointer"
              >
                Set Exact Balance
              </button>
              <button
                type="button"
                onClick={() => {
                  const next = walletBalance + 1000;
                  setManualBalanceInput(String(next));
                  onSetCustomBalance(next);
                }}
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow cursor-pointer"
              >
                +Rs. 1,000
              </button>
              <button
                type="button"
                onClick={() => {
                  setManualBalanceInput('0');
                  onSetCustomBalance(0);
                }}
                className="px-3 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 font-extrabold text-xs cursor-pointer"
              >
                Reset 0
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== SUBMITTED PAYMENT PROOFS QUEUE ==================== */}
      <div className="acrylic-frame rounded-[32px] p-3 sm:p-4">
        <div className="plush-pillow plush-about rounded-[24px] p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-pink-200 pb-3">
            <div>
              <h4 className="text-base sm:text-xl font-extrabold text-slate-900">
                Submitted Payment Proofs &amp; Screenshots ({filteredList.length})
              </h4>
              <p className="text-[11px] font-semibold text-slate-600">
                Click on any Screenshot (SS) to zoom full-screen, then click <strong>Approve &amp; Add Balance</strong>.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all' as const, label: `All (${paymentProofs.length})` },
                { id: 'pending' as const, label: `⏳ Pending (${pendingProofs.length})` },
                { id: 'approved' as const, label: `✅ Approved (${approvedProofs.length})` },
                { id: 'rejected' as const, label: '❌ Rejected' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                    statusFilter === tab.id
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm'
                      : 'bg-white/85 hover:bg-white text-slate-700 border border-pink-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {filteredList.length === 0 ? (
            <div className="p-8 text-center bg-white/80 rounded-2xl border border-white space-y-2">
              <div className="text-2xl">🧾</div>
              <div className="text-sm font-extrabold text-slate-900">No Payment Proofs in this filter</div>
              <div className="text-xs font-medium text-slate-600">
                Jab user &ldquo;Add Funds&rdquo; se payment proof submit karega to wo yahan show hoga.
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredList.map((proof) => (
                <div
                  key={proof.id}
                  className={`rounded-2xl p-4 bg-white border-2 shadow-md flex flex-col justify-between space-y-3.5 transition ${
                    proof.status === 'pending'
                      ? 'border-amber-400'
                      : proof.status === 'approved'
                      ? 'border-emerald-400'
                      : 'border-rose-300 opacity-85'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Clickable Screenshot Thumbnail */}
                      <div
                        onClick={() => onPreviewScreenshot(proof)}
                        className="relative group w-20 h-24 rounded-xl overflow-hidden border-2 border-pink-300 shadow-md cursor-pointer flex-shrink-0 bg-slate-100"
                        title="Click to inspect full Screenshot (SS)"
                      >
                        <img
                          src={proof.screenshotUrl}
                          alt="Payment SS"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-extrabold">
                          <i className="fa-solid fa-magnifying-glass-plus mr-1"></i>Zoom
                        </div>
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white font-mono-code text-[10px] font-extrabold">
                            #{proof.id}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-extrabold">
                            {proof.method}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">{proof.createdAt}</span>
                        </div>

                        <div className="font-display font-bold text-2xl text-emerald-600">
                          Rs. {proof.amount.toLocaleString()}
                        </div>

                        <div className="text-xs font-extrabold text-slate-900 truncate">
                          <i className="fa-solid fa-user text-pink-500 mr-1"></i>
                          Sender: {proof.senderAccountName}
                        </div>
                        <div className="text-xs font-mono-code font-bold text-slate-700 flex items-center gap-1.5">
                          <i className="fa-solid fa-phone text-emerald-600"></i>
                          <span>{proof.senderAccountNumber}</span>
                          <button
                            type="button"
                            onClick={() =>
                              onCopyText(proof.senderAccountNumber, 'Sender number copied!')
                            }
                            className="text-slate-400 hover:text-pink-600 cursor-pointer"
                          >
                            <i className="fa-regular fa-copy text-[10px]"></i>
                          </button>
                        </div>
                        <div className="text-[11px] font-mono-code font-bold text-purple-700">
                          TRX / TID: #{proof.trxId}
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {proof.status === 'pending' && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-extrabold whitespace-nowrap">
                          ⏳ Pending
                        </span>
                      )}
                      {proof.status === 'approved' && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-extrabold whitespace-nowrap">
                          ✅ Approved
                        </span>
                      )}
                      {proof.status === 'rejected' && (
                        <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-extrabold whitespace-nowrap">
                          ❌ Rejected
                        </span>
                      )}
                    </div>
                  </div>

                  {proof.userNote && (
                    <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-700">
                      Note: &ldquo;{proof.userNote}&rdquo;
                    </div>
                  )}

                  {/* Admin Action Buttons */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onPreviewScreenshot(proof)}
                      className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-extrabold cursor-pointer"
                    >
                      <i className="fa-solid fa-expand mr-1"></i>View Full SS
                    </button>

                    <div className="flex items-center gap-1.5">
                      {proof.status !== 'approved' && (
                        <button
                          type="button"
                          onClick={() => onApproveProof(proof.id)}
                          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs shadow-md hover:scale-105 transition cursor-pointer flex items-center gap-1"
                        >
                          <i className="fa-solid fa-check-double"></i>
                          <span>Approve (+Rs. {proof.amount.toLocaleString()})</span>
                        </button>
                      )}

                      {proof.status !== 'rejected' && (
                        <button
                          type="button"
                          onClick={() => onRejectProof(proof.id)}
                          className="px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold text-xs cursor-pointer"
                        >
                          Reject
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onDeleteProof(proof.id)}
                        title="Delete Proof"
                        className="px-2.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-extrabold cursor-pointer"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
