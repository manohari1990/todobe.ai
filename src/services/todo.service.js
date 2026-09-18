import { allTodos, todoById, saveTodoRepo, updateTodoRepo, deleteTodoByIdRepo } from "../repositories/todo.repository.js"

export const allTodosService = async(filters, currentUser) => {
    return await allTodos({
        ...filters,
        user_id: currentUser.sub
    })
}

export const todoByIdService = async(id) =>{
    return await todoById(id)
}

export const saveTodoService = async(todoBody, currentUser) =>{
    const todoDetails = (todoBody.details).replace(/\n/g, '{n} ').trim()
    return await saveTodoRepo({
        ...todoBody,
        details: todoDetails,
        user_id: currentUser.sub
    })
}

export const updateTodoService = async(id,todoBody)=>{
    return await updateTodoRepo(id,todoBody)
}

export const deleteTodoByIdService = async(id)=>{
    return await deleteTodoByIdRepo(id)
}