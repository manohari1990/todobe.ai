/**
 * Docker-Redis Connect Commands:
 * > docker exec -it redis-stack redis-cli -a password ping
 * > docker restart redis-stack
 * > docker exec -it redis-stack redis-cli ping
 * 
 * Other Troubleshooting commands:
 * > docker inspect <DockerID> --format='{{range .Config.Env}}{{println .}}{{end}}'
 * > docker inspect <DockerID> --format='{{join .Config.Cmd " "}}'
 */


import {createClient} from 'redis';

const redisUrl = `redis://127.0.0.1:6379`
const redisClient = createClient(redisUrl)

redisClient.on('connect',()=> console.log("Redis Connected!") )
redisClient.on('ready',()=> console.log("Redis Ready!"))
redisClient.on('end',()=> console.log("Redis End!"))
redisClient.on('reconnecting',()=> console.log("Redis Reconnecting!"))
redisClient.on('error',(error)=>console.error(error))


async function redisConnect(){
    try{
        await redisClient.connect()
    }catch(err){
        console.error("Connection Error")
        setTimeout(redisConnect, 3000)
    }
}

redisConnect()

process.on('SIGINT', async()=>{
    await redisClient.destroy()
})

export default redisClient