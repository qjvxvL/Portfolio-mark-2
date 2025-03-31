// ----------SideMenu----------
document.addEventListener("DOMContentLoaded", function () {
  var sideMenu = document.getElementById("sideMenu");
  function openMenu() {
    sideMenu.style.right = "0";
  }
  function closeMenu() {
    sideMenu.style.right = "-200px";
  }

  var exit = document.querySelector(".exit");

  const scriptURL =
    "https://script.google.com/macros/s/AKfycbx7tg6Qtzi36ANK6d6WFGJK5nufIGzgYKKP9I3QL7l8NMvX6PIq42eqg3SDalZIBSQ6/exec";
  const form = document.forms["submit-to-google-sheet"];
  const msg = document.getElementById("msg");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    fetch(scriptURL, { method: "POST", body: new FormData(form) })
      .then((response) => {
        msg.innerHTML = "Message Sent Successfully!";
        msg.classList.add("show");
        setTimeout(function () {
          msg.classList.remove("show");
          msg.innerHTML = "";
        }, 3000);
        form.reset();
      })
      .catch((error) => console.error("Error!", error.message));
  });

  const workList = document.querySelector(".work-list");

  async function loadProjects() {
    try {
      const response = await fetch("http://localhost:3000/api/projects");
      const projects = await response.json();

      workList.innerHTML = projects
        .map(
          (project) => `
        <div class="work">
            <img src="/images/${project.image_url}" alt="" />
            <div class="layer">
              <h3>${project.title}</h3>
              <p>${project.description}</p>
            </div>
          </div>
          `
        )
        .join("");
    } catch (error) {
      console.error("Error loading projects:", error);
    }
  }

  const skillsList = document.getElementById("skills");

  async function loadSkills() {
    try {
      const response = await fetch("http://localhost:3000/api/skills");
      const skills = await response.json();

      skillsList.innerHTML = skills
        .map(
          (skill) => `
          <ul>
            <li><span>${skill.skills}</span><br>${skill.description}</li>
          </ul>
          `
        )
        .join("");
    } catch (error) {
      console.error("Error loading projects:", error);
    }
  }

  loadSkills();
  loadProjects();
});
