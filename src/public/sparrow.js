(function(){

    window['sparrow'] = {
        config: {
            'pageUrl' : window.location.href,
            'baseUrl' : 'freshpeeps.com/api',
            'https' : window.location.protocol[4] === 's',
            'delay' : 3,
            'effect' : 'bounce',
            'track' : 1,
            'widget' : 1,
            'location': 'bottom-left'
        },

        data : {
            url: window.location.hostname + window.location.pathname
        },

        fields : {},

        getUrl : function(url) {
            return sparrow.config.baseUrl + url;
        },

        validateEmail : function (email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        },

        set : function(key, val, target) {
            if (typeof(target) == 'undefined') {target = 'data';}
            sparrow[target][key] = val;
        },

        checkArgs : function(args) {
            switch (args[0]) {
                case 'set':
                case 'config':
                case 'data':
                    sparrow.set(args[1], args[2], args[0]);
                    break;
                case 'send':
                    sparrow.set('event', args[1]);
                    sparrow.sendData(data);
                    break;
                default:
                    break;
            }
        },

        sendData: function(obj) {
            $.post(sparrow.config.baseUrl + 'leads', JSON.stringify(obj));
        },

        recordEmail: function(em) {
            if (!sparrow.validateEmail(email)) {
                return false;
            }

            sparrow.set('email', em);

            sparrow.data.url = sparrow.config.pageUrl;
            sparrow.sendData(sparrow.data);
        },

        bindFields: function() {
            if (sparrow.fields == null) {
                $('input[name]').filter(function() {
                    return (/email/i).test($(this).attr('name'));
                }).attr('sparrow-data', 'email');
            } else {
                for (var i in sparrow.fields) {
                    if (sparrow.fields[i]['id']) {
                        // bind by ID
                        $('#' + sparrow.fields[i]['id']).attr('sparrow-data', i);
                    } else {
                        if (sparrow.fields[i]['name']) {
                            $('[name="' + sparrow.fields[i]['name'] + '"]').attr('sparrow-data', i);
                        }
                    }
                }
            }
            setTimeout(function(){
                $('[sparrow-data]').on('blur', function(){
                    switch ($(this).attr('sparrow-data')) {
                        case 'firstname':
                        case 'lastname':
                            sparrow.set($(this).attr('sparrow-data'), $(this).val());
                            break;
                        case 'email':
                            var email = $(this).val();

                            if (!sparrow.validateEmail(email)) {
                                return false;
                            }

                            sparrow.set('email', email);

                            sparrow.sendData(sparrow.data);
                            break;
                    }
                });
            }, 200);
        },
        
        jqLoad : function() {
            sparrow.config.baseUrl = 'http' + (sparrow.config.https ? 's': '' )+ '://' + sparrow.config.baseUrl + '/';

            $.get(sparrow.config.baseUrl + 'data?url=' + encodeURIComponent(sparrow.config.pageUrl),
                function(data) {
                    if (sparrow.config.track == 1) {
                        if (typeof(data.fields) != null) {
                            sparrow.fields = data.fields;
                        }

                        sparrow.bindFields();
                    }
                    //USED TO BE (data.widget == 1 && data.show == 1)
                    if (data.enabled === 1) {
                        console.log('In here now');
                        sparrow.config['delay'] = data.delay;
                        sparrow.config['effect'] = data.effect;
                        sparrow.config['location'] = data.location;
                        sparrow.config['counters'] = data.counters;
                        sparrow.config['initialWait'] = data.initialWait;
                        var cssId = 'sparrowcss';
                        console.log(document.getElementById(cssId));
                        if (!document.getElementById(cssId)) {
                            var head  = document.getElementsByTagName('head')[0];
                            var link  = document.createElement('link');
                            link.id   = 'sparrowcss';
                            link.rel  = 'stylesheet';
                            link.type = 'text/css';
                            link.href = sparrow.config.baseUrl + 'animate.css';
                            console.log(link.href);
                            link.media = 'all';
                            head.appendChild(link);
                        }

                        if (data.show_on_mobile == 0) {
                            if (sparrow.mobilecheck() === false) {
                                setTimeout(function(){
                                    sparrow.displayWidget();
                                }, data.initial_wait * 1000);

                            }
                        } else {
                            setTimeout(function(){
                                sparrow.displayWidget();
                            }, data.initial_wait * 1000);
                        }
                    }

                }
            );

            // check if you need to run setup
            sparrow.setupMode();
        },
        
        setupMode : function()  {
            if (window.location.href.indexOf('#setup') != -1) {
                var div = document.createElement('div');
                div.id = 'sparrow-setup-widget';
                document.getElementsByTagName('body')[0].appendChild(div);

                $('#sparrow-setup-widget')
                    .css('position', 'fixed')
                    .css('top', 20)
                    .css('right', 20)
                    .css('padding', '10px 20px')
                    .css('cursor', 'hand')
                    .css('z-index', 9999)
                    .css('opacity', 1)
                    .css('border-radius', "5px")
                    .css('background-color', '#2ecc71')
                    .css('color', '#fff')
                    .css('font-family', '"Helvetica", "Arial"')
                    .html('Save & Close')
                    .click(function(){
                        sparrow.scanSetupMode();
                    });
            }
        },
        
        scanSetupMode : function() {
            $('input').each(function(){
                var trg = null;
                switch ($(this).val()) {
                    case 'firstname':
                    case 'FIRSTNAME':
                        trg = 'firstname';
                        break;

                    case 'lastname':
                    case 'LASTNAME':
                        trg = 'lastname';
                        break;

                    case 'email':
                    case 'EMAIL':
                    case 'sparrowemail':
                        trg = 'email';
                        break;

                    default:
                        break;
                }

                if (trg != null) {
                    if (sparrow.fields == null) {
                        sparrow.fields = {};
                    }

                    sparrow.fields[trg] = {
                        'id' : null,
                        'name' : null
                    };

                    if ($(this).attr('id') != undefined) {
                        sparrow.fields[trg].id = $(this).attr('id');
                    }

                    if ($(this).attr('name') != undefined) {
                        sparrow.fields[trg].name = $(this).attr('name');
                    }
                }

            });
            
            var obj = {
                url:  sparrow.config.pageUrl,
                fields: sparrow.fields
            };

            $.post(sparrow.config.baseUrl + 'data', JSON.stringify(obj),
                function() {
                    window.location.href = window.location.href.replace('#setup', '');
                }, 'json'
            );    
        },

        displayWidget: function() {
            if (sparrow.config.enabled == 1) {
                setTimeout(function(){
                    sparrow.displayWidget();
                }, sparrow.config.delay * 1000);

                return;
            }


            var div = document.createElement('div');
            div.id = 'sparrow-widget';
            document.getElementsByTagName('body')[0].appendChild(div);

            var widgetUrl = sparrow.config.baseUrl + 'widget?url=' + encodeURIComponent(sparrow.config.pageUrl) + '&r=' + Math.random();

            if (sparrow.config.show_counters == 1) {
                widgetUrl = sparrow.config.baseUrl + 'counters/' + sparrow.data.campaignId + '?ref=' + encodeURIComponent(window.location.href) + '&r=' + Math.random();
                sparrow.config.show_counters = 0;
            }

            $('#sparrow-widget')
                .css('width', 380)
                .css('height', 110)
                .css('position', 'fixed')
                //.css('bottom', 55)
                //.css('left', 40)
                .css('z-index', '2147483647')
                .css('opacity', 0)
                //.css('display', 'none')
                //.css('border', '1px #777 solid')
                .html('<iframe frameborder="no"  scrolling="no" style="width: 100%; height: 100%;" src="' + widgetUrl + '"></iframe>');

            switch (sparrow.config.location) {
                case '3':
                    $('#sparrow-widget').css('bottom', 55).css('right', 40);
                    break;

                case '0':
                    $('#sparrow-widget').css('top', 55).css('left', 40);
                    break;

                case '1':
                    $('#sparrow-widget').css('top', 55).css('right', 40);
                    break;

                case '2':
                default:
                    $('#sparrow-widget').css('bottom', 55).css('left', 40);
                    break;
            }

            $('#sparrow-widget > iframe').on('load', function(){

                $('#sparrow-widget').css('opacity', 1);

                if (sparrow.config.effect != 'none') {
                    $('#sparrow-widget').css('opacity', 0);
                    sparrow.sparrowAnimate(sparrow.config.effect);
                }

                setTimeout(function(){
                    sparrow.removeWidget();
                }, 10000);
            });
        },

        removeWidget: function() {
            //console.log('removing');
            $('#sparrow-widget').remove();

            setTimeout(function(){
                sparrow.displayWidget();
            }, sparrow.config.delay * 1000);
        },

        sparrowAnimate: function(x) {
            $('#sparrow-widget').removeClass().addClass(x + ' animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
                // $(this).removeClass();
                // $(this).css('opacity', 1);
            });
        },

        mobilecheck: function() {
            var check = false;
            (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
            return check;
        },

        hidden: null, visibilityChange: null,

        handleVisibilityChange: function() {
            if (document[hidden]) {
                sparrow.config.show = 0;
            } else {
                sparrow.config.show = 1;
            }
        },
        

        init : function() {
            // load latest jquery
            var script = document.createElement("SCRIPT");
            script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js';
            script.type = 'text/javascript';
            script.onload = function() { sparrow.jqLoad(); };
            document.getElementsByTagName("head")[0].appendChild(script);

            if (typeof document.hidden !== "undefined") {
                hidden = "hidden";
                visibilityChange = "visibilitychange";
            } else if (typeof document.mozHidden !== "undefined") {
                hidden = "mozHidden";
                visibilityChange = "mozvisibilitychange";
            } else if (typeof document.msHidden !== "undefined") {
                hidden = "msHidden";
                visibilityChange = "msvisibilitychange";
            } else if (typeof document.webkitHidden !== "undefined") {
                hidden = "webkitHidden";
                visibilityChange = "webkitvisibilitychange";
            }

            document.addEventListener(visibilityChange, sparrow.handleVisibilityChange, false);
        }
    }

    window.addEventListener('load', sparrow.init);

})();
