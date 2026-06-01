const express = require('express');
  const pool = require('./db');
  const app = express();
  // Para que Express entienda JSON
  app.use(express.json()); 


  // Hola mundo
  app.get('/hola-mundo', (req, res) => {
    res.send('Hello World!')
  })

/*
En la base de datos que creamos anteriormente
podemo crear la siguiente tabla en postgres

CREATE TABLE productos
(id SERIAL PRIMARY KEY,
nombre VARCHAR(100) NOT NULL,
precio NUMERIC NOT NULL);
 */



  // --- RUTAS ---

  // 1. OBTENER TODOS LOS PRODUCTOS
  app.get('/productos', async (req, res) => {
    try {
      const resultado = await pool.query('SELECT * FROM productos');
      res.json(resultado.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // 2. CREAR UN PRODUCTO
  app.post('/productos', async (req, res) => {
    try {
      const { nombre, precio } = req.body;
      const nuevoProducto = await pool.query(
        'INSERT INTO productos (nombre, precio) VALUES ($1, $2) RETURNING *',
        [nombre, precio]
      );
      res.status(201).json(nuevoProducto.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3. ELIMINAR UN PRODUCTO
  app.delete('/productos/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM productos WHERE id = $1', [id]);
      res.json({ mensaje: "Producto eliminado correctamente" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });




  // 4. Ruta para actualizar de manera total
  app.put('/productos/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, precio } = req.body;

    try {
      const query = 'UPDATE productos SET nombre = $1, precio = $2 WHERE id = $3 RETURNING *';
      const resultado = await pool.query(query, [nombre, precio, id]);

      if (resultado.rows.length === 0) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }

      res.json({ mensaje: "Actualizado con éxito", producto: resultado.rows[0] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

 // 5 Ruta para acutualizar de manera parcial ejemplo: únicamente el nombre o el precio
  app.patch('/productos/:id', async (req, res) => {
    const { id } = req.params;
    const campos = req.body; // Ejemplo: { nombre: "Nuevo nombre" } o { precio: 50 }

    // Si el cuerpo está vacío, no hacemos nada
    if (Object.keys(campos).length === 0) {
      return res.status(400).json({ error: "No se enviaron campos para actualizar" });
    }

    try {
      // Construcción dinámica de la consulta SQL
      const llaves = Object.keys(campos);
      const valores = Object.values(campos);

      // Generamos: "nombre = $1, precio = $2"
      const setQuery = llaves
        .map((llave, index) => `${llave} = $${index + 1}`)
        .join(', ');

      const query = `UPDATE productos SET ${setQuery} WHERE id = $${llaves.length + 1} RETURNING *`;

      // Ejecutamos la consulta pasando los valores + el ID al final
      const resultado = await pool.query(query, [...valores, id]);

      if (resultado.rows.length === 0) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }

      res.json({
        mensaje: "Campo(s) actualizado(s) con éxito",
        producto: resultado.rows[0]
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });


  const PORT = 6007;
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
  });
