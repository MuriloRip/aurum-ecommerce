/**
 * AURUM Shopify Theme — aurum.js
 * Interações e efeitos visuais para o tema.
 * O carrinho é gerenciado nativamente pelo Shopify.
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

    // ============================
    // HEADER SCROLL EFFECT
    // ============================
    const header = document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 40);
        }, { passive: true });
    }

    // ============================
    // MOBILE MENU TOGGLE
    // ============================
    const mobileBtn = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // ============================
    // TOAST NOTIFICATIONS
    // ============================
    window.aurumToast = function(message) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const el = document.createElement('div');
        el.className = 'toast';
        el.innerHTML = `
            <span class="toast-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
            </span>
            <span>${message}</span>
        `;
        container.appendChild(el);
        setTimeout(() => el.remove(), 3200);
    };

    // ============================
    // ADD TO CART AJAX (Shopify)
    // ============================
    document.querySelectorAll('.product-actions form').forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            
            try {
                const response = await fetch('/cart/add.js', {
                    method: 'POST',
                    body: formData
                });
                
                if (response.ok) {
                    const data = await response.json();
                    aurumToast(`${data.title} adicionado ao carrinho!`);
                    
                    // Atualizar badge do carrinho
                    const badge = document.getElementById('cart-badge');
                    if (badge) {
                        const cartResponse = await fetch('/cart.js');
                        const cartData = await cartResponse.json();
                        badge.textContent = cartData.item_count;
                        badge.classList.toggle('show', cartData.item_count > 0);
                    }
                }
            } catch (err) {
                console.error('Erro ao adicionar ao carrinho:', err);
            }
        });
    });
});
