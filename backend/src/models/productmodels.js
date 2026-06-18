const prisma = require('../database/prisma')

const findAll = async () => {
  return prisma.product.findMany({
    include: { category: true }
  })
}

const findById = async (id) => {
  return prisma.product.findUnique({
    where: { id: Number(id) },
    include: { category: true }
  })
}

const findByCategory = async (categoryId) => {
  return prisma.product.findMany({
    where: { categoryId: Number(categoryId) },
    include: { category: true }
  })
}

const findAvailable = async () => {
  return prisma.product.findMany({
    where: { available: true },
    include: { category: true }
  })
}

const create = async ({ name, description, price, imageUrl, categoryId, available }) => {
  return prisma.product.create({
    data: {
      name,
      description,
      price,
      imageUrl,
      categoryId: Number(categoryId),
      available: available !== undefined ? available : true
    },
    include: { category: true }
  })
}

const update = async (id, { name, description, price, imageUrl, categoryId, available }) => {
  return prisma.product.update({
    where: { id: Number(id) },
    data: {
      ...(name && { name }),
      ...(description && { description }),
      ...(price && { price }),
      ...(imageUrl && { imageUrl }),
      ...(categoryId && { categoryId: Number(categoryId) }),
      ...(available !== undefined && { available })
    },
    include: { category: true }
  })
}

const remove = async (id) => {
  return prisma.product.delete({
    where: { id: Number(id) }
  })
}

module.exports = { findAll, findById, findByCategory, findAvailable, create, update, remove }
