export class topicStatusRequest{
  email: string = "";
  topic_id: any = "";

  constructor(email : string, topic_id: any){
    this.email = email;
    this.topic_id = topic_id;
  }

}
