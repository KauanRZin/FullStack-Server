const ex = require('express');
var router = ex.Router();
var productModel = require('../models/productmodels');
const authorize = require('../middleware/authorize');

/**
 * @swagger
 * /products:
 *   get:
 *     summary: 📋 Listar todos os produtos
 *     description: Retorna a lista completa de todos os produtos com suas categorias.
 *     tags:
 *       - Products
 *     responses:
 *       200:
 *         description: Lista de produtos obtida com sucesso
 */
// GET - Listar todos os produtos
router.get("/",authorize("SUPER_ADMIN" , "MANAGER"), async (req, res, next) => {
  try {
    const products = await productModel.findAll();
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /products/available:
 *   get:
 *     summary: ✅ Listar produtos disponíveis
 *     description: Retorna apenas os produtos com disponibilidade habilitada. Ideal para exibir no menu.
 *     tags:
 *       - Products
 *     responses:
 *       200:
 *         description: Lista de produtos disponíveis obtida com sucesso
 */
// GET - Listar produtos disponíveis
router.get("/available", async (req, res, next) => {
  try {
    const products = await productModel.findAvailable();
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /products/category/{categoryId}:
 *   get:
 *     summary: 🔍 Listar produtos por categoria
 *     description: Busca todos os produtos de uma categoria específica.
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de produtos da categoria obtida com sucesso
 */
// GET - Listar produtos por categoria
router.get("/category/:categoryId", async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const products = await productModel.findByCategory(categoryId);
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: 🔍 Obter detalhes do produto
 *     description: Busca um produto específico com todas suas informações.
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Produto encontrado com sucesso
 *       404:
 *         description: Produto não encontrado
 */
// GET - Obter produto por ID
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await productModel.findById(id);
    if (!product) {
      const erro = new Error("Produto não encontrado!");
      erro.status = 404;
      return next(erro);
    }
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /products:
 *   post:
 *     summary: ➡️ Criar novo produto
 *     description: Adiciona um novo produto ao catálogo. Requer informações como nome, preço e categoria.
 *     tags:
 *       - Products
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Pizza Margherita
 *               description:
 *                 type: string
 *                 example: Pizza clássica com mozzarela
 *               price:
 *                 type: number
 *                 example: 25.99
 *               categoryId:
 *                 type: string
 *               available:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 *       400:
 *         description: Nome, preço e categoria são obrigatórios
 */
// POST - Criar novo produto
router.post("/",authorize("SUPER_ADMIN" , "MANAGER"), async (req, res, next) => {
  try {
    const { name, description, price, imageUrl, categoryId, available } = req.body;
    
    if (!name || !price || !categoryId) {
      const erro = new Error("Nome, preço e categoria são obrigatórios.");
      erro.status = 400;
      return next(erro);
    }

    const newProduct = await productModel.create({
      name,
      description,
      price: parseFloat(price),
      imageUrl,
      categoryId,
      available
    });
    res.status(201).json(newProduct);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     summary: ✏️ Atualizar produto
 *     description: Edita informações do produto como preço, descrição, disponibilidade.
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso
 */
// PATCH - Atualizar produto
router.patch("/:id",authorize("SUPER_ADMIN" , "MANAGER") ,async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    if (data.price) {
      data.price = parseFloat(data.price);
    }
    
    const updatedProduct = await productModel.update(id, data);
    res.status(200).json(updatedProduct);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: 🗑️ Deletar produto
 *     description: Remove um produto do catálogo.
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Produto deletado com sucesso
 *       404:
 *         description: Produto não encontrado
 */
// DELETE - Remover produto
router.delete("/:id",authorize("SUPER_ADMIN" , "MANAGER"), async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await productModel.findById(id);
    
    if (!product) {
      const erro = new Error("Produto não encontrado!");
      erro.status = 404;
      return next(erro);
    }

    await productModel.remove(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;