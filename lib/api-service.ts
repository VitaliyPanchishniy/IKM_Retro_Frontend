import { authAxios } from "@/lib/auth"

// Base URL for the retrospective API
const API_BASE_URL = "http://localhost:5014"

// Retrospective template types
export enum TemplateType {
  StartStopContinue = 1,
  GladSadMad = 2,
  StartStopContinueChange = 3,
  KeepStopLessMoreStart = 4,
}

// Interface for creating a new retrospective
export interface CreateRetrospectiveRequest {
  title: string
  templateType: TemplateType
}

// Interface for retrospective group item
export interface GroupItem {
  id: number
  createdAt: string
  updatedAt: string
  groupId: number
  content: string
  userId: string
  dueDate: string
  orderPosition: number
  isHidden: boolean
  comments?: Comment[]
  votes?: number;
}

// Interface for comment
export interface Comment {
  id: number
  createdAt: string
  updatedAt: string
  groupItemId: number
  userId: string
  content: string
  likes: number
  isAnonymous: boolean
   userName?: string;
}

// Interface for creating a comment
export interface CreateCommentRequest {
  groupItemId: number
  content: string
  isAnonymous: boolean
}

// Interface for creating a group item
export interface CreateGroupItemRequest {
  groupId: number
  content: string
  isHidden: boolean
}

// Interface for updating a group item
export interface UpdateGroupItemRequest {
  content: string
}

// Interface for moving a group item
export interface MoveGroupItemRequest {
  newGroupId: number
  orderPosition: number
}

// Interface for voting on a group item
export interface GroupItemVoteRequest {
  groupItemId: number
}

// Interface for vote count response
export interface VoteCountResponse {
  count: number
}

// Interface for retrospective group
export interface Group {
  id: number
  createdAt: string
  updatedAt: string
  retrospectiveId: string
  name: string
  description: string
  orderPosition: number
  groupItems: GroupItem[]
}

// Interface for user
export interface User {
  id: string
  userName: string
  email: string
  avatarUrl?: string
}

// Interface for retrospective
export interface Retrospective {
  id: string
  createdAt: string
  updatedAt: string
  title: string
  startDate: string
  endDate: string
  isActive: boolean
  template: TemplateType
  creatorUserId: string
  groups: Group[]
  assignedUser: User
  assignedUsers: User[]
  inviteLink?: {
    id: string
    code: string
    expiresAt: string
    isActive: boolean
  }
}

// Interface for retrospective response
export interface RetrospectiveResponse {
  retrospective: Retrospective
}

// Retrospective API service
export const retrospectiveApi = {
  // Get all retrospectives
  getAllRetrospectives: async (): Promise<RetrospectiveResponse[]> => {
    try {
      const response = await authAxios.get(`${API_BASE_URL}/api/Retrospective`)
      return response.data
    } catch (error) {
      console.error("Error fetching retrospectives:", error)
      throw error
    }
  },

  // Create a new retrospective
  createRetrospective: async (data: CreateRetrospectiveRequest): Promise<Retrospective> => {
    try {
      const response = await authAxios.post(`${API_BASE_URL}/api/Retrospective`, data)
      return response.data
    } catch (error) {
      console.error("Error creating retrospective:", error)
      throw error
    }
  },

  // Join a retrospective by code
  joinRetrospective: async (code: string): Promise<Retrospective> => {
    try {
      const response = await authAxios.post(`${API_BASE_URL}/api/Retrospective/join/${code}`)
      return response.data
    } catch (error) {
      console.error("Error joining retrospective:", error)
      throw error
    }
  },

  // Delete a retrospective
  deleteRetrospective: async (id: string): Promise<void> => {
    try {
      await authAxios.delete(`${API_BASE_URL}/api/Retrospective/${id}`)
    } catch (error) {
      console.error("Error deleting retrospective:", error)
      throw error
    }
  },

  // Get invite details by code
  getInviteByCode: async (code: string): Promise<any> => {
    try {
      const response = await authAxios.get(`${API_BASE_URL}/api/Invite/${code}`)
      return response.data
    } catch (error) {
      console.error("Error getting invite:", error)
      throw error
    }
  },

  // Create an invite for a retrospective
  createInvite: async (retrospectiveId: string): Promise<any> => {
    try {
      const response = await authAxios.post(`${API_BASE_URL}/api/Invite/${retrospectiveId}`)
      return response.data
    } catch (error) {
      console.error("Error creating invite:", error)
      throw error
    }
  },

  // Get group items for a retrospective
  getGroupItems: async (retrospectiveId: string): Promise<GroupItem[]> => {
    try {
      const response = await authAxios.get(`${API_BASE_URL}/api/GroupItem/retrospective/${retrospectiveId}`)
      return response.data
    } catch (error) {
      console.error("Error fetching group items:", error)
      throw error
    }
  },

  // Create a new group item
  createGroupItem: async (data: CreateGroupItemRequest): Promise<GroupItem> => {
    try {
      const response = await authAxios.post(`${API_BASE_URL}/api/GroupItem`, data)
      return response.data
    } catch (error) {
      console.error("Error creating group item:", error)
      throw error
    }
  },

  // Update a group item
  updateGroupItem: async (id: number, data: UpdateGroupItemRequest): Promise<GroupItem> => {
    try {
      const response = await authAxios.patch(`${API_BASE_URL}/api/GroupItem/${id}`, data)
      return response.data
    } catch (error) {
      console.error("Error updating group item:", error)
      throw error
    }
  },

  // Delete a group item
  deleteGroupItem: async (id: number): Promise<void> => {
    try {
      await authAxios.delete(`${API_BASE_URL}/api/GroupItem/${id}`)
    } catch (error) {
      console.error("Error deleting group item:", error)
      throw error
    }
  },

  // Move a group item
  moveGroupItem: async (id: number, data: MoveGroupItemRequest): Promise<GroupItem> => {
    try {
      const response = await authAxios.put(`${API_BASE_URL}/api/GroupItem/${id}/move`, data)
      return response.data
    } catch (error) {
      console.error("Error moving group item:", error)
      throw error
    }
  },

  // Get comments for a group item
  getComments: async (groupItemId: number): Promise<Comment[]> => {
    try {
      const response = await authAxios.get(`${API_BASE_URL}/api/Comment/group-item/${groupItemId}`)
      return response.data
    } catch (error) {
      console.error("Error fetching comments:", error)
      throw error
    }
  },

  // Create a new comment
  createComment: async (data: CreateCommentRequest): Promise<Comment> => {
    try {
      const response = await authAxios.post(`${API_BASE_URL}/api/Comment`, data)
      return response.data
    } catch (error) {
      console.error("Error creating comment:", error)
      throw error
    }
  },

  // Delete a comment
  deleteComment: async (id: number): Promise<void> => {
    try {
      await authAxios.delete(`${API_BASE_URL}/api/Comment/${id}`)
    } catch (error) {
      console.error("Error deleting comment:", error)
      throw error
    }
  },

  // Vote for a group item
  voteForGroupItem: async (groupItemId: number): Promise<VoteCountResponse> => {
    try {
      const response = await authAxios.post(`${API_BASE_URL}/api/GroupItemVote`, { groupItemId })
      return response.data
    } catch (error) {
      console.error("Error voting for group item:", error)
      throw error
    }
  },

  // Remove a vote
  removeVote: async (voteId: number): Promise<void> => {
    try {
      await authAxios.delete(`${API_BASE_URL}/api/GroupItemVote/${voteId}`)
    } catch (error) {
      console.error("Error removing vote:", error)
      throw error
    }
  },

  // Get template name by type
  getTemplateNameByType: (templateType: TemplateType): string => {
    switch (templateType) {
      case TemplateType.StartStopContinue:
        return "start-stop-continue"
      case TemplateType.GladSadMad:
        return "glad-sad-mad"
      case TemplateType.StartStopContinueChange:
        return "start-stop-continue-change"
      case TemplateType.KeepStopLessMoreStart:
        return "keep-stop-less-more-start"
      default:
        return "custom"
    }
  },

  // Get template type by name
  getTemplateTypeByName: (templateName: string): TemplateType => {
    switch (templateName) {
      case "start-stop-continue":
        return TemplateType.StartStopContinue
      case "glad-sad-mad":
        return TemplateType.GladSadMad
      case "start-stop-continue-change":
        return TemplateType.StartStopContinueChange
      case "keep-stop-less-more-start":
        return TemplateType.KeepStopLessMoreStart
      default:
        return TemplateType.StartStopContinue
    }
  },
}
