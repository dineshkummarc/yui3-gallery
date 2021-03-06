/**
 * @class ChoiceField
 * @extends FormField
 * @param config {Object} Configuration object
 * @constructor
 * @description A form field which allows one or multiple values from a 
 * selection of choices
 */
Y.ChoiceField = Y.Base.create('choice-field', Y.FormField, [Y.WidgetParent, Y.WidgetChild], {

    LABEL_TEMPLATE: '<span></span>',
    SINGLE_CHOICE: Y.RadioField,
    MULTI_CHOICE: Y.CheckboxField,

    /**
     * @method _validateChoices
     * @protected
     * @param {Object} val
     * @description Validates the value passe to the choices attribute
     */
    _validateChoices: function(val) {
        if (!Y.Lang.isArray(val)) {
            Y.log('Choice values must be in an array');
            return false;
        }

        var i = 0,
        len = val.length;

        for (; i < len; i++) {
            if (!Y.Lang.isObject(val[i])) {
                Y.log('Choice that is not an object cannot be used');
                delete val[i];
                continue;
            }
            if (!val[i].label ||
            !Y.Lang.isString(val[i].label) ||
            !val[i].value ||
            !Y.Lang.isString(val[i].value)) {
                Y.log('Choice without label and value cannot be used');
                delete val[i];
                continue;
            }
        }

        if (val.length === 0) {
            return false;
        }

        return true;
    },

    _renderFieldNode: function() {
        var contentBox = this.get('contentBox'),
            parent = contentBox.one("." + this.FIELD_CLASS),
            choices = this.get('choices'),
            multiple = this.get('multi'),
            fieldType = (multiple === true ? this.MULTI_CHOICE: this.SINGLE_CHOICE);

        if (!parent) {
            parent = contentBox;
        }
        Y.Array.each(choices,
        function(c, i, a) {
            var cfg = {
                value: c.value,
                id: (this.get('id') + '_choice' + i),
                name: this.get('name'),
                label: c.label
            },
            field = new fieldType(cfg);

            field.render(parent);
        }, this);
        this._fieldNode = parent.all('input');
    },

    _syncFieldNode: function() {
        var choices = this.get('value').split(',');

        if (choices && choices.length > 0) {
            Y.Array.each(choices, function(choice) {
                this._fieldNode.each(function(node, index, list) {
                    if (Y.Lang.trim(node.get('value')) == Y.Lang.trim(choice)) {
                        node.set('checked', true);
                        return true;
                    }
                }, this);
            }, this);
        }
    },

    /**
     * @method _afterChoiceChange
     * @description When the available choices for the choice field change,
     *     the old ones are removed and the new ones are rendered.
     */
    _afterChoicesChange: function(event) {
        var contentBox = this.get("contentBox");
        contentBox.all(".yui3-form-field").remove();
        this._renderFieldNode();
    },

    clear: function() {
        this._fieldNode.each(function(node, index, list) {
            node.set('checked', false);
        },
        this);

        this.set('value', '');
    },

    bindUI: function() {
        this._fieldNode.on('change', Y.bind(function(e) {
            var value = '';
            this._fieldNode.each(function(node, index, list) {
                if (node.get('checked') === true) {
                    if (value.length > 0) {
                        value += ',';
                    }
                    value += node.get('value');
                }
            }, this);
            this.set('value', value);
        },
        this));
        this.after('choicesChange', this._afterChoicesChange);
    }

},
{
    ATTRS: {
        /** 
         * @attribute choices
         * @type Array
         * @description The choices to render into this field
         */
        choices: {
            validator: function(val) {
                return this._validateChoices(val);
            }
        },

        /** 
         * @attribute multi
         * @type Boolean
         * @default false
         * @description Set to true to allow multiple values to be selected
         */
        multi: {
            validator: Y.Lang.isBoolean,
            value: false
        }
    }
});
