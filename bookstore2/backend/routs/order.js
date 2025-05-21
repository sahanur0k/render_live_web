const router = require("express").Router()
const { authenticateToken } = require("./userAuth")
const Medicine = require("../models/medicine")
const Order = require("../models/order")
const User = require("../models/user")
const jwt = require("jsonwebtoken")

// Place order - Fixed implementation with proper error handling
router.post("/place-order", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { order } = req.body;

    if (!Array.isArray(order) || order.length === 0) {
      return res.status(400).json({
        status: "Error",
        message: "Order must be a non-empty array of medicine IDs",
      });
    }

    // Validate order items
    for (const item of order) {
      if (!item._id || !item.quantity || item.quantity < 1) {
        return res.status(400).json({
          status: "Error",
          message: "Each order item must have a valid medicine ID and quantity",
        });
      }
    }

    // Check stock availability for all medicines
    for (const item of order) {
      const medicineDoc = await Medicine.findById(item._id);
      if (!medicineDoc) {
        return res.status(404).json({
          status: "Error",
          message: `Medicine with ID ${item._id} not found`,
        });
      }
      if (medicineDoc.stock < item.quantity) {
        return res.status(400).json({
          status: "Error",
          message: `Insufficient stock for medicine ${medicineDoc.product_name}. Available: ${medicineDoc.stock}, Requested: ${item.quantity}`,
        });
      }
    }

    // Process orders and update stock
    const orderPromises = [];
    const stockUpdatePromises = [];

    for (const item of order) {
      // Create order
      const newOrder = new Order({
        user: userId,
        medicine: item._id,
        quantity: item.quantity
      });
      orderPromises.push(newOrder.save());

      // Update stock
      stockUpdatePromises.push(
        Medicine.findByIdAndUpdate(item._id, {
          $inc: { stock: -item.quantity }
        })
      );
    }

    // Wait for all operations to complete
    await Promise.all([...orderPromises, ...stockUpdatePromises]);

    return res.json({
      status: "Success",
      message: "Order placed successfully",
    });
  } catch (error) {
    console.error("Order placement error:", error);
    return res.status(500).json({
      status: "Error",
      message: "An error occurred while processing your order",
    });
  }
});


// Get order history of a particular user
router.get("/get-user-orders", authenticateToken, async (req, res) => {
  try {
    const { id } = req.headers

    const userData = await Order.find({ user: id })
      .populate({
        path: "medicine",
      })
      .sort({ createdAt: -1 })

    return res.json({
      status: "Success",
      data: userData,
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status: "Error",
      message: "An error occurred while fetching orders",
    })
  }
})

// Get all orders - for admin
router.get("/get-all-orders", authenticateToken, async (req, res) => {
  try {
    const userData = await Order.find()
      .populate({
        path: "medicine",
      })
      .populate({
        path: "user",
      })
      .sort({ createdAt: -1 })

    return res.json({
      status: "Success",
      data: userData,
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status: "Error",
      message: "An error occurred while fetching orders",
    })
  }
})

// Update order status
router.put("/update-status/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params

    // Validate status value
    const validStatuses = ["order placed", "shipped", "delivered"]
    if (!validStatuses.includes(req.body.status)) {
      return res.status(400).json({
        status: "Error",
        message: "Invalid status value",
      })
    }

    await Order.findByIdAndUpdate(id, { status: req.body.status })

    return res.json({
      status: "Success",
      message: "Status updated successfully",
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status: "Error",
      message: "An error occurred while updating order status",
    })
  }
})

// Verify token endpoint
router.get("/verify-token", authenticateToken, (req, res) => {
  return res.json({
    status: "Success",
    message: "Token is valid",
    user: req.user,
  })
})

module.exports = router
