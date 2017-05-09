const mongoose = require('mongoose')
const Store = mongoose.model('Store')
const multer = require('multer')
const jimp = require('jimp')
const uuid = require('uuid')

const multerOptions = {
    storage:multer.memoryStorage(),
    fileFilter(req, file, next){
        const isPhoto = file.mimetype.startsWith('image/')
        if(isPhoto){
            next(null, true)
        } else {
            next({message:`This file type isn't allowed`}, false)
        }
    }
}

exports.homepage = (req, res) => {
    res.render('index')
}

exports.addStore = (req, res) => {
    res.render('editStore', {
        title:'Add Store'
    })
}

exports.upload = multer(multerOptions).single('photo');
exports.resize = async (req, res, next) => {
    if(!req.file){
        next();
        return;
    }
    const extension = req.file.mimetype.split('/')[1]
    req.body.photo = `${uuid.v4()}.${extension}`

    const photo = await jimp.read(req.file.buffer)
    await photo.resize(800, jimp.AUTO);
    await photo.write(`./public/uploads/${req.body.photo}`)
    next();
}

exports.createStore = async (req, res) => {
    const store = await (new Store(req.body)).save()
    console.log('It Worked!')
    req.flash('success', `Successfully Created ${store.name}. Care to leave a review?`)
    res.redirect(`/store/${store.slug}`)
}

exports.getStores = async (req, res) => {
    // Query the database for list of all stores
    const stores = await Store.find();
    res.render('stores', {title: 'Stores', stores})
}

exports.editStore =async (req, res) => {
    // find the store given by ID
    const store = await Store.findOne({_id:req.params.id})
    // TODO Confirm they are the owner of the store
    // Render the edit form so user can update their store
    res.render('editStore', {title:`Edit ${store.name}`, store})
}

exports.updateStore = async (req, res) => {
    req.body.location.type = 'Point'
    const store = await Store.findOneAndUpdate({_id:req.params.id}, req.body, {
        new:true,
        runValidators:true
    }).exec()
    req.flash('success',`Successfully Updates ${store.name}. <a href='/stores/${store.slug}'>View Store</a>`)
    res.redirect(`/stores/${store._id}/edit`)
}

exports.getStoreBySlug =async (req, res) => {
    
}