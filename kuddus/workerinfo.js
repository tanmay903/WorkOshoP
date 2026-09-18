document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault(); 
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });
});