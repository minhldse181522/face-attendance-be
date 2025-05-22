const authRoot = 'auth';
const humanRoot = 'user';
const branchRoot = 'branch';
const positionRoot = 'position';
const dropdown = 'dropdown';

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
  // #region Human
  // Khai báo các đường dẫn api trong đây, ví dụ
  /**
   * Đường dẫn liên quan đến lương của nhân sự
   * GET /human/get-salary        => Lấy danh sách
   * GET /human/get-salary/:id    => Lấy 1 bản ghi
   * PUT /human/get-salary/:id    => Cập nhật
   * DELETE /human/get-salary/:id => Xóa
   */
  user: {
    ...baseRoutes(`${humanRoot}`),
  },
  branch: {
    ...baseRoutes(`${branchRoot}`),
  },
  position: {
    ...baseRoutes(`${positionRoot}`),
  },
  // #endregion
  // #region Dropdown
  dropdown: {
    user: {
      ...baseRoutes(`${dropdown}/dropdown-user`),
    },
    position: {
      ...baseRoutes(`${dropdown}/dropdown-position`),
    },
    branch: {
      ...baseRoutes(`${dropdown}/dropdown-branch`),
    },
  },
  // #endregion
  // Specific
  auth: {
    root: authRoot,
    login: `/${authRoot}/login`,
    register: `/${authRoot}/register`,
  },
};
