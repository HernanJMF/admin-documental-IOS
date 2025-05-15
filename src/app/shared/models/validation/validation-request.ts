export class ValidationRequest {
  email : string = "";
  confirmation_code: string = "";
  action: string = "";

  constructor(
    email : string = "",
    confirmation_code: string = "",
    action: string = "",
  ) {
    this.email = email;
    this.confirmation_code = confirmation_code;
    this.action = action
  }
}

{

}
