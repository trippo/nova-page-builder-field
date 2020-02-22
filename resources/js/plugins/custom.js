import grapesjs from 'grapesjs';

export default grapesjs.plugins.add('custom', function (editor, opts) {

    var opt = opts || {};
    var config = editor.getConfig();
    var pfx = editor.getConfig().stylePrefix;
    var modal = editor.Modal;
    var $ = window.$ || grapesjs.$;

    config.showDevices = 0;

    var updateTooltip = function (coll, pos) {
        coll.each(function (item) {
            var attrs = item.get('attributes');
            attrs['data-tooltip-pos'] = pos || 'bottom';
            item.set('attributes', attrs);
        });
    }

    /****************** IMPORTER *************************/

    var codeViewer = editor.CodeManager.getViewer('CodeMirror').clone();
    var container = document.createElement('div');
    var btnImp = document.createElement('button');

    // Init import button
    btnImp.innerHTML = 'Import';
    btnImp.className = pfx + 'btn-prim ' + pfx + 'btn-import';
    btnImp.onclick = function () {
        var code = codeViewer.editor.getValue();
        editor.DomComponents.getWrapper().set('content', '');
        editor.setComponents(code.trim());
        modal.close();
    };

    // Init code viewer
    codeViewer.set({
        codeName: 'htmlmixed',
        theme: opt.codeViewerTheme || 'hopscotch',
        readOnly: 0
    });


    /****************** COMMANDS *************************/

    var cmdm = editor.Commands;
    cmdm.add('undo', {
        run: function (editor, sender) {
            sender.set('active', 0);
            editor.UndoManager.undo(1);
        }
    });
    cmdm.add('redo', {
        run: function (editor, sender) {
            sender.set('active', 0);
            editor.UndoManager.redo(1);
        }
    });
    cmdm.add('set-device-desktop', {
        run: function (editor) {
            editor.setDevice('Desktop');
        }
    });
    cmdm.add('set-device-tablet', {
        run: function (editor) {
            editor.setDevice('Tablet');
        }
    });
    cmdm.add('set-device-mobile', {
        run: function (editor) {
            editor.setDevice('Mobile portrait');
        }
    });
    cmdm.add('clean-all', {
        run: function (editor, sender) {
            sender && sender.set('active', false);
            if (confirm('Are you sure to clean the canvas?')) {
                var comps = editor.DomComponents.clear();
                setTimeout(function () {
                    localStorage.clear()
                }, 0)
            }
        }
    });

    cmdm.add('html-import', {
        run: function (editor, sender) {
            sender && sender.set('active', 0);

            var modalContent = modal.getContentEl();
            var viewer = codeViewer.editor;
            modal.setTitle('Import Template');

            // Init code viewer if not yet instantiated
            if (!viewer) {
                var txtarea = document.createElement('textarea');
                var labelEl = document.createElement('div');
                labelEl.className = pfx + 'import-label';
                labelEl.innerHTML = 'Paste here your HTML/CSS and click Import';
                container.appendChild(labelEl);
                container.appendChild(txtarea);
                container.appendChild(btnImp);
                codeViewer.init(txtarea);
                viewer = codeViewer.editor;
            }

            modal.setContent('');
            modal.setContent(container);
            codeViewer.setContent(
                '<div class="txt-red">Hello world!</div>' +
                '<style>\n.txt-red {color: red;padding: 30px\n}</style>'
            );
            modal.open();
            viewer.refresh();
        }
    });

    /****************** BLOCKS *************************/

    var bm = editor.BlockManager;

    bm.add('quote', {
        label: 'Quote',
        category: 'Basic',
        content: '<blockquote class="quote">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore ipsum dolor sit</blockquote>',
        attributes: {class: 'fa fa-quote-right'}
    });

    /****************** BUTTONS *************************/

    var pnm = editor.Panels;
    pnm.addButton('options', [{
        id: 'undo',
        className: 'fa fa-undo icon-undo',
        command: 'undo',
        attributes: {title: 'Undo (CTRL/CMD + Z)'}
    }, {
        id: 'redo',
        className: 'fa fa-repeat icon-redo',
        command: 'redo',
        attributes: {title: 'Redo (CTRL/CMD + SHIFT + Z)'}
    }, {
        id: 'import',
        className: 'fa fa-download',
        command: 'html-import',
        attributes: {title: 'Import'}
    }, {
        id: 'clean-all',
        className: 'fa fa-trash icon-blank',
        command: 'clean-all',
        attributes: {title: 'Empty canvas'}
    }]);

    // Add devices buttons
    // var panelDevices = pnm.addPanel({id: 'devices-c'});
    // var deviceBtns = panelDevices.get('buttons');
    // deviceBtns.add([{
    //     id: 'deviceDesktop',
    //     command: 'set-device-desktop',
    //     className: 'fa fa-desktop',
    //     attributes: {'title': 'Desktop'},
    //     active: 1,
    // }, {
    //     id: 'deviceTablet',
    //     command: 'set-device-tablet',
    //     className: 'fa fa-tablet',
    //     attributes: {'title': 'Tablet'},
    // }, {
    //     id: 'deviceMobile',
    //     command: 'set-device-mobile',
    //     className: 'fa fa-mobile',
    //     attributes: {'title': 'Mobile'},
    // }]);
    // updateTooltip(deviceBtns);
    updateTooltip(pnm.getPanel('options').get('buttons'));

    /****************** RichTextEditor *************************/

    const rte = editor.RichTextEditor;
    rte.add('span', {
        icon: 'Span',
        result: rte => rte.insertHTML(`<span data-gjs-type='span'>${rte.selection()}</span>`)
    });
    rte.add('dropcap',
{
    icon: '',
    attributes: {title: 'Dropcap'},
    result: rte =>
    {
        var component = editor.getSelected();
        
        if(component.is('text') && component.getClasses().includes('dropCaps'))
        {
            component.replaceWith(`${component.get('content')}`);
        }
        else
        {
            var range = rte.selection().getRangeAt(0);
            
            var container = range.commonAncestorContainer;
            
            if (container.nodeType == 3)
                container = container.parentNode;
            
            if(container.nodeName == "SPAN" && container.classList.contains('dropCaps'))
            {
                var parent = container.parentNode;
                var content = document.createTextNode(container.innerHTML);
                
                // insert all our children before ourselves.
                parent.insertBefore(content, container);
                
                parent.removeChild(container);
            }
            else
            {
                rte.insertHTML(`<span class="dropCaps">${rte.selection()}</span>`);
            }
        }
  }
});

    rte.add('superscript',
    {
    icon: '<b>S<sup>s</sup></b>',
    attributes: {title: 'Superscript'},
    result: rte => rte.exec('superscript')
    });

    rte.add('subscript',
    {
    icon: '<b>S<sub>s</sub></b>',
    attributes: {title: 'Subscript'},
    result: rte => rte.exec('subscript')
    });
    rte.remove('link');
    rte.add('link',
    {
        icon: '<i class="fa fa-link"></i>',
        attributes: {title: 'Link'},
        result: rte =>
        {
            var component = editor.getSelected();
            
            if(component.is('link'))
            {
                component.replaceWith(`${component.get('content')}`);
            }
            else
            {
                var range = rte.selection().getRangeAt(0);
                
                var container = range.commonAncestorContainer;
                if (container.nodeType == 3)
                    container = container.parentNode;
                
                if(container.nodeName === "A")
                {
                    var sel = rte.selection();
                    sel.removeAllRanges();
                    range = document.createRange();
                    range.selectNodeContents(container);
                    sel.addRange(range);
                    rte.exec('unlink');
                }
                else
                {
                    var url = window.prompt('Enter the URL to link to:');
                    if (url)
                        rte.insertHTML(`<a class="link" href="${url}">${rte.selection()}</a>`);
                }
            }
    }
    });

    rte.add('indent',
    {
    icon: '&#8594;',
    attributes: {title: 'Indent'},
    result: rte => rte.exec('indent')
    });

    rte.add('outdent',
    {
    icon: '&#8592;',
    attributes: {title: 'Outdent'},
    result: rte => rte.exec('outdent')
    });

    rte.add('orderedList',
    {
    icon: '1.',
    attributes: {title: 'Ordered List'},
    result: rte => rte.exec('insertOrderedList')
    });

    rte.add('unorderedList',
    {
    icon: '&#8226;',
    attributes: {title: 'Unordered List'},
    result: rte => rte.exec('insertUnorderedList')
    });


    /****************** EVENTS *************************/

    // On component change show the Style Manager
    editor.on('change:selectedComponent', function () {
        var openLayersBtn = editor.Panels.getButton('views', 'open-layers');

        // Don't switch when the Layer Manager is on or
        // there is no selected component
        if ((!openLayersBtn || !openLayersBtn.get('active')) &&
            editor.editor.get('selectedComponent')) {
            var openSmBtn = editor.Panels.getButton('views', 'open-sm');
            openSmBtn && openSmBtn.set('active', 1);
        }
    });

});
