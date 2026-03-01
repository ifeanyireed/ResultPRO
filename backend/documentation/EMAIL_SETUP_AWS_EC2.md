# Email Setup Guide for AWS EC2 - Results Pro

**Last Updated:** February 17, 2026  
**Recommended:** Amazon SES (AWS-native, integrated with EC2)

---

## Quick Comparison

| Provider | Pros | Cons | Cost | Setup Time |
|----------|------|------|------|-----------|
| **Amazon SES** | AWS-native, reliable, scalable | Need verified emails | Free tier: 62K/day | 15 min |
| **Gmail SMTP** | Simple, free, familiar | Auth issues, rate limits | Free | 5 min |
| **SendGrid** | Excellent deliverability | External service | $20+/month | 10 min |
| **Mailgun** | Developer-friendly | External service | $35+/month | 10 min |

---

## ⭐ Option 1: Amazon SES (RECOMMENDED)

### Prerequisites
- AWS Account with EC2 instance running
- AWS CLI installed on EC2
- IAM user with SES permissions

### Step 1: Request Production Access
SES starts in "Sandbox Mode" (limited testing). To send to real emails:

```bash
# In AWS Console: SES → Settings → Edit Account Details
# Request production access (takes 1-2 hours)
```

### Step 2: Verify Email Address

```bash
# Via AWS Console (SES → Verified Identities → Verify Email Address)
# OR via AWS CLI:
aws ses verify-email-identity --email-address noreply@resultspro.ng --region us-east-1

# Check verification status:
aws ses list-verified-email-addresses --region us-east-1
```

### Step 3: Create IAM User with SES Permissions

```bash
# AWS Console → IAM → Users → Create user
# Name: results-pro-ses
# Attach policy: AmazonSESFullAccess

# Get Access Key ID and Secret Access Key
```

### Step 4: Install AWS SDK on EC2

```bash
cd /Users/user/Desktop/ResultsPro/backend

# Install AWS SDK
npm install aws-sdk

# Or if using AWS SDK v3:
npm install @aws-sdk/client-ses
```

### Step 5: Update Backend Configuration

Create `.env.production` or update existing with:

```dotenv
# Email Service - Amazon SES
MAIL_SERVICE=aws-ses
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_iam_access_key
AWS_SECRET_ACCESS_KEY=your_iam_secret_key
MAIL_FROM_EMAIL=noreply@resultspro.ng
MAIL_FROM_NAME=Results Pro

# Database - Switch to MySQL on EC2
DB_HOST=your-ec2-private-ip
DB_PORT=3306
DB_USER=resultspro_user
DB_PASSWORD=strong_password_here
DB_NAME=resultspro_db
```

### Step 6: Update Email Service Code

Create `backend/src/config/mail-aws.ts`:

```typescript
import AWS from 'aws-sdk';
import { config } from './environment';

const ses = new AWS.SES({
  region: config.aws.region,
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
});

export async function sendMailViaSES(
  to: string,
  subject: string,
  html: string,
  text?: string
) {
  try {
    const params = {
      Source: `${config.mail.from.name} <${config.mail.from.email}>`,
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: html,
            Charset: 'UTF-8',
          },
          Text: {
            Data: text || html.replace(/<[^>]*>/g, ''),
            Charset: 'UTF-8',
          },
        },
      },
    };

    const result = await ses.sendEmail(params).promise();
    console.log('✓ Email sent via SES:', result.MessageId);
    return result;
  } catch (error) {
    console.error('✗ SES Error:', error);
    throw error;
  }
}
```

### Step 7: Update Main Mail Config

Update `backend/src/config/mail.ts` to use SES on production:

```typescript
import { config } from './environment';

let senderFunc: any;

export function initializeMailer() {
  if (process.env.NODE_ENV === 'production' && config.mail.service === 'aws-ses') {
    // Use AWS SES
    const { sendMailViaSES } = require('./mail-aws');
    senderFunc = sendMailViaSES;
  } else {
    // Use SMTP (Gmail or other)
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: config.mail.host,
      port: config.mail.port,
      secure: config.mail.port === 465,
      auth: {
        user: config.mail.user,
        pass: config.mail.password,
      },
    });
    senderFunc = (to: string, subject: string, html: string) =>
      transporter.sendMail({
        from: `${config.mail.from.name} <${config.mail.from.email}>`,
        to,
        subject,
        html,
      });
  }
}

export async function sendMail(
  to: string,
  subject: string,
  html: string,
  text?: string
) {
  if (!senderFunc) initializeMailer();
  return senderFunc(to, subject, html, text);
}
```

---

## ✅ Option 2: Gmail SMTP (Simple)

### On EC2

```bash
# Create .env on EC2 instance:
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM_NAME=Results Pro
MAIL_FROM_EMAIL=noreply@resultspro.ng
```

### Get Gmail App Password

1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer" (or custom)
3. Copy the generated 16-character password
4. Paste into `MAIL_PASSWORD` above

**Note:** Requires 2FA enabled on Gmail account

---

## 🔧 Option 3: SendGrid

### Step 1: Create SendGrid Account
https://sendgrid.com → Sign up → Create API key

### Step 2: Update .env

```dotenv
MAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.your_api_key_here
MAIL_FROM_EMAIL=noreply@resultspro.ng
MAIL_FROM_NAME=Results Pro
```

### Step 3: Install SendGrid Package

```bash
npm install @sendgrid/mail
```

### Step 4: Update Mail Config

```typescript
import sgMail from '@sendgrid/mail';

if (process.env.MAIL_SERVICE === 'sendgrid') {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');
  
  export async function sendMail(to: string, subject: string, html: string) {
    await sgMail.send({
      to,
      from: process.env.MAIL_FROM_EMAIL || 'noreply@resultspro.ng',
      subject,
      html,
    });
  }
}
```

---

## 🚀 Deployment on EC2

### 1. SSH into EC2

```bash
ssh -i your-key.pem ec2-user@your-instance-ip
```

### 2. Clone and Setup

```bash
cd /home/ec2-user
git clone https://github.com/your-org/resultspro.git
cd resultspro/backend
npm install
```

### 3. Configure Environment

```bash
# Create .env.production
nano .env.production

# Paste your production config:
NODE_ENV=production
PORT=5000
MAIL_SERVICE=aws-ses
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
# ... rest of config
```

### 4. Build and Start

```bash
npm run build
npm start  # or use pm2/systemd

# Or with PM2:
npm install -g pm2
pm2 start dist/server.js --name "results-pro"
pm2 startup
pm2 save
```

### 5. Test Email

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "schoolName":"Test School",
    "email":"test@example.com",
    "phone":"08067028859",
    "fullAddress":"123 Street",
    "state":"Lagos"
  }'
# Should send verification email
```

---

## 📊 AWS SES Quotas & Limits

**Sandbox Mode:**
- 200 emails/day
- Only to verified recipients
- Max 1 email/second

**Production Mode:**
- Unlimited emails/day
- Send to any recipient
- $0.10 per 1,000 emails

**To request production:**
1. AWS Console → SES
2. Settings → Edit Account Details
3. Click "Request Production Access"
4. Explain use case
5. Usually approved within 1-2 hours

---

## 🐛 Troubleshooting

### Email not sending?

```bash
# Check SES sending quota
aws ses get-send-statistics --region us-east-1

# Check verified emails
aws ses list-verified-email-addresses --region us-east-1

# Logs on EC2
tail -f /var/log/syslog | grep nodejs
pm2 logs results-pro
```

### Authentication Error?

```bash
# Verify IAM credentials
aws sts get-caller-identity

# Check SES permissions
aws ses send-email --help  # Should work
```

### From Email Rejected?

```bash
# Make sure sender email is verified
# Not domain verification - actual email address
aws ses verify-email-identity --email-address noreply@resultspro.ng
```

---

## ✅ Testing Checklist

- [ ] AWS IAM user created with SES permissions
- [ ] Email address verified in SES
- [ ] Production access approved (if needed)
- [ ] .env.production created with AWS credentials
- [ ] npm dependencies installed (aws-sdk)
- [ ] Mail config updated for SES
- [ ] Backend built and started
- [ ] Test registration triggers email send
- [ ] Email received in inbox
- [ ] Check SES console for bounce/complaint rates

---

## 📈 Monitoring

### Monitor in AWS Console

```
SES → Sending Statistics
├── Bounces
├── Complaints
├── Delivery Rate
├── Send attempts
└── Reputation metrics
```

### CloudWatch Metrics

```
Configure SNS notifications:
SES → Configuration Sets → Add Configuration Set
→ Add Event Destination (Bounce/Complaint)
→ SNS Topic
→ Get alerts when emails fail
```

---

## 💰 Cost Estimation

- **100K emails/month:** ~$10 (SES)
- **1M emails/month:** ~$100 (SES)
- **Gmail:** Free (but limited/not recommended for production)
- **SendGrid:** $35-100/month depending on volume

---

## 🎯 Recommended Path

1. **Development (Local):** Gmail SMTP with test mode
2. **Testing/Staging:** Gmail SMTP or SES Sandbox
3. **Production:** Amazon SES (production access)

---

## Useful Commands

```bash
# List all verified emails
aws ses list-verified-email-addresses --region us-east-1

# Send test email
aws ses send-email \
  --from noreply@resultspro.ng \
  --to test@example.com \
  --subject "Test" \
  --text "Test email"

# Get send quota
aws ses get-send-quota --region us-east-1

# View bounces
aws ses get-send-statistics --region us-east-1
```

---

**Ready to set up?** Let me know which option you prefer and I can help with the specific implementation!
