import { env } from '~/env';

/**
 * Extract email address from EMAIL_FROM string
 * Handles formats like: "Name <email@domain.com>" or "email@domain.com"
 */
function extractEmailAddress(fromString: string): string {
  const angleBracketMatch = /<([^>]+)>/.exec(fromString);
  const match = angleBracketMatch || /([\w\.-]+@[\w\.-]+\.\w+)/.exec(fromString);
  return match?.[1] ?? fromString;
}

export interface EmailData {
  to: string;
  name: string;
  ticketType: string;
  quantity: number;
  totalPrice: number;
  deliveryMethod: string;
  pickupCode?: string;
  address?: {
    street: string;
    postal: number;
    city: string;
    country: string;
  };
}

export interface ShippingNotificationData {
  to: string;
  name: string;
  code: string;
  address: {
    street: string;
    postal: number;
    city: string;
    country: string;
  };
}

export interface PickupNotificationData {
  to: string;
  name: string;
  code: string;
}

export async function sendConfirmationEmail(data: EmailData): Promise<void> {
  const { to, name, ticketType, quantity, totalPrice, deliveryMethod, pickupCode, address } = data;

  let subject: string;
  let htmlContent: string;

  if (deliveryMethod.toLowerCase().includes('versand') || deliveryMethod.toLowerCase().includes('shipping')) {
    // Shipping confirmation email
    subject = `HTL Ball 2026 - Bestätigung Ihrer Ticket-Bestellung (Versand)`;
    const baseUrl = env.NEXTAUTH_URL || 'http://localhost:3000';
    console.log(`[Email] Using baseUrl for shipping confirmation: ${baseUrl}`);
    htmlContent = generateShippingEmailHTML({
      name,
      ticketType,
      quantity,
      totalPrice,
      address: address!,
      baseUrl,
    });
  } else {
    // Self-pickup confirmation email
    subject = `HTL Ball 2026 - Bestätigung Ihrer Ticket-Bestellung (Abholung)`;
    const baseUrl = env.NEXTAUTH_URL || 'http://localhost:3000';
    console.log(`[Email] Using baseUrl for pickup email: ${baseUrl}`);
    htmlContent = generatePickupEmailHTML({
      name,
      ticketType,
      quantity,
      totalPrice,
      pickupCode: pickupCode!,
      baseUrl,
    });
  }

  try {
    if (!env.EMAIL_FROM) {
      throw new Error('EMAIL_FROM is not configured');
    }
    // Dynamic import to avoid loading graphClient during build
    const { getGraphClient } = await import('./graphClient');
    const graphClient = await getGraphClient();
    const fromEmail = extractEmailAddress(env.EMAIL_FROM);

    await graphClient.api(`/users/${fromEmail}/sendMail`).post({
      message: {
        subject,
        body: {
          contentType: 'HTML',
          content: htmlContent,
        },
        toRecipients: [
          {
            emailAddress: {
              address: to,
            },
          },
        ],
      },
    });

    console.log(`Confirmation email sent to ${to}`);
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    throw new Error('Failed to send confirmation email');
  }
}

export async function sendShippingNotificationEmail(data: ShippingNotificationData): Promise<void> {
  const { to, name, code, address } = data;

  const subject = `HTL Ball 2026 - Ihre Tickets sind unterwegs!`;
  const baseUrl = env.NEXTAUTH_URL || 'http://localhost:3000';
  console.log(`[Email] Using baseUrl for shipping notification: ${baseUrl}`);
  const htmlContent = generateShippingNotificationHTML({ name, code, address, baseUrl });

  try {
    if (!env.EMAIL_FROM) {
      throw new Error('EMAIL_FROM is not configured');
    }
    // Dynamic import to avoid loading graphClient during build
    const { getGraphClient } = await import('./graphClient');
    const graphClient = await getGraphClient();
    const fromEmail = extractEmailAddress(env.EMAIL_FROM);

    await graphClient.api(`/users/${fromEmail}/sendMail`).post({
      message: {
        subject,
        body: {
          contentType: 'HTML',
          content: htmlContent,
        },
        toRecipients: [
          {
            emailAddress: {
              address: to,
            },
          },
        ],
      },
    });

    console.log(`Shipping notification email sent to ${to}`);
  } catch (error) {
    console.error('Error sending shipping notification email:', error);
    throw new Error('Failed to send shipping notification email');
  }
}

export async function sendPickupNotificationEmail(data: PickupNotificationData): Promise<void> {
  const { to, name, code } = data;

  const subject = `HTL Ball 2026 - Ihre Tickets wurden abgeholt!`;
  const htmlContent = generatePickupNotificationHTML({ name, code });

  try {
    if (!env.EMAIL_FROM) {
      throw new Error('EMAIL_FROM is not configured');
    }
    // Dynamic import to avoid loading graphClient during build
    const { getGraphClient } = await import('./graphClient');
    const graphClient = await getGraphClient();
    const fromEmail = extractEmailAddress(env.EMAIL_FROM);

    await graphClient.api(`/users/${fromEmail}/sendMail`).post({
      message: {
        subject,
        body: {
          contentType: 'HTML',
          content: htmlContent,
        },
        toRecipients: [
          {
            emailAddress: {
              address: to,
            },
          },
        ],
      },
    });

    console.log(`Pickup notification email sent to ${to}`);
  } catch (error) {
    console.error('Error sending pickup notification email:', error);
    throw new Error('Failed to send pickup notification email');
  }
}

export function generateShippingEmailHTML(data: {
  name: string;
  ticketType: string;
  quantity: number;
  totalPrice: number;
  address: {
    street: string;
    postal: number;
    city: string;
    country: string;
  };
  baseUrl?: string;
}): string {
  const baseUrl = data.baseUrl || (typeof process !== 'undefined' && process.env?.NEXTAUTH_URL) || 'http://localhost:3000';
  const logoUrl = `${baseUrl}/logos/HTL-Ball-2026_Logo_Farbe_transparent.png`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>HTL Ball 2026 - Ticket Bestätigung</title>
    </head>
    <body>
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 15px; background-color: #f8f6f3;">
        <div style="color: #c17a3a; padding: 15px; margin-bottom: 15px; text-align: center;">
          <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
            <tr>
              <td style="vertical-align: middle; text-align: center; padding-right: 20px;">
                <img src="${logoUrl}" alt="HTL Ball 2026 Logo" style="max-width: 120px; height: auto; display: block;" />
              </td>
              <td style="vertical-align: middle; width: 1px; background-color: #c17a3a; padding: 0;">
                <div style="width: 1px; height: 80px; background-color: #c17a3a;"></div>
              </td>
              <td style="vertical-align: middle; text-align: left; padding-left: 20px;">
                <h1 style="margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 2px; color: #c17a3a;">HTL BRAUNAU</h1>
                <p style="margin: 8px 0 0 0; font-size: 16px; font-weight: 600; letter-spacing: 1px; color: #c17a3a;">Ball der Auserwählten 2026</p>
              </td>
            </tr>
          </table>
        </div>
        
        <div style="background: white; padding: 20px 25px 25px 25px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
          <p style="margin-bottom: 15px; line-height: 1.6; color: #444; font-size: 16px;">
            Liebe/r <strong>${data.name}</strong>,
          </p>
          
          <p style="margin-bottom: 15px; line-height: 1.6; color: #444; font-size: 16px;">
            vielen Dank für Ihre Bestellung! Wir freuen uns, Ihnen mitteilen zu können, dass Ihre Tickets erfolgreich bestellt wurden.
          </p>
          
          <div style="margin: 18px 0;">
            <h3 style="margin: 0 0 12px 0; color: #333; font-size: 18px;">Bestelldetails</h3>
            <p style="margin: 3px 0; color: #444; font-size: 16px;"><strong>Anzahl:</strong> ${data.quantity} Ticket(s)</p>
            <p style="margin: 3px 0; color: #444; font-size: 16px;"><strong>Gesamtpreis:</strong> <span style="color: #c17a3a; font-weight: bold;">€${data.totalPrice}</span></p>
            <p style="margin: 3px 0; color: #444; font-size: 16px;"><strong>Lieferart:</strong> Versand</p>
          </div>
          
          <div style="margin: 18px 0;">
            <h3 style="margin: 0 0 12px 0; color: #333; font-size: 18px;">Lieferadresse</h3>
            <p style="margin: 3px 0; color: #444; font-size: 16px;">${data.address.street}</p>
            <p style="margin: 3px 0; color: #444; font-size: 16px;">${data.address.postal} ${data.address.city}</p>
            <p style="margin: 3px 0; color: #444; font-size: 16px;">${data.address.country}</p>
          </div>
          
          <p style="margin-top: 18px; line-height: 1.6; color: #444; font-size: 16px;">
            Ihre Tickets werden in den nächsten Tagen an die angegebene Adresse versendet. Sie erhalten eine weitere E-Mail, sobald die Tickets versandt wurden.
          </p>
          
          <p style="margin-top: 15px; line-height: 1.6; color: #444; font-size: 16px;">
            Bei Fragen wenden Sie sich gerne an unser Team.
          </p>
          
          <p style="margin-top: 15px; line-height: 1.6; color: #444; font-size: 16px;">
            Mit freundlichen Grüßen,<br>
            <strong style="color: #c17a3a;">Das HTL Ball 2026 Team</strong>
          </p>
          
          <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee;">
            <p style="margin: 0; font-size: 13px; color: #999; text-align: center; font-style: italic;">
              Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht direkt auf diese E-Mail.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generatePickupEmailHTML(data: {
  name: string;
  ticketType: string;
  quantity: number;
  totalPrice: number;
  pickupCode: string;
  baseUrl?: string;
}): string {
  const baseUrl = data.baseUrl || (typeof process !== 'undefined' && process.env?.NEXTAUTH_URL) || 'http://localhost:3000';
  const logoUrl = `${baseUrl}/logos/HTL-Ball-2026_Logo_Farbe_transparent.png`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>HTL Ball 2026 - Ticket Bestätigung</title>
    </head>
    <body>
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 15px; background-color: #f8f6f3;">
        <div style="color: #c17a3a; padding: 15px; margin-bottom: 15px; text-align: center;">
          <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
            <tr>
              <td style="vertical-align: middle; text-align: center; padding-right: 20px;">
                <img src="${logoUrl}" alt="HTL Ball 2026 Logo" style="max-width: 120px; height: auto; display: block;" />
              </td>
              <td style="vertical-align: middle; width: 1px; background-color: #c17a3a; padding: 0;">
                <div style="width: 1px; height: 80px; background-color: #c17a3a;"></div>
              </td>
              <td style="vertical-align: middle; text-align: left; padding-left: 20px;">
                <h1 style="margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 2px; color: #c17a3a;">HTL BRAUNAU</h1>
                <p style="margin: 8px 0 0 0; font-size: 16px; font-weight: 600; letter-spacing: 1px; color: #c17a3a;">Ball der Auserwählten 2026</p>
              </td>
            </tr>
          </table>
        </div>
        
        <div style="background: white; padding: 20px 25px 25px 25px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
          <p style="margin-bottom: 15px; line-height: 1.6; color: #444; font-size: 16px;">
            Liebe/r <strong>${data.name}</strong>,
          </p>
          
          <p style="margin-bottom: 15px; line-height: 1.6; color: #444; font-size: 16px;">
            vielen Dank für Ihre Bestellung! Wir freuen uns, Ihnen mitteilen zu können, dass Ihre Tickets erfolgreich reserviert wurden.
          </p>
          
          <div style="margin: 18px 0;">
            <h3 style="margin: 0 0 12px 0; color: #333; font-size: 18px;">Bestelldetails</h3>
            <p style="margin: 3px 0; color: #444; font-size: 16px;"><strong>Anzahl:</strong> ${data.quantity} Ticket(s)</p>
            <p style="margin: 3px 0; color: #444; font-size: 16px;"><strong>Gesamtpreis:</strong> <span style="color: #c17a3a; font-weight: bold;">€${data.totalPrice}</span></p>
            <p style="margin: 3px 0; color: #444; font-size: 16px;"><strong>Abholart:</strong> Selbstabholung</p>
          </div>
          
          <div style="padding: 18px; margin: 18px 0; text-align: center;">
            <h3 style="margin: 0 0 12px 0; color: #333; font-size: 18px;">Ihr Abholcode</h3>
            <div style="font-size: 28px; font-weight: bold; color: #c17a3a; letter-spacing: 3px; font-family: monospace; margin: 12px 0;">${data.pickupCode}</div>
            <p style="margin: 12px 0 0 0; color: #444; font-size: 16px; font-weight: 600;">Bewahren Sie diesen Code gut auf!</p>
          </div>
          
          <div style="margin: 18px 0; font-size: 14px;">
            <h4 style="margin: 0 0 10px 0; font-weight: 600; color: #333; font-size: 16px;">Wichtige Informationen zur Abholung:</h4>
            <ul style="margin: 0; padding-left: 20px; color: #666; line-height: 1.8;">
              <li>Bringen Sie diesen Code zur Abholung mit</li>
              <li>Zeigen Sie einen gültigen Lichtbildausweis vor</li>
              <li>Weitere Details zur Abholung erhalten Sie per E-Mail</li>
            </ul>
          </div>
          
          <p style="margin-top: 18px; line-height: 1.6; color: #444; font-size: 16px;">
            Bei Fragen wenden Sie sich gerne an unser Team.
          </p>
          
          <p style="margin-top: 15px; line-height: 1.6; color: #444; font-size: 16px;">
            Mit freundlichen Grüßen,<br>
            <strong style="color: #c17a3a;">Das HTL Ball 2026 Team</strong>
          </p>
          
          <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee;">
            <p style="margin: 0; font-size: 13px; color: #999; text-align: center; font-style: italic;">
              Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht direkt auf diese E-Mail.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateShippingNotificationHTML(data: {
  name: string;
  code: string;
  address: {
    street: string;
    postal: number;
    city: string;
    country: string;
  };
  baseUrl?: string;
}): string {
  const baseUrl = data.baseUrl || (typeof process !== 'undefined' && process.env?.NEXTAUTH_URL) || 'http://localhost:3000';
  const logoUrl = `${baseUrl}/logos/HTL-Ball-2026_Logo_Farbe_transparent.png`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>HTL Ball 2026 - Ihre Tickets sind unterwegs!</title>
    </head>
    <body>
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 15px; background-color: #f8f6f3;">
        <div style="color: #c17a3a; padding: 15px; margin-bottom: 15px; text-align: center;">
          <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
            <tr>
              <td style="vertical-align: middle; text-align: center; padding-right: 20px;">
                <img src="${logoUrl}" alt="HTL Ball 2026 Logo" style="max-width: 120px; height: auto; display: block;" />
              </td>
              <td style="vertical-align: middle; width: 1px; background-color: #c17a3a; padding: 0;">
                <div style="width: 1px; height: 80px; background-color: #c17a3a;"></div>
              </td>
              <td style="vertical-align: middle; text-align: left; padding-left: 20px;">
                <h1 style="margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 2px; color: #c17a3a;">HTL BRAUNAU</h1>
                <p style="margin: 8px 0 0 0; font-size: 16px; font-weight: 600; letter-spacing: 1px; color: #c17a3a;">Ball der Auserwählten 2026</p>
              </td>
            </tr>
          </table>
        </div>
        
        <div style="background: white; padding: 20px 25px 25px 25px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
          <p style="margin-bottom: 15px; line-height: 1.6; color: #444; font-size: 16px;">
            Liebe/r <strong>${data.name}</strong>,
          </p>
          
          <p style="margin-bottom: 15px; line-height: 1.6; color: #444; font-size: 16px;">
            Gute Nachrichten! Ihre Tickets für den HTL Ball 2026 wurden erfolgreich versendet und sind bereits auf dem Weg zu Ihnen!
          </p>
          
          <div style="margin: 18px 0;">
            <h3 style="margin: 0 0 12px 0; color: #333; font-size: 18px;">Versandinformationen</h3>
            <p style="margin: 3px 0; color: #444; font-size: 16px;">Ihre Tickets wurden an die folgende Adresse versendet:</p>
          </div>
          
          <div style="margin: 18px 0;">
            <h3 style="margin: 0 0 12px 0; color: #333; font-size: 18px;">Lieferadresse</h3>
            <p style="margin: 3px 0; color: #444; font-size: 16px;">${data.address.street}</p>
            <p style="margin: 3px 0; color: #444; font-size: 16px;">${data.address.postal} ${data.address.city}</p>
            <p style="margin: 3px 0; color: #444; font-size: 16px;">${data.address.country}</p>
          </div>
          
          <p style="margin-top: 18px; line-height: 1.6; color: #444; font-size: 16px;">
            Die Lieferung erfolgt in der Regel innerhalb von 2-3 Werktagen. Falls Sie Fragen zum Versand haben, wenden Sie sich gerne an unser Team.
          </p>
          
          <p style="margin-top: 15px; line-height: 1.6; color: #444; font-size: 16px;">
            Wir freuen uns, Sie am HTL Ball 2026 - Ball der Auserwählten begrüßen zu dürfen!
          </p>
          
          <p style="margin-top: 15px; line-height: 1.6; color: #444; font-size: 16px;">
            Mit freundlichen Grüßen,<br>
            <strong style="color: #c17a3a;">Das HTL Ball 2026 Team</strong>
          </p>
          
          <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee;">
            <p style="margin: 0; font-size: 13px; color: #999; text-align: center; font-style: italic;">
              Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht direkt auf diese E-Mail.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generatePickupNotificationHTML(data: {
  name: string;
  code: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>HTL Ball 2026 - Ihre Tickets wurden abgeholt!</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #D4AF37, #B8860B); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .pickup-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .code-info { background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .code { font-size: 24px; font-weight: bold; color: #D4AF37; letter-spacing: 2px; font-family: monospace; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .highlight { color: #D4AF37; font-weight: bold; }
        .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 8px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>HTL Ball 2026 - Ball der Auserwählten</h1>
          <h2>Ihre Tickets wurden abgeholt!</h2>
        </div>
        
        <div class="content">
          <p>Liebe/r <strong>${data.name}</strong>,</p>
          
          <div class="success">
            <h3>Gute Nachrichten!</h3>
            <p>Ihre Tickets für den HTL Ball 2026 wurden erfolgreich abgeholt!</p>
          </div>
          
          <div class="pickup-info">
            <h3>Abholbestätigung</h3>
            <p>Dies ist eine Bestätigung, dass Ihre Tickets mit dem folgenden Abholcode erfolgreich abgeholt wurden:</p>
          </div>
          
          <div class="code-info">
            <h3>Abholcode</h3>
            <div class="code">${data.code}</div>
          </div>
          
          <p>Wir freuen uns, Sie am HTL Ball 2026 - Ball der Auserwählten begrüßen zu dürfen!</p>
          
          <p>Bei Fragen wenden Sie sich gerne an unser Team.</p>
          
          <p>Mit freundlichen Grüßen,<br>
          <strong>Das HTL Ball 2026 Team</strong></p>
        </div>
        
        <div class="footer">
          <p>HTL Ball 2026 - Ball der Auserwählten</p>
          <p>Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht direkt auf diese E-Mail.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}