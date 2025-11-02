/**
 * AMD Strategy Types
 */
export type AMDStrategy = "TWILIO_NATIVE" | "JAMBONZ" | "HUGGINGFACE" | "GEMINI_FLASH";

/**
 * Call Status Types
 */
export type CallStatus =
  | "INITIATED"
  | "RINGING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "FAILED"
  | "BUSY"
  | "NO_ANSWER"
  | "CANCELED";

/**
 * AMD Detection Result
 */
export type AMDResult = "HUMAN" | "MACHINE" | "VOICEMAIL" | "FAX" | "UNKNOWN";

/**
 * Call Direction
 */
export type CallDirection = "INBOUND" | "OUTBOUND";

/**
 * Call Record Interface
 */
export interface CallRecord {
  id: string;
  userId: string;
  phoneNumber: string;
  amdStrategy: AMDStrategy;
  amdResult: AMDResult;
  callStatus: CallStatus;
  callDirection: CallDirection;
  duration: number; // in seconds
  twilioCallSid?: string;
  confidence?: number; // 0-1
  detectionLatency?: number; // in milliseconds
  errorMessage?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User Interface
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Dial Request Schema
 */
export interface DialRequest {
  phoneNumber: string;
  amdStrategy: AMDStrategy;
}

/**
 * AMD Detection Config
 */
export interface AMDConfig {
  timeout?: number; // milliseconds
  threshold?: number; // confidence threshold
  maxRetries?: number;
}

/**
 * Webhook Event Types
 */
export interface TwilioWebhookEvent {
  CallSid: string;
  CallStatus: string;
  From: string;
  To: string;
  Direction: string;
  AnsweredBy?: string;
  AnsweringMachineDetectionStatus?: "human" | "machine_start" | "machine_end_beep" | "fax";
  [key: string]: unknown;
}

/**
 * Jambonz Webhook Event
 */
export interface JambonzWebhookEvent {
  call_sid: string;
  event: "amd_human_detected" | "amd_machine_detected" | "call_status";
  data?: Record<string, unknown>;
}

/**
 * AMD Strategy Interface (Factory Pattern)
 */
export interface IAMDStrategy {
  detect(audioBuffer: Buffer, config?: AMDConfig): Promise<AMDDetectionResult>;
  getName(): AMDStrategy;
}

/**
 * AMD Detection Result
 */
export interface AMDDetectionResult {
  result: AMDResult;
  confidence: number;
  latency: number; // milliseconds
  metadata?: Record<string, unknown>;
}
