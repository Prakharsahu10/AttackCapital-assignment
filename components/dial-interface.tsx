/**
 * Dial Interface Component
 * Form for initiating outbound calls with AMD strategy selection
 */

"use client";

import { useState } from "react";
import { AMDStrategy } from "@/types";

interface DialInterfaceProps {
  onDial?: (phoneNumber: string, strategy: AMDStrategy) => Promise<void>;
}

export function DialInterface({ onDial }: DialInterfaceProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [strategy, setStrategy] = useState<AMDStrategy>("TWILIO_NATIVE");
  const [isDialing, setIsDialing] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const strategies = [
    {
      value: "TWILIO_NATIVE" as const,
      label: "Twilio Native AMD",
      description: "Built-in AMD (~2-3s)",
    },
    {
      value: "JAMBONZ" as const,
      label: "Jambonz SIP AMD",
      description: "Custom SIP-based (~2-4s)",
    },
    {
      value: "HUGGINGFACE" as const,
      label: "Hugging Face ML",
      description: "wav2vec model (~1-2s)",
    },
    {
      value: "GEMINI_FLASH" as const,
      label: "Gemini Flash AI",
      description: "LLM audio analysis (~2-3s)",
    },
  ];

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    if (cleaned.length <= 10) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
    if (cleaned.length <= 11) {
      // Handle 11 digit numbers (e.g., 1-800-XXX-XXXX)
      return `${cleaned.slice(0, 1)}-${cleaned.slice(1, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7, 11)}`;
    }
    // Handle 12-13 digit numbers (e.g., 91-831-873-4852 for India)
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 5)}-${cleaned.slice(5, 8)}-${cleaned.slice(8, 12)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
    setError("");
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, "");
    return cleaned.length >= 10 && cleaned.length <= 13;
  };

  const handleDial = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStatus("");

    if (!validatePhoneNumber(phoneNumber)) {
      setError("Please enter a valid phone number (10-13 digits)");
      return;
    }

    setIsDialing(true);
    setStatus("Initiating call...");

    try {
      const cleanedNumber = phoneNumber.replace(/\D/g, "");
      const formattedNumber =
        cleanedNumber.length === 10 ? `+1${cleanedNumber}` : `+${cleanedNumber}`;

      if (onDial) {
        await onDial(formattedNumber, strategy);
      } else {
        // Default API call
        const response = await fetch("/api/dial", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phoneNumber: formattedNumber,
            amdStrategy: strategy,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to initiate call");
        }

        setStatus(`Call initiated! Call SID: ${data.callSid}`);
        setPhoneNumber("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initiate call");
      setStatus("");
    } finally {
      setIsDialing(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Dial Outbound Call
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Enter a phone number and select an AMD strategy to initiate a call
        </p>
      </div>

      <form onSubmit={handleDial} className="space-y-6">
        {/* Phone Number Input */}
        <div>
          <label
            htmlFor="phoneNumber"
            className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2"
          >
            Phone Number
          </label>
          <input
            type="tel"
            id="phoneNumber"
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder="800-774-2678 or 91-XXX-XXX-XXXX"
            className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
            disabled={isDialing}
            maxLength={17}
          />
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Format: 800-774-2678 (US) or 91-XXX-XXX-XXXX (International)
          </p>
        </div>

        {/* AMD Strategy Selection */}
        <div>
          <label
            htmlFor="strategy"
            className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2"
          >
            AMD Strategy
          </label>
          <select
            id="strategy"
            value={strategy}
            onChange={(e) => setStrategy(e.target.value as AMDStrategy)}
            className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
            disabled={isDialing}
          >
            {strategies.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label} - {s.description}
              </option>
            ))}
          </select>
        </div>

        {/* Test Numbers Helper */}
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            Test Numbers (Voicemail):
          </p>
          <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
            <li>
              • Costco:{" "}
              <button
                type="button"
                onClick={() => setPhoneNumber("800-774-2678")}
                className="underline hover:text-blue-600"
              >
                800-774-2678
              </button>
            </li>
            <li>
              • Nike:{" "}
              <button
                type="button"
                onClick={() => setPhoneNumber("800-806-6453")}
                className="underline hover:text-blue-600"
              >
                800-806-6453
              </button>
            </li>
            <li>
              • PayPal:{" "}
              <button
                type="button"
                onClick={() => setPhoneNumber("888-221-1161")}
                className="underline hover:text-blue-600"
              >
                888-221-1161
              </button>
            </li>
          </ul>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Status Message */}
        {status && (
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-sm text-green-800 dark:text-green-200">{status}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isDialing || !phoneNumber}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          {isDialing ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Dialing...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              Dial Now
            </>
          )}
        </button>
      </form>
    </div>
  );
}
