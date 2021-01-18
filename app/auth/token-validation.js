const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router()
const app = express();

router.use((req, res, next) => {
  const token = req.headers['Authorization'];

  if (token) {
    jwt.verify(token, process.env.SEED_AUTENTICACION, (err, decoded) => {
      if (err) {
        return res.json({ mensaje: 'Token inválida' });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    res.send({
      mensaje: 'No se ha encontrado el token.'
    });
  }
});

module.exports = router;