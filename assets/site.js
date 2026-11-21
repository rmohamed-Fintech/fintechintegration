// Fintech Integrations: navigation, inquiry form, booking, and lead tracking
(function () {
  document.documentElement.classList.remove("no-js");

  // Lead tracking: pushes named events to the Google Tag Manager data layer.
  // No names, emails, or message text are ever sent.
  window.dataLayer = window.dataLayer || [];
  function track(name, params) {
    var payload = { event: name };
    if (params) { for (var k in params) { if (Object.prototype.hasOwnProperty.call(params, k)) payload[k] = params[k]; } }
    window.dataLayer.push(payload);
  }
  var BOOKING_URL = "https://calendar.app.google/FNnxUF7bjHvso6iX9";

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Booking and email link clicks (one listener for the whole page)
  document.addEventListener("click", function (ev) {
    var a = ev.target.closest ? ev.target.closest("a") : null;
    if (!a) return;
    var href = a.getAttribute("href") || "";
    var where = a.getAttribute("data-track") || location.pathname;
    if (href.indexOf("calendar.app.google") !== -1) {
      track("book_call_click", { link_location: where });
    } else if (href.indexOf("mailto:") === 0) {
      track("email_click", { email_method: "mail_app", link_location: location.pathname });
    } else if (href.indexOf("mail.google.com/mail") !== -1) {
      track("email_click", { email_method: "gmail", link_location: location.pathname });
    } else if (href.indexOf("outlook.office.com/mail") !== -1) {
      track("email_click", { email_method: "outlook", link_location: location.pathname });
    }
  });

  // Engagement inquiry form (Formspree, submitted in place)
  var form = document.getElementById("intake");
  if (form) {
    var status = document.getElementById("intake-status");
    var button = form.querySelector('button[type="submit"]');
    var started = false;
    form.addEventListener("input", function () {
      if (!started) { started = true; track("form_start", { form_id: "intake" }); }
    });
    function value(name) {
      var el = form.querySelector('[name="' + name + '"]');
      return el && el.value ? el.value : "(not provided)";
    }
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

      var leadInfo = { form_id: "intake", country: value("country"), revenue: value("revenue"), timing: value("timing") };
      button.disabled = true;
      button.textContent = "Sending...";
      fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
        .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, data: d }; }); })
        .then(function (res) {
          if (res.ok) {
            form.reset();
            started = false;
            track("generate_lead", leadInfo);
            showStatus("ok", "<strong>Thank you. Your inquiry was sent.</strong> I&#8217;ll reply within two business days. " +
              "Want to skip the wait? <a href=\"" + BOOKING_URL + "\" target=\"_blank\" rel=\"noopener\" data-track=\"form_success\">Book a 30-minute call now</a>.");
          } else {
            throw new Error("send failed");
          }
        })
        .catch(function () {
          track("form_error", { form_id: "intake" });
          showStatus("err", "<strong>Your inquiry didn&#8217;t send.</strong> Please try again, email <a href=\"mailto:rmohamed@fintechintegration.com\">rmohamed@fintechintegration.com</a>, or <a href=\"" + BOOKING_URL + "\" target=\"_blank\" rel=\"noopener\" data-track=\"form_error\">book a call</a>.");
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
        if (ok) track("email_click", { email_method: "copy", link_location: location.pathname });
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
