// TodoMaster - 待办事项管理系统前端应用
// API 基础路径
const API_BASE = '/api/v1';

// 全局状态
let categories = [];
let currentPage = 1;
let pageSize = 10;
let totalPages = 0;
let currentFilters = {};

// Chart 实例
let charts = {
    priority: null,
    category: null,
    trend: null,
    categoryStats: null,
    priorityStats: null
};

// ==================== Tab Navigation ====================

function switchTab(tabName) {
    // Hide all views
    document.querySelectorAll('.view-section').forEach(view => {
        view.classList.add('hidden');
    });

    // Remove active from all tabs
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.classList.remove('tab-active');
        tab.classList.add('text-gray-500');
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
        tab.classList.add('tab-active');
        tab.classList.remove('text-gray-500');
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
        modal.classList.remove('hidden');
        modal.classList.add('flex');
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
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function openAddTaskModal() {
    // Populate category dropdown
    populateCategoryDropdown('task-category');
    openModal('modal-add-task');
}

function openAddCategoryModal() {
    openModal('modal-add-category');
}

function openEditTaskModal(task) {
    // Populate category dropdown
    populateCategoryDropdown('edit-task-category');

    // Fill form with task data
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
    const response = await fetch(`${API_BASE}${endpoint}`);
    const data = await response.json();
    if (data.code === 200) {
        return data.data;
    }
    throw new Error(data.message || 'API error');
}

async function apiPost(endpoint, body) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    const data = await response.json();
    if (data.code === 200) {
        return data.data;
    }
    throw new Error(data.message || 'API error');
}

async function apiPut(endpoint, body) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    const data = await response.json();
    if (data.code === 200) {
        return data.data;
    }
    throw new Error(data.message || 'API error');
}

async function apiDelete(endpoint) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'DELETE'
    });
    const data = await response.json();
    if (data.code === 200) {
        return data.data;
    }
    throw new Error(data.message || 'API error');
}

// ==================== Dashboard Functions ====================

async function loadDashboard() {
    try {
        // Load statistics
        const [todoStats, priorityStats, todosData, categoriesData] = await Promise.all([
            apiGet('/statistics/by-category'),
            apiGet('/statistics/by-priority'),
            apiGet('/todo-items?page=0&size=5'),
            apiGet('/categories')
        ]);

        // Calculate dashboard stats
        const totalTasks = todoStats.reduce((sum, cat) => sum + cat.totalCount, 0);
        const completedTasks = todoStats.reduce((sum, cat) => sum + cat.completedCount, 0);
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        // Update stat cards
        document.getElementById('stat-total').textContent = totalTasks;
        document.getElementById('stat-completed').textContent = completedTasks;
        document.getElementById('stat-rate').textContent = `${completionRate}%`;
        document.getElementById('stat-categories').textContent = categoriesData.length;

        // Render recent tasks - use content field from pagination response
        const recentTasks = todosData.content || [];
        renderRecentTasks(recentTasks);

        // Render priority chart
        renderPriorityChart(priorityStats);

        // Render category chart
        renderCategoryChart(todoStats);

        // Store categories globally
        categories = categoriesData;

    } catch (error) {
        console.error('Failed to load dashboard:', error);
        showError('加载仪表板失败');
    }
}

function renderRecentTasks(tasks) {
    const container = document.getElementById('recent-tasks');
    if (tasks.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">暂无任务</p>';
        return;
    }

    container.innerHTML = tasks.map(task => createTaskItem(task, true)).join('');
}

function renderPriorityChart(data) {
    const ctx = document.getElementById('chart-priority');
    if (!ctx) return;

    if (charts.priority) {
        charts.priority.destroy();
    }

    // API uses integer: 0=LOW, 1=MEDIUM, 2=HIGH
    const colors = {
        2: '#DC2626',  // HIGH - red
        1: '#F59E0B',  // MEDIUM - yellow
        0: '#10B981'   // LOW - green
    };

    charts.priority = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.map(d => d.priorityName || getPriorityLabel(d.priority)),
            datasets: [{
                data: data.map(d => d.totalCount),
                backgroundColor: data.map(d => colors[d.priority] || '#6B7280'),
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function renderCategoryChart(data) {
    const ctx = document.getElementById('chart-category');
    if (!ctx) return;

    if (charts.category) {
        charts.category.destroy();
    }

    charts.category = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.categoryName || '未分类'),
            datasets: [
                {
                    label: '已完成',
                    data: data.map(d => d.completedCount),
                    backgroundColor: '#0D9488'
                },
                {
                    label: '待完成',
                    data: data.map(d => d.totalCount - d.completedCount),
                    backgroundColor: '#14B8A6'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                x: { stacked: true },
                y: { stacked: true, beginAtZero: true }
            }
        }
    });
}

// ==================== Tasks Functions ====================

async function loadTasks() {
    try {
        const params = new URLSearchParams({
            page: currentPage - 1,  // API uses 0-based page
            size: pageSize,
            ...currentFilters
        });

        const response = await apiGet(`/todo-items?${params}`);
        const tasks = response.content || [];
        totalPages = response.totalPages || 1;

        renderTasksList(tasks);
        renderPagination();

        // Load categories for filter
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
        container.innerHTML = '<p class="text-gray-500 text-center py-8">暂无任务</p>';
        return;
    }

    container.innerHTML = tasks.map(task => createTaskItem(task)).join('');
}

function createTaskItem(task, isCompact = false) {
    // API uses integer: status 0=PENDING, 1=COMPLETED; priority 0=LOW, 1=MEDIUM, 2=HIGH
    const isCompleted = task.status === 1;
    const statusClass = isCompleted ? 'status-completed' : 'status-pending';
    const statusText = isCompleted ? '已完成' : '待完成';
    const priorityClass = `priority-${getPriorityKey(task.priority)}`;
    const priorityText = task.priorityName || getPriorityLabel(task.priority);

    const dueDate = task.dueDate ? formatDate(task.dueDate) : '';

    if (isCompact) {
        return `
            <div class="flex items-center justify-between p-3 border border-gray-200 rounded-lg transition-smooth hover:border-primary">
                <div class="flex items-center space-x-3">
                    <button
                        onclick="toggleComplete(${task.id}, ${task.status})"
                        class="w-5 h-5 rounded border-2 ${isCompleted ? 'bg-primary border-primary' : 'border-gray-300'} transition-smooth cursor-pointer flex items-center justify-center focus-ring"
                        aria-label="${isCompleted ? '标记为未完成' : '标记为完成'}"
                    >
                        ${isCompleted ? '<svg class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg>' : ''}
                    </button>
                    <div>
                        <p class="text-sm font-medium text-text ${isCompleted ? 'opacity-50' : ''}">${task.title}</p>
                        ${dueDate ? `<p class="text-xs text-gray-400">截止: ${dueDate}</p>` : ''}
                    </div>
                </div>
                <span class="px-2 py-1 text-xs rounded ${statusClass}">${statusText}</span>
            </div>
        `;
    }

    return `
        <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg transition-smooth hover:border-primary">
            <div class="flex items-center space-x-4 flex-1">
                <button
                    onclick="toggleComplete(${task.id}, ${task.status})"
                    class="w-6 h-6 rounded border-2 ${isCompleted ? 'bg-primary border-primary' : 'border-gray-300'} transition-smooth cursor-pointer flex items-center justify-center focus-ring"
                    aria-label="${isCompleted ? '标记为未完成' : '标记为完成'}"
                >
                    ${isCompleted ? '<svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5L20 7"/></svg>' : ''}
                </button>
                <div class="flex-1">
                    <p class="font-medium text-text ${isCompleted ? 'opacity-50' : ''}">${task.title}</p>
                    ${task.description ? `<p class="text-sm text-gray-500 mt-1">${task.description}</p>` : ''}
                    <div class="flex items-center space-x-3 mt-2">
                        <span class="text-xs ${priorityClass} font-medium">${priorityText}</span>
                        ${task.categoryName ? `<span class="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">${task.categoryName}</span>` : ''}
                        ${dueDate ? `<span class="text-xs text-gray-400">截止: ${dueDate}</span>` : ''}
                    </div>
                </div>
            </div>
            <div class="flex items-center space-x-2">
                <span class="px-2 py-1 text-xs rounded ${statusClass}">${statusText}</span>
                <div class="flex space-x-1">
                    <button
                        onclick="openEditTaskModal(${JSON.stringify(task).replace(/"/g, '&quot;')})"
                        class="p-2 text-gray-400 hover:text-primary transition-smooth cursor-pointer focus-ring"
                        aria-label="编辑任务"
                    >
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button
                        onclick="deleteTask(${task.id})"
                        class="p-2 text-gray-400 hover:text-red-500 transition-smooth cursor-pointer focus-ring"
                        aria-label="删除任务"
                    >
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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

    // Previous button
    html += `
        <button
            onclick="goToPage(${currentPage - 1})"
            class="px-3 py-1 border border-gray-200 rounded text-sm transition-smooth cursor-pointer ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary'}"
            ${currentPage === 1 ? 'disabled' : ''}
        >
            上一页
        </button>
    `;

    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
        html += `
            <button
                onclick="goToPage(${i})"
                class="px-3 py-1 border rounded text-sm transition-smooth cursor-pointer ${i === currentPage ? 'bg-primary text-white border-primary' : 'border-gray-200 hover:border-primary'}"
            >
                ${i}
            </button>
        `;
    }

    // Next button
    html += `
        <button
            onclick="goToPage(${currentPage + 1})"
            class="px-3 py-1 border border-gray-200 rounded text-sm transition-smooth cursor-pointer ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary'}"
            ${currentPage === totalPages ? 'disabled' : ''}
        >
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
        // API uses integer status: 0=PENDING, 1=COMPLETED
        if (currentStatus === 1) {
            // Need to update task to mark as pending
            const task = await apiGet(`/todo-items/${taskId}`);
            await apiPut(`/todo-items/${taskId}`, {
                title: task.title,
                description: task.description,
                categoryId: task.categoryId,
                priority: task.priority,
                dueDate: task.dueDate,
                status: 0  // Set to PENDING
            });
        } else {
            await apiPut(`/todo-items/${taskId}/complete`);
        }

        // Refresh current view
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

        // Refresh current view
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
        container.innerHTML = '<p class="text-gray-500 text-center py-8">暂无分类</p>';
        return;
    }

    container.innerHTML = categories.map(cat => `
        <div class="card bg-white p-4 border border-gray-200 rounded-lg transition-smooth hover:border-primary">
            <div class="flex items-start justify-between">
                <div>
                    <h3 class="font-medium text-text">${cat.name}</h3>
                    ${cat.description ? `<p class="text-sm text-gray-500 mt-1">${cat.description}</p>` : ''}
                    <p class="text-xs text-gray-400 mt-2">任务数: ${cat.taskCount || 0}</p>
                </div>
                <div class="flex space-x-1">
                    <button
                        onclick="editCategory(${cat.id})"
                        class="p-2 text-gray-400 hover:text-primary transition-smooth cursor-pointer focus-ring"
                        aria-label="编辑分类"
                    >
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button
                        onclick="deleteCategory(${cat.id})"
                        class="p-2 text-gray-400 hover:text-red-500 transition-smooth cursor-pointer focus-ring"
                        aria-label="删除分类"
                    >
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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

    // Simple edit via prompt (can be enhanced to modal)
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
                    borderColor: '#14B8A6',
                    backgroundColor: 'rgba(20, 184, 166, 0.1)',
                    fill: true,
                    tension: 0.3
                },
                {
                    label: '完成任务',
                    data: completedData,
                    borderColor: '#0D9488',
                    backgroundColor: 'rgba(13, 148, 136, 0.1)',
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
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
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

    charts.categoryStats = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.map(d => d.categoryName || '未分类'),
            datasets: [{
                data: data.map(d => d.totalCount),
                backgroundColor: [
                    '#0D9488', '#14B8A6', '#2DD4BF', '#5EEAD4', '#99F6E4',
                    '#F97316', '#FB923C', '#FDBA74'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
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

    // API uses integer: 0=LOW, 1=MEDIUM, 2=HIGH
    const colors = {
        2: '#DC2626',  // HIGH - red
        1: '#F59E0B',  // MEDIUM - yellow
        0: '#10B981'   // LOW - green
    };

    charts.priorityStats = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.priorityName || getPriorityLabel(d.priority)),
            datasets: [{
                label: '任务数',
                data: data.map(d => d.totalCount),
                backgroundColor: data.map(d => colors[d.priority] || '#6B7280'),
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function renderCompletionTimeStats(data) {
    const container = document.getElementById('completion-time-stats');
    container.innerHTML = `
        <div class="p-4 border border-gray-200 rounded-lg">
            <div class="flex justify-between items-center">
                <span class="text-sm text-gray-500">平均完成时间</span>
                <span class="font-medium text-text">${data.averageDays || 0} 天</span>
            </div>
        </div>
        <div class="p-4 border border-gray-200 rounded-lg">
            <div class="flex justify-between items-center">
                <span class="text-sm text-gray-500">最快完成时间</span>
                <span class="font-medium text-primary">${data.minDays || 0} 天</span>
            </div>
        </div>
        <div class="p-4 border border-gray-200 rounded-lg">
            <div class="flex justify-between items-center">
                <span class="text-sm text-gray-500">最长完成时间</span>
                <span class="font-medium text-cta">${data.maxDays || 0} 天</span>
            </div>
        </div>
        <div class="p-4 border border-gray-200 rounded-lg">
            <div class="flex justify-between items-center">
                <span class="text-sm text-gray-500">已完成任务数</span>
                <span class="font-medium text-text">${data.totalCompleted || 0}</span>
            </div>
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
    // Convert integer priority to string key for CSS classes
    const keys = {
        2: 'high',
        1: 'medium',
        0: 'low'
    };
    return keys[priority] || 'low';
}

function getPriorityLabel(priority) {
    // Support both integer (0,1,2) and string (LOW,MEDIUM,HIGH)
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
    // Simple error display (can be enhanced)
    alert(message);
}

// ==================== Initialization ====================

document.addEventListener('DOMContentLoaded', () => {
    // Load dashboard on initial load
    loadDashboard();
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.fixed:not(.hidden)').forEach(modal => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        });
    }
});