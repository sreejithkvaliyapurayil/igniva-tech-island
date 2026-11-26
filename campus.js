const menu = document.querySelector(".menu-toggle");
const nav = document.querySelector("#navigation");
document.querySelector(".header").dataset.menuReady = "";
menu.addEventListener("click", () => {
  menu.setAttribute("aria-expanded", String(nav.classList.toggle("open")));
});
nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  nav.classList.remove("open");
  menu.setAttribute("aria-expanded", "false");
}));

const search = document.querySelector("#site-search");
const query = document.querySelector("#query");
const results = document.querySelector("#results");
const searchStatus = document.querySelector("#search-status");
const pages = [
  ["Tech Island homepage", "/", "willingdon kochi campus"],
  ["Phase I · AI IT Parks & Play Area", "/phase-one.html", "enterprise workspaces recreation go-karting gaming fitness creator studios robotic reception"],
  ["Coworking", "/phase-one.html#work-club", "workspace work club offices suites"],
  ["Phase II · Kochi Data Centre", "/phase-two.html", "data center infrastructure server 10 mw"],
  ["About Us", "/about-us.html", "establishments developments calicut cochin beach bay 4in bazar airport hotel logistics hub"],
  ["Our Story", "/our-story.html", "history founder 2015"],
  ["Our Leadership", "/our-leadership.html", "nijesh puthalath chairman managing director"],
  ["Partnership enquiries", "/partner-enquiries/", "contact sales enquiry"],
];
function showResults() {
  const terms = query.value.toLowerCase().trim().split(/\s+/);
  const matches = pages.filter(([name, , keywords]) =>
    terms.every(term => (name + " " + keywords).toLowerCase().includes(term))
  );
  results.replaceChildren(...matches.map(([name, url]) => {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = url;
    link.textContent = name;
    link.addEventListener("click", () => search.close());
    item.append(link);
    return item;
  }));
  searchStatus.textContent = matches.length ? "" : "No matches. Try a project, activity or page name.";
}
document.querySelector("#open-search").addEventListener("click", () => {
  showResults();
  search.showModal();
  query.focus();
});
query.addEventListener("input", showResults);

const slides = [...document.querySelectorAll(".slide")];
const motion = matchMedia("(prefers-reduced-motion: reduce)");
let filmPlaying = false;
let syncRotation = () => {};
if (slides.length) {
  const showcase = document.querySelector(".showcase");
  let index = 0;
  let timer;

  function advance() {
    slides[index].hidden = true;
    index = (index + 1) % slides.length;
    slides[index].hidden = false;
  }
  syncRotation = () => {
    clearInterval(timer);
    if (!motion.matches && !filmPlaying && !document.hidden &&
        !showcase.contains(document.activeElement)) {
      timer = setInterval(advance, 2000);
    }
  };
  motion.addEventListener("change", syncRotation);
  document.addEventListener("visibilitychange", syncRotation);
  showcase.addEventListener("focusin", syncRotation);
  showcase.addEventListener("focusout", () => setTimeout(syncRotation, 0));
  syncRotation();
}

fetch("/campus-media.json").then(response => response.ok ? response.json() : {}).then(({ introVideos = [], socials = [] }) => {
  const socialLinks = document.querySelector("#social-links");
  for (const { label, url } of socials) {
    const link = document.createElement("a");
    link.textContent = label;
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    socialLinks.append(link);

  }

  const intro = document.querySelector(".intro-film");
  if (!intro || motion.matches || !introVideos.length || location.hash) return;
  const video = intro.querySelector("video");
  const brand = intro.querySelector(".film-brand");
  const skip = intro.querySelector("#skip-intro");
  const page = document.querySelectorAll(".header, main, footer");
  let index = 0;
  let timeout;

  function closeIntro() {
    clearTimeout(timeout);
    video.pause();
    intro.hidden = true;
    page.forEach(element => { element.inert = false; });
    filmPlaying = false;
    syncRotation();
  }
  function playNext() {
    clearTimeout(timeout);
    if (index >= introVideos.length) {
      closeIntro();
      return;
    }
    brand.hidden = false;
    timeout = setTimeout(closeIntro, 7000);
    const source = introVideos[index++];
    video.src = new URL(matchMedia("(max-width: 760px)").matches ? source.mobile : source.desktop, location.origin).href;
    video.play().catch(closeIntro);
  }
  video.addEventListener("playing", () => { clearTimeout(timeout); brand.hidden = true; });
  video.addEventListener("ended", playNext);
  video.addEventListener("error", closeIntro);
  skip.addEventListener("click", () => { closeIntro(); document.querySelector(".header .brand").focus(); });
  intro.addEventListener("keydown", event => { if (event.key === "Escape") skip.click(); });
  filmPlaying = true;
  intro.hidden = false;
  page.forEach(element => { element.inert = true; });
  skip.focus({ preventScroll: true });
  syncRotation();
  playNext();
}).catch(() => {});
