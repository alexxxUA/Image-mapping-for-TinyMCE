var storedImgUrl = '';
(function() {
        // Load plugin specific language pack
        tinymce.PluginManager.requireLangPack('imagemap');

        tinymce.create('tinymce.plugins.ImagemapPlugin', {
                init : function(ed, url) {
                        ed.addCommand('mceImagemap', function() {
                                ed.windowManager.open({
                                        file : url +'/imagemap.htm',
                                        width : 690,
                                        height : 175,
                                        inline : 1
                                });
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