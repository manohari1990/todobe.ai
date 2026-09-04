import {
    SecretsManagerClient,
    GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { Pool } from 'pg'

const prodDbCon = async () => {
    // Use this code snippet in your app.
    // If you need more information about configurations or implementing the sample code, visit the AWS docs:
    // https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-started.html

    const secret_name = "TodoAI_app";
    const client = new SecretsManagerClient({
        region: "ap-south-1",
    });
    let response;
    try {
        response = await client.send(
            new GetSecretValueCommand({
                SecretId: secret_name,
                VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
            })
        );
    } catch (error) {
        // For a list of exceptions thrown, see
        // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
        throw error;
    }
    const secrets = response.SecretString;
    return secrets
}

const secrets = await prodDbCon()
const connSecrets = JSON.parse(secrets)
const isProd = process.env.NODE_ENV === 'prod';
const pool = new Pool({
    user: connSecrets.DB_USER,
    host: isProd ? connSecrets.DB_HOST : "localhost",
    database: connSecrets.DB_NAME,
    password: connSecrets.DB_PASSWORD,
    port: isProd ? connSecrets.DB_PORT : 15432,
    ssl: {
        rejectUnauthorized: false
    }
})

// Check DB connection
pool.connect()
    .then(() => console.log("PGSQL connected"))
    .catch(err => console.error(err))

export const query = (text, params) => pool.query(text, params)
