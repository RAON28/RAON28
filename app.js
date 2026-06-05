document.addEventListener('DOMContentLoaded', () => {
  // 고양이 야옹 소리 효과음 목록
  const meowSounds = [
    'cat/야옹1.m4a',
    'cat/야옹2.m4a',
    'cat/야옹3.m4a',
    'cat/야옹4.m4a',
  ];

  function playRandomMeow() {
    const randomSound = meowSounds[Math.floor(Math.random() * meowSounds.length)];
    const audio = new Audio(randomSound);
    audio.volume = 0.2; // 너무 쨍하지 않게 볼륨 조율
    audio.play().catch(err => {
      console.log('Audio play blocked:', err);
    });
  }

  // 다국어 번역 데이터 로드 및 적용 (OS/브라우저 감지, 기본 fallback: 영어)
  async function initI18n(forcedLang) {
    const supportedLangs = ['ko', 'en', 'ja', 'zh', 'es', 'fr', 'de', 'ru'];
    
    // 1. 강제지정 언어 또는 2. 로컬스토리지 저장 선호 언어
    let userLang = forcedLang || localStorage.getItem('preferredLanguage');
    
    // 3. 저장된 언어가 없을 때 OS/브라우저 언어 자동 감지
    if (!userLang) {
      let browserLang = (navigator.language || navigator.userLanguage).toLowerCase();
      if (browserLang.startsWith('zh')) {
        userLang = 'zh';
      } else {
        userLang = browserLang.split('-')[0];
      }
    }
    
    // 4. 감지된 언어가 미지원인 경우 최종 기본언어 영어(en) 설정
    if (!supportedLangs.includes(userLang)) {
      userLang = 'en';
    }

    try {
      const response = await fetch(`locales/${userLang}.json`);
      if (!response.ok) throw new Error('Locale file load failed');
      const translations = await response.json();
      
      // HTML 요소 번역 적용
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[key]) {
          if (el.tagName === 'TITLE') {
            document.title = translations[key];
          } else if (el.innerHTML.includes('<br>') || key === 'header_desc') {
            el.innerHTML = translations[key];
          } else {
            el.textContent = translations[key];
          }
        }
      });
      
      // 헤더 다국어 버튼 라벨 갱신
      const langBtn = document.getElementById('header-lang-btn');
      if (langBtn) {
        langBtn.innerHTML = `<i class="fa-solid fa-globe"></i> ${userLang.toUpperCase()} <i class="fa-solid fa-chevron-down"></i>`;
      }
      
      window.translations = translations;
    } catch (err) {
      console.error('Translation error:', err);
    }
  }

  // 다국어 처리 즉시 실행 (기본언어 영어)
  initI18n();

  // 언어 선택 드롭다운 기능 구현
  const langBtn = document.getElementById('header-lang-btn');
  const langDropdown = document.getElementById('header-lang-dropdown');

  if (langBtn && langDropdown) {
    langBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      langDropdown.classList.toggle('active');
    });

    document.addEventListener('click', () => {
      langDropdown.classList.remove('active');
    });

    langDropdown.querySelectorAll('.lang-option').forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.preventDefault();
        const selectedLang = opt.getAttribute('data-lang');
        localStorage.setItem('preferredLanguage', selectedLang);
        initI18n(selectedLang);
        langDropdown.classList.remove('active');
      });
    });
  }

  // 고양이 꼬리 동적 추가
  const tailButtons = document.querySelectorAll('.btn, .donation-btn');
  tailButtons.forEach(btn => {
    if (!btn.querySelector('.cat-tail')) {
      const tail = document.createElement('span');
      tail.className = 'cat-tail';
      btn.appendChild(tail);
    }
  });

  // 모달 기능
  const modals = document.querySelectorAll('.modal');
  const closeButtons = document.querySelectorAll('.modal-close');
  const backdropElements = document.querySelectorAll('.modal-backdrop');

  function openModal(id) {
    const target = document.getElementById(id);
    if (target) {
      target.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal() {
    modals.forEach(modal => modal.classList.remove('active'));
    document.body.style.overflow = '';
  }

  closeButtons.forEach(btn => btn.addEventListener('click', closeModal));
  backdropElements.forEach(bg => bg.addEventListener('click', closeModal));

  // 국내 후원 클릭 이벤트
  const btnKakaopay = document.getElementById('btn-kakaopay');
  const btnBank = document.getElementById('btn-bank');

  if (btnKakaopay) {
    btnKakaopay.addEventListener('click', (e) => {
      e.preventDefault();
      openModal('modal-kakaopay');
    });
  }

  if (btnBank) {
    btnBank.addEventListener('click', (e) => {
      e.preventDefault();
      openModal('modal-bank');
    });
  }

  // 복사 기능 & 토스트
  const copyBtn = document.getElementById('btn-copy-account');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const accountText = document.getElementById('bank-account-number').innerText;
      navigator.clipboard.writeText(accountText).then(() => {
        const msg = (window.translations && window.translations.toast_copy_success) 
                    || '계좌번호가 클립보드에 복사되었습니다.';
        showToast(msg);
      }).catch(err => {
        const msg = (window.translations && window.translations.toast_copy_fail) 
                    || '복사에 실패했습니다. 직접 복사해주세요.';
        showToast(msg);
      });
    });
  }

  function showToast(message) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" width="18" height="18">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
      if (container.children.length === 0) {
        container.remove();
      }
    }, 3000);
  }

  // --- 슬라이더 자동 루프 및 수동 슬라이드 제어 로직 ---
  const sliders = document.querySelectorAll('.slider-container');

  sliders.forEach(slider => {
    const slides = slider.querySelectorAll('.slide');
    const dots = slider.querySelectorAll('.dot');

    let currentIndex = 0;
    const slideCount = slides.length;
    let autoSlideInterval;

    function showSlide(index) {
      // 범위 정정
      if (index >= slideCount) {
        currentIndex = 0;
      } else if (index < 0) {
        currentIndex = slideCount - 1;
      } else {
        currentIndex = index;
      }

      // 슬라이드 활성화 토글
      slides.forEach((slide, idx) => {
        if (idx === currentIndex) {
          slide.classList.add('active');
        } else {
          slide.classList.remove('active');
        }
      });

      // 도트 활성화 토글
      dots.forEach((dot, idx) => {
        if (idx === currentIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }

    function nextSlide() {
      showSlide(currentIndex + 1);
    }

    let isTimeoutActive = false;

    function startAutoSlide() {
      if (!autoSlideInterval && !isTimeoutActive) {
        autoSlideInterval = setInterval(nextSlide, 4000);
      }
    }

    function stopAutoSlide() {
      if (isTimeoutActive) {
        clearTimeout(autoSlideInterval);
        isTimeoutActive = false;
        autoSlideInterval = null;
      } else if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
        autoSlideInterval = null;
      }
    }

    // 인디케이터 도트 클릭 바인딩
    dots.forEach(dot => {
      dot.addEventListener('click', (e) => {
        const targetIndex = parseInt(e.target.getAttribute('data-index'));
        stopAutoSlide();
        showSlide(targetIndex);

        const isHovered = slider.matches(':hover');
        if (!isHovered) {
          startAutoSlide();
        }
      });
    });

    // 마우스가 이미지 영역 위에 올라가면 자동 슬라이드 일시정지
    slider.addEventListener('mouseenter', stopAutoSlide);
    slider.addEventListener('mouseleave', () => {
      nextSlide(); // 호버 해제 시 즉각 다음 슬라이드로 전환
      startAutoSlide(); // 멈추지 않고 계속해서 자동 롤링 작동
    });

    // 최초 자동 롤링 작동 시작
    startAutoSlide();
  });

  // 일반 버튼 호버 시 로고 아이콘 파티클 효과
  const normalButtons = document.querySelectorAll('.btn');
  normalButtons.forEach(btn => {
    let logoInterval;

    function createLogo() {
      const imgEl = btn.querySelector('img');
      if (!imgEl) return;
      const imgSrc = imgEl.src;

      const logo = document.createElement('img');
      logo.className = 'logo-particle';
      logo.src = imgSrc;

      const size = Math.random() * 8 + 12; // 12px ~ 20px
      logo.style.width = `${size}px`;
      logo.style.height = `${size}px`;

      const rect = btn.getBoundingClientRect();
      const x = Math.random() * rect.width;
      const y = Math.random() * rect.height;
      logo.style.left = `${x}px`;
      logo.style.top = `${y}px`;

      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 50 + 40;
      const destinationX = Math.cos(angle) * velocity;
      const destinationY = Math.sin(angle) * velocity;

      logo.style.setProperty('--tx', `${destinationX}px`);
      logo.style.setProperty('--ty', `${destinationY}px`);

      btn.appendChild(logo);

      setTimeout(() => {
        logo.remove();
      }, 1000);
    }

    btn.addEventListener('mouseenter', () => {
      playRandomMeow(); // 야옹 오디오 재생
      for (let i = 0; i < 5; i++) {
        setTimeout(createLogo, i * 70);
      }
      logoInterval = setInterval(createLogo, 250);
    });

    btn.addEventListener('mouseleave', () => {
      clearInterval(logoInterval);
    });
  });

  // 후원 버튼 호버 시 하트 파티클 효과
  const donationButtons = document.querySelectorAll('.donation-btn');
  donationButtons.forEach(btn => {
    let heartInterval;

    function createHeart() {
      const heart = document.createElement('span');
      heart.className = 'heart-particle';
      heart.innerHTML = '❤️';

      const size = Math.random() * 10 + 10;
      heart.style.fontSize = `${size}px`;

      const rect = btn.getBoundingClientRect();
      const x = Math.random() * rect.width;
      const y = Math.random() * rect.height;
      heart.style.left = `${x}px`;
      heart.style.top = `${y}px`;

      const angle = Math.random() * Math.PI * 2; // 사방(좌우상하) 전체 방향으로 퍼지도록 원복
      const velocity = Math.random() * 50 + 40;
      const destinationX = Math.cos(angle) * velocity;
      const destinationY = Math.sin(angle) * velocity;

      heart.style.setProperty('--tx', `${destinationX}px`);
      heart.style.setProperty('--ty', `${destinationY}px`);

      btn.appendChild(heart);

      setTimeout(() => {
        heart.remove();
      }, 1000);
    }

    btn.addEventListener('mouseenter', () => {
      playRandomMeow(); // 야옹 오디오 재생
      for (let i = 0; i < 5; i++) {
        setTimeout(createHeart, i * 70);
      }
      heartInterval = setInterval(createHeart, 250);
    });

    btn.addEventListener('mouseleave', () => {
      clearInterval(heartInterval);
    });
  });

  // 배경 쥐 생성 및 고양이 커서 회피 (물리 시뮬레이션 및 충돌 감지 기반)
  const mouseImgs = ['cat/Mouse1.png', 'cat/Mouse2.png', 'cat/Mouse3.png'];
  const miceCount = 120;
  const mice = [];

  let mouseX = -1000;
  let mouseY = -1000;

  let bodyHeight = document.documentElement.scrollHeight;
  let bodyWidth = document.documentElement.scrollWidth;
  let obstacles = [];

  // 카드, 헤더 등 충돌체의 절대 영역 좌표 수집
  function updateObstacles() {
    obstacles = [];
    const targets = document.querySelectorAll('.header-container, .glass-card, section h2');
    targets.forEach(el => {
      if (el.offsetWidth > 0 && el.offsetHeight > 0) {
        const rect = el.getBoundingClientRect();
        obstacles.push({
          left: rect.left + window.scrollX,
          right: rect.right + window.scrollX,
          top: rect.top + window.scrollY,
          bottom: rect.bottom + window.scrollY
        });
      }
    });
  }

  // 쥐 인스턴스 초기 생성 (body 삽입)
  for (let i = 0; i < miceCount; i++) {
    const mouseEl = document.createElement('img');
    mouseEl.src = mouseImgs[i % mouseImgs.length];
    mouseEl.className = 'bg-mouse';
    document.body.appendChild(mouseEl);

    mice.push({
      element: mouseEl,
      x: 0,
      y: 0,
      originX: 0,
      originY: 0,
      vx: 0,
      vy: 0,
      angle: 0
    });
  }

  // 페이지 전체에 쥐들을 골고루 분산시키는 함수 (충돌 영역 내부 피해서 스폰)
  function distributeMice() {
    updateObstacles();
    bodyHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );
    bodyWidth = document.documentElement.scrollWidth;

    mice.forEach(m => {
      let initX, initY, isInside;
      let attempts = 0;

      // 충돌체 안이 아닌 여백 영역을 찾아 최대 20회 탐색
      do {
        initX = Math.random() * (bodyWidth - 120) + 60;
        initY = Math.random() * (bodyHeight - 120) + 60;
        isInside = false;

        for (let obs of obstacles) {
          if (initX >= obs.left - 20 && initX <= obs.right + 20 &&
            initY >= obs.top - 20 && initY <= obs.bottom + 20) {
            isInside = true;
            break;
          }
        }
        attempts++;
      } while (isInside && attempts < 20);

      m.x = initX;
      m.y = initY;
      m.originX = initX;
      m.originY = initY;
      m.vx = 0;
      m.vy = 0;
      m.element.style.left = `${initX}px`;
      m.element.style.top = `${initY}px`;
      m.element.style.transform = 'rotate(0deg) scale(1)';
    });
  }

  // 초기 위치 할당
  distributeMice();

  // 리소스 로드 후 (전체 높이가 제대로 측정되는 시점)에 정확히 다시 분산
  window.addEventListener('load', distributeMice);

  // 창 크기 변경 시 재배치
  window.addEventListener('resize', distributeMice);

  // 글로벌 마우스 움직임 추적
  document.addEventListener('mousemove', (e) => {
    mouseX = e.pageX;
    mouseY = e.pageY;
  });

  // 물리 기반 실시간 루프 (충돌 반사 및 회피 기능)
  function updateMice() {
    const limitDist = 140; // 회피 인지 거리
    const r = 16; // 쥐의 충돌체 반경

    mice.forEach(m => {
      const dx = m.x - mouseX;
      const dy = m.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < limitDist) {
        // 마우스로부터 척력 작동
        const angle = Math.atan2(m.y - mouseY, m.x - mouseX);
        const force = (limitDist - dist) * 0.15;

        m.vx += Math.cos(angle) * force;
        m.vy += Math.sin(angle) * force;
      } else {
        // 집(origin)으로 끌어당기는 복원력
        const homeDx = m.originX - m.x;
        const homeDy = m.originY - m.y;
        m.vx += homeDx * 0.01;
        m.vy += homeDy * 0.01;
      }

      // 감속 마찰 계수
      m.vx *= 0.82;
      m.vy *= 0.82;

      // 좌표 적용
      m.x += m.vx;
      m.y += m.vy;

      // 다른 카드/헤더 요소(obstacles)와 충돌 연산
      obstacles.forEach(obs => {
        const closestX = Math.max(obs.left, Math.min(m.x, obs.right));
        const closestY = Math.max(obs.top, Math.min(m.y, obs.bottom));

        const distX = m.x - closestX;
        const distY = m.y - closestY;
        const distance = Math.sqrt(distX * distX + distY * distY);

        if (distance < r) {
          let overlap = r - distance;
          let normalX = 0;
          let normalY = 0;

          if (distance > 0) {
            normalX = distX / distance;
            normalY = distY / distance;
          } else {
            // 내부에 갇힌 예외적인 경우 밀어내기 방향 탐색
            const dl = m.x - obs.left;
            const dr = obs.right - m.x;
            const dt = m.y - obs.top;
            const db = obs.bottom - m.y;
            const minDist = Math.min(dl, dr, dt, db);

            if (minDist === dl) { normalX = -1; overlap = dl + r; }
            else if (minDist === dr) { normalX = 1; overlap = dr + r; }
            else if (minDist === dt) { normalY = -1; overlap = dt + r; }
            else if (minDist === db) { normalY = 1; overlap = db + r; }
          }

          // 위치 보정
          m.x += normalX * overlap;
          m.y += normalY * overlap;

          // 탄성 운동 반사
          const dot = m.vx * normalX + m.vy * normalY;
          if (dot < 0) {
            m.vx -= 1.6 * dot * normalX;
            m.vy -= 1.6 * dot * normalY;
          }
        }
      });

      // 페이지 경계 충돌 처리
      m.x = Math.max(15, Math.min(bodyWidth - 45, m.x));
      m.y = Math.max(15, Math.min(bodyHeight - 45, m.y));

      m.element.style.left = `${m.x}px`;
      m.element.style.top = `${m.y}px`;

      // 가속도 벡터에 따른 쥐 머리 회전
      const velocity = Math.sqrt(m.vx * m.vx + m.vy * m.vy);
      if (velocity > 0.3) {
        m.angle = Math.atan2(m.vy, m.vx) * (180 / Math.PI) + 90; // 90도는 이미지 초기 방향(머리) 정렬용 보정값
        m.element.style.transform = `rotate(${m.angle}deg) scale(1.15)`;
      } else {
        m.element.style.transform = 'rotate(0deg) scale(1)';
      }
    });

    requestAnimationFrame(updateMice);
  }

  requestAnimationFrame(updateMice);
});


