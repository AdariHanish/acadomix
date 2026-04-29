// ═══════════════════════════════════════════════════════════
// Acadomix - Admin JavaScript (COMPLETE BUG-FREE VERSION)
// ═══════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', function () {
    initAdminAuth();
    initAdminCursor();
    initAdminTheme();
});

// ============ Admin Auth ============
async function verifyToken(token) {
    try {
        const response = await fetch('/api/admin/verify', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.ok;
    } catch (error) {
        return false;
    }
}

function initAdminAuth() {
    const token = localStorage.getItem('adminToken');
    const currentPath = window.location.pathname;

    // Always clear old tokens when going to login page
    if (currentPath.includes('login.html')) {
        localStorage.removeItem('adminToken');
        initLoginForm();
        return;
    }

    // On any admin page (not login)
    if (currentPath.includes('/admin/')) {
        // If token missing → force login
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        // Verify token validity
        verifyToken(token).then(valid => {
            if (!valid) {
                localStorage.removeItem('adminToken');
                window.location.href = 'login.html';
            } else {
                initAdminDashboard();
            }
        });
    }
}
// ============ Login Form ============
function initLoginForm() {
    const loginForm = document.getElementById('admin-login-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const errorEl = document.querySelector('.login-error');
        const submitBtn = loginForm.querySelector('.submit-btn');

        if (!username || !password) {
            errorEl.textContent = 'Please enter username and password';
            errorEl.classList.add('show');
            return;
        }

        errorEl.classList.remove('show');
        submitBtn.textContent = 'Logging in...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();

            if (result.success && result.token) {
                localStorage.setItem('adminToken', result.token);
                window.location.href = 'dashboard.html';
            } else {
                errorEl.textContent = result.error || 'Invalid username or password';
                errorEl.classList.add('show');
                submitBtn.textContent = 'Login →';
                submitBtn.disabled = false;
            }
        } catch (error) {
            console.error('Login error:', error);
            errorEl.textContent = 'Connection error. Please try again.';
            errorEl.classList.add('show');
            submitBtn.textContent = 'Login →';
            submitBtn.disabled = false;
        }
    });
}

// ============ Admin Dashboard Init ============
function initAdminDashboard() {
    loadStats();
    loadLeads();
    loadPayments();
    loadReviews();
    loadProjects();
    initAddProjectForm();
    initAddReviewForm();
    
    // Load dynamic settings if on dashboard
    if (document.getElementById('mini_project_price')) {
        loadAdminSettings();
    }
}

// ============ Get Auth Headers ============
function getAuthHeaders() {
    const token = localStorage.getItem('adminToken');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}

// ============ Show Loading ============
function showLoading(containerId, message = 'Loading...') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div style="padding: 50px; text-align: center;">
                <div style="display: inline-block; width: 40px; height: 40px; border: 3px solid var(--border-glass); border-top-color: var(--accent-primary); border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <p style="margin-top: 15px; color: var(--text-muted);">${message}</p>
            </div>
        `;
    }
}

// ============ Load Stats ============
async function loadStats() {
    try {
        const response = await fetch('/api/stats', {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            console.error('Failed to load stats');
            return;
        }

        const stats = await response.json();

        document.querySelectorAll('[data-stat]').forEach(el => {
            const stat = el.getAttribute('data-stat');
            if (stats[stat] !== undefined) {
                animateNumber(el, stats[stat]);
            }
        });
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

function animateNumber(element, target) {
    let current = 0;
    const duration = 1000;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        current = Math.floor(progress * target);
        element.textContent = current;

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = target;
        }
    }

    requestAnimationFrame(update);
}

// ============ Load Leads ============
async function loadLeads() {
    const container = document.getElementById('leads-table');
    if (!container) return;

    showLoading('leads-table', 'Loading responses...');

    try {
        const response = await fetch('/api/leads', {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch leads');
        }

        const leads = await response.json();

        if (!leads || leads.length === 0) {
            container.innerHTML = `
                <div style="padding: 50px; text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 15px;">📭</div>
                    <p style="color: var(--text-muted);">No enquiries yet. Form submissions will appear here.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>College</th>
                        <th>Branch</th>
                        <th>Domain</th>
                        <th>Budget</th>
                        <th>Phone</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${leads.map(lead => `
                        <tr>
                            <td><strong>${escapeHtml(lead.name)}</strong></td>
                            <td>${escapeHtml(lead.college)}</td>
                            <td>${escapeHtml(lead.branch)}</td>
                            <td>${escapeHtml(lead.project_domain)}</td>
                            <td>${escapeHtml(lead.budget)}</td>
                            <td><a href="tel:${lead.phone}" style="color: var(--accent-primary);">${escapeHtml(lead.phone)}</a></td>
                            <td><span class="status-badge ${lead.status}">${formatStatus(lead.status)}</span></td>
                            <td>${formatDate(lead.created_at)}</td>
                            <td>
                                <button class="action-btn approve" onclick="updateLeadStatus(${lead.id}, 'contacted')">Contact</button>
                                <button class="action-btn view" onclick="updateLeadStatus(${lead.id}, 'in_progress')">Progress</button>
                                <button class="action-btn approve" onclick="updateLeadStatus(${lead.id}, 'completed')">Done</button>
                                <button class="action-btn delete" onclick="deleteLead(${lead.id})">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error loading leads:', error);
        container.innerHTML = `
            <div style="padding: 50px; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 15px;">⚠️</div>
                <p style="color: var(--text-muted);">Error loading data. Please refresh the page.</p>
                <button onclick="loadLeads()" class="btn btn-primary" style="margin-top: 15px;">Retry</button>
            </div>
        `;
    }
}

async function updateLeadStatus(id, status) {
    try {
        const response = await fetch(`/api/leads/${id}/status`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status })
        });

        if (response.ok) {
            showAdminNotification('Status updated successfully', 'success');
            loadLeads();
            loadStats();
        } else {
            const error = await response.json();
            showAdminNotification(error.error || 'Error updating status', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showAdminNotification('Error updating status', 'error');
    }
}

async function deleteLead(id) {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
        const response = await fetch(`/api/leads/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (response.ok) {
            showAdminNotification('Lead deleted successfully', 'success');
            loadLeads();
            loadStats();
        } else {
            showAdminNotification('Error deleting lead', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showAdminNotification('Error deleting lead', 'error');
    }
}

// ============ Load Payments ============
async function loadPayments() {
    const container = document.getElementById('payments-table');
    if (!container) return;

    showLoading('payments-table', 'Loading payments...');

    try {
        const response = await fetch('/api/payments', {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch payments');
        }

        const payments = await response.json();

        if (!payments || payments.length === 0) {
            container.innerHTML = `
                <div style="padding: 50px; text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 15px;">💳</div>
                    <p style="color: var(--text-muted);">No payments yet. Payment submissions will appear here.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Student Name</th>
                        <th>Phone</th>
                        <th>Project</th>
                        <th>Amount</th>
                        <th>Screenshot</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${payments.map(payment => `
                        <tr>
                            <td><strong>${escapeHtml(payment.student_name)}</strong></td>
                            <td><a href="tel:${payment.phone}" style="color: var(--accent-primary);">${escapeHtml(payment.phone)}</a></td>
                            <td>${escapeHtml(payment.project_name)}</td>
                            <td><strong style="color: var(--accent-primary);">₹${payment.amount}</strong></td>
                            <td>
                                ${payment.screenshot_path ?
                `<a href="/api/payment-screenshot/${payment.id}" target="_blank" class="action-btn view">View</a>` :
                '<span style="color: var(--text-muted);">No file</span>'}
                            </td>
                            <td><span class="status-badge ${payment.status}">${formatStatus(payment.status)}</span></td>
                            <td>${formatDate(payment.created_at)}</td>
                            <td>
                                ${payment.status === 'pending' ? `
                                    <button class="action-btn approve" onclick="updatePaymentStatus(${payment.id}, 'verified')">✓ Verify</button>
                                    <button class="action-btn reject" onclick="updatePaymentStatus(${payment.id}, 'rejected')">✗ Reject</button>
                                ` : payment.status === 'verified' ? `
                                    <span style="color: #22c55e;">✓ Verified</span>
                                ` : `
                                    <span style="color: #ef4444;">✗ Rejected</span>
                                `}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error loading payments:', error);
        container.innerHTML = `
            <div style="padding: 50px; text-align: center;">
                <p style="color: var(--text-muted);">Error loading payments. Please refresh.</p>
            </div>
        `;
    }
}

async function updatePaymentStatus(id, status) {
    try {
        const response = await fetch(`/api/payments/${id}/status`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status })
        });

        if (response.ok) {
            const message = status === 'verified' ? 'Payment verified!' : 'Payment rejected';
            showAdminNotification(message, 'success');
            loadPayments();
            loadStats();
        } else {
            showAdminNotification('Error updating payment', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showAdminNotification('Error updating payment', 'error');
    }
}

// ============ Load Reviews ============
async function loadReviews() {
    const container = document.getElementById('reviews-table');
    if (!container) return;

    showLoading('reviews-table', 'Loading reviews...');

    try {
        const response = await fetch('/api/reviews/all', {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to fetch reviews');
        }

        const reviews = await response.json();

        if (!reviews || reviews.length === 0) {
            container.innerHTML = `
                <div style="padding: 50px; text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 15px;">⭐</div>
                    <p style="color: var(--text-muted);">No reviews yet. Student reviews will appear here.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Student</th>
                        <th>College</th>
                        <th>Project</th>
                        <th>Rating</th>
                        <th>Review</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${reviews.map(review => `
                        <tr>
                            <td><strong>${escapeHtml(review.student_name)}</strong><br><small style="color: var(--text-muted);">${escapeHtml(review.year_of_study)}</small></td>
                            <td>${escapeHtml(review.college_name)}</td>
                            <td>${escapeHtml(review.project_name)}</td>
                            <td style="color: #fbbf24;">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</td>
                            <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHtml(review.experience)}">${escapeHtml(review.experience)}</td>
                            <td>
                                <span class="status-badge ${review.is_approved ? 'verified' : 'pending'}">
                                    ${review.is_approved ? '✓ Approved' : 'Pending'}
                                </span>
                            </td>
                            <td>
                                ${!review.is_approved ?
                `<button class="action-btn approve" onclick="approveReview(${review.id})">Approve</button>` :
                `<button class="action-btn reject" onclick="unapproveReview(${review.id})">Hide</button>`
            }
                                <button class="action-btn delete" onclick="deleteReview(${review.id})">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error loading reviews:', error);
        container.innerHTML = `
            <div style="padding: 50px; text-align: center;">
                <p style="color: var(--text-muted);">Error loading reviews. Please refresh.</p>
            </div>
        `;
    }
}

async function approveReview(id) {
    try {
        const response = await fetch(`/api/reviews/${id}/approve`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ is_approved: true })
        });

        if (response.ok) {
            showAdminNotification('Review approved and visible to users', 'success');
            loadReviews();
            loadStats();
        } else {
            showAdminNotification('Error approving review', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showAdminNotification('Error approving review', 'error');
    }
}

async function unapproveReview(id) {
    try {
        const response = await fetch(`/api/reviews/${id}/approve`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ is_approved: false })
        });

        if (response.ok) {
            showAdminNotification('Review hidden from users', 'success');
            loadReviews();
        } else {
            showAdminNotification('Error updating review', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showAdminNotification('Error updating review', 'error');
    }
}

async function deleteReview(id) {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
        const response = await fetch(`/api/reviews/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (response.ok) {
            showAdminNotification('Review deleted', 'success');
            loadReviews();
            loadStats();
        } else {
            showAdminNotification('Error deleting review', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showAdminNotification('Error deleting review', 'error');
    }
}

// ============ Load Projects ============
async function loadProjects() {
    const container = document.getElementById('projects-table');
    if (!container) return;

    showLoading('projects-table', 'Loading projects...');

    try {
        const response = await fetch('/api/projects');

        if (!response.ok) {
            throw new Error('Failed to fetch projects');
        }

        const projects = await response.json();

        if (!projects || projects.length === 0) {
            container.innerHTML = `
                <div style="padding: 50px; text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 15px;">📁</div>
                    <p style="color: var(--text-muted);">No projects yet. Add projects using the form above.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Type</th>
                        <th>Price</th>
                        <th>Popular</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${projects.map(project => `
                        <tr>
                            <td><strong>${escapeHtml(project.title)}</strong></td>
                            <td>${formatCategory(project.category)}</td>
                            <td>${formatYearType(project.year_type)}</td>
                            <td><strong style="color: var(--accent-primary);">₹${project.price}</strong></td>
                            <td>${project.is_popular ? '<span style="color: #22c55e;">🔥 Yes</span>' : '<span style="color: var(--text-muted);">No</span>'}</td>
                             <td>
                                <button class="action-btn" onclick="editProject(${JSON.stringify(project).replace(/"/g, '&quot;')})" style="background: var(--accent-primary); margin-right: 8px;">Edit</button>
                                <button class="action-btn delete" onclick="deleteProject(${project.id})">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error loading projects:', error);
        container.innerHTML = `
            <div style="padding: 50px; text-align: center;">
                <p style="color: var(--text-muted);">Error loading projects. Please refresh.</p>
            </div>
        `;
    }
}

async function deleteProject(id) {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
        const response = await fetch(`/api/projects/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (response.ok) {
            showAdminNotification('Project deleted', 'success');
            loadProjects();
            loadStats();
        } else {
            showAdminNotification('Error deleting project', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showAdminNotification('Error deleting project', 'error');
    }
}

// ============ Pricing Settings ============
async function loadAdminSettings() {
    try {
        const response = await fetch('/api/settings');
        const settings = await response.json();
        
        if (settings.mini_project_price) document.getElementById('mini_project_price').value = settings.mini_project_price;
        if (settings.major_project_price) document.getElementById('major_project_price').value = settings.major_project_price;
        if (settings.custom_project_price) document.getElementById('custom_project_price').value = settings.custom_project_price;
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

async function saveSettings() {
    const btn = document.getElementById('save-settings-btn');
    const mini = document.getElementById('mini_project_price').value;
    const major = document.getElementById('major_project_price').value;
    const custom = document.getElementById('custom_project_price').value;
    
    if (!mini || !major || !custom) {
        showAdminNotification('Please fill all prices', 'error');
        return;
    }
    
    btn.textContent = 'Saving...';
    btn.disabled = true;
    
    try {
        const response = await fetch('/api/settings', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify({
                mini_project_price: mini,
                major_project_price: major,
                custom_project_price: custom
            })
        });
        
        if (response.ok) {
            showAdminNotification('Prices updated successfully!', 'success');
        } else {
            const result = await response.json();
            throw new Error(result.details || result.error || 'Failed to update prices');
        }
    } catch (error) {
        showAdminNotification('Error: ' + error.message, 'error');
    } finally {
        btn.textContent = 'Save Prices';
        btn.disabled = false;
    }
}

// ============ Add Project Form ============
// Edit project functionality
function editProject(project) {
    // Fill the form with project data
    document.getElementById('title').value = project.title;
    document.getElementById('category').value = project.category;
    document.getElementById('year_type').value = project.year_type;
    document.getElementById('price').value = project.price;
    document.getElementById('features').value = project.features;
    document.getElementById('is_popular').checked = project.is_popular;
    document.getElementById('description').value = project.description;
    
    // Change form button to "Update"
    const form = document.getElementById('add-project-form');
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Update Project →';
    
    // Store editing ID
    form.dataset.editId = project.id;
    
    // Scroll to form
    const formContainer = form.closest('div');
    if (formContainer) formContainer.scrollIntoView({ behavior: 'smooth' });
}

function initAddProjectForm() {
    const form = document.getElementById('add-project-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const editId = form.dataset.editId;
        
        const data = {
            title: document.getElementById('title').value.trim(),
            category: document.getElementById('category').value,
            year_type: document.getElementById('year_type').value,
            price: document.getElementById('price').value,
            features: document.getElementById('features').value.trim(),
            is_popular: document.getElementById('is_popular').checked,
            description: document.getElementById('description').value.trim()
        };

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = editId ? 'Updating...' : 'Adding...';
        submitBtn.disabled = true;

        try {
            const url = editId ? `/api/projects/${editId}` : '/api/projects';
            const method = editId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: getAuthHeaders(),
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                showAdminNotification(editId ? 'Project updated!' : 'Project added!', 'success');
                form.reset();
                delete form.dataset.editId;
                submitBtn.textContent = 'Add Project →';
                loadProjects();
                loadStats();
            } else {
                showAdminNotification(result.error || 'Error saving project', 'error');
                submitBtn.textContent = originalText;
            }
        } catch (error) {
            console.error('Error saving project:', error);
            showAdminNotification('Connection error', 'error');
            submitBtn.textContent = originalText;
        } finally {
            submitBtn.disabled = false;
        }
    });
}

// ============ Logout ============
function logout() {
    localStorage.removeItem('adminToken');
    sessionStorage.clear();
    window.location.href = 'login.html';
}

// ============ Admin Cursor ============
function initAdminCursor() {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

    let cursor = document.querySelector('.cursor');
    let cursorGlow = document.querySelector('.cursor-glow');

    if (!cursor) {
        cursor = document.createElement('div');
        cursor.className = 'cursor';
        document.body.appendChild(cursor);
    }

    if (!cursorGlow) {
        cursorGlow = document.createElement('div');
        cursorGlow.className = 'cursor-glow';
        document.body.appendChild(cursorGlow);
    }

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animate() {
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;

        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';
        cursorGlow.style.left = cursorX + 'px';
        cursorGlow.style.top = cursorY + 'px';

        requestAnimationFrame(animate);
    }
    animate();

    document.addEventListener('mouseover', (e) => {
        if (e.target.closest('a, button, input, select, textarea, tr, .action-btn, label')) {
            cursor.classList.add('hovering');
            cursorGlow.classList.add('hovering');
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.closest('a, button, input, select, textarea, tr, .action-btn, label')) {
            cursor.classList.remove('hovering');
            cursorGlow.classList.remove('hovering');
        }
    });
}

// ============ Admin Theme ============
function initAdminTheme() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
}

// ============ Helper Functions ============
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

function formatStatus(status) {
    const map = {
        'new': 'New',
        'contacted': 'Contacted',
        'in_progress': 'In Progress',
        'completed': 'Completed',
        'pending': 'Pending',
        'verified': 'Verified',
        'rejected': 'Rejected'
    };
    return map[status] || status;
}

function formatCategory(category) {
    const map = {
        'aiml': 'AI/ML',
        'datascience': 'Data Science',
        'fullstack': 'Full Stack',
        'cybersecurity': 'Cybersecurity',
        'python': 'Python'
    };
    return map[category] || category;
}

function formatYearType(yearType) {
    const map = {
        'mini': 'Mini Project',
        'third': '3rd Year',
        'major': 'Major Project'
    };
    return map[yearType] || yearType;
}

// ============ Admin Notification ============
function showAdminNotification(message, type = 'info') {
    document.querySelectorAll('.notification').forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 4000);
}

// ============ Add Required CSS ============
const adminStyles = document.createElement('style');
adminStyles.textContent = `
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 15px;
        z-index: 100000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    }
    
    .notification.success {
        background: rgba(34, 197, 94, 0.95);
        color: white;
    }
    
    .notification.error {
        background: rgba(239, 68, 68, 0.95);
        color: white;
    }
    
    .notification.info {
        background: rgba(59, 130, 246, 0.95);
        color: white;
    }
    
    .notification button {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        line-height: 1;
        opacity: 0.8;
    }
    
    .notification button:hover {
        opacity: 1;
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(adminStyles);

// ============ Global Function Exports ============
window.logout = logout;
window.updateLeadStatus = updateLeadStatus;
window.deleteLead = deleteLead;
window.updatePaymentStatus = updatePaymentStatus;
window.approveReview = approveReview;
window.unapproveReview = unapproveReview;
window.deleteReview = deleteReview;
window.deleteProject = deleteProject;
window.loadLeads = loadLeads;
window.loadPayments = loadPayments;
window.loadReviews = loadReviews;
window.loadProjects = loadProjects;
window.editProject = editProject;
window.saveSettings = saveSettings;
window.uploadAsset = uploadAsset;
// ============ Manual Review Management ============
function openAddReviewModal() {
    const modal = document.getElementById('add-review-modal'); if (modal) modal.classList.add('show');
}

function closeAddReviewModal() {
    const modal = document.getElementById('add-review-modal'); if (modal) modal.classList.remove('show');
}

function initAddReviewForm() {
    const form = document.getElementById('add-review-form'); if (!form) return; form.addEventListener('submit', async (e) => {
        e.preventDefault(); const reviewData = {
            student_name: document.getElementById('review-student-name').value,
            college_name: document.getElementById('review-college-name').value,
            year_of_study: document.getElementById('review-year').value,
            rating: parseInt(document.getElementById('review-rating').value),
            project_name: document.getElementById('review-project-name').value,
            experience: document.getElementById('review-experience').value
        }; try {
            const response = await fetch('/api/reviews/admin', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(reviewData)
            }); if (response.ok) {
                showAdminNotification('Review added successfully!', 'success'); form.reset(); closeAddReviewModal(); loadReviews(); loadStats();
            } else {
                const error = await response.json(); showAdminNotification(error.error || 'Error adding review', 'error');
            }
        } catch (error) {
            console.error('Error:', error); showAdminNotification('Error adding review', 'error');
        }
    });
}

window.openAddReviewModal = openAddReviewModal; window.closeAddReviewModal = closeAddReviewModal; EOF

// ============ Asset Management ============
async function uploadAsset(event, assetName) {
    event.preventDefault();
    const input = document.getElementById(${assetName === 'logo' ? 'logo' : 'qr'}-input);
    const file = input.files[0];
    
    if (!file) {
        showAdminNotification('Please select a file', 'error');
        return;
    }

    const btn = event.target.querySelector('button');
    const originalText = btn.textContent;
    btn.textContent = 'Uploading...';
    btn.disabled = true;

    const formData = new FormData();
    formData.append('asset_name', assetName);
    formData.append('asset_file', file);

    try {
        const response = await fetch('/api/admin/assets', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('adminToken')
            },
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            showAdminNotification(${assetName} updated successfully!, 'success');
            const preview = document.getElementById(dmin--preview);
            if (preview) preview.src = /api/assets/?t=;
            input.value = '';
        } else {
            showAdminNotification(result.error || 'Upload failed', 'error');
        }
    } catch (error) {
        console.error('Error uploading asset:', error);
        showAdminNotification('Error uploading asset', 'error');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

window.uploadAsset = uploadAsset;
