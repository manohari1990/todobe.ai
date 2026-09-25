import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager"

export const getCommonConfigsService = async() => {
    try{
        const secret_name = "TodoAI_app"
        const client = new SecretsManagerClient({
            region: "ap-south-1"
        })
        const response = await client.send(
            new GetSecretValueCommand({
                SecretId: secret_name,
                VersionStage: "AWSCURRENT"
            })
        )
        const secretsJson = JSON.parse(response.SecretString)
        return {
            GOOGLE_CLIENT_ID: secretsJson.GOOGLE_CLIENT_ID,
            GITHUB_CLIENT_ID: secretsJson.GITHUB_CLIENT_ID
        }
    }catch(err){
        console.error(err)
        throw err
    }
}