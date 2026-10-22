'use strict';
const PRODUCTS = [
  { id: 'tray', name: 'Large Tray', price: 2000, flavorExtra: 200, split: true },
  { id: 'tin', name: 'Tiramisu Tin', price: 1300, flavorExtra: 200, split: true },
  { id: 'pot', name: 'Single-Serving Pot', price: 350, flavorExtra: 50, split: false },
  { id: 'mug', name: 'Tiramisu Mug', price: 1400, flavorExtra: 0, split: false },
  { id: 'cake', name: 'Tiramisu Cake', price: 2000, flavorExtra: 200, split: true }
];
const FLAVORS = ['Classic', 'Strawberry', 'Biscoff', 'Pistachio', 'Kinder', 'Lemon', 'Mango', 'Chocolate'];
const WA = 'https://wa.me/96170195955';
const STORAGE = 'sweet-clouds-order-v1';
const $ = selector => document.querySelector(selector);
const money = cents => '$' + (cents / 100).toFixed(2);
const productFor = id => PRODUCTS.find(product => product.id === id);
const selectedFlavors = item => [...new Set([item.flavor, ...(productFor(item.product).split ? [item.secondFlavor] : [])].filter(flavor => FLAVORS.includes(flavor)))];
const flavorLabel = item => selectedFlavors(item).join(' / ');
const unitPrice = item => {
  const product = productFor(item.product), flavors = selectedFlavors(item);
  const extraPerFlavor = product.split && flavors.length === 2 ? product.flavorExtra / 2 : product.flavorExtra;
  return product.price + flavors.filter(flavor => flavor !== 'Classic').length * extraPerFlavor;
};
const subtotal = items => items.reduce((sum, item) => sum + unitPrice(item) * item.quantity, 0);
const validQuantity = value => Number.isInteger(Number(value)) && Number(value) >= 1 && Number(value) <= 999;
function sanitizeOrder(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(item => item && productFor(item.product) && FLAVORS.includes(item.flavor) && validQuantity(item.quantity)).slice(0, 100).map(item => ({ product: item.product, flavor: item.flavor, quantity: Number(item.quantity), secondFlavor: productFor(item.product).split && FLAVORS.includes(item.secondFlavor) && item.secondFlavor !== item.flavor ? item.secondFlavor : '', note: typeof item.note === 'string' ? item.note.slice(0, 500) : '' }));
}
function buildMessage(items) {
  if (!items.length) return '';
  const lines = items.map((item, index) => {
    const product = productFor(item.product);
    return `${index + 1}. ${product.name}\nFlavor: ${flavorLabel(item)}${item.secondFlavor ? " (half & half)" : ""}\nQuantity: ${item.quantity}\nUnit price: ${money(unitPrice(item))}\nLine total: ${money(unitPrice(item) * item.quantity)}${item.note ? '\nSpecial request: ' + item.note : ''}`;
  });
  return `Hello Sweet Clouds! I’d like to order:\n\n${lines.join('\n\n')}\n\nEstimated product subtotal: ${money(subtotal(items))} USD\nExcludes delivery and unconfirmed customization charges.\n\nCustomer name: \nRequested date: \nPickup/delivery preference: \nExtra notes: \n\nPlease confirm availability and the final total. Thank you!`;
}
let order = [];
try { order = sanitizeOrder(JSON.parse(localStorage.getItem(STORAGE) || '[]')); } catch { /* Ordering remains available without storage. */ }
let preferredFlavor = '', activeProduct = null, editIndex = -1, returnToCart = false, toastTimer;
document.documentElement.classList.add('js');
$('#year').textContent = new Date().getFullYear();
const customizer = $('#customizer'), cart = $('#cart');
function notify(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 3000);
}
function save() {
  try { localStorage.setItem(STORAGE, JSON.stringify(order)); } catch { /* Private mode or storage full. */ }
  document.querySelectorAll('[data-count]').forEach(el => el.textContent = order.reduce((sum, item) => sum + item.quantity, 0));
  renderCart();
}
function showDialog(dialog) { dialog.showModal(); document.body.classList.add('modal-open'); }
function closeDialog(dialog) { dialog.close(); }
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const controls = [...dialog.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]')].filter(el => el.getClientRects().length);
    const first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  });
  dialog.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => closeDialog(dialog)));
  dialog.addEventListener('click', event => { if (event.target === dialog) { const box = dialog.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) closeDialog(dialog); } });
  dialog.addEventListener('close', () => {
    if (dialog === customizer && returnToCart) { returnToCart = false; if (!cart.open) showDialog(cart); }
    document.body.classList.toggle('modal-open', Boolean(document.querySelector('dialog[open]')));
  });
});
function configure(id, index = -1) {
  activeProduct = productFor(id); editIndex = index;
  const existing = index >= 0 ? order[index] : null;
  $('#custom-title').textContent = activeProduct.name;
  $('#custom-form').reset();
  $('#flavor').replaceChildren(new Option('Choose a flavor', ''), ...FLAVORS.map(flavor => new Option(flavor + (flavor !== 'Classic' && activeProduct.flavorExtra ? ` (+${money(activeProduct.flavorExtra)})` : ''), flavor)));
  $('#flavor').value = existing?.flavor || preferredFlavor;
  $('#quantity').value = existing?.quantity || 1;
  $('#second-flavor-label').hidden = !activeProduct.split;
  $('#second-flavor').disabled = !activeProduct.split;
  $('#second-flavor').replaceChildren(new Option('One flavor (no split)', ''), ...FLAVORS.map(flavor => new Option(flavor + (flavor !== 'Classic' ? ' (+' + money(activeProduct.flavorExtra / 2) + ' per half)' : ''), flavor)));
  $('#second-flavor').value = existing?.secondFlavor || '';
  $('#flavor-pricing').textContent = activeProduct.split ? 'Classic is included. One non-classic flavor: +$2.00. Half & half: +$1.00 per non-classic half. Classic + another flavor: +$1.00 total; two non-classic flavors: +$2.00 total.' : activeProduct.flavorExtra ? 'Classic is included. A non-classic flavor adds $0.50 per item.' : 'Flavor availability is confirmed on WhatsApp.';
  $('#note').value = existing?.note || '';
  $('#add-label').textContent = existing ? 'Save changes' : 'Add to order';
  updatePrice();
  showDialog(customizer);
}
function updatePrice() {
  if ($('#second-flavor').value === $('#flavor').value) $('#second-flavor').value = '';
  [...$('#second-flavor').options].forEach(option => option.disabled = Boolean(option.value && option.value === $('#flavor').value));
  const isSplit = activeProduct.split && Boolean($('#second-flavor').value);
  [...$('#flavor').options].forEach(option => {
    if (!option.value) return;
    option.textContent = option.value + (option.value !== 'Classic' && activeProduct.flavorExtra ? ' (+' + money(isSplit ? activeProduct.flavorExtra / 2 : activeProduct.flavorExtra) + (isSplit ? ' per half)' : ')') : '');
  });
  const qty = Number($('#quantity').value);
  $('#custom-price').textContent = validQuantity(qty) ? money(unitPrice({ product: activeProduct.id, flavor: $('#flavor').value, secondFlavor: $('#second-flavor').value }) * qty) : 'Set quantity';
}
$('#quantity').addEventListener('input', updatePrice);
$('#flavor').addEventListener('change', updatePrice);
$('#second-flavor').addEventListener('change', updatePrice);
document.querySelectorAll('[data-customize]').forEach(button => button.addEventListener('click', () => configure(button.dataset.customize)));
$('#custom-form').addEventListener('submit', event => {
  event.preventDefault();
  if (!validQuantity($('#quantity').value) || !FLAVORS.includes($('#flavor').value)) return;
  const item = { product: activeProduct.id, flavor: $('#flavor').value, quantity: Number($('#quantity').value), secondFlavor: activeProduct.split && $('#second-flavor').value !== $('#flavor').value ? $('#second-flavor').value : '', note: $('#note').value.trim().slice(0, 500) };
  if (editIndex >= 0) order[editIndex] = item; else order.push(item);
  save(); closeDialog(customizer);
  notify(editIndex >= 0 ? 'Your sweet order is updated.' : `${activeProduct.name} added to your order.`);
});
function element(tag, text, className) { const el = document.createElement(tag); el.textContent = text; if (className) el.className = className; return el; }
function renderCart() {
  const container = $('#cart-items'); container.replaceChildren();
  if (!order.length) {
    const empty = element('div', '', 'empty');
    empty.append(element('h3', 'A little sweetness belongs here.'), element('p', 'Choose a dessert from the menu to start your order.'));
    container.append(empty);
  }
  order.forEach((item, index) => {
    const product = productFor(item.product), row = element('article', '', 'cart-item');
    row.append(element('h3', product.name), element('p', `${flavorLabel(item)}${item.secondFlavor ? " (half & half)" : ""} · ${money(unitPrice(item))} each`));
    if (item.note) row.append(element('p', 'Request: ' + item.note));
    const bottom = element('div', '', 'cart-item-bottom'), quantity = document.createElement('input');
    quantity.type = 'number'; quantity.min = '1'; quantity.max = '999'; quantity.step = '1'; quantity.value = item.quantity;
    quantity.setAttribute('aria-label', `Quantity for ${product.name}, ${flavorLabel(item)}`);
    quantity.addEventListener('change', () => { if (!validQuantity(quantity.value)) { quantity.value = item.quantity; notify('Please choose a whole quantity from 1 to 999.'); return; } item.quantity = Number(quantity.value); save(); const inputs = container.querySelectorAll('input'); inputs[index]?.focus(); });
    bottom.append(quantity, element('strong', money(unitPrice(item) * item.quantity)));
    const controls = element('div', '', 'cart-controls'), edit = element('button', 'Edit'), remove = element('button', 'Remove');
    edit.setAttribute('aria-label', `Edit ${product.name}, ${flavorLabel(item)}`); remove.setAttribute('aria-label', `Remove ${product.name}, ${flavorLabel(item)}`);
    edit.addEventListener('click', () => { cart.close(); returnToCart = true; configure(item.product, index); });
    remove.addEventListener('click', () => { order.splice(index, 1); save(); const next = container.querySelectorAll('.cart-controls button')[Math.min(index, order.length - 1) * 2]; (next || cart.querySelector('[data-close]')).focus(); notify('Item removed.'); });
    controls.append(edit, remove); row.append(bottom, controls); container.append(row);
  });
  $('#subtotal').textContent = money(subtotal(order));
  $('#send-order').disabled = order.length === 0;
}
document.querySelectorAll('[data-open-cart]').forEach(button => button.addEventListener('click', () => showDialog(cart)));
$('#send-order').addEventListener('click', () => { const message = buildMessage(order); if (message) window.open(WA + '?text=' + encodeURIComponent(message), '_blank', 'noopener,noreferrer'); });
document.querySelectorAll('[data-flavor]').forEach(button => button.addEventListener('click', () => {
  preferredFlavor = preferredFlavor === button.dataset.flavor ? '' : button.dataset.flavor;
  document.querySelectorAll('[data-flavor]').forEach(chip => chip.setAttribute('aria-pressed', String(chip.dataset.flavor === preferredFlavor)));
  $('#flavor-status').textContent = preferredFlavor ? `${preferredFlavor} selected. Choose a dessert from the menu to make it yours.` : 'Choose the flavor that fits your mood.';
}));
const toggle = $('.nav-toggle'), navigation = $('#navigation');
function closeNav() { navigation.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
toggle.addEventListener('click', () => { const open = navigation.classList.toggle('open'); toggle.setAttribute('aria-expanded', String(open)); });
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNav));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && navigation.classList.contains('open')) { closeNav(); toggle.focus(); } });
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { if (!document.documentElement.classList.contains('motion-paused') && !matchMedia('(prefers-reduced-motion: reduce)').matches) entry.target.animate([{ opacity: .4, transform: 'translateY(18px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 550, easing: 'ease-out' }); observer.unobserve(entry.target); } }), { threshold: .12 });
  document.querySelectorAll('.product,.steps article,.section-top').forEach(el => observer.observe(el));
}
save();
