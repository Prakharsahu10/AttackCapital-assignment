/**
 * Twilio AMD (Answering Machine Detection) Webhook
 * Handles AMD results from Twilio
 * POST /api/webhooks/twilio/amd
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Map Twilio AMD result to our AMDResult enum
 */
function mapAMDResult(answeredBy: string): string {
  const resultMap: Record<string, string> = {
    human: "HUMAN",
    machine_start: "MACHINE",
    machine_end_beep: "VOICEMAIL",
    machine_end_silence: "MACHINE",
    machine_end_other: "MACHINE",
    fax: "FAX",
    unknown: "UNKNOWN",
  };

  return resultMap[answeredBy] || "UNKNOWN";
}

/**
 * Calculate detection confidence based on Twilio's result
 */
function calculateConfidence(answeredBy: string, duration?: number): number {
  // Twilio native AMD confidence estimates
  const confidenceMap: Record<string, number> = {
    human: 0.85,
    machine_start: 0.8,
    machine_end_beep: 0.9,
    machine_end_silence: 0.75,
    machine_end_other: 0.7,
    fax: 0.95,
    unknown: 0.5,
  };

  let baseConfidence = confidenceMap[answeredBy] || 0.5;

  // Adjust confidence based on detection speed
  if (duration && duration < 3000) {
    baseConfidence += 0.05; // Quick detection is more confident
  }

  return Math.min(baseConfidence, 1.0);
}

/**
 * POST /api/webhooks/twilio/amd
 * Processes AMD detection results
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const callSid = formData.get("CallSid") as string;
    const answeredBy = formData.get("AnsweredBy") as string;
    const machineDetectionDuration = formData.get("MachineDetectionDuration") as string;
    const callStatus = formData.get("CallStatus") as string;

    console.log(`AMD webhook - CallSid: ${callSid}, AnsweredBy: ${answeredBy}`);

    // Find call record
    const callRecord = await prisma.call.findUnique({
      where: { twilioCallSid: callSid },
    });

    if (!callRecord) {
      console.error(`Call record not found for SID: ${callSid}`);
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    // Map AMD result
    const amdResult = mapAMDResult(answeredBy);
    const detectionLatency = machineDetectionDuration
      ? parseInt(machineDetectionDuration, 10)
      : null;
    const confidence = calculateConfidence(answeredBy, detectionLatency || undefined);

    // Update call record with AMD results
    await prisma.call.update({
      where: { id: callRecord.id },
      data: {
        amdResult,
        confidence,
        detectionLatency,
        metadata: {
          twilioAnsweredBy: answeredBy,
          twilioDetectionDuration: detectionLatency,
          callStatus,
        },
      },
    });

    // Log AMD detection
    await prisma.callLog.create({
      data: {
        callId: callRecord.id,
        event: "amd_detected",
        message: `AMD detected: ${amdResult} (${answeredBy}) with ${(confidence * 100).toFixed(0)}% confidence`,
        level: "INFO",
        metadata: {
          answeredBy,
          amdResult,
          confidence,
          detectionLatency,
        },
      },
    });

    // Log decision based on result
    if (amdResult === "HUMAN") {
      await prisma.callLog.create({
        data: {
          callId: callRecord.id,
          event: "human_detected",
          message: "Human detected - continuing call",
          level: "INFO",
        },
      });
    } else {
      await prisma.callLog.create({
        data: {
          callId: callRecord.id,
          event: "machine_detected",
          message: `Machine/Voicemail detected - ${amdResult}`,
          level: "INFO",
        },
      });
    }

    console.log(
      `AMD Result: ${amdResult}, Confidence: ${confidence}, Latency: ${detectionLatency}ms`
    );

    return NextResponse.json({
      success: true,
      amdResult,
      confidence,
      detectionLatency,
    });
  } catch (error) {
    console.error("AMD webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
