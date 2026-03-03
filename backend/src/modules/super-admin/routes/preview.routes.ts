import { Router, Request, Response } from 'express';
import { EmailTemplateService } from '@modules/common/services/email-template.service';

const router = Router();

/**
 * Preview email templates
 * Access at: http://localhost:5000/api/preview/agent-invitation
 */

// Preview Agent Invitation Email
router.get('/agent-invitation', (req: Request, res: Response) => {
  const email = req.query.email as string || 'agent@example.com';
  const tempPassword = req.query.password as string || 'TempPass123!@#';
  const department = req.query.department as string || 'Setup';

  const html = EmailTemplateService.generateAgentInvitationEmail(email, tempPassword, department);
  res.set('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

// Preview Verification Email
router.get('/verification', (req: Request, res: Response) => {
  const otp = req.query.otp as string || '123456';
  const html = EmailTemplateService.generateVerificationEmail(otp);
  res.set('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

// Preview Approval Email
router.get('/approval', (req: Request, res: Response) => {
  const schoolName = req.query.schoolName as string || 'Sample School';
  const loginUrl = req.query.loginUrl as string || 'https://app.scholars.ng/auth/login';
  const html = EmailTemplateService.generateApprovalEmail(schoolName, loginUrl);
  res.set('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

// Preview School Approval Email
router.get('/school-approval', (req: Request, res: Response) => {
  const email = req.query.email as string || 'admin@school.ng';
  const adminName = req.query.adminName as string || 'John Doe';
  const tempPassword = req.query.password as string || 'SchoolPass123!@#';
  const html = EmailTemplateService.generateSchoolApprovalEmail(email, adminName, tempPassword);
  res.set('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

// Preview Password Reset Email
router.get('/password-reset', (req: Request, res: Response) => {
  const resetLink = req.query.resetLink as string || 'https://app.scholars.ng/auth/reset?token=abc123';
  const html = EmailTemplateService.generatePasswordResetEmail(resetLink);
  res.set('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

// Index of all preview routes
router.get('/', (req: Request, res: Response) => {
  const baseUrl = `${req.protocol}://${req.get('host')}/api/preview`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Template Previewer</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          background: #f3f4f6;
          padding: 40px 20px;
          margin: 0;
        }
        .container {
          max-width: 900px;
          margin: 0 auto;
        }
        h1 {
          color: #1f2937;
          text-align: center;
          margin-bottom: 40px;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }
        .card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }
        .card h3 {
          margin: 0 0 12px 0;
          color: #3b82f6;
          font-size: 18px;
        }
        .card p {
          margin: 0 0 16px 0;
          color: #6b7280;
          font-size: 14px;
          line-height: 1.5;
        }
        .card-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        label {
          font-size: 12px;
          font-weight: 600;
          color: #374151;
        }
        input {
          padding: 8px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 13px;
          font-family: inherit;
        }
        input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .buttons {
          display: flex;
          gap: 8px;
        }
        button {
          flex: 1;
          padding: 10px 16px;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-preview {
          background: #3b82f6;
          color: white;
        }
        .btn-preview:hover {
          background: #2563eb;
        }
        .btn-code {
          background: #f3f4f6;
          color: #374151;
        }
        .btn-code:hover {
          background: #e5e7eb;
        }
        .tips {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          border-radius: 6px;
          padding: 16px;
          margin-top: 40px;
          color: #92400e;
          font-size: 14px;
          line-height: 1.6;
        }
        .tips strong {
          color: #b45309;
        }
        code {
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>📧 Email Template Previewer</h1>
        <div class="grid">
          <!-- Agent Invitation -->
          <div class="card">
            <h3>Agent Invitation</h3>
            <p>Welcome email sent when new agents are bulk invited.</p>
            <div class="card-form">
              <div class="form-group">
                <label>Email Address</label>
                <input type="email" id="agent-email" value="agent@example.com" placeholder="agent@example.com">
              </div>
              <div class="form-group">
                <label>Temporary Password</label>
                <input type="text" id="agent-password" value="TempPass123!@#" placeholder="TempPass123!@#">
              </div>
              <div class="form-group">
                <label>Department</label>
                <input type="text" id="agent-department" value="Setup" placeholder="Setup, Training, Maintenance">
              </div>
            </div>
            <div class="buttons">
              <button class="btn-preview" onclick="previewAgentInvitation()">Preview</button>
            </div>
          </div>

          <!-- Verification Email -->
          <div class="card">
            <h3>Email Verification</h3>
            <p>Sent when users register to verify their email address.</p>
            <div class="card-form">
              <div class="form-group">
                <label>OTP Code</label>
                <input type="text" id="verification-otp" value="123456" placeholder="123456" maxlength="6">
              </div>
            </div>
            <div class="buttons">
              <button class="btn-preview" onclick="previewVerification()">Preview</button>
            </div>
          </div>

          <!-- School Approval -->
          <div class="card">
            <h3>School Approval</h3>
            <p>Sent when a school account is approved by admin.</p>
            <div class="card-form">
              <div class="form-group">
                <label>Admin Email</label>
                <input type="email" id="approval-email" value="admin@school.ng" placeholder="admin@school.ng">
              </div>
              <div class="form-group">
                <label>Admin Name</label>
                <input type="text" id="approval-name" value="John Doe" placeholder="John Doe">
              </div>
              <div class="form-group">
                <label>Temporary Password</label>
                <input type="text" id="approval-password" value="SchoolPass123!@#" placeholder="SchoolPass123!@#">
              </div>
            </div>
            <div class="buttons">
              <button class="btn-preview" onclick="previewSchoolApproval()">Preview</button>
            </div>
          </div>

          <!-- Password Reset -->
          <div class="card">
            <h3>Password Reset</h3>
            <p>Sent when users request to reset their password.</p>
            <div class="card-form">
              <div class="form-group">
                <label>Reset Link</label>
                <input type="text" id="reset-link" value="https://app.scholars.ng/auth/reset?token=abc123" placeholder="https://...">
              </div>
            </div>
            <div class="buttons">
              <button class="btn-preview" onclick="previewPasswordReset()">Preview</button>
            </div>
          </div>

          <!-- Approval Email -->
          <div class="card">
            <h3>General Approval</h3>
            <p>Sent when a registration is approved.</p>
            <div class="card-form">
              <div class="form-group">
                <label>School/Organization Name</label>
                <input type="text" id="approval-school" value="Sample School" placeholder="Sample School">
              </div>
            </div>
            <div class="buttons">
              <button class="btn-preview" onclick="previewApproval()">Preview</button>
            </div>
          </div>
        </div>

        <div class="tips">
          <strong>💡 Tips:</strong>
          <ul style="margin: 8px 0 0 0; padding-left: 20px;">
            <li>Click <strong>Preview</strong> to see the email in a new tab</li>
            <li>Edit the input fields and click Preview again to see changes in real-time</li>
            <li>Test how the email looks on different screen sizes (responsive)</li>
            <li>To modify templates permanently, edit <code>email-template.service.ts</code></li>
            <li>Changes in templates automatically apply to all emails sent by the system</li>
          </ul>
        </div>
      </div>

      <script>
        function previewAgentInvitation() {
          const email = document.getElementById('agent-email').value;
          const password = document.getElementById('agent-password').value;
          const department = document.getElementById('agent-department').value;
          const url = \`${baseUrl}/agent-invitation?email=\${encodeURIComponent(email)}&password=\${encodeURIComponent(password)}&department=\${encodeURIComponent(department)}\`;
          window.open(url, 'preview');
        }
        function previewVerification() {
          const otp = document.getElementById('verification-otp').value;
          const url = \`${baseUrl}/verification?otp=\${encodeURIComponent(otp)}\`;
          window.open(url, 'preview');
        }
        function previewSchoolApproval() {
          const email = document.getElementById('approval-email').value;
          const name = document.getElementById('approval-name').value;
          const password = document.getElementById('approval-password').value;
          const url = \`${baseUrl}/school-approval?email=\${encodeURIComponent(email)}&adminName=\${encodeURIComponent(name)}&password=\${encodeURIComponent(password)}\`;
          window.open(url, 'preview');
        }
        function previewPasswordReset() {
          const link = document.getElementById('reset-link').value;
          const url = \`${baseUrl}/password-reset?resetLink=\${encodeURIComponent(link)}\`;
          window.open(url, 'preview');
        }
        function previewApproval() {
          const school = document.getElementById('approval-school').value;
          const url = \`${baseUrl}/approval?schoolName=\${encodeURIComponent(school)}\`;
          window.open(url, 'preview');
        }
      </script>
    </body>
    </html>
  `;
  res.set('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

export default router;
