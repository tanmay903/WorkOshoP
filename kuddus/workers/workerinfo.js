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

document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const allForms = document.querySelectorAll('.nav-dropdown-form');

    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault(); 

            // Get the form directly next to this clicked button
            const associatedForm = this.nextElementSibling;

            // Check if this form is already open
            const isAlreadyOpen = associatedForm && !associatedForm.classList.contains('hidden');

            // 1. Remove active highlights from all items
            navItems.forEach(nav => nav.classList.remove('active'));

            // 2. Hide all open dropdown forms first
            allForms.forEach(form => form.classList.add('hidden'));

            // 3. Toggle state logic
            if (!isAlreadyOpen) {
                // If it was closed, make this tab active and reveal its form
                this.classList.add('active');
                if (associatedForm) {
                    associatedForm.classList.remove('hidden');
                }
            } else {
                // If it was already open, clicking it again just closes it completely
                this.classList.remove('active');
            }
        });
    });

    // Close forms if the user clicks anywhere completely outside the navbar
    window.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown-container')) {
            allForms.forEach(form => form.classList.add('hidden'));
            navItems.forEach(nav => nav.classList.remove('active'));
        }
    });
});


const starRating = document.querySelector('.star-rating');
        const ratingValue = document.getElementById('rating-value');

        starRating.addEventListener('change', function(e) {
            ratingValue.textContent = e.target.value;
        });
