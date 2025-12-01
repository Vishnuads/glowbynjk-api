const mongoose = require('mongoose')

const database = async () => {
    await mongoose.connect(process.env.DATABASE)
.then((con) => {
   console.log(`database connect ${con.connection.host}`);
})
}

module.exports = database