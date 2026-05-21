<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'config.php';
require 'PHPMailer/Exception.php';
require 'PHPMailer/PHPMailer.php';
require 'PHPMailer/SMTP.php';

// ── Sanitize & Validate ─────────────────────────────────────────────
$name  = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');

if (empty($name) || empty($email)) {
    header("Location: join.html?status=error&msg=missing_fields");
    exit();
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    header("Location: join.html?status=error&msg=invalid_email");
    exit();
}

// ── Database Connection ─────────────────────────────────────────────
$conn = getDbConnection();
if (!$conn) {
    header("Location: join.html?status=error&msg=db_error");
    exit();
}

$conn->query("CREATE TABLE IF NOT EXISTS community (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)");

$checkStmt = $conn->prepare("SELECT id FROM community WHERE email = ?");
if ($checkStmt) {
    $checkStmt->bind_param("s", $email);
    $checkStmt->execute();
    $checkStmt->store_result();
    if ($checkStmt->num_rows > 0) {
        $checkStmt->close();
        $conn->close();
        header("Location: join.html?status=error&msg=already_joined");
        exit();
    }
    $checkStmt->close();
}

$stmt = $conn->prepare("INSERT INTO community (name, email) VALUES (?, ?)");
if (!$stmt) {
    header("Location: join.html?status=error&msg=db_error");
    exit();
}
$stmt->bind_param("ss", $name, $email);
if (!$stmt->execute()) {
    $stmt->close();
    header("Location: join.html?status=error&msg=db_error");
    exit();
}
$stmt->close();
$conn->close();

// ── Shared Email Wrapper ────────────────────────────────────────────
function emailWrapper(string $headerTitle, string $headerEmoji, string $headerSub, string $bodyContent): string {
    return "<!DOCTYPE html>
<html lang='en'>
<head>
  <meta charset='UTF-8'>
  <meta name='viewport' content='width=device-width,initial-scale=1'>
  <title>{$headerTitle}</title>
</head>
<body style='margin:0;padding:0;background:#0a0a14;font-family:Arial,Helvetica,sans-serif;'>
  <table width='100%' cellpadding='0' cellspacing='0' border='0' style='background:#0a0a14;padding:40px 16px;'>
    <tr><td align='center'>
      <table width='600' cellpadding='0' cellspacing='0' border='0' style='max-width:600px;width:100%;background:#13132a;border-radius:20px;overflow:hidden;border:1px solid rgba(124,58,237,0.25);'>

        <!-- Header -->
        <tr>
          <td style='background:linear-gradient(135deg,#7c3aed 0%,#4f46e5 100%);padding:42px 40px;text-align:center;'>
            <div style='font-size:48px;line-height:1;margin-bottom:16px;'>{$headerEmoji}</div>
            <h1 style='margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;'>{$headerTitle}</h1>
            <p style='margin:10px 0 0;color:rgba(255,255,255,0.75);font-size:14px;'>{$headerSub}</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style='padding:36px 40px;'>
            {$bodyContent}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style='background:#0d0d22;padding:24px 40px;text-align:center;border-top:1px solid rgba(124,58,237,0.15);'>
            <p style='margin:0;color:#6366f1;font-size:13px;font-weight:700;letter-spacing:1px;'>AKARSHIT GUPTA</p>
            <p style='margin:6px 0 0;color:#4a5568;font-size:12px;'>AI Creator &bull; Web Developer &bull; Digital Problem Solver</p>
            <p style='margin:12px 0 0;'>
              <a href='https://akarshitgupta.com' style='color:#7c3aed;font-size:12px;text-decoration:none;'>akarshitgupta.com</a>
            </p>
          </td>
        </tr>

      </table>

      <p style='color:#2d2d4a;font-size:11px;margin-top:20px;text-align:center;'>
        This email was sent automatically. Please do not reply directly to this address.
      </p>
    </td></tr>
  </table>
</body>
</html>";
}

$submittedAt = date('d M Y, h:i A T');

// ── Email Automation ────────────────────────────────────────────────
$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host       = SMTP_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = SMTP_USER;
    $mail->Password   = str_replace(' ', '', SMTP_PASS);
    $mail->SMTPSecure = (SMTP_PORT == 465) ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = SMTP_PORT;

    // ══════════════════════════════════════════════════════════════
    // 1. WELCOME EMAIL TO THE NEW MEMBER
    // ══════════════════════════════════════════════════════════════
    $mail->setFrom(SMTP_USER, SITE_NAME);
    $mail->addAddress($email, $name);
    $mail->addReplyTo(SMTP_USER, SITE_NAME);
    $mail->isHTML(true);
    $mail->Subject = "You're in, {$name}! Welcome to the Community &#127881;";

    $userBodyContent = "
    <table width='100%' cellpadding='0' cellspacing='0' border='0'>

      <!-- Greeting -->
      <tr>
        <td style='padding-bottom:24px;'>
          <p style='margin:0;color:#a78bfa;font-size:14px;font-weight:700;letter-spacing:1px;'>WELCOME ABOARD, " . strtoupper(htmlspecialchars($name)) . "!</p>
          <h2 style='margin:10px 0 0;color:#f1f5f9;font-size:22px;font-weight:700;line-height:1.3;'>
            You&rsquo;re officially part of something great &#127775;
          </h2>
        </td>
      </tr>

      <!-- Body Text -->
      <tr>
        <td style='padding-bottom:28px;'>
          <p style='margin:0;color:#94a3b8;font-size:15px;line-height:1.8;'>
            I&rsquo;m thrilled to have you here. You&rsquo;ll now be the first to know about my latest projects,
            behind-the-scenes content, and exclusive collaboration opportunities.
          </p>
        </td>
      </tr>

      <!-- What you get -->
      <tr>
        <td style='padding-bottom:28px;'>
          <table width='100%' cellpadding='0' cellspacing='0' border='0'>
            <tr>
              <td style='background:#0d0d22;border-radius:12px;padding:22px 24px;border:1px solid rgba(124,58,237,0.2);'>
                <p style='margin:0 0 16px;color:#e2e8f0;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;'>
                  &#10024; What you&rsquo;ll get as a member
                </p>
                <table cellpadding='0' cellspacing='0' border='0' width='100%'>
                  <tr>
                    <td style='padding:7px 0;'>
                      <table cellpadding='0' cellspacing='0' border='0'><tr>
                        <td style='color:#7c3aed;font-size:16px;padding-right:12px;'>&#9679;</td>
                        <td style='color:#94a3b8;font-size:14px;line-height:1.6;'>Exclusive project updates &amp; sneak peeks</td>
                      </tr></table>
                    </td>
                  </tr>
                  <tr>
                    <td style='padding:7px 0;'>
                      <table cellpadding='0' cellspacing='0' border='0'><tr>
                        <td style='color:#7c3aed;font-size:16px;padding-right:12px;'>&#9679;</td>
                        <td style='color:#94a3b8;font-size:14px;line-height:1.6;'>Priority access to new services &amp; offers</td>
                      </tr></table>
                    </td>
                  </tr>
                  <tr>
                    <td style='padding:7px 0;'>
                      <table cellpadding='0' cellspacing='0' border='0'><tr>
                        <td style='color:#7c3aed;font-size:16px;padding-right:12px;'>&#9679;</td>
                        <td style='color:#94a3b8;font-size:14px;line-height:1.6;'>Behind-the-scenes AI &amp; dev insights</td>
                      </tr></table>
                    </td>
                  </tr>
                  <tr>
                    <td style='padding:7px 0;'>
                      <table cellpadding='0' cellspacing='0' border='0'><tr>
                        <td style='color:#7c3aed;font-size:16px;padding-right:12px;'>&#9679;</td>
                        <td style='color:#94a3b8;font-size:14px;line-height:1.6;'>Direct collaboration opportunities</td>
                      </tr></table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- CTA -->
      <tr>
        <td align='center' style='padding-bottom:10px;'>
          <a href='https://akarshitgupta.com'
             style='display:inline-block;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#ffffff;text-decoration:none;padding:15px 36px;border-radius:50px;font-size:15px;font-weight:700;letter-spacing:0.5px;'>
            &#127968;&nbsp; Visit My Portfolio
          </a>
        </td>
      </tr>
      <tr>
        <td align='center'>
          <p style='margin:12px 0 0;color:#4a5568;font-size:12px;'>
            Want to collaborate? Simply reply to this email &#128140;
          </p>
        </td>
      </tr>
    </table>";

    $mail->Body = emailWrapper("Welcome to the Community!", "&#127775;", "You're now part of the inner circle", $userBodyContent);
    $mail->send();

    // ══════════════════════════════════════════════════════════════
    // 2. ADMIN NOTIFICATION (TO YOU)
    // ══════════════════════════════════════════════════════════════
    $mail->clearAllRecipients();
    $mail->addAddress(ADMIN_EMAIL);
    $mail->addReplyTo($email, $name);
    $mail->Subject = "&#127881; New Community Member — {$name}";

    $adminBodyContent = "
    <table width='100%' cellpadding='0' cellspacing='0' border='0'>

      <!-- Timestamp badge -->
      <tr>
        <td align='center' style='padding-bottom:28px;'>
          <table cellpadding='0' cellspacing='0' border='0'>
            <tr>
              <td style='background:rgba(124,58,237,0.15);border:1px solid rgba(124,58,237,0.4);border-radius:50px;padding:8px 20px;'>
                <p style='margin:0;color:#a78bfa;font-size:12px;font-weight:700;letter-spacing:1.5px;'>
                  &#128336;&nbsp; JOINED: {$submittedAt}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Member info -->
      <tr>
        <td style='padding-bottom:6px;'>
          <p style='margin:0;color:#6b7280;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;'>NEW MEMBER DETAILS</p>
        </td>
      </tr>

      <!-- Name row -->
      <tr>
        <td style='padding-bottom:14px;'>
          <table width='100%' cellpadding='0' cellspacing='0' border='0'>
            <tr>
              <td style='background:#0d0d22;border-radius:10px;padding:14px 18px;border-left:3px solid #7c3aed;'>
                <p style='margin:0 0 4px;color:#6b7280;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;'>FULL NAME</p>
                <p style='margin:0;color:#e2e8f0;font-size:15px;'>&#128100;&nbsp;&nbsp;" . htmlspecialchars($name) . "</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Email row -->
      <tr>
        <td style='padding-bottom:28px;'>
          <table width='100%' cellpadding='0' cellspacing='0' border='0'>
            <tr>
              <td style='background:#0d0d22;border-radius:10px;padding:14px 18px;border-left:3px solid #7c3aed;'>
                <p style='margin:0 0 4px;color:#6b7280;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;'>EMAIL ADDRESS</p>
                <p style='margin:0;font-size:15px;'>
                  &#128231;&nbsp;&nbsp;<a href='mailto:{$email}' style='color:#818cf8;text-decoration:none;'>{$email}</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- CTA -->
      <tr>
        <td align='center'>
          <a href='mailto:{$email}?subject=Welcome%20to%20the%20Community%21'
             style='display:inline-block;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#ffffff;text-decoration:none;padding:15px 36px;border-radius:50px;font-size:15px;font-weight:700;letter-spacing:0.5px;'>
            &#128231;&nbsp; Say Hi to {$name}
          </a>
        </td>
      </tr>
      <tr>
        <td align='center'>
          <p style='margin:12px 0 0;color:#4a5568;font-size:12px;'>
            Community is growing &#128293; You&rsquo;re doing great!
          </p>
        </td>
      </tr>
    </table>";

    $mail->Body = emailWrapper("New Community Member!", "&#127881;", "Someone just joined your inner circle", $adminBodyContent);
    $mail->send();

} catch (Exception $e) {
    error_log("Mail Error: {$mail->ErrorInfo}");
}

// ── Success Redirect ─────────────────────────────────────────────────
header("Location: join.html?status=success");
exit();
?>
