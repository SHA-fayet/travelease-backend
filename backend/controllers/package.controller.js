import Package from "../models/package.model.js";

// 1. Create a new package (captures agency reference)
export const createPackage = async (req, res) => {
  try {
    let packageImages = [];

    if (req.files && req.files.length > 0) {
      packageImages = req.files.map((file) => file.filename);
    }

    // Capture user/agency ID from auth middleware (req.user) or request body fallback
    const creatorId = req.user?.id || req.user?._id || req.body.agencyId || req.body.userRef;

    const newPackage = await Package.create({
      ...req.body,
      packageImages,
      agencyId: creatorId,
      userRef: creatorId,
    });

    res.status(201).send({
      success: true,
      message: "Package created successfully!",
      package: newPackage,
    });
  } catch (error) {
    console.error("Error creating package:", error);
    res.status(500).send({ success: false, message: "Server error while creating package" });
  }
};

// 2. Update an existing package
export const updatePackage = async (req, res) => {
  try {
    if (!req.params.id || req.params.id === "undefined") {
      return res.status(400).send({ success: false, message: "Invalid Package ID" });
    }

    const updatedFields = { ...req.body };

    // FIX: keep the images the admin kept (sent as text URLs in req.body.packageImages)
    // and add any newly uploaded files, instead of overwriting everything.
    const existingImages = [].concat(req.body.packageImages || []).filter(Boolean);
    const newImages = (req.files || []).map((file) => file.filename);
    const finalImages = [...existingImages, ...newImages];

    delete updatedFields.packageImages;
    if (finalImages.length > 0) {
      updatedFields.packageImages = finalImages;
    }

    const updatedPackage = await Package.findByIdAndUpdate(
      req.params.id,
      { $set: updatedFields },
      { new: true, runValidators: true }
    );

    if (!updatedPackage) {
      return res.status(404).send({ success: false, message: "Package not found!" });
    }

    res.status(200).send({
      success: true,
      message: "Package updated successfully!",
      package: updatedPackage,
    });
  } catch (error) {
    console.error("Error updating package:", error);
    res.status(500).send({ success: false, message: "Server error while updating package" });
  }
};

// 3. Delete a package
export const deletePackage = async (req, res) => {
  try {
    if (!req.params.id || req.params.id === "undefined") {
      return res.status(400).send({ success: false, message: "Invalid Package ID" });
    }

    const deletedPackage = await Package.findByIdAndDelete(req.params.id);

    if (!deletedPackage) {
      return res.status(404).send({ success: false, message: "Package not found!" });
    }

    res.status(200).send({ success: true, message: "Package deleted successfully!" });
  } catch (error) {
    console.error("Error deleting package:", error);
    res.status(500).send({ success: false, message: "Server error while deleting package" });
  }
};

// 4. Get all packages
// Supports: searchTerm, agencyId, offer=true, sort=createdAt|packageRating, limit, startIndex
export const getPackages = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 0;
    const startIndex = parseInt(req.query.startIndex) || 0;
    const searchTerm = req.query.searchTerm || "";
    const agencyIdFilter = req.query.agencyId;

    // escape regex special characters so searches like "cox (bazar" don't crash
    const safeTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const query = {
      $or: [
        { packageName: { $regex: safeTerm, $options: "i" } },
        { packageDestination: { $regex: safeTerm, $options: "i" } },
      ],
    };

    if (agencyIdFilter) {
      query.agencyId = agencyIdFilter;
    }

    if (req.query.offer === "true") {
      query.packageOffer = true;
    }

    // whitelist sort fields; default is newest first
    const allowedSorts = ["createdAt", "packageRating"];
    const sortField = allowedSorts.includes(req.query.sort) ? req.query.sort : "createdAt";

    const packages = await Package.find(query)
      .sort({ [sortField]: -1 })
      .skip(startIndex)
      .limit(limit);

    res.status(200).send({
      success: true,
      packages,
    });
  } catch (error) {
    console.error("Error fetching packages:", error);
    res.status(500).send({ success: false, message: "Server error fetching packages" });
  }
};

// 5. Get single package data
export const getPackageData = async (req, res) => {
  try {
    if (!req.params.id || req.params.id === "undefined") {
      return res.status(400).send({ success: false, message: "Invalid Package ID" });
    }

    const packageData = await Package.findById(req.params.id);

    if (!packageData) {
      return res.status(404).send({ success: false, message: "Package not found!" });
    }

    res.status(200).send({
      success: true,
      packageData,
    });
  } catch (error) {
    console.error("Error in getPackageData:", error);
    res.status(500).send({ success: false, message: "Server error fetching package details" });
  }
};