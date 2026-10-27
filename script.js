function jalankan(fn) {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
  else fn();
}

jalankan(function () {
  var kurangiGerak = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var bisaHover = window.matchMedia('(hover: hover)').matches;
  var warnaKilau = ['#b76e79', '#b99a6b'];
  var warnaKonfeti = ['#b76e79', '#b99a6b', '#f1e5dd', '#ffffff'];
  function acak(a, b) { return a + Math.random() * (b - a); }

  // 1. Navbar transparan di atas, solid setelah scroll
  var navbar = document.getElementById('navbarNav');
  function cekNavbar() { navbar.classList.toggle('scrolled', window.scrollY > 60); }
  cekNavbar();
  window.addEventListener('scroll', cekNavbar, { passive: true });

  // 2. AOS
  if (window.AOS) {
    AOS.init({ once: true, duration: 900, offset: 80, easing: 'ease-out-cubic' });
    document.documentElement.classList.add('aos-on');
    window.addEventListener('load', function () { AOS.refresh(); });
  }

  // 3. Scrollspy: menu aktif mengikuti section yang sedang dilihat
  var daftarSection = document.querySelectorAll('section[id]');
  var daftarLink = document.querySelectorAll('#mainNav .nav-link');
  function scrollSpy() {
    var posisi = window.scrollY + 120;
    var idAktif = '';
    daftarSection.forEach(function (sec) {
      if (posisi >= sec.offsetTop && posisi < sec.offsetTop + sec.offsetHeight) idAktif = sec.id;
    });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 5) idAktif = 'kontak';
    daftarLink.forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('href') === '#' + idAktif);
    });
  }
  scrollSpy();
  window.addEventListener('scroll', scrollSpy, { passive: true });
  window.addEventListener('resize', scrollSpy);
  window.addEventListener('load', scrollSpy);

  // 4. Hero: parallax + teks mengetik
  var hero = document.getElementById('hero');
  var heroImg = document.getElementById('heroImg');
  var heroIsi = document.querySelector('.hero-content');
  var menunggu = false;
  function parallax() {
    var y = window.scrollY, tinggi = hero.offsetHeight;
    if (y <= tinggi) {
      heroImg.style.transform = 'translate3d(0,' + (y * 0.5) + 'px,0)';
      heroIsi.style.transform = 'translate3d(0,' + (y * 0.18) + 'px,0)';
      heroIsi.style.opacity = Math.max(0, 1 - y / (tinggi * 0.75));
    }
    menunggu = false;
  }
  if (hero && heroImg && !kurangiGerak) {
    window.addEventListener('scroll', function () {
      if (!menunggu) { requestAnimationFrame(parallax); menunggu = true; }
    }, { passive: true });
  }

  var ketik = document.getElementById('ketik');
  if (ketik) {
    if (kurangiGerak) {
      ketik.textContent = 'Pengantin, Wisuda & Acara';
    } else {
      var kataKata = ['Pengantin', 'Wisuda', 'Acara Spesial'];
      var iKata = 0, iHuruf = 0, menghapus = false;
      (function ketikLagi() {
        var kata = kataKata[iKata];
        ketik.textContent = kata.substring(0, iHuruf);
        if (!menghapus && iHuruf < kata.length) { iHuruf++; setTimeout(ketikLagi, 110); }
        else if (!menghapus) { menghapus = true; setTimeout(ketikLagi, 1400); }
        else if (iHuruf > 0) { iHuruf--; setTimeout(ketikLagi, 55); }
        else { menghapus = false; iKata = (iKata + 1) % kataKata.length; setTimeout(ketikLagi, 300); }
      })();
    }
  }

  // 5. Konfeti kelopak (warna lembut)
  function konfeti(x, y) {
    if (kurangiGerak) return;
    for (var i = 0; i < 24; i++) {
      var p = document.createElement('span');
      p.className = 'konfeti';
      p.style.left = x + 'px';
      p.style.top = y + 'px';
      p.style.background = warnaKonfeti[i % warnaKonfeti.length];
      p.style.setProperty('--dx', acak(-160, 160) + 'px');
      p.style.setProperty('--dy', acak(-200, 140) + 'px');
      p.style.setProperty('--r', acak(-540, 540) + 'deg');
      document.body.appendChild(p);
      setTimeout(function (el) { el.remove(); }.bind(null, p), 1300);
    }
  }

  // 6. Form kontak
  var formKontak = document.getElementById('formKontak');
  if (formKontak) {
    formKontak.addEventListener('submit', function (e) {
      e.preventDefault();
      document.getElementById('formAlert').classList.remove('d-none');
      var r = this.querySelector('button[type="submit"]').getBoundingClientRect();
      konfeti(r.left + r.width / 2, r.top);
      this.reset();
    });
  }

  // 7. Galeri: filter kategori + lightbox prev/next
  var galeriModal = document.getElementById('galeriModal');
  var galItems = [].slice.call(document.querySelectorAll('.galeri-item'));
  var galIdx = 0;
  document.querySelectorAll('.galeri-filter button').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('.galeri-filter button').forEach(function (x) { x.classList.toggle('aktif', x === b); });
      galItems.forEach(function (it) {
        it.classList.toggle('sembunyi', b.dataset.f !== 'semua' && it.dataset.kat !== b.dataset.f);
      });
    });
  });
  function tampilFoto(it) {
    var g = document.getElementById('galeriBesar');
    g.src = it.querySelector('img').src;
    g.alt = it.dataset.judul;
    document.getElementById('galeriJudul').textContent = it.dataset.judul;
  }
  function pindahFoto(arah) {
    var v = galItems.filter(function (x) { return !x.classList.contains('sembunyi'); });
    var i = (v.indexOf(galItems[galIdx]) + arah + v.length) % v.length;
    galIdx = galItems.indexOf(v[i]);
    tampilFoto(v[i]);
  }
  if (galeriModal) {
    var badan = galeriModal.querySelector('.modal-body');
    ['prev', 'next'].forEach(function (k) {
      var n = document.createElement('button');
      n.type = 'button';
      n.className = 'lb-nav ' + k;
      n.setAttribute('aria-label', k === 'prev' ? 'Foto sebelumnya' : 'Foto berikutnya');
      n.innerHTML = '<i class="fa-solid fa-chevron-' + (k === 'prev' ? 'left' : 'right') + '"></i>';
      n.addEventListener('click', function () { pindahFoto(k === 'prev' ? -1 : 1); });
      badan.appendChild(n);
    });
    galeriModal.addEventListener('show.bs.modal', function (e) {
      if (!e.relatedTarget) return;
      galIdx = galItems.indexOf(e.relatedTarget);
      tampilFoto(e.relatedTarget);
    });
    document.addEventListener('keydown', function (e) {
      if (!galeriModal.classList.contains('show')) return;
      if (e.key === 'ArrowLeft') pindahFoto(-1);
      if (e.key === 'ArrowRight') pindahFoto(1);
    });
  }

  // 8. Tutup menu HP setelah link diklik
  document.querySelectorAll('#mainNav .nav-link').forEach(function (link) {
    link.addEventListener('click', function () {
      var menu = document.getElementById('mainNav');
      if (menu.classList.contains('show')) bootstrap.Collapse.getOrCreateInstance(menu).hide();
    });
  });

  // 9. Garis progres scroll
  var progres = document.createElement('div');
  progres.id = 'progres';
  document.body.appendChild(progres);
  function hitungProgres() {
    var tinggi = document.documentElement.scrollHeight - window.innerHeight;
    progres.style.width = (tinggi > 0 ? window.scrollY / tinggi * 100 : 0) + '%';
  }
  window.addEventListener('scroll', hitungProgres, { passive: true });
  hitungProgres();

  // 10. Ikon makeup melayang pelan di Hero
  if (hero && !kurangiGerak) {
    var wadah = document.createElement('div');
    wadah.className = 'hero-float';
    var ikon = ['💄', '✨', '🪞', '🌸', '💅', '🎀'];
    for (var i = 0; i < 8; i++) {
      var s = document.createElement('span');
      s.textContent = ikon[i % ikon.length];
      s.style.left = acak(2, 96) + '%';
      s.style.fontSize = acak(18, 30) + 'px';
      s.style.animationDuration = acak(12, 20) + 's';
      s.style.animationDelay = acak(0, 10) + 's';
      wadah.appendChild(s);
    }
    hero.insertBefore(wadah, hero.querySelector('.hero-content'));
  }

  // 11. Kilau emas mengikuti kursor (perangkat dengan mouse)
  if (bisaHover && !kurangiGerak) {
    var terakhir = 0;
    document.addEventListener('mousemove', function (e) {
      var sekarang = Date.now();
      if (sekarang - terakhir < 70) return;
      terakhir = sekarang;
      var k = document.createElement('span');
      k.className = 'kilau';
      k.textContent = Math.random() > .5 ? '✦' : '✧';
      k.style.left = e.clientX + 'px';
      k.style.top = e.clientY + 'px';
      k.style.color = warnaKilau[Math.floor(Math.random() * warnaKilau.length)];
      k.style.setProperty('--dx', acak(-18, 18) + 'px');
      document.body.appendChild(k);
      setTimeout(function () { k.remove(); }, 800);
    });
  }

  // 12. Tombol kembali ke atas (lipstik)
  var keAtas = document.createElement('button');
  keAtas.type = 'button';
  keAtas.className = 'ke-atas';
  keAtas.setAttribute('aria-label', 'Kembali ke atas');
  keAtas.textContent = '💄';
  keAtas.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  document.body.appendChild(keAtas);
  window.addEventListener('scroll', function () { keAtas.classList.toggle('tampil', window.scrollY > 500); }, { passive: true });

  // 13. Konfeti saat modal konsultasi dibuka
  var bookingModal = document.getElementById('bookingModal');
  if (bookingModal) {
    bookingModal.addEventListener('shown.bs.modal', function () { konfeti(window.innerWidth / 2, window.innerHeight / 3); });
  }

  // 14. Penanda menu (pill) bergeser mengikuti section yang sedang dilihat
  var ulNav = document.querySelector('#mainNav .navbar-nav');
  if (ulNav) {
    var pill = document.createElement('span');
    pill.className = 'nav-pill';
    ulNav.insertBefore(pill, ulNav.firstChild);
    var geserPill = function () {
      var aktif = ulNav.querySelector('.nav-link.active');
      if (!aktif || window.innerWidth < 992) { pill.style.opacity = 0; return; }
      pill.style.opacity = 1;
      pill.style.width = aktif.offsetWidth + 'px';
      pill.style.height = aktif.offsetHeight + 'px';
      pill.style.transform = 'translate(' + aktif.offsetLeft + 'px,' + aktif.offsetTop + 'px)';
    };
    pill.style.transition = 'none';
    geserPill();
    setTimeout(function () { pill.style.transition = ''; }, 80);
    window.addEventListener('scroll', geserPill, { passive: true });
    window.addEventListener('resize', geserPill);
    window.addEventListener('load', geserPill);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(geserPill);
  }
});