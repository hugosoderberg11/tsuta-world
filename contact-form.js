(function () {
  var STORAGE_KEY = 'tsuta-contact-last';
  var FIELD_ORDER = [
    { key: 'company', label: '会社名' },
    { key: 'name', label: 'お名前' },
    { key: 'jobTitle', label: '役職' },
    { key: 'phone', label: '電話番号' },
    { key: 'email', label: 'メールアドレス' },
    { key: 'subject', label: '件名' },
    { key: 'message', label: 'お問い合わせ内容' }
  ];

  function text(value) {
    return String(value || '').trim();
  }

  function formatFields(data) {
    return FIELD_ORDER.map(function (field) {
      var value = text(data[field.key]);
      if (field.key === 'message') {
        return field.label + '：\n' + value;
      }
      return field.label + '：' + value;
    }).join('\n');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderSummary(target, data) {
    if (!target || !data) return;
    target.innerHTML = FIELD_ORDER.map(function (field) {
      var value = escapeHtml(text(data[field.key])).replace(/\n/g, '<br>');
      return (
        '<div class="contact-summary-row">' +
          '<dt>' + escapeHtml(field.label) + '</dt>' +
          '<dd>' + (value || '—') + '</dd>' +
        '</div>'
      );
    }).join('');
  }

  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var submit = form.querySelector('[type="submit"]');
      var errorBox = document.getElementById('contact-form-error');
      var data = {
        company: text(form.company.value),
        name: text(form.name.value),
        jobTitle: text(form.jobTitle.value),
        phone: text(form.phone.value),
        email: text(form.email.value),
        subject: text(form.subject.value),
        message: text(form.message.value),
        website: text(form.website.value)
      };

      if (errorBox) {
        errorBox.hidden = true;
        errorBox.textContent = '';
      }

      if (data.website) {
        window.location.href = 'contact-thanks.html';
        return;
      }

      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (err) {}

      if (submit) submit.disabled = true;

      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (res) {
        if (res.status === 404 || res.status === 405) {
          window.location.href = 'contact-thanks.html';
          return;
        }
        if (!res.ok) {
          return res.json().then(function (payload) {
            throw new Error((payload && payload.error) || '送信に失敗しました。お手数ですがお電話にてご連絡ください。');
          }, function () {
            throw new Error('送信に失敗しました。お手数ですがお電話にてご連絡ください。');
          });
        }
        window.location.href = 'contact-thanks.html';
      }).catch(function (err) {
        if (err && /Failed to fetch|NetworkError/i.test(String(err.message || err))) {
          window.location.href = 'contact-thanks.html';
          return;
        }
        if (submit) submit.disabled = false;
        if (errorBox) {
          errorBox.hidden = false;
          errorBox.textContent = err && err.message
            ? err.message
            : '送信に失敗しました。お手数ですがお電話にてご連絡ください。';
        }
      });
    });
  }

  var summary = document.getElementById('contact-summary');
  if (summary) {
    var saved = null;
    try {
      saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
    } catch (err) {
      saved = null;
    }
    if (saved) {
      renderSummary(summary, saved);
    } else {
      summary.innerHTML = '<p class="contact-summary-empty">入力内容は、このブラウザでの送信直後のみ表示されます。</p>';
    }
  }

  window.TSUTA_CONTACT = { formatFields: formatFields, renderSummary: renderSummary };
})();
