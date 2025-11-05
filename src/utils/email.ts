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
    htmlContent = generateShippingEmailHTML({
      name,
      ticketType,
      quantity,
      totalPrice,
      address: address!,
    });
  } else {
    // Self-pickup confirmation email
    subject = `HTL Ball 2026 - Bestätigung Ihrer Ticket-Bestellung (Abholung)`;
    htmlContent = generatePickupEmailHTML({
      name,
      ticketType,
      quantity,
      totalPrice,
      pickupCode: pickupCode!,
    });
  }

  try {
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
  const htmlContent = generateShippingNotificationHTML({ name, code, address });

  try {
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

function generateShippingEmailHTML(data: {
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
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>HTL Ball 2026 - Ticket Bestätigung</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #D4AF37, #B8860B); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .ticket-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .address-info { background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .highlight { color: #D4AF37; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>HTL Ball 2026 - Ball der Auserwählten</h1>
          <h2>Ihre Tickets sind bestellt!</h2>
        </div>
        
        <div class="content">
          <p>Liebe/r <strong>${data.name}</strong>,</p>
          
          <p>vielen Dank für Ihre Bestellung! Wir freuen uns, Ihnen mitteilen zu können, dass Ihre Tickets erfolgreich bestellt wurden.</p>
          
          <div class="ticket-info">
            <h3>Bestelldetails</h3>
            <p><strong>Anzahl:</strong> ${data.quantity} Ticket(s)</p>
            <p><strong>Gesamtpreis:</strong> <span class="highlight">€${data.totalPrice}</span></p>
            <p><strong>Lieferart:</strong> Versand</p>
          </div>
          
          <div class="address-info">
            <h3>Lieferadresse</h3>
            <p>${data.address.street}<br>
            ${data.address.postal} ${data.address.city}<br>
            ${data.address.country}</p>
          </div>
          
          <p>Ihre Tickets werden in den nächsten Tagen an die angegebene Adresse versendet. Sie erhalten eine weitere E-Mail, sobald die Tickets versandt wurden.</p>
          
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

function generatePickupEmailHTML(data: {
  name: string;
  ticketType: string;
  quantity: number;
  totalPrice: number;
  pickupCode: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>HTL Ball 2026 - Ticket Bestätigung</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #D4AF37, #B8860B); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .ticket-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .pickup-code { background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .code { font-size: 24px; font-weight: bold; color: #D4AF37; letter-spacing: 2px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .highlight { color: #D4AF37; font-weight: bold; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>HTL Ball 2026 - Ball der Auserwählten</h1>
          <h2>Ihre Tickets sind reserviert!</h2>
        </div>
        
        <div class="content">
          <p>Liebe/r <strong>${data.name}</strong>,</p>
          
          <p>vielen Dank für Ihre Bestellung! Wir freuen uns, Ihnen mitteilen zu können, dass Ihre Tickets erfolgreich reserviert wurden.</p>
          
          <div class="ticket-info">
            <h3>Bestelldetails</h3>
            <p><strong>Anzahl:</strong> ${data.quantity} Ticket(s)</p>
            <p><strong>Gesamtpreis:</strong> <span class="highlight">€${data.totalPrice}</span></p>
            <p><strong>Abholart:</strong> Selbstabholung</p>
          </div>
          
          <div class="pickup-code">
            <h3>Ihr Abholcode</h3>
            <div class="code">${data.pickupCode}</div>
            <p><strong>Bewahren Sie diesen Code gut auf!</strong></p>
          </div>
          
          <div class="warning">
            <h4>Wichtige Informationen zur Abholung:</h4>
            <ul>
              <li>Bringen Sie diesen Code zur Abholung mit</li>
              <li>Zeigen Sie einen gültigen Lichtbildausweis vor</li>
              <li>Die Abholung erfolgt am Veranstaltungstag</li>
              <li>Weitere Details zur Abholung erhalten Sie per E-Mail</li>
            </ul>
          </div>
          
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

function generateShippingNotificationHTML(data: {
  name: string;
  code: string;
  address: {
    street: string;
    postal: number;
    city: string;
    country: string;
  };
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>HTL Ball 2026 - Ihre Tickets sind unterwegs!</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #D4AF37, #B8860B); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .shipping-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .address-info { background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .highlight { color: #D4AF37; font-weight: bold; }
        .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 8px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>HTL Ball 2026 - Ball der Auserwählten</h1>
          <h2>Ihre Tickets sind unterwegs!</h2>
        </div>
        
        <div class="content">
          <p>Liebe/r <strong>${data.name}</strong>,</p>
          
          <div class="success">
            <h3>Gute Nachrichten!</h3>
            <p>Ihre Tickets für den HTL Ball 2026 wurden erfolgreich versendet und sind bereits auf dem Weg zu Ihnen!</p>
          </div>
          
          <div class="shipping-info">
            <h3>Versandinformationen</h3>
            <p>Ihre Tickets wurden an die folgende Adresse versendet:</p>
          </div>
          
          <div class="address-info">
            <h3>Lieferadresse</h3>
            <p>${data.address.street}<br>
            ${data.address.postal} ${data.address.city}<br>
            ${data.address.country}</p>
          </div>
          
          <p>Die Lieferung erfolgt in der Regel innerhalb von 2-3 Werktagen. Falls Sie Fragen zum Versand haben, wenden Sie sich gerne an unser Team.</p>
          
          <p>Wir freuen uns, Sie am HTL Ball 2026 - Ball der Auserwählten begrüßen zu dürfen!</p>
          
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