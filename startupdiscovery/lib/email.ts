/**
 * Email Service Utility for SendGrid Integration
 * Provides email sending functionality with templates and logging
 */

import sgMail from "@sendgrid/mail";
import { Logger } from "./logger";

const logger = new Logger("EmailService");

// Initialize SendGrid client
function initializeEmailClient(): void {
  const apiKey = process.env.SENDGRID_API_KEY;

  if (!apiKey) {
    logger.warn("SendGrid API key not configured", {
      hasApiKey: !!apiKey,
    });
    return;
  }

  sgMail.setApiKey(apiKey);
}

// Initialize on module load
initializeEmailClient();

/**
 * Email template types
 */
export enum EmailTemplateType {
  WELCOME = "welcome",
  PASSWORD_RESET = "password_reset",
  EMAIL_VERIFICATION = "email_verification",
  STARTUP_FEATURED = "startup_featured",
  NOTIFICATION = "notification",
}

/**
 * Email template interface
 */
export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

/**
 * Email sending options
 */
export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  bcc?: string[];
  cc?: string[];
}

/**
 * Email send response
 */
export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Welcome email template
 */
export const welcomeTemplate = (userName: string): EmailTemplate => ({
  subject: "Welcome to Startup Discovery! 🚀",
  html: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 32px;">Welcome to Startup Discovery! 🚀</h1>
      </div>
      
      <div style="background: #f9fafb; padding: 40px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
        <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151;">
          Hi <strong>${userName}</strong>,
        </p>
        
        <p style="margin: 0 0 20px 0; font-size: 15px; color: #4b5563; line-height: 1.6;">
          Welcome to Startup Discovery! We're thrilled to have you join our community of innovators, entrepreneurs, and tech enthusiasts. 🎉
        </p>
        
        <p style="margin: 0 0 20px 0; font-size: 15px; color: #4b5563; line-height: 1.6;">
          Here's what you can do next:
        </p>
        
        <ul style="margin: 0 0 20px 0; padding-left: 20px; font-size: 15px; color: #4b5563; line-height: 1.8;">
          <li>Explore amazing startups in your industry</li>
          <li>Bookmark your favorite projects</li>
          <li>Connect with founders and investors</li>
          <li>Stay updated on funding announcements</li>
        </ul>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="https://app.startupdiscovery.com/dashboard" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
            Get Started Now
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="margin: 0 0 10px 0; font-size: 13px; color: #6b7280;">
          Have questions? <a href="mailto:support@startupdiscovery.com" style="color: #667eea; text-decoration: none;">Contact our support team</a>
        </p>
        
        <p style="margin: 0; font-size: 12px; color: #9ca3af;">
          This is an automated email — please don't reply directly. Your responses won't be seen by our team.
        </p>
      </div>
    </div>
  `,
  text: `Welcome to Startup Discovery, ${userName}!\n\nWe're excited to have you on board. Start exploring: https://app.startupdiscovery.com/dashboard\n\nThis is an automated email — please don't reply.`,
});

/**
 * Email verification template
 */
export const emailVerificationTemplate = (
  userName: string,
  verificationUrl: string
): EmailTemplate => ({
  subject: "Verify Your Email Address",
  html: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">Verify Your Email</h1>
      </div>
      
      <div style="background: #f9fafb; padding: 40px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
        <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151;">
          Hi <strong>${userName}</strong>,
        </p>
        
        <p style="margin: 0 0 20px 0; font-size: 15px; color: #4b5563; line-height: 1.6;">
          Please verify your email address to complete your account setup and unlock all features of Startup Discovery.
        </p>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
            Verify Email Address
          </a>
        </div>
        
        <p style="margin: 0 0 20px 0; font-size: 13px; color: #6b7280; text-align: center;">
          Or copy this link: <a href="${verificationUrl}" style="color: #667eea; text-decoration: none; word-break: break-all;">${verificationUrl}</a>
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="margin: 0; font-size: 12px; color: #9ca3af;">
          This link expires in 24 hours. This is an automated email — please don't reply.
        </p>
      </div>
    </div>
  `,
  text: `Hi ${userName},\n\nPlease verify your email by clicking: ${verificationUrl}\n\nThis link expires in 24 hours.`,
});

/**
 * Password reset template
 */
export const passwordResetTemplate = (
  userName: string,
  resetUrl: string
): EmailTemplate => ({
  subject: "Reset Your Password",
  html: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">Reset Your Password</h1>
      </div>
      
      <div style="background: #f9fafb; padding: 40px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
        <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151;">
          Hi <strong>${userName}</strong>,
        </p>
        
        <p style="margin: 0 0 20px 0; font-size: 15px; color: #4b5563; line-height: 1.6;">
          We received a request to reset your password. Click the button below to set a new password.
        </p>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
            Reset Password
          </a>
        </div>
        
        <p style="margin: 0 0 20px 0; font-size: 13px; color: #6b7280; text-align: center;">
          Or copy this link: <a href="${resetUrl}" style="color: #667eea; text-decoration: none; word-break: break-all;">${resetUrl}</a>
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="margin: 0 0 10px 0; font-size: 13px; color: #ef4444;">
          <strong>⚠️ Security Note:</strong> If you didn't request this email, please ignore it. This link expires in 1 hour.
        </p>
        
        <p style="margin: 0; font-size: 12px; color: #9ca3af;">
          This is an automated email — please don't reply.
        </p>
      </div>
    </div>
  `,
  text: `Hi ${userName},\n\nReset your password: ${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, please ignore this email.`,
});

/**
 * Startup featured notification template
 */
export const startupFeaturedTemplate = (
  startupName: string,
  startupUrl: string
): EmailTemplate => ({
  subject: `🎉 ${startupName} is now featured!`,
  html: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; border-radius: 8px 8px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 32px;">🎉 Featured!</h1>
      </div>
      
      <div style="background: #f9fafb; padding: 40px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
        <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151;">
          Congratulations!
        </p>
        
        <p style="margin: 0 0 20px 0; font-size: 15px; color: #4b5563; line-height: 1.6;">
          Your startup <strong>${startupName}</strong> has been featured on the Startup Discovery platform! 🚀
        </p>
        
        <p style="margin: 0 0 20px 0; font-size: 15px; color: #4b5563; line-height: 1.6;">
          This means your startup will get increased visibility and reach more investors, customers, and collaborators.
        </p>
        
        <div style="margin: 30px 0; text-align: center;">
          <a href="${startupUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
            View Your Startup
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="margin: 0; font-size: 12px; color: #9ca3af;">
          This is an automated email — please don't reply.
        </p>
      </div>
    </div>
  `,
  text: `Congratulations! Your startup ${startupName} has been featured!\n\nView your startup: ${startupUrl}`,
});

/**
 * Send email using SendGrid
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResponse> {
  try {
    const { to, subject, html, text, replyTo, bcc, cc } = options;

    const senderEmail =
      process.env.SENDGRID_SENDER || "no-reply@yourdomain.com";
    const sandboxMode =
      process.env.SENDGRID_SANDBOX_MODE === "true" ? true : false;

    const emailPayload = {
      to,
      from: senderEmail,
      subject,
      html,
      ...(text && { text }),
      ...(replyTo && { replyTo }),
      ...(bcc && { bcc }),
      ...(cc && { cc }),
      mailSettings: {
        sandboxMode: {
          enable: sandboxMode,
        },
      },
    };

    const response = await sgMail.send(emailPayload as never);

    const messageId = response[0].headers["x-message-id"];

    logger.info("Email sent successfully", {
      to: Array.isArray(to) ? to.length : 1,
      subject,
      messageId,
      sandboxMode,
    });

    return {
      success: true,
      messageId,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    logger.error("Failed to send email", {
      error: errorMessage,
      to: options.to,
      subject: options.subject,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(
  email: string,
  userName: string
): Promise<EmailResponse> {
  const template = welcomeTemplate(userName);
  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

/**
 * Send email verification
 */
export async function sendEmailVerification(
  email: string,
  userName: string,
  verificationUrl: string
): Promise<EmailResponse> {
  const template = emailVerificationTemplate(userName, verificationUrl);
  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordReset(
  email: string,
  userName: string,
  resetUrl: string
): Promise<EmailResponse> {
  const template = passwordResetTemplate(userName, resetUrl);
  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

/**
 * Send startup featured notification
 */
export async function sendStartupFeatured(
  email: string,
  startupName: string,
  startupUrl: string
): Promise<EmailResponse> {
  const template = startupFeaturedTemplate(startupName, startupUrl);
  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

/**
 * Batch send emails with error handling
 */
export async function batchSendEmails(
  recipients: Array<{
    email: string;
    subject: string;
    html: string;
    text?: string;
  }>
): Promise<Array<EmailResponse>> {
  const results = await Promise.all(
    recipients.map((recipient) =>
      sendEmail({
        to: recipient.email,
        subject: recipient.subject,
        html: recipient.html,
        text: recipient.text,
      })
    )
  );

  return results;
}
