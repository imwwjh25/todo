// TodoMaster - 待办事项管理系统前端应用
// API 基础路径
const API_BASE = '/api/v1';

// 全局状态
let categories = [];
let currentPage = 1;
let pageSize = 10;
let totalPages = 0;
let currentFilters = {};
let currentUser = null;  // 当前用户信息

// Chart 实例
let charts = {
    priority: null,
    category: null,
    trend: null,
    categoryStats: null,
    priorityStats: null
};

// ==================== Authentication Functions ====================

/**
 * 检查登录状态，未登录则跳转到登录页
 */
function checkAuth() {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

/**
 * 初始化用户信息
 */
async function initUser() {
    const nickname = localStorage.getItem('user_nickname');
    const nicknameEl = document.getElementById('user-nickname');
    if (nickname && nicknameEl) {
        nicknameEl.textContent = nickname;
    }

    // 验证 Token 是否有效
    try {
        currentUser = await apiGet('/auth/user');
        if (nicknameEl) {
            nicknameEl.textContent = currentUser.nickname || currentUser.username;
        }
    } catch (error) {
        // Token 无效，跳转登录页
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_nickname');
        window.location.href = 'login.html';
    }
}

/**
 * 退出登录
 */
function handleLogout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_nickname');
    window.location.href = 'login.html';
}

// ==================== Theme Management ====================

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');

    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon(theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const sunIcon = document.getElementById('theme-icon-sun');
    const moonIcon = document.getElementById('theme-icon-moon');

    if (theme === 'dark') {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    } else {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    }
}

// ==================== Tab Navigation ====================

function switchTab(tabName) {
    // Hide all views
    document.querySelectorAll('.view-section').forEach(view => {
        view.classList.add('hidden');
    });

    // Remove active from all tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
        tab.setAttribute('aria-selected', 'false');
    });

    // Show selected view
    const view = document.getElementById(`view-${tabName}`);
    if (view) {
        view.classList.remove('hidden');
    }

    // Activate selected tab
    const tab = document.getElementById(`tab-${tabName}`);
    if (tab) {
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
    }

    // Load data for the view
    switch (tabName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'tasks':
            loadTasks();
            break;
        case 'categories':
            loadCategories();
            break;
        case 'statistics':
            initDateRange();
            loadStatistics();
            break;
    }
}

// ==================== Modal Functions ====================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        // Focus first input for accessibility
        const firstInput = modal.querySelector('input:not([type="hidden"]), select');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

function openAddTaskModal() {
    populateCategoryDropdown('task-category');
    openModal('modal-add-task');
}

function openAddCategoryModal() {
    openModal('modal-add-category');
}

function openEditTaskModal(task) {
    populateCategoryDropdown('edit-task-category');

    document.getElementById('edit-task-id').value = task.id;
    document.getElementById('edit-task-title').value = task.title;
    document.getElementById('edit-task-description').value = task.description || '';
    document.getElementById('edit-task-category').value = task.categoryId || '';
    document.getElementById('edit-task-priority').value = task.priority;
    document.getElementById('edit-task-due-date').value = task.dueDate || '';

    openModal('modal-edit-task');
}

// ==================== API Helper Functions ====================

async function apiGet(endpoint) {
    const token = localStorage.getItem('auth_token');
    const headers = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, { headers });
    const data = await response.json();

    if (data.code === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_nickname');
        window.location.href = 'login.html';
        throw new Error('未登录');
    }

    if (data.code === 200) {
        return data.data;
    }
    throw new Error(data.message || 'API error');
}

async function apiPost(endpoint, body) {
    const token = localStorage.getItem('auth_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
    });
    const data = await response.json();

    if (data.code === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_nickname');
        window.location.href = 'login.html';
        throw new Error('未登录');
    }

    if (data.code === 200) {
        return data.data;
    }
    throw new Error(data.message || 'API error');
}

async function apiPut(endpoint, body) {
    const token = localStorage.getItem('auth_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body)
    });
    const data = await response.json();

    if (data.code === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_nickname');
        window.location.href = 'login.html';
        throw new Error('未登录');
    }

    if (data.code === 200) {
        return data.data;
    }
    throw new Error(data.message || 'API error');
}

async function apiDelete(endpoint) {
    const token = localStorage.getItem('auth_token');
    const headers = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'DELETE',
        headers
    });
    const data = await response.json();

    if (data.code === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_nickname');
        window.location.href = 'login.html';
        throw new Error('未登录');
    }

    if (data.code === 200) {
        return data.data;
    }
    throw new Error(data.message || 'API error');
}

// ==================== Dashboard Functions ====================

async function loadDashboard() {
    try {
        const [todoStats, priorityStats, todosData, categoriesData] = await Promise.all([
            apiGet('/statistics/by-category'),
            apiGet('/statistics/by-priority'),
            apiGet('/todo-items?page=0&size=5'),
            apiGet('/categories')
        ]);

        const totalTasks = todoStats.reduce((sum, cat) => sum + cat.totalCount, 0);
        const completedTasks = todoStats.reduce((sum, cat) => sum + cat.completedCount, 0);
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        document.getElementById('stat-total').textContent = totalTasks;
        document.getElementById('stat-completed').textContent = completedTasks;
        document.getElementById('stat-rate').textContent = `${completionRate}%`;
        document.getElementById('stat-categories').textContent = categoriesData.length;

        const recentTasks = todosData.content || [];
        renderRecentTasks(recentTasks);

        renderPriorityChart(priorityStats);
        renderCategoryChart(todoStats);

        categories = categoriesData;

    } catch (error) {
        console.error('Failed to load dashboard:', error);
        showError('加载仪表板失败');
    }
}

function renderRecentTasks(tasks) {
    const container = document.getElementById('recent-tasks');
    if (tasks.length === 0) {
        container.innerHTML = '<div class="empty-state">暂无任务</div>';
        return;
    }

    container.innerHTML = tasks.map(task => createTaskItem(task, true)).join('');
}

function getChartColors() {
    const theme = document.documentElement.getAttribute('data-theme');
    return {
        text: theme === 'dark' ? '#f5f5f7' : '#1d1d1f',
        muted: theme === 'dark' ? 'rgba(255,255,255,0.48)' : 'rgba(0,0,0,0.48)',
        grid: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        accent: theme === 'dark' ? '#2997ff' : '#0071e3',
        success: '#34c759',
        warning: '#ff9500',
        danger: '#ff3b30'
    };
}

function renderPriorityChart(data) {
    const ctx = document.getElementById('chart-priority');
    if (!ctx) return;

    if (charts.priority) {
        charts.priority.destroy();
    }

    const colors = getChartColors();
    const priorityColors = {
        2: colors.danger,
        1: colors.warning,
        0: colors.success
    };

    charts.priority = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.map(d => d.priorityName || getPriorityLabel(d.priority)),
            datasets: [{
                data: data.map(d => d.totalCount),
                backgroundColor: data.map(d => priorityColors[d.priority] || '#6B7280'),
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: colors.text,
                        padding: 16,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                }
            },
            cutout: '60%'
        }
    });
}

function renderCategoryChart(data) {
    const ctx = document.getElementById('chart-category');
    if (!ctx) return;

    if (charts.category) {
        charts.category.destroy();
    }

    const colors = getChartColors();

    charts.category = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.categoryName || '未分类'),
            datasets: [
                {
                    label: '已完成',
                    data: data.map(d => d.completedCount),
                    backgroundColor: colors.success
                },
                {
                    label: '待完成',
                    data: data.map(d => d.totalCount - d.completedCount),
                    backgroundColor: colors.accent
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: colors.text,
                        padding: 16,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    grid: { display: false },
                    ticks: { color: colors.text }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    grid: { color: colors.grid },
                    ticks: { color: colors.text }
                }
            }
        }
    });
}

// ==================== Tasks Functions ====================

async function loadTasks() {
    try {
        const params = new URLSearchParams({
            page: currentPage - 1,
            size: pageSize,
            ...currentFilters
        });

        const response = await apiGet(`/todo-items?${params}`);
        const tasks = response.content || [];
        totalPages = response.totalPages || 1;

        renderTasksList(tasks);
        renderPagination();

        if (categories.length === 0) {
            categories = await apiGet('/categories');
            populateCategoryDropdown('filter-category', true);
        }

    } catch (error) {
        console.error('Failed to load tasks:', error);
        showError('加载任务列表失败');
    }
}

function renderTasksList(tasks) {
    const container = document.getElementById('tasks-list');
    if (tasks.length === 0) {
        container.innerHTML = '<div class="empty-state">暂无任务</div>';
        return;
    }

    container.innerHTML = tasks.map(task => createTaskItem(task)).join('');
}

function createTaskItem(task, isCompact = false) {
    const isCompleted = task.status === 1;
    const statusClass = isCompleted ? 'task-status-completed' : 'task-status-pending';
    const statusText = isCompleted ? '已完成' : '待完成';
    const priorityKey = getPriorityKey(task.priority);
    const priorityClass = `task-priority-${priorityKey}`;
    const priorityText = task.priorityName || getPriorityLabel(task.priority);

    const dueDate = task.dueDate ? formatDate(task.dueDate) : '';
    const taskJson = JSON.stringify(task).replace(/"/g, '&quot;');

    if (isCompact) {
        return `
            <div class="task-item task-compact ${isCompleted ? 'completed' : ''}">
                <div style="display:flex; align-items:center; gap:12px; flex:1">
                    <button
                        onclick="toggleComplete(${task.id}, ${task.status})"
                        class="task-checkbox ${isCompleted ? 'checked' : ''}"
                        aria-label="${isCompleted ? '标记为未完成' : '标记为完成'}"
                    >
                        ${isCompleted ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg>' : ''}
                    </button>
                    <div class="task-content" style="padding-left:0">
                        <p class="task-title">${task.title}</p>
                        ${dueDate ? `<p class="task-due">截止: ${dueDate}</p>` : ''}
                    </div>
                </div>
                <span class="task-status ${statusClass}">${statusText}</span>
            </div>
        `;
    }

    return `
        <div class="task-item ${isCompleted ? 'completed' : ''}">
            <div style="display:flex; align-items:center; gap:16px; flex:1">
                <button
                    onclick="toggleComplete(${task.id}, ${task.status})"
                    class="task-checkbox ${isCompleted ? 'checked' : ''}"
                    aria-label="${isCompleted ? '标记为未完成' : '标记为完成'}"
                >
                    ${isCompleted ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg>' : ''}
                </button>
                <div class="task-content">
                    <p class="task-title">${task.title}</p>
                    ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
                    <div class="task-meta">
                        <span class="task-tag ${priorityClass}">${priorityText}</span>
                        ${task.categoryName ? `<span class="task-tag task-category">${task.categoryName}</span>` : ''}
                        ${dueDate ? `<span class="task-due">截止: ${dueDate}</span>` : ''}
                    </div>
                </div>
            </div>
            <div style="display:flex; align-items:center; gap:12px">
                <span class="task-status ${statusClass}">${statusText}</span>
                <div class="task-actions">
                    <button
                        onclick="openEditTaskModal(${taskJson})"
                        class="task-action-btn"
                        aria-label="编辑任务"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button
                        onclick="deleteTask(${task.id})"
                        class="task-action-btn delete"
                        aria-label="删除任务"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderPagination() {
    const container = document.getElementById('pagination');
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '';

    html += `
        <button onclick="goToPage(${currentPage - 1})" class="page-btn ${currentPage === 1 ? '' : ''}" ${currentPage === 1 ? 'disabled' : ''}>
            上一页
        </button>
    `;

    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
        html += `
            <button onclick="goToPage(${i})" class="page-btn ${i === currentPage ? 'active' : ''}">
                ${i}
            </button>
        `;
    }

    html += `
        <button onclick="goToPage(${currentPage + 1})" class="page-btn" ${currentPage === totalPages ? 'disabled' : ''}>
            下一页
        </button>
    `;

    container.innerHTML = html;
}

function goToPage(page) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    loadTasks();
}

function searchTasks() {
    const searchInput = document.getElementById('search-input');
    currentFilters.title = searchInput.value;
    currentPage = 1;
    loadTasks();
}

function filterTasks() {
    const category = document.getElementById('filter-category').value;
    const priority = document.getElementById('filter-priority').value;
    const status = document.getElementById('filter-status').value;

    currentFilters = {};
    if (category) currentFilters.categoryId = category;
    if (priority) currentFilters.priority = priority;
    if (status) currentFilters.status = status;

    currentPage = 1;
    loadTasks();
}

async function toggleComplete(taskId, currentStatus) {
    try {
        if (currentStatus === 1) {
            const task = await apiGet(`/todo-items/${taskId}`);
            await apiPut(`/todo-items/${taskId}`, {
                title: task.title,
                description: task.description,
                categoryId: task.categoryId,
                priority: task.priority,
                dueDate: task.dueDate,
                status: 0
            });
        } else {
            await apiPut(`/todo-items/${taskId}/complete`);
        }

        const currentView = document.querySelector('.view-section:not(.hidden)').id.replace('view-', '');
        switch (currentView) {
            case 'dashboard':
                loadDashboard();
                break;
            case 'tasks':
                loadTasks();
                break;
        }

    } catch (error) {
        console.error('Failed to toggle task status:', error);
        showError('操作失败');
    }
}

async function deleteTask(taskId) {
    if (!confirm('确定要删除这个任务吗？')) return;

    try {
        await apiDelete(`/todo-items/${taskId}`);
        loadTasks();
    } catch (error) {
        console.error('Failed to delete task:', error);
        showError('删除失败');
    }
}

async function submitAddTask(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    const taskData = {
        title: formData.get('title'),
        description: formData.get('description'),
        categoryId: formData.get('categoryId') ? parseInt(formData.get('categoryId')) : null,
        priority: parseInt(formData.get('priority')),
        dueDate: formData.get('dueDate') || null
    };

    try {
        await apiPost('/todo-items', taskData);
        closeModal('modal-add-task');
        form.reset();

        const currentView = document.querySelector('.view-section:not(.hidden)').id.replace('view-', '');
        if (currentView === 'dashboard') {
            loadDashboard();
        } else if (currentView === 'tasks') {
            loadTasks();
        }
    } catch (error) {
        console.error('Failed to create task:', error);
        showError('创建任务失败');
    }
}

async function submitEditTask(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    const taskId = formData.get('id');
    const taskData = {
        title: formData.get('title'),
        description: formData.get('description'),
        categoryId: formData.get('categoryId') ? parseInt(formData.get('categoryId')) : null,
        priority: parseInt(formData.get('priority')),
        dueDate: formData.get('dueDate') || null
    };

    try {
        await apiPut(`/todo-items/${taskId}`, taskData);
        closeModal('modal-edit-task');
        loadTasks();
    } catch (error) {
        console.error('Failed to update task:', error);
        showError('更新任务失败');
    }
}

// ==================== Categories Functions ====================

async function loadCategories() {
    try {
        categories = await apiGet('/categories');
        renderCategoriesList(categories);
    } catch (error) {
        console.error('Failed to load categories:', error);
        showError('加载分类失败');
    }
}

function renderCategoriesList(categories) {
    const container = document.getElementById('categories-list');
    if (categories.length === 0) {
        container.innerHTML = '<div class="empty-state">暂无分类</div>';
        return;
    }

    container.innerHTML = categories.map(cat => `
        <div class="category-card">
            <div style="display:flex; justify-content:space-between; align-items:start">
                <div>
                    <h3 class="category-name">${cat.name}</h3>
                    ${cat.description ? `<p class="category-desc">${cat.description}</p>` : ''}
                    <p class="category-count">任务数: ${cat.taskCount || 0}</p>
                </div>
                <div class="task-actions">
                    <button onclick="editCategory(${cat.id})" class="task-action-btn" aria-label="编辑分类">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button onclick="deleteCategory(${cat.id})" class="task-action-btn delete" aria-label="删除分类">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

async function submitAddCategory(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    const categoryData = {
        name: formData.get('name'),
        description: formData.get('description')
    };

    try {
        await apiPost('/categories', categoryData);
        closeModal('modal-add-category');
        form.reset();
        loadCategories();
    } catch (error) {
        console.error('Failed to create category:', error);
        showError('创建分类失败');
    }
}

async function deleteCategory(categoryId) {
    if (!confirm('确定要删除这个分类吗？关联的任务将变为未分类状态。')) return;

    try {
        await apiDelete(`/categories/${categoryId}`);
        loadCategories();
    } catch (error) {
        console.error('Failed to delete category:', error);
        showError('删除分类失败');
    }
}

async function editCategory(categoryId) {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    const newName = prompt('输入新的分类名称:', category.name);
    if (newName && newName !== category.name) {
        try {
            await apiPut(`/categories/${categoryId}`, {
                name: newName,
                description: category.description
            });
            loadCategories();
        } catch (error) {
            console.error('Failed to update category:', error);
            showError('更新分类失败');
        }
    }
}

// ==================== Statistics Functions ====================

function initDateRange() {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    document.getElementById('date-start').value = formatDateISO(startOfMonth);
    document.getElementById('date-end').value = formatDateISO(today);
}

async function loadStatistics() {
    const startDate = document.getElementById('date-start').value;
    const endDate = document.getElementById('date-end').value;

    try {
        const [trend, categoryStats, priorityStats, completionTime] = await Promise.all([
            apiGet(`/statistics/trend?period=daily&start=${startDate}&end=${endDate}`),
            apiGet('/statistics/by-category'),
            apiGet('/statistics/by-priority'),
            apiGet('/statistics/completion-time')
        ]);

        renderTrendChart(trend);
        renderCategoryStatsChart(categoryStats);
        renderPriorityStatsChart(priorityStats);
        renderCompletionTimeStats(completionTime);

    } catch (error) {
        console.error('Failed to load statistics:', error);
        showError('加载统计数据失败');
    }
}

function renderTrendChart(data) {
    const ctx = document.getElementById('chart-trend');
    if (!ctx) return;

    if (charts.trend) {
        charts.trend.destroy();
    }

    const colors = getChartColors();
    const labels = data.dailyStats?.map(d => formatDate(d.date)) || data.labels || [];
    const createdData = data.dailyStats?.map(d => d.created) || data.created || [];
    const completedData = data.dailyStats?.map(d => d.completed) || data.completed || [];

    charts.trend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '新建任务',
                    data: createdData,
                    borderColor: colors.accent,
                    backgroundColor: colors.accent + '20',
                    fill: true,
                    tension: 0.3
                },
                {
                    label: '完成任务',
                    data: completedData,
                    borderColor: colors.success,
                    backgroundColor: colors.success + '20',
                    fill: true,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: colors.text,
                        padding: 16,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: colors.text }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: colors.grid },
                    ticks: { color: colors.text }
                }
            }
        }
    });
}

function renderCategoryStatsChart(data) {
    const ctx = document.getElementById('chart-category-stats');
    if (!ctx) return;

    if (charts.categoryStats) {
        charts.categoryStats.destroy();
    }

    const colors = getChartColors();
    const palette = [
        colors.accent, colors.success, colors.warning, colors.danger,
        '#5e5ce6', '#bf5af2', '#fe3d71', '#30d158'
    ];

    charts.categoryStats = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.map(d => d.categoryName || '未分类'),
            datasets: [{
                data: data.map(d => d.totalCount),
                backgroundColor: palette,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: colors.text,
                        padding: 16,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                }
            }
        }
    });
}

function renderPriorityStatsChart(data) {
    const ctx = document.getElementById('chart-priority-stats');
    if (!ctx) return;

    if (charts.priorityStats) {
        charts.priorityStats.destroy();
    }

    const colors = getChartColors();
    const priorityColors = {
        2: colors.danger,
        1: colors.warning,
        0: colors.success
    };

    charts.priorityStats = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.priorityName || getPriorityLabel(d.priority)),
            datasets: [{
                label: '任务数',
                data: data.map(d => d.totalCount),
                backgroundColor: data.map(d => priorityColors[d.priority] || '#6B7280'),
                borderWidth: 0,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: colors.text }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: colors.grid },
                    ticks: { color: colors.text }
                }
            }
        }
    });
}

function renderCompletionTimeStats(data) {
    const container = document.getElementById('completion-time-stats');
    container.innerHTML = `
        <div class="stat-item">
            <span class="stat-item-label">平均完成时间</span>
            <span class="stat-item-value">${data.averageDays || 0} 天</span>
        </div>
        <div class="stat-item">
            <span class="stat-item-label">最快完成时间</span>
            <span class="stat-item-value" style="color:var(--success)">${data.minDays || 0} 天</span>
        </div>
        <div class="stat-item">
            <span class="stat-item-label">最长完成时间</span>
            <span class="stat-item-value" style="color:var(--warning)">${data.maxDays || 0} 天</span>
        </div>
        <div class="stat-item">
            <span class="stat-item-label">已完成任务数</span>
            <span class="stat-item-value">${data.totalCompleted || 0}</span>
        </div>
    `;
}

// ==================== Helper Functions ====================

function populateCategoryDropdown(dropdownId, includeEmptyOption = false) {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;

    let html = includeEmptyOption ? '<option value="">所有分类</option>' : '<option value="">选择分类</option>';
    html += categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
    dropdown.innerHTML = html;
}

function getPriorityKey(priority) {
    const keys = { 2: 'high', 1: 'medium', 0: 'low' };
    return keys[priority] || 'low';
}

function getPriorityLabel(priority) {
    const labels = {
        2: '高优先级',
        1: '中优先级',
        0: '低优先级',
        HIGH: '高优先级',
        MEDIUM: '中优先级',
        LOW: '低优先级'
    };
    return labels[priority] || priority;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
}

function formatDateISO(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
}

function showError(message) {
    alert(message);
}

// ==================== Initialization ====================

document.addEventListener('DOMContentLoaded', () => {
    // 检查登录状态
    if (!checkAuth()) return;

    initTheme();
    initUser();
    loadDashboard();
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(modal => {
            modal.classList.remove('active');
        });
    }
});

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        updateThemeIcon(newTheme);
    }
});