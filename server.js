const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3000;

const db = new sqlite3.Database(path.join(__dirname, "contacts.db"), (err) => {
  if (err) {
    console.error("Failed to connect to SQLite:", err.message);
  } else {
    console.log("Connected to SQLite database.");
  }
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      phone_normalized TEXT NOT NULL UNIQUE,
      email_normalized TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

function normalizePhone(phone) {
  return String(phone).replace(/\D/g, "");
}

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

function isValidPhone(phone) {
  const normalized = normalizePhone(phone);
  return normalized.length >= 10 && normalized.length <= 15;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

app.get("/api/contacts", (req, res) => {
  const search = (req.query.search || "").trim();
  const sort = req.query.sort === "desc" ? "DESC" : "ASC";
  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const limit = Math.max(parseInt(req.query.limit || "5", 10), 1);
  const offset = (page - 1) * limit;

  let whereClause = "";
  let params = [];

  if (search) {
    whereClause = `WHERE name LIKE ? OR phone LIKE ? OR email LIKE ?`;
    params = [`%${search}%`, `%${search}%`, `%${search}%`];
  }

  const countSql = `SELECT COUNT(*) AS total FROM contacts ${whereClause}`;
  const listSql = `
    SELECT id, name, phone, email, created_at
    FROM contacts
    ${whereClause}
    ORDER BY name ${sort}
    LIMIT ? OFFSET ?
  `;

  db.get(countSql, params, (countErr, countRow) => {
    if (countErr) {
      console.error(countErr);
      return res.status(500).json({ message: "Failed to count contacts." });
    }

    db.all(listSql, [...params, limit, offset], (listErr, rows) => {
      if (listErr) {
        console.error(listErr);
        return res.status(500).json({ message: "Failed to fetch contacts." });
      }

      const total = countRow ? countRow.total : 0;
      const totalPages = total === 0 ? 1 : Math.ceil(total / limit);

      res.json({
        data: rows,
        pagination: {
          total,
          page,
          limit,
          totalPages
        }
      });
    });
  });
});

app.post("/api/contacts", (req, res) => {
  const { name, phone, email } = req.body;

  if (!name || !phone || !email) {
    return res.status(400).json({ message: "Name, phone, and email are required." });
  }

  if (!isValidPhone(phone)) {
    return res.status(400).json({ message: "Invalid phone number." });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid email address." });
  }

  const phoneNormalized = normalizePhone(phone);
  const emailNormalized = normalizeEmail(email);

  db.get(
    `SELECT id FROM contacts WHERE phone_normalized = ? OR email_normalized = ?`,
    [phoneNormalized, emailNormalized],
    (err, existing) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to validate duplicates." });
      }

      if (existing) {
        return res.status(400).json({
          message: "A contact already exists with the same phone number or email."
        });
      }

      db.run(
        `INSERT INTO contacts (name, phone, email, phone_normalized, email_normalized)
         VALUES (?, ?, ?, ?, ?)`,
        [name.trim(), phone.trim(), email.trim(), phoneNormalized, emailNormalized],
        function (insertErr) {
          if (insertErr) {
            console.error(insertErr);
            return res.status(500).json({ message: "Failed to add contact." });
          }

          res.status(201).json({
            message: "Contact added successfully.",
            id: this.lastID
          });
        }
      );
    }
  );
});

app.put("/api/contacts/:id", (req, res) => {
  const id = Number(req.params.id);
  const { name, phone, email } = req.body;

  if (!name || !phone || !email) {
    return res.status(400).json({ message: "Name, phone, and email are required." });
  }

  if (!isValidPhone(phone)) {
    return res.status(400).json({ message: "Invalid phone number." });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid email address." });
  }

  const phoneNormalized = normalizePhone(phone);
  const emailNormalized = normalizeEmail(email);

  db.get(`SELECT id FROM contacts WHERE id = ?`, [id], (findErr, row) => {
    if (findErr) {
      console.error(findErr);
      return res.status(500).json({ message: "Failed to find contact." });
    }

    if (!row) {
      return res.status(404).json({ message: "Contact not found." });
    }

    db.get(
      `SELECT id FROM contacts
       WHERE id != ? AND (phone_normalized = ? OR email_normalized = ?)`,
      [id, phoneNormalized, emailNormalized],
      (dupErr, duplicate) => {
        if (dupErr) {
          console.error(dupErr);
          return res.status(500).json({ message: "Failed to validate duplicates." });
        }

        if (duplicate) {
          return res.status(400).json({
            message: "Another contact already uses that phone number or email."
          });
        }

        db.run(
          `UPDATE contacts
           SET name = ?, phone = ?, email = ?, phone_normalized = ?, email_normalized = ?
           WHERE id = ?`,
          [name.trim(), phone.trim(), email.trim(), phoneNormalized, emailNormalized, id],
          function (updateErr) {
            if (updateErr) {
              console.error(updateErr);
              return res.status(500).json({ message: "Failed to update contact." });
            }

            res.json({ message: "Contact updated successfully." });
          }
        );
      }
    );
  });
});

app.delete("/api/contacts/:id", (req, res) => {
  const id = Number(req.params.id);

  db.run(`DELETE FROM contacts WHERE id = ?`, [id], function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to delete contact." });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: "Contact not found." });
    }

    res.json({ message: "Contact deleted successfully." });
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});