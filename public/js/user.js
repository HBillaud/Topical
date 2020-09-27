class User {

    topics;
    following;
    followers;
    profilePic;
    bio;
    userPosts;
    savedPosts;

    constructor(name, userID, email, password) {
        this.name = name;
        this.userID = userID;
        this.email = email;
        this.password = password;
    }

    getName() {
        return this.name;
    }

    setName(name) {
        this.name = name;
    }
    
    getUserID() {
        return this.userID;
    }

    setUserID(userID) {
        this.userID = userID;
    }

    getEmail() {
        return this.email;
    }

    setEmail(email) {
        this.email = email;
    }

    getPassword() {
        return this.password;
    }

    setPassword(password) {
        this.password = password;
    }

    getTopics() {
        return this.topics;
    }

    setTopics(topics) {
        this.topics = topics;
    }

    getFollowing() {
        return this.following;
    }

    setFollowing(following) {
        this.following = following;
    }

    getFollowers() {
        return this.followers;
    }

    setFollowers(followers) {
        this.followers = followers;
    }

    getProfilePic() {
        return this.profilePic;
    }

    setProfilePic(profilePic) {
        this.profilePic = profilePic;
    }

    getBio() {
        return this.bio;
    }

    setBio(bio) {
        this.bio = bio;
    }

    getUserPosts() {
        return this.userPosts;
    }

    setUserPosts(userPosts) {
        this.userPosts = userPosts;
    }

    getSavedPosts() {
        return this.savedPosts;
    }

    setSavedPosts(savedPosts) {
        this.savedPosts = savedPosts;
    }
}

