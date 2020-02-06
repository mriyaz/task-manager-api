const express = require('express');
const User = require('../models/user');
const router = new express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');



router.post('/users', async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch (e) {
        res.status(400).send(e);
    }

});

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);

});


router.patch('/users/me', auth, async (req, res) => {

    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password', 'age'];

    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        res.status(400).send({ error: 'Invalid Operation' });
    }

    try {

        // const user = await User.findById(req.user._id);
        updates.forEach(update => req.user[update] = req.body[update]);
        // await user.save();

        //req.user = req.body;
        await req.user.save();
        //const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

        // if (!user) {
        //     return res.status(400).send();
        // }
        res.send(req.user);
    } catch (e) {
        console.log(e);
        res.status(400).send(e);
    }
});


router.delete('/users/me', auth, async (req, res) => {

    try {

        await req.user.remove();
        res.send(req.user);
    } catch (e) {
        res.status(400).send(e);
    }

});

//logging
router.post('/users/login', async (req, res) => {

    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch (e) {
        res.status(400).send(e);
    }

});

//logout
router.post('/users/logout', auth, async (req, res) => {

    try {

        //update the tokens array on the user
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });

        await req.user.save();

        res.send();
    } catch (e) {
        res.status(500).send();
    }

});



const upload = multer({
    //dest: 'avatars',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload jpeg or png images'));
        }
        cb(undefined, true);
    }
});

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    req.user.avatar = req.file.buffer;
    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message });
});

router.delete('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message });
});

router.get('/users/:id/avatar', async (req, res) => {

    try { //Get the user based on the ID
        const user = await User.findById(req.params.id);

        //Throw error if user or avatar not available
        if (!user || !user.avatar) {
            throw new Error();
        }
        //Get this  avatar if available
        //Send the image data to the user
        res.set('Content-Type', 'image/jpg');
        res.send(user.avatar);
    }
    catch (e) {
        res.status(500).send(e);
    }
})

module.exports = router;