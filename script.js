/* =====================================================
   TORCHIFY — SCRIPT
   Modular vanilla JS. No dependencies.
   ===================================================== */

(function () {
  'use strict';

  /* ---------------------------------------------------
     Module: TorchController
     Handles the single flashlight: ON is free, OFF is
     gated behind the premium modal.
     --------------------------------------------------- */
  const TorchController = (() => {
    let isOn = false;
    let elements = {};

    function init() {
      elements = {
        torch: document.getElementById('torchButton'),
        glow: document.getElementById('torchGlow'),
        beamWrap: document.getElementById('beamWrap'),
        statusDot: document.getElementById('statusDot'),
        statusText: document.getElementById('statusText'),
        body: document.body,
      };

      if (!elements.torch) return;

      elements.torch.addEventListener('click', handleTorchClick);
      elements.torch.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleTorchClick();
        }
      });

      const scrollBtn = document.getElementById('scrollToTorch');
      if (scrollBtn) {
        scrollBtn.addEventListener('click', () => {
          if (!isOn) {
            handleTorchClick();
          }
          elements.torch.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
      }
    }

    function handleTorchClick() {
      if (!isOn) {
        turnOn();
      } else {
        // Second click: flashlight cannot be turned off without Premium.
        ModalController.open();
      }
    }

    function turnOn() {
      isOn = true;
      elements.torch.classList.add('is-on');
      elements.torch.setAttribute('aria-pressed', 'true');
      elements.glow.classList.add('is-on');
      elements.beamWrap.classList.add('is-on');
      elements.statusDot.classList.add('is-on');
      elements.statusText.textContent = 'ON';
      elements.body.classList.add('is-lit');
    }

    // Exposed only in case future premium logic legitimately allows OFF.
    function forceOff() {
      isOn = false;
      elements.torch.classList.remove('is-on');
      elements.torch.setAttribute('aria-pressed', 'false');
      elements.glow.classList.remove('is-on');
      elements.beamWrap.classList.remove('is-on');
      elements.statusDot.classList.remove('is-on');
      elements.statusText.textContent = 'OFF';
      elements.body.classList.remove('is-lit');
    }

    return { init, forceOff, get isOn() { return isOn; } };
  })();

  /* ---------------------------------------------------
     Module: ModalController
     The premium upsell modal. Close and "Maybe Later"
     both intentionally fail to dismiss it — that's the
     joke — reinforcing the upgrade message instead.
     --------------------------------------------------- */
  const ModalController = (() => {
    let elements = {};

    function init() {
      elements = {
        overlay: document.getElementById('modalOverlay'),
        modal: document.getElementById('modal'),
        closeBtn: document.getElementById('modalClose'),
        laterBtn: document.getElementById('modalLater'),
        upgradeBtn: document.getElementById('modalUpgrade'),
      };

      if (!elements.overlay) return;

      document.querySelectorAll('[data-open-modal]').forEach((btn) => {
        btn.addEventListener('click', open);
      });

      elements.closeBtn.addEventListener('click', handleDismissAttempt);
      elements.laterBtn.addEventListener('click', handleMaybeLater);
      elements.upgradeBtn.addEventListener('click', handleUpgrade);

      // Clicking the dark overlay also nudges toward upgrading,
      // rather than closing — consistent with the modal's copy.
      elements.overlay.addEventListener('click', (e) => {
        if (e.target === elements.overlay) {
          handleDismissAttempt();
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && elements.overlay.classList.contains('is-open')) {
          handleDismissAttempt();
        }
      });
    }

    function open() {
      elements.overlay.classList.add('is-open');
      elements.overlay.setAttribute('aria-hidden', 'false');
      elements.upgradeBtn.focus();
    }

    function handleDismissAttempt() {
      // Deliberately does not close. Reinforces the bit with a shake.
      shake(elements.modal);
    }

    function handleMaybeLater() {
      shake(elements.laterBtn);
    }

    function handleUpgrade() {
      shake(elements.modal);
      elements.upgradeBtn.textContent = 'Redirecting to checkout…';
      setTimeout(() => {
        elements.upgradeBtn.textContent = 'Upgrade Now';
      }, 1800);
    }

    function shake(el) {
      el.classList.remove('btn--shake');
      // Force reflow so the animation can retrigger on repeated clicks.
      void el.offsetWidth;
      el.classList.add('btn--shake');
      el.addEventListener('animationend', () => {
        el.classList.remove('btn--shake');
      }, { once: true });
    }

    return { init, open };
  })();

  /* ---------------------------------------------------
     Module: RevealOnScroll
     Subtle fade/slide-in for sections as they enter view.
     --------------------------------------------------- */
  const RevealOnScroll = (() => {
    function init() {
      const targets = document.querySelectorAll('[data-reveal]');
      if (!targets.length) return;

      if (!('IntersectionObserver' in window)) {
        targets.forEach((el) => el.classList.add('is-visible'));
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
      );

      targets.forEach((el) => observer.observe(el));
    }

    return { init };
  })();

  /* ---------------------------------------------------
     Module: SmoothAnchors
     Ensures in-page nav links scroll smoothly and
     account for the sticky header height.
     --------------------------------------------------- */
  const SmoothAnchors = (() => {
    function init() {
      document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (e) => {
          const id = link.getAttribute('href');
          if (id.length <= 1) return;
          const target = document.querySelector(id);
          if (!target) return;
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });
    }
    return { init };
  })();

  /* ---------------------------------------------------
     Bootstrap
     --------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    TorchController.init();
    ModalController.init();
    RevealOnScroll.init();
    SmoothAnchors.init();

    // Hero is above the fold — reveal it immediately rather
    // than waiting on a scroll-triggered observer.
    const hero = document.querySelector('.hero [data-reveal], .nav[data-reveal]');
    document.querySelectorAll('.nav[data-reveal], .hero__copy[data-reveal], .hero__stage[data-reveal]')
      .forEach((el) => requestAnimationFrame(() => el.classList.add('is-visible')));
  });
})();