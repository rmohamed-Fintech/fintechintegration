// Fintech Integration: mobile navigation
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

  // Copy email address buttons
  Array.prototype.forEach.call(document.querySelectorAll("[data-copy]"), function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      var status = btn.parentNode.parentNode.querySelector(".copy-status");
      function done(ok) {
        btn.textContent = ok ? "Copied" : "Copy";
        if (status) status.textContent = ok ? "Email address copied." : "Select the address and copy it manually.";
        window.setTimeout(function () { btn.textContent = "Copy"; }, 2500);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
      } else {
        var t = document.createElement("textarea");
        t.value = text; t.setAttribute("readonly", ""); t.style.position = "absolute"; t.style.left = "-9999px";
        document.body.appendChild(t); t.select();
        var ok = false;
        try { ok = document.execCommand("copy"); } catch (e) {}
        document.body.removeChild(t);
        done(ok);
      }
    });
  });
})();
