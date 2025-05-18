export const resourceScopes = {
  CREATE: 'create',
  VIEW: 'view',
  UPDATE: 'update',
  DELETE: 'delete',
};

export const resourceV1 = {
  //#region HUMAN
  SALARY: {
    name: 'salary', // định danh nội bộ
    displayName: 'Lương nhân sự', // tên hiển thị trên SWAGGER
    parent: 'Nhân sự', // nhóm parent
  },
  //#endregion
};
