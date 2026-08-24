<?php
/* Shared chrome for every admin screen. Deliberately plain: this is a tool,
   not a showpiece, and it should be readable on a phone at an inspection. */
declare(strict_types=1);

function admin_head(string $title, bool $nav = true): void { ?>
<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title><?= h($title) ?> · SA Realtors admin</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23101C3D'/%3E%3Crect x='9' y='9' width='14' height='14' fill='none' stroke='%23F07C1F' stroke-width='2.6' transform='rotate(45 16 16)'/%3E%3C/svg%3E">
<link rel="stylesheet" href="admin.css">
</head>
<body>
<?php if ($nav): ?>
<header class="bar">
  <a class="bar__brand" href="index.php">SA Realtors <span>admin</span></a>
  <nav class="bar__nav">
    <a href="index.php">Properties</a>
    <a href="edit.php">Add a property</a>
    <a href="../index.html" target="_blank" rel="noopener">View site</a>
  </nav>
  <a class="bar__out" href="logout.php">Log out</a>
</header>
<?php endif; ?>
<main class="wrap">
<?php }

function admin_foot(): void { ?>
</main>
<script src="admin.js"></script>
</body>
</html>
<?php }

/** One-off message carried across a redirect. */
function flash(?string $msg = null, string $kind = 'ok'): ?array {
    start_session();
    if ($msg !== null) { $_SESSION['flash'] = ['msg' => $msg, 'kind' => $kind]; return null; }
    $f = $_SESSION['flash'] ?? null;
    unset($_SESSION['flash']);
    return $f;
}

function show_flash(): void {
    $f = flash();
    if (!$f) return;
    printf('<p class="flash flash--%s" role="status">%s</p>', h($f['kind']), h($f['msg']));
}
