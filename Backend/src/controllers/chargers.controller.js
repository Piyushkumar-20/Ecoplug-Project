import {getChargers} from "../services/chargers.service.js"

const getChargerController = async(req, res, next) => {
    try{
        const companyId = req.user.companyId;
        const chargers = await getChargers(companyId);
        return res.status(200).json({
            success: true,
            data: chargers,
        });
    } catch (error) {
        next(error);
    }
}

export default getChargerController;