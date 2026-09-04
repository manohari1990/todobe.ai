import DeviceDetector from 'device-detector-js';

function buildQuery(payload){
    const columns = []
    const values = []
    const placeholders = []
    let count = 1
    for(const key in payload){
        columns.push(key)
        values.push(payload[key])
        placeholders.push(`$${count++}`)
    }
    return {columns, values, placeholders}
}

export function buildInsertQuery(payload, tableName, returns){
    const {columns, values, placeholders} = buildQuery(payload)
    const sql = `INSERT INTO ${tableName}( ${columns.join(', ')} ) VALUES( ${placeholders.join(', ')} ) RETURNING ${returns ? returns.join(', ') : '*'}`
    return {sql, values}
}


export function buildUpdateQuery(id, payload){
    const {columns, values, placeholders} = buildQuery(payload)
    const newValues = [...values, id]
    const updateSet = columns.map((col,ind)=>  `${col}=${placeholders[ind]}`)
    const sql = `UPDATE user_todos SET ${updateSet.join(', ')} WHERE todo_id = $${placeholders.length+1} RETURNING *`
    return {sql, newValues}
}

export const buildSessionMetadata = (request) => {
    const device_detector = new DeviceDetector()        // device-detector-js instance to intialize with interface object
    const userAgent = request.headers['user-agent']
    const details = device_detector.parse(userAgent)    // extract user-agent properties
    const userRequestFrom = {
        device_type: details.device?.type,
        ip_address: request.ip,
        operating_system: `${details.os?.name} - ${details.os?.version}`,
        user_agent: userAgent,
        browser: details.client?.name,
    }
    return userRequestFrom;
}

// export const setCookies =(res, cookieTitle, cookieValue ) =>{
//     res.cookie(
//         cookieTitle,cookieValue,
//         {
//             'httpOnly': true,
//             'sameSite': 'lax',
//             'maxAge': process.env.JWT_ACCESS_COOKIE_MAX_AGE,
//             'secure': false
//         }
//     )
//     res.cookie(
//         cookieTitle,cookieValue,
//         {
//             'httpOnly': true,
//             'sameSite': 'lax',
//             'maxAge': process.env.JWT_REFRESH_COOKIE_MAX_AGE,
//             'secure': false
//         }
//     )
//     return res
// }
