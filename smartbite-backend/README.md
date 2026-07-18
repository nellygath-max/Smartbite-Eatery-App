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

## Menu image uploads

Menu creation accepts `multipart/form-data`. Send the menu fields (`name`,
`description`, `price`, `stock`, and `category`) as text fields and attach the
image under the key `image`. JPEG, PNG, and WebP files up to 5 MB are accepted.
Images are stored in Cloudinary. Add `CLOUDINARY_CLOUD_NAME`,
`CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` to `.env`; the API returns
the Cloudinary HTTPS URL in `imageUrl`.

`PUT /api/menu/:id` also accepts an optional `image` field and replaces the
existing image. To replace only an image, use `PATCH /api/menu/:id/image`.
