import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const callSid = formData.get("CallSid") as string;
    const callStatus = formData.get("CallStatus") as string;

    console.log(`Voice webhook - CallSid: ${callSid}, Status: ${callStatus}`);

    // Generate TwiML response
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Hello! This is a test call from the A M D detection system.</Say>
  <Pause length="2"/>
  <Say voice="alice">If you can hear this message, the call was successfully connected to a human.</Say>
  <Pause length="1"/>
  <Say voice="alice">Thank you for participating in this test. Goodbye!</Say>
</Response>`;

    return new NextResponse(twiml, {
      headers: {
        "Content-Type": "text/xml",
      },
    });
  } catch (error) {
    console.error("Voice webhook error:", error);

    // Return error TwiML
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">An error occurred. Goodbye.</Say>
  <Hangup/>
</Response>`;

    return new NextResponse(errorTwiml, {
      status: 500,
      headers: {
        "Content-Type": "text/xml",
      },
    });
  }
}
