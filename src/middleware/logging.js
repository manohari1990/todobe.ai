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
const MAX_FILE_SIZE = 10 //100 * 1024 * 1024;
const TODAY = (new Date().toISOString()).split("T")[0];

export const logRequest = async(req, res, next) =>{
    const startTime = Date.now()
    res.on("finish", async()=>{
        let filePath =  await getActiveLogFile();
        const fileSizeCheck = await checkFileSize(filePath)
        const logText = buildLogText(req, res, startTime)
        if(!fileSizeCheck)
            filePath = './logs/log2.txt'
        fs.appendFile(filePath, logText,(err)=>{
            if(err) console.error(err)
        })    // Non-bloking or Async method of file system
    })
    return next()
}

const getActiveLogFile = async() =>{
    try{
        const filePath = `./${LOG_DIR}/app-${suffixName}`
        const states = await fsPromises.stat(filePath)
        if(states)
            fileSize = states.size
    }catch(err){
         if(err !== 'ENOENT') throw err;
    }
    console.info(`File size is: ${fileSize}`)
    if(fileSize >= MAX_FILE_SIZE)
        return false
    return true
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