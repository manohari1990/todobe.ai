import { allTodos, todoById, saveTodoRepo, updateTodoRepo, deleteTodoByIdRepo } from "../repositories/todo.repository.js"

export const allTodosService = async(filters) => {
    return await allTodos(filters)
}

export const todoByIdService = async(id) =>{
    return await todoById(id)
}

export const saveTodoService = async(todoBody) =>{
    return await saveTodoRepo(todoBody)
}

export const updateTodoService = async(id,todoBody)=>{
    return await updateTodoRepo(id,todoBody)
}

export const deleteTodoByIdService = async(id)=>{
    return await deleteTodoByIdRepo(id)
}