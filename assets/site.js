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

  // Engagement inquiry form (Formspree, submitted in place)
  var form = document.getElementById("intake");
  if (form) {
    var status = document.getElementById("intake-status");
    var button = form.querySelector('button[type="submit"]');
    function clearErrors() {
      Array.prototype.forEach.call(form.querySelectorAll(".field-error"), function (e) { e.parentNode.removeChild(e); });
      Array.prototype.forEach.call(form.querySelectorAll("[aria-invalid]"), function (e) { e.removeAttribute("aria-invalid"); e.removeAttribute("aria-describedby"); });
    }
    function showStatus(kind, html) {
      status.className = "form-status " + kind;
      status.innerHTML = html;
      status.focus();
    }
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      clearErrors();
      var firstBad = null;
      Array.prototype.forEach.call(form.querySelectorAll("[required]"), function (el) {
        var empty = !el.value.trim();
        var badEmail = el.type === "email" && !empty && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim());
        if (empty || badEmail) {
          var msg = document.createElement("span");
          msg.className = "field-error";
          msg.id = el.id + "-error";
          msg.textContent = badEmail ? "Enter a valid email address." : "This field is required.";
          el.setAttribute("aria-invalid", "true");
          el.setAttribute("aria-describedby", msg.id);
          el.parentNode.appendChild(msg);
          if (!firstBad) firstBad = el;
        }
      });
      if (firstBad) { firstBad.focus(); return; }

      button.disabled = true;
      button.textContent = "Sending...";
      fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
        .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, data: d }; }); })
        .then(function (res) {
          if (res.ok) {
            form.reset();
            showStatus("ok", "<strong>Thank you. Your inquiry was sent.</strong> I&#8217;ll reply within two business days.");
          } else {
            throw new Error("send failed");
          }
        })
        .catch(function () {
          showStatus("err", "<strong>Your inquiry didn&#8217;t send.</strong> Please try again, or email <a href=\"mailto:rmohamed@fintechintegration.com\">rmohamed@fintechintegration.com</a> directly.");
        })
        .then(function () { button.disabled = false; button.textContent = "Send inquiry"; });
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
