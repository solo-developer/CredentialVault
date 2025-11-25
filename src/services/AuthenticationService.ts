import bcrypt from 'react-native-bcrypt';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SaveUserInfo = async (username : string,password :string) => {

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  await AsyncStorage.setItem('@master_password', hashedPassword);
  await AsyncStorage.setItem('@username', username.trim());

};

export const verifyUser = async (username : string,password :string) : Promise<boolean> => {
  const storedHashedPassword = await AsyncStorage.getItem('@master_password');
  const storedUsername = await AsyncStorage.getItem('@username');

  if (username.trim() === storedUsername && storedHashedPassword) {
    const passwordMatch = bcrypt.compareSync(password, storedHashedPassword);
     return passwordMatch;
   
  }
  return false;
};
