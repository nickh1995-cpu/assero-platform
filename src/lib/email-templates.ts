// =====================================================
// ASSERO EMAIL TEMPLATES - CORPORATE IDENTITY
// =====================================================

export const emailTemplates = {
  // User confirmation email template
  userConfirmation: (user: { email: string; first_name?: string; last_name?: string }) => {
    const firstName = user.first_name || 'Liebe/r Nutzer/in';
    const fullName = user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : firstName;
    
    return {
      subject: '✅ Willkommen bei ASSERO - E-Mail bestätigen',
      html: `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Willkommen bei ASSERO</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #102231;
            margin: 0;
            padding: 0;
            background-color: #f4f7fa;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(16, 34, 49, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #2c5a78 0%, #1e3a52 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
        }
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
        }
        .logo {
            font-size: 32px;
            font-weight: 700;
            margin: 0 0 10px 0;
            position: relative;
            z-index: 1;
        }
        .logo-subtitle {
            font-size: 16px;
            opacity: 0.9;
            margin: 0;
            position: relative;
            z-index: 1;
        }
        .content {
            padding: 40px 30px;
        }
        .welcome-title {
            font-size: 28px;
            font-weight: 700;
            color: #102231;
            margin: 0 0 20px 0;
            text-align: center;
        }
        .welcome-text {
            font-size: 18px;
            color: #555;
            margin: 0 0 30px 0;
            text-align: center;
        }
        .confirmation-box {
            background: linear-gradient(135deg, rgba(44, 90, 120, 0.05) 0%, rgba(30, 58, 82, 0.05) 100%);
            border: 2px solid rgba(44, 90, 120, 0.2);
            border-radius: 12px;
            padding: 30px;
            margin: 30px 0;
            text-align: center;
        }
        .confirmation-icon {
            font-size: 48px;
            margin-bottom: 20px;
        }
        .confirmation-title {
            font-size: 24px;
            font-weight: 700;
            color: #2c5a78;
            margin: 0 0 15px 0;
        }
        .confirmation-text {
            font-size: 16px;
            color: #555;
            margin: 0 0 25px 0;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #2c5a78 0%, #1e3a52 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 8px 24px rgba(44, 90, 120, 0.3);
        }
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 32px rgba(44, 90, 120, 0.4);
        }
        .features {
            margin: 40px 0;
        }
        .features-title {
            font-size: 20px;
            font-weight: 700;
            color: #102231;
            margin: 0 0 20px 0;
            text-align: center;
        }
        .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .feature-item {
            text-align: center;
            padding: 20px;
            background: rgba(44, 90, 120, 0.05);
            border-radius: 12px;
            border: 1px solid rgba(44, 90, 120, 0.1);
        }
        .feature-icon {
            font-size: 32px;
            margin-bottom: 10px;
        }
        .feature-title {
            font-size: 14px;
            font-weight: 600;
            color: #2c5a78;
            margin: 0 0 5px 0;
        }
        .feature-desc {
            font-size: 12px;
            color: #666;
            margin: 0;
        }
        .footer {
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        .footer-text {
            font-size: 14px;
            color: #666;
            margin: 0 0 15px 0;
        }
        .footer-links {
            margin: 20px 0;
        }
        .footer-link {
            color: #2c5a78;
            text-decoration: none;
            margin: 0 15px;
            font-size: 14px;
        }
        .footer-link:hover {
            text-decoration: underline;
        }
        .security-note {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.2);
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
            text-align: center;
        }
        .security-icon {
            font-size: 24px;
            margin-bottom: 10px;
        }
        .security-text {
            font-size: 14px;
            color: #059669;
            margin: 0;
            font-weight: 500;
        }
        @media (max-width: 600px) {
            .email-container {
                margin: 10px;
                border-radius: 12px;
            }
            .header, .content, .footer {
                padding: 20px;
            }
            .welcome-title {
                font-size: 24px;
            }
            .confirmation-box {
                padding: 20px;
            }
            .feature-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="logo">ASSERO</div>
            <div class="logo-subtitle">Premium Investment Management</div>
        </div>

        <!-- Content -->
        <div class="content">
            <h1 class="welcome-title">Willkommen bei ASSERO!</h1>
            <p class="welcome-text">Hallo ${fullName},<br>vielen Dank für Ihre Registrierung bei ASSERO.</p>

            <!-- Confirmation Box -->
            <div class="confirmation-box">
                <div class="confirmation-icon">📧</div>
                <h2 class="confirmation-title">E-Mail-Adresse bestätigen</h2>
                <p class="confirmation-text">
                    Um Ihr Konto zu aktivieren und die volle Funktionalität von ASSERO zu nutzen, 
                    bestätigen Sie bitte Ihre E-Mail-Adresse:
                </p>
                <a href="{{ .ConfirmationURL }}" class="cta-button">
                    E-Mail-Adresse bestätigen
                </a>
            </div>

            <!-- Features -->
            <div class="features">
                <h3 class="features-title">Was Sie mit ASSERO erwartet:</h3>
                <div class="feature-grid">
                    <div class="feature-item">
                        <div class="feature-icon">🏢</div>
                        <div class="feature-title">Deal Room</div>
                        <div class="feature-desc">Professionelle Transaktionsabwicklung</div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">📊</div>
                        <div class="feature-title">Portfolio</div>
                        <div class="feature-desc">Asset-Management & Tracking</div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">💼</div>
                        <div class="feature-title">Bewertung</div>
                        <div class="feature-desc">Professionelle Asset-Bewertung</div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">🔒</div>
                        <div class="feature-title">Sicherheit</div>
                        <div class="feature-desc">Bank-Level Sicherheit</div>
                    </div>
                </div>
            </div>

            <!-- Security Note -->
            <div class="security-note">
                <div class="security-icon">🔐</div>
                <p class="security-text">
                    Ihre Daten sind bei uns sicher. ASSERO verwendet Bank-Level Verschlüsselung 
                    und höchste Sicherheitsstandards.
                </p>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p class="footer-text">
                <strong>ASSERO</strong> - Premium Investment Management Platform<br>
                Professionelle Transaktionsabwicklung für Luxus-Assets
            </p>
            <div class="footer-links">
                <a href="{{ .SiteURL }}" class="footer-link">Zur Plattform</a>
                <a href="{{ .SiteURL }}/support" class="footer-link">Support</a>
                <a href="{{ .SiteURL }}/privacy" class="footer-link">Datenschutz</a>
            </div>
            <p class="footer-text">
                Falls Sie sich nicht registriert haben, können Sie diese E-Mail ignorieren.<br>
                Diese E-Mail wurde automatisch generiert.
            </p>
        </div>
    </div>
</body>
</html>
      `
    };
  },

  // Password reset email template
  passwordReset: (user: { email: string; first_name?: string }) => {
    const firstName = user.first_name || 'Liebe/r Nutzer/in';
    
    return {
      subject: '🔐 ASSERO - Passwort zurücksetzen',
      html: `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Passwort zurücksetzen - ASSERO</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #102231;
            margin: 0;
            padding: 0;
            background-color: #f4f7fa;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(16, 34, 49, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #2c5a78 0%, #1e3a52 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .logo {
            font-size: 32px;
            font-weight: 700;
            margin: 0 0 10px 0;
        }
        .content {
            padding: 40px 30px;
        }
        .title {
            font-size: 28px;
            font-weight: 700;
            color: #102231;
            margin: 0 0 20px 0;
            text-align: center;
        }
        .reset-box {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.05) 100%);
            border: 2px solid rgba(239, 68, 68, 0.2);
            border-radius: 12px;
            padding: 30px;
            margin: 30px 0;
            text-align: center;
        }
        .reset-icon {
            font-size: 48px;
            margin-bottom: 20px;
        }
        .reset-title {
            font-size: 24px;
            font-weight: 700;
            color: #dc2626;
            margin: 0 0 15px 0;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 8px 24px rgba(220, 38, 38, 0.3);
        }
        .security-warning {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.2);
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
            text-align: center;
        }
        .footer {
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">ASSERO</div>
        </div>
        
        <div class="content">
            <h1 class="title">Passwort zurücksetzen</h1>
            <p>Hallo ${firstName},<br>Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts gestellt.</p>
            
            <div class="reset-box">
                <div class="reset-icon">🔐</div>
                <h2 class="reset-title">Passwort zurücksetzen</h2>
                <p>Klicken Sie auf den Button unten, um ein neues Passwort zu erstellen:</p>
                <a href="{{ .ConfirmationURL }}" class="cta-button">
                    Neues Passwort erstellen
                </a>
            </div>
            
            <div class="security-warning">
                <p><strong>⚠️ Sicherheitshinweis:</strong> Falls Sie diese Anfrage nicht gestellt haben, ignorieren Sie diese E-Mail. Ihr Passwort bleibt unverändert.</p>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>ASSERO</strong> - Premium Investment Management</p>
        </div>
    </div>
</body>
</html>
      `
    };
  }
};
