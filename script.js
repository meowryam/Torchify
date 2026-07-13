/* =====================================================
   TORCHIFY — SCRIPT
   Modular vanilla JS. No dependencies.
   ===================================================== */

(function () {
  'use strict';

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
        stageSection: document.getElementById('torch'),
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
    }

    function handleTorchClick() {
      if (!isOn) {
        turnOn();
      } else {
        ModalController.open();
      }
    }

    function turnOn() {
      if (isOn) return;
      isOn = true;
      elements.torch.classList.add('is-on');
      elements.torch.setAttribute('aria-pressed', 'true');
      elements.glow.classList.add('is-on');
      elements.beamWrap.classList.add('is-on');
      elements.statusDot.classList.add('is-on');
      elements.statusText.textContent = 'ON';
      elements.body.classList.add('is-lit');
      if (elements.stageSection) elements.stageSection.classList.add('is-lit');
    }

    function forceOff() {
      isOn = false;
      elements.torch.classList.remove('is-on');
      elements.torch.setAttribute('aria-pressed', 'false');
      elements.glow.classList.remove('is-on');
      elements.beamWrap.classList.remove('is-on');
      elements.statusDot.classList.remove('is-on');
      elements.statusText.textContent = 'OFF';
      elements.body.classList.remove('is-lit');
      if (elements.stageSection) elements.stageSection.classList.remove('is-lit');
    }

    return { init, forceOff, get isOn() { return isOn; } };
  })();

  const ModalController = (() => {
    let elements = {};

    function init() {
      elements = {
        overlay: document.getElementById('modalOverlay'),
        modal: document.getElementById('modal'),
        closeBtn: document.getElementById('modalClose'),
        laterBtn: document.getElementById('modalLater'),
        upgradeBtn: document.getElementById('modalUpgrade'),
        pricingSection: document.getElementById('pricing'),
      };

      if (!elements.overlay) return;

      document.querySelectorAll('[data-open-modal]').forEach((btn) => {
        btn.addEventListener('click', open);
      });

      elements.closeBtn.addEventListener('click', close);
      elements.laterBtn.addEventListener('click', handleMaybeLater);
      elements.upgradeBtn.addEventListener('click', handleUpgrade);

      elements.overlay.addEventListener('click', (e) => {
        if (e.target === elements.overlay) close();
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && elements.overlay.classList.contains('is-open')) close();
      });
    }

    function open() {
      elements.overlay.classList.add('is-open');
      elements.overlay.setAttribute('aria-hidden', 'false');
      elements.upgradeBtn.focus();
    }

    function close() {
      elements.overlay.classList.remove('is-open');
      elements.overlay.setAttribute('aria-hidden', 'true');
    }

    function handleMaybeLater() {
      shake(elements.laterBtn);
      shake(elements.modal);
    }

    function handleUpgrade() {
      close();
      if (elements.pricingSection) {
        window.setTimeout(() => {
          elements.pricingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    }

    function shake(el) {
      el.classList.remove('btn--shake');
      void el.offsetWidth;
      el.classList.add('btn--shake');
      el.addEventListener('animationend', () => {
        el.classList.remove('btn--shake');
      }, { once: true });
    }

    return { init, open, close };
  })();

  const RevealOnScroll = (() => {
    function observe(selector, threshold, rootMargin, staggered) {
      const targets = document.querySelectorAll(selector);
      if (!targets.length) return;

      if (!('IntersectionObserver' in window)) {
        targets.forEach((el) => el.classList.add('is-visible'));
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              if (staggered) {
                const siblings = entry.target.parentElement.querySelectorAll(selector);
                const index = Array.prototype.indexOf.call(siblings, entry.target);
                window.setTimeout(() => entry.target.classList.add('is-visible'), index * 90);
              } else {
                entry.target.classList.add('is-visible');
              }
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold, rootMargin }
      );

      targets.forEach((el) => observer.observe(el));
    }

    function init() {
      observe('[data-reveal-section]', 0.12, '0px 0px -60px 0px', false);
      observe('.plan', 0.15, '0px 0px -40px 0px', true);

      // Hero staggered fade-in, timed rather than scroll-triggered
      // since the hero is the first thing visible on load.
      const staggerEls = document.querySelectorAll('.hero [data-stagger]');
      staggerEls.forEach((el, i) => {
        window.setTimeout(() => el.classList.add('is-visible'), 120 + i * 110);
      });
    }

    return { init };
  })();

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

  document.addEventListener('DOMContentLoaded', () => {
    TorchController.init();
    ModalController.init();
    RevealOnScroll.init();
    SmoothAnchors.init();

    requestAnimationFrame(() => document.querySelector('.nav')?.classList.add('is-visible'));
  });
})();