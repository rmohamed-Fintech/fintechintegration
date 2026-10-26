// Fintech Integration: mobile nav and the hero reconciliation panel
(function () {
  document.documentElement.classList.remove("no-js");

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var ledger = document.querySelector("[data-ledger]");
  if (!ledger) return;

  var gl = ledger.querySelector("[data-gl]");
  var variance = ledger.querySelector("[data-variance]");
  var status = ledger.querySelector("[data-status]");
  var pos = 48212.4;
  var glStart = 47986.15;

  function fmt(n) {
    return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function settle() {
    gl.textContent = fmt(pos);
    variance.textContent = "0.00";
    status.textContent = "Balanced";
    ledger.classList.add("is-balanced");
  }

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) { settle(); return; }

  window.setTimeout(function () {
    var start = null;
    var duration = 1400;
    function step(ts) {
      if (start === null) start = ts;
      var t = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      var current = glStart + (pos - glStart) * eased;
      gl.textContent = fmt(current);
      variance.textContent = fmt(Math.max(pos - current, 0));
      if (t < 1) { window.requestAnimationFrame(step); } else { settle(); }
    }
    window.requestAnimationFrame(step);
  }, 1600);
})();
