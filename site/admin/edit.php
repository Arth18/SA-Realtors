<?php
/* Add a new property, or edit an existing one. Handles photo upload, reorder
   and removal in the same form, so one Save does everything. */
declare(strict_types=1);
require_once __DIR__ . '/../inc/auth.php';
require_once __DIR__ . '/_layout.php';
require_login();

$slug     = isset($_GET['p']) ? (string)$_GET['p'] : '';
$existing = $slug !== '' ? find_property($slug) : null;
$isNew    = $existing === null;
if ($slug !== '' && $isNew) { flash('That property no longer exists.', 'bad'); header('Location: index.php'); exit; }

$errors = [];
$photoNotes = [];

/* what the form shows: either the saved row, or blanks */
$f = $existing ?? [
    'address' => '', 'suburb' => '', 'state' => 'For Sale', 'kind' => 'residential',
    'propertyType' => '', 'price' => '', 'beds' => '', 'baths' => '', 'cars' => '',
    'land' => '', 'internal' => '', 'built' => '', 'headline' => '', 'subhead' => '',
    'body' => [], 'features' => [], 'specs' => [], 'disclaimer' => '', 'metaDesc' => '',
    'photos' => [], 'slug' => '',
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!csrf_ok($_POST['csrf'] ?? null)) {
        $errors['form'] = 'That form expired. Please try again.';
    } else {
        [$row, $errors] = validate_property($_POST, $existing['slug'] ?? null);

        /* keep whatever photos survived the form, in the order given */
        $keep = $_POST['keep'] ?? [];
        $keep = is_array($keep) ? array_values(array_map('basename', $keep)) : [];
        $was  = $existing['photos'] ?? [];
        $row['photos'] = array_values(array_intersect($keep, $was));

        /* anything dropped gets its file removed too, so nothing is orphaned */
        foreach (array_diff($was, $row['photos']) as $gone) delete_photo_file($gone);

        /* new uploads append */
        if (!empty($_FILES['photos']['name'][0])) {
            $n = count($_FILES['photos']['name']);
            for ($i = 0; $i < $n; $i++) {
                $one = [
                    'name'     => $_FILES['photos']['name'][$i],
                    'type'     => $_FILES['photos']['type'][$i],
                    'tmp_name' => $_FILES['photos']['tmp_name'][$i],
                    'error'    => $_FILES['photos']['error'][$i],
                    'size'     => $_FILES['photos']['size'][$i],
                ];
                $err = null;
                $stored = store_photo($one, $row['slug'], count($row['photos']) + 1, $err);
                if ($stored) $row['photos'][] = $stored;
                elseif ($err) $photoNotes[] = $one['name'] . ': ' . $err;
            }
        }

        /* move one photo to the front, so it becomes the main image */
        $main = basename((string)($_POST['main'] ?? ''));
        if ($main !== '' && in_array($main, $row['photos'], true)) {
            $row['photos'] = array_merge([$main], array_values(array_diff($row['photos'], [$main])));
        }

        if (!$errors) {
            $all = load_all();
            if ($isNew) {
                $all[] = $row;
            } else {
                foreach ($all as $i => $p) if (($p['slug'] ?? '') === $existing['slug']) $all[$i] = $row;
            }
            if (save_all($all)) {
                $msg = ($isNew ? 'Added ' : 'Saved ') . $row['address'] . '. It is live on the website now.';
                if ($photoNotes) $msg .= ' Some photos were skipped: ' . implode('; ', $photoNotes);
                flash($msg, $photoNotes ? 'warn' : 'ok');
                header('Location: index.php');
                exit;
            }
            $errors['form'] = 'Could not save. Check the data folder is writable.';
        }
        $f = $row;                       /* redisplay what they typed */
        $f['photos'] = $row['photos'];
    }
}

$bodyText     = is_array($f['body']) ? paragraphs_to_text($f['body']) : (string)$f['body'];
$featuresText = is_array($f['features']) ? implode("\n", $f['features']) : (string)$f['features'];
$specsText    = is_array($f['specs']) ? specs_to_text($f['specs']) : (string)$f['specs'];

admin_head($isNew ? 'Add a property' : 'Edit property');
?>
<div class="head">
  <div>
    <h1><?= $isNew ? 'Add a property' : 'Edit property' ?></h1>
    <?php if (!$isNew): ?>
      <p class="head__sub"><?= h($f['address']) ?></p>
    <?php endif; ?>
  </div>
  <a class="lnk" href="index.php">Back to the list</a>
</div>

<?php if (!empty($errors['form'])): ?>
  <p class="flash flash--bad" role="alert"><?= h($errors['form']) ?></p>
<?php elseif ($errors): ?>
  <p class="flash flash--bad" role="alert">Some fields need attention. They are marked below.</p>
<?php endif; ?>
<?php if ($photoNotes): ?>
  <p class="flash flash--warn"><?= h(implode(' · ', $photoNotes)) ?></p>
<?php endif; ?>

<form method="post" enctype="multipart/form-data" class="form" id="propform">
  <?= csrf_field() ?>

  <section class="card">
    <h2>The basics</h2>
    <div class="grid">
      <p class="f f--wide<?= isset($errors['address']) ? ' f--bad' : '' ?>">
        <label for="address">Address</label>
        <input id="address" name="address" value="<?= h($f['address']) ?>" required
               placeholder="12/317 Portrush Road, Norwood, SA 5067">
        <?php if (isset($errors['address'])): ?><span class="err"><?= h($errors['address']) ?></span><?php endif; ?>
      </p>
      <p class="f<?= isset($errors['suburb']) ? ' f--bad' : '' ?>">
        <label for="suburb">Suburb</label>
        <input id="suburb" name="suburb" value="<?= h($f['suburb']) ?>" required
               list="suburbs" placeholder="Norwood">
        <datalist id="suburbs">
          <?php foreach (suburbs_list() as $s): ?><option value="<?= h($s) ?>"><?php endforeach; ?>
        </datalist>
        <?php if (isset($errors['suburb'])): ?><span class="err"><?= h($errors['suburb']) ?></span><?php endif; ?>
      </p>
      <p class="f">
        <label for="state">Status</label>
        <select id="state" name="state">
          <?php foreach (STATES as $s): ?>
            <option <?= ($f['state'] ?? '') === $s ? 'selected' : '' ?>><?= h($s) ?></option>
          <?php endforeach; ?>
        </select>
      </p>
      <p class="f">
        <label for="kind">Type</label>
        <select id="kind" name="kind">
          <?php foreach (KINDS as $k => $lbl): ?>
            <option value="<?= h($k) ?>" <?= ($f['kind'] ?? '') === $k ? 'selected' : '' ?>><?= h($lbl) ?></option>
          <?php endforeach; ?>
        </select>
      </p>
      <p class="f">
        <label for="price">Price</label>
        <input id="price" name="price" value="<?= h($f['price']) ?>"
               placeholder="$545,000 - $565,000, or 10 acres">
        <span class="hint">However you want it to read. Leave blank for Sold if you would rather not show it.</span>
      </p>
      <p class="f">
        <label for="propertyType">Described as</label>
        <input id="propertyType" name="propertyType" value="<?= h($f['propertyType']) ?>"
               placeholder="House, Unit, Development site">
      </p>
    </div>
  </section>

  <section class="card">
    <h2>Size and features</h2>
    <div class="grid grid--six">
      <p class="f"><label for="beds">Bedrooms</label><input id="beds" name="beds" inputmode="numeric" value="<?= h($f['beds']) ?>"></p>
      <p class="f"><label for="baths">Bathrooms</label><input id="baths" name="baths" inputmode="numeric" value="<?= h($f['baths']) ?>"></p>
      <p class="f"><label for="cars">Car spaces</label><input id="cars" name="cars" inputmode="numeric" value="<?= h($f['cars']) ?>"></p>
      <p class="f"><label for="land">Land size</label><input id="land" name="land" value="<?= h($f['land']) ?>" placeholder="508m² or 10 acres"></p>
      <p class="f"><label for="internal">Building size</label><input id="internal" name="internal" value="<?= h($f['internal']) ?>" placeholder="330m²"></p>
      <p class="f"><label for="built">Year built</label><input id="built" name="built" value="<?= h($f['built']) ?>" placeholder="1975"></p>
    </div>
  </section>

  <section class="card">
    <h2>Photos</h2>
    <p class="hint">Drag to reorder. The first one is the main image people see. Big photos are resized automatically.</p>

    <?php if (!empty($f['photos'])): ?>
      <ul class="pics" id="pics">
        <?php foreach ($f['photos'] as $i => $ph): ?>
          <li class="pic<?= $i === 0 ? ' pic--main' : '' ?>" draggable="true">
            <img src="../<?= IMG_WEB . h($ph) ?>" alt="" loading="lazy">
            <input type="hidden" name="keep[]" value="<?= h($ph) ?>">
            <span class="pic__badge"><?= $i === 0 ? 'Main' : $i + 1 ?></span>
            <span class="pic__acts">
              <button type="button" class="pic__btn js-main" data-file="<?= h($ph) ?>" title="Make this the main image">Main</button>
              <button type="button" class="pic__btn pic__btn--bad js-drop" title="Remove this photo">Remove</button>
            </span>
          </li>
        <?php endforeach; ?>
      </ul>
      <input type="hidden" name="main" id="mainPhoto" value="<?= h($f['photos'][0] ?? '') ?>">
    <?php else: ?>
      <p class="hint">No photos yet.</p>
      <input type="hidden" name="main" id="mainPhoto" value="">
    <?php endif; ?>

    <p class="f f--wide">
      <label for="photos">Add photos</label>
      <input id="photos" name="photos[]" type="file" accept="image/*" multiple>
      <span class="hint">JPG, PNG or WebP. You can pick several at once, straight off your phone.</span>
    </p>
  </section>

  <section class="card">
    <h2>The write up</h2>
    <p class="f f--wide">
      <label for="headline">Headline</label>
      <input id="headline" name="headline" value="<?= h($f['headline']) ?>"
             placeholder="Stylish low-maintenance living in the heart of Norwood">
    </p>
    <p class="f f--wide">
      <label for="subhead">Small line under it</label>
      <input id="subhead" name="subhead" value="<?= h($f['subhead']) ?>"
             placeholder="Private open, welcome by appointment only">
    </p>
    <p class="f f--wide">
      <label for="body">Description</label>
      <textarea id="body" name="body" rows="10" placeholder="Leave a blank line between paragraphs."><?= h($bodyText) ?></textarea>
      <span class="hint">Blank line between paragraphs. Paste straight from your REA listing if you like.</span>
    </p>
    <p class="f f--wide">
      <label for="features">Feature list</label>
      <textarea id="features" name="features" rows="7" placeholder="One per line"><?= h($featuresText) ?></textarea>
      <span class="hint">One per line. Bullets and dashes at the start get stripped automatically.</span>
    </p>
    <p class="f f--wide">
      <label for="specs">Specifications</label>
      <textarea id="specs" name="specs" rows="6" placeholder="Council: City of Norwood&#10;Council rates: $352 per quarter"><?= h($specsText) ?></textarea>
      <span class="hint">One per line, as <b>Label: value</b>. These fill the panel beside the description.</span>
    </p>
    <p class="f f--wide">
      <label for="disclaimer">Disclaimer</label>
      <textarea id="disclaimer" name="disclaimer" rows="3"><?= h($f['disclaimer']) ?></textarea>
    </p>
    <p class="f f--wide">
      <label for="metaDesc">Search engine summary</label>
      <input id="metaDesc" name="metaDesc" value="<?= h($f['metaDesc']) ?>" maxlength="180">
      <span class="hint">One sentence, shown in Google results. Leave blank and one is written for you.</span>
    </p>
  </section>

  <div class="actions">
    <button class="btn btn--wide" type="submit"><?= $isNew ? 'Add this property' : 'Save changes' ?></button>
    <a class="lnk" href="index.php">Cancel</a>
  </div>
</form>
<?php admin_foot(); ?>
