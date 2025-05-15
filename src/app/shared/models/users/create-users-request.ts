export class CreateUserRequest {
  admin: string = "";
  first_name: string = "";
  last_name: string = "";
  email: string = "";
  topic: string[] = [];
  topic_names: string[] = [];
  referrer: string = "";
  language: string = "";

  constructor(
    admin: string = "",
    first_name: string = "",
    last_name: string = "",
    email: string = "",
    topic: string[] = [],
    topic_names: string[] = [],
    referrer: string = "",
    language: string = ""
  ) {
    this.admin = admin;
    this.first_name = first_name;
    this.last_name = last_name;
    this.email = email;
    this.topic = topic;
    this.topic_names = topic_names
    this.referrer = referrer;
    this.language = language;
  }
}
