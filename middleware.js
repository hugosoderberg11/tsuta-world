import { next } from '@vercel/functions';

function unauthorized() {
  return new Response('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="TSUTA-WORLD"',
    },
  });
}

function parseBasicAuth(authorization) {
  if (!authorization || !authorization.startsWith('Basic ')) {
    return null;
  }

  try {
    const decoded = atob(authorization.slice(6));
    const separator = decoded.indexOf(':');
    if (separator === -1) {
      return null;
    }

    return {
      user: decoded.slice(0, separator),
      password: decoded.slice(separator + 1),
    };
  } catch {
    return null;
  }
}

export default function middleware(request) {
  const expectedUser = process.env.BASIC_AUTH_USER;
  const expectedPassword = process.env.BASIC_AUTH_PASSWORD;

  if (!expectedUser || !expectedPassword) {
    return unauthorized();
  }

  const credentials = parseBasicAuth(request.headers.get('authorization'));
  if (
    credentials &&
    credentials.user === expectedUser &&
    credentials.password === expectedPassword
  ) {
    return next();
  }

  return unauthorized();
}

export const config = {
  matcher: ['/(.*)'],
};
