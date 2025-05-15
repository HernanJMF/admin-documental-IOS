export class topicRequest{
  admin: string = "";
  topic_name: string = "";

  constructor(admin : string, topic_name: string){
    this.admin = admin;
    this.topic_name = topic_name;
  }
}

