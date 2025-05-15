export class DeleteUserRequest {
  username: string = "";
  email: string = "";
  admin: string = "";

  constructor(
    username: string = "",
    email: string = "",
    admin: string = ""
  ) {
    this.username = username;

    this.email = email;
    this.admin = admin;
  }
}
