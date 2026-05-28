const ex = require('express');
var router = ex.Router();
var userModel = require('../models/usermodels');

router.get("/", async(req,res,next) =>{
    try{
        const users = await userModel.findAll();
        res.status(200).json(users);
    }catch(error){
        next(error);
    }
});

router.get("/active" , async(req,res,next)=>{
    try{
        const users = await userModel.findAllActive();
        res.status(200).json(users);
    }catch(error){
        next(error);
    }
})

router.get("/:id", async(req,res,next) =>{
    try{
        const {id} = req.params;
        const user = await userModel.findById(id);
        if(!user){
            const erro = new Error("Usuário não econtrado!");
            erro.status = 404;
            return next(erro);
        }
        res.status(200).json(user);
    }
    catch(error){
        next(error);
    }
});

router.post("/register" , async(req,res,next) =>{
    try{
        const {name, email, pwd, phone} = req.body;
        const userExists = await userModel.findByEmail(email);
        if(userExists){
            const erro = new Error('Email já cadastrado.');
            erro.status = 400;
            return next(erro); // Vai gerar o gato do 400!
        }
        const newUser = await userModel.register({name, email, pwd, phone});
        res.status(201).json(newUser);
    }catch(error){
        next(error);
    }
});

router.patch('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const updatedUser = await userModel.update(id, data);
        res.status(200).json(updatedUser);
    } catch (error) {
        next(error);
    }
});

router.patch('/:id/status', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updatedUser = await userModel.updateStatus(id, status);
        res.status(200).json(updatedUser);
    } catch (error) {
        next(error);
    }
});


router.delete("/:id", async(req,res,next) =>{
    try{
        const {id} = req.params;
        const user = await userModel.remove(id);
        if(!user){
            const erro = new Error("Usuário não econtrado!");
            erro.status = 404;
            return next(erro);
        }
        message = "Usuário excluído";
        res.status(204).send();
    }
    catch(error){
        next(error);
    }
});

module.exports = router;
