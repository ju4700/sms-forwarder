// This is a reference API route implementation for server-side use
// It's not used in the mobile app build, only for web/server deployments
// To use this, install @supabase/supabase-js: npm install @supabase/supabase-js

let supabaseClient: any = null;
try {
  const { createClient } = require('@supabase/supabase-js');
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseUrl && supabaseServiceKey) {
    supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
  }
} catch {
  // Supabase not installed or configured - this is optional
  console.warn('Supabase client not available. This API route requires @supabase/supabase-js.');
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: Request) {
  if (!supabaseClient) {
    return new Response(
      JSON.stringify({ error: 'Supabase client not configured. Install @supabase/supabase-js and configure environment variables.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const supabase = supabaseClient;

    const body = await request.json();
    const { sender, content, receivedAt, referenceId } = body;

    if (!sender || !content) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: sender and content' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Extract payment information from SMS content
    const paymentInfo = extractPaymentInfo(content, referenceId);

    let paymentId = null;

    // If we found a reference ID, create or update payment record
    if (paymentInfo.referenceId) {
      const { data: existingPayment } = await supabase
        .from('payments')
        .select('id')
        .eq('reference_id', paymentInfo.referenceId)
        .maybeSingle();

      if (existingPayment) {
        // Update existing payment
        const { data: updatedPayment } = await supabase
          .from('payments')
          .update({
            status: 'received',
            sms_content: content,
            amount: paymentInfo.amount,
            sender: paymentInfo.sender || sender,
          })
          .eq('id', existingPayment.id)
          .select()
          .single();

        paymentId = updatedPayment?.id;
      } else {
        // Create new payment record
        const { data: newPayment } = await supabase
          .from('payments')
          .insert({
            reference_id: paymentInfo.referenceId,
            amount: paymentInfo.amount,
            sender: paymentInfo.sender || sender,
            status: 'received',
            sms_content: content,
          })
          .select()
          .single();

        paymentId = newPayment?.id;
      }
    }

    // Log the SMS
    const { data: smsLog } = await supabase
      .from('sms_logs')
      .insert({
        sender,
        content,
        received_at: receivedAt || new Date().toISOString(),
        payment_id: paymentId,
        forwarded: true,
      })
      .select()
      .single();

    return Response.json({
      success: true,
      paymentId,
      smsLogId: smsLog?.id,
      message: 'SMS forwarded successfully',
    });
  } catch (error) {
    console.error('Error processing SMS:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to process SMS',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

function extractPaymentInfo(content: string, providedReferenceId?: string) {
  const info: {
    referenceId: string | null;
    amount: number | null;
    sender: string | null;
  } = {
    referenceId: providedReferenceId || null,
    amount: null,
    sender: null,
  };

  // Try to extract reference ID if not provided
  // Common bKash formats: TrxID XXXXXXXXX or Reference: XXXXXXXXX
  if (!info.referenceId) {
    const refPatterns = [
      /TrxID[:\s]+([A-Z0-9]+)/i,
      /Reference[:\s]+([A-Z0-9]+)/i,
      /Ref[:\s]+([A-Z0-9]+)/i,
      /Transaction[:\s]+([A-Z0-9]+)/i,
    ];

    for (const pattern of refPatterns) {
      const match = content.match(pattern);
      if (match) {
        info.referenceId = match[1];
        break;
      }
    }
  }

  // Extract amount
  // Common formats: BDT 1000, Tk 1000, 1000 Taka
  const amountPatterns = [
    /(?:BDT|Tk|Taka)[:\s]+([0-9,]+(?:\.[0-9]{2})?)/i,
    /([0-9,]+(?:\.[0-9]{2})?)[:\s]+(?:BDT|Tk|Taka)/i,
  ];

  for (const pattern of amountPatterns) {
    const match = content.match(pattern);
    if (match) {
      const amountStr = match[1].replace(/,/g, '');
      info.amount = parseFloat(amountStr);
      break;
    }
  }

  // Extract sender phone number
  // Common formats: from 01XXXXXXXXX
  const senderPattern = /from[:\s]+(\+?880?1[0-9]{9})/i;
  const match = content.match(senderPattern);
  if (match) {
    info.sender = match[1];
  }

  return info;
}

export async function GET(request: Request) {
  return Response.json({
    status: 'SMS Forwarder API is running',
    endpoint: '/api/sms/forward',
    method: 'POST',
    requiredFields: ['sender', 'content'],
    optionalFields: ['receivedAt', 'referenceId'],
  });
}
