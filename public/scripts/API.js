const API = {
  endpoint: "/auth/",
  // ADD HERE ALL THE OTHER API FUNCTIONS
  login: async function (user) {
    return await this.makePostRequest(`${this.endpoint}login`, user);
  },
  loginFromGoogle: async (data) => {
    return await API.makePostRequest(`${API.endpoint}login-google`, data);
  },
  register: async function (user) {
    return await this.makePostRequest(`${this.endpoint}register`, user);
  },

  makePostRequest: async (url, data) => {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  },
};

export default API;
