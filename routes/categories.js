const express = require("express");
const {validateAdmin} = require("../middlewares/admin");
const { Category, validateCategory } = require("../models/category");
const router = express.Router();

router.post('/create',validateAdmin,async function(req, res){
    if(req.user.admin){
        let category = await Category.create({
            name: req.body.name,
        })

    }
    res.redirect("back");

})

module.exports = router;