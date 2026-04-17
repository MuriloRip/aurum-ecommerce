/**
 * 🛒 AURUM AliExpress Scraper — Cole no Console (F12) do AliExpress
 * 
 * COMO USAR:
 * 1. Vá para uma página de BUSCA do AliExpress (ex: busque "bluetooth speaker")
 * 2. Aperte F12 → aba "Console"  
 * 3. Cole TODO este código e aperte Enter
 * 4. Ele vai copiar um JSON com todos os produtos para seu clipboard
 * 5. Cole o resultado em um arquivo .json
 */

(async () => {
    console.log('🔍 AURUM Scraper — Extraindo produtos desta página...');

    // Scroll para carregar todos os produtos lazy-loaded
    const scrollToBottom = async () => {
        for (let i = 0; i < 5; i++) {
            window.scrollBy(0, 1500);
            await new Promise(r => setTimeout(r, 800));
        }
        window.scrollTo(0, 0);
    };

    await scrollToBottom();
    await new Promise(r => setTimeout(r, 1000));

    // Selectors para página de busca do AliExpress (2025)
    const cards = document.querySelectorAll('[class*="search-item-card"], [class*="SearchItem"], .search--gallery--V4xkl1L, div[data-pl]');
    
    // Fallback: pegar todos os cards de produto possíveis
    const productElements = cards.length > 0 
        ? cards 
        : document.querySelectorAll('a[href*="/item/"]');

    const products = [];

    productElements.forEach((card, index) => {
        try {
            // Extrair imagem
            const img = card.querySelector('img');
            let imageUrl = '';
            if (img) {
                imageUrl = img.src || img.getAttribute('data-src') || img.dataset.src || '';
                // Fazer a URL pegar a versão de alta resolução
                imageUrl = imageUrl.replace(/_\d+x\d+/, '_640x640').replace(/\?.*$/, '');
                if (!imageUrl.startsWith('http')) {
                    imageUrl = 'https:' + imageUrl;
                }
            }

            // Extrair nome
            const titleEl = card.querySelector('h3, h1, [class*="title"], [class*="Title"], [class*="name"]');
            const name = titleEl 
                ? titleEl.textContent.trim() 
                : (img ? img.alt || '' : '');

            // Extrair preço
            const priceTexts = card.querySelectorAll('[class*="price"], [class*="Price"]');
            let price = '';
            let oldPrice = '';
            priceTexts.forEach(p => {
                const text = p.textContent.trim();
                if (text.includes('R$') || text.match(/\d+[.,]\d{2}/)) {
                    if (!price) price = text;
                    else if (!oldPrice) oldPrice = text;
                }
            });

            // Extrair rating
            const ratingEl = card.querySelector('[class*="rating"], [class*="star"], [aria-label*="star"]');
            const rating = ratingEl ? ratingEl.textContent.trim() : '';

            // Extrair vendidos
            const soldEl = card.querySelector('[class*="sold"], [class*="Sold"]');
            const sold = soldEl ? soldEl.textContent.trim() : '';

            // Extrair link
            const linkEl = card.querySelector('a[href*="/item/"]') || card.closest('a[href*="/item/"]');
            const link = linkEl ? linkEl.href : '';

            if (name && name.length > 3) {
                products.push({
                    index: index + 1,
                    name: name.substring(0, 120),
                    price,
                    oldPrice,
                    rating,
                    sold,
                    imageUrl,
                    link,
                });
            }
        } catch (e) {
            console.warn(`Erro no card ${index}:`, e.message);
        }
    });

    if (products.length === 0) {
        console.log('⚠️ Nenhum produto encontrado. Tentando método alternativo...');
        
        // Método alternativo: pegar todas as imagens de produto
        const allImages = document.querySelectorAll('img[src*="ae01.alicdn"], img[src*="ae04.alicdn"]');
        allImages.forEach((img, i) => {
            const parent = img.closest('a') || img.parentElement;
            products.push({
                index: i + 1,
                name: img.alt || `Produto ${i + 1}`,
                price: '',
                imageUrl: img.src.replace(/_\d+x\d+/, '_640x640'),
                link: parent?.href || '',
            });
        });
    }

    // Resultado
    const result = {
        scraped_at: new Date().toISOString(),
        search_url: window.location.href,
        total: products.length,
        products
    };

    const json = JSON.stringify(result, null, 2);
    
    // Copiar para clipboard
    try {
        await navigator.clipboard.writeText(json);
        console.log(`✅ ${products.length} produtos extraídos e COPIADOS para o clipboard!`);
        console.log('📋 Cole em um arquivo .json ou diretamente aqui para continuar.');
    } catch(e) {
        console.log(`✅ ${products.length} produtos extraídos!`);
    }
    
    // Mostrar no console também
    console.log('📦 Dados extraídos:');
    console.table(products.map(p => ({ nome: p.name.substring(0, 50), preco: p.price, img: p.imageUrl ? '✅' : '❌' })));
    console.log('📄 JSON completo:', json);
    
    return result;
})();
