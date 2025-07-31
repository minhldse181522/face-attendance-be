import { ExceptionBase } from '@src/libs/exceptions';

export class ManagerNotAssignToUserError extends ExceptionBase {
  static readonly message =
    'This manager is not allowed to create working schedule for this user';

  public readonly code = 'MANAGER.NOT_ASSIGN_TO_USER';

  constructor(cause?: Error, metadata?: unknown) {
    super(ManagerNotAssignToUserError.message, cause, metadata);
  }
}

export class UserContractDoesNotExistError extends ExceptionBase {
  static readonly message = 'This user does not have user contract';

  public readonly code = 'USER_CONTRACT.DOES_NOT_EXIST';

  constructor(cause?: Error, metadata?: unknown) {
    super(UserContractDoesNotExistError.message, cause, metadata);
  }
}

export class WorkingDateAlreadyExistError extends ExceptionBase {
  static readonly message = 'This date is already created for this user';

  public readonly code = 'WORKING_DATE.ALREADY_EXIST';

  constructor(cause?: Error, metadata?: unknown) {
    super(WorkingDateAlreadyExistError.message, cause, metadata);
  }
}

export class ChamCongKhongDuDieuKienError extends ExceptionBase {
  static readonly message = 'Condition is not enough';

  public readonly code = 'CHAM_CONG.KHONG_DU_DIEU_KIEN';

  constructor(cause?: Error, metadata?: unknown) {
    super(ChamCongKhongDuDieuKienError.message, cause, metadata);
  }
}

export class CheckInTimeNotInContractError extends ExceptionBase {
  static readonly message = 'Check in time is not in the period of contract';

  public readonly code = 'CHECKIN_TIME.NOT_IN_CONTRACT';

  constructor(cause?: Error, metadata?: unknown) {
    super(CheckInTimeNotInContractError.message, cause, metadata);
  }
}

export class BranchNotBelongToContractError extends ExceptionBase {
  static readonly message = 'Chi nhánh không thuộc về chi nhánh trong hợp đồng';

  public readonly code = 'BRANCH.NOT_BELONG_TO_CONTRACT';

  constructor(cause?: Error, metadata?: unknown) {
    super(BranchNotBelongToContractError.message, cause, metadata);
  }
}

export class AlreadyCheckInError extends ExceptionBase {
  static readonly message = 'Bạn đã checkin cho ngày hôm nay rồi';

  public readonly code = 'TIME_KEEPING.ALREADY_CHECK_IN';

  constructor(cause?: Error, metadata?: unknown) {
    super(AlreadyCheckInError.message, cause, metadata);
  }
}

export class LateCheckInError extends ExceptionBase {
  static readonly message = 'Bạn không được checkin trễ quá 1 tiếng';

  public readonly code = 'TIME_KEEPING.LATE_CHECK_IN';

  constructor(cause?: Error, metadata?: unknown) {
    super(LateCheckInError.message, cause, metadata);
  }
}

export class CheckInTooEarlyError extends ExceptionBase {
  static readonly message = 'Chưa đến giờ checkin, vui lòng quay lại sau';

  public readonly code = 'TIME_KEEPING.CHECK_IN_TOO_EARLY';

  constructor(cause?: Error, metadata?: unknown) {
    super(CheckInTooEarlyError.message, cause, metadata);
  }
}

export class NotGeneratedError extends ExceptionBase {
  static readonly message = 'Không thể tạo lịch làm việc này vì đã quá ca làm';

  public readonly code = 'WORKING_SCHEDULE.NOT_GENERATED';

  constructor(cause?: Error, metadata?: unknown) {
    super(NotGeneratedError.message, cause, metadata);
  }
}
