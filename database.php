<?php
require 'config.php';
session_start();

function redirectWithMessage(string $message): void {
    header('Location: database.php?msg=' . urlencode($message));
    exit();
}

function requireCsrfToken(): void {
    $token = $_POST['csrf_token'] ?? '';
    if (empty($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $token)) {
        redirectWithMessage('invalid_request');
    }
}

function h(?string $value): string {
    return htmlspecialchars($value ?? '', ENT_QUOTES, 'UTF-8');
}

if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

if (isset($_GET['logout'])) {
    $_SESSION = [];
    session_destroy();
    header('Location: database.php');
    exit();
}

$loginError = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['admin_login'])) {
    $password = $_POST['admin_password'] ?? '';
    if (ADMIN_PASSWORD !== '' && hash_equals(ADMIN_PASSWORD, $password)) {
        $_SESSION['admin_authenticated'] = true;
        header('Location: database.php');
        exit();
    }
    $loginError = 'Invalid admin password.';
}

if (empty($_SESSION['admin_authenticated'])):
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Login - <?= h(SITE_NAME) ?></title>
  <link rel="stylesheet" href="style.css">
  <style>
    :root { --premium-bg:#050713; --premium-panel:rgba(11,15,31,.88); --premium-line:rgba(148,163,184,.16); --premium-cyan:#22d3ee; --premium-violet:#8b5cf6; --premium-green:#34d399; }
    body {
      background:
        linear-gradient(180deg,rgba(5,7,19,.72),#050713 62%),
        radial-gradient(circle at 18% 18%,rgba(34,211,238,.16),transparent 30%),
        radial-gradient(circle at 82% 12%,rgba(139,92,246,.2),transparent 32%),
        #050713;
      color:var(--text-primary);
    }
    .admin-login-wrap { min-height:100vh; display:grid; place-items:center; padding:24px; position:relative; }
    .admin-login-wrap::before {
      content:""; position:fixed; inset:0; pointer-events:none; opacity:.25;
      background-image:linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);
      background-size:42px 42px; mask-image:linear-gradient(to bottom,black,transparent 78%);
    }
    .admin-login-card {
      width:min(460px,100%); background:linear-gradient(145deg,rgba(13,18,36,.96),rgba(6,9,22,.92));
      border:1px solid var(--premium-line); border-radius:22px; padding:34px;
      box-shadow:0 28px 90px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.06);
      backdrop-filter:blur(22px); position:relative; overflow:hidden;
    }
    .admin-login-card::before { content:""; position:absolute; inset:0; background:linear-gradient(135deg,rgba(34,211,238,.18),transparent 48%),linear-gradient(315deg,rgba(139,92,246,.16),transparent 52%); pointer-events:none; }
    .admin-login-card::after { content:""; position:absolute; left:24px; right:24px; top:0; height:1px; background:linear-gradient(90deg,transparent,var(--premium-cyan),var(--premium-violet),transparent); opacity:.85; }
    .admin-login-kicker { color:#67e8f9; font-size:.74rem; font-weight:900; letter-spacing:.16em; text-transform:uppercase; margin-bottom:12px; position:relative; }
    .admin-login-card h1 { margin:0 0 8px; font-size:2rem; color:var(--text-primary); position:relative; }
    .admin-login-card p { margin:0 0 24px; color:var(--text-muted); line-height:1.6; position:relative; }
    .admin-login-card label { display:block; margin-bottom:8px; color:var(--text-secondary); font-weight:700; font-size:.9rem; }
    .admin-login-card input { width:100%; padding:13px 14px; border-radius:10px; border:1px solid rgba(148,163,184,.18); background:rgba(3,7,18,.5); color:var(--text-primary); outline:none; box-shadow:inset 0 1px 0 rgba(255,255,255,.04); }
    .admin-login-card input:focus { border-color:rgba(34,211,238,.58); box-shadow:0 0 0 4px rgba(34,211,238,.1); }
    .admin-login-card button { width:100%; margin-top:16px; padding:13px 16px; border:0; border-radius:10px; color:#fff; font-weight:900; cursor:pointer; background:linear-gradient(135deg,#06b6d4,#7c3aed); box-shadow:0 16px 34px rgba(124,58,237,.24); transition:transform .2s ease, box-shadow .2s ease; }
    .admin-login-card button:hover { transform:translateY(-1px); box-shadow:0 20px 42px rgba(34,211,238,.18); }
    .admin-login-error { margin-top:14px; color:#f87171; font-size:.9rem; }
  </style>
</head>
<body>
  <div class="bg-grid"></div>
  <div class="noise-overlay"></div>
  <main class="admin-login-wrap">
    <form class="admin-login-card" method="POST" action="database.php">
      <div class="admin-login-kicker">Private Lead Console</div>
      <h1>Welcome Back</h1>
      <p>Open your secured dashboard to review leads, demand trends, and contact submissions.</p>
      <input type="hidden" name="admin_login" value="1">
      <label for="admin_password">Password</label>
      <input id="admin_password" name="admin_password" type="password" autocomplete="current-password" required autofocus>
      <button type="submit">Open Database</button>
      <?php if ($loginError): ?><div class="admin-login-error"><?= h($loginError) ?></div><?php endif; ?>
      <?php if (ADMIN_PASSWORD === ''): ?><div class="admin-login-error">ADMIN_PASSWORD is missing in .env.</div><?php endif; ?>
    </form>
  </main>
</body>
</html>
<?php
exit();
endif;

$conn = getDbConnection();
$dbError = $conn ? null : 'Database connection failed. Please check config.php or ensure MySQL is running.';

if (!$dbError && $_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    requireCsrfToken();
    $action = $_POST['action'];

    if ($action === 'delete' && isset($_POST['id']) && is_numeric($_POST['id'])) {
        $id = (int)$_POST['id'];
        $stmt = $conn->prepare('DELETE FROM contacts WHERE id=?');
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $stmt->close();
        redirectWithMessage('deleted');
    }

    if ($action === 'clearall') {
        $conn->query('TRUNCATE TABLE contacts');
        redirectWithMessage('cleared');
    }
}

if (isset($_GET['delete']) || isset($_GET['clearall'])) {
    redirectWithMessage('invalid_request');
}

$members = [];
$total = 0;
$todayC = 0;
$weekC = 0;
$serviceCounts = [];
$budgetCounts = [];
$latestContact = null;
$search = trim($_GET['q'] ?? '');
$serviceFilter = trim($_GET['service'] ?? '');

if (!$dbError) {
    $where = 'WHERE 1=1';
    $params = [];
    $types = '';

    if ($search !== '') {
        $where .= ' AND (name LIKE ? OR email LIKE ? OR message LIKE ?)';
        $like = '%' . $search . '%';
        $params = [$like, $like, $like];
        $types .= 'sss';
    }

    if ($serviceFilter !== '') {
        $where .= ' AND service = ?';
        $params[] = $serviceFilter;
        $types .= 's';
    }

    $stmt = $conn->prepare("SELECT * FROM contacts $where ORDER BY id DESC");
    if ($params) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $res = $stmt->get_result();
    $members = $res->fetch_all(MYSQLI_ASSOC);
    $stmt->close();

    $allRes = $conn->query('SELECT created_at FROM contacts');
    while ($allRes && $row = $allRes->fetch_assoc()) {
        $total++;
        $dt = new DateTime($row['created_at']);
        $now = new DateTime();
        if ($dt->format('Y-m-d') === $now->format('Y-m-d')) {
            $todayC++;
        }
        if ($dt >= (new DateTime())->modify('-7 days')) {
            $weekC++;
        }
    }

    $serviceRes = $conn->query('SELECT service, COUNT(*) AS total FROM contacts GROUP BY service ORDER BY total DESC');
    while ($serviceRes && $row = $serviceRes->fetch_assoc()) {
        $serviceCounts[$row['service'] ?: 'other'] = (int)$row['total'];
    }

    $budgetRes = $conn->query('SELECT budget, COUNT(*) AS total FROM contacts GROUP BY budget ORDER BY total DESC');
    while ($budgetRes && $row = $budgetRes->fetch_assoc()) {
        $budgetCounts[$row['budget'] ?: 'unspecified'] = (int)$row['total'];
    }

    $latestRes = $conn->query('SELECT name, service, created_at FROM contacts ORDER BY id DESC LIMIT 1');
    if ($latestRes) {
        $latestContact = $latestRes->fetch_assoc();
    }
}

$messages = [
    'deleted' => 'Record deleted successfully.',
    'cleared' => 'All records cleared.',
    'invalid_request' => 'Request rejected. Please try again.',
];

$services = [
    'website' => 'Website Design',
    'landing' => 'Landing Page',
    'portfolio' => 'Portfolio',
    'ai' => 'AI Support',
    'branding' => 'Branding',
    'ecommerce' => 'E-commerce',
    'other' => 'Other',
];

$budgetMap = [
    'small' => 'Rs. 5k-10k',
    'medium' => 'Rs. 10k-25k',
    'large' => 'Rs. 25k-50k',
    'enterprise' => 'Rs. 50k+',
    'discuss' => 'Discuss',
    'unspecified' => 'Not specified',
];

$topServiceKey = array_key_first($serviceCounts);
$topService = $topServiceKey ? ($services[$topServiceKey] ?? $topServiceKey) : 'No data yet';
$topBudgetKey = array_key_first($budgetCounts);
$topBudget = $topBudgetKey ? ($budgetMap[$topBudgetKey] ?? $topBudgetKey) : 'No data yet';
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact Database - <?= h(SITE_NAME) ?></title>
  <link rel="stylesheet" href="style.css">
  <style>
    :root { --premium-bg:#050713; --premium-panel:rgba(11,15,31,.88); --premium-line:rgba(148,163,184,.16); --premium-cyan:#22d3ee; --premium-violet:#8b5cf6; --premium-green:#34d399; }
    body {
      background:
        linear-gradient(180deg,rgba(5,7,19,.68),#050713 58%),
        radial-gradient(circle at 14% 16%,rgba(34,211,238,.14),transparent 28%),
        radial-gradient(circle at 86% 8%,rgba(139,92,246,.18),transparent 30%),
        radial-gradient(circle at 50% 70%,rgba(16,185,129,.08),transparent 34%),
        #050713;
      color:var(--text-primary);
    }
    body::before {
      content:""; position:fixed; inset:0; pointer-events:none; opacity:.24; z-index:-1;
      background-image:linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);
      background-size:44px 44px; mask-image:linear-gradient(to bottom,black,transparent 82%);
    }
    .db-shell { padding-top:110px; }
    .navbar { background:rgba(5,7,19,.72); border-bottom:1px solid rgba(148,163,184,.12); backdrop-filter:blur(18px); }
    .db-hero { display:grid; grid-template-columns:minmax(0,1.4fr) minmax(280px,.6fr); gap:22px; align-items:stretch; margin-bottom:28px; }
    .db-hero-main, .db-hero-side, .db-panel, .db-stat-card, .db-table-wrap {
      background:linear-gradient(145deg,rgba(13,18,36,.92),rgba(6,9,22,.86));
      border:1px solid var(--premium-line);
      box-shadow:0 24px 80px rgba(0,0,0,.32), inset 0 1px 0 rgba(255,255,255,.05);
      backdrop-filter:blur(20px);
    }
    .db-hero-main { border-radius:22px; padding:34px; position:relative; overflow:hidden; }
    .db-hero-main::before {
      content:""; position:absolute; left:28px; right:28px; top:0; height:1px;
      background:linear-gradient(90deg,transparent,var(--premium-cyan),var(--premium-violet),transparent);
    }
    .db-hero-main::after {
      content:""; position:absolute; right:-120px; top:-120px; width:300px; height:300px;
      background:radial-gradient(circle,rgba(34,211,238,.2),transparent 68%); pointer-events:none;
    }
    .db-kicker { color:#67e8f9; font-size:.76rem; font-weight:900; letter-spacing:.16em; text-transform:uppercase; margin-bottom:12px; position:relative; z-index:1; }
    .db-hero h1 { margin:0; font-size:clamp(2rem,4vw,4rem); line-height:1; color:var(--text-primary); letter-spacing:0; }
    .db-hero p { margin:16px 0 0; color:var(--text-muted); line-height:1.7; max-width:680px; position:relative; z-index:1; }
    .db-hero-side { border-radius:22px; padding:24px; display:flex; flex-direction:column; justify-content:space-between; gap:18px; }
    .db-pulse { display:inline-flex; align-items:center; gap:8px; color:#4ade80; font-weight:800; font-size:.88rem; }
    .db-pulse span { width:9px; height:9px; border-radius:999px; background:#4ade80; box-shadow:0 0 0 8px rgba(74,222,128,.12); animation:pulse-dot 1.8s ease-in-out infinite; }
    .db-side-value { font-size:1.5rem; color:var(--text-primary); font-weight:900; line-height:1.2; }
    .db-side-label { color:var(--text-muted); font-size:.86rem; margin-top:6px; }
    .db-notify { background:rgba(74,222,128,.12); border:1px solid rgba(74,222,128,.3); color:#4ade80; border-radius:10px; padding:12px 20px; margin-bottom:24px; font-weight:700; }
    .db-notify.err { background:rgba(248,113,113,.12); border-color:rgba(248,113,113,.3); color:#f87171; }
    .db-stats { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:16px; margin-bottom:18px; }
    .db-stat-card { border-radius:18px; padding:22px; position:relative; overflow:hidden; transition:transform .22s ease, border-color .22s ease, box-shadow .22s ease; }
    .db-stat-card:hover, .db-panel:hover { transform:translateY(-2px); border-color:rgba(34,211,238,.28); box-shadow:0 28px 88px rgba(0,0,0,.38),0 0 0 1px rgba(34,211,238,.06) inset; }
    .db-stat-card::before { content:""; position:absolute; inset:0; background:linear-gradient(135deg,rgba(124,58,237,.16),transparent 58%); pointer-events:none; }
    .db-stat-label { color:var(--text-muted); font-size:.82rem; font-weight:800; text-transform:uppercase; letter-spacing:.08em; }
    .db-stat-card h2 { margin:12px 0 6px; font-size:2.35rem; font-weight:900; color:var(--text-primary); }
    .db-stat-card p { color:var(--text-muted); margin:0; font-size:.88rem; }
    .db-grid { display:grid; grid-template-columns:1fr 1fr; gap:18px; margin-bottom:18px; }
    .db-panel { border-radius:20px; padding:22px; transition:transform .22s ease, border-color .22s ease, box-shadow .22s ease; }
    .db-panel h3 { margin:0 0 18px; color:var(--text-primary); font-size:1rem; }
    .db-bar-row { display:grid; grid-template-columns:130px minmax(120px,1fr) 38px; align-items:center; gap:12px; margin:12px 0; }
    .db-bar-name { color:var(--text-secondary); font-size:.86rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .db-bar-track { height:10px; background:rgba(148,163,184,.12); border-radius:999px; overflow:hidden; box-shadow:inset 0 1px 4px rgba(0,0,0,.28); }
    .db-bar-fill { height:100%; border-radius:999px; background:linear-gradient(90deg,#22d3ee,#8b5cf6); min-width:4px; box-shadow:0 0 18px rgba(34,211,238,.24); animation:bar-rise .65s cubic-bezier(.2,.8,.2,1) both; transform-origin:left; }
    .db-bar-count { color:var(--text-muted); font-size:.82rem; text-align:right; font-weight:800; }
    .db-table-wrap { border-radius:20px; overflow:hidden; }
    .db-toolbar { display:flex; justify-content:space-between; align-items:center; padding:18px 24px; border-bottom:1px solid var(--border-glass); flex-wrap:wrap; gap:12px; }
    .db-toolbar-actions { display:flex; gap:10px; flex-wrap:wrap; align-items:center; }
    .db-search, .db-filter { background:rgba(3,7,18,.52); border:1px solid rgba(148,163,184,.18); border-radius:10px; padding:10px 14px; color:var(--text-primary); font-size:.88rem; outline:none; box-shadow:inset 0 1px 0 rgba(255,255,255,.04); transition:border-color .2s ease, box-shadow .2s ease; }
    .db-search:focus, .db-filter:focus { border-color:rgba(34,211,238,.58); box-shadow:0 0 0 4px rgba(34,211,238,.1); }
    .db-btn { padding:8px 16px; border-radius:8px; font-size:.83rem; font-weight:800; cursor:pointer; border:0; text-decoration:none; display:inline-flex; align-items:center; gap:6px; }
    .db-btn { transition:transform .2s ease, box-shadow .2s ease, border-color .2s ease; }
    .db-btn:hover { transform:translateY(-1px); }
    .db-btn-primary { background:linear-gradient(135deg,#06b6d4,#7c3aed); color:#fff; box-shadow:0 12px 28px rgba(124,58,237,.18); }
    .db-btn-muted { background:rgba(255,255,255,.06); color:var(--text-secondary); border:1px solid rgba(148,163,184,.16); }
    .db-btn-danger { background:rgba(239,68,68,.12); color:#f87171; border:1px solid rgba(239,68,68,.3); }
    table { width:100%; border-collapse:collapse; }
    th { background:rgba(139,92,246,.09); padding:13px 18px; text-align:left; font-size:.76rem; color:#aab3c8; text-transform:uppercase; white-space:nowrap; letter-spacing:.06em; border-bottom:1px solid rgba(148,163,184,.12); }
    td { padding:15px 18px; border-top:1px solid rgba(148,163,184,.12); font-size:.88rem; color:var(--text-secondary); vertical-align:top; }
    tbody tr:hover td { background:rgba(45,212,191,.04); }
    .db-service-pill { display:inline-flex; padding:5px 10px; border-radius:999px; background:rgba(34,211,238,.1); border:1px solid rgba(34,211,238,.22); color:#67e8f9; font-weight:800; font-size:.76rem; }
    .message-cell { max-width:320px; white-space:normal; line-height:1.5; }
    .empty-state, .db-error-card { text-align:center; padding:60px 20px; color:var(--text-muted); }
    .row-delete-form { margin:0; }
    @keyframes pulse-dot { 0%,100% { box-shadow:0 0 0 8px rgba(74,222,128,.12); } 50% { box-shadow:0 0 0 13px rgba(74,222,128,.04); } }
    @keyframes bar-rise { from { transform:scaleX(.18); opacity:.55; } to { transform:scaleX(1); opacity:1; } }
    @media(max-width:900px) { .db-hero, .db-grid, .db-stats { grid-template-columns:1fr; } }
    @media(max-width:760px) { .db-shell { padding-top:88px; } th:nth-child(3), td:nth-child(3), th:nth-child(5), td:nth-child(5) { display:none; } .db-hero-main { padding:24px; } .db-bar-row { grid-template-columns:1fr; gap:7px; } .db-bar-count { text-align:left; } }
  </style>
</head>
<body>
  <div class="bg-grid"></div>
  <div class="noise-overlay"></div>

  <nav class="navbar" id="navbar">
    <div class="container">
      <a href="index.html" class="nav-logo">Akarshit<span>.</span></a>
      <div class="nav-links" id="nav-links">
        <a href="index.html">Home</a>
        <a href="about.html">About</a>
        <a href="services.html">Services</a>
        <a href="projects.html">Projects</a>
        <a href="join.html">Community</a>
        <a href="database.php?logout=1">Logout</a>
      </div>
    </div>
  </nav>

  <section class="section db-shell" style="padding-top:0;">
    <div class="container">
      <div class="db-hero reveal">
        <div class="db-hero-main">
          <div class="db-kicker">Admin Command Center</div>
          <h1>Contact Intelligence</h1>
          <p>Track leads, spot demand patterns, and manage every contact form submission from one secured dashboard.</p>
        </div>
        <div class="db-hero-side">
          <div class="db-pulse"><span></span> Live MySQL</div>
          <div>
            <div class="db-side-value"><?= h($topService) ?></div>
            <div class="db-side-label">Most requested service</div>
          </div>
          <div>
            <div class="db-side-value"><?= h($topBudget) ?></div>
            <div class="db-side-label">Most common budget</div>
          </div>
        </div>
      </div>

      <?php if (isset($_GET['msg'])): ?>
        <div class="db-notify <?= isset($messages[$_GET['msg']]) && $_GET['msg'] !== 'invalid_request' ? '' : 'err' ?>">
          <?= h($messages[$_GET['msg']] ?? 'Done.') ?>
        </div>
      <?php endif; ?>

      <?php if ($dbError): ?>
        <div class="db-error-card">
          <h2>Database Not Connected</h2>
          <p><?= h($dbError) ?></p>
        </div>
      <?php else: ?>
        <div class="db-stats">
          <div class="db-stat-card">
            <div class="db-stat-label">Total Contacts</div>
            <h2><?= $total ?></h2>
            <p><?= count($members) ?> visible with current filters</p>
          </div>
          <div class="db-stat-card">
            <div class="db-stat-label">Today</div>
            <h2><?= $todayC ?></h2>
            <p>Fresh leads received today</p>
          </div>
          <div class="db-stat-card">
            <div class="db-stat-label">Last 7 Days</div>
            <h2><?= $weekC ?></h2>
            <p>Recent momentum indicator</p>
          </div>
        </div>

        <div class="db-grid">
          <div class="db-panel">
            <h3>Service Demand</h3>
            <?php if ($serviceCounts): ?>
              <?php foreach ($serviceCounts as $key => $count):
                $percent = $total > 0 ? max(4, round(($count / $total) * 100)) : 0;
                $label = $services[$key] ?? ucfirst((string)$key);
              ?>
                <div class="db-bar-row">
                  <div class="db-bar-name"><?= h($label) ?></div>
                  <div class="db-bar-track"><div class="db-bar-fill" style="width:<?= $percent ?>%;"></div></div>
                  <div class="db-bar-count"><?= $count ?></div>
                </div>
              <?php endforeach; ?>
            <?php else: ?>
              <p style="color:var(--text-muted);margin:0;">No service data yet.</p>
            <?php endif; ?>
          </div>

          <div class="db-panel">
            <h3>Budget Signals</h3>
            <?php if ($budgetCounts): ?>
              <?php foreach ($budgetCounts as $key => $count):
                $percent = $total > 0 ? max(4, round(($count / $total) * 100)) : 0;
                $label = $budgetMap[$key] ?? ucfirst((string)$key);
              ?>
                <div class="db-bar-row">
                  <div class="db-bar-name"><?= h($label) ?></div>
                  <div class="db-bar-track"><div class="db-bar-fill" style="width:<?= $percent ?>%;"></div></div>
                  <div class="db-bar-count"><?= $count ?></div>
                </div>
              <?php endforeach; ?>
            <?php else: ?>
              <p style="color:var(--text-muted);margin:0;">No budget data yet.</p>
            <?php endif; ?>
          </div>
        </div>

        <div class="db-table-wrap">
          <form method="GET" action="database.php" id="filter-form">
            <div class="db-toolbar">
              <h3>Submissions List</h3>
              <div class="db-toolbar-actions">
                <input type="text" name="q" id="db-search" class="db-search" placeholder="Search..." value="<?= h($search) ?>">
                <select name="service" class="db-filter" onchange="document.getElementById('filter-form').submit()">
                  <option value="">All Services</option>
                  <?php foreach ($services as $value => $label): ?>
                    <option value="<?= h($value) ?>" <?= $serviceFilter === $value ? 'selected' : '' ?>><?= h($label) ?></option>
                  <?php endforeach; ?>
                </select>
                <button type="submit" class="db-btn db-btn-primary">Filter</button>
                <a href="database.php" class="db-btn db-btn-muted">Reset</a>
                <?php if ($total > 0): ?>
                  <button type="submit" form="clear-all-form" class="db-btn db-btn-danger">Clear All</button>
                <?php endif; ?>
              </div>
            </div>
          </form>
          <?php if ($total > 0): ?>
            <form id="clear-all-form" method="POST" action="database.php" onsubmit="return confirm('Delete all records? This cannot be undone.')">
              <input type="hidden" name="csrf_token" value="<?= h($_SESSION['csrf_token']) ?>">
              <input type="hidden" name="action" value="clearall">
            </form>
          <?php endif; ?>

          <div style="overflow-x:auto;">
            <?php if ($members): ?>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Service</th>
                    <th>Budget</th>
                    <th>Date</th>
                    <th>Message</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  <?php foreach ($members as $m):
                    $date = new DateTime($m['created_at']);
                    $serviceLabel = $services[$m['service']] ?? $m['service'];
                    $budgetLabel = $budgetMap[$m['budget']] ?? ($m['budget'] ?: '-');
                  ?>
                    <tr>
                      <td><?= (int)$m['id'] ?></td>
                      <td><strong style="color:var(--text-primary);"><?= h($m['name']) ?></strong></td>
                      <td><a href="mailto:<?= h($m['email']) ?>" style="color:var(--accent-blue);"><?= h($m['email']) ?></a></td>
                      <td><span class="db-service-pill"><?= h($serviceLabel) ?></span></td>
                      <td><?= h($budgetLabel) ?></td>
                      <td><?= h($date->format('d M Y, h:i A')) ?></td>
                      <td class="message-cell"><?= nl2br(h($m['message'])) ?></td>
                      <td>
                        <form class="row-delete-form" method="POST" action="database.php" onsubmit="return confirm('Delete this record?')">
                          <input type="hidden" name="csrf_token" value="<?= h($_SESSION['csrf_token']) ?>">
                          <input type="hidden" name="action" value="delete">
                          <input type="hidden" name="id" value="<?= (int)$m['id'] ?>">
                          <button type="submit" class="db-btn db-btn-danger">Delete</button>
                        </form>
                      </td>
                    </tr>
                  <?php endforeach; ?>
                </tbody>
              </table>
            <?php else: ?>
              <div class="empty-state">
                <h3><?= $total === 0 ? 'No submissions yet.' : 'No results found.' ?></h3>
              </div>
            <?php endif; ?>
          </div>
        </div>
      <?php endif; ?>
    </div>
  </section>

  <script src="main.js"></script>
  <script>
    const searchInput = document.getElementById('db-search');
    if (searchInput) {
      let searchTimer;
      searchInput.addEventListener('input', () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => document.getElementById('filter-form').submit(), 450);
      });
    }
  </script>
</body>
</html>
