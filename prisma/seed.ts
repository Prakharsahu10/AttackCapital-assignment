/**
 * Seeds the database with initial data for development
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create test user
  const hashedPassword = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      email: "test@example.com",
      name: "Test User",
      password: hashedPassword,
    },
  });

  console.log("✅ Created test user:", user.email);

  // Create sample calls for testing
  const sampleCalls = [
    {
      userId: user.id,
      phoneNumber: "+18007742678", // Costco
      amdStrategy: "TWILIO_NATIVE" as const,
      amdResult: "MACHINE" as const,
      callStatus: "COMPLETED" as const,
      confidence: 0.89,
      duration: 12,
      detectionLatency: 2800,
    },
    {
      userId: user.id,
      phoneNumber: "+18008066453", // Nike
      amdStrategy: "GEMINI_FLASH" as const,
      amdResult: "VOICEMAIL" as const,
      callStatus: "COMPLETED" as const,
      confidence: 0.95,
      duration: 15,
      detectionLatency: 2100,
    },
    {
      userId: user.id,
      phoneNumber: "+18882211161", // PayPal
      amdStrategy: "HUGGINGFACE" as const,
      amdResult: "MACHINE" as const,
      callStatus: "COMPLETED" as const,
      confidence: 0.92,
      duration: 10,
      detectionLatency: 1500,
    },
  ];

  for (const call of sampleCalls) {
    await prisma.call.create({
      data: call,
    });
  }

  console.log(`✅ Created ${sampleCalls.length} sample calls`);
  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
