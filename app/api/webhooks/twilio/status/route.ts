import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Map Twilio status to our CallStatus enum
 */
function mapTwilioStatus(twilioStatus: string): string {
  const statusMap: Record<string, string> = {
    queued: "INITIATED",
    initiated: "INITIATED",
    ringing: "RINGING",
    "in-progress": "IN_PROGRESS",
    completed: "COMPLETED",
    busy: "BUSY",
    failed: "FAILED",
    "no-answer": "NO_ANSWER",
    canceled: "CANCELED",
  };

  return statusMap[twilioStatus] || "FAILED";
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const callSid = formData.get("CallSid") as string;
    const callStatus = formData.get("CallStatus") as string;
    const callDuration = formData.get("CallDuration") as string;
    const from = formData.get("From") as string;
    const to = formData.get("To") as string;

    console.log(`Status webhook - CallSid: ${callSid}, Status: ${callStatus}`);

    // Find call record by Twilio SID
    const callRecord = await prisma.call.findUnique({
      where: { twilioCallSid: callSid },
    });

    if (!callRecord) {
      console.error(`Call record not found for SID: ${callSid}`);
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    // Map status
    const mappedStatus = mapTwilioStatus(callStatus);

    // Update call record
    const updateData: {
      callStatus: string;
      twilioStatus: string;
      duration?: number;
      answeredAt?: Date;
      endedAt?: Date;
    } = {
      
      callStatus: mappedStatus,
      twilioStatus: callStatus,
    };

    // Add duration if completed
    if (callDuration) {
      updateData.duration = parseInt(callDuration, 10);
    }

    // Add timestamps
    if (callStatus === "in-progress" && !callRecord.answeredAt) {
      updateData.answeredAt = new Date();
    }
    if (["completed", "failed", "busy", "no-answer", "canceled"].includes(callStatus)) {
      updateData.endedAt = new Date();
    }

    await prisma.call.update({
      where: { id: callRecord.id },
      data: updateData,
    });

    // Log status change
    await prisma.callLog.create({
      data: {
        callId: callRecord.id,
        event: `call_status_${callStatus}`,
        message: `Call status changed to ${callStatus}`,
        level: "INFO",
        metadata: {
          callSid,
          from,
          to,
          duration: callDuration,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Status webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
