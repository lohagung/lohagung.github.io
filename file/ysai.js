    function toggleSearch() {
      const searchBar = document.getElementById('searchBar');
      const bannerAd = document.getElementById('bannerAd');
      searchBar.classList.toggle('hidden');
      bannerAd.classList.toggle('hidden');
    }

    async function searchContent() {
      try {
        const query = document.getElementById('searchInput').value.trim();
        if (!query) {
          alert("Masukkan kata kunci pencarian!");
          return;
        }

        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyAnPO90a0Q2nF4SrxGV07EnGfYh-PQwHyw", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: query }] }]
          })
        });

        if (!response.ok) throw new Error("Gagal mendapatkan data dari API");

        const data = await response.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
        const snippet = truncateText(generatedText, 180);
        displayGeneratedContent(generatedText, snippet, query);
        storeContent(generatedText, snippet, query);
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Terjadi kesalahan saat memproses permintaan.");
      }
    }

    function displayGeneratedContent(content, snippet, query) {
      const newsList = document.getElementById('newsList');
      const imageUrl = getRandomImageUrl();
      const newItem = document.createElement('div');
      newItem.className = 'bg-white p-4 rounded-lg shadow flex space-x-4';
      newItem.innerHTML = `
        <img alt="Generated content image" class="w-24 h-24 rounded-lg" height="100" src="${imageUrl}" width="100"/>
        <div>
          <a href="?artikel=${sanitizeURLParam(decodeURIComponent(query))}" class="text-base md:text-lg font-semibold text-blue-600 hover:underline">${truncateText(content, 60)}</a>
          <div class="text-xs text-gray-600 hidden md:block">${snippet}</div>
          <div class="text-sm text-red-600">Generated <span class="text-gray-500">just now</span></div>
        </div>
      `;
      newsList.prepend(newItem);
    }

    function truncateText(text, maxLength) {
      if (text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
      }
      return text;
    }

    function getRandomImageUrl() {
      const randomImageUrls = [
        "https://source.unsplash.com/random/1000x1000",
        "https://picsum.photos/1000",
        "https://loremflickr.com/1000/1000",
        "https://placekitten.com/1000/1000",
        "https://placebear.com/1000/1000"
      ];
      return randomImageUrls[Math.floor(Math.random() * randomImageUrls.length)];
    }

    function storeContent(content, snippet, query) {
      const storedContent = JSON.parse(localStorage.getItem('newsContent')) || [];
      storedContent.push({ content, snippet, query });
      localStorage.setItem('newsContent', JSON.stringify(storedContent));
    }

    function loadStoredContent() {
      const storedContent = JSON.parse(localStorage.getItem('newsContent')) || [];
      storedContent.forEach(item => {
        displayGeneratedContent(item.content, item.snippet, item.query);
      });
    }

    async function loadArticleFromUrl() {
      const urlParams = new URLSearchParams(window.location.search);
      const query = urlParams.get('artikel');
      if (query) {
        const newsArtikel = document.getElementById('newsArtikel');
        newsArtikel.innerHTML = '<div class="flex justify-center items-center"><i class="fas fa-spinner fa-spin text-4xl text-red-600"></i></div>'; // Loading spinner
        newsArtikel.classList.remove('hidden');

        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyAnPO90a0Q2nF4SrxGV07EnGfYh-PQwHyw", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: query }] }]
          })
        });

        if (!response.ok) throw new Error("Gagal mendapatkan data dari API");

        const data = await response.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
        displayFullArticle(generatedText, query);
      }
    }

    function displayFullArticle(content, query) {
      const newsArtikel = document.getElementById('newsArtikel');
      newsArtikel.innerHTML = ''; // Clear existing content
      const imageUrl = getRandomImageUrl();
      const snippet = truncateText(content, 180);
      const title = query.replace(/-/g, ' ');

      document.title = title;

      const newItem = document.createElement('div');
     newItem.innerHTML = `
        <img alt="${title}" class="w-full h-64 object-cover rounded-lg mb-4" src="${imageUrl}"/>';   
      newItem.className = 'bg-white p-4 rounded-lg shadow w-full max-w-6xl mx-auto';
      newItem.innerHTML = `

        <h1 class="text-2xl font-bold mb-2 text-center uppercase">${title}</h1>
        <blockquote class="text-center italic text-gray-600 mb-4">"${snippet}"</blockquote>
        <div class="text-base mb-4">${formatContent(content)}</div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${generateRelatedArticles(content, query)}
        </div>
      `;
      newsArtikel.appendChild(newItem);
    }

    function generateRelatedArticles(content, query) {
      const sentences = content.split('. ');
      const relatedArticles = [];
      for (let i = 0; i < 5; i++) {
        const randomSentence = sentences[Math.floor(Math.random() * sentences.length)];
        relatedArticles.push(`
          <div class="bg-white p-4 rounded-lg shadow flex space-x-4">
            <img alt="Related article image ${i + 1}" class="w-24 h-24 rounded-lg" height="100" src="${getRandomImageUrl()}" width="100"/>
            <div>
              <a href="?artikel=${sanitizeURLParam(decodeURIComponent(truncateText(randomSentence, 120)))}" class="text-base md:text-lg font-semibold text-blue-600 hover:underline">${truncateText(randomSentence, 60)}</a>
              <div class="text-xs text-gray-600 hidden md:block">${truncateText(randomSentence, 100)}</div>
              <div class="text-sm text-red-600">Generated <span class="text-gray-500">just now</span></div>
            </div>
          </div>
        `);
      }
      return relatedArticles.join('');
    }

    function formatContent(content) {
      const converter = new showdown.Converter();
      return converter.makeHtml(content);
    }

    function copyToClipboard(text) {
      navigator.clipboard.writeText(text).then(() => {
        alert('Text copied to clipboard');
      }).catch(err => {
        console.error('Failed to copy text: ', err);
      });
    }

    function initializePage() {
      const urlParams = new URLSearchParams(window.location.search);
      const query = urlParams.get('artikel');
      if (query) {
        document.getElementById('newsList').classList.add('hidden');
        document.getElementById('newsArtikel').classList.remove('hidden');
        loadArticleFromUrl();
      } else {
        document.getElementById('newsList').classList.remove('hidden');
        document.getElementById('newsArtikel').classList.add('hidden');
        loadStoredContent();
      }
    }
function sanitizeURLParam(param) {
    return decodeURIComponent(param) // Decode jika sudah di-encode
        .toLowerCase()
        .replace(/[%\/'".,\s]+/g, "-") // Mengganti karakter spesial dengan "-"
        .replace(/-+/g, "-")           // Menghindari "-" berulang
        .replace(/^-|-$/g, "");        // Menghapus "-" di awal & akhir
}

// Contoh penggunaan dengan encodeURIComponent
let randomSentence = "Saya sedang masak 100% enak!";
let query = "Apa kabar? Bagaimana harimu!";

let url1 = `?artikel=${encodeURIComponent(randomSentence)}`;
let url2 = `?artikel=${encodeURIComponent(query)}`;

console.log(url1); // Output: ?artikel=Saya%20sedang%20masak%20100%25%20enak%21
console.log(url2); // Output: ?artikel=Apa%20kabar%3F%20Bagaimana%20harimu%21

// Mengubahnya menjadi format aman untuk URL
let safeUrl1 = sanitizeURLParam(decodeURIComponent(randomSentence));
let safeUrl2 = sanitizeURLParam(decodeURIComponent(query));

console.log(safeUrl1); // Output: saya-sedang-masak-100-enak
console.log(safeUrl2); // Output: apa-kabar-bagaimana-harimu
