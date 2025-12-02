        </div>
    </main>

    <script>
        // Initialize Lucide icons
        lucide.createIcons();

        // Mobile menu toggle
        const menuToggle = document.getElementById('menu-toggle');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');

        if (menuToggle && sidebar && overlay) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('-translate-x-full');
                overlay.classList.toggle('hidden');
            });

            overlay.addEventListener('click', () => {
                sidebar.classList.add('-translate-x-full');
                overlay.classList.add('hidden');
            });
        }

        // Auto-hide flash messages
        setTimeout(() => {
            const flashMessages = document.querySelectorAll('[class*="bg-green-100"], [class*="bg-red-100"], [class*="bg-yellow-100"]');
            flashMessages.forEach(msg => {
                msg.style.transition = 'opacity 0.5s';
                msg.style.opacity = '0';
                setTimeout(() => msg.remove(), 500);
            });
        }, 5000);
    </script>
</body>
</html>
