import Follow from "../model/follow.js";
import User from "../model/user.js";

// Toggle follow: Follow if not following, Unfollow if already following
export const followUser = async (req, res) => {
    try {
        const { followingId } = req.params;
        const followerId = req.user?.id || req.user?._id;

        if (followingId === followerId) {
            return res.status(400).json({
                statusCode: 400,
                message: "You cannot follow yourself",
                data: null
            });
        }

        const targetUser = await User.findById(followingId);
        if (!targetUser) {
            return res.status(404).json({
                statusCode: 404,
                message: "User not found",
                data: null
            });
        }

        const existingFollow = await Follow.findOne({ follower: followerId, following: followingId });

        if (existingFollow) {
            // Unfollow
            await Follow.findByIdAndDelete(existingFollow._id);
            return res.status(200).json({
                statusCode: 200,
                message: "Unfollowed successfully",
                data: { isFollowing: false }
            });
        } else {
            // Follow
            const newFollow = new Follow({ follower: followerId, following: followingId });
            await newFollow.save();
            return res.status(200).json({
                statusCode: 200,
                message: "Followed successfully",
                data: { isFollowing: true }
            });
        }

    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: error.message,
            data: null
        });
    }
};

export const getFollowers = async (req, res) => {
    const userId = req.user?.id;
    try {
        const followers = await Follow.find({ following: userId }).populate("follower", "name imgUrl");
        res.status(200).json({
            statusCode: 200,
            message: "Get followers successfully",
            data: followers
        });
    } catch (error) {
        res.status(500).json({
            statusCode: 500,
            message: error.message,
            data: null
        });
    }
};

export const getFollowing = async (req, res) => {
    const userId = req.user?.id;
    try {
        const following = await Follow.find({ follower: userId }).populate("following", "name imgUrl");
        res.status(200).json({
            statusCode: 200,
            message: "Get following successfully",
            data: {
                 following,
                 count: following.length
            }
        });
    } catch (error) {
        res.status(500).json({
            statusCode: 500,
            message: error.message,
            data: null
        });
    }
};

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
