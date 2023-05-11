const controller = require('../controllers/users')
const auth_controller = require('../controllers/auth')
// const validate = require('../controllers/data-validate')
const express = require('express')
const router = express.Router()
require('../../config/passport')
const passport = require('passport')
const requireAuth = passport.authenticate('jwt', {
  session: false
})
const trimRequest = require('trim-request')


module.exports = router
