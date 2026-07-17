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
Public signup always creates a `user`; create admin
accounts only through a protected administrative provisioning process.

## Menu image uploads

Menu creation accepts `multipart/form-data`. Send the menu fields (`name`,
`description`, `price`, `stock`, and `category`) as text fields and attach the
image under the key `image`. JPEG, PNG, and WebP files up to 5 MB are accepted.
The API returns the saved public `imageUrl`, which is available from
`/uploads/menu/<filename>`.

`PUT /api/menu/:id` also accepts an optional `image` field and replaces the
existing image. To replace only an image, use `PATCH /api/menu/:id/image`.
