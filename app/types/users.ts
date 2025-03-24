export type Asset = {
  id: string;
  name: string;
  url: string;
};

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  avatar: Asset;
};
