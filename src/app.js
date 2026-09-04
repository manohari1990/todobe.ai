import express from 'express';
import cors from 'cors';
import todoRouter from './routes/todo.routes.js';
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import cookieParser from 'cookie-parser'

const app = express()

app.use(cors({
    origin: ['http://localhost:8000'],
    credentials: true               // To enable the cookie sharing to client
}))
app.use(express.json())
app.use(cookieParser())
app.use("/uploads", express.static('uploads'))  // enables FE to read from server using HTTP URL

app.get('/', (req, res) => {
    console.log("Todo App")
    res.end("Todo App is running here")
})

app.use('/todos', todoRouter)
app.use('/auth', authRouter)
app.use('/user', userRouter)

app.use((req, res) => {
    res.status(404).json({
        'message': 'Invalue route'
    })
})

export default app;