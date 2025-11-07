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
const myTasksAvatar = document.getElementById('my-tasks-avatar');
const greetingUserName = document.getElementById('user-name');
const currentDateEl = document.getElementById('current-date');
const taskListContainer = document.getElementById('task-list-container');
const projectListSidebar = document.getElementById('project-list-sidebar');
const tabsContainer = document.querySelector('.task-tabs');
const mainContainer = document.querySelector('.main-container');
const toastNotification = document.getElementById('toast-notification'); // <-- ĐÃ THÊM

// --- APPLICATION STATE ---
let allTasks = [], projects = [], currentUser = null, currentFilter = 'upcoming';

// --- MODAL & UI FUNCTIONS ---

// <-- HÀM MỚI ĐƯỢC THÊM -->
function showToast(message) {
    const toastMessageEl = toastNotification.querySelector('.toast-message');
    if (toastMessageEl) {
        toastMessageEl.textContent = message;
    }
    
    // Quan trọng: Phải xóa 'hidden' để CSS transition hoạt động
    toastNotification.classList.remove('hidden'); 
    
    // Thêm class 'show' để kích hoạt animation trượt vào
    // Dùng setTimeout nhỏ để đảm bảo trình duyệt nhận diện được thay đổi class
    setTimeout(() => {
        toastNotification.classList.add('show');
    }, 10); 

    // Đặt hẹn giờ để ẩn thông báo
    setTimeout(() => {
        toastNotification.classList.remove('show');
        
        // Đợi animation trượt ra kết thúc rồi mới thêm lại class 'hidden'
        toastNotification.addEventListener('transitionend', () => {
            toastNotification.classList.add('hidden');
        }, { once: true }); // {once: true} để listener tự hủy sau khi chạy 1 lần

    }, 3000); // Thông báo hiển thị trong 3 giây
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

function renderUI() {
    if (currentUser) {
        const name = currentUser.first_name || currentUser.username;
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
        userAvatar.textContent = initials;
        myTasksAvatar.textContent = initials;
        greetingUserName.textContent = name;
    }
    const now = new Date();
    currentDateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    renderProjectsSidebar();
}

function renderProjectsSidebar() {
    if (!projects) return;
    projectListSidebar.innerHTML = projects.map(p => `<li><a href="#"><span class="project-dot"></span>${p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name}</a></li>`).join('');
}

function renderTasks() {
    taskListContainer.innerHTML = '';
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    let filteredTasks;
    if (currentFilter === 'upcoming') filteredTasks = allTasks.filter(t => t.status !== 'DONE' && (!t.due_date || new Date(t.due_date) >= now));
    else if (currentFilter === 'overdue') filteredTasks = allTasks.filter(t => t.status !== 'DONE' && t.due_date && new Date(t.due_date) < now);
    else filteredTasks = allTasks.filter(t => t.status === 'DONE');

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
        allTasks = await fetchAllMyTasks(projects);
        renderUI();
        renderTasks();
    } catch (error) {
        console.error("Initialization failed:", error);
        // SỬA LỖI: Nếu có lỗi (token hết hạn), chỉ cần hiển thị modal, không reload
        showAuthModal('login');
        mainContainer.classList.add('hidden');
    }
}

// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();

    profileWrapper.addEventListener('click', (e) => {
        // Ngăn việc click vào dropdown làm ẩn chính nó
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
            
            // <-- THAY ĐỔI TẠI ĐÂY -->
            // alert('Account created successfully! Please log in.'); // Dòng cũ
            showToast('Account created successfully!'); // Dòng mới

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
});