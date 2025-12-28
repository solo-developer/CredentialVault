import bcrypt from 'react-native-bcrypt';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MASTER_PASSWORD_KEY, MASTER_USERNAME_KEY } from '../Constants';

export const SaveUserInfo = async (username : string,password :string) => {

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  await AsyncStorage.setItem(MASTER_PASSWORD_KEY, hashedPassword);
  await AsyncStorage.setItem(MASTER_USERNAME_KEY, username.trim());

};

export const verifyUser = async (username : string,password :string) : Promise<boolean> => {
  const storedHashedPassword = await AsyncStorage.getItem(MASTER_PASSWORD_KEY);
  const storedUsername = await AsyncStorage.getItem(MASTER_USERNAME_KEY);

  if (username.trim() === storedUsername && storedHashedPassword) {
    const passwordMatch = bcrypt.compareSync(password, storedHashedPassword);
     return passwordMatch;
   
  }
  return false;
};
