/* Steady Mind 35 – 7-Day Reset form. Plain JavaScript, no libraries, sets no cookies or storage.
   Sends the form fields to MailerLite's embedded-form endpoint (the same endpoint and fields
   MailerLite's own embed uses), without loading MailerLite's universal.js tracking script.
   The request is sent with credentials omitted, so no cookies are sent or stored.
   On success it shows /reset/thank-you/. */
(function () {
  var form = document.getElementById('reset-form');
  if (!form) return;
  var err = form.querySelector('.form-error');
  var btn = form.querySelector('button[type=submit]');

  function fail(msg) {
    err.textContent = msg || 'Something went wrong, please try again';
    err.hidden = false;
    btn.disabled = false;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    err.hidden = true;
    var email = form.querySelector('#f-email');
    var consent = form.querySelector('#f-consent');
    email.classList.toggle('invalid', !email.checkValidity());
    if (!email.checkValidity()) { email.focus(); return fail('Please enter a valid email address.'); }
    if (!consent.checked) { consent.focus(); return fail('Please tick the box to confirm you want the emails.'); }
    if (form.action.indexOf('REPLACE_WITH_FORM_ID') !== -1) {
      return fail('Sign-up is not connected yet. Please check back soon.');
    }
    btn.disabled = true;
    var params = new URLSearchParams(new FormData(form)); // includes fields[reset_consent] when ticked
    params.append('ajax', '1');
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 15000);
    fetch(form.action, {
      method: 'POST',
      body: params,               // application/x-www-form-urlencoded: a "simple" CORS request
      credentials: 'omit',
      mode: 'cors',
      cache: 'no-store',
      referrerPolicy: 'no-referrer',
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (r) { return r.json(); }).then(function (res) {
      clearTimeout(timer);
      if (res && res.success) { window.location.assign(form.getAttribute('data-thank-you')); }
      else if (res && res.errors && res.errors.fields && res.errors.fields.email) { fail('Please enter a valid email address.'); }
      else { fail(); }
    }).catch(function () { clearTimeout(timer); fail(); });
  });
})();
