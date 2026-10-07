(() => {
  'use strict';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const toast = (message) => {
    const el = $('#toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('is-visible');
    window.clearTimeout(window.__thenukaToast);
    window.__thenukaToast = window.setTimeout(() => el.classList.remove('is-visible'), 3200);
  };

  /* Ambient hero atmosphere */
  const canvas = $('#starfield');
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let width = 0;
    let height = 0;
    const makeParticles = () => {
      width = canvas.width = window.innerWidth * Math.min(window.devicePixelRatio || 1, 2);
      height = canvas.height = window.innerHeight * Math.min(window.devicePixelRatio || 1, 2);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      const count = window.innerWidth < 700 ? 80 : 170;
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.25 + .25,
        a: Math.random() * .55 + .12,
        drift: (Math.random() - .5) * .08,
        twinkle: Math.random() * .012 + .004
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((particle) => {
        particle.y -= .05;
        particle.x += particle.drift;
        particle.a += particle.twinkle;
        if (particle.a > .8 || particle.a < .08) particle.twinkle *= -1;
        if (particle.y < -10) particle.y = height + 10;
        if (particle.x < -10) particle.x = width + 10;
        if (particle.x > width + 10) particle.x = -10;
        ctx.beginPath();
        ctx.fillStyle = `rgba(230, 220, 170, ${Math.max(.06, particle.a)})`;
        ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
        ctx.fill();
      });
      window.requestAnimationFrame(draw);
    };
    makeParticles();
    draw();
    window.addEventListener('resize', makeParticles, { passive: true });
  }

  /* Scroll shell */
  const topbar = $('#topbar');
  const progress = $('.scroll-progress span');
  const updateScroll = () => {
    const scrollTop = window.scrollY;
    if (topbar) topbar.classList.toggle('is-scrolled', scrollTop > 50);
    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = `${max ? (scrollTop / max) * 100 : 0}%`;
    }
  };
  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();

  /* Scroll reveals and counters */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .12 });
  $$('.reveal').forEach((el, index) => {
    el.style.transitionDelay = `${Math.min(index % 5, 4) * 70}ms`;
    revealObserver.observe(el);
  });

  const countUp = (el) => {
    const target = Number(el.dataset.count || 0);
    const suffix = target === 1600 ? '+' : target === 100 || target === 25 ? '+' : '';
    if (prefersReducedMotion) {
      el.textContent = `${target}${suffix}`;
      return;
    }
    const duration = 1200;
    const start = performance.now();
    const tick = (now) => {
      const progressValue = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progressValue, 3);
      el.textContent = `${Math.floor(eased * target).toLocaleString()}${suffix}`;
      if (progressValue < 1) window.requestAnimationFrame(tick);
    };
    window.requestAnimationFrame(tick);
  };
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        $('[data-count]', entry.target) && countUp($('[data-count]', entry.target));
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .55 });
  $$('.stat').forEach((stat) => statsObserver.observe(stat));

  /* Mobile menu */
  const mobileMenu = $('#mobile-menu');
  const setMenu = (open) => {
    if (!mobileMenu) return;
    mobileMenu.classList.toggle('is-open', open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('menu-open', open);
    $$('[data-menu-toggle]').forEach((button) => button.setAttribute('aria-expanded', String(open)));
  };
  $$('[data-menu-toggle]').forEach((button) => button.addEventListener('click', () => setMenu(!mobileMenu.classList.contains('is-open'))));
  $$('.mobile-menu a').forEach((link) => link.addEventListener('click', () => setMenu(false)));

  /* Search modal */
  const searchModal = $('#search-modal');
  const setSearch = (open) => {
    if (!searchModal) return;
    searchModal.classList.toggle('is-open', open);
    searchModal.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('modal-open', open);
    if (open) window.setTimeout(() => $('.modal-search input', searchModal)?.focus(), 250);
  };
  $$('[data-open-search]').forEach((button) => button.addEventListener('click', () => setSearch(true)));
  $$('[data-close-search]').forEach((button) => button.addEventListener('click', () => setSearch(false)));
  searchModal?.addEventListener('click', (event) => { if (event.target === searchModal) setSearch(false); });

  /* Custom cursor */
  const cursor = $('.cursor');
  if (cursor && window.matchMedia('(pointer: fine)').matches) {
    let mouseX = -100; let mouseY = -100; let cursorX = mouseX; let cursorY = mouseY;
    window.addEventListener('pointermove', (event) => { mouseX = event.clientX; mouseY = event.clientY; cursor.classList.add('is-active'); }, { passive: true });
    const animateCursor = () => {
      cursorX += (mouseX - cursorX) * .16;
      cursorY += (mouseY - cursorY) * .16;
      cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
      window.requestAnimationFrame(animateCursor);
    };
    animateCursor();
    $$('a, button, select, .category-card, .gallery-item').forEach((element) => {
      element.addEventListener('pointerenter', () => cursor.classList.add('is-hover'));
      element.addEventListener('pointerleave', () => cursor.classList.remove('is-hover'));
    });
  }

  /* Magnetic buttons */
  if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
    $$('.magnetic').forEach((button) => {
      button.addEventListener('pointermove', (event) => {
        const rect = button.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * .11;
        const y = (event.clientY - rect.top - rect.height / 2) * .18;
        button.style.transform = `translate(${x}px, ${y}px)`;
      });
      button.addEventListener('pointerleave', () => { button.style.transform = ''; });
    });
  }

  /* Drag-scroll rails */
  $$('[data-drag-scroll]').forEach((rail) => {
    let isDown = false; let startX = 0; let startScroll = 0;
    rail.addEventListener('pointerdown', (event) => { isDown = true; startX = event.clientX; startScroll = rail.scrollLeft; rail.setPointerCapture(event.pointerId); });
    rail.addEventListener('pointermove', (event) => { if (isDown) rail.scrollLeft = startScroll - (event.clientX - startX); });
    rail.addEventListener('pointerup', () => { isDown = false; });
    rail.addEventListener('pointercancel', () => { isDown = false; });
  });

  /* Destination story stage */
  const destinations = {
    sigiriya: { image: 'assets/sigiriya.jpg', alt: 'Sigiriya rock in Sri Lanka', kicker: 'Cultural triangle / sunrise', title: 'The Ancient<br /><i>Sky Kingdom</i>', description: 'A citadel in the clouds, where painted walls, water gardens and a 1,500-year-old story rise above the jungle.', best: 'Heritage / sunrise', miss: "Lion's Paw ascent", map: 'Sigiriya' },
    ella: { image: 'assets/ella.jpg', alt: 'Ella mountain landscape', kicker: 'Highlands / mist', title: 'Where Mountains<br /><i>Touch the Clouds</i>', description: 'Tea trails, train windows, waterfalls and the soft drama of a valley that always seems to be exhaling.', best: 'Tea / slow travel', miss: 'Nine Arch Bridge', map: 'Ella' },
    galle: { image: 'assets/aerial-coast.jpg', alt: 'Coastline near Galle', kicker: 'South coast / golden hour', title: 'Where History<br /><i>Meets the Ocean</i>', description: 'Walk the ramparts as the light turns amber, then let the Fort keep you for one more long dinner.', best: 'Design / food', miss: 'Fort ramparts', map: 'Galle' },
    mirissa: { image: 'assets/beach.jpg', alt: 'Sri Lankan beach at blue hour', kicker: 'South coast / blue hour', title: 'Where the Ocean<br /><i>Comes Alive</i>', description: 'Warm water, palms in silhouette and the kind of horizon that makes an ordinary Tuesday feel like a gift.', best: 'Beach / whales', miss: 'Sunset sail', map: 'Mirissa' },
    yala: { image: 'assets/leopard.jpg', alt: 'Leopard in Yala', kicker: 'Wild / first light', title: 'Into the<br /><i>Wild</i>', description: 'A living theatre of scrub, salt lagoons and the quiet thrill of seeing the island look back at you.', best: 'Safari / photography', miss: 'Dawn drive', map: 'Yala' },
    nuwara: { image: 'assets/tea-country.jpg', alt: 'Tea country in Sri Lanka', kicker: 'Highlands / green altitude', title: 'Little England<br /><i>in the Clouds</i>', description: 'Misty mornings, colonial verandas and hillside tea estates stitched into the landscape like a green textile.', best: 'Tea / wellness', miss: 'Estate walk', map: 'Nuwara Eliya' },
    trinco: { image: 'assets/beach.jpg', alt: 'Blue ocean in Sri Lanka', kicker: 'East coast / first light', title: 'Where the Blue<br /><i>Ocean Begins</i>', description: 'Crystal water, quiet coves and a slower, sunlit edge of the island where every morning starts wide open.', best: 'Diving / stillness', miss: 'Pigeon Island', map: 'Trincomalee' },
    arugam: { image: 'assets/beach.jpg', alt: 'Surf on a Sri Lankan beach', kicker: 'East coast / golden swell', title: 'Ride the<br /><i>Perfect Wave</i>', description: 'Barefoot mornings, long point breaks and a community that knows the best part of the day is still ahead.', best: 'Surf / community', miss: 'Main Point', map: 'Arugam Bay' },
    sinharaja: { image: 'assets/tea-country.jpg', alt: 'Emerald rainforest in Sri Lanka', kicker: 'Rainforest / after rain', title: 'Enter the Emerald<br /><i>Rainforest</i>', description: 'A green cathedral of endemic life, rushing water and a kind of silence that is actually full of sound.', best: 'Jungle / birding', miss: 'Canopy trail', map: 'Sinharaja' }
  };
  const destinationImage = $('#destination-image');
  let activeDestinationKey = 'sigiriya';
  const updateDestination = (key) => {
    const item = destinations[key];
    if (!item || !destinationImage) return;
    activeDestinationKey = key;
    destinationImage.classList.add('is-changing');
    window.setTimeout(() => {
      destinationImage.src = item.image;
      destinationImage.alt = item.alt;
      $('#destination-kicker').textContent = item.kicker;
      $('#destination-title').innerHTML = item.title;
      $('#destination-description').textContent = item.description;
      $('#destination-best').textContent = item.best;
      $('#destination-miss').textContent = item.miss;
      $('.image-index').innerHTML = `${String(Object.keys(destinations).indexOf(key) + 1).padStart(2, '0')} <span>/ 09</span>`;
      destinationImage.classList.remove('is-changing');
    }, prefersReducedMotion ? 0 : 220);
    $$('.destination-tab').forEach((tab) => {
      const active = tab.dataset.destination === key;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
    });
    selectMapPin(item.map);
  };
  $$('.destination-tab').forEach((tab) => tab.addEventListener('click', () => updateDestination(tab.dataset.destination)));

  /* Interactive island map */
  const mapLocations = [
    ['Jaffna', 196, 61, 'Northern / salt air', '30° · Bright and dry', 'Jan — Sep'],
    ['Anuradhapura', 163, 128, 'Ancient / open sky', '30° · Dry and clear', 'Jan — Apr'],
    ['Dambulla', 183, 193, 'Stone / jungle edge', '29° · Warm and clear', 'Jan — Apr'],
    ['Sigiriya', 208, 174, 'Ancient / elemental', '28° · Dry and clear', 'Jan — Apr'],
    ['Polonnaruwa', 245, 201, 'Ruins / lakeside', '29° · Bright and warm', 'May — Sep'],
    ['Trincomalee', 282, 160, 'Blue / spacious', '30° · Clear and calm', 'May — Sep'],
    ['Kandy', 173, 280, 'Ritual / mountain', '25° · Misty and mild', 'Jan — Apr'],
    ['Ella', 179, 366, 'Green / unhurried', '22° · Cloudy and cool', 'Jan — Apr'],
    ['Nuwara Eliya', 161, 333, 'Tea / high altitude', '18° · Misty and cool', 'Jan — Apr'],
    ['Knuckles', 216, 298, 'Wild / highland', '21° · Cloud breaks', 'Jan — Apr'],
    ['Sinharaja', 124, 407, 'Emerald / after rain', '24° · Tropical mist', 'Dec — Mar'],
    ['Yala', 258, 457, 'Wild / salt edge', '29° · Dry and bright', 'Feb — Jun'],
    ['Arugam Bay', 294, 388, 'Surf / golden swell', '30° · Sunny', 'May — Sep'],
    ['Mirissa', 153, 502, 'Ocean / blue hour', '28° · Clear', 'Nov — Apr'],
    ['Galle', 125, 463, 'Fort / ocean light', '28° · Tropical', 'Nov — Apr'],
    ['Unawatuna', 136, 478, 'Beach / palms', '28° · Tropical', 'Nov — Apr'],
    ['Bentota', 107, 421, 'River / coast', '28° · Warm', 'Nov — Apr'],
    ['Colombo', 120, 366, 'City / sea breeze', '29° · Humid', 'Jan — Apr'],
    ['Horton Plains', 155, 386, 'Cloud forest / wind', '14° · Cool and misty', 'Jan — Apr'],
    ['Diyaluma', 205, 392, 'Water / cliff edge', '24° · Fresh', 'Jan — Apr']
  ];
  const pinGroup = $('#map-pins');
  const mapPinElements = new Map();
  const selectMapPin = (name) => {
    const match = mapLocations.find((location) => location[0] === name);
    if (!match) return;
    mapPinElements.forEach((pin, key) => pin.classList.toggle('is-active', key === name));
    $('#map-selected-title').textContent = match[0];
    $('#map-selected-copy').textContent = `${match[3]} — follow the island’s slower, brighter edge from here.`;
    $('#map-atmosphere').textContent = match[3];
    $('#map-weather').textContent = match[4];
    $('#map-season').textContent = match[5];
    $('#map-temperature').textContent = `${match[4].match(/\d+°/)?.[0] || '28°'} C / demo`;
    $('#map-sunrise').textContent = name === 'Jaffna' ? '05:58 / demo' : '06:10 / demo';
    $('#map-sunset').textContent = name === 'Jaffna' ? '18:15 / demo' : '18:20 / demo';
    $('#map-sea').textContent = ['Galle', 'Mirissa', 'Unawatuna', 'Bentota', 'Trincomalee', 'Arugam Bay'].includes(name) ? 'Calm / demo' : 'Not coastal / demo';
    $('#map-rain').textContent = ['Sinharaja', 'Ella', 'Nuwara Eliya', 'Knuckles', 'Horton Plains', 'Diyaluma'].includes(name) ? '45% / demo' : '20% / demo';
  };
  if (pinGroup) {
    mapLocations.forEach(([name, x, y]) => {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.classList.add('map-pin');
      group.dataset.location = name;
      group.setAttribute('tabindex', '0');
      group.setAttribute('role', 'button');
      group.setAttribute('aria-label', `Explore ${name}`);
      const halo = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      halo.setAttribute('cx', x); halo.setAttribute('cy', y); halo.setAttribute('r', '6'); halo.setAttribute('fill', 'none'); halo.setAttribute('stroke', '#D7B86A'); halo.setAttribute('stroke-opacity', '.15');
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('cx', x); dot.setAttribute('cy', y); dot.setAttribute('r', '3.3');
      group.append(halo, dot);
      const activate = () => { selectMapPin(name); toast(`${name} is now in focus.`); };
      group.addEventListener('click', activate);
      group.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activate(); } });
      pinGroup.append(group);
      mapPinElements.set(name, group);
    });
    selectMapPin('Sigiriya');
  }
  $('[data-focus-map]')?.addEventListener('click', () => { $('#map-room')?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' }); selectMapPin(destinations[activeDestinationKey]?.map || 'Sigiriya'); });

  /* Choice chips / AI itinerary */
  $$('[data-choice-group]').forEach((group) => {
    $$('.choice', group).forEach((choice) => choice.addEventListener('click', () => {
      $$('.choice', group).forEach((item) => item.classList.remove('is-selected'));
      choice.classList.add('is-selected');
    }));
  });
  const itineraryRoutes = {
    Adventure: ['COLOMBO → GALLE', 'GALLE → MIRISSA', 'MIRISSA → YALA', 'YALA → ELLA', 'ELLA → NUWARA ELIYA', 'NUWARA ELIYA → KANDY', 'KANDY → SIGIRIYA'],
    'Slow travel': ['COLOMBO → GALLE', 'GALLE → BENTOTA', 'BENTOTA → MIRISSA', 'MIRISSA → GALLE', 'GALLE → ELLA', 'ELLA → KANDY', 'KANDY → COLOMBO'],
    Wildlife: ['COLOMBO → YALA', 'YALA → SINHARAJA', 'SINHARAJA → ELLA', 'ELLA → KANDY', 'KANDY → SIGIRIYA', 'SIGIRIYA → TRINCOMALEE', 'TRINCOMALEE → COLOMBO'],
    Honeymoon: ['COLOMBO → GALLE', 'GALLE → MIRISSA', 'MIRISSA → ELLA', 'ELLA → NUWARA ELIYA', 'NUWARA ELIYA → KANDY', 'KANDY → SIGIRIYA', 'SIGIRIYA → COLOMBO']
  };
  const generateItinerary = () => {
    const mood = $('.choice.is-selected', $('[data-choice-group="mood"]'))?.textContent.trim() || 'Adventure';
    const days = $('.choice.is-selected', $('[data-choice-group="days"]'))?.textContent.trim() || '05';
    const style = $('.choice.is-selected', $('[data-choice-group="style"]'))?.textContent.trim() || 'Comfort';
    const route = itineraryRoutes[mood] || itineraryRoutes.Adventure;
    const result = $('.ai-result');
    if (!result) return;
    result.hidden = false;
    result.innerHTML = `<span class="itinerary-label">Your first route / ${style.toLowerCase()}</span><div class="itinerary-head"><h4>${days} days of ${mood.toLowerCase()}.</h4><p>Demo route / ready to refine</p></div><div class="itinerary-route">${route.slice(0, Math.min(Number(days) || 5, 7)).map((stop, index) => `<div class="itinerary-stop"><span>DAY ${String(index + 1).padStart(2, '0')}</span><strong>${stop}</strong><small>${['heritage', 'ocean', 'wild', 'highland'][index % 4]}</small></div>`).join('')}</div>`;
    result.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'nearest' });
    toast('Your first island route is ready.');
  };
  $('[data-generate-itinerary]')?.addEventListener('click', generateItinerary);

  /* Journey builder */
  const stopData = {
    Colombo: ['city · ocean', 0, 'City / coast'], Galle: ['fort · food', 126, 'History / ocean'], Mirissa: ['beach · whales', 60, 'Ocean / slow'], Yala: ['wild · safari', 118, 'Wild / elemental'], Ella: ['tea · clouds', 110, 'Highland / green'], 'Nuwara Eliya': ['tea · mist', 55, 'Tea / cool'], Kandy: ['ritual · lake', 78, 'Culture / highland'], Sigiriya: ['stone · sky', 90, 'Heritage / jungle'], Trincomalee: ['blue · diving', 185, 'Ocean / east'], 'Arugam Bay': ['surf · sun', 130, 'Surf / community']
  };
  let routeStops = ['Colombo', 'Galle', 'Mirissa', 'Yala', 'Ella', 'Nuwara Eliya', 'Kandy', 'Sigiriya'];
  const renderRoute = () => {
    const list = $('#route-list');
    if (!list) return;
    list.innerHTML = routeStops.map((stop, index) => `<div class="route-stop" draggable="true" data-stop="${stop}"><span class="handle" aria-hidden="true">⋮⋮</span><span class="route-number">${String(index + 1).padStart(2, '0')}</span><div><strong>${stop}</strong><small>${stopData[stop]?.[0] || 'island experience'}</small></div><button class="stop-remove" type="button" aria-label="Remove ${stop}">×</button></div>`).join('');
    $$('.stop-remove', list).forEach((button) => button.addEventListener('click', () => { const stop = button.closest('.route-stop').dataset.stop; routeStops = routeStops.filter((item) => item !== stop); renderRoute(); updateSummary(); }));
    $$('.route-stop', list).forEach((row) => {
      row.addEventListener('dragstart', () => { row.classList.add('dragging'); });
      row.addEventListener('dragend', () => { row.classList.remove('dragging'); });
      row.addEventListener('dragover', (event) => {
        event.preventDefault();
        const dragging = $('.route-stop.dragging', list);
        if (dragging && dragging !== row) {
          const rect = row.getBoundingClientRect();
          list.insertBefore(dragging, event.clientY < rect.top + rect.height / 2 ? row : row.nextSibling);
        }
      });
      row.addEventListener('drop', () => { routeStops = $$('.route-stop', list).map((item) => item.dataset.stop); renderRoute(); updateSummary(); toast('Route order updated.'); });
    });
  };
  const updateSummary = () => {
    const legs = Math.max(routeStops.length - 1, 0);
    const distance = routeStops.slice(1).reduce((total, stop) => total + (stopData[stop]?.[1] || 60), 0);
    const days = Math.max(3, routeStops.length - 1);
    const hours = Math.round(distance / 46);
    $('#route-days').textContent = String(days).padStart(2, '0');
    $('#route-distance').textContent = `${distance.toLocaleString()} km`;
    $('#route-time').textContent = `${Math.floor(hours)}h ${String((hours * 60) % 60).padStart(2, '0')}m`;
    $('#route-moods').textContent = routeStops.length > 5 ? 'Coast · wild · highland' : 'Curated · flexible';
    const dotPositions = $$('.mini-dot');
    dotPositions.forEach((dot, index) => dot.style.opacity = index < Math.min(routeStops.length, 4) ? '1' : '.35');
  };
  $('#destination-picker')?.addEventListener('change', (event) => {
    if (event.target.value) {
      const selected = event.target.value;
      if (!routeStops.includes(selected)) { routeStops.push(selected); renderRoute(); updateSummary(); toast(`${selected} added to your journey.`); }
      event.target.value = '';
    }
  });
  $('[data-add-stop]')?.addEventListener('click', () => $('#destination-picker')?.dispatchEvent(new Event('change')));
  $('[data-clear-route]')?.addEventListener('click', () => { routeStops = []; renderRoute(); updateSummary(); toast('Route cleared. Add a new stop to begin again.'); });
  renderRoute(); updateSummary();

  /* Gallery lightbox and filters */
  const lightbox = $('#lightbox');
  const setLightbox = (open, image = '', caption = '') => {
    if (!lightbox) return;
    lightbox.classList.toggle('is-open', open);
    lightbox.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('modal-open', open);
    if (open) { $('#lightbox-image').src = image; $('#lightbox-image').alt = caption; $('#lightbox-caption').textContent = caption; }
  };
  $$('.gallery-item').forEach((item) => item.addEventListener('click', () => setLightbox(true, item.dataset.image, item.dataset.caption)));
  $$('[data-close-lightbox]').forEach((button) => button.addEventListener('click', () => setLightbox(false)));
  lightbox?.addEventListener('click', (event) => { if (event.target === lightbox) setLightbox(false); });
  $$('.filter-button').forEach((button) => button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    $$('.filter-button').forEach((item) => item.classList.toggle('is-active', item === button));
    $$('.gallery-item').forEach((item) => item.classList.toggle('is-hidden', filter !== 'all' && item.dataset.category !== filter));
  }));

  /* Search adapter — intentionally local and replaceable with a real API later */
  const recommendations = [
    { match: ['honeymoon', 'romantic'], title: 'Mirissa → Galle', copy: 'Two coasts, one slow golden hour.', meta: 'Ocean · design · sunset' },
    { match: ['quiet', 'beach', 'ocean'], title: 'Nilaveli', copy: 'Crystal shallows and space to breathe.', meta: 'East coast · stillness' },
    { match: ['wildlife', 'safari', 'leopard'], title: 'Yala', copy: 'Into the wild, with the lights low.', meta: 'Wild · photography' },
    { match: ['mountain', 'tea', 'highland'], title: 'Ella + Nuwara Eliya', copy: 'Clouds, tea trails and the scenic route.', meta: 'Highland · rail · mist' },
    { match: ['waterfall', 'water'], title: 'Diyaluma', copy: 'Water, cliff edge and a wide-open sky.', meta: 'Highland · swim · adventure' },
    { match: ['7 day', 'trip', 'itinerary'], title: 'Colombo → Sigiriya', copy: 'A first route through the island’s essential contrasts.', meta: '7 days · demo route' }
  ];
  const renderRecommendations = (query, target) => {
    const normalized = query.toLowerCase();
    const results = recommendations.filter((item) => item.match.some((term) => normalized.includes(term))).slice(0, 3);
    const finalResults = results.length ? results : recommendations.slice(0, 3);
    target.innerHTML = finalResults.map((item) => `<div class="search-result"><div><strong>${item.title}</strong><span>${item.copy}<br />${item.meta}</span></div><b>↗</b></div>`).join('');
    target.hidden = false;
  };
  $('#smart-search')?.addEventListener('submit', (event) => { event.preventDefault(); const input = $('#search-input'); if (input?.value.trim()) { renderRecommendations(input.value.trim(), $('#search-results')); toast('A few island directions, illuminated.'); } });
  $$('.search-suggestions button').forEach((button) => button.addEventListener('click', () => { $('#search-input').value = button.textContent; $('#smart-search').dispatchEvent(new Event('submit')); }));
  $('#modal-search')?.addEventListener('submit', (event) => { event.preventDefault(); const input = $('input', event.currentTarget); if (input?.value.trim()) renderRecommendations(input.value.trim(), $('#modal-result')); });

  /* Availability + ambient sound affordances */
  $$('[data-availability]').forEach((button) => button.addEventListener('click', () => toast('Availability is ready to connect to a booking partner.')));
  let audioContext; let ambientOscillator; let ambientGain;
  $('[data-sound-toggle]')?.addEventListener('click', (event) => {
    const button = event.currentTarget;
    const isOn = button.getAttribute('aria-pressed') === 'true';
    if (!isOn) {
      try {
        audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
        ambientOscillator = audioContext.createOscillator();
        ambientGain = audioContext.createGain();
        ambientOscillator.type = 'sine'; ambientOscillator.frequency.value = 110; ambientGain.gain.value = .018;
        ambientOscillator.connect(ambientGain); ambientGain.connect(audioContext.destination); ambientOscillator.start();
      } catch (error) { /* Audio is optional; the button remains functional as a visual state. */ }
      button.setAttribute('aria-pressed', 'true'); button.querySelector('i').textContent = 'on'; button.classList.add('is-playing'); toast('A soft island tone is playing.');
    } else {
      ambientGain?.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + .3);
      ambientOscillator?.stop(audioContext.currentTime + .35);
      button.setAttribute('aria-pressed', 'false'); button.querySelector('i').textContent = 'off'; button.classList.remove('is-playing');
    }
  });

  /* Keyboard escape closes transient layers */
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { setMenu(false); setSearch(false); setLightbox(false); }
  });
})();
