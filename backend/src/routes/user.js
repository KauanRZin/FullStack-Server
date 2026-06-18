const ex = require('express');
const authorize = require('../middleware/authorize');
var router = ex.Router();
var userModel = require('../models/usermodels');

/**
 * @swagger
 * /users:
 *   get:
 *     summary: 📋 Listar todos os usuários (Admin)
 *     description: Retorna uma lista de todos os usuários cadastrados no sistema com informações completas.
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Lista de usuários obtida com sucesso
 */
router.get("/", authorize("SUPER_ADMIN"), async(req,res,next) =>{
    try{
        const users = await userModel.findAll();
        res.status(200).json(users);
    }catch(error){
        next(error);
    }
});

/**
 * @swagger
 * /users:
 *   post:
 *     summary: ➕ Criar novo usuário (Admin)
 *     description: Cria um novo usuário com role e status específicos. Use este endpoint para criar gerentes e admins.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: João Silva
 *               email:
 *                 type: string
 *                 example: joao@exemplo.com
 *               pwd:
 *                 type: string
 *                 example: senhaSegura123
 *               phone:
 *                 type: string
 *                 example: "81999999999"
 *               role:
 *                 type: string
 *                 enum: [CUSTOMER, MANAGER, SUPER_ADMIN]
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, SUSPEND, INATIVE]
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 */
router.post("/",  authorize("SUPER_ADMIN"), async (req, res, next) => {
    
    try {
        const { name, email, pwd, phone, role, status } = req.body;
        
        if (!name || !email || !pwd) {
            const erro = new Error('Nome, email e senha são obrigatórios.');
            erro.status = 400;
            return next(erro);
        }
        
        const userExists = await userModel.findByEmail(email);
        if (userExists) {
            const erro = new Error('Email já cadastrado.');
            erro.status = 400;
            return next(erro);
        }
        
        const newUser = await userModel.create({ name, email, pwd, phone, role, status });
        res.status(201).json(newUser);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /users/active:
 *   get:
 *     summary: ✅ Listar usuários ativos
 *     description: Retorna apenas os usuários com status ACTIVE.
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Lista de usuários ativos obtida com sucesso
 */
router.get("/active" , async(req,res,next)=>{
    try{
        const users = await userModel.findAllActive();
        res.status(200).json(users);
    }catch(error){
        next(error);
    }
})

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: 🔍 Obter detalhes do usuário por ID
 *     description: Busca um usuário específico pelo seu ID.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuário encontrado com sucesso
 *       404:
 *         description: Usuário não encontrado
 */
router.get("/:id", async(req,res,next) =>{
    try{
        const {id} = req.params;
        const user = await userModel.findById(id);
        if(!user){
            const erro = new Error("Usuário não econtrado!");
            erro.status = 404;
            return next(erro);
        }
        res.status(200).json(user);
    }
    catch(error){
        next(error);
    }
});

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: ✏️ Atualizar dados do usuário
 *     description: Atualiza as informações do usuário (nome, telefone, endereço, etc).
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 */
router.patch('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const updatedUser = await userModel.update(id, data);
        res.status(200).json(updatedUser);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /users/{id}/status:
 *   patch:
 *     summary: 🔄 Alterar status do usuário
 *     description: Muda o status de um usuário entre ACTIVE, SUSPEND ou INATIVE.
 *     tags:
 *       - Users
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
 *                 enum: [ACTIVE, SUSPEND, INATIVE]
 *     responses:
 *       200:
 *         description: Status atualizado com sucesso
 */
router.patch('/:id/status', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updatedUser = await userModel.updateStatus(id, status);
        res.status(200).json(updatedUser);
    } catch (error) {
        next(error);
    }
});


/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: 🗑️ Deletar usuário
 *     description: Remove um usuário do sistema permanentemente.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Usuário deletado com sucesso
 *       404:
 *         description: Usuário não encontrado
 */
router.delete("/:id", async(req,res,next) =>{
    try{
        const {id} = req.params;
        const user = await userModel.remove(id);
        if(!user){
            const erro = new Error("Usuário não econtrado!");
            erro.status = 404;
            return next(erro);
        }
        message = "Usuário excluído";
        res.status(204).send();
    }
    catch(error){
        next(error);
    }
});

module.exports = router;
