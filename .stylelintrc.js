module.exports = {
  extends: ["stylelint-config-standard",
  "stylelint-config-rational-order"],
  plugins: ["stylelint-order", "stylelint-scss"],
  rules: {
    "declaration-empty-line-before": null,
    "at-rule-no-unknown": null,
    "scss/at-rule-no-unknown": true,
    //'order/properties-order': [[], { severity: 'warning' }],
    //'plugin/rational-order': [
    //  true,
      //{
      //  'border-in-box-model': false,
      //  'empty-line-between-groups': false,
      //  severity: 'warning',
      //},
    //],
  }
};