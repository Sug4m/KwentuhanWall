document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const loginModal = document.getElementById('loginModal');
    const openModalBtns = document.querySelectorAll('.open-modal-btn'); // Lahat ng button na magbubukas ng modal
    const closeModalBtn = document.getElementById('closeModalBtn'); 
    const loginSubmitBtn = document.getElementById('loginSubmitBtn');
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');

    const togglePasswordBtn = document.getElementById('togglePasswordBtn');
    const eyeOffIcon = document.getElementById('eyeOffIcon');
    const eyeIcon = document.getElementById('eyeIcon');

    // 1. BUBUKSAN ang Modal kapag pinindot ang Log In o Get Started buttons
    openModalBtns.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            if (loginModal) {
                loginModal.style.display = 'flex';
            }
        });
    });

    // 2. ISASARA ang Modal kapag pinindot ang X
    if (closeModalBtn && loginModal) {
        closeModalBtn.addEventListener('click', function () {
            loginModal.style.display = 'none';
        });
    }

    // Isara din ang modal kapag pinindot ang background sa labas
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

// 5. Google Sign-In Callback Response (Nasa labas para ma-access global ni Google)
function handleCredentialResponse(response) {
    console.log("Encoded JWT ID token: " + response.credential);
    window.location.href = "home.html";
}

// 1. I-load ang Facebook SDK nang asynchronous
window.fbAsyncInit = function() {
  FB.init({
    appId      : 1800963204486932, // Palitan ito ng Facebook App ID mo galing sa FB Developers
    cookie     : true,
    xfbml      : true,
    version    : 'v18.0'
  });
};

// I-load ang SDK script sa background
(function(d, s, id){
   var js, fjs = d.getElementsByTagName(s)[0];
   if (d.getElementById(id)) {return;}
   js = d.createElement(s); js.id = id;
   js.src = "https://connect.facebook.net/en_US/sdk.js";
   fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// 2. Event listener para sa Facebook login button kapag pinindot
document.addEventListener('DOMContentLoaded', () => {
  const fbBtn = document.getElementById('fbLoginBtn');
  
  if (fbBtn) {
    fbBtn.addEventListener('click', () => {
      FB.login(function(response) {
        if (response.authResponse) {
          // Kapag matagumpay na nag-log in ang user
          FB.api('/me', {fields: 'name,email'}, function(userInfo) {
            alert('Welcome, ' + userInfo.name + '!');
            // Dito mo na pwedeng ilagay ang susunod na gagawin (hal. itago ang modal o i-redirect)
          });
        } else {
          // Kapag kinansela o hindi itinuloy ng user
          console.log('User cancelled login.');
        }
      }, {scope: 'public_profile,email'});
    });
  }
});