# Twilio Setup Guide

## Phase 4: Twilio Native AMD Integration

### Prerequisites

1. Twilio account with active phone number
2. Ngrok or public URL for webhooks (development)

---

## Step 1: Get Twilio Credentials

1. **Sign up/Login**: https://www.twilio.com/try-twilio
2. **Get Account SID & Auth Token**:
   - Go to Console Dashboard
   - Copy `Account SID`
   - Copy `Auth Token` (show/hide button)

3. **Get Phone Number**:
   - Go to Phone Numbers → Manage → Active Numbers
   - If none, buy a phone number (use trial credits)
   - Copy the phone number in E.164 format: `+15551234567`

---

## Step 2: Update .env File

Add these to your `.env` file:

```env
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token_here"
TWILIO_PHONE_NUMBER="+15551234567"
NEXT_PUBLIC_APP_URL="https://your-ngrok-url.ngrok.io"
```

---

## Step 3: Expose Local Server (Development)

### Using Ngrok:

```bash
# Install ngrok
npm install -g ngrok

# Start Next.js dev server
npm run dev

# In another terminal, expose port 3000
ngrok http 3000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Update NEXT_PUBLIC_APP_URL in .env
```

---

## Step 4: Configure Webhook URLs (Optional)

If you want to manually set webhooks in Twilio Console:

1. Go to Phone Numbers → Manage → Active Numbers
2. Click your phone number
3. Under "Voice Configuration":
   - **A Call Comes In**: `https://your-url.ngrok.io/api/webhooks/twilio/voice`
   - **HTTP POST**

4. Under "Status Callback URL":
   - URL: `https://your-url.ngrok.io/api/webhooks/twilio/status`
   - HTTP POST

**Note**: The API automatically sets these via the Twilio SDK, so manual config is optional.

---

## Step 5: Test the Integration

### Run the application:

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed test data
npm run db:seed

# Start dev server
npm run dev
```

### Test a call:

1. Login with `test@example.com` / `password123`
2. Enter a test number: `+1-800-774-2678` (Costco - voicemail)
3. Select "Twilio Native AMD"
4. Click "Dial Now"

---

## Webhook URLs Reference

The following webhooks are automatically configured:

| Webhook | URL                           | Purpose                     |
| ------- | ----------------------------- | --------------------------- |
| Voice   | `/api/webhooks/twilio/voice`  | TwiML instructions for call |
| Status  | `/api/webhooks/twilio/status` | Call status updates         |
| AMD     | `/api/webhooks/twilio/amd`    | AMD detection results       |

---

## Testing Numbers

| Company    | Number          | Expected Result |
| ---------- | --------------- | --------------- |
| Costco     | +1-800-774-2678 | Voicemail       |
| Nike       | +1-800-806-6453 | Voicemail       |
| PayPal     | +1-888-221-1161 | Voicemail       |
| Your Phone | Your number     | Human           |

---

## Monitoring

### View Logs in Console:

```bash
# Terminal will show:
✓ Dial API called
✓ Twilio call created: CA123...
✓ Status webhook: ringing
✓ AMD webhook: machine_start
✓ Database updated
```

### View in Prisma Studio:

```bash
npm run db:studio
# Opens http://localhost:5555
# Navigate to "Call" and "CallLog" tables
```

### View in Twilio Console:

- Monitor → Logs → Calls
- See call duration, status, and events

---

## Troubleshooting

### "Missing TWILIO\_\* environment variable"

- Check `.env` file exists
- Restart Next.js server after updating .env

### "Webhook not reached"

- Verify ngrok is running
- Check NEXT_PUBLIC_APP_URL matches ngrok URL
- Ensure ngrok URL is HTTPS

### "Call fails immediately"

- Check phone number format (E.164: +1234567890)
- Verify Twilio account has credits
- Check Twilio Console for error details

### "AMD not detecting"

- AMD takes 2-5 seconds
- Check AMD webhook logs in terminal
- Verify asyncAmd is enabled

---

## Next Steps

After successful Twilio Native AMD:

- ✅ Phase 4 complete
- → Phase 5: Jambonz SIP AMD
- → Phase 6: Hugging Face ML Model
- → Phase 7: Gemini Flash AI

---

**Need Help?**

- Twilio Docs: https://www.twilio.com/docs/voice
- AMD Guide: https://www.twilio.com/docs/voice/answering-machine-detection
