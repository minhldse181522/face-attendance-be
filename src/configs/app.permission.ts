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
  //#endregion
  //#region AUTH
  AUTH: {
    name: 'authentication',
    displayName: 'Authen',
    parent: 'Bảo mật',
  },
};
