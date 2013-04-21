(function( $, undefined ) {
    $(document).ready(function(){
        var Window = $(window),
            svgObj,
            clickObj = $('.map-area-wrapper'),
            parentPosition,
            mapElement = 0,
            imgUrl,
            imgUrlError = 'load-image-error',
            imgWidth,
            imgHeight,
            rectangle,
            firstPolyBox = false,
            polylinePoints = '',
            svgElementsClass = 'areaElement',
            svgDragElementClass = 'areaDrag',
            drawType = 'rect',
            popupMinWidth = 690,
            editMappingDom = tinyMCEPopup.execCommand('mceImagemapEditDom'),
            editMapName = '';

        //Check for support SVG elements
        if(!document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1")){
            $('#errorSVG').show();
            $('#imageMapBody form').hide();
        }
        //Load editable image
        if(editMappingDom){
            editMapping();
        }
        document.getElementById('srcbrowsercontainer').innerHTML = getBrowserHTML('srcbrowser','imgUrl','image','theme_advanced_image');

        var popup = '<div class="areaPopup popup">\
                    <h4 style="margin-top: 0;">Attributes</h4>\
                    <span id="close" title="close">X</span>\
                    <p class="attr attr-title">\
                    <label for="title-attr">Title</label>\
                    <input type="text" id="title-attr" placeholder="Enter title">\
                    </p>\
                    <p class="attr">\
                    <label for="alt-attr">Alt</label>\
                    <input type="text" id="alt-attr" placeholder="Enter alt">\
                    </p>\
                    <p class="href">\
                    <label for="href-attr">Href</label>\
                    <input type="text" id="href-attr" placeholder="Enter href">\
                    </p>\
                    <p>\
                    <input type="submit" class="save" value="Save"/>\
                    <input type="button" class="remove" value="Remove element"/>\
                    </p>\
                    </div>';
        var confirmMessage = '<div id="confirmDelete" class="popup">\
                            <span id="close" title="close">X</span>\
                            <div class="dialogWarning">Remove All <b>"area elements"</b> from image?</div>\
                            <input type="button" value="Yes" id="confirmYes" class="save">\
                            <input type="button" value="No" id="confirmNo" class="remove">\
                            </div>';
        function startElementPosition(parentPosition, absolutePosition){
            return {
                y : absolutePosition.y - Math.round(parentPosition.top),
                x : absolutePosition.x - Math.round(parentPosition.left)
            }
        }
        function choseTypeElement($this){
            $('#helperBox').trigger('mousedown');
            drawType = $this.data('draw-type');
            $('#drawTypes li').removeClass('activeType');
            $this.addClass('activeType');
            Window.unbind('mousemove dragstart selectstart');
        }
        function makeSVG(tag, attrs) {
            var el= document.createElementNS('http://www.w3.org/2000/svg', tag);
            for (var k in attrs)
                el.setAttribute(k, attrs[k]);
            return el;
        }
        function getRadius(width, height){
            return Math.round(Math.sqrt(width*width+height*height));
        }
        function getXpositionAndWidth(startPosition, endPosition, newPolyPoint){
            if(drawType == 'poly'){
                if(newPolyPoint){
                    polylinePoints = polylinePoints+' '+startPosition.x+' '+startPosition.y;
                }
                return {
                    points : polylinePoints+' '+endPosition.x+' '+endPosition.y
                }
            }
            else if(startPosition.y <= endPosition.y && startPosition.x <= endPosition.x){//bottom right
                var width = endPosition.x-startPosition.x,
                    height = endPosition.y-startPosition.y;
                if(drawType == 'rect'){
                    return {
                        'x' : startPosition.x,
                        'y' : startPosition.y,
                        'width' : width,
                        'height' : height
                    }
                }
                else if(drawType =='circle'){
                    return {
                        'r': getRadius(width, height)
                    }
                }
            }
            else if(startPosition.y >= endPosition.y && startPosition.x <= endPosition.x){//top right
                var width = endPosition.x-startPosition.x,
                    height = startPosition.y-endPosition.y;
                if(drawType == 'rect'){
                    return {
                        'x' : startPosition.x,
                        'y' : endPosition.y,
                        'width' : endPosition.x-startPosition.x,
                        'height' : startPosition.y-endPosition.y
                    }
                }
                else if(drawType =='circle'){
                    return {
                        'r': getRadius(width, height)
                    }
                }
            }
            else if(startPosition.y >= endPosition.y && startPosition.x >= endPosition.x){//top left
                var width = startPosition.x-endPosition.x,
                    height = startPosition.y-endPosition.y;
                if(drawType == 'rect'){
                    return {
                        'x' : endPosition.x,
                        'y' : endPosition.y,
                        'width' : startPosition.x-endPosition.x,
                        'height' : startPosition.y-endPosition.y
                    }
                }
                else if(drawType =='circle'){
                    return {
                        'r': getRadius(width, height)
                    }
                }
            }
            else{//bottom left
                var width = startPosition.x-endPosition.x,
                    height = endPosition.y-startPosition.y;
                if(drawType == 'rect'){
                    return {
                        'x' : endPosition.x,
                        'y' : startPosition.y,
                        'width' : startPosition.x-endPosition.x,
                        'height' : endPosition.y-startPosition.y
                    }
                }
                else if(drawType =='circle'){
                    return {
                        'r': getRadius(width, height)
                    }
                }
            }
        }
        function startDraw(startPosition){
            if(drawType == 'rect'){
                return makeSVG('rect', {
                    'x' : startPosition.x,
                    'y' : startPosition.y,
                    'id' : 'element'+mapElement,
                    'class' : svgElementsClass,
                    'width' : 0,
                    'height' : 0
                });
            }
            if(drawType == 'circle'){
                return makeSVG('circle',{
                    'cx' : startPosition.x,
                    'cy' : startPosition.y,
                    'r' : 0,
                    'id' : 'element'+mapElement,
                    'class' : svgElementsClass
                })
            }
            if(drawType == 'poly'){
                svgObj.append(makeSVG('circle', {
                    'cx' : startPosition.x,
                    'cy' : startPosition.y,
                    'r' : 3,
                    'id' : 'helperBox',
                    'class' : 'helperBox'
                }));
                firstPolyBox = true;
                polylinePoints = startPosition.x+' '+startPosition.y;
                return makeSVG('polyline',{
                    'points' : polylinePoints+' '+polylinePoints,
                    'id' : 'element'+mapElement,
                    'class' : 'tempPoly'
                })
            }
        }
        function contDraw(mapElement, getXpositionAndWidth, startPosition, endPosition, newPolyPoint){
            $('#element'+mapElement).attr(getXpositionAndWidth(startPosition, endPosition, newPolyPoint));
        }
        function endDraw(drawType, mapElement){
            var $drowlerElement = $('#'+mapElement),
                coordinates;
            if(drawType == 'rect'){
                var x1 = $drowlerElement.attr('x'),
                    y1 = $drowlerElement.attr('y'),
                    x2 = +$drowlerElement.attr('x') + (+$drowlerElement.attr('width')),
                    y2 = +$drowlerElement.attr('y') + (+$drowlerElement.attr('height')),
                    coordinates = x1+','+y1+','+x2+','+y2;
            }
            else if(drawType == 'circle'){
                var x = $drowlerElement.attr('cx'),
                    y = $drowlerElement.attr('cy'),
                    r = $drowlerElement.attr('r'),
                    coordinates = x+','+y+','+r;
            }
            else if(drawType == 'poly' || drawType == 'polygon'){
                coordinates = ($drowlerElement.attr('points')).split(' ').join(', ');
                coordinates = coordinates.substring(0, coordinates.length);
            }
            $drowlerElement.attr({'data-shape': drawType, 'data-coords': coordinates});
        }
        function drawler() {
            $(document).delegate('.map-area-wrapper', 'mousedown', function(e) {
                var startAbsolutePosition = {
                    y : Math.round(e.pageY),
                    x : Math.round(e.pageX)
                }
                var targetID = e.target.id;
                var targetClass = (targetID ? $('#'+targetID).attr('class') : ' ');
                var startPosition = startElementPosition(parentPosition, startAbsolutePosition);

                if( ($('.prevMap.hide')).length == 0 && targetClass.search(svgElementsClass) == -1  && e.target.id !== 'helperBox' && startPosition.x < imgWidth && startPosition.x > -1 && startPosition.y < imgHeight && startPosition.y > -2){
                    if(!firstPolyBox && drawType == 'poly'){
                        svgObj.prepend(startDraw(startPosition));
                        $(document).undelegate('rect, circle', 'mousedown');
                    }
                    else if(drawType == 'poly'){
                        contDraw(mapElement, getXpositionAndWidth, startPosition, startPosition, true);
                    }
                    else{
                        svgObj.append(startDraw(startPosition));
                    }

                    Window.on("dragstart selectstart", function(e){e.preventDefault()});

                    Window.on('mousemove', function(e) {
                        var endPosition = startElementPosition(parentPosition, {x: e.pageX, y: e.pageY});
                        contDraw(mapElement, getXpositionAndWidth, startPosition, endPosition);
                    })
                    if(drawType !== 'poly'){
                        Window.one('mouseup', function() {
                            Window.unbind('mousemove dragstart selectstart');
                            endDraw(drawType, 'element'+mapElement);
                            mapElement +=1;
                        })
                    }
                }
                else if(e.target.id == 'helperBox'){
                    Window.unbind('mousemove dragstart selectstart');
                    $('#helperBox, #element'+mapElement).remove();
                    svgObj.append(makeSVG('polygon',{
                        'points' : polylinePoints,
                        'id' : 'element'+mapElement,
                        'class' : svgElementsClass
                    }));
                    endDraw(drawType, 'element'+mapElement);
                    polylinePoints = '';
                    firstPolyBox = false;
                    mapElement +=1;
                    moveElements();
                }
            })
        };
        function moveElement(target, $this, tempEndPosition, difrentPos, startPosition){
            var newElementAttrPos = {};
            if(target.tagName == 'circle' || target.tagName == 'rect'){
                newElementAttrPos[difrentPos.typeX] = tempEndPosition.x - difrentPos.x,
                newElementAttrPos[difrentPos.typeY] = tempEndPosition.y - difrentPos.y;
            }
            else if(target.tagName == 'polygon'){
                var points = (difrentPos.points).split(' ').join(','); //Format for IE9
                    points = points.split(',');
                var diffrent = {
                    'x' : tempEndPosition.x - startPosition.x,
                    'y' : tempEndPosition.y - startPosition.y
                };
                newElementAttrPos[difrentPos.typeAttr] = new String();
                for(var i in points){
                    if(i % 2 == 0){
                        newElementAttrPos[difrentPos.typeAttr] = newElementAttrPos[difrentPos.typeAttr] +' '+(parseInt(points[i]) + diffrent.x);
                    }
                    else{
                        newElementAttrPos[difrentPos.typeAttr] = newElementAttrPos[difrentPos.typeAttr] +' '+(parseInt(points[i]) + diffrent.y);
                    }
                }
                newElementAttrPos[difrentPos.typeAttr] = (newElementAttrPos[difrentPos.typeAttr]).substring(1);
            }
            $this.attr(newElementAttrPos);
        }
        function moveElements() {
            $(document).delegate('rect, circle, polygon', 'mousedown', function(e) {
                if(polylinePoints == ''){
                    var $this = $(this),
                        target = e.target,
                        difrentPos = {},
                        startAbsolutePosition = {
                            y : Math.round(e.pageY),
                            x : Math.round(e.pageX)
                        },
                        startPosition = startElementPosition(parentPosition, startAbsolutePosition);
                    $this.attr('class', svgElementsClass+' '+svgDragElementClass);
                    if(target.tagName == 'circle' || target.tagName == 'rect'){
                        if(target.tagName == 'circle'){
                            var startFrom = {
                                'x' : +($this.attr('cx')),
                                'y' : +($this.attr('cy')),
                                typeX : 'cx',
                                typeY : 'cy'
                            };
                        }
                        else if(target.tagName == 'rect'){
                            var startFrom = {
                                'x' : +($this.attr('x')),
                                'y' : +($this.attr('y')),
                                typeX : 'x',
                                typeY : 'y'
                            };
                        }
                        difrentPos = {
                            'x' : startPosition.x - startFrom.x,
                            'y' : startPosition.y - startFrom.y,
                            typeX : startFrom.typeX,
                            typeY : startFrom.typeY
                        };
                    }
                    else if(target.tagName == 'polygon'){
                        difrentPos = {
                            'points' : $this.attr('points'),
                            typeAttr : 'points'
                        };
                    }

                    Window.on("dragstart selectstart", function(e){e.preventDefault()});

                    Window.on('mousemove', function(e) {
                        var tempEndPosition = startElementPosition(parentPosition, {x: e.pageX, y: e.pageY});
                        if(tempEndPosition.x < imgWidth && tempEndPosition.x > -1 && tempEndPosition.y < imgHeight && tempEndPosition.y > -2){
                            moveElement(target, $this, tempEndPosition, difrentPos, startPosition);
                        }
                    })
                    Window.one('mouseup', function() {
                        Window.unbind('mousemove dragstart selectstart');
                        endDraw($(target).data('shape'), target.id);
                        $this.attr('class', svgElementsClass);
                    });
                }
            });
        };
        function appendText(node,txt){
            node.append(document.createTextNode(txt));
        }
        function appendElement(node,tag,text){
            var ne = document.createElement(tag);
            if(text) $(ne).text(text);
            node.append(ne);
        }
        function checkForUndefined(value, attr){
            if(!attr || !value){
                return value ? value : ' ';
            }
            else{
                return attr+'="'+value+'"';
            }
        }
        function openPopup(e, popup, $this){
            $('#modalBG').fadeIn();
            $('.popup').remove();
            $('body').append(popup);
            var $popup = $('.popup');
            if(e.target.className.animVal == svgElementsClass){
                var title = $this.attr('data-title'),
                    alt = $this.attr('data-alt'),
                    href = $this.attr('data-href');
                $popup.find('#title-attr').val(title);
                $popup.find('#alt-attr').val(alt);
                $popup.find('#href-attr').val(href);
                $popup.attr('data-element', $this.attr('id'));
            }
            $popup.fadeIn();
            $popup.css('top', e.pageY - $popup.height()/2 - 10);
            $popup.find('input').first().focus();
        }
        function closePopup(e, $this){
            if(e.target.id !== 'close'){
                $('#close').trigger('click');
            }
            else{
                $this.closest('div').remove();
                $('#modalBG').fadeOut('fast');
            }
        }
        function removeElement(){
            $('#'+($('.areaPopup').attr('data-element'))).remove();
            $('.areaPopup #close').trigger('click');
        }
        function setAreaAttributs(){
            var $popup = $('.areaPopup'),
                element = $popup.attr('data-element'),
                title = $popup.find('#title-attr').val(),
                alt = $popup.find('#alt-attr').val(),
                href = $popup.find('#href-attr').val();
            $('#'+element).attr({'data-title': title, 'data-alt': alt, 'data-href': href});
            $('.areaPopup #close').trigger('click');
        }
        function showPreviewMap(preview){
            var generetedMap = '',
                usemapTitle = $('#mapName').val(),
                possible = "0123456789";
            if(preview){
                usemapTitle = 'previewMap';
                $('.prevMap').removeClass('show').addClass('hide');
                $('.map-area-wrapper').append('<map name="'+usemapTitle+'" id="'+usemapTitle+'">');
            }
            else{
                var imgAlt = checkForUndefined($('#imgAlt').val(), 'alt'),
                    imgTitle = checkForUndefined($('#imgTitle').val(), 'title');
                if(!usemapTitle){
                    usemapTitle = 'map';
                    for( var i=0; i < 4; i++ ){
                        usemapTitle += possible.charAt(Math.floor(Math.random() * possible.length));
                    }
                }
                generetedMap = '<img src="'+imgUrl+'" '+imgAlt+' '+imgTitle+' usemap="#'+usemapTitle+'"/><map name="'+usemapTitle+'" id="'+usemapTitle+'">'
            }
            $('.map-area .'+svgElementsClass).each(function(){
                var $this = $(this),
                    shape = checkForUndefined($this.attr('data-shape'), 'shape'),
                    coords = checkForUndefined($this.attr('data-coords'), 'coords'),
                    href = checkForUndefined($this.attr('data-href'), 'href'),
                    title = checkForUndefined($this.attr('data-title'), 'title'),
                    alt = checkForUndefined($this.attr('data-alt'), 'alt');
                    if(preview){
                        $('.map-area-wrapper #previewMap').append('<area '+shape+' '+coords+' '+href+' '+title+' '+alt+'/>');
                    }
                    else{
                        generetedMap += '<area '+shape+' '+coords+' '+href+' '+title+' '+alt+'/>';
                    }
            });
            if(preview){
              $('.map-area').fadeOut();
            }
            else{
                generetedMap += '</map>';
                return generetedMap;
            }
        }
        function hidePreviewMap(){
            $('#previewMap').remove();
            $('.prevMap').removeClass('hide').addClass('show');
            $('.map-area').fadeIn();
        }
        function resize(w, h) {
            tinyMCEPopup.params.mce_height = h;
            tinyMCEPopup.params.mce_width = w;
            tinyMCEPopup.resizeToInnerSize();

            var vpw = tinyMCE.DOM.getViewPort().w,
                vph = tinyMCE.DOM.getViewPort().h,
                top = vph > h ? (vph-h)/2 : 0,
                left = vpw > w ? (vpw-w)/2 : 0;

            var popup = tinyMCE.DOM.doc.getElementById(tinyMCEPopup.id);
            popup.style.top = top+"px";
            popup.style.left = left+"px";
        }

        window.loadImage = function(urlId){
            var popopW,
                urlBox = $('#'+urlId);
            clearSVG();
            imgUrl = urlBox.val();
            urlBox.removeClass(imgUrlError);
            $("body, html").css("cursor", "progress");
            $('.map-area-wrapper img').load(function(){
                var imgAlt = imgUrl.split('/');
                imgAlt = imgAlt[imgAlt.length-1].split('.');
                imgAlt = imgAlt[0];
                $('#imgAlt, #imgTitle, #mapName').val(imgAlt);
                $('.choseImage').css('display', 'none');
                $('.imageMapping').css('display', 'block');
                imgWidth = $('.map-area-wrapper img').width();
                imgHeight = $('.map-area-wrapper img').height();
                $('.map-area').attr({'width': imgWidth, 'height': imgHeight});
                $('.map-area-wrapper').width(imgWidth).height(imgHeight);
                var bodyHeight = $('#imageMapBody').height();
                imgWidth<popupMinWidth ? popopW = popupMinWidth : popopW = imgWidth;

                resize(popopW+80, bodyHeight+10);
                $(window).trigger('resize');
                parentPosition = svgObj.offset();
                $('[data-draw-type='+drawType+']').addClass('activeType');
                $('#insert').show();
                $('body, html').css('cursor', 'default');
            }).error(function(){
                $('body, html').css('cursor', 'default');
                urlBox.addClass(imgUrlError);
                return false;
            }).attr({'src':imgUrl});
        }
        function editMapping(){
            $('#map-area-wrapper').append('<div id="tempEditMap" style="display:none;">'+editMappingDom+'</div>');
            console.log(editMappingDom);
            var $tempImg = $('#tempEditMap img');
            imgUrl = $tempImg.attr('src');
            console.log(imgUrl);
            editMapName = $tempImg.attr('usemap');
            console.log('Yep');
            $('.map-area-wrapper #mappedImg').load(function(){
                console.log('start load');
                var imgAlt = $tempImg.attr('alt');
                $('#imgAlt').val($tempImg.attr('alt'));
                $('#imgTitle').val($tempImg.attr('title'));
                $('#mapName').val($('#tempEditMap map').attr('name'));
                $('#imgUrl').val(imgUrl);

                $('.choseImage').css('display', 'none');
                $('.imageMapping').css('display', 'block');

                imgWidth = $('.map-area-wrapper img').width();
                imgHeight = $('.map-area-wrapper img').height();
                $('.map-area').attr({'width': imgWidth, 'height': imgHeight});
                $('.map-area-wrapper').width(imgWidth).height(imgHeight);
                var bodyHeight = $('#imageMapBody').height();
                imgWidth<popupMinWidth ? popopW = popupMinWidth : popopW = imgWidth;

                resize(popopW+80, bodyHeight+10);
                $(window).trigger('resize');
                parentPosition = svgObj.offset();
                $('[data-draw-type='+drawType+']').addClass('activeType');
                $('#insert').show();
                $('body, html').css('cursor', 'default');

                //Load all mapped elements
                $('#tempEditMap area').each(function(i){
                    var $this = $(this),
                        shape = $this.attr('shape'),
                        coords = $this.attr('coords'),
                        alt = checkForUndefined($this.attr('alt'), alt),
                        title = checkForUndefined($this.attr('title'), title),
                        href = checkForUndefined($this.attr('href'), href);
                    mapElement = i;
                    if(shape == 'poly'){
                        svgPolyCoords = coords.split(', ').join(' ');
                        svgObj.append(makeSVG('polygon',{
                            'points' : svgPolyCoords,
                            'id' : 'element'+mapElement,
                            'class' : svgElementsClass,
                            'data-shape' : shape,
                            'data-coords' : coords,
                            'data-href' : href,
                            'data-alt' : alt,
                            'data-title' : title
                        }));
                    }
                    else if(shape == 'circle'){
                        svgCircleCoords = coords.split(',');
                        svgObj.append(makeSVG('circle',{
                            'cx' : svgCircleCoords[0],
                            'cy' : svgCircleCoords[1],
                            'r' : svgCircleCoords[2],
                            'id' : 'element'+mapElement,
                            'class' : svgElementsClass,
                            'data-shape' : shape,
                            'data-coords' : coords,
                            'data-href' : href,
                            'data-alt' : alt,
                            'data-title' : title
                        }));
                    }
                    else if(shape == 'rect'){
                        svgRectCoords = coords.split(',');
                        svgObj.append(makeSVG('rect',{
                            'x' : svgRectCoords[0],
                            'y' : svgRectCoords[1],
                            'width' : +svgRectCoords[2] - (+svgRectCoords[0]),
                            'height' : +svgRectCoords[3] - (+svgRectCoords[1]),
                            'id' : 'element'+mapElement,
                            'class' : svgElementsClass,
                            'data-shape' : shape,
                            'data-coords' : coords,
                            'data-href' : href,
                            'data-alt' : alt,
                            'data-title' : title
                        }));
                    }
                });
                mapElement++;
                $('#tempEditMap').remove();
            }).error(function(){
                console.log('error');
            }).attr({'src':imgUrl});
        }
        function clearSVG(){
            $('.'+svgElementsClass).remove();
        }
        function insertMappedImage(){
            tinyMCEPopup.editor.execCommand('mceInsertRawHTML', false, showPreviewMap());
            tinyMCEPopup.editor.focus();
            tinyMCEPopup.close();
        }
        $('#insert').live('click', function(){
            if(editMapName){
                tinyMCEPopup.editor.execCommand('removeEditImageMap');
            }
            insertMappedImage();          
        })
        $('#clearSVG').live('click', function(e){
            openPopup(e, confirmMessage, $(this));
        })
        $('rect, circle, polygon').live('dblclick', function(e){
            openPopup(e, popup, $(this));
        })
        $('#close, #modalBG, #confirmDelete #confirmNo, #confirmDelete #confirmYes').live('click', function(e){
            closePopup(e, $(this));
        })
        $(document).live('keyup', function(e){
            if(e.keyCode == '27') $('#modalBG').trigger('click');
        })
        $('.areaPopup .remove').live('click', function(){
            removeElement();
        })
        $('.areaPopup .save').live('click', function(){
            setAreaAttributs();
        })
        $('.areaPopup input[type="text"]').live('keyup', function(e){
            if(e.keyCode == '13') $('.areaPopup .save').trigger('click');
        })
        $('#confirmDelete #confirmYes').live('click', function(e){
            clearSVG();
        })
        $('.prevMap.show').live('click', function(){
            showPreviewMap(true);
        })
        $('.prevMap.hide').live('click', function(){
            hidePreviewMap();
        })
        $(window).resize(function(){
            svgObj = $('.map-area');
            parentPosition = svgObj.offset();
        });
        $('#drawTypes li[data-draw-type]').live('click', function(){
            choseTypeElement($(this));
        });
        drawler();
        moveElements();
    })
})($);