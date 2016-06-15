  angular
    .module('savor.review', ['ngMaterial', 'ngMessages', 'material.svgAssetsCache'])
    .directive('review', review);

    function review() {
    return {
      templateUrl: '/views/components/review/review.tpl.html',
      controller: reviewController,
      controllerAs: 'review'
    };
  }
