const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Todos los campos son requeridos" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ message: "Correo electrónico no válido" });
    }

    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[^A-Za-z0-9]/.test(password)
    ) {
      return res.status(400).json({
        message:
          "La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial",
      });
    }

    // verificar email existente
    const checkQuery = "SELECT * FROM users WHERE email = ?";

    db.query(checkQuery, [email], async (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (result.length > 0) {
        return res.status(400).json({
          message: "Este correo ya está registrado",
        });
      }

      // hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const insertQuery = `
        INSERT INTO users (name, email, password)
        VALUES (?, ?, ?)
      `;

      db.query(insertQuery, [name, email, hashedPassword], (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }

        const newUserId = result.insertId;
        const defaultAccounts = [
          "Efectivo",
          "Débito",
          "Crédito",
          "Transferencia",
          "Billetera digital",
        ];
        const accountValues = defaultAccounts.map((acc) => [newUserId, acc]);

        db.query(
          "INSERT INTO accounts (user_id, name) VALUES ?",
          [accountValues],
          (accErr) => {
            if (accErr) {
              console.error("Error creando cuentas por defecto:", accErr);
            }
            res.status(201).json({ message: "Cuenta creada exitosamente" });
          },
        );
      });
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error?.message || "Error interno del servidor" });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const query = "SELECT * FROM users WHERE email = ?";

    db.query(query, [email], async (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (result.length === 0) {
        return res.status(401).json({
          message: "Invalid credentials",
        });
      }

      const user = result[0];

      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return res.status(401).json({
          message: "Invalid credentials",
        });
      }

      // JWT
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        },
      );

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error?.message || "Error interno del servidor" });
  }
};

module.exports = {
  register,
  login,
};
