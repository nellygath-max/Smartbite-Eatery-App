# SmartBite Eatery

S.M.A.R.T Bite — Every Bite, A Promise Kept.

SmartBite Eatery is a full-stack food-ordering web application for browsing meals, building a cart, placing orders, and tracking order history. It also provides role-based operations for administrators and delivery staff: administrators can manage menu items, categories, orders, users, and reviews, while delivery staff can update order fulfilment. The customer-facing app is built as a responsive React single-page application and communicates with a REST API backed by MongoDB.


## S.M.A.R.T. — What it stands for
Letter	Value	What it means
S	Sincere	What's on the menu is what's on your plate — no exaggeration, no bait-and-switch.
M	Made-fresh	Nothing frozen and passed off as fresh, nothing hidden in the kitchen.
A	Authentic	Real recipes, real ingredients, real flavor — no shortcuts, no imitations.
R	Reliable	Same quality, same experience, every single visit.
T	Transparent	Clear pricing, clear sourcing — no surprises on your plate or your bill.

## Why S.M.A.R.T Bite?

Trust is not something we advertise rather it is something you taste. Every letter above answers a question a customer subconsciously asks before they order: 
1. Is this real? 
2. Will it be the same next time? 
3. Are they hiding anything?

S.M.A.R.T Bite is our answer to all three.

## Links

| Resource | Link |
| --- | --- |
| Deployed frontend | Not currently deployed |THIS HAS NOT BEEN SUPPLIED

| Deployed backend base URL | Not currently deployed |THIS HAS NOT BEEN SUPPLIED

| API documentation | [SmartBite Postman collection](https://web.postman.co/workspace/Chinelo-Onwuegbuna's-Workspace~f7d92af7-485f-4545-82a4-6d13e46fbb64/collection/55946156-850b8bf8-f584-47c4-b42a-0a6e6ec8de58) |


| API collection in this repository | [`smartbite-backend/postman/SmartBite API.postman_collection.json`]() |

## Features

- Browse, search, filter, and view meal details.
- Add meals to a persistent browser cart and place orders.
- Register, sign in, manage a profile, and view personal order history.
- Leave and update meal reviews.
- Manage menu items and images, menu categories, users, reviews, and orders from the admin area.smartbite-backend/postman/SmartBite%20API.postman_collection.json
- Update delivery order status as an administrator or delivery staff member.

## Tech stack

| Area | Technologies |

| Frontend | React, Vite, React Router, Axios, Tailwind CSS, React Hook Form, Redux Toolkit, ESlint, prettierrc |

| Backend | Node.js, Express, MongoDB, Mongoose, Postman, JSON Web Tokens, bcryptjs |

| Supporting services and middleware | Cloudinary, Multer, express-validator, Helmet, CORS, Morgan, express-rate-limit |

## Run locally

### Prerequisites

- Node.js and npm
- A MongoDB database (local or hosted)
- A Cloudinary account if menu-image uploads are required

### 1. Clone the repository

```bash
git clone https://github.com/nellygath-max/smartbite-eatery-app.git
cd smartbite-eatery-app
npm install
npm run dev or node server.js or node index.js
```

### 2. Configure and start the backend

Open a first terminal, configure `smartbite-frontend/.env` with the backend API URL

Create `smartbite-backend/.env` from `smartbite-backend/.env.example`, then provide the required environment-variable values for your environment. `JWT_SECRET` must be a unique random value of at least 32 characters.

```bash
cd smartbite-backend
npm install
node server.js
```

The API is available locally at `http://localhost:3000`, with API routes under `/api`. Confirm the service with `GET /health` or `GET /api/health`.

### 3. Configure and start the frontend

Open a second terminal, configure `smartbite-frontend/.env` with the backend API URL, then start Vite.

```bash
cd smartbite-frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`). If the frontend and backend are hosted on different origins, add the frontend origin to the backend CORS configuration.

## Environment variables

Configure these variable names as needed. Do not commit secret values.

| Location | Variable names |
| --- | --- |
| `smartbite-backend/.env` | 
`PORT`=3000 
`HOST`=0.0.0.0/0
`NODE_ENV`=development

## Frontend URL(s) allowed to access the backend
`CORS_ORIGINS`=http://localhost:5173 

## MongoDB
`MONGO_URI`=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/
`MONGO_DB_NAME`=Smartbite Eatery App 

## JWT Configuration
`JWT_SECRET`=my_super_secret_jwt_key_123456
`JWT_ISSUER`=smartbite-api
`JWT_AUDIENCE`=smartbite-api-client
`JWT_EXPIRES_IN`=7d

## Cloudinary
`CLOUDINARY_CLOUD_NAME`=mycloudname
`CLOUDINARY_API_KEY`=123456789012345
`CLOUDINARY_API_SECRET`=my_cloudinary_api_secret 

|`smartbite-frontend/.env` | 
`VITE_API_URL`=http://localhost:5000/api

## Paystack
`PAYSTACK_SECRET_KEY`=process.env.PAYSTACK_SECRET_KEY

## API summary(link to the full API docs)

All application API routes are prefixed with `/api`. Protected endpoints require a bearer token; endpoints marked **Admin** require an administrator role, while **Admin/Delivery** accept either administrator or delivery-staff roles.

## link to the full API docs
Import the [Postman collection](https://web.postman.co/workspace/Chinelo-Onwuegbuna's-Workspace~f7d92af7-485f-4545-82a4-6d13e46fbb64/collection/55946156-850b8bf8-f584-47c4-b42a-0a6e6ec8de58) for request examples and full payload details.


| Area | Endpoints |
| --- | --- |
| Health |
`GET /health`, 
`GET /api/health` |

| Authentication |
| Method | Endpoint | Description |
`POST /api/auth/signup`, 
`POST /api/auth/login`, 
`POST /api/auth/logout`, 
`GET /api/auth/profile`, 
`GET /api/auth/admin/users` **Admin** |

| User profile | 
| Method | Endpoint | Description |
`GET /api/users/profile`, 
`PUT /api/users/profile` |

| Menu items | 
| Method | Endpoint | Description |
`GET /api/menu`, 
`GET /api/menu/:id`, 
`POST /api/menu` **Admin**, 
`PUT /api/menu/:id` **Admin**, 
`PATCH /api/menu/:id/image` **Admin**, 
`DELETE /api/menu/:id` **Admin** |

| Menu categories | 
| Method | Endpoint | Description |
`GET /api/menu-categories`, 
`GET /api/menu-categories/:id`, 
`POST /api/menu-categories` **Admin**, 
`PATCH /api/menu-categories/:id` **Admin**, 
`DELETE /api/menu-categories/:id` **Admin** |

| Orders | 
| Method | Endpoint | Description |
`POST /api/orders`, 
`GET /api/orders/my-orders` |

| Reviews |
| Method | Endpoint | Description | 
`POST /api/reviews`, 
`GET /api/reviews`, 
`GET /api/reviews/menu/:menuItemId`, 
`GET /api/reviews/my-reviews`, 
`PATCH /api/reviews/:id` |

| Administration | 
| Method | Endpoint | Description |
`GET /api/admin/dashboard`, 
`GET /api/admin/users`, 
`POST /api/admin/users`, 
`PATCH /api/admin/users/:id/role`, 
`GET /api/admin/orders`, 
`PATCH /api/admin/orders/:id/status`, 
`PATCH /api/admin/orders/:id/payment-status`, 
`DELETE /api/admin/orders/:id` |
| Sample | `GET /api/sample`, `POST /api/sample` |

## Screenshots
Screenshots of key pages (Home, Menu, Cart, Admin Dashboard, etc.). 

## Home
![alt text](homepage.PNG)

## About
![](about.PNG)

## Menu categories
![alt text](menucategories.PNG)

## Menu
![alt text](menu.PNG)

## Menu items
![alt text](menuitems.PNG)

## Contact
![alt text](contact.PNG)

## Check out
![alt text](checkout.PNG)

## Users
![alt text](users.PNG)

## My orders
![alt text](myorderspage.PNG)

## My orders page
![alt text](myorderspage-1.PNG)

## My order status
![alt text](<order status.PNG>)

## Tracking orders by delivery staff
![alt text](trackingorders.PNG)

## Login
![alt text](login.PNG)

## Signup
![alt text](<signup page.PNG>)

## Admin dashboard
![alt text](<admin dashboard.PNG>)

## Admin profile
![alt text](<admin profile.PNG>)


## Delivery staff dashboard
![alt text](<delivery staff dashboard.PNG>)

## Delivery Orders
![alt text](<delivery orders.PNG>)

## Add to cart
![alt text](addtocart.PNG)

## Cart items
![alt text](cartitems.PNG)

## Review
![alt text](review.PNG)

## Known limitations

- A deployed frontend and backend URL have not yet been provided or configured in this repository.
- Automated tests are not configured; the backend test script is currently a placeholder.
- Paystack payments require a `PAYSTACK_SECRET_KEY` in `smartbite-backend/.env`.
- Email notifications are not implemented.


## Testing

API endpoints were manually tested using Postman.
Frontend and backend integration was tested successfully.
No automated testing framework (such as Jest or Supertest) has been configured yet.


## Author

| Field | Details |
| --- | --- |
| Author |Onwuegbuna Chinelo A. |

| Cohort 7

| Submission date | 21 July 2026 |
