import API from "@/lib/api"

// Set the base URL for the API
const BASE_URL = "http://localhost:5014"

// Update API instance to use the correct base URL
API.defaults.baseURL = BASE_URL

// Retrospective template types
export enum TemplateType {
  StartStopContinue = 1,
  GladSadMad = 2,
  StartStopContinueChange = 3,
  KeepStopLessMoreStart = 4,
}

// Action Item Priority enum
export enum ActionItemPriority {
  Critical = 0,
  High = 1,
  Medium = 2,
  Low = 3,
  VeryLow = 4,
}

// Action Item Status enum
export enum ActionItemStatus {
  Pending = 0,
  InProgress = 1,
  Completed = 2,
  WontDo = 3,
  Archived = 4,
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
  user?: User
}

// Interface for creating a comment
export interface CreateCommentRequest {
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
}

// Interface for voting on a group item
export interface GroupItemVoteRequest {
  groupItemId: number
}

// Interface for vote count response
export interface VoteCountResponse {
  count: number
}

// Interface for vote response
export interface VoteResponse {
  id: number
  groupItemId: number
  userId: string
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

// Interface for action item
export interface ActionItem {
  id: number
  createdAt: string
  updatedAt: string
  actionId: string
  retrospectiveId: string
  description: string
  assignedUserId?: string
  dueDate?: string
  status: ActionItemStatus
  priority: ActionItemPriority
}

// Interface for action item comment
export interface ActionItemComment {
  id: number
  createdAt: string
  updatedAt: string
  actionItemId: number
  userId: string
  content: string
  user?: User
}

// Interface for creating action item
export interface CreateActionItemRequest {
  retrospectiveId: string
  description: string
  assignedUserId?: string
  dueDate?: string
  status: ActionItemStatus
  priority: ActionItemPriority
}

// Interface for updating action item
export interface UpdateActionItemRequest {
  description?: string
  priority?: ActionItemPriority
  status?: ActionItemStatus
  dueDate?: string
  assignedUserId?: string
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

  // Get specific retrospective by ID
  getRetrospective: async (retrospectiveId: string): Promise<RetrospectiveResponse> => {
    try {
      const response = await API.get(`/api/Retrospective/${retrospectiveId}`)
      return response.data
    } catch (error) {
      console.error("Error fetching retrospective:", error)
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

  // Update retrospective
  updateRetrospective: async (
    retrospectiveId: string,
    data: { title?: string; isActive?: boolean },
  ): Promise<Retrospective> => {
    try {
      const response = await API.patch(`/api/Retrospective/${retrospectiveId}`, data)
      return response.data
    } catch (error) {
      console.error("Error updating retrospective:", error)
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

  // Get created retrospectives
  getCreatedRetrospectives: async (): Promise<RetrospectiveResponse[]> => {
    try {
      const response = await API.get(`/api/Retrospective/created`)
      return response.data
    } catch (error) {
      console.error("Error fetching created retrospectives:", error)
      throw error
    }
  },

  // Get joined retrospectives
  getJoinedRetrospectives: async (): Promise<RetrospectiveResponse[]> => {
    try {
      const response = await API.get(`/api/Retrospective/joined`)
      return response.data
    } catch (error) {
      console.error("Error fetching joined retrospectives:", error)
      throw error
    }
  },

  // Get retrospective stats
  getRetrospectiveStats: async (): Promise<any> => {
    try {
      const response = await API.get(`/api/Retrospective/stats`)
      return response.data
    } catch (error) {
      console.error("Error fetching retrospective stats:", error)
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
  getGroupItem: async (retrospectiveId: string, itemId: number): Promise<GroupItem> => {
    try {
      const response = await API.get(`/api/retrospectives/${retrospectiveId}/items/${itemId}`)
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
    retrospectiveId: string,
    itemId: number,
    data: UpdateGroupItemRequest,
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
  deleteGroupItem: async (retrospectiveId: string, itemId: number): Promise<void> => {
    try {
      await API.delete(`/api/retrospectives/${retrospectiveId}/items/${itemId}`)
    } catch (error) {
      console.error("Error deleting group item:", error)
      throw error
    }
  },

  // Move a group item
  moveGroupItem: async (retrospectiveId: string, itemId: number, data: MoveGroupItemRequest): Promise<GroupItem> => {
    try {
      const response = await API.put(`/api/retrospectives/${retrospectiveId}/items/${itemId}/move`, data)
      return response.data
    } catch (error) {
      console.error("Error moving group item:", error)
      throw error
    }
  },

  // Convert a group item to an action item
  convertToAction: async (retrospectiveId: string, itemId: number, data: ConvertToActionRequest): Promise<any> => {
    try {
      const response = await API.post(`/api/retrospectives/${retrospectiveId}/items/${itemId}/convert-to-action`, data)
      return response.data
    } catch (error) {
      console.error("Error converting group item to action:", error)
      throw error
    }
  },

  // Get comments for a group item
  getComments: async (retrospectiveId: string, groupItemId: number): Promise<Comment[]> => {
    try {
      const response = await API.get(`/api/retrospectives/${retrospectiveId}/items/${groupItemId}/comments`)
      return response.data
    } catch (error) {
      console.error("Error fetching comments:", error)
      throw error
    }
  },

  // Get specific comment
  getComment: async (retrospectiveId: string, groupItemId: number, commentId: number): Promise<Comment> => {
    try {
      const response = await API.get(
        `/api/retrospectives/${retrospectiveId}/items/${groupItemId}/comments/${commentId}`,
      )
      return response.data
    } catch (error) {
      console.error("Error fetching comment:", error)
      throw error
    }
  },

  // Create a new comment
  createComment: async (retrospectiveId: string, groupItemId: number, data: CreateCommentRequest): Promise<Comment> => {
    try {
      const response = await API.post(`/api/retrospectives/${retrospectiveId}/items/${groupItemId}/comments`, data)
      return response.data
    } catch (error) {
      console.error("Error creating comment:", error)
      throw error
    }
  },

  // Update comment
  updateComment: async (
    retrospectiveId: string,
    groupItemId: number,
    commentId: number,
    data: CreateCommentRequest,
  ): Promise<Comment> => {
    try {
      const response = await API.put(
        `/api/retrospectives/${retrospectiveId}/items/${groupItemId}/comments/${commentId}`,
        data,
      )
      return response.data
    } catch (error) {
      console.error("Error updating comment:", error)
      throw error
    }
  },

  // Delete a comment
  deleteComment: async (retrospectiveId: string, groupItemId: number, commentId: number): Promise<void> => {
    try {
      await API.delete(`/api/retrospectives/${retrospectiveId}/items/${groupItemId}/comments/${commentId}`)
    } catch (error) {
      console.error("Error deleting comment:", error)
      throw error
    }
  },

  // Vote for a group item - returns vote count
  voteForGroupItem: async (groupItemId: number): Promise<VoteCountResponse> => {
    try {
      const response = await API.post(`/api/GroupItemVote`, { groupItemId })
      return response.data
    } catch (error) {
      console.error("Error voting for group item:", error)
      throw error
    }
  },

  // Get vote count for a group item - returns just the count number
  getVotesForGroupItem: async (groupItemId: number): Promise<number> => {
    try {
      const response = await API.get(`/api/GroupItemVote/group-items/${groupItemId}/votes/count`)
      return response.data
    } catch (error) {
      console.error("Error getting votes for group item:", error)
      return 0
    }
  },

  // Remove a specific vote by vote ID
  removeVote: async (voteId: number): Promise<void> => {
    try {
      await API.delete(`/api/GroupItemVote/${voteId}`)
    } catch (error) {
      console.error("Error removing vote:", error)
      throw error
    }
  },

  // Get user's votes for a group item (to get vote IDs for removal)
  getUserVotesForGroupItem: async (groupItemId: number, userId: string): Promise<Vote[]> => {
    try {
      // This endpoint might need to be implemented on backend
      // For now, we'll simulate it
      console.warn("getUserVotesForGroupItem not implemented on backend")
      return []
    } catch (error) {
      console.error("Error getting user votes for group item:", error)
      return []
    }
  },

  // Get action items for a retrospective
  getActionItems: async (retrospectiveId: string): Promise<ActionItem[]> => {
    try {
      const response = await API.get(`/api/ActionItem/by-retrospective/${retrospectiveId}`)
      return response.data
    } catch (error) {
      console.error("Error fetching action items:", error)
      throw error
    }
  },

  // Get a specific action item
  getActionItem: async (actionId: string): Promise<ActionItem> => {
    try {
      const response = await API.get(`/api/ActionItem/${actionId}`)
      return response.data
    } catch (error) {
      console.error("Error fetching action item:", error)
      throw error
    }
  },

  // Create a new action item
  createActionItem: async (data: CreateActionItemRequest): Promise<ActionItem> => {
    try {
      const response = await API.post(`/api/ActionItem`, data)
      return response.data
    } catch (error) {
      console.error("Error creating action item:", error)
      throw error
    }
  },

  // Update an action item
  updateActionItem: async (actionId: string, data: UpdateActionItemRequest): Promise<ActionItem> => {
    try {
      const response = await API.patch(`/api/ActionItem/${actionId}`, data)
      return response.data
    } catch (error) {
      console.error("Error updating action item:", error)
      throw error
    }
  },

  // Delete an action item
  deleteActionItem: async (actionId: string): Promise<void> => {
    try {
      await API.delete(`/api/ActionItem/${actionId}`)
    } catch (error) {
      console.error("Error deleting action item:", error)
      throw error
    }
  },

  // Get comments for an action item
  getActionItemComments: async (actionItemId: number): Promise<ActionItemComment[]> => {
    try {
      const response = await API.get(`/api/ActionItemComment/action-item/${actionItemId}`)
      return response.data
    } catch (error) {
      console.error("Error fetching action item comments:", error)
      throw error
    }
  },

  // Get specific action item comment
  getActionItemComment: async (id: number): Promise<ActionItemComment> => {
    try {
      const response = await API.get(`/api/ActionItemComment/${id}`)
      return response.data
    } catch (error) {
      console.error("Error fetching action item comment:", error)
      throw error
    }
  },

  // Create a new action item comment
  createActionItemComment: async (data: { actionItemId: number; content: string }): Promise<ActionItemComment> => {
    try {
      const response = await API.post(`/api/ActionItemComment`, data)
      return response.data
    } catch (error) {
      console.error("Error creating action item comment:", error)
      throw error
    }
  },

  // Update action item comment
  updateActionItemComment: async (id: number, data: { content: string }): Promise<ActionItemComment> => {
    try {
      const response = await API.put(`/api/ActionItemComment/${id}`, data)
      return response.data
    } catch (error) {
      console.error("Error updating action item comment:", error)
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

  // Remove all votes by a user for a specific item
  removeAllVotesForItem: async (groupItemId: number): Promise<VoteCountResponse> => {
    try {
      // This would need to be implemented on backend
      console.warn("removeAllVotesForItem not implemented on backend")
      return { count: 0 }
    } catch (error) {
      console.error("Error removing all votes for item:", error)
      return { count: 0 }
    }
  },

  // Get all votes for a group item (including user info)
  getAllVotesForGroupItem: async (groupItemId: number): Promise<Vote[]> => {
    try {
      // This would need to be implemented on backend
      // For now, return empty array
      console.warn("getAllVotesForGroupItem not implemented on backend")
      return []
    } catch (error) {
      console.error("Error getting all votes for group item:", error)
      throw error
    }
  },
}
