async function checkAuth() {
  try {
    const response = await fetch("/check-auth", {
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      window.location.href = "/Admin-Login/admin-login.html";
      return;
    }

    const data = await response.json();
    if (!data.authenticated) {
      window.location.href = "/Admin-Login/admin-login.html";
    }
  } catch (error) {
    console.error("Auth check failed:", error);
    window.location.href = "/Admin-Login/admin-login.html";
  }
}

async function logout() {
  try {
    const response = await fetch("/logout", {
      method: "POST",
      credentials: "include",
    });

    // Force a redirect instead of history replacement
    window.location.href = "/Admin-Login/admin-login.html";
  } catch (error) {
    console.error("Logout error:", error);
  }
}

document.addEventListener("DOMContentLoaded", async function (e) {
  e.preventDefault();

  // Navigation
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll(".main-section");

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const sectionId = this.dataset.section;

      // Hide all sections
      sections.forEach((section) => (section.style.display = "none"));

      // Show selected section
      document.getElementById(sectionId).style.display = "block";

      // Update active link
      navLinks.forEach((link) => link.classList.remove("active"));
      this.classList.add("active");
    });
  });

  const projectModal = document.querySelector(".modal");
  const addButton = document.getElementById("addProjectBtn");
  const cancelBtn = document.querySelector(".cancel-btn");

  addButton.addEventListener("click", () => {
    projectModal.style.display = "flex";
  });

  cancelBtn.addEventListener("click", () => {
    projectModal.style.display = "none";
  });

  const projectsGrid = document.querySelector(".projects-grid"); // Adjust the selector based on your HTML

  // Load projects
  async function loadProjects() {
    try {
      const response = await fetch("http://localhost:3000/api/projects");
      const projects = await response.json();

      projectsGrid.innerHTML = projects
        .map(
          (project) => `
            <div class="project-card" data-id="${project.id}">
                <img src="/images/${project.image_url}" alt="${project.title}">
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                <div class="card-actions">
                    <button class="edit-btn" onclick="">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" onclick="deleteProject(${project.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `
        )
        .join("");
    } catch (error) {
      console.error("Error loading projects:", error);
    }
  }

  deleteProject = async (id) => {
    try {
      await fetch(`http://localhost:3000/api/projects/${id}`, {
        method: "DELETE",
      });
      loadProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const projectForm = document.getElementById("projectForm");
  projectForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    await addProject();
    projectForm.reset();
    projectModal.style.display = "none";
  });

  const titleInput = document.getElementById("projectTitle");
  const descriptionInput = document.getElementById("projectDescription");
  const imageInput = document.getElementById("projectImage");

  // add project
  const addProject = async () => {
    try {
      // Send a POST request to add a new project
      const response = await fetch("http://localhost:3000/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: titleInput.value,
          description: descriptionInput.value,
          image_url: imageInput.value,
        }), // Adjust the default values as needed
      });

      const data = await response.json();
      if (data.success) {
        await loadProjects();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error adding project:", error);
      alert("Failed to add project: " + error.message);
    }
  };

  // Edit project function
  const editProjectModal = document.getElementById("editProjectModal");
  const editForm = document.getElementById("editProjectForm");
  const editCancel = document.getElementById("editCancel");

  const editTitleInput = document.getElementById("editProjectTitle");
  const editDescriptionInput = document.getElementById(
    "editProjectDescription"
  );
  const editImageInput = document.getElementById("editProjectImage");

  projectsGrid.addEventListener("click", async (e) => {
    e.preventDefault();
    const editBtn = e.target.closest(".edit-btn");
    const projectCard = e.target.closest(".project-card");
    if (editBtn) {
      editProjectModal.style.display = "flex";
      editForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        await editProject(projectCard.dataset.id);
        editForm.reset();
        editProjectModal.style.display = "none";
        loadProjects();
      });
    }
  });

  editCancel.addEventListener("click", () => {
    editProjectModal.style.display = "none";
  });

  editProject = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/projects/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editTitleInput.value,
          description: editDescriptionInput.value,
          image_url: editImageInput.value,
        }),
      });
    } catch {
      console.error("Error adding project:", error);
      alert("Failed to add project: " + error.message);
    }
  };
  // End of edit project function
  // Log out direction
  const logoutBtn = document.getElementById("logoutBtn");
  const logoutModal = document.getElementById("logoutModal");
  logoutBtn.addEventListener("click", () => {
    logoutModal.style.display = "flex";
  });

  const logoutConfirmBtn = document.getElementById("logoutConfirm");
  const logoutCancelBtn = document.getElementById("logoutCancel");

  logoutConfirmBtn.addEventListener("click", async () => {
    try {
      const response = await fetch("http://localhost:3000/logout", {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();
      if (data.success) {
        // Clear any cached authentication state
        sessionStorage.clear();
        localStorage.removeItem("isLoggedIn"); // If you're using localStorage for any login state

        // Force a complete page reload to the login page
        window.location.replace("/Admin-Login/admin-login.html");
      } else {
        console.error("Logout failed:", data.message);
        alert("Logout failed. Please try again.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("Logout failed. Please check your connection and try again.");
    }
  });

  logoutCancelBtn.addEventListener("click", () => {
    logoutModal.style.display = "none";
  });

  // Auth check on page load - add this
  document.addEventListener("DOMContentLoaded", async () => {
    try {
      const response = await fetch("http://localhost:3000/check-auth", {
        credentials: "include",
        cache: "no-store", // Prevent caching
      });

      if (!response.ok) {
        window.location.replace("/Admin-Login/admin-login.html");
        return;
      }

      const data = await response.json();
      if (!data.authenticated) {
        window.location.replace("/Admin-Login/admin-login.html");
        return;
      }

      // Continue loading the page
      loadProjects();
    } catch (error) {
      console.error("Auth check error:", error);
      window.location.replace("/Admin-Login/admin-login.html");
    }
  });

  // End of log out direction
  // About Me Section

  const skillsList = document.getElementById("skillsList");

  const loadSkills = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/skills");
      const data = await response.json();
      skillsList.innerHTML = data
        .map(
          (skill) => `
            <div class="skill-card" data-id="${skill.id}">
                <div class="card-info">
                    <h1>${skill.skills}</h1>
                    <p>${skill.description}</p>
                </div>
                <div class="card-actions-skill">
                    <button type="button" class="edit-btn-skill">Edit</button>
                    <button type="button" class="remove-skill" onclick="deleteSkills(${skill.id})">×</button>                
                 </div>
            </div>
        `
        )
        .join("");
    } catch (error) {
      console.error("Error loading skills:", error);
    }
  };

  // Delete skill
  deleteSkills = async (id) => {
    try {
      await fetch(`http://localhost:3000/api/skills/${id}`, {
        method: "DELETE",
      });
      loadSkills();
    } catch (error) {
      console.error("Error deleting skill:", error);
    }
  };

  // Add Skills
  const addSkillButton = document.getElementById("addSkill");
  const addSkillModal = document.getElementById("addSkillsModal");
  const cancelSkillButton = document.querySelector(".cancel-btn");
  const skillForm = document.getElementById("skillForm");

  const addSkills = async () => {
    const skillInput = document.getElementById("skill").value;
    const skillDescription = document.getElementById("skillDescription").value;

    try {
      // Send a POST request to add a new project
      const response = await fetch("http://localhost:3000/api/skills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skills: skillInput,
          description: skillDescription,
        }), // Adjust the default values as needed
      });

      const data = await response.json();
      if (data.success) {
        await loadSkills();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error adding skill:", error);
      alert("Failed to add skill: " + error.message);
    }
  };

  addSkillButton.addEventListener("click", () => {
    addSkillModal.style.display = "flex";
  });

  cancelSkillButton.addEventListener("click", () => {
    addSkillModal.style.display = "none";
  });

  skillForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    await addSkills();
    skillForm.reset();
    addSkillModal.style.display = "none";
  });

  // End of Add Skills
  // Edit Skills

  const editSkillModal = document.getElementById("editSkillModal");
  const editCancelSkill = document.querySelector(".cancel-btn");
  const editSkillForm = document.getElementById("editSkillForm");

  editCancelSkill.addEventListener("click", () => {
    editSkillModal.style.display = "none";
  });

  editSkills = async (id) => {
    try {
      const editSkillInput = document.getElementById("editSkill").value;
      const editSkillDescription = document.getElementById(
        "editSkillDescription"
      ).value;
      const response = await fetch(`http://localhost:3000/api/skills/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skills: editSkillInput,
          description: editSkillDescription,
        }),
      });
    } catch (error) {
      console.error("Error adding project:", error);
      alert("Failed to add project: " + error.message);
    }
  };

  skillsList.addEventListener("click", async (e) => {
    e.preventDefault();
    const editSkillBtn = e.target.closest(".edit-btn-skill");
    const skillCard = e.target.closest(".skill-card");
    if (editSkillBtn) {
      editSkillModal.style.display = "flex";
      editSkillForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        await editSkills(skillCard.dataset.id);
        editSkillForm.reset();
        editSkillModal.style.display = "none";
        loadSkills();
      });
    }
  });
  loadProjects();
  loadSkills();
});
