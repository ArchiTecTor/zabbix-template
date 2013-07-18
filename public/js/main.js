
var site = {
    intervalSlide: 30000,
    triggerInterval: 300,
    border: 15,

    problems: {}
};

function ReportAlert(panel, id){
    console.info('up alert for '+id);
    if(!site.problems[panel])
        site.problems[panel] = {};
    site.problems[panel][id]=1;
    if(!panel.hasClass('alert')){
        panel.addClass('alert');
        showPanel(panel);
    }
}

function ReportOK(panel, id){
    console.info('down alert for '+id);
    if(site.problems[panel] && site.problems[panel][id])
        delete(site.problems[panel][id]);
    var count=0;
    for(i in site.problems[panel])
        count++;

    if(count == 0)
        panel.removeClass('alert');
}

Graph.prototype.onGreen = function(){
    ReportOK(this.canvas.closest('.panels'), this.id);
}

Graph.prototype.onRed = function(){
    ReportAlert(this.canvas.closest('.panels'), this.id);
}

Trigger.prototype.onGreen = function(){
    ReportOK(this.canvas.closest('.panels'), this.id);
}

Trigger.prototype.onRed = function(){
    ReportAlert(this.canvas.closest('.panels'), this.id);
}



function slidePanel(direction){
    
    if($('.panels').length==1)
        return;
    
    
    var current=$('.panels')
        .filter('.active')
        .removeClass('active');
    var next;
    
    if(!direction){
        next=current.next('.panels');
        if(!next.length)
            next=$('.panels:first');
    }
    else{
        next=current.prev('.panels');
        if(!next.length)
            next=$('.panels:last');
    }

    
    next.addClass('active');
}

function showPanel(panel){
    if($('.panels').length==1)
        return;
    $('.panels')
        .filter('.active')
        .removeClass('active');
    panel.addClass('active');
    restartTimeout();
}

function nextPanel(){
    
    if($('.panels').length==1)
        return;
    
    
    var current=$('.panels')
        .filter('.active')
        .removeClass('active');
    var next;
    
    
    next=current.next('.panels');
    if(!next.length)
        next=$('.panels:first');
    
    next.addClass('active');
}

// старт автоматического переключения панелей
function slideStart(){
    site.slideTimer=setInterval(function(){
      
        if($('.panels.alert').length==0)
            nextPanel();
        
    },site.intervalSlide);
}

//стоп автоматического переключения панелей
function slideStop(){
    if(!site.slideTimer)
        return;
    clearInterval(site.slideTimer);
    site.slideTimer=null;
}

// 
function restartTimeout(){
    if(site.timeout){
        // если таймер существует остановим его
        clearTimeout(site.timeout);
        site.timeout=null;
    }
    site.timeout=setTimeout(function(){
        slideStart();
    },120000);
}

$(document).ready(function(){

    site.dimensions={
        width: $(window).width()-(site.border*2),
        height: $(window).height()-(site.border*2)
    };
    $('.panels').css({
        width: site.dimensions.width+'px'
    });

    $('.panels').each(function(i,e){
        elem = $(e);
        if(elem.height() < site.dimensions.height)
            elem.css({height: site.dimensions.height+'px'});
    });


    $(document).on('keyup',function(event){
        switch(event.keyCode){
            case 32:
                slideStop();
                restartTimeout();
                break;
            
            case 37:
                slideStop();
                slidePanel(true);
                restartTimeout();
                break;
            
            case 39:
                slideStop();
                slidePanel(false);
                restartTimeout();
                break;
            
            case 66:
                slideStop();
                showPanel('#backends');
                restartTimeout();
                break;
            case 68:
                slideStop();
                showPanel('#databases');
                restartTimeout();
                break;
            case 70:
                slideStop();
                showPanel('#frontends');
                restartTimeout();
                break;
            
            
        }
    });
    slideStart();
});