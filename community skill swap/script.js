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

// Event listeners for top buttons
signupBtn.addEventListener('click', showSignup);
signinBtn.addEventListener('click', showSignin);

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
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signup-username').value.trim();
    const password = document.getElementById('signup-password').value.trim();

    if (!username || !password) {
        alert('Please enter username and password.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
            credentials: 'include'
        });
        const data = await response.json();
        if (response.ok) {
            alert('Signup successful! Please sign in.');
            signupForm.reset();
            showSignin();
        } else {
            alert(data.error);
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
});

// Signin form submit
signinForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signin-username').value.trim();
    const password = document.getElementById('signin-password').value.trim();

    try {
        const response = await fetch('http://localhost:3000/signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
            credentials: 'include'
        });
        const data = await response.json();
        if (response.ok) {
            currentUser = data.user;
            updateUIForLoggedIn();
            signinForm.reset();
        } else {
            alert(data.error);
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
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
skillForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const offerSkill = document.getElementById('offer-skill').value.trim();
    const requireSkill = document.getElementById('require-skill').value.trim();

    if (!offerSkill || !requireSkill) {
        alert('Please enter both offered and required skills.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/update-skills', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ offerSkill, requireSkill }),
            credentials: 'include'
        });
        const data = await response.json();
        if (response.ok) {
            currentUser.offerSkill = offerSkill;
            currentUser.requireSkill = requireSkill;
            offeredSkillSpan.textContent = offerSkill;
            requiredSkillSpan.textContent = requireSkill;
            showMatches();
            skillForm.reset();
        } else {
            alert(data.error);
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
});

// Show matches based on skill exchange logic
async function showMatches() {
    matchList.innerHTML = '';
    if (!currentUser) return;

    try {
        const response = await fetch('http://localhost:3000/matches');
        const data = await response.json();
        if (response.ok) {
            const matches = data.matches;
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
        } else {
            alert(data.error);
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

// Initial UI setup
updateUIForLoggedOut();
