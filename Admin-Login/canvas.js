document.addEventListener("DOMContentLoaded", function () {
  // nodes network canvas

  const networkCanvas = document.getElementById("canvas");
  const heroSection = document.querySelector("body");

  if (!networkCanvas || !heroSection) return;

  const ctx = networkCanvas.getContext("2d");

  // Get hero section position and dimensions
  function updateCanvasSize() {
    const heroRect = heroSection.getBoundingClientRect();

    // Position canvas to cover only the hero section
    networkCanvas.style.position = "absolute";
    networkCanvas.style.top = "0";
    networkCanvas.style.left = "0";
    networkCanvas.style.zIndex = "-1"; // Place behind content

    // Set canvas size to match window width and hero height
    networkCanvas.width = window.innerWidth;
    networkCanvas.height = heroRect.height;
  }

  // Initial size and position
  updateCanvasSize();

  // Update canvas size on window resize
  window.addEventListener("resize", function () {
    updateCanvasSize();
    init(); // Reinitialize nodes when resizing
  });

  // Track mouse position
  let mouse = {
    x: null,
    y: null,
    radius: 150,
  };

  window.addEventListener("mousemove", (event) => {
    const heroRect = heroSection.getBoundingClientRect();

    // Only track mouse if it's in the hero section
    if (event.clientY <= heroRect.bottom) {
      mouse.x = event.x;
      mouse.y = event.y;
    } else {
      mouse.x = null;
      mouse.y = null;
    }
  });

  // Node class
  class Node {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.size = Math.random() * 2 + 1;
      this.baseX = x;
      this.baseY = y;
      this.density = Math.random() * 30 + 1;
      this.distance = 0;
      this.velocity = {
        x: Math.random() * 1 - 0.5,
        y: Math.random() * 1 - 0.5,
      };
      this.affected = false;
      this.affectedTimer = 0;
    }

    draw() {
      ctx.fillStyle = this.affected
        ? "rgba(255, 220, 150, 0.9)"
        : "rgba(255, 200, 100, 0.7)";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    }

    update() {
      // Calculate distance between mouse and node
      if (mouse.x && mouse.y) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        this.distance = distance;

        // Move node away from mouse
        if (distance < mouse.radius) {
          this.affected = true;
          this.affectedTimer = 30; // Keep affected for 30 frames

          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const force = (mouse.radius - distance) / mouse.radius;

          // Add force to velocity
          this.velocity.x -= forceDirectionX * force * 1.5;
          this.velocity.y -= forceDirectionY * force * 1.5;
        } else if (this.affectedTimer > 0) {
          this.affectedTimer--;
          if (this.affectedTimer <= 0) {
            this.affected = false;
          }
        }
      }

      // Apply velocity with damping
      this.x += this.velocity.x;
      this.y += this.velocity.y;
      this.velocity.x *= 0.95;
      this.velocity.y *= 0.95;

      // Add slight random movement
      if (Math.random() < 0.03) {
        this.velocity.x += (Math.random() * 2 - 1) * 0.2;
        this.velocity.y += (Math.random() * 2 - 1) * 0.2;
      }

      // Boundary checking
      if (this.x < 0 || this.x > networkCanvas.width) {
        this.velocity.x *= -1;
      }
      if (this.y < 0 || this.y > networkCanvas.height) {
        this.velocity.y *= -1;
      }

      // Keep nodes on screen
      this.x = Math.max(0, Math.min(networkCanvas.width, this.x));
      this.y = Math.max(0, Math.min(networkCanvas.height, this.y));
    }
  }

  // Create nodes
  let nodes = [];
  const nodeCount = 100; // Adjust based on desired density

  function init() {
    nodes = [];
    for (let i = 0; i < nodeCount; i++) {
      const x = Math.random() * networkCanvas.width;
      const y = Math.random() * networkCanvas.height;
      nodes.push(new Node(x, y));
    }
  }

  // Draw connections between nodes
  function drawConnections() {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const maxDistance = 120;
        if (distance < maxDistance) {
          // Calculate opacity based on distance
          const opacity = 1 - distance / maxDistance;

          // Enhance connection brightness if either node is affected
          const brightnessFactor =
            nodes[i].affected || nodes[j].affected ? 0.8 : 0.5;

          ctx.strokeStyle = `rgba(255, 200, 100, ${
            opacity * brightnessFactor
          })`;
          ctx.lineWidth = nodes[i].affected && nodes[j].affected ? 0.8 : 0.4;

          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }
  }

  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, networkCanvas.width, networkCanvas.height);

    // Update and draw all nodes
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].update();
      nodes[i].draw();
    }

    drawConnections();
    requestAnimationFrame(animate);
  }

  // Initialize and start animation
  init();
  animate();

  // Add touch support for mobile devices
  window.addEventListener("touchmove", (event) => {
    const heroRect = heroSection.getBoundingClientRect();

    // Only track touch if it's in the hero section
    if (event.touches[0].clientY <= heroRect.bottom) {
      mouse.x = event.touches[0].clientX;
      mouse.y = event.touches[0].clientY;
    } else {
      mouse.x = null;
      mouse.y = null;
    }
  });

  window.addEventListener("touchend", () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Reset mouse position when leaving hero section
  window.addEventListener("mouseleave", () => {
    mouse.x = null;
    mouse.y = null;
  });
});
