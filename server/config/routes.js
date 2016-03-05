var router = require('express').Router();
// var usersController = require('');
var eventsController = require('../controllers/eventsController');
var guestsController = require('../controllers/guestsController');
// var basketsController = require('../controllers/basketsController');
var itemsController = require('../controllers/itemsController');
var nodemailerController = require('../controllers/nodemailerController');
var usersController = require('../controllers/usersController');

// router.get('/auth/facebook', usersController.getAll);
// router.get('/auth/facebook/callback', usersController.addOne);

router.get('/events/:userID', eventsController.events.get);
router.post('/events', eventsController.events.post);
router.get('/eventDetails/:eventID', eventsController.eventDetails.get);
router.delete('/events', eventsController.events.delete);
// add call to EmailCancel in this controller


// send IMPORTANT UPDATE TO ALL GUESTS
router.post('/email/:eventID', nodemailerController.post);

//send settleUp emails to all guests
router.post('/email/settleUp/:eventID', nodemailerController.settleUp);

// send important update to all GUESTS
router.put('/email/:eventID', nodemailerController.put);

// send event cancelled email to all guests
router.delete('/email/:eventID', nodemailerController.delete);

router.get('/guests', guestsController.get);
router.post('/guests', guestsController.post);
// add call to emailInvite in this controller

router.put('/guests', guestsController.put);
router.delete('/guests/:guestID/:eventID', guestsController.delete);

router.get('/items/:eventID', itemsController.get);
router.post('/items', itemsController.post);
router.put('/items/:itemID', itemsController.put);
router.delete('/items/:itemID', itemsController.delete);

// router.get('/baskets', basketsController.get);
// router.put('/baskets/swap', basketsController.put);

router.get('/users/:userId', usersController.get);

module.exports = router;
