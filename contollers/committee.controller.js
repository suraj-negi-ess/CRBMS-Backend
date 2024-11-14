import Committee from "../models/CommitteeMember.models.js";
import CommitteeMember from "../models/CommitteeMember.models.js";
import User from "../models/User.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const createCommittee = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    throw new ApiError(400, "Committee name is required");
  }

  const existingCommittee = await Committee.findOne({
    where: {
      name,
      deletedAt: null,
    },
  });

  if (existingCommittee) {
    throw new ApiError(400, "Committee with this name already exists");
  }

  const committee = await Committee.create({
    name,
    description,
    createdBy: req.user.id,
    status: "active",
  });

  if (!committee) {
    throw new ApiError(500, "Failed to create committee");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(201, { committee }, "Committee created successfully")
    );
});

export const updateCommittee = asyncHandler(async (req, res) => {
  const { committeeId } = req.params;
  const { name, description, status } = req.body;

  const committee = await Committee.findOne({
    where: {
      id: committeeId,
      deletedAt: null,
    },
  });

  if (!committee) {
    throw new ApiError(404, "Committee not found");
  }

  if (name && name !== committee.name) {
    const existingCommittee = await Committee.findOne({
      where: {
        name,
        deletedAt: null,
        id: { [Op.ne]: committeeId },
      },
    });

    if (existingCommittee) {
      throw new ApiError(400, "Committee with this name already exists");
    }
  }

  committee.name = name || committee.name;
  committee.description = description || committee.description;
  committee.status = status || committee.status;
  committee.updatedBy = req.user.id;
  committee.updatedAt = new Date();

  await committee.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, { committee }, "Committee updated successfully")
    );
});

export const addUserToCommittee = asyncHandler(async (req, res) => {
  const { committeeId } = req.params;
  const { userId, role } = req.body;

  if (!userId || !role) {
    throw new ApiError(400, "User ID and role are required");
  }

  const committee = await Committee.findOne({
    where: {
      id: committeeId,
      deletedAt: null,
    },
  });

  if (!committee) {
    throw new ApiError(404, "Committee not found");
  }

  const user = await User.findByPk(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const existingMember = await CommitteeMember.findOne({
    where: {
      committeeId,
      userId,
      status: "active",
    },
  });

  if (existingMember) {
    throw new ApiError(400, "User is already a member of this committee");
  }

  const committeeMember = await CommitteeMember.create({
    committeeId,
    userId,
    role,
    status: "active",
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { committeeMember },
        "User added to committee successfully"
      )
    );
});

export const removeUserFromCommittee = asyncHandler(async (req, res) => {
  const { committeeId, userId } = req.params;

  const committeeMember = await CommitteeMember.findOne({
    where: {
      committeeId,
      userId,
      status: "active",
    },
  });

  if (!committeeMember) {
    throw new ApiError(404, "User is not a member of this committee");
  }

  //This is soft delete
  committeeMember.status = "inactive";
  committeeMember.updatedAt = new Date();
  await committeeMember.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, null, "User removed from committee successfully")
    );
});

// Delete committee (soft delete)
export const deleteCommittee = asyncHandler(async (req, res) => {
  const { committeeId } = req.params;

  const committee = await Committee.findOne({
    where: {
      id: committeeId,
      deletedAt: null,
    },
  });

  if (!committee) {
    throw new ApiError(404, "Committee not found");
  }

  // Soft delete the committee
  committee.deletedAt = new Date();
  committee.status = "inactive";
  committee.updatedBy = req.user.id;
  await committee.save();

  // Deactivate all committee members
  await CommitteeMember.update(
    {
      status: "inactive",
      updatedAt: new Date(),
    },
    {
      where: {
        committeeId,
        status: "active",
      },
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Committee deleted successfully"));
});

// Get committee members
export const getCommitteeMembers = asyncHandler(async (req, res) => {
  const { committeeId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const committee = await Committee.findOne({
    where: {
      id: committeeId,
      deletedAt: null,
    },
  });

  if (!committee) {
    throw new ApiError(404, "Committee not found");
  }

  const offset = (page - 1) * limit;

  const { count, rows: members } = await CommitteeMember.findAndCountAll({
    where: {
      committeeId,
      status: "active",
    },
    include: [
      {
        model: User,
        attributes: ["id", "firstName", "lastName", "email", "profileImageUrl"],
      },
    ],
    limit,
    offset,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        members,
        pagination: {
          total: count,
          pages: Math.ceil(count / limit),
          currentPage: page,
          limit,
        },
      },
      "Committee members retrieved successfully"
    )
  );
});

// Get all committees
export const getAllCommittees = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;

  const offset = (page - 1) * limit;

  const whereClause = {
    deletedAt: null,
    ...(search && {
      [Op.or]: [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ],
    }),
  };

  const { count, rows: committees } = await Committee.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: CommitteeMember,
        where: { status: "active" },
        required: false,
        include: [
          {
            model: User,
            attributes: ["id", "firstName", "lastName"],
          },
        ],
      },
    ],
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        committees,
        pagination: {
          total: count,
          pages: Math.ceil(count / limit),
          currentPage: page,
          limit,
        },
      },
      "Committees retrieved successfully"
    )
  );
});

// Get committee details
export const getCommitteeDetails = asyncHandler(async (req, res) => {
  const { committeeId } = req.params;

  const committee = await Committee.findOne({
    where: {
      id: committeeId,
      deletedAt: null,
    },
    include: [
      {
        model: CommitteeMember,
        where: { status: "active" },
        required: false,
        include: [
          {
            model: User,
            attributes: [
              "id",
              "firstName",
              "lastName",
              "email",
              "profileImageUrl",
            ],
          },
        ],
      },
    ],
  });

  if (!committee) {
    throw new ApiError(404, "Committee not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { committee },
        "Committee details retrieved successfully"
      )
    );
});

// Update committee member role
export const updateCommitteeMemberRole = asyncHandler(async (req, res) => {
  const { committeeId, userId } = req.params;
  const { role } = req.body;

  if (!role) {
    throw new ApiError(400, "Role is required");
  }

  const committeeMember = await CommitteeMember.findOne({
    where: {
      committeeId,
      userId,
      status: "active",
    },
  });

  if (!committeeMember) {
    throw new ApiError(404, "Committee member not found");
  }

  committeeMember.role = role;
  committeeMember.updatedAt = new Date();
  await committeeMember.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { committeeMember },
        "Committee member role updated successfully"
      )
    );
});
