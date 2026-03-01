// Initialize users database in localStorage if not exists
function initUsersDB() {
    if (!localStorage.getItem('users')) {
        const defaultUsers = [
            {
                email: 'admin@bookworm.com',
                password: 'Admin123',
                role: 'admin'
            },
            {
                email: 'user@bookworm.com',
                password: 'User123',
                role: 'user'
            }
        ];
        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
}

// Initialize on page load
initUsersDB();

// Toggle between login and register forms
let container = document.getElementById('container');

window.toggle = () => {
    container.classList.toggle('sign-in');
    container.classList.toggle('sign-up');
};

setTimeout(() => {
    container.classList.add('sign-in');
}, 200);

// Helper functions
const isEmpty = (value) => {
    return value === "" || value === null || value === undefined;
};

const showError = (element, message) => {
    if (element) {
        element.textContent = message;
        element.style.color = "#e74c3c";
        element.style.fontSize = "0.75rem";
        element.style.marginTop = "4px";
        element.style.display = "block";
    }
};

const clearErrors = (...elements) => {
    elements.forEach(el => {
        if (el) {
            el.textContent = "";
        }
    });
};

const getUsers = () => {
    return JSON.parse(localStorage.getItem('users')) || [];
};

const saveUsers = (users) => {
    localStorage.setItem('users', JSON.stringify(users));
};

// Register Form
const registerForm = {
    btn: document.querySelector("#btnRegister"),
    email: document.querySelector("#inputUser"),
    pass: document.querySelector("#inputPass"),
    pass2: document.querySelector("#inputRedeemPass"),
    errEmail: document.querySelector("#errorUserReg"),
    errPass: document.querySelector("#errorPassReg"),
    errPass2: document.querySelector("#errorRedeemPass"),
};

registerForm.btn.addEventListener("click", (e) => {
    e.preventDefault();

    const email = registerForm.email.value.trim();
    const pass = registerForm.pass.value;
    const pass2 = registerForm.pass2.value;

    // Reset errors
    clearErrors(
        registerForm.errEmail,
        registerForm.errPass,
        registerForm.errPass2
    );

    let hasError = false;

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (isEmpty(email)) {
        showError(registerForm.errEmail, "Please enter your email");
        hasError = true;
    } else if (email.includes(' ')) {
        showError(registerForm.errEmail, "Email cannot contain spaces");
        hasError = true;
    } else if (!emailRegex.test(email)) {
        showError(registerForm.errEmail, "Please enter a valid email address");
        hasError = true;
    }

    // Check if email already exists
    const users = getUsers();
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
        showError(registerForm.errEmail, "This email is already registered");
        hasError = true;
    }

    // Password validation
    const hasUpperCase = /[A-Z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasMinLength = pass.length >= 6;

    if (isEmpty(pass)) {
        showError(registerForm.errPass, "Please enter your password");
        hasError = true;
    } else if (!hasMinLength) {
        showError(registerForm.errPass, "Password must be at least 6 characters long");
        hasError = true;
    } else if (!hasUpperCase) {
        showError(registerForm.errPass, "Password must contain at least one uppercase letter (A-Z)");
        hasError = true;
    } else if (!hasNumber) {
        showError(registerForm.errPass, "Password must contain at least one number (0-9)");
        hasError = true;
    }

    // Confirm password validation
    if (isEmpty(pass2)) {
        showError(registerForm.errPass2, "Please confirm your password");
        hasError = true;
    } else if (pass !== pass2) {
        showError(registerForm.errPass2, "Passwords do not match");
        hasError = true;
    }

    if (hasError) return;

    // Save new user
    const newUser = {
        email: email,
        password: pass,
        role: 'user'
    };
    users.push(newUser);
    saveUsers(users);

    // Save current user to localStorage
    localStorage.setItem('currentUser', JSON.stringify(newUser));

    // Redirect to main page
    alert("Registration successful! Welcome to BookWorm!");
    window.location.href = "../main/index(acc).html";
});

// Login Form
const loginForm = {
    btn: document.querySelector("#signin-btn"),
    email: document.querySelector("#signin-username"),
    pass: document.querySelector("#signin-password"),
    errEmail: document.querySelector("#errorUserLogin"),
    errPass: document.querySelector("#errorPassLogin"),
};

loginForm.btn.addEventListener("click", (e) => {
    e.preventDefault();

    const email = loginForm.email.value.trim();
    const pass = loginForm.pass.value;

    clearErrors(loginForm.errEmail, loginForm.errPass);

    let hasError = false;

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (isEmpty(email)) {
        showError(loginForm.errEmail, "Please enter your email");
        hasError = true;
    } else if (email.includes(' ')) {
        showError(loginForm.errEmail, "Email cannot contain spaces");
        hasError = true;
    } else if (!emailRegex.test(email)) {
        showError(loginForm.errEmail, "Please enter a valid email address");
        hasError = true;
    }

    if (isEmpty(pass)) {
        showError(loginForm.errPass, "Please enter your password");
        hasError = true;
    }

    if (hasError) return;

    // Check credentials
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === pass);

    if (!user) {
        showError(loginForm.errEmail, "Invalid email or password");
        return;
    }

<<<<<<< HEAD
    // Save current user to localStorage
=======
// Save current user to localStorage
>>>>>>> parent of fc17dce (conflict?)
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('user', user.email);
    localStorage.setItem('userRole', user.role);

    // Redirect based on role
    alert("Login successful! Welcome back!");
    if (user.role === 'admin') {
        window.location.href = "../admin/index(admin).html";
    } else {
        window.location.href = "../main/index(acc).html";
    }
});
