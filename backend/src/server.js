const express = require('express')
const cors = require('cors')
const prisma = require('./database/prisma.js')

const errorHandler = require('./middleware/errorHandler') //caso haja algum erro

//rotas
const userRoute = ('./routes/user.js')
const productRoute = ('./routes/user.js')
const orderRoute = ('./routes/user.js')
const categoryRoute = ('./routes/user.js')

const app = express()
const PORT = process.env.PORT 

app.use(cors())
app.use(express.json())

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
    res.status()
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

// fecha o prisma corretamente quando o servidor desligar
process.on('SIGINT', async () => {
  await prisma.$disconnect()
  console.log('Prisma desconectado. Servidor encerrado.')
  process.exit(0)
})

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/health`)
})

app.use(errorHandler)
