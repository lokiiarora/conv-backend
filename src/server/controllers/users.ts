import User from "../models/user";

const login = (username: string, password: string): Promise<any> => {
  return User.findOne({ username: username }).then(
    (user: any) => (!user ? Promise.reject("User not found.") : user)
  );
};

export { login };
