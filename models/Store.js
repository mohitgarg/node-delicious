const mongoose = require('mongoose')
mongoose.Promise = global.Promise // Accessing the global Node Promise
const slug = require('slugs')

const storeSchema = new mongoose.Schema({
    name:{
        type:String,
        trim:true,
        required:"Please enter a store name!"
    },
    slug:String,
    description:{
        type:String,
        trim:true
    },
    tags:[String],
    created: {
        type:Date,
        default:Date.now
    },
    location: {
        type:{
            type:String,
            default:'Point'
        },
        coordinates: [{
            type:Number,
            required:'You must supply coordinates!'
        }],
        address:{
            type:String,
            required:'You must supply an address!'
        }
    }
})

storeSchema.pre('save', function (next) {
    if(!this.isModified('name')){
        next();
        return; // Stop the function from running we can also do both on the same line return next();
    }
    this.slug = slug(this.name);
    next();
    // TODO make sure slugs are unique
})

module.exports = mongoose.model('Store', storeSchema)