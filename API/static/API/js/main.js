// --- DOM ELEMENTS ---
const profileWrapper = document.getElementById('profile-wrapper');
const logoutDropdown = document.getElementById('logout-dropdown');
const logoutButton = document.getElementById('logout-button');
const authModal = document.getElementById('auth-modal');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const showSignupLink = document.getElementById('show-signup');
const showLoginLink = document.getElementById('show-login');
const loginErrorEl = document.getElementById('login-error');
const signupErrorEl = document.getElementById('signup-error');
const userAvatar = document.getElementById('user-avatar');
const greetingUserName = document.getElementById('user-name');
const currentDateEl = document.getElementById('current-date');
const taskListContainer = document.getElementById('task-list-container');
const projectListSidebar = document.getElementById('project-list-sidebar');
const tabsContainer = document.querySelector('.task-tabs');
const mainContainer = document.querySelector('.main-container');
const toastNotification = document.getElementById('toast-notification');
const hamburgerBtn = document.querySelector('.hamburger-btn');
const sidebar = document.querySelector('.sidebar');
const sidebarNav = document.querySelector('.sidebar-nav');
const taskViewAvatar = document.getElementById('task-view-avatar');
const taskViewTitle = document.getElementById('task-view-title');
const projectsNavHeader = document.getElementById('projects-nav-header');
const taskView = document.getElementById('task-view');
const projectBrowseView = document.getElementById('project-browse-view');
const projectBrowseList = document.getElementById('project-browse-list');

// --- APPLICATION STATE ---
let allMyTasks = [], projects = [], currentUser = null, currentFilter = 'upcoming';
let currentlyDisplayedTasks = [];

// --- VIEW SWITCHING ---
function showView(viewName) {
    taskView.classList.add('hidden');
    projectBrowseView.classList.add('hidden');

    if (viewName === 'tasks') {
        taskView.classList.remove('hidden');
    } else if (viewName === 'projects') {
        projectBrowseView.classList.remove('hidden');
    }
}

// --- MODAL & UI FUNCTIONS ---
function showToast(message) {
    const toastMessageEl = toastNotification.querySelector('.toast-message');
    if (toastMessageEl) toastMessageEl.textContent = message;
    toastNotification.classList.remove('hidden');
    setTimeout(() => { toastNotification.classList.add('show'); }, 10);
    setTimeout(() => {
        toastNotification.classList.remove('show');
        toastNotification.addEventListener('transitionend', () => {
            toastNotification.classList.add('hidden');
        }, { once: true });
    }, 3000);
}

function showAuthModal(mode = 'login') {
    loginErrorEl.style.display = 'none';
    signupErrorEl.style.display = 'none';
    if (mode === 'login') {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
    } else {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
    }
    authModal.classList.remove('hidden');
}

function renderStaticUI() {
    if (currentUser) {
        const name = currentUser.first_name || currentUser.username;
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
        userAvatar.textContent = initials;
        greetingUserName.textContent = name;
    }
    const now = new Date();
    currentDateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    renderProjectsSidebar();
}

function renderProjectsSidebar() {
    if (!projects) return;
    projectListSidebar.innerHTML = projects.map(p => `
        <li>
            <a href="#" data-nav-id="${p.id}" data-type="project">
                <span class="project-dot"></span>
                ${p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name}
            </a>
        </li>
    `).join('');
}

function renderProjectBrowseList() {
    projectBrowseList.innerHTML = '';
    if (!projects || projects.length === 0) {
        projectBrowseList.innerHTML = `<p class="empty-list-message">No projects found.</p>`;
        return;
    }

    projects.forEach(project => {
        const membersHtml = project.members.slice(0, 3).map(member => {
            const initials = (member.first_name || member.username).split(' ').map(n => n[0]).join('').toUpperCase();
            return `<div class="member-avatar-sm" title="${member.first_name} ${member.last_name}">${initials}</div>`;
        }).join('');

        const projectElement = document.createElement('li');
        projectElement.className = 'project-browse-item';
        projectElement.setAttribute('data-project-id', project.id);
        projectElement.innerHTML = `
            <div class="project-browse-name">
                <div class="project-icon-list">
                    <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z"></path></svg>
                </div>
                <span>${project.name}</span>
            </div>
            <div class="project-browse-members">
                ${membersHtml}
                ${project.members.length > 3 ? `<div class="member-avatar-sm more">...</div>` : ''}
            </div>
            <div class="project-browse-teams">
                <div class="team-tag">${project.owner.first_name}'s first team</div>
            </div>
            <div class="project-browse-modified">
                <span>...</span>
            </div>
        `;
        projectBrowseList.appendChild(projectElement);
    });
}

function filterTasks(tasks, filter) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (filter === 'upcoming') return tasks.filter(t => t.status !== 'DONE' && (!t.due_date || new Date(t.due_date) >= now));
    if (filter === 'overdue') return tasks.filter(t => t.status !== 'DONE' && t.due_date && new Date(t.due_date) < now);
    if (filter === 'completed') return tasks.filter(t => t.status === 'DONE');
    return tasks;
}

function renderTasks() {
    taskListContainer.innerHTML = '';
    const filteredTasks = filterTasks(currentlyDisplayedTasks, currentFilter);

    if (filteredTasks.length === 0) {
        taskListContainer.innerHTML = `<p style="padding: 16px 8px; color: #6f6f6f; text-align: center;">No tasks in this section.</p>`;
        return;
    }
    const projectMap = new Map(projects.map(p => [p.id, p.name]));
    filteredTasks.forEach(task => {
        const projectName = projectMap.get(task.project) || '...';
        const dueDate = task.due_date ? new Date(task.due_date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }) : '';
        const taskElement = document.createElement('li');
        taskElement.className = 'task-item';
        taskElement.innerHTML = `<div class="checkbox" data-task-id="${task.id}" data-project-id="${task.project}"></div><span class="task-name">${task.title}</span><div class="project-tag"><div class="project-dot"></div><span>${projectName.length > 10 ? projectName.substring(0, 10) + '...' : projectName}</span></div><span class="due-date">${dueDate}</span>`;
        taskListContainer.appendChild(taskElement);
    });
}

function updateSidebarActiveState(activeId) {
    sidebarNav.querySelectorAll('a.active').forEach(el => el.classList.remove('active'));
    const link = sidebarNav.querySelector(`a[data-nav-id="${activeId}"]`);
    if (link) link.classList.add('active');
}

function updateTaskView(title, tasks, isMyTasksView = false) {
    showView('tasks');
    taskViewTitle.textContent = title;
    currentlyDisplayedTasks = tasks;

    if (isMyTasksView && currentUser) {
        const initials = (currentUser.first_name || currentUser.username).split(' ').map(n => n[0]).join('').toUpperCase();
        taskViewAvatar.textContent = initials;
        taskViewAvatar.style.backgroundColor = 'var(--accent-color-light)';
        taskViewAvatar.style.color = 'var(--accent-color)';
    } else {
        taskViewAvatar.innerHTML = `<svg class="icon" viewBox="0 0 24 24" style="width: 20px; height: 20px;"><path fill="currentColor" d="M15 3H9V5H15V3M19 3H17V5H19V3M21 1H3C1.9 1 1 1.9 1 3V21C1 22.1 1.9 23 3 23H21C22.1 23 23 22.1 23 21V3C23 1.9 22.1 1 21 1M21 21H3V7H21V21M7 3H5V5H7V3Z" /></svg>`;
        taskViewAvatar.style.backgroundColor = '#e0e0e0';
        taskViewAvatar.style.color = '#555';
    }
    renderTasks();
}

async function selectProject(projectId) {
    try {
        const project = projects.find(p => p.id == projectId);
        if (!project) return;
        
        updateSidebarActiveState(projectId);
        taskListContainer.innerHTML = `<p style="padding: 16px 8px; color: #6f6f6f; text-align: center;">Loading tasks...</p>`;
        
        const projectTasks = await fetchTasksForProject(projectId);
        updateTaskView(project.name, projectTasks, false);
    } catch (error) {
        console.error(`Failed to load project ${projectId}:`, error);
        showToast('Could not load project tasks.');
        taskListContainer.innerHTML = `<p style="padding: 16px 8px; color: #d93025; text-align: center;">Failed to load tasks.</p>`;
    }
}

function showMyTasks() {
    updateSidebarActiveState('my-tasks');
    updateTaskView('My tasks', allMyTasks, true);
}

function showProjectBrowse() {
    updateSidebarActiveState('browse-projects');
    renderProjectBrowseList();
    showView('projects');
}

// --- INITIALIZATION ---
async function initializeApp() {
    if (!getTokens().access) {
        showAuthModal('login');
        mainContainer.classList.add('hidden');
        return;
    }
    try {
        mainContainer.classList.remove('hidden');
        currentUser = await fetchCurrentUser();
        projects = await fetchProjects();
        allMyTasks = await fetchAllMyTasks(projects);
        
        renderStaticUI();
        showMyTasks();
        updateSidebarActiveState('my-tasks');
    } catch (error) {
        console.error("Initialization failed:", error);
        logout();
    }
}

// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();

    hamburgerBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
    });

    profileWrapper.addEventListener('click', (e) => {
        if (e.target.closest('#logout-button')) return;
        logoutDropdown.classList.toggle('hidden');
    });
    logoutButton.addEventListener('click', logout);

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginErrorEl.style.display = 'none';
        try {
            await login(loginForm.username.value, loginForm.password.value);
        } catch (error) {
            loginErrorEl.textContent = 'Invalid username or password.';
            loginErrorEl.style.display = 'block';
        }
    });

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        signupErrorEl.style.display = 'none';
        try {
            const formData = new FormData(signupForm);
            await signup(Object.fromEntries(formData.entries()));
            showToast('Account created successfully!');
            showAuthModal('login');
        } catch (errors) {
            const errorMessages = Object.values(errors).flat().join(' ');
            signupErrorEl.textContent = errorMessages || 'An unknown error occurred.';
            signupErrorEl.style.display = 'block';
        }
    });

    showSignupLink.addEventListener('click', (e) => { e.preventDefault(); showAuthModal('signup'); });
    showLoginLink.addEventListener('click', (e) => { e.preventDefault(); showAuthModal('login'); });

    tabsContainer.addEventListener('click', (e) => {
        const clickedTab = e.target.closest('.tab-item');
        if (!clickedTab) return;
        tabsContainer.querySelectorAll('.tab-item').forEach(tab => tab.classList.remove('active'));
        clickedTab.classList.add('active');
        currentFilter = clickedTab.dataset.filter;
        renderTasks();
    });

    sidebarNav.addEventListener('click', (e) => {
        e.preventDefault();
        const link = e.target.closest('a');
        if (!link || !link.dataset.navId) return;

        const navId = link.dataset.navId;
        const type = link.dataset.type;

        if (navId === 'browse-projects') {
            showProjectBrowse();
        } else if (type === 'project') {
            selectProject(navId);
        } else if (navId === 'my-tasks') {
            showMyTasks();
        } else {
            updateSidebarActiveState(navId);
            showView('tasks');
            updateTaskView(link.textContent, [], false);
        }
    });

    projectBrowseList.addEventListener('click', (e) => {
        const projectItem = e.target.closest('.project-browse-item');
        if (projectItem) {
            const projectId = projectItem.dataset.projectId;
            selectProject(projectId);
        }
    });
});