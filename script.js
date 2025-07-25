document.addEventListener('DOMContentLoaded', function() {
    // ===================================================================
    // BAGIAN 1: KONTROL PERALIHAN DARI LANDING PAGE KE APLIKASI
    // ===================================================================
    const enterAppBtn = document.getElementById('enter-app-btn');
    const landingPage = document.getElementById('landing-page');
    const appContainer = document.getElementById('app-container');
    
    let map; 

    function showApp() {
        landingPage.style.display = 'none';
        appContainer.style.display = 'flex';
        if (!map) {
            initializeMapAndFeatures(); 
        }
        // Penundaan untuk memastikan container peta sudah visible sebelum invalidateSize
        setTimeout(() => { if (map) map.invalidateSize(); }, 10);
    }

    if (enterAppBtn) {
        enterAppBtn.addEventListener('click', function(event) {
            event.preventDefault(); 
            showApp();
        });
    }

    // ===================================================================
    // BAGIAN 2: KODE INTI APLIKASI WEBGIS
    // ===================================================================
    function initializeMapAndFeatures() {
        // Fungsi untuk mendapatkan warna dan ikon berdasarkan properti "Keterangan"
        // FUNGSI INI TIDAK DIUBAH, SESUAI PERMINTAAN ANDA
        function getStyleByKeterangan(properties) {
            const keterangan = properties.Keterangan ? String(properties.Keterangan).toLowerCase() : 'lainnya';
            
            const styles = {
                'toko & warung': { color: '#d9534f', icon: '<path d="M2.97 1.35A1 1 0 0 1 3.73 1h8.54a1 1 0 0 1 .76.35l2.609 3.044A1.5 1.5 0 0 1 16 5.37v.255a2.375 2.375 0 0 1-4.25 1.458A2.37 2.37 0 0 1 9.875 8 2.37 2.37 0 0 1 8 7.083 2.37 2.37 0 0 1 6.125 8a2.37 2.37 0 0 1-1.875-.917A2.375 2.375 0 0 1 0 5.625V5.37a1.5 1.5 0 0 1 .361-.976zm1.78 4.275a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 1 0 2.75 0V5.37a.5.5 0 0 0-.12-.325L12.27 2H3.73L1.12 5.045A.5.5 0 0 0 1 5.37v.255a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0M1.5 8.5A.5.5 0 0 1 2 9v6h12V9a.5.5 0 0 1 1 0v6h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1V9a.5.5 0 0 1 .5-.5m2 .5a.5.5 0 0 1 .5.5V13h8V9.5a.5.5 0 0 1 1 0V13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a.5.5 0 0 1 .5-.5" fill="white"/>' },
                'jasa & lainnya': { color: '#f0ad4e', icon: '<path d="M15.708.292a.5.5 0 0 1 .708.708l-15 15a.5.5 0 0 1-.708-.708l15-15zm-3.52 3.518a.5.5 0 0 0-.708-.708l-2.5 2.5a.5.5 0 0 0 0 .708l.5.5a.5.5 0 0 0 .708 0l1.5-1.5a1.5 1.5 0 0 1 2.122 2.122l-2.122 2.122a.5.5 0 0 0 0 .708l.5.5a.5.5 0 0 0 .708 0l2.5-2.5a.5.5 0 0 0 0-.708l-1.647-1.646zM5.292 10.292a.5.5 0 0 0-.708-.708l-2.5 2.5a.5.5 0 0 0 0 .708l.5.5a.5.5 0 0 0 .708 0l1.5-1.5a1.5 1.5 0 0 1 2.122 2.122l-2.122 2.122a.5.5 0 0 0 0 .708l.5.5a.5.5 0 0 0 .708 0l2.5-2.5a.5.5 0 0 0 0-.708l-1.647-1.646z" fill="white"/>' },
                'tempat ibadah': { color: '#5cb85c', icon: '<path d="M8.58 1.129a.5.5 0 0 0-.58-.014L2.833 4.293a.5.5 0 0 0-.27.442v8.53a.5.5 0 0 0 .5.5h2.296a.5.5 0 0 0 .49-.386L9.5 7.5a.5.5 0 0 1 .998.028l.823 5.952a.5.5 0 0 0 .49.386h2.296a.5.5 0 0 0 .5-.5v-8.53a.5.5 0 0 0-.27-.442L8.58 1.129zM12 13.5H9.82l-.65-4.72a1.5 1.5 0 0 0-2.956-.058L5.18 13.5H4V5.06l4-2.25l4 2.25V13.5z" fill="white"/>' },
                'pendidikan': { color: '#663399', icon: '<path d="M8.211 2.047a.5.5 0 00-.422 0l-7.5 4.5A.5.5 0 000 7v5a.5.5 0 00.5.5h15a.5.5 0 00.5-.5V7a.5.5 0 00-.289-.453l-7.5-4.5zM8 5.5l7 4.2-7 4.2-7-4.2 7-4.2zM1 7.59L8 12v4.51L1 12.41V7.59zm14 0v4.82L8 16.51V12l7-4.41z" fill="white"/>' },
                'fasilitas umum': { color: '#1a535c', icon: '<path d="M11 6a3 3 0 11-6 0 3 3 0 016 0z" fill="white"/><path d="M2 13.5a.5.5 0 01.5-.5h11a.5.5 0 010 1h-11a.5.5 0 01-.5-.5z" fill="white"/>' },
                'pemerintahan': { color: '#0be3ebff', icon: '<path d="M4 2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zM4 5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM7.5 5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zM4.5 8a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm2.5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5z"/> fill="white"/>' }
            };
            
            for (const key in styles) {
                if (keterangan.includes(key)) {
                    return styles[key];
                }
            }
            return styles['lainnya'];
        }

        function getMarkerIcon(properties, size) {
            const style = getStyleByKeterangan(properties);
            const svgTemplate = (bgColor, innerIcon, width, height) => `<svg viewBox="0 0 32 46" xmlns="http://www.w3.org/2000/svg" style="width:${width}px; height:${height}px;"><path d="M16 0C7.163 0 0 7.163 0 16c0 2.13.424 4.16.208 6.142.063 2.053 4.205 13.064 14.286 23.634a1.815 1.815 0 002.946-.002C27.502 35.196 31.64 24.187 31.71 22.14C31.576 20.16 32 18.13 32 16 32 7.163 24.837 0 16 0z" fill="${style.color}"/><g transform="translate(8 8) scale(1)">${style.icon}</g></svg>`;
            const iconHtml = svgTemplate(style.color, style.icon, size.width, size.height);
            return L.divIcon({ html: iconHtml, className: 'custom-marker-container', iconSize: [size.width, size.height], iconAnchor: [size.width / 2, size.height], popupAnchor: [0, -size.height] });
        }

        // *** PERUBAHAN DI SINI ***
        // Fungsi ini dimodifikasi untuk menambahkan gambar
        function createPopupContent(properties) {
            const lat = properties.Y;
            const lng = properties.X;
            const safeName = (properties.Nama || 'Nama Tidak Diketahui').replace(/'/g, "\\'");
            
            // Cek apakah ada properti 'Image' dan buat tag <img> jika ada
            const imageHtml = properties.Image 
                ? `<img src="assets/${properties.Image}" alt="${safeName}" onerror="this.onerror=null;this.src='https://placehold.co/300x130?text=Gambar+Tidak+Tersedia';">`
                : ''; // Jika tidak ada properti Image, string akan kosong
            
            const actionButtons = `<button class="popup-button" onclick="window.requestRouteFromUser(${lat}, ${lng})">Rute dari Lokasi Saya</button> <button class="popup-button secondary" onclick="window.searchRadiusFromLocation(${lat}, ${lng}, '${safeName}')">Cari Terdekat</button>`;
            const setStartRouteButton = `<button class="popup-button" onclick="window.setRoutingStart(${lat}, ${lng}, '${safeName}')">Jadikan Titik Awal Rute</button>`;
            
            return `<div class="custom-popup-card">
                        ${imageHtml}
                        <div class="card-content">
                            <h3 class="card-title">${properties.Nama || 'Nama Lokasi'}</h3>
                            <p class="card-address">Keterangan: <strong>${properties.Keterangan || '-'}</strong></p>
                        </div>
                        <div class="card-actions" style="flex-direction: column; gap: 5px;">
                            ${setStartRouteButton} ${actionButtons}
                        </div>
                    </div>`;
        }
        
        // **PERUBAHAN:** layerGroup diganti dengan umkmLayer dan lokasiTempatLayer
        let umkmMasterData = [], currentlyDisplayedFeatures = [], umkmLayer, lokasiTempatLayer, routingControl, userLocationMarker,
            categoryChart, markerLayers, routingOrigin, radiusCircle,
            radiusCenterMarker, isRadiusSelectionMode, isCustomRoutingMode,
            customRouteWaypoints, temporaryMarkersLayer, geocodeMarker,
            batasWilayahGeoJson, slopeLayer1, slopeLayerDesa,
            clearRouteBtn, clearBufferBtn, layerControl;
        
        // **PERUBAHAN:** Kriteria untuk memisahkan layer berdasarkan "Keterangan"
        const umkmKeterangan = new Set(['toko & warung', 'jasa & lainnya']);

        const tutupanLahanStyles = {
            "Sawah": { color: "#d2f40fff" },      
            "Permukiman dan Tempat Kegiatan": { color: "#FF6347" },
            "Perkebunan/Kebun": { color: "#06f506ff" },
            "Sungai": { color: "#4682B4" },
            "Jalan": { color: "#100f0fff" }
        };

        L.Control.Legend = L.Control.extend({
            onAdd: function (map) {
                const div = L.DomUtil.create('div', 'info legend');
                let legendHtml = '<h4>Legenda Tutupan Lahan</h4>';
                for (const key in tutupanLahanStyles) {
                    legendHtml += `<i style="background:${tutupanLahanStyles[key].color}"></i> ${key}<br>`;
                }
                div.innerHTML = legendHtml;
                return div;
            }
        });

        const tutupanLahanMangunrejoStyles = {
            "Sawah": { color: "#90EE90" },
            "Hutan Rimba": { color: "#228B22" },
            "Perkebunan/Kebun": { color: "#32CD32" },
            "Permukiman dan Tempat Kegiatan": { color: "#FF6347" },
            "Sungai": { color: "#72a2c9ff" },
            "Jalan": { color: "#010101ff" }
        };

        L.Control.LegendMangunrejo = L.Control.extend({
            onAdd: function (map) {
                const div = L.DomUtil.create('div', 'info legend');
                let legendHtml = '<h4>Legenda Lahan Mangunrejo</h4>';
                for (const key in tutupanLahanMangunrejoStyles) {
                    legendHtml += `<i style="background:${tutupanLahanMangunrejoStyles[key].color}"></i> ${key}<br>`;
                }
                div.innerHTML = legendHtml;
                return div;
            }
        });

        const slopeClasses = {
            1: { color: '#32CD32', label: 'Datar' },
            2: { color: '#ADFF2F', label: 'Sangat Landai' },
            3: { color: '#FFFF00', label: 'Landai' },
            4: { color: '#FFA500', label: 'Agak Curam' },
            5: { color: '#FF0000', label: 'Curam' }
        };

        const slopeValuesToColorFn = function(values) {
            const slopeValue = values[0];
            if (slopeClasses[slopeValue]) {
                return slopeClasses[slopeValue].color;
            }
            return null;
        };

        L.Control.SlopeLegend = L.Control.extend({
            onAdd: function (map) {
                const div = L.DomUtil.create('div', 'info legend');
                let legendHtml = '<h4>Kemiringan Lereng</h4>';
                for (const key in slopeClasses) {
                    legendHtml += `<i style="background:${slopeClasses[key].color}"></i> ${slopeClasses[key].label}<br>`;
                }
                div.innerHTML = legendHtml;
                return div;
            }
        });

        const mapId = 'map';
        const mainContainer = document.getElementById('main-container');
        const mapContainer = document.getElementById('map-container');
        
        clearRouteBtn = document.createElement('button');
        clearRouteBtn.id = 'clear-route-btn';
        clearRouteBtn.className = 'clear-route-btn';
        clearRouteBtn.innerHTML = '<i class="fas fa-times"></i>';
        clearRouteBtn.title = 'Hapus Rute';
        mapContainer.appendChild(clearRouteBtn);

        clearBufferBtn = document.createElement('button');
        clearBufferBtn.id = 'clear-buffer-btn';
        clearBufferBtn.className = 'clear-buffer-btn';
        clearBufferBtn.innerHTML = '<i class="fas fa-eraser"></i>';
        clearBufferBtn.title = 'Hapus Buffer Radius';
        mapContainer.appendChild(clearBufferBtn);

        const searchInput = document.getElementById('search-input');
        const searchResults = document.getElementById('search-results');
        const statusPanel = document.getElementById('status-panel');
        const radiusSlider = document.getElementById('radius-slider');
        const radiusValue = document.getElementById('radius-value');
        const findByMyLocationBtn = document.getElementById('find-by-mylocation-btn');
        const findByMapClickBtn = document.getElementById('find-by-map-click-btn');
        const customRouteBtn = document.getElementById('custom-route-btn');
        const categoryFilterDropdown = document.getElementById('kategori-filter');
        const addressSearchInput = document.getElementById('address-search-input');
        const geocodeAddressBtn = document.getElementById('geocode-address-btn');
        const geocodeResultsDiv = document.getElementById('geocode-results');
        const areaColorPicker = document.getElementById('area-color-picker');
        const areaOpacitySlider = document.getElementById('area-opacity-slider');
        const areaOpacityValue = document.getElementById('area-opacity-value');
        const areaFillColorPicker = document.getElementById('area-fill-color-picker');
        const toolbarButtons = document.querySelectorAll('#map-toolbar .toolbar-btn');
        const toolPanels = document.querySelectorAll('#panel-container .tool-panel');
        const closePanelButtons = document.querySelectorAll('#panel-container .close-panel-btn');
        const downloadJsonBtn = document.getElementById('download-json-btn');
        const downloadCsvBtn = document.getElementById('download-csv-btn');
        const downloadPdfBtn = document.getElementById('download-pdf-btn');
        
        const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' });
        const cartoVoyager = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>' });
        const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Tiles &copy; Esri' });
        const openTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        });
        const stamenToner = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });
        let activeBasemap = cartoVoyager;
        
        map = L.map(mapId, { center: [-7.432357, 109.915667], zoom: 17, layers: [activeBasemap], zoomControl: false });
        
        map.createPane('tutupanLahanPane');
        map.getPane('tutupanLahanPane').style.zIndex = 450;

        L.control.zoom({ position: 'topright' }).addTo(map);
        
        // **PERUBAHAN:** Inisialisasi layer terpisah dan menambahkannya ke peta
        umkmLayer = L.layerGroup().addTo(map);
        lokasiTempatLayer = L.layerGroup().addTo(map);

        temporaryMarkersLayer = L.layerGroup().addTo(map);

        const userIcon = L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', iconSize: [32, 32] });
        const geocodeMarkerIcon = L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/447/447031.png', iconSize: [32, 32] });
        
        const baseMaps = { "Peta Voyager": cartoVoyager, "Peta Jalan (OSM)": osm, "Satelit": satellite, "Peta Topografi": openTopoMap, "Peta Toner": stamenToner };
      
    
        L.control.scale({ metric: true, imperial: false, position: 'bottomright' }).addTo(map);

        function closeAllPanels() {
            toolPanels.forEach(panel => panel.classList.remove('visible'));
            toolbarButtons.forEach(btn => btn.classList.remove('active'));
            mainContainer.classList.remove('panel-visible');
            setTimeout(() => map.invalidateSize(), 310);
        }
        toolbarButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetPanelId = button.dataset.panelId;
                const targetPanel = document.getElementById(targetPanelId);
                const isAlreadyActive = button.classList.contains('active');
                closeAllPanels();
                if (!isAlreadyActive) {
                    button.classList.add('active');
                    targetPanel.classList.add('visible');
                    mainContainer.classList.add('panel-visible');
                    setTimeout(() => map.invalidateSize(), 310);
                }
            });
        });
        closePanelButtons.forEach(button => button.addEventListener('click', closeAllPanels));

        L.Control.CustomButtons = L.Control.extend({
            onAdd: function(map) {
                const container = L.DomUtil.create('div', 'leaflet-bar custom-control-container');
                const homeBtn = L.DomUtil.create('a', '', container);
                homeBtn.innerHTML = '🏠'; homeBtn.href = '#'; homeBtn.title = 'Kembali ke Tampilan Awal';
                const exitBtn = L.DomUtil.create('a', '', container);
                exitBtn.innerHTML = '↩'; exitBtn.href = '#'; exitBtn.title = 'Kembali ke Halaman Utama';

                L.DomEvent.on(homeBtn, 'click', (e) => {
                    e.preventDefault();
                    map.flyTo([-7.432357, 109.915667], 17);
                    clearAll();
                });
                L.DomEvent.on(exitBtn, 'click', (e) => {
                    e.preventDefault();
                    if (confirm("Kembali ke halaman utama?")) {
                        appContainer.style.display = 'none';
                        landingPage.style.display = 'block';
                    }
                });
                return container;
            }
        });
        new L.Control.CustomButtons({ position: 'topright' }).addTo(map);

        // FUNGSI INI TIDAK DIUBAH, BEKERJA DENGAN LOGIKA ASLI
        function updateStatsAndChart(features) {
            document.getElementById('rs-count').textContent = features.length;
            if (features.length === 0) {
                document.getElementById('kategori-terbanyak').textContent = '-';
                document.getElementById('kategori-tersedikit').textContent = '-';
                if(categoryChart) categoryChart.destroy();
                return;
            }
            const counts = features.reduce((acc, f) => {
                const cat = f.properties.Keterangan || 'Lainnya';
                acc[cat] = (acc[cat] || 0) + 1;
                return acc;
            }, {});
            
            const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
            document.getElementById('kategori-terbanyak').textContent = `${sorted[0][0]} (${sorted[0][1]})`;
            document.getElementById('kategori-tersedikit').textContent = `${sorted[sorted.length - 1][0]} (${sorted[sorted.length - 1][1]})`;

            const ctx = document.getElementById('category-chart').getContext('2d');
            const labels = Object.keys(counts);
            const dataValues = Object.values(counts);
            const backgroundColors = labels.map(label => getStyleByKeterangan({ 'Keterangan': label }).color);
            
            if (categoryChart) categoryChart.destroy();
            categoryChart = new Chart(ctx, {
                type: 'doughnut',
                data: { labels, datasets: [{ label: 'Jumlah Lokasi', data: dataValues, backgroundColor: backgroundColors, borderWidth: 1 }] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
            });
        }
        
        // FUNGSI INI TIDAK DIUBAH, BEKERJA DENGAN LOGIKA ASLI
        function populateFilter(features) {
            categoryFilterDropdown.innerHTML = '<option value="Semua">Tampilkan Semua</option>';
            const categories = [...new Set(features.map(f => f.properties.Keterangan).filter(Boolean))].sort();
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat;
                option.textContent = cat;
                categoryFilterDropdown.appendChild(option);
            });
        }
        categoryFilterDropdown.addEventListener('change', displayFeatures);

        // **PERUBAHAN UTAMA ADA DI FUNGSI INI**
        function displayFeatures() {
            // Kosongkan layer-layer terpisah
            umkmLayer.clearLayers();
            lokasiTempatLayer.clearLayers();
            markerLayers = {};
            
            const filterValue = categoryFilterDropdown.value;

            // Filter data berdasarkan dropdown (menggunakan Keterangan asli), tidak berubah
            currentlyDisplayedFeatures = (filterValue === 'Semua')
                ? umkmMasterData
                : umkmMasterData.filter(feature => feature.properties.Keterangan === filterValue);

            // Update statistik berdasarkan data yang difilter, tidak berubah
            updateStatsAndChart(currentlyDisplayedFeatures);
            
            const markerSize = getMarkerSizeForZoom(map.getZoom());

            // Loop melalui data yang sudah difilter dan tempatkan di layer yang sesuai
            currentlyDisplayedFeatures.forEach(feature => {
                const lat = feature.properties.Y;
                const lng = feature.properties.X;
                if (isNaN(lat) || isNaN(lng)) return;
                
                const latlng = L.latLng(lat, lng);
                const marker = L.marker(latlng, { icon: getMarkerIcon(feature.properties, markerSize) });
                marker.feature = feature;
                marker.bindPopup(createPopupContent(feature.properties), { className: 'custom-leaflet-popup' });
                
                marker.on('click', () => {
                    if (routingOrigin) {
                        createRoute(routingOrigin, feature.properties);
                        routingOrigin = null;
                        hideStatus();
                    }
                });

                // Simpan semua marker untuk fungsi pencarian
                markerLayers[feature.properties.Nama] = marker;

                // **Logika Pemisah Layer:** Tentukan marker masuk ke layer mana
                const keteranganLower = (feature.properties.Keterangan || '').toLowerCase();
                if (umkmKeterangan.has(keteranganLower)) {
                    marker.addTo(umkmLayer);
                } else {
                    marker.addTo(lokasiTempatLayer);
                }
            });
        }
        
        searchInput.addEventListener('keyup', (e) => { 
            const query = e.target.value.toLowerCase(); 
            searchResults.innerHTML = ''; 
            if (query.length < 2) { searchResults.style.display = 'none'; return; }

            const results = umkmMasterData.filter(f => f.properties.Nama && String(f.properties.Nama).toLowerCase().includes(query)); 
            searchResults.style.display = results.length > 0 ? 'block' : 'none'; 
            results.forEach(result => { 
                const item = document.createElement('div');
                item.className = 'search-result-item';
                item.textContent = result.properties.Nama;
                item.onclick = () => { 
                    closeAllPanels();
                    // Pencarian tetap bekerja karena markerLayers diisi untuk semua marker
                    const marker = markerLayers[result.properties.Nama];
                    if (marker) {
                        map.flyTo(marker.getLatLng(), 18);
                        marker.openPopup();
                    }
                    searchInput.value = result.properties.Nama;
                    searchResults.style.display = 'none';
                };
                searchResults.appendChild(item);
            });
        });
        
        function clearAll() {
            clearRoute(); 
            clearRadiusSearch();
            if (userLocationMarker) map.removeLayer(userLocationMarker);
            if (geocodeMarker) map.removeLayer(geocodeMarker);
            routingOrigin = null;
            hideStatus();
            closeAllPanels();
            categoryFilterDropdown.value = 'Semua';
            displayFeatures();
        }

        clearBufferBtn.addEventListener('click', clearRadiusSearch);
        function clearRadiusSearch() {
            if(radiusCircle) map.removeLayer(radiusCircle);
            if(radiusCenterMarker) map.removeLayer(radiusCenterMarker);
            isRadiusSelectionMode = false;
            map.getContainer().style.cursor = '';
            clearBufferBtn.style.display = 'none';
            hideStatus();
        }
        function performRadiusSearch(originLatLng, radiusInKm, originName) {
            clearRadiusSearch();
            const radiusInMeters = radiusInKm * 1000;
            radiusCircle = L.circle(originLatLng, { radius: radiusInMeters, color: '#e63946', fillOpacity: 0.15 }).addTo(map);
            radiusCenterMarker = L.marker(originLatLng, { icon: L.icon({iconUrl: 'https://cdn-icons-png.flaticon.com/512/3503/3503639.png', iconSize: [32, 32]})}).addTo(map).bindPopup(`<b>Pusat Pencarian</b><br>${originName}`).openPopup();
            clearBufferBtn.style.display = 'block';

            const radiusResults = umkmMasterData.filter(f => {
                if (!f.properties || !f.properties.Y || !f.properties.X || String(f.properties.Nama) === String(originName)) return false;
                const locLatLng = L.latLng(f.properties.Y, f.properties.X);
                return originLatLng.distanceTo(locLatLng) <= radiusInMeters;
            });

            if (radiusResults.length > 0) { 
                map.flyToBounds(radiusCircle.getBounds().pad(0.1)); 
                showStatus(`${radiusResults.length} lokasi ditemukan dalam radius ${radiusInKm} km.`); 
            } else { 
                map.flyTo(originLatLng, 15); 
                showStatus(`Tidak ada lokasi lain ditemukan dalam radius ${radiusInKm} km.`, true); 
            }
        }
        radiusSlider.addEventListener('input', (e) => { radiusValue.textContent = `${e.target.value} km`; });
        findByMyLocationBtn.addEventListener('click', () => {
            navigator.geolocation.getCurrentPosition(position => {
                performRadiusSearch(L.latLng(position.coords.latitude, position.coords.longitude), parseInt(radiusSlider.value), "Lokasi Anda");
            }, () => showStatus('Gagal mendapatkan lokasi Anda.', true));
        });
        findByMapClickBtn.addEventListener('click', () => { 
            isRadiusSelectionMode = true;
            closeAllPanels(); 
            showStatus('Klik di peta untuk menjadi pusat pencarian radius.'); 
            map.getContainer().style.cursor = 'crosshair';
        });
        window.searchRadiusFromLocation = (lat, lng, name) => {
            map.closePopup();
            performRadiusSearch(L.latLng(lat, lng), parseInt(radiusSlider.value), name);
        };
        
        clearRouteBtn.addEventListener('click', clearRoute);
        function clearRoute() {
            if (routingControl) map.removeControl(routingControl);
            routingControl = null;
            temporaryMarkersLayer.clearLayers();
            isCustomRoutingMode = false;
            customRouteWaypoints = [];
            map.getContainer().style.cursor = '';
            clearRouteBtn.style.display = 'none';
            hideStatus();
        }
        window.requestRouteFromUser = (lat, lng) => { 
            navigator.geolocation.getCurrentPosition(position => {
                clearRoute(); 
                const userLatLng = L.latLng(position.coords.latitude, position.coords.longitude);
                routingControl = L.Routing.control({
                    waypoints: [userLatLng, L.latLng(lat, lng)],
                    router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' }),
                }).addTo(map);
                clearRouteBtn.style.display = 'block';
            }, () => showStatus('Gagal mendapatkan lokasi Anda.', true));
        }
        window.setRoutingStart = (lat, lng, name) => {
            clearRoute();
            routingOrigin = { lat, lng, name };
            closeAllPanels();
            showStatus(`Titik awal di "${name}". Klik lokasi lain sebagai tujuan.`);
            map.getContainer().style.cursor = 'crosshair';
            map.closePopup();
        }
        function createRoute(origin, destProps) {
            clearRoute();
            const originLatLng = L.latLng(origin.lat, origin.lng);
            const destLatLng = L.latLng(destProps.Y, destProps.X);
            
            routingControl = L.Routing.control({
                waypoints: [ L.Routing.waypoint(originLatLng, origin.name), L.Routing.waypoint(destLatLng, destProps.Nama) ],
                router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' }),
            }).addTo(map);
            clearRouteBtn.style.display = 'block';
        }
        customRouteBtn.addEventListener('click', () => {
            clearRadiusSearch(); clearRoute();
            isCustomRoutingMode = true;
            customRouteWaypoints = [];
            closeAllPanels();
            showStatus('Mode Rute: Klik titik awal, lalu klik titik akhir.');
            map.getContainer().style.cursor = 'crosshair';
        });
        
        map.on('click', function(e) { 
            if (isCustomRoutingMode) {
                customRouteWaypoints.push(e.latlng); 
                if (customRouteWaypoints.length === 1) { 
                    L.marker(e.latlng).addTo(temporaryMarkersLayer).bindPopup('Titik Awal').openPopup(); 
                    showStatus('Titik Awal diatur. Klik lagi untuk Titik Akhir.'); 
                } else if (customRouteWaypoints.length === 2) { 
                    temporaryMarkersLayer.clearLayers(); 
                    routingControl = L.Routing.control({ waypoints: customRouteWaypoints }).addTo(map); 
                    clearRouteBtn.style.display = 'block';
                    isCustomRoutingMode = false; 
                    map.getContainer().style.cursor = ''; 
                    hideStatus();
                } 
            } else if (isRadiusSelectionMode) { 
                performRadiusSearch(e.latlng, parseInt(radiusSlider.value), `Titik Pilihan`); 
                isRadiusSelectionMode = false; 
                map.getContainer().style.cursor = ''; 
            } 
        });
        
        function showStatus(message, autoHide = false) { statusPanel.textContent = message; statusPanel.style.display = 'block'; if (autoHide) setTimeout(hideStatus, 5000); }
        function hideStatus() { statusPanel.style.display = 'none'; }
        
        async function geocodeAddress(address) {
            geocodeResultsDiv.innerHTML = '';
            if (geocodeMarker) map.removeLayer(geocodeMarker);
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=5&countrycodes=id`);
                const data = await response.json();
                if (data && data.length > 0) {
                    data.forEach(result => {
                        const item = document.createElement('div');
                        item.className = 'geocode-result-item';
                        item.textContent = result.display_name;
                        item.onclick = () => {
                            const latlng = L.latLng(result.lat, result.lon);
                            if (geocodeMarker) map.removeLayer(geocodeMarker);
                            geocodeMarker = L.marker(latlng, { icon: geocodeMarkerIcon }).addTo(map).bindPopup(`<b>${result.display_name}</b>`).openPopup();
                            map.flyTo(latlng, 16);
                        };
                        geocodeResultsDiv.appendChild(item);
                    });
                } else { showStatus(`Alamat "${address}" tidak ditemukan.`, true); }
            } catch (error) { showStatus('Gagal mencari alamat.', true); }
        }
        geocodeAddressBtn.addEventListener('click', () => { if (addressSearchInput.value.trim()) geocodeAddress(addressSearchInput.value.trim()); });
        addressSearchInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') geocodeAddress(addressSearchInput.value.trim()); });
        
        areaColorPicker.addEventListener('input', function() { if (batasWilayahGeoJson) batasWilayahGeoJson.setStyle({ color: this.value }); });
        areaFillColorPicker.addEventListener('input', function() { if (batasWilayahGeoJson) batasWilayahGeoJson.setStyle({ fillColor: this.value }); });
        areaOpacitySlider.addEventListener('input', function() { const opacity = parseFloat(this.value); areaOpacityValue.textContent = opacity; if (batasWilayahGeoJson) batasWilayahGeoJson.setStyle({ opacity: opacity, fillOpacity: opacity * 0.2 }); });
        
        function getMarkerSizeForZoom(zoom) {
            if (zoom >= 17) return { width: 24, height: 28 };
            if (zoom >= 15) return { width: 22, height: 26 };
            return { width: 20, height: 30 };
        }
        map.on('zoomend', function() {
            const newSize = getMarkerSizeForZoom(map.getZoom());
            // Perbarui ikon di kedua layer
            umkmLayer.eachLayer(marker => {
                if (marker.feature && marker.feature.properties) {
                    marker.setIcon(getMarkerIcon(marker.feature.properties, newSize));
                }
            });
            lokasiTempatLayer.eachLayer(marker => {
                if (marker.feature && marker.feature.properties) {
                    marker.setIcon(getMarkerIcon(marker.feature.properties, newSize));
                }
            });
        });
        
        const slopeLegend = new L.Control.SlopeLegend({ position: 'bottomright' });
        map.on('overlayadd', function(e) {
            if (e.layer === slopeLayer1 || e.layer === slopeLayerDesa) {
                if (!map.hasLayer(slopeLegend)) {
                    slopeLegend.addTo(map);
                }
            }
        });
        map.on('overlayremove', function(e) {
            if (e.layer === slopeLayer1 || e.layer === slopeLayerDesa) {
                if (!map.hasLayer(slopeLayer1) && !map.hasLayer(slopeLayerDesa)) {
                    map.removeControl(slopeLegend);
                }
            }
        });

        // Proses memuat semua data
        Promise.all([
            fetch('data/Data UMKM.geojson').then(res => res.json()), // Gunakan file GeoJSON yang telah Anda update
            fetch('data/Batas.geojson').then(res => res.json()),
            fetch('data/Tutupan Lahan.geojson').then(res => res.json()),
            fetch('data/Batas Dusun.geojson').then(res => res.json()),
            fetch('data/Desa Mangunrejo.geojson').then(res => res.json()),
            fetch('data/Tutupan Lahan Mangunrejo.geojson').then(res => res.json()),
            fetch("data/Slope1.tif").then(res => res.arrayBuffer()),
            fetch("data/Reclass_Slop21.tif").then(res => res.arrayBuffer())
        ]).then(async ([
            umkmData, areaData, tutupanLahanData, dusunData, desaData, tutupanLahanMangunrejoData,
            slope1Buffer, slope2Buffer
        ]) => {
            umkmMasterData = umkmData.features;

            populateFilter(umkmMasterData);
            displayFeatures();

            let tutupanLahanMangunrejoLayer, batasDesaLayer, batasDusunLayer, tutupanLahanLayer;

            if (tutupanLahanMangunrejoData) {
                 const drawingOrder = { "Hutan Rimba": 1, "Perkebunan/Kebun": 2, "Sawah": 3, "Permukiman dan Tempat Kegiatan": 4, "Sungai": 5, "Jalan": 6 };
                 const getCategoryForSorting = (remark) => {
                     if (remark.includes('Jalan')) return 'Jalan';
                     if (remark.includes('Sungai')) return 'Sungai';
                     return remark;
                 };
                 tutupanLahanMangunrejoData.features.sort((a, b) => {
                     const remarkA = a.properties.REMARK ? a.properties.REMARK.trim() : '';
                     const remarkB = b.properties.REMARK ? b.properties.REMARK.trim() : '';
                     const orderA = drawingOrder[getCategoryForSorting(remarkA)] || 0;
                     const orderB = drawingOrder[getCategoryForSorting(remarkB)] || 0;
                     return orderA - orderB;
                 });
                 tutupanLahanMangunrejoLayer = L.geoJSON(tutupanLahanMangunrejoData, {
                     style: function(feature) {
                         const remark = feature.properties.REMARK ? feature.properties.REMARK.trim() : '';
                         let styleInfo;
                         if (remark.includes('Jalan')) {
                             styleInfo = tutupanLahanMangunrejoStyles['Jalan'];
                             return { color: styleInfo.color, weight: 2, pane: 'tutupanLahanPane' };
                         } else if (remark.includes('Sungai')) {
                             styleInfo = tutupanLahanMangunrejoStyles['Sungai'];
                             return { color: styleInfo.color, weight: 2.5, pane: 'tutupanLahanPane' };
                         } else {
                             styleInfo = tutupanLahanMangunrejoStyles[remark];
                             return styleInfo ? { fillColor: styleInfo.color, weight: 1, opacity: 1, color: 'white', fillOpacity: 0.8, pane: 'tutupanLahanPane' } : {};
                         }
                     },
                     onEachFeature: (feature, layer) => {
                         const props = feature.properties;
                         if (props && props.REMARK) {
                             let namaObjek = props.NAMOBJ ? ` (${props.NAMOBJ})` : '';
                             layer.bindPopup(`<b>${props.REMARK.trim()}</b>${namaObjek}`);
                         }
                     }
                 });
                 const mangunrejoLegend = new L.Control.LegendMangunrejo({ position: 'bottomright' });
                 map.on('overlayadd', e => { if (e.layer === tutupanLahanMangunrejoLayer) mangunrejoLegend.addTo(map); });
                 map.on('overlayremove', e => { if (e.layer === tutupanLahanMangunrejoLayer) map.removeControl(mangunrejoLegend); });
            }

            if (desaData) {
                 batasDesaLayer = L.geoJSON(desaData, {
                     style: { color: "#e60000", weight: 5, opacity: 0.9, fillColor: "#e60000", fillOpacity: 0.2 },
                     onEachFeature: (feature, layer) => {
                         const p = feature.properties;
                         layer.bindPopup(`<div class="area-popup-content"><div class="area-popup-title"><i class="fas fa-university"></i>Desa ${p.DESA || 'N/A'}</div><div class="area-attributes"><div class="area-attribute-item"><i class="fas fa-barcode"></i><div><strong>Kode Desa:</strong><span>${p.KODE_DESA || 'N/A'}</span></div></div><div class="area-attribute-item"><i class="fas fa-users"></i><div><strong>Jumlah Penduduk:</strong><span>${p.JUMLAH_PEN || 'N/A'} Jiwa</span></div></div><div class="area-attribute-item"><i class="fas fa-home"></i><div><strong>Jumlah KK:</strong><span>${p.JUMLAH_KK || 'N/A'} KK</span></div></div><div class="area-attribute-item"><i class="fas fa-ruler-combined"></i><div><strong>Luas Wilayah:</strong><span>${p.LUAS_WILAY || 'N/A'} km²</span></div></div><div class="area-attribute-item"><i class="fas fa-user-tie"></i><div><strong>Kepala Desa:</strong><span>Sarwono</span></div></div></div></div>`);
                     }
                 });
            }

            if (dusunData) {
                 batasDusunLayer = L.geoJSON(dusunData, {
                     style: { color: "#800080", weight: 4, opacity: 1, fillColor: "#800080", fillOpacity: 0.15 },
                     onEachFeature: (feature, layer) => {
                         const p = feature.properties;
                         if (p && p.Dusun) layer.bindPopup(`<div class="area-popup-content"><div class="area-popup-title"><i class="fas fa-landmark"></i>Informasi ${p.Dusun}</div><div class="area-attributes"><div class="area-attribute-item"><i class="fas fa-users"></i><div><strong>Jumlah Penduduk:</strong><span>${p.Penduduk || 'Tidak ada data'} Jiwa</span></div></div><div class="area-attribute-item"><i class="fas fa-home"></i><div><strong>Jumlah KK:</strong><span>${p.Jumlah_KK || 'Tidak ada data'} KK</span></div></div><div class="area-attribute-item"><i class="fas fa-user-tie"></i><div><strong>Kepala Dusun:</strong><span>${p.Kep_Dusun || 'Tidak ada data'}</span></div></div></div></div>`);
                     }
                 });
            }

            if (areaData) {
                batasWilayahGeoJson = L.geoJSON(areaData, {
                    style: { color: "#E67E22", weight: 3, opacity: 0.9, fillColor: "#E67E22", fillOpacity: 0.2 },
                    onEachFeature: (feature, layer) => {
                         const p = feature.properties;
                         if (p && p.RT) layer.bindPopup(`<div class="area-popup-content"><div class="area-popup-title"><i class="fas fa-map-signs"></i>Informasi ${p.RT}</div><div class="area-attributes"><div class="area-attribute-item"><i class="fas fa-users"></i><div><strong>Jumlah Penduduk:</strong><span>${p.Penduduk || 'Tidak ada data'} Jiwa</span></div></div><div class="area-attribute-item"><i class="fas fa-home"></i><div><strong>Jumlah KK:</strong><span>${p['Jumlah KK'] || 'Tidak ada data'} KK</span></div></div><div class="area-attribute-item"><i class="fas fa-user-tie"></i><div><strong>Ketua RT:</strong><span>${p['Ketua RT'] || 'Tidak ada data'}</span></div></div></div></div>`);
                    }
                });
            }

            if (tutupanLahanData) {
                 const drawingOrder = { "Sawah": 1, "Perkebunan/Kebun": 2, "Permukiman dan Tempat Kegiatan": 3, "Sungai": 4, "Jalan": 5 };
                 tutupanLahanData.features.sort((a, b) => (drawingOrder[a.properties.REMARK.trim()] || 0) - (drawingOrder[b.properties.REMARK.trim()] || 0));
                 tutupanLahanLayer = L.geoJSON(tutupanLahanData, {
                     style: function(feature) {
                         const style = tutupanLahanStyles[feature.properties.REMARK.trim()];
                         return style ? { fillColor: style.color, weight: 1, opacity: 1, color: 'white', fillOpacity: 0.7 } : { fillColor: '#808080', weight: 1 };
                     }
                 }).bindPopup(f => `Tutupan Lahan: <b>${f.feature.properties.REMARK.trim()}</b>`);
                 const legend = new L.Control.Legend({ position: 'bottomright' });
                 map.on('overlayadd', e => { if (e.layer === tutupanLahanLayer) legend.addTo(map); });
                 map.on('overlayremove', e => { if (e.layer === tutupanLahanLayer) map.removeControl(legend); });
            }
            
            if (slope1Buffer) {
                const georaster = await parseGeoraster(slope1Buffer);
                slopeLayer1 = new GeoRasterLayer({ georaster, opacity: 0.7, pixelValuesToColorFn: slopeValuesToColorFn, resolution: 256, interactive: true });
                slopeLayer1.on('click', function(e) {
                    const slopeValue = e.value;
                    if (slopeValue && slopeClasses[slopeValue]) L.popup().setLatLng(e.latlng).setContent(`<b>Informasi Lereng</b><br>Nilai Piksel: ${slopeValue}<br>Keterangan: <b>${slopeClasses[slopeValue].label}</b>`).openOn(map);
                });
            }

            if (slope2Buffer) {
                const georaster = await parseGeoraster(slope2Buffer);
                slopeLayerDesa = new GeoRasterLayer({ georaster, opacity: 0.7, pixelValuesToColorFn: slopeValuesToColorFn, resolution: 256, interactive: true });
                slopeLayerDesa.on('click', function(e) {
                    const slopeValue = e.value;
                    if (slopeValue && slopeClasses[slopeValue]) L.popup().setLatLng(e.latlng).setContent(`<b>Informasi Lereng Desa</b><br>Nilai Piksel: ${slopeValue}<br>Keterangan: <b>${slopeClasses[slopeValue].label}</b>`).openOn(map);
                });
            }

            // **PERUBAHAN:** Memperbarui kontrol layer dengan layer terpisah
            const groupedOverlays = {
              "Dusun Karangmalang": {
                "UMKM": umkmLayer,
                "Lokasi Tempat": lokasiTempatLayer,
                "Batas RT Karangmalang": batasWilayahGeoJson,
                "Tutupan Lahan Karangmalang": tutupanLahanLayer,
                "Kemiringan Lereng Dusun": slopeLayer1,
              },
              "Desa Mangunrejo": {
                "Batas Desa Mangunrejo": batasDesaLayer,
                "Batas Dusun": batasDusunLayer,
                "Tutupan Lahan Mangunrejo": tutupanLahanMangunrejoLayer,
                "Kemiringan Lereng Desa": slopeLayerDesa
              }
            };

            if (layerControl) {
                map.removeControl(layerControl);
            }
            layerControl = L.control.groupedLayers(baseMaps, groupedOverlays, {
                collapsed: false,
                position: 'topright'
            }).addTo(map);

        }).catch(err => {
            console.error('Gagal memuat data awal:', err);
            showStatus('Gagal memuat file data GeoJSON atau Raster. Periksa konsol.', true);
        });
            
        function getActiveFeaturesForDownload() { 
            return { type: "FeatureCollection", features: currentlyDisplayedFeatures };
        }
        
        downloadJsonBtn.addEventListener('click', function() {
            const dataToDownload = getActiveFeaturesForDownload();
            if (!dataToDownload.features.length) return alert('Tidak ada data untuk diunduh.');
            const dataStr = JSON.stringify(dataToDownload, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `data_umkm_dusun_karangmalang.geojson`;
            a.click();
            URL.revokeObjectURL(url);
        });

        downloadCsvBtn.addEventListener('click', function() {
            const dataToDownload = getActiveFeaturesForDownload();
            if (!dataToDownload.features.length) return alert('Tidak ada data untuk diunduh.');
            const headers = ['Nama', 'Keterangan', 'Longitude', 'Latitude', 'Image']; // Menambahkan Image ke header CSV
            let csvContent = headers.join(',') + '\n';
            dataToDownload.features.forEach(f => {
                const row = [`"${f.properties.Nama || ''}"`, `"${f.properties.Keterangan || ''}"`, f.geometry.coordinates[0], f.geometry.coordinates[1], `"${f.properties.Image || ''}"`];
                csvContent += row.join(',') + '\n';
            });
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `data_umkm_dusun_karangmalang.csv`;
            a.click();
            URL.revokeObjectURL(url);
        });

        downloadPdfBtn.addEventListener('click', function() {
            const dataToDownload = getActiveFeaturesForDownload();
            if (!dataToDownload.features.length) return alert('Tidak ada data untuk diunduh.');
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: 'portrait' });
            const tableHead = [['Nama Lokasi', 'Keterangan']];
            const tableBody = dataToDownload.features.map(f => [f.properties.Nama || 'N/A', f.properties.Keterangan || 'N/A']);
            doc.text(`Laporan Data UMKM Dusun Karangmalang`, 14, 15);
            doc.autoTable({ head: tableHead, body: tableBody, startY: 25 });
            doc.save('laporan_data_umkm.pdf');
        });
         const printMapBtn = document.getElementById('print-map-btn');
        if (printMapBtn) {
            printMapBtn.addEventListener('click', function() {
                console.log("Mempersiapkan mode cetak...");
                
                document.body.classList.add('printing-mode');

                setTimeout(() => {
                    map.invalidateSize(true); 

                    setTimeout(() => {
                        window.print();
                    }, 1000);

                }, 100);
            });
        }

        window.onafterprint = function() {
            console.log("Mode cetak selesai, mengembalikan tampilan.");
            document.body.classList.remove('printing-mode');
            map.invalidateSize(true);
        };
        
        const reportPanelButton = document.querySelector('[data-panel-id="panel-report"]');
        if (reportPanelButton) reportPanelButton.style.display = 'none';
    } 
});