/*************************************
 * Name: Supriya Mutharasan
 * Seneca Hackathon
 * Date: 1/3/2021
 ********************************/
// Initialize DOM selectors
let homeHeader = document.querySelector('.header');
let homehamburgerMenu = document.querySelector('.hamburgerMenu');

// PC View only
window.addEventListener('scroll', function () {
  let wPOS = window.scrollY > 5;
  homeHeader.classList.toggle('active', wPOS);
});
// Mobile View only
homehamburgerMenu.addEventListener('click', function () {
  homeHeader.classList.toggle('menuToggled');
});

document
  .getElementById('signInForm')
  .addEventListener('submit', signInFormValidate);

function signInFormValidate(givenEvent) {
  const passwordExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

  var validationFlag = true;

  var signInFormUsername = document.getElementById('signInFormUsername');
  var tester = document.getElementsByName('signInFormPassword');
  console.log(tester);
  var signInFormPassword = document.getElementById('signInFormPassword');

  refreshModal(signInFormUsername, signInFormPassword);

  if (signInFormUsername.value === '') {
    signInFormUsername.classList.add('is-invalid');
    validationFlag = false;
  } else {
    signInFormUsername.classList.add('is-valid');
  }

  if (!signInFormPassword.value.match(passwordExp)) {
    signInFormPassword.classList.add('is-invalid');
    validationFlag = false;
  } else {
    signInFormPassword.classList.add('is-valid');
  }

  if (!validationFlag) {
    givenEvent.preventDefault();
  }
}

document
  .getElementById('signUpForm')
  .addEventListener('submit', signUpFormValidate);

function signUpFormValidate(givenEvent) {
  /*Minimum ten characters, at least one uppercase letter, one lowercase letter, one number and one special character: */
  const passwordExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
  var validationFlag = true;

  var signUpFormFirstName = document.getElementById('signUpFormFirstName');
  var signUpFormLastName = document.getElementById('signUpFormLastName');
  var signUpFormUsername = document.getElementById('signUpFormUsername');
  var signUpFormEmail = document.getElementById('signUpFormEmail');
  var signUpFormPassword = document.getElementById('signUpFormPassword');

  refreshModal(
    signUpFormFirstName,
    signUpFormLastName,
    signUpFormUsername,
    signUpFormEmail,
    signUpFormPassword
  );

  if (signUpFormFirstName.value === '') {
    signUpFormFirstName.classList.add('is-invalid');
    validationFlag = false;
  } else {
    signUpFormFirstName.classList.add('is-valid');
  }

  if (signUpFormLastName.value === '') {
    signUpFormLastName.classList.add('is-invalid');
    validationFlag = false;
  } else {
    signUpFormLastName.classList.add('is-valid');
  }

  if (signUpFormUsername.value === '') {
    signUpFormUsername.classList.add('is-invalid');
    validationFlag = false;
  } else {
    signUpFormUsername.classList.add('is-valid');
  }

  if (signUpFormEmail.value === '') {
    signUpFormEmail.classList.add('is-invalid');
    validationFlag = false;
  } else {
    signUpFormEmail.classList.add('is-valid');
  }

  if (!signUpFormPassword.value.match(passwordExp)) {
    signUpFormPassword.classList.add('is-invalid');
    validationFlag = false;
  } else {
    signUpFormPassword.classList.add('is-valid');
  }

  if (!validationFlag) {
    givenEvent.preventDefault();
  }
}

function refreshModal(...givenArgs) {
  givenArgs.forEach((element) => {
    element.classList.remove('is-invalid');
    element.classList.remove('is-valid');
  });
}
