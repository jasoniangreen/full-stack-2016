'use strict';

var ajv = new Ajv({ passContext: true });

ajv.addKeyword('processText', { type: 'object', schema: false, validate: processItem('p') });
ajv.addKeyword('processInput', { type: 'object', schema: false, validate: processItem('input', 'text') });
ajv.addKeyword('processCheckbox', { type: 'object', schema: false, validate: processItem('input', 'checkbox') });
ajv.addKeyword('processGroup', { type: 'object', schema: false, validate: processGroup });
ajv.addKeyword('closeGroup', { type: 'object', schema: false, validate: closeGroup });

var buildFunc = ajv.compile(getSchema());

function getSchema() {
    return {
        "allOf": [
            {
                "properties": {
                    "itemType": { "enum": [ "group" ] }
                },
                "required": ["itemType"]
            },
            { "processGroup": true },
            {
                "type": "object",
                "properties": {
                    "formItems": {
                        "type": "array",
                        "items": {
                            "anyOf": [ // once one succeeds, it will stop for that array item (we dont want to do input then radio)
                                {
                                    "allOf": [ //all of allows us to control the order of processing
                                        {
                                            "properties": {
                                                "itemType": { "enum": [ "text" ] }
                                            },
                                            "required": ["itemType"]
                                        },
                                        { "processText": true }
                                    ]
                                },
                                {
                                    "allOf": [ //all of allows us to control the order of processing
                                        {
                                            "properties": {
                                                "itemType": { "enum": [ "input" ] }
                                            },
                                            "required": ["itemType"]
                                        },
                                        { "processInput": true }
                                    ]
                                },
                                {
                                    "allOf": [ //all of allows us to control the order of processing
                                        {
                                            "properties": {
                                                "itemType": { "enum": [ "checkbox" ] }
                                            },
                                            "required": ["itemType"]
                                        },
                                        { "processCheckbox": true }
                                    ]
                                },
                                { "$ref": "#" }
                            ]
                        }
                    }
                }
            },
            { "closeGroup": true }
        ]
    };
}



function processGroup(data) { //... path, parent, index
    var newEl = document.createElement('div');
    this.el = this.el || newEl;
    this.current && this.current.appendChild(newEl);
    this.current = newEl;
    var classList = newEl.classList;
    if (data.css) classList.add.apply(classList, data.css.split(' '));
    return true;
}

function closeGroup() {
    this.current = this.current.parentNode;
    return true;
}

function processItem(tag, type) {
    return function (data) {
        var newEl = document.createElement(tag);
        if (type) newEl.setAttribute('type', type);
        if (data.name) newEl.setAttribute('name', data.name);
        if (data.label) newEl.innerHTML = data.label;
        var classList = newEl.classList;
        if (data.css) classList.add.apply(classList, data.css.split(' '));
        if (data.listeners) 
            data.listeners.forEach(function (l) {
                newEl.addEventListener(l.event, l.subscriber);
            });
        this.current.appendChild(newEl);
        return true;
    }
}

function buildForm(el, formDef) {
    var context = {};
    var success = buildFunc.call(context, formDef);
    if (success)
        el.appendChild(context.el);
    else
        console.log('Error in schema!');
    return context;
}

