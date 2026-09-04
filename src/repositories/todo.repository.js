import { query } from '../config/database.js'
import { DEFAULT_PAGE_LIMIT, DEFAULT_SORT_BY, DEFAULT_ORDER, allowedSortFields, NEW_UPDATE_TODO_RETURN_FROM_DB } from '../Constant.js'
import { buildUpdateQuery, buildInsertQuery } from '../utils/helpers.js'

export const allTodos = async(filters) =>{
    const conditions = []
    const values = []
    let sql = 'SELECT *, due_date::text AS due_date FROM user_todos '
    let countSql = 'SELECT COUNT(*) FROM user_todos'
    let totalRecords = 0
    
    if(filters.search){
        conditions.push(` ( title ILIKE $${values.length + 1} OR details ILIKE $${values.length + 1} ) `)
        values.push(`%${filters.search}%`)
    }
    if(filters.priority){
        conditions.push(`priority = $${values.length + 1}`)
        values.push(filters.priority)
    }
    if(filters.status){
        conditions.push(`status = $${values.length + 1}`)
        values.push(filters.status)
    }
    
    if(conditions.length > 0){
        sql += " WHERE "+ conditions.join(" AND ")
    }
    
    
    const sortBy = allowedSortFields.includes(filters.sortBy) ? filters.sortBy : DEFAULT_SORT_BY
    const order = filters.order?.toUpperCase() === 'ASC' ? 'ASC' : DEFAULT_ORDER
    sql += ` ORDER BY ${sortBy} ${order} `

    if(filters.page){ // DEFAULT_PAGE_LIMIT
        countSql += conditions.length > 0 ? ` WHERE ${conditions.join(" AND ")}` : ''
        const dbRecordsCount = await query(countSql, values)
        totalRecords = dbRecordsCount.rows[0]['count']
        const limit = filters.limit ? filters.limit : DEFAULT_PAGE_LIMIT
        sql += `OFFSET ${(filters.page-1)* limit} LIMIT ${limit}`
    }
    try{
        const result = await query(sql,values)
        return {
            'totalRecords': totalRecords,
            'records': result.rows,
            'page': filters.page,
            'limit': filters.limit,
            'success': true
        }
    }catch(err){
        console.error(err)
    }
}

export const todoById = async(id) =>{
    try{
        const result = await query('select * from user_todos where todo_id = $1', [id])
        return result.rows.length > 0 ?{
                    'records': result.rows[0],
                    'success': true
                } : {
                    'records': [],
                    'success': true
                }
    }catch(err){
        console.error(err)
        throw err;
    }
}

export const saveTodoRepo = async(todoBody) => {
    
    const {sql,values} = buildInsertQuery(todoBody, "user_todos", NEW_UPDATE_TODO_RETURN_FROM_DB)
    console.log(sql, values)
    try{
        const response = await query(sql, values)
        return response.rows.length > 0 ?{
                    'records': response.rows[0],
                    'success': true
                } : {
                    'records': [],
                    'success': true
                }
    }catch(err){
        console.error(err)
        throw err
    }
}

export const updateTodoRepo = async(id, todoBody) =>{
    const {sql,newValues} = buildUpdateQuery(id, todoBody)
    try{
        const response = await query(sql, newValues)
        return response.rows.length > 0 ?{
                    'records': response.rows[0],
                    'success': true
                } : {
                    'records': [],
                    'success': true
                }
    }catch(err){
        console.log(err)
        throw err
    }
}

export const deleteTodoByIdRepo = async(id) =>{
    const sql = ` DELETE FROM user_todos WHERE todo_id = $1 RETURNING * `
    try{
        const response = await query(sql, [id])
        return response.rows.length > 0 ?{
                    'records': response.rows[0],
                    'success': true
                } : {
                    'records': [],
                    'success': true
                }
    }catch(err){
        console.error(err)
        throw err
    }
}



// Basic validation – Return 400 Bad Request for invalid input (e.g., empty title or invalid priority).