const ex = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

var router = ex.Router();
var userModel = require('../models/usermodels');

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: 🔐 Login de usuário
 *     description: Autentica um usuário com email e senha. Retorna os dados do usuário se as credenciais forem corretas.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: usuario@exemplo.com
 *               pwd:
 *                 type: string
 *                 example: senhaSegura123
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Credenciais inválidas
 */
router.post("/login", async (req, res, next) => {
    try {
        const { email, pwd } = req.body;
        
        if (!email || !pwd) {
            const erro = new Error('Email e senha são obrigatórios.');
            erro.status = 400;
            return next(erro);
        }
        
        const user = await userModel.findByEmail(email);
        if (!user) {
            const erro = new Error('Email não encontrado.');
            erro.status = 401;
            return next(erro);
        }
        
        const passwordIsValid = await bcrypt.compare(pwd, user.password)
        if (!passwordIsValid) {
            const erro = new Error('Senha incorreta.');
            erro.status = 401;
            return next(erro);
        }
        const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
        );
        
        res.status(200).json({
            message: 'Login realizado com sucesso',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                phone: user.phone
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: 📝 Registrar novo usuário (Cliente)
 *     description: Permite que novos clientes se registrem no sistema. Cria automaticamente um usuário com role CUSTOMER e status ACTIVE.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Maria Santos
 *               email:
 *                 type: string
 *                 example: maria@exemplo.com
 *               pwd:
 *                 type: string
 *                 example: senhaSegura123
 *               phone:
 *                 type: string
 *                 example: "81988888888"
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *       400:
 *         description: Email já cadastrado
 */
router.post("/register", async (req, res, next) => {
    try {
        const { name, email, pwd, phone } = req.body;
        const userExists = await userModel.findByEmail(email);
        if (userExists) {
            const erro = new Error('Email já cadastrado.');
            erro.status = 400;
            return next(erro);
        }
        const newUser = await userModel.register({ name, email, pwd, phone });
        res.status(201).json(newUser);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
