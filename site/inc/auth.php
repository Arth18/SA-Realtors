<?php
/* Login for the admin. One password, stored only as a hash, never in plain text.
   Also carries the CSRF token so a form cannot be submitted from another site. */

declare(strict_types=1);

require_once __DIR__ . '/store.php';

const CONFIG_FILE = DATA_DIR . '/config.php';
const LOGIN_LOG   = DATA_DIR . '/login-attempts.json';

function start_session(): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;
    session_set_cookie_params([
        'httponly' => true,
        'samesite' => 'Lax',
        'secure'   => !empty($_SERVER['HTTPS']),
    ]);
    session_start();
}

function config(): array {
    if (!is_file(CONFIG_FILE)) return [];
    if (!defined('SA_ADMIN')) define('SA_ADMIN', true);   /* the guard config.php checks for */
    $c = require CONFIG_FILE;
    return is_array($c) ? $c : [];
}

function is_set_up(): bool {
    $c = config();
    return !empty($c['password_hash']);
}

function write_config(string $password): bool {
    if (!is_dir(DATA_DIR)) mkdir(DATA_DIR, 0775, true);
    $hash = password_hash($password, PASSWORD_DEFAULT);
    /* The guard means this file serves a 404 rather than its contents if anyone
       ever requests it directly, even on a server that stops running PHP. */
    $body = "<?php\n/* Written by the admin setup screen. Never edit by hand.\n"
          . "   This is a one-way hash, not your password. */\n"
          . "if (!defined('SA_ADMIN')) { http_response_code(404); exit; }\nreturn "
          . var_export(['password_hash' => $hash, 'created' => date('c')], true) . ";\n";
    return file_put_contents(CONFIG_FILE, $body, LOCK_EX) !== false;
}

/* ---------- brute force slowdown ---------- */

function attempts(): array {
    if (!is_file(LOGIN_LOG)) return [];
    $a = json_decode((string)file_get_contents(LOGIN_LOG), true);
    return is_array($a) ? $a : [];
}

function note_attempt(bool $ok): void {
    $log = attempts();
    $ip  = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $now = time();
    $log = array_values(array_filter($log, fn($r) => ($r['t'] ?? 0) > $now - 900));
    if (!$ok) $log[] = ['ip' => $ip, 't' => $now];
    @file_put_contents(LOGIN_LOG, json_encode($log), LOCK_EX);
}

function lockout_seconds(): int {
    $ip  = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $now = time();
    $recent = array_filter(attempts(), fn($r) => ($r['ip'] ?? '') === $ip && ($r['t'] ?? 0) > $now - 900);
    $n = count($recent);
    if ($n < 5) return 0;
    $last = max(array_map(fn($r) => $r['t'], $recent));
    $wait = min(300, 15 * (2 ** ($n - 5)));
    return max(0, ($last + $wait) - $now);
}

/* ---------- session ---------- */

function is_logged_in(): bool {
    start_session();
    return !empty($_SESSION['sa_admin']);
}

function log_in(): void {
    start_session();
    session_regenerate_id(true);
    $_SESSION['sa_admin'] = true;
    $_SESSION['since']    = time();
}

function log_out(): void {
    start_session();
    $_SESSION = [];
    session_destroy();
}

function require_login(): void {
    if (!is_logged_in()) {
        header('Location: login.php');
        exit;
    }
}

/* ---------- CSRF ---------- */

function csrf_token(): string {
    start_session();
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
    return $_SESSION['csrf'];
}

function csrf_ok(?string $sent): bool {
    start_session();
    return !empty($_SESSION['csrf']) && is_string($sent) && hash_equals($_SESSION['csrf'], $sent);
}

function csrf_field(): string {
    return '<input type="hidden" name="csrf" value="' . htmlspecialchars(csrf_token(), ENT_QUOTES) . '">';
}

function h(?string $s): string {
    return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8');
}
