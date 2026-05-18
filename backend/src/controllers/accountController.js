const db = require("../config/db");

const getAccounts = (req, res) => {
  const user_id = req.user.id;

  const sql = `
        SELECT
            a.id,
            a.name,
            COALESCE(
                SUM(
                    CASE
                        WHEN t.type = 'ingreso' THEN t.amount
                        WHEN t.type = 'gasto' THEN -t.amount
                        ELSE 0
                    END
                ),
                0
            ) AS balance
        FROM accounts a
        LEFT JOIN transactions t
            ON a.id = t.account_id AND t.user_id = a.user_id
        WHERE a.user_id = ?
        GROUP BY a.id
        ORDER BY a.name ASC
    `;

  db.query(sql, [user_id], (error, results) => {
    if (error) {
      return res.status(500).json(error);
    }

    res.json(results);
  });
};

const createAccount = (req, res) => {
  const user_id = req.user.id;
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      message: "El nombre de la cuenta es obligatorio",
    });
  }

  const trimmedName = name.trim();

  const query = `
        SELECT id
        FROM accounts
        WHERE user_id = ? AND name = ?
        LIMIT 1
    `;

  db.query(query, [user_id, trimmedName], (error, results) => {
    if (error) {
      return res.status(500).json({
        message: error.message,
        sqlMessage: error.sqlMessage,
      });
    }

    if (results.length) {
      return res.status(409).json({
        message: "Ya existe una cuenta con ese nombre",
      });
    }

    const insertSql = `
            INSERT INTO accounts (user_id, name)
            VALUES (?, ?)
        `;

    db.query(insertSql, [user_id, trimmedName], (insertError, insertResult) => {
      if (insertError) {
        return res.status(500).json({
          message: error.message,
          sqlMessage: error.sqlMessage,
        });
      }

      res.json({
        id: insertResult.insertId,
        name: trimmedName,
        balance: 0,
      });
    });
  });
};

const deleteAccount = (req, res) => {
  const user_id = req.user.id;
  const { id } = req.params;

  const deleteTransactionsSql = `
    DELETE FROM transactions
    WHERE account_id = ? AND user_id = ?
  `;

  db.query(deleteTransactionsSql, [id, user_id], (transactionError) => {
    if (transactionError) {
      return res.status(500).json({
        message: transactionError.message,
        sqlMessage: transactionError.sqlMessage,
      });
    }

    const deleteAccountSql = `
      DELETE FROM accounts
      WHERE id = ? AND user_id = ?
    `;

    db.query(deleteAccountSql, [id, user_id], (accountError) => {
      if (accountError) {
        return res.status(500).json({
          message: accountError.message,
          sqlMessage: accountError.sqlMessage,
        });
      }

      res.json({
        message: "Cuenta eliminada correctamente",
      });
    });
  });
};

module.exports = {
  getAccounts,
  createAccount,
  deleteAccount,
};
