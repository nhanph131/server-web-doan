import Follow from "../model/follow.js";
import User from "../model/user.js";

// ================= TOGGLE FOLLOW =================
export const followUser = async (req, res) => {
    try {
        const { followingId } = req.params;
        const followerId = req.user?.id || req.user?._id;

    if (!followerId) {
      return res.status(401).json({ statusCode: 401, message: "Unauthorized" });
    }

    if (followingId === followerId) {
      return res.status(400).json({ statusCode: 400, message: "You cannot follow yourself" });
    }

    const targetUser = await User.findById(followingId);
    if (!targetUser) {
      return res.status(404).json({ statusCode: 404, message: "User not found" });
    }

    const existingFollow = await Follow.findOne({ follower: followerId, following: followingId });

    let isFollowing;
    if (existingFollow) {
      await Follow.findByIdAndDelete(existingFollow._id);
      isFollowing = false;
    } else {
      await Follow.create({ follower: followerId, following: followingId });
      isFollowing = true;
    }

    // ✅ fetch số liệu cập nhật
    const targetUserFollowersCount = await Follow.countDocuments({ following: followingId });
    const currentUserFollowingCount = await Follow.countDocuments({ follower: followerId });

    return res.status(200).json({
      statusCode: 200,
      data: { isFollowing, targetUserFollowersCount, currentUserFollowingCount },
    });
  } catch (error) {
    console.error("FOLLOW ERROR:", error);
    return res.status(500).json({ statusCode: 500, message: error.message });
  }
};

// ================= GET FOLLOWERS (Private) =================
export const getFollowers = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
      const followers = await Follow.find({ following: userId }).populate("follower", "name imgUrl username");
    res.status(200).json(followers);
  } catch (error) {
    res.status(500).json({ statusCode: 500, message: error.message });
  }
};

// ================= GET FOLLOWING (Private) =================
export const getFollowing = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
      const following = await Follow.find({ follower: userId }).populate("following", "name imgUrl username");
    res.status(200).json({ following, count: following.length });
  } catch (error) {
    res.status(500).json({ statusCode: 500, message: error.message });
  }
};

// ================= CHECK STATUS (Private) =================
export const checkFollowStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user?.id || req.user?._id;

        const follow = await Follow.findOne({ follower: currentUserId, following: userId });

        res.status(200).json({
            statusCode: 200,
            message: "Check follow status successfully",
            data: { isFollowing: !!follow }
        });

    } catch (error) {
        res.status(500).json({
            statusCode: 500,
            message: error.message,
            data: null
        });
    }
};

// ================= GET FOLLOWERS (Public) =================
export const getPublicFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const count = await Follow.countDocuments({ following: userId });
    res.status(200).json({ followers: count });
  } catch (error) {
    res.status(500).json({ statusCode: 500, message: error.message });
  }
};

// ================= GET FOLLOWING (Public) =================
export const getPublicFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const count = await Follow.countDocuments({ follower: userId });
    res.status(200).json({ following: count });
  } catch (error) {
    res.status(500).json({ statusCode: 500, message: error.message });
  }
};