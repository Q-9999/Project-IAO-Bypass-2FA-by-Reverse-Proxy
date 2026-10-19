# Northgate — Secure Authentication App

A small full-stack authentication project built with Node.js and Express, with registration, email verification, OTP login, password reset, and a protected dashboard.

## 1) Tools, apps and services used in this project

### Core app stack
- Node.js 18+
- Express.js
- JavaScript (server + frontend pages)
- HTML + CSS + vanilla JS
- bcryptjs for password hashing
- Nodemailer for sending emails
- Helmet + express-rate-limit for security

### Email and testing services
- Mailtrap: used for testing email sending locally in a safe sandbox environment
- Gmail SMTP: can also be used as a real SMTP provider for development/testing
- SMTP providers in general: SendGrid, Postmail, Brevo, Mailgun, etc. are compatible as long as SMTP credentials are configured

### Deployment / hosting
- Render: recommended platform to deploy the web app
- Nginx/Caddy: can be placed behind a reverse proxy in production
- Local environment: VS Code + terminal + browser

### Other useful tools
- Postman or Thunder Client: to test API endpoints manually
- Git + GitHub: for version control
- .env files: store environment variables securely

---

## 2) Project overview

This app allows users to:
- register an account
- verify email using an OTP code
- log in with username/email + password, then confirm via email OTP
- reset password by email
- access a protected dashboard after login
- log out and clear the session securely

The app works without any external database server for local use. It stores data in a local file under the `data/` folder, which is convenient for quick development and demo purposes.

---

## 3) Folder structure

```bash
secure-auth-app/
├─ public/
│  ├─ login.html
│  ├─ register.html
│  ├─ forgot.html
│  ├─ dashboard.html
│  └─ assets/
│     ├─ login.js
│     ├─ register.js
│     ├─ forgot.js
│     ├─ dashboard.js
│     ├─ app.js
│     └─ style.css
├─ src/
│  ├─ app.js
│  ├─ config.js
│  ├─ db.js
│  ├─ mailer.js
│  ├─ otp.js
│  ├─ server.js
│  ├─ sessions.js
│  └─ util.js
├─ data/
│  └─ app.db
├─ test/
│  └─ smoke.js
├─ .env.example
├─ package.json
├─ README.md
└─ migrations/
   └─ 001_init.sql
```

---

## 4) Required installation

### Prerequisites
- Node.js 18 or newer
- npm
- Git

### Install dependencies

```bash
npm install
```

### Environment variables
Create a `.env` file from the example:

```bash
copy .env.example .env
```

On Linux/macOS:

```bash
cp .env.example .env
```

Then configure the environment variables:

```env
NODE_ENV=development
PORT=3000
APP_NAME=Northgate
SESSION_SECRET=your_very_long_random_secret_here
DATABASE_PATH=./data/app.db
TRUST_PROXY=false

SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=your_mailtrap_user
SMTP_PASS=your_mailtrap_password
MAIL_FROM="Northgate <noreply@example.com>"
```

### Important note about `SESSION_SECRET`
This value must be at least 32 characters long. Generate one with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Then paste the result into `.env`.

---

## 5) How to run the project locally

Start the server:

```bash
npm start
```

Or run in watch mode during development:

```bash
npm run dev
```

Open in browser:

```text
http://localhost:3000
```

You can access:
- `/login`
- `/register`
- `/forgot`
- `/dashboard`

---

## 6) How the app works

### A. User registration flow
1. User enters username, email, password, and confirm password.
2. The system checks whether username/email is already used.
3. The server sends a one-time verification code to the email.
4. User enters the code to verify the email.
5. Password is hashed with bcrypt and stored.
6. The account becomes active.

### B. Login flow
1. User enters username/email + password.
2. The app checks the password.
3. If correct, it sends a one-time login code to the registered email.
4. User enters the login OTP.
5. The server creates a session cookie and redirects to the dashboard.

### C. Forgot password flow
1. User enters their email.
2. The app checks whether the email exists.
3. If yes, it sends a reset code.
4. User enters the code and a new password.
5. Password is updated and active sessions are cleared.

### D. Dashboard protection
The dashboard requires an authenticated session. If no valid cookie is present, the user is redirected to login.

---

## 7) Email setup and mail services

### Local testing with Mailtrap
Mailtrap is ideal for development because it captures all sent emails without delivering them to real recipients.

Example config:

```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=your_mailtrap_user
SMTP_PASS=your_mailtrap_password
MAIL_FROM="Northgate <demo@mailtrap.io>"
```

Then:
- open the register page
- create an account
- click send verification code
- check your Mailtrap inbox

### Using Gmail or other SMTP providers
You can also use Gmail or any SMTP provider by setting:
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `MAIL_FROM`

For Gmail, use an App Password if 2-Step Verification is enabled.

### Important note
If SMTP variables are not configured correctly, the app will not be able to send OTP emails. The server will warn that email delivery is not configured.

---

## 8) Security notes and important warnings

This project has some safety measures already implemented:
- Passwords are hashed using bcryptjs
- OTP codes are time-limited and single-use
- Login attempts are limited
- Session IDs are stored server-side and only a hash is kept
- Cookies are `httpOnly` and `SameSite=Lax`
- Rate limiting is applied to authentication endpoints
- Helmet is enabled for HTTP security headers
- Same-origin checks are used to reduce CSRF-like abuse

### Caution
- Do not commit `.env` to Git
- Do not share `SESSION_SECRET`
- Do not use a weak or public secret in production
- In production, use HTTPS and set `NODE_ENV=production`
- `TRUST_PROXY=true` should only be enabled when the app is behind Nginx, Render, or a reverse proxy

---

## 9) Production deployment

### Recommended hosting
The app is suitable for deployment on Render.

A typical deployment setup on Render:
- Build command: `npm install`
- Start command: `npm start`
- Add all environment variables in the Render dashboard
- Set `NODE_ENV=production`
- Set `TRUST_PROXY=true` if Render is terminating TLS in front of the app

### Important deployment warning
This app stores data locally in the `data/` folder. That is fine for local development, but for production hosting like Render, the filesystem may be ephemeral. If the app restarts, data may reset unless the storage is persisted.

For production, the recommended setup is:
- keep the app on a persistent disk, or
- move the database to a more reliable external database, or
- make sure backups are taken regularly

### Production mail setup
For real deployment, use a real SMTP provider such as:
- Gmail
- SendGrid
- Mailgun
- Brevo
- Mailtrap for testing only

---

## 10) Running tests

```bash
npm test
```

The smoke test checks the main authentication flow:
- register
- send code
- verify OTP
- login
- access dashboard
- logout
- invalid and reused code scenarios

This helps confirm the app logic is working without needing a real email provider in the local test environment.

---

## 11) Practical notes for this project

- This project is a good example of secure authentication flow for learning and demonstration.
- It is simple and lightweight, which makes it easy to understand.
- Mail delivery is one of the most important parts: without SMTP config, the app cannot send verification codes.
- For actual production use, make sure you harden the setup and choose persistent storage + real SMTP credentials.
- The app is designed to be easy to run locally and easy to deploy on platforms like Render.

---

## 12) Quick start summary

```bash
npm install
# edit .env with your secret and SMTP settings
npm start
```

Then open:

```text
http://localhost:3000/register
```

---

## 13) Summary of used services

- Mail: Mailtrap for testing, Gmail/SMTP for real sending
- Web app host: Render (recommended)
- Backend: Node.js + Express
- Frontend: HTML/CSS/JS
- Storage: local file-based data store in `data/`
- Security: bcrypt, rate limiting, HTTP cookies, session hashing, OTP

This project is a complete sample of a secure login/registration system using email OTP and server-side protected routes.
