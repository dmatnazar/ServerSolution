window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('password').focus()
})


// Get elements
let showHidePassword = document.getElementById("showHidePassword"),
password = document.getElementById("password"),
login_btn = document.getElementById('login_btn'),
error_msg = document.getElementById('error_msg'),
success_msg = document.getElementById('success_msg'),
formSubmit = document.getElementById('formSubmit');

// Event listeners & Functions
if (showHidePassword) {
    showHidePassword.addEventListener("change", () => {
        if(password.type === 'password') {
            password.type = 'text';
        } else {
            password.type = 'password';
        }
    });
}


if(login_btn){
    login_btn.addEventListener('click', () => {
        let windowName = window.authWindow.getWindowName()
        if(!password.value){
            error_msg.innerText = 'Inputs cannot be empty';
        } else if(password.value !== window.authWindow.getAdminPass()){
            error_msg.innerText = 'Nädogry parol';
        } else {
            error_msg.style.display = 'none';
            success_msg.innerText = 'Successfully';
            // window.authWindow.authSuccessfully()
            if(windowName === 'createAboutWindow'){
                window.authWindow.openAboutWindow()
            }  else if (windowName === 'createConnectionWindow'){
                window.authWindow.openConnectionWindow()
            }
           
        }
    })
}
if(formSubmit){
    formSubmit.addEventListener('submit', (e) => {
        e.preventDefault()
    })
}



password.addEventListener('change', () => {
    error_msg.innerText = '';
})

