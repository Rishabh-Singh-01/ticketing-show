export interface GenericErrorInterface {
  status: string;
  errors: {
    field: string;
    message: string;
  }[];
}

export interface CurrentUserResponse {
  currentUser: {
    email: string;
    id: string;
  };
}
