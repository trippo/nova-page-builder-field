<template>
    <div :id="containerId"></div>
</template>

<script>

    import grapesjs from 'grapesjs';
    import basicBlocks from 'grapesjs-blocks-basic';
    import pluginBootstrap from 'grapesjs-blocks-bootstrap4';
    import pluginCountdown from 'grapesjs-component-countdown';
    import pluginCustomCode from 'grapesjs-custom-code';
    import pluginParserPostcss from 'grapesjs-parser-postcss';
    import pluginTouch from 'grapesjs-touch';
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
                    pluginCustomCode,
                    pluginParserPostcss,
                    pluginTouch,
                    custom,
                ],
                pluginsOpts: {
                    pluginBootstrap: {
                        blocks: {
                            container: false
                        },
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
                        //     name: 'General',
                        //     open: false,
                        //     buildProps: ['float', 'display', 'position', 'top', 'right', 'left', 'bottom']
                        // },{
                        //     name: 'Dimension',
                        //     open: false,
                        //     buildProps: ['width', 'height', 'max-width', 'min-height', 'margin', 'padding'],
                        // },{
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

            this.editor.setComponents(this.value);

            $(document).keypress(function(event){
                var keycode = (event.keyCode ? event.keyCode : event.which);
                if(keycode == '13'){
                    event.preventDefault();
                    event.stopPropagation();
                    return false;
                }
            });
        }
    }
</script>