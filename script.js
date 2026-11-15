const menuToggle = document.querySelector('.menu-toggle');
const primaryNav = document.querySelector('#primary-nav');

const heroSlides = Array.from(document.querySelectorAll('.hero-slide'));
const heroIndicators = Array.from(document.querySelectorAll('.hero-indicator'));
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let heroTimer;

function showHeroSlide(index) {
    heroSlides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === index;
        slide.classList.toggle('is-active', isActive);
        heroIndicators[slideIndex].classList.toggle('is-active', isActive);
        heroIndicators[slideIndex].setAttribute('aria-pressed', String(isActive));
    });
}

// Pause autoplay for reduced motion and while the page is in a background tab.
function startHeroTimer() {
    window.clearInterval(heroTimer);
    if (reducedMotion.matches || document.hidden) return;

    heroTimer = window.setInterval(() => {
        const activeIndex = heroSlides.findIndex((slide) => slide.classList.contains('is-active'));
        showHeroSlide((activeIndex + 1) % heroSlides.length);
    }, 5000);
}

heroIndicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
        showHeroSlide(index);
        startHeroTimer();
    });
});

document.addEventListener('visibilitychange', startHeroTimer);
startHeroTimer();

menuToggle.addEventListener('click', () => {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isExpanded));
    menuToggle.setAttribute('aria-label', isExpanded ? 'Open navigation' : 'Close navigation');
    primaryNav.classList.toggle('is-open', !isExpanded);
});

primaryNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Open navigation');
        primaryNav.classList.remove('is-open');
    });
});

const bookingForm = document.querySelector('#booking-form');
const unitType = document.querySelector('#unit-type');
const checkin = document.querySelector('#checkin');
const checkout = document.querySelector('#checkout');
const guestCount = document.querySelector('#guest-count');
const estimateTotal = document.querySelector('#estimate-total');
const estimateHint = document.querySelector('#estimate-hint');
const bookingNote = document.querySelector('#booking-note');
const whatsappNumber = '254727622603';
const units = {
    studio: { name: 'Executive Studio', rate: 6500, capacity: 2 },
    'one-bedroom': { name: '1-Bedroom Suite', rate: 9500, capacity: 2 },
    'two-bedroom': { name: '2-Bedroom Residence', rate: 14000, capacity: 4 }
};

const today = new Date();
const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
checkin.min = localToday;
checkout.min = localToday;

function getStayDetails() {
    // Parse date-only values as UTC so daylight-saving changes cannot alter the night count.
    const start = checkin.value ? new Date(`${checkin.value}T00:00:00Z`) : null;
    const end = checkout.value ? new Date(`${checkout.value}T00:00:00Z`) : null;
    const nights = start && end ? Math.round((end - start) / 86400000) : 0;

    if (nights <= 0) return null;

    const unit = units[unitType.value];
    // Apply the best single long-stay tier; discounts do not stack.
    const discount = nights >= 28 ? 0.2 : nights >= 7 ? 0.1 : 0;
    const total = Math.round(unit.rate * nights * (1 - discount));

    return { unit, nights, discount, total };
}

function updateEstimate() {
    const details = getStayDetails();
    const selectedUnit = units[unitType.value];
    guestCount.max = String(selectedUnit.capacity);
    Array.from(guestCount.options).forEach((option) => {
        option.disabled = Number(option.value) > selectedUnit.capacity;
    });

    if (Number(guestCount.value) > selectedUnit.capacity) {
        guestCount.value = String(selectedUnit.capacity);
    }

    if (!details) {
        estimateTotal.textContent = '—';
        estimateHint.textContent = 'Choose your dates to see your stay total.';
        return;
    }

    const discountMessage = details.discount
        ? ` · ${Math.round(details.discount * 100)}% long-stay saving applied`
        : ' · Stay 7+ nights to save 10%, or 28+ nights to save 20%';
    estimateTotal.textContent = `KES ${details.total.toLocaleString('en-KE')}`;
    estimateHint.textContent = `${details.nights} ${details.nights === 1 ? 'night' : 'nights'}${discountMessage}`;
}

unitType.addEventListener('change', updateEstimate);
guestCount.addEventListener('change', updateEstimate);
checkin.addEventListener('change', () => {
    if (checkin.value) {
        const earliestCheckout = new Date(`${checkin.value}T00:00:00Z`);
        earliestCheckout.setUTCDate(earliestCheckout.getUTCDate() + 1);
        checkout.min = earliestCheckout.toISOString().slice(0, 10);
    } else {
        checkout.min = localToday;
    }

    if (checkout.value && checkout.value <= checkin.value) {
        checkout.value = '';
    }

    updateEstimate();
});
checkout.addEventListener('change', updateEstimate);

document.querySelectorAll('[data-unit]').forEach((link) => {
    link.addEventListener('click', () => {
        unitType.value = link.dataset.unit;
        updateEstimate();
    });
});

bookingForm.addEventListener('submit', (event) => {
    event.preventDefault();
    bookingNote.textContent = '';

    const details = getStayDetails();
    if (!bookingForm.reportValidity() || !details) {
        bookingNote.textContent = 'Please choose a valid check-in and check-out date to continue.';
        return;
    }

    if (Number(guestCount.value) > details.unit.capacity) {
        bookingNote.textContent = `The ${details.unit.name} accommodates up to ${details.unit.capacity} guests.`;
        return;
    }

    const discountLine = details.discount
        ? `Long-stay discount: ${Math.round(details.discount * 100)}%`
        : 'Long-stay discount: Not applicable';
    const message = [
        'Hello The Acacia Suites, I would like to enquire about a stay.',
        `Apartment: ${details.unit.name}`,
        `Check-in: ${checkin.value}`,
        `Check-out: ${checkout.value}`,
        `Total nights: ${details.nights}`,
        `Guests: ${guestCount.value}`,
        `${discountLine}`,
        `Estimated total: KES ${details.total.toLocaleString('en-KE')}`
    ].join('\n');
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    const whatsappLink = document.createElement('a');

    whatsappLink.href = whatsappUrl;
    whatsappLink.target = '_blank';
    whatsappLink.rel = 'noopener noreferrer';
    whatsappLink.textContent = 'Open WhatsApp';
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    bookingNote.textContent = 'Your stay request is ready in WhatsApp—tap send to contact us. ';
    bookingNote.append(whatsappLink);
});

updateEstimate();
