const db = require("../config/db");

// OBTENER TRANSACCIONES DEL USUARIO

const getTransactions = (req, res) => {
  const user_id = req.user.id;

  const sql = `

    SELECT
      t.*,
      a.name AS account_name,
      c.name AS category_name

    FROM transactions t

    INNER JOIN accounts a
      ON t.account_id = a.id

    INNER JOIN categories c
      ON t.category_id = c.id

    WHERE t.user_id = ?

    ORDER BY t.transaction_date DESC

  `;

  db.query(
    sql,

    [user_id],

    (error, results) => {
      if (error) {
        return res.status(500).json(error);
      }

      res.json(results);
    },
  );
};

// CREAR TRANSACCIÓN

const createTransaction = (req, res) => {
  const user_id = req.user.id;

  const {
    account_id,
    category_id,
    amount,
    type,
    description,
    transaction_date,
  } = req.body;

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
      account_id,
      category_id,
      amount,
      type,
      description,
      transaction_date,
    ],

    (error, result) => {
      if (error) {
        return res.status(500).json(error);
      }

      res.json({
        message: "Transacción creada",
      });
    },
  );
};

// ACTUALIZAR

const updateTransaction = (req, res) => {
  const { id } = req.params;

  const user_id = req.user.id;

  const {
    account_id,
    category_id,
    amount,
    type,
    description,
    transaction_date,
  } = req.body;

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
      account_id,
      category_id,
      amount,
      type,
      description,
      transaction_date,
      id,
      user_id,
    ],

    (error, result) => {
      if (error) {
        return res.status(500).json(error);
      }

      res.json({
        message: "Transacción actualizada",
      });
    },
  );
};

// ELIMINAR

const deleteTransaction = (req, res) => {
  const { id } = req.params;

  const user_id = req.user.id;

  const sql = `

    DELETE FROM transactions

    WHERE id=? AND user_id=?

  `;

  db.query(
    sql,

    [id, user_id],

    (error, result) => {
      if (error) {
        return res.status(500).json(error);
      }

      res.json({
        message: "Transacción eliminada",
      });
    },
  );
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
