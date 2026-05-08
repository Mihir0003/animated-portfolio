document.addEventListener('DOMContentLoaded', () => {
    // Setup Intersection Observer for elements coming into view on scrolling
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Triggers when 15% of the element is visible in the viewport
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Attach 'in-view' class to trigger CSS transition
                entry.target.classList.add('in-view');
                
                // Once an item is fully animated, we can unobserve if we don't want it to vanish scrolling up.
                // For a portfolio, leaving it visible is usually best, so we unobserve.
                obs.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    // Apply observer to all elements meant to animate on scroll
    const scrollElements = document.querySelectorAll('.scroll-anim');
    scrollElements.forEach(el => observer.observe(el));
});

// Typewriter effect for Hero Title
const titleSpan = document.querySelector('.gradient-text');
if (titleSpan) {
    const text = titleSpan.textContent;
    titleSpan.textContent = '';
    titleSpan.style.borderRight = '2px solid var(--accent-1)';
    
    let i = 0;
    setTimeout(() => {
        const typeWriter = setInterval(() => {
            if (i < text.length) {
                titleSpan.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(typeWriter);
                // Blink cursor briefly then remove
                setTimeout(() => { titleSpan.style.borderRight = 'transparent'; }, 2000);
            }
        }, 80);
    }, 1200);
}
