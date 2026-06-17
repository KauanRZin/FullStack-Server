const ex = require('express');
var router = ex.Router();
var categoryModel = require('../models/categorymodels');
const authorize = require('../middleware/authorize');

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Listar todas as categorias
 *     description: Retorna a lista de todas as categorias de produtos com a contagem de itens em cada uma.
 *     tags:
 *       - Categories
 *     responses:
 *       200:
 *         description: Lista de categorias obtida com sucesso
 *   post:
 *     summary: Criar nova categoria
 *     description: Cria uma categoria de produtos. Ex Pizzas, Bebidas, Sobremesas.
 *     tags:
 *       - Categories
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Pizzas
 *     responses:
 *       201:
 *         description: Categoria criada com sucesso
 *       400:
 *         description: Nome da categoria é obrigatório
 */
// GET - Listar todas as categorias
router.get("/", async (req, res, next) => {
  try {
    const categories = await categoryModel.findAll();
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
});

// POST - Criar nova categoria
router.post("/",  authorize("SUPER_ADMIN", "MANAGER"), async (req, res, next) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      const erro = new Error("Nome da categoria é obrigatório.");
      erro.status = 400;
      return next(erro);
    }

    const newCategory = await categoryModel.create({ name });
    res.status(201).json(newCategory);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: 🔍 Obter detalhes da categoria
 *     description: Busca uma categoria específica e lista todos os produtos nela.
 *     tags:
 *       - Categories
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Categoria encontrada com seus produtos
 *       404:
 *         description: Categoria não encontrada
 */
// GET - Obter categoria por ID
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await categoryModel.findById(id);
    if (!category) {
      const erro = new Error("Categoria não encontrada!");
      erro.status = 404;
      return next(erro);
    }
    res.status(200).json(category);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /categories/{id}:
 *   patch:
 *     summary: ✏️ Atualizar nome da categoria
 *     description: Edita o nome de uma categoria existente.
 *     tags:
 *       - Categories
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Categoria atualizada com sucesso
 */
// PATCH - Atualizar categoria
router.patch("/:id", authorize("SUPER_ADMIN", "MANAGER"), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name) {
      const erro = new Error("Nome é obrigatório para atualizar.");
      erro.status = 400;
      return next(erro);
    }

    const updatedCategory = await categoryModel.update(id, { name });
    res.status(200).json(updatedCategory);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: 🗑️ Deletar categoria
 *     description: Remove uma categoria. Produtos vinculados ficarão órfãos.
 *     tags:
 *       - Categories
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Categoria deletada com sucesso
 *       404:
 *         description: Categoria não encontrada
 */
// DELETE - Remover categoria
router.delete("/:id",authorize("SUPER_ADMIN", "MANAGER"), async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await categoryModel.findById(id);
    
    if (!category) {
      const erro = new Error("Categoria não encontrada!");
      erro.status = 404;
      return next(erro);
    }

    await categoryModel.remove(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
