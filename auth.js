// ============================================
// AUTHENTICATION MODULE
// ============================================

// Initialize demo users with per-page content
function initializeDemoUsers() {
    const admin = localStorage.getItem('app_admin');
    if (!admin) {
        const defaultAdmin = {
            id: 1,
            username: 'admin',
            password: 'admin123',
            role: 'admin'
        };
        localStorage.setItem('app_admin', JSON.stringify(defaultAdmin));
    }

    // Initialize pembacas with per-page messages
    const pembacas = localStorage.getItem('app_pembacas');
    if (!pembacas) {
        const defaultPembacas = [
            {
                id: 1,
                username: 'pembaca1',
                role: 'pembaca',
                messages: {
                    page1: 'Selamat ulang tahun yang istimewa!',
                    page2: 'Semoga setiap langkahmu dipandu kasih sayang Tuhan.',
                    page3: 'Momen spesial untuk orang spesial.',
                    page4: 'Terima kasih atas kehadiran mu!'
                }
            },
            {
                id: 2,
                username: 'pembaca2',
                role: 'pembaca',
                messages: {
                    page1: 'Selamat hari yang penuh kebahagiaan!',
                    page2: 'Doa terbaik untuk hari spesialmu.',
                    page3: 'Kenangan indah bersama orang terkasih.',
                    page4: 'Semoga selalu bahagia dan sehat!'
                }
            }
        ];
        localStorage.setItem('app_pembacas', JSON.stringify(defaultPembacas));
    }
}

// Initialize default app settings
function initializeAppSettings() {
    const settings = localStorage.getItem('app_settings');
    if (!settings) {
        const defaultSettings = {
            waMessage: 'Selamat ulang tahun! 🎉 Lihat kejutan spesial di sini!',
            waNumber: '6281234567890',
            musicURL: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            defaultPage2Message: 'Semoga setiap langkahmu dipandu oleh kasih sayang Tuhan, dan setiap mimpi menjadi kenyataan yang indah.',
            defaultPage4Message: 'Selamat ulang tahun yang luar biasa!'
        };
        localStorage.setItem('app_settings', JSON.stringify(defaultSettings));
    }
}

// Get admin
function getAdmin() {
    const admin = localStorage.getItem('app_admin');
    return admin ? JSON.parse(admin) : null;
}

// Get all pembacas
function getPembacas() {
    const pembacas = localStorage.getItem('app_pembacas');
    return pembacas ? JSON.parse(pembacas) : [];
}

// Get current user
function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

// Validate admin login
function validateAdminLogin(username, password) {
    const admin = getAdmin();
    if (admin && admin.username === username && admin.password === password) {
        return admin;
    }
    return null;
}

// Validate pembaca login (username only)
function validatePembacaLogin(username) {
    const pembacas = getPembacas();
    const pembaca = pembacas.find(r => r.username === username);
    return pembaca;
}

// Check if current user is admin
function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

// Handle DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    initializeDemoUsers();
    initializeAppSettings();

    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-btn');
    const loginForms = document.querySelectorAll('.login-form');
    const errorMessage = document.getElementById('errorMessage');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');

            // Remove active class from all tabs and forms
            tabButtons.forEach(b => b.classList.remove('active'));
            loginForms.forEach(f => f.classList.remove('active-tab'));

            // Add active class to clicked tab
            this.classList.add('active');

            // Show corresponding form
            if (tabName === 'admin-tab') {
                document.getElementById('adminLoginForm').classList.add('active-tab');
            } else if (tabName === 'pembaca-tab') {
                document.getElementById('pembacaLoginForm').classList.add('active-tab');
            }

            // Clear error message
            errorMessage.classList.remove('show');
        });
    });

    // Admin Login Form
    const adminLoginForm = document.getElementById('adminLoginForm');
    adminLoginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const username = document.getElementById('admin-username').value.trim();
        const password = document.getElementById('admin-password').value.trim();

        if (!username || !password) {
            showError('Username dan password harus diisi!');
            return;
        }

        const admin = validateAdminLogin(username, password);

        if (admin) {
            // Save user session
            localStorage.setItem('currentUser', JSON.stringify({
                id: admin.id,
                username: admin.username,
                role: admin.role
            }));

            // Redirect to app
            window.location.href = 'app.html';
        } else {
            showError('Username atau password admin salah!');
        }
    });

    // Pembaca Login Form
    const pembacaLoginForm = document.getElementById('pembacaLoginForm');
    pembacaLoginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const username = document.getElementById('pembaca-username').value.trim();

        if (!username) {
            showError('Username pembaca harus diisi!');
            return;
        }

        const pembaca = validatePembacaLogin(username);

        if (pembaca) {
            // Save user session with new messages structure
            localStorage.setItem('currentUser', JSON.stringify({
                id: pembaca.id,
                username: pembaca.username,
                role: pembaca.role,
                messages: pembaca.messages || {
                    page1: 'Selamat ulang tahun!',
                    page2: 'Doa terbaik untuk mu.',
                    page3: 'Momen spesial.',
                    page4: 'Terima kasih!'
                }
            }));

            // Redirect to app
            window.location.href = 'app.html';
        } else {
            showError('Username pembaca tidak ditemukan! Hubungi admin untuk ditambahkan.');
        }
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
        
        // Clear error after 5 seconds
        setTimeout(() => {
            errorMessage.classList.remove('show');
        }, 5000);
    }
});
