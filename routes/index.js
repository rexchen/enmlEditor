exports.index = function(req, res){
    res.render('index', {
        layout: 'layouts/layout',
        title: 'Express'
    });
};