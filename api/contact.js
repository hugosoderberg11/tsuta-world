const TO_ADDRESS = process.env.CONTACT_TO || 'info@tsuta-world.com';
const FROM_ADDRESS = process.env.CONTACT_FROM || TO_ADDRESS;

const FIELD_ORDER = [
  ['company', '会社名'],
  ['name', 'お名前'],
  ['jobTitle', '役職'],
  ['phone', '電話番号'],
  ['email', 'メールアドレス'],
  ['subject', '件名'],
  ['message', 'お問い合わせ内容'],
];

function str(value) {
  return String(value || '').trim();
}

function formatFields(body) {
  return FIELD_ORDER.map(function (pair) {
    const label = pair[0];
    const name = pair[1];
    const value = str(body[label]);
    if (label === 'message') {
      return name + '：\n' + value;
    }
    return name + '：' + value;
  }).join('\n');
}

function autoReplyBody(body) {
  return [
    'この度はお問い合わせいただきありがとうございます。',
    '内容を精査し、2~3営業日以内に返信いたします。',
    'なお、内容に対してご返信を控えさせていただく場合がございますこと、予めご了承くださいませ。',
    '',
    '■下記内容にて送信されました■',
    '',
    formatFields(body),
  ].join('\n');
}

function adminBody(body) {
  return [
    '下記内容にてお問合せをいただきました',
    '',
    formatFields(body),
  ].join('\n');
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function missingRequired(body) {
  const required = ['company', 'name', 'jobTitle', 'phone', 'email', 'subject', 'message'];
  return required.filter(function (key) {
    return !str(body[key]);
  });
}

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise(function (resolve, reject) {
    const chunks = [];
    req.on('data', function (chunk) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    req.on('end', function () {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function parseResendError(status, raw) {
  var message = '';
  try {
    var parsed = JSON.parse(raw);
    message = str(parsed && parsed.message);
  } catch (err) {
    message = str(raw).slice(0, 300);
  }
  if (status === 401 || status === 403) {
    return 'Resendの認証に失敗しました。APIキーを確認してください。';
  }
  if (message) {
    return 'メール送信に失敗しました（' + message + '）。お手数ですがお電話にてご連絡ください。';
  }
  return 'メール送信に失敗しました。お手数ですがお電話にてご連絡ください。';
}

async function sendWithResend(apiKey, messages) {
  for (var i = 0; i < messages.length; i++) {
    var msg = messages[i];
    var payload = {
      from: msg.from,
      to: [msg.to],
      subject: msg.subject,
      text: msg.text,
    };
    if (msg.replyTo) {
      payload.reply_to = msg.replyTo;
    }
    var res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      var detail = await res.text();
      var error = new Error(parseResendError(res.status, detail));
      error.status = res.status >= 400 && res.status < 600 ? res.status : 502;
      throw error;
    }
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    json(res, 405, { error: 'Method not allowed' });
    return;
  }

  var body;
  try {
    body = await readBody(req);
  } catch (err) {
    json(res, 400, { error: 'Invalid JSON' });
    return;
  }

  if (str(body.website)) {
    json(res, 200, { ok: true });
    return;
  }

  var missing = missingRequired(body);
  if (missing.length) {
    json(res, 400, { error: '必須項目が未入力です', missing: missing });
    return;
  }
  if (!isValidEmail(str(body.email))) {
    json(res, 400, { error: 'メールアドレスの形式が正しくありません' });
    return;
  }

  var apiKey = str(process.env.RESEND_API_KEY);
  if (!apiKey) {
    json(res, 503, {
      error: 'メール送信の設定が完了していません。お手数ですがお電話（03-6722-6776）にてご連絡ください。',
    });
    return;
  }

  var messages = [
    {
      from: FROM_ADDRESS,
      to: TO_ADDRESS,
      replyTo: str(body.email),
      subject: 'お問い合わせがありました',
      text: adminBody(body),
    },
    {
      from: FROM_ADDRESS,
      to: str(body.email),
      subject: 'お問い合わせありがとうございます',
      text: autoReplyBody(body),
    },
  ];

  try {
    await sendWithResend(apiKey, messages);
  } catch (err) {
    json(res, err && err.status ? err.status : 502, {
      error: err && err.message
        ? err.message
        : 'メール送信に失敗しました。お手数ですがお電話にてご連絡ください。',
    });
    return;
  }

  json(res, 200, { ok: true, delivered: true });
};
