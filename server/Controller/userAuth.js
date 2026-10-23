const mongoose = require("mongoose");
const User = require("../Models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.createUser = async (req, res) => {
  try {
    const { username, password, email, pic, role, salary, phone } = req.body;

    if (!username || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Username, email, and phone are required",
      });
    }

    if (role && !["admin", "staff"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be admin or staff",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    // Use phone as the password if no password is provided
    const finalPassword = password || phone;
    const hashedPassword = await bcrypt.hash(finalPassword, 10);

    const user = await User.create({
      username,
      password: hashedPassword,
      email,
      pic: pic || "",
      role: role || "staff",
      phone,
      ...(salary !== undefined &&
        salary !== "" && {
          salary: Number(salary),
        }),
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        pic: user.pic,
        role: user.role,
        salary: user.salary,
        phone: user.phone,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.log("Error at creating User :::", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Req Body", req.body);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email,
    }).select("+password");

    console.log("User", user);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    console.log("IsMAtch", isMatch);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        pic: user.pic,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Error logging in user:", err.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      username,
      password,
      email,
      pic,
      role,
      salary,
      phone,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const updateData = {};

    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (pic !== undefined) updateData.pic = pic;
    if (phone !== undefined) updateData.phone = phone;

    if (role !== undefined) {
      if (!["admin", "staff"].includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Role must be admin or staff",
        });
      }
      updateData.role = role;
    }

    if (salary !== undefined) {
      if (salary === "") {
        updateData.salary = undefined;
      } else {
        const parsedSalary = Number(salary);

        if (!Number.isFinite(parsedSalary) || parsedSalary < 0) {
          return res.status(400).json({
            success: false,
            message: "Salary must be a valid non-negative number",
          });
        }

        updateData.salary = parsedSalary;
      }
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: id },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email is already registered",
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (err) {
    console.log("Error updating user:", err);

    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    console.log("Error deleting user:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



exports.getUsers = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "" } = req.query;

    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.min(
      100,
      Math.max(1, parseInt(limit, 10) || 10)
    );

    const query = {};
    const searchText = search.trim();

    if (searchText) {
      const conditions = [
        {
          username: {
            $regex: searchText.replace(
              /[.*+?^${}()|[\]\\]/g,
              "\\$&"
            ),
            $options: "i",
          },
        },
      ];

      if (mongoose.Types.ObjectId.isValid(searchText)) {
        conditions.push({ _id: searchText });
      }

      query.$or = conditions;
    }

    const skip = (page - 1) * limit;

    const [users, totalUsers] = await Promise.all([
      User.find(query)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      User.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      users,
      pagination: {
        totalUsers,
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        limit,
        hasNextPage: page * limit < totalUsers,
        hasPrevPage: page > 1,
      },
    });
  } catch (err) {
    console.log("Error fetching users:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
