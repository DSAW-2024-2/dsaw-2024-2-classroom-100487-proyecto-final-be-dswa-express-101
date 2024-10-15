import sign from 'jsonwebtoken/sign.js';
import { userRegSchema } from '../lib/validators.js';
import usersModel from '../models/users.js';

class authController {
  static async login(req, res) {
    try {
      const authData = req.body;
      const user = await usersModel.existUser(authData);
      const userId = user.docs[0].id;
      const token = sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1h',
      });
      //   res.cookie('authToken', token, {
      //     httpOnly: true,
      //     secure: true,
      //   });
      res.status(200).json({ message: 'Successful login', accessToken: token });
    } catch (error) {
      if (error.message === "This user doesn't exists") {
        return res.status(403).json({ message: "This user doesn't exists" });
      }
      return res.status(500).json({ message_error: error.message });
    }
  }

  static async register(req, res) {
    try {
      const authData = req.body;
      const photo = req.file;
      const validData = userRegSchema.safeParse({ ...authData, photo: photo });
      if (!validData.success) {
        return res.status(400).json({
          message: 'Validation error',
          errors: validData.error.format(),
        });
      }

      await usersModel.postUser(authData, photo);

      const token = sign(
        { email: authData.id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1h' }
      );
      res
        .status(200)
        .json({ message: 'User correctly created', accessToken: token });
    } catch (error) {
      if (error.message === 'This Email Already Exists') {
        return res.status(409).json({
          message: 'This Email Already Exists',
        });
      } else if (error.message === 'This ID Already Exists') {
        return res.status(409).json({
          message: 'This ID Already Exists',
        });
      }

      return res.status(500).json({ message_error: error.message });
    }
  }
}

export default authController;