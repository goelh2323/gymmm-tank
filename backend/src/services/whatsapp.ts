import fs from 'fs';
import path from 'path';

const logFilePath = path.resolve(process.cwd(), 'whatsapp_outbox.log');

// Helper to format currency
const formatINR = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

// Append to local outbox simulation file
const appendToOutboxLog = (to: string, message: string) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] TO: ${to}\nMESSAGE:\n${message}\n----------------------------------------\n`;
  try {
    fs.appendFileSync(logFilePath, logEntry, 'utf8');
  } catch (err) {
    console.error('❌ Failed to write to whatsapp_outbox.log:', err);
  }
};

// Main WhatsApp send function
export const sendWhatsAppMessage = async (to: string, body: string): Promise<boolean> => {
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_FROM_NUMBER;

  const ultramsgInstance = process.env.ULTRAMSG_INSTANCE_ID;
  const ultramsgToken = process.env.ULTRAMSG_TOKEN;

  // Format recipient number (ensure it has country code, Twilio likes '+' prefix or whatsapp: prefix)
  let formattedTo = to.trim();
  // Ensure no spaces/dashes
  formattedTo = formattedTo.replace(/[\s\-()]/g, '');
  if (!formattedTo.startsWith('+')) {
    // default to Indian country code if 10 digit number
    if (formattedTo.length === 10) {
      formattedTo = '+91' + formattedTo;
    } else if (formattedTo.startsWith('91') && formattedTo.length === 12) {
      formattedTo = '+' + formattedTo;
    }
  }

  // 1. Try Twilio if credentials are provided
  if (twilioSid && twilioToken && twilioFrom) {
    try {
      console.log(`📱 Sending WhatsApp via Twilio to ${formattedTo}...`);
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const fromNumber = twilioFrom.startsWith('whatsapp:') ? twilioFrom : `whatsapp:${twilioFrom}`;
      const toNumber = formattedTo.startsWith('whatsapp:') ? formattedTo : `whatsapp:${formattedTo}`;

      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: fromNumber,
          To: toNumber,
          Body: body,
        }),
      });

      const data = await response.json() as any;
      if (response.ok) {
        console.log(`✅ WhatsApp sent via Twilio successfully. SID: ${data.sid}`);
        return true;
      } else {
        console.error(`❌ Twilio WhatsApp send failed:`, data);
      }
    } catch (err: any) {
      console.error(`❌ Twilio WhatsApp API Error:`, err.message);
    }
  }

  // 2. Try UltraMsg if credentials are provided
  if (ultramsgInstance && ultramsgToken) {
    try {
      console.log(`📱 Sending WhatsApp via UltraMsg to ${formattedTo}...`);
      // UltraMsg expects clean number without '+' prefix
      const cleanTo = formattedTo.replace('+', '');
      
      const response = await fetch(`https://api.ultramsg.com/${ultramsgInstance}/messages/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: ultramsgToken,
          to: cleanTo,
          body: body,
        }),
      });

      const data = await response.json() as any;
      if (response.ok && data.sent === 'true') {
        console.log(`✅ WhatsApp sent via UltraMsg successfully. ID: ${data.id}`);
        return true;
      } else {
        console.error(`❌ UltraMsg WhatsApp send failed:`, data);
      }
    } catch (err: any) {
      console.error(`❌ UltraMsg WhatsApp API Error:`, err.message);
    }
  }

  // 3. Fallback: Simulator mode (Dev)
  console.log(`\n========================================`);
  console.log(`[SIMULATED WHATSAPP OUTBOX]`);
  console.log(`TO: ${formattedTo}`);
  console.log(`MESSAGE:\n${body}`);
  console.log(`========================================\n`);

  appendToOutboxLog(formattedTo, body);
  return true;
};

// Dispatch Order Confirmation
export const sendOrderConfirmationWhatsApp = async (order: any) => {
  const orderIdShort = order.id.slice(0, 8).toUpperCase();
  const message = `🏋️ *POWER TANK NUTRITION - ORDER CONFIRMED* 🏋️\n\n` +
    `Hey ${order.customerName}! Your order has been locked in and is currently being prepped for shipment.\n\n` +
    `📦 *Order ID:* #${orderIdShort}\n` +
    `💵 *Total Amount:* ${formatINR(order.total)}\n` +
    `🚚 *Delivery Address:* ${order.address}, ${order.city} - ${order.pincode}\n\n` +
    `Thank you for choosing Power Tank Nutrition. Time to unleash your ultimate power potential! 💪`;

  return sendWhatsAppMessage(order.customerPhone, message).catch((err) => {
    console.error(`❌ Failed to dispatch Order Confirmation WhatsApp for order #${order.id}:`, err);
  });
};

// Dispatch Order Status Update
export const sendOrderStatusWhatsApp = async (order: any, status: 'SHIPPED' | 'DELIVERED' | 'CANCELLED') => {
  const orderIdShort = order.id.slice(0, 8).toUpperCase();
  let message = '';

  if (status === 'SHIPPED') {
    message = `🚀 *POWER TANK NUTRITION - ORDER SHIPPED* 🚀\n\n` +
      `Hey ${order.customerName}! Your Power Tank Nutrition fuel has been loaded and dispatched. Your package is officially on its way!\n\n` +
      `📦 *Order ID:* #${orderIdShort}\n` +
      `🚚 *Delivery Address:* ${order.address}, ${order.city}\n` +
      `📅 *Estimated Delivery:* 3 - 5 Days\n\n` +
      `Get ready to crush your goals! 🏋️`;
  } else if (status === 'DELIVERED') {
    message = `📦 *POWER TANK NUTRITION - ORDER DELIVERED* 📦\n\n` +
      `Hey ${order.customerName}! Your order #${orderIdShort} has been successfully delivered!\n\n` +
      `📸 *Share Your Gains:* Snap a photo, tag @powertanknutrition on Instagram with #POWERTANKNUTRITION to earn exclusive rewards!\n\n` +
      `Time to fuel up and crush those training sessions! 💪🏋️`;
  } else if (status === 'CANCELLED') {
    message = `❌ *POWER TANK NUTRITION - ORDER CANCELLED* ❌\n\n` +
      `Hey ${order.customerName}! Your order #${orderIdShort} has been cancelled. Any loyalty coins used or earned have been adjusted.\n\n` +
      `If you have questions, contact us at support@powertanknutrition.com.`;
  } else {
    return;
  }

  return sendWhatsAppMessage(order.customerPhone, message).catch((err) => {
    console.error(`❌ Failed to dispatch Order Status WhatsApp for order #${order.id} (Status: ${status}):`, err);
  });
};
