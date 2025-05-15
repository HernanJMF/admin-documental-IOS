export class registerRequest{
  first_name: string = "";
  last_name: string = "";
  email: string = "";
  password: string = "";
  topic: [] = [];
  referrer: string = "";
  language: string = "";
  plan: string = "";

  constructor( first_name: string,
               last_name: string,
               email: string,
               password: string,
               topic: any,
               referrer: string,
               language: string,
               plan: string
               ){
    this.first_name = first_name;
    this.last_name = last_name;
    this.email = email
    this.password = password;
    this.topic = topic;
    this.referrer = referrer;
    this.language = language;
    this.plan = plan
  }
}
