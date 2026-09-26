
const form = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const formMessage = document.getElementById("formMessage");
const loginBtn = document.getElementById("loginBtn");
const togglePasswordBtn = document.getElementById("togglePassword");


async function checkExistingSession() {
  const { data } = await db.auth.getSession();
  if (data.session) {
    window.location.href = "profile.html";
  }
}
checkExistingSession();

togglePasswordBtn.addEventListener("click", () => {
  const isHidden = passwordInput.type === "password";
  passwordInput.type = isHidden ? "text" : "password";
  togglePasswordBtn.textContent = isHidden ? "Нуух" : "Харах";
  togglePasswordBtn.setAttribute(
    "aria-label",
    isHidden ? "Нууц үг нуух" : "Нууц үг харуулах"
  );
});


function showMessage(text, type = "error") {
  formMessage.textContent = text;
  formMessage.className = `form-message is-${type}`;
  formMessage.hidden = false;
}

function clearErrors() {
  formMessage.hidden = true;
  emailError.textContent = "";
  passwordError.textContent = "";
  emailInput.classList.remove("is-invalid");
  passwordInput.classList.remove("is-invalid");
}

function setLoading(isLoading) {
  loginBtn.disabled = isLoading;
  loginBtn.classList.toggle("is-loading", isLoading);
  loginBtn.querySelector(".btn-primary__text").textContent = isLoading
    ? "Нэвтэрч байна..."
    : "Нэвтрэх";
}


function validate(email, password) {
  let isValid = true;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    emailError.textContent = "Email хаягаа оруулна уу.";
    emailInput.classList.add("is-invalid");
    isValid = false;
  } else if (!emailPattern.test(email)) {
    emailError.textContent = "Email хаягийн формат буруу байна.";
    emailInput.classList.add("is-invalid");
    isValid = false;
  }

  if (!password) {
    passwordError.textContent = "Нууц үгээ оруулна уу.";
    passwordInput.classList.add("is-invalid");
    isValid = false;
  } else if (password.length < 6) {
    passwordError.textContent = "Нууц үг хамгийн багадаа 6 тэмдэгт байна.";
    passwordInput.classList.add("is-invalid");
    isValid = false;
  }

  return isValid;
}

function translateError(error) {
  const msg = (error.message || "").toLowerCase();

  if (msg.includes("invalid login credentials")) {
    return " Email эсвэл нууц үг буруу байна.";
  }
  if (msg.includes("email not confirmed")) {
    return "Email хаяг баталгаажаагүй байна. Email-ээ шалгана уу.";
  }
  if (msg.includes("failed to fetch") || msg.includes("network")) {
    return "Сервертэй холбогдож чадсангүй. Интернэт холболтоо шалгана уу.";
  }
  if (msg.includes("rate limit") || msg.includes("too many")) {
    return "Хэт олон удаа оролдлоо. Хэдэн минут хүлээгээд дахин оролдоно уу.";
  }
  return "Нэвтрэх үед алдаа гарлаа: " + error.message;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearErrors();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!validate(email, password)) return;

  setLoading(true);

  try {
    const { data, error } = await db.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      showMessage(translateError(error), "error");
      passwordInput.value = "";
      passwordInput.focus();
      setLoading(false);
      return;
    }

    showMessage("Амжилттай нэвтэрлээ. Шилжиж байна...", "success");
    setTimeout(() => {
      window.location.href = "profile.html";
    }, 600);
  } catch (err) {
    showMessage(translateError(err), "error");
    setLoading(false);
  }
});
