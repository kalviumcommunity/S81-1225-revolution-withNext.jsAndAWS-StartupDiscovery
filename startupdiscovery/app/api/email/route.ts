/**
 * Email API Endpoint
 * POST /api/email - Send emails via SendGrid
 *
 * Request body:
 * {
 *   "to": "user@example.com",
 *   "subject": "Welcome!",
 *   "html": "<h1>Hello</h1>",
 *   "templateType": "welcome", // optional
 *   "templateData": { userName: "John" } // optional
 * }
 */

import { NextResponse, NextRequest } from "next/server";
import { Logger } from "@/lib/logger";
import { withErrorHandler } from "@/lib/errorHandler";
import {
  sendEmail,
  sendWelcomeEmail,
  sendEmailVerification,
  sendPasswordReset,
  sendStartupFeatured,
  EmailTemplateType,
} from "@/lib/email";

const logger = new Logger("EmailAPI");

/**
 * POST /api/email
 * Send email with template or custom content
 */
export const POST = withErrorHandler(async (req: Request) => {
  const request = req as NextRequest;
  const body = await request.json();

  const {
    to,
    subject,
    html,
    text,
    templateType,
    templateData,
    replyTo,
    cc,
    bcc,
  } = body;

  logger.info("Email send request received", {
    to,
    subject,
    templateType,
  });

  // Validate required fields
  if (!to || !subject) {
    logger.warn("Invalid email request - missing fields", {
      hasTo: !!to,
      hasSubject: !!subject,
    });
    return NextResponse.json(
      {
        success: false,
        message: "Missing required fields: to and subject",
      },
      { status: 400 }
    );
  }

  try {
    let result;

    // Handle template-based emails
    if (templateType && templateData) {
      switch (templateType) {
        case EmailTemplateType.WELCOME:
          result = await sendWelcomeEmail(to, templateData.userName);
          break;

        case EmailTemplateType.EMAIL_VERIFICATION:
          result = await sendEmailVerification(
            to,
            templateData.userName,
            templateData.verificationUrl
          );
          break;

        case EmailTemplateType.PASSWORD_RESET:
          result = await sendPasswordReset(
            to,
            templateData.userName,
            templateData.resetUrl
          );
          break;

        case EmailTemplateType.STARTUP_FEATURED:
          result = await sendStartupFeatured(
            to,
            templateData.startupName,
            templateData.startupUrl
          );
          break;

        default:
          // Fallback to custom email
          result = await sendEmail({
            to,
            subject,
            html: html || "",
            text,
            replyTo,
            cc,
            bcc,
          });
      }
    } else {
      // Custom email
      if (!html && !text) {
        logger.warn("Invalid email request - missing content", {
          hasHtml: !!html,
          hasText: !!text,
        });
        return NextResponse.json(
          {
            success: false,
            message: "Missing content: provide either html or text",
          },
          { status: 400 }
        );
      }

      result = await sendEmail({
        to,
        subject,
        html: html || "",
        text,
        replyTo,
        cc,
        bcc,
      });
    }

    if (result.success) {
      logger.info("Email sent successfully", {
        messageId: result.messageId,
        to,
      });

      return NextResponse.json(
        {
          success: true,
          messageId: result.messageId,
          message: "Email sent successfully",
        },
        { status: 200 }
      );
    } else {
      logger.error("Email send failed", {
        error: result.error,
        to,
      });

      return NextResponse.json(
        {
          success: false,
          message: "Failed to send email",
          error: result.error,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    logger.error("Email API error", {
      error: errorMessage,
      to,
      subject,
    });

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
});

/**
 * OPTIONS /api/email
 * CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
