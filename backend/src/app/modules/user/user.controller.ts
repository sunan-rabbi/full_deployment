import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { UserServices } from './user.service';

// Local Database Controllers
const createLocalUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await UserServices.createLocalUser(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Local user created successfully!',
    data: result,
  });
});

const getLocalUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await UserServices.getLocalUsers();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Local users retrieved successfully!',
    data: result,
  });
});




export const UserController = {
  // Local
  createLocalUser,
  getLocalUsers,
};
