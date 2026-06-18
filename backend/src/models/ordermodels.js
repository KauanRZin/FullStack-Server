const prisma = require('../database/prisma')

//admin
const findAll = async ()=> {
    return prisma.order.findMany({
        include: {
            user: { select: { id: true, name: true, phone: true } },
            items: { include: { product: true } }
        },
        orderBy: { createdAt: 'desc' }
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
    // DEBUG TEMPORÁRIO — remova depois de identificar o problema.
    // Mostra exatamente o que chegou no body, antes de qualquer conversão.
    console.log('[DEBUG] items recebidos (brutos):', JSON.stringify(items))

    // normaliza productId para number UMA vez, logo no início, e reaproveita
    // essa versão normalizada em todas as comparações/gravações abaixo.
    // Antes: items.map(i => Number(i.productId)) só era usado na busca (findMany),
    // mas o .find() comparava p.id (number) com item.productId (string) e sempre
    // dava undefined -> "Cannot read properties of undefined (reading 'price')".
    const normalizedItems = items.map(item => ({
        ...item,
        productId: Number(item.productId),
    }))

    console.log('[DEBUG] items normalizados:', JSON.stringify(normalizedItems))

    // calcula o total somando preço × quantidade de cada item
    const products = await prisma.product.findMany({
        where: { id: { in: normalizedItems.map(i => i.productId) } }
    })

    console.log('[DEBUG] produtos encontrados no banco:', JSON.stringify(products.map(p => ({ id: p.id, name: p.name }))))

    // valida que todo productId enviado realmente existe, com mensagem clara
    // em vez de quebrar mais na frente com erro genérico
    const missing = normalizedItems.filter(
        item => !products.some(p => p.id === item.productId)
    )
    if (missing.length > 0) {
        const err = new Error(
            `Produto(s) não encontrado(s): ${missing.map(i => i.productId).join(', ')}`
        )
        err.status = 400
        throw err
    }

    const total = normalizedItems.reduce((sum, item) => {
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
                create: normalizedItems.map(item => {
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

module.exports = { findAll,findByStatus, findById, findByUser,createWithItems,update, updateStatus, remove }