const prisma = require('../database/prisma')

const findAll = async () => {
  return prisma.category.findMany({
    include: { _count: { select: { products: true } } } // conta produtos por categoria
  })
}

const findById = async (id) => {
  return prisma.category.findUnique({
    where: { id },
    include: { products: true }
  })
}

const create = async ({ name }) => {
  return prisma.category.create({ data: { name } })
}

const update = async (id, { name }) => {
  return prisma.category.update({ where: { id }, data: { name } })
}

const remove = async (id) => {
  return prisma.category.delete({ where: { id } })
}

module.exports = { findAll, findById, create, update, remove }