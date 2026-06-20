const signupBtn = document.getElementById('signup-btn');
const signinBtn = document.getElementById('signin-btn');
const signoutBtn = document.getElementById('signout-btn');

const signupFormDiv = document.getElementById('signup-form');
const signinFormDiv = document.getElementById('signin-form');
const authSection = document.getElementById('auth-section');
const dashboard = document.getElementById('dashboard');

const signupForm = document.getElementById('signup');
const signinForm = document.getElementById('signin');
const skillForm = document.getElementById('skill-form');

const userNameSpan = document.getElementById('user-name');
const offeredSkillSpan = document.getElementById('offered-skill');
const requiredSkillSpan = document.getElementById('required-skill');
const matchList = document.getElementById('match-list');

let currentUser = null;

// Utility to get users from localStorage
function getUsers() {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
}

// Utility to save users to localStorage
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// Show/hide forms
function showSignup() {
    signupFormDiv.style.display = 'block';
    signinFormDiv.style.display = 'none';
}

function showSignin() {
    signupFormDiv.style.display = 'none';
    signinFormDiv.style.display = 'block';
}

function updateUIForLoggedIn() {
    authSection.style.display = 'none';
    dashboard.style.display = 'block';
    signoutBtn.style.display = 'inline-block';
    signinBtn.style.display = 'none';
    signupBtn.style.display = 'none';
    userNameSpan.textContent = currentUser.username;
    offeredSkillSpan.textContent = currentUser.offerSkill || 'None';
    requiredSkillSpan.textContent = currentUser.requireSkill || 'None';
    showMatches();
}

function updateUIForLoggedOut() {
    authSection.style.display = 'block';
    dashboard.style.display = 'none';
    signoutBtn.style.display = 'none';
    signinBtn.style.display = 'inline-block';
    signupBtn.style.display = 'inline-block';
    showSignin();
    currentUser = null;
}

// Signup form submit
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('signup-username').value.trim();
    const password = document.getElementById('signup-password').value.trim();

    if (!username || !password) {
        alert('Please enter username and password.');
        return;
    }

    let users = getUsers();
    if (users.find(u => u.username === username)) {
        alert('Username already exists. Please choose another.');
        return;
    }

    const newUser = {
        username,
        password,
        offerSkill: '',
        requireSkill: ''
    };
    users.push(newUser);
    saveUsers(users);
    alert('Signup successful! Please sign in.');
    signupForm.reset();
    showSignin();
});

// Signin form submit
signinForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('signin-username').value.trim();
    const password = document.getElementById('signin-password').value.trim();

    let users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        alert('Invalid username or password.');
        return;
    }
    currentUser = user;
    updateUIForLoggedIn();
    signinForm.reset();
});

// Signout button click
signoutBtn.addEventListener('click', () => {
    currentUser = null;
    updateUIForLoggedOut();
});

// Switch links
document.getElementById('switch-to-signin').addEventListener('click', (e) => {
    e.preventDefault();
    showSignin();
});
document.getElementById('switch-to-signup').addEventListener('click', (e) => {
    e.preventDefault();
    showSignup();
});

// Skill form submit
skillForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const offerSkill = document.getElementById('offer-skill').value.trim();
    const requireSkill = document.getElementById('require-skill').value.trim();

    if (!offerSkill || !requireSkill) {
        alert('Please enter both offered and required skills.');
        return;
    }

    currentUser.offerSkill = offerSkill;
    currentUser.requireSkill = requireSkill;

    // Update user in localStorage
    let users = getUsers();
    const index = users.findIndex(u => u.username === currentUser.username);
    if (index !== -1) {
        users[index] = currentUser;
        saveUsers(users);
    }

    offeredSkillSpan.textContent = offerSkill;
    requiredSkillSpan.textContent = requireSkill;

    showMatches();
    skillForm.reset();
});

// Show matches based on skill exchange logic
function showMatches() {
    matchList.innerHTML = '';
    if (!currentUser) return;

    let users = getUsers();

    // Find users where their offered skill matches current user's required skill
    // and their required skill matches current user's offered skill
    const matches = users.filter(u => 
        u.username !== currentUser.username &&
        u.offerSkill.toLowerCase() === currentUser.requireSkill.toLowerCase() &&
        u.requireSkill.toLowerCase() === currentUser.offerSkill.toLowerCase()
    );

    if (matches.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No matches found yet.';
        matchList.appendChild(li);
        return;
    }

    matches.forEach(match => {
        const li = document.createElement('li');
        li.textContent = `${match.username} offers "${match.offerSkill}" and requires "${match.requireSkill}"`;
        matchList.appendChild(li);
    });
}

// Initial UI setup
updateUIForLoggedOut();
