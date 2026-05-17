<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'config.php';
require 'PHPMailer/Exception.php';
require 'PHPMailer/PHPMailer.php';
require 'PHPMailer/SMTP.php';

// ── Sanitize & Validate ─────────────────────────────────────────────
$name    = trim($_POST['name'] ?? '');
$email   = trim($_POST['email'] ?? '');
$phone   = trim($_POST['phone'] ?? '');
$service = trim($_POST['service'] ?? '');
$budget  = trim($_POST['budget'] ?? '');
$message = trim($_POST['message'] ?? '');

if (empty($name) || empty($email) || empty($service) || empty($message)) {
    header("Location: contact.html?status=error&msg=missing_fields");
    exit();
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    header("Location: contact.html?status=error&msg=invalid_email");
    exit();
}

// ── Database Connection ─────────────────────────────────────────────
$conn = getDbConnection();
if (!$conn) {
    header("Location: contact.html?status=error&msg=db_connect");
    exit();
}

$stmt = $conn->prepare("INSERT INTO contacts (name, email, phone, service, budget, message) VALUES (?, ?, ?, ?, ?, ?)");
if (!$stmt) {
    header("Location: contact.html?status=error&msg=prepare_failed");
    exit();
}
$stmt->bind_param("ssssss", $name, $email, $phone, $service, $budget, $message);
if (!$stmt->execute()) {
    $stmt->close();
    header("Location: contact.html?status=error&msg=insert_failed");
    exit();
}
$stmt->close();
$conn->close();

// ── Shared Email Helper ─────────────────────────────────────────────
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
      <!-- Card -->
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
      <!-- End Card -->

      <p style='color:#2d2d4a;font-size:11px;margin-top:20px;text-align:center;'>
        This email was sent automatically. Please do not reply directly to this address.
      </p>
    </td></tr>
  </table>
</body>
</html>";
}

function infoRow(string $label, string $value, string $emoji = ''): string {
    $val = $emoji ? "{$emoji}&nbsp;&nbsp;{$value}" : $value;
    return "
    <tr>
      <td style='padding:0 0 14px;'>
        <table width='100%' cellpadding='0' cellspacing='0' border='0'>
          <tr>
            <td style='background:#0d0d22;border-radius:10px;padding:14px 18px;border-left:3px solid #7c3aed;'>
              <p style='margin:0 0 4px;color:#6b7280;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;'>{$label}</p>
              <p style='margin:0;color:#e2e8f0;font-size:15px;'>{$val}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>";
}

// ── Budget label map ────────────────────────────────────────────────
$budgetLabels = [
    'small'      => '&#8377;5,000 &mdash; &#8377;10,000',
    'medium'     => '&#8377;10,000 &mdash; &#8377;25,000',
    'large'      => '&#8377;25,000 &mdash; &#8377;50,000',
    'enterprise' => '&#8377;50,000+',
    'discuss'    => "Let&rsquo;s discuss",
    ''           => 'Not specified'
];
$budgetDisplay  = $budgetLabels[$budget] ?? htmlspecialchars($budget);
$serviceDisplay = htmlspecialchars(ucfirst($service));
$phoneDisplay   = $phone ? htmlspecialchars($phone) : '<em style="color:#4a5568;">Not provided</em>';
$submittedAt    = date('d M Y, h:i A T');

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
    // 1. AUTO-REPLY TO CLIENT
    // ══════════════════════════════════════════════════════════════
    $mail->setFrom(SMTP_USER, SITE_NAME);
    $mail->addAddress($email, $name);
    $mail->addReplyTo(SMTP_USER, SITE_NAME);
    $mail->isHTML(true);
    $mail->Subject = "Got your message, {$name}! I'll be in touch soon ✨";

    $userBodyContent = "
    <table width='100%' cellpadding='0' cellspacing='0' border='0'>
      <tr>
        <td style='padding-bottom:24px;'>
          <p style='margin:0;color:#a78bfa;font-size:14px;font-weight:700;letter-spacing:1px;'>HELLO, " . strtoupper(htmlspecialchars($name)) . "!</p>
          <h2 style='margin:10px 0 0;color:#f1f5f9;font-size:22px;font-weight:700;line-height:1.3;'>
            Your message has been received &#127881;
          </h2>
        </td>
      </tr>
      <tr>
        <td style='padding-bottom:24px;'>
          <p style='margin:0;color:#94a3b8;font-size:15px;line-height:1.8;'>
            Thank you for reaching out about <strong style='color:#a78bfa;'>{$serviceDisplay}</strong>.
            I have received your inquiry and will get back to you within <strong style='color:#e2e8f0;'>24 hours</strong>.
          </p>
        </td>
      </tr>

      <!-- Your message summary box -->
      <tr>
        <td style='padding-bottom:28px;'>
          <table width='100%' cellpadding='0' cellspacing='0' border='0'>
            <tr>
              <td style='background:#0d0d22;border-radius:12px;padding:20px 22px;border:1px solid rgba(124,58,237,0.2);'>
                <p style='margin:0 0 10px;color:#6b7280;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;'>YOUR MESSAGE</p>
                <p style='margin:0;color:#cbd5e1;font-size:14px;line-height:1.8;font-style:italic;'>
                  &ldquo;" . nl2br(htmlspecialchars($message)) . "&rdquo;
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- What happens next -->
      <tr>
        <td style='padding-bottom:28px;'>
          <table width='100%' cellpadding='0' cellspacing='0' border='0'>
            <tr>
              <td style='padding-bottom:10px;'>
                <p style='margin:0;color:#e2e8f0;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;'>WHAT HAPPENS NEXT</p>
              </td>
            </tr>
            <tr>
              <td style='padding:6px 0;'>
                <table cellpadding='0' cellspacing='0' border='0'>
                  <tr>
                    <td style='color:#7c3aed;font-size:18px;padding-right:12px;vertical-align:top;'>&#9312;</td>
                    <td style='color:#94a3b8;font-size:14px;line-height:1.6;'>I review your project details carefully</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style='padding:6px 0;'>
                <table cellpadding='0' cellspacing='0' border='0'>
                  <tr>
                    <td style='color:#7c3aed;font-size:18px;padding-right:12px;vertical-align:top;'>&#9313;</td>
                    <td style='color:#94a3b8;font-size:14px;line-height:1.6;'>I send you a tailored proposal within 24 hours</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style='padding:6px 0;'>
                <table cellpadding='0' cellspacing='0' border='0'>
                  <tr>
                    <td style='color:#7c3aed;font-size:18px;padding-right:12px;vertical-align:top;'>&#9314;</td>
                    <td style='color:#94a3b8;font-size:14px;line-height:1.6;'>We kick off your project together &#127775;</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- CTA Button -->
      <tr>
        <td align='center' style='padding-bottom:10px;'>
          <a href='https://wa.me/qr/EAIRDGVI3PO5N1'
             style='display:inline-block;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#ffffff;text-decoration:none;padding:15px 36px;border-radius:50px;font-size:15px;font-weight:700;letter-spacing:0.5px;'>
            &#128172;&nbsp; Chat on WhatsApp
          </a>
        </td>
      </tr>
      <tr>
        <td align='center'>
          <p style='margin:12px 0 0;color:#4a5568;font-size:12px;'>Or simply reply to this email</p>
        </td>
      </tr>
    </table>";

    $mail->Body = emailWrapper("Message Received!", "&#127881;", "Thank you for reaching out, {$name}", $userBodyContent);
    $mail->send();

    // ══════════════════════════════════════════════════════════════
    // 2. ADMIN NOTIFICATION (TO YOU)
    // ══════════════════════════════════════════════════════════════
    $mail->clearAllRecipients();
    $mail->addAddress(ADMIN_EMAIL);
    $mail->addReplyTo($email, $name);
    $mail->Subject = "&#128293; New Hire Me Request — {$name} | " . strtoupper($service);

    $adminBodyContent = "
    <table width='100%' cellpadding='0' cellspacing='0' border='0'>

      <!-- Alert badge -->
      <tr>
        <td align='center' style='padding-bottom:28px;'>
          <table cellpadding='0' cellspacing='0' border='0'>
            <tr>
              <td style='background:rgba(124,58,237,0.15);border:1px solid rgba(124,58,237,0.4);border-radius:50px;padding:8px 20px;'>
                <p style='margin:0;color:#a78bfa;font-size:12px;font-weight:700;letter-spacing:1.5px;'>
                  &#128336;&nbsp; RECEIVED: {$submittedAt}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Section: Client Info -->
      <tr>
        <td style='padding-bottom:6px;'>
          <p style='margin:0;color:#6b7280;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;'>CLIENT INFORMATION</p>
        </td>
      </tr>
      " . infoRow('Full Name', htmlspecialchars($name), '&#128100;') . "
      " . infoRow('Email Address', "<a href='mailto:{$email}' style='color:#818cf8;text-decoration:none;'>{$email}</a>", '&#128231;') . "
      " . infoRow('Phone Number', $phoneDisplay, '&#128222;') . "

      <!-- Section: Project Info -->
      <tr>
        <td style='padding:10px 0 6px;'>
          <p style='margin:0;color:#6b7280;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;'>PROJECT DETAILS</p>
        </td>
      </tr>
      " . infoRow('Service Needed', $serviceDisplay, '&#128736;') . "
      " . infoRow('Budget Range', $budgetDisplay, '&#128176;') . "

      <!-- Message Box -->
      <tr>
        <td style='padding-bottom:14px;'>
          <p style='margin:0 0 8px;color:#6b7280;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;'>MESSAGE FROM CLIENT</p>
          <table width='100%' cellpadding='0' cellspacing='0' border='0'>
            <tr>
              <td style='background:#0d0d22;border-radius:10px;padding:18px 20px;border-left:3px solid #4f46e5;border:1px solid rgba(79,70,229,0.2);'>
                <p style='margin:0;color:#cbd5e1;font-size:14px;line-height:1.8;white-space:pre-wrap;'>" . htmlspecialchars($message) . "</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- CTA -->
      <tr>
        <td align='center' style='padding-top:16px;'>
          <a href='mailto:{$email}?subject=Re%3A%20Your%20Hire%20Me%20Request%20-%20Let%27s%20Discuss'
             style='display:inline-block;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#ffffff;text-decoration:none;padding:15px 36px;border-radius:50px;font-size:15px;font-weight:700;letter-spacing:0.5px;'>
            &#128231;&nbsp; Reply to {$name}
          </a>
        </td>
      </tr>
      <tr>
        <td align='center'>
          <p style='margin:12px 0 0;color:#4a5568;font-size:12px;'>
            Hit Reply to respond directly to the client
          </p>
        </td>
      </tr>
    </table>";

    $mail->Body = emailWrapper("New Hire Me Request!", "&#128293;", "Someone wants to work with you", $adminBodyContent);
    $mail->send();

} catch (Exception $e) {
    error_log("Mail Error: {$mail->ErrorInfo}");
}

// ── Success Redirect ─────────────────────────────────────────────────
header("Location: contact.html?status=success");
exit();
?>
