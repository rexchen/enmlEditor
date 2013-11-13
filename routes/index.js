var Evernote = require('evernote').Evernote;
var config = require('../config.json');
var isProduction = (process.env.NODE_ENV === 'production');
var port = process.env.PORT || 3000;
var callbackUrl = isProduction ? config.PRODUCTION_URL +'oauth_callback' : 'http://localhost:'+ port +'/oauth_callback';

exports.index = function(req, res){
    res.render('index', {
        layout: 'layouts/layout',
        title: 'ENML Editor'
    });
};

// OAuth
exports.oauth = function(req, res) {
    var client = new Evernote.Client({
        consumerKey: config.API_CONSUMER_KEY,
        consumerSecret: config.API_CONSUMER_SECRET,
        sandbox: config.SANDBOX
    });

    client.getRequestToken(callbackUrl, function(error, oauthToken, oauthTokenSecret, results){
        if(error) {
            req.session.error = JSON.stringify(error);
            res.redirect('/');
        }
        else { 
            // store the tokens in the session
            req.session.oauthToken = oauthToken;
            req.session.oauthTokenSecret = oauthTokenSecret;

            // redirect the user to authorize the token
            res.redirect(client.getAuthorizeUrl(oauthToken));
        }
    });
};
 
// OAuth callback
exports.oauth_callback = function(req, res) {
    var client = new Evernote.Client({
        consumerKey: config.API_CONSUMER_KEY,
        consumerSecret: config.API_CONSUMER_SECRET,
        sandbox: config.SANDBOX
    });

    client.getAccessToken(
        req.session.oauthToken, 
        req.session.oauthTokenSecret, 
        req.param('oauth_verifier'), 
        function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
            if(error) {
                console.log('error');
                console.log(error);
                res.redirect('/');
            }
            else {
                // create or get notebook
                var client = new Evernote.Client({
                    token: oauthAccessToken,
                    sandbox: config.SANDBOX
                });
                var noteStore = client.getNoteStore();
                var slideNotebook = '';
                noteStore.listNotebooks(function(err, notebooks){
                    for(var i in notebooks){
                        console.log(notebooks[i].name);
                        if(notebooks[i].name == config.NOTEBOOK_NAME){
                            slideNotebook = notebooks[i];
                        }
                    }
                    if(!slideNotebook){
                        console.log('create notebook');
                        slideNotebook = new Evernote.Notebook();
                        slideNotebook.name = config.NOTEBOOK_NAME;
                        noteStore.createNotebook(slideNotebook, function(err, createdNotebook) {
                            console.log(createdNotebook);
                            req.session.slideNotebook = createdNotebook;

                            // store the access token in the session
                            req.session.oauthAccessToken = oauthAccessToken;
                            req.session.oauthAccessTtokenSecret = oauthAccessTokenSecret;
                            req.session.edamShard = results.edam_shard;
                            req.session.edamUserId = results.edam_userId;
                            req.session.edamExpires = results.edam_expires;
                            req.session.edamNoteStoreUrl = results.edam_noteStoreUrl;
                            req.session.edamWebApiUrlPrefix = results.edam_webApiUrlPrefix;
                            res.redirect('/notes');
                        });
                    }
                    else{
                        console.log('does not create notebook');
                        console.log(slideNotebook);
                        req.session.slideNotebook = slideNotebook;

                        // store the access token in the session
                        req.session.oauthAccessToken = oauthAccessToken;
                        req.session.oauthAccessTtokenSecret = oauthAccessTokenSecret;
                        req.session.edamShard = results.edam_shard;
                        req.session.edamUserId = results.edam_userId;
                        req.session.edamExpires = results.edam_expires;
                        req.session.edamNoteStoreUrl = results.edam_noteStoreUrl;
                        req.session.edamWebApiUrlPrefix = results.edam_webApiUrlPrefix;
                        res.redirect('/notes');
                    }
                });
            }
        }
    );
};
 
// Clear session
exports.logout = function(req, res) {
    req.session.destroy();
    res.redirect('/');
};