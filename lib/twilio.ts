import twilio from "twilio";

// Validate environment variables
if (!process.env.TWILIO_ACCOUNT_SID) {
  throw new Error("Missing TWILIO_ACCOUNT_SID environment variable");
}
if (!process.env.TWILIO_AUTH_TOKEN) {
  throw new Error("Missing TWILIO_AUTH_TOKEN environment variable");
}
if (!process.env.TWILIO_PHONE_NUMBER) {
  throw new Error("Missing TWILIO_PHONE_NUMBER environment variable");
}

/**
 * Twilio client instance
 */
export const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

/**
 * Twilio phone number (caller ID)
 */
export const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

/**
 * Base URL for webhooks
 */
export const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export function validatePhoneNumber(phoneNumber: string): boolean {
  // E.164 format: +[country code][number]
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phoneNumber);
}

// Format phone number to E.164
export function formatToE164(phoneNumber: string): string {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, "");

  // Add +1 for US/Canada numbers if not present
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }

  // Add + if not present
  if (!phoneNumber.startsWith("+")) {
    return `+${cleaned}`;
  }

  return `+${cleaned}`;
}

/**
 * Twilio AMD configuration options
 */
export interface TwilioAMDConfig {
  machineDetection?: "Enable" | "DetectMessageEnd";
  asyncAmd?: boolean;
  asyncAmdStatusCallback?: string;
  machineDetectionTimeout?: number; // seconds
  machineDetectionSpeechThreshold?: number; // milliseconds
  machineDetectionSpeechEndThreshold?: number; // milliseconds
  machineDetectionSilenceTimeout?: number; // milliseconds
}

/**
 * Default AMD configuration for optimal detection
 */
export const DEFAULT_AMD_CONFIG: TwilioAMDConfig = {
  machineDetection: "Enable",
  asyncAmd: true,
  machineDetectionTimeout: 30,
  machineDetectionSpeechThreshold: 2400,
  machineDetectionSpeechEndThreshold: 1200,
  machineDetectionSilenceTimeout: 5000,
};
