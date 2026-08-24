<?php
/* The list of every property, grouped by status. The home screen of the admin. */
declare(strict_types=1);
require_once __DIR__ . '/../inc/auth.php';
require_once __DIR__ . '/_layout.php';
require_login();

$rows  = sort_properties(load_all());
$stats = agency_stats();

$counts = [];
foreach (STATES as $s) $counts[$s] = 0;
foreach ($rows as $p) { $st = $p['state'] ?? ''; if (isset($counts[$st])) $counts[$st]++; }

admin_head('Properties');
show_flash();
?>
<div class="head">
  <div>
    <h1>Your properties</h1>
    <p class="head__sub"><?= count($rows) ?> in total &middot;
      <?= $stats['sold'] ?> sold &middot; <?= $stats['acres'] ?> acres of land &middot;
      <?= $stats['suburbs'] ?> suburbs</p>
  </div>
  <a class="btn" href="edit.php">Add a property</a>
</div>

<div class="tally">
  <?php foreach (STATES as $s): ?>
    <span class="tally__i"><b><?= $counts[$s] ?></b> <?= h($s) ?></span>
  <?php endforeach; ?>
</div>

<?php if (!$rows): ?>
  <div class="empty">
    <h2>Nothing here yet</h2>
    <p>Add your first property and it will appear on the website straight away.</p>
    <a class="btn" href="edit.php">Add a property</a>
  </div>
<?php else: ?>
<table class="rows">
  <thead>
    <tr><th>Photo</th><th>Property</th><th>Status</th><th>Price</th><th>Updated</th><th></th></tr>
  </thead>
  <tbody>
  <?php foreach ($rows as $p):
      $photo = $p['photos'][0] ?? '';
      $tag   = strtolower(str_replace(' ', '-', $p['state'] ?? ''));
  ?>
    <tr>
      <td class="rows__pic">
        <?php if ($photo): ?>
          <img src="../<?= IMG_WEB . h($photo) ?>" alt="" loading="lazy" width="90" height="60">
        <?php else: ?><span class="rows__nopic">none</span><?php endif; ?>
      </td>
      <td>
        <a class="rows__title" href="edit.php?p=<?= urlencode($p['slug']) ?>"><?= h($p['address']) ?></a>
        <span class="rows__meta"><?= h($p['suburb']) ?>
          <?php if (($p['kind'] ?? '') === 'land'): ?> &middot; land<?php endif; ?>
          <?php if (!empty($p['photos'])): ?> &middot; <?= count($p['photos']) ?> photos<?php endif; ?>
        </span>
      </td>
      <td><span class="tag tag--<?= h($tag) ?>"><?= h($p['state']) ?></span></td>
      <td class="rows__price"><?= h($p['price'] ?: '—') ?></td>
      <td class="rows__date"><?= h($p['updated'] ?? '') ?></td>
      <td class="rows__act">
        <a class="lnk" href="edit.php?p=<?= urlencode($p['slug']) ?>">Edit</a>
        <form method="post" action="delete.php" class="inline"
              data-confirm="Delete <?= h($p['address']) ?>? This also deletes its photos and cannot be undone.">
          <?= csrf_field() ?>
          <input type="hidden" name="slug" value="<?= h($p['slug']) ?>">
          <button class="lnk lnk--bad" type="submit">Delete</button>
        </form>
      </td>
    </tr>
  <?php endforeach; ?>
  </tbody>
</table>
<?php endif; ?>
<?php admin_foot(); ?>
