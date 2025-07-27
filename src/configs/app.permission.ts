export const resourceScopes = {
  CREATE: 'create',
  VIEW: 'view',
  UPDATE: 'update',
  DELETE: 'delete',
};

export const resourcesV1 = {
  //#region TÁC VỤ
  DT_PATH_FILE: {
    name: 'path_file',
    displayName: 'Đường dẫn file',
    parent: 'Tác vụ',
  },
  USER: {
    name: 'user', // định danh nội bộ
    displayName: 'Nhân sự', // tên hiển thị trên SWAGGER
    parent: 'Tác vụ', // nhóm parent
  },
  ROLE: {
    name: 'role',
    displayName: 'Vai trò',
    parent: 'Tác vụ',
  },
  BRANCH: {
    name: 'branch',
    displayName: 'Chi nhánh',
    parent: 'Tác vụ',
  },
  POSITION: {
    name: 'position',
    displayName: 'Chức vụ',
    parent: 'Tác vụ',
  },
  USER_BRANCH: {
    name: 'USER_BRANCH',
    displayName: 'User Branch Management',
    parent: 'Tác vụ',
  },
  USER_CONTRACT: {
    name: 'USER_CONTRACT',
    displayName: 'User Contract Management',
    parent: 'Tác vụ',
  },
  WORKING_SCHEDULE: {
    name: 'WORKING_SCHEDULE',
    displayName: 'Lịch làm việc',
    parent: 'Tác vụ',
  },
  SHIFT: {
    name: 'SHIFT',
    displayName: 'Ca làm việc',
    parent: 'Tác vụ',
  },
  TIME_KEEPING: {
    name: 'TIME KEEPING',
    displayName: 'Thời gian làm việc',
    parent: 'Tác vụ',
  },
  FACE_REFERENCE: {
    name: 'FACE REFERENCE',
    displayName: 'Lưu trữ khuôn mặt',
    parent: 'Tác vụ',
  },
  PAYROLL: {
    name: 'PAY ROLL',
    displayName: 'Bảng lương',
    parent: 'Tác vụ',
  },
  UPLOAD: {
    name: 'UPLOAD',
    displayName: 'Xử lý ảnh',
    parent: 'Tác vụ',
  },
  //#endregion
  //#region DROPDOWN
  DROP_DOWN_DATA: {
    name: 'drop-down',
    displayName: 'Drop down',
    parent: 'Lựa chọn',
  },
  //#endregion
  //#region AUTH
  AUTH: {
    name: 'authentication',
    displayName: 'Authen',
    parent: 'Bảo mật',
  },
  //#endregion
  //#region FORM
  FORM: {
    name: 'form',
    displayName: 'Đơn',
    parent: 'Quản lý Đơn',
  },
  FORM_DESCRIPTION: {
    name: 'form-description',
    displayName: 'Đơn đã gửi',
    parent: 'Quản lý Đơn',
  },
  //#endregion
  //#region NGHIỆP VỤ
  BS_USER: {
    name: 'user',
    displayName: 'Nhân sự',
    parent: 'Nghiệp vụ',
  },
  BS_USER_BRANCH: {
    name: 'user branch',
    displayName: 'Mã nhân viên thuộc chi nhánh',
    parent: 'Nghiệp vụ',
  },
  BS_LICH_LAM_VIEC: {
    name: 'Lịch làm việc',
    displayName: 'Lịch làm việc cho nhân viên',
    parent: 'Nghiệp vụ',
  },
  BS_BANG_LUONG: {
    name: 'Bảng lương',
    displayName: 'Bảng lương cho nhân viên',
    parent: 'Nghiệp vụ',
  },
};
