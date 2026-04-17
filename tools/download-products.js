/**
 * 🛒 AURUM — Image Downloader + Catalog Generator
 * 
 * Este script pega as URLs de imagem dos produtos do AliExpress,
 * baixa todas as imagens na pasta assets/, e gera/atualiza o catálogo app.js.
 * 
 * COMO USAR:
 *   node tools/download-products.js
 * 
 * Ele vai ler o arquivo products-raw.json (dados copiados do scraper)
 * e baixar tudo automaticamente.
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// ========================================
// CONFIGURAÇÃO - EDITE SEUS PRODUTOS AQUI
// ========================================

// Se você tem o JSON do scraper, coloque em products-raw.json
// OU edite esta lista manualmente com os produtos que você quer vender

const MANUAL_PRODUCTS = [
    {
        id: 'qi2-charger-3in1',
        name: 'Carregador Magnético 3-em-1 Qi2 30W',
        category: 'Acessórios',
        costPrice: 128.75,      // Preço no AliExpress
        sellPrice: 299.90,      // Seu preço de venda
        oldPrice: 399.90,       // Preço "original" riscado
        tag: 'Mais Vendido',
        rating: 4.9,
        reviews: 33,
        imageUrl: 'https://ae01.alicdn.com/kf/S0a3f9c1c5d534906b2c5dce61ef2ad3fO.jpg',
        supplierUrl: 'https://pt.aliexpress.com/item/1005010579915378.html',
        description: 'Carregamento rápido para iPhone, Apple Watch e AirPods. Design moderno dobrável.'
    },
    {
        id: 'bonola-charger-25w',
        name: 'Bonola 25W Carregador Magnético 3-em-1',
        category: 'Acessórios',
        costPrice: 146.99,
        sellPrice: 349.90,
        oldPrice: 449.90,
        tag: '-22%',
        rating: 5.0,
        reviews: 20,
        imageUrl: 'https://ae01.alicdn.com/kf/S1234567890.jpg',
        supplierUrl: 'https://pt.aliexpress.com/item/1005011838971001.html',
        description: 'Estação de carregamento 25W para iPhone 17/16 Pro Max, Apple Watch e AirPods.'
    },
    {
        id: 'magcubic-hy300-pro',
        name: 'MAGCUBIC Projetor HY300 PRO 8K',
        category: 'Projetores',
        costPrice: 259.99,
        sellPrice: 599.90,
        oldPrice: 799.90,
        tag: 'Lançamento',
        rating: 4.7,
        reviews: 10000,
        imageUrl: '',
        supplierUrl: '',
        description: 'Projetor portátil com Android 11, WiFi 6, tela de até 150 polegadas.'
    },
    {
        id: 'baseus-bowie-ma10',
        name: 'Baseus Bowie MA10 Pro ANC 48dB',
        category: 'Áudio',
        costPrice: 152.73,
        sellPrice: 349.90,
        oldPrice: 499.90,
        tag: '-30%',
        rating: 4.7,
        reviews: 5000,
        imageUrl: '',
        supplierUrl: '',
        description: 'Fone TWS com cancelamento de ruído ativo de 48dB. 30h de bateria.'
    },
    {
        id: 'baseus-bass-ep10',
        name: 'Baseus Bass EP10 NC -43dB',
        category: 'Áudio',
        costPrice: 92.26,
        sellPrice: 229.90,
        oldPrice: 299.90,
        tag: 'Custo-Benefício',
        rating: 4.8,
        reviews: 5000,
        imageUrl: '',
        supplierUrl: '',
        description: 'Cancelamento de ruído -43dB, driver 10mm, IPX4 à prova de respingos.'
    },
    {
        id: 'amazfit-bip5',
        name: 'Amazfit Bip 5 GPS + Alexa',
        category: 'Smartwatch',
        costPrice: 366.90,
        sellPrice: 699.90,
        oldPrice: 899.90,
        tag: 'Premium',
        rating: 5.0,
        reviews: 99,
        imageUrl: '',
        supplierUrl: '',
        description: 'GPS integrado, Alexa, tela 1.91" HD, monitoramento de saúde 24h.'
    },
    {
        id: 'zeblaze-btalk3',
        name: 'Zeblaze Btalk 3 Plus',
        category: 'Smartwatch',
        costPrice: 65.67,
        sellPrice: 149.90,
        oldPrice: 229.90,
        tag: 'Top Vendas',
        rating: 4.8,
        reviews: 10000,
        imageUrl: '',
        supplierUrl: '',
        description: 'Tela HD, 100+ modos esportivos, monitor cardíaco e SpO2.'
    },
    {
        id: 'tronsmart-t8',
        name: 'Tronsmart T8 Speaker 40W',
        category: 'Caixas de Som',
        costPrice: 290.07,
        sellPrice: 549.90,
        oldPrice: 699.90,
        tag: '-21%',
        rating: 4.9,
        reviews: 1000,
        imageUrl: '',
        supplierUrl: '',
        description: 'Caixa de som portátil 40W, graves profundos, IPX7 à prova d\'água.'
    }
];

// ========================================
// DOWNLOADER
// ========================================
const ASSETS_DIR = path.join(__dirname, '..', 'assets');

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function downloadImage(url, filename) {
    return new Promise((resolve, reject) => {
        if (!url || !url.startsWith('http')) {
            console.log(`   ⏭️  Sem URL para ${filename}, pulando...`);
            resolve(null);
            return;
        }

        const filePath = path.join(ASSETS_DIR, filename);
        
        // Se já existe, pular
        if (fs.existsSync(filePath)) {
            console.log(`   ✅ ${filename} já existe, pulando.`);
            resolve(filePath);
            return;
        }

        const protocol = url.startsWith('https') ? https : http;
        
        console.log(`   ⬇️  Baixando ${filename}...`);
        
        const request = protocol.get(url, { 
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://www.aliexpress.com/',
                'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8'
            },
            timeout: 15000
        }, (response) => {
            // Handle redirects
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                downloadImage(response.headers.location, filename).then(resolve).catch(reject);
                return;
            }

            if (response.statusCode !== 200) {
                console.log(`   ❌ Erro HTTP ${response.statusCode} para ${filename}`);
                resolve(null);
                return;
            }

            const file = fs.createWriteStream(filePath);
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                const size = fs.statSync(filePath).size;
                console.log(`   ✅ ${filename} — ${(size / 1024).toFixed(1)}KB`);
                resolve(filePath);
            });
        });

        request.on('error', (err) => {
            console.log(`   ❌ Falha ao baixar ${filename}: ${err.message}`);
            resolve(null);
        });

        request.on('timeout', () => {
            request.destroy();
            console.log(`   ❌ Timeout ao baixar ${filename}`);
            resolve(null);
        });
    });
}

// ========================================
// GERADOR DE CATÁLOGO (app.js)
// ========================================
function generateCatalog(products) {
    const productEntries = products.map(p => {
        const imgFile = `assets/${p.id}.png`;
        // Check if a jpg version exists instead
        const jpgFile = `assets/${p.id}.jpg`;
        const actualImg = fs.existsSync(path.join(__dirname, '..', jpgFile)) ? jpgFile : imgFile;
        
        return `        {
            id: '${p.id}',
            name: '${p.name.replace(/'/g, "\\'")}',
            category: '${p.category}',
            price: ${p.sellPrice.toFixed(2)},
            oldPrice: ${p.oldPrice ? p.oldPrice.toFixed(2) : 'null'},
            image: '${actualImg}',
            tag: '${p.tag || ''}',
            rating: ${p.rating},
            reviews: ${p.reviews},
            description: '${(p.description || '').replace(/'/g, "\\'")}'
        }`;
    }).join(',\n');

    return `/**
 * AURUM E-commerce — app.js
 * Catálogo gerado automaticamente pelo scraper em ${new Date().toLocaleDateString('pt-BR')}.
 * Produtos REAIS do AliExpress com preços de markup aplicados.
 * Zero dependências externas para segurança máxima.
 */

'use strict';

const Store = (() => {

    // ============================
    // PRODUCT DATABASE — PRODUTOS REAIS
    // Gerado automaticamente via tools/download-products.js
    // ============================
    const PRODUCTS = [
${productEntries}
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

        grid.innerHTML = PRODUCTS.map(product => \`
            <article class="product-card" data-id="\${sanitize(product.id)}">
                <div class="product-img">
                    <img src="\${sanitize(product.image)}" 
                         alt="\${sanitize(product.name)}" 
                         loading="lazy"
                         onerror="this.style.display='none'; this.parentElement.innerHTML += '<div style=\\\\'display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:#636366;font-size:0.85rem;text-align:center;padding:20px\\\\'>📷 Imagem pendente</div>'"
                    >
                    \${product.tag ? \`<span class="product-tag">\${sanitize(product.tag)}</span>\` : ''}
                    <div class="product-actions">
                        <button onclick="Store.addToCart('\${sanitize(product.id)}')" aria-label="Adicionar \${sanitize(product.name)} ao carrinho">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        </button>
                    </div>
                </div>
                <div class="product-info">
                    <p class="category">\${sanitize(product.category)}</p>
                    <h4>\${sanitize(product.name)}</h4>
                    <div class="product-price-row">
                        <span class="product-price">
                            \${formatBRL(product.price)}
                            \${product.oldPrice ? \`<span class="old-price">\${formatBRL(product.oldPrice)}</span>\` : ''}
                        </span>
                        <span class="product-rating">
                            ★ \${product.rating} <span style="color: var(--text-tertiary); margin-left: 4px;">(\${product.reviews > 999 ? Math.floor(product.reviews/1000) + 'k+' : product.reviews})</span>
                        </span>
                    </div>
                </div>
            </article>
        \`).join('');
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
        toast(\`\${product.name} adicionado ao carrinho!\`);
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
            el.innerHTML = \`
                <div class="cart-item-img">
                    <img src="\${sanitize(item.image)}" alt="\${sanitize(item.name)}">
                </div>
                <div class="cart-item-details">
                    <h4>\${sanitize(item.name)}</h4>
                    <span class="cart-item-price">\${item.qty}× \${formatBRL(item.price)}</span>
                </div>
                <button class="cart-item-remove" onclick="Store.removeFromCart('\${sanitize(item.id)}')" aria-label="Remover \${sanitize(item.name)}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            \`;
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
        el.innerHTML = \`
            <span class="toast-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
            </span>
            <span>\${sanitize(message)}</span>
        \`;
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
`;
}

// ========================================
// MAIN
// ========================================
async function main() {
    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('  🛒 AURUM — Product Downloader & Builder');
    console.log('═══════════════════════════════════════════');
    console.log('');

    ensureDir(ASSETS_DIR);

    // Tentar ler products-raw.json (se existir)
    let products = MANUAL_PRODUCTS;
    const rawPath = path.join(__dirname, 'products-raw.json');
    
    if (fs.existsSync(rawPath)) {
        try {
            const raw = JSON.parse(fs.readFileSync(rawPath, 'utf-8'));
            if (raw.products && raw.products.length > 0) {
                console.log(`📄 Encontrado products-raw.json com ${raw.products.length} produtos`);
                // Mesclar com produtos manuais atualizando imageUrl
                raw.products.forEach(rp => {
                    const existing = products.find(p => 
                        p.name.toLowerCase().includes(rp.name?.toLowerCase()?.substring(0, 15) || 'xxxxx')
                    );
                    if (existing && rp.imageUrl) {
                        existing.imageUrl = rp.imageUrl;
                        console.log(`   🔗 URL de imagem atualizada para: ${existing.name}`);
                    }
                });
            }
        } catch(e) {
            console.log(`⚠️  Erro ao ler products-raw.json: ${e.message}`);
        }
    } else {
        console.log('📝 products-raw.json não encontrado, usando lista manual.');
        console.log('   Dica: Use o scraper-console.js no AliExpress para gerar o JSON!');
    }

    console.log('');
    console.log(`📦 Processando ${products.length} produtos...`);
    console.log('');

    // Baixar imagens
    for (const product of products) {
        if (product.imageUrl && product.imageUrl.startsWith('http')) {
            const ext = product.imageUrl.includes('.png') ? 'png' : 'jpg';
            const filename = `${product.id}.${ext}`;
            await downloadImage(product.imageUrl, filename);
        } else {
            console.log(`   ⏭️  ${product.name} — sem URL de imagem`);
        }
    }

    console.log('');
    console.log('📝 Gerando catálogo app.js...');

    // Gerar app.js
    const catalog = generateCatalog(products);
    const appPath = path.join(__dirname, '..', 'app.js');
    fs.writeFileSync(appPath, catalog, 'utf-8');
    console.log(`   ✅ app.js atualizado!`);

    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('  ✅ CONCLUÍDO!');
    console.log('═══════════════════════════════════════════');
    console.log('');
    console.log('Próximos passos:');
    console.log('  1. Verifique as imagens em assets/');
    console.log('  2. Para produtos sem imagem, salve manualmente do AliExpress');
    console.log('  3. OU use o gerador de imagens IA baseado no produto real');
    console.log('  4. Teste com: abra index.html no navegador');
    console.log('');
}

main().catch(console.error);
