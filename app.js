// ============================================
// MAIN APP MODULE
// ============================================

// Global State
let currentPage = 1;
const totalPages = 4;
let musicPlaying = true;
let currentUser = null;
let currentPembacaId = null;
let pendingPage3Image = null;
let pendingPage3ImageRemoved = false;

// Initialize app on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const userSession = localStorage.getItem('currentUser');
    if (!userSession) {
        window.location.href = 'index.html';
        return;
    }

    currentUser = JSON.parse(userSession);

    // Route to appropriate view
    if (currentUser.role === 'admin') {
        showAdminDashboard();
    } else {
        showPembacaView();
    }
});

// ============================================
// PEMBACA VIEW
// ============================================

function showPembacaView() {
    document.getElementById('adminView').style.display = 'none';
    document.getElementById('pembacaView').style.display = 'flex';

    // Display user info
    displayPembacaUserInfo();

    // Initialize app content
    initializePembacaContent();

    // Setup event listeners
    setupPembacaEventListeners();

    // Start background music
    playBackgroundMusic();

    // Show first page
    showPage(1);
}

function displayPembacaUserInfo() {
    const usernameDisplay = document.getElementById('pembaca-username-display');
    const roleBadge = document.getElementById('pembaca-role-badge');

    usernameDisplay.textContent = currentUser.username;
    roleBadge.textContent = '👤 Pembaca';
}

function initializePembacaContent() {
    const settings = JSON.parse(localStorage.getItem('app_settings') || '{}');
    const musicURL = settings.musicURL || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
    const bgMusic = document.getElementById('bgMusic');
    bgMusic.src = musicURL;

    // Load messages from current pembaca
    const messages = currentUser.messages || {
        page1: 'Selamat ulang tahun!',
        page2: 'Doa terbaik untuk mu.',
        page3: 'Momen spesial.',
        page4: 'Terima kasih!'
    };

    document.getElementById('page1-message').textContent = messages.page1 || 'Selamat ulang tahun!';
    document.getElementById('page2-message').textContent = messages.page2 || 'Doa terbaik untuk mu.';
    document.getElementById('page4-message').textContent = messages.page4 || 'Terima kasih!';

    renderPage3Content(messages);
}

// Render Page 3 (image + optional caption) for pembaca view
function renderPage3Content(messages) {
    const container = document.getElementById('page3-content');
    if (!container) return;

    const imageHtml = messages.page3Image
        ? `<img src="${messages.page3Image}" alt="Momen spesial" class="page3-image">`
        : '';

    const captionHtml = messages.page3
        ? `<p class="page3-caption">${escapeHtml(messages.page3)}</p>`
        : (!messages.page3Image ? '<p>Tempat untuk foto, dokumen, atau konten spesial lainnya.</p>' : '');

    container.innerHTML = imageHtml + captionHtml;
}

function setupPembacaEventListeners() {
    // Navigation buttons
    document.getElementById('prevBtn').addEventListener('click', previousPage);
    document.getElementById('nextBtn').addEventListener('click', nextPage);

    // Music toggle
    document.getElementById('musicToggleBtn').addEventListener('click', toggleMusic);

    // Logout
    document.getElementById('pembaca-logoutBtn').addEventListener('click', logout);

    // WhatsApp button
    document.getElementById('sendWhatsappBtn').addEventListener('click', sendWhatsappMessage);
}

// Show specific page
function showPage(pageNumber) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active', 'prev');
    });

    const page = document.getElementById(`page${pageNumber}`);
    if (page) {
        if (pageNumber > currentPage) {
            page.classList.add('active');
        } else {
            page.classList.add('prev');
            setTimeout(() => {
                page.classList.remove('prev');
                page.classList.add('active');
            }, 10);
        }

        currentPage = pageNumber;
        document.getElementById('pageCounter').textContent = `${currentPage} / ${totalPages}`;
        updateControlButtons();
    }
}

function nextPage() {
    if (currentPage < totalPages) {
        showPage(currentPage + 1);
    }
}

function previousPage() {
    if (currentPage > 1) {
        showPage(currentPage - 1);
    }
}

function updateControlButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (currentPage === 1) {
        prevBtn.classList.add('disabled');
        prevBtn.disabled = true;
    } else {
        prevBtn.classList.remove('disabled');
        prevBtn.disabled = false;
    }

    if (currentPage === totalPages) {
        nextBtn.classList.add('disabled');
        nextBtn.disabled = true;
    } else {
        nextBtn.classList.remove('disabled');
        nextBtn.disabled = false;
    }
}

// Play background music
function playBackgroundMusic() {
    const bgMusic = document.getElementById('bgMusic');
    bgMusic.volume = 0.3;
    
    const playPromise = bgMusic.play();
    
    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                musicPlaying = true;
                updateMusicButton();
            })
            .catch((error) => {
                musicPlaying = false;
                updateMusicButton();
                console.log('Auto-play prevented by browser');
            });
    }
}

// Toggle background music
function toggleMusic() {
    const bgMusic = document.getElementById('bgMusic');

    if (musicPlaying) {
        bgMusic.pause();
        musicPlaying = false;
    } else {
        bgMusic.play();
        musicPlaying = true;
    }

    updateMusicButton();
}

// Update music button text
function updateMusicButton() {
    const musicBtn = document.getElementById('musicToggleBtn');
    musicBtn.textContent = musicPlaying ? '🔊 Musik: ON' : '🔇 Musik: OFF';
}

// Send message to WhatsApp
function sendWhatsappMessage() {
    const settings = JSON.parse(localStorage.getItem('app_settings') || '{}');
    const waMessage = settings.waMessage || 'Selamat ulang tahun!';
    const waNumber = settings.waNumber || '6281234567890';

    const cleanNumber = waNumber.replace(/[^\d+]/g, '');
    const formattedNumber = cleanNumber.startsWith('+') ? cleanNumber : '+' + cleanNumber;
    const encodedMessage = encodeURIComponent(waMessage);
    const whatsappURL = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
    
    window.open(whatsappURL, '_blank');
}

// Logout user
function logout() {
    if (confirm('Apakah Anda yakin ingin logout?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
}

// ============================================
// ADMIN DASHBOARD
// ============================================

function showAdminDashboard() {
    document.getElementById('pembacaView').style.display = 'none';
    document.getElementById('adminView').style.display = 'flex';

    setupAdminPanel();

    // Tampilkan halaman Kelola Pembaca secara otomatis
    switchAdminPage('pembaca');
}

function setupAdminPanel() {
    // Set admin user info
    const adminUsername = document.getElementById('adminUsername');
    const adminAvatar = document.getElementById('adminAvatar');
    
    adminUsername.textContent = currentUser.username;
    adminAvatar.textContent = currentUser.username.charAt(0).toUpperCase();

    // Setup sidebar menu
    document.querySelectorAll('.admin-menu-item').forEach(item => {
        item.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            switchAdminPage(page);
        });
    });

    // Setup logout
    document.getElementById('admin-logoutBtn').addEventListener('click', function() {
        if (confirm('Apakah Anda yakin ingin logout?')) {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        }
    });

    // Setup profile dropdown & edit password modal
    setupAdminProfileMenu();

    // Setup page 3 image upload
    document.getElementById('content-page3-image').addEventListener('change', handlePage3ImageUpload);

    // Load initial settings
    loadAdminSettings();
}

function switchAdminPage(page) {
    // Hide all pages
    document.querySelectorAll('.admin-section-page').forEach(p => {
        p.style.display = 'none';
    });

    // Show requested page
    if (page === 'pembaca') {
        document.getElementById('pembacaPage').style.display = 'block';
        document.getElementById('pageTitle').textContent = '👥 Kelola Pembaca';
        loadPembacaList();
    } else if (page === 'content') {
        document.getElementById('contentPage').style.display = 'block';
        document.getElementById('pageTitle').textContent = '📝 Edit Content';
        loadPembacaSelector();
    } else if (page === 'settings') {
        document.getElementById('settingsPage').style.display = 'block';
        document.getElementById('pageTitle').textContent = '⚙️ Settings';
        loadAdminSettings();
    }

    // Update menu
    document.querySelectorAll('.admin-menu-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-page="${page}"]`).classList.add('active');
}

function loadPembacaList() {
    const pembacas = getPembacas();
    const container = document.getElementById('pembacaListContainer');

    if (!container) return;

    container.innerHTML = '';

    if (pembacas.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">Belum ada pembaca</p>';
        return;
    }

    pembacas.forEach(pembaca => {
        const card = document.createElement('div');
        card.className = 'pembaca-card';

        const page1 = pembaca.messages?.page1 || 'Default message';

        card.innerHTML = `
            <div class="pembaca-card-header">
                <div class="pembaca-name">${escapeHtml(pembaca.username)}</div>
                <div class="pembaca-card-actions">
                    <button class="btn-icon edit" onclick="editPembacaMessage(${pembaca.id})" title="Edit Page 1">✏️</button>
                    <button class="btn-icon delete" onclick="deletePembaca(${pembaca.id})" title="Hapus Pembaca">🗑️</button>
                </div>
            </div>
            <div class="pembaca-message">"${escapeHtml(page1)}"</div>
            <div class="pembaca-pages">📄 4 Pages | 🎵 Musik | 📱 WhatsApp</div>
        `;

        container.appendChild(card);
    });
}

function loadPembacaSelector() {
    const pembacas = getPembacas();
    const selector = document.getElementById('pembacaSelector');

    if (!selector) return;

    selector.innerHTML = '<option value="">-- Pilih Pembaca --</option>';

    pembacas.forEach(pembaca => {
        const option = document.createElement('option');
        option.value = pembaca.id;
        option.textContent = pembaca.username;
        selector.appendChild(option);
    });
}

function loadPembacaContent() {
    const pembacaId = document.getElementById('pembacaSelector').value;

    if (!pembacaId) {
        document.getElementById('contentEditorContainer').style.display = 'none';
        currentPembacaId = null;
        return;
    }

    currentPembacaId = parseInt(pembacaId, 10);
    const pembacas = getPembacas();
    const pembaca = pembacas.find(p => p.id === currentPembacaId);

    if (!pembaca) return;

    const messages = pembaca.messages || {};

    document.getElementById('content-page1').value = messages.page1 || '';
    document.getElementById('content-page2').value = messages.page2 || '';
    document.getElementById('content-page3').value = messages.page3 || '';
    document.getElementById('content-page4').value = messages.page4 || '';

    // Reset pending upload state and load existing image (if any)
    pendingPage3Image = null;
    pendingPage3ImageRemoved = false;
    document.getElementById('content-page3-image').value = '';

    if (messages.page3Image) {
        showPage3ImagePreview(messages.page3Image);
    } else {
        hidePage3ImagePreview();
    }

    document.getElementById('contentEditorContainer').style.display = 'block';
}

function switchContentPage(pageNum) {
    document.querySelectorAll('.page-editor').forEach(editor => {
        editor.classList.remove('active');
    });
    document.querySelectorAll('.page-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    document.getElementById(`contentPage${pageNum}`).classList.add('active');
    document.querySelectorAll('.page-tab')[pageNum - 1].classList.add('active');
}

function savePembacaContent() {
    if (!currentPembacaId) {
        alert('Pilih pembaca terlebih dahulu!');
        return;
    }

    const page1 = document.getElementById('content-page1').value.trim();
    const page2 = document.getElementById('content-page2').value.trim();
    const page3Caption = document.getElementById('content-page3').value.trim();
    const page4 = document.getElementById('content-page4').value.trim();

    if (!page1 || !page2 || !page4) {
        alert('Ucapan (Page 1), Doa (Page 2), dan Pesan Akhir (Page 4) harus diisi!');
        return;
    }

    const pembacas = getPembacas();
    const pembaca = pembacas.find(r => r.id === currentPembacaId);

    if (!pembaca) return;

    // Determine final page3 image: new upload > removed > keep existing
    let page3Image = pembaca.messages?.page3Image || null;
    if (pendingPage3Image) {
        page3Image = pendingPage3Image;
    } else if (pendingPage3ImageRemoved) {
        page3Image = null;
    }

    pembaca.messages = {
        page1,
        page2,
        page3: page3Caption,
        page3Image,
        page4
    };

    savePembacas(pembacas);

    pendingPage3Image = null;
    pendingPage3ImageRemoved = false;

    alert('✅ Content pembaca berhasil disimpan!');
    loadPembacaList();
}

// ============================================
// PAGE 3 IMAGE UPLOAD (with client-side compression)
// ============================================

function handlePage3ImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        alert('File harus berupa gambar (JPG/PNG)!');
        event.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            // Resize so the longest side is at most 1280px, keep aspect ratio
            const maxDimension = 1280;
            let { width, height } = img;

            if (width > maxDimension || height > maxDimension) {
                if (width > height) {
                    height = Math.round(height * (maxDimension / width));
                    width = maxDimension;
                } else {
                    width = Math.round(width * (maxDimension / height));
                    height = maxDimension;
                }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            canvas.getContext('2d').drawImage(img, 0, 0, width, height);

            // Compress as JPEG to keep localStorage usage small
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);

            pendingPage3Image = compressedDataUrl;
            pendingPage3ImageRemoved = false;
            showPage3ImagePreview(compressedDataUrl);
        };
        img.onerror = function() {
            alert('Gagal membaca gambar. Coba file lain.');
        };
        img.src = e.target.result;
    };
    reader.onerror = function() {
        alert('Gagal membaca file.');
    };
    reader.readAsDataURL(file);
}

function showPage3ImagePreview(src) {
    document.getElementById('page3ImagePreview').src = src;
    document.getElementById('page3ImagePreviewWrapper').style.display = 'block';
}

function hidePage3ImagePreview() {
    document.getElementById('page3ImagePreviewWrapper').style.display = 'none';
    document.getElementById('page3ImagePreview').src = '';
}

function removePage3Image() {
    pendingPage3Image = null;
    pendingPage3ImageRemoved = true;
    document.getElementById('content-page3-image').value = '';
    hidePage3ImagePreview();
}

function editPembacaMessage(pembacaId) {

    const pembacas = getPembacas();

    const pembaca = pembacas.find(
        p => p.id === parseInt(pembacaId)
    );

    if (!pembaca) {
        alert('Pembaca tidak ditemukan!');
        return;
    }

    document.getElementById('newPembacaUsername').value =
        pembaca.username;

    document.getElementById('newPembacaMessage').value =
        pembaca.messages?.page1 || '';

    document.getElementById('editPembacaId').value =
        pembaca.id;

    document.getElementById('pembacaFormTitle').textContent =
        '✏️ Edit Pembaca';

    document.getElementById('pembacaSubmitBtn').textContent =
        '💾 Simpan Perubahan';

    document.getElementById('cancelEditBtn').style.display =
        'inline-block';

    document.getElementById('newPembacaUsername')
        .scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
}

function submitPembacaForm() {

    const editId =
        document.getElementById('editPembacaId').value;

    if (editId) {
        updatePembaca();
    } else {
        addNewPembaca();
    }
}

//edit data yang sudah(update)
function updatePembaca() {

    const id = parseInt(
        document.getElementById('editPembacaId').value
    );

    const username =
        document
            .getElementById('newPembacaUsername')
            .value
            .trim();

    const message =
        document
            .getElementById('newPembacaMessage')
            .value
            .trim();

    if (!username || !message) {
        alert('Username dan message harus diisi!');
        return;
    }

    const pembacas = getPembacas();

    const pembaca = pembacas.find(
        p => p.id === id
    );

    if (!pembaca) {
        alert('Pembaca tidak ditemukan!');
        return;
    }

    // Update username
    pembaca.username = username;

    // Update message
    if (!pembaca.messages) {
        pembaca.messages = {};
    }

    pembaca.messages.page1 = message;

    // Simpan
    savePembacas(pembacas);

    // Kembali ke mode tambah
    cancelEditPembaca();

    // Refresh daftar
    loadPembacaList();
    loadPembacaSelector();

    alert('✅ Pembaca berhasil diperbarui!');
}

function cancelEditPembaca() {

    document.getElementById('editPembacaId').value = '';

    document.getElementById('newPembacaUsername').value = '';

    document.getElementById('newPembacaMessage').value = '';

    document.getElementById('pembacaFormTitle').textContent =
        '👥 Tambah Pembaca Baru';

    document.getElementById('pembacaSubmitBtn').textContent =
        '➕ Tambah Pembaca';

    document.getElementById('cancelEditBtn').style.display =
        'none';
}

function deletePembaca(pembacaId) {
    const pembacas = getPembacas();
    const pembaca = pembacas.find(r => r.id === parseInt(pembacaId));

    if (!pembaca) return;

    if (confirm(`Yakin hapus pembaca "${pembaca.username}"?`)) {
        const filtered = pembacas.filter(r => r.id !== parseInt(pembacaId));
        savePembacas(filtered);
        loadPembacaList();
        alert('✅ Pembaca berhasil dihapus!');
    }
}

function loadAdminSettings() {
    const settings = JSON.parse(localStorage.getItem('app_settings') || '{}');

    document.getElementById('musicURLInput').value = settings.musicURL || '';
    document.getElementById('waMessageInput').value = settings.waMessage || '';
    document.getElementById('waNumberInput').value = settings.waNumber || '';
    document.getElementById('defaultPage1Input').value = settings.defaultPage1Message || '';
    document.getElementById('defaultPage2Input').value = settings.defaultPage2Message || '';
    document.getElementById('defaultPage4Input').value = settings.defaultPage4Message || '';
}

function saveAdminSettings() {
    const musicURL = document.getElementById('musicURLInput').value.trim();
    const waMessage = document.getElementById('waMessageInput').value.trim();
    const waNumber = document.getElementById('waNumberInput').value.trim();
    const defaultPage1 = document.getElementById('defaultPage1Input').value.trim();
    const defaultPage2 = document.getElementById('defaultPage2Input').value.trim();
    const defaultPage4 = document.getElementById('defaultPage4Input').value.trim();

    if (!musicURL || !waMessage || !waNumber) {
        alert('Music URL, WhatsApp message, dan nomor harus diisi!');
        return;
    }

    const settings = {
        musicURL,
        waMessage,
        waNumber,
        defaultPage1Message: defaultPage1 || 'Selamat ulang tahun!',
        defaultPage2Message: defaultPage2 || 'Doa terbaik untuk mu.',
        defaultPage4Message: defaultPage4 || 'Terima kasih!'
    };

    localStorage.setItem('app_settings', JSON.stringify(settings));
    alert('✅ Settings berhasil disimpan!');
}

// ============================================
// ADMIN PROFILE DROPDOWN & EDIT PASSWORD
// ============================================

function setupAdminProfileMenu() {
    const profile = document.getElementById('adminProfile');
    const trigger = document.getElementById('adminProfileTrigger');
    const dropdown = document.getElementById('adminProfileDropdown');

    trigger.addEventListener('click', function(e) {
        e.stopPropagation();
        const isOpen = dropdown.classList.toggle('show');
        profile.classList.toggle('open', isOpen);
        trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    document.addEventListener('click', function() {
        dropdown.classList.remove('show');
        profile.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
    });

    document.getElementById('editPasswordBtn').addEventListener('click', function() {
        dropdown.classList.remove('show');
        profile.classList.remove('open');
        openEditPasswordModal();
    });

    // Modal close handlers
    document.getElementById('closeEditPasswordModal').addEventListener('click', closeEditPasswordModal);
    document.getElementById('editPasswordModal').addEventListener('click', function(e) {
        if (e.target === this) closeEditPasswordModal();
    });
}

function openEditPasswordModal() {
    document.getElementById('currentPasswordInput').value = '';
    document.getElementById('newPasswordInput').value = '';
    document.getElementById('confirmPasswordInput').value = '';
    document.getElementById('editPasswordModal').classList.add('show');
}

function closeEditPasswordModal() {
    document.getElementById('editPasswordModal').classList.remove('show');
}

function changeAdminPassword() {
    const currentPassword = document.getElementById('currentPasswordInput').value.trim();
    const newPassword = document.getElementById('newPasswordInput').value.trim();
    const confirmPassword = document.getElementById('confirmPasswordInput').value.trim();

    if (!currentPassword || !newPassword || !confirmPassword) {
        alert('Semua field harus diisi!');
        return;
    }

    const admin = getAdmin();
    if (!admin || admin.password !== currentPassword) {
        alert('Sandi saat ini salah!');
        return;
    }

    if (newPassword.length < 6) {
        alert('Sandi baru minimal 6 karakter!');
        return;
    }

    if (newPassword !== confirmPassword) {
        alert('Konfirmasi sandi baru tidak cocok!');
        return;
    }

    admin.password = newPassword;
    localStorage.setItem('app_admin', JSON.stringify(admin));

    closeEditPasswordModal();
    alert('✅ Sandi berhasil diperbarui! Silakan login ulang dengan sandi baru.');

    // Force re-login for security
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getPembacas() {
    const pembacas = localStorage.getItem('app_pembacas');
    return pembacas ? JSON.parse(pembacas) : [];
}

function savePembacas(pembacas) {
    localStorage.setItem('app_pembacas', JSON.stringify(pembacas));
}

function addNewPembaca() {
    const usernameInput = document.getElementById('newPembacaUsername');
    const messageInput = document.getElementById('newPembacaMessage');

    const username = usernameInput.value.trim();
    const message = messageInput.value.trim();

    if (!username || !message) {
        alert('Username dan pesan harus diisi!');
        return;
    }

    const pembacas = getPembacas();

    if (pembacas.some(p => p.username.toLowerCase() === username.toLowerCase())) {
        alert('Username sudah ada!');
        return;
    }

    const ids = pembacas.map(p => Number(p.id)).filter(Number.isFinite);
    const newId = ids.length ? Math.max(...ids) + 1 : 1;

    const newPembaca = {
        id: newId,
        username,
        role: 'pembaca',
        messages: {
            page1: message,
            page2: 'Doa terbaik untuk mu.',
            page3: 'Momen spesial.',
            page3Image: null,
            page4: 'Terima kasih!'
        }
    };

    pembacas.push(newPembaca);
    savePembacas(pembacas);

    usernameInput.value = '';
    messageInput.value = '';

    loadPembacaList();
    loadPembacaSelector();

    alert(`✅ Pembaca "${username}" berhasil ditambahkan!`);
}

function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = String(value ?? '');
    return div.innerHTML;
}

function getCurrentUser() {
    return currentUser;
}

function isAdmin() {
    return currentUser && currentUser.role === 'admin';
}