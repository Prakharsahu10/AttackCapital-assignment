# 📞 AMD System - Answering Machine Detection

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748?style=for-the-badge&logo=prisma)
![Twilio](https://img.shields.io/badge/Twilio-API-red?style=for-the-badge&logo=twilio)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)

**Intelligent call detection system testing 4 AMD strategies**

[Live Demo](#) • [Report Bug](https://github.com/Prakharsahu10/AttackCapital-assignment/issues) • [Request Feature](https://github.com/Prakharsahu10/AttackCapital-assignment/issues)

</div>

---

## 🎯 Project Overview

A comprehensive **Answering Machine Detection (AMD)** system built with Next.js 14+ that compares 4 different AMD strategies to detect whether a call is answered by a human or machine. Built as part of the Attack Capital technical assignment.

### ✨ Key Features

- 🚀 **4 AMD Strategies**: Twilio Native, Jambonz SIP, Hugging Face ML, Gemini Flash AI
- 📊 **Real-time Dashboard**: Live call monitoring with stats and history
- 🔐 **Authentication System**: Secure user registration and login
- 📞 **Twilio Integration**: Full webhook support for call status and AMD detection
- 💾 **SQLite Database**: Prisma ORM with complete call logging
- 🎨 **Modern UI**: Responsive design with dark mode support
- 📈 **Analytics**: Confidence scores, latency metrics, and detection accuracy

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js Frontend                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Dashboard   │  │ Dial Interface│  │ Call History │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js API Routes                        │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────────┐   │
│  │   Auth   │  │   Dial   │  │  Twilio Webhooks       │   │
│  │  Routes  │  │   API    │  │  (Voice/Status/AMD)    │   │
│  └──────────┘  └──────────┘  └────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
┌──────────────┐  ┌──────────┐  ┌──────────────┐
│   Prisma     │  │  Twilio  │  │   Cloudflare │
│   (SQLite)   │  │    API   │  │    Tunnel    │
└──────────────┘  └──────────┘  └──────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Twilio account with phone number
- Git for version control

### Installation

```bash
# Clone the repository
git clone https://github.com/Prakharsahu10/AttackCapital-assignment.git
cd AttackCapital-assignment

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Twilio credentials

# Set up database
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# Start development server
npm run dev
```

### Environment Setup

Create a `.env` file with:

```env
# Database
DATABASE_URL="file:./dev.db"

# Authentication
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# Twilio (Required for Phase 4)
TWILIO_ACCOUNT_SID="your_account_sid"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_PHONE_NUMBER="+1234567890"

# App Config
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### Running with Webhooks

For Twilio webhooks to work, you need a public URL:

```bash
# Start Cloudflare tunnel
.\start-tunnel.ps1

# Update .env with the tunnel URL
NEXT_PUBLIC_APP_URL="https://your-tunnel.trycloudflare.com"

# Restart dev server
npm run dev
```

---

## 📦 Tech Stack

### Frontend

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Custom React components
- **State Management**: React Hooks

### Backend

- **API**: Next.js API Routes
- **Database**: SQLite
- **ORM**: Prisma
- **Authentication**: Custom auth with bcryptjs
- **Validation**: Zod

### Integrations

- **Telephony**: Twilio Voice API
- **Tunneling**: Cloudflare Tunnel
- **Version Control**: Git + GitHub

---

## 🎨 Features Implemented

### ✅ Phase 1: Initial Setup

- Next.js 14+ project with TypeScript
- Tailwind CSS v4 configuration
- ESLint & Prettier setup
- Git repository initialization

### ✅ Phase 2: Database & Authentication

- Prisma schema design (User, Session, Call, CallLog)
- SQLite database setup
- Custom authentication system
- Session management with JWT

### ✅ Phase 3: UI Components

- Dashboard with stats cards
- Dial interface with phone number formatting
- Call history table with filtering
- Login and signup pages
- Dark mode support

### ✅ Phase 4: Twilio Native AMD

- Twilio Voice API integration
- AMD configuration with async callbacks
- Three webhook handlers:
  - Voice webhook (TwiML instructions)
  - Status webhook (call updates)
  - AMD webhook (detection results)
- Real-time call status updates
- Database logging and analytics

---

## 🗄️ Database Schema

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  calls     Call[]
  sessions  Session[]
}

model Call {
  id                String       @id @default(cuid())
  userId            String
  phoneNumber       String
  amdStrategy       AMDStrategy
  amdResult         AMDResult?
  confidence        Float?
  detectionLatency  Int?
  callStatus        CallStatus
  twilioCallSid     String?      @unique
  duration          Int
  logs              CallLog[]
  createdAt         DateTime     @default(now())
}

enum AMDStrategy {
  TWILIO_NATIVE
  JAMBONZ
  HUGGINGFACE
  GEMINI_FLASH
}

enum AMDResult {
  HUMAN
  MACHINE
  VOICEMAIL
  FAX
  UNKNOWN
}
```

---

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/signin` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signout` - User logout

### Calls

- `POST /api/dial` - Initiate outbound call with AMD

### Webhooks (Twilio)

- `POST /api/webhooks/twilio/voice` - TwiML voice instructions
- `POST /api/webhooks/twilio/status` - Call status updates
- `POST /api/webhooks/twilio/amd` - AMD detection results

---

## 📊 AMD Strategies

| Strategy            | Status      | Latency | Accuracy  | Cost   |
| ------------------- | ----------- | ------- | --------- | ------ |
| **Twilio Native**   | ✅ Complete | ~2-3s   | High      | Low    |
| **Jambonz SIP**     | 🔜 Planned  | ~2-4s   | High      | Medium |
| **Hugging Face ML** | 🔜 Planned  | ~1-2s   | Very High | Medium |
| **Gemini Flash AI** | 🔜 Planned  | ~2-3s   | Very High | High   |

---

## 🎯 Roadmap

- [x] Phase 1: Project Setup
- [x] Phase 2: Database & Authentication
- [x] Phase 3: UI Components
- [x] Phase 4: Twilio Native AMD
- [ ] Phase 5: Gemini Flash AMD
- [ ] Phase 6: Hugging Face ML AMD
- [ ] Phase 7: Jambonz SIP AMD
- [ ] Phase 8: Comparison Dashboard
- [ ] Phase 9: Video Demo

---

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run migrations
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format with Prettier
```

### Git Workflow

Each feature is developed in a separate branch:

```bash
# Feature branches
feat/database-auth-setup
feat/ui-components
feat/twilio-native-amd
feat/gemini-flash-amd
feat/huggingface-amd
feat/jambonz-amd
```

---

## 📝 Testing

### Test Credentials

```
Email: test@example.com
Password: password123
```

### Verified Numbers

For Twilio trial accounts, verify your phone number at:
https://console.twilio.com/us1/develop/phone-numbers/manage/verified

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is part of the Attack Capital technical assignment.

---

## 👨‍💻 Author

**Prakhar Sahu**

- GitHub: [@Prakharsahu10](https://github.com/Prakharsahu10)
- Repository: [AttackCapital-assignment](https://github.com/Prakharsahu10/AttackCapital-assignment)

---

## 🙏 Acknowledgments

- [Attack Capital](https://attackcapital.com) for the assignment
- [Twilio](https://www.twilio.com) for Voice API
- [Vercel](https://vercel.com) for Next.js framework
- [Prisma](https://www.prisma.io) for database ORM

---

<div align="center">

**Built with ❤️ using Next.js, TypeScript, and Twilio**

⭐ Star this repo if you find it helpful!

</div>
