<?php
declare(strict_types=1);
require_once __DIR__ . '/../inc/auth.php';
log_out();
header('Location: login.php');
