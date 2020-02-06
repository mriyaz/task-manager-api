const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {

    try {
        //Get the token
        const token = req.header("Authorization").replace("Bearer ", "");

        //Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //Get the  user
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });

        if (!user) {
            throw new Error();
        }
        req.token = token;
        req.user = user;
        next();
    } catch (e) {
        res.status(401).send({ error: "Please authenticate" })
    }
}

module.exports = auth;