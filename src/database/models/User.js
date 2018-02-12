// @flow
import Seqeulize from 'sequelize';
import bcrypt from 'bcryptjs';
import db from 'database/db';
import { generate } from 'lib/jwt';

const UserModel = db.define('user', {
  id: {
    type: Seqeulize.UUID,
    defaultValue: Seqeulize.UUIDV1,
    primaryKey: true,
  },
  username: {
    type: Seqeulize.STRING,
    unique: true,
  },
  email: {
    type: Seqeulize.STRING,
    unique: true,
  },
  password_hash: {
    type: Seqeulize.STRING,
  },
});

UserModel.sync();

export default class User extends UserModel {
  static crypt(password: string): Promise<string> {
    const saltRounds: number = 10;
    return bcrypt.hash(password, saltRounds);
  }

  static getExistancy(type: 'email' | 'username', value: string) {
    return UserModel.findOne({ where: { [type]: value } });
  }

  generateToken() {
    console.log('id: ', this);
    console.log('generate, ', generate);
  }
}
