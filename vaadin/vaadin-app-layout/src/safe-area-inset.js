import '@polymer/polymer/lib/elements/custom-style.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<custom-style>
  <style>
    /* stylelint-disable length-zero-no-unit */
    /* Use units so that the values can be used in calc() */
    html {
      --safe-area-inset-top: constant(safe-area-inset-top, 0px);
      --safe-area-inset-right: constant(safe-area-inset-right, 0px);
      --safe-area-inset-bottom: constant(safe-area-inset-bottom, 0px);
      --safe-area-inset-left: constant(safe-area-inset-left, 0px);
    }

    @supports (padding-left: env(safe-area-inset-left)) {
      html {
        --safe-area-inset-top: env(safe-area-inset-top, 0px);
        --safe-area-inset-right: env(safe-area-inset-right, 0px);
        --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
        --safe-area-inset-left: env(safe-area-inset-left, 0px);
      }
    }
    /* stylelint-enable */
  </style>
</custom-style>`;

document.head.appendChild($_documentContainer.content);
