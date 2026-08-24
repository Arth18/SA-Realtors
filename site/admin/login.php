<?php
/* Login, and first-run setup when no password exists yet. */
declare(strict_types=1);
require_once __DIR__ . '/../inc/auth.php';
require_once __DIR__ . '/_layout.php';

start_session();
if (is_logged_in()) { header('Location: index.php'); exit; }

$setup = !is_set_up();
$error = '';
$wait  = lockout_seconds();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_ok($_POST['csrf'] ?? null)) {
        $error = 'That form expired. Try again.';
    } elseif ($setup) {
        $p1 = (string)($_POST['password'] ?? '');
        $p2 = (string)($_POST['password2'] ?? '');
        if (strlen($p1) < 10)      $error = 'Use at least 10 characters.';
        elseif ($p1 !== $p2)       $error = 'The two passwords do not match.';
        elseif (!write_config($p1)) $error = 'Could not save. Check the data folder is writable.';
        else { log_in(); header('Location: index.php'); exit; }
    } elseif ($wait > 0) {
        $error = 'Too many attempts. Wait ' . $wait . ' seconds.';
    } else {
        $c = config();
        if (password_verify((string)($_POST['password'] ?? ''), $c['password_hash'])) {
            note_attempt(true);
            log_in();
            header('Location: index.php');
            exit;
        }
        note_attempt(false);
        $error = 'That password is not right.';
        $wait  = lockout_seconds();
    }
}

admin_head($setup ? 'Set your password' : 'Log in', false);
?>
<div class="login">
  <h1><?= $setup ? 'Set your password' : 'SA Realtors admin' ?></h1>

  <?php if ($setup): ?>
    <p class="login__note">Nobody has set a password yet. Choose one now. It is stored
    as a one way hash, so nobody, including me, can read it back. Write it down somewhere safe.</p>
  <?php else: ?>
    <p class="login__note">Enter your password to manage your listings.</p>
  <?php endif; ?>

  <?php if ($error): ?><p class="flash flash--bad" role="alert"><?= h($error) ?></p><?php endif; ?>

  <form method="post" autocomplete="off">
    <?= csrf_field() ?>
    <label for="password"><?= $setup ? 'New password' : 'Password' ?></label>
    <input id="password" name="password" type="password" required autofocus
           autocomplete="<?= $setup ? 'new-password' : 'current-password' ?>"
           <?= $wait > 0 && !$setup ? 'disabled' : '' ?>>

    <?php if ($setup): ?>
      <label for="password2">Type it again</label>
      <input id="password2" name="password2" type="password" required autocomplete="new-password">
    <?php endif; ?>

    <button class="btn btn--wide" type="submit" <?= $wait > 0 && !$setup ? 'disabled' : '' ?>>
      <?= $setup ? 'Save password and continue' : 'Log in' ?>
    </button>
    <?php if ($wait > 0 && !$setup): ?>
      <p class="login__note">Locked for <?= $wait ?> seconds after repeated wrong attempts.</p>
    <?php endif; ?>
  </form>
</div>
<?php admin_foot(); ?>
