const prisma = require('../database/prisma')

const bcrypt = require('bcrypt')
const SALT_ROUNDS = 10;
//admin
const findAll = async ()=> {
    return prisma.user.findMany({
        select: {id:true, name:true, email: true, role: true,status:true, createdAt: true}
    })
}
const findAllActive = async ()=> {
    return prisma.user.findMany({
        where: {status: 'ACTIVE'},
        select: {id:true, name:true, email: true, role: true, createdAt: true}
    })
}

const findByStatus = async (status) => {
  return prisma.user.findMany({
    where: { status },
    select: { id: true, name: true, email: true, role: true, status: true, createdAt: true }
  })
}

const findById = async (id)=>{
    return prisma.user.findUnique({where: {id: Number(id)}})
}

const findByEmail = async (email)=>{
    return prisma.user.findUnique({where: {email}})
}
//registrar os usuarios comuns
const register  = async({name, email, pwd,phone})=>{
    const hashedPwd = await bcrypt.hash(pwd, SALT_ROUNDS)

    return prisma.user.create({
    data: { name,
            email,
            password : hashedPwd, 
            phone, 
            role: 'CUSTOMER',
            status: 'ACTIVE'
        }
    });
};
//registrar os usuarios passando as roles
const create  = async({name, email, pwd,phone, role,status})=>{
    const hashedPwd = await bcrypt.hash(pwd, SALT_ROUNDS)
    return prisma.user.create({
    data: { name,
            email,
            password : hashedPwd, 
            phone, 
            role: role,
            status: status}})
}

const update = async (id, data) => {
  return prisma.user.update({ where: { id: Number(id) }, data })
}

const updateStatus = async (id, status) => {
  return prisma.user.update({
    where: { id: Number(id) },
    data: { status }
  })
}

const remove = async(id) =>{
    return prisma.user.delete({ where: { id: Number(id) } })
}

module.exports = { findAll,findAllActive,findByStatus, findById, findByEmail,register, create, update, updateStatus , remove}
