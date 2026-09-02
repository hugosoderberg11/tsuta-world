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

function createTransport() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    return null;
  }
  return require('nodemailer').createTransport({
    host: host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || '') === '1',
    auth: { user: user, pass: pass },
  });
}

async function sendWithResend(messages) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return false;
  }
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const payload = {
      from: msg.from,
      to: [msg.to],
      subject: msg.subject,
      text: msg.text,
    };
    if (msg.replyTo) {
      payload.reply_to = msg.replyTo;
    }
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const detail = await res.text();
      throw new Error('Resend error: ' + res.status + ' ' + detail);
    }
  }
  return true;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    json(res, 405, { error: 'Method not allowed' });
    return;
  }

  let body;
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

  const missing = missingRequired(body);
  if (missing.length) {
    json(res, 400, { error: '必須項目が未入力です', missing: missing });
    return;
  }
  if (!isValidEmail(str(body.email))) {
    json(res, 400, { error: 'メールアドレスの形式が正しくありません' });
    return;
  }

  const fields = formatFields(body);
  const messages = [
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
    const sentResend = await sendWithResend(messages);
    if (sentResend) {
      json(res, 200, { ok: true, delivered: true });
      return;
    }

    const transport = createTransport();
    if (transport) {
      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        await transport.sendMail({
          from: msg.from,
          to: msg.to,
          replyTo: msg.replyTo,
          subject: msg.subject,
          text: msg.text,
        });
      }
      json(res, 200, { ok: true, delivered: true });
      return;
    }
  } catch (err) {
    json(res, 502, { error: 'メール送信に失敗しました' });
    return;
  }

  json(res, 200, {
    ok: true,
    delivered: false,
    preview: true,
    fields: fields,
  });
};
