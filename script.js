function goToScene(sceneId) {
  document.querySelectorAll('.scene').forEach(s => s.classList.remove('scene--active'));
  const next = document.getElementById(sceneId);
  next.classList.add('scene--active');
}

(function initBgMusic() {
  const audio = document.getElementById('bg-music');
  const toggleBtn = document.getElementById('bg-music-toggle');
  audio.src = CONFIG.bgMusic;
  audio.volume = 0.5;

  let userMuted = false;

  window.pauseBgMusic = function () {
    if (!audio.paused) audio.pause();
  };

  window.resumeBgMusic = function () {
    if (audio.paused && !userMuted) {
      audio.play().catch(() => {});
    }
  };

  window.startBgMusic = function () {
    audio.play().catch(() => {});
  };

  toggleBtn.addEventListener('click', () => {
    userMuted = !userMuted;
    if (userMuted) {
      audio.pause();
      toggleBtn.textContent = '🔇';
    } else {
      audio.play().catch(() => {});
      toggleBtn.textContent = '🔊';
    }
  });
})();

(function initLockScreen() {
  const dustContainer = document.getElementById('dust-container');
  const passwordInput = document.getElementById('password-input');
  const keypad = document.getElementById('keypad');
  const lockBox = document.querySelector('.lock-box');
  const errorMsg = document.getElementById('lock-error');
  const lockScene = document.getElementById('scene-lock');

  const DUST_COUNT = 25;
  for (let i = 0; i < DUST_COUNT; i++) {
    const dot = document.createElement('span');
    dot.style.left = Math.random() * 100 + '%';
    dot.style.bottom = -10 + 'px';
    dot.style.animationDuration = (6 + Math.random() * 8) + 's';
    dot.style.animationDelay = (Math.random() * 8) + 's';
    dustContainer.appendChild(dot);
  }

  const keys = ['1','2','3','4','5','6','7','8','9','⌫','0','✓'];
  keys.forEach(k => {
    const btn = document.createElement('div');
    btn.className = 'key';
    btn.textContent = k;
    btn.addEventListener('click', () => handleKey(k));
    keypad.appendChild(btn);
  });

  function handleKey(k) {
    if (k === '⌫') {
      passwordInput.value = passwordInput.value.slice(0, -1);
    } else if (k === '✓') {
      checkPassword();
    } else {
      if (passwordInput.value.length < 6) {
        passwordInput.value += k;
      }
    }
  }

  passwordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') checkPassword();
  });

  function checkPassword() {
      if (passwordInput.value === CONFIG.mainPassword) {
        window.startBgMusic();
        unlockSuccess();
    } else {
      showError();
    }
  }

  function showError() {
    errorMsg.textContent = "that's not quite it... try again?";
    errorMsg.classList.add('show');
    lockBox.classList.add('shake');
    passwordInput.value = '';
    setTimeout(() => lockBox.classList.remove('shake'), 350);
  }

  function unlockSuccess() {
    errorMsg.classList.remove('show');
    lockScene.classList.add('unlocking');
    setTimeout(() => {
      goToScene('scene-welcome');
      lockScene.classList.remove('unlocking');
    }, 850);
  }
})();

// ============================================
// SCENE 02 — WELCOME
// ============================================


(function initWelcomeScene() {
  const welcomeScene = document.getElementById('scene-welcome');
  const lines = document.querySelectorAll('#welcome-lines .w-line');
  const comeInBtn = document.getElementById('come-in-btn');
  let hasPlayed = false;

  const observer = new MutationObserver(() => {
    if (welcomeScene.classList.contains('scene--active') && !hasPlayed) {
      hasPlayed = true;
      playSequence();
    }
  });
  observer.observe(welcomeScene, { attributes: true, attributeFilter: ['class'] });

  function playSequence() {
    lines.forEach((line, i) => {
      setTimeout(() => {
        line.classList.add('show');
      }, i * 1000);
    });

    const totalLines = lines.length;
    setTimeout(() => {
      comeInBtn.classList.add('show');
    }, totalLines * 1000 + 400);
  }

  comeInBtn.addEventListener('click', () => {
    goToScene('scene-room');
  });
})();

// ============================================
// SCENE 03 — YOUR LITTLE WORLD (room hub)
// ============================================
(function initRoomScene() {
  const roomItems = document.querySelectorAll('.room-item');
  const backButtons = document.querySelectorAll('[data-back]');

  roomItems.forEach(item => {
    item.addEventListener('click', () => {
      const target = item.getAttribute('data-target');
      goToScene(target);
    });
  });

  backButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      goToScene('scene-room');
    });
  });
})();

// ============================================
// MEMORIES — POLAROID GALLERY
// ============================================
(function initMemoriesScene() {
  const grid = document.getElementById('polaroid-grid');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');

  CONFIG.photos.forEach((photo) => {
    const card = document.createElement('div');
    card.className = 'polaroid';

    const img = document.createElement('img');
    img.className = 'polaroid-photo';
    img.src = photo.src;
    img.alt = photo.caption;

    img.addEventListener('error', () => {
      const fallback = document.createElement('div');
      fallback.className = 'polaroid-photo img-missing';
      fallback.textContent = '📷';
      img.replaceWith(fallback);
    });

    const caption = document.createElement('p');
    caption.className = 'polaroid-caption';
    caption.textContent = photo.caption;

    card.appendChild(img);
    card.appendChild(caption);
    grid.appendChild(card);

    card.addEventListener('click', () => {
      lightboxImg.src = photo.src;
      lightboxImg.alt = photo.caption;
      lightboxCaption.textContent = photo.caption;
      lightbox.classList.add('show');
    });
  });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      lightbox.classList.remove('show');
    }
  });
})();

// ============================================
// THINGS I'VE NEVER SAID PROPERLY — LETTER
// ============================================

(function initLetterScene() {
  const envelopeStage = document.getElementById('envelope-stage');
  const letterPaper = document.getElementById('letter-paper');
  const letterBody = document.getElementById('letter-body');

  const paragraphs = CONFIG.neverSaidLetter.split('\n\n');
  paragraphs.forEach(text => {
    const p = document.createElement('p');
    p.className = 'letter-paragraph';
    p.textContent = text.trim();
    letterBody.appendChild(p);
  });

  envelopeStage.addEventListener('click', () => {
    envelopeStage.classList.add('opened');
    setTimeout(() => {
      letterPaper.classList.add('show');
    }, 350);
  });
})();

// ============================================
// SONGS
// ============================================

(function initSongsScene() {
  const list = document.getElementById('song-list');

  CONFIG.songs.forEach((song) => {
    const card = document.createElement('div');
    card.className = 'song-card';

    const header = document.createElement('div');
    header.className = 'song-card-header';

    const titleBlock = document.createElement('div');
    const titleLine = document.createElement('div');
    titleLine.className = 'song-title-line';
    titleLine.textContent = song.artist ? `${song.title} — ${song.artist}` : song.title;
    titleBlock.appendChild(titleLine);

    const toggleIcon = document.createElement('span');
    toggleIcon.className = 'song-toggle-icon';
    toggleIcon.textContent = '▾';

    header.appendChild(titleBlock);
    header.appendChild(toggleIcon);

    const reason = document.createElement('p');
    reason.className = 'song-reason';
    reason.textContent = `this one → ${song.reason}`;

    const playerWrap = document.createElement('div');
    playerWrap.className = 'song-player-wrap';

    card.appendChild(header);
    card.appendChild(reason);
    card.appendChild(playerWrap);
    list.appendChild(card);

    card.addEventListener('click', () => {
      const alreadyOpen = card.classList.contains('open');

      document.querySelectorAll('.song-card.open').forEach(openCard => {
        if (openCard !== card) {
          openCard.classList.remove('open');
          openCard.querySelector('.song-player-wrap').innerHTML = '';
        }
      });

        if (alreadyOpen) {
          card.classList.remove('open');
          playerWrap.innerHTML = '';
          window.resumeBgMusic();
      } else {
          card.classList.add('open');
          window.pauseBgMusic();
        if (!playerWrap.querySelector('iframe')) {
          const iframe = document.createElement('iframe');
          iframe.src = `https://www.youtube.com/embed/${song.videoId}?autoplay=1`;
          iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
          iframe.allowFullscreen = true;
          playerWrap.appendChild(iframe);
        }
      }
    });
  });
})();

// ============================================
// LITTLE THINGS I LOVE ABOUT YOU — FLIP CARDS
// ============================================

(function initThingsScene() {
  const grid = document.getElementById('things-grid');
  const frontIcons = ['♡', '✧', '☆', '♡', '✦', '✧', '♡'];

  CONFIG.littleThings.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'flip-card';

    const inner = document.createElement('div');
    inner.className = 'flip-card-inner';

    const front = document.createElement('div');
    front.className = 'flip-card-front';

    const img = document.createElement('img');
    img.src = item.photo;
    img.alt = '';
    img.addEventListener('error', () => {
      const fallback = document.createElement('div');
      fallback.className = 'fallback-icon';
      fallback.textContent = frontIcons[i % frontIcons.length];
      img.replaceWith(fallback);
    });
    front.appendChild(img);

    const back = document.createElement('div');
    back.className = 'flip-card-back';
    back.textContent = item.text;

    inner.appendChild(front);
    inner.appendChild(back);
    card.appendChild(inner);
    grid.appendChild(card);

    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
    });
  });
})();


// ============================================
// OPEN WHEN YOU NEED ME
// ============================================

(function initOpenWhenScene() {
  const list = document.getElementById('envelope-list');
  const lightbox = document.getElementById('openwhen-lightbox');
  const labelEl = document.getElementById('openwhen-label');
  const messageEl = document.getElementById('openwhen-message');

  CONFIG.openWhenEnvelopes.forEach((env) => {
    const item = document.createElement('div');
    item.className = 'envelope-item';

    const icon = document.createElement('span');
    icon.className = 'envelope-item-icon';
    icon.textContent = '💌';

    const label = document.createElement('span');
    label.className = 'envelope-item-label';
    label.textContent = env.label;

    item.appendChild(icon);
    item.appendChild(label);
    list.appendChild(item);

    item.addEventListener('click', () => {
      labelEl.textContent = env.label;
      messageEl.textContent = env.message;
      lightbox.classList.add('show');
    });
  });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      lightbox.classList.remove('show');
    }
  });
})();

// ============================================
// OUR FUTURE
// ============================================

(function initFutureScene() {
  const starsContainer = document.getElementById('future-stars');
  const photoImg = document.getElementById('future-photo');
  const list = document.getElementById('future-list');
  const songWrap = document.getElementById('future-song-wrap');

  const STAR_COUNT = 35;
  for (let i = 0; i < STAR_COUNT; i++) {
    const star = document.createElement('span');
    star.style.top = Math.random() * 100 + '%';
    star.style.left = Math.random() * 100 + '%';
    star.style.animationDuration = (1.5 + Math.random() * 2.5) + 's';
    star.style.animationDelay = (Math.random() * 3) + 's';
    starsContainer.appendChild(star);
  }

  photoImg.src = CONFIG.futureImage;
  photoImg.alt = '';
  photoImg.addEventListener('error', () => {
    const fallback = document.createElement('div');
    fallback.className = 'fallback-icon';
    fallback.textContent = '💍';
    photoImg.replaceWith(fallback);
  });

  CONFIG.futurePlans.forEach((text) => {
    const chip = document.createElement('div');
    chip.className = 'future-chip';
    chip.innerHTML = `<span>⭐</span><span>${text}</span>`;
    list.appendChild(chip);
  });

  const song = CONFIG.futureSong;
  const card = document.createElement('div');
  card.className = 'song-card';

  const header = document.createElement('div');
  header.className = 'song-card-header';

  const titleBlock = document.createElement('div');
  const titleLine = document.createElement('div');
  titleLine.className = 'song-title-line';
  titleLine.textContent = song.artist ? `${song.title} — ${song.artist}` : song.title;
  titleBlock.appendChild(titleLine);

  const toggleIcon = document.createElement('span');
  toggleIcon.className = 'song-toggle-icon';
  toggleIcon.textContent = '▾';

  header.appendChild(titleBlock);
  header.appendChild(toggleIcon);

  const reason = document.createElement('p');
  reason.className = 'song-reason';
  reason.textContent = `this one → ${song.reason}`;

  const playerWrap = document.createElement('div');
  playerWrap.className = 'song-player-wrap';

  card.appendChild(header);
  card.appendChild(reason);
  card.appendChild(playerWrap);
  songWrap.appendChild(card);

  card.addEventListener('click', () => {
    const isOpen = card.classList.contains('open');
      if (isOpen) {
        card.classList.remove('open');
        playerWrap.innerHTML = '';
        window.resumeBgMusic();
    } else {
        card.classList.add('open');
        window.pauseBgMusic();
      if (!playerWrap.querySelector('iframe')) {
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${song.videoId}?autoplay=1`;
        iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
        iframe.allowFullscreen = true;
        playerWrap.appendChild(iframe);
      }
    }
  });
})();

// ============================================
// SECRET AREA — hidden key + secret lock
// ============================================

(function initSecretArea() {
  const hiddenKey = document.getElementById('hidden-key');
  const line1 = document.getElementById('secret-line-1');
  const line2 = document.getElementById('secret-line-2');
  const inputWrap = document.getElementById('secret-input-wrap');
  const secretInput = document.getElementById('secret-password-input');
  const secretKeypad = document.getElementById('secret-keypad');
  const errorMsg = document.getElementById('secret-lock-error');
  const secretLockScene = document.getElementById('scene-secret-lock');
  const secretBox = document.querySelector('.secret-reveal-box');

  const keys = ['1','2','3','4','5','6','7','8','9','⌫','0','✓'];
  keys.forEach(k => {
    const btn = document.createElement('div');
    btn.className = 'key';
    btn.textContent = k;
    btn.addEventListener('click', () => handleSecretKey(k));
    secretKeypad.appendChild(btn);
  });

  function handleSecretKey(k) {
    if (k === '⌫') {
      secretInput.value = secretInput.value.slice(0, -1);
    } else if (k === '✓') {
      checkSecretPassword();
    } else if (secretInput.value.length < 6) {
      secretInput.value += k;
    }
  }

  hiddenKey.addEventListener('click', () => {
    goToScene('scene-secret-lock');
    line1.classList.remove('show');
    line2.classList.remove('show');
    inputWrap.classList.remove('show');
    setTimeout(() => line1.classList.add('show'), 200);
    setTimeout(() => line2.classList.add('show'), 1200);
    setTimeout(() => inputWrap.classList.add('show'), 2000);
  });

  function checkSecretPassword() {
    if (secretInput.value === CONFIG.secretPassword) {
      secretLockScene.classList.add('unlocking');
      setTimeout(() => {
        goToScene('scene-secret-letter');
        secretLockScene.classList.remove('unlocking');
      }, 850);
    } else {
      errorMsg.textContent = "not quite... try again?";
      errorMsg.classList.add('show');
      secretBox.classList.add('shake');
      secretInput.value = '';
      setTimeout(() => secretBox.classList.remove('shake'), 350);
    }
  }

  secretInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') checkSecretPassword();
  });
})();

// ============================================
// SECRET LETTER
// ============================================
(function initSecretLetterScene() {
  const body = document.getElementById('secret-letter-body');
  const signoffName = document.getElementById('secret-signoff-name');

  const paragraphs = CONFIG.secretLetter.split('\n\n');
  paragraphs.forEach(text => {
    const p = document.createElement('p');
    p.textContent = text.trim();
    body.appendChild(p);
  });

  signoffName.textContent = CONFIG.boyfriendName;
})();


  // tap the letter to continue to the final scene
  const clickableLetter = document.getElementById('secret-letter-paper-clickable');
  clickableLetter.addEventListener('click', () => {
    goToScene('scene-final');
  });

  // ============================================
  // FINAL SCENE
  // ============================================


(function initFinalScene() {
  const finalScene = document.getElementById('scene-final');
  const heartsContainer = document.getElementById('final-hearts');
  const calcLine = document.getElementById('final-line-calc');
  const progressWrap = document.getElementById('final-progress-wrap');
  const progressBar = document.getElementById('final-progress-bar');
  const percentText = document.getElementById('final-percent');
  const errorLine = document.getElementById('final-line-error');
  const okayLine = document.getElementById('final-line-okay');
  const comeHereLine = document.getElementById('final-line-comehere');
  const emoji = document.getElementById('final-emoji');

  let hasPlayed = false;

  const observer = new MutationObserver(() => {
    if (finalScene.classList.contains('scene--active') && !hasPlayed) {
      hasPlayed = true;
      playFinalSequence();
    }
  });
  observer.observe(finalScene, { attributes: true, attributeFilter: ['class'] });

    function playFinalSequence() {
    calcLine.classList.add('show');

    let pct = 0;
    let step = 1;
    const interval = setInterval(() => {
      pct += step;
      if (pct > 100) {
        step *= 1.3;
      }
      progressBar.style.width = Math.min(pct, 100) + '%';
      percentText.textContent = Math.floor(pct).toLocaleString() + '%';

      if (pct > 50000) {
        clearInterval(interval);
        setTimeout(showError, 500);
      }
    }, 30);

    function showError() {
      progressWrap.style.transition = 'opacity 0.4s ease';
      percentText.style.transition = 'opacity 0.4s ease';
      progressWrap.style.opacity = '0';
      percentText.style.opacity = '0';
      errorLine.classList.add('show');
      setTimeout(showOkay, 1400);
    }

    function showOkay() {
      okayLine.classList.add('show');
      setTimeout(showComeHere, 1200);
    }

    function showComeHere() {
      comeHereLine.classList.add('show');
      setTimeout(showEmoji, 1200);
    }

    function showEmoji() {
      emoji.classList.add('show');
      startFloatingHearts();
    }
  }
  function startFloatingHearts() {
    setInterval(() => {
      const heart = document.createElement('span');
      heart.textContent = '❤️';
      heart.style.left = Math.random() * 100 + '%';
      heart.style.animationDuration = (5 + Math.random() * 4) + 's';
      heartsContainer.appendChild(heart);
      setTimeout(() => heart.remove(), 9000);
    }, 600);
  }
})();