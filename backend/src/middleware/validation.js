// utils/validate.js
const rules = {
  name:     { min: 3,  max: 256,  label: 'Nome' },
  email:    { min: 6,  max: 256, label: 'Email' },
  pwd:      { min: 6,  max: 64,  label: 'Senha' },
  phone:    { min: 10, max: 15,  label: 'Telefone' },
}

const validateLength = (type, value) => {
  const rule = rules[type]

  if (!rule) {
    const err = new Error(`Tipo de validação desconhecido: "${type}"`)
    err.status = 500
    throw err
  }

  // se o valor for opcional e não foi enviado, deixa passar
  if (value === undefined || value === null || value === '') return

  if (value.length < rule.min) {
    const err = new Error(`${rule.label} deve ter no mínimo ${rule.min} caracteres.`)
    err.status = 400
    throw err
  }

  if (value.length > rule.max) {
    const err = new Error(`${rule.label} deve ter no máximo ${rule.max} caracteres.`)
    err.status = 400
    throw err
  }
}

module.exports = validateLength