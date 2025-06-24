const authRoot = 'auth';
const humanRoot = 'user';
const roleRoot = 'role';
const branchRoot = 'branch';
const positionRoot = 'position';
const dropdown = 'dropdown';
const formRoot = 'form';
const formDescriptionRoot = 'form-description';
const userBranchRoot = 'user-branch';
const userContractRoot = 'user-contract';
const workingScheduleRoot = 'working-schedule';
const shiftRoot = 'shift';
const timeKeepingRoot = 'time-keeping';
const businessRoot = 'business';
const uploadRoot = 'upload';
const dtRoot = 'tac-vu';
/**
 * Tạo các route cơ bản (GET one, UPDATE, DELETE) theo root truyền vào.
 * @param root - Đường dẫn gốc của resource (ví dụ: 'human/get-salary')
 * @returns Object chứa các route chuẩn REST
 */
const baseRoutes = (root: string) => {
  return {
    root,
    getOne: `/${root}/:id`,
    update: `/${root}/:id`,
    delete: `/${root}/:id`,
  };
};

// API version
const v1 = 'v1';

export const routesV1 = {
  version: v1,
  // #region TacVu
  // Khai báo các đường dẫn api trong đây, ví dụ
  /**
   * Đường dẫn liên quan đến lương của nhân sự
   * GET /human/get-salary        => Lấy danh sách
   * GET /human/get-salary/:id    => Lấy 1 bản ghi
   * PUT /human/get-salary/:id    => Cập nhật
   * DELETE /human/get-salary/:id => Xóa
   */
  tacVu: {
    user: {
      ...baseRoutes(`${humanRoot}`),
    },
    role: {
      ...baseRoutes(`${roleRoot}`),
    },
    branch: {
      ...baseRoutes(`${branchRoot}`),
    },
    position: {
      ...baseRoutes(`${positionRoot}`),
    },
    form: {
      ...baseRoutes(`${formRoot}`),
    },
    formDescription: {
      ...baseRoutes(`${formDescriptionRoot}`),
    },
    formDescriptionFiter: {
      ...baseRoutes(`${formDescriptionRoot}/filter`),
    },
    userBranch: {
      ...baseRoutes(`${userBranchRoot}`),
    },
    userContract: {
      ...baseRoutes(`${userContractRoot}`),
      detail: `/${userContractRoot}/:id`,
    },
    workingSchedule: {
      ...baseRoutes(`${workingScheduleRoot}`),
    },
    shift: {
      ...baseRoutes(`${shiftRoot}`),
    },
    timeKeeping: {
      ...baseRoutes(`${timeKeepingRoot}`),
    },
    faceReference: {
      ...baseRoutes(`${dtRoot}/face-reference`),
    },
  },
  // #endregion
  // #region Bussiness Logic
  businessLogic: {
    user: {
      ...baseRoutes(`${businessRoot}/get-user-with-active-contract`),
      fullUserInfor: `${businessRoot}/get-user-with-full-infor`,
    },
    userBranch: {
      ...baseRoutes(`${userBranchRoot}`),
    },
    userContract: {
      ...baseRoutes(`${userContractRoot}`),
      byUserCode: `/${businessRoot}/by-user-code/:userCode`,
      createContract: `/${businessRoot}/create-contract-with-branch`,
    },
    lichLamViec: {
      userByManagement: `${businessRoot}/user-by-management`,
      workingSchedule: `${businessRoot}/lich-lam`,
      lichLam: `${businessRoot}/tao-lich-lam`,
      lichChamCong: `${businessRoot}/lich-cham-cong`,
      chamCong: `${businessRoot}/cham-cong/:id`,
    },
  },
  // #endregion
  // #region Dropdown
  dropdown: {
    user: {
      ...baseRoutes(`${dropdown}/dropdown-user`),
    },
    role: {
      ...baseRoutes(`${dropdown}/dropdown-role`),
    },
    position: {
      ...baseRoutes(`${dropdown}/dropdown-position`),
    },
    branch: {
      ...baseRoutes(`${dropdown}/dropdown-branch`),
    },
    shift: {
      ...baseRoutes(`${dropdown}/dropdown-shift`),
    },
  },
  // #endregion
  //#region upload
  upload: {
    root: uploadRoot,

    directUpload: `/${uploadRoot}/direct-upload`,
    download: `/${uploadRoot}/download`,

    createSignedUrl: `/${uploadRoot}/create-signed-url`,
    getObject: `/${uploadRoot}/get-object`,
    moveObject: `/${uploadRoot}/move-object`,
    deleteObject: `/${uploadRoot}/delete-object`,

    // createImageStorage: `/${uploadRoot}/create-image-storage`,
    // updateImageStorage: `/${uploadRoot}/update-image-storage/:id`,
    // deleteImageStorage: `/${uploadRoot}/delete-image-storage/:id`,
    // getOneImageStorage: `/${uploadRoot}/get-one-image-storage/:id`,
    // getAllImageStorages: `/${uploadRoot}/get-all-image-storages`,
  },
  //#endregion

  // Specific
  auth: {
    root: authRoot,
    login: `/${authRoot}/login`,
    register: `/${authRoot}/register`,
    refreshToken: `${authRoot}/refresh-token`,
    logout: `${authRoot}/logout`,
  },
};
