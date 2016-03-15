validatePost = function(post){
  var errors = {};
  if(!post.title){
    errors.title = "Pls fill title";
  }
  if(!post.url){
    errors.url = "Pls fill URL";
  }
  return errors;
}
Posts = new Mongo.Collection('posts');

Posts.allow({
  update: function(userId,post){return ownsDocument(userId,post);},
  remove: function(userId,post){return ownsDocument(userId,post);}
});

Posts.deny({
  update: function(userId,post,fieldNames,modifier){
    var errors = validatePost(modifier.$set);
    return errors.title || errors.url;
  }
});

Meteor.methods({
  postInsert: function(postAttributes){
    check(Meteor.userId(),String);
    check(postAttributes,{
      title: String,
      url: String
    });

    var errors = validatePost(postAttributes);
    if(errors.title || errors.url){
      throw new Meteor.Error('invalid-post',"You must fill url and title.");
    }

    var postWithSameLink = Posts.findOne({url: postAttributes.url});
    if(postWithSameLink){
      return {
        postExists: true,
        _id: postWithSameLink._id
      }
    }

    var user = Meteor.user();
    var post = _.extend(postAttributes,{
      userId: user._id,
      author: user.username,
      submitted: new Date()
    });
    var postId = Posts.insert(post);
    return {
      _id: postId
    }
  }
});
