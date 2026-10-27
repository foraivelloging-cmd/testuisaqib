/**
 * EmailJS Notification Service
 * Sends instant email alerts for Contact inquiries, New Orders, and Payment Proofs.
 * Supports both Client-Side (@emailjs/browser) and Server-Side (REST API) execution.
 */

export interface EmailContactParams {
  name: string;
  phone: string;
  email?: string;
  department?: string;
  message: string;
  ticketId?: string;
}

export interface EmailOtpParams {
  toEmail: string;
  passcode: string;
  time?: string;
  purpose?: 'signup' | 'forgot_password';
  name?: string;
}

export interface EmailOrderParams {
  orderId: string;
  userId: string;
  serviceTitle: string;
  packageTier: string;
  price: number;
  userInput?: string;
  customerEmail?: string;
}

export interface EmailPaymentParams {
  proofId: string;
  userId: string;
  amount: number;
  method: string;
  senderName: string;
  senderNumber: string;
  trxId: string;
  userNote?: string;
}

function getEmailCredentials() {
  const serviceId =
    process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ||
    process.env.EMAILJS_SERVICE_ID ||
    '';
  const templateId =
    process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ||
    process.env.EMAILJS_TEMPLATE_ID ||
    '';
  const publicKey =
    process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ||
    process.env.EMAILJS_PUBLIC_KEY ||
    process.env.EMAILJS_USER_ID ||
    '';
  const privateKey =
    process.env.EMAILJS_PRIVATE_KEY ||
    process.env.EMAILJS_ACCESS_TOKEN ||
    '';
  const adminEmail =
    process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
    process.env.ADMIN_EMAIL ||
    'saqib242saqib@gmail.com';

  return { serviceId, templateId, publicKey, privateKey, adminEmail };
}

/**
 * Universal sender using @emailjs/browser (Client) and REST API (Server)
 */
async function sendEmailViaRest(templateParams: Record<string, any>): Promise<{ success: boolean; error?: string }> {
  const { serviceId, templateId, publicKey, privateKey } = getEmailCredentials();

  if (!serviceId || !templateId || !publicKey) {
    console.warn('[EmailJS] Keys not fully configured in environment (SERVICE_ID, TEMPLATE_ID, PUBLIC_KEY). Skipping.');
    return { success: false, error: 'EmailJS credentials not configured' };
  }

  // 1. Client-Side Browser Execution via official SDK
  if (typeof window !== 'undefined') {
    try {
      const emailjs = (await import('@emailjs/browser')).default;
      await emailjs.send(serviceId, templateId, templateParams, publicKey);
      return { success: true };
    } catch (browserErr: any) {
      console.warn('[EmailJS] Browser SDK fallback to REST:', browserErr);
    }
  }

  // 2. Server-Side Execution via REST API
  try {
    const payload: Record<string, any> = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: templateParams,
    };

    if (privateKey) {
      payload.accessToken = privateKey;
    }

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://saqibvisuals.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return { success: true };
    }

    const text = await response.text();
    console.error('[EmailJS] API error response:', text);
    return { success: false, error: text };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network error';
    console.error('[EmailJS] Exception:', msg);
    return { success: false, error: msg };
  }
}

/**
 * Send Contact Support Inquiry to Admin
 */
export async function sendContactInquiryEmail(data: EmailContactParams) {
  const { adminEmail } = getEmailCredentials();
  return sendEmailViaRest({
    to_name: 'Muhammad Saqib',
    to_email: adminEmail,
    from_name: data.name || 'Client Inquiry',
    from_email: data.email || 'noreply@saqibvisuals.com',
    phone: data.phone || 'N/A',
    department: data.department || 'General Support',
    subject: `📩 New Ticket [${data.ticketId || 'CONTACT'}]: ${data.name}`,
    message: data.message,
    ticket_id: data.ticketId || '',
    date: new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' }),
  });
}

/**
 * Send New Service Order Notification to Admin
 */
export async function sendOrderNotificationEmail(data: EmailOrderParams) {
  const { adminEmail } = getEmailCredentials();
  return sendEmailViaRest({
    to_name: 'Muhammad Saqib',
    to_email: adminEmail,
    from_name: data.userId,
    from_email: data.customerEmail || 'orders@saqibvisuals.com',
    subject: `🛍️ New Order [${data.orderId}]: ${data.serviceTitle} (Rs. ${data.price})`,
    order_id: data.orderId,
    service_title: data.serviceTitle,
    package_tier: data.packageTier,
    price: `Rs. ${data.price.toLocaleString()}`,
    user_id: data.userId,
    user_input: data.userInput || 'None',
    message: `New purchase by ${data.userId} for ${data.serviceTitle} (${data.packageTier}). Amount: Rs. ${data.price}`,
    date: new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' }),
  });
}

/**
 * Send Wallet Deposit / Payment Proof Notification to Admin
 */
export async function sendPaymentProofEmail(data: EmailPaymentParams) {
  const { adminEmail } = getEmailCredentials();
  return sendEmailViaRest({
    to_name: 'Muhammad Saqib',
    to_email: adminEmail,
    from_name: data.senderName,
    subject: `💰 New Deposit Proof [${data.proofId}]: Rs. ${data.amount} via ${data.method}`,
    proof_id: data.proofId,
    user_id: data.userId,
    amount: `Rs. ${data.amount.toLocaleString()}`,
    method: data.method,
    sender_name: data.senderName,
    sender_number: data.senderNumber,
    trx_id: data.trxId,
    user_note: data.userNote || 'Wallet Top-Up',
    message: `Customer ${data.senderName} (${data.senderNumber}) submitted deposit proof of Rs. ${data.amount} via ${data.method}. Trx ID: ${data.trxId}`,
    date: new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' }),
  });
}

/**
 * Send 6-Digit VIP OTP Security Verification Code
 */
export async function sendOtpEmail(data: EmailOtpParams) {
  const isForgot = data.purpose === 'forgot_password';
  const subject = isForgot
    ? `🔐 Reset Your VIP Password - Verification Code: ${data.passcode}`
    : `🚀 Verify Your VIP Account - Code: ${data.passcode}`;

  return sendEmailViaRest({
    to_name: data.name || 'VIP Member',
    to_email: data.toEmail,
    email: data.toEmail,
    user_email: data.toEmail,
    recipient: data.toEmail,
    reply_to: data.toEmail,
    to: data.toEmail,
    send_to: data.toEmail,
    from_name: 'Saqib Visuals Hub VIP Security',
    from_email: 'foraivelloging@gmail.com',
    passcode: data.passcode,
    time: data.time || '15 minutes',
    subject: subject,
    message: isForgot
      ? `Your VIP Password Reset code is ${data.passcode}. This code is valid for ${data.time || '15 minutes'}. If you did not request this, please disregard.`
      : `Welcome to Saqib Visuals Hub! Your VIP account registration verification code is ${data.passcode}. Valid for ${data.time || '15 minutes'}.`,
    date: new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' }),
  });
}
