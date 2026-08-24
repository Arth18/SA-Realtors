/* Admin behaviour: confirm before deleting, drag photos to reorder,
   pick a main image, remove a photo. No dependencies. */
(function () {
  'use strict';

  /* ---- confirm destructive actions ---- */
  document.addEventListener('submit', function (e) {
    var msg = e.target.getAttribute && e.target.getAttribute('data-confirm');
    if (msg && !window.confirm(msg)) e.preventDefault();
  });

  var pics = document.getElementById('pics');
  if (!pics) return;
  var mainField = document.getElementById('mainPhoto');

  function renumber() {
    var items = pics.querySelectorAll('.pic');
    items.forEach(function (li, i) {
      li.classList.toggle('pic--main', i === 0);
      var badge = li.querySelector('.pic__badge');
      if (badge) badge.textContent = i === 0 ? 'Main' : String(i + 1);
    });
    var first = pics.querySelector('.pic input[name="keep[]"]');
    if (mainField) mainField.value = first ? first.value : '';
    if (!items.length && mainField) mainField.value = '';
  }

  /* ---- remove ---- */
  pics.addEventListener('click', function (e) {
    var drop = e.target.closest('.js-drop');
    if (drop) {
      var li = drop.closest('.pic');
      if (li && window.confirm('Remove this photo? It is deleted when you save.')) {
        li.remove();
        renumber();
      }
      return;
    }
    var main = e.target.closest('.js-main');
    if (main) {
      var item = main.closest('.pic');
      if (item) { pics.insertBefore(item, pics.firstElementChild); renumber(); }
    }
  });

  /* ---- drag to reorder ---- */
  var dragging = null;

  pics.addEventListener('dragstart', function (e) {
    var li = e.target.closest('.pic');
    if (!li) return;
    dragging = li;
    li.classList.add('dragging');
    if (e.dataTransfer) { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', ''); }
  });

  pics.addEventListener('dragend', function () {
    if (dragging) dragging.classList.remove('dragging');
    dragging = null;
    renumber();
  });

  pics.addEventListener('dragover', function (e) {
    e.preventDefault();
    if (!dragging) return;
    var over = e.target.closest('.pic');
    if (!over || over === dragging) return;
    var box = over.getBoundingClientRect();
    var after = (e.clientX - box.left) > box.width / 2;
    pics.insertBefore(dragging, after ? over.nextElementSibling : over);
  });

  renumber();
})();
