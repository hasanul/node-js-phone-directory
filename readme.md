# Phone Directory App

A full-stack **Phone Directory web application** built with **Node.js, Express, SQLite, and Bootstrap**.
This app allows users to manage contacts with features like search, sorting, pagination, validation, and duplicate prevention.

---

## Features

* Create, Read, Update, Delete (CRUD) contacts
* Search contacts (name, phone, email)
* Sort contacts (A → Z / Z → A)
* Pagination support (configurable page size)
* Phone & Email validation
* Duplicate prevention using normalized values
* Responsive UI with Bootstrap
* SQLite database (lightweight & fast)

---

## Tech Stack

**Backend**

* Node.js
* Express.js
* SQLite3

**Frontend**

* HTML5
* Bootstrap 5
* Vanilla JavaScript (Fetch API)

---

## Project Structure

```
phone-directory/
├── server.js
├── contacts.db
├── package.json
└── public/
    ├── index.html
	└── script.js
```

---

## Installation & Setup

### 1. Clone the repository

```
git clone https://github.com/hasanul/node-js-phone-directory.git
cd node-js-phone-directory
```

### 2. Install dependencies

```
npm install
```

### 3. Run the application

```
node server.js
```

### 4. Open in browser

```
http://localhost:3000
```

---

## Key Concepts Implemented

### Data Normalization

* Phone numbers are stored without special characters
* Emails are stored in lowercase
* Prevents duplicate entries like:

  * `(210) 555-1234` vs `2105551234`
  * `Test@Email.com` vs `test@email.com`

---

### Pagination

* Server-side pagination for performance
* Configurable limit per page
* Efficient data loading

---

### Search & Filtering

* Real-time search across:

  * Name
  * Phone
  * Email

---

### REST API Design

| Method | Endpoint            | Description                             |
| ------ | ------------------- | --------------------------------------- |
| GET    | `/api/contacts`     | Get contacts (search, sort, pagination) |
| POST   | `/api/contacts`     | Create new contact                      |
| PUT    | `/api/contacts/:id` | Update contact                          |
| DELETE | `/api/contacts/:id` | Delete contact                          |

---

## Performance Considerations

* Indexed normalized fields for fast lookup
* Server-side filtering instead of client-side
* Lightweight SQLite database

---

## Future Improvements

* Authentication (JWT / Session-based login)
* Multi-user support
* CSV import/export
* React frontend
* API rate limiting
* Unit & integration tests

---

## How to Reset Database

If you need a fresh start:

```
rm contacts.db
node server.js
```

---

## Screenshot

<img width="1089" height="740" alt="Lightweight Phone Directory" src="https://github.com/user-attachments/assets/c305e2c7-ea30-49a9-a4b2-41893129e99d" />

---

## Author

**Hasanul Banna**
Senior Software Engineer (Salesforce)

---

## If you like this project

Give it a ⭐ on GitHub — it helps others discover it!

---
