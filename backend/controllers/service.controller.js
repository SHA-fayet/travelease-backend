import Hotel from "../models/hotel.model.js";
import Transportation from "../models/transportation.model.js";
import Guide from "../models/guide.model.js";

const getModel = (type) => {
  if (type === "hotel") return Hotel;
  if (type === "transportation") return Transportation;
  if (type === "guide") return Guide;
  throw new Error("Invalid service type");
};

export const createService = async (req, res) => {
  try {
    const { type } = req.params; // 'hotel', 'transportation', or 'guide'
    const Model = getModel(type);
    
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => file.filename);
    }

    const creatorId = req.user?.id || req.user?._id;

    const newService = await Model.create({
      ...req.body,
      images,
      agencyId: creatorId,
    });

    res.status(201).send({ success: true, message: `${type} created successfully!`, data: newService });
  } catch (error) {
    console.error(`Error creating ${req.params.type}:`, error);
    res.status(500).send({ success: false, message: `Server error creating ${req.params.type}` });
  }
};

export const getServices = async (req, res) => {
  try {
    const { type } = req.params;
    const Model = getModel(type);
    
    const limit = parseInt(req.query.limit) || 0;
    const location = req.query.location || "";
    const agencyId = req.query.agencyId;

    let query = {};
    
    // Support searching by location (critical for AI image integration)
    if (location) {
      query.$or = [
        { location: { $regex: location,$options: "i" } },
        { arrivalLocation: { $regex: location,$options: "i" } } // For transportation
      ];
    }
    
    if (agencyId) {
      query.agencyId = agencyId;
    }

    const services = await Model.find(query).sort({ createdAt: -1 }).limit(limit);
    res.status(200).send({ success: true, data: services });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error fetching services" });
  }
};