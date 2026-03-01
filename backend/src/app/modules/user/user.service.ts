import { prisma } from '../../../shared/prisma';
import { ICreateUser } from './user.interface';

// Local Database Services
const createLocalUser = async (data: ICreateUser) => {
  const result = await prisma.user.create({
    data
  });
  return result;
};

const getLocalUsers = async () => {
  const result = await prisma.user.findMany({
  });
  return result;
};



export const UserServices = {
  // Local
  createLocalUser,
  getLocalUsers
};
