// ========================================
// Wedding Invitation — JavaScript
// ========================================

// Use the first provided logo artwork everywhere the logo is shown.
document.querySelectorAll("[data-logo]").forEach((el) => {
  el.innerHTML =
    '<img class="logo-art" src="logo%20name/logo%201.svg" alt="ហ៊ូរថង និង ហ្កេកចេង">';
});

const $ = (s) => document.querySelector(s),
  reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
function startPreloader() {
  const loader = $("#preloader");
  const number = $("#preloader-number");
  const fill = $("#preloader-fill");
  if (!loader || !number || !fill) return;

  const startedAt = performance.now();
  let progress = 0;
  let ready = false;

  const imagesReady = [...document.querySelectorAll("#env img, #cover img")]
    .filter((image) => image.loading !== "lazy")
    .map((image) => image.decode().catch(() => undefined));
  const assetsReady = Promise.all([
    document.fonts ? document.fonts.ready : Promise.resolve(),
    ...imagesReady,
  ]);
  const timeout = new Promise((resolve) => setTimeout(resolve, 4500));

  Promise.race([assetsReady, timeout]).then(() => {
    const minDuration = reduce ? 0 : 1200;
    const remaining = Math.max(
      0,
      minDuration - (performance.now() - startedAt),
    );
    setTimeout(() => {
      ready = true;
    }, remaining);
  });

  const render = (value) => {
    const percent = Math.floor(value);
    number.textContent = String(percent);
    fill.style.transform = `scaleX(${value / 100})`;
  };

  if (reduce) {
    Promise.race([assetsReady, timeout]).then(() => {
      render(100);
      loader.classList.add("is-complete");
    });
    return;
  }

  const animate = (now) => {
    const elapsed = now - startedAt;
    const target = ready ? 100 : Math.min(92, (elapsed / 1400) * 92);
    progress += (target - progress) * (ready ? 0.11 : 0.075);

    if (ready && progress >= 99.5) {
      render(100);
      loader.classList.add("is-complete");
      return;
    }
    render(progress);
    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
}
startPreloader();
const connection = navigator.connection;
const weakDevice =
  (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) ||
  (navigator.deviceMemory && navigator.deviceMemory < 4) ||
  Boolean(connection && connection.saveData);
const liteDevice =
  weakDevice ||
  matchMedia("(max-width: 767px) or (pointer: coarse)").matches;
const desktopPointer = matchMedia(
  "(min-width: 900px) and (hover: hover) and (pointer: fine)",
).matches;
let lenis;
gsap.registerPlugin(
  ...[
    window.ScrollTrigger,
    window.DrawSVGPlugin,
    window.MotionPathPlugin,
    window.CustomEase,
  ].filter(Boolean),
);
if (window.CustomEase) {
  window.CustomEase.create("invitationEase", "M0,0 C0.18,0 0.18,1 1,1");
}
if (!reduce && matchMedia("(hover: hover) and (pointer: fine)").matches) {
  const cursor = document.createElement("div");
  const dot = document.createElement("span");
  cursor.className = "custom-cursor";
  cursor.setAttribute("aria-hidden", "true");
  dot.className = "cursor-dot";
  cursor.append(dot);
  document.body.append(cursor);

  window.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;
    cursor.style.transform = `translate3d(${event.clientX - 36}px, ${event.clientY - 50}px, 0)`;
    cursor.classList.add("is-visible");
    cursor.classList.toggle(
      "is-interactive",
      event.target instanceof Element &&
        Boolean(
          event.target.closest(
            "a, button, [role='button'], input, select, textarea, label",
          ),
        ),
    );
  });
  window.addEventListener("pointerleave", () => {
    cursor.classList.remove("is-visible", "is-down", "is-interactive");
  });
  window.addEventListener("pointerdown", () =>
    cursor.classList.add("is-down"),
  );
  window.addEventListener("pointerup", () =>
    cursor.classList.remove("is-down"),
  );
  window.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "mouse") cursor.classList.add("is-visible");
  });
  window.addEventListener("keydown", () => {
    cursor.classList.remove("is-visible", "is-down", "is-interactive");
  });
}
if (!reduce && desktopPointer) {
  const coupleSection = document.querySelector(".intro");
  if (coupleSection) {
    coupleSection.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse") return;
      const bounds = coupleSection.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width) * 100;
      const y = ((event.clientY - bounds.top) / bounds.height) * 100;
      coupleSection.style.setProperty("--pointer-x", `${x}%`);
      coupleSection.style.setProperty("--pointer-y", `${y}%`);
      coupleSection.classList.add("is-mouse-active");
    });
    coupleSection.addEventListener("pointerleave", () => {
      coupleSection.classList.remove("is-mouse-active");
    });
  }
}
function setupLoveStoryMotion() {
  const section = $("#ls");
  if (!section) return false;

  const gallery = section.querySelector(".story-gallery");
  const strip = section.querySelector(".strip");
  if (!gallery || !strip) return false;

  const setProgress = (progress) => {
    section.style.setProperty(
      "--story-progress",
      String(Math.min(1, Math.max(0, progress))),
    );
  };
  const enableSwipeFallback = () => {
    gallery.classList.add("is-swipeable");
  };
  const updateSwipeProgress = () => {
    const maxScroll = strip.scrollWidth - strip.clientWidth;
    setProgress(maxScroll > 0 ? strip.scrollLeft / maxScroll : 0);
  };
  strip.addEventListener("scroll", updateSwipeProgress, { passive: true });

  const ScrollTrigger = window.ScrollTrigger;
  if (reduce || weakDevice || !ScrollTrigger || !window.gsap) {
    enableSwipeFallback();
    return false;
  }

  gsap.registerPlugin(ScrollTrigger);
  const getDistance = () => Math.max(0, strip.scrollWidth - gallery.clientWidth);
  if (getDistance() <= 0) {
    enableSwipeFallback();
    return false;
  }

  gsap.to(strip, {
    x: () => -getDistance(),
    ease: "none",
    lazy: false,
    force3D: true,
    scrollTrigger: {
      id: "love-story-gallery",
      trigger: gallery,
      start: "top top+=72",
      end: () => `+=${getDistance()}`,
      pin: gallery,
      scrub: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => setProgress(self.progress),
      onRefresh: (self) => setProgress(self.progress),
    },
  });
  const isPinned = Boolean(ScrollTrigger.getById("love-story-gallery"));
  if (!isPinned) enableSwipeFallback();
  return isPinned;
}
function setupScrollMotion() {
  const ScrollTrigger = window.ScrollTrigger;
  if (reduce || liteDevice || !ScrollTrigger) return false;

  gsap.registerPlugin(ScrollTrigger);

  if (desktopPointer && window.Lenis) {
    lenis = new window.Lenis({
      lerp: 0.085,
      smoothWheel: true,
      syncTouch: false,
      anchors: false,
      wheelMultiplier: 0.9,
    });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    document.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest('a[href^="#"]');
      if (
        !link ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const target = document.getElementById(
        decodeURIComponent(link.getAttribute("href").slice(1)),
      );
      if (!target) return;
      event.preventDefault();
      history.pushState(null, "", `#${target.id}`);
      lenis.scrollTo(target, {
        offset: target.classList.contains("sec") ? -96 : 0,
        duration: 1.25,
      });
    });
  }

  document.documentElement.classList.add("gsap-scroll-motion");
  const sections = [...document.querySelectorAll("#main .sec")];
  sections.forEach((section) => {
    section.dataset.motionType = getMotionType(section);
  });
  sections.forEach((section, index) => {
    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 78%",
        once: true,
      },
      defaults: {
        ease: window.CustomEase ? "invitationEase" : "power2.out",
        duration: 0.9,
      },
    });
    if (section.id === "candlelight") {
      timeline.fromTo(
        section.querySelectorAll(".candlelight-copy > *"),
        {
          opacity: 0,
          y: 24,
          filter: "blur(8px)",
          letterSpacing: "0.12em",
        },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          letterSpacing: "0.04em",
          stagger: 0.2,
          duration: 1.1,
          clearProps: "filter,transform,letterSpacing",
        },
      );
    } else if (section.classList.contains("invitation-feature")) {
      timeline
        .fromTo(
          section.querySelector(".feature-photo"),
          { clipPath: "inset(0 48% 0 48% round 48%)", scale: 1.04 },
          { clipPath: "inset(0 0% 0 0% round 180px 180px 8px 8px)", scale: 1 },
        )
        .from(
          section.querySelectorAll(".feature-copy > *"),
          { opacity: 0, y: 12, stagger: 0.1, duration: 0.65 },
          "-=0.45",
        );
    } else if (section.classList.contains("intro")) {
      timeline
        .from(section.querySelector(".arch"), {
          opacity: 0,
          scale: 0.88,
          rotation: -2,
          duration: 1.2,
        })
        .from(
          section.querySelectorAll(".par > div"),
          {
            opacity: 0,
            x: (i) => (i % 2 ? 32 : -32),
            stagger: 0.16,
          },
          "-=0.65",
        );
    } else if (section.classList.contains("countdown-section")) {
      timeline
        .from(section.querySelectorAll("#cd > div"), {
          opacity: 0,
          scale: 0.7,
          rotationY: 24,
          stagger: 0.12,
          duration: 0.75,
        })
        .from(
          section.querySelector(".countdown-ornament"),
          { scaleX: 0, duration: 0.9 },
          "-=0.45",
        );
    } else if (section.classList.contains("schedule-section")) {
      timeline
        .from(section.querySelector(".schedule-heading"), {
          opacity: 0,
          y: 18,
          filter: "blur(6px)",
          duration: 0.85,
        })
        .from(
          [...section.querySelectorAll(".schedule-day > .font-date")],
          {
            opacity: 0,
            y: 14,
            stagger: 0.16,
            duration: 0.65,
          },
          "-=0.3",
        );
    } else if (section.id === "ls") {
      timeline
        .from(section.querySelector(".story-heading"), {
          opacity: 0,
          scale: 0.94,
          duration: 0.8,
        })
        .fromTo(
          section.querySelectorAll(".story-card"),
          {
            opacity: 0,
            x: (i) => (i % 2 ? 38 : -38),
            rotation: (i) => (i % 2 ? 1.2 : -1.2),
          },
          {
            opacity: 1,
            x: 0,
            rotation: 0,
            stagger: 0.08,
            duration: 0.75,
            clearProps: "opacity,transform",
          },
          "-=0.2",
        );
    } else if (section.querySelector("#mas")) {
      timeline.from(section.querySelectorAll("#mas img"), {
        clipPath: "inset(12% 12% 12% 12%)",
        scale: 1.06,
        opacity: 0.65,
        stagger: 0.07,
        duration: 0.85,
      });
    } else if (section.id === "venue") {
      timeline
        .from(section.querySelector("iframe"), {
          opacity: 0,
          scaleY: 0.88,
          filter: "blur(8px)",
          duration: 1.1,
        })
        .from(
          section.querySelectorAll("a, .venue-details"),
          { opacity: 0, x: 18, stagger: 0.12 },
          "-=0.45",
        );
    } else if (section.querySelector(".qrs")) {
      timeline.from(section.querySelectorAll(".qrs > *"), {
        opacity: 0,
        scale: 0.88,
        y: 14,
        stagger: 0.14,
        duration: 0.8,
      });
    } else if (section.classList.contains("thanks-section")) {
      timeline
        .from(section.querySelector("h3:first-child"), {
          opacity: 0,
          y: 22,
          filter: "blur(6px)",
          duration: 0.9,
        })
        .from(
          section.querySelector("p"),
          {
            opacity: 0,
            y: 28,
            scale: 0.985,
            duration: 1,
          },
          "-=0.45",
        )
        .from(
          section.querySelector("h3:last-child"),
          {
            opacity: 0,
            y: 14,
            scale: 0.94,
            duration: 0.7,
          },
          "-=0.35",
        );
    } else if (section.classList.contains("closing-section")) {
      timeline
        .from(section.querySelector("h2"), {
          opacity: 0,
          scale: 0.76,
          letterSpacing: "0.16em",
          duration: 1.1,
        })
        .from(
          section.querySelectorAll(".sh a"),
          { opacity: 0, y: 18, stagger: 0.1, duration: 0.65 },
          "-=0.35",
        );
    } else {
      const heading = section.querySelector("h2");
      if (heading) {
        timeline.from(heading, {
          opacity: 0,
          clipPath: "inset(0 50% 0 50%)",
          duration: 1,
        });
      }
    }
    section.dataset.motionIndex = String(index);
  });
  ScrollTrigger.refresh();
  return true;
}
function getMotionType(section) {
  if (section.classList.contains("invitation-feature")) return "feature";
  if (section.classList.contains("intro")) return "intro";
  if (section.classList.contains("countdown-section")) return "countdown";
  if (section.classList.contains("schedule-section")) return "schedule";
  if (section.id === "ls") return "story";
  if (section.querySelector("#mas")) return "gallery";
  if (section.id === "venue") return "venue";
  if (section.querySelector(".qrs")) return "gifts";
  if (section.classList.contains("closing-section")) return "closing";
  return "details";
}
if (!reduce) gsap.set(".rv", { opacity: 0 });

function reveal() {
  if (reduce) {
    gsap.set("#cover", { visibility: "visible", opacity: 1 });
    gsap.set(".rv", { clearProps: "all" });
    unlock();
    return;
  }

  gsap.delayedCall(2.4, unlock);
  gsap.set("#cover", { visibility: "visible" });
  const t = gsap.timeline({ defaults: { ease: "power3.out" } });
  t.fromTo(
    "#cover",
    { opacity: 0, scale: 0.985 },
    {
      opacity: 1,
      scale: 1,
      duration: 1.15,
      clearProps: "transform",
      ease: "power2.out",
    },
  )
    .fromTo(
      ".rv",
      { opacity: 0, y: 22 },
      { opacity: 1, y: 0, duration: 0.85, stagger: 0.12, ease: "expo.out" },
      0.25,
    )
}
let done = false;
let unlocked = false;
const stage = $("#stage");
const setEnvelopeTilt = (x, y) => {
  stage.style.setProperty("--tilt-x", `${x}deg`);
  stage.style.setProperty("--tilt-y", `${y}deg`);
};
if (!reduce && desktopPointer) {
  stage.addEventListener("pointermove", (event) => {
    if (done) return;
    const bounds = stage.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    setEnvelopeTilt(-y * 4, x * 5);
  });
  stage.addEventListener("pointerleave", () => setEnvelopeTilt(0, 0));
}
let enableDeviceTilt = () => {};
if (!reduce && "DeviceOrientationEvent" in window) {
  const DeviceOrientation = window.DeviceOrientationEvent;
  const updateDeviceTilt = (event) => {
    if (done || event.beta === null || event.gamma === null) return;
    const x = Math.max(-1, Math.min(1, event.beta / 30));
    const y = Math.max(-1, Math.min(1, event.gamma / 30));
    setEnvelopeTilt(-x * 3.5, y * 4);
  };
  const listenForDeviceTilt = () =>
    window.addEventListener("deviceorientation", updateDeviceTilt, {
      passive: true,
    });

  if (typeof DeviceOrientation.requestPermission === "function") {
    let permissionRequested = false;
    enableDeviceTilt = () => {
      if (permissionRequested) return;
      permissionRequested = true;
      DeviceOrientation.requestPermission()
        .then((permission) => {
          if (permission === "granted") listenForDeviceTilt();
        })
        .catch((error) =>
          console.warn("Could not enable invitation tilt.", error),
        );
    };
    stage.addEventListener("pointerdown", enableDeviceTilt, { once: true });
  } else {
    listenForDeviceTilt();
  }
}
$("#mus").onclick = () => {
  const a = $("#aud");
  a.paused ? a.play() : a.pause();
  $("#mus").style.opacity = a.paused ? 0.5 : 1;
};
$("#seal").addEventListener("click", () => {
  if (done) return;
  done = true;
  setEnvelopeTilt(0, 0);
  $("#env").classList.add("is-opening");
  const a = $("#aud");
  a.play().catch((error) =>
    console.warn("Could not start invitation music.", error),
  );
  $("#mus").style.display = "block";
  $(".hint").style.display = "none";
  if (reduce) {
    gsap.set("#env", { display: "none" });
    reveal();
    return;
  }
  const rest = [".back", ".pk", "#flap", "#shd"];
  const tl = gsap.timeline({
    defaults: {
      ease: window.CustomEase ? "invitationEase" : "power2.inOut",
    },
  });
  let flapPassedHinge = false;
  tl.to(
    "#seal",
    { scale: 0.9, y: 2, duration: 0.3, ease: "power2.in" },
    0,
  )
    .to(
      "#seal",
      {
        scale: 1.05,
        y: -7,
        filter: "drop-shadow(0 19px 14px #070a05b8)",
        duration: 0.4,
        ease: "power2.out",
      },
      0.3,
    )
    .to(
      "#seal",
      {
        x: "115vw",
        y: "-18vh",
        scale: 0.72,
        rotate: 25,
        opacity: 0,
        duration: 0.55,
        ease: "power2.in",
      },
      0.65,
    )
    .to("#flap", { rotateX: 7, duration: 0.3, ease: "power1.out" }, 0.55)
    .to(
      "#flap",
      {
        rotateX: -180,
        duration: 1.1,
        ease: "power2.inOut",
        onUpdate() {
          if (
            !flapPassedHinge &&
            Number(gsap.getProperty("#flap", "rotationX")) <= -90
          ) {
            flapPassedHinge = true;
            gsap.set("#flap", { zIndex: 1 });
          }
        },
      },
      0.85,
    )
    .set(".card", { zIndex: 5 }, 1.52)
    .to(
      "#shd",
      {
        rotateX: -180,
        scaleY: 0.18,
        opacity: 0,
        duration: 1.1,
        ease: "power1.in",
      },
      0.85,
    )
    .to(
      ".card",
      { y: "-54%", rotate: -1.1, duration: 1.1, ease: "power1.inOut" },
      1.95,
    )
    .to(
      rest,
      { y: "7%", duration: 0.7, ease: "power1.inOut" },
      2,
    )
    .to(
      rest,
      { y: "125%", rotate: 2, opacity: 0, duration: 0.75, ease: "power2.in" },
      3.1,
    )
    .to(
      ".card",
      {
        y: "-50%",
        z: 220,
        rotate: 0,
        scale: 1.32,
        duration: 1.05,
        ease: "power2.out",
      },
      3.05,
    )
    .to(
      ".opening-veil",
      { opacity: 1, duration: 0.55, ease: "power1.in" },
      4.85,
    )
    .call(reveal, null, 5.4)
    .set("#env", { display: "none" }, 5.5);
});

function setupCandlelightCanvases() {
  const section = $("#candlelight");
  const water = section?.querySelector(".water-canvas");
  const embers = section?.querySelector(".embers-canvas");
  if (!section) return;
  const parent = water?.parentElement;
  if (!water || !embers || parent !== section || embers.parentElement !== parent) {
    console.error("The candlelight canvases must share their section parent.");
    return;
  }
  let gl = null;

  section.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    const bounds = section.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;

    const ripple = document.createElement("span");
    ripple.className = "water-ripple";
    ripple.setAttribute("aria-hidden", "true");
    ripple.style.left = `${(x / bounds.width) * 100}%`;
    ripple.style.top = `${(y / bounds.height) * 100}%`;
    section.append(ripple);
    ripple.addEventListener("animationend", () => ripple.remove(), {
      once: true,
    });

    const lantern = document.createElement("img");
    lantern.className = "floating-lantern";
    lantern.src = "elements/lotus.svg";
    lantern.alt = "";
    lantern.setAttribute("aria-hidden", "true");
    lantern.style.left = `${(x / bounds.width) * 100}%`;
    lantern.style.top = `${(y / bounds.height) * 100}%`;
    const existingLanterns = section.querySelectorAll(".floating-lantern");
    if (existingLanterns.length >= 5) existingLanterns[0].remove();
    section.append(lantern);
    lantern.addEventListener("animationend", () => lantern.remove(), {
      once: true,
    });

    if (gl) {
      water.dataset.rippleX = String(x / bounds.width);
      water.dataset.rippleY = String(1 - y / bounds.height);
      water.dataset.rippleTime = String(performance.now() / 1000);
    }
  });

  if (reduce) return;
  const phoneDevice = matchMedia("(max-width: 767px) or (pointer: coarse)");
  if (phoneDevice.matches) return;

  gl = water.getContext("webgl", {
    alpha: true,
    antialias: false,
    powerPreference: "low-power",
  });
  const ctx = embers.getContext("2d", { alpha: true });
  if (!ctx) console.warn("Could not create the candlelight ember canvas.");

  let program;
  let positionBuffer;
  let timeLocation;
  let resolutionLocation;
  let rippleOriginLocation;
  let rippleTimeLocation;
  if (gl) {
    const vertexSource = `
      attribute vec2 position;
      varying vec2 uv;
      void main() {
        uv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;
    const fragmentSource = `
      precision mediump float;
      varying vec2 uv;
      uniform float time;
      uniform vec2 resolution;
      uniform vec2 rippleOrigin;
      uniform float rippleTime;
      void main() {
        vec2 aspect = vec2(resolution.x / resolution.y, 1.0);
        float distanceFromTouch = length((uv - rippleOrigin) * aspect);
        float age = time - rippleTime;
        float radius = age * 0.38;
        float ring = exp(-abs(distanceFromTouch - radius) * 52.0);
        float active = (1.0 - smoothstep(2.2, 3.0, age)) * step(0.0, age);
        float alpha = ring * active * 0.38;
        gl_FragColor = vec4(0.96, 0.82, 0.52, alpha);
      }
    `;
    const compileShader = (type, source) => {
      const shader = gl.createShader(type);
      if (!shader) {
        console.error("Could not create a candlelight water shader.");
        return null;
      }
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(
          "Could not compile the candlelight water shader:",
          gl.getShaderInfoLog(shader),
        );
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };
    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentSource);
    if (vertexShader && fragmentShader) {
      program = gl.createProgram();
      if (program) {
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
          positionBuffer = gl.createBuffer();
          if (positionBuffer) {
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(
              gl.ARRAY_BUFFER,
              new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
              gl.STATIC_DRAW,
            );
            timeLocation = gl.getUniformLocation(program, "time");
            resolutionLocation = gl.getUniformLocation(program, "resolution");
            rippleOriginLocation = gl.getUniformLocation(program, "rippleOrigin");
            rippleTimeLocation = gl.getUniformLocation(program, "rippleTime");
            gl.useProgram(program);
            const positionLocation = gl.getAttribLocation(program, "position");
            gl.enableVertexAttribArray(positionLocation);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
          } else {
            console.error("Could not create the candlelight water buffer.");
            program = null;
          }
        } else {
          console.error(
            "Could not link the candlelight water shader:",
            gl.getProgramInfoLog(program),
          );
          gl.deleteProgram(program);
          program = null;
        }
      } else {
        console.error("Could not create the candlelight water program.");
      }
    }
    if (!program) console.warn("The candlelight water effect is unavailable.");
  } else {
    console.warn("WebGL is unavailable; the candlelight water effect is disabled.");
  }

  const particles = Array.from({ length: 28 }, () => ({
    x: Math.random(),
    y: Math.random(),
    radius: 0.7 + Math.random() * 1.7,
    speed: 0.012 + Math.random() * 0.028,
    sway: Math.random() * 2 - 1,
    phase: Math.random() * Math.PI * 2,
    alpha: 0.2 + Math.random() * 0.45,
  }));
  let width = 0;
  let height = 0;
  let pixelRatio = 0;
  let lastFrame = 0;
  const resizeCanvases = () => {
    const nextWidth = parent.clientWidth;
    const nextHeight = parent.clientHeight;
    if (!nextWidth || !nextHeight) return;
    const nextPixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    if (
      width === nextWidth &&
      height === nextHeight &&
      pixelRatio === nextPixelRatio
    )
      return;
    width = nextWidth;
    height = nextHeight;
    pixelRatio = nextPixelRatio;
    const backingWidth = Math.max(1, Math.round(width * pixelRatio));
    const backingHeight = Math.max(1, Math.round(height * pixelRatio));
    if (water.width !== backingWidth || water.height !== backingHeight) {
      water.width = backingWidth;
      water.height = backingHeight;
      if (gl) gl.viewport(0, 0, backingWidth, backingHeight);
    }
    if (embers.width !== backingWidth || embers.height !== backingHeight) {
      embers.width = backingWidth;
      embers.height = backingHeight;
      if (ctx) ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    }
  };
  resizeCanvases();
  if ("ResizeObserver" in window) {
    new ResizeObserver(resizeCanvases).observe(parent);
  }
  window.addEventListener("resize", resizeCanvases, { passive: true });

  const animate = (now) => {
    const bounds = parent.getBoundingClientRect();
    const style = getComputedStyle(parent);
    const visible = phoneDevice.matches
      ? false
      : document.visibilityState === "visible" &&
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        Number(style.opacity) > 0.02 &&
        bounds.width > 0 &&
        bounds.height > 0 &&
        bounds.bottom > 0 &&
        bounds.top < window.innerHeight &&
        bounds.right > 0 &&
        bounds.left < window.innerWidth;
    if (visible && width > 0 && height > 0) {
      const elapsed = Math.min((now - (lastFrame || now)) / 1000, 0.05);
      if (gl && program) {
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program);
        gl.uniform1f(timeLocation, now / 1000);
        gl.uniform2f(resolutionLocation, water.width, water.height);
        gl.uniform2f(
          rippleOriginLocation,
          Number(water.dataset.rippleX || 0.5),
          Number(water.dataset.rippleY || 0.5),
        );
        gl.uniform1f(
          rippleTimeLocation,
          Number(water.dataset.rippleTime || -10),
        );
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      if (ctx) {
        ctx.clearRect(0, 0, width, height);
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        particles.forEach((particle) => {
          particle.y -= particle.speed * elapsed;
          particle.x +=
            Math.sin(now / 900 + particle.phase) *
            particle.sway *
            elapsed *
            0.035;
          if (particle.y < -0.03) {
            particle.y = 1.03;
            particle.x = Math.random();
          }
          ctx.beginPath();
          ctx.fillStyle = `rgba(255, 190, 90, ${particle.alpha})`;
          ctx.shadowColor = "#ffad4d";
          ctx.shadowBlur = 10;
          ctx.arc(
            particle.x * width,
            particle.y * height,
            particle.radius,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        });
        ctx.restore();
      }
      lastFrame = now;
    } else {
      lastFrame = 0;
    }
    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
}

function unlock() {
  if (!done || unlocked) return;
  unlocked = true;
  document.documentElement.style.height = "auto";
  document.documentElement.style.overflowX = "hidden";
  document.documentElement.style.overflowY = "auto";
  document.body.style.height = "auto";
  document.body.style.overflow = "visible";
  const c = $("#cover");
  c.style.cssText += "position:relative;min-height:100svh;width:100%";
  $("#main").style.display = "block";
  initMain();
  setupCandlelightCanvases();
}
function createPetals() {
  if (reduce || liteDevice) return;

  const layer = document.createElement("div");
  layer.className = "petal-layer";
  layer.setAttribute("aria-hidden", "true");

  for (let i = 0; i < 14; i++) {
    const petal = document.createElement("span");
    const duration = 14 + Math.random() * 12;
    petal.className = "petal";
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.setProperty("--duration", `${duration}s`);
    petal.style.setProperty("--delay", `${-Math.random() * duration}s`);
    petal.style.setProperty("--drift", `${Math.random() * 24 - 12}vw`);
    petal.style.setProperty("--spin", `${Math.random() * 540 - 270}deg`);
    layer.append(petal);
  }

  document.body.append(layer);
}
function initMain() {
  if (liteDevice && !reduce)
    document.documentElement.classList.add("lite-motion");
  createPetals();
  const couplePortrait = document.querySelector("#main .sc");
  if (couplePortrait) {
    couplePortrait.closest(".sec").remove();
  }
  document.querySelectorAll("#main [data-logo]").forEach((el) => {
    el.innerHTML = document.querySelector("#cover [data-logo]").innerHTML;
  });
  document.querySelectorAll("#main .sec").forEach((section) => {
    section.dataset.motionType = getMotionType(section);
    section.querySelectorAll(".rvl").forEach((el, index) => {
      el.style.setProperty(
        "--reveal-delay",
        `${Math.min(index * 90, 360)}ms`,
      );
    });
  });
  const galleryPhotos = [
    "01.jpg",
    "02.jpg",
    "03.jpg",
    "04.JPG",
    "05.jpg",
    "06.jpg",
    "07.jpg",
    "08.jpg",
    "11.jpg",
    "12.jpg",
    "13.jpg",
    "14.jpg",
    "Finalll.jpg",
    "HTTT7960.jpg",
    "HTTT7987.jpg",
    "HTTT8061.jpg",
    "HTTT8229.jpg",
    "HTTT8250.jpg",
    "HTTT8279.jpg",
    "HTTT8332.jpg",
    "HTTT8427.jpg",
    "HTTT8470.jpg",
    "HTTT8899.jpg",
    "HTTT8971.jpg",
    "HTTT9028.jpg",
    "HTTT9101 copy 2.jpg",
    "HTTT9121.jpg",
    "HTTT9282.jpg",
    "HTTT9585.jpg",
    "HTTT9603.jpg",
    "HTTT9699.jpg",
    "HTTT9730.jpg",
    "IMG1.jpg",
    "back1.jpg",
    "story/HTTT9571.jpg",
    "HTTT9101 copy 2.jpg",
  ];
  const gallery = $("#mas");
  gallery.replaceChildren(
    ...galleryPhotos.map((fileName) => {
      const image = document.createElement("img");
      image.src = `picture/${fileName}`;
      image.alt = `រូបថតអនុស្សាវរីយ៍អាពាហ៍ពិពាហ៍ ${fileName.replace(/\.jpg$/i, "")}`;
      image.loading = "lazy";
      image.decoding = "async";
      return image;
    }),
  );
  const hasScrollMotion = setupScrollMotion();
  const hasStoryPin = setupLoveStoryMotion();
  if (!hasScrollMotion) {
    const sectionObserver = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            sectionObserver.unobserve(entry.target);
          }
        }),
      { threshold: 0.05, rootMargin: "0px 0px -10% 0px" },
    );
    document.querySelectorAll("#main .sec").forEach((section) => {
      sectionObserver.observe(section);
    });
  }
  const io = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          if (e.target.classList.contains("pi")) e.target.classList.add("on");
          if (e.target.id == "cn")
            e.target
              .querySelectorAll("i")
              .forEach((c, k) =>
                setTimeout(() => c.classList.add("on"), k * 500),
              );
        }
      }),
    { threshold: 0.35 },
  );
  document
    .querySelectorAll(hasScrollMotion ? ".pi,#cn" : ".rvl,.pi,#cn")
    .forEach((e) => io.observe(e));
  const kn = (n) => String(n).replace(/\d/g, (d) => "០១២៣៤៥៦៧៨៩"[d]),
    T = new Date("2026-12-13T06:30:00+07:00"),
    cd = $("#cd");
  const tick = () => {
    let s = Math.max(0, ((T - Date.now()) / 1000) | 0);
    const v = [
      (s / 86400) | 0,
      ((s % 86400) / 3600) | 0,
      ((s % 3600) / 60) | 0,
      s % 60,
    ];
    cd.innerHTML = ["ថ្ងៃ", "ម៉ោង", "នាទី", "វិនាទី"]
      .map((l, i) => `<div><b>${kn(v[i])}</b><small>${l}</small></div>`)
      .join("");
  };
  tick();
  setInterval(tick, 1000);
  const ls = $("#ls");
  const updateScrollEffects = () => {
    if (!ls) return;

    const l = ls.getBoundingClientRect();
    const storyStrip = ls.querySelector(".strip");
    const storyMaxScroll = storyStrip
      ? storyStrip.scrollWidth - storyStrip.clientWidth
      : 0;
    if (!hasStoryPin && storyMaxScroll <= 1) {
      const storyProgress = Math.min(
        1,
        Math.max(0, (innerHeight - l.top) / (innerHeight + l.height)),
      );
      ls.style.setProperty("--story-progress", String(storyProgress));
    }
    ls.style.setProperty(
      "--p",
      Math.min(
        100,
        Math.max(0, ((innerHeight - l.top) / (innerHeight + l.height)) * 100),
      ) + "%",
    );
    const scrollableHeight =
      document.documentElement.scrollHeight - innerHeight;
    document.documentElement.style.setProperty(
      "--scroll-progress",
      scrollableHeight > 0
        ? String(Math.min(1, Math.max(0, window.scrollY / scrollableHeight)))
        : "0",
    );
  };
  addEventListener("scroll", updateScrollEffects, { passive: true });
  updateScrollEffects();
  const vw = $("#vw"),
    imgs = [...gallery.querySelectorAll("img")];
  vw.innerHTML = imgs.map((i) => `<img src="${i.src}" alt="">`).join("");
  imgs.forEach(
    (im, k) =>
      (im.onclick = () => {
        vw.style.display = "block";
        vw.scrollLeft = k * innerWidth;
      }),
  );
  vw.onclick = () => (vw.style.display = "none");
  $("#ics").onclick = (e) => {
    e.preventDefault();
    const t = "BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nUID:wedding-20261213@invite\nDTSTAMP:20261005T000000Z\nDTSTART;VALUE=DATE:20261213\nDTEND;VALUE=DATE:20261214\nSUMMARY:Wedding of Hourthorng & Guekcheng\nLOCATION:Prasop Village\\, Khsach Kandal\\, Kandal\nEND:VEVENT\nEND:VCALENDAR";
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([t], { type: "text/calendar" }));
    a.download = "wedding.ics";
    a.click();
  };
  [1, 2].forEach((n) => {
    const b = $("#b" + n),
      i = $("#i" + n),
      f = $("#f" + n),
      s = $("#s" + n);
    if (!b || !i || !f || !s) {
      console.warn(`Skipping incomplete QR upload controls for #b${n}.`);
      return;
    }
    b.onclick = () => f.click();
    b.onkeydown = (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        f.click();
      }
    };
    f.onchange = () => {
      const u = URL.createObjectURL(f.files[0]);
      i.src = u;
      i.style.display = "block";
      b.style.display = "none";
      s.href = u;
      s.style.display = "inline-block";
    };
  });
  const u = encodeURIComponent(location.href),
    tx = encodeURIComponent("សូមអញ្ជើញចូលរួមពិធីអាពាហ៍ពិពាហ៍");
  $("#shT").href = `https://t.me/share/url?url=${u}&text=${tx}`;
  $("#shF").href = `https://www.facebook.com/sharer/sharer.php?u=${u}`;
  $("#shM").href = `fb-messenger://share/?link=${u}`;
  $("#shC").onclick = (e) => {
    e.preventDefault();
    navigator.clipboard && navigator.clipboard.writeText(location.href);
    e.currentTarget.querySelector("strong").textContent = "បានចម្លង ✓";
  };
}
