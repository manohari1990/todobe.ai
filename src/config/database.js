import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import {Pool} from 'pg'

// export const prodDbCon = async() =>{
//     const client = new SecretsManagerClient({
//         region: process.env.AWS_REGION
//     })
//     try{
//         const response = await client.send(
//             new GetSecretValueCommand({
//                 SecretId: process.env.SECRET_NAME,
//                 VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
//             })
//         );
//         if(response){
//             const secrets = JSON.parse(response.SecretString)
//             const pool = new Pool({
//                 user: secrets.username,
//                 host: secrets.host,
//                 database: secrets.dbInstanceIdentifier,//'todo-management',
//                 password: secrets.password,//'root',
//                 port: secrets.port
//             })

//             // Check DB connection
//             pool.connect()
//                 .then(()=> console.log("PGSQL connected"))
//                 .catch(err => console.error(err))
//             const query = (text, params) => pool.query(text, params)
//             return query;
//         }
//     }catch(err){
//         throw err;
//     }
// }

/**
 * Old implementation with hardcoding local DB instance
 */


const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false
    }
})

// Check DB connection
pool.connect()
    .then(()=> console.log("PGSQL connected"))
    .catch(err => console.error(err))

export const query = (text, params) => pool.query(text, params)
