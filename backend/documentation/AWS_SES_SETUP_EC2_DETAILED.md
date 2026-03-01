# AWS SES Setup Guide for EC2 Deployment

**Last Updated:** February 17, 2026  
**Status:** Production Ready

---

## 📋 Prerequisites

- ✅ AWS Account
- ✅ EC2 instance running Amazon Linux or Ubuntu
- ✅ IAM user with SES permissions or root AWS access
- ✅ Verified domain or email for sending

---

## Step 1️⃣ Create IAM User with SES Permissions

### In AWS Console:

1. Go to **IAM** → **Users**
2. Click **Create user**
3. **User name:** `results-pro-ses`
4. Click **Next**
5. Set **Permissions:**
   - Click **Attach policies directly**
   - Search for: `AmazonSESFullAccess`
   - Check it
   - (Optional) Add `AmazonS3FullAccess` if using S3 uploads
6. Click **Create user**

### Get Access Keys:

1. Go to **IAM** → **Users** → **`results-pro-ses`**
2. Click **Security credentials** tab
3. Scroll down to **Access keys**
4. Click **Create access key**
5. Choose **Application running outside AWS**
6. Copy:
   - **Access Key ID:** `AKIA...`
   - **Secret Access Key:** `wJalr...` (save securely in 1Password/vault)

⚠️ **DO NOT share these keys publicly!**

---

## Step 2️⃣ Verify Sender Email in AWS SES

SES starts in **Sandbox Mode** - you can only send to verified email addresses.

### Verify Your Email:

1. Go to **SES** → **Verified identities**
2. Click **Create identity**
3. Choose: **Email address**
4. Enter: `noreply@resultspro.ng`
5. Click **Create identity**
6. **Check your email** inbox/spam folder
7. Click verification link
8. ✓ Email is now verified

### Alternative: Verify Domain

For production with many recipients:

1. Go to **SES** → **Verified identities**
2. Click **Create identity**
3. Choose: **Domain**
4. Enter: `resultspro.ng`
5. Add CNAME records to your DNS:
   - Provider: Route 53, Namecheap, GoDaddy, etc.
   - Add the records shown in SES console
6. Wait for DNS to update (can take 24 hours)
7. ✓ Domain verified

---

## Step 3️⃣ Request Production Access

By default, SES has these limits in **Sandbox Mode:**
- **Daily limit:** 200 emails
- **Send rate:** 1 email/second
- **Recipients:** Only verified addresses

To send unlimited emails to any recipient:

1. Go to **SES** → **Settings**
2. Click **Edit account details**
3. Scroll to **Sandbox status**
4. Click **Request production access**
5. Fill in the form:
   - **Use Case:** `School Results Management System - Email Verification & Notifications`
   - **Website:** `https://resultspro.ng`
   - **Typical Volume:** `100-500 per day`
   - **Bounce/Complaint Handling:** `Monitor via CloudWatch`
6. Submit
7. ✓ Usually approved within 1-2 hours (sometimes immediate)

---

## Step 4️⃣ Update EC2 Environment

SSH to your EC2 instance and update `.env`:

```bash
# SSH to EC2
ssh -i ~/myAppKey.pem ec2-user@your-instance-ip

# Edit .env
cd /home/ec2-user/resultspro/backend
nano .env
```

Replace with your values:

```dotenv
# Email Service - AWS SES (PRODUCTION)
MAIL_SERVICE=aws-ses
MAIL_FROM_NAME=Results Pro
MAIL_FROM_EMAIL=noreply@resultspro.ng

# AWS Credentials
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA1234567890ABCDEF
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG+39DKWJ0+EXAMPLEKEY
```

**Save:** Ctrl+X, Y, Enter

---

## Step 5️⃣ Test Email Configuration

### Option A: Test via CLI

```bash
# In EC2 terminal:
cd /home/ec2-user/resultspro/backend

# Start server
npm start

# In another terminal, test registration:
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "schoolName":"Test School",
    "email":"admin@testschool.com",
    "phone":"08067028859",
    "fullAddress":"123 Test Street",
    "state":"Lagos"
  }'

# Check SES console for delivery status
```

### Option B: Test via Node Script

```bash
# Create test-email.js in backend directory:
cat > test-email.js << 'EOF'
import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

const ses = new AWS.SES({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

async function testEmail() {
  try {
    const params = {
      Source: `Results Pro <noreply@resultspro.ng>`,
      Destination: {
        ToAddresses: ['your-email@gmail.com'],
      },
      Message: {
        Subject: {
          Data: 'Test Email from AWS SES',
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: '<h1>Hello!</h1><p>This is a test email from Results Pro</p>',
            Charset: 'UTF-8',
          },
        },
      },
    };

    const result = await ses.sendEmail(params).promise();
    console.log('✓ Email sent! MessageId:', result.MessageId);
  } catch (error) {
    console.error('✗ Error:', error.message);
  }
}

testEmail();
EOF

# Run test:
node test-email.js
```

### ✅ Success Indicators:
- No error message in terminal
- Message received in inbox (check spam folder)
- SES console shows **Delivery: 1**

---

## 🔍 Monitor Email Delivery

### View Statistics in AWS Console:

1. Go to **SES** → **Sending Statistics**
2. See:
   - **Sends:** Total emails sent
   - **Delivery:** Successfully delivered
   - **Bounces:** Invalid email addresses
   - **Complaints:** Users marked as spam
   - **Rejections:** Technical errors

### Check Logs on EC2:

```bash
# View server logs
sudo journalctl -u resultspro-backend -f

# Or if using direct npm start:
tail -f /var/log/resultspro/app.log
```

### CloudWatch Monitoring (Optional):

1. Go to **CloudWatch** → **Dashboards**
2. Create dashboard
3. Add widgets for:
   - `AWS/SES` → `Send`
   - `AWS/SES` → `Delivery`
   - `AWS/SES` → `Bounce`
   - `AWS/SES` → `Complaint`

---

## 🐛 Troubleshooting

### Email Not Sending

**Error:** `MessageRejected`
- ✓ Check if sender email is verified: `aws ses list-verified-email-addresses --region us-east-1`
- ✓ If not verified, go to SES → Verified identities → Create identity

**Error:** `ConfigurationSetDoesNotExist`
- ✓ Remove any configuration set references from code

**Error:** `User: arn:aws:iam::... is not authorized`
- ✓ Check IAM user has `AmazonSESFullAccess` policy
- ✓ Try regenerating access keys

### High Bounce Rate

**Symptoms:**
- Emails sent but not delivered
- SES shows bounces in statistics

**Causes & Fixes:**
1. **Invalid email addresses in database:**
   ```bash
   # Check for invalid emails:
   sqlite3 backend/resultspro.db "SELECT email FROM SchoolAdminUsers WHERE email LIKE '%invalid%' OR email NOT LIKE '%@%';"
   ```

2. **Domain reputation issues:**
   - Check SES console for complaint rate
   - Set up DKIM signing: SES → Verified identities → Email address → DKIM settings
   - Add SPF and DMARC records to your domain DNS

3. **Send rate too high:**
   - SES rate limit: 14 emails/second in production
   - Implement rate limiting in backend

---

## 📊 Cost Estimation

| Volume | Monthly Cost |
|--------|-------------|
| 100K emails | ~$10 |
| 500K emails | ~$50 |
| 1M emails | ~$100 |

**Free tier:** 62,000 emails/day for first 12 months

---

## 🔐 Best Practices

1. **Rotate credentials periodically:**
   ```bash
   # In AWS console:
   # Create new access key → Update .env → Delete old key → Restart
   ```

2. **Monitor bounce/complaint rates:**
   - Keep below 5% bounce rate
   - Keep below 0.1% complaint rate
   - SES may temporarily disable sending if rates are too high

3. **Setup SPF/DKIM/DMARC:**
   ```
   # Add to domain DNS:
   
   # SPF (Sender Policy Framework)
   v=spf1 include:amazonses.com ~all
   
   # DKIM is auto-generated by SES
   # See SES console for CNAME records
   
   # DMARC (optional but recommended)
   v=DMARC1; p=quarantine; rua=mailto:admin@resultspro.ng
   ```

4. **Implement unsubscribe links:**
   ```html
   <p><a href="https://resultspro.ng/unsubscribe?email={{email}}">
     Unsubscribe from emails
   </a></p>
   ```

5. **Log all emails sent:**
   - Enable SES event publishing to CloudWatch
   - Helps debug delivery issues

---

## ✅ Verification Checklist

- [ ] IAM user `results-pro-ses` created
- [ ] Access Key ID saved securely
- [ ] Secret Access Key saved securely
- [ ] Email address verified in SES
- [ ] Production access requested (wait for approval)
- [ ] `.env` updated with AWS credentials
- [ ] Backend rebuilt and deployed to EC2
- [ ] Test email sent successfully
- [ ] Email received in inbox
- [ ] No bounces or errors in SES console
- [ ] Monitoring setup (optional)
- [ ] SPF/DKIM/DMARC records added (optional)

---

## 🚀 Next Steps

After SES is working:

1. **Setup MySQL on EC2:**
   ```bash
   ssh -i ~/myAppKey.pem ec2-user@your-instance-ip
   sudo apt-get update
   sudo apt-get install -y mysql-server
   sudo mysql -e "CREATE DATABASE resultspro_db;"
   ```

2. **Setup Nginx reverse proxy:**
   ```bash
   sudo apt-get install -y nginx
   # Configure SSL with Let's Encrypt
   ```

3. **Monitor application health:**
   - CloudWatch dashboards
   - Email sending metrics
   - Database performance

---

## 📞 AWS SES Support

- **AWS Console:** https://console.aws.amazon.com/ses
- **SES Quota:** https://console.aws.amazon.com/ses#/account
- **AWS Documentation:** https://docs.aws.amazon.com/ses/
- **Support Plan:** Create support case in AWS console if issues arise

---

**Status:** 🟢 **Ready for Production**

Need help? Run the verification script:
```bash
chmod +x scripts/setup-aws-ses.sh
./scripts/setup-aws-ses.sh us-east-1 noreply@resultspro.ng
```
