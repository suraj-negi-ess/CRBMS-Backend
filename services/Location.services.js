import Location from "../models/Location.model.js";
import { ApiError } from "../utils/ApiError.js";

export const getAllActiveLocationService = async () => {
    try {
        const locations = await Location.findAll({
            attributes: ["id", "locationName", "status", "createdAt", "updatedAt"],
            order: [["createdAt", "DESC"]],
            where: { status: true },
          });
        
          if (!locations.length) {
            throw new ApiError(404, "No locations found");
          }
          return locations
    } catch (error) {
        console.log('error', error);
        throw error;
    }
}