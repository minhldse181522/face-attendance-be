export const resourceScopes = {
  CREATE: 'create',
  VIEW: 'view',
  UPDATE: 'update',
  DELETE: 'delete',
};

export const resourcesV1 = {
  //#region HUMAN
  USER: {
    name: 'user', // định danh nội bộ
    displayName: 'Nhân sự', // tên hiển thị trên SWAGGER
    parent: 'Nhân sự', // nhóm parent
  },
  ROLE: {
    name: 'role',
    displayName: 'Vai trò',
    parent: 'Vai trò trong hệ thống',
  },
  BRANCH: {
    name: 'branch',
    displayName: 'Chi nhánh',
    parent: 'Công ty',
  },
  POSITION: {
    name: 'position',
    displayName: 'Chức vụ',
    parent: 'Vị trí trong công ty',
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
  //#region USER_BRANCH
  USER_BRANCH: {
    name: 'USER_BRANCH',
    displayName: 'User Branch Management',
    parent: 'Reference Data',
  },
  //#endregion
};
