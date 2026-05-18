const db = require("../config/db");

const ENTITY_TABLES = {
  account: "accounts",
  category: "categories",
};

const getOrCreateEntityId = (type, user_id, name) =>
  new Promise((resolve, reject) => {
    const tableName = ENTITY_TABLES[type];

    if (!tableName) {
      return reject(new Error("Tipo de entidad inválido"));
    }

    const query = `SELECT id FROM ${tableName} WHERE name = ? AND user_id = ? LIMIT 1`;

    db.query(query, [name, user_id], (error, results) => {
      if (error) {
        return reject(error);
      }

      if (results.length) {
        return resolve(results[0].id);
      }

      const insertQuery = `INSERT INTO ${tableName} (user_id, name) VALUES (?, ?)`;

      db.query(insertQuery, [user_id, name], (insertError, result) => {
        if (insertError) {
          return reject(insertError);
        }

        resolve(result.insertId);
      });
    });
  });

const resolveEntityIds = async ({
  user_id,
  account_id,
  account_name,
  category_id,
  category_name,
}) => {
  const resolvedAccountId = account_id
    ? account_id
    : await getOrCreateEntityId("account", user_id, account_name);

  const resolvedCategoryId = category_id
    ? category_id
    : await getOrCreateEntityId("category", user_id, category_name);

  return {
    account_id: resolvedAccountId,
    category_id: resolvedCategoryId,
  };
};

const getTransactions = (req, res) => {
  const user_id = req.user.id;
  const { category, account, start_date, end_date, type } = req.query;

  const conditions = ["t.user_id = ?"];
  const params = [user_id];

  if (category) {
    conditions.push("c.name = ?");
    params.push(category);
  }

  if (account) {
    conditions.push("a.name = ?");
    params.push(account);
  }

  if (type) {
    conditions.push("t.type = ?");
    params.push(type);
  }

  if (start_date) {
    conditions.push("t.transaction_date >= ?");
    params.push(start_date);
  }

  if (end_date) {
    conditions.push("t.transaction_date <= ?");
    params.push(end_date);
  }

  const sql = `
    SELECT
      t.*,
      c.name AS category_name
    FROM transactions t
    INNER JOIN accounts a ON t.account_id = a.id
    INNER JOIN categories c ON t.category_id = c.id
    WHERE ${conditions.join(" AND ")}
    ORDER BY t.transaction_date DESC
  `;

  db.query(sql, params, (error, results) => {
    if (error) {
      return res.status(500).json(error);
    }

    res.json(results);
  });
};

const createTransaction = async (req, res) => {
  const user_id = req.user.id;
  console.log("user id:", user_id);
  const {
    account_id,
    payment_method,
    category_id,
    category_name,
    amount,
    type,
    description,
    transaction_date,
  } = req.body;
  console.log("body:", req.body);
  if (!amount || !type || !(category_id || category_name)) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }

  try {
    const resolved = await resolveEntityIds({
      user_id,
      account_id,
      account_name: payment_method,
      category_id,
      category_name,
    });
    console.log("resolved", resolved);
    const sql = `
      INSERT INTO transactions
      (
        user_id,
        account_id,
        category_id,
        amount,
        type,
        description,
        transaction_date
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        user_id,
        resolved.account_id,
        resolved.category_id,
        amount,
        type,
        description,
        transaction_date || new Date().toISOString().slice(0, 10),
      ],
      (error) => {
        if (error) {
          return res.status(500).json(error);
        }

        res.json({ message: "Transacción creada" });
      },
    );
  } catch (error) {
    console.log("error db", error);
    res.status(500).json(error);
  }
};

const updateTransaction = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  const {
    account_id,
    payment_method,
    category_id,
    category_name,
    amount,
    type,
    description,
    transaction_date,
  } = req.body;

  if (!amount || !type || !(category_id || category_name)) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }

  try {
    const resolved = await resolveEntityIds({
      user_id,
      account_id,
      account_name: payment_method,
      category_id,
      category_name,
    });

    const sql = `
      UPDATE transactions
      SET
        account_id=?,
        category_id=?,
        amount=?,
        type=?,
        description=?,
        transaction_date=?
      WHERE id=? AND user_id=?
    `;

    db.query(
      sql,
      [
        resolved.account_id,
        resolved.category_id,
        amount,
        type,
        description,
        transaction_date || new Date().toISOString().slice(0, 10),
        id,
        user_id,
      ],
      (error) => {
        if (error) {
          return res.status(500).json(error);
        }

        res.json({ message: "Transacción actualizada" });
      },
    );
  } catch (error) {
    res.status(500).json(error);
  }
};

const deleteTransaction = (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  const sql = `
    DELETE FROM transactions
    WHERE id=? AND user_id=?
  `;

  db.query(sql, [id, user_id], (error) => {
    if (error) {
      return res.status(500).json(error);
    }

    res.json({ message: "Transacción eliminada" });
  });
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
