<?php
/* Removes a property and its photo files. POST only, CSRF checked. */
declare(strict_types=1);
require_once __DIR__ . '/../inc/auth.php';
require_once __DIR__ . '/_layout.php';
require_login();

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !csrf_ok($_POST['csrf'] ?? null)) {
    flash('That request was not valid.', 'bad');
    header('Location: index.php');
    exit;
}

$slug = (string)($_POST['slug'] ?? '');
$p    = find_property($slug);

if (!$p) {
    flash('That property was not found.', 'bad');
} else {
    $gone = delete_property($slug);          /* remove the record first */
    if ($gone) {
        foreach ($p['photos'] ?? [] as $photo) delete_photo_file($photo);
        flash('Deleted ' . $p['address'] . '. It is off the website now.', 'ok');
    } else {
        flash('Could not delete that one. Nothing was changed.', 'bad');
    }
}

header('Location: index.php');
