require('dotenv').config()
const express = require('express')
const cors = require('cors')
const prisma = require('./database/prisma.js')
const swaggerJsDoc = require('swagger-jsdoc')

const swaggerUi = require('swagger-ui-express')

const errorHandler = require('./middleware/errorHandle') 

//rotas
const userRoute = require('./routes/user.js')
const productRoute = require('./routes/product.js')
const categoryRoute = require('./routes/category.js')
const orderRoute = require('./routes/order.js')
const authRoute = require('./routes/auth.js')
const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API FullStack - Gerenciamento de Pedidos',
            version: '1.0.0',
            description: 'API completa para gerenciamento de usuários, produtos, categorias e pedidos (PostgreSQL + Prisma)',
        },
        servers: [
            {
                url: 'http://localhost:4000',
                description: 'Servidor Local'
            },
        ],
    },
    apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


app.use('/users', userRoute)
app.use('/products', productRoute)
app.use('/categories', categoryRoute)
app.use('/orders', orderRoute)
app.use('/auth', authRoute)

// rota de health check — testa se o servidor e o banco estão vivos
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({
      status: 'ok',
      server: 'online',
      database: 'conectado',
    })
  } catch (err) {
    res.status(500).json({ error : "Erro no banco"})
  }
})

app.get('/', async (req, res) => {
  try {
    await prisma.$runCommandRaw({ ping: 1 })
    res.send("TUDO CERTO BOY !!!")
  } catch (err) {
    res.send("TUDO DEU BOSTA !!!")
  }
})

app.use((req, res, next) => {
    const error = new Error('Rota não encontrada');
    error.status = 404;
    next(error); // Passa o erro para o middleware abaixo
});

app.use(errorHandler)
// fecha o prisma corretamente quando o servidor desligar
process.on('SIGINT', async () => {
  await prisma.$disconnect()
  console.log('Prisma desconectado. Servidor encerrado.')
  process.exit(0)
})

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/health`)
  console.log(`Swagger em :http://localhost:${PORT}/api-docs`)
})

app.use(errorHandler)
