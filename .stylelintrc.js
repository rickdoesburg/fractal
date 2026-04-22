module.exports = {
    extends: ['stylelint-config-standard-scss'],
    plugins: ['stylelint-prettier'],
    rules: {
        'prettier/prettier': true,
        'no-descending-specificity': null,
        'font-family-no-missing-generic-family-keyword': null,
        'property-no-deprecated': null, // Allow deprecated clip property for screen readers
        'selector-class-pattern': null, // Allow BEM-style class names
        'scss/at-mixin-pattern': null, // Allow camelCase mixin names
        'scss/operator-no-unspaced': null, // Allow compact math expressions
        'scss/load-no-partial-leading-underscore': null, // Allow _file imports
    },
};
