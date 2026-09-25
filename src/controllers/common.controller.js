import { getCommonConfigsService } from "../services/common.service.js"

export const getCommonConfigs = async(req, res) =>{
    try{
        const configurations = await getCommonConfigsService()
        return configurations ? 
            res.status(200).json({
                success: true,
                configs: configurations
            }) : res.status(500).json({
                success: false,
                message: "Failed to fetch website configurations, Please refresh again!"
            })
    }catch(err){
        throw err
    }
}

