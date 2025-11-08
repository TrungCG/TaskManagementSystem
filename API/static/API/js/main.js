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
const greetingHeader = document.getElementById('greeting-header');
const projectDetailHeader = document.getElementById('project-detail-header');
const projectHeaderTitle = document.getElementById('project-header-title');
const projectMembersStack = document.getElementById('project-members-stack');
const manageMembersBtn = document.getElementById('manage-members-btn');

// --- Create Project Modal Elements ---
const createProjectModal = document.getElementById('create-project-modal');
const createProjectForm = document.getElementById('create-project-form');
const cancelCreateProjectBtn = document.getElementById('cancel-create-project');
const addProjectPlusBtn = document.getElementById('add-project-plus-btn');
const createProjectMainBtn = document.getElementById('create-project-main-btn');
const projectCreateErrorEl = document.getElementById('project-create-error');

// --- Member Management Modal Elements ---
const memberModal = document.getElementById('member-management-modal');
const memberModalProjectName = document.getElementById('member-modal-project-name');
const userSearchInput = document.getElementById('user-search-input');
const userSearchResults = document.getElementById('user-search-results');
const currentMembersList = document.getElementById('current-members-list');
const closeMemberModalBtn = document.getElementById('close-member-modal-btn');

// --- Task Detail Panel Elements ---
const taskDetailPanel = document.getElementById('task-detail-panel');
const closeTaskPanelBtn = document.getElementById('close-task-panel-btn');
const taskDetailTitle = document.getElementById('task-detail-title');
const taskDetailAssignee = document.getElementById('task-detail-assignee');
const taskDetailDueDate = document.getElementById('task-detail-due-date');
const taskDetailDescription = document.getElementById('task-detail-description');
const taskCommentsList = document.getElementById('task-comments-list');
const addCommentForm = document.getElementById('add-comment-form');

// --- APPLICATION STATE ---
let allMyTasks = [], projects = [], currentUser = null, currentFilter = 'upcoming';
let currentlyDisplayedTasks = [];
let currentProject = null; // Lưu dự án đang được chọn
let currentTask = null; // Lưu task đang được xem chi tiết

// --- VIEW & MODAL MANAGEMENT ---
function showView(viewName) {
    taskView.classList.add('hidden');
    projectBrowseView.classList.add('hidden');
    if (viewName === 'tasks') taskView.classList.remove('hidden');
    else if (viewName === 'projects') projectBrowseView.classList.remove('hidden');
}

function openModal(modal) { modal.classList.remove('hidden'); }
function closeModal(modal) { modal.classList.add('hidden'); }

function openTaskDetailPanel() { taskDetailPanel.classList.remove('hidden'); }
function closeTaskDetailPanel() { taskDetailPanel.classList.add('hidden'); currentTask = null; }

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

// --- RENDER FUNCTIONS ---
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
        <li><a href="#" data-nav-id="${p.id}" data-type="project"><span class="project-dot"></span>${p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name}</a></li>
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
                <div class="project-icon-list"><svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z"></path></svg></div>
                <span>${project.name}</span>
            </div>
            <div class="project-browse-members">${membersHtml}${project.members.length > 3 ? `<div class="member-avatar-sm more">...</div>` : ''}</div>
            <div class="project-browse-teams"><div class="team-tag">${project.owner.first_name}'s first team</div></div>
            <div class="project-browse-modified"><span>...</span></div>
        `;
        projectBrowseList.appendChild(projectElement);
    });
}

function renderProjectDetailHeader() {
    if (!currentProject) {
        projectDetailHeader.classList.add('hidden');
        greetingHeader.classList.remove('hidden');
        return;
    }
    projectHeaderTitle.textContent = currentProject.name;
    projectMembersStack.innerHTML = currentProject.members.slice(0, 4).map(member => {
        const initials = (member.first_name || member.username).split(' ').map(n => n[0]).join('').toUpperCase();
        return `<div class="member-avatar-sm" title="${member.first_name} ${member.last_name}">${initials}</div>`;
    }).join('');
    if (currentProject.members.length > 4) {
        projectMembersStack.innerHTML += `<div class="member-avatar-sm more">+${currentProject.members.length - 4}</div>`;
    }
    greetingHeader.classList.add('hidden');
    projectDetailHeader.classList.remove('hidden');
}

async function renderMemberList() {
    currentMembersList.innerHTML = '';
    currentProject.members.forEach(member => {
        const isOwner = member.id === currentProject.owner.id;
        const canRemove = currentUser.id === currentProject.owner.id && !isOwner;
        const memberEl = document.createElement('li');
        memberEl.className = 'member-list-item';
        memberEl.innerHTML = `
            <div class="member-info">
                <div class="member-avatar-sm">${(member.first_name || member.username).charAt(0).toUpperCase()}</div>
                <span>${member.first_name} ${member.last_name} ${isOwner ? '(Owner)' : ''}</span>
            </div>
            ${canRemove ? `<button class="remove-member-btn" data-user-id="${member.id}">&times;</button>` : ''}
        `;
        currentMembersList.appendChild(memberEl);
    });
}

function renderTasks() {
    taskListContainer.innerHTML = '';
    const filteredTasks = currentlyDisplayedTasks.filter(task => {
        const now = new Date(); now.setHours(0, 0, 0, 0);
        if (currentFilter === 'upcoming') return task.status !== 'DONE' && (!task.due_date || new Date(task.due_date) >= now);
        if (currentFilter === 'overdue') return task.status !== 'DONE' && task.due_date && new Date(task.due_date) < now;
        if (currentFilter === 'completed') return task.status === 'DONE';
        return true;
    });

    if (filteredTasks.length === 0) {
        taskListContainer.innerHTML = `<p class="empty-list-message">No tasks in this section.</p>`;
        return;
    }
    const projectMap = new Map(projects.map(p => [p.id, p.name]));
    filteredTasks.forEach(task => {
        const projectName = projectMap.get(task.project) || '...';
        const dueDate = task.due_date ? new Date(task.due_date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }) : '';
        const taskElement = document.createElement('li');
        taskElement.className = 'task-item';
        taskElement.dataset.taskId = task.id;
        taskElement.dataset.projectId = task.project;
        taskElement.innerHTML = `
            <div class="checkbox"></div>
            <span class="task-name">${task.title}</span>
            <div class="project-tag"><div class="project-dot"></div><span>${projectName.length > 10 ? projectName.substring(0, 10) + '...' : projectName}</span></div>
            <span class="due-date">${dueDate}</span>
        `;
        taskListContainer.appendChild(taskElement);
    });
}

async function renderTaskDetails() {
    if (!currentTask) return;
    taskDetailTitle.textContent = currentTask.title;
    taskDetailAssignee.textContent = currentTask.assignee ? `${currentTask.assignee.first_name} ${currentTask.assignee.last_name}` : 'Unassigned';
    taskDetailDueDate.textContent = currentTask.due_date ? new Date(currentTask.due_date).toLocaleDateString('en-US', { dateStyle: 'long' }) : 'No due date';
    taskDetailDescription.textContent = currentTask.description || 'No description provided.';
    
    const comments = await fetchCommentsForTask(currentProject.id, currentTask.id);
    renderComments(comments);
}

function renderComments(comments) {
    taskCommentsList.innerHTML = '';
    if (comments.length === 0) {
        taskCommentsList.innerHTML = `<li class="no-comments">No comments yet.</li>`;
        return;
    }
    comments.forEach(comment => {
        const commentEl = document.createElement('li');
        commentEl.className = 'comment-item';
        commentEl.innerHTML = `
            <div class="comment-author">${comment.author.first_name}</div>
            <div class="comment-body">${comment.body}</div>
            <div class="comment-timestamp">${new Date(comment.created_at).toLocaleString()}</div>
        `;
        taskCommentsList.appendChild(commentEl);
    });
}

// --- CORE LOGIC ---
function updateSidebarActiveState(activeId) {
    sidebarNav.querySelectorAll('a.active').forEach(el => el.classList.remove('active'));
    const link = sidebarNav.querySelector(`a[data-nav-id="${activeId}"]`);
    if (link) link.classList.add('active');
}

function updateTaskView(title, tasks, isMyTasksView = false) {
    showView('tasks');
    renderProjectDetailHeader();
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
        currentProject = projects.find(p => p.id == projectId);
        if (!currentProject) return;
        
        updateSidebarActiveState(projectId);
        taskListContainer.innerHTML = `<p class="loading-message">Loading tasks...</p>`;
        
        const projectTasks = await fetchTasksForProject(projectId);
        updateTaskView(currentProject.name, projectTasks, false);
    } catch (error) {
        console.error(`Failed to load project ${projectId}:`, error);
        showToast('Could not load project tasks.');
    }
}

function showMyTasks() {
    currentProject = null;
    updateSidebarActiveState('my-tasks');
    updateTaskView('My tasks', allMyTasks, true);
}

function showProjectBrowse() {
    currentProject = null;
    updateSidebarActiveState('browse-projects');
    renderProjectBrowseList();
    showView('projects');
}

async function openMemberManagementModal() {
    if (!currentProject) return;
    memberModalProjectName.textContent = `For "${currentProject.name}"`;
    await renderMemberList();
    openModal(memberModal);
}

async function handleAddMember(userId) {
    try {
        await addMemberToProject(currentProject.id, userId);
        const updatedProjects = await fetchProjects();
        projects = updatedProjects;
        currentProject = projects.find(p => p.id === currentProject.id);
        
        await renderMemberList();
        renderProjectDetailHeader();
        userSearchInput.value = '';
        userSearchResults.classList.add('hidden');
        showToast('Member added successfully!');
    } catch (error) {
        showToast('Failed to add member.');
    }
}

async function handleRemoveMember(userId) {
    try {
        await removeMemberFromProject(currentProject.id, userId);
        const updatedProjects = await fetchProjects();
        projects = updatedProjects;
        currentProject = projects.find(p => p.id === currentProject.id);

        await renderMemberList();
        renderProjectDetailHeader();
        showToast('Member removed successfully!');
    } catch (error) {
        showToast('Failed to remove member.');
    }
}

async function handleSelectTask(taskId, projectId) {
    try {
        currentTask = await fetchTaskDetails(projectId, taskId);
        await renderTaskDetails();
        openTaskDetailPanel();
    } catch (error) {
        showToast('Could not load task details.');
    }
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
    } catch (error) {
        console.error("Initialization failed:", error);
        logout();
    }
}

// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();

    // --- General UI Listeners ---
    hamburgerBtn.addEventListener('click', () => sidebar.classList.toggle('collapsed'));
    profileWrapper.addEventListener('click', (e) => {
        if (e.target.closest('#logout-button')) return;
        logoutDropdown.classList.toggle('hidden');
    });
    logoutButton.addEventListener('click', logout);

    // --- Auth Listeners ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginErrorEl.style.display = 'none';
        try { await login(loginForm.username.value, loginForm.password.value); } 
        catch (error) { loginErrorEl.textContent = 'Invalid username or password.'; loginErrorEl.style.display = 'block'; }
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

    // --- Navigation Listeners ---
    sidebarNav.addEventListener('click', (e) => {
        e.preventDefault();
        const link = e.target.closest('a');
        if (!link || !link.dataset.navId) return;
        const navId = link.dataset.navId;
        const type = link.dataset.type;

        closeTaskDetailPanel();
        if (navId === 'browse-projects') showProjectBrowse();
        else if (type === 'project') selectProject(navId);
        else if (navId === 'my-tasks') showMyTasks();
        else {
            currentProject = null;
            updateSidebarActiveState(navId);
            updateTaskView(link.textContent, [], false);
        }
    });
    projectBrowseList.addEventListener('click', (e) => {
        const projectItem = e.target.closest('.project-browse-item');
        if (projectItem) selectProject(projectItem.dataset.projectId);
    });

    // --- Task View Listeners ---
    tabsContainer.addEventListener('click', (e) => {
        const clickedTab = e.target.closest('.tab-item');
        if (!clickedTab) return;
        tabsContainer.querySelectorAll('.tab-item').forEach(tab => tab.classList.remove('active'));
        clickedTab.classList.add('active');
        currentFilter = clickedTab.dataset.filter;
        renderTasks();
    });
    taskListContainer.addEventListener('click', (e) => {
        const taskItem = e.target.closest('.task-item');
        if (taskItem) {
            handleSelectTask(taskItem.dataset.taskId, taskItem.dataset.projectId);
        }
    });

    // --- Create Project Modal Listeners ---
    addProjectPlusBtn.addEventListener('click', () => openModal(createProjectModal));
    createProjectMainBtn.addEventListener('click', () => openModal(createProjectModal));
    cancelCreateProjectBtn.addEventListener('click', () => closeModal(createProjectModal));
    createProjectModal.addEventListener('click', (e) => { if (e.target === createProjectModal) closeModal(createProjectModal); });
    createProjectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        projectCreateErrorEl.style.display = 'none';
        const formData = new FormData(createProjectForm);
        const projectData = Object.fromEntries(formData.entries());
        if (!projectData.name.trim()) {
            projectCreateErrorEl.textContent = 'Project name is required.';
            projectCreateErrorEl.style.display = 'block';
            return;
        }
        try {
            const newProject = await createProject(projectData);
            projects.push(newProject);
            renderProjectsSidebar();
            renderProjectBrowseList();
            closeModal(createProjectModal);
            showToast('Project created successfully!');
            selectProject(newProject.id);
        } catch (error) {
            const errorMessages = Object.values(error).flat().join(' ');
            projectCreateErrorEl.textContent = errorMessages || 'Could not create project.';
            projectCreateErrorEl.style.display = 'block';
        }
    });

    // --- Member Management Listeners ---
    manageMembersBtn.addEventListener('click', openMemberManagementModal);
    closeMemberModalBtn.addEventListener('click', () => closeModal(memberModal));
    memberModal.addEventListener('click', (e) => { if (e.target === memberModal) closeModal(memberModal); });
    userSearchInput.addEventListener('input', async (e) => {
        const query = e.target.value.trim();
        if (query.length < 2) {
            userSearchResults.classList.add('hidden');
            return;
        }
        const users = await searchUsers(query);
        userSearchResults.innerHTML = '';
        const currentMemberIds = new Set(currentProject.members.map(m => m.id));
        const filteredUsers = users.filter(u => !currentMemberIds.has(u.id));

        if (filteredUsers.length > 0) {
            filteredUsers.forEach(user => {
                const resultItem = document.createElement('div');
                resultItem.className = 'search-result-item';
                resultItem.textContent = `${user.first_name} ${user.last_name} (${user.username})`;
                resultItem.dataset.userId = user.id;
                userSearchResults.appendChild(resultItem);
            });
            userSearchResults.classList.remove('hidden');
        } else {
            userSearchResults.classList.add('hidden');
        }
    });
    userSearchResults.addEventListener('click', (e) => {
        const userItem = e.target.closest('.search-result-item');
        if (userItem) handleAddMember(userItem.dataset.userId);
    });
    currentMembersList.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.remove-member-btn');
        if (removeBtn) handleRemoveMember(removeBtn.dataset.userId);
    });

    // --- Task Detail Panel Listeners ---
    closeTaskPanelBtn.addEventListener('click', closeTaskDetailPanel);
    addCommentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const commentBody = addCommentForm.body.value.trim();
        if (!commentBody || !currentTask) return;
        try {
            const newComment = await postComment(currentProject.id, currentTask.id, commentBody);
            const comments = await fetchCommentsForTask(currentProject.id, currentTask.id);
            renderComments(comments);
            addCommentForm.reset();
        } catch (error) {
            showToast('Failed to post comment.');
        }
    });
});