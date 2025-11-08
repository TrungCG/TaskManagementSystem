const API_BASE_URL = 'http://127.0.0.1:8000'; 

function getTokens() {
    return {
        access: localStorage.getItem('accessToken'),
        refresh: localStorage.getItem('refreshToken')
    };
}

function setTokens(access, refresh) {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
}

function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.reload();
}

async function apiFetch(endpoint, options = {}) {
    let tokens = getTokens();
    if (!tokens.access) {
        return Promise.reject("Not logged in.");
    }
    
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens.access}`,
        ...options.headers
    };

    let response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

    if (response.status === 401 && tokens.refresh) {
        try {
            const refreshResponse = await fetch(`${API_BASE_URL}/token/refresh/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh: tokens.refresh })
            });
            
            if (!refreshResponse.ok) throw new Error('Refresh failed');

            const newTokens = await refreshResponse.json();
            setTokens(newTokens.access, tokens.refresh);
            headers['Authorization'] = `Bearer ${newTokens.access}`;
            
            response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
        } catch (e) {
            logout();
            return Promise.reject("Session expired.");
        }
    }
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown server error' }));
        throw errorData;
    }
    
    return response.status === 204 ? null : response.json();
}

async function login(username, password) {
    const response = await fetch(`${API_BASE_URL}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    if (!response.ok) {
        throw await response.json().catch(() => ({ detail: 'Invalid credentials' }));
    }
    const data = await response.json();
    setTokens(data.access, data.refresh);
    window.location.reload();
}

async function signup(userData) {
    const response = await fetch(`${API_BASE_URL}/signup/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    const data = await response.json();
    if (!response.ok) {
        throw data;
    }
    return data;
}

async function fetchCurrentUser() {
    const token = getTokens().access;
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return apiFetch(`/users/${payload.user_id}/`);
}

async function fetchProjects() {
    return apiFetch('/projects/');
}

async function createProject(projectData) {
    return apiFetch('/projects/', {
        method: 'POST',
        body: JSON.stringify(projectData)
    });
}

async function fetchAllMyTasks(projects) {
    if (!projects || projects.length === 0) return [];
    const taskPromises = projects.map(p => apiFetch(`/projects/${p.id}/tasks/?assignee=me`));
    return (await Promise.all(taskPromises)).flat();
}

async function fetchTasksForProject(projectId) {
    return apiFetch(`/projects/${projectId}/tasks/`);
}

async function addMemberToProject(projectId, userId) {
    return apiFetch(`/projects/${projectId}/add_member/`, {
        method: 'POST',
        body: JSON.stringify({ user_id: userId })
    });
}

async function removeMemberFromProject(projectId, userId) {
    return apiFetch(`/projects/${projectId}/remove_member/`, {
        method: 'POST',
        body: JSON.stringify({ user_id: userId })
    });
}

async function searchUsers(query) {
    return apiFetch(`/users/?search=${query}`);
}

async function fetchTaskDetails(projectId, taskId) {
    return apiFetch(`/projects/${projectId}/tasks/${taskId}/`);
}

async function fetchCommentsForTask(projectId, taskId) {
    return apiFetch(`/projects/${projectId}/tasks/${taskId}/comments/`);
}

async function postComment(projectId, taskId, commentBody) {
    return apiFetch(`/projects/${projectId}/tasks/${taskId}/comments/`, {
        method: 'POST',
        body: JSON.stringify({ body: commentBody })
    });
}