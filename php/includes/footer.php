        </div>
    </main>

    <!-- Alpine.js for interactivity -->
    <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>

    <script>
        // Initialize Lucide icons
        lucide.createIcons();

        // Re-initialize icons when DOM changes (for AJAX content)
        const observer = new MutationObserver(() => {
            lucide.createIcons();
        });
        observer.observe(document.body, { childList: true, subtree: true });

        // Mobile menu toggle
        const menuToggle = document.getElementById('menu-toggle');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');

        if (menuToggle && sidebar && overlay) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('-translate-x-full');
                sidebar.classList.toggle('sidebar-open');
                overlay.classList.toggle('hidden');
            });

            overlay.addEventListener('click', () => {
                sidebar.classList.add('-translate-x-full');
                sidebar.classList.remove('sidebar-open');
                overlay.classList.add('hidden');
            });
        }

        // Auto-hide flash messages after 5 seconds
        setTimeout(() => {
            const flashMessages = document.querySelectorAll('.flash-message, [class*="bg-green-50"], [class*="bg-red-50"], [class*="bg-yellow-50"]');
            flashMessages.forEach(msg => {
                if (msg.closest('.p-6') === msg.parentElement) {
                    msg.style.transition = 'all 0.5s ease-out';
                    msg.style.opacity = '0';
                    msg.style.transform = 'translateY(-10px)';
                    setTimeout(() => msg.remove(), 500);
                }
            });
        }, 5000);

        // Confirm before destructive actions
        document.querySelectorAll('[data-confirm]').forEach(el => {
            el.addEventListener('click', function(e) {
                if (!confirm(this.dataset.confirm || 'Tem certeza?')) {
                    e.preventDefault();
                    return false;
                }
            });
        });

        // Add loading state to forms
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', function() {
                const button = this.querySelector('button[type="submit"]');
                if (button && !button.disabled) {
                    button.disabled = true;
                    const originalText = button.innerHTML;
                    button.innerHTML = '<i data-lucide="loader-2" class="w-5 h-5 animate-spin inline mr-2"></i>Processando...';
                    lucide.createIcons();

                    // Re-enable after 10 seconds (fallback)
                    setTimeout(() => {
                        button.disabled = false;
                        button.innerHTML = originalText;
                        lucide.createIcons();
                    }, 10000);
                }
            });
        });

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            // Escape closes mobile menu
            if (e.key === 'Escape' && sidebar && !sidebar.classList.contains('-translate-x-full')) {
                sidebar.classList.add('-translate-x-full');
                sidebar.classList.remove('sidebar-open');
                overlay?.classList.add('hidden');
            }

            // Ctrl/Cmd + K for search focus
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.querySelector('input[placeholder*="Buscar"]');
                if (searchInput) searchInput.focus();
            }
        });

        // Tooltips (basic)
        document.querySelectorAll('[title]').forEach(el => {
            el.addEventListener('mouseenter', function() {
                this.dataset.originalTitle = this.title;
                this.title = '';
            });
            el.addEventListener('mouseleave', function() {
                if (this.dataset.originalTitle) {
                    this.title = this.dataset.originalTitle;
                }
            });
        });
    </script>

    <?php if (isLoggedIn()): ?>
    <script>
        // Check for new notifications every 30 seconds
        let notificationCheckInterval;

        function checkNotifications() {
            fetch('api/notifications.php?action=get&unread_only=1&limit=5')
                .then(response => response.json())
                .then(data => {
                    if (data.success && data.unread_count > 0) {
                        updateNotificationBadge(data.unread_count);
                    }
                })
                .catch(err => console.log('Notification check failed:', err));
        }

        function updateNotificationBadge(count) {
            const badge = document.querySelector('.notification-badge');
            if (badge) {
                badge.textContent = count > 9 ? '9+' : count;
                badge.classList.remove('hidden');
            }
        }

        // Start notification checking
        notificationCheckInterval = setInterval(checkNotifications, 30000);

        // Stop checking when page is hidden
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                clearInterval(notificationCheckInterval);
            } else {
                notificationCheckInterval = setInterval(checkNotifications, 30000);
            }
        });
    </script>
    <?php endif; ?>
</body>
</html>
