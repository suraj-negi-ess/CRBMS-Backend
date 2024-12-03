import Committee from "../models/Committee.models.js";
import CommitteeMember from "../models/CommitteeMember.models.js";
import User from "../models/User.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sequelize } from "../database/database.js";
import { QueryTypes, Sequelize } from "sequelize";

export const createCommittee = asyncHandler(async (req, res) => {
  const { name, description, createdByUserId } = req.body;

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
    // createdBy: createdByUserId,
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
  console.log("Hi");

  const { committeeId, userId } = req.params;
  console.log(committeeId);
  console.log(userId);
  console.log(req.params);

  const committeeMember = await CommitteeMember.findOne({
    where: {
      committeeId,
    },
  });

  if (!committeeMember) {
    throw new ApiError(404, "User is not a member of this committee");
  }

  // Permanently delete the committee member
  await committeeMember.destroy();

  return res
    .status(200)
    .json(
      new ApiResponse(200, null, "User removed from committee successfully")
    );
});

// Delete committee (soft delete)
export const deleteCommittee = asyncHandler(async (req, res) => {
  const { committeeId } = req.params;

  // Find the committee by ID
  const committee = await Committee.findOne({
    where: {
      id: committeeId,
    },
  });

  if (!committee) {
    throw new ApiError(404, "Committee not found");
  }

  await CommitteeMember.destroy({
    where: {
      committeeId,
    },
    force: true,
  });

  await committee.destroy({ force: true });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "Committee and its members deleted successfully"
      )
    );
});

// Get committee members
export const getCommitteeMembers = asyncHandler(async (req, res) => {
  const { committeeId } = req.params;

  try {
    // Verify if the committee exists and is not soft-deleted
    const committeeExistsQuery = `
      SELECT id 
      FROM committees 
      WHERE id = :committeeId
    `;

    const [committee] = await sequelize.query(committeeExistsQuery, {
      replacements: { committeeId },
      type: QueryTypes.SELECT,
    });

    if (!committee) {
      throw new ApiError(404, "Committee not found");
    }

    // Fetch active members with user details using a raw query
    const membersQuery = `
  SELECT 
    cm.id AS memberId, 
    cm.status, 
    u.id AS userId, 
    u.fullname, 
    u.email, 
    u."phoneNumber", 
    u."avatarPath"
  FROM "committee_members" cm
  INNER JOIN "users" u ON cm."userId" = u.id
  WHERE cm."committeeId" = :committeeId AND cm.status = 'active'
`;

    const members = await sequelize.query(membersQuery, {
      replacements: { committeeId },
      type: QueryTypes.SELECT,
    });

    if (!members.length) {
      return res
        .status(200)
        .json(new ApiResponse(200, { members: [] }, "No active members found"));
    }

    // console.log("Members retrieved successfully:", members);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { members },
          "Committee members retrieved successfully"
        )
      );
  } catch (error) {
    console.error("Error retrieving committee members:", error);
    throw error; // Forward the error to the error handler
  }
});

export const getAllCommittees = asyncHandler(async (req, res) => {
  // Fetch committees with their member details
  const committees = await sequelize.query(
    `
    SELECT 
      c.id AS "id",
      c.name AS "name",
      c.description AS "description",
      c."createdAt" AS "createdAt",
      c."updatedAt" AS "updatedAt",
      COUNT(cm.id) AS "memberCount",
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'id', u.id,
          'fullname', u."fullname",
          'email', u."email",
          'avatarPath', u."avatarPath",
          'role', cm."role",
          'status', cm."status"
        )
      ) AS "members"
    FROM 
      "committees" c
    LEFT JOIN 
      "committee_members" cm
    ON 
      c.id = cm."committeeId"
    LEFT JOIN 
      "users" u
    ON 
      cm."userId" = u.id
    GROUP BY 
      c.id
    ORDER BY 
      c."createdAt" DESC
    `,
    { type: sequelize.QueryTypes.SELECT }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { committees },
        "Committees with members retrieved successfully"
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

export const getCommitteeByUserId = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  // Raw SQL query to fetch committees associated with the user
  const userCommittees = await sequelize.query(
    `
    SELECT 
      c.id AS "id",
      c.name AS "name",
      c.description AS "description",
      c."createdAt" AS "createdAt",
      c."updatedAt" AS "updatedAt",
      COUNT(cm.id) AS "memberCount",
      c.status As status
    FROM 
      "committees" c
    LEFT JOIN 
      "committee_members" cm
    ON 
      c.id = cm."committeeId"
    WHERE 
      cm."userId" = :userId
    GROUP BY 
      c.id
    ORDER BY 
      c."createdAt" DESC
    `,
    {
      type: sequelize.QueryTypes.SELECT,
      replacements: { userId }, // Bind parameter to prevent SQL injection
    }
  );

  // Respond with user committees
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { committees: userCommittees },
        "Committees retrieved successfully for the user"
      )
    );
});
