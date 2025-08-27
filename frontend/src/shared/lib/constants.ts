export const DIALOG_TEXTS = {
  CANCEL: 'Hủy',
  SAVE: 'Lưu',
  CREATE: 'Tạo',
  UPDATE: 'Cập nhật',
  LOADING: 'Đang xử lý...',
  ADD: 'Thêm',
  REMOVE: 'Gỡ',
  SEARCH_USERS: 'Tìm kiếm người dùng...',
  SELECT_USER: 'Chọn người dùng:'
} as const

export const VALIDATION_MESSAGES = {
  LIBRARY_NAME_REQUIRED: 'Tên thư viện không được để trống',
  LIBRARY_NAME_TOO_LONG: 'Tên thư viện không được quá 100 ký tự',
  USER_SELECTION_REQUIRED: 'Vui lòng chọn người dùng'
} as const

export const STATUS_MESSAGES = {
  ADDING_USER: 'Đang thêm người dùng...',
  REMOVING_USER: 'Đang gỡ người dùng...',
  CREATING_LIBRARY: 'Đang tạo thư viện...',
  UPDATING_LIBRARY: 'Đang cập nhật thư viện...'
} as const
