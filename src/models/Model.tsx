type Credential = {
  id: string;
  title: string;
  username: string;
  password: string;
};

type Folder = {
  id: string;
  name: string;
  credentials: Credential[];
};
