const cookieOptions = {
    httpOnly: true,                                   // JS on the frontend can't read it — blocks XSS token theft
    secure: process.env.NODE_ENV === 'production',     // only sent over HTTPS in prod; localhost is fine over HTTP in dev
    sameSite: 'lax',                                   // CSRF protection baseline; use 'none' + secure:true if frontend is on a different domain
    maxAge: 7 * 24 * 60 * 60 * 1000                    // 7 days, matches JWT_EXPIRES_IN
};

module.exports = cookieOptions;