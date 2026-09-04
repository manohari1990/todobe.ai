import 'dotenv/config';
import app from './src/app.js'

// dotenv.config()
const PORT = process.env.PORT || 5000;

// Start the server and listen to defined PORT
app.listen(PORT, ()=>{
    console.log(`Server is running on PORT: ${PORT}`)
})