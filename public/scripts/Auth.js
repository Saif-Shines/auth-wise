import API from "./API.js";
import Router from "./Router.js";

const Auth = {
  isLoggedIn: false,
  account: null,
  loginStep: 1,
  async postLogin(response, user) {
    if (response.ok) {
      this.isLoggedIn = true;
      this.account = user;
      this.updateStatus();
      Router.go("/account");
    } else {
      alert(response.message);
    }
    if (window.PasswordCredential && user.password) {
      const credentials = new PasswordCredential({
        id: user.email,
        password: user.password,
        name: user.name,
      });
      navigator.credentials.store(credentials);
    }
  },
  async loginFromGoogle(data) {
    const response = await API.loginFromGoogle({ credential: data });
    this.postLogin(response, {
      name: response.name,
      email: response.email,
    });
  },
  async register(event) {
    event.preventDefault();
    const user = {
      name: document.getElementById("register_name").value,
      email: document.getElementById("register_email").value,
      password: document.getElementById("register_password").value,
    };
    const response = await API.register(user);
    this.postLogin(response, user);
  },
  checkAuthnOptions: async () => {
    const response = await API.checkAuthOptions({
      email: document.getElementById("login_email").value,
    });
    Auth.loginStep = 2;
    if (response.password) {
      document.getElementById("login_section_password").hidden = false;
    }
    if (response.webauthn) {
      document.getElementById("login_section_webauthn").hidden = false;
    }
  },
  addWebAuthn: async () => {
    const options = await API.webAuthn.registrationOptions();
    options.authenticatorSelection.residentKey = "required";
    options.authenticatorSelection.requireResidentKey = true;
    options.extensions = {
      credProps: true,
    };
    const authRes = await SimpleWebAuthnBrowser.startRegistration(options);
    const verificationRes = await API.webAuthn.registrationVerification(
      authRes
    );
    if (verificationRes.ok) {
      alert("You can now login using the registered method!");
    } else {
      alert(verificationRes.message);
    }
  },
  async login(event) {
    if (event) event.preventDefault();
    if (Auth.loginStep == 1) {
      console.info("check login options");
      Auth.checkAuthnOptions();
    } else {
      // Step 2
      const credentials = {
        email: document.getElementById("login_email").value,
        password: document.getElementById("login_password").value,
      };
      const response = await API.login(credentials);
      this.postLogin(response, {
        ...credentials,
        name: response.name,
      });
    }
  },
  async autoLogin() {
    if (window.PasswordCredential) {
      const credentials = await navigator.credentials.get({ password: true });
      if (credentials) {
        document.getElementById("login_email").value = credentials?.id;
        document.getElementById("login_password").value = credentials?.password;
        Auth.login();
        console.log(credentials);
      }
    }
  },
  logout() {
    this.isLoggedIn = false;
    this.account = null;
    this.updateStatus();
    Router.go("/");
    if (window.PasswordCredential) {
      navigator.credentials.preventSilentAccess();
    }
  },
  updateStatus() {
    if (Auth.isLoggedIn && Auth.account) {
      document
        .querySelectorAll(".logged_out")
        .forEach((e) => (e.style.display = "none"));
      document
        .querySelectorAll(".logged_in")
        .forEach((e) => (e.style.display = "block"));
      document
        .querySelectorAll(".account_name")
        .forEach((e) => (e.innerHTML = Auth.account.name));
      document
        .querySelectorAll(".account_username")
        .forEach((e) => (e.innerHTML = Auth.account.email));
    } else {
      document
        .querySelectorAll(".logged_out")
        .forEach((e) => (e.style.display = "block"));
      document
        .querySelectorAll(".logged_in")
        .forEach((e) => (e.style.display = "none"));
    }
  },
  init: () => {
    document.getElementById("login_section_password").hidden = true;
    document.getElementById("login_section_webauthn").hidden = true;
  },
};
Auth.updateStatus();
Auth.autoLogin();
Auth.init();

export default Auth;

// make it a global object
window.Auth = Auth;
