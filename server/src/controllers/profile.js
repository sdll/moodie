import User from "../models/user";
import {
  itemNotFound,
  yieldError,
  yieldSuccess,
  checkID,
  handleError
} from "../middleware/utils";
import { matchedData } from "express-validator";
import { checkPassword } from "../middleware/auth";
import appConfig from "../config";

const getProfileFromDB = async id => {
  return new Promise((resolve, reject) => {
    User.findById(id, "-_id -updatedAt -createdAt", (err, user) => {
      itemNotFound(err, user, reject, appConfig.errors.NOT_FOUND);
      resolve(user);
    });
  });
};

const updateProfileInDB = async (req, id) => {
  return new Promise((resolve, reject) => {
    User.findByIdAndUpdate(
      id,
      req,
      {
        new: true,
        runValidators: true,
        select: "-role -_id -updatedAt -createdAt"
      },
      (err, user) => {
        itemNotFound(err, user, reject, appConfig.errors.NOT_FOUND);
        resolve(user);
      }
    );
  });
};

const findUser = async id => {
  return new Promise((resolve, reject) => {
    User.findById(id, "password email", (err, user) => {
      itemNotFound(err, user, reject, appConfig.errors.USER_DOES_NOT_EXIST);
      resolve(user);
    });
  });
};

const passwordsDoNotMatch = async () => {
  return new Promise(resolve => {
    resolve(yieldError(409, appConfig.errors.WRONG_PASSWORD));
  });
};

const changePasswordInDB = async (id, req) => {
  return new Promise((resolve, reject) => {
    User.findById(id, "+password", (err, user) => {
      itemNotFound(err, user, reject, appConfig.errors.NOT_FOUND);

      // Assigns new password to user
      user.password = req.newPassword;

      // Saves in DB
      user.save(error => {
        if (err) {
          reject(yieldError(422, error.message));
        }
        resolve(yieldSuccess(appConfig.success.PASSWORD_CHANGED));
      });
    });
  });
};

export async function getProfile(req, res) {
  try {
    const id = await checkID(req.user._id);
    res.status(200).json(await getProfileFromDB(id));
  } catch (error) {
    handleError(res, error);
  }
}

export async function updateProfile(req, res) {
  try {
    const id = await checkID(req.user._id);
    req = matchedData(req);
    console.log(req);
    res.status(200).json(await updateProfileInDB(req, id));
  } catch (error) {
    handleError(res, error);
  }
}
export async function changePassword(req, res) {
  try {
    const id = await checkID(req.user._id);
    const user = await findUser(id);
    req = matchedData(req);
    const isPasswordMatch = await checkPassword(req.oldPassword, user);
    if (!isPasswordMatch) {
      handleError(res, await passwordsDoNotMatch());
    } else {
      res.status(200).json(await changePasswordInDB(id, req));
    }
  } catch (error) {
    handleError(res, error);
  }
}
