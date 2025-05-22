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
  //#region AUTH
  AUTH: {
    name: 'authentication',
    displayName: 'Authen',
    parent: 'Bảo mật',
  },
};
