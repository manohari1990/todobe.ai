export const DEFAULT_PAGE_LIMIT = 10
export const DEFAULT_SORT_BY = 'todo_id'
export const DEFAULT_ORDER = 'DESC'

export const allowedSortFields = [
    'title',
    'created_at',
    'priority',
    'due_date'
]

export const NEW_UPDATE_TODO_RETURN_FROM_DB = [
    "todo_id",
    "title",
    "details",
    "status",
    "due_date",
    "priority",
    "user_id"
]

export const NEW_UPDATE_USER_RETURN_FROM_DB = [
    "user_id",
    "username",
    "first_name",
    "last_name",
    "email",
    "phone",
    "user_status",
    "profile_image"
]