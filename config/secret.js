module.exports = {

	// database: "mongodb://localhost/spotask",
	database: "mongodb://root:abc123@ds057214.mongolab.com:57214/spotaskv1",
	sessionSecret: "This is my secret mofo",

	facebook: {
    	clientID: process.env.FACEBOOK_ID || '551868951633664',
    	clientSecret: process.env.FACEBOOK_SECRET || '2a43b63afc28ca57b8ad70e21c68f505',
    	profileFields: ['emails', 'displayName'],
    	callbackURL: '/auth/facebook/callback',
    	passReqToCallback: true

  	}

}
