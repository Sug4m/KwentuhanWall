document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const loginModal = document.getElementById('loginModal');
    const openModalBtns = document.querySelectorAll('.open-modal-btn'); 
    const closeModalBtn = document.getElementById('closeModalBtn'); 
    const loginSubmitBtn = document.getElementById('loginSubmitBtn');
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');

    const togglePasswordBtn = document.getElementById('togglePasswordBtn');
    const eyeOffIcon = document.getElementById('eyeOffIcon');
    const eyeIcon = document.getElementById('eyeIcon');

    // 1. Open Modal
    openModalBtns.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            if (loginModal) {
                loginModal.style.display = 'flex';
            }
        });
    });

    // 2. Close modal
    if (closeModalBtn && loginModal) {
        closeModalBtn.addEventListener('click', function () {
            loginModal.style.display = 'none';
        });
    }

    if (loginModal) {
        loginModal.addEventListener('click', function (e) {
            if (e.target === loginModal) {
                loginModal.style.display = 'none';
            }
        });
    }

    // 3. Password Visibility Toggle
    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', function () {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);

            if (type === 'text') {
                eyeOffIcon.style.display = 'none';
                eyeIcon.style.display = 'block';
            } else {
                eyeOffIcon.style.display = 'block';
                eyeIcon.style.display = 'none';
            }
        });
    }

    // 4. Form Validation bago mag-log in
    if (loginSubmitBtn) {
        loginSubmitBtn.addEventListener('click', function(e) {
            if (emailInput.value.trim() === '' || passwordInput.value.trim() === '') {
                e.preventDefault();
                alert('Pakisagutan muna ang email at password.');
            }
        });
    }
});

// 5. Google Sign-In 
function handleCredentialResponse(response) {
    console.log("Encoded JWT ID token: " + response.credential);
    window.location.href = "home.html";
}

// Function na mag-hahandle kapag nakapag-login na ang user
function handleCredentialResponse(response) {
    console.log="Encoded JWT ID token: " + response.credential;
    // Ilagay dito ang susunod mong code pagka-login
}

window.onload = function () {
    google.accounts.id.initialize({
        client_id: "766337207-5ufuj02bejmruogmtl77bm70etaubedr.apps.googleusercontent.com",
        callback: handleCredentialResponse
    });
    
    // Alisin ang 'width' property dito para maging flexible
    google.accounts.id.renderButton(
        document.getElementById("buttonDiv"),
        { theme: "outline", size: "large" } 
    );
};