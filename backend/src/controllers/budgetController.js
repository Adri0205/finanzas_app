const db = require("../config/db");

const getOrCreateEntityId = (type, user_id, name) =>
  new Promise((resolve, reject) => {
    const tableName = type === "category" ? "categories" : null;

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

const getBudgets = (req, res) => {
  const user_id = req.user.id;
  const month =
    req.query.month ||
    (() => {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    })();

  const sql = `
    SELECT
      c.id AS category_id,
      c.name AS category_name,
      COALESCE(b.budget_limit, 0) AS budget_limit,
      COALESCE(SUM(
        CASE
          WHEN t.type = 'gasto' THEN t.amount
          ELSE 0
        END
      ), 0) AS spent
    FROM categories c
    LEFT JOIN budgets b
      ON b.category_id = c.id
      AND b.user_id = c.user_id
      AND b.month = ?
    LEFT JOIN transactions t
      ON t.category_id = c.id
      AND t.user_id = c.user_id
      AND t.type = 'gasto'
      AND LEFT(t.transaction_date, 7) = ?
    WHERE c.user_id = ?
    GROUP BY c.id, c.name, b.budget_limit
    ORDER BY c.name ASC
  `;

  db.query(sql, [month, month, user_id], (error, results) => {
    if (error) {
      console.error("getBudgets error:", error);
      return res.status(500).json(error);
    }
    console.log(
      `getBudgets month=${month} user=${user_id} results:`,
      results.length,
    );
    res.json({ month, budgets: results });
  });
};

const createOrUpdateBudget = async (req, res) => {
  const user_id = req.user.id;
  const { category_name, budget_limit, month } = req.body;

  if (!category_name || !month) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }

  const parsedLimit = Number(budget_limit);

  if (Number.isNaN(parsedLimit) || parsedLimit < 0) {
    return res.status(400).json({
      message: "El presupuesto debe ser un número válido mayor o igual a 0",
    });
  }

  try {
    const category_id = await getOrCreateEntityId(
      "category",
      user_id,
      category_name.trim(),
    );

    const sql = `
      INSERT INTO budgets (user_id, category_id, month, budget_limit)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE budget_limit = VALUES(budget_limit)
    `;

    db.query(sql, [user_id, category_id, month, parsedLimit], (error) => {
      if (error) {
        return res.status(500).json(error);
      }

      res.json({ message: "Presupuesto guardado" });
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
  getBudgets,
  createOrUpdateBudget,
};
