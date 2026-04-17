/**
 * AURUM E-commerce — app.js
 * Produtos REAIS coletados do AliExpress em 17/04/2025.
 * Imagens geradas via IA baseadas na aparência real de cada produto.
 * Zero dependências externas para segurança máxima.
 */

'use strict';

const Store = (() => {

    // ============================
    // PRODUCT DATABASE — PRODUTOS REAIS DO ALIEXPRESS
    // costPrice = preço no fornecedor (NÃO exibido ao cliente)
    // ============================
    const PRODUCTS = [
        {
            id: 'qi2-charger-3in1',
            name: 'Qi2 Carregador Magnético 3-em-1 Cyberdock',
            category: 'Acessórios',
            price: 399.90,
            oldPrice: 549.90,
            image: 'assets/qi2-charger-3in1.png',
            tag: 'Mais Vendido',
            rating: 4.9,
            reviews: 33,
            description: 'Design Cybertruck. Carregamento 30W para iPhone, Apple Watch e AirPods.'
        },
        {
            id: 'magcubic-hy300-pro',
            name: 'MAGCUBIC Projetor HY300 PRO 8K',
            category: 'Projetores',
            price: 599.90,
            oldPrice: 799.90,
            image: 'assets/magcubic-hy300-pro.png',
            tag: 'Lançamento',
            rating: 4.7,
            reviews: 10000,
            description: 'Projetor portátil com Android 11, WiFi 6, tela de até 150 polegadas.'
        },
        {
            id: 'baseus-bowie-ma10',
            name: 'Baseus Bowie MA10 Pro ANC 48dB',
            category: 'Áudio',
            price: 349.90,
            oldPrice: 499.90,
            image: 'assets/baseus-bowie-ma10.png',
            tag: '-30%',
            rating: 4.7,
            reviews: 5000,
            description: 'Fone TWS com cancelamento de ruído ativo 48dB. 30h de bateria.'
        },
        {
            id: 'baseus-bass-ep10',
            name: 'Baseus Bass EP10 NC -43dB',
            category: 'Áudio',
            price: 229.90,
            oldPrice: 299.90,
            image: 'assets/baseus-bass-ep10.png',
            tag: 'Custo-Benefício',
            rating: 4.8,
            reviews: 5000,
            description: 'Cancelamento de ruído -43dB, driver 10mm, IPX4.'
        },
        {
            id: 'amazfit-bip5',
            name: 'Amazfit Bip 5 GPS + Alexa',
            category: 'Smartwatch',
            price: 699.90,
            oldPrice: 899.90,
            image: 'assets/amazfit-bip5.png',
            tag: 'Premium',
            rating: 5.0,
            reviews: 99,
            description: 'GPS integrado, Alexa, tela 1.91" HD, monitoramento 24h.'
        },
        {
            id: 'zeblaze-btalk3',
            name: 'Zeblaze Btalk 3 Plus',
            category: 'Smartwatch',
            price: 149.90,
            oldPrice: 229.90,
            image: 'assets/zeblaze-btalk3.png',
            tag: 'Top Vendas',
            rating: 4.8,
            reviews: 10000,
            description: 'Tela HD, 100+ modos esportivos, monitor cardíaco e SpO2.'
        },
        {
            id: 'tronsmart-t8',
            name: 'Tronsmart T8 Speaker 40W',
            category: 'Caixas de Som',
            price: 549.90,
            oldPrice: 699.90,
            image: 'assets/tronsmart-t8.png',
            tag: '-21%',
            rating: 4.9,
            reviews: 1000,
            description: 'Caixa portátil 40W, graves profundos, IPX7 à prova d\'água.'
        },
        {
            id: 'bonola-charger-25w',
            name: 'Bonola 25W Charging Station',
            category: 'Acessórios',
            price: 349.90,
            oldPrice: 449.90,
            image: 'assets/bonola-charger-25w.png',
            tag: '-22%',
            rating: 5.0,
            reviews: 20,
            description: 'Estação de carregamento 25W para iPhone 17/16 Pro, Apple Watch e AirPods.'
        }
    ];

    // ============================
    // STATE
    // ============================
    let cart = [];

    // ============================
    // DOM REFS
    // ============================
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    // ============================
    // FORMATTERS
    // ============================
    const formatBRL = (value) =>
        value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    // ============================
    // SECURITY: sanitize text to prevent XSS
    // ============================
    const sanitize = (str) => {
        if (typeof str !== 'string') str = String(str);
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    };

    // ============================
    // RENDER PRODUCTS
    // ============================
    function renderProducts() {
        const grid = $('#products-grid');
        if (!grid) return;

        grid.innerHTML = PRODUCTS.map(product => `
            <article class="product-card" data-id="${sanitize(product.id)}">
                <div class="product-img">
                    <img src="${sanitize(product.image)}" 
                         alt="${sanitize(product.name)}" 
                         loading="lazy">
                    ${product.tag ? `<span class="product-tag">${sanitize(product.tag)}</span>` : ''}
                    <div class="product-actions">
                        <button onclick="Store.addToCart('${sanitize(product.id)}')" aria-label="Adicionar ${sanitize(product.name)} ao carrinho">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        </button>
                    </div>
                </div>
                <div class="product-info">
                    <p class="category">${sanitize(product.category)}</p>
                    <h4>${sanitize(product.name)}</h4>
                    <div class="product-price-row">
                        <span class="product-price">
                            ${formatBRL(product.price)}
                            ${product.oldPrice ? `<span class="old-price">${formatBRL(product.oldPrice)}</span>` : ''}
                        </span>
                        <span class="product-rating">
                            ★ ${product.rating} <span style="color: var(--text-tertiary); margin-left: 4px;">(${product.reviews > 999 ? Math.floor(product.reviews/1000) + 'k+' : product.reviews})</span>
                        </span>
                    </div>
                </div>
            </article>
        `).join('');
    }

    // ============================
    // CART LOGIC
    // ============================
    function addToCart(productId) {
        const product = PRODUCTS.find(p => p.id === productId);
        if (!product) return;

        const existing = cart.find(item => item.id === productId);
        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({ ...product, qty: 1 });
        }

        updateCartUI();
        toast(`${product.name} adicionado ao carrinho!`);
        openCart();
    }

    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        updateCartUI();
    }

    function getCartTotal() {
        return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    }

    function updateCartUI() {
        const badge = $('#cart-badge');
        const itemsContainer = $('#cart-items');
        const emptyMsg = $('#cart-empty');
        const footer = $('#cart-footer');
        const totalEl = $('#cart-total-value');

        const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

        badge.textContent = totalItems;
        badge.classList.toggle('show', totalItems > 0);

        if (cart.length === 0) {
            emptyMsg.style.display = 'block';
            footer.style.display = 'none';
            const cartItemElements = itemsContainer.querySelectorAll('.cart-item');
            cartItemElements.forEach(el => el.remove());
            return;
        }

        emptyMsg.style.display = 'none';
        footer.style.display = 'block';
        totalEl.textContent = formatBRL(getCartTotal());

        const cartItemElements = itemsContainer.querySelectorAll('.cart-item');
        cartItemElements.forEach(el => el.remove());

        cart.forEach(item => {
            const el = document.createElement('div');
            el.className = 'cart-item';
            el.innerHTML = `
                <div class="cart-item-img">
                    <img src="${sanitize(item.image)}" alt="${sanitize(item.name)}">
                </div>
                <div class="cart-item-details">
                    <h4>${sanitize(item.name)}</h4>
                    <span class="cart-item-price">${item.qty}× ${formatBRL(item.price)}</span>
                </div>
                <button class="cart-item-remove" onclick="Store.removeFromCart('${sanitize(item.id)}')" aria-label="Remover ${sanitize(item.name)}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            `;
            itemsContainer.appendChild(el);
        });
    }

    // ============================
    // CART SIDEBAR TOGGLE
    // ============================
    function openCart() {
        $('#cart-sidebar').classList.add('open');
        $('#cart-overlay').classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeCart() {
        $('#cart-sidebar').classList.remove('open');
        $('#cart-overlay').classList.remove('open');
        document.body.style.overflow = '';
    }

    // ============================
    // TOAST NOTIFICATIONS
    // ============================
    function toast(message) {
        const container = $('#toast-container');
        const el = document.createElement('div');
        el.className = 'toast';
        el.innerHTML = `
            <span class="toast-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
            </span>
            <span>${sanitize(message)}</span>
        `;
        container.appendChild(el);
        setTimeout(() => el.remove(), 3200);
    }

    // ============================
    // HEADER SCROLL EFFECT
    // ============================
    function initScrollHeader() {
        const header = $('#header');
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 40);
        }, { passive: true });
    }

    // ============================
    // EVENT LISTENERS
    // ============================
    function initEvents() {
        $('#cart-open').addEventListener('click', openCart);
        $('#cart-close').addEventListener('click', closeCart);
        $('#cart-overlay').addEventListener('click', closeCart);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeCart();
        });
    }

    // ============================
    // INIT
    // ============================
    function init() {
        renderProducts();
        initEvents();
        initScrollHeader();
    }

    document.addEventListener('DOMContentLoaded', init);

    return { addToCart, removeFromCart, toast };

})();
