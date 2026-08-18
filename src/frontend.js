/**
 * Sticky Nav Block — Frontend script
 * Handles: smooth scroll, scrollspy, collapsible toggle (mobile),
 *          fixed right-panel positioning on desktop.
 * Heading IDs are injected server-side — no JS ID injection needed.
 */
(function () {
	'use strict';

	var blocks = document.querySelectorAll('[data-snb]');
	if (!blocks.length) return;

	var panel = null;
	var placeholder = null;
	var showAfter = 0;
	var offset = 0;
	var links = [];
	var desktopBreakpoint = 768;
	var collapseBreakpoint = 1200;
	var collapseBtn = null;

	blocks.forEach(function (block) {
		offset = parseInt(block.dataset.offset, 10) || 0;
		showAfter = parseInt(block.dataset.showAfter, 10) || 0;
		desktopBreakpoint = parseInt(block.dataset.desktopBp, 10) || 768;
		collapseBreakpoint = parseInt(block.dataset.collapseBp, 10) || 1200;
		links = block.querySelectorAll('[data-snb-link]');
		var isCollapsible = block.classList.contains('snb-block--collapsible');

		// --- Collapsible toggle (mobile) ---
		if (isCollapsible) {
			var toggleBtn = block.querySelector('.snb-block__toggle');
			if (toggleBtn) {
				block.setAttribute('aria-expanded', 'true');
				toggleBtn.addEventListener('click', function () {
					var expanded = block.getAttribute('aria-expanded') === 'true';
					block.setAttribute('aria-expanded', String(!expanded));
					toggleBtn.setAttribute('aria-expanded', String(!expanded));
				});
			}
		}

		// --- Collapsed icon toggle (desktop narrow) ---
		collapseBtn = block.querySelector('.snb-block__collapse-btn');
		if (collapseBtn) {
			collapseBtn.addEventListener('click', function () {
				var collapsed = block.classList.contains('snb-block--collapsed');
				block.classList.toggle('snb-block--collapsed', !collapsed);
				collapseBtn.setAttribute('aria-expanded', String(collapsed));
			});
		}

		// --- Smooth scroll on click ---
		links.forEach(function (link) {
			link.addEventListener('click', function (e) {
				e.preventDefault();
				var targetId = link.dataset.target;
				var target = document.getElementById(targetId);
				if (!target) return;

				var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
				window.scrollTo({ top: top, behavior: 'smooth' });
			});
		});

		// --- Scrollspy: highlight active link + scroll-to-reveal ---
		function updateActiveLink() {
			var scrollPos = window.pageYOffset;

			// Show/hide based on scroll threshold — only when pinned (not mobile inline)
			if (showAfter > 0 && block.classList.contains('snb-block--pinned')) {
				if (scrollPos >= showAfter) {
					block.style.setProperty('--snb-visibility', '1');
					block.style.pointerEvents = 'auto';
				} else {
					block.style.setProperty('--snb-visibility', '0');
					block.style.pointerEvents = 'none';
				}
			}

			var activeLink = null;

			links.forEach(function (link) {
				var target = document.getElementById(link.dataset.target);
				if (!target) return;

				var targetTop = target.getBoundingClientRect().top + window.pageYOffset - offset;
				if (scrollPos >= targetTop - 20) {
					activeLink = link;
				}
			});

			links.forEach(function (link) {
				link.classList.remove('snb-block__link--active');
			});
			if (activeLink) {
				activeLink.classList.add('snb-block__link--active');
			}
		}

		window.addEventListener('scroll', updateActiveLink, { passive: true });
		updateActiveLink();

		// --- Desktop: fixed right-panel ---
		panel = block;
	});

	// Fixed-panel logic (runs once, shared across all blocks)
	if (panel) {
		function updateCollapseBtnVisibility(vw) {
			if (collapseBtn) {
				collapseBtn.style.display = (vw >= desktopBreakpoint && vw < collapseBreakpoint) ? 'block' : 'none';
			}
		}

		function maybePin() {
			var vw = window.innerWidth;

			// Mobile: restore inline
			if (vw < desktopBreakpoint) {
				if (placeholder && placeholder.parentNode) {
					placeholder.parentNode.insertBefore(panel, placeholder);
					placeholder.parentNode.removeChild(placeholder);
					panel.classList.remove('snb-block--pinned', 'snb-block--collapsed');
					placeholder = null;
				}
				updateCollapseBtnVisibility(vw);
				return;
			}

			// Collapsed icon state
			if (vw < collapseBreakpoint) {
				if (!placeholder) {
					placeholder = document.createElement('div');
					placeholder.style.height = panel.offsetHeight + 'px';
					panel.parentNode.insertBefore(placeholder, panel);
				}
				panel.classList.add('snb-block--pinned', 'snb-block--collapsed');
				updateCollapseBtnVisibility(vw);
				return;
			}

			// Full pinned state
			if (!placeholder) {
				placeholder = document.createElement('div');
				placeholder.style.height = panel.offsetHeight + 'px';
				panel.parentNode.insertBefore(placeholder, panel);
			}
			panel.classList.add('snb-block--pinned');
			panel.classList.remove('snb-block--collapsed');
			updateCollapseBtnVisibility(vw);
		}

		window.addEventListener('resize', function () {
			if (placeholder) {
				placeholder.parentNode.insertBefore(panel, placeholder);
				placeholder.parentNode.removeChild(placeholder);
				panel.classList.remove('snb-block--pinned', 'snb-block--collapsed');
				placeholder = null;
			}
			maybePin();
		});
		maybePin();
	}
})();
