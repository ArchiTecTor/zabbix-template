Graph.updateAll = function(data){
	for(var i in Graph.graphs){
		Graph.graphs[i].draw(data[Graph.graphs[i].id]);
	}
};


Updater.registerClass({
	id: 'graph', 
	complete: Graph.updateAll,
	completeRegister: function(){}
});

Graph.graphs = [];

Graph.styles = [
	{
		style: '#FFFFCC'
	},
	{
		style: '#FF9933'
	},
	{
		style: '#996633'
	},
	{
		style: '#FF6600'
	},
	{
		style: '#993300'
	},
	{
		style: '#FF6633'
	},
	{
		style: '#CC0000'
	},
	{
		style: '#6666FF',
	},
	{
		style: '#339999',
	},
	{
		style: '#00CC99',
	},
	{
		style: '#66CC66',
	},
	{
		style: '#33FF33',
	}
];

Graph.graphStyles = {
	grayLevel: 'gray',
	greenLevel: 'green',
	yellowLevel: 'yellow',
	redLevel: '#FF3300'
};

Graph.blackListItems = {};

Date.prototype.toTime=function(){
    var hour=this.getHours();
    var mins=this.getMinutes();
    if(hour<10)
        hour='0'+hour;
    if(mins<10)
        mins='0'+mins;
        
    return hour+':'+mins;   
}

Graph.register = function(obj) {
	Graph.graphs.push(obj);
	Updater.registerObj('graph', obj);
}


function Graph(params) {
	this.id = params.id;
	this.canvas = $(params.id);
	if(!$(params.id).length) {
		console.error('failed found id '+this.id+' in creating new Graph');
		return;
	}
	this.width = this.canvas.attr('width');
	this.height = this.canvas.attr('height');
	this.fontSize = 20;
	this.offsetX = this.fontSize * 4;
	this.offsetY = this.fontSize * 1.5;
	this.period = params.period;
	if(params.maxY != undefined)
		this.maxY = params.maxY;
	if(params.minY != undefined)
		this.minY = params.minY;
	this.greenLevel = params.greenLevel;
	this.yellowLevel = params.yellowLevel;
	this.redLevel = params.redLevel;
	this.invert = params.invert;

	this.startDate = params.startDate;
	this.stoptDate = params.stoptDate;
	this.intervalXtics = params.intervalXtics;
	this.postfixY = params.postfixY;
	this.name = params.name;
	this.items = params.items;
	this.disabledItems = {};
	this.drawLoading();
	this.drawName();
	Graph.register(this);
}

Graph.prototype.getShortValue=function(value){
    var types=['','K','M','G','T'];
    var i=0;
    while(value>=1000){
        value=value/1000;
        i++;
    }
    
    if(parseInt(value) < value)
    	value=Number(value).toFixed(1);
    else
    	value=Number(value).toFixed(0);
    return value+types[i];
}

Graph.prototype.drawRulerLines = function() {
	this.canvas.drawRect({
		fillStyle: "black",
		x: this.width/2,
		y: this.height/2,
		width: this.width, 
		height: this.height
	})
	.drawLine({
		strokeStyle: this.getLevelColor(),
		strokeWidth: 4,
		x1: this.width - this.fontSize,
		y1: this.height - this.offsetY,
		x2: this.offsetX,
		y2: this.height - this.offsetY,
		x3: this.offsetX,
		y3: this.fontSize
	});
}

Graph.prototype.getLevelColor = function() {
	var invert = this.invert ? -1 : 1;
	if(invert*this.currentMaxLevel >= invert*this.redLevel || invert*this.currentMaxLevel < invert*this.greenLevel)
		return Graph.graphStyles.redLevel;
	else if(invert*this.currentMaxLevel >= invert*this.yellowLevel)
		return Graph.graphStyles.yellowLevel;
	else if(invert*this.currentMaxLevel >= invert*this.greenLevel)
		return Graph.graphStyles.greenLevel;
	else
		return Graph.graphStyles.grayLevel;
}

Graph.prototype.minMax = function() {
	
	this.currentMaxLevel=0;
	var data=[]; 
	for( var d in this.data) {
		if(!(this.disabledItems[d]))
			data.push(this.data[d]);	
	}
	
	this.maxY = parseFloat(this.maxY != undefined ? this.maxY : data[0][0][1]);
	this.minY = parseFloat(this.minY != undefined ? this.minY : data[0][0][1]);
	for(var i in data){
		var elem = data[i];
		if(this.currentMaxLevel < elem[elem.length-1][1])
			this.currentMaxLevel = elem[elem.length-1][1];
		for(var d in elem) {
			if(this.maxY < parseFloat(elem[d][1]))
				this.maxY = parseFloat(elem[d][1]);
			if(this.minY > parseFloat(elem[d][1]))
				this.minY = parseFloat(elem[d][1]);
		}
	}

	
	this.scaleY = (this.height - this.offsetY - this.fontSize)/(this.maxY - this.minY);
}

Graph.prototype.translateX = function(value) {
	return this.offsetX + (value - this.minX)*this.scaleX;
}

Graph.prototype.translateY = function(value) {
	return this.height - this.offsetY - (value - this.minY)*this.scaleY;
}

Graph.prototype.drawXTick = function(value) {
	var date = new Date(value);
	
	this.canvas.drawLine({
		x1: this.translateX(value),
		y1: this.height - this.offsetY,
		x2: this.translateX(value),
		y2: this.height - this.offsetY*2/3,
		strokeWidth: 4,
		strokeStyle: this.getLevelColor()
	})
	.drawText({
		fillStyle: this.getLevelColor(),
		x: this.translateX(value),
		y: this.height - this.offsetY/2,
		fontSize: this.fontSize,
		fontFamily: "Verdana, sans-serif",
		text: date.toTime()
	});
}

Graph.prototype.drawYTick = function(value, options) {
	this.canvas.drawLine({
		x1: this.offsetX,
		y1: this.translateY(value),
		x2: this.offsetX - this.fontSize/2,
		y2: this.translateY(value),
		strokeWidth: 4,
		strokeStyle: this.getLevelColor()
	});
	var params = {
		fillStyle: this.getLevelColor(),
		x: this.fontSize*3/2,
		y: this.translateY(value),
		fontSize: this.fontSize,
		fontFamily: "Verdana, sans-serif",
		text: this.getShortValue(value)
	};

	if(options){
		if(options.postfix)
			params.text = params.text + options.postfix;
	}
	this.canvas.drawText(params);
}


Graph.prototype.drawXLegent = function() {
	
	var date = new Date(this.maxX);
	date.setMinutes(date.getMinutes() - date.getMinutes() % Math.ceil(this.intervalXtics / 60));
	date.setSeconds(date.getSeconds() - date.getSeconds() % Math.ceil(this.intervalXtics))
	var stopTime = date.getTime();
    
    var startTime = new Date(this.minX).getTime();

    for(var i=stopTime; i>=startTime; i -= this.intervalXtics*1000){
        this.drawXTick(i);
    }
}

Graph.prototype.drawName = function(){
	this.canvas.drawText(
	    {
			fillStyle: this.getLevelColor(),
			x: (this.width - this.fontSize*3)/2 + this.fontSize*3,
			y: this.fontSize,
			fontSize: this.fontSize * 2,
			fontFamily: "Verdana, sans-serif",
			text: this.name
		}
	);
}

Graph.prototype.drawYLegent = function() {
	this.drawYTick(this.minY);
	this.drawYTick(this.maxY - (this.maxY - this.minY)/4);
	this.drawYTick(this.maxY - (this.maxY - this.minY)*2/4);
	this.drawYTick(this.maxY - (this.maxY - this.minY)*3/4);
	options = {};
	if(this.postfixY)
		options['postfix'] = this.postfixY;
	this.drawYTick(this.maxY, options);

	
}

Graph.prototype.drawYLevel = function(y, start, stop, linesize, color){
	
	for(var i=start; i<stop; i=i+linesize*2){
		this.canvas.drawLine({
			'x1': i,
			'y1': y,
			'x2': i + linesize,
			'y2': y,
			'strokeStyle': color,
			'strokeWidth': 1
		});
	}
}

Graph.prototype.drawYLevels = function() {
	var lineSize = Math.ceil((this.width - this.offsetX - this.fontSize) / 50);
	var start = this.offsetX;
	var stop = this.width - this.fontSize;
	if(this.yellowLevel != null && this.maxY >= this.yellowLevel){
		this.drawYLevel(this.translateY(this.yellowLevel), start, stop, lineSize, Graph.graphStyles.yellowLevel);
	}

	if(this.redLevel != null && this.maxY >= this.redLevel){
		this.drawYLevel(this.translateY(this.redLevel), start, stop, lineSize, Graph.graphStyles.redLevel);
	}
}

Graph.prototype.drawGraphLine = function(data, index) {
	var obj = {
		strokeWidth: 4,
		strokeStyle: Graph.styles[index].style
	};
	
	var counter = 1;
	var cxcounter = 1;
	
	var ncounter = 0;

	for(var i=0; i<data.length; i++) {
		
		
		var time = parseInt(data[i][0])*1000;
		
		var nameX;
		var nameY;
		if(ncounter==0){
			nameX = 'x'+counter;
			nameY = 'y'+counter;
			counter++;
		}
		else if(ncounter == 1 || ncounter == 2){
			nameX = 'cx'+cxcounter;
			nameY = 'cy'+cxcounter;
			cxcounter++;	
		}
		
		ncounter++;
		if(ncounter > 0)
			ncounter=0;
		
		obj[nameX] = this.translateX(time);
		obj[nameY] = this.translateY(parseFloat(data[i][1]));
		
	}

	
	//this.canvas.drawQuadratic(obj);
	//this.canvas.drawBezier(obj);
	this.canvas.drawLine(obj);
}

Graph.prototype.getParams = function(){

	//if(!this.canvas.is(':visible'))
	//	return null;
	var items_ids = [];
	for(var item in this.items){
		items_ids.push(this.items[item].id); 
	}
	var obj = {
		id: this.id,
		items: items_ids
	};
	
	if(this.startDate)
		obj['start_date'] = this.startDate ;
	if(this.stopDate)
		obj['stopt_date'] = this.stoptDate;
	if(this.period)
		obj['period'] = this.period;
	return obj;
}

Graph.prototype.getRegisterParams = function(){

	for(var i in this.items) {
		var obj = this.items[i].type = 'item';
	}
	return this.items;
}

Graph.prototype.drawLoading = function(data) {
	var font = this.fontSize*4;
	this.canvas.drawText({
		fillStyle: Graph.graphStyles.grayLevel,
		x: (this.width - this.offsetX)/2 + this.offsetX,
		y: this.height/2,
		fontSize: font,
		fontFamily: "Verdana, sans-serif",
		text: '...loading...'
	});	
}

Graph.prototype.drawNoData = function(data) {
	var font = this.fontSize*4;
	this.canvas.drawText({
		fillStyle: Graph.graphStyles.grayLevel,
		x: (this.width - this.offsetX)/2 + this.offsetX,
		y: this.height/2,
		fontSize: font,
		fontFamily: "Verdana, sans-serif",
		text: 'NO DATA!'
	});	
}

Graph.prototype.completeRegister = function(){};

Graph.prototype.updateTimes = function(){
	var currentDate = new Date();	
	this.maxX = this.stoptDate ? this.stopDate : currentDate.getTime();
	this.minX = this.startDate ? this.startDate : currentDate.getTime() - this.period*1000;
	this.scaleX = (this.width - this.offsetX - this.fontSize)/(this.maxX - this.minX);

}

Graph.prototype.disableItem = function(id){
	this.disabledItems[id]=1;
}
Graph.prototype.enableItem = function(id){
	delete this.disabledItems[id];
}

Graph.prototype.onGreen = function(){

}
Graph.prototype.onRed = function(){
	
}
Graph.prototype.onYellow = function(){
	
}
Graph.prototype.updateStatus = function(){
	var invert = this.invert ? -1 : 1;
	var level = this.currentMaxLevel < this.redLevel && this.currentMaxLevel >= this.yellowLevel ? 1 : ((this.currentMaxLevel >= this.redLevel) || (this.currentMaxLevel < this.greenLevel) ? 2 : 0);
	if(this.currentStatus == null){
		this.currentStatus = level;
		if(this.currentStatus == 2){
			this.onRed();
		}
		else if(this.currentStatus == 1){
			this.onYellow();
		}
		return;
	}

	if((this.currentStatus == 0 || this.currentStatus == 1) && level == 2) {
		this.currentStatus = 2;
		this.onRed();
	}
	else if((this.currentStatus == 2 || this.currentStatus == 1) && level == 0) {
		this.currentStatus = 0;
		this.onGreen();
	}
	else if((this.currentStatus == 2 || this.currentStatus == 0) && level == 1) {
		this.currentStatus = 1;
		this.onYellow();
	}

}


Graph.prototype.draw = function(data) {
	if(data != undefined)
		this.data = data;
	this.canvas.clearCanvas();
	
	
	this.updateTimes();
	if(this.data!=null){
		this.minMax();
		this.drawRulerLines();
		
		this.drawYLegent();
		this.drawYLevels();
		this.drawName();
		for(var d in this.data){
			if(!(this.disabledItems[d]))
				this.drawGraphLine(this.data[d], d);
		}
		this.updateStatus();
	}
	else {
		this.currentMaxLevel = -1;
		this.drawRulerLines();
		this.drawName();
		this.drawNoData();
	}
	
	this.drawXLegent();
	this.canvas.draw();

}



function Legend(options){
    options=$.extend({
    	data: null,
    	id: null,
    	graphs: []
    },options);
    
    var container=$('#'+options.id);

    if(container.length==0){
	   console.error('id not found '+options.id);
	   return;
    }
    
    for(var i=0; i<options.data.length; i++){
        
		$('<div class="graph-legend"></div>')
		    .addClass('graph-legend-desc')
		    .html('<span class="graph-legend-example" style="background-color: '+Graph.styles[i].style+'"></span>'+options.data[i].name)
		    .appendTo(container)
	        .data({'graphs': options.graphs, 'itemId': i})
	        .on('click',function(){
	            var graphs = $(this).data('graphs');
	            var itemId = $(this).data('itemId');

	            $(this).toggleClass('disabled');
	            if($(this).hasClass('disabled')){
	                for(var r=0; r<graphs.length; r++){
	                    graphs[r].disableItem(itemId);
	                	graphs[r].draw();
	                }
	            }
	            else{
	                for(var r=0; r<graphs.length; r++){
	                    graphs[r].enableItem(itemId);
	                    graphs[r].draw();
	                }
	            }
	        });
    }
    
}

function ColorChangeLegend(options){
    options=$.extend({
    data: null,
    id: null
    },options);
    
    var container=$('#'+options.id);

    if(container.length==0){
        throw new Error('id not found' + options.id);
    }
    
    for(var i=0; i<options.data.length; i++){
        
    $('<div style="text-align: left"></div>')
        .addClass('graph-legend-desc graph-legend-desc-'+options.data[i].color)
        .html('<span class="graph-legend-example"></span>'+options.data[i].name)
        .appendTo(container)
            .data({items: options.data[i].items})
            .on('click',function(){
                var items=$(this).data('items');
                $(this).toggleClass('disabled');
                
                if($(this).hasClass('disabled')){
                    
                    for(var r=0; r<items.length; r++){
                        Graph.blackListItems[items[r]]=1;
                    }
                    $(this).animate({opacity: 0.3});
                    
                    
                }
                else{
                    for(var r=0; r<items.length; r++){
                        delete Graph.blackListItems[items[r]];
                    }
                    $(this).animate({opacity: 1});
                    
                }
                Updater.update();
            
            });
    }
    
}

Trigger.updateAll = function(data){
	for(var i in Trigger.triggers){
		Trigger.triggers[i].draw(data[Trigger.triggers[i].id]);
	}
};


Updater.registerClass({
	id: 'trigger', 
	complete: Trigger.updateAll,
	completeRegister: function(){}
});
Trigger.triggers = [];

Trigger.register = function(obj) {
	Trigger.triggers.push(obj);
	Updater.registerObj('trigger', obj);
}

function Trigger(params) {
	this.id = params.id;
	this.canvas = $(params.id);
	if(!$(params.id).length) {
		console.error('failed found id '+this.id+' in creating new Trigger');
		return;
	}
	this.width = this.canvas.attr('width');
	this.height = this.canvas.attr('height');
	this.name = params.name;
	this.fontSize = (this.height / 8)*0.9;
	this.interval = params.interval;

	this.trigger = params.trigger;
	
	if (params.onRed)
		this.onRed = params.onRed;
	
	if(params.onGreen)
		this.onGreen = params.onGreen;

	this.currentStatus = null;

	Trigger.register(this);
}

Trigger.prototype.completeRegister = function(){};

Trigger.prototype.drawLegend = function() {
	this.canvas.drawText({
		fillStyle: this.getLevelColor(),
		x: this.width / 2,
		y: this.height - this.fontSize * 0.7,
		fontSize: 'bold '+this.fontSize*1.5+'px',
		fontFamily: "Arial, sans-serif",
		text: this.name
	});
}

Trigger.prototype.onGreen = function(){

}
Trigger.prototype.onRed = function(){
	
}
Trigger.prototype.updateStatus = function(){
	if(this.currentStatus == null){
		this.currentStatus = this.data.status;
		if(this.currentStatus == 1){
			this.onRed();
		}
	}

	if(this.currentStatus == 0 && this.data.status == 1) {
		this.currentStatus = 1;
		this.onRed();
	}
	else if(this.data.old_secs < this.interval){

	}
	else if(this.currentStatus == 1 && this.data.status == 0) {
		this.currentStatus = 0;
		this.onGreen();
	}

}

Trigger.prototype.getLevelColor = function(){
	if(this.data.status == 1)
		return Graph.graphStyles.redLevel;
	else if(this.data.status == 0)
		return Graph.graphStyles.greenLevel;
	else
		return Graph.graphStyles.grayLevel;
};

Trigger.prototype.drawIndicator = function(){
	this.canvas.drawArc({
		fillStyle: this.getLevelColor(),
		x: this.width/2, 
		y: this.width/2,
		radius: this.width/2
	});
	if(this.data.old_secs < this.interval) {
		var sector = Math.ceil((100 - (this.data.old_secs / this.interval)*100) * 3.6);
		this.canvas.drawArc({
			strokeStyle: Graph.graphStyles.yellowLevel,
			strokeWidth: Math.ceil(this.width/10),
			x: this.width/2, 
			y: this.width/2,
			radius: this.width/2.3,
			start: 0,
			end: sector
		});
	}
	

	// this.canvas.drawText({
	// 	fillStyle: '#CCCCCC',
	// 	x: this.width/2,
	// 	y: this.width/2,
	// 	fontSize: this.width/5,
	// 	fontFamily: "Verdana, sans-serif",
	// 	text: this.data.current
	// });

	
};

Trigger.prototype.draw = function(data){
	this.canvas.clearCanvas();
	if(data)
		this.data = data;
	else
		this.data = {};
	this.updateStatus();
	this.drawLegend();
	this.drawIndicator();
	this.canvas.draw();
}


Trigger.prototype.getParams = function(){
	
	var obj = {
		id: this.id,
		trigger: this.trigger
	};

	return obj;
}

Trigger.prototype.getRegisterParams = function(){
	this.trigger.type = 'trigger';
	return this.trigger;
};


function TriggerPanel(params){
	this.triggers = params.triggers;
	this.onGreen = params.onGreen;
	this.onRed = params.onRed;
	
	this.haveRed = 0;

	var panel = this;

	var funcRed = function(){
		panel.haveRed++;
		if(panel.haveRed == 1){
			panel.onRed();
		}
	};

	var funcGreen = function(){
		panel.haveRed--;
		if(panel.haveRed == 0){
			panel.onGreen();
		}
	};

	for(var trigger in this.triggers){
		this.triggers[trigger].onRed = TriggerPanel.createCallback(this.triggers[trigger].onRed, funcRed);
		this.triggers[trigger].onGreen = TriggerPanel.createCallback(this.triggers[trigger].onGreen, funcGreen);
	}
}

TriggerPanel.createCallback = function(oldcb, newcb){
	
	return function(){
		oldcb.call(this);
		newcb.call(this);
	}
}
