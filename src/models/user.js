
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const tasks = require('./task');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        age: {
            type: Number,
            default: 0,
            validate(value) {
                if (value < 0) {
                    throw new Error('Age must be a positive number');
                }

            }
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error('Email is invalid!');
                }
            }
        },
        password: {
            type: String,
            required: true,
            trim: true,
            minlength: 7,
            validate(value) {
                if (value.toLowerCase().includes('password')) {
                    throw new Error('Password cannot be set as "password"');
                }
            }

        },
        tokens: [
            {
                token: {
                    type: String,
                    required: true
                }
            }
        ],
        avatar: {
            type: Buffer
        }
    }, {
    timestamps: true
});

userSchema.virtual('tasks', {
    ref: 'Tasks',
    localField: '_id',
    foreignField: 'owner'

});

userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;

    return userObject;


}

userSchema.methods.generateAuthToken = async function () {
    const user = this;

    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

    user.tokens.push({ token });
    await user.save();

    return token;
}

//Check login credentials
userSchema.statics.findByCredentials = async (email, password) => {
    //Check email
    const user = await User.findOne({ email });
    //console.log('user from findByCredentials:' + user);

    if (!user) {
        throw new Error("Unable to login!");
    }
    //console.log("password from findByCredentials::" + password);

    //If email found, check password    
    const isMatch = await bcrypt.compare(password, user.password);
    //console.log('isMatch from findByCredentials:' + isMatch);

    if (!isMatch) {
        throw new Error("Unable to login!");
    }

    //if password matches return user
    return user
}


//Hash password  before saving
userSchema.pre('save', async function (next) {
    const user = this;

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
});

//Delete the tasks when user  is deleted.
userSchema.pre('remove', async function (next) {
    const user = this;

    await tasks.deleteMany({ owner: user._id });

    next();
});


const User = mongoose.model('User', userSchema);

module.exports = User;