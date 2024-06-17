const PHP_AUTH_USER = "mokapen";
const PHP_AUTH_PW = "mokapen";

const encodedCredentials = btoa(`${PHP_AUTH_USER}:${PHP_AUTH_PW}`);

document.getElementById("loginButton").addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Create a request object with the email and password as the body.
  const requestData = {
    email,
    password,
  };

  // Convert the request data to a JSON string.
  const requestBody = JSON.stringify(requestData);

  // Create headers with Authorization.
  const headers = new Headers();
  headers.append("Authorization", `Basic ${encodedCredentials}`);
  headers.append("Content-Type", "application/json");

  // Create the request object.
  const request = new Request(`https://mokapen.com/api/login`, {
    method: "POST",
    headers: headers,
    mode: "cors",
    body: requestBody,
  });

  // Call the fetch() function with the request object.
  fetch(request)
    .then((response) => {
      // Check the response status code.

      console.log(response);

      if (response.status === 200) {
        window.location.href = "dashboard.html";
        return response.json();
      } else {
        //    window.location.href = 'dashboard.html';
        throw new Error("Response status is not 200");
      }
    })
    .then((data) => {
      // Handle the success response.
      console.log(data);
      console.log("Response status 200");
    })
    .catch((error) => {
      // Handle the error.

      console.error("Error:", error);
    });
});
