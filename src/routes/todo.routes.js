import { Router } from "express";
import { getAllTodos, getTodoById, saveTodo, updateTodo, deleteTodoById } from "../controllers/todo.controller.js";
import { verifyRequestAuth } from "../middleware/authenticate.js";
import { logRequest } from '../middleware/logging.js'

const todoRouter = Router()
todoRouter.get('/', logRequest, verifyRequestAuth, getAllTodos)

todoRouter.post('/', logRequest, verifyRequestAuth, saveTodo)

todoRouter.put('/:id', logRequest, verifyRequestAuth, updateTodo)

todoRouter.delete('/:id', logRequest, verifyRequestAuth, deleteTodoById)

todoRouter.get('/:id', logRequest, verifyRequestAuth, getTodoById)

export default todoRouter
