const menuToggle = document.querySelector('.menu-toggle');
const primaryNav = document.querySelector('#primary-nav');
const currencyButtons = Array.from(document.querySelectorAll('[data-currency]'));
const currencies = {
    KES: { rate: 1, prefix: 'KES ' },
    USD: { rate: 130, prefix: '$' },
    EUR: { rate: 140, prefix: '€' }
};
const currencyStorageKey = 'acacia-suites-currency';
let selectedCurrency = 'KES';

try {
    const savedCurrency = localStorage.getItem(currencyStorageKey);
    if (savedCurrency && currencies[savedCurrency]) selectedCurrency = savedCurrency;
} catch {
    // The switcher still works when browser storage is unavailable.
}

function formatMoney(kesAmount) {
    const currency = currencies[selectedCurrency];
    const convertedAmount = Math.round(kesAmount / currency.rate);
    return `${currency.prefix}${convertedAmount.toLocaleString('en-US')}`;
}

function formatMessageMoney(kesAmount) {
    const amount = formatMoney(kesAmount);
    return selectedCurrency === 'KES' ? amount : `${amount} ${selectedCurrency}`;
}

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

const radarModes = Array.from(document.querySelectorAll('.radar-mode'));
const radarTimeValues = Array.from(document.querySelectorAll('.radar-time-value'));
let radarUpdateTimer;

radarModes.forEach((button) => {
    button.addEventListener('click', () => {
        const mode = button.dataset.timeMode;
        radarModes.forEach((modeButton) => {
            const isActive = modeButton === button;
            modeButton.classList.toggle('is-active', isActive);
            modeButton.setAttribute('aria-pressed', String(isActive));
        });

        radarTimeValues.forEach((timeValue) => timeValue.classList.add('is-changing'));
        window.clearTimeout(radarUpdateTimer);
        radarUpdateTimer = window.setTimeout(() => {
            radarTimeValues.forEach((timeValue) => {
                timeValue.textContent = timeValue.dataset[`${mode}Time`];
                timeValue.classList.remove('is-changing');
            });
        }, 160);
    });
});

const suitesSection = document.querySelector('.suites-section');
const suiteMoodButtons = Array.from(document.querySelectorAll('[data-suite-mood]'));
const suiteMoodBadges = Array.from(document.querySelectorAll('.suite-mood-badge'));
const suitePhotos = Array.from(document.querySelectorAll('.suite-photo'));

suiteMoodButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const isEvening = button.dataset.suiteMood === 'evening';
        suitesSection.classList.toggle('is-evening', isEvening);
        suiteMoodButtons.forEach((moodButton) => {
            const isActive = moodButton === button;
            moodButton.classList.toggle('is-active', isActive);
            moodButton.setAttribute('aria-pressed', String(isActive));
        });
        suiteMoodBadges.forEach((badge) => {
            badge.textContent = isEvening
                ? 'Warm Evening Ambiance & Blackout Comfort'
                : 'Natural Nairobi Sunlight';
        });
        suitePhotos.forEach((photo) => {
            const suiteName = photo.getAttribute('aria-label').replace(/^(Bright daylight in |Warm evening ambiance in )/, '');
            photo.setAttribute('aria-label', `${isEvening ? 'Warm evening ambiance in ' : 'Bright daylight in '}${suiteName}`);
        });
    });
});

const infrastructureStatusTrigger = document.querySelector('.infrastructure-status-trigger');
const infrastructureStatusDetails = document.querySelector('#infrastructure-details');

infrastructureStatusTrigger.addEventListener('click', () => {
    const isExpanded = infrastructureStatusTrigger.getAttribute('aria-expanded') === 'true';
    infrastructureStatusTrigger.setAttribute('aria-expanded', String(!isExpanded));
    infrastructureStatusDetails.hidden = isExpanded;
});

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
const addonCheckboxes = Array.from(document.querySelectorAll('[data-addon]'));
const quoteSubtotal = document.querySelector('#quote-subtotal');
const quoteDiscount = document.querySelector('#quote-discount');
const quoteAddonLines = document.querySelector('#quote-addon-lines');
const quoteAddonsTotal = document.querySelector('#quote-addons-total');
const whatsappNumber = '254727622603';
const units = Object.fromEntries(Array.from(unitType.options, (option) => [
    option.value,
    {
        name: option.dataset.unitName,
        rate: Number(option.dataset.kes),
        capacity: Number(option.dataset.capacity)
    }
]));

function updateCurrencyDisplays() {
    currencyButtons.forEach((button) => {
        button.setAttribute('aria-pressed', String(button.dataset.currency === selectedCurrency));
    });

    document.querySelectorAll('.suite-price[data-kes]').forEach((price) => {
        price.querySelector('.price-amount').textContent = formatMoney(Number(price.dataset.kes));
    });

    document.querySelectorAll('.addon-price[data-kes]').forEach((price) => {
        const amount = formatMoney(Number(price.dataset.kes));
        price.textContent = price.textContent.includes('/ week') ? `${amount} / week` : amount;
    });

    Array.from(unitType.options).forEach((option) => {
        option.textContent = `${option.dataset.unitName} — ${formatMoney(Number(option.dataset.kes))} / night`;
    });

    updateEstimate();
}

currencyButtons.forEach((button) => {
    button.addEventListener('click', () => {
        selectedCurrency = button.dataset.currency;
        try {
            localStorage.setItem(currencyStorageKey, selectedCurrency);
        } catch {
            // Currency conversion remains available for this page view.
        }
        updateCurrencyDisplays();
    });
});

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
    const baseTotal = unit.rate * nights;
    const discountAmount = Math.round(baseTotal * discount);
    const addons = getSelectedAddons(nights);
    const addonsTotal = addons.reduce((total, addon) => total + addon.total, 0);
    const total = baseTotal - discountAmount + addonsTotal;

    return { unit, nights, discount, baseTotal, discountAmount, addons, addonsTotal, total };
}

function getSelectedAddons(nights) {
    return addonCheckboxes.filter((checkbox) => checkbox.checked).map((checkbox) => {
        const isWeekly = checkbox.dataset.billing === 'weekly';
        const quantity = isWeekly ? (nights > 0 ? Math.ceil(nights / 7) : null) : 1;

        return {
            name: checkbox.dataset.addonName,
            rate: Number(checkbox.dataset.kes),
            quantity,
            isWeekly,
            total: quantity === null ? null : Number(checkbox.dataset.kes) * quantity
        };
    });
}

function renderQuote(details) {
    quoteSubtotal.textContent = details ? formatMoney(details.baseTotal) : '—';
    quoteDiscount.textContent = details ? `−${formatMoney(details.discountAmount)}` : '—';
    quoteAddonLines.replaceChildren();

    const addons = details ? details.addons : getSelectedAddons(0);
    addons.forEach((addon) => {
        const line = document.createElement('div');
        const name = document.createElement('span');
        const amount = document.createElement('strong');
        const quantityLabel = addon.isWeekly
            ? addon.quantity === null ? ' (per week)' : ` (${addon.quantity} ${addon.quantity === 1 ? 'week' : 'weeks'})`
            : ' (one-time)';

        line.className = 'quote-addon-line';
        name.textContent = `${addon.name}${quantityLabel}`;
        amount.textContent = addon.total === null
            ? `${formatMoney(addon.rate)} / week`
            : formatMoney(addon.total);
        line.append(name, amount);
        quoteAddonLines.append(line);
    });

    if (!addons.length) {
        const emptyLine = document.createElement('div');
        emptyLine.className = 'quote-addon-line';
        emptyLine.textContent = 'No optional add-ons selected';
        quoteAddonLines.append(emptyLine);
    }

    if (details) {
        quoteAddonsTotal.textContent = formatMoney(details.addonsTotal);
    } else {
        const fixedAddonsTotal = addons.reduce((total, addon) => total + (addon.isWeekly ? 0 : addon.rate), 0);
        const weeklyAddonSelected = addons.some((addon) => addon.isWeekly);
        quoteAddonsTotal.textContent = weeklyAddonSelected ? 'Select dates' : formatMoney(fixedAddonsTotal);
    }
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
        renderQuote(null);
        return;
    }

    const discountMessage = details.discount
        ? ` · ${Math.round(details.discount * 100)}% long-stay saving applied`
        : ' · Stay 7+ nights to save 10%, or 28+ nights to save 20%';
    estimateTotal.textContent = formatMoney(details.total);
    estimateHint.textContent = `${details.nights} ${details.nights === 1 ? 'night' : 'nights'} · ${formatMoney(details.unit.rate)} / night${discountMessage}`;
    renderQuote(details);
}

unitType.addEventListener('change', updateEstimate);
guestCount.addEventListener('change', updateEstimate);
addonCheckboxes.forEach((checkbox) => checkbox.addEventListener('change', updateEstimate));
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
        ? `Long-stay discount: ${Math.round(details.discount * 100)}% (${formatMessageMoney(details.discountAmount)} off)`
        : 'Long-stay discount: Not applicable';
    const includedPerks = Array.from(document.querySelectorAll('.perk-included .perk-name'), (perk) => perk.textContent.trim());
    const addonLines = details.addons.length
        ? details.addons.map((addon) => {
            const quantityLabel = addon.isWeekly ? ` (${addon.quantity} ${addon.quantity === 1 ? 'week' : 'weeks'})` : ' (one-time)';
            return `- ${addon.name}${quantityLabel}: ${formatMessageMoney(addon.total)}`;
        })
        : ['- None selected'];
    const message = [
        'Hello The Acacia Suites, I would like to enquire about a stay.',
        `Apartment: ${details.unit.name}`,
        `Check-in: ${checkin.value}`,
        `Check-out: ${checkout.value}`,
        `Total nights: ${details.nights}`,
        `Guests: ${guestCount.value}`,
        'Base stay: ' + formatMessageMoney(details.baseTotal),
        `${discountLine}`,
        `Selected add-ons:\n${addonLines.join('\n')}`,
        `Add-ons subtotal: ${formatMessageMoney(details.addonsTotal)}`,
        `Nightly rate: ${formatMessageMoney(details.unit.rate)}`,
        `Estimated total: ${formatMessageMoney(details.total)}`,
        `Included corporate essentials:\n${includedPerks.map((perk) => `- ${perk} (Included)`).join('\n')}`
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

updateCurrencyDisplays();
