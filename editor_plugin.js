var imageMamDom = {},
usemap;
(function() {
    // Load plugin specific language pack
    tinymce.PluginManager.requireLangPack('imagemap');

    tinymce.create('tinymce.plugins.ImagemapPlugin', {
        init : function(ed, url) {
            ed.addCommand('mceImagemap', function() {
                ed.windowManager.open({
                    file : url +'/imagemap.htm',
                    width : 690,
                    height : 170,
                    inline : 1
                });
                imageMamDom = false;
            });
            ed.addCommand('mceImagemapContex', function() {
                ed.windowManager.open({
                    file : url +'/imagemap.htm',
                    width : 690,
                    height : 170,
                    inline : 1
                });
            });
            ed.addCommand('mceImagemapEditDom', function() {
                return imageMamDom;
            });
            ed.addCommand('removeEditImageMap', function() {
                console.log(usemap);
                console.log(tinyMCE.activeEditor.dom.select('[usemap="#'+usemap+'"]' )[0]);
                tinyMCE.activeEditor.dom.select('[usemap="#'+usemap+'"]' )[0].remove;
                tinyMCE.activeEditor.dom.select('[name="'+usemap+'"]' )[0].remove;
            });
            ed.onContextMenu.add(function(ed, e) {
                var img;
                if(e.target.nodeName == 'AREA'){
                    usemap = e.target.parentNode.getAttribute('name');
                }
                else if(e.target.getAttribute('usemap')){
                    usemap = e.target.getAttribute('usemap');
                    usemap = usemap.slice(1, usemap.length);
                }
                if(usemap){
                    var $img = tinyMCE.activeEditor.dom.select('[usemap="#'+usemap+'"]' )[0];
                    imageMamDom = {
                        imgMapName : usemap,
                        imgUrl : $img.getAttribute('src'),
                        imgAlt : $img.getAttribute('alt'),
                        imgTitle : $img.getAttribute('title'),
                        mapDom : tinyMCE.activeEditor.dom.select('[name="'+usemap+'"]' )[0].innerHTML
                    };
                    //console.log(imageMamDom);
                }
                else{
                    imageMamDom = false;
                }
            });

            // Register Imagemap button
            ed.addButton('imagemap', {
                title : 'Image mapping',
                cmd : 'mceImagemap',
                image : url + '/img/imagemap.gif'
            });

        },
        getInfo : function() {
            return {
                longname : 'Imagemap plugin',
                author : 'Alexey Vasin',
                //authorurl : 'http://tinymce.moxiecode.com',
                //infourl : 'http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/imagemap',
                version : "1.0"
            };
        }
    });
    // Register plugin
    tinymce.PluginManager.add('imagemap', tinymce.plugins.ImagemapPlugin);
})();