<template>
    <div :id="containerId"></div>
</template>

<script>

    import grapesjs from 'grapesjs';
    import basicBlocks from 'grapesjs-blocks-basic';
    import pluginBootstrap from 'grapesjs-blocks-bootstrap4';
    import pluginNavbar from 'grapesjs-navbar';
    import pluginCountdown from 'grapesjs-component-countdown';
    //import pluginForms from 'grapesjs-plugin-forms';
    import pluginExport from 'grapesjs-plugin-export';
    import custom from '../plugins/custom';
    import { FormField, HandlesValidationErrors } from 'laravel-nova'

    export default {

        mixins: [FormField, HandlesValidationErrors],

        props: ['resourceName', 'resourceId', 'field'],

        data() {
            return {
                editor: null,
                containerId: 'editor-' + Math.random().toString(36).substr(2, 5),
            }
        },

        methods: {
            /*
             * Set the initial, internal value for the field.
             */
            setInitialValue() {
                this.value = this.field.value || '';
            },

            /**
             * Fill the given FormData object with the field's internal value.
             */
            fill(formData) {
                let newValue = '<style>' + this.editor.getCss() + '</style>'
                                + this.editor.getHtml()
                                + '<script>' + this.editor.getJs() + '<\/script>';
                formData.append(this.field.attribute, newValue || '')
            },

            /**
             * Update the field's internal value.
             */
            handleChange(value) {
                this.value = value;
                this.editor.setComponents(value);
            },
        },

        mounted() {
            this.editor = grapesjs.init({
                container: '#' + this.containerId,
                allowScripts: 1,
                storageManager: { autoload: 0 },
                width: '100%',
                plugins: [
                    pluginBootstrap,
                    basicBlocks,
                    pluginExport,
                    pluginCountdown,
                    //pluginForms,
                    pluginNavbar,
                    custom
                ],
                pluginsOpts: {
                    'grapesjs-blocks-bootstrap4': {
                        blockCategories: {
                            forms: false
                        }
                    }
                },
                canvas: {
                    styles: [
                        'https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css'
                    ],
                    scripts: [
                        'https://code.jquery.com/jquery-3.4.1.slim.min.js',
                        'https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js',
                        'https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js'
                    ],
                },
                styleManager : {
                    sectors: [
                        {
                            name: 'General',
                            open: false,
                            buildProps: ['float', 'display', 'position', 'top', 'right', 'left', 'bottom']
                        },{
                            name: 'Dimension',
                            open: false,
                            buildProps: ['width', 'height', 'max-width', 'min-height', 'margin', 'padding'],
                        },{
                            name: 'Typography',
                            open: false,
                            buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-shadow'],
                        },{
                            name: 'Decorations',
                            open: false,
                            buildProps: ['border-radius-c', 'background-color', 'border-radius', 'border', 'box-shadow', 'background'],
                        }
                    ],
                },
            });
            var pn = this.editor.Panels;
      var modal = this.editor.Modal;



      // Add info command
      var mdlClass = 'gjs-mdl-dialog-sm';
      var infoContainer = document.getElementById('info-panel');
      cmdm.add('open-info', function() {
        var mdlDialog = document.querySelector('.gjs-mdl-dialog');
        mdlDialog.className += ' ' + mdlClass;
        infoContainer.style.display = 'block';
        modal.setTitle('About this demo');
        modal.setContent(infoContainer);
        modal.open();
        modal.getModel().once('change:open', function() {
          mdlDialog.className = mdlDialog.className.replace(mdlClass, '');
        })
      });
      pn.addButton('options', {
        id: 'open-info',
        className: 'fa fa-question-circle',
        command: function() { this.editor.runCommand('open-info') },
        attributes: {
          'title': 'About',
          'data-tooltip-pos': 'bottom',
        },
      });


      // Simple warn notifier
      var origWarn = console.warn;
      toastr.options = {
        closeButton: true,
        preventDuplicates: true,
        showDuration: 250,
        hideDuration: 150
      };
      console.warn = function (msg) {
        if (msg.indexOf('[undefined]') == -1) {
          toastr.warning(msg);
        }
        origWarn(msg);
      };


      // Add and beautify tooltips
      [['sw-visibility', 'Show Borders'], ['preview', 'Preview'], ['fullscreen', 'Fullscreen'],
       ['export-template', 'Export'], ['undo', 'Undo'], ['redo', 'Redo'],
       ['gjs-open-import-webpage', 'Import'], ['canvas-clear', 'Clear canvas']]
      .forEach(function(item) {
        pn.getButton('options', item[0]).set('attributes', {title: item[1], 'data-tooltip-pos': 'bottom'});
      });
      [['open-sm', 'Style Manager'], ['open-layers', 'Layers'], ['open-blocks', 'Blocks']]
      .forEach(function(item) {
        pn.getButton('views', item[0]).set('attributes', {title: item[1], 'data-tooltip-pos': 'bottom'});
      });
      var titles = document.querySelectorAll('*[title]');

      for (var i = 0; i < titles.length; i++) {
        var el = titles[i];
        var title = el.getAttribute('title');
        title = title ? title.trim(): '';
        if(!title)
          break;
        el.setAttribute('data-tooltip', title);
        el.setAttribute('title', '');
      }

      // Show borders by default
      pn.getButton('options', 'sw-visibility').set('active', 1);


      // Store and load events
      this.editor.on('storage:load', function(e) { console.log('Loaded ', e) });
      this.editor.on('storage:store', function(e) { console.log('Stored ', e) });


      // Do stuff on load
      this.editor.on('load', function() {
        var $ = grapesjs.$;

        // Show logo with the version
        var logoCont = document.querySelector('.gjs-logo-cont');
        document.querySelector('.gjs-logo-version').innerHTML = 'v' + grapesjs.version;
        var logoPanel = document.querySelector('.gjs-pn-commands');
        logoPanel.appendChild(logoCont);


        // Load and show settings and style manager
        var openTmBtn = pn.getButton('views', 'open-tm');
        openTmBtn && openTmBtn.set('active', 1);
        var openSm = pn.getButton('views', 'open-sm');
        openSm && openSm.set('active', 1);

        // Add Settings Sector
        var traitsSector = $('<div class="gjs-sm-sector no-select">'+
          '<div class="gjs-sm-title"><span class="icon-settings fa fa-cog"></span> Settings</div>' +
          '<div class="gjs-sm-properties" style="display: none;"></div></div>');
        var traitsProps = traitsSector.find('.gjs-sm-properties');
        traitsProps.append($('.gjs-trt-traits'));
        $('.gjs-sm-sectors').before(traitsSector);
        traitsSector.find('.gjs-sm-title').on('click', function(){
          var traitStyle = traitsProps.get(0).style;
          var hidden = traitStyle.display == 'none';
          if (hidden) {
            traitStyle.display = 'block';
          } else {
            traitStyle.display = 'none';
          }
        });

        // Open block manager
        var openBlocksBtn = this.editor.Panels.getButton('views', 'open-blocks');
        openBlocksBtn && openBlocksBtn.set('active', 1);

        // Move Ad
        $('#gjs').append($('.ad-cont'));
      });

            this.editor.setComponents(this.value);
        }
    }
</script>