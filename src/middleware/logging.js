import fs from "fs";
import fsPromises from "fs/promises";

/*
    When?
    What request?
    What response status?
    How long did it take?

    Log rotation after certain file size, 100 MB: - WORKING
        fetch last updated file from ./logs folder
        check file size >=100MB
        create new file inside ./logs folder otherwise continue to the existing file
        append the log traces
        logs/
        ├── app-2026-08-23.log
        ├── app-2026-08-22.log
        ├── app-2026-08-21.log
        └── ...
    Log levels:
        TRACE
        DEBUG
        INFO
        WARN
        ERROR
        FATAL
    Structured logs
        {
            timestamp: "...",
            level: "info",
            method: "GET",
            url: "/todos",
            status: 200,
            duration: 125
        }
*/

const LOG_DIR = './logs';
const MAX_FILE_SIZE = 1024*2 //100 * 1024 * 1024;
// let fileVersion = 0

export const logRequest = async(req, res, next) =>{
    const startTime = Date.now()
    res.on("finish", async()=>{
        const filePath =  await getActiveLogFile();
        const logText = buildLogText(req, res, startTime)
        fs.appendFile(filePath, logText,(err)=>{
            if(err) console.error(err)
        })    // Non-bloking or Async method of file system
    })
    return next()
}

const getActiveLogFile = async(version='') =>{
    let fileSize = 0
    const now = new Date()
    const timeStamp = now.getFullYear() + '-' +
                    String(now.getMonth() + 1).padStart(2,'0') + '-' +
                    String(now.getDate()).padStart(2,'0');
    const filePath = `${LOG_DIR}/app-${timeStamp}${version}.log`;
    // console.log(filePath,"==============filePath1")// /logs/app-2026-09-14.log, /logs/app-2026-09-14-1.log
    try{
        const stats = await fsPromises.stat(filePath)
        if (stats) fileSize = stats.size
        // console.log(fileSize >= MAX_FILE_SIZE,"===================fileSize >= MAX_FILE_SIZE")
        // if(fileSize >= MAX_FILE_SIZE){
        //     fileVersion = fileVersion+1;
        //     console.log(fileVersion,"==============fileVersion \n") // 1
        //     return await getActiveLogFile(`-${fileVersion}`)
        // }
        return filePath
    }catch(err){
        if(err !== 'ENOENT') {
            // File doesn't exist → create it
            await fsPromises.writeFile(filePath,'')
            return filePath
        }else{
            throw err
        }
    }
}


const buildLogText=(req, res, startTime)=>{
    const duration = Date.now() - startTime;
    const logText = 
    `REQUEST
    Date:${startTime}
    Url: ${req.headers?.referer}${req.originalUrl}
    User Agent: ${req.headers['user-agent']} 
    ${req.method} → ${req.originalUrl} → ${res.statusCode}
    Message: ${res.statusMessage}
    Duration: ${duration}ms
    \n`
    return logText
}


const checkFileSize = async(filePath) =>{
    let fileSize = 0
    try{
        const states = await fsPromises.stat(filePath)
        fileSize = states.size
    }catch(err){
        if(err !== 'ENOENT') throw err;
    }
    console.info(`File size is: ${fileSize}`)
    if(fileSize >= MAX_FILE_SIZE)
        return false
    return true
}