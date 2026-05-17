const db = require('../config/db');


// OBTENER TODAS

const getTransactions = (req, res) => {

  const sql =
    'SELECT * FROM transactions';

  db.query(sql, (error, results) => {

    if (error) {

      res.status(500).json(error);

    } else {

      res.json(results);

    }

  });

};


// CREAR

const createTransaction = (req, res) => {

  const {

    monto,
    tipo,
    categoria,
    cuenta,
    descripcion

  } = req.body;


  const sql = `

    INSERT INTO transactions
    (monto, tipo, categoria, cuenta, descripcion)

    VALUES (?, ?, ?, ?, ?)

  `;

  db.query(

    sql,

    [
      monto,
      tipo,
      categoria,
      cuenta,
      descripcion
    ],

    (error, result) => {

      if (error) {

        res.status(500).json(error);

      } else {

        res.json({
          message:
            'Transacción creada'
        });

      }

    }

  );

};


// ACTUALIZAR

const updateTransaction = (req, res) => {

  const { id } = req.params;

  const {

    monto,
    tipo,
    categoria,
    cuenta,
    descripcion

  } = req.body;


  const sql = `

    UPDATE transactions

    SET

      monto=?,
      tipo=?,
      categoria=?,
      cuenta=?,
      descripcion=?

    WHERE id=?

  `;


  db.query(

    sql,

    [
      monto,
      tipo,
      categoria,
      cuenta,
      descripcion,
      id
    ],

    (error, result) => {

      if (error) {

        res.status(500).json(error);

      } else {

        res.json({
          message:
            'Actualizada'
        });

      }

    }

  );

};


// ELIMINAR

const deleteTransaction = (req, res) => {

  const { id } = req.params;

  const sql =
    'DELETE FROM transactions WHERE id=?';

  db.query(

    sql,

    [id],

    (error, result) => {

      if (error) {

        res.status(500).json(error);

      } else {

        res.json({
          message:
            'Eliminada'
        });

      }

    }

  );

};


module.exports = {

  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction

};