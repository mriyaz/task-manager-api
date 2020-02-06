const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify:false
});



// const me = new User({
//     name: 'Tehraan   ',
//     age: 45,
//     email: ' tehran@GMAIL.COM ',
//     password: 'tehran123 '
// });

// me.save().then((me) => console.log(me)).catch((error) => console.log('Error', error));




// const task1 = new Tasks({
//     description: 'Clean car'

// });

// task1.save().then((task) => console.log(task)).catch((error) => console.log('Error', error));