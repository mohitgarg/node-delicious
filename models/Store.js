const mongoose = require('mongoose')
mongoose.Promise = global.Promise // Accessing the global Node Promise
const slug = require('slugs')

const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: "Please enter a store name!"
    },
    slug: String,
    description: {
        type: String,
        trim: true
    },
    tags: [String],
    created: {
        type: Date,
        default: Date.now
    },
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: [{
            type: Number,
            required: 'You must supply coordinates!'
        }],
        address: {
            type: String,
            required: 'You must supply an address!'
        }
    },
    photo: String,
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: 'You must supply an author'
    }
},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})

storeSchema.index({
    name:'text',
    description:'text'
})
storeSchema.index({location:'2dsphere'});
storeSchema.pre('save', async function (next) {
    if(!this.isModified('name')){
        next();
        return; // Stop the function from running we can also do both on the same line return next();
    }
    this.slug = slug(this.name);
    const slugRexEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`,'i')
    const storesWithSlug = await this.constructor.find({slug:slugRexEx})

    if(storesWithSlug.length){
        this.slug = `${this.slug}-${storesWithSlug.length + 1}`
    }
    next();
})

storeSchema.statics.getTagsList = function () {
    return this.aggregate([
        {$unwind: '$tags'},
        {$group: { _id: '$tags', count:{ $sum : 1}}},
        {$sort: {count: -1}}
    ])
}

storeSchema.statics.getTopStores = function () {
    return this.aggregate([
        {$lookup: {from:'reviews', localField:'_id', foreignField:'store', as:'reviews'}},
        {$match:{'reviews.1':{ $exists: true }}},
        {$project:{
            photo: '$$ROOT.photo',
            name:'$$ROOT.name',
            reviews:'$$ROOT.reviews',
            slug:'$$ROOT.slug',
            averageRating: { $avg: '$reviews.rating'}}},
        {$sort : {averageRating: -1 }},
        {$limit:10}
    ])
}
// find review where the store _id property === review store property
storeSchema.virtual('reviews',{
    ref:'Review',
    localField:'_id',
    foreignField:'store'
})

function autoPopulate(next) {
    this.populate('reviews');
    next();
}

storeSchema.pre('find',autoPopulate)
storeSchema.pre('findOne',autoPopulate)

module.exports = mongoose.model('Store', storeSchema)