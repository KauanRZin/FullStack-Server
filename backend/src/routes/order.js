const ex = require('express');
var router = ex.Router();
var orderModel = require('../models/ordermodels');
const authorize = require('../middleware/authorize');


/**
 * @swagger
 * /orders:
 *   get:
 *     summary: 📋 Listar todos os pedidos (Admin)
 *     description: Retorna a lista completa de todos os pedidos com status e detalhes.
 *     tags:
 *       - Orders
 *     responses:
 *       200:
 *         description: Lista de pedidos obtida com sucesso
 */
// GET - Listar todos os pedidos (admin)
router.get("/", authorize("SUPER_ADMIN" , "MANAGER"), async (req, res, next) => {
  try {
    const orders = await orderModel.findAll();
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /orders/status/{status}:
 *   get:
 *     summary: 📊 Listar pedidos por status
 *     description: Filtra pedidos pelo seu status atual (PENDING, PREPARING, OUT_FOR_DELIVERY, DELIVERED, CANCELLED).
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [PENDING, PREPARING, OUT_FOR_DELIVERY, DELIVERED, CANCELLED]
 *     responses:
 *       200:
 *         description: Pedidos encontrados com esse status
 */
// GET - Listar pedidos por status
router.get("/status/:status",authorize("SUPER_ADMIN" , "MANAGER"), async (req, res, next) => {
  try {
    const { status } = req.params;
    const orders = await orderModel.findByStatus(status);
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: 🔍 Obter detalhes do pedido
 *     description: Busca um pedido específico com todos seus itens e informações.
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pedido encontrado com sucesso
 *       404:
 *         description: Pedido não encontrado
 */
// GET - Obter pedido por ID
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await orderModel.findById(id);
    if (!order) {
      const erro = new Error("Pedido não encontrado!");
      erro.status = 404;
      return next(erro);
    }
    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /orders/user/{userId}:
 *   get:
 *     summary: 👤 Listar pedidos de um usuário
 *     description: Busca todos os pedidos realizados por um cliente específico.
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pedidos do usuário obtidos com sucesso
 */
// GET - Listar pedidos de um usuário
router.get("/user/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const orders = await orderModel.findByUser(userId);
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: ➡️ Criar novo pedido
 *     description: Cria um novo pedido com itens, calcula total automaticamente e congela preços.
 *     tags:
 *       - Orders
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               address:
 *                 type: string
 *                 example: Rua Principal, 123
 *               note:
 *                 type: string
 *                 example: Sem cebola
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
 *       400:
 *         description: UserId, address e items são obrigatórios
 */
// POST - Criar novo pedido
router.post("/", async (req, res, next) => {
  try {
    const { userId, address, note, items } = req.body;
    
    if (!userId || !address || !items || items.length === 0) {
      const erro = new Error("UserId, address e items (com pelo menos um produto) são obrigatórios.");
      erro.status = 400;
      return next(erro);
    }

    const newOrder = await orderModel.createWithItems({
      userId,
      address,
      note,
      items
    });
    res.status(201).json(newOrder);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     summary: 🔄 Atualizar status do pedido
 *     description: "Muda o status de um pedido (ex: PENDING → PREPARING → OUT_FOR_DELIVERY → DELIVERED)."
 *     tags:
 *       - Orders
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
 *               status:
 *                 type: string
 *                 enum: [PENDING, PREPARING, OUT_FOR_DELIVERY, DELIVERED, CANCELLED]
 *     responses:
 *       200:
 *         description: Status atualizado com sucesso
 */
// PATCH - Atualizar status do pedido
router.patch("/:id/status",authorize("SUPER_ADMIN" , "MANAGER"), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      const erro = new Error("Status é obrigatório.");
      erro.status = 400;
      return next(erro);
    }

    const updatedOrder = await orderModel.updateStatus(id, status);
    res.status(200).json(updatedOrder);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /orders/{id}:
 *   patch:
 *     summary: ✏️ Atualizar pedido
 *     description: Edita informações do pedido como endereço e observações.
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pedido atualizado com sucesso
 */
// PATCH - Atualizar pedido
router.patch("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    const updatedOrder = await orderModel.update(id, data);
    res.status(200).json(updatedOrder);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /orders/{id}:
 *   delete:
 *     summary: 🗑️ Deletar pedido
 *     description: Remove um pedido do sistema.
 *     tags:
 *       - Orders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Pedido deletado com sucesso
 *       404:
 *         description: Pedido não encontrado
 */
// DELETE - Remover pedido
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await orderModel.findById(id);
    
    if (!order) {
      const erro = new Error("Pedido não encontrado!");
      erro.status = 404;
      return next(erro);
    }

    await orderModel.remove(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
