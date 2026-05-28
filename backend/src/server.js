const express = require('express')
const cors = require('cors')
const prisma = require('./database/prisma.js')
const swaggerJsDoc = require('swagger-jsdoc')

const swaggerUi = require('swagger-ui-express')

const errorHandler = require('./middleware/errorHandle') 

//rotas
const userRoute = require('./routes/user.js')
/* Ainda não implementado
const productRoute = ('./routes/user.js')
const orderRoute = ('./routes/useSr.js')
const categoryRoute = ('./routes/user.js')
*/
const app = express()
const PORT = process.env.PORT 

app.use(cors())
app.use(express.json())

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API de Usuários',
            version: '1.0.0',
            description: 'Documentação da API para gerenciamento de usuários (MongoDB + Prisma)',
        },
        servers: [
            {
                url: 'http://localhost:4000', // A sua porta configurada
                description: 'Servidor Local'
            },
        ],
        // Aqui nós escrevemos a documentação em JavaScript Puro, sem quebras por espaços!
        paths: {
            '/users': {
                get: {
                    summary: 'Retorna todos os usuários',
                    tags: ['Users'],
                    responses: {
                        '200': { description: 'Lista de usuários obtida com sucesso' }
                    }
                }
            },
            '/users/register': {
                post: {
                    summary: 'Registra um novo usuário',
                    tags: ['Users'],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        name: { 
                                            type: 'string', 
                                            example: 'Kauan' 
                                        },
                                        email: { 
                                            type: 'string', 
                                            example: 'kauan@exemplo.com' 
                                        },
                                        pwd: { 
                                            type: 'string', 
                                            example: 'senhaSegura123' 
                                        },
                                        phone: { 
                                            type: 'string', 
                                            example: '81999999999' 
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '201': { description: 'Criado com sucesso' }
                    }
                }
            }
        }
    },
    apis: [], // DEIXE VAZIO. Isso impede a biblioteca de ler arquivos e dar aquele erro fatal.
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


app.use('/users', userRoute)

// rota de health check — testa se o servidor e o banco estão vivos
app.get('/health', async (req, res) => {
  try {
    await prisma.$runCommandRaw({ ping: 1 })
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
