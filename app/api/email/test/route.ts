import { NextResponse } from 'next/server';
import { sendContactInquiryEmail } from '@/src/lib/emailService';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const testEmail = body.email || 'saqib242saqib@gmail.com';

    const result = await sendContactInquiryEmail({
      name: 'EmailJS Test System',
      phone: '+92 347 8936242',
      email: testEmail,
      department: 'System Test',
      message: 'Hello Muhammad Saqib! This is a test email from your Saqib Visuals Hub platform confirming EmailJS is active and working properly.',
      ticketId: 'TEST-EMAIL',
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully to your inbox via EmailJS!',
      });
    }

    return NextResponse.json({
      success: false,
      error: result.error || 'Failed to send email. Please check your EmailJS Service ID, Template ID & Public Key.',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
