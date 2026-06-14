const prisma = require('../database/prisma')

//admin
const findAll = async ()=> {
    return prisma.order.findMany({
        select: {id:true,total:true,address:true,note:true,userid:true,items:true,status:true, createdAt: true,updatedAt:true}
    })
}

const findByStatus = async (status) => {
  return prisma.order.findMany({
    where: { ...(status && {status}) },
    include: {
      user: { select: { id: true, name: true, phone: true } },
      items: { include: { product: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
    
}

const findById = async (id) => {
  return prisma.order.findUnique({
    where: { id: Number(id) },
    include: {
      user: { select: { id: true, name: true, phone: true } },
      items: { include: { product: true } }
    }
  })
}

const findByUser = async (userId) => {
  return prisma.order.findMany({
    where: { userId: Number(userId) },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' }
  })
}

const createWithItems = async ({ userId, address, note, items }) => {
  // calcula o total somando preço × quantidade de cada item
  const products = await prisma.product.findMany({
    where: { id: { in: items.map(i => Number(i.productId)) } }
  })

  const total = items.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId)
    return sum + (product.price * item.quantity)
  }, 0)

  // cria o pedido e os itens numa única transação
  return prisma.order.create({
    data: {
      userId: Number(userId),
      address,
      note,
      total,
      items: {
        create: items.map(item => {
          const product = products.find(p => p.id === item.productId)
          return {
            productId: item.productId,
            quantity: item.quantity,
            priceAtTime: product.price // congela o preço atual
          }
        })
      }
    },
    include: { items: { include: { product: true } } }
  })
}

const update = async (id, data) => {
  return prisma.order.update({ where: { id: Number(id) }, data })
}

const updateStatus = async (id, status) => {
  return prisma.order.update({ where: { id: Number(id) }, data: { status } })
}

const remove = async (id) => {
  return prisma.order.delete({ where: { id: Number(id) } })
}

module.exports = { findAll,findByStatus, findById, findByUser,createWithItems,update, updateStatus }
