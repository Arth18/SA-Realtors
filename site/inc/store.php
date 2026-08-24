<?php
/* SA Realtors — the listing store.
   One JSON file is the source of truth. Every write goes through save(), which
   writes to a temp file and renames it, so a crash mid-write can never leave you
   with a half-written listings file. */

declare(strict_types=1);

const DATA_DIR  = __DIR__ . '/../data';
const DATA_FILE = DATA_DIR . '/properties.json';
const IMG_DIR   = __DIR__ . '/../assets/img';
const IMG_WEB   = 'assets/img/';

const STATES = ['For Sale', 'For Rent', 'Leased', 'Sold'];
const KINDS  = ['residential' => 'Residential', 'land' => 'Land or development site'];

/* ---------- read and write ---------- */

function load_all(): array {
    if (!is_file(DATA_FILE)) return [];
    $raw = file_get_contents(DATA_FILE);
    $rows = json_decode($raw, true);
    return is_array($rows) ? $rows : [];
}

function save_all(array $rows): bool {
    if (!is_dir(DATA_DIR)) mkdir(DATA_DIR, 0775, true);
    $json = json_encode(array_values($rows), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    if ($json === false) return false;

    /* keep one rolling backup, so a bad edit is always recoverable */
    if (is_file(DATA_FILE)) @copy(DATA_FILE, DATA_DIR . '/properties.backup.json');

    $tmp = DATA_FILE . '.tmp';
    if (file_put_contents($tmp, $json, LOCK_EX) === false) return false;
    return rename($tmp, DATA_FILE);
}

function find_property(string $slug): ?array {
    foreach (load_all() as $p) if (($p['slug'] ?? '') === $slug) return $p;
    return null;
}

function delete_property(string $slug): bool {
    $rows = load_all();
    $kept = array_filter($rows, fn($p) => ($p['slug'] ?? '') !== $slug);
    if (count($kept) === count($rows)) return false;
    return save_all($kept);
}

/* ---------- helpers ---------- */

function slugify(string $s): string {
    $s = strtolower(trim($s));
    if (function_exists('iconv')) {
        $t = @iconv('UTF-8', 'ASCII//TRANSLIT', $s);
        if ($t !== false) $s = $t;
    }
    $s = preg_replace('/[^a-z0-9]+/', '-', $s) ?? '';
    return trim($s, '-');
}

function unique_slug(string $base, ?string $ignore = null): string {
    $base = $base !== '' ? $base : 'property';
    $taken = [];
    foreach (load_all() as $p) {
        if ($ignore !== null && ($p['slug'] ?? '') === $ignore) continue;
        $taken[$p['slug'] ?? ''] = true;
    }
    if (!isset($taken[$base])) return $base;
    for ($i = 2; $i < 500; $i++) {
        if (!isset($taken[$base . '-' . $i])) return $base . '-' . $i;
    }
    return $base . '-' . time();
}

/** Turn a textarea into a clean list, one item per line, blanks dropped. */
function lines_to_list(string $text): array {
    $out = [];
    foreach (preg_split('/\R/', $text) ?: [] as $line) {
        $line = trim($line);
        $line = ltrim($line, "•-* \t");
        if ($line !== '') $out[] = trim($line);
    }
    return $out;
}

/** Paragraphs are separated by a blank line. */
function text_to_paragraphs(string $text): array {
    $out = [];
    foreach (preg_split('/\R\s*\R/', trim($text)) ?: [] as $para) {
        $para = trim(preg_replace('/\s+/', ' ', $para) ?? '');
        if ($para !== '') $out[] = $para;
    }
    return $out;
}

function paragraphs_to_text(array $paras): string { return implode("\n\n", $paras); }

/** "Label: value" per line, for the specs panel. */
function lines_to_specs(string $text): array {
    $out = [];
    foreach (preg_split('/\R/', $text) ?: [] as $line) {
        $line = trim($line);
        if ($line === '') continue;
        $bits = explode(':', $line, 2);
        if (count($bits) === 2 && trim($bits[0]) !== '' && trim($bits[1]) !== '') {
            $out[] = [trim($bits[0]), trim($bits[1])];
        }
    }
    return $out;
}

function specs_to_text(array $specs): string {
    $out = [];
    foreach ($specs as $s) {
        if (is_array($s) && count($s) >= 2) $out[] = $s[0] . ': ' . $s[1];
    }
    return implode("\n", $out);
}

/* ---------- validation ---------- */

/** Returns [cleanRow, errors]. Never trusts anything from the form. */
function validate_property(array $in, ?string $editingSlug = null): array {
    $e = [];

    $address = trim($in['address'] ?? '');
    $suburb  = trim($in['suburb'] ?? '');
    $state   = $in['state'] ?? '';
    $kind    = $in['kind'] ?? 'residential';

    if ($address === '')          $e['address'] = 'Give the property an address.';
    if ($suburb === '')           $e['suburb']  = 'Which suburb is it in?';
    if (!in_array($state, STATES, true)) $e['state'] = 'Pick a status.';
    if (!array_key_exists($kind, KINDS)) $kind = 'residential';

    $num = function (string $v): string {
        $v = trim($v);
        return preg_match('/^\d{1,2}$/', $v) ? $v : '';
    };

    $slug = $editingSlug ?? unique_slug(slugify($address));

    $row = [
        'slug'         => $slug,
        'address'      => $address,
        'suburb'       => $suburb,
        'state'        => in_array($state, STATES, true) ? $state : 'For Sale',
        'kind'         => $kind,
        'propertyType' => trim($in['propertyType'] ?? ''),
        'price'        => trim($in['price'] ?? ''),
        'beds'         => $num($in['beds'] ?? ''),
        'baths'        => $num($in['baths'] ?? ''),
        'cars'         => $num($in['cars'] ?? ''),
        'land'         => trim($in['land'] ?? ''),
        'internal'     => trim($in['internal'] ?? ''),
        'built'        => trim($in['built'] ?? ''),
        'headline'     => trim($in['headline'] ?? ''),
        'subhead'      => trim($in['subhead'] ?? ''),
        'body'         => text_to_paragraphs($in['body'] ?? ''),
        'features'     => lines_to_list($in['features'] ?? ''),
        'specs'        => lines_to_specs($in['specs'] ?? ''),
        'disclaimer'   => trim($in['disclaimer'] ?? ''),
        'metaDesc'     => trim($in['metaDesc'] ?? ''),
        'photos'       => [],
        'updated'      => date('Y-m-d'),
    ];

    return [$row, $e];
}

/* ---------- photos ---------- */

/** Longest edge each stored photo is resized to. */
const PHOTO_MAX = 1600;

/**
 * Accepts one uploaded file, checks it really is an image, resizes it and
 * writes it into assets/img. Returns the stored filename or null with a reason.
 */
function store_photo(array $file, string $slug, int $index, ?string &$err = null): ?string {
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) return null;
    if ($file['error'] !== UPLOAD_ERR_OK) { $err = 'Upload failed, code ' . $file['error']; return null; }

    $tmp = $file['tmp_name'];
    if (!is_uploaded_file($tmp) && !is_file($tmp)) { $err = 'Upload was not received.'; return null; }

    $info = @getimagesize($tmp);
    if ($info === false) { $err = 'That file is not an image.'; return null; }
    [$w, $h, $type] = $info;

    $src = match ($type) {
        IMAGETYPE_JPEG => @imagecreatefromjpeg($tmp),
        IMAGETYPE_PNG  => @imagecreatefrompng($tmp),
        IMAGETYPE_WEBP => @imagecreatefromwebp($tmp),
        IMAGETYPE_GIF  => @imagecreatefromgif($tmp),
        default        => null,
    };
    if (!$src) { $err = 'That image format is not supported. Use JPG, PNG or WebP.'; return null; }

    /* phone photos carry rotation in their metadata, so honour it */
    if ($type === IMAGETYPE_JPEG && function_exists('exif_read_data')) {
        $exif = @exif_read_data($tmp);
        $o = $exif['Orientation'] ?? 1;
        if ($o === 3) $src = imagerotate($src, 180, 0);
        elseif ($o === 6) { $src = imagerotate($src, -90, 0); [$w, $h] = [$h, $w]; }
        elseif ($o === 8) { $src = imagerotate($src, 90, 0);  [$w, $h] = [$h, $w]; }
    }

    $scale = min(1, PHOTO_MAX / max($w, $h));
    $nw = max(1, (int)round($w * $scale));
    $nh = max(1, (int)round($h * $scale));

    $dst = imagecreatetruecolor($nw, $nh);
    imagecopyresampled($dst, $src, 0, 0, 0, 0, $nw, $nh, $w, $h);

    if (!is_dir(IMG_DIR)) mkdir(IMG_DIR, 0775, true);
    $name = $slug . '-p' . $index . '-' . substr((string)time(), -5) . '.webp';
    $ok = function_exists('imagewebp')
        ? imagewebp($dst, IMG_DIR . '/' . $name, 82)
        : imagejpeg($dst, IMG_DIR . '/' . ($name = str_replace('.webp', '.jpg', $name)), 86);

    imagedestroy($src);
    imagedestroy($dst);

    if (!$ok) { $err = 'Could not save the resized image.'; return null; }
    return $name;
}

/** Removes a photo file, but only from inside assets/img. */
function delete_photo_file(string $name): void {
    $name = basename($name);
    $path = IMG_DIR . '/' . $name;
    if (is_file($path) && str_starts_with(realpath($path) ?: '', realpath(IMG_DIR) ?: '')) {
        @unlink($path);
    }
}

/* ---------- derived views, shared with the public pages ---------- */

function sort_properties(array $rows): array {
    $rank = ['For Sale' => 0, 'For Rent' => 1, 'Sold' => 2, 'Leased' => 3];
    usort($rows, function ($a, $b) use ($rank) {
        $ra = $rank[$a['state'] ?? ''] ?? 9;
        $rb = $rank[$b['state'] ?? ''] ?? 9;
        if ($ra !== $rb) return $ra <=> $rb;
        return strcmp($a['address'] ?? '', $b['address'] ?? '');
    });
    return $rows;
}

function by_state(string $state): array {
    return array_values(array_filter(load_all(), fn($p) => ($p['state'] ?? '') === $state));
}

function suburbs_list(): array {
    $s = array_unique(array_map(fn($p) => $p['suburb'] ?? '', load_all()));
    $s = array_values(array_filter($s));
    sort($s);
    return $s;
}

function agency_stats(): array {
    $rows = load_all();
    $sold = array_filter($rows, fn($p) => ($p['state'] ?? '') === 'Sold');
    $acres = 0.0;
    foreach ($rows as $p) {
        if (($p['kind'] ?? '') === 'land') $acres += (float)($p['land'] ?? 0);
    }
    return [
        'sold'    => count($sold),
        'acres'   => rtrim(rtrim(number_format($acres, 1, '.', ''), '0'), '.'),
        'suburbs' => count(suburbs_list()),
    ];
}
