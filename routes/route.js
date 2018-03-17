const express = require('express');
const router = express.Router();

const Contact = require('../_models/contact');

//retrieving contacts
router.get('/contacts', (req, res, next)=>{
	Contact.find(function(err, contacts){
		res.json(contacts);
	})
});

//adding contacts
router.post('/contact', (req, res, next)=>{
	let newContact = new Contact({
		firstName: req.body.firstName,
		lastName: req.body.lastName,
        email: req.body.email,
        content: req.body.content
	});
	newContact.save((err,contact)=>{
		if(err)
		{
			res.json({msg:'Failed to add Contact'});
		}
		else{
			res.json({msg:'Contact added successfully'});;
		}
	})
});

//deleting contacts
router.delete('/contact/:id', (req, res, next)=>{
	Contact.remove({_id: req.params.id}, function(err, result){
		if(err)
		{
			res.json(err)
		}
		else{
			res.json(result)
		}
	})
});
module.exports = router;