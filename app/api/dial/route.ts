/**
 * Dial API Endpoint
 * Initiates outbound calls with AMD detection
 * POST /api/dial
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  twilioClient,
  TWILIO_PHONE_NUMBER,
  BASE_URL,
  formatToE164,
  DEFAULT_AMD_CONFIG,
} from "@/lib/twilio";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-utils";

/**
 * Request validation schema
 */
const DialRequestSchema = z.object({
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  amdStrategy: z.enum(["TWILIO_NATIVE", "JAMBONZ", "HUGGINGFACE", "GEMINI_FLASH"]),
});

/**
 * POST /api/dial
 * Initiates an outbound call with AMD
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await requireAuth();

    // 2. Parse and validate request body
    const body = await request.json();
    const validation = DialRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { phoneNumber, amdStrategy } = validation.data;

    // 3. Format phone number
    const formattedNumber = formatToE164(phoneNumber);

    // 4. For now, only handle Twilio Native AMD
    if (amdStrategy !== "TWILIO_NATIVE") {
      return NextResponse.json(
        { error: "Only TWILIO_NATIVE strategy is currently supported" },
        { status: 400 }
      );
    }

    // 5. Create initial call record in database
    const callRecord = await prisma.call.create({
      data: {
        userId: user.id,
        phoneNumber: formattedNumber,
        amdStrategy: amdStrategy,
        callStatus: "INITIATED",
        callDirection: "OUTBOUND",
      },
    });

    // 6. Log initiation
    await prisma.callLog.create({
      data: {
        callId: callRecord.id,
        event: "call_initiated",
        message: `Initiating call to ${formattedNumber} with ${amdStrategy}`,
        level: "INFO",
      },
    });

    // 7. Initiate Twilio call with AMD
    const twilioCall = await twilioClient.calls.create({
      from: TWILIO_PHONE_NUMBER,
      to: formattedNumber,
      url: `${BASE_URL}/api/webhooks/twilio/voice`,
      statusCallback: `${BASE_URL}/api/webhooks/twilio/status`,
      statusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
      statusCallbackMethod: "POST",

      // AMD Configuration
      machineDetection: DEFAULT_AMD_CONFIG.machineDetection,
      asyncAmd: "true",
      asyncAmdStatusCallback: `${BASE_URL}/api/webhooks/twilio/amd`,
      asyncAmdStatusCallbackMethod: "POST",
      machineDetectionTimeout: DEFAULT_AMD_CONFIG.machineDetectionTimeout,
      machineDetectionSpeechThreshold: DEFAULT_AMD_CONFIG.machineDetectionSpeechThreshold,
      machineDetectionSpeechEndThreshold: DEFAULT_AMD_CONFIG.machineDetectionSpeechEndThreshold,
      machineDetectionSilenceTimeout: DEFAULT_AMD_CONFIG.machineDetectionSilenceTimeout,
    });

    // 8. Update call record with Twilio SID
    await prisma.call.update({
      where: { id: callRecord.id },
      data: {
        twilioCallSid: twilioCall.sid,
        callStatus: "RINGING",
      },
    });

    // 9. Log Twilio call creation
    await prisma.callLog.create({
      data: {
        callId: callRecord.id,
        event: "twilio_call_created",
        message: `Twilio call SID: ${twilioCall.sid}`,
        level: "INFO",
        metadata: {
          twilioSid: twilioCall.sid,
          status: twilioCall.status,
        },
      },
    });

    // 10. Return success response
    return NextResponse.json({
      success: true,
      callId: callRecord.id,
      twilioCallSid: twilioCall.sid,
      status: twilioCall.status,
      message: "Call initiated successfully",
    });
  } catch (error) {
    console.error("Dial API error:", error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      return NextResponse.json(
        { error: "Failed to initiate call", message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
