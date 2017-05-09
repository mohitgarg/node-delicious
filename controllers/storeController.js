const mongoose = require('mongoose')
const Store = mongoose.model('Store')

exports.homepage = (req, res) => {
    res.render('index')
}

exports.addStore = (req, res) => {
    res.render('editStore', {
        title:'Add Store'
    })
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
    console.log(stores)
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
    const store = await Store.findOneAndUpdate({_id:req.params.id}, req.body, {
        new:true,
        runValidators:true
    }).exec()
    req.flash('success',`Successfully Updates ${store.name}. <a href='/stores/${store.slug}'>View Store</a>`)
    res.redirect(`/stores/${store._id}/edit`)
}