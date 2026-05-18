// Track Carousel Functionality
(function() {
  const carousel = document.querySelector('.track-carousel');
  const prevBtn = document.querySelector('.carousel-btn-prev');
  const nextBtn = document.querySelector('.carousel-btn-next');
  const dots = document.querySelectorAll('.carousel-dot');
  
  if (!carousel || !prevBtn || !nextBtn) return;
  
  let currentIndex = 0;
  const cards = carousel.querySelectorAll('.track-card-wrapper');
  const totalCards = cards.length;
  
  // Calculate how many cards to show based on screen width
  function getCardsToShow() {
    const width = window.innerWidth;
    if (width >= 1056) return 4; // lg: show all 4
    if (width >= 672) return 2;  // md: show 2
    return 1;                     // sm: show 1
  }
  
  function updateCarousel() {
    const cardsToShow = getCardsToShow();
    const cardWidth = 100 / cardsToShow;
    const offset = -(currentIndex * cardWidth);
    
    carousel.style.transform = `translateX(${offset}%)`;
    
    // Update dots
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });
    
    // Update button states
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= totalCards - cardsToShow;
    
    // Hide dots if all cards are visible
    const dotsContainer = document.querySelector('.carousel-dots');
    if (dotsContainer) {
      dotsContainer.style.display = cardsToShow >= totalCards ? 'none' : 'flex';
    }
  }
  
  function goToSlide(index) {
    const cardsToShow = getCardsToShow();
    const maxIndex = Math.max(0, totalCards - cardsToShow);
    currentIndex = Math.max(0, Math.min(index, maxIndex));
    updateCarousel();
  }
  
  prevBtn.addEventListener('click', () => {
    goToSlide(currentIndex - 1);
  });
  
  nextBtn.addEventListener('click', () => {
    goToSlide(currentIndex + 1);
  });
  
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      goToSlide(index);
    });
  });
  
  // Handle window resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      goToSlide(currentIndex); // Recalculate on resize
    }, 250);
  });
  
  // Initialize
  updateCarousel();
  
  // Touch/swipe support for mobile
  let touchStartX = 0;
  let touchEndX = 0;
  
  carousel.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  
  carousel.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });
  
  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe left - next
        goToSlide(currentIndex + 1);
      } else {
        // Swipe right - prev
        goToSlide(currentIndex - 1);
      }
    }
  }
})();

// Made with Bob
