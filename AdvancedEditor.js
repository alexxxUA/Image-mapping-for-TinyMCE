    function createAdvancedEditor(config) {
        if (config.language != 'en' && config.language != 'de')
                config.language = 'en';
        tinyMCE.init({
            setup : function(ed) {
                ed.onInit.add(function(ed) {
                    setTimeout(function() {
                        setEditorEnabled(config);
                        setActiveControl("setadvanced",config.id);
                    },300);
                });
                setupDialogModeHandler(config.id, ed);
                setupSubmitIfDirty(ed);
            },

            add_form_submit_trigger : false,
            force_p_newlines : false,
            force_br_newlines : true,
            forced_root_block : '',

            theme : "advanced",
            skin : "intershop",
            language : config.language,
            inlinepopups_skin :"intershop",
            mode : "exact",
            elements : config.id,
            file_browser_callback: new ServerBrowser(config.uri, config.media, config.links).createCallback(),
            cleanup: true,
            verify_html: false,
            relative_urls : false,
            remove_script_host : true,
            apply_source_formatting: true,
            content_css : config.styleSheet,
            template_external_list_url : config.templateURL,
            // full
            plugins : "safari,pagebreak,style,layer,table,save,advhr,advimage,advlink,emotions,iespell,inlinepopups,insertdatetime,preview,media,searchreplace,print,contextmenu,paste,directionality,fullscreen,noneditable,visualchars,nonbreaking,xhtmlxtras,template,-staticmedialink,imagemap",
            // Theme options
            theme_advanced_buttons1 : "newdocument,template,|,print,|,cut,copy,paste,pastetext,pasteword,cleanup,|,search,replace,|,undo,redo,|,link,unlink,anchor,|,imagemap,image,media,table,|,visualchars,visualaid,help,|,code,fullscreen",
            theme_advanced_buttons2 : "bold,italic,underline,strikethrough,|,justifyleft,justifycenter,justifyright,justifyfull,|,bullist,numlist,|,outdent,indent,blockquote,|,forecolor,backcolor,|,cite,abbr,acronym,del,ins,attribs,|,removeformat,",
            theme_advanced_buttons3 : "styleselect,formatselect,fontselect,fontsizeselect,|,insertlayer,moveforward,movebackward,|,nonbreaking,charmap,advhr,insertdate,inserttime,",
            theme_advanced_toolbar_location : "top",
            theme_advanced_toolbar_align : "left",
            theme_advanced_statusbar_location : "bottom",
            theme_advanced_resizing : true,
            extended_valid_elements : "a[id|name|href|target|title|onclick|class|style],img[usemap|class|src|border=0|alt|title|hspace|vspace|width|height|align|onmouseover|onmouseout|name|style],hr[class|width|size|noshade],font[face|size|color|style],span[class|align|style],map[name|id],area[shape|coords|href|target|title|alt]",
            entity_encoding : "raw"
        });
    }
