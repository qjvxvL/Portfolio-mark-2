document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("http://localhost:3000/login", {
      method: "POST",
      credentials: "include", // This is correct
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log("Login successful, redirecting...");
      // Use this instead - it ensures full page load with new cookies
      window.location.href = data.redirectUrl;
    } else {
      console.error("Login failed:", data.message);
      alert(data.message || "Invalid username or password!");
    }
  } catch (error) {
    console.error("Login error:", error);
    alert("Login failed. Please try again.");
  }
});
