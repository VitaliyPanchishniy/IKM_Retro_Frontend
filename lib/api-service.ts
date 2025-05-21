import API from "@/lib/api"

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

// Interface for converting a group item to an action item
export interface ConvertToActionRequest {
  status: number
  priority: number
  assignedUserId: string
  details?: string
  description?: string // Add this field
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

// Interface for vote
export interface Vote {
  id: number
  groupItemId: number
  userId: string
}

// Retrospective API service
export const retrospectiveApi = {
  // Get all retrospectives
  getAllRetrospectives: async (): Promise<RetrospectiveResponse[]> => {
    try {
      const response = await API.get(`/api/Retrospective`)
      return response.data
    } catch (error) {
      console.error("Error fetching retrospectives:", error)
      throw error
    }
  },

  // Create a new retrospective
  createRetrospective: async (data: CreateRetrospectiveRequest): Promise<Retrospective> => {
    try {
      const response = await API.post(`/api/Retrospective`, data)
      return response.data
    } catch (error) {
      console.error("Error creating retrospective:", error)
      throw error
    }
  },

  // Join a retrospective by code
  joinRetrospective: async (code: string): Promise<Retrospective> => {
    try {
      const response = await API.post(`/api/Retrospective/join/${code}`)
      return response.data
    } catch (error) {
      console.error("Error joining retrospective:", error)
      throw error
    }
  },

  // Delete a retrospective
  deleteRetrospective: async (id: string): Promise<void> => {
    try {
      await API.delete(`/api/Retrospective/${id}`)
    } catch (error) {
      console.error("Error deleting retrospective:", error)
      throw error
    }
  },

  // Get invite details by code
  getInviteByCode: async (code: string): Promise<any> => {
    try {
      const response = await API.get(`/api/Invite/${code}`)
      return response.data
    } catch (error) {
      console.error("Error getting invite:", error)
      throw error
    }
  },

  // Create an invite for a retrospective
  createInvite: async (retrospectiveId: string): Promise<any> => {
    try {
      const response = await API.post(`/api/Invite/${retrospectiveId}`)
      return response.data
    } catch (error) {
      console.error("Error creating invite:", error)
      throw error
    }
  },

  // Get group items for a retrospective
  getGroupItems: async (retrospectiveId: string): Promise<GroupItem[]> => {
    try {
      const response = await API.get(`/api/retrospectives/${retrospectiveId}/items`)
      return response.data
    } catch (error) {
      console.error("Error fetching group items:", error)
      throw error
    }
  },

  // Get a specific group item by ID
  getGroupItem: async (id: number, retrospectiveId: string): Promise<GroupItem> => {
    try {
      const response = await API.get(`/api/retrospectives/${retrospectiveId}/items/${id}`)
      return response.data
    } catch (error) {
      console.error("Error fetching group item:", error)
      throw error
    }
  },

  // Create a new group item
  createGroupItem: async (retrospectiveId: string, data: CreateGroupItemRequest): Promise<GroupItem> => {
    try {
      const response = await API.post(`/api/retrospectives/${retrospectiveId}/items`, data)
      return response.data
    } catch (error) {
      console.error("Error creating group item:", error)
      throw error
    }
  },

  // Update a group item
  updateGroupItem: async (
    itemId: number,
    data: UpdateGroupItemRequest,
    retrospectiveId: string,
  ): Promise<GroupItem> => {
    try {
      const response = await API.patch(`/api/retrospectives/${retrospectiveId}/items/${itemId}`, data)
      return response.data
    } catch (error) {
      console.error("Error updating group item:", error)
      throw error
    }
  },

  // Delete a group item
  deleteGroupItem: async (itemId: number, retrospectiveId: string): Promise<void> => {
    try {
      await API.delete(`/api/retrospectives/${retrospectiveId}/items/${itemId}`)
    } catch (error) {
      console.error("Error deleting group item:", error)
      throw error
    }
  },

  // Move a group item
  moveGroupItem: async (itemId: number, data: MoveGroupItemRequest, retrospectiveId: string): Promise<GroupItem> => {
    try {
      const response = await API.put(`/api/retrospectives/${retrospectiveId}/items/${itemId}/move`, data)
      return response.data
    } catch (error) {
      console.error("Error moving group item:", error)
      throw error
    }
  },

  // Convert a group item to an action item
  convertToAction: async (itemId: number, data: ConvertToActionRequest, retrospectiveId: string): Promise<any> => {
    try {
      const response = await API.post(`/api/retrospectives/${retrospectiveId}/items/${itemId}/convert-to-action`, data)
      return response.data
    } catch (error) {
      console.error("Error converting group item to action:", error)
      throw error
    }
  },

  // Get comments for a group item
  getComments: async (groupItemId: number, retrospectiveId: string): Promise<Comment[]> => {
    try {
      const response = await API.get(`/api/retrospectives/${retrospectiveId}/items/${groupItemId}/comments`)
      return response.data
    } catch (error) {
      console.error("Error fetching comments:", error)
      throw error
    }
  },

  // Create a new comment
  createComment: async (data: CreateCommentRequest, retrospectiveId: string): Promise<Comment> => {
    try {
      const response = await API.post(`/api/retrospectives/${retrospectiveId}/items/${data.groupItemId}/comments`, {
        content: data.content,
        isAnonymous: data.isAnonymous,
      })
      return response.data
    } catch (error) {
      console.error("Error creating comment:", error)
      throw error
    }
  },

  // Delete a comment
  deleteComment: async (groupItemId: number, commentId: number, retrospectiveId: string): Promise<void> => {
    try {
      await API.delete(`/api/retrospectives/${retrospectiveId}/items/${groupItemId}/comments/${commentId}`)
    } catch (error) {
      console.error("Error deleting comment:", error)
      throw error
    }
  },

  // Vote for a group item
  voteForGroupItem: async (groupItemId: number): Promise<VoteCountResponse> => {
    try {
      const response = await API.post(`/api/GroupItemVote`, { groupItemId: groupItemId })
      return response.data
    } catch (error) {
      console.error("Error voting for group item:", error)
      throw error
    }
  },

  // Get votes for a group item
  getVotesForGroupItem: async (groupItemId: number): Promise<VoteCountResponse> => {
    try {
      const response = await API.get(`/api/GroupItemVote/count/${groupItemId}`)
      return response.data
    } catch (error) {
      console.error("Error getting votes for group item:", error)
      throw error
    }
  },

  // Get all votes for a group item (including user info)
  getAllVotesForGroupItem: async (groupItemId: number): Promise<Vote[]> => {
    try {
      const response = await API.get(`/api/GroupItemVote/by-group-item/${groupItemId}`)
      return response.data
    } catch (error) {
      console.error("Error getting all votes for group item:", error)
      throw error
    }
  },

  // Get all votes by a user
  getVotesByUser: async (userId: string): Promise<Vote[]> => {
    try {
      const response = await API.get(`/api/GroupItemVote/by-user/${userId}`)
      return response.data
    } catch (error) {
      console.error("Error getting votes by user:", error)
      throw error
    }
  },

  // Remove a vote
  removeVote: async (voteId: number): Promise<void> => {
    try {
      await API.delete(`/api/GroupItemVote/${voteId}`)
    } catch (error) {
      console.error("Error removing vote:", error)
      throw error
    }
  },

  // Remove all votes by a user for a specific item
  removeAllVotesForItem: async (groupItemId: number, userId: string): Promise<void> => {
    try {
      // First get all votes for this item
      const votes = await retrospectiveApi.getAllVotesForGroupItem(groupItemId)

      // Filter votes by the current user
      const userVotes = votes.filter((vote) => vote.userId === userId)

      // Delete each vote
      for (const vote of userVotes) {
        await retrospectiveApi.removeVote(vote.id)
      }
    } catch (error) {
      console.error("Error removing all votes for item:", error)
      throw error
    }
  },

  // Get action items for a retrospective
  getActionItems: async (retrospectiveId: string): Promise<any[]> => {
    try {
      const response = await API.get(`/api/ActionItem/by-retrospective/${retrospectiveId}`)
      return response.data
    } catch (error) {
      console.error("Error fetching action items:", error)
      throw error
    }
  },

  // Get a specific action item
  getActionItem: async (id: string): Promise<any> => {
    try {
      const response = await API.get(`/api/ActionItem/${id}`)
      return response.data
    } catch (error) {
      console.error("Error fetching action item:", error)
      throw error
    }
  },

  // Create a new action item
  createActionItem: async (data: any): Promise<any> => {
    try {
      const response = await API.post(`/api/ActionItem`, data)
      return response.data
    } catch (error) {
      console.error("Error creating action item:", error)
      throw error
    }
  },

  // Update an action item
  updateActionItem: async (id: string, data: any): Promise<any> => {
    try {
      console.log(`Updating action item ${id} with data:`, data)
      const response = await API.patch(`/api/ActionItem/${id}`, data)
      return response.data
    } catch (error) {
      console.error("Error updating action item:", error)
      throw error
    }
  },

  // Delete an action item
  deleteActionItem: async (id: string): Promise<void> => {
    try {
      await API.delete(`/api/ActionItem/${id}`)
    } catch (error) {
      console.error("Error deleting action item:", error)
      throw error
    }
  },

  // Get comments for an action item
  getActionItemComments: async (actionItemId: number): Promise<any[]> => {
    try {
      const response = await API.get(`/api/ActionItemComment/action-item/${actionItemId}`)
      return response.data
    } catch (error) {
      console.error("Error fetching action item comments:", error)
      throw error
    }
  },

  // Create a new action item comment
  createActionItemComment: async (data: any): Promise<any> => {
    try {
      const response = await API.post(`/api/ActionItemComment`, data)
      return response.data
    } catch (error) {
      console.error("Error creating action item comment:", error)
      throw error
    }
  },

  // Delete an action item comment
  deleteActionItemComment: async (id: number): Promise<void> => {
    try {
      await API.delete(`/api/ActionItemComment/${id}`)
    } catch (error) {
      console.error("Error deleting action item comment:", error)
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
