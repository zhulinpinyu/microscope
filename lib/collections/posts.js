Posts = new Mongo.Collection('posts');
Posts.allow({
  insert: function(userId,doc){
    //only login user add post
    return !!userId;
  }
});