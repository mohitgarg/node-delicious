const passport = require('passport')
const crypto = require('crypto')
const mongoose = require('mongoose')
const User = mongoose.model('User')

exports.login = passport.authenticate('local',{
    failureRedirect:'/login',
    failureFlash:'Failed Login',
    successRedirect:'/',
    successFlash:'You are now logged in!'
})

exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'You are now logged out!👏')
    res.redirect('/')
}

exports.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()){
        next();
        return
    }
    req.flash('error', 'You must be logged in to do that!');
    res.redirect('/login')
}

exports.forgot = async (req, res) => {
    const user = await User.findOne({email:req.body.email})
    if(!user){
        req.flash('error', 'A password reset link has been sent to you')
        return res.redirect('/login')
    }
    user.resetPasswordToken = crypto.randomBytes(20).toString('hex')
    user.resetPasswordExpires = Date.now() + 3600000   // Now + 1 hour
    await user.save();

    const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`

    req.flash('success', `A password reset link has been emailed to you. ${resetURL}`);

    res.redirect('/login')
}

exports.reset = async (req, res) => {
    const user = await User.findOne({
        resetPasswordToken:req.params.token,
        resetPasswordExpires: {$gt: Date.now() }
    })

    if(!user) {
        
    }
}