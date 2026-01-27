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
import { Logger, generateRequestId } from "@/lib/logger";
import { withErrorHandler } from "@/lib/errorHandler";
import { logApiResponse } from "@/lib/requestLogger";
import {
  sendEmail,
  sendWelcomeEmail,
  sendEmailVerification,
  sendPasswordReset,
  sendStartupFeatured,
  EmailTemplateType,
} from "@/lib/email";

// Logger will be instantiated per-request with correlation id

/**
 * POST /api/email
 * Send email with template or custom content
 */
export const POST = withErrorHandler(async (req: Request) => {
  const startTime = Date.now();
  const requestId = generateRequestId();
  const logger = new Logger("EmailAPI", requestId);
  const request = req as NextRequest;

  logger.logRequest(req.method, "/api/email");

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
    
    logApiResponse(logger, req, 400, startTime, { error: "validation_failed" });
    
    return NextResponse.json(
      {
        success: false,
        message: "Missing required fields: to and subject",
      },
      { 
        status: 400,
        headers: { "x-request-id": requestId }
      }
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
        
        logApiResponse(logger, req, 400, startTime, { error: "validation_failed" });
        
        return NextResponse.json(
          {
            success: false,
            message: "Missing content: provide either html or text",
          },
          { 
            status: 400,
            headers: { "x-request-id": requestId }
          }
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

      logApiResponse(logger, req, 200, startTime, { 
        messageId: result.messageId,
        emailsSent: 1
      });

      return NextResponse.json(
        {
          success: true,
          messageId: result.messageId,
          message: "Email sent successfully",
        },
        { 
          status: 200,
          headers: { "x-request-id": requestId }
        }
      );
    } else {
      logger.error("Email send failed", new Error(result.error || "Unknown error"), {
        to,
      });

      logApiResponse(logger, req, 500, startTime, { error: "email_send_failed" });

      return NextResponse.json(
        {
          success: false,
          message: "Failed to send email",
          error: result.error,
        },
        { 
          status: 500,
          headers: { "x-request-id": requestId }
        }
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    logger.error("Email API error", error instanceof Error ? error : new Error(errorMessage), {
      to,
      subject,
    });

    logApiResponse(logger, req, 500, startTime, { error: "internal_error" });

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: errorMessage,
      },
      { 
        status: 500,
        headers: { "x-request-id": requestId }
      }
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
