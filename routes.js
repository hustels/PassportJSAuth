module.exports ={
login: function(){
	app.get('/', function(req, res){
	res.render('default' , {title: 'Auth app with passportJS'});
});
}
}