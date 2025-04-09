import Package from "../models/package.model.js";

// 1. Create a new package (Enhanced to capture agency reference)
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

    let updatedFields = { ...req.body };

    if (req.files && req.files.length > 0) {
      updatedFields.packageImages = req.files.map((file) => file.filename);
    }

    const updatedPackage = await Package.findByIdAndUpdate(
      req.params.id,
      { $set: updatedFields },
      { new: true }
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

// 4. Get all packages (Supports filtering by agencyId if requested)
export const getPackages = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 0;
    const searchTerm = req.query.searchTerm || "";
    const agencyIdFilter = req.query.agencyId;

    let query = {
      $or: [
        { packageName: { $regex: searchTerm, $options: "i" } },
        { packageDestination: { $regex: searchTerm, $options: "i" } }
      ]
    };

    if (agencyIdFilter) {
      query.agencyId = agencyIdFilter;
    }

    const packages = await Package.find(query)
      .sort({ createdAt: -1 })
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