document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (data.success) {
      alert("Login successful!");
      window.location.href = "/Dashboard-Admin/admin.html";
    } else {
      alert("Invalid username or password!");
    }
  } catch (error) {
    console.error("Login error:", error);
    alert("Login failed!");
  }
});
