// // Navigation and Mobile Menu
// document.addEventListener("DOMContentLoaded", () => {
//     const hamburger = document.querySelector(".hamburger")
//     const navLinks = document.querySelector(".nav-links")
  
//     if (hamburger) {
//       hamburger.addEventListener("click", function () {
//         this.classList.toggle("active")
//         navLinks.classList.toggle("active")
//       })
//     }
  
//     // Close menu when clicking a link
//     const navItems = document.querySelectorAll(".nav-links a")
//     navItems.forEach((item) => {
//       item.addEventListener("click", () => {
//         hamburger.classList.remove("active")
//         navLinks.classList.remove("active")
//       })
//     })
  
//     // Scroll animations
//     const animateElements = document.querySelectorAll(".animate-on-scroll")
  
//     function checkScroll() {
//       animateElements.forEach((element) => {
//         const elementTop = element.getBoundingClientRect().top
//         const windowHeight = window.innerHeight
  
//         if (elementTop < windowHeight - 100) {
//           element.classList.add("visible")
//         }
//       })
//     }
  
//     // Initial check
//     checkScroll()
  
//     // Check on scroll
//     window.addEventListener("scroll", checkScroll)
//   })
  
//   // Neon grid animation enhancement
//   const grid = document.querySelector(".grid")
//   if (grid) {
//     document.addEventListener("mousemove", (e) => {
//       const x = e.clientX / window.innerWidth
//       const y = e.clientY / window.innerHeight
  
//       // Subtle parallax effect
//       grid.style.transform = `perspective(500px) rotateX(${60 + y * 5}deg) translateY(${-y * 20}px) scale(2)`
//     })
//   }

// Navigation and Mobile Menu
document.addEventListener("DOMContentLoaded", () => {
    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");
  
    if (hamburger) {
      // Make sure the click event is properly registered
      hamburger.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.toggle("active");
        navLinks.classList.toggle("active");
        console.log("Hamburger clicked, navLinks active:", navLinks.classList.contains("active"));
      });
    }
  
    // Close menu when clicking a link
    const navItems = document.querySelectorAll(".nav-links a");
    navItems.forEach((item) => {
      item.addEventListener("click", () => {
        hamburger.classList.remove("active");
        navLinks.classList.remove("active");
      });
    });
  
    // Close menu when clicking outside
    document.addEventListener("click", function(e) {
      if (navLinks.classList.contains("active") && 
          !navLinks.contains(e.target) && 
          !hamburger.contains(e.target)) {
        hamburger.classList.remove("active");
        navLinks.classList.remove("active");
      }
    });
  
    // Scroll animations
    const animateElements = document.querySelectorAll(".animate-on-scroll");
  
    function checkScroll() {
      animateElements.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
  
        if (elementTop < windowHeight - 100) {
          element.classList.add("visible");
        }
      });
    }
  
    // Initial check
    checkScroll();
  
    // Check on scroll
    window.addEventListener("scroll", checkScroll);
  });
  
  // Neon grid animation enhancement
  const grid = document.querySelector(".grid");
  if (grid) {
    document.addEventListener("mousemove", (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
  
      // Subtle parallax effect
      grid.style.transform = `perspective(500px) rotateX(${60 + y * 5}deg) translateY(${-y * 20}px) scale(2)`;
    });
  }