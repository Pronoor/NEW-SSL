<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify your email - SSL Manager</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155; margin: 0; padding: 0; background: #f1f5f9; }
        .wrapper { max-width: 480px; margin: 0 auto; padding: 24px; }
        .card { background: #fff; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
        h1 { font-size: 1.5rem; color: #1e293b; margin: 0 0 16px 0; font-weight: 600; }
        p { margin: 0 0 16px 0; font-size: 0.9375rem; }
        .otp-box { background: #f1f5f9; border: 2px dashed #6366f1; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0; }
        .otp-code { font-size: 1.75rem; font-weight: 700; letter-spacing: 0.25em; color: #6366f1; font-family: ui-monospace, monospace; }
        .footer { font-size: 0.8125rem; color: #64748b; margin-top: 24px; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="card">
            <h1>Verify your email</h1>
            <p>You're registering for SSL Manager. Use this one-time code to verify your email:</p>
            <div class="otp-box">
                <span class="otp-code">{{ $otp }}</span>
            </div>
            <p>This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
            <p class="footer">SSL Manager – Secure certificate management</p>
        </div>
    </div>
</body>
</html>
