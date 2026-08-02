# SmartBite Backend

Minimal Express server and folder structure.

Run:

```bash
npm install
copy .env.example .env
node server.js
```

Set `JWT_SECRET` in `.env` to a unique, cryptographically random secret before
starting the application (at least 32 characters; do not keep the example value).
Access tokens expire within one day and can be invalidated with `POST /api/auth/logout`.
Public signup creates a `user` by default. Send `role: "admin"` to create an
admin account, or `role: "user"` to explicitly create a regular account. An
authenticated admin can also provision either role with `POST /api/admin/users`.

## Email and OTP reset setup

Forgot-password OTP delivery uses SMTP. Configure these environment variables in
`.env` so `POST /api/auth/forgot-password` can send reset codes reliably in all
environments (local, staging, and production).

Required for OTP email sending:

- `SMTP_HOST`: SMTP server hostname (for example `smtp.gmail.com`).
- `SMTP_PORT`: SMTP port, usually `587` (STARTTLS) or `465` (SSL/TLS).
- `SMTP_USER`: SMTP username/login.
- `SMTP_PASS`: SMTP password or provider app password.
- `ADMIN_EMAIL`: Fallback sender address and admin mailbox.

Recommended:

- `SMTP_FROM`: Explicit sender email shown to customers. If omitted, the server
	falls back to `ADMIN_EMAIL`.
- `SMTP_SECURE`: `true` for implicit TLS (normally port `465`), otherwise
	`false` (normally port `587`).

Example `.env` snippet:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password-or-app-password
SMTP_FROM=no-reply@smartbite.com
ADMIN_EMAIL=admin@smartbite.com
```

Notes:

- OTP reset emails are sent by `POST /api/auth/forgot-password` and verified by
	`POST /api/auth/reset-password`.
- If SMTP credentials are missing or invalid, forgot-password requests cannot
	deliver OTP email. The API now returns `503` with a clear configuration
	message when SMTP is not configured.
- To verify SMTP from the backend folder, run:

```bash
node -e "const { getTransporter } = require('./src/services/mailService'); getTransporter().verify().then(()=>console.log('SMTP ok')).catch((e)=>{console.error(e.message); process.exit(1);});"
```

## Menu image uploads

Menu creation accepts `multipart/form-data`. Send the menu fields (`name`,
`description`, `price`, `stock`, and `category`) as text fields and attach the
image under the key `image`. JPEG, PNG, and WebP files up to 5 MB are accepted.
Images are stored in Cloudinary. Add `CLOUDINARY_CLOUD_NAME`,
`CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` to `.env`; the API returns
the Cloudinary HTTPS URL in `imageUrl`.

`PUT /api/menu/:id` also accepts an optional `image` field and replaces the
existing image. To replace only an image, use `PATCH /api/menu/:id/image`.
