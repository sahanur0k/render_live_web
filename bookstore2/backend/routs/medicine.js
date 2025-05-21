const router = require("express").Router();
const User = require("../models/user");
const Medicine = require("../models/medicine");
const { authenticateToken } = require("./userAuth");

// Helper to get user from token
const getUserFromRequest = async (req) => {
    const userId = req.user?.id || req.headers.id;
    return await User.findById(userId);
};

// Update stock for all medicines
router.put("/update-all-stock", authenticateToken, async (req, res) => {
    try {
        const medicines = await Medicine.find({});
        const updatePromises = medicines.map(medicine => {
            medicine.stock = 100;
            if (!medicine.description) {
                medicine.description = "A high-quality medicine for your health needs.";
            }
            return medicine.save();
        });

        await Promise.all(updatePromises);

        res.status(200).json({
            status: "Success",
            message: "All medicines stock updated successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "Error",
            message: "Internal server error"
        });
    }
});

// Update stock for single medicine
router.put("/update-stock/:id", authenticateToken, async (req, res) => {
    try {
        const { stock } = req.body;
        
        if (typeof stock !== 'number' || stock < 0) {
            return res.status(400).json({
                status: "Error",
                message: "Invalid stock value"
            });
        }

        const medicine = await Medicine.findById(req.params.id);
        if (!medicine) {
            return res.status(404).json({
                status: "Error",
                message: "Medicine not found"
            });
        }

        medicine.stock = stock;
        if (!medicine.description) {
            medicine.description = "A high-quality medicine for your health needs.";
        }
        await medicine.save();

        res.status(200).json({
            status: "Success",
            message: "Stock updated successfully",
            data: medicine
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "Error",
            message: "Internal server error"
        });
    }
});

// ✅ Get all medicines
router.get("/", authenticateToken, async (req, res) => {
    try {
        const medicines = await Medicine.find({});
        res.status(200).json({ 
            status: "Success",
            data: medicines 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            status: "Error",
            message: "Internal server error" 
        });
    }
});

// ✅ Add Medicine
router.post("/", authenticateToken, async (req, res) => {
    try {
        const user = await getUserFromRequest(req);
        if (!user || user.role !== "admin") {
            return res.status(403).json({ message: "Only admin can add medicines" });
        }

        const medicine = new Medicine({
            product_name: req.body.product_name,
            description: req.body.description || "A high-quality medicine for your health needs.",
            price: req.body.price,
            stock: req.body.stock || 100,
            image_url: req.body.image_url
        });

        const savedMedicine = await medicine.save();
        res.status(200).json({ 
            status: "Success",
            message: "Medicine added successfully",
            data: savedMedicine
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            status: "Error",
            message: "Internal server error" 
        });
    }
});

// ✅ Update Medicine by ID
router.put("/:id", authenticateToken, async (req, res) => {
    try {
        const user = await getUserFromRequest(req);
        if (!user || user.role !== "admin") {
            return res.status(403).json({ message: "Only admin can update medicines" });
        }

        const updated = await Medicine.findByIdAndUpdate(
            req.params.id,
            {
                product_name: req.body.product_name,
                description: req.body.description || "A high-quality medicine for your health needs.",
                price: req.body.price,
                stock: req.body.stock || 100,
                image_url: req.body.image_url
            },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ 
                status: "Error",
                message: "Medicine not found" 
            });
        }

        res.status(200).json({ 
            status: "Success",
            message: "Medicine updated successfully", 
            data: updated 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            status: "Error",
            message: "Internal server error" 
        });
    }
});

// ✅ Get medicine by ID
router.get("/:id", authenticateToken, async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id);
        
        if (!medicine) {
            return res.status(404).json({ 
                status: "Error",
                message: "Medicine not found" 
            });
        }

        res.status(200).json({ 
            status: "Success",
            data: medicine 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            status: "Error",
            message: "Internal server error" 
        });
    }
});

// ✅ Delete Medicine by ID
router.delete("/:id", authenticateToken, async (req, res) => {
    try {
        const user = await getUserFromRequest(req);
        if (!user || user.role !== "admin") {
            return res.status(403).json({ message: "Only admin can delete medicines" });
        }

        const deleted = await Medicine.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ 
                status: "Error",
                message: "Medicine not found" 
            });
        }

        res.status(200).json({ 
            status: "Success",
            message: "Medicine deleted successfully" 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            status: "Error",
            message: "Internal server error" 
        });
    }
});

module.exports = router;
