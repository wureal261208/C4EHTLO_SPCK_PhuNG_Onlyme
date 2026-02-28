import { auth, dangky, dangnhap, getUserByEmail } from "../../firebaseConfig.js"

let container = document.getElementById('container')

window.toggle = () => {
  container.classList.toggle('sign-in')
  container.classList.toggle('sign-up')
}

setTimeout(() => {
  container.classList.add('sign-in')
}, 200)

// Helper function to get user role
async function getUserRole(email) {
  try {
    // Wait a moment for Firestore to sync
    await new Promise(resolve => setTimeout(resolve, 500));
    const userDoc = await getUserByEmail(email);
    return userDoc?.role || null;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
}

// ────────────────────────────────────────────────
//  HELPER FUNCTIONS
// ────────────────────────────────────────────────
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


// ────────────────────────────────────────────────
//  REGISTER
// ────────────────────────────────────────────────
const registerForm = {
  btn: document.querySelector("#btnRegister"),
  email: document.querySelector("#inputUser"),
  pass: document.querySelector("#inputPass"),
  pass2: document.querySelector("#inputRedeemPass"),
  errEmail: document.querySelector("#errorUserReg"),
  errPass: document.querySelector("#errorPassReg"),
  errPass2: document.querySelector("#errorRedeemPass"),
};

registerForm.btn.addEventListener("click", async (e) => {
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

  // ── Validation ─────────────────────────────────
  let hasError = false;

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (isEmpty(email)) {
    showError(registerForm.errEmail, "Please enter your email");
    hasError = true;
  } else if (!emailRegex.test(email)) {
    showError(registerForm.errEmail, "Please enter a valid email address");
    hasError = true;
  }

  // Password security validation (enhanced version)
  const hasUpperCase = /[A-Z]/.test(pass);
  const hasNumber = /[0-9]/.test(pass);

  // Additional useful checks
  const hasMinLength = pass.length >= 8;
  const hasNoLeadingTrailingSpace = !/^\s|\s$/.test(pass);
  const tooManyRepeatedChars = /(.)\1{3,}/.test(pass);

  if (isEmpty(pass)) {
    showError(registerForm.errPass, "Please enter your password");
    hasError = true
  }
  else if (!hasMinLength) {
    showError(registerForm.errPass, "Password must be at least 8 characters long");
    hasError = true
  }
  else if (!hasUpperCase) {
    showError(registerForm.errPass, "Password must contain at least one uppercase letter (A–Z)");
    hasError = true
  }
  else if (!hasNumber) {
    showError(registerForm.errPass, "Password must contain at least one number (0–9)");
    hasError =true
  }
  else if (!hasNoLeadingTrailingSpace) {
    showError(registerForm.errPass, "Password cannot start or end with a space");
    hasError =true
  }
  else if (tooManyRepeatedChars) {
    showError(registerForm.errPass, "Password cannot contain identical characters in a row");
    hasError =true
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

  // ── Firebase call ──────────────────────────────
  try {
    const result = await dangky(auth, email, pass);

    if (result.isSuccess) {
      localStorage.setItem("user", email);
      alert("Welcome to BookWorm! Please contact admin to set your role.");
      location.href = "../main/index%28acc%29.html";
    } else {
      let msg = "An error occurred";

      switch (result.infoMessage) {
        case "auth/email-already-in-use":
          msg = "This email is already in use";
          break;
        case "auth/invalid-email":
          msg = "Invalid email address";
          break;
        case "auth/weak-password":
          msg = "Password is too weak";
          break;
        default:
          msg = result.infoMessage || msg;
      }

      alert(msg);
    }
  } catch (err) {
    alert("Connection error: " + err.message);
  }
});

// ────────────────────────────────────────────────
//  LOGIN
// ────────────────────────────────────────────────
const loginForm = {
  btn: document.querySelector("#signin-btn"),
  email: document.querySelector("#signin-username"),
  pass: document.querySelector("#signin-password"),
  errEmail: document.querySelector("#errorUserLogin"),
  errPass: document.querySelector("#errorPassLogin"),
};

// Hardcoded admin credentials
const ADMIN_CREDENTIALS = {
  username: 'admin@admin.com',
  password: 'admin123'
};

loginForm.btn.addEventListener("click", async (e) => {
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
  } else if (!emailRegex.test(email)) {
    showError(loginForm.errEmail, "Please enter a valid email address");
    hasError = true;
  }

  if (isEmpty(pass)) {
    showError(loginForm.errPass, "Please enter your password");
    hasError = true;
  }

  if (hasError) return;

  // Check hardcoded admin credentials
  if (email === ADMIN_CREDENTIALS.username && pass === ADMIN_CREDENTIALS.password) {
    localStorage.setItem("user", email);
    localStorage.setItem("userRole", 'admin');
    location.href = "../admin/index(admin).html";
    return;
  }

  try {
    const result = await dangnhap(auth, email, pass);

    if (result.isSuccess) {
      localStorage.setItem("user", email);
      
      // Get user role and redirect accordingly
      const role = await getUserRole(email);
      localStorage.setItem("userRole", role || 'user');
      
      // Redirect based on role
      if (role === 'admin' || role === 'editor') {
        location.href = "../admin/index(admin).html";
      } else {
        location.href = "../main/index%28acc%29.html";
      }
    } else {
      alert("Incorrect email or password");
    }
  } catch (err) {
    alert("Connection error: " + err.message);
  }
});

// Password toggle
document.querySelectorAll('.toggle-password').forEach(icon => {
  icon.style.cursor = 'pointer';
  icon.addEventListener('click', function () {
    const targetId = this.getAttribute('data-target');
    const input = document.getElementById(targetId);
    if (!input) return;

    if (input.type === 'password') {
      input.type = 'text';
      this.classList.remove('bx-show');
      this.classList.add('bx-hide');
    } else {
      input.type = 'password';
      this.classList.remove('bx-hide');
      this.classList.add('bx-show');
    }
  });
});
