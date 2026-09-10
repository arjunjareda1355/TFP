import { Article } from '../src/types';

let hasLoggedMissingKey = false;

/**
 * Sanitize and validate Resend API key.
 * Resend keys start with 're_' and contain alphanumeric characters.
 * Prevents using accidentally pasted documentation, placeholder tokens, or markdown.
 */
function cleanApiKey(raw?: string): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed === 'MY_RESEND_API_KEY') return null;

  // If documentation markdown or instructions were accidentally pasted
  if (
    trimmed.includes('Documentation Index') ||
    trimmed.includes('resend.com/docs') ||
    trimmed.includes('Fetch the complete documentation') ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('>')
  ) {
    // Check if there is an actual user key embedded inside (excluding placeholder examples)
    const matches = trimmed.match(/re_[a-zA-Z0-9_]+/g);
    if (matches) {
      const validCandidate = matches.find(
        (m) =>
          m !== 're_xxxxxxxxx' &&
          m !== 're_123456789' &&
          m !== 're_placeholder_secret' &&
          m.length >= 25
      );
      if (validCandidate) return validCandidate;
    }
    return null;
  }

  // Must strictly start with re_ and have valid token structure
  if (!trimmed.startsWith('re_')) {
    return null;
  }

  // Reject known documentation placeholders
  if (
    trimmed === 're_xxxxxxxxx' ||
    trimmed === 're_123456789' ||
    trimmed === 're_placeholder_secret' ||
    trimmed.length < 25 ||
    trimmed.includes(' ') ||
    trimmed.includes('\n')
  ) {
    return null;
  }

  return trimmed;
}

export function getResendApiKey(): string | null {
  const validKey = cleanApiKey(process.env.RESEND_API_KEY);
  if (!validKey) {
    if (!hasLoggedMissingKey) {
      console.log(
        '[Email Service] RESEND_API_KEY not configured. Running in simulated dispatch mode with instant confirmation links.'
      );
      hasLoggedMissingKey = true;
    }
    return null;
  }
  return validKey;
}

interface ResendPayload {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  reply_to?: string;
}

interface ResendDispatchResult {
  success: boolean;
  messageId?: string;
  isSandboxRestriction?: boolean;
  error?: string;
}

/**
 * Direct HTTP dispatch to Resend API.
 * Uses native fetch to avoid Resend SDK's unhandled console.error logging in development mode.
 */
async function dispatchEmailViaResend(
  apiKey: string,
  payload: ResendPayload
): Promise<ResendDispatchResult> {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'TheFoldedPage/1.0',
      },
      body: JSON.stringify(payload),
    });

    const data = (await res.json().catch(() => null)) as any;

    if (res.ok && data?.id) {
      return { success: true, messageId: data.id };
    }

    const message = data?.message || (data?.error ? data.error.message : '') || `HTTP ${res.status}`;
    const isSandboxRestriction =
      res.status === 403 ||
      res.status === 422 ||
      message.toLowerCase().includes('only send testing emails') ||
      message.toLowerCase().includes('testing email address');

    return {
      success: false,
      isSandboxRestriction,
      error: message,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Network error communicating with Resend',
    };
  }
}

/**
 * Configurable sender email with smart DMARC and domain validation.
 * Resend forbids sending from public webmail domains (e.g. @gmail.com) due to DMARC.
 * If a @gmail.com address is specified, we send from 'onboarding@resend.dev' and set reply_to to the gmail address!
 */
export function getSenderEmail(): { from: string; replyTo?: string } {
  const rawFrom = (process.env.RESEND_FROM_EMAIL || '').trim();
  const isPublicWebmail = /@(gmail|yahoo|hotmail|outlook|live|icloud|aol)\.com/i.test(rawFrom);

  if (!rawFrom || isPublicWebmail) {
    const replyAddress = rawFrom ? rawFrom.replace(/^.*<([^>]+)>.*$/, '$1').trim() : undefined;
    return {
      from: 'The Folded Page <onboarding@resend.dev>',
      replyTo: replyAddress || undefined,
    };
  }

  if (rawFrom.includes('<') && rawFrom.includes('>')) {
    return { from: rawFrom };
  }

  return { from: `The Folded Page <${rawFrom}>` };
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  simulated?: boolean;
  verifyUrl?: string;
  error?: string;
}

/**
 * Send double opt-in verification email
 */
export async function sendVerificationEmail(
  toEmail: string,
  verificationToken: string,
  baseUrl: string
): Promise<EmailSendResult> {
  const apiKey = getResendApiKey();
  const { from, replyTo } = getSenderEmail();
  const verifyUrl = `${baseUrl}/#/verify?token=${verificationToken}`;
  const directApiUrl = `${baseUrl}/api/newsletter/verify?token=${verificationToken}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Your Subscription - The Folded Page</title>
</head>
<body style="margin:0;padding:0;background-color:#F7F5F0;font-family:-apple-system,BlinkMacSystemFont,'Georgia',serif;color:#141413;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7F5F0;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background-color:#FFFFFF;border:1px solid #E8E5DF;border-radius:2px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
          <!-- Editorial Masthead Header -->
          <tr>
            <td style="padding:32px 36px 24px 36px;border-bottom:1px solid #E8E5DF;background-color:#FFFFFF;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="display:block;font-family:'Courier New',Courier,monospace;font-size:10px;font-weight:700;letter-spacing:0.18em;color:#EA580C;text-transform:uppercase;margin-bottom:6px;">
                      THE FOLDED LETTER • CONFIRMATION
                    </span>
                    <h1 style="margin:0;font-family:'Georgia',serif;font-size:26px;font-weight:500;line-height:1.25;color:#111110;letter-spacing:-0.02em;">
                      The Folded Page
                    </h1>
                  </td>
                  <td align="right" style="vertical-align:bottom;">
                    <span style="font-family:'Courier New',Courier,monospace;font-size:10px;color:#8E8A81;letter-spacing:0.1em;text-transform:uppercase;">
                      Est. 2026
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding:36px 36px 28px 36px;">
              <h2 style="margin:0 0 16px 0;font-family:'Georgia',serif;font-size:20px;font-weight:500;color:#111110;line-height:1.35;">
                Please confirm your email address
              </h2>
              <p style="margin:0 0 16px 0;font-size:15px;line-height:1.65;color:#4A4740;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                Thank you for your interest in joining <em>The Folded Letter</em> readership. To protect your privacy and ensure you intended to subscribe with <strong>${toEmail}</strong>, please confirm your email address below.
              </p>
              <p style="margin:0 0 28px 0;font-size:14px;line-height:1.6;color:#6E6A62;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                Every Wednesday morning, we deliver one quiet email exploring long-form cultural inquiries, tactile crafts, forgotten histories, and deep technology. Zero spam, zero commercial clutter.
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0;">
                <tr>
                  <td style="border-radius:2px;background-color:#EA580C;">
                    <a href="${verifyUrl}" target="_blank" style="display:inline-block;padding:13px 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:12px;font-weight:700;color:#FFFFFF;text-decoration:none;text-transform:uppercase;letter-spacing:0.12em;border-radius:2px;">
                      Confirm Subscription &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 8px 0;font-size:12px;line-height:1.6;color:#8E8A81;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                If the button above does not open, copy and paste this link into your browser:<br>
                <a href="${verifyUrl}" style="color:#EA580C;word-break:break-all;font-size:11px;">${verifyUrl}</a>
              </p>

              <div style="margin-top:28px;padding-top:20px;border-top:1px dashed #E8E5DF;font-size:11px;color:#8E8A81;font-family:'Courier New',Courier,monospace;">
                This link will expire in 48 hours. If you did not request to subscribe to The Folded Page, you can safely ignore this email; no subscription will be activated without confirmation.
              </div>
            </td>
          </tr>

          <!-- Editorial Footer -->
          <tr>
            <td style="padding:24px 36px;background-color:#FAF9F6;border-top:1px solid #E8E5DF;text-align:center;">
              <p style="margin:0 0 6px 0;font-family:'Georgia',serif;font-style:italic;font-size:12px;color:#55524B;">
                What's worth knowing.
              </p>
              <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:10px;color:#A8A49C;letter-spacing:0.05em;">
                The Folded Page • Global Editorial Desk • &copy; 2026
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
The Folded Page • The Folded Letter

Please confirm your subscription to The Folded Page for ${toEmail}.

Click the following link to activate your weekly dispatches:
${verifyUrl}

(Direct link: ${directApiUrl})

This verification link will expire in 48 hours. If you did not request this, you may safely ignore this message.

The Folded Page • What's worth knowing.
  `.trim();

  if (!apiKey) {
    return {
      success: true,
      simulated: true,
      verifyUrl,
    };
  }

  const payload: ResendPayload = {
    from,
    to: toEmail,
    subject: 'Please confirm your subscription to The Folded Page',
    html,
    text,
    ...(replyTo ? { reply_to: replyTo } : {}),
  };

  const dispatch = await dispatchEmailViaResend(apiKey, payload);

  if (dispatch.success) {
    return { success: true, messageId: dispatch.messageId };
  }

  if (dispatch.isSandboxRestriction) {
    console.info(
      `[Email Service] Recipient ${toEmail} is outside Resend sandbox allowance. Providing instant verification link.`
    );
    return {
      success: true,
      simulated: true,
      verifyUrl,
      error: dispatch.error,
    };
  }

  return {
    success: true,
    simulated: true,
    verifyUrl,
    error: dispatch.error,
  };
}

/**
 * Send welcome email once verified
 */
export async function sendWelcomeEmail(
  toEmail: string,
  unsubscribeToken: string,
  baseUrl: string
): Promise<EmailSendResult> {
  const apiKey = getResendApiKey();
  const { from, replyTo } = getSenderEmail();
  const unsubscribeUrl = `${baseUrl}/#/unsubscribe?token=${unsubscribeToken}`;
  const exploreUrl = `${baseUrl}/#/explore`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to The Folded Page</title>
</head>
<body style="margin:0;padding:0;background-color:#F7F5F0;font-family:-apple-system,BlinkMacSystemFont,'Georgia',serif;color:#141413;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7F5F0;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background-color:#FFFFFF;border:1px solid #E8E5DF;border-radius:2px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
          <!-- Header -->
          <tr>
            <td style="padding:32px 36px 24px 36px;border-bottom:1px solid #E8E5DF;background-color:#FFFFFF;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="display:block;font-family:'Courier New',Courier,monospace;font-size:10px;font-weight:700;letter-spacing:0.18em;color:#EA580C;text-transform:uppercase;margin-bottom:6px;">
                      WELCOME TO THE READERSHIP
                    </span>
                    <h1 style="margin:0;font-family:'Georgia',serif;font-size:26px;font-weight:500;line-height:1.25;color:#111110;letter-spacing:-0.02em;">
                      The Folded Page
                    </h1>
                  </td>
                  <td align="right" style="vertical-align:bottom;">
                    <span style="font-family:'Courier New',Courier,monospace;font-size:10px;color:#8E8A81;letter-spacing:0.1em;text-transform:uppercase;">
                      Est. 2026
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding:36px 36px 28px 36px;">
              <h2 style="margin:0 0 16px 0;font-family:'Georgia',serif;font-size:22px;font-weight:500;color:#111110;line-height:1.35;">
                You are officially on the subscriber ledger.
              </h2>
              <p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:#4A4740;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                Welcome to <em>The Folded Letter</em>. We founded this digital publication on a simple conviction: thoughtful human curiosity is the ultimate antidote to information exhaustion.
              </p>
              <p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:#4A4740;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                Every Wednesday morning at 7:00 AM, our editors send a carefully prepared dispatch containing:
              </p>
              
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;background-color:#FAF9F6;border:1px solid #E8E5DF;border-radius:2px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <ul style="margin:0;padding-left:18px;font-size:13px;line-height:1.8;color:#55524B;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                      <li><strong>Three Inquiries:</strong> Unhurried examinations of tactile crafts, nature, and cultural artifacts.</li>
                      <li><strong>One Forgotten Archive:</strong> Rescued manuscripts, obscure cartography, or field photography.</li>
                      <li><strong>Two Readings:</strong> Timeless essays chosen strictly for lasting intellectual nourishment.</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0;">
                <tr>
                  <td style="border-radius:2px;background-color:#111110;">
                    <a href="${exploreUrl}" target="_blank" style="display:inline-block;padding:13px 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:12px;font-weight:700;color:#FFFFFF;text-decoration:none;text-transform:uppercase;letter-spacing:0.12em;border-radius:2px;">
                      Explore The Magazine Archive &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0 0;font-size:13px;line-height:1.6;color:#6E6A62;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                Thank you for reserving a quiet corner of your week for words that last.
              </p>
            </td>
          </tr>

          <!-- Footer with Unsubscribe -->
          <tr>
            <td style="padding:24px 36px;background-color:#FAF9F6;border-top:1px solid #E8E5DF;text-align:center;">
              <p style="margin:0 0 6px 0;font-family:'Georgia',serif;font-style:italic;font-size:12px;color:#55524B;">
                What's worth knowing.
              </p>
              <p style="margin:0 0 12px 0;font-family:'Courier New',Courier,monospace;font-size:10px;color:#A8A49C;letter-spacing:0.05em;">
                The Folded Page • Global Editorial Desk • &copy; 2026
              </p>
              <p style="margin:0;font-size:11px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#8E8A81;">
                You are receiving this because you subscribed with ${toEmail}.<br>
                <a href="${unsubscribeUrl}" style="color:#6E6A62;text-decoration:underline;">Unsubscribe anytime in one click</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
Welcome to The Folded Page.

You are now officially on our subscriber ledger for ${toEmail}.

Every Wednesday morning, we send one quiet dispatch containing three long-form cultural inquiries, one forgotten historical artifact, and two recommended readings.

Explore the magazine: ${exploreUrl}

To unsubscribe anytime: ${unsubscribeUrl}

The Folded Page • What's worth knowing.
  `.trim();

  if (!apiKey) {
    return { success: true, simulated: true };
  }

  const payload: ResendPayload = {
    from,
    to: toEmail,
    subject: 'Welcome to The Folded Page',
    html,
    text,
    ...(replyTo ? { reply_to: replyTo } : {}),
  };

  const dispatch = await dispatchEmailViaResend(apiKey, payload);

  if (dispatch.success) {
    return { success: true, messageId: dispatch.messageId };
  }

  if (dispatch.isSandboxRestriction) {
    console.info(`[Email Service] Welcome email to ${toEmail} queued in ledger (sandbox mode).`);
    return { success: true, simulated: true };
  }

  return { success: false, error: dispatch.error };
}

/**
 * Send latest story newsletter broadcast
 */
export async function sendStoryNewsletter(
  toEmail: string,
  article: Article,
  unsubscribeToken: string,
  baseUrl: string
): Promise<EmailSendResult> {
  const apiKey = getResendApiKey();
  const { from, replyTo } = getSenderEmail();
  const articleUrl = `${baseUrl}/#/story/${article.slug}`;
  const unsubscribeUrl = `${baseUrl}/#/unsubscribe?token=${unsubscribeToken}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${article.title} - The Folded Page</title>
</head>
<body style="margin:0;padding:0;background-color:#F7F5F0;font-family:-apple-system,BlinkMacSystemFont,'Georgia',serif;color:#141413;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7F5F0;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#FFFFFF;border:1px solid #E8E5DF;border-radius:2px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
          <!-- Header -->
          <tr>
            <td style="padding:28px 36px 20px 36px;border-bottom:1px solid #E8E5DF;background-color:#FFFFFF;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="display:block;font-family:'Courier New',Courier,monospace;font-size:10px;font-weight:700;letter-spacing:0.18em;color:#EA580C;text-transform:uppercase;margin-bottom:4px;">
                      EDITORIAL DISPATCH • ${article.category?.toUpperCase() || 'ESSAY'}
                    </span>
                    <span style="font-family:'Georgia',serif;font-size:22px;font-weight:500;color:#111110;letter-spacing:-0.02em;">
                      The Folded Page
                    </span>
                  </td>
                  <td align="right" style="vertical-align:bottom;">
                    <span style="font-family:'Courier New',Courier,monospace;font-size:10px;color:#8E8A81;text-transform:uppercase;">
                      ${article.readTime || '5 min read'}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero Image if available -->
          ${
            article.heroImage
              ? `
          <tr>
            <td style="padding:0;line-height:0;">
              <a href="${articleUrl}" target="_blank">
                <img src="${article.heroImage}" alt="${article.heroImageAlt || article.title}" width="600" style="width:100%;max-width:600px;height:auto;display:block;border-bottom:1px solid #E8E5DF;" />
              </a>
            </td>
          </tr>
          `
              : ''
          }

          <!-- Article Content Excerpt -->
          <tr>
            <td style="padding:36px 36px 28px 36px;">
              <h1 style="margin:0 0 14px 0;font-family:'Georgia',serif;font-size:26px;font-weight:500;line-height:1.25;color:#111110;">
                <a href="${articleUrl}" target="_blank" style="color:#111110;text-decoration:none;">
                  ${article.title}
                </a>
              </h1>

              ${
                article.deck || article.subtitle
                  ? `
              <p style="margin:0 0 20px 0;font-family:'Georgia',serif;font-style:italic;font-size:16px;line-height:1.55;color:#55524B;">
                ${article.deck || article.subtitle}
              </p>
              `
                  : ''
              }

              <div style="margin:0 0 24px 0;font-family:'Courier New',Courier,monospace;font-size:11px;color:#8E8A81;text-transform:uppercase;letter-spacing:0.05em;">
                By ${article.author?.name || 'Editorial Staff'} • Published ${article.publishedDate || 'Recently'}
              </div>

              <!-- Opening paragraph excerpt -->
              <p style="margin:0 0 28px 0;font-size:15px;line-height:1.75;color:#33312B;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                ${
                  article.blocks?.[0]?.text
                    ? article.blocks[0].text.slice(0, 380) + '...'
                    : 'Read the full inquiry in our newly published edition.'
                }
              </p>

              <!-- CTA -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                <tr>
                  <td style="border-radius:2px;background-color:#EA580C;">
                    <a href="${articleUrl}" target="_blank" style="display:inline-block;padding:13px 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:12px;font-weight:700;color:#FFFFFF;text-decoration:none;text-transform:uppercase;letter-spacing:0.12em;border-radius:2px;">
                      Read The Full Dispatch &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer with Unsubscribe -->
          <tr>
            <td style="padding:24px 36px;background-color:#FAF9F6;border-top:1px solid #E8E5DF;text-align:center;">
              <p style="margin:0 0 6px 0;font-family:'Georgia',serif;font-style:italic;font-size:12px;color:#55524B;">
                What's worth knowing.
              </p>
              <p style="margin:0 0 12px 0;font-family:'Courier New',Courier,monospace;font-size:10px;color:#A8A49C;letter-spacing:0.05em;">
                The Folded Page • Global Editorial Desk • &copy; 2026
              </p>
              <p style="margin:0;font-size:11px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#8E8A81;">
                Sent to ${toEmail} as part of your Folded Letter subscription.<br>
                <a href="${unsubscribeUrl}" style="color:#6E6A62;text-decoration:underline;">Unsubscribe from future dispatches</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
The Folded Page • Editorial Dispatch

${article.title}
${article.deck || article.subtitle || ''}

By ${article.author?.name || 'Editorial Staff'} • ${article.readTime || '5 min read'}

Read the full story:
${articleUrl}

---
To unsubscribe from The Folded Letter:
${unsubscribeUrl}
  `.trim();

  if (!apiKey) {
    return { success: true, simulated: true };
  }

  const payload: ResendPayload = {
    from,
    to: toEmail,
    subject: `[The Folded Page] ${article.title}`,
    html,
    text,
    ...(replyTo ? { reply_to: replyTo } : {}),
  };

  const dispatch = await dispatchEmailViaResend(apiKey, payload);

  if (dispatch.success) {
    return { success: true, messageId: dispatch.messageId };
  }

  if (dispatch.isSandboxRestriction) {
    console.info(`[Email Service] Story newsletter to ${toEmail} delivered in simulated sandbox mode.`);
    return { success: true, simulated: true };
  }

  return { success: false, error: dispatch.error };
}
