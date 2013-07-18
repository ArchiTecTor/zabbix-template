var Updater = {
	
	api_url: '/api/1.0/multigate',
	register_url: '/api/1.0/register',
	interval: 10000,
	
	classes: {},
	
	registerClass: function(params){
		params.objects = [];
		Updater.classes[params.id] = params;
	},
	
	registerObj: function(class_id, obj){
		Updater.classes[class_id].objects.push(obj);
	},
	
	createData: function(reg){
		var request = [];

		for(var c in Updater.classes){
			request.push('c='+c);
			for(var i in Updater.classes[c].objects){
				var params;

				if(!reg) 
					params = Updater.classes[c].objects[i].getParams();
				else
					params = Updater.classes[c].objects[i].getRegisterParams();
				if(params != null)
					request.push(c+'='+encodeURIComponent(JSON.stringify(params)));
			}
		}

		return request.join('&');
	},

	timerGuard: null,

	update: function(){
		$.ajax({
			url: Updater.api_url,
			data: Updater.createData(),
			cache: false,
			type: 'POST',
			dataType: 'json',
			success: function(data){
				for(var c in data.response){
					Updater.classes[c].complete(data.response[c]);
				}
			}
		});
	},
	register: function(){
		$.ajax({
			url: Updater.register_url,
			data: Updater.createData(true),
			cache: false,
			type: 'POST',
			dataType: 'json',
			success: function(data){
				for(var c in data.response){
					Updater.classes[c].completeRegister(data.response[c]);
				}
			}
		});
	},
	start: function(){
		Updater.timerGuard = setInterval(Updater.update, Updater.interval);
		Updater.register();
		Updater.update();
	}
};
